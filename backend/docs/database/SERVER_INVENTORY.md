# Server-Wide Database Inventory

This document provides a summary of all custom databases and tables hosted on the current MySQL server. The system appears to follow a multi-tenant architecture where each site or client has a dedicated database with a standardized schema.

## 1. Tenant Databases (Client Sites)
These databases follow the standard Graylinx/Jupiter schema and represent different physical installations.

| Database Name | Primary Focus | Notable Tables |
| :--- | :--- | :--- |
| **`jupiter`** | Main Development / Default Site | Full HVAC/Lighting telemetry (`ch_`, `em_`, `pu_`). |
| **`jupiter2`** | Secondary Site / Test Environment | Standard Graylinx schema with `gl_device_summary`. |
| **`breaks_india`** | Client: Breaks India | Standard schema + specialized telemetry. |
| **`narayana`** | Client: Narayana | Standard schema + device-specific sharding. |
| **`phoenix`** | Client: Phoenix | Standard schema + `cpm_` control metrics. |
| **`pothys`** | Client: Pothys | Extremely detailed telemetry including `ahu_`, `btu_`, and analytics rollups. |
| **`shiva`** | Client: Shiva | Standard hierarchy tables without extensive sensor sharding. |

## 2. Shared & System Databases
| Database Name | Description |
| :--- | :--- |
| **`mysql`** | Internal MySQL user and permission tables. |
| **`information_schema`** | Metadata about all other databases. |
| **`performance_schema`** | Statistics on DB server performance. |
| **`sys`** | DBA management views. |

## 3. Standard Tenant Schema Patterns
Across most tenant databases, the following table patterns are observed:

### Metadata & Configuration
- `gl_subsystem`: Registry of all hardware.
- `gl_location`: Campus -> Building -> Floor -> Zone hierarchy.
- `gl_user` / `gl_role`: Access control.
- `gl_parameter`: Data point definitions.

### Telemetry (Sharded by Device)
- `[type]_[id]_om_p`: Raw telemetry (e.g., `ch_0001b00000_om_p`).
- `[type]_[id]_metric`: Derived analytics for the specific device.

### Real-Time & Analytics
- `latest_event`: Real-time sensor snapshot.
- `gl_device_timeseries`: 15-minute bucketed analytics.
- `gl_plant_summary`: Daily performance KPIs.

## 4. One-Off / Development Databases
- **`newdb`**: Minimal test database (only contains `users` table).
- **`students`**: Empty or minimal development table.
- **`pushpa`**: Development/Temp database with `employees` table.
- **`phoenix`**: Appears to be an active site with full analytics.
