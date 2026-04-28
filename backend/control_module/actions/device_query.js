const controls = require("../controls");

const {
  inactive_device_states,
  auto_manual_status,
  active_device_states,
} = require("../controls");

function isValidDeviceType(deviceType) {
  return [
    "prim_pump",
    "sec_pump",
    "cond_pump",
    "cool_tower",
    "prim_var_pump",
    "priv_seq_panel",
    "sec_seq_panel",
  ].includes(deviceType);
}

function getPresentValue(device, snapKey) {
  return device?.[controls.glDevices.paramGroup]?.[snapKey]?.presentValue;
}

async function get_active_chillers(deviceType) {
  if (deviceType !== "ac_chiller" && deviceType !== "wc_chiller") {
    console.error(
      `get_active_chillers: invalid deviceType ${deviceType} provided.`,
    );
    return [];
  }

  if (deviceType === "ac_chiller") {
    const { ac_chillers } = await controls.get_ac_chillers();

    const active_chillers = ac_chillers.filter((chiller) => {
      const paramGroup = chiller?.[controls.glDevices.paramGroup];

      const statusVal =
        paramGroup?.[controls.glDeviceSnapShotMap.ac_chiller.status]
          ?.presentValue;

      const evaValve =
        paramGroup?.[controls.glDeviceSnapShotMap.ac_chiller.ch_valve_status]
          ?.presentValue;
      const auto_status =
        paramGroup?.[controls.glDeviceSnapShotMap.ac_chiller.auto_status]
          ?.presentValue;

      return (
        (active_device_states.includes(statusVal) ||
          active_device_states.includes(evaValve)) &&
        auto_manual_status.includes(auto_status)
      );
    });

    return active_chillers;
  } else {
    const { wc_chillers } = await controls.get_wc_chillers();

    const active_chillers = wc_chillers.filter((chiller) => {
      const paramGroup = chiller?.[controls.glDevices.paramGroup];
      const statusVal =
        paramGroup?.[controls.glDeviceSnapShotMap.wc_chiller.status]
          ?.presentValue;
      const condValve =
        paramGroup?.[controls.glDeviceSnapShotMap.wc_chiller.cond_valve_status]
          ?.presentValue;
      const evaValve =
        paramGroup?.[controls.glDeviceSnapShotMap.wc_chiller.ch_valve_status]
          ?.presentValue;
      const auto_status =
        paramGroup?.[controls.glDeviceSnapShotMap.wc_chiller.auto_status]
          ?.presentValue;

      return (
        (active_device_states.includes(statusVal) ||
          active_device_states.includes(condValve) ||
          active_device_states.includes(evaValve)) &&
        auto_manual_status.includes(auto_status)
      );
    });

    return active_chillers;
  }
}

async function get_inactive_chillers(deviceType) {
  if (deviceType !== "ac_chiller" && deviceType !== "wc_chiller") {
    console.error(
      `get_active_chillers: invalid deviceType ${deviceType} provided.`,
    );
    return [];
  }

  let chillers = [];

  const faulty_devices = await get_faulty_devices();

  if (deviceType === "ac_chiller") {
    const { ac_chillers } = await controls.get_ac_chillers();
    chillers = ac_chillers.filter(
      (chiller) =>
        inactive_device_states.includes(
          getPresentValue(
            chiller,
            controls.glDeviceSnapShotMap.ac_chiller.status,
          ),
        ) &&
        auto_manual_status.includes(
          getPresentValue(
            chiller,
            controls.glDeviceSnapShotMap.ac_chiller.auto_status,
          ),
        ),
    );
  } else {
    const { wc_chillers } = await controls.get_wc_chillers();
    chillers = wc_chillers.filter(
      (chiller) =>
        inactive_device_states.includes(
          getPresentValue(
            chiller,
            controls.glDeviceSnapShotMap.wc_chiller.status,
          ),
        ) &&
        auto_manual_status.includes(
          getPresentValue(
            chiller,
            controls.glDeviceSnapShotMap.wc_chiller.auto_status,
          ),
        ),
    );
  }

  chillers = chillers.filter((chiller) => !faulty_devices.includes(chiller.id));

  return chillers.filter(
    (chiller) => chiller.Eqp_Metrics.Equipment_Faulty !== true,
  );
}

