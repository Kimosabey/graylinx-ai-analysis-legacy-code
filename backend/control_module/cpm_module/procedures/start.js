const actions = require("../../actions");
const recovery_actions = require("../../recovery_actions.js");
const controls = require("../../controls");
const { sleep } = require("../../controls/utils.js");

const {
  find_wc_chiller,
  find_ac_chiller,
  find_pri_pump,
  find_sec_pump,
  find_cooling_tower,
  find_condenser_pump,
  find_priv_seq_panel,
  find_sec_seq_panel,
  find_prim_var_pump,
} = require("../../controls");

async function start_aircooled_primary_variable_with_steps() {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
    await this.step("Discover Air-Cooled Chiller & Primary Pump", async () => {
      const { status: chillerStatus, device: chiller } = find_ac_chiller(
        this.snapshot,
      );
      const {
        status: pri_seq_panelStatus,
        device: pri_seq_panel,
      } = find_priv_seq_panel(this.snapshot);

      if (!chillerStatus || !pri_seq_panelStatus) return false;

      this.chillerId = chiller.id;
      this.prim_seq_panel_id = pri_seq_panel.id;
      return true;
    });

    await this.step("Air-Cooled Chiller Valve OPEN", async () => {
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

    await this.step("Primary Pump Station ON", async () => {
      return await actions.turn_on_pri_pump_station(this.prim_seq_panel_id);
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
    console.error(
      `start_aircooled_primary_variable failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_aircooled_primary_secondary_with_steps() {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
    await this.step("Discover Air-Cooled Chiller & Pumps", async () => {
      const { status: chillerStatus, device: chiller } = find_ac_chiller(
        this.snapshot,
      );

      const { status: priPumpStatus, device: priPump } = find_pri_pump(
        this.snapshot,
      );

      const { status: secPumpStatus, device: secPump } = find_sec_seq_panel(
        this.snapshot,
      );

      if (!chillerStatus || !priPumpStatus || !secPumpStatus) return false;

      this.chillerId = chiller.id;
      this.primaryPumpId = priPump.id;
      this.secondaryPumpId = secPump.id;

      return true;
    });

    await this.step("Air-Cooled Chiller Valve OPEN", async () => {
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

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.primaryPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.primaryPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.primaryPumpId,
      ));

      return state;
    });

    await this.step("Secondary Pump ON", async () => {
      return await actions.turn_on_sec_pump_station(this.secondaryPumpId);
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
    console.error(
      `start_aircooled_primary_secondary failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_watercooled_primary_variable_with_steps(
  cond_setpoint = 0,
) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
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
        status: pri_seq_panelStatus,
        device: pri_seq_panel,
      } = find_priv_seq_panel(this.snapshot);
      if (
        !chillerStatus ||
        !coolingTowerStatus ||
        !condenserPumpStatus ||
        !pri_seq_panelStatus
      ) {
        return false;
      }

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      this.pri_seq_panel_id = pri_seq_panel.id;
      return true;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true, inlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { outlet: true, fan: false, inlet: true },
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

    await this.step("Primary Pump Station ON", async () => {
      return await actions.turn_on_pri_pump_station(this.pri_seq_panel_id);
    });

    await this.step("Evaluate Condenser Temperature", async () => {
      const retTemp = await actions.read_wc_cond_water_return_temperature();

      const setPoint = cond_setpoint;

      this.startChillerDirectly = Number(retTemp) < Number(setPoint);
      return true;
    });

    if (!this.startChillerDirectly) {
      await this.step("Cooling Tower Fans ON", async () => {
        const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
        if (ok) return true;

        ({ state } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.coolingTowerId,
          { valve: true, fan: true },
        ));

        return state;
      });
    }

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

async function start_watercooled_primary_fixed_with_steps(cond_setpoint = 0) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
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
      const { status: pri_pump_status, device: pri_pump } = find_pri_pump(
        this.snapshot,
      );

      if (
        !chillerStatus ||
        !coolingTowerStatus ||
        !condenserPumpStatus ||
        !pri_pump_status
      ) {
        return false;
      }

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      this.pri_pumpId = pri_pump.id;
      return true;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true, inlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { outlet: true, fan: false },
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

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.pri_pumpId);
      if (ok) return true;
      ({
        state,
        new_id: this.pri_pumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.pri_pumpId,
      ));

      return state;
    });

    await this.step("Evaluate Condenser Temperature", async () => {
      const retTemp = await actions.read_wc_cond_water_return_temperature();

      const setPoint = cond_setpoint;

      this.startChillerDirectly = Number(retTemp) < Number(setPoint);
      return true;
    });

    if (!this.startChillerDirectly) {
      await this.step("Cooling Tower Fans ON", async () => {
        const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
        if (ok) return true;

        ({ state } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.coolingTowerId,
          { valve: true, fan: true },
        ));

        return state;
      });
    }

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

