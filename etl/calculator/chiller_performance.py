"""Chiller committed performance calculations.

Mirrors chillerPerformance.js exactly:
  lookup_ikwtr(temp, load)          → committed ikW/TR from matrix
  compute_chiller_performance(ctx)  → 4 performance fields written to normalized row
"""
from __future__ import annotations

import math
from typing import Any

_IKWTR_MATRIX_TEMPS = [35, 34, 33, 32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15]
_IKWTR_MATRIX_LOADS = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15]
_IKWTR_MATRIX_VALUES: dict[int, list[float]] = {
    35: [0.6733, 0.6468, 0.6387, 0.6319, 0.6281, 0.6279, 0.6317, 0.6414, 0.6499, 0.6616, 0.6769, 0.6824, 0.7035, 0.7327, 0.7699, 0.8253, 0.9034, 1.0290],
    34: [0.6628, 0.6470, 0.6387, 0.6319, 0.6281, 0.6280, 0.6317, 0.6414, 0.6500, 0.6616, 0.6770, 0.6824, 0.7035, 0.7327, 0.7699, 0.8253, 0.9034, 1.0290],
    33: [0.6417, 0.6228, 0.6145, 0.6074, 0.6038, 0.6036, 0.6055, 0.6072, 0.6268, 0.6370, 0.6506, 0.6680, 0.6730, 0.6986, 0.7345, 0.7858, 0.8647, 0.9870],
    32: [0.6089, 0.5995, 0.5908, 0.5841, 0.5808, 0.5798, 0.5801, 0.5809, 0.5981, 0.6066, 0.6184, 0.6344, 0.6396, 0.6635, 0.6970, 0.7470, 0.8185, 0.9414],
    31: [0.5865, 0.5767, 0.5680, 0.5619, 0.5583, 0.5556, 0.5538, 0.5545, 0.5683, 0.5760, 0.5870, 0.6023, 0.6085, 0.6316, 0.6632, 0.7086, 0.7775, 0.8885],
    30: [0.5645, 0.5545, 0.5464, 0.5403, 0.5353, 0.5305, 0.5276, 0.5287, 0.5350, 0.5484, 0.5593, 0.5743, 0.5967, 0.6040, 0.6349, 0.6788, 0.7439, 0.8464],
    29: [0.5430, 0.5337, 0.5256, 0.5185, 0.5114, 0.5058, 0.5028, 0.5056, 0.5100, 0.5248, 0.5359, 0.5506, 0.5700, 0.5791, 0.6089, 0.6535, 0.7140, 0.8122],
    28: [0.5227, 0.5135, 0.5049, 0.4962, 0.4883, 0.4836, 0.4814, 0.4834, 0.4861, 0.4909, 0.5131, 0.5276, 0.5446, 0.5515, 0.5787, 0.6177, 0.6775, 0.7748],
    27: [0.5032, 0.4935, 0.4837, 0.4746, 0.4672, 0.4630, 0.4603, 0.4611, 0.4626, 0.4656, 0.4866, 0.4978, 0.5130, 0.5336, 0.5445, 0.5804, 0.6357, 0.7285],
    26: [0.4842, 0.4736, 0.4634, 0.4541, 0.4469, 0.4423, 0.4388, 0.4383, 0.4388, 0.4413, 0.4470, 0.4680, 0.4817, 0.5005, 0.5115, 0.5446, 0.5965, 0.6822],
    25: [0.4653, 0.4543, 0.4439, 0.4343, 0.4267, 0.4216, 0.4171, 0.4156, 0.4155, 0.4174, 0.4219, 0.4397, 0.4523, 0.4695, 0.4807, 0.5114, 0.5590, 0.6386],
    24: [0.4478, 0.4355, 0.4247, 0.4147, 0.4069, 0.4014, 0.3962, 0.3940, 0.3930, 0.3943, 0.3980, 0.4131, 0.4245, 0.4413, 0.4635, 0.4809, 0.5254, 0.5997],
    23: [0.4298, 0.4172, 0.4058, 0.3957, 0.3880, 0.3821, 0.3762, 0.3731, 0.3716, 0.3720, 0.3750, 0.3804, 0.3991, 0.4143, 0.4356, 0.4529, 0.4940, 0.5640],
    22: [0.4124, 0.4001, 0.3872, 0.3777, 0.3698, 0.3636, 0.3570, 0.3532, 0.3508, 0.3506, 0.3527, 0.3572, 0.3748, 0.3888, 0.4085, 0.4250, 0.4633, 0.5291],
    21: [0.3954, 0.3825, 0.3699, 0.3605, 0.3525, 0.3442, 0.3386, 0.3339, 0.3309, 0.3299, 0.3311, 0.3344, 0.3516, 0.3644, 0.3826, 0.4080, 0.4326, 0.4939],
    20: [0.3786, 0.3657, 0.3535, 0.3441, 0.3358, 0.3271, 0.3205, 0.3151, 0.3113, 0.3096, 0.3099, 0.3211, 0.3293, 0.3382, 0.3543, 0.3782, 0.4017, 0.4579],
    19: [0.3623, 0.3494, 0.3388, 0.3282, 0.3196, 0.3100, 0.3029, 0.2968, 0.2924, 0.2898, 0.2940, 0.2978, 0.3044, 0.3147, 0.3273, 0.3487, 0.3701, 0.4221],
    18: [0.3468, 0.3326, 0.3236, 0.3127, 0.3035, 0.2932, 0.2855, 0.2790, 0.2759, 0.2731, 0.2728, 0.2750, 0.2799, 0.2884, 0.3000, 0.3189, 0.3487, 0.3862],
    17: [0.3312, 0.3175, 0.3089, 0.2986, 0.2873, 0.2768, 0.2688, 0.2617, 0.2577, 0.2538, 0.2522, 0.2529, 0.2563, 0.2626, 0.2740, 0.2917, 0.3197, 0.3565],
    16: [0.3154, 0.3035, 0.2941, 0.2830, 0.2715, 0.2608, 0.2525, 0.2471, 0.2405, 0.2355, 0.2326, 0.2329, 0.2356, 0.2429, 0.2544, 0.2715, 0.2981, 0.3345],
    15: [0.2996, 0.2901, 0.2797, 0.2672, 0.2574, 0.2454, 0.2406, 0.2317, 0.2243, 0.2185, 0.2159, 0.2163, 0.2204, 0.2278, 0.2391, 0.2557, 0.2815, 0.3178],
}


