const controls = require("../controls");

async function turn_on_cooling_tower_valves(target_id, data = {}) {
  console.log("Action: turn_on_cooling tower");
  try {
    return await controls.turn_on_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { outlet: !!data?.outlet, inlet: !!data?.inlet },
    );
  } catch (e) {
    console.error(`Action: turn_on_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_on_cooling_tower_inlet_valve(target_id) {
  console.log("Action: turn_on_cooling tower");
  try {
    return await controls.turn_on_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { inlet: true },
    );
  } catch (e) {
    console.error(`Action: turn_on_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_on_cooling_tower_outlet_valve(target_id) {
  console.log("Action: turn_on_cooling tower");
  try {
    return await controls.turn_on_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { outlet: true },
    );
  } catch (e) {
    console.error(`Action: turn_on_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_on_cooling_towerfan(target_id) {
  console.log("Action: turn_ON_cooling_tower");
  try {
    return await controls.turn_on_cooling_tower_fan(
      controls.glDevices.cool_tower,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_ON_cooling_tower failed. error: ${e}`);
    return false;
  }
}

async function turn_off_cooling_tower_valves(target_id, data = {}) {
  console.log("Action: turn_off_cooling tower value");
  try {
    return await controls.turn_off_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { outlet: !!data?.outlet, inlet: !!data?.inlet },
    );
  } catch (e) {
    console.error(`Action: turn_off_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_off_cooling_tower_inlet_valve(target_id) {
  console.log("Action: turn_off_cooling tower");
  try {
    return await controls.turn_off_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { inlet: true },
    );
  } catch (e) {
    console.error(`Action: turn_off_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_off_cooling_tower_outlet_valve(target_id) {
  console.log("Action: turn_off_cooling tower");
  try {
    return await controls.turn_off_cooling_tower(
      controls.glDevices.cool_tower,
      target_id,
      { outlet: true },
    );
  } catch (e) {
    console.error(`Action: turn_off_cooling failed. error: ${e}`);
    return false;
  }
}

async function turn_off_cooling_towerfan(target_id) {
  console.log("Action: turn_off_cooling_tower");
  try {
    return await controls.turn_off_cooling_tower_fan(
      controls.glDevices.cool_tower,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_cooling_tower failed. error: ${e}`);
    return false;
  }
}

async function read_cooling_tower_status(target_id) {
  console.log("Reading status of Cooling Tower");
  try {
    return await controls.read_device(controls.glDevices.cool_tower, target_id);
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function getCoolingTowerState(target_id) {
  console.log("Getting Cooling Tower State");
  try {
    return await controls.get_cooling_tower_fans_state(
      controls.glDevices.cool_tower,
      target_id,
    );
  } catch (e) {
    console.error(`Getting Cooling Tower State failed. error: ${e}`);
    return false;
  }
}

module.exports = {
  turn_on_cooling_tower_valves,
  turn_on_cooling_tower_inlet_valve,
  turn_on_cooling_tower_outlet_valve,
  turn_on_cooling_towerfan,
  turn_off_cooling_tower_valves,
  turn_off_cooling_tower_inlet_valve,
  turn_off_cooling_tower_outlet_valve,
  turn_off_cooling_towerfan,
  read_cooling_tower_status,
  getCoolingTowerState,
};
