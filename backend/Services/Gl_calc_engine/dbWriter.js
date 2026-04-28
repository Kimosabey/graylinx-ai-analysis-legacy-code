'use strict';
/**
 * dbWriter.js
 *
 * Writes calculated metric values back to the database.
 *
 * Schema assumed (same as all metric tables in this project):
 *   ss_id          VARCHAR(64)  NOT NULL
 *   measured_time  DATETIME     NOT NULL
 *   metric_id      VARCHAR(64)  NOT NULL
 *   metric_value   DOUBLE
 *   created_at     DATETIME     DEFAULT NOW()
 *   PRIMARY KEY (ss_id, measured_time, metric_id)
 *
 * Uses INSERT … ON DUPLICATE KEY UPDATE so re-running the engine for the
 * same bucket is idempotent — it just updates the value.
 */

const { pool } = require('../../Database/pool');

// ─── DB HELPER ───────────────────────────────────────────────────────────────

function query(sql, params = []) {
  return new Promise((resolve, reject) =>
    pool.getConnection((err, conn) => {
      if (err || !conn) return reject(err ?? new Error('No DB connection'));
      conn.query(sql, params, (e, result) => {
        conn.release();
        e ? reject(e) : resolve(result);
      });
    })
  );
}

// ─── GROUP WRITES BY TABLE ────────────────────────────────────────────────────

/**
 * @typedef {Object} WriteRecord
 * @property {string} table      - Target metric table name
 * @property {string} ss_id      - Device / sensor system ID
 * @property {string} metric_id  - Metric identifier (column name in metric table)
 * @property {number|null} value - Calculated value
 * @property {string} bucket     - Bucket datetime string (ISO or 'YYYY-MM-DD HH:mm:ss')
 */

/**
 * Write an array of calculated results to the DB.
 * Groups records by table for efficiency (one INSERT per table per call).
 *
 * @param {WriteRecord[]} records
 * @returns {Promise<{ written: number, skipped: number }>}
 */
async function writeResults(records) {
  if (!records?.length) return { written: 0, skipped: 0 };

  // Group by target table
  const byTable = {};
  for (const rec of records) {
    if (rec.value === null || rec.value === undefined || !isFinite(rec.value)) {
      continue; // skip null / NaN results — don't pollute the metric table
    }
    if (!byTable[rec.table]) byTable[rec.table] = [];
    byTable[rec.table].push(rec);
  }

  let written = 0;
  const skipped = records.length - Object.values(byTable).flat().length;

  await Promise.all(
    Object.entries(byTable).map(async ([table, recs]) => {
      // Build multi-row INSERT … ON DUPLICATE KEY UPDATE
      const placeholders = recs.map(() => '(?, ?, ?, ?, NOW())').join(', ');
      const values       = recs.flatMap(r => [r.ss_id, r.bucket, r.metric_id, r.value]);

      const sql = `
        INSERT INTO \`${table}\` (ss_id, measured_time, metric_id, metric_value, created_at)
        VALUES ${placeholders}
        ON DUPLICATE KEY UPDATE
          metric_value = VALUES(metric_value),
          created_at   = NOW()
      `;

      try {
        await query(sql, values);
        written += recs.length;
        console.log(`[dbWriter] ${table}: ${recs.length} record(s) upserted`);
      } catch (err) {
        console.error(`[dbWriter] Failed writing to ${table}:`, err.message);
      }
    })
  );

  return { written, skipped };
}

module.exports = { writeResults };
