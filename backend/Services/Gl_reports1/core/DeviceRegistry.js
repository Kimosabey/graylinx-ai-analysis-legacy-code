'use strict';
/**
 * DeviceRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Responsibility: load analytic_report_config.json, merge device_types
 * into each device, expand CT fans, substitute {{N}} placeholders, and expose
 * a fully resolved config + device lookup helpers.
 *
 * Nothing else lives here — no DB, no maths, no SQL.
 *
 * Config structure (new):
 *   device_types.{TYPE}  — full param config for a device type (defined once)
 *   devices[]            — each device: key + type + table + optional overrides
 *   CT fans              — CT device has a "fans" array; DeviceRegistry expands
 *                          them into child_devices using the CT_FAN type template
 *                          with {{N}} replaced by fan_index.
 *
 * Exports:
 *   cfg              — fully resolved config (drop-in for raw JSON require)
 *   allDevices()     — top-level device array (parents + standalone)
 *   allLeafDevices() — flattened leaf devices (fans expanded, tables inherited)
 *   deviceByKey(key)
 *   devicesByType(type)
 *   devicesByCalcType(calcType)
 */

const rawCfg = require('../analytic_report_config.json');

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER SUBSTITUTION  {{N}} → fan_index value
// ─────────────────────────────────────────────────────────────────────────────

function substituteN(obj, n) {
  if (typeof obj === 'string') return obj.replace(/\{\{N\}\}/g, String(n));
  if (Array.isArray(obj))      return obj.map(item => substituteN(item, n));
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const [k, v] of Object.entries(obj)) result[k] = substituteN(v, n);
    return result;
  }
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
// MERGE DEVICE TYPE INTO DEVICE
// Device fields always win. Shallow merge — device field entirely replaces
// the type field for nested objects (keeps behaviour predictable).
// ─────────────────────────────────────────────────────────────────────────────

function mergeWithType(rawDevice, deviceTypes) {
  // Skip comment/group marker objects (no "key" field)
  if (!rawDevice.key) return null;

  const type = rawDevice.type;
  const typeCfg = deviceTypes[type] ?? {};

  // Start with type defaults, overlay every explicit device field
  const merged = { ...typeCfg };
  for (const [k, v] of Object.entries(rawDevice)) {
    if (k.startsWith('_')) continue;        // skip _comment_* and _type_group
    if (v !== undefined) merged[k] = v;
  }

  // energy_meter_table → set as kw.raw_table (CONDENSER_PUMP pattern)
  if (merged.energy_meter_table && merged.kw) {
    merged.kw = { ...merged.kw, raw_table: merged.energy_meter_table };
    delete merged.energy_meter_table;
  }

  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPAND CT FANS
// A COOLING_TOWER device has a "fans" array: [{key, fan_index}, ...]
// Each fan gets the CT_FAN type template with {{N}} replaced by fan_index,
// and inherits the parent's table if not overridden.
// ─────────────────────────────────────────────────────────────────────────────

function expandFans(parent, deviceTypes) {
  if (!parent.fans?.length) return parent;

  const fanTypeName = parent.fan_type ?? 'CT_FAN';
  const fanTypeCfg  = deviceTypes[fanTypeName];
  if (!fanTypeCfg) throw new Error(
    `[DeviceRegistry] Fan type '${fanTypeName}' not found in device_types (used by '${parent.key}')`
  );

  const child_devices = parent.fans.map(fan => {
    const { key, fan_index, energy_meter_table, ...fanOverrides } = fan;
    // Apply {{N}} substitution to the fan type template
    const substituted = substituteN(fanTypeCfg, fan_index);
    const resolved = {
      ...substituted,
      ...fanOverrides,
      key,
      fan_index,
      type:         fanTypeName,
      raw_table:    fanOverrides.raw_table    ?? parent.table ?? parent.raw_table,
      metric_table: fanOverrides.metric_table ?? parent.metric_table
    };
    // Map energy_meter_table → kw.raw_table (same pattern as mergeWithType for direct devices)
    if (energy_meter_table && resolved.kw) {
      resolved.kw = { ...resolved.kw, raw_table: energy_meter_table };
    }
    return resolved;
  });

  // Remove fans array from parent (replaced by child_devices)
  const { fans: _drop, ...rest } = parent;
  return { ...rest, child_devices };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD FULLY RESOLVED CONFIG
// ─────────────────────────────────────────────────────────────────────────────

function buildResolvedCfg(raw) {
  const deviceTypes = raw.device_types ?? {};

  // Support both config shapes:
  //   NEW: devices[] = [{type, count, instances:[{key,table,...}]}, ...]
  //   OLD: devices[] = [{key, type, table, ...}, ...]   (flat, kept for backward compat)
  const flatDevices = [];
  for (const entry of (raw.devices ?? [])) {
    if (entry.instances) {
      // New grouped shape — validate count vs actual instances
      const actual = entry.instances.length;
      if (entry.count !== undefined && entry.count !== actual) {
        console.warn(
          `[DeviceRegistry] Warning: type '${entry.type}' has count=${entry.count} but ${actual} instance(s). Using ${actual}.`
        );
      }
      for (const inst of entry.instances) {
        // Inject the group's type into each instance
        flatDevices.push({ type: entry.type, ...inst });
      }
    } else if (entry.key) {
      // Old flat shape (or a marker object without key — skip via mergeWithType)
      flatDevices.push(entry);
    }
    // Objects with only _comment / _type_group keys are silently dropped
  }

  const devices = flatDevices
    .map(dev => mergeWithType(dev, deviceTypes))
    .filter(Boolean)
    .map(dev => {
      if (dev.table && !dev.raw_table) dev.raw_table = dev.table;
      return expandFans(dev, deviceTypes);
    });

  const { device_types: _drop, ...rest } = raw;
  return { ...rest, devices };
}

// ─────────────────────────────────────────────────────────────────────────────
// SINGLETON — resolved once on first require()
// ─────────────────────────────────────────────────────────────────────────────

const cfg = buildResolvedCfg(rawCfg);

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE LOOKUP HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Top-level device list (COOLING_TOWER includes child_devices, not expanded). */
function allDevices() {
  return cfg.devices;
}

/**
 * Flattened leaf devices — child_devices expanded, tables inherited from parent.
 * CONTAINER-type parents (COOLING_TOWER) are excluded; their children are included.
 * This is the canonical list used for queries, procedure generation, and calculations.
 */
function allLeafDevices() {
  const out = [];
  for (const dev of cfg.devices) {
    if (dev.child_devices?.length) {
      for (const child of dev.child_devices) {
        out.push({
          ...child,
          raw_table:    child.raw_table    ?? dev.raw_table,
          metric_table: child.metric_table ?? dev.metric_table
        });
      }
    } else if (dev.calc_type !== 'CONTAINER') {
      out.push(dev);
    }
  }
  return out;
}

const devicesByType     = type      => allLeafDevices().filter(d => d.type      === type);
const devicesByCalcType = calcType  => allLeafDevices().filter(d => d.calc_type === calcType);
const deviceByKey       = key       => allLeafDevices().find( d => d.key        === key);

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  cfg,
  allDevices,
  allLeafDevices,
  devicesByType,
  devicesByCalcType,
  deviceByKey
};
