const mysql = require("mysql2/promise");
const {
  mysql_host,
  mysql_user,
  mysql_passcode,
  mysql_db_name,
} = require("./config");

let pool;

function get_mysql_pool() {
  if (!pool) {
    pool = mysql.createPool({
      host: mysql_host,
      user: mysql_user,
      password: mysql_passcode,
      database: mysql_db_name,
      waitForConnections: true,
      multipleStatements: true,
    });
  }
  return pool;
}

async function shutdown() {
  if (pool) {
    pool = null;
  }
}

async function insertMetric(data) {
  const pool = get_mysql_pool();

  const sql = `
    INSERT INTO cpm_0001bc0000_metric (
      ss_id, measured_time, metric_id, metric_value,
      metric_minimum, metric_average, metric_maximum
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.ss_id || null,
    data.measured_time || new Date(),
    data.metric_id || null,
    data.metric_value || null,
    data.metric_minimum || null,
    data.metric_average || null,
    data.metric_maximum || null,
  ];

  const [result] = await pool.execute(sql, params);
  return result.insertId;
}

async function update_metric_value(metric_id, metric_value) {
  const pool = get_mysql_pool();
  const sql = `
    UPDATE cpm_0001bc0000_metric
    SET metric_value = ?
    WHERE metric_id = ?
  `;
  const params = [metric_value, metric_id];
  const [result] = await pool.execute(sql, params);
  return result.affectedRows;
}

async function getMetrics(metric_id) {
  const pool = get_mysql_pool();

  const sql = `SELECT * FROM cpm_0001bc0000_metric WHERE metric_id = ? ORDER BY created_at DESC LIMIT 1;`;
  const [rows] = await pool.execute(sql, [metric_id]);
  return rows;
}

async function insertAlarm({
  ss_id,
  alarm_code,
  measured_time,
  param_id,
  message,
}) {
  const pool = get_mysql_pool();

  const sql = `
    INSERT INTO gl_alarm
      (ss_id, alarm_code, measured_time, param_id, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [ss_id, alarm_code, measured_time, param_id, message];

  try {
    const [result] = await pool.execute(sql, values);
    return {
      success: true,
      insertId: result.insertId,
    };
  } catch (err) {
    console.error("Error inserting alarm:", err.message);
    return {
      success: false,
      insertId: null,
    };
  }
}

async function getActiveAlarms() {
  const pool = get_mysql_pool();

  const sql = `
    SELECT
      id,
      ss_id,
      alarm_code,
      measured_time,
      param_id,
      message,
      acknowledged,
      restore,
      delete_alarm
    FROM gl_alarm
    WHERE restore != 1 AND delete_alarm != 1
    ORDER BY measured_time DESC
  `;

  try {
    const [rows] = await pool.execute(sql);
    return {
      success: true,
      count: rows.length,
      data: rows,
    };
  } catch (err) {
    console.error("Error fetching alarms:", err.message);
    throw err;
  }
}

function findTablesLike(pattern) {
  return new Promise((resolve, reject) => {
    const pool = get_mysql_pool();
    const sql = `SHOW TABLES LIKE ?`;
    pool.query(sql, [pattern], (err, rows) => {
      if (err) return reject(err);
      const tables = rows.map((row) => Object.values(row)[0]);
      resolve(tables);
    });
  });
}

async function updateAlarm({ ss_id, alarm_code, measured_time }) {
  const pool = get_mysql_pool();

  const sql = `
    Update gl_alarm set measured_time = ? where ss_id=? and alarm_code = ?
  `;

  const values = [measured_time, ss_id, alarm_code];

  try {
    const [result] = await pool.execute(sql, values);
    return {
      success: true,
      insertId: result.insertId,
    };
  } catch (err) {
    console.error("Error inserting alarm:", err.message);
    return {
      success: false,
      insertId: null,
    };
  }
}

async function updateAlarmByKey({
  ss_id,
  alarm_code,
  param_id,
  measured_time,
}) {
  const pool = get_mysql_pool();

  const sql = `
    Update gl_alarm
    set measured_time = ?
    where ss_id <=> ? and alarm_code = ? and param_id = ?
  `;

  const values = [measured_time, ss_id, alarm_code, param_id];

  try {
    const [result] = await pool.execute(sql, values);
    return {
      success: true,
      insertId: result.insertId,
    };
  } catch (err) {
    console.error("Error updating alarm:", err.message);
    return {
      success: false,
      insertId: null,
    };
  }
}

async function updateDeleteAlarm({ ss_id, alarm_code, param_id }) {
  const pool = get_mysql_pool();

  const sql = `
    Update gl_alarm
    set delete_alarm = 1
    where ss_id <=> ? and alarm_code = ? and param_id = ? and restore != 1
  `;

  const values = [ss_id, alarm_code, param_id];

  try {
    const [result] = await pool.execute(sql, values);
    return {
      success: true,
      insertId: result.insertId,
    };
  } catch (err) {
    console.error("Error updating delete_alarm:", err.message);
    return {
      success: false,
      insertId: null,
    };
  }
}

module.exports = {
  get_mysql_pool,
  shutdown,
  insertMetric,
  update_metric_value,
  getMetrics,
  insertAlarm,
  getActiveAlarms,
  findTablesLike,
  updateAlarm,
  updateAlarmByKey,
  updateDeleteAlarm,
};
