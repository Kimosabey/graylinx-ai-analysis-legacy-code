/**
 * Gl_reports.controller.js  v4.0
 * ─────────────────────────────────────────────────────────────────────────────
 * HTTP layer — parses & validates requests, delegates to service, returns JSON.
 * No business logic here.
 *
 * Routes (defined in Gl_reports.router.js):
 *   GET /config              → getConfig
 *   GET /chiller/:key        → getChillerData   (:key = CH1, CH2, etc.)
 *   GET /plant               → getPlantData
 *   GET /btu-meter           → getBtuMeterData
 *   GET /summary             → getPlantSummary
 */

'use strict';

const service    = require('./Gl_reports.service');
const { cfg }    = require('./core/DeviceRegistry');

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate and return { from, to } from query params.
 * Sends 400 and returns null if invalid — caller must guard with `if (!range) return`.
 */
function parseDateRange(req, res) {
  const { from, to } = req.query;
  if (!from || !to) {
    res.status(400).json({
      success: false,
      error: 'Query params "from" and "to" are required. Format: YYYY-MM-DD HH:mm:ss'
    });
    return null;
  }
  if (isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
    res.status(400).json({
      success: false,
      error: 'Invalid date format for "from" or "to". Use ISO 8601 or YYYY-MM-DD HH:mm:ss.'
    });
    return null;
  }
  if (new Date(from) >= new Date(to)) {
    res.status(400).json({
      success: false,
      error: '"from" must be earlier than "to".'
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
    console.error(`[Controller] ${req.method} ${req.path} →`, err.message || err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
};

const ok  = (res, data)    => res.json({ success: true,  data });
const fail = (res, msg, code = 400) => res.status(code).json({ success: false, error: msg });

// ─────────────────────────────────────────────────────────────────────────────
// GET /config
// Returns a safe summary of the project config — useful for frontend to
// dynamically build dropdowns / device selectors without exposing table names.
// ─────────────────────────────────────────────────────────────────────────────

const getConfig = wrap(async (req, res) => {
  const devices = [];

  for (const dev of cfg.devices) {
    if (dev.child_devices?.length) {
      for (const child of dev.child_devices) {
        devices.push({
          key:          child.key,
          type:         child.type,
          calc_type:    child.calc_type,
          parent_key:   dev.key,
          parent_type:  dev.type,
          in_plant_totals: child.include_in_plant_totals ?? false
        });
      }
    } else {
      devices.push({
        key:          dev.key,
        type:         dev.type,
        calc_type:    dev.calc_type,
        parent_key:   null,
        parent_type:  null,
        in_plant_totals: dev.include_in_plant_totals ?? false
      });
    }
  }

  ok(res, {
    project_id:                 cfg.project_id,
    scheduler_interval_minutes: cfg.scheduler_interval_minutes,
    time_bucket_minutes:        cfg.time_bucket_minutes,
    has_committed:              !!cfg.committed,
    has_btu_meter:              !!cfg.btu_meter,
    has_ambient:                !!cfg.ambient,
    devices
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /chiller/:key?from=&to=
// 5-min (or bucket) time series for a single TR_TRH_KWH device.
// ─────────────────────────────────────────────────────────────────────────────

const getChillerData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const { key } = req.params;
  if (!key) return fail(res, 'Device key param is required.');

  const data = await service.getChillerData(range.from, range.to, key);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /plant?from=&to=
// Combined time series for all devices in the plant.
// ─────────────────────────────────────────────────────────────────────────────

const getPlantData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const interval = parseInt(req.query.interval) || cfg.time_bucket_minutes || 15;  // ?interval=15|30|60
  const data = await service.getAllDevicesFlat(range.from, range.to, interval);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /btu-meter?from=&to=
// BTU meter time series. Returns [] if no BTU meter configured.
// ─────────────────────────────────────────────────────────────────────────────

const getBtuMeterData = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const data = await service.getBtuMeterData(range.from, range.to);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /summary?from=&to=
// Aggregated KPIs for the period — run hours, kWh, TRH, SPC, committed vs actual.
// ─────────────────────────────────────────────────────────────────────────────

const getPlantSummary = wrap(async (req, res) => {
  const range = parseDateRange(req, res);
  if (!range) return;

  const data = await service.getPlantSummary(range.from, range.to);
  ok(res, data);
});

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getConfig,
  getChillerData,
  getPlantData,
  getBtuMeterData,
  getPlantSummary
};