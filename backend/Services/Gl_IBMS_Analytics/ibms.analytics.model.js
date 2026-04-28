const { result } = require('lodash');
const { pool } = require('../../Database/pool');
// const { connect } = require('./ibms.analytics.route');
const { prependOnceListener } = require('node-notifier');
const { error } = require('winston');
const { query } = require('express');

const device_faults = (equipment_name, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return callback(err);
    }

    const query = 'SELECT * FROM gl_subsystem WHERE ss_type LIKE ?';
    const formattedName = `%${equipment_name}%`;

    connection.query(query, [formattedName], (error, response) => {
      connection.release();
      if (error) {
        return callback(error);
      }
      if (response.length > 0) {
        return callback(null, response);
      } else {
        return callback(null, false);
      }
    });
  });
};

const get_device_faults_data = (ids, from_date, to_date, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      return callback(err);
    }

    let results = [];
    let completedQueries = 0;

    const handleQueryResult = (err, rows) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      results.push(rows);
      completedQueries++;

      if (completedQueries === ids.length) {
        connection.release();
        callback(null, results);
      }
    };

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      let query = `SELECT * FROM gl_alarm WHERE ss_id = ?`;
      let queryParams = [id];

      if (from_date && to_date) {
        query += ` AND measured_time BETWEEN ? AND ?`;
        queryParams.push(from_date, to_date);
      }
      connection.query(query, queryParams, handleQueryResult);
    }
  });
};

const benchmarking = (ids, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback(err);
      return;
    }
    let results = [];
    let completedQueries = 0;

    const handleQueryResult = (err, rows) => {
      if (err) {
        connection.release();
        return callback(err);
      }

      results.push(rows);
      completedQueries++;

      if (completedQueries === ids.length) {
        connection.release();
        callback(null, results);
      }
    };

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      let query = `SELECT * FROM gl_alarm WHERE ss_id = ? AND MONTH(measured_time) = MONTH(CURRENT_DATE) AND YEAR(measured_time) = YEAR(CURRENT_DATE)`;
      let queryParams = [id];
      connection.query(query, queryParams, handleQueryResult);
    }
  });
};

