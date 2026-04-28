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
                                      results2.forEach(input => {
                                          // console.log("comp.param_id",input.param_id)
                                          //checking their parameters
                                        if (comp.param_id == 'SAT' &&
                                        input.param_id ==
                                          'SAT_SP') {
                                          console.log('valueeeSAT',comp.param_value);
                                          if (comp.param_value > 27) {
                                            arr.push('Sat is High');
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
                                            console.log('SAT IS HIGH');
                                            // console.log("alarm_code",devId.alarm_code)
                                          } else if(comp.param_value < 17){
                                            arr.push('Sat is Low');
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
                                            console.log('SAT IS Low');
                                          }else{
                                            arr.push('Sat is Good');
                                            // callback(null, arr);
                                            console.log('RAT IS GOOD');
                                          }
                                        }
                                      });
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
            let dwn ={}
            inres.forEach(input=>{
              lateres.forEach(current=>{
                if(response[0] == "Sat is Low" || "Sat is High"){
                   obj['Coil Health Fouling'] = 'check'
                    if(input.param_id == 'SAT_SP' && current.param_id == 'SAT'){
                        if(input.param_value - current.param_value > 1.5){
                            console.log("Im low")
                           dwn['Stuck Open - Excess cooling - SAT LOW'] = "check"
                           dwn["Stuck midpoint - Fluctuations"] = "check"
                           dwn["Partial open/close - normal up to a point"]= "check"
                           dwn["Slack - lack - slow"]= "check"
                           dwn["Valve leakage - Cooling when valve is closed"]= "check"
                            obj['CWL VALVE'] = dwn
                          }else if(input.param_value - current.param_value < -1.5){
                            console.log("Im High")
                           dwn['Stuck close - NO cooling - SAT HIGH']= "check"
                           dwn["Stuck midpoint - Fluctuations"]= "check"
                           dwn["Partial open/close - normal up to a point"]= "check"
                           dwn["Slack - lack - slow"]= "check"
                           dwn["Valve leakage - Cooling when valve is closed"]= "check"
                            obj['CWL VALVE'] = dwn
                          }else{
                            console.log("CWL Valve Ok")
                          }
                    }
                   obj["Cold Water Temperature"]= "check"
                   obj["Load set point, OAT, Dampers"]= "check"
                   obj["PID - tunning"]= "check"
                }
              })
            })
            causes['SAT HIGH/LOW'] = obj;
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
