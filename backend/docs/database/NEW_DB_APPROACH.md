# New Database Approach & Future Roadmap

This document outlines the proposed modernization of the Graylinx data tier to support 1,000+ sites and advanced AI features.

## 1. Automated Multi-Tenant Migrations
Implement a centralized migration runner that can push schema updates to all tenant databases simultaneously.
- **Approach**: Use a tool like `Sequelize` or `Knex` to define "Migration Files."
- **Benefit**: Ensures 100% schema consistency across Pothys, Phoenix, Narayana, and all future sites.

## 2. Hybrid Analytics Layer (Columnar)
For massive datasets, move aggregated data to a columnar-store database.
- **Approach**: Keep metadata (Users, Sites, Assets) in MySQL, but push timeseries data to **ClickHouse** or **InfluxDB**.
- **Benefit**: Analytical queries that take 5 seconds in MySQL will take 50ms in ClickHouse.

## 3. Least Privilege Security Model
Remove the `root` user from the application layer.
- **Approach**: Provision a `gl_app` user with restricted permissions and use environment-specific passwords.
- **Benefit**: Limits the "Blast Radius" of a potential security breach.

## 4. Time-to-Live (TTL) & Cold Storage
Implement a tiered storage strategy.
- **Hot Data (0-30 days)**: Standard MySQL tables for immediate access.
- **Warm Data (31-365 days)**: Compressed partitions or aggregated summaries.
- **Cold Data (1 year+)**: Export to S3/MinIO in Parquet format for historical audit.

## The Path to Modernization: Better vs. Best

To evolve the Graylinx data tier, we should distinguish between immediate improvements (Better) and a complete industrial transformation (Best).

### 🔵 The "Better" Version (Evolutionary)
*Focus: Stability, Security, and Ease of Maintenance.*
- **Unified Schema**: Use a migration runner (Sequelize/Knex) to keep all 10+ tenant databases 100% in sync.
- **Security Lockdown**: Replace `root` with a restricted `gl_app` user to limit the "blast radius" of security breaches.
- **DB Partitioning**: Move from 1,000+ sharded tables to a single `telemetry` table partitioned by `device_id`.
- **Logic Extraction**: Gradually move math calculations from SQL Stored Procedures into testable Node.js code.

### 🟣 The "Best" Version (Revolutionary)
*Focus: Hyper-Scale, Real-Time Streaming, and AI Readiness.*
- **Polyglot Persistence**:
    - **PostgreSQL**: For complex Metadata and Site Configurations.
    - **ClickHouse / TimescaleDB**: For high-performance analytics on billions of telemetry rows.
- **Event-Driven Architecture (Kafka)**: Decouple hardware ingestion from the database using a message broker.
- **AI-Powered Analytics**: Implement Python-based services for real-time anomaly detection and predictive maintenance.

---

## Implementation Roadmap
1.  **Phase 1**: Security Lockdown & Non-Root User provisioning (Short term).
2.  **Phase 2**: Implementation of automated schema migrations and Logic Extraction (Medium term).
3.  **Phase 3**: Integration of a dedicated Timeseries/Columnar DB for analytics (Long term).
