import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { Box, Card, TextField } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import ChillerImg from "./../../assets/img/ChillerImg.png";
import TimeSeriesUpsStatic from "./../TimeSeriesUpsStatic";
import SwitchSelector from "react-switch-selector";
import { CalendarToday } from "@material-ui/icons";
import { ButtonBase } from "@material-ui/core";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import ProgressBar from "@ramonak/react-progress-bar";
import api from "./../../api";
import TimeS from "./../TimeS";
import TimeSeriesChart from "./../TimeSeriesVav";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import {
  greenColor,
  grayColor,
  redColor,
} from "assets/jss/material-dashboard-react";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Cooling_tower_img from "./../../assets/img/cooling_tower.png";
// import chiller_single from "./../../assets/img/chiller_single.png"

const Leaflet = require("leaflet");

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  semicircularbarcomp: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      marginTop: "-0.5vh",
      marginLeft: "-1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      marginTop: "1vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      marginTop: "-1vh",
      marginLeft: "-1.1vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      marginTop: "0vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      marginTop: "1vh",
      marginLeft: "0.5vh",
    },
  },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius: "9px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "50vh",
    marginTop: "1vh",
    opacity: "1",
  },
  paper1: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  controls_paper: {
    borderRadius: "37px",
    color: "white",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    height: "3.5vh",
    backgroundColor: "lightgrey",
    width: "auto", // Changed to auto
    minWidth: "10vh", // Minimum width
    fontSize: "1.8vh",
    padding: "0 1.5vh", // Horizontal padding for text
    whiteSpace: "nowrap",
  },
  faults_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justify: "center",
    height: "2vh",
    backgroundColor: "lightgrey",
    [theme.breakpoints.down("sm")]: {
      width: "7.5vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "6vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "7.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "7.5vh",
    },
  },
  set_button: {
    marginLeft: "-0.7vh",
    fontFamily: "Arial",
    [theme.breakpoints.down("sm")]: {
      // marginLeft:'0.5vh',
      marginLeft: "-1.2vh",
      width: "3vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "3vh",
      marginLeft: "-1vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "3.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "3.5vh",
    },
  },
  select: {
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "2vh",
      // marginTop: "-1vh",
    },
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4",
      borderRadius: "8px",
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
    },
  },
  switchselector: {
    height: "3.5vh",
    [theme.breakpoints.down("sm")]: {
      width: "8.5vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "13vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "10.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "10.5vh",
    },
  },
  semicircularbar: {
    height: "12vh",
    borderRadius: "6px",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // borderRadius: '14px',
    opacity: "1",
  },
  graphpaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "27.3vh",
    textAlign: "center",
    color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // borderRadius: '14px',
  },
  // controlcard: {
  //   background:'#FFFFFF 0% 0% no-repeat padding-box',
  //   height: "30.5vh",
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary,
  //   boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
  //   backgroundColor:"#fcfafa",
  //   // boxShadow: '0px 4px 20px #0123B41A',
  //   borderRadius: '6px',
  // },
  graphpaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "28vh",
    textAlign: "center",
    color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // borderRadius: '14px',
  },
  text: {
    fontSize: "14px",
    color: " #292929",
    fontFamily: "Arial",
  },
  control1: {
    width: "6vh",
    marginTop: "0vh",
    marginLeft: "-11vh",
    fontFamily: "Arial",
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  paper1: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  CardHeadFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      fontSize: "1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      fontSize: "1.9vh",
      borderRadius: "10px",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      fontSize: "1.7vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      fontSize: "1.8vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "1.7vh",
    },
  },
  controls_text: {
    display: "flex",
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      // textAlign: 'left',
      // fontSize: '2vh',
      // color: '#292929'
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      // textAlign: 'left',
      fontSize: "2vh",
      // color: ''
    },
  },
}));

