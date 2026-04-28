const { forEach, toUpper, filter } = require('lodash');
const devicemodel=require('../Device/device.model')
const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');
const { ACCEPTED } = require('http-status');
const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
// let res = require('./devices.json');

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
          // console.log("resuly==============",result)
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
  // console.log("recordddddddddddd command datataaaaaaaaaaaaaaaaaaaaaaaaaaa",record)
  // console.log("record length",record.length)
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
              // console.log("array id",id)
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
  // console.log("id arrayyyyyyyyy",id)
}


const updatedevicestatus=(cmd_id,cmdstatus,callback)=>{
  console.log("cmd statusssssssssssssssssssssssssssss",cmdstatus,cmd_id)
  // console.log("in model"+cmd_id+"stsus"+cmdstatus)
  pool.getConnection((error,connection)=>{
    if(connection){
      const query='update device_status set status=? where command_id =?'
        connection.query(query,[cmdstatus,cmd_id],(error,result)=>{
          // connection.release();
          if(error){
            callback(error)
          }else{
            if(cmdstatus=='success'){
               connection.query(`select * from device_status where command_id=?`,cmd_id,(err,response)=>{
                  // console.log("cmd_id++++++++++++++++++++++++++++++++++",cmd_id)
                  // console.log("cmd_ststus==============================",cmdstatus)
                  // console.log("if loop queryyyyyyyyyyyyyyyyyy",response)
                  connection.release();
                  if(err){
                    callback(err)
                  } else {
                    if(response.length!=0){
                      console.log("inside cmd status succes========================================================>")
                      updateevent(response, (err, results1) => {
                        // console.log("update event called--------------------------")
                        if (err) {
                          console.log("errr", err)
                        } else {
                          // console.log("=====================================accepted")
                          // callback(null,'result1')
                          updateLatestCommand(response, (err, result) => {
                            if (err) {
                              console.log("err", err)
                              return ACCEPTED
                            } else {
                              //return ACCEPTED
                              callback(null, result)
                              //return ACCEPTED
                            }
                          })
                        }
                      })
                    } else{
                      console.log("empty response")
                    }
                    // setTimeout(() => {
                    //   // console.log("update device status called11111111111111111111111111111111111111")
                    //   callback(null,result)
                    //   // console.log("update device status called@2222222222222222222222222222222222222222222")
                    // }, 200);
                  }
               })
            } else {
              connection.release();
              console.log("failure no LE update cmdstatus failure=====================")
              callback(null,"failure")
            }          
          }

        })
    }else{
      // console.log("errror",error)
      callback(error)
    }
  })
}

