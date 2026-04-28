const { pool } = require("../../Database/pool");
const logger = require("../../Config/logger");
const uuid = require("uuid/v4");
const { query } = require("../../Config/logger");
const _ = require("lodash");
const e = require("cors");
const { isNull } = require("lodash");
const { validateDBQueryResultLength } = require("../../Utils/common");
const { DEVICE_TO_SS_TYPE } = require("../../Utils/tableName");
const {
  getTablePrefix,
  getTablePostfix,
  getParamColumn,
  getRuntimeParams,
} = require("../../Utils/tableName");
// const { getTablePostfix } = require('../../Utils/tableName');
// const { getTablePrefix } = require('../../Utils/tableName');
const { getRuntimeParam } = require("../../Utils/tableName");
// const { connect } = require('./Gl_analytics.route');

const getGlZoneId = (Id, callback) => {
  console.log("in model", Id);
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "WITH RECURSIVE subordinates AS (SELECT id FROM gl_location WHERE id=? UNION SELECT p.id FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id where p.zone_type!='gl_location_TYPE_SEAT') SELECT * FROM subordinates";
      connection.query(query, Id, (err, response) => {
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

const getGlThlZoneId = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      // const query="select gz.id as gl_zone_id, zs.ss_id,s.name as subsystem_name, p_max.param_id as parameter, p_max.measured_time, p_max.param_value,s.ss_type as subsystem_type  from gl_location gz inner join gl_location_subsystem_map zs on gz.id = zs.zone_id inner join gl_subsystem s on s.id = zs.ss_id inner join (SELECT id, ss_id as ssid, max(measured_time) as measured_time, param_id, param_value FROM gl_subsystem_output_map group by ss_id, param_id order by id) as p_max  on zs.ss_id = p_max.ssid";
      //on 26_08_2022
      const query =
        "select gz.id as gl_zone_id, zs.ss_id,s.name as subsystem_name, p_max.param_id as parameter, p_max.measured_time, p_max.param_value,s.ss_type as subsystem_type  from gl_location gz inner join gl_location_subsystem_map zs on gz.id = zs.zone_id inner join gl_subsystem s on s.id = zs.ss_id inner join gl_subsystem_latest_event p_max  on zs.ss_id = p_max.ss_id;";
      connection.query(query, (err, response) => {
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

const getxmapzones = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "WITH RECURSIVE subordinates AS (SELECT id,name,description,coordinates,zone_type FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.description,p.coordinates,p.zone_type FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id where (p.zone_type='GL_LOCATION_TYPE_zone' or p.zone_type='GL_LOCATION_TYPE_ROOM') and zone_status='GL_LOCATION_STATUS_ACTIVE') SELECT * FROM subordinates";
      connection.query(query, id, (err, result) => {
        connection.release();
        if (err) {
          console.log("----------------------------------", err);
          callback(err);
        } else {
          let res = result.filter((e) => {
            if (e.zone_type === "GL_LOCATION_TYPE_ROOM") {
              return e.id;
            }
          });
          validateDBQueryResultLength(result, callback);
        }
      });
    }
  });
};

const gethvacdevicebyzoneid = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select s.id as ssid,s.name as ss_name,s.ss_type,s.coordinates,p_max.param_id as name,p_max.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id inner join  (SELECT id, ss_id as ssid, max(measured_time) as measured_time, param_id, param_value FROM gl_subsystem_output_map group by ss_id, param_id order by id) as p_max on p_max.ssid=s.id  where zs.zone_id=? and (p_max.param_id !='humidity' and p_max.param_id !='luminousity' and p_max.param_id !='battery' and p_max.param_id !='is_event' and p_max.param_id !='lqi' and p_max.param_id !='parentAddress' and p_max.param_id !='rssi') and (s.ss_type='NONGL_SS_DAMPER' or s.ss_type='NONGL_SS_AHU' or s.ss_type='GL_SS_WPIR_TYPE_01' or s.ss_type='NONGL_SS_VAV' or s.ss_type='GL_SS_THLSENSOR_TYPE_01')";
      connection.query(query, id, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, (err, result1) => {
            if (err) {
              callback(err);
            } else {
              callback(null, result);
            }
          });
        }
      });
    }
  });
};

