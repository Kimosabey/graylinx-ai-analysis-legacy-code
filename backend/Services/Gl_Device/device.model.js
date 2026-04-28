const uuid = require('uuid/v4');
const { pool } = require('../../Database/pool');
const influx = require('../../Database/influx.js');
const logger = require('../../Config/logger');
const { compareAsc, format } = require('date-fns');
const { error, data } = require('../../Config/logger');
const mail =require('./../../Apps/Discover/controller')

const createDevice = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'SELECT total_devices from super_admin',
        (error, count) => {
          if (error) {
            connection.release();
            // logger.error("ACTION: Get no of devices from Registration; DEVICE NAME: "+payload.name+
              // "; DEVICE ID: "+payload.id+"; DEVICE MAC: "+payload.mac+  
              // "; RESULT: Unable to create device; USER: admin; ROLE: super_admin")
            callback(error);
          } else {
            connection.query(
              'SELECT count(*) as count from device',
              (error1, device_count) => {
                if (error1) {
                  connection.release();
                  // logger.error("ACTION: Get no of devices from Registration; DEVICE NAME: "+payload.name+
                    // "; DEVICE ID: "+payload.id+"; DEVICE MAC: "+payload.mac+  
                    // "; RESULT: Unable to create device; USER: admin; ROLE: super_admin")
                  callback(error1);
                } else {
                  if (device_count[0].count >= count[0].total_devices) {
                    connection.release();
                    callback("You are not allowed to add any new device!!")
                  } else {
                    connection.query("select * from device where name = ?", payload.name, (error, results) => {
                      if (results.length > 0) {
                        connection.release();
                        var err1 = new Error(`${payload.name} already exists`);
                        err1.status = 404;
                        logger.error("ACTION: Create Device;" +
                          "; RESULT: Device Name already exists; USER: admin; ROLE: super_admin")
                        callback(err1)
                      }
                      else {
                        connection.query('select * from device where mac = ?', payload.mac, (error1, results1) => {
                          if(results1.length > 0) {
                            connection.release();
                            var err2 = new Error(`This Mac-ID is already exists`);
                            err2.status = 404;
                            logger.error("ACTION: Create Device;" +
                              "; RESULT: Device Mac already exists; USER: admin; ROLE: super_admin")
                            callback(err2)
                          }
                          else {
                            connection.query(
                              'INSERT INTO device SET ?',
                              payload,
                              (error2, results3) => {
                                connection.release();
                                if (error2) {
                                  logger.error("ACTION: Device Registration; DEVICE NAME: "+payload.name+
                                    "; DEVICE ID: "+payload.id+"; DEVICE MAC: "+payload.mac+  
                                    "; RESULT: Unable to create device; USER: admin; ROLE: super_admin")
                                  callback(error2);
                                } else {
                                  logger.info("ACTION: Device Registration; DEVICE NAME: "+payload.name+
                                    "; DEVICE ID: "+payload.id+"; DEVICE MAC: "+payload.mac+  
                                    "; RESULT: Success; USER: admin; ROLE: super_admin")
                                  callback(null, payload.id);
                                }
                              }
                            );
                          }
                        })
                      }
                    })
                  } 
                }
              }
            );
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

const createGlDevice = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query("SELECT count(*) as count from gl_device WHERE name = ? and device_type = ?", [payload.name, payload.type], (err1, result1) => {
        console.log("result: ",result1)
        if (result1[0].count == 0) {
          connection.query("INSERT INTO gl_device (id, name, device_type) VALUES (?,?,?)", [payload.id, payload.name, payload.type], (err2, result2) => {
            if (result2) {
              connection.query("INSERT INTO gl_device_layout (id, zone_id, device_id) VALUES (?,?,?)", [uuid(), payload.zone_id, payload.id], (err3, result3) => {
                if (result3) {
                  payload.params.forEach(element => {
                    connection.query("INSERT INTO gl_device_detail (id, device_id, param_name, param_value) VALUES (?,?,?,?)", [uuid(), payload.id, element.param_name, element.param_value], (err3, result4) => {                      
                    })
                  });
                }
              })
              logger.info("ACTION: Create Device; Device ID: " + payload.id +
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, payload.id);
            }
            else {
              callback(err2)
            }
          })
        }
        else {
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Floor;" +
            "; RESULT: Zone Name already exists; USER: admin; ROLE: super_admin")
          callback(err1)
        }
      })
    } else {
      callback(err);
    }
  });
};

// const createEvent = (record, callback) => {
//   pool.getConnection((err, connection) => {
//     if (connection) {
//       connection.query(
//         'INSERT INTO event SET ?',
//         {
//           id: uuid(),
//           data: JSON.stringify(record.event, null, 2),
//           device_id: record.device.id,
//           device_type: record.device.type
//         },
//         (error, results) => {
//           connection.release();
//           if (error) {
//             callback(error);
//           } else {
//             callback(null, results);
//           }
//         }
//       );
//     } else {
//       callback('DB connection error');
//     }
//   });
// };

