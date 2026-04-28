const schedule = require('node-schedule');
 const controller = require('./controller');
 const async = require('async');


 schedule.scheduleJob('01,16,31,46,59 * * * * ', () =>{
    async.waterfall(
        [
            callback =>{
                controller.getEnergyDevice("NONGL_SS_EMS",(err,results)=>{
                    if(err){
                        callback(err)
                    }else{
                        callback(err, results)
                    }
                })
            },
            (response,callback) =>{
                // console.log("response",response)
                response.forEach(element => {
                    controller.getLatestEnergyData(element.id,element.ss_tag,(err,results)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(null,results)
                        }
                    })
                });
            },
            (response,callback)=>{
                // console.log("response",response)
            }
        ]
    )
 })