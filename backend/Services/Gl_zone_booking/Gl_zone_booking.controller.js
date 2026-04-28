const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./Gl_zone_booking.service');
const { floor } = require('lodash');

const searchBookable = (req, res, next) => {
  const data = {
    parent_id: req.params.parent_id,
    zone_type: req.params.type,
    query: req.query
  };
  service.searchBookable(data, (error, result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

const bookingList = (req, res, next) => {
  const data = {
    parent_id: req.params.parent_id,
    zone_type: req.params.type
  };
  service.bookingList(data, (error, result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};
const getUser = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const email = req.params.email;
    service.getUser(email, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const booking = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const payload = req.body;
    console.log(payload);
    service.booking(payload, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

module.exports = {
  searchBookable,
  getUser,
  booking,
  bookingList
};
