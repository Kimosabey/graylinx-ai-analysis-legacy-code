const { pool } = require('../../Database/pool');

const floorParkingStatus = (buildingId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const sql =
        'select floor_id, floor_name, floor_number, device_id, device_name, data from latest_event where building_id=? and floor_number IS NOT NULL order by floor_number';
      connection.query(sql, [buildingId], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (results.length === 0) {
            callback({ message: 'Sensor Data Empty', status: 404 });
          } else {
            callback(null, results);
          }
        }
      });
    } else {
      callback(err);
    }
  });
};

const getRegisteredDeviceCount = (contextType, id, callback) => {
  pool.getConnection((err, connection) => {
    let sql;
    if (contextType === 'buildings') {
      sql =
        'select count(*) as count from device ' +
        'left join zone on zone.id = device.zone_id ' +
        'left join floor on floor.id = zone.floor_id ' +
        ' where floor.building_id =? and device.type=? ';
    } else if (contextType === 'floors') {
      sql =
        'select count(*) as count from device ' +
        ' left join zone on zone.id = device.zone_id ' +
        ' where zone.floor_id =? and device.type=? ';
    }
    if (connection) {
      connection.query(sql, [id, 'parking_sensor'], (error, result) => {
        connection.release();
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

const getParkingSensorStatus = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const sql =
        'select floor_name, floor_number,  zone_id, zone_name, device_id, device_name, data from latest_event where floor_id=? and device_type="parking_sensor"';
      connection.query(sql, [floorId], (error, results) => {
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

const getFloorDetails = (floorNumber, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const sql =
        'select id, name, floor_number from floor where floor_number=?';
      connection.query(sql, [floorNumber], (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          if (results.length === 0) {
            callback({ message: 'Floor not found', status: 404 });
          } else {
            callback(null, results);
          }
        }
      });
    } else {
      callback(err);
    }
  });
}

module.exports = {
  floorParkingStatus,
  getParkingSensorStatus,
  getRegisteredDeviceCount,
  getFloorDetails
};
