const os = require('os');
const fs = require('fs');
const controller = require('./controller');
const { format,setHours, setMinutes, setSeconds } = require('date-fns');
const schedule = require('node-schedule');
const async = require('async');
const { response } = require('express');

// add this queries before running this file
/*
  CREATE TABLE `gl_metric` (
  `id` varchar(256) NOT NULL,
  `name` varchar(256) DEFAULT NULL,
  `tag` varchar(256) DEFAULT NULL,
  `description` varchar(1024) DEFAULT NULL,
  `unit` varchar(256) DEFAULT NULL,
  `unit_display` varchar(64) DEFAULT NULL,
  `ss_type` varchar(256) DEFAULT NULL,
  `time_window` varchar(36) DEFAULT NULL,
  `computing_methodology` varchar(256) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `id` (`id`)
);

insert into gl_metric(id,name,time_window)values
('cpu_usage','CPU USAGE','15 MINS'),
('memory_usage','MEMORY USAGE','15 MINS'),
('db_connections','DB CONNECTIONS','15 MINS');

CREATE TABLE `server_instrumentation` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ss_id` varchar(36) DEFAULT NULL,
  `measured_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `metric_id` varchar(36) DEFAULT NULL,
  `metric_value` varchar(36) DEFAULT NULL,
  `metric_minimum` varchar(36) DEFAULT NULL,
  `metric_average` varchar(36) DEFAULT NULL,
  `metric_maximum` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ss_id` (`ss_id`),
  KEY `metric_id` (`metric_id`),
  CONSTRAINT `server_instrumentation_ibfk_1` FOREIGN KEY (`ss_id`) REFERENCES `gl_subsystem` (`id`),
  CONSTRAINT `server_instrumentation_ibfk_2` FOREIGN KEY (`metric_id`) REFERENCES `gl_metric` (`id`)
);
*/

// const logUsage = (callback) => {
  // schedule.scheduleJob('*/5 * * * * *' , () =>{
      schedule.scheduleJob('*/15 * * * *' , () =>{
    async.waterfall([
      callback =>{
        const cpuUsage = (os.cpus()[0].times.user / os.cpus()[0].times.sys) * 100;
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
        const currentTime = new Date();
        const logDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");;
      
        const logLine = `${currentTime.toLocaleString()} - CPU Usage: ${cpuUsage.toFixed(2)}%, Memory Usage: ${memoryUsage.toFixed(2)}%\n`;
        // console.log(logLine)
        const my_obj ={}
        my_obj["cpu_usage"] = cpuUsage.toFixed(2)
        my_obj["memory_usage"] = memoryUsage.toFixed(2)
        my_obj["measured_time"] = logDate
        controller.getConnections((err,res)=>{
          if(err){
            callback(err)
          }else{
            my_obj["db_connections"] = res[0].Value
            controller.getServerId((err1,res1)=>{
              if(err1){
                callback(err1)
              }else{
                my_obj["ss_id"] = res1[0].id
                controller.insertIntoMertic(my_obj,(err2,res2)=>{
                  if(err2){
                    callback(err2)
                  }else{
                    callback(null,res2)
                  }
                })
              }
            })
          }
        })
      }
    ],(err, response) => {
      if (err) {
          console.log('error', err);
      } else {
          console.log('done');
      }
  });
  })
// }
// logUsage((err, result) => {
//   if (err) {
//     console.error("Error occurred:", err);
//   } else {
//     console.log("Operation successful. Result:", result);
//   }
// });

// setInterval(logUsage, 10000);