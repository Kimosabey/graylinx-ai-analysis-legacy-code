const { result } = require('lodash');
const { pool } = require('../../Database/pool');
const uuid = require('uuid/v4');
const arrayToTree = require('array-to-tree');
const CronParser = require('cron-parser');
const logger = require('../../Config/logger');

const createWeeklySchedule = (data,callback) =>{
console.log("data in model",data)
if(data.schedule_type=== "zone"){
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = 'select * from gl_schedule_map where zone_id=? and schedule_status=?'
            connection.query(query,[data.zone_device_id,"GL_SS_STATUS_ACTIVE"],(err,results)=>{
                if(err){
                    console.log("errr1",err)
                    connection.release();
                    callback(err)
                }else{
                    // console.log("results",results)
                    if(results.length > 0){
                        results.forEach(element => {
                            const query1 = "update gl_schedule_map set schedule_status=? where zone_id=?"
                            connection.query(query1,["GL_SS_STATUS_INACTIVE",element.zone_id],(err,results1)=>{
                                if(err){
                                    console.log("err2",err)
                                    connection.release();
                                    callback(err)
                                 }else{
                                    let id=uuid()
                                    let start = data.start_time
                                    let end = data.end_time
                                    const query2 = 'insert into gl_timestamp(id,start,end) values(?,?,?)';
                                    connection.query(query2,[id,start,end],(err,results2)=>{
                                        if(err){
                                            connection.release();
                                            callback(err)
                                        }else{
                                            let shed_id=uuid()
                                            let zone_device_id=data.zone_device_id
                                            let schedule_type=data.schedule_type
                                            let time_id=id
                                            let recurring_status=(data.weekly_schedule == 'True') ? 'GL_SS_STATUS_ACTIVE' : 'GL_SS_STATUS_INACTIVE'
                                            let vals=JSON.stringify(data.value)
                                            let name=data.name
                                            const query3 = 'insert into gl_schedule_map(id,zone_id,schedule_type,time_id,recurring_status,arguments,name) values(?,?,?,?,?,?,?)';
                                            connection.query(query3,[shed_id,zone_device_id,schedule_type,time_id,recurring_status,vals,name],(err,results3)=>{
                                            connection.release();
                                                if(err){
                                                    callback(err)
                                                }else{
                                                    callback(null,"Schedule is Created")
                                                }
                                            })
    
                                        }
                                    })
                                }
                            })
                        });
                    }else{
                        let id=uuid()
                        let start = data.start_time
                        let end = data.end_time
                        const query2 = 'insert into gl_timestamp(id,start,end) values(?,?,?)';
                        connection.query(query2,[id,start,end],(err,results2)=>{
                            if(err){
                                connection.release();
                                callback(err)
                            }else{
                                let shed_id=uuid()
                                let zone_device_id=data.zone_device_id
                                let schedule_type = data.schedule_type
                                let time_id=id
                                let recurring_status=(data.weekly_schedule == 'True') ? 'GL_SS_STATUS_ACTIVE' : 'GL_SS_STATUS_INACTIVE'
                                let vals=JSON.stringify(data.value)
                                let name=data.name
                                const query3 = 'insert into gl_schedule_map(id,zone_id,schedule_type,time_id,recurring_status,arguments,name) values(?,?,?,?,?,?,?)';
                                connection.query(query3,[shed_id,zone_device_id,schedule_type,time_id,recurring_status,vals,name],(err,results3)=>{
                                connection.release();
                                    if(err){
                                        callback(err)
                                    }else{
                                        callback(null,"Schedule is Created")
                                    }
                                })
    
                            }
                        })
                    }
    
                }    
            })
    
        }else{
            callback(null,'DB Connection error')
        }
    })
}else{
    console.log("data in device method",data)
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = 'select * from gl_schedule_map where ss_id=? and schedule_status=?'
            connection.query(query,[data.zone_device_id,"GL_SS_STATUS_ACTIVE"],(err,results)=>{
                if(err){
                    console.log("errr1",err)
                    connection.release();
                    callback(err)
                }else{
                    // console.log("results",results)
                    if(results.length > 0){
                        results.forEach(element => {
                            const query1 = "update gl_schedule_map set schedule_status=? where ss_id=?"
                            connection.query(query1,["GL_SS_STATUS_INACTIVE",element.ss_id],(err,results1)=>{
                                if(err){
                                    console.log("err2",err)
                                    connection.release();
                                    callback(err)
                                 }else{
                                    let id=uuid()
                                    let start = data.start_time
                                    let end = data.end_time
                                    const query2 = 'insert into gl_timestamp(id,start,end) values(?,?,?)';
                                    connection.query(query2,[id,start,end],(err,results2)=>{
                                        if(err){
                                            connection.release();
                                            callback(err)
                                        }else{
                                            let shed_id=uuid()
                                            let zone_device_id=data.zone_device_id
                                            let schedule_type=data.schedule_type
                                            let time_id=id
                                            let recurring_status=(data.weekly_schedule == 'True') ? 'GL_SS_STATUS_ACTIVE' : 'GL_SS_STATUS_INACTIVE'
                                            let vals=JSON.stringify(data.value)
                                            let name=data.name
                                            const query3 = 'insert into gl_schedule_map(id,ss_id,schedule_type,time_id,recurring_status,arguments,name) values(?,?,?,?,?,?,?)';
                                            connection.query(query3,[shed_id,zone_device_id,schedule_type,time_id,recurring_status,vals,name],(err,results3)=>{
                                            connection.release();
                                                if(err){
                                                    callback(err)
                                                }else{
                                                    callback(null,"Schedule is Created")
                                                }
                                            })
    
                                        }
                                    })
                                }
                            })
                        });
                    }else{
                        let id=uuid()
                        let start = data.start_time
                        let end = data.end_time
                        const query2 = 'insert into gl_timestamp(id,start,end) values(?,?,?)';
                        connection.query(query2,[id,start,end],(err,results2)=>{
                            if(err){
                                connection.release();
                                callback(err)
                            }else{
                                let shed_id=uuid()
                                let zone_device_id=data.zone_device_id
                                let schedule_type = data.schedule_type
                                let time_id=id
                                let recurring_status=(data.weekly_schedule == 'True') ? 'GL_SS_STATUS_ACTIVE' : 'GL_SS_STATUS_INACTIVE'
                                let vals=JSON.stringify(data.value)
                                let name=data.name
                                const query3 = 'insert into gl_schedule_map(id,ss_id,schedule_type,time_id,recurring_status,arguments,name) values(?,?,?,?,?,?,?)';
                                connection.query(query3,[shed_id,zone_device_id,schedule_type,time_id,recurring_status,vals,name],(err,results3)=>{
                                connection.release();
                                    if(err){
                                        callback(err)
                                    }else{
                                        callback(null,"Schedule is Created")
                                    }
                                })
    
                            }
                        })
                    }
    
                }    
            })
    
        }else{
            callback(null,'DB Connection error')
        }
    })
}
}

