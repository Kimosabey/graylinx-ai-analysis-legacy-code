const { pool } = require('../../Database/pool');
const moment = require('moment');
const { compareAsc, format, parse, isWithinInterval, parseISO,addMinutes } = require('date-fns');


const getSchedules = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
     // let start = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
     let start=format(new Date(),'yyyy-MM-dd HH:mm:ss.SSS')
    //  const currentTime = ;
        const end = format(addMinutes(new Date(), 5),'yyyy-MM-dd HH:mm:ss.SSS');
        console.log(`start${start},ened${end}`)
   //  let start="2022-08-12 17:28:00"
      // let end = moment()
      //   .add(30, 'm')
      //   .format('YYYY-MM-DDTHH:mm:ss.SSS');
    //  let end = moment().add(5, 'm').format('YYYY-MM-DDTHH:mm:ss.SSS');'2023-04-04 12:16:00'
      // const query = `select * from hvac_schedule where start between timestamp('2023-04-04 12:16:00') and timestamp('2023-04-04 12:21:00') order by start`;
      const query = `select * from hvac_schedule where start between timestamp("${start}") and timestamp("${end}") order by start`;
      //const query = `select * from schedule where start between timestamp("2020-05-25 15:30:00") and timestamp("2020-05-25 16:00:00") order by start`;
      //need to be uncomment
     // let start = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
        // let start = ("2022-08-25 14:16:00")
      // let end = moment()
      //   .add(30, 'm')
      //   .format('YYYY-MM-DDTHH:mm:ss.SSS');
       //need to be uncomment
    //  let end = moment().add(5, 'm').format('YYYY-MM-DDTHH:mm:ss.SSS');
      // let end =("2023-08-25 14:30:00")
      // const query = `select * from hvac_recurring_schedule where start between timestamp("${start}") and timestamp("${end}") order by start`;
      // const query = 'select * from hvac_recurring_schedule';
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const getGateway = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `SELECT m.zone_id,g.ip FROM gateway_mapping m , gateway g WHERE m.zone_id = "${zoneId}" and m.gateway_id=g.id`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const getLights = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,d.zone_id from device d,floor f,zone z where d.type='dali_master' or d.type='dali_slave' and f.id=? and f.id=z.floor_id and d.zone_id=z.id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getAnalogControllers = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,d.zone_id,d.device_info from device d,floor f,zone z where d.type='analog_controller' and f.id=? and f.id=z.floor_id and d.zone_id=z.id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getDevices = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,d.zone_id, d.device_info from device d,floor f,zone z where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and f.id=? and f.id=z.floor_id and d.zone_id=z.id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getAhuInfo = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select gs.id as ss_id,gls.ss_address_value as ip,glss.name as name,glss.ss_tag as objectId,glss.ss_address_value as objectInstance from gl_subsystem gs inner join gl_subsystem gls on gs.ss_parent = gls.id inner join gl_subsystem glss on gs.id = glss.ss_parent where gs.ss_type='NONGL_SS_AHU'";
      connection.query(query,(err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getRecuuringSheduleInfo = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select * from hvac_recurring_schedule where status=1";
      connection.query(query,(err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getDdcData=(zoneId,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
        let query=`select s.id,s.ss_address_value from gl_subsystem s inner join gl_location_subsystem_map zs  on s.id=zs.ss_id inner join   gl_location z on  z.id=zs.zone_id where z.id=?  and ss_status='GL_SS_STATUS_ACTIVE' and s.ss_type like "%ddc%"`;
        connection.query(query,[zoneId],(error,result)=>{
          connection.release()
          if(error){
            callback(error)
          }else{
            callback(null,result)
          }
        })
    }else{
      callback('DB CONNECTION ERROR')
    }
  })
}

const getRecuuringSheduleData = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select * from hvac_recurring_schedule";
      connection.query(query,(err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, response);
        }
      });
    }
  });
};



const getDdcChildren=(ddcId,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
        let query=`WITH RECURSIVE subordinates AS ( SELECT id,name,ss_parent as deviceId,ss_tag,description,ss_address_value FROM gl_subsystem WHERE  id=? UNION SELECT p.id,p.name,p.ss_parent,p.ss_tag,p.description,p.ss_address_value FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id  ) SELECT * FROM subordinates where name='AHU_On_Off';`;
        connection.query(query,[ddcId],(error,result)=>{
          connection.release()
          if(error){
            callback(error)
          }else{
            callback(null,result)
          }
        })
    }else{
      callback('DB CONNECTION ERROR')
    }
  })
}


const getEndSchedule = (callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      let start = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS')
      const end = format(addMinutes(new Date(), 5), 'yyyy-MM-dd HH:mm:ss.SSS');
      const query = `select * from hvac_schedule where end between timestamp("${start}") and timestamp("${end}") order by start`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
}

module.exports = {
  getGateway,
  getSchedules,
  getLights,
  getAnalogControllers,
  getDevices,
  getAhuInfo,
  getRecuuringSheduleInfo,
  getDdcData,
  getRecuuringSheduleData,
  getDdcChildren,
  getEndSchedule
};
