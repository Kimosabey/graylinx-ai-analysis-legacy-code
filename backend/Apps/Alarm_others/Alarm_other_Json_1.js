const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const fns = require('date-fns');
const cpm_data = require('../../CPM_modular/CPM_Data_Handler');
const cpmUtils = require('../../CPM_modular/CPM_Utilities');
// const latest_data = require('../../Services/Device/myIBMSPreparation');
// schedule.scheduleJob('*/10 * * * * *',() =>{
const axiosc = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });

 schedule.scheduleJob('*/10 * * * * *',() =>{
      async.waterfall([
        callback=>{
            cpm_data.sendDataToAlarms((err, groupedData) => {
                if (err) {
                    console.error("Error:", err);
                } else {

                    // console.log("Calling Send Data to Alarms",groupedData)
                    controller.getAlarmData(groupedData,(err,results)=>{
                        if(err){
                            console.log(`Error in get Alarm Data`,err)
                            callback(err)
                        }else{
                            // console.log("inserted or updated or restored-->",results);
                            callback(null,results);
                        }
                 });
                }
            });
            
        }],(err, response) => {
            if (err) {
            console.log('error', err);
            } else {
            console.log("********My final response*************",response)
            }
        }
    );
})

const alarm = () =>{
    return ;
}

module.exports = {
    // getMyData,
    // getMyData2,
    alarm
}