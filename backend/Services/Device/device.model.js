const uuid = require('uuid/v4');
const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const { compareAsc, format } = require('date-fns');
const moment = require('moment');

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
              // 'SELECT count(*) as count from device',
              'SELECT count(*) as count from device where type="analog_controller" or type="dali_master" or type="occupancy_sensor" or type="thl_sensor" or type="repeater"',
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
                      if(payload.type==="analog_controller"){
                        connection.query('select * from device where mac= ?',payload.mac,(errormac,resultsmac)=>{
                          if(resultsmac.length > 0) {
                             if((resultsmac.length==2) || (Object.keys(JSON.parse(resultsmac[0].device_info)).length)==2){
                              connection.release();
                              var err3 = new Error(`This both channels are already exists`);
                              err3.status = 404;
                              logger.error("ACTION: Create Device;" +
                                "; RESULT: Unable to create device; USER: admin; ROLE: super_admin")
                              callback(err3)
                             }else{
                              let deviceInfo=Object.keys(JSON.parse(resultsmac[0].device_info))
                              let channelInfo=Object.keys(JSON.parse(payload.device_info))
                              const filteredArray = channelInfo.filter(value => deviceInfo.includes(value));
                             if(filteredArray.length==0){
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
                             }else{
                              connection.release();
                              var err3 = new Error(`This  channels is already exists`);
                              err3.status = 404;
                              logger.error("ACTION: Create Device;" +
                                "; RESULT: Unable to create device; USER: admin; ROLE: super_admin")
                              callback(err3)
                             }
                             }
                          }else{
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
                      }else{
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

const createEvent = (record, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'INSERT INTO event SET ?',
        {
          id: uuid(),
          data: JSON.stringify(record.event, null, 2),
          network_data: record.network ? JSON.stringify(record.network, null, 2) : '{"lqi": 0,"rssi": 0}',
          device_id: record.device.id,
          device_type: record.device.type
        },
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            callback(null, results);
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const updateDevice = (device, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'UPDATE device SET area_id = ? WHERE id = ?';
      connection.query(query, [device.area_id, device.id], (error, results) => {
        connection.release();
        if (error) {
          logger.error("ACTION: Update Device; DEVICE ID: "+device.id+"; AREA ID: "+device.area_id+  
            "; RESULT: Failed to update the Area ID of device; USER: admin; ROLE: super_admin")
          callback(error);
        } else {
          logger.info("ACTION: Update Device; DEVICE ID: "+device.id+"; AREA ID: "+device.area_id+  
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

const getDevice = (mac, callback) => {
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

const getDeviceHierarchy = (deviceId, callback) => {
  // console.log("deviceId",deviceId)
  if(deviceId.length>=2){
  let response=[];
  // deviceId.forEach((each)=>{
  pool.getConnection((err, connection) => {
  let dcount=0
  deviceId.forEach((each)=>{
    if (connection) {
        const sql =
          'select d.id as deviceId, d.name as deviceName, d.type as deviceType, d.mac as mac, ' +
          'z.id as zoneId, z.name as zoneName,a.id as areaId,f.id as floorId, f.floor_number as floorNumber, f.name as floorName, ' +
          'b.id as buildingId, b.name as buildingName, c.id as campusId, c.name as campusName ' +
          'from device d ' +
          'inner join area a on a.id = d.area_id ' +
          'inner join zone z on z.id = a.zone_id ' +
          'inner join floor f on f.id = z.floor_id ' +
          'inner join building b on b.id = f.building_id ' +
          'inner join campus c on c.id = b.campus_id ' +
          'where d.id = ?';
        connection.query(sql, [each], (error, results) => {
          // response.push(results)
          // connection.release();
          // console.log("device hirarchyyyyyyyy",results)
          if (error) {
            callback(error);
          } else {
            response.push(results)
            dcount++
            if(deviceId.length==dcount){
              connection.release();
              callback(null, response);
            }
          }
        });
      } else {
        callback(err);
      }
    })
  });
// })
  } else {
    pool.getConnection((err, connection) => {
      if (connection) {
          const sql =
            'select d.id as deviceId, d.name as deviceName, d.type as deviceType, d.mac as mac, ' +
            'z.id as zoneId, z.name as zoneName,a.id as areaId,f.id as floorId, f.floor_number as floorNumber, f.name as floorName, ' +
            'b.id as buildingId, b.name as buildingName, c.id as campusId, c.name as campusName ' +
            'from device d ' +
            'inner join area a on a.id = d.area_id ' +
            'inner join zone z on z.id = a.zone_id ' +
            'inner join floor f on f.id = z.floor_id ' +
            'inner join building b on b.id = f.building_id ' +
            'inner join campus c on c.id = b.campus_id ' +
            'where d.id = ?';
          connection.query(sql, [deviceId], (error, results) => {
            connection.release();
            // console.log("device hirarchyyyyyyyy",results)
            if (error) {
              callback(error);
            } else {
              callback(null, results);
            }
          });
        } else {
          callback(err);
        }
    })
  }
};

const getmac = (mac,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const sql ='select * from device where mac=?';
      connection.query(sql,mac,(error,res)=>{
        connection.release();
        if(error){
          callback(error)
        } else {
          callback(null,res)
        }
      })
    }
  })
}

const getLatestEvent = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const sql = 'select * from latest_event where device_id=?';
      connection.query(sql, [deviceId], (getLatestEventerror, result) => {
      // connection.query(sql, [element], (error, result) => {
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
})
}

const updateLatestEvent = (record,callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
        const sql =
        'update latest_event set data = ?, network_data = ?, created_at=? where device_id = ?';
        const event = JSON.stringify(record[0].event, null, 2);
        const network_data = record[0].network ? JSON.stringify(record[0].network, null, 2) : '{"lqi": 0,"rssi": 0}';
        const deviceId = record[0].device.id;
        const created = moment().format('YYYY-MM-DD HH:mm:ss');
        connection.query(sql, [event, network_data, created, deviceId], (error1, results) => {
          connection.release();
          if (error1) {
            callback(error1);
          } else {
            callback(null, results);
          }
      })
    } else {
      callback('DB connection error');
    }
  });
};

const updatewacLE=(record,d_Id,callback)=>{
  pool.getConnection((error, connection) => {
    if (connection) {
      let count=0
      d_Id.forEach((item,index)=>{
        const sql =
        'update latest_event set data = ?, network_data = ?, created_at=? where device_id = ?';
        const event = JSON.stringify(record[0].event, null, 2);
        const network_data = record[0].network ? JSON.stringify(record[0].network, null, 2) : '{"lqi": 0,"rssi": 0}';
        const deviceId = item;
        const created = moment().format('YYYY-MM-DD HH:mm:ss');
        connection.query(sql, [event, network_data, created, deviceId], (error1, results) => {
          if (error1) {
            callback(error1);
          } else {
            count++;
            if(count==d_Id.length){
              connection.release();
              callback(null, results);
            }
          }
        });
      })
    } else {
      callback('DB connection error');
    }
  });
}

const createLatestEvent = (record, callback) => {
  // console.log("in  create LE ",record)
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        'INSERT INTO latest_event SET ?',
        {
          id: uuid(),
          data: JSON.stringify(record[0].event, null, 2),
          network_data: record[0].network ? JSON.stringify(record[0].network, null, 2) : '{"lqi": 0,"rssi": 0}',
          device_id: record[0].device.id,
          device_type: record[0].device.type,
          device_name: record[0].name,
          zone_id: record[0].zoneId,
          floor_id: record[0].floorId,
          area_id:record[0].areaId,
          building_id: record[0].buildingId,
          campus_id: record[0].campusId,
          floor_name: record[0].floorName,
          zone_name: record[0].zoneName,
          building_name: record[0].buildingName,
          campus_name: record[0].campusName,
          floor_number: record[0].floorNumber
        },
        (error1, results) => {
          // console.log("resultsssssssss from ltest event",results)
          connection.release();
          if (error1) {
            callback(error1);
          } else {
            // console.log("else loop i am a callback")
            //
            callback(null, results);
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const createwacLE = (record,deviceId,callback) =>{
  pool.getConnection((error, connection) => {
    if (connection) {
      let count=0
      deviceId.forEach((item,index)=>{
        connection.query(
          'INSERT INTO latest_event SET ?',
          {
            id: uuid(),
            data: JSON.stringify(record[0].event, null, 2),
            network_data: record[0].network ? JSON.stringify(record[0].network, null, 2) : '{"lqi": 0,"rssi": 0}',
            device_id: item,
            device_type: record[0].device.type,
            device_name: record[0].name,
            zone_id: record[0].zoneId,
            floor_id: record[0].floorId,
            area_id:record[0].areaId,
            building_id: record[0].buildingId,
            campus_id: record[0].campusId,
            floor_name: record[0].floorName,
            zone_name: record[0].zoneName,
            building_name: record[0].buildingName,
            campus_name: record[0].campusName,
            floor_number: record[0].floorNumber
          },
          (error1, results) => {
            // console.log("resultsssssssss from ltest event",results)
            if (error1) {
              callback(error1);
            } else {
              count++;
              if(count==deviceId.length){
                connection.release();
                callback(null, results);
              }
            }
          }
        );
      })
    } else {
      callback('DB connection error');
    }
  });
}

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



const updateLatestEventOnControl = (record, callback) => {
  console.log("update latest event =======================================================================")
  // console.log("-------record device============================================",record)
  // logger.info("updateLatestEventOnControl record"+JSON.stringify(record))
  pool.getConnection((error, connection) => {
    if (connection) {
      let i=0;
      record.forEach((each)=>{
        getLatestEvent(each.id,(err,resp)=>{
          if(err){
            callback(err)
          } else{
            if(resp.length>=1){
              // console.log("if loppppppppppppppp-------------------",resp)
              if(each.type=='dali_slave'){  
                const sql=`update latest_event set data = JSON_SET(data,"$.mode",?,"$.lastCmdFrom",?,"$.light_level",?) where device_id=?`
                connection.query(sql,[each.mode,"server",each.intensity,each.id],(error,result)=>{
                  if(error){
                    callback(error)
                  }else{
                    i++
                    // console.log("daliiiiiiiiiiiiiiiiiiiiiiiiii LE update")
                    // console.log("iiiiiiiiiiiiiiiiiiiiiii",i)
                    // console.log("record.lengthhhhhhhhhh",record.length)
                    if(i===record.length){
                      connection.release();
                      callback(null,result)
                    }
                  }
                })
              } else{
                const sql=`update latest_event set data = JSON_SET(data,"$.channel1level",?,"$.channel1mode",?,"$.channel2level",?,"$.channel2mode",?,"$.channel3level",?,"$.channel3mode",?,"$.channel4level",?,"$.channel4mode",?,"$.lastCmdFrom",?) where device_id=?`
                connection.query(sql,[each.channel1level,each.channel1mode,each.channel2level,each.channel2mode,each.channel3level,each.channel3mode,each.channel4level,each.channel4mode,"server",each.id],(error,result)=>{
                  if(error){
                    callback(error)
                  }else{
                    i++
                    if(i===record.length){
                      connection.release();
                      callback(null,result)
                    }
                  }
                })
              }
            } else{
              // console.log("else lopppppppppppppppppp=======================",resp)
              // console.log("no latest event for uuuuuuuuuuuuuuuuuuuuuuuuuuu")
              let id=[]
              id.push(each.id)
              getDeviceHierarchy(id,(err1,response)=>{
                if(err1){
                  callback(err1)
                } else {
                  // console.log("device hirarchyyyyyyyyyyyyyyyyyyyyy",response)
                  let event={};
                  if(response[0].mac.slice(0,3)=="50d"){
                    // console.log("dali eventttttttttttttttttttttt")
                    event={
                      lastCmdFrom:'server',
                      light_level:each.intensity,
                      mode:each.mode,
                      health:'alive'
                    }
                  } if(response[0].mac.slice(0,3)=="50a"){
                    // console.log("wac eventttttttttttttttttttttttt")
                    event={
                      channel1level:each.channel1level,
                      channel1mode:each.channel1mode,
                      channel2level:each.channel2level,
                      channel2mode:each.channel2mode,
                      channel3level:each.channel3level,
                      channel3mode:each.channel3mode,
                      channel4level:each.channel4level,
                      channel4mode:each.channel4mode,
                      lastCmdFrom:'server',
                      is_event:false,
                      totalConnectedPIR:'',
                      totalConnectedTHL:'',
                      totalConnectedchannels:'2'
                    }
                  } 
                  // console.log("eventtttttttttttttt",event)
                  const sql = `INSERT INTO latest_event SET ?`;
                  connection.query(
                    sql,
                    {
                      id: uuid(),
                      data: JSON.stringify(event, null, 2),
                      network_data: record[0].network ? JSON.stringify(record[0].network, null, 2) : '{"lqi": 0,"rssi": 0}',
                      device_id: response[0].deviceId,
                      device_type: response[0].deviceType,
                      device_name: response[0].deviceName,
                      zone_id: response[0].zoneId,
                      floor_id: response[0].floorId,
                      area_id:response[0].areaId,
                      building_id: response[0].buildingId,
                      campus_id: response[0].campusId,
                      floor_name: response[0].floorName,
                      zone_name: response[0].zoneName,
                      building_name: response[0].buildingName,
                      campus_name: response[0].campusName,
                      floor_number: response[0].floorNumber
                    },
                    (error1, results) => {
                      if (error1) {
                        callback(error1);
                      } else {
                        i++
                        if(i===record.length){
                          connection.release();
                          callback(null, results);
                        }
                      }
                    }
                  )
                }
              })
             ;
            }
        }})    
      })
    } else {
      callback('DB connection error');
    }
  });
};

const getDeviceDetails = (deviceId,callback) =>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const sql = 'select * from device where id=? and type="analog_controller"';
      connection.query(sql,deviceId,(error,result)=>{
        // console.log("resultttttttttttttt",result)
        connection.release();
        if(error){
          callback(error);
        } else {
            if(result.length!=0){
              let mac = result[0].mac
              getmac(mac,(err,result1)=>{
                if(err){
                  callback(err);
                } else {
                  callback(null,result1)
                }
              })
            }
        }
      })
    }
  })
};

const getdevices = (callback) =>{
  console.log("modellllllllllllllllllllll")
  let id = ['dali_master','analog_controller','occupancy_sensor','thl_sensor','repeater']
  let data=[];
  pool.getConnection((err,connection)=>{
    if(connection){
      id.forEach(ele=>{
      // const sql = `select count(*) as count,type from device where type=?`;
      const sql = `select * from (select count(*) as count,type from device where type=?) t1 inner join (select count(*) as gw_count from gateway) t2 inner join (select total_devices from super_admin) t3 inner join (SELECT count(*) as installed_devices from device where type="analog_controller" or type="dali_master" or type="occupancy_sensor" or type="thl_sensor" or type="repeater") t4`;
      connection.query(sql,ele,(err,result)=>{
        if(err){
          callback(err)
        } else {
          if(result[0].type==null){
            result[0].type=ele
          }
          data.push(result[0])
          if(id.length==data.length){
            connection.release();
            callback(null,data)
          }
          // console.log("resultttttttt from queryyyyyyy",data)
        }
      })
    });
    } else {
      callback('DB conection error');
    }
  })
}

const getmastermac=(mac,callback)=>{
  pool.getConnection((err,connection)=>{
    if(err){
      callback(err)
    } else {
      const sql = `select mac from device where type='dali_master'`;
      connection.query(sql,(err,result)=>{
        // console.log("result master macccccccccc",result)
        // console.log("slave macccccccccccccccc",mac)
        connection.release();
        if(err){
          callback(err)
        } else {
          let abc;
          result.forEach((m,i)=>{
            if(m.mac.slice(-4) === mac.slice(-6, -2)){
              abc=m.mac
            }
          })
          callback(null,abc)
        }
      })
    }
  })
}

const getInstancesList = (ip,instance,callback) =>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const sql = 'select gl.id,gl.ss_address_value as tag,gl.ss_type as ss_type,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss where gl.ss_parent=gls.id AND glss.ss_parent=gl.id  AND gls.ss_address_value=? and glss.ss_address_value=? and RIGHT(glss.name,3)!="_tl";';
      connection.query(sql,[ip,instance],(error,result)=>{
        connection.release();
        if(error){
          callback(error);
        } else {
        callback(null,result)  
        }
      })
    }
  })
};

