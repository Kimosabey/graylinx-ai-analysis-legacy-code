const { OK, CREATED, ACCEPTED } = require('http-status');
const service = require('./device.service');
const model = require('./device.model');
const async = require('async');
const _ = require('lodash');
const logger = require('../../Config/logger');
const { validationResult } = require('express-validator');
const devSer = require('../Gl_Device/device.service')
const objectDiscover = require('../../Apps/discoverObject/objDiscover')
const fns = require('date-fns')
const { toFixed, printDate } = require('../../Utils/common');

// Attempt to optimize performance
const optimizeCode = true;
const { processReadMultipleResponse, processDiscoverResponse } = require('./myIBMSPreparation')

const deviceByMac = (req, res, next) => {
  const mac = req.query.mac;
  service.deviceByMac(mac, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const deviceById = (req, res, next) => {
  const id = req.params.id;
  service.deviceById(id, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

const updateDevice = (req, res, next) => {
  const errors = validationResult(req);
  console.log("cont-ud============",errors)
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    console.log("cont-ud============",device)
    service.updateDevice(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const updateDeviceDetails = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.updateDeviceDetails(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const editDeviceName = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.editDeviceName(device, (error, response) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(response);
      }
    });
  }
};

const deleteDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const deviceId = req.body.id;
    console.log("deletedev===========>",deviceId)
    service.deleteDevice(deviceId, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(OK).json(result);
      }
    });
  }
};

const registerDevice = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const device = req.body;
    service.registerDevice(device, (error, result) => {
      if (error) {
        if(error == "You are not allowed to add any new device!!"){
          return res.status(500).json({ maxLimitExceeded: error });
        } else {
          next(error);
        }
      } else {
        res.status(OK).json(result);
      }
    });
  }
};

const updateLocationById = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  } else {
    const deviceXY = req.body;
    service.updateLocationById(deviceXY, (error, result) => {
      if (error) {
        next(error);
      } else {
        res.status(CREATED).json(result);
      }
    });
  }
};


// const captureEvent = (req, res, next) => {
//   const event = req.body;
//   const deviceId = req.params.id;
//   event.device.id = deviceId;
//     service.captureEvent(deviceId, event, error => {
//     if (error) {
//       next(error);
//     } else {
//       res.sendStatus(ACCEPTED);
//     }
//   });
// };

const captureEvent = (req, res, next) => {
  const event = req.body;
  const deviceId = req.params.id;
  event.device.id = deviceId;
  logger.info("event from deviceeee",event)
  if(event.device.type=="analog_controller"){
    model.getDeviceDetails(deviceId,(err1,result)=>{
      // console.log("get device details",result)
      if(err1){
        callback(err1);
      } else {
        if(result.length==2){
          let index=0
          let id = [];
          result.forEach(element => {
            id.push(element.id)
          });
            service.captureEventloop(id,event, (error,response) => {
              if (error) {
                next(error);
              } else {
                index++
                if(index==result.length){
                  devSer.captureEvent(id,event,(error,result3)=>{
                    if(error){
                      next(error);
                    }else{
                      res.sendStatus(ACCEPTED);
                    }
                  })
                }
              }
            });
        } else {
          service.captureEvent(deviceId, event, (error,result3) => {
            console.log("=======================hi===============================================")
            if (error) {
              next(error);
            } else {
              console.log("callling gl=====================================================>",result3)
              devSer.captureEvent(deviceId,event,(error,result4)=>{
                if(error){
                  next(error)
                }else{
                  res.sendStatus(ACCEPTED);
                }
              })
            }
          });
        }
      }
    })
  }else{
    service.captureEvent(deviceId, event, error => {
      if (error) {
        next(error);
      } else {
        devSer.captureEvent(deviceId,event,(error,result4)=>{
          if(error){
            next(error)
          }else{
            res.sendStatus(ACCEPTED);
          }
        })
      }
    });
  }
}  

const getdevices = (req,res,next)=>{
  // console.log("controller devicesssssssssssssss")
  service.getdevices((error,result)=>{
    if(error){
      next(error)
    } else {
      // console.log("resultttttttttt",result)
      res.status(OK).json(result);
    }
  })
}

