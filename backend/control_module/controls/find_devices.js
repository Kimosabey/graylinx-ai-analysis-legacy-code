const {
  glDevices,
  glDeviceSnapShotMap,
  auto_manual_status,
  inactive_device_states,
} = require("./constants");
const { get_faulty_devices } = require("./checkpoint");
const { getMinRunHourDevice } = require("./utils");

function findDevice(
  snapshotJson,
  key,
  param,
  auto_manual_check = true,
  value = false,
  value2 = false,
  skip_min_check = false,
) {
  if (!snapshotJson) return { status: false, device: null };

  let devices = snapshotJson[glDeviceSnapShotMap[key].key];

  const faulty_devices = get_faulty_devices();

  if (!devices) {
    console.warn(`Device ${key} not found in snapshot`);
    return { status: false, device: null };
  }

  devices = Object.values(devices);
  if (devices.length === 0) return { status: false, device: null };

  devices = devices.filter((device) => {
    return !faulty_devices.includes(device.id);
  });

  devices = devices.filter((device) => {
    return device.Eqp_Metrics.Equipment_Faulty !== true;
  });

  if (skip_min_check) {
    return { status: true, device: Object.values(devices) };
  }
  if (auto_manual_check) {
    if (value) {
      devices = devices.filter((device) => {
        return (
          device[glDevices.paramGroup][glDeviceSnapShotMap[key].auto_status]
            .presentValue === value
        );
      });
    } else {
      devices = devices.filter((device) => {
        return auto_manual_status.includes(
          device[glDevices.paramGroup][glDeviceSnapShotMap[key].auto_status]
            .presentValue,
        );
      });
    }
  }

  if (value2) {
    devices = devices.filter((device) => {
      return (
        device[glDevices.paramGroup][param][glDevices.presentValue] === value2
      );
    });
  } else {
    devices = devices.filter((device) => {
      return inactive_device_states.includes(
        device[glDevices.paramGroup][param][glDevices.presentValue],
      );
    });
  }

  if (devices.length === 0) {
    console.log(`all devices are running, no device found to turn on`);
    return { status: false, device: null };
  }

  const minRunHourDevice = getMinRunHourDevice(devices);

  console.log(
    `Found device for operations: name=${minRunHourDevice.name}, id=${minRunHourDevice.id}`,
  );

  return { status: true, device: minRunHourDevice };
}

const find_wc_chiller = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.wc_chiller,
    glDeviceSnapShotMap.wc_chiller.status,
    true,
    "2.0",
  );

const find_ac_chiller = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.ac_chiller,
    glDeviceSnapShotMap.ac_chiller.status,
  );

const find_pri_pump = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.prim_pump,
    glDeviceSnapShotMap.prim_pump.status,
    true,
    "2.0",
  );

const find_sec_pump = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.sec_pump,
    glDeviceSnapShotMap.sec_pump.status,
  );

const find_cooling_tower = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.cool_tower,
    glDeviceSnapShotMap.cool_tower.status,
  );

const find_condenser_pump = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.cond_pump,
    glDeviceSnapShotMap.cond_pump.status,
    true,
    "2.0",
  );

const find_priv_seq_panel = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.priv_seq_panel,
    glDeviceSnapShotMap.priv_seq_panel.status,
    false,
  );

const find_prim_var_pump = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.prim_var_pump,
    glDeviceSnapShotMap.prim_var_pump.status,
  );

const find_sec_seq_panel = (snapshotJson) =>
  findDevice(
    snapshotJson,
    glDevices.sec_seq_panel,
    glDeviceSnapShotMap.sec_seq_panel.status,
    false,
    false,
    false,
    true,
  );

const findFunctions = {
  wc_chiller: find_wc_chiller,
  prim_pump: find_pri_pump,
  sec_pump: find_sec_pump,
  cond_pump: find_condenser_pump,
  cool_tower: find_cooling_tower,
  ac_chiller: find_ac_chiller,
  priv_seq_panel: find_priv_seq_panel,
  sec_seq_panel: find_sec_seq_panel,
  prim_var_pump: find_prim_var_pump,
};

module.exports = {
  findDevice,
  find_wc_chiller,
  find_ac_chiller,
  find_pri_pump,
  find_sec_pump,
  find_cooling_tower,
  find_condenser_pump,
  find_priv_seq_panel,
  find_sec_seq_panel,
  find_prim_var_pump,
  findFunctions,
};