const updateData = (record,callback)=>{
  if(record.length>0){
      pool.getConnection((err,connection)=>{
          if(connection){
            let count1=0
             record.forEach(rec=>{
              const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
              connection.query(query,[rec.data.ss_id,rec.data.param_id],(err,results)=>{
              if (err) {
                connection.release();
                callback(err);
              } else {
                if(results.length>0){
                  const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                  connection.query(query,[rec.data.param_value,rec.data.measured_time,rec.data.ss_id,rec.data.param_id],(err1,results1)=>{
                    if(err1){
                      callback(err1)
                    }else{
                      count1++
                      if(record.length==count1){
                        connection.release();
                        insertIntoTransition(record,(err,results)=>{
                          if(err){
                            callback(err)
                          }else{
                            callback(null,results)
                          }
                        })
                      }
                    }
                  })
                }else{
                  const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                  connection.query(query,[ rec.data.ss_id,rec.data.measured_time,rec.data.param_id,rec.data.param_value],(err2,results2)=>{
                    if(err2){
                      callback(err2)
                    }else{
                      
                      count1++
                      if(record.length==count1){
                        connection.release();
                        insertIntoTransition(record,(err,results)=>{
                          if(err){
                            callback(err)
                          }else{
                            callback(null,results)
                          }
                        })
                      }
                    }
                  })
                  
                }
               
              }
              })
             })
           
          }else{
              callback('DB connection error')
          }
      })
  }else{
      callback(null,"nothing to store")
  }
}


