const schedule = require("node-schedule");
const { pool } = require("../../Database/pool");
const controlConfig = require("../control_config.json");
const controls = require("../controls");
const { get_eqp_details } = require("../utils");

const RUN_HOUR_METRIC = "rh_hour";
const RUN_HOUR_CUMULATIVE = "rh_cumulative";
const RUN_HOUR_CRON = "0 * * * *";

let jobRunning = false;

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getDeviceTypeConfigs() {
  return Object.entries(controlConfig)
    .map(([name, cfg]) => ({ name, ...cfg }))
    .filter((cfg) => cfg && cfg.key && cfg.status);
}

function sanitizeTableName(name) {
  return /^[A-Za-z0-9_]+$/.test(name);
}

function buildTableNames(device) {
  if (!device?.glSSId || !device?.ssType) return null;

  const eqpDetails = get_eqp_details();
  const eqpMetrics = eqpDetails?.EQP_METRICS || {};
  const metricConfig = eqpMetrics[device.ssType];

  if (!metricConfig || metricConfig.length < 2) {
    console.warn(`Missing EQP_METRICS for ${device.ssType}`);
    return null;
  }

  const [prefix, metricSuffix] = metricConfig;
  const metricTable = `${prefix}${device.glSSId}${metricSuffix}`.toLowerCase();
  const omSuffix = metricSuffix.endsWith("_metric")
    ? metricSuffix.replace(/_metric$/, "_om_p")
    : "_om_p";
  const omTable = `${prefix}${device.glSSId}${omSuffix}`.toLowerCase();

  return { omTable, metricTable };
}

function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`
  );
}

function calculateRunHours(rows) {
  const states = rows.filter(
    (row) => row.param_value === "active" || row.param_value === "inactive",
  );

  if (states.length < 2) return 0;

  let totalMinutes = 0;

  for (let i = 0; i < states.length - 1; i++) {
    const current = states[i];
    const next = states[i + 1];

    if (current.param_value !== "active") continue;

    const currentTime = new Date(current.measured_time).getTime();
    const nextTime = new Date(next.measured_time).getTime();

    if (!Number.isFinite(currentTime) || !Number.isFinite(nextTime)) continue;

    const diffMinutes = (nextTime - currentTime) / 60000;
    if (diffMinutes > 0) {
      totalMinutes += diffMinutes;
    }
  }

  return totalMinutes / 60;
}

async function updateRunHoursForDevice(device, statusParam) {
  const tableNames = buildTableNames(device);
  if (!tableNames) return;

  const { omTable, metricTable } = tableNames;

  if (!sanitizeTableName(omTable) || !sanitizeTableName(metricTable)) {
    console.warn(`Skipping unsafe table name: ${device.glSSId}`);
    return;
  }

  const statusQuery = `
    SELECT measured_time, param_value
    FROM ${omTable}
    WHERE measured_time > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND measured_time < NOW()
      AND ss_id = ?
      AND param_id = ?
    ORDER BY measured_time ASC
  `;
  let rows;
  try {
    rows = await query(statusQuery, [device.id, statusParam]);
  } catch (err) {
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      console.warn(`Missing table ${omTable} for device ${device.id}`);
      return;
    }
    throw err;
  }

  const runHours = calculateRunHours(rows);
  const measuredTime = formatDateTime(new Date());

  try {
    await query(
      `INSERT INTO ${metricTable} (ss_id, measured_time, metric_id, metric_value)
       VALUES (?, ?, ?, ?)`,
      [device.id, measuredTime, RUN_HOUR_METRIC, runHours],
    );
  } catch (err) {
    if (err && err.code === "ER_NO_SUCH_TABLE") {
      console.warn(`Missing table ${metricTable} for device ${device.id}`);
      return;
    }
    throw err;
  }

  const cumulativeRows = await query(
    `SELECT metric_value
     FROM ${metricTable}
     WHERE metric_id = ? AND ss_id = ?
     ORDER BY measured_time DESC
     LIMIT 1`,
    [RUN_HOUR_CUMULATIVE, device.id],
  );

  const previous = cumulativeRows.length
    ? parseFloat(cumulativeRows[0].metric_value) || 0
    : 0;
  const nextValue = previous + runHours;

  if (cumulativeRows.length > 0) {
    await query(
      `UPDATE ${metricTable}
       SET metric_value = ?, measured_time = ?
       WHERE metric_id = ? AND ss_id = ?`,
      [nextValue, measuredTime, RUN_HOUR_CUMULATIVE, device.id],
    );
  } else {
    await query(
      `INSERT INTO ${metricTable} (ss_id, measured_time, metric_id, metric_value)
       VALUES (?, ?, ?, ?)`,
      [device.id, measuredTime, RUN_HOUR_CUMULATIVE, nextValue],
    );
  }
}

async function runHourJob() {
  if (jobRunning) {
    console.warn("Run hour job already running, skipping.");
    return;
  }

  jobRunning = true;

  try {
    const snapshot = await controls.loadSnapshot();
    if (!snapshot) {
      console.warn("Unable to load plant snapshot.");
      return;
    }

    const deviceTypes = getDeviceTypeConfigs();

    for (const cfg of deviceTypes) {
      const devices = snapshot[cfg.key];
      if (!devices) continue;

      for (const device of Object.values(devices)) {
        await updateRunHoursForDevice(device, cfg.status);
      }
    }
  } catch (err) {
    console.error("Run hour job failed:", err.message);
  } finally {
    jobRunning = false;
  }
}

schedule.scheduleJob(RUN_HOUR_CRON, runHourJob);

console.log("Run hour module started with control_config.json mapping.");

module.exports = {
  runHourJob,
};