// function parseCronExpression(cronExpression) {
//     try {
//         const interval = CronParser.parseExpression(cronExpression);
//         const nextExecution = interval.next();
    
//         // Extract the time and days from the next execution
//         const hours1 = nextExecution.getHours();
//         const minutes2 = nextExecution.getMinutes();
//         const seconds3 = nextExecution.getSeconds();
//         const time = `${hours1}:${minutes2}:${seconds3}`;
//         // const daysOfWeek = nextExecution.getDay();
//         console.log("cron expression",cronExpression)
//         const [hours, minutes, seconds] = time.split(':');
//         const date = new Date();
//         date.setHours(hours);
//         date.setMinutes(minutes);
//         date.setSeconds(seconds);
    
//         const formattedTime = date.toLocaleTimeString('en-US', {
//           hour12: false,
//           hour: '2-digit',
//           minute: '2-digit',
//           second: '2-digit'
//         });
//         // const daysOfWeek = nextExecution.getDay();
    
//         // // Format the time and days
//         // let numbers={
//         //     'Monday':1,
//         //     'Tuesday':2,
//         //     'Wednesday':3,
//         //     'Thursday':4,
//         //     'Friday':5,
//         //     'Saturday':6,
//         //     'Sunday':7
//         // }
//         // // const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         // const day = numbers[daysOfWeek];
       
