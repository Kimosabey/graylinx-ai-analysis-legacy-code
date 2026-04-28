/**
 * plantSnapshotTransformer.js
 *
 * Converts flat DB rows into Plant_Snapshot JSON structure
 */
const { pool } = require("../Database/pool");
const { get_eqp_details } = require("./utils");

const MASTER_QUERY = `
select 
  gll.id as Location,
  gl.ss_type device_ss_type,
  gl.name as device_name,
  gl.id as device_id,
  gl.ss_address_value as device_table_name,
  concat(gl.ss_address_value,'_metric') as metric_table_name,
  device.ss_tag  as param_type,
  device.ss_address_value as param_instance_id,
  device.name as param_id, 
  le.param_value as presentValue,
  le.measured_time,
  device.description as gl_code,
  ddc.name as ddc_name,
  ddc.id as ddc_ssid
from (
  SELECT * FROM gl_subsystem
  where description is not null and ss_parent is not null
    and ss_status = 'GL_SS_STATUS_ACTIVE'
) device
left join (
  select * from gl_subsystem gl
  where ss_type is not null
    and ss_address_type != 'GL_SS_ADDRESS_IP'
    and ss_status = 'GL_SS_STATUS_ACTIVE'
) gl
  on device.ss_parent = gl.id
left join gl_subsystem_latest_event le
  ON le.param_id = device.name
 AND le.ss_id = gl.id
left join gl_location_subsystem_map glm
  on glm.ss_id = gl.id
left join gl_location gll
  on glm.zone_id = gll.id
left join (
  select * from gl_subsystem
  where ss_type = 'GL_SS_ADDRESS_BACNET_DDC'
) ddc
  on gl.ss_parent = ddc.id;
`;
async function getMetricData(ssType, table_name, id) {
  const metrics = {
    rh_cumulative: 0,
    information: "data found successfully",
    Equipment_Faulty: false,
    Alarm: false,
    Alarm_code: [],
    downtime: 0,
  };

  const eqpConfig = get_eqp_details();
  const eqpMetrics = eqpConfig?.EQP_METRICS;

  if (!eqpMetrics || !eqpMetrics[ssType]) {
    return metrics;
  }

  const device = eqpMetrics[ssType];

  if (!Array.isArray(device) || device.length < 2) {
    return metrics;
  }

  const tableName = `${device[0]}${table_name}${device[1]}`;

  const metricSQL = `
    SELECT m.*
    FROM ${tableName} m
    INNER JOIN (
      SELECT metric_id, MAX(measured_time) AS t
      FROM ${tableName}
      GROUP BY metric_id
    ) x
      ON x.metric_id = m.metric_id
     AND x.t = m.measured_time
  `;

  try {
    const rows = await executeSQL(metricSQL);

    for (const r of rows) {
      if (r.metric_id && typeof r.metric_value === "number") {
        metrics[r.metric_id] =
          Math.round((r.metric_value + Number.EPSILON) * 100) / 100;
      }
    }
  } catch (e) {
    if (e?.code === "ER_NO_SUCH_TABLE") {
      return metrics;
    }
    throw e;
  }
  const alarmSQL = `
    SELECT alarm_code
    FROM gl_alarm
    WHERE ss_id = ?
      AND acknowledged = 0 and restore = 0 and delete_alarm = 0
  `;

  const alarms = await executeSQL(alarmSQL, [id]);

  if (alarms.length > 0) {
    metrics.Equipment_Faulty = true;
    metrics.Alarm = true;
    metrics.Alarm_code = [...new Set(alarms.map((a) => String(a.alarm_code)))];
  }
  const nonGlHeaders = [
    "NONGL_SS_COMMON_HEADER",
    "NONGL_SS_WATER_COOLED_HEADER",
    "NONGL_SS_AIR_COOLED_HEADER",
    "NONGL_SS_DPT_DEVICE",
  ];
  if (nonGlHeaders.includes(ssType)) {
    return {
      ...metrics,
      Monitor_Parameter: true,
      THRESHOLD_CROSSING_INTERVAL: 20,
      THRESHOLD_CROSSED_TIMESTAMP: "",
      THRESHOLD_CROSSED_VALUE: 0,
    };
  }
  if (ssType === "NONGL_SS_CPM") {
    return {
      ...metrics,
      Monitor_Parameter: true,
      THRESHOLD_CROSSING_INTERVAL: 15,
      THRESHOLD_CROSSED_TIMESTAMP: "",
      THRESHOLD_CROSSED_VALUE: 0,
    };
  }

  return metrics;
}

function executeSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
      if (err) return reject(err);
      conn.query(sql, params, (qErr, rows) => {
        conn.release();
        qErr ? reject(qErr) : resolve(rows);
      });
    });
  });
}
async function transformPlantSnapshot(rows) {
  const snapshot = {
    Plant_Snapshot: {},
  };
  for (const row of rows) {
    const {
      device_ss_type,
      device_id,
      device_name,
      device_table_name,
      param_type,
      param_instance_id,
      param_id,
      presentValue,
      measured_time,
      gl_code,
      ddc_name,
      Location,
      ddc_ssid,
    } = row;

    if (!snapshot.Plant_Snapshot[device_ss_type]) {
      snapshot.Plant_Snapshot[device_ss_type] = {};
    }

    if (!snapshot.Plant_Snapshot[device_ss_type][device_id]) {
      snapshot.Plant_Snapshot[device_ss_type][device_id] = {
        ssType: device_ss_type,
        ddcid: ddc_name,
        Equipment_Group: Location || null,
        BACnetDeviceAddress: null,
        glSSId: device_table_name,
        id: device_id,
        name: device_name?.trim(),
        Eqp_Attributes: {},
        Eqp_Metrics: await getMetricData(
          device_ss_type,
          device_table_name,
          device_id,
        ),
        EQP_COMPONENTS: {},
        inUse: false,
      };
    }

    const deviceRef = snapshot.Plant_Snapshot[device_ss_type][device_id];

    if (param_id) {
      deviceRef.Eqp_Attributes[param_id] = {
        objId: `${param_type}:${param_instance_id}`,
        objName: gl_code,
        presentValue: presentValue,
        priority: new Array(16).fill(null),
        measured_time: formatDate(measured_time),
        ddc: ddc_name,
        ddc_ssid: ddc_ssid,
      };
    }
  }

  return snapshot;
}

function formatDate(date) {
  if (!date) return null;

  const d = new Date(date);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}
async function prepare_plant_snapshot() {
  try {
    const rows = await executeSQL(MASTER_QUERY);
    const plantSnapshot = await transformPlantSnapshot(rows);
    return plantSnapshot.Plant_Snapshot;
  } catch (err) {
    console.error("Error building plant snapshot:", err);
  } finally {
    console.log("Completed plant snapshot preparation.");
  }
}

module.exports = {
  prepare_plant_snapshot,
};
