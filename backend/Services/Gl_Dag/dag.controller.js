const { OK, CREATED } = require('http-status');
const service = require('./dag.service')


const dagRegister = (req, res, next) => {
    const event = req.body;
    service.dagRegister(event,(error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };

  const getDDCDevices = (req, res, next) => {
    service.getDDCDevices((error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };

  const getDevices = (req, res, next) => {
    let id = req.params.Id
    console.log("id-------",id)
    service.getDevices(id,(error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };

  const editAndMapDevice = (req, res, next) => {
    const event = req.body;
    service.editAndMapDevice(event,(error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };

  const getDevicesInfo = (req, res, next) => {
    let id = req.params.Id
    console.log("id-------",id)
    service.getDevicesInfo(id,(error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  };

  module.exports={
    dagRegister,
    getDDCDevices,
    getDevices,
    editAndMapDevice,
    getDevicesInfo
  }