const { glDevices, glDeviceSnapShotMap } = require("./constants");
const { deployed_at, pbs1_port } = require("./config");
const { pollUntil } = require("./utils");
const { loadSnapshot } = require("./snapshot");
const {
  get_bacnet_details_by_gl_code,
  pbsWriteRequest,
  read_handleUIAction,
} = require("./bacnet");
const { read_device } = require("./device_control");

async function read_cpm_head_parameter(deviceKey, parameter) {
  console.log(
    `reading value of ${glDevices[deviceKey]} parameter ${parameter}`,
  );
  return await read_handleUIAction(deviceKey, 0, parameter);
}

async function write_cpm_head_parameter(deviceKey, parameter, value) {
  console.log(
    `writing value: ${value} of ${glDevices[deviceKey]} parameter ${parameter}`,
  );
  const snapshot = await loadSnapshot();
  if (!snapshot) {
    console.warn("Snapshot not available while writing CPM head parameter");
    return false;
  }
  const device = Object.values(snapshot[deviceKey])[0];

  if (!device) {
    console.warn(`requested device is not found in the ${deviceKey} list`);
    return false;
  }

  let bacnet = device[glDevices.bacnet];

  let object_id = device[glDevices.paramGroup][parameter][glDevices.objId];

  if (deployed_at !== "local") {
    ({
      nameHandlerStatus,
      bacnet,
      object_id,
    } = await get_bacnet_details_by_gl_code(deviceKey, device, parameter)),
      parameter;

    if (!nameHandlerStatus) {
      console.warn(
        `cannot get details from nameHandler file for target: ${device.id}`,
      );
      return false;
    }
  }

  if (!object_id) {
    console.error(`Object ID not found for ${deviceKey}`);
    return false;
  }

  const pbs_status = await pbsWriteRequest(pbs1_port, bacnet, object_id, value);

  if (!pbs_status) return false;

  const device_state = await pollUntil({
    action: async () => await read_device(deviceKey, device.id),

    validate: (state) => state === value,
  });

  return true;
}

module.exports = {
  read_cpm_head_parameter,
  write_cpm_head_parameter,
};
