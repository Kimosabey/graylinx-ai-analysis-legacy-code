'use strict';

/**
 * Analytics_reports.service.js
 */

const model  = require('./Analytics_reports.model');
const config = require('./Analytics_reports.config');

const round = (v, d = 4) => {
  const n = Number(v);
  return isFinite(n) ? Number(n.toFixed(d)) : null;
};

function formatDateTime(dateVal) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d)) return {};
  return {
    DATE: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    TIME: d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

function formatRow(row) {
  const formatted = { slot_time: row.slot_time };
  Object.assign(formatted, formatDateTime(row.slot_time));
  for (const [key, val] of Object.entries(row)) {
    if (key === 'slot_time' || key === 'id' || key === 'created_at') continue;
    formatted[key] = typeof val === 'number' ? round(val, 4) : val;
  }
  return formatted;
}

// ── SPC calculation with 3 conditions ────────────────────────────────────────
//
// Condition 1: kw = 0 AND tr = 0  → 0           (idle, both zero — normal OFF)
// Condition 2: kw = 0 AND tr > 0  → 0 + warning  (logic error — cooling without power)
// Condition 3: kw > 0 AND tr = 0  → two sub-cases:
//                kw < threshold   → 0             (too small, noise/startup)
//                kw >= threshold  → kw            (real power, no TR yet → kw/1)
// Normal case:  kw > 0 AND tr > 0  → kw / tr
//
// Applies to both instantaneous (kW/TR) and cumulative (kWh/TRh).
// threshold comes from site_config.json → site.spc_min_kw_threshold
//
function computeSPC(kw, tr, threshold, label = '') {
  const kwVal = Number(kw) || 0;
  const trVal = Number(tr) || 0;

  // Condition 1 — both zero
  if (kwVal === 0 && trVal === 0) return 0;

  // Condition 2 — cooling without power (logic error)
  if (kwVal === 0 && trVal > 0) {
    console.warn(`[Analytics SPC] ${label} — kW=0 but TR=${trVal} > 0. Possible logic error, storing 0.`);
    return 0;
  }

  // Condition 3 — power but no TR
  if (kwVal > 0 && trVal === 0) {
    if (kwVal < threshold) return 0;
    return round(kwVal, 4); // kw / 1 TR assumed
  }

  // Normal — both non-zero
  return round(kwVal / trVal, 4);
}

async function getDeviceData(from, to, instance, intervalMinutes) {
  const device = config.getDeviceByInstance(instance);
  if (!device) throw new Error(`Device instance '${instance}' not found in config`);

  const sitInterval = config.getSiteInterval();
  const interval    = intervalMinutes || sitInterval;

  let rows;
  if (interval <= sitInterval) {
    rows = await model.getDeviceTimeseries(device.normalized_table, from, to);
  } else {
    rows = await model.getDeviceTimeseriesBucketed(device.normalized_table, from, to, interval);
  }

  return rows.map(formatRow);
}

function toLocalIso(dateVal) {
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(d)) return String(dateVal);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function getPlantData(from, to) {
  const devices   = config.getDevices();
  const siteConf  = config.getSiteConfig();
  const threshold = siteConf.site.spc_min_kw_threshold ?? 50;

  const [plantRows, ...deviceResults] = await Promise.all([
    model.getPlantTimeseries(from, to),
    ...devices.map(d => model.getDeviceTimeseries(d.normalized_table, from, to)),
  ]);

  const CHILLER_DISPLAY = new Set(['kw', 'tr', 'kw_per_tr']);
  const SKIP_KEYS       = new Set(['slot_time', 'id', 'created_at', 'ss_id']);

  const toKey   = v => v instanceof Date ? v.toISOString() : String(v);
  const addSlot = (map, st) => { const k = toKey(st); if (!map.has(k)) map.set(k, st); };

  // ── Pass 1: collect all unique slot_times ─────────────────────────────────
  const slotMeta = new Map();
  plantRows.forEach(r => addSlot(slotMeta, r.slot_time));
  deviceResults.forEach(rows => rows.forEach(r => addSlot(slotMeta, r.slot_time)));

  // ── Pass 2: build plant map ───────────────────────────────────────────────
  const plantMap    = new Map();
  const plantFields = new Set();
  for (const row of plantRows) {
    const data = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === 'slot_time' || k === 'id' || k === 'created_at') continue;
      plantFields.add(k);
      data[k] = typeof v === 'number' ? round(v, 4) : v;
    }
    plantMap.set(toKey(row.slot_time), data);
  }

  // ── Pass 3: build device maps ─────────────────────────────────────────────
  const displayMaps   = [];
  const displayFields = [];
  const internalMaps  = [];

  devices.forEach((d, i) => {
    const isChiller = d.device_type === 'chiller';
    const dm = new Map();
    const im = new Map();
    const df = new Set();

    for (const row of deviceResults[i]) {
      const k = toKey(row.slot_time);
      const dData = {};
      const iData = {};
      for (const [fk, v] of Object.entries(row)) {
        if (SKIP_KEYS.has(fk)) continue;
        const val = typeof v === 'number' ? round(v, 4) : v;
        iData[fk] = val;
        if (!isChiller || CHILLER_DISPLAY.has(fk)) {
          df.add(fk);
          dData[fk] = val;
        }
      }
      dm.set(k, dData);
      im.set(k, iData);
    }
    displayMaps.push(dm);
    displayFields.push(df);
    internalMaps.push(im);
  });

  // ── Pre-compute device type index groups ──────────────────────────────────
  const typeIndexMap = {};
  devices.forEach((d, i) => {
    const t = d.device_type;
    if (!typeIndexMap[t]) typeIndexMap[t] = [];
    typeIndexMap[t].push(i);
  });

  const typeLabel = t => t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');

  // ── Pass 4: build flat output ─────────────────────────────────────────────
  const sorted = [...slotMeta.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));

  return sorted.map(([k, slotTime]) => {
    const row = { slot_time: toLocalIso(slotTime) };
    Object.assign(row, formatDateTime(slotTime));

    // Plant-level fields (prefixed)
    const pd = plantMap.get(k) ?? {};
    for (const field of plantFields) {
      row[`plant_${field}`] = pd[field] ?? null;
    }

    // Per-device display fields
    devices.forEach((d, i) => {
      const prefix = d.instance.trim();
      const dd     = displayMaps[i].get(k) ?? {};
      for (const field of displayFields[i]) {
        row[`${prefix}_${field}`] = dd[field] ?? null;
      }
    });

    // ── Computed totals per slot ──────────────────────────────────────────
    const get = (i, field) => {
      const val = internalMaps[i].get(k)?.[field];
      return (val !== null && val !== undefined && isFinite(val)) ? Number(val) : 0;
    };

    // Device-type totals — kW, kWh, cumulative_kWh per type
    for (const [type, idxList] of Object.entries(typeIndexMap)) {
      const label = typeLabel(type);
      row[`Total_${label}_kW`]             = round(idxList.reduce((s, i) => s + get(i, 'kw'),             0), 4);
      row[`Total_${label}_kWh`]            = round(idxList.reduce((s, i) => s + get(i, 'kwh'),            0), 4);
      row[`Total_${label}_cumulative_kWh`] = round(idxList.reduce((s, i) => s + get(i, 'cumulative_kwh'), 0), 4);
    }

    // Plant-level totals from plant_normalized
    const plantKW  = pd['total_kw']  ?? null;
    const plantKWh = pd['total_kwh'] ?? null;
    const plantTR  = pd['total_tr']  ?? null;
    const plantTRh = pd['total_trh'] != null ? Number(pd['total_trh']) : null;

    row.Total_Plant_kW  = plantKW  !== null ? round(plantKW,  4) : null;
    row.Total_Plant_kWh = plantKWh !== null ? round(plantKWh, 4) : null;
    row.Total_Plant_TR  = plantTR  !== null ? round(plantTR,  4) : null;

    // ── SPC calculations with 3 conditions ───────────────────────────────
    const slotLabel = `slot ${toLocalIso(slotTime)}`;
    row.kW_per_TR   = computeSPC(plantKW,  plantTR,  threshold, `kW_per_TR  ${slotLabel}`);
    row.kwh_per_trh = computeSPC(plantKWh, plantTRh, threshold, `kwh_per_trh ${slotLabel}`);

    row.Total_Plant_cumulative_kWh = round(
      Object.values(typeIndexMap).flat().reduce((s, i) => s + get(i, 'cumulative_kwh'), 0),
      4
    );

    // Wet bulb temp from plant_normalized
    const wbt = pd['wet_bulb_temp'];
    row.wet_bulb_temp = (wbt !== null && wbt !== undefined) ? round(wbt, 4) : null;

    return row;
  });
}

