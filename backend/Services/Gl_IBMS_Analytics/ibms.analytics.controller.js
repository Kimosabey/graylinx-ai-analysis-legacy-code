const { OK } = require('http-status');
const service = require('./ibms.analytics.service');
const { response } = require('express');
const e = require('express');

const device_faults = (req, res, next) => {
  let equipment_name = req.body.equipment_name;
  let parameter_name = req.body.parameter;
  if (equipment_name == '') {
    equipment_name = 'AHU';
  }
  if (parameter_name == '') {
    parameter_name = 'faults';
  }

  const from_date = req.body.from_date;
  const to_date = req.body.to_date;
  console.log(equipment_name, 'name');
  service.device_faults(
    equipment_name,
    from_date,
    to_date,
    parameter_name,
    (err, response) => {
      if (err) {
        next(err);
      } else {
        res.status(OK).json(response);
      }
    }
  );
};

const single_device_faults = (req, res, next) => {
  let equipment_name = req.body.equipment_name;
  let device_name = req.body.list_of_devices;

  if (equipment_name == '') {
    equipment_name = 'AHU';
  }

  if (device_name == '') {
    device_name = 'AHU-1';
  }
  const from_date = req.body.from_date;
  const to_date = req.body.to_date;
  service.single_device_faults(
    equipment_name,
    from_date,
    to_date,
    device_name,
    (err, response) => {
      if (err) {
        next(err);
      } else {
        res.status(OK).json(response);
      }
    }
  );
};

const benchmarking = (req, res, next) => {
  let equipment_name = req.body.equipment_name;
  let device_name = req.body.list_of_devices;

  // let monthName=req.body.month
  // if(monthName==''){
  // const date = new Date();
  // monthName = date.toLocaleString('default', { month: 'long' });
  // }

  if (equipment_name == '') {
    equipment_name = 'AHU';
  }
  if (device_name == '') {
    device_name = 'AHU-1';
  }
  service.benchmarking(equipment_name, device_name, (err, response) => {
    if (err) {
      next(err);
    } else {
      res.status(OK).json(response);
    }
  });
};

const getEnergyConsumption = (req, res, next) => {
  let equipment_type = req.body.equipment_type || 'EMS';
  let device_id = req.body.device_id || 'EMS-1';
  let interval = req.body.interval;
  let start_time = req.body.start_time;
  let end_time = req.body.end_time;

  if (!interval && (!start_time || !end_time)) {
    interval = 'hour';
  }

  service.getEnergyConsumption(
    equipment_type,
    device_id,
    interval,
    start_time,
    end_time,
    (err, response) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(response);
    }
  );
};

const getEnergy = (req, res, next) => {
  let equipment_type = req.body.type || 'NONGL_SS_EMS';
  let device_id = req.body.device_id;
  let interval = req.body.interval || 'day';

  // console.log("equipment_id-->",equipment_id,"device_type-->",device_type)
  service.getEnergy(equipment_type, device_id, interval, (err, response) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(response);
  });
};

const getEnergyTemperature = (req, res, next) => {
  let equipment_type = req.body.type || 'NONGL_SS_EMS';
  let device_id = req.body.device_id;
  let interval = req.body.interval || 'day';
  let start_time=''
  let end_time=''

  // console.log("equipment_id-->",equipment_id,"device_type-->",device_type)
  service.getEnergyTemperature(equipment_type, device_id, interval,start_time, end_time,(err, response) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(response);
  });
};

const getRunhour=(req,res,next)=>{
  let device_id = req.body.device_id;
  let interval = req.body.interval || 'day';
  let start_time=''
  let end_time=''

  // console.log("equipment_id-->",equipment_type,"device_type-->",device_id)
  service.getRunhour(device_id, interval,start_time, end_time,(err, response) => {
    if (err) {
      return next(err);
    }
    res.status(200).json(response);
  });
}

const getfloorzoneEnergydata=(req,res,next)=>{
  let id=req.body.id || 'eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20'
  let equipment_type=req.body.equipment_type || 'NONGL_SS_EMS'
  let interval=req.body.interval || 'day'
  let start_time=req.body.start_time || ''
  let end_time=req.body.end_time || ''

  // console.log("idddd",id,"equipment_type",equipment_type)

  service.getfloorzoneEnergydata(equipment_type,id,interval,start_time,end_time,(err,response)=>{
      if(err){
        return next(err);
      }
      res.status(200).json(response)
  })
}


module.exports = {
  device_faults,
  single_device_faults,
  benchmarking,
  getEnergyConsumption,
  getEnergy,
  getEnergyTemperature,
  getRunhour,
  getfloorzoneEnergydata
};
