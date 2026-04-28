import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Card,
  ButtonBase,
  TextField,
  Paper,
} from "@material-ui/core";
import pripumpimg from "./../../assets/img/Primary Pump Sample.png";
import secpumpimg from "./../../assets/img/SecPumpImg.png";
import cndpumpimg from "./../../assets/img/Secondary Pump.png";
// import emptyimg from "./assets/img/empty.png"
// import pumpimg from './../../assets/img/PrimaryPump.png';
import fanimg from "./../../assets/img/AHU-fan-img.png";
import SwitchSelector from "react-switch-selector";
import api from "../../api";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import value from "views/Custom/value";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import {
  redColor,
  yellowColor,
  greenColor,
  whiteColor,
  grayColor,
  blackColor,
  blueColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import {
  Tooltip,
  CardContent,
  List,
  ListItem,
  Typography,
  Chip,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  // paper: {
  //   background: "#FFFFFF 0% 0% no-repeat padding-box",
  //   boxShadow: "0px 8px 40px #0123B433;",
  //   padding: theme.spacing(1),
  //   textAlign: "center",
  //   color: theme.palette.text.secondary,
  //   borderRadius: "12px",
  //   opacity: "1",
  // },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "0px 8px 40px #0123B433;",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: "12px",
    opacity: "1",
  },

  // paper1: {
  //   background: "#FFFFFF 0% 0% no-repeat padding-box",
  //   boxShadow: "0px 0px 10px #0123B421",
  //   opacity: "1",
  //   borderRadius: "12px",
  //   height: "12vh",
  //   // display: 'flex',
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  paper1: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "0px 0px 10px #0123B421",
    opacity: "1",
    borderRadius: "12px",
    height: "auto",
    minHeight: "12vh",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  CardbodyInsideGrid: {
    "justify-content": "center",
    display: "inline-flex",
    padding: "0.9375rem 20px",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative",
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "2vh",
    },
  },
  status: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  cardHeading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    whiteSpace: "nowrap",
    color: "#000000",
    //     fontSize:'2.5vh',
    marginTop: "1vh",
    font: "normal normal medium 17px/60px Bw Seido Round",
    opacity: "1",
    fontWeight: "bold",
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      // width:'25vw',
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "1.5vh",
    },
  },
  switchselector: {
    display: "flex",
    justifyContent: "center",
    width: "16vh",
    marginTop: "1vh",
  },
  semicircleBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "-0.8vh",
  },
  cardbody: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "4vh",
    fontWeight: "bold",
    opacity: "1",
    color: blueColor[0],
  },
  cardbody1: {
    display: "flex",
    justifyContent: "center",
    // marginTop:'1.5vh',
    alignItems: "center",
    fontSize: "3vh",
    fontWeight: "bold",
    opacity: "1",
    color: blueColor[0],
  },
  cardhoverparam: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "0px 8px 40px #0123B433;",
    borderRadius: "10px",
    minWidth: "150px", // Smaller width
    padding: "5px", // Less padding
    // opacity: 0.75,
  },
  listItem: {
    padding: "5px 0", // Smaller spacing between list items
    fontSize: "13px", // Smaller text
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

function GlPump(props) {
  const classes = useStyles();
  let pageType = props.pageType;
  const [floor, setFloor] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [disable, setDisable] = useState(false);
  const [allPumpsData, setAllPumpsData] = useState([]);
  const [eachPumpsData, setEachPumpsData] = useState({});
  const [pumpWholeRes, setPumpWholeRes] = useState([]);
  const [pumpStationWholeRes, setPumpStationWholeRes] = useState({});
  const [runHours, setRunHours] = useState(0);
  const [pumpOn_Off, setPumpOn_Off] = useState(0);
  const [pumpAM_SS, setPumpAM_SS] = useState(0);
  const [pumpRunHrs, setPumpRunHrs] = useState(0);
  const [pumpRunStatus, setPumpRunStatus] = useState(0);
  const [pumpTripStatus, setPumpTripStatus] = useState(0);
  const [pumpDriveSpeed, setPumpDriveSpeed] = useState(0);
  const [pumpVFDStatus, setPumpVFDStatus] = useState(0);
  const [am_SS, setAM_SS] = useState("");
  const [zat, setZAT] = useState("");
  const [sat, setSat] = useState("");
  const [errAlarm, setErrAlarm] = useState("");
  const [opn_SS, setOpn_SS] = useState(0);
  const [pumpStatusColor, setPumpStatusColor] = useState(0);
  const [click, setClick] = useState("");
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const [showPumpStationParams, setShowPumpStationParams] = useState(false);
  const CPM_Status = localStorage.getItem("CPM_AM_Status");
  const CPM_Override_Status = localStorage.getItem("CPM_Override_Status");
  const CPO_OverAllStatus = localStorage.getItem("CPO_OverAllStatus");
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const options1 = [
    {
      label: "Card View",
      value: "cardview",
      selectedBackgroundColor: blueColor[0],
    },
    {
      label: "Table View",
      value: "tableview",
      selectedBackgroundColor: blueColor[0],
    },
  ];
  const options = [
    {
      label: "OFF",
      value: 0,
      selectedBackgroundColor: blueColor[0],
      fontSize: "12",
    },
    {
      label: "ON",
      value: 1,
      selectedBackgroundColor: "#34C759",
      fontSize: "12",
    },
  ];
  const optionsBms = [
    {
      label: "OFF",
      value: 0,
      selectedBackgroundColor: grayColor[0],
      fontSize: "10",
    },
    {
      label: "ON",
      value: 1,
      selectedBackgroundColor: "#34C759",
      fontSize: "10",
    },
    {
      label: "AUTO",
      value: 2,
      selectedBackgroundColor: "#0123B4",
      fontSize: "10",
    },
  ];
  //   const initialSelectedIndex = options.findIndex(
  //     ({ value }) => value === "active"
  //   );
  const initialSelectedIndex1 = options1.findIndex(
    ({ value }) => value === "manual"
  );

  const primaryPumpParamsData = [
  {
    title: "Pump Voltage",
    parameter: "par_avg_voltage_00",
    unit: "V",
    chip: true,
  },
  {
    title: "Pump Power",
    parameter: "par_avg_power_00",
    unit: "kW",
    chip: true,
  },
  
  {
    title: "Pump Speed",
    parameter: "par_speed_00",
    unit: "rpm",
    chip: true,
  },
  {
    title: "Pump Current",
    parameter: "par_avg_current_00",
    unit: "A",
    chip: true,
  },
  // {
  //   title: "Pump Frequency",
  //   parameter: "par_frequency_00",
  //   unit: "Hz",
  //   chip: true,
  // },
  {
    title: "Pump Energy",
    parameter: "par_energy_00",
    unit: "kWh",
    chip: true,
  },
];
  const primaryPumpParams = (
    <Card className={classes.cardhoverparam}>
      <CardContent style={{ padding: "5px" }}>
        <List dense>
          {primaryPumpParamsData.map((item, index) => {
            const parameterData = pumpWholeRes[item.parameter];
            // console.log("Pump Station props.data:", props.data);
            // console.log("Eqp_Attributes:", props.data.Eqp_Attributes);
            let presentValue = parameterData?.presentValue ?? "N/A";
            if (!isNaN(parseFloat(presentValue))) {
              presentValue = parseFloat(presentValue).toFixed(2);
            }

            return (
              <ListItem key={index} className={classes.listItem}>
                {index + 1}. {item.title}:
                {item.chip ? (
                  <Chip
                    label={`${presentValue} ${item.unit}`}
                    color="primary"
                    size="small"
                    style={{
                      fontSize: "12px",
                      height: "20px",
                    }}
                  />
                ) : (
                  <span>
                    {presentValue} {item.unit}
                  </span>
                )}
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );

  // const onClickIssue = () => {};
  useEffect(() => {
    if (props) {
      // if(props.location !== undefined){
      setClick("eachPump");
      setEachPumpsData(props.data);
      if (props.type === "Pump Station") {
        console.log("Pump Station ATTRIBUTES:", props.data?.Eqp_Attributes);
        setPumpStationWholeRes(props.data.Eqp_Attributes);
        
        return; //  prevents Pump logic overriding Pump Station data
      }

      if (props.type === "Primary Pump") {
        if (props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue) {
          setRunHours(props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue);
        }
        setPumpOn_Off(
            props.data["Eqp_Attributes"]["cmd_on_off_00"].presentValue ==
              "active"
              ? 1
              : 0
          );
        if (props.data.Eqp_Attributes) {
          // expose attributes for tooltip values for Primary Pump
         setPumpWholeRes(props.data.Eqp_Attributes);
          // setPumpOn_Off((props.data["Eqp_Attributes"]["Pri_Pmp_On_Off"].presentValue)=="active"? 1:0)
          // setPumpOn_Off((props.data["Eqp_Attributes"]["PriV_Pmp_On_Off_Cmd"].presentValue)=="active"? 1:0)
          setPumpAM_SS(
             ((props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue) ==
              "active" || (props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "2.0"))
              ? "Auto"
              : ((props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "inactive" || props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "1.0"))?
               "Manual"
              :
              ""
              
          );

          // setPumpAM_SS(
          //   props.data["Eqp_Attributes"]["PriV_Pmp_Hand_Mode"].presentValue ==
          //     "active"
          //     ? "Manual"
          //     : ""
          // );
          setPumpRunStatus(
            props.data["Eqp_Attributes"]["sts_on_off_00"].presentValue ==
              "active"
              ? "ON"
              : "Off"
          );
          setPumpDriveSpeed(
            props.data?.Eqp_Attributes?.PriV_Pmp_Drive_kWh?.presentValue
          );
          setPumpTripStatus(
            props.data?.Eqp_Attributes?.alm_trip_00?.presentValue == "active"
              ? "Tripped"
              : "Normal"
          );
        }
        if (props.data.Eqp_Attributes.sts_on_off_00 != undefined) {
          setPumpStatusColor(props.data["Eqp_Attributes"]["sts_on_off_00"]);
        }
        if (props.data?.controlable?.cmd_on_off_00 !== undefined) {
          setPumpOn_Off(props.data.controlable.cmd_on_off_00);
        }
        if (props.data?.controlable?.sts_on_off_00 !== undefined) {
          setOpn_SS(props.data.controlable.sts_on_off_00);
        }
      }
      else if (props.type === "Secondary Pump") {
         if (props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue) {
          setRunHours(props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue);
        }
        if (props.data.Eqp_Attributes) {
          // expose attributes for tooltip values for Secondary Pump
          setPumpWholeRes(props.data.Eqp_Attributes);
          setPumpRunStatus(
            props.data["Eqp_Attributes"]["sts_on_off_00"]?.presentValue == "active"
              ? "ON"
              : "OFF"
          );
          setPumpTripStatus(
            props.data?.Eqp_Attributes?.alm_trip_00?.presentValue == "active"
              ? "Tripped"
              : "Normal"
          );
        }
      }
      // else if (props.type == "Condenser Pump") {
      else if (props.type?.toLowerCase().includes("condenser")) {
        if (props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue) {
          setRunHours(props.data?.Eqp_Attributes?.par_run_hours_00?.presentValue);
        }
        if (props.data.Eqp_Attributes) {
          //const eqp = props.data.Eqp_Attributes;
          // expose attributes for tooltip values for Condenser Pump
          setPumpWholeRes(props.data.Eqp_Attributes);
          setPumpOn_Off(
            props.data["Eqp_Attributes"]["cmd_on_off_00"].presentValue ==
              "active"
              ? 1
              : 0
          );
           setPumpAM_SS(
             ((props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue) ==
              "active" || (props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "2.0"))
              ? "Auto"
              : ((props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "inactive" || props.data["Eqp_Attributes"]["sts_auto_manual_00"].presentValue == "1.0"))?
               "Manual"
              :
              ""
          );
          setPumpTripStatus(
            props.data?.Eqp_Attributes?.alm_trip_00?.presentValue ==
              "active"
              ? "Tripped"
              : "Normal"
          );
          setPumpRunStatus(
            props.data["Eqp_Attributes"]["sts_on_off_00"].presentValue ==
              "active"
              ? "ON"
              : "OFF"
          );
        }
        if (props.data.Eqp_Attributes.sts_on_off_00 != undefined) {
          setPumpStatusColor(props.data["Eqp_Attributes"]["sts_on_off_00"]);
        }
        if (props.data?.controlable?.cmd_on_off_00 !== undefined) {
          setPumpOn_Off(props.data.controlable.cmd_on_off_00);
        }
        if (props.data?.controlable?.sts_on_off_00 !== undefined) {
          setOpn_SS(props.data.controlable.sts_on_off_00);
        }
      }
      if (props.type === "AtcsPump") {
        if (props.data.Eqp_Metrics) {
          setRunHours(props.data.Eqp_Metrics.rh_cumulative);
        }
        if (props.data.Eqp_Attributes) {
          // expose attributes for tooltip values for Primary Pump
          setPumpWholeRes(props.data.Eqp_Attributes);
          setPumpRunStatus(
            // props.data["Eqp_Attributes"]["ATCS_Run_SS"].presentValue ==
            //   "active" || "null"
            //   ? "Onnnn"
            //   : "Off"
            props.data["Eqp_Attributes"]["ATCS_Run_SS"].presentValue == "active"
              ? "ON"
              : "OFF"
          );
          console.log(
            "ATCS_Run_SS value =>",
            props.data?.Eqp_Attributes?.ATCS_Run_SS?.presentValue
          );
        }
        //  if (props.data.Eqp_Attributes.sts_on_off_00 != undefined) {
        //    setPumpStatusColor(props.data["Eqp_Attributes"]["PriV_Pmp_SS"]);
        //  }
      } else if (props.type == "Ventilator") {
        if (props.data["controlable"]["VEN_AM_SS"]) {
          setAM_SS(props.data["controlable"]["VEN_AM_SS"]);
        }
        if (props.data["controlable"]["VEN_ZAT"]) {
          setZAT(props.data["controlable"]["VEN_ZAT"]);
        }
        if (props.data["controlable"]["VEN_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["VEN_Error_Alarm"]);
        }
        if (props.data["controlable"]["VEN_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["VEN_Opn_SS"]);
        }
      } else if (props.data.type == "SS_BRE_FAN") {
        if (props.data["controlable"]["BRE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["BRE_AM_SS"]);
        }
        // if(props.data['controlable']['SubE_ZAT']){
        //       setZAT(props.data['controlable']['SubE_ZAT'])
        // }
        if (props.data["controlable"]["BRE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["BRE_Error_Alarm"]);
        }
        if (props.data["controlable"]["BRE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["BRE_Opn_SS"]);
        }
      } else if (props.data.type == "SS_HTE_FAN") {
        if (props.data["controlable"]["HTE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["HTE_AM_SS"]);
        }
        if (props.data["controlable"]["HTE_ZAT"]) {
          setZAT(props.data["controlable"]["HTE_ZAT"]);
        }
        if (props.data["controlable"]["HTE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["HTE_Error_Alarm"]);
        }
        if (props.data["controlable"]["HTE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["HTE_Opn_SS"]);
        }
      } else if (props.data.type == "SS_SUBE_FAN") {
        if (props.data["controlable"]["HTE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["HTE_AM_SS"]);
        }
        if (props.data["controlable"]["HTE_ZAT"]) {
          setZAT(props.data["controlable"]["HTE_ZAT"]);
        }
        if (props.data["controlable"]["HTE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["HTE_Error_Alarm"]);
        }
        if (props.data["controlable"]["HTE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["HTE_Opn_SS"]);
        }
      } else if (props.type == "Ventilator") {
        if (props.data["controlable"]["VEN_AM_SS"]) {
          setAM_SS(props.data["controlable"]["VEN_AM_SS"]);
        }
        if (props.data["controlable"]["VEN_ZAT"]) {
          setZAT(props.data["controlable"]["VEN_ZAT"]);
        }
        if (props.data["controlable"]["VEN_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["VEN_Error_Alarm"]);
        }
        if (props.data["controlable"]["VEN_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["VEN_Opn_SS"]);
        }
        if (props.data["controlable"]["VEN_On_Off"]) {
          setPumpOn_Off(
            props.data["controlable"]["VEN_On_Off"] == "active" ? 1 : 0
          );
        }
      } else if (props.data.type == "SS_BRE_FAN") {
        if (props.data["controlable"]["BRE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["BRE_AM_SS"]);
        }
        // if(props.data['controlable']['SubE_ZAT']){
        //       setZAT(props.data['controlable']['SubE_ZAT'])
        // }
        if (props.data["controlable"]["BRE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["BRE_Error_Alarm"]);
        }
        if (props.data["controlable"]["BRE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["BRE_Opn_SS"]);
        }
        if (props.data["controlable"]["BRE_Fan_On_Off"]) {
          setPumpOn_Off(
            props.data["controlable"]["BRE_Fan_On_Off"] == "active" ? 1 : 0
          );
        }
      } else if (props.data.type == "SS_HTE_FAN") {
        if (props.data["controlable"]["HTE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["HTE_AM_SS"]);
        }
        if (props.data["controlable"]["HTE_ZAT"]) {
          setZAT(props.data["controlable"]["HTE_ZAT"]);
        }
        if (props.data["controlable"]["HTE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["HTE_Error_Alarm"]);
        }
        if (props.data["controlable"]["HTE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["HTE_Opn_SS"]);
        }
        if (props.data["controlable"]["HTE_On_Off"]) {
          setPumpOn_Off(
            props.data["controlable"]["HTE_On_Off"] == "active" ? 1 : 0
          );
        }
      } else if (props.data.type == "SS_SUBE_FAN") {
        if (props.data["controlable"]["HTE_AM_SS"]) {
          setAM_SS(props.data["controlable"]["HTE_AM_SS"]);
        }
        if (props.data["controlable"]["HTE_ZAT"]) {
          setZAT(props.data["controlable"]["HTE_ZAT"]);
        }
        if (props.data["controlable"]["HTE_Error_Alarm"]) {
          setErrAlarm(props.data["controlable"]["HTE_Error_Alarm"]);
        }
        if (props.data["controlable"]["HTE_Opn_SS"]) {
          setOpn_SS(props.data["controlable"]["HTE_Opn_SS"]);
        }
        if (props.data["controlable"]["SubE_Fan_On_Off"]) {
          setPumpOn_Off(
            props.data["controlable"]["SubE_Fan_On_Off"] == "active" ? 1 : 0
          );
        }
      }
      // }
    }
  }, []);

  const onChange = (newValue) => {
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);
    if (pageType == "BMS") {
      setOpn_SS(newValue);
    } else {
      setPumpOn_Off(newValue);
    }
    // console.log("ss_type passing for payload",props.type,props.data)
    let ss_type =
      props.type == "Primary Pump"
        ? "NONGL_SS_PRIMARY_PUMP"
        : props.type == "Primary SEQ Panel"
        ? "NONGL_SS_PRIMARY_SEQ_PANEL"
        : props.type == "Secondary Pump"
        ? "NONGL_SS_SECONDARY_PUMPS"
        : props.type?.toLowerCase().includes("condenser")
        ? "NONGL_SS_CONDENSER_PUMPS"
        : props.type == "Ventilator"
        ? "SS_VENTILATOR_1"
        : props.type == "Exhaust Fan"
        ? props.data.type == "SS_BRE_FAN"
          ? "SS_BRE_FAN"
          : props.data.type == "SS_HTE_FAN"
          ? "SS_HTE_FAN"
          : props.data.type == "SS_SUBE_FAN"
          ? "SS_SUBE_FAN"
          : ""
        : "";

    const req = {
      ss_type: ss_type,
      ss_id: props.data.id,
      gl_command:
        newValue == 0 ? "TURN_OFF" : newValue == 1 ? "TURN_ON" : "AUTO",
      param_id:
        props.type == "Primary Pump"
          ? "cmd_on_off_00"
          : props.type == "Secondary Pump"
          ? "cmd_on_off_00"
          : props.type?.toLowerCase().includes("condenser")
          ? "cmd_on_off_00"
          : props.type == "Ventilator"
          ? "VEN_On_Off"
          : props.type == "Exhaust Fan"
          ? props.data.type == "SS_BRE_FAN"
            ? "BRE_Fan_On_Off"
            : props.data.type == "SS_HTE_FAN"
            ? "HTE_On_Off"
            : props.data.type == "SS_SUBE_FAN"
            ? "SubE_Fan_On_Off"
            : ""
          : "",
      value: newValue === 1 ? "active" : newValue === 0 ? "inactive" : "Auto",
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };
    // console.log("iddddddd",id,props.data)
    api.floor
      .cpmOnOffControl(req)
      .then((response) => {
        if (pageType == "BMS") {
          console.log("qqqqqqqqqqqqq", response);
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: "Controlled Successfully",
            time: 3000,
          });
        } else {
          setPumpOn_Off(
            response.startsWith("Working with a Scenario")
              ? newValue == 0
                ? 1
                : 0
              : newValue
          );
          toast({
            type: response.startsWith("Working with a Scenario")
              ? "error"
              : "success",
            icon: response.startsWith("Working with a Scenario")
              ? "exclamation triangle"
              : "check circle",
            title: response.startsWith("Working with a Scenario")
              ? "Error"
              : "Success",
            description: response,
            time: 2000,
          });
        }
      })
      .catch((err) => {
        // setOpenerr(true);
        // setErrmsg(err);
      });
  };

  const handleChangeForsetpointSAT = (event) => {
    setSat(event.target.value);
  };

  const handleClickSat = (event) => {
    // const req = {
    //   param_id: "SAT_SP",
    //   param_value: setSat,
    //   user_id: localStorage.userID,
    // };
    const req = {
      ss_type:
        props.type == "Ventilator"
          ? "SS_VENTILATOR_1"
          : props.data.type == "SS_BRE_FAN"
          ? "SS_BRE_FAN"
          : props.data.type == "SS_HTE_FAN"
          ? "SS_HTE_FAN"
          : props.data.type == "SS_SUBE_FAN"
          ? "SS_SUBE_FAN"
          : "",
      ss_id: props.data.id,
      gl_command: "CHANGE_SET_POINT",
      param_id:
        props.type == "Ventilator"
          ? "VEN_ZAT"
          : props.data.type == "SS_BRE_FAN"
          ? ""
          : props.data.type == "SS_HTE_FAN"
          ? "HTE_ZAT"
          : props.data.type == "SS_SUBE_FAN"
          ? "SubE_ZAT"
          : "",
      value: sat,
      zone_type: null,
      zone_id: null,
    };
    if (sat >= 15 && sat <= 35) {
      api.floor
        .cpmOnOffControl(req)
        .then((res) => {
          // setSAtvalue("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.id) {
            let requestID = res.id;
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Sat successfully setted" + sat,
              time: 2000,
            });
            const checkCommandStatus = (requestID, startTime = Date.now()) => {
              api.floor
                .checkCommandStatus(requestID)
                .then((res) => {
                  if (res[0].status === "success") {
                    // Command was successful, stop further API calls
                    console.log("Command succeeded");
                    toast({
                      type: "success",
                      icon: "check circle",
                      title: "Command Status",
                      description: "Command processed successfully",
                      time: 2000,
                    });
                  } else if (res[0].status === "pending") {
                    console.log("Command is still Pending");
                    const elapsedTime = Date.now() - startTime;

                    if (elapsedTime < 30000) {
                      console.log(
                        " If less than 30 seconds have passed, keep checking every 3 seconds"
                      );
                      setTimeout(
                        () => checkCommandStatus(requestID, startTime),
                        3000
                      );
                    } else {
                      console.log(
                        "Stop checking after 30 seconds and show a timeout message"
                      );
                      console.log("Command timed out after 30 seconds.");
                      toast({
                        type: "error",
                        icon: "clock",
                        title: "Timeout",
                        description:
                          "Command is still pending after 30 seconds.",
                        time: 5000,
                      });
                    }
                  }
                })
                .catch((error) => {
                  console.error("Error checking command status:", error);
                  toast({
                    type: "error",
                    icon: "exclamation triangle",
                    title: "Error",
                    description: "Error while checking command status",
                    time: 2000,
                  });
                });
            };

            checkCommandStatus(requestID);
          }
        })
        .catch((error) => {
          setOpenerr(true);
          if (error.response) {
            setErrmsg(error.response.data.message);
          } else {
            setErrmsg("No response");
          }
        });
    } else {
      // setSAtvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "SAT sp should be 15-35 ",
        time: 2000,
      });
    }
  };

  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg("");
  };

  // Check if pump type should show switch selector
  const shouldShowSwitch =
    props.type === "Primary Pump" ||
    // props.type === "Secondary Pump" ||
   // props.type === "Secondary Pump" ||
    props.type?.toLowerCase().includes("condenser");

  // Check if tooltip should be shown - for Primary Pump, Secondary Pump, and Condenser Pump
  const shouldShowTooltip =
    props.type === "Primary Pump" ||
    props.type === "Secondary Pump" ||
    props.type?.toLowerCase().includes("condenser");

  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Snackbar
        open={openerr}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          style={{ cursor: "pointer" }}
          severity="error"
          variant="filled"
          onClose={handleerrorclose}
        >
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            {/* <Card
              className={classes.paper}
              style={{
                height: props.type === "AtcsPump" ? "36vh" : "44vh",
                width: window.innerHeight == "1080" ? "54vw" : "",
              }}
            > */}
            <Card
              className={classes.paper}
              style={{
                height: "auto",
                width: window.innerHeight == "1080" ? "60vw" : "auto",
                minWidth: "550px",
              }}
            >
              {/* Pump Station Layout - Show only 4 parameters */}
              {props.type === "Pump Station" ? (
                <Grid container spacing={2} style={{ padding: "1.5vh" }}>
                  {/* IPS ON Status */}
                  <Grid container spacing={2}>

  {/* Run Status */}
  <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
    <Card className={classes.paper1} style={{ minHeight: "12vh" }}>
      <CardContent style={{ textAlign: "center", padding: "1vh" }}>
        <Typography
          className={classes.cardHeading}
          style={{ fontSize: "2vh", marginTop: "0.5vh" }}
        >
          Run Status
        </Typography>

        <div className={classes.cardbody} style={{ fontSize: "3vh" }}>
          {(() => {
            const runValue =
              pumpStationWholeRes["sts_on_off_00"]?.presentValue;

            const isActive =
              runValue === "active" ||
              runValue === "1.0" ||
              runValue === "1" ||
              runValue === 1;

            const isInactive =
              runValue === "inactive" ||
              runValue === "0.0" ||
              runValue === "0" ||
              runValue === 0;

            return isActive ? "ON" : isInactive ? "OFF" : runValue ?? "";
          })()}
        </div>
      </CardContent>
    </Card>
  </Grid>

  {/* Auto / Manual Status */}
  {/* <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
    <Card className={classes.paper1} style={{ minHeight: "12vh" }}>
      <CardContent style={{ textAlign: "center", padding: "1vh" }}>
        <Typography
          className={classes.cardHeading}
          style={{ fontSize: "2vh", marginTop: "0.5vh" }}
        >
          Auto / Manual Status
        </Typography>

        <div className={classes.cardbody} style={{ fontSize: "3vh" }}>
          {(() => {
            const autoManualValue =
              pumpStationWholeRes["sts_auto_manual_00"]?.presentValue;

            const isAuto =
              autoManualValue === "active" ||
              autoManualValue === "5.0" ||
              autoManualValue === "5" ||
              autoManualValue === 5;

            const isManual =
              autoManualValue === "inactive" ||
              autoManualValue === "0.0" ||
              autoManualValue === "0" ||
              autoManualValue === 0;

            return isAuto ? "Auto" : isManual ? "Manual" : autoManualValue ?? "";
          })()}
        </div>
      </CardContent>
    </Card>
  </Grid> */}

  {/* Trip Status */}
  {/* <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
    <Card className={classes.paper1} style={{ minHeight: "12vh" }}>
      <CardContent style={{ textAlign: "center", padding: "1vh" }}>
        <Typography
          className={classes.cardHeading}
          style={{ fontSize: "2vh", marginTop: "0.5vh" }}
        >
          Trip Status
        </Typography>

        <div className={classes.cardbody} style={{ fontSize: "3vh" }}>
          {(() => {
            const tripValue =
              pumpStationWholeRes["alm_trip_00"]?.presentValue;

            const isTripped =
              tripValue === "active" ||
              tripValue === "1.0" ||
              tripValue === "1" ||
              tripValue === 1;

            const isNormal =
              tripValue === "inactive" ||
              tripValue === "0.0" ||
              tripValue === "0" ||
              tripValue === 0;

            return isTripped
              ? "Tripped"
              : isNormal
              ? "Normal"
              : tripValue ?? "";
          })()}
        </div>
      </CardContent>
    </Card>
  </Grid> */}

</Grid>

                </Grid>
              ) : (
                <>
                  {props.type === "AtcsPump" ? (
                    <>
                      <Grid
                        container
                        xs={12}
                        spacing={1}
                        style={{
                          marginTop: "0.5vh",
                          marginLeft: "0.5vh",
                        }}
                      >
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          {shouldShowTooltip ? (
                            <Tooltip
                              title={primaryPumpParams}
                              interactive
                              arrow
                              placement="bottom"
                            >
                              <img
                                src={
                                  pageType === "BMS"
                                    ? fanimg
                                    : props.type === "Primary Pump"
                                    ? pripumpimg
                                    : // : props.type === "Secondary Pump"
                                    // ? secpumpimg
                                    props.type
                                        ?.toLowerCase()
                                        .includes("condenser")
                                    ? ""
                                    : ""
                                }
                                style={{
                                  width: pageType === "BMS" ? "30px" : "10vh",
                                  marginTop: pageType === "BMS" ? "3.2vh" : "0",
                                  cursor: "pointer",
                                  height: "100%",
                                }}
                              />
                            </Tooltip>
                          ) : (
                            <img
                              src={
                                pageType === "BMS"
                                  ? fanimg
                                  : props.type === "Primary Pump"
                                  ? pripumpimg
                                  : // : props.type === "Secondary Pump"
                                  // ? secpumpimg
                                  props.type
                                      ?.toLowerCase()
                                      .includes("condenser")
                                  ? cndpumpimg
                                  : cndpumpimg
                              }
                              style={{
                                width: pageType === "BMS" ? "30px" : "17vh",
                                marginTop: pageType === "BMS" ? "3.2vh" : "0",
                              }}
                            />
                          )}
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <Card className={classes.paper1}>
                            <Grid container xs={12} spacing={1}>
                              <Grid container item xs={12}>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                  className={classes.cardHeading}
                                >
                                  Run Status
                                </Grid>
                              </Grid>

                              {pageType != "BMS" ? (
                                <Grid container item xs={12}>
                                  <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                  >
                                    {/* <div className={classes.cardbody}>
                                  {parseFloat(pumpRunStatus).toFixed(2) == "NaN"
                                    ? "0"
                                    : parseFloat(pumpRunStatus).toFixed(2)}
                                </div> */}
                                    {/* <div className={classes.cardbody}>
                                      {pumpRunStatus || "0"}
                                    </div> */}
                                    <div
                                      className={classes.cardbody}
                                      style={{
                                        color:
                                          pumpRunStatus === "ON"
                                            ? "green"
                                            : "grey",
                                      }}
                                    >
                                      {pumpRunStatus || "0"}
                                    </div>
                                  </Grid>
                                </Grid>
                              ) : (
                                <></>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <Card className={classes.paper1}>
                            <Grid container xs={12} spacing={1}>
                              <Grid container item xs={12}>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                  className={classes.cardHeading}
                                >
                                  Run Hours
                                </Grid>
                              </Grid>

                              {pageType != "BMS" ? (
                                <Grid container item xs={12}>
                                  <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                  >
                                    <div className={classes.cardbody}>
                                      {parseFloat(runHours).toFixed(2) == "NaN"
                                        ? "0"
                                        : parseFloat(runHours).toFixed(2)}
                                    </div>
                                  </Grid>
                                </Grid>
                              ) : (
                                <></>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid
                        container
                        xs={12}
                        spacing={1}
                        style={{
                          marginTop: "0.5vh",
                          // marginLeft: "0.5vh",
                          paddingRight: "0px",
                        }}
                      >
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <Grid container xs={12} direction="column">
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              style={{ textAlign: "left" }}
                            >
                              <div
                                style={{
                                  color: "black",
                                  fontWeight: "bold",
                                  fontSize: "3vh",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {eachPumpsData.name}
                              </div>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignContent: "center",
                              }}
                            ></Grid>
                          </Grid>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sm={4}
                          md={4}
                          lg={4}
                          xl={4}
                          xxl={4}
                          style={{
                            display: "flex",
                            justifyContent: "right",
                            alignContent: "right",
                          }}
                        >
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              style={{
                                //position: "relative",
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              {shouldShowSwitch ? (
                                <div
                                  className={classes.switchselector}
                                  style={{
                                    //position: "absolute",
                                    //top: "6px",
                                    right: "4px",
                                    height: "5vh",
                                    display: "flex",
                                    alignItems: "center",

                                    pointerEvents:
                                    CPO_OverAllStatus == "MANUAL"? "":"none",
                                      // CPM_Override_Status == "true"
                                      //   ? ""
                                      //   : CPM_Override_Status == "false"
                                      //   ? CPM_Status == "true"
                                      //     ? "0.4"
                                      //     : ""
                                      //   : "0.4",
                                    // CPM_Status == "true" ||
                                    // disable // CPM_Override_Status == "true"
                                      //   ? ""
                                      //   : CPM_Override_Status == "false"
                                      //   ? CPM_Status == "true"
                                      //     ? "0.4"
                                      //     : ""
                                      //   : "0.4", ||
                                    // pumpTripStatus == "Tripped"
                                    //   ? "none"
                                    //   : "",
                                    opacity:
                                    CPO_OverAllStatus == "MANUAL"? "":"0.4",
                                      // CPM_Override_Status == "true"
                                      //   ? ""
                                      //   : CPM_Override_Status == "false"
                                      //   ? CPM_Status == "true"
                                      //     ? "0.4"
                                      //     : ""
                                      //   : "0.4",
                                    width:
                                      props.type === "Primary Pump" ||
                                      props.type
                                        ?.toLowerCase()
                                        .includes("condenser")
                                        ? "18vh"
                                        : "22vh",
                                  }}
                                >
                                  <SwitchSelector
                                    style={{
                                      borderRadius: "12px",
                                    }}
                                    onChange={onChange}
                                    options={
                                      pageType == "BMS" ? optionsBms : options
                                    }
                                    forcedSelectedIndex={
                                      pageType !== "BMS" ? pumpOn_Off : opn_SS
                                    }
                                    backgroundColor={"#e9e5e5"}
                                    fontColor={"rgba(0, 0, 0, 0.87)"}
                                    optionBorderRadius={5}
                                    wrapperBorderRadius={5}
                                  />
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        xs={12}
                        spacing={1}
                        style={{
                          marginTop: "1.5vh",
                          marginLeft: "0.5vh",
                        }}
                      >
                        <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <Card
                            className={classes.paper1}
                            style={{
                              display: "flex",
                              height: "26vh",
                            }}
                          >
                            <Grid
                              container
                              xs={12}
                              spacing={1}
                              direction="column"
                            >
                              <Grid
                                container
                                item
                                xs={12}
                                justify="center"
                                alignItems="center"
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                >
                                  {shouldShowTooltip ? (
                                    <Tooltip
                                      title={primaryPumpParams}
                                      interactive
                                      arrow
                                    >
                                      <img
                                        src={
                                          pageType === "BMS"
                                            ? fanimg
                                            : props.type === "Primary Pump"
                                            ? pripumpimg
                                            : // : props.type === "Secondary Pump"
                                            // ? secpumpimg
                                            props.type
                                                ?.toLowerCase()
                                                .includes("condenser")
                                            ? cndpumpimg
                                            : cndpumpimg
                                        }
                                        style={{
                                          width:
                                            pageType === "BMS"
                                              ? "30px"
                                              : "17vh",
                                          marginTop:
                                            pageType === "BMS" ? "3.2vh" : "0",
                                          cursor: "pointer",
                                        }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <img
                                      src={
                                        pageType === "BMS"
                                          ? fanimg
                                          : props.type === "Primary Pump"
                                          ? pripumpimg
                                          : // : props.type === "Secondary Pump"
                                          // ? secpumpimg
                                          props.type
                                              ?.toLowerCase()
                                              .includes("condenser")
                                          ? cndpumpimg
                                          : cndpumpimg
                                      }
                                      style={{
                                        width:
                                          pageType === "BMS" ? "30px" : "17vh",
                                        marginTop:
                                          pageType === "BMS" ? "3.2vh" : "0",
                                      }}
                                    />
                                  )}
                                </Grid>
                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>
                        

<Grid item xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
  <Grid container xs={12} spacing={1}>
    {/* FIRST ROW: Device Mode and Run Hours (for Primary) / Power and Current (for Secondary) / Device Mode and Run Hours (for Condenser) */}
    {props.type === "Primary Pump" ? (
      <>
        {/* Device Mode - First Row Left */}
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                  Device Mode
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <div className={classes.cardbody1} style={{
                    marginLeft: "0.8vh",
                    color: pumpAM_SS === "Auto" ? "#0123B4" : "green",
                  }}>
                    {pumpAM_SS}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Run Hours - First Row Right */}
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                  Run Hours
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>
                    {parseFloat(runHours).toFixed(2) == "NaN"
                      ? "0"
                      : parseFloat(runHours).toFixed(2)}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </>
    ) : props.type === "Secondary Pump" ? (
      <>
        {/* Current (A) - First Row Left */}
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                  Current (A)
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>
                    {pumpWholeRes?.par_avg_current_00?.presentValue
                      ? parseFloat(pumpWholeRes.par_avg_current_00.presentValue).toFixed(2)
                      : "0.00"}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        {/* Run Hours - First Row Right */}
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={12}
                  lg={12}
                  xl={12}
                  xxl={12}
                  className={classes.cardHeading}
                  style={{ marginLeft: "0.8vh" }}
                >
                  Run Hours
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>
                    {parseFloat(runHours).toFixed(2) == "NaN"
                      ? "0"
                      : parseFloat(runHours).toFixed(2)}
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </>
    ) : (
      /* For Condenser Pump: Device Mode and Run Hours */
      <>
        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                  {pageType !== "BMS" ? "Device Mode" : "Frequency"}
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  {pageType != "BMS" ? (
                    <div className={classes.cardbody1} style={{
                      marginLeft: "0.8vh",
                      color: pumpAM_SS === "Auto" ? "#0123B4" : "green",
                    }}>
                      {pumpAM_SS}
                    </div>
                  ) : (
                    <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>{am_SS}</div>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper1}>
            <Grid container xs={12} spacing={1}>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                  {pageType == "BMS" ? "Temperature Set Point" : "Run Hours"}
                </Grid>
              </Grid>
              {pageType != "BMS" ? (
                <Grid container item xs={12}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>
                      {parseFloat(runHours).toFixed(2) == "NaN"
                        ? "0"
                        : parseFloat(runHours).toFixed(2)}
                    </div>
                  </Grid>
                </Grid>
              ) : (
                <Grid container item xs={12}>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>
                  <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                    <TextField
                      style={{ marginLeft: "3vh" }}
                      placeholder={formatter.format(zat) + "℃"}
                      name="Sat_set_point"
                      autoComplete="off"
                      value={sat}
                      onChange={handleChangeForsetpointSAT}
                      className={classes.text_field}
                    />
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                    <Paper
                      className={classes.set_button}
                      style={{
                        backgroundColor: blueColor[0],
                        display: "flex",
                        justifyContent: "center",
                        cursor: "pointer",
                        marginTop: "1.5vh",
                        marginLeft: "1vh",
                      }}
                      onClick={handleClickSat}
                    >
                      <div style={{ color: "white" }}>set</div>
                    </Paper>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>
                </Grid>
              )}
            </Grid>
          </Card>
        </Grid>
      </>
    )}
  </Grid>

  {/* SECOND ROW: Run Status and Trip Status (for Primary) / Run Hours and Load (for Secondary) / Run Status and Trip Status (for others) */}
  <Grid container xs={12} spacing={1} style={{ marginTop: "0.3vh" }}>
    {pageType != "BMS" ? (
      <>
        {props.type === "Primary Pump" ? (
          <>
            {/* Run Status - Second Row Left */}
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card className={classes.paper1}>
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      Run Status
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpRunStatus === "ON" ? "green" : "grey",
                        }}
                      >
                        {pumpRunStatus == "ON" ? "ON" : "OFF"}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Trip Status - Second Row Right */}
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card
                className={classes.paper1}
                style={{
                  backgroundColor:
                    pumpTripStatus == "Tripped" ? "#FED0C1" : "#C1EECD",
                  color:
                    pumpTripStatus == "Tripped" ? "#FC6434" : "#34C759",
                }}
              >
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      Trip Status
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpTripStatus === "Tripped" ? "red" : "green",
                        }}
                      >
                        {pumpTripStatus ? pumpTripStatus : "-"}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </>
        ) : props.type === "Secondary Pump" ? (
          <>
            {/* Run Status - Second Row Left */}
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card className={classes.paper1}>
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      Run Status
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpRunStatus === "ON" ? "green" : "grey",
                        }}
                      >
                        {pumpRunStatus == "ON" ? "ON" : "OFF"}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Trip Status - Second Row Right */}
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card
                className={classes.paper1}
                style={{
                  backgroundColor:
                    pumpTripStatus == "Tripped" ? "#FED0C1" : "#C1EECD",
                  color:
                    pumpTripStatus == "Tripped" ? "#FC6434" : "#34C759",
                }}
              >
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      Trip Status
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpTripStatus === "Tripped" ? "red" : "green",
                        }}
                      >
                        {pumpTripStatus ? pumpTripStatus : "-"}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </>
        ) : (
          /* For Condenser Pump: Run Status and Trip Status */
          <>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card className={classes.paper1}>
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      {pageType != "BMS" ? "Run Status" : "Status"}
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpRunStatus === "ON" ? "green" : "grey",
                        }}
                      >
                        {pageType != "BMS" ? (
                          <>{pumpRunStatus == "ON" ? "ON" : "OFF"}</>
                        ) : (
                          <>
                            {errAlarm == "active"
                              ? "Tripped"
                              : errAlarm == "inactive"
                              ? errAlarm
                              : ""}
                          </>
                        )}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
              <Card
                className={classes.paper1}
                style={{
                  backgroundColor:
                    pumpTripStatus == "Tripped" ? "#FED0C1" : "#C1EECD",
                  color:
                    pumpTripStatus == "Tripped" ? "#FC6434" : "#34C759",
                }}
              >
                <Grid container xs={12} spacing={1}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={classes.cardHeading}
                      style={{ marginLeft: "0.8vh" }}
                    >
                      Trip Status
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <div
                        className={classes.cardbody1}
                        style={{
                          marginLeft: "0.8vh",
                          color: pumpTripStatus === "Tripped" ? "red" : "green",
                        }}
                      >
                        {pumpTripStatus ? pumpTripStatus : "-"}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </>
        )}
      </>
    ) : (
      <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
        <Card className={classes.paper1}>
          <Grid container xs={12} spacing={1}>
            <Grid container item xs={12}>
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                className={classes.cardHeading}
              >
                Temperature
              </Grid>
            </Grid>
            <Grid container item xs={12}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <div className={classes.cardbody1} style={{ marginLeft: "0.8vh" }}>
                  {formatter.format(zat) + "℃"}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    )}
  </Grid>
</Grid>
                      </Grid>
                    </>
                  )}
                </>
              )}
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}

export default GlPump;