const getlast24hr = (id, param, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select sp.measured_time,p.id,sp.param_value from gl_subsystem_output_map sp inner join gl_parameter p on p.id=sp.param_id where sp.ss_id=? and p.id=? and sp.measured_time >= date_sub('2022-04-11',interval 1 day) and sp.measured_time < '2022-04-11' group by measured_time";
      connection.query(query, [id, param], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getdevicebyzoneid = (id, callback) => {
  pool.getConnection((error, connection) => {
    console.log("connection taken");
    if (error) {
      callback(error);
    } else {
      //  const query="select s.id as ssid,s.name as ss_name,s.ss_type,s.coordinates,p_max.param_id as name,p_max.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id inner join  (SELECT id, ss_id as ssid, max(measured_time) as measured_time, param_id, param_value FROM gl_subsystem_output_map group by ss_id, param_id order by id) as p_max on p_max.ssid=s.id  where zs.zone_id=?";
      //on 26_08
      // const query="select s.id as ssid,s.name as ss_name,s.ss_type,s.coordinates,latest.param_id as name,latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id inner join (select som.id,som.ss_id,som.param_id,som.param_value,som.measured_time from gl_subsystem_output_map som inner join (SELECT id, ss_id as ssid, max(measured_time) as measured_time, param_id, param_value FROM gl_subsystem_output_map  group by ss_id, param_id)as pmax on pmax.ssid=som.ss_id  and pmax.measured_time=som.measured_time and som.param_id=pmax.param_id)as latest on latest.ss_id=s.id where zs.zone_id=?;"
      // const query="select s.id as ssid,s.name as ss_name,s.ss_type,s.coordinates,latest.param_id as name,latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id inner join gl_subsystem_latest_event latest on latest.ss_id=s.id where zs.zone_id=?";
      const query =
        "select s.id as ssid,s.name as ss_name,s.ss_tag as ss_tag,s.ss_type,s.coordinates,latest.param_id as name,latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id left join gl_subsystem_latest_event latest on latest.ss_id=s.id where zs.zone_id=? and s.ss_status='GL_SS_STATUS_ACTIVE';";
      connection.query(query, id, (err, result) => {
        connection.release();
        console.log("connection released");
        if (err) {
          callback(err);
        } else {
          // validateDBQueryResultLength(result,(err,result1)=>{
          //   if(err){
          //     callback(err)
          //   }else{
          callback(null, result);
          //   }
          // })
        }
      });
    }
  });
};

const getchild = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query = "select * from gl_location where zone_parent=?;";
      connection.query(query, [id], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          //result  validation done in service component
          // validateDBQueryResultLength(result,(err,result1)=>{
          //   if(err){
          //     callback(err)
          //   }else{
          callback(null, result);
          //   }
          // })
        }
      });
    }
  });
};

const getAhubyzoneid = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      // const query="select s.id as ssid,s.name as ss_name,s.ss_type,s.coordinates,latest.param_id as name,latest.param_value,latest.userSetPoint,latest.defaultSP from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id=s.id inner join (select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value,inp.input_param_value as userSetPoint,sd.param_value as defaultSP from gl_subsystem_output_map somo inner join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_output_map som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.measured_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id) left join (select somo.ss_id,somo.triggered_time,somo.param_id as input_param_id,somo.param_value as input_param_value from gl_subsystem_input_map somo inner join (select max(triggered_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_input_map som inner join gl_subsystem ssm on som.ss_id=ssm.id  group by som.ss_id,som.param_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id))as inp on inp.ss_id=somo.ss_id and inp.input_param_id=somo.param_id left join gl_subsystem_detail sd on somo.ss_id=sd.ss_id and somo.param_id=sd.param_name)as latest on latest.ss_id=s.id where zs.zone_id=? and s.ss_type='NONGL_SS_AHU'"
      const query = `select gz.id as gl_zone_id, zs.ss_id as ssid,s.name as ss_name, p_max.param_id as name, p_max.measured_time, p_max.param_value,s.ss_type as ss_type,s.coordinates  from gl_location gz inner join gl_location_subsystem_map zs on gz.id = zs.zone_id inner join gl_subsystem s on s.id = zs.ss_id inner join gl_subsystem_latest_event p_max  on zs.ss_id = p_max.ss_id where s.ss_type="NONGL_SS_AHU" and gz.id=? and s.ss_status='GL_SS_STATUS_ACTIVE'`;
      connection.query(query, id, (err, result) => {
        connection.release();
        if (err) {
          console.log("---------------------------dddd-------", err);
          callback(err);
        } else {
          // validateDBQueryResultLength(result,(err,result1)=>{
          //   if(err){
          //     callback(err)
          //   }else{
          callback(null, result);
          //   }
          // })
        }
      });
    }
  });
};

