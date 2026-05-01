"""Async MySQL pool.

aiomysql gives us the closest analogue to mysql2/promise from the Node.js
version. One global pool is created at startup and reused everywhere;
connections are acquired per-query and released immediately.

Why aiomysql over asyncmy or mysqlclient:
- Mature, battle-tested, works with MySQL 5.7 / 8.0 / MariaDB
- Pure-python fallback (no C build issues)
- Compatible with PyMySQL result shape we already know
"""
from __future__ import annotations

from typing import Any, Iterable, Sequence

import aiomysql

from utils.config import load_db_config
from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")


log = get_logger("db")

_pool: aiomysql.Pool | None = None


async def init_pool() -> aiomysql.Pool:
    """Create the singleton pool. Safe to call multiple times."""
    global _pool
    if _pool is not None:
        return _pool
    cfg = load_db_config()
    log.info("Connecting to MySQL %s:%s db=%s pool=%s..%s",
             cfg["host"], cfg["port"], cfg["db"], cfg["minsize"], cfg["maxsize"])
    _pool = await aiomysql.create_pool(**cfg)
    log.info("DB pool ready.")
    return _pool


def get_pool() -> aiomysql.Pool:
    """Return the already-initialised pool. Raises if init_pool wasn't called."""
    if _pool is None:
        raise RuntimeError("DB pool not initialised — call init_pool() first.")
    return _pool


async def close_pool() -> None:
    """Graceful shutdown — wait for inflight queries, drain connections."""
    global _pool
    if _pool is None:
        return
    _pool.close()
    await _pool.wait_closed()
    _pool = None
    log.info("DB pool closed.")


# ── Thin query helpers ────────────────────────────────────────────────────────

async def fetch_all(sql: str, params: Sequence[Any] | None = None) -> list[dict[str, Any]]:
    """Run a SELECT, return list of dict rows (column → value)."""
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql, params or ())
            rows = await cur.fetchall()
            # Some aiomysql builds return a tuple here — normalise to list so
            # downstream concatenation (`before + inwin + after`) never errors.
            return list(rows) if rows else []


async def fetch_one(sql: str, params: Sequence[Any] | None = None) -> dict[str, Any] | None:
    """SELECT expected to yield 0 or 1 rows. Returns dict or None."""
    rows = await fetch_all(sql, params)
    return rows[0] if rows else None


async def execute(sql: str, params: Sequence[Any] | None = None) -> int:
    """Run a mutation statement. Returns affected rowcount."""
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(sql, params or ())
            return cur.rowcount


async def execute_many(sql: str, rows: Iterable[Sequence[Any]]) -> int:
    """Parameterised batch execution — aiomysql's executemany under the hood.

    Used for batched INSERT ... VALUES ... ON DUPLICATE KEY UPDATE rows.
    Returns total rowcount (insert + update counts from MySQL).
    """
    rows = list(rows)
    if not rows:
        return 0
    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.executemany(sql, rows)
            return cur.rowcount