const createEvent = (record, callback) => {
  let final_data;
  const data_new = JSON.stringify(record.event, null, 2);

  switch(record.device.type) {
    case 'occupancy_sensor':
      // code block
      final_data = {
        battery: record.event.battery,
        occupancy: record.event.occupancy,
        data: data_new
        // humanOccupancy: record.event.human_occupancy.value,
        // vehicleOccupancy: record.event.vehicle_occupancy.value
      }
      break;
      case 'thl_sensor':
        final_data = {
          battery: record.event.battery,
          humidity: record.event.humidity.value,
          temperature: record.event.temperature.value,
          luminousity: record.event.luminousity.value,
          data: data_new
        }
      break;
    default:
      console.log("device type not defined")
  }
  influx
    // .writePoints([
    //   {
    //     measurement: 'event',
    //     tags: { deviceId: record.device.id, deviceType: record.device.type, zoneId: record.zone_id, floorId: record.floor_id, buildingId: record.building_id},
    //     fields: final_data
    //   }
    // ])
    .writePoints([
      {
        measurement: 'event',
        tags: { deviceId: record.device.id, deviceType: record.device.type, deviceName: record.name, zoneId: record.zoneId, floorId: record.floorId, buildingId: record.buildingId,campusId: record.campusId, zoneName: record.zoneName, floorName: record.floorName, buildingName: record.buildingName, campusName: record.campusName},
        fields: final_data
      }
    ])
    .then(() => callback(null, 'success'))
    .catch((err) => {
      console.log(err.stack)
      callback(err.stack)
    });
};

