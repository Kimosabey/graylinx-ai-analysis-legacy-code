'use strict';

/**
 * Analytics_reports.controller.js
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP layer — parses & validates requests, delegates to service, returns JSON.
 * No business logic here.
 *
 * Routes (defined in Analytics_reports.route.js):
 *   GET /analytics/config           → getConfig
 *   GET /analytics/device/:instance → getDeviceData  (:instance = chiller_1, etc.)
 *   GET /analytics/plant            → getPlantData
 *   GET /analytics/summary          → getSummary      (coming soon)
 */

'use strict';

const service = require('./Analytics_reports.service');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate and return { from, to } from query params.
 * Sends 400 and returns null if invalid.
 */
function parseDateRange(req, res) {
  const { from, to } = req.query;

  if (!from || !to) {
    res.status(400).json({
      success: false,
      error: 'Query params "from" and "to" are required. Format: YYYY-MM-DD HH:mm:ss',
    });
    return null;
  }

  if (isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
    res.status(400).json({
      success: false,
      error: 'Invalid date format. Use ISO 8601 or YYYY-MM-DD HH:mm:ss.',
    });
    return null;
  }

  if (new Date(from) >= new Date(to)) {
    res.status(400).json({
      success: false,
      error: '"from" must be earlier than "to".',
    });
    return null;
  }

  return { from, to };
}

/** Wrap async handler — catches errors, logs, sends 500. */
const wrap = fn => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error(`[Analytics Controller] ${req.method} ${req.path} →`, err.message || err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
};

const ok   = (res, data)           => res.json({ success: true, data });
const fail = (res, msg, code = 400) => res.status(code).json({ success: false, error: msg });

// ─────────────────────────────────────────────────────────────────────────────
// GET /analytics/config
// Returns safe summary of site config — device list, types, intervals.
// ─────────────────────────────────────────────────────────────────────────────

const getConfig = wrap(async (req, res) => {
  const data = service.getConfig();
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /analytics/device/:instance?from=&to=&interval=
// Time series for a single device (chiller, pump, cooling tower).
// :instance = chiller_1, condenser_pump_1, cooling_tower_1, etc.
// ?interval = optional re-bucketing in minutes (default: site interval)
// ─────────────────────────────────────────────────────────────────────────────

const getDeviceData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const { instance } = req.params;
  if (!instance) return fail(res, 'Device instance param is required.');

  const interval = req.query.interval ? parseInt(req.query.interval) : null;
  if (interval !== null && (isNaN(interval) || interval <= 0)) {
    return fail(res, 'Invalid interval. Must be a positive integer (minutes).');
  }

  const data = await service.getDeviceData(range.from, range.to, instance, interval);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /analytics/plant?from=&to=
// Time series for the whole plant from plant_normalized table.
// ─────────────────────────────────────────────────────────────────────────────

const getPlantData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const data = await service.getPlantData(range.from, range.to);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /analytics/summary?from=&to=
// Aggregated KPIs — placeholder, to be implemented after chiller API confirmed.
// ─────────────────────────────────────────────────────────────────────────────

const getSummary = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const data = await service.getSummary(range.from, range.to);
  ok(res, data);
});

const getBtuMeterData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const data = await service.getBtuMeterData(range.from, range.to);
  ok(res, data);
});


// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getConfig,
  getDeviceData,
  getPlantData,
  getSummary,
  getBtuMeterData
};
