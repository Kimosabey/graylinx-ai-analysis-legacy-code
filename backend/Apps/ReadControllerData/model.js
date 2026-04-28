const { pool } = require('../../Database/pool');
const { compareAsc, format } = require('date-fns');


const getDagDevice = (ss_type,callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            const query = 'select * from gl_subsystem where ss_type=?';
            connection.query(query,ss_type,(err,results)=>{
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

  const getDevice = (id,callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            const query = 'select * from gl_subsystem where ss_parent=?';
            connection.query(query,id,(err,results)=>{
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

  const getInstancesList = (id,callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            const query = 'select * from gl_subsystem where ss_parent=?';
            connection.query(query,id,(err,results)=>{
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

//   const addData = (finArr,ss_tag,callback)=>{
//     if(finArr.length>0){
//         pool.getConnection((err,connection)=>{
//             if(connection){
//                 let codeTypeObj = {
//                     '01': 'em', 
//                   }
//                   let energyCode = ss_tag.slice(4,6);
//                   let tableName = codeTypeObj[energyCode]+'_'+ss_tag+'_om_t';
//                   console.log(tableName,"tablename")
    
//                 const query = `insert into ${tableName}(ss_id,measured_time,param_id,param_value) values ?`;
//                 connection.query(query,[finArr],(err,results)=>{
//                     connection.release();
//                     if(err){
//                         callback(err)
//                     }else{
//                         callback(null,results)
//                     }
//                 })
//             }else{
//                 callback('DB connection error')
//             }
//         })
//     }else{
//         callback(null,"nothing to store")
//     }
//  }

 const instancesInfo = (callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            const query = 'select gl.id,gl.ss_address_value as tag,gls.ss_address_value as ip,glss.name as parameter,glss.ss_tag as type,glss.ss_address_value as instance from gl_subsystem gl,gl_subsystem gls,gl_subsystem glss where gl.ss_parent=gls.id AND glss.ss_parent=gl.id AND gl.ss_type="NONGL_SS_EMS";';
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

  const deviceToSstag = (callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
            const query = 'select * from gl_subsystem where ss_type="NONGL_SS_EMS" OR  ss_type="NONGL_SS_EMS"';
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


  const InsertData = (finArr,callback)=>{
    if(finArr.length>0){
        pool.getConnection((err,connection)=>{
            if(connection){
                let count=0
               finArr.forEach(element => {
                const tableName=element.tablename
                const sql=`insert into ${tableName}(ss_id,measured_time,param_id,param_value) values ?`
                connection.query(sql,[element.data],(err,results)=>{
                    if(err){
                        callback(err)
                    }else{
                        count++
                        if(count==finArr.length){
                            callback(null,results)
                        }
                    }
                })



               }); 
    
               
            }else{
                callback('DB connection error')
            }
        })
    }else{
        callback(null,"nothing to store")
    }
 }


 const updateLatestEventSOMReadData =(energyData,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        let count =0;
        if(energyData.length>0){
          energyData.forEach(element => {
            const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
            connection.query(query,[element.ss_id, element.param_id],(err,results)=>{
            if (err) {
              connection.release();
              callback(err);
            } else {
              if(results.length>0){
                //update
                const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                connection.query(query,[element.param_value,(moment(element.time).format('YYYY-MM-DD HH:mm:ss')),element.ss_id,element.param_id],(err1,results1)=>{
                  if(err){
                    callback(err1)
                  }else{
                    count++
                    if(energyData.length==count){
                      connection.release();
                      callback(null,results1)
                    }
                  }
                })
              }else{
                //insert
                const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                connection.query(query,[ element.ss_id,(moment(element.time).format('YYYY-MM-DD HH:mm:ss')),element.param_id,element.param_value],(err2,results2)=>{
                  if(err){
                    callback(err2)
                  }else{
                    count++
                    if(energyData.length==count){
                      connection.release();
                      callback(null,results2)
                    }
                  }
                })
                
              }
             
            }
            })
          });
        }else{
          console("no data coming")
        }
      } else {
        callback('DB connection error');
      }
    });
  };



  module.exports={
    getDagDevice,
    getDevice,
    getInstancesList,
    // addData,
    instancesInfo,
    deviceToSstag,
    InsertData,
    updateLatestEventSOMReadData
  }