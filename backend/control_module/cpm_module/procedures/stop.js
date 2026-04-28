const actions = require("../../actions");
const controls = require("../../controls");
const { sleep } = require("../../controls/utils.js");

async function stop_aircooled_primary_variable_with_steps() {
  this.auto_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  if (this.auto_chillers.length === 0) {
    console.error(
      "No active aircooled chillers / primary pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF AC Chiller ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller(chiller.id),
        ),
      ),
  );

  const privSeqPanel = await this.step(
    "Fetch Active Primary Pump Station",
    async () =>
      actions.get_active_pumps_and_cool_towers(
        controls.glDevices.priv_seq_panel,
      ),
  );

  if (privSeqPanel.length === 0) {
    console.error("No active primary pump station found to stop.");
    return false;
  }

  this.priPumpId = privSeqPanel[0]?.id;
  if (this.priPumpId) {
    await this.step("Turn OFF Primary Pump Station", async () =>
      actions.turn_off_pri_pump_station(this.priPumpId),
    );
  }

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close AC Chiller Valve ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller_valve(chiller.id),
        ),
      ),
  );

  console.log("STOP Aircooled Primary Variable completed successfully");
  return true;
}

async function stop_aircooled_primary_secondary_with_steps() {
  this.auto_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  this.auto_pri_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );

  this.auto_sec_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.sec_pump,
  );

  if (
    (this.auto_chillers.length === 0) &
    (this.auto_pri_pumps.length === 0) &
    (this.auto_sec_pumps.length === 0)
  ) {
    console.error(
      "No active aircooled chillers / primary pumps / secondary pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF AC Chiller ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller(chiller.id),
        ),
      ),
  );

  await Promise.all(
    this.auto_pri_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Primary Pump ${pump.id}`, async () =>
          actions.turn_off_pri_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.auto_sec_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Secondary Pump ${pump.id}`, async () =>
          actions.turn_off_sec_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close AC Chiller Valve ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller_valve(chiller.id),
        ),
      ),
  );

  console.log("STOP Aircooled Primary Secondary completed successfully");
  return true;
}

async function stop_watercooled_primary_variable_with_steps() {
  this.wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  this.cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  this.cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  if (
    (this.wc_chillers.length === 0) &
    (this.cooling_towers.length === 0) &
    (this.cond_pumps.length === 0)
  ) {
    console.error(
      "No active watercooled chillers / cooing towers / condenser pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  const privSeqPanel = await this.step(
    "Fetch Active Primary Pump Station",
    async () =>
      actions.get_active_pumps_and_cool_towers(
        controls.glDevices.priv_seq_panel,
      ),
  );

  if (privSeqPanel.length === 0) {
    console.error("No active primary pump station found to stop.");
    return false;
  }

  this.priPumpId = privSeqPanel[0]?.id;
  if (this.priPumpId) {
    await this.step("Turn OFF Primary Pump Station", async () =>
      actions.turn_off_pri_pump_station(this.priPumpId),
    );
  }

  await Promise.all(
    this.cond_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        ),
      ),
  );

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close WC Chiller Valves ${chiller.id}`, async () =>
          actions.turn_off_valves_for_chiller_type(
            controls.glDevices.wc_chiller,
            chiller.id,
          ),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Close Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, {
            outlet: true,
            inlet: true,
          }),
        ),
      ),
  );

  console.log("STOP Watercooled Primary Variable completed successfully");
  return true;
}

async function stop_watercooled_primary_fixed_with_steps() {
  this.wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  this.cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  this.cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );

  this.primary_pump = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );

  if (
    (this.wc_chillers.length === 0) &
    (this.cooling_towers.length === 0) &
    (this.cond_pumps.length === 0) &
    (this.primary_pump.length === 0)
  ) {
    console.error(
      "No active watercooled chillers / cooling towers / condenser pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  await Promise.all(
    this.cond_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        ),
      ),
  );

  await Promise.all(
    this.primary_pump
      .filter((prPump) => prPump?.id)
      .map((prPump) =>
        this.step(`Turn OFF Primary Pump ${prPump.id}`, async () =>
          actions.turn_off_pri_pump(prPump.id),
        ),
      ),
  );

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close WC Chiller Valves ${chiller.id}`, async () =>
          actions.turn_off_valves_for_chiller_type(
            controls.glDevices.wc_chiller,
            chiller.id,
          ),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Close Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, {
            outlet: true,
          }),
        ),
      ),
  );

  console.log("STOP Watercooled Primary Variable completed successfully");
  return true;
}

