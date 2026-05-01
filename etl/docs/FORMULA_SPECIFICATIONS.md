# Energy Analytics Formula Specifications

This document defines the mathematical logic used in the Graylinx ETL pipeline, evaluates current implementations, and suggests technical improvisations for higher accuracy.

## 1. Thermal Load (TR)
Calculates the cooling capacity delivered by a chiller or the entire plant.

| Component | Current Formula | Unit Assumption |
| :--- | :--- | :--- |
| **Formula** | `TR = Flow * DeltaT * 0.33` | Metric |

### Validation
*   **Constant (0.33)**: This is derived from `(Density * Cp) / (3600 * 3.517)`. Specifically for water at ~7°C: `(1000 * 4.186) / (3600 * 3.517) ≈ 0.3307`.
*   **Status**: **VALID** for Metric sites (m³/hr, °C).

### Improvisations
1.  **Precision Constant**: Use `0.3307` instead of `0.33` to reduce rounding errors over long-term aggregations.
2.  **Density Correction**: In condenser water circuits where temperatures can reach 35°C+, water density drops. A dynamic density lookup based on `Entering Temperature` would improve accuracy by ~1-2%.

---

## 2. Efficiency Metrics (iKW/TR & COP)
Measures how much electrical power is consumed per unit of cooling produced.

| Metric | Formula | Goal |
| :--- | :--- | :--- |
| **iKW/TR** | `kW / TR` | Lower is better |
| **COP** | `3.51685 / iKWTR` | Higher is better |

### Validation
*   **Status**: **VALID**.

### Improvisations
1.  **Zero-TR Handling**: Ensure `TR` is > 0.05 before calculating. At very low loads (chiller starting up), the TR might be near zero, causing "infinite" efficiency spikes that skew averages.
2.  **System COP**: Include Auxiliary power (pumps/fans) in a "Plant COP" metric to show true site efficiency.

---

## 3. Committed Performance (Baseline)
The "Target" efficiency based on manufacturer specifications.

| Component | Logic |
| :--- | :--- |
| **Lookup** | Matrix lookup based on `Condenser Leaving Temp` and `Chiller Load %` |

### Validation
*   **Status**: **FUNCTIONAL**. The current Python implementation uses a "Snap to nearest higher" lookup.

### Improvisations
1.  **Bilinear Interpolation**: Instead of snapping to the nearest matrix point (e.g., 30°C or 31°C), use bilinear interpolation to calculate the exact value between four points. This prevents "staircase" jumps in the performance charts.
2.  **Part-Load Curves**: If a matrix isn't available, implement the **ASHRAE 90.1 / AHRI 550/590** quadratic curve fit:
    `P_adj = P_rated * (A + B*Load + C*Load²)`

---

## 4. Performance Deviation
Measures the gap between actual operation and the design baseline.

| Metric | Formula |
| :--- | :--- |
| **Deviation** | `(Actual_KW - Committed_KW) / Committed_KW` |

### Validation
*   **Status**: **VALID**.

### Improvisations
1.  **Load-Filtering**: Exclude data points where `Load < 25%`. Most chillers are highly inefficient at extremely low loads, and sensors have higher error margins, leading to "false alarms" in deviation reports.
2.  **Smoothing**: Use a 15-minute moving average for deviation to filter out momentary transients caused by valve hunting.

---

## 5. Aggregations (Rollups)
Temporal summaries (Hourly, Daily, Monthly).

| Type | Method |
| :--- | :--- |
| **Energy (kWh)** | `SUM(Interval_kWh)` |
| **Avg Power (kW)** | `AVG(Interval_kW)` |

### Validation
*   **Status**: **VALID**.

### Improvisations
1.  **Weighted Average**: For Hourly/Daily averages, always use time-weighted averages if the interval data is irregular.
2.  **Missing Data Penalty**: If > 20% of intervals are missing in an hour, mark the hour as "Partial" rather than calculating a potentially misleading total.
