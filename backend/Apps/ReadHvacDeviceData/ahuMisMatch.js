const schedule = require('node-schedule');
const controller = require('./controller');
const { compareAsc, format } = require('date-fns');
const bacnet = require('../../hvacBACnetClient');
const { toFixed } = require('../../Utils/common');
const async = require('async');
const models = require('./model');


var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 2);

schedule.scheduleJob(rule, function(){

    models.getLatestAhuOnOffInput((err2,results2)=>{
        if(err2){
          callback(err2)
        }else{
          models.getLatestAhuOnOffOutput((err1,results1)=>{
            if(err1){
                callback(err1)
            }else{
                let inp=parseInt(results2[0].param_value)?1:0
                if(inp!=parseInt(results1[0].param_value)){
                    let ip='192.168.1.120'
                    let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                    let  propArr=[{ type: 4, value : null}];
                    console.log("command to send",parseInt(results2[0].param_value))
                    bacnet.myWritePropertyNew(ip,2,100,85,propArr,(error,result4)=>{
                    //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
                        if(error){
                          // callback(error)
                          console.log("please connect to network not scheduled")
                        }else{
                            //logger.error("ACTION:  system scheduletruned On"+time)
                            console.log('scheduletruned 8 On',time);
                            setTimeout(() => {
                              let ip='192.168.1.120'
                              let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                              let  propArr=[{ type: 4, value : parseInt(results2[0].param_value) }];
                              bacnet.myWritePropertyNewsch(ip,2,100,85,propArr,(error,result4)=>{
                              //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
                                  if(error){
                                    // callback(error)
                                    console.log("please connect to network not scheduled")
                                  }else{
                                      //logger.error("ACTION:  system scheduletruned On"+time)
                                      console.log('mismatch fixed On 16 ',time);
                                      
                                     
                                  }
                            })
                            }, 10000);
                        }
                  })
                }else{
                    console.log("no mismatch in supply fan status")
                }
            }
          })
         
        }
      })
})







