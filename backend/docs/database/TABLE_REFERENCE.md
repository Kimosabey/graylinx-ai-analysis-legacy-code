# Database Inventory & Table Reference

This document provides a detailed list and categorization of all tables currently active in the `jupiter` database, as discovered by the database inspection script.

## 1. System Metadata & Hierarchy
These tables define the site structure, user roles, and equipment registration.

| Table Name | Description |
| :--- | :--- |
| **`campus`** | High-level site/campus definitions. |
| **`building`** | Buildings within a campus. |
| **`floor`** | Floors within a building. |
| **`zone`** | Specific areas or rooms (lowest level of location). |
| **`organization`** | The client or entity owning the site. |
| **`gl_user`** | User credentials and profile data. |
| **`gl_subsystem`** | The master list of all equipment (Chillers, Pumps, AHUs, etc.). |
| **`gl_parameter`** | The global registry of data point types (Temperature, kW, etc.). |

## 2. Telemetry & Raw Data (EAV Model)
The system uses a device-specific table naming convention for raw data ingestion.

### Device-Specific Tables (`_om_p`)
These tables store raw point data. Format: `{DEVICE_CODE}_{ID}_om_p`.
- **Chillers**: `ch_0001b00000_om_p`, `ch_0002b00000_om_p`
- **Pumps**: `pu_0001b10000_om_p`, `secpu_0001b30000_om_p`, `condpu_0001b40000_om_p`
- **Energy Meters**: `em_0001000000_om_p` through `em_0007000000_om_p`
- **Cooling Towers**: `ct_0001b70000_om_p` through `ct_0003b70000_om_p`
- **Others**: `btm_0001110000_om_p` (BTU Meter), `coh_0001c00000_om_p` (Chiller Plant Optimizer).

### Transformed Metric Tables (`_metric`)
Processed data corresponding to the raw tables above.
- Example: `ch_0001b00000_metric`

## 3. Real-time Snapshots
These tables store the current state for immediate UI/Dashboard access.

- **`latest_event`**: A flattened table containing the most recent reading for every parameter across all zones and devices.
- **`latest_command`**: The last control signal sent to each device.
- **`device_status`**: Heartbeat and online/offline status of controllers.

## 4. Operational & Control Logic
- **`gl_control_command`**: Queue of pending control actions.
- **`hvac_schedule`**: Time-based operating rules.
- **`gl_alarm`**: Active fault and alarm records.
- **`gl_ibms_event`**: System-wide audit log.

## 5. Key Schema Definitions

### Table: `gl_subsystem`
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | varchar(36) | Primary Key (UUID). |
| `name` | varchar(256) | Human-readable name (e.g., "Chiller 01"). |
| `ss_tag` | varchar(256) | Unique identifier for logic (e.g., "CH1"). |
| `ss_type` | varchar(256) | Category (e.g., "GL_SS_CHILLER"). |
| `ss_address_value`| varchar(1024)| Device IP or BACnet ID. |
| `ss_parent` | varchar(36) | Parent subsystem for grouping. |

### Table: `latest_event`
| Field | Type | Description |
| :--- | :--- | :--- |
| `device_id` | varchar(36) | Link to `gl_subsystem`. |
| `data` | text | JSON blob of all current parameter values. |
| `network_data`| text | Internal networking metadata. |
| `created_at` | timestamp | Last update time. |
| `zone_id` | varchar(36) | Linked location ID. |
