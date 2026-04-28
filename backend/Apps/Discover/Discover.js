const schedule = require('node-schedule');
const model=require('./model')
const controller = require('./controller');
const logger = require('../../Config/logger');

schedule.scheduleJob('*/5 * * * * *', () => {
    controller.BacnetDeviceStatusNow((err, resp) => {
     if (err) {
       logger.error(err.message);
     }else{
              console.log("done")
     }
    });
   });