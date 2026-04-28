import React, { useEffect, useState } from "react";
import LandingPage from "./../Heatmap/upsEmsLanding";
import { useSelector } from "react-redux";
import {
  Paper,
  Grid,
  Typography,
  Card,
  ButtonGroup,
  Divider,
  TextField,
} from "@material-ui/core";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import api from "./../../api";
import { format } from "date-and-time";

function GlAhu(props) {
  const alerts = useSelector((state) => state.alarm.alarmData);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [eqpSSTypes, setEqpSSTypes] = useState(props.eqpSSTypes);
  const [imageParamsEqp, setImageParamsEqp] = useState(props.imageParamsEqp);

  // Helper function to find matching parameter
  const findMatchingParameter = (param, eqpAttributes, eqpName) => {
    const paramKeys = ["parameter1", "parameter2", "parameter3"];
    for (const key of paramKeys) {
      if (param[key] && param[key] in eqpAttributes) {
        console.log(`Matched ${param[key]} for ${eqpName}`);
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

  const normalizeValue = (val) => {
    if (val === undefined || val === null || val === "" || Number.isNaN(val)) {
      return "-";
    }
    return val;
  };

  // Helper function to process device data (DRY - Don't Repeat Yourself)
  const processDeviceData = (response) => {
    let finalRes = {};
    eqpSSTypes.forEach((key) => {
      if (response[key]) {
        Object.assign(finalRes, response[key]);
      }
    });
    const pumpPriority = { Pri: 1, Sec: 2, Cnd: 3, default: 4 };
    const sortedEqpKeys = Object.keys(finalRes).sort((a, b) => {
      const nameA = finalRes[a].name;
      const nameB = finalRes[b].name;
      const typeA =
        pumpPriority[
          Object.keys(pumpPriority).find((key) => nameA.includes(key))
        ] || pumpPriority.default;
      const typeB =
        pumpPriority[
          Object.keys(pumpPriority).find((key) => nameB.includes(key))
        ] || pumpPriority.default;
      if (typeA !== typeB) return typeA - typeB;
      return nameA.localeCompare(nameB);
    });

    // Sort equipment names
    // const sortedEqpKeys = Object.keys(finalRes).sort((a, b) =>
    //   finalRes[a].name.localeCompare(finalRes[b].name)
    // );

    /* ---------------- COLUMNS ---------------- */
    let col = [
      { field: "Parameter", pinned: "left", width: 220 },
      ...sortedEqpKeys.map((key) => ({
        field: key,
        width: 240,
        headerName: finalRes[key].name,
        cellStyle: getCellStyle,
      })),
    ];
    setColDefs(col);

    /* ---------------- ROWS ---------------- */
    let row = imageParamsEqp.map((param) => {
      const result = { Parameter: param.title };

      sortedEqpKeys.forEach((key) => {
        const eqpName = finalRes[key].name;
        const eqpAttributes = finalRes[key]?.Eqp_Attributes || {};

        const selectedParam = findMatchingParameter(
          param,
          eqpAttributes,
          eqpName
        );

        if (!selectedParam) {
          result[key] = "-";
          return;
        }

        const presentValue = eqpAttributes[selectedParam]?.presentValue;

        const rawVal =
          selectedParam === "CH_On_Off" ||
          selectedParam === "CH_Out_Vlv_SS" ||
          selectedParam === "CH_On_Off_SS" ||
          selectedParam === "SAF_VFD_On_Off_Fbk" ||
          selectedParam === "CSU_Run_SS" ||
          selectedParam === "Pri_Pmp_On_Off" ||
          selectedParam === "Sec_Pmp_On_Off" ||
          selectedParam === "Cnd_Pmp_On_Off" ||
          selectedParam === "Heat_Pmp_Chilled_Wtr_On_Off" ||
          selectedParam === "Heat_Pmp_Hot_Wtr_On_Off" ||
          selectedParam === "cmd_on_off_00" ||
          selectedParam === "sts_on_off_00"||selectedParam === "par_on_off_00" 
            ? presentValue === "active"
              ? "ON"
              : presentValue === "inactive"
              ? "OFF"
              : ""
            : selectedParam === "SAF_VFD_Trip_SS_Alarm" ||
              selectedParam === "CSU_Trip_SS_Alarm"
            ? presentValue === "active"
              ? "Tripped"
              : presentValue === "inactive"
              ? "Normal"
              : ""
            : selectedParam === "CH_AM_SS" ||
              selectedParam === "SAF_VFD_AM_Fbk" ||
              selectedParam === "CSU_Fan_AM_SS" ||
              selectedParam === "Pri_Pmp_AM_SS" ||
              selectedParam === "Sec_Pmp_AM_SS" ||
              selectedParam === "Cnd_Pmp_AM_SS" ||
              selectedParam === "sts_auto_manual_00"
            ? presentValue === "active"|| presentValue === "2.0"
              ? "Auto"
              : presentValue === "inactive"|| presentValue === "1.0"
              ? "Manual"
              : ""
            : selectedParam === "DPS_Filter" ||
              selectedParam === "CSU_Pre_Filter"
            ? presentValue === "active"
              ? "Clean"
              : presentValue === "inactive"
              ? "Clogged"
              : ""
            : selectedParam === "Heater_Bank_1_Status" ||
              selectedParam === "CSU_Heater_Bank_1_Status" ||
              selectedParam === "Heater_Bank_2_Status" ||
              selectedParam === "CSU_Heater_Bank_2_Status" ||
              selectedParam === "Heater_Bank_3_Status" ||
              selectedParam === "CSU_Heater_Bank_3_Status"
            ? presentValue === "active"
              ? "ON"
              : presentValue === "inactive"
              ? "OFF"
              : ""
            : selectedParam === "Pri_Pmp_Trip_SS" ||
              selectedParam === "Sec_Pmp_Trip_SS" ||
              selectedParam === "Cnd_Pmp_Trip_SS" ||
              selectedParam === "CH_Trip_SS" ||
              selectedParam === "alm_trip_00"
            ? presentValue === "active"
              ? "Tripped"
              : presentValue === "inactive"
              ? "Normal"
              : ""
            : selectedParam === "Pri_Pmp_Run_SS" ||
              selectedParam === "Sec_Pmp_Run_SS" ||
              selectedParam === "Cnd_Pmp_Run_SS"
            ? presentValue === "active"
              ? "ON"
              : presentValue === "inactive"
              ? "OFF"
              : ""
            : presentValue;

        const finalVal = normalizeValue(rawVal);

        result[key] =
          finalVal === "-"
            ? "-"
            : !isNaN(finalVal)
            ? formatter.format(finalVal)
            : String(finalVal);
        // if (rawVal === undefined || rawVal === null || rawVal === "") {
        //   result[key] = "-";
        // } else if (!isNaN(rawVal)) {
        //   result[key] = formatter.format(rawVal);
        // } else {
        //   result[key] = String(rawVal);
        // }
      });

      return result;
    });

    setRowData(row);
  };

  useEffect(() => {
    // Initial data fetch
    api.floor
      .cpmGetDevData()
      .then((response) => {
        console.log("Initial API Response:", response);
        processDeviceData(response);
      })
      .catch((err) => {
        console.error("Error fetching device data:", err);
      });

    // Set up timer for periodic updates
    const timer = setInterval(() => {
      console.log("----------------in timer");
      api.floor
        .cpmGetDevData()
        .then((response) => {
          processDeviceData(response);
        })
        .catch((err) => {
          console.error("Error in timer fetching device data:", err);
        });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div
        className="ag-theme-alpine"
        style={{ height:800, width: "100%", marginTop: "3vh" }}
      >
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
  minWidth: 120,        // ← ADD THIS
  suppressMovable: true, // ← ADD THIS
}}
        />
        
      </div>
    </>
  );
}

export default GlAhu;