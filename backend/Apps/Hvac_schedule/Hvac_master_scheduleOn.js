const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const axiosc = require('axios');
const https = require('https');
const logger = require('../../Config/logger');
const bacnet = require('../../hvacBACnetClient');
const e = require('express');
const { compareAsc, format } = require('date-fns');
const { time } = require('console');
const { slice } = require('lodash');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const axios = axiosc.create({ httpsAgent });

schedule.scheduleJob('*/5 * * * * *', () => {
//schedule.scheduleJob('12,27,42,57 * * * *', () => {
    // schedule.scheduleJob('57,27 * * * *', () => {
      async.waterfall(
        [
          callback => {
            controller.getSchedule((err, result) => {
              if (err) {
                callback(err);
              } else {
                //console.log(JSON.parse(result))
                callback(err, JSON.parse(result));
              }
            });
          },
          (response, callback) => {
            console.log("------------erespons--------",response)
            if (response.length !== 0) {
              const next_data = [];
              let data = {};
             response.forEach(element => {
               var weekda = JSON.parse(element.data).weekData
               var timeda = JSON.parse(element.data).timeData
               var intensity = JSON.parse(element.data).intensity
               var starttime = element.start
               console.log("starttime",starttime)
               console.log("intensity",intensity)
                console.log("time",timeda)
                console.log("week",weekda)
                timeda.forEach(timedata => {
                  console.log("timedata",(timedata.ON))
                controller.getAhuInfo((err,results)=>{
                    if(err){
                        callback(err)
                    }else{
                        if(results.length>0){
                        results.forEach(ahuinfo=>{
                            if(ahuinfo.name=="ahu_on_off_sp"){
                                data["ip"]=ahuinfo.ip
                                data["ObjectId"]=ahuinfo.objectId
                                data["ObjectInstance"]=ahuinfo.objectInstance
                                data["Action"]=intensity
                                data["starttime"]=starttime
                                data["time"]=timedata.ON
                                data["week"]=weekda
                                next_data.push(data)
                                console.log("nextdata",next_data)
                            }else{
                                console.log("no data")
                            }
                        })
                    }else{
                        console.log("no record found")
                    }
                    }
                })
                });
             });
             setTimeout(() => callback(null, next_data), 200);
             console.log("------",next_data)
           
           } else {
              callback('empty');
            }
          }
        ],
        (err, response) => {
            if(err){
                console.log(err)
                console.log('Schedule Empty')
            }else{
         console.log("response",response)
         if(response.length !== 0){
         response.forEach(res=>{
            const ip = res.ip
            const objId = res.ObjectId
            const ObjIns = res.ObjectInstance
            const payload = res.Action
            const start = res.starttime
            const ruletime = res.time
            console.log("ruletime",ruletime.slice(0,2))
            console.log("ruletime",ruletime.slice(3,5))
            const ruleweek = res.week
            schedule.scheduleJob(start, start, () => {
                const rule = new schedule.RecurrenceRule();
                rule.dayOfWeek = ruleweek;
                rule.hour = ruletime.slice(0,2);
                rule.minute = ruletime.slice(3,5);
            schedule.scheduleJob(rule, function(){
              let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
              let  propArr=[{ type: 4, value : null}];
                    bacnet.myWritePropertyNew(ip,objId,ObjIns,85,propArr,(error,result4)=>{
                        if(error){
                          console.log("please connect to network not scheduled")
                        }else{
                            console.log('scheduletruned 8 On',time);
                            setTimeout(() => {
                              let time=format(new Date(), 'yyyy-MM-dd HH:mm:ss');
                              let  propArr=[{ type: 4, value : payload}];
                              bacnet.myWritePropertyNewsch(ip,objId,ObjIns,85,propArr,(error,result4)=>{
                                  if(error){
                                    console.log("please connect to network not scheduled")
                                  }else{
                                      console.log('scheduletruned On 16 ',time);
                                  }
                            })
                            }, 10000);
                        }
                  })
                })
              });
         })
        }
        }
        }
      );
    });