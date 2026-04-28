const { CREATED, OK,ACCEPTED } = require('http-status');
const { validationResult } = require('express-validator');
const logger = require('../../Config/logger');

const service = require('./subsystem.service');
const { floor } = require('lodash');

const createSubsystem = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const payload = req.body;
    service.createSubsystem(payload, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const insertSetpoint = (req, res, next) => {
  const deviceId = req.params.id;
  const data=req.body
  service.insertBacnetCall(deviceId,data, (error,result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

const checkCommandStatus = (req, res, next) => {
  const deviceId = req.params.id;
  service.checkCommandStatus(deviceId, (error,result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

const relinquishPriority = (req, res, next) => {
  const deviceId = req.body.id;
  service.relinquishPriority(deviceId, (error,result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

module.exports = {
    createSubsystem,
    insertSetpoint,
    checkCommandStatus,
    relinquishPriority}