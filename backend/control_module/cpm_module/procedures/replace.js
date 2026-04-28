const actions = require("../../actions");
const recovery_actions = require("../../recovery_actions.js");
const controls = require("../../controls");

const {
  find_wc_chiller,
  find_ac_chiller,
  find_pri_pump,
  find_sec_pump,
  find_cooling_tower,
  find_condenser_pump,
} = require("../../controls");

async function replace_primary_pump_with_steps(replacePrimPumpId) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replacePrimPumpId = replacePrimPumpId;
  await this.step("Turn OFF primary pump (old)", async () => {
    if (!replacePrimPumpId) return true;

    const off = await actions.turn_off_pri_pump(this.replacePrimPumpId);
    return off !== false;
  });

  this.pumpId = await this.step("Find primary pump", async () => {
    const { status: pumpStatus, device: pump } = find_pri_pump(this.snapshot);

    if (!pumpStatus || !pump?.id) {
      console.error("Pump not found");
      return false;
    }

    return pump.id;
  });

  await this.step("Turn ON primary pump", async () => {
    const pumpOn = await actions.turn_on_pri_pump(this.pumpId);
    if (pumpOn) return true;

    ({
      state,
      new_id: this.pumpId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.prim_pump,
      this.pumpId,
    ));

    return state;
  });

  return true;
}

async function replace_secondary_pump_with_steps(replaceSecPumpId) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceSecPumpId = replaceSecPumpId;

  await this.step("Turn OFF secondary pump (old)", async () => {
    if (!replaceSecPumpId) return true;

    const off = await actions.turn_off_sec_pump(this.replaceSecPumpId);
    return off !== false;
  });

  this.pumpId = await this.step("Find secondary pump", async () => {
    const { status: pumpStatus, device: pump } = find_sec_pump(this.snapshot);

    if (!pumpStatus || !pump?.id) {
      console.error("Pump not found");
      return false;
    }

    return pump.id;
  });

  await this.step("Turn ON secondary pump", async () => {
    const pumpOn = await actions.turn_on_sec_pump(this.pumpId);
    if (pumpOn) return true;

    ({
      state,
      new_id: this.pumpId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.sec_pump,
      this.pumpId,
    ));

    return state;
  });

  return true;
}

async function replace_condensor_pump_with_steps(replaceCondPumpId) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceCondPumpId = replaceCondPumpId;

  await this.step("Turn OFF condenser pump (old)", async () => {
    if (!replaceCondPumpId) return true;

    const off = await actions.turn_off_condenser_pump(this.replaceCondPumpId);
    return off !== false;
  });

  this.pumpId = await this.step("Find condenser pump", async () => {
    const { status: pumpStatus, device: pump } = find_condenser_pump(
      this.snapshot,
    );

    if (!pumpStatus || !pump?.id) {
      console.error("Pump not found");
      return false;
    }

    return pump.id;
  });

  await this.step("Turn ON condenser pump", async () => {
    const pumpOn = await actions.turn_on_condenser_pump(this.pumpId);
    if (pumpOn) return true;

    ({
      state,
      new_id: this.pumpId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.cond_pump,
      this.pumpId,
    ));

    return state;
  });

  return true;
}

async function replace_cooling_tower_with_steps(replaceCoolingTowerId) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceCoolingTowerId = replaceCoolingTowerId;

  this.coolingTowerId = await this.step("Find cooling tower", async () => {
    const {
      status: coolingTowerStatus,
      device: coolingTower,
    } = find_cooling_tower(this.snapshot);

    if (!coolingTowerStatus || !coolingTower?.id) {
      console.error("Cooling tower not found");
      return false;
    }

    return coolingTower.id;
  });

  await this.step("Turn ON cooling tower fan", async () => {
    const fanOn = await actions.turn_on_cooling_towerfan(this.coolingTowerId);
    if (fanOn) return true;

    ({
      state,
      new_id: this.coolingTowerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.cool_tower,
      this.coolingTowerId,
    ));

    return state;
  });

  await this.step("Open cooling tower valve", async () => {
    const valveOpen = await actions.turn_on_cooling_tower_valves(
      this.coolingTowerId,
      { outlet: true },
    );
    if (valveOpen) return true;

    ({
      state,
      new_id: this.coolingTowerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.cool_tower,
      this.coolingTowerId,
    ));

    return state;
  });

  await this.step("Turn OFF old cooling tower (if provided)", async () => {
    if (!replaceCoolingTowerId) return true;

    const valveOff = await actions.turn_off_cooling_tower_valves(
      this.replaceCoolingTowerId,
      {
        outlet: true,
      },
    );
    if (valveOff === false) return false;

    const towerOff = await actions.turn_off_cooling_towerfan(
      this.replaceCoolingTowerId,
    );
    return towerOff !== false;
  });

  return true;
}