const updateDevice = (device, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'UPDATE device SET zone_id = ? WHERE id = ?';
      connection.query(query, [device.zone_id, device.id], (error, results) => {
        connection.release();
        if (error) {
          logger.error("ACTION: Update Device; DEVICE ID: "+device.id+"; ZONE ID: "+device.zone_id+  
            "; RESULT: Failed to update the Zone ID of device; USER: admin; ROLE: super_admin")
          callback(error);
        } else {
          logger.info("ACTION: Update Device; DEVICE ID: "+device.id+"; ZONE ID: "+device.zone_id+  
              "; RESULT: Success; USER: admin; ROLE: super_admin")
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateDeviceDetails = (device, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'UPDATE device SET name = ?, zone_id = ? WHERE id = ?';
      connection.query(query, [device.name, device.zone_id, device.id], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          logger.info("ACTION: Update Device  DEVICE ID: "+device.id+" RESULT: Success")
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const deleteDevice = (deviceId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'DELETE FROM device WHERE id = ?';
      connection.query(query, deviceId, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          logger.info("ACTION: Delete Device  DEVICE ID: "+deviceId+" RESULT: Success")
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateXY = (deviceXY, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'update device set x= ?, y = ? where id=?';
      connection.query(query, [deviceXY.x, deviceXY.y, deviceXY.id], _err => {
        connection.release();
        if (_err) {
          callback('Update Error');
        } else {
          callback(null, 'Successful');
        }
      });
    } else {
      callback(err);
    }
  });
};

const getDeviceByMac = (mac, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `SELECT * FROM device WHERE mac = ?`;
      connection.query(query, mac, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const getDeviceById = (id, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `SELECT d.id id, d.name name, d.type type, d.mac mac, z.id zone_id, z.name zone_name, f.id floor_id, f.name floor_name from device d, zone z, floor f where d.id = ? and d.zone_id=z.id and z.floor_id=f.id`;
      connection.query(query, id, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const getDeviceLayout = (deviceId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const sql =
        `select zone_id from gl_device_layout where device_id = ?`;
      connection.query(sql, [deviceId], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const getLatestEvent = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sql = 'select * from gl_device_operation where device_id=?';
      connection.query(sql, [deviceId], (getLatestEventerror, result) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

// const updateLatestEvent = (deviceId, record, zone_id, callback) => {
//   if(record.device.type == "AQS_sensor") {
//     delete  record.event.temperature;
//     delete record.event.humidity;
//   }
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       var data = record.event
//       device_id = record.device.id
//       count = 0;
//       for(var key in data) {
//         count++;
//         if (data.hasOwnProperty(key)) {
//           var param_name = key
//           var param_value;
//           if(key == "battery") {
//             param_value = data[key]
//           }
//           else {
//             param_value = JSON.parse(JSON.stringify(data[key])).value
//           }
//           console.log(param_name+" -> "+param_value)
//           //console.log("update gl_device_operation set param_name = "+param_name+", param_value = "+param_value+"where param_name = "+param_name)
//           connection.query(
//             "update gl_device_operation set param_name = '"+param_name+"', param_value = '"+param_value+"' where param_name = '"+param_name+"' and device_id = '"+deviceId+"'", (error, result) => {
//               if(error) {
//                 console.log(error)
//                 callback(error)
//               }
//             }
//           )
//         }
//         //connection.release()
//       }
//       if(count == Object.keys(data).length) {
//         connection.release()
//         callback(null, "Event successfull")
//       }
//     } else {
//       callback('DB connection error');
//     }
//   });
// };
// previous code 
// const createLatestEvent = (ss_id, record, callback) => {
//   if(record.device.type == "occupancy_sensor") {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       var data = {... record.event,... record.network}
//       console.log("record: ",data)
//       ss_id = record.device.id
//       count = 0; 
//       for(var key in data) {
//         if (data.hasOwnProperty(key)) {
//           var param_id = key
//           var param_value=data[key];
//           var measured_time= moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
//           console.log(param_id+" -> "+param_value)
//           connection.query(
//             `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//               if(error) {
//                 console.log(error)
//               }else{
//               count++
                  //  dataa=[]
                  //   data,push(cat)
                  //   data.push(ss_id)
                  //   insertIbmsData.push[data]
                    
                   //               if(count == Object.keys(data).length) {
                    // connection.release()
                    // insertintoIbms(insertIbmsData,(error,result)=>{
                    //   if(error){

                    //   }else{

                        //                 callback(null, "Event successfull")
                    //   }
                    // })
//                
//               }
//               }
//             }
//           )
//         }
//         console.log("---------------------",count)      
//       }
//     } else {
//       callback('DB connection error');
//     }
//   });
// }
// if(record.device.type == "thl_sensor") {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       var data = {... record.event,... record.network}
//       console.log("record: ",data)
//       ss_id = record.device.id
//       count = 0; 
//       for(var key in data) {
//         if (data.hasOwnProperty(key)) {
//           var param_id = key
//           var measured_time= moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
//           if(key == "humidity" || key == "luminousity" || key=="temperature") {
//             param_value = data[key.value]
//           }
//           else {
//             param_value = JSON.parse(JSON.stringify(data[key])).value
//           }
//           if(key == "battery" || key == "is_event" || key=="sampling_interval" || key == "lqi" || key =="parentAddress" || key == "rssi") {
//             param_value = data[key]
//           }
//           else {
//             param_value = JSON.parse(JSON.stringify(data[key])).value
//           }
//           console.log(param_id+" -> "+param_value)
//           connection.query(
//             `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//               if(error) {
//                 console.log(error)
//               }else{
//               count++
//               if(count == Object.keys(data).length) {
//                 connection.release()
//                 callback(null, "Event successfull")
//               }
//               }
//             }
//           )
//         }
//               console.log("---------------------",count)               
//       }
//     } else {
//       callback('DB connection error');
//     }
//   });

// }
// if(record.device.type == "dali_slave") {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       var data = {... record.event,... record.network}
//       console.log("record: ",data)
//       ss_id = record.device.id
//       count = 0; 
//       for(var key in data) {
//         if (data.hasOwnProperty(key)) {
//           var param_id = key
//           var param_value=data[key];
//           var measured_time=moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
//           console.log(param_id+" -> "+param_value)
//           connection.query(
//             `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//               if(error) {
//                 console.log(error)
//               }else{
//               count++
//               if(count == Object.keys(data).length) {
//                 connection.release()
//                 callback(null, "Event successfull")
//               }
//               }
//             }
//           )
//         }
//         console.log("---------------------",count)      
//       }
//     } else {
//       callback('DB connection error');
//     }
//   });
// }

// if(record.device.type == "analog_controller") {
//   pool.getConnection((error, connection) => {
//     if (connection) {
//       var data = {... record.event,... record.network}
//       console.log("record: ",data)
//       ss_id = record.device.id
//       count = 0; 
//       for(var key in data) {
//         if (data.hasOwnProperty(key)) {
//           var param_id = key
//           var param_value=data[key];
//           var measured_time=moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
//           console.log(param_id+" -> "+param_value)
//           connection.query(
//             `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//               if(error) {
//                 console.log(error)
//               }else{
//               count++
//               if(count == Object.keys(data).length) {
//                 connection.release()
//                 callback(null, "Event successfull")
//               }
//               }
//             }
//           )
//         }      
//       }
//     } else {
//       callback('DB connection error');
//     }
//   });
//   }
// };

const createLatestEvent = (userid,ss_id, record, callback) => {
  let  insertIbmsData =[]
  if(record.device.type == "occupancy_sensor") {
  pool.getConnection((error, connection) => {
    if (connection) {
      var data = {... record.event,... record.network}
      console.log("record: ",data)
      ss_id = record.device.id
    let count = 0; 
      for(var key in data) {
        let  dataa=[]
        if (data.hasOwnProperty(key)) {
          var param_id = key
          var param_value=data[key];
          var event_time= format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss');
          var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
          var category = 'GL_EVENT_CATEGORY_MEASURED';
           var triggering_user = userid;
          console.log(param_id+" -> "+param_value)
          dataa.push(category)
          dataa.push(ss_id)
          dataa.push(param_id)
          dataa.push(param_value)
          dataa.push(event_time)
          dataa.push(triggering_user)
          console.log("insert",insertIbmsData)
          insertIbmsData.push(dataa)
          connection.query(
            `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
              if(error) {
                console.log(error)
              }else{  
                count++
              if(count == Object.keys(data).length) {
                connection.release()
                insertintoIbms(insertIbmsData,(error,results)=>{
                  if(error){
                    callback(error)
                  }else{
                    callback(null, "Event successfull")
                  }
                })
              }
              }
            }
          )
        }
      }
    } else {
      callback('DB connection error');
    }
  });
}
if(record.device.type == "thl_sensor") {
  pool.getConnection((error, connection) => {
    if (connection) {
      var data = {... record.event,... record.network}
      console.log("record: ",data)
      ss_id = record.device.id
      var category = 'GL_EVENT_CATEGORY_MEASURED';
      var triggering_user = userid; 
      count = 0; 
      for(var key in data) {
        let dataa =[];
        if (data.hasOwnProperty(key)) {
          var param_id = key
          var event_time= format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss');
          var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
          if(key == "humidity" || key == "luminousity" || key=="temperature") {
            param_value = data[key.value]
          }
          else {
            param_value = JSON.parse(JSON.stringify(data[key])).value
          }
          if(key == "battery" || key == "is_event" || key=="sampling_interval" || key == "lqi" || key =="parentAddress" || key == "rssi") {
            param_value = data[key]
          }
          else {
            param_value = JSON.parse(JSON.stringify(data[key])).value
          }
          dataa.push(category)
          dataa.push(ss_id)
          dataa.push(param_id)
          dataa.push(param_value)
          dataa.push(event_time)
          dataa.push(triggering_user)
          insertIbmsData.push(dataa)
          console.log(param_id+" -> "+param_value)
          connection.query(
            `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
              if(error) {
                console.log(error)
              }else{
              count++
              if(count == Object.keys(data).length) {
                connection.release()
                 insertintoIbms(insertIbmsData,(error,results)=>{
                  if(error){
                    callback(error)
                  }else{
                    callback(null, "Event successfull")
                  }
                })
               
              }
              }
            }
          )
        }
      }
    } else {
      callback('DB connection error');
    }
  });

}
if(record.device.type == "dali_slave") {
  callback(null,"a")
  // pool.getConnection((error, connection) => {
  //   if (connection) {
  //     var data = {... record.event,... record.network}
  //     console.log("record: ",data)
  //     ss_id = record.device.id
  //     var category = 'GL_EVENT_CATEGORY_MEASURED';
  //     var triggering_user = userid;
  //     count = 0; 
  //     for(var key in data) {
  //       let dataa = []
  //       if (data.hasOwnProperty(key)) {
  //         var param_id = key
  //         var param_value=data[key];
  //         var event_time=moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
  //         var measured_time=moment().format('YYYY-MM-DD HH:mm:ss');
  //         dataa.push(category)
  //         dataa.push(ss_id)
  //         dataa.push(param_id)
  //         dataa.push(param_value)
  //         dataa.push(event_time)
  //         dataa.push(triggering_user)
  //         insertIbmsData.push(dataa)
  //         console.log(param_id+" -> "+param_value)
  //         connection.query(
  //           `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
  //             if(error) {
  //               console.log(error)
  //             }else{
  //             count++
  //             if(count == Object.keys(data).length) {
  //               connection.release()
  //               insertintoIbms(insertIbmsData,(error,results)=>{
  //                 if(error){
  //                   callback(error)
  //                 }else{
  //                   callback(null, "Event successfull")
  //                 }
  //               })
  //             }
  //             }
  //           }
  //         )
  //       }
  //     }
  //   } else {
  //     callback('DB connection error');
  //   }
  // });
}
if(record.device.type == "analog_controller") {
  callback(null,"a")
  // pool.getConnection((error, connection) => {
  //   if (connection) {
  //     var data = {... record.event,... record.network}
  //     console.log("record: ",data)
  //     ss_id = record.device.id
  //     var category = 'GL_EVENT_CATEGORY_MEASURED';
  //     var triggering_user = userid;
  //     count = 0; 
  //     for(var key in data) {
  //       let dataa = []
  //       if (data.hasOwnProperty(key)) {
  //         var param_id = key
  //         var param_value=data[key];
  //         var event_time=moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
  //         var measured_time=moment().format('YYYY-MM-DD HH:mm:ss');
  //         dataa.push(category)
  //         dataa.push(ss_id)
  //         dataa.push(param_id)
  //         dataa.push(param_value)
  //         dataa.push(event_time)
  //         dataa.push(triggering_user)
  //         insertIbmsData.push(dataa)
  //         console.log(param_id+" -> "+param_value)
  //         connection.query(
  //           `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
  //             if(error) {
  //               console.log(error)
  //             }else{
  //             count++
  //             if(count == Object.keys(data).length) {
  //               connection.release()
  //               insertintoIbms(insertIbmsData,(error,results)=>{
  //                 if(error){
  //                   callback(error)
  //                 }else{
  //                   callback(null, "Event successfull")
  //                 }
  //               })
  //             }
  //             }
  //           }
  //         )
  //       }      
  //     }
  //   } else {
  //     callback('DB connection error');
  //   }
  // });
}
};

const editDeviceName = (device, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'UPDATE device SET name = ? where id = ?',
        [device.name, device.id],
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info("ACTION: Edit Device Name; DEVICE ID: "+device.id+  
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, { message: 'Success' });
            } else {
              logger.error("ACTION: Edit Device Name; DEVICE ID: "+device.id+  
                "; RESULT: Device Not Found; USER: admin; ROLE: super_admin")
              callback({ message: 'Device Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};


const getSubsystemDeatils = (deviceId,record,callback) =>{
  pool.getConnection((err,connection)=>{
    if(connection){
      connection.query(
        'select * from gl_subsystem where id=?',[deviceId],(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            console.log("resssmodel",results)
             callback(null,results)
          }
        }
      )
    }
  })
};

const insertGlAlaram = (userid,insertData,callback) =>{
  if(insertData.length>0){
    let update_alarm_array=[]
    let create_alarm_array=[]
    let alarm_array=insertData.filter(e=>e[2]!='restore')
    console.log("===========alaram araay",alarm_array)
    let restore_array=insertData.filter(e=>e[2]=='restore')
    console.log("===========restodre araay",restore_array)
    if(alarm_array.length>0){
      console.log("===========alaram  insidearaay",alarm_array)
      let alCount=0
      alarm_array.forEach(element=>{
            getAlarmDetail(element[0],element[4],(erro,resultAl)=>{
              if(erro){
                callback(erro)
              }else{
                if(resultAl.length>0){
                    update_alarm_array.push(element)
                    alCount++
                    if(alCount==alarm_array.length){
                      console.log("=============>update< create",update_alarm_array,create_alarm_array)
                          updateOrCreateGlalarm(update_alarm_array,create_alarm_array,(err1,result1)=>{
                            if(err1){
                              callback(err1)
                            }else{
                              //callback(null,result1)
                              if(restore_array.length>0){
                                  restore_alarm(restore_array,(err2,result2)=>{
                                    if(err2){
                                      callback(err2)
                                    }else{
                                      callback(null,result2)
                                    }
                                  })
                              }else{
                                callback(null,result1)
                              }
                            }
                          })
                    }
                }else{
                  alCount++
                  create_alarm_array.push(element)
                  if(alCount==alarm_array.length){
                    console.log("=============>update >create",update_alarm_array,create_alarm_array)
                    updateOrCreateGlalarm(update_alarm_array,create_alarm_array,(err1,result1)=>{
                      if(err1){
                        callback(err1)
                      }else{
                        //callback(null,result1)
                        if(restore_array.length>0){
                          restore_alarm(restore_array,(err2,result2)=>{
                            if(err2){
                              callback(err2)
                            }else{
                              callback(null,result2)
                            }
                          })
                      }else{
                        callback(null,result1)
                      }
                      }
                    })

                  }
                }
              }

            })


      })
    }else{
      if(restore_array.length>0){
        restore_alarm(restore_array,(err2,result2)=>{
          if(err2){
            callback(err2)
          }else{
            callback(null,result2)
          }
        })
    }
    }
    // pool.getConnection((err,connection)=>{
    //   if(connection){
       












    //     // const query =  'insert into gl_alarm (ss_id,measured_time,param_id,param_value,alarm_code,message) values ?';
    //     //   connection.query(query,[alarm_array],(err,results)=>{
    //     //     connection.release();
    //     //     if(err){
    //     //       callback(err)
    //     //     }else{
    //           // let i=0;
    //           // insertData.forEach((element)=>{
    //           //   // console.log(element[2])
    //           //   element.push(element[2])
    //           //   element.push(userid)
    //           //   element.push("GL_EVENT_CRITICALITY_HIGH")
    //           //   element.push("GL_EVENT_CATEGORY_MEASURED")
    //           //   console.log("insertdata----------->",insertData)
    //           //  i++
    //           //   if(i==insertData.length){
    //           //       eventsAlarm(insertData,(err,results)=>{
    //           //         if(err){
    //           //           callback(err)
    //           //         }else{
    //           //           console.log("----------------ina got callback")
    //           //           callback(null,results)
    //           //         }
    //           //       })
    //           //   }
    //           //   // callback(null,results)
    //           // })
    // //           callback(null,results)
    // //       }
    // //     })
    //   }
    // })

  }else{
    callback(null,"no alarm")
  }
}

const inputGl =(deviceId,callback) =>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =  'select somo.ss_id,somo.triggered_time,somo.param_id,somo.param_value from gl_subsystem_input_map somo inner join (select max(triggered_time) as mea,som.ss_id as sid,param_id,param_value from gl_subsystem_input_map som inner join gl_subsystem ssm on som.ss_id=ssm.id where som.ss_id=? group by som.ss_id,som.param_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id);';
        connection.query(query,[deviceId],(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
        }
      })
    }
  })
}

const userId =(callback) =>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =  'select * from gl_user where name="SYSTEM"';
        connection.query(query,(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            console.log("userId",results)
            callback(null,["abc12334"])
        }
      })
    }
  })
}


const insertintoIbms=(insertIbmsData,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =  'insert into gl_ibms_event (category,ss_id,param_id,param_value,event_time,triggering_user) values ?';
        connection.query(query,[insertIbmsData],(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
        }
      })
    }
  })
}

