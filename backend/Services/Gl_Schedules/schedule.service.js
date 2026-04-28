const { object, date } = require('joi');
const model = require('././schedule.model');
var parser = require('cron-parser');
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const fns = require('date-fns');
var differenceInMinutes = require('date-fns/differenceInMinutes');
var differenceInSeconds  = require('date-fns/differenceInSeconds');
const uuid = require('uuid');
const jobTrigger=require('./sampleScheduleTester')



const createWeeklySchedule = (data,callback) => {
let myObj={}
myObj["name"]= data.name
let type=data.schedule_type==='device'?"device":'zone'
myObj["schedule_type"]=type
myObj["zone_device_id"]= data.zone_device_id
cornTimeToStore(data.start_time,data.weekdays,(err,res)=>{
    if(err){
        callback(err)
    }else{
        myObj["start_time"]=res
    }
})
cornTimeToStore(data.end_time,data.weekdays,(err,res)=>{
    if(err){
        callback(err)
    }else{
        myObj["end_time"]=res
    }
})
myObj["value"]=data.value
myObj["weekly_schedule"]= data.weekly_schedule
 console.log("MYOBJECT",data)
sendToDDC(data,(err,results)=>{
    if(err){
        callback(err)
    }else{
        console.log("data i want here",data)
        //{"start_time": "12:00", "end_time": "20:30", "weekdays": ["Monday", "Friday","Wednesday"], "start_value": "on", "value_type": "BOOLEAN"}
        let mypara = Object.keys(data.value)
        console.log("myparararrara",mypara)
        let myval = Object.values(data.value)
        let payload = {}
        payload["start_time"]=data.start_time
        payload["end_time"]=data.end_time
        payload["weekdays"]=data.weekdays
        if(mypara[0] === "AHU_On_Off"){
            payload["start_value"]=myval[0]
            payload["value_type"]="BOOLEAN"
            console.log("payloadddd",payload)
            let count =0
            results.forEach(element => {
            let requestAdress = `http://localhost:7080/writeSchedule/${element.ss_address_value}/17:1/weeklySchedule/`
            count++
            if(results.length == count){
                axios
                .post(requestAdress,payload)
                .then((res)=>{
                        model.createWeeklySchedule(myObj,(err,res)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(null,res)
                        }
                    })
                })
                .catch((err)=>{
                    console.log(err)
                    callback(null,{"message":"please connect to network"})
                })            
            }
        });
        }else{
            payload["start_value"]=parseInt(myval[0])
            payload["end_value"]=0.0
            payload["value_type"]="REAL"
            console.log("payloadddd",payload)
            let count =0
            results.forEach(element => {
            let requestAdress = `http://localhost:7080/writeSchedule/${element.ss_address_value}/17:16/weeklySchedule/`
            count++
            if(results.length == count){
                axios
                .post(requestAdress,payload)
                .then((res)=>{
                        model.createWeeklySchedule(myObj,(err,res)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(null,res)
                        }
                    })
                })
                .catch((err)=>{
                    console.log(err)
                    callback(null,{"message":"please connect to network"})
                })            
            }
        });
        }
    //    console.log("resultssss",results)
    }
})

};

const sendToDDC = (data,callback) =>{
model.getSubsystemDetails(data,(err,results)=>{
    if(err){
        callback(err)
    }else{
         console.log("resultsToSendToDDCS",results)
        callback(null,results)
    }
})
}

