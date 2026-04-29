# ETL Gaps & Immediate Optimizations

This document outlines the specific missing features (Gaps) in the current pipeline and the short-term optimizations required to stabilize the system.

## 1. Data Quality Gap (The "Firewall")
There is currently no validation layer between the **Raw** data and the **Analytics** data.
- **The Gap**: If a sensor fails and reports an impossible value (e.g., -100°C or 9999 kW), the ETL processes it as-is.
- **Optimization**: Implement a "Data Quality Firewall" that checks for physical bounds and sensor noise before processing metrics.

## 2. Observability Gap (The "Heartbeat")
The system lacks a health monitoring mechanism for data arrival.
- **The Gap**: You cannot easily see if a specific chiller has stopped sending data until a user notices a blank chart.
- **Optimization**: Add a "Heartbeat" monitor that alerts the team if raw data hasn't arrived for any active device within a specific timeframe.

## 3. Parallelization Gap
Ingestion is currently synchronous and single-threaded.
- **The Gap**: The system does not take advantage of modern multi-core processors.
- **Optimization**: Refactor `dataLoader.js` to use worker threads or a job queue (like BullMQ) to poll multiple controllers in parallel.

## 4. Backfill Efficiency
While backfilling exists, it is triggered per device and can be slow.
- **Optimization**: Implement a more efficient "Bulk Backfill" mode for new site commissioning that uses specialized batch-insert logic.
