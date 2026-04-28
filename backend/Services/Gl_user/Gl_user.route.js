const express = require('express');
const controller = require('./Gl_user.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.get(
    '/technicians',
    authenticate,
    permit('superAdmin', 'admin', 'cluster_manager'),
    session,
    controller.getTechnicians
  );

router.post(
  '/sendCausesToTechnicians',
    authenticate,
    permit('superAdmin', 'admin', 'cluster_manager'),
    session,
    controller.sendToTechnicians
)

router.post(
  '/sendAlarmsToTechnicians',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.sendAlarmsToTechnicians
)

router.post(
  '/configuration_values',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.configuration_values
)

router.get(
  '/instrumentation',
  authenticate,
  permit('superAdmin', 'admin', 'cluster_manager'),
  session,
  controller.instrumentation
);
  module.exports = router;