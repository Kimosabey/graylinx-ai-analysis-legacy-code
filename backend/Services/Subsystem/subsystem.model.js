const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');
const { query } = require('../../Config/logger');
const _ = require('lodash');
const e = require('cors');
const CPM_Data_Handler = require('./../../CPM_modular/CPM_Data_Handler')

const createSubsystem = (payload, callback) => {
    pool.getConnection((error, connection) => {
        if (connection) {
            connection.query("SELECT count(*) as count from gl_subsystem WHERE name = (?)",[payload.name], (err1, result1) => {
                console.log("======r1",result1)
                if (result1[0].count == 0) {
                    connection.query("INSERT INTO gl_subsystem(uuid,name,is_active,tag,description,subsystem_type,status_type,parent_id,mac) VALUES (?,?,?,?,?,?,?,?,?)", [payload.id, payload.name, payload.is_active, payload.tag, payload.description, payload.subsystem_type, payload.status, payload.parent_id,payload.mac], (err2, result2) => {
                        if (result2) {
                            logger.info("ACTION: Create Organization; ORG ID: " + payload.id +
                            "; RESULT: Success; USER: admin; ROLE: super_admin")
                            callback(null, payload.id); 
                        }else{
                            callback(err2)
                        }
                    })

                }
                else {
                    var err1 = new Error(`${payload.name} already exists`);
                    err1.status = 404;
                    logger.error("ACTION: Create Organization;" +
                        "; RESULT: Organization Name already exists; USER: admin; ROLE: super_admin")
                    callback(err1)
                }
            })
        }
        else {
            callback("DB connection error")
        }
    })
}

// const insertSetpoint=(userid,deviceId,data,callback)=>{
//     let datadup=data
//     pool.getConnection((error,connection)=>{
//         if(connection){
//            const query="insert into gl_subsystem_input_map (ss_id,param_id,param_value) values(?,?,?)"
//                 connection.query(query,[deviceId,data.param_id,data.param_value],(error,result)=>{
//                     if(error){
//                         console.log("err",error.message)
//                         callback(error)
//                     }else{       
//                         const query1='select s.id,s.param_id,s.param_value from gl_subsystem_process_map s inner join (select  max(created_at) as lates,ss_id,param_id  from gl_subsystem_process_map group by ss_id,param_id)as l_max on l_max.lates=s.created_at and s.param_id=l_max.param_id where s.ss_id=?'
//                         connection.query(query1,[deviceId],(error1,results1)=>{
//                             if(error1){
//                                 callback(error1)
//                             }else{
//                                 let insertData=[]
//                                 console.log("resulta--------",results1)
//                                 results1.forEach(Element=>{
//                                     let data=[]
//                                     if(Element.param_id!="ahu_set_point"){
//                                         data.push(result.insertId)
//                                         data.push(deviceId)
//                                         data.push(Element.param_id)
//                                         data.push(Element.param_value)
//                                         data.push("processing")
//                                         insertData.push(data)
//                                     }else{
//                                         data.push(result.insertId)
//                                         data.push(deviceId)
//                                         data.push(Element.param_id)
//                                         data.push(datadup.param_value)
//                                         data.push("processing")
//                                         insertData.push(data)
//                                     }
                                       
//                                 })
//                                 const query3='update  gl_subsystem_process_map set status="done" where ss_id=? and status="processing"'
//                                 connection.query(query3,[deviceId],(error3,result3)=>{
//                                     if(error3){
//                                         callback(error)
//                                     }else{
//                                         console.log("insert data",insertData)
//                                         const query2='insert into gl_subsystem_process_map(process_id,ss_id,param_id,param_value,status) values ?'
//                                         connection.query(query2,[insertData],(error2,result)=>{
//                                             connection.release();
//                                             if(error2){
//                                                 callback(error2)
//                                             }else{
//                                                 callback(null,result.insertId);
//                                             }
//                                         })
//                                     }
//                                 })
//                             }
//                         })
//                        //const query1="insert into gl_subsystem_process_map (ss_id,param_id,param_value,process_id,status) values (?,?,?,?,?);"
//                     //    connection.query(query1,[deviceId,data.param_id,data.param_value,result.insertId,"processing"],(error1,result1)=>{
//                     //        connection.release();
//                     //        if(error){
//                     //             callback(error1)
//                     //        }else{
//                     //            callback(null,result1)
//                     //        }
//                     //    })
//                     }
//                 })
//         }else{
//             callback("DB connection error")
//         }
//     })
// }

