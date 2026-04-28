require("dotenv").config();
const controls = require("../controls");
const scenarios = require("./scenarios");
const actions = require("../actions");
const recoverActions = require("../recovery_actions");

const POLL_INTERVAL_SECONDS = 15;
const SUSTAINED_THRESHOLD_SECONDS = 15 * 60; // 15 minutes
const MAX_ACTIVE_CHILLERS = 2;
const ADD_LOAD_THRESHOLD = 80; // % — add a chiller when avg load exceeds this
const REMOVE_LOAD_THRESHOLD = 40; // % — remove a chiller when avg load drops below this
const VFD_STAGING_THRESHOLD_SECONDS = 600; // 10 minutes

function set_cpm_step(status, step) {
  controls.cpm_step_status.status = status;
  controls.cpm_step_status.step = step;
  controls.cpm_step_status.updated_at = new Date().toISOString();
}

async function reset_counters() {
  const keys = Object.keys(controls.cpm_execution_check_point.duration_seconds);
  await Promise.all(
    keys.map((key) => controls.update_duration_seconds(key, 0)),
  );
  return true;
}

function getTrippedDevices(snapshot, typeKey) {
  return Object.values(snapshot[typeKey] ?? {}).filter(
    (device) =>
      device.Eqp_Attributes.alm_trip_00 === "active" ||
      Number(device.Eqp_Attributes.alm_trip_00) > 0 ||
      device.Eqp_Metrics.Equipment_Faulty === true,
  );
}

async function step_start_primary_secondary_wc_chiller_plant() {
  set_cpm_step("busy", "starting_chiller_plant");
  console.log("Starting chilled plant...");

  const ok = await scenarios.start_watercooled_primary_secondary_stations_2_system();
  if (ok) {
    console.log("Chilled plant started successfully.");
    controls.cpm_state = "start";
    set_cpm_step("idle", "monitoring");
    return true;
  }

  console.error("Failed to start chilled plant. Stopping plant.");
  await step_stop_primary_secondary_wc_chiller_plant();
  return false;
}

async function step_stop_primary_secondary_wc_chiller_plant() {
  set_cpm_step("busy", "stopping_chiller_plant");
  console.log("Stopping chilled plant...");
  await actions.set_cpm_mode_on_off("inactive");
  controls.cpm_state = null;

  let success = true;
  try {
    await scenarios.stop_watercooled_primary_secondary_2_stations();
    console.log("Chilled plant stopped successfully.");
  } catch (error) {
    console.error("Error stopping chilled plant:", error);
    success = false;
  }

  set_cpm_step("idle", null);
  await reset_counters();
  return success;
}

async function step_add_primary_secondary_wc_chiller() {
  set_cpm_step("busy", "adding_chiller");
  console.log("Adding chiller...");

  const ok = await scenarios.add_watercooled_primary_secondary_scenario();
  set_cpm_step("idle", "monitoring");

  if (ok) {
    console.log("Chiller added successfully.");
  } else {
    console.error(
      "Failed to add chiller. Will retry on next sustained condition.",
    );
  }
  return ok;
}

async function step_subtract_primary_secondary_wc_chiller() {
  set_cpm_step("busy", "removing_chiller");
  console.log("Removing chiller...");

  const ok = await scenarios.substract_watercooled_primary_secondary_scenario();
  set_cpm_step("idle", "monitoring");

  if (ok) {
    console.log("Chiller removed successfully.");
  } else {
    console.error(
      "Failed to remove chiller. Will retry on next sustained condition.",
    );
  }
  return ok;
}

async function start_cooling_tower(coolingTowerId) {
  let id = coolingTowerId;

  let valve_ok = await actions.turn_on_cooling_tower_valves(id, {
    inlet: true,
  });
  if (!valve_ok) {
    ({
      state: valve_ok,
      new_id: id,
    } = await recoverActions.set_device_state_fault(
      controls.glDevices.cool_tower,
      id,
      { inlet: true },
    ));
  }
  if (!valve_ok || !id) {
    console.log("Opening cooling tower valve failed.");
    return false;
  }

  let fan_ok = await actions.turn_on_cooling_towerfan(id);
  if (!fan_ok) {
    ({
      state: fan_ok,
      new_id: id,
    } = await recoverActions.set_device_state_fault(
      controls.glDevices.cool_tower,
      id,
      { fan: true, inlet: true },
    ));
  }
  if (!fan_ok) {
    console.log("Starting cooling tower fan failed.");
    return false;
  }

  console.log("Cooling tower started successfully.");
  return true;
}

