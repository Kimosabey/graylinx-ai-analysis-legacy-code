"""Batch upsert helper.

The Node.js version inserted one slot at a time via ON DUPLICATE KEY UPDATE.
That's fine for live cron (3 slots every 15 min) but catastrophic for
backfill (hundreds of thousands of slots → one INSERT per slot → one
round-trip per slot → hours of wall-clock time).

This helper collects rows in memory and flushes them in configurable
batches. Each batch becomes a single `INSERT ... VALUES (...), (...), ...
ON DUPLICATE KEY UPDATE col=VALUES(col)` — atomic, indexed on slot_time,
and ~100-500x faster than row-at-a-time.
"""
from __future__ import annotations

from typing import Any

from db.pool import execute_many
from utils.config import load_runtime_config
from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")

log = get_logger("upsert")


def build_upsert_sql(table: str, columns: list[str]) -> str:
    """Build a parametrised INSERT ... ON DUPLICATE KEY UPDATE template.

    Uses one %s per column — aiomysql's executemany will repeat the
    VALUES clause per row automatically.
    """
    col_list = ", ".join(f"`{c}`" for c in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    update_clause = ", ".join(
        f"`{c}` = VALUES(`{c}`)" for c in columns if c != "slot_time"
    )
    return (
        f"INSERT INTO `{table}` ({col_list}) VALUES ({placeholders}) "
        f"ON DUPLICATE KEY UPDATE {update_clause}"
    )


def _clean(v: Any) -> Any:
    """Match Node.js rule: null/NaN/Infinity → 0."""
    if v is None:
        return 0
    if isinstance(v, float):
        if v != v:  # NaN
            return 0
        if v in (float("inf"), float("-inf")):
            return 0
    return v


class BatchUpserter:
    """Accumulates rows and flushes in batches of `batch_size`.

    Column list is locked on the first row — all subsequent rows must
    expose the same keys. Missing keys become 0, matching Node.js.

    Usage:
        up = BatchUpserter(table, batch_size=500)
        for slot in slots:
            up.add(row_dict)
        await up.flush()
    """

    def __init__(self, table: str, batch_size: int | None = None) -> None:
        self.table = table
        self.batch_size = batch_size or load_runtime_config()["insert_batch_size"]
        self._columns: list[str] | None = None
        self._sql: str | None = None
        self._rows: list[tuple[Any, ...]] = []
        self.total_written = 0

    def _lock_schema(self, row: dict[str, Any]) -> None:
        # Skip `id` — auto-increment. Keep insertion order from the dict.
        cols = [c for c in row.keys() if c != "id"]
        self._columns = cols
        self._sql = build_upsert_sql(self.table, cols)

    def add(self, row: dict[str, Any]) -> None:
        """Add a row. Flushing is manual via flush()/flush_if_full()."""
        if self._columns is None:
            self._lock_schema(row)
        tup = tuple(_clean(row.get(c)) for c in self._columns or [])
        self._rows.append(tup)

    async def flush_if_full(self) -> None:
        if len(self._rows) >= self.batch_size:
            await self.flush()

    async def flush(self) -> None:
        if not self._rows or self._sql is None:
            return
        n = len(self._rows)
        await execute_many(self._sql, self._rows)
        self.total_written += n
        self._rows.clear()
        log.debug("Flushed %d rows to %s (total=%d)", n, self.table, self.total_written)


async def upsert_row(table: str, row: dict[str, Any]) -> None:
    """Convenience: single-row upsert — used by live cron where batching is overkill."""
    cols = [c for c in row.keys() if c != "id"]
    sql = build_upsert_sql(table, cols)
    values = tuple(_clean(row.get(c)) for c in cols)
    await execute_many(sql, [values])


__all__ = ["BatchUpserter", "build_upsert_sql", "upsert_row"]