const insertIntoTransition=(record,callback)=>{
  pool.getConnection((err,connection)=>{
    if(err){
      callback(err)
    } else {
     let tableName = record[0].tablename
     const query = `insert into ${tableName} (ss_id,measured_time,param_id ,param_value)values(?,?,?,?)`;
     connection.query(query,[record[0].data.ss_id,record[0].data.measured_time,record[0].data.param_id,record[0].data.param_value],(err,results)=>{
     
      if(err){
        callback(err)
      }else{
        // Object.keys(data)[0].slice(0,Object.keys(data)[0].length-1)+'p'
        if(record[0].data.ss_type=='NONGL_SS_EMS'){
          //console.log(tableName.slice(0,tableName.length-1)+'p')
          let emP_table=tableName.slice(0,tableName.length-1)+'p'
          const query1 = `insert into ${emP_table} (${record[0].data.param_id}) values(?) `;
          //console.log(query1)
          connection.query(query1,[record[0].data.param_value],(err_em,res_em)=>{
            if(err_em){
              callback(err_em)
            }else{
              connection.release()
              callback(null,res_em)
            }
          })
        }else{
          connection.release();
          callback(null,results)
        }
      }
     })
    }
  })
}

const getBacnetDeviceData=(deviceId,callback)=>{
  pool.getConnection((err,connection)=>{
    if(err){
      callback(err)
    } else {
      const sql = `WITH RECURSIVE subordinates AS (SELECT id,name,ss_type,ss_parent,ss_tag,description,ss_address_value,ss_status FROM gl_subsystem WHERE id=? UNION SELECT p.id,p.name,p.ss_type,p.ss_parent,p.ss_tag,p.description,p.ss_address_value,p.ss_status FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id  ) SELECT id as uuid,name,ss_type,ss_parent,ss_tag,description,ss_address_value,ss_status FROM subordinates order by ss_address_value`;
      connection.query(sql,[deviceId],(err,result)=>{
        connection.release();
        if(err){
          callback(err)
        } else {
            callback(null,result)
        }
      })
    }
  })
}


