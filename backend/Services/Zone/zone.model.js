const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const gatewayService = require('../../Services/Gateway/gateway.service')

const createZone = (payload,gatewayid, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'SELECT * FROM zone WHERE name = ? AND floor_id = ?';
      connection.query(query, [payload.name, payload.floor_id], (error, results) => {
        if(results.length > 0)
        {
          connection.release();
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Zone;"+
              "; RESULT: Zone Name already exists; USER: admin; ROLE: super_admin")
          callback(err1)
        }
        else
        {
          connection.query('INSERT INTO zone SET ?', payload, (error1, results1) => {
            connection.release();
            if (error1) {
              callback(error1);
            } else {
              gatewayService.associateGateway(payload.id,gatewayid,(error2,results2)=>{
                if(error2){
                  callback(error2)
                }else{
              logger.info("ACTION: Create Zone; ZONE ID: "+payload.id+
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, payload.id);
                }
              })
            }
          });
        }
      });
      
    } else {
      callback(err);
    }
  });
};

const editZoneName = (zone, callback) => {
  pool.getConnection((err, connection) => {
    if(connection) {
      connection.query(`select count(*) as count from zone where name = ? and floor_id = ?`, [zone.name, zone.parent_id], (error, countsResult) => {
        if(countsResult[0].count > 0) {
          callback({ message: `'${zone.name}' already exists`, status: 422 });
        }
        else {
          connection.query(
            'UPDATE zone SET name = ? where id = ?',
            [zone.name, zone.id],
            (update_zone_error, results) => {
              connection.release();
              if (update_zone_error) {
                callback(update_zone_error);
              } else {
                if (results.affectedRows === 1) {
                  logger.info("ACTION: Edit Zone Name; ZONE ID: "+zone.id+
                    "; RESULT: Success; USER: admin; ROLE: super_admin")
                  callback(null, results);
                } else {
                  logger.error("ACTION: Edit Zone Name; ZONE ID: "+zone.id+
                    "; RESULT: Zone Not Found; USER: admin; ROLE: super_admin")
                  callback({ message: 'Zone Not Found', status: 404 });
                }
              }
            }
          );
          
        }
      })
    }
    else {
      callback(err);
    }
  });
};

const deleteZoneName = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM zone where id = ?',
        zoneId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              logger.info("ACTION: Delete Zone; ZONE ID: "+zoneId+
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, results);
            } else {
              logger.error("ACTION: Delete Zone; ZONE ID: "+zoneId+
                "; RESULT: Zone Not Found; USER: admin; ROLE: super_admin")
              callback({ message: 'Zone Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};


const lights = (buildingId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
      "select d.mac,d.name,d.type,d.device_info,d.area_id,a.name as areaName,z.id as zoneId ,z.name as zone_name,l.data,l.created_at from device d left join latest_event l on l.device_id=d.id inner join area a on a.id=d.area_id  inner join zone z on z.id=a.zone_id  where z.id=? and (d.type='dali_master' or d.type='dali_slave' or d.type='analog_controller');"
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
                record["zone_id"]=each.zoneId
                record["zone_name"]=each.zone_name
                record["area_id"]=each.area_id
                record["area_name"]=each.areaName
                record["floor_name"]=each.floor_name
                record["created_at"]=Math.floor(new Date(each.created_at).getTime()/1000)
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
                record["zone_id"]=each.zoneId
                record["zone_name"]=each.zone_name
                record["area_id"]=each.area_id
                record["area_name"]=each.areaName
                record["floor_name"]=each.floor_name
                record["created_at"]=Math.floor(new Date(each.created_at).getTime()/1000)
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

const occupancy = (zoneId,callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query =
        "select (json_extract(l.data,'$.occupancy')) as occupancy,a.id as areaId from device d   left join latest_event  l   on d.id=l.device_id inner join  area a on a.id=d.area_id inner join zone z on z.id=a.zone_id  where  z.id=? and  d.type='occupancy_sensor'";
      connection.query(query,zoneId, (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results)
        }
      });
    } else {
      callback("connection error");
    }
  });
};


module.exports = {
  createZone,
  editZoneName,
  deleteZoneName,
  lights,
  occupancy
};
