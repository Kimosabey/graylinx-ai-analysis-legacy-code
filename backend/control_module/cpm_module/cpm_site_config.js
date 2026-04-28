require("dotenv").config();
const controls = require("../controls");
const scenarios = require("./scenarios");
const actions = require("../actions");
const recoverActions = require("../recovery_actions");

function set_cpm_step(status, step) {
  controls.cpm_step_status.status = status;
  controls.cpm_step_status.step = step;
  controls.cpm_step_status.updated_at = new Date().toISOString();
}

async function reset_counters() {
  const reset_keys = Object.keys(
    controls.cpm_execution_check_point.duration_seconds,
  );
  await Promise.all(
    reset_keys.map((key) => controls.update_duration_seconds(key, 0)),
  );
  return true;
}

async function step_start_primary_secondary_wc_chiller_plant() {
  set_cpm_step("busy", "starting_chiller_plant");
  console.log("Starting chilled plant...");

  const action_result = await scenarios.start_watercooled_primary_secondary_stations_2_system();
  if (action_result) {
    console.log("Chilled plant started successfully on CPM is ON.");
    controls.cpm_state = "start";
    set_cpm_step("idle", "monitoring");
    return true;
  } else {
    console.error("Error starting watercooled primary secondary system:");
    console.log(
      "Failed to start chilled plant on CPM is ON so turning off the chiller plant.",
    );
    await step_stop_primary_secondary_wc_chiller_plant();
    return false;
  }
}

async function step_stop_primary_secondary_wc_chiller_plant() {
  set_cpm_step("busy", "stopping_chiller_plant");
  console.log(
    "Stopping chilled plant and putting plant cpm mode to inactive...",
  );
  await actions.set_cpm_mode_on_off("inactive");
  controls.cpm_state = null;

  try {
    await scenarios.stop_watercooled_primary_secondary_2_stations();
    console.log("Chilled plant stopped successfully on CPM is OFF.");
    set_cpm_step("idle", null);
    await reset_counters();
    return true;
  } catch (error) {
    console.error(
      "Error stopping watercooled primary secondary system:",
      error,
    );
    set_cpm_step("idle", null);
    await reset_counters(); // fix: reset counters even on stop failure since cpm_state is already null
    return false;
  }
}

async function step_add_primary_secondary_wc_chiller() {
  set_cpm_step("busy", "adding_chiller");
  console.log("adding chiller system...");

  const action_state = await scenarios.add_watercooled_primary_secondary_scenario();

  if (action_state) {
    console.log("chiller added successfully on condition met.");
    set_cpm_step("idle", "monitoring");
    return true;
  } else {
    console.error("Error adding watercooled chiller:");
    console.log(
      "Failed to add chiller on condition met so turning off the chiller plant.",
    );
    set_cpm_step("idle", "monitoring");
    return false;
  }
}

async function step_substract_primary_secondary_wc_chiller() {
  set_cpm_step("busy", "removing_chiller");
  console.log("removing chiller system...");

  const action_state = await scenarios.substract_watercooled_primary_secondary_scenario();
  if (action_state) {
    console.log("chiller removed successfully on condition met.");
    set_cpm_step("idle", "monitoring");
    return true;
  } else {
    console.error("Error removing watercooled chiller:");
    console.log(
      "Failed to remove chiller on condition met so turning off the chiller plant.",
    );
    set_cpm_step("idle", "monitoring");
    return false;
  }
}

