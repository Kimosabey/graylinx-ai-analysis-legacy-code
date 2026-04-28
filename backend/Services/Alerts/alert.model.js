const { pool } = require('../../Database/pool');

const deviceAlerts = (campusId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql ='select d.name as device_name,z.name as zone_name,a.name as area_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join area a on a.id = d.area_id left join zone z on z.id = a.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id left join campus c on c.id=b.campus_id where c.id=? and (l.created_at < date_sub(CURRENT_TIMESTAMP(),INTERVAL 45 minute) OR l.created_at is NULL)'
     //before adding area level
      // 'select d.name as device_name,z.name as zone_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join zone z on z.id = d.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id left join campus c on c.id=b.campus_id where c.id=? and (l.created_at < date_sub(CURRENT_TIMESTAMP(),INTERVAL 45 minute) OR l.created_at is NULL)';
    connection.query(sql, campusId, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const deviceBatteryAlerts = (campusId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    }
    const sql ='select d.name as device_name,z.name as zone_name,a.name as area_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d left join latest_event l on l.device_id = d.id left join area a on a.id = d.area_id left join zone z on z.id = a.zone_id left join floor f on f.id = z.floor_id left join building b on b.id=f.building_id left join campus c on c.id=b.campus_id where c.id=? and d.type="occupancy_sensor" or d.type = "thl_sensor"'
    // before adding area level
      // 'select d.name as device_name,z.name as zone_name,f.name as floor_name,b.name as building_name,d.mac as device_address,l.created_at,l.data,d.type as device_type from device d  left join latest_event l on l.device_id = d.id left join zone z on z.id = d.zone_id left join floor f on f.id = z.floor_id  left join building b on b.id=f.building_id left join campus c on c.id=b.campus_id where c.id=? and d.type="occupancy_sensor" or d.type = "thl_sensor"';
    connection.query(sql, campusId, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

const gatewayAlerts = callback => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    }
    const sql = 
    'select g.name as device_name,z.name as zone_name, f.name as floor_name, b.name as building_name, g.ip, g.status from gateway g ,gateway_mapping gm,zone z,floor f,building b where g.id = gm.gateway_id and gm.zone_id = z.id and f.id = z.floor_id and b.id=f.building_id group by g.ip';
    //before area level added
    // 'select g.name as device_name,z.name as zone_name, f.name as floor_name, b.name as building_name, g.ip, g.status from gateway g ,gateway_mapping gm,zone z,floor f,building b where g.id = gm.gateway_id and gm.zone_id = z.id and f.id = z.floor_id and b.id=f.building_id group by g.ip'; 
    // 'select g.name as device_name, g.ip, g.status from gateway g ,gateway_mapping gm,zone z where g.id = gm.gateway_id and gm.zone_id = z.id group by g.ip';
    connection.query(sql, (err, results) => {
      connection.release();
      if (err) {
        callback(err);
      }
      callback(null, results);
    });
  });
};

module.exports = {
  deviceAlerts,
  gatewayAlerts,
  deviceBatteryAlerts
};
