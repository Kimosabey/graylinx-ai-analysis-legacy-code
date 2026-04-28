const { pool } = require('../../Database/pool');
const uuid = require('uuid/v4');


const dagRegister = (data,callback)=>{
    let id = uuid();
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "insert into gl_subsystem(id,name,ss_address_value,ss_tag,ss_type,ss_address_type) values(?,?,?,?,?,?);";
            connection.query(query,[id,data.name,data.ip,data.code,"GL_SS_DAG","GL_SS_ADDRESS_IP"],(err,results)=>{
                connection.release()
                if(err){
                    callback(err)
                }else{
                    callback(null,id)
                }
            })
        }else{
            callback(null,'DB connection error')
        }
    })
}

const getDDCDevices = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "select gs.id,gs.name,gs.ss_address_value as ip,gls.zone_id from gl_subsystem gs inner join gl_location_subsystem_map gls on gs.id=gls.ss_id where ss_type='GL_SS_ADDRESS_BACNET_DDC'";
            connection.query(query,(err,results)=>{
                connection.release()
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback(null,'DB connection error')
        }
    })
}

const getDevices = (Id,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "select * from gl_subsystem where ss_parent=?";
            connection.query(query,Id,(err,results)=>{
                connection.release()
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback(null,'DB connection error')
        }
    })
}

const editAndMapDevice = (body,callback) =>{
    console.log("body",body)
    let name = body.name
    let ss_id = body.ss_id
    let zone_id = body.zone_id
    pool.getConnection((err,connection)=>{
        if(connection){
            if(name == ""){
                const query = "insert into gl_location_subsystem_map(zone_id,ss_id) values(?,?)";
                connection.query(query,[zone_id,ss_id],(err,results)=>{
                    connection.release()
                    if(err){
                        callback(err)
                    }else{
                        callback(null,"inserted")
                    }
                })
            }else{
                const query1 ="update gl_subsystem set name=? where id=?";
                connection.query(query1,[name,ss_id],(err1,results1)=>{
                    if(err1){
                        connection.release();
                        callback(err1)
                    }else{
                        const query2 = "insert into gl_location_subsystem_map(zone_id,ss_id) values(?,?)";
                        connection.query(query2,[zone_id,ss_id],(err2,results2)=>{
                            connection.release();
                            if(err2){
                                callback(err2)
                            }else{
                                callback(null,"inserted")
                            }
                        })
                    }
                })
            }
        }else{
            callback(null,'DB connection error')
        }
    })
}

const getDevicesInfo = (Id,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "select * from gl_subsystem where id=?";
            connection.query(query,Id,(err,results)=>{
                connection.release()
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback(null,'DB connection error')
        }
    })
}

module.exports={
     dagRegister,
     getDDCDevices,
     getDevices,
     editAndMapDevice,
     getDevicesInfo
}