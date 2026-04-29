# New ETL Approach & Future Roadmap

This document outlines the proposed transition from the current legacy ETL system to a modern, scalable, and AI-ready data architecture.

## 1. The "Calculation Engine" Service
Move all transformation logic out of SQL and into a dedicated **Calculation Microservice** (Node.js or Python).
- **How it works**: The service reads raw data via an API or direct DB connection, performs all math (TR, SPC, kWh) using standard code libraries, and writes the results back to the timeseries tables.
- **Benefits**: Enables unit testing, code versioning, and easier debugging.

## 2. Message-Driven Ingestion (Streaming)
Implement a **Message Broker** (e.g., Kafka, RabbitMQ, or MQTT) to handle data ingestion.
- **How it works**: Controllers "push" data to the broker as soon as values change (COV). The backend "subscribes" to these changes.
- **Benefits**: Real-time visibility, reduced network overhead, and improved reliability (messages stay in the queue if the DB is down).

## 3. Formal Orchestration (Airflow)
Replace MySQL Events with a dedicated workflow orchestrator like **Apache Airflow**.
- **How it works**: Each ETL task is defined as a node in a Directed Acyclic Graph (DAG).
- **Benefits**: Provides a professional UI, automatic retries on failure, task dependency management, and detailed performance logging.

## 4. AI & Predictive Ready Layer
By moving to a Python-based transformation layer, we can integrate machine learning models.
- **Future State**: Real-time anomaly detection, predictive maintenance alerts, and automated setpoint optimization using models like LSTM or Prophet.

## Implementation Roadmap
1.  **Phase 1**: Implement the Data Quality Firewall (Short term).
2.  **Phase 2**: Pilot the Calculation Engine for one device type (Medium term).
3.  **Phase 3**: Full migration to Airflow and Streaming Ingestion (Long term).
