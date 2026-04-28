const { OK,ACCEPTED } = require('http-status');
const service = require('./light.service');
const model=require('./light.model');
const { response } = require('express');
const { fromCallback } = require('bluebird');
const logger = require('../../Config/logger');

// Caps

const lights = (req, res, next) => {
  const event = req.body.payload;
  const user = req.body.user;
  console.log("eventtttttttttttttttttttttttttttttttttttttttttttt",event)
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
  model.updatecommandid((err,result)=>{
    // console.log("truncate result=========+++++",result)
      if(err){
        // console.log(err)
        logger.error(`${new Date()}lights.controller.js updatecommandid ${err.msg}`)
       next(err)
      }else{
        service.lights(event, user, (error, response) => {
          if (error) {
            //next(error);
             res.status(500).json(error);
          } else {
            res.status(OK).json(response);
          }
        });
      }

  })
  
};



const updatedevicestatus=(req,res,next)=>{
    const cmd_id=req.params.cmd_id;
    const cmdstatus=req.body.status;
    service.updatedevicestatus(cmd_id,cmdstatus, error=>{
      if(error){
        next(error);
      }else{
        res.sendStatus(ACCEPTED)
      }
    })

}






const eventStatus=(req,res,next)=>{
    // console.log("req event status-----------++++++++++++==",req.params)
    const batchId=req.params.batchId;
    const batchLength=req.params.batchLength;
    service.eventStatus(batchId,batchLength,(err, result)=>{
      if(err){
        next(err);
      }else{
        // console.log("result controller---------",result)
        res.status(OK).json(result);
      }
    })

}

const checkstatus = (req,res,next)=>{
  service.checkstatus((err,result)=>{
    if(err){
      next(err)
    } else {
      res.status(OK).json(result)
    }
  })
}





const Floorlights = (req, res, next) => {
  const event = req.body.payload;
  const user = req.body.user;
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
  service.Floorlights(event, user, (error, response) => {
    if (error) {
      // next(error);
      res.status(500).json(error);
    } else {
      res.status(OK).json(response);
    }
  });
};


const setpoint=(req,res,next)=>{
  console.log("req event status-----------++++++++++++==",req.body)
  let payload=req.body.payload
  let sp=req.body.setpoint
  service.setpoint(payload,sp,(err, result)=>{
    if(err){
      next(err);
    }else{
      // console.log("result controller---------",result)
      res.status(OK).json(result);

    }
  })

}

module.exports = {
  lights,
  updatedevicestatus,
  eventStatus,
  Floorlights,
  checkstatus,
  setpoint
};
