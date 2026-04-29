# ETL & DAG Documentation - Graylinx

This directory documents the end-to-end data pipelines (ETLs) and directed acyclic graphs (DAGs) that power the Graylinx (Jupiter) platform.

## Overview of Data Flows

The platform employs three distinct categories of data pipelines:

1.  **Ingestion Pipeline (Extraction)**: Moves data from physical HVAC hardware (BACnet/Controllers) into raw database tables.
2.  **Analytics Pipeline (Transformation)**: A metadata-driven ETL that aggregates raw data into 15-minute metrics and daily KPIs.
3.  **Operational Pipeline (Control)**: A high-frequency loop that evaluates real-time data to make automated control decisions.

---

## Detailed Pipeline Documentation

| Pipeline | Purpose | Frequency | Key Files |
| :--- | :--- | :--- | :--- |
| **[Ingestion Pipeline](./INGESTION_PIPELINE.md)** | Hardware data acquisition | 15 Minutes | `dataLoader.js`, `hvacBACnetClient.js` |
| **[Analytics Pipeline](./ANALYTICS_PIPELINE.md)** | Performance & Energy Analytics | 15 Minutes | `analytic_report_config.json`, `generateAggregationProcedures.js` |
| **[Operational Pipeline](./OPERATIONAL_PIPELINE.md)** | Real-time Control (CPM) | 15 Seconds | `app.js`, `decision_engine.js` |
| **[Analysis & Optimization](./ANALYSIS_AND_OPTIMIZATION.md)** | Gaps & Future Roadmap | N/A | Review for future sprints |

## Glossary

-   **DAG**: In this project, DAGs refer to the hierarchical mapping of subsystems and data points, managed via the `Gl_Dag` service.
-   **EAV (Entity-Attribute-Value)**: The schema used for raw data storage (`param_id`, `param_value`).
-   **CPM**: Control Process Module - the "brain" of the HVAC automation.
-   **TR / TRH**: Tons of Refrigeration / TR Hours (Energy metrics).
