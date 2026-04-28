const {
  glDevices,
  glDeviceSnapShotMap,
  active_device_states,
  inactive_device_states,
} = require("./constants");
const { axiosInstance, pbs1_port, deployed_at } = require("./config");
const { pollUntil } = require("./utils");
const { loadSnapshot } = require("./snapshot");
const { get_name_handler_values } = require("./name_handler");
const { findFunctions } = require("./find_devices");

async function pbsWriteRequest(port, bacnet, objid, value) {
  let requestUrl = `http://localhost:${port}/write/${bacnet}/${objid}/presentValue/${value}`;

  if (deployed_at === "site") {
    requestUrl = `http://127.0.0.1:${port}/write/${bacnet}/${objid}/presentValue/${value}`;
  }

  try {
    const response = await axiosInstance.get(requestUrl);
    console.log(`pbs write request requested: ${requestUrl}`);
    if (response.status !== 200) {
      return false;
    }
    return true;
  } catch (error) {
    console.error(
      `pbs write request failed: ${requestUrl}, error: ${error.message}`,
    );
    return false;
  }
}

async function read_handleUIAction(deviceType, target_id, param_id) {
  console.log(`Reading status of device ${deviceType}, id: ${target_id}`);
  const snapshot = await loadSnapshot();
  let device;
  if (target_id === 0) {
    device = Object.values(snapshot[deviceType])[target_id];
  } else {
    device = snapshot[deviceType][target_id];
  }
  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceType} list, device: ${target_id}`,
    );
    return false;
  }

  const device_status =
    device[glDevices.paramGroup][param_id][glDevices.presentValue];

  return device_status;
}

async function get_bacnet_details_by_gl_code(deviceKey, target, param = false) {
  let nameHandlerStatus = false;
  let id = null;
  let bacnet = null;
  let obj_type = null;
  let obj_name = null;
  let object_id = null;

  if (param) {
    obj_name = target[glDevices.paramGroup][param][glDevices.objectname];
  } else {
    obj_name =
      target[glDevices.paramGroup][glDeviceSnapShotMap[deviceKey].on_off][
        glDevices.objectname
      ];
  }
  ({
    status: nameHandlerStatus,
    id,
    bacnet,
    obj_type,
  } = await get_name_handler_values(obj_name));

  if (nameHandlerStatus) {
    object_id = [obj_type, id].join(":");
  } else {
    console.warn(`cannot get site object id for ${deviceKey} : ${target.id}`);
  }
  return { nameHandlerStatus, bacnet, object_id };
}

async function get_target_device(deviceKey, target_id = false) {
  const snapshot = await loadSnapshot();

  let devStatus = "";
  let target = "";

  if (!snapshot) {
    console.warn("Cannot access the snapshot API!");
    return { devStatus: false, target: null };
  }

  const findDeviceFunc = findFunctions[deviceKey];

  if (!findDeviceFunc) {
    console.error(`No find function defined for device ${deviceKey}`);
    return { devStatus: false, target: null };
  }

  if (!target_id) {
    ({ status: devStatus, device: target } = findDeviceFunc(snapshot));
  } else {
    devStatus = true;
    target = snapshot[glDeviceSnapShotMap[deviceKey].key][target_id];
  }

  if (!devStatus) {
    console.warn(`No ${deviceKey} found to turn ON`);
    return { devStatus: false, target: null };
  }

  return { devStatus, target };
}

async function handleUIActionControl(
  deviceType,
  target_id,
  value,
  action,
  param_id,
) {
  console.log(
    `performing ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
  );
  const snapshot = await loadSnapshot();

  if (typeof action === "string") {
    const v = action.toLowerCase();

    if (v === "turn_on") {
      value = "active";
    } else if (v === "turn_off") {
      value = "inactive";
    } else if (v === "active" || v === "inactive") {
      value = v;
    }
  }
  if (!snapshot) {
    console.warn("cannot get snaphot data!.");
    console.error(
      `failed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
    );
    return false;
  }

  const device = snapshot[deviceType][target_id];

  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceType} list, device: ${target_id}`,
    );
    console.error(
      `failed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
    );
    return false;
  }

  let bacnet = device[glDevices.bacnet];

  let object_id = device[glDevices.paramGroup][param_id][glDevices.objId];

  const devicekeys = Object.keys(glDeviceSnapShotMap);
  const deviceKey = devicekeys.find(
    (key) => glDeviceSnapShotMap[key].key === deviceType,
  );

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(deviceKey, device, param_id));

    if (!nameHandlerStatus) {
      console.warn(
        `cannot get details from nameHandler file for target: ${target_id}`,
      );
      console.error(
        `failed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
      );
      return false;
    }
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceType}`);
    console.error(
      `failed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
    );
    return false;
  }

  const pbs_status = await pbsWriteRequest(pbs1_port, bacnet, object_id, value);

  if (!pbs_status) {
    console.error(
      `failed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
    );
    return false;
  }

  const device_state = await pollUntil({
    action: async () =>
      await read_handleUIAction(deviceType, target_id, param_id),

    validate: (state) => {
      if (value === "active") {
        return active_device_states.includes(state);
      } else {
        return inactive_device_states.includes(state);
      }
    },
  });

  console.log(
    `completed ${action} action for device: ${deviceType} id: ${target_id} parameter: ${param_id} `,
  );

  return device_state;
}

module.exports = {
  pbsWriteRequest,
  read_handleUIAction,
  get_bacnet_details_by_gl_code,
  get_target_device,
  handleUIActionControl,
};
