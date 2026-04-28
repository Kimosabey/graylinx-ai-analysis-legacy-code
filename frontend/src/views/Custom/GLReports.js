//import {React, useEffect, useState} from "react";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../api";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import MenuItem from "@material-ui/core/MenuItem";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import moment from "moment";
import { useSelector } from "react-redux";
// import { saveAs } from 'file-saver';
import bng from "../../assets/Images/bng.png";
import {
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@material-ui/core";
// import { update } from 'plotly.js';
import { ButtonGroup, Button } from "semantic-ui-react";
import GetAppIcon from "@material-ui/icons/GetApp";
// import kauvery_logo from "../../assets/img/kauvery_logo.jpg";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import axios from "axios";
import paramDescriptions from "../../views/Custom/paramDescriptions.json";

const styles = (theme) => ({
  loader: {
    size: "40px",
    color: "#26c6da",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
      marginTop: "-2vh",
      fontWeight: "bold",
      borderRadius: "0.8vw",
      "&:focus": {
        backgroundColor: "transparent", // Remove background color on focus
        boxShadow: "none", // Remove shadow on focus
      },
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4",
      borderRadius: "8px",
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
    },
    menuPaper: {
      boxShadow: "none", // Remove shadow in the dropdown menu
    },
  },
});
const useStyles = makeStyles(styles);