async function stop_cooling_tower(coolingTowerId) {
  const valve_ok = await actions.turn_off_cooling_tower_valves(coolingTowerId, {
    inlet: true,
  });
  if (!valve_ok) {
    console.log("Closing cooling tower valve failed.");
    return false;
  }

  const fan_ok = await actions.turn_off_cooling_towerfan(coolingTowerId);
  if (!fan_ok) {
    console.log("Stopping cooling tower fan failed.");
    return false;
  }

  console.log("Cooling tower stopped successfully.");
  return true;
}

async function monitor_motor_percent_fla() {
  if (controls.cpm_state == null) return true;

  set_cpm_step("busy", "monitoring_compressor_load");
  console.log("Monitoring compressor load for chiller staging...");

  const active_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  if (!active_chillers.length) {
    console.log("No active chillers found. Cannot proceed.");
    set_cpm_step("idle", "monitoring");
    return false;
  }

  const load_readings = await Promise.all(
    active_chillers.map((chiller) =>
      actions.read_wc_chilled_parameter(chiller.id, "par_comp_percent_load_00"),
    ),
  );

  const valid_loads = load_readings.filter(
    (v) => v !== false && v !== null && v !== undefined,
  );

  if (valid_loads.length === 0) {
    console.log(
      "No valid compressor load readings. Skipping poll — counters unchanged.",
    );
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const avg_load =
    valid_loads.reduce((sum, v) => sum + Number(v), 0) / valid_loads.length;

  console.log(
    `Avg compressor load: ${avg_load.toFixed(1)}% (${valid_loads.length}/${
      active_chillers.length
    } chillers)`,
  );

  let add_duration = await controls.get_duration_seconds(
    "wc_chiller_add_condition_duration",
  );

  if (avg_load > ADD_LOAD_THRESHOLD) {
    add_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds(
      "wc_chiller_add_condition_duration",
      add_duration,
    );
    console.log(
      `Add condition: ${avg_load.toFixed(
        1,
      )}% > ${ADD_LOAD_THRESHOLD}% — sustained ${add_duration}s / ${SUSTAINED_THRESHOLD_SECONDS}s`,
    );

    if (add_duration >= SUSTAINED_THRESHOLD_SECONDS) {
      await controls.update_duration_seconds(
        "wc_chiller_add_condition_duration",
        0,
      );

      if (active_chillers.length >= MAX_ACTIVE_CHILLERS) {
        console.log("Max chillers already running. Skipping add.");
        set_cpm_step("idle", "monitoring");
        return true;
      }

      await step_add_primary_secondary_wc_chiller();
      return true;
    }
  } else {
    if (add_duration > 0)
      console.log("Add condition broken. Resetting add counter.");
    await controls.update_duration_seconds(
      "wc_chiller_add_condition_duration",
      0,
    );
  }

  if (active_chillers.length <= 1) {
    console.log("Only one active chiller. Removal not possible.");
    await controls.update_duration_seconds(
      "wc_chiller_remove_condition_duration",
      0,
    );
    set_cpm_step("idle", "monitoring");
    return true;
  }

  let remove_duration = await controls.get_duration_seconds(
    "wc_chiller_remove_condition_duration",
  );

  if (avg_load < REMOVE_LOAD_THRESHOLD) {
    remove_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds(
      "wc_chiller_remove_condition_duration",
      remove_duration,
    );
    console.log(
      `Remove condition: ${avg_load.toFixed(
        1,
      )}% < ${REMOVE_LOAD_THRESHOLD}% — sustained ${remove_duration}s / ${SUSTAINED_THRESHOLD_SECONDS}s`,
    );

    if (remove_duration >= SUSTAINED_THRESHOLD_SECONDS) {
      await controls.update_duration_seconds(
        "wc_chiller_remove_condition_duration",
        0,
      );
      await step_subtract_primary_secondary_wc_chiller();
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

async function staging_cooling_towers() {
  if (controls.cpm_state == null) return true;

  set_cpm_step("busy", "staging_cooling_towers");
  console.log("Monitoring VFD command to stage cooling towers...");

  const [active_cooling_towers, active_chillers] = await Promise.all([
    actions.get_active_pumps_and_cool_towers(controls.glDevices.cool_tower),
    actions.get_active_chillers(controls.glDevices.wc_chiller),
  ]);

  if (!active_chillers.length || !active_cooling_towers.length) {
    console.log("No active chillers or cooling towers. Skipping staging.");
    await controls.update_duration_seconds("vfd_ct_add_duration", 0);
    await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const vfd_readings = await Promise.all(
    active_cooling_towers.map((tower) =>
      actions.read_cooling_tower_parameter(tower.id, "cmd_fan_frequency_00"),
    ),
  );

  const valid_vfd = vfd_readings.filter(
    (v) => v !== false && v !== null && v !== undefined,
  );

  if (valid_vfd.length === 0) {
    console.log("No valid VFD readings. Skipping poll — counters unchanged.");
    set_cpm_step("idle", "monitoring");
    return true;
  }

  const avg_vfd =
    valid_vfd.reduce((sum, v) => sum + Number(v), 0) / valid_vfd.length;
  const ratio = active_cooling_towers.length / active_chillers.length;

  const [cond_sp, cond_ret] = await Promise.all([
    actions.read_common_header_parameter("cmd_cdw_sup_temp_00"),
    actions.read_common_header_parameter("par_cdw_ret_temp_00"),
  ]);

  const add_condition = ratio >= 1 && ratio < 2 && avg_vfd > 40;

  const cond_reads_valid =
    cond_sp !== false &&
    cond_sp !== null &&
    cond_sp !== undefined &&
    cond_ret !== false &&
    cond_ret !== null &&
    cond_ret !== undefined;

  const remove_condition =
    cond_reads_valid &&
    ratio > 1 &&
    avg_vfd < 40 &&
    Math.abs(Number(cond_sp) - Number(cond_ret)) < 1.3;

  let add_duration = await controls.get_duration_seconds("vfd_ct_add_duration");
  let remove_duration = await controls.get_duration_seconds(
    "vfd_ct_remove_duration",
  );

  if (add_condition) {
    add_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds("vfd_ct_add_duration", add_duration);
    await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
    console.log(
      `CT add: ratio=${ratio.toFixed(2)}, vfd=${avg_vfd.toFixed(
        1,
      )}% — sustained ${add_duration}s`,
    );
  } else if (remove_condition) {
    remove_duration += POLL_INTERVAL_SECONDS;
    await controls.update_duration_seconds(
      "vfd_ct_remove_duration",
      remove_duration,
    );
    await controls.update_duration_seconds("vfd_ct_add_duration", 0);
    console.log(
      `CT remove: ratio=${ratio.toFixed(2)}, vfd=${avg_vfd.toFixed(
        1,
      )}% — sustained ${remove_duration}s`,
    );
  } else {
    await controls.update_duration_seconds("vfd_ct_add_duration", 0);
    await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
  }

  if (add_condition && add_duration >= VFD_STAGING_THRESHOLD_SECONDS) {
    const snapshot = await controls.loadSnapshot();
    const { status, device: ct } = controls.find_cooling_tower(snapshot);

    if (!status) {
      console.log("No available cooling tower to add.");
      await controls.update_duration_seconds("vfd_ct_add_duration", 0);
      set_cpm_step("idle", "monitoring");
      return false;
    }

    console.log("CT add threshold reached. Adding cooling tower...");
    const ok = await start_cooling_tower(ct.id);
    await controls.update_duration_seconds("vfd_ct_add_duration", 0);
    set_cpm_step("idle", "monitoring");
    return ok;
  }

  if (remove_condition && remove_duration >= VFD_STAGING_THRESHOLD_SECONDS) {
    if (active_cooling_towers.length <= 1) {
      console.log("Only one cooling tower active. Removal skipped.");
      await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
      set_cpm_step("idle", "monitoring");
      return true;
    }

    const fresh_towers = await actions.get_active_pumps_and_cool_towers(
      controls.glDevices.cool_tower,
    );

    if (fresh_towers.length <= 1) {
      console.log("Not enough active cooling towers for removal.");
      await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
      set_cpm_step("idle", "monitoring");
      return true;
    }

    const ct_to_remove = controls.getMaxRunHourDevice(fresh_towers);
    if (!ct_to_remove) {
      console.log("Could not determine cooling tower to remove.");
      set_cpm_step("idle", "monitoring");
      return false;
    }

    console.log("CT remove threshold reached. Removing cooling tower...");
    const ok = await stop_cooling_tower(ct_to_remove.id);
    await controls.update_duration_seconds("vfd_ct_remove_duration", 0);
    set_cpm_step("idle", "monitoring");
    return ok;
  }

  set_cpm_step("idle", "monitoring");
  return true;
}

const TRIPPED_DEVICE_CONFIG = [
  {
    typeKey: "NONGL_SS_CHILLER",
    maxTripped: 2,
    label: "chillers",
    recover: (device) => recoverActions.replace_wc_chiller(device.id),
  },
  {
    typeKey: "NONGL_SS_COOLING_TOWER",
    maxTripped: 3,
    label: "cooling towers",
    recover: (device) =>
      recoverActions.replace_cooling_tower(device.id, {
        inlet: true,
        fan: true,
      }),
  },
  {
    typeKey: "NONGL_SS_CONDENSER_PUMPS",
    maxTripped: 5,
    label: "condenser pumps",
    recover: (device) =>
      recoverActions.replace_pump(controls.glDevices.cond_pump, device.id),
  },
  {
    typeKey: "NONGL_SS_PRIMARY_PUMP",
    maxTripped: 5,
    label: "primary pumps",
    recover: (device) =>
      recoverActions.replace_pump(controls.glDevices.prim_pump, device.id),
  },
];

async function monitor_and_replace_tripped_devices() {
  set_cpm_step("busy", "monitor_and_replace_tripped_devices");

  const snapshot = await controls.loadSnapshot();
  if (!snapshot) {
    console.log("Snapshot unavailable. Skipping tripped device check.");
    set_cpm_step("idle", "monitor_and_replace_tripped_devices");
    return false;
  }

  // Phase 1: collect tripped devices, bail immediately if any type is fully tripped.
  // Must check all types before doing any replacements — there may be no spare to swap in.
  const tripped_groups = TRIPPED_DEVICE_CONFIG.map(({ typeKey, maxTripped, label, recover }) => ({
    tripped: getTrippedDevices(snapshot, typeKey),
    maxTripped,
    label,
    recover,
  }));

  for (const { tripped, maxTripped, label } of tripped_groups) {
    if (tripped.length >= maxTripped) {
      console.log(`All ${label} are tripped. Skipping replacement.`);
      set_cpm_step("idle", "monitor_and_replace_tripped_devices");
      return false;
    }
  }

  // Phase 2: replace partial tripped devices across all types.
  for (const { tripped, recover } of tripped_groups) {
    for (const device of tripped) {
      await recover(device);
    }
  }

  set_cpm_step("idle", "monitor_and_replace_tripped_devices");
  return true;
}

async function site_cpm_handler() {
  const manual_state = await actions.read_cpm_mode_status("manual_mode");
  if (manual_state === "active") {
    set_cpm_step("manual_mode", "manual_override");
    console.log("Manual CPM mode is ON. Skipping automatic handling.");
    return true;
  }

  const cpm_on = await actions.read_cpm_mode_status("cpm_mode");

  if (cpm_on === "inactive") {
    return step_stop_primary_secondary_wc_chiller_plant();
  }

  if (cpm_on !== "active") {
    console.log(`Unexpected cpm_mode value: ${cpm_on}. Skipping.`);
    return false;
  }

  const active_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  if (active_chillers.length === 0 && controls.cpm_state === null) {
    console.log("CPM active, no chillers running. Starting plant...");
    return step_start_primary_secondary_wc_chiller_plant();
  }

  if (controls.cpm_state === null) controls.cpm_state = "start";

  await monitor_motor_percent_fla();
  // await staging_cooling_towers();
  await monitor_and_replace_tripped_devices();

  return true;
}

module.exports = {
  site_cpm_handler,
  monitor_motor_percent_fla,
  staging_cooling_towers,
  monitor_and_replace_tripped_devices,
};
