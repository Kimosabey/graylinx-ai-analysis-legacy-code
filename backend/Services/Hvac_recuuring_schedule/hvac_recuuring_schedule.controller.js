const { OK, CREATED,ACCEPTED } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./hvac_recuuring_schedule.service');


const updateSchedule = (req, res, next) => {
    const event = req.body;
    const deviceId =req.params.id;
    // console.log("event",event)
    service.updateSchedule(event,deviceId,(error, result) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(ACCEPTED)
      }
    });
  };

  const getSchedule = (req, res, next) => {
    service.getSchedule((error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };  
  module.exports={
    updateSchedule,
    getSchedule
  }