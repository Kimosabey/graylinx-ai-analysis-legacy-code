const express = require('express');
const controller = require('./dag.controller')
const {authenticate,session} = require('../../Middleware/authenticate');
const permit = require('../../Middleware/permit');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();

router.post(
'/dagRegister',
 authenticate,  
 permit('superAdmin', 'admin'),
 session,
 inputSanitization.createSchdeule,
 controller.dagRegister
)

router.get(
    '/getDDC',
     authenticate,  
     permit('superAdmin', 'admin'),
     session,
     inputSanitization.createSchdeule,
     controller.getDDCDevices
    )

router.get(
'/:Id/getDevices',
authenticate,  
permit('superAdmin', 'admin'),
session,
inputSanitization.createSchdeule,
controller.getDevices
)

router.post(
'/editAndMapDevice',
// authenticate,  
// permit('superAdmin', 'admin'),
// session,
// inputSanitization.createSchdeule,
controller.editAndMapDevice
)

router.get(
    '/:Id/getDevicesInfo',
    // authenticate,  
    // permit('superAdmin', 'admin'),
    // session,
    // inputSanitization.createSchdeule,
    controller.getDevicesInfo
    )

module.exports = router;