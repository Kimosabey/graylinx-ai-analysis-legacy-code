# Frontend Guide - Jupiter UI

The Jupiter UI is a modern, React-based dashboard designed for monitoring and controlling industrial HVAC systems. It is built on top of the **Material Dashboard React** template by Creative Tim.

## Technical Stack
- **Framework**: React.js
- **Styling**: Material-UI (MUI) for component-based design.
- **Charts**: Chartist.js, D3.js, and custom SVG components (for Floor Maps).
- **Icons**: Material Icons.

## Project Structure (`src/`)

### 1. Views (`src/views/`)
This is where the page-level components reside. Key categories include:
- **Equipment Monitoring**: `AHU/`, `Chiller/`, `ATLDevices/`.
- **System Analysis**: `GlAnalytics/`, `Heatmap/`, `Occupancy/`.
- **Control & Configuration**: `Controls/`, `Configuration/`, `GlScheduler/`.
- **Infrastructure**: `Floors/`, `Zones/`, `Area/`.

### 2. Components (`src/components/`)
Reusable UI elements:
- **Dashboard Layouts**: Sidebars, Navbars, and Footers.
- **Data Display**: Custom Card components (`Card/`), Input fields (`CustomInput/`), and Buttons.
- **Feedback**: Snackbar notifications and Modals (`EditDeleteModal.js`).

### 3. Layouts (`src/layouts/`)
Higher-level containers that wrap the views:
- **`Admin.js`**: The main layout for authenticated users, including the Sidebar and Header.

### 4. Routes (`src/routes.js`)
Defines the mapping between URLs and View components. This is the best place to see all accessible pages in the application.

## Key Implementation Patterns

### Floor Map Interaction
The `FloorMapGenerator01.js` view is a critical component that renders interactive maps of building floors. It likely uses SVG or Canvas to display zone boundaries and device locations, allowing users to click on zones to view live data.

### Real-time Updates
The UI polls the backend APIs (discovered in the Backend documentation) to refresh live data. It frequently updates:
- **Status Cards**: Showing current power usage and efficiency.
- **TimeSeries Charts**: Visualizing trends in temperature or load.

### Global State
The application likely uses React Context or Redux (check `package.json` to confirm) to manage:
- User authentication state.
- Selected Building/Floor context.
- Global notification messages.
