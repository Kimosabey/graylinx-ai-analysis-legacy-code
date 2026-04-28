const schedule = require('node-schedule');
const bacnet=require('../../hvacBACnetClient');
const { compareAsc, format } = require('date-fns');
const model = require('./model');
const rule = new schedule.RecurrenceRule();


// const rule2 = new schedule.RecurrenceRule();

// rule2.dayOfWeek = [new schedule.Range(1,5)];
// rule2.hour = 15;
// rule2.minute = 47;

// const job = schedule.scheduleJob(rule2, function(){
//     let ip='192.168.1.120'
//     let time=moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
//     let  propArr=[{ type: 4, value : null}];
//     bacnet.myWritePropertyNew(ip,2,100,85,propArr,(error,result4)=>{
//     //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
//         if(error){
//           callback(error)
//         }else{
//             //logger.error("ACTION:  system scheduletruned On"+time)
//             console.log('scheduletruned off on 8',time);
//         }
//   })
// })

rule.dayOfWeek = [new schedule.Range(1,5)];
rule.hour = 18;
rule.minute = 00;
const job1 = schedule.scheduleJob(rule, function(){
  let ip='192.168.1.120'
  let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  let  propArr=[{ type: 4, value : null}];
  bacnet.myWritePropertyNew(ip,2,100,85,propArr,(error,result4)=>{
  //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
      if(error){
       console.log("please connect to network not scheduled")
      }else{
         // logger.error("ACTION:  system scheduletruned off"+time)
          console.log('scheduletruned 8 off',time);
          setTimeout(() => {
              let ip='192.168.1.120'
              let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
              let  propArr=[{ type: 4, value : 0}];
              bacnet.myWritePropertyNewsch(ip,2,100,85,propArr,(error,result4)=>{
              //bacnet.myWritePropertyNew(ip,result3[0].ss_tag,result3[0].ss_address_value,85,propArr,(error,result4)=>{
                  if(error){
                   console.log("please connect to network not scheduled")
                  }else{
                     // logger.error("ACTION:  system scheduletruned off"+time)
                      
                      const data={param_value:0,param_id:"ahu_on_off_sp"}
                      model.insertSetpointBac('01f8d696-5abc-4ba1-a3be-415bedaed456',data,(error,result)=>{
                        if(error){
                          callback(error)
                        }else{
                            console.log('scheduletruned 16 off',time);
                         // callback(null,{"message":'ACCEPTED'})
                        }
                      })
                  }
            })
        
          }, 10000);
      }
})
})

