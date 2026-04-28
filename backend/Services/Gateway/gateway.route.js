const express = require('express');
const controller = require('./gateway.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

router.get(
  '/',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.gatewaysList
);
router.get(
  '/gatewayname',
  authenticate,
  permit('superAdmin', 'admin','cluster_manager'),
  session,

  controller.gatewaysName
);
router.post(
  '/',
  authenticate,
  permit('superAdmin', 'admin','cluster_manager'),
  session,
  controller.registerGateway
);
router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.editGatewayIP
);
router.post(
  '/editgwname',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,

  controller.editGatewayName
);
router.post(
  '/:id/associate',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.associateGateway
);

router.post(
  '/deleteMapping',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.deleteMapping
);

router.post(
  '/updateMapping',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.updateMapping
)
router.post(
  '/delete',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  controller.deleteGatewayIp
);

module.exports = router;
