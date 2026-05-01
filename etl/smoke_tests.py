"""Smoke tests — no DB. Verifies formula eval + weighted average parity."""
import math
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from calculator.formula import evaluate_formula
from calculator.weighted_average import weighted_average
from calculator.raw_fetcher import BulkReadings


def test_formulas():
    print("── formula eval tests ──")
    # kwh formula
    v = evaluate_formula("kw * on_minutes / 60", {"kw": 120, "on_minutes": 5})
    assert abs(v - 10.0) < 1e-6, v
    print(f"  kw * on_minutes / 60 (120, 5) = {v}")

    # TR formula with Math.min/Math.max
    v = evaluate_formula(
        "(Math.min(Math.max(0, btu_flow_m3h), 250) / chillers_running) * "
        "(evap_entering_temp - evap_leaving_temp) * 0.33",
        {"btu_flow_m3h": 300, "chillers_running": 2,
         "evap_entering_temp": 12, "evap_leaving_temp": 7},
    )
    expected = (min(max(0, 300), 250) / 2) * (12 - 7) * 0.33
    assert abs(v - round(expected * 10000) / 10000) < 1e-4, (v, expected)
    print(f"  TR formula = {v} (expected {expected})")

    # Cumulative
    v = evaluate_formula("prev_cumulative_kwh + kwh",
                         {"prev_cumulative_kwh": 1000, "kwh": 10})
    assert v == 1010.0, v
    print(f"  cumulative = {v}")

    # Wet bulb — complex
    v = evaluate_formula(
        "ambient_temp * Math.atan(0.151977 * Math.sqrt(humidity_monitoring + 8.313659)) "
        "+ Math.atan(ambient_temp + humidity_monitoring) "
        "- Math.atan(humidity_monitoring - 1.676331) "
        "+ 0.00391838 * Math.pow(humidity_monitoring, 1.5) "
        "* Math.atan(0.023101 * humidity_monitoring) - 4.686035",
        {"ambient_temp": 30, "humidity_monitoring": 70},
    )
    assert v is not None and math.isfinite(v), v
    print(f"  wet_bulb_temp(30, 70) = {v}")

    # Divide by zero
    v = evaluate_formula("kw / tr", {"kw": 100, "tr": 0})
    assert v is None, v
    print(f"  kw/0 → None ✓")

    # Missing variable → treated as 0 (defensive, matches Node.js undefined→NaN→null)
    v = evaluate_formula("a + b", {"a": 5})
    assert v == 5.0, v
    print(f"  missing var → 0: 5+0 = {v}")

    print("  ✓ all formula tests passed\n")


def test_weighted_average():
    print("── weighted average tests ──")
    window_start = datetime(2025, 1, 1, 10, 0)
    window_end   = datetime(2025, 1, 1, 10, 5)

    # 5-min window, KW=100 first 2 min, KW=200 last 3 min (pseudocode: last-reading +30s rule)
    readings = [
        {"measured_time": datetime(2025, 1, 1, 10, 0), "value": "100"},
        {"measured_time": datetime(2025, 1, 1, 10, 2), "value": "200"},
    ]
    avg, ms = weighted_average(readings, window_start, window_end)
    # First reading active 10:00-10:02 → 2 min * 100
    # Second reading active 10:02-10:02:30 (last+30s rule) → 0.5 min * 200
    expected = (100 * 120 + 200 * 30) / (120 + 30)
    assert abs(avg - expected) < 1e-2, (avg, expected)
    print(f"  weighted avg (100 for 2min, 200 for 30s) = {avg} (expected {expected:.4f})")

    # Empty
    avg, ms = weighted_average([], window_start, window_end)
    assert avg is None, avg
    print("  empty → None ✓")

    print("  ✓ all weighted-average tests passed\n")


def test_bulk_readings():
    print("── BulkReadings slicing tests ──")
    # Build a stream of minute-by-minute readings over 30 minutes
    base = datetime(2025, 1, 1, 10, 0)
    rows = [{"measured_time": base + timedelta(minutes=i), "value": str(i)}
            for i in range(30)]
    br = BulkReadings.from_rows(rows)

    # 5-min window inside
    ws = base + timedelta(minutes=10)
    we = base + timedelta(minutes=15)
    sliced = br.slice_for_window(ws, we, filter_zeros=False)
    # before (idx 9) + in-window (idx 10,11,12,13,14) + after (idx 15)
    assert len(sliced) == 7, f"got {len(sliced)}"
    print(f"  slice 10-15 → {len(sliced)} readings (1 before + 5 in + 1 after) ✓")

    # status_at
    assert br.status_at(base + timedelta(minutes=10, seconds=30), "10") is True
    assert br.status_at(base + timedelta(minutes=10, seconds=30), "9")  is False
    print("  status_at ✓")

    # last_value_at_or_before
    assert br.last_value_at_or_before(base + timedelta(minutes=7, seconds=45)) == "7"
    print("  last_value_at_or_before ✓")

    print("  ✓ all BulkReadings tests passed\n")


def test_upsert_sql():
    print("── SQL builders ──")
    from db.upsert import build_upsert_sql
    sql = build_upsert_sql("my_table", ["slot_time", "kw", "kwh"])
    assert "INSERT INTO `my_table`" in sql
    assert "ON DUPLICATE KEY UPDATE" in sql
    assert "`kw` = VALUES(`kw`)" in sql
    assert "`slot_time` = VALUES(`slot_time`)" not in sql  # excluded
    print(f"  upsert SQL ok:\n    {sql}\n")

    from schema.builder import generate_create_table_sql, build_column_defs
    dummy_device = {
        "device_type": "chiller",
        "instance": "chiller_1",
        "normalized_table": "chiller_1_normalized",
        "other_params": [{"param_id": "pid1", "normalized_column": "kw"}],
        "direct_params": [{"table": "t", "param_id": "pid2", "normalized_column": "run_hours"}],
        "calculated_params": [
            {"normalized_column": "cumulative_kwh", "formula": "prev_cumulative_kwh + kwh"},
            {"normalized_column": "tr", "formula": "x"},
        ],
    }
    cols = build_column_defs(dummy_device)
    names = [c[0] for c in cols]
    assert "slot_time" in names
    assert "kw" in names
    assert "run_hours" in names
    assert "cumulative_kwh" in names
    # Ensure cumulative uses DECIMAL(20,4)
    for n, ddl in cols:
        if n == "cumulative_kwh":
            assert "DECIMAL(20,4)" in ddl, ddl
        if n == "tr":
            assert "DECIMAL(10,4)" in ddl, ddl

    sql = generate_create_table_sql(dummy_device)
    assert "CREATE TABLE IF NOT EXISTS `chiller_1_normalized`" in sql
    print("  schema builder ✓\n")


if __name__ == "__main__":
    test_formulas()
    test_weighted_average()
    test_bulk_readings()
    test_upsert_sql()
    print("🎉 All smoke tests passed.")
