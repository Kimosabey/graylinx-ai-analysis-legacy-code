# End-to-End Data Pipeline Flow

This document outlines the complete data journey from raw IoT/BMS sensor data to final aggregated insights.

## Pipeline Architecture Overview

The pipeline follows a tiered architecture:
1. **Raw Layer**: Source tables containing time-series data from sensors.
2. **Normalized Layer**: Device-specific and plant-wide data at the site interval (e.g., 5 mins).
3. **Aggregation Layer**: Global site-level metrics (Total KW, Plant Load).
4. **Rollup Layer**: Temporal aggregations (Hourly, Daily, Weekly).

---

## Data Flow Visualization
![End-to-End ETL Flow Infographic](assets/etl_flow_infographic.png)

---

## 1. Raw Layer (Data Ingest)
Data is pushed from on-site gateways into MySQL tables.
- **Device Tables**: Contain operational parameters (temperatures, setpoints, run status).
- **Energy Tables**: Contain electrical parameters (Voltage, Current, KW, KWH).
- **Plant Tables**: Contain global parameters like Ambient Temperature and Humidity.

## 2. Normalization Layer (Device ETL)
This is where the bulk of the logic resides.
- **Weighted Averaging**: For parameters like `KW`, the ETL calculates a time-weighted average across the interval based on the device's `run_status`.
- **Formula Evaluation**: Formulas defined in `site_config.json` (e.g., `TR = Flow * DeltaT * 0.33`) are executed. For detailed math and logic, see [FORMULA_SPECIFICATIONS.md](FORMULA_SPECIFICATIONS.md).
- **Cumulative Tracking**: Running totals for energy (`cumulative_kwh`) and heat (`cumulative_trh`) are maintained precisely, ensuring no data loss during restarts.

## 3. Aggregation Layer (Plant ETL)
Once individual devices (chillers, pumps, fans) are processed, the **Plant Processor** runs:
- **Summation**: Aggregates `Total KW` and `Total KWH` across all devices.
- **Auxiliary Calculation**: Specifically calculates "Auxiliary" power (everything except chillers).
- **Plant Load**: Calculates the total thermal load of the entire plant.

## 4. Rollup Layer (Temporal Aggregation)
The **Rollup System** runs on three schedules to optimize dashboard performance:
- **Hourly**: Aggregates 5-minute slots into hourly rows (Sum of KWH, Average of KW/TR).
- **Daily**: Summarizes performance for the entire day.
- **Weekly**: Provides long-term trends.

## 5. Persistence & Idempotency
All layers use `INSERT ... ON DUPLICATE KEY UPDATE` (Upsert). This means:
- The pipeline can be safely rerun for any historical period without creating duplicate data.
- It "self-heals" if there were gaps in processing due to downtime.

---

## Reliability Features
- **Gap Filling**: The live cron automatically checks for missing slots in the last 24 hours and fills them before processing new data.
- **Lag Handling**: The system intentionally processes data with a 15-minute lag to ensure all upstream BMS tables have finished syncing their latest readings.
- **Sandbox Evaluation**: Formulas are evaluated in a restricted environment to prevent any malicious code execution or system crashes.