const getEnergyConsumption = (
  deviceId,
  tableName,
  interval,
  start_time,
  end_time,
  callback
) => {

  console.log(deviceId,"-->",tableName,"-->",interval)
  let calculatedStartTime, calculatedEndTime;
  const lowerCaseInterval = interval ? interval.toLowerCase() : '';

  const now = new Date();

  switch (lowerCaseInterval) {
    case 'day':
      calculatedStartTime = new Date(now.setHours(0, 0, 0, 0));
      calculatedEndTime = new Date(now.setHours(23, 59, 59, 999));
      break;

    case 'month':
      calculatedStartTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      calculatedEndTime = now;
      break;

    case 'year':
      calculatedStartTime = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      calculatedEndTime = now;
      break;

    case 'week':
      calculatedStartTime = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      calculatedEndTime = new Date(now.setHours(23, 59, 59, 999));
      break;

    default:
      calculatedStartTime = new Date(start_time);
      calculatedEndTime = new Date(end_time);
      break;
  }

  const startTimeSQL = formatDateToSQL(calculatedStartTime);
  const endTimeSQL = formatDateToSQL(calculatedEndTime);
  console.log(startTimeSQL, '------>', endTimeSQL);
  console.log('tablename', tableName);

  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    } else {
      let query;

      switch (lowerCaseInterval) {
        case 'day':
          query = `
            WITH daily_energy AS (
            SELECT DATE(measured_time) AS mydate, HOUR(measured_time) AS hour, SUM(param_value) AS energy
            FROM ${tableName}
            WHERE measured_time BETWEEN ? AND ? 
            AND param_id = 'KWH' 
            AND ss_id = ?
            GROUP BY mydate, hour),
            daily_avg AS (SELECT mydate,AVG(energy) AS avg_energy FROM daily_energy GROUP BY mydate)
            SELECT de.mydate, de.hour, de.energy,  da.avg_energy
            FROM daily_energy de
            JOIN daily_avg da ON de.mydate = da.mydate
            ORDER BY de.mydate ASC, de.hour ASC
            `;
          break;

        case 'month':
          query = `
          WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
          SUM(param_value) AS total_energy FROM ${tableName} WHERE measured_time BETWEEN ? AND ? 
          AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),
          monthly_avg AS (SELECT ROUND(AVG(total_energy), 2) AS avg_energy FROM daily_totals)
          SELECT dt.mydate,MONTHNAME(dt.mydate) AS month_name,dt.total_energy AS energy,
          ma.avg_energy FROM daily_totals dt CROSS JOIN monthly_avg ma ORDER BY dt.mydate ASC;
          `;
          break;

        case 'year':
          query = `
          WITH monthly_totals AS (SELECT DATE_FORMAT(measured_time, '%Y-%m') AS month,
          MONTHNAME(measured_time) AS month_name,
          SUM(param_value) AS total_energy,
          DAY(LAST_DAY(measured_time)) AS days_in_month
          FROM ${tableName}
          WHERE measured_time BETWEEN ? AND ?
          AND param_id = 'KWH'
          AND ss_id = ?
          GROUP BY month, month_name)
          SELECT month_name, month,total_energy AS energy,
          ROUND(total_energy / days_in_month, 2) AS avg_energy FROM monthly_totals
          ORDER BY month ASC;
          `;
          break;

        case 'week':
          query = `
            WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
            SUM(param_value) AS total_energy 
            FROM ${tableName}  WHERE measured_time BETWEEN ? AND ? 
            AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),weekly_totals AS (
            SELECT YEARWEEK(mydate, 1) AS week,SUM(total_energy) AS weekly_energy
            FROM daily_totals GROUP BY week),
            weekly_avg AS ( SELECT week,ROUND(SUM(weekly_energy) / 7, 2) AS avg_energy 
            FROM weekly_totals GROUP BY week)
            SELECT dt.mydate,DAYNAME(dt.mydate) AS day_name,dt.total_energy AS energy,
            wa.avg_energy FROM daily_totals dt 
            JOIN weekly_totals wt ON YEARWEEK(dt.mydate, 1) = wt.week
            JOIN weekly_avg wa ON wt.week = wa.week
            ORDER BY dt.mydate ASC;
          `;
          break;
        default:
          callback({ message: 'Invalid interval', status: 400 });
          connection.release();
          return;
      }

      connection.query(
        query,
        [startTimeSQL, endTimeSQL, deviceId],
        (err, result) => {
          // console.log('this resultsss', result);

          connection.release();
          if (err) {
            callback(err);
          } else {
            if (result.length === 0) {
              callback({ message: 'No Data Available', status: 404 });
            } else {
              let formattedResult;
              switch (lowerCaseInterval) {
                case 'day':
                  formattedResult = formatDayData(result);
                  break;

                case 'month':
                  formattedResult = formatMonthData(result);
                  break;

                case 'year':
                  formattedResult = YearData(result);
                  console.log('formattedresult', formattedResult);
                  break;

                case 'week':
                  formattedResult = weekdata(result);
                  break;

                default:
                  formattedResult = result;
                  break;
              }

              callback(null, {
                result: formattedResult,
                startTimeSQL,
                endTimeSQL
              });
            }
          }
        }
      );
    }
  });
};

function formatHour(hour) {
  if (hour === 0) {
    return '12 AM';
  } else if (hour < 12) {
    return `${hour} AM`;
  } else if (hour === 12) {
    return '12 PM';
  } else {
    return `${hour - 12} PM`;
  }
}

function formatDayData(data) {
  return data.map(row => ({
    date: row.mydate,
    hour: formatHour(row.hour),
    runhour:row.runhour,
    energy: row.energy,
    avg_energy: row.avg_energy
  }));
}

// function calculateCumulativeEnergy(data) {
//   let energy = 0;
//   return data.map((row, index) => {
//     energy += row.daily_energy;
//     return {
//       mydate:row.mydate,
//       day_name: row.day_name,
//       energy: energy,
//     };
//   });
// }

