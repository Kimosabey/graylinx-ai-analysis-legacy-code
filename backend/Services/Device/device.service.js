const uuid = require('uuid');
const model = require('./device.model');
const logger = require('../../Config/logger');
const lightservice = require('../Lights/light.service.js');
const { compareAsc, format } = require('date-fns');
const bacnetDevice=require('../../Apps/discoverObject/objDiscover');
const { values } = require('lodash');
const { getdeviceData } = require('../Subsystem/subsystem.model');
const dataloader=require('../../Apps/dataLoader/dataLoader')
const fns = require('date-fns')
const dataLoaderController=require('../../Apps/dataLoader/controller')
const dataLoaderModel=require('../../Apps/dataLoader/model')
const {params}=require('../../Apps/discoverObject/objDiscover')


var deviceTypeJSON =
{
  5003: "thl_sensor",
  "50dc": "dali_master",
  "50d1": "dali_slave",
  5001: "occupancy_sensor",
  5027: "parking_controller",
  5007: "parking_sensor",
  "50ac": "analog_controller",
  5005: "repeater"
};

const deviceByMac = (mac, callback) => {
  model.getDeviceByMac(mac, (error, result) => {
    if (error) {
      callback(error);
    } else {
      if (result && result.length > 0) {
        const device = result[0];
        callback(null, {
          devices: [
            {
              id: device.id,
              name: device.name,
              type: device.type,
              metainfo: {
                mac: device.mac
              },
              installed_at: {
                id: device.zone_id
              }
            }
          ]
        });
      } else {
        callback('Not found');
      }
    }
  });
};

const deviceById = (id, callback) => {
  model.getDeviceById(id, (error, result) => {
    if (error) {
      callback(error);
    } else {
      if (result && result.length > 0) {
        const device = result[0];
        callback(null, device);
      } else {
        callback('Not found');
      }
    }
  });
};

const registerDevice = (device, callback) => {
  const payload = {
    id: uuid(),
    name: device.name,
    type: device.type,
    mac: device.metainfo.mac,
    area_id: device.installed_at.id,
    device_info: device.channelinfo ? JSON.stringify(device.channelinfo) : null,
    x: device.x || null,
    y: device.y || null
  };
  // console.log("key: "+device.metainfo.mac.substr(0,4));
  // console.log("val: "+deviceTypeJSON[device.metainfo.mac.substr(0,4)]);
  // console.log("type: "+device.type);
  if (deviceTypeJSON[device.metainfo.mac.substr(0, 4)] == device.type) {
    model.createDevice(payload, (err, response) => {
      if (err) {
        callback(err);
      } else {
        callback(null, response);
      }
    });
  }
  else {
    callback({ message: "Mac ID and Device type does not matched" });
  }

};

const updateDevice = (device, callback) => {
  model.updateDevice(device, (err, response) => {
    if (err) {
      callback(err);
    } else {
      callback(null, response);
    }
  });
};

const updateDeviceDetails = (device, callback) => {
  model.updateDeviceDetails(device, (err, response) => {
    if (err) {
      callback(err);
    } else {
      callback(null, response);
    }
  });
};

const editDeviceName = (device, callback) => {
  model.editDeviceName(device, (err, response) => {
    if (err) {
      callback(err);
    } else {
      callback(null, response);
    }
  });
};

const deleteDevice = (deviceId, callback) => {
  console.log("deldev=========",deviceId)
  model.deleteDevice(deviceId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      if (result.affectedRows === 1) {
        callback(null, { message: 'success' });
      } else {
        callback('Device Not Found');
      }
    }
  });
};

const updateLocationById = (deviceXY, callback) => {
  model.updateXY(deviceXY, (err, response) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        message: 'successful'
      });
    }
  });
};