async function replace_aircooled_primary_variable_with_steps(replaceChillerId) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceChillerId = replaceChillerId;

  await this.step("Turn OFF chiller to be replaced", async () => {
    if (!this.replaceChillerId) return true;

    const off = await actions.turn_off_ac_chiller(this.replaceChillerId);
    return off !== false;
  });

  this.chillerId = await this.step("Find air-cooled chiller", async () => {
    const { status: chillerStatus, device: chiller } = find_ac_chiller(
      this.snapshot,
    );

    if (!chillerStatus || !chiller?.id) {
      console.error("Chiller not found");
      return false;
    }

    return chiller.id;
  });

  await this.step("Open evaporator valve (new)", async () => {
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

  await this.step("Close evaporator valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_ac_chiller_valve(this.replaceChillerId);
    return ok !== false;
  });

  await this.step("Turn ON air-cooled chiller (new)", async () => {
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
}

async function replace_aircooled_primary_secondary_with_steps(
  replaceChillerId,
) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceChillerId = replaceChillerId;

  await this.step("Turn OFF old air-cooled chiller", async () => {
    if (!this.replaceChillerId) return true;

    const off = await actions.turn_off_ac_chiller(this.replaceChillerId);
    return off !== false;
  });

  this.chillerId = await this.step("Find air-cooled chiller", async () => {
    const { status: chillerStatus, device: chiller } = find_ac_chiller(
      this.snapshot,
    );

    if (!chillerStatus || !chiller?.id) {
      console.error("Chiller not found");
      return false;
    }

    return chiller.id;
  });

  await this.step("Open air-cooled chiller valve (new)", async () => {
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

  await this.step("Close air-cooled chiller valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_ac_chiller_valve(this.replaceChillerId);
    return ok !== false;
  });

  await this.step("Turn ON air-cooled chiller (new)", async () => {
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
}

async function replace_watercooled_primary_variable_type2_with_steps(
  replaceChillerId,
) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceChillerId = replaceChillerId;

  await this.step(
    "Turn OFF old water-cooled chiller (if provided)",
    async () => {
      if (!this.replaceChillerId) return true;

      const off = await actions.turn_off_wc_chiller(this.replaceChillerId);
      return off !== false;
    },
  );

  this.chillerId = await this.step("Find water-cooled chiller", async () => {
    const { status: chillerStatus, device: chiller } = find_wc_chiller(
      this.snapshot,
    );

    if (!chillerStatus || !chiller?.id) {
      console.error("Chiller not found");
      return false;
    }

    return chiller.id;
  });

  await this.step("Close condenser pump valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_wc_chiller_cond_valve(
      this.replaceChillerId,
    );
    return ok !== false;
  });

  await this.step("Open condenser pump valve (new)", async () => {
    const ok = await actions.turn_on_wc_chiller_cond_valve(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
    ));

    return state;
  });

  await this.step("Open evaporator valve (new)", async () => {
    const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
      { chiller: true },
    ));

    return state;
  });

  await this.step("Close evaporator valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_wc_chiller_valve(this.replaceChillerId);
    return ok !== false;
  });

  await this.step("Turn ON water-cooled chiller (new)", async () => {
    const ok = await actions.turn_on_wc_chiller(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
      { eva: true, cond: true, chiller: true },
    ));

    return state;
  });

  return true;
}

