import React from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable";

function GlPumpsSummargPage() {
  console.log("GlPumpsSummargPage rendered");

  // Primary Variable Pumps parameters
  const primaryPumpParams = [
    {
      title: "On/Off Status",
      parameter1: "sts_on_off_00",
      parameter2: "sts_on_off_00",
      parameter3: "sts_on_off_00",
      unit: "",
    },
    { title: "Command On/Off", parameter2: "cmd_on_off_00",parameter1: "cmd_on_off_00", unit: "" },
    {
      title: "Auto / Manual Status",
      parameter2: "sts_auto_manual_00",
      parameter1: "sts_auto_manual_00",
      unit: "",
    },
    {
      title: "Trip Status",
      parameter1: "alm_trip_00",
      parameter2: "alm_trip_00",
      parameter3: "alm_trip_00",
      unit: "",
    },
    { title: "Speed [rpm]", parameter3: "par_speed_00",parameter2: "par_speed_00",parameter1: "par_speed_00", unit: "rpm" },
    //{ title: "Frequency [Hz]", parameter1: "par_frequency_00", unit: "Hz" },
    {
      title: "Average Current [Amps]",
      parameter3: "par_avg_current_00",
      parameter2: "par_avg_current_00",
      parameter1: "par_avg_current_00",
      unit: "A",
    },
    {
      title: "Average Voltage [V]",
      parameter2: "par_avg_voltage_00",
      parameter3: "par_avg_voltage_00",
      parameter1: "par_avg_voltage_00",
      unit: "V",
    },
     { title: "Average Power [kW]", parameter3: "par_avg_power_00",parameter2: "par_avg_power_00",parameter1: "par_avg_power_00", unit: "kW" },
     // { title: "Pump Load [%]", parameter3: "par_pump_load_percent_00", unit: "%" },
     { title: "Energy [kWh]", parameter3: "par_energy_00",parameter2: "par_energy_00",parameter1: "par_energy_00", unit: "kWh" },
    { title: "Run Hours [hrs]", parameter3: "par_run_hours_00",parameter2: "par_run_hours_00",parameter1: "par_run_hours_00", unit: "hrs" },
  ];

  
  return (
    <>
      {/* Primary Variable Pumps */}

      <GLEqpSummaryTable
        eqpSSTypes={[
          "NONGL_SS_PRIMARY_PUMP",
          "NONGL_SS_CONDENSER_PUMPS",
          "NONGL_SS_SECONDARY_PUMPS",
        ]}
        imageParamsEqp={primaryPumpParams}
      />
      {/* Condenser Pumps */}

      {/* <GLEqpSummaryTable
        eqpSSTypes={["NONGL_SS_CONDENSER_PUMPS"]}
        imageParamsEqp={condenserPumpParams}
      /> */}
    </>
  );
}

export default GlPumpsSummargPage;