const eventsAlarm=(insertData,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =  'insert into gl_ibms_event (ss_id,event_time,param_id,param_value,alarm_id,triggering_user,criticality,category) values ?';
        connection.query(query,[insertData],(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
        }
      })
    }
  })
}


const updateSubystemLatestEvent = (userid,ss_id, record, callback) => {
  let  insertIbmsData =[]
  if(record.device.type == "occupancy_sensor") {
  pool.getConnection((error, connection) => {
    if (connection) {
      var data = {... record.event,... record.network}
      console.log("record: ",data)
      ss_id = record.device.id
    let count = 0;
   let finaldata=[] 
      for(var key in data) {
        let  dataa=[]
        if (data.hasOwnProperty(key)) {
          var param_id = key
          var param_value=data[key];
          var event_time= format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss');
          var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
          var category = 'GL_EVENT_CATEGORY_MEASURED';
           var triggering_user = userid;
          console.log(param_id+" -> "+param_value)
          let paylo={}
          paylo["ss_id"]=ss_id
          paylo["param_id"]=param_id
          paylo["param_value"]=param_value
          finaldata.push(paylo)
           insertIbmsData.push(dataa)
          console.log(param_id+" -> "+param_value)
              count++
              if(count == Object.keys(data).length){
                console.log("=====================finaldata",finaldata)
                let count1=0
                finaldata.forEach(element => {
                  const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
                  connection.query(query,[element.ss_id,element.param_id],(err,results)=>{
                  if (err) {
                    connection.release();
                    callback(err);
                  } else {
                    if(results.length>0){
                      //update
                      const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                      connection.query(query,[element.param_value,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.ss_id,element.param_id],(err1,results1)=>{
                        if(err1){
                          callback(err1)
                        }else{
                          count1++
                          console.log("=====================count",count1)
                          console.log("result1---->uodtae",results1)
                          if(finaldata.length==count1){
                            connection.release();
                            callback(null,results1)
                          }
                        }
                      })
                    }else{
                      //insert
                      const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                      connection.query(query,[ element.ss_id,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.param_id,element.param_value],(err2,results2)=>{
                        if(err2){
                          callback(err2)
                        }else{
                          count1++
                          if(finaldata.length==count1){
                            connection.release();
                            callback(null,results2)
                          }
                        }
                      })
                      
                    }
                   
                  }
                  })
                });              







                   }
        }
      }
    } else {
      callback('DB connection error');
    }
  });
}
if(record.device.type == "thl_sensor") {
  pool.getConnection((error, connection) => {
    if (connection) {
      var data = {... record.event,... record.network}
      console.log("record: ",data)
      ss_id = record.device.id
      var category = 'GL_EVENT_CATEGORY_MEASURED';
      var triggering_user = userid; 
      count = 0; 
      let finaldata=[]
      console.log("------->data",data)
      for(var key in data) {
        let dataa =[];
        if (data.hasOwnProperty(key)) {
          var param_id = key
          var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
          if(key == "humidity" || key == "luminousity" || key=="temperature") {
            param_value = data[key.value]
          }
          else {
            param_value = JSON.parse(JSON.stringify(data[key])).value
          }
          if(key == "battery" || key == "is_event" || key=="sampling_interval" || key == "lqi" || key =="parentAddress" || key == "rssi"||key=="Sensor_type") {
            param_value = data[key]
          }
          else {
            param_value = JSON.parse(JSON.stringify(data[key])).value
          }
          let paylo={}
          paylo["ss_id"]=ss_id
          paylo["param_id"]=param_id
          paylo["param_value"]=param_value
          finaldata.push(paylo)
           insertIbmsData.push(dataa)
          console.log(param_id+" -> "+param_value)
              count++
              if(count == Object.keys(data).length){
                console.log("=====================finaldata",finaldata)
                let count1=0
                finaldata.forEach(element => {
                  const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
                  connection.query(query,[element.ss_id,element.param_id],(err,results)=>{
                  if (err) {
                    connection.release();
                    callback(err);
                  } else {
                    if(results.length>0){
                      //update
                      const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                      connection.query(query,[element.param_value,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.ss_id,element.param_id],(err1,results1)=>{
                        if(err1){
                          callback(err1)
                        }else{
                          count1++
                          console.log("=====================count",count1)
                          console.log("result1---->uodtae",results1)
                          if(finaldata.length==count1){
                            connection.release();
                            callback(null,results1)
                          }
                        }
                      })
                    }else{
                      //insert
                      const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                      connection.query(query,[ element.ss_id,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.param_id,element.param_value],(err2,results2)=>{
                        if(err2){
                          callback(err2)
                        }else{
                          count1++
                          if(finaldata.length==count1){
                            connection.release();
                            callback(null,results2)
                          }
                        }
                      })
                      
                    }
                   
                  }
                  })
                });              







                   }
        }
      }
    } else {
      callback('DB connection error');
    }
  });

}
if(record.device.type == "dali_slave") {
  callback(null,"a")
  // pool.getConnection((error, connection) => {
  //   if (connection) {
  //     var data = {... record.event,... record.network}
  //     console.log("record: ",data)
  //     ss_id = record.device.id
  //     var category = 'GL_EVENT_CATEGORY_MEASURED';
  //     var triggering_user = userid;
  //     count = 0; 
  //     let finaldata=[]
  //     for(var key in data) {
  //       let dataa = []
  //       if (data.hasOwnProperty(key)) {
  //         var param_id = key
  //         var param_value=data[key];
  //         var event_time= format(new Date(record.timestamp), 'yyyy-MM-dd HH:mm:ss');
  //         var measured_time= format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  //         console.log(param_id+" -> "+param_value)
  //         let paylo={}
  //         paylo["ss_id"]=ss_id
  //         paylo["param_id"]=param_id
  //         paylo["param_value"]=param_value
  //         finaldata.push(paylo)
  //         console.log(param_id+" -> "+param_value)
  //             count++
  //         if(count == Object.keys(data).length){
  //           console.log("=====================finaldata",finaldata)
  //           let count1=0
  //           finaldata.forEach(element => {
  //             const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
  //             connection.query(query,[element.ss_id,element.param_id],(err,results)=>{
  //             if (err) {
  //               connection.release();
  //               callback(err);
  //             } else {
  //               if(results.length>0){
  //                 //update
  //                 const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
  //                 connection.query(query,[element.param_value,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.ss_id,element.param_id],(err1,results1)=>{
  //                   if(err1){
  //                     callback(err1)
  //                   }else{
  //                     count1++
  //                     console.log("=====================count",count1)
  //                     console.log("result1---->uodtae",results1)
  //                     if(finaldata.length==count1){
  //                       connection.release();
  //                       callback(null,results1)
  //                     }
  //                   }
  //                 })
  //               }else{
  //                 //insert
  //                 const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
  //                 connection.query(query,[ element.ss_id,(format(new Date(), 'yyyy-MM-dd HH:mm:ss')),element.param_id,element.param_value],(err2,results2)=>{
  //                   if(err2){
  //                     callback(err2)
  //                   }else{
  //                     count1++
  //                     if(finaldata.length==count1){
  //                       connection.release();
  //                       callback(null,results2)
  //                     }
  //                   }
  //                 })
                  
  //               }
               
  //             }
  //             })
  //           });              







  //              }
  //       }
  //     }
  //   } else {
  //     callback('DB connection error');
  //   }
  // });
}

if(record.device.type == "analog_controller") {
  callback(null,"a")
  // pool.getConnection((error, connection) => {
  //   if (connection) {
  //     var data = {... record.event,... record.network}
  //     console.log("record: ",data)
  //     ss_id = record.device.id
  //     var category = 'GL_EVENT_CATEGORY_MEASURED';
  //     var triggering_user = userid;
  //     count = 0; 
  //     finaldata=[]
  //     for(var key in data) {
  //       let dataa = []
  //       if (data.hasOwnProperty(key)) {
  //         var param_id = key
  //         var param_value=data[key];
  //         var event_time=moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
  //         var measured_time=moment().format('YYYY-MM-DD HH:mm:ss');
  //         let paylo={}
  //         paylo["ss_id"]=ss_id
  //         paylo["param_id"]=param_id
  //         paylo["param_value"]=param_value
  //         finaldata.push(paylo)
  //         console.log(param_id+" -> "+param_value)
  //             count++
  //         if(count == Object.keys(data).length){
  //           console.log("=====================finaldata",finaldata)
  //           let count1=0
  //           finaldata.forEach(element => {
  //             const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
  //             connection.query(query,[element.ss_id,element.param_id],(err,results)=>{
  //             if (err) {
  //               connection.release();
  //               callback(err);
  //             } else {
  //               if(results.length>0){
  //                 //update
  //                 const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
  //                 connection.query(query,[element.param_value,(moment().format('YYYY-MM-DD HH:mm:ss')),element.ss_id,element.param_id],(err1,results1)=>{
  //                   if(err1){
  //                     callback(err1)
  //                   }else{
  //                     count1++
  //                     console.log("=====================count",count1)
  //                     console.log("result1---->uodtae",results1)
  //                     if(finaldata.length==count1){
  //                       connection.release();
  //                       callback(null,results1)
  //                     }
  //                   }
  //                 })
  //               }else{
  //                 //insert
  //                 const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
  //                 connection.query(query,[ element.ss_id,(moment().format('YYYY-MM-DD HH:mm:ss')),element.param_id,element.param_value],(err2,results2)=>{
  //                   if(err2){
  //                     callback(err2)
  //                   }else{
  //                     count1++
  //                     if(finaldata.length==count1){
  //                       connection.release();
  //                       callback(null,results2)
  //                     }
  //                   }
  //                 })
                  
  //               }
               
  //             }
  //             })
  //           });              







  //              } 
         
         
  //       }      
  //     }
  //   } else {
  //     callback('DB connection error');
  //   }
  // });
}
};




