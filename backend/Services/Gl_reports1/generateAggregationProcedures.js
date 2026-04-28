'use strict';
/**
 * generateAggregationProcedures.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads analytic_report_config.json via DeviceRegistry and generates MySQL
 * stored procedures that aggregate raw EAV data into gl_* analytics tables.
 *
 * Generated procedures:
 *   proc_agg_{KEY}()    — per leaf device: pivots raw table → gl_device_timeseries
 *   proc_agg_plant()    — plant totals: gl_device_timeseries → gl_plant_timeseries
 *   proc_rollup_daily() — daily summaries → gl_device_summary + gl_plant_summary
 *   proc_run_all()      — calls all device procs → plant → rollup
 *   ev_analytics_run    — MySQL EVENT that calls proc_run_all() on schedule
 *
 * First-run backfill:
 *   Each device proc checks MAX(bucket_time) in gl_device_timeseries for its key.
 *   NULL = first run → back-fill from MIN(created_at) of source table (full history).
 *   ON DUPLICATE KEY UPDATE handles safe re-processing of the last stored bucket.
 *
 * Off-device gating (SQL, not JS):
 *   kW = 0, TR = 0, TRH = 0, kWh = 0 whenever run_status = 0/off/inactive.
 *   Multi-compressor: kW_01 gated by on_off_01, kW_02 by on_off_02 (auto-matched).
 */

const crypto = require('crypto');
const { pool }                = require('../../Database/pool');
const { cfg, allLeafDevices } = require('./core/DeviceRegistry');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BUCKET_SEC = (cfg.time_bucket_minutes || 5) * 60;
const BUCKET_HRS = ((cfg.time_bucket_minutes || 5) / 60.0).toFixed(8);

// Safe cast: handles 'active'/'inactive'/'on'/'off'/numeric strings for run-status values.
// Also treats any positive numeric string as ON — supports VFD frequency as run indicator.
const SAFE_ON = `CASE WHEN LOWER(param_value) IN ('1','on','active','running','true','yes','run')
  OR (param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$' AND CAST(param_value AS DECIMAL(20,6)) > 0)
  THEN 1 ELSE 0 END`;

// Safe numeric cast: returns NULL for non-numeric strings instead of throwing ERROR 1366
const SAFE_NUM = `IF(param_value REGEXP '^-?[0-9]+(\\\\.[0-9]+)?$', CAST(param_value AS DECIMAL(20,6)), NULL)`;

// Bucket floor expression — groups rows into N-minute time buckets
const BKT = `FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / ${BUCKET_SEC}) * ${BUCKET_SEC})`;

// Temp table name used by every procedure (one proc runs at a time)
const TMP = '_agg_src';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Wrap array of param names as SQL IN list: 'a','b','c' */
const sqlIn = arr => arr.filter(Boolean).map(p => `'${p}'`).join(',');

/** Safe SQL column alias from any string */
const col = s => s.replace(/[^a-zA-Z0-9]/g, '_');

/** DB exec helper */
const execSQL = (conn, sql) =>
  new Promise((res, rej) => conn.query(sql, (e, r) => e ? rej(e) : res(r)));

const getConn = () =>
  new Promise((res, rej) => pool.getConnection((e, c) => e ? rej(e) : res(c)));


// ─────────────────────────────────────────────────────────────────────────────
// kW METRIC ID AUTO-DETECTION
//   Single param ending _00  → metric_id = 'kW'
//   Multiple params _01 _02  → metric_ids = 'kW_01', 'kW_02'  (+ total 'kW')
// ─────────────────────────────────────────────────────────────────────────────

