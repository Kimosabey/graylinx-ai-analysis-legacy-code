# Database Critical Flaws & Legacy Issues

This document identifies the fundamental architectural flaws in the current Graylinx database design that present risks to security and scalability.

## 1. Security: Root User Dependency
The system currently uses the MySQL `root` user for all application-level connections.
- **Problem**: This violates the "Principle of Least Privilege." If the `.env` file is leaked, the attacker has full administrative control over the entire database server, including the ability to drop other tenant databases.
- **Impact**: High security risk for multi-tenant environments.

## 2. The "Table Explosion" Architecture
The system creates two new tables for every single device added to the system (`_om_p` and `_metric`).
- **Problem**: In a large facility with 500 devices, a single database will contain over 1,000 tables. MySQL performance (specifically metadata operations and backups) can degrade significantly as table counts climb into the thousands.
- **Impact**: Management overhead and potential performance "cliff" as sites scale.

## 3. Manual Migration Management
There is no automated schema migration tool (like Liquibase or Sequelize Migrations) in use.
- **Problem**: When a new column is added to `gl_subsystem`, it must be manually added to all 10+ tenant databases (Pothys, Phoenix, etc.).
- **Impact**: High probability of "Schema Drift" where different sites end up with slightly different database structures, causing mysterious bugs.

## 4. EAV Performance Bottlenecks
The Entity-Attribute-Value model (storing points as `param_id`/`param_value` rows) is used for raw telemetry.
- **Problem**: While flexible, EAV is notoriously slow for analytical queries. To see a simple chart of "Temperature vs. Power," the database must perform complex self-joins on millions of rows.
- **Impact**: Slow dashboard loading and high CPU usage during peak analytics runs.
