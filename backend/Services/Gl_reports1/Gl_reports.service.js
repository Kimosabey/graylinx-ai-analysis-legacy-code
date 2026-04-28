'use strict';
/**
 * Gl_reports.service.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Thin orchestration layer. No runtime math, no UNION ALL queries.
 * Stored procedures have already aggregated everything into gl_* tables.
 *
 * Responsibilities:
 *   1. Call model to read EAV rows from gl_* tables
 *   2. Pivot EAV rows to wide-format objects (metric_id becomes column)
 *   3. Format timestamps (DATE / TIME fields)
 *   4. Build the summary response structure for getPlantSummary
 */

const { cfg, allLeafDevices } = require('./core/DeviceRegistry');
const model = require('./Gl_reports.model');

// ─────────────────────────────────────────────────────────────────────────────
// PIVOT EAV → WIDE
// Input:  [{ bucket_time|summary_date, metric_id, metric_value }, ...]
// Output: [{ bucket_time, metric_id_1: val, metric_id_2: val, ... }, ...]
// ─────────────────────────────────────────────────────────────────────────────

function pivotToWide(rows, timeField = 'bucket_time') {
  const map = new Map();
  for (const row of rows) {
    const rawT = row[timeField];
    if (rawT == null) continue;
    const t = rawT instanceof Date ? rawT.toISOString() : String(rawT);
    if (!map.has(t)) map.set(t, { [timeField]: t });
    if (row.metric_id != null && row.metric_value != null)
      map.get(t)[row.metric_id] = Number(row.metric_value);
  }
  return Array.from(map.values()).sort((a, b) =>
    a[timeField] < b[timeField] ? -1 : a[timeField] > b[timeField] ? 1 : 0
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMESTAMP FORMATTING
// ─────────────────────────────────────────────────────────────────────────────

function formatDateTime(isoStr) {
  const d = new Date(isoStr);
  if (isNaN(d)) return {};
  return {
    DATE: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    TIME: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  };
}

function addDateTimeFields(rows, timeField = 'bucket_time') {
  for (const row of rows) {
    if (row[timeField]) Object.assign(row, formatDateTime(row[timeField]));
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// SAFE NUMBER HELPER
// ─────────────────────────────────────────────────────────────────────────────

const safe = (v, fb = 0) => { const n = Number(v); return isFinite(n) ? n : fb; };
const round = (v, d = 4) => { const n = Number(v); return isFinite(n) ? Number(n.toFixed(d)) : null; };

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getChillerData
// Returns 5-min time series for a single chiller (or any TR_TRH_KWH device).
// All metrics come from gl_device_timeseries — no runtime calculations.
// ─────────────────────────────────────────────────────────────────────────────

async function getChillerData(from, to, chKey) {
  const dev = model.deviceByKey(chKey);
  if (!dev) throw new Error(`Device key '${chKey}' not found`);

  const rows = await model.getDeviceTimeseries(chKey, from, to);
  const series = pivotToWide(rows, 'bucket_time');
  addDateTimeFields(series, 'bucket_time');
  return series;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getPlantData
// Returns 5-min plant-level time series from gl_plant_timeseries.
// ─────────────────────────────────────────────────────────────────────────────

async function getPlantData(from, to) {
  const rows = await model.getPlantTimeseries(from, to);
  const series = pivotToWide(rows, 'bucket_time');
  addDateTimeFields(series, 'bucket_time');
  return series;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getBtuMeterData
// Returns BTU meter time series. Reads from raw table (not in procedure scope).
// ─────────────────────────────────────────────────────────────────────────────

async function getBtuMeterData(from, to) {
  if (!cfg.btu_meter) return [];
  const rows = await model.getBtuMeterData(from, to);
  // BTU meter raw table has (measured_time, param_id, param_value) — pivot similarly
  const pivoted = pivotToWide(
    rows.map(r => ({ bucket_time: r.measured_time, metric_id: r.param_id, metric_value: r.param_value })),
    'bucket_time'
  );
  addDateTimeFields(pivoted, 'bucket_time');
  return pivoted;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getPlantSummary
// Aggregated KPIs over the requested date range.
// Reads from gl_device_summary + gl_plant_summary (pre-rolled daily values).
// ─────────────────────────────────────────────────────────────────────────────

async function getPlantSummary(from, to) {
  const [deviceRows, plantRows, btuMinMax] = await Promise.all([
    model.getAllDeviceSummary(from, to),
    model.getPlantSummaryData(from, to),
    model.getBtuMeterMinMax(from, to)
  ]);

  // Build per-device metric map: { 'CH1': { kWh: 123, TRH: 45, run_hours: 10 }, ... }
  const deviceMap = {};
  for (const row of deviceRows) {
    if (!deviceMap[row.device_key]) deviceMap[row.device_key] = {};
    deviceMap[row.device_key][row.metric_id] = Number(row.metric_value);
  }

  // Build plant metric map: { kWh_plant: 123, TRH: 45, plant_SPC: 1.2, ... }
  // (sum across all days)
  const plantMap = {};
  for (const row of plantRows) {
    plantMap[row.metric_id] = (plantMap[row.metric_id] ?? 0) + Number(row.metric_value);
  }

  // Get all leaf devices from registry
  const leaves   = allLeafDevices();
  const chillers = leaves.filter(d => d.calc_type === 'TR_TRH_KWH');
  const kwhDevs  = leaves.filter(d => d.calc_type === 'KWH');

  // ── Chiller section ──────────────────────────────────────────────────────
  const resp = { from, to, CHILLERS: {} };
  let totalCHRun = 0, totalCHKwh = 0, totalCHTrh = 0;

  for (const ch of chillers) {
    const m = deviceMap[ch.key] ?? {};
    const rh  = safe(m.run_hours, 0);
    const kwh = safe(m.kWh,       0);
    const trh = safe(m.TRH,       0);
    totalCHRun  += rh;
    totalCHKwh  += kwh;
    totalCHTrh  += trh;
    resp.CHILLERS[ch.key] = {
      Run_Hours:  round(rh,  3),
      Actual_kWh: round(kwh, 5),
      Actual_TRH: round(trh, 5)
    };
  }

  resp.CHILLERS.TOTAL = {
    Run_Hours:  round(totalCHRun,  3),
    Actual_kWh: round(totalCHKwh,  5),
    Actual_TRH: round(totalCHTrh,  5)
  };

  // ── KWH device sections (grouped by type) ────────────────────────────────
  const typeGroups = {};
  for (const d of kwhDevs) {
    if (!typeGroups[d.type]) typeGroups[d.type] = [];
    typeGroups[d.type].push(d);
  }

  let totalKwhAllTypes = 0;

  for (const [type, devs] of Object.entries(typeGroups)) {
    resp[type] = {};
    let typeRun = 0, typeKwh = 0;
    for (const d of devs) {
      const m   = deviceMap[d.key] ?? {};
      const rh  = safe(m.run_hours, 0);
      const kwh = safe(m.kWh,       0);
      typeRun  += rh;
      typeKwh  += kwh;
      resp[type][d.key] = {
        Run_Hours:  round(rh,  3),
        Actual_kWh: round(kwh, 5)
      };
    }
    resp[type].TOTAL = { Run_Hours: round(typeRun, 3), Actual_kWh: round(typeKwh, 5) };
    totalKwhAllTypes += typeKwh;
  }

  // ── Plant totals ─────────────────────────────────────────────────────────
  const ACTUAL_TOTAL = round(totalCHKwh + totalKwhAllTypes, 5);
  const TOTAL_TRH    = round(totalCHTrh, 5);

  // BTU_TRH = MAX - MIN of btu_meter_energy_consump_00 over the range (BTU meter only, no fallback)
  const BTU_TRH = (btuMinMax && btuMinMax.max_val > 0 && btuMinMax.min_val >= 0)
    ? round(Number(btuMinMax.max_val) - Number(btuMinMax.min_val), 5)
    : null;

  // SPC and kWh_per_TRh use BTU_TRH only — null if BTU meter has no data
  const CH_SPC      = BTU_TRH > 0 ? round(totalCHKwh  / BTU_TRH, 5) : null;
  const PLANT_SPC   = BTU_TRH > 0 ? round(ACTUAL_TOTAL / BTU_TRH, 5) : null;
  const KWH_PER_TRH = BTU_TRH > 0 ? round(ACTUAL_TOTAL / BTU_TRH, 5) : null;

  resp.TOTAL_CHILLER_PLANT = { Actual_kWh: ACTUAL_TOTAL };
  resp.TOTAL_TRH           = { Actual_TRH: TOTAL_TRH, BTU_TRH };
  resp.CHILLER_SPC         = { Actual: CH_SPC };
  resp.PLANT_SPC           = { Actual: PLANT_SPC };
  resp.kWh_per_TRh         = KWH_PER_TRH;

  return resp;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getDeviceIntervalSummary
// Returns per-device metrics grouped into N-minute buckets.
// intervalMinutes: 5 | 15 | 30 | 60  (default 15)
// ─────────────────────────────────────────────────────────────────────────────
async function getDeviceIntervalSummary(from, to, deviceKey, intervalMinutes = cfg.time_bucket_minutes || 15) {
  const dev = model.deviceByKey(deviceKey);
  if (!dev) throw new Error(`Device key '${deviceKey}' not found`);

  const rows   = await model.getDeviceIntervalSummary(deviceKey, from, to, intervalMinutes);
  const series = pivotToWide(rows, 'bucket_time');
  addDateTimeFields(series, 'bucket_time');
  return series;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: getAllDevicesFlat
// Returns flat wide objects per time bucket.
// All device metrics prefixed: CH1_kW, CH1_TR, PV1_kWh, CP01_kWh, CT1_F1_kWh
// Plus computed plant totals matching legacy response shape.
//
// intervalMinutes: 5 | 15 | 30 | 60
// ─────────────────────────────────────────────────────────────────────────────
async function getAllDevicesFlat(from, to, intervalMinutes = cfg.time_bucket_minutes || 15) {
  const leaves   = model.allLeafDevices();
  const chillers  = leaves.filter(d => d.calc_type === 'TR_TRH_KWH');
  const pumps     = leaves.filter(d => d.type === 'PRIMARY_PUMP');
  const cdPumps   = leaves.filter(d => d.type === 'CONDENSER_PUMP');
  const secPumps  = leaves.filter(d => d.type === 'SECONDARY_PUMP');
  const fans      = leaves.filter(d => d.type === 'CT_FAN');

  const [deviceRows, plantRows, btuRows] = await Promise.all([
    model.getAllDevicesTimeseriesFlat(from, to, intervalMinutes),
    model.getPlantTimeseries(from, to),
    model.getBtuMeterEnergyTimeseries(from, to)
  ]);

  // ── Step 1: bucket → device_key → metric_id → value ─────────────────────
  const nested = new Map();

  for (const row of deviceRows) {
    const t = row.bucket_time instanceof Date
      ? row.bucket_time.toISOString()
      : String(row.bucket_time);
    if (!nested.has(t)) nested.set(t, new Map());
    const devMap = nested.get(t);
    if (!devMap.has(row.device_key)) devMap.set(row.device_key, {});
    devMap.get(row.device_key)[row.metric_id] = Number(row.metric_value);
  }

  // ── Step 2: plant timeseries keyed by bucket_time ────────────────────────
  const plantMap = new Map();
  for (const row of plantRows) {
    const t = row.bucket_time instanceof Date
      ? row.bucket_time.toISOString()
      : String(row.bucket_time);
    if (!plantMap.has(t)) plantMap.set(t, {});
    plantMap.get(t)[row.metric_id] = Number(row.metric_value);
  }

  // ── Step 3: build flat output ─────────────────────────────────────────────
  const result = [];

  for (const [t, devMap] of nested) {
    const flat = { measured_time: t };

    const g = (devKey, metric) => devMap.get(devKey)?.[metric] ?? 0;

    // ── Per-device prefixed fields (includes kWh_cumulative, TRH_cumulative automatically) ──
    for (const dev of leaves) {
      const m = devMap.get(dev.key) ?? {};
      for (const [metric, value] of Object.entries(m)) {
        flat[`${dev.key}_${metric}`] = round(value, 4);
      }
    }

    // ── Plant metrics from gl_plant_timeseries ──────────────────────────────
    const plant = plantMap.get(t) ?? {};
    for (const [metric, value] of Object.entries(plant)) {
      flat[`plant_${metric}`] = round(value, 4);
    }

    // ── Computed plant totals ─────────────────────────────────────────────
    const totalChillerKW  = chillers.reduce((s, d) => s + g(d.key, 'kW'),  0);
    const totalChillerTR  = chillers.reduce((s, d) => s + g(d.key, 'TR'),  0);
    const totalChillerKWh = chillers.reduce((s, d) => s + g(d.key, 'kWh'), 0);
    const totalChillerTRH = chillers.reduce((s, d) => s + g(d.key, 'TRH'), 0);

    const totalPumpKW     = pumps.reduce((s, d)   => s + g(d.key, 'kW'),  0);
    const totalPumpKWh    = pumps.reduce((s, d)   => s + g(d.key, 'kWh'), 0);
    const totalCdPumpKW   = cdPumps.reduce((s, d) => s + g(d.key, 'kW'),  0);
    const totalCdPumpKWh  = cdPumps.reduce((s, d) => s + g(d.key, 'kWh'), 0);
    const totalFanKW      = fans.reduce((s, d)    => s + g(d.key, 'kW'),  0);
    const totalFanKWh     = fans.reduce((s, d)    => s + g(d.key, 'kWh'), 0);

    const totalAuxKW      = totalPumpKW + totalCdPumpKW + totalFanKW;
    const totalPlantKW    = totalChillerKW + totalAuxKW;

    const chillersOn      = chillers.filter(d => g(d.key, 'run_hours') > 0).length;

    // ── Cumulative totals ─────────────────────────────────────────────────
    const totalChillerKWhCum  = chillers.reduce((s, d)  => s + g(d.key, 'kWh_cumulative'), 0);
    const totalChillerTRHCum  = chillers.reduce((s, d)  => s + g(d.key, 'TRH_cumulative'), 0);
    const totalPumpKWhCum     = pumps.reduce((s, d)     => s + g(d.key, 'kWh_cumulative'), 0);
    const totalCdPumpKWhCum   = cdPumps.reduce((s, d)   => s + g(d.key, 'kWh_cumulative'), 0);
    const totalSecPumpKWhCum  = secPumps.reduce((s, d)  => s + g(d.key, 'kWh_cumulative'), 0);
    const totalFanKWhCum      = fans.reduce((s, d)      => s + g(d.key, 'kWh_cumulative'), 0);

    // ── Assign all fields ─────────────────────────────────────────────────
    flat.Total_Chiller_kW       = round(totalChillerKW,  4);
    flat.Total_Chiller_TR       = round(totalChillerTR,  4);
    flat.Total_Chiller_kWh      = round(totalChillerKWh, 4);
    flat.Total_Chiller_TRH      = round(totalChillerTRH, 4);
    flat.Chiller_SPC            = null; // overwritten after loop using BTU actual_power

    flat.Total_Primary_Pump_kW  = round(totalPumpKW,    4);
    flat.Total_Primary_Pump_kWh = round(totalPumpKWh,   4);
    flat.Total_Condenser_kW     = round(totalCdPumpKW,  4);
    flat.Total_Condenser_kWh    = round(totalCdPumpKWh, 4);
    flat.Total_CT_Fan_kW        = round(totalFanKW,     4);
    flat.Total_CT_Fan_kWh       = round(totalFanKWh,    4);

    flat.Total_Aux_kW           = round(totalAuxKW,   4);
    flat.Total_Plant_kW         = round(totalPlantKW, 4);
    flat.Plant_SPC              = null; // overwritten after loop using BTU actual_power
    flat.kW_per_TR              = null; // overwritten after loop using BTU actual_power

    flat.Chillers_In_Operation  = chillersOn;

    // ── Cumulative fields ─────────────────────────────────────────────────
    flat.Total_Chiller_kWh_cumulative        = round(totalChillerKWhCum,  4);
    flat.Total_Chiller_TRH_cumulative        = round(totalChillerTRHCum,  4);
    flat.Total_Primary_Pump_kWh_cumulative   = round(totalPumpKWhCum,     4);
    flat.Total_Condenser_kWh_cumulative      = round(totalCdPumpKWhCum,   4);
    flat.Total_Secondary_Pump_kWh_cumulative = round(totalSecPumpKWhCum,  4);
    flat.Total_CT_Fan_kWh_cumulative         = round(totalFanKWhCum,      4);
    flat.Total_Plant_kWh_cumulative          = round(
      totalChillerKWhCum + totalPumpKWhCum + totalCdPumpKWhCum + totalSecPumpKWhCum + totalFanKWhCum, 4
    );

    // ── Timestamp fields ──────────────────────────────────────────────────
    Object.assign(flat, formatDateTime(t));

    result.push(flat);
  }

  result.sort((a, b) => a.measured_time < b.measured_time ? -1 : 1);

  // ── BTU meter lookup helpers ──────────────────────────────────────────────
  // btuRows contains both param_ids: energy_consump (for kWh_per_TRh) and actual_power (for kW_per_TR)
  const energyParam = cfg?.btu_meter?.params?.energy_consump;
  const powerParam  = cfg?.btu_meter?.params?.actual_power;

  const makeSorted = paramId => btuRows
    .filter(r => r.param_id === paramId)
    .map(r => ({ tMs: new Date(r.measured_time).getTime(), value: Number(r.param_value) }))
    .sort((a, b) => a.tMs - b.tMs);

  const btuEnergySorted = energyParam ? makeSorted(energyParam) : [];
  const btuPowerSorted  = powerParam  ? makeSorted(powerParam)  : [];

  const MAX_BTU_GAP_MS = (cfg.time_bucket_minutes || 15) * 60 * 1000 * 2; // 2 buckets tolerance

  function nearestVal(sorted, tMs) {
    if (!sorted.length) return null;
    let lo = 0, hi = sorted.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sorted[mid].tMs < tMs) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0 && Math.abs(sorted[lo - 1].tMs - tMs) < Math.abs(sorted[lo].tMs - tMs)) lo--;
    // Return null if nearest BTU reading is too far from this bucket
    if (Math.abs(sorted[lo].tMs - tMs) > MAX_BTU_GAP_MS) return null;
    return sorted[lo].value;
  }

  // kWh_per_TRh — correct delta_kWh = SUM of (MAX - MIN of kWh_cumulative) per device
  // Using per-device deltas avoids corruption from absolute meter readings (PRIMARY_PUMP, CT_FAN)
  // that inflate the Total_Plant_kWh_cumulative sum.
  const devKWhCumTrack = {};
  for (const row of deviceRows) {
    if (row.metric_id !== 'kWh_cumulative') continue;
    const val = Number(row.metric_value);
    if (!devKWhCumTrack[row.device_key]) {
      devKWhCumTrack[row.device_key] = { max: val, min: val };
    } else {
      if (val > devKWhCumTrack[row.device_key].max) devKWhCumTrack[row.device_key].max = val;
      if (val < devKWhCumTrack[row.device_key].min) devKWhCumTrack[row.device_key].min = val;
    }
  }
  const deltaPlantKWh = Object.values(devKWhCumTrack)
    .reduce((s, { max, min }) => s + Math.max(0, max - min), 0);

  const btuEnergyVals = btuEnergySorted.map(r => r.value);
  const deltaBtuTRH   = btuEnergyVals.length
    ? Math.max(...btuEnergyVals) - Math.min(...btuEnergyVals)
    : 0;

  const kWhPerTRh = (deltaPlantKWh > 0 && deltaBtuTRH > 0)
    ? round(deltaPlantKWh / deltaBtuTRH, 5)
    : null;

  for (const row of result) {
    const tMs = new Date(row.measured_time).getTime();

    // btuTR used for all per-row SPC fields
    const btuTR = nearestVal(btuPowerSorted, tMs);

    row.kWh_per_TRh = kWhPerTRh;

    // kW_per_TR, Chiller_SPC, Plant_SPC — all use BTU actual_power as TR (instantaneous)
    row.BTU_TR      = btuTR !== null ? round(btuTR, 4) : null;
    row.kW_per_TR   = btuTR === null ? null
                    : (row.Chillers_In_Operation === 0 || btuTR === 0) ? 0
                    : round(row.Total_Plant_kW / btuTR, 5);
    row.Chiller_SPC = btuTR === null ? null : btuTR > 0 ? round(row.Total_Chiller_kW / btuTR, 5) : 0;
    row.Plant_SPC   = btuTR === null ? null : btuTR > 0 ? round(row.Total_Plant_kW   / btuTR, 5) : 0;
  }

  return { data: result };
}
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  getChillerData,
  getPlantData,
  getBtuMeterData,
  getPlantSummary,
  getDeviceIntervalSummary,
  getAllDevicesFlat
};
