const actions = require("../../actions");
const recovery_actions = require("../../recovery_actions.js");
const controls = require("../../controls");

const {
  find_wc_chiller,
  find_ac_chiller,
  find_pri_pump,
  find_cooling_tower,
  find_condenser_pump,
  find_prim_var_pump,
} = require("../../controls");

async function add_aircooled_primary_variable_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_ac_chiller(
        this.snapshot,
      );

      if (!chillerStatus) {
        return false;
      }

      this.chillerId = chiller.id;
      return true;
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_ac_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true },
      ));

      return state;
    });

    await this.step("Air-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_ac_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_aircooled_primary_secondary_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_ac_chiller(
        this.snapshot,
      );

      const { status: priPumpStatus, device: priPump } = find_pri_pump(
        this.snapshot,
      );

      if (!chillerStatus || !priPumpStatus) {
        return false;
      }

      this.chillerId = chiller.id;
      this.priPumpId = priPump.id;
      return true;
    });

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.priPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.priPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.priPumpId,
      ));

      return state;
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_ac_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true },
      ));

      return state;
    });

    await this.step("Air-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_ac_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_watercooled_primary_secondary_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_wc_chiller(
        this.snapshot,
      );

      const active_cooling_towers = await actions.get_active_pumps_and_cool_towers(
        controls.glDevices.cool_tower,
      );

      if (!active_cooling_towers) return false;

      const {
        status: coolingTowerStatus,
        device: coolingTower,
      } = find_cooling_tower(this.snapshot);
      const {
        status: condenserPumpStatus,
        device: condenserPump,
      } = find_condenser_pump(this.snapshot);
      const { status: priPumpStatus, device: priPump } = find_pri_pump(
        this.snapshot,
      );

      this.skipCoolingTower =
        (active_cooling_towers.length > 1 && !coolingTowerStatus) ||
        active_cooling_towers.length >= 3;

      if (
        !chillerStatus ||
        (!this.skipCoolingTower && !coolingTowerStatus) ||
        !condenserPumpStatus ||
        !priPumpStatus
      ) {
        return false;
      }

      this.chillerId = chiller.id;
      if (!this.skipCoolingTower) {
        this.coolingTowerId = coolingTower.id;
      }
      this.condenserPumpId = condenserPump.id;
      this.priPumpId = priPump.id;
      return true;
    });

    await this.step("Cooling Tower Fan ON", async () => {
      if (this.skipCoolingTower) return true;

      const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: false, fan: true },
      ));

      return state;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
      if (this.skipCoolingTower) return true;

      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { inlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: true, fan: true },
      ));

      return state;
    });

    await this.step("Condenser Pump ON", async () => {
      const ok = await actions.turn_on_condenser_pump(this.condenserPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.condenserPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cond_pump,
        this.condenserPumpId,
      ));

      return state;
    });

    await this.step("Condenser Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_cond_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true },
      ));

      return state;
    });

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.priPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.priPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.priPumpId,
      ));

      return state;
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { eva: true, cond: true },
      ));

      return state;
    });

    await this.step("Water-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_wc_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true, eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_watercooled_primary_variable_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();
    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_wc_chiller(
        this.snapshot,
      );
      const {
        status: coolingTowerStatus,
        device: coolingTower,
      } = find_cooling_tower(this.snapshot);
      const {
        status: condenserPumpStatus,
        device: condenserPump,
      } = find_condenser_pump(this.snapshot);

      if (!chillerStatus || !coolingTowerStatus || !condenserPumpStatus) {
        return false;
      }

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      return true;
    });

    await this.step("Cooling Tower Fan ON", async () => {
      const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: false, fan: true },
      ));

      return state;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { inlet: true },
      );
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: true, fan: true },
      ));

      return state;
    });

    await this.step("Condenser Pump ON", async () => {
      const ok = await actions.turn_on_condenser_pump(this.condenserPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.condenserPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cond_pump,
        this.condenserPumpId,
      ));

      return state;
    });

    await this.step("Condenser Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_cond_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true },
      ));

      return state;
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { eva: true, cond: true },
      ));

      return state;
    });

    await this.step("Water-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_wc_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true, eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_watercooled_primary_variable_type2_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_wc_chiller(
        this.snapshot,
      );
      const {
        status: coolingTowerStatus,
        device: coolingTower,
      } = find_cooling_tower(this.snapshot);
      const {
        status: condenserPumpStatus,
        device: condenserPump,
      } = find_condenser_pump(this.snapshot);

      if (!chillerStatus || !coolingTowerStatus || !condenserPumpStatus) {
        return false;
      }

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      return true;
    });

    await this.step("Cooling Tower 1 FAN/s ON", async () => {
      const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: false, fan: true },
      ));

      return state;
    });

    await this.step("Cooling Tower 1 Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true },
      );
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: true, fan: true },
      ));

      return state;
    });

    await this.step("Discover Second Cooling Tower", async () => {
      const {
        status: coolingTowerStatus2,
        device: coolingTower2,
      } = find_cooling_tower(this.snapshot);

      if (!coolingTowerStatus2) {
        return false;
      }

      this.coolingTowerId2 = coolingTower2.id;
      return true;
    });

    await this.step("Cooling Tower 2 ON", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId2,
        { outlet: true },
      );
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId2,
        { valve: false, fan: true },
      ));

      return state;
    });

    await this.step("Cooling Tower 2 Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId2,
        { outlet: true },
      );
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId2,
        { valve: true, fan: true },
      ));

      return state;
    });

    await this.step("Condenser Pump ON", async () => {
      const ok = await actions.turn_on_condenser_pump(this.condenserPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.condenserPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cond_pump,
        this.condenserPumpId,
      ));

      return state;
    });

    await this.step("Condenser Pump Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_cond_valve(
        this.condenserPumpId,
      );
      if (ok) return true;

      ({
        state,
        new_id: this.condenserPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cond_pump,
        this.condenserPumpId,
        { valve: true },
      ));

      return state;
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { eva: true },
      ));

      return state;
    });

    await this.step("Water-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_wc_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_aircooled_primary_variable_1c1pv_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_ac_chiller(
        this.snapshot,
      );

      const {
        status: primVarPumpStatus,
        device: primVarPump,
      } = find_prim_var_pump(this.snapshot);

      if (!chillerStatus || !primVarPumpStatus) {
        return false;
      }

      this.chillerId = chiller.id;
      this.primVarPumpId = primVarPump.id;
      return true;
    });

    await this.step("Primary Variable Pump ON", async () => {
      return await actions.turn_on_prim_var_pump(this.primVarPumpId);
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_ac_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true },
      ));

      return state;
    });

    await this.step("Air-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_ac_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.ac_chiller,
        this.chillerId,
        { eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

async function add_watercooled_primary_variable_1c1pv_with_steps() {
  let state = false;
  try {
    this.snapshot = await controls.loadSnapshot();

    await this.step("Discover Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_wc_chiller(
        this.snapshot,
      );
      const {
        status: coolingTowerStatus,
        device: coolingTower,
      } = find_cooling_tower(this.snapshot);
      const {
        status: condenserPumpStatus,
        device: condenserPump,
      } = find_condenser_pump(this.snapshot);
      const {
        status: primVarPumpStatus,
        device: primVarPump,
      } = find_prim_var_pump(this.snapshot);

      if (
        !chillerStatus ||
        !coolingTowerStatus ||
        !condenserPumpStatus ||
        !primVarPumpStatus
      ) {
        return false;
      }

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      this.primVarPumpId = primVarPump.id;
      return true;
    });

    await this.step("Cooling Tower Fan ON", async () => {
      const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: false, fan: true },
      ));

      return state;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true },
      );
      if (ok) return true;

      ({ state } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: true, fan: true },
      ));

      return state;
    });

    await this.step("Condenser Pump ON", async () => {
      const ok = await actions.turn_on_condenser_pump(this.condenserPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.condenserPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cond_pump,
        this.condenserPumpId,
      ));

      return state;
    });

    await this.step("Condenser Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_cond_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true },
      ));

      return state;
    });

    await this.step("Primary Variable Pump ON", async () => {
      return await actions.turn_on_prim_var_pump(this.primVarPumpId);
    });

    await this.step("Evaporator Valve OPEN", async () => {
      const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { eva: true, cond: true },
      ));

      return state;
    });

    await this.step("Water-Cooled Chiller ON", async () => {
      const ok = await actions.turn_on_wc_chiller(this.chillerId);
      if (ok) return true;

      ({
        state,
        new_id: this.chillerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.wc_chiller,
        this.chillerId,
        { cond: true, eva: true, chiller: true },
      ));

      return state;
    });

    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  add_aircooled_primary_variable_with_steps,
  add_aircooled_primary_secondary_with_steps,
  add_watercooled_primary_secondary_with_steps,
  add_watercooled_primary_variable_with_steps,
  add_watercooled_primary_variable_type2_with_steps,
  add_aircooled_primary_variable_1c1pv_with_steps,
  add_watercooled_primary_variable_1c1pv_with_steps,
};
