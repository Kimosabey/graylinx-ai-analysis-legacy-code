const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const axiosc = require('axios');
const https = require('https');
// const loggerSch = require('../../Config/loggerSch');
const loggerSch = require('../../Config/logger');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const lightmodel= require('../../Services/Lights/light.model')

const axios = axiosc.create({ httpsAgent });



// schedule.scheduleJob('*/5 * * * * *', () => {
schedule.scheduleJob('12,27,42,57 * * * *', () => {
// schedule.scheduleJob('57,27 * * * *', () => {
  // Start schedule
  async.waterfall(
    [
      callback => {
        controller.getStartSchedule((err, result) => {
          console.log("start scheduleeeeee---------------")
          loggerSch.info(`${new Date()}Start schedule-----------------------`)
          if (err) {
            callback(err);
          } else {
            //console.log(JSON.parse(result))
            callback(err, JSON.parse(result));
          }
        });
      },
      (response, callback) => {
        if (response.length !== 0) {
          // console.log("response", response)
          const next_data = [];
          response.forEach(each => {
            const data = JSON.parse(each.data);
            const { zones } = data;
            zones.forEach((zone, i) => {
              controller.getGatewayWithZoneId(zone.id, (err, result) => {
                if (result) {
                  const resp = JSON.parse(result)[0];
                  const { ip } = resp;
                  zones[i]['ip'] = ip;
                  zones[i]['floorId'] = each.floor_id;
                  zones[i]['intensity'] = data.intensity;
                  zones[i]['action'] = data.action;
                  zones[i]['mode'] = 'manual';
                  zones[i]['start'] = each.start;
                  zones[i]['end'] = each.end;
                  next_data.push(zones[i]);
                }
              });
            });
          });
          setTimeout(() =>

            callback(null, next_data), 500);
        } else {
          callback('empty');
        }
      },
      (response, callback) => {
        if (response.length !== 0) {
          const next_data = [];
          response.forEach((each, i) => {
            controller.getDevicesWithFloorId(each.floorId, (err, deviceData) => {
              if (deviceData.length !== 0) {
                //console.log("controllers: ",result);
                var analog_controllers = [];
                var dali_controllers = [];
                var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').filter(e => e.zone_id == each.id).map(e => e.mac);
                analogControllersMac.forEach((analog_mac, j) => {
                  let analogObj = {
                    "macId": analog_mac,
                    "channel": 0,
                    "cmd":36000+j
                  }
                  analog_controllers.push(analogObj)
                })
                var daliMac = deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
                var daliSlave = deviceData.filter(e => e.type === 'dali_slave').filter(e => e.zone_id === each.id).map(e => e.mac)
                daliMac.forEach((dali_mac, k) => {
                  let slaves = []
                  daliSlave.forEach((slaveMac, l) => {

                    if (dali_mac.slice(-4) == slaveMac.substring(10, 14)) {
                      slaves.push(parseInt(slaveMac.slice(-2), 16))
                    }

                  })
                  let daliObj = {
                    "selection": "slaves",
                    "macId": dali_mac,
                    "slaves": slaves,
                    "cmd":38000+k
                  }
                  dali_controllers.push(daliObj)
                })
                let daliData = {
                  "mode": each.mode,
                  "intensity": parseInt(each.intensity),
                  "dali": dali_controllers                
                }
                let analogData = {
                  "mode": each.mode,
                  "intensity": parseInt(each.intensity),
                  "wac": analog_controllers
                }
                let daliDataAuto = {
                  "mode": "auto",
                  "intensity": 100,
                  "dali": dali_controllers                
                }
                let analogDataAuto = {
                  "mode": "auto",
                  "intensity": 100,
                  "wac": analog_controllers
                }
                response[i]['DALI'] = daliData;
                response[i]['WAC'] = analogData;
                response[i]['DALI_AUTO'] = daliDataAuto;
                response[i]['WAC_AUTO'] = analogDataAuto;
                next_data.push(response[i]);
              }
            });
          });
          setTimeout(() => callback(null, next_data), 1000);
        } else {
          callback('empty');
        }
      }
    ],
    (err, response) => {
      if (err) {
        console.log(err)
        console.log('Schedule Empty');
        loggerSch.info(`${new Date()}empty start Scheduleeeeeee`)
      } else {
        if (response.length !== 0) {
          console.log("final_resp===============================", response.length)
          let ino = 0;
          let eno = 0;
          // loggerSch.info("inside schedule start jobbbbbbbbb"+JSON.stringify(response))
          response.forEach((each,i) => {
            // const start = "2022-11-24 17:50:00";
            const start = each.start;
            const end = each.end;
            // console.log("daliiiiiiiiiii",JSON.stringify(each.DALI))
            // console.log("waccccccccccccccc",JSON.stringify(each.WAC))
            const payload = {
              DALI: each.DALI,
              WAC: each.WAC
            }
            console.log("i am payload 1 completeddddddddddddd")
            const payload_two = {
              DALI: each.DALI_AUTO,
              WAC: each.WAC_AUTO
            }
            // console.log("payload1:===================================================== ", JSON.stringify(payload))
            // console.log("payload2:+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ", JSON.stringify(payload_two))
            controller.updateLatestCommand(payload,(err,resp) =>{
              if(err){
                console.log(err)
              } else {
                console.log("recored inserted")
              }
            })
            console.log("ipppppppppppppppp",each.ip,i)
            loggerSch.info(`ipppppppppppp start schedule${each.ip} count------->${i}`)
            // let resp = payload.DALI
            // let res =[]
            // resp.dali.forEach((ele,i)=>{
            //   if(ele.slaves.length!=0){
            //     let load = {"slaves":ele.slaves}
            //     let abc = {
            //       device_mac: ele.macId,
            //       gatewayip: each.ip,
            //       mode: resp.mode,
            //       intensity: resp.intensity,
            //       payload: JSON.stringify(load),
            //       updated_at:each.start
            //     }
            //     res.push(abc)
            //   }
            // })
            // console.log("ressssssssssssssssss",res)
            // res.forEach((item,i)=>{
            //   let arr=[]
            //   arr.push(item)
            //   lightmodel.updateLatestCommand(arr,(err,resp)=>{
            //     if(err){
            //       console.log(err)
            //     } else {
            //       return "accepted"
            //     }
            //   })
            // })
            schedule.scheduleJob(start, start, () => {
              ino += 5000;
              console.log("---->",ino)
              setTimeout(
                () =>
                axios
               .post(`https://${each.ip}/api/WLMSGroupControl`, payload)
                //  .post(`http://localhost:7080/api/WLMSGroupControl`, payload)
                .then(() => {
                        loggerSch.info(
                          `${new Date()} Status: success , action : ${
                          each.action
                          } , zone: ${each.name}`
                        )
                        let resp = payload.DALI
                        let res =[]
                        resp.dali.forEach((ele,i)=>{
                          if(ele.slaves.length!=0){
                            let load = {"slaves":ele.slaves}
                            let abc = {
                              device_mac: ele.macId,
                              gatewayip: each.ip,
                              mode: resp.mode,
                              intensity: resp.intensity,
                              payload: JSON.stringify(load),
                              updated_at:each.start
                            }
                            res.push(abc)
                          } else { console.log("empty slavess")}
                        })
                        console.log("ressssssssssssssssss",res)
                        res.forEach((item,i)=>{
                          let arr=[]
                          arr.push(item)
                          lightmodel.updateLatestCommand(arr,(err,resp)=>{
                            if(err){
                              console.log(err)
                            } else {
                              return "accepted"
                            }
                          })
                        })
                      }
                    )
                    .catch((err) =>
                      loggerSch.info(
                        `${new Date()} Status: failure, action : MANUAL MODE, zone: ${each.name} error ${err}`
                      )
                    ),
                ino
              );
            });
          });
        }
      }
    }
  );
  // end schedule
  async.waterfall(
    [
      callback => {
        controller.getEndSchedule((err, result) => {
          console.log("end scheduleeeeeee==========================")
          loggerSch.info(`${new Date()}Ending schedule`)
          if (err) {
            callback(err);
          } else {
            //console.log(JSON.parse(result))
            callback(err, JSON.parse(result));
          }
        });
      },
      (response, callback) => {
        if (response.length !== 0) {
          console.log("response", response)
          const next_data = [];
          response.forEach(each => {
            const data = JSON.parse(each.data);
            const { zones } = data;
            zones.forEach((zone, i) => {
              controller.getGatewayWithZoneId(zone.id, (err, result) => {
                if (result) {
                  const resp = JSON.parse(result)[0];
                  const { ip } = resp;
                  zones[i]['ip'] = ip;
                  zones[i]['floorId'] = each.floor_id;
                  zones[i]['intensity'] = data.intensity;
                  zones[i]['action'] = data.action;
                  zones[i]['mode'] = 'manual';
                  zones[i]['start'] = each.start;
                  zones[i]['end'] = each.end;
                  next_data.push(zones[i]);
                }
              });
            });
          });
          setTimeout(() =>

            callback(null, next_data), 500);
        } else {
          callback('empty');
        }
      },
      (response, callback) => {
        if (response.length !== 0) {
          const next_data = [];
          response.forEach((each, i) => {
            controller.getDevicesWithFloorId(each.floorId, (err, deviceData) => {
              if (deviceData.length !== 0) {
                //console.log("controllers: ",result);
                var analog_controllers = [];
                var dali_controllers = [];
                var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').filter(e => e.zone_id == each.id).map(e => e.mac);
                analogControllersMac.forEach((analog_mac, j) => {
                  let analogObj = {
                    "macId": analog_mac,
                    "channel": 0,
                    "cmd":36000+j
                  }
                  analog_controllers.push(analogObj)
                })
                var daliMac = deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
                var daliSlave = deviceData.filter(e => e.type === 'dali_slave').filter(e => e.zone_id === each.id).map(e => e.mac)
                daliMac.forEach((dali_mac, k) => {
                  let slaves = []
                  daliSlave.forEach((slaveMac, l) => {

                    if (dali_mac.slice(-4) == slaveMac.substring(10, 14)) {
                      slaves.push(parseInt(slaveMac.slice(-2), 16))
                    }

                  })
                  let daliObj = {
                    "selection": "slaves",
                    "macId": dali_mac,
                    "slaves": slaves,
                    "cmd":38000+k
                  }
                  dali_controllers.push(daliObj)
                })
                let daliData = {
                  "mode": each.mode,
                  "intensity": parseInt(each.intensity),
                  "dali": dali_controllers                
                }
                let analogData = {
                  "mode": each.mode,
                  "intensity": parseInt(each.intensity),
                  "wac": analog_controllers
                }
                let daliDataAuto = {
                  "mode": "auto",
                  "intensity": 100,
                  "dali": dali_controllers                
                }
                let analogDataAuto = {
                  "mode": "auto",
                  "intensity": 100,
                  "wac": analog_controllers
                }
                response[i]['DALI'] = daliData;
                response[i]['WAC'] = analogData;
                response[i]['DALI_AUTO'] = daliDataAuto;
                response[i]['WAC_AUTO'] = analogDataAuto;
                next_data.push(response[i]);
              }
            });
          });
          setTimeout(() => callback(null, next_data), 1000);
        } else {
          callback('empty');
        }
      }
    ],
    (err, response) => {
      if (err) {
        console.log(err)
        console.log('Schedule Empty');
        loggerSch.info(`${new Date()}empty end schedule`)
      } else {
        if (response.length !== 0) {
          console.log("final_resp===============================", response)
          let ino = 0;
          let eno = 0;
          // loggerSch.info("inside schedule end jobbbbbbbbb"+JSON.stringify(response))
          response.forEach((each,i) => {
            const start = each.start;
            const end = each.end;
            // const end = "2022-11-24 18:15:00";
            console.log("daliiiiiiiiiii",JSON.stringify(each.DALI))
            console.log("waccccccccccccccc",JSON.stringify(each.WAC))
            const payload = {
              DALI: each.DALI,
              WAC: each.WAC
            }
            console.log("i am payload 1 completeddddddddddddd")
            const payload_two = {
              DALI: each.DALI_AUTO,
              WAC: each.WAC_AUTO
            }
            // console.log("payload1:===================================================== ", JSON.stringify(payload))
            console.log("payload2:+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ", JSON.stringify(payload_two))
            
            console.log("ipppppppppppppppp",each.ip)
            loggerSch.info(`ipppppppppppp end schedule${each.ip} count------->${i}`)
            schedule.scheduleJob(end, end, () => {
              console.log("end jobbbbbbbbbbbbbbbbbbbbbbbbbbbb",payload_two)
              setTimeout(
                () =>
                  axios
                    .post(`https://${each.ip}/api/WLMSGroupControl`, payload_two)
                    //  .post(`http://localhost:7080/api/WLMSGroupControl`, payload_two)
                    .then(() => {
                        loggerSch.info(
                          `${new Date()} Status: success , action : AUTO MODE , zone: ${
                          each.name
                          }`
                        )
                        let resp = payload_two.DALI
                        let res =[]
                        resp.dali.forEach((ele,i)=>{
                          if(ele.slaves.length!=0){
                            let load = {"slaves":ele.slaves}
                            let abc = {
                              device_mac: ele.macId,
                              gatewayip: each.ip,
                              mode: resp.mode,
                              intensity: resp.intensity,
                              payload: JSON.stringify(load),
                              updated_at:each.start
                            }
                            res.push(abc)
                          }
                        })
                        console.log("ressssssssssssssssss",res)
                        res.forEach((item,i)=>{
                          let arr=[]
                          arr.push(item)
                          lightmodel.updateLatestCommand(arr,(err,resp)=>{
                            if(err){
                              console.log(err)
                            } else {
                              return "accepted"
                            }
                          })
                        })
                      }
                    )
                    .catch(() =>
                      loggerSch.info(
                        `${new Date()} Status: failure, action : AUTO MODE , zone: ${
                        each.name
                        }`
                      )
                    ),
                eno
              );
              eno += 3000;
            });
            // schedule.scheduleJob({ start: start, end: end, rule: ' */50 * * * * *' }, function(){
            // schedule.scheduleJob({ start: start, end: end, rule: '*/50 * * * * *' }, function(){
            //   loggerSch.info("inside schedule recurring jobbbbbbbbb")
            //   // console.log("inside recurring jobbbbbbbbbbbb")
            //   // console.log('Time for tea scheduleeeeee!=================================================================================');
            //   // console.log("continous commanddddddd",payload)
            //   console.log("daliiiiii",payload.DALI.dali)
            //   console.log("waccccccccccccc",payload.WAC.wac)
            //   axios
            //     .post(`https://${each.ip}/api/WLMSGroupControl`, payload)
            //     .then(() =>
            //           console.log(
            //             `${new Date()} Status: success , action : ${
            //             each.action
            //             } , zone: ${each.name}`
            //           ),
            //     ).catch(() =>
            //     console.log(
            //       `${new Date()} Status: failure, action : MANUAL MODE, zone: ${each.name}`
            //     )
            //   )      
            // });
          });
        }
      }
    }
  )
});
