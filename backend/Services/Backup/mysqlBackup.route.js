const express = require('express');
const controller = require('./mysqlBackup.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const router = express.Router();
router.get(
  '/',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  controller.mysqlDbBackup
);

router.get(
  '/reset',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  controller.mysqlDbReset
);

router.post(
  '/restore',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  controller.mysqlDbRestore
);

module.exports = router;
