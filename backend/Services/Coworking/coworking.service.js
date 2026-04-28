const _ = require('lodash');
const uuid = require('uuid/v4');
const model = require('./coworking.model');
const nodemailer = require('nodemailer')
const mailer = (param,payload) => {
  var transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
      user: 'prashant.singh@graylinx.ai',
      pass: 'Kiran@12345'
    }
  });
  if(param == "meeting_room_booking") {
    var mailOptions = {
      from: 'prashant.singh@graylinx.ai',
      to: payload.email_id,
      subject: 'Meeting room Booking Confirmation',
      text: 'Hi '+payload.person_name+',\n\nYour Booking request for meeting room from '+payload.duration_from+' to '+payload.duration_to+' is confirmed. Your OTP is '+payload.otp+'\n\nRegards,\nGraylinx Team'
    };
  }
  else if(param == "hot_desking_booking") {
    var mailOptions = {
      from: 'prashant.singh@graylinx.ai',
      to: payload.email_id,
      subject: 'Seat Booking Confirmation',
      text: 'Hi '+payload.person_name+',\n\nYour Booking request for Seats in Co_working area from '+payload.duration_from+' to '+payload.duration_to+' is confirmed. Your OTP is '+payload.otp+'\n\nRegards,\nGraylinx Team'
    };
  }
  else if(param == "update_booking") {
    var mailOptions = {
      from: 'prashant.singh@graylinx.ai',
      to: payload.email_id,
      subject: 'Meeting Room Update Confirmation',
      text: 'Hi '+payload.person_name+',\n\nYour Meeting room booking timing Updated from '+payload.duration_from+' to '+payload.duration_to+'.Your OTP is '+payload.otp+'\n\nRegards,\nGraylinx Team'
    };
  }
  else if(param == "cancel_booking") {
    var mailOptions = {
      from: 'prashant.singh@graylinx.ai',
      to: payload.email_id,
      subject: 'Cancel Meeting Room Booking',
      text: 'Hi '+payload.person_name+',\n\nYour Meeting room booking has been Canceled.\n\nRegards,\nGraylinx Team'
    };
  }
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
const meetingRoomBooking = (booking_detail, callback) => {
  var otp = generateOTP();  
  const payload = {
      id: uuid(),
      meeting_room_id: booking_detail.meeting_room_id,
      duration_from: booking_detail.from,
      duration_to: booking_detail.to,
      user_id: booking_detail.user_id,
      params : booking_detail.params,
      usage_type: booking_detail.usage_type,
      // person_name: booking_detail.person_name,
      // email_id: booking_detail.email_id,
      // contact_no: booking_detail.contact_no,
      otp: otp
    };
    model.meetingRoomBooking(payload, (err, result) => {
      if (err) {
        callback(err);
      } else {
        mailer("meeting_room_booking",payload)
        callback(null, result);
      }
    });
};

const updateBooking = (booking_detail, callback) => {
  //var otp = generateOTP();  
  const payload = {
      booking_ids: booking_detail.booking_ids,
      duration_from: booking_detail.from,
      duration_to: booking_detail.to
    };
    console.log("payload: ",payload)
    model.updateBooking(payload, (err, result) => {
      if (err) {
        callback(err);
      } else {
        
        console.log("result: ",result)
        if(result != "Meeting has been Started") {
          mailer("update_booking",payload)
        }
        callback(null, result);
      }
    });
};

const cancelBooking = (booking_detail, callback) => {
  const payload = {
      booking_ids: booking_detail.booking_ids
    };
    model.cancelBooking(payload, (err, result) => {
      if (err) {
        callback(err);
      } else {
        if(result != "Meeting has been Started") {
          mailer("cancel_booking",payload)
        }
        callback(null, result);
      }
    });
};