function formatMonthData(data) {
  return data.map(row => ({
    date: row.mydate,
    month_name: row.month_name,
    energy: row.energy,
    avg_energy_of_month: row.avg_energy
  }));
}

// function formatYearData(data) {
//   const monthNames = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];

//   const currentMonth = new Date().getMonth() + 1;
//   const formattedResult = [];

//   const monthDataMap = {};
//   data.forEach(item => {
//     monthDataMap[item.month] = {
//       month: monthNames[item.month - 1],
//       energy: item.energy
//     };
//   });

//   // Loop through the last 12 months starting from the current month
//   for (let i = 0; i < 12; i++) {
//     const monthIndex = (currentMonth - 1 - i + 12) % 12 + 1;
//     if (monthDataMap[monthIndex]) {
//       formattedResult.push(monthDataMap[monthIndex]);
//     } else {
//       formattedResult.push({
//         month: monthNames[monthIndex - 1],
//         energy: 0 // or handle missing data accordingly
//       });
//     }
//   }

//   return formattedResult;
// }

const formatDateToSQL = date => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

function weekdata(data) {
  let energy = 0;
  return data.map((row, index) => {
    energy += row.daily_energy;
    return {
      mydate: row.mydate,
      day_name: row.day_name,
      energy: row.energy,
      avg_energy_of_week: row.avg_energy
    };
  });
}

function YearData(data) {
  return data.map(row => ({
    month_name: row.month_name,
    month: row.month,
    energy: row.energy,
    avg_energy_of_month: row.avg_energy
  }));
}

function dayTemperature(data) {
  return data.map(row => ({
    date: row.mydate,
    hour: formatHour(row.hour),
    temperature: row.temperature
  }));
}

