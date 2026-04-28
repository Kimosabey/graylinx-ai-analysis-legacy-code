// const _ = require('lodash');
// const schedule = require('node-schedule');
// const async = require('async');
// const controller = require('./controller');
// const axiosc = require('axios');
// const https = require('https');
// const loggerSch = require('../../Config/loggerSch');
// // const loggerSch = require('../../Config/logger');

// const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// const axios = axiosc.create({ httpsAgent });

// // schedule.scheduleJob('0 0 */2 * * *',()=>{
// // schedule.scheduleJob('0 8 */1 * * *',()=>{
// schedule.scheduleJob('10,20,40,50 * * * *', () => {
//   // var rule = new schedule.RecurrenceRule();

//   // rule.minute = new schedule.Range(0, 59, 25);  
// // schedule.scheduleJob(rule,()=>{
//     async.waterfall(
//         [
//             callback => {
//                 controller.getreccuringschedule((err,result) => {
//                     if(err){
//                         callback(err)
//                     } else{
//                       loggerSch.info(`recurring schedule startedddddddddd ${new Date()}`)
//                         console.log("resulttttttttt",result)
//                         callback(err, result);
//                     }
//                 })
//             },
//             (response, callback) => {
//                 console.log("responseeeeeeee",response)
//                 if (response.length !== 0) {
//                   console.log("response", response)
//                   const next_data = [];
//                   response.forEach(each => {
//                     const data = JSON.parse(each.data);
//                     const { zones } = data;
//                     zones.forEach((zone, i) => {
//                       controller.getGatewayWithZoneId(zone.id, (err, result) => {
//                         if (result) {
//                           const resp = JSON.parse(result)[0];
//                           const { ip } = resp;
//                           zones[i]['ip'] = ip;
//                           zones[i]['floorId'] = each.floor_id;
//                           zones[i]['intensity'] = data.intensity;
//                           zones[i]['action'] = data.action;
//                           zones[i]['mode'] = 'manual';
//                           zones[i]['start'] = each.start;
//                           zones[i]['end'] = each.end;
//                           next_data.push(zones[i]);
//                         }
//                       });
//                     });
//                   });
//                   setTimeout(() =>
        
//                     callback(null, next_data), 500);
//                 } else {
//                   callback('empty');
//                 }
//             },
//             (response, callback) => {
//                 if (response.length !== 0) {
//                   const next_data = [];
//                   response.forEach((each, i) => {
//                     controller.getDevicesWithFloorIdRec(each.floorId, (err, deviceData) => {
//                       if (deviceData.length !== 0) {
//                         //console.log("controllers: ",result);
//                         // var analog_controllers = [];
//                         var dali_controllers = [];
//                         // var analogControllersMac = deviceData.filter(e => e.type === 'analog_controller').filter(e => e.zone_id == each.id).map(e => e.mac);
//                         // analogControllersMac.forEach((analog_mac, j) => {
//                         //   let analogObj = {
//                         //     "macId": analog_mac,
//                         //     "channel": 0,
//                         //     "cmd":30000+j
//                         //   }
//                         //   analog_controllers.push(analogObj)
//                         // })
//                         var daliMac = deviceData.filter(e => e.type === 'dali_master').map(e => e.mac);
//                         var daliSlave = deviceData.filter(e => e.type === 'dali_slave').filter(e => e.zone_id === each.id).map(e => e.mac)
//                         daliMac.forEach((dali_mac, k) => {
//                           let slaves = []
//                           daliSlave.forEach((slaveMac, l) => {
        
//                             if (dali_mac.slice(-4) == slaveMac.substring(10, 14)) {
//                               slaves.push(parseInt(slaveMac.slice(-2), 16))
//                             }
        
//                           })
//                           let daliObj = {
//                             "selection": "slaves",
//                             "macId": dali_mac,
//                             "slaves": slaves,
//                             "cmd":38000+k
//                           }
//                           dali_controllers.push(daliObj)
//                         })
//                         let daliData = {
//                           "mode": each.mode,
//                           "intensity": parseInt(each.intensity),
//                           "dali": dali_controllers                
//                         }
//                         // let analogData = {
//                         //   "mode": each.mode,
//                         //   "intensity": parseInt(each.intensity),
//                         //   "wac": analog_controllers
//                         // }
//                         let daliDataAuto = {
//                           "mode": "auto",
//                           "intensity": parseInt(each.intensity),
//                           "dali": dali_controllers                
//                         }
//                         // let analogDataAuto = {
//                         //   "mode": "auto",
//                         //   "intensity": parseInt(each.intensity),
//                         //   "wac": analog_controllers
//                         // }
//                         response[i]['DALI'] = daliData;
//                         // response[i]['WAC'] = analogData;
//                         response[i]['DALI_AUTO'] = daliDataAuto;
//                         // response[i]['WAC_AUTO'] = analogDataAuto;
//                         next_data.push(response[i]);
//                       }
//                     });
//                   });
//                   setTimeout(() => callback(null, next_data), 1000);
//                 } else {
//                   callback('empty');
//                 }
//             }
//         ],
//         (err, response) => {
//             if (err) {
//               console.log(err)
//               console.log('Schedule Empty');
//               loggerSch.info(`REcurring sch empty ${new Date()}`)
//             } else {
//               if (response.length !== 0) {
//                 console.log("final_resp===============================", response)
//                 let ino = 0;
//                 // let eno = 0;
//                 // loggerSch.info("inside schedule start recurring jobbbbbbbbb"+JSON.stringify(response))
//                 response.forEach((each,i) => {
//                 //   const start = each.start;
//                 //   const end = each.end;
//                   console.log("daliiiiiiiiiii",JSON.stringify(each.DALI))
//                   console.log("waccccccccccccccc",JSON.stringify(each.WAC))
//                   const payload = {
//                     DALI: each.DALI
//                   }
//                   console.log("i am payload 1 completeddddddddddddd")
//                   console.log("payload1:===================================================== ", JSON.stringify(payload))
//                   // console.log("payload2:+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ ", JSON.stringify(payload_two))
                  
//                   console.log("ipppppppppppppppp",each.ip)
//                   loggerSch.info(`ipppppppppppp recurring${each.ip} count---->${i} time ${new Date()}`)
//                 //   schedule.scheduleJob(start, start, () => {
//                     console.log("inside schedule start jobbbbbbbbbbb",payload)
                  
//                     ino += 5000;
//                     setTimeout(
//                       () =>
//                       axios
//                       .post(`https://${each.ip}/api/WLMSGroupControl`, payload)
//                         // .post(`http://localhost:7080/api/WLMSGroupControl`, payload)
//                       .then(() =>
//                             loggerSch.info(
//                               `${new Date()} Status: success reccuring, action : ${
//                               each.action
//                               } , zone: ${each.name}`
//                             )
//                           )
//                           .catch((err) =>
//                             loggerSch.info(
//                               `${new Date()} Status: failure recurring, action : MANUAL MODE, zone: ${each.name} error ${err}`
//                             )
//                           ),
//                       ino
//                     );
//                 //   });
//                 });
//               }
//             }
//         }
//     );
// });