// const cornTimeToStore = (time,weekdays,callback) =>{
//     let numbers={
//         'Sunday':0,
//         'Monday':1,
//         'Tuesday':2,
//         'Wednesday':3,
//         'Thursday':4,
//         'Friday':5,
//         'Saturday':6
//     }
//     var interval = parser.parseExpression('* * * * *');
//     var fields = JSON.parse(JSON.stringify(interval.fields)); // Fields is immutable
//     console.log("start",time.slice(0,2))
//     console.log("end",time.slice(3))
//     fields.hour = [parseInt(time.slice(0,2)) ];
//     fields.minute = [parseInt(time.slice(3))];
//     // dayOfW=weekdays.map(ele=>numbers[ele])
//     // console.log(dayOfW)
//     if(weekdays !=null && weekdays.length>0){
//         fields.dayOfWeek =weekdays;
//     }
//     var modifiedInterval = parser.fieldsToExpression(fields);
//     let cronString = modifiedInterval.stringify();
//     console.log(cronString)
//     return(cronString)
//     callback(null,cronString); // "29 8 * * 1,3-7"
// }
const cornTimeToStore = (input, weekdays = []) => {
    let fields = {
        minute: ['*'],
        hour: ['*'],
        dayOfMonth: ['*'],
        month: ['*'],
        dayOfWeek: ['*']
    };
        let numbers={
        'Sunday':0,
        'Monday':1,
        'Tuesday':2,
        'Wednesday':3,
        'Thursday':4,
        'Friday':5,
        'Saturday':6
    }
    // Check if the input is a datetime or just a time 
    if (input.includes(' ')) {
        // Handling datetime input, e.g., '03-24-2023 18:46:00' "MM-DD-YYYY hh:mm:ss"
        const [date, time] = input.split(' ');
        const [hour, minute] = time.split(':').map(Number);
        const [month, day,  year] = date.split('-').map(Number);

        // Set the cron fields for specific datetime
        fields.minute = [minute];
        fields.hour = [hour];
        fields.dayOfMonth = [day];
        fields.month = [month];
        const givenDate = new Date(year, month - 1, day);
        const dayOfWeek = givenDate.getDay();
        fields.dayOfWeek = [dayOfWeek];
        console.log("==========>dayOfWeek",dayOfWeek)
         dayOfW=weekdays.map(ele=>numbers[ele])
         if (weekdays && weekdays.length > 0) {
            fields.dayOfWeek = weekdays;
        }

    } else {
        // Handling just time input, e.g., '10:00'
        const [hour, minute] = input.split(':').map(Number);
        fields.minute = [minute];
        fields.hour = [hour];
        
        // If weekdays are provided, handle them
        // dayOfW=weekdays.map(ele=>numbers[ele])
        if (weekdays && weekdays.length > 0) {
            fields.dayOfWeek = weekdays;
        }
    }

    // Generate cron expression
    let cronString = `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;
    console.log("cronString",cronString)
    return cronString;
};

// Example usage:

// Handling datetime input
// console.log("Cron SYNTAX (datetime):", cornTimeToStore('2023-03-24 18:46:00'));

// Handling time with weekdays
// console.log("Cron SYNTAX (time with weekdays):", cornTimeToStore("10:00", [0, 2, 4, 5, 6, 3, 1]));


 const scheduleDetails =(id,callback)=>{
    model.scheduleDetails(id,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
 }

 const holidaysList =(data,callback)=>{
     sendToDDC(data,(err,results)=>{
         if(err){
             callback(err)
            }else{
            console.log("results",results)
            console.log("datata",data)
            let payload = {}
            payload["holidays"]=data.holidays
            console.log("payload",payload)
            let count =0
            results.forEach(element => {
            let requestAdress = `http://localhost:7080/writeSchedule/${element.ss_address_value}/6:0/dateList/`
            count++
            if(results.length == count){
                axios
                .post(requestAdress,payload)
                .then((res)=>{
                        model.holidaysList(payload,(err,res)=>{
                        if(err){
                            callback(err)
                        }else{
                            callback(null,res)
                        }
                    })
                //     console.log(res)
                //     callback(null,{"message":"updated"})
                })
                .catch((err)=>{
                    console.log(err)
                    callback(null,{"message":"please connect to network"})
                })            
            }
        });
        }
    })
 }

