const { forEach, toUpper } = require('lodash');
const devicemodel=require('../Device/device.model')
const { pool } = require('../../Database/pool');
const uuid = require('uuid/v4');

const gatewayDetails = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `select g.ip,m.zone_id from gateway g , gateway_mapping m  where g.id=m.gateway_id group by m.zone_id`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          console.log("errorrrrrrrrrrrrrr",error)
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const daliSlaves = (zoneId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        "SELECT mac FROM device WHERE zone_id = ? and type='DALI_SLAVE'",
        [zoneId],
        (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            callback(null, results);
          }
        }
      );
    } else {
      callback(error);
    }
  });
};

const getAnalogControllers = (zoneId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        "SELECT mac FROM device WHERE zone_id = ? and type='analog_controller'",
        [zoneId],
        (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            callback(null, results);
          }
        }
      );
    } else {
      callback(error);
    }
  });
};

const updatedevice=(mac,callback)=>{
  let i=0
 mac.forEach(id=>{
   pool.getConnection((error,connection)=>{
     if(connection){
        connection.query('insert into device_status SET ?',
        {
          id:uuid(),
          device_mac:id,
          commmad_id:30000,
          payload:"pay",
          status:"pending"
        },(error,resultm)=>{
          connection.release()
          if(error){
            callback(error)
          }else{
            i++
            console.log("modelresult",resultm)
          }
        })

     }else{
       callback(error)
     }
   })
 })
}

const getmaxcommand_id=(callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
        const query='select max(command_id) as max_cmd_id from device_status'
        connection.query(query,(error,result)=>{
          console.log("resuly==============",result)
            connection.release();
            if(result.length>0){
                    result.forEach(each=>{
                      // console.log("each.max_cmd_id-----------------",each.max_cmd_id)
                         if(each.max_cmd_id !== null){
                              callback(null,parseInt(each.max_cmd_id))
                          }else{
                              callback(null,29999) 
            }
          })
        }
      })
    }
  })
}

// const commandData=(record,callback)=>{
//   console.log("recordddddddddddd",record)
//   console.log("record length",record.length)
//   let i=0
// record.forEach((each,index)=>{
//   pool.getConnection((error,connection)=>{
//     console.log("i am index",index)
//     if(connection){
//               console.log("each---------------loop",each)
//                   connection.query('insert into device_status SET ?',
//                   {
//                     id:each.id,
//                     device_mac:each.mac,
//                     command_id:each.cmd,
//                     counter:each.counter,
//                     gatewayip:each.gatewayip,
//                     mode:each.mode,
//                     intensity:each.intensity,
//                     payload:each.payload,
//                     status:each.status?each.status:"pending",
//                     batch_id:each.batch_id
//                   },(error,cmdData)=>{
//                     if(error){
//                       console.log("error_in model",error)
//                       callback(error)
//                     }else
//                       {
//                       i++
//                       console.log("----------",i)
//                       if(i==record.length){
//                         console.log("======indside i ",i)
//                         connection.release();
//                         callback(null,cmdData)
//                       }
                   
//                     }
//                   }
//                   )
//             }else{
//               console.log("i an connrection error",error.message)
//               callback(error)
//             }
//     })


//   })
   
// }

const commandData=(record,callback)=>{
  console.log("recordddddddddddd command datataaaaaaaaaaaaaaaaaaaaaaaaaaa",record)
  console.log("record length",record.length)
  let i=0
  let id=[];
  record.forEach((each,index)=>{
    let data =[];
    data.push(each.id)
    data.push(each.mac)
    data.push(each.cmd)
    data.push(each.counter)
    data.push(each.gatewayip)
    data.push(each.mode)
    data.push(each.intensity)
    data.push(each.payload)
    data.push(each.status?each.status:"pending")
    data.push(each.batch_id)
    id.push(data)
    if(id.length==record.length){
      pool.getConnection((error,connection)=>{
        if(connection){
              console.log("array id",id)
              const query = 'insert into device_status (id, device_mac, command_id, counter, gatewayip, mode, intensity, payload, status, batch_id) VALUES ?';
              connection.query(query,[id],(error1,result)=>{
                // console.log("queryyyyyyyyyyyyyyyy",query)
                // console.log("command data resulttttttttttt",result)
                connection.release();
                if(error1){
                  // console.log("error in model",error1)
                  callback(error1)
                } else {
                  callback(null,result)
                }
              })
        }else{
          // console.log("i an connrection error",error.message)
          callback(error)
        }
      })
    } else {
      console.log("record mismatchhhhhhhhhhhh")
    }
  })
  console.log("id arrayyyyyyyyy",id)
}