const updateevent = (response,callback) =>{
      let eventData=[]
      let k=0
      response.forEach((each) =>{   
        const id = each.device_mac.slice(-6)
        let event=JSON.parse(each.payload)
        if(each.device_mac.slice(0,4)=="50dc"){
          let slavesarr=event.slaves.map(element=>{
            let hex=element.toString(16)
            if (hex.length < 2) {
              hex = "0" + hex;
            }
            return hex;
          })
          pool.getConnection((error,connection)=>{
            if(connection){
              const devicequery=`select * from device where type=? and mac LIKE ?`
              connection.query(devicequery,['dali_slave','%'+id+'%'],(err,result2)=>{
                // console.log("device query response",result2.length)
                if(err){
                  callback(err)
                } else {
                  let i=0;
                  result2.forEach((element)=>{
                    // console.log("element",element)
                    slavesarr.forEach(slaveelement=>{
                      if(element.mac.slice(-2)===slaveelement){
                        let data={}
                        data=element
                        data["mode"]=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                        data["intensity"]=parseInt(each.intensity)
                        eventData.push(data)
                        // console.log("before iiiiiiiiiiiiiiiiiiii",i)
                        i++ 
                        // console.log("afterr iiiiiiiiiiiiiiiiiiiii",i)
                        if(i===slavesarr.length){
                            connection.release();
                            // console.log("daliiiiiiiiiiiiiiiiiiii event data1",eventData)
                            // console.log("iiiiiiiiiiiiiiiiiiiiii",i)
                            // console.log("resultd.lengthhhhhhhh",result2.length)
                            devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                                if(error3){
                                  callback(error3)
                                }else{
                                  callback(null,{message:"LE udated dali"})
                              }
                          
                            })
                        }
                      }
                      // else{
                      //   i++
                      //   if(i===result2.length){
                      //     connection.release();
                      //     console.log("daliiiiiiiiiiiiiiiiiiii event data2",eventData)
                      //     console.log("iiiiiiiiiiiiiiiiiiiiii",i)
                      //     console.log("resultd.lengthhhhhhhh",result2.length)
                      //     devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                      //         if(error3){
                      //           callback(error3)
                      //         }else{
                      //             callback(null,{message:"LE udated dali"})
                      //         }
                      //     })
                      // }
                      // }
                    })
                  })
                }
              })
            }else{
              callback('DB CONNECTION ERROR')
            }
          })
         
        }if(each.device_mac.slice(0,4)=="50ac"){
          let sel_channel
          pool.getConnection((error,connection)=>{
            if(connection){
              const devicequery=`select * from device where type=? and mac=?`
              connection.query(devicequery,['analog_controller',each.device_mac],(err,result2)=>{
                connection.release();
                // console.log("reponse from wac===========>",result2)
                if(err){ 
                  callback(err)
                } else {
                  let i=0
                  let arr=[]
                  let payload = JSON.parse(response[0].payload).channel
                  result2.filter((ele,index)=>{
                    let data = JSON.parse(ele.device_info)
                    let channels = Object.keys(data)
                    let value
                    if(channels.length>1){
                      value=0
                    } else{
                      value=channels[0].slice(-1)
                    }
                    if(payload==value){
                      arr.push(ele)
                    } else {
                      console.log("not selected")
                    }
                  })
                  arr.forEach((element)=>{
                  // result2.forEach((element)=>{
                    // console.log("element===============================>",element)
                    let chan = JSON.parse(element.device_info)
                    let val = Object.keys(chan)
                    if(val.length>1){
                      sel_channel=0
                    } else{
                      sel_channel= parseInt(val[0].slice(-1))
                    }
                    // console.log("sel_channelllllllllllllllllllllll",sel_channel)
                    let data={}
                    data=element
                    if(sel_channel==0){
                      // console.log("both channelssssssssssssssssssss")
                      data.channel1mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                      data.channel1level=parseInt(each.intensity)
                      data.channel2mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                      data.channel2level=parseInt(each.intensity)
                      data.channel3mode=null
                      data.channel3level=null
                      data.channel4mode=null
                      data.channel4level=null
                      eventData.push(data)
                    } else if(sel_channel==1){
                      // console.log("channel 11111111111111111111111111111111")
                      data.channel1mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                      data.channel1level=parseInt(each.intensity)
                      data.channel2mode=null
                      data.channel2level=null
                      data.channel3mode=null
                      data.channel3level=null
                      data.channel4mode=null
                      data.channel4level=null
                      eventData.push(data)
                    } else if(sel_channel==2){
                      // console.log("channel 2222222222222222222222222222")
                      data.channel2mode=each.mode.charAt(0).toUpperCase()+each.mode.slice(1)
                      data.channel2level=parseInt(each.intensity)
                      data.channel1mode=null
                      data.channel1level=null
                      data.channel3mode=null
                      data.channel3level=null
                      data.channel4mode=null
                      data.channel4level=null
                      eventData.push(data)
                    }
                    i++ 
                        if(i===arr.length){
                          
                          // callback(null,'result')
                            devicemodel.updateLatestEventOnControl(eventData,(error3,result3)=>{
                                if(error3){
                                  callback(error3)
                                }else{
                                    callback(null,{message:"LE updated wac"})                              
                                }
                          
                            })
                        }
                  })
                }
              })
            }else{
              callback('DB CONNECTION ERROR')
            }
         
        })
      }
    })
}

const eventStatus=(batchId,batchLength,callback)=>{
  console.log("eventstatysssssssssssssssssssssssssss calledddddddddddd=================================")
  pool.getConnection((error,connection)=>{
    if(connection){
      const query='select count(*) as commandCount from device_status where status=? and batch_id=?'
      connection.query(query,['success',batchId],(error,result)=>{
        connection.release();
        if(error){
          callback(error)
        }else{
          if(result[0].commandCount==batchLength){
            callback(null,{message:"success"})
          }else{
            callback(null,{message:"failure"})
          }
        }
      })

    }else{
      logger.error(`${new Date()} event statusss DB connection issueeeeee"${error}`)
      callback(error)
    }
  })
  
}