async function stop_watercooled_primary_variable_type2() {
  this.active_wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  this.active_cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  this.active_condenser_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  if (
    (this.active_wc_chillers.length === 0) &
    (this.active_cooling_towers.length === 0) &
    (this.active_condenser_pumps.length === 0)
  ) {
    console.error("No active watercooled chillers devices found to stop.");
    return false;
  }

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  const privSeqPanel = await this.step(
    "Fetch Active Primary Pump Station",
    async () =>
      actions.get_active_pumps_and_cool_towers(
        controls.glDevices.priv_seq_panel,
      ),
  );

  if (privSeqPanel.length === 0) {
    console.error("No active primary pump station found to stop.");
    return false;
  }

  this.priPumpId = privSeqPanel[0]?.id;
  if (this.priPumpId) {
    await this.step("Turn OFF Primary Pump Station", async () =>
      actions.turn_off_pri_pump_station(this.priPumpId),
    );
  }

  await Promise.all(
    this.active_cooling_towers
      .filter((tower) => tower?.id)
      .map(async (tower) => {
        await this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        );
        await this.step(`Turn OFF Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, { outlet: true }),
        );
      }),
  );

  await Promise.all(
    this.active_condenser_pumps
      .filter((pump) => pump?.id)
      .map(async (pump) => {
        await this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        );
        await this.step(`Turn OFF Condenser Pump Valve ${pump.id}`, async () =>
          actions.turn_off_wc_chiller_cond_valve(pump.id),
        );
      }),
  );

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller Valve ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller_valve(chiller.id),
        ),
      ),
  );

  return true;
}

async function stop_watercooled_primary_secondary() {
  this.active_wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  this.active_pri_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );
  this.active_cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  this.active_condenser_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );
  this.sec_seq_panels = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.sec_seq_panel,
  );
  this.sec_seq_panel_id = this.sec_seq_panels[0]?.id;
  if (
    (this.active_wc_chillers.length === 0) &
    (this.active_pri_pumps.length === 0) &
    (this.active_cooling_towers.length === 0) &
    (this.active_condenser_pumps.length === 0) &
    (this.sec_seq_panels.length === 0)
  ) {
    console.error("No active watercooled chillers devices found to stop.");
    return false;
  }

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  if (this.sec_seq_panel_id) {
    await this.step("Secondary Pump Station OFF", async () => {
      return await actions.turn_off_sec_pump_station(this.sec_seq_panel_id);
    });
  }

  await Promise.all(
    this.active_cooling_towers
      .filter((tower) => tower?.id)
      .map(async (tower) => {
        await this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        );
        await this.step(`Turn OFF Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, { outlet: true }),
        );
      }),
  );

  await Promise.all(
    this.active_condenser_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map(async (chiller) => {
        await this.step(
          `Turn OFF WC Chiller Condenser Valve ${chiller.id}`,
          async () => actions.turn_off_condenser_pump_valve(chiller.id),
        );
        await this.step(
          `Turn OFF WC Chiller Evaporator Valve ${chiller.id}`,
          async () => actions.turn_off_wc_chiller_valve(chiller.id),
        );
      }),
  );

  return true;
}

async function stop_aircooled_primary_variable_indv_with_steps() {
  this.auto_chillers = await actions.get_active_chillers(
    controls.glDevices.ac_chiller,
  );

  this.active_prim_var_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_var_pump,
  );

  if (
    (this.auto_chillers.length === 0) &
    (this.active_prim_var_pumps.length === 0)
  ) {
    console.error(
      "No active aircooled chillers / primary variable pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF AC Chiller ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller(chiller.id),
        ),
      ),
  );

  await Promise.all(
    this.active_prim_var_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Primary Variable Pump ${pump.id}`, async () =>
          actions.turn_off_prim_var_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.auto_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close AC Chiller Valve ${chiller.id}`, async () =>
          actions.turn_off_ac_chiller_valve(chiller.id),
        ),
      ),
  );

  console.log("STOP Aircooled Primary Variable Indv completed successfully");
  return true;
}

