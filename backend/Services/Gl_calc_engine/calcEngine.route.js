'use strict';
/**
 * calcEngine.route.js
 *
 * Routes:
 *   GET  /calc-engine/config      → list all configured sources and calculations
 *   POST /calc-engine/run         → run for a specific date range (backfill)
 *   POST /calc-engine/run-latest  → run for the latest completed bucket
 */

const express    = require('express');
const controller = require('./calcEngine.controller');

const router = express.Router();

router.get('/config',       controller.getConfig);
router.post('/run',         controller.runRange);
router.post('/run-latest',  controller.runLatest);

module.exports = router;
