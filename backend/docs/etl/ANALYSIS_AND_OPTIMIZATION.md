# ETL Pipeline Analysis & Optimization Plan

This document provides a critical analysis of the current Graylinx ETL infrastructure, identifies existing gaps, and proposes a roadmap for optimization and future-proofing.

## 1. Current State Analysis

### 🟢 Strengths
- **Metadata-Driven**: The Analytics ETL is highly flexible; adding new devices only requires JSON configuration rather than code changes.
- **High Efficiency**: Performing heavy transformations inside MySQL (Stored Procedures) minimizes data movement and leverages DB indexing.
- **Automatic Backfilling**: The system gracefully handles historical data ingestion by detecting gaps in the timeseries tables.

### 🔴 Critical Gaps & Weaknesses
- **Polling Latency**: The 15-minute interval for `dataLoader.js` is too slow for critical fault detection and misses high-frequency transients.
- **Single Threaded Extraction**: Ingestion is sequential; as the number of sites/devices grows, the `dataLoader` will eventually exceed its 15-minute window.
- **Lack of Data Validation**: There is no "Sanity Layer" between Raw and Analytics. A stuck sensor (e.g., constant 100°C) will corrupt all downstream KPIs without warning.
- **Observability Gap**: There is no centralized dashboard to monitor ETL health (e.g., "Is CH1 data missing for the last 2 hours?").
- **Tightly Coupled SQL**: Analytics logic is trapped in SQL procedures, making it difficult to implement advanced algorithms (ML-based anomaly detection or predictive maintenance).

---

## 2. Proposed Optimizations

### 🚀 Performance & Scalability
- **Parallel Extraction**: Refactor `dataLoader.js` to use worker threads or a job queue (like BullMQ) to poll multiple controllers in parallel.
- **Change-of-Value (COV) Ingestion**: Move from "Polling" to "Pushing" for supported BACnet devices. This reduces network traffic and provides sub-second visibility.
- **Incremental Materialized Views**: Instead of full procedure runs, use incremental updates to the `gl_plant_timeseries` to reduce DB load.

### 🛠️ Robustness & Quality
- **Data Quality Firewall**: Implement a validation step in the transformation layer to flag "impossible" values (e.g., outside physical bounds) as `NULL` or `INVALID` instead of letting them skew averages.
- **ETL Heartbeat**: Create a monitoring service that alerts the team if raw data hasn't arrived for any active device within 2x the expected interval.

---

## 3. Future Roadmap: "Modern Data Stack" Transition

| Phase | Focus | Implementation |
| :--- | :--- | :--- |
| **Phase 1: Stabilization** | Observability | Implement ETL health metrics and a "Data Gap" report in the UI. |
| **Phase 2: Modernization** | Decoupling | Move complex calculations from SQL Procedures to a dedicated "Calculation Engine" service. |
| **Phase 3: Intelligence** | Advanced Analytics | Integrate Python-based services (via the `Gl_Dag` hooks) for Predictive Maintenance. |

---

## 4. Specific Action Items

### [ ] Ingestion: Error Recovery
Implement a retry mechanism in `dataLoader.js`. If a controller fails to respond, it should retry with exponential backoff rather than waiting for the next 15-minute cycle.

### [ ] Analytics: Versioned Logic
Store the generated SQL procedures in a `history` table before overwriting them. This allows for auditing exactly what logic was used to calculate KPIs at any point in time.

### [ ] Operational: Simulation Mode
Create a "Sim-Mode" flag for the CPM. When enabled, the CPM processes data and stores its "intended" commands in a log table without sending them to the physical hardware.
