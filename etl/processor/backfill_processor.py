"""High-speed bulk backfill.

Strategy that destroys the Node.js 3-4 hour wall time:

  1. For each device, fetch ALL raw readings for EVERY param in the entire
     backfill range in ONE query per (table, param_id). Result is a sorted
     in-memory BulkReadings object.

  2. Walk slots sequentially. For each slot, slice the in-memory lists
     via bisect — O(log N) per param per slot, zero DB round-trips.

  3. Maintain cumulative_* counters in memory; no fetch_last_cumulative
     query per slot.

  4. Accumulate 500-row batches and upsert with `INSERT ... VALUES (...),
     (...), ... ON DUPLICATE KEY UPDATE col=VALUES(col)`. One batch round
     -trip replaces 500 individual inserts.

  5. Devices run in parallel via asyncio.gather, bounded by a semaphore
     to stay within pool limits.

Resulting speedup: typically 50-200x over row-at-a-time Node.js, depending
on slot count and param fanout.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any

from calculator.chiller_performance import compute_chiller_performance
from calculator.formula import evaluate_formula
from calculator.raw_fetcher import (
    BulkReadings,
    bulk_fetch_param_range,
    find_latest_primary_raw_time,
    safe_float,
)
from calculator.weighted_average import weighted_average
from db.pool import fetch_all, fetch_one
from db.upsert import BatchUpserter
from processor.plant_processor import process_plant
from utils.config import load_runtime_config
from utils.logging_setup import get_logger

log = get_logger("backfill")


# ─────────────────────────────────────────────────────────────────────────────
# Time helpers
# ─────────────────────────────────────────────────────────────────────────────

def floor_to_interval(d: datetime, interval_minutes: int) -> datetime:
    d = d.replace(second=0, microsecond=0)
    return d.replace(minute=(d.minute // interval_minutes) * interval_minutes)


async def _find_earliest_raw_time(device: dict[str, Any]) -> datetime | None:
    tables = set()
    if device.get("device_table"):
        tables.add(device["device_table"])
    if device.get("energy_table"):
        tables.add(device["energy_table"])
    for p in device.get("direct_params") or []:
        if p.get("table"):
            tables.add(p["table"])

    earliest: datetime | None = None
    for t in tables:
        try:
            row = await fetch_one(f"SELECT MIN(measured_time) AS t FROM `{t}`")
            if row and row["t"]:
                if earliest is None or row["t"] < earliest:
                    earliest = row["t"]
        except Exception:
            pass
    return earliest


async def _find_last_normalized_slot(table: str) -> datetime | None:
    try:
        row = await fetch_one(f"SELECT MAX(slot_time) AS t FROM `{table}`")
        return row["t"] if row and row["t"] else None
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────────────────────
# Bulk-prefetch helpers — one query per (table, param_id)
# ─────────────────────────────────────────────────────────────────────────────

def _resolve_table(param: dict[str, Any], device: dict[str, Any]) -> str:
    if param.get("table"):
        return param["table"]
    return device["energy_table"] if param.get("source") == "energy" else device["device_table"]


async def _prefetch_device_params(
    device: dict[str, Any], start: datetime, end: datetime,
) -> dict[str, BulkReadings]:
    """Return {normalized_column: BulkReadings} for every fetchable param.

    Special keys:
      '__run_status_main__'  — the device's primary run-status stream
      '__run_status_{i}__'   — any additional run_status_any streams
      'sub_rs_<col>'         — per-sub_param run status stream
    """
    tasks: dict[str, Any] = {}

    # other_params (incl. kw)
    for p in device.get("other_params") or []:
        table = _resolve_table(p, device)
        tasks[p["normalized_column"]] = bulk_fetch_param_range(
            table, p["param_id"], start, end,
        )

    # direct_params (nearest-neighbour lookup is per-slot; bulk-prefetch anyway)
    for p in device.get("direct_params") or []:
        if p.get("table"):
            tasks[p["normalized_column"]] = bulk_fetch_param_range(
                p["table"], p["param_id"], start, end,
            )

    # sub_params weighted-avg source
    for p in device.get("sub_params") or []:
        if p.get("param_id"):
            table = _resolve_table(p, device)
            tasks[p["normalized_column"]] = bulk_fetch_param_range(
                table, p["param_id"], start, end,
            )

    # Run status — primary or run_status_any list
    if device.get("check_run_status", True):
        if device.get("run_status_any"):
            for i, rs in enumerate(device["run_status_any"]):
                tasks[f"__run_status_{i}__"] = bulk_fetch_param_range(
                    rs["table"], rs["param_id"], start, end,
                )
        else:
            rs = device["run_status"]
            tasks["__run_status_main__"] = bulk_fetch_param_range(
                device["device_table"], rs["param_id"], start, end,
            )

    # Sub-param run statuses
    for p in device.get("sub_params") or []:
        rs = p.get("run_status")
        if rs:
            key = f"sub_rs_{p['normalized_column']}"
            tasks[key] = bulk_fetch_param_range(
                rs["table"], rs["param_id"], start, end,
            )

    keys = list(tasks.keys())
    results = await asyncio.gather(*tasks.values())
    return dict(zip(keys, results))


# ─────────────────────────────────────────────────────────────────────────────
# Per-device bulk backfill
# ─────────────────────────────────────────────────────────────────────────────

async def _backfill_device(
    device: dict[str, Any], interval_minutes: int, chiller_devices: list[dict[str, Any]],
    semaphore: asyncio.Semaphore, backfill_start: datetime | None = None,
    global_window_end: datetime | None = None,
) -> None:
    async with semaphore:
        await _backfill_device_inner(device, interval_minutes, chiller_devices,
                                     backfill_start, global_window_end)


async def _backfill_device_inner(
    device: dict[str, Any], interval_minutes: int, chiller_devices: list[dict[str, Any]],
    backfill_start: datetime | None = None, global_window_end: datetime | None = None,
) -> None:
    instance = device["instance"]
    normalized_table = device["normalized_table"]
    interval_ms = interval_minutes * 60 * 1000
    interval_td = timedelta(minutes=interval_minutes)

    cfg = load_runtime_config()
    reprocess_hours = cfg["reprocess_hours"]

    latest_raw = await find_latest_primary_raw_time(device)
    if latest_raw is None:
        log.info("%s — no raw data, skipping", instance)
        return

    device_window_end = floor_to_interval(latest_raw, interval_minutes)
    # Extend to the global end so all devices share a uniform time series.
    # Slots beyond device_window_end will have no bulk readings → written as OFF rows.
    loop_end = max(device_window_end, global_window_end) if global_window_end else device_window_end

    last_slot = await _find_last_normalized_slot(normalized_table)
    earliest = await _find_earliest_raw_time(device)
    if earliest is None:
        log.info("%s — no raw data (earliest), skipping", instance)
        return

    first_expected = floor_to_interval(earliest, interval_minutes) + interval_td
    if backfill_start is not None and backfill_start > first_expected:
        first_expected = backfill_start

    if last_slot is not None:
        reprocess_from = last_slot - timedelta(hours=reprocess_hours)
        start_from = max(reprocess_from, first_expected)
        if backfill_start is not None and backfill_start < start_from:
            start_from = backfill_start
        log.info("%s — resuming from %s (last %dh reprocess)", instance, start_from, reprocess_hours)
    else:
        start_from = first_expected
        log.info("%s — first run, starting from %s", instance, start_from)

    if start_from > loop_end:
        log.info("%s — already up to date", instance)
        return

    total_slots = max(0, int((loop_end - start_from).total_seconds() // (interval_minutes * 60))) + 1
    log.info("%s — backfilling to %s (~%d slots)", instance, loop_end, total_slots)

    # ── Bulk-fetch all raw data for the entire range ─────────────────────────
    bulk_range_start = start_from - interval_td * 2
    bulk_range_end = loop_end + interval_td
    log.info("%s — bulk fetching raw readings...", instance)
    bulk = await _prefetch_device_params(device, bulk_range_start, bulk_range_end)
    log.info("%s — prefetch complete for %d streams", instance, len(bulk))

    # ── Starting cumulative values — fetched ONCE, maintained in-memory ──────
    cumulative_state: dict[str, float] = {}
    for p in device.get("calculated_params") or []:
        col = p["normalized_column"]
        if col.startswith("cumulative_"):
            # Pull the last value strictly BEFORE our start_from window.
            row = await fetch_one(
                f"SELECT `{col}` AS v FROM `{normalized_table}` "
                f"WHERE `{col}` IS NOT NULL AND slot_time < %s "
                f"ORDER BY slot_time DESC LIMIT 1",
                (start_from,),
            )
            cumulative_state[col] = float(row["v"]) if row and row["v"] is not None else 0.0

    # ── Precompute chiller run-status bulk streams for TR formula ────────────
    chiller_rs: dict[str, BulkReadings] = {}
    if device.get("use_chiller_count_in_formula"):
        for ch in chiller_devices:
            t = ch["device_table"]
            pid = ch["run_status"]["param_id"]
            # Skip our own device — already in `bulk`
            if ch["instance"] == instance:
                continue
            chiller_rs[ch["instance"]] = await bulk_fetch_param_range(
                t, pid, bulk_range_start, bulk_range_end,
            )
        # include self too
        if "__run_status_main__" in bulk:
            chiller_rs[instance] = bulk["__run_status_main__"]

    # ── Pre-fetch chiller state for committed_config devices ─────────────────
    # Chillers are written in Phase 1 before non-chillers, so the data exists.
    chiller_state: dict[datetime, dict[str, Any]] = {}
    if device.get("committed_config") and chiller_devices:
        for ch in chiller_devices:
            rows = await fetch_all(
                f"SELECT slot_time, is_running, chiller_load "
                f"FROM `{ch['normalized_table']}` "
                f"WHERE slot_time >= %s AND slot_time <= %s ORDER BY slot_time ASC",
                (start_from, loop_end),
            )
            for r in rows:
                st = r["slot_time"]
                if st not in chiller_state:
                    chiller_state[st] = {"N": 0, "LOAD": 0.0}
                if int(r.get("is_running") or 0) == 1:
                    chiller_state[st]["N"] += 1
                    load = float(r.get("chiller_load") or 0) / 100.0
                    if load > chiller_state[st]["LOAD"]:
                        chiller_state[st]["LOAD"] = load

    # ── Slot loop — 100% in-memory now, batch upsert at the end ──────────────
    upserter = BatchUpserter(normalized_table)
    processed = 0
    skipped = 0
    slot_end = start_from
    warmup_minutes = device.get("warmup_minutes") or 0
    # Log ~20 progress updates per device (min every 200 slots) instead of a
    # fixed 5000 which looks like a freeze on smaller backfills.
    log_every = max(200, total_slots // 20)

    while slot_end <= loop_end:
        slot_start = slot_end - interval_td

        try:
            row = _compute_slot_row(
                device=device,
                slot_start=slot_start,
                slot_end=slot_end,
                interval_minutes=interval_minutes,
                bulk=bulk,
                chiller_rs=chiller_rs,
                chiller_devices=chiller_devices,
                cumulative_state=cumulative_state,
                warmup_minutes=warmup_minutes,
                chiller_state=chiller_state if chiller_state else None,
            )
            upserter.add(row)
            processed += 1
            await upserter.flush_if_full()

            if processed % log_every == 0:
                pct = processed * 100 // max(total_slots, 1)
                log.info("%s — %d/%d slots (%d%%)", instance, processed, total_slots, pct)
        except Exception as err:
            skipped += 1
            log.error("%s slot %s: %s", instance, slot_end, err)

        slot_end += interval_td

    pending = len(upserter._rows)
    if pending:
        log.info("%s — slot loop done, flushing final %d rows...", instance, pending)
    await upserter.flush()
    log.info("%s — ✓ processed=%d skipped=%d (total written=%d)",
             instance, processed, skipped, upserter.total_written)


def _compute_slot_row(
    device: dict[str, Any],
    slot_start: datetime,
    slot_end: datetime,
    interval_minutes: int,
    bulk: dict[str, BulkReadings],
    chiller_rs: dict[str, BulkReadings],
    chiller_devices: list[dict[str, Any]],
    cumulative_state: dict[str, float],
    warmup_minutes: int,
    chiller_state: dict[datetime, dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Build one normalized row from in-memory BulkReadings. No DB calls."""
    ss_id = device["ss_id"]

    # Run-status at slot_end + within-window readings (merged for run_status_any)
    if not device.get("check_run_status", True):
        is_running = True
        rs_readings = []
        active_value = ""
    elif device.get("run_status_any"):
        time_map: dict[datetime, bool] = {}
        any_on_at_end = False
        for i, rs in enumerate(device["run_status_any"]):
            stream = bulk.get(f"__run_status_{i}__")
            if stream is None:
                continue
            if stream.status_at(slot_end, rs["active_value"]):
                any_on_at_end = True
            window = stream.slice_status_for_window(slot_start, slot_end)
            av = str(rs["active_value"]).strip().lower()
            for r in window:
                t = r["measured_time"]
                if t not in time_map:
                    time_map[t] = False
                if str(r["value"]).strip().lower() == av:
                    time_map[t] = True
        is_running = any_on_at_end
        rs_readings = [
            {"measured_time": t, "value": "__ON__" if on else "__OFF__"}
            for t, on in sorted(time_map.items())
        ]
        active_value = "__ON__"
    else:
        rs = device["run_status"]
        stream = bulk.get("__run_status_main__")
        if stream is None:
            is_running = False
            rs_readings = []
            active_value = rs["active_value"]
        else:
            is_running = stream.status_at(slot_end, rs["active_value"])
            rs_readings = stream.slice_status_for_window(slot_start, slot_end)
            active_value = rs["active_value"]

    # OFF path
    if not is_running:
        row: dict[str, Any] = {"ss_id": ss_id, "slot_time": slot_end, "is_running": 0}
        for p in device.get("other_params") or []:
            row[p["normalized_column"]] = 0
        for p in device.get("direct_params") or []:
            if p.get("table"):
                row[p["normalized_column"]] = 0
        for p in device.get("sub_params") or []:
            row[p["normalized_column"]] = 0

        off_ctx: dict[str, Any] = {"interval": interval_minutes, "on_minutes": 0}
        for col, val in row.items():
            off_ctx[col] = val if isinstance(val, (int, float)) else 0

        for p in device.get("calculated_params") or []:
            col = p["normalized_column"]
            if col.startswith("cumulative_"):
                row[col] = cumulative_state.get(col, 0.0)
            else:
                v = evaluate_formula(p["formula"], off_ctx)
                row[col] = v if v is not None else 0
                off_ctx[col] = row[col]

        if device.get("device_type") == "chiller":
            perf = compute_chiller_performance({
                "is_running":        0,
                "kw":                off_ctx.get("kw") or 0,
                "tr":                off_ctx.get("tr") or 0,
                "cond_leaving_temp": off_ctx.get("cond_leaving_temp"),
                "chiller_load":      off_ctx.get("chiller_load"),
            })
            row.update(perf)
            committed_kw = perf.get("committed_kw") or 0
            row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

        if device.get("committed_config") and chiller_state is not None:
            state = chiller_state.get(slot_end, {"N": 0, "LOAD": 0.0})
            N = state["N"]
            LOAD = state["LOAD"]
            constant = device["committed_config"]["constant"]
            use_load = device["committed_config"].get("use_load") is True
            committed_kw = round((LOAD * N * constant if use_load else N * constant) * 10000) / 10000
            row["committed_kw"]  = committed_kw
            row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

        return row

    # ON path — warmup check via run-status streams
    warmup = False
    if warmup_minutes > 0:
        on_t = _last_on_transition_from_bulk(device, bulk, slot_end)
        if on_t is not None:
            elapsed_min = (slot_end - on_t).total_seconds() / 60.0
            warmup = elapsed_min < warmup_minutes

    row = {"ss_id": ss_id, "slot_time": slot_end, "is_running": 2 if warmup else 1}
    ctx: dict[str, Any] = {"interval": interval_minutes}

    # other_params
    for p in device.get("other_params") or []:
        stream = bulk.get(p["normalized_column"])
        if stream is None:
            row[p["normalized_column"]] = 0
            ctx[p["normalized_column"]] = 0
            continue
        filter_zeros = True  # KW + non-KW both filter zeros per Node.js
        readings = stream.slice_for_window(slot_start, slot_end, filter_zeros=filter_zeros)
        if p.get("is_kw"):
            # Defensively ABS KW readings — some BMS tables sporadically hold
            # non-numeric values ('active' strings, etc). Skip those rather
            # than crash the slot.
            safe = []
            for r in readings:
                f = safe_float(r["value"])
                if f is None:
                    continue
                safe.append({**r, "value": str(abs(f))})
            readings = safe
        avg, _ = weighted_average(readings, slot_start, slot_end, rs_readings, active_value)

        if avg is not None and ("valid_min" in p or "valid_max" in p):
            below = "valid_min" in p and avg < p["valid_min"]
            above = "valid_max" in p and avg > p["valid_max"]
            if below or above:
                # Carry-forward from the most recent accepted value in cumulative state
                avg = cumulative_state.get(p["normalized_column"], 0.0)

        v = avg if avg is not None else 0
        row[p["normalized_column"]] = v
        ctx[p["normalized_column"]] = v

    ctx["on_minutes"] = interval_minutes

    if device.get("use_chiller_count_in_formula") and chiller_devices:
        count = 0
        for ch in chiller_devices:
            stream = chiller_rs.get(ch["instance"])
            if stream is None:
                continue
            if stream.status_at(slot_end, ch["run_status"]["active_value"]):
                count += 1
        ctx["chillers_running"] = count if count > 0 else 1

    # direct_params — nearest-neighbour from bulk
    for p in device.get("direct_params") or []:
        if not p.get("table"):
            continue
        stream = bulk.get(p["normalized_column"])
        val: float | None = None
        if stream is not None:
            before_v = stream.last_value_at_or_before(slot_end)
            after_v = stream.first_value_after(slot_end)
            if before_v is not None and after_v is not None:
                from bisect import bisect_right
                idx = bisect_right(stream.times, slot_end) - 1
                before_t = stream.times[idx] if idx >= 0 else None
                after_t = after_v[0]
                if before_t is not None:
                    db = abs((before_t - slot_end).total_seconds())
                    da = abs((after_t - slot_end).total_seconds())
                    val = safe_float(before_v) if db <= da else safe_float(after_v[1])
                else:
                    val = safe_float(after_v[1])
            elif before_v is not None:
                val = safe_float(before_v)
            elif after_v is not None:
                val = safe_float(after_v[1])
        row[p["normalized_column"]] = val if val is not None else 0
        ctx[p["normalized_column"]] = val if val is not None else 0

    # sub_params Mode 1 — weighted avg with its own run status
    for p in device.get("sub_params") or []:
        if not p.get("param_id"):
            continue
        rs = p["run_status"]
        sub_rs_stream = bulk.get(f"sub_rs_{p['normalized_column']}")
        sub_rs = sub_rs_stream.slice_status_for_window(slot_start, slot_end) if sub_rs_stream else []

        src_stream = bulk.get(p["normalized_column"])
        if src_stream is None:
            v = 0
        else:
            readings = src_stream.slice_for_window(slot_start, slot_end, filter_zeros=True)
            if p.get("is_kw"):
                safe = []
                for r in readings:
                    f = safe_float(r["value"])
                    if f is None:
                        continue
                    safe.append({**r, "value": str(abs(f))})
                readings = safe
            avg, _ = weighted_average(readings, slot_start, slot_end, sub_rs, rs["active_value"])
            v = avg if avg is not None else 0
        row[p["normalized_column"]] = v
        ctx[p["normalized_column"]] = v

    # calculated_params — cumulatives tracked in-memory
    for p in device.get("calculated_params") or []:
        col = p["normalized_column"]
        if col.startswith("cumulative_"):
            prev = cumulative_state.get(col, 0.0)
            ctx[f"prev_{col}"] = prev
            v = evaluate_formula(p["formula"], ctx)
            v_num = v if v is not None else prev
            row[col] = v_num
            ctx[col] = v_num
            cumulative_state[col] = float(v_num)
        else:
            v = evaluate_formula(p["formula"], ctx)
            row[col] = v if v is not None else 0
            ctx[col] = row[col]

    # sub_params Mode 2 — formula with own on_minutes
    for p in device.get("sub_params") or []:
        if p.get("param_id"):
            continue
        rs = p["run_status"]
        sub_rs_stream = bulk.get(f"sub_rs_{p['normalized_column']}")
        sub_rs = sub_rs_stream.slice_status_for_window(slot_start, slot_end) if sub_rs_stream else []
        sub_on_ms = _on_duration_ms(sub_rs, slot_start, slot_end, rs["active_value"], interval_minutes)
        sub_ctx = dict(ctx)
        sub_ctx["on_minutes"] = round(sub_on_ms / 60000 * 10000) / 10000
        v = evaluate_formula(p["formula"], sub_ctx)
        row[p["normalized_column"]] = v if v is not None else 0
        ctx[p["normalized_column"]] = row[p["normalized_column"]]

    # Chiller performance (chiller devices only)
    if device.get("device_type") == "chiller":
        perf = compute_chiller_performance({
            "is_running":        row["is_running"],
            "kw":                ctx.get("kw")               or 0,
            "tr":                ctx.get("tr")               or 0,
            "cond_leaving_temp": ctx.get("cond_leaving_temp"),
            "chiller_load":      ctx.get("chiller_load"),
        })
        row.update(perf)
        committed_kw = perf.get("committed_kw") or 0
        row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

    # Committed kW for pumps / cooling towers
    if device.get("committed_config") and chiller_state is not None:
        state = chiller_state.get(slot_end, {"N": 0, "LOAD": 0.0})
        N = state["N"]
        LOAD = state["LOAD"]
        constant = device["committed_config"]["constant"]
        use_load = device["committed_config"].get("use_load") is True
        committed_kw = round((LOAD * N * constant if use_load else N * constant) * 10000) / 10000
        row["committed_kw"]  = committed_kw
        row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

    return row


