const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');
const { query } = require('../../Config/logger');
const _ = require('lodash');
const e = require('cors');
const { parse, format,addMinutes,subMinutes } = require('date-fns');
const { toUpper } = require('lodash');

const searchBookable = (data, callback) => {
  console.log(data)
  pool.getConnection((err, connection) => {
    if (connection) {
      const searchBookableQuery = `WITH RECURSIVE subordinates AS (SELECT id,name,description,zone_type,coordinates,zone_parent,zone_tag FROM gl_location WHERE id= ? UNION SELECT p.id,p.name,p.description,p.zone_type,p.coordinates,p.zone_parent,p.zone_tag FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status) SELECT * FROM subordinates`;
      connection.query(searchBookableQuery, data.parent_id, (error, result) => {
        if (error) {
          connection.release();
          callback(error);
        } else {
          connection.release();
          const res2 = result.filter(
            record =>
              record.zone_type == toUpper(data.zone_type)  
          );
          callback(null, res2);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const searchBooked = (data, callback) => {
  console.log("--------------------",data)
  pool.getConnection((err, connection) => {
    if (connection) {
      let start_time = format(addMinutes(parse(data.query.from,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss');
      let end_time = format(subMinutes(parse(data.query.from,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss');

      const searchBookableQuery = `WITH RECURSIVE subordinates AS (SELECT id,name,description,zone_type,zone_parent,zone_tag FROM gl_location WHERE id= ? UNION SELECT p.id,p.name,p.description,p.zone_type,p.zone_parent,p.zone_tag FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status) SELECT * FROM subordinates 
      inner join gl_location_user on subordinates.id = gl_location_user.zone_id where (gl_location_user.usage_start_time BETWEEN ? AND ?) OR (gl_location_user.usage_end_time BETWEEN ? AND ?) OR (? BETWEEN gl_location_user.usage_start_time AND gl_location_user.usage_end_time)`;
      connection.query(
        searchBookableQuery,
        [
          data.parent_id,
          start_time,
          end_time,
          start_time,
          end_time,
          start_time
        ],
        (error, result) => {
          console.log("-------log",result)
          if (error) {
            connection.release();
            callback(error);
          } else {
            connection.release();
            const res2 = result.filter(
              record => record.zone_type == toUpper(data.zone_type)
            );
            callback(null, res2);
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

const getUser = (email, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query1 = `select id, name, email_id, phone_no from gl_user where email_id like "${email}%"`;
      connection.query(query1, (error1, result1) => {
        if (error1) {
          connection.release();
          callback(error1);
        } else {
          connection.release();
          callback(null, result1);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

const booking = (payload, callback) => {
  console.log('booking: ', payload);
  pool.getConnection((error, connection) => {
    if (connection) {
      const query =
        'Insert into GL_LOCATION_user(zone_id, user_id, usage_start_time, usage_end_time) values(?,?,?,?)';
      let count = 0;
      payload.zone_ids.forEach(zone_id => {
        connection.query(
          query,
          [
            zone_id,
            payload.user_id,
            payload.duration_from,
            payload.duration_to
          ],
          (error, result) => {
            if (error) {
              count = count + 1;
              if (count == payload.zone_ids.length) {
                connection.release();
                callback(null, 'error');
              }
            } else {
              count = count + 1;
              if (count == payload.zone_ids.length) {
                connection.release();
                callback(null, 'success');
              }
            }
          }
        );
      });
    } else {
      callback(null, 'DB connection error');
    }
  });
};

const bookingList = (data, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const query = `WITH RECURSIVE subordinates AS (SELECT id,name,description,zone_type,zone_parent,zone_tag FROM gl_location WHERE id= ? UNION SELECT p.id,p.name,p.description,p.zone_type,p.zone_parent,p.zone_tag FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status) SELECT s.name as GL_LOCATION, s.description as GL_LOCATION_description, s.zone_type, u.name as user_name, u.email_id as user_email, gu.usage_start_time, gu.usage_end_time,gu.id as booking_id FROM subordinates s inner join gl_location_user gu on s.id = gu.zone_id inner join gl_user u on u.id = gu.user_id`;
      connection.query(query, data.zone_parent, (error, result) => {
        if (error) {
          connection.release();
          callback(error);
        } else {
          const res2 = result.filter(
            record => record.zone_type == data.zone_type
          );
          connection.release();
          callback(null, res2);
        }
      });
    } else {
      callback('DB connection error');
    }
  });
};

module.exports = {
  searchBookable,
  searchBooked,
  getUser,
  booking,
  bookingList
};
