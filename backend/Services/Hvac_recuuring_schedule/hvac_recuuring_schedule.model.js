const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const { result } = require('lodash');
const { query } = require('winston');
const { end } = require('../../Config/logger');
const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });


const updateSchedule = (data,deviceId,callback)=>{
    console.log("record",JSON.stringify(data))
    console.log("deviceId",deviceId)
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "update hvac_recurring_schedule set data=?,status=? where id=?";
            connection.query(query,[JSON.stringify(data),0,deviceId],(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }
    })
}


const getSchedule = (callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = "select * from hvac_recurring_schedule";
            connection.query(query,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                   // console.log("get results",results)
                    callback(null,results)
                }
            })
        }
    })
}
module.exports={
    updateSchedule,
    getSchedule
}