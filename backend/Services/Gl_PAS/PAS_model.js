const { error } = require('winston');
const { pool } = require('../../Database/pool');
const uuid = require('uuid/v4');
const fns = require('date-fns');

const responseFromFDD =(id,data,callback)=>{
    console.log(id,data)
    pool.getConnection((error,connection)=>{
        if(error){
          callback(error)
        }else{
          const query="insert into pas_res(trigger_id,pas_res) values(?,?)";
          connection.query(query,[id,JSON.stringify(data)],(err, result) => {
            connection.release();
            if (err) {
              callback(err);
            } else {
              callback(null, result);
            }
          });
        }
      })
}

const getalarmId = (id,callback)=>{
// console.log("model_alarm_id",id)
    pool.getConnection((error,connection)=>{
        if(error){
          callback(error)
        }else{
          const query="select Alarm_id from gl_pas_res where trigger_id=?";
          connection.query(query,[id],(err, result) => {
            connection.release();
            if (err) {
              callback(err);
            } else {
              callback(null, result);
            }
          });
        }
      })
}

const update_causes=(data,id,callback)=>{
    // console.log("update",JSON.stringify(Object.values(data)))
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='update gl_alarm set possible_causes=? where id=?;'
        connection.query(sql,[JSON.stringify(Object.values(data)),id],(error,result)=>{
          connection.release();
          if(error){
            callback(error)
          }else{
            callback(null,"inserted")
          }
        })
      }else{
        callback(null,'DB CONNECTION ERROR')
      }
    })
}

  const getuser=(callback)=>{
    pool.getConnection((error,connection)=>{
      if(connection){
        const sql='select * from user where role_id=2 and role_name="admin"';
        connection.query(sql,(error,result)=>{
          connection.release();
          if(error){
            callback(error)
          }else{
            callback(null,result)
          }
        })
      }else{
        callback(null,'DB CONNECTION ERROR')
      }
    })
  }

const getAhuId=(equipmentId,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      let value = equipmentId.slice(4, 10)
       console.log("valueeee",value)
      const sql=`select id from gl_subsystem where ss_address_value like "%${value}%"`;
      connection.query(sql,(error,result)=>{
        connection.release();
        if(error){
          callback(error)
        }else{
          callback(null,result)
        }
      })
    }else{
      callback(null,'DB CONNECTION ERROR')
    }
  })
}

const insertIntoAlarm = (deviceId,fault,causes,callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      let ss_id = deviceId
      let measured_time = fns.format(new Date(), "yyyy-MM-dd HH:mm:ss");
      let message = fault
      let possible_causes = causes
      const query = "insert into gl_alarm(ss_id,alarm_code,measured_time,message,possible_causes) values (?,?,?,?,?)";
      connection.query(query,[ss_id,'400',measured_time,message,JSON.stringify(possible_causes)],(err,results)=>{
        connection.release()
        if(err){
          callback(err)
        }else{
          callback(null,results)
        }
      })
    }else{
      callback(null,'DB CONNECTION ERROR')
    }
  })
}

module.exports={
    responseFromFDD,
    getalarmId,
    update_causes,
    getuser,
    getAhuId,
    insertIntoAlarm
}