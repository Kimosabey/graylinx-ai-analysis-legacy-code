const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const { result } = require('lodash');
const { query } = require('winston');
const { end } = require('../../Config/logger');
const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
const { validateDBQueryResultLength } = require('../../Utils/common');

const createSchedule = (schedule, user, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'INSERT INTO hvac_schedule SET ?',
        schedule,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            logger.info("ACTION: Create Schedule; SCHEDULE ID: "+schedule.id+
              "; FLOOR ID: "+schedule.floor_id+"; ZONES: "+JSON.parse(schedule.data).zones.map((_zone) => _zone.name)+
              "; LIGHT CONTROL: "+JSON.parse(schedule.data).action+"; LIGHT INTENSITY: "+JSON.parse(schedule.data).intensity+
              "; START TIME:"+schedule.start+"; END TIME:"+schedule.end+"; RESULT: Success"+
              "; USER: "+user.name+"; USER ID: "+user.id)
            callback(null, results);
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

const checkZoneScheduleExists = (start_time, end_time, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      // console.log(`select json_extract(data,'$.zones[*].id') as zone_id from schedule where (start BETWEEN ${start_time} and ${end_time} OR end BETWEEN ${start_time} and ${end_time})`)
      connection.query(
        "select json_extract(data,'$.zones[*].id') as zone_id from hvac_schedule where ((start <= ? AND end >= ?) OR (start >= ? AND start <= ?) OR (end >= ? AND end <= ?))",[start_time,end_time,start_time,end_time,start_time,end_time],
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
      callback(err);
    }
  });
};

const checkZoneScheduleExists2 = (start_time, end_time, schedule_id, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      // console.log(`select json_extract(data,'$.zones[*].id') as zone_id from schedule where (start BETWEEN ${start_time} and ${end_time} OR end BETWEEN ${start_time} and ${end_time})`)
      connection.query(
        "select json_extract(data,'$.zones[*].id') as zone_id from schedule where id != ? and ((start <= ? AND end >= ?) OR (start >= ? AND start <= ?) OR (end >= ? AND end <= ?))",[schedule_id, start_time,end_time,start_time,end_time,start_time,end_time],
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
      callback(err);
    }
  });
};

const schedulesList = callback => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(`SELECT * FROM hvac_schedule`, (error1, results) => {
        connection.release();
        if (error1) {
          callback(error1);
        } else {
          //validation implementedd in service file
           //validateDBQueryResultLength(results,(err,result1)=>{
          //   if(err){
          //     callback(err)
          //   }else{
              callback(null, results);
          //   }
          // })
        }
      });
    } else {
      callback(error);
    }
  });
};

const deleteSchedule = (scheduleId, user, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      if (user.running) {
        var daliPayload = {};
        var wacPayload = {};
        var gatewayIp;
        connection.query('select * from hvac_schedule where id = ?', scheduleId, (error1, results1) => {
          if (error1) {
            callback(error1);
          } else {
            count = 0;
            const { zones } = JSON.parse(results1[0].data);
            zones.forEach(each => {
              connection.query("select d.mac,d.type,d.device_info,g.ip from device d,zone z, gateway g, gateway_mapping gm where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and z.id = ? and d.zone_id=z.id and gm.zone_id = z.id and g.id = gm.gateway_id group by d.mac", each.id, (error2, deviceData) => {
                if (error2) {
                  callback(error2);
                } else {
                  console.log("device data:", deviceData)
                  var analog_controllers = [];
                  var dali_controllers = [];
                  var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').map(e => e.mac);
                  analogControllersMac.forEach((analog_mac, j) => {
                    let analogObj = {
                      "macId": analog_mac,
                      "channel": 0
                    }
                    analog_controllers.push(analogObj)
                  })
                  var daliMac = deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
                  var daliSlave = deviceData.filter(e => e.type === 'dali_slave').map(e => e.mac)
                  daliMac.forEach((dali_mac, k) => {
                    let slaves = []
                    daliSlave.forEach((slaveMac, l) => {

                      if (dali_mac.slice(-4) == slaveMac.substring(10, 14)) {
                        slaves.push(parseInt(slaveMac.slice(-2), 16))
                      }

                    })
                    let daliObj = {
                      "selection": "slaves",
                      "macId": dali_mac,
                      "slaves": slaves
                    }
                    dali_controllers.push(daliObj)
                    count++
                  })
                  let daliData = {
                    "mode": "auto",
                    "intensity": 0,
                    "dali": dali_controllers
                  }
                  let analogData = {
                    "mode": "auto",
                    "intensity": 0,
                    "wac": analog_controllers
                  }

                  //  setTimeout(() => {
                  //   console.log("dali data ",daliData)
                  //  },200)
                  if (count == zones.length) {
                    daliPayload = daliData
                    wacPayload = analogData
                    gatewayIp = deviceData[0].ip
                    // console.log("dali data ",daliData)
                    // console.log("analog data ",analogData)
                  }
                }
              })
            })
          }
        })
        ////////
        connection.query(
          'DELETE FROM hvac_schedule WHERE id = ?',
          scheduleId,
          (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              setTimeout(() => {
                axios
                  .post(`https://${gatewayIp}/api/WLMSGroupControl`, { "WAC": wacPayload })
                  .then((resp) => {
                    if (resp.data.returnCode == 0) {
                      console.log("zone is now in auto mode")
                    } else if (resp.data.returnCode == -1) {
                      console.log("failed")
                    }
                  })
                  .catch(err => {
                    console.log("catch executed")
                  });
                axios
                  .post(`https://${gatewayIp}/api/WLMSGroupControl`, { "DALI": daliPayload })
                  .then((resp) => {
                    if (resp.data.returnCode == 0) {
                      console.log("zone is now in auto mode")
                    } else if (resp.data.returnCode == -1) {
                      console.log("failed")
                    }
                  })
                  .catch(err => {
                    console.log("catch executed")
                  });
              }, 300)
              logger.info("ACTION: Delete Schedule; SCHEDULE ID: " + scheduleId +
                "; RESULT: Success; USER: " + user.name + "; USER ID: " + user.id)
              callback(null, results);
            }
          }
        );
      }
      else {
        connection.query(
          'DELETE FROM hvac_schedule WHERE id = ?',
          scheduleId,
          (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              logger.info("ACTION: Delete Schedule; SCHEDULE ID: "+scheduleId+
                "; RESULT: Success; USER: "+user.name+"; USER ID: "+user.id)
              callback(null, results);
            }
          }
        );
      }
    } else {
      callback(err);
    }
  });
};

