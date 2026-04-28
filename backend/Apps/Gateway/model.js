const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const getGatewayStatus = callback => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql =
      'select g.name,z.name as zone_name, g.ip from gateway g ,gateway_mapping gm,zone z where g.id = gm.gateway_id and gm.zone_id = z.id group by g.ip';
    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      } else {
        if (results.length > 0) {
          callback(null, results);
        } else {
          callback(null, false);
        }
      }
    });
  });
};

const updateGatewayStatus = (name, status, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql = 'update gateway set status=? where name=?';
    connection.query(sql, [status, name], (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      } else {
        callback(null, results);
      }
    });
  });
};

module.exports = {
  getGatewayStatus,
  updateGatewayStatus
};
