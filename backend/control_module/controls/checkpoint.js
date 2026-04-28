const { cpm_execution_check_point } = require("./constants");

async function update_duration_seconds(duration_key, seconds) {
  cpm_execution_check_point.duration_seconds[duration_key] = seconds;
}

async function get_duration_seconds(duration_key) {
  return cpm_execution_check_point.duration_seconds[duration_key] ?? 0;
}

async function write_faulty_devices(deviceID) {
  if (!cpm_execution_check_point.faulty_devices.includes(deviceID)) {
    cpm_execution_check_point.faulty_devices.push(deviceID);
  }
}

async function clear_faulty_devices() {
  cpm_execution_check_point.faulty_devices = [];
}

function get_faulty_devices() {
  return [...cpm_execution_check_point.faulty_devices];
}

module.exports = {
  update_duration_seconds,
  get_duration_seconds,
  write_faulty_devices,
  clear_faulty_devices,
  get_faulty_devices,
};