const editSchedule = (schedule, isRunning, scheduleId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      if(isRunning) {
        var daliPayload = {};
        var wacPayload = {};
        var gatewayIp;
        connection.query('select * from hvac_schedule where id = ?', scheduleId, (error1, results1) => {
          if (error1) {
            callback(error1);
          } else {
            count = 0;
            const { zones } = JSON.parse(results1[0].data);
            zones.forEach(each => {
              connection.query("select d.mac,d.type,d.device_info,g.ip from device d,zone z, gateway g, gateway_mapping gm where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and z.id = ? and d.zone_id=z.id and gm.zone_id = z.id and g.id = gm.gateway_id group by d.mac", each.id, (error2, deviceData) => {
                if (error2) {
                  callback(error2);
                } else {
                  console.log("device data:",deviceData)
                  var analog_controllers = [];
                  var dali_controllers = [];
                  var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').map(e => e.mac);
                  analogControllersMac.forEach((analog_mac, j) => {
                    let analogObj = {
                      "macId": analog_mac,
                      "channel": 0
                    }
                    analog_controllers.push(analogObj)
                  })
                  var daliMac = deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
                  var daliSlave = deviceData.filter(e => e.type === 'dali_slave').map(e => e.mac)
                  daliMac.forEach((dali_mac, k) => {
                    let slaves = []
                    daliSlave.forEach((slaveMac, l) => {
  
                      if (dali_mac.slice(-4) == slaveMac.substring(10, 14)) {
                        slaves.push(parseInt(slaveMac.slice(-2), 16))
                      }
  
                    })
                    let daliObj = {
                      "selection": "slaves",
                      "macId": dali_mac,
                      "slaves": slaves
                    }
                    dali_controllers.push(daliObj)
                    count++
                  })
                  let daliData = {
                    "mode": "auto",
                    "intensity": 0,
                    "dali": dali_controllers                
                  }
                  let analogData = {
                    "mode": "auto",
                    "intensity": 0,
                    "wac": analog_controllers
                  }
                
                //  setTimeout(() => {
                //   console.log("dali data ",daliData)
                //  },200)
                if(count == zones.length) {
                  daliPayload = daliData
                  wacPayload = analogData
                  gatewayIp = deviceData[0].ip
                  // console.log("dali data ",daliData)
                  // console.log("analog data ",analogData)
                }
                }
              })
            })
          }  
        })
        connection.query(
          'UPDATE hvac_schedule set name = ?, data = ?, floor_id = ?, floor_name = ?, start = ?, end = ? WHERE id = ?',
          [schedule.name, schedule.data, schedule.floor_id, schedule.floor_name, schedule.start, schedule.end, scheduleId],
          (error, results) => {
            connection.release();
            if (error) {
              callback(null, { message: 'Conflict in Schedule name'});
            } else {
              //send auto command gateway for auto mode
              setTimeout(() => {
                console.log("analog payload: ", wacPayload)
                console.log("dali payload: ", daliPayload)
                console.log("gateway ip: ",gatewayIp)
                axios
                  .post(`https://${gatewayIp}/api/WLMSGroupControl`, {"WAC": wacPayload})
                  .then((resp) => {
                    if (resp.data.returnCode == 0) {
                      console.log("zone is now in auto mode")
                    } else if (resp.data.returnCode == -1) {
                      console.log("failed")
                    }
                  })
                  .catch(err => {
                    console.log("catch executed")
                  });
                axios
                  .post(`https://${gatewayIp}/api/WLMSGroupControl`, {"DALI": daliPayload})
                  .then((resp) => {
                    if (resp.data.returnCode == 0) {
                      console.log("zone is now in auto mode")
                    } else if (resp.data.returnCode == -1) {
                      console.log("failed")
                    }
                  })
                  .catch(err => {
                    console.log("catch executed")
                  });
              }, 300)
              logger.info("ACTION: Updated Schedule; SCHEDULE ID: "+scheduleId+
                "; RESULT: Success")
              callback(null, results);
            }
          }
        );
      }
      else {
        connection.query(
          'UPDATE hvac_schedule set name = ?, data = ?, floor_id = ?, floor_name = ?, start = ?, end = ? WHERE id = ?',
          [schedule.name, schedule.data, schedule.floor_id, schedule.floor_name, schedule.start, schedule.end, scheduleId],
          (error, results) => {
            connection.release();
            if (error) {
              callback(null, { message: 'Conflict in Schedule name'});
            } else {
              logger.info("ACTION: Updated Schedule; SCHEDULE ID: "+scheduleId+
                "; RESULT: Success")
              callback(null, results);
            }
          }
        );
      }
      
    } else {
      callback(err);
    }
  });
};

module.exports = {
  schedulesList,
  createSchedule,
  deleteSchedule,
  checkZoneScheduleExists,
  checkZoneScheduleExists2,
  editSchedule
};
