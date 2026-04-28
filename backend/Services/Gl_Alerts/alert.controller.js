const { OK } = require('http-status');
const service = require('./alert.service');
const { ACCEPTED } = require('http-status');


const alerts = (req, res, next) => {
  const buildingId = req.params.id;
  service.alerts(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const alertsTemp = (req, res, next) => {
  const buildingId = req.params.id;
  service.alertsTemp(buildingId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const hideMulitpleEvents = (req, res, next) => {
  const body = req.body
  console.log("body",body)
  service.hideMulitpleEvents(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const alertsByZone = (req, res, next) => {
  const id = req.params.zoneid
  service.alertsByZone(id, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const alertsByDevice = (req, res, next) => {
  const id = req.params.deviceid
  console.log("iddddddddddddd",id)
  service.alertsByDevice(id, (error, response) => {
  if (error) {
    next(error);
  } else {
    res.status(OK).json(response);
  }
});
};

const deleteAlarm = (req, res, next) => {
  const body = req.body
  console.log("body",body)
  service.deleteAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};

const acknowledgeAlarm = (req, res, next) => {
  const body = req.body
  console.log("body",body)
  service.acknowledgeAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};

const restoreAlarm = (req, res, next) => {
  const body = req.body
  console.log("body",body)
  service.restoreAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};

const insertSelectedAlarm = (req, res, next) => {
  const body = req.body
  service.insertSelectedAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};

const insertSelectedChillerAlarm = (req, res, next) => {
  const body = req.body
  service.insertSelectedChillerAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};

const insertIntoGlAlarm = (req, res, next) => {
  const body = req.body
  service.insertIntoGlAlarm(body, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(ACCEPTED);
    }
  });
};
module.exports = {
  alerts,
  alertsTemp,
  hideMulitpleEvents,
  alertsByZone,
  acknowledgeAlarm,
  deleteAlarm,
  restoreAlarm,
  alertsByDevice,
  insertSelectedAlarm,
  insertSelectedChillerAlarm,
  insertIntoGlAlarm
};
