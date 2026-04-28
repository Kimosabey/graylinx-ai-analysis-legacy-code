const { pool } = require('../../Database/pool');
const schedule = require('node-schedule');
const { exec } = require('child_process');
const fns= require('date-fns');




let lockServerTime='2023-03-02 15:55:00'
let current=fns.format(new Date(), "yyyy-MM-dd HH:mm:ss")
if(lockServerTime>current){
  console.log("job scheduled at",lockServerTime)
  schedule.scheduleJob(lockServerTime, lockServerTime, () => {
  pool.getConnection((err,connection)=>{
    connection.release();
    if(connection){
        sql=`update super_admin set mac_address='qwertyuiop'`
        connection.query(sql,(error,result)=>{
          if(error){
            console.log("error in query")
          }else{
            console.log("server stopped")
            exec('pm2 stop all');
          }
        })
    }else{
      console.log("DB CONNECTION ERROR")
    }
  })  
  });
}else{
  console.log("sever stooped running")
  pool.getConnection((err,connection)=>{
    connection.release();
    if(connection){
        sql=`update super_admin set mac_address='qwertyuiop'`
        connection.query(sql,(error,result)=>{
          if(error){
            console.log("error in query")
          }else{
            console.log("server stopped")
            exec('pm2 stop all');
          }
        })
    }else{
      console.log("DB CONNECTION ERROR")
    }
  })
}


