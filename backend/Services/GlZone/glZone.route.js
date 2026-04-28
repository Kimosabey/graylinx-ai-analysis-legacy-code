const express = require('express');
const controller = require('./glZone.controller');
const permit = require('../../Middleware/permit');
const { authenticate, session } = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');

const router = express.Router();

router.post(
  '/',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.orgReg,
  controller.createGlZone
);

router.get(
  '/:usage_type/booking_list',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.orgReg,
  controller.bookingList
)

router.get(
  '/:parent_id/child_gl_zones',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.orgReg,
  controller.childGlZones
)

router.get(
  '/:glZone_id/conference_rooms_facilities',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.orgReg,
  controller.confRoomFacility
)
router.get(
  '/:floor_id/:type/booking-status',
  // authenticate,
  // permit('superAdmin'),
  // session,

  // inputSanitization.orgReg,
  controller.bookingStatus
)

router.post(
  '/:glZone_id/configuration',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.configuration
)
//analytics for HBS dashboard
router.get(
  '/:glZone_id/cardsForDashboard',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.cardsForDashboard
)

//get clients details search based on email
router.get(
  '/:email/getUser',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.getUser
)

router.post(
  '/booking',
  // authenticate,
  // permit('superAdmin'),
  // session,

  controller.booking
)
module.exports = router;
