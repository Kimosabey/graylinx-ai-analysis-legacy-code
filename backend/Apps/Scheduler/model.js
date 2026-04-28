const { pool } = require('../../Database/pool');
const moment = require('moment');

const getStartSchedules = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      let start = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      // let end = moment()
      //   .add(30, 'm')
      //   .format('YYYY-MM-DDTHH:mm:ss.SSS');
      let end = moment().add(5, 'm').format('YYYY-MM-DDTHH:mm:ss.SSS');
      const query = `select * from schedule where start between timestamp("${start}") and timestamp("${end}") order by start`;
      // const query = `select * from schedule where start between timestamp("${start}") and timestamp("${end}") order by start`;
      // const query = `select * from schedule where start between timestamp("2023-02-27 00:00:00") and timestamp("2023-02-27 00:30:00") order by start`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};
const getEndSchedules = callback => {
  pool.getConnection((err, connection) => {
    if (connection) {
      let start = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
      // let end = moment()
      //   .add(30, 'm')
      //   .format('YYYY-MM-DDTHH:mm:ss.SSS');
      let end = moment().add(5, 'm').format('YYYY-MM-DDTHH:mm:ss.SSS');
      // const query = `select * from schedule where end between timestamp("${start}") and timestamp("${end}") order by end`;
      const query = `select * from schedule where end between timestamp("${start}") and timestamp("${end}") order by end`;
      // const query = `select * from schedule where start between timestamp("2022-11-24 18:12:00") and timestamp("2022-11-24 18:20:00") order by end`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const getGateway = (zoneId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `SELECT m.zone_id,g.ip FROM gateway_mapping m , gateway g WHERE m.zone_id = "${zoneId}" and m.gateway_id=g.id`;
      connection.query(query, (error, results) => {
        connection.release();
        if (error) {
          callback(error);
        } else {
          callback(null, JSON.stringify(results));
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const getLights = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,a.zone_id from device d,floor f,zone z,area a where d.type='dali_master' or d.type='dali_slave' and f.id=? and f.id=z.floor_id and a.zone_id=z.id and a.id=d.area_id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getAnalogControllers = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,a.zone_id,d.device_info from device d,floor f,zone z,area a where d.type='analog_controller' and f.id=? and f.id=z.floor_id and a.zone_id=z.id and a.id=d.area_id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getDevices = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,a.zone_id, d.device_info from device d,floor f,zone z,area a where (d.type='analog_controller' or d.type='dali_master' or d.type = 'dali_slave') and f.id=? and f.id=z.floor_id and a.zone_id=z.id and a.id=d.area_id group by d.mac ";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};
const getDevicesRec = (floor_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection Error');
    } else {
      const query =
        "select d.mac,d.type,a.zone_id, d.device_info from device d,floor f,zone z,area a where (d.type='dali_master' or d.type = 'dali_slave') and f.id=? and f.id=z.floor_id and a.zone_id=z.id and a.id=d.area_id group by d.mac";
      connection.query(query, floor_id, (err, response) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, JSON.stringify(response));
        }
      });
    }
  });
};

const getreccuringschedule = (callback) =>{
  pool.getConnection((error,connection) => {
    if(error){
      callback('DB connection Error')
    } else {
      const query="select * from schedule where ( NOW() BETWEEN start AND end)";
      connection.query(query,(err,response) => {
        connection.release();
        if(err){
          callback(err)
        } else {
          callback(null,response)
        }
      })
    }
  })
}

const updateLatestCommand = (payload,callback) =>{
  const data=JSON.stringify(payload)
  console.log("model------------------------------------>",data)
  pool.getConnection((err,connection)=>{
    if(err){
      callback("DB Connection Error")
    } else {
      const query = `insert into latest_command`
      // {"DALI":{"mode":"manual","intensity":0,"dali":[{"selection":"slaves","macId":"50dc01507ccf01f0","slaves":[1,3,4,2],"cmd":38000},{"selection":"slaves","macId":"50dc015028ade722","slaves":[],"cmd":38001}]},"WAC":{"mode":"manual","intensity":0,"wac":[{"macId":"50ac00000c7073e4","channel":0,"cmd":36000}]}}
    }
  })
}
module.exports = {
  getGateway,
  getStartSchedules,
  getEndSchedules,
  getLights,
  getAnalogControllers,
  getDevices,
  getDevicesRec,
  getreccuringschedule,
  updateLatestCommand
};
