"""Plant processor — aggregates per-device results into the plant row.

Matches plantProcessor.js semantics. Used by both live cron and backfill.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from calculator.formula import evaluate_formula
from calculator.raw_fetcher import (
    col_names,
    fetch_cov_readings,
    fetch_direct_value,
)
from calculator.weighted_average import weighted_average
from db.pool import fetch_one
from db.upsert import upsert_row
from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")


log = get_logger("plant")


def _r4(v: float) -> float:
    return round(v * 10000) / 10000


async def _fetch_last_plant_cumulative(
    table: str, column: str, before_time: datetime | None = None,
) -> float:
    time_clause = "AND slot_time < %s" if before_time else ""
    params: tuple = (before_time,) if before_time else ()
    row = await fetch_one(
        f"SELECT `{column}` AS v FROM `{table}` "
        f"WHERE `{column}` IS NOT NULL {time_clause} "
        f"ORDER BY slot_time DESC LIMIT 1",
        params,
    )
    if not row or row["v"] is None:
        return 0.0
    try:
        return float(row["v"])
    except (TypeError, ValueError):
        return 0.0


async def process_plant(
    plant_config: dict[str, Any],
    device_results: list[dict[str, Any]],
    window_start: datetime,
    window_end: datetime,
    interval_minutes: int = 5,
) -> None:
    table = plant_config["normalized_table"]
    tr_source = plant_config.get("tr_source")

    # ── KW / KWH aggregation ─────────────────────────────────────────────────
    total_kw = 0.0
    total_kwh = 0.0
    aux_kw = 0.0
    aux_kwh = 0.0
    for r in device_results:
        kw = float(r.get("kw") or 0)
        kwh = float(r.get("kwh") or 0)
        total_kw = _r4(total_kw + kw)
        total_kwh = _r4(total_kwh + kwh)
        if r.get("device_type") != "chiller":
            aux_kw = _r4(aux_kw + kw)
            aux_kwh = _r4(aux_kwh + kwh)

    prev_cum_kwh = await _fetch_last_plant_cumulative(table, "cumulative_kwh", window_end)
    cumulative_kwh = _r4(prev_cum_kwh + total_kwh)

    # ── TR source ────────────────────────────────────────────────────────────
    total_tr = 0.0
    total_trh = 0.0
    cumulative_trh = 0.0

    if tr_source and tr_source.get("type") == "direct":
        tr_readings = await fetch_cov_readings(
            tr_source["table"], tr_source["tr_param_id"], window_start, window_end,
        )
        tr_avg, _ = weighted_average(tr_readings, window_start, window_end)
        raw_tr = tr_avg
        if raw_tr is None:
            raw_tr = await _fetch_last_plant_cumulative(table, "total_tr", window_end)
        total_tr = raw_tr or 0

        if tr_source.get("trh_calculation") == "computed":
            total_trh = _r4(total_tr * interval_minutes / 60)
            prev_cum_trh = await _fetch_last_plant_cumulative(table, "cumulative_trh", window_end)
            cumulative_trh = _r4(prev_cum_trh + total_trh)
        else:
            raw_cum_trh = await fetch_direct_value(
                tr_source["table"], tr_source["cumulative_trh_param_id"], window_end,
            ) or 0
            prev_cum_trh = await _fetch_last_plant_cumulative(table, "cumulative_trh", window_end)
            if raw_cum_trh == 0:
                total_trh = _r4(total_tr * interval_minutes / 60)
                cumulative_trh = _r4(prev_cum_trh + total_trh)
            else:
                prev_raw_row = await fetch_one(
                    f"SELECT param_value AS value FROM `{tr_source['table']}` "
                    f"WHERE param_id = %s AND measured_time <= %s "
                    f"ORDER BY measured_time DESC LIMIT 1",
                    (tr_source["cumulative_trh_param_id"], window_start),
                )
                prev_raw_trh = float(prev_raw_row["value"]) if prev_raw_row and prev_raw_row["value"] else 0
                raw_delta = _r4(max(0, raw_cum_trh - prev_raw_trh))
                max_reasonable = _r4(total_tr * interval_minutes / 60 * 2)
                if 0 < raw_delta <= max_reasonable:
                    total_trh = raw_delta
                else:
                    total_trh = _r4(total_tr * interval_minutes / 60)
                cumulative_trh = _r4(prev_cum_trh + total_trh)
    else:
        for r in device_results:
            if r.get("device_type") != "chiller":
                continue
            if r.get("tr") is not None:
                total_tr = _r4(total_tr + float(r["tr"]))
            if r.get("trh") is not None:
                total_trh = _r4(total_trh + float(r["trh"]))
        prev_cum_trh = await _fetch_last_plant_cumulative(table, "cumulative_trh", window_end)
        cumulative_trh = _r4(prev_cum_trh + total_trh)

    # ── Base row ─────────────────────────────────────────────────────────────
    row: dict[str, Any] = {
        "slot_time":      window_end,
        "total_kw":       total_kw,
        "total_kwh":      total_kwh,
        "cumulative_kwh": cumulative_kwh,
        "total_tr":       total_tr,
        "total_trh":      total_trh,
        "cumulative_trh": cumulative_trh,
        "aux_kw":         aux_kw,
        "aux_kwh":        aux_kwh,
    }

    # ── Running mode ─────────────────────────────────────────────────────────
    rm = plant_config.get("running_mode")
    if rm:
        id_col, val_col = col_names(rm["table"])

        async def _fetch_mode(param_id: str) -> str | None:
            r = await fetch_one(
                f"SELECT `{val_col}` AS value FROM `{rm['table']}` "
                f"WHERE `{id_col}` = %s AND measured_time <= %s "
                f"ORDER BY measured_time DESC LIMIT 1",
                (param_id, window_end),
            )
            return str(r["value"]).strip().lower() if r and r["value"] is not None else None

        manual = await _fetch_mode(rm["manual_mode_param"])
        cpm = await _fetch_mode(rm["cpm_mode_param"])
        if manual == "active":
            row["plant_running_mode"] = "Manual"
        elif cpm == "active":
            row["plant_running_mode"] = "CPM On"
        else:
            row["plant_running_mode"] = "CPM Off"

    # ── Dynamic direct + calculated params ───────────────────────────────────
    ctx: dict[str, Any] = {"interval": interval_minutes}
    for p in plant_config.get("direct_params") or []:
        if not p.get("table"):
            continue
        v = await fetch_direct_value(p["table"], p["param_id"], window_end)
        row[p["normalized_column"]] = v
        ctx[p["normalized_column"]] = v if v is not None else 0

    for p in plant_config.get("calculated_params") or []:
        v = evaluate_formula(p["formula"], ctx)
        row[p["normalized_column"]] = v
        ctx[p["normalized_column"]] = v if v is not None else 0

    await upsert_row(table, row)


__all__ = ["process_plant"]
