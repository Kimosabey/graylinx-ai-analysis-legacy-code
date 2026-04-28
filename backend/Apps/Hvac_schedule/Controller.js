const models = require('./model');
const _ = require('lodash');

const getSchedule = callback => {
  models.getSchedules((err, results) => {
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

const getAhuInfo = (callback) => {
  models.getAhuInfo((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, JSON.parse(results));
    }
  });
};

const getRecuuringSheduleInfo = (callback)=>{
  models.getRecuuringSheduleInfo((err,results)=>{
    if (err){
      callback(err)
    } else {
      callback(null, JSON.parse(results));
    }
  })
}

const getDdcData=(zoneId,callback)=>{
  models.getDdcData(zoneId,(err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}


const getRecuuringSheduleData=(callback)=>{
  models.getRecuuringSheduleData((err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })
}

const getDdcChildren=(ddcId,callback)=>{
  models.getDdcChildren(ddcId,(err,res)=>{
    if(err){
      callback(err)
    }else{
      callback(null,res)
    }
  })
}


const getEndSchedule=(callback)=>{
  models.getEndSchedule((err,result)=>{
    if(err){
      callback(err)
    }else{
      callback(null,result)
    }
  })

}


module.exports = {
  getGatewayWithZoneId,
  getSchedule,
  getLightsWithFloorId,
  getAnalogControllersWithFloorId,
  getDevicesWithFloorId,
  getAhuInfo,
  getRecuuringSheduleInfo,
  getDdcData,
  getRecuuringSheduleData,
  getDdcChildren,
  getEndSchedule
};
