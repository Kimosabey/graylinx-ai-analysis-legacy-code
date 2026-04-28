const express = require('express');
const controller = require('./bacnet.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();


router.get(
    '/:mytarget/:mytype/:myinstance/:mypropertyid/bacnetreadproperty',
    // authenticate,
    // permit('admin', 'superAdmin'),
    // session,
    controller.readproperty
  );

router.post(
    '/:mytarget/:objtype/:objInstance/:propertyId/bacnetwriteproperty',
    // authenticate,
    // permit('admin', 'superAdmin'),
    // session,
    controller.writeproperty
);



  module.exports = router;