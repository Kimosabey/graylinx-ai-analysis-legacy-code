const models = require('./model');
const _ = require('lodash');

const getStartSchedule = callback => {
  models.getStartSchedules((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};
const getEndSchedule = callback => {
  models.getEndSchedules((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getGatewayWithZoneId = (zoneId, callback) => {
  models.getGateway(zoneId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getLightsWithFloorId = (floorId, callback) => {
  models.getLights(floorId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(results));
    }
  });
};

const getAnalogControllersWithFloorId = (floorId, callback) => {
  models.getAnalogControllers(floorId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(results));
    }
  });
};
const getDevicesWithFloorId = (floorId, callback) => {
  models.getDevices(floorId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(results));
    }
  });
};
const getDevicesWithFloorIdRec = (floorId, callback) => {
  models.getDevicesRec(floorId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(results));
    }
  });
};
const getreccuringschedule =(callback) =>{
    models.getreccuringschedule((err,results) =>{
      if(err){
        callback(err)
      } else {
        callback(null,results)
      }
    })
}; 
const updateLatestCommand=(payload,callback)=>{
  console.log("controller payload",payload)
  models.updateLatestCommand(payload,(err,resp)=>{
    if(err){
      callback(err)
    } else {
      callback(null,resp)
    }
  })
}


module.exports = {
  getGatewayWithZoneId,
  getStartSchedule,
  getEndSchedule,
  getLightsWithFloorId,
  getAnalogControllersWithFloorId,
  getDevicesWithFloorId,
  getDevicesWithFloorIdRec,
  getreccuringschedule,
  updateLatestCommand
};
