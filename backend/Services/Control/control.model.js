const { pool } = require('../../Database/pool');

const gatewayDetails = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `select g.ip,m.zone_id from gateway g , gateway_mapping m  where g.id=m.gateway_id group by m.zone_id`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(err);
    }
  });
};

const daliSlaves = (zoneId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        "SELECT mac FROM device WHERE zone_id = ? and type='DALI_SLAVE'",
        [zoneId],
        (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            callback(null, results);
          }
        }
      );
    } else {
      callback(error);
    }
  });
};

const getAnalogControllers = (zoneId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      connection.query(
        "SELECT mac FROM device WHERE zone_id = ? and type='analog_controller'",
        [zoneId],
        (err, results) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            callback(null, results);
          }
        }
      );
    } else {
      callback(error);
    }
  });
};

module.exports = {
  gatewayDetails,
  daliSlaves,
  getAnalogControllers
};
