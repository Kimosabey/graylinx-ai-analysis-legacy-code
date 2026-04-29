# Database Gaps & Immediate Optimizations

This document outlines the specific missing features (Gaps) in the current database infrastructure and the short-term optimizations required.

## 1. Data Lifecycle Gap (The "Disk Fill" Problem)
There is currently no automated policy for archiving or deleting old telemetry data.
- **The Gap**: Telemetry data in the `_om_p` tables grows indefinitely. Eventually, the server disk will fill up, causing a system-wide crash.
- **Optimization**: Implement a 90-day retention policy for raw `_om_p` data, while keeping the aggregated `timeseries` data for long-term reporting.

## 2. Integrity Gap (Missing Constraints)
The database lacks formal Foreign Key constraints between many core tables.
- **The Gap**: You can delete a record from `gl_subsystem` while leaving "orphaned" data in `latest_event` or `gl_alarm`.
- **Optimization**: Add Foreign Key constraints with `ON DELETE CASCADE` to ensure data integrity and prevent "ghost" records in the UI.

## 3. Scalability Gap (Sharding vs. Partitioning)
- **The Gap**: The current per-device table approach is a manual form of sharding that is difficult to query across multiple devices.
- **Optimization**: Transition to **MySQL Partitioning** by `device_id` on a single, consolidated telemetry table. This maintains high performance while making the database schema much cleaner.

## 4. Query Performance (Index Audit)
- **The Gap**: Some high-frequency queries in `latest_event` and `gl_ibms_event` may not be using optimized indexes.
- **Optimization**: Conduct a full "Slow Query Audit" and add composite indexes on `(device_id, created_at)` to speed up timeseries retrieval.