//     const selectedDays = []
//     // console.log("cronExpression",cronExpression)
//     const cronParts = cronExpression.split(' ');
//     // console.log("CronParts",cronParts)
//     if (cronParts.length >= 5) {
//         const dayOfWeek = cronParts[4];
    
//         if (dayOfWeek !== '*') {
//         const dayValues = dayOfWeek.split(',');
    
//         dayValues.forEach(value => {
//             if (value.includes('-')) {
//             const [startDay, endDay] = value.split('-').map(Number);
//             for (let day = startDay; day <= endDay; day++) {
//                 selectedDays.push(day % 7);
//             }
//             } else {
//             selectedDays.push(Number(value) % 7);
//             }
//         });
//         }
//     }
//     // console.log("selected",selectedDays)
//     const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//     const selectedDayNames = selectedDays.map(day => weekdays[day]);
    
//     // console.log('Days:', selectedDayNames.join(', '));
//     // console.log('Next execution time:', formattedTime);
//     // console.log('Next execution day:', selectedDayNames);
// return ({timeCon:formattedTime,daysCon:selectedDayNames});
// } catch (error) {
//     console.error('Invalid cron expression:', error.message);
// }
// }

function parseCronExpression(cronExpression) {
    try {
        console.log(cronExpression,"cronExpression")
        const CronParser = require('cron-parser');  // Assuming you use 'cron-parser'

        // Force parser to start calculating from an earlier date in 2024
        const currentDate = new Date();  // Today's date
 
        // Check if we're already past the target date in 2024
        if (currentDate > new Date(2024, 9, 17)) {  // October is month 9 (0-indexed)
            currentDate.setFullYear(2024, 0, 1);  // Force calculation from Jan 1, 2024
        }

        const options = {
            currentDate: currentDate,  // Set to start from current date or earlier
        };
        
        const interval = CronParser.parseExpression(cronExpression,options);
        const nextExecution = interval.next();
        // console.log(nextExecution)
       
        // Extract the time and days from the next execution
        const hours1 = nextExecution.getHours();
        const minutes2 = nextExecution.getMinutes();
        const seconds3 = nextExecution.getSeconds();
        const time = `${hours1}:${minutes2}:${seconds3}`;
       
        const [hours, minutes, seconds] = time.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        date.setSeconds(seconds);
       
        // Format the execution date
        const formattedDate = nextExecution.toISOString().split('T')[0];  // YYYY-MM-DD format
 
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
       
        // Parsing the days of week from the cron expression
        const selectedDays = [];
        const cronParts = cronExpression.split(' ');
       
        if (cronParts.length >= 5) {
            const dayOfWeek = cronParts[4]; // Day of the week part of the cron expression
 
            if (dayOfWeek !== '*') {
                const dayValues = dayOfWeek.split(',');
               
                dayValues.forEach(value => {
                    if (value.includes('-')) {
                        const [startDay, endDay] = value.split('-').map(Number);
                        for (let day = startDay; day <= endDay; day++) {
                            selectedDays.push(day % 7);
                        }
                    } else {
                        selectedDays.push(Number(value) % 7);
                    }
                });
            }
        }
       
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const selectedDayNames = selectedDays.map(day => weekdays[day]);
       
        return {
            timeCon: formattedTime,
            dateCon: formattedDate,
            daysCon: selectedDayNames.length ? selectedDayNames : weekdays // Default to all days if not specified
        };
    } catch (error) {
        console.error('Invalid cron expression:', error.message);
        return null;
    }
}
 

