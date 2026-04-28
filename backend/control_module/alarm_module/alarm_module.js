const {
  glDeviceSnapShotMap,
  loadSnapshot,
  getActiveAlarms,
  updateDeleteAlarm,
  updateAlarmByKey,
  insertAlarm,
  active_device_states,
  inactive_device_states,
} = require(".././controls");

const { execFile } = require("child_process");
const presistence_check = require("./persistence_check");

const SKIP_DEVICE = "NONGL_SS_PRIMARY_VARIABLE_PUMPS";
const HEARTBEAT_TTL_MS = 60 * 1000;
const ALARM_CODE = 199;
const PLANT_PARAM_ID = "PLANT_STATUS";

const controllerMap = JSON.parse(process.env.controllermap || "{}");
const heartbeatCache = new Map();

function getAlarmInfo(param_id, deviceName, value) {
  const safeValue =
    value === null || value === undefined || value === "" ? "unknown" : value;
  const isOnOffParam = /on|off/i.test(String(param_id || ""));

  if (isOnOffParam) {
    return {
      code: ALARM_CODE,
      message: `${deviceName || "unknown"} on/off mismatch`,
    };
  }

  return {
    code: ALARM_CODE,
    message: `${deviceName || "unknown"} fault - ${param_id}: ${safeValue}`,
  };
}

function makeAlarmKey(ss_id, alarm_code, param_id) {
  return `${ss_id}_${alarm_code}_${param_id}`;
}

function getDdcInfo(attrs, onOffObj, statusObj) {
  const name =
    onOffObj?.ddc ||
    statusObj?.ddc ||
    Object.values(attrs).find((attr) => attr?.ddc)?.ddc ||
    null;
  const ssid =
    onOffObj?.ddc_ssid ||
    statusObj?.ddc_ssid ||
    Object.values(attrs).find((attr) => attr?.ddc_ssid)?.ddc_ssid ||
    null;

  return { name, ssid };
}

function collectDdcInfo(snapshot) {
  const ddcMap = new Map();

  for (const devices of Object.values(snapshot || {})) {
    if (!devices) continue;
    for (const device of Object.values(devices)) {
      const attrs = device?.Eqp_Attributes;
      if (!attrs) continue;
      for (const attr of Object.values(attrs)) {
        if (!attr?.ddc) continue;
        if (!ddcMap.has(attr.ddc)) {
          ddcMap.set(attr.ddc, { name: attr.ddc, ssid: attr.ddc_ssid || null });
        }
      }
    }
  }

  return ddcMap;
}

function pingHost(ip) {
  return new Promise((resolve) => {
    const isWin = process.platform === "win32";
    const args = isWin
      ? ["-n", "1", "-w", "1000", ip]
      : ["-c", "1", "-W", "1", ip];

    execFile("ping", args, { timeout: 1500 }, (err) => {
      resolve(!err);
    });
  });
}

async function isDdcReachable(ddcName) {
  if (!ddcName) return true;

  const ip = controllerMap[ddcName];
  if (!ip) {
    console.warn(`DDC IP not found for ${ddcName}`);
    return false;
  }

  const cached = heartbeatCache.get(ddcName);
  if (cached && Date.now() - cached.checkedAt < HEARTBEAT_TTL_MS) {
    return cached.reachable;
  }

  const reachable = await pingHost(ip);
  heartbeatCache.set(ddcName, { checkedAt: Date.now(), reachable });
  return reachable;
}

async function upsertImmediateAlarm(
  { ss_id, alarm_code, param_id, message },
  activeList,
  seenAlarms,
) {
  const measured_time = new Date();
  seenAlarms.add(makeAlarmKey(ss_id, alarm_code, param_id));

  const alreadyActive = activeList.some(
    (a) =>
      String(a.ss_id) === String(ss_id) &&
      String(a.alarm_code) === String(alarm_code) &&
      String(a.param_id) === String(param_id),
  );

  if (alreadyActive) {
    await updateAlarmByKey({ ss_id, alarm_code, param_id, measured_time });
    return;
  }

  await insertAlarm({
    ss_id,
    alarm_code,
    measured_time,
    param_id,
    message,
  });
}

