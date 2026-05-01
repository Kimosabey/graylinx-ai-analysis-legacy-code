"""Device processor — live per-slot mode (used by cron).

Mirrors deviceProcessor.js exactly. For bulk backfill the logic is
duplicated in backfill_processor.py with in-memory raw data — keeping
them separate is deliberate: live mode optimises for correctness under
concurrent raw writes, backfill optimises for throughput.

is_running values (matches Node.js):
  0 = OFF
  1 = ON, stable
  2 = ON, in warmup/stabilize window
"""
from __future__ import annotations

from datetime import datetime
from typing import Any
import warnings
warnings.filterwarnings("ignore")


from calculator.chiller_performance import compute_chiller_performance
from calculator.formula import evaluate_formula
from calculator.raw_fetcher import (
    fetch_direct_value,
    fetch_kw_readings,
    fetch_last_cumulative,
    fetch_raw_readings,
    fetch_run_status,
    fetch_run_status_readings,
)
from calculator.weighted_average import weighted_average
from db.pool import fetch_all, fetch_one
from db.upsert import upsert_row
from utils.logging_setup import get_logger

log = get_logger("device")


def _resolve_table(param: dict[str, Any], device: dict[str, Any]) -> str:
    if param.get("table"):
        return param["table"]
    return device["energy_table"] if param.get("source") == "energy" else device["device_table"]


async def _count_chillers_running(chiller_devices: list[dict[str, Any]], window_end: datetime) -> int:
    count = 0
    for ch in chiller_devices:
        if await fetch_run_status(ch["run_status"], ch["device_table"], window_end):
            count += 1
    return count if count > 0 else 1


async def _find_last_on_transition(
    run_status_config: dict[str, Any], table: str, window_end: datetime,
) -> datetime | None:
    """Find the timestamp of the most recent OFF→ON transition ≤ window_end."""
    rows = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time <= %s "
        f"ORDER BY measured_time DESC LIMIT 200",
        (run_status_config["param_id"], window_end),
    )
    if not rows:
        return None
    av = str(run_status_config["active_value"]).strip().lower()

    def is_active(v: Any) -> bool:
        return str(v).strip().lower() == av

    for i, r in enumerate(rows):
        if not is_active(r["value"]):
            return rows[i - 1]["measured_time"] if i > 0 else None
        if i == len(rows) - 1:
            return r["measured_time"]
    return None


async def _is_in_warmup_phase(device: dict[str, Any], window_end: datetime) -> bool:
    warmup = device.get("warmup_minutes") or 0
    if warmup <= 0:
        return False

    on_t: datetime | None = None
    if device.get("run_status_any"):
        for rs in device["run_status_any"]:
            t = await _find_last_on_transition(rs, rs["table"], window_end)
            if t and (on_t is None or t < on_t):
                on_t = t
    else:
        on_t = await _find_last_on_transition(device["run_status"], device["device_table"], window_end)

    if on_t is None:
        return False
    elapsed_min = (window_end - on_t).total_seconds() / 60.0
    return elapsed_min < warmup


async def _get_run_status_now(device: dict[str, Any], window_end: datetime) -> bool:
    if device.get("run_status_any"):
        for rs in device["run_status_any"]:
            if await fetch_run_status(rs, rs["table"], window_end):
                return True
        return False
    return await fetch_run_status(device["run_status"], device["device_table"], window_end)


async def _get_run_status_readings(
    device: dict[str, Any], window_start: datetime, window_end: datetime,
) -> tuple[list[dict[str, Any]], str]:
    """Return (readings, active_value_marker) — merged if run_status_any, else single source."""
    if device.get("run_status_any"):
        time_map: dict[datetime, bool] = {}
        for rs in device["run_status_any"]:
            rds = await fetch_run_status_readings(rs["table"], rs["param_id"], window_start, window_end)
            av = str(rs["active_value"]).strip().lower()
            for r in rds:
                t = r["measured_time"]
                if t not in time_map:
                    time_map[t] = False
                if str(r["value"]).strip().lower() == av:
                    time_map[t] = True
        merged = [
            {"measured_time": t, "value": "__ON__" if on else "__OFF__"}
            for t, on in sorted(time_map.items())
        ]
        return merged, "__ON__"

    rds = await fetch_run_status_readings(
        device["device_table"], device["run_status"]["param_id"], window_start, window_end,
    )
    return rds, device["run_status"]["active_value"]