async function get_active_pumps_and_cool_towers(deviceType) {
  if (!isValidDeviceType(deviceType)) {
    console.error(`get_pumps: invalid deviceType ${deviceType} provided.`);
    return [];
  }

  if (deviceType === "prim_pump") {
    const { prim_pumps } = await controls.get_prim_pumps();
    const snapKey = controls.glDeviceSnapShotMap.prim_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.prim_pump.auto_status;
    return prim_pumps.filter(
      (pump) =>
        active_device_states.includes(getPresentValue(pump, snapKey)) &&
        auto_manual_status.includes(getPresentValue(pump, autoKey)),
    );
  }

  if (deviceType === "sec_pump") {
    const { sec_pumps } = await controls.get_sec_pumps();
    const snapKey = controls.glDeviceSnapShotMap.sec_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.sec_pump.auto_status;
    return sec_pumps.filter(
      (pump) =>
        active_device_states.includes(getPresentValue(pump, snapKey)) &&
        auto_manual_status.includes(getPresentValue(pump, autoKey)),
    );
  }

  if (deviceType === "cond_pump") {
    const { cond_pumps } = await controls.get_cond_pumps();
    const snapKey = controls.glDeviceSnapShotMap.cond_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.cond_pump.auto_status;
    return cond_pumps.filter(
      (pump) =>
        active_device_states.includes(getPresentValue(pump, snapKey)) &&
        auto_manual_status.includes(getPresentValue(pump, autoKey)),
    );
  }

  if (deviceType === "cool_tower") {
    const { cooling_towers } = await controls.get_cooling_towers();
    const faulty_device_ids = await get_faulty_devices();
    const vlv1Key = controls.glDeviceSnapShotMap.cool_tower.inlet_valve_status;
    const vlv2Key = controls.glDeviceSnapShotMap.cool_tower.outlet_valve_status;
    const fanKey = controls.glDeviceSnapShotMap.cool_tower.status;
    const autoKey = controls.glDeviceSnapShotMap.cool_tower.auto_status;
    return cooling_towers.filter(
      (tower) =>
        (active_device_states.includes(getPresentValue(tower, vlv1Key)) ||
          active_device_states.includes(getPresentValue(tower, vlv2Key)) ||
          active_device_states.includes(getPresentValue(tower, fanKey))) &&
        auto_manual_status.includes(getPresentValue(tower, autoKey)) &&
        tower.Eqp_Metrics.Equipment_Faulty !== true &&
        !faulty_device_ids.includes(tower.id),
    );
  }

  if (deviceType === "priv_seq_panel") {
    const { prim_seq_panel } = await controls.get_prim_pump_station();
    const snapKey = controls.glDeviceSnapShotMap.priv_seq_panel.status;
    const cmdKey = controls.glDeviceSnapShotMap.priv_seq_panel.on_off;
    return prim_seq_panel.filter(
      (panel) =>
        active_device_states.includes(getPresentValue(panel, snapKey)) ||
        active_device_states.includes(getPresentValue(panel, cmdKey)),
    );
  }

  if (deviceType === "sec_seq_panel") {
    const { sec_seq_panel } = await controls.get_sec_pump_station();
    const snapKey = controls.glDeviceSnapShotMap.sec_seq_panel.status;
    const cmdKey = controls.glDeviceSnapShotMap.sec_seq_panel.on_off;
    return sec_seq_panel.filter(
      (panel) =>
        active_device_states.includes(getPresentValue(panel, snapKey)) ||
        active_device_states.includes(getPresentValue(panel, cmdKey)),
    );
  }

  const {
    primary_variable_pumps,
  } = await controls.get_primary_variable_pumps();
  const snapKey = controls.glDeviceSnapShotMap.prim_var_pump.status;
  const autoKey = controls.glDeviceSnapShotMap.prim_var_pump.auto_status;
  return primary_variable_pumps.filter(
    (pump) =>
      active_device_states.includes(getPresentValue(pump, snapKey)) &&
      auto_manual_status.includes(getPresentValue(pump, autoKey)),
  );
}

