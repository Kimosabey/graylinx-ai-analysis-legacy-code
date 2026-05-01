"""Schema manager — create/alter tables based on site_config.

Idempotent: safe to run on every startup. Mirrors Node.js schemaManager.js
but uses one shared async DB pool instead of passed-in connection.
"""
from __future__ import annotations

from typing import Any
import warnings
warnings.filterwarnings("ignore")


from db.pool import execute, fetch_all
from schema.builder import (
    generate_alter_table_sql,
    generate_create_table_sql,
    generate_plant_table_sql,
)
from utils.logging_setup import get_logger

log = get_logger("schema")


async def _table_columns(table: str) -> set[str]:
    rows = await fetch_all(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s",
        (table,),
    )
    return {r["COLUMN_NAME"] for r in rows if r.get("COLUMN_NAME")}


async def initialize_all_tables(site_config: dict[str, Any]) -> None:
    site = site_config["site"]
    log.info("Initializing tables for site: %s", site["site_name"])

    for device in site_config["devices"]:
        try:
            await execute(generate_create_table_sql(device))
            log.info("Ready: %s", device["normalized_table"])
        except Exception as err:
            log.error("Failed: %s — %s", device["normalized_table"], err)
            raise

    plant = site_config.get("plant")
    if plant:
        try:
            await execute(generate_plant_table_sql(plant["normalized_table"]))
            log.info("Ready: %s", plant["normalized_table"])
        except Exception as err:
            log.error("Failed plant %s — %s", plant["normalized_table"], err)
            raise

    log.info("All tables initialized.")


async def sync_table_columns(site_config: dict[str, Any]) -> None:
    """ALTER TABLE for any new config-defined column missing from the DB.

    Covers devices (incl. sub_params) and plant running_mode / direct /
    calculated params. Safe no-op when schema is already up to date.
    """
    log.info("Syncing columns...")

    for device in site_config["devices"]:
        table = device["normalized_table"]
        try:
            existing = await _table_columns(table)
            added = 0

            for sql in generate_alter_table_sql(device, existing):
                await execute(sql)
                added += 1
                log.info("Column added to %s", table)

            # sub_params — legacy DECIMAL(20,4) handled here for parity
            for sp in device.get("sub_params") or []:
                col = sp["normalized_column"]
                if col.lower() not in {c.lower() for c in existing}:
                    await execute(
                        f"ALTER TABLE `{table}` ADD COLUMN `{col}` DECIMAL(20,4) DEFAULT NULL"
                    )
                    existing.add(col)
                    added += 1
                    log.info("Column added to %s: %s", table, col)

            if added == 0:
                log.debug("No new columns: %s", table)
        except Exception as err:
            log.error("Sync failed for %s — %s", table, err)
            raise

    plant = site_config.get("plant")
    if plant:
        table = plant["normalized_table"]
        try:
            existing = await _table_columns(table)
            needed: list[tuple[str, str]] = []

            if plant.get("running_mode"):
                needed.append((
                    "plant_running_mode",
                    "VARCHAR(50) DEFAULT NULL COMMENT 'Manual / CPM On / CPM Off'",
                ))

            for p in plant.get("direct_params") or []:
                needed.append((p["normalized_column"], "DECIMAL(20,4) DEFAULT NULL"))

            for p in plant.get("calculated_params") or []:
                needed.append((p["normalized_column"], "DECIMAL(20,4) DEFAULT NULL"))

            existing_lower = {c.lower() for c in existing}
            added = 0
            for name, ddl in needed:
                if name.lower() not in existing_lower:
                    await execute(f"ALTER TABLE `{table}` ADD COLUMN `{name}` {ddl}")
                    added += 1
                    log.info("Column added to %s: %s", table, name)

            if added == 0:
                log.debug("No new columns: %s", table)
        except Exception as err:
            log.error("Sync failed for plant %s — %s", table, err)
            raise

    log.info("Column sync complete.")
