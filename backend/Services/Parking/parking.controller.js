const { OK } = require('http-status');
const service = require('./parking.service');

const buildingParkingStatus = (req, res, next) => {
  const buildingId = req.params.buildingId;
  const context = req.params.context;
  
  if(context == "floors") {
    service.buildingParkingStatus(buildingId, (error, parkingStatus) => {
      if (error) {
        next(error);
      } else {
        // console.log("parking status", parkingStatus)
        res.status(OK).json(parkingStatus);
      }
    });
  } else {
    service.floorLevelParkingStatus(parseInt(context), (error, parkingStatus) => {
      if (error) {
        next(error);
      } else {
        // console.log("parking status", parkingStatus)
        res.status(OK).json(parkingStatus);
      }
    });
  }
};

module.exports = {
  buildingParkingStatus
};
