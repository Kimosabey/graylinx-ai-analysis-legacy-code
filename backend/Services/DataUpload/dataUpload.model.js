const uuid = require('uuid/v4');
const { pool } = require('../../Database/pool');

const deviceTypeJSON = {
  5003: 'thl_sensor',
  '50dc': 'dali_master',
  '50d1': 'dali_slave',
  5001: 'occupancy_sensor',
  5027: 'parking_controller',
  5007: 'parking_sensor',
  5008: 'ramp_sensor'
};

const insertData = (data, callback) => {
  let name;
  data.forEach(record => {
    id = uuid();
    name = record.Organization;
    orgModel({ id, name }, (error, result) => {
      if (error) {
        console.log('err in org');
      } else {
        payload = {
          id: uuid(),
          name: removeExtraSpace(record.Campus),
          organization_id: result
        };
        campusModel(payload, (error, result) => {
          if (error) {
            console.log('err in campus');
          } else {
            payload = {
              id: uuid(),
              name: removeExtraSpace(record.Building),
              campus_id: result
            };
            buildingModel(payload, (error, result) => {
              if (error) {
                console.log('err in building');
              } else {
                payload = {
                  id: uuid(),
                  name: removeExtraSpace(record.Floor),
                  type: record['Floor Type'],
                  floor_number: parseInt(record['Floor Num']),
                  building_id: result
                };
                floorModel(payload, (error, result) => {
                  if (error) {
                    console.log('err in floor');
                  } else {
                    payload = {
                      id: uuid(),
                      name: removeExtraSpace(record.Zone),
                      floor_id: result,
                      type: record['Zone Type']
                    };
                    zoneModel(payload, (error, result) => {
                      if (error) {
                        console.log('err in zone', error);
                      } else {
                        payload = {
                          id: uuid(),
                          name: record['Gateway_Name'],
                          ip: record['Gateway_IP']
                        };
                        gatewayModel(payload, (error, response) => {
                          if (error) {
                          } else {
                            payload = {
                              zone_id: result,
                              gateway_id: response
                            };
                            associateGateway(payload, (error, response) => {
                              if (error) {
                                console.log('err in gateway association');
                              } else { 
                                payload = {
                                  id: uuid(),
                                  name: removeExtraSpace(record['Device Name']),
                                  type: removeExtraSpace(record['Device Type']),
                                  mac: removeExtraSpace(record['Mac ID']),
                                  zone_id: result,
                                  x: null,
                                  y: null
                                };
                                if (
                                  deviceTypeJSON[
                                    record['Mac ID'].trim().substr(0, 4)
                                  ] == record['Device Type'].trim()
                                ) {
                                  deviceModel(payload, (error, response) => {
                                    if (error) {
                                     // callback(err);
                                    } else {
                                     // callback(null, response);
                                    }
                                  });
                                } else {
                                  // callback({ message: "Mac ID and Device type does not matched" });
                                }
                              }
                            });
                          }
                        });
                        
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
  callback(null, 'success');
};

const orgModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO organization SET ?', payload, error => {
        // connection.release();
        if (error) {
          if (error.code == 'ER_DUP_ENTRY') {
            connection.query(
              'SELECT id FROM organization where name = ?',
              payload.name,
              (error, result) => {
                if (error) {
                  callback(error);
                } else callback(null, result[0].id);
              }
            );
          } else callback(error);
        } else {
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const campusModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO campus SET ?', payload, error => {
        // connection.release();
        if (error) {
          if (error.code == 'ER_DUP_ENTRY') {
            connection.query(
              'SELECT id FROM campus where name = ?',
              payload.name,
              (error, result) => {
                if (error) callback(error);
                else {
                  console.log('dup entry data');
                  console.log(JSON.stringify(result));
                  callback(null, result[0].id);
                }
              }
            );
          } else {
            callback(error);
          }
        } else {
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const buildingModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO building SET ?', payload, error => {
        if (error) {
          if (error.code == 'ER_DUP_ENTRY') {
            connection.query(
              'SELECT id FROM building where name = ?',
              payload.name,
              (error, result) => {
                if (error) callback(error);
                else {
                  callback(null, result[0].id);
                }
              }
            );
          } else {
            callback(error);
          }
        } else {
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const floorModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO floor SET ?', payload, error => {
        if (error) {
          if (error.code == 'ER_DUP_ENTRY') {
            connection.query(
              'SELECT id FROM floor where name = ?',
              payload.name,
              (error, result) => {
                if (error) callback(error);
                else callback(null, result[0].id);
              }
            );
          } else {
            callback(error);
          }
        } else {
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const zoneModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query('INSERT INTO zone SET ?', payload, error => {
        if (error) {
          if (error.code == 'ER_DUP_ENTRY') {
            connection.query(
              'SELECT id FROM zone where name = ?',
              payload.name,
              (error, result) => {
                if (error) callback(error);
                else callback(null, result[0].id);
              }
            );
          } else {
            callback(error);
          }
        } else {
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const deviceModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      console.log("in device model")
      connection.query('INSERT INTO device SET ?', payload, error => {
        if (error) {
          console.log(error);
          callback(error);
        } else {
          console.log('succesfully added');
          callback(null, payload.id);
        }
        connection.release();
      });
    } else {
      callback(err);
    }
  });
};

const gatewayModel = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const checkDupliacte = `select id from gateway where ip = '${payload.ip}'`;
      connection.query(checkDupliacte, (error, results) => {
        if (results.length > 0) {
          connection.release();
          callback(null, results[0].id);
        } else {
          const query =
            `INSERT INTO gateway (id, name , ip) VALUES ('${payload.id}', '${payload.name}', '${payload.ip}')` +
            `ON DUPLICATE KEY UPDATE name = '${payload.name}'`;
          connection.query(query, (error, results) => {
            connection.release();
            if (error) {
              callback(error);
            } else {
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

const associateGateway = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const checkDupliacte = `SELECT * FROM gateway_mapping WHERE zone_id = '${payload.zone_id}' and gateway_id = '${payload.gateway_id}'`;
      connection.query(checkDupliacte, (error, results) => {
        if (results.length > 0) {
          callback(null,{message:'Zone is already mapped with the gateway!!'})
        } else {
          var queryTest2 = connection.query(
            'INSERT INTO gateway_mapping SET ?',
            payload,
            (error, results) => {
              connection.release();
              if (error) {
                callback(error);
              } else {
                callback(null, results);
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

function removeExtraSpace(val) {
  return val.trim();
}

module.exports = {
  insertData
};