def _last_on_transition_from_bulk(
    device: dict[str, Any], bulk: dict[str, BulkReadings], window_end: datetime,
) -> datetime | None:
    """Scan the device's run_status stream backward to find the most recent OFF→ON."""
    streams: list[tuple[BulkReadings, str]] = []
    if device.get("run_status_any"):
        for i, rs in enumerate(device["run_status_any"]):
            s = bulk.get(f"__run_status_{i}__")
            if s:
                streams.append((s, str(rs["active_value"]).strip().lower()))
    else:
        s = bulk.get("__run_status_main__")
        if s:
            streams.append((s, str(device["run_status"]["active_value"]).strip().lower()))

    if not streams:
        return None

    earliest: datetime | None = None
    for stream, av in streams:
        from bisect import bisect_right
        hi = bisect_right(stream.times, window_end)
        # scan backwards, find the OFF→ON edge
        last_on_t: datetime | None = None
        for idx in range(hi - 1, max(-1, hi - 201), -1):
            v_on = str(stream.values[idx]).strip().lower() == av
            if not v_on:
                break
            last_on_t = stream.times[idx]
        if last_on_t is not None and (earliest is None or last_on_t < earliest):
            earliest = last_on_t
    return earliest


def _on_duration_ms(status_readings, window_start, window_end, active_value, interval_minutes) -> float:
    if not status_readings:
        return 0
    window_ms = interval_minutes * 60 * 1000
    sorted_rs = sorted(status_readings, key=lambda r: r["measured_time"])
    av = str(active_value).strip().lower()
    on_ms = 0.0
    for i, r in enumerate(sorted_rs):
        seg_start = max(r["measured_time"], window_start)
        if i + 1 < len(sorted_rs):
            seg_end = min(sorted_rs[i + 1]["measured_time"], window_end)
        else:
            seg_end = window_end
        if str(r["value"]).strip().lower() == av and seg_end > seg_start:
            on_ms += (seg_end - seg_start).total_seconds() * 1000
    return min(on_ms, window_ms)


