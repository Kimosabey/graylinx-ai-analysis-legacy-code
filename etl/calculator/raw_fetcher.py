"""Raw reading fetcher.

Two modes:

LIVE mode (for cron): small windows, fetch [before + in + after] per call.
   Matches Node.js fetcher semantics exactly for every rule.

BULK mode (for backfill): fetches the ENTIRE range of readings for a
   (table, param_id) pair once, with a small buffer on either side.
   The result is a sorted in-memory list with a sliding-pointer helper
   (`slice_for_window`) that extracts the per-slot subset in O(log N).

Bulk mode is the primary speed-up over the Node.js implementation:
Node.js did N queries per slot × M slots → millions of round-trips.
Bulk mode reduces that to one query per (table, param) per backfill run.
"""
from __future__ import annotations

from bisect import bisect_left, bisect_right
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Iterable
import warnings
warnings.filterwarnings("ignore")


from db.pool import fetch_all, fetch_one
from utils.logging_setup import get_logger

log = get_logger("raw")


def safe_float(v: Any) -> float | None:
    """Return float(v) or None — never raises. Used to tolerate BMS tables
    where numeric param slots sometimes hold text values like 'active'."""
    if v is None:
        return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


# ── Helpers ───────────────────────────────────────────────────────────────────

def col_names(table: str) -> tuple[str, str]:
    """Metric tables use metric_id/metric_value; all others use param_id/param_value."""
    if table.endswith("_metric"):
        return "metric_id", "metric_value"
    return "param_id", "param_value"


# ─────────────────────────────────────────────────────────────────────────────
# LIVE MODE — per-slot fetch (used by cron and plant processor)
# ─────────────────────────────────────────────────────────────────────────────

async def fetch_raw_readings(
    table: str,
    param_id: str,
    window_start: datetime,
    window_end: datetime,
    filter_zeros: bool = True,
) -> list[dict[str, Any]]:
    """Before + in-window + after, matching rawFetcher.fetchRawReadings exactly."""
    zero_clause = "AND CAST(param_value AS DECIMAL(20,6)) != 0" if filter_zeros else ""

    before = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time < %s {zero_clause} "
        f"ORDER BY measured_time DESC LIMIT 1",
        (param_id, window_start),
    )
    inwin = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time >= %s AND measured_time < %s {zero_clause} "
        f"ORDER BY measured_time ASC",
        (param_id, window_start, window_end),
    )
    after = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time >= %s {zero_clause} "
        f"ORDER BY measured_time ASC LIMIT 1",
        (param_id, window_end),
    )
    return before + inwin + after


async def fetch_kw_readings(
    table: str, param_id: str, window_start: datetime, window_end: datetime,
) -> list[dict[str, Any]]:
    """KW readings: same window logic as raw, but values are ABS'd + minute-aggregated.

    Non-numeric values (e.g. 'active' strings that occasionally show up in
    BMS tables) are silently skipped rather than crashing the slot.
    """
    raw = await fetch_raw_readings(table, param_id, window_start, window_end, filter_zeros=True)
    cleaned: list[dict[str, Any]] = []
    for r in raw:
        f = safe_float(r["value"])
        if f is None:
            continue
        cleaned.append({**r, "value": str(abs(f))})
    return _aggregate_by_minute(cleaned)


async def fetch_cov_readings(
    table: str, param_id: str, window_start: datetime, window_end: datetime,
) -> list[dict[str, Any]]:
    """Slow COV (BTU meter) — no zero filter, no abs."""
    return await fetch_raw_readings(table, param_id, window_start, window_end, filter_zeros=False)


async def fetch_run_status_readings(
    table: str, param_id: str, window_start: datetime, window_end: datetime,
) -> list[dict[str, Any]]:
    """Carry-forward run status: one reading from before + all readings in-window."""
    inwin = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time >= %s AND measured_time < %s "
        f"ORDER BY measured_time ASC",
        (param_id, window_start, window_end),
    )
    before = await fetch_all(
        f"SELECT measured_time, param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time < %s "
        f"ORDER BY measured_time DESC LIMIT 1",
        (param_id, window_start),
    )
    out: list[dict[str, Any]] = []
    if before:
        out.append({"measured_time": window_start, "value": before[0]["value"]})
    for r in inwin:
        if r["measured_time"] > window_start:
            out.append(r)
    return out


