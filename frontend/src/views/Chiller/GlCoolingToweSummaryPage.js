import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable1";

function GlCoolingTowerSummaryPage() {
 let imageParamsEqp = [
  {
    title: "On/Off Command",
    parameter1: "cmd_on_off_00",
    unit: "",
  },
  {
    title: "On/Off Status",
    parameter1: "sts_on_off_00",
    unit: "",
  },
  {
      title: "Fan VFD Frequency Command",
      parameter1: "cmd_fan_frequency_00",
      unit: "",
    },
    {
      title: "Fan VFD Frequency Status",
      parameter1: "sts_fan_frequency_00",
      unit: "",
    },
  {
    title: "Auto/Manual Status",
    parameter1: "sts_auto_manual_00",
    unit: "",
  },
  {
    title: "Trip Status",
    parameter1: "alm_trip_00",
    unit: "",
  },
  {title: "Water Level Status",
  parameter1: "sts_level_switch_high_00",
  parameter2: "sts_level_switch_low_00",
  unit: "",
},
{
    title: "Inlet Valve Command",
    parameter1: "cmd_vlv_on_off_00",
    unit: "",
  },
  {
    title: " Inlet Valve Status-1",
    parameter1: "sts_vlv_on_off_01",
    unit: "",
  },
  {
    title: " Inlet Valve Status-2",
    parameter1: "sts_vlv_on_off_02",
    unit: "",
  },
   {
    title: "Fan Average Power [kW]",
    parameter1: "par_avg_power_00",
    unit: "kW",
  },
  {
    title: "Fan Speed [rpm]",
    parameter1: "par_fan_speed_00",
    unit: "rpm",
  },
   {
    title: "Fan Voltage [V]",
    parameter1: "par_avg_voltage_00",
    unit: "V",
  },
  {
    title: "Fan Average Current [A]",
    parameter1: "par_avg_current_00",
    unit: "A",
  },


  {
    title: "Run Hours [hrs]",
    parameter1: "par_run_hours_00",
    unit: "",
  },
  {
    title: "Fan Energy [kWh]",
    parameter1: "par_energy_00",
    unit: "kWh",
  },
  
  
  
 
];

  const ss_types = ["NONGL_SS_COOLING_TOWER"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
      />
    </>
  );
}

export default GlCoolingTowerSummaryPage;