const getEnergy = (deviceId, tableName, interval, callback) => {
  console.log('tablename', tableName);
  let calculatedStartTime, calculatedEndTime;
  const lowerCaseInterval = interval ? interval.toLowerCase() : '';

  const now = new Date();

  switch (lowerCaseInterval) {
    case 'day':
      calculatedStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      calculatedStartTime.setHours(0, 0, 0, 0);
      calculatedEndTime = new Date();
      calculatedEndTime.setHours(23, 59, 59, 999);
      break;

    case 'week':
      const currentDayOfWeek = now.getDay(); // Get the day of the week (0-6, Sunday-Saturday)
      const daysSinceLastMonday =
        currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Calculate how far we are from last Monday
      calculatedStartTime = new Date(
        now.getTime() - (daysSinceLastMonday + 7) * 24 * 60 * 60 * 1000
      ); // Last Monday
      calculatedStartTime.setHours(0, 0, 0, 0);
      calculatedEndTime = new Date(); // End of the current day
      calculatedEndTime.setHours(23, 59, 59, 999);
      break;

    case 'month':
      // Last month to the current month
      calculatedStartTime = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of last month
      calculatedEndTime = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      ); // Last day of current month
      break;

    case 'year':
      // Last year to the end of the current month
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-based index for the current month
      calculatedStartTime = new Date(currentYear - 1, 0, 1); // January 1st of last year
      calculatedEndTime = new Date(
        currentYear,
        currentMonth + 1,
        0,
        23,
        59,
        59,
        999
      ); // Last day of the current month
      break;

    default:
      calculatedStartTime = new Date(start_time);
      calculatedEndTime = new Date(end_time);
      break;
  }

  const startTimeSQL = formatDateToSQL(calculatedStartTime);
  const endTimeSQL = formatDateToSQL(calculatedEndTime);

  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    } else {
      let query;

      switch (lowerCaseInterval) {
        case 'day':
          query = `
            WITH daily_energy AS (
            SELECT DATE(measured_time) AS mydate, HOUR(measured_time) AS hour, SUM(param_value) AS energy
            FROM ${tableName}
            WHERE measured_time BETWEEN ? AND ? 
            AND param_id = 'KWH' 
            AND ss_id = ?
            GROUP BY mydate, hour),
            daily_avg AS (SELECT mydate,AVG(energy) AS avg_energy FROM daily_energy GROUP BY mydate)
            SELECT de.mydate, de.hour, de.energy,  da.avg_energy
            FROM daily_energy de
            JOIN daily_avg da ON de.mydate = da.mydate
            ORDER BY de.mydate ASC, de.hour ASC
            `;
          break;

        case 'month':
          query = `
          WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
          SUM(param_value) AS total_energy FROM ${tableName} WHERE measured_time BETWEEN ? AND ? 
          AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),
          monthly_avg AS (SELECT ROUND(AVG(total_energy), 2) AS avg_energy FROM daily_totals)
          SELECT dt.mydate,MONTHNAME(dt.mydate) AS month_name,dt.total_energy AS energy,
          ma.avg_energy FROM daily_totals dt CROSS JOIN monthly_avg ma ORDER BY dt.mydate ASC;
          `;
          break;

        case 'year':
          query = `
            WITH monthly_totals AS (SELECT DATE_FORMAT(measured_time, '%Y-%m') AS month,
            MONTHNAME(measured_time) AS month_name,
            SUM(param_value) AS total_energy,
            DAY(LAST_DAY(measured_time)) AS days_in_month
            FROM em_0001000000_om_p
            WHERE measured_time BETWEEN ? AND ?
            AND param_id = 'KWH'
            AND ss_id = ?
            GROUP BY month, month_name)
            SELECT month_name, month,total_energy AS energy,
            ROUND(total_energy / days_in_month, 2) AS avg_energy FROM monthly_totals
            ORDER BY month ASC;
            `;
          break;

        case 'week':
          query = `
            WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
            SUM(param_value) AS total_energy 
            FROM ${tableName}  WHERE measured_time BETWEEN ? AND ? 
            AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),weekly_totals AS (
            SELECT YEARWEEK(mydate, 1) AS week,SUM(total_energy) AS weekly_energy
            FROM daily_totals GROUP BY week),
            weekly_avg AS ( SELECT week,ROUND(SUM(weekly_energy) / 7, 2) AS avg_energy 
            FROM weekly_totals GROUP BY week)
            SELECT dt.mydate,DAYNAME(dt.mydate) AS day_name,dt.total_energy AS energy,
            wa.avg_energy FROM daily_totals dt 
            JOIN weekly_totals wt ON YEARWEEK(dt.mydate, 1) = wt.week
            JOIN weekly_avg wa ON wt.week = wa.week
            ORDER BY dt.mydate ASC;
          `;
          break;

        default:
          callback({ message: 'Invalid interval', status: 400 });
          connection.release();
          return;
      }

      connection.query(
        query,
        [startTimeSQL, endTimeSQL, deviceId],
        (err, result) => {
          // console.log("resultssss", result);
          connection.release();
          if (err) {
            callback(err);
          } else {
            if (result.length === 0) {
              callback({ message: 'No Data Available', status: 404 });
            } else {
              let formattedResult;
              switch (lowerCaseInterval) {
                case 'day':
                  formattedResult = formatDayData(result);
                  
                  break;

                case 'month':
                  formattedResult = formatMonthData(result);
                  break;

                case 'year':
                  formattedResult = YearData(result);
                  console.log('formattedresult', formattedResult);
                  break;

                case 'week':
                  formattedResult = weekdata(result);
                  break;

                default:
                  formattedResult = result;
                  break;
              }

              callback(null, {
                result: formattedResult,
                startTimeSQL,
                endTimeSQL
              });
            }
          }
        }
      );
    }
  });
};