const createTempTable=(names,callback)=>{
  pool.getConnection((err,connection)=>{
    if(err){
      callback(err)
    } else {
      let count=0
      names.forEach(Element=>{
        const sql='CREATE TABLE  IF NOT EXISTS ' +" "+ Element+" " + '(`id` int NOT NULL AUTO_INCREMENT,`ss_id` varchar(36) DEFAULT NULL,`measured_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,`param_id` varchar(36) DEFAULT NULL,`param_value` varchar(36) DEFAULT NULL,`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`id`),KEY `ss_id` (`ss_id`),KEY `param_id` (`param_id`),CONSTRAINT `'+" "+Element+'_ibfk_1`FOREIGN KEY (`ss_id`) REFERENCES `gl_subsystem` (`id`),CONSTRAINT `'+" "+Element+'_ibfk_2` FOREIGN KEY (`param_id`) REFERENCES `gl_parameter` (`id`))'
        connection.query(sql,(err,result)=>{
          if(err){
            callback(err)
          } else {
            count++
            if(count==names.length){
              connection.release()
              callback(null,result)
            }
          }
        })
      })
      // connection.release()
      // callback(null,'abc')
    }
  })
}




const createPerTable=(queries,callback)=>{
  pool.getConnection((err,connection)=>{
    if(err){
      callback(err)
    } else {
      let count=0
      console.log("------------------------>number of tables",queries.length)
      if(queries.length>0){
        queries.forEach(sql=>{
          // console.log("sql query permant",sql)
          connection.query(sql,(err,result)=>{
            if(err){
              callback(err)
            }else{
              count++
              if(count==queries.length){
                connection.release
                callback(null,result)
              }
            }
          })
        })
      }else{
        connection.release()
        callback(null,'no tbales to create')
      }
    
    }
  })
}

