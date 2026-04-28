const _ = require('lodash');
const { compareAsc, format, startOfToday } = require('date-fns');
const logger = require('../../Config/logger');
const model = require('./analytics.model');

const occupancyCharts = (floorId, callback) => {
  model.occupancyCharts(floorId, (error, result) => {
    if (error) {
      callback(error);
    } else {
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i].occupancy = Math.round(
            _.mean(JSON.parse(result[i].occupancy))
          );
        }
        callback(null, result);
      } else {
        callback({ message: 'No Data Avialable', status: 404 });
      }
    }
  });
};

const occupancyCards = (floorId, timing, callback) => {
  if (timing === 'day') {
    model.occupancyCardsDay(floorId, (err, result) => {
      if (err) {
        callback(err);
      } else {
        if (result) {
          const max = [];
          const min = [];
          for (let i = 0; i < result.length; i++) {
            let today = startOfToday();
            // let today = moment()
            //   .hours(0)
            //   .minutes(0)
            //   .seconds(0);
            result[i].occupancy = JSON.parse(result[i].occupancy).map(each => ({
              timestamp: today.add(1, 'hours').format(),
              occupancy: each
            }));
            let temp = _.maxBy(result[i].occupancy, each => each.occupancy);
            temp['zone_name'] = result[i].zone_name;
            max.push(temp);
            temp = _.minBy(result[i].occupancy, each => each.occupancy);
            temp['zone_name'] = result[i].zone_name;
            min.push(temp);
          }
          const response = {
            min: _.minBy(min, each => each.occupancy),
            max: _.maxBy(max, each => each.occupancy)
          };
          callback(null, response);
        } else {
          callback({ message: 'No Data Avialable', status: 404 });
        }
      }
    });
  } else if (timing === 'week') {
    model.occupancyCardsWeek(floorId, (err, result) => {
      if (err) {
        callback(err);
      } else {
        if (result) {
          const response = {
            min: _.minBy(result, each => each.occupancy),
            max: _.maxBy(result, each => each.occupancy)
          };
          callback(null, response);
        } else {
          callback({ message: 'No Data Avialable', status: 404 });
        }
      }
    });
  } else if (timing === 'month') {
    model.occupancyCardsMonth(floorId, (err, result) => {
      if (err) {
        callback(err);
      } else {
        if (result) {
          const response = {
            min: _.minBy(result, each => each.occupancy),
            max: _.maxBy(result, each => each.occupancy)
          };
          callback(null, response);
        } else {
          callback({ message: 'No Data Avialable', status: 404 });
        }
      }
    });
  } 
};

const occupancyGraph = (context, contextId, timing, callback) => {
  if (context === 'zone') {
    if (timing === 'day') {
      model.zoneOccupancyGraphDay(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            let today = startOfToday();
            // let today = moment()
            //   .hours(0)
            //   .minutes(0)
            //   .seconds(0);
            result[0].occupancy = JSON.parse(result[0].occupancy).map(each => ({
              timestamp: today.add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
              occupancy: each
            }));
            callback(null, result[0].occupancy);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else if (timing === 'week') {
      model.zoneOccupancyGraphWeek(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            callback(null, result);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else if (timing === 'month') {
      model.zoneOccupancyGraphMonth(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            callback(null, result);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else {
      callback({ message: 'Invalid Time String', status: 404 });
    }
  } else if (context === 'floor') {
    if (timing === 'day') {
      model.floorOccupancyGraphDay(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            let today = startOfToday();
            // let today = moment()
            //   .hours(0)
            //   .minutes(0)
            //   .seconds(0);
            result[0].occupancy = JSON.parse(result[0].occupancy).map(each => ({
              timestamp: today.add(1, 'hours').format('YYYY-MM-DDTHH:mm:ss'),
              occupancy: each
            }));
            callback(null, result[0].occupancy);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else if (timing === 'week') {
      model.floorOccupancyGraphWeek(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            callback(null, result);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else if (timing === 'month') {
      model.floorOccupancyGraphMonth(contextId, (err, result) => {
        if (err) {
          callback(err);
        } else {
          if (result) {
            callback(null, result);
          } else {
            callback({ message: 'No Data Avialable', status: 404 });
          }
        }
      });
    } else {
      callback({ message: 'Invalid Time String', status: 404 });
    }
  } else {
    callback({ message: 'Invalid Context Type', status: 404 });
  }
};

module.exports = {
  occupancyCharts,
  occupancyCards,
  occupancyGraph
};
