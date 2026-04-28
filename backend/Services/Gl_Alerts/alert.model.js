const e = require('express');
const { query } = require('express');
const { boolean } = require('joi');
const { pool } = require('../../Database/pool');
const { validateDBQueryResultLength } = require('../../Utils/common');
const fns = require('date-fns');
const datahandler = require('../../CPM_modular/CPM_Data_Handler');

const deviceAlerts = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql =
      'select d.name as device_name,z.name as zone_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join zone z on z.id = d.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id where b.id=? and (l.created_at < date_sub(CURRENT_TIMESTAMP(),INTERVAL 45 minute) OR l.created_at is NULL) ORDER BY l.created_at ASC';
    connection.query(sql, buildingId, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const deviceAlertsTemp = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql =
    'select d.name as device_name,z.name as zone_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join zone z on z.id = d.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id where b.id=? and (l.created_at < date_sub(CURRENT_TIMESTAMP(),INTERVAL 45 minute) OR l.created_at is NULL) and d.type="parking_sensor" or d.type="thl_sensor"';
    connection.query(sql, buildingId, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const deviceBatteryAlerts = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }
    const sql =
      'select d.name as device_name,z.name as zone_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join zone z on z.id = d.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id where b.id=? and d.type="occupancy_sensor" or d.type = "thl_sensor" or d.type="parking_sensor"';
    connection.query(sql, buildingId, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const gatewayAlerts = callback => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql = 
    'select g.name as device_name,z.name as zone_name, f.name as floor_name, b.name as building_name, g.ip, g.status from gateway g ,gateway_mapping gm,zone z,floor f,building b where g.id = gm.gateway_id and gm.zone_id = z.id and f.id = z.floor_id and b.id=f.building_id group by g.ip';
    // 'select g.name as device_name, g.ip, g.status from gateway g ,gateway_mapping gm,zone z where g.id = gm.gateway_id and gm.zone_id = z.id group by g.ip';
    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const overOccupancyAlerts = (buildingId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(`select overparked from configuration`, (error1, overParkedResult) => {
        if(error1) {
          callback(error1)
        }
        else {
          const overParkedValue = JSON.parse(overParkedResult[0].overparked).overParked;
          const sql =
            'select device_mac,data,device_name,created_at from latest_event where building_id=? AND device_type=? AND (TIMESTAMPDIFF(MINUTE,created_at,NOW()) > '+overParkedValue * 60+');';
          connection.query(sql, [buildingId,"parking_sensor"],(error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              if (results.length === 0) {
                // callback({ message: 'Data not found', status: 500 });
                callback(null, results);
              } else {
                callback(null, results);
              }
            }
          });
          
        }
      })
    } else {
      callback(err);
    }
  });
}

