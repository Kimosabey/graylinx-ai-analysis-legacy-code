const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./Gl_zone.service');
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

const getGlZone = (req, res, next) => {
  const id=req.params.id
  const deviceType=req.params.deviceType
  // if(deviceType===)
  console.log("idddd",id,"devicetype in con",deviceType)
  service.getGlZone(id,deviceType,(error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      res.status(OK).json(result);
    }
  });
  // res.status(OK).json("qwertyuiop");
};

const getGlZoneForSchedule = (req, res, next) => {
  const id=req.params.id
  const deviceType=req.params.deviceType
  // if(deviceType===)
  console.log("idddd",id,"devicetype in con",deviceType)
  service.getGlZoneForSchedule(id,deviceType,(error, result) => {
    if (error) {
      res.locals.error = error;
      next();
    } else {
      console.log("getGlZoneForSchedulegetGlZoneForSchedulegetGlZoneForSchedulegetGlZoneForSchedule")
      res.status(OK).json(result);
    }
  });
  // res.status(OK).json("qwertyuiop");
};

module.exports = {
    createGlZone,
    getGlZone,
    getGlZoneForSchedule
  }