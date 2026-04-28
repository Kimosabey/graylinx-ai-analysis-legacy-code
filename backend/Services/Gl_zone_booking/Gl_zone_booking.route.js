const express = require('express');
const controller = require('./Gl_zone_booking.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.post(
  '/booking',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.booking
);

router.get(
  '/:email/getUser',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.getUser
);

router.get(
  '/:parent_id/:type/searchBookable',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.searchBookable
);

router.get(
  '/:parent_id/:type/bookingList',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.bookingList
);
module.exports = router;
