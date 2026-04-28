const express = require('express');
const controller = require('./light.controller');
const {authenticate,session} = require('../../Middleware/authenticate');
const permit = require('../../Middleware/permit');

const router = express.Router();

router.post(
  '/event',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.lights
);



router.post(
  '/setpoint',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.setpoint
);

router.post('/:cmd_id/commandstatus', controller.updatedevicestatus);

router.get(
  '/checkstatus',
  // authenticate,
  // permit('superAdmin', 'admin', 'user'),
  // session,
  controller.checkstatus
  )

router.get(
  '/:batchId/:batchLength/eventStatus',
  authenticate,
  permit('superAdmin', 'admin', 'user'),
  session,
  controller.eventStatus
);

router.post(
  '/floorevent',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  controller.Floorlights
);


module.exports = router;
