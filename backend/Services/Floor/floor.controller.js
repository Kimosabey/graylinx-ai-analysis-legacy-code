const { CREATED, OK } = require('http-status');
const service = require('./floor.service');

const { validationResult } = require('express-validator');

const createFloor = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const floor = req.body;
    service.createFloor(floor, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const floorStats = (req, res, next) => {
  const floorId = req.params.id;
  service.floorStats(floorId, (error, stats) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(stats);
    }
  });
};


const getFloors = (req, res, next) => {
  service.getFloors((error, floorsData) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(floorsData);
    }
  });
};

const summaryParameters = (req, res, next) => {
  const floorId = req.params.id;
  service.summaryParameters(floorId, (error, summary) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(summary);
    }
  });
};

const luxSummary = (req, res, next) => {
  const floorId = req.params.id;
  service.luxSummary(floorId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const editFloorName = (req, res, next) => {
  const floor = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    service.editFloorName(floor, error => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json({ message: 'Success' });
      }
    });
  }
  
};

const deleteFloor = (req, res, next) => {
  const floorId = req.body.id;
  service.deleteFloor(floorId, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

const lights = (req, res, next) => {
  const floorId = req.params.id;
  service.lights(floorId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};
module.exports = {
  createFloor,
  floorStats,
  summaryParameters,
  luxSummary,
  editFloorName,
  deleteFloor,
  getFloors,
  lights
};
