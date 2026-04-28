const controls = require("../controls");

async function turn_on_pri_pump(target_id = false) {
  console.log("Action: turn_on_pri_pump");
  try {
    return await controls.turn_on_device(
      controls.glDevices.prim_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_pri_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_on_sec_pump(target_id = false) {
  console.log("Action: turn_on_sec_pump");
  try {
    return await controls.turn_on_device(
      controls.glDevices.sec_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_sec_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_on_condenser_pump(target_id = false) {
  console.log("Action: turn_on_condenser_pump");
  try {
    return await controls.turn_on_device(
      controls.glDevices.cond_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_condenser_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_on_pri_pump_station(target_id) {
  console.log("Action: turn_on_pri_pump_station");
  try {
    return await controls.turn_on_device(
      controls.glDevices.priv_seq_panel,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_pri_pump_station failed. error: ${e}`);
    return false;
  }
}

async function turn_on_sec_pump_station(target_id) {
  console.log("Action: turn_on_sec_pump_station");
  try {
    return await controls.turn_on_device(
      controls.glDevices.sec_seq_panel,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_sec_pump_station failed. error: ${e}`);
    return false;
  }
}

async function turn_on_prim_var_pump(target_id = false) {
  console.log("Action: turn_on_prim_var_pump");
  try {
    return await controls.turn_on_device(
      controls.glDevices.prim_var_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_on_prim_var_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_off_pri_pump(target_id) {
  console.log("Action: turn_off_pri_pump");
  try {
    return await controls.turn_off_device(
      controls.glDevices.prim_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_pri_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_off_sec_pump(target_id) {
  console.log("Action: turn_off_sec_pump");
  try {
    return await controls.turn_off_device(
      controls.glDevices.sec_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_sec_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_off_condenser_pump(target_id) {
  console.log("Action: turn_off_condenser_pump");
  try {
    return await controls.turn_off_device(
      controls.glDevices.cond_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_condenser_pump failed. error: ${e}`);
    return false;
  }
}

async function turn_off_pri_pump_station(target_id) {
  console.log("Action: turn_off_pri_pump_station");
  try {
    return await controls.turn_off_device(
      controls.glDevices.priv_seq_panel,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_pri_pump_station failed. error: ${e}`);
    return false;
  }
}

async function turn_off_sec_pump_station(target_id) {
  console.log("Action: turn_off_sec_pump_station");
  try {
    return await controls.turn_off_device(
      controls.glDevices.sec_seq_panel,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_sec_pump_station failed. error: ${e}`);
    return false;
  }
}

async function turn_off_prim_var_pump(target_id = false) {
  console.log("Action: turn_off_prim_var_pump");
  try {
    return await controls.turn_off_device(
      controls.glDevices.prim_var_pump,
      target_id,
    );
  } catch (e) {
    console.error(`Action: turn_off_prim_var_pump failed. error: ${e}`);
    return false;
  }
}

async function read_pri_pump_status(target_id) {
  console.log("Reading status of Primary Pump");
  try {
    return await controls.read_device(controls.glDevices.prim_pump, target_id);
  } catch (e) {
    console.error(`Reading status of Primary Pump failed. error: ${e}`);
    return false;
  }
}

async function read_sec_pump_status(target_id) {
  console.log("Reading status of Secondary Pump");
  try {
    return await controls.read_device(controls.glDevices.sec_pump, target_id);
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_cond_pump_status(target_id) {
  console.log("Reading status of Secondary Pump");
  try {
    return await controls.read_device(controls.glDevices.cond_pump, target_id);
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_condenser_pump_status(target_id) {
  console.log("Reading status of Condenser Pump");
  try {
    return await controls.read_device(controls.glDevices.cond_pump, target_id);
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function read_condenser_pump_valve_status(target_id) {
  console.log("Reading status of Condenser Pump Valve");
  try {
    return await controls.read_device(controls.glDevices.cond_pump, target_id);
  } catch (e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  turn_on_pri_pump,
  turn_on_sec_pump,
  turn_on_condenser_pump,
  turn_on_pri_pump_station,
  turn_on_sec_pump_station,
  turn_on_prim_var_pump,
  turn_off_pri_pump,
  turn_off_sec_pump,
  turn_off_condenser_pump,
  turn_off_pri_pump_station,
  turn_off_sec_pump_station,
  turn_off_prim_var_pump,
  read_pri_pump_status,
  read_sec_pump_status,
  read_cond_pump_status,
  read_condenser_pump_status,
  read_condenser_pump_valve_status,
};
