const {
  glDevices,
  glDeviceSnapShotMap,
  active_device_states,
  inactive_device_states,
} = require("./constants");
const { deployed_at, pbs1_port } = require("./config");
const { pollUntil } = require("./utils");
const { loadSnapshot } = require("./snapshot");
const {
  get_target_device,
  get_bacnet_details_by_gl_code,
  pbsWriteRequest,
} = require("./bacnet");

async function turn_on_device(deviceKey, target_id = false) {
  let { devStatus, target } = await get_target_device(deviceKey, target_id);
  let nameHandlerStatus = null;

  if (!devStatus) {
    console.warn(`target device is not available ${target_id}`);
    return false;
  }
  console.log(`Turning ON ${deviceKey} ${target.name}`);

  let bacnet = target[glDevices.bacnet];

  let object_id =
    target[glDevices.paramGroup][glDeviceSnapShotMap[deviceKey].on_off][
      glDevices.objId
    ];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(deviceKey, target));

    if (!nameHandlerStatus) {
      console.warn(
        `cannot get details from nameHandler file for target: ${target.id}`,
      );
      return false;
    }
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
    action: async () => await read_device(deviceKey, target.id),

    validate: (state) => active_device_states.includes(state),
  });

  if (device_state) {
    console.log(`Device ${deviceKey} turned ON successfully.`);
  } else {
    console.warn(`Failed to turn ON device ${deviceKey}.`);
  }

  return device_state;
}

async function turn_off_device(deviceKey, target_id) {
  const snapshot = await loadSnapshot();
  let device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];
  let nameHandlerStatus = null;

  console.log(
    `turning off device ${glDevices[deviceKey]}: ${device.name}, id:${target_id}`,
  );

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  let bacnet = device[glDevices.bacnet];

  let object_id =
    device[glDevices.paramGroup][glDeviceSnapShotMap[deviceKey].on_off][
      glDevices.objId
    ];
  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(deviceKey, device));
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
    action: async () => await read_device(deviceKey, target_id),

    validate: (state) => inactive_device_states.includes(state),
  });

  if (device_state) {
    console.log(`Device ${deviceKey} turned OFF successfully.`);
  } else {
    console.warn(`Failed to turn OFF device ${deviceKey}.`);
  }

  return device_state;
}

async function read_device(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][glDeviceSnapShotMap[deviceKey].status][
      glDevices.presentValue
    ];

  return device_status;
}

async function read_device_parameter(deviceKey, target_id, param) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const parameter_value =
    device[glDevices.paramGroup][glDeviceSnapShotMap[deviceKey][param]][
      glDevices.presentValue
    ];

  return parameter_value;
}

async function read_ct_fan_device(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][glDeviceSnapShotMap.cool_tower_var_fan.status][
      glDevices.presentValue
    ];

  return device_status;
}

async function read_ct_variable_fan(deviceKey, target_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][glDeviceSnapShotMap.cool_tower_var_fan.status][
      glDevices.presentValue
    ];

  return device_status;
}

async function read_ct_fans(deviceKey, target_id, param_id) {
  console.log(`Reading status of device ${glDevices[deviceKey]}`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][param_id][glDevices.presentValue];

  return device_status;
}

module.exports = {
  turn_on_device,
  turn_off_device,
  read_device,
  read_device_parameter,
  read_ct_fan_device,
  read_ct_variable_fan,
  read_ct_fans,
};