async function replace_watercooled_primary_with_steps(replaceChillerId) {
  let state = false;
  this.replaceChillerId = replaceChillerId;
  try {
    if (this.replaceChillerId) {
      await this.step(
        `Turn OFF faulty/toReplace WC Chiller ${this.replaceChillerId}`,
        async () => await actions.turn_off_wc_chiller(this.replaceChillerId),
      );
    }

    this.snapshot = await this.step(
      "Load Plant Snapshot",
      async () => await controls.loadSnapshot(),
    );

    const {
      status: chillerStatus,
      device: chiller,
    } = await this.step("Find Replacement WC Chiller", async () =>
      find_wc_chiller(this.snapshot),
    );

    if (!chillerStatus || !chiller?.id) {
      console.error("Chiller not found to replace");
      throw new Error("Chiller not found to replace");
    }

    this.chillerId = chiller.id;

    if (this.replaceChillerId) {
      await this.step(
        `Close WC Condenser Valve ${this.replaceChillerId}`,
        async () =>
          await actions.turn_off_wc_chiller_cond_valve(this.replaceChillerId),
      );
    }

    await this.step(`Open Condenser Valve ${this.chillerId}`, async () => {
      const success = await actions.turn_on_wc_chiller_cond_valve(
        this.chillerId,
      );

      if (success) return true;
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

    await this.step(`Open Evaporator Valve ${this.chillerId}`, async () => {
      const success = await actions.turn_on_wc_chiller_valve(this.chillerId);
      if (success) return true;
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

    if (this.replaceChillerId) {
      await this.step(
        `Close Evaporator Valve ${this.replaceChillerId}`,
        async () => actions.turn_off_wc_chiller_valve(this.replaceChillerId),
      );
    }

    await this.step(`Start WC Chiller ${this.chillerId}`, async () => {
      const success = await actions.turn_on_wc_chiller(this.chillerId);
      if (!success) {
        await recovery_actions.set_device_state_fault(
          controls.glDevices.wc_chiller,
          this.chillerId,
          { eva: true, cond: true, chiller: true },
        );
      }
      return success;
    });

    return true;
  } catch (e) {
    console.error(e.message);
    return false;
  }
}

async function replace_watercooled_primary_secondary_with_steps(
  replaceChillerId,
) {
  let state = false;
  this.snapshot = await controls.loadSnapshot();
  this.replaceChillerId = replaceChillerId;

  await this.step("Turn OFF old water-cooled chiller", async () => {
    if (!this.replaceChillerId) return true;

    const off = await actions.turn_off_wc_chiller(this.replaceChillerId);
    return off !== false;
  });

  this.chillerId = await this.step("Find water-cooled chiller", async () => {
    const { status: chillerStatus, device: chiller } = find_wc_chiller(
      this.snapshot,
    );

    if (!chillerStatus || !chiller?.id) {
      console.error("Chiller not found");
      return false;
    }

    return chiller.id;
  });

  await this.step("Close condenser pump valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_wc_chiller_cond_valve(
      this.replaceChillerId,
    );
    return ok !== false;
  });

  await this.step("Open condenser pump valve (new)", async () => {
    const ok = await actions.turn_on_wc_chiller_cond_valve(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
    ));

    return state;
  });

  await this.step("Open evaporator valve (new)", async () => {
    const ok = await actions.turn_on_wc_chiller_valve(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
    ));

    return state;
  });

  await this.step("Close evaporator valve (old)", async () => {
    if (!this.replaceChillerId) return true;

    const ok = await actions.turn_off_wc_chiller_valve(this.replaceChillerId);
    return ok !== false;
  });

  await this.step("Turn ON water-cooled chiller (new)", async () => {
    const ok = await actions.turn_on_wc_chiller(this.chillerId);
    if (ok) return true;

    ({
      state,
      new_id: this.chillerId,
    } = await recovery_actions.set_device_state_fault(
      controls.glDevices.wc_chiller,
      this.chillerId,
    ));

    return state;
  });

  return true;
}

module.exports = {
  replace_primary_pump_with_steps,
  replace_secondary_pump_with_steps,
  replace_condensor_pump_with_steps,
  replace_cooling_tower_with_steps,
  replace_aircooled_primary_variable_with_steps,
  replace_aircooled_primary_secondary_with_steps,
  replace_watercooled_primary_variable_type2_with_steps,
  replace_watercooled_primary_with_steps,
  replace_watercooled_primary_secondary_with_steps,
};
