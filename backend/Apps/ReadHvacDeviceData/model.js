const { pool } = require('../../Database/pool');
const { compareAsc, format } = require('date-fns');
const { query } = require('../../Config/logger');
const { toFixed } = require('../../Utils/common');


const  getAhuDevices =(ss_type,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        const query="select * from gl_subsystem where ss_type='NONGL_SS_AHU'";
        connection.query(query,ss_type, (error, results) => {
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
  
  const  getAhuDeviceIp =(ss_parent,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
          const query = "select * from gl_subsystem where id=?"; 
        connection.query(query,ss_parent, (error, results) => {
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
  
  const addAhuDeviceData =(insertData,ss_type,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
          
          const query = "insert into gl_subsystem_output_map (ss_id,measured_time,param_id,param_value) values ?"; 
        connection.query(query,[insertData], (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            // console.log("model alaram",results)
            callback(null, results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

  const updateLatestEventSOM =(id,Ahudata,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        let count =0;
        console.log("------------------------------------->adhudat test",Ahudata)
        if(Ahudata.length>0){
          Ahudata.forEach(element => {
            const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
            connection.query(query,[id,element.name],(err,results)=>{
            if (err) {
              connection.release();
              callback(err);
            } else {
              if(results.length>0){
                //update
                const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                connection.query(query,[toFixed(element.presentValue,2),(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss')),id,element.name],(err1,results1)=>{
                  if(err){
                    callback(err1)
                  }else{
                    count++
                    console.log("=====================count",count)
                    console.log("result1---->uodtae",results1)
                    if(Ahudata.length==count){
                      connection.release();
                      callback(null,results1)
                    }
                  }
                })
              }else{
                //insert
                const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                connection.query(query,[ id,(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss')),element.name,element.presentValue],(err2,results2)=>{
                  if(err){
                    callback(err2)
                  }else{
                    count++
                    if(Ahudata.length==count){
                      connection.release();
                      callback(null,results2)
                    }
                  }
                })
                
              }
             
            }
            })
          });
        }else{
          console("no data coming")
        }
      } else {
        callback('DB connection error');
      }
    });
  };
  

  const getLatestAhuOnOffInput=(callback)=>{
    pool.getConnection((err,connection)=>{
      if(connection){
        const query="select somo.ss_id,somo.triggered_time,somo.param_id,somo.param_value,l.name as zone_name from gl_subsystem_input_map somo inner join (select max(triggered_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_input_map som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id) inner join gl_location_subsystem_map ls on ls.ss_id=somo.ss_id inner join gl_location l on ls.zone_Id=l.id where somo.ss_id='01f8d696-5abc-4ba1-a3be-415bedaed456' and somo.param_id='ahu_on_off_sp'"
        connection.query(query,(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
          }
        })
      }else{
        callback("DB CONNECTION ERROR")
      }
    })
  }

  const getLatestAhuOnOffOutput=(callback)=>{
    pool.getConnection((err,connection)=>{
      if(connection){
        const query="select * from gl_subsystem_latest_event where ss_id='01f8d696-5abc-4ba1-a3be-415bedaed456' and param_id='Supply Fan Status';"
        connection.query(query,(err,results)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,results)
          }
        })
      }else{
        callback("DB CONNECTION ERROR")
      }
    })
  }
  
  module.exports = {
    getAhuDevices,
    getAhuDeviceIp,
    addAhuDeviceData,
    updateLatestEventSOM,
    getLatestAhuOnOffInput,
    getLatestAhuOnOffOutput
   };