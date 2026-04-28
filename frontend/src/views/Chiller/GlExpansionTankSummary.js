import React, { useEffect, useState } from "react";
import GLEqpSummaryTable from "./GlEqpSummaryTable1";

function GlExpansionTankSummary() {
  let imageParamsEqp = [
    // { title: "Chiller ON/OFF", parameter1: "CH_On_Off", unit: "" },
    // { title: "Chiller Status", parameter1: "CH_On_Off_SS", unit: "" },
    // { title: "Chiller Mode", parameter1: "CH_AM_SS", unit: "" },
    // { title: "Run Status", parameter1: "CH_Run_SS", unit: "" },
    // { title: "Trip Status", parameter1: "CH_Trip_SS", unit: "" },
    {
      title: "Run Status",
      parameter1: "Expansion_Tnk_Pmp_Run_SS",
      unit: "",
    },
    {
      title: "Expansion Tank Actual Pressure",
      parameter1: "Expansion_Tnk_Actual_P",
      unit: "Hrs",
    },
    {
      title: "Expansion Tank Setpoint Pressure",
      parameter1: "Expansion_Tnk_Setpoint_P",
      unit: "Hrs",
    },
    // {
    //   title: "Saturated Suction Temp 1[℃]",
    //   parameter1: "TEMP_SST_A",
    //   unit: "",
    // },
    // {
    //   title: "Saturated Suction Temp 2[℃]",
    //   parameter1: "Comp_Load_1",
    //   unit: "",
    // },
    // {
    //   title: "Saturated Condenser Temp[℃]",
    //   parameter1: "TEMP_SCT_A",
    //   unit: "",
    // },
    // {
    //   title: "Saturated Condenser Temp 2[℃]",
    //   parameter1: "Comp_Load_2",
    //   unit: "",
    // },
    // { title: "Compressor Suction 1[℃]", parameter1: "TEMP_SUCT_A", unit: "" },
    //{ title: "Compressor Suction 2[℃]", parameter1: "Comp_Power_1", unit: "" },
    // { title: "Discharge Temperature 1[℃]", parameter1: "TEMP_DGT_A", unit: "" },
    //{ title: "Discharge Temperature 2[℃]", parameter1: "Dis_Temp_2", unit: "" },
    // { title: "Motor Temperature 1[℃]", parameter1: "TEMP_CP_TMP_A", unit: "" },
    //{ title: "Motor Temperature 2[℃]", parameter1: "Dis_Temp_1", unit: "" },
    // { title: "Discharge Pressure 1[Kpa]", parameter1: "PRESSURE_DP_A", unit: "" },
    //{ title: "Discharge Pressure 2[Kpa]", parameter1: "Dis_Pre_1", unit: "" },
    // {
    //   title: "Suction Pressure 1[Kpa]",
    //   parameter1: "PRESSURE_SP_A",
    //   unit: "",
    // },
    // {
    //   title: "Main Suction Pressure 2[Kpa]",
    //   parameter1: "Suc_Pre_1",
    //   unit: "",
    // },
    // { title: "Oil Pressure 1[Kpa]", parameter1: "PRESSURE_OP_A", unit: "" },
    //{ title: "Oil Pressure 2[Kpa]", parameter1: "Oil_Pre_1", unit: "" },
    // {
    //   title: "Oil Pressure Difference 1[Kpa]",
    //   parameter1: "PRESSURE_DOP_A",
    //   unit: "",
    // },
    // {
    //   title: "Oil Pressure Difference 2[Kpa]",
    //   parameter1: "Oil_Pre_1",
    //   unit: "",
    // },
    // { title: "Discharge Superheat 1[℃]", parameter1: "EXV_CTRL_DSH_A", unit: "" },
    //{ title: "Discharge Superheat 2[℃]", parameter1: "Dis_Pre_1", unit: "" },
    // { title: "Suction Superheat 1[℃]", parameter1: "EXV_CTRL_SH_A", unit: "" },
    //{ title: "Suction Superheat 2[℃]", parameter1: "Dis_Pre_1", unit: "" },
    // { title: "EXV State-Value", parameter1: "EXV_CTRL_state_a", unit: "" },
    // { title: "Discharge Pressure 2[PSIG]", parameter1: "Dis_Pre_2", unit: "" },
    // { title: "Discharge Temperature 2[℃]", parameter1: "Dis_Temp_2", unit: "" },
    // { title: "Compressor Power 2", parameter1: "Comp_Power_2", unit: "" },
    // { title: "Oil Pressure 1[PSIG]", parameter1: "Oil_Pre_1", unit: "" },
    // { title: "Oil Pressure 2[PSIG]", parameter1: "Oil_Pre_2", unit: "" },
    // { title: "Oil Temperature 1[℃]", parameter1: "Oil_Temp_1", unit: "" },
    // { title: "Oil Temperature 2[℃]", parameter1: "Oil_Temp_2", unit: "" },
    // { title: "Suction Pressure 1[PSIG]", parameter1: "Suc_Pre_1", unit: "" },
    // { title: "Suction Pressure 2[PSIG]", parameter1: "Suc_Pre_2", unit: "" },
    // { title: "Discharge Pressure 1[PSIG]", parameter1: "Dis_Pre_1", unit: "" },
    // { title: "Discharge Pressure 2[PSIG]", parameter1: "Dis_Pre_2", unit: "" },
    // { title: "Discharge Temperature 1[℃]", parameter1: "Dis_Temp_1", unit: "" },
    // { title: "Discharge Temperature 2[℃]", parameter1: "Dis_Temp_2", unit: "" },
  ];

  const ss_types = ["NONGL_SS_ATCS"];
  return (
    <>
      <GLEqpSummaryTable
        eqpSSTypes={ss_types}
        imageParamsEqp={imageParamsEqp}
      />
    </>
  );
}

export default GlExpansionTankSummary;
