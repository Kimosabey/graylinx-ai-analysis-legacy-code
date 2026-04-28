const express = require('express');
const controller = require('./Gl_zone.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.post(
    '/',
    // authenticate,
    // permit('superAdmin'),
    // session,
  
    // inputSanitization.orgReg,
    controller.createGlZone
  );

  router.get(
    '/:id',
    // authenticate,
    // permit('superAdmin'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getGlZone
  );
  router.get(
    '/:id/sch',
    // authenticate,
    // permit('superAdmin'),
    // session,
  
    // inputSanitization.orgReg,
    controller.getGlZoneForSchedule
  );



  module.exports = router;