const scheduleDetails = (id,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid,name,zone_type,zone_parent FROM subordinates union select ss.id as uuid,ss.name,ss.ss_type as zone_type,ls.zone_id as zone_parent from gl_subsystem ss inner join gl_location_subsystem_map ls on ls.ss_id=ss.id;"
            connection.query(query,id,(error,results)=>{
                if(error){
                    callback(error)
                }else{
                    let count = 0
                    let temp = results.map(sch => ({...sch,scheduleDetails:{isSchedule:false}}))
                    let finalresult=arrayToTree(temp,{
                        parentProperty: 'zone_parent',
                        customID: 'uuid'
                    });
                    function updateTree(node, targetValue, newValue,flag) {  
                                if (node === null) {
                                    return;
                                }
                                if (node.uuid === targetValue&&flag) {
                                    // console.log("newValue",newValue.start)
                                    let data={}
                                    Object.assign(data,newValue)
                                    let startCon=parseCronExpression(data.start)
                                    let endCon=parseCronExpression(data.end)
                                    //   console.log('dataatatatatta',newValue)
                                    //  console.log('startDays',startCon.daysCon)
                                    //  console.log('end',endCon.timeCon)
                                     data["start"]=startCon.timeCon
                                     data["weekdays"]=startCon.daysCon
                                     data["end"]=endCon.timeCon
                                     data["start_date"]=(data.created_at.slice(0,10))
                                     data["end_date"]='2154-12-31'
                                     data["arguments"]=JSON.parse(data.arguments)
                                     node.scheduleDetails = data;
                                    if (node.children && node.children.length > 0) {
                                      for (let i = 0; i < node.children.length; i++) {
                                        updateTree(node.children[i],node.children[i].uuid , newValue,true);
                                      }
                                }
                              }else{
                                if (node.children && node.children.length > 0) {
                                  for (let i = 0; i < node.children.length; i++) {
                                  let flag=node.children[i].uuid===targetValue
                                  updateTree(node.children[i],targetValue,newValue,flag);
                                  }
                              }
                              }  
                    }
                    
                     results.forEach(mysch=>{
                        if(mysch.zone_type==="GL_LOCATION_TYPE_BUILDING" || mysch.zone_type==='GL_LOCATION_TYPE_FLOOR' || mysch.zone_type==="GL_LOCATION_TYPE_ZONE"){
                            const query1 = "select gm.id,gm.name,gm.zone_id as zone_parent,gm.created_at,gt.start,gt.end,gm.arguments as arguments,gm.schedule_status from gl_schedule_map gm inner join gl_timestamp gt on gm.time_id=gt.id  where gm.schedule_status ='GL_SS_STATUS_ACTIVE' and zone_id=?";
                            connection.query(query1,[mysch.uuid],(error1,results1)=>{
                                if(error1){
                                    callback(error1)
                                }else{
                                    // count++
                                    if(results1.length>0){
                                        updateTree(finalresult[0],mysch.uuid,results1[0],true)
                                        count++
                                        if(count===results.length){
                                            connection.release()
                                            setTimeout(() => {
                                                callback(null,finalresult)
                                            }, 500);
                                        }
                                    }else{
                                        count++
                                        if(count===results.length){
                                            connection.release()
                                            setTimeout(() => {
                                                callback(null,finalresult)
                                            }, 500);
                                        }
                                    }
                                }
                            })
                        }else{
                            const query1 = "select gm.id,gm.name,gm.ss_id as zone_parent,gm.created_at,gt.start,gt.end,gm.arguments as arguments,gm.schedule_status from gl_schedule_map gm inner join gl_timestamp gt on gm.time_id=gt.id  where gm.schedule_status ='GL_SS_STATUS_ACTIVE' and ss_id=?";
                            connection.query(query1,[mysch.uuid],(error1,results1)=>{
                                if(error1){
                                    callback(error1)
                                }else{
                                    // count++
                                    if(results1.length>0){
                                        updateTree(finalresult[0],mysch.uuid,results1[0],true)
                                        count++
                                        if(count===results.length){
                                            connection.release()
                                            setTimeout(() => {
                                                callback(null,finalresult)
                                            }, 500);
                                        }
                                    }else{
                                        count++
                                        if(count===results.length){
                                            connection.release()
                                            setTimeout(() => {
                                                callback(null,finalresult)
                                            }, 500);
                                        }
                                    }
                                }
                            })
                        }
                       
                      })
                }
            })
        }else{
            callback(null,'DB Connection error')
        }
    })
}

