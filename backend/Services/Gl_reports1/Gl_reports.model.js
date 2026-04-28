'use strict';
/**
 * Gl_reports.model.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure data-access layer. All analytics data is read from pre-computed gl_*
 * EAV tables. No UNION ALL across raw device tables, no runtime math.
 *
 * gl_device_timeseries  — 5-min metrics per device  (kW, TR, TRH, kWh, ...)
 * gl_plant_timeseries   — 5-min plant-level totals
 * gl_device_summary     — daily rollup per device
 * gl_plant_summary      — daily plant KPIs
 *
 * BTU meter is read directly from its raw table (not in procedure scope).
 *
 * Re-exports DeviceRegistry helpers for backward compat with any callers that
 * import them from this module (e.g. controller, service).
 */

const { pool }    = require('../../Database/pool');
const registry    = require('./core/DeviceRegistry');

const {
  cfg,
  allDevices,
  allLeafDevices,
  devicesByType,
  devicesByCalcType,
  deviceByKey
} = registry;

// ─────────────────────────────────────────────────────────────────────────────
// DB HELPER
// ─────────────────────────────────────────────────────────────────────────────

function query(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE TIME-SERIES
// Returns EAV rows: { bucket_time, metric_id, metric_value }
// Service pivots these to wide format.
// ─────────────────────────────────────────────────────────────────────────────

function getDeviceTimeseries(deviceKey, from, to) {
  return query(
    `SELECT bucket_time, metric_id, metric_value
     FROM gl_device_timeseries
     WHERE device_key = ? AND bucket_time BETWEEN ? AND ?
     ORDER BY bucket_time, metric_id`,
    [deviceKey, from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANT TIME-SERIES
// Returns EAV rows: { bucket_time, metric_id, metric_value }
// ─────────────────────────────────────────────────────────────────────────────

function getPlantTimeseries(from, to) {
  return query(
    `SELECT bucket_time, metric_id, metric_value
     FROM gl_plant_timeseries
     WHERE bucket_time BETWEEN ? AND ?
     ORDER BY bucket_time, metric_id`,
    [from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE DAILY SUMMARY
// Returns EAV rows: { summary_date, metric_id, metric_value }
// ─────────────────────────────────────────────────────────────────────────────

function getDeviceSummary(deviceKey, from, to) {
  return query(
    `SELECT summary_date, metric_id, metric_value
     FROM gl_device_summary
     WHERE device_key = ? AND summary_date BETWEEN DATE(?) AND DATE(?)
     ORDER BY summary_date, metric_id`,
    [deviceKey, from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANT DAILY SUMMARY
// ─────────────────────────────────────────────────────────────────────────────

function getPlantSummaryData(from, to) {
  return query(
    `SELECT summary_date, metric_id, metric_value
     FROM gl_plant_summary
     WHERE summary_date BETWEEN DATE(?) AND DATE(?)
     ORDER BY summary_date, metric_id`,
    [from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL DEVICES — aggregate kWh + run_hours from device_summary over date range
// Used by getPlantSummary service to build the summary response.
// ─────────────────────────────────────────────────────────────────────────────

function getAllDeviceSummary(from, to) {
  // All metrics read from gl_device_timeseries with exact range — consistent time scope.
  // kWh  = MAX(kWh_cumulative) - MIN(kWh_cumulative) (handles cumulative counter devices)
  // TRH, run_hours = SUM of per-bucket incremental values
  // peak_kW = MAX of per-bucket kW values
  return query(
    `SELECT device_key, 'kWh' AS metric_id,
       GREATEST(0,
         MAX(CASE WHEN metric_id = 'kWh_cumulative' THEN metric_value END) -
         MIN(CASE WHEN metric_id = 'kWh_cumulative' THEN metric_value END)
       ) AS metric_value
     FROM gl_device_timeseries
     WHERE bucket_time BETWEEN ? AND ?
       AND metric_id = 'kWh_cumulative'
     GROUP BY device_key

     UNION ALL

     SELECT device_key, metric_id, SUM(metric_value) AS metric_value
     FROM gl_device_timeseries
     WHERE bucket_time BETWEEN ? AND ?
       AND metric_id IN ('TRH', 'run_hours')
     GROUP BY device_key, metric_id

     UNION ALL

     SELECT device_key, 'peak_kW' AS metric_id, MAX(metric_value) AS metric_value
     FROM gl_device_timeseries
     WHERE bucket_time BETWEEN ? AND ?
       AND metric_id = 'kW'
     GROUP BY device_key
     ORDER BY device_key, metric_id`,
    [from, to, from, to, from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BTU METER — raw EAV table (not managed by procedures)
// ─────────────────────────────────────────────────────────────────────────────

function getBtuMeterData(from, to) {
  if (!cfg.btu_meter) return Promise.resolve([]);
  const table       = cfg.btu_meter.table;
  const paramValues = Object.values(cfg.btu_meter.params ?? {}).filter(Boolean);
  if (!paramValues.length) return Promise.resolve([]);
  const bucketSec   = (cfg.time_bucket_minutes || 15) * 60;

  return query(
    `SELECT
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(measured_time) / ?) * ?) AS measured_time,
       param_id,
       AVG(CAST(param_value AS DECIMAL(20,6))) AS param_value
     FROM \`${table}\`
     WHERE measured_time BETWEEN ? AND ?
       AND param_id IN (?)
     GROUP BY FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(measured_time) / ?) * ?), param_id
     ORDER BY measured_time`,
    [bucketSec, bucketSec, from, to, paramValues, bucketSec, bucketSec]
  );
}

// Returns MAX - MIN of btu_meter_energy_consump_00 over the range.
// Used by summary API as BTU_TRH denominator for SPC and kWh_per_TRh.
// Returns null if no BTU data — no fallback to chiller TRH.
function getBtuMeterMinMax(from, to) {
  if (!cfg.btu_meter) return Promise.resolve(null);
  const table = cfg.btu_meter.table;
  const param = cfg.btu_meter.params?.energy_consump;
  if (!table || !param) return Promise.resolve(null);

  // Exclude outliers using a two-pass trimmed approach:
  //   Pass 1: compute AVG of values below the overall AVG (lower-half mean = robust baseline)
  //   Pass 2: keep only values <= 100× that baseline, eliminating sensor spikes like 202768384
  return query(
    `SELECT MAX(v) AS max_val, MIN(v) AS min_val
     FROM (
       SELECT CAST(param_value AS DECIMAL(20,6)) AS v
       FROM \`${table}\`
       WHERE measured_time BETWEEN ? AND ?
         AND param_id = ?
         AND param_value > 0
     ) clean
     JOIN (
       SELECT AVG(CASE WHEN CAST(param_value AS DECIMAL(20,6)) <
                            (SELECT AVG(CAST(param_value AS DECIMAL(20,6)))
                             FROM \`${table}\`
                             WHERE measured_time BETWEEN ? AND ?
                               AND param_id = ? AND param_value > 0)
                       THEN CAST(param_value AS DECIMAL(20,6)) END) AS lower_avg
       FROM \`${table}\`
       WHERE measured_time BETWEEN ? AND ?
         AND param_id = ?
         AND param_value > 0
     ) baseline ON clean.v <= baseline.lower_avg * 100`,
    [from, to, param, from, to, param, from, to, param]
  ).then(rows => rows[0] ?? null);
}

// Returns btu_meter_energy_consump_00 AND btu_meter_actual_power_00 readings for the range.
// Returns all rows with param_id included — service splits them by param_id.
// energy_consump → used for per-bucket kWh_per_TRh denominator (cumulative TRH)
// actual_power   → used for per-bucket kW_per_TR (instantaneous TR, not cumulative)
function getBtuMeterEnergyTimeseries(from, to) {
  if (!cfg.btu_meter) return Promise.resolve([]);
  const table        = cfg.btu_meter.table;
  const energyParam  = cfg.btu_meter.params?.energy_consump;
  const powerParam   = cfg.btu_meter.params?.actual_power;
  const params       = [energyParam, powerParam].filter(Boolean);
  if (!table || !params.length) return Promise.resolve([]);

  const bucketSec = (cfg.time_bucket_minutes || 15) * 60;

  return query(
    `SELECT
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(measured_time) / ?) * ?) AS measured_time,
       param_id,
       CASE param_id
         WHEN ? THEN MAX(CAST(param_value AS DECIMAL(20,6)))
         ELSE        AVG(CAST(param_value AS DECIMAL(20,6)))
       END AS param_value
     FROM \`${table}\`
     WHERE measured_time BETWEEN ? AND ?
       AND param_id IN (?)
       AND (param_id != ? OR param_value > 0)
     GROUP BY FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(measured_time) / ?) * ?), param_id
     ORDER BY measured_time ASC`,
    [bucketSec, bucketSec, energyParam, from, to, params, energyParam, bucketSec, bucketSec]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AMBIENT — read from ambient table if configured
// ─────────────────────────────────────────────────────────────────────────────

function getAmbientData(from, to) {
  if (!cfg.ambient) return Promise.resolve([]);
  const table       = cfg.ambient.table;
  const paramValues = Object.values(cfg.ambient.params ?? {}).filter(Boolean);
  if (!paramValues.length) return Promise.resolve([]);

  const isRaw   = cfg.ambient.source === 'raw';
  const timeCol = isRaw ? 'created_at' : 'measured_time';
  const valCols = isRaw
    ? 'param_id, param_value'
    : 'metric_id AS param_id, metric_value AS param_value';

  return query(
    `SELECT ${timeCol} AS measured_time, ${valCols}
     FROM \`${table}\`
     WHERE ${timeCol} BETWEEN ? AND ?
       AND ${isRaw ? 'param_id' : 'metric_id'} IN (?)
     ORDER BY ${timeCol}`,
    [from, to, paramValues]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE INTERVAL SUMMARY
// Aggregates gl_device_timeseries into N-minute buckets (e.g. 5, 15, 60 min).
// SUM for energy/time metrics, AVG for rate metrics, MAX for peak.
// ─────────────────────────────────────────────────────────────────────────────
function getDeviceIntervalSummary(deviceKey, from, to, intervalMinutes = cfg.time_bucket_minutes || 15) {
  const intervalSec = intervalMinutes * 60;
  return query(
    `SELECT
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(bucket_time) / ?) * ?) AS bucket_time,
       metric_id,
       CASE metric_id
         WHEN 'kWh'       THEN SUM(metric_value)
         WHEN 'TRH'       THEN SUM(metric_value)
         WHEN 'run_hours' THEN SUM(metric_value)
         WHEN 'peak_kW'   THEN MAX(metric_value)
         ELSE                  AVG(metric_value)
       END AS metric_value
     FROM gl_device_timeseries
     WHERE device_key = ?
       AND bucket_time BETWEEN ? AND ?
     GROUP BY
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(bucket_time) / ?) * ?),
       metric_id
     ORDER BY bucket_time, metric_id`,
    [intervalSec, intervalSec, deviceKey, from, to, intervalSec, intervalSec]
  );
}

function getAllDevicesTimeseriesFlat(from, to, intervalMinutes = cfg.time_bucket_minutes || 15) {
  const intervalSec = intervalMinutes * 60;
  return query(
    `SELECT
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(bucket_time) / ?) * ?) AS bucket_time,
       device_key,
       metric_id,
       CASE metric_id
         WHEN 'kWh'       THEN SUM(metric_value)
         WHEN 'TRH'       THEN SUM(metric_value)
         WHEN 'run_hours' THEN SUM(metric_value)
         ELSE                  AVG(metric_value)
       END AS metric_value
     FROM gl_device_timeseries
     WHERE bucket_time BETWEEN ? AND ?
     GROUP BY FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(bucket_time) / ?) * ?), device_key, metric_id
     ORDER BY bucket_time`,
    [intervalSec, intervalSec, from, to, intervalSec, intervalSec]
  );
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Analytics EAV tables (new architecture — procedures write, APIs read)
  getDeviceTimeseries,
  getPlantTimeseries,
  getDeviceSummary,
  getPlantSummaryData,
  getAllDeviceSummary,

  // Supplemental raw sources (not in procedure scope)
  getBtuMeterData,
  getBtuMeterMinMax,
  getBtuMeterEnergyTimeseries,
  getAmbientData,

  // Re-exported from DeviceRegistry (backward compat for any module using model.deviceByKey etc.)
  cfg,
  allDevices,
  allLeafDevices,
  devicesByType,
  devicesByCalcType,
  deviceByKey,
  getDeviceIntervalSummary,
  getAllDevicesTimeseriesFlat
};
