const data = require("C:/Users/santhosh sekar/Downloads/myibmssnapshot.json");

// console.log(data);

const chillers = Object.values(data["NONGL_SS_CHILLER"]);

function getRunHours(device) {
  return Number(
    device.Eqp_Attributes?.par_comp_run_hrs_00?.presentValue ??
      device.Eqp_Attributes?.par_run_hours_00?.presentValue,
  );
}

function getMaxRunHourDevice(devices) {
  return devices.slice(1).reduce((max, device) => {
    if (!device.Equipment_Faulty && !max.Equipment_Faulty) {
      const deviceHrs = getRunHours(device);
      const maxHrs = getRunHours(max);
      if (isNaN(maxHrs) || (!isNaN(deviceHrs) && deviceHrs > maxHrs)) {
        return device;
      }
      return max;
    } else if (!device.Equipment_Faulty) {
      return device;
    } else {
      return max;
    }
  }, devices[0]);
}

function getMinRunHourDevice(devices) {
  return devices.slice(1).reduce((min, device) => {
    if (!device.Equipment_Faulty && !min.Equipment_Faulty) {
      const deviceHrs = getRunHours(device);
      const minHrs = getRunHours(min);
      if (isNaN(minHrs) || (!isNaN(deviceHrs) && deviceHrs < minHrs)) {
        return device;
      }
      return min;
    } else if (!device.Equipment_Faulty) {
      return device;
    } else {
      return min;
    }
  }, devices[0]);
}

const maxDevice = getMaxRunHourDevice(chillers);
const minDevice = getMinRunHourDevice(chillers);
console.log("Max run hours device:", maxDevice.name);
console.log("Min run hours device:", minDevice.name);
