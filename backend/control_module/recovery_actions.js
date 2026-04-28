const actions = require("./actions");
const controls = require("./controls");
const { sleep } = require("./controls/utils");

const pumpActionFunc = {
  cond_pump: {
    read: actions.read_cond_pump_status,
    turn_on: actions.turn_on_condenser_pump,
    turn_off: actions.turn_off_condenser_pump,
    find: controls.find_condenser_pump,
  },
  prim_pump: {
    read: actions.read_pri_pump_status,
    turn_on: actions.turn_on_pri_pump,
    turn_off: actions.turn_off_pri_pump,
    find: controls.find_pri_pump,
  },
  sec_pump: {
    read: actions.read_sec_pump_status,
    turn_on: actions.turn_on_sec_pump,
    turn_off: actions.turn_off_sec_pump,
    find: controls.find_sec_pump,
  },
};

async function turnOffOldCoolingTower(coolingTowerId, data = {}) {
  if (data?.inlet) {
    if (
      !(await actions.turn_off_cooling_tower_valves(coolingTowerId, {
        inlet: true,
      }))
    ) {
      console.log("Failed to turn off inlet valve of cooling tower");
      return false;
    }
    console.log(
      "Successfully turned off inlet valve of tripped/faulty cooling tower",
    );
  }
  if (data?.outlet) {
    if (
      !(await actions.turn_off_cooling_tower_valves(coolingTowerId, {
        outlet: true,
      }))
    ) {
      console.log("Failed to turn off outlet valve of cooling tower");
      return false;
    }
    console.log(
      "Successfully turned off outlet valve of tripped/faulty cooling tower",
    );
  }

  if (!(await actions.turn_off_cooling_towerfan(coolingTowerId))) {
    console.log(
      "Failed to turn off cooling tower fan on tripped/faulty cooling tower",
    );
    return false;
  }

  console.log(
    "Successfully turned off cooling tower fan on tripped/faulty cooling tower",
  );

  return true;
}

async function turnOnNewCoolingTower(newCoolingTower, data = {}) {
  if (data?.inlet) {
    if (
      !(await actions.turn_on_cooling_tower_valves(newCoolingTower.id, {
        inlet: true,
      }))
    ) {
      console.log("Failed to turn on inlet valve of new cooling tower");
      await controls.write_faulty_devices(newCoolingTower.id);
      return false;
    }
  }

  if (data?.outlet) {
    if (
      !(await actions.turn_on_cooling_tower_valves(newCoolingTower.id, {
        outlet: true,
      }))
    ) {
      console.log("Failed to turn on outlet valve of new cooling tower");
      await controls.write_faulty_devices(newCoolingTower.id);
      return false;
    }
  }

  if (data?.fan) {
    if (!(await actions.turn_on_cooling_towerfan(newCoolingTower.id))) {
      console.log("Failed to turn on cooling tower fan on new cooling tower");
      await controls.write_faulty_devices(newCoolingTower.id);
      return false;
    }
  }

  return true;
}

async function replace_cooling_tower(coolingTowerId, data = {}) {
  const cooling_towers = await actions.get_inactive_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );

  if (!cooling_towers || cooling_towers.length === 0) {
    console.log(
      "No new cooling towers available. Turning off old cooling tower.",
    );

    const offStatus = await turnOffOldCoolingTower(coolingTowerId, data);

    return {
      state: offStatus,
      new_id: null,
    };
  }

  for (const newCoolingTower of cooling_towers) {
    const onStatus = await turnOnNewCoolingTower(newCoolingTower, data);

    if (!onStatus) continue;

    const offStatus = await turnOffOldCoolingTower(coolingTowerId, data);

    if (!offStatus) {
      return { state: false, new_id: null };
    }

    console.log(
      `Successfully replaced cooling tower ${coolingTowerId} with new cooling tower ${newCoolingTower.id}`,
    );

    return {
      state: true,
      new_id: newCoolingTower.id,
    };
  }

  return { state: false, new_id: null };
}