const updatedevicestatus=(cmd_id,cmdstatus,callback)=>{
  console.log("in model"+cmd_id+"stsus"+cmdstatus)
  pool.getConnection((error,connection)=>{
    if(connection){
      const query='update device_status set status=? where command_id =?'
        connection.query(query,[cmdstatus,cmd_id],(error,result)=>{
          connection.release();
          if(error){
            callback(error)
          }else{
            console.log(result)
            callback(null,result)          
          }

        })
    }else{
      callback(error)
    }
  })
}

const eventStatus=(batchId,batchLength,callback)=>{
  console.log("eventstatysssssssssssssssssssssssssss calledddddddddddd")
  pool.getConnection((error,connection)=>{
    if(connection){
      const query='select count(*) as commandCount from device_status where status=? and batch_id=?'
      connection.query(query,['success',batchId],(error,result)=>{
        if(error){
          callback(error)
        }else{
          if(result[0].commandCount==batchLength){
            const batchquery='select * from device_status where batch_id=?'
            connection.query(batchquery,[batchId],(error1,result1)=>{
              if(error1){
                callback(error1)
              }else{
                let eventData=[]
                let index=0
                console.log("result1 event ststussssssssssss",result1)
                result1.forEach((each)=>{
                  // if(each.device_mac.slice(0,4)==="50dc" || each.device_mac.slice(0,4)==="50ac"){
                       const id=each.device_mac.slice(-4)
                       let event=JSON.parse(each.payload)
                       if(each.device_mac.slice(0,4)==="50dc"){
                       let slavesarr=event.slaves.map(element=>{
                              let hex=element.toString(16)
                              // console.log("hexxxxxxxxx",hex)
                              if (hex.length < 2) {
                                hex = "0" + hex;
                           }
                          //  console.log("hex finallllllll",hex)
                           return hex;
                       })
                       const devicequery=`select * from device where type=? and mac LIKE ?`
                       connection.query(devicequery,['dali_slave','%'+id+'%'],(error2,result2)=>{
                         if(error2){
                           callback(error2)
                         }else{
                           let i=0;
                            result2.forEach((element)=>{
                              slavesarr.forEach(slaveelement=>{
                                if(element.mac.slice(-2)===slaveelement){
                                  let data={}
                                  data=element
                                  data["mode"]=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                                  data["intensity"]=parseInt(each.intensity)
                                  eventData.push(data)
                                  i++ 
                                  if(i===result2.length){
                                    index++
                                    if(index===result1.length){
                                      connection.release();
                                      devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                                          if(error3){
                                            callback(error3)
                                          }else{
                                            callback(null,{message:"success"})
                                          }
                                    
                                      })
                                    }
                                  }
                                }else{
                                  i++
                                  if(i===result2.length){
                                    index++
                                  if(index===result1.length){
                                    connection.release();
                                    devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                                        if(error3){
                                          callback(error3)
                                        }else{
                                          callback(null,{message:"success"})
                                        }
                                    })
                                  }
                                }
                                }
                              })
                            })
 
                         }
                       })
                      }else if(each.device_mac.slice(0,4)==="50ac"){
                        // console.log("inside 50ac loooooooooooop")
                        // console.log("inside 50ac loooooooooooop id",id)
                        let channels = JSON.parse(each.payload)
                        let sel_channel = channels.channel
                        // console.log("selected channel",sel_channel)
                        const devicequery=`select * from device where type=? and mac LIKE ?`
                        connection.query(devicequery,['analog_controller','%'+id+'%'],(error2,result2)=>{
                          if(error2){
                            callback(error2)
                          }else{
                            // console.log("result222222222222",result2)
                            let channel_data={}
                            let i=0
                            result2.forEach((element)=>{
                              devicemodel.getLatestEvent(element.id,(err,resp)=>{
                                if(err){
                                  callback(err)
                                } else {
                                  if(resp.length!=0){
                                  // console.log("latest event data",resp)
                                  channel_data=JSON.parse(resp[0].data)
                                  // console.log("channeldata",channel_data)
                                  } else {
                                    console.log("empty latest event")
                                  }
                                }
                              })
                              // console.log("elementtttttttt",element)
                              let data={}
                              data=element
                              if(sel_channel==0){
                                data.channel1mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                                data.channel1level=parseInt(each.intensity)
                                data.channel2mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                                data.channel2level=parseInt(each.intensity)
                                data.channel3mode=channel_data.channel3mode?channel_data.channel3mode:null
                                data.channel3level=channel_data.channel3level?channel_data.channel3level:null
                                data.channel4mode=channel_data.channel4mode?channel_data.channel4mode:null
                                data.channel4level=channel_data.channel4level?channel_data.channel4level:null
                                eventData.push(data) 
                              } else if (sel_channel==1){
                                data.channel1mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                                data.channel1level=parseInt(each.intensity)
                                data.channel2mode=channel_data.channel2mode?channel_data.channel2mode:null
                                data.channel2level=channel_data.channel2level?channel_data.channel2level:null
                                data.channel3mode=channel_data.channel3mode?channel_data.channel3mode:null
                                data.channel3level=channel_data.channel3level?channel_data.channel3level:null
                                data.channel4mode=channel_data.channel4mode?channel_data.channel4mode:null
                                data.channel4level=channel_data.channel4level?channel_data.channel4level:null
                                eventData.push(data) 
                              } else {
                                data.channel2mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                                data.channel2level=parseInt(each.intensity)
                                data.channel1mode=channel_data.channel1mode?channel_data.channel1mode:null
                                data.channel1level=channel_data.channel1level?channel_data.channel1level:null
                                data.channel3mode=channel_data.channel3mode?channel_data.channel3mode:null
                                data.channel3level=channel_data.channe31evel?channel_data.channe31evel:null
                                data.channel4mode=channel_data.channel4mode?channel_data.channel4mode:null
                                data.channel4level=channel_data.channel4level?channel_data.channel4level:null
                                eventData.push(data) 
                              }
                              // console.log("eventdataaaaaaaaaa",eventData)
                              i++ 
                              if(i===result2.length){
                                index++
                                if(index===result1.length){
                                  connection.release();
                                  devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                                      if(error3){
                                        callback(error3)
                                      }else{
                                        callback(null,{message:"success"})
                                      }
                                
                                  })
                                }
                              }
                            })
                          }
                        })
                      }

                })
                
              }
            })
          }else{
            connection.release();
            callback(null,{message:"failed"})
          }
        }
      })

    }else{
      callback(error)
    }
  })
  
}