const getAhuData = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      // const query="SELECT * FROM gl_subsystem_output_map  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 24 HOUR) and ss_id='01f8d696-5abc-4ba1-a3be-415bedaed456'"
      //on 26_08_2022
      // const query='select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value,l.name as zone_name from gl_subsystem_output_map somo inner join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_output_map som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.measured_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id) inner join gl_location_subsystem_map ls on ls.ss_id=somo.ss_id inner join gl_location l on ls.zone_Id=l.id where somo.ss_id=?;'
      // const query='select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value,l.name as zone_name from gl_subsystem_latest_event somo  inner join gl_location_subsystem_map ls on ls.ss_id=somo.ss_id inner join gl_location l on ls.zone_Id=l.id where somo.ss_id=?';
      const query =
        "select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value,l.name as zone_name, gp.tag as Tag from gl_subsystem_latest_event somo  inner join gl_location_subsystem_map ls on ls.ss_id=somo.ss_id inner join gl_location l on ls.zone_Id=l.id inner join gl_parameter gp on somo.param_id=gp.id where somo.ss_id=?";
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          console.log("inerror bloclk", err);
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getAhuData2 = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      // const query="SELECT * FROM gl_subsystem_output_map  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 24 HOUR) and ss_id='01f8d696-5abc-4ba1-a3be-415bedaed456'"
      const query =
        "select somo.ss_id,somo.triggered_time,somo.param_id,somo.param_value,l.name as zone_name from gl_subsystem_input_map somo inner join (select max(triggered_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_input_map som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.triggered_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id) inner join gl_location_subsystem_map ls on ls.ss_id=somo.ss_id inner join gl_location l on ls.zone_Id=l.id where somo.ss_id=?;";
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          console.log("inerror bloclk", err);
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const ahuLast24Hr = (deviceId, tableName, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?`;
      //  const query=`select measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time >"2022-08-12 10:55:50" and ss_id=?;`
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getArea = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query = "select * from gl_location where id=?;";
      connection.query(query, [id], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
};

const getEmsData = (floorId, callback) => {
  console.log("floorId", floorId);
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT sub.id as Zone_id,zone_name,sbl.ss_id,sbl.param_id,sbl.param_value,sbl.measured_time FROM subordinates sub inner join gl_location_subsystem_map zs on sub.id=zs.zone_id inner join gl_subsystem sb on sb.id=zs.ss_id inner join (select ss_id, param_id as param_id,param_value as param_value,measured_time as measured_time from gl_subsystem_latest_event) as sbl on sbl.ss_id=sb.id where sb.ss_type like '%NONGL_SS_EMS%';";
      connection.query(query, floorId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback);
        }
      });
    }
  });
};

const getEmsDeviceData = (deviceId, callback) => {
  // console.log("deviceId",deviceId)
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select gl.id as zoneId, gl.name as zoneName, gs.id as deviceId, gs.name as deviceName,gs.ss_type as devicetype,gle.param_id as param_id,gle.param_value as param_value,gle.measured_time as measured_time from gl_location gl inner join gl_location_subsystem_map gls on gls.zone_id=gl.id inner join gl_subsystem gs on gs.id=gls.ss_id inner join gl_subsystem_latest_event gle on gle.ss_id=gs.id where gs.id=?;";
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const energyLast24Hr = (deviceId, tableName, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `select measured_time,param_id,param_value,ss_id from ${tableName}  WHERE  measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?;`;
      // const query=`select measured_time,param_id,param_value,ss_id ${tableName}  WHERE measured_time >"2022-10-10 14:23:40" and ss_id=?;`
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const energyDeviceData = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query = "select * from gl_subsystem where id=?";
      connection.query(query, [id], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback);
        }
      });
    }
  });
};

const ems24hoursdata = (id, tableName, day, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err);
    } else {
      // select param_value as Act_Pwr_Ttl,measured_time,hour(measured_time) as hour from em_010100_om_t  where date(measured_time)='2023-03-21'   and param_id='Act_Pwr_Ttl' order by measured_time;
      // const query = `select Act_Pwr_Ttl,measured_time,hour(measured_time) as hour from ${tableName} where date(measured_time)=?  order by measured_time`;
      const query = ` select param_value as Act_Pwr_Ttl,measured_time,hour(measured_time) as hour from ${tableName}  where date(measured_time)=?   and param_id='Act_Pwr_Ttl' order by measured_time;`;
      connection.query(query, [day], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const ems7daysdata = (id, tableName, day, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err);
    } else {
      // select param_value as Act_Pwr_Ttl,measured_time,day(measured_time) as day from em_010100_om_t where measured_time > DATE_SUB('2023-03-24', INTERVAL 7 DAY) and date(measured_time)<='2023-03-24 12:00:00' and param_id='Act_Pwr_Ttl'  order by measured_time;
      const query = `select param_value as Act_Pwr_Ttl,measured_time,day(measured_time) as day from ${tableName} where measured_time > DATE_SUB(now(), INTERVAL 7 DAY) and date(measured_time)<=? and param_id='Act_Pwr_Ttl'  order by measured_time;`;
      // const query = `select Act_Pwr_Ttl,measured_time,day(measured_time) as day from ${tableName} where measured_time > DATE_SUB(NOW(), INTERVAL 7 DAY) and date(measured_time)<=?  order by measured_time;`;
      console.log("gl_ana query", query);
      // const query = `select em_activePowerTotal,measured_time,day(measured_time) as day from ${tableName} where measured_time > '2022-10-13 12:00:00' and date(measured_time)=?  order by measured_time;`;
      connection.query(query, [day], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getUpsDeviceData = (deviceId, callback) => {
  // console.log("deviceId",deviceId)
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      const query =
        "select gl.id as zoneId, gl.name as zoneName, gs.id as deviceId, gs.name as deviceName,gs.ss_type as devicetype,gle.param_id as param_id,gle.param_value as param_value,gle.measured_time as measured_time from gl_location gl inner join gl_location_subsystem_map gls on gls.zone_id=gl.id inner join gl_subsystem gs on gs.id=gls.ss_id inner join gl_subsystem_latest_event gle on gle.ss_id=gs.id where gs.id=?;";
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const upsLast24Hr = (deviceId, tableName, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?`;
      //  const query=`select measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time >"2022-08-12 10:55:50" and ss_id=?;`
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const vavLast24Hr = (deviceId, tableName, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?`;
      //  const query=`select measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time >"2022-08-12 10:55:50" and ss_id=?;`
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
};
const getzoneData = (id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      // const query="SELECT * FROM gl_subsystem_output_map  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 120 HOUR) and ss_id=?"
      const query = "select * from gl_location where id=?";
      connection.query(query, id, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          console.log("oodfkbxcbkjbkif", result);
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getTableName = (id, callback) => {
  pool.getConnection((error, connection) => {
    // console.log("inseide thisssss")
    if (error) {
      callback("DB connection error");
    } else {
      // const query="SELECT * FROM gl_subsystem_output_map  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 120 HOUR) and ss_id=?"
      const query = "select * from gl_subsystem where id=?";
      connection.query(query, id, (err, result) => {
        // console.log("resultttt",result)
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
};

const csuLast24Hr = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      // const query="SELECT * FROM gl_subsystem_output_map  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 120 HOUR) and ss_id=?"
      const query =
        'select measured_time,param_id,param_value,ss_id FROM gl_subsystem_output_map  WHERE measured_time >"2023-02-07 15:41:00" and ss_id=?;';
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getDevicesZoneId = (zoneId, deviceType, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query = `WITH RECURSIVE subordinates AS (SELECT id,name as zone_name,zone_parent FROM gl_location WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT sub.id as Zone_id,zone_name,sb.id as device_id,sb.ss_address_value as table_name,sb.name as device_name FROM subordinates sub inner join gl_location_subsystem_map zs on sub.id=zs.zone_id inner join gl_subsystem sb on sb.id=zs.ss_id  where sb.ss_status='GL_SS_STATUS_ACTIVE' and sb.ss_type=?`;
      connection.query(query, [zoneId, deviceType], (error, result) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback("DB CONNECTION ERROR");
    }
  });
};

const getDeviceData = (tableName, callback) => {
  pool.getConnection((error, connection) => {
    if (connection) {
      let sql = `select * from ${tableName} where measured_time >"2023-04-12 16:03:12";`;
      // const query="SELECT * FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 120 HOUR)
      connection.query(sql, (error, result) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback("DB CONNECTION ERROR");
    }
  });
};

const getSubordinates = (id, callback) => {
  pool.getConnection((error, connection) => {
    console.log("connection taken");
    if (error) {
      callback(error);
    } else {
      const query =
        "WITH RECURSIVE subordinates AS (SELECT id,coordinates FROM gl_location WHERE id=? UNION SELECT p.id,p.coordinates FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id where p.zone_type!='gl_location_TYPE_SEAT') SELECT * FROM subordinates;";
      connection.query(query, [id], (err, result) => {
        connection.release();
        console.log("connection released");
        if (err) {
          callback(err);
        } else {
          //result  validation done in service component
          // validateDBQueryResultLength(result,(err,result1)=>{
          //   if(err){
          //     callback(err)
          //   }else{
          callback(null, result);
          //   }
          // })
        }
      });
    }
  });
};

const chillerLast24Hr = (deviceId, tableName, callback) => {
  console.log("table_name in model", tableName);
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?`;
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getCoolingTowerDataLast1Hr = (deviceId, tableName, callback) => {
  console.log("table_name in model", tableName);
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=?`;
      connection.query(query, deviceId, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getSubsystemDetailsBySstype = (ss_type, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = "select * from gl_subsystem where ss_type=?";
      connection.query(query, ss_type, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};
const getMetricDataBydeviceId = (
  ss_address_value,
  metric_id,
  normal,
  callback,
) => {
  console.log("noraml", normal);
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      let table_name = `ahu_${ss_address_value}_metric`;
      if (normal == "default") {
        const query = `select m.ss_id, max(m.measured_time) as measured_time,m.metric_id,SUM(m.metric_value) as metric_value,gl.name from ${table_name} m inner join gl_subsystem gl on m.ss_id=gl.id where metric_id=? and measured_time > DATE_SUB(NOW(), INTERVAL 1 DAY)`;
        connection.query(query, [metric_id], (err, result) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            validateDBQueryResultLength(result, callback, 0);
          }
        });
      } else if (normal == "1 hour") {
        const query = `select m.ss_id, max(m.measured_time) as measured_time,m.metric_id,(m.metric_value) as metric_value,gl.name from ${table_name} m inner join gl_subsystem gl on m.ss_id=gl.id where metric_id=? and measured_time < DATE_SUB(NOW(), INTERVAL 1 HOUR)`;
        connection.query(query, [metric_id], (err, result) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            validateDBQueryResultLength(result, callback, 0);
          }
        });
      } else {
        const query = `select m.ss_id, max(m.measured_time) as measured_time,m.metric_id,SUM(m.metric_value) as metric_value,gl.name from ${table_name} m inner join gl_subsystem gl on m.ss_id=gl.id where metric_id=? and measured_time > DATE_SUB(NOW(), INTERVAL ${normal})`;
        connection.query(query, [metric_id], (err, result) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            validateDBQueryResultLength(result, callback, 0);
          }
        });
      }
      // }else if(normal == "1 week"){
      //   const query=`select m.ss_id, max(m.measured_time) as measured_time,m.metric_id,SUM(m.metric_value) as metric_value,gl.name from ${table_name} m inner join gl_subsystem gl on m.ss_id=gl.id where metric_id=? and measured_time > DATE_SUB(NOW(), INTERVAL ${normal})`;
      //   connection.query(query,[metric_id],(err, result) => {
      //     connection.release();
      //     if (err) {
      //       callback(err);
      //     } else {
      //       validateDBQueryResultLength(result,callback,0)
      //     }
      //   });
      // }else if(normal == '1 month'){
      //   const query=`select m.ss_id, max(m.measured_time) as measured_time,m.metric_id,SUM(m.metric_value) as metric_value,gl.name from ${table_name} m inner join gl_subsystem gl on m.ss_id=gl.id where metric_id=? and measured_time > DATE_SUB(NOW(), INTERVAL ${normal})`;
      //   connection.query(query,[metric_id],(err, result) => {
      //     connection.release();
      //     if (err) {
      //       callback(err);
      //     } else {
      //       validateDBQueryResultLength(result,callback,0)
      //     }
      //   });
      // }
    }
  });
};

// const newgetdevicebyzoneid = (id, device, callback) => {
//   pool.getConnection((error, connection) => {
//     if (error) {
//       callback(error);
//     } else {
//       // const query = "select s.id as ssid, s.name as ss_name, s.ss_tag as ss_tag, s.ss_type, s.coordinates, latest.param_id as name, latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id = s.id left join gl_subsystem_latest_event latest on latest.ss_id = s.id where zs.zone_id = ? and s.ss_status = 'GL_SS_STATUS_ACTIVE' and s.ss_type = ?;";
//       const query = "select s.id as ssid, s.name as ss_name,s.ss_tag as ss_tag, s.ss_type, s.coordinates,latest.param_id as name, latest.param_value  from gl_subsystem s inner join gl_subsystem gl on gl.ss_parent=s.id inner join gl_location_subsystem_map zs on zs.ss_id = s.id left join gl_subsystem_latest_event latest on latest.param_id = gl.name and s.id=latest.ss_id where zs.zone_id = ? and s.ss_status = 'GL_SS_STATUS_ACTIVE' and s.ss_type = ? and gl.ss_status='GL_SS_STATUS_ACTIVE';"

//       connection.query(query, [id, device], (err, result) => {
//         connection.release();
//         if (err) {
//           callback(err);
//         } else {
//           callback(null, result);
//         }
//       });
//     }
//   });
// }

const newgetdevicebyzoneid = (id, device, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback(error);
    } else {
      let query = "";
      if (device === "EXHAUST_FAN") {
        query =
          "select s.id as ssid, s.name as ss_name, s.ss_tag as ss_tag, s.ss_type, s.coordinates, latest.param_id as name, latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id = s.id left join gl_subsystem_latest_event latest on latest.ss_id = s.id where zs.zone_id = ? and s.ss_status = 'GL_SS_STATUS_ACTIVE' and s.ss_type in('SS_BRE_FAN','SS_HTE_FAN','SS_SUBE_FAN')";
      } else {
        query =
          "select s.id as ssid, s.name as ss_name, s.ss_tag as ss_tag, s.ss_type, s.coordinates, latest.param_id as name, latest.param_value from gl_subsystem s inner join gl_location_subsystem_map zs on zs.ss_id = s.id left join gl_subsystem_latest_event latest on latest.ss_id = s.id where zs.zone_id = ? and s.ss_status = 'GL_SS_STATUS_ACTIVE' and s.ss_type = ?;";
      }

      connection.query(query, [id, device], (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
};

const deviceLast24Hr = (
  deviceId,
  tableName,
  interval,
  startdate,
  enddate,
  callback,
) => {
  pool.getConnection((error, connection) => {
    // console.log("inside model")
    if (error) {
      callback("DB connection error");
    } else {
      if (startdate == "start" && enddate == "end") {
        if (interval === "1 WEEK") {
          console.log("IM here in 1 week");
          const query = `SELECT date(measured_time) as measured_time,param_id, AVG(param_value) AS param_value,ss_id FROM ${tableName} WHERE measured_time > DATE_SUB(NOW(), INTERVAL ${interval}) AND measured_time < NOW() AND ss_id = ? GROUP BY param_id, date(measured_time);`;
          connection.query(query, deviceId, (err, result) => {
            connection.release();
            if (err) {
              callback(err);
            } else {
              validateDBQueryResultLength(result, callback, 0);
            }
          });
        } else {
          const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time > DATE_SUB(NOW(), INTERVAL ${interval}) and measured_time < NOW() and ss_id=?`;
          connection.query(query, deviceId, (err, result) => {
            connection.release();
            if (err) {
              callback(err);
            } else {
              validateDBQueryResultLength(result, callback, 0);
            }
          });
        }
      } else {
        const query = `SELECT measured_time, param_id, param_value, ss_id FROM ${tableName} WHERE measured_time >= ? AND measured_time <= ? AND ss_id = ? `;
        connection.query(
          query,
          [startdate, enddate, deviceId],
          (err, result) => {
            connection.release();
            if (err) {
              callback(err);
            } else {
              validateDBQueryResultLength(result, callback, 0);
            }
          },
        );
      }
    }
  });
};