async function turnOffOldPump(pumpType, pumpID) {
  const pumpStatus = await pumpActionFunc[pumpType].read(pumpID);

  if (pumpStatus === "inactive") {
    console.log(`${pumpType} pump ${pumpID} is already inactive`);
  }

  if (!(await pumpActionFunc[pumpType].turn_off(pumpID))) {
    console.log(`Failed to turn off ${pumpType} pump ${pumpID}`);
    return false;
  }

  console.log(`Successfully turned off ${pumpType} pump ${pumpID}`);
  return true;
}

async function turnOnNewPump(pumpType, newPump) {
  if (!(await pumpActionFunc[pumpType].turn_on(newPump.id))) {
    console.log(`Failed to turn on new ${pumpType} pump ${newPump.id}`);
    await controls.write_faulty_devices(newPump.id);
    return false;
  }

  console.log(`Successfully turned on new ${pumpType} pump ${newPump.id}`);
  return true;
}

async function replace_pump(pumpType, pumpID) {
  if (!["cond_pump", "prim_pump", "sec_pump"].includes(pumpType) || !pumpID) {
    throw new Error("Invalid pump type or no pump ID provided");
  }

  console.log(`Executing replace ${pumpType} pump...`);

  const pumps = await actions.get_inactive_pumps_and_cool_towers(pumpType);

  if (!pumps || pumps.length === 0) {
    console.log(`No replacement ${pumpType} pumps available`);
    const offStatus = await turnOffOldPump(pumpType, pumpID);

    return {
      state: offStatus,
      new_id: null,
    };
  }

  for (const newPump of pumps) {
    const onStatus = await turnOnNewPump(pumpType, newPump);
    if (!onStatus) continue;

    const offStatus = await turnOffOldPump(pumpType, pumpID);
    if (!offStatus) {
      return { state: false, new_id: null };
    }

    console.log(
      `${pumpType} pump ${pumpID} replaced with new pump ${newPump.id}`,
    );

    return {
      state: true,
      new_id: newPump.id,
    };
  }

  return {
    state: false,
    new_id: null,
  };
}