async function stop_watercooled_primary_variable_indv_with_steps() {
  this.wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );

  this.cond_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );

  this.cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );

  this.active_prim_var_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_var_pump,
  );

  if (
    (this.wc_chillers.length === 0) &
    (this.cooling_towers.length === 0) &
    (this.cond_pumps.length === 0) &
    (this.active_prim_var_pumps.length === 0)
  ) {
    console.error(
      "No active watercooled chillers / cooling towers / condenser pumps / primary variable pumps found to stop.",
    );
    return false;
  }

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  await Promise.all(
    this.active_prim_var_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Primary Variable Pump ${pump.id}`, async () =>
          actions.turn_off_prim_var_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.cond_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        ),
      ),
  );

  await Promise.all(
    this.wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Close WC Chiller Valves ${chiller.id}`, async () =>
          actions.turn_off_valves_for_chiller_type(
            controls.glDevices.wc_chiller,
            chiller.id,
          ),
        ),
      ),
  );

  await Promise.all(
    this.cooling_towers
      .filter((tower) => tower?.id)
      .map((tower) =>
        this.step(`Close Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, {
            outlet: true,
            inlet: true,
          }),
        ),
      ),
  );

  console.log("STOP Watercooled Primary Variable Indv completed successfully");
  return true;
}

async function stop_watercooled_primary_secondary_2_stations() {
  this.active_wc_chillers = await actions.get_active_chillers(
    controls.glDevices.wc_chiller,
  );
  this.active_pri_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.prim_pump,
  );
  this.active_cooling_towers = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cool_tower,
  );
  this.active_condenser_pumps = await actions.get_active_pumps_and_cool_towers(
    controls.glDevices.cond_pump,
  );
  // this.sec_seq_panels = await actions.get_active_pumps_and_cool_towers(
  //   controls.glDevices.sec_seq_panel,
  // );
  if (
    (this.active_wc_chillers.length === 0) &
    (this.active_pri_pumps.length === 0) &
    (this.active_cooling_towers.length === 0) &
    (this.active_condenser_pumps.length === 0)
    // &    (this.sec_seq_panels.length === 0)
  ) {
    console.error("No active watercooled chillers devices found to stop.");
    return false;
  }

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map((chiller) =>
        this.step(`Turn OFF WC Chiller ${chiller.id}`, async () =>
          actions.turn_off_wc_chiller(chiller.id),
        ),
      ),
  );

  await sleep(80000);

  // for (const sec_seq_panel of this.sec_seq_panels) {
  //   if (!sec_seq_panel?.id) continue;

  //   await this.step("Secondary Pump Station OFF", async () =>
  //     actions.turn_off_sec_pump_station(sec_seq_panel.id),
  //   );
  // }

  await Promise.all(
    this.active_condenser_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Condenser Pump ${pump.id}`, async () =>
          actions.turn_off_condenser_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.active_pri_pumps
      .filter((pump) => pump?.id)
      .map((pump) =>
        this.step(`Turn OFF Primary Pump ${pump.id}`, async () =>
          actions.turn_off_pri_pump(pump.id),
        ),
      ),
  );

  await Promise.all(
    this.active_cooling_towers
      .filter((tower) => tower?.id)
      .map(async (tower) => {
        await this.step(`Turn OFF Cooling Tower Fan ${tower.id}`, async () =>
          actions.turn_off_cooling_towerfan(tower.id),
        );
        await this.step(`Turn OFF Cooling Tower Valve ${tower.id}`, async () =>
          actions.turn_off_cooling_tower_valves(tower.id, { inlet: true }),
        );
      }),
  );

  await Promise.all(
    this.active_wc_chillers
      .filter((chiller) => chiller?.id)
      .map(async (chiller) => {
        await this.step(
          `Turn OFF WC Chiller Condenser Valve ${chiller.id}`,
          async () => actions.turn_off_wc_chiller_cond_valve(chiller.id),
        );
        await this.step(
          `Turn OFF WC Chiller Evaporator Valve ${chiller.id}`,
          async () => actions.turn_off_wc_chiller_valve(chiller.id),
        );
      }),
  );

  return true;
}

module.exports = {
  stop_aircooled_primary_variable_with_steps,
  stop_aircooled_primary_secondary_with_steps,
  stop_watercooled_primary_variable_with_steps,
  stop_watercooled_primary_fixed_with_steps,
  stop_watercooled_primary_variable_type2,
  stop_watercooled_primary_secondary,
  stop_aircooled_primary_variable_indv_with_steps,
  stop_watercooled_primary_variable_indv_with_steps,
  stop_watercooled_primary_secondary_2_stations,
};
