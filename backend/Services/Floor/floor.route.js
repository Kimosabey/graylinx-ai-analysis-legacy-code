const express = require('express');
const controller = require('./floor.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

router.get(
  '/',
  // authenticate,
  // permit('superAdmin'),
  // session,
  // inputSanitization.floorReg,
  controller.getFloors
);

router.post(
  '/',
  authenticate,
  permit('superAdmin'),
  session,
  inputSanitization.floorReg,
  controller.createFloor
);


router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  inputSanitization.editFloor,
  controller.editFloorName
  );
  router.post(
    '/delete',
    authenticate,
    permit('superAdmin', 'admin'),
    session,
    
    controller.deleteFloor
    );
    router.get(
      '/stat/:id',
      authenticate,
      permit('superAdmin', 'admin', 'user'),
      session,
      
      controller.floorStats
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
  
  controller.summaryParameters
  );
  
  router.get(
    '/:id/lights',
    // authenticate,
    // permit('superAdmin', 'admin'),
    // session,
    controller.lights
  );
  module.exports = router;
  