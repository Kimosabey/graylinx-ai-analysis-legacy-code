const { pool } = require('../../Database/pool');
const { compareAsc, format } = require('date-fns');
const { query } = require('../../Config/logger');
const { toFixed } = require('../../Utils/common');
const { isNull } = require('lodash');

const addAhuDeviceData = (insertData,updateData,restoredata, callback) => {
  console.log("---------------------------------->insertfdat",insertData)
  console.log("updat====================>",updateData)
  console.log("--------------------------------restore--------------------->",restoredata)
  pool.getConnection((err, connection) => {
    if (connection) {
      if(insertData.length>0){
        const query =
        'insert into gl_alarm (ss_id,alarm_code,message,param_id,measured_time) values ?';
      connection.query(query, [insertData], (error, results) => {
        if (error) {
          callback(error);
        } else {
         if(updateData.length>0){
           //update to db
          //  console.log("1st ti,e",updateData)
           let upcount=0
           updateData.forEach(element => {
            //  let param=isNull(element.param_value)?1:parseInt(param_value)+1
            let mt=(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
             const query2='update gl_alarm set measured_time=? where id=?'
             connection.query(query2,[mt,element.id],(error1,results1)=>{
               if(error1){
                 callback(error1)
               }else{
                 upcount++
                 if(upcount===updateData.length){
                   if(restoredata.length>0){
                    connection.release()
                    restore(restoredata,(errorup,resup)=>{
                      if(errorup){
                        callback(errorup)
                      }else{	
                        callback(null,resup)
                      }
                    })
                  }else{
                    connection.release()
                    callback(null,results1)
                  }

                   
                 }
               }
             })
           });
         }else{
          if(restoredata.length>0){
            connection.release()	
            restore(restoredata,(errorup,resup)=>{
              if(errorup){
                callback(errorup)
              }else{ 
                callback(null,resup)
              }
            })
          }else{
            connection.release()
            callback(null,results)
          }


	        
          
         }
        }
      });
      }else{
        if(updateData.length>0){
          let upcount=0
          // console.log("update data model=====>",updateData)
          updateData.forEach(element => {
           // let param=isNull(element.param_value)?1:parseInt(element.param_value)+1
           let mt=(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))   
            const query2='update gl_alarm set measured_time=? where id=?'
            connection.query(query2,[mt,element.id],(error1,results1)=>{
              if(error1){
                callback(error1)
              }else{
                upcount++
                if(upcount===updateData.length){
                  if(restoredata.length>0){
                    connection.release()
                    restore(restoredata,(errorup,resup)=>{
                      if(errorup){
                        callback(errorup)
                      }else{ 
                        callback(null,resup)
                      }
                    })
                  }else{
                    connection.release()
                    callback(null,results1)
                  }
                }
              }
            })
          });
        }else{
          if(restoredata.length>0){
            restore(restoredata,(errorup,resup)=>{
              if(errorup){
                callback(errorup)
              }else{ 
                callback(null,resup)
              }
            })
          }
        }
      }
     
    } else {
      callback('DB connection error');
    }
  });
};

const ahuAlarmInfo = (id,callback) =>{
  pool.getConnection((err, connection)=>{
    if(connection){
      const query ='select gl.id,gl.ss_id,gl.alarm_code,gl.message,gl.param_id,param_value,gl.acknowledged,gl.delete_alarm from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla where gla.ss_id=? group by gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.restore=0 and gl.delete_alarm=0';
      connection.query(query,id,(error,results)=>{
        connection.release();
        if(error){
          callback(error);
        } else {
          callback(null,results);
        }
      })
    }else{
      callback('DB connection error');
    }
  });
}




const restore = (updateDAta,callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      let count=0
     // console.log("------------------------->update",updateDAta)
      updateDAta.forEach(element => {
        const query = `update gl_alarm set restore=? where message=? and restore=?`;
        connection.query(query,[1,element.message,0], (error, results) => {
          if (error) {
            callback(error);
          } else {
            count++
            if(count===updateDAta.length){
              connection.release()
              console.log("==========>conunti am realing")
              callback(null,results);
            }
          }
        });
      });
     
    } else {
      callback('DB connection error');
    }
  });
};


const restoreAll=(callback)=>{
  pool.getConnection((err, connection) => {
    if(connection){
      const query = `update gl_alarm set restore=? where restore=?`;
      connection.query(query,[1,0], (error, results) => {
        connection.release()
        if(error){
          callback(error)
        }else{
          callback(null,results)
        }
      })
    }else{
      callback('DB connection error');
    }



  })
}


const alarmLatestValue = (callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = "select * from gl_subsystem_latest_event where param_id like '%Alarm%';"
      connection.query(query,(error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

module.exports = {
  addAhuDeviceData,
  ahuAlarmInfo,
  restoreAll,
  alarmLatestValue
};
