import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable1";

function GlAtcsSummaryPage() {
  let imageParamsEqp = [
  {
    title: "Energy [TRh]",
    parameter1: "par_energy_consump_00",
    unit: "",
  },
  {
    title: "TR",
    parameter1: "par_actual_power_00",
    unit: "",
  },
  {
    title: "Flow [m³/hr]",
    parameter1: "par_actual_flow_00",
    unit: "",
  },
  {
    title: "Inlet Temperature [°C]",
    parameter1: "par_inlet_temp_00",
    unit: "",
  },
  {
    title: "Outlet Temperature [°C]",
    parameter1: "par_outlet_temp_00",
    unit: "",
  },
];

  const ss_types = ["NONGL_SS_COMMON_HEADER"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
      />
    </>
  );
}

export default GlAtcsSummaryPage;
