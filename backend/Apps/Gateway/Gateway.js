const schedule = require('node-schedule');
const controller = require('./controller');
const logger = require('../../Config/logger');

// schedule.scheduleJob('0 * * * *', () => {
schedule.scheduleJob('* * * * *', () => {
  controller.gatewayStatusNow((err, resp) => {
    if (err) {
      logger.error(err);
    }
  });
});
