const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const createCampus = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err);
    } else {
      console.log("name", payload.name)
      console.log("org id", payload.organization_id)
      var query;
      query = 'SELECT * FROM campus WHERE name = ? AND organization_id = ?';
      connection.query(query, [payload.name, payload.organization_id], (err, results) => {
        if (results.length > 0) {
          connection.release();
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Campus;" +
            "; RESULT: Campus Name already exists; USER: admin; ROLE: super_admin")
          callback(err1)
        }
        else {
          connection.query('INSERT INTO campus SET ?', payload, error => {
            if (error) {
              connection.release();
              callback(error);
            } else {
              connection.query('UPDATE user SET campus_id = ? WHERE role_name = ?', [payload.id, 'superAdmin'], update_campus_error => {
                connection.release();
                if (update_campus_error) {
                  callback(update_campus_error);
                }
                else {
                  logger.info("ACTION: Create Campus; CAMPUS ID: " + payload.id +
                    "; RESULT: Success; USER: admin; ROLE: super_admin")
                  callback(null, payload.id);
                }
              })
            }
          });
        }
      })

    }
  });
};

const getCampusTree = (campusId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const sql =
      'select * ' +
        'from campus left outer join building on building.campus_id = campus.id ' +
        'left outer join floor on floor.building_id = building.id ' +
        'left outer join zone on zone.floor_id = floor.id ' +
        'left outer join area on area.zone_id = zone.id ' +
        'left outer join device on device.area_id = area.id ' +
        'where campus.id = ? and (device.type IN (?))';
      //before adding area level
        // 'select * ' +
        // 'from campus left outer join building on building.campus_id = campus.id ' +
        // 'left outer join floor on floor.building_id = building.id ' +
        // 'left outer join zone on zone.floor_id = floor.id ' +
        // 'left outer join device on device.zone_id = zone.id ' +
        // 'where campus.id = ? and (device.type IN (?))';
      const devices = [
        'energy_meter',
        'occupancy_sensor',
        'thl_sensor',
        'co2_sensor',
        'vav',
        'dali_slave',
        'dali_master',
        'parking_sensor',
        'parking_controller',
        'analog_controller'
      ];
      connection.query(
        { sql, nestTables: true },
        [campusId, devices],
        (error1, rows) => {
          connection.release();
          if (error1) {
            callback(error1);
          } else {
            callback(null, rows);
          }
        }
      );
    }
  });
};

const editCampusName = (campus, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'UPDATE campus SET name = ? where id = ?',
        [campus.name, campus.id],
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              callback(null, results);
            } else {
              callback({ message: 'Campus Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};
const deleteCampus = (campusId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM campus where id = ?',
        campusId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              callback(null, results);
            } else {
              callback({ message: 'Campus Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

const deviceList = (campusId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        'select o.id as org_id, o.name as org_name, c.id as campus_id, c.name as campus_name, b.id as building_id, b.name as building_name, f.id as floor_id,f.name as floor_name,z.id as zone_id,z.name as zone_name,d.id as device_id ,d.name as device_name,d.mac as device_mac,d.type as device_type,g.name as gateway_name,g.id as gateway_id,a.id as area_id,a.name as area_name from organization o left join campus c on c.organization_id = o.id left join building b on b.campus_id = c.id left join floor f on f.building_id = b.id left join zone z on z.floor_id = f.id left join area a on a.zone_id=z.id left join device d on d.area_id = a.id inner join gateway_mapping gm on gm.zone_id = z.id inner join gateway g on gm.gateway_id=g.id where z.id =?;';
      connection.query(query, campusId, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, response);
        }
      });
    }
  });
};

module.exports = {
  createCampus,
  getCampusTree,
  editCampusName,
  deleteCampus,
  deviceList
};
