const express = require('express');
const controller = require('./hvac_schedule.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.post(
  '/',
//   authenticate,  
//   permit('superAdmin', 'admin'),
//   session,
//   inputSanitization.createSchdeule,
  controller.createSchedule
);

router.get(
  '/hvac_fetch',
  authenticate,
  permit('superAdmin', 'admin','technician'),
  session,

  controller.schedulesList
);

router.post(
  '/:scheduleId',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,

  controller.deleteSchedule
);

router.post(
  '/:scheduleId/edit',
//   authenticate,
//   permit('superAdmin', 'admin'),
//   session,
//   inputSanitization.editSchdeule,
  controller.editSchedule
);

module.exports = router;
