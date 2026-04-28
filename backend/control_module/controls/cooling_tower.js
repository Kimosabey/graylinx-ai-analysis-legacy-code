const {
  glDevices,
  glDeviceSnapShotMap,
  active_device_states,
  inactive_device_states,
} = require("./constants");
const { deployed_at, pbs1_port } = require("./config");
const { pollUntil, sleep } = require("./utils");
const { loadSnapshot } = require("./snapshot");
const { get_target_device, get_bacnet_details_by_gl_code, pbsWriteRequest } = require("./bacnet");
const { read_ct_fan_device, read_ct_fans } = require("./device_control");

const cool_tower_fan_on_off_parameters_type_2 = (parameters) => {
  const regex = /^CT_VAR_FAN_\d+_On_Off_Cmd$/;
  const regex2 = /^cmd_fan_on_off_\d\d$/;

  const regex_result = parameters.filter((param) => regex.test(param));
  if (regex_result.length > 0) {
    return { type: 'old', result: regex_result?.length };
  }

  const regex_result_2 = parameters.filter((param) => regex2.test(param));
  if (regex_result_2.length > 0) {
    return { type: 'new', result: regex_result_2?.length };
  }
  return { type: null, result: null };
};

async function turn_on_cooling_tower_inlet_valve(deviceKey, target_id) {
  console.log(`Turning ON ${deviceKey} ${target_id} inlet valve`);

  const snapshot = await loadSnapshot();

  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `device: ${target_id} is not found in deviceType: ${deviceKey}`,
    );
  }

  let bacnet = device[glDevices.bacnet];
  let nameHandlerStatus = "";

  let object_id =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].inlet_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({ nameHandlerStatus, bacnet, object_id } = await get_bacnet_details_by_gl_code(
      deviceKey,
      device,
      glDeviceSnapShotMap[deviceKey].inlet_valve_on_off,
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
    action: async () =>
      await read_cooling_tower_valve(
        deviceKey,
        target_id,
        glDeviceSnapShotMap[deviceKey].inlet_valve_status,
      ),

    validate: (state) => active_device_states.includes(state),
  });

  return device_state;
}

async function turn_on_cooling_tower_outlet_valve(deviceKey, target_id) {
  console.log(`Turning ON ${deviceKey} ${target_id} outlet valve`);

  const snapshot = await loadSnapshot();

  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];
  if (!device) {
    console.warn(
      `device: ${target_id} is not found in deviceType: ${deviceKey}`,
    );
  }

  let bacnet = device[glDevices.bacnet];
  let nameHandlerStatus = "";

  let object_id =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].outlet_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      device,
      glDeviceSnapShotMap[deviceKey].outlet_valve_on_off,
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
    action: async () =>
      await read_cooling_tower_valve(
        deviceKey,
        target_id,
        glDeviceSnapShotMap[deviceKey].outlet_valve_status,
      ),

    validate: (state) => active_device_states.includes(state),
  });

  return device_state;
}

async function turn_off_cooling_tower_inlet_valve(deviceKey, target_id) {
  console.log(`Turning ON ${deviceKey} ${target_id} inlet valve`);
  const snapshot = await loadSnapshot();

  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  if (!device) {
    console.warn(
      `device: ${target_id} is not found in deviceType: ${deviceKey}`,
    );
  }

  let bacnet = device[glDevices.bacnet];
  let nameHandlerStatus = "";

  let object_id =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].inlet_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      device,
      glDeviceSnapShotMap[deviceKey].inlet_valve_on_off,
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
    action: async () =>
      await read_cooling_tower_valve(
        deviceKey,
        target_id,
        glDeviceSnapShotMap[deviceKey].inlet_valve_status,
      ),

    validate: (state) => inactive_device_states.includes(state),
  });

  return device_state;
}

async function turn_off_cooling_tower_outlet_valve(deviceKey, target_id) {
  console.log(`Turning ON ${deviceKey} ${target_id} outlet valve`);
  const snapshot = await loadSnapshot();
  const device = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];

  let bacnet = device[glDevices.bacnet];
  let nameHandlerStatus = "";

  let object_id =
    device[glDevices.paramGroup][
      glDeviceSnapShotMap[deviceKey].outlet_valve_on_off
    ][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(
      deviceKey,
      device,
      glDeviceSnapShotMap[deviceKey].outlet_valve_on_off,
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
    action: async () =>
      await read_cooling_tower_valve(
        deviceKey,
        target_id,
        glDeviceSnapShotMap[deviceKey].outlet_valve_status,
      ),

    validate: (state) => inactive_device_states.includes(state),
  });

  return device_state;
}

