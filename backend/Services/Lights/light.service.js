const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');

const model = require('./light.model');

const zoneLights = (event, user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const zoneId = event.zones[0];
      const master = event.master;
      model.daliSlaves(zoneId, (err, response) => {
        if (err) {
          callback(err);
        } else {
          const gatewayIp = result.filter(
            each => each.zone_id === event.zones[0]
          )[0].ip;
          const slaves = response
            .filter(each => each.mac.slice(-6, -2) === master.slice(-4))
            .map(each => parseInt(each.mac.slice(-2), 16));
          axios
            .post(`https://${gatewayIp}/api/daliGroupControl`, {
              daliMaster: master,
              selection: 'slaves',
              action: event.action,
              slaves: slaves,
              intensity: event.intensity
            })
            .then(() => {
              logger.info("ACTION: Zone Level Light Control  ZONE ID: "+zoneId+
                " DALI MASTER: "+master+" LIGHT CONTROL: "+event.action+
                " RESULT: Success"+
                " USER: "+user.name+" USER ID: "+user.id)
              callback(null, { message: 'success' })
            })
            .catch(err1 => {
              logger.info("ACTION: Zone Level Light Control  ZONE ID: "+zoneId+
                " DALI MASTER: "+master+" LIGHT CONTROL: "+event.action+
                " RESULT: Failed"+
                " USER: "+user.name+" USER ID: "+user.id)   
              callback(err1)});
        }
      });
    }
  });
};

const indiviualLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;
      axios
        .post(`https://${gatewayIp}/api/daliGroupControl`, {
          daliMaster: event.master,
          selection: 'slaves',
          action: event.action,
          slaves: event.slaves,
          intensity: event.intensity
        })
        .then(() => {
          logger.info("ACTION: Invidual Light Control  LIGHTS: "+event.slaves+
            " DALI MASTER: "+event.master+" LIGHT CONTROL: "+event.action+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(null, { message: 'success' })
        })
        .catch(err => { 
          logger.info("ACTION: Invidual Light Control  LIGHTS: "+event.slaves+
            " DALI MASTER: "+event.master+" LIGHT CONTROL: "+event.action+
            " RESULT: Failed"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)});
    }
  });
};

const anclLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;

      var mode_payload = {
        device: {
          macId: event.master
        },
        command: {
          type: event.type,
          channel: event.channel
        }
      }

      console.log("mode payload: \n", mode_payload)
      console.log("action payload: \n",{
        device: {
          macId: event.master
        },
        command: { 	
          channelSelection : event.channel, 
          control : event.control,
          intensity : event.intensity
        }
      })

      axios
        .post(`https://${gatewayIp}/api/analogCtrldeviceTypeSelection`, mode_payload)
        .then(() => {
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          if(event.type == 0){
            callback(null, { message: 'success' })
          } else {
            // var action_payload = {
            //   device: {
            //     macId: event.master
            //   },
            //   command: { 	
            //     channelSelection : event.channel, 
            //     control : event.control,
            //     intensity : event.intensity
            //   }
            // }

            axios
              .post(`https://${gatewayIp}/api/analogCtrlChannelControl`, mode_payload)
              .then(() => {
                logger.info("ACTION: Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLER: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Success"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(null, { message: 'success' })
              })
              .catch(err => { 
                logger.info("ACTION: Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLER: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Success"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(err)
              });
          }

        })
        .catch(err => { 
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)
        });
    }
  });
};

const zoneAnctlLights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zones[0]
      )[0].ip;
      
      axios
        .post(`https://${gatewayIp}/api/wacChannelSelection`, {
          type: event.type,
          master: event.master
        })
        .then((resp) => {
          if(resp.data.failed || resp.data.returnCode == -2){
            logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
            " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
              " RESULT: Failed"+
              " USER: "+user.name+" USER ID: "+user.id)
              callback({error: "Error"})
          } else {
            logger.info("ACTION: Zone | Device Analog Controller Mode Selection: "+event.type+
            " ANALOG CONTROLLERS: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          }
          
          if(event.type == 0){
            callback(null, { message: 'success' })
          } else {
            axios
            .post(`https://${gatewayIp}/api/wacGroupControl`, {
              channel: event.channel, 
              control: event.control,
              intensity: event.intensity,
              master: event.master
              })
              .then((resp_two) => {
                console.log(resp_two)
                if(resp_two.data.failed || resp_two.data.returnCode == -2){
                  logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                  " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Failed"+
                  " USER: "+user.name+" USER ID: "+user.id)
                  callback({error: "Error"})
                } else {
                  logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                  " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                    " RESULT: Success"+
                    " USER: "+user.name+" USER ID: "+user.id)
                  callback(null, { message: 'success' })
                }
              })
              .catch(err => { 
                logger.info("ACTION: Zone | Device Analog Controller's Channel Control: "+event.control+
                " ANALOG CONTROLLERS: "+event.master+" CHANNELS: "+event.channel+
                  " RESULT: Failed"+
                  " USER: "+user.name+" USER ID: "+user.id)
                callback(err)
              });
          }

        })
        .catch(err => { 
          logger.info("ACTION: Analog Controller Mode Selection: "+event.type+
          " ANALOG CONTROLLER: "+event.master+
            " RESULT: Success"+
            " USER: "+user.name+" USER ID: "+user.id)
          callback(err)
        });
    }
  });
};