const captureBacnetEvent = (req, res, next) => {
  //const event = req.body;
  let reqObj=req.body
  // let dagId='66d2082f-7335-4673-9067-cadc65b47666'
  //trendd reqObj
  // let reqObj={"request":{"request_uuid":"6491d99a-6973-418a-aaf5-69de66a99dad","request_parts":["","readrange","192.168.1.30","20:2","logBuffer","p%201%2010"],"query_params":{}},
  // "response":[{"timestamp":"2023-02-21 22:53:00","logDatum":{"realValue":25.09034538269043}},{"timestamp":"2023-02-21 23:08:00","logDatum":{"realValue":29.210439682006836}},{"timestamp":"2023-02-21 23:23:00","logDatum":{"realValue":33.290287017822266}},{"timestamp":"2023-02-21 23:38:00","logDatum":{"realValue":32.69027328491211}},{"timestamp":"2023-02-21 23:53:00","logDatum":{"realValue":28.580310821533203}},{"timestamp":"2023-02-22 00:08:00","logDatum":{"realValue":24.48021697998047}},{"timestamp":"2023-02-22 00:23:00","logDatum":{"realValue":20.32012176513672}},{"timestamp":"2023-02-22 00:38:00","logDatum":{"realValue":16.23002815246582}},{"timestamp":"2023-02-22 00:53:00","logDatum":{"realValue":17.820178985595703}},{"timestamp":"2023-02-22 01:08:00","logDatum":{"realValue":21.9102725982666}}]}
  // console.log("======>",reqObj.request.request_parts[1])
  //console.log("porpres",reqObj.response.propertyResults)
  //console.log("req11111111111111111->",JSON.stringify(req.body) )
  //   let reqObj={ 
  //     "request": {
  //     "request_uuid": "6a4c578a-def7-459b-9e32-0469a603882a",
  //     "request_parts": [
  //         "",
  //         "subscribe",
  //         "192.168.0.107",
  //         "2:13012",
  //         ""
  //     ],
  //     "query_params": {}
  //             },
  // "response": {
  // "objectId": [
  //     "analogValue",
  //     23012
  // ],
  // "changeOfValue": [
  //     {
  //         "presentValue": "12"
  //     },
  //     {
  //         "statusFlags": "[0, 0, 0, 0]"
  //     }
  // ]
  // }}
  // let dis={
  //   "request": {
  //     "service": "discoverobjects",
  //     "address": "192.168.1.22",
  //     "device": [
  //         "device",
  //         3599
  //     ]
  // },
  // "response": [
  //   {
  //       "objectId": [
  //           "device",
  //           3599
  //       ],
  //       "objectName": "Betelgeuse"
  //   },
  //   {
  //       "objectId": [
  //           "analogValue",
  //           13001
  //       ],
  //       "objectName": "GR_M_IP_0105010001"
  //   },
  //   {
  //       "objectId": [
  //           "analogValue",
  //           13002
  //       ],
  //       "objectName": "GR_M_IP_0105010002"
  //   }]
  // }
  let ip = reqObj.request.request_parts[2]
  switch (reqObj.request.request_parts[1]) {
    case 'readrange':
      console.log("trend")
      let instan = reqObj.request.request_parts[3].split(':');
      //device_id:20:1 device_addr:192.168.10.30 my_properties:logBuffer
      let trendData = reqObj.response
      if (trendData.length > 0) {
        service.captureBacnetTrend(ip, instan[1], trendData, (error, result) => {
          if (error) {
            callback(error)
          } else {
            res.sendStatus(ACCEPTED);
          }
        })
      } else {
        res.sendStatus(ACCEPTED);
      }

      break
    case 'subscribe':
      console.log("cov")
      let instance = reqObj.response.objectId[1]
      let value = reqObj.response.changeOfValue[0].presentValue
      //console.log("------>sub",ip,instance,value)
      let covData = { "ip": ip, "instance": instance, "value": value }
      // res.sendStatus(ACCEPTED);
      console.log("cov---->", JSON.stringify(covData))
      service.captureBacnetEvent(covData, (error, result) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(ACCEPTED);
        }
      });
      break
    case 'discoverobjects_nosegmentation':
      logger.info("discover objects creating tables");
      if (optimizeCode) {
        processDiscoverResponse(reqObj, res, next);
      } else {
        // reqObj.response.forEach(data=>{
        //   console.log("iddsss---->",data.objectName,data.objectName.slice(0, 2))
        //   if(data.objectName.slice(0, 2)=='GR'){
        //    // 00 00 00 A0 0 003 00
        //    let obj=data.objectName.substring(2)
        //    let real=obj.replace(" ", "")
        //     console.log("-----ia ma object id",data.objectName.substring(2),real)
        //   }
        // })
        let objects = reqObj.response.filter(data => data.objectName.slice(0, 2) == 'GL')
        //let objects=grObjects.filter(data=>data.objectId[0]=='analogValue')
        console.log("=========>", JSON.stringify(objects));
        let count = 0
        let final = []
        //get dag id from python post response
        let dagId = reqObj.request.query_params.dagId[0]
        if (objects.length > 0) {
          objects.forEach(data => {
            let myobj = {}
            myobj['time'] = fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
            myobj['objectId'] = data.objectId[1];
            myobj['type'] = data.objectId[0] == 'analogValue' ? 2 : data.objectId[0] == 'binaryValue' ? 6 : data.objectId[0] == 'trendLog' ? 20 : '';
            myobj['name'] = data.objectName.substring(2).replace(/ /g, "");
            count++
            final.push(myobj)
            if (count == objects.length) {
              objectDiscover.createDevice(dagId, final, (err, result) => {
                if (err) {
                  callback(err)
                } else {
                  res.sendStatus(ACCEPTED);
                }
              })
            }
          })
        } else {
          res.sendStatus(ACCEPTED);
        }
      }
      break
    case 'readmultiple':
      // console.log("readddddddd muiltiple - ", reqObj.response.propertyResults[0], reqObj.response.propertyResults.length);
      if (optimizeCode) {
        processReadMultipleResponse(reqObj, res, next);
      } else {
        //   let resData=  {
        //     "response":{
        //        "propertyResults":[
        //           {
        //              "objectType":"analogValue",
        //              "objectId":13015,
        //              "properties":[
        //                 {
        //                    "propertyId":"objectName",
        //                    "datatype":"Any",
        //                    "propertyValue":"GR_M_IP_010102000f"
        //                 },
        //                 {
        //                    "propertyId":"presentValue",
        //                    "datatype":"Any",
        //                    "propertyValue":30.729999542236328
        //                 },
        //                 {
        //                     "propertyId":"objectNam",
        //                     "datatype":"Any",
        //                     "propertyValue":"GR_M_IP_010102000f"
        //                  },
        //              ]
        //           },
        //           {
        //              "objectType":"analogValue",
        //              "objectId":23020,
        //              "properties":[
        //                 {
        //                    "propertyId":"objectName",
        //                    "datatype":"Any",
        //                    "propertyValue":"GR_M_IP_0101010014"
        //                 },
        //                 {
        //                    "propertyId":"presentValue",
        //                    "datatype":"Any",
        //                    "propertyValue":5.119999885559082
        //                 }
        //              ]
        //           }
        //        ]
        //     }
        //  }
        //  let type=reqObj.request.query_params.type[0]
        let type = '_p'
        let finalArr = []
        let pres = 0
        //  esponse Posted as JSON: {'request': {'request_uuid': '8d730a25-cc7f-43a0-907c-45da890b75a9', 'request_parts': ['', 'readmultiple', '192.168.1.30', '5:65', 'objectName', 'presentValue', '2:5', 'objectName', 'presentValue', '2:11', 'objectName', 'presentValue', '5:31', 'objectName', 'presentValue', '2:1', 'objectName', 'presentValue', '2:7', 'objectName', 'presentValue', '5:36', 'objectName', 'presentValue', '2:34', 'objectName', 'presentValue', '2:33', 'objectName', 'presentValue', '5:32', 'objectName', 'presentValue'], 'query_params': {'type': ['_p']}}, 'response': {'objectId': ['analogValue', 4], 'changeOfValue': [{'presentValue': '21.870271682739258'}, {'statusFlags': '[0, 0, 0, 0]'}]}}
        reqObj.response.propertyResults.forEach(element => {
          let objToStore = {}
          objToStore['objectId'] = element.objectId
          let ecount = 0
          element.properties.forEach(datat => {
            ecount++
            // data.objectName.substring(2).replace(/ /g, "")
            datat.propertyId == 'objectName' ? objToStore['objName'] = datat.propertyValue.substring(2).replace(/ /g, "") : datat.propertyId == 'presentValue' ? objToStore['presentValue'] = datat.propertyValue : ''
            if (ecount == element.properties.length) {
              finalArr.push(objToStore)
              pres++
              if (pres == reqObj.response.propertyResults.length) {
                let objNameFilter = finalArr.filter(data => data.objName !== undefined)
                console.log("finaraaaaaay", objNameFilter)
                service.insertBacnetreadMuiltiple(objNameFilter, type, (err, result) => {
                  if (err) {
                    console.log("err---------------------->", err)
                    next(err)
                  } else {
                    logger.info("------------every 15 mins--stored---- " + printDate())
                    res.sendStatus(ACCEPTED);
                  }
                })
              }
            }
          })
        })
      }
      break
    default: console.log("ACK from PBS(do nth)")
            //  console.log("",req.body)
             res.sendStatus(ACCEPTED);
             break
  }
 
};

const registerBacnetDevice=(req,res,next)=>{
  //console.log("request.boody",req.body)
  let controllerId=req.body.id
  service.registerBacnetDevice(controllerId,(err,result)=>{
    if(err){
      next(err)
    }else{
      res.status(OK).json(result);
    }
  })
 
}

module.exports = {
  editDeviceName,
  deviceByMac,
  deviceById,
  captureEvent,
  updateDevice,
  updateDeviceDetails,
  deleteDevice,
  registerDevice,
  updateLocationById,
  getdevices,
  captureBacnetEvent,
  registerBacnetDevice
};
