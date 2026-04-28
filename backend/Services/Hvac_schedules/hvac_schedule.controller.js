const { OK, CREATED } = require('http-status');
const { validationResult } = require('express-validator');
const service = require('./hvac_schedule.service');

const createSchedule = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const data = req.body;
    service.createSchedule(data.data, data.user, (error, response) => {
      if (error) {
        console.log(error)
        next(error);
      } else {
        res.status(CREATED).json(response);
      }
    });
  }
};

const schedulesList = (req, res, next) => {
  service.schedulesList((error, result) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(result);
    }
  });
};

const deleteSchedule = (req, res, next) => {
  const scheduleId = req.params.scheduleId;
  const user = req.body;
  service.deleteSchedule(scheduleId, user, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const editSchedule = (req, res, next) => {
  const payload = req.body;
  const scheduleId = req.params.scheduleId;
  service.editSchedule(payload.data, payload.running, scheduleId, (error, response) => {
    if (error) {
      next(error);
    } else {
      if(response.message === "Conflict in Schedule name") {
        res.status(500).json(response)
      }
      else {
        res.status(CREATED).json(response);
      }
    }
  });
};

module.exports = {
  createSchedule,
  schedulesList,
  deleteSchedule,
  editSchedule
};
