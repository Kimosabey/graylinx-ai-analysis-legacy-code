'use strict';
/**
 * pointReader.js
 *
 * Reads all data_sources from calc_config.json for a given time window.
 * Groups sources by table so each table is hit only ONCE per run.
 *
 * Returns a flat value map:  { sourceName: numericValue | null }
 */

const { pool } = require('../../Database/pool');
const cfg      = require('./calc_config.json');

// ─── DB HELPER ───────────────────────────────────────────────────────────────

function query(sql, params = []) {
  return new Promise((resolve, reject) =>
    pool.getConnection((err, conn) => {
      if (err || !conn) return reject(err ?? new Error('No DB connection'));
      conn.query(sql, params, (e, rows) => {
        conn.release();
        e ? reject(e) : resolve(rows);
      });
    })
  );
}

// Safe cast: handles 'active'/'inactive' string values from raw tables.
const SAFE_CAST = `CASE
  WHEN LOWER(param_value) IN ('active','on','true','yes','run','running','1') THEN 1.0
  WHEN LOWER(param_value) IN ('inactive','off','false','no','stop','stopped','0') THEN 0.0
  ELSE CAST(param_value AS DOUBLE)
END`;

// ─── GROUP SOURCES BY TABLE ───────────────────────────────────────────────────

/**
 * Build a map:  tableName → [ { sourceName, param_id, type, agg } ]
 * Ignores the "_comment" key in data_sources.
 */
function groupByTable(sources) {
  const byTable = {};
  for (const [name, def] of Object.entries(sources)) {
    if (name.startsWith('_')) continue;
    const tbl = def.table;
    if (!byTable[tbl]) byTable[tbl] = [];
    byTable[tbl].push({ name, param_id: def.param_id, type: def.type, agg: def.agg || 'AVG' });
  }
  return byTable;
}

// ─── SINGLE-TABLE FETCH ───────────────────────────────────────────────────────

/**
 * Fetch all param_ids from one table for the given time window.
 * Returns { param_id: value } for that table.
 */
async function fetchTable(table, items, type, from, to) {
  const paramIds = [...new Set(items.map(i => i.param_id))];

  let sql, rows;

  if (type === 'metric') {
    // Metric table schema: (ss_id, measured_time, metric_id, metric_value)
    const aggClauses = paramIds
      .map(p => `${items.find(i => i.param_id === p)?.agg || 'AVG'}(CASE WHEN metric_id = '${p}' THEN CAST(metric_value AS DOUBLE) END) AS \`${p}\``)
      .join(',\n      ');
    sql = `
      SELECT ${aggClauses}
      FROM \`${table}\`
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN (${paramIds.map(() => '?').join(',')})
    `;
    rows = await query(sql, [from, to, ...paramIds]);
  } else {
    // Raw table schema: (created_at, param_id, param_value)
    const aggClauses = paramIds
      .map(p => `${items.find(i => i.param_id === p)?.agg || 'AVG'}(CASE WHEN param_id = '${p}' THEN ${SAFE_CAST} END) AS \`${p}\``)
      .join(',\n      ');
    sql = `
      SELECT ${aggClauses}
      FROM \`${table}\`
      WHERE created_at BETWEEN ? AND ?
        AND param_id IN (${paramIds.map(() => '?').join(',')})
    `;
    rows = await query(sql, [from, to, ...paramIds]);
  }

  return rows[0] ?? {};
}

// ─── PUBLIC: readAllPoints ────────────────────────────────────────────────────

/**
 * Reads every data_source defined in calc_config.json for the given window.
 *
 * @param {string} from  - ISO datetime string (bucket start)
 * @param {string} to    - ISO datetime string (bucket end)
 * @returns {Promise<Object>}  e.g. { CH1_comp01_power: 123.4, CH1_tr: 450, ... }
 *
 * Values are raw numbers or null.
 * Calculations that depend on prior calc outputs are resolved by calcEngine.js,
 * which merges this map with intermediate results before each formula step.
 */
async function readAllPoints(from, to) {
  const sources = cfg.data_sources;
  const byTable = groupByTable(sources);

  const tableResults = await Promise.all(
    Object.entries(byTable).map(async ([table, items]) => {
      const type = items[0].type; // all items for a table share the same type
      try {
        const row = await fetchTable(table, items, type, from, to);
        return { items, row };
      } catch (err) {
        console.error(`[pointReader] Error fetching ${table}:`, err.message);
        return { items, row: {} };
      }
    })
  );

  const valueMap = {};
  for (const { items, row } of tableResults) {
    for (const item of items) {
      const raw = row[item.param_id];
      valueMap[item.name] = raw != null ? parseFloat(raw) : null;
    }
  }

  return valueMap;
}

module.exports = { readAllPoints };
