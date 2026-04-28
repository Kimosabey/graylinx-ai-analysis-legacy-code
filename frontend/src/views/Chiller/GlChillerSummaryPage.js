import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable1";

function GlChillerSummargPage() {
 let imageParamsEqp = [
  // -------------------- STATUS --------------------
  {
    title: "Auto/Manual Status",
    parameter1: "sts_auto_manual_00",
    parameter2: "sts_auto_manual_00",
    unit: "",
  },
  {
    title: "On/Off Status",
    parameter1: "sts_on_off_00",
    
    unit: "",
  },
  
  {
    title: "Trip Status",
    parameter1: "alm_trip_00",
     parameter2: "alm_trip_00",
    unit: "",
  },
  
  {
    title: "FaultAlarm",
    parameter1: "alm_fault_00",
    unit: "",
  },

  // -------------------- COMMANDS --------------------
  {
    title: "Command On/Off",
    parameter1: "cmd_on_off_00",
    

    unit: "",
  },
  {
    title: "Evaporator Leaving Temperature Command [°C]",
    parameter1: "cmd_evap_leaving_temp_00",
    unit: "°C",
  },
  {
    title: "Evaporator Valve Command",
    parameter1: "cmd_evap_vlv_on_off_00",
    unit: "",
  },
  {
    title: "Condenser Valve Command",
    parameter1: "cmd_cond_vlv_on_off_00",
    unit: "",
  },

  // -------------------- TEMPERATURES --------------------
  {
    title: "Evaporator Entering Temperature [°C]",
    parameter1: "par_evap_entering_temp_00",
    unit: "°C",
  },
  {
    title: "Evaporator Leaving Temperature [°C]",
    parameter1: "sts_evap_leaving_temp_00",
    unit: "°C",
  },
  
  
  {
    title: "Condenser Entering Temperature [°C]",
    parameter1: "par_cond_entering_temp_00",
    unit: "°C",
  },
  {
    title: "Condenser Leaving Temperature [°C]",
    parameter1: "par_cond_leaving_temp_00",
    unit: "°C",
  },
  
  
  
  {
    title: "Discharge Temperature [°C]",
    parameter1: "par_discharge_temp_00",
    unit: "°C",
  },

  // -------------------- PRESSURES --------------------
  {
    title: "Suction Pressure [kPa]",
    parameter1: "par_suction_pressure_00",
    unit: "kPa",
  },
  {
    title: "Discharge Pressure [kPa]",
    parameter1: "par_discharge_pressure_00",
    unit: "kPa",
  },
  {
    title: "Compressor Oil Pressure [kPa]",
    parameter1: "par_comp_oil_pressure_00",
    unit: "kPa",
  },

  // -------------------- FLOW & VALVE STATUS --------------------
  {
    title: "Evaporator Flow Switch",
    parameter1: "sts_evap_flow_00",
    unit: "",
  },
  {
    title: "Evaporator Valve Status",
    parameter1: "sts_evap_vlv_on_off_00",
    unit: "",
  },
  {
    title: "Condenser Valve Status",
    parameter1: "sts_cond_vlv_on_off_00",
    unit: "",
  },
  
  {
    title: "Condenser flow switch",
    parameter1: "sts_cond_flow_00",
    unit: "%",
  },

  // -------------------- ELECTRICAL --------------------
  
  {
    title: "FLA [%]",
    parameter1: "par_comp_percent_load_00",
    unit: "%",
  },
  
  {
    title: "Frequency [Hz]",
    parameter1: "par_vsd_frequency_00",
    unit: "Hz",
  },

  // -------------------- COMPRESSOR INFO --------------------
  {
    title: "Compressor Run Hours",
    parameter1: "par_comp_run_hrs_00",
    unit: "Hrs",
  },

  {
    title: "Current [A] ",
    parameter1: "par_avg_current_00",
    unit: "A",
  },
];




  // let chillerExtraParams = [
  //   { title: "Chiller kW/TR", parameter1: "CH_kW_per_TR", unit: "" },
  //   { title: "Run Hour Cumulative", parameter1: "rh_cumulative", unit: "" },
  //   { title: "Run Hours", parameter1: "rh_hour", unit: "" },
  //   { title: "Chiller KW", parameter1: "kw", unit: "" },
  //   { title: "Chiller TR", parameter1: "tr", unit: "" },
  // ];

  const ss_types = ["NONGL_SS_CHILLER"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
        //chillerExtraParams={chillerExtraParams}
      />
    </>
  );
}

export default GlChillerSummargPage;