const getAlarmDetail=(ss_id,al_code,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =  ' select * from gl_alarm where ss_id=? and alarm_code=? and restore =0 and delete_alarm=0;';
        connection.query(query,[ss_id,al_code],(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
        }
      })
    }
  })


}


const updateOrCreateGlalarm=(update,create,callback)=>{

  pool.getConnection((err,connection)=>{
    if(connection){
      if(update.length>0){
        let countal=0
        update.forEach(element=>{
          let query='update gl_alarm set measured_time=? where ss_id=? and alarm_code=?'
          connection.query(query,[element[1],element[0],element[4]],(err,results)=>{
            if(err){
              callback(err)
            }else{
              countal++
              if(countal==update.length){
                let countre=0
                if(create.length>0){
                  create.forEach(element2=>{
                  let query1='insert into gl_alarm (ss_id,measured_time,param_id,param_value,alarm_code,message) values (?,?,?,?,?,?)'
                  connection.query(query1,[element2[0],element2[1],element2[2],element2[3],element2[4],element2[5]],(err2,results2)=>{
                    if(err2){
                      callback(err2)
                    }else{
                      countre++
                      if(countre==create.length){
                        connection.release()
                        callback(null,results2)
                      }
                    }
                  })

                  })

                }else{
                  connection.release()
                  callback(null,results)
                }
              }
            }
          })
        })
      }else{
        let countree=0
        if(create.length>0){
          create.forEach(element2=>{
            mail.generateMail(element2[5],element2[2])
            let query1='insert into gl_alarm (ss_id,measured_time,param_id,param_value,alarm_code,message) values (?,?,?,?,?,?)'
            connection.query(query1,[element2[0],element2[1],element2[2],element2[3],element2[4],element2[5]],(err3,results3)=>{
              if(err3){
                callback(err3)
              }else{
                countree++
                if(countree==create.length){
                  connection.release()
                  callback(null,results3)
                }
              }
            })

            })
        }
      }
     
    }else{
      callback('DB CONNECTION ERROR')
    }
  })
}




