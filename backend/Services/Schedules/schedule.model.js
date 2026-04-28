const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const { result } = require('lodash');
const { query } = require('winston');
const { end } = require('../../Config/logger');
const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });

const createSchedule = (schedule, user, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'INSERT INTO schedule SET ?',
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
        "select json_extract(data,'$.zones[*].id') as zone_id from schedule where ((start <= ? AND end >= ?) OR (start >= ? AND start <= ?) OR (end >= ? AND end <= ?))",[start_time,end_time,start_time,end_time,start_time,end_time],
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
      connection.query(`SELECT * FROM schedule`, (error1, results) => {
        connection.release();
        if (error1) {
          callback(error1);
        } else {
          callback(null, results);
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
        // var daliPayload = [];
        // var wacPayload = [];
        // var gatewayIp = [];
        var response=[];
        connection.query('select * from schedule where id = ?', scheduleId, (error1, results1) => {
          if (error1) {
            callback(error1);
          } else {
            count = 0;
            const { zones } = JSON.parse(results1[0].data);
            zones.forEach(each => {
              connection.query("select d.mac,d.type,d.device_info,g.ip from device d,zone z,area a, gateway g, gateway_mapping gm where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and z.id = ? and d.area_id=a.id and a.zone_id=z.id and gm.zone_id = z.id and g.id = gm.gateway_id group by d.mac", each.id, (error2, deviceData) => {
                if (error2) {
                  callback(error2);
                } else {
                  // console.log("device data:", deviceData)
                  var analog_controllers = [];
                  var dali_controllers = [];
                  var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').map(e => e.mac);
                  analogControllersMac.forEach((analog_mac, j) => {
                    let analogObj = {
                      "macId": analog_mac,
                      "channel": 0,
                      "cmd":36000+j
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
                      "slaves": slaves,
                      "cmd":38000+k
                    }
                    dali_controllers.push(daliObj)
                    // count++
                  })
                  let daliData = {
                    "mode": "auto",
                    "intensity": 100,
                    "dali": dali_controllers
                  }
                  let analogData = {
                    "mode": "auto",
                    "intensity": 100,
                    "wac": analog_controllers
                  }

                  //  setTimeout(() => {
                  //   console.log("dali data ",daliData)
                  //  },200)
                  // if (count == zones.length) {
                    // daliPayload=daliData
                    // wacPayload=analogData
                    // gatewayIp=deviceData[0].ip
                    response.push({
                      "dali":daliData,
                      "wac":analogData,
                      "ip":deviceData[0].ip
                    })
                    // console.log("dali data ",daliData)
                    // console.log("analog data ",analogData)
                    // }
                  }
                })
              })
            }
        })
        ////////
        connection.query(
          'DELETE FROM schedule WHERE id = ?',
          scheduleId,
          (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              let count=0
              let inter = setInterval(() => {
                console.log("------------------------------->count",count)
                let payload ={
                  DALI:response[count].dali,
                  WAC:response[count].wac
                }
                console.log("payloaddddddddddddddddddd",JSON.stringify(payload))
                axios
                .post(`https://${response[count].ip}/api/WLMSGroupControl`, payload)
                .then((res)=>{
                  console.log("lights api success--------------------------------------->>>>>>>>>>.")
                  if(count==response.length){
                  clearInterval(inter)
                  }
                })
                .catch((err)=>{
                  console.log("lights api failed<<<<<<<<<<<<<<<<<<<<<<<<<<<<---------------------------------")
                  clearInterval(inter)
                })
                count++;
              }, 2000);
              
              logger.info("ACTION: Delete Schedule; SCHEDULE ID: " + scheduleId +
                "; RESULT: Success; USER: " + user.name + "; USER ID: " + user.id)
              callback(null, results);
            }
          }
        );
      }
      else {
        connection.query(
          'DELETE FROM schedule WHERE id = ?',
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
        // var daliPayload = [];
        // var wacPayload = [];
        // var gatewayIp =[];
        var response =[]
        connection.query('select * from schedule where id = ?', scheduleId, (error1, results1) => {
          if (error1) {
            callback(error1);
          } else {
            count = 0;
            const { zones } = JSON.parse(results1[0].data);
            zones.forEach(each => {
              connection.query("select d.mac,d.type,d.device_info,g.ip from device d,zone z,area a, gateway g, gateway_mapping gm where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and z.id = ? and d.area_id=a.id and a.zone_id=z.id and gm.zone_id = z.id and g.id = gm.gateway_id group by d.mac", each.id, (error2, deviceData) => {
                if (error2) {
                  callback(error2);
                } else {
                  // console.log("device data:",deviceData)
                  var analog_controllers = [];
                  var dali_controllers = [];
                  var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').map(e => e.mac);
                  analogControllersMac.forEach((analog_mac, j) => {
                    let analogObj = {
                      "macId": analog_mac,
                      "channel": 0,
                      "cmd":36000+j
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
                      "slaves": slaves,
                      "cmd":38000+k
                    }
                    dali_controllers.push(daliObj)
                    // count++
                  })
                  let daliData = {
                    "mode": "auto",
                    "intensity": 100,
                    "dali": dali_controllers                
                  }
                  let analogData = {
                    "mode": "auto",
                    "intensity": 100,
                    "wac": analog_controllers
                  }
                
                //  setTimeout(() => {
                //   console.log("dali data ",daliData)
                //  },200)
                // if(count == zones.length) {
                  // daliPayload=daliData
                  // wacPayload=analogData
                  // gatewayIp=deviceData[0].ip
                  response.push({
                    "dali":daliData,
                    "wac":analogData,
                    "ip":deviceData[0].ip
                  })
                  // console.log("dali data ",daliData)
                  // console.log("analog data ",analogData)
                // }
                }
              })
            })
          }  
        })
        connection.query(
          'UPDATE schedule set name = ?, data = ?, floor_id = ?, floor_name = ?, start = ?, end = ? WHERE id = ?',
          [schedule.name, schedule.data, schedule.floor_id, schedule.floor_name, schedule.start, schedule.end, scheduleId],
          (error, results) => {
            connection.release();
            if (error) {
              callback(null, { message: 'Conflict in Schedule name'});
            } else {
              //send auto command gateway for auto mode
              let count=0
              let inter = setInterval(() => {
                console.log("count------------->>>>>>=============",count)
                let payload={
                  DALI:response[count].dali,
                  WAC:response[count].wac
                }
                console.log("paylad------------->>>>>>>>>>>",JSON.stringify(payload))
                axios
                .post(`https://${response[count].ip}/api/WLMSGroupControl`, payload)
                .then((resp)=>{
                  console.log("lights api success----------------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.")
                  if(count==response.length){
                    clearInterval(inter)
                  }
                })
                .catch((err)=>{
                  console.log("lights api failure<<<<<<<<<<<<<<<<<<<<<=======================================-.")
                  clearInterval(inter)
                })
                count++;
              }, 2000);
              logger.info("ACTION: Updated Schedule; SCHEDULE ID: "+scheduleId+
                "; RESULT: Success")
              callback(null, results);
            }
          }
        );
      }
      else {
        connection.query(
          'UPDATE schedule set name = ?, data = ?, floor_id = ?, floor_name = ?, start = ?, end = ? WHERE id = ?',
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
