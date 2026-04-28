const express = require('express');
const controller = require('./parking.controller');
const {authenticate,session} = require('../../Middleware/authenticate');
const permit = require('../../Middleware/permit');
const router = express.Router();

router.get(
  '/buildings/:buildingId/parking-status/:context',
  // authenticate,
  // permit('superAdmin', 'admin', 'user'),
  // session,
  controller.buildingParkingStatus
);

module.exports = router;
