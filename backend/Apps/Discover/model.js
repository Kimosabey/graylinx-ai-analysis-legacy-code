const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const getBacnetDeviceIp = callback => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    // 'select * from gl_subsystem where name ="DDC2"';
    const sql = 'select * from gl_subsystem where ss_type="GL_SS_ADDRESS_BACNET_DDC"'
    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      } else {
        if (results.length > 0) {
          callback(null, results);
        } else {
          callback(null, false);
        }
      }
    });
  });
};

const updateBacnetDeviceStatus = (ddcdata, restored_time, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("db connection error");
    }else{
        let count = 0
        // console.log("data",ddcdata)
             ddcdata.forEach(element => {
                const sql = `update gl_alarm set restore = ?, restored_time = ? where ss_id =? and restore=?`;
                connection.query(sql, [1,restored_time,element.id,0], (err,results) => {
                  if (err) {
                    callback(err);
                  } else {
                    count++
                    if(count==ddcdata.length){
                        connection.release()
                        console.log(results)
                        callback(null,results);
                    }
                  }
                });
             });
    }
  });
};

const insertintoalarm = (data, callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error);
      }
      const sql = 'insert into gl_alarm (ss_id,alarm_code,message) values ?';
      connection.query(sql, [data], (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    });
  };

  const DdcAlarmInfo = (data,callback) =>{
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error);
      }
      const sql = 'select gl.ss_id,gl.alarm_code,gl.restore,gl.restored_time,gl.acknowledged from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla  where gla.ss_id=? group by gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.restore=?';
      connection.query(sql, [data,0], (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    }); 
  }
  const getuser=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        // const sql='select email,username from user;'
        const sql='select email from user where username="shift_3" or username="admin1";'
        connection.query(sql,(error,result)=>{
          connection.release()
          if(error){
            callback(error)
          }else{
            // console.log("------>users",result)
            callback(null,result)
          }
        })
      }else{
        callback('DB CONNECTION ERROR')
      }
    })
  }
module.exports = {
  getBacnetDeviceIp,
  updateBacnetDeviceStatus,
  insertintoalarm,
  DdcAlarmInfo,
  getuser
};