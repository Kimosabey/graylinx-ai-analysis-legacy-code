const express = require('express');
const controller = require('././schedule.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');

const router = express.Router();

router.post(
  '/createWeeklySchedule',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.createWeeklySchedule
)

router.get(
  '/:buildingId/scheduleDetails',
    authenticate,
    permit('superAdmin', 'admin', 'cluster_manager'),
    session,
    controller.scheduleDetails
)

router.post(
  '/holidaysList',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.holidaysList
)

// router.post(
//   '/exceptionSchedule',
//     // authenticate,
//     // permit('superAdmin', 'admin', 'cluster_manager'),
//     // session,
//     controller.exceptionSchedule
// )

router.post(
  '/createSchedule',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.createSchedule
)
router.get(
  '/:buildingId/scheduleList',
    // authenticate,
    // permit('superAdmin', 'admin', 'cluster_manager'),
    // session,
    controller.scheduleList
)




  module.exports = router;