const restore_alarm=(restoreArr,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      let count=0
     restoreArr.forEach(element=>{
      console.log("-------elelelelelel",element)
        query='update gl_alarm set restore=?,measured_time=?  where ss_id=? and (alarm_code=? or alarm_code=?)'
        connection.query(query,[1,element[1],element[0],element[4],element[5]],(err,result1)=>{
          if(err){
            callback(err)
            console.log("resotrree arra",err)
          }else{
            count++
            console.log("resotrree arra",result1)
            if(count==restoreArr.length){
              connection.release()
              callback(null,result1)
            }
          }
        })
     })
       
    }
  })

}




module.exports = {
  updateXY,
  createEvent,
  createDevice,
  updateDevice,
  updateDeviceDetails,
  deleteDevice,
  getDeviceByMac,
  getDeviceById,
  getLatestEvent,
  editDeviceName,
  // updateLatestEvent,
  getDeviceLayout, 
  createLatestEvent,
  createGlDevice,
  getSubsystemDeatils,
  insertGlAlaram,
  inputGl,
  userId,
  insertintoIbms,
  eventsAlarm,
  updateSubystemLatestEvent,
  updateOrCreateGlalarm,
  restore_alarm
};

















// count1 = 0; 
// for(var key in data) {
//   if (data.hasOwnProperty(key)) {
//     var param_id = key
//    // var event_time= moment(record.timestamp).format('YYYY-MM-DD HH:mm:ss');
//     var measured_time= moment().format('YYYY-MM-DD HH:mm:ss');
//     if(key == "humidity" || key == "luminousity" || key=="temperature") {
//       param_value = data[key.value]
//     }
//     else {
//       param_value = JSON.parse(JSON.stringify(data[key])).value
//     }
//     if(key == "battery" || key == "is_event" || key=="sampling_interval" || key == "lqi" || key =="parentAddress" || key == "rssi") {
//       param_value = data[key]
//     }
//     else {
//       param_value = JSON.parse(JSON.stringify(data[key])).value
//     }
//     console.log('relllll',param_id+" -> "+param_value)
//     const squery="select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"
//     connection.query(squery,[ss_id,param_id],(err3,res3)=>{
//       if(err3){
//         callback(err3)
//       }else{
//         console.log("--------------------->tesdt",param_id)
//         if(res3.length>0){
//           //update
//           const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
//           connection.query(query,[param_value,(moment().format('YYYY-MM-DD HH:mm:ss')),ss_id,param_id],(err1,results1)=>{
//             if(err1){
//               callback(err1)
//             }else{
//               count1++
//               console.log("=====================count",count)
//               console.log("result1---->uodtae",results1)
//               if(count1 == Object.keys(data).length){
//                 connection.release();
//                 callback(null,results1)
//               }
//             }
//           })
//         }else{
//           //insert
//           const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
//           connection.query(query,[ss_id,(moment().format('YYYY-MM-DD HH:mm:ss')),param_id,param_value],(err2,results2)=>{
//             if(err2){
//               callback(err2)
//             }else{
//               count1++
//               if(count1 == Object.keys(data).length){
//                 connection.release();
//                 callback(null,results2)
//               }
//             }
//           })
//         }
//       }





//     })
//       // `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//       //   if(error) {
//       //     console.log(error)
//       //   }else{
//        // count++
//         // if(count == Object.keys(data).length) {
//         //   connection.release()
          
         
//         // }
//         }
//       }





//-------------------------------
// connection.query(
//   `insert into gl_subsystem_output_map set ?`,{ss_id, param_id, param_value,measured_time}, (error, result) => {
//     if(error) {
//       console.log(error)
//     }else{
//     count++
//     if(count == Object.keys(data).length) {
//       connection.release()
//        insertintoIbms(insertIbmsData,(error,results)=>{
//         if(error){
//           callback(error)
//         }else{

//           callback(null, "Event Successfull")
//         }
//       })
     
//     }
//     }
//   }
// )