const getTemperature = callback => {
  let calculatedStartTime, calculatedEndTime;
  const now = new Date();

  calculatedStartTime = new Date(now.setHours(0, 0, 0, 0));
  calculatedEndTime = new Date(now.setHours(23, 59, 59, 999));

  const startTimeSQL = formatDateToSQL(calculatedStartTime);
  const endTimeSQL = formatDateToSQL(calculatedEndTime);

  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    } else {
      let query;
      query = `
        SELECT 
            DATE(measured_time) AS mydate, 
            HOUR(measured_time) AS hour,
            param_value AS temperature
        FROM weather_service
        WHERE measured_time BETWEEN ? AND ? 
        AND param_id = 'temperature' 
        GROUP BY mydate, hour
        ORDER BY mydate ASC, hour ASC
      `;

      connection.query(query, [startTimeSQL, endTimeSQL], (err, result) => {
        console.log('resultsss', result);

        connection.release();
        if (err) {
          callback(err);
        } else {
          if (result.length === 0) {
            callback({ message: 'No Data Available', status: 404 });
          } else {
            let formattedResult;
            formattedResult = dayTemperature(result);

            callback(null, {
              result: formattedResult,
              startTimeSQL,
              endTimeSQL
            });
          }
        }
      });
    }
  });
};

const getRunhour = (
  deviceId,
  tableName,
  interval,
  start_time,
  end_time,
  callback
) => {
  console.log("inside runhour")
  let calculatedStartTime, calculatedEndTime;
  const lowerCaseInterval = interval ? interval.toLowerCase() : '';

  const now = new Date();

  switch (lowerCaseInterval) {
    case 'day':
      calculatedStartTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      calculatedStartTime.setHours(0, 0, 0, 0);
      calculatedEndTime = new Date();
      calculatedEndTime.setHours(0, 0, 0, 0);
      break;

    case 'month':
      calculatedStartTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      calculatedEndTime = now;
      break;

    case 'year':
      calculatedStartTime = new Date(
        now.getFullYear() - 1,
        now.getMonth(),
        now.getDate()
      );
      calculatedEndTime = now;
      break;

    case 'week':
      calculatedStartTime = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      calculatedEndTime = new Date(now.setHours(23, 59, 59, 999));
      break;

    default:
      calculatedStartTime = new Date(start_time);
      calculatedEndTime = new Date(end_time);
      break;
  }

  // const startTimeSQL = formatDateToSQL(calculatedStartTime);
  // const endTimeSQL = formatDateToSQL(calculatedEndTime);
  const startTimeSQL='2024-09-16 00:00:00'
  const endTimeSQL='2024-09-17 00:00:00'
  console.log(startTimeSQL, '------>', endTimeSQL);
  console.log('tablename', tableName);

  pool.getConnection((error, connection) => {
    if (error) {
      callback('DB connection error');
    } else {
      let query;

      switch (lowerCaseInterval) {
        case 'day':
          query = `
              SELECT 
                  DATE(measured_time) AS mydate, 
                  HOUR(measured_time) AS hour, 
                  metric_value AS runhour,
                  MIN(measured_time) AS min_time, 
                  MAX(measured_time) AS max_time
              FROM ${tableName}
              WHERE measured_time BETWEEN ? AND ? 
              AND metric_id = 'rh_hour' 
              AND ss_id = ?
              GROUP BY mydate, hour
              ORDER BY mydate ASC, hour ASC
            `;
          break;

        case 'month':
          query = `
          WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
          SUM(param_value) AS total_energy FROM ${tableName} WHERE measured_time BETWEEN ? AND ? 
          AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),
          monthly_avg AS (SELECT ROUND(AVG(total_energy), 2) AS avg_energy FROM daily_totals)
          SELECT dt.mydate,MONTHNAME(dt.mydate) AS month_name,dt.total_energy AS energy,
          ma.avg_energy FROM daily_totals dt CROSS JOIN monthly_avg ma ORDER BY dt.mydate ASC;
          `;
          break;

        case 'year':
          query = `
          WITH monthly_totals AS (SELECT DATE_FORMAT(measured_time, '%Y-%m') AS month,
          MONTHNAME(measured_time) AS month_name,
          SUM(param_value) AS total_energy,
          DAY(LAST_DAY(measured_time)) AS days_in_month
          FROM em_0001000000_om_p
          WHERE measured_time BETWEEN ? AND ?
          AND param_id = 'KWH'
          AND ss_id = ?
          GROUP BY month, month_name)
          SELECT month_name, month,total_energy AS energy,
          ROUND(total_energy / days_in_month, 2) AS avg_energy FROM monthly_totals
          ORDER BY month ASC;
          `;
          break;

        case 'week':
          query = `
            WITH daily_totals AS (SELECT DATE(measured_time) AS mydate, 
            SUM(param_value) AS total_energy 
            FROM ${tableName}  WHERE measured_time BETWEEN ? AND ? 
            AND param_id = 'KWH' AND ss_id = ? GROUP BY mydate),weekly_totals AS (
            SELECT YEARWEEK(mydate, 1) AS week,SUM(total_energy) AS weekly_energy
            FROM daily_totals GROUP BY week),
            weekly_avg AS ( SELECT week,ROUND(SUM(weekly_energy) / 7, 2) AS avg_energy 
            FROM weekly_totals GROUP BY week)
            SELECT dt.mydate,DAYNAME(dt.mydate) AS day_name,dt.total_energy AS energy,
            wa.avg_energy FROM daily_totals dt 
            JOIN weekly_totals wt ON YEARWEEK(dt.mydate, 1) = wt.week
            JOIN weekly_avg wa ON wt.week = wa.week
            ORDER BY dt.mydate ASC;
          `;
          break;
        default:
          callback({ message: 'Invalid interval', status: 400 });
          connection.release();
          return;
      }

      connection.query(
        query,
        [startTimeSQL, endTimeSQL, deviceId],
        (err, result) => {
          console.log('this resultsss', result);

          connection.release();
          if (err) {
            callback(err);
          } else {
            if (result.length === 0) {
              callback({ message: 'No Data Available', status: 404 });
            } else {
              let formattedResult;
              switch (lowerCaseInterval) {
                case 'day':
                  formattedResult = formatDayData(result);
                  console.log("formattedResult----->",formattedResult)
                  break;

                case 'month':
                  formattedResult = formatMonthData(result);
                  break;

                case 'year':
                  formattedResult = YearData(result);
                  console.log('formattedresult', formattedResult);
                  break;

                case 'week':
                  formattedResult = weekdata(result);
                  break;

                default:
                  formattedResult = result;
                  break;
              }

              callback(null, {
                result: formattedResult,
                startTimeSQL,
                endTimeSQL
              });
            }
          }
        }
      );
    }
  });
};

