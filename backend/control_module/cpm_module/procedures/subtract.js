const actions = require("../../actions");
const controls = require("../../controls");
const { sleep } = require("../../controls/utils.js");

async function substract_aircooled_primary_variable_with_steps() {
  const ac_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  if (ac_chillers.length < 1) {
    console.error("No active/valid air-cooled chillers found");
    return true;
  }

  this.max_running_ac_chiller = controls.getMaxRunHourDevice(ac_chillers);

  this.chillerId = this.max_running_ac_chiller?.id || ac_chillers[0].id;

  try {
    if (this.chillerId)
      await this.step("Turn OFF AC Chiller", () =>
        actions.turn_off_ac_chiller(this.chillerId),
      );

    if (this.chillerId)
      await this.step("Turn OFF Evaporator Valve", () =>
        actions.turn_off_ac_chiller_valve(this.chillerId),
      );

    return true;
  } catch (e) {
    console.error("Error in substract_aircooled_primary_variable:", e.message);
    return false;
  }
}

async function substract_aircooled_primary_secondary_with_steps() {
  const ac_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  const pri_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );

  if (ac_chillers.length < 1) {
    console.error("No active/valid air-cooled chillers found");
    return true;
  }

  this.max_running_ac_chiller = controls.getMaxRunHourDevice(ac_chillers);

  this.chillerId = this.max_running_ac_chiller?.id || ac_chillers[0].id;

  this.max_running_pump = controls.getMaxRunHourDevice(pri_pumps);

  this.priPumpId = this.max_running_pump?.id || pri_pumps[0].id;

  if (ac_chillers.length < 1 || pri_pumps.length < 1) {
    console.error("No active/valid air-cooled chillers / primary pump found");
    return true;
  }

  try {
    if (this.chillerId)
      await this.step("Turn OFF AC Chiller", () =>
        actions.turn_off_ac_chiller(this.chillerId),
      );

    if (this.chillerId)
      await this.step("Turn OFF Evaporator Valve", () =>
        actions.turn_off_ac_chiller_valve(this.chillerId),
      );

    if (this.priPumpId)
      await this.step("Turn OFF Primary Pump", () =>
        actions.turn_off_pri_pump(this.priPumpId),
      );

    return true;
  } catch (e) {
    console.error("Error in substract_aircooled_primary_secondary:", e.message);
    return false;
  }
}

async function substract_watercooled_primary_secondary_with_steps() {
  const wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  const cool_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  const cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );
  const prim_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );
  if (
    wc_chillers.length < 1 ||
    cool_towers.length < 1 ||
    cond_pumps.length < 1 ||
    prim_pumps.length < 1
  ) {
    console.error(
      "No active/valid watercooled chillers / condenser pump / Primary pump/ cooling tower found",
    );
    return true;
  }

  this.max_running_wc_chiller = controls.getMaxRunHourDevice(wc_chillers);
  this.max_running_cool_tower = controls.getMaxRunHourDevice(cool_towers);
  this.max_running_cond_pumps = controls.getMaxRunHourDevice(cond_pumps);
  this.max_running_prim_pumps = controls.getMaxRunHourDevice(prim_pumps);

  this.chillerId = this.max_running_wc_chiller?.id || wc_chillers[0].id;
  this.coolingTowerId = this.max_running_cool_tower?.id || cool_towers[0].id;
  this.condenserPumpId = this.max_running_cond_pumps?.id || cond_pumps[0].id;
  this.primaryPumpId = this.max_running_prim_pumps?.id || prim_pumps[0].id;

  try {
    if (this.chillerId)
      await this.step("Turn OFF WC Chiller", () =>
        actions.turn_off_wc_chiller(this.chillerId),
      );

    await sleep(80000);

    if (this.chillerId)
      await this.step("Turn OFF WC Chiller Evaporator Valve", () =>
        actions.turn_off_wc_chiller_valve(this.chillerId),
      );

    if (this.primaryPumpId)
      await this.step("Turn OFF Primary Pump", () =>
        actions.turn_off_pri_pump(this.primaryPumpId),
      );

    if (this.chillerId)
      await this.step("Turn OFF WC Chiller Condenser Valve", () =>
        actions.turn_off_wc_chiller_cond_valve(this.chillerId),
      );

    if (this.condenserPumpId)
      await this.step("Turn OFF Condenser Pump", () =>
        actions.turn_off_condenser_pump(this.condenserPumpId),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Valve", () =>
        actions.turn_off_cooling_tower_valves(this.coolingTowerId, {
          inlet: true,
        }),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Fan", () =>
        actions.turn_off_cooling_towerfan(this.coolingTowerId),
      );

    return true;
  } catch (e) {
    console.error(
      "Error in substract_watercooled_primary_secondary:",
      e.message,
    );
    return false;
  }
}

