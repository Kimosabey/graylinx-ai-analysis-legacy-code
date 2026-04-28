'use strict';

/**
 * Analytics_reports.route.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All files are in the same folder — imports use relative paths.
 *
 * Endpoints:
 *   GET /analytics/config              → site config summary (device list, types)
 *   GET /analytics/device/:instance    → time-series for one device
 *                                        e.g. /analytics/device/chiller_1
 *                                             /analytics/device/condenser_pump_1
 *   GET /analytics/plant               → plant-level time-series
 *   GET /analytics/summary             → aggregated KPIs (coming soon)
 *
 * Query params for data routes:
 *   from      — start datetime  e.g. 2025-12-09 16:00:00
 *   to        — end   datetime  e.g. 2025-12-09 18:00:00
 *   interval  — optional bucket size in minutes (default: site interval_minutes)
 */

const express    = require('express');
const controller = require('./Analytics_reports.controller');

const router = express.Router();

router.get('/config',              controller.getConfig);
router.get('/device/:instance',    controller.getDeviceData);
router.get('/plant',               controller.getPlantData);
router.get('/summary',             controller.getSummary);
router.get('/btu-meter',    controller.getBtuMeterData);

module.exports = router;