async function read_cooling_tower_valve(deviceKey, target_id, param) {
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
    device[glDevices.paramGroup][param][glDevices.presentValue];

  return device_status;
}

async function turn_on_cooling_tower(deviceKey, target_id, data = {}) {
  if (data?.inlet) {
    if (!(await turn_on_cooling_tower_inlet_valve(deviceKey, target_id))) {
      console.warn(
        `inlet valve is not opened for device: ${deviceKey} ${target_id}`,
      );
      return false;
    }
  }
  if (data?.outlet) {
    if (!(await turn_on_cooling_tower_outlet_valve(deviceKey, target_id))) {
      console.warn(
        `outlet valve is not opened for device: ${deviceKey} ${target_id}`,
      );
      return false;
    }
  }

  return true;
}

async function turn_off_cooling_tower(deviceKey, target_id, data = {}) {
  if (data?.inlet) {
    if (!(await turn_off_cooling_tower_inlet_valve(deviceKey, target_id))) {
      console.warn(
        `inlet valve is not opened for device: ${deviceKey} ${target_id}`,
      );
      return false;
    }
  }
  if (data?.outlet) {
    if (!(await turn_off_cooling_tower_outlet_valve(deviceKey, target_id))) {
      console.warn(
        `outlet valve is not opened for device: ${deviceKey} ${target_id}`,
      );
      return false;
    }
  }
  return true;
}

async function turn_on_cooling_tower_fan(deviceKey, target_id) {
  const { devStatus, target } = await get_target_device(deviceKey, target_id);
  let groupedParams = {};

  if (!devStatus) {
    console.warn(
      `target device is not available, device: ${deviceKey}, id: ${target_id}`,
    );
    return false;
  }

  const ct_parameters = Object.keys(target[glDevices.paramGroup]);

  let { type, result: no_of_fan } = cool_tower_fan_on_off_parameters_type_2(ct_parameters);

  if (no_of_fan !== null && no_of_fan > 1) {
    for (let i = 1; i <= no_of_fan; i++) {
      const fan_no = `fan_${i}`;
      groupedParams[fan_no] = [];
      if (type === 'old') {
        groupedParams[fan_no].push(
          `CT_VAR_FAN_${i}_On_Off_Cmd`,
          `CT_Var_Fan_${i}_Auto_on`,
          `CT_VAR_FAN_${i}_RUN_SS`,
        );
      } else if (type === 'new') {
        groupedParams[fan_no].push(
          `cmd_fan_on_off_0${i}`,
          `sts_fan_auto_manual_0${i}`,
          `sts_fan_on_off_0${i}`
        );
      }
    }
  }

  let bacnet = target[glDevices.bacnet];

  if (Object.keys(groupedParams).length > 0) {
    for (const index in groupedParams) {
      const fan = groupedParams[index];

      const fanCheck = await read_ct_fans(deviceKey, target.id, fan[2]);

      if (fanCheck === "active") {
        console.log(
          `Fan ${index} is already ON for device: ${deviceKey} ${target_id}`,
        );
        continue;
      }

      let object_id = target[glDevices.paramGroup][fan[0]][glDevices.objId];

      if (deployed_at !== "local") {
        ({
          nameHandlerStatus,
          bacnet,
          object_id,
        } = await get_bacnet_details_by_gl_code(deviceKey, target, fan[0]));
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
        action: async () => await read_ct_fans(deviceKey, target.id, fan[2]),

        validate: (state) => active_device_states.includes(state),
      });

      if (!device_state) {
        return false;
      }
    }
    return true;
  } else {
    let object_id =
      target[glDevices.paramGroup][glDeviceSnapShotMap.cool_tower_var_fan.on_off][
        glDevices.objId
      ];

    if (deployed_at !== "local") {
      ({
        nameHandlerStatus,
        bacnet,
        object_id,
      } = await get_bacnet_details_by_gl_code(
        deviceKey,
        target,
        glDeviceSnapShotMap.cool_tower_var_fan.on_off,
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
      action: async () => await read_ct_fan_device(deviceKey, target.id),

      validate: (state) => active_device_states.includes(state),
    });

    return device_state;
  }
}