def _r4(v: Any) -> float | None:
    try:
        n = float(v)
    except (TypeError, ValueError):
        return None
    return round(n * 10000) / 10000 if math.isfinite(n) else None


def _snap_up_to_matrix(value: Any, matrix_array: list[int]) -> int | None:
    """Return the smallest entry in matrix_array that is >= value."""
    try:
        n = float(value)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(n):
        return None
    for entry in sorted(matrix_array):
        if n <= entry:
            return entry
    return matrix_array[-1] if matrix_array else None


def lookup_ikwtr(temp: Any, load: Any) -> float | None:
    """Look up committed ikW/TR from the matrix.

    temp — condenser leaving water temperature (°C)
    load — chiller load percentage (0–100)
    """
    snapped_temp = _snap_up_to_matrix(temp, _IKWTR_MATRIX_TEMPS)
    snapped_load = _snap_up_to_matrix(load, _IKWTR_MATRIX_LOADS)
    if snapped_temp is None or snapped_load is None:
        return None
    row = _IKWTR_MATRIX_VALUES.get(snapped_temp)
    if row is None:
        return None
    try:
        col_idx = _IKWTR_MATRIX_LOADS.index(snapped_load)
    except ValueError:
        return None
    return row[col_idx]


def compute_chiller_performance(ctx: dict[str, Any]) -> dict[str, float]:
    """Compute all 4 chiller performance fields for a single slot.

    ctx must contain: is_running, kw, tr, cond_leaving_temp, chiller_load
    Returns: committed_kw_per_tr, committed_kw, performance_deviation,
             performance_deviation_percent
    """
    if int(ctx.get("is_running") or 0) == 0:
        return {
            "committed_kw_per_tr":           0,
            "committed_kw":                  0,
            "performance_deviation":         0,
            "performance_deviation_percent": 0,
        }

    ikwtr = None
    if ctx.get("cond_leaving_temp") is not None and ctx.get("chiller_load") is not None:
        ikwtr = lookup_ikwtr(ctx["cond_leaving_temp"], ctx["chiller_load"])

    committed_kw_per_tr = _r4(ikwtr) if ikwtr is not None else 0

    tr = float(ctx.get("tr") or 0)
    kw = float(ctx.get("kw") or 0)

    committed_kw = _r4(tr * committed_kw_per_tr) if (tr > 0 and committed_kw_per_tr > 0) else 0

    performance_deviation = 0.0
    performance_deviation_percent = 0.0
    if committed_kw and committed_kw > 0 and kw > 0:
        dev = (kw - committed_kw) / committed_kw
        performance_deviation = _r4(dev) or 0.0
        performance_deviation_percent = _r4(dev * 100) or 0.0

    return {
        "committed_kw_per_tr":           committed_kw_per_tr or 0,
        "committed_kw":                  committed_kw or 0,
        "performance_deviation":         performance_deviation,
        "performance_deviation_percent": performance_deviation_percent,
    }


__all__ = ["lookup_ikwtr", "compute_chiller_performance"]