const checkstatus = (callback) => {
  pool.getConnection((error,connection)=>{
    if(connection){
      const query = `select * from device_status where status="pending" or status="failed" or status="failure"`;
      connection.query(query,(error,resp)=>{
        console.log("respppppppppppppppppp check status===================>",JSON.stringify(resp))
        connection.release();
        if(error){
          callback(error)
        } else {
          if(resp.length!=0){
          let gatewayIp=resp[0].gatewayip
          console.log("gateway ipppppppppppppppppp",gatewayIp)
            const token = "eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Nzg0ODc1ODAsImlhdCI6MTU3ODQ4MDM4MCwiaXNzIjoiYXV0aDAifQ.DPu2lLWNlccPS1S42jl04HRNrQHoA5cUghbMrIcg9DQ"
            let payload = {"query":[{"deviceId":"*","parameters":["*"]}]}
            axios
            .post(`https://${gatewayIp}/api/device`,payload, { headers: { Authorization: 'Bearer '.concat(token) } })
            .then((res)=>{
              let abc = res.data.result.filter(ele => (ele.deviceType==="DALI_MASTER" || ele.deviceType==="DALI_SLAVE" || ele.deviceType==="ANALOG_CONTROLLER"))
              updatefaileddevice(resp,abc,(err,result)=>{
                console.log("---------------------------------------->",result)
                if(err){
                  console.log("errrrrrrrrrrrr",err)
                } else {
                  console.log("result111111111111111111111111111111111111",result)
                  callback(null,{message:result})
                }
              })  
            }) 
            .catch((err)=>{
              if(err){
                console.log("err",err)
                callback(null,{message:"failure"})
              }
            })
          } else { callback(null,{message:'success'})}   
        }
      })
    } else {
      callback("DB Connection Error")
    }
  })
}

const updatefaileddevice=(resp,abc,callback)=>{
  console.log("update fail device=============================================",resp.length)
  let i=0
    resp.forEach((_item)=>{
      if(_item.device_mac.slice(0,4)=="50dc"){
        console.log("dali=====================================",i)
        let d_status = abc.filter(each =>each.deviceType=="DALI_MASTER").filter(each =>each.deviceAddress==_item.device_mac).map(({status})=>status.cmdStatus)
        console.log("d_status",d_status)
        let status = d_status[0].charAt(0).toLowerCase()+d_status[0].slice(1)
        updatedevicestatus(_item.command_id,status,(err,res)=>{
          console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiii dali",i,resp.length)
          if(err){
            callback(err)
          } else {
            i++
            if(i==resp.length){
              checksuccess((err,result)=>{
                if(err){
                  console.log(err)
                } else{
                  callback(null,result)
                }
              })
            }
          }
        })
      }else if(_item.device_mac.slice(0,4)==="50ac"){
        console.log("wac===================================",i)
        let d_status = abc.filter(each =>each.deviceType=="ANALOG_CONTROLLER").filter(each =>each.deviceAddress==_item.device_mac).map(({status})=>status.cmdStatus)
        let status = d_status[0].charAt(0).toLowerCase()+d_status[0].slice(1)
          updatedevicestatus(_item.command_id,status,(err,res)=>{
            console.log("iiiiiiiiiiiiiiiiiiiiiiiiiiiii wac",i,resp.length)
            if(err){
              callback(err)
            } else {
              i++
              if(i==resp.length){
                checksuccess((err,result)=>{
                  if(err){
                    console.log(err)
                  } else {
                    callback(null,result)
                  }
                })
              }
            }
          })
      }
    })    
}

