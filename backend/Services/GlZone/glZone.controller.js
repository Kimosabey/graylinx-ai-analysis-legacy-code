const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./glZone.service');
const { floor } = require('lodash');

const createGlZone = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const payload = req.body;
    service.createGlZone(payload, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const bookingList = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const usage_type = req.params.usage_type;
    service.bookingList(usage_type, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const childGlZones = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const parent_id = req.params.parent_id;
    service.childGlZones(parent_id, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const bookingStatus = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor_id = req.params.floor_id;
    const type = req.params.type;
    const query = req.query
    service.bookingStatus(floor_id, type, query, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
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
    const glZone_id = req.params.glZone_id;
    service.configuration(glZone_id, payload, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const cardsForDashboard = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const glZone_id = req.params.glZone_id;
    service.cardsForDashboard(glZone_id, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};
//confRoomFacility
const confRoomFacility = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const glZone_id = req.params.glZone_id;
    service.confRoomFacility(glZone_id, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
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
  createGlZone,
  bookingList,
  childGlZones,
  bookingStatus,
  configuration,
  cardsForDashboard,
  confRoomFacility,
  getUser,
  booking
};