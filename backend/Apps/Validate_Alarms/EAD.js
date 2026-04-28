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
              devId.message == 'Exhaust Air Damper-Position Mismatch'
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
                                // results1.forEach(comp => {
                                // controller.getInputValuesForAlarm(
                                //   comp.ss_id,
                                //   (err, results2) => {
                                //     if (err) {
                                //       callback(err);
                                //     } else {
                                      let arr = [];
                                      // console.log("results2",results2)
                                      // results2.forEach(input => {
                                          // console.log("comp.param_id",input.param_id)
                                          //checking their parameters
                                        // if (comp.param_id == 'EA_Dmpr_Pos' &&
                                        // input.param_id ==
                                        //   'EA_Dmpr_Pos_SP') {
                                          // console.log('valueeeOA_Dmpr_Pos',comp.param_value);
                                            arr.push('EA_Dmpr_Pos Mismatch');
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
                                            console.log('EA_Dmpr_Pos Mismatch');
                                            // console.log("alarm_code",devId.alarm_code)
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
                if(response[0] == 'EA_Dmpr_Pos Mismatch'){
                  if(current.param_id == 'SAF_VFD_AM_Fbk'){
                    if(current.param_value == 1){
                      obj['AHU Operation Mode'] = 'Manual'
                    }else{
                      obj['AHU Operation Mode'] = 'Auto'
                      console.log('ahu is auto mode')
                    }
                  }
                  obj['EAD damper position'] = 'Check'
              }
              })
            })
            causes['EA_Dmpr_Pos Mismatch'] = obj;
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
