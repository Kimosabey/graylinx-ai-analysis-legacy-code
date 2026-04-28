const actions = require("./actions");
const controls = require("./controls");

async function send_plant_snapshot(req, res) {
  return res.send(await controls.loadSnapshot());
}

async function send_cpm_attributes(req, res) {
  try {
    const cpm_mode = await actions.read_cpm_mode_status("cpm_mode");
    if (req.autoManual) {
      await actions.set_cpm_mode_on_off("active");
    } else {
      await actions.set_cpm_mode_on_off("inactive");
    }
    return res.send(cpm_mode);
  } catch (e) {
    console.error("Error in send_cpm_attributes:", e);
    return res.send({
      message:
        "Failed to retrieve CPM attributes due to server error , error: " +
        e.message,
    });
  }
}

async function handleUIAction(req, res) {
  const {
    ss_type: deviceType,
    ss_id: target_id,
    value,
    gl_command: action,
    param_id,
  } = req.body;

  try {
    const req_status = await controls.handleUIActionControl(
      deviceType,
      target_id,
      value,
      action,
      param_id,
    );

    if (req_status) {
      return res.send("Command completed successfully");
    } else {
      return res.send("Command failed or returned false");
    }
  } catch (e) {
    console.error("Error in handleUIAction:", e);
    return res.send({
      message: "Command failed due to server error, error: " + e.message,
    });
  }
}

async function ControlCoolingTowerOutletValve(req, res) {
  const { gl_command: value, ss_id: target_id } = req.body;

  try {
    if (value === "active") {
      const req_status = await actions.turn_on_cooling_tower_outlet_valve(
        target_id,
      );
      if (req_status) {
        return res.send("Cooling tower turned on successfully");
      } else {
        return res.send("Failed to turn on cooling tower");
      }
    } else if (value === "inactive") {
      const req_status = await actions.turn_off_cooling_tower_outlet_valve(
        target_id,
      );
      if (req_status) {
        return res.send("Cooling tower turned off successfully");
      } else {
        return res.send("Failed to turn off cooling tower");
      }
    } else {
      return res.send("Invalid action for cooling tower control");
    }
  } catch (e) {
    console.error("Error in ControlCoolingTower:", e);
    return res.send({
      message: "Command failed due to server error, error: " + e.message,
    });
  }
}

async function ControlCoolingTowerFanNoRelationship(req, res) {
  const { gl_command: value, ss_id: target_id } = req.body;

  try {
    if (value === "active") {
      const req_status = await actions.turn_on_cooling_towerfan(target_id);
      if (req_status) {
        return res.send("Cooling tower fan turned on successfully");
      } else {
        return res.send("Failed to turn on cooling tower fan");
      }
    } else if (value === "inactive") {
      const req_status = await actions.turn_off_cooling_towerfan(target_id);
      if (req_status) {
        return res.send("Cooling tower fan turned off successfully");
      } else {
        return res.send("Failed to turn off cooling tower fan");
      }
    } else {
      return res.send("Invalid action for cooling tower fan control");
    }
  } catch (error) {
    console.error("Error in ControlCoolingTowerFan:", error);
    return res.send(
      "Command failed due to server error, error: " + error.message,
    );
  }
}

async function ControlCoolingTowerFan(req, res) {
  const { gl_command: value, ss_id: target_id } = req.body;

  try {
    if (value === "active") {
      const req_status = await actions.turn_on_cooling_towerfan(target_id);
      if (req_status) {
        return res.send("Cooling tower fans turned on successfully");
      } else {
        return res.send("Failed to turn on cooling tower fans");
      }
    } else if (value === "inactive") {
      const req_status = await actions.turn_off_cooling_towerfan(target_id);
      if (req_status) {
        return res.send("Cooling tower fans turned off successfully");
      } else {
        return res.send("Failed to turn off cooling tower fans");
      }
    } else {
      return res.send("Invalid action for cooling tower fans control");
    }
  } catch (error) {
    console.error("Error in ControlCoolingTowerFan:", error);
    return res.send(
      "Command failed due to server error, error: " + error.message,
    );
  }
}

async function get_cpm_metric_state(req, res) {
  try {
    const cpm_state = await actions.read_cpm_mode_status("cpm_mode");
    return res.send({ cpm_mode: cpm_state });
  } catch (e) {
    console.error(`Error in get_cpm_metric: ${req.body.metric_id}_state:`, e);
    return res.send(
      "Failed to retrieve CPM state due to server error , error: " + e.message,
    );
  }
}

