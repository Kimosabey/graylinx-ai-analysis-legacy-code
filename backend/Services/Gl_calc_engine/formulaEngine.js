'use strict';
/**
 * formulaEngine.js
 *
 * Evaluates one calculation definition against a value map.
 * Supported formula types:
 *
 *   RAW         — return a single source value as-is
 *   SUM         — sum all sources[]
 *   AVG         — average of all sources[]
 *   DELTA       — a − b
 *   RATIO       — numerator / denominator  (null if denominator = 0)
 *   MULTIPLY    — param × factor
 *   GATED_SUM   — sum power[i] only if gates[i] is ON (1)
 *   EXPRESSION  — arbitrary JS expression (safe subset, see below)
 *
 * For GATED_SUM the power[] and gates[] arrays are positionally paired.
 * If a gate param is missing / null it defaults to ON (unblocked).
 *
 * The valueMap includes both raw source reads AND any prior calc outputs
 * (chaining: later calcs can reference earlier calc ids).
 */

const isNum = v => typeof v === 'number' && isFinite(v);
const round = (v, d = 4) => isNum(v) ? Math.round(v * 10 ** d) / 10 ** d : null;

function isOn(val) {
  if (val === null || val === undefined) return true; // no gate = always on
  const s = String(val).toLowerCase().trim();
  return ['1', 'on', 'true', 'active', 'run', 'running', 'yes'].includes(s);
}

// ─── FORMULA HANDLERS ────────────────────────────────────────────────────────

const FORMULAS = {

  RAW({ inputs, values }) {
    const v = values[inputs.source];
    return isNum(v) ? round(v) : null;
  },

  SUM({ inputs, values }) {
    const sources = inputs.sources ?? [];
    let sum = 0, any = false;
    for (const s of sources) {
      const v = values[s];
      if (isNum(v)) { sum += v; any = true; }
    }
    return any ? round(sum) : null;
  },

  AVG({ inputs, values }) {
    const sources = inputs.sources ?? [];
    let sum = 0, count = 0;
    for (const s of sources) {
      const v = values[s];
      if (isNum(v)) { sum += v; count++; }
    }
    return count > 0 ? round(sum / count) : null;
  },

  DELTA({ inputs, values }) {
    const a = values[inputs.a], b = values[inputs.b];
    return isNum(a) && isNum(b) ? round(a - b) : null;
  },

  RATIO({ inputs, values }) {
    const n = values[inputs.numerator], d = values[inputs.denominator];
    if (!isNum(n) || !isNum(d) || d === 0) return null;
    return round(n / d);
  },

  MULTIPLY({ inputs, values }) {
    const v = values[inputs.param];
    const f = inputs.factor ?? 1;
    return isNum(v) ? round(v * f) : null;
  },

  GATED_SUM({ inputs, values }) {
    const powerKeys = inputs.power ?? [];
    const gateKeys  = inputs.gates ?? [];
    let sum = 0, any = false;

    for (let i = 0; i < powerKeys.length; i++) {
      const gateKey = gateKeys[i] ?? null;
      const gateVal = gateKey != null ? values[gateKey] : null;

      if (!isOn(gateVal)) continue;   // compressor / device is OFF — skip

      const pw = values[powerKeys[i]];
      if (isNum(pw)) { sum += pw; any = true; }
    }
    return any ? round(sum) : null;
  },

  // EXPRESSION: evaluates a JS expression string in a sandboxed scope.
  // The expression receives `v` (the full value map) and `math` helpers.
  // Example formula_params.expr: "(v.CH1_tr > 0) ? v.CH1_total_kw / v.CH1_tr : null"
  EXPRESSION({ inputs, values }) {
    const expr = inputs.expr;
    if (!expr) return null;
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function('v', 'isNum', 'round', `return (${expr});`);
      const result = fn(values, isNum, round);
      return isNum(result) ? round(result) : null;
    } catch (err) {
      console.warn(`[formulaEngine] EXPRESSION error: ${err.message}`);
      return null;
    }
  }
};

// ─── PUBLIC: evaluate ────────────────────────────────────────────────────────

/**
 * Evaluate a single calculation definition.
 *
 * @param {object} calc   - One entry from calc_config.calculations[]
 * @param {object} values - Current value map (raw reads + prior calc outputs)
 * @returns {number|null} - The calculated result
 */
function evaluate(calc, values) {
  const handler = FORMULAS[calc.formula];
  if (!handler) {
    console.warn(`[formulaEngine] Unknown formula type '${calc.formula}' for calc '${calc.id}'`);
    return null;
  }
  return handler({ inputs: calc.inputs ?? {}, values });
}

module.exports = { evaluate };
