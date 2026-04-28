'use strict';
/**
 * calcEngine.controller.js
 *
 * HTTP layer for the dynamic calculation engine.
 *
 * POST /calc-engine/run           – run for a specific [from, to] range
 * POST /calc-engine/run-latest    – run for the latest completed bucket
 * GET  /calc-engine/config        – return the parsed calc_config (for debugging)
 */

const engine = require('./calcEngine');
const cfg    = require('./calc_config.json');

const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error('[calcEngine.controller]', err.message || err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
};

const ok   = (res, data)         => res.json({ success: true, data });
const fail = (res, msg, code=400) => res.status(code).json({ success: false, error: msg });

// ─── POST /run ────────────────────────────────────────────────────────────────
// Body: { "from": "2024-01-01 00:00:00", "to": "2024-01-01 01:00:00" }
// Runs the engine for every bucket in [from, to].

const runRange = wrap(async (req, res) => {
  const { from, to } = req.body ?? {};
  if (!from || !to)      return fail(res, 'Body must contain "from" and "to" datetime strings.');
  if (isNaN(Date.parse(from)) || isNaN(Date.parse(to)))
                         return fail(res, 'Invalid date format. Use ISO 8601 or YYYY-MM-DD HH:mm:ss.');
  if (new Date(from) >= new Date(to))
                         return fail(res, '"from" must be earlier than "to".');

  const result = await engine.runRange(from, to);
  ok(res, result);
});

// ─── POST /run-latest ─────────────────────────────────────────────────────────
// Runs the engine for the last completed 5-min bucket. No body needed.

const runLatest = wrap(async (req, res) => {
  const result = await engine.runLatestBucket();
  ok(res, result);
});

// ─── GET /config ──────────────────────────────────────────────────────────────
// Returns a summary of the active config (useful for debugging / frontend).

const getConfig = wrap(async (req, res) => {
  const sources = Object.entries(cfg.data_sources)
    .filter(([k]) => !k.startsWith('_'))
    .map(([name, def]) => ({ name, table: def.table, param_id: def.param_id, type: def.type }));

  const calcs = cfg.calculations.map(c => ({
    id:      c.id,
    label:   c.label,
    formula: c.formula,
    output:  c.output
  }));

  ok(res, {
    project_id:     cfg.project_id,
    bucket_minutes: cfg.bucket_minutes,
    total_sources:  sources.length,
    total_calcs:    calcs.length,
    sources,
    calculations: calcs
  });
});

module.exports = { runRange, runLatest, getConfig };
