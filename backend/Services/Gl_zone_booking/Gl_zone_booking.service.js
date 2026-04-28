const { date } = require('joi');
const _ = require('lodash');
const uuid = require('uuid/v4');
const { error } = require('winston');
const model = require('./Gl_zone_booking.model');

const searchBookable = (data, callback) => {
  model.searchBookable(data, (error, bookable) => {
    if (error) {
      callback(error);
    } else {
      if (bookable.length > 0) {
        model.searchBooked(data, (error, booked) => {
          bookable.forEach(e => {
            e['status'] = 'available';
            e['color'] = 'rgb(0,179,0,0.7)';
          });

          for (var i = 0; i < booked.length; i++) {
            for (var j = 0; j < bookable.length; j++) {
              if (booked[i].uuid == bookable[j].uuid) {
                bookable[j]['status'] = 'occupied';
                bookable[j]['color'] = 'rgb(179,0,0,0.7)';
                break;
              }
            }
          }
          setTimeout(() => {
            callback(null, bookable);
          }, 200);
        });
      }
    }
  });
};

const bookingList = (data, callback) => {
  model.bookingList(data, (error, bookingListData) => {
    if (error) {
      callback(error);
    } else {
      console.log('bookingList data =================');
      console.log(bookingListData);
      if (error) {
        callback(error);
      } else {
        callback(null, { result: bookingListData });
      }
    }
  });
};

const getUser = (email, callback) => {
  model.getUser(email, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const booking = (payload, callback) => {
  model.booking(payload, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  searchBookable,
  getUser,
  booking,
  bookingList
};