async function replace_chiller(
  chillerType,
  chillerID,
  chiller = false,
  cond = false,
  eva = false,
) {
  if (chillerType !== "ac_chiller" && chillerType !== "wc_chiller") {
    console.log("Invalid chiller type");
    return { state: false, new_id: null };
  }

  console.log(`Executing replace ${chillerType} chiller...`);

  const chillerActionFunc = {
    ac_chiller: {
      read: actions.read_ac_chiller_status,
      turn_on: actions.turn_on_ac_chiller,
      turn_off: actions.turn_off_ac_chiller,
      valve: {
        eva: {
          open: actions.turn_on_ac_chiller_valve,
          close: actions.turn_off_ac_chiller_valve,
        },
      },
    },
    wc_chiller: {
      read: actions.read_wc_chiller_status,
      turn_on: actions.turn_on_wc_chiller,
      turn_off: actions.turn_off_wc_chiller,
      valve: {
        eva: {
          open: actions.turn_on_wc_chiller_valve,
          close: actions.turn_off_wc_chiller_valve,
        },
        cond: {
          open: actions.turn_on_wc_chiller_cond_valve,
          close: actions.turn_off_wc_chiller_cond_valve,
        },
      },
    },
  };

  if (cond && !chillerActionFunc[chillerType].valve.cond) {
    console.log("Condenser valve is not supported for this chiller type");
    return { state: false, new_id: null };
  }

  const chillers = await actions.get_inactive_chillers(chillerType);

  if (!chillers || chillers.length === 0) {
    console.log(`No replacement ${chillerType} found`);
    return { state: false, new_id: null };
  }

  for (const new_chiller of chillers) {
    if (!new_chiller) {
      console.log(`No replacement ${chillerType} found`);
      return { state: false, new_id: null };
    }
    if (chiller) {
      if (!(await chillerActionFunc[chillerType].turn_on(new_chiller.id))) {
        console.log(`Failed to turn on new ${chillerType} ${new_chiller.id}`);
        await controls.write_faulty_devices(new_chiller.id);
        continue;
      }
    }
    if (cond) {
      if (
        !(await chillerActionFunc[chillerType].valve.cond.open(new_chiller.id))
      ) {
        console.log(
          `Failed to turn on condenser water pump of new ${chillerType} ${new_chiller.id}`,
        );
        await controls.write_faulty_devices(new_chiller.id);
        continue;
      }
    }
    if (eva) {
      if (
        !(await chillerActionFunc[chillerType].valve.eva.open(new_chiller.id))
      ) {
        console.log(
          `Failed to turn on evaporator water valve of new ${chillerType} ${new_chiller.id}`,
        );
        await controls.write_faulty_devices(new_chiller.id);
        continue;
      }
    }

    const chillerStatus = await chillerActionFunc[chillerType].read(chillerID);

    if (chillerStatus !== "inactive") {
      if (!(await chillerActionFunc[chillerType].turn_off(chillerID))) {
        console.log(`Failed to turn off ${chillerType} ${chillerID}`);
        return { state: false, new_id: null };
      }
    } else {
      console.log(`${chillerType} ${chillerID} is already inactive`);
    }

    if (chillerType === "wc_chiller") {
      console.log("Turning off condenser water pump and chiller valves.");
      if (
        !(await chillerActionFunc[chillerType].valve.eva.close(chillerID)) ||
        !(await chillerActionFunc[chillerType].valve.cond.close(chillerID))
      ) {
        console.log(
          "Failed to turn off condenser water pump and chiller valves.",
        );
        return { state: false, new_id: null };
      }
    } else if (chillerType === "ac_chiller") {
      console.log("Turning off AC chiller valves.");
      if (!(await chillerActionFunc[chillerType].valve.eva.close(chillerID))) {
        console.log("Failed to turn off AC chiller valves.");
        return { state: false, new_id: null };
      }
    } else {
      console.log("Invalid chiller type provided");
      return { state: false, new_id: null };
    }

    console.log(
      `Successfully replaced ${chillerType} with new chiller ${new_chiller.id}`,
    );
    return { state: true, new_id: new_chiller.id };
  }
  return { state: false, new_id: null };
}

