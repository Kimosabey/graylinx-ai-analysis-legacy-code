"""15-minute cron job — gap fill + lag block processing.

Mirrors cronScheduler.js runProcessingJob:

  Step 1  fill_data_gaps   — for any slot where raw data exists but
                             normalized is missing, process it now.
  Step 2  lag block        — process three 5-min slots from 15-30 min
                             ago; that window guarantees complete raw data.

ON DUPLICATE KEY UPDATE makes the overlap between these two steps safe.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any

from calculator.raw_fetcher import find_latest_primary_raw_time
from db.pool import fetch_one
from processor.device_processor import process_device
from processor.plant_processor import process_plant
from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")

log = get_logger("live-cron")


def _floor_to_interval(d: datetime, interval_minutes: int) -> datetime:
    d = d.replace(second=0, microsecond=0)
    return d.replace(minute=(d.minute // interval_minutes) * interval_minutes)


async def _find_last_normalized_slot(table: str) -> datetime | None:
    try:
        row = await fetch_one(f"SELECT MAX(slot_time) AS t FROM `{table}`")
        return row["t"] if row and row["t"] else None
    except Exception:
        return None


def _get_lag_block(interval_minutes: int, lag_minutes: int = 15) -> list[tuple[datetime, datetime]]:
    """Return [(window_start, window_end), ...] covering lag_minutes of slots ending lag_minutes ago."""
    CRON_INTERVAL = 15

    now = datetime.now().replace(second=0, microsecond=0)
    cron_boundary = now.replace(minute=(now.minute // CRON_INTERVAL) * CRON_INTERVAL)
    block_end = cron_boundary - timedelta(minutes=lag_minutes)
    block_start = block_end - timedelta(minutes=CRON_INTERVAL)

    slots: list[tuple[datetime, datetime]] = []
    cursor = block_start
    slot_td = timedelta(minutes=interval_minutes)
    while cursor < block_end:
        slots.append((cursor, cursor + slot_td))
        cursor += slot_td
    return slots


async def _process_slot(
    site_config: dict[str, Any],
    chiller_devices: list[dict[str, Any]],
    window_start: datetime,
    window_end: datetime,
) -> None:
    devices = site_config["devices"]
    plant = site_config.get("plant")
    interval_minutes = site_config["site"]["interval_minutes"]

    # Process all devices in parallel — each writes its own row
    results = await asyncio.gather(
        *(process_device(d, window_start, window_end, interval_minutes, chiller_devices)
          for d in devices),
        return_exceptions=True,
    )
    device_results = []
    for d, r in zip(devices, results):
        if isinstance(r, BaseException):
            log.error("%s slot error: %s", d["instance"], r)
            device_results.append({
                "instance": d["instance"], "device_type": d["device_type"],
                "isRunning": False, "kw": None, "kwh": None, "tr": None, "trh": None,
            })
        else:
            device_results.append(r)

    if plant:
        any_fresh = any(
            (r.get("isRunning") is not False) or (r.get("kw") is not None)
            for r in device_results
        )
        if any_fresh:
            try:
                await process_plant(plant, device_results, window_start, window_end, interval_minutes)
            except Exception as err:
                log.error("plant slot error: %s", err)
        else:
            log.debug("plant — no fresh data in slot, skipping")


async def _fill_data_gaps(site_config: dict[str, Any], chiller_devices: list[dict[str, Any]]) -> None:
    devices = site_config["devices"]
    interval_minutes = site_config["site"]["interval_minutes"]
    interval_td = timedelta(minutes=interval_minutes)

    log.info("Checking for data gaps...")
    gap_slot_set: set[datetime] = set()

    async def _collect(device: dict[str, Any]) -> None:
        last_slot, latest_raw = await asyncio.gather(
            _find_last_normalized_slot(device["normalized_table"]),
            find_latest_primary_raw_time(device),
        )
        if latest_raw is None or last_slot is None:
            return
        raw_ceiling = _floor_to_interval(latest_raw, interval_minutes)
        cursor = last_slot + interval_td
        while cursor <= raw_ceiling:
            gap_slot_set.add(cursor)
            cursor += interval_td

    await asyncio.gather(*(_collect(d) for d in devices))
    gap_slots = sorted(gap_slot_set)
    if not gap_slots:
        log.info("No data gaps.")
        return

    log.info("Gap fill — %d slots from %s to %s", len(gap_slots), gap_slots[0], gap_slots[-1])
    for slot_end in gap_slots:
        slot_start = slot_end - interval_td
        await _process_slot(site_config, chiller_devices, slot_start, slot_end)
    log.info("✅ Gap fill complete")


async def run_processing_job(site_config: dict[str, Any]) -> None:
    """One full cron run: gap fill, then the lag block."""
    devices = site_config["devices"]
    site = site_config["site"]
    interval_minutes = site["interval_minutes"]
    lag_minutes = site.get("lag_minutes", 15)
    chiller_devices = [d for d in devices if d.get("device_type") == "chiller"]

    log.info("=" * 50)
    log.info("Cron — site=%s", site["site_name"])

    await _fill_data_gaps(site_config, chiller_devices)

    slots = _get_lag_block(interval_minutes, lag_minutes)
    log.info("Lag block — %d slots", len(slots))
    for window_start, window_end in slots:
        await _process_slot(site_config, chiller_devices, window_start, window_end)
        log.info("slot done: %s", window_end)

    log.info("✅ Cron run complete")
