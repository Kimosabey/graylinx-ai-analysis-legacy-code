const STEPS = [
  "DISCOVER",
  "CT_VALVE",
  "COND_VALVE",
  "EVA_VALVE",
  "COND_PUMP",
  "PRI_PUMP",
  "TEMP_EVAL",
  "CT_FAN",
  "CHILLER_ON",
];
const set_checkpoint = async (step) => {
  checkpoint = step;
};
const get_checkpoint = async () => checkpoint;

const clear_checkpoint = async () => {
  checkpoint = null;
};

async function runStep(stepName, fn) {
  console.log(`Running step: ${stepName}`);

  const success = await fn();

  if (!success) {
    console.error(`Step failed: ${stepName}`);
    throw new Error(`Step failed: ${stepName}`);
  }

  await controls.set_checkpoint(stepName);
}

async function start_watercooled_primary_variable_with_steps(cond_setpoint) {
  const snapshot = await controls.loadSnapshot();
  const lastStep = await get_checkpoint();

  const startIndex = lastStep ? STEPS.indexOf(lastStep) + 1 : 0;

  try {
    for (let i = startIndex; i < STEPS.length; i++) {
      const step = STEPS[i];
      // discovered devices should be put in somewhere so that they can be used in later steps on retry instead of rediscovering
      switch (step) {
        case "DISCOVER":
          await runStep(step, async () => {
            const { status, device } = find_wc_chiller(snapshot, "5.0", "0.0");
            if (!status) return false;
            this.chillerId = device.id;
            return true;
          });
          break;

        case "CT_VALVE":
          await runStep(step, () =>
            actions.turn_on_cooling_tower_valve(this.coolingTowerId)
          );
          break;

        case "COND_VALVE":
          await runStep(step, () =>
            actions.turn_on_wc_chiller_cond_valve(this.chillerId)
          );
          break;

        case "EVA_VALVE":
          await runStep(step, () =>
            actions.turn_on_wc_chiller_valve(this.chillerId)
          );
          break;

        case "COND_PUMP":
          await runStep(step, () =>
            actions.turn_on_condenser_pump(this.condenserPumpId)
          );
          break;

        case "PRI_PUMP":
          await runStep(step, () =>
            actions.turn_on_pri_pump_station(this.pri_seq_panel_id)
          );
          break;

        case "TEMP_EVAL":
          await runStep(step, async () => {
            const retTemp = await actions.read_wc_cond_water_return_temperature();
            this.startChillerDirectly = Number(retTemp) < Number(cond_setpoint);
            return true;
          });
          break;

        case "CT_FAN":
          if (!this.startChillerDirectly) {
            await runStep(step, () =>
              actions.turn_on_cooling_towerfan(this.coolingTowerId)
            );
          }
          break;

        case "CHILLER_ON":
          await runStep(step, () => actions.turn_on_wc_chiller(this.chillerId));
          break;
      }
    }

    await controls.clear_checkpoint();
    return true;
  } catch (err) {
    console.error("Workflow paused due to failure:", err.message);
    return false;
  }
}
