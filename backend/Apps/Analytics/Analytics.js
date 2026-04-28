const schedule = require('node-schedule');
const controller = require('./controller');
const logger = require('../../Config/logger');

// run every hour at 00 mins.
schedule.scheduleJob('0 * * * *', () => {
  controller.hourlyOccupancyFloor((err, result) => {
    if (err) {
      logger.error(err);
    }
  });
  controller.hourlyOccupancyZone((err, res) => {
    if (err) {
      logger.error(err);
    }
  });
});

// run everyday at 00:02 hrs
schedule.scheduleJob('2 0 * * *', () => {
  controller.dailyOccupancyFloor((err, result) => {
    if (err) {
      logger.error(err);
    }
  });
  controller.dailyOccupancyZone((err, result) => {
    if (err) {
      logger.error(err);
    }
  });
});
