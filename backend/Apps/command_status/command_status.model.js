const { pool } = require('../../Database/pool');
const { query } = require('../../Config/logger');


const command_status=(callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            const query=`select * from device_status where status="failed" and counter<2`
            connection.query(query,(error,result)=>{
                connection.release();
                if(error){
                    callback(error)
                }else{
                    let i=0;
                    result.forEach(element => {
                        pool.getConnection((error,connection)=>{
                            if(connection){
                                const query='update device_status set status="failed_tried" where id=?'
                                connection.query(query,element.id,(error,result1)=>{
                                connection.release();
                                if(error){
                                    callback(error)
                                }else{
                                    i++
                                    if( i==result.length){
                                        callback(null,result)
                                    }
                                }
                            })

                            }else{
                                callback(error)
                            }
                        })
                    });
                    // callback(null,result)
                }
            })
        }else{
            callback(error)
        }


    })
}

module.exports = {
    command_status
}