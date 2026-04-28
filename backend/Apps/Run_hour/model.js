const { error } = require("winston");
const { pool } = require("../../Database/pool");
const { validateDBQueryResultLength } = require("../../Utils/common");
const { format, setHours, setMinutes, setSeconds } = require("date-fns");
const get_Table_name = require("../../CPM_modular/CPM_Data_Handler");

const getLast1HrData = (id, table_name, param_id, callback) => {
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const query = `SELECT measured_time,param_id,param_value,ss_id FROM ${table_name} WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR) and measured_time < NOW() and ss_id=? and param_id=?`;
      //  const query=`select measured_time,param_id,param_value,ss_id FROM ${tableName}  WHERE measured_time >"2022-08-12 10:55:50" and ss_id=?;`
      connection.query(query, [id, param_id], (err, result) => {
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

const insertIntoMetricTable = (
  id,
  metricvalue,
  table_name,
  ss_type,
  callback
) => {
  // console.log("Data Inserted into Metric Table.")
  pool.getConnection((error, connection) => {
    if (error) {
      callback("DB connection error");
    } else {
      const suffixToRemove = "_om_p";
      const replacement = "_metric";
      const metric_table = table_name.replace(suffixToRemove, replacement);
      // console.log("table name in model metric table",metric_table)
      // const truncateDate = setSeconds(setMinutes((new Date()), 0), 0)
      const measured_time = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      const query = `INSERT INTO ${metric_table} (ss_id, measured_time, metric_id, metric_value) VALUES (?, ?, ?, ?)`;
      connection.query(
        query,
        [id, measured_time, "rh_hour", metricvalue],
        (err, result) => {
          connection.release();
          if (err) {
            console.log("Error in Run hours Model.", err);
            callback(err);
          } else {
            get_Table_name.updatePlantSnapshotRunHours(
              ss_type,
              id,
              "rh_hour",
              metricvalue
            );
            // validateDBQueryResultLength(result,callback,0)
            callback(null, result);
          }
        }
      );
    }
  });
};

const getCumilativeMetricData = (table_name, interval, metric_id, callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback("DB connection error");
    } else {
      const suffixToRemove = "_om_p";
      const replacement = "_metric";
      const metric_table = table_name.replace(suffixToRemove, replacement);
      const query = `SELECT metric_id,SUM(metric_value) AS total_metric_value,ss_id FROM ${metric_table} WHERE measured_time > DATE_SUB(NOW(), INTERVAL ${interval}) AND measured_time < NOW() AND metric_id = ? GROUP BY metric_id;`;
      connection.query(query, [metric_id], (err, result) => {
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

const addCumilativeMetricDataToTable = (
  data,
  table_name,
  measured_time,
  ss_type,
  callback
) => {
  pool.getConnection((err, connection) => {
    if (err) {
      callback("DB Connection error");
    } else {
      const suffixToRemove = "_om_p";
      const replacement = "_metric";
      const metric_table = table_name.replace(suffixToRemove, replacement);
      const query = `INSERT INTO ${metric_table} (ss_id, measured_time, metric_id, metric_value) VALUES (?, ?, ?, ?)`;
      connection.query(
        query,
        [
          data[0].ss_id,
          measured_time,
          data[0].metric_id,
          data[0].total_metric_value,
        ],
        (err, result) => {
          connection.release();
          if (err) {
            callback(err);
          } else {
            get_Table_name.updatePlantSnapshotRunHours(
              ss_type,
              data[0].ss_id,
              data[0].metric_id,
              data[0].total_metric_value
            );
            validateDBQueryResultLength(result, callback, 0);
          }
        }
      );
    }
  });
};

function convertMinutesToHoursMinutes(minutes) {
  let hours = Math.floor(minutes / 60); // Get whole hours
  let mins = minutes % 60; // Get remaining minutes
  return `${hours}hr:${mins}min`;
}

const addCumilativeDataForCPM = (
  id,
  metricvalue,
  table_name,
  ss_type,
  callback
) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      const suffixToRemove = "_om_p";
      const replacement = "_metric";
      const metric_table = table_name.replace(suffixToRemove, replacement);
      const measured_time = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
      const sql = `select * from ${metric_table} where metric_id="rh_cumulative"`;
      connection.query(sql, (err, results) => {
        // connection.release();
        if (err) {
          callback(err);
        } else {
          if (results.length > 0) {
            const cumulative_value =
              parseFloat(results[0].metric_value) + parseFloat(metricvalue);
            const sql1 = `update ${metric_table} set metric_value=?,measured_time=? where metric_id=?`;
            connection.query(
              sql1,
              [cumulative_value, measured_time, "rh_cumulative"],
              (err, res) => {
                connection.release();
                if (err) {
                  callback(err);
                } else {
                  get_Table_name.updatePlantSnapshotRunHours(
                    ss_type,
                    id,
                    "rh_cumulative",
                    cumulative_value
                  );
                  // validateDBQueryResultLength(res,callback,0)
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, res);
                  }
                }
              }
            );
          } else {
            const sql2 = `INSERT INTO ${metric_table} (ss_id, measured_time, metric_id, metric_value) VALUES (?, ?, ?, ?)`;
            connection.query(
              sql2,
              [id, measured_time, "rh_cumulative", metricvalue],
              (err, res) => {
                connection.release();
                if (err) {
                  callback(err);
                } else {
                  get_Table_name.updatePlantSnapshotRunHours(
                    ss_type,
                    id,
                    "rh_cumulative",
                    metricvalue
                  );
                  // validateDBQueryResultLength(res,callback,0)
                  if (err) {
                    callback(err);
                  } else {
                    callback(null, res);
                  }
                }
              }
            );
          }
        }
      });
    }
  });
};

module.exports = {
  getLast1HrData,
  insertIntoMetricTable,
  getCumilativeMetricData,
  addCumilativeMetricDataToTable,
  addCumilativeDataForCPM,
};