const getEquipmentList = (callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query =
        "select distinct(ss_type) from gl_subsystem where ss_type is not NULL and ss_type not in ('GL_SS_ADDRESS_BACNET_DDC','GL_SS_SERVER')";
      connection.query(query, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const getParameterTypes = (deviceId, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB Connection error");
    } else {
      const query = `select distinct(name) from gl_subsystem where ss_parent='${deviceId}'`;
      connection.query(query, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    }
  });
};

const deviceParametersReports = (
  deviceId,
  tableName,
  interval,
  parameters,
  callback,
) => {
  console.log("IM HERE", deviceId, tableName, interval, parameters);

  pool.getConnection((err, connection) => {
    if (connection) {
      // Create a dynamic list of placeholders (?, ?, ?) based on parameters length
      const paramPlaceholders = parameters.map(() => "?").join(", ");
      console.log("placeholders", paramPlaceholders);
      let query = "";
      // Construct the query
      if (deviceId === "e46b0b98-f33d-4503-995b-c0af445a2273") {
        query = `
      SELECT 
      d.measured_time, 
      d.param_id AS parameter, 
      d.param_value, 
      d.ss_id, 
      g.name AS devicename 
      FROM ${tableName} AS d 
      INNER JOIN gl_subsystem AS g ON d.ss_id = g.id 
      WHERE d.measured_time > DATE_SUB(NOW(), INTERVAL ${interval}) 
        AND d.measured_time < NOW() 
        AND d.ss_id = ? 
        AND d.param_id IN (${paramPlaceholders})

      UNION ALL

      SELECT 
          c.measured_time, 
          c.metric_id AS parameter, 
          c.metric_value as param_value, 
          'CPO' as ss_id, 
          'CPO' AS devicename 
      FROM cpm_0001bc0000_metric AS c
        WHERE c.measured_time > DATE_SUB(NOW(), INTERVAL ${interval});`;
      } else {
        query = `
    SELECT d.measured_time, d.param_id as parameter, d.param_value, d.ss_id, g.name as devicename FROM ${tableName} AS d INNER JOIN gl_subsystem AS g ON d.ss_id = g.id WHERE d.measured_time > DATE_SUB(NOW(), INTERVAL ${interval}) AND d.measured_time < NOW() AND d.ss_id = ? AND d.param_id IN (${paramPlaceholders})`;
      }

      // Combine deviceId and parameters into a single array of values
      const queryValues = [deviceId, ...parameters];
      console.log("parameters", queryValues);
      connection.query(query, queryValues, (err, result) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          console.log("result", result);
          validateDBQueryResultLength(result, callback, 0);
        }
      });
    } else {
      callback("DB Connection Error");
    }
  });
};

