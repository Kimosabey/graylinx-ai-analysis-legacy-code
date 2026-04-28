const express = require('express');
const controller = require('./control.controller');
const {authenticate,session} = require('../../Middleware/authenticate');
const permit = require('../../Middleware/permit');

const router = express.Router();

router.post(
  '/:zone_id',
  authenticate,
  permit('superAdmin', 'admin','cluster_manager'),
  session,
  controller.control
);

module.exports = router;
