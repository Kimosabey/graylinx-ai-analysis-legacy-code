const schedule = require('node-schedule');
const logger = require('../../Config/logger');
const mysql = require('mysql');

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    port: 3306, // Change this to your MySQL server port if needed
    connectionLimit: 1 // Limit the pool to a single connection
  };
  const pool = mysql.createPool(dbConfig);
//every 5th sec job is running
schedule.scheduleJob('*/5 * * * * *', () => {
// schedule.scheduleJob('12,27,42,57 * * * *', () => {
    
    
    // pool.getConnection((err, connection) => {
    //     if(connection){
    //         const conQuery=`SHOW STATUS WHERE variable_name = 'Threads_connected';`
    //         connection.query(conQuery,(err,res)=>{
    //             connection.release()
    //             if(err){
    //                 logger.error(`Error querying server variables: ${queryErr.message}`);
    //             }else{
    //                 console.log(JSON.stringify(res))
    //                 logger.info('MySQL Server Variables:');
    //                 res.forEach((row) => {
    //                     logger.info(`${row.Variable_name}: ${row.Value}`);
    //                 });
    //             }
    //         })
    //         // console.log(`for DB connection`)
    //         // logger.info(`number of DB connections MYSQL SERVER`)
    //     }else{
    //         logger.error(`Error querying server variables: ${queryErr.message}`)
    //     }
    // })
    pool.getConnection((err, connection) => {
        if (err) {
            logger.error(`Error acquiring connection: ${err.message}`);
        } else {
            const conQuery = `SHOW STATUS WHERE variable_name = 'Threads_connected';`;
            connection.query(conQuery, (queryErr, res) => {
                connection.release();
                if (queryErr) {
                    logger.error(`Error querying server variables: ${queryErr.message}`);
                } else {
                    console.log(JSON.stringify(res));
                    logger.info('MySQL Server Variables:');
                    res.forEach((row) => {
                        logger.info(`${row.Variable_name}: ${row.Value}`);
                    });
                    
                }
            });
        }
    })
    
})