const getSubsystemDetails = (data,callback) =>{
pool.getConnection((err,connection)=>{
    if(connection){
        if(data.schedule_type == 'device'){
            const query = 'select g.ss_address_value from gl_subsystem gs inner join gl_subsystem g on gs.ss_parent=g.id where gs.id=?';
            connection.query(query,[data.zone_device_id],(err,results)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            }) 
        }else{
            console.log("data in model",data.zone_device_id)
            const query2 ='SELECT glss.ss_address_value FROM (WITH RECURSIVE subordinates AS (SELECT id,zone_type FROM gl_location WHERE id=? UNION SELECT p.id,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT * FROM subordinates) gl_my_locations, gl_subsystem glss,gl_location_subsystem_map glzs WHERE glss.ss_type="GL_SS_ADDRESS_BACNET_DDC" AND glss.id=glzs.ss_id AND glzs.zone_id=gl_my_locations.id;';
            connection.query(query2,[data.zone_device_id],(err2,results2)=>{
                if(err2){
                    callback(err2)
                }else{
                    console.log("results",results2)
                    callback(null,results2)
                }
            })
        }
    }else{
        callback('DB Connection erorr')
    }
})
}

const holidaysList =(data,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            let name = Object.keys(data)
            let values = data.holidays        
            const query="insert into gl_configuration(gl_key,gl_value) values(?,?)"
            connection.query(query,[name,JSON.stringify(values)],(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,"inserted")
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}

const getDeviceDetails =(deviceId,parameter,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "select gls.ss_address_value as Ip,glss.ss_tag as ObjectId,glss.ss_address_value as InstanceId from gl_subsystem gl inner join gl_subsystem gls on gl.ss_parent = gls.id inner join gl_subsystem glss on glss.ss_parent=gl.id where gl.id=? and glss.name=?"
            connection.query(query,[deviceId,parameter],(err,results)=>{
                connection.release()
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback("DB CONNECTION ERROR")
        }
    })
}

