const express = require('express');
const controller = require('./alert.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.get(
  '/:id',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,
  controller.alerts
);

module.exports = router;
