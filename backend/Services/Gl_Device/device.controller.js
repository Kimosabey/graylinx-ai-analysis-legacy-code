const { OK, CREATED, ACCEPTED } = require('http-status');
const service = require('./device.service');
const logger = require('../../Config/logger');
const { validationResult } = require('express-validator');

const deviceByMac = (req, res, next) => {
  const mac = req.query.mac;
  service.deviceByMac(mac, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const deviceById = (req, res, next) => {
  const id = req.params.id;
  service.deviceById(id, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const updateDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.updateDevice(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const updateDeviceDetails = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.updateDeviceDetails(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const editDeviceName = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.editDeviceName(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const deleteDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const deviceId = req.body.id;
    service.deleteDevice(deviceId, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  }
};

const registerDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.registerDevice(device, (error, result) => {
      if (error) {
        if(error == "You are not allowed to add any new device!!"){
          return res.status(500).json({ maxLimitExceeded: error });
        } else {
          next(error);
        }
      } else {
        res.status(OK).json(result);
      }
    });
  }
};

const registerGlDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.registerGlDevice(device, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  }
};

const updateLocationById = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const deviceXY = req.body;
    service.updateLocationById(deviceXY, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};

const captureEvent = (req, res, next) => {
  const event = req.body;
  console.log("events---------caputered")
  const deviceId = req.params.id;
  event.device.id = deviceId;
  service.captureEvent(deviceId, event, (error,result) => {
    if (error) {
      console.log("in error")
      next(error);
    } else {
      console.log("in result")
      res.sendStatus(ACCEPTED);
    }
  });
};

module.exports = {
  editDeviceName,
  deviceByMac,
  deviceById,
  captureEvent,
  updateDevice,
  updateDeviceDetails,
  deleteDevice,
  registerDevice,
  registerGlDevice,
  updateLocationById
};