async def fetch_run_status(
    run_status_config: dict[str, Any], table: str, window_end: datetime,
) -> bool:
    """Is the device ON as of window_end? Uses last reading ≤ window_end."""
    row = await fetch_one(
        f"SELECT param_value AS value FROM `{table}` "
        f"WHERE param_id = %s AND measured_time <= %s "
        f"ORDER BY measured_time DESC LIMIT 1",
        (run_status_config["param_id"], window_end),
    )
    if not row:
        return False
    return str(row["value"]).strip().lower() == str(run_status_config["active_value"]).strip().lower()


async def fetch_direct_value(
    table: str, param_id: str, window_end: datetime,
) -> float | None:
    """Nearest-neighbour: last reading before or first reading after, whichever is closer."""
    id_col, val_col = col_names(table)

    before = await fetch_one(
        f"SELECT `{val_col}` AS value, measured_time FROM `{table}` "
        f"WHERE `{id_col}` = %s AND measured_time <= %s "
        f"ORDER BY measured_time DESC LIMIT 1",
        (param_id, window_end),
    )
    after = await fetch_one(
        f"SELECT `{val_col}` AS value, measured_time FROM `{table}` "
        f"WHERE `{id_col}` = %s AND measured_time > %s "
        f"ORDER BY measured_time ASC LIMIT 1",
        (param_id, window_end),
    )
    nearest = None
    if before and after:
        db = abs((before["measured_time"] - window_end).total_seconds())
        da = abs((after["measured_time"] - window_end).total_seconds())
        nearest = before if db <= da else after
    elif before:
        nearest = before
    elif after:
        nearest = after
    if not nearest:
        return None
    try:
        return float(nearest["value"])
    except (TypeError, ValueError):
        return None


async def fetch_last_cumulative(
    normalized_table: str, column: str, before_time: datetime | None = None,
) -> float:
    """Last non-null cumulative value BEFORE before_time. Returns 0 if none."""
    time_clause = "AND slot_time < %s" if before_time else ""
    sql = (
        f"SELECT `{column}` AS v FROM `{normalized_table}` "
        f"WHERE `{column}` IS NOT NULL {time_clause} "
        f"ORDER BY slot_time DESC LIMIT 1"
    )
    params: tuple = (before_time,) if before_time else ()
    row = await fetch_one(sql, params)
    if not row or row["v"] is None:
        return 0.0
    try:
        return float(row["v"])
    except (TypeError, ValueError):
        return 0.0


async def find_latest_primary_raw_time(device: dict[str, Any]) -> datetime | None:
    """MAX(measured_time) across device_table + energy_table only (not direct_param tables)."""
    tables = set()
    if device.get("device_table"):
        tables.add(device["device_table"])
    if device.get("energy_table"):
        tables.add(device["energy_table"])

    latest: datetime | None = None
    for t in tables:
        try:
            row = await fetch_one(f"SELECT MAX(measured_time) AS t FROM `{t}`")
            if row and row["t"]:
                if latest is None or row["t"] > latest:
                    latest = row["t"]
        except Exception:
            pass
    return latest


