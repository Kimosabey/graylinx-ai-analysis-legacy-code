const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./area.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();




router.post(
    '/',
    authenticate,
    permit('superAdmin'),
    session,
  
    inputSanitization.areaReg,
    controller.createarea
  );
  router.post(
    '/edit',
    authenticate,
    permit('superAdmin', 'admin'),
    session,
    inputSanitization.editArea,
    controller.editAreaName
  );

  router.post(
    '/delete',
    authenticate,
    permit('superAdmin', 'admin'),
    session,
  
    controller.deleteAreaName
  );
  router.get(
    '/:id/lights',
    // authenticate,
    // permit('superAdmin', 'admin'),
    // session,
    controller.lights
  );


module.exports = router;