const getConfigurationDetails = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql =
    'select * from configuration;';
    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const hideMulitpleEvents = (body, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{
      let count=0
      body.forEach(element => {
        const sql =  'update gl_ibms_event set show_hide="GL_EVENT_HIDE" where id=?';
        connection.query(sql,element, (err, results) => {
         // connection.release();
          if (err) {
            callback(err);
          }else{
            count++
            if(body.length==count){
              connection.release()
              callback(null,results)
            }
          }
        });
      });
     


    }

   
  });
};

 const alertsByZone=(zoneId,callback)=>{
        pool.getConnection((error,connection)=>{
          if(connection){
             //const query="select * from gl_alarm where restore=?"
            //  const query='WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent,zone_type FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zoneId,s.zone_name as zoneName,s.zone_type as zoneType,sb.id as ss_id,sb.name as ss_name,sb.ss_address_value as ss_address,al.alarm_code,al.message,al.acknowledged,al.created_at  FROM subordinates s inner join gl_location_subsystem_map ls on ls.zone_id=s.id inner join gl_subsystem sb on ls.ss_id=sb.id inner join gl_alarm al on al.ss_id=sb.id where al.restore=?'
            const query="WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent,zone_type FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zoneId,s.zone_name as zoneName,s.zone_type as zoneType,sb.id as ss_id,sb.name as ss_name,sb.ss_address_value as ss_address,al.alarm_code,al.message,al.acknowledged,al.created_at,al.id AS 'Alarm_Id',sb.ss_type AS 'Category',sb.name AS 'Device_name',gp.tag as Parameter,al.message AS 'Description',al.restore AS 'Restore',al.delete_alarm AS 'Ignore',al.alarm_code AS 'Alarm Code',al.measured_time AS 'Measured_time',al.param_id AS 'param id',al.param_value AS 'param value',al.possible_causes AS 'possible_causes',al.id as alarmId FROM subordinates s inner join gl_location_subsystem_map ls on ls.zone_id=s.id inner join gl_subsystem sb on ls.ss_id=sb.id inner join gl_alarm al on al.ss_id=sb.id left join gl_parameter gp on al.message=gp.id where al.restore=? and al.delete_alarm=?;"
             connection.query(query,[zoneId,0,0],(err,results)=>{
               connection.release()
               if(err){
                 console.log("alretbyzone",err.message)
                 callback(err)
               }else{
                validateDBQueryResultLength(results,callback,0)
               }
             })
          }else{
            callback("DB CONNECTION ERROR")
          }
        })
 }

 const alertsByDevice=(deviceId,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
       //const query="select * from gl_alarm where restore=?"
      //  const query='WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent,zone_type FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zoneId,s.zone_name as zoneName,s.zone_type as zoneType,sb.id as ss_id,sb.name as ss_name,sb.ss_address_value as ss_address,al.alarm_code,al.message,al.acknowledged,al.created_at  FROM subordinates s inner join gl_location_subsystem_map ls on ls.zone_id=s.id inner join gl_subsystem sb on ls.ss_id=sb.id inner join gl_alarm al on al.ss_id=sb.id where al.restore=?'
      const query="WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent,zone_type FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zoneId,s.zone_name as zoneName,s.zone_type as zoneType,sb.id as ss_id,sb.name as ss_name,sb.ss_address_value as ss_address,al.alarm_code,al.message,al.acknowledged,al.created_at,al.id AS 'Alarm_Id',sb.ss_type AS 'Category',sb.name AS 'Device_name',gp.tag as Parameter,al.message AS 'Description',al.acknowledged AS 'Acknowledged',al.restore AS 'Restore',al.delete_alarm AS 'Ignore',al.alarm_code AS 'Alarm Code',al.measured_time AS 'Measured_time',al.param_id AS 'param id',al.param_value AS 'param value',al.possible_causes AS 'possible_causes' FROM subordinates s inner join gl_location_subsystem_map ls on ls.zone_id=s.id inner join gl_subsystem sb on ls.ss_id=sb.id inner join gl_alarm al on al.ss_id=sb.id left join gl_parameter gp on al.message=gp.id where al.restore=? and al.delete_alarm=?;"
       connection.query(query,[deviceId,0,0],(err,results)=>{
         connection.release()
         if(err){
           console.log("alretbydevice",err.message)
           callback(err)
         }else{
          validateDBQueryResultLength(results,callback,0)
         }
       })
    }else{
      callback("DB CONNECTION ERROR")
    }
  })
}

 const getLocation=(zoneId,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
       //const query="select * from gl_alarm where restore=?"
       const query='WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent,zone_type FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.id = s.zone_parent) SELECT * FROM subordinates'
       connection.query(query,[zoneId],(err,results)=>{
         connection.release()
         if(err){
           console.log("get_location",err.message)
           callback(err)
         }else{
          validateDBQueryResultLength(results,callback)
         }
       })
    }else{
      callback("DB CONNECTION ERROR")
    }
  })

 }

 const deleteAlarm = (body, callback) => {
  console.log("body in model",Object.keys(body).length)
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{     
          if(Object.keys(body).length == 4){
            const sql = 'update gl_alarm set delete_alarm=1, user_id=?, technician_feedback=? where id=?';
            connection.query(sql,[body.userid,JSON.stringify(body.technician_feedback),body.id], (err, results) => {
              connection.release();
               if (err) {
                 callback(err);
               }else{
                   callback(null,results)
               }
             });
          }else{
            const sql =  'update gl_alarm set technician_feedback=?, user_id=? where id=?';
            connection.query(sql,[JSON.stringify(body.technician_feedback),body.userid,body.id], (err, results) => {
             connection.release();
              if (err) {
                callback(err);
              }else{
                  callback(null,results)
              }
            });
          }
     }
  });
};

