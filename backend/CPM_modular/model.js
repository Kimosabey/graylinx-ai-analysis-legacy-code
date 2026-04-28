const { pool } = require('./../Database/pool');
const logger = require('./logger');

const addToControlCommand = (payload,request_id,callback)=>{
    // console.log("before to connection ==============================================================>",request_id)
    pool.getConnection((err,connection)=>{
        if(connection){
            const sql = 'insert into gl_control_command(id,ss_id,ss_type,zone_id,zone_type,gl_command,arguments,priority,triggered_time,status)values(?,?,?,?,?,?,?,?,?,?)';
            connection.query(sql,[request_id,payload.ss_id,payload.ss_type,payload.zone_id,payload.zone_type,payload.gl_command,payload.arguments,payload.priority,payload.triggered_time,"pending"],(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}

const updateResponseStatus=(ss_id,ss_type,status,callback)=>{
    console.log("Im in model =======================>",status)
    pool.getConnection((err,connection)=>{
        if(connection){
            const sql1 ="select somo.ss_id,somo.triggered_time,somo.gl_command,somo.ss_type from gl_control_command somo inner join (select max(triggered_time) as mea,som.ss_id as sid,som.id as outputId from gl_control_command som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) where somo.status='pending'"
            connection.query(sql1,(err,res)=>{
                if(err){
                    connection.release()
                    console.log("error in model",err)
                }else{
                    if(res.length > 0){
                        let sql2 = "update gl_control_command set status=? where ss_id=? and status=? and triggered_time=?";
                        connection.query(sql2,[status,ss_id,"pending",res[0].triggered_time],(err2,res2)=>{
                            if(err){
                                connection.release()
                                callback(err2)
                            }else{
                                logger.info("Able to update the success or failure of controlled device")
                                if(status == 'failure'){
                                    const sql3 = 'insert into gl_alarm(ss_id,alarm_code,param_id,message)values(?,?,?,?)';
                                    connection.query(sql3,[ss_id,'399',res[0].gl_command,'On Off mismatch'],(err3,res3)=>{
                                        connection.release()
                                        if(err3){
                                            console.log(err3)
                                        }else{
                                            console.log("Failure update in the alarm table")
                                        }
                                    })
                                }else{
                                    connection.release();
                                    console.log("=========Success==========",res2)

                                }
                                // callback(null,res2)
                            }
                        })
                    }else{
                        connection.release()
                        console.log("no data to update")
                        logger.info("No data to update the success or failure of controlled device")
                    }
                }
            })
        }
    })
}

module.exports={
    addToControlCommand,
    updateResponseStatus
}