# ─────────────────────────────────────────────────────────────────────────────
# Plant backfill — bulk prefetch + in-memory cumulatives + batch upsert
# ─────────────────────────────────────────────────────────────────────────────

async def _fetch_plant_cumulative_seed(
    table: str, column: str, before_time: datetime,
) -> float:
    row = await fetch_one(
        f"SELECT `{column}` AS v FROM `{table}` "
        f"WHERE `{column}` IS NOT NULL AND slot_time < %s "
        f"ORDER BY slot_time DESC LIMIT 1",
        (before_time,),
    )
    if not row or row["v"] is None:
        return 0.0
    try:
        return float(row["v"])
    except (TypeError, ValueError):
        return 0.0


def _r4(v: float) -> float:
    return round(v * 10000) / 10000


async def _backfill_plant(site_config: dict[str, Any], now: datetime,
                          backfill_start: datetime | None = None) -> None:
    plant = site_config.get("plant")
    if not plant:
        return
    devices = site_config["devices"]
    interval_minutes = site_config["site"]["interval_minutes"]
    interval_td = timedelta(minutes=interval_minutes)
    cfg = load_runtime_config()
    safe_intervals = cfg["plant_safe_intervals"]

    safe_ceiling = now - timedelta(minutes=interval_minutes * safe_intervals)
    table = plant["normalized_table"]
    last_plant_slot = await _find_last_normalized_slot(table)
    reprocess_from = (last_plant_slot - timedelta(hours=cfg["reprocess_hours"])
                      if last_plant_slot else None)
    if backfill_start is not None:
        reprocess_from = max(reprocess_from, backfill_start) if reprocess_from else backfill_start

    log.info("Plant — safe ceiling: %s", safe_ceiling)
    if reprocess_from:
        log.info("Plant — reprocess from: %s (last %dh)", reprocess_from, cfg["reprocess_hours"])

    # ── 1. BULK fetch every device's rows in ONE query per device ────────────
    async def _fetch_dev(device: dict[str, Any]) -> tuple[dict[str, Any], dict[datetime, dict[str, Any]]]:
        is_chiller = device["device_type"] == "chiller"
        tr_cols = ", tr, trh" if is_chiller else ""
        if reprocess_from:
            rows = await fetch_all(
                f"SELECT slot_time, kw, kwh {tr_cols} FROM `{device['normalized_table']}` "
                f"WHERE slot_time > %s AND slot_time <= %s ORDER BY slot_time ASC",
                (reprocess_from, safe_ceiling),
            )
        else:
            rows = await fetch_all(
                f"SELECT slot_time, kw, kwh {tr_cols} FROM `{device['normalized_table']}` "
                f"WHERE slot_time <= %s ORDER BY slot_time ASC",
                (safe_ceiling,),
            )
        return device, {r["slot_time"]: r for r in rows}

    log.info("Plant — bulk fetching %d device streams...", len(devices))
    device_data = await asyncio.gather(*(_fetch_dev(d) for d in devices))

    slot_times = sorted({s for _, m in device_data for s in m.keys()})
    total = len(slot_times)
    log.info("Plant — total slots: %d", total)
    if total == 0:
        return

    first_slot = slot_times[0]
    last_slot_t = slot_times[-1]
    buffer_td = timedelta(hours=1)

    # ── 2. Cumulative seeds fetched ONCE, tracked in memory thereafter ───────
    prev_cum_kwh = await _fetch_plant_cumulative_seed(table, "cumulative_kwh", first_slot)
    prev_cum_trh = await _fetch_plant_cumulative_seed(table, "cumulative_trh", first_slot)

    # ── 3. Bulk-prefetch plant-level streams (tr_source, running_mode, direct)
    tr_source = plant.get("tr_source") or {}
    tr_stream: BulkReadings | None = None
    tr_cum_stream: BulkReadings | None = None
    if tr_source.get("type") == "direct":
        tr_stream = await bulk_fetch_param_range(
            tr_source["table"], tr_source["tr_param_id"],
            first_slot - buffer_td, last_slot_t + buffer_td,
        )
        if tr_source.get("trh_calculation") != "computed":
            tr_cum_stream = await bulk_fetch_param_range(
                tr_source["table"], tr_source["cumulative_trh_param_id"],
                first_slot - buffer_td, last_slot_t + buffer_td,
            )

    rm = plant.get("running_mode")
    rm_manual: BulkReadings | None = None
    rm_cpm: BulkReadings | None = None
    if rm:
        rm_manual = await bulk_fetch_param_range(
            rm["table"], rm["manual_mode_param"], first_slot - buffer_td, last_slot_t + buffer_td,
        )
        rm_cpm = await bulk_fetch_param_range(
            rm["table"], rm["cpm_mode_param"], first_slot - buffer_td, last_slot_t + buffer_td,
        )

    plant_direct_streams: dict[str, BulkReadings] = {}
    for p in plant.get("direct_params") or []:
        if p.get("table"):
            plant_direct_streams[p["normalized_column"]] = await bulk_fetch_param_range(
                p["table"], p["param_id"], first_slot - buffer_td, last_slot_t + buffer_td,
            )

    log.info("Plant — prefetch complete, processing %d slots...", total)

    # ── 4. Slot loop — 100% in-memory + batched upsert ───────────────────────
    upserter = BatchUpserter(table)
    log_every = max(1, total // 20)

    for i, slot_end in enumerate(slot_times, 1):
        slot_start = slot_end - interval_td

        # Aggregate device totals
        total_kw = 0.0
        total_kwh = 0.0
        aux_kw = 0.0
        aux_kwh = 0.0
        chiller_tr_sum = 0.0
        chiller_trh_sum = 0.0

        for device, slot_map in device_data:
            drow = slot_map.get(slot_end)
            if drow is None:
                continue
            kw = safe_float(drow.get("kw")) or 0.0
            kwh = safe_float(drow.get("kwh")) or 0.0
            total_kw += kw
            total_kwh += kwh
            if device["device_type"] != "chiller":
                aux_kw += kw
                aux_kwh += kwh
            else:
                tr_val = safe_float(drow.get("tr")) or 0.0
                trh_val = safe_float(drow.get("trh")) or 0.0
                chiller_tr_sum += tr_val
                chiller_trh_sum += trh_val

        total_kw = _r4(total_kw)
        total_kwh = _r4(total_kwh)
        aux_kw = _r4(aux_kw)
        aux_kwh = _r4(aux_kwh)

        prev_cum_kwh = _r4(prev_cum_kwh + total_kwh)
        cumulative_kwh = prev_cum_kwh

        # TR / TRH
        if tr_source.get("type") == "direct" and tr_stream is not None:
            readings = tr_stream.slice_for_window(slot_start, slot_end, filter_zeros=False)
            avg, _ = weighted_average(readings, slot_start, slot_end)
            total_tr = avg if avg is not None else _r4(chiller_tr_sum)

            if tr_source.get("trh_calculation") == "computed" or tr_cum_stream is None:
                total_trh = _r4(total_tr * interval_minutes / 60)
            else:
                cur_raw = safe_float(tr_cum_stream.last_value_at_or_before(slot_end)) or 0.0
                prev_raw = safe_float(tr_cum_stream.last_value_at_or_before(slot_start)) or 0.0
                if cur_raw == 0:
                    total_trh = _r4(total_tr * interval_minutes / 60)
                else:
                    raw_delta = _r4(max(0, cur_raw - prev_raw))
                    max_reasonable = _r4(total_tr * interval_minutes / 60 * 2)
                    total_trh = raw_delta if 0 < raw_delta <= max_reasonable else _r4(total_tr * interval_minutes / 60)
        else:
            total_tr = _r4(chiller_tr_sum)
            total_trh = _r4(chiller_trh_sum)

        prev_cum_trh = _r4(prev_cum_trh + total_trh)
        cumulative_trh = prev_cum_trh

        row: dict[str, Any] = {
            "slot_time":      slot_end,
            "total_kw":       total_kw,
            "total_kwh":      total_kwh,
            "cumulative_kwh": cumulative_kwh,
            "total_tr":       total_tr,
            "total_trh":      total_trh,
            "cumulative_trh": cumulative_trh,
            "aux_kw":         aux_kw,
            "aux_kwh":        aux_kwh,
        }

        # Running mode
        if rm and rm_manual is not None and rm_cpm is not None:
            m_val = rm_manual.last_value_at_or_before(slot_end)
            c_val = rm_cpm.last_value_at_or_before(slot_end)
            m_on = str(m_val).strip().lower() == "active" if m_val is not None else False
            c_on = str(c_val).strip().lower() == "active" if c_val is not None else False
            if m_on:
                row["plant_running_mode"] = "Manual"
            elif c_on:
                row["plant_running_mode"] = "CPM On"
            else:
                row["plant_running_mode"] = "CPM Off"

        # Direct params — nearest-neighbour from bulk streams
        ctx: dict[str, Any] = {"interval": interval_minutes}
        for p in plant.get("direct_params") or []:
            if not p.get("table"):
                continue
            stream = plant_direct_streams.get(p["normalized_column"])
            val: float | None = None
            if stream is not None:
                before_v = stream.last_value_at_or_before(slot_end)
                after_v = stream.first_value_after(slot_end)
                if before_v is not None and after_v is not None:
                    from bisect import bisect_right
                    idx = bisect_right(stream.times, slot_end) - 1
                    before_t = stream.times[idx] if idx >= 0 else None
                    if before_t is not None:
                        db = abs((before_t - slot_end).total_seconds())
                        da = abs((after_v[0] - slot_end).total_seconds())
                        val = safe_float(before_v) if db <= da else safe_float(after_v[1])
                    else:
                        val = safe_float(after_v[1])
                elif before_v is not None:
                    val = safe_float(before_v)
                elif after_v is not None:
                    val = safe_float(after_v[1])
            row[p["normalized_column"]] = val
            ctx[p["normalized_column"]] = val if val is not None else 0

        # Calculated params
        for p in plant.get("calculated_params") or []:
            v = evaluate_formula(p["formula"], ctx)
            row[p["normalized_column"]] = v
            ctx[p["normalized_column"]] = v if v is not None else 0

        upserter.add(row)
        await upserter.flush_if_full()

        if i % log_every == 0:
            log.info("Plant — %d/%d (%d%%)", i, total, i * 100 // total)

    pending = len(upserter._rows)
    if pending:
        log.info("Plant — slot loop done, flushing final %d rows...", pending)
    await upserter.flush()
    log.info("Plant — ✓ processed %d slots (written=%d)", total, upserter.total_written)


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point
# ─────────────────────────────────────────────────────────────────────────────

async def run_backfill(site_config: dict[str, Any]) -> None:
    site = site_config["site"]
    devices = site_config["devices"]
    interval_minutes = site["interval_minutes"]
    now = datetime.now()
    cfg = load_runtime_config()
    concurrency = cfg["device_concurrency"]

    backfill_start: datetime | None = None
    raw_start = site.get("backfill_start_date")
    if raw_start:
        try:
            backfill_start = datetime.fromisoformat(raw_start)
            log.info("Backfill start date configured: %s", backfill_start)
        except ValueError:
            log.warning("Invalid backfill_start_date '%s' — ignored", raw_start)

    log.info("Starting backfill — site=%s interval=%dm devices=%d concurrency=%d",
             site["site_name"], interval_minutes, len(devices), concurrency)

    # Compute a single global window end so every device produces the same
    # time-series range — devices with fewer/older readings write OFF rows
    # for trailing slots, keeping all normalized tables slot-aligned.
    raw_times = await asyncio.gather(*(find_latest_primary_raw_time(d) for d in devices))
    valid_times = [floor_to_interval(t, interval_minutes) for t in raw_times if t is not None]
    global_window_end: datetime | None = max(valid_times) if valid_times else None
    if global_window_end:
        log.info("Global window end: %s", global_window_end)

    chiller_devices = [d for d in devices if d.get("device_type") == "chiller"]
    non_chiller_devices = [d for d in devices if d.get("device_type") != "chiller"]
    sem = asyncio.Semaphore(concurrency)

    # Phase 1: chillers first — non-chiller committed_config calcs read chiller tables
    if chiller_devices:
        log.info("Phase 1 — backfilling %d chiller(s)...", len(chiller_devices))
        await asyncio.gather(*(
            _backfill_device(d, interval_minutes, chiller_devices, sem, backfill_start, global_window_end)
            for d in chiller_devices
        ))
        log.info("Phase 1 complete.")

    # Phase 2: non-chiller devices (can now read committed state from chiller tables)
    if non_chiller_devices:
        log.info("Phase 2 — backfilling %d non-chiller device(s)...", len(non_chiller_devices))
        await asyncio.gather(*(
            _backfill_device(d, interval_minutes, chiller_devices, sem, backfill_start, global_window_end)
            for d in non_chiller_devices
        ))
        log.info("Phase 2 complete.")

    log.info("Device backfill complete. Starting plant backfill...")
    await _backfill_plant(site_config, now, backfill_start)
    log.info("✓ Backfill complete.")


__all__ = ["run_backfill", "floor_to_interval"]