async function start_watercooled_primary_secondary_with_steps() {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
    await this.step("Discover WC Chiller System Equipment", async () => {
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

      const { status: priPumpStatus, device: priPump } = find_pri_pump(
        this.snapshot,
      );

      const {
        status: sec_seq_panelStatus,
        device: sec_seq_panel,
      } = find_sec_seq_panel(this.snapshot);

      if (
        !chillerStatus ||
        !coolingTowerStatus ||
        !condenserPumpStatus ||
        !priPumpStatus ||
        !sec_seq_panelStatus
      )
        return false;

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      this.primaryPumpId = priPump.id;
      this.sec_seq_panel_id = sec_seq_panel[0]?.id;

      return true;
    });

    await this.step("Cooling Tower Valve OPEN", async () => {
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
        { inlet: true },
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

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.primaryPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.primaryPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.primaryPumpId,
      ));

      return state;
    });

    await this.step("Evaluate Condenser Temperature", async () => {
      const retTemp = await actions.read_wc_cond_water_return_temperature();
      const setPoint = cond_setpoint;

      this.startChillerDirectly = Number(retTemp) < Number(setPoint);
      return true;
    });
    if (!this.startChillerDirectly) {
      const fanOk = await this.step("Cooling Tower Fan ON", async () => {
        const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
        if (ok) return true;

        const {
          state,
          new_id,
        } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.coolingTowerId,
          { fan: true },
        );

        if (new_id) this.coolingTowerId = new_id;
        return state;
      });

      if (!fanOk) return false;
    }

    await this.step("Turn on sec pump station", async () => {
      return await actions.turn_on_sec_pump_station(this.sec_seq_panel_id);
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
    console.error(
      `start_watercooled_primary_secondary failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_watercooled_primary_secondary_2_station_with_steps() {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
    await this.step("Discover WC Chiller System Equipment", async () => {
      const { status: chillerStatus, device: chiller } = find_wc_chiller(
        this.snapshot,
      );

      // const {
      //   status: coolingTowerStatus,
      //   device: coolingTower,
      // } = find_cooling_tower(this.snapshot);

      const coolingTowers = await actions.get_inactive_pumps_and_cool_towers(
        controls.glDevices.cool_tower,
      );

      const {
        status: condenserPumpStatus,
        device: condenserPump,
      } = find_condenser_pump(this.snapshot);

      const { status: priPumpStatus, device: priPump } = find_pri_pump(
        this.snapshot,
      );

      // const {
      //   status: sec_seq_panelStatus,
      //   device: sec_seq_panels,
      // } = find_sec_seq_panel(this.snapshot);

      if (
        !chillerStatus ||
        coolingTowers?.length === 0 ||
        !condenserPumpStatus ||
        !priPumpStatus
        // ||
        // sec_seq_panels.length <= 1
      )
        return false;

      this.chillerId = chiller.id;
      this.condenserPumpId = condenserPump.id;
      this.primaryPumpId = priPump.id;
      this.priPumpId = priPump.id;
      this.cooling_tower1_id = coolingTowers[0]?.id;
      this.cooling_tower2_id = coolingTowers[1]?.id;
      this.coolingTowerId = this.cooling_tower1_id;
      // this.sec_seq_panel_1_id = sec_seq_panels[0]?.id;
      // this.sec_seq_panel_2_id = sec_seq_panels[1]?.id;
      return true;
    });

    await this.step("Cooling Tower1 Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.cooling_tower1_id,
        { inlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.cooling_tower1_id,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.cooling_tower1_id,
        { inlet: true },
      ));
      return state;
    });

    if (this.cooling_tower2_id) {
      await this.step("Cooling Tower2 Valve OPEN", async () => {
        const ok = await actions.turn_on_cooling_tower_valves(
          this.cooling_tower2_id,
          { inlet: true },
        );
        if (ok) return true;

        ({
          state,
          new_id: this.cooling_tower2_id,
        } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.cooling_tower2_id,
          { inlet: true },
        ));

        return state;
      });
    }

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

    await this.step("Primary Pump ON", async () => {
      const ok = await actions.turn_on_pri_pump(this.primaryPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.primaryPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_pump,
        this.primaryPumpId,
      ));

      return state;
    });

    // await this.step("Turn on sec pump station 1", async () => {
    //   return await actions.turn_on_sec_pump_station(this.sec_seq_panel_1_id);
    // });

    // await this.step(
    //   "awaiting for 10 seconds before starting station 2",
    //   async () => {
    //     await sleep(10000);
    //     return true;
    //   },
    // );

    // await this.step("Turn on sec pump station 2", async () => {
    //   return await actions.turn_on_sec_pump_station(this.sec_seq_panel_2_id);
    // });

    await this.step("Cooling Tower1 Fan ON", async () => {
      const fanOk = await actions.turn_on_cooling_towerfan(
        this.cooling_tower1_id,
      );
      if (fanOk) return true;

      const {
        state,
        new_id,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.cooling_tower1_id,
        { fan: true },
      );

      if (new_id) this.cooling_tower1_id = new_id;
      return state;
    });

    if (this.cooling_tower2_id) {
      await this.step("Cooling Tower2 Fan ON", async () => {
        const fanOk = await actions.turn_on_cooling_towerfan(
          this.cooling_tower2_id,
        );
        if (fanOk) return true;

        const {
          state,
          new_id,
        } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.cooling_tower2_id,
          { fan: true },
        );

        if (new_id) this.cooling_tower2_id = new_id;
        return state;
      });
    }

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
    console.error(
      `start_watercooled_primary_secondary failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_watercooled_primary_variable_type2_with_steps() {
  // condition should be at the start of discovery check whether two cooling towers
  // are available if not then skip the entire scenario.
  // this scenario needs to be changed according to above.
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
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
        status: pri_seq_panelStatus,
        device: pri_seq_panel,
      } = find_priv_seq_panel(this.snapshot);

      if (
        !chillerStatus ||
        !coolingTowerStatus ||
        !condenserPumpStatus ||
        !pri_seq_panelStatus
      )
        return false;

      this.chillerId = chiller.id;
      this.coolingTowerId = coolingTower.id;
      this.condenserPumpId = condenserPump.id;
      this.pri_seq_panel_id = pri_seq_panel.id;

      return true;
    });

    await this.step("Cooling Tower 1 Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { valve: true },
      ));

      return state;
    });

    const {
      status: coolingTowerStatus2,
      device: coolingTower2,
    } = find_cooling_tower(this.snapshot);

    this.coolingTowerId2 = coolingTower2.id;

    await this.step("Cooling Tower 2 Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId2,
        { outlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: coolingTower2.id,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        coolingTower2.id,
        { valve: true },
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

    await this.step("Primary Pump Station ON", async () => {
      return await actions.turn_on_pri_pump_station(this.pri_seq_panel_id);
    });

    await this.step("Evaluate Condenser Temperature", async () => {
      this.tempOk = await actions.read_wc_cond_water_return_temperature();
      return true;
    });

    if (!this.tempOk) {
      await this.step("Cooling Tower 1 Fan ON", async () => {
        const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
        if (ok) return true;

        ({ state } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.coolingTowerId,
          { fan: true },
        ));
        return state;
      });
    }

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
    console.error(
      `start_watercooled_primary_variable_type2 failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_aircooled_primary_variable_indv_with_steps() {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
    await this.step(
      "Discover Air-Cooled Chiller & Primary Variable Pump",
      async () => {
        const { status: chillerStatus, device: chiller } = find_ac_chiller(
          this.snapshot,
        );
        const {
          status: primVarPumpStatus,
          device: primVarPump,
        } = find_prim_var_pump(this.snapshot);

        if (!chillerStatus || !primVarPumpStatus) return false;

        this.chillerId = chiller.id;
        this.primVarPumpId = primVarPump.id;
        return true;
      },
    );

    await this.step("Air-Cooled Chiller Valve OPEN", async () => {
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

    await this.step("Primary Variable Pump ON", async () => {
      const ok = await actions.turn_on_prim_var_pump(this.primVarPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.primVarPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_var_pump,
        this.primVarPumpId,
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
    console.error(
      `start_aircooled_primary_variable_indv failed. error: ${err?.message}`,
    );
    return false;
  }
}

async function start_watercooled_primary_variable_indv_with_steps(
  cond_setpoint = 0,
) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();

  try {
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

    await this.step("Cooling Tower Valve OPEN", async () => {
      const ok = await actions.turn_on_cooling_tower_valves(
        this.coolingTowerId,
        { outlet: true, inlet: true },
      );
      if (ok) return true;

      ({
        state,
        new_id: this.coolingTowerId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.cool_tower,
        this.coolingTowerId,
        { outlet: true, fan: false, inlet: true },
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

    await this.step("Primary Variable Pump ON", async () => {
      const ok = await actions.turn_on_prim_var_pump(this.primVarPumpId);
      if (ok) return true;

      ({
        state,
        new_id: this.primVarPumpId,
      } = await recovery_actions.set_device_state_fault(
        controls.glDevices.prim_var_pump,
        this.primVarPumpId,
      ));

      return state;
    });

    await this.step("Evaluate Condenser Temperature", async () => {
      const retTemp = await actions.read_wc_cond_water_return_temperature();
      const setPoint = cond_setpoint;
      this.startChillerDirectly = Number(retTemp) < Number(setPoint);
      return true;
    });

    if (!this.startChillerDirectly) {
      await this.step("Cooling Tower Fans ON", async () => {
        const ok = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
        if (ok) return true;

        ({ state } = await recovery_actions.set_device_state_fault(
          controls.glDevices.cool_tower,
          this.coolingTowerId,
          { valve: true, fan: true },
        ));

        return state;
      });
    }

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
    console.error(
      `start_watercooled_primary_variable_indv failed. error: ${err?.message}`,
    );
    return false;
  }
}

module.exports = {
  start_aircooled_primary_variable_with_steps,
  start_aircooled_primary_secondary_with_steps,
  start_watercooled_primary_variable_with_steps,
  start_watercooled_primary_fixed_with_steps,
  start_watercooled_primary_secondary_with_steps,
  start_watercooled_primary_variable_type2_with_steps,
  start_aircooled_primary_variable_indv_with_steps,
  start_watercooled_primary_variable_indv_with_steps,
  start_watercooled_primary_secondary_2_station_with_steps,
};
