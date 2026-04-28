const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });

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
            response.forEach(devId =>{
                if(devId.message == 'Fire_Alarm'){
                    console.log("IM here")
                    let arr = [];
                    arr.push('Fire_Alarm');
                    arr.push(devId.id);
                    arr.push(devId.ss_id);
                    controller.getParent(devId.ss_id,(err,res1)=>{
                        if(err){
                            callback(err)
                        }else{
                            console.log("myresponse",res1[0].ss_address_value)
                            let ip=res1[0].ss_address_value;
                            let data_param='active'
                            //http://localhost:7080/write/192.168.1.30/5:70/presentValue/active/-/16
                            let requestAdress=`http://localhost:7080/write/${ip}/5:70/presentValue/${data_param}/-/16`
                            console.log("requestaddress",requestAdress)
                            axios
                            .get(requestAdress)
                            .then((res)=>{
                                controller.validatedAlarm(devId.id,(err,results3)=>{
                                    if(err){
                                        callback(err)
                                    }else{
                                        callback(null,arr)
                                    }
                                   })
                            })
                            .catch((err)=>{
                                console.log(err)
                            })
                        }
                    })
                }else{
                    console.log("NO ALARM REGISTERED")
                }
            })
        } else {
          console.log('NO ALARMS REGISTERED');
        }
      },
    (response, callback) => {
        console.log("2nd response",response)
            let causes = {}
            let obj ={}
            obj['Fire Alarm'] = 'Present'
            causes['Fire_Alarm'] = obj;
            controller.update_causes(causes,response[1],(err,resup)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,causes);
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

