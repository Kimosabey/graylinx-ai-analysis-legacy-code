const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const gatewaysList = (callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      //const query = `SELECT * FROM gateway`;
      // const query = `select g.id, g.ip, g.name, z.id as zone_id, z.name as zone_name, f.id as floor_id, f.name as floor_name from gateway g inner join gateway_mapping gm inner join zone z inner join floor f where g.id = gm.gateway_id and gm.zone_id = z.id and z.floor_id = f.id ORDER BY name asc`;
      const query = `select g.id, g.ip, g.name, z.id as zone_id, z.name as zone_name, f.id as floor_id, f.name as floor_name from gateway g left join gateway_mapping gm on g.id=gm.gateway_id left join zone z on z.id=gm.zone_id left join floor f on f.id=z.floor_id ORDER BY name asc`;
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
const gatewaysName = (callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `SELECT * FROM gateway  ORDER BY name asc `;
      // const query = `select g.id, g.ip, g.name, z.id as zone_id, z.name as zone_name, f.id as floor_id, f.name as floor_name from gateway g inner join gateway_mapping gm inner join zone z inner join floor f where g.id = gm.gateway_id and gm.zone_id = z.id and z.floor_id = f.id`;
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

const registerGateway = (gateway, callback) => {
  if (ValidateIPaddress(gateway.ip)) {
    pool.getConnection((err, connection) => {
      if (connection) {
        // const checkDupliacte = 'select id from gateway where ip = ?';
        connection.query("select id from gateway where ip = ?", gateway.ip, (error, results)  => {
          if (results.length > 0) {
            // connection.release();
            // callback(null, results[0].id);
            var err1 = new Error(`${gateway.ip} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Gateway;" +
            "; RESULT: Gateway IP already exists; USER: admin; ROLE: super_admin")
          callback(err1)
          }
          else {
            const query =
              `INSERT INTO gateway (id, name, ip) VALUES (?, ?, ?)` +
              `ON DUPLICATE KEY UPDATE name = ?`;
            connection.query(query, [gateway.id, gateway.name, gateway.ip, gateway.name], (error1, results1) => {
              connection.release();
              if (error1) {
                callback(error1);
              }
              else {
                callback(null, gateway.id);
              }
            });
          }
        });

      } else {
        callback(err);
      }
    });
  }
  else {
    callback(null, "IP is not valid");
  }

};

const editGatewayIP = (gateway, callback) => {
  if (ValidateIPaddress(gateway.ip)) {
    pool.getConnection((err, connection) => {
      if (connection) {
        connection.query(
          'UPDATE gateway SET ip = ? where id = ?',
          [gateway.ip, gateway.id],
          (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              if (results.affectedRows === 1) {
                callback(null, results);
              } else {
                callback({ message: 'Gateway Not Found', status: 404 });
              }
            }
          }
        );
      } else {
        callback(err);
      }
    });
  }
  else {
    callback(null, "IP is not valid");
  }

};
const editGatewayName = (gateway, callback) => {
  console.log("gateway",gateway)
    pool.getConnection((err, connection) => {
      if (connection) {
        connection.query(
          'UPDATE gateway SET name = ? where ip = ?',
          [gateway.id, gateway.ip],
          (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              if (results.affectedRows === 1) {
                callback(null, results);
              } else {
                callback({ message: 'Gateway Not Found', status: 404 });
              }
            }
          }
        );
      } else {
        callback(err);
      }
    });
  

};
const associateGateway = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const checkDupliacte = 'SELECT * FROM gateway_mapping WHERE zone_id = ? and gateway_id = ?';
      connection.query(checkDupliacte, [payload.zone_id, payload.gateway_id], (error, results) => {
        if (results.length > 0) {
          console.log("zone is exist with the same ip")
          connection.release()
          callback(null, { message: 'Zone is already mapped with this gateway!!', status: 500})
        }
        else {
          connection.query(`select * from gateway_mapping where zone_id = ?`, payload.zone_id, (err2, res) => {
            if (res.length > 0) {
              console.log("zone is exist but with other ip")
              const updateGateway = `update gateway_mapping set gateway_id = '${payload.gateway_id}' where zone_id = '${payload.zone_id}'`;
              console.log(updateGateway)
              connection.query(updateGateway, (error1, result2) => {
                if(error1) {
                  console.log("error")
                }
                else if(result2) {
                  connection.release()
                  console.log("Gateway mapping is updated")
                  callback(null, { message: 'Gateway mapping is updated', status: 201})
                }
              });
            }
            else {
              connection.query(
                'INSERT INTO gateway_mapping SET ?',
                payload,
                (error1, results1) => {
                  connection.release();
                  if (error1) {
                    callback(error1);
                  } else {
                    callback(null, { message: 'Gateway mapping is updated', status: 201});
                    //callback(null, results1);
                  }
                }
              );
            }
          })

        }
      });

    } else {
      callback(err);
    }
  });
};

const deleteMapping = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'delete from gateway_mapping WHERE zone_id = ? and gateway_id = ?';
      connection.query(query, [payload.zone_id, payload.gateway_id], (error, results) => {
        if (results.length > 0) {
          console.log("deleted mapping")
          connection.release()
          callback(null, { message: 'success'})
        }
        else {
          connection.release()
          console.log("error in deleting")
          callback(null, {message: "error"})
        }
      });

    } else {
      callback(err);
    }
  });
};

const deleteGatewayIp = (gatewayId, callback) => {
  console.log(gatewayId)
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'delete from gateway WHERE id = ?';
      console.log(query)
      connection.query(query, gatewayId, (error, results) => {
        if (results) {
          const query2= 'delete from gateway_mapping where gateway_id = ?'
          console.log(query2)
          connection.query(query2, gatewayId, (error2, results2) => {
            if(results2) {
              console.log("deleted mapping from gateway and gateway_mapping")      
              connection.release()
              callback(null, { message: 'success'})
            }
          })
        }
        else {
          connection.release()
          console.log("error in deleting",results)
          callback(null, {message: "error"})
        }
      });

    } else {
      callback(err);
    }
  });
};

const updateMapping = (gatewayId, zoneId, prevZoneId, callback) => {
  console.log(gatewayId, " ", zoneId)
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = 'update gateway_mapping set zone_id = ? where gateway_id = ? and zone_id = ?';
      connection.query(query, [zoneId,gatewayId, prevZoneId], (error, results) => {
        connection.release()
        if(error) {
          console.log(error)
        }
        else {   
              callback(null, { message: 'success', status: 201})
            }
          })
        }
    else {
      callback(err);
    }
  });
};

function ValidateIPaddress(ipaddress) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {
    return (true)
  }
  return (false)
}

module.exports = {
  gatewaysList,
  gatewaysName,
  registerGateway,
  editGatewayIP,
  editGatewayName,
  associateGateway,
  deleteMapping,
  deleteGatewayIp,
  updateMapping
};
