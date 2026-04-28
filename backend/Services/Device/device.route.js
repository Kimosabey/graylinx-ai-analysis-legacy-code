const express = require('express');
const controller = require('./device.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

// Gateway-server Routes
router.get('/', controller.deviceByMac);
router.post('/:id/events', controller.captureEvent);
router.post('/bacnetevents', controller.captureBacnetEvent);

router.get(
  '/:id',
  authenticate,
  permit('admin', 'superAdmin'),
  session,
  controller.deviceById
);

router.post(
  '/',
  authenticate,
  permit('superAdmin'),
  session,

  inputSanitization.deviceReg,
  controller.registerDevice
);

router.post(
  '/edit',
  authenticate,
  permit('superAdmin', 'admin'),
  session,
  inputSanitization.editDevice,
  controller.editDeviceName
);
router.post(
  '/update',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  inputSanitization.updateDevice,
  controller.updateDevice
);
router.post(
  '/update-device',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  inputSanitization.updateDevice,
  controller.updateDeviceDetails
);

router.post(
  '/delete',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  inputSanitization.delId,
  controller.deleteDevice
);
router.post(
  '/location',
  authenticate,
  permit('superAdmin', 'admin'),
  session,

  inputSanitization.updateDeviceXY,
  controller.updateLocationById
);
router.post(
  '/license',
  // authenticate,
  // permit('superAdmin', 'admin'),
  // session,

  // inputSanitization.updateDeviceXY,
  controller.getdevices
);

router.post(
  '/registerBacnetDevice',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.deviceReg,
  controller.registerBacnetDevice
);


module.exports = router;
