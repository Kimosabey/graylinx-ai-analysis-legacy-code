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

## Implementation Roadmap
1.  **Phase 1**: Security Lockdown & Non-Root User provisioning.
2.  **Phase 2**: Implementation of automated schema migrations.
3.  **Phase 3**: Integration of a dedicated Timeseries/Columnar DB for analytics.
