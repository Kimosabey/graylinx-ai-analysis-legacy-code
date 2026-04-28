const schedule = require('node-schedule');
const controller = require('../../hvacBACnetClient');
const logger = require('../../Config/logger');
const axios = require('axios');
const fs = require('fs');


//schedule.scheduleJob('0 * * * *', () => {
schedule.scheduleJob('*/10 * * * * *', () => {
  console.log("startedd")
 controller.discoverDevices((err, resp) => {
  if (err) {
    logger.error(err);
  }else{

  //   var stream = fs.createWriteStream("bacnetDiscoveryData.txt");
  // // stream.once('open', function(fd) {
  //   stream.appendFile(JSON.stringify(resp));
  //   console.log("wrote")
  //   stream.end();
  // // });
      logger.info(JSON.stringify(resp) )
  }

  

 });
});


