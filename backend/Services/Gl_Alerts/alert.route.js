const express = require('express');
const controller = require('./alert.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.get(
  '/:id',
  // authenticate,
  // permit('superAdmin', 'admin', 'cluster_manager'),
  // session,
  controller.alerts
);

router.get(
  '/:id/temp',
  // authenticate,
  // permit('superAdmin', 'admin', 'cluster_manager'),
  // session,
  controller.alertsTemp
);

router.post(
  '/hideMulitpleEvents',
  // authenticate,
  // permit('superAdmin', 'admin', 'cluster_manager'),
  // session,
  controller.hideMulitpleEvents
);

router.get(
  '/:zoneid/alerts',
  // authenticate,
  // permit('admin','technician'),
  // session,
  controller.alertsByZone
);

router.get(
  '/:deviceid/alerts1',
  // authenticate,
  // permit('admin','technician'),
  // session,
  controller.alertsByDevice
);

router.post(
  '/deleteAlarm',
  authenticate,
  permit('admin'),
  session,
  controller.deleteAlarm
);

router.post(
  '/acknowledgeAlarm',
  authenticate,
  permit('admin'),
  session,
  controller.acknowledgeAlarm
);

router.post(
  '/restoreAlarm',
  authenticate,
  permit('admin'),
  session,
  controller.restoreAlarm
);

router.post(
  '/insertSelectedAlarm',
  // authenticate,
  // permit('admin'),
  // session,
  controller.insertSelectedAlarm
);

router.post(
  '/insertSelectedChillerAlarm',
  // authenticate,
  // permit('admin'),
  // session,
  controller.insertSelectedChillerAlarm
);

router.post(
  '/insertIntoGlAlarm',
  // authenticate,
  // permit('admin'),
  // session,
  controller.insertIntoGlAlarm
)

module.exports = router;
