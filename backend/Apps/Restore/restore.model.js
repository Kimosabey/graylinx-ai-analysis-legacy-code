const { pool } = require('../../Database/pool');
const { query } = require('../../Config/logger');
const { toFixed } = require('../../Utils/common');

const getAhuDevices = (ss_type, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = "select * from gl_subsystem where ss_type='NONGL_SS_AHU'";
      connection.query(query, ss_type, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const getAhuDeviceIp = (ss_parent, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'select * from gl_subsystem where id=?';
      // const query="WITH RECURSIVE subordinates AS (SELECT id,name,ss_type,ss_parent,ss_tag,description,ss_address_value FROM gl_subsystem WHERE id=? UNION SELECT p.id,p.name,p.ss_type,p.ss_parent,p.ss_tag,p.description,p.ss_address_value FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id) SELECT * FROM subordinates order by ss_tag";
      connection.query(query, ss_parent, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          //   console.log("model",results)
          callback(null, results);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const addAhuDeviceData = (insertData, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'insert into gl_alarm (ss_id,alarm_code,message,param_id,measured_time) values ?';
      connection.query(query, [insertData], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const ahuAlarmInfo = (id,callback) =>{
  pool.getConnection((err, connection)=>{
    if(connection){
      const query ='select gl.ss_id,gl.alarm_code,gl.message,gl.param_id,gl.acknowledged,gl.delete_alarm from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla where gla.ss_id=? group by gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.acknowledged=0 and gl.delete_alarm=0';
      connection.query(query,id,(error,results)=>{
        connection.release();
        if(error){
          callback(error);
        } else {
          callback(null,results);
        }
      })
    }else{
      callback('DB connection error');
    }
  });
}
const getAlertslist = (id,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        const query = `select gl.id,gl.ss_id,gl.alarm_code,gl.message,gl.param_id,gl.restore from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla where gla.ss_id=? group by gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.restore=0 and gl.delete_alarm=0;`;
        connection.query(query,id, (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            callback(null,results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

  const restore = (updateDAta,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        let count=0
        updateDAta.forEach(element => {
          const query = `update gl_alarm set restore=? where id=?`;
          connection.query(query,[1,element.id], (error, results) => {
            if (error) {
              callback(error);
            } else {
              count++
              if(count==updateDAta.length){
                console.log("conneection realesd")
                connection.release()
                callback(null,results);
              }
            }
          });
        });
       
      } else {
        callback('DB connection error');
      }
    });
  };


  module.exports ={
    getAlertslist,
    getAhuDevices,
    getAhuDeviceIp,
    addAhuDeviceData,
    ahuAlarmInfo,
    restore
  }





 