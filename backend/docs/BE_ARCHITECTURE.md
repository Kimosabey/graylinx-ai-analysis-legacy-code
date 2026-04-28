# Backend Architecture - Graylinx (Jupiter)

The Graylinx backend is a robust Node.js application designed to handle high-frequency data ingestion, complex control logic, and real-time communication with HVAC hardware.

## Core Components

### 1. Entry Points
- **`app.js`**: The main entry point. Sets up the HTTPS server, configures redirection from HTTP, and initializes database settings (like `sql_mode`).
- **`glserver.js`**: Secondary entry point or specific server configuration.

### 2. Service Layers (`Services/`)
- **Auth**: Handles user authentication and MAC address verification (for licensing/security).
- **Gl_reports1**: Logic for generating aggregation procedures and analytical reports.

### 3. Logic Engines
- **CPM (Control Process Module)**: Located in `CPM/` and `CPM_modular/`.
    - `decision_engine.js`: Processes inputs and determines the next state of the system.
    - `CPM_Data_Handler.js`: Manages the flow of data within the CPM.
- **Control Module**: Located in `control_module/`.
    - `ui_controls.js`: Handles actions triggered from the frontend.
    - `alarm_module.js`: Periodic processing of alarms and notifications.
    - `schedules.js`: Manages time-based operations.

### 4. Hardware Integration
- **BACnet**: Uses `hvacBACnetClient.js` and `myBACnetUtils.js` to communicate with physical controllers.
- Supports device discovery, object listing, and point reading/writing.

### 5. Database Interaction
- **MySQL**: The primary data store.
- **`DatabasePool.js`**: Manages connections to the MySQL instance.
- **Schemas**:
    - `analytic_energy_schema.js`: Structure for energy data.
    - `gl_analytics_schema.js`: Structure for timeseries and plant metrics.

## Background Processes
The backend runs several continuous loops:
- **`runCPM()`**: Every 15 seconds, evaluates control logic and updates equipment states.
- **`runAlarms()`**: Every 5 seconds, checks for new alarm conditions from the ingested data.

## Middleware
- Custom middleware for logging, security, and CORS is found in the `Middleware/` directory.

## Configuration
- Environment variables are managed via `.env`.
- Static configuration for specific site logic is often found in `Config/` or `control_module/cpm_module/`.
