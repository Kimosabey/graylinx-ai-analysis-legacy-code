/**
 * Mapping configuration for converting the GL BACnet snapshot format
 * (api_response.json) into the clean customer-facing timestamp format
 * (api_response_format_with_timestamp.txt).
 */

// Maps GL SS types to clean category names
const SS_TYPE_TO_CATEGORY = {
  NONGL_SS_CHILLER: "Chillers",
  NONGL_SS_PRIMARY_PUMP: "PrimaryPumps",
  NONGL_SS_COOLING_TOWER: "CoolingTowers",
  NONGL_SS_CONDENSER_PUMPS: "CondenserPumps",
  NONGL_SS_BTU_METER: "BTU Meter",
  NONGL_SS_SECONDARY_PUMPS: "SecondaryPumps",
};

/**
 * Maps BACnet attribute names to clean output field paths (dot-notation for nested).
 * Keys are gl_param_name values from eqp_name_handling.csv.
 */
const BACNET_TO_CLEAN = {
  NONGL_SS_CHILLER: {
    sts_on_off_00: "running_status",
    sts_evap_flow_00: "evaporator_flow_status",
    sts_cond_flow_00: "condenser_flow_status",
    sts_evap_leaving_temp_00: "evaporator_outlet_temp",
    par_evap_entering_temp_00: "evaporator_inlet_temp",
    par_cond_entering_temp_00: "condenser_inlet_temp",
    par_cond_leaving_temp_00: "condenser_outlet_temp",
    alm_trip_00: "alarms.trip_status",
    alm_fault_00: "alarms.cycling_fault",
  },

  NONGL_SS_PRIMARY_PUMP: {
    sts_on_off_00: "running_status",
    par_avg_power_00: "power_kw",
    alm_trip_00: "alarms.trip_feedback",
  },

  NONGL_SS_SECONDARY_PUMPS: {
    sts_on_off_00: "running_status",
    par_avg_power_00: "power_kw",
    alm_trip_00: "alarms.trip_feedback",
  },

  NONGL_SS_COOLING_TOWER: {
    sts_fan_frequency_00: "fan_frequency_hz",
    par_avg_power_00: "power_kw",
    par_out_air_temp_00: "dry_bulb_temp",
    par_out_air_humidity_00: "relative_humidity",
    alm_trip_00: "alarms.fan_1_trip",
  },

  NONGL_SS_CONDENSER_PUMPS: {
    alm_trip_00: "trip_status",
  },

  NONGL_SS_BTU_METER: {
    par_actual_flow_00: "BTU_Meter_Actual_Flow",
    par_inlet_temp_00: "BTU_Meter_Inlet_Temperature",
    par_actual_power_00: "BTU_Meter_Actual_Power",
    par_energy_consump_00: "BTU_Meter_Energy_Consumption",
    par_outlet_temp_00: "BTU_Meter_Outlet_Temperature",
  },
};

module.exports = { SS_TYPE_TO_CATEGORY, BACNET_TO_CLEAN };
