const { CREATED, OK } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./area.service');

const createarea = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const area = req.body;
      service.createarea(area, (error, result) => {
        if (error) {
          next(error);
        } else {
          res.status(CREATED).json({ id: result });
        }
      });
    }
  };
  const editAreaName = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      const area = req.body;
      console.log("areaname edit",area)
      service.editAreaName(area, error => {
        if (error) {
          next(error); 
        } else {
          res.status(OK).json({ message: 'Success' });
        }
      });
    }
  };
  const deleteAreaName = (req, res, next) => {
    const areaId = req.body.id;
    console.log("this is the arae id sent===========",areaId)
    service.deleteAreaName(areaId, error => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json({ message: 'Success' });
      }
    });
  };
  
  const lights = (req, res, next) => {
    const areaId = req.params.id;
    service.lights(areaId, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  };



  module.exports = {
    editAreaName,
    createarea,
    deleteAreaName,
    lights
  };


