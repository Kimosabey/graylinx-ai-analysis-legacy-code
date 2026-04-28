const controls = require("../controls");

async function get_faulty_devices() {
  const { data } = await controls.getActiveAlarms();

  const faulty_devices = data.map((alarm) => alarm.ss_id);
  return faulty_devices;
}

async function insert_into_faulty_devices(
  ss_id,
  alarm_code,
  measured_time,
  param_id,
  message,
) {
  const { success, insertId } = await controls.insertAlarm({
    ss_id,
    alarm_code,
    measured_time,
    param_id,
    message,
  });
  if (success) {
    console.log(
      `Inserted faulty device ${ss_id} into faulty_devices table with insertId ${insertId}`,
    );
    return true;
  } else {
    console.error(
      `Failed to insert faulty device ${ss_id} into faulty_devices table`,
    );
    return false;
  }
}

module.exports = {
  get_faulty_devices,
  insert_into_faulty_devices,
};