// function getAllEnergyMeters(callback){

//   pool.getConnection((err, connection) => {
//     if (connection) {
//       const query = `
//     SELECT id,name,ss_type,ss_address_value FROM tci_graylinx_cloud.gl_subsystem where ss_type IN ("NONGL_SS_EMS","NONGL_SS_ENERGY_METER_CAR_CHARGER","NONGL_SS_ENERGY_METER_LIFT","NONGL_SS_ENERGY_METER_LIGHT_AND_POWER","NONGL_SS_ENERGY_METER_LT_PANEL","NONGL_SS_ENERGY_METER_SDB_EMERGENCY","NONGL_SS_ENERGY_METER_UPS","NONGL_SS_ENERGY_METER_VRB");`;

//       connection.query(query,(err, result) => {
//         connection.release();
//         if (err) {
//           callback(err);
//         } else {
//           console.log("result",result)
//           callback(null, result);
//           //validateDBQueryResultLength(result, callback, 0);
//         }
//       });
//     } else {
//       callback("DB Connection Error");
//     }
//   });
// };

function getDailyHourlyEnergy(deviceType, start_date, end_date, callback) {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");

    let query =
      "SELECT HOUR(hour_start)+1 AS label, " +
      "ROUND(SUM(energy_kwh),2) AS value " +
      "FROM energy_hourly_analytics " +
      "WHERE DATE(hour_start) >= ? and DATE(hour_start) <= ?";

    const params = [start_date, end_date];

    if (deviceType !== "ALL") {
      query += "AND device_type = ? ";
      params.push(deviceType);
    }

    query += "GROUP BY HOUR(hour_start)+1 ORDER BY label";

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
}

