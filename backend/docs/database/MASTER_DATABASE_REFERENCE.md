# Graylinx Master Database Reference: The Comprehensive Blueprint

This document is the authoritative source for the Graylinx (Jupiter) database architecture. It consolidates information regarding site hierarchy, telemetry sharding, analytics pipelines, critical flaws, and the modernization roadmap.

---

## 🏛️ 1. Architectural Strategy
Graylinx employs a **Multi-Tenant, Polyglot Persistence** strategy designed to support industrial-scale telemetry.

- **Primary Database**: MySQL 8.0+ (Relational metadata, Operational state, & Analytics).
- **Secondary Engine**: InfluxDB (High-frequency time-series data).
- **Automation**: native MySQL Events and Stored Procedures handle the heavy lifting of ETL and math.

### Multi-Tenant Inventory
The server hosts multiple site-specific databases, each following a standardized schema but containing site-unique telemetry.

| Tenant | Focus | Status |
| :--- | :--- | :--- |
| `jupiter` | Development / Main Site | Active |
| `pothys` | High-density HVAC Analytics | Active |
| `narayana` | Standard Telemetry & Sharding | Active |
| `phoenix` | CPM & Control Logic Focus | Active |
| `breaks_india` | Specialized Industrial Telemetry | Active |

---

## 🗺️ 2. Core Schema Blueprint
The system is built on a hierarchical "Digital Twin" model.

### Spatial & Hardware Hierarchy
1.  **`organization`**: The top-level client entity.
2.  **`campus`**: A physical site.
3.  **`building`**: Specific structures within a campus.
4.  **`floor`**: Vertical levels within a building.
5.  **`zone`**: The smallest spatial unit (Rooms/Areas).
6.  **`gl_subsystem`**: The hardware registry (Chillers, VAVs, AHUs, Meters).
7.  **`gl_parameter`**: Global registry of data points (Temperature, kW, Flow).

### Mapping & Relationships
- **`gl_location_subsystem_map`**: Links physical devices to zones.
- **`gl_location_input_map`**: Stores user-driven commands (Setpoint changes).
- **`gl_location_output_map`**: Historical logs of measured sensor values.

---

## 📥 3. Telemetry Ingestion & Sharding
To maintain performance during massive data influx, Graylinx uses a **"Sharded-by-Table"** approach.

### The Raw Layer (`_om_p`)
Every field device has a dedicated table to avoid index contention on a single massive table.
- **Format**: `{TYPE}_{ID}_om_p` (e.g., `ch_0001b00000_om_p`).
- **Data Model**: Entity-Attribute-Value (EAV), storing timestamped parameter/value pairs.

### The Snapshot Layer (`latest_event`)
- **Purpose**: Powering the real-time Dashboard.
- **Structure**: A flattened table containing a JSON blob of the most recent readings for all devices.
- **`device_status`**: Tracks real-time heartbeats and gateway connectivity.

---

## 🔄 4. The Analytics & ETL Engine
Graylinx moves the "Logic" close to the "Data" by using SQL-based processing.

### The Pipeline Flow
1.  **Trigger**: native MySQL Event (`ev_analytics_run`) fires every 15 minutes.
2.  **Orchestration**: Calls `proc_run_all()`, which sequences all site procedures.
3.  **Transformation**: Device procedures (e.g., `proc_agg_CH1`) pivot raw EAV data into structured metric rows.
4.  **Math**: Stored procedures calculate complex KPIs like **Tons of Refrigeration (TR)** and **Specific Power (SPC)**.
5.  **Persistence**: Final results are written to `_metric` and `timeseries` tables.

---

## ⚠️ 5. Critical Flaws & Maintenance Gaps
*The system contains technical debt that must be managed to ensure long-term stability.*

### Legacy Issues
- **Root Dependency**: The application connects using the `root` user, creating a high security "blast radius."
- **Table Explosion**: Thousands of device tables complicate metadata management and backups.
- **EAV Bottlenecks**: Complex self-joins on EAV tables cause high CPU usage during analytics runs.

### Operational Gaps
- **Data Lifecycle**: No automated retention policy. Raw telemetry grows indefinitely, risking disk exhaustion.
- **Integrity**: Missing Foreign Key constraints lead to "orphaned" records and UI inconsistencies.
- **Scaling**: Manual sharding is difficult to query globally across all devices in a site.

---

## 🚀 6. Modernization Roadmap
The path toward a next-generation "Best" version involves three key transformations.

### Phase 1: Security & Stability (Immediate)
- Provision restricted `gl_app` users for each database.
- Implement 90-day retention policies for raw `_om_p` data.
- Add `ON DELETE CASCADE` to all hierarchy relationships.

### Phase 2: Logic Extraction (Mid-Term)
- Migrate complex math from Stored Procedures into testable Node.js/Python services.
- Implement automated schema migrations (Sequelize/Knex) to prevent "Schema Drift."

### Phase 3: Hyper-Scale (Long-Term)
- **Polyglot Persistence**: Move time-series data to **ClickHouse** or **TimescaleDB**.
- **Table Consolidation**: Replace 1,000+ sharded tables with a single partitioned `telemetry` table.
- **Kafka Integration**: Decouple hardware ingestion from the database writes using an event broker.

---
*Created on April 30, 2026 | Graylinx Engineering Documentation*
