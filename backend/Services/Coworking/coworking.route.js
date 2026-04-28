const express = require('express');
const controller = require('./coworking.controller');
const permit = require('../../Middleware/permit');
const {authenticate,session} = require('../../Middleware/authenticate');
const inputSanitization = require('../../Middleware/sanitization');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, path.join(__dirname, '../../Uploads/'));
  },
  filename: function(req, file, callback) {
    var files = "client_user_data";
    callback(null, files);
  }
});


const uploadCsvFile = multer({
  storage: storage,
  fileFilter: function(req, file, callback) {
    var ext = path.extname(file.originalname);
    if (
      ext !== '.csv'
    ) {
      return callback(new Error('Only csv files are allowed'));
    }
    // if (file.originalname.length > 20) {
    //   return callback(new Error('Filename very large'));
    // }
    callback(null, true);
  },
  limits: {
    fileSize: 1327 * 1127
  }
});

router.post(
  '/upload_cws_users_data',
  // authenticate,
  // permit('superAdmin'),
  // session,
  uploadCsvFile.single('file'),
  controller.uploadCWSUsersData
);

router.get(
  '/network-status',
  authenticate,
  permit('admin','technician'),
  session,
  controller.getNetworkStatus
);

router.get(
  '/cws_users',
  // authenticate,
  // permit('superAdmin'),
  // session,
  controller.cwsUsers
);

router.post(
  '/delete_cws_users',
  // authenticate,
  // permit('superAdmin'),
  // session,
  controller.deleteCwsUsers
);
// router.post(
//   '/get_enterprise_user',
//   // authenticate,
//   // permit('superAdmin'),
//   // session,
//   controller.getEnterPriseUser
// )

router.post(
  '/meeting_room_booking',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.meetingRoomBooking
);

router.get(
  '/:id/hot_desking_list',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.hotDeskingList
);

router.get(
  '/:id/booked_seat_list',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.bookedSeatList
);

router.get(
  '/:id/booked_meeting-room_list',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.bookedMeetingRoomList
);

router.get(
  '/:id/meeting_room_list',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.meetingRoomList
);

router.post(
  '/update_booking',
  //   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.updateBooking,
 controller.updateBooking
);

router.post(
  '/cancel_booking',
  //   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.updateBooking,
 controller.cancelBooking
);

router.get(
  '/:email/get_client_details',
  //   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.updateBooking,
 controller.getClientDetails
)

router.post(
  '/hot_desking',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.hotDesking
);

router.post(
  '/configuration',
//   authenticate,
//   permit('superAdmin'),
//   session,
 // inputSanitization.meetingRoomBooking,
  controller.configuration
);

router.get(
  '/:floorId/:type/booking-status',
  // authenticate,
  // permit('superAdmin', 'admin', 'user','cluster_manager'),
  // session,
  controller.bookingStatus
);

router.get(
  '/:floorId/booking-status',
  // authenticate,
  // permit('superAdmin', 'admin', 'user','cluster_manager'),
  // session,
  controller.floorBookingStatus
);

module.exports = router;
