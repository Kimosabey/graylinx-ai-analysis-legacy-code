const express = require('express');
const controller = require('./hvac_recuuring_schedule.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');


const router = express.Router();

router.post(
  '/:id/updateschedule',
//   authenticate,  
//   permit('superAdmin', 'admin'),
//   session,
//   inputSanitization.createSchdeule,
  controller.updateSchedule
);

router.get(
    '/getSchedule',
    authenticate,  
    permit('superAdmin', 'admin','technician'),
    session,
    // inputSanitization.createSchdeule,
    controller.getSchedule
  );

module.exports = router;