async function monitor_motor_percent_fla() {
  const add_threshold_value = await actions.read_manual_mode_status(
    "add_threshold",
  );
  const remove_threshold_value = await actions.read_manual_mode_status(
    "remove_threshold",
  );
  if (!add_threshold_value || !remove_threshold_value) {
    console.log("add/remove threshold value is not set!.");
    return true;
  }
  if (controls.cpm_state == null) {
    return true;
  }
  set_cpm_step("busy", "monitoring_compressor_load");
  console.log(
    "Monitoring CHW setpoint and compressor load for chiller addition/removal...",
  );

  const POLL_INTERVAL_SECONDS = 15;
  const threshold_seconds = 15 * 60;

  const active_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  if (!active_chillers.length) {
    console.log("No active chillers found in snapshot. Cannot proceed.");
    set_cpm_step("idle", "monitoring");
    return false;
  }

  const comp_load_readings = await Promise.all(
    active_chillers.flatMap((chiller) => [
      actions.read_wc_chilled_parameter(chiller.id, "par_comp_percent_load_00"),
    ]),
  );

  const valid_loads = comp_load_readings.filter(
    (v) => v !== false && v !== null && v !== undefined,
  );

  if (valid_loads.length === 0) {
    console.log(
      "No valid compressor load readings available, skipping this poll.",
    );
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const avg_comp_load =
    valid_loads.reduce((sum, v) => sum + Number(v), 0) / valid_loads.length;

  console.log(`Total compressor load: ${avg_comp_load.toFixed(1)}%`);

  // ADD condition
  let wc_chiller_add_condition_duration = await controls.get_duration_seconds(
    "wc_chiller_add_condition_duration",
  );

  const addConditionMet = avg_comp_load > Number(add_threshold_value);

  if (addConditionMet) {
    console.log(
      `Chiller add condition met.Total comp load: ${avg_comp_load.toFixed(1)}%`,
    );

    // console.log(`Total comp load: ${avg_comp_load.toFixed(1)}%`);

    wc_chiller_add_condition_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds(
      "wc_chiller_add_condition_duration",
      wc_chiller_add_condition_duration,
    );

    if (wc_chiller_add_condition_duration >= threshold_seconds) {
      if (active_chillers.length >= 2) {
        console.log("Max chillers already running, skipping add");
        await controls.update_duration_seconds(
          "wc_chiller_add_condition_duration",
          0,
        );
        set_cpm_step("idle", "monitoring");
        return true;
      }

      console.log(
        "Add condition sustained for threshold duration. Adding chiller...",
      );
      await step_add_primary_secondary_wc_chiller();
      await controls.update_duration_seconds(
        "wc_chiller_add_condition_duration",
        0,
      );
      return true;
    }
  } else {
    if (wc_chiller_add_condition_duration !== 0) {
      console.log("Chiller add condition broken. Resetting counter.");
    }
    await controls.update_duration_seconds(
      "wc_chiller_add_condition_duration",
      0,
    );
  }

  // REMOVE condition
  const REMOVE_THRESHOLD = Number(remove_threshold_value);
  let wc_chiller_remove_condition_duration = await controls.get_duration_seconds(
    "wc_chiller_remove_condition_duration",
  );

  if (active_chillers.length <= 1) {
    console.log(
      "Only one or no active chillers found. No removal possible. Skipping removal check.",
    );
    await controls.update_duration_seconds(
      "wc_chiller_remove_condition_duration",
      0,
    );
    set_cpm_step("idle", "monitoring");
    return true;
  }

  if (avg_comp_load < REMOVE_THRESHOLD) {
    console.log(
      `Removal condition met: Total comp load ${avg_comp_load.toFixed(
        1,
      )}% < ${REMOVE_THRESHOLD}%`,
    );

    wc_chiller_remove_condition_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds(
      "wc_chiller_remove_condition_duration",
      wc_chiller_remove_condition_duration,
    );

    if (wc_chiller_remove_condition_duration >= threshold_seconds) {
      console.log(
        "Removal condition sustained for threshold duration. Removing chiller.",
      );
      await step_substract_primary_secondary_wc_chiller();
      await controls.update_duration_seconds(
        "wc_chiller_remove_condition_duration",
        0,
      );
      return true;
    }
  } else {
    await controls.update_duration_seconds(
      "wc_chiller_remove_condition_duration",
      0,
    );
  }

  set_cpm_step("idle", "monitoring");
  return true;
}

async function start_cooling_tower(coolingTowerId) {
  const is_values_opened = await actions.turn_on_cooling_tower_valves(
    coolingTowerId,
    { inlet: true },
  );
  let valve_status = is_values_opened;
  if (!is_values_opened) {
    ({
      state: valve_status,
      new_id: coolingTowerId,
    } = await recoverActions.set_device_state_fault(
      controls.glDevices.cool_tower,
      coolingTowerId,
      { inlet: true },
    ));
  }
  if (!valve_status || !coolingTowerId) {
    console.log(
      "opening cooling tower valve failed, start cooling tower is failed",
    );
    return false;
  }

  const is_fan_on = await actions.turn_on_cooling_towerfan(coolingTowerId);
  let fan_status = is_fan_on;
  if (!is_fan_on) {
    ({
      state: fan_status,
      new_id: coolingTowerId,
    } = await recoverActions.set_device_state_fault(
      controls.glDevices.cool_tower,
      coolingTowerId,
      { fan: true, inlet: true },
    ));
  }

  if (!fan_status) {
    console.log(
      "starting cooling tower fan failed, start cooling tower is failed",
    );
    return false;
  }

  console.log("start cooling tower is success");

  return true;
}

async function stop_cooling_tower(coolingTowerId) {
  const is_values_closed = await actions.turn_off_cooling_tower_valves(
    coolingTowerId,
    { inlet: true },
  );

  if (!is_values_closed) {
    console.log(
      "closing cooling tower valve failed, stop cooling tower is failed",
    );
    return false;
  }

  const is_fan_off = await actions.turn_off_cooling_towerfan(coolingTowerId);

  if (!is_fan_off) {
    console.log(
      "stopping cooling tower fan failed, stop cooling tower is failed",
    );
    return false;
  }

  console.log("stop cooling tower is success");

  return true;
}

async function staging_cooling_towers() {
  if (controls.cpm_state == null) {
    return true;
  }
  set_cpm_step("busy", "staging_cooling_towers");
  console.log("Monitoring VFD Command to stage the cooling towers");

  let vfd_command_frequency_duration_seconds = 0;

  let operation = null;

  const VFD_THRESHOLD = 600;

  const active_cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );

  const active_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  const no_of_active_cool_towers = active_cooling_towers?.length;
  const no_of_active_chillers = active_chillers?.length;

  if (!no_of_active_chillers || !no_of_active_cool_towers) {
    console.log(
      "no chiller and no cooling towers running skipping add cooling tower check step",
    );
    await controls.update_duration_seconds("vfd_command_frequency_duration", 0);
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const tower_to_chiller_ratio =
    no_of_active_cool_towers / no_of_active_chillers;

  const vfd_command_value = await Promise.all(
    active_cooling_towers.flatMap((tower) => [
      actions.read_cooling_tower_parameter(tower.id, "cmd_fan_frequency_00"),
    ]),
  );

  const valid_vfd_values = vfd_command_value.filter(
    (v) => v !== false && v !== null && v !== undefined,
  );

  if (valid_vfd_values.length === 0) {
    console.log("no valid VFD readings available, skipping staging check");
    await controls.update_duration_seconds("vfd_command_frequency_duration", 0);
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const avg_vfd_command_value =
    valid_vfd_values.reduce((sum, v) => sum + Number(v), 0) /
    valid_vfd_values.length;

  const cond_set_point_value = await actions.read_common_header_parameter(
    "cmd_cdw_sup_temp_00",
  );

  const cond_water_return_temp_value = await actions.read_common_header_parameter(
    "par_cdw_ret_temp_00",
  );

  if (
    tower_to_chiller_ratio >= 1 &&
    tower_to_chiller_ratio < 2 &&
    avg_vfd_command_value > 40
  ) {
    vfd_command_frequency_duration_seconds = await controls.get_duration_seconds(
      "vfd_command_frequency_duration",
    );
    vfd_command_frequency_duration_seconds += 15;
    await controls.update_duration_seconds(
      "vfd_command_frequency_duration",
      vfd_command_frequency_duration_seconds,
    );
    operation = "add";
  } else if (
    tower_to_chiller_ratio > 1 &&
    avg_vfd_command_value < 40 &&
    Math.abs(
      Number(cond_set_point_value) - Number(cond_water_return_temp_value),
    ) < 1.3
  ) {
    vfd_command_frequency_duration_seconds = await controls.get_duration_seconds(
      "vfd_command_frequency_duration",
    );
    vfd_command_frequency_duration_seconds += 15;
    await controls.update_duration_seconds(
      "vfd_command_frequency_duration",
      vfd_command_frequency_duration_seconds,
    );
    operation = "remove";
  } else {
    await controls.update_duration_seconds("vfd_command_frequency_duration", 0);
    operation = null;
  }

  if (vfd_command_frequency_duration_seconds > VFD_THRESHOLD) {
    if (operation === "add") {
      console.log("cooling tower add condition met, adding CT");
      const fresh_snapshot = await controls.loadSnapshot();
      const {
        status: coolingTowerStatus,
        device: coolingTower,
      } = controls.find_cooling_tower(fresh_snapshot);

      if (!coolingTowerStatus) {
        console.log("no cooling towers are available for to add");
        set_cpm_step("idle", "monitoring");
        return false;
      }

      const add_ct = await start_cooling_tower(coolingTower.id);
      await controls.update_duration_seconds(
        "vfd_command_frequency_duration",
        0,
      );

      if (!add_ct) {
        console.log("adding cooling tower is failed");
        set_cpm_step("idle", "monitoring");
        return false;
      }
      console.log("successfully added cooling tower");
      set_cpm_step("idle", "monitoring");
      return true;
    } else if (operation === "remove" && no_of_active_cool_towers > 1) {
      console.log("cooling tower remove condition met, removing CT");
      const active_cooling_towers_for_remove = await actions.get_active_pumps_and_cool_towers(
        controls.glDevices.cool_tower,
      );

      if (active_cooling_towers_for_remove.length <= 1) {
        console.log("not enough active cooling towers for removal, skipping");
        await controls.update_duration_seconds(
          "vfd_command_frequency_duration",
          0,
        );
        set_cpm_step("idle", "monitoring");
        return true;
      }

      const coolingTowerRemove = controls.getMaxRunHourDevice(
        active_cooling_towers_for_remove,
      );

      if (!coolingTowerRemove) {
        console.log("could not determine cooling tower to remove");
        set_cpm_step("idle", "monitoring");
        return false;
      }

      const remove_ct = await stop_cooling_tower(coolingTowerRemove.id);
      await controls.update_duration_seconds(
        "vfd_command_frequency_duration",
        0,
      );
      if (!remove_ct) {
        console.log("subtracting cooling tower is failed");
        set_cpm_step("idle", "monitoring");
        return false;
      }
      console.log("successfully subtracted cooling tower");
      set_cpm_step("idle", "monitoring");
      return true;
    } else if (operation === "remove" && no_of_active_cool_towers <= 1) {
      console.log(
        "Remove condition met but only one cooling tower active. Skipping removal, resetting counter.",
      );
      await controls.update_duration_seconds(
        "vfd_command_frequency_duration",
        0,
      );
    }
  }

  set_cpm_step("idle", "monitoring");
  return true;
}

function appendReplaceLog(device_type, tripped_device, replaced_with, success) {
  const entry = {
    device_type,
    tripped_device,
    replaced_with: replaced_with || null,
    success,
    timestamp: new Date().toISOString(),
  };
  controls.cpm_replace_status.replace_log.push(entry);
  if (
    controls.cpm_replace_status.replace_log.length >
    controls.MAX_REPLACE_LOG_SIZE
  ) {
    controls.cpm_replace_status.replace_log.shift();
  }
}

async function monitor_and_replace_tripped_devices() {
  set_cpm_step("busy", "monitor_and_replace_tripped_devices");
  const snapshot = await controls.loadSnapshot();

  if (!snapshot) {
    console.log(
      "Snapshot not available, skipping monitor_and_replace_tripped_devices.",
    );
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  const devices = snapshot;

  const replace_device_types = [
    "NONGL_SS_CHILLER",
    "NONGL_SS_COOLING_TOWER",
    "NONGL_SS_PRIMARY_PUMP",
    "NONGL_SS_CONDENSER_PUMPS",
  ];

  const isTripped = (device) =>
    device.Eqp_Attributes.alm_trip_00 === "active" ||
    Number(device.Eqp_Attributes.alm_trip_00) > 0 ||
    device.Eqp_Metrics.Equipment_Faulty === true;

  const trippedChillers = Object.values(
    devices[replace_device_types[0]] ?? [],
  ).filter(isTripped);
  const trippedCoolingTowers = Object.values(
    devices[replace_device_types[1]] ?? [],
  ).filter(isTripped);
  const trippedPrimPumps = Object.values(
    devices[replace_device_types[2]] ?? [],
  ).filter(isTripped);
  const trippedCondPumps = Object.values(
    devices[replace_device_types[3]] ?? [],
  ).filter(isTripped);

  // Update tripped devices snapshot for the API
  const detected_at = new Date().toISOString();
  controls.cpm_replace_status.tripped_devices = [
    ...trippedChillers.map((d) => ({
      device_type: "wc_chiller",
      name: d.name || d.id,
      detected_at,
    })),
    ...trippedCoolingTowers.map((d) => ({
      device_type: "cool_tower",
      name: d.name || d.id,
      detected_at,
    })),
    ...trippedPrimPumps.map((d) => ({
      device_type: "prim_pump",
      name: d.name || d.id,
      detected_at,
    })),
    ...trippedCondPumps.map((d) => ({
      device_type: "cond_pump",
      name: d.name || d.id,
      detected_at,
    })),
  ];

  if (trippedChillers.length >= 2) {
    console.log("all chillers are tripped, skip");
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  if (trippedCoolingTowers.length >= 3) {
    console.log("all cooling towers are tripped, skip");
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  if (trippedCondPumps.length >= 5) {
    console.log("all cond pumps are tripped, skip.");
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  if (trippedPrimPumps.length >= 5) {
    console.log("all prim pumps are tripped, skip");
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  for (const chiller of trippedChillers) {
    const success = await recoverActions.replace_wc_chiller(chiller.id);
    appendReplaceLog("wc_chiller", chiller.name || chiller.id, null, !!success);
  }

  for (const cool of trippedCoolingTowers) {
    const result = await recoverActions.replace_cooling_tower(cool.id, {
      inlet: true,
      fan: true,
    });
    const newName = controls.getDeviceNameById(snapshot, result?.new_id);
    appendReplaceLog(
      "cool_tower",
      cool.name || cool.id,
      newName,
      result?.state ?? false,
    );
  }

  for (const condPump of trippedCondPumps) {
    const result = await recoverActions.replace_pump(
      controls.glDevices.cond_pump,
      condPump.id,
    );
    const newName = controls.getDeviceNameById(snapshot, result?.new_id);
    appendReplaceLog(
      "cond_pump",
      condPump.name || condPump.id,
      newName,
      result?.state ?? false,
    );
  }

  for (const primPump of trippedPrimPumps) {
    const result = await recoverActions.replace_pump(
      controls.glDevices.prim_pump,
      primPump.id,
    );
    const newName = controls.getDeviceNameById(snapshot, result?.new_id);
    appendReplaceLog(
      "prim_pump",
      primPump.name || primPump.id,
      newName,
      result?.state ?? false,
    );
  }

  set_cpm_step("idle", "monitor_and_replace_tripped_devices");

  return true;
}

async function site_cpm_handler() {
  const manual_state = await actions.read_cpm_mode_status("manual_mode");
  if (manual_state === "active") {
    set_cpm_step("manual_mode", "manual_override");
    console.log(
      "Manual CPM mode is ON. Skipping automatic CPM handling process.",
    );
    return true;
  }
  const cpm_on = await actions.read_cpm_mode_status("cpm_mode");

  if (cpm_on === "active") {
    const active_chillers = await actions.get_active_chillers(
      controls.glDevices.wc_chiller,
    );

    if (active_chillers.length === 0 && controls.cpm_state === null) {
      console.log(
        "CPM is active and no active chillers found, starting primary secondary wc chiller plant...",
      );
      const started = await step_start_primary_secondary_wc_chiller_plant();
      if (!started) return false;
      return true;
    } else {
      if (controls.cpm_state === null) controls.cpm_state = "start";
    }

    // await monitor_cond_water_return_temperature();
    await monitor_motor_percent_fla();
    // await staging_cooling_towers();
    await monitor_and_replace_tripped_devices();

    return true;
  } else if (cpm_on === "inactive") {
    return await step_stop_primary_secondary_wc_chiller_plant();
  } else {
    console.log(`Unexpected cpm_mode value: ${cpm_on}. Skipping CPM handler.`);
    return false;
  }
}

module.exports = {
  site_cpm_handler,
  monitor_motor_percent_fla,
  staging_cooling_towers,
  monitor_and_replace_tripped_devices,
};
