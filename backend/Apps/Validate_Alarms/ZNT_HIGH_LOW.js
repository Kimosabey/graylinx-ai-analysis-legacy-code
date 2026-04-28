const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
const send_pbs_request = require('../Validate_Alarms/PBS_REQUEST')

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
                  devId.message == 'Zonal Temperature Mismatch'
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
                                    // results1.forEach(comp => {
                                    // controller.getInputValuesForAlarm(
                                    //   comp.ss_id,
                                    //   (err, results2) => {
                                    //     if (err) {
                                    //       callback(err);
                                    //     } else {
                                          let arr = [];
                                          // console.log("results2",results2)
                                        //   results1.forEach(input => {
                                              // console.log("comp.param_id",input.param_id)
                                              //checking their parameters
                                            // if (comp.param_id == 'ZAT' &&
                                            // input.param_id ==
                                            //   'ZAT_SP') {
                                            //   console.log('comp_valueeeZAT',comp.param_value,"input value",input.param_value);
                                            //   if (input.param_value - comp.param_value > 10) {
                                                arr.push('ZAT_MISMATCH');
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
                                                console.log('ZAT_MISMATCH');
                                                // console.log("alarm_code",devId.alarm_code)
                                            //   } 
                                            //   else if(input.param_value - comp.param_value < -10){
                                            //     arr.push('ZAT_LOW');
                                            //     arr.push(devId.id);
                                            //     arr.push(devId.ss_id);
                                            //     arr.push(devId.measured_time);
                                            //     arr.push(devId.modified_at)
                                            //     // arr.push(input.param_value);
                                            //     controller.validatedAlarm(devId.id,(err,results3)=>{
                                            //       if(err){
                                            //           callback(err)
                                            //       }else{
                                            //           callback(null,arr)
                                            //       }
                                            //      })
                                            //     console.log('ZAT is Low');
                                            //   }
                                            //   else{
                                            //     arr.push('ZAT is Good');
                                            //     // callback(null, arr);
                                            //     console.log('ZAT IS GOOD');
                                            //   }
                                            // }
                                        //   });
                                        // }
                                    //   }
                                    // );
                                //   });
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
            if(response[0] == 'ZAT_MISMATCH'){
                let req_payload={
                    'service':'ZONE_TEMP_MISMATCH',
                    'feature':'ZONE_TEMP_MISMATCH',
                  }
                  
                  let payload = {
                    "equipment":"ahu_0101a0_om_p",
                    "causes":["ZONE_SAT_mismatch","ZONE_DSP_mismatch","ZONE_damper_stuck","ZONE_load_sensor_fault","ZONE_DUCT_PID_issue"],
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

const time = (createdtime,ala_id,callback) => {
    let createTime = createdtime;
    // console.log("createdtime",createdtime)
    let currentTime = fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    //  console.log("currentTime",currentTime)
    const alarmTime = differenceInMinutes(
      new Date(currentTime),
      new Date(createTime)
    );
    console.log('alarm triggered time', alarmTime);
    // if (alarmTime > 60) {
      controller.updateModifiedTime(currentTime,ala_id,(err,res)=>{
        if(err){
          callback(err)
        }else{
          callback(null, 'THERE IS A ALARM');
        }
      })
    // } else {
    //   callback(null, 'NO ALARM');
    // }
  };


///////////////////////////////////////////////old//////////////////////////////
//  let causes = {}
//  let obj ={}
// if(response[0] == "ZAT is High" || response[0] == "ZAT is Low"){
//     causes["ZAT HIGH/LOW"]=obj
//     obj["VAV Damper stuck (mechanical fault)"]='Faulty'
//     obj["Thermistor fault (ZAT_SP)"]='Faulty'
//     obj["ZAT Sensor fault"]='Faulty'
//     obj["PID not tuned properly; PID: (ZAT --> ZAT_SP) controlling Zonal CFM"]='Faulty'
//     // causes.push(obj)
//     // console.log("Im here",causes)
//     controller.update_causes(causes,response[1],(err,resup)=>{
//         if(err){
//         callback(err)
//         }else{
//         callback(null, causes);       
//         }
//       })
// }
//////////////////////////////////////////////////old/////////////////////////////