async def _get_chiller_plant_state(
    chiller_devices: list[dict[str, Any]], window_end: datetime,
) -> dict[str, Any]:
    """Read is_running + chiller_load from each chiller's normalized table at window_end."""
    N = 0
    LOAD = 0.0
    for ch in chiller_devices:
        try:
            row = await fetch_one(
                f"SELECT is_running, chiller_load FROM `{ch['normalized_table']}` "
                f"WHERE slot_time = %s LIMIT 1",
                (window_end,),
            )
            if row and int(row.get("is_running") or 0) == 1:
                N += 1
                load = float(row.get("chiller_load") or 0)
                if load > LOAD:
                    LOAD = load
        except Exception:
            pass
    return {"N": N, "LOAD": LOAD / 100}


async def process_device(
    device: dict[str, Any],
    window_start: datetime,
    window_end: datetime,
    interval_minutes: int,
    chiller_devices: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Process one slot for one device — write one row, return summary."""
    chiller_devices = chiller_devices or []
    instance = device["instance"]
    normalized_table = device["normalized_table"]
    ss_id = device["ss_id"]

    # 1. Run status
    if device.get("check_run_status", True):
        is_running = await _get_run_status_now(device, window_end)
    else:
        is_running = True

    # 2. OFF → zero everything, carry forward cumulatives
    if not is_running:
        row: dict[str, Any] = {"ss_id": ss_id, "slot_time": window_end, "is_running": 0}
        for p in device.get("other_params") or []:
            row[p["normalized_column"]] = 0
        for p in device.get("direct_params") or []:
            if p.get("table"):
                row[p["normalized_column"]] = 0
        for p in device.get("sub_params") or []:
            row[p["normalized_column"]] = 0

        # Calculated params: cumulatives carry forward, rest eval with zeros
        off_ctx: dict[str, Any] = {"interval": interval_minutes, "on_minutes": 0}
        for col, val in row.items():
            off_ctx[col] = val if isinstance(val, (int, float)) else 0
        for p in device.get("calculated_params") or []:
            col = p["normalized_column"]
            if col.startswith("cumulative_"):
                row[col] = await fetch_last_cumulative(normalized_table, col, window_end)
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

        if device.get("committed_config"):
            plant_state = await _get_chiller_plant_state(chiller_devices, window_end)
            N = plant_state["N"]
            LOAD = plant_state["LOAD"]
            constant = device["committed_config"]["constant"]
            use_load = device["committed_config"].get("use_load") is True
            committed_kw = round((LOAD * N * constant if use_load else N * constant) * 10000) / 10000
            row["committed_kw"]  = committed_kw
            row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

        await upsert_row(normalized_table, row)
        return {"instance": instance, "device_type": device["device_type"],
                "isRunning": False, "kw": 0, "kwh": 0, "tr": 0, "trh": 0}

    # 3. ON path
    if device.get("check_run_status", True):
        warmup = await _is_in_warmup_phase(device, window_end)
        rs_readings, active_value = await _get_run_status_readings(device, window_start, window_end)
    else:
        warmup = False
        rs_readings, active_value = [], ""
    is_running_val = 2 if warmup else 1
    row = {"ss_id": ss_id, "slot_time": window_end, "is_running": is_running_val}
    ctx: dict[str, Any] = {"interval": interval_minutes}

    # 3a. other_params — weighted avg, ON-time only
    for p in device.get("other_params") or []:
        table = _resolve_table(p, device)
        if p.get("is_kw"):
            readings = await fetch_kw_readings(table, p["param_id"], window_start, window_end)
        else:
            readings = await fetch_raw_readings(table, p["param_id"], window_start, window_end, filter_zeros=True)

        avg, _ = weighted_average(readings, window_start, window_end, rs_readings, active_value)

        # valid_min / valid_max gate → carry forward prior value
        if avg is not None and ("valid_min" in p or "valid_max" in p):
            below = "valid_min" in p and avg < p["valid_min"]
            above = "valid_max" in p and avg > p["valid_max"]
            if below or above:
                avg = await fetch_last_cumulative(normalized_table, p["normalized_column"], window_end)
                log.warning("%s | %s=%s out of range [%s,%s] — carry forward",
                            instance, p["normalized_column"], avg,
                            p.get("valid_min"), p.get("valid_max"))

        row[p["normalized_column"]] = avg if avg is not None else 0
        ctx[p["normalized_column"]] = avg if avg is not None else 0

    ctx["on_minutes"] = interval_minutes

    if device.get("use_chiller_count_in_formula") and chiller_devices:
        ctx["chillers_running"] = await _count_chillers_running(chiller_devices, window_end)

    # 3b. direct_params
    for p in device.get("direct_params") or []:
        if not p.get("table"):
            continue
        v = await fetch_direct_value(p["table"], p["param_id"], window_end)
        row[p["normalized_column"]] = v if v is not None else 0
        ctx[p["normalized_column"]] = v if v is not None else 0

    # 3c. sub_params Mode 1 — weighted avg with own run status
    for p in device.get("sub_params") or []:
        if not p.get("param_id"):
            continue
        rs = p["run_status"]
        sub_rs = await fetch_run_status_readings(rs["table"], rs["param_id"], window_start, window_end)
        table = _resolve_table(p, device)
        if p.get("is_kw"):
            readings = await fetch_kw_readings(table, p["param_id"], window_start, window_end)
        else:
            readings = await fetch_raw_readings(table, p["param_id"], window_start, window_end, filter_zeros=True)
        avg, _ = weighted_average(readings, window_start, window_end, sub_rs, rs["active_value"])
        v = avg if avg is not None else 0
        row[p["normalized_column"]] = v
        ctx[p["normalized_column"]] = v

    # 3d. calculated_params — order matters, cumulatives fetch prev
    for p in device.get("calculated_params") or []:
        col = p["normalized_column"]
        if col.startswith("cumulative_"):
            prev = await fetch_last_cumulative(normalized_table, col, window_end)
            ctx[f"prev_{col}"] = prev
        v = evaluate_formula(p["formula"], ctx)
        row[col] = v if v is not None else 0
        ctx[col] = row[col]

    # 3e. sub_params Mode 2 — formula with own on_minutes
    for p in device.get("sub_params") or []:
        if p.get("param_id"):
            continue  # handled in Mode 1
        rs = p["run_status"]
        sub_rs = await fetch_run_status_readings(rs["table"], rs["param_id"], window_start, window_end)
        sub_on_ms = _on_duration_ms(sub_rs, window_start, window_end, rs["active_value"], interval_minutes)
        sub_ctx = dict(ctx)
        sub_ctx["on_minutes"] = round(sub_on_ms / 60000 * 10000) / 10000
        v = evaluate_formula(p["formula"], sub_ctx)
        row[p["normalized_column"]] = v if v is not None else 0
        ctx[p["normalized_column"]] = row[p["normalized_column"]]

    # 3f. Chiller performance (chiller devices only)
    if device.get("device_type") == "chiller":
        perf = compute_chiller_performance({
            "is_running":        is_running_val,
            "kw":                ctx.get("kw")               or 0,
            "tr":                ctx.get("tr")               or 0,
            "cond_leaving_temp": ctx.get("cond_leaving_temp"),
            "chiller_load":      ctx.get("chiller_load"),
        })
        row.update(perf)
        committed_kw = perf.get("committed_kw") or 0
        row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

    # 3g. Committed kW for pumps / cooling towers
    if device.get("committed_config") and chiller_devices:
        plant_state = await _get_chiller_plant_state(chiller_devices, window_end)
        N = plant_state["N"]
        LOAD = plant_state["LOAD"]
        constant = device["committed_config"]["constant"]
        use_load = device["committed_config"].get("use_load") is True
        committed_kw = round((LOAD * N * constant if use_load else N * constant) * 10000) / 10000
        row["committed_kw"]  = committed_kw
        row["committed_kwh"] = round(committed_kw * interval_minutes / 60 * 10000) / 10000

    await upsert_row(normalized_table, row)

    return {
        "instance": instance,
        "device_type": device["device_type"],
        "isRunning": True,
        "kw":  ctx.get("kw", 0),
        "tr":  ctx.get("tr", 0),
        "kwh": ctx.get("kwh", 0),
        "trh": ctx.get("trh", 0),
    }


def _on_duration_ms(
    status_readings: list[dict[str, Any]],
    window_start: datetime, window_end: datetime,
    active_value: str, interval_minutes: int,
) -> float:
    """Sub-param ON duration in ms — mirror Node.js calculateOnDurationMs."""
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


__all__ = ["process_device"]