const createSchedule=(payload,callback)=>{
    // console.log("scheduleCreated")
    pool.getConnection((err,connection)=>{
        if(connection){
            // connection.query('INSERT INTO device SET ?',payload,(error2, results3)
            console.log(`${JSON.stringify(payload)}`);
            let count=0
            let response={}
            payload.forEach(ele=>{
                const query=`insert into \`${ele.tableName}\` set ?`
                connection.query(query,[ele.payload],(err,res)=>{
                    if(err){
                        callback(err)
                    }else{
                        count++
                        if(ele.payload.cron_tab_fields!=undefined){
                            response["id"] = ele.payload.id;
                        }
                        if(count==payload.length){
                            console.log("payload.id",JSON.stringify(response));
                            connection.release();
                            callback(null,response)
                        }
                    }
                })
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
    // callback(null,"scheduleCreated")
}

const getJobDetails =(id,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query=`select * from gl_schedule_detail where schedule_id= ?`
            connection.query(query,id,(err,res)=>{
                if(err){
                    callback(err)
                }else{
                    connection.release()
                    callback(null,res);
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}

const getschedule = (ctf,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query=`select * from gl_schedule where cron_tab_fields= ?`
            connection.query(query,ctf,(err,res)=>{
                if(err){
                    callback(err)
                }else{
                    connection.release()
                    callback(null,res);
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}

const getStoredSchedule=(callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query=`select id,cron_tab_fields,name as command from gl_schedule;`
            connection.query(query,(err,res)=>{
                if(err){
                    connection.release()
                    callback(err)
                }else{
                    connection.release()
                    callback(null,res);
                }
            })
        }else{
            callback('DB CONNECTION ERROR')
        }
    })
}
const getEquipmentByLocationId = (locationId,ss_type) => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (connection) {
          let query = ''
          if(ss_type!=null){
              const formattedString = `(${ss_type.split(',')
                                        .map(item => `"${item.trim()}"`)
                                        .join(', ')})`;
            logger.info(`i am in sche ss_type: ${formattedString}`)
            query=`SELECT * FROM gl_location_subsystem_map lsm 
            INNER JOIN gl_subsystem gl ON lsm.ss_id = gl.id 
            WHERE lsm.zone_id = ? and ss_type in ${formattedString};`;
        }
        else{
            logger.info(`i am in sche with out ss_type`)
            query=`SELECT * FROM gl_location_subsystem_map lsm 
                           INNER JOIN gl_subsystem gl ON lsm.ss_id = gl.id 
                           WHERE lsm.zone_id = ?;`;
        }       
  
          connection.query(query, locationId, (err, res) => {
            connection.release();
            if (err) {
              reject(err);
            } else {
                console.log("number of EQP",res.length,ss_type,locationId)
              resolve(res);
            }
          });
        } else {
          reject('DB Connection error');
        }
      });
    });
  };  

  function groupByReferenceId(data) {
    return data.reduce((acc, item) => {
      const { referenceId } = item;
      if (!acc[referenceId]) {
        acc[referenceId] = [];
      }
      acc[referenceId].push(item);
      return acc;
    }, {});
  }

const scheduleList=(buildingId,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            // const query=`WITH RECURSIVE subordinates AS ( SELECT id FROM gl_location WHERE id = ? UNION SELECT p.id FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id WHERE p.zone_status = 'GL_LOCATION_STATUS_ACTIVE' AND p.zone_type != 'GL_LOCATION_TYPE_SEAT' ) SELECT c.id, c.referenceId, c.cron_tab_fields, c.description, c.type, cd.command, cd.zone_id, cd.name as title, s.id as zone_id_subordinate FROM subordinates s JOIN gl_schedule_detail d ON d.zone_id LIKE CONCAT('%', s.id, '%') JOIN gl_schedule_detail cd ON d.schedule_id = cd.schedule_id JOIN gl_schedule c ON c.id = cd.schedule_id;`
            const query=`WITH RECURSIVE subordinates AS ( SELECT id,name FROM gl_location WHERE id = ? UNION SELECT p.id,p.name FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id WHERE p.zone_status = 'GL_LOCATION_STATUS_ACTIVE' AND p.zone_type != 'GL_LOCATION_TYPE_SEAT' ) SELECT c.id, c.referenceId, c.cron_tab_fields, c.description, c.type,cd.command,cd.priority,c.start,c.end, cd.zone_id, cd.name as title, s.id as zone_id_subordinate,s.name as zone_name FROM subordinates s JOIN gl_schedule_detail d ON d.zone_id LIKE CONCAT('%', s.id, '%') JOIN gl_schedule_detail cd ON d.schedule_id = cd.schedule_id JOIN gl_schedule c ON c.id = cd.schedule_id;`
            connection.query(query, buildingId, (err, res) => {
                connection.release();
                if(err){
                    callback(err)
                }
                else
                    {
                        //data is groupped based omn referencrID
                       let grouppeddata=groupByReferenceId(res)
                    callback(null,grouppeddata)
                    }
                })
        }else{
            callback("DB CONNECTION ERROR")
        }
    })
}
// const getEquipmentByLocationId=(locationId,callback)=>{
//     pool.getConnection((err,connection)=>{
//         if(connection){
//             const query=`SELECT * FROM atl_p.gl_location_subsystem_map lsm inner join gl_subsystem gl on lsm.ss_id=gl.id where zone_id=?;`
//             connection.query(query,locationId,(err,res)=>{
//                 if(err){
//                     connection.release()
//                     callback(err)
//                 }else{
//                     connection.release()
//                     callback(null,res);
//                 }
//             })
//         }else{
//             callback(null,'DB Connection erorr')
//         }
//     })
// }
module.exports={
createWeeklySchedule,
scheduleDetails,
getSubsystemDetails,
holidaysList,
getDeviceDetails,
createSchedule,
getJobDetails,
getschedule,
getStoredSchedule,
getEquipmentByLocationId,
scheduleList,
parseCronExpression
}


//get schedule detail
// {
//     "id": "4191ab4b-1025-45bf-8c8b-7bffc30a3501",
//     "title": "myshedule",
//     "start": "2024-09-20 15:31:00",
//     "end": "2024-09-20 16:30:00",
//     "floor": {
//         "id": "b8f96ee7-500d-4e38-9f5e-213b9e49e90c",
//         "name": "Floor-1"
//     },
//     "zones": [
//         {
//             "id": "faf1aafa-81aa-4160-8add-b070684fb6d2",
//             "name": "Confernce_Zone"
//         },
//         {
//             "id": "fbed53c4-e68e-4583-93a0-88319b5d0b91",
//             "name": "workstation"
//         }
//     ],
//     "action": 0,
//     "intensity": 0
// },
