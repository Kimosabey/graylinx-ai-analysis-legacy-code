const { pool } = require('../../Database/pool');

const getTechnicians = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = 'select username,email from user where role_name="technician";'
            connection.query(query,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    if(results.length > 0){
                        callback(null,results)
                    }else{
                        callback('NO TECHNICIANS FOUND')
                    }
                }
            })
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

const configuration_values = (data,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query1 = 'select * from gl_configuration';
            connection.query(query1, (err1, results1)=>{
                if(err1){
                    callback(err1)
                }else{
                    if(results1.length > 0){
                        //update
                        const query2 = 'update gl_configuration set gl_value=? where gl_key=?';
                        connection.query(query2,[data.gl_value,data.gl_key],(err2,results2)=>{
                            connection.release();
                            if(err2){
                                callback(err2)
                            }else{
                                callback(null,"Updated successfully")
                            }
                        })
                    }else{
                        //insert
                        const query3 = 'insert into gl_configuration(gl_key,gl_value) values(?,?)';
                        connection.query(query3,[data.gl_key,data.gl_value],(err3,results3)=>{
                            connection.release();
                            if(err3){
                                callback(err3)
                            }else{
                                callback(null,'Inserted successfully')
                            }
                        })
                    }
                }
            })
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

const instrumentation = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = 'select ss_id,measured_time,metric_id,metric_value from server_instrumentation  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 DAY) and measured_time < NOW();'
            connection.query(query,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    if(results.length > 0){
                        callback(null,results)
                    }else{
                        callback(null,[])
                    }
                }
            })
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

  module.exports={
    getTechnicians,
    configuration_values,
    instrumentation
  }