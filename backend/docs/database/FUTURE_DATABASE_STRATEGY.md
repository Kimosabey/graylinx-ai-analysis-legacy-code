# Graylinx Database Modernization: The Better vs. Best Roadmap

This document outlines a phased architectural evolution for the Graylinx (Jupiter) data tier. It aims to eliminate current security risks, resolve scalability bottlenecks (Table Explosion), and prepare the platform for AI-driven predictive maintenance.

---

## 🛑 1. Current Architectural Constraints
*Before moving forward, we must address these legacy bottlenecks:*
- **Security**: Application-level dependency on the `root` user.
- **Complexity**: Thousands of per-device tables (`_om_p`) causing metadata bloat.
- **Maintenance**: No automated schema migrations, leading to "Schema Drift" across tenants.
- **Logic**: Critical business math trapped in SQL Stored Procedures, making testing impossible.

---

## 🔵 2. The "Better" Architecture: Evolutionary Improvement
*Goal: Stability, Security, and Clean-up using existing MySQL infrastructure.*

### Key Transformations
1.  **Least Privilege Security**:
    - Provision site-specific `gl_app` users with restricted permissions (SELECT/INSERT/UPDATE only).
    - Remove `root` credentials from `.env` files.
2.  **Table Consolidation (MySQL Partitioning)**:
    - Replace 1,000+ sharded tables with a single, consolidated `telemetry_raw` table.
    - Use **MySQL Partitioning** by `(site_id, device_id)` to maintain performance while simplifying the schema.
3.  **Automated Schema Management**:
    - Introduce a migration runner (e.g., **Sequelize Migrations** or **Knex**).
    - Ensure 100% schema consistency across all tenant databases with one command.
4.  **Logic Extraction (v1)**:
    - Begin moving mathematical calculations (like TR and SPC) from Stored Procedures into Node.js utility services.
5.  **Automated Data Lifecycle**:
    - Implement a 90-day "Rolling Window" retention policy.
    - Raw data older than 90 days is deleted; only aggregated 15-min metrics are kept for long-term charts.

---

## 🟣 3. The "Best" Architecture: Revolutionary Transformation
*Goal: Hyper-Scale, Real-Time Streaming, and AI-Readiness.*

### The "Best" Tech Stack
- **Metadata**: **PostgreSQL** (Superior for complex relationships and site configurations).
- **Telemetry**: **ClickHouse** or **TimescaleDB** (High-performance columnar storage for billions of rows).
- **Ingestion**: **Apache Kafka** (Decouple hardware polling from database writing).
- **Cold Storage**: **MinIO / AWS S3** (Historical data archived in Parquet format for AI training).

### Key Transformations
1.  **Polyglot Persistence**: 
    - Use the right tool for the right job. PostgreSQL for Users/Hierarchy; ClickHouse for ultra-fast sensor analytics.
2.  **Event-Driven Ingestion**:
    - Hardware gateways publish data to Kafka.
    - Multiple consumers (Database Writer, Real-time Dashboard, Anomaly Detector) process data in parallel without blocking each other.
3.  **Intelligence Layer (Python/AI)**:
    - Dedicated Python services consume the "Best" data tier to perform real-time predictive maintenance and fault detection.
4.  **Serverless Analytics**:
    - Use an API layer to query historical data directly from S3/MinIO for long-term auditing without taxing the live database.

---

## 📊 4. Comparison: Better vs. Best

| Feature | Current (Legacy) | Better (Evolution) | Best (Revolution) |
| :--- | :--- | :--- | :--- |
| **User Access** | `root` (Dangerous) | Restricted `gl_app` | Identity-based Vault |
| **Table Structure** | 1,000+ tables (Bloated) | Partitioned (Clean) | Columnar / Timeseries |
| **Ingestion** | Direct Polling | Batch Loading | Streaming (Kafka) |
| **Logic** | SQL Procedures | Node.js Services | Python / AI Services |
| **Analytics Speed** | Slow (seconds) | Faster (ms) | Instant (<10ms) |
| **Scalability** | Site-Limited | Region-Limited | Global / Cloud-Scale |

---

## 🗺️ 5. Proposed Implementation Strategy

### Phase 1 (Short Term): The "Better" Path
1.  **Migration**: Create a script to move data from `_om_p` tables into a single partitioned `telemetry` table.
2.  **Security**: Provision restricted users and update the backend `DatabasePool.js`.
3.  **Tooling**: Initialize **Sequelize Migrations** in the backend repo.

### Phase 2 (Long Term): The "Best" Path
1.  **POC**: Set up a **ClickHouse** instance and stream data for one site (e.g., Pothys) in parallel with MySQL.
2.  **Validation**: Compare dashboard performance between MySQL and ClickHouse.
3.  **Transition**: Slowly migrate site-by-site to the new stack.

---
*Created on April 30, 2026 | Graylinx Engineering Documentation*