const getTable=(ip,instance,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        // let sql='select gl.id,gl.ss_type,gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance,som.measured_time as lastUpTime from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss,gl_subsystem_latest_event som  where gl.ss_parent=gls.id AND glss.ss_parent=gl.id  and som.param_id=glss.name and som.ss_id=gl.id and gls.ss_address_value=? and glss.ss_address_value=?'
        let sql=`select gl.id,gl.ss_address_value as tag,gl.ss_type,SUBSTRING_INDEX(glss.name,"_",1)as parameter,gls.ss_address_value as ip,glss.ss_tag as type,glss.ss_address_value as instance,som.measured_time as lastUpTime from gl_subsystem gl inner join gl_subsystem gls on gl.ss_parent=gls.id inner join gl_subsystem glss on glss.ss_parent=gl.id  left join gl_subsystem_latest_event som on som.param_id=SUBSTRING_INDEX(glss.name,"_",1)  and som.ss_id=gl.id where glss.name like "%_tl" and glss.description like '%A001%' and gls.ss_address_value=? and glss.ss_address_value=?`
        connection.query(sql,[ip,instance],(error,result)=>{
          connection.release()
          if(error){
            callback(error)
          }else{
            callback(null,result)
          }
        })

      }else{
        callback("DB CONNECTION ERROR")
      }
    })
}