function getWeeklyEnergy(deviceType, start_date, end_date, callback) {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");

    let query =
      "SELECT DAYNAME(day_date) AS label, " +
      "ROUND(SUM(energy_kwh),2) AS value " +
      "FROM energy_daily_analytics " +
      "WHERE day_date >= ? AND day_date <= ?";

    const params = [start_date, end_date];

    if (deviceType !== "ALL") {
      query += "AND device_type = ? ";
      params.push(deviceType);
    }

    query += "GROUP BY day_date ORDER BY day_date";

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
}

function getMonthlyEnergy(deviceType, start_date, end_date, callback) {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");

    let query =
      "SELECT DAY(day_date) AS label, " +
      "ROUND(SUM(energy_kwh),2) AS value " +
      "FROM energy_daily_analytics " +
      "WHERE day_date >= ? AND day_date <= ?";

    const params = [start_date, end_date];

    if (deviceType !== "ALL") {
      query += "AND device_type = ? ";
      params.push(deviceType);
    }

    query += "GROUP BY label ORDER BY label";

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
}

const getAssetHealthEnergy = function(
  deviceType,
  timeRange,
  start_date,
  end_date,
  callback,
) {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB connection error");

    let query = "";
    let params = [];

    // Decide grouping field
    const groupField = deviceType === "ALL" ? "device_type" : "device_name";
    const selectField = groupField;

    /* ================= DAILY ================= */
    // if (timeRange === 'daily') {
    query =
      "SELECT " +
      selectField +
      " AS device_name, " +
      "ROUND(SUM(energy_kwh), 2) AS energy_kwh " +
      "FROM energy_hourly_analytics " +
      "WHERE DATE(hour_start) >= ? AND DATE(hour_start) <= ? ";

    params = [start_date, end_date];

    if (deviceType !== "ALL") {
      query += "AND device_type = ? ";
      params.push(deviceType);
    }

    query += "GROUP BY " + groupField + " " + "ORDER BY device_name";
    //  }

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

const getEnergyHeatmap = function(
  deviceType,
  timeRange,
  start_date,
  end_date,
  callback,
) {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB connection error");

    let query = "";
    let params = [];

    // Decide grouping field
    const groupField = deviceType === "ALL" ? "device_type" : "device_name";
    const selectField = groupField;

    /* ============ DAILY (HOURS) ============ */
    if (timeRange === "daily") {
      query =
        "SELECT " +
        "HOUR(hour_start)+1 AS time_label, " +
        "" +
        selectField +
        " AS device_name, " +
        "ROUND(SUM(energy_kwh),2) AS energy_kwh " +
        "FROM energy_hourly_analytics " +
        "WHERE DATE(hour_start) >= ? and  DATE(hour_start) <= ? ";

      params = [start_date, end_date];

      if (deviceType !== "ALL") {
        query += "AND device_type = ? ";
        params.push(deviceType);
      }

      query +=
        "GROUP BY time_label, " +
        groupField +
        " " +
        "ORDER BY device_name, time_label";
    } else if (timeRange === "weekly") {
      /* ============ WEEKLY (DAYS) ============ */
      query =
        "SELECT " +
        "DAYNAME(day_date) AS time_label, " +
        "" +
        selectField +
        " AS device_name, " +
        "ROUND(SUM(energy_kwh),2) AS energy_kwh " +
        "FROM energy_daily_analytics " +
        "WHERE day_date >= ? AND  day_date <= ? ";
      // "WHERE hour_start >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND hour_start < DATE_ADD( DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),INTERVAL 7 DAY) ";

      params = [start_date, end_date];

      if (deviceType !== "ALL") {
        query += "AND device_type = ? ";
        params.push(deviceType);
      }

      query += "GROUP BY time_label,  " + groupField;
    } else if (timeRange === "monthly") {
      /* ============ MONTHLY (WEEKS) ============ */
      query =
        "SELECT " +
        "DAY(day_date) AS time_label, " +
        "" +
        selectField +
        " AS device_name, " +
        "ROUND(SUM(energy_kwh),2) AS energy_kwh " +
        "FROM energy_daily_analytics " +
        "WHERE  day_date >= ? AND  day_date <= ? ";
      // "SELECT " +
      // "CONCAT('Week', " +
      // "WEEK(day_date,1) - WEEK(DATE_SUB(day_date, INTERVAL DAYOFMONTH(day_date)-1 DAY),1) + 1) AS time_label, " +
      // "" + selectField + " AS device_name, " +
      // "ROUND(SUM(energy_kwh),2) AS energy_kwh " +
      // "FROM energy_daily_analytics " +
      // "WHERE MONTH(day_date) = MONTH(CURDATE()) " +
      // "AND YEAR(day_date) = YEAR(CURDATE()) ";

      params = [start_date, end_date];

      if (deviceType !== "ALL") {
        query += "AND device_type = ? ";
        params.push(deviceType);
      }

      query +=
        "GROUP BY time_label,  " + groupField + " " + "ORDER BY time_label";
    }

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

// const getAssetHealthAlarmCount = function (deviceType, timeRange, callback) {
//   pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB connection error');

//     let query = `
//       SELECT
//         ss.id AS device_id,
//         TRIM(REPLACE(ss.name, '\t', '')) AS device_name,
//         COUNT(a.id) AS alarm_count
//       FROM gl_subsystem ss
//       LEFT JOIN gl_alarm a
//         ON a.ss_id = ss.id
//         AND a.restore = 0
//     `;

//     let params = [];

//     /* ================= TIME FILTER ================= */
//     if (timeRange === 'daily') {
//       query += " AND a.measured_time >= CURDATE() ";
//     }
//     else if (timeRange === 'weekly') {
//       query +=
//         " AND a.measured_time >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) ";
//     }
//     else if (timeRange === 'monthly') {
//       query +=
//         " AND MONTH(a.measured_time) = MONTH(CURDATE()) " +
//         " AND YEAR(a.measured_time) = YEAR(CURDATE()) ";
//     }

//     /* ================= BASE WHERE ================= */
//     query += `
//       WHERE ss.ss_type IN (
//         'NONGL_SS_EMS',
//         'NONGL_SS_PRIMARY_VARIABLE_PUMPS'
//       )
//       AND (
//         LOWER(ss.name) LIKE '%chiller%'
//         OR LOWER(ss.name) LIKE '%condenser_pump%'
//         OR LOWER(ss.name) LIKE '%cooling_tower%'
//         OR LOWER(ss.name) LIKE '%primary%'
//       )
//     `;

//     /* ================= DEVICE TYPE FILTER ================= */
//     if (deviceType !== 'ALL') {
//       query += " AND LOWER(ss.name) LIKE ? ";
//       params.push('%' + deviceType.toLowerCase() + '%');
//     }

//     query += `
//       GROUP BY ss.id
//     `;

//     connection.query(query, params, (err, result) => {
//       connection.release();
//       if (err) return callback(err);
//       callback(null, result);
//     });
//   });
// };

/**
 * Get equipment metadata
 */
const getEquipmentMeta = (deviceType, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");

    let query =
      "SELECT DISTINCT id, ss_type, name, ss_address_value FROM gl_subsystem";
    const params = [];

   const allPlantSsTypes = Object.values(DEVICE_TO_SS_TYPE).flat();

    if (deviceType !== "ALL") {
      const ssTypes = DEVICE_TO_SS_TYPE[deviceType];
      if (!ssTypes) {
        connection.release();
        return callback("Invalid deviceType");
      }
      query += " WHERE ss_type IN (" + ssTypes.map(() => "?").join(",") + ")";
      params.push.apply(params, ssTypes);
    } else {
      query += " WHERE ss_type IN (" + allPlantSsTypes.map(() => "?").join(",") + ")";
      params.push.apply(params, allPlantSsTypes);
    }

    connection.query(query, params, (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};

/**
 * Calculate run hours & fault hours for one equipment
 */
const getEquipmentHealth = (
  ss_id,
  ss_type,
  name,
  ss_address_value,
  fromDate,
  toDate,
  callback,
) => {
  const prefix = getTablePrefix(ss_type);
  const runtimeParam = getRuntimeParam(ss_type);

  // console.log(prefix, runtimeParam);

  if (!prefix || !runtimeParam) return callback(null, null);

  const tableName = `${prefix}_${ss_address_value}_metric`;
  console.log(tableName, runtimeParam);
  const query = `
SELECT
  r.ss_id,
  r.run_hours,
  IFNULL(f.fault_hours, 0) AS fault_hours
FROM
(
  SELECT
    ss_id,
    (MAX(metric_value) - MIN(metric_value)) AS run_hours
  FROM ${tableName}
  WHERE metric_id = ?
    AND DATE(created_at) >= ?
    AND DATE(created_at) <= ?
  GROUP BY ss_id
) r

LEFT JOIN
(
  SELECT
    ss_id,
    SUM(
      CASE
        WHEN restore = 1 THEN
          TIMESTAMPDIFF(
            SECOND,
            created_at,
            IF(modified_at > ?, ?, modified_at)
          )
        ELSE
          TIMESTAMPDIFF(
            SECOND,
            created_at,
            ?
          )
      END
    ) / 3600 AS fault_hours
  FROM gl_alarm
  WHERE created_at >= ?
    AND created_at <= ?
  GROUP BY ss_id
) f
ON r.ss_id = f.ss_id
`;

  const params = [
    runtimeParam,
    fromDate,
    toDate,

    toDate, // IF(modified_at > toDate)
    toDate, // IF(modified_at > toDate)
    toDate, // for restore = 0 case
    fromDate,
    toDate,
  ];

  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");

    connection.query(query, params, (err, rows) => {
      connection.release();
      if (err) return callback(err);

      console.log(rows);
      const row = rows[0] || {};
      callback(null, {
        ss_id,
        ss_type,
        name,
        run_hours: Number(row.run_hours || 0),
        fault_hours: Number(row.fault_hours || 0),
      });
    });
  });
};

const getFaultHours = (ss_id, fromDate, toDate, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");
    const query = `
      SELECT
        SUM(
          CASE
            WHEN restore = 1 THEN
              TIMESTAMPDIFF(SECOND,
                GREATEST(created_at, ?),
                LEAST(modified_at, ?)
              )
            ELSE
              TIMESTAMPDIFF(SECOND,
                GREATEST(created_at, ?),
                ?
              )
          END
        ) / 3600 AS fault_hours
      FROM gl_alarm
      WHERE ss_id = ?
        AND created_at <= ?
        AND (restore = 0 OR modified_at >= ?)
    `;
    connection.query(
      query,
      [fromDate, toDate, fromDate, toDate, ss_id, toDate, fromDate],
      (err, rows) => {
        connection.release();
        if (err) return callback(err);
        callback(null, Number(rows[0]?.fault_hours || 0));
      }
    );
  });
};