const captureEvent = (deviceId, record, callback) => {
  console.log("capture eventtttttttttttttttttttttttttt")
  let device =[]
  device.push(deviceId)
  model.getDeviceHierarchy(device, (err1, results) => {
    if (err1) {
      callback(err1);
    } else {
      if (results.length !== 0) {
        const result = results[0];
        record.name = result.deviceName;
        record.mac=result.mac;
        record.campusId = result.campusId;
        record.buildingId = result.buildingId;
        record.floorId = result.floorId;
        record.zoneId = result.zoneId;
        record.areaId = result.areaId;
        record.campusName = result.campusName;
        record.buildingName = result.buildingName;
        record.floorName = result.floorName;
        record.zoneName = result.zoneName;
        record.floorNumber = result.floorNumber;
        
          model.getLatestEvent(deviceId, (err2, results1) => {
            console.log("latest eventtttttttt capture eventttttttttttttttttttttt",results1)
            console.log("recorddddddddd device capture eventtttttttttttttttttttttttttt",record)
            if (err2) {
              callback(err2);
            } else {
              if (results1 && results1.length > 0) {
                // console.log("results1.length",results1.length)
                let data = JSON.parse(results1[0].data)
                if(results1[0].device_type === "analog_controller" && data.is_event === false){
                    // console.log("new if loop")
                    let req = {}; let user = {};
                    if(results1[0].device_id === record.device.id){
                        if((data.chanel1level!=record.event.chanel1level) || (data.chanel1mode!=record.event.chanel1mode)){
                          req={
                            zone:results1[0].zone_id,
                            WAC:{
                              mode:data.channel1mode,
                              intensity:data.chanel1level,
                              wac:[
                                {
                                  macId:record.mac,
                                  channel:"1"
                                }
                              ]
                            }
                          }
                          user = {
                            id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                            name:"Test_User"
                          }
                          lightservice.lights(req,user,(error3,result3)=>{
                            // console.log("lights api channel1----------")
                            if(error3){
                              callback(error3)
                            }else{
                              callback(null,{message:"success"})
                            }
                          })
                        }
                        if((data.chanel2level!=record.event.chanel2level) || (data.chanel2mode!=record.event.chanel2mode)){
                          req={
                            zone:results1[0].zone_id,
                            WAC:{
                              mode:data.channel2mode,
                              intensity:data.chanel2level,
                              wac:[
                                {
                                  macId:record.mac,
                                  channel:"2"
                                }
                              ]
                            }
                          }
                          user = {
                            id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                            name:"Test_User"
                          }
                          lightservice.lights(req,user,(error3,result3)=>{
                            // console.log("lights api channel2----------")
                            if(error3){
                              callback(error3)
                            }else{
                              callback(null,{message:"success"})
                            }
                          })
                        }else {
                          record.event.lastCmdFrom=='Server'
                          let rec=[]
                          rec.push(record)
                          model.updateLatestEvent(rec, err3 => {
                            if (err3) {
                              callback(err3);
                            }
                            callback(null, "accepted")
                          });
                        }
                    } else { 
                          console.log(" wac id mismatch!!!!!") 
                    }
                // }else if(results1[0].device_type === "dali_slave"){
                  // console.log("inside dali loopppppppppp")
                  //   if(results1[0].device_id === record.device.id){
                  //     if((record.lastCmdFrom!=data.lastCmdFrom || (record.intensity==data.intensity && record.mode==data.mode)) || 
                  //       (record.lastCmdFrom==data.lastCmdFrom || (record.intensity==data.intensity && record.mode==data.mode))){
                  //        console.log("if looop LE taken=================")
                  //         model.getmastermac(record.mac,(err,result)=>{
                  //       if(err){
                  //         callback(err)
                  //       } else {
                  //         if(data.mode!=record.event.mode){
                  //           req={
                  //             zone:results1[0].zone_id,
                  //             DALI:{
                  //               mode:data.mode,
                  //               intensity:data.light_level,
                  //               dali:[{
                  //                 macId:result,
                  //                 slaves:[record.mac],
                  //                 Selection:'slaves'
                  //               }]
                  //             }
                  //           }
                  //           user = {
                  //             id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                  //             name:"Test_User"
                  //           }
                  //           lightservice.lights(req,user,(error3,result3)=>{
                  //             // console.log("lights api channel1----------")
                  //             if(error3){
                  //               callback(error3)
                  //             }else{
                  //               callback(null,{message:"success"})
                  //             }
                  //           })
                  //         } else {
                  //           record.event.lastCmdFrom='Server'
                  //           let rec=[];
                  //           rec.push(record)
                  //           model.updateLatestEvent(rec,(err3,resultup)  => {
                  //             if (err3) {
                  //               callback(err3);
                  //             }
                  //             callback(null, "accepted")
                  //           });
                  //         }
                  //       }
                  //     })
                  //     } else {
                  //       console.log("elese loop GE taken--------------------------------")
                  //       let rec=[];
                  //       rec.push(record)
                  //       model.updateLatestEvent(rec,(err3,resultup)  => {
                  //         if (err3) {
                  //           callback(err3);
                  //         } else {
                  //           callback(null, "accepted")
                  //         }
                  //       });
                  //     }
                  //   } else {
                  //     console.log("dali id mismatch!!!!!!!!!!!!!!")
                  //   }  
                } else{
                  console.log("else looopppppppppppppppppp")
                  let rec=[];
                  rec.push(record)
                  model.updateLatestEvent(rec,(err3,resultup)  => {
                    if (err3) {
                      callback(err3);
                    } else {
                      callback(null, "accepted")
                    }
                  });
                }
                // else {
                //   console.log("else loop")
                // model.updateLatestEvent(record, err3 => {
                //   if (err3) {
                //     callback(err3);
                //   }
                //   callback(null, "accepted")
                //   });
                // }
              } else {
                // console.log("create laesettttttt event")
                let rec =[]
                rec.push(record)
                  model.createLatestEvent(rec, (err4 ,result) => {
                    if (err4) {
                      callback(err4);
                    } else {
                      // setTimeout(() => callback(null, "accepted"), 200);
                      callback(null, "accepted")
                    }
                  });  
              }
            }
          }); 
      }
    }
  });
};

