# GL Analytics ETL — Python Documentation

## Overview
The **GL Analytics ETL** is a high-performance Python port of the legacy Node.js Energy Analytics pipeline. It is designed to ingest raw device data, perform complex energy calculations (TR, kWh, Load, etc.), and maintain normalized tables for real-time monitoring and historical reporting.

> [!IMPORTANT]
> For a complete, end-to-end technical reference, see the [Comprehensive Technical Guide](file:///d:/Harshan/python-etl/gl_analytics_etl/docs/COMPREHENSIVE_GUIDE.md).

### Key Performance metrics
*   **Backfill Speed:** ~50-200x faster than the Node.js version.
*   **Optimization:** Bulk data fetching (1 query per stream) and batched upserts (500 rows/query).
*   **Concurrency:** Fully asynchronous using `asyncio` and `aiomysql`.

---

## Technical Architecture

> [!TIP]
> For a detailed visualization of data movement, see the [End-to-End Pipeline Flow](file:///d:/Harshan/python-etl/gl_analytics_etl/docs/END_TO_END_PIPELINE.md).

### 1. Configuration-Driven Design
The entire pipeline is governed by `config/site_config.json`. This file defines:
- **Site Metadata:** Interval, backfill start dates, and lag settings.
- **Device Templates:** Reusable definitions for Chillers, Pumps, Cooling Towers, etc.
- **Calculated Parameters:** Mathematical formulas for derived metrics.
- **Device Instances:** Mapping of specific hardware to their raw data tables.

### 2. Core Components

| Component | Path | Responsibility |
| :--- | :--- | :--- |
| **Entry Point** | `main.py` | Orchestrates startup: DB init, table sync, backfill, and scheduler launch. |
| **Backfill Engine** | `processor/backfill_processor.py` | Handles massive historical data processing with high efficiency. |
| **Live Ingestion** | `scheduler/live_job.py` | 15-minute cron job for gap-filling and lag-block processing. |
| **Formula Evaluator** | `calculator/formula.py` | Safely evaluates JS-style formulas in a sandboxed Python environment. |
| **Rollup System** | `rollup/energy_rollup.py` | Aggregates data into hourly, daily, and weekly summaries. |
| **Schema Manager** | `schema/manager.py` | Idempotent creation and synchronization of normalized database tables. |

---

## Data Schema Details

### 1. Source Tables (Raw Layer)
The ETL reads from "Raw" or "BMS" tables which typically follow a long-format (COV) structure:
- **`measured_time`**: The precise timestamp the sensor reported the value.
- **`param_id`**: The raw string identifier from the BMS (e.g., `CH_Motor_Run`, `Act_Pwr_Total`).
- **`param_value`**: The raw value (float or string).

> [!NOTE]
> For Energy Meters (`em_...` tables), the ETL often pulls `Act_Pwr_Total` to derive `kw` and `kwh`.

### 2. Normalized Tables (Output Layer)
The ETL writes to "Normalized" tables which use a wide-format structure optimized for reporting. All numeric columns use high-precision decimals.

- **Fixed Columns**:
    - **`id`**: Auto-increment primary key.
    - **`ss_id`**: Unique device instance UUID.
    - **`slot_time`**: standardized interval timestamp.
    - **`is_running`**: 0=OFF, 1=ON, 2=WARMUP.
- **Metric Columns**: Standard `DECIMAL(10,4)` (e.g., `kw`, `kwh`, `tr`).
- **Cumulative Columns**: `DECIMAL(20,4)` for devices and `DECIMAL(30,4)` for plant tables to handle multi-year energy totals.
- **Chiller-Specific Performance**:
    - **`committed_kw_per_tr`**: Target efficiency from manufacturer matrix.
    - **`performance_deviation`**: Gap between actual and target performance.

> [!TIP]
> The schema is **dynamic**. Adding a new parameter to `site_config.json` will automatically trigger an `ALTER TABLE ... ADD COLUMN` statement on the next ETL startup.

---

## Exactly What Happens: Transformation Logic

For every 5-minute slot, the Python ETL executes the following precise sequence:

1.  **Temporal Windowing**: 
    The system looks at the 5-minute window (e.g., 12:00 to 12:05). It fetches raw data not just from this window, but also the "last known point" before 12:00 to ensure continuity.

2.  **Weighted Averaging (The "On-Time" Logic)**:
    Unlike simple averages, this ETL uses **Time-Weighted Averaging**.
    - If a pump was ON for 3 minutes at 10kW and OFF for 2 minutes, the average for the slot is recorded as 10kW (weighted by ON-time), but the `kwh` is calculated only for those 3 minutes.
    - This prevents "diluting" power metrics with idle time.

3.  **Formula Sandbox Execution**:
    The system takes the processed averages and feeds them into the `calculator/formula.py` engine.
    - Example: `kwh = (kw * on_minutes) / 60`
    - It uses `math` functions safely to derive complex metrics like **Wet Bulb Temperature** or **Chiller Efficiency (kW/TR)**.

4.  **Cumulative Seeding**:
    To ensure the "Energy Meter" never resets, the ETL:
    - Looks up the `cumulative_kwh` from the *previous* normalized slot.
    - Adds the current slot's `kwh` to it.
    - Saves the new total.
    This makes the normalized table act like a high-integrity virtual energy meter.

5.  **Batched Upsert**:
    Instead of writing one by one, it collects 500 such processed rows and issues a single `INSERT ... ON DUPLICATE KEY UPDATE` command. If the slot already exists (e.g., during a re-run), it updates the existing row with the new calculation.

---

## Data Flow & Processing Logic

### Normalized Backfill
1. **Bulk Prefetch:** For each device, the system fetches all raw readings for every parameter in the entire range in a single query per stream.
2. **In-Memory Slicing:** Uses `bisect` for O(log N) time-weighted averaging without database round-trips.
3. **State Maintenance:** Cumulative counters (kWh, TRh) are tracked in-memory during the loop.
4. **Batch Writes:** Data is written back in 500-row batches using `ON DUPLICATE KEY UPDATE`.

### Live Processing (15-min Cron)
- **Step 1: Gap Fill:** Identifies and fills missing slots between the last normalized record and current raw data.
- **Step 2: Lag Block:** Processes a stable window (usually 15-30 mins ago) to ensure data completeness from upstream BMS.

---

## Mathematical Calculations

### Formula Syntax
Formulas in `site_config.json` use JavaScript-style syntax for compatibility with existing configurations:
- `Math.min(a, b)` → `min(a, b)`
- `evap_flow * (entering - leaving) * 0.33` → Heat load calculation.

### Cumulative Logic
Calculated cumulatives strictly read the previous value before the current window to prevent jumps during re-processing. This ensures long-term data integrity even if historical data is corrected.

---

## Database Optimization

- **Connection Pooling:** Managed via `db/pool.py` using `aiomysql`.
- **Batch Upserts:** Implemented in `db/upsert.py` to minimize network overhead and maximize throughput.
- **Idempotency:** Every write operation is idempotent, making it safe to rerun the ETL for any time range.

---

## Tuning & Configuration

Adjust the following environment variables in `.env` for specific hardware performance:

| Variable | Description | Recommended |
| :--- | :--- | :--- |
| `DEVICE_CONCURRENCY` | Max parallel devices during backfill | 8-16 |
| `INSERT_BATCH_SIZE` | Rows per INSERT statement | 500 |
| `REPROCESS_HOURS` | Overlap window for live runs | 24 |

---
## Application Lifecycle

The `main.py` entry point follows a strict 8-step initialization sequence to ensure data integrity:

1. **Load Config**: Reads `site_config.json` and `.env`.
2. **Init DB Pool**: Establishes `aiomysql` connection pool.
3. **Table Init**: Creates all normalized tables (`CREATE TABLE IF NOT EXISTS`).
4. **Column Sync**: Automatically adds any missing columns defined in the config.
5. **Backfill**: Runs the high-speed historical processor.
6. **Init Rollups**: Creates/Syncs rollup tables and calculates historical hourly/daily views.
7. **Start Schedulers**: Launches the `asyncio` loop for 15-min, Hourly, Daily, and Weekly crons.
8. **Graceful Wait**: The process stays alive, listening for **SIGINT/SIGTERM** to drain the DB pool before exiting.

---

## Domain Logic: Chiller Performance Matrix

A critical feature for cooling plants is the **Committed Performance** tracking. 
Located in `calculator/chiller_performance.py`, this logic:
- **Matrix Lookup**: Uses a predefined manufacturer matrix (Condenser Leaving Temp vs. Chiller Load %) to find the "Target Efficiency" (ikW/TR).
- **Deviation Calculation**: Computes exactly how far the actual power consumption deviates from the committed performance.
- **Warmup Logic**: Respects a `warmup_minutes` setting where performance metrics are ignored immediately after a chiller starts, allowing pressures to stabilize.

---

## Operation & Maintenance

### 1. Verification (Smoke Tests)
The project includes `smoke_tests.py` which allows developers to verify the core math without needing a database connection.
- **Formula Parity**: Ensures Python formula evaluation matches Node.js results.
- **Weighted Average Accuracy**: Verifies the "last-reading +30s" rule and ON-time gating.
- **Bulk Slicing**: Validates that in-memory data slicing (`bisect`) is correct.

### 2. Monitoring & Logging
The system uses a structured logging setup (defined in `utils/logging_setup.py`).
- **`backfill.log`**: Tracks historical processing progress and speed.
- **`live-cron.log`**: Monitors 15-minute ingestion and gap-filling.
- **Error Tracking**: Any database or formula errors are logged with full stack traces but do not crash the entire pipeline (per-device isolation).

### 3. Graceful Shutdown
To prevent data corruption or partial writes, the ETL handles termination signals. It will:
1. Stop all schedulers.
2. Complete any in-flight batch upserts.
3. Close and drain the MySQL connection pool.
4. Log "Goodbye" before exiting.

---

> [!IMPORTANT]
> Always run `python smoke_tests.py` after modifying `site_config.json` formulas to ensure no syntax errors were introduced.
