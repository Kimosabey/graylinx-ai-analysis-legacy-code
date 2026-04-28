const express = require('express');
const controller = require('./analytics.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.get(
  '/graph/occupancy',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  controller.occupancyGraph
);
router.get(
  '/cards/occupancy',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  controller.occupancyCards
);
router.get(
  '/chart/occupancy',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  controller.occupancyCharts
);

module.exports = router;
