const { CREATED, OK } = require('http-status');
const service = require('./coworking.service');
// var csv = require("csvtojson");
const fastcsv = require("fast-csv");
const fs = require("fs");

const { validationResult } = require('\express-validator');

const meetingRoomBooking = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const booking_detail = req.body;
    console.log("inside controller")
    service.meetingRoomBooking(booking_detail, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ otp: result });
      }
    });
  }
};

const updateBooking = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const booking_detail = req.body;
    service.updateBooking(booking_detail, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const cancelBooking = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const booking_detail = req.body;
    service.cancelBooking(booking_detail, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const hotDesking = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const booking_detail = req.body;
    service.hotDesking(booking_detail, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ otp: result });
      }
    });
  }
};

const meetingRoomList = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor_id = req.params.id;
    const payload = req.query;
    console.log("payload: ",payload)
    service.meetingRoomList(floor_id, payload, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const hotDeskingList = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor_id = req.params.id;
    const payload = req.query;
    service.hotDeskingList(floor_id, payload, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const bookedSeatList = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor_id = req.params.id;
    const payload = req.query;
    service.bookedSeatList(floor_id, payload, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const bookedMeetingRoomList = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor_id = req.params.id;
    const payload = req.query;
    service.bookedMeetingRoomList(floor_id, payload, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const configuration = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const payload = req.body;
    service.configuration(payload, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const getClientDetails = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const email = req.params.email;
    service.getClientDetails(email, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ result: results });
      }
    });
  }
};

const uploadCWSUsersData = (req, res, next) => {
    // csv()
    // .fromFile(req.file.path)
    // .then(function(cwsUsersData){ //when parse finished, result will be emitted here.
    //   // console.log(cwsUsersData); 
    //   service.uploadCWSUsersData(cwsUsersData, (error, results) => {
    //     if (error) {
    //       next(error);
    //     } else {
    //       res.status(CREATED).json({ result: results });
    //     }
    //   });
    // })
    let stream = fs.createReadStream(req.file.path);
    let cwsUsersData = [];
    let csvStream = fastcsv
      .parse()
      .on("data", function(data) {
        cwsUsersData.push(data);
      })
      .on("end", function() {
        // remove the first line: header
        cwsUsersData.shift();

        // connect to the MySQL database
        // save csvData
        service.uploadCWSUsersData(cwsUsersData, (error, results) => {
          if (error) {
            next(error);
          } else {
            res.status(CREATED).json({ result: results });
          }
        });
      });

    stream.pipe(csvStream);
};

const cwsUsers = (req, res, next) => {
  service.cwsUsers((error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(CREATED).json({ result: results });
    }
  });
};

const deleteCwsUsers = (req, res, next) => {
  payload = req.body;
  service.deleteCwsUsers(payload, (error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(CREATED).json({ result: results });
    }
  });
};

const getEnterPriseUser = (req, res, next) => {
      userDetails = req.body;
      service.uploadCWSUsersData(userDetails, (error, results) => {
        if (error) {
          next(error);
        } else {
          res.status(CREATED).json({ result: results });
        }
      });

};

const bookingStatus = (req, res, next) => {
  const data = {
    "floor_id" : req.params.floorId,
    "floor_type" : req.params.type,
    "query" : req.query
  }
  service.bookingStatus(data, (error, parkingStatus) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(parkingStatus);
    }
  });
};

const floorBookingStatus = (req, res, next) => {
  const floor_id =  req.params.floorId;
  service.floorBookingStatus(floor_id, (error, floorBookingStatus) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(floorBookingStatus);
    }
  });
};

const getNetworkStatus = (req, res, next) => {
  service.getNetworkStatus((error, results) => {
    if (error) {
      next(error);
    } else {
      res.status(CREATED).json({ results });
    }
  });
};

module.exports = {
    meetingRoomBooking,
    updateBooking,
    cancelBooking,
    meetingRoomList,
    hotDeskingList,
    bookedSeatList,
    bookedMeetingRoomList,
    hotDesking,
    configuration,
    getClientDetails,
    uploadCWSUsersData,
    bookingStatus,
    floorBookingStatus,
    getEnterPriseUser,
    cwsUsers,
    deleteCwsUsers,
    getNetworkStatus
};
