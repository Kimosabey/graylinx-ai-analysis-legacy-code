const { pool } = require('../../Database/pool');

const hourlyOccupancy = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select * from latest_event where created_at > date_sub(CURRENT_TIMESTAMP(),INTERVAL 1 day) and device_type = "occupancy_sensor"';
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const getZonesTodaysOccupany = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select occupancy from daily_zone_occupancy where zone_id = ? and created_at>=curdate()';
      connection.query(query, zoneId, (error, result) => {
        if (error) {
          callback(error);
        } else {
          if (result.length === 0) {
            callback(null, false);
          } else {
            callback(null, result);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const getFloorsTodaysOccupany = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select occupancy from daily_floor_occupancy where floor_id= ? and created_at>=curdate()';
      connection.query(query, floorId, (error, result) => {
        if (error) {
          callback(error);
        } else {
          if (result.length === 0) {
            callback(null, false);
          } else {
            callback(null, result);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const createOccupancyEntryZone = (zoneId, data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `Insert into daily_zone_occupancy(zone_id,occupancy) values ('${zoneId}',json_array(${data}))`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const createOccupancyEntryFloor = (floorId, data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `Insert into daily_floor_occupancy(floor_id,occupancy) values ('${floorId}',json_array(${data}))`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateOccupancyEntryFloor = (data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `update daily_floor_occupancy set occupancy=json_array_append(occupancy,'$',${data.occupancy}) where floor_id='${data.floor_id}' and created_at >= curdate()`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateOccupancyEntryZone = (data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `update daily_zone_occupancy set occupancy=json_array_append(occupancy,'$',${data.occupancy}) where zone_id='${data.zone_id}' and created_at >= curdate()`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateAvgDailyOccupancyFloor = (floorId, avgOcc, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `update daily_floor_occupancy set avg_occupancy=${avgOcc} where floor_id="${floorId}"`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const updateAvgDailyOccupancyZone = (zoneId, avgOcc, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `update daily_Zone_occupancy set avg_occupancy=${avgOcc} where zone_id="${zoneId}"`;
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback(err);
    }
  });
};

const dailyOccupancyFloor = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select * from daily_floor_occupancy where created_at>=curdate()';
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          if (result.length === 0) {
            callback(null, false);
          } else {
            callback(null, result);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const dailyOccupancyZone = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select * from daily_zone_occupancy where created_at>=curdate()';
      connection.query(query, (error, result) => {
        if (error) {
          callback(error);
        } else {
          if (result.length === 0) {
            callback(null, false);
          } else {
            callback(null, result);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

module.exports = {
  hourlyOccupancy,
  dailyOccupancyZone,
  dailyOccupancyFloor,
  getZonesTodaysOccupany,
  getFloorsTodaysOccupany,
  createOccupancyEntryZone,
  updateOccupancyEntryZone,
  createOccupancyEntryFloor,
  updateOccupancyEntryFloor,
  updateAvgDailyOccupancyZone,
  updateAvgDailyOccupancyFloor
};
