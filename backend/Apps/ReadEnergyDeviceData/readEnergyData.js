const schedule = require('node-schedule');
 const controller = require('./controller');
 const { compareAsc, format } = require('date-fns');
 const bacnet = require('../../hvacBACnetClient');
const { toFixed } = require('../../Utils/common');
const async = require('async');

schedule.scheduleJob('*/5 * * * *', () => {
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
      (response,callback) => {
        // console.log("response",response)
      let count = 0;
      if(response.length > 0){
        response.forEach(element => {
          controller.getDagDevice(element.ss_parent,(err,results)=>{
            if(err){
              callback(err)
            }else{
              results.forEach(ele => {
                // console.log("results",results)
                let bacnetIp = ele.ss_address_value;
                  bacnet.getMyAHUStatus(bacnetIp, (err,results)=>{
                      if(err){
                          callback(err)
                      }else{
                          let energyData = results
                          controller.addEnergyData(element.id,energyData,element.ss_tag,(err,results)=>{
                              if(err){
                                  callback(err)
                              }else{
                                count++;
                                if(response.length == count){
                                  callback(null, response)
                                }
                              }
                          })
                      }
                  })
              });
            }
          })    
        });
      }else{
        console.log("no data available")
      }
      }

    ],
    (err, response) => {
      if (err) {
        console.log('error', err);
      } else {
        //  console.log("dataalaram",response)
      }
      //  console.log("data-----------------------final data", response)
    }
  );
});