async function substract_watercooled_primary_variable_with_steps() {
  const wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  const cool_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  const cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  if (
    wc_chillers.length < 1 ||
    cool_towers.length < 1 ||
    cond_pumps.length < 1
  ) {
    console.error(
      "No active/valid watercooled chillers / condenser pump / cooling tower found",
    );
    return true;
  }

  this.max_running_wc_chiller = controls.getMaxRunHourDevice(wc_chillers);
  this.max_running_cool_tower = controls.getMaxRunHourDevice(cool_towers);
  this.max_running_cond_pumps = controls.getMaxRunHourDevice(cond_pumps);

  this.chillerId = this.max_running_wc_chiller?.id || wc_chillers[0].id;
  this.coolingTowerId = this.max_running_cool_tower?.id || cool_towers[0].id;
  this.condenserPumpId = this.max_running_cond_pumps?.id || cond_pumps[0].id;

  try {
    if (this.chillerId)
      await this.step("Turn OFF WC Chiller", () =>
        actions.turn_off_wc_chiller(this.chillerId),
      );

    await sleep(80000);

    if (this.chillerId)
      await this.step("Turn OFF wc chiller condenser Valve", () =>
        actions.turn_off_wc_chiller_cond_valve(this.chillerId),
      );

    if (this.condenserPumpId)
      await this.step("Turn OFF Condenser Pump", () =>
        actions.turn_off_condenser_pump(this.condenserPumpId),
      );

    if (this.chillerId)
      await this.step("Turn OFF wc chiller evaporator Valve", () =>
        actions.turn_off_wc_chiller_valve(this.chillerId),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Valve", () =>
        actions.turn_off_cooling_tower_valves(this.coolingTowerId, {
          outlet: true,
        }),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Fan", () =>
        actions.turn_off_cooling_towerfan(this.coolingTowerId),
      );

    return true;
  } catch (e) {
    console.error(
      "Error in substract_watercooled_primary_variable:",
      e.message,
    );
    return false;
  }
}

async function substract_watercooled_primary_variable_type2_with_steps() {
  const wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  const cool_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  const cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  if (
    wc_chillers.length < 1 ||
    cool_towers.length < 2 ||
    cond_pumps.length < 1
  ) {
    console.error(
      "No active/valid watercooled chillers / condenser pump / cooling towers found",
    );
    return true;
  }

  this.max_running_wc_chiller = controls.getMaxRunHourDevice(wc_chillers);

  this.max_running_cond_pumps = controls.getMaxRunHourDevice(cond_pumps);

  this.chillerId = this.max_running_wc_chiller?.id || wc_chillers[0].id;
  this.coolingTowerId = cool_towers[0].id;
  this.condenserPumpId = this.max_running_cond_pumps?.id || cond_pumps[0].id;
  this.coolingTowerId2 = cool_towers[1].id;

  try {
    if (this.chillerId)
      await this.step("Turn OFF WC Chiller", () =>
        actions.turn_off_wc_chiller(this.chillerId),
      );

    if (this.chillerId)
      await this.step("Turn OFF Condenser Pump Valve", () =>
        actions.turn_off_wc_chiller_cond_valve(this.chillerId),
      );

    if (this.condenserPumpId)
      await this.step("Turn OFF Condenser Pump", () =>
        actions.turn_off_condenser_pump(this.condenserPumpId),
      );

    if (this.chillerId)
      await this.step("Turn OFF WC Chiller Evaporator Valve", () =>
        actions.turn_off_wc_chiller_valve(this.chillerId),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower 1 Valve", () =>
        actions.turn_off_cooling_tower_valves(this.coolingTowerId, {
          outlet: true,
        }),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower 1 Fan", () =>
        actions.turn_off_cooling_towerfan(this.coolingTowerId),
      );

    if (this.coolingTowerId2)
      await this.step("Turn OFF Cooling Tower 2 Valve", () =>
        actions.turn_off_cooling_tower_valves(this.coolingTowerId2, {
          outlet: true,
        }),
      );

    if (this.coolingTowerId2)
      await this.step("Turn OFF Cooling Tower 2 Fan", () =>
        actions.turn_off_cooling_towerfan(this.coolingTowerId2),
      );

    return true;
  } catch (e) {
    console.error(
      "Error in substract_watercooled_primary_variable_type2:",
      e.message,
    );
    return false;
  }
}

