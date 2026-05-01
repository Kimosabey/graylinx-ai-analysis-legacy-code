"""Async cron scheduler — pure asyncio, no external deps.

The Node.js version used `node-cron`. We could pull in `apscheduler`, but
for the four fixed schedules we actually need (every 15 min, :05 hourly,
00:20 daily, Mon 00:30 weekly), a hand-rolled sleeper is simpler, has
no dependency footprint, and is trivially correct.

Pattern: compute the next fire time → sleep until then → run job → repeat.
Jobs never overlap with themselves (asyncio.Lock per job) so a slow run
can't double-trigger.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta
from typing import Any, Awaitable, Callable

from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")


log = get_logger("scheduler")


def _next_every_n_minutes(now: datetime, n: int) -> datetime:
    """Next boundary of n-minute buckets (e.g. n=15 → 00, 15, 30, 45)."""
    now = now.replace(second=0, microsecond=0)
    minute_bucket = (now.minute // n) * n
    nxt = now.replace(minute=minute_bucket)
    if nxt <= now:
        nxt = nxt + timedelta(minutes=n)
    # If we were exactly on a boundary, still jump forward.
    if nxt <= now.replace(second=now.second, microsecond=now.microsecond):
        nxt = nxt + timedelta(minutes=n)
    return nxt


def _next_hourly_at_minute(now: datetime, minute: int) -> datetime:
    """Next hh:mm where minute is fixed (e.g. minute=5 → :05 of next hour or this hour)."""
    candidate = now.replace(minute=minute, second=0, microsecond=0)
    if candidate <= now:
        candidate = candidate + timedelta(hours=1)
    return candidate


def _next_daily_at(now: datetime, hour: int, minute: int) -> datetime:
    candidate = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    if candidate <= now:
        candidate = candidate + timedelta(days=1)
    return candidate


def _next_weekly_monday_at(now: datetime, hour: int, minute: int) -> datetime:
    """Next Monday hh:mm (weekday 0 = Monday in Python)."""
    candidate = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    days_ahead = (0 - candidate.weekday()) % 7
    if days_ahead == 0 and candidate <= now:
        days_ahead = 7
    return candidate + timedelta(days=days_ahead)


async def _loop_for_job(
    name: str,
    next_fn: Callable[[datetime], datetime],
    job: Callable[[], Awaitable[Any]],
) -> None:
    lock = asyncio.Lock()
    log.info("scheduled: %s — next run %s", name, next_fn(datetime.now()))

    while True:
        now = datetime.now()
        fire_at = next_fn(now)
        delay = (fire_at - now).total_seconds()
        if delay > 0:
            await asyncio.sleep(delay)
        if lock.locked():
            log.warning("%s — previous run still in progress, skipping", name)
            continue
        async with lock:
            log.info("▶ %s — firing at %s", name, datetime.now())
            try:
                await job()
            except Exception as err:
                log.exception("%s — error: %s", name, err)
            log.info("■ %s — done", name)


async def start_schedulers(
    *,
    every_15_min: Callable[[], Awaitable[Any]] | None = None,
    hourly_at_5: Callable[[], Awaitable[Any]] | None = None,
    daily_at_0020: Callable[[], Awaitable[Any]] | None = None,
    weekly_mon_0030: Callable[[], Awaitable[Any]] | None = None,
) -> list[asyncio.Task[Any]]:
    """Spawn one background task per registered schedule. Returns tasks."""
    tasks: list[asyncio.Task[Any]] = []

    if every_15_min is not None:
        tasks.append(asyncio.create_task(
            _loop_for_job("every-15-min", lambda n: _next_every_n_minutes(n, 15), every_15_min),
            name="every-15-min",
        ))
    if hourly_at_5 is not None:
        tasks.append(asyncio.create_task(
            _loop_for_job("hourly-:05", lambda n: _next_hourly_at_minute(n, 5), hourly_at_5),
            name="hourly-:05",
        ))
    if daily_at_0020 is not None:
        tasks.append(asyncio.create_task(
            _loop_for_job("daily-00:20", lambda n: _next_daily_at(n, 0, 20), daily_at_0020),
            name="daily-00:20",
        ))
    if weekly_mon_0030 is not None:
        tasks.append(asyncio.create_task(
            _loop_for_job("weekly-mon-00:30", lambda n: _next_weekly_monday_at(n, 0, 30), weekly_mon_0030),
            name="weekly-mon-00:30",
        ))

    return tasks