const getSubordinates=(id,callback)=>{
  pool.getConnection((error,connection)=>{
    console.log("connection taken")
    if(error){
      callback(error)
    }else{
      const query="WITH RECURSIVE subordinates AS (SELECT id,coordinates,name FROM gl_location WHERE id=? UNION SELECT p.id,p.coordinates,p.name FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id where p.zone_type!='gl_location_TYPE_SEAT') SELECT * FROM subordinates;";
      connection.query(query,[id],(err, result) => {
        connection.release();
        console.log("connection released")
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
  })

}


const getDeviceIds = (zone_ids, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      return callback(error);
    }

    const deviceIds = [];
    const queries = zone_ids.map(item => {
      return new Promise((resolve, reject) => {
        const query = "SELECT * FROM gl_location_subsystem_map WHERE zone_id = ?;";
        // console.log(query);
        connection.query(query, item, (err, result) => {
          if (err) {
            return reject(err);
          }
          // console.log("Result: ", result);
          deviceIds.push(...result); // Assuming you want to collect all device IDs
          resolve();
        });
      });
    });

    
    Promise.all(queries)
      .then(() => {
        connection.release();
        console.log("Connection released");
        console.log("deviceIds",deviceIds)
        callback(null, deviceIds);
      })
      .catch(err => {
        connection.release();
        console.log("Connection released due to error");
        callback(err);
      });
  });
};



module.exports = {
  device_faults,
  get_device_faults_data,
  benchmarking,
  getEnergyConsumption,
  getEnergy,
  getTemperature,
  getRunhour,
  getSubordinates,
  getDeviceIds
};