async function replace_wc_chiller(TrippedChillerID) {
  let state = false;
  const snapshot = await controls.loadSnapshot();

  const { status: chillerStatus, device: chiller } = controls.find_wc_chiller(
    snapshot,
  );

  const {
    status: condenserPumpStatus,
    device: condenserPump,
  } = controls.find_condenser_pump(snapshot);

  const { status: priPumpStatus, device: priPump } = controls.find_pri_pump(
    snapshot,
  );

  if (!chillerStatus || !condenserPumpStatus || !priPumpStatus) {
    console.log("no devices are found to perform replace");
    return false;
  }

  let ChillerId = chiller.id;
  let CondenserId = condenserPump.id;
  let PrimPumpId = priPump.id;

  const CondPumpOn = await actions.turn_on_condenser_pump(CondenserId);

  if (!CondPumpOn) {
    ({ state, new_id: CondenserId } = await set_device_state_fault(
      controls.glDevices.cond_pump,
      CondenserId,
    ));

    if (!state) {
      return false;
    }
  }

  const ChillerValueOpen = await actions.turn_on_wc_chiller_cond_valve(
    ChillerId,
  );
  if (!ChillerValueOpen) {
    ({ state, new_id: ChillerId } = await set_device_state_fault(
      controls.glDevices.wc_chiller,
      ChillerId,
    ));

    if (!state) {
      return false;
    }
  }

  const PrimpPumpOn = await actions.turn_on_pri_pump(PrimPumpId);
  if (!PrimpPumpOn) {
    ({ state, new_id: PrimPumpId } = await set_device_state_fault(
      controls.glDevices.prim_pump,
      PrimPumpId,
    ));

    if (!state) {
      return false;
    }
  }

  const ChillerEvapOpen = await actions.turn_on_wc_chiller_valve(ChillerId);
  if (!ChillerEvapOpen) {
    ({ state, new_id: ChillerId } = await set_device_state_fault(
      controls.glDevices.wc_chiller,
      ChillerId,
      { eva: true, cond: true },
    ));

    if (!state) {
      return false;
    }
  }

  const ChillerOn = await actions.turn_on_wc_chiller(ChillerId);
  if (!ChillerOn) {
    ({ state, new_id: ChillerId } = await set_device_state_fault(
      controls.glDevices.wc_chiller,
      ChillerId,
      { cond: true, eva: true, chiller: true },
    ));

    if (!state) return false;
  }

  await sleep(80000);

  const TrippedChillerOff = await actions.turn_off_wc_chiller(TrippedChillerID);
  if (!TrippedChillerOff) return false;

  const TrippedEvapClose = await actions.turn_off_wc_chiller_valve(
    TrippedChillerID,
  );
  if (!TrippedEvapClose) return false;

  const TrippedCondClose = await actions.turn_off_wc_chiller_cond_valve(
    TrippedChillerID,
  );

  if (!TrippedCondClose) return false;

  const cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );
  const prim_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );

  if (!cond_pumps || cond_pumps.length === 0) {
    console.log("No active condenser pumps found to turn off");
    return false;
  }
  if (!prim_pumps || prim_pumps.length === 0) {
    console.log("No active primary pumps found to turn off");
    return false;
  }

  const max_running_cond_pumps = controls.getMaxRunHourDevice(cond_pumps);
  const max_running_prim_pumps = controls.getMaxRunHourDevice(prim_pumps);

  const condenserPumpId = max_running_cond_pumps?.id || cond_pumps[0].id;
  const primaryPumpId = max_running_prim_pumps?.id || prim_pumps[0].id;

  const MaxCondPumpOff = await actions.turn_off_condenser_pump(condenserPumpId);

  if (!MaxCondPumpOff) return false;

  const MaxPrimPumpOff = await actions.turn_off_pri_pump(primaryPumpId);

  if (!MaxPrimPumpOff) return false;

  return true;
}

async function set_device_state_fault(deviceType, deviceId, data = {}) {
  if (!deviceType || !deviceId) {
    console.log("Invalid device type or no device ID provided");
    return { state: false, new_id: null };
  }

  console.log(
    `Setting device ${deviceId} of type ${deviceType} to fault state`,
  );
  const ss_id = deviceId;
  const alarm_code = 199;
  const measured_time = new Date();
  const param_id = deviceType;
  const message = `Device ${deviceId} of type ${deviceType} marked as faulty for failed in CPM`;

  await actions.insert_into_faulty_devices(
    ss_id,
    alarm_code,
    measured_time,
    param_id,
    message,
  );

  console.log(`Device ${deviceId} marked as faulty in the system`);

  console.log(`Initiating replacement procedure for device ${deviceId}`);
  switch (deviceType) {
    case "cond_pump":
      return await replace_pump(deviceType, deviceId);
    case "prim_pump":
      return await replace_pump(deviceType, deviceId);
    case "sec_pump":
      return await replace_pump(deviceType, deviceId);
    case "cool_tower":
      return await replace_cooling_tower(deviceId, data);
    case "chiller":
    case "ac_chiller":
    case "wc_chiller": {
      const chillerType = data?.chillerType || data?.chiller_type || deviceType;
      if (!chillerType || chillerType === "chiller") {
        console.log("Missing chiller type for replacement");
        return { state: false, new_id: null };
      }
      return await replace_chiller(
        chillerType,
        deviceId,
        data.chiller,
        data.cond,
        data.eva,
      );
    }
    default:
      console.log("Unsupported device type for setting fault state");
      return { state: false, new_id: null };
  }
}

module.exports = {
  replace_pump,
  replace_cooling_tower,
  replace_chiller,
  set_device_state_fault,
  replace_wc_chiller,
};