// const exceptionSchedule = (data,callback) =>{
// console.log("data ",data)
// let device_id=data.device_id
// let parameter=data.parameter
// console.log("device_id",device_id,"parameter",parameter)
// model.getDeviceDetails(device_id,parameter,(err,res)=>{
//     if(err){
//         callback(err)
//     }else{
//         time(data.start_time,data.end_time,(timeerr,timeres)=>{
//             if(timeerr){
//                 callback(timeerr)
//             }else{
//                 // http://localhost:7080/write/192.168.10.30/5:60/presentValue/null/-/8
//                 let req=`http://localhost:7080/write/${res[0].Ip}/2:120/presentValue/${timeres}`
//                 axios
//                 .get(req+'/-/8')
//                 .then((res)=>{
//                     //res.status(OK)
//                     // callback(null,'ACCEPTED')
//                     console.log(res.data)
//                     // if(res.data == "TBD-Acknowledged"){
//                     //     let true_value = 'active'
//                     //     let req=`http://localhost:7080/write/${res[0].Ip}/5:120/presentValue/${true_value}`
//                     //     axios
//                     //     .get(req+'/-/8')
//                     //     .then(()=>{
//                     //         if(res.data == "TBD-Acknowledged"){
//                     //             let false_value = 'inactive'
//                     //             let req=`http://localhost:7080/write/${res[0].Ip}/5:120/presentValue/${false_value}`
//                     //             axios
//                     //             .get(req+'/-/8')
//                     //             .then(()=>{
//                     //                 console.log(res.data)
//                     //             })
//                     //             .catch((err)=>{
//                     //                 callback(null,{"message":"please connect to network"})
//                     //             })
//                     //         }else{
//                     //             console.log("something error in sending false value")
//                     //         }
//                     //     })
//                     //     .catch((err)=>{
//                     //         callback(null,{"message":"please connect to network"})
//                     //     })
//                     // }else{
//                     //     console.log("something error in sending true value")
//                     // }
//                 })
//                 .catch((err)=>{
//                   //console.log(err)
//                   console.log("something error in sending seconds")
//                   callback(null,{"message":"please connect to network"})
//                 })
//                 // console.log("seconds in my method",timeres)
//                 // // console.log("res",res)
//                 // console.log("res",res[0].Ip)
//                 // console.log("res",res[0].ObjectId)
//                 // console.log("res",res[0].InstanceId)
//                 // callback(null,({
//                 //     "ddcIp": res[0].Ip,
//                 //     "objectId" : res[0].ObjectId,
//                 //     "instanceId" : res[0].InstanceId,
//                 //     "seconds":timeres
//                 // }))
//             }
//         })
//     }
// })
//  }

//  const time = (start_time,end_time,callback) => {
//     let startTime = start_time;
//     // console.log("startTime",startTime)
//     let endTime = end_time;
//     //  console.log("endTime",endTime)
//     const alarmTime = differenceInSeconds(
//       new Date(endTime),
//       new Date(startTime)
//     );
//     // console.log('alarm triggered time', alarmTime);
//         callback(null,alarmTime)
//   };

const createGlSchedule=(ctf,name,id,ref_id,type)=>{
    return new Promise((resolve,reject) => {
        // setTimeout(() => {
        //     console.log("in method PRINT");
        //     resolve(); // Resolve the promise after the timeout
        // }, 500);
        model.getschedule(ctf,(err,res)=>{
            if(err){
                console.log(err)
            }else{
                console.log("res in createGlSchedle",JSON.stringify(res));
                if(res.length>0){
                    //schdule exist return id
                    console.log(res[0].id)
                    resolve(res[0].id)
                }else{
                    //create record in gl_Schedule
                    let currentDate = new Date();
                    // Get the date one year from today
                    let nextYearDate = fns.add(currentDate, { years: 1 });
                    let formattedCurrentDate =  fns.format(currentDate, 'yyyy-MM-dd HH:mm:ss');
                    let formattedNextYearDate = fns.format(nextYearDate, 'yyyy-MM-dd HH:mm:ss');
                    let schedulePayload={
                        "tableName":"gl_schedule",
                        "payload":{
                            id:id,
                            name:name,
                            description:convertCronToReadable(ctf),
                            cron_tab_fields:ctf,
                            start:formattedCurrentDate,
                            end:formattedNextYearDate,
                            referenceId:ref_id,
                            type:type  
                        }
                    }
                    let payload=[]
                    payload.push(schedulePayload)
                     model.createSchedule(payload,(err,res)=>{
                    if(err){
                        reject(err)
                    }else{
                        console.log("res===please create record==>service",res.id)
                    resolve(res.id)
                    }
                })

                }
            }
        })
    });
}






