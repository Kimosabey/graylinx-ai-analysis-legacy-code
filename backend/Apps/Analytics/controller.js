const _ = require('lodash');
const { compareAsc, format,getHours } = require('date-fns');

const model = require('./model');

const hourlyOccupancyZone = callback => {
  model.hourlyOccupancy((err, response) => {
    if (err) {
      callback(err);
    } else {
      const zoneWise = _.chain(response)
        .groupBy('zone_id')
        .map((item, key) => ({
          zone_id: key,
          occupancy: Math.round(
            _.meanBy(item, res => Math.round(JSON.parse(res.data).occupancy)) *
              100
          )
        }))
        .value();
      zoneWise.forEach(each => {
        model.getZonesTodaysOccupany(each.zone_id, (err1, result) => {
          if (err1) {
            callback(err1);
          } else {
            if (result) {
              model.updateOccupancyEntryZone(each, (err2, res) => {
                if (err2) {
                  callback(err2);
                } else {
                  callback(null, 'success');
                }
              });
            } else {
              const hour = getHours(new Date());
              const { occupancy } = each;
              const past_occupancy = [];
              for (let i = 1; i < hour; i++) {
                past_occupancy.push(0);
              }
              past_occupancy.push(occupancy);
              model.createOccupancyEntryZone(
                each.zone_id,
                past_occupancy,
                (err2, resp) => {
                  if (err2) {
                    callback(err2);
                  } else {
                    callback(null, 'success');
                  }
                }
              );
            }
          }
        });
      });
    }
  });
};

const hourlyOccupancyFloor = callback => {
  model.hourlyOccupancy((err, response) => {
    if (err) {
      callback(err);
    } else {
      const floorWise = _.chain(response)
        .groupBy('floor_id')
        .map((item, key) => ({
          floor_id: key,
          occupancy: Math.round(
            _.meanBy(item, res => Math.round(JSON.parse(res.data).occupancy)) *
              100
          )
        }))
        .value();
      floorWise.forEach(each => {
        model.getFloorsTodaysOccupany(each.floor_id, (err1, result) => {
          if (err1) {
            callback(err1);
          } else {
            if (result) {
              model.updateOccupancyEntryFloor(each, (err2, res) => {
                if (err2) {
                  callback(err2);
                } else {
                  callback(null, 'success');
                }
              });
            } else {
              const hour = getHours(new Date());
              const { occupancy } = each;
              const past_occupancy = [];
              for (let i = 1; i < hour; i++) {
                past_occupancy.push(0);
              }
              past_occupancy.push(occupancy);
              model.createOccupancyEntryFloor(
                each.floor_id,
                past_occupancy,
                (err3, resp) => {
                  if (err3) {
                    callback(err3);
                  } else {
                    callback(null, 'success');
                  }
                }
              );
            }
          }
        });
      });
    }
  });
};

const dailyOccupancyZone = callback => {
  model.dailyOccupancyZone((err, result) => {
    if (err) {
      callback(err);
    } else {
      if (result) {
        result.forEach(each => {
          const avg_occupancy = Math.round(
            _.meanBy(JSON.parse(each.occupancy))
          );
          model.updateAvgDailyOccupancyZone(
            each.zone_id,
            avg_occupancy,
            (error, resp) => {
              if (error) {
                callback(error);
              } else {
                callback(null, resp);
              }
            }
          );
        });
      }
    }
  });
};

const dailyOccupancyFloor = callback => {
  model.dailyOccupancyFloor((err, result) => {
    if (err) {
      callback(err);
    } else {
      if (result) {
        result.forEach(each => {
          const avg_occupancy = Math.round(
            _.meanBy(JSON.parse(each.occupancy))
          );
          model.updateAvgDailyOccupancyFloor(
            each.floor_id,
            avg_occupancy,
            (error, resp) => {
              if (error) {
                callback(error);
              } else {
                callback(null, resp);
              }
            }
          );
        });
      }
    }
  });
};

module.exports = {
  dailyOccupancyZone,
  dailyOccupancyFloor,
  hourlyOccupancyFloor,
  hourlyOccupancyZone
};
