const { query } = require("../../Config/logger")
const { pool } = require("../../Database/pool")




const instancesInfo=(callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            //ss_type="NONGL_SS_AHU" or
            const sql='select gl.id,gl.ss_type, gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss where gl.ss_parent=gls.id AND glss.ss_parent=gl.id AND (gl.ss_type="NONGL_SS_AHU" or  gl.ss_type="NONGL_SS_EMS" or gl.ss_type="NONGL_SS_CHILLER" or gl.ss_type="NONGL_SS_PUMPS" or gl.ss_type="NONGL_SS_SECONDARY_PUMPS") AND gls.ss_status="GL_SS_STATUS_ACTIVE" and gls.ss_status="GL_SS_STATUS_ACTIVE" and (glss.ss_tag=5 or glss.ss_tag=2);'
            connection.query(sql,(error,result)=>{
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




const getDeviceChildren=(devId,callback)=>{
   // console.log("dataloader model===========================>?")
    pool.getConnection((error,connection)=>{
        if(connection){
            //ss_type="NONGL_SS_AHU" orselect * from gl_subsystem where ss_parent='01f8d696-5abc-4ba1-a3be-415bedaed456' and (ss_tag =2
            //const sql='select * from gl_subsystem where ss_parent=? and ss_tag=?'
            const sql='select ss.name ,ss.ss_tag ,ss.ss_address_value,ddc.ss_address_value as ip,ip.ss_type  from gl_subsystem ss inner join  gl_subsystem ip on ss.ss_parent=ip.id inner join gl_subsystem ddc on ip.ss_parent=ddc.id  where ss.ss_parent=? and RIGHT(ss.name,3)!="_tl"'
            connection.query(sql,[devId],(error,result)=>{
                connection.release()
                if(error){
                   // console.log("=======,on omodel error")
                    callback(error)
                }else{
                    //console.log("=======,on omodel error",result)
                    callback(null,result)
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}


const insertUpdatePLE=(resArr,type,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            let count=0
            resArr.forEach(element => {
                //check data present in LE
                //id ,name
                sql='select * from gl_subsystem_latest_event where ss_id=? and param_id=?'
                connection.query(sql,[element.id,element.param],(errsel,resultsel)=>{
                    if(errsel){
                        callback(errsel)
                    }else{
                        if(resultsel.length>0){
                            //update LE
                            sql2='update gl_subsystem_latest_event set param_value=?,measured_time=?  where ss_id=? and param_id=?'
                            connection.query(sql2,[element.p_value,element.time,element.id,element.param],(errup,resultup)=>{
                                if(errup){
                                    callback(errup)
                                }else{
                                    if(type=='_p'){
                                        connection.query(
                                            `insert into ${element.tableName} (ss_id,measured_time,param_id,param_value) values (?,?,?,?)`,
                                            [
                                                element.id,
                                                element.time,
                                                element.param,
                                                element.p_value
                                            ],(errorinsp,resInsp)=>{
                                                if(errorinsp){
                                                    callback(errorinsp)
                                                }else{
                                                    count++
                                                    if(count==resArr.length){
                                                        connection.release()
                                                        callback(null,resInsp)
                                                    }
                                                }
                                            }
                                        )
                                    }
                                    else{
                                        count++
                                        if(count==resArr.length){
                                            connection.release()
                                            callback(null,resultup)
                                        }  
                                    }
                                  

                                }
                            })
                        }else{
                            //insert LE
                            connection.query(
                                'INSERT INTO gl_subsystem_latest_event SET ?'
                                ,{
                                    ss_id:element.id,
                                    measured_time:element.time,
                                    param_id:element.param,
                                    param_value:element.p_value
                                },(errIns,resultIns)=>{
                                if(errIns){
                                    callback(errIns)
                                }else{
                                    if(type=='_p'){
                                        connection.query(
                                            `insert into ${element.tableName} (ss_id,measured_time,param_id,param_value) values (?,?,?,?)`,
                                            [
                                                element.id,
                                                element.time,
                                                element.param,
                                                element.p_value
                                            ],(errorinsp,resInsp)=>{
                                                if(errorinsp){
                                                    callback(errorinsp)
                                                }else{
                                                    count++
                                                    if(count==resArr.length){
                                                        connection.release()
                                                        callback(null,resInsp)
                                                    }
                                                }
                                            }
                                        )
                                    }else{
                                        count++
                                        if(count==resArr.length){
                                            connection.release()
                                            callback(null,resultIns)
                                        }
                                    }
                                   
                                }
                            })
                        }
                    }
                })
                
            });
        }else{
            callback('DB CONNECTION ERROR')
        }
    })

}


const updateLatestEvent=(resArr,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            let count=0
            resArr.forEach(element => {
                //check data present in LE
                //id ,name
                sql='select * from gl_subsystem_latest_event where ss_id=? and param_id=?'
                connection.query(sql,[element.ss_id,element.param],(errsel,resultsel)=>{
                    if(errsel){
                        callback(errsel)
                    }else{
                        if(resultsel.length>0){
                            //update LE
                            sql2='update gl_subsystem_latest_event set param_value=?,measured_time=?  where ss_id=? and param_id=?'
                            connection.query(sql2,[element.p_value,element.measured_time,element.ss_id,element.param],(errup,resultup)=>{
                                if(errup){
                                    callback(errup)
                                }else{
                                   count++
                                    if(count==resArr.length){
                                        connection.release()
                                        callback(null,resultup)
                                    }
                                }
                            })
                        }else{
                            //insert LE
                            connection.query(
                                'INSERT INTO gl_subsystem_latest_event SET ?'
                                ,{
                                    ss_id:element.ss_id,
                                    measured_time:element.measured_time,
                                    param_id:element.param,
                                    param_value:element.p_value
                                },(errIns,resultIns)=>{
                                if(errIns){
                                    callback(errIns)
                                }else{
                                   count++
                                   if(count==resArr.length){
                                    connection.release()
                                    callback(null,resultIns)
                                   }
                                }
                            })
                        }
                    }
                })
                
            });
        }else{
            callback('DB CONNECTION ERROR')
        }
    })

}


const insertempermanent=(resArr,callback)=>{
   
    pool.getConnection((error,connection)=>{
        if(connection){
            let count=0
    resArr.forEach(data=>{
        // console.log("data=======>",Object.keys(data)[0].slice(0,Object.keys(data)[0].length-1)+'p')
        // console.log("----------->value",Object.values(data)[0])
        let table_name=Object.keys(data)[0].slice(0,Object.keys(data)[0].length-1)+'p'
                // INSERT INTO latest_event SET ?
                let sql=`INSERT INTO ${table_name} SET ?`
            connection.query(sql,Object.values(data)[0],(err,result)=>{
                if(err){
                    callback(err)
                }else{
                    count++
                    if(count==resArr.length){
                        connection.release()
                        callback(null,'done')
                    }
                }
            })
        })
            }else{
                callback("DB CONNECTION ERROR")
            }
        
       
    })
    
}

module.exports={
    instancesInfo,
    getDeviceChildren,
    insertUpdatePLE,
    updateLatestEvent,
    insertempermanent
}


