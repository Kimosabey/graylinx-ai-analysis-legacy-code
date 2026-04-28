const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const getDag =(dagId,callback) => {
    pool.getConnection((error, connection) => {
      if (error) {
        callback(error);
      }
      // 'select * from gl_subsystem where name ="DDC2"';
      const sql = 'select * from gl_subsystem where ss_type="GL_SS_DAG" or ss_type="GL_SS_ADDRESS_BACNET_DDC" and id=?'
      connection.query(sql,[dagId], (err, results) => {
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
  module.exports = {
    getDag,
    getBacnetDeviceData
  };