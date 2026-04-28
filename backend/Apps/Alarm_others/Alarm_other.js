const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
const dataload = require('../dataLoader/dataLoader')

schedule.scheduleJob('*/10 * * * * *',() =>{
    // schedule.scheduleJob('*/5 * * * *',() =>{
    async.waterfall([
        callback=>{
            controller.getAhus((err,res)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,res)
                }
            })
        },
        (response,callback)=>{
            console.log("ahus for checking alarms", response);
            let arr = [];
            let promises = [];
                        response.forEach(ahu => {
                            let promise = new Promise((resolve, reject) => {
                                controller.latestValues(ahu.id, (err, resval) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        let ahuArr = [];
                                        resval.forEach(val => {
                                            resval.forEach(val_cmd=>{
                                                // console.log("IM here")
                                                if (val_cmd.param_id === "SAT_SP" && val.param_id === "SAT"){
                                                    console.log("Im here see")
                                                console.log("device_id",val.ss_id,"param_id",val_cmd.param_id ,"val",val_cmd.param_value,val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                                    if(val_cmd.param_value - val.param_value > 1 || val_cmd.param_value - val.param_value < -0.5){
                                                        // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                                        ahuArr.push({
                                                            "ss_id": val.ss_id,
                                                            "alarm_code": '303',
                                                            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                                                            "param_id": 'SAT',
                                                            "message": 'Supply Air Temperature Mismatch'
                                                        });
                                                    // }
                                                    }else{
                                                        ahuArr.push({
                                                            "ss_id": val.ss_id,
                                                            "alarm_code": ''
                                                        })
                                                    }
                                                } 
                                                if (val_cmd.param_id === "RAT_SP" && val.param_id === "RAT"){
                                                    console.log("Im not going here")
                                                    console.log("device_id",val.ss_id,"param_id",val_cmd.param_id ,"val",val_cmd.param_value,val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                                    if(val_cmd.param_value - val.param_value > 1 || val_cmd.param_value - val.param_value < -0.5){
                                                        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.param_value)
                                                        ahuArr.push({
                                                            "ss_id": val.ss_id,
                                                            "alarm_code": '301',
                                                            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                                                            "param_id": 'RAT',
                                                            "message": 'Return Air Temperature Mismatch'
                                                        });
                                                    // }
                                                    }else{
                                                        ahuArr.push({
                                                            "ss_id": val.ss_id,
                                                            "alarm_code": ''
                                                        })
                                                    }
                                                }
                                                // if (val_cmd.param_id === "VAV_ZAT_SP" && val.param_id === "VAV_ZAT"){
                                                //     if(val_cmd.param_value - val.param_value > 1 || val_cmd.param_value - val.param_value < -1){
                                                //         // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                                //         ahuArr.push({
                                                //             "ss_id": val.ss_id,
                                                //             "alarm_code": '322',
                                                //             "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                                                //             "param_id": 'VAV_ZAT',
                                                //             "message": 'Zonal Temperature Mismatch'
                                                //         });
                                                //     // }
                                                //     }else{
                                                //         ahuArr.push({
                                                //             "ss_id": val.ss_id,
                                                //             "alarm_code": ''
                                                //         })
                                                //     }
                                                // }
                                            }) 
                                        });
                                        resolve(ahuArr);
                                    }
                                });
                            });
                        
                            promises.push(promise);
                        });
            
            Promise.all(promises)
                .then(results => {
                    results.forEach(ahuArr => {
                        arr = arr.concat(ahuArr);
                    });
                    // console.log("Final array of alarms list", arr);
                    const groupedData = arr.reduce((acc, obj) => {
                        const key = obj.ss_id;
                        if (!acc[key]) {
                            acc[key] = [];
                        }
                        acc[key].push(obj);
                        return acc;
                        }, {});          
                        console.log("group",groupedData);
                        controller.getAlarmData(groupedData,(err,results)=>{
                            if(err){
                                callback(err)
                            }else{
                               console.log("inserted or updated or restored")
                            }
                        })
                })
                .catch(err => {
                    console.error(err);
                });

        }
    ])
})
// console.log("response",response)
// response.forEach(element => {
//     dataload.pullForLatest(element.id)
// });

/*
 console.log("ahus for checking alarms", response);
let arr = [];
let promises = [];
            response.forEach(ahu => {
                let promise = new Promise((resolve, reject) => {
                    controller.latestValues(ahu.id, (err, resval) => {
                        if (err) {
                            reject(err);
                        } else {
                            let ahuArr = [];
                            resval.forEach(val => {
                                resval.forEach(val_cmd=>{
                                    // console.log("IM here")
                                    if (val_cmd.param_id === "SAT_SP" && val.param_id === "SAT"){
                                        console.log("Im here see")
                                    console.log("device_id",val.ss_id,"param_id",val_cmd.param_id ,"val",val_cmd.param_value,val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                        if(val_cmd.param_value - val.param_value > 1 || val_cmd.param_value - val.param_value < -0.5){
                                            // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                            ahuArr.push({
                                                "ss_id": val.ss_id,
                                                "alarm_code": '303',
                                                "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                                                "param_id": 'SAT',
                                                "message": 'Supply Air Temperature Mismatch'
                                            });
                                        // }
                                        }else{
                                            ahuArr.push({
                                                "ss_id": val.ss_id,
                                                "alarm_code": ''
                                            })
                                        }
                                    } 
                                    if (val_cmd.param_id === "RAT_SP" && val.param_id === "RAT"){
                                        console.log("Im not going here")
                                        console.log("device_id",val.ss_id,"param_id",val_cmd.param_id ,"val",val_cmd.param_value,val.ss_id,"param_id",val.param_id ,"val",val.param_value)
                                        if(val_cmd.param_value - val.param_value > 1 || val_cmd.param_value - val.param_value < -0.5){
                                            // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.param_value)
                                            ahuArr.push({
                                                "ss_id": val.ss_id,
                                                "alarm_code": '301',
                                                "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                                                "param_id": 'RAT',
                                                "message": 'Return Air Temperature Mismatch'
                                            });
                                        // }
                                        }else{
                                            ahuArr.push({
                                                "ss_id": val.ss_id,
                                                "alarm_code": ''
                                            })
                                        }
                                    }
                                }) 
                            });
                            resolve(ahuArr);
                        }
                    });
                });
            
                promises.push(promise);
            });

Promise.all(promises)
    .then(results => {
        results.forEach(ahuArr => {
            arr = arr.concat(ahuArr);
        });
        // console.log("Final array of alarms list", arr);
        const groupedData = arr.reduce((acc, obj) => {
            const key = obj.ss_id;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
            }, {});          
            console.log("group",groupedData);
            controller.getAlarmData(groupedData,(err,results)=>{
                if(err){
                    callback(err)
                }else{
                   console.log("inserted or updated or restored")
                }
            })
    })
    .catch(err => {
        console.error(err);
    });
*/