const acknowledgeAlarm = (body, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{     
      // let count=0
      // body.forEach(element => {
        const sql =  'update gl_alarm set acknowledged=1, user_id=? where id=?';
        connection.query(sql,[body.userid,body.id], (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          }else{
            // count++
            // if(body.length==count){
            //   connection.release()
              callback(null,results)
            // }
          }
        });
      // });
    }
  });
};

const restoreAlarm = (body, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{     
      // let count=0
      // body.forEach(element => {
        const sql =  'update gl_alarm set restore=1, user_id=? where id=?';
        connection.query(sql,[body.userid,body.id], (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          }else{
            datahandler.updateAlarmCode(body.ss_type,body.ss_id,body.alarm_code,false)
            // count++
            // if(body.length==count){
            //   connection.release()
              callback(null,results)
            // }
          }
        });
      // });
    }
  });
};

const insertSelectedAlarm = (body, callback) => {
  console.log("body for alarm",body.req)
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{     
      console.log("body down",body.req.alarm)
      let measured_time = fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      if(body.req.alarm === "SAT"){
        let ss_id = body.req.ss_id
        let alarm_code = '303'
        let param_id = 'SAT'
        let message = 'Supply Air Temperature Mismatch'
        console.log("IM here SAT")
        const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,param_id,message,user_id) values (?,?,?,?,?,?)"
        connection.query(query,[ss_id,alarm_code,measured_time,param_id,message,"46d96f0c-f4a6-449e-985c-abf6a14b34f7"],(err,res)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,res)
          }
        })
      }else if(body.req.alarm === "DSP"){
        let ss_id = body.req.ss_id
        let alarm_code = '312'
        let param_id = 'DSP'
        let message = 'Duct Static Pressure Mismatch'
        console.log("IM HERE DSP")
        const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,param_id,message,user_id) values (?,?,?,?,?,?)"
        connection.query(query,[ss_id,alarm_code,measured_time,param_id,message,"46d96f0c-f4a6-449e-985c-abf6a14b34f7"],(err,res)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,res)
          }
        })
      }else{
        let ss_id = body.req.ss_id
        let alarm_code = '322'
        let param_id = 'ZAT'
        let message = 'Zonal Temperature Mismatch'
        console.log("IM HERE")
        const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,param_id,message,user_id) values (?,?,?,?,?,?)"
        connection.query(query,[ss_id,alarm_code,measured_time,param_id,message,"46d96f0c-f4a6-449e-985c-abf6a14b34f7"],(err,res)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,res)
          }
        })
      }
      // console.log("Alarm_deatils",ss_id,alarm_code,param_id,message)

    }
  });
};

const insertSelectedChillerAlarm = (body, callback) => {
  console.log("body for alarm",body)
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }else{     
      let measured_time = fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        let ss_id = body.ss_id
        let alarm_code = '331'
        let param_id = 'DP,SP and DT'
        let message = body.message
        const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,param_id,message,user_id) values (?,?,?,?,?,?)"
        connection.query(query,[ss_id,alarm_code,measured_time,param_id,message,"46d96f0c-f4a6-449e-985c-abf6a14b34f7"],(err,res)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,res)
          }
        })
      }
  });
};

const insertIntoGlAlarm = (body,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const measured_time = fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
      const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,param_id,message) values (?,?,?,?,?)";
      connection.query(query,[body.ss_id,body.alarm_code,measured_time,body.param_id,body.message],(err,results)=>{
      connection.release();
      if(err){
        callback(err)
      }else{
        callback(null,results)
      }
      })
    }else{
      callback(null,"DB CONNECTION ERROR")
    }
  })
}

module.exports = {
  deviceAlerts,
  gatewayAlerts,
  deviceBatteryAlerts,
  overOccupancyAlerts,
  deviceAlertsTemp,
  getConfigurationDetails,
  hideMulitpleEvents,
  alertsByZone,
  getLocation,
  acknowledgeAlarm,
  deleteAlarm,
  alertsByDevice,
  insertSelectedAlarm,
  insertSelectedChillerAlarm,
  restoreAlarm,
  insertIntoGlAlarm
};