const createSchedule=async(data,callback)=>{
    //data= {"name":"myschedule","device":{"ss_id":"qwert1233","name":"ahu123"},"command":"TRUN_ON","scheduleData":{"start":"10:00","end":"18:00"},"weekData":[0,2,4,5,6,1]}}
     // exception=13  recurrring=14
    // cornTimeToStore(data.start_time,data.weekdays,(err,res)=>{
    let scheduleData=data.scheduleData
    let start=cornTimeToStore(scheduleData.start,data.weekData)
    let end=cornTimeToStore(scheduleData.end,data.weekData)
    // let glScheduleIdStart=uuid()
    let gl_start_id=uuid()
    let gl_end_id=uuid()

    let glScheduleIdStart=await createGlSchedule(start,data.name,gl_start_id,gl_start_id,"start")
    let glScheduleIdEnd=await createGlSchedule(end,data.name,gl_end_id,glScheduleIdStart,"end")
        
        
        
    let currentDate = new Date();
    
    // Get the date one year from today
    let nextYearDate = fns.add(currentDate, { years: 1 });

   
    let formattedCurrentDate =  fns.format(currentDate, 'yyyy-MM-dd HH:mm:ss');
    let formattedNextYearDate = fns.format(nextYearDate, 'yyyy-MM-dd HH:mm:ss');
    // console.log(formattedCurrentDate,formattedNextYearDate);
    //find is schedule already exsisting
    //  model.getschedule(start,(err,res)=>{
        
        //  })
        //#######new schedule
    // if((data.target && Array.isArray(data.target.zone_id) && data.target.zone_id.length > 0)){
    //     console.log("checkzoneId",data.target.zone_id,"start>",start,"end>",end)
    // }
    let start_payload_detail={
        "tableName":"gl_schedule_detail",
        "payload":{
            name:data.name,
            schedule_id:glScheduleIdStart,
            command:data.start_command,
            ss_id:(data.target && Array.isArray(data.target.ss_id) && data.target.ss_id.length > 0) 
            ? data.target.ss_id.join() : null,
            ss_type:(data.target && Array.isArray(data.target.ss_type) && data.target.ss_type.length > 0) 
            ? data.target.ss_type.join() : null,
            // zone_id: (data.target && Array.isArray(data.target.zone_id) && data.target.zone_id.length > 0) 
            // ? data.target.zone_id : null,
            zone_id: data.target && data.target.zone_id 
            ? (Array.isArray(data.target.zone_id) 
                ? data.target.zone_id.join(",")  // If array, join by comma
                : data.target.zone_id)  // If string, use as is
            : null,
            zone_type:(data.target && data.target.zone_type) ? data.target.zone_type : null,
            priority:data.type=="recurring"?14:data.type=="exception"?13:null
        }
    }
    let end_payload_detail={
        "tableName":"gl_schedule_detail",
        "payload":{
            name:data.name,
            schedule_id:glScheduleIdEnd,
            command:data.end_command,
            ss_id:(data.target && Array.isArray(data.target.ss_id) && data.target.ss_id.length > 0) 
            ? data.target.ss_id.join() : null,
            ss_type:(data.target && Array.isArray(data.target.ss_type) && data.target.ss_type.length > 0) 
            ? data.target.ss_type.join() : null,
            // zone_id: (data.target && Array.isArray(data.target.zone_id) && data.target.zone_id.length > 0) ? data.target.zone_id: null,
            zone_id: data.target && data.target.zone_id 
                        ? (Array.isArray(data.target.zone_id) 
                            ? data.target.zone_id.join(",")  // If array, join by comma
                            : data.target.zone_id)  // If string, use as is
                        : null,
            zone_type:(data.target && data.target.zone_type) ? data.target.zone_type : null,
            priority:data.type=="recurrring"?14:data.type=="exception"?13:null
        }
    }
    let payloads=[]
    // payloads.push(start_payload)
    // payloads.push(end_payload)
    payloads.push(start_payload_detail)
    payloads.push(end_payload_detail)
    
    // callback(null,payloads)//************************* */
    model.createSchedule(payloads,(err,res)=>{
        if(err){
            callback(err)
        }else{
            console.log("retun",glScheduleIdStart,glScheduleIdEnd);
            //create schedule detail
             console.log("---------->",res)
            //  for(data in res){
            //     console.log(res[data],data)
            //  }
             //runJob
            //  {
            //     "ss_type":"NONGL_SS_CHILLER",
            //     "ss_id":"2c581077-9095-460e-9de9-4b380c52d165",
            //     "gl_command":"TURN_ON",
            //     "param_id":"RAT_SP",
            //     "value":25,
            //     "zone_type":null,
            //     "zone_id":null
            // }
            let job=[
            {
                id:glScheduleIdStart,
                name:data.name,
                description:convertCronToReadable(start),
                cron_tab_fields:start,
                command:data.start_command,
                start:formattedCurrentDate,
                end:formattedNextYearDate,
                priority:data.type=="recurrring"?14:data.type=="exception"?13:null
            },
            {
                id:glScheduleIdEnd,
                name:data.name,
                description:convertCronToReadable(end),
                cron_tab_fields:end,
                command:data.end_command,
                start:formattedCurrentDate,
                end:formattedNextYearDate,
                priority:data.type=="recurrring"?14:data.type=="exception"?13:null
            }
         ]
            jobTrigger.runJob(job)
            callback(null,res)
        }
    })
}

