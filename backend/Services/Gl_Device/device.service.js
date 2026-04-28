const uuid = require('uuid');
const model = require('./device.model');
const logger = require('../../Config/logger');
const { param } = require('express-validator');
const { result, forEach } = require('lodash');
const { parse, format,addMinutes } = require('date-fns');
const { toFixed } = require('../../Utils/common');
const { input } = require('../../Config/logger');


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
    zone_id: device.installed_at.id,
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

const registerGlDevice = (device, callback) => {
  const payload = {
    id: uuid(),
    name: device.name,
    type: device.type,
    //mac: device.metainfo.mac,
    zone_id: device.installed_at.id,
    params : device.params
    //device_info: device.channelinfo ? JSON.stringify(device.channelinfo) : null,
    //x: device.x || null,
    //y: device.y || null
  };
  var mac;
  if(payload.type == 'gateway') {
    model.createGlDevice(payload, (err, response) => {
      if (err) {
        callback(err);
      } else {
        callback(null, response);
      }
    });
  }
  else {
    payload.params.forEach(element => {
      if(element.param_name == "mac") {
        mac = element.param_value;
      }
    });
    console.log("mac: ",mac.substr(0,4))
    if (deviceTypeJSON[mac.substr(0, 4)] == device.type) {
      model.createGlDevice(payload, (err, response) => {
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

// const captureEvent = (deviceId, record, callback) => {
//   console.log("record in controller",record)
//   raiseAlarm(deviceId,record,(error,results)=>{
// if(error){
//   callback(error)
// }else{

//   model.createLatestEvent(deviceId,record,(error,result)=>{
//     if(error){
//       callback(error)
//     }else{
//       callback(null,result)
//     }
  
//   })
 
// }
//   })
  


// };
// previous code
// const captureEvent = (deviceId, record, callback) => {
//   console.log("record in controller",record)
//   model.createLatestEvent(deviceId,record,(error,result)=>{
//     if(error){
//       callback(error)
//     }else{
//       raiseAlarm(deviceId,record,(error,results)=>{
//         if(error){
//           callback(error)
//         }else{
//           console.log("--------",results)
//       callback(null,results)
//     } 
//   })
//   }
//   })
// };


const captureEvent = (deviceId, record, callback) => {
  //console.log("record in controller----------------------------------",record)
  model.userId((error,results)=>{
    if(error){
      callback(error)
    }else{
     results.forEach(element=>{
     let userid = element.id
  model.createLatestEvent(userid,deviceId,record,(error,result)=>{
    if(error){
      callback(error)
    }else{
      // raiseAlarm(deviceId,record,(error,results)=>{
      //   if(error){
      //     callback(error)
      //   }else{
      //     console.log("--------",results)
      model.updateSubystemLatestEvent(userid,deviceId,record,(error3,result3)=>{
        if(error3){
          callback(error3)
        }else{
          callback(null,result3)
        }

      })
     
  //  } 
  // })
  }
  })
})
}
})
};

// const raiseAlarm=(deviceId,record,callback)=>{
//   model.userId((error,results)=>{
//     if(error){
//       callback(error)
//     }else{
//         let userid = results[0].id 
//   model.getSubsystemDeatils(deviceId,record,(error,results)=>{
//   if(error){
//     callback(error)
//   }else{
//           let Tmin = 18; let Tmax = 26; 
//           let Hmin = 50; let Hmax = 60; 
//           let Lmin = 160; let Lmax = 180;
//           let Bmin = 20;
//           switch(results[0].ss_type){
//          case 'GL_SS_THLSENSOR_TYPE_01':
//               var data = {...record.event}
//               // console.log("alaram temp",record.event,Object.keys(data).length)
//              ss_id = record.device.id
//               count = 0;
//               let insertData= []
//               for(var key in data) {
//                 if (data.hasOwnProperty(key)) {
//                   var param_id = key
//                   var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
//                   if(key=="temperature") {
//                     param_value = toFixed(JSON.parse(JSON.stringify(data[key])).value,2)
//                     console.log("in alaram",param_id+" -> "+param_value)

//                       if(param_value>=Tmax){
//                         console.log("it is hot")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push('temperatureCrossedUcl')
//                         data.push(param_value)
//                         data.push(305)
//                         data.push("temperatureCrossedUcl")
//                         insertData.push(data)
//                         count++
//                          console.log("insertdata",insertData)
//                          console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                           if(error){
//                             callback(error)
//                           }else{
//                             console.log("inserted")
//                             callback(null,"inserted")
//                           }
//                         })
//                         }
//                       }else if(param_value<=Tmin){
//                         console.log("it is cold")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push('temperatureCrossedLcl')
//                         data.push(param_value)
//                         data.push(306)
//                         data.push("temperatureCrossedLcl")
//                         insertData.push(data)
//                         count++
//                         console.log("count",count)
//                         // console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                        if(error){
//                          callback(error)
//                        }else{
//                          callback(null,"inserted")
//                        }
//                      })
//                         }
//                       }
//                     else{
//                       console.log("it is normal")
//                       let data =[]
//                       data.push(ss_id)
//                       data.push(measured_time)
//                       data.push('restore')
//                       data.push(param_value)
//                       data.push(305)
//                       data.push(306)
//                       insertData.push(data)
//                       count++
//                        console.log("count",count)
//                       if(count==Object.keys(record.event).length){
//                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                      if(error){
//                        callback(error)
//                      }else{
//                        console.log("inserted")
//                        callback(null,"inserted")
//                      }
//                    })
//                       }

//                     }
//                   }else if(key=="humidity") {
//                     param_value = toFixed(JSON.parse(JSON.stringify(data[key])).value,2)

//                       if(param_value>=Hmax){
//                         console.log("it is humid")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push('humidityCrossedUcl')
//                         data.push(param_value)
//                         data.push(307)
//                         data.push("humidityCrossedUcl")
//                         insertData.push(data)
//                         count++
//                          console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                             if(error){
//                               callback(error)
//                             }else{
//                               console.log("inserted")
//                               callback(null,"inserted")
//                             }
//                           })
//                         }
                       
//                       }else if(param_value<=Hmin){
//                         console.log("it is dry")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push('humidityCrossedLcl')
//                         data.push(param_value)
//                         data.push(308)
//                         data.push("humidityCrossedLcl")
//                         insertData.push(data)
//                         count++
//                         console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                             if(error){
//                               callback(error)
//                             }else{
//                               console.log("inserted")
//                               callback(null,"inserted")
//                             }
//                           })
//                         }
                      
//                       }
//                     else{
//                       console.log("it is normal")
//                       let data =[]
//                       data.push(ss_id)
//                       data.push(measured_time)
//                       data.push('restore')
//                       data.push(param_value)
//                       data.push(307)
//                       data.push(308)
//                       insertData.push(data)
//                       count++
//                       // console.log("count",count)
//                       if(count==Object.keys(record.event).length){
//                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                           if(error){
//                             callback(error)
//                           }else{
//                             console.log("inserted")
//                             callback(null,"inserted")
//                           }
//                         })
//                       }
//                     }
//                   }else if(key=="luminousity") {
//                     param_value = toFixed(JSON.parse(JSON.stringify(data[key])).value,2)

//                       if(param_value>=Lmax){
//                         console.log("it is bright")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push("luminousityCrossedUcl")
//                         data.push(param_value)
//                         data.push(309)
//                         data.push("luminousityCrossedUcl")
//                         insertData.push(data)
//                         count++
//                         // console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                             if(error){
//                               callback(error)
//                             }else{
//                               console.log("inserted")
//                               callback(null,"inserted")
//                             }
//                           })

//                         }
                       
//                       }else if(param_value<=Lmin){
//                         console.log("it is dark")
//                         let data =[]
//                         data.push(ss_id)
//                         data.push(measured_time)
//                         data.push("luminousityCrossedLcl")
//                         data.push(param_value)
//                         data.push(310)
//                         data.push("luminousityCrossedLcl")
//                         insertData.push(data)
//                         count++
//                         // console.log("count",count)
//                         if(count==Object.keys(record.event).length){
//                           model.insertGlAlaram(userid,insertData,(error,results)=>{
//                             if(error){
//                               callback(error)
//                             }else{
//                               console.log("inserted")
//                               callback(null,"inserted")
//                             }
//                           })
//                         }
                        
//                       }
//                     else{
//                       console.log("it is normal")
//                       count++
//                       let data =[]
//                       data.push(ss_id)
//                       data.push(measured_time)
//                       data.push('restore')
//                       data.push(param_value)
//                       data.push(309)
//                       data.push(310)
//                       insertData.push(data)
//                       // console.log("count",count)
//                       if(count==Object.keys(record.event).length){
//                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                           if(error){
//                             callback(error)
//                           }else{
//                             console.log("inserted")
//                             callback(null,"inserted")
//                           }
//                         })
//                       }
//                     }
//                   }else if(key=="battery"){
//                      param_value = JSON.parse(data[key])
//                   //  param_value = JSON.parse(JSON.stringify(data[key])).value
//                   console.log("data--------",data)
//                   console.log("keyyy------",key)
//                     console.log("battery",JSON.parse(data[key]))
//                     if(param_value<=Bmin){
//                       console.log("battery low")
//                       // data.push(ss_id)
//                       // data.push(measured_time)
//                       // data.push("luminousityCrossedLcl")
//                       // data.push(param_value)
                     


//                       let data =[]
//                       data.push(ss_id)
//                       data.push(measured_time)
//                       data.push("batteryCrossedLcl")
//                       data.push(param_value)
//                       data.push(311)
//                       data.push("batteryCrossedLcl")
//                       insertData.push(data)
//                       count++
//                       // console.log("count",count)
//                       if(count==Object.keys(record.event).length){
//                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                           if(error){
//                             callback(error)
//                           }else{
//                             console.log("inserted")
//                             callback(null,"inserted")
//                           }
//                         })
//                       }
//                     }else{
//                       console.log("it is normal")
//                       count++
//                       let data =[]
//                       data.push(ss_id)
//                       data.push(measured_time)
//                       data.push('restore')
//                       data.push(param_value)
//                       data.push(311)
//                       data.push(312)
//                       insertData.push(data)
//                       // console.log("count",count)
//                       if(count==Object.keys(record.event).length){
//                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                           if(error){
//                             callback(error)
//                           }else{
//                             console.log("inserted")
//                             callback(null,"inserted")
//                           }
//                         })
//                       }
//                     }
//                   }
//                   else {
//                   // param_value = JSON.parse(JSON.stringify(data[key])).value
//                   console.log("checking the key")
//                   count++
//                   // console.log("count",count)
//                   if(count==Object.keys(record.event).length){
//                     model.insertGlAlaram(userid,insertData,(error,results)=>{
//                       if(error){
//                         callback(error)
//                       }else{
//                         console.log("inserted")
//                         callback(null,"inserted")
//                       }
//                     })
//                   }
//                   }     
//                 }
//               }      
//               break;

              
//          case 'NONGL_SS_AHU':
        
//               //  console.log("im in ahu")
//               //  console.log("Ahudata",record)
//               //  console.log("name",record[0].name)
//               //  console.log("id",deviceId)
             
//                ss_id= deviceId;
               
//                 model.inputGl(deviceId,(err,results)=>{
//                   if(err){
//                     callback(err)
//                   }else{
//                    // console.log("results",results)
//                     let index = 0;
//                     let insertData = []
//                     results.forEach(eleinp=>{
//                      // console.log("-----------eleinp",eleinp)
//                      let param_value = parseFloat(eleinp.param_value)
//                      let i=0;
//                        record.forEach(elerec=>{
//                         //  console.log("----------elect",elerec)
//                         //  console.log("-----------------------------------",i)
//                         var measured_time= format(new Date(elerec.time), 'yyyy-MM-dd HH:mm:ss');
//                         if(eleinp.param_id==elerec.name){
//                           if(elerec.name=='ahu_chilled_valve'){
//                             // console.log("ahu_chilled_valve","present",elerec.presentValue,"param_value",param_value)
//                              if(elerec.presentValue-param_value>5){
//                                console.log("chilled_valve_high")
//                                param_value = elerec.presentValue
                             
//                                let data = []
//                                data.push(ss_id)
//                                data.push(measured_time)
//                                data.push("chilled_valve_high")
//                                data.push(param_value)
//                                insertData.push(data)
//                                i++
//                               //  console.log("chilled_valve_high i",i)
//                                if(i==record.length){
//                                  index++
//                                 //  console.log("chilled_valve_high index",index)
//                                  if(index==results.length){
//                                    if(insertData.length>0){
//                                      model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                        if(error){
//                                          callback(error)
//                                        }else{
//                                          console.log("inserted")
//                                          callback(null,"inserted")
//                                        }
//                                      })

//                                    }else{
//                                      console.log("no alarm")
//                                    }

//                                  }
//                                }
//                              }else if(elerec.presentValue-param_value<-5){
//                                 console.log("chilled_valve_low")
//                                 param_value = elerec.presentValue
                              
//                                let data = []
//                                data.push(ss_id)
//                                data.push(measured_time)
//                                data.push("chilled_valve_low")
//                                data.push(param_value)
//                                insertData.push(data)
//                                i++
//                               //  console.log("chilled_valve_low i",i)
//                                if(i==record.length){
//                                  index++
//                                 //  console.log("chilled_valve_low index",index)
//                                  if(index==results.length){
//                                    if(insertData.length>0){
//                                      model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                        if(error){
//                                          callback(error)
//                                        }else{
//                                          console.log("inserted")
//                                          callback(null,"inserted")
//                                        }
//                                      })

//                                    }else{
//                                      console.log("no alarm")
//                                    }

//                                  }
//                                }
//                              }else{
//                               console.log("it is not much difference in valve position")
//                               i++
//                               if(i==record.length){
//                                 index++
//                                 // console.log("index",index)
//                                 if(index==results.length){
//                                   // console.log("i,index")
//                                   if(insertData.length>0){
//                                     model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                       if(error){
//                                         callback(error)
//                                       }else{
//                                         console.log("inserted")
//                                         callback(null,"inserted")
//                                       }
//                                     })

//                                   }else{
//                                     console.log("no alarm")
//                                   }
//                                 }
//                               }
//                             }
//                             console.log("param_id",eleinp.param_id,"name",elerec.name)
//                           }else if(elerec.name=='ahu_chill_water_temperature'){
//                             // console.log("ahu_chill_water_temperature","present",elerec.presentValue,"param_value",param_value)
//                              if(elerec.presentValue-param_value>0.5){
//                                console.log("chilled_water_temp_high")
//                                param_value = elerec.presentValue
                             
//                                let data = []
//                                data.push(ss_id)
//                                data.push(measured_time)
//                                data.push("chilled_water_temp_high")
//                                data.push(param_value)
//                                insertData.push(data)
//                                i++
//                               //  console.log("chilled_water_temp_high i",i)
//                                if(i==record.length){
//                                  index++
//                                 //  console.log("chilled_water_temp_high index",index)
//                                  if(index==results.length){
//                                    if(insertData.length>0){
//                                      model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                        if(error){
//                                          callback(error)
//                                        }else{
//                                          console.log("inserted")
//                                          callback(null,"inserted")
//                                        }
//                                      })

//                                    }else{
//                                      console.log("no alarm")
//                                    }

//                                  }
//                                }
//                              }else if(elerec.presentValue-param_value<-0.5){
//                                 console.log("chilled_water_temp_low")
//                                 param_value = elerec.presentValue
                             
//                                let data = []
//                                data.push(ss_id)
//                                data.push(measured_time)
//                                data.push("chilled_water_temp_low")
//                                data.push(param_value)
//                                insertData.push(data)
//                                i++
//                               //  console.log("chilled_water_temp_low i",i)
//                                if(record.length){
//                                  index++
//                                 //  console.log("chilled_water_temp_low index",index)
//                                  if(index==results.length){
//                                    if(insertData.length>0){
//                                      model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                        if(error){
//                                          callback(error)
//                                        }else{
//                                          console.log("inserted")
//                                          callback(null,"inserted")
//                                        }
//                                      })

//                                    }else{
//                                      console.log("no alarm")
//                                    }

//                                  }
//                                }
//                              }else{
//                               console.log("it is not much difference in chill_water_temperature")
//                               i++
//                               if(i==record.length){
//                                 index++
//                                 // console.log("index",index)
//                                 if(index==results.length){
//                                   // console.log("i,index")
//                                   if(insertData.length>0){
//                                     model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                       if(error){
//                                         callback(error)
//                                       }else{
//                                         console.log("inserted")
//                                         callback(null,"inserted")
//                                       }
//                                     })
                                    
//                                   }else{
//                                     console.log("no alarm")
//                                   }
//                                 }
//                               }
//                             }
//                           }
//                         }else {
//                           i++
//                           if(i==record.length){
//                             index++
//                             if(index==results.length){
//                               if(insertData.length>0){
//                                 model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                   if(error){
//                                     callback(error)
//                                   }else{
//                                     console.log("inserted")
//                                     callback(null,"inserted")
//                                   }
//                                 })

//                               }else{
//                                 console.log("no alarm")
//                               }
//                             }
//                           }
//                           if(eleinp.param_id=="ahu_set_point"){
//                             if(elerec.name=='ahu_supply_air_temperature'){
//                               // console.log("ahu_supply_air_temperature","present",elerec.presentValue,"param_value",param_value)
//                                if(elerec.presentValue-param_value>2){
//                                  console.log("supply_air_temp_high")
//                                  param_value = elerec.presentValue
                             
//                                let data = []
//                                data.push(ss_id)
//                                data.push(measured_time)
//                                data.push("supply_air_temp_high")
//                                data.push(param_value)
//                                insertData.push(data)
//                                i++
//                               //  console.log("supply_air_temp_high i",i)
//                                if(i==record.length){
//                                  index++
//                                 //  console.log("supply_air_temp_high index",index)
//                                  if(index==results.length){
//                                    if(insertData.length>0){
//                                      model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                        if(error){
//                                          callback(error)
//                                        }else{
//                                          console.log("inserted")
//                                          callback(null,"inserted")
//                                        }
//                                      })

//                                    }else{
//                                      console.log("no alarm")
//                                    }

//                                  }
//                                }
//                                }else if(elerec.presentValue-param_value<-2){
//                                   console.log("supply_air_temp_low")
//                                   param_value = elerec.presentValue
                              
//                                   let data = []
//                                   data.push(ss_id)
//                                   data.push(measured_time)
//                                   data.push("supply_air_temp_low")
//                                   data.push(param_value)
//                                   insertData.push(data)
//                                   i++
//                                   // console.log("supply_air_temp_low i",i)
//                                   if(i==record.length){
//                                     index++
//                                     // console.log("supply_air_temp_low index",index)
//                                     if(index==results.length){
//                                       if(insertData.length>0){
//                                         model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                           if(error){
//                                             callback(error)
//                                           }else{
//                                             callback(null,"inserted")
                                           
//                                           }
//                                         })
//                                       }else{
//                                         console.log("no alarm")
//                                       }
                                     

//                                     }
//                                   }
//                                }else{
//                                 console.log("it is not much difference in temperature")
//                                 i++
//                                 if(i==record.length){
//                                   index++
//                                   // console.log("index",index)
//                                   if(index==results.length){
//                                     // console.log("i,index")
//                                     if(insertData.length>0){
//                                       model.insertGlAlaram(userid,insertData,(error,results)=>{
//                                         if(error){
//                                           callback(error)
//                                         }else{
//                                           console.log("inserted")
//                                           callback(null,"inserted")
//                                         }
//                                       })
//                                     }else{
//                                       console.log("no alarm")
//                                     }
                                  
//                                   }
//                                 }
//                               }
//                             }
//                           }
//                         }
//                       })
//                     })           
//                   }   
//                 })
//                 break;
//          default:
//                   callback(null,"Accepted")
//                   break;
//           }
//    // callback(null,results)
//   }
// })

// }
// })
// }

module.exports = {
  editDeviceName,
  deviceByMac,
  deviceById,
  captureEvent,
  updateDevice,
  updateDeviceDetails,
  deleteDevice,
  registerDevice,
  registerGlDevice,
  updateLocationById,
  // raiseAlarm
};
