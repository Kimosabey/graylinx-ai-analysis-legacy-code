const { pool } = require('../../Database/pool');

const getConnections = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const conQuery = `SHOW STATUS WHERE variable_name = 'Threads_connected';`;
            connection.query(conQuery, (queryErr, res) => {
                connection.release();
                if (queryErr) {
                    callback(queryErr)
                } else {
                    // console.log(JSON.stringify(res));
                    callback(null,res)
                }
            });
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

const getServerId = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const conQuery = `select * from gl_subsystem where ss_type = "GL_SS_SERVER"`;
            connection.query(conQuery, (queryErr, res) => {
                connection.release();
                if (queryErr) {
                    callback(queryErr)
                } else {
                    callback(null,res)
                }
            });
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

const insertIntoMertic = (data,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
        const { ss_id, cpu_usage, memory_usage, db_connections, measured_time } = data;          
        const values = [
            [ss_id,measured_time, 'cpu_usage', cpu_usage],
            [ss_id,measured_time, 'memory_usage', memory_usage],
            [ss_id,measured_time, 'db_connections', db_connections]
        ];
        console.log("values",values)
        const sql = `insert into server_instrumentation(ss_id,measured_time,metric_id,metric_value)values ?`
        connection.query(sql,[values],(err,res)=>{
            connection.release();
            if(err){
                callback(err)
            }else{
                callback(null,"Inserted")
            }
        })
        }else{
            callback(null,'DB CONNECTION ERROR')
        }
    })
}

module.exports ={
    getConnections,
    getServerId,
    insertIntoMertic
}