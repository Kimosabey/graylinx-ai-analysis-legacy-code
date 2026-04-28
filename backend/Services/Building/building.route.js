const express = require('express');
const controller = require('./building.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.post(
  '/',
  authenticate,
  permit('superAdmin'),
  session,
  inputSanitization.buildingReg,
  controller.createBuilding
);

router.get(
  '/:id/lights',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.lights
);

router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  inputSanitization.editBuildingName,
  controller.editBuildingName
);

router.post(
  '/delete',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  
  controller.deleteBuilding
);

router.get(
  '/:id/device',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  
  controller.devicesList
);

router.get(
  '/:id/lux-summary',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  
  controller.luxSummary
);

router.get(
  '/:id/summary-parameters',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  
  controller.summaryParameter
);

module.exports = router;
