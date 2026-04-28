const models = require('./model');
const _ = require('lodash');
const { compareAsc, format } = require('date-fns');
const service =require('../../Services/Device/device.service');
const { toFixed } = require('../../Utils/common');

const getAhuDevices = (ss_type, callback) => {
  models.getAhuDevices(ss_type, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getAhuDeviceIp = (ss_parent, callback) => {
  models.getAhuDeviceIp(ss_parent, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const addAhuDeviceData = (id, AhuData, ss_type, callback) => {
  // console.log("ahuData",AhuData)
  // console.log("ahuid",id)
  console.log("asdfghjkl")
  let insertData = [];
  console.log("ahudata",AhuData)
  AhuData.forEach(element => {
    let data = [];
    if(element.objectId!=10){
      data.push(id);
      // ahudata coming from controller
      data.push(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss'))
      data.push(element.name)
      data.push(toFixed(element.presentValue,2))
      // data.push('ahu_on_off');
      // this is for data simulation
      // data.push(moment(element.timestamp).format('YYYY-MM-DD HH:mm:ss'));
      //  data.push(element.event.name);
      // data.push(isNaN(element.event.presentValue.value) ? 0 : element.event.presentValue.value);
      insertData.push(data);
    }
   
  });
  console.log('data', insertData);
  if(insertData.length>0){
    models.addAhuDeviceData(insertData, ss_type, (err, results) => {
      if (err) {
        callback(err);
      } else {
          // callback(null, results);
       
          models.updateLatestEventSOM(id,AhuData,(err1,results1)=>{
            if(err1) {
              callback(err1);
            }else{
              callback(null,results1)
            }
          })
      }
    });
  }else{
     callback(null,"nothing to store")
  }
};



module.exports = {
  getAhuDevices,
  getAhuDeviceIp,
  addAhuDeviceData
};
