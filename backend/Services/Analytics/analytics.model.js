const { pool } = require('../../Database/pool');

const occupancyCharts = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select df.zone_id as zoneId,z.name as zone_name,df.occupancy from daily_zone_occupancy df,zone z  where z.id = df.zone_id and z.floor_id=? and df.created_at >= curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const occupancyCardsDay = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select df.zone_id as zoneId,z.name as zone_name,df.occupancy from daily_zone_occupancy df,zone z  where z.id = df.zone_id and z.floor_id=? and df.created_at >= curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const occupancyCardsWeek = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select df.zone_id as zoneId,z.name as zone_name,df.avg_occupancy as occupancy,df.created_at as timestamp from daily_zone_occupancy df,zone z  where z.id = df.zone_id and z.floor_id=? and  df.created_at >= date_sub(curdate(),interval 7 day) and df.created_at < curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const occupancyCardsMonth = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select df.zone_id as zoneId,z.name as zone_name,df.avg_occupancy as occupancy,df.created_at as timestamp from daily_zone_occupancy df,zone z  where z.id = df.zone_id and z.floor_id=? and  df.created_at >= date_sub(curdate(),interval 30 day) and df.created_at < curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const floorOccupancyGraphDay = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select occupancy from daily_floor_occupancy where floor_id=? and created_at >= curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const floorOccupancyGraphWeek = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select avg_occupancy as occupancy,Date(created_at) as timestamp from daily_floor_occupancy where floor_id=? and created_at >= date_sub(curdate(),interval 7 day) and created_at < curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const floorOccupancyGraphMonth = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select avg_occupancy as occupancy,Date(created_at) as timestamp from daily_floor_occupancy where floor_id=? and created_at >= date_sub(curdate(),interval 30 day) and created_at < curdate();';
      connection.query(query, floorId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const zoneOccupancyGraphMonth = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select avg_occupancy as occupancy,Date(created_at) as timestamp from daily_zone_occupancy where zone_id=? and created_at >= date_sub(curdate(),interval 30 day) and created_at < curdate();';
      connection.query(query, zoneId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const zoneOccupancyGraphDay = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select occupancy from daily_zone_occupancy where zone_id=? and created_at >= curdate();';
      connection.query(query, zoneId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const zoneOccupancyGraphWeek = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query =
        'select avg_occupancy as occupancy,Date(created_at) as timestamp from daily_zone_occupancy where zone_id=? and created_at >= date_sub(curdate(),interval 7 day) and created_at < curdate();';
      connection.query(query, zoneId, (error, response) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (response.length > 0) {
            callback(null, response);
          } else {
            callback(null, false);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

module.exports = {
  occupancyCharts,
  occupancyCardsDay,
  occupancyCardsWeek,
  occupancyCardsMonth,
  zoneOccupancyGraphDay,
  floorOccupancyGraphDay,
  zoneOccupancyGraphWeek,
  floorOccupancyGraphWeek,
  zoneOccupancyGraphMonth,
  floorOccupancyGraphMonth
};
