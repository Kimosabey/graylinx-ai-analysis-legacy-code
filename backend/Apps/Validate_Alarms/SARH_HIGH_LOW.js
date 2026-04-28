const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');

// schedule.scheduleJob('*/15 * * * *', () => {
schedule.scheduleJob('*/5 * * * * *', () => {
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
              devId.message == 'Supply Air Relative Humidity Mismatch'
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
                      time(devId.created_at,(err,res)=>{
                        if(err){
                          callback(err)
                        }else{
                          console.log('ress',res);
                          if(res == 'THERE IS A ALARM'){
                            // console.log("msg",devId.message)
                            // checking which alarm is this
                                results1.forEach(comp => {
                                controller.getInputValuesForAlarm(
                                  comp.ss_id,
                                  (err, results2) => {
                                    if (err) {
                                      callback(err);
                                    } else {
                                      let arr = [];
                                      // console.log("results2",results2)
                                          // console.log("comp.param_id",input.param_id)
                                          //checking their parameters
                                        if(comp.param_id == 'SARH'){
                                          console.log('valueeeSARH',comp.param_value);
                                          if (comp.param_value > 60) {
                                            arr.push('SARH is High');
                                            arr.push(devId.id);
                                            arr.push(devId.ss_id);
                                            // arr.push(input.param_value);
                                            controller.validatedAlarm(devId.id,(err,results3)=>{
                                              if(err){
                                                  callback(err)
                                              }else{
                                                  callback(null,arr)
                                              }
                                             })
                                            console.log('SARH IS HIGH');
                                            // console.log("alarm_code",devId.alarm_code)
                                          } else if(comp.param_value < 30){
                                            arr.push('SARH is Low');
                                            arr.push(devId.id);
                                            arr.push(devId.ss_id);
                                            // arr.push(input.param_value);
                                            controller.validatedAlarm(devId.id,(err,results3)=>{
                                              if(err){
                                                  callback(err)
                                              }else{
                                                  callback(null,arr)
                                              }
                                             })
                                            console.log('SARH IS Low');
                                          }else{
                                            arr.push('SARH is Good');
                                            // callback(null, arr);
                                            console.log('SARH IS GOOD');
                                          }
                                        }
                                    }
                                  }
                                );
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
            console.log("NO ALARM REGISTERED")
          }
          });
        } else {
          console.log('NO ALARMS REGISTERED');
        }
      },
    (response, callback) => {
    console.log("responseSendingPossibleCauses",response)
    controller.getInputValuesForAlarm(response[2],(err,inres)=>{
      if(err){
        callback(err)
      }else{
        controller.getLatestValuesForAlarm(response[2],(err,lateres)=>{
          if(err){
            callback(err)
          }else{
            let causes = {};
            let obj = {};
            inres.forEach(input=>{
              lateres.forEach(current=>{
                if(response[0] == 'SARH is High' || response[0] == 'SARH is Low'){
                if(input.param_id == 'CHW_Vlv_Pos_SP' && current.param_id == 'CHW_Vlv_Pos'){
                  if(input.param_value - current.param_value > 10){
                    obj['Chilled Water Control Valve Operation'] = 'Faulty'
                  }else if(input.param_value - current.param_value < -10){
                    obj['Chilled Water Control Valve Operation'] = 'Faulty'
                  }else{
                    obj['Chilled Water Control Valve Operation'] = 'Fine'
                    console.log("CHW-valve is fine")
                  }
                }
                if(current.param_id == 'SARH'){
                  if(current.param_value < 30){
                    obj['SARH sensor'] = 'Faulty'
                  }else if(current.param_value > 60){
                    obj['SARH sensor'] = 'Faulty'
                  }else{
                    obj['SARH sensor'] = 'Fine'
                    console.log("sensor is working fine")
                  }
                }

                obj['Suspected Clogging Of Cwl Line'] = 'Check'

                if(current.param_id == 'SAF_VFD_AM_Fbk'){
                  if(current.param_value == 1){
                    obj['AHU Operation Mode'] = 'Manual'
                  }else{
                    obj['AHU Operation Mode'] = 'Auto'
                    console.log('ahu is auto mode')
                  }
                }
                if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
                  if(input.param_value - current.param_value > 1.5){
                    obj['CWL PID loop convergence'] = 'notok'
                  }else if(input.param_value - current.param_value < -1.5){
                    obj['CWL PID loop convergence'] = 'notok'
                  }else{
                    obj['CWL PID loop convergence'] = 'ok'
                    console.log("PID tunned properly")
                  }
                }
              }
              })
            })
            causes['SARH HIGH/LOW'] = obj;
            console.log("Im here",causes)
            controller.update_causes(causes,response[1],(err,resup)=>{
              if(err){
                callback(err)
              }else{
                callback(null, causes);        
              }
            })
          }
        })
      }
    })

      },
      (response, callback) => {
         console.log('response', response);
                // controller.generateMail(response, (err, resend) => {
                //     if (err) {
                //         callback(err);
                //     } else {
                //         callback(null, 'Alert sent');
                //     }
                // });
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

const time = (createdtime, callback) => {
  let createTime = createdtime;
  // console.log("createdtime",createdtime)
  let currentTime = fns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  //  console.log("currentTime",currentTime)
  const alarmTime = differenceInMinutes(
    new Date(currentTime),
    new Date(createTime)
  );
  console.log('alarm triggered time', alarmTime);
  if (alarmTime > 60) {
    callback(null, 'THERE IS A ALARM');
  } else {
    callback(null, 'NO ALARM');
  }
};
