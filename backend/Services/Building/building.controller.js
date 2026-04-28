const { CREATED, OK } = require('http-status');
const service = require('./building.service');
const { validationResult } = require('express-validator');

const createBuilding = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const building = req.body;
    service.createBuilding(building, (error, results) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: results });
      }
    });
  }
};

const lights = (req, res, next) => {
  const buildingId = req.params.id;
  service.lights(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const devicesList = (req, res, next) => {
  const buildingId = req.params.id;
  service.devicesList(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const luxSummary = (req, res, next) => {
  const buildingId = req.params.id;
  service.luxSummary(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const summaryParameter = (req, res, next) => {
  const buildingId = req.params.id;
  service.summaryParameter(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const editBuildingName = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const building = req.body;
    service.editBuildingName(building, error => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json({ message: 'Success' });
      }
    });
  }
  
};

const deleteBuilding = (req, res, next) => {
  const buildingId = req.body.id;
  service.deleteBuilding(buildingId, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

module.exports = {
  lights,
  luxSummary,
  devicesList,
  deleteBuilding,
  createBuilding,
  summaryParameter,
  editBuildingName
};
