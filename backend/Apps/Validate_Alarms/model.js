const { pool } = require('../../Database/pool');

const alarmToValidate=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        //  const query="select * from gl_alarm where validate=0 and restore=0 and measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        const query="SELECT ga.* FROM gl_alarm ga JOIN (SELECT MAX(measured_time) AS max_measured_time,param_id FROM gl_alarm WHERE validate = 0 AND restore = 0 GROUP BY param_id) AS max_values ON ga.measured_time = max_values.max_measured_time AND ga.param_id = max_values.param_id;";
        connection.query(query,(err,result)=>{
          connection.release();
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
  }

const getLatestValuesForAlarm=(id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
         const query="select * from gl_subsystem_latest_event where ss_id=?";
        connection.query(query,[id],(err,result)=>{
          connection.release();
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
  }
  
  const getInputValuesForAlarm=(id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
         const query="select somo.ss_id,somo.triggered_time,somo.param_id,somo.param_value from gl_subsystem_input_map  somo inner join (select max(triggered_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_input_map  som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id) where ss_id=?;"
        connection.query(query,[id],(err,result)=>{
          connection.release();
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
  }

  const alarmToValidateDsp=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
         const query="select * from gl_alarm where validate=0 and restore=0 and param_id='DSP'";
        connection.query(query,(err,result)=>{
          connection.release();
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
  }

  const alarmToValidateZnt=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
         const query="select * from gl_alarm where validate=0 and restore=0 and param_id='ZNT'";
        connection.query(query,(err,result)=>{
          connection.release();
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
  }

  const getuser=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='select email from user where username="admin1";'
        connection.query(sql,(error,result)=>{
          connection.release();
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

  const validatedAlarm=(id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='update gl_alarm set validate=1 where id=?;'
        connection.query(sql,[id],(error,result)=>{
          connection.release();
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

  const update_causes=(data,id,callback)=>{
    // console.log("data at model",Object.values(data).length)
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='update gl_alarm set possible_causes=? where id=?;'
        connection.query(sql,[JSON.stringify(Object.values(data)),id],(error,result)=>{
          connection.release();
          if(error){
            callback(error)
          }else{
            callback(null,"inserted")
          }
        })
      }else{
        callback('DB CONNECTION ERROR')
      }
    })
  }

  const restoreAlarm=(id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='update gl_alarm set restore=1 where id=?;'
        connection.query(sql,[id],(error,result)=>{
          connection.release();
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

  const getParent=(id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='select gls.ss_address_value from gl_subsystem gl inner join gl_subsystem gls on gl.ss_parent=gls.id where gl.id=?;'
        connection.query(sql,[id],(error,result)=>{
          connection.release();
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

  const addTriggerId=(id,ala_id,callback)=>{
    console.log("iddddddddddd",id)
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='insert into gl_pas_res(trigger_id,Alarm_id) values(?,?)'
        connection.query(sql,[id,ala_id],(error,result)=>{
          connection.release();
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

  const feedbackFrom=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='select * from gl_alarm_root_cause';
        connection.query(sql,(error,result)=>{
          connection.release();
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

  const getPasPort=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='select * from gl_configuration where gl_key="pas_port"';
        connection.query(sql,(error,result)=>{
          connection.release();
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

  const updateModifiedTime=(mod_time,id,callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='update gl_alarm set modified_at=? where id=?;'
        connection.query(sql,[mod_time,id],(error,result)=>{
          connection.release();
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

  module.exports = {
    getInputValuesForAlarm,
    getLatestValuesForAlarm,
    alarmToValidate,
    alarmToValidateDsp,
    alarmToValidateZnt,
    getuser,
    validatedAlarm,
    update_causes,
    restoreAlarm,
    getParent,
    addTriggerId,
    feedbackFrom,
    getPasPort,
    updateModifiedTime
  }