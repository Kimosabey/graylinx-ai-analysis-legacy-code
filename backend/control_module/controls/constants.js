const { readFileSync } = require("fs");
const path = require("path");
require("dotenv").config();

const inactive_device_states = ["inactive", "0.0", 0, 0.0, false];

const auto_manual_status = ["active", "5.0", true, 5.0, 2.0, 2, "2.0", "2"];

const active_device_states = ["active", "1.0", 1, 1.0, true];

let cpm_state = null;

const state = {
  elwtSP: 8.0,
  currentPlantKW: 0,
  previousPlantKW: 0,
  soakTimerStart: null,
  reverseMode: false,
  lastAction: null,
};

const control_file = path.join(__dirname, "../../", process.env.control_json);

const glDevices = {
  chiller: "chiller",
  ac_chiller: "ac_chiller",
  wc_chiller: "wc_chiller",
  prim_pump: "prim_pump",
  sec_pump: "sec_pump",
  cond_pump: "cond_pump",
  cool_tower: "cool_tower",
  cool_tower_var_fan: "cool_tower_var_fan",
  dpt: "dpt",
  ahu: "ahu",
  fau: "fau",
  bacnet: "BACnetDeviceAddress",
  paramGroup: "Eqp_Attributes",
  presentValue: "presentValue",
  objId: "objId",
  objName: "GL Code",
  cpm: "cpm",
  prim_var_pump: "prim_var_pump",
  prim_pump_station: "prim_pump_station",
  sec_pump_station: "sec_pump_station",
  flow_meter: "flow_meter",
  headers: "headers",
  objectname: "objName",
  priv_seq_panel: "priv_seq_panel",
  sec_seq_panel: "sec_seq_panel",
  em_type: "NONGL_SS_EMS",
  em_param: "em_par_active_pwr_avg_0",
};

const glDeviceSnapShotMap = JSON.parse(readFileSync(control_file, "utf8"));

const glNameHandler = {
  simulator_obj_id: "AHU-ID",
  site_obj_id: "obj_id",
  bacnet: "ddc_id",
  obj_type: "obj_type",
  obj_name: "gl_code",
};

const BACnet_obj_types = {
  analogInput: 0,
  analogOutput: 1,
  analogValue: 2,
  binaryInput: 3,
  binaryOutput: 4,
  binaryValue: 5,
  calendar: 6,
  command: 7,
  device: 8,
  program: 9,
  file: 10,
  loop: 11,
  group: 12,
  multiStateInput: 13,
  multiStateOutput: 14,
  notificationClass: 15,
  eventEnrollment: 16,
  schedule: 17,
  averaging: 18,
  multiStateValue: 19,
  trendLog: 20,
  lifeSafetyPoint: 21,
  lifeSafetyZone: 22,
  accumulator: 23,
  pulseConverter: 24,
  eventLog: 25,
  trendLogMultiple: 26,
  loadControl: 27,
  structuredView: 28,
  accessDoor: 30,
  accessCredential: 32,
  accessPoint: 33,
  accessRights: 34,
  accessUser: 35,
  accessZone: 36,
  credentialDataInput: 37,
  networkSecurity: 38,
  bitstringValue: 39,
  characterstringValue: 40,
  dateValue: 41,
  timeValue: 42,
  datetimeValue: 43,
  integerValue: 45,
  largeAnalogValue: 46,
  positiveIntegerValue: 48,
};

const cpm_execution_check_point = {
  duration_seconds: {
    flowrate_gt_flowrate_monitor_seconds_duration: 0,
    cond_temp_gt_temp_monitor_seconds_duration: 0,
    wc_chiller_add_condition_duration: 0,
    wc_chiller_remove_condition_duration: 0,
    vfd_command_frequency_duration: 0,
    vfd_ct_add_duration: 0,
    vfd_ct_remove_duration: 0,
  },
  faulty_devices: [],
};

const MAX_REPLACE_LOG_SIZE = 100;

// Tracks tripped devices detected in the last monitoring cycle and a rolling replace history
const cpm_replace_status = {
  tripped_devices: [], // overwritten each monitor cycle: [{ device_type, name, detected_at }]
  replace_log: [], // appended on each replace attempt (capped at MAX_REPLACE_LOG_SIZE)
};

// Mutable object — updated in-place so all modules share the same reference
const cpm_step_status = {
  status: "idle", // "idle" | "busy" | "manual_mode"
  step: null, // current top-level step name, e.g. "starting_chiller_plant"
  sub_step: null, // current sub-step label from withSteps decorator
  current_device: null, // device IDs involved in the active sub-step
  updated_at: null,
};

module.exports = {
  inactive_device_states,
  auto_manual_status,
  active_device_states,
  glDevices,
  glDeviceSnapShotMap,
  glNameHandler,
  BACnet_obj_types,
  cpm_execution_check_point,
  cpm_state,
  cpm_step_status,
  cpm_replace_status,
  MAX_REPLACE_LOG_SIZE,
  state,
};
