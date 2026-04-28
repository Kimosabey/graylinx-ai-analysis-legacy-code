const controls = require("../controls");

async function set_cpm_mode_on_off(value) {
  console.log(`Action: set CPM mode to ${value}`);
  const res = await controls.update_metric_value("cpm_mode", value);

  if (res) {
    console.log(`CPM mode set to ${value} successfully.`);
    return true;
  } else {
    console.error(`Failed to set CPM mode to ${value}.`);
    return false;
  }
}

async function read_cpm_mode_status(metric_id) {
  console.log(`Action: verify CPM mode`);
  const res = await controls.getMetrics(metric_id);
  if (!res || res.length === 0) {
    console.error(`Failed to read CPM mode status.`);
    return null;
  }
  return res[0].metric_value;
}

async function set_manual_mode_on_off(value) {
  console.log(`Action: set manual mode to ${value}`);
  const res = await controls.update_metric_value("manual_mode", value);

  if (res) {
    console.log(`Manual mode set to ${value} successfully.`);
    return true;
  } else {
    console.error(`Failed to set manual mode to ${value}.`);
    return false;
  }
}

async function read_manual_mode_status(metric_id) {
  console.log(`Action: verify manual mode`);
  const res = await controls.getMetrics(metric_id);
  if (!res || res.length === 0) {
    console.error(`Failed to read manual mode status.`);
    return null;
  }
  return res[0].metric_value;
}

module.exports = {
  set_cpm_mode_on_off,
  read_cpm_mode_status,
  set_manual_mode_on_off,
  read_manual_mode_status,
};
