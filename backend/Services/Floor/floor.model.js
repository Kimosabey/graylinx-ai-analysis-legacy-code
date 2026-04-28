const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const fs = require('fs');

const createFloor = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      var query;
      query = 'SELECT * FROM floor where name = ? AND building_id = ?';
      connection.query(query, [payload.name, payload.building_id], (error, results) => {
        if (results.length > 0) {
          connection.release();
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Floor;" +
            "; RESULT: Floor Name already exists; USER: admin; ROLE: super_admin")
          callback(err1)
        }
        else {
          connection.query('INSERT INTO floor SET ?', payload, error1 => {
            connection.release();
            if (error1) {
              callback(error1);
            } else {
              logger.info("ACTION: Create Floor; FLOOR ID: " + payload.id +
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, payload.id);
            }
          });
        }
      });

    } else {
      callback(err);
    }
  });
};

const floorStats = (floorId, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query = `SELECT l.zone_id,l.zone_name,l.floor_name,l.device_name,l.device_id,l.data,d.x,d.y,d.type from latest_event l , device d where l.floor_id=? and (l.device_type="thl_sensor" or l.device_type="dali_slave" or l.device_type="analog_controller")  and d.id=l.device_id;`;
      connection.query(query, floorId, (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          const arr1 = []
          if(results.length>0){
          // const formatData = (arr1) => {
          //   results.forEach((each, i) => {
          //     data = {}
          //     if (each.type === "analog_controller") {
          //       data['zone_id'] = each.zone_id,
          //         data['zone_name'] = each.zone_name,
          //         data['floor_name'] = each.floor_name,
          //         data['device_name'] = each.device_name,
          //         data['type']=each.type,
          //         data['data'] = JSON.stringify({ channel2level: JSON.parse(each.data).channel2level, channel2mode: JSON.parse(each.data).channel2mode }),
          //         data['x'] = each.x,
          //         data['y'] = each.y,
          //         data['type'] = each.type
          //       arr1.push(data)
          //     }
          //     i++
          //     if (i == results.length) {
          //       console.log("=========leneght", arr1.length)
          //       callback(null, arr1)
          //     }
          //   })

          // }

          results.forEach((each, i) => {
            data = {}
            // if (each.type === "analog_controller") {
            //   data['zone_id'] = each.zone_id,
            //     data['zone_name'] = each.zone_name,
            //     data['floor_name'] = each.floor_name,
            //     data['device_name'] = each.device_name,
            //     data['type']=each.type,
            //     data['data'] = JSON.stringify({ channel1level: JSON.parse(each.data).channel1level, channel1mode: JSON.parse(each.data).channel1mode }),
            //     data['x'] = each.x,
            //     data['y'] = each.y,
            //     data['type'] = each.type
            //   arr1.push(data)
            //   i++
            // } else {
              data['zone_id'] = each.zone_id,
                data['zone_name'] = each.zone_name,
                data['floor_name'] = each.floor_name,
                data['device_name'] = each.device_name,
                data['type']=each.type,
                data['data'] = each.data,
                data['x'] = each.x,
                data['y'] = each.y,
                data['type'] = each.type
              arr1.push(each)
              i++
            // }
            if (i == results.length) {
             callback(null,arr1)
            }

          }

          )
          // callback(null, arr1);
          } else {
            callback(null,arr1)
          }
        }
      });
    } else {
      callback(error);
    }
  });
};