function convertCronToReadable(cronExpression) {
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ');
    let minutes = [];
    if (minute.includes(',')) {
        minutes = minute.split(',');
    } else {
        minutes.push(minute);
    }
    const hours = hour === '*' ? 'every hour' : `at ${hour.padStart(2, '0')}:00`;
    // Mapping for days of the week
    const daysMap = {
        '0': 'Sunday',
        '1': 'Monday',
        '2': 'Tuesday',
        '3': 'Wednesday',
        '4': 'Thursday',
        '5': 'Friday',
        '6': 'Saturday',
        '7': 'Sunday'
    };

    let days = [];

    // Handle day of the week
    if (dayOfWeek === '*') {
        days = ['every day'];
    } else if (dayOfWeek.includes(',')) {
        // Handle multiple days or ranges separated by commas
        const dayList = dayOfWeek.split(',');
        dayList.forEach(day => {
            if (day.includes('-')) {
                const [start, end] = day.split('-').map(Number);
                for (let i = start; i <= end; i++) {
                    if (daysMap[i.toString()]) {
                        days.push(daysMap[i.toString()]);
                    }
                }
            } else if (daysMap[day]) {
                days.push(daysMap[day]);
            }
        });
    } else if (dayOfWeek.includes('/')) {
        // Handle intervals in range, e.g., "0-6/2"
        const [range, step] = dayOfWeek.split('/');
        const [start, end] = range.split('-').map(Number);
        for (let i = start; i <= end; i += parseInt(step)) {
            if (daysMap[i.toString()]) {
                days.push(daysMap[i.toString()]);
            }
        }
    } else if (dayOfWeek.includes('-')) {
        // Handle range of days, e.g., "0-6"
        const [start, end] = dayOfWeek.split('-').map(Number);
        for (let i = start; i <= end; i++) {
            if (daysMap[i.toString()]) {
                days.push(daysMap[i.toString()]);
            }
        }
    } else {
        // Single day case
        days = [daysMap[dayOfWeek]];
    }

    const uniqueDays = [...new Set(days)];
    if (minute === '0') {
        return `At ${hour.padStart(2, '0')}:00 on ${uniqueDays.join(', ')}.`;
    } else if (minute === '*') {
        return `Every minute of ${hours} on ${uniqueDays.join(', ')}.`;
    } else {
        return `At ${minutes.join(', ')} minute(s) past ${hours} on ${uniqueDays.join(', ')}.`;
    }
    // if (minute != '*') {
    //     return `At ${hours} on ${uniqueDays.join(', ')}.`;
    // } else {
    //     return `At ${minutes.join(', ')} minute(s) past ${hours} on ${uniqueDays.join(', ')}.`;
    // }
    // return `At ${hour.padStart(2, '0')}:${minute.padStart(2, '0')} on ${uniqueDays.join(', ')}.`;
    // return `At ${minutes.join(', ')} minute(s)  every hour on ${uniqueDays.join(', ')}.`;
}

