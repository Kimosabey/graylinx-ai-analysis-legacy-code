import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable";

function GlAhu() {
  let imageParamsEqp = [
    {
      title: "Auto/Manual Status",
      parameter1: "sts_auto_manual_00",
      unit: "",
      defaultValue: "",
    },

    {
      title: "Trip Alarm",
      parameter1: "alm_trip_00",
      unit: "",
      minRange: "",
      maxRange: "",
      defaultValue: "Normal",
    },
    {
      title: "Supply Air Temperature [℃]",
      parameter1: "par_supply_air_temp_00",
      unit: "℃",
      minRange: "11",
      maxRange: "18",
      defaultValue: "14",
    },
    {
      title: "Return Air Temperature [℃]",
      parameter1: "cmd_return_air_temp_00",
      unit: "℃",
      minRange: "22",
      maxRange: "30",
      defaultValue: "24",
    },
    {
      title: "Return Air Temperature Status [℃]",
      parameter1: "sts_return_air_temp_00",
      unit: "℃",
      minRange: "22",
      maxRange: "30",
      defaultValue: "24",
    },
    {
      title: "Leaving Water Temperature [℃]",
      parameter1: "par_leaving_water_temp_00",
      unit: "℃",
      defaultValue: "",
    },
    {
      title: "Entering Water Temperature [℃]",
      parameter1: "par_entering_water_temp_00",
      unit: "℃",
      defaultValue: "",
    },
    {
      title: "Filter Status",
      parameter1: "sts_filter_00",
      unit: "",
      minRange: "",
      maxRange: "",
      defaultValue: "Normal",
    },
    {
      title: "Water Status",
      parameter1: "par_water_00",
      unit: "",
      defaultValue: "",
    },
    {
      title: "Fan Speed [rpm]",
      parameter1: "par_fan_speed_00",
      unit: "rpm",
      defaultValue: "",
    },
    {
      title: "Fan Average Power [kW]",
      parameter1: "par_avg_fan_power_00",
      unit: "kW",
      defaultValue: "",
    },
    {
      title: "Fan Energy [kWh]",
      parameter1: "par_fan_energy_00",
      unit: "kWh",
      defaultValue: "",
    },
    {
      title: "Pump Head [m]",
      parameter1: "par_pump_head_00",
      unit: "m",
      defaultValue: "",
    },
    {
      title: "Pump Speed [rpm]",
      parameter1: "par_pump_speed_00",
      unit: "rpm",
      defaultValue: "",
    },
    {
      title: "Pump Load [%]",
      parameter1: "par_pump_load_00",
      unit: "%",
      defaultValue: "",
    },
    {
      title: "Pump Average Current [A]",
      parameter1: "par_pump_avg_current_00",
      unit: "A",
      defaultValue: "",
    },
    {
      title: "Pump Average Voltage [V]",
      parameter1: "par_pump_avg_voltage_00",
      unit: "V",
      defaultValue: "",
    },
    {
      title: "Pump Frequency [Hz]",
      parameter1: "par_pump_frequency_00",
      unit: "Hz",
      defaultValue: "",
    },
    {
      title: "Pump Energy [kWh]",
      parameter1: "par_pump_energy_00",
      unit: "kWh",
      defaultValue: "",
    },
    {
      title: "ELM Pump [kW]",
      parameter1: "par_elm_pump_00",
      unit: "kW",
      defaultValue: "",
    },
  ];

  const ss_types = ["NONGL_SS_CSU", "NONGL_SS_AHU"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
      />
    </>
  );
}

export default GlAhu;