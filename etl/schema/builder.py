"""Dynamic schema builder.

Mirrors the Node.js schemaBuilder.js: one normalized table per device,
columns derived from `other_params`, `direct_params`, `calculated_params`,
and `sub_params` in site_config.json.

Fixed columns:  id, ss_id, slot_time, is_running, created_at
Dynamic columns: DECIMAL(10,4) or DECIMAL(20,4) for cumulative_*

All DDL is idempotent (`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN` after
existence check) — safe to run on every startup.
"""
from __future__ import annotations

from typing import Any
import warnings
warnings.filterwarnings("ignore")



_FIXED_COLUMNS: list[tuple[str, str]] = [
    ("id",         "BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY"),
    ("ss_id",      "VARCHAR(36) NOT NULL COMMENT 'Device UUID'"),
    ("slot_time",  "DATETIME NOT NULL COMMENT 'End time of the window'"),
    ("is_running", "TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=OFF 1=ON 2=WARMUP'"),
]

_CREATED_AT = ("created_at", "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")


def _decimal_type(column: str) -> str:
    """cumulative_* columns can hit billions over years → need DECIMAL(20,4)."""
    return "DECIMAL(20,4)" if column.startswith("cumulative_") else "DECIMAL(10,4)"


def build_column_defs(device: dict[str, Any]) -> list[tuple[str, str]]:
    """Return [(name, ddl), ...] in insertion order for one device."""
    cols: list[tuple[str, str]] = list(_FIXED_COLUMNS)

    for p in device.get("other_params") or []:
        cols.append((
            p["normalized_column"],
            f"DECIMAL(10,4) DEFAULT NULL COMMENT 'Weighted avg of {p['param_id']}'",
        ))

    for p in device.get("direct_params") or []:
        cols.append((
            p["normalized_column"],
            f"DECIMAL(10,4) DEFAULT NULL COMMENT 'Latest value of {p['param_id']}'",
        ))

    for p in device.get("calculated_params") or []:
        col = p["normalized_column"]
        dtype = _decimal_type(col)
        cols.append((
            col,
            f"{dtype} DEFAULT NULL COMMENT 'Calculated: {p['formula']}'",
        ))

    for p in device.get("sub_params") or []:
        cols.append((
            p["normalized_column"],
            "DECIMAL(20,4) DEFAULT NULL",
        ))

    if device.get("device_type") == "chiller":
        cols.extend([
            ("committed_kw_per_tr",           "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Committed ikW/TR from matrix lookup'"),
            ("committed_kw",                  "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'TR × committed_kw_per_tr'"),
            ("committed_kwh",                 "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'committed_kw × interval / 60'"),
            ("performance_deviation",         "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT '(actual_kw - committed_kw) / committed_kw'"),
            ("performance_deviation_percent", "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'performance_deviation × 100'"),
        ])

    if device.get("committed_config"):
        cols.extend([
            ("committed_kw",  "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'Committed kW from chiller plant state'"),
            ("committed_kwh", "DECIMAL(10,4) NOT NULL DEFAULT 0 COMMENT 'committed_kw × interval / 60'"),
        ])

    cols.append(_CREATED_AT)
    return cols


def generate_create_table_sql(device: dict[str, Any]) -> str:
    cols = build_column_defs(device)
    col_sql = ",\n  ".join(f"`{name}` {ddl}" for name, ddl in cols)
    return (
        f"CREATE TABLE IF NOT EXISTS `{device['normalized_table']}` (\n"
        f"  {col_sql},\n"
        f"  UNIQUE KEY `uq_slot_time` (`slot_time`)\n"
        f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
        f"COMMENT='Normalized {device['device_type']} data for {device['instance']}'"
    )


def generate_alter_table_sql(device: dict[str, Any], existing_columns: set[str]) -> list[str]:
    """Return ALTER statements for every config column missing from the DB.

    Case-insensitive column comparison — MySQL is by default case-insensitive
    on column names, matching the Node.js behaviour.
    """
    existing_lower = {c.lower() for c in existing_columns}
    stmts: list[str] = []
    for name, ddl in build_column_defs(device):
        if name == "id":
            continue
        if name.lower() in existing_lower:
            continue
        stmts.append(
            f"ALTER TABLE `{device['normalized_table']}` ADD COLUMN `{name}` {ddl}"
        )
    return stmts


def generate_plant_table_sql(table: str) -> str:
    """Plant table has a richer fixed schema — cumulatives use DECIMAL(30,4)."""
    return (
        f"CREATE TABLE IF NOT EXISTS `{table}` (\n"
        f"  `id`             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n"
        f"  `slot_time`      DATETIME NOT NULL COMMENT 'End time of the window',\n"
        f"  `total_kw`       DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `total_kwh`      DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `cumulative_kwh` DECIMAL(30,4) DEFAULT 0,\n"
        f"  `total_tr`       DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `total_trh`      DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `cumulative_trh` DECIMAL(30,4) DEFAULT 0,\n"
        f"  `aux_kw`         DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `aux_kwh`        DECIMAL(20,4) DEFAULT NULL,\n"
        f"  `created_at`     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,\n"
        f"  UNIQUE KEY `uq_slot_time` (`slot_time`)\n"
        f") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 "
        f"COMMENT='Plant-level aggregated normalized data'"
    )
