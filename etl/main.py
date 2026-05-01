"""Energy Analytics — Python entry point.

Startup sequence (mirrors Node.js index.js):
  1. Load site_config.json
  2. Initialise async DB pool
  3. Create normalized tables (CREATE IF NOT EXISTS)
  4. Sync columns for any new config params
  5. Run high-speed backfill (historical + last 24h reprocess)
  6. Start 15-min cron for live ingestion
  7. Initialise rollup tables + rollup backfill
  8. Start hourly / daily / weekly rollup crons

After schedulers start, this process stays alive. Send SIGINT/SIGTERM
to exit gracefully (pool drains, in-flight queries complete).
"""
from __future__ import annotations

import asyncio
import signal
from typing import Any

from db.pool import close_pool, init_pool
from processor.backfill_processor import run_backfill
from rollup.energy_rollup import daily_job, hourly_job, init_energy_rollup, weekly_job
from scheduler.cron import start_schedulers
from scheduler.live_job import run_processing_job
from schema.manager import initialize_all_tables, sync_table_columns
from utils.config import load_site_config
from utils.logging_setup import get_logger, setup_logging
import warnings
warnings.filterwarnings("ignore")



async def init_analytics() -> list[asyncio.Task[Any]]:
    setup_logging()
    log = get_logger("main")

    # 1. Load site config
    site_config = load_site_config()
    site = site_config["site"]
    log.info("─" * 58)
    log.info("Site    : %s", site["site_name"])
    log.info("Interval: %d minutes", site["interval_minutes"])
    log.info("Devices : %d", len(site_config["devices"]))
    log.info("Plant   : %s", (site_config.get("plant") or {}).get("normalized_table", "none"))
    log.info("─" * 58)

    # 2. DB pool
    await init_pool()

    # 3. Normalized tables
    await initialize_all_tables(site_config)

    # 4. Column sync
    await sync_table_columns(site_config)

    # 5. Backfill
    log.info("Starting normalized backfill...")
    await run_backfill(site_config)

    # 7. Rollup tables + rollup backfill (step 6 comes after — start both cron groups together)
    await init_energy_rollup(site_config)

    # 6 + 8. Start all cron schedulers
    tasks = await start_schedulers(
        every_15_min=lambda: run_processing_job(site_config),
        hourly_at_5=lambda:  hourly_job(site_config),
        daily_at_0020=lambda: daily_job(site_config),
        weekly_mon_0030=lambda: weekly_job(site_config),
    )

    log.info("✅ Fully initialized — schedulers running.")
    return tasks


async def main() -> None:
    shutdown = asyncio.Event()

    def _on_signal(*_: Any) -> None:
        logger = get_logger("main")
        logger.info("Shutdown signal received — stopping...")
        shutdown.set()

    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, _on_signal)
        except NotImplementedError:
            # Signal handlers aren't supported on Windows event loop
            pass

    try:
        tasks = await init_analytics()
    except Exception as err:
        get_logger("main").exception("Initialization failed: %s", err)
        await close_pool()
        raise

    await shutdown.wait()

    for t in tasks:
        t.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)
    await close_pool()
    get_logger("main").info("Goodbye.")


if __name__ == "__main__":
    asyncio.run(main())