const userId =(callback) =>{
    pool.getConnection((err,connection)=>{
      if(connection){
        const query =  'select * from gl_user where name="Raghu"';
          connection.query(query,(err,results)=>{
            connection.release();
            if(err){
              callback(err)
            }else{
            //   console.log("userId",results)
              callback(null,results)
          }
        })
      }
    })
  }

  const setPointEvents =(category,deviceId,data,triggering_user,callback) =>{
    pool.getConnection((err,connection)=>{
      if(connection){
        const query =  'insert into gl_ibms_event (ss_id,category,param_id,param_value,triggering_user) values (?,?,?,?,?)';
          connection.query(query,[deviceId,category,data.param_id,data.param_value,triggering_user],(err,results)=>{
            connection.release();
            if(err){
                console.log(err)
              callback(err)
            }else{
            //   console.log("setPointEvents",results)
              callback(null,results)
          }
        })
      }
    })
  }



const insertSetpointBac=(deviceId,data,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            console.log("data.param_id",data.param_id)
           const query="insert into gl_subsystem_input_map (ss_id,param_id,param_value,user_id) values(?,?,?,?)"
                connection.query(query,[deviceId,data.param_id,data.param_value,data.user_id],(error,result)=>{
                    console.log("query",query)
                    connection.release();
                    if(error){
                        console.log("err",error.message)
                        callback(error)
                    }else{    
                        callback(error,result)
                    }
                })
        }else{
            callback("DB connection error")
        }
    })


}

  const getdeviceData=(deviceId,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
           const query="select * from gl_subsystem where id=?";
                connection.query(query,[deviceId],(error,result)=>{
                    connection.release();
                    if(error){
                        console.log("err",error.message)
                        callback(error)
                    }else{   
                        callback(error,result)
                    }
                })
        }else{
            callback("DB connection error")
        }
    })
  }



  const getInstance=(deviceId,data,callback)=>{
      console.log("==========================",data)
    pool.getConnection((error,connection)=>{
        if(connection){
            console.log("-----------------",deviceId)
           const query="select * from gl_subsystem where ss_parent=? and name=?";
                connection.query(query,[deviceId,data.param_id],(error,result)=>{
                    connection.release();
                    if(error){
                        console.log("err",error.message)
                        callback(error)
                    }else{   
                        callback(error,result)
                    }
                })
        }else{
            callback("DB connection error")
        }
    })
  }

const checkCommandStatus=(id,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
           const query="select ss_id,ss_type,gl_command,status,modified_at as controlled_at from gl_control_command where id=?";
                connection.query(query,[id],(error,result)=>{
                    connection.release();
                    if(error){
                        console.log("err",error.message)
                        callback(error)
                    }else{   
                        callback(null,result)
                    }
                })
        }else{
            callback("DB connection error")
        }
    })
}

const relinquishPriority=(id,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
           const query="select somo.ss_id,somo.triggered_time,somo.gl_command,somo.ss_type,somo.priority from gl_control_command somo inner join (select max(triggered_time) as mea,som.ss_id as sid,som.id as outputId from gl_control_command som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) where somo.ss_id=?";
                connection.query(query,[id],(error,result)=>{
                    if(error){
                        connection.release();
                        console.log("err",error.message)
                        callback(error)
                    }else{
                        if(result.length > 0){
                            const query1 = "update gl_control_command set priority=? where ss_id=? and triggered_time=?";
                            connection.query(query1,[null,result[0].ss_id,result[0].triggered_time],(err,res)=>{
                            connection.release();
                            if(err){
                                callback(err)
                            }else{
                                CPM_Data_Handler.updateRelinqiushPriority(result)
                                callback(null,"RELINQUISH FOR PRIORITY IS UPDATED")
                            }
                            })
                        }else{
                            connection.release();
                            callback(null,"NO COMMAND FOR THIS DEVICE TO UPDATE")
                        }
                        // callback(null,result)
                    }
                })
        }else{
            callback("DB connection error")
        }
    })
}

module.exports = {
    createSubsystem,
    userId,
    setPointEvents,
    insertSetpointBac,
    getdeviceData,
    getInstance,
    checkCommandStatus,
    relinquishPriority
}