function myCornParserException(cronExpression){
    console.log("CAME FOR EXCEPTION",cronExpression)
    const [minute, hour, dayOfMonth, month, dayOfWeek] = cronExpression.split(' ').map(Number);
    
    // Define a mapping for days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Define the year (if not specified, use the current year)
    const year = new Date().getFullYear();
    
    // Construct the Date object using extracted values
    const cronDate = new Date(year, month - 1, dayOfMonth, hour, minute);
    
    // Format the time as 'HH:MM:SS'
    const timeCon = cronDate.toTimeString().split(' ')[0];
    
    // Format the date as 'YYYY-MM-DD'
    const dateCon = cronDate.toISOString().split('T')[0];
    
    // Get the day of the week
    const daysCon = [daysOfWeek[dayOfWeek]];
    
    // Create the result object
    const result = {
      timeCon,
      dateCon,
      daysCon
    };
    console.log(result);
    return(result)
}
function transformSchedule(data) {
    const resp = {};
     console.log("in transfrom sche=dule",data)
     const start = data.find(item => item.type === 'start');
     const end = data.find(item => item.type === 'end');
    //  const zones = [...new Set(data.map(item => ({
    //  id: item.zone_id_subordinate,
    //  name: item.zone_name
    //  })))]; 
    const zones = [
        ...new Map(
          data.map(item => [item.zone_id_subordinate, { id: item.zone_id_subordinate, name: item.zone_name }])
        ).values()
      ];
     resp.id = start.referenceId;
     resp.title = start.title;
     resp.start =start.priority==14? model.parseCronExpression(start.cron_tab_fields)["timeCon"]:myCornParserException(start.cron_tab_fields)["timeCon"] // Extracted from cron_tab_fields if needed
     resp.end = start.priority==14? model.parseCronExpression(end.cron_tab_fields)["timeCon"]:myCornParserException(end.cron_tab_fields)["timeCon"]  // Extracted from cron_tab_fields if needed
     resp.date = start.priority==14? model.parseCronExpression(start.cron_tab_fields)["dateCon"]:myCornParserException(start.cron_tab_fields)["dateCon"];
     resp.weekdays=model.parseCronExpression(start.cron_tab_fields)["daysCon"];
     resp.zones = zones;
     resp.action = start.command;
     resp.priority=start.priority;
     resp.startDate=start.start;
     resp.endDate=start.end;
     resp.ss_type=start.ss_type
     resp.type=start.type
    return resp
  }
const  scheduleList=(id,callback)=>{
    model.scheduleList(id,(err,res)=>{
        if(err){
            callback(err)
        }else{
            // let response={}
            // response["schedules"]["exception"]=[]
            // response["schedules"]["recurring"]=[]
            // response["schedules"]=[]
            let response = {
                schedules: {
                    exception: [],
                    recurring: []
                }
            };
            let transformedData=[]
            for (let key in res) {
                // console.log(key, obj[key]);
                let transformed={}
                transformed=transformSchedule(res[key])
                transformedData.push(transformed)
              }
              transformedData.forEach(sch=>{
                if(sch.priority==13){
                    response["schedules"]["exception"].push(sch)
                }else{
                    if(sch.priority==14){
                        response["schedules"]["recurring"].push(sch) 
                    }
                }
              })
            callback(null,response)
        }
    })
 }
// console.log("readable>", convertCronToReadable("0 9 * * *"));           // Every day
// console.log("readable>", convertCronToReadable("5,15,25,35,45,55 * * * *"));           // Every day
// console.log("readable>", convertCronToReadable("45 14 * * 0-6/2"));      // Every second day from Sunday to Saturday
// 15 12 * * 0-2,4,6
// console.log("readable>", convertCronToReadable("0 14 * * 2"));          // On Tuesday
// console.log("readable>", convertCronToReadable("15 12 * * 0-2,4,6"));        // On Tuesday and Wednesday


// console.log("readable>", convertCronToReadable("0 9 * * *"));
// console.log("readable>", convertCronToReadable("0 14 * * 0-6/2"));
// console.log("readable>", convertCronToReadable("0 14 * * 2"));
// console.log("readable>", convertCronToReadable("0 14 * * 2,3"));

// console.log("----->",cornTimeToStore('2023-03-24 18:46:00'))

module.exports={
createWeeklySchedule,
cornTimeToStore,
scheduleDetails,
holidaysList,
// exceptionSchedule
createSchedule,
scheduleList
}