async function turn_off_cooling_tower_fan(deviceKey, target_id) {
  const { devStatus, target } = await get_target_device(deviceKey, target_id);
  let groupedParams = {};

  if (!devStatus) {
    console.warn(
      `target device is not available, device: ${deviceKey}, id: ${target_id}`,
    );
    return false;
  }

  const ct_parameters = Object.keys(target[glDevices.paramGroup]);

  let { type, result: no_of_fan } = cool_tower_fan_on_off_parameters_type_2(ct_parameters);

  if (no_of_fan !== null && no_of_fan > 1) {
    for (let i = 1; i <= no_of_fan; i++) {
      const fan_no = `fan_${i}`;
      groupedParams[fan_no] = [];
      if (type === 'old') {
        groupedParams[fan_no].push(
          `CT_VAR_FAN_${i}_On_Off_Cmd`,
          `CT_Var_Fan_${i}_Auto_on`,
          `CT_VAR_FAN_${i}_RUN_SS`,
        );
      } else if (type === 'new') {
        groupedParams[fan_no].push(
          `cmd_fan_on_off_0${i}`,
          `sts_fan_auto_manual_0${i}`,
          `sts_fan_on_off_0${i}`
        );
      }
    }
  }

  let bacnet = target[glDevices.bacnet];

  if (Object.keys(groupedParams).length > 0) {
    for (const index in groupedParams) {
      const fan = groupedParams[index];

      const fanCheck = await read_ct_fans(deviceKey, target.id, fan[2]);

      if (fanCheck === "inactive") {
        console.log(
          `Fan ${index} is already ON for device: ${deviceKey} ${target_id}`,
        );
        continue;
      }

      let object_id = target[glDevices.paramGroup][fan[0]][glDevices.objId];

      if (deployed_at !== "local") {
        ({
          nameHandlerStatus,
          bacnet,
          object_id,
        } = await get_bacnet_details_by_gl_code(deviceKey, target, fan[0]));
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
        action: async () => await read_ct_fans(deviceKey, target.id, fan[2]),

        validate: (state) => inactive_device_states.includes(state),
      });

      if (!device_state) {
        return false;
      }
    }
    return true;
  } else {
    let object_id =
      target[glDevices.paramGroup][glDeviceSnapShotMap.cool_tower_var_fan.on_off][
        glDevices.objId
      ];

    if (deployed_at !== "local") {
      ({
        nameHandlerStatus,
        bacnet,
        object_id,
      } = await get_bacnet_details_by_gl_code(deviceKey, target,
        glDeviceSnapShotMap.cool_tower_var_fan.on_off
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
      action: async () => await read_ct_fan_device(deviceKey, target.id),

      validate: (state) => inactive_device_states.includes(state),
    });

    return device_state;
  }
}

async function get_cooling_tower_fans_state(deviceType, target_id) {
  const { devStatus, target } = await get_target_device(deviceType, target_id);
  let groupedParams = {};

  if (!devStatus) {
    console.warn(
      `target device is not available, device: ${deviceType}, id: ${target_id}`,
    );
    return false;
  }

  const ct_parameters = Object.keys(target[glDevices.paramGroup]);
  let { type, result: no_of_fan } = cool_tower_fan_on_off_parameters_type_2(ct_parameters);
  let fan_status = true;
  if (no_of_fan > 1) {
    for (let i = 1; i <= no_of_fan; i++) {
      const fan_no = `fan_${i}`;
      groupedParams[fan_no] = [];
      if (type === 'old') {
        groupedParams[fan_no].push(
          `CT_VAR_FAN_${i}_On_Off_Cmd`,
          `CT_Var_Fan_${i}_Auto_on`,
          `CT_VAR_FAN_${i}_RUN_SS`,
        );
      } else if (type === 'new') {
        groupedParams[fan_no].push(
          `cmd_fan_on_off_0${i}`,
          `sts_fan_auto_manual_0${i}`,
          `sts_fan_on_off_0${i}`
        );
      }
    }
  }

  if (Object.keys(groupedParams).length === 0) {
    const device_state = await read_ct_fan_device(deviceType, target_id);
    return device_state && device_state !== "inactive";
  }

  for (const index in groupedParams) {
    const fan = groupedParams[index];
    const param_id = fan[2];
    const device_state = await read_ct_fans(deviceType, target_id, param_id);
    await sleep(1000);
    if (!device_state || device_state === "inactive") {
      fan_status = false;
      break;
    }
  }
  return fan_status;
}

module.exports = {
  turn_on_cooling_tower_inlet_valve,
  turn_on_cooling_tower_outlet_valve,
  turn_off_cooling_tower_inlet_valve,
  turn_off_cooling_tower_outlet_valve,
  read_cooling_tower_valve,
  turn_on_cooling_tower,
  turn_off_cooling_tower,
  turn_on_cooling_tower_fan,
  turn_off_cooling_tower_fan,
  get_cooling_tower_fans_state,
};
