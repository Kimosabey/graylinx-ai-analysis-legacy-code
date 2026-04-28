const express = require('express');
const controller = require('./campus.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

router.post(
  '/',
  authenticate,
  permit('superAdmin'),
  session,
  inputSanitization.campusReg,
  controller.createCampus
);

router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  controller.editCampusName
);

router.post(
  '/delete',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.deleteCampus
);

router.get(
  '/:id/device',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.deviceList
);

router.get(
  '/:id/tree',
  // authenticate,
  // permit('superAdmin', 'admin', 'user'),
  // session,

  controller.getCampustree
);

module.exports = router;
