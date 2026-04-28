'use strict';

/**
 * Analytics_reports.model.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure data-access layer. Reads from pre-computed normalized tables.
 * One row per slot per device — wide format (not EAV).
 *
 * Normalized tables (written by Energy_analytics cron):
 *   chiller_1_normalized, chiller_2_normalized  — per chiller metrics
 *   condenser_pump_1_normalized                 — per pump metrics
 *   cooling_tower_1_normalized                  — per cooling tower metrics
 *   plant_normalized                            — plant-level aggregated metrics
 */

const { get_mysql_pool } = require('../../control_module/controls/db');

// ─────────────────────────────────────────────────────────────────────────────
// DB HELPER — uses mysql2/promise pool
// ─────────────────────────────────────────────────────────────────────────────

function query(sql, params = []) {
  return get_mysql_pool().query(sql, params).then(([rows]) => rows);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE TIME-SERIES
// Reads all columns from a device normalized table for a time range.
// Returns wide-format rows — each column is a metric.
// ─────────────────────────────────────────────────────────────────────────────

function getDeviceTimeseries(normalizedTable, from, to) {
  return query(
    `SELECT *
     FROM \`${normalizedTable}\`
     WHERE slot_time BETWEEN ? AND ?
     ORDER BY slot_time ASC`,
    [from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE TIME-SERIES WITH INTERVAL BUCKETING
// Re-buckets 5-min rows into larger intervals (15, 30, 60 min).
// AVG for rate metrics (kw, tr), SUM for energy metrics (kwh, trh),
// MAX for cumulatives, MIN(is_running) to detect any OFF in bucket.
// ─────────────────────────────────────────────────────────────────────────────

function getDeviceTimeseriesBucketed(normalizedTable, from, to, intervalMinutes = 5) {
  const intervalSec = intervalMinutes * 60;
  return query(
    `SELECT
       FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(slot_time) / ?) * ?) AS slot_time,
       MIN(is_running) AS is_running,
       AVG(kw)              AS kw,
       SUM(kwh)             AS kwh,
       MAX(cumulative_kwh)  AS cumulative_kwh,
       AVG(tr)              AS tr,
       SUM(trh)             AS trh,
       MAX(cumulative_trh)  AS cumulative_trh,
       ss_id
     FROM \`${normalizedTable}\`
     WHERE slot_time BETWEEN ? AND ?
     GROUP BY FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(slot_time) / ?) * ?), ss_id
     ORDER BY slot_time ASC`,
    [intervalSec, intervalSec, from, to, intervalSec, intervalSec]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANT TIME-SERIES
// ─────────────────────────────────────────────────────────────────────────────

function getPlantTimeseries(from, to) {
  return query(
    `SELECT *
     FROM plant_normalized
     WHERE slot_time BETWEEN ? AND ?
     ORDER BY slot_time ASC`,
    [from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE SUMMARY — aggregated over date range
//
// CHANGED: SUM(kwh) replaces MAX(cumulative_kwh) - MIN(cumulative_kwh)
//
// Why: cumulative_kwh can oscillate slightly when the energy meter sends
// alternating 0/real values at high frequency. The weighted average for
// some slots comes out marginally lower than the previous slot, causing
// cumulative to drift backwards. MAX - MIN then under-reports total energy
// because it picks the peak cumulative, missing all consumption after the
// peak when cumulative was declining.
//
// SUM(kwh) adds each slot's actual consumption directly — immune to any
// cumulative oscillation, always gives the correct total.
//
// Same fix applied to TRH for chillers.
// ─────────────────────────────────────────────────────────────────────────────

function getDeviceSummary(normalizedTable, from, to, deviceType = 'other', intervalMinutes = 5) {
  const isChiller = deviceType === 'chiller';
  const trhCol    = isChiller ? 'GREATEST(0, SUM(trh))' : '0';

  return query(
    `SELECT
       GREATEST(0, SUM(kwh))  AS total_kwh,
       ${trhCol}              AS total_trh,
       SUM(CASE WHEN is_running > 0 THEN 1 ELSE 0 END) * ${intervalMinutes} / 60.0 AS run_hours
     FROM \`${normalizedTable}\`
     WHERE slot_time BETWEEN ? AND ?`,
    [from, to]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLANT SUMMARY — aggregated over date range
//
// CHANGED: SUM(total_kwh) and SUM(total_trh) replace MAX-MIN cumulative
// Same reasoning as device summary above.
// ─────────────────────────────────────────────────────────────────────────────

function getPlantSummary(from, to) {
  return query(
    `SELECT
       GREATEST(0, SUM(total_kwh))  AS total_kwh,
       GREATEST(0, SUM(total_trh))  AS total_trh,
       MAX(total_kw)                AS peak_kw,
       MAX(aux_kw)                  AS peak_aux_kw
     FROM plant_normalized
     WHERE slot_time BETWEEN ? AND ?`,
    [from, to]
  );
}

function getBtuMeterData(from, to, btuConfig, intervalMinutes = 5) {
  if (!btuConfig) return Promise.resolve([]);
  const table       = btuConfig.table;
  const paramValues = Object.values(btuConfig.params ?? {}).filter(Boolean);
  if (!table || !paramValues.length) return Promise.resolve([]);
  const bucketSec = intervalMinutes * 60;

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

module.exports = {
  getDeviceTimeseries,
  getDeviceTimeseriesBucketed,
  getPlantTimeseries,
  getDeviceSummary,
  getPlantSummary,
  getBtuMeterData
};