const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const createBuilding = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err);
    } else {
      const query = 'SELECT * FROM building WHERE name = ? AND campus_id = ?';
      connection.query(query, [payload.name, payload.campus_id], (error, result) => {
        if(result.length > 0)
        {
          connection.release();
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Building;"+
              "; RESULT: Building Name already exists; USER: admin; ROLE: super_admin")
          callback(err1);
        }
        else
        {
          connection.query('INSERT INTO building SET ?', payload, error1 => {
            connection.release();
            if (error1) {
              callback(error1);
            } else {
              logger.info("ACTION: Create Building; ORG ID: "+payload.id+
              "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, payload.id);
            }
          });
        }
      });
      
    }
  });
};

const lights = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
      "select d.mac,d.name,d.type,d.device_info,a.id as area_id,a.name as area_name,z.name as zone_name,z.id as zone_id,f.name as floor_name,l.data from device d left join latest_event l on l.device_id=d.id inner join area a on d.area_id=a.id  inner join zone z on z.id=a.zone_id  inner join floor f on f.id=z.floor_id  inner join building b on f.building_id=b.id where b.id=? and (d.type='dali_master' or d.type='dali_slave' or d.type='analog_controller')"
       //before adding zone level
        // "select d.mac,d.name,d.type,d.device_info,d.zone_id,z.name as zone_name,f.name as floor_name,l.data from device d left join latest_event l on l.device_id=d.id  inner join zone z on z.id=d.zone_id inner join floor f on f.id=z.floor_id  inner join building b on f.building_id=b.id where b.id=? and (d.type='dali_master' or d.type='dali_slave' or d.type='analog_controller');";
      connection.query(query, buildingId, (error1, response) => {
        connection.release();
        if (error1) {
          callback(error1);
        } else {
          let data=[]
          response.forEach((each,index)=>{
            record={}
            if(!each.data){
              if(each.type=="dali_slave"){
                console.log("name dalii",each.name)
                record["mac"]=each.mac
                record["name"]=each.name
                record["type"]=each.type
                record["device_info"]=each.device_info
                record["area_id"]=each.area_id
                record["area_name"]=each.area_name
                record["zone_id"]=each.zone_id
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["data"]='{"mode": "Auto", "health": "alive", "light_level": 100}'
                data.push(record)
                index++
                if(index===response.length){

                  callback(null,data)
                }
              }
              else if(each.type=="analog_controller"){
                record["mac"]=each.mac
                record["name"]=each.name
                record["type"]=each.type
                record["device_info"]=each.device_info
                record["area_id"]=each.area_id
                record["area_name"]=each.area_name
                record["zone_id"]=each.zone_id
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["data"]='{"type": "event","channel1mode": "Auto", "channel2mode": "Auto", "channel3mode": "Auto", "channel4mode": "Auto", "channel1level": 100, "channel2level": 100, "channel3level": 173, "channel4level": 40, "totalConnectedPIR": 1, "totalConnectedTHL": 0, "totalConnectedchannels": 2}'
                data.push(record)
                index++
                if(index===response.length){
                  callback(null,data)
                }
              }   else if(each.type=="dali_master"){
                record["mac"]=each.mac
                record["name"]=each.name
                record["type"]=each.type
                record["device_info"]=each.device_info
                record["area_id"]=each.area_id
                record["area_name"]=each.area_name
                record["zone_id"]=each.zone_id
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["data"]='{"noOfLightConnected":11,"noOfPirConnected":9 ,"noOfThlConnected":0}'
                data.push(record)
                index++
                if(index===response.length){
                  callback(null,data)
                }
              }
            }else{
              record["mac"]=each.mac
              record["name"]=each.name
              record["type"]=each.type
              record["device_info"]=each.device_info
              record["area_id"]=each.area_id
              record["area_name"]=each.area_name
              record["zone_id"]=each.zone_id
              record["zone_name"]=each.zone_name
              record["floor_name"]=each.floor_name
              record["data"]=each.data
              data.push(record)
              index++
                if(index===response.length){
                  callback(null,data)
                }
            }
          })
          // callback(null, response);
        }
      });
    }
  });
};

const deviceList = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select d.name as device_name,d.type,z.name as zone_name,f.name as floor_name,json_extract(`data`, '$.battery') as battery,json_extract(`network_data`, '$.lqi') as lqi,json_extract(`network_data`, '$.rssi') as rssi,l.created_at as updated_at  from (device d,floor f,zone z) left outer join latest_event  l on (l.device_id = d.id) where f.building_id=? and f.id=z.floor_id and d.zone_id=z.id;";
      connection.query(query, buildingId, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          response.map(res => {
            let battery_val = JSON.parse(res.battery)
            
            if(battery_val - Math.floor(battery_val) !== 0) {
              res.battery = battery_val.toFixed(2)
              return res
            }
            
          })
          callback(null, response);
        }
      });
    } 
  });
};

const luxSummary = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select * from latest_event where building_id = ? and created_at > date_sub(CURRENT_TIMESTAMP(),INTERVAL 1 day) and device_type='thl_sensor'";
      connection.query(query, buildingId, (error1, response) => {
        connection.release();
        if (error1) {
          callback(error1);
        } else {
          callback(null, response);
        }
      });
    }
  });
};

const summaryParameter = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select * from latest_event where building_id = ? and created_at > date_sub(CURRENT_TIMESTAMP(),INTERVAL 1 day) and (device_type='energy_meter' or device_type='thl_sensor')";
        connection.query(query, buildingId, (err, response) => {
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

const editBuildingName = (building, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(`select count(*) as count from building where name = ? and campus_id = ?`, [building.name, building.parent_id], (error, countsResult) => {
        
        if(countsResult[0].count > 0) {
          console.log(`'${building.name}' already exists`);
          callback({ message: `'${building.name}' already exists`, status: 422 });
        }
        else {
              connection.query(
                'UPDATE building SET name = ? where id = ?',
                [building.name, building.id],
                (update_building_error, results) => {
                  connection.release();
                  if (update_building_error) {
                    callback(update_building_error);
                  } else {
                    if (results.affectedRows === 1) {
                      logger.info("ACTION: Edit Building Name; BUILDING ID: "+building.id+
                      "; RESULT: Success; USER: admin; ROLE: super_admin")
                      callback(null, results);
                    } else {
                      logger.error("ACTION: Edit Building Name; BUILDING ID: "+building.id+
                      "; RESULT: Building Not Found; USER: admin; ROLE: super_admin")
                      callback({ message: 'Building Not Found', status: 404 });
                    }
                  }
                }
              );

        } 
      })
          
    } else {
      callback(err);
    }
  });
};

const deleteBuilding = (buildingId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM building where id = ?',
        buildingId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info("ACTION: Delete Building; BUILDING ID: "+buildingId+
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, results);
            } else {
              logger.error("ACTION: Delete Building; BUILDING ID: "+building.id+
                "; RESULT: Building Not Found; USER: admin; ROLE: super_admin")
              callback({ message: 'Building Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

module.exports = {
  summaryParameter,
  createBuilding,
  deviceList,
  luxSummary,
  editBuildingName,
  deleteBuilding,
  lights
};
