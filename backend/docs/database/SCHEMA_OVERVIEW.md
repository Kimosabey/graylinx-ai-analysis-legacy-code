# Database Schema Overview - Graylinx (Jupiter)

The Graylinx system uses a MySQL database to manage both static configuration (Metadata) and dynamic data (Telemetry/Alarms).

## Core Tables

### 1. Hierarchy Tables
These tables define the "World Model" of the system.
- **`gl_location`**: Stores Organizations, Campuses, Buildings, Floors, and Zones. Uses a parent-child relationship (`zone_parent`).
- **`gl_subsystem`**: Defines equipment like Chillers, AHUs, and Pumps.
- **`gl_location_subsystem_map`**: Links equipment to specific locations (Zones).

### 2. Live Data & Events
- **`gl_subsystem_latest_event`**: Stores the absolute latest reading for every parameter of every device. This is used for real-time dashboards.
- **`gl_subsystem_output_map` / `gl_subsystem_input_map`**: Historical logs of readings (output) and control commands (input).
- **`gl_device_timeseries` / `gl_plant_timeseries`**: Aggregated data used for charting and long-term analysis.

### 3. Alarm System
- **`gl_alarm`**: Stores active and historical alarms.
    - `alarm_code`: Numeric code identifying the fault type.
    - `restore`: Flag (0 or 1) indicating if the alarm condition has cleared.
    - `acknowledged`: Flag indicating if an operator has seen the alarm.
- **`gl_ibms_event`**: Audit trail of all system events, including user actions and automated logic triggers.

### 4. Configuration & Logic
- **`gl_parameter`**: Definitions of all possible parameters (e.g., Temperature, KW) including units and display tags.
- **`default_setpoint` / `default_threshold`**: Baseline values used by the CPM logic to determine if equipment should start or if an alarm should trigger.
- **`gl_user`**: System users and their roles.

## Dynamic Tables (Device-Specific)
For large installations, the system creates dynamic tables per device or device type to optimize query performance for timeseries data (e.g., `ch_0001b00000_om_p` for Chiller 1 Output Map).

## Key Relationships
- **Zone -> Subsystem**: A many-to-many relationship managed by mapping tables.
- **Subsystem -> Parameter**: Every subsystem has multiple parameters it can report or receive.
- **Subsystem -> Alarm**: Alarms are always linked to a specific subsystem ID.