const luxSummary = (floorId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
      "select z.id as zone_id, z.name as zone_name, e.data from latest_event e , zone z,device d,area a where z.floor_id = ? and z.id=a.zone_id and a.id=d.area_id and e.device_id = d.id and e.created_at > date_sub(CURRENT_TIMESTAMP(),INTERVAL 1 day) and e.device_type='thl_sensor'";
      connection.query(query, floorId, (err, response) => {
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

const summaryParameters = (floorId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select * from latest_event where floor_id = ? and created_at > date_sub(CURRENT_TIMESTAMP(),INTERVAL 1 day) and (device_type='energy_meter' or device_type='thl_sensor')";
      connection.query(query, floorId, (err, response) => {
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

const editFloorName = (floor, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(`select count(*) as count from floor where name = ? and building_id = ?`, [floor.name, floor.parent_id], (error, countsResult) => {

        if (countsResult[0].count > 0) {
          console.log(`'${floor.name}' already exists`);
          callback({ message: `'${floor.name}' already exists`, status: 422 });
        }
        else {
          connection.query(
            'UPDATE floor SET name = ? where id = ?',
            [floor.name, floor.id],
            (update_floor_error, results) => {
              connection.release();
              if (update_floor_error) {
                callback(update_floor_error);
              } else {
                if (results.affectedRows === 1) {
                  logger.info("ACTION: Edit Floor Name; FLOOR ID: " + floor.id +
                    "; RESULT: Success; USER: admin; ROLE: super_admin")

                  //renamed the floor map image name
                  fs.rename('././Images/' + floor.prev_name + '.jpg', '././Images/' + floor.name + '.jpg', function (err2) {
                    if (err2) console.log('ERROR: ' + err2);
                  });

                  callback(null, results);
                } else {
                  logger.error("ACTION: Edit Floor Name; BUILDING ID: " + floor.id +
                    "; RESULT: Floor Not Found; USER: admin; ROLE: super_admin")
                  callback({ message: 'Floor Not Found', status: 404 });
                }
              }
            }
          );
        }
      });
    } else {
      callback(err);
    }
  });
};

const getFloors = callback => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query =
        'select floor_number,name,building_id from floor where type="parking" order by floor_number';
      const options = {
        sql: query
      };
      connection.query(options, (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(error);
    }
  });
};


const deleteFloor = (floorId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM floor where id = ?',
        floorId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info("ACTION: Delete Floor; FLOOR ID: " + floorId +
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, results);
            } else {
              logger.error("ACTION: Delete Floor; FLOOR ID: " + floorId +
                "; RESULT: Floor Not Found; USER: admin; ROLE: super_admin")
              callback({ message: 'Floor Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};


const lights = (floorId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
          "select d.mac,d.name,d.type,d.device_info,d.area_id,a.name as areaName,z.id as zoneId ,z.name as zone_name,f.name as floor_name,l.data,l.created_at from device d left join latest_event l on l.device_id=d.id inner join area a on a.id=d.area_id  inner join zone z on z.id=a.zone_id inner join floor f on f.id=z.floor_id   where f.id=? and (d.type='dali_master' or d.type='dali_slave' or d.type='analog_controller');"
       //before adding zone level
        // "select d.mac,d.name,d.type,d.device_info,d.zone_id,z.name as zone_name,f.name as floor_name,l.data from device d left join latest_event l on l.device_id=d.id  inner join zone z on z.id=d.zone_id inner join floor f on f.id=z.floor_id  inner join building b on f.building_id=b.id where b.id=? and (d.type='dali_master' or d.type='dali_slave' or d.type='analog_controller');";
      connection.query(query, floorId, (error1, response) => {
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
                record["area_name"]=each.areaName
                record["zone_id"]=each.zoneId
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["created_at"]=each.created_at
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
                record["area_name"]=each.areaName
                record["zone_id"]=each.zoneId
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["created_at"] = each.created_at
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
                record["area_name"]=each.areaName
                record["zone_id"]=each.zoneId
                record["zone_name"]=each.zone_name
                record["floor_name"]=each.floor_name
                record["data"]='{"type": "event","channel1mode": "Auto", "channel2mode": "Auto", "channel3mode": "Auto", "channel4mode": "Auto", "channel1level": 100, "channel2level": 100, "channel3level": 173, "channel4level": 40, "totalConnectedPIR": 1, "totalConnectedTHL": 0, "totalConnectedchannels": 2}'
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
              record["area_name"]=each.areaName
              record["zone_id"]=each.zoneId
              record["zone_name"]=each.zone_name
              record["floor_name"]=each.floor_name
              record["data"]=each.data
              record["created_at"]=each.created_at
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


const occupancy = (floorId,callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query =
        "select (json_extract(l.data,'$.occupancy')) as occupancy,z.id as zoneId from device d   left join latest_event  l   on d.id=l.device_id inner join  area a on a.id=d.area_id inner join zone z on z.id=a.zone_id inner join floor f on f.id=z.floor_id where  f.id=? and  d.type='occupancy_sensor'";
      connection.query(query,floorId, (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback("connection error");
    }
  });
};





module.exports = {
  createFloor,
  floorStats,
  editFloorName,
  deleteFloor,
  summaryParameters,
  luxSummary,
  getFloors,
  lights,
  occupancy
};
