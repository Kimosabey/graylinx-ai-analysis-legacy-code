# Database Documentation - Graylinx

This directory contains comprehensive documentation for the MySQL database infrastructure supporting the Graylinx (Jupiter) platform.

## Documentation Index

| Document | Purpose |
| :--- | :--- |
| **[Schema Overview](./SCHEMA_OVERVIEW.md)** | High-level overview of the Graylinx data model and core relationships. |
| **[Table Reference](./TABLE_REFERENCE.md)** | Detailed inventory of tables in the main `jupiter` database, including sharded telemetry tables. |
| **[Routines Reference](./ROUTINES_REFERENCE.md)** | Documentation of Stored Procedures, Functions, and Events (The DB Logic). |
| **[Server Inventory](./SERVER_INVENTORY.md)** | Audit of all client/tenant databases hosted on the server (Multi-tenant architecture). |
| **[Critical Flaws](./DB_CRITICAL_FLAWS.md)** | Legacy architectural issues and security risks. |
| **[Gaps & Optimizations](./DB_GAPS_AND_OPTIMIZATIONS.md)** | Missing features and immediate performance fixes. |
| **[New Approach](./NEW_DB_APPROACH.md)** | Future roadmap for a scalable data architecture. |

## Core Database Principles

1.  **Multi-Tenancy**: Each client/site (e.g., Pothys, Phoenix) has its own dedicated database for data isolation and security.
2.  **Telemetry Sharding**: High-frequency raw data is stored in device-specific tables (`_om_p`) to optimize write performance.
3.  **Real-Time Snapshots**: The `latest_event` table provides a single source of truth for the absolute current state of all hardware.
4.  **EAV Model**: The Entity-Attribute-Value pattern is used for raw sensor readings to support flexible point naming without schema migrations.
