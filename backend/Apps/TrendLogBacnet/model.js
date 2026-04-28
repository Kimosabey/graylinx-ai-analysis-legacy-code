const { pool } = require('../../Database/pool');
const moment = require('moment');


const instancesInfo = (callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            // const query = ' select gl.id,gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance,som.measured_time as lastUpTime from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss,gl_subsystem_latest_event som  where gl.ss_parent=gls.id AND glss.ss_parent=gl.id  and som.param_id=glss.name and som.ss_id=gl.id;';
            const query=`select gl.id,gl.ss_address_value as tag,gl.ss_type,SUBSTRING_INDEX(glss.name,"_",1)as parameter,gls.ss_address_value as ip,glss.ss_tag as type,glss.ss_address_value as instance,som.measured_time as lastUpTime from gl_subsystem gl inner join gl_subsystem gls on gl.ss_parent=gls.id inner join gl_subsystem glss on glss.ss_parent=gl.id  left join gl_subsystem_latest_event som on som.param_id=SUBSTRING_INDEX(glss.name,"_",1)  and som.ss_id=gl.id where glss.name like "%_tl" and glss.description like '%A001%';`
            connection.query(query,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback('DB connection error')
        }
    })
  }


  const serverRestartStatus=(callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            let sqlRestart=`select ss.id,sd.param_value from gl_subsystem ss inner join gl_subsystem_detail sd on sd.ss_id=ss.id  where ss_type='GL_SS_SERVER' and sd.param_name='restart';`
            connection.query(sqlRestart,(err,result)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,result)
                }
            })
        }else{
            callback("DB CONNECTION ERROR")
        }
    })
  }

  module.exports={
    instancesInfo,
    serverRestartStatus
  }