const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');

schedule.scheduleJob('*/7 * * * * *', () => {
  async.waterfall(
    [
       callback =>{
        controller.alarmLatestValue((err,results)=>{
            if(err){
                callback(err)
            }else{
                callback(null,results)
            }
        })
       }
       ,(response,callback)=>{
        //   console.log("response",response)
        let count=0
        let ala_ar=[]   
          const groupedData = response.reduce((acc, obj) => {
            const key = obj.ss_id;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
          }, {});
          
          console.log(groupedData);

            controller.getAlarmData(groupedData,(err,results)=>{
                if(err){
                    callback(err)
                }else{
                   console.log("alarm called")
                }
            })
       }
    ],
    (err, response) => {
      if (err) {
        console.log('error', err);
      } else {
        console.log("my final response",response)
      }
    }
  );
});
