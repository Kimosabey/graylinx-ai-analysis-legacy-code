const mysql = require('mysql');
const logger = require('../Config/logger');
const config = require('../Config/common').mysql;

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

connection.connect(err => {
  if (err) {
    logger.error('GL Analytics schema DB connect error', err);
    return;
  }
  logger.info('Connected for GL Analytics schema init');
});

// ── 1. Device time-series (5-min buckets per device) ─────────────────────────
//   Stores every computed metric (kW, TR, TRH, kWh, run_hours, display params)
//   for each device at each time bucket.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_device_timeseries (
  bucket_time    DATETIME      NOT NULL   COMMENT '5-min (or configured) time bucket start',
  device_key     VARCHAR(32)   NOT NULL   COMMENT 'Device identifier e.g. CH1, PV1, CT1_F1',
  metric_id      VARCHAR(64)   NOT NULL   COMMENT 'Metric name e.g. kW, TR, TRH, kWh, on_off_01',
  metric_value   DOUBLE        NULL       COMMENT 'Computed / raw metric value',
  created_at     DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bucket_time, device_key, metric_id),
  INDEX idx_dev_time  (device_key, bucket_time),
  INDEX idx_time      (bucket_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='5-min aggregated metrics per device. Procedures write here; APIs read from here.'
`, log('gl_device_timeseries'));

// ── 2. Plant time-series (5-min plant-level totals) ───────────────────────────
//   Plant-wide aggregates: total kW, total TR, plant SPC, per-type kW totals.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_plant_timeseries (
  bucket_time    DATETIME      NOT NULL   COMMENT '5-min time bucket start',
  metric_id      VARCHAR(64)   NOT NULL   COMMENT 'Metric name e.g. kW_plant, TR, TRH, plant_SPC',
  metric_value   DOUBLE        NULL,
  created_at     DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bucket_time, metric_id),
  INDEX idx_time (bucket_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='5-min plant-level aggregate metrics. Written by proc_agg_plant().'
`, log('gl_plant_timeseries'));

// ── 3. Device daily summary ───────────────────────────────────────────────────
//   Daily rollup per device: total kWh, total TRH, total run_hours, peak kW.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_device_summary (
  summary_date   DATE          NOT NULL   COMMENT 'Calendar date (local time)',
  device_key     VARCHAR(32)   NOT NULL,
  metric_id      VARCHAR(64)   NOT NULL   COMMENT 'e.g. kWh, TRH, run_hours, peak_kW',
  metric_value   DOUBLE        NULL,
  created_at     DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (summary_date, device_key, metric_id),
  INDEX idx_dev_date (device_key, summary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Daily aggregated metrics per device. Written by proc_rollup_daily().'
`, log('gl_device_summary'));

// ── 4. Plant daily summary ────────────────────────────────────────────────────
//   Daily plant-level KPIs: total kWh, total TRH, plant SPC, chiller SPC.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_plant_summary (
  summary_date   DATE          NOT NULL,
  metric_id      VARCHAR(64)   NOT NULL   COMMENT 'e.g. kWh_plant, TRH, plant_SPC, chiller_SPC',
  metric_value   DOUBLE        NULL,
  created_at     DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (summary_date, metric_id),
  INDEX idx_date (summary_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Daily plant-level KPI summary. Written by proc_rollup_daily().'
`, log('gl_plant_summary'));

// ── 5. Committed performance time-series (optional) ───────────────────────────
//   Only populated when committed performance tracking is enabled in config.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_committed_timeseries (
  bucket_time    DATETIME      NOT NULL,
  device_key     VARCHAR(32)   NOT NULL,
  metric_id      VARCHAR(64)   NOT NULL   COMMENT 'e.g. committed_kW_per_TR, committed_kW',
  metric_value   DOUBLE        NULL,
  created_at     DATETIME      NOT NULL   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (bucket_time, device_key, metric_id),
  INDEX idx_dev_time (device_key, bucket_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Committed performance values per chiller bucket. Only used when committed is enabled.'
`, log('gl_committed_timeseries'));

// ── 6. Config metadata ────────────────────────────────────────────────────────
//   Stores SHA-256 hash of analytic_report_config.json.
//   generateAggregationProcedures.js checks this — skips regeneration if unchanged.
connection.query(`
CREATE TABLE IF NOT EXISTS gl_config_meta (
  config_key     VARCHAR(64)   NOT NULL   COMMENT 'e.g. analytics_config',
  config_hash    VARCHAR(64)   NULL       COMMENT 'SHA-256 of the JSON config file',
  last_generated DATETIME      NULL       COMMENT 'When procedures were last generated',
  PRIMARY KEY (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  COMMENT='Tracks config hash to avoid unnecessary procedure regeneration.'
`, log('gl_config_meta'));

function log(table) {
  return err => {
    if (err) logger.error(`gl_analytics_schema [${table}]: ${err.message}`);
    else logger.info(`${table} ready`);
  };
}
