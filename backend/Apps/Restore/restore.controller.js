const models = require('./restore.model');
const _ = require('lodash');
const { compareAsc, format } = require('date-fns');
const service = require('../../Services/Device/device.service');

const getAhuDevices = (ss_type, callback) => {
  models.getAhuDevices(ss_type, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getAhuDeviceIp = (ss_parent, callback) => {
  models.getAhuDeviceIp(ss_parent, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const addAhuDeviceData = (id, AhuData, callback) => {
  console.log('ahuData', AhuData);
  console.log('ahuid', id);
  let restoredata = []
  if(AhuData.length>0){
  alarmdata = getAHUAlarm(AhuData[0].presentValue);
  models.getAlertslist(id,(err1,results1)=>{
    if(err1){
      callback(err1)
    }else{
      let count=0
      if(results1.length>0){
        if(alarmdata.length>0){
             results1.forEach(res => {          
                  let r=[]
                 r = alarmdata.find(e =>(e.alarmText["alarm_code"] === parseInt(res.alarm_code)));
                 if(r===undefined){
                   restoredata.push(res)
                   count++
                   if(count==results1.length){
                    models.restore(restoredata,(err,results2)=>{
                      if(err){
                        callback(err)
                      }else{
                        callback(null,results2)
                      }
                    }) 
                   }
                 }else{
                  count++
                  if(count==results1.length){
                    models.restore(restoredata,(err,results2)=>{
                      if(err){
                        callback(err)
                      }else{
                        callback(null,results2)
                      }
                    }) 
                   }
                 }
                // alarmdata.forEach(ala=>{
                //   console.log("-----------------alaa",ala)
                //   let ad=results1.filter(m=>m.alarm_code!=ala.alarmText["alarm_code"])
                //  // console.log("---------------------ad",ad)
                //   count++
                //   if(count==results1.length){
                //     // console.log("ad",ad)
                //    // restoredata.push(ad)
                //     console.log("restoredata",restoredata)
                //     // restoredata[0].forEach(element => {
                //     //   console.log("rest",element.id)
                //       // models.restore(element.id,(err,results)=>{
                //       //   if(err){
                //       //     callback(err)
                //       //   }else{
                //       //     callback(null,results)
                //       //   }
                //       // })
                //     // })
                //   }
                // })                
               });
       }else{
         console.log("all alarm restore")
        models.restore(results1,(err,results2)=>{
          if(err){
            callback(err)
          }else{
            callback(null,results2)
          }
        }) 
             }
      }else{
        console.log("no alarm active")
        callback(null,"no alarm active")
      }
    }
  })}else{
    callback(null,'no data')
  }
//   let insertData = [];
//   let alarmdata = [];
//   let updateAlarm=[]
//   let count =0
//   alarmdata = getAHUAlarm(AhuData[0].presentValue);
// //by me
// models.ahuAlarmInfo(id,(err1,results1)=>{
//   if(err1){
//     callback(err1)
//   }else{
//     if(results1.length>0){
//       let alarm=[]
//       re1Count=0
//       if(alarmdata.length>0){
//       alarmdata.forEach(alarmInfo=>{
//           let ad=results1.filter(m=>m.alarm_code==alarmInfo.alarmText["alarm_code"])
//           console.log("ad----------",ad)
//           if(ad.length==0){
//             re1Count++
//             let data = [];
//             data.push(id);
//             // data.push('201');
//             data.push(alarmInfo.alarmText['alarm_code']);
//             data.push(alarmInfo.alarmText['message']);
//             data.push(alarmInfo.alarmText['param_id']);
//             data.push(moment(AhuData[0].time).format('YYYY-MM-DD HH:mm:ss'));
//             insertData.push(data); 
//             console.log("resssstrue=>",re1Count,alarmdata)
//             if(re1Count===alarmdata.length){
//               console.log("-----------true---------------->",updateAlarm)
//               if(insertData.length+updateAlarm.length>0){
//                 models.addAhuDeviceData(insertData,updateAlarm, (err, results) => {
//                   if (err) {
//                     callback(err);
//                   } else {
//                     callback(null, results);
//                   }
//                 });
//               }else{
//                 callback(null,'all alarm already exixts')
//               }
//             } 

//           }else{
//             updateAlarm.push(ad[0])
//             re1Count++
//             console.log("ressssfalse=>",re1Count,alarmdata)
//             if(re1Count===alarmdata.length){
//               console.log("--------------------------->",updateAlarm)
//               if(insertData.length+updateAlarm.length>0){
//                 models.addAhuDeviceData(insertData,updateAlarm, (err, results) => {
//                   if (err) {
//                     callback(err);
//                   } else {
//                     callback(null, results);
//                   }
//                 });
//               }else{
//                 callback(null,'all alarm already exixts')
//               }
//             } 
//           }
//         })
//       }else{
//         console.log("update restore")
//       }

//     }else{
//       let aldata=0

//       if(alarmdata.length>0){
//         alarmdata.forEach(element => {
//           let data = [];
//           data.push(id);
//           // data.push('201');
//           data.push(element.alarmText['alarm_code']);
//           data.push(element.alarmText['message']);
//           data.push(element.alarmText['param_id']);
//           data.push(moment(AhuData[0].time).format('YYYY-MM-DD HH:mm:ss'));
//           insertData.push(data);  
//           aldata++
//           if(aldata==alarmdata.length){
//             if(insertData.length>0){
//               models.addAhuDeviceData(insertData, updateAlarm, (err, results) => {
//                 if (err) {
//                   callback(err);
//                 } else {
//                   callback(null, results);
//                 }
//               });
//             }else{
//               callback(null,'no_alarm')
//             }
//           }
//         })
//       }else{
//         callback(null,"no alarm");
//       }
     
//     }
//   }
// })










//   alarmdata.forEach(element => {
//     //making changes for alarms which are repeating
//     models.ahuAlarmInfo(id,(err1,results1)=>{
//       if(err1){
//         callback(err1)
//       }else{
//         console.log("results1",results1)
//         results1.forEach(alarmInfo=>{
//           if(results1.length>0){
//             console.log("alarminfo",alarmInfo.alarm_code)
//             console.log("elementcode",element.alarmText["alarm_code"])
//           if(alarmInfo.alarm_code==element.alarmText["alarm_code"]){
//             console.log("codes",alarmInfo.alarm_code==element.alarmText["alarm_code"])
//             console.log("alarm is already there")
//             count++
//             if(count==alarmdata.length){
//               callback(null,"no alarm")
//             }
//           }else{
//             let data = [];
//             data.push(id);
//             // data.push('201');
//             data.push(element.alarmText['alarm_code']);
//             data.push(element.alarmText['message']);
//             data.push(element.alarmText['param_id']);
//             data.push(moment(AhuData[0].time).format('YYYY-MM-DD HH:mm:ss'));
//             insertData.push(data);
//           }
//         }else{
//     //till here 
//     let data = [];
//     data.push(id);
//     // data.push('201');
//     data.push(element.alarmText['alarm_code']);
//     data.push(element.alarmText['message']);
//     data.push(element.alarmText['param_id']);
//     data.push(moment(AhuData[0].time).format('YYYY-MM-DD HH:mm:ss'));
//     insertData.push(data);
   
//   //
//   }
//   })
//   }
//   })  
//   //
// });
  // console.log('data', insertData);
  // if(insertData.length>0){
  //   models.addAhuDeviceData(insertData, (err, results) => {
  //     if (err) {
  //       callback(err);
  //     } else {
  //       callback(null, results);
  //     }
  //   });
  // }else{
  //   callback(null,'no_alarm')
  // }
  
 
};

function getAHUAlarm(x) {
  console.log("-------------------",x,moment().format('YYYY-MM-DD HH:mm:ss'))
  let iin = Math.floor(x),
    mybit = 1,
    myalarm,
    myresult = [];
  let alarmText = [
    {
      alarm_code:301,
      param_id: 'ahu_in_air_temperature',
      message: 'Return Air Temperature Low'
    },
    {
      alarm_code:302,
      param_id: 'ahu_in_air_temperature',
      message: 'Return Air Temperature High'
    },
    {
      alarm_code:201,
      param_id: 'ahu_in_air_temperature',
      message: 'Return Air Temperature Sensor Failure'
    },
    { alarm_code:303,param_id: 'ahu_automanual_status', message: 'AHU Manual Mode' },
    {  alarm_code:304 ,param_id: 'ahu_chilled_valve', message: 'Chilled Water Valve Mismatch' },
    { alarm_code:305,param_id: 'ahu_on_off', message: 'AHU mismatch' }
  ];
  for (let i = 0; i < alarmText.length; i++) {
    myalarm = iin & mybit;
    if (myalarm === 0) {
      myalarm = `No Alarm at ${i}`;
    } else {
      myalarm = alarmText[i];
      myresult.push({ bit: i, alarmText: alarmText[i] });
    }
    console.log(`Alarm Result: ${iin} ${i} ===> ${myalarm} == ${mybit}`);
    mybit = mybit << 1;
  }
  console.log('Alarms:\n', myresult);
  return myresult;
}

module.exports = {
  getAhuDevices,
  getAhuDeviceIp,
  addAhuDeviceData,
};


 // AhuData.forEach(element => {
  //     let data =[]
  //     data.push(id)
  //     data.push("201")
  //     // data.push("GL_SS_ADDRESS_BACNET_DEVICE_ALARM")
  //     data.push(moment(element.time).format('YYYY-MM-DD HH:mm:ss'));
  //     //  data.push(element.name)
  //       // data.push("ahu_on_off")
  //     console.log("alarmValue",getAHUAlarm(element.presentValue))
  //         // data.push(isNaN(element.presentValue)?0:element.presentValue)
  //         // data.push("Out of Network-Device")
  //         insertData.push(data)
  //   });i




  // { 
  //   if(m.alarmText["alarm_code"]==alarmInfo.alarm_code){
  //    return m
  //    //console.log(m)
  //  }
  // }