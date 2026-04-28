const _ = require('lodash');
const uuid = require('uuid/v4');
const { compareAsc, format } = require('date-fns');
const model = require('./hvac_recuuring_schedule.model');
const { response } = require('express');


const updateSchedule = (record,deviceId,callback)=>{
    // console.log("record",record)
    model.updateSchedule(record,deviceId,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getSchedule = (callback)=>{
    model.getSchedule((err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

module.exports={
    updateSchedule,
    getSchedule
}