const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
const send_pbs_request = require('../Validate_Alarms/PBS_REQUEST');

schedule.scheduleJob('*/5 * * * * *', ()=>{
  // schedule.scheduleJob('*/1 * * * *', ()=>{
    async.waterfall(
        [
        callback =>{
            controller.alarmToValidate((err,results)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }
        ,(response, callback) => {
            //  console.log("response",response)
            if (response.length > 0) {
              response.forEach(devId => {
                if (
                  devId.message == 'Duct Static Pressure Mismatch'
                  ) {
                controller.getLatestValuesForAlarm(devId.ss_id,(err,results1)=>{
                  if(err){
                    callback(err);
                  }else{
                    // console.log("results11111111111",results1)
                    results1.forEach(late=>{
                      if(late.param_id == 'SAF_VFD_On_Off_Fbk'){
                        // console.log("param_value",late.param_value)
                        if(late.param_value == 1){
                          console.log('ahu is on');
                          time(devId.created_at,devId.id,(err,res)=>{
                            if(err){
                              callback(err)
                            }else{
                              console.log('ress',res);
                              if(res == 'THERE IS A ALARM'){
                                // console.log("msg",devId.message)
                                // checking which alarm is this
                                    results1.forEach(comp => {
                                    // controller.getInputValuesForAlarm(
                                    //   comp.ss_id,
                                    //   (err, results2) => {
                                    //     if (err) {
                                    //       callback(err);
                                    //     } else {
                                          let arr = [];
                                          // console.log("results2",results2)
                                          results1.forEach(input => {
                                              // console.log("comp.param_id",input.param_id)
                                              //checking their parameters
                                            if (comp.param_id == 'DSP' &&
                                            input.param_id ==
                                              'DSP_SP') {
                                              console.log('comp_valueeeDSP',comp.param_value,"input value",input.param_value);
                                              if (input.param_value - comp.param_value > 10) {
                                                arr.push('DSP_HIGH');
                                                arr.push(devId.id);
                                                arr.push(devId.ss_id);
                                                arr.push(devId.measured_time);
                                                arr.push(devId.modified_at)
                                                // arr.push(input.param_value);
                                                controller.validatedAlarm(devId.id,(err,results3)=>{
                                                  if(err){
                                                      callback(err)
                                                  }else{
                                                      callback(null,arr)
                                                  }
                                                 })
                                                console.log('Dsp is High');
                                                // console.log("alarm_code",devId.alarm_code)
                                              } else if(input.param_value - comp.param_value < -10){
                                                arr.push('DSP_LOW');
                                                arr.push(devId.id);
                                                arr.push(devId.ss_id);
                                                arr.push(devId.measured_time);
                                                arr.push(devId.modified_at)
                                                // arr.push(input.param_value);
                                                controller.validatedAlarm(devId.id,(err,results3)=>{
                                                  if(err){
                                                      callback(err)
                                                  }else{
                                                      callback(null,arr)
                                                  }
                                                 })
                                                console.log('Dsp is Low');
                                              }else{
                                                arr.push('DSP is Good');
                                                // callback(null, arr);
                                                console.log('DSP IS GOOD');
                                              }
                                            }
                                          });
                                  //       }
                                  //     }
                                  //   );
                                  });
                              }else{
                                console.log('THERE IS NO ALARM')
                              }
                            }
                          })
                        }else{
                          console.log('ahu is off')
                          controller.restoreAlarm(devId.id,(err,resresults)=>{
                            if(err){
                              callback(err)
                            }else{
                              callback(null,resresults)
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }else{
                console.log("NO ALARM REGISTERED",'---->',fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
              }
              });
            } else {
              console.log('NO ALARMS REGISTERED','---->',fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
            }
          }
        ,(response,callback)=>{
            //console.log("response",response)
            console.log("responseSendingPossibleCauses",response)
          if(response[0] == 'DSP_HIGH'){
            console.log("Im here high")
            let req_payload={
              'service':'DSP_MISMATCH',
              'feature': 'DSP_HIGH',
            }
            let payload = {
              "equipment":"ahu_0101a0_om_p",
              "causes":["RPM_PID"],
              "start_time":"2023-09-01 00:00:00",
              "end_time":"2023-09-01 01:00:00"
            }
          send_pbs_request.sendRequestToFdd(req_payload,payload,(err,res1)=>{
            if(err){
              callback(err)
            }else{
              console.log("It is response from PBS request",res1,response[1])
              if(res1 != "Error from FDD"){
                  controller.addTriggerId(res1,response[1],(err,res)=>{
                    if(err){
                      callback(err)
                    }else{
                      console.log("inserted")
                      callback(null,'inserted')
                    }
              })
            }
            }
          }) 
          }else if(response[0] == 'DSP_LOW'){
            console.log("Im here low")
            let req_payload={
              'service':'DSP_MISMATCH',
              'feature': 'DSP_LOW',
            }
            let payload = {
              "equipment":"ahu_0101a0_om_p",
              "causes":["RPM","CHW","RPM_PID","duct_leak","FAN_POWER"],
              "start_time":"2023-09-01 00:00:00",
              "end_time":"2023-09-01 01:00:00"
            }
          send_pbs_request.sendRequestToFdd(req_payload,payload,(err,res1)=>{
            if(err){
              callback(err)
            }else{
              console.log("It is response from PBS request",res1,response[1])
                  controller.addTriggerId(res1,response[1],(err,res)=>{
                    if(err){
                      callback(err)
                    }else{
                      console.log("inserted")
                      callback(null,'inserted')
                    }
              })
            }
          }) 
          }
        
        }
        ,(response,callback)=>{
            // console.log("response",response)
            // controller.generateMail(response,(err,resend)=>{
            //     if(err){
            //         callback(err)
            //     }else{
            //         callback(null,"Alert sent")
            //     }
            // })
        }   
    ],
    (err, response) => {
        if(err){
            console.log("error",err)
        }else{
            console.log("done")
        }
    })
})

const time = (createdtime,ala_id,callback)=>{
let createTime = createdtime
// console.log("createdtime",createdtime)
let currentTime=(fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
//  console.log("currentTime",currentTime)
const alarmTime = differenceInMinutes(
    new Date(currentTime),
    new Date(createTime)
  )
   console.log("alarm triggered time",alarmTime)
// if(alarmTime > 60){
  controller.updateModifiedTime(currentTime,ala_id,(err,res)=>{
    if(err){
      callback(err)
    }else{
      callback(null, 'THERE IS A ALARM');
    }
  })
    // callback(null,"THERE IS A ALARM")
// }else{
//     callback(null,"NO ALARM")
// }
}


// controller.getInputValuesForAlarm(response[2],(err,inres)=>{
//   if(err){
//     callback(err)
//   }else{
//     controller.getLatestValuesForAlarm(response[2],(err,lateres)=>{
//       if(err){
//         callback(err)
//       }else{
//         let causes = {};
//         let obj = {};
//         inres.forEach(input=>{
//           lateres.forEach(current=>{
//             if(response[0] == 'Dsp is Low'){
//             if(current.param_id == 'DPS_Filter'){
//                 if(current.param_value == 0){
//                     obj['Air fliter clogging- indicated by Differentual presure switch tripping'] = 'Faulty'
//                 }else{
//                     obj['Air fliter clogging'] = 'Fine'
//                 }
//             }
//             if(current.param_id == 'SAF_VFD_Trip_SS'){
//                 if(current.param_value == 1){
//                     obj['AHU FAN Tripped Indicated by VFD trip status'] = 'Faulty'
//                 }else{
//                     obj['AHU FAN Tripped Status'] = 'Fine'
//                 }
//             }

//             obj['Air leaks  - Verify DOORS OPEN, Duct leakage'] = 'Check'

//             if(current.param_id == 'SAF_VFD_AM_Fbk'){
//                 if(current.param_value == 1){
//                   obj['AHU Operation Mode'] = 'Manual'
//                 }else{
//                   obj['AHU Operation Mode'] = 'Auto'
//                   console.log('ahu is auto mode')
//                 }
//               }
//             if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
//                 if(current.param_value > input.param_value + 5){
//                   obj['PID of FAN Speed converges below lower threshold'] = 'Mismatch'
//                 }else if(current.param_value < input.param_value - 5){
//                   obj['PID of FAN Speed converges below lower threshold'] = 'Mismatch'
//                 }else{
//                   obj['PID of FAN Speed converges'] = 'Fine'
//                   console.log("AHU Fan Speed is Fine")
//                 }
//               }

//               obj[' Mechanical issue - verify Fan, Motor, Fan belt operation'] = 'Check'

//           }else if(response[0] == 'Dsp is High'){
//             if(current.param_id == 'SAF_VFD_AM_Fbk'){
//                 if(current.param_value == 1){
//                   obj['AHU Operation Mode'] = 'Manual'
//                 }else{
//                   obj['AHU Operation Mode'] = 'Auto'
//                   console.log('ahu is auto mode')
//                 }
//               }

//               obj['Return Air  Damper closed and  Mixed Damper  stuck Open'] = 'Check'

//             if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
//                 if(current.param_value > input.param_value + 5){
//                   obj['PID of FAN Speed converges below lower threshold'] = 'Mismatch'
//                 }else if(current.param_value < input.param_value - 5){
//                   obj['PID of FAN Speed converges below lower threshold'] = 'Mismatch'
//                 }else{
//                   obj['PID of FAN Speed converges'] = 'Fine'
//                   console.log("AHU Fan Speed is Fine")
//                 }
//               }
//               obj[' Mechanical issue - verify Fan, Motor, Fan belt operation'] = 'Check'
//           }
//           })
//         })
//         causes['DSP HIGH/LOW'] = obj;
//         console.log("Im here",causes)
//         controller.update_causes(causes,response[1],(err,resup)=>{
//           if(err){
//             callback(err)
//           }else{
//             callback(null, causes);        
//           }
//         })
//       }
//     })
//   }
// })