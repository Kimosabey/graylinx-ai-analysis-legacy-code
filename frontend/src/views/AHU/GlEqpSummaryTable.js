import React, { useEffect, useState } from "react";
import LandingPage from './../Heatmap/upsEmsLanding';
import { useSelector } from 'react-redux';
import { Paper, Grid, Typography, Card, ButtonGroup, Divider, TextField, } from '@material-ui/core';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import api from './../../api'
import { format } from "date-and-time";

function GlAhu(props) {
  const alerts = useSelector(state => state.alarm.alarmData)
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [eqpSSTypes, setEqpSSTypes] = useState(props.eqpSSTypes);
  const [imageParamsEqp, setImageParamsEqp] = useState(props.imageParamsEqp);

  // Helper function to find matching parameter
  const findMatchingParameter = (param, eqpAttributes, eqpName) => {
    const paramKeys = ['parameter1', 'parameter2', 'parameter3'];
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
    const eqpName = params.data.Equipment;
    const cellValue = params.value;
    const columnName = params.colDef.field;

    // Skip styling for the Equipment column itself
    if (columnName === 'Equipment') {
      return null;
    }

    // Trip Status - Red for "Tripped"/"active", no color for "Normal"/"inactive"
    if (columnName === 'Trip Status') {
      if (cellValue === 'Tripped' || cellValue === 'active') {
        return { 
          backgroundColor: '#b33c33ff', 
          color: 'white',
          fontWeight: 'bold'
        };
      }
      return null; // No color for Normal/inactive
    }

    // Chiller ON/OFF - Green for "ON"/"active", Grey for "OFF"/"inactive"
    if (columnName === 'Chiller ON/OFF' || columnName === 'Pump ON/OFF') {
      if (cellValue === 'ON' || cellValue === 'active') {
        return { 
          backgroundColor: '#46ac48ff', 
          color: 'white',
          fontWeight: 'bold'
        };
      } else if (cellValue === 'OFF' || cellValue === 'inactive') {
        return { 
          backgroundColor: '#c0bdbdff', 
          color: 'white',
          fontWeight: 'bold'
        };
      }
      return null;
    }

    return null;
  };

  // Helper function to process device data (DRY - Don't Repeat Yourself)
 // Helper function to process device data (DRY - Don't Repeat Yourself)
const processDeviceData = (response) => {
  let finalRes = {};
  eqpSSTypes.forEach(key => {
    if (response[key]) {
      Object.assign(finalRes, response[key]);
    }
  });

  // Sort equipment names alphabetically
  const sortedEqpKeys = Object.keys(finalRes).sort((a, b) => 
    finalRes[a].name.localeCompare(finalRes[b].name)
  );

  // Create columns: Equipment name + all parameters
  let col = [
    { field: 'Equipment', pinned: 'left', width: 200 },
    ...imageParamsEqp.map(param => ({ 
      field: param.title,
      cellStyle: getCellStyle,
      width: 200
    }))
  ];
  setColDefs(col);

  // Create rows: One row per equipment
  let row = sortedEqpKeys.map(key => {
    const eqpName = finalRes[key].name;
    const eqpAttributes = finalRes[key]?.Eqp_Attributes || {};
    const result = { Equipment: eqpName };

    // For each parameter, find and populate the value
    imageParamsEqp.forEach(param => {
      const selectedParam = findMatchingParameter(param, eqpAttributes, eqpName);
      
      if (!selectedParam) {
        result[param.title] = '-';
        return;
      }

      const presentValue = eqpAttributes[selectedParam]?.presentValue;

      // ON/OFF Parameters
      const onOffParams = [
        'CH_On_Off', 'CH_Out_Vlv_SS', 'CH_On_Off_SS', 'SAF_VFD_On_Off_Fbk',
        'CSU_Run_SS', 'Pri_Pmp_On_Off', 'Sec_Pmp_On_Off', 'Cnd_Pmp_On_Off',
        'Heat_Pmp_Chilled_Wtr_On_Off', 'Heat_Pmp_Hot_Wtr_On_Off', 'sts_on_off_00'
      ];

      // Trip Alarm Parameters
      const tripParams = [
        'SAF_VFD_Trip_SS_Alarm', 'CSU_Trip_SS_Alarm', 'Pri_Pmp_Trip_SS',
        'Sec_Pmp_Trip_SS', 'Cnd_Pmp_Trip_SS', 'CH_Trip_SS', 'alm_trip_00'
      ];

      // Auto/Manual Parameters
      const autoManualParams = [
        'CH_AM_SS', 'SAF_VFD_AM_Fbk', 'CSU_Fan_AM_SS', 'Pri_Pmp_AM_SS',
        'Sec_Pmp_AM_SS', 'Cnd_Pmp_AM_SS', 'sts_auto_manual_00'
      ];

      // Filter Parameters
      const filterParams = [
        'DPS_Filter', 'CSU_Pre_Filter', 'sts_filter_00'
      ];

      // Heater Parameters
      const heaterParams = [
        'Heater_Bank_1_Status', 'CSU_Heater_Bank_1_Status',
        'Heater_Bank_2_Status', 'CSU_Heater_Bank_2_Status',
        'Heater_Bank_3_Status', 'CSU_Heater_Bank_3_Status'
      ];

      // Run Status Parameters
      const runStatusParams = [
        'Pri_Pmp_Run_SS', 'Sec_Pmp_Run_SS', 'Cnd_Pmp_Run_SS'
      ];

      let rawVal;
      
      if (onOffParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '1' || presentValue === '1.0' || presentValue == 1)
          ? 'ON'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'OFF'
          : presentValue;
      } else if (tripParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '1' || presentValue === '1.0' || presentValue == 1)
          ? 'Tripped'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'Normal'
          : presentValue;
      } else if (autoManualParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '5' || presentValue === '5.0' || presentValue == 5)
          ? 'Auto'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'Manual'
          : presentValue;
      } else if (filterParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '1' || presentValue === '1.0' || presentValue == 1)
          ? 'Clean'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'Clogged'
          : presentValue;
      } else if (heaterParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '1' || presentValue === '1.0' || presentValue == 1)
          ? 'ON'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'OFF'
          : presentValue;
      } else if (runStatusParams.includes(selectedParam)) {
        rawVal = (presentValue === 'active' || presentValue === '1' || presentValue === '1.0' || presentValue == 1)
          ? 'ON'
          : (presentValue === 'inactive' || presentValue === '0' || presentValue === '0.0' || presentValue == 0)
          ? 'OFF'
          : presentValue;
      } else {
        // For all other parameters (numeric values, temperatures, etc.)
        rawVal = presentValue;
      }

      if (rawVal === undefined || rawVal === null || rawVal === "") {
        result[param.title] = '-';
      } else if (!isNaN(rawVal)) {
        result[param.title] = formatter.format(rawVal);
      } else {
        result[param.title] = String(rawVal);
      }
    });

    return result;
  });
  
  setRowData(row);
};

  useEffect(() => {
    // Initial data fetch
    api.floor.cpmGetDevData().then((response) => {
      console.log("Initial API Response:", response);
      processDeviceData(response);
    }).catch((err) => {
      console.error("Error fetching device data:", err);
    });

    // Set up timer for periodic updates
    const timer = setInterval(() => {
      console.log("----------------in timer");
      api.floor.cpmGetDevData().then((response) => {
        processDeviceData(response);
      }).catch((err) => {
        console.error("Error in timer fetching device data:", err);
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div className="ag-theme-alpine" style={{ height: 570, width: '100%', marginTop: '3vh' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          rowSelection={'single'}
          pagination={true}
          paginationPageSize={12}
          suppressMenuHide="true"
          suppressFilterButton="true"
        />
      </div>
    </>
  );
}

export default GlAhu;