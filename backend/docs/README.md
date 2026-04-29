# Graylinx Backend Documentation

This is the central documentation hub for the Graylinx (Jupiter) Backend.

## Documentation Modules

### 🛠️ [Architecture](./architecture/BE_ARCHITECTURE.md)
Detailed technical breakdown of the Node.js server, core logic engines (CPM), and real-time communication protocols.
- **[API Reference](./architecture/API_REFERENCE.md)**: REST API endpoints for frontend and external integrations.

### 📊 [Database](./database/README.md)
Comprehensive audit of the multi-tenant MySQL infrastructure, device-level sharding, and real-time data snapshots.
- **[Schema Overview](./database/SCHEMA_OVERVIEW.md)**
- **[Table Reference](./database/TABLE_REFERENCE.md)**
- **[Server Inventory](./database/SERVER_INVENTORY.md)**
- **[Critical Flaws & Optimization](./database/DB_CRITICAL_FLAWS.md)**

### ⚙️ [ETL & Data Pipelines](./etl/README.md)
Documentation of the metadata-driven analytics engine and ingestion flows.
- **[Ingestion Pipeline](./etl/INGESTION_PIPELINE.md)**
- **[Analytics Pipeline](./etl/ANALYTICS_PIPELINE.md)**
- **[Operational Pipeline](./etl/OPERATIONAL_PIPELINE.md)**
- **[Critique & Roadmap](./etl/ETL_CRITICAL_FLAWS.md)**

### 📦 [Product](./product/PRODUCT_OVERVIEW.md)
Overview of the business logic, product features, and HVAC automation strategies.

---

## Getting Started
To get a full understanding of the system, we recommend starting with the **[Product Overview](./product/PRODUCT_OVERVIEW.md)** and then moving to the **[Backend Architecture](./architecture/BE_ARCHITECTURE.md)**.