const meetingRoomList = (floor_id, payload, callback) => {
    model.meetingRoomList(floor_id,payload, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
};

const hotDeskingList = (floor_id, payload, callback) => {
  model.hotDeskingList(floor_id,payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const bookedSeatList = (floor_id, payload, callback) => {
  model.bookedSeatList(floor_id,payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const bookedMeetingRoomList = (floor_id, payload, callback) => {
  model.bookedMeetingRoomList(floor_id,payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const hotDesking = (booking_detail, callback) => {
  var otp = generateOTP();  
  const payload = {
      seat_ids: booking_detail.seat_ids,
      duration_from: booking_detail.from,
      duration_to: booking_detail.to,
      user_id: booking_detail.user_id,
      usage_type: booking_detail.usage_type,

      otp: otp
    };
    model.hotDesking(payload, (err, result) => {
      if (err) {
        callback(err);
      } else {
        mailer("hot_desking_booking",payload)
        callback(null, result);
      }
    });
};

const configuration = (payload, callback) => {

    const zone_id = payload.zone_id;
    const values = payload.values;
    model.configuration(zone_id, values, (err, result) => {
      if(err)
      {
        callback(err)
      }
      else {
        callback(null, result)
      }
    })
    
};

const getClientDetails = (email, callback) => {
  model.getClientDetails(email, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    };
  });
}

const cwsUsers = (callback) => {
  model.cwsUsers((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    };
  });
}

const deleteCwsUsers = (payload, callback) => {
  model.deleteCwsUsers(payload.user_email, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    };
  });
}

const uploadCWSUsersData = (cwsUsersData, callback) => {
  model.uploadCWSUsersData(cwsUsersData, (err, result) => {
    if(err)
    {
      callback(err)
    }
    else {
      callback(null, result)
    }
  });
}
    
function generateOTP() {
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i < 6; i++ ) { 
        OTP += digits[Math.floor(Math.random() * 10)]; 
    } 
    return OTP; 
}

const bookingStatus = (data, callback) => {
  if(data.floor_type == "meeting_room"){
    model.bookedMeetingRoomList(data.floor_id, data.query, (error, result) => {
      if (error) {
        callback(error);
      } else {
        model.getFloorMapDetails(data.floor_id, (error, floorMapDetails) => {
          if (error) {
            callback(error);
          } else {
            let floor_map_details = {};
            if(floorMapDetails.length > 0 && floorMapDetails[0].floor_map_details && JSON.parse(floorMapDetails[0].floor_map_details)["meeting-rooms"]) {
              floor_map_details = JSON.parse(floorMapDetails[0].floor_map_details)["meeting-rooms"];
              floor_map_details.areas.forEach(fm => {
                
                if(fm.no_of_seats < data.query.attendies) {
                  fm.bookable = "less_capacity"
                }
                else if(Math.floor(fm.no_of_seats*0.8) <= data.query.attendies) {
                  fm.bookable = "ok"
                }
                else {
                  fm.bookable = "more_capacity"
                }
              })
              if(result.length > 0) {
                floor_map_details.areas.forEach(fm => {
                  let res = _.find(result, ['meeting_room_id', fm.meeting_room_id]);
                  if(res) {
                    fm.preFillColor = "rgba(179, 0, 0,0.7)"
                  }
                })
              }
            }
            
            setTimeout(function () {
              callback(null, floor_map_details);
            }, 500)
          }
        });
      }
    })
  } else if(data.floor_type == "hot_desking") {
    model.bookedSeatList(data.floor_id, data.query, (error, result) => {
      if (error) {
        callback(error);
      } else {
        model.getFloorMapDetails(data.floor_id, (error, floorMapDetails) => {
          if (error) {
            callback(error);
          } else {
            let floor_map_details = {};
            if(floorMapDetails.length > 0 && floorMapDetails[0].floor_map_details && JSON.parse(floorMapDetails[0].floor_map_details)["hot-desking"]) {
              floor_map_details = JSON.parse(floorMapDetails[0].floor_map_details)["hot-desking"];
              let seat_details = []
              // floor_map_details.areas.forEach(element => seat_details.push(element));
              if(result.length > 0) {
                result.forEach(res => {
                  seat_details.push({
                    id: res.zone_id,
                    name: res.seat_details.name
                  })
                })
                floor_map_details.areas.forEach(fm => {
                  let res = _.find(seat_details, {'id': fm.id, 'name': fm.name});
                  if(res) {
                    fm.preFillColor = "rgba(179, 0, 0,0.7)"
                  }
                })
              }
            }
            
            setTimeout(function () {
              callback(null, floor_map_details);
            }, 500)
          }
        });
      }
    })
  }
}


const floorBookingStatus = (floor_id, callback) => {
    const payload = null;
    model.bookedMeetingRoomList(floor_id, payload, (error, result) => {
      if (error) {
        callback(error);
      } else {
        model.getFloorMapDetails(floor_id, (error, floorMapDetails) => {
          if (error) {
            callback(error);
          } else {
            let meeting_room_status = {};
            if(floorMapDetails.length > 0 && floorMapDetails[0].floor_map_details && JSON.parse(floorMapDetails[0].floor_map_details)["meeting-rooms"]) {
              meeting_room_status = JSON.parse(floorMapDetails[0].floor_map_details)["meeting-rooms"];
              
              if(result.length > 0) {
                meeting_room_status.areas.forEach(fm => {
                  let res = _.find(result, ['meeting_room_id', fm.meeting_room_id]);
                  if(res) {
                    fm.preFillColor = "rgba(179, 0, 0,0.7)"
                  }
                })
              }
            }
            model.bookedSeatList(floor_id, payload, (error1, result) => {
              if (error1) {
                callback(error1);
              }
               else {
                    let seat_booking_status = {};
                    if(floorMapDetails.length > 0 && floorMapDetails[0].floor_map_details && JSON.parse(floorMapDetails[0].floor_map_details)["hot-desking"]) {{

                      seat_booking_status = JSON.parse(floorMapDetails[0].floor_map_details)["hot-desking"];
                      let seat_details = []
                      // floor_map_details.areas.forEach(element => seat_details.push(element));
                      if(result.length > 0) {
                        result.forEach(res => {
                          seat_details.push({
                            id: res.zone_id,
                            name: res.seat_details.name
                          })
                        })
                        seat_booking_status.areas.forEach(fm => {
                          // console.log(_.find(seat_details, {'name': fm.name}))
                          // let res = _.find(seat_details, {'id': fm.zone_id, 'name': fm.name});
                          let res = _.find(seat_details, {'name': fm.name});
                          if(res) {
                            fm.preFillColor = "rgba(179, 0, 0,0.7)"
                          }
                        })
                      }
                      seat_booking_status.areas = meeting_room_status.areas ?_.concat(seat_booking_status.areas,meeting_room_status.areas): seat_booking_status.areas
                    }
                    
                    setTimeout(function () {
                      callback(null, seat_booking_status);
                    }, 1000)
                  }
              
            }})
            
            // setTimeout(function () {
            //   callback(null, floor_map_details);
            // }, 500)
          }
        });
      }
    })

  }

const getNetworkStatus = (callback) => {
  model.getNetworkStatus((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    };
  });
}  

module.exports = {
    meetingRoomBooking,
    updateBooking,
    cancelBooking,
    hotDesking,
    configuration,
    meetingRoomList,
    hotDeskingList,
    bookedSeatList,
    getClientDetails,
    uploadCWSUsersData,
    bookedMeetingRoomList,
    getClientDetails,
    bookingStatus,
    floorBookingStatus,
    cwsUsers,
    deleteCwsUsers,
    getNetworkStatus
};