const captureEventloop = (deviceId, record, callback) => {
  console.log("capture event lopppppppppppppppppppppppp",record)
  console.log("deviceiddddddddd",deviceId)
  if(deviceId.length>=2){
    // console.log("device idddddddddddddddddddd if looppppppppppppppppp")
    // deviceId.forEach(element => { 
      model.getDeviceHierarchy(deviceId,(err1,results)=>{
         console.log("get device hirarchyyyy",results)
        if(err1){
          callback(err1);
        } else {
          let i=0;
          let count=0;
          results.forEach((ele,index)=>{
            console.log("device id from for each-->",ele[0].deviceId)
            model.getLatestEvent(ele[0].deviceId,(err2,results1)=>{
              if(err2){
                callback(err2)
              } else{
                 console.log("LE from DB",results1)
                if(results1.length!=0){
                  let data = JSON.parse(results1[0].data)
                  if(results1[0].device_type === "analog_controller" && data.is_event === false){
                    console.log("if loppp")
                    let req = {}; let user = {};
                    if(results1[0].device_id === record.device.id){
                        if((data.chanel1level!=record.event.chanel1level) || (data.chanel1mode!=record.event.chanel1mode)){
                          req={
                            zone:results1[0].zone_id,
                            WAC:{
                              mode:data.channel1mode,
                              intensity:data.chanel1level,
                              wac:[
                                {
                                  macId:record.mac,
                                  channel:"1"
                                }
                              ]
                            }
                          }
                          user = {
                            id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                            name:"Test_User"
                          }
                          count++;
                          lightservice.lights(req,user,(error3,result3)=>{
                            // console.log("lights api channel1----------")
                            if(error3){
                              callback(error3)
                            }else{
                              if(count==results.length){
                                callback(null,{message:"success"})
                              }
                            }
                          })
                        }
                        if((data.chanel2level!=record.event.chanel2level) || (data.chanel2mode!=record.event.chanel2mode)){
                          req={
                            zone:results1[0].zone_id,
                            WAC:{
                              mode:data.channel2mode,
                              intensity:data.chanel2level,
                              wac:[
                                {
                                  macId:record.mac,
                                  channel:"2"
                                }
                              ]
                            }
                          }
                          user = {
                            id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                            name:"Test_User"
                          }
                          count++;
                          lightservice.lights(req,user,(error3,result3)=>{
                            // console.log("lights api channel2----------")
                            if(error3){
                              callback(error3)
                            }else{
                              if(count==results.length){
                                callback(null,{message:"success"})
                              }
                            }
                          })
                        }else {
                          console.log("if loop 3rd else bloack")
                          record.event.lastCmdFrom=='Server'
                          let rec=[]
                          rec.push(record)
                          count++;
                          // model.updateLatestEvent(rec, err3 => {
                          model.updatewacLE(rec,deviceId,(err3,resultup)  => {
                            if (err3) {
                              callback(err3);
                            }else{
                              if(count==results.length){
                                callback(null, "accepted")
                              }
                            }
                          });
                        }
                    } else { 
                          console.log(" wac id mismatch!!!!!")
                          callback(null,"suceess") 
                    }
                  // }else if(results1[0].device_type === "dali_slave"){
                  // console.log("inside dali loopppppppppp")
                  //   if(results1[0].device_id === record.device.id){
                  //     if((record.lastCmdFrom!=data.lastCmdFrom || (record.intensity==data.intensity && record.mode==data.mode)) || 
                  //       (record.lastCmdFrom==data.lastCmdFrom || (record.intensity==data.intensity && record.mode==data.mode))){
                  //        console.log("if looop LE taken=================")
                  //         model.getmastermac(record.mac,(err,result)=>{
                  //       if(err){
                  //         callback(err)
                  //       } else {
                  //         if(data.mode!=record.event.mode){
                  //           req={
                  //             zone:results1[0].zone_id,
                  //             DALI:{
                  //               mode:data.mode,
                  //               intensity:data.light_level,
                  //               dali:[{
                  //                 macId:result,
                  //                 slaves:[record.mac],
                  //                 Selection:'slaves'
                  //               }]
                  //             }
                  //           }
                  //           user = {
                  //             id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                  //             name:"Test_User"
                  //           }
                  //           lightservice.lights(req,user,(error3,result3)=>{
                  //             // console.log("lights api channel1----------")
                  //             if(error3){
                  //               callback(error3)
                  //             }else{
                  //               callback(null,{message:"success"})
                  //             }
                  //           })
                  //         } else {
                  //           record.event.lastCmdFrom='Server'
                  //           let rec=[];
                  //           rec.push(record)
                  //           model.updateLatestEvent(rec,(err3,resultup)  => {
                  //             if (err3) {
                  //               callback(err3);
                  //             }
                  //             callback(null, "accepted")
                  //           });
                  //         }
                  //       }
                  //     })
                  //     } else {
                  //       console.log("elese loop GE taken--------------------------------")
                  //       let rec=[];
                  //       rec.push(record)
                  //       model.updateLatestEvent(rec,(err3,resultup)  => {
                  //         if (err3) {
                  //           callback(err3);
                  //         } else {
                  //           callback(null, "accepted")
                  //         }
                  //       });
                  //     }
                  //   } else {
                  //     console.log("dali id mismatch!!!!!!!!!!!!!!")
                  //   }
                  }else{
                    console.log("else loop===========================",record)
                    let rec=[];
                    rec.push(record)
                      // model.updateLatestEvent(rec,(err3,resultup)  => {
                        model.updatewacLE(rec,deviceId,(err3,resultup)  => {
                        console.log("response from LEEEE")
                        if (err3) {
                          callback(err3);
                        } else{
                          count++;
                          if(count==results.length){
                            callback(null, "accepted")
                          }
                        }
                      });
                    // console.log("before sending to latest event---->",rec)
                  } 
                } else{
                  let rec =[]
                  rec.push(record)
                  // model.createLatestEvent(rec, (err4 ,result) => {
                  model.createwacLE(rec,deviceId, (err4 ,result) => {
                    if (err4) {
                      callback(err4);
                    } else {
                      count++;
                      if(count==results.length){
                        callback(null, "accepted")
                      }
                    }
                  });
                }
              }
            })
          })
        } 
    });
  // }) 
  } else {
    console.log("deviceIddddddddddd else loop")
    model.getDeviceHierarchy(deviceId, (err1, results) => {
      if (err1) {
        callback(err1);
      } else {
        // setTimeout(() => { 
          if (results.length !== 0) {
            const result = results[0];
            record.device.id=deviceId
            record.name=result.deviceName
            record.mac=result.mac;
            record.campusId = result.campusId;
            record.buildingId = result.buildingId;
            record.floorId = result.floorId;
            record.zoneId = result.zoneId;
            record.areaId = result.areaId;
            record.campusName = result.campusName;
            record.buildingName = result.buildingName;
            record.floorName = result.floorName;
            record.zoneName = result.zoneName;
            record.floorNumber = result.floorNumber;
            model.getLatestEvent(deviceId, (err2, results1) => {
              if (err2) {
                callback(err2);
              } else {
                if (results1 && results1.length > 0) {
                  let data = JSON.parse(results1[0].data)
                  if(results1[0].device_type === "analog_controller" && data.is_event === false){                
                    console.log("new if loop")
                    let req = {}; let user = {};
                        if(results1[0].device_id === record.device.id){
                            if((data.chanel1level!=record.event.chanel1level) || (data.chanel1mode!=record.event.chanel1mode)){
                              req={
                                zone:results1[0].zone_id,
                                WAC:{
                                  mode:data.channel1mode,
                                  intensity:data.chanel1level,
                                  wac:[
                                    {
                                      macId:record.mac,
                                      channel:"1"
                                    }
                                  ]
                                }
                              }
                              user = {
                                id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                                name:"Test_User"
                              }
                              lightservice.lights(req,user,(error3,result3)=>{
                                console.log("lights api channel1----------")
                                if(error3){
                                  callback(error3)
                                }else{
                                  callback(null,{message:"success"})
                                }
                              })
                            }
                            if((data.chanel2level!=record.event.chanel2level) || (data.chanel2mode!=record.event.chanel2mode)){
                              req={
                                zone:results1[0].zone_id,
                                WAC:{
                                  mode:data.channel2mode,
                                  intensity:data.chanel2level,
                                  wac:[
                                    {
                                      macId:record.mac,
                                      channel:"2"
                                    }
                                  ]
                                }
                              }
                              user = {
                                id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                                name:"Test_User"
                              }
                              lightservice.lights(req,user,(error3,result3)=>{
                                console.log("lights api channel2----------")
                                if(error3){
                                  callback(error3)
                                }else{
                                  callback(null,{message:"success"})
                                }
                              })
                            }else {
                              record.event.lastCmdFrom='Server'
                              let rec=[];
                              rec.push(record)
                              model.updateLatestEvent(rec, err3 => {
                                if (err3) {
                                  callback(err3);
                                }
                                callback(null, "accepted")
                              });
                            }
                        } else { 
                              console.log("id mismatch!!!!!") 
                        }
                  // } if(results1[0].device_type === "dali_slave" && data.is_event === false){ 
                  //       if(results1[0].device_id === record.device.id){
                  //         model.getmastermac(record.mac,(err,result)=>{
                  //           if(err){
                  //             callback(err)
                  //           } else {
                  //             if(data.mode!=record.event.mode){
                  //               req={
                  //                 zone:results1[0].zone_id,
                  //                 DALI:{
                  //                   mode:results1[0].data.mode,
                  //                   intensity:results1[0].data.light_level,
                  //                   dali:[{
                  //                     macId:result,
                  //                     slaves:[record.mac],
                  //                     Selection:'slaves'
                  //                   }]
                  //                 }
                  //               }
                  //               user = {
                  //                 id:"78e8fd9b-4118-4b96-9df6-380d928e2c4a",
                  //                 name:"Test_User"
                  //               }
                  //               lightservice.lights(req,user,(error3,result3)=>{
                  //                 // console.log("lights api channel1----------")
                  //                 if(error3){
                  //                   callback(error3)
                  //                 }else{
                  //                   callback(null,{message:"success"})
                  //                 }
                  //               })
                  //             } else {
                  //               record.event.lastCmdFrom='Server'
                  //               let rec=[];
                  //               rec.push(record)
                  //               model.updateLatestEvent(rec,(err3,resultup)  => {
                  //                 if (err3) {
                  //                   callback(err3);
                  //                 }
                  //                 callback(null, "accepted")
                  //               });
                  //             }
                  //           }
                  //         })
                  //       } else {
                  //         console.log("dali id mismatchhhhhhh!")
                  //       } 
                  }else {
                      // console.log("insideeeeeeeeee db",results1)
                      // console.log("update latest event recordddddddddd",record)
                      let rec=[];
                      rec.push(record)
                      model.updateLatestEvent(rec,(err3,resultup)  => {
                        if (err3) {
                          callback(err3);
                        }
                        // console.log("im a update callback")
                        callback(null, "accepted")
                      });
                    }
                  } else {
                      // console.log("insideeeeeeeeee db",results1)
                      // console.log("create latest eventtttttt",record)
                      let rec=[];
                      rec.push(record)
                      model.createLatestEvent(rec, (err4 ,result) => {
                        if (err4) {
                          callback(err4);
                        } else {
                          // console.log("i am a create callback")
                          // setTimeout(() => callback(null, "accepted"), 200);
                          callback(null, "accepted")
                        }
                      });  
                  }
                }
              }); 
          }
        // }, 5000);
      }
    });
  }  
};


