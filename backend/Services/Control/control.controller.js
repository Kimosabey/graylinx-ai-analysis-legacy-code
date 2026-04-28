const { OK } = require('http-status');
const service = require('./control.service');

// Caps

const control = (req, res, next) => {
  const event = req.body.payload;
  const user = req.body.user;
  const glZoneId = req.params.zone_id;
  // if (event.mode === 1) {
  //   if(event.deviceType=="ANALOG_CONTROLLER") {
  //     // service.anclLights(event, user, (error, response) => {
  //     //   if (error) {
  //     //     next(error);
  //     //   } else {
  //     //     res.status(OK).json(response);
  //     //   }
  //     // });
  //     service.zoneAnctlLights(event, user, (error, response) => {
  //       if (error) {
  //         next(error);
  //       } else {
  //         res.status(OK).json(response);
  //       }
  //     });
  //   } else {
  //     service.indiviualLights(event, user, (error, response) => {
  //       if (error) {
  //         next(error);
  //       } else {
  //         res.status(OK).json(response);
  //       }
  //     });
  //   }
  // } else if (event.mode === 2) {
  //   if(event.deviceType=="ANALOG_CONTROLLER") {
  //     service.zoneAnctlLights(event, user, (error, response) => {
  //       if (error) {
  //         next(error);
  //       } else {
  //         res.status(OK).json(response);
  //       }
  //     });

  //   } else {
  //     service.zoneLights(event, user, (error, response) => {
  //       if (error) {
  //         next(error);
  //       } else {
  //         res.status(OK).json(response);
  //       }
  //     });
  //   }
  // }
  service.control(event, user, glZoneId, (error, response) => {
    if (error) {
      // next(error);
      res.status(500).json(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

module.exports = {
  control
};
