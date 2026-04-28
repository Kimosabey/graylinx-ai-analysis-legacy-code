const { insertAlarm } = require(".././controls");
const alarmCache = new Map();

const INSERT_THRESHOLD = 5 * 60 * 1000;
const STALE_THRESHOLD = 2 * 60 * 1000;

async function checkFaultyDevices(faultList, activeList) {
  const now = Date.now();

  for (const fault of faultList) {
    const key = `${fault.ss_id}_${fault.alarm_code}_${fault.param_id}`;

    if (!alarmCache.has(key)) {
      alarmCache.set(key, {
        firstSeen: now,
        lastSeen: now,
        inserted: false,
        data: fault,
      });
      console.log(`Stored new fault: ${key}`);
    } else {
      const record = alarmCache.get(key);
      record.lastSeen = now;

      // If alarm was previously inserted but is no longer in the active list
      // (e.g. soft-deleted), reset so it can be re-inserted after persistence check
      if (record.inserted && Array.isArray(activeList)) {
        const stillActive = activeList.some(
          (a) =>
            String(a.ss_id) === String(fault.ss_id) &&
            String(a.alarm_code) === String(fault.alarm_code) &&
            String(a.param_id) === String(fault.param_id),
        );
        if (!stillActive) {
          record.inserted = false;
          record.firstSeen = now;
        }
      }

      if (!record.inserted && now - record.firstSeen >= INSERT_THRESHOLD) {
        let ss_id = fault.ss_id;
        let alarmcode = fault.alarm_code;
        let measuredTime = new Date();
        let param_id = fault.param_id;
        let mess = fault.message;

        await insertAlarm({
          ss_id,
          alarm_code: alarmcode,
          measured_time: measuredTime,
          param_id,
          message: mess,
        });

        record.inserted = true;
      }
    }
  }

  for (const [key, record] of alarmCache.entries()) {
    if (now - record.lastSeen >= STALE_THRESHOLD) {
      console.log(`Removed old fault (TTL expired): ${key}`);
      alarmCache.delete(key);
    }
  }
}

module.exports = {
  checkFaultyDevices,
};
