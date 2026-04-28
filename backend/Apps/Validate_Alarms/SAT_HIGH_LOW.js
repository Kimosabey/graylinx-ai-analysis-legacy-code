const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const send_pbs_request = require('../Validate_Alarms/PBS_REQUEST')

schedule.scheduleJob('*/5 * * * * *', () => {
  // schedule.scheduleJob('*/1 * * * *', () => {
  async.waterfall(
    [
      callback => {
        controller.alarmToValidate((err, results) => {
          if (err) {
            callback(err);
          } else {
            callback(null, results);
          }
        });
      },
      (response, callback) => {
        //  console.log("response",response)
        if (response.length > 0) {
          response.forEach(devId => {
            if (
              devId.message == 'Supply Air Temperature Mismatch'
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
                                      // this is from input values from input table
                                      // results2.forEach(input => {
                                        // this is from input values from latest event table
                                        results1.forEach(input=>{
                                          // console.log("comp.param_id",input.param_id)
                                          //checking their parameters
                                          if (comp.param_id == 'SAT' &&
                                          input.param_id ==
                                          'SAT_SP') {
                                            if (input.param_value - comp.param_value > 1) {
                                            console.log("input_parameters_param_id",input.param_id,"input_parameters_param_id",input.param_value);
                                            console.log("latest_parameters_param_id",comp.param_id,"latest_parameters_param_id",comp.param_value);
                                            arr.push('SAT_HIGH');
                                            arr.push(devId.id);
                                            arr.push(devId.ss_id);
                                            arr.push(devId.measured_time);
                                            arr.push(devId.modified_at)
                                            controller.validatedAlarm(devId.id,(err,results3)=>{
                                              if(err){
                                                  callback(err)
                                              }else{
                                                  callback(null,arr)
                                              }
                                             })
                                            console.log('SAT IS HIGH');
                                            // console.log("alarm_code",devId.alarm_code)
                                          } else if(input.param_value - comp.param_value < -1){
                                            console.log("input_parameters_param_id",input.param_id,"input_parameters_param_id",input.param_value);
                                            console.log("latest_parameters_param_id",comp.param_id,"latest_parameters_param_id",comp.param_value);
                                            arr.push('SAT_LOW');
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
                                            console.log('SAT IS Low');
                                          }else{
                                            arr.push('Sat is Good');
                                            // callback(null, arr);
                                            console.log('SAT IS GOOD');
                                          }
                                        }
                                      });
                                //     }
                                //   }
                                // );
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
            console.log("NO ALARM REGISTERED1",'---->',fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'))
          }
          });
        } else {
          console.log('NO ALARMS REGISTERED2','---->',fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
        }
      },
    (response, callback) => {
    console.log("responseSendingPossibleCauses",response)
    // controller.getPasPort((errp,resp)=>{
    //   if(errp){
    //     callback(errp)
    //   }else{
    //     controller.feedbackFrom((errf,resf)=>{
    //       if(errf){
    //         callback(errf)
    //       }else{
            // resf.forEach(feed=>{
            // if(response[0] == 'Sat is Low' || response[0] == 'Sat is High'){
              if(response[0] == 'SAT_HIGH'){
            // console.log("result of whether validation should be from DDC or AI",resf)
          //     if(feed.root_cause === "Chilled Water Control Valve Operation" && feed.cause_provider === "AI"){
          //       console.log("im here because it is AI")
          //       console.log("i have url and feature and service name here",feed)
          //       console.log("i have pas_port here",resp)
          //   let req_payload={
          //     "pas_port": resp[0].gl_value,
          //     "pas_service":JSON.parse(feed.service_keys).service,
          //     "pas_feature":JSON.parse(feed.service_keys).feature
          //   }
          //   console.log("request_payload",req_payload)
          //   let payload = {
          //     "equipment":"floor_01_ahu_03",
          //       "parameter":"CHW_Vlv_Pos",
          //       "start_time":response[3],
          //       "end_time":response[4]
          //   }
          //     sendRequestToFdd(req_payload,payload,(err,res1)=>{
          //       if(err){
          //         callback(err)
          //       }else{
          //         // console.log("inserttttttttttttttttttttt",res1,response[1])
          //         //     controller.addTriggerId(res1,response[1],(err,res)=>{
          //         //       if(err){
          //         //         callback(err)
          //         //       }else{
          //         //         console.log("inserted")
          //         //         callback(null,'inserted')
          //         //       }
          //         // })
          //       }
          //     })                          
        
          //     }else if(feed.root_cause === "Chilled Water Control Valve Operation" && feed.cause_provider === "DDC"){
          //       console.log("im here because it is DDC")
          // // controller.getInputValuesForAlarm(response[2],(err,inres)=>{
          // //   if(err){
          // //     callback(err)
          // //   }else{
          // //     controller.getLatestValuesForAlarm(response[2],(err,lateres)=>{
          // //       if(err){
          // //         callback(err)
          // //       }else{
          // //         let causes = {};
          // //         let obj = {};
          // //         // inres.forEach(input=>{
          // //         //   lateres.forEach(current=>{
          // //         //     if(response[0] == 'Sat is Low'){
          // //         //     if(input.param_id == 'CHW_Vlv_Pos_SP' && current.param_id == 'CHW_Vlv_Pos'){
          // //         //       if(input.param_value - current.param_value > 10){
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
          // //         //       }else if(input.param_value - current.param_value < -10){
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
          // //         //       }else{
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Fine'
          // //         //         console.log("CHW-valve is fine")
          // //         //       }
          // //         //     }
          // //         //     if(current.param_id == 'SAT'){
          // //         //       if(current.param_value < 10){
          // //         //         obj['SAT sensor'] = 'Faulty'
          // //         //       }else{
          // //         //         obj['SAT sensor'] = 'OK'
          // //         //         console.log("sensor is working fine")
          // //         //       }
          // //         //     }
          // //         //     if(current.param_id == 'SAF_VFD_AM_Fbk'){
          // //         //       if(current.param_value == 1){
          // //         //         obj['AHU Operation Mode'] = 'Manual'
          // //         //       }else{
          // //         //         obj['AHU Operation Mode'] = 'Auto'
          // //         //         console.log('ahu is auto mode')
          // //         //       }
          // //         //     }
          // //         //     if(current.param_id== 'OAT' && input.param_id== 'SAT_SP'){
          // //         //       if(current.param_value < input.param_value){
          // //         //         obj['OAT is lower than SAT set point'] = 'notok'
          // //         //       }else{
          // //         //         obj['OAT is lower than SAT set point'] = 'ok'
          // //         //         console.log("OAT is fine")
          // //         //       }
          // //         //     }
          // //         //     if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
          // //         //       if(input.param_value - current.param_value > 1.5){
          // //         //         obj['CWL PID loop convergence'] = 'notok'
          // //         //       }else if(input.param_value - current.param_value < -1.5){
          // //         //         obj['CWL PID loop convergence'] = 'notok'
          // //         //       }else{
          // //         //         obj['CWL PID loop convergence'] = 'ok'
          // //         //         console.log("PID tunned properly")
          // //         //       }
          // //         //     }
          // //         //     if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
          // //         //       if(input.param_value - current.param_value > 10){
          // //         //         obj['AHU Fan Speed'] = 'Mismatch'
          // //         //       }else if(input.param_value - current.param_value < -10){
          // //         //         obj['AHU Fan Speed'] = 'Mismatch'
          // //         //       }else{
          // //         //         obj['AHU Fan Speed'] = 'Fine'
          // //         //         console.log("AHU Fan Speed is Fine")
          // //         //       }
          // //         //     }
          // //         //     obj['Exhaust Damper closed and  Mixed Damper  stuck Open'] = 'Check'
                      
          // //         //   }else if(response[0] == 'Sat is High'){
          // //         //     if(input.param_id == 'CHW_Vlv_Pos_SP' && current.param_id == 'CHW_Vlv_Pos'){
          // //         //       if(input.param_value - current.param_value > 10){
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
          // //         //       }else if(input.param_value - current.param_value < -10){
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
          // //         //       }else{
          // //         //         obj['Chilled Water Control Valve Operation'] = 'Fine'
          // //         //         console.log("CHW-valve is fine")
          // //         //       }
          // //         //     }
          // //         //     if(current.param_id == 'SAT'){
          // //         //       if(current.param_value < 10){
          // //         //         obj['SAT sensor'] = 'Faulty'
          // //         //       }else{
          // //         //         obj['SAT sensor'] = 'OK'
          // //         //         console.log("sensor is working fine")
          // //         //       }
          // //         //     }
          // //         //     if(current.param_id == 'DPS_Filter'){
          // //         //       if(current.param_value == 1){
          // //         //         obj['DPS filter'] = 'Clogged' 
          // //         //       }else{
          // //         //         obj['DPS filter'] = 'Clean'
          // //         //       }
          // //         //     }
          // //         //     if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
          // //         //       if(input.param_value - current.param_value > 10){
          // //         //         obj['AHU Fan Speed'] = 'Mismatch'
          // //         //       }else if(input.param_value - current.param_value < -10){
          // //         //         obj['AHU Fan Speed'] = 'Mismatch'
          // //         //       }else{
          // //         //         obj['AHU Fan Speed'] = 'Fine'
          // //         //         console.log("AHU Fan Speed is Fine")
          // //         //       }
          // //         //     }
      
          // //         //     obj['Suspected Clogging Of Cwl Line'] = 'Check'
      
          // //         //     if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
          // //         //       if(input.param_value - current.param_value > 1.5){
          // //         //         obj['CWL PID loop convergence'] = 'notok'
          // //         //       }else if(input.param_value - current.param_value < -1.5){
          // //         //         obj['CWL PID loop convergence'] = 'notok'
          // //         //       }else{
          // //         //         obj['CWL PID loop convergence'] = 'ok'
          // //         //         console.log("PID tunned properly")
          // //         //       }
          // //         //     }
          // //         //   }
          // //         //   })
          // //         // })
          // //         // causes['SAT HIGH/LOW'] = obj;
          // //         // console.log("Im here",causes)
          // //         // controller.update_causes(causes,response[1],(err,resup)=>{
          // //         //   if(err){
          // //         //     callback(err)
          // //         //   }else{
          // //         //     callback(null, causes);        
          // //         //   }
          // //         // })
          // //       }
          // //       })
          // //       }
          // // })
          // }else{
          // //         let causes = {};
          //     let obj = {};
          //       obj['Chilled Water Control Valve Operation'] = 'Fine'
          // //         // causes['SAT HIGH/LOW'] = obj;
          // //         // console.log("Im here",causes)
          // //         // controller.update_causes(causes,response[1],(err,resup)=>{
          // //         //   if(err){
          // //         //     callback(err)
          // //         //   }else{
          // //         //     callback(null, causes);        
          // //         //   }
          // //         // })
          //     }
          //     if(feed.root_cause === "Coil efficiency" && feed.cause_provider === "AI"){
          //       console.log("im here because it is AI")
          //       console.log("i have url and feature and service name here",feed)
          //       console.log("i have pas_port here",resp)
          //         let req_payload={
          //           "pas_port": resp[0].gl_value,
          //           "pas_service":JSON.parse(feed.service_keys).service,
          //           "pas_feature":JSON.parse(feed.service_keys).feature
          //         }
          //         console.log("request_payload",req_payload)
          //         let payload = {
          //           "equipment":"floor_01_ahu_03",
          //             "parameter":"CHW_Vlv_Pos",
          //             "start_time":response[3],
          //             "end_time":response[4]
          //         }
          //     sendRequestToFdd(req_payload,payload,(err,res1)=>{
          //       if(err){
          //         callback(err)
          //       }else{
          //         // console.log("inserttttttttttttttttttttt",res1,response[1])
          //         //     controller.addTriggerId(res1,response[1],(err,res)=>{
          //         //       if(err){
          //         //         callback(err)
          //         //       }else{
          //         //         console.log("inserted")
          //         //         callback(null,'inserted')
          //         //       }
          //         // })
          //       }
          //     })   
          //     }else{
          //           //         let causes = {};
          //         let obj = {};
          //           obj['Coil efficiency'] = 'Fine'
          //           //         // causes['SAT HIGH/LOW'] = obj;
          //           //         // console.log("Im here",causes)
          //           //         // controller.update_causes(causes,response[1],(err,resup)=>{
          //           //         //   if(err){
          //           //         //     callback(err)
          //           //         //   }else{
          //           //         //     callback(null, causes);        
          //           //         //   }
          //           //         // })
          //     }
                let req_payload={
                  'service':'SAT_MISMATCH',
                  'feature': 'SAT_HIGH',
                }
                let payload = {
                  "equipment":"ahu_0101a0_om_p",
                  "causes":["valve_stuck","load_issue","IWT_setpoint","CHW_PID","sensor_fault"],
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
            }else if(response[0] == 'SAT_LOW'){

              let req_payload={
                'service':'SAT_MISMATCH',
                'feature': 'SAT_LOW',
              }
              let payload = {
                "equipment":"ahu_0101a0_om_p",
                "causes":["leaky_valve","valve_stuck","CHW_PID","sensor_fault"],
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
          // })
    //       }
    //     })
    //     }
    // })

      },
      (response, callback) => {
      // console.log('response', response);    
      // controller.generateMail(response, (err, resend) => {
      //     if (err) {
      //         callback(err);
      //     } else {
      //         callback(null, 'Alert sent');
      //     }
      // });
      // controller.sendWhatsAppMsg(response, (err,resend)=>{
      //   if(err){
      //     callback(err)
      //   }else{
      //     callback(null, 'Message Sent');
      //   }
      // })
      }
    ],
    (err, response) => {
      if (err) {
        console.log('error', err);
      } else {
        console.log('done');
      }
    }
  );
});

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


// const sendRequestToFdd = (req_payload,payload,callback)=>{
//   // let requestadress = `http://localhost:7176/f1/f2?service=FDD&feature=valve_stuck`
//   // let requestadress = `${req_payload.pas_port}/f1/f2?service=${req_payload.pas_service}&feature=${req_payload.pas_feature}`
//   let requestaddress = `http://localhost:7176/f1/f2?service=${req_payload.service}&feature=${req_payload.feature}`;
//   console.log("my final url for PAS",requestaddress)
//   // axios
//   // .post(requestadress,payload)
//   // .then((res)=>{
//   //     callback(null,res.data.request_uuid)
//   //     // callback(null,res.data.param)
//   // })
//   // .catch((err)=>{
//   //   callback(null,"Error from FDD")
//   // })
// }

// let res12 = res_pas[0].pas_res
// console.log("result is",(res12))
// console.log("results want",res12.result)
// // console.log("responsessssss",res_pas[0].pas_res)
//   if(res_pas[0].pas_res.result == "faulty"){
//     obj['Chilled Water Control Valve Operation'] = 'Faulty'
//   }else{
//     obj["Chilled Water Control Valve Operation"]="Fine"
//   }
// causes['SAT HIGH/LOW'] = obj;
// console.log("Im here",causes)
// controller.update_causes(causes,response[1],(err,resup)=>{
//   if(err){
//     callback(err)
//   }else{
//     callback(null, causes);        
//   }
// })   
// if(res === 'faulty'){
//   obj['Chilled Water Control Valve Operation'] = 'Faulty'
// }else{
//   obj["Chilled Water Control Valve Operation"]="Fine"
// }

// let cm_arr =[]
// let est_arr =[]
//   sendRequestToFdd(payload,(err,res)=>{
//     console.log("estimate_arr",res)
//     let estimation=res
//     estimation.forEach(est=>{
//       let mea_value = (est.measured)
//       cm_arr.push(mea_value)
//       let est_value = (est.estimated)
//       est_arr.push(est_value)
//     })
//     let cm_avg = cm_arr.reduce((prev,data)=>data+prev,0)/cm_arr.length * 100
//     // console.log("est_arr",est_arr)
//     let est_avg = est_arr.reduce((prev,data)=>data+prev,0)/est_arr.length * 100
//     let cm_var = math.variance(cm_arr)/cm_arr.length * 100
//     console.log("Command_Variance",cm_var)
//     let est_var = math.variance(est_arr)/est_arr.length * 100
//     console.log("Estimated_Variance",est_var)
//     console.log("cm_avg",cm_avg)
//     console.log("est_avg",est_avg)
//     if(cm_avg - est_avg > 0.5 || cm_avg - est_avg < -0.5){
//       obj['Chilled Water Control Valve Operation'] = 'Faulty'
//     }else{
//       obj["Chilled Water Control Valve Operation"]="Fine"
//     }
//     causes['SAT HIGH/LOW'] = obj;
//     console.log("Im here",causes)
//     controller.update_causes(causes,response[1],(err,resup)=>{
//       if(err){
//         callback(err)
//       }else{
//         callback(null, causes);        
//       }
//     })
//   })
///////////////////////////////////////////////////////////////////////////////////////////////////////////
// sendRequestToFdd(payload,(err,res)=>{
//   if(err){
//     callback(err)
//   }else{
//     if(res === 'faulty'){
//       obj['Chilled Water Control Valve Operation'] = 'Faulty'
//     }else{
//       obj["Chilled Water Control Valve Operation"]="Fine"
//     }
//     causes['SAT HIGH/LOW'] = obj;
//     console.log("Im here",causes)
//     controller.update_causes(causes,response[1],(err,resup)=>{
//       if(err){
//         callback(err)
//       }else{
//         callback(null, causes);        
//       }
// })
//   }
// })
///////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////important////////////////////////////
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
    //         // inres.forEach(input=>{
    //         //   lateres.forEach(current=>{
    //         //     if(response[0] == 'Sat is Low'){
    //         //     if(input.param_id == 'CHW_Vlv_Pos_SP' && current.param_id == 'CHW_Vlv_Pos'){
    //         //       if(input.param_value - current.param_value > 10){
    //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
    //         //       }else if(input.param_value - current.param_value < -10){
    //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
    //         //       }else{
    //         //         obj['Chilled Water Control Valve Operation'] = 'Fine'
    //         //         console.log("CHW-valve is fine")
    //         //       }
    //         //     }


    //         //     if(current.param_id == 'SAT'){
    //         //       if(current.param_value < 10){
    //         //         obj['SAT sensor'] = 'Faulty'
    //         //       }else{
    //         //         obj['SAT sensor'] = 'OK'
    //         //         console.log("sensor is working fine")
    //         //       }
    //         //     }
    //         //     if(current.param_id == 'SAF_VFD_AM_Fbk'){
    //         //       if(current.param_value == 1){
    //         //         obj['AHU Operation Mode'] = 'Manual'
    //         //       }else{
    //         //         obj['AHU Operation Mode'] = 'Auto'
    //         //         console.log('ahu is auto mode')
    //         //       }
    //         //     }
    //         //     if(current.param_id== 'OAT' && input.param_id== 'SAT_SP'){
    //         //       if(current.param_value < input.param_value){
    //         //         obj['OAT is lower than SAT set point'] = 'notok'
    //         //       }else{
    //         //         obj['OAT is lower than SAT set point'] = 'ok'
    //         //         console.log("OAT is fine")
    //         //       }
    //         //     }

    //         //     if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
    //         //       if(input.param_value - current.param_value > 1.5){
    //         //         obj['CWL PID loop convergence'] = 'notok'
    //         //       }else if(input.param_value - current.param_value < -1.5){
    //         //         obj['CWL PID loop convergence'] = 'notok'
    //         //       }else{
    //         //         obj['CWL PID loop convergence'] = 'ok'
    //         //         console.log("PID tunned properly")
    //         //       }
    //         //     }
    //         //     if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
    //         //       if(input.param_value - current.param_value > 10){
    //         //         obj['AHU Fan Speed'] = 'Mismatch'
    //         //       }else if(input.param_value - current.param_value < -10){
    //         //         obj['AHU Fan Speed'] = 'Mismatch'
    //         //       }else{
    //         //         obj['AHU Fan Speed'] = 'Fine'
    //         //         console.log("AHU Fan Speed is Fine")
    //         //       }
    //         //     }
    //         //     obj['Exhaust Damper closed and  Mixed Damper  stuck Open'] = 'Check'
                
    //         //   }else if(response[0] == 'Sat is High'){
    //         //     if(input.param_id == 'CHW_Vlv_Pos_SP' && current.param_id == 'CHW_Vlv_Pos'){
    //         //       if(input.param_value - current.param_value > 10){
    //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
    //         //       }else if(input.param_value - current.param_value < -10){
    //         //         obj['Chilled Water Control Valve Operation'] = 'Faulty'
    //         //       }else{
    //         //         obj['Chilled Water Control Valve Operation'] = 'Fine'
    //         //         console.log("CHW-valve is fine")
    //         //       }
    //         //     }
    //         //     if(current.param_id == 'SAT'){
    //         //       if(current.param_value < 10){
    //         //         obj['SAT sensor'] = 'Faulty'
    //         //       }else{
    //         //         obj['SAT sensor'] = 'OK'
    //         //         console.log("sensor is working fine")
    //         //       }
    //         //     }
    //         //     if(current.param_id == 'DPS_Filter'){
    //         //       if(current.param_value == 1){
    //         //         obj['DPS filter'] = 'Clogged' 
    //         //       }else{
    //         //         obj['DPS filter'] = 'Clean'
    //         //       }
    //         //     }
    //         //     if(input.param_id == 'SAF_VFD_Speed' && current.param_id == 'SAF_VFD_Speed_Fbk'){
    //         //       if(input.param_value - current.param_value > 10){
    //         //         obj['AHU Fan Speed'] = 'Mismatch'
    //         //       }else if(input.param_value - current.param_value < -10){
    //         //         obj['AHU Fan Speed'] = 'Mismatch'
    //         //       }else{
    //         //         obj['AHU Fan Speed'] = 'Fine'
    //         //         console.log("AHU Fan Speed is Fine")
    //         //       }
    //         //     }

    //         //     obj['Suspected Clogging Of Cwl Line'] = 'Check'

    //         //     if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
    //         //       if(input.param_value - current.param_value > 1.5){
    //         //         obj['CWL PID loop convergence'] = 'notok'
    //         //       }else if(input.param_value - current.param_value < -1.5){
    //         //         obj['CWL PID loop convergence'] = 'notok'
    //         //       }else{
    //         //         obj['CWL PID loop convergence'] = 'ok'
    //         //         console.log("PID tunned properly")
    //         //       }
    //         //     }

    //         //   }
    //         //   })
    //         // })
    //         // causes['SAT HIGH/LOW'] = obj;
    //         // console.log("Im here",causes)
    //         // controller.update_causes(causes,response[1],(err,resup)=>{
    //         //   if(err){
    //         //     callback(err)
    //         //   }else{
    //         //     callback(null, causes);        
    //         //   }
    //         // })
    //       }
    //       })
    //       }
    // })
////////////////////////////////////////////////////////////////////////////////////////////////            
  //           if(response[0] == 'Sat is Low'){
  //             let payload = {
  //               "equipment":"floor_01_ahu_03",
  //                 "parameter":"CHW_Vlv_Pos",
  //                 "start_time":response[3],
  //                 "end_time":response[4]
  //             }
  // sendRequestToFdd(payload,(err,res1)=>{
  //   if(err){
  //     callback(err)
  //   }else{
  //     console.log("inserttttttttttttttttttttt",res1,response[1])
  //         controller.addTriggerId(res1,response[1],(err,res)=>{
  //           if(err){
  //             callback(err)
  //           }else{
  //             console.log("inserted")
  //             callback(null,'inserted')
  //           }
  //         })
  //   }
  // })              
              
    //}
    /////////////////////////////important/////////////////////////////////////////////////////////////