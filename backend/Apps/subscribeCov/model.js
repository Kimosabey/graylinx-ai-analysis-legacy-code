const { pool } = require('../../Database/pool');
const moment = require('moment');


const instancesInfo = (callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            // const query = 'select gl.id,gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss where gl.ss_parent=gls.id AND glss.ss_parent=gl.id  and  RIGHT(glss.name,3)!="_tl";';
            const query=`select gl.id,gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss where gl.ss_parent=gls.id AND glss.ss_parent=gl.id  and  RIGHT(glss.name,3)!="_tl" and gls.ss_status='GL_SS_STATUS_ACTIVE' and gl.ss_status='GL_SS_STATUS_ACTIVE';`
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


  module.exports={
    instancesInfo
  }