function resolveKwMetrics(kwParams) {
  if (!kwParams?.length) return [];
  if (kwParams.length === 1) return [{ param: kwParams[0], metric_id: 'kW' }];
  return kwParams.map(p => {
    const m = p.match(/_(\d+)$/);
    return { param: p, metric_id: m ? `kW_${m[1]}` : `kW_${col(p)}` };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTO-MATCH gate param for a kW param (by numeric postfix)
//   par_comp_avg_power_01  →  par_comp_on_off_01
// ─────────────────────────────────────────────────────────────────────────────

function findGateParam(kwParam, runStatusParams) {
  const m = kwParam.match(/_(\d+)$/);
  if (!m) return null;
  const postfix = `_${m[1]}`;
  return runStatusParams.find(p => p.endsWith(postfix)) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEAN PARAM NAME → METRIC ID
//   Strip par_/sts_/cmd_ prefix.  Remove _00 postfix (single instance).
//   Keep _01 / _02 postfix (multi-instance distinguisher).
// ─────────────────────────────────────────────────────────────────────────────

function cleanParamId(p) {
  return p.replace(/^(?:par_|sts_|cmd_)/, '').replace(/_00$/, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY PARAMS HELPERS
//
// display_params supports two formats in the config:
//
//   Format 1 — Raw param (store as-is, no arithmetic):
//     "metric_id": "raw_param_id"
//     Example: "comp_load_01": "par_comp_load_01"
//     → Fetches par_comp_load_01 from source table, stores AVG as metric "comp_load_01"
//
//   Format 2 — Formula (arithmetic on one or more params):
//     "metric_id": { "params": ["param_id_1", "param_id_2", ...], "formula": "p0 - p1" }
//     Example: "cdw_delta_t": { "params": ["par_cond_entering_temp_00", "par_cond_leaving_temp_00"], "formula": "p0 - p1" }
//     → Fetches both params, computes (entering - leaving), stores result as metric "cdw_delta_t"
//     → p0, p1, p2... are positional references to the params array
//     → Use standard arithmetic: +  -  *  /  and COALESCE/CASE if needed
//
// ─────────────────────────────────────────────────────────────────────────────

/** All raw param_ids referenced by a display_param entry (string or formula object) */
function dpParamIds(def) {
  return typeof def === 'string' ? [def] : (def.params ?? []);
}

/** CTE SELECT column definitions for a display_param entry */
function dpColDefs(id, def) {
  if (typeof def === 'string') {
    // Raw param → single AVG column aliased as dp_{id}
    return [`    AVG(CASE WHEN param_id = '${def}' THEN ${SAFE_NUM} END) AS ${col('dp_' + id)}`];
  }
  // Formula → one AVG column per param, aliased as dp_{id}_p0, dp_{id}_p1, ...
  return (def.params ?? []).map((p, i) =>
    `    AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col('dp_' + id + '_p' + i)}`
  );
}

/** Final SELECT expression for a display_param entry (used in UNION ALL rows) */
function dpRowExpr(id, def) {
  if (typeof def === 'string') {
    // Raw param → just read the column directly
    return col('dp_' + id);
  }
  // Formula → replace p0, p1... with COALESCE(col_alias, 0) in the formula string
  let expr = def.formula;
  (def.params ?? []).forEach((_, i) => {
    expr = expr.replace(new RegExp(`\\bp${i}\\b`, 'g'), `COALESCE(${col('dp_' + id + '_p' + i)}, 0)`);
  });
  return expr;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE BUILDER: CHILLER  (calc_type = TR_TRH_KWH)
// ─────────────────────────────────────────────────────────────────────────────

function buildChillerProc(dev) {
  const KEY      = dev.key;
  const TABLE    = dev.raw_table;
  const EM_TABLE = dev.kw?.raw_table ?? null;   // separate energy meter table for kW/kWh
  const trCfg    = dev.tr ?? {};
  const trMult   = trCfg.multiplier ?? 0.33;

  const runParams = [].concat(dev.params?.run_status ?? []);
  const kwParams  = dev.kw?.params ?? [];
  const useAbs    = dev.kw?.use_abs === true;
  const kwhCfg    = dev.kwh ?? {};
  const isCarry   = kwhCfg.source_type === 'DIRECT_CUMULATIVE_CARRY';
  const kwhParams = isCarry ? (kwhCfg.params ?? []) : [];
  const kwhParam  = kwhParams[0] ?? null;
  const displayP  = dev.display_params ?? {};

  const flowP     = dev.params?.[trCfg.flow_param]     ?? trCfg.flow_param     ?? null;
  const enteringP = dev.params?.[trCfg.entering_param] ?? trCfg.entering_param ?? null;
  const leavingP  = dev.params?.[trCfg.leaving_param]  ?? trCfg.leaving_param  ?? null;

  const kwMetrics = resolveKwMetrics(kwParams);
  const multiComp = kwParams.length > 1;

  // ── Params per source table ───────────────────────────────────────────────
  // When EM_TABLE is set: kW + kWh params come from EM_TABLE, everything else from TABLE
  const chParams = [
    ...runParams,
    flowP, enteringP, leavingP,
    ...(EM_TABLE ? [] : [...kwParams, ...kwhParams]),
    ...Object.entries(displayP).flatMap(([, def]) => dpParamIds(def))
  ].filter(Boolean);

  const emParams = EM_TABLE ? [...kwParams, ...kwhParams] : [];

  // ── Column definitions ───────────────────────────────────────────────────
  const chColDefs = [
    ...runParams.map(p =>
      `      MAX(CASE WHEN param_id = '${p}' THEN ${SAFE_ON} END) AS ${col(p)}`),
    ...(EM_TABLE ? [] : kwParams.map(p =>
      `      AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`)),
    ...(EM_TABLE ? [] : kwhParams.map(p =>
      `      AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`)),
    flowP     && `      AVG(CASE WHEN param_id = '${flowP}'     THEN ${SAFE_NUM} END) AS _flow`,
    enteringP && `      AVG(CASE WHEN param_id = '${enteringP}' THEN ${SAFE_NUM} END) AS _entering`,
    leavingP  && `      AVG(CASE WHEN param_id = '${leavingP}'  THEN ${SAFE_NUM} END) AS _leaving`,
    ...Object.entries(displayP).flatMap(([id, def]) => dpColDefs(id, def))
  ].filter(Boolean);

  const emColDefs = EM_TABLE ? [
    ...kwParams.map(p =>
      `      AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`),
    ...kwhParams.map(p =>
      `      AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`)
  ] : [];

  // ── CTE pivot helper ─────────────────────────────────────────────────────
  function pivotCte(table, paramList, colDefs) {
    return [
      `    SELECT`,
      `      ${BKT} AS bkt,`,
      colDefs.join(',\n'),
      `    FROM \`${table}\``,
      `    WHERE created_at >= v_from AND created_at < v_to`,
      `      AND param_id IN (${sqlIn(paramList)})`,
      `    GROUP BY bkt`
    ].join('\n');
  }

  // ── kW gating ────────────────────────────────────────────────────────────
  function gatedKwExpr(kwParam) {
    const gateP = multiComp ? findGateParam(kwParam, runParams) : null;
    const gateC = gateP
      ? `COALESCE(${col(gateP)}, 0) = 1`
      : `(${runParams.map(p => `COALESCE(${col(p)}, 0) = 1`).join(' OR ')})`;
    const raw = `COALESCE(${col(kwParam)}, 0)`;
    return `CASE WHEN ${gateC} THEN ${useAbs ? `ABS(${raw})` : raw} ELSE 0 END`;
  }

  const kwExprs      = kwParams.map(p => ({ param: p, expr: gatedKwExpr(p) }));
  const totalKwSql   = kwExprs.map(e => e.expr).join(' + ') || '0';
  const deviceOnExpr = runParams.map(p => `COALESCE(${col(p)}, 0) = 1`).join(' OR ') || 'FALSE';

  const trSql = [
    `CASE WHEN (${deviceOnExpr})`,
    `          THEN GREATEST(0, COALESCE(_flow,0) * (COALESCE(_entering,0) - COALESCE(_leaving,0)) * ${trMult})`,
    `          ELSE 0 END`
  ].join('\n          ');

  // kWh: use carry delta when > 0, fall back to kW×hours when counter is frozen/sparse
  const kwhSql = (isCarry && kwhParam)
    ? `CASE WHEN (${deviceOnExpr}) THEN GREATEST(COALESCE(_kwh_delta, 0), (${totalKwSql}) * ${BUCKET_HRS}) ELSE 0 END`
    : `(${totalKwSql}) * ${BUCKET_HRS}`;

  // ── Build CTE chain ───────────────────────────────────────────────────────
  const cteList = [];

  if (EM_TABLE) {
    // kW + kWh params come from energy meter table; run_status + TR from chiller table
    const joinCols = [
      ...runParams.map(p => `COALESCE(c.${col(p)}, 0) AS ${col(p)}`),
      ...kwParams.map(p => `COALESCE(e.${col(p)}, 0) AS ${col(p)}`),
      ...kwhParams.map(p => `COALESCE(e.${col(p)}, 0) AS ${col(p)}`),
      flowP     && `c._flow`,
      enteringP && `c._entering`,
      leavingP  && `c._leaving`,
      ...Object.entries(displayP).flatMap(([id, def]) => {
        if (typeof def === 'string') return [`c.${col('dp_' + id)}`];
        return (def.params ?? []).map((_, i) => `c.${col('dp_' + id + '_p' + i)}`);
      })
    ].filter(Boolean);

    cteList.push(`  _agg_ch AS (\n${pivotCte(TABLE, chParams, chColDefs)}\n  )`);
    cteList.push(`  _agg_em AS (\n${pivotCte(EM_TABLE, emParams, emColDefs)}\n  )`);
    cteList.push(
      `  _agg_joined AS (\n` +
      `    SELECT COALESCE(c.bkt, e.bkt) AS bkt,\n` +
      `      ${joinCols.join(',\n      ')}\n` +
      `    FROM (SELECT bkt FROM _agg_ch UNION SELECT bkt FROM _agg_em) AS all_bkts\n` +
      `    LEFT JOIN _agg_ch c USING (bkt)\n` +
      `    LEFT JOIN _agg_em e USING (bkt)\n` +
      `  )`
    );
    const prevCte = (isCarry && kwhParam) ? '_agg_carry' : '_agg_joined';
    if (isCarry && kwhParam) {
      cteList.push(
        `  _agg_carry AS (\n` +
        `    SELECT *,\n` +
        `      LEAST(GREATEST(0,\n` +
        `        COALESCE(${col(kwhParam)}, 0)\n` +
        `        - COALESCE(LAG(${col(kwhParam)}) OVER (ORDER BY bkt), COALESCE(${col(kwhParam)}, 0))\n` +
        `      ), ABS(COALESCE(${col(kwParams[0])}, 0)) * ${BUCKET_HRS} * 1.5) AS _kwh_delta\n` +
        `    FROM _agg_joined\n` +
        `  )`
      );
    }
    cteList.push(
      `  ${TMP} AS (\n` +
      `    SELECT *,\n` +
      `      (SELECT COALESCE(SUM(metric_value), 0) FROM gl_device_timeseries\n` +
      `       WHERE device_key = '${KEY}' AND metric_id = 'kWh' AND bucket_time < v_from)\n` +
      `      + SUM(${kwhSql}) OVER (ORDER BY bkt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n` +
      `      AS kWh_cumulative,\n` +
      `      (SELECT COALESCE(SUM(metric_value), 0) FROM gl_device_timeseries\n` +
      `       WHERE device_key = '${KEY}' AND metric_id = 'TRH' AND bucket_time < v_from)\n` +
      `      + SUM((${trSql}) * ${BUCKET_HRS}) OVER (ORDER BY bkt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n` +
      `      AS TRH_cumulative\n` +
      `    FROM ${prevCte}\n` +
      `  )`
    );
  } else {
    // All params from chiller table
    cteList.push(`  _agg_base AS (\n${pivotCte(TABLE, chParams, chColDefs)}\n  )`);
    const prevCte = (isCarry && kwhParam) ? '_agg_carry' : '_agg_base';
    if (isCarry && kwhParam) {
      cteList.push(
        `  _agg_carry AS (\n` +
        `    SELECT *,\n` +
        `      LEAST(GREATEST(0,\n` +
        `        COALESCE(${col(kwhParam)}, 0)\n` +
        `        - COALESCE(LAG(${col(kwhParam)}) OVER (ORDER BY bkt), COALESCE(${col(kwhParam)}, 0))\n` +
        `      ), ABS(COALESCE(${col(kwParams[0])}, 0)) * ${BUCKET_HRS} * 1.5) AS _kwh_delta\n` +
        `    FROM _agg_base\n` +
        `  )`
      );
    }
    cteList.push(
      `  ${TMP} AS (\n` +
      `    SELECT *,\n` +
      `      (SELECT COALESCE(SUM(metric_value), 0) FROM gl_device_timeseries\n` +
      `       WHERE device_key = '${KEY}' AND metric_id = 'kWh' AND bucket_time < v_from)\n` +
      `      + SUM(${kwhSql}) OVER (ORDER BY bkt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n` +
      `      AS kWh_cumulative,\n` +
      `      (SELECT COALESCE(SUM(metric_value), 0) FROM gl_device_timeseries\n` +
      `       WHERE device_key = '${KEY}' AND metric_id = 'TRH' AND bucket_time < v_from)\n` +
      `      + SUM((${trSql}) * ${BUCKET_HRS}) OVER (ORDER BY bkt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n` +
      `      AS TRH_cumulative\n` +
      `    FROM ${prevCte}\n` +
      `  )`
    );
  }

  // ── UNION ALL rows — all reference TMP ───────────────────────────────────
  const rows = [];

  kwExprs.forEach((e, i) => {
    const mid = kwMetrics[i]?.metric_id ?? `kW_${i + 1}`;
    rows.push(`    SELECT bkt, '${KEY}', '${mid}', ${e.expr} FROM ${TMP}`);
  });

  if (multiComp) {
    rows.push(`    SELECT bkt, '${KEY}', 'kW', ${totalKwSql} FROM ${TMP}`);
  }

  rows.push(`    SELECT bkt, '${KEY}', 'TR',              ${trSql} FROM ${TMP}`);
  rows.push(`    SELECT bkt, '${KEY}', 'kWh',             ${kwhSql} FROM ${TMP}`);
  rows.push(`    SELECT bkt, '${KEY}', 'TRH',             (${trSql}) * ${BUCKET_HRS} FROM ${TMP}`);
  rows.push(`    SELECT bkt, '${KEY}', 'kWh_cumulative',  kWh_cumulative FROM ${TMP}`);
  rows.push(`    SELECT bkt, '${KEY}', 'TRH_cumulative',  TRH_cumulative FROM ${TMP}`);

  rows.push([
    `    SELECT bkt, '${KEY}', 'kW_per_TR',`,
    `      CASE WHEN (${deviceOnExpr}) AND (${trSql}) > 0`,
    `           THEN (${totalKwSql}) / (${trSql}) ELSE 0 END`,
    `    FROM ${TMP}`
  ].join('\n'));
  rows.push(`    SELECT bkt, '${KEY}', 'run_hours', CASE WHEN (${deviceOnExpr}) THEN ${BUCKET_HRS} ELSE 0 END FROM ${TMP}`);

  runParams.forEach(p =>
    rows.push(`    SELECT bkt, '${KEY}', '${cleanParamId(p)}', COALESCE(${col(p)}, 0) FROM ${TMP}`)
  );

  if (enteringP) rows.push(`    SELECT bkt, '${KEY}', 'chw_entering', _entering FROM ${TMP}`);
  if (leavingP)  rows.push(`    SELECT bkt, '${KEY}', 'chw_leaving',  _leaving  FROM ${TMP}`);
  if (enteringP && leavingP)
    rows.push(`    SELECT bkt, '${KEY}', 'chw_delta_t', COALESCE(_entering,0) - COALESCE(_leaving,0) FROM ${TMP}`);
  if (flowP)
    rows.push(`    SELECT bkt, '${KEY}', 'chiller_flow', _flow FROM ${TMP}`);

  Object.entries(displayP).forEach(([id, def]) =>
    rows.push(`    SELECT bkt, '${KEY}', '${id}', ${dpRowExpr(id, def)} FROM ${TMP}`)
  );

  return `
-- ── ${KEY} (CHILLER) ──────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS proc_agg_${KEY};
CREATE PROCEDURE proc_agg_${KEY}()
proc_body: BEGIN
  DECLARE v_from DATETIME;
  DECLARE v_to   DATETIME DEFAULT NOW();

  SELECT COALESCE(
    MAX(bucket_time),
    CAST(COALESCE((SELECT DATE(MIN(created_at)) FROM \`${TABLE}\`), CURDATE()) AS DATETIME)
  ) INTO v_from
  FROM gl_device_timeseries
  WHERE device_key = '${KEY}';

  IF v_from >= v_to THEN LEAVE proc_body; END IF;

  INSERT INTO gl_device_timeseries (bucket_time, device_key, metric_id, metric_value)
  WITH
${cteList.join(',\n')}
${rows.join('\n  UNION ALL\n')}
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

END;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE BUILDER: KWH DEVICE  (pumps, CT fans)
// ─────────────────────────────────────────────────────────────────────────────

function buildKwhProc(dev) {
  const KEY      = dev.key;
  const TABLE    = dev.raw_table;
  const EM_TABLE = dev.kw?.raw_table ?? null;  // separate energy meter table (optional)

  const runParams = [].concat(dev.params?.run_status ?? []);
  const kwParams  = dev.kw?.params ?? [];
  const useAbs    = dev.kw?.use_abs === true;
  const kwhCfg    = dev.kwh ?? {};
  const isCarry   = kwhCfg.source_type === 'DIRECT_CUMULATIVE_CARRY';
  const kwhParams = isCarry ? (kwhCfg.params ?? []) : [];
  const kwParam   = kwParams[0];
  const kwhParam  = kwhParams[0] ?? null;

  // ── Column definitions ───────────────────────────────────────────────────
  const runCols = runParams.map(p =>
    `    MAX(CASE WHEN param_id = '${p}' THEN ${SAFE_ON} END) AS ${col(p)}`);
  const kwCols  = kwParams.map(p =>
    `    AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`);
  const kwhCols = kwhParams.map(p =>
    `    AVG(CASE WHEN param_id = '${p}' THEN ${SAFE_NUM} END) AS ${col(p)}`);

  // ── Expressions ─────────────────────────────────────────────────────────
  const deviceOnExpr = runParams.map(p => `COALESCE(${col(p)}, 0) = 1`).join(' OR ') || 'FALSE';
  const rawKw        = `COALESCE(${col(kwParam)}, 0)`;
  const gatedKwSql   = `CASE WHEN (${deviceOnExpr}) THEN ${useAbs ? `ABS(${rawKw})` : rawKw} ELSE 0 END`;
  // Use carry delta when > 0, fall back to kW×hours when counter is frozen/sparse
  const kwhSql       = (isCarry && kwhParam)
    ? `CASE WHEN (${deviceOnExpr}) THEN GREATEST(COALESCE(_kwh_delta, 0), ${gatedKwSql} * ${BUCKET_HRS}) ELSE 0 END`
    : `(${gatedKwSql}) * ${BUCKET_HRS}`;

  // ── CTE pivot helper ─────────────────────────────────────────────────────
  function srcCte(table, paramList, colDefs) {
    return [
      `    SELECT`,
      `      ${BKT} AS bkt,`,
      colDefs.join(',\n'),
      `    FROM \`${table}\``,
      `    WHERE created_at >= v_from AND created_at < v_to`,
      `      AND param_id IN (${sqlIn(paramList)})`,
      `    GROUP BY bkt`
    ].join('\n');
  }

  // ── LAG carry CTE (shared logic for both EM and non-EM paths) ────────────
  function carryCte(fromCte) {
    return (
      `  _agg_carry AS (\n` +
      `    SELECT *,\n` +
      `      LEAST(GREATEST(0,\n` +
      `        COALESCE(${col(kwhParam)}, 0)\n` +
      `        - COALESCE(LAG(${col(kwhParam)}) OVER (ORDER BY bkt), COALESCE(${col(kwhParam)}, 0))\n` +
      `      ), ABS(COALESCE(${col(kwParam)}, 0)) * ${BUCKET_HRS} * 1.5) AS _kwh_delta\n` +
      `    FROM ${fromCte}\n` +
      `  )`
    );
  }

  // ── Build CTE chain ───────────────────────────────────────────────────────
  const cteList = [];

  if (EM_TABLE) {
    // run_status from device table; kW + kWh params from energy meter table
    const emParams  = [...kwParams, ...kwhParams];
    const emColDefs = [...kwCols, ...kwhCols];

    const joinCols = [
      ...runParams.map(p => `COALESCE(r.${col(p)}, 0) AS ${col(p)}`),
      ...kwParams.map(p  => `COALESCE(e.${col(p)}, 0) AS ${col(p)}`),
      ...kwhParams.map(p => `COALESCE(e.${col(p)}, 0) AS ${col(p)}`)
    ];

    cteList.push(`  _agg_run AS (\n${srcCte(TABLE, runParams, runCols)}\n  )`);
    cteList.push(`  _agg_em AS (\n${srcCte(EM_TABLE, emParams, emColDefs)}\n  )`);
    cteList.push(
      `  _agg_joined AS (\n` +
      `    SELECT COALESCE(r.bkt, e.bkt) AS bkt,\n` +
      `      ${joinCols.join(',\n      ')}\n` +
      `    FROM (SELECT bkt FROM _agg_run UNION SELECT bkt FROM _agg_em) AS all_bkts\n` +
      `    LEFT JOIN _agg_run r USING (bkt)\n` +
      `    LEFT JOIN _agg_em  e USING (bkt)\n` +
      `  )`
    );
    if (isCarry && kwhParam) cteList.push(carryCte('_agg_joined'));
    cteList.push(`  ${TMP} AS (SELECT * FROM ${isCarry && kwhParam ? '_agg_carry' : '_agg_joined'})`);
  } else {
    const allCols = [...runCols, ...kwCols, ...kwhCols];
    const allP    = [...runParams, ...kwParams, ...kwhParams];
    cteList.push(`  _agg_base AS (\n${srcCte(TABLE, allP, allCols)}\n  )`);
    if (isCarry && kwhParam) cteList.push(carryCte('_agg_base'));
    cteList.push(`  ${TMP} AS (SELECT * FROM ${isCarry && kwhParam ? '_agg_carry' : '_agg_base'})`);
  }

  // ── kWh cumulative CTE ───────────────────────────────────────────────────
  cteList.push(
    `  _agg_cum AS (\n` +
    `    SELECT bkt,\n` +
    `      (SELECT COALESCE(SUM(metric_value), 0) FROM gl_device_timeseries\n` +
    `       WHERE device_key = '${KEY}' AND metric_id = 'kWh' AND bucket_time < v_from)\n` +
    `      + SUM(${kwhSql}) OVER (ORDER BY bkt ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n` +
    `      AS kWh_cumulative\n` +
    `    FROM ${TMP}\n` +
    `  )`
  );

  // ── UNION ALL rows ────────────────────────────────────────────────────────
  const rows = [
    `  SELECT bkt, '${KEY}', 'kW',             ${gatedKwSql} FROM ${TMP}`,
    `  SELECT bkt, '${KEY}', 'kWh',            ${kwhSql} FROM ${TMP}`,
    `  SELECT bkt, '${KEY}', 'kWh_cumulative', kWh_cumulative FROM _agg_cum`,
    `  SELECT bkt, '${KEY}', 'run_hours', CASE WHEN (${deviceOnExpr}) THEN ${BUCKET_HRS} ELSE 0 END FROM ${TMP}`,
    ...runParams.map(p =>
      `  SELECT bkt, '${KEY}', '${cleanParamId(p)}', COALESCE(${col(p)}, 0) FROM ${TMP}`)
  ];

  return `
-- ── ${KEY} (${dev.type}) ──────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS proc_agg_${KEY};
CREATE PROCEDURE proc_agg_${KEY}()
proc_body: BEGIN
  DECLARE v_from DATETIME;
  DECLARE v_to   DATETIME DEFAULT NOW();

  SELECT COALESCE(
    MAX(bucket_time),
    CAST(COALESCE((SELECT DATE(MIN(created_at)) FROM \`${TABLE}\`), CURDATE()) AS DATETIME)
  ) INTO v_from
  FROM gl_device_timeseries
  WHERE device_key = '${KEY}';

  IF v_from >= v_to THEN LEAVE proc_body; END IF;

  INSERT INTO gl_device_timeseries (bucket_time, device_key, metric_id, metric_value)
  WITH
${cteList.join(',\n')}
${rows.join('\n  UNION ALL\n')}
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

END;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE: proc_agg_plant()
// Reads gl_device_timeseries → aggregates plant-level totals → gl_plant_timeseries
// ─────────────────────────────────────────────────────────────────────────────

function buildPlantProc(leafDevices) {
  const plantDevices = leafDevices.filter(d => d.include_in_plant_totals);
  const chillers     = plantDevices.filter(d => d.calc_type === 'TR_TRH_KWH');
  const kwhDevices   = plantDevices.filter(d => d.calc_type === 'KWH');

  const allPlantKeys = plantDevices.map(d => `'${d.key}'`).join(',');
  const chillerKeys  = chillers.map(d => `'${d.key}'`).join(',');

  // Per-type kW: group KWH devices by type (e.g. PRIMARY_PUMP, CONDENSER_PUMP, CT_FAN)
  // Each type gets its own SUM column in the CTE, then a separate row in the INSERT.
  const byType = {};
  for (const d of kwhDevices) {
    if (!byType[d.type]) byType[d.type] = [];
    byType[d.type].push(d.key);
  }

  // CTE columns: one SUM per device type (referenced by alias in UNION rows below)
  const typeKwCols = Object.entries(byType).map(([type, keys]) => {
    const inList = keys.map(k => `'${k}'`).join(',');
    return `      SUM(CASE WHEN device_key IN (${inList}) AND metric_id = 'kW' THEN metric_value ELSE 0 END) AS kw_${col(type)}`;
  });

  // UNION rows: read the pre-computed per-type columns from the CTE
  const typeKwUnion = Object.entries(byType).map(([type]) =>
    `  SELECT bkt, 'kW_${type}', kw_${col(type)} FROM _plant_pivot`
  );

  return `
-- ── Plant aggregation ──────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS proc_agg_plant;
CREATE PROCEDURE proc_agg_plant()
proc_body: BEGIN
  DECLARE v_from DATETIME;
  DECLARE v_to   DATETIME DEFAULT NOW();

  SELECT COALESCE(
    (SELECT MAX(bucket_time) FROM gl_plant_timeseries),
    (SELECT MIN(bucket_time) FROM gl_device_timeseries WHERE device_key IN (${allPlantKeys})),
    CURDATE()
  ) INTO v_from;

  IF v_from >= v_to THEN LEAVE proc_body; END IF;

  INSERT INTO gl_plant_timeseries (bucket_time, metric_id, metric_value)
  WITH _plant_pivot AS (
    SELECT
      bucket_time AS bkt,
      SUM(CASE WHEN device_key IN (${chillerKeys}) AND metric_id = 'kW'  THEN metric_value ELSE 0 END) AS ch_kw,
      SUM(CASE WHEN device_key IN (${chillerKeys}) AND metric_id = 'TR'  THEN metric_value ELSE 0 END) AS ch_tr,
      SUM(CASE WHEN device_key IN (${chillerKeys}) AND metric_id = 'kWh' THEN metric_value ELSE 0 END) AS ch_kwh,
      SUM(CASE WHEN device_key IN (${chillerKeys}) AND metric_id = 'TRH' THEN metric_value ELSE 0 END) AS ch_trh,
      SUM(CASE WHEN device_key IN (${allPlantKeys}) AND metric_id = 'kW'  THEN metric_value ELSE 0 END) AS plant_kw,
      SUM(CASE WHEN device_key IN (${allPlantKeys}) AND metric_id = 'kWh' THEN metric_value ELSE 0 END) AS plant_kwh${typeKwCols.length ? ',\n' + typeKwCols.join(',\n') : ''}
    FROM gl_device_timeseries
    WHERE device_key IN (${allPlantKeys})
      AND metric_id IN ('kW','TR','kWh','TRH')
      AND bucket_time >= v_from AND bucket_time < v_to
    GROUP BY bucket_time
  )
  SELECT bkt, 'kW_chiller',   ch_kw    FROM _plant_pivot
  UNION ALL SELECT bkt, 'TR',            ch_tr    FROM _plant_pivot
  UNION ALL SELECT bkt, 'kWh_chiller',  ch_kwh   FROM _plant_pivot
  UNION ALL SELECT bkt, 'TRH',          ch_trh   FROM _plant_pivot
  UNION ALL SELECT bkt, 'kW_plant',     plant_kw FROM _plant_pivot
  UNION ALL SELECT bkt, 'kWh_plant',    plant_kwh FROM _plant_pivot
  UNION ALL SELECT bkt, 'chiller_SPC',
    CASE WHEN ch_tr > 0 THEN ch_kw / ch_tr ELSE 0 END FROM _plant_pivot
  UNION ALL SELECT bkt, 'plant_SPC',
    CASE WHEN ch_tr > 0 THEN plant_kw / ch_tr ELSE 0 END FROM _plant_pivot
${typeKwUnion.length ? '  UNION ALL\n' + typeKwUnion.join('\n  UNION ALL\n') : ''}
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);
END;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE: proc_rollup_daily()
// Aggregates gl_*_timeseries → gl_device_summary + gl_plant_summary
// Processes last 2 days to capture late-arriving data.
// ─────────────────────────────────────────────────────────────────────────────

function buildDailyRollupProc() {
  return `
-- ── Daily rollup ───────────────────────────────────────────────────────────────
DROP PROCEDURE IF EXISTS proc_rollup_daily;
CREATE PROCEDURE proc_rollup_daily()
BEGIN
  -- v_from_dev: start date for device summary.
  --   First run (table empty) → use earliest date in gl_device_timeseries (full backfill).
  --   Subsequent runs         → re-process from 1 day before last summary (catches late data).
  DECLARE v_from_dev  DATE;
  DECLARE v_from_pla  DATE;

  SELECT COALESCE(
    DATE_SUB(MAX(summary_date), INTERVAL 1 DAY),
    (SELECT DATE(MIN(bucket_time)) FROM gl_device_timeseries)
  ) INTO v_from_dev FROM gl_device_summary;

  SELECT COALESCE(
    DATE_SUB(MAX(summary_date), INTERVAL 1 DAY),
    (SELECT DATE(MIN(bucket_time)) FROM gl_plant_timeseries)
  ) INTO v_from_pla FROM gl_plant_summary;

  -- Device: kWh per day per device
  INSERT INTO gl_device_summary (summary_date, device_key, metric_id, metric_value)
  SELECT DATE(bucket_time), device_key, 'kWh', SUM(metric_value)
  FROM gl_device_timeseries
  WHERE metric_id = 'kWh'
    AND DATE(bucket_time) >= v_from_dev
  GROUP BY DATE(bucket_time), device_key
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  -- Device: TRH per day (chillers only — other devices get 0)
  INSERT INTO gl_device_summary (summary_date, device_key, metric_id, metric_value)
  SELECT DATE(bucket_time), device_key, 'TRH', SUM(metric_value)
  FROM gl_device_timeseries
  WHERE metric_id = 'TRH'
    AND DATE(bucket_time) >= v_from_dev
  GROUP BY DATE(bucket_time), device_key
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  -- Device: total run_hours per day
  INSERT INTO gl_device_summary (summary_date, device_key, metric_id, metric_value)
  SELECT DATE(bucket_time), device_key, 'run_hours', SUM(metric_value)
  FROM gl_device_timeseries
  WHERE metric_id = 'run_hours'
    AND DATE(bucket_time) >= v_from_dev
  GROUP BY DATE(bucket_time), device_key
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  -- Device: peak kW per day
  INSERT INTO gl_device_summary (summary_date, device_key, metric_id, metric_value)
  SELECT DATE(bucket_time), device_key, 'peak_kW', MAX(metric_value)
  FROM gl_device_timeseries
  WHERE metric_id = 'kW'
    AND DATE(bucket_time) >= v_from_dev
  GROUP BY DATE(bucket_time), device_key
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  -- Plant: kWh + TRH per day (from plant timeseries)
  INSERT INTO gl_plant_summary (summary_date, metric_id, metric_value)
  SELECT DATE(bucket_time), metric_id, SUM(metric_value)
  FROM gl_plant_timeseries
  WHERE metric_id IN ('kWh_plant','kWh_chiller','TRH')
    AND DATE(bucket_time) >= v_from_pla
  GROUP BY DATE(bucket_time), metric_id
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  -- Plant: SPC = kWh / TRH for the day
  INSERT INTO gl_plant_summary (summary_date, metric_id, metric_value)
  SELECT
    t.summary_date,
    'plant_SPC',
    CASE WHEN trh.metric_value > 0 THEN t.metric_value / trh.metric_value ELSE 0 END
  FROM gl_plant_summary t
  JOIN gl_plant_summary trh
    ON t.summary_date = trh.summary_date AND trh.metric_id = 'TRH'
  WHERE t.metric_id = 'kWh_plant'
    AND t.summary_date >= v_from_pla
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

  INSERT INTO gl_plant_summary (summary_date, metric_id, metric_value)
  SELECT
    t.summary_date,
    'chiller_SPC',
    CASE WHEN trh.metric_value > 0 THEN t.metric_value / trh.metric_value ELSE 0 END
  FROM gl_plant_summary t
  JOIN gl_plant_summary trh
    ON t.summary_date = trh.summary_date AND trh.metric_id = 'TRH'
  WHERE t.metric_id = 'kWh_chiller'
    AND t.summary_date >= v_from_pla
  ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);
END;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURE: proc_run_all()
// ─────────────────────────────────────────────────────────────────────────────

function buildRunAllProc(deviceKeys) {
  return `
-- ── Run all in sequence: devices → plant → daily rollup ───────────────────────
DROP PROCEDURE IF EXISTS proc_run_all;
CREATE PROCEDURE proc_run_all()
BEGIN
${deviceKeys.map(k => `  CALL proc_agg_${k}();`).join('\n')}
  CALL proc_agg_plant();
  CALL proc_rollup_daily();
END;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MYSQL EVENT SCHEDULER
// ─────────────────────────────────────────────────────────────────────────────

function buildEvent() {
  const interval = cfg.scheduler_interval_minutes || 5;
  return `
-- ── MySQL Event: runs proc_run_all() every ${interval} minute(s) ──────────────────────
DROP EVENT IF EXISTS ev_analytics_run;
CREATE EVENT ev_analytics_run
  ON SCHEDULE EVERY ${interval} MINUTE
  STARTS NOW()
  DO CALL proc_run_all();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: generateAndApply()
// ─────────────────────────────────────────────────────────────────────────────

async function generateAndApply() {
  const rawJson    = JSON.stringify(require('./analytic_report_config.json'));
  const generatorSrc = require('fs').readFileSync(__filename);
  const newHash = crypto.createHash('sha256')
    .update(rawJson)
    .update(generatorSrc)
    .digest('hex');

  const conn = await getConn();
  try {
    // Check if config has changed since last generation
    const rows = await execSQL(conn,
      `SELECT config_hash FROM gl_config_meta WHERE config_key = 'analytics_config'`
    );
    const storedHash = rows[0]?.config_hash ?? null;

    if (storedHash === newHash) {
      console.log('[Analytics] Config unchanged — skipping procedure regeneration.');
      return { skipped: true, hash: newHash };
    }

    console.log('[Analytics] Config changed — generating stored procedures...');

    const leaves = allLeafDevices();

    // Collect all SQL blocks
    const parts = [];

    for (const dev of leaves) {
      if (dev.calc_type === 'TR_TRH_KWH') parts.push(buildChillerProc(dev));
      else if (dev.calc_type === 'KWH')    parts.push(buildKwhProc(dev));
      // CONTAINER type (COOLING_TOWER parent) has no procedure — only its children do
    }

    parts.push(buildPlantProc(leaves));
    parts.push(buildDailyRollupProc());
    parts.push(buildRunAllProc(leaves.map(d => d.key)));
    parts.push(buildEvent());

    // Execute each part (DROP + CREATE) as separate queries.
    // Sending everything as one multipleStatements string causes MySQL to fragment
    // procedure bodies on their internal semicolons, leading to ER_SP_ALREADY_EXISTS.
    // A single CREATE PROCEDURE ... BEGIN ... END; is accepted as one COM_QUERY.
    const execConn = await getConn();
    try {
      await execSQL(execConn, 'SET GLOBAL event_scheduler = ON');
      for (const part of parts) {
        // Split on the first ';' to isolate DROP from CREATE...END
        const firstSemi = part.indexOf(';');
        if (firstSemi === -1) continue;
        const dropSql   = part.slice(0, firstSemi + 1).trim();
        const createSql = part.slice(firstSemi + 1).trim();
        if (dropSql)   await execSQL(execConn, dropSql);
        if (createSql) await execSQL(execConn, createSql);
      }
    } finally {
      execConn.release();
    }

    // Persist new config hash
    await execSQL(conn, `
      INSERT INTO gl_config_meta (config_key, config_hash, last_generated)
      VALUES ('analytics_config', '${newHash}', NOW())
      ON DUPLICATE KEY UPDATE config_hash = '${newHash}', last_generated = NOW()
    `);

    console.log(`[Analytics] ✓ Procedures generated. Hash: ${newHash.slice(0, 12)}...`);
    return { generated: true, hash: newHash, statements: parts.length };

  } finally {
    conn.release();
  }
}

module.exports = { generateAndApply };