function getColumns(myheading = null, isDeviceReports = false) {
  // Keep 'Time' in default heading, only remove 'measured_time'
  myheading =
    myheading === null
      ? {
          DeviceName: "DeviceName",
          date: "Date",
          Time: "Time",
          ParameterName: "ParameterName",
          // Key: "Key",
          Value: "Value",
          // Unit: "Unit",
        }
      : myheading;

  if (isDeviceReports) {
    // Add Time field back to Device Reports
    return [
      {
        field: "Date",
        width: "150px",
        sortable: true,
        lockPosition: "left",
        cellStyle: { "border-right-color": "#e2e2e2" },
      },
      {
        field: "DeviceName",
        width: "150px",
        sortable: true,
        lockPosition: "left",
        cellStyle: { "border-right-color": "#e2e2e2" },
      },
      {
        field: "Parameter",
        width: "150px",
        sortable: true,
        lockPosition: "left",
        cellStyle: { "border-right-color": "#e2e2e2" },
      },
      {
        field: "Time",
        width: "150px",
        sortable: true,
        filter: "agNumberColumnFilter",
        lockPosition: "left",
        cellStyle: { "border-right-color": "#e2e2e2" },
      },
      {
        field: "Description",
        width: "500px",
        sortable: true,
        lockPosition: "left",
        cellStyle: { "border-right-color": "#e2e2e2" },
      },
    ];
  }

  let mykeys = Object.keys(myheading);
  // Filter out only measured_time related keys, keep regular time
  mykeys = mykeys.filter(
    (key) => !["measured_time", "MeasuredTime", "MEASURED_TIME"].includes(key),
  );

  let columnDefs = [];
  for (let i = 0; i < mykeys.length; i++) {
    switch (mykeys[i]) {
      case "DeviceName":
        columnDefs.push({
          field: mykeys[i],
          filter: "agNumberColumnFilter",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
        break;
      case "Possible_causes":
        columnDefs.push({
          field: mykeys[i],
          width: "400px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
        break;
      case "Timestamp":
        columnDefs.push({
          field: mykeys[i],
          filter: "agDateColumnFilter",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
        break;
      case "Date":
        columnDefs.push({
          field: mykeys[i],
          filter: "agDateColumnFilter",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
        break;
      case "Time":
        columnDefs.push({
          field: mykeys[i],
          filter: "agDateColumnFilter",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
        break;
      case "created_at":
      case "Acknowledged":
      case "Ignore_alarm":
      case "Category":
      case "Criticality":
      case "triggered_time":
      case "Ignore":
      case "Modified_at":
      case "ActiveTime_in_sec":
        // Skip these fields - don't create columns for them
        break;
      default:
        columnDefs.push({
          field: mykeys[i],
          filter: true,
          sortable: true,
          flex: "1",
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        });
    }
  }

  return columnDefs;
}

function prepareReportData(rData, reportType) {
  if (!rData || rData.length === 0) {
    return { Headings: [], RowData: [] };
  }

  if (reportType === "RunHours") {
    rData = rData.map((item) => {
      return {
        "Equipment Name": item.device_name,
        "Run Hours": item.run_hour,
      };
    });
  } else {
    rData = rData.map((r_d) => {
      if (r_d.created_at) {
        let mes_time = r_d.created_at.split(" ");
        r_d.date = mes_time[0];
        r_d.time = mes_time[1]; // Keep creating time field
      }

      // Remove only measured_time related fields, keep regular time
      const {
        measured_time,
        MeasuredTime,
        MEASURED_TIME,
        created_at,
        ...cleanData
      } = r_d;
      return cleanData;
    });
  }

  return { Headings: getColumns(rData[0]), RowData: rData };
}
function prepareUserReportData(rData, reportType) {
  rData.map((r_d) => {
    let mes_time = r_d["triggered_time"].split(" ");
    r_d.date = mes_time[0];
    r_d.time = mes_time[1];
  });

  return { Headings: getColumns(rData[0]), RowData: rData };
}
function prepareUserLoginReportData(rData) {
  rData.map((r_d) => {
    console.log("dddddddddddddddddd", r_d);
    const time = new Date(0, 0, 0);
    time.setMinutes(r_d["ActiveTime_in_mins"]);
    console.log("time.getMinutes()", time.getMinutes());
    r_d.ActiveTime = time.getHours() + ":" + time.getMinutes();
  });
  return { Headings: getColumns(rData[0]), RowData: rData };
}

const staticData = [
  {
    DeviceName: "Device 1",
    date: "2023-08-07",
    time: "12:00:00",
    Category: "Category A",
    Key: "Key 1",
    Value: 123,
    Unit: "Units",
  },
  {
    DeviceName: "Device 2",
    date: "2023-08-07",
    time: "13:30:00",
    Category: "Category B",
    Key: "Key 2",
    Value: 456,
    Unit: "Units",
  },
  // ... add more static data objects ...
];
function GlEventsViewer() {
  let reportOptions = [
    // { "option": "ibmsevents", "title": "IBMS LOGS", "api": 'ibmsevents_table' },
    {
      option: "UserLoginReport",
      title: "User Login Report",
      api: "loginLogoutDetails",
    },
    { option: "Device Reports", title: "Device Report" },
    {
      option: "DeviceCritical",
      title: "Device Critical Alarms",
      api: "alarmDeviceCritical",
    },
    {
      option: "DeviceTypeCritical",
      title: "DeviceType Critical",
      api: "alarmDeviceTypeCritical",
    },
    {
      option: "mostActiveAlarmCritical",
      title: "Most Active Critical Alarms",
      api: "mostActiveAlarmCritical",
    },
    {
      option: "restorecriticalalarms",
      title: "Critical Alarms Restored",
      api: "criticalAlarmRestored",
    },
    {
      option: "alarmDevice",
      title: "Device NonCritical Alarms",
      api: "alarmDeviceNonCritical",
    },
    {
      option: "alarmDeviceType",
      title: "DeviceType Alarms",
      api: "alarmDeviceTypeNonCritical",
    },
    {
      option: "mostActiveAlarmNonCritical",
      title: "Most Active NonCritical Alarms",
      api: "mostActiveAlarmNonCritical",
    },
    {
      option: "restorenoncriticalalarms",
      title: "Non-Critical Alarms Restored",
      api: "nonCriticalAlarmRestored",
    },
    // {
    //   option: "TrendLogComparisionReport",
    //   title: "Trend Log Comparision Report",
    //   api: "TrendLogComparisionReport",
    // },
    // {
    //   option: "scheduleActivityReport",
    //   title: "AHU Schedule Activity Report",
    //   api: "scheduleActivityReport",
    // },
    // {
    //   option: "ActivitesperuserReport",
    //   title: "Activites Per User Report",
    //   api: "ActivitesperuserReport",
    // },
    // {
    //   option: "ActivitesperserverReport",
    //   title: "Activites Per Server Report",
    //   api: "ActivitesperserverReport",
    // },
    {
      option: "UserControlDetails",
      title: "User Contol Details",
      api: "userDetails",
    },
    {
      option: "AcknowledgedUser",
      title: "Alarms Acknowledged By User",
      api: "acknowledgedUser",
    },
    {
      option: "IgnoredUser",
      title: "Alarms Ignored By User",
      api: "ignoredUser",
    },
    { option: "RunHours", title: "Run Hours", api: "RunHours" },
  ];
  // const[reportOptions,setReportOptions]=useState(reports);
  // const [headings,setHeadings]=useState(getColumns());

  const classes = useStyles();
  const gridRef = useRef();
  // const [eventdata,setEventData]=React.useState([]);
  const [reportData, setReportData] = React.useState({
    Headings: getColumns(),
    RowData: [],
  });
  // const [selectedRows, setSelectedRows] = useState();
  const [isloaded, setIsLoaded] = React.useState(true);
  const [stitle, setStitle] = useState("Device Reports");
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [floor, setFloor] = useState([]);
  const [fid, setFId] = useState("");
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [age, setAge] = React.useState("");
  const [age1, setAge1] = React.useState("");
  const [age3, setAge3] = React.useState("");
  const data = useSelector((state) => state.inDashboard.locationData);
  const [bid, setBId] = useState(localStorage.getItem("buildingID"));
  const [fname, setFName] = useState([]);
  const [dname, setDName] = useState([]);
  const [bdata, setBdata] = useState([]);
  const [ddata, setDData] = useState([]);
  const [bname, setBName] = useState([]);
  const [extractedDevices, setExtractedDevices] = useState([]);
  const [deviceid, setDeviceid] = useState();
  const [tableData, setTableData] = useState([]);
  const [week1, setWeek1] = useState([]);
  const [month1, setMonth1] = useState([]);
  const [month3, setMonth3] = useState([]);
  const [month6, setMonth6] = useState([]);
  const [year1, setYear1] = useState([]);
  const [format, setFormat] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState("");
  const [deviceNames, setDeviceNames] = useState([]);
  const [deviceids, setDeviceids] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [selectedDeviceName, setSelectedDeviceName] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedBuildingName, setSelectedBuildingName] = useState("");
  const [floorOptions, setFloorOptions] = useState([""]);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [apiResponse, setApiResponse] = useState("");
  const [isEquipmentDisabled, setIsEquipmentDisabled] = useState(true);
  const [availableDeviceTypes, setAvailableDeviceTypes] = useState([]);
  const EqpArr = [
    { ss_type: "NONGL_SS_CPM", name: "CPM" },
    { ss_type: "NONGL_SS_CHILLER", name: "Water Cooled Chillers" },
    { ss_type: "NONGL_SS_COMMON_HEADER", name: "Common Header" },
    { ss_type: "NONGL_SS_PRIMARY_PUMP", name: "Primary Pumps" },
    { ss_type: "NONGL_SS_CONDENSER_PUMPS", name: "Condenser Pumps" },
    { ss_type: "NONGL_SS_HARMONIC_FILTER", name: "Harmonic Filter" },
    { ss_type: "NONGL_SS_AHU", name: "AHU" },
    { ss_type: "NONGL_SS_SECONDARY_SEQ_PANEL", name: "Secondary Pump Seq Pannels" },
    { ss_type: "NONGL_SS_COOLING_TOWER", name: "Cooling Towers" },
    { ss_type: "NONGL_SS_SECONDARY_PUMPS", name: "Secondary Pumps" },
    { ss_type: "NONGL_SS_BTU_METER", name: "BTU Meter" },
    { ss_type: "NONGL_SS_EXPANSION_TANK", name: "Expansion Tank" },
    // { ss_type: "NONGL_SS_ATCS", name: "ATCS" },
    { ss_type: "NONGL_SS_FLOW_METER", name: "Flow Meter" },
    { ss_type: "NONGL_SS_EMS", name: "Energy Meters" },
  ];
  const PLANTROOM_ID = "2ffc9cf4-f0c6-4299-9961-921a86542bc7";
  const getEquipmentDisplayName = (ssType) => {
    const nameMap = {
      NONGL_SS_BTU_METER: "BTU Meter",
      NONGL_SS_EMS: "Energy Meters",
      NONGL_SS_FLOW_METER: "Flow Meter",
      NONGL_SS_ATCS: "ATCS",
      NONGL_SS_EXPANSION_TANK: "Expansion Tank",
      NONGL_SS_CONDENSER_PUMPS: "Condenser Pumps",
      NONGL_SS_HARMONIC_FILTER: "Harmonic Filter",
      NONGL_SS_SECONDARY_SEQ_PANEL: "Secondary Pump Seq Pannels",
      NONGL_SS_COOLING_TOWER: "Cooling Towers",
      NONGL_SS_SECONDARY_PUMPS: "Secondary Pumps",
      NONGL_SS_PRIMARY_PUMP: "Primary Pumps",
      NONGL_SS_CHILLER: "Water Cooled Chillers",
      NONGL_SS_CPM: "CPM",
      NONGL_SS_WATER_COOLED_HEADER: "Water Cooled Header",
      FRESH_AIR_UNIT: "Fresh Air Unit",
      NONGL_SS_AHU: "AHU",
      SS_BRE_FAN: "BRE Fan",
      SS_HTE_FAN: "HTE Fan",
      NONGL_SS_COMMON_HEADER: "Common Header",
    };

    return nameMap[ssType] || ssType.replace(/_/g, " ");
  };
  const [floors, setFloors] = useState([]); // Store floors
  const [zones, setzones] = useState([]);
  const [filteredEquipmentTypes, setFilteredEquipmentTypes] = useState([]);
  const [filteredDeviceList, setFilteredDeviceList] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true); // Initially disabled

  const [selectedDeviceParams, setSelectedDeviceParams] = useState([]);
  const [deviceParameters, setDeviceParameters] = useState([]);
  // Helper to get a friendly label for a parameter key
  const getParamLabel = (param) => {
    if (!param) return "";
    if (paramDescriptions && paramDescriptions[param])
      return paramDescriptions[param];
    // Fallback: prettify the key
    return param.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Helper to determine unit for a parameter key
  const getParamUnit = (param) => {
    if (!param) return "";
    // If descriptions JSON provides unit as object { description, unit }
    const descEntry = paramDescriptions && paramDescriptions[param];
    if (descEntry && typeof descEntry === "object" && descEntry.unit) {
      return descEntry.unit;
    }
    console.log("Determining unit for param:", param, "with description entry:", descEntry);
    const p = param.toLowerCase();
    // Temperature
    if (p.includes("temp") || p.includes("temperature")) return "°C";
    // Flow/Volume
    if (p.includes("flow") || p.includes("volume")) return "m3/h";
    // Energy
    if (p.includes("energy") &&descEntry == 'BTU Meter Energy Consumption') return "TRH";
    if (p.includes("energy")) return "kWh";
    // Power
    if (p.includes("power") &&descEntry == 'BTU Meter Actual Power') return "TR";
    if (p.includes("power") || p.includes("kw") || p.includes("watt")) return "kW";
    // Current
    if (p.includes("current") || p.includes("amp") || p.includes("avg_current")) return "A";
    // Voltage
    if (p.includes("voltage") || p.includes("volt")) return "V";
    // Pressure
    if (p.includes("pressure") || p.includes("press") || p.includes("dpt") || p.includes("bar")) return "kPa";
    // Speed
    if (p.includes("speed") || p.includes("rpm")) return "RPM";
    // Percent/Load
    if (p.includes("percent") || p.includes("load") || p.endsWith("%")) return "%";
    // Frequency
    if (p.includes("frequency") || p.includes("hz")) return "Hz";
    // Power Factor
    if (p.includes("pf") || p.includes("power factor")) return "";
    // Humidity
    if (p.includes("humidity")) return "%";
    // Conductivity
    if (p.includes("conductivity")) return "μS/cm";
    // pH
    if (p === "ph" || p.includes("ph_")) return "pH";
    // Time/Duration
    if (p.includes("hour") || p.includes("hrs") || p.includes("run_time") || p.includes("duration")) return "Hrs";
    if (p.includes("minute") || p.includes("mins")) return "min";
    if (p.includes("second") || p.includes("sec")) return "s";
    // Resistance
    if (p.includes("ohm") || p.includes("resistance")) return "Ω";
    // Level
    if (p.includes("level")) return "m";
    // Air Quality
    if (p.includes("co2")) return "ppm";
    // Default
    return "";
  };
  const [devParamReports, setDevParamReports] = useState([]);

  const parameterMap = {
    // NONGL_SS_FLOW_METER: ["Flow_Meter_Volume_m3", "Flow_Meter_Actual_Flow"],
    // NONGL_SS_ATCS: ["ATCS_Run_SS", "ATCS_Operation_Duration"],
    // NONGL_SS_EXPANSION_TANK: [
    //   "Expansion_Tnk_Setpoint_P",
    //   "Expansion_Tnk_Actual_P",
    //   "Expansion_Tnk_Pmp_Run_SS",
    // ],
      NONGL_SS_BTU_METER: [
      "btu_meter_inlet_temp_00",
      "btu_meter_energy_consump_00",
      "btu_meter_actual_power_00",
      "btu_meter_outlet_temp_00",
      "btu_meter_actual_flow_00",
    ],
    NONGL_SS_CONDENSER_PUMPS: [
      "sts_on_off_00",
      "cmd_on_off_00",
      "sts_auto_manual_00",
      "alm_trip_00",
      "par_avg_current_00",
      "par_avg_power_00",
      "par_avg_voltage_00", 
      "par_energy_00",
      "par_run_hours_00",
      "par_speed_00",
      
    ],
      NONGL_SS_HARMONIC_FILTER: [
      "par_comp_current_00",
      "par_percent_thdi_00",
      "par_load_current_00",
      "par_percent_thdv_00",
      "par_percent_tdd_00"
    ],

    NONGL_SS_COMMON_HEADER: [
      "par_out_air_temp_00",
      "par_out_air_humidity_00",
      "par_cwh_sup_temp_01",
      "par_cwh_sup_temp_02",
      "par_cwh_ret_temp_01",
      "par_cwh_ret_temp_02",

"par_dpt_01",
"par_dpt_02",
"par_cdw_sup_temp_00",
"par_cdw_ret_temp_00",
"cmd_cwh_sup_temp_00",
"cmd_cdw_sup_temp_00",  
"par_actual_flow_00",
"par_actual_power_00",
"par_energy_consump_00",
"par_inlet_temp_00",
"par_outlet_temp_00"
    ],
    NONGL_SS_SECONDARY_SEQ_PANEL: [
      "cmd_on_off_00",
      
      "sts_on_off_00",
      
    ],
    NONGL_SS_COOLING_TOWER: [
     "cmd_on_off_00",
"sts_on_off_00",  
"cmd_fan_frequency_00",
"sts_fan_frequency_00",
"sts_auto_manual_00",
"alm_trip_00",
"sts_level_switch_high_00",
"sts_level_switch_low_00",
"cmd_vlv_on_off_00",
"sts_vlv_on_off_01",
"sts_vlv_on_off_02",
"par_fan_speed_00",
"par_avg_power_00",
"par_avg_voltage_00",
"par_avg_current_00",
"par_run_hours_00",
"par_energy_00"

    ],
      NONGL_SS_SECONDARY_PUMPS: [ 
      "par_avg_power_00",
      "par_avg_current_00",
      "par_run_hours_00",
      "par_speed_00",
      "par_avg_voltage_00",
      "par_energy_00",
      "sts_on_off_00",
      "alm_trip_00",
      
    ],

    NONGL_SS_PRIMARY_PUMP: [
      "cmd_on_off_00",
      "alm_trip_00",
      "sts_auto_manual_00",
      "par_avg_voltage_00",
      "par_avg_current_00",
      "par_avg_power_00",
      "par_run_hours_00",
      "par_speed_00",
      "par_energy_00",
      "sts_on_off_00",
    ],

   NONGL_SS_CHILLER: [
  "cmd_on_off_00",
  "sts_on_off_00",
  "sts_auto_manual_00",
  "alm_trip_00",
  "cmd_evap_vlv_on_off_00",
  "sts_evap_vlv_on_off_00",
  "cmd_cond_vlv_on_off_00",
  "sts_cond_vlv_on_off_00",
  "par_comp_run_hrs_00",
  "cmd_evap_leaving_temp_00",
  "sts_evap_leaving_temp_00",
  "par_evap_entering_temp_00",
  "sts_evap_flow_00",
  "par_suction_pressure_00",
  "par_cond_leaving_temp_00",
  "par_cond_entering_temp_00",
  "sts_cond_flow_00",
  "par_discharge_pressure_00",
  "par_discharge_temp_00",
  "par_comp_percent_load_00",
  "par_comp_oil_pressure_00",
  "par_avg_current_00",
  "par_vsd_frequency_00",
  "alm_fault_00"
],


    NONGL_SS_CPM: ["ikw", "tr_plant", "ikw_per_tr"],
    NONGL_SS_EMS: [
      
      "par_current_01",
      "par_pf_br_00",
      "par_pf_ry_00",
      "par_frequency_00",
      "par_avg_active_power_00",
      "par_avg_reactive_power_00",
      "par_voltage_01",
      "par_current_02",
      "par_avg_apparent_power_00",
      "par_pf_yb_00",
      "par_voltage_03",
      "par_voltage_02",
      "par_avg_pf_00",
      "par_current_03",
      "par_pf_02",
      "par_pf_01",
      "par_pf_03",
      "par_energy_00"
    ],
    NONGL_SS_AHU: [
      "par_pump_speed_00",
      "par_entering_water_temp_00",
      "par_alm_pump_00",
      "cmd_on_off_00",
      "par_pump_load_00",
      "par_fan_energy_00",
      "par_supply_air_temp_00",
      "par_fan_speed_00",
      "par_pump_avg_power_00",
      "par_pump_frequency_00",
      "par_water_flow_00",
      "par_pump_head_00",
      "par_leaving_water_temp_00",
      "alm_silter_00",
      "sts_auto_manual_00",
      "alm_trip_00",
      "cmd_return_air_temp_00",
      "par_pump_avg_current_00",
      "par_pump_energy_00",
      "par_avg_fan_power_00",
      "sts_return_air_temp_00",
    ],
  };

  const handleDeviceChange = (name, id) => {
    console.log("🔧 Device selected:", { name, id, selectedEquipment });
    setSelectedDeviceName(name);
    setSelectedDeviceId(id);
    setAge3("");
    setIsDisabled(true);
    setSelectedDeviceParams([]);

    // Detect type from device name when possible, otherwise fall back to the
    // selected equipment type (`selectedEquipment`) which holds the ssType
    // (e.g. 'NONGL_SS_COOLING_TOWER'). Device names like "01" don't carry
    // type info, so using `selectedEquipment` ensures the parameter list shows.
    let type = "";
    if (name && typeof name === "string") {
      const lname = name.toLowerCase();
      if (lname.includes("btu")) type = "NONGL_SS_BTU_METER";
      else if (lname.includes("Energy")) type = "NONGL_SS_EMS";
      // if (lname.includes("flow")) type = "NONGL_SS_FLOW_METER";
      // else if (lname.includes("atcs")) type = "NONGL_SS_ATCS";
      // else if (lname.includes("expansion")) type = "NONGL_SS_EXPANSION_TANK";
      // else if (lname.includes("btu")) type = "NONGL_SS_BTU_METER";
      // else if (lname.includes("condenser")) type = "NONGL_SS_CONDENSER_PUMPS";
      // else if (lname.includes("cooling")) type = "NONGL_SS_COOLING_TOWER";
      // else if (lname.includes("primary"))
      //   type = "NONGL_SS_PRIMARY_VARIABLE_PUMPS";
      // else if (lname.includes("chiller")) type = "NONGL_SS_CHILLER";
      // else if (lname.includes("cpm")) type = "NONGL_SS_CPM";
      // else if (lname.includes("water")) type = "NONGL_SS_WATER_COOLED_HEADER";
      // else if (lname.includes("Energy")) type = "NONGL_SS_EMS";
    }

    // fallback to the equipment type selected in the Equipment Type dropdown
    if (!type && selectedEquipment) {
      type = selectedEquipment;
    }

    const params = parameterMap[type] || [];
    console.log("parameterMap lookup", {
      name,
      selectedEquipment,
      type,
      params,
    });
    setDeviceParameters(params);
  };
  // Add this constant outside the component
const AUTO_MANUAL_MAP = {
  NONGL_SS_CHILLER:     { "2.0": "Auto", "0.0": "Manual" },
  NONGL_SS_PRIMARY_PUMP:{ "2.0": "Auto",   "1.0": "Manual" },
  NONGL_SS_CONDENSER_PUMPS: { "2.0": "Auto", "1.0": "Manual" },
  NONGL_SS_COOLING_TOWER:   { active: "Auto", inactive: "Manual" },
  // add more as needed
  _default:             { active: "Auto",   inactive: "Manual" },
};

  const handleDevParamReports = (apiResponse, type) => {
    let rows = [];

    if (!apiResponse || !Array.isArray(apiResponse.graphData)) {
      return { Headings: {}, RowData: [] };
    }

    apiResponse.graphData.forEach((deviceGroup) => {
      Object.keys(deviceGroup).forEach((paramName) => {
        const paramList = deviceGroup[paramName];
        if (Array.isArray(paramList)) {
          paramList.forEach((entry) => {
            console.log("entry", entry);
            const [date, time] = entry.measured_time.split(" ");
            let value = entry.param_value;
            let parsedValue = parseFloat(value);
            let displayValue;

            if (
              entry.parameter === "sts_fan_on_off_00" ||
              entry.parameter === "sts_fan_vfd_on_off_00" ||
              entry.parameter === "sts_on_off_00" ||
              entry.parameter === "cmd_on_off_00" ||
              entry.parameter == "par_comp_on_off_01" ||
              entry.parameter == "par_comp_on_off_02"
            ) {
              if (value.toLowerCase() === "inactive") {
                displayValue = "OFF";
              } else if (value.toLowerCase() === "active") {
                displayValue = "ON";
              } else {
                displayValue = value; // fallback if value is something else
              }
            } else if (
              entry.parameter === "alm_trip_00" ||
              entry.parameter === "alm_fan_trip_00" ||
              entry.parameter === "par_alm_pump_00" ||
              entry.parameter === "alm_silter_00"
            ) {
              if (value.toLowerCase() === "inactive") {
                displayValue = "Normal";
              } else if (value.toLowerCase() === "active") {
                displayValue = "Tripped";
              } else {
                displayValue = value; // fallback if value is something else
              }
            } else if (
              entry.parameter === "par_lvl_sw_high_00" ||
              entry.parameter === "par_lvl_sw_low_00"
            ) {
              if (value.toLowerCase() === "inactive") {
                displayValue = "Low";
              } else if (value.toLowerCase() === "active") {
                displayValue = "High";
              } else {
                displayValue = value; // fallback if value is something else
              }
            } else if (entry.parameter === "sts_auto_manual_00") {
  const mapping =
    AUTO_MANUAL_MAP[type] || AUTO_MANUAL_MAP["_default"];
  const v = value.toLowerCase();
  displayValue =
    v === "active"   ? mapping.active   :
    v === "inactive" ? mapping.inactive :
    value;

            } else if (
              entry.parameter === "par_evap_vlv_on_off_02" ||
              entry.parameter === "par_evap_vlv_on_off_01" ||
              entry.parameter === "cmd_inlet_vlv_on_off_00" ||
              entry.parameter === "sts_inlet_vlv_00" ||
              entry.parameter === "cmd_outlet_vlv_on_off_00" ||
              entry.parameter === "sts_outlet_vlv_00" ||
              entry.parameter === "cmd_evap_vlv_on_off_00" ||
              entry.parameter === "cmd_cond_vlv_on_off_00" ||
              entry.parameter === "sts_cond_vlv_on_off_00" ||
              entry.parameter === "sts_evap_vlv_on_off_00"||
              entry.parameter === "sts_vlv_on_off_01" ||
              entry.parameter === "sts_vlv_on_off_02"||
              entry.parameter === "cmd_vlv_on_off_00"
            ) {
              if (value.toLowerCase() === "inactive") {
                displayValue = "Close";
              } else if (value.toLowerCase() === "active") {
                displayValue = "Open";
              } else {
                displayValue = value; // fallback if value is something else
              }
            } else {
              displayValue = isNaN(parsedValue)
                ? value
                : Number(parsedValue.toFixed(2));
            }

            // append unit for numeric values when available
            const unit = getParamUnit(entry.parameter || paramName);
            const displayWithUnit =
              typeof displayValue === "number" && unit
                ? `${displayValue} ${unit}`
                : displayValue;

            rows.push({
              DeviceName: entry.devicename,
              Date: date,
              Time: time,
              ParamName: getParamLabel(paramName),
              ParamKey: paramName,
              Value: displayWithUnit,
            });
          });
        }
      });
    });

    return {
      Headings: [
        {
          field: "DeviceName",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        },
        {
          field: "Date",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        },
        {
          field: "Time",
          width: "150px",
          sortable: true,
          filter: "agNumberColumnFilter",
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        },
        {
          field: "ParamName",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        },
        {
          field: "Value",
          width: "150px",
          sortable: true,
          lockPosition: "left",
          cellStyle: { "border-right-color": "#e2e2e2" },
        },
      ],
      RowData: rows,
    };
    // return {
    //   Headings: {
    //     DeviceName: "DeviceName",
    //     Date: "Date",
    //     Time: "Time",
    //     ParamName: "ParamName",
    //     Value: "Value",
    //   },
    //   RowData: rows
    // };
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Filter and sort buildings
        let b_data = data
          .filter((_each) => _each.zone_type === "GL_LOCATION_TYPE_BUILDING")
          .sort((a, b) => (a.name > b.name ? 1 : -1));

        if (b_data.length > 0) {
          setSelectedBuilding(b_data[0].uuid); // ✅ Set first building as default
        }
        setBdata(b_data);

        // ✅ Filter and sort floors
        let f_data = data
          .filter(
            (_each) => _each.zone_type === "GL_LOCATION_TYPE_FLOOR",
            // ||_each.zone_type === "GL_LOCATION_TYPE_BUILDING"
          )
          .sort((a, b) => (a.name > b.name ? 1 : -1));

        setFloors(f_data); // ✅ Store floors in state

        let z_data = data
          .filter((_each) => _each.zone_type === "GL_LOCATION_TYPE_ZONE")
          .sort((a, b) => (a.name > b.name ? 1 : -1));
        setzones(z_data);
        const res = await api.floor.cpmGetDevData();
        setApiResponse(res);
        if (res) {
          let arr = [];
          let types = Object.keys(res);

          for (let i = 0; i < types.length; i++) {
            EqpArr.map((eqp) => {
              if (eqp.ss_type === types[i]) {
                arr.push(eqp);
              }
            });
          }

          setEquipmentTypes((prev) => (prev.length === 0 ? arr : prev));

          // If a Plantroom floor exists, default-select it and pre-populate devices
          const plantFloor = f_data.find(
            (fl) =>
              fl.uuid === PLANTROOM_ID ||
              /plantroom|plant/i.test(fl.name || "") ||
              /plantroom|plant/i.test(fl.zone_tag || ""),
          );

          if (plantFloor) {
            setSelectedFloor(plantFloor.uuid);
            setIsEquipmentDisabled(false);

            // Extract devices for the plant floor from API response
            const devices = [];
            Object.keys(res).forEach((deviceType) => {
              Object.values(res[deviceType]).forEach((device) => {
                if (device.Equipment_Group == plantFloor.uuid) {
                  devices.push({
                    id: device.id || device.uuid || "",
                    name: device.name || "",
                    ssType: device.ssType || deviceType,
                  });
                }
              });
            });

            // store extracted devices and populate device dropdown
            setExtractedDevices(devices);
            const formattedDevices = devices
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((device) => ({ id: device.id, name: device.name }));
            setFilteredDeviceList(formattedDevices);
          }
          // ✅ If equipment is selected, fetch devices
          if (selectedEquipment && res[selectedEquipment]) {
            const devices = Object.values(res[selectedEquipment]); // ✅ Convert object to array

            // ✅ Filter devices belonging to the selected floor
            const filteredDevices = devices
              .filter((device) => device.Equipment_Group === selectedFloor)
              .sort((a, b) => a.name.localeCompare(b.name));

            // ✅ Store filtered devices as an array of objects [{ id, name }]
            const formattedDevices = filteredDevices.map((device) => ({
              id: device.id,
              name: device.name,
            }));

            setFilteredDeviceList(formattedDevices); // ✅ Update device dropdown
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData(); // ✅ Call function inside useEffect
  }, [data]); // ✅ Dependencies

  const handleReportSelection = (myapi, option) => {
    setStitle(option);
    switch (option) {
      case "DeviceCritical":
        api["reports"]["critical_table"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;

      case "DeviceTypeCritical":
        api["reports"]["Device_critical"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "mostActiveAlarmCritical":
        api["reports"]["active_alarm"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "restorecriticalalarms":
        api["reports"]["restore_critical_alarm"]().then((res) => {
          // console.log("------------------------>critical alarm",res)
          setReportData(prepareReportData(res));
        });
        break;
      case "RunHours":
        api["reports"]["runhours_report"]().then((res) => {
          // console.log("------------------------>critical alarm",res)
          const preparedData = prepareReportData(res, "RunHours");
          setReportData(preparedData);
        });
        break;
      case "alarmDevice":
        // api['reports']['noncritical_table']().then(res => {
        //   console.log("res------------------------>>>>>>>>>>>>>>",res)
        //   const combinedData = res.map(alarm => {
        //     const possibleCauses = JSON.parse(alarm.possible_causes);
        //     console.log("possible_causes",possibleCauses)
        //     const noncriticalItems = possibleCauses.map(item => {
        //       const formattedItems = Object.entries(item).map(([key, value]) => `- ${key}: ${value}`);
        //       // console.log(formattedItems.join('\n'));
        //       return formattedItems.join('\n');
        //     });

        //     return {
        //       DeviceName: alarm.DeviceName,
        //       Parameter: alarm.Description,
        //       created_at: alarm.created_at,
        //       date: alarm.date,
        //       possible_causes: noncriticalItems.join('\n') // Join items with double newlines
        //     };
        //   });
        api["reports"]["noncritical_table"]().then((res) => {
          const combinedData = res.map((alarm) => {
            let possibleCauses = [];

            // Check if possible_causes is defined and parse it
            if (alarm.possible_causes) {
              try {
                possibleCauses = JSON.parse(alarm.possible_causes);
              } catch (error) {
                console.error(
                  "Invalid JSON format in possible_causes:",
                  alarm.possible_causes,
                );
                possibleCauses = []; // Default to an empty array if parsing fails
              }
            } else {
              // console.warn("possible_causes is undefined for alarm:", alarm);
            }

            // Map over possibleCauses if it's an array
            const noncriticalItems = Array.isArray(possibleCauses)
              ? possibleCauses.map((item) => {
                  // Ensure item is an object before processing
                  if (typeof item === "object" && item !== null) {
                    const formattedItems = Object.entries(item).map(
                      ([key, value]) => `- ${key}: ${value}`,
                    );
                    return formattedItems.join("\n");
                  }
                  return ""; // Return an empty string if item is not an object
                })
              : [];

            return {
              DeviceName: alarm.DeviceName,
              Parameter: alarm.Description,
              created_at: alarm.created_at,
              date: alarm.date,
              possible_causes:
                noncriticalItems.length > 0
                  ? noncriticalItems.join("\n\n")
                  : "null", // Join items with double newlines
            };
          });

          const updatedReportData = prepareReportData(combinedData);
          // console.log("updated=============", updatedReportData);
          setReportData(updatedReportData);
        });
        break;

      case "alarmDeviceType":
        api["reports"]["device_nonCritical"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "mostActiveAlarmNonCritical":
        api["reports"]["non_criticalalarm"]().then((res) => {
          const combinedData = res.map((alarm) => {
            const possibleCauses = JSON.parse(alarm.possible_causes);
            const noncriticalItems = possibleCauses.map((item) => {
              const formattedItems = Object.entries(item).map(
                ([key, value]) => `- ${key}: ${value}`,
              );
              // console.log(formattedItems.join('\n'));
              return formattedItems.join("\n");
            });

            return {
              DeviceName: alarm.DeviceName,
              Parameter: alarm.Description,
              created_at: alarm.created_at,
              date: alarm.date,
              Possible_Causes: noncriticalItems.join("\n"), // Join items with double newlines
            };
          });

          const updatedReportData = prepareReportData(combinedData);
          // console.log("updated=============", updatedReportData);
          setReportData(updatedReportData);
        });
        break;

      case "restorenoncriticalalarms":
        api["reports"]["restore_noncritical_alarm"]().then((res) => {
          setReportData(prepareReportData(res));
        });

        break;
      case "RunHours":
        api["reports"]["runhours_report"]().then((res) => {
          const preparedData = prepareReportData(res);
          setReportData(preparedData);
        });
        break;
      case "ibmsevents":
        api["reports"]["ibmsevents_table"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "UserControlDetails":
        api["reports"]["user_control_deatils"]().then((res) => {
          setReportData(prepareUserReportData(res));
        });
        break;
      case "AcknowledgedUser":
        api["reports"]["acknowledged_by_user"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "IgnoredUser":
        api["reports"]["ignored_by_user"]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
      case "UserLoginReport":
        api["reports"]["login_login_details"]().then((res) => {
          setReportData(prepareUserLoginReportData(res));
        });
        break;
      case "Device Reports":
        if (option === "Device Reports") {
          const headings = getColumns(null, true);
          // headings.splice(2, 1, "Date", "Time"); // Replace "Measured Time" with "Date" and "Time"
          let rowData;
          setReportData({ Headings: headings, RowData: rowData });
        } else {
          // For other report options, use default headings and columns
          setReportData(prepareReportData(tableData)); // Pass tableData here
        }

        break;
      default:
        // api['reports']['ibmsevents_table']().then(res => {
        //   setReportData(prepareReportData(res))
        // })
        setReportData([]);
        break;
      case "IgnoredUser":
        api["reports"][""]().then((res) => {
          setReportData(prepareReportData(res));
        });
        break;
    }
  };

  const onFirstDataRendered1 = useCallback((params) => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const onBtExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);
  const sizeToFit = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const autoSizeAll = useCallback((skipHeader) => {
    const allColumnIds = [];
    gridRef.current.columnApi.getAllColumns().forEach((column) => {
      allColumnIds.push(column.getColId());
    });
    gridRef.current.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  }, []);

  // Auto-size columns to fit content after report data updates
  useEffect(() => {
    if (!gridRef.current) return;
    // allow grid to render columns first
    const t = setTimeout(() => {
      try {
        const cols = gridRef.current.columnApi.getAllColumns();
        if (cols && cols.length > 0) {
          const ids = cols.map((c) => c.getColId());
          gridRef.current.columnApi.autoSizeColumns(ids, false);
        }
      } catch (e) {
        // ignore errors when columnApi not ready yet
      }
    }, 120);
    return () => clearTimeout(t);
  }, [reportData]);

  const onSelectionChanged = useCallback((event) => {
    // setSelectedRows(event.api.getSelectedRows());
    // window.alert('selection changed, ' + rowCount + ' rows selected');
  }, []);
  const downloadAsPdf = () => {
    const doc = new jsPDF();

    const hasDateField = reportData.Headings.some(
      (column) => column.field === "date",
    );
    const hasTimeField = reportData.Headings.some(
      (column) => column.field === "time",
    );
    const activeTimeField = reportData.Headings.find(
      (column) => column.field === "activeTime",
    );

    const tableData = reportData.RowData.map((row) => {
      const newRow = [];

      // Check if it's the RunHours report
      const isRunHours = reportData.Headings.some(
        (column) => column.field === "Run Hour",
      );

      if (isRunHours) {
        // Push only the relevant fields for RunHours
        newRow.push(row["device_name"]); // Assuming 'device_name' is the Equipment Name
        newRow.push(row["run_hour"]); // Assuming 'run_hour' is the Run Hours
      } else {
        // Non-RunHours report handling
        const hasDateField = reportData.Headings.some(
          (column) => column.field === "date",
        );
        const hasTimeField = reportData.Headings.some(
          (column) => column.field === "time",
        );
        const activeTimeField = reportData.Headings.some(
          (column) => column.field === "activeTime",
        );

        if (!activeTimeField && hasDateField) {
          newRow.push(row.date !== undefined ? row.date : "");
        }

        if (!activeTimeField && hasTimeField) {
          newRow.push(row.time !== undefined ? row.time : "");
        }

        reportData.Headings.forEach((column) => {
          if (
            column.field !== "date" &&
            column.field !== "time" &&
            column.field !== "activeTime" &&
            row.hasOwnProperty(column.field)
          ) {
            newRow.push(row[column.field]);
          }
        });
      }

      return newRow;
    });

    const presentColumns = reportData.Headings.filter((column) => {
      return (
        column.field !== "date" &&
        column.field !== "time" &&
        column.field !== "activeTime" &&
        reportData.RowData[0]?.hasOwnProperty(column.field)
      );
    });

    const rearrangedPdfHeaders = [
      ...(activeTimeField ? [] : hasDateField ? ["Date"] : []), // Place the "Date" header first if "activeTime" is absent and "date" is present
      ...(activeTimeField ? [] : hasTimeField ? ["Time"] : []), // Place the "Time" header second if "activeTime" is absent and "time" is present
      ...presentColumns.map((column) => column.field),
    ];

    // ... (continue with your existing code)

    // console.log("tabledata",tableData)

    const headers = reportData.Headings.map((column) => column.field);

    // const startX = 5;
    const imgData = require("../../assets/Images/logo.png");
    const imgData1 = imgData;

    const logoWidth = 30; // Common width for both logos
    const logoHeight = 30; // Common height for both logos

    const startX1 = 5; // Position for first logo
    const startY1 = -7;

    const startX = 152; // Position for second logo
    const startY = -7;

    // doc.addImage(imgData1, "PNG", startX1, startY1, logoWidth, logoHeight);
    // doc.addImage(imgData, "PNG", startX, startY, logoWidth, logoHeight);

    const currentDate = new Date();

    // Get current date in "dd/mm/yyyy" format
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const year = currentDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;

    // Get current time in "hh:mm AM/PM" format
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

    const currentDateTime = `${formattedDate} ,${formattedTime}`;

    const timestampX = doc.internal.pageSize.width - 15; // X position at the top right
    const timestampY = 22; // Y position at the top
    const timestampFontSize = 10; // Adjust the font size as needed

    doc.setFontSize(timestampFontSize);
    doc.text(currentDateTime, timestampX, timestampY, { align: "right" });

    doc.autoTable({
      head: [rearrangedPdfHeaders],
      body: tableData,
      startY: 25, // Adjust this as needed
      theme: "striped", // Optional, choose a theme for the table
      styles: {
        halign: "left", // Center-align column headers
        cellPadding: 2, // Adjust cell padding as needed
        // Define border styles
        valign: "middle", // Vertical alignment
        lineWidth: 0.1, // Width of the table borders
        // lineColor: [0, 0, 0], // Color of the table borders (black in this case)
        // fillStyle: 'F', // Fill the table cells with color
        // textColor: [0, 0, 0], // Text color
      },
      // columnStyles: columnWidths, // Apply custom column widths
      margin: { top: 5 }, // Adjust the margin as needed
    });
    // const customerName = "TEPL"; // Replace with actual customer name
    const downloadedBy = `Downloaded by: ${username}`; // Replace with actual name

    // Calculate the width of the customer name and "downloaded by" text
    // const customerNameWidth = doc.getStringUnitWidth(customerName) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const downloadedByWidth =
      (doc.getStringUnitWidth(downloadedBy) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;

    // Calculate total width of the text
    const totalTextWidth = Math.max(downloadedByWidth);

    // Center alignment calculations
    const centerX = doc.internal.pageSize.width / 2;

    // Positioning for customer name and "Downloaded by" text on the first page
    const firstPageTextX = centerX - totalTextWidth / 2; // Center the text horizontally
    const firstPageTextY = 15; // Fixed position at the top
    const downloadedByY = firstPageTextY + 6;

    // Set font size for the text
    const textFontSize = 12; // Adjust the font size as needed
    const Font = "Arial";
    doc.setFontSize(textFontSize);
    doc.setFont(Font);

    // Render the text on the first page only
    const totalPages = doc.internal.getNumberOfPages();
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      doc.setPage(pageNumber);
      if (pageNumber === 1) {
        // doc.text(`Customer Name: ${customerName}`, firstPageTextX, firstPageTextY);
        doc.text(downloadedBy, firstPageTextX, downloadedByY); // Adjust vertical position
      }
    }
    const totalPages1 = doc.internal.getNumberOfPages();

    // Iterate through each page and add pagination
    for (let pageNumber = 1; pageNumber <= totalPages1; pageNumber++) {
      doc.setPage(pageNumber);

      // Calculate the x and y positions for the pagination
      const paginationX = doc.internal.pageSize.width - 15; // X position at the top right
      const paginationY = doc.internal.pageSize.height - 10; // Y position at the bottom

      // Add the page number to the current page
      doc.setFontSize(10);
      doc.text(
        `Page ${pageNumber} of ${totalPages1}`,
        paginationX,
        paginationY,
        { align: "right" },
      );
    }

    const filename = `${stitle}.pdf`;
    doc.save(filename);
  };

  const getFilteredData = () => {
    const rows = reportData?.RowData || [];
    // console.log("rowwwwwwwwwwwwww",reportData)
    if (age3 === "Device Reports") {
      return rows.filter((row) => row.deviceReport === true);
    }

    return rows;
  };

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  const handleChange1 = (event) => {
    setAge1(event.target.value);
  };

  const handleDropdownChange = (event) => {
    const selectedValue = event.target.value;
    setAge3(selectedValue);
    setReportData({});
    if (!selectedDeviceId) {
      console.error("No device selected!");
      return;
    }

    setIsDisabled(false);

    const intervalMapping = {
      "1 Day": "1 DAY",
      "1 week": "1 WEEK",
      "1 month": "1 MONTH",
      "3 months": "3 MONTH",
      "6 months": "6 MONTH",
      "1 year": "1 YEAR",
    };

    const interval = intervalMapping[selectedValue];

    if (!interval) {
      console.warn("Invalid selection");
      return;
    }

    if (selectedDeviceParams.length > 0) {
      // Device Parameters Report API
      axios
        .post(
          // `https://localhost:9443/v1/gl_analytics/${selectedDeviceId}/deviceParametersReports`,
          //to run locally use below url
          // `https://localhost:8143/v1/gl_analytics/${selectedDeviceId}/deviceParametersReports`,
          `/v1/gl_analytics/${selectedDeviceId}/deviceParametersReports`,
          // while giving build no localhost should not be given so use above url
          {
            interval: interval,
            parameters: selectedDeviceParams,
          },
        )
        .then((res) => {
          console.log("postresponse", res.data);
          setReportData(handleDevParamReports(res.data, selectedEquipment));
          setDevParamReports(res.graphData[0]);
          const graphData = res.data.graphData;
          setReportData(res); // or any transform function
        })
        .catch((err) => {
          console.error(
            "Error fetching device parameter reports:",
            err,
            selectedDeviceId,
          );
        });
    } else {
      // fallback to old alarm reports
      switch (selectedValue) {
        case "1 Day":
          api.alarmreports.alarmsfor1day(selectedDeviceId).then((res) => {
            setTableData(res);
            setReportData(prepareReportData(res));
          });
          break;
        case "1 week":
          api.alarmreports.alarmsfor1week(selectedDeviceId).then((res) => {
            setWeek1(res);
            setReportData(prepareReportData(res));
          });
          break;
        case "1 month":
          api.alarmreports.alarmsfor1month(selectedDeviceId).then((res) => {
            setMonth1(res);
            setReportData(prepareReportData(res));
          });
          break;
        case "3 months":
          api.alarmreports.alarmsfor3months(selectedDeviceId).then((res) => {
            setMonth3(res);
            setReportData(prepareReportData(res));
          });
          break;
        case "6 months":
          api.alarmreports.alarmsfor6months(selectedDeviceId).then((res) => {
            setMonth6(res);
            setReportData(prepareReportData(res));
          });
          break;
        case "1 year":
          api.alarmreports.alarmsfor1year(selectedDeviceId).then((res) => {
            setYear1(res);
            setReportData(prepareReportData(res));
          });
          break;
        default:
          console.warn("Invalid selection");
      }
    }
  };

  // const handleDropdownChange = (event) => {
  //   const selectedValue = event.target.value;
  //   setAge3(selectedValue);

  //   if (!selectedDeviceId) {
  //     console.error("No device selected!");
  //     return;
  //   }
  //   setIsDisabled(false);
  //   // console.log(`Fetching data for ${selectedValue} with Device ID:`, selectedDeviceId);

  //   switch (selectedValue) {
  //     case "1 Day":
  //       api.alarmreports.alarmsfor1day(selectedDeviceId).then((res) => {
  //         setTableData(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     case "1 week":
  //       api.alarmreports.alarmsfor1week(selectedDeviceId).then((res) => {
  //         setWeek1(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     case "1 month":
  //       api.alarmreports.alarmsfor1month(selectedDeviceId).then((res) => {
  //         setMonth1(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     case "3 months":
  //       api.alarmreports.alarmsfor3months(selectedDeviceId).then((res) => {
  //         setMonth3(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     case "6 months":
  //       api.alarmreports.alarmsfor6months(selectedDeviceId).then((res) => {
  //         setMonth6(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     case "1 year":
  //       api.alarmreports.alarmsfor1year(selectedDeviceId).then((res) => {
  //         setYear1(res);
  //         setReportData(prepareReportData(res));
  //       });
  //       break;
  //     default:
  //       console.warn("Invalid selection");
  //   }
  // };

  const handleEquipmentChange = (event) => {
    let selectedEquipmentType = event.target.value;
    console.log("Equipment selected:", selectedEquipmentType);

    setIsDisabled(true);
    setSelectedEquipment(selectedEquipmentType);

    // ✅ ADD THESE LINES - Reset device-related states
    setSelectedDeviceName(""); // Clear selected device
    setSelectedDeviceId(""); // Clear selected device ID
    setDeviceParameters([]); // Clear parameters
    setSelectedDeviceParams([]); // Clear selected parameters
    setAge3(""); // Clear time selection
    setReportData({ Headings: getColumns(null, true), RowData: [] }); // Clear report data

    // ✅ Filter devices from extractedDevices by ssType
    const matchingDevices = extractedDevices.filter(
      (device) => device.ssType === selectedEquipmentType,
    );

    // ✅ Sort and format devices
    const formattedDevices = matchingDevices
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((device) => ({
        id: device.id,
        name: device.name,
      }));

    setFilteredDeviceList(formattedDevices);
  };

  // const handleDeviceChange = (name, id) => {
  //   setSelectedDeviceName(name);
  //   setSelectedDeviceId(id);
  //   setAge3("");
  //   setIsDisabled(true);
  // };

  const handlefloorchange = (name, id) => {
    setDName(name);
    setDeviceid(id);
    setFId(id);
    setFdata(name);
    let z_data = [],
      d_data = [];
    data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
        _each.zone_parent === id
      ) {
        z_data.push(_each);
        data.filter((eachObj) => {
          if (eachObj.zone_parent === _each.uuid) {
            if (eachObj.zone_type == "NONGL_SS_AIR_COOLED_CHILLER") {
              d_data.push(eachObj);
            }
          }
        });
      }
      d_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      setDData(d_data);
    });
  };

  const handleformatChange = (selectedformat) => {
    setFormat(selectedformat);

    if (selectedformat === "download_csv") {
      onBtExport(); // Function to handle CSV download
    } else if (selectedformat === "download_pdf") {
      const doc = new jsPDF();

      // Check if it's the RunHours report
      const isRunHours = reportData.Headings.some(
        (column) =>
          column.field === "Run Hours" || column.field === "Equipment Name",
      );

      let tableData;

      if (isRunHours) {
        // Prepare table data for RunHours report
        tableData = reportData.RowData.map((row) => {
          return [row["Equipment Name"], row["Run Hours"]]; // Only include Equipment Name and Run Hours
        });
        console.log("RunHours Table Data:", tableData);
      } else {
        // Prepare table data for other reports
        tableData = reportData.RowData.map((row) => {
          return reportData.Headings.map((column) => row[column.field]); // Include all fields for other reports
        });
      }

      // Define headers based on the report type
      const pdfHeaders = isRunHours
        ? ["Equipment Name", "Run Hours"]
        : reportData.Headings.map((column) => column.field);

      // Add logos to the PDF
      const imgData = require("../../assets/Images/logo.png"); // Local logo
      const imgData1 = imgData; // Assuming kauvery_logo is imported

      const logoWidth = 50;
      const logoHeight = 30;

      // doc.addImage(imgData1, "PNG", 5, -7, logoWidth, logoHeight); // First logo
      // doc.addImage(imgData, "PNG", 152, -7, logoWidth, logoHeight); // Second logo

      // Add the table to the PDF
      doc.autoTable({
        head: [pdfHeaders],
        body: tableData,
        startY: 25,
        theme: "striped",
        styles: {
          halign: "left",
          cellPadding: 2,
          valign: "middle",
          lineWidth: 0.1,
        },
        margin: { top: 10 },
      });

      // Current Date and Time
      const currentDate = new Date();
      const day = currentDate.getDate().toString().padStart(2, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedTime = `${hours % 12 || 12}:${minutes} ${ampm}`;

      const currentDateTime = `${formattedDate}, ${formattedTime}`;

      // Add Date-Time at the top right
      doc.setFontSize(10);
      doc.text(currentDateTime, doc.internal.pageSize.width - 15, 22, {
        align: "right",
      });

      // Add Downloaded By
      const downloadedBy = `Downloaded by: ${username}`; // username must be available
      const downloadedByWidth =
        (doc.getStringUnitWidth(downloadedBy) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const centerX = doc.internal.pageSize.width / 2;

      doc.setFontSize(12);
      doc.setFont("Arial", "normal");

      const firstPageTextX = centerX - downloadedByWidth / 2;
      const firstPageTextY = 21;

      const totalPages = doc.internal.getNumberOfPages();

      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        doc.setPage(pageNumber);
        if (pageNumber === 1) {
          doc.text(downloadedBy, firstPageTextX, firstPageTextY);
        }
      }

      // Add page numbers
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        doc.setPage(pageNumber);
        if (pageNumber === 1) {
          // doc.text(`Customer Name: ${customerName}`, firstPageTextX, firstPageTextY);
          doc.text(downloadedBy, firstPageTextX, firstPageTextY); // Adjust vertical position
        }
      }

      const totalPages1 = doc.internal.getNumberOfPages();

      // Iterate through each page and add pagination
      for (let pageNumber = 1; pageNumber <= totalPages1; pageNumber++) {
        doc.setPage(pageNumber);

        // Calculate the x and y positions for the pagination
        const paginationX = doc.internal.pageSize.width - 15; // X position at the top right
        const paginationY = doc.internal.pageSize.height - 10; // Y position at the bottom

        // Add the page number to the current page
        doc.setFontSize(10);
        doc.text(
          `Page ${pageNumber} of ${totalPages1}`,
          paginationX,
          paginationY,
          { align: "right" },
        );
      }

      // Save the PDF
      doc.save("report.pdf");
    }
  };

  const handleFloorChange = (event) => {
    const floorId = event.target.value;

    setSelectedFloor(floorId);
    setIsEquipmentDisabled(false); // Enable Equipment dropdown
    setIsDisabled(true);

    // ✅ ADD THESE LINES - Reset dependent states
    setSelectedEquipment(""); // Clear selected equipment
    setSelectedDeviceName(""); // Clear selected device name
    setSelectedDeviceId(""); // Clear selected device ID
    setFilteredDeviceList([]); // Clear device list
    setDeviceParameters([]); // Clear device parameters
    setSelectedDeviceParams([]); // Clear selected parameters
    setAge3(""); // Clear time selection
    setReportData({ Headings: getColumns(null, true), RowData: [] }); // Clear report data

    const devices = [];
    const ssTypeSet = new Set();

    // ✅ Only match for the selected floor
    const matchingFloor = floors.find((floor) => floor.uuid === floorId);

    if (!matchingFloor) {
      console.warn("No matching floor found!");
      setExtractedDevices([]); // Clear extracted devices if no floor found
      return;
    }

    Object.keys(apiResponse).forEach((deviceType) => {
      Object.values(apiResponse[deviceType]).forEach((device) => {
        if (device.Equipment_Group == matchingFloor.uuid) {
          devices.push({
            id: device.id || "No ID",
            name: device.name || "No Name",
            ssType: device.ssType || "No ssType",
          });

          if (device.ssType) {
            ssTypeSet.add(device.ssType);
          }
        }
      });
    });

    console.log("Extracted devices for floor:", devices);
    setExtractedDevices(devices);
  };

  const handleBuildingChange = (event) => {
    const selectedId = event.target.value;
    const selectedName =
      bdata.find((item) => item.uuid === item.selectedId)?.name || "";

    setSelectedBuilding(selectedId);
    setSelectedBuildingName(selectedName);
    setIsDisabled(true);
  };

  return (
    <div>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={5} lg={5} xl={5} xxl={5}>
            <FormControl
              variant="filled"
              className={classes.formControl}
              style={{
                width: "max-content",
                minWidth: "100%",
                backgroundColor: "#eeeef5",
                marginLeft: "0vh",
              }}
            >
              <Select
                labelId="filled-hidden-label-small"
                id="demo-simple-select-outlined"
                label="Floor"
                value={stitle || ""}
                style={{ fontWeight: "bold", borderRadius: "0.8vw" }}
                // onChange={handlefloorchange}
                className={classes.select}
                MenuProps={{ classes: { paper: classes.menuPaper } }}
                disableUnderline
              >
                {reportOptions.map((_item) =>
                  _item.title !== "User Login Report" ||
                  _item.title !== "Trend Log Comparision Report" ||
                  _item.title !== "Schedule Activity Report" ||
                  _item.title !== "Activites Per User Report" ||
                  _item.title !== "Activites Per Server Report" ? (
                    <MenuItem
                      key={_item.option}
                      value={_item.option}
                      onClick={() =>
                        handleReportSelection(_item.api, _item.option)
                      }
                    >
                      {_item.title}
                    </MenuItem>
                  ) : (
                    <MenuItem
                      key={_item.option}
                      value={_item.option}
                      style={{ backgroundColor: "Gray" }}
                    >
                      {_item.title}
                    </MenuItem>
                  ),
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}></Grid>
          {/* <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}></Grid> */}
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start", // Align left
                alignItems: "center",
                flexWrap: "nowrap", // Prevent buttons from wrapping to next line
                gap: "8px",
                marginLeft: "-18vh", // Add space between buttons
              }}
            >
              <Button
                color="primary"
                variant={format === "download_csv" ? "contained" : "outlined"}
                onClick={() => handleformatChange("download_csv")}
                style={{
                  padding: "13px 20px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  width: "160px",
                }}
                disabled={stitle === "Device Reports" && isDisabled}
              >
                Export to CSV
              </Button>

              <Button
                color="primary"
                variant={format === "download_pdf" ? "contained" : "outlined"}
                onClick={() => handleformatChange("download_pdf")}
                style={{
                  padding: "13px 20px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  width: "160px",
                }}
                disabled={stitle === "Device Reports" && isDisabled}
              >
                Download as PDF
              </Button>

              <Button
                color="primary"
                onClick={() => sizeToFit()}
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  width: "120px",
                }}
              >
                Size to Fit
              </Button>

              <Button
                color="primary"
                onClick={() => autoSizeAll(false)}
                style={{
                  padding: "10px 16px",
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  width: "140px",
                }}
              >
                Auto-Size All
              </Button>
            </div>
          </Grid>
        </Grid>
      </Grid>
      <div>
        {stitle === "Device Reports" && (
          <div>
            <Grid container item xs={12} spacing={1}>
              {/* <Grid item xs={12} sm={12} md={1} lg={1} xl={1} xxl={1}></Grid> */}
              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                >
                  <InputLabel id="demo-simple-select-outlined-label">
                    Building
                  </InputLabel>

                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    label="Building"
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                      // textAlign: "center",
                      // // Centers the text
                      // "& .MuiSelect-select": {
                      //   textAlign: "center",
                      //   // Centers the selected text
                      // },
                    }}
                    className={classes.select}
                    value={selectedBuilding} // Always display "TEPL"
                    onChange={handleBuildingChange} // Call function on click
                    disableUnderline
                  >
                    {bdata.map((_item) => (
                      <MenuItem key={_item.uuid} value={_item.uuid}>
                        {_item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                >
                  <InputLabel id="floor-label">Floor</InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    label="Building"
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                    value={selectedFloor}
                    onChange={handleFloorChange}
                    className={classes.select}
                    disableUnderline
                  >
                    {floors.map((floor) => {
                      let displayName = "";

                      if (floor.name.includes("Basement"))
                        displayName = "Basement";
                      else if (floor.name.includes("Ground"))
                        displayName = "Ground";
                      else if (floor.name.includes("First"))
                        displayName = "First";
                      else if (floor.name.includes("Second"))
                        displayName = "Second";
                      else if (floor.name.includes("Third"))
                        displayName = "Third";
                      else if (floor.name.includes("Roof"))
                        displayName = "Terrace";
                      else displayName = floor.name; // fallback to original

                      return (
                        <MenuItem key={floor.name} value={floor.uuid}>
                          {displayName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                  disabled={isEquipmentDisabled} // ✅ Equipment dropdown is disabled until floor is selected
                >
                  <InputLabel id="equipment-select-label">
                    Equipment Type
                  </InputLabel>
                  <Select
                    labelId="equipment-select-label"
                    value={selectedEquipment || ""}
                    onChange={handleEquipmentChange}
                    disableUnderline
                    className={classes.select}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                  >
                    {Array.from(
                      new Set(extractedDevices.map((device) => device.ssType)),
                    ).map((ssType) => {
                      const displayName = getEquipmentDisplayName(ssType);
                      let label = "";

                      console.log("extractedDevices", extractedDevices);
                      // Mapping technical ssType values to user-friendly labels
                      // switch (ssType) {
                      //   case "FRESH_AIR_UNIT":
                      //     label = "Fresh Air Unit";
                      //     break;
                      //   case "NONGL_SS_AHU":
                      //     label = "AHU";
                      //     break;
                      //   case "SS_BRE_FAN":
                      //     label = "BRE Fan";
                      //     break;
                      //   case "SS_HTE_FAN":
                      //     label = "HTE Fan";
                      //     break;
                      //   default:
                      //     // Optional: format remaining types with spaces
                      //     label = ssType.replace(/_/g, " ");
                      //     break;
                      // }

                      return (
                        <MenuItem key={ssType} value={ssType}>
                          {displayName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                  disabled={!selectedEquipment} // 🔒 Disable if no equipment type selected
                >
                  <InputLabel id="device-label">Device</InputLabel>
                  <Select
                    labelId="device-label"
                    value={selectedDeviceName || ""}
                    onChange={(event) => {
                      const selectedDevice = filteredDeviceList.find(
                        (device) => device.name === event.target.value,
                      );
                      if (selectedDevice) {
                        handleDeviceChange(
                          selectedDevice.name,
                          selectedDevice.id,
                        );
                        setSelectedDeviceName(selectedDevice.name);
                      }
                    }}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                    }}
                    label="Device"
                  >
                    {filteredDeviceList.length === 0 ? (
                      <MenuItem disabled>No devices available</MenuItem>
                    ) : (
                      [...filteredDeviceList] // Make a copy to avoid mutating state
                        .sort((a, b) => a.name.localeCompare(b.name)) // ✅ Sort alphabetically
                        .map((device) => (
                          <MenuItem key={device.id} value={device.name}>
                            {device.name}
                          </MenuItem>
                        ))
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                  disabled={!selectedDeviceName}
                >
                  <InputLabel id="device-params-label">
                    Device Parameters
                  </InputLabel>
                  <Select
                    labelId="device-params-label"
                    multiple
                    value={selectedDeviceParams}
                    onChange={(e) => setSelectedDeviceParams(e.target.value)}
                    renderValue={(selected) => selected.join(", ")}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                  >
                    {deviceParameters.map((param) => (
                      <MenuItem key={param} value={param}>
                        <Checkbox
                          checked={selectedDeviceParams.indexOf(param) > -1}
                        />
                        <ListItemText primary={param} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}

              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                  disabled={!selectedDeviceName}
                >
                  <InputLabel id="device-params-label">
                    Device Parameters
                  </InputLabel>
                  <Select
                    labelId="device-params-label"
                    multiple
                    value={selectedDeviceParams}
                    onChange={(e) => {
                      const value = e.target.value;
                      const allIsSelected = value.includes("ALL");
                      const allWereSelected =
                        selectedDeviceParams.length === deviceParameters.length;

                      if (allIsSelected && !allWereSelected) {
                        setSelectedDeviceParams(deviceParameters);
                        setAge3("");
                        setIsDisabled(true);
                      } else if (allIsSelected && allWereSelected) {
                        setSelectedDeviceParams([]);
                        setAge3("");
                        setIsDisabled(true);
                      } else {
                        const filteredValue = value.filter((v) => v !== "ALL");
                        setSelectedDeviceParams(filteredValue);

                        if (filteredValue.length === 0) {
                          setAge3("");
                          setIsDisabled(true);
                        } else {
                          setAge3("");
                          setIsDisabled(true);
                        }
                      }
                    }}
                    renderValue={(selected) => {
                      if (
                        deviceParameters.length > 0 &&
                        selected.length === deviceParameters.length
                      ) {
                        return "All Parameters";
                      }
                      // Show count when more than 2 parameters are selected
                      if (selected.length > 2) {
                        return `${selected.length} Parameters Selected`;
                      }
                      // Show friendly labels from paramDescriptions.json
                      return selected.map((p) => getParamLabel(p)).join(", ");
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                        },
                      },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                    }}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                    sx={{
                      "& .MuiSelect-select": {
                        height: "6vh !important",
                        display: "flex",
                        alignItems: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: "32px",
                      },
                    }}
                  >
                    <MenuItem key="all-parameters" value="ALL">
                      <Checkbox
                        checked={
                          deviceParameters.length > 0 &&
                          selectedDeviceParams.length ===
                            deviceParameters.length
                        }
                      />
                      <ListItemText primary="Select All" />
                    </MenuItem>
                    {deviceParameters.map((param) => (
                      <MenuItem key={param} value={param}>
                        <Checkbox
                          checked={selectedDeviceParams.indexOf(param) > -1}
                        />
                        <ListItemText primary={getParamLabel(param)} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                <FormControl
                  variant="outlined"
                  size="small"
                  className={classes.formControl}
                  style={{
                    width: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                >
                  <InputLabel id="demo-simple-select-outlined-label">
                    Time
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    label="Building"
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                    value={age3}
                    className={classes.select}
                    onChange={handleDropdownChange}
                    disableUnderline
                  >
                    <MenuItem value="">
                      <em>Select Time</em>
                    </MenuItem>
                    <MenuItem value="1 Day">1 Day</MenuItem>
                    <MenuItem value="1 week">1 Week</MenuItem>
                    <MenuItem value={"1 month"}>1 Month</MenuItem>
                    <MenuItem value={"3 months"}>3 Months</MenuItem>
                    <MenuItem value={"6 months"}>6 Months</MenuItem>
                    <MenuItem value={"1 year"}>1 Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={1} lg={1} xl={1} xxl={1}></Grid> */}
            </Grid>
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={3}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={3}>
                    <FormControl
                      component="fieldset"
                      variant="filled"
                      size="small"
                      className={classes.formControl}
                      style={{
                        width: "100%",
                        fontFamily: "Arial",
                        display: "flex", // Set display to flex
                        justifyContent: "space-between", // Space evenly between elements
                      }}
                    ></FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
        )}
      </div>
      {stitle !== "Device Reports" && (
        <div
          style={{
            display: "flex",
            alignItems: "left",
            justifyContent: "left",
            gap: "10px",
          }}
        >
          <ButtonGroup
            color="primary"
            aria-label="format"
            className={classes.buttonGroup}
            size="small"
          >
            {/* <Button onClick={() => sizeToFit()} size='small' style={{ padding: '4px 10px', fontSize: '12px' }}>
        Size to Fit
      </Button>
      <div style={{ margin: '0 3px' }}></div>
      <Button onClick={() => autoSizeAll(false) } style={{ padding: '4px 10px', fontSize: '12px' }}>Auto-Size All</Button> */}
          </ButtonGroup>
          {/* <ButtonGroup
      color="primary"
      aria-label="format"
      className={classes.buttonGroup}
      size="small"
    >
      <Button onClick={() => onBtExport()} size='small' style={{ padding: '4px 10px', fontSize: '12px' }}>
        Export to CSV
      </Button>
      <div style={{ margin: '0 3px' }}></div>
      <Button onClick={() => downloadAsPdf()} size="small"style={{ padding: '4px 10px', fontSize: '12px' }} >Download as PDF</Button>
    </ButtonGroup> */}
        </div>
      )}

      {isloaded === false ? (
        <div style={{ textAlign: "center", marginTop: "150px" }}>
          <CircularProgress className={classes.loader} />
        </div>
      ) : (
        <div
          className="ag-theme-alpine"
          style={{ height: 700, width: "100%", marginTop: "1vh" }}
        >
          <AgGridReact
            ref={gridRef}
            // rowData={reportData["RowData"]}
            // rowData={age3 === "Device Reports" ? deviceReportData : reportData["RowData"]} // Use deviceReportData only for "Device Reports" option
            rowData={getFilteredData()}
            columnDefs={reportData["Headings"]}
            rowSelection={"multiple"}
            onSelectionChanged={onSelectionChanged}
            pagination={true}
            paginationPageSize={14}
            onFirstDataRendered={onFirstDataRendered1}
            suppressMovable="true"
            suppressMenuHide="true"
          ></AgGridReact>
        </div>
      )}
       {/* {window.innerHeight}*{window.innerWidth} */}
    </div>
   
  );
}

export default GlEventsViewer;
