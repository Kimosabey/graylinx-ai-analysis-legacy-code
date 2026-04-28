const { CREATED, OK } = require('http-status');
const service = require('./campus.service');
const { validationResult } = require('express-validator');

const createCampus = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const campusData = req.body;
    service.createCampus(campusData, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const getCampustree = (req, res, next) => {
  const campusId = req.params.id;
  service.getCampusTree(campusId, (error, result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

const editCampusName = (req, res, next) => {
  const campus = req.body;
  service.editCampusName(campus, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

const deleteCampus = (req, res, next) => {
  const campusId = req.body.id;
  service.deleteCampus(campusId, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

const deviceList = (req, res, next) => {
  const campusId = req.params.id;
  service.deviceList(campusId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

module.exports = {
  createCampus,
  getCampustree,
  editCampusName,
  deleteCampus,
  deviceList
};
