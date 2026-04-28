const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
const send_pbs_request = require('../Validate_Alarms/PBS_REQUEST')

schedule.scheduleJob('*/5 * * * * *', ()=>{
    async.waterfall([
        callback => {
            controller.alarmToValidate((err, results) => {
              if (err) {
                callback(err);
              } else {
                callback(null, results);
              }
            });
          },
          (response,callback)=>{
            console.log("response",response)
            if(response.length > 0){
                let req_payload={
                    'service':'CHILLER',
                    'feature': 'MISMATCH',
                  }
                  let payload = {
                    "equipment":"chiller",
                  }
                  console.log("payloads",req_payload,payload)
                  if(response[0].alarm_code === '331'){

                      if(response[0].message == "DP high and SP normal"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:36:33",
                       payload["end_time"]="2023-07-12 18:36:33"
                      }else if(response[0].message == "DP high and SP high"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:37:33",
                       payload["end_time"]="2023-07-12 18:37:33"
                      }else if(response[0].message == "DP normal, SP low and DT normal"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:38:33",
                       payload["end_time"]="2023-07-12 18:38:33"
                      }else if(response[0].message == "DP low and SP low"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:39:33",
                       payload["end_time"]="2023-07-12 18:39:33"
                      }else if(response[0].message == "DP normal, SP high and DT low"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:40:33",
                       payload["end_time"]="2023-07-12 18:40:33"
                      }else if(response[0].message == "DP normal, SP low and DT high"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:41:33",
                       payload["end_time"]="2023-07-12 18:41:33"
                      }else if(response[0].message == "DP normal, SP normal and DT high"){
                       console.log("Im here")
                       payload["start_time"]="2023-07-12 18:42:33",
                       payload["end_time"]="2023-07-12 18:42:33"
                      }else{
                       console.log("Im not here")
                      } 
                   controller.validatedAlarm(response[0].id,(err,results3)=>{
                       if(err){
                           callback(err)
                       }else{
                           send_pbs_request.sendRequestToFdd(req_payload,payload,(err,res1)=>{
                               if(err){
                         callback(err)
                       }else{
                         console.log("It is response from PBS request",res1,response[0].id)
                             controller.addTriggerId(res1,response[0].id,(err,res)=>{
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
                  })
                  }else{
                    console.log("no chiller alarm")
                  }
            }else{
                console.log("NO ALARMS REGISTERED")
            }
          }
    ])
})