// const lights =(event,user,callback)=>{
//   // console.log("eventtttt",event.WAC.wac[0].map(element=>element.macId))
//   console.log("eventtttt",event)

//   let data=[]
//   let mode=event.DALI.mode?event.DALI.mode:event.WAC.mode
//   let intensity=event.DALI.intensity?event.DALI.intensity:event.WAC.intensity
//   data=event.DALI.dali[0].slaves.concat(event.WAC.wac.map(element=>element.macId))
//   console.log("modse-----------",mode)
//   console.log("inseyting-----------",intensity)
//   model.updateevice(data,mode,intensity,(error,res)=>{
//     if(error){
//       console.log("errorororororor------",error)
//       callback(error)
//     }else{
//       callback(null,res)
//     }
//   })
// }

const lights = (event,user, callback) => {
  console.log("event",event.DALI)
  model.gatewayDetails((error, result) => {
    if (error) {
      logger.error(`${new Date()}lights.service.js gateway details:"${error.message}`)
      callback(error);
    } else {
      model.getmaxcommand_id((errorcommand,max_commmad_id)=>{   
        // console.log("max_commandid===============",max_commmad_id)
        // console.log("rgateway detailsssssssssss",result)
        // console.log("eventttttttttttttt",event)
        if(errorcommand){
          logger.error(`${new Date()}lights.service.js getmaxcommand_id=${errorcommand}`)
          callback(error)
        }else{
            let record=[]
            var i={counter:0}
            const batch_id=uuid()
            let cmd_id=[]
            console.log("evenetetetet",event.zone)
            console.log("resultttttt",result)
            const gatewayIp = result.filter(
                             each => each.zone_id === event.zone
                             )[0].ip;
            console.log("gateway ippppppppppp",gatewayIp)
            let payload = {}
            let dali_str = ""
            let ac_str = ""
            if (event.DALI) {
                     let masters = []
                     event.DALI.dali.forEach((each, i) => {
                         data={}
                         data.mac=each.macId
                         masters.push(each.macId)
                         let up_slaves = []
                         each.slaves.forEach((slaveMac, j) => {
                                  // if (each.macId.slice(-4) == slaveMac.substring(10, 14)) {
                                  up_slaves.push(parseInt(slaveMac.slice(-2), 16))
                                  // }
                           })
                        each.slaves = up_slaves
                         each.cmd=cmd_id.length>0?Math.max(...cmd_id)+1:max_commmad_id+1
                        // each.command_id=max_id+1
                        data.cmd=each.cmd
                        cmd_id.push(each.cmd)
                        data.payload=JSON.stringify(each)
                        data.mode= event.DALI.mode
                        data.intensity=event.DALI.intensity
                        data.counter=0
                        data.gatewayip=gatewayIp
                        data.status="pending"
                        data.id=uuid()
                        data.batch_id=batch_id
                        record.push(data)
                        })
                       payload["DALI"] = event.DALI
                       dali_str += "ACTION: Light Control  DALI MASTERS: "+masters
                       event.DALI.mode == 'manual' ? dali_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.DALI.intensity : dali_str += " LIGHT MODE: Auto"
           } 

        if (event.WAC) {
                       payload["WAC"] = event.WAC
                       var analog_controllers= event.WAC.wac.map(element => element.macId);
                       event.WAC.wac.forEach(each=>{
                            const data={}
                             data.mac=each.macId
                             each.cmd=cmd_id.length>0?Math.max(...cmd_id)+1:max_commmad_id+1
                            //  each.command_id=max_id+1
                             data.cmd=each.cmd
                             cmd_id.push(each.cmd)
                             data.payload=JSON.stringify(each)
                             data.status="pending"
                             data.mode= event.WAC.mode
                             data.gatewayip=gatewayIp
                             data.intensity=event.WAC.intensity
                             data.counter=0
                             data.id=uuid()
                             data.batch_id=batch_id
                             record.push(data)
                             console.log("cmd=======",each.cmd)
                             })
                       ac_str += "ACTION: Light Control  ANALOG CONTROLLERS: "+analog_controllers
                       event.WAC.mode == 'manual' ? ac_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.WAC.intensity : ac_str += " LIGHT MODE: Auto"
           }
       model.commandData(record,(errorcommandData,rescommanddata)=>{
         console.log("errorcmddata============================",errorcommandData)
         if(errorcommandData){
          logger.error(`${new Date()}lights.service.js commandData:${errorcommandData.message}`)
           callback(error)
         }else{
            console.log("===================",JSON.stringify(payload))
            // logger.info(JSON.stringify(payload))
           axios
                  .post(`https://${gatewayIp}/api/WLMSGroupControl`, payload)
                  // .post(`http://localhost:7080/api/WLMSGroupControl`, payload)
                  .then((resp) => {
                    // console.log("respppppppppppppppppppppp",resp)
                    // console.log("respppppppppppppppppppppp",resp.data)
                    // console.log("respppppppppppppppppppppp",resp.data.DALI)
                    // console.log("respppppppppppppppppppppp",resp.data.WAC)
                    if(resp.data.returnCode == 0) {
                      logger.info(`${new Date()}controlled device lights.service resp.data ${resp.data}`)
                      if(event.DALI && event.WAC) {
                        if(resp.data.DALI.failure !== null && resp.data.WAC.failure !== null) {
                          dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${dali_str}`)
                          ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${ac_str}`)
                          logger.error(`${new Date()}error both wac amd dali falied`)
                          callback(null, {message: "failure"})
                          // callback({message: "failure", response: resp})
                        } else if(resp.data.DALI.failure === null && resp.data.WAC.failure !== null) {
                          dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${dali_str}`)
                          ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${ac_str}`)
                          callback(null, { message: 'success',batchId: batch_id,batchLength:record.length })
                        }
                        else {
                          dali_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${dali_str}`)
                          ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${ac_str}`)
                          callback(null, { message: 'success',batchId: batch_id,batchLength:record.length })
                        }
                      }else if(event.DALI){
                        if(resp.data.DALI.failure) {
                          dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${dali_str}`)
                          logger.error(`${new Date()}device not found dali`)
                          callback(null, {message: "failure", response: resp.data.DALI})
                        } else {
                          dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${dali_str}`)
                          callback(null, {message: "success",batchId:batch_id,batchLength:record.length})
                        }
                      } else if(event.WAC) {
                        if(resp.data.WAC.failure !== null) {
                          ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${ac_str}`)
                          logger.error(`${new Date()}device not found WAC`)
                          callback(null, {message: "failure"})
                        } else {
                          ac_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                          logger.info(`${new Date()}${ac_str}`)
                          callback(null, {message: "success",batchId:batch_id,batchLength:record.length})
                        }
                      }
                    } else if(resp.data.returnCode == -1) {
                      logger.error(`${new Date()}device not found`)
                      callback(null, {message: "failure"})
                    }
                    // callback(null, { message: 'success',batchId: batch_id,batchLength:record.length })
                  })

                  .catch(err => {
                    logger.error("please connect to network lights.service.js"+err.message)
                    if(event.DALI && event.WAC) {
                      dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                      logger.info(`${new Date()}${dali_str}`)
                      ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                      logger.info(`${new Date()}${ac_str}`)
                    }else if(event.DALI){
                      dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                      logger.info(`${new Date()}${dali_str}`)
                    } else if(event.WAC) {
                      ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                      logger.info(`${new Date()}${dali_str}`)
                    }
                    callback(null,{message: "Please connect to a network"})
                  });
                      }
                    })
        }
      })
  }
    
  });
};

const updatedevicestatus=(cmd_id,cmdstatus,callback)=>{
        model.updatedevicestatus(cmd_id,cmdstatus,(error,result)=>{
        // model.updatedevicestatus(cmd_id,"failed",(error,result)=>{
          if(error){
            callback(error)
          }else{
            callback(null,"accepted")
          }
        })
}

const checkstatus = (callback) =>{
  model.checkstatus((error,result)=>{
    console.log("service fileeeeeeeeeeeeeeee",result)
    logger.info(`checkstatus response from service file==============${JSON.stringify(result)}`)
    if(error){
      callback(error)
    } else {
      callback(null,result)
    }
  })
}


const eventStatus=(batchId,batchLength,callback)=>{
  let value=[];
  model.eventStatus(batchId,batchLength,(error,result)=>{
    if(error){
      callback(error)
    }else{
      callback(null,result)
      // model.getcommand((err,result1)=>{
      //   if(err){
      //     callback(err)
      //   } else {
      //     let data = JSON.parse(result1[0].data)
      //     let cmd_from = data.lastCmdFrom
      //     // console.log("new modal-------------------",result1)
      //     // console.log("old modal-------------------",result)
      //     // console.log("old modal-------------------",cmd_from)
      //     // callback(null,result1)  
      //     value.push({mode:cmd_from})
      //     value.push(result)
      //     console.log("data array 1",value)
      //     callback(null,value)
      //   }
      // })
    }
  })
}



const Floorlights = (event,user, callback) => {
  model.gatewayDetails((error, result) => {
    if (error) {
      callback(error);
    } else {
      const gatewayIp = result.filter(
        each => each.zone_id === event.zone
      )[0].ip;
   
      let payload = {}
      let dali_str = ""
      let ac_str = ""
      if (event.DALI) {
        let masters = []
        event.DALI.dali.forEach((each, i) => {
          masters.push(each.macId)
          let up_slaves = []
          each.slaves.forEach((slaveMac, j) => {
            // if (each.macId.slice(-4) == slaveMac.substring(10, 14)) {
              up_slaves.push(parseInt(slaveMac.slice(-2), 16))
              // }
              
          })
          each.slaves = up_slaves
        })
        payload["DALI"] = event.DALI

        dali_str += "ACTION: Light Control  DALI MASTERS: "+masters
        event.DALI.mode == 'manual' ? dali_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.DALI.intensity : dali_str += " LIGHT MODE: Auto"
      } 

      if (event.WAC) {
        payload["WAC"] = event.WAC
        var analog_controllers= event.WAC.wac.map(element => element.macId);
        ac_str += "ACTION: Light Control  ANALOG CONTROLLERS: "+analog_controllers
            event.WAC.mode == 'manual' ? ac_str += " LIGHT MODE: Manual LIGHT CONTROL: "+event.WAC.intensity : ac_str += " LIGHT MODE: Auto"
      }
      console.log("caliing axios=========================================")
      axios
        .post(`https://${gatewayIp}/api/WLMSGroupControl`, payload)
        .then((resp) => {
          if(resp.data.returnCode == 0) {
            if(event.DALI && event.WAC) {
              if(resp.data.DALI.failure !== null && resp.data.WAC.failure !== null) {
                dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "failure"})
                // callback({message: "failure", response: resp})
              } else if(resp.data.DALI.failure === null && resp.data.WAC.failure !== null) {
                dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, { message: 'success' })
              }
              else {
                dali_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, { message: 'success' })
              }
            }else if(event.DALI){
              if(resp.data.DALI.failure) {
                dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                callback(null, {message: "failure", response: resp.data.DALI})
              } else {
                dali_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(dali_str)
                callback(null, {message: "success"})
              }
            } else if(event.WAC) {
              if(resp.data.WAC.failure !== null) {
                ac_str += " RESULT: FAILED"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "failure"})
              } else {
                ac_str += " RESULT: Success"+" USER: "+user.name+" USER ID: "+user.id
                logger.info(ac_str)
                callback(null, {message: "success"})
              }
            }
          } else if(resp.data.returnCode == -1) {
            callback(null, {message: "failure"})
          }
          // callback(null, { message: 'success' })
        })
        .catch(err => {
          if(event.DALI && event.WAC) {
            dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
            ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(ac_str)
          }else if(event.DALI){
            dali_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
          } else if(event.WAC) {
            ac_str += " RESULT: Failure"+" USER: "+user.name+" USER ID: "+user.id
            logger.info(dali_str)
          }
          callback({message: "Please connect to a network"})
        });
    }
  });
};



const setpoint=(payload,sp,callback)=>{
console.log("---------------",payload[0].macId)
console.log("--------------------------",sp)
 let data={"device":{"macAddress":payload[0].macId},"command":{"id":20,"args": parseInt(sp) }}
 console.log("---------data",data)
 let token='eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjE1Nzg0ODc1ODAsImlhdCI6MTU3ODQ4MDM4MCwiaXNzIjoiYXV0aDAifQ.DPu2lLWNlccPS1S42jl04HRNrQHoA5cUghbMrIcg9DQ'
 const config = {
  headers: { Authorization: `Bearer ${token}` }
};
//resp--------------- { reason: 'command successfully processed', returnCode: 0 }
axios
 .post(`https://192.168.1.102/api/command`,data,config)
.then((resp) => {
  console.log("resp---------------",resp.data)
  if(resp.data.returnCode==0){
    callback(null,{message:resp.data.reason})
  }
})
.catch(err => {
  logger.error("please connect to network lights.service.js"+err.message)
  callback(null,{message: "Please connect to a network"})
});
}


module.exports = {
  indiviualLights,
  zoneLights,
  anclLights,
  zoneAnctlLights,
  lights,
  updatedevicestatus,
  eventStatus,
  Floorlights,
  checkstatus,
  setpoint
};