// const eventStatus=(batchId,batchLength,callback)=>{
//   pool.getConnection((error,connection)=>{
//     if(connection){
//       const query='select count(*) as commandCount from device_status where status=? and batch_id=?'
//       connection.query(query,['success',batchId],(error,result)=>{
//         if(error){
//           callback(error)
//         }else{
//           if(result[0].commandCount==batchLength){
//             const batchquery='select * from device_status where batch_id=?'
//             connection.query(batchquery,[batchId],(error1,result1)=>{
//               if(error1){
//                 callback(error1)
//               }else{
//                 let eventData=[]
//                 let index=0
//                 result1.forEach((each)=>{
//                   if(each.device_mac.slice(0,4)==="50dc"){
//                        const id=each.device_mac.slice(-4)
//                        let event=JSON.parse(each.payload)
//                        let slavesarr=event.slaves.map(element=>{
//                               let hex=element.toString(16)
//                               if (hex.length < 2) {
//                                 hex = "0" + hex;
//                            }
//                            return hex;
//                        })
//                        const devicequery=`select * from device where type=? and mac LIKE ?`
//                        connection.query(devicequery,['dali_slave','%'+id+'%'],(error2,result2)=>{
//                          if(error2){
//                            callback(error2)
//                          }else{
//                             result2.forEach((element,i)=>{
//                               slavesarr.forEach(slaveelement=>{
//                                 if(element.mac.slice(-2)===slaveelement){
//                                   let data={}
//                                   data=element
//                                   data["mode"]=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
//                                   data["intensity"]=parseInt(each.intensity)
//                                   eventData.push(data)
//                                   i++ 
//                                   if(i===result2.length){
//                                     index++
//                                     if(index===result1.length){
//                                       connection.release();
//                                       devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
//                                           if(error3){
//                                             callback(error3)
//                                           }else{
//                                             callback(null,{message:"success"})
//                                           }
                                    
