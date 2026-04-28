const { pool } = require('../../Database/pool');
const fns = require('date-fns')


const getAhus = (callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        // const query = "SELECT ss_id as id FROM gl_subsystem_latest_event where param_id='SAF_VFD_On_Off_Fbk' and param_value > 0 and measured_time < SUBTIME(now(),'00:20:00');"
        // const query = "select id from gl_subsystem where ss_type='NONGL_SS_AHU'";
        const query = "select id from gl_subsystem where ss_type IN ('NONGL_SS_AHU','NONGL_SS_VAV');"
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

const latestValues = (id,callback) => {
pool.getConnection((err, connection) => {
    if (connection) {
    const query = "select * from gl_subsystem_latest_event where ss_id=?"
    connection.query(query,[id],(error, results) => {
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

const ahuAlarmInfo = (id,callback) =>{
  pool.getConnection((err, connection)=>{
    if(connection){
      const query ='select gl.id,gl.ss_id,gl.alarm_code,gl.message,gl.param_id,param_value,gl.acknowledged,gl.delete_alarm from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla where gla.ss_id=? group by gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.restore=0 and gl.delete_alarm=0';
      // const query='select gl.id,gl.ss_id,gl.alarm_code,gl.message,gl.param_id,param_value,gl.acknowledged,gl.delete_alarm from gl_alarm gl inner join( select max(created_at) as mea,gla.ss_id as sid,alarm_code,restore from gl_alarm gla group by gla.ss_id,gla.alarm_code)as late on (late.mea=gl.created_at) and (late.sid=gl.ss_id) and (late.alarm_code=gl.alarm_code) where gl.restore=0 and gl.delete_alarm=0;'
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

const addAlarmDatacopy = (insertData,updateData,restoredata, callback) => {
  //  console.log("---------------------------------->insertdata",insertData)
    // console.log("---------------------------------->updatedata",updateData)
  // console.log("---------------------------------->restore",restoredata)
  pool.getConnection((err, connection) => {
    if (connection) {
      if(insertData.length>0){
        const query =
        'insert into gl_alarm (ss_id,alarm_code,message,param_id,measured_time) values ?';
      connection.query(query, [insertData], (error, results) => {
        if (error) {
          connection.release()
          callback(error);
        } else {
         if(updateData.length>0){
           //update to db
          //  console.log("1st ti,e",updateData)
           let upcount=0
           updateData.forEach(element => {
            element.forEach(element=>{
              //  let param=isNull(element.param_value)?1:parseInt(param_value)+1
              let mt=fns.format(new Date(), "yyyy-MM-dd HH:mm:ss") 
             const query2='update gl_alarm set measured_time=? where id=?'
             connection.query(query2,[mt,element.id],(error1,results1)=>{
               if(error1){
                 callback(error1)
               }else{
                 upcount++
                 if(upcount===updateData.length){
                   if(restoredata.length>0){
                     connection.release()
                    console.log("restore here 1",restoredata)
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
          })
           });
         }else{
          if(restoredata.length>0){
            connection.release()	
            console.log("restore here 2",restoredata)
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
            element.forEach(element=>{
              // let param=isNull(element.param_value)?1:parseInt(element.param_value)+1
              let mt=fns.format(new Date(), "yyyy-MM-dd HH:mm:ss")  
              const query2='update gl_alarm set measured_time=? where id=?'
              connection.query(query2,[mt,element.id],(error1,results1)=>{
              if(error1){
                callback(error1)
              }else{
                upcount++
                if(upcount===updateData.length){
                  if(restoredata.length>0){
                    connection.release()
                    console.log("restore here 3",restoredata)
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
          })
          });
        }else{
          connection.release();
          if(restoredata.length>0){
            console.log("restore here 4",restoredata)
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

const addAlarmData = (insertData,updateData,restoredata, callback)=>{
  // console.log("Insert Data Length", insertData);
  if(insertData.length > 0){
    processInsert(insertData,(errin,resin)=>{
      if(errin){
        callback(errin)
      }else{
        if(updateData.length > 0){
          processUpdate(updateData,(errup,resup)=>{
            if(errup){
              callback(errup)
            }else{
              if(restoredata.length > 0){
                restore(restoredata,(errre,resre)=>{
                  if(errre){
                    callback(errre)
                  }else{
                    callback(null,resre)
                  }
                })
              }
            }
          })
        }else{
          if(restoredata.length > 0){
            restore(restoredata,(errre,resre)=>{
              if(errre){
                callback(errre)
              }else{
                callback(null,resre)
              }
            })
          }
        }
      }
    })
  }else{
    if(updateData.length > 0){
      processUpdate(updateData,(errup,resup)=>{
        if(errup){
          callback(errup)
        }else{
          if(restoredata.length > 0){
            restore(restoredata,(errre,resre)=>{
              if(errre){
                callback(errre)
              }else{
                callback(null,resre)
              }
            })
          }
        }
      })
    }else{
      if(restoredata.length > 0){
        restore(restoredata,(errre,resre)=>{
          if(errre){
            callback(errre)
          }else{
            callback(null,resre)
          }
        })
      }
    }
  }
}

// const restore = (updateData, callback) => {
//   pool.getConnection((err, connection) => {
//     if (err || !connection) {
//       return callback('DB connection error');
//     }

//     let count = 0;
//     const queryPromises = updateData.map(element => {
//       return new Promise((resolve, reject) => {
//         const query = `SELECT somo.id, somo.ss_id, somo.measured_time, somo.param_id, somo.message 
//                        FROM gl_alarm somo 
//                        INNER JOIN (SELECT max(measured_time) AS mea, som.ss_id AS sid, som.id AS outputId 
//                                    FROM gl_alarm som 
//                                    INNER JOIN gl_subsystem ssm ON som.ss_id = ssm.id 
//                                    GROUP BY som.ss_id) AS late 
//                        ON (late.mea = somo.measured_time) AND (late.sid = somo.ss_id) 
//                        WHERE somo.restore = ? AND somo.ss_id = ?;`;

//         connection.query(query, [0, element.ss_id], (err, res) => {
//           if (err) {
//             return reject(err);
//           }

//           if (res.length > 0) {
//             const query2 = `UPDATE gl_alarm SET restore = ? WHERE id = ?`;
//             connection.query(query2, [1, res[0].id], (error, results) => {
//               if (error) {
//                 return reject(error);
//               }
//               count++;
//               resolve(results);
//             });
//           } else {
//             resolve("No Alarm to restore.");
//           }
//         });
//       });
//     });

//     Promise.all(queryPromises)
//       .then(results => {
//         connection.release();
//         callback(null, results);
//       })
//       .catch(error => {
//         connection.release();
//         callback(error);
//       });
//   });
// };

///// old restore 
// const restore = (updateDAta,callback) => {
//   pool.getConnection((err, connection) => {
//     if (connection) {
//       let count=0
//      console.log("------------------------->update",updateDAta)
//       updateDAta.forEach(element => {
//         console.log("ELEMENT=====",element)
//         const query = `update gl_alarm set restore=? where message=? and ss_id=?`;
//         connection.query(query,[1,element.message,element.ss_id], (error, results) => {
//           if (error) {
//             callback(error);
//           } else {
//             count++
//             if(count===updateDAta.length){
//               connection.release()
//               // console.log("==========>conunti am realing")
//               callback(null,results);
//             }
//           }
//         });
//       });
     
//     } else {
//       callback('DB connection error');
//     }
//   });
// };
const restore = (updateDAta,callback) => {
  if(updateDAta.length > 0){
    pool.getConnection((err, connection) => {
      if (connection) {
        let count=0, noerror = true;
        let mt=fns.format(new Date(), "yyyy-MM-dd HH:mm:ss")
      //  console.log("------------------------->restore",updateDAta)
        updateDAta.forEach(element => {
          // console.log("ELEMENT=====",element);
          // Looks like we need to add unique constraints to the table, definitely if concurrent updates are planned
          const query = `update gl_alarm set restore=?, measured_time=? where param_id=? and ss_id=?`;
          connection.query(query,[1,mt,element.message,element.ss_id], (error, results) => {
            count++;
            if(error){
              // Accumulate error
              noerror = false;
            }
            if(results){
              // Accumulate results
            }
            if(count===updateDAta.length){
              connection.release();
              if(noerror){
                // All Updated
                callback(null, count);
              }else{
                // Share errors in update
                callback("Restore Failed!!!");
              }
            }
          });
        });
       
      } else {
        callback('DB connection error');
      }
    });
  }else{
    console.log("NOTHING TO RESTORE")
    callback("NOTHING TO RESTORE")
  }
};
const restoreAll=(callback)=>{
  console.log("do im in restore all")
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

const gl_config_table=(callback)=>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query = 'select * from gl_configuration'
      connection.query(query,(err,results)=>{
        connection.release();
        if(err){
          callback(err)
        }else{
          callback(null,results)
        }
      })
    }else{
      callback('DB connection error')
    }
  })
}

function checkRestore(uuid,callback){
  pool.getConnection((err, connection) => {
    if(connection){
      const query = `select restore,TIMESTAMPDIFF(MINUTE,measured_time,modified_at) AS downtime from gl_alarm where ss_id = '${uuid}'`;
      connection.query(query,(error, results) => {
        connection.release()
        if(error){
          callback(err)
        }else{
          // console.log("results",results);
          callback(null,results)
        }
      })
    }else{
      callback('DB connection error');
    }
  })
}

const processInsert = (insertData,callback) => {
  if(insertData.length > 0){
    pool.getConnection((err, connection) => {
      if (connection) {
        const query = "insert into gl_alarm (ss_id,alarm_code,message,param_id,measured_time) values ?";
        connection.query(query,[insertData],(err,res)=>{
          connection.release();
          if(err){
            callback(err)
          }else{
            callback(null,res)
          }
        })
      } else {
        callback('DB connection error');
      }
    });
  }else{
    console.log("NOTHING TO INSERT")
    callback("NOTHING TO INSERT")
  }
};

const processUpdate = (updateDAta,callback) => {
  if(updateDAta.length > 0){
    pool.getConnection((err, connection) => {
      if (connection) {
        let count=0, noerror = true;
      //  console.log("------------------------->update",updateDAta)
        updateDAta.forEach(element => {
          // console.log("ELEMENT=====",element);
          let mt=fns.format(new Date(), "yyyy-MM-dd HH:mm:ss")
          const query = `update gl_alarm set measured_time=? where alarm_code=? and ss_id=? and restore=?`;
          connection.query(query,[mt,element.alarm_code,element.ss_id,0], (error, results) => {
            count++;
            if(error){
              // Accumulate error
              noerror = false;
            }
            if(results){
              // Accumulate results
            }
            if(count===updateDAta.length){
              connection.release();
              if(noerror){
                // All Updated
                callback(null, count);
              }else{
                // Share errors in update
                callback("Update Failed!!!");
              }
            }        	
          });
        });
      } else {
        callback('DB connection error');
      }
    });
  }else{
    console.log("NOTHING TO UPDATE")
    callback("NOTHING TO UPDATE")
  }
};

module.exports = {
    getAhus,
    latestValues,
    ahuAlarmInfo,
    addAlarmData,
    restore,
    restoreAll,
    gl_config_table,
    checkRestore,
    processInsert,
    processUpdate
}