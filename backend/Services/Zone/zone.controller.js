const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./zone.service');

const createZone = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const zone = req.body;
    service.createZone(zone, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json({ id: result });
      }
    });
  }
};

const editZoneName = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const zone = req.body;
    console.log("zonename edit",zone)
    service.editZoneName(zone, error => {
      if (error) {
        next(error); 
      } else {
        res.status(OK).json({ message: 'Success' });
      }
    });
  }
};

const deleteZoneName = (req, res, next) => {
  const zoneId = req.body.id;
  console.log("this is the zone id sent===========",zoneId)
  service.deleteZoneName(zoneId, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};



const lights = (req, res, next) => {
  const zoneId = req.params.id;
  service.lights(zoneId, (error, response) => {
    // console.log("responseeeeeeeee",response)
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

module.exports = {
  createZone,
  editZoneName,
  deleteZoneName,
  lights
};