//                                       })
//                                     }
//                                   }
//                                 }else{
//                                   i++
//                                   if(i===result2.length){
//                                     index++
//                                   if(index===result1.length){
//                                     connection.release();
//                                     devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
//                                         if(error3){
//                                           callback(error3)
//                                         }else{
//                                           callback(null,{message:"success"})
//                                         }
//                                     })
//                                   }
//                                 }
//                                 }
//                               })
//                             })

//                          }
//                        })
//                   }else{
//                       index++
//                       if(index===result1.length){
//                         console.log("analog")
//                         console.log("eventdata",eventData)
//                         if(eventData.length>0){
//                           connection.release();
//                           devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
//                             if(error3){
//                               callback(error3)
//                             }else{
//                               callback(null,{message:"success"})
//                             }
//                         })
//                         }else{
//                           connection.release();
//                           callback(null,{message:"success"})
//                         }
//                       }

//                   }

//                 })
                
//               }
//             })
//             // callback(null,{message:"success"})
//           }else{
//             connection.release();
//             callback(null,{message:"failed"})
//           }
//         }
//       })

//     }else{
//       callback(error)
//     }
//   })
  
// }

const getcommand = (mac,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const query = 'select * from device where mac=?';
      connection.query(query,mac,(error,result1)=>{
        console.log("device query======",result1)
        if(error){
          callback(error)
        } else {
          const query = 'select * from latest_event where device_id=?';
          connection.query(query,result1[0].id,(error,res)=>{
            if(error){
              connection.release();
              callback(error)
            } else {
              connection.release();
              callback(null,res)
            }
          })
        }
      })
    } else{
      callback(error)
    }
  })
}

const updatecommandid=callback=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const query='truncate device_status'
      connection.query(query,(error,result)=>{
        connection.release()
        if(error){
          callback(error)
        }else{
          callback(null,result)
        }
      })
    }
  })
}



// const updateevice=(data,mode,intensity,callback)=>{
//   let index=0
//   data.forEach(ele=>{
//     pool.getConnection((error,connection)=>{
//       if(connection){
//         const query='select * from device where mac=?'
//         connection.query(query,[ele],(error,result)=>{
//           if(error){
//             console.log("erroorr",error)
//             callback(error)
//           }else{
//             const sql=`update latest_event set data = JSON_SET(data,
//               "$.mode",?,
//               "$.lastCmdFrom",?,
//               "$.light_level",?
//               ) where device_id=?`
//             connection.query(sql,[mode,"server",intensity,result[0].id],(error1,result1)=>{
//                 if(error1){
//                   callback(error1)
//                 }else{
//                   index++
//                   if(index===data.length){
//                     console.log("index======",index)
//                     console.log("dstalenght",data.length)
//                     connection.release();
//                     callback(null,"done")
//                   }
//                 }
//             })


//           }

//         })    
//           //   [each.mode,"server",each.intensity,each.id]
//       }else{
//         console.log("erroror in DB",error)
//         callback("DB connection error")
//       }
//     })

//   })
  
// }



module.exports = {
  gatewayDetails,
  daliSlaves,
  getAnalogControllers,
  updatedevice,
  getmaxcommand_id,
  commandData,
  updatedevicestatus,
  eventStatus,
  updatecommandid,
  getcommand,
  // updateevice
};