const getdevices=(callback)=>{
  // console.log("service controllerrrrrrrrrr")
  model.getdevices((err,res)=>{
    if(err){
      callback(err)
    } else {
      // console.log("resssssss",res)
      callback(null,res)
    }
  })
}

const captureBacnetEvent = (record, callback) => {
  //uncomment will running with device 760-763 ,799,801
  // dataloader.setFlag(record.ip,record.instance,(errInstance,resultInstance)=>{
  //   if(errInstance){
  //     callback(errInstance)
  //   }else{
      model.getInstancesList(record.ip,record.instance,(err,results)=>{
        if(err){
          callback(err)
        }else{
         let arr1=[];
         let payload ={}
            let res=results[0]
            let arr2 ={}
            arr2["ss_id"]=(res.id)
            arr2["measured_time"]=(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
            arr2["param_id"]= res.parameter
            arr2["param_value"]=(record.value)
            arr2["ss_type"]=res.ss_type
            switch(res.ss_type){
              case "NONGL_SS_EMS":
              payload["tablename"]="em_"+res.tag+"_om_t"
              payload["data"]=arr2
              arr1.push(payload)
              break;
              case "NONGL_SS_AHU":
                payload["tablename"]="Ahu_"+res.tag+"_om_p"
                payload["data"]=arr2
              arr1.push(payload)
              break;
              case "NONGL_SS_CHILLER":
                payload["tablename"]="ch_"+res.tag+"_om_p"
                payload["data"]=arr2
              arr1.push(payload)
              break;
              case "NONGL_SS_PUMPS":
                payload["tablename"]="pu_"+res.tag+"_om_p"
                payload["data"]=arr2
              arr1.push(payload)
              break;
              case "NONGL_SS_SECONDARY_PUMPS":
                payload["tablename"]="secpu_"+res.tag+"_om_p"
                payload["data"]=arr2
              arr1.push(payload)
              break;
              default:
              break;
              }
        model.updateData(arr1,(err,results)=>{
          if(err){
            callback(err)
          }else{
            callback(null,results)
          }
        })
        }
      })
    //}

  //})
  }

  const constructPermanentTableQuery=(name,column)=>{
    let queryArr=column.map(data=>'`'+data.name+'` varchar(40) DEFAULT NULL')
    let queryStr=queryArr.join(",");
    let tableCreate='CREATE TABLE  IF NOT EXISTS '+' '+name+' '+'(`id` int NOT NULL AUTO_INCREMENT,`ss_id` varchar(36) DEFAULT NULL,`measured_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,'+' '+queryStr+' '+',`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`id`),KEY `ss_id` (`ss_id`),CONSTRAINT `'+name+'_ibfk_1` FOREIGN KEY (`ss_id`) REFERENCES `gl_subsystem` (`id`))'
    return(tableCreate)
  }
  const createTempPermanentTable=(data,callback)=>{
   console.log('---------------------762')
    let tempTableName=[]
    data.devices.forEach(Element=>{
      switch(Element.ss_type){
        case "NONGL_SS_EMS":tempTableName.push("em_"+Element.ss_address_value+"_om_t")
                            break;
        case "NONGL_SS_AHU":tempTableName.push("Ahu_"+Element.ss_address_value+"_om_p")
                            break;
        default:
                break;                                                    
            }
    })
    model.createTempTable(tempTableName,(err,result)=>{
      if(err){
        callback(err+'_creating_temp_table')
      }else{
          //callback(null,result)
          //createing permanent table
          let queries=[]
          let count=0
          console.log("--------------------device list780",data.devices.length)
          data.devices.forEach(devData=>{
            let tableName=''
            switch(devData.ss_type){
              case "NONGL_SS_EMS": tableName="em_"+devData.ss_address_value+"_om_p"
                                   queries.push( constructPermanentTableQuery(tableName,data.paramerter[devData.uuid]))
                                   count++
                                   if(count==data.devices.length){
                                    model.createPerTable(queries,(err,result)=>{
                                      if(err){
                                        callback(err)
                                      }else{
                                        console.log(">>>>>>>>>>>table p_15 created")
                                        callback(null,result)
                                      }
                                    })
                                   }  
                                  break;
              // case "NONGL_SS_AHU": tableName="Ahu_"+devData.ss_address_value+"_om_p"
              //                      queries.push( constructPermanentTableQuery(tableName,data.paramerter[devData.uuid]))
              //                      count++
              //                      if(count==data.devices.length){
              //                       model.createPerTable(queries,(err,result)=>{
              //                         if(err){
              //                           callback(err)
              //                         }else{
              //                           callback(null,result)
              //                         }
              //                       })
              //                      }
              //                     break;
              default:
                      count++
                      if(count==data.devices.length){
                        model.createPerTable(queries,(err,result)=>{
                          if(err){
                            callback(err)
                          }else{
                            console.log(">>>>>>>>>>>table p_15 created")
                            callback(null,result)
                          }
                        })
                       }  
                      break;                                                    
                  }
  
          })
      }
    })
    
  }
  


  const registerBacnetDevice=(contollerId,callback)=>{
    bacnetDevice.discoverFromDag(contollerId,(err,res)=>{
      if(err){
        callback(err)
      }else{
        callback(null,res)
        //node bacnet stack
    // //  let TempDevice= {
    // //       "000801": "f300d945-825b-4644-8fb9-b2fb02f105c0",
    // //        "000901":"01f8d696-5abc-4ba1-a3be-415bedaed456",
    // //       // "020202":"f300d945-825b-4644-8fb9-b2fb02f105c0"
    // //   }
    //       let count=0
    //       let response=[]
    //       let parmObj={}
    //       if(Object.keys(res).length>0){
    //         for(var key in res){
    //           // console.log("key----->",res[key])
    //            model.getBacnetDeviceData(res[key],(err,result)=>{
    //                  if(err){
    //                    console.log("error",err)
    //                  }else{
    //                    //console.log("reuslt",JSON.stringify(result))
    //                    let device=result.filter(data => data.ss_type=='NONGL_SS_EMS' ||  data.ss_type=='NONGL_SS_AHU')
    //                    let paramObjArr=result.filter(data => data.ss_parent==device[0].uuid)
    //                    parmObj[device[0].uuid]=paramObjArr
    //                    //console.log('objects--------------------->',JSON.stringify( paramObjArr))
    //                    //console.log("pARADMDMMDOBJ",JSON.stringify(parmObj))
    //                    response.push(device[0])
    //                    count++
    //                     if(count==Object.keys(res).length){
    //                       //console.log("results",result)
    //                       //callback(null,{"devices":response,"paramerter":parmObj})
    //                       createTempPermanentTable({"devices":response,"paramerter":parmObj},(err3,res3)=>{
    //                        if(err3){
    //                          callback(err3)
    //                        }else{
    //                          callback(null,{"devices":response,"paramerter":parmObj})
    //                        }
    //                       })
    //                     }                                      
    //                  }
    //            })
    //          }
    //       }else{
    //         callback(null,"NO DEVICE")
    //       }
         
        
      }
    })
  }
  
  const getTable=(ip,instance,callback)=>{
      model.getTable(ip,instance,(error,result)=>{
        if(error){
          callback(error)
        }else{
          let response=result[0].ss_type=="NONGL_SS_EMS"?{'tableName':'em_'+result[0].tag+'_om_t','ss_id':result[0].id,'param_id':result[0].parameter}:{'tableName':'ahu_'+result[0].tag+'_om_p','ss_id':result[0].id,'param_id':result[0].parameter}
          callback(null,response)
        }
      })
  }

  const captureBacnetTrend=(ip,instance,data,callback)=>{
    getTable(ip,instance,(errorTab,resultTab)=>{
      if(errorTab){
        callback(errorTab)
      }else{
       let finalArr=[]
       let count=0
       data.forEach(Element=>{
        let dataArr=[]
         dataArr.push(resultTab.ss_id)
         dataArr.push(resultTab.param_id)
         dataArr.push(Element.logDatum.realValue)
         dataArr.push(Element.timestamp)
        finalArr.push(dataArr)
        count++
        if(count==data.length){
          model.insertIntoTempTable(resultTab.tableName,finalArr,(errorFin,resultFin)=>{
            if(errorFin){
              callback(errorFin)
            }else{
              callback(null,resultFin)
            }
          })
        }
       })
     
      }
    })

  }


  const getssid=(fid,callback)=>{
    //console.log("fid=====>",objNameFilter)
    // let obj_name = fid.filter(data => data.objName.slice(0,2) === 'GR')
    //                           .map(data => data.objName.slice(8, 14));
    let obj_name = fid.map(data => data.objName.slice(2,8));
    //console.log('=>',obj_name)
    let devices=  new Set(obj_name);
    const device_list = [...devices];
    model.getDeviceByAddr(device_list,(err,result)=>{
      if(err){
        callback(err)
      }else{
        let resObj={}
        let count=0
        result.forEach(data=>{
          resObj[data.ss_address_value]=data.id
          count++
          if(count==result.length){
            callback(null,resObj)
          }
        })
       
      }
    })
  }


  const insertBacnetreadMuiltiple=(data,type,callback)=>{
    getssid(data,(err,res_ssid)=>{
      if(err){
        callback(err)
      }else{
        let deviceType={'00':'NONGL_SS_EMS','A0':'NONGL_SS_AHU','B0':'NONGL_SS_CHILLER','B1':'NONGL_SS_PUMPS','B2':'NONGL_SS_SECONDARY_PUMPS','B3':'NONGL_SS_CONDENSER_PUMPS','B4':'NONGL_SS_COOLING_TOWERS'}
        let datac=0
        let resArr=[]
        data.forEach(Element=>{
          let resObj={}
          resObj['ins']=Element.objectId
          resObj['id']=res_ssid[Element.objName.slice(2, 8)]
          resObj['param']=params[Element.objName.slice(6,12).toUpperCase()]
          resObj['p_value']=Element.presentValue
          resObj['time']=fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
          resObj['devType']=deviceType[Element.objName.slice(6,8)]
          resObj['tableName']=deviceType[Element.objName.slice(6,8)]=='NONGL_SS_EMS'?'em_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_AHU'?'ahu_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_CHILLER'?'ch_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_PUMPS'?'pu_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_SECONDARY_PUMPS'?'secpu_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_CONDENSER_PUMPS'?'cond_'+Element.objName.slice(2,8)+'_om_p' :  deviceType[Element.objName.slice(6,8)]=='NONGL_SS_COOLING_TOWERS'?'cotw_'+Element.objName.slice(2,8)+'_om_p' : []
          resArr.push(resObj)
          datac++
          if(datac==data.length){
            //inserting into denormalized table 
            // dataLoaderController.insertEmData(resArr)
            dataLoaderModel.insertUpdatePLE(resArr,type,(errIns,resultIns)=>{
              if(errIns){
                  callback(errIns)
              }else{
                  callback(null,resultIns)
              }
          })
          }
        })
        
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
  captureEventloop,
  captureBacnetEvent,
  registerBacnetDevice,
  captureBacnetTrend,
  insertBacnetreadMuiltiple
};