async function set_cpm_metric_state(req, res) {
  try {
    const cpm_state = await controls.insertMetric({
      metric_id: "cpm_mode",
      metric_value: req.body.value,
    });

    return res.send({ cpm_mode: cpm_state });
  } catch (e) {
    console.error(`Error in set_cpm_metric: ${req.body.metric_id}_state:`, e);
    return res.send(
      "Failed to set CPM state due to server error , error: " + e.message,
    );
  }
}

async function set_manual_metric_state(req, res) {
  try {
    const manual_state = await controls.insertMetric({
      metric_id: "manual_mode",
      metric_value: req.body.value,
    });
    return res.send({ manual_mode: manual_state });
  } catch (e) {
    console.error(
      `Error in set_manual_metric: ${req.body.metric_id}_state:`,
      e,
    );
    return res.send(
      "Failed to set manual state due to server error , error: " + e.message,
    );
  }
}

async function getCoolingTowerState(req, res) {
  try {
    const ctState = await actions.getCoolingTowerState(req.body.ss_id);
    if (!ctState) {
      return res.send(false);
    }
    return res.send("active");
  } catch (e) {
    console.error(`Error in getCoolingTowerState: ${req.body.ss_id}:`, e);
    return res.send(
      "Failed to retrieve cooling tower state due to server error , error: " +
        e.message,
    );
  }
}

async function get_manual_metric_state(req, res) {
  try {
    const manual_state = await actions.read_manual_mode_status("manual_mode");
    return res.send({ manual_mode: manual_state });
  } catch (e) {
    console.error(
      `Error in get_manual_metric: ${req.body.metric_id}_state:`,
      e,
    );
    return res.send(
      "Failed to retrieve manual state due to server error , error: " +
        e.message,
    );
  }
}

async function get_tr_kw_values_of_chiller(req, res) {
  try {
    const { ss_id: chillerId, ss_type: chillerType } = req.body;
    const validChillerTypes = [
      "NONGL_SS_CHILLER",
      "NONGL_SS_AIR_COOLED_CHILLER",
    ];
    if (!validChillerTypes.includes(chillerType)) {
      return res.send(
        "Invalid chiller type. Must be 'NONGL_SS_AIR_COOLED_CHILLER' or 'NONGL_SS_CHILLER'.",
      );
    }

    const chillerTypeKeyMap = {
      NONGL_SS_CHILLER: controls.glDeviceSnapShotMap.wc_chiller.key,
      NONGL_SS_AIR_COOLED_CHILLER: controls.glDeviceSnapShotMap.ac_chiller.key,
    };

    const deviceKey = chillerTypeKeyMap[chillerType];
    if (!deviceKey) {
      return res.send("Invalid chiller type mapping for snapshot key.");
    }

    const { kw, tr } = await controls.get_chiller_params_values(
      deviceKey,
      chillerId,
    );
    return res.json({ kw: Number(kw.toFixed(2)), tr: Number(tr.toFixed(2)) });
  } catch (e) {
    console.error(
      `Error in get_tr_kw_values_of_chiller: ${req.body.ss_id}:`,
      e,
    );
    return res.send(
      "Failed to retrieve TR and KW values due to server error , error: " +
        e.message,
    );
  }
}

async function set_cpm_add_remove_threshold(req, res) {
  try {
    const add_threshold = await controls.insertMetric({
      metric_id: req.body.metric_id,
      metric_value: req.body.value,
    });
    return res.send({ status: "success" });
  } catch (e) {
    console.error(`Error in set ${req.body.metric_id}: ${req.body.value}:`, e);
    return res.send(
      `Failed to set  ${req.body.metric_id} due to server error , error: ${e.message}`,
    );
  }
}

async function get_cpm_add_remove_threshold(req, res) {
  try {
    const add_threshold_value = await actions.read_manual_mode_status(
      "add_threshold",
    );
    const remove_threshold_value = await actions.read_manual_mode_status(
      "remove_threshold",
    );
    return res.send({
      add_threshold_value: add_threshold_value,
      remove_threshold_value: remove_threshold_value,
    });
  } catch (e) {
    console.error(
      `Error in SET ${req.body.metric_id}: ${req.body.value}_state:`,
      e,
    );
    return res.send(
      `Failed to set  ${req.body.metric_id} due to server error , error: ${e.message}`,
    );
  }
}

module.exports = {
  send_cpm_attributes,
  handleUIAction,
  ControlCoolingTowerOutletValve,
  ControlCoolingTowerFan,
  get_cpm_metric_state,
  set_cpm_metric_state,
  get_manual_metric_state,
  set_manual_metric_state,
  ControlCoolingTowerFanNoRelationship,
  getCoolingTowerState,
  send_plant_snapshot,
  get_tr_kw_values_of_chiller,
  set_cpm_add_remove_threshold,
  get_cpm_add_remove_threshold,
};