async function get_inactive_pumps_and_cool_towers(deviceType) {
  if (!isValidDeviceType(deviceType)) {
    console.error(`get_pumps: invalid deviceType ${deviceType} provided.`);
    return [];
  }

  const faulty_devices = await get_faulty_devices();
  let devices = [];

  if (deviceType === "prim_pump") {
    const { prim_pumps } = await controls.get_prim_pumps();
    const statusKey = controls.glDeviceSnapShotMap.prim_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.prim_pump.auto_status;

    devices = prim_pumps.filter((pump) => {
      const status = getPresentValue(pump, statusKey);
      const auto = getPresentValue(pump, autoKey);
      return (
        inactive_device_states.includes(status) &&
        auto_manual_status.includes(auto) &&
        pump.Eqp_Metrics.Equipment_Faulty !== true
      );
    });
  } else if (deviceType === "sec_pump") {
    const { sec_pumps } = await controls.get_sec_pumps();
    const statusKey = controls.glDeviceSnapShotMap.sec_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.sec_pump.auto_status;

    devices = sec_pumps.filter((pump) => {
      const status = getPresentValue(pump, statusKey);
      const auto = getPresentValue(pump, autoKey);
      return (
        inactive_device_states.includes(status) &&
        auto_manual_status.includes(auto) &&
        pump.Eqp_Metrics.Equipment_Faulty !== true
      );
    });
  } else if (deviceType === "cond_pump") {
    const { cond_pumps } = await controls.get_cond_pumps();
    const statusKey = controls.glDeviceSnapShotMap.cond_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.cond_pump.auto_status;

    devices = cond_pumps.filter((pump) => {
      const status = getPresentValue(pump, statusKey);
      const auto = getPresentValue(pump, autoKey);
      return (
        inactive_device_states.includes(status) &&
        auto_manual_status.includes(auto) &&
        pump.Eqp_Metrics.Equipment_Faulty !== true
      );
    });
  } else if (deviceType === "cool_tower") {
    const { cooling_towers } = await controls.get_cooling_towers();
    const vlv1Key = controls.glDeviceSnapShotMap.cool_tower.inlet_valve_status;
    const vlv2Key = controls.glDeviceSnapShotMap.cool_tower.outlet_valve_status;
    const fanKey = controls.glDeviceSnapShotMap.cool_tower.status;
    const autoKey = controls.glDeviceSnapShotMap.cool_tower.auto_status;
    devices = cooling_towers.filter(
      (tower) =>
        inactive_device_states.includes(getPresentValue(tower, vlv1Key)) &&
        inactive_device_states.includes(getPresentValue(tower, vlv2Key)) &&
        inactive_device_states.includes(getPresentValue(tower, fanKey)) &&
        auto_manual_status.includes(getPresentValue(tower, autoKey)),
    );
  } else if (deviceType === "priv_seq_panel") {
    const { prim_seq_panel } = await controls.get_prim_pump_station();
    const statusKey = controls.glDeviceSnapShotMap.priv_seq_panel.status;

    devices = prim_seq_panel.filter((panel) =>
      inactive_device_states.includes(getPresentValue(panel, statusKey)),
    );
  } else {
    const {
      primary_variable_pumps,
    } = await controls.get_primary_variable_pumps();
    const statusKey = controls.glDeviceSnapShotMap.prim_var_pump.status;
    const autoKey = controls.glDeviceSnapShotMap.prim_var_pump.auto_status;

    devices = primary_variable_pumps.filter((pump) => {
      const status = getPresentValue(pump, statusKey);
      const auto = getPresentValue(pump, autoKey);
      return (
        inactive_device_states.includes(status) &&
        auto_manual_status.includes(auto)
      );
    });
  }

  devices = devices.filter((device) => !faulty_devices.includes(device.id));

  return devices.filter(
    (device) => device?.Eqp_Metrics?.Equipment_Faulty !== true,
  );
}

async function get_tripped_devices_by_device_type(deviceType) {
  if (
    deviceType !== "ac_chiller" &&
    deviceType !== "wc_chiller" &&
    deviceType !== "pri_pump" &&
    deviceType !== "sec_pump" &&
    deviceType !== "cond_pump" &&
    deviceType !== "cool_tower" &&
    deviceType !== "prim_var_pump"
  ) {
    console.error(
      `get_tripped_devices: invalid deviceType ${deviceType} provided.`,
    );
    return [];
  }
  return await controls.get_tripped_devices(deviceType);
}

async function get_active_devices() {
  const snapshot = await controls.loadSnapshot();
  if (!snapshot) return [];
  const snapshot_keys = Object.keys(snapshot);

  const active_devices = [];

  for (const deviceType of snapshot_keys) {
    const status_param = Object.values(controls.glDeviceSnapShotMap).find(
      (device) => device.key === deviceType,
    )?.status;
    if (!status_param) {
      console.error(
        `get_active_devices: status parameter not found for deviceType ${deviceType}`,
      );
      continue;
    }
    for (const device of Object.values(snapshot[deviceType])) {
      const device_status =
        device[controls.glDevices.paramGroup][status_param]?.presentValue;
      if (active_device_states.includes(device_status)) {
        active_devices.push(device);
      }
    }
  }
  return active_devices;
}

async function get_faulty_devices() {
  const { data } = await controls.getActiveAlarms();

  const faulty_devices = data.map((alarm) => alarm.ss_id);
  return faulty_devices;
}

module.exports = {
  get_active_chillers,
  get_inactive_chillers,
  get_active_pumps_and_cool_towers,
  get_inactive_pumps_and_cool_towers,
  get_tripped_devices_by_device_type,
  get_active_devices,
  get_faulty_devices,
};
