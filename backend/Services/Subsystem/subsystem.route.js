const express = require('express');
const controller = require('./subsystem.controller');
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
    controller.createSubsystem
  );



  router.post(
    '/:id/subSystemSetpoint',
    authenticate,
    permit('admin'),
    session,
  
    // inputSanitization.orgReg,
    controller.insertSetpoint
  );

  router.get(
    '/:id/checkCommandStatus',
    // authenticate,
    // permit('admin'),
    // session,
  
    // inputSanitization.orgReg,
    controller.checkCommandStatus
  );

  router.post(
    '/relinquishPriority',
    // authenticate,
    // permit('admin'),
    // session,
  
    // inputSanitization.orgReg,
    controller.relinquishPriority
  );
  module.exports = router;