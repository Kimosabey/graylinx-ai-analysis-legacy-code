const express = require('express');
const controller = require('./zone.controller');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const permit = require('../../Middleware/permit');
const router = express.Router();

router.post(
  '/',
  authenticate,
  permit('superAdmin'),
  session,

  inputSanitization.zoneReg,
  controller.createZone
);

router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  inputSanitization.editZone,
  controller.editZoneName
);

router.post(
  '/delete',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.deleteZoneName
);

router.get(
  '/:id/lights',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.lights
);


module.exports = router;