# ─────────────────────────────────────────────────────────────────────────────
# BULK MODE — fetch once for full range, slice per slot in memory
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class BulkReadings:
    """A sorted list of (ts, value_str) for one (table, param_id) pair.

    Use slice_for_window() to get the before + in + after triple for a slot.
    Much faster than re-querying per slot during backfill.
    """
    times: list[datetime]
    values: list[str]

    @classmethod
    def from_rows(cls, rows: Iterable[dict[str, Any]]) -> "BulkReadings":
        rows_list = sorted(rows, key=lambda r: r["measured_time"])
        return cls(
            times=[r["measured_time"] for r in rows_list],
            values=[str(r["value"]) if r["value"] is not None else "0" for r in rows_list],
        )

    def slice_for_window(
        self, window_start: datetime, window_end: datetime, filter_zeros: bool = True,
    ) -> list[dict[str, Any]]:
        """Return before + in-window + after, matching live fetch_raw_readings."""
        if not self.times:
            return []

        # bisect to find window boundaries
        lo = bisect_left(self.times, window_start)
        hi = bisect_left(self.times, window_end)

        # before = last index strictly < window_start
        result: list[dict[str, Any]] = []
        if lo > 0:
            # scan backward to skip zeros if needed
            for idx in range(lo - 1, -1, -1):
                v = self.values[idx]
                if not filter_zeros or _nonzero(v):
                    result.append({"measured_time": self.times[idx], "value": v})
                    break

        # in-window
        for idx in range(lo, hi):
            v = self.values[idx]
            if not filter_zeros or _nonzero(v):
                result.append({"measured_time": self.times[idx], "value": v})

        # after = first index >= window_end
        if hi < len(self.times):
            for idx in range(hi, len(self.times)):
                v = self.values[idx]
                if not filter_zeros or _nonzero(v):
                    result.append({"measured_time": self.times[idx], "value": v})
                    break
        return result

    def slice_status_for_window(
        self, window_start: datetime, window_end: datetime,
    ) -> list[dict[str, Any]]:
        """Carry-forward run-status slice: before reading pinned to window_start."""
        if not self.times:
            return []
        lo = bisect_left(self.times, window_start)
        hi = bisect_left(self.times, window_end)
        out: list[dict[str, Any]] = []
        if lo > 0:
            out.append({"measured_time": window_start, "value": self.values[lo - 1]})
        for idx in range(lo, hi):
            if self.times[idx] > window_start:
                out.append({"measured_time": self.times[idx], "value": self.values[idx]})
        return out

    def status_at(self, ts: datetime, active_value: str) -> bool:
        """Point-in-time status at ts — last reading ≤ ts."""
        if not self.times:
            return False
        idx = bisect_right(self.times, ts)
        if idx == 0:
            return False
        return str(self.values[idx - 1]).strip().lower() == str(active_value).strip().lower()

    def last_value_at_or_before(self, ts: datetime) -> str | None:
        """Nearest-neighbour helper: last value whose timestamp ≤ ts."""
        if not self.times:
            return None
        idx = bisect_right(self.times, ts)
        return self.values[idx - 1] if idx > 0 else None

    def first_value_after(self, ts: datetime) -> tuple[datetime, str] | None:
        if not self.times:
            return None
        idx = bisect_right(self.times, ts)
        if idx >= len(self.times):
            return None
        return self.times[idx], self.values[idx]


def _nonzero(v: Any) -> bool:
    try:
        return float(v) != 0.0
    except (TypeError, ValueError):
        return False


async def bulk_fetch_param_range(
    table: str, param_id: str, start: datetime, end: datetime,
) -> BulkReadings:
    """Fetch all readings for (table, param_id) in [start, end].

    Also grabs ~1 reading before start and ~1 after end so cross-bucket
    clipping works for the first and last slots.
    """
    id_col, val_col = col_names(table)
    # Use a single query — ORDER BY measured_time ASC is fine; server will
    # range-scan the composite (param_id, measured_time) index in a standard
    # BMS schema.
    rows = await fetch_all(
        f"SELECT measured_time, `{val_col}` AS value "
        f"FROM `{table}` WHERE `{id_col}` = %s "
        f"AND measured_time BETWEEN %s AND %s "
        f"ORDER BY measured_time ASC",
        (param_id, start - timedelta(hours=1), end + timedelta(hours=1)),
    )
    return BulkReadings.from_rows(rows)


# ─────────────────────────────────────────────────────────────────────────────
# Minute aggregation (shared by KW logic)
# ─────────────────────────────────────────────────────────────────────────────

def _aggregate_by_minute(readings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Group readings by minute bucket — average if multiple per minute."""
    if not readings:
        return readings

    buckets: dict[datetime, list[float]] = {}
    for r in readings:
        t: datetime = r["measured_time"]
        key = t.replace(second=0, microsecond=0)
        try:
            val = float(r["value"])
        except (TypeError, ValueError):
            continue
        buckets.setdefault(key, []).append(val)

    has_hf = any(len(vs) > 1 for vs in buckets.values())
    if not has_hf:
        return readings

    out = []
    for k in sorted(buckets):
        vs = buckets[k]
        out.append({
            "measured_time": k,
            "value": str(round(sum(vs) / len(vs) * 10000) / 10000),
        })
    return out


__all__ = [
    "BulkReadings",
    "bulk_fetch_param_range",
    "col_names",
    "fetch_cov_readings",
    "fetch_direct_value",
    "fetch_kw_readings",
    "fetch_last_cumulative",
    "fetch_raw_readings",
    "fetch_run_status",
    "fetch_run_status_readings",
    "find_latest_primary_raw_time",
    "safe_float",
]