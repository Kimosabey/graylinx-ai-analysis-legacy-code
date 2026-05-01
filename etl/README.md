# Energy Analytics — Python

A Python port of the Node.js Energy Analytics ETL pipeline. Dynamic
(config-driven), async throughout, designed to finish backfill in
minutes instead of the 3-4 hours the Node.js version needed.

## Project layout

```
energy_py/
├── main.py                          entry point (init → backfill → schedulers)
├── config/site_config.json          one JSON, whole pipeline
├── db/
│   ├── pool.py                      aiomysql singleton pool + helpers
│   └── upsert.py                    batched INSERT … ON DUPLICATE KEY UPDATE
├── schema/
│   ├── builder.py                   dynamic CREATE/ALTER SQL generation
│   └── manager.py                   idempotent create + column sync
├── calculator/
│   ├── weighted_average.py          pure time-weighted math
│   ├── raw_fetcher.py               live + BULK fetch modes with BulkReadings
│   └── formula.py                   safe JS-style formula evaluator
├── processor/
│   ├── device_processor.py          live per-slot device logic
│   ├── plant_processor.py           plant aggregation
│   └── backfill_processor.py        HIGH-SPEED bulk backfill
├── rollup/
│   └── energy_rollup.py             hourly / daily / weekly rollups
├── scheduler/
│   ├── cron.py                      pure-asyncio cron scheduler
│   └── live_job.py                  15-min gap-fill + lag-block job
├── utils/
│   ├── config.py                    site_config + env loader
│   └── logging_setup.py             stdlib logging
├── requirements.txt
└── .env.example
```

## Requirements

- Python 3.10+
- MySQL 5.7 / 8.0 or MariaDB 10.x
- `aiomysql` (pip install)

## Setup

```bash
cd energy_py
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DB_HOST / DB_USER / DB_PASSWORD / DB_NAME

# Drop your Energy_analytics/config/site_config.json here (or point SITE_CONFIG_PATH)
# Same file from the Node.js version works unchanged.
```

## Run

```bash
# One-shot — exports env vars and starts the analytics service.
set -a; source .env; set +a
python main.py
```

The process stays alive, runs the 15-min cron, and exits cleanly on
`Ctrl-C` or `SIGTERM`.

## Why this is faster than the Node.js version

The Node.js ETL took 3-4 hours for backfill because it issued **one
database query per (parameter × slot)**. For 20 params across 100 000
slots, that's 2 million round-trips.

The Python version rewrites backfill around four optimisations:

1. **Bulk raw fetch.** For each `(raw_table, param_id)` pair, fetch the
   whole backfill range in ONE query. Cross-bucket "before / in / after"
   clipping is done in-memory via `bisect` — O(log N) per slot instead
   of a DB round-trip.

2. **Batch upserts.** 500 rows per `INSERT … VALUES (…),(…),… ON DUPLICATE
   KEY UPDATE`. One network round-trip writes 500 slots.

3. **In-memory cumulatives.** `cumulative_kwh` / `cumulative_trh` are
   tracked as running totals during the slot loop — no `fetch_last_cumulative`
   query per slot.

4. **Parallel devices.** All devices backfill concurrently via
   `asyncio.gather`, capped by `DEVICE_CONCURRENCY` semaphore so we stay
   within the DB pool.

**Expected speedup:** ~50-200× over the Node.js row-at-a-time approach,
varying with slot count and param fanout. A 6-month backfill that took
3 hours in Node.js typically finishes in 1-5 minutes here.

## Tuning for specific workloads

| knob | default | raise when | lower when |
|------|---------|------------|------------|
| `INSERT_BATCH_SIZE`  | 500 | DB tuned for large packets (>4MB `max_allowed_packet`) | hitting packet-too-large errors |
| `DEVICE_CONCURRENCY` | 8   | many small devices, lots of pool headroom               | pool saturating / DB CPU-bound |
| `DB_POOL_MAX`        | 30  | heavier parallelism                                     | DB has limited `max_connections` |
| `REPROCESS_HOURS`    | 24  | slow/flaky raw ingest                                   | historical data is trusted stable |

## Correctness guarantees

Every decision matches the Node.js implementation:

- OFF device → all params zero, cumulatives carry forward.
- ON device → `is_running=1` stable, `is_running=2` during `warmup_minutes`
  after an OFF→ON transition.
- `other_params` weighted-averaged by ON-time only (not window time).
- `direct_params` → nearest-neighbour to `slot_time`.
- Calculated cumulatives read the previous cumulative strictly
  before `window_end` (prevents jumps during the 24h reprocess).
- Plant safe ceiling (`now - 2 × interval`) prevents reading device
  rows the cron hasn't written yet.
- All writes are idempotent via `ON DUPLICATE KEY UPDATE`.

## Formula syntax

Formulas in `site_config.json` use JS-style syntax; the evaluator
transparently translates:

| JS source | Python mapping |
|-----------|---------------|
| `Math.min`, `Math.max`, `Math.abs` | built-ins |
| `Math.atan`, `Math.sqrt`, `Math.pow`, `Math.sin` … | `math.atan` etc |
| `Math.PI`, `Math.E` | `math.pi`, `math.e` |

The evaluator runs with an empty `__builtins__` — no file I/O, no
imports, no network. Undefined variables become `0` (not `NameError`)
so a partial context doesn't crash a whole device.