async function processDeviceAlarms(
  key,
  snapshot,
  activeList,
  seenAlarms,
  ddcState,
) {
  const attrs = snapshot?.Eqp_Attributes;
  if (!attrs) return;

  for (const deviceKey of Object.keys(glDeviceSnapShotMap)) {
    const deviceCfg = glDeviceSnapShotMap[deviceKey];
    if (deviceCfg.key !== key) continue;

    const { on_off, status, alarms, fault } = deviceCfg;

    const onOffObj = on_off ? attrs[on_off] : null;
    const statusObj = status ? attrs[status] : null;

    const ss_id = snapshot.id;
    const { name: devDdcName } = getDdcInfo(attrs, onOffObj, statusObj);
    if (devDdcName && ddcState.unreachable.has(devDdcName)) return;

    // On/Off mismatch → 5-minute persistence before raising alarm
    if (onOffObj && statusObj && deviceCfg.key !== SKIP_DEVICE) {
      const onOffVal = normalizeValue(onOffObj.presentValue);
      const statusVal = normalizeValue(statusObj.presentValue);

      if (onOffVal !== statusVal) {
        const mismatchDdc =
          onOffObj?.ddc || statusObj?.ddc || snapshot.ddcid || snapshot.name;
        if (!mismatchDdc || !ddcState.unreachable.has(mismatchDdc)) {
          const alarmInfo = getAlarmInfo(
            on_off,
            snapshot.name,
            `${onOffObj.presentValue} vs ${statusObj.presentValue}`,
          );
          const alarm_code = alarmInfo.code;
          const measured_time = new Date();
          seenAlarms.add(makeAlarmKey(ss_id, alarm_code, on_off));

          const alreadyActive = activeList.some(
            (a) =>
              String(a.ss_id) === String(ss_id) &&
              String(a.alarm_code) === String(alarm_code) &&
              String(a.param_id) === String(on_off),
          );

          if (alreadyActive) {
            await updateAlarmByKey({
              ss_id,
              alarm_code,
              param_id: on_off,
              measured_time,
            });
          } else {
            await presistence_check.checkFaultyDevices(
              [
                {
                  ss_id,
                  alarm_code,
                  measured_time,
                  param_id: on_off,
                  message: alarmInfo.message,
                },
              ],
              activeList,
            );
          }
        }
      }
    }

    // Alarm params (fault field + alarms array) → raise immediately
    const alarmParamSet = new Set();
    if (fault) alarmParamSet.add(fault);
    if (alarms) {
      for (const param_id of alarms) {
        alarmParamSet.add(param_id);
      }
    }

    for (const param_id of alarmParamSet) {
      const tripParam = attrs[param_id];
      if (!tripParam) continue;
      if (!isAlarmActive(tripParam.presentValue)) continue;

      const tripDdc = tripParam?.ddc || snapshot.ddcid || snapshot.name;
      if (tripDdc && ddcState.unreachable.has(tripDdc)) continue;

      const alarm_code = tripParam.presentValue;
      const message = `${snapshot.name ||
        "unknown"} fault - ${param_id}: ${alarm_code}`;
      await upsertImmediateAlarm(
        { ss_id, alarm_code, param_id, message },
        activeList,
        seenAlarms,
      );
    }
  }
}

async function startProcessAlarms() {
  const snapshot = await loadSnapshot();
  if (!snapshot) return;

  const activeAlarms = await getActiveAlarms();
  const activeList = activeAlarms?.data || [];
  const seenAlarms = new Set();
  const ddcState = {
    seen: new Set(),
    unreachable: new Set(),
    alarmRaised: new Set(),
    lastSsid: null,
  };

  const ddcMap = collectDdcInfo(snapshot);
  for (const ddc of ddcMap.values()) {
    ddcState.seen.add(ddc.name);
    if (ddc.ssid) {
      ddcState.lastSsid = ddc.ssid;
    }
    const reachable = await isDdcReachable(ddc.name);
    if (reachable) continue;
    ddcState.unreachable.add(ddc.name);
    if (!ddcState.alarmRaised.has(ddc.name) && ddc.ssid) {
      await upsertImmediateAlarm(
        {
          ss_id: ddc.ssid,
          alarm_code: ALARM_CODE,
          param_id: ddc.name,
          message: `DDC ${ddc.name} is not reachable`,
        },
        activeList,
        seenAlarms,
      );
      ddcState.alarmRaised.add(ddc.name);
    }
  }

  const ss_types = [
    ...new Set(
      Object.values(glDeviceSnapShotMap)
        .map((cfg) => cfg?.key)
        .filter((key) => typeof key === "string" && key.trim() !== ""),
    ),
  ];

  if (
    ddcState.seen.size > 0 &&
    ddcState.unreachable.size === ddcState.seen.size
  ) {
    await upsertImmediateAlarm(
      {
        ss_id: ddcState.lastSsid || null,
        alarm_code: ALARM_CODE,
        param_id: PLANT_PARAM_ID,
        message: "Plant is shutdown/unavailable",
      },
      activeList,
      seenAlarms,
    );
    return;
  } else {
    for (const type of ss_types) {
      const devices = snapshot[type] || {};
      for (const device of Object.values(devices)) {
        await processDeviceAlarms(
          type,
          device,
          activeList,
          seenAlarms,
          ddcState,
        );
      }
    }
  }

  for (const alarm of activeList) {
    const alarmKey = makeAlarmKey(
      alarm.ss_id,
      alarm.alarm_code,
      alarm.param_id,
    );
    if (seenAlarms.has(alarmKey)) continue;
    await updateDeleteAlarm({
      ss_id: alarm.ss_id,
      alarm_code: alarm.alarm_code,
      param_id: alarm.param_id,
    });
  }
}

function normalizeValue(value) {
  if (active_device_states.includes(value)) return 1;
  if (inactive_device_states.includes(value)) return 0;

  if (!isNaN(value)) return Number(value);

  return value;
}

function isAlarmActive(value) {
  if (value === null || value === undefined) return false;

  const normalized = normalizeValue(value);

  if (typeof normalized === "number") return normalized !== 0;
  if (typeof normalized === "string") {
    if (normalized.trim() === "") return false;
    return normalized.toLowerCase() !== "inactive";
  }

  return Boolean(normalized);
}

module.exports = {
  startProcessAlarms,
};
