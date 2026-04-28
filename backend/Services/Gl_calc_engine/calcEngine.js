'use strict';
/**
 * calcEngine.js
 *
 * Orchestrates the full Read → Calculate → Write pipeline.
 *
 * Flow for each time bucket:
 *   1. pointReader  – reads all data_sources from DB  → valueMap
 *   2. formulaEngine – evaluates each calculation in order
 *      (each result is immediately merged into valueMap so later calcs
 *       can chain on earlier ones)
 *   3. dbWriter – upserts all non-null results to their target tables
 *
 * Exported:
 *   runBucket(from, to)           – run for a single time window
 *   runRange(startISO, endISO)    – backfill: iterate bucket-by-bucket
 *   runLatestBucket()             – run for the most-recent completed bucket
 */

const cfg          = require('./calc_config.json');
const { readAllPoints } = require('./pointReader');
const { evaluate }      = require('./formulaEngine');
const { writeResults }  = require('./dbWriter');

const BUCKET_MS = (cfg.bucket_minutes || 5) * 60 * 1000;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function snapToBucket(dateISO) {
  const d = new Date(dateISO);
  d.setMinutes(Math.floor(d.getMinutes() / cfg.bucket_minutes) * cfg.bucket_minutes);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function toMysqlDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// ─── SINGLE BUCKET ───────────────────────────────────────────────────────────

/**
 * Run the calculation engine for one time window [from, to].
 *
 * @param {string|Date} from  - Window start
 * @param {string|Date} to    - Window end
 * @returns {Promise<{ bucket, calcsRun, written, skipped, results }>}
 */
async function runBucket(from, to) {
  const fromStr = toMysqlDateTime(new Date(from));
  const toStr   = toMysqlDateTime(new Date(to));
  const bucket  = fromStr;   // store result under bucket-start timestamp

  console.log(`[calcEngine] Running bucket: ${fromStr} → ${toStr}`);

  // Step 1: Read all points
  const valueMap = await readAllPoints(fromStr, toStr);
  console.log(`[calcEngine] Read ${Object.keys(valueMap).length} source point(s)`);

  // Step 2: Evaluate each calculation in order, chaining results
  const writeRecords = [];
  const results      = {};

  for (const calc of cfg.calculations) {
    const value = evaluate(calc, valueMap);

    // Merge result into valueMap so subsequent calcs can reference this one
    valueMap[calc.id] = value;
    results[calc.id]  = value;

    if (value !== null && calc.output) {
      writeRecords.push({
        table:     calc.output.table,
        ss_id:     calc.output.ss_id,
        metric_id: calc.output.metric_id,
        value,
        bucket
      });
    }
  }

  console.log(`[calcEngine] ${cfg.calculations.length} calc(s) evaluated, ${writeRecords.length} non-null result(s)`);

  // Step 3: Write to DB
  const { written, skipped } = await writeResults(writeRecords);

  return {
    bucket,
    calcsRun: cfg.calculations.length,
    written,
    skipped,
    results
  };
}

// ─── RANGE (BACKFILL) ────────────────────────────────────────────────────────

/**
 * Run the engine for every bucket between startISO and endISO.
 * Useful for backfilling historical data.
 *
 * @param {string} startISO
 * @param {string} endISO
 * @returns {Promise<{ totalBuckets, totalWritten, bucketResults[] }>}
 */
async function runRange(startISO, endISO) {
  const start = snapToBucket(startISO);
  const end   = new Date(endISO);

  if (start >= end) throw new Error('"from" must be before "to"');

  const bucketResults = [];
  let cursor = new Date(start);

  while (cursor < end) {
    const bucketEnd = new Date(cursor.getTime() + BUCKET_MS);
    const result    = await runBucket(cursor, bucketEnd < end ? bucketEnd : end);
    bucketResults.push(result);
    cursor = bucketEnd;
  }

  return {
    totalBuckets: bucketResults.length,
    totalWritten: bucketResults.reduce((s, r) => s + r.written, 0),
    bucketResults
  };
}

// ─── LATEST BUCKET ───────────────────────────────────────────────────────────

/**
 * Run the engine for the most recently completed bucket.
 * "Most recently completed" = the bucket that ended just before now.
 */
async function runLatestBucket() {
  const now       = new Date();
  const bucketEnd = snapToBucket(now.toISOString());
  const bucketStart = new Date(bucketEnd.getTime() - BUCKET_MS);
  return runBucket(bucketStart, bucketEnd);
}

module.exports = { runBucket, runRange, runLatestBucket };
