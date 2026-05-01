"""Time-weighted average — pure math, no DB.

Direct port of weightedAverage.js. Each reading is active from its
timestamp until the next reading's timestamp (or +30s for the last one —
the pseudocode rule). Segments are clipped to [window_start, window_end]
and weighted by duration.

ON-only mode: when `run_status_readings` is supplied, only segments whose
start falls inside an ON period contribute. The denominator is total
ON-time, not total window duration — matches Node.js Issue-3 fix.
"""
from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Sequence
import warnings
warnings.filterwarnings("ignore")



def _round4(v: float) -> float:
    return round(v * 10000) / 10000


def _parse_time(v: Any) -> datetime:
    """Coerce DB datetime / already-datetime into datetime (no tz conversion)."""
    if isinstance(v, datetime):
        return v
    return datetime.fromisoformat(str(v))


def _to_float(v: Any) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def weighted_average(
    readings: Sequence[dict[str, Any]],
    window_start: datetime,
    window_end: datetime,
    run_status_readings: Sequence[dict[str, Any]] | None = None,
    active_value: str | None = None,
) -> tuple[float | None, float]:
    """Return (avg, on_duration_ms).

    readings: [{'measured_time': dt, 'value': str_or_num}, ...] sorted ASC.
    Either or both of run_status_readings / active_value may be None for
    standard (non-ON-gated) averaging.
    """
    if not readings:
        return None, 0.0

    window_ms = (window_end - window_start).total_seconds() * 1000.0
    if window_ms <= 0:
        return None, 0.0

    # Sort defensively — caller usually passes already-sorted data.
    sorted_rs = sorted(readings, key=lambda r: _parse_time(r["measured_time"]))

    # ── Build status-at-timestamp lookup for ON-only mode ──────────────────
    status_timeline: list[tuple[datetime, bool]] | None = None
    if run_status_readings and active_value is not None:
        av = str(active_value).strip().lower()
        sorted_status = sorted(
            run_status_readings, key=lambda r: _parse_time(r["measured_time"])
        )
        status_timeline = [
            (_parse_time(r["measured_time"]),
             str(r["value"]).strip().lower() == av)
            for r in sorted_status
        ]

    def status_at(ts: datetime) -> bool:
        if not status_timeline:
            return False
        last = None
        for t, on in status_timeline:
            if t <= ts:
                last = on
            else:
                break
        return bool(last) if last is not None else False

    # ── Each reading's effective segment, clipped to window ─────────────────
    effective: list[tuple[float, datetime, float]] = []
    n = len(sorted_rs)
    for i, r in enumerate(sorted_rs):
        t = _parse_time(r["measured_time"])
        if i + 1 < n:
            reading_end = _parse_time(sorted_rs[i + 1]["measured_time"])
        else:
            reading_end = t + timedelta(seconds=30)  # pseudocode last-reading rule

        seg_start = max(t, window_start)
        seg_end = min(reading_end, window_end)
        if seg_end <= seg_start:
            continue

        v = _to_float(r["value"])
        if v is None:
            continue

        duration_ms = (seg_end - seg_start).total_seconds() * 1000.0
        effective.append((v, seg_start, duration_ms))

    if not effective:
        return None, 0.0

    # ── Standard mode ───────────────────────────────────────────────────────
    if status_timeline is None:
        total_ms = sum(e[2] for e in effective)
        if total_ms <= 0:
            return None, 0.0
        weighted_sum = sum(e[0] * e[2] for e in effective)
        return _round4(weighted_sum / total_ms), total_ms

    # ── ON-only mode ────────────────────────────────────────────────────────
    weighted_sum = 0.0
    on_ms = 0.0
    for value, seg_start, duration_ms in effective:
        if status_at(seg_start):
            weighted_sum += value * duration_ms
            on_ms += duration_ms

    if on_ms <= 0:
        return None, 0.0
    return _round4(weighted_sum / on_ms), on_ms


__all__ = ["weighted_average"]
