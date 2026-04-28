const plant_snapshot = require("../plant_snapshot.js");
const { glDeviceSnapShotMap } = require("./constants");

let snapshotCache = {
  data: null,
  fetchedAt: 0,
};

async function loadSnapshot(ttlMs = 10000) {
  const now = Date.now();

  if (snapshotCache.data && now - snapshotCache.fetchedAt < ttlMs) {
    console.log("Using cached snapshot data");
    return snapshotCache.data;
  }
  const snapshot = await plant_snapshot.prepare_plant_snapshot();
  if (snapshot) {
    snapshotCache = { data: snapshot, fetchedAt: now };
    return snapshot;
  }
  return null;
}

async function get_flow_meters() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { flow_meters: [], flow_meter_count: 0 };
  const flow_meters = Object.values(
    snaphot[glDeviceSnapShotMap.flow_meter.key],
  );
  const flow_meter_count = Object.keys(flow_meters).length;
  return { flow_meters, flow_meter_count };
}

async function get_wc_chillers() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { wc_chillers: [], wc_chiller_count: 0 };
  const wc_chillers = Object.values(
    snaphot[glDeviceSnapShotMap.wc_chiller.key],
  );
  const wc_chiller_count = Object.keys(wc_chillers).length;
  return { wc_chillers, wc_chiller_count };
}

async function get_ac_chillers() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { ac_chillers: [], ac_chiller_count: 0 };
  const ac_chillers = Object.values(
    snaphot[glDeviceSnapShotMap.ac_chiller.key],
  );
  const ac_chiller_count = Object.keys(ac_chillers).length;
  return { ac_chillers, ac_chiller_count };
}

async function get_primary_variable_pumps() {
  const snaphot = await loadSnapshot();
  if (!snaphot)
    return { primary_variable_pumps: [], primary_variable_pump_count: 0 };
  const primary_variable_pumps = Object.values(
    snaphot[glDeviceSnapShotMap.prim_var_pump.key],
  );
  const primary_variable_pump_count = Object.keys(primary_variable_pumps)
    .length;
  return { primary_variable_pumps, primary_variable_pump_count };
}

async function get_prim_pumps() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { prim_pumps: [], prim_pump_count: 0 };
  const prim_pumps = Object.values(snaphot[glDeviceSnapShotMap.prim_pump.key]);
  const prim_pump_count = Object.keys(prim_pumps).length;
  return { prim_pumps, prim_pump_count };
}

async function get_sec_pumps() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { sec_pumps: [], sec_pump_count: 0 };
  const sec_pumps = Object.values(snaphot[glDeviceSnapShotMap.sec_pump.key]);
  const sec_pump_count = Object.keys(sec_pumps).length;
  return { sec_pumps, sec_pump_count };
}

async function get_cond_pumps() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { cond_pumps: [], cond_pump_count: 0 };
  const cond_pumps = Object.values(snaphot[glDeviceSnapShotMap.cond_pump.key]);
  const cond_pump_count = Object.keys(cond_pumps).length;
  return { cond_pumps, cond_pump_count };
}

async function get_cooling_towers() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { cooling_towers: [], cooling_tower_count: 0 };
  const cooling_towers = Object.values(
    snaphot[glDeviceSnapShotMap.cool_tower.key],
  );
  const cooling_tower_count = Object.keys(cooling_towers).length;
  return { cooling_towers, cooling_tower_count };
}

async function get_cooling_tower_fans() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { cooling_tower_fans: [], cooling_tower_fans_count: 0 };
  const cooling_tower_fans = Object.values(
    snaphot[glDeviceSnapShotMap.cool_tower_var_fan.key],
  );
  const cooling_tower_fans_count = Object.keys(cooling_tower_fans).length;
  return { cooling_tower_fans, cooling_tower_fans_count };
}

async function get_prim_pump_station() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { prim_seq_panel: [], prim_seq_panel_count: 0 };
  const prim_seq_panel = Object.values(
    snaphot[glDeviceSnapShotMap.priv_seq_panel.key],
  );
  const prim_seq_panel_count = Object.keys(prim_seq_panel).length;
  return { prim_seq_panel, prim_seq_panel_count };
}

async function get_sec_pump_station() {
  const snaphot = await loadSnapshot();
  if (!snaphot) return { sec_seq_panel: [], sec_seq_panel_count: 0 };
  const sec_seq_panel = Object.values(
    snaphot[glDeviceSnapShotMap.sec_seq_panel.key],
  );
  const sec_seq_panel_count = Object.keys(sec_seq_panel).length;
  return { sec_seq_panel, sec_seq_panel_count };
}

async function get_tripped_devices(deviceType) {
  const snapshot = await loadSnapshot();
  if (!snapshot) return [];
  const devices = Object.values(snapshot[glDeviceSnapShotMap[deviceType].key]);
  const trippedDevices = devices.filter(
    (device) =>
      device[glDeviceSnapShotMap[deviceType].fault]?.presentValue === "active",
  );
  return trippedDevices;
}

module.exports = {
  loadSnapshot,
  get_flow_meters,
  get_wc_chillers,
  get_ac_chillers,
  get_primary_variable_pumps,
  get_prim_pumps,
  get_sec_pumps,
  get_cond_pumps,
  get_cooling_towers,
  get_cooling_tower_fans,
  get_prim_pump_station,
  get_tripped_devices,
  get_sec_pump_station,
};
