"""Energy rollup — hourly, daily, weekly aggregates.

Mirrors energyRollup.js. Each tier reads the one below:
  normalized.kwh  → energy_hourly_analytics  (SUM per hour)
  hourly.kwh      → energy_daily_analytics   (SUM per day)
  daily.kwh       → energy_weekly_analytics  (SUM per ISO week)

SUM replaces the earlier MAX(cumulative)-MIN(cumulative) approach because
MAX-MIN misses kWh across mid-period OFF→ON cycles.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Any

from db.pool import execute, fetch_one
from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")


log = get_logger("rollup")


CREATE_HOURLY = """
CREATE TABLE IF NOT EXISTS energy_hourly_analytics (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type VARCHAR(36)   NOT NULL,
  device_id   VARCHAR(50)   NOT NULL,
  device_name VARCHAR(150)  NOT NULL,
  hour_start  DATETIME      NOT NULL,
  energy_kwh  DECIMAL(15,4) NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_hour (device_type, device_id, hour_start)
)
"""

CREATE_DAILY = """
CREATE TABLE IF NOT EXISTS energy_daily_analytics (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type VARCHAR(36)   NOT NULL,
  device_id   VARCHAR(50)   NOT NULL,
  device_name VARCHAR(150)  NOT NULL,
  day_date    DATE          NOT NULL,
  energy_kwh  DECIMAL(15,4) NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_day (device_type, device_id, day_date)
)
"""

CREATE_WEEKLY = """
CREATE TABLE IF NOT EXISTS energy_weekly_analytics (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type VARCHAR(36)   NOT NULL,
  device_id   VARCHAR(50)   NOT NULL,
  device_name VARCHAR(150)  NOT NULL,
  week_start  DATE          NOT NULL,
  week_label  VARCHAR(10)   NOT NULL,
  energy_kwh  DECIMAL(15,4) NOT NULL,
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_week (device_type, device_id, week_start)
)
"""


# ── Helpers ────────────────────────────────────────────────────────────────────

def _previous_hour_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now()
    return (now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=1))


def _yesterday(now: datetime | None = None) -> date:
    now = now or datetime.now()
    return (now - timedelta(days=1)).date()


def _previous_week_monday(now: datetime | None = None) -> date:
    now = now or datetime.now()
    today = now.date()
    this_mon = today - timedelta(days=today.weekday())
    return this_mon - timedelta(days=7)


def _week_label(d: date) -> str:
    _, iso_week, _ = d.isocalendar()
    return f"WEEK_{iso_week:02d}"


# ── Hourly ────────────────────────────────────────────────────────────────────

async def _run_hourly_for_device(device: dict[str, Any], hour_start: datetime) -> None:
    hour_end = hour_start + timedelta(hours=1)
    row = await fetch_one(
        f"SELECT SUM(kwh) AS total FROM `{device['normalized_table']}` "
        f"WHERE slot_time >= %s AND slot_time < %s",
        (hour_start, hour_end),
    )
    if not row or row["total"] is None:
        return
    energy_kwh = max(0.0, float(row["total"]))

    await execute(
        "INSERT INTO energy_hourly_analytics "
        "  (device_type, device_id, device_name, hour_start, energy_kwh) "
        "VALUES (%s, %s, %s, %s, %s) "
        "ON DUPLICATE KEY UPDATE energy_kwh = VALUES(energy_kwh), device_name = VALUES(device_name)",
        (device["device_type"], device["instance"], device["instance"], hour_start, energy_kwh),
    )


async def _backfill_hourly(device: dict[str, Any]) -> None:
    row = await fetch_one(
        f"SELECT MIN(slot_time) AS t, MAX(slot_time) AS m FROM `{device['normalized_table']}`"
    )
    if not row or row["t"] is None:
        return
    earliest: datetime = row["t"]
    latest: datetime = row["m"]

    last = await fetch_one(
        "SELECT MAX(hour_start) AS t FROM energy_hourly_analytics WHERE device_id = %s",
        (device["instance"],),
    )
    if last and last["t"]:
        cursor: datetime = last["t"] + timedelta(hours=1)
    else:
        cursor = earliest.replace(minute=0, second=0, microsecond=0)

    end_hour = latest.replace(minute=0, second=0, microsecond=0)
    processed = 0
    while cursor <= end_hour:
        await _run_hourly_for_device(device, cursor)
        cursor += timedelta(hours=1)
        processed += 1

    if processed:
        log.info("Hourly backfilled %d hours for %s", processed, device["instance"])


# ── Daily ─────────────────────────────────────────────────────────────────────

async def _run_daily(devices: list[dict[str, Any]], day: date) -> None:
    log.info("Daily rollup %s", day)
    for device in devices:
        row = await fetch_one(
            "SELECT SUM(energy_kwh) AS total FROM energy_hourly_analytics "
            "WHERE device_id = %s AND DATE(hour_start) = %s",
            (device["instance"], day),
        )
        if not row or row["total"] is None:
            continue
        await execute(
            "INSERT INTO energy_daily_analytics "
            "  (device_type, device_id, device_name, day_date, energy_kwh) "
            "VALUES (%s, %s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE energy_kwh = VALUES(energy_kwh), device_name = VALUES(device_name)",
            (device["device_type"], device["instance"], device["instance"], day, float(row["total"])),
        )


async def _backfill_daily(devices: list[dict[str, Any]]) -> None:
    row = await fetch_one("SELECT DATE(MIN(hour_start)) AS t FROM energy_hourly_analytics")
    if not row or row["t"] is None:
        return
    earliest: date = row["t"]

    last = await fetch_one("SELECT MAX(day_date) AS t FROM energy_daily_analytics")
    start: date = last["t"] + timedelta(days=1) if last and last["t"] else earliest
    end = _yesterday()

    cursor = start
    while cursor <= end:
        await _run_daily(devices, cursor)
        cursor += timedelta(days=1)


# ── Weekly ────────────────────────────────────────────────────────────────────

async def _run_weekly(devices: list[dict[str, Any]], week_start: date) -> None:
    week_end = week_start + timedelta(days=6)
    label = _week_label(week_start)
    log.info("Weekly rollup %s → %s (%s)", week_start, week_end, label)
    for device in devices:
        row = await fetch_one(
            "SELECT SUM(energy_kwh) AS total FROM energy_daily_analytics "
            "WHERE device_id = %s AND day_date BETWEEN %s AND %s",
            (device["instance"], week_start, week_end),
        )
        if not row or row["total"] is None:
            continue
        await execute(
            "INSERT INTO energy_weekly_analytics "
            "  (device_type, device_id, device_name, week_start, week_label, energy_kwh) "
            "VALUES (%s, %s, %s, %s, %s, %s) "
            "ON DUPLICATE KEY UPDATE energy_kwh = VALUES(energy_kwh), "
            "                        device_name = VALUES(device_name), "
            "                        week_label  = VALUES(week_label)",
            (device["device_type"], device["instance"], device["instance"],
             week_start, label, float(row["total"])),
        )


async def _backfill_weekly(devices: list[dict[str, Any]]) -> None:
    row = await fetch_one("SELECT MIN(day_date) AS t FROM energy_daily_analytics")
    if not row or row["t"] is None:
        return
    earliest: date = row["t"]
    mon_of_earliest = earliest - timedelta(days=earliest.weekday())

    last = await fetch_one("SELECT MAX(week_start) AS t FROM energy_weekly_analytics")
    start: date = last["t"] + timedelta(days=7) if last and last["t"] else mon_of_earliest
    end = _previous_week_monday()

    cursor = start
    while cursor <= end:
        await _run_weekly(devices, cursor)
        cursor += timedelta(days=7)


# ── Public API ────────────────────────────────────────────────────────────────

async def init_energy_rollup(site_config: dict[str, Any]) -> None:
    devices = site_config["devices"]
    await execute(CREATE_HOURLY)
    await execute(CREATE_DAILY)
    await execute(CREATE_WEEKLY)
    log.info("Rollup tables ready.")

    log.info("Starting rollup backfill...")
    for d in devices:
        await _backfill_hourly(d)
    await _backfill_daily(devices)
    await _backfill_weekly(devices)
    log.info("Rollup backfill complete.")


async def hourly_job(site_config: dict[str, Any]) -> None:
    hour_start = _previous_hour_start()
    for d in site_config["devices"]:
        try:
            await _run_hourly_for_device(d, hour_start)
        except Exception as err:
            log.error("hourly %s failed: %s", d["instance"], err)


async def daily_job(site_config: dict[str, Any]) -> None:
    try:
        await _run_daily(site_config["devices"], _yesterday())
    except Exception as err:
        log.error("daily failed: %s", err)


async def weekly_job(site_config: dict[str, Any]) -> None:
    try:
        await _run_weekly(site_config["devices"], _previous_week_monday())
    except Exception as err:
        log.error("weekly failed: %s", err)
