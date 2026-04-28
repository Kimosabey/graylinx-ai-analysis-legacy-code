const controls = require("../controls");
const state = controls.state;

const BASE_SP = 9.5;
const MAX_SP = 11.0;
const STEP = 0.5;
const DEADBAND = 0.02;
const SOAK_TIME = 15 * 60 * 1000;
const setPointPram = "cmd_evap_leaving_temp_00";

async function set_chiller_setpoint(value) {
  const snapshot = await controls.loadSnapshot();

  const chillers = Object.values(
    snapshot[controls.glDeviceSnapShotMap.wc_chiller.key],
  );

  for (const chiller of chillers) {
    try {
      await controls.handleUIActionControl(
        controls.glDeviceSnapShotMap.wc_chiller.key,
        chiller.id,
        value,
        "set",
        setPointPram,
      );
    } catch (error) {
      console.log(error);
    }
  }

  return true;
}

// Day: 07:00–20:00 | Night: 20:00–07:00
async function isMorningOrNight() {
  const h = new Date().getHours();
  if (h >= 7 && h < 20) return "day";
  return "night";
}

async function setNightSetpointForRunningChillers() {
  const snapshot = await controls.loadSnapshot();
  const chillers = Object.values(
    snapshot[controls.glDeviceSnapShotMap.wc_chiller.key],
  );

  const paramGroup = controls.glDevices.paramGroup;
  const statusField = controls.glDeviceSnapShotMap.wc_chiller.status;

  for (const chiller of chillers) {
    const status = chiller?.[paramGroup]?.[statusField]?.presentValue;
    const isRunning = controls.active_device_states.includes(status);
    if (!isRunning) continue;

    const currentSP = chiller?.[paramGroup]?.[setPointPram]?.presentValue;
    console.log(
      `[NIGHT]     Chiller ${chiller.id} running | SP = ${currentSP} → ${MAX_SP}°C`,
    );

    if (currentSP === MAX_SP) continue;

    try {
      await controls.handleUIActionControl(
        controls.glDeviceSnapShotMap.wc_chiller.key,
        chiller.id,
        MAX_SP,
        "set",
        setPointPram,
      );
    } catch (error) {
      console.log(error);
    }
  }
}

async function isSoakElapsed() {
  if (!state.soakTimerStart) return true;
  return Date.now() - state.soakTimerStart >= SOAK_TIME;
}

async function calcDeltaKW() {
  return state.currentPlantKW - state.previousPlantKW;
}

async function isEnergyRising() {
  const threshold = state.previousPlantKW * DEADBAND;
  return (await calcDeltaKW()) > threshold;
}

async function isEnergyFlatOrFalling() {
  return !(await isEnergyRising());
}

async function isAtMaxSetpoint() {
  return state.elwtSP >= MAX_SP;
}

async function isSteppingUp() {
  return !state.reverseMode && !(await isAtMaxSetpoint());
}

async function isSteppingDown() {
  return state.reverseMode || (await isAtMaxSetpoint());
}

async function stepSetpointUp() {
  state.elwtSP += STEP;
  await clampSetpoint();
  await resetSoakTimer();
  state.lastAction = "STEP_UP";
  console.log(`[STEP UP]   ELWT_SP → ${state.elwtSP.toFixed(1)}°C`);
  await set_chiller_setpoint(state.elwtSP);
}

async function stepSetpointDown() {
  state.elwtSP -= STEP;
  await clampSetpoint();
  await resetSoakTimer();
  state.lastAction = "STEP_DOWN";
  console.log(`[STEP DOWN] ELWT_SP → ${state.elwtSP.toFixed(1)}°C`);
  await set_chiller_setpoint(state.elwtSP);
}

async function holdSetpoint() {
  state.lastAction = "HOLD";
  console.log(`[HOLD]      ELWT_SP = ${state.elwtSP.toFixed(1)}°C`);
}

async function clampSetpoint() {
  state.elwtSP = Math.min(MAX_SP, Math.max(BASE_SP, state.elwtSP));
}

async function resetSoakTimer() {
  state.soakTimerStart = Date.now();
}

async function updateEnergyBaseline() {
  state.previousPlantKW = state.currentPlantKW;
}

async function evaluateSetpointStep() {
  if (!(await isSoakElapsed())) {
    console.log(`[SOAK]      Waiting... (${state.elwtSP.toFixed(1)}°C)`);
    return;
  }

  const delta = await calcDeltaKW();
  console.log(
    `[EVAL]      ΔkW = ${delta.toFixed(2)} kW | SP = ${state.elwtSP.toFixed(
      1,
    )}°C`,
  );

  if (await isSteppingUp()) {
    (await isEnergyFlatOrFalling())
      ? await stepSetpointUp()
      : await holdSetpoint();
  } else if (await isSteppingDown()) {
    (await isEnergyRising()) ? await stepSetpointDown() : await holdSetpoint();
  }

  if (await isAtMaxSetpoint()) {
    state.reverseMode = true;
  }

  if (state.elwtSP <= BASE_SP) {
    state.reverseMode = false;
  }

  await updateEnergyBaseline();
}

async function runNightlySetpointOptimizer(currentKW) {
  state.currentPlantKW = currentKW;

  const dayNight = await isMorningOrNight();

  if (dayNight === "night") {
    await setNightSetpointForRunningChillers();
    return { mode: "night", setpoint: MAX_SP };
  }

  await evaluateSetpointStep();

  return {
    elwtSP: state.elwtSP,
    lastAction: state.lastAction,
    deltaKW: await calcDeltaKW(),
  };
}

module.exports = {
  runNightlySetpointOptimizer,
  set_chiller_setpoint,
};
