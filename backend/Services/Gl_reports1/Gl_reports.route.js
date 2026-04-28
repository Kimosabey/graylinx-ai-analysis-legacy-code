/**
 * Gl_reports.router.js  v4.0
 * ─────────────────────────────────────────────────────────────────────────────
 * All files are in the same folder — imports use relative paths accordingly.
 *
 * Endpoints:
 *   GET /config              → project config summary (device list, types, flags)
 *   GET /chiller/:key        → time-series for one chiller  e.g. /chiller/CH1
 *   GET /plant               → time-series for whole plant
 *   GET /btu-meter           → BTU meter time-series (empty if not configured)
 *   GET /summary             → aggregated KPIs (kWh, TRH, SPC, committed vs actual)
 *
 * Query params for all data routes:
 *   from  — start datetime  e.g. 2024-01-01T00:00:00  or  2024-01-01 00:00:00
 *   to    — end   datetime  e.g. 2024-01-02T00:00:00
 */

'use strict';

const express    = require('express');
const controller = require('./Gl_reports.controller');

const router = express.Router();

router.get('/config',       controller.getConfig);
router.get('/chiller/:key', controller.getChillerData);
router.get('/plant',        controller.getPlantData);
router.get('/btu-meter',    controller.getBtuMeterData);
router.get('/summary',      controller.getPlantSummary);

module.exports = router;