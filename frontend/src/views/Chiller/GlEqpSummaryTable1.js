import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import api from "./../../api";

function GlAhu(props) {
                        const alerts = useSelector(
                          (state) => state.alarm.alarmData
                        );
                        const formatter = new Intl.NumberFormat("en-US", {
                          minimumFractionDigits: 1,
                          maximumFractionDigits: 1,
                        });
                        const [rowData, setRowData] = useState([]);
                        const [colDefs, setColDefs] = useState([]);
                        const [eqpSSTypes, setEqpSSTypes] = useState(
                          props.eqpSSTypes
                        );
                        const [imageParamsEqp, setImageParamsEqp] = useState(
                          props.imageParamsEqp
                        );
                        const [
                          chillerExtraParams,
                          setChillerExtraParams,
                        ] = useState(props.chillerExtraParams);
                        const [gridHeight, setGridHeight] = useState(570);
                        const [chillerTrKwData, setChillerTrKwData] = useState(
                          {}
                        );

                        // Helper function to find matching parameter
                        // Helper function to find matching parameter based on SS type
                        const findMatchingParameter = (
                          param,
                          eqpAttributes,
                          eqpName,
                          ssType
                        ) => {
                          // Determine which parameter to use based on SS type index
                          const ssTypeIndex = eqpSSTypes.indexOf(ssType);
                          const paramKey = `parameter${ssTypeIndex + 1}`;

                          // First try the parameter specific to this SS type
                          if (
                            param[paramKey] &&
                            param[paramKey] in eqpAttributes
                          ) {
                            console.log(
                              `Matched ${param[paramKey]} for ${eqpName} (${ssType}, using ${paramKey})`
                            );
                            return param[paramKey];
                          }

                          // Fallback: try all parameters in order
                          const paramKeys = [
                            "parameter1",
                            "parameter2",
                            "parameter3",
                          ];
                          for (const key of paramKeys) {
                            if (param[key] && param[key] in eqpAttributes) {
                              console.log(
                                `Fallback matched ${param[key]} for ${eqpName}`
                              );
                              return param[key];
                            }
                          }

                          return null;
                        };

                        // Cell styling function for different status values
                       const getCellStyle = (params) => {
  const cellValue = params.value;
  const rowName = params.data?.Parameter;

  if (rowName === "Parameter") return null;

  const GREEN = { color: "#46ac48ff", fontWeight: "bold" };
  const RED   = { color: "#b33c33ff", fontWeight: "bold" };
  const GREY  = { color: "#c0bdbdff", fontWeight: "bold" };

  // --- Tripped / Alarm ---
  if (cellValue === "Tripped")                          return RED;
  if (cellValue === "Alarm")                            return RED;
  if (cellValue === "High")                             return RED;
  if (cellValue === "Low")                              return RED;

  // --- ON / Running / Auto / Normal / Open ---
  if (cellValue === "ON")                               return GREEN;
  if (cellValue === "Running")                          return GREEN;
  //if (cellValue === "Auto")                             return GREEN;
  if (cellValue === "Normal")                           return GREEN;
  if (cellValue === "Open")                             return GREEN;

  // --- OFF / Stopped / Manual / Close ---
  if (cellValue === "OFF")                              return GREY;
  if (cellValue === "Stopped")                          return GREY;
 // if (cellValue === "Manual")                           return GREY;
  if (cellValue === "Close")                            return GREY;

  return null;
};

                        // Process device data
                        const processDeviceData = (response) => {
                          let finalRes = {};
                          eqpSSTypes.forEach((key) => {
                            if (response[key])
                              Object.assign(finalRes, response[key]);
                          });

                          // Custom pump sort: Primary -> Secondary -> Condenser -> others
                          const pumpPriority = {
                            Pri: 1,
                            Sec: 2,
                            Cnd: 3,
                            default: 4,
                          };
                          const sortedEqpKeys = Object.keys(finalRes).sort(
                            (a, b) => {
                              const nameA = finalRes[a].name;
                              const nameB = finalRes[b].name;
                              const typeA =
                                pumpPriority[
                                  Object.keys(pumpPriority).find((key) =>
                                    nameA.includes(key)
                                  )
                                ] || pumpPriority.default;
                              const typeB =
                                pumpPriority[
                                  Object.keys(pumpPriority).find((key) =>
                                    nameB.includes(key)
                                  )
                                ] || pumpPriority.default;
                              if (typeA !== typeB) return typeA - typeB;
                              return nameA.localeCompare(nameB);
                            }
                          );

                          // Build equipment data map
                         // Build equipment data map
const equipmentDataMap = {};
sortedEqpKeys.forEach((key) => {
  const eqpName = finalRes[key].name;
  const eqpAttributes = finalRes[key]?.Eqp_Attributes || {};
  const ssType = finalRes[key]?.ss_type; // Get the SS type
  equipmentDataMap[eqpName] = {};

  imageParamsEqp.forEach((param) => {
    const selectedParam = findMatchingParameter(
      param,
      eqpAttributes,
      eqpName,
      ssType // Pass the SS type
    );
                              if (!selectedParam) {
                                equipmentDataMap[eqpName][param.title] = "-";
                                return;
                              }

                              const presentValue =
                                eqpAttributes[selectedParam]?.presentValue;

                              const onOffParams = [
                                "CH_On_Off",
                                "CH_Out_Vlv_SS",
                                "CH_Run_SS",
                                "CH_On_Off_SS",
                                "PriV_Pmp_On_Off_SS",
                                "PriV_Pmp_On_Off",
                                "SAF_VFD_On_Off_Fbk",
                                "CSU_Run_SS",
                                "Pri_Pmp_On_Off",
                                "Sec_Pmp_On_Off",
                                "Cnd_Pmp_On_Off",
                                "Heat_Pmp_Chilled_Wtr_On_Off",
                                "Heat_Pmp_Hot_Wtr_On_Off",
                                "CT_Var_FAN_2_On_Off_SS",
                                "CT_Var_FAN_3_On_Off_Cmd",
                                "CT_VAR_FAN_1_On_Off_SS",
                                "CT_On_Off",
                                "CT_MWP_On_Off_Cmd",
                                "CT_Var_FAN_2_On_Off_Cmd",
                                "CT_VAR_FAN_1_On_Off_Cmd",
                                "CT_Var_FAN_3_On_Off_SS",
                                "PriV_Pmp_Off_Mode",
                                "CH_Motor_Run",
                                "PriV_Pmp_Run_Fbk",
                                "CH_Panel_Stop_Switch",
                                
                                "sts_on_off_00",
                                "cmd_on_off_00",
                              
                                
                                
                                
                                
                                "par_comp_on_off_01",
                                "par_comp_on_off_02",
                                
                                
                               
                                
                                "cmd_fan_on_off_00",
                                "sts_fan_on_off_00",
                                "cmd_fan_vfd_on_off_00",
                                "sts_fan_vfd_on_off_00",
                                
                                
                              ];

                              const tripParams = [
                                "SAF_VFD_Trip_SS_Alarm",
                                "CSU_Trip_SS_Alarm",
                                "CT_Var_FAN_2_Trip_SS_Alarm",
                                "CT_VAR_FAN_1_Trip_SS_Alarm",
                                "CT_Var_FAN_3_Trip_SS_Alarm",
                                "Cnd_Pmp_Trip_SS_Alarm",
                                "CT_Trip_SS_Alarm",
                                "PriV_Pmp_Trip_SS",
                                "Cnd_Pmp_Trip_SS",
                                "Pri_Pmp_Trip_SS",
                                "Sec_Pmp_Trip_SS",
                                "CH_Trip_SS",
                                "PriV_Pmp_Trip_SS_Alarm",
                                "CH_Trip_SS_Alarm",
                                "alm_trip_00",
                                "alm_fan_trip_00",
                                "alm_diagnostic_00",
                                "alm_fan_00",
                              ];

                              const autoManualParams = [
                                "CH_AM_SS",
                                "SAF_VFD_AM_Fbk",
                                "CSU_Fan_AM_SS",
                                "Pri_Pmp_AM_SS",
                                "Sec_Pmp_AM_SS",
                                "Cnd_Pmp_AM_SS",
                                "CT_Var_FAN_2_AM_SS",
                                "CT_VAR_FAN_1_AM_SS",
                                "CT_Var_FAN_3_AM_SS",
                                "PriV_Pmp_AM_SS",
                                "CH_unit_source",
                                "PriV_Pmp_Auto_Mode",
                                "sts_auto_manual_00",
                                "sts_fan_auto_manual_00",
                              ];
                              // const Waterlevelhigh = [
                              //   "par_lvl_sw_high_00",
                              //   "sts_level_switch_high_00",
                              // ];
                              // const Waterlevellow = [
                              //   "par_lvl_sw_low_00",
                              //   "sts_level_switch_low_00",
                              // ];
                              const levelParams = [
                                "sts_level_switch_high_00",
                                "sts_level_switch_low_00",
                              ];
//                               const valveParams = [
//   "cmd_outlet_vlv_on_off_00",
//   "sts_outlet_vlv_00",
//   "cmd_inlet_vlv_on_off_00",
//   "sts_inlet_vlv_00",
//   "CH_In_Vlv_On_Off",
//   "CH_In_Vlv_On_Off_SS",
//   "CT_Out_Vlv_On_Off_Fbk",
// ];


                              const flowswitch = [
                                "CH_Chilled_Lqd_Flow_Switch",
                                "CH_CD_Lqd_Flow_Switch",
                                "CT_Out_Vlv_On_Off_Fbk",
                                "CH_In_Vlv_On_Off",
                                "CH_In_Vlv_On_Off_SS",
                                "cmd_outlet_vlv_on_off_00",
                                "sts_inlet_vlv_00",
                                "sts_outlet_vlv_00",
                                "cmd_evap_vlv_on_off_00",
                                "sts_evap_vlv_on_off_00",
                                "cmd_cond_vlv_on_off_00",
                                "sts_cond_vlv_on_off_00",
                                "sts_cond_flow_00",
                                "sts_evap_flow_00",
                                "cmd_inlet_vlv_on_off_00",
                                "sts_vlv_on_off_01",
                                "sts_vlv_on_off_02",
                                "cmd_vlv_on_off_01",
                                "cmd_vlv_on_off_00",
                              ];

                              const pumpsfbk = [
                                "PriV_Pmp_Run_Fbk_Alarm",
                                "PriV_Pmp_Drive_Fault_Alarm",
                                "PriV_Pmp_Alarm",
                              ];
                              const Safetyfaultcodes = [
                                "CH_Unit_safety_fault_code_Alarm",
                              ];
                              const LocalModePump = [
                                "PriV_Pmp_Hand_Mode",
                                "PriV_Pmp_Off_Mode",
                                "PriV_Pmp_Auto_Mode",
                              ];
                              const LocalModeCoolingTower = [
                                "CT_Var_Fan_1_Hand_on",
                                "CT_Var_Fan_1_Auto_on",
                                "CT_Var_Fan_2_Hand_on",
                                "CT_Var_Fan_2_Auto_on",
                                "CT_Var_Fan_3_Hand_on",
                                "CT_Var_Fan_3_Auto_on",
                              ];
                              const operationcodes = ["CH_Operation_code"];
                              const filterParams = [
                                "DPS_Filter",
                                "CSU_Pre_Filter",
                              ];
                              // const levelParams = [
                              //   "CTW_High_Lvl",
                              //   "CTW_Low_Lvl",
                              // ];
                              const heaterParams = [
                                "Heater_Bank_1_Status",
                                "CSU_Heater_Bank_1_Status",
                                "Heater_Bank_2_Status",
                                "CSU_Heater_Bank_2_Status",
                                "Heater_Bank_3_Status",
                                "CSU_Heater_Bank_3_Status",
                              ];

                              const runStatusParams = [
                                "Pri_Pmp_Run_SS",
                                "Sec_Pmp_Run_SS",
                                "Cnd_Pmp_Run_SS",
                                "CT_MWP_Run_SS",
                                "PriV_Pmp_Run_SS",
                                "CT_Var_FAN_2_RUN_SS",
                                "CT_VAR_FAN_1_RUN_SS",
                                "CT_Run_SS",
                                "CT_Var_FAN_3_RUN_SS",
                              ];
                              // Determine the value based on parameter type
                              let rawVal;
                              if (onOffParams.includes(selectedParam)) {
                                rawVal =
                                  (presentValue === "active" ||
                                  presentValue === "1.0" ||
                                  presentValue === "1" ||
                                  presentValue == 1)
                                    ? "ON"
                                    : (presentValue === "inactive" ||
                                      presentValue === "0" ||
                                      presentValue === "0.0" ||
                                      presentValue == 0)
                                    ? "OFF"
                                    : presentValue;
                              } else if (tripParams.includes(selectedParam)) {
                                rawVal =
                                  (presentValue === "active" ||
                                  presentValue === "1.0" ||
                                  presentValue === "1" ||
                                  presentValue === 1)
                                    ? "Tripped"
                                    : (presentValue === "inactive" ||
                                      presentValue === "0" ||
                                      presentValue === "0.0" ||
                                      presentValue === 0)
                                    ? "Normal"
                                    : presentValue;
                              } else if (flowswitch.includes(selectedParam)) {

                                rawVal =
                                  (presentValue === "active" ||
                                  presentValue === "1.0" ||
                                  presentValue === "1" ||
                                  presentValue === 1 ||
                                  presentValue === 1.0)
                                    ? "Open"
                                    : (presentValue === "inactive" ||
                                      presentValue === "0" ||
                                      presentValue === "0.0" ||
                                      presentValue === 0)
                                    ? "Close"
                                    : presentValue;
                          
                              }else if (pumpsfbk.includes(selectedParam)) {
                                rawVal =
                                  (presentValue === "active" ||
                                  presentValue === "1.0" ||
                                  presentValue === "1" ||
                                  presentValue === 1)
                                    ? "Alarm"
                                    : (presentValue === "inactive" ||
                                      presentValue === "0" ||
                                      presentValue === "0.0" ||
                                      presentValue === 0)
                                    ? "Normal"
                                    : presentValue;
                              } else if (
                                autoManualParams.includes(selectedParam)
                              ) {
                                rawVal =
                                  (presentValue === "active" ||
                                  presentValue === "2.0" ||
                                  presentValue === "2" ||
                                  presentValue === 2.0)
                                    ? "Auto"
                                    : "Manual";
                              } else if (
                                Safetyfaultcodes.includes(selectedParam)
                              ) {
                                rawVal =
                                  (presentValue === "0" ||
                                  presentValue === "0.0" ||
                                  presentValue === 0)
                                    ? "No Safety Faults"
                                    :( presentValue === "1" ||
                                      presentValue === "1.0" ||
                                      presentValue === 1)
                                    ? "Evaporator - Low Pressure"
                                    : presentValue === "2" ||
                                      presentValue === "2.0" ||
                                      presentValue === 2
                                    ? "Evaporator - Transducer Or Leaving Liquid Probe"
                                    : presentValue === "3" ||
                                      presentValue === "3.0" ||
                                      presentValue === 3
                                    ? "Evaporator - Transducer Or Temperature Sensor"
                                    : presentValue === "4" ||
                                      presentValue === "4.0" ||
                                      presentValue === 4
                                    ? "Condenser - High Pressure Contacts Open"
                                    : presentValue === "5" ||
                                      presentValue === "5.0" ||
                                      presentValue === 5
                                    ? "Condenser - High Pressure"
                                    : presentValue === "6" ||
                                      presentValue === "6.0" ||
                                      presentValue === 6
                                    ? "Condenser - Pressure Transducer Out Of Range"
                                    : presentValue === "9" ||
                                      presentValue === "9.0" ||
                                      presentValue === 9
                                    ? "Discharge - High Temperature"
                                    : presentValue === "12" ||
                                      presentValue === "12.0" ||
                                      presentValue === 12
                                    ? "Oil - High Differential Pressure"
                                    : presentValue === "21" ||
                                      presentValue === "21.0" ||
                                      presentValue === 21
                                    ? "Control Panel - Power Failure"
                                    : presentValue === "29" ||
                                      presentValue === "29.0" ||
                                      presentValue === 29
                                    ? "VSD - High Heatsink Temperature"
                                    : presentValue === "31" ||
                                      presentValue === "31.0" ||
                                      presentValue === 31
                                    ? "VSD - HIGH PHASE A INVERTER HEATSINK TEMPERATURE"
                                    : presentValue === "32" ||
                                      presentValue === "32.0" ||
                                      presentValue === 32
                                    ? "VSD - HIGH PHASE B INVERTER HEATSINK TEMPERATURE"
                                    : presentValue === "33" ||
                                      presentValue === "33.0" ||
                                      presentValue === 33
                                    ? "VSD - HIGH PHASE C INVERTER HEATSINK TEMPERATURE"
                                    : presentValue === "66" ||
                                      presentValue === "66.0" ||
                                      presentValue === 66
                                    ? "VSD - MOTOR CURRENT IMBALANCE"
                                    : presentValue === "67" ||
                                      presentValue === "67.0" ||
                                      presentValue === 67
                                    ? "Condenser - High Pressure - Stopped"
                                    : presentValue;
                              } else if (
                                operationcodes.includes(selectedParam)
                              ) {
                                rawVal =
                                  presentValue === "0" ||
                                  presentValue === "0.0" ||
                                  presentValue === 0
                                    ? "Unit Stopped - Ready to Start"
                                    : presentValue === "1" ||
                                      presentValue === "1.0" ||
                                      presentValue === 1
                                    ? "Unit Stopped - Local Shutdown"
                                    : presentValue === "2" ||
                                      presentValue === "2.0" ||
                                      presentValue === 2
                                    ? "Unit Stopped - Remote Shutdown"
                                    : presentValue === "3" ||
                                      presentValue === "3.0" ||
                                      presentValue === 3
                                    ? "Unit Stopped - Warning Active"
                                    : presentValue === "4" ||
                                      presentValue === "4.0" ||
                                      presentValue === 4
                                    ? "Unit Stopped - Cycling Shutdown"
                                    : presentValue === "5" ||
                                      presentValue === "5.0" ||
                                      presentValue === 5
                                    ? "Unit Stopped - Safety Shutdown"
                                    : presentValue === "6" ||
                                      presentValue === "6.0" ||
                                      presentValue === 6
                                    ? "Unit Start Inhibit"
                                    : presentValue === "7" ||
                                      presentValue === "7.0" ||
                                      presentValue === 7
                                    ? "Unit starting"
                                    : presentValue === "8" ||
                                      presentValue === "8.0" ||
                                      presentValue === 8
                                    ? "Unit Running - No Abnormal Condition"
                                    : presentValue === "9" ||
                                      presentValue === "9.0" ||
                                      presentValue === 9
                                    ? "Unit Running - No Abnormal Condition"
                                    : presentValue === "10" ||
                                      presentValue === "10.0" ||
                                      presentValue === 10
                                    ? "Unit Running - Chiller Unload Before Shutdown"
                                    : presentValue === "11" ||
                                      presentValue === "11.0" ||
                                      presentValue === 11
                                    ? "Unit Coastdow"
                                    : presentValue === "12" ||
                                      presentValue === "12.0" ||
                                      presentValue === 12
                                    ? "Unit Running - Modified Run"
                                    : presentValue === "13" ||
                                      presentValue === "13.0" ||
                                      presentValue === 13
                                    ? "Unit Stopped - Internal Shutdown"
                                    : presentValue === "21" ||
                                      presentValue === "21.0" ||
                                      presentValue === 21
                                    ? "Unit Running - Cooling - No Abnormal Condition"
                                    : presentValue === "22" ||
                                      presentValue === "22.0" ||
                                      presentValue === 22
                                    ? "Unit Running - Cooling - Warning Active"
                                    : presentValue === "23" ||
                                      presentValue === "23.0" ||
                                      presentValue === 23
                                    ? "Unit Running - Cooling - Modified Run"
                                    : presentValue;
                              } else if (filterParams.includes(selectedParam)) {
                                rawVal =
                                  presentValue === "active" ||
                                  presentValue === "1.0"
                                    ? "Clean"
                                    : presentValue === "inactive" || "0"
                                    ? "Clogged"
                                    : presentValue;
                              } else if (
                                LocalModePump.includes(selectedParam)
                              ) {
                                const hand =
                                  eqpAttributes?.PriV_Pmp_Hand_Mode
                                    ?.presentValue;
                                const off =
                                  eqpAttributes?.PriV_Pmp_Off_Mode
                                    ?.presentValue;
                                const auto =
                                  eqpAttributes?.PriV_Pmp_Auto_Mode
                                    ?.presentValue;

                                if (
                                  hand === "active" ||
                                  hand === "1.0" ||
                                  hand === "1" ||
                                  presentValue === 1
                                ) {
                                  rawVal = "Local";
                                } else if (
                                  off === "active" ||
                                  off === "1.0" ||
                                  off === "1" ||
                                  presentValue === 1
                                ) {
                                  rawVal = "OFF";
                                } else if (
                                  auto === "active" ||
                                  auto === "1.0" ||
                                  auto === "1" ||
                                  presentValue === 1
                                ) {
                                  rawVal = "Auto";
                                } else {
                                  rawVal = "";
                                }
                              } else if (
                                LocalModeCoolingTower.includes(selectedParam)
                              ) {
                                // Determine which fan we are dealing with
                                const fanIndex = selectedParam.includes("Fan_1")
                                  ? "1"
                                  : selectedParam.includes("Fan_2")
                                  ? "2"
                                  : "3";

                                // Dynamically build attribute keys
                                const localKey = `CT_Var_Fan_${fanIndex}_Hand_on`;
                                const autoKey = `CT_Var_Fan_${fanIndex}_Auto_on`;

                                const localVal =
                                  eqpAttributes?.[localKey]?.presentValue;
                                const autoVal =
                                  eqpAttributes?.[autoKey]?.presentValue;

                                if (
                                  localVal === "active" ||
                                  localVal === "1.0" ||
                                  localVal === 1
                                ) {
                                  rawVal = "Local";
                                } else if (
                                  autoVal === "active" ||
                                  autoVal === "1.0" ||
                                  autoVal === 1
                                ) {
                                  rawVal = "Remote";
                                } else {
                                  rawVal = "OFF";
                                }
                              } else if (heaterParams.includes(selectedParam)) {
                                rawVal =
                                  presentValue === "active" ||
                                  presentValue === "1.0"
                                    ? "ON"
                                    : presentValue === "inactive" ||
                                      presentValue === "0"
                                    ? "OFF"
                                    : presentValue;
                              } else if (levelParams.includes(selectedParam)) {
          const high = eqpAttributes?.sts_level_switch_high_00?.presentValue;
          const low = eqpAttributes?.sts_level_switch_low_00?.presentValue;
 
          if (high === "active" || high === "1.0" || high === 1) {
            rawVal = "High";
          } else if (low === "active" || low === "1.0" || low === 1) {
            rawVal = "Low";
          } else {
            rawVal = "Normal";
          }
                              }

                              // else if (runStatusParams.includes(selectedParam)) {
                              //   rawVal =
                              //     presentValue === "active"
                              //       ? "Running"
                              //       : presentValue === "inactive"
                              //       ? "Stopped"
                              //       : presentValue;
                              // }
                              else {
                                // For all other parameters (including numeric ones), use the raw presentValue
                                rawVal = presentValue;
                              }
                              if (
                                rawVal === undefined ||
                                rawVal === null ||
                                rawVal === ""
                              ) {
                                equipmentDataMap[eqpName][param.title] = "-";
                              } else if (!isNaN(rawVal)) {
                                equipmentDataMap[eqpName][
                                  param.title
                                ] = formatter.format(rawVal);
                              } else {
                                equipmentDataMap[eqpName][param.title] = String(
                                  rawVal
                                );
                              }
                            });
                          });

                          // Column setup - Parameters are now columns
                          // const equipmentNames = sortedEqpKeys.map((key) => finalRes[key].name);
                          // Column setup - Parameters are now columns with alphabetic sorting
                          const equipmentNames = sortedEqpKeys
                            .map((key) => finalRes[key].name)
                            .sort((a, b) => {
                              // Clean the names by removing tabs, newlines, and trimming
                              const nameA = (a || "")
                                .replace(/[\t\r\n]/g, "")
                                .trim();
                              const nameB = (b || "")
                                .replace(/[\t\r\n]/g, "")
                                .trim();

                              // Check if names start with a letter or number
                              const startsWithLetterA = /^[a-zA-Z]/.test(nameA);
                              const startsWithLetterB = /^[a-zA-Z]/.test(nameB);

                              // If one starts with letter and other doesn't, letter comes first
                              if (startsWithLetterA && !startsWithLetterB)
                                return -1;
                              if (!startsWithLetterA && startsWithLetterB)
                                return 1;

                              // Both are same type, sort naturally with numeric handling
                              return nameA
                                .toLowerCase()
                                .localeCompare(nameB.toLowerCase(), undefined, {
                                  numeric: true,
                                  sensitivity: "base",
                                });
                            });
                          const numEquipment = equipmentNames.length;
                          const baseColumnWidth = Math.max(
                            120,
                            Math.min(200, 1000 / (numEquipment + 1))
                          );

                          const col = [
                            {
                              field: "Parameter",
                              pinned: "left",
                              width: 350,
                              minWidth: 250,
                              headerName: "Parameter",
                            },
                            ...equipmentNames.map((eqpName) => ({
                              field: eqpName,
                              cellStyle: getCellStyle,
                              flex: 1,              // ← CHANGE from width to flex
    minWidth: 250,        // ← ADD THIS
    maxWidth: 400, 
                              headerName: eqpName,
                            })),
                          ];
                          setColDefs(col);

                          // Row setup - Each parameter is now a row
                          const row = imageParamsEqp.map((param) => {
                            const rowObj = { Parameter: param.title };
                            equipmentNames.forEach((eqpName) => {
                              rowObj[eqpName] =
                                equipmentDataMap[eqpName][param.title] || "-";
                            });
                            return rowObj;
                          });

                          const calculatedHeight = Math.max(
                            400,
                            Math.min(800, 56 + row.length * 42 + 56 + 20)
                          );
                          setGridHeight(calculatedHeight);
                          console.log("");
                          setRowData(row);
                        };

                        const processChillerExtraData = (response) => {
                          const chillerMap = {
                            "38a1c57a-1d2b-477c-8ae9-b00bcba618f2":
                              "Chiller_01",
                            "d94e57ab-af21-41a7-a5d2-6f722d4f3f6b":
                              "Chiller_02",
                          };

                          // Step 1: Group values by metric_id
                          const grouped = {};

                          response.forEach((item) => {
                            const chillerName =
                              chillerMap[item.ss_id] || "Unknown";

                            if (!grouped[item.metric_id]) {
                              grouped[item.metric_id] = {
                                "\tChiller_01": "-",
                                "\tChiller_02": "-",
                              };
                            }

                            grouped[item.metric_id][`\t${chillerName}`] =
                              item.metric_value;
                          });

                          // Step 2: Build final rows in SAME ORDER as chillerExtraParams
                          // Exclude KW and TR since they come from a different API
                          const finalRows = chillerExtraParams
                            .filter(
                              (param) =>
                                param.parameter1 !== "kw" &&
                                param.parameter1 !== "tr"
                            )
                            .map((param) => {
                              const metric = param.parameter1;
                              const title = param.title;

                              return {
                                Parameter: title,
                                "\tChiller_01":
                                  grouped[metric]?.["\tChiller_01"] ?? "-",
                                "\tChiller_02":
                                  grouped[metric]?.["\tChiller_02"] ?? "-",
                              };
                            });

                          // Step 3: Add KW and TR rows from chillerTrKwData based on chillerExtraParams
                          const inverseChillerMap = {
                            Chiller_01: "38a1c57a-1d2b-477c-8ae9-b00bcba618f2",
                            Chiller_02: "d94e57ab-af21-41a7-a5d2-6f722d4f3f6b",
                          };

                          // Add rows for parameters that are from the API (kw, tr)
                          chillerExtraParams.forEach((param) => {
                            if (
                              param.parameter1 === "kw" ||
                              param.parameter1 === "tr"
                            ) {
                              const apiKey = param.parameter1; // "kw" or "tr"
                              finalRows.push({
                                Parameter: param.title,
                                "\tChiller_01":
                                  chillerTrKwData[
                                    inverseChillerMap["Chiller_01"]
                                  ]?.[apiKey] ||
                                  chillerTrKwData[
                                    inverseChillerMap["Chiller_01"]
                                  ]?.[apiKey.toUpperCase()] ||
                                  "-",
                                "\tChiller_02":
                                  chillerTrKwData[
                                    inverseChillerMap["Chiller_02"]
                                  ]?.[apiKey] ||
                                  chillerTrKwData[
                                    inverseChillerMap["Chiller_02"]
                                  ]?.[apiKey.toUpperCase()] ||
                                  "-",
                              });
                            }
                          });

                          // ✅ APPEND — DO NOT OVERWRITE
                          setRowData((prev) => [...prev, ...finalRows]);
                        };

                        useEffect(() => {
                          setEqpSSTypes(props.eqpSSTypes);
                          setImageParamsEqp(props.imageParamsEqp);
                        }, [props.eqpSSTypes, props.imageParamsEqp]);

                        useEffect(() => {
                          api.floor
                            .cpmGetDevData()
                            .then(processDeviceData)
                            .catch(console.error);
                          api.floor
                            .getChillerExtraParameters()
                            .then((res) => processChillerExtraData(res))
                            .catch(console.error);

                          // Fetch KW/TR data for each chiller
                          const fetchChillerKwTr = () => {
                            api.floor
                              .cpmGetDevData()
                              .then((res) => {
                                const chillers = res["NONGL_SS_CHILLER"] || {};
                                Object.values(chillers).forEach((chiller) => {
                                  const payload = {
                                    ss_id: chiller.id,
                                    ss_type: "NONGL_SS_CHILLER",
                                  };
                                  api.floor
                                    .getChillerikw(payload)
                                    .then((response) => {
                                      console.log(
                                        "KW/TR data for chiller",
                                        chiller.id,
                                        response
                                      );
                                      setChillerTrKwData((prev) => ({
                                        ...prev,
                                        [chiller.id]: response,
                                      }));
                                    })
                                    .catch((error) => {
                                      console.error(
                                        "Error fetching chiller KW/TR:",
                                        error
                                      );
                                    });
                                });
                              })
                              .catch(console.error);
                          };

                          fetchChillerKwTr();

                          const timer = setInterval(() => {
                            api.floor
                              .cpmGetDevData()
                              .then((res) => processDeviceData(res))
                              .catch(console.error);
                            api.floor
                              .getChillerExtraParameters()
                              .then((res) => processChillerExtraData(res))
                              .catch(console.error);
                            fetchChillerKwTr();
                          }, 5000);

                          return () => clearInterval(timer);
                        }, [eqpSSTypes, imageParamsEqp]);

                        return (
                          <div
                            className="ag-theme-alpine"
                            style={{
                              height: gridHeight,
                              width: "100%",
                              marginTop: "3vh",
                            }}
                          >
                            {console.log("rowData--", rowData)}
                            {console.log("colDefs--", colDefs)}
                            <AgGridReact
                              rowData={rowData}
                              columnDefs={colDefs}
                              rowSelection={"single"}
                              pagination={false}
                              suppressMenuHide={true}
                              suppressFilterButton={true}
                              suppressColumnVirtualisation={true} 
                              suppressHorizontalScroll={false} 
                              //domLayout="autoHeight"
                              defaultColDef={{
  resizable: true,
  sortable: false,
  minWidth: 280,        // ← ADD THIS
  suppressMovable: true // ← ADD THIS to prevent column dragging out of view
}}
                            />
                          </div>
                        );
                      }

export default GlAhu;
