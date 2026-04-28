const controls = require("../controls");

async function turn_on_ac_chiller(target_id = false) {
  console.log("Action: turn_on_ac_chiller");
  try {
    return await controls.turn_on_device(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_ac_chiller failed. error: ${e}`);
    return false;
  }
}

async function turn_on_wc_chiller(target_id = false) {
  console.log("Action: turn_on_wc_chiller");
  try {
    return await controls.turn_on_device(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_wc_chiller failed. error: ${e}`);
    return false;
  }
}

async function turn_off_ac_chiller(target_id) {
  console.log("Action: turn_off_ac_chiller");
  try {
    return await controls.turn_off_device(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function turn_off_wc_chiller(target_id) {
  console.log("Action: turn_off_wc_chiller");
  try {
    return await controls.turn_off_device(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_wc_chiller failed. error: ${e}`);
    return false;
  }
}

async function turn_on_ac_chiller_valve(target_id) {
  console.log("Action: turn_on_ac_chiller_valve");
  try {
    return await controls.open_chiller_valve(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_ac_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_on_wc_chiller_valve(target_id) {
  console.log("Action: turn_on_wc_chiller_valve");
  try {
    return await controls.open_chiller_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_wc_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_on_wc_chiller_cond_valve(target_id) {
  console.log("Action: turn_on_wc_chiller_valve");
  try {
    return await controls.open_chiller_cond_valve(
      controls.glDevices.wc_chiller,
      target_id,
      true,
    );
  } catch (e) {
    console.error(`Action: turn_on_wc_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_off_ac_chiller_valve(target_id) {
  console.log("Action: turn_off_ac_chiller_valve");
  try {
    return await controls.close_chiller_valve(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_ac_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_off_wc_chiller_valve(target_id) {
  console.log("Action: turn_off_wc_chiller_valve");
  try {
    return await controls.close_chiller_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_wc_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_off_wc_chiller_cond_valve(target_id) {
  console.log("Action: turn_off_wc_chiller_valve");
  try {
    return await controls.close_chiller_cond_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_wc_chiller_valve failed. error: ${e}`);
    return false;
  }
}

async function turn_off_condenser_pump_valve(target_id) {
  console.log("Action: turn_off_condenser_pump_valve");
  try {
    return await controls.close_chiller_cond_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_ac_chiller_status(target_id) {
  console.log("Reading status of AC Chiller");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Reading status of AC Chiller failed. error: ${e}`);
    return false;
  }
}

async function read_wc_chiller_status(target_id) {
  console.log("Reading status of Water Cooled Chiller");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(`Reading status of Water Cooled Chiller failed. error: ${e}`);
    return false;
  }
}

async function read_ac_chiller_valve_status(target_id) {
  console.log("Reading status of AC Chiller Valve");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_ac_chiller_valve_water_flow(target_id) {
  console.log("Reading status of air Cooled Chiller Water flow");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.ac_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_wc_chiller_valve_status(target_id) {
  console.log("Reading status of Water Cooled Chiller Valve");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_wc_chiller_valve_water_flow(target_id) {
  console.log("Reading status of Water Cooled Chiller Water flow");
  try {
    return await controls.read_chiller_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_wc_cond_valve_status(target_id) {
  console.log("Reading status of Water Cooled Chiller Valve");
  try {
    return await controls.read_chiller_cond_valve(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_wc_chiller_cond_valve_water_flow(target_id) {
  console.log("Reading status of Water Cooled Chiller Water flow");
  try {
    return await controls.read_chiller_cond_valve_water_flow(
      controls.glDevices.wc_chiller,
      target_id,
    );
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_wc_chilled_parameter(target_id, parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_handleUIAction(
      controls.glDeviceSnapShotMap.wc_chiller.key,
      target_id,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
    return false;
  }
}

async function read_cooling_tower_parameter(target_id, parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_handleUIAction(
      controls.glDeviceSnapShotMap.cool_tower.key,
      target_id,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
    return false;
  }
}

async function read_ac_chilled_parameter(target_id, parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_handleUIAction(
      controls.glDeviceSnapShotMap.ac_chiller.key,
      target_id,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
    return false;
  }
}

async function turn_on_valves_for_chiller_type(chiller_type, target_id) {
  if (chiller_type === "ac_chiller") {
    return await turn_on_ac_chiller_valve(target_id);
  } else if (chiller_type === "wc_chiller") {
    const eva_valve = await turn_on_wc_chiller_valve(target_id);
    const cond_valve = await turn_on_wc_chiller_cond_valve(target_id);
    return eva_valve && cond_valve;
  } else {
    console.error(`Unknown chiller type: ${chiller_type}`);
    return false;
  }
}

async function turn_off_valves_for_chiller_type(chiller_type, target_id) {
  if (chiller_type === "ac_chiller") {
    return await turn_off_ac_chiller_valve(target_id);
  } else if (chiller_type === "wc_chiller") {
    const eva_valve = await turn_off_wc_chiller_valve(target_id);
    const cond_valve = await turn_off_wc_chiller_cond_valve(target_id);
    return eva_valve && cond_valve;
  } else {
    console.error(`Unknown chiller type: ${chiller_type}`);
    return false;
  }
}

module.exports = {
  turn_on_ac_chiller,
  turn_on_wc_chiller,
  turn_off_ac_chiller,
  turn_off_wc_chiller,
  turn_on_ac_chiller_valve,
  turn_on_wc_chiller_valve,
  turn_on_wc_chiller_cond_valve,
  turn_off_ac_chiller_valve,
  turn_off_wc_chiller_valve,
  turn_off_wc_chiller_cond_valve,
  turn_off_condenser_pump_valve,
  read_ac_chiller_status,
  read_wc_chiller_status,
  read_ac_chiller_valve_status,
  read_ac_chiller_valve_water_flow,
  read_wc_chiller_valve_status,
  read_wc_chiller_valve_water_flow,
  read_wc_cond_valve_status,
  read_wc_chiller_cond_valve_water_flow,
  read_wc_chilled_parameter,
  read_ac_chilled_parameter,
  turn_on_valves_for_chiller_type,
  turn_off_valves_for_chiller_type,
  read_cooling_tower_parameter,
};