const checksuccess = callback =>{
  pool.getConnection((err,connection)=>{
    if(connection){
      const query =`select * from device_status where status='failure' or status='pending' or status='null'`;
      connection.query(query,(err,response)=>{
        connection.release()
        if(response.length==0){
          logger.info("i am asuccess")
          callback(null,"success")
        } else{
          callback(null,"failure")
        }
      })
    } else{
      console.log("DB Connection Error")
    }
  })
}

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
            connection.release();
            if(error){
              connection.release();
              callback(error)
            } else {
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

const updateLatestCommand = (response,callback) =>{
  // console.log("devicestatussuccess----------------------------------------------->>>>>>>>",response)
  let data=[];
  let uniqueArr = [];
  response.filter((ele)=>{
    if(ele.device_mac.slice(0,4)=="50dc"){
      data.push(ele)
    } 
  })
  // console.log("dataaaaaaaaaaaaaa",data)
  pool.getConnection((err,connection)=>{
    if(connection){
      if(data.length!=0){
        const query = `select * from latest_command where mac_id=?`;
        connection.query(query,data[0].device_mac,(err,result)=>{
          // console.log("queryyyyyyyyyyyyyyyyyyyyyyyyy",query,data[0].device_mac)
          // console.log("datttttttttttttttttttttttttttta",result)
          if(result.length!=0){
            // console.log("if loop resulyytttttttttttt",result)
            let slaves= JSON.parse(result[0].data).slaves
            let db_slaves= JSON.parse(slaves)
            let c_slaves=JSON.parse(data[0].payload).slaves
            console.log(db_slaves)
            console.log(c_slaves)
            if(result[0].mode==data[0].mode){
              if(result[0].intensity==data[0].intensity){
                // console.log("same intensity",data[0].intensity)
                  let arr = db_slaves.concat(c_slaves);
                  // console.log("arr",arr)
                    // loop through array
                    for(let i of arr) {
                        if(uniqueArr.indexOf(i) === -1) {
                            uniqueArr.push(i);
                        }
                    }
                    console.log(uniqueArr);
              }else{
                // console.log("different intensity",data[0].intensity,db_slaves)
                var res = db_slaves.filter( function(n) { return !this.has(n) }, new Set(c_slaves) );
                console.log("res",res)
                uniqueArr.push(...res)
                // console.log("different intensity",uniqueArr)
              }
            }else{
              // console.log("different modeeeeee",data[0].mode)
              let resp = db_slaves.filter(val => !c_slaves.includes(val));
              console.log(resp)
              uniqueArr.push(...resp)
              // console.log("different mode",uniqueArr)
            }
            // console.log("reult from db",result)
            // console.log("control command",data)
            console.log("unique arrayyyyyyyyyyyyyyyyyyyyyyyyyyyy",JSON.stringify(uniqueArr))
            const query = `update latest_command set data = JSON_SET(data,"$.slaves",?),created_at=? where mac_id=?`;
            connection.query(query,[JSON.stringify(uniqueArr),data[0].updated_at,data[0].device_mac],(err,res)=>{
              connection.release();
              if(err){
                callback(err)
              } else {
                // return ACCEPTED
                callback(null,res)
              }
            })
          } else if(response[0].intensity==0) {
            let res = data[0].payload
            let slave = JSON.parse(res).slaves
            let payload = {"slaves":JSON.stringify(slave)}
            connection.query(
              'Insert into latest_command SET ?',
              {
                id:uuid(),
                mode:data[0].mode,
                intensity:data[0].intensity,
                mac_id:data[0].device_mac,
                data:JSON.stringify(payload),
                gatewayip:data[0].gatewayip,
                created_at:data[0].updated_at,
              },
              (err,result)=>{
                connection.release();
                if(err){
                  console.log("update latest command",err)
                  callback(err)
                } else {
                  // return ACCEPTED
                  callback(null,result)
                }
              }
            );
          } else{
            connection.release();
            console.log("intensity 100")
            callback(null,'no data')
          }
        })
      }else{
        connection.release();
        callback(null,'no data')
      }
    } else{
      callback("DB Connection Error")
    }
  })
}

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
  checkstatus,
  updatefaileddevice,
  updateLatestCommand
  // updateevice
};



// if(d_status && d_status=="Success"){
        //   updatedevicestatus(resp[i].command_id,"success",(err,res)=>{
        //     i++
        //     if(err){
        //       callback(err)
        //     } else {
        //       if(i==resp.length){
        //         console.log("resp from device statys wac",res)
        //         callback(null,"success")
        //       }
        //     }
        //   })
        // }else {
        //   callback(null,"failure")
        // }
        // unwanted!!!
        // let event=JSON.parse(resp[i].payload)
        // let slavesarr=event.slaves.map(element=>{
        //   let hex=element.toString(16)
        //   if (hex.length < 2) {
        //     hex = "0" + hex;
        //   }
        //   return hex;
        // })
        // // console.log("slavesarr",slavesarr)
        // let count=0
        // let status =[]
        // slavesarr.forEach(ele=>{
        //   console.log("abc.filter(each => each.deviceType==='DALI_SLAVE').filter(each =>each.deviceAddress.slice(14)===ele)",abc.filter(each => each.deviceType==='DALI_SLAVE').filter(each =>each.deviceAddress.slice(14)===ele))
        //   let d_status=abc.filter(each => each.deviceType==='DALI_SLAVE').filter(each =>each.deviceAddress.slice(14)===ele).map(({status})=>status.cmdStatus)
        //   status.push(d_status)
        //   count++
        //   if(count==slavesarr.length){
        //     console.log("satatus",status)
        //     console.log("D_status",d_status)
        //     let succarr = d_status.every(i=>i===d_status[0])
        //     // console.log("succarr",succarr)
        //     console.log("cmd_iddddddddddd",resp[i].command_id)
        //     if(succarr && d_status[0]=='Success'){
        //       updatedevicestatus(resp[i].command_id,"success",(err,res)=>{
        //         console.log("iiiiiiiiiiiiiiiiiiiiiii dali",i)
        //         i++;
        //         if(err){
        //           callback(err)
        //         } else {
        //           if(i==resp.length){
        //             console.log("resp from devicestatus dali",res)
        //             callback(null,"success")
        //           }
        //         }
        //       })
        //     } else {
        //       callback(null,"failure")
        //     }
        //   } else {
        //     console.log("count mismatchhhhhh")
        //   }
        // })