const insertIntoTempTable=(tableName,data,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const sql=`insert into ${tableName}(ss_id,param_id,param_value,measured_time) values ?`
      connection.query(sql,[data],(error,result)=>{
        connection.release();
        if(error){
          callback(error)
        }else{
          callback(null,result)
        }
      })
    }else{
      callback("DB CONNECTION ERROR")
    }
  })

}

const getDeviceByAddr=(listOfId,callback)=>{
  let condition=''
  let count=0
  listOfId.forEach(data=>{
    count++
    if(count==listOfId.length){
      condition +=` ss_address_value='${data}'`
      pool.getConnection((error,connection)=>{
        if(connection){
          let query=`select id,ss_address_value from gl_subsystem where ${condition} `
         // console.log("----->",query)
         connection.release()
          connection.query(query,(err,result)=>{
            if(err){
              callback(err)
            }else{
              callback(null,result)
            }
          })
          
        }else{
          callback('DB CONNECTION ERROR')
        }
      })
    }else{
      condition +=` ss_address_value=${data} or`
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
  getDevice,
  getDeviceById,
  getLatestEvent,
  editDeviceName,
  updateLatestEvent,
  getDeviceHierarchy,
  createLatestEvent,
  updateLatestEventOnControl,
  getDeviceByMac,
  getdevices,
  getmac,
  getDeviceDetails,
  getmastermac,
  updatewacLE,
  createwacLE,
  getInstancesList,
  updateData,
  getDeviceByAddr,
  insertIntoTempTable,
  getTable,
  createPerTable,
  createTempTable,
  getBacnetDeviceData

};



