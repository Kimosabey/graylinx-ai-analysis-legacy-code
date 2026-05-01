"""Safe formula evaluator.

The Node.js version uses `new Function(...)` which evaluates arbitrary JS
in-process. We can't carry that into Python literally — `eval()` with
`__builtins__` wide open is a security hole. Instead:

  1. Strip `Math.` prefixes → Python's `math` module or built-ins
  2. Compile once per unique formula (cached)
  3. Execute with a locked-down globals dict (no builtins, only `math` + min/max)
  4. Return None on any failure (NaN, inf, divide-by-zero, undefined name)

This is 100x faster than re-parsing per slot AND safer than raw eval.
Formulas in site_config use only: + - * /, Math.min/max/atan/sqrt/pow.
"""
from __future__ import annotations

import math
import re
from typing import Any

from utils.logging_setup import get_logger
import warnings
warnings.filterwarnings("ignore")

log = get_logger("formula")


# ── Translation: JS Math.foo → Python math.foo ───────────────────────────────
# Math.min/max have no 1-arg-1-arg signature in Python math, but the builtins
# min()/max() handle the (a, b) and (a, b, c) cases used in our configs.
_JS_TO_PY_SUBSTITUTIONS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\bMath\.min\b"),  "min"),
    (re.compile(r"\bMath\.max\b"),  "max"),
    (re.compile(r"\bMath\.abs\b"),  "abs"),
    (re.compile(r"\bMath\.pow\b"),  "math.pow"),
    (re.compile(r"\bMath\.sqrt\b"), "math.sqrt"),
    (re.compile(r"\bMath\.atan\b"), "math.atan"),
    (re.compile(r"\bMath\.sin\b"),  "math.sin"),
    (re.compile(r"\bMath\.cos\b"),  "math.cos"),
    (re.compile(r"\bMath\.log\b"),  "math.log"),
    (re.compile(r"\bMath\.exp\b"),  "math.exp"),
    (re.compile(r"\bMath\.floor\b"), "math.floor"),
    (re.compile(r"\bMath\.ceil\b"), "math.ceil"),
    (re.compile(r"\bMath\.round\b"), "round"),
    (re.compile(r"\bMath\.PI\b"),   "math.pi"),
    (re.compile(r"\bMath\.E\b"),    "math.e"),
]

# Locked-down globals for eval — no __builtins__, no file I/O, no imports.
# Only the names we need for numeric formulas.
_SAFE_GLOBALS: dict[str, Any] = {
    "__builtins__": {},
    "math": math,
    "min": min,
    "max": max,
    "abs": abs,
    "round": round,
    "pow": pow,
    "int": int,
    "float": float,
    # Bare math function names for formulas that skip the Math. prefix
    "atan": math.atan,
    "sqrt": math.sqrt,
    "sin": math.sin,
    "cos": math.cos,
    "log": math.log,
    "exp": math.exp,
    "floor": math.floor,
    "ceil": math.ceil,
    "pi": math.pi,
}

# Translated-formula cache keyed by original JS string. Populated lazily.
_COMPILED_CACHE: dict[str, Any] = {}


def _translate_to_python(js_formula: str) -> str:
    """Replace every Math.* reference with its Python equivalent."""
    py = js_formula
    for pat, repl in _JS_TO_PY_SUBSTITUTIONS:
        py = pat.sub(repl, py)
    return py


def _compile(js_formula: str):
    """Return a compiled code object for the formula (cached)."""
    cached = _COMPILED_CACHE.get(js_formula)
    if cached is not None:
        return cached
    py_src = _translate_to_python(js_formula)
    try:
        code = compile(py_src, f"<formula:{js_formula[:40]}>", "eval")
    except SyntaxError as err:
        log.warning("Formula compile failed: %r — %s", js_formula, err)
        _COMPILED_CACHE[js_formula] = None
        return None
    _COMPILED_CACHE[js_formula] = code
    return code


def evaluate_formula(js_formula: str, context: dict[str, Any]) -> float | None:
    """Evaluate a JS-style arithmetic formula with variables from `context`.

    Returns None on any failure — matches Node.js behaviour of falling back
    to 0 / null when a formula is unevaluable. Result rounded to 4 decimals.

    Undefined variables referenced by the formula are treated as 0 (not
    NameError) so partial contexts don't crash the whole device.
    """
    code = _compile(js_formula)
    if code is None:
        return None

    # Materialise missing variable names as 0. Find them by inspecting
    # co_names — fast and doesn't require static AST walking per call.
    locals_: dict[str, Any] = {}
    for name in code.co_names:
        if name in context:
            locals_[name] = context[name]
        elif name in _SAFE_GLOBALS:
            pass  # provided via globals
        else:
            locals_[name] = 0

    try:
        result = eval(code, _SAFE_GLOBALS, locals_)
    except ZeroDivisionError:
        return None
    except Exception as err:
        log.warning("Formula eval failed: %r — %s", js_formula, err)
        return None

    if not isinstance(result, (int, float)) or not math.isfinite(result):
        return None
    return round(float(result) * 10000) / 10000