async function getSummary(from, to) {
  const devices         = config.getDevices();
  const intervalMinutes = config.getSiteInterval();
  const siteConf        = config.getSiteConfig();
  const threshold       = siteConf.site.spc_min_kw_threshold ?? 50;

  const [plantRow, ...deviceRows] = await Promise.all([
    model.getPlantSummary(from, to).then(r => r[0] ?? {}),
    ...devices.map(d => model.getDeviceSummary(d.normalized_table, from, to, d.device_type, intervalMinutes).then(r => r[0] ?? {})),
  ]);

  const safe = v => { const n = Number(v); return isFinite(n) ? n : 0; };

  const typeGroups = {};
  devices.forEach((d, i) => {
    const type = d.device_type;
    if (!typeGroups[type]) typeGroups[type] = [];
    typeGroups[type].push({ device: d, row: deviceRows[i] });
  });

  const resp = { from, to };

  let totalChillerKwh = 0;
  let totalPlantKwh   = 0;

  for (const [type, entries] of Object.entries(typeGroups)) {
    const sectionKey = type.toUpperCase();
    resp[sectionKey] = {};

    let typeKwh = 0;
    let typeTrh = 0;
    let typeRh  = 0;

    for (const { device, row } of entries) {
      const kwh = safe(row.total_kwh);
      const trh = safe(row.total_trh);
      const rh  = safe(row.run_hours);
      typeKwh += kwh;
      typeTrh += trh;
      typeRh  += rh;

      const entry = {
        Run_Hours:  round(rh,  3),
        Actual_kWh: round(kwh, 5),
      };
      if (type === 'chiller') entry.Actual_TRH = round(trh, 5);

      resp[sectionKey][device.instance.trim()] = entry;
    }

    const total = {
      Run_Hours:  round(typeRh,  3),
      Actual_kWh: round(typeKwh, 5),
    };
    if (type === 'chiller') {
      total.Actual_TRH = round(typeTrh, 5);
      totalChillerKwh  = typeKwh;
    }
    resp[sectionKey].TOTAL = total;

    totalPlantKwh += typeKwh;
  }

  const plantKwh = safe(plantRow.total_kwh);
  const finalTrh = safe(plantRow.total_trh);
  const finalKwh = plantKwh > 0 ? plantKwh : totalPlantKwh;

  // ── SPC calculations with 3 conditions ───────────────────────────────────
  const chillerSpc = computeSPC(totalChillerKwh, finalTrh, threshold, 'CHILLER_SPC summary');
  const plantSpc   = computeSPC(finalKwh,        finalTrh, threshold, 'PLANT_SPC summary');

  resp.TOTAL_CHILLER_PLANT = { Actual_kWh: round(finalKwh,        5) };
  resp.TOTAL_TRH           = { Actual_TRH: round(finalTrh,        5) };
  resp.CHILLER_SPC         = { Actual:     chillerSpc               };
  resp.PLANT_SPC           = { Actual:     plantSpc                 };

  return resp;
}

