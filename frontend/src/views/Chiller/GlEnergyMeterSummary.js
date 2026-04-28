import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable1";

function GlEnergyMeterSummary() {
  let imageParamsEqp = [
    {
      title: "Average Active Power [kW]",
      parameter1: "par_avg_active_power_00",
      unit: "kW",
    },
    {
      title: "Average Reactive Power [kVAR]",
      parameter1: "par_avg_reactive_power_00",
      unit: "kVAR",
    },
    {
      title: "Average Apparent Power [kVA]",
      parameter1: "par_avg_apparent_power_00",
      unit: "kVA",
    },
    {
      title: "Average Power Factor",
      parameter1: "par_avg_pf_00",
      unit: "",
    },
    {
      title: "Frequency [Hz]",
      parameter1: "par_frequency_00",
      unit: "Hz",
    },
    {
      title: "Voltage RY [V]",
      parameter1: "par_voltage_01",
      unit: "V",
    },
    {
      title: "Voltage YB [V]",
      parameter1: "par_voltage_02",
      unit: "V",
    },
    {
      title: "Voltage BR [V]",
      parameter1: "par_voltage_03",
      unit: "V",
    },
    {
      title: "Current RY [Amps]",
      parameter1: "par_current_01",
      unit: "A",
    },
    {
      title: "Current YB [Amps]",
      parameter1: "par_current_02",
      unit: "A",
    },
    {
      title: "Current BR [Amps]",
      parameter1: "par_current_03",
      unit: "A",
    },
    {
      title: "Power Factor RY",
      parameter1: "par_pf_01",
      unit: "",
    },
    {
      title: "Power Factor YB",
      parameter1: "par_pf_02",
      unit: "",
    },
    {
      title: "Power Factor BR",
      parameter1: "par_pf_03",
      unit: "",
    },
    {
      title: "Energy [kWh]",
      parameter1: "par_energy_00",
      unit: "",
    },
  ];

  const ss_types = ["NONGL_SS_EMS"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
      />
    </>
  );
}

export default GlEnergyMeterSummary;