const {
  glDevices,
  glDeviceSnapShotMap,
  active_device_states,
  inactive_device_states,
} = require("./constants");
const { deployed_at, pbs1_port } = require("./config");
const { pollUntil } = require("./utils");
const { loadSnapshot } = require("./snapshot");
const { get_bacnet_details_by_gl_code, pbsWriteRequest } = require("./bacnet");
const { findFunctions } = require("./find_devices");

async function open_chiller_valve(deviceKey, target_id) {
  const snapshot = await loadSnapshot();

  let devStatus = "";
  let target = "";
  let bacnet = "";
  let nameHandlerStatus = "";

  if (!snapshot) {
    console.warn("Cannot access the snapshot API!");
    return false;
  }

  devStatus = true;
  target = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!devStatus) {
    console.warn(`No ${deviceKey} found to turn ON`);
    return false;
  }

  console.log(`Turning ON valve for ${deviceKey} ${target.name}`);

  bacnet = target[glDevices.bacnet];

  let object_id =
    target[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].ch_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      target,
      glDeviceSnapShotMap[deviceKey].ch_valve_on_off,
    ));
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceKey}`);
    return false;
  }

  const pbs_status = await pbsWriteRequest(
    pbs1_port,
    bacnet,
    object_id,
    "active",
  );

  if (!pbs_status) return false;

  const device_state = await pollUntil({
    action: async () => await read_chiller_valve(deviceKey, target.id),

    validate: (state) => active_device_states.includes(state),
  });

  return device_state;
}

async function close_chiller_valve(deviceKey, target_id) {
  const snapshot = await loadSnapshot();

  let devStatus = "";
  let target = "";
  let nameHandlerStatus = "";
  let bacnet = "";

  if (!snapshot) {
    console.warn("Cannot access the snapshot API!");
    return false;
  }

  const findDeviceFunc = findFunctions[deviceKey];

  if (!findDeviceFunc) {
    console.error(`No find function defined for device ${deviceKey}`);
    return false;
  }

  devStatus = true;
  target = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!devStatus) {
    console.warn(`No ${deviceKey} found to turn ON`);
    return false;
  }

  console.log(`Turning evaporator OFF valve for ${deviceKey} ${target.name}`);

  bacnet = target[glDevices.bacnet];

  let object_id =
    target[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].ch_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      target,
      glDeviceSnapShotMap[deviceKey].ch_valve_on_off,
    ));
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceKey}`);
    return false;
  }

  const pbs_status = await pbsWriteRequest(
    pbs1_port,
    bacnet,
    object_id,
    "inactive",
  );

  if (!pbs_status) return false;

  const device_state = await pollUntil({
    action: async () => await read_chiller_valve(deviceKey, target.id),

    validate: (state) => inactive_device_states.includes(state),
  });

  return device_state;
}

async function read_chiller_valve(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  let device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].ch_valve_status
    ][glDevices.presentValue];

  return device_status;
}

async function read_chiller_water_flow(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  let device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].cond_valve_water_flow
    ][glDevices.presentValue];

  return device_status;
}

async function open_chiller_cond_valve(deviceKey, target_id) {
  const snapshot = await loadSnapshot();

  let devStatus = "";
  let target = "";
  let bacnet = "";
  let nameHandlerStatus = "";

  if (!snapshot) {
    console.warn("Cannot access the snapshot API!");
    return false;
  }
  devStatus = true;
  target = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!devStatus) {
    console.warn(`No ${deviceKey} found to turn ON`);
    return false;
  }

  console.log(`Turning ON cond valve for ${deviceKey} ${target.name}`);

  bacnet = target[glDevices.bacnet];

  let object_id =
    target[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].cond_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      target,
      glDeviceSnapShotMap[deviceKey].cond_valve_on_off,
    ));
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceKey}`);
    return false;
  }

  const pbs_status = await pbsWriteRequest(
    pbs1_port,
    bacnet,
    object_id,
    "active",
  );

  if (!pbs_status) return false;

  const device_state = await pollUntil({
    action: async () => await read_chiller_cond_valve(deviceKey, target.id),

    validate: (state) => active_device_states.includes(state),
  });

  return device_state;
}

async function close_chiller_cond_valve(deviceKey, target_id) {
  const snapshot = await loadSnapshot();

  let devStatus = "";
  let target = "";
  let nameHandlerStatus = "";
  let bacnet = "";

  if (!snapshot) {
    console.warn("Cannot access the snapshot API!");
    return false;
  }

  const findDeviceFunc = findFunctions[deviceKey];

  if (!findDeviceFunc) {
    console.error(`No find function defined for device ${deviceKey}`);
    return false;
  }

  devStatus = true;
  target = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!devStatus) {
    console.warn(`No ${deviceKey} found to turn ON`);
    return false;
  }

  console.log(`Turning OFF condenser valve for ${deviceKey} ${target.name}`);

  bacnet = target[glDevices.bacnet];

  let object_id =
    target[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].cond_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      target,
      glDeviceSnapShotMap[deviceKey].cond_valve_on_off,
    ));
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceKey}`);
    return false;
  }

  const pbs_status = await pbsWriteRequest(
    pbs1_port,
    bacnet,
    object_id,
    "inactive",
  );

  if (!pbs_status) return false;

  const device_state = await pollUntil({
    action: async () => await read_chiller_cond_valve(deviceKey, target.id),

    validate: (state) => inactive_device_states.includes(state),
  });

  return device_state;
}

async function read_chiller_cond_valve(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  let device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].cond_valve_status
    ][glDevices.presentValue];

  return device_status;
}

async function read_chiller_cond_valve_water_flow(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  let device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].cond_valve_water_flow
    ][glDevices.presentValue];

  return device_status;
}

module.exports = {
  open_chiller_valve,
  close_chiller_valve,
  read_chiller_valve,
  read_chiller_water_flow,
  open_chiller_cond_valve,
  close_chiller_cond_valve,
  read_chiller_cond_valve,
  read_chiller_cond_valve_water_flow,
};
