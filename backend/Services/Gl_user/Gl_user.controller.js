const { OK } = require('http-status');
const service = require('./Gl_user.service');
const { ACCEPTED } = require('http-status');


const getTechnicians = (req, res, next) => {
  service.getTechnicians((error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const sendToTechnicians = (req, res, next) => {
  let data = req.body
  service.sendToTechnicians(data,(error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const sendAlarmsToTechnicians = (req, res, next) => {
  let data = req.body
  service.sendAlarmsToTechnicians(data,(error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const configuration_values = (req, res, next) => {
  let data = req.body
  service.configuration_values(data,(error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const instrumentation = (req, res, next) => {
  service.instrumentation((error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};
module.exports ={
    getTechnicians,
    sendToTechnicians,
    sendAlarmsToTechnicians,
    configuration_values,
    instrumentation
}