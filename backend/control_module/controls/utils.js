const fs = require("fs");
const { parse } = require("csv-parse");

function getMinRunHourDevice(devices) {
  return devices.reduce((min, device) => {
    if (!device.Equipment_Faulty && !min.Equipment_Faulty) {
      return Number(
        device.Eqp_Attributes?.par_comp_run_hrs_00?.presentValue ??
          device.Eqp_Attributes?.par_run_hours_00?.presentValue,
      ) <
        Number(
          min.Eqp_Attributes?.par_comp_run_hrs_00?.presentValue ??
            min.Eqp_Attributes?.par_run_hours_00?.presentValue,
        )
        ? device
        : min;
    } else if (!device.Equipment_Faulty) {
      return device;
    } else {
      return min;
    }
  }, devices[0]);
}

function getMaxRunHourDevice(devices) {
  return devices.reduce((max, device) => {
    if (!device.Equipment_Faulty && !max.Equipment_Faulty) {
      return Number(
        device.Eqp_Attributes?.par_comp_run_hrs_00?.presentValue ??
          device.Eqp_Attributes?.par_run_hours_00?.presentValue,
      ) >
        Number(
          max.Eqp_Attributes?.par_comp_run_hrs_00?.presentValue ??
            max.Eqp_Attributes?.par_run_hours_00?.presentValue,
        )
        ? device
        : max;
    } else if (!device.Equipment_Faulty) {
      return device;
    } else {
      return max;
    }
  }, devices[0]);
}

async function pollUntil({
  action,
  validate,
  intervalMs = 10000,
  timeoutMs = 300000,
  onTick,
}) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const result = await action();

      if (onTick) onTick(result);

      if (validate(result)) {
        return result;
      }
    } catch (err) {
      console.error("Polling error:", err.message);
    }

    await new Promise((res) => setTimeout(res, intervalMs));
  }

  throw new Error("Timeout: condition not met");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`CSV file not found: ${filePath}`);
    return {
      status: false,
      message: `CSV file not found: ${filePath}`,
      data: false,
    };
  }
  const records = [];

  const parser = fs
    .createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const record of parser) {
    records.push(record);
  }

  return {
    status: true,
    message: `CSV file found: ${filePath}`,
    data: records,
  };
}

function isIPAddress(value) {
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
  return ipRegex.test(value);
}

// Searches all device groups in a snapshot and returns the device name by ID
function getDeviceNameById(snapshot, deviceId) {
  if (!snapshot || !deviceId) return null;
  for (const typeKey of Object.keys(snapshot)) {
    const group = snapshot[typeKey];
    if (!group || typeof group !== "object") continue;
    for (const device of Object.values(group)) {
      if (device && device.id === deviceId) return device.name || deviceId;
    }
  }
  return deviceId; // fallback to raw ID if name not found
}

module.exports = {
  getMinRunHourDevice,
  getMaxRunHourDevice,
  pollUntil,
  sleep,
  readCSV,
  isIPAddress,
  getDeviceNameById,
};