export default function GlChillerPage(props) {
                                               // console.log("props in glchillerpage",props.graphsCard)
                                               const classes = useStyles();
                                               const mapRef = React.createRef();
                                               const [
                                                 roleId,
                                                 setRoleId,
                                               ] = React.useState(
                                                 props.role_id
                                               );
                                               const [
                                                 eqpType,
                                                 setEqpType,
                                               ] = useState(props.eqpType);
                                               const [
                                                 imageParams,
                                                 setImageParams,
                                               ] = React.useState(
                                                 props.imageParams
                                               );
                                               const [
                                                 controlsCard,
                                                 setControlsCard,
                                               ] = React.useState(
                                                 props.controlsCard
                                               );
                                               const [
                                                 controlsCardLeft1,
                                                 setControlsCardLeft1,
                                               ] = React.useState(
                                                 props.controlsCardLeft1
                                               );
                                               const [
                                                 controlsCardLeft2,
                                                 setControlsCardLeft2,
                                               ] = React.useState(
                                                 props.controlsCardLeft2
                                               );
                                               const [
                                                 controlsCardLeft3,
                                                 setControlsCardLeft3,
                                               ] = React.useState(
                                                 props.controlsCardLeft3
                                               );

                                               const [
                                                 paramsCard,
                                                 setParamsCard,
                                               ] = React.useState(
                                                 props.paramsCard
                                               );
                                               const [
                                                 graphsCard,
                                                 setgraphsCard,
                                               ] = useState(props.graphsCard);
                                               const [
                                                 checkEqpActiveParam,
                                                 setcheckEqpActiveParam,
                                               ] = React.useState(
                                                 props.checkEqpActiveParam
                                               );
                                               const [
                                                 checkEqpAMStatusChiller,
                                                 setCheckEqpAMStatusChiller,
                                               ] = React.useState(
                                                 props.checkEqpAMStatusChiller
                                               );
                                               const [
                                                 deviceImage,
                                                 setDeviceImage,
                                               ] = useState(false);
                                               const [
                                                 allEquipmentData,
                                                 setAllEquipmentData,
                                               ] = React.useState([]);
                                               const [
                                                 particularEquipDataSet1,
                                                 setParticularEquipDataSet1,
                                               ] = useState([]);
                                               const [
                                                 particularEquipDataSet2,
                                                 setParticularEquipDataSet2,
                                               ] = useState([]);
                                               const [
                                                 selectedFan,
                                                 setSelectedFan,
                                               ] = useState(null);
                                               const [
                                                 particularEquipDataSet3,
                                                 setParticularEquipDataSet3,
                                               ] = useState([]);
                                               const [
                                                 particularEquipDataSet5,
                                                 setParticularEquipDataSet5,
                                               ] = useState([]);
                                               const [
                                                 particularEquipDataSet6,
                                                 setParticularEquipDataSet6,
                                               ] = useState([]);
                                               const [
                                                 particularEquipDataSet7,
                                                 setParticularEquipDataSet7,
                                               ] = useState([]);
                                               const [
                                                 particularEquipAMStatus,
                                                 setParticularEquipAMStatus,
                                               ] = useState(false);
                                               const normalizeStatus = (
                                                 val
                                               ) => {
                                                 if (
                                                   val === undefined ||
                                                   val === null
                                                 )
                                                   return val;
                                                 const s = String(val)
                                                   .trim()
                                                   .toLowerCase();
                                                 if (
                                                   s === "active" ||
                                                   s === "on" ||
                                                   s === "1" ||
                                                   s === "true"
                                                 )
                                                   return "active";
                                                 if (
                                                   s === "inactive" ||
                                                   s === "off" ||
                                                   s === "0" ||
                                                   s === "false"
                                                 )
                                                   return "inactive";
                                                 return val; // leave other values (e.g., 'tripped', numeric strings) untouched
                                               };
                                               // Helper: find attribute key in a case-insensitive way, with a
                                               // fallback that normalizes non-alphanumeric characters. Returns
                                               // the matching key or undefined.
                                               const findAttributeKey = (
                                                 attrs,
                                                 param
                                               ) => {
                                                 if (!attrs) return undefined;
                                                 const lower = String(
                                                   param
                                                 ).toLowerCase();
                                                 let key = Object.keys(
                                                   attrs
                                                 ).find(
                                                   (k) =>
                                                     k.toLowerCase() === lower
                                                 );
                                                 if (key) return key;
                                                 const norm = lower.replace(
                                                   /[^a-z0-9]/g,
                                                   ""
                                                 );
                                                 key = Object.keys(attrs).find(
                                                   (k) =>
                                                     k
                                                       .toLowerCase()
                                                       .replace(
                                                         /[^a-z0-9]/g,
                                                         ""
                                                       ) === norm
                                                 );
                                                 return key;
                                               };
                                               const [
                                                 eqpGraphList,
                                                 setEqpGraphList,
                                               ] = useState({});
                                               const [
                                                 eqp1dayGraphList,
                                                 setEqp1dayGraphList,
                                               ] = useState({});
                                               const [
                                                 chillerOnOff,
                                                 setChillerOnOff,
                                               ] = React.useState(0);
                                               const [
                                                 selectedChId,
                                                 setSelectedChId,
                                               ] = useState(
                                                 props.initialState1
                                               );
                                               const selectedChIdRef = useRef(
                                                 selectedChId
                                               );
                                               const [
                                                 selectedChName,
                                                 setSelectedChName,
                                               ] = useState(props.initialState);
                                               const [
                                                 openerr,
                                                 setOpenerr,
                                               ] = React.useState(false);
                                               const [
                                                 errmsg,
                                                 setErrmsg,
                                               ] = React.useState("");
                                               const [
                                                 chillerAlarm,
                                                 setChillerAlarm,
                                               ] = React.useState([]);
                                               const [
                                                 selectedChAlarm,
                                                 setSelectedChAlarm,
                                               ] = useState(
                                                 "DP high and SP normal"
                                               );
                                               const [
                                                 disable,
                                                 setDisable,
                                               ] = useState(false);
                                               const [
                                                 onOff1,
                                                 setOnOff1,
                                               ] = useState(2);
                                               const [
                                                 onOff2,
                                                 setOnOff2,
                                               ] = useState("");
                                               const [
                                                 remoteLocal,
                                                 setRemoteLocal,
                                               ] = useState(0);
                                               const [
                                                 snackbarOpen,
                                                 setSnackbarOpen,
                                               ] = React.useState(false);
                                               const [
                                                 errorMsg,
                                                 setErrorMsg,
                                               ] = React.useState("");
                                               const [
                                                 setPointvalue,
                                                 setSetPointvalue,
                                               ] = useState("");
                                               const CPM_Status = localStorage.getItem(
                                                 "CPM_AM_Status"
                                               );
                                               const CPM_Override_Status = localStorage.getItem(
                                                 "CPM_Override_Status"
                                               );
                                               const [
                                                 coolingTowerState,
                                                 setCoolingTowerState,
                                               ] = useState(null);
                                               // Update selectedChId when props.initialState1 changes (e.g., on component mount or route change)
                                               useEffect(() => {
                                                 if (props.initialState1) {
                                                   console.log(
                                                     "[GlCPMEqpType2] Setting selectedChId from props.initialState1:",
                                                     props.initialState1
                                                   );
                                                   setSelectedChId(
                                                     props.initialState1
                                                   );
                                                 }
                                               }, [props.initialState1]);

                                               // Immediately fetch graph data when selectedChId changes
                                               useEffect(() => {
                                                 if (selectedChId) {
                                                   console.log(
                                                     "[GlCPMEqpType2] Fetching graph data for selectedChId:",
                                                     selectedChId
                                                   );
                                                   fetchCoolingTowerState(
                                                     selectedChId
                                                   );
                                                   let req = {
                                                     startdate: "start",
                                                     enddate: "end",
                                                   };
                                                   api.floor
                                                     .getDeviceData(
                                                       req,
                                                       selectedChId,
                                                       eqpType,
                                                       "1 week"
                                                     )
                                                     .then((response) => {
                                                       console.log(
                                                         "[GlCPMEqpType2] Graph data fetched successfully"
                                                       );
                                                       setEqpGraphList(
                                                         response.graphData[0]
                                                       );
                                                       try {
                                                         // fetch cooling tower state whenever selectedChId changes
                                                       } catch (e) {
                                                         console.warn(
                                                           "fetchCoolingTowerState call failed on selectedChId change",
                                                           e
                                                         );
                                                       }
                                                     })
                                                     .catch((error) => {
                                                       console.log(
                                                         "[GlCPMEqpType2] Error fetching graph data:",
                                                         error
                                                       );
                                                       if (
                                                         error.response?.data
                                                           ?.message
                                                       ) {
                                                         setErrmsg(
                                                           error.response.data
                                                             .message
                                                         );
                                                       }
                                                     });
                                                 }
                                               }, [selectedChId]);

                                               const shouldDisable1 =
                                                 CPM_Status === "true" &&
                                                 remoteLocal === 1 &&
                                                 particularEquipAMStatus ===
                                                   true;
                                               const shouldDisable2 =
                                                 CPM_Status === "false" &&
                                                 (remoteLocal === 0 ||
                                                   remoteLocal === 1) &&
                                                 particularEquipAMStatus ===
                                                   true;
                                               const shouldDisable3 =
                                                 CPM_Status == "false" &&
                                                 remoteLocal === 1 &&
                                                 particularEquipAMStatus ==
                                                   true;
                                               // console.log("CPM_Status",CPM_Status,typeof CPM_Status,"remoteLocal",remoteLocal,typeof remoteLocal,"particularEquipAMStatus",particularEquipAMStatus,typeof particularEquipAMStatus);
                                               // console.log("shouldDisable1",shouldDisable1,"shouldDisable2",shouldDisable2,"shouldDisable3",shouldDisable3)
                                               // console.log("CPM_Status Type:", typeof CPM_Status, "Value:", CPM_Status);

                                               const iconDevice1 = new Leaflet.Icon(
                                                 {
                                                   iconUrl: require("../../assets/img/sensor-icon.png"),
                                                   iconSize: new Leaflet.Point(
                                                     0,
                                                     0
                                                   ),
                                                   className:
                                                     "leaflet-div-icon-2",
                                                 }
                                               );
                                               const iconDevice2 = new Leaflet.Icon(
                                                 {
                                                   // iconUrl: require("../../assets/img/Chiller_run_gif.gif"),
                                                   iconSize: new Leaflet.Point(
                                                     30,
                                                     40
                                                   ),
                                                   className:
                                                     "leaflet-div-icon-2",
                                                 }
                                               );
                                               const iconDevice3 = new Leaflet.Icon(
                                                 {
                                                   // iconUrl: require("../../assets/img/Chiller_trip_gif.gif"),
                                                   iconSize: new Leaflet.Point(
                                                     30,
                                                     40
                                                   ),
                                                   className:
                                                     "leaflet-div-icon-2",
                                                 }
                                               );
                                               const iconDevicee = new Leaflet.Icon({
                                                 iconUrl: require("../../assets/img/sampleIcon.png"),
                                                 iconSize: new Leaflet.Point(30, 40),
                                                 className: "leaflet-div-icon-2",
                                               });

                                               const formatter1 = new Intl.NumberFormat(
                                                 "en-US",
                                                 {
                                                   minimumFractionDigits: 1,
                                                   maximumFractionDigits: 1,
                                                 }
                                               );
                                               const formatter = new Intl.NumberFormat(
                                                 "en-US",
                                                 {
                                                   minimumFractionDigits: 2,
                                                   maximumFractionDigits: 2,
                                                 }
                                               );
                                               const modeOptions = [
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "Yes",
                                                   value: 0,
                                                   selectedBackgroundColor:
                                                     "green",
                                                 },
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "No",
                                                   value: 1,
                                                   selectedBackgroundColor:
                                                     "grey",
                                                 },
                                                 //  {
                                                 //   selectedFontColor: "white",
                                                 //   label: "AUTO",
                                                 //   value: 2,
                                                 //   selectedBackgroundColor: "#0123B4",
                                                 // }
                                               ];
                                               const options = [
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "OFF",
                                                   value: 0,
                                                   selectedBackgroundColor:
                                                     "gray",
                                                 },
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "ON",
                                                   value: 1,
                                                   selectedBackgroundColor:
                                                     "green",
                                                 },
                                                 //  {
                                                 //   selectedFontColor: "white",
                                                 //   label: "AUTO",
                                                 //   value: 2,
                                                 //   selectedBackgroundColor: "#0123B4",
                                                 // }
                                               ];

                                               const options1 = [
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "Close",
                                                   value: 0,
                                                   selectedBackgroundColor:
                                                     "gray",
                                                 },
                                                 {
                                                   selectedFontColor: "white",
                                                   label: "Open",
                                                   value: 1,
                                                   selectedBackgroundColor:
                                                     "green",
                                                 },
                                                 //  {
                                                 //   selectedFontColor: "white",
                                                 //   label: "AUTO",
                                                 //   value: 2,
                                                 //   selectedBackgroundColor: "#0123B4",
                                                 // }
                                               ];

                                               const handleLocationClick = (
                                                 name
                                               ) => {
                                                 props.history.push(
                                                   `/admin/Glschedule`
                                                 );
                                               };

                                               const handleChillerChange = (
                                                 name,
                                                 id
                                               ) => {
                                                 // console.log("idddd HCC",id,name)
                                                 setSelectedChId(id);
                                                 setSelectedChName(name);
                                                 Object.values(
                                                   allEquipmentData
                                                 ).map((res) => {
                                                   if (id === res.id) {
                                                     let eqpParams1 = [];
                                                     const chillerReLo =
                                                       res.Eqp_Metrics
                                                         .Equipment_mode == true
                                                         ? 0
                                                         : 1;
                                                     setRemoteLocal(
                                                       chillerReLo
                                                     );
                                                     const attrs_local =
                                                       res.Eqp_Attributes || {};
                                                     const statusKey_local = findAttributeKey(
                                                       attrs_local,
                                                       "CT_Fan_Run_SS"
                                                     );
                                                     const chillerStatus = statusKey_local
                                                       ? attrs_local[
                                                           statusKey_local
                                                         ]?.presentValue
                                                       : undefined;
                                                     const isChillerActive =
                                                       chillerStatus ===
                                                       "active";
                                                     setcheckEqpActiveParam(
                                                       isChillerActive
                                                     );
                                                     imageParams.forEach(
                                                       (respp) => {
                                                         const attrs =
                                                           res.Eqp_Attributes ||
                                                           {};
                                                         const attrKey = findAttributeKey(
                                                           attrs,
                                                           respp.parameter
                                                         );
                                                         const attribute = attrKey
                                                           ? attrs[attrKey]
                                                           : undefined;
                                                         const paramName =
                                                           respp.parameter ||
                                                           "";
                                                         const isSpeedParam = /actual_speed|speed|var_fan/i.test(
                                                           paramName
                                                         );
                                                         const forceShow =
                                                           !!respp.showWhenPresent ||
                                                           isSpeedParam;

                                                         if (
                                                           attribute !==
                                                           undefined
                                                         ) {
                                                           const pv =
                                                             attribute.presentValue;
                                                           let value = "-";
                                                           if (
                                                             forceShow ||
                                                             isChillerActive
                                                           ) {
                                                             if (
                                                               pv !==
                                                                 undefined &&
                                                               pv !== null &&
                                                               pv !== ""
                                                             ) {
                                                               const num = Number(
                                                                 pv
                                                               );
                                                               value = !isNaN(
                                                                 num
                                                               )
                                                                 ? formatter1.format(
                                                                     num
                                                                   )
                                                                 : String(pv);
                                                             } else {
                                                               value = "-";
                                                             }
                                                           } else {
                                                             value = "-";
                                                           }
                                                           eqpParams1.push({
                                                             ...respp,
                                                             value,
                                                             unit: forceShow
                                                               ? respp.unit
                                                               : isChillerActive
                                                               ? respp.unit
                                                               : "",
                                                           });
                                                         } else {
                                                           // still add placeholder so marker shows
                                                           eqpParams1.push({
                                                             ...respp,
                                                             value: "-",
                                                             unit: isChillerActive
                                                               ? respp.unit
                                                               : "",
                                                           });
                                                           console.debug &&
                                                             console.debug(
                                                               "Missing attr for",
                                                               respp.parameter,
                                                               "available:",
                                                               Object.keys(
                                                                 attrs
                                                               )
                                                             );
                                                         }
                                                       }
                                                     );
                                                     setParticularEquipDataSet1(
                                                       eqpParams1
                                                     );
                                                     setDeviceImage(true);

                                                     // let eqpParams2 = [];
                                                     // controlsCard.map((respp) => {
                                                     //   let value = respp.defaultValue;
                                                     //   if (res.Eqp_Metrics[respp.parameter] !== undefined) {
                                                     //     value = res.Eqp_Metrics[respp.parameter];
                                                     //   } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                                                     //     // normalize status-like values (ON/OFF, 1/0, true/false) to canonical 'active'/'inactive'
                                                     //     const raw = res.Eqp_Attributes[respp.parameter].presentValue;
                                                     //     value = normalizeStatus(raw);
                                                     //   }
                                                     //   eqpParams2.push({ ...respp, value });
                                                     //   setParticularEquipDataSet2(eqpParams2);
                                                     // })
                                                     let eqpParams2 = [];
                                                     const metrics =
                                                       res.Eqp_Metrics || {};
                                                     const attrs =
                                                       res.Eqp_Attributes || {};

                                                     controlsCard.forEach(
                                                       (respp) => {
                                                         let value =
                                                           respp.defaultValue;

                                                         if (
                                                           metrics[
                                                             respp.parameter
                                                           ] !== undefined
                                                         ) {
                                                           value =
                                                             metrics[
                                                               respp.parameter
                                                             ];
                                                         } else {
                                                           const attrKey = findAttributeKey(
                                                             attrs,
                                                             respp.parameter
                                                           );
                                                           const attr = attrKey
                                                             ? attrs[attrKey]
                                                             : undefined;

                                                           if (
                                                             attr &&
                                                             attr.presentValue !==
                                                               undefined
                                                           ) {
                                                             const raw =
                                                               attr.presentValue;
                                                             if (
                                                               respp.section ===
                                                               "Trip Status"
                                                             ) {
                                                               value = raw;
                                                             } else {
                                                               value = normalizeStatus(
                                                                 raw
                                                               );
                                                             }
                                                           }
                                                         }

                                                         eqpParams2.push({
                                                           ...respp,
                                                           value,
                                                         });
                                                       }
                                                     );
                                                     setParticularEquipDataSet2(
                                                       eqpParams2
                                                     );

                                                     let eqpParams3 = [];
                                                     paramsCard.map((respp) => {
                                                       if (
                                                         res.Eqp_Attributes[
                                                           respp.parameter
                                                         ] != undefined
                                                       ) {
                                                         eqpParams3.push({
                                                           ...respp,
                                                           value: formatter1.format(
                                                             res.Eqp_Attributes[
                                                               respp.parameter
                                                             ].presentValue
                                                           ),
                                                         });
                                                       } else {
                                                         eqpParams3.push({
                                                           ...respp,
                                                           value:
                                                             respp.defaultValue,
                                                         });
                                                       }
                                                     });
                                                     setParticularEquipDataSet3(
                                                       eqpParams3
                                                     );

                                                     let eqpParams4 = "";
                                                     checkEqpAMStatusChiller.forEach(
                                                       (respp) => {
                                                         const attr =
                                                           res
                                                             ?.Eqp_Attributes?.[
                                                             respp.parameter
                                                           ];
                                                         if (
                                                           attr &&
                                                           attr.presentValue !==
                                                             undefined
                                                         ) {
                                                           const pv =
                                                             attr.presentValue;
                                                           eqpParams4 = !isNaN(
                                                             parseFloat(pv)
                                                           )
                                                             ? Math.round(
                                                                 pv == "active"
                                                                   ? true
                                                                   : false
                                                               )
                                                             : pv == "active"
                                                             ? true
                                                             : false;
                                                         }
                                                       }
                                                     );
                                                     setParticularEquipAMStatus(
                                                       eqpParams4
                                                     );

                                                     let eqpParams5 = [];
                                                     controlsCardLeft1.map(
                                                       (respp) => {
                                                         const attribute =
                                                           res.Eqp_Attributes[
                                                             respp.parameter
                                                           ];
                                                         if (
                                                           attribute !==
                                                           undefined
                                                         ) {
                                                           eqpParams5.push({
                                                             ...respp,
                                                             value:
                                                               attribute.presentValue,
                                                             unit: respp.unit,
                                                           });
                                                         }
                                                         // setParticularEquipDataSet5(eqpParams5);
                                                       }
                                                     );
                                                     setParticularEquipDataSet5(
                                                       eqpParams5
                                                     );
                                                     let eqpParams6 = [];
                                                     controlsCardLeft2.map(
                                                       (respp) => {
                                                         const attribute =
                                                           res.Eqp_Attributes[
                                                             respp.parameter
                                                           ];
                                                         if (
                                                           attribute !==
                                                           undefined
                                                         ) {
                                                           eqpParams6.push({
                                                             ...respp,
                                                             value:
                                                               attribute.presentValue,
                                                             unit: respp.unit,
                                                           });
                                                         }
                                                         // setParticularEquipDataSet6(eqpParams6);
                                                       }
                                                     );
                                                     setParticularEquipDataSet6(
                                                       eqpParams6
                                                     );

                                                     let eqpParams7 = [];
                                                     controlsCardLeft3.map(
                                                       (respp) => {
                                                         const attribute =
                                                           res.Eqp_Attributes[
                                                             respp.parameter
                                                           ];
                                                         if (
                                                           attribute !==
                                                           undefined
                                                         ) {
                                                           eqpParams7.push({
                                                             ...respp,
                                                             value:
                                                               attribute.presentValue,
                                                             unit: respp.unit,
                                                           });
                                                         }
                                                       }
                                                     );
                                                     setParticularEquipDataSet7(
                                                       eqpParams7
                                                     );
                                                     if (id) {
                                                       // console.log("idddddddddddd",id)
                                                       let req = {
                                                         startdate: "start",
                                                         enddate: "end",
                                                       };
                                                       api.floor
                                                         .getDeviceData(
                                                           req,
                                                           res.id,
                                                           eqpType,
                                                           "1 week"
                                                         )
                                                         .then((response) => {
                                                           setEqpGraphList(
                                                             response
                                                               .graphData[0]
                                                           );
                                                         })
                                                         .catch((error) => {
                                                           // setOpenerr(true)
                                                           if (error.response) {
                                                             setErrmsg(
                                                               error.response
                                                                 .data.message
                                                             );
                                                           } else {
                                                             setErrmsg("");
                                                           }
                                                         });
                                                       // api.floor
                                                       //   .getDeviceData(id, eqpType, "1 DAY")
                                                       //   .then((response) => {
                                                       //     setEqp1dayGraphList(response.graphData[0]);
                                                       //   })
                                                       //   .catch((error) => {
                                                       //     //   setOpenerr(true)
                                                       //     if (error.response.data.message) {
                                                       //       setErrmsg(error.response.data.message);
                                                       //     } else {
                                                       //       setErrmsg("");
                                                       //     }
                                                       //   });
                                                     }
                                                   }
                                                 });
                                               };

                                               const handleerrorclose = () => {
                                                 setOpenerr(false);
                                                 setErrmsg("");
                                               };

                                               const handleChillerAlarmChange = (
                                                 message,
                                                 id
                                               ) => {
                                                 let data = {
                                                   id: id,
                                                   message: message,
                                                 };
                                                 setSelectedChAlarm(data);
                                               };

                                               const handleSubmitAlarmClick = (
                                                 data
                                               ) => {
                                                 // let ss_id = selectedChId, message = data.message
                                                 const req = {
                                                   ss_id: selectedChId,
                                                   message: data.message,
                                                 };
                                                 if (
                                                   selectedChId &&
                                                   data.message
                                                 ) {
                                                   setDisable(true);
                                                   setTimeout(() => {
                                                     setDisable(false);
                                                   }, 5000);

                                                   api.floor
                                                     .insertSelectedChillerAlarm(
                                                       req
                                                     )
                                                     .then((res) => {
                                                       // console.log("api resp",res)
                                                       // setOpenerr(true)
                                                       toast({
                                                         type: "success",
                                                         icon: "check circle",
                                                         title: "Success",
                                                         description:
                                                           "Fault injected",
                                                         time: 3000,
                                                       });
                                                     })
                                                     .catch((error) => {
                                                       //   setOpenerr(true)
                                                       if (
                                                         error.response.data
                                                           .message
                                                       ) {
                                                         setErrmsg(
                                                           error.response.data
                                                             .message
                                                         );
                                                       } else {
                                                         setErrmsg("");
                                                       }
                                                     });
                                                 } else {
                                                   if (
                                                     selectedChId != undefined
                                                   ) {
                                                     setOpenerr(true);
                                                     setErrmsg("Invalid");
                                                   } else if (data.message) {
                                                     setOpenerr(true);
                                                     setErrmsg(
                                                       "Please select the fault"
                                                     );
                                                   }
                                                 }
                                               };

                                               useEffect(() => {
                                                 // console.log("selectedChId",selectedChId)
                                                 selectedChIdRef.current = selectedChId;
                                                 api.floor
                                                   .cpmGetDevData()
                                                   .then((res) => {
                                                     if (res[eqpType]) {
                                                       let data = Object.values(
                                                         res[eqpType]
                                                       ).sort(function (a, b) {
                                                         return a.name > b.name
                                                           ? 1
                                                           : b.name > a.name
                                                           ? -1
                                                           : 0;
                                                       });
                                                       setAllEquipmentData(
                                                         data
                                                       );
                                                       setDeviceImage(true);
                                                     }
                                                     Object.values(
                                                       res[eqpType]
                                                     ).map((res) => {
                                                       if (
                                                         selectedChIdRef.current ===
                                                         res.id
                                                       ) {
                                                         let eqpParams1 = [];
                                                         const chillerReLo =
                                                           res.Eqp_Metrics
                                                             .Equipment_mode ==
                                                           true
                                                             ? 0
                                                             : 1;
                                                         setRemoteLocal(
                                                           chillerReLo
                                                         );
                                                         const attrs_local =
                                                           res.Eqp_Attributes ||
                                                           {};
                                                         const statusKey_local = findAttributeKey(
                                                           attrs_local,
                                                           "CT_Fan_Run_SS"
                                                         );
                                                         const chillerStatus = statusKey_local
                                                           ? attrs_local[
                                                               statusKey_local
                                                             ]?.presentValue
                                                           : undefined;
                                                         const isChillerActive =
                                                           chillerStatus ===
                                                           "active";
                                                         setcheckEqpActiveParam(
                                                           isChillerActive
                                                         );
                                                         imageParams.forEach(
                                                           (respp) => {
                                                             const attrs =
                                                               res.Eqp_Attributes ||
                                                               {};
                                                             const attrKey = findAttributeKey(
                                                               attrs,
                                                               respp.parameter
                                                             );
                                                             const attribute = attrKey
                                                               ? attrs[attrKey]
                                                               : undefined;
                                                             const paramName =
                                                               respp.parameter ||
                                                               "";
                                                             const isSpeedParam = /actual_speed|speed|var_fan/i.test(
                                                               paramName
                                                             );
                                                             const forceShow =
                                                               !!respp.showWhenPresent ||
                                                               isSpeedParam;

                                                             if (
                                                               attribute !==
                                                               undefined
                                                             ) {
                                                               const pv =
                                                                 attribute.presentValue;
                                                               let value = "-";
                                                               if (
                                                                 forceShow ||
                                                                 isChillerActive
                                                               ) {
                                                                 if (
                                                                   pv !==
                                                                     undefined &&
                                                                   pv !==
                                                                     null &&
                                                                   pv !== ""
                                                                 ) {
                                                                   const num = Number(
                                                                     pv
                                                                   );
                                                                   value = !isNaN(
                                                                     num
                                                                   )
                                                                     ? formatter1.format(
                                                                         num
                                                                       )
                                                                     : String(
                                                                         pv
                                                                       );
                                                                 } else {
                                                                   value = "-";
                                                                 }
                                                               } else {
                                                                 value = "-";
                                                               }
                                                               eqpParams1.push({
                                                                 ...respp,
                                                                 value,
                                                                 unit: forceShow
                                                                   ? respp.unit
                                                                   : isChillerActive
                                                                   ? respp.unit
                                                                   : "",
                                                               });
                                                             } else {
                                                               eqpParams1.push({
                                                                 ...respp,
                                                                 value: "-",
                                                                 unit: isChillerActive
                                                                   ? respp.unit
                                                                   : "",
                                                               });
                                                               console.debug &&
                                                                 console.debug(
                                                                   "Missing attr for",
                                                                   respp.parameter,
                                                                   "available:",
                                                                   Object.keys(
                                                                     attrs
                                                                   )
                                                                 );
                                                             }
                                                           }
                                                         );
                                                         setParticularEquipDataSet1(
                                                           eqpParams1
                                                         );

                                                         // let eqpParams2 = [];
                                                         // controlsCard.map((respp) => {
                                                         //
                                                         //       eqpParams2.push({
                                                         //       ...respp,
                                                         //       value: res.Eqp_Metrics[respp.parameter] // Add value here
                                                         //     })
                                                         //   }
                                                         //   console.log("bfr............",eqpParams2)
                                                         //  if (res.Eqp_Attributes[respp.parameter] != undefined){
                                                         //    console.log("---------------->><<",respp.parameter)
                                                         //     eqpParams2.push({
                                                         //       ...respp,
                                                         //       value: res.Eqp_Attributes[respp.parameter].presentValue // Add value here
                                                         //     })
                                                         //     console.log("............",eqpParams2)
                                                         //   }else{
                                                         //     eqpParams2.push({ ...respp,value: respp.defaultValue})
                                                         //   }
                                                         // })
                                                         // controlsCard.map((respp) => {
                                                         //   let value = respp.defaultValue;
                                                         //   if (res.Eqp_Metrics[respp.parameter] !== undefined) {
                                                         //     value = res.Eqp_Metrics[respp.parameter];
                                                         //   } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                                                         //     const raw = res.Eqp_Attributes[respp.parameter].presentValue;
                                                         //     value = normalizeStatus(raw);
                                                         //   }
                                                         //   eqpParams2.push({ ...respp, value });
                                                         //   setParticularEquipDataSet2(eqpParams2);
                                                         // });
                                                         let eqpParams2 = [];
                                                         const metrics =
                                                           res.Eqp_Metrics ||
                                                           {};
                                                         const attrs =
                                                           res.Eqp_Attributes ||
                                                           {};

                                                         controlsCard.forEach(
                                                           (respp) => {
                                                             let value =
                                                               respp.defaultValue;

                                                             if (
                                                               metrics[
                                                                 respp.parameter
                                                               ] !== undefined
                                                             ) {
                                                               // value coming from metrics
                                                               value =
                                                                 metrics[
                                                                   respp
                                                                     .parameter
                                                                 ];
                                                             } else {
                                                               // Try robust attribute lookup
                                                               const attrKey = findAttributeKey(
                                                                 attrs,
                                                                 respp.parameter
                                                               );
                                                               const attr = attrKey
                                                                 ? attrs[
                                                                     attrKey
                                                                   ]
                                                                 : undefined;

                                                               if (
                                                                 attr &&
                                                                 attr.presentValue !==
                                                                   undefined
                                                               ) {
                                                                 const raw =
                                                                   attr.presentValue;
                                                                 // For Trip Status, keep raw string (Normal/Active/etc.)
                                                                 if (
                                                                   respp.section ===
                                                                   "Trip Status"
                                                                 ) {
                                                                   value = raw;
                                                                 } else {
                                                                   value = normalizeStatus(
                                                                     raw
                                                                   );
                                                                 }
                                                               }
                                                             }
                                                             eqpParams2.push({
                                                               ...respp,
                                                               value,
                                                             });
                                                           }
                                                         );

                                                         setParticularEquipDataSet2(
                                                           eqpParams2
                                                         );

                                                         let eqpParams3 = [];
                                                         paramsCard.map(
                                                           (respp) => {
                                                             if (
                                                               res
                                                                 .Eqp_Attributes[
                                                                 respp.parameter
                                                               ] !== undefined
                                                             ) {
                                                               // ✅ Check in Eqp_Attributes
                                                               eqpParams3.push({
                                                                 ...respp,
                                                                 value: formatter1.format(
                                                                   res
                                                                     .Eqp_Attributes[
                                                                     respp
                                                                       .parameter
                                                                   ]
                                                                     .presentValue
                                                                 ), // ✅ Correct source
                                                               });
                                                             } else {
                                                               eqpParams3.push({
                                                                 ...respp,
                                                                 value:
                                                                   respp.defaultValue,
                                                               });
                                                             }
                                                           }
                                                         );
                                                         setParticularEquipDataSet3(
                                                           eqpParams3
                                                         );

                                                         let eqpParams4 = "";
                                                         checkEqpAMStatusChiller.forEach(
                                                           (respp) => {
                                                             const attr =
                                                               res
                                                                 ?.Eqp_Attributes?.[
                                                                 respp.parameter
                                                               ];
                                                             if (
                                                               attr &&
                                                               attr.presentValue !==
                                                                 undefined
                                                             ) {
                                                               const pv =
                                                                 attr.presentValue;
                                                               eqpParams4 = !isNaN(
                                                                 parseFloat(pv)
                                                               )
                                                                 ? Math.round(
                                                                     pv ==
                                                                       "active"
                                                                       ? true
                                                                       : false
                                                                   )
                                                                 : pv ==
                                                                   "active"
                                                                 ? true
                                                                 : false; // Add value here
                                                             }
                                                           }
                                                         );
                                                         setParticularEquipAMStatus(
                                                           eqpParams4
                                                         );

                                                         let eqpParams5 = [];
                                                         controlsCardLeft1.map(
                                                           (respp) => {
                                                             const attribute =
                                                               res
                                                                 .Eqp_Attributes[
                                                                 respp.parameter
                                                               ];
                                                             if (
                                                               attribute !==
                                                               undefined
                                                             ) {
                                                               eqpParams5.push({
                                                                 ...respp,
                                                                 value:
                                                                   attribute.presentValue,
                                                                 unit:
                                                                   respp.unit,
                                                               });
                                                             }
                                                             // setParticularEquipDataSet5(eqpParams5);
                                                           }
                                                         );
                                                         console.log(
                                                           "atttttttttttttttt",
                                                           eqpParams5
                                                         );
                                                         setParticularEquipDataSet5(
                                                           eqpParams5
                                                         );
                                                         let eqpParams6 = [];
                                                         controlsCardLeft2.map(
                                                           (respp) => {
                                                             const attribute =
                                                               res
                                                                 .Eqp_Attributes[
                                                                 respp.parameter
                                                               ];
                                                             if (
                                                               attribute !==
                                                               undefined
                                                             ) {
                                                               eqpParams6.push({
                                                                 ...respp,
                                                                 value:
                                                                   attribute.presentValue,
                                                                 unit:
                                                                   respp.unit,
                                                               });
                                                             }
                                                             // setParticularEquipDataSet6(eqpParams6);
                                                           }
                                                         );
                                                         setParticularEquipDataSet6(
                                                           eqpParams6
                                                         );

                                                         let eqpParams7 = [];
                                                         controlsCardLeft3.map(
                                                           (respp) => {
                                                             const attribute =
                                                               res
                                                                 .Eqp_Attributes[
                                                                 respp.parameter
                                                               ];
                                                             if (
                                                               attribute !==
                                                               undefined
                                                             ) {
                                                               eqpParams7.push({
                                                                 ...respp,
                                                                 value:
                                                                   attribute.presentValue,
                                                                 unit:
                                                                   respp.unit,
                                                               });
                                                             }
                                                           }
                                                         );
                                                         setParticularEquipDataSet7(
                                                           eqpParams7
                                                         );
                                                         if (res.id) {
                                                           let req = {
                                                             startdate: "start",
                                                             enddate: "end",
                                                           };
                                                           api.floor
                                                             .getDeviceData(
                                                               req,
                                                               res.id,
                                                               eqpType,
                                                               "1 week"
                                                             )
                                                             .then(
                                                               (response) => {
                                                                 setEqpGraphList(
                                                                   response
                                                                     .graphData[0]
                                                                 );
                                                               }
                                                             )
                                                             .catch((error) => {
                                                               // setOpenerr(true)
                                                               if (
                                                                 error.response
                                                               ) {
                                                                 setErrmsg(
                                                                   error
                                                                     .response
                                                                     .data
                                                                     .message
                                                                 );
                                                               } else {
                                                                 setErrmsg("");
                                                               }
                                                             });
                                                           // api.floor
                                                           //   .getDeviceData(res.id, eqpType, "1 DAY")
                                                           //   .then((response) => {
                                                           //     setEqp1dayGraphList(response.graphData[0]);
                                                           //   })
                                                           //   .catch((error) => {
                                                           //     // setOpenerr(true)
                                                           //     if (error.response) {
                                                           //       setErrmsg(error.response.data.message);
                                                           //     } else {
                                                           //       setErrmsg("");
                                                           //     }
                                                           //   });
                                                         }
                                                       }
                                                     });
                                                   })
                                                   .catch((error) => {
                                                     // console.log("errrrrrrrrrrrrr",error)
                                                     //   setOpenerr(true)
                                                     // if(error.response){
                                                     //   setErrmsg(error.response.data.message)
                                                     //   }else{
                                                     //     setErrmsg('')
                                                     //   }
                                                   });

                                                 let chillAlarm = [
                                                   {
                                                     id: "1",
                                                     alarm:
                                                       "DP high and SP normal",
                                                     Todisplay: "Fault-1",
                                                   },
                                                   {
                                                     id: "2",
                                                     alarm:
                                                       "DP high and SP high",
                                                     Todisplay: "Fault-2",
                                                   },
                                                   {
                                                     id: "3",
                                                     alarm:
                                                       "DP normal, SP low and DT normal",
                                                     Todisplay: "Fault-3",
                                                   },
                                                   {
                                                     id: "4",
                                                     alarm: "DP low and SP low",
                                                     Todisplay: "Fault-4",
                                                   },
                                                   {
                                                     id: "5",
                                                     alarm:
                                                       "DP normal, SP high and DT low",
                                                     Todisplay: "Fault-5",
                                                   },
                                                   {
                                                     id: "6",
                                                     alarm:
                                                       "DP normal, SP low and DT high",
                                                     Todisplay: "Fault-6",
                                                   },
                                                   {
                                                     id: "7",
                                                     alarm:
                                                       "DP normal, SP normal and DT high",
                                                     Todisplay: "Fault-7",
                                                   },
                                                 ];
                                                 setChillerAlarm(chillAlarm);

                                                 const timer = setInterval(
                                                   () => {
                                                     // console.log('selectedChId in interval------------>',selectedChIdRef.current)
                                                     if (
                                                       selectedChIdRef.current
                                                     ) {
                                                       // console.log("ppppppppppppppppppppppppppppppppppp")
                                                       api.floor
                                                         .cpmGetDevData()
                                                         .then((resp) => {
                                                           // resp may have different shape than the initial call (res[eqpType]).
                                                           // Log the equipment list for the configured eqpType to help debug
                                                           // cases where the periodic update is reading a different payload.
                                                           try {
                                                             console.log(
                                                               "[IntervalResp] selectedChId=",
                                                               selectedChIdRef.current,
                                                               "eqpType=",
                                                               eqpType,
                                                               "resp[eqpType]=",
                                                               resp &&
                                                                 resp[eqpType]
                                                             );
                                                           } catch (e) {
                                                             // swallow logging errors in older browsers
                                                           }

                                                           // Use the same eqpType keyed object as the initial load to ensure
                                                           // we iterate the correct equipment list. Fall back to an empty
                                                           // object if resp[eqpType] is not present.
                                                           Object.values(
                                                             resp[eqpType] || {}
                                                           ).map((res) => {
                                                             if (
                                                               selectedChIdRef.current ===
                                                               res.id
                                                             ) {
                                                               let eqpParams1 = [];
                                                               const chillerReLo =
                                                                 res.Eqp_Metrics
                                                                   .Equipment_mode ==
                                                                 true
                                                                   ? 0
                                                                   : 1;
                                                               setRemoteLocal(
                                                                 chillerReLo
                                                               );
                                                               const attrs_local =
                                                                 res.Eqp_Attributes ||
                                                                 {};
                                                               const statusKey_local = findAttributeKey(
                                                                 attrs_local,
                                                                 "CT_Fan_Run_SS"
                                                               );
                                                               const chillerStatus = statusKey_local
                                                                 ? attrs_local[
                                                                     statusKey_local
                                                                   ]
                                                                     ?.presentValue
                                                                 : undefined;
                                                               const isChillerActive =
                                                                 chillerStatus ===
                                                                 "active";
                                                               setcheckEqpActiveParam(
                                                                 isChillerActive
                                                               );
                                                               imageParams.forEach(
                                                                 (respp) => {
                                                                   const attrs =
                                                                     res.Eqp_Attributes ||
                                                                     {};
                                                                   const attrKey = findAttributeKey(
                                                                     attrs,
                                                                     respp.parameter
                                                                   );
                                                                   const attribute = attrKey
                                                                     ? attrs[
                                                                         attrKey
                                                                       ]
                                                                     : undefined;
                                                                   const paramName =
                                                                     respp.parameter ||
                                                                     "";
                                                                   const isSpeedParam = /actual_speed|speed|var_fan/i.test(
                                                                     paramName
                                                                   );
                                                                   const forceShow =
                                                                     !!respp.showWhenPresent ||
                                                                     isSpeedParam;

                                                                   if (
                                                                     attribute !==
                                                                     undefined
                                                                   ) {
                                                                     const pv =
                                                                       attribute.presentValue;
                                                                     let value =
                                                                       "-";
                                                                     if (
                                                                       forceShow ||
                                                                       isChillerActive
                                                                     ) {
                                                                       if (
                                                                         pv !==
                                                                           undefined &&
                                                                         pv !==
                                                                           null &&
                                                                         pv !==
                                                                           ""
                                                                       ) {
                                                                         const num = Number(
                                                                           pv
                                                                         );
                                                                         value = !isNaN(
                                                                           num
                                                                         )
                                                                           ? formatter1.format(
                                                                               num
                                                                             )
                                                                           : String(
                                                                               pv
                                                                             );
                                                                       } else {
                                                                         value =
                                                                           "-";
                                                                       }
                                                                     } else {
                                                                       value =
                                                                         "-";
                                                                     }
                                                                     eqpParams1.push(
                                                                       {
                                                                         ...respp,
                                                                         value,
                                                                         unit: forceShow
                                                                           ? respp.unit
                                                                           : isChillerActive
                                                                           ? respp.unit
                                                                           : "",
                                                                       }
                                                                     );
                                                                   } else {
                                                                     eqpParams1.push(
                                                                       {
                                                                         ...respp,
                                                                         value:
                                                                           "-",
                                                                         unit: isChillerActive
                                                                           ? respp.unit
                                                                           : "",
                                                                       }
                                                                     );
                                                                     console.debug &&
                                                                       console.debug(
                                                                         "Missing attr for",
                                                                         respp.parameter,
                                                                         "available:",
                                                                         Object.keys(
                                                                           attrs
                                                                         )
                                                                       );
                                                                   }
                                                                 }
                                                               );
                                                               setParticularEquipDataSet1(
                                                                 eqpParams1
                                                               );

                                                               // let eqpParams2 = [];
                                                               // controlsCard.map((respp) => {
                                                               //   let value = respp.defaultValue;
                                                               //   if (res.Eqp_Metrics[respp.parameter] !== undefined) {
                                                               //     value = res.Eqp_Metrics[respp.parameter];
                                                               //   } else if (
                                                               //     res.Eqp_Attributes[respp.parameter] !== undefined
                                                               //   ) {
                                                               //     const raw =
                                                               //       res.Eqp_Attributes[respp.parameter].presentValue;
                                                               //     value = normalizeStatus(raw);
                                                               //   }
                                                               //   eqpParams2.push({ ...respp, value });
                                                               //   setParticularEquipDataSet2(eqpParams2);
                                                               // });
                                                               let eqpParams2 = [];
                                                               const metrics =
                                                                 res.Eqp_Metrics ||
                                                                 {};
                                                               const attrs =
                                                                 res.Eqp_Attributes ||
                                                                 {};

                                                               controlsCard.forEach(
                                                                 (respp) => {
                                                                   let value =
                                                                     respp.defaultValue;

                                                                   if (
                                                                     metrics[
                                                                       respp
                                                                         .parameter
                                                                     ] !==
                                                                     undefined
                                                                   ) {
                                                                     // Value coming from metrics
                                                                     value =
                                                                       metrics[
                                                                         respp
                                                                           .parameter
                                                                       ];
                                                                   } else {
                                                                     // Robust attribute lookup (case-insensitive, ignores underscores etc.)
                                                                     const attrKey = findAttributeKey(
                                                                       attrs,
                                                                       respp.parameter
                                                                     );
                                                                     const attr = attrKey
                                                                       ? attrs[
                                                                           attrKey
                                                                         ]
                                                                       : undefined;

                                                                     if (
                                                                       attr &&
                                                                       attr.presentValue !==
                                                                         undefined
                                                                     ) {
                                                                       const raw =
                                                                         attr.presentValue;
                                                                       // For Trip Status, keep raw string (Normal/Active/etc.)
                                                                       if (
                                                                         respp.section ===
                                                                         "Trip Status"
                                                                       ) {
                                                                         value = raw;
                                                                       } else {
                                                                         value = normalizeStatus(
                                                                           raw
                                                                         );
                                                                       }
                                                                     }
                                                                   }

                                                                   eqpParams2.push(
                                                                     {
                                                                       ...respp,
                                                                       value,
                                                                     }
                                                                   );
                                                                 }
                                                               );

                                                               setParticularEquipDataSet2(
                                                                 eqpParams2
                                                               );

                                                               // setParticularEquipDataSet2(eqpParams2);
                                                               // console.log("eqpParams",eqpParams2)

                                                               let eqpParams3 = [];
                                                               paramsCard.map(
                                                                 (respp) => {
                                                                   if (
                                                                     res
                                                                       .Eqp_Attributes[
                                                                       respp
                                                                         .parameter
                                                                     ] !==
                                                                     undefined
                                                                   ) {
                                                                     eqpParams3.push(
                                                                       {
                                                                         ...respp,
                                                                         value: formatter1.format(
                                                                           res
                                                                             .Eqp_Attributes[
                                                                             respp
                                                                               .parameter
                                                                           ]
                                                                             .presentValue
                                                                         ),
                                                                       }
                                                                     );
                                                                   } else {
                                                                     eqpParams3.push(
                                                                       {
                                                                         ...respp,
                                                                         value:
                                                                           respp.defaultValue,
                                                                       }
                                                                     );
                                                                   }
                                                                 }
                                                               );
                                                               setParticularEquipDataSet3(
                                                                 eqpParams3
                                                               );

                                                               let eqpParams4 =
                                                                 "";
                                                               checkEqpAMStatusChiller.forEach(
                                                                 (respp) => {
                                                                   const attr =
                                                                     res
                                                                       ?.Eqp_Attributes?.[
                                                                       respp
                                                                         .parameter
                                                                     ];
                                                                   if (
                                                                     attr &&
                                                                     attr.presentValue !==
                                                                       undefined
                                                                   ) {
                                                                     const pv =
                                                                       attr.presentValue;
                                                                     eqpParams4 = !isNaN(
                                                                       parseFloat(
                                                                         pv
                                                                       )
                                                                     )
                                                                       ? Math.round(
                                                                           pv ==
                                                                             "active"
                                                                             ? true
                                                                             : false
                                                                         )
                                                                       : pv ==
                                                                         "active"
                                                                       ? true
                                                                       : false; // Add value here
                                                                   }
                                                                 }
                                                               );
                                                               setParticularEquipAMStatus(
                                                                 eqpParams4
                                                               );

                                                               let eqpParams5 = [];
                                                               controlsCardLeft1.map(
                                                                 (respp) => {
                                                                   const attribute =
                                                                     res
                                                                       .Eqp_Attributes[
                                                                       respp
                                                                         .parameter
                                                                     ];
                                                                   if (
                                                                     attribute !==
                                                                     undefined
                                                                   ) {
                                                                     eqpParams5.push(
                                                                       {
                                                                         ...respp,
                                                                         value:
                                                                           attribute.presentValue,
                                                                         unit:
                                                                           respp.unit,
                                                                       }
                                                                     );
                                                                   }
                                                                   // setParticularEquipDataSet5(eqpParams5);
                                                                 }
                                                               );
                                                               setParticularEquipDataSet5(
                                                                 eqpParams5
                                                               );
                                                               let eqpParams6 = [];
                                                               controlsCardLeft2.map(
                                                                 (respp) => {
                                                                   const attribute =
                                                                     res
                                                                       .Eqp_Attributes[
                                                                       respp
                                                                         .parameter
                                                                     ];
                                                                   if (
                                                                     attribute !==
                                                                     undefined
                                                                   ) {
                                                                     eqpParams6.push(
                                                                       {
                                                                         ...respp,
                                                                         value:
                                                                           attribute.presentValue,
                                                                         unit:
                                                                           respp.unit,
                                                                       }
                                                                     );
                                                                   }
                                                                   // setParticularEquipDataSet6(eqpParams6);
                                                                 }
                                                               );
                                                               setParticularEquipDataSet6(
                                                                 eqpParams6
                                                               );

                                                               let eqpParams7 = [];
                                                               controlsCardLeft3.map(
                                                                 (respp) => {
                                                                   const attribute =
                                                                     res
                                                                       .Eqp_Attributes[
                                                                       respp
                                                                         .parameter
                                                                     ];
                                                                   if (
                                                                     attribute !==
                                                                     undefined
                                                                   ) {
                                                                     eqpParams7.push(
                                                                       {
                                                                         ...respp,
                                                                         value:
                                                                           attribute.presentValue,
                                                                         unit:
                                                                           respp.unit,
                                                                       }
                                                                     );
                                                                   }
                                                                 }
                                                               );
                                                               setParticularEquipDataSet7(
                                                                 eqpParams7
                                                               );
                                                               if (
                                                                 selectedChIdRef.current
                                                               ) {
                                                                 let req = {
                                                                   startdate:
                                                                     "start",
                                                                   enddate:
                                                                     "end",
                                                                 };
                                                                 api.floor
                                                                   .getDeviceData(
                                                                     req,
                                                                     selectedChIdRef.current,
                                                                     eqpType,
                                                                     "1 week"
                                                                   )
                                                                   .then(
                                                                     (
                                                                       response
                                                                     ) => {
                                                                       setEqpGraphList(
                                                                         response
                                                                           .graphData[0]
                                                                       );
                                                                     }
                                                                   )
                                                                   .catch(
                                                                     (
                                                                       error
                                                                     ) => {
                                                                       //   setOpenerr(true)
                                                                       if (
                                                                         error
                                                                           .response
                                                                           .data
                                                                           .message
                                                                       ) {
                                                                         setErrmsg(
                                                                           error
                                                                             .response
                                                                             .data
                                                                             .message
                                                                         );
                                                                       } else {
                                                                         setErrmsg(
                                                                           ""
                                                                         );
                                                                       }
                                                                     }
                                                                   );
                                                                 // api.floor
                                                                 //   .getDeviceData(selectedChIdRef.current, eqpType, "1 DAY")
                                                                 //   .then((response) => {
                                                                 //     setEqp1dayGraphList(response.graphData[0]);
                                                                 //   })
                                                                 //   .catch((error) => {
                                                                 //     //   setOpenerr(true)
                                                                 //     if (error.response.data.message) {
                                                                 //       setErrmsg(error.response.data.message);
                                                                 //     } else {
                                                                 //       setErrmsg("");
                                                                 //     }
                                                                 //   });
                                                               }
                                                             }
                                                           });
                                                         })
                                                         .catch((error) => {
                                                           //   setOpenerr(true)
                                                           if (error.response) {
                                                             setErrmsg(
                                                               error.response
                                                                 .data.message
                                                             );
                                                           } else {
                                                             setErrmsg("");
                                                           }
                                                         });
                                                     }
                                                   },
                                                   5000
                                                 );
                                                 return () =>
                                                   clearInterval(timer);
                                               }, [
                                                 selectedChId,
                                                 props.initialState1,
                                               ]);
                                               console.log(
                                                 "ALL FAN PARAMETERS REAL:",
                                                 particularEquipDataSet2.filter(
                                                   (x) =>
                                                     x.title
                                                       ?.toLowerCase()
                                                       .includes("fan") ||
                                                     x.parameter
                                                       ?.toLowerCase()
                                                       .includes("fan")
                                                 )
                                               );

                                               // const onChange = (newValue) => {
                                               //   setChillerOnOff(newValue)
                                               //   let id= selectedChId;
                                               //   let action= newValue == 0? "TURN_OFF_CHILLER":"TURN_ON_CHILLER";
                                               //   let ss_type= "NONGL_SS_CHILLER";
                                               //   let param_id= eqpType=='NONGL_SS_AHU'?'SAF_VFD_On_Off_Fbk':'FAU_On_Off'
                                               //   let req={
                                               //       id,
                                               //       action,
                                               //       ss_type
                                               //   }
                                               //   api.floor.cpmOnOffControl(req).then((response)=>{
                                               //     setChillerOnOff(response.startsWith('Working with a Scenario')?(newValue == 0?1:0):newValue)
                                               //     toast({
                                               //       type:  response.startsWith('Working with a Scenario')?"error":"success",
                                               //       icon:  response.startsWith('Working with a Scenario')?"exclamation triangle":"check circle",
                                               //       title: response.startsWith('Working with a Scenario')?"Error":"Success",
                                               //       description: response,
                                               //       time: 2000,
                                               //     });

                                               //   })
                                               //   .catch((err)=>{
                                               //   //   setOpenerr(true)
                                               //     setErrmsg(err)
                                               //   })
                                               // };

                                               const onChangeMode = (
                                                 newValue
                                               ) => {
                                                 let id = selectedChId;
                                                 const Equipment_mode =
                                                   newValue === 0
                                                     ? true
                                                     : false;

                                                 const req = {
                                                   id,
                                                   ss_type: eqpType,
                                                   Equipment_mode,
                                                 };

                                                 api.floor
                                                   .chillerMode(req)
                                                   .then((res) => {
                                                     if (res) {
                                                       setRemoteLocal(newValue);
                                                       toast({
                                                         type: "success",
                                                         icon: "check circle",
                                                         title: "Success",
                                                         description: `Successfully controlled`,
                                                         time: 2000,
                                                       });
                                                     }
                                                   })
                                                   .catch((error) => {
                                                     if (error.response) {
                                                       setSnackbarOpen(true);
                                                       setErrorMsg(
                                                         error.response.data
                                                           .message
                                                       );
                                                     }
                                                   });
                                               };
                                               const fetchCoolingTowerState = async (
                                                 ss_id
                                               ) => {
                                                 if (!ss_id)
                                                   return Promise.resolve(null);

                                                 const req = { ss_id };
                                                 const response = await api.floor.ctState(
                                                   req
                                                 );
                                                 console.log(
                                                   "qqqqqqqqqqqqqqqqqqqq",
                                                   response
                                                 );
                                                 try {
                                                   // const s =
                                                   //   response !== null && response !== undefined
                                                   //     ? String(response).toLowerCase()
                                                   //     : null;
                                                   // const isOn =
                                                   //   s === "active" ||
                                                   //   s === true ||
                                                   //   s === "on" ||
                                                   //   s === "1" ||
                                                   //   s === "1.0" ||
                                                   //   s === 1;
                                                   const s =
                                                     response !== null &&
                                                     response !== undefined
                                                       ? String(
                                                           response
                                                         ).toLowerCase()
                                                       : null;
                                                   const isOn =
                                                     s === "active" ||
                                                     s === "on" ||
                                                     s === "1" ||
                                                     s === "1.0" ||
                                                     s === true;
                                                   setOnOff2(isOn ? 1 : 0);
                                                   // setOnOff2(response);
                                                 } catch (e) {
                                                   console.warn(
                                                     "Error mapping CT state to UI onOnOff1",
                                                     e
                                                   );
                                                 }
                                                 // try {
                                                 //   const response = await api.floor.ctState(req);
                                                 //   console.log("CT API response:", response);
                                                 //   // response shape may vary; be defensive and check common places
                                                 //   const state =
                                                 //     (response && response.state) ||
                                                 //     (response && response.status) ||
                                                 //     (response && response.data && response.data.state) ||
                                                 //     (response && response.data && response.data.status) ||
                                                 //     null;
                                                 //   console.log("CT State Response:", response, "-> state:", state);
                                                 //   if (state !== null) setCoolingTowerState(state);
                                                 //   console.log("Cooling tower state changed:", coolingTowerState);
                                                 //   return state;
                                                 // } catch (error) {
                                                 //   console.error("Error fetching CT state:", error);
                                                 //   if (error && error.response) {
                                                 //     console.error(
                                                 //       "Error message:",
                                                 //       error.response.data && error.response.data.message
                                                 //     );
                                                 //   }
                                                 //   return null;
                                                 // }
                                               };

                                               const onChange = (newValue) => {
                                                 // setChillerOnOff(newValue)
                                                 setDisable(true);
                                                 setTimeout(() => {
                                                   setDisable(false);
                                                 }, 30000);

                                                 let id = selectedChId;
                                                 const msg =
                                                   newValue === 1
                                                     ? "ON"
                                                     : "OFF";
                                                 // const va = 1; // Always 1 for both ON and OFF
                                                 const va = newValue;
                                                 const gl_command =
                                                   newValue === 1
                                                     ? "active"
                                                     : "inactive";

                                                 // setOnOff1(va);
                                                 setOnOff2(va);
                                                 const req = {
                                                   ss_type: props.eqpType,
                                                   ss_id: id,
                                                   param_id:
                                                     props.eqpType ===
                                                     "NONGL_SS_COOLING_TOWER"
                                                       ? "cmd_outlet_vlv_on_off_00"
                                                       : "",
                                                   gl_command,
                                                   value: msg,
                                                   zone_type: null,
                                                   zone_id: null,
                                                   commandFrom: "UI",
                                                 };

                                                 // const req1 = {
                                                 //   gl_command,
                                                 //   ss_id: id,
                                                 // };
                                                 const req1 = {
                                                   ss_type: props.eqpType,
                                                   ss_id: id,
                                                   param_id:
                                                     props.eqpType ===
                                                     "NONGL_SS_COOLING_TOWER"
                                                       ? "CT_VAR_FAN_On_Off_Cmd"
                                                       : "",
                                                   gl_command,
                                                   value: msg,
                                                   zone_type: null,
                                                   zone_id: null,
                                                   commandFrom: "UI",
                                                 };

                                                 console.log(
                                                   "reqqqqqqqqqq",
                                                   req
                                                 );
                                                 // api.floor
                                                 //   .cpmOnOffControl(req)
                                                 api.floor
                                                   .coolingTowerControls(req1)
                                                   .then((res) => {
                                                     // console.log("newValue",res)

                                                     if (
                                                       res.message ===
                                                       "please connect to network"
                                                     ) {
                                                       setOnOff1(
                                                         va === 1 ? 0 : 1
                                                       );
                                                       toast({
                                                         type: "error",
                                                         icon:
                                                           "exclamation triangle",
                                                         title: "Error",
                                                         description:
                                                           "Connect to network",
                                                         time: 2000,
                                                       });
                                                     } else if (req.ss_id) {
                                                       let requestID =
                                                         req.ss_id;
                                                       setOnOff1(va);
                                                       toast({
                                                         type: "success",
                                                         icon: "check circle",
                                                         title: "Success",
                                                         description: `Successfully controlled: ${msg}`,
                                                         time: 2000,
                                                       });
                                                       const checkCommandStatus = (
                                                         requestID,
                                                         startTime = Date.now()
                                                       ) => {
                                                         api.floor
                                                           .checkCommandStatus(
                                                             requestID
                                                           )
                                                           .then((res) => {
                                                             // console.log("commansattaus",res)
                                                             if (
                                                               res[0].status ===
                                                               "success"
                                                             ) {
                                                               // Command was successful, stop further API calls
                                                               console.log(
                                                                 "Command succeeded"
                                                               );
                                                               toast({
                                                                 type:
                                                                   "success",
                                                                 icon:
                                                                   "check circle",
                                                                 title:
                                                                   "Command Status",
                                                                 description:
                                                                   "Command processed successfully",
                                                                 time: 2000,
                                                               });
                                                               // After success, fetch the real CT state from backend and update the UI switch
                                                               // fetchCoolingTowerState(requestID).then((state) => {
                                                               //   try {
                                                               //     const s =
                                                               //       state !== null && state !== undefined
                                                               //         ? String(state).toLowerCase()
                                                               //         : null;
                                                               //     const isOn =
                                                               //       s === "active" ||
                                                               //       s === true ||
                                                               //       s === "on" ||
                                                               //       s === "1" ||
                                                               //       s === "1.0" ||
                                                               //       s === 1;
                                                               //     setOnOff2(isOn ? 1 : 0);
                                                               //   } catch (e) {
                                                               //     console.warn("Error mapping CT state to UI onOnOff1", e);
                                                               //   }
                                                               // });
                                                             } else if (
                                                               res[0].status ===
                                                               "pending"
                                                             ) {
                                                               console.log(
                                                                 "Command is still Pending"
                                                               );
                                                               const elapsedTime =
                                                                 Date.now() -
                                                                 startTime;

                                                               if (
                                                                 elapsedTime <
                                                                 30000
                                                               ) {
                                                                 console.log(
                                                                   " If less than 30 seconds have passed, keep checking every 3 seconds"
                                                                 );
                                                                 setTimeout(
                                                                   () =>
                                                                     checkCommandStatus(
                                                                       requestID,
                                                                       startTime
                                                                     ),
                                                                   3000
                                                                 );
                                                               } else {
                                                                 console.log(
                                                                   "Stop checking after 30 seconds and show a timeout message"
                                                                 );
                                                                 console.log(
                                                                   "Command timed out after 30 seconds."
                                                                 );
                                                                 toast({
                                                                   type:
                                                                     "error",
                                                                   icon:
                                                                     "clock",
                                                                   title:
                                                                     "Timeout",
                                                                   description:
                                                                     "Command is still pending after 30 seconds.",
                                                                   time: 5000,
                                                                 });
                                                               }
                                                             }
                                                           })
                                                           .catch((error) => {
                                                             console.error(
                                                               "Error checking command status:",
                                                               error
                                                             );
                                                             // toast({
                                                             //   type: "error",
                                                             //   icon: "exclamation triangle",
                                                             //   title: "Error",
                                                             //   description: "Error while checking command status",
                                                             //   time: 2000,
                                                             // });
                                                           });
                                                       };

                                                       checkCommandStatus(
                                                         requestID
                                                       );
                                                     }
                                                   })
                                                   .catch((error) => {
                                                     if (error.response) {
                                                       setSnackbarOpen(true);
                                                       setErrorMsg(
                                                         error.response.data
                                                           .message
                                                       );
                                                     }
                                                   });
                                                 // (moved fetchCoolingTowerState to top-level so other handlers can call it)
                                               };

                                               const onChange1 = (newValue) => {
                                                 // setChillerOnOff(newValue)
                                                 setDisable(true);
                                                 setTimeout(() => {
                                                   setDisable(false);
                                                 }, 30000);

                                                 let id = selectedChId;
                                                 const msg =
                                                   newValue === 1
                                                     ? "ON"
                                                     : "OFF";
                                                 const va = 1; // Always 1 for both ON and OFF
                                                 const gl_command =
                                                   newValue === 1
                                                     ? "active"
                                                     : "inactive";

                                                 setOnOff1(va);

                                                 const req = {
                                                   ss_type: props.eqpType,
                                                   ss_id: id,
                                                   param_id:
                                                     props.eqpType ===
                                                     "NONGL_SS_COOLING_TOWER"
                                                       ? "cmd_outlet_vlv_on_off_00"
                                                       : "",
                                                   gl_command: gl_command,
                                                   value: msg,
                                                   zone_type: null,
                                                   zone_id: null,
                                                   commandFrom: "UI",
                                                 };

                                                 api.floor
                                                   .coolingTowerValve(req)
                                                   .then((res) => {
                                                     console.log(
                                                       "newValue",
                                                       res
                                                     );

                                                     if (
                                                       res.message ===
                                                       "please connect to network"
                                                     ) {
                                                       setOnOff1(
                                                         va === 1 ? 0 : 1
                                                       );
                                                       toast({
                                                         type: "error",
                                                         icon:
                                                           "exclamation triangle",
                                                         title: "Error",
                                                         description:
                                                           "Connect to network",
                                                         time: 2000,
                                                       });
                                                     } else if (req.ss_id) {
                                                       let requestID =
                                                         req.ss_id;
                                                       setOnOff1(va);
                                                       toast({
                                                         type: "success",
                                                         icon: "check circle",
                                                         title: "Success",
                                                         description: `Successfully controlled: ${msg}`,
                                                         time: 2000,
                                                       });
                                                       const checkCommandStatus = (
                                                         requestID,
                                                         startTime = Date.now()
                                                       ) => {
                                                         api.floor
                                                           .checkCommandStatus(
                                                             requestID
                                                           )
                                                           .then((res) => {
                                                             console.log(
                                                               "commansattaus",
                                                               res
                                                             );
                                                             if (
                                                               res[0].status ===
                                                               "success"
                                                             ) {
                                                               // Command was successful, stop further API calls
                                                               console.log(
                                                                 "Command succeeded"
                                                               );
                                                               toast({
                                                                 type:
                                                                   "success",
                                                                 icon:
                                                                   "check circle",
                                                                 title:
                                                                   "Command Status",
                                                                 description:
                                                                   "Command processed successfully",
                                                                 time: 2000,
                                                               });
                                                               // After success, fetch the real CT state and update the UI switch
                                                               // fetchCoolingTowerState(requestID).then((state) => {
                                                               //   try {
                                                               //     const s =
                                                               //       state !== null && state !== undefined
                                                               //         ? String(state).toLowerCase()
                                                               //         : null;
                                                               //     const isOn =
                                                               //       s === "active" || s === "on" || s === "1" || s === true;
                                                               //     setOnOff2(isOn ? 1 : 0);
                                                               //   } catch (e) {
                                                               //     console.warn("Error mapping CT state to UI onOnOff1", e);
                                                               //   }
                                                               // });
                                                             } else if (
                                                               res[0].status ===
                                                               "pending"
                                                             ) {
                                                               console.log(
                                                                 "Command is still Pending"
                                                               );
                                                               const elapsedTime =
                                                                 Date.now() -
                                                                 startTime;

                                                               if (
                                                                 elapsedTime <
                                                                 30000
                                                               ) {
                                                                 console.log(
                                                                   " If less than 30 seconds have passed, keep checking every 3 seconds"
                                                                 );
                                                                 setTimeout(
                                                                   () =>
                                                                     checkCommandStatus(
                                                                       requestID,
                                                                       startTime
                                                                     ),
                                                                   3000
                                                                 );
                                                               } else {
                                                                 console.log(
                                                                   "Stop checking after 30 seconds and show a timeout message"
                                                                 );
                                                                 console.log(
                                                                   "Command timed out after 30 seconds."
                                                                 );
                                                                 toast({
                                                                   type:
                                                                     "error",
                                                                   icon:
                                                                     "clock",
                                                                   title:
                                                                     "Timeout",
                                                                   description:
                                                                     "Command is still pending after 30 seconds.",
                                                                   time: 5000,
                                                                 });
                                                               }
                                                             }
                                                           })
                                                           .catch((error) => {
                                                             console.error(
                                                               "Error checking command status:",
                                                               error
                                                             );
                                                             // toast({
                                                             //   type: "error",
                                                             //   icon: "exclamation triangle",
                                                             //   title: "Error",
                                                             //   description: "Error while checking command status",
                                                             //   time: 2000,
                                                             // });
                                                           });
                                                       };

                                                       checkCommandStatus(
                                                         requestID
                                                       );
                                                     }
                                                   })
                                                   .catch((error) => {
                                                     if (error.response) {
                                                       setSnackbarOpen(true);
                                                       setErrorMsg(
                                                         error.response.data
                                                           .message
                                                       );
                                                     }
                                                   });
                                               };

                                               // const ChipMethod = (props) => {
                                               //   // Determine background color based on section and value
                                               //   let backgroundColor = "#0123B4"; // default blue

                                               //   if (
                                               //     props.section === "Fan Status" &&
                                               //     (props.title === "Fan-1" ||
                                               //       props.title === "Fan-2" ||
                                               //       props.title === "Fan-3")
                                               //   ) {
                                               //     // Fan Status: Green for ON, Grey for OFF
                                               //     backgroundColor = props.value === "active" ? "#4caf50" : "#9e9e9e";
                                               //   } else if (
                                               //     props.section === "Trip Status" &&
                                               //     (props.title === "Fan-1" ||
                                               //       props.title === "Fan-2" ||
                                               //       props.title === "Fan-3")
                                               //   ) {
                                               //     // Trip Status: Red for Tripped, Grey for Normal
                                               //     backgroundColor = props.value !== "inactive" ? "#f44336" : "#9e9e9e";
                                               //   }

                                               //   return (
                                               //     <Paper
                                               //       className={classes.controls_paper}
                                               //       style={{ backgroundColor: backgroundColor, justifyContent: "center" }}
                                               //     >
                                               //       <div
                                               //         style={{
                                               //           color: "white",
                                               //           fontSize: props.textSize ? props.textSize : undefined,
                                               //         }}
                                               //       >
                                               //         {props.title === "Motorized Valve Status" ? (
                                               //           <>
                                               //             {props.value === "inactive" || props.value === "closed"
                                               //               ? "Closed"
                                               //               : "Open"}
                                               //           </>
                                               //         ) : props.title === "Cooling Tower Mode" ? (
                                               //           <>{CPM_Status === "true" ? "Auto" : "Manual"}</>
                                               //         ) : props.title === "Compressor 1" ? (
                                               //           <>{props.value === "inactive" ? "OFF" : "ON"}</>
                                               //         ) : props.title === "Run Status" ? (
                                               //           <>{props.value === "inactive" ? "Inactive" : "Active"}</>
                                               //         ) : props.title === "Run Hours" ? (
                                               //           <>
                                               //             {(() => {
                                               //               const raw = props.value ?? props.defaultValue;
                                               //               const num = Number(raw);
                                               //               if (Number.isFinite(num)) {
                                               //                 return num.toFixed(2) + (props.unit || "");
                                               //               }

                                               //               return raw !== undefined && raw !== null && raw !== ""
                                               //                 ? String(raw) + (props.unit || "")
                                               //                 : props.defaultValue + (props.unit || "");
                                               //             })()}
                                               //           </>
                                               //         ) : props.title === "Fan-1" ||
                                               //           props.title === "Fan-2" ||
                                               //           props.title === "Fan-3" ? (
                                               //           <>
                                               //             {/* Check if this is under "Fan Status" or "Trip Status" section */}
                                               //             {props.section === "Fan Status" ? (
                                               //               <>{props.value === "active" ? "ON" : "OFF"}</>
                                               //             ) : props.section === "Trip Status" ? (
                                               //               <>{props.value === "inactive" ? "Normal" : "Tripped"}</>
                                               //             ) : (
                                               //               <>{props.value}</>
                                               //             )}
                                               //           </>
                                               //         ) : props.title === "Level Status" ? (
                                               //           <>{props.value === "inactive" ? "Normal" : "Low"}</>
                                               //         ) : props.title === "Wet Bulb Temp[°C]" ? (
                                               //           <>
                                               //             {props.value !== undefined && props.value !== ""
                                               //               ? formatter.format(props.value)
                                               //               : props.defaultValue}
                                               //             {props.unit}
                                               //           </>
                                               //         ) : (
                                               //           <>
                                               //             {props.value ? formatter.format(props.value) : props.defaultValue}
                                               //             {props.unit}
                                               //           </>
                                               //         )}
                                               //       </div>
                                               //     </Paper>
                                               //   );
                                               // };
                                               const ChipMethod = (props) => {
                                                 // Determine background color based on section and value
                                                 let backgroundColor =
                                                   "#0123B4"; // default blue

                                                 // Helper to normalize boolean-ish flags
                                                 const norm = (val) => {
                                                   if (
                                                     val === undefined ||
                                                     val === null
                                                   )
                                                     return "";
                                                   const s = String(val)
                                                     .trim()
                                                     .toLowerCase();
                                                   return s;
                                                 };

                                                 // // Fan RUN status chips (Fan Status section)
                                                 // if (
                                                 //   props.section === "Fan Status" &&
                                                 //   (props.title === "Fan-1" ||
                                                 //     props.title === "Fan-2" ||
                                                 //     props.title === "Fan-3")
                                                 // ) {
                                                 //   const s = norm(props.value);
                                                 //   const isOn = s === "active" || s === "on" || s === "1" || s === "true";
                                                 //   // Green for ON, Grey for OFF
                                                 //   backgroundColor = isOn ? "#4caf50" : "#9e9e9e";
                                                 // }
                                                 // // Fan TRIP status chips (Trip Status section)
                                                 // else if (
                                                 //   props.section === "Trip Status" &&
                                                 //   (props.title === "Fan-1" ||
                                                 //     props.title === "Fan-2" ||
                                                 //     props.title === "Fan-3")
                                                 // )
                                                 {
                                                   const s = norm(props.value);
                                                   // Consider only active/tripped/1/true/alarm as TRIPPED
                                                   const isTripped =
                                                     s === "active" ||
                                                     s === "tripped" ||
                                                     s === "1" ||
                                                     s === "true" ||
                                                     s === "alarm";
                                                   // Red if tripped, Grey if normal/inactive
                                                   backgroundColor = isTripped
                                                     ? "#f44336"
                                                     : "#9e9e9e";
                                                 }

                                                 return (
                                                   <Paper
                                                     className={
                                                       classes.controls_paper
                                                     }
                                                     style={{
                                                       backgroundColor:
                                                         "#0123B4",
                                                       justifyContent: "center",
                                                     }}
                                                   >
                                                     <div
                                                       style={{
                                                         color: "white",
                                                         fontSize: props.textSize
                                                           ? props.textSize
                                                           : undefined,
                                                       }}
                                                     >
                                                       {props.title ===
                                                       "Cooling Tower Fan" ? (
                                                         <>
                                                           {props.value ===
                                                             "inactive" ||
                                                           props.value ===
                                                             "off" ||
                                                           props.value ===
                                                             "0" ||
                                                           parseInt(
                                                             props.value
                                                           ) === 0
                                                             ? "OFF"
                                                             : "ON"}
                                                         </>
                                                       ) : props.title ===
                                                         "Motorized Valve Status" ? (
                                                         <>
                                                           {props.value ===
                                                             "inactive" ||
                                                           props.value ===
                                                             "closed" ||
                                                           parseInt(
                                                             props.value
                                                           ) === 0
                                                             ? "Closed"
                                                             : "Open"}
                                                         </>
                                                       ) : props.title ===
                                                         "Cooling Tower Mode" ? (
                                                         <>
                                                           {CPM_Status ===
                                                           "true"
                                                             ? "Auto"
                                                             : "Manual"}
                                                         </>
                                                       ) : props.title ===
                                                         "Compressor 1" ? (
                                                         <>
                                                           {props.value ===
                                                           "inactive"
                                                             ? "OFF"
                                                             : "ON"}
                                                         </>
                                                       ) : props.title ===
                                                           "Run Status" ||
                                                         props.title ===
                                                           "Fan Status" ||
                                                         props.title ===
                                                           "Trip Status" ? (
                                                         <>
                                                           {props.value ===
                                                             "inactive" ||
                                                           props.value ===
                                                             "Inactive"
                                                             ? "Inactive"
                                                             : "Active"}
                                                         </>
                                                       ) : props.title ===
                                                         "Run Hours" ? (
                                                         <>
                                                           {(() => {
                                                             const raw =
                                                               props.value ??
                                                               props.defaultValue;
                                                             const num = Number(
                                                               raw
                                                             );
                                                             if (
                                                               Number.isFinite(
                                                                 num
                                                               )
                                                             ) {
                                                               return (
                                                                 num.toFixed(
                                                                   2
                                                                 ) +
                                                                 (props.unit ||
                                                                   "")
                                                               );
                                                             }

                                                             return raw !==
                                                               undefined &&
                                                               raw !== null &&
                                                               raw !== ""
                                                               ? String(raw) +
                                                                   (props.unit ||
                                                                     "")
                                                               : props.defaultValue +
                                                                   (props.unit ||
                                                                     "");
                                                           })()}
                                                         </>
                                                       ) : // : props.title === "Fan-1" ||
                                                       //   props.title === "Fan-2" ||
                                                       //   props.title === "Fan-3" ? (
                                                       //   <>
                                                       //     {/* Fan-1/2/3 under different sections */}
                                                       //     {props.section === "Fan Status" ? (
                                                       //       // Run status label
                                                       //       <>
                                                       //         {norm(props.value) === "active" ||
                                                       //         norm(props.value) === "on" ||
                                                       //         norm(props.value) === "1" ||
                                                       //         norm(props.value) === "true"
                                                       //           ? "ON"
                                                       //           : "OFF"}
                                                       //       </>
                                                       //     ) : props.section === "Trip Status" ? (
                                                       //       // Trip status label
                                                       //       <>
                                                       //         {(() => {
                                                       //           const s = norm(props.value);
                                                       //           const isNormal =
                                                       //             s === "" ||
                                                       //             s === "inactive" ||
                                                       //             s === "normal" ||
                                                       //             s === "0" ||
                                                       //             s === "false";
                                                       //           return isNormal ? "Normal" : "Tripped";
                                                       //         })()}
                                                       //       </>
                                                       //     ) : (
                                                       //       <>{props.value}</>
                                                       //     )}
                                                       //   </>
                                                       // )
                                                       props.title ===
                                                         "Level Status" ? (
                                                         <>
                                                           {props.value ===
                                                             "inactive" ||
                                                           parseInt(
                                                             props.value
                                                           ) === 0
                                                             ? "Low"
                                                             : "High"}
                                                         </>
                                                       ) : props.title ===
                                                         "Wet Bulb Temp[°C]" ? (
                                                         <>
                                                           {props.value !==
                                                             undefined &&
                                                           props.value !== ""
                                                             ? formatter.format(
                                                                 props.value
                                                               )
                                                             : props.defaultValue}
                                                           {props.unit}
                                                         </>
                                                       ) : (
                                                         <>
                                                           {props.value
                                                             ? formatter.format(
                                                                 props.value
                                                               )
                                                             : props.defaultValue}
                                                           {props.unit}
                                                         </>
                                                       )}
                                                     </div>
                                                   </Paper>
                                                 );
                                               };

                                               const handleChangeForsetpointRAT = (
                                                 event
                                               ) => {
                                                 setSetPointvalue(
                                                   event.target.value
                                                 );
                                               };

                                               const handleClickRat = (
                                                 event
                                               ) => {
                                                 // console.log("props--------------------",props)
                                                 const req = {
                                                   ss_type: props.eqpType,
                                                   ss_id: selectedChId,
                                                   gl_command:
                                                     "CHANGE_SET_POINT",
                                                   param_id:
                                                     props.eqpType ==
                                                     "NONGL_SS_CHILLER"
                                                       ? "Set_EWT"
                                                       : "",
                                                   value: setPointvalue,
                                                   zone_type: null,
                                                   zone_id: null,
                                                 };
                                                 console.log("reqqqqq", req);
                                                 if (
                                                   setPointvalue >= 4 &&
                                                   setPointvalue <= 10
                                                 ) {
                                                   api.floor
                                                     .cpmOnOffControl(req)
                                                     .then((res) => {
                                                       setSetPointvalue("");
                                                       if (
                                                         res.message ===
                                                         "please connect to network"
                                                       ) {
                                                         toast({
                                                           type: "error",
                                                           icon:
                                                             "exclamation triangle",
                                                           title: "Error",
                                                           description:
                                                             "connect to network",
                                                           time: 2000,
                                                         });
                                                       } else if (res.id) {
                                                         let requestID = res.id;
                                                         toast({
                                                           type: "success",
                                                           icon: "check circle",
                                                           title: "Success",
                                                           description:
                                                             "Temp successfully set to" +
                                                             setPointvalue,
                                                           time: 2000,
                                                         });
                                                         const checkCommandStatus = (
                                                           requestID,
                                                           startTime = Date.now()
                                                         ) => {
                                                           api.floor
                                                             .checkCommandStatus(
                                                               requestID
                                                             )
                                                             .then((res) => {
                                                               if (
                                                                 res[0]
                                                                   .status ===
                                                                 "success"
                                                               ) {
                                                                 // Command was successful, stop further API calls
                                                                 console.log(
                                                                   "Command succeeded"
                                                                 );
                                                                 toast({
                                                                   type:
                                                                     "success",
                                                                   icon:
                                                                     "check circle",
                                                                   title:
                                                                     "Command Status",
                                                                   description:
                                                                     "Command processed successfully",
                                                                   time: 2000,
                                                                 });
                                                               } else if (
                                                                 res[0]
                                                                   .status ===
                                                                 "pending"
                                                               ) {
                                                                 console.log(
                                                                   "Command is still Pending"
                                                                 );
                                                                 const elapsedTime =
                                                                   Date.now() -
                                                                   startTime;

                                                                 if (
                                                                   elapsedTime <
                                                                   30000
                                                                 ) {
                                                                   console.log(
                                                                     " If less than 30 seconds have passed, keep checking every 3 seconds"
                                                                   );
                                                                   setTimeout(
                                                                     () =>
                                                                       checkCommandStatus(
                                                                         requestID,
                                                                         startTime
                                                                       ),
                                                                     3000
                                                                   );
                                                                 } else {
                                                                   console.log(
                                                                     "Stop checking after 30 seconds and show a timeout message"
                                                                   );
                                                                   console.log(
                                                                     "Command timed out after 30 seconds."
                                                                   );
                                                                   toast({
                                                                     type:
                                                                       "error",
                                                                     icon:
                                                                       "clock",
                                                                     title:
                                                                       "Timeout",
                                                                     description:
                                                                       "Command is still pending after 30 seconds.",
                                                                     time: 5000,
                                                                   });
                                                                 }
                                                               }
                                                             })
                                                             .catch((error) => {
                                                               console.error(
                                                                 "Error checking command status:",
                                                                 error
                                                               );
                                                               // toast({
                                                               //   type: "error",
                                                               //   icon: "exclamation triangle",
                                                               //   title: "Error",
                                                               //   description: "Error while checking command status",
                                                               //   time: 2000,
                                                               // });
                                                             });
                                                         };

                                                         checkCommandStatus(
                                                           requestID
                                                         );
                                                       }
                                                     })
                                                     .catch((error) => {
                                                       setSnackbarOpen(true);
                                                       if (error.response) {
                                                         setErrorMsg(
                                                           error.response.data
                                                             .message
                                                         );
                                                       } else {
                                                         // setErrorMsg('No response')
                                                       }
                                                     });
                                                 } else {
                                                   // setSetPointvalue("");
                                                   toast({
                                                     type: "error",
                                                     icon:
                                                       "exclamation triangle",
                                                     title: "Error",
                                                     description:
                                                       "Set point should be 4-10 ",
                                                     time: 2000,
                                                   });
                                                 }
                                               };

                                               return (
                                                 <div className={classes.root}>
                                                   <Snackbar
                                                     open={openerr}
                                                     autoHideDuration={3000}
                                                     anchorOrigin={{
                                                       vertical: "top",
                                                       horizontal: "center",
                                                     }}
                                                   >
                                                     <Alert
                                                       style={{
                                                         cursor: "pointer",
                                                       }}
                                                       severity="error"
                                                       variant="filled"
                                                       onClose={
                                                         handleerrorclose
                                                       }
                                                     >
                                                       {errmsg}
                                                     </Alert>
                                                   </Snackbar>
                                                   <Grid container spacing={1}>
                                                     <Grid
                                                       container
                                                       item
                                                       xs={12}
                                                       spacing={1}
                                                       style={{
                                                         marginTop: "-1.5h",
                                                       }}
                                                     >
                                                       {/* Left part */}
                                                       <Grid
                                                         item
                                                         xs={12}
                                                         sm={12}
                                                         md={9}
                                                         lg={9}
                                                         xl={9}
                                                         xxl={9}
                                                       >
                                                         <Grid
                                                           container
                                                           item
                                                           xs={12}
                                                           spacing={1}
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
                                                             <FormControl
                                                               variant="filled"
                                                               size="large"
                                                               className={` ${classes.select} ${classes.formControl}`}
                                                               style={{
                                                                 width:
                                                                   "max-content",
                                                                 minWidth:
                                                                   "100%",
                                                                 backgroundColor:
                                                                   "#eeeef5",
                                                                 fontFamily:
                                                                   "Arial",
                                                               }}
                                                             >
                                                               <Select
                                                                 labelId="filled-hidden-label-small"
                                                                 id="demo-simple-select-outlined"
                                                                 label="Chiller"
                                                                 // className={classes.select}
                                                                 value={
                                                                   selectedChName
                                                                 }
                                                                 style={{
                                                                   fontWeight:
                                                                     "bold",
                                                                   height:
                                                                     "6vh",
                                                                   borderRadius:
                                                                     "0.8vw",
                                                                   fontFamily:
                                                                     "Arial",
                                                                 }}
                                                                 disableUnderline
                                                               >
                                                                 {Object.values(
                                                                   allEquipmentData
                                                                 ).map(
                                                                   (_item) => (
                                                                     <MenuItem
                                                                       key={
                                                                         _item.id
                                                                       }
                                                                       value={
                                                                         _item.name
                                                                       }
                                                                       onClick={() =>
                                                                         handleChillerChange(
                                                                           _item.name,
                                                                           _item.id
                                                                         )
                                                                       }
                                                                     >
                                                                       {
                                                                         _item.name
                                                                       }
                                                                     </MenuItem>
                                                                   )
                                                                 )}
                                                               </Select>
                                                             </FormControl>
                                                           </Grid>
                                                         </Grid>
                                                         <Grid
                                                           container
                                                           item
                                                           xs={12}
                                                           spacing={1}
                                                         >
                                                           {console.log(
                                                             "particularEquipDataSet5",
                                                             particularEquipDataSet5,
                                                             "particularEquipDataSet6",
                                                             particularEquipDataSet6
                                                           )}
                                                           <Grid
                                                             item
                                                             xs={12}
                                                             sm={12}
                                                             md={12}
                                                             lg={12}
                                                             xl={12}
                                                             xxl={12}
                                                           >
                                                             <Card
                                                               className={
                                                                 classes.paper
                                                               }
                                                               style={{
                                                                 borderRadius:
                                                                   "6px",
                                                                 boxShadow:
                                                                   "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
                                                                 backgroundColor:
                                                                   "white",
                                                                 textAlign:
                                                                   "left",
                                                               }}
                                                             >
                                                               <Grid
                                                                 container
                                                                 item
                                                                 xs={12}
                                                                 spacing={1}
                                                                 direction="row"
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
                                                                   <Map
                                                                     ref={
                                                                       mapRef
                                                                     }
                                                                     doubleClickZoom={
                                                                       false
                                                                     }
                                                                     zoomControl={
                                                                       false
                                                                     }
                                                                     dragging={
                                                                       false
                                                                     }
                                                                     scrollWheelZoom={
                                                                       false
                                                                     }
                                                                     crs={
                                                                       Leaflet
                                                                         .CRS
                                                                         .Simple
                                                                     }
                                                                     center={[
                                                                       0,
                                                                       0,
                                                                     ]}
                                                                     attributionControl={
                                                                       false
                                                                     }
                                                                     // bounds={[[0, 0], [600, 730]]}
                                                                     bounds={[
                                                                       [0, -10],
                                                                       [
                                                                         515,
                                                                         750,
                                                                       ],
                                                                     ]}
                                                                     className={
                                                                       "floor-map"
                                                                     }
                                                                     style={{
                                                                       backgroundColor:
                                                                         "white",
                                                                       height:
                                                                         "48vh",
                                                                     }}
                                                                     onClick={(
                                                                       e
                                                                     ) => {
                                                                       console.log(
                                                                         {
                                                                           x:
                                                                             e
                                                                               .latlng
                                                                               .lat,
                                                                           y:
                                                                             e
                                                                               .latlng
                                                                               .lng,
                                                                         }
                                                                       );
                                                                     }}
                                                                   >
                                                                     <ImageOverlay
                                                                       interactive
                                                                       // url={'https://localhost/' + image + '.png'}
                                                                       url={
                                                                         Cooling_tower_img
                                                                       }
                                                                       // bounds={[[0, -5], [420, 600]]}
                                                                       // bounds={[[0,250], [420, 500]]}
                                                                       bounds={[
                            [107, 120],
                            [410, 600],
                          ]}
                                                                       // bounds={[[0, 0], [300, 399]]}
                                                                     />
                                                                     {particularEquipDataSet5 != undefined ? (
                          <>
                            <Marker
                              position={[238.13, 397.17]}
                              icon={iconDevicee}
                            >
                              <Tooltip
                                direction="bottom"
                                opacity={1}
                                // permanent
                              >
                                {particularEquipDataSet5.map((res) => (
                                  <>
                                    <div
                                      key={res.title}
                                      style={{ fontSize: "1.3vh" }}
                                    >
                                      <b>{res.title}</b> :{" "}
                                      <b>
                                        {!isNaN(parseFloat(res.value))
                                          ? formatter.format(res.value)
                                          : res.value}
                                        {/* {res.value} */}
                                        {res.unit}
                                      </b>
                                    </div>
                                    {/* <b>{res.title}</b>
                                              :
                                              <b>{res.value}</b> */}
                                  </>
                                ))}
                              </Tooltip>
                            </Marker>
                          </>
                        ) : (
                          <></>
                        )}
{particularEquipDataSet1 != undefined ? (
                          <>
                            {particularEquipDataSet1.map((res) => (
                              <>
                                {particularEquipDataSet2.map((res) =>
                                  res.title == "Chiller" ? (
                                    res.value == "active" ? (
                                      <Marker
                                        position={[300.82, 404.45]}
                                        icon={iconDevice2}
                                      ></Marker>
                                    ) : (
                                      <></>
                                    )
                                  ) : res.title == "Trip Status" ? (
                                    res.value == "active" ? (
                                      <Marker
                                        position={[300.82, 404.45]}
                                        icon={iconDevice3}
                                      ></Marker>
                                    ) : (
                                      <></>
                                    )
                                  ) : (
                                    <></>
                                  )
                                )}
                                :
                                <Marker
                                  position={res.coordinates}
                                  icon={iconDevice1}
                                >
                                  <Tooltip
                                    direction={res.tooltipDirection}
                                    opacity={0.75}
                                    permanent
                                  >
                                    <div>
                                      <span
                                        className={
                                          classes.Leaflet_Tooltip_Heading
                                        }
                                      >
                                        {res.title}
                                      </span>
                                      <br />
                                      <div
                                        className={
                                          classes.Leaflet_Tooltip_Values
                                        }
                                        style={{
                                          color: "white",
                                          backgroundColor:
                                            res.minRange && res.maxRange
                                              ? res.value >= res.minRange &&
                                                res.value <= res.maxRange
                                                ? greenColor[0]
                                                : redColor[0]
                                              : res.backgroundColor,
                                          // backgroundColor: res.backgroundColor ? res.backgroundColor : 'green',
                                        }}
                                      >
                                        {res.value}
                                        {res.unit ? res.unit : ""}
                                      </div>
                                    </div>{" "}
                                  </Tooltip>
                                </Marker>
                              </>
                            ))}
                          </>
                        ) : (
                          <></>
                        )}
                                                                   </Map>
                                                                 </Grid>
                                                               </Grid>
                                                             </Card>
                                                           </Grid>
                                                         </Grid>
                                                         <Grid
                                                           container
                                                           item
                                                           xs={12}
                                                           spacing={1}
                                                           style={{
                                                             marginTop: "1vh",
                                                           }}
                                                         >
                                                           {eqpGraphList ? (
                                                             graphsCard.map(
                                                               (resData) => (
                                                                 <Grid
                                                                   item
                                                                   xs={12}
                                                                   sm={12}
                                                                   md={4}
                                                                   lg={4}
                                                                   xl={4}
                                                                   xxl={4}
                                                                 >
                                                                   <Box
                                                                     className={
                                                                       classes.graphpaper
                                                                     }
                                                                   >
                                                                     <div
                                                                       style={{
                                                                         fontWeight:
                                                                           "bold",
                                                                         color:
                                                                           "black",
                                                                       }}
                                                                       className={
                                                                         classes.CardHeadFont
                                                                       }
                                                                     >
                                                                       {
                                                                         resData.title
                                                                       }
                                                                     </div>
                                                                     <div
                                                                       style={{
                                                                         marginTop:
                                                                           "2vh",
                                                                       }}
                                                                     >
                                                                       <TimeS
                                                                         name={
                                                                           resData.title
                                                                         }
                                                                         data={
                                                                           eqpGraphList[
                                                                             resData[
                                                                               "parameters"
                                                                             ][0]
                                                                           ]
                                                                         }
                                                                         data2={
                                                                           eqpGraphList[
                                                                             resData[
                                                                               "parameters"
                                                                             ][1]
                                                                           ]
                                                                         }
                                                                         data3={
                                                                           eqpGraphList[
                                                                             resData[
                                                                               "parameters"
                                                                             ][2]
                                                                           ]
                                                                         }
                                                                         via={
                                                                           props.device
                                                                         }
                                                                         // data24Hr={eqp1dayGraphList[resData['parameters'][0]]}
                                                                         minRange={
                                                                           resData.minRange
                                                                         }
                                                                         maxRange={
                                                                           resData.maxRange
                                                                         }
                                                                         // data2={eqpGraphList[resData["parameters"][1]]}
                                                                         style={{
                                                                           width:
                                                                             "10vh",
                                                                           height:
                                                                             "7vh",
                                                                           marginTop:
                                                                             "2vh",
                                                                         }}
                                                                       />
                                                                     </div>
                                                                   </Box>
                                                                 </Grid>
                                                               )
                                                             )
                                                           ) : (
                                                             <></>
                                                           )}

                                                           {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                        <Box className={classes.graphpaper}>
                        <div style={{fontWeight:'bold',color:'black'}}  className={classes.CardHeadFont}>Condenser Water Temperature</div>
                                  <div style={{marginTop:'2vh'}}>
                                  <TimeS
                                        name='Condenser Water Temperature'
                                        data={CndW_HST} data2={CndW_HRT}
                                      style={{ width: "100%", height: "50%" }}
                                    /></div>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                        <Box className={classes.graphpaper}>
                          <div style={{fontWeight:'bold',color:'black'}}  className={classes.CardHeadFont}>VFD Phase Current</div>
                              <div style={{marginTop:'2vh'}}>
                                 <TimeSeriesChart
                                style={{ width: "100%", height: "50%" }}
                                data={VFD_Ph_Cur}
                                param='VFD_Ph_Cur'
                              />
                              </div>
                        </Box>
                    </Grid> */}
                                                         </Grid>
                                                       </Grid>
                                                       {/* Right part */}
                                                       <Grid
                                                         item
                                                         xs={12}
                                                         sm={12}
                                                         md={3}
                                                         lg={3}
                                                         xl={3}
                                                         xxl={3}
                                                       >
                                                         <Grid
                                                           container
                                                           item
                                                           xs={12}
                                                           spacing={1}
                                                           direction="column"
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
                                                             <Paper
                                                               style={{
                                                                 maxWidth:
                                                                   "100%",
                                                                 color: "white",
                                                                 backgroundColor:
                                                                   "#0123b4",
                                                                 borderRadius:
                                                                   "10px",
                                                                 height: "6vh",
                                                                 display:
                                                                   "flex",
                                                                 justifyContent:
                                                                   "flex-start",
                                                                 paddingLeft:
                                                                   "16px",
                                                                 alignItems:
                                                                   "center",
                                                               }}
                                                               className={
                                                                 classes.CardHeadFont
                                                               }
                                                             >
                                                               <Typography
                                                                 style={{
                                                                   color:
                                                                     "#ffffff",
                                                                   fontFamily:
                                                                     "Arial",
                                                                   fontSize:
                                                                     "2vh",
                                                                   textAlign:
                                                                     "left",
                                                                 }}
                                                               >
                                                                 Cooling Tower
                                                                 Controls
                                                               </Typography>
                                                             </Paper>
                                                           </Grid>
                                                           <Grid
                                                             item
                                                             xs={12}
                                                             sm={12}
                                                             md={12}
                                                             lg={12}
                                                             xl={12}
                                                             xxl={12}
                                                           >
                                                             <Card
                                                               className={
                                                                 classes.paper
                                                               }
                                                               style={{
                                                                 marginTop:
                                                                   "0vh",
                                                                 height:
                                                                   "26.9vh",
                                                                 overflowY:
                                                                   "auto",
                                                               }}
                                                             >
                                                               {" "}
                                                               {console.log(
                                                                 "partcularEquipDataSet2...........",
                                                                 particularEquipDataSet2
                                                               )}
                                                               {deviceImage ? (
                                                                 <>
                                                                   {particularEquipDataSet2.map(
                                                                     (res) =>
                                                                       res.typeOf ==
                                                                       "controls" ? (
                                                                         <>
                                                                           <Grid
                                                                             container
                                                                             spacing={
                                                                               1
                                                                             }
                                                                           >
                                                                             <Grid
                                                                               container
                                                                               item
                                                                               xs={
                                                                                 12
                                                                               }
                                                                               style={{
                                                                                 marginTop:
                                                                                   "1.7vh",
                                                                                 textAlign:
                                                                                   "left",
                                                                               }}
                                                                               direction="row"
                                                                               alignItems="center"
                                                                               justify="flex-start"
                                                                             >
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   1
                                                                                 }
                                                                                 sm={
                                                                                   1
                                                                                 }
                                                                                 md={
                                                                                   1
                                                                                 }
                                                                                 lg={
                                                                                   1
                                                                                 }
                                                                                 xl={
                                                                                   1
                                                                                 }
                                                                               ></Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   6
                                                                                 }
                                                                                 sm={
                                                                                   6
                                                                                 }
                                                                                 md={
                                                                                   6
                                                                                 }
                                                                                 lg={
                                                                                   6
                                                                                 }
                                                                                 xl={
                                                                                   6
                                                                                 }
                                                                                 className={
                                                                                   classes.controls_text
                                                                                 }
                                                                               >
                                                                                 {
                                                                                   res.title
                                                                                 }
                                                                               </Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   4
                                                                                 }
                                                                                 sm={
                                                                                   4
                                                                                 }
                                                                                 md={
                                                                                   4
                                                                                 }
                                                                                 lg={
                                                                                   4
                                                                                 }
                                                                                 xl={
                                                                                   4
                                                                                 }
                                                                               >
                                                                                 {res.component ==
                                                                                 "Set Operator" ? (
                                                                                   <Grid
                                                                                     container
                                                                                     item
                                                                                     xs={
                                                                                       12
                                                                                     }
                                                                                     alignItems="center"
                                                                                     justify="flex-end"
                                                                                   >
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         7
                                                                                       }
                                                                                       sm={
                                                                                         7
                                                                                       }
                                                                                       md={
                                                                                         7
                                                                                       }
                                                                                       lg={
                                                                                         7
                                                                                       }
                                                                                       xl={
                                                                                         7
                                                                                       }
                                                                                     >
                                                                                       <TextField
                                                                                         placeholder={
                                                                                           res.value
                                                                                             ? res.value +
                                                                                               res.unit
                                                                                             : res.defaultValue +
                                                                                               res.unit
                                                                                         }
                                                                                         style={{
                                                                                           pointerEvents:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                           opacity:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                         }}
                                                                                         name="Set_Point"
                                                                                         autoComplete="off"
                                                                                         value={
                                                                                           setPointvalue
                                                                                         }
                                                                                         onChange={
                                                                                           handleChangeForsetpointRAT
                                                                                         }
                                                                                         className={
                                                                                           classes.text_field
                                                                                         }
                                                                                       />
                                                                                     </Grid>
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         5
                                                                                       }
                                                                                       sm={
                                                                                         5
                                                                                       }
                                                                                       md={
                                                                                         5
                                                                                       }
                                                                                       lg={
                                                                                         5
                                                                                       }
                                                                                       xl={
                                                                                         5
                                                                                       }
                                                                                     >
                                                                                       <Paper
                                                                                         className={
                                                                                           classes.set_button
                                                                                         }
                                                                                         onClick={() =>
                                                                                           handleClickRat(
                                                                                             props
                                                                                           )
                                                                                         }
                                                                                         style={{
                                                                                           backgroundColor:
                                                                                             "#0123B4",
                                                                                           display:
                                                                                             "flex",
                                                                                           marginLeft:
                                                                                             "1vh",
                                                                                           justifyContent:
                                                                                             "center",
                                                                                           cursor:
                                                                                             "pointer",
                                                                                           marginTop:
                                                                                             "1vh",
                                                                                           pointerEvents:
                                                                                             roleId !=
                                                                                               2 ||
                                                                                             CPM_Status ==
                                                                                               "true" ||
                                                                                             CPM_Override_Status ==
                                                                                               "false"
                                                                                               ? "none"
                                                                                               : "",
                                                                                           opacity:
                                                                                             roleId !=
                                                                                               2 ||
                                                                                             CPM_Status ==
                                                                                               "true" ||
                                                                                             CPM_Override_Status ==
                                                                                               "false"
                                                                                               ? "0.4"
                                                                                               : "",
                                                                                         }}
                                                                                       >
                                                                                         <div
                                                                                           style={{
                                                                                             color:
                                                                                               "white",
                                                                                           }}
                                                                                         >
                                                                                           set
                                                                                         </div>
                                                                                       </Paper>
                                                                                     </Grid>
                                                                                   </Grid>
                                                                                 ) : res.component ==
                                                                                   "Chip" ? (
                                                                                   <div
                                                                                     style={{
                                                                                       display:
                                                                                         "flex",
                                                                                       justifyContent:
                                                                                         "flex-end",
                                                                                     }}
                                                                                   >
                                                                                     <ChipMethod
                                                                                       value={
                                                                                         res.value !==
                                                                                           undefined &&
                                                                                         res.value !==
                                                                                           null
                                                                                           ? res.value
                                                                                           : res.defaultValue
                                                                                       }
                                                                                       unit={
                                                                                         res.unit
                                                                                       }
                                                                                       title={
                                                                                         res.title
                                                                                       }
                                                                                       defaultValue={
                                                                                         res.defaultValue
                                                                                       }
                                                                                     />
                                                                                   </div>
                                                                                 ) : res.component ==
                                                                                   "Switch Selector" ? (
                                                                                   <>
                                                                                     {res.title ==
                                                                                     "Include Chiller in CPM Mode ?" ? (
                                                                                       //  <div  style={{
                                                                                       //   pointerEvents: ((!shouldDisable1 )&& (shouldDisable2 === false) && shouldDisable3 === false) ? "none" : "",
                                                                                       //   opacity: ((!shouldDisable1) && (shouldDisable2 === false) && shouldDisable3 === false) ? "0.4" : ""
                                                                                       // }}
                                                                                       //  className={classes.switchselector}>
                                                                                       <div
                                                                                         className={
                                                                                           classes.switchselector
                                                                                         }
                                                                                         style={{
                                                                                           pointerEvents:
                                                                                             roleId !=
                                                                                               2 ||
                                                                                             CPM_Status ==
                                                                                               "true" ||
                                                                                             CPM_Override_Status ==
                                                                                               "false"
                                                                                               ? "none"
                                                                                               : "",
                                                                                           opacity:
                                                                                             roleId !=
                                                                                               2 ||
                                                                                             CPM_Status ==
                                                                                               "true" ||
                                                                                             CPM_Override_Status ==
                                                                                               "false"
                                                                                               ? "0.4"
                                                                                               : "",
                                                                                         }}
                                                                                       >
                                                                                         {/* <div style={{  pointerEvents: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "none",
                                        //   opacity: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "0.4",
                                        // }}
                                      className={classes.switchselector}> */}
                                                                                         <SwitchSelector
                                                                                           style={{
                                                                                             pointerEvents:
                                                                                               roleId !=
                                                                                                 2 ||
                                                                                               CPM_Status ==
                                                                                                 "true" ||
                                                                                               CPM_Override_Status ==
                                                                                                 "false"
                                                                                                 ? "none"
                                                                                                 : "",
                                                                                             opacity:
                                                                                               roleId !=
                                                                                                 2 ||
                                                                                               CPM_Status ==
                                                                                                 "true" ||
                                                                                               CPM_Override_Status ==
                                                                                                 "false"
                                                                                                 ? "0.4"
                                                                                                 : "",
                                                                                           }}
                                                                                           onChange={
                                                                                             onChangeMode
                                                                                           }
                                                                                           options={
                                                                                             modeOptions
                                                                                           }
                                                                                           // initialSelectedIndex={initialSelectedIndex}
                                                                                           forcedSelectedIndex={
                                                                                             remoteLocal
                                                                                           }
                                                                                           // initialSelectedIndex={remoteLocal}
                                                                                           // key={res.value}
                                                                                           fontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           selectedFontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           optionBorderRadius={
                                                                                             5
                                                                                           }
                                                                                           wrapperBorderRadius={
                                                                                             7
                                                                                           }
                                                                                           fontSize={
                                                                                             8
                                                                                           }
                                                                                         />
                                                                                       </div>
                                                                                     ) : res.title ==
                                                                                         "Cooling Tower" ||
                                                                                       res.title ==
                                                                                         "Cooling Tower Fan" ||
                                                                                       res.title ==
                                                                                         "Cooling Tower Fans" ? (
                                                                                       //   <div style={{pointerEvents: ((!shouldDisable1 )&& (shouldDisable2 === false) && shouldDisable3 === false) ? "none" : "",
                                                                                       //     opacity: ((!shouldDisable1) && (shouldDisable2 === false) && shouldDisable3 === false) ? "0.4" : ""}}
                                                                                       //  className={classes.switchselector}>
                                                                                       <div
                                                                                         className={
                                                                                           classes.switchselector
                                                                                         }
                                                                                         style={{
                                                                                           pointerEvents:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                           opacity:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                         }}
                                                                                       >
                                                                                         {/* <div style={{ pointerEvents: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "none",
                                        //   opacity: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "0.4",
                                        // }}
                                     className={classes.switchselector}> */}
                                                                                         {console.log(
                                                                                           "CTF ON/Off",
                                                                                           onOff2,
                                                                                           typeof onOff2
                                                                                         )}
                                                                                         <SwitchSelector
                                                                                           onChange={
                                                                                             onChange
                                                                                           }
                                                                                           options={
                                                                                             options
                                                                                           }
                                                                                           // initialSelectedIndex={initialSelectedIndex}
                                                                                           // forcedSelectedIndex={
                                                                                           //   onOff2 === "active" ? 1 : 0
                                                                                           // }
                                                                                           forcedSelectedIndex={
                                                                                             onOff2
                                                                                           }
                                                                                           initialSelectedIndex={
                                                                                             0
                                                                                           }
                                                                                           // key={coolingTowerState}
                                                                                           key={`${selectedChId}-${coolingTowerState}`}
                                                                                           fontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           selectedFontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           optionBorderRadius={
                                                                                             5
                                                                                           }
                                                                                           wrapperBorderRadius={
                                                                                             7
                                                                                           }
                                                                                           fontSize={
                                                                                             8
                                                                                           }
                                                                                         />
                                                                                       </div>
                                                                                     ) : (
                                                                                       // <div
                                                                                       // style={{pointerEvents: ((!shouldDisable1 )&& (shouldDisable2 === false) && shouldDisable3 === false) ? "none" : "",
                                                                                       //   opacity: ((!shouldDisable1) && (shouldDisable2 === false) && shouldDisable3 === false) ? "0.4" : ""}}
                                                                                       // className={classes.switchselector}>
                                                                                       <div
                                                                                         className={
                                                                                           classes.switchselector
                                                                                         }
                                                                                         style={{
                                                                                           pointerEvents:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                           opacity:
                                                                                             CPM_Override_Status ==
                                                                                             "true"
                                                                                               ? ""
                                                                                               : CPM_Override_Status ==
                                                                                                 "false"
                                                                                               ? CPM_Status ==
                                                                                                 "true"
                                                                                                 ? "0.4"
                                                                                                 : ""
                                                                                               : "0.4",
                                                                                         }}
                                                                                       >
                                                                                         {/* <div 
                                      style={{ pointerEvents: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "none",
                                        //   opacity: ((CPM_Status === "true" && remoteLocal == 1 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 0 && particularEquipAMStatus === "true") || (CPM_Status === "false" && remoteLocal == 1 && particularEquipAMStatus === "true")) ? "" : "0.4",
                                        // }}
                                      className={classes.switchselector}> */}
                                                                                         <SwitchSelector
                                                                                           onChange={
                                                                                             onChange1
                                                                                           }
                                                                                           options={
                                                                                             options1
                                                                                           }
                                                                                           // initialSelectedIndex={initialSelectedIndex}
                                                                                           // forcedSelectedIndex={res.value == 1 ? 0 : 1}
                                                                                           initialSelectedIndex={
                                                                                             res.value ==
                                                                                               "active" ||
                                                                                             onOff2 ==
                                                                                               "active"
                                                                                               ? 1
                                                                                               : 0
                                                                                           }
                                                                                           // key={res.value}
                                                                                           key={`${selectedChId}-${res.parameter}-${res.value}`}
                                                                                           // forcedSelectedIndex={1}
                                                                                           fontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           selectedFontColor={
                                                                                             "#000"
                                                                                           }
                                                                                           optionBorderRadius={
                                                                                             5
                                                                                           }
                                                                                           wrapperBorderRadius={
                                                                                             7
                                                                                           }
                                                                                           fontSize={
                                                                                             8
                                                                                           }
                                                                                         />
                                                                                       </div>
                                                                                     )}
                                                                                   </>
                                                                                 ) : res.component ==
                                                                                   "Text Field" ? (
                                                                                   <Grid
                                                                                     container
                                                                                     item
                                                                                     xs={
                                                                                       12
                                                                                     }
                                                                                     alignItems="center"
                                                                                     justify="flex-end"
                                                                                   >
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         7
                                                                                       }
                                                                                       sm={
                                                                                         7
                                                                                       }
                                                                                       md={
                                                                                         7
                                                                                       }
                                                                                       lg={
                                                                                         7
                                                                                       }
                                                                                       xl={
                                                                                         7
                                                                                       }
                                                                                     >
                                                                                       <TextField
                                                                                         // label="%"
                                                                                         placeholder={
                                                                                           formatter.format(
                                                                                             res.value
                                                                                           ) >=
                                                                                             5 &&
                                                                                           formatter.format(
                                                                                             res.value
                                                                                           ) <=
                                                                                             20
                                                                                             ? formatter.format(
                                                                                                 res.value
                                                                                               )
                                                                                             : res.defaultValue +
                                                                                               "℃"
                                                                                         }
                                                                                         // style={{width:'8.5vh'}}
                                                                                         name="Set_Point"
                                                                                         autoComplete="off"
                                                                                         // formatter.format(freq)
                                                                                         value={
                                                                                           setPointvalue
                                                                                         }
                                                                                         onChange={
                                                                                           handleChangeForsetpointRAT
                                                                                         }
                                                                                         className={
                                                                                           classes.text_field
                                                                                         }
                                                                                         // variant="outlined"
                                                                                         // style={{ marginTop: '3vh' }}
                                                                                       />
                                                                                     </Grid>
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         5
                                                                                       }
                                                                                       sm={
                                                                                         5
                                                                                       }
                                                                                       md={
                                                                                         5
                                                                                       }
                                                                                       lg={
                                                                                         5
                                                                                       }
                                                                                       xl={
                                                                                         5
                                                                                       }
                                                                                     >
                                                                                       <Paper
                                                                                         className={
                                                                                           classes.set_button
                                                                                         }
                                                                                         onClick={() =>
                                                                                           handleClickRat(
                                                                                             props
                                                                                           )
                                                                                         }
                                                                                         style={{
                                                                                           backgroundColor:
                                                                                             "#0123B4",
                                                                                           display:
                                                                                             "flex",
                                                                                           marginLeft:
                                                                                             "1vh",
                                                                                           justifyContent:
                                                                                             "center",
                                                                                           cursor:
                                                                                             "pointer",
                                                                                           marginTop:
                                                                                             "1vh",
                                                                                           pointerEvents:
                                                                                             roleId !=
                                                                                             2
                                                                                               ? "none"
                                                                                               : "",
                                                                                           opacity:
                                                                                             roleId !=
                                                                                             2
                                                                                               ? "0.4"
                                                                                               : "",
                                                                                         }}
                                                                                       >
                                                                                         <div
                                                                                           style={{
                                                                                             color:
                                                                                               "white",
                                                                                           }}
                                                                                         >
                                                                                           set
                                                                                         </div>
                                                                                       </Paper>
                                                                                     </Grid>
                                                                                   </Grid>
                                                                                 ) : (
                                                                                   <>

                                                                                   </>
                                                                                 )}
                                                                               </Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   1
                                                                                 }
                                                                                 sm={
                                                                                   1
                                                                                 }
                                                                                 md={
                                                                                   1
                                                                                 }
                                                                                 lg={
                                                                                   1
                                                                                 }
                                                                                 xl={
                                                                                   1
                                                                                 }
                                                                               ></Grid>
                                                                             </Grid>
                                                                           </Grid>
                                                                         </>
                                                                       ) : (
                                                                         <></>
                                                                       )
                                                                   )}
                                                                 </>
                                                               ) : (
                                                                 <div
                                                                   style={{
                                                                     display:
                                                                       "flex",
                                                                     justifyContent:
                                                                       "center",
                                                                     marginTop:
                                                                       "20vh",
                                                                     fontSize:
                                                                       "2.5vh",
                                                                   }}
                                                                 >
                                                                   No Equipment
                                                                   Available
                                                                 </div>
                                                               )}
                                                             </Card>
                                                           </Grid>
                                                           <Grid
                                                             item
                                                             xs={12}
                                                             sm={12}
                                                             md={12}
                                                             lg={12}
                                                             xl={12}
                                                             xxl={12}
                                                           >
                                                             <Paper
                                                               style={{
                                                                 maxWidth:
                                                                   "100%",
                                                                 color: "white",
                                                                 backgroundColor:
                                                                   " #0123b4",
                                                                 borderRadius:
                                                                   "6px",
                                                                 height: "6vh",
                                                                 display:
                                                                   "flex",
                                                                 justifyContent:
                                                                   "flex-start",
                                                                 paddingLeft:
                                                                   "16px",
                                                                 alignItems:
                                                                   "center",
                                                               }}
                                                             >
                                                               <Typography
                                                                 style={{
                                                                   color:
                                                                     "#ffffff",
                                                                   fontFamily:
                                                                     "Arial",
                                                                   fontSize:
                                                                     "2vh",
                                                                   textAlign:
                                                                     "left",
                                                                 }}
                                                               >
                                                                 Cooling Tower
                                                                 Fan Status
                                                               </Typography>
                                                             </Paper>
                                                           </Grid>
                                                           <Grid
                                                             item
                                                             xs={12}
                                                             sm={12}
                                                             md={12}
                                                             lg={12}
                                                             xl={12}
                                                             xxl={12}
                                                           >
                                                             <Card
                                                               className={
                                                                 classes.paper
                                                               }
                                                               style={{
                                                                 marginTop:
                                                                   "0vh",
                                                                 height: "45vh",
                                                                 overflowY:
                                                                   "auto",
                                                               }}
                                                             >
                                                               {/* Fan Status card (three small fan buttons) */}
                                                               {false &&
                                                                 (function () {
                                                                   // Use explicit parameter mapping for each fan (run and trip) instead of heuristics.
                                                                   const fans = [
                                                                     {
                                                                       id:
                                                                         "Fan-1",
                                                                       runParam:
                                                                         "CT_Var_FAN_1_On_Off_SS",
                                                                       tripParam:
                                                                         "CT_Var_FAN_1_Trip_SS_Alarm",
                                                                     },
                                                                     {
                                                                       id:
                                                                         "Fan-2",
                                                                       runParam:
                                                                         "CT_Var_FAN_2_On_Off_SS",
                                                                       tripParam:
                                                                         "CT_Var_FAN_2_Trip_SS_Alarm",
                                                                     },
                                                                     {
                                                                       id:
                                                                         "Fan-3",
                                                                       runParam:
                                                                         "CT_Var_FAN_3_On_Off_SS",
                                                                       tripParam:
                                                                         "CT_Var_FAN_3_Trip_SS_Alarm",
                                                                     },
                                                                   ];

                                                                   // find item by exact parameter field (preferred) or by title fallback
                                                                   const findByParam = (
                                                                     param
                                                                   ) => {
                                                                     const exactMatch = particularEquipDataSet2.find(
                                                                       (r) =>
                                                                         r.parameter ===
                                                                         param
                                                                     );
                                                                     if (
                                                                       exactMatch
                                                                     )
                                                                       return exactMatch;

                                                                     const titleMatch = particularEquipDataSet2.find(
                                                                       (r) =>
                                                                         r.title &&
                                                                         r.title
                                                                           .toLowerCase()
                                                                           .includes(
                                                                             (
                                                                               param ||
                                                                               ""
                                                                             ).toLowerCase()
                                                                           )
                                                                     );
                                                                     return (
                                                                       titleMatch ||
                                                                       {}
                                                                     );
                                                                   };

                                                                   // Debug log for all fan trip parameters in the dataset
                                                                   const fanData = particularEquipDataSet2
                                                                     .filter(
                                                                       (item) =>
                                                                         item.parameter &&
                                                                         (item.parameter.includes(
                                                                           "CT_Fan"
                                                                         ) ||
                                                                           item.parameter.includes(
                                                                             "CT_Var_FAN"
                                                                           ))
                                                                     )
                                                                     .map(
                                                                       (
                                                                         item
                                                                       ) => ({
                                                                         parameter:
                                                                           item.parameter,
                                                                         title:
                                                                           item.title,
                                                                         value:
                                                                           item.value,
                                                                       })
                                                                     );
                                                                   console.log(
                                                                     "[FanStatusDebug] All controls in particularEquipDataSet2:",
                                                                     fanData
                                                                   );
                                                                   console.log(
                                                                     "[FanStatusDebug] Total dataset length:",
                                                                     particularEquipDataSet2.length
                                                                   );

                                                                   // Verify each trip parameter specifically
                                                                   const trip1 = particularEquipDataSet2.find(
                                                                     (r) =>
                                                                       r.parameter ===
                                                                       "CT_Var_FAN_1_Trip_SS_Alarm"
                                                                   );
                                                                   const trip2 = particularEquipDataSet2.find(
                                                                     (r) =>
                                                                       r.parameter ===
                                                                       "CT_Var_FAN_2_Trip_SS_Alarm"
                                                                   );
                                                                   const trip3 = particularEquipDataSet2.find(
                                                                     (r) =>
                                                                       r.parameter ===
                                                                       "CT_Var_FAN_3_Trip_SS_Alarm"
                                                                   );
                                                                   console.log(
                                                                     "[FanStatusDebug] Trip params found:",
                                                                     {
                                                                       "Fan-1": trip1
                                                                         ? trip1.value
                                                                         : "NOT FOUND",
                                                                       "Fan-2": trip2
                                                                         ? trip2.value
                                                                         : "NOT FOUND",
                                                                       "Fan-3": trip3
                                                                         ? trip3.value
                                                                         : "NOT FOUND",
                                                                     }
                                                                   );
                                                                   console.log(
                                                                     "[FanStatusDebug] Trip1 full:",
                                                                     trip1
                                                                   );
                                                                   console.log(
                                                                     "[FanStatusDebug] Trip2 full:",
                                                                     trip2
                                                                   );
                                                                   console.log(
                                                                     "[FanStatusDebug] Trip3 full:",
                                                                     trip3
                                                                   );

                                                                   if (
                                                                     !particularEquipDataSet2 ||
                                                                     particularEquipDataSet2.length ===
                                                                       0
                                                                   )
                                                                     return null;

                                                                   return (
                                                                     <Paper
                                                                       style={{
                                                                         padding: 10,
                                                                         marginBottom: 10,
                                                                         borderRadius: 10,
                                                                       }}
                                                                     >
                                                                       <div
                                                                         style={{
                                                                           backgroundColor:
                                                                             "transparent",
                                                                           color:
                                                                             "#333",
                                                                           padding:
                                                                             "8px 12px",
                                                                           borderRadius: 8,
                                                                           marginBottom: 8,
                                                                           textAlign:
                                                                             "left",
                                                                         }}
                                                                       >
                                                                         <div
                                                                           style={{
                                                                             fontSize:
                                                                               "1.8vh",
                                                                           }}
                                                                         >
                                                                           Fan
                                                                           Status
                                                                         </div>
                                                                       </div>

                                                                       <Grid
                                                                         container
                                                                         spacing={
                                                                           2
                                                                         }
                                                                         style={{
                                                                           marginBottom: 6,
                                                                           maxWidth:
                                                                             "160px",
                                                                           display:
                                                                             "flex",
                                                                           margin:
                                                                             "0 auto 6px auto",
                                                                         }}
                                                                       >
                                                                         {fans.map(
                                                                           (
                                                                             f
                                                                           ) => {
                                                                             const isSelected =
                                                                               selectedFan ===
                                                                               f.id;
                                                                             const runItem = findByParam(
                                                                               f.runParam
                                                                             );
                                                                             const tripItem = findByParam(
                                                                               f.tripParam
                                                                             );

                                                                             // Debug: log each fan's data and verify it found the right parameter
                                                                             const tripParamMatch =
                                                                               tripItem?.parameter ===
                                                                               f.tripParam
                                                                                 ? "✓"
                                                                                 : "✗ WRONG";
                                                                             console.log(
                                                                               `[Fan Color] ${
                                                                                 f.id
                                                                               }: trip param=${
                                                                                 tripItem?.parameter
                                                                               } (expected ${
                                                                                 f.tripParam
                                                                               }) ${tripParamMatch}, value=${
                                                                                 tripItem?.value
                                                                               }, color=${
                                                                                 tripItem &&
                                                                                 tripItem.value !==
                                                                                   undefined &&
                                                                                 tripItem.value !==
                                                                                   "inactive"
                                                                                   ? "RED"
                                                                                   : runItem &&
                                                                                     runItem.value ===
                                                                                       "active"
                                                                                   ? "GREEN"
                                                                                   : "GREY"
                                                                               }`
                                                                             );

                                                                             // Determine color based on status
                                                                             let cardColor =
                                                                               "#9e9e9e"; // grey (default/off)

                                                                             // Check if tripped (red takes priority)
                                                                             // Trip is tripped if value is NOT "inactive" (meaning any other value like "active" or "Tripped")
                                                                             if (
                                                                               tripItem &&
                                                                               tripItem.value !==
                                                                                 undefined &&
                                                                               tripItem.value !==
                                                                                 "inactive"
                                                                             ) {
                                                                               cardColor =
                                                                                 "#f44336"; // red for tripped
                                                                             }
                                                                             // Check if on (green)
                                                                             else if (
                                                                               runItem &&
                                                                               runItem.value ===
                                                                                 "active"
                                                                             ) {
                                                                               cardColor =
                                                                                 "#4caf50"; // green for on
                                                                             }

                                                                             return (
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   4
                                                                                 }
                                                                                 sm={
                                                                                   4
                                                                                 }
                                                                                 md={
                                                                                   4
                                                                                 }
                                                                                 key={
                                                                                   f.id
                                                                                 }
                                                                                 style={{
                                                                                   flex:
                                                                                     "1 1 calc(33.333% - 10px)",
                                                                                 }}
                                                                               >
                                                                                 <ButtonBase
                                                                                   style={{
                                                                                     width:
                                                                                       "100%",
                                                                                   }}
                                                                                   onClick={() =>
                                                                                     setSelectedFan(
                                                                                       isSelected
                                                                                         ? null
                                                                                         : f.id
                                                                                     )
                                                                                   }
                                                                                 >
                                                                                   <Paper
                                                                                     className={
                                                                                       classes.paper1
                                                                                     }
                                                                                     style={{
                                                                                       background: cardColor,
                                                                                       color:
                                                                                         "#fff",
                                                                                       width:
                                                                                         "100%",
                                                                                       aspectRatio:
                                                                                         "1",
                                                                                       display:
                                                                                         "flex",
                                                                                       alignItems:
                                                                                         "center",
                                                                                       justifyContent:
                                                                                         "center",
                                                                                       borderRadius: 6,
                                                                                       padding:
                                                                                         "1px",
                                                                                       transition:
                                                                                         "all 0.3s ease",
                                                                                       border: isSelected
                                                                                         ? "3px solid rgba(255, 255, 255, 0.8)"
                                                                                         : "3px solid transparent",
                                                                                       boxShadow: isSelected
                                                                                         ? "0 0 10px rgba(0, 0, 0, 0.3)"
                                                                                         : "none",
                                                                                     }}
                                                                                   >
                                                                                     <div
                                                                                       style={{
                                                                                         fontSize:
                                                                                           "1.4vh",
                                                                                         fontWeight: 700,
                                                                                       }}
                                                                                     >
                                                                                       {
                                                                                         f.id.split(
                                                                                           "-"
                                                                                         )[1]
                                                                                       }
                                                                                     </div>
                                                                                   </Paper>
                                                                                 </ButtonBase>
                                                                               </Grid>
                                                                             );
                                                                           }
                                                                         )}
                                                                       </Grid>

                                                                       {selectedFan && (
                                                                         <Grid
                                                                           container
                                                                           spacing={
                                                                             1
                                                                           }
                                                                         >
                                                                           <Grid
                                                                             item
                                                                             xs={
                                                                               6
                                                                             }
                                                                           >
                                                                             <Paper
                                                                               className={
                                                                                 classes.paper1
                                                                               }
                                                                               style={{
                                                                                 padding: 6,
                                                                               }}
                                                                             >
                                                                               <div
                                                                                 style={{
                                                                                   fontSize:
                                                                                     "1.2vh",
                                                                                   textAlign:
                                                                                     "left",
                                                                                   color:
                                                                                     "#333",
                                                                                 }}
                                                                               >
                                                                                 Run
                                                                                 Status
                                                                               </div>
                                                                               <div
                                                                                 style={{
                                                                                   display:
                                                                                     "flex",
                                                                                   justifyContent:
                                                                                     "flex-end",
                                                                                 }}
                                                                               >
                                                                                 {/* find the mapped run parameter item for the selected fan */}
                                                                                 {(() => {
                                                                                   const mapping =
                                                                                     fans.find(
                                                                                       (
                                                                                         x
                                                                                       ) =>
                                                                                         x.id ===
                                                                                         selectedFan
                                                                                     ) ||
                                                                                     {};
                                                                                   const runItem = findByParam(
                                                                                     mapping.runParam
                                                                                   );
                                                                                   return (
                                                                                     <ChipMethod
                                                                                       {...runItem}
                                                                                       title={
                                                                                         mapping.id
                                                                                       } // Use Fan-1, Fan-2, Fan-3 as title
                                                                                       section={
                                                                                         "Fan Status"
                                                                                       }
                                                                                       textSize={
                                                                                         "1.4vh"
                                                                                       }
                                                                                     />
                                                                                   );
                                                                                 })()}
                                                                               </div>
                                                                             </Paper>
                                                                           </Grid>
                                                                           <Grid
                                                                             item
                                                                             xs={
                                                                               6
                                                                             }
                                                                           >
                                                                             <Paper
                                                                               className={
                                                                                 classes.paper1
                                                                               }
                                                                               style={{
                                                                                 padding: 6,
                                                                               }}
                                                                             >
                                                                               <div
                                                                                 style={{
                                                                                   fontSize:
                                                                                     "1.2vh",
                                                                                   textAlign:
                                                                                     "left",
                                                                                   color:
                                                                                     "#333",
                                                                                 }}
                                                                               >
                                                                                 Trip
                                                                                 Status
                                                                               </div>
                                                                               <div
                                                                                 style={{
                                                                                   display:
                                                                                     "flex",
                                                                                   justifyContent:
                                                                                     "flex-end",
                                                                                 }}
                                                                               >
                                                                                 {/* find the mapped trip parameter item for the selected fan */}
                                                                                 {(() => {
                                                                                   const mapping =
                                                                                     fans.find(
                                                                                       (
                                                                                         x
                                                                                       ) =>
                                                                                         x.id ===
                                                                                         selectedFan
                                                                                     ) ||
                                                                                     {};
                                                                                   const tripItem = findByParam(
                                                                                     mapping.tripParam
                                                                                   );
                                                                                   return (
                                                                                     <ChipMethod
                                                                                       {...tripItem}
                                                                                       title={
                                                                                         mapping.id
                                                                                       } // Use Fan-1, Fan-2, Fan-3 as title
                                                                                       section={
                                                                                         "Trip Status"
                                                                                       }
                                                                                       textSize={
                                                                                         "1.4vh"
                                                                                       }
                                                                                     />
                                                                                   );
                                                                                 })()}
                                                                               </div>
                                                                             </Paper>
                                                                           </Grid>
                                                                         </Grid>
                                                                       )}
                                                                     </Paper>
                                                                   );
                                                                 })()}
                                                               {deviceImage ? (
                                                                 <>
                                                                   {particularEquipDataSet2.map(
                                                                     (res) =>
                                                                       // Skip duplicate Fan Status / Trip Status items here (they are rendered in the Fan Status card above)
                                                                       // Also skip the header entries whose title is "Fan Status" or "Trip Status"
                                                                       res.type ==
                                                                       "status" ? (
                                                                         <>
                                                                           <Grid
                                                                             container
                                                                             spacing={
                                                                               1
                                                                             }
                                                                           >
                                                                             <Grid
                                                                               container
                                                                               item
                                                                               xs={
                                                                                 12
                                                                               }
                                                                               style={{
                                                                                 marginTop:
                                                                                   "1.7vh",
                                                                                 textAlign:
                                                                                   "left",
                                                                               }}
                                                                               direction="row"
                                                                               alignItems="center"
                                                                               justify="flex-start"
                                                                             >
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   1
                                                                                 }
                                                                                 sm={
                                                                                   1
                                                                                 }
                                                                                 md={
                                                                                   1
                                                                                 }
                                                                                 lg={
                                                                                   1
                                                                                 }
                                                                                 xl={
                                                                                   1
                                                                                 }
                                                                               ></Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   7
                                                                                 }
                                                                                 sm={
                                                                                   7
                                                                                 }
                                                                                 md={
                                                                                   7
                                                                                 }
                                                                                 lg={
                                                                                   7
                                                                                 }
                                                                                 xl={
                                                                                   7
                                                                                 }
                                                                                 className={
                                                                                   classes.controls_text
                                                                                 }
                                                                               >
                                                                                 {
                                                                                   res.title
                                                                                 }
                                                                               </Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   4
                                                                                 }
                                                                                 sm={
                                                                                   4
                                                                                 }
                                                                                 md={
                                                                                   4
                                                                                 }
                                                                                 lg={
                                                                                   4
                                                                                 }
                                                                                 xl={
                                                                                   4
                                                                                 }
                                                                                 style={{
                                                                                   display:
                                                                                     "flex",
                                                                                   justifyContent:
                                                                                     "flex-end",
                                                                                 }}
                                                                               >
                                                                                 {res.component ==
                                                                                 "Chip" ? (
                                                                                   <div
                                                                                     style={{
                                                                                       display:
                                                                                         "flex",
                                                                                       justifyContent:
                                                                                         "flex-end",
                                                                                     }}
                                                                                   >
                                                                                     <ChipMethod
                                                                                       value={
                                                                                         res.value
                                                                                       }
                                                                                       unit={
                                                                                         res.unit
                                                                                       }
                                                                                       title={
                                                                                         res.title
                                                                                       }
                                                                                       defaultValue={
                                                                                         res.defaultValue
                                                                                       }
                                                                                       section={
                                                                                         res.section
                                                                                       }
                                                                                     />
                                                                                   </div>
                                                                                 ) : res.component ==
                                                                                   "Switch Selector" ? (
                                                                                   <div
                                                                                     style={{
                                                                                       pointerEvents:
                                                                                         CPM_Status ==
                                                                                           "true" ||
                                                                                         CPM_Override_Status ==
                                                                                           "false"
                                                                                           ? "none"
                                                                                           : "",
                                                                                       opacity:
                                                                                         CPM_Status ==
                                                                                           "true" ||
                                                                                         CPM_Override_Status ==
                                                                                           "false"
                                                                                           ? "0.4"
                                                                                           : "",
                                                                                     }}
                                                                                     className={
                                                                                       classes.switchselector
                                                                                     }
                                                                                   >
                                                                                     <SwitchSelector
                                                                                       onChange={
                                                                                         onChange
                                                                                       }
                                                                                       options={
                                                                                         options
                                                                                       }
                                                                                       // initialSelectedIndex={initialSelectedIndex}
                                                                                       forcedSelectedIndex={
                                                                                         res.value ==
                                                                                         "active"
                                                                                           ? 1
                                                                                           : 0
                                                                                       }
                                                                                       fontColor={
                                                                                         "#000"
                                                                                       }
                                                                                       selectedFontColor={
                                                                                         "#000"
                                                                                       }
                                                                                       optionBorderRadius={
                                                                                         5
                                                                                       }
                                                                                       wrapperBorderRadius={
                                                                                         7
                                                                                       }
                                                                                       fontSize={
                                                                                         8
                                                                                       }
                                                                                     />
                                                                                   </div>
                                                                                 ) : res.component ==
                                                                                   "Text Field" ? (
                                                                                   <Grid
                                                                                     container
                                                                                     item
                                                                                     xs={
                                                                                       12
                                                                                     }
                                                                                     alignItems="center"
                                                                                     justify="flex-end"
                                                                                   >
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         7
                                                                                       }
                                                                                       sm={
                                                                                         7
                                                                                       }
                                                                                       md={
                                                                                         7
                                                                                       }
                                                                                       lg={
                                                                                         7
                                                                                       }
                                                                                       xl={
                                                                                         7
                                                                                       }
                                                                                     >
                                                                                       <TextField
                                                                                         // label="%"
                                                                                         placeholder={
                                                                                           res.value +
                                                                                           "℃"
                                                                                         }
                                                                                         // style={{marginTop:'3px',marginLeft:'18px',"letter-spacing":"9px",width:'45px'}}
                                                                                         name="Set_Point"
                                                                                         autoComplete="off"
                                                                                         // formatter.format(freq)
                                                                                         value={
                                                                                           setPointvalue
                                                                                         }
                                                                                         onChange={
                                                                                           handleChangeForsetpointRAT
                                                                                         }
                                                                                         className={
                                                                                           classes.text_field
                                                                                         }
                                                                                         // variant="outlined"
                                                                                         // style={{ marginTop: '3vh' }}
                                                                                       />
                                                                                     </Grid>
                                                                                     <Grid
                                                                                       item
                                                                                       xs={
                                                                                         5
                                                                                       }
                                                                                       sm={
                                                                                         5
                                                                                       }
                                                                                       md={
                                                                                         5
                                                                                       }
                                                                                       lg={
                                                                                         5
                                                                                       }
                                                                                       xl={
                                                                                         5
                                                                                       }
                                                                                     >
                                                                                       <Paper
                                                                                         className={
                                                                                           classes.set_button
                                                                                         }
                                                                                         onClick={() =>
                                                                                           handleClickRat(
                                                                                             props
                                                                                           )
                                                                                         }
                                                                                         style={{
                                                                                           backgroundColor:
                                                                                             "#0123B4",
                                                                                           display:
                                                                                             "flex",
                                                                                           justifyContent:
                                                                                             "center",
                                                                                           cursor:
                                                                                             "pointer",
                                                                                           marginTop:
                                                                                             "1vh",
                                                                                           pointerEvents:
                                                                                             roleId !=
                                                                                             2
                                                                                               ? "none"
                                                                                               : "",
                                                                                           opacity:
                                                                                             roleId !=
                                                                                             2
                                                                                               ? "0.4"
                                                                                               : "",
                                                                                         }}
                                                                                       >
                                                                                         <div
                                                                                           style={{
                                                                                             color:
                                                                                               "white",
                                                                                           }}
                                                                                         >
                                                                                           set
                                                                                         </div>
                                                                                       </Paper>
                                                                                     </Grid>
                                                                                   </Grid>
                                                                                 ) : (
                                                                                   <>

                                                                                   </>
                                                                                 )}
                                                                               </Grid>
                                                                               <Grid
                                                                                 item
                                                                                 xs={
                                                                                   1
                                                                                 }
                                                                                 sm={
                                                                                   1
                                                                                 }
                                                                                 md={
                                                                                   1
                                                                                 }
                                                                                 lg={
                                                                                   1
                                                                                 }
                                                                                 xl={
                                                                                   1
                                                                                 }
                                                                               ></Grid>
                                                                             </Grid>
                                                                           </Grid>
                                                                         </>
                                                                       ) : (
                                                                         <></>
                                                                       )
                                                                   )}
                                                                 </>
                                                               ) : (
                                                                 <div
                                                                   style={{
                                                                     display:
                                                                       "flex",
                                                                     justifyContent:
                                                                       "center",
                                                                     marginTop:
                                                                       "20vh",
                                                                     fontSize:
                                                                       "1vh",
                                                                   }}
                                                                 >
                                                                   No Equipment
                                                                   Available
                                                                 </div>
                                                               )}
                                                             </Card>
                                                           </Grid>
                                                           <Grid
                                                             item
                                                             xs={12}
                                                             sm={12}
                                                             md={12}
                                                             lg={12}
                                                             xl={12}
                                                             xxl={12}
                                                           >
                                                             {/* <Card
                       className={classes.paper}
                       style={{
                         marginTop:'0.5vh',
                         // boxShadow:"0 4px 10px 2px rgba(0, 0, 0, 0.1)",
                         // backgroundColor: " #ffffff",
                         borderRadius: "6px",
                         height: "28.5vh",
                       }}
                     >
              
 
                     </Card> */}
                                                           </Grid>
                                                         </Grid>
                                                       </Grid>
                                                     </Grid>
                                                   </Grid>
                                                   <SemanticToastContainer position="top-center" />
                                                 </div>
                                               );
                                             }