async function substract_aircooled_primary_variable_1c1pv_with_steps() {
  const ac_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  const prim_var_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_var_pump,
  );

  if (ac_chillers.length < 1) {
    console.error("No active/valid air-cooled chillers found");
    return true;
  }

  this.max_running_ac_chiller = controls.getMaxRunHourDevice(ac_chillers);
  this.chillerId = this.max_running_ac_chiller?.id || ac_chillers[0].id;

  this.max_running_prim_var_pump = controls.getMaxRunHourDevice(prim_var_pumps);
  this.primVarPumpId =
    this.max_running_prim_var_pump?.id || prim_var_pumps[0]?.id;

  if (ac_chillers.length < 1 || prim_var_pumps.length < 1) {
    console.error(
      "No active/valid air-cooled chillers / primary variable pump found",
    );
    return true;
  }

  try {
    if (this.chillerId)
      await this.step("Turn OFF AC Chiller", () =>
        actions.turn_off_ac_chiller(this.chillerId),
      );

    if (this.chillerId)
      await this.step("Turn OFF Evaporator Valve", () =>
        actions.turn_off_ac_chiller_valve(this.chillerId),
      );

    if (this.primVarPumpId)
      await this.step("Turn OFF Primary Variable Pump", () =>
        actions.turn_off_prim_var_pump(this.primVarPumpId),
      );

    return true;
  } catch (e) {
    console.error(
      "Error in substract_aircooled_primary_variable_1c1pv:",
      e.message,
    );
    return false;
  }
}

async function substract_watercooled_primary_variable_1c1pv_with_steps() {
  const wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  const cool_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  const cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );
  const prim_var_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_var_pump,
  );

  if (
    wc_chillers.length < 1 ||
    cool_towers.length < 1 ||
    cond_pumps.length < 1 ||
    prim_var_pumps.length < 1
  ) {
    console.error(
      "No active/valid watercooled chillers / condenser pump / primary variable pump / cooling tower found",
    );
    return true;
  }

  this.max_running_wc_chiller = controls.getMaxRunHourDevice(wc_chillers);
  this.max_running_cool_tower = controls.getMaxRunHourDevice(cool_towers);
  this.max_running_cond_pumps = controls.getMaxRunHourDevice(cond_pumps);
  this.max_running_prim_var_pump = controls.getMaxRunHourDevice(prim_var_pumps);

  this.chillerId = this.max_running_wc_chiller?.id || wc_chillers[0].id;
  this.coolingTowerId = this.max_running_cool_tower?.id || cool_towers[0].id;
  this.condenserPumpId = this.max_running_cond_pumps?.id || cond_pumps[0].id;
  this.primVarPumpId =
    this.max_running_prim_var_pump?.id || prim_var_pumps[0].id;

  try {
    if (this.chillerId)
      await this.step("Turn OFF WC Chiller", () =>
        actions.turn_off_wc_chiller(this.chillerId),
      );

    if (this.chillerId)
      await this.step("Turn OFF WC Chiller Evaporator Valve", () =>
        actions.turn_off_wc_chiller_valve(this.chillerId),
      );

    if (this.primVarPumpId)
      await this.step("Turn OFF Primary Variable Pump", () =>
        actions.turn_off_prim_var_pump(this.primVarPumpId),
      );

    if (this.chillerId)
      await this.step("Turn OFF WC Chiller Condenser Valve", () =>
        actions.turn_off_condenser_pump_valve(this.chillerId),
      );

    if (this.condenserPumpId)
      await this.step("Turn OFF Condenser Pump", () =>
        actions.turn_off_condenser_pump(this.condenserPumpId),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Valve", () =>
        actions.turn_off_cooling_tower_valves(this.coolingTowerId, {
          outlet: true,
        }),
      );

    if (this.coolingTowerId)
      await this.step("Turn OFF Cooling Tower Fan", () =>
        actions.turn_off_cooling_towerfan(this.coolingTowerId),
      );

    return true;
  } catch (e) {
    console.error(
      "Error in substract_watercooled_primary_variable_1c1pv:",
      e.message,
    );
    return false;
  }
}

module.exports = {
  substract_aircooled_primary_variable_with_steps,
  substract_aircooled_primary_secondary_with_steps,
  substract_watercooled_primary_secondary_with_steps,
  substract_watercooled_primary_variable_with_steps,
  substract_watercooled_primary_variable_type2_with_steps,
  substract_aircooled_primary_variable_1c1pv_with_steps,
  substract_watercooled_primary_variable_1c1pv_with_steps,
};