function getConfig() {
  const siteConfig = config.getSiteConfig();
  return {
    site_id:           siteConfig.site.site_id,
    site_name:         siteConfig.site.site_name,
    interval_minutes:  siteConfig.site.interval_minutes,
    has_plant:         !!siteConfig.plant,
    devices: siteConfig.devices.map(d => ({
      instance:         d.instance,
      device_type:      d.device_type,
      ss_id:            d.ss_id,
      normalized_table: d.normalized_table,
      chiller_type:     d.chiller_type ?? null,
    })),
  };
}

async function getBtuMeterData(from, to) {
  const siteConfig = config.getSiteConfig();
  const btuConfig  = siteConfig.btu_meter;
  if (!btuConfig) return [];

  const rows = await model.getBtuMeterData(from, to, btuConfig, siteConfig.site.interval_minutes);
  if (!rows.length) return [];

  const paramIdToKey = Object.fromEntries(
    Object.entries(btuConfig.params ?? {}).map(([key, paramId]) => [paramId, key])
  );

  const map = new Map();
  for (const row of rows) {
    const t = row.measured_time instanceof Date
      ? row.measured_time.toISOString()
      : String(row.measured_time);
    if (!map.has(t)) map.set(t, { measured_time: row.measured_time });
    const key = paramIdToKey[row.param_id] ?? row.param_id;
    map.get(t)[key] = round(Number(row.param_value), 4);
  }

  const sorted = Array.from(map.values())
    .sort((a, b) => {
      const ka = a.measured_time instanceof Date ? a.measured_time.toISOString() : String(a.measured_time);
      const kb = b.measured_time instanceof Date ? b.measured_time.toISOString() : String(b.measured_time);
      return ka < kb ? -1 : 1;
    });

  const fillFields = Object.keys(btuConfig.params ?? {}).filter(
    k => !['actual_flow', 'actual_power'].includes(k)
  );
  const carry = {};
  for (const row of sorted) {
    for (const field of fillFields) {
      if (row[field] !== undefined) carry[field] = row[field];
      else if (carry[field] !== undefined) row[field] = carry[field];
    }
  }

  return sorted.map(row => {
    const out = { measured_time: toLocalIso(row.measured_time) };
    Object.assign(out, formatDateTime(row.measured_time));
    for (const [k, v] of Object.entries(row)) {
      if (k !== 'measured_time') out[k] = v;
    }
    return out;
  });
}

module.exports = {
  getDeviceData,
  getPlantData,
  getSummary,
  getConfig,
  getBtuMeterData,
};