const getRunHoursFromNormalized = (normalizedTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");
    connection.query(
      `SELECT GREATEST(0, MAX(run_hours) - MIN(run_hours)) AS run_hours
       FROM \`${normalizedTable}\`
       WHERE slot_time BETWEEN ? AND ?`,
      [from, to],
      (err, rows) => {
        connection.release();
        if (err) return callback(err);
        callback(null, Number(rows[0]?.run_hours || 0));
      },
    );
  });
};

const getAllDeviceRunHours = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback("DB Connection Error");
    connection.query(
      `SELECT device_key, SUM(metric_value) AS run_hours
       FROM gl_device_timeseries
       WHERE metric_id = 'run_hours'
         AND bucket_time BETWEEN ? AND ?
       GROUP BY device_key`,
      [from, to],
      (err, rows) => {
        connection.release();
        if (err) return callback(err);
        callback(null, rows);
      },
    );
  });
};

module.exports = {
  getGlZoneId,
  getGlThlZoneId,
  getxmapzones,
  getdevicebyzoneid,
  getlast24hr,
  gethvacdevicebyzoneid,
  getchild,
  getAhubyzoneid,
  getAhuData,
  getAhuData2,
  ahuLast24Hr,
  getArea,
  getEmsData,
  getEmsDeviceData,
  energyLast24Hr,
  energyDeviceData,
  ems24hoursdata,
  ems7daysdata,
  getUpsDeviceData,
  upsLast24Hr,
  vavLast24Hr,
  getzoneData,
  getTableName,
  csuLast24Hr,
  getDevicesZoneId,
  getDeviceData,
  getSubordinates,
  chillerLast24Hr,
  getCoolingTowerDataLast1Hr,
  getSubsystemDetailsBySstype,
  getMetricDataBydeviceId,
  newgetdevicebyzoneid,
  deviceLast24Hr,
  getEquipmentList,
  getParameterTypes,
  deviceParametersReports,
  //getAllEnergyMeters,
  getDailyHourlyEnergy,
  getWeeklyEnergy,
  getMonthlyEnergy,
  getAssetHealthEnergy,
  getEnergyHeatmap,
  //getAssetHealthAlarmCount
  getEquipmentMeta,
  getEquipmentHealth,
  getAllDeviceRunHours,
  getRunHoursFromNormalized,
  getFaultHours
};
