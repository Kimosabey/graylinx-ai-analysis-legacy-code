"""Structured logging — stdlib logging, no external deps.

One formatter, one handler, component-tagged loggers. Matches the
`[Module] message` style from the Node.js version for easy log diffing.
"""
from __future__ import annotations

import logging
import os
import sys
import warnings
warnings.filterwarnings("ignore")


_configured = False


def setup_logging(level: str | None = None) -> None:
    """Install a single handler with a compact format. Idempotent."""
    global _configured
    if _configured:
        return

    lvl = (level or os.environ.get("LOG_LEVEL", "INFO")).upper()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter(
            fmt="%(asctime)s [%(name)s] %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
    )
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(getattr(logging, lvl, logging.INFO))

    # Silence aiomysql's noisy DEBUG — we don't need every query logged.
    logging.getLogger("aiomysql").setLevel(logging.WARNING)

    _configured = True


def get_logger(name: str) -> logging.Logger:
    """Return a module logger. Call `setup_logging()` once at entry point."""
    return logging.getLogger(name)
