"""Config loader — site config JSON + env-based DB settings.

All settings come from the standard library — no external config frameworks.
Supports optional override from environment variables so the same code
runs cleanly in dev, staging, and prod without code changes.

Automatically loads a `.env` file from the project root on first use so
Windows / cmd.exe users don't have to `source` anything — just edit `.env`
and run `python main.py`.
"""
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
from typing import Any
import warnings
warnings.filterwarnings("ignore")



_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_DEFAULT_SITE_CONFIG_PATH = _PROJECT_ROOT / "config" / "site_config.json"
_DEFAULT_ENV_PATH = _PROJECT_ROOT / ".env"

_env_loaded = False


def _load_dotenv(path: Path = _DEFAULT_ENV_PATH) -> None:
    """Minimal .env parser — no external deps.

    Handles:  KEY=value  |  KEY="quoted value"  |  KEY='value'
    Ignores:  blank lines, # comments, inline # after value.
    Does NOT overwrite vars already present in os.environ — shell wins.
    """
    global _env_loaded
    if _env_loaded:
        return
    _env_loaded = True  # set even on miss, so we don't retry every call

    if not path.exists():
        return

    try:
        with path.open("r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                # strip matching surrounding quotes
                if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                    value = value[1:-1]
                else:
                    # strip inline comment for unquoted values
                    hash_idx = value.find(" #")
                    if hash_idx != -1:
                        value = value[:hash_idx].rstrip()
                # shell-provided vars win over .env file
                if key and key not in os.environ:
                    os.environ[key] = value
    except OSError:
        # Silently skip — env-var / default fallback still applies.
        pass


def _expand_device_templates(config: dict) -> dict:
    """Expand device_types templates into full per-device dicts.

    Placeholders in param table fields:
      {device_table}   → the device's own device_table
      {btu_meter_table} → btu_meter.table from the top-level config

    Instance number is extracted from the instance name suffix (e.g. "chiller_2" → 2)
    and zero-padded to 4 digits for table name substitution ({N} → "0002").

    Per-instance extras (extra_other_params, extra_direct_params, extra_calculated_params)
    are appended after the type template's base lists.  Any other keys on the instance
    entry (e.g. use_chiller_count_in_formula, chiller_type) are copied through as-is.
    """
    device_types = config.get("device_types")
    if not device_types:
        return config  # old flat format — pass through unchanged

    btu_table = config.get("btu_meter", {}).get("table", "")
    # Keys consumed explicitly above — not copied through in the generic loop.
    _HANDLED = {
        "device_type", "instance", "ss_id",
        "device_table", "energy_table", "normalized_table", "warmup_minutes",
        "extra_other_params", "extra_direct_params", "extra_calculated_params",
        "extra_sub_params",
    }

    def _sub(t: str, device_table: str) -> str:
        return t.replace("{device_table}", device_table).replace("{btu_meter_table}", btu_table)

    def _expand_params(params: list, device_table: str) -> list:
        out = []
        for p in params:
            p2 = dict(p)
            if "table" in p2:
                p2["table"] = _sub(p2["table"], device_table)
            out.append(p2)
        return out

    expanded = []
    for entry in config["devices"]:
        tmpl = copy.deepcopy(device_types[entry["device_type"]])
        instance = entry["instance"]
        n_str = f"{int(instance.rsplit('_', 1)[-1]):04d}"

        # Per-instance device_table / energy_table / normalized_table override the
        # pattern-generated values.  This is needed when table names don't follow
        # a simple {N} numbering (e.g. energy meters with non-sequential IDs).
        device_table = (
            entry.get("device_table")
            or tmpl["device_table_pattern"].replace("{N}", n_str)
        )
        energy_table = (
            entry.get("energy_table")
            or tmpl.get("energy_table_pattern", tmpl["device_table_pattern"]).replace("{N}", n_str)
        )
        normalized_table = entry.get("normalized_table") or f"{instance}_normalized"

        device: dict[str, Any] = {
            "device_type":       entry["device_type"],
            "instance":          instance,
            "ss_id":             entry["ss_id"],
            "warmup_minutes":    entry.get("warmup_minutes", tmpl.get("warmup_minutes", 15)),
            "device_table":      device_table,
            "energy_table":      energy_table,
            "normalized_table":  normalized_table,
            "check_run_status":  config.get("site", {}).get("check_run_status", True),
            "run_status":        entry.get("run_status") or tmpl.get("run_status"),
            "other_params":      _expand_params(
                                     tmpl.get("other_params", []) + entry.get("extra_other_params", []),
                                     device_table,
                                 ),
            "direct_params":     _expand_params(
                                     tmpl.get("direct_params", []) + entry.get("extra_direct_params", []),
                                     device_table,
                                 ),
            "calculated_params": tmpl.get("calculated_params", []) + entry.get("extra_calculated_params", []),
            "sub_params":        tmpl.get("sub_params", []) + entry.get("extra_sub_params", []),
        }

        # Copy any remaining instance-specific flags (committed_config,
        # run_status_any, use_chiller_count_in_formula, chiller_type, etc.)
        for k, v in entry.items():
            if k not in _HANDLED and k not in device:
                device[k] = v

        expanded.append(device)

    result = {k: v for k, v in config.items() if k != "device_types"}
    result["devices"] = expanded
    return result


def load_site_config(path: str | Path | None = None) -> dict[str, Any]:
    """Load and return the site_config.json dict.

    Environment variable SITE_CONFIG_PATH overrides the default location.
    Supports both the new template format (with device_types) and the old
    flat format — both produce identical output dicts for the rest of the app.
    """
    _load_dotenv()
    if path is None:
        path = os.environ.get("SITE_CONFIG_PATH", _DEFAULT_SITE_CONFIG_PATH)
    path = Path(path)
    with path.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    return _expand_device_templates(raw)


def load_db_config() -> dict[str, Any]:
    """Read DB connection settings from environment, with sane defaults.

    The Node.js version reused an external pool; here we own it, so we
    read credentials from env (never hardcoded). Pool size tunes parallelism
    — bump DB_POOL_MAX for heavier backfill boxes.
    """
    _load_dotenv()
    return {
        "host":       os.environ.get("DB_HOST", "127.0.0.1"),
        "port":       int(os.environ.get("DB_PORT", "3306")),
        "user":       os.environ.get("DB_USER", "root"),
        "password":   os.environ.get("DB_PASSWORD", ""),
        "db":         os.environ.get("DB_NAME", "bms_analytics"),
        "minsize":    int(os.environ.get("DB_POOL_MIN", "5")),
        "maxsize":    int(os.environ.get("DB_POOL_MAX", "30")),
        "autocommit": True,
        "charset":    "utf8mb4",
        "pool_recycle": 3600,
    }


def load_runtime_config() -> dict[str, Any]:
    """Runtime knobs for the analytics engine. All env-tunable, all safe defaults."""
    _load_dotenv()
    return {
        "insert_batch_size":    int(os.environ.get("INSERT_BATCH_SIZE", "500")),
        "device_concurrency":   int(os.environ.get("DEVICE_CONCURRENCY", "8")),
        "reprocess_hours":      int(os.environ.get("REPROCESS_HOURS", "24")),
        "plant_safe_intervals": int(os.environ.get("PLANT_SAFE_INTERVALS", "2")),
    }