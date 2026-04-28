const model = require('./model');
const _ = require('lodash');
const { compareAsc, format } = require('date-fns');
const player = require('node-wav-player');
const notifier = require('node-notifier');
const fns = require('date-fns');
const json = require('body-parser/lib/types/json');

const getAhus = (callback)=>{
    model.getAhus((err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const latestValues =(id,callback)=>{
    model.latestValues(id,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const getAlarmData=(alData,callback)=>{
  let alCount=0
  let id = [];
  let data = [];
  let maxAl=Object.keys(alData).length
  let alcount=0
  for (let key in alData) {
      console.log(key + ": " + alData[key]);
      // id.push(key);
      // data.push(alData[key]);
      addAhuDeviceData(key,alData[key],(err,response)=>{
        alcount++;
        // console.log(`${alcount}===${maxAl}`)
        if(err){
          callback(err)
        }else{
          if(alcount===maxAl){  
            console.log(`==================DOING CALLBACK===================`)
            callback(null,response)
          }
        }
      })
    }
  }

const addAhuDeviceData = (id,AhuData, callback) => {
  // console.log('ahuData', Object.values(AhuData));
  // console.log('ahuid', id);
  let insertData = [];
  // let alarmdata = [];
  let updateAlarm=[];
  let restoredata=[];
  let count =0
  // let temp ={}
  if(Object.values(AhuData) && Object.values(AhuData).length>0){
  //   let count=0
  //   Object.values(AhuData).forEach(element => {
      // console.log("neededinfo",element.param_value,element.param_id)
      //   let temp = getAHUAlarm(element.param_value,element.param_id,element.measured_time)
        // console.log("remp=.",temp,"elemny",element)
      //   alarmdata.push(temp)
      //   count++
      //   if(count==Object.values(AhuData).length){
          // alarmdata = [].concat(...alarmdata);
          // console.log("alaram data",alarmdata)
          // console.log("idssssssssss for alarm information",id)
          model.ahuAlarmInfo(id,(err1,results1)=>{
            // console.log("==================>result1",results1,alarmdata)
            if(err1){
              callback(err1)
            }else{
              if(results1.map(e=>e.acknowledged)==1){
                console.log("Successfully acknowledged")
      
              }else{
                console.log("Acknowledge to be done")
                let mypath = __dirname + '/../../Images/Buzzer.wav';
                // notifier.notify(
                //   {
                //     //  title: 'notification',                
                //     //  message: 'hello',
                //     //  sound: true, // true | false.
                //     //  time: 5000, // How long to show balloon in ms
                //     //  wait: true, // Wait for User Action against Notification
                //     //  type: 'info',
                //       },
                //      function(err, action) {
                //       // console.log('Action:', action);
                //       if(action=="activate")
                //       open('http://localhost:3000');
                //    },
                //    player.play({
                //     path: mypath,
                //   }).then(() => {
                //   //   console.log('Buzzer has started');
                //   }).catch((error) => {
                //     console.error(error);
                //   })
                //  );
      
              }
              if(results1.length>0){
                //if alarm are exsiting
                let alarm=[]
                re1Count=0
                if(AhuData.length>0){
                AhuData.forEach(alarmInfo=>{
                    let ad=results1.filter(m=>m.ss_id===alarmInfo["ss_id"] && m.alarm_code === alarmInfo['alarm_code'])
                    //  console.log("ad----------",ad)
                    if(ad.length==0){
                      re1Count++
                      if(alarmInfo['message']!='' && alarmInfo['message']!=undefined){
                          let data = [];    
                          data.push(id);
                          // data.push('201');
                          data.push(alarmInfo['alarm_code']);
                          data.push(alarmInfo['message']);
                          data.push(alarmInfo['param_id']);
                          data.push(fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"))
                          insertData.push(data);
                      }
                      //  console.log("resssstrue=>",re1Count,AhuData)
                      if(re1Count===AhuData.length){
                        // console.log("-----------true---------------->",updateAlarm)
                        if(insertData.length+updateAlarm.length>0){
                        //   console.log("----------------insert_control",insertData)
                        //  console.log("------------------update_control",updateAlarm)
                          //restore data
                          let countre=0
                          // console.log("results1111111111111111",results1)
                          results1.forEach(res => {          
                            let r=[]
                           r = AhuData.find(e =>(parseInt(e["alarm_code"]) === parseInt(res.alarm_code)));
                          //  console.log(`=====${e['alarm_code']}=====${res.alarm_code}====`);
                          //  console.log("rrrr",r)
                           if(r===undefined){
                             restoredata.push(res)
                             countre++
                             if(countre==results1.length){
                              console.log("restoredatat1",restoredata)
                              model.addAlarmData(insertData,updateAlarm,restoredata, (err, results) => {
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null, results);
                                }
                              });
                             }
                           }else{
                            countre++
                            if(countre==results1.length){
                              console.log("restoredatat2",restoredata)
                              model.addAlarmData(insertData,updateAlarm,restoredata, (err, results) => {
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null, results);
                                }
                              });
                             }
                           }         
                         });      
                        }else{
                          callback(null,'all alarm already exixts')
                        }
                      } 
          
                    }else{
                      // console.log("my push to update",ad)
                      updateAlarm.push(ad)
                      re1Count++
                    //  console.log("----------------insert_cont",insertData)
                    //   console.log("------------------update_cont",updateAlarm)
                      // console.log("results111111111111111",results1)
                      if(re1Count===AhuData.length){
                      // console.log("--------------------------->",updateAlarm)
                        if(insertData.length+updateAlarm.length>0){
                          let countre=0
                          results1.forEach(res => {          
                            let r=[]
                            r = AhuData.find(e =>(parseInt(e["alarm_code"]) === parseInt(res.alarm_code)));
                              // console.log("r2",r)
                           if(r===undefined){
                             restoredata.push(res)
                             countre++
                             if(countre==results1.length){
                              console.log("restoredatat3",restoredata)
                              model.addAlarmData(insertData,updateAlarm,restoredata, (err, results) => {
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null, results);
                                }
                              });
                             }
                           }else{
                            countre++
                            if(countre==results1.length){
                              console.log("restoredatat4",restoredata)
                              model.addAlarmData(insertData,updateAlarm,restoredata, (err, results) => {
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null, results);
                                }
                              });
                             }
                           }         
                         });
                        }else{
                          callback(null,'all alarm already exixts')
                        }
                      } 
                    }
                  })
                }else{
                 model.restoreAll((erres,resAll)=>{
                  if(erres){
                    callback(erres)
                  }else{
                    callback(null,resAll)
                  }
                 })
                }
          
              }else{
                let aldata=0
                if(AhuData.length>0){
                  AhuData.forEach(element => {
                      if(element['message']!='' && element['message']!=undefined){
                          let data = [];
                          data.push(id);
                          // data.push('201');
                          data.push(element['alarm_code']);
                          data.push(element['message']);
                          data.push(element['param_id']);
                          data.push(fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"));
                          insertData.push(data);
                      }
                          aldata++
                          if(aldata==AhuData.length){
                            if(insertData.length>0){
                                console.log("restoredata 5",insertData)
                              model.addAlarmData(insertData,updateAlarm,restoredata, (err, results) => {
                                if (err) {
                                  callback(err);
                                } else {
                                  callback(null, results);
                                }
                              });
                            }else{
                              callback(null,'no_alarm')
                            }
                          }
                  })
                }else{
                  console.log("update restore")
                  callback(null,"no alarm");
                }
               
              }
            }
          })
        }
      //   console.log("IM DONE")
      // });
    //  AhuData = getAHUAlarm(AhuData[1].param_value);
      // console.log("AhuData",AhuData)
  // }else{
  //   callback(null,'no data')
  // }
  // console.log('data', insertData);
};

const gl_config_table =(callback)=>{
    model.gl_config_table((err,res)=>{
        if(err){
            callback(err);
        }else{
            callback(null, res);
        }
    })
}

module.exports = {
    getAhus,
    latestValues,
    getAlarmData,
    addAhuDeviceData,
    gl_config_table
    // restoreAlarm
    // insertIntoGlalarm
};