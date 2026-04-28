import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "./../../api";
import { useSelector, useDispatch } from "react-redux";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Paper from "@material-ui/core/Paper";
import { Grid, Typography, Card, ButtonBase, Divider } from "@material-ui/core";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Select from "@material-ui/core/Select";
import SemiCircleProgressBar from "react-progressbar-semicircle";
// import image from './../../assets/img/CT.png'
import image from "./../../assets/img/Chiller_unicham.jpg";
import Success from "components/Typography/Success";
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import TimeS from "./../TimeS";
import Dialog from "@material-ui/core/Dialog";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import SwitchSelector from "react-switch-selector";
import ChillerReports from "./glChillerReports";
import PumpPage from "./GlPrimaryPump";
import CreateIcon from "@material-ui/icons/Create";
import LandingPage from "./../../views/Heatmap/upsEmsLanding";
import Tooltip1 from "@material-ui/core/Tooltip";
import { element } from "prop-types";
import ReactSpeedometer from "react-d3-speedometer";
import FieldDeviceGraphs from "../Dashboard/FieldDeviceGraphs";
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

const Leaflet = require("leaflet");

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize: "5px",
  },
})(Tooltip1);

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  faults_paper: {
    // padding: theme.spacing(1),
    // borderRadius:"37px",
    color: "white",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justify: "center",
    //  height:'3.5vh',
    backgroundColor: "blue",
    // [theme.breakpoints.down('sm')]: {
    //   width:"7.5vh"
    // },
    // [theme.breakpoints.up('md')]: {
    //   width:"6vh"
    // },
    // [theme.breakpoints.up('lg')]: {
    //   width:"7.5vh"
    // },
    // [theme.breakpoints.up('xl')]: {
    //   width:"7.5vh"
    // },
  },
});

const processDataFromJson = false;

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const useStyles = makeStyles((theme) => ({
  customDialogPump: {
    cursor: "pointer",
    // Set the desired width for the dialog
    height: window.innerHeight == "1080" ? "496px" : "330px", // Adjust this value as needed
    "max-width": window.innerHeight == "1080" ? "1700px" : "700px", // Adjust this value as needed
    // width: '700px', // Adjust this value as needed
  },
  customDialog: {
    cursor: "pointer",
    // Set the desired width for the dialog
    height: "480px", // Adjust this value as needed
    width: window.innerHeight == "1080" ? "1000px" : "700px", // Adjust this value as needed
  },
  root: {
    flexGrow: 1,
    marginTop: "-3vh",
  },
  card: {
    padding: theme.spacing(2),
    textAlign: "center",
    // color: theme.palette.text.secondary,
  },
  papereg: {
    width: "5vh",
    height: "2vh",
    padding: theme.spacing(2),
    textAlign: "center",
    // color: theme.palette.text.secondary,
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    boxShadow: "0 4px 10px 5px rgba(0, 0, 0, 0.1)",
    backgroundColor: "white",
    borderRadius: "6px",
    height: "50vh",
    marginTop: "1vh",
  },
  alertspaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    borderRadius: "6px",
    height: "16vh",
    marginTop: "1vh",
  },
  paper1: {
    padding: theme.spacing(2),
    textAlign: "center",
    // color: theme.palette.text.secondary,
  },
  childpaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    borderRadius: "6px",
  },
  graphpaper: {
    height: "22vh",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: "6px",
  },
  graphpaper1: {
    height: "19.25vh",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: "6px",
  },
  graphpaper2: {
    height: "13vh",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: "6px",
  },
  select: {
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
  imagecard: {
    height: "68.25vh",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: "6px",
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
    // color: theme.palette.text.secondary,
  },
  datacards: {
    width: "100%",
    height: "13vh",
    margin: "1%",
    borderRadius: "0.8vw",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
  },
  semicircularbar: {
    height: "11vh",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: "6px",
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
  buttons: {
    font: "normal normal medium 16px/17px Bw Seido Round",
    color: "#FFFFFF",
    opacity: "1",
    width: "130%",
    height: "3.2vh",
    border: "none",
    cursor: "pointer",
    fontSize: "2vh",
    background: "#CE1E1E 0% 0% no-repeat padding-box;",
    borderRadius: "8px",
  },
  emptybuttons: {
    font: "normal normal medium 16px/17px Bw Seido Round",
    color: "grey",
    opacity: "1",
    width: "130%",
    height: "3.2vh",
    border: "none",
    cursor: "pointer",
    fontSize: "2vh",
    background: "rgb(239 229 229 / 87%)",
    borderRadius: "8px",
  },
  smallbuttons: {
    width: "29%",
    height: "3.2vh",
    backgroundColor: "rgb(239 229 229 / 87%)",
    border: "none",
    cursor: "pointer",
    fontSize: "2vh",
    borderRadius: "0.4vw",
    margin: "2%",
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
      fontSize: "1.4vh",
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
}));

function getJSONElement(myJson, elementPath = []) {
  let eValue = myJson;
  for (let i = 0; i < elementPath.length; i++) {
    if (eValue !== undefined && eValue !== null) {
      eValue = eValue[elementPath[i]];

      // Check if the value is the string "NULL" and return null
      if (typeof eValue === "string" && eValue.toUpperCase() === "NULL") {
        return null;
      }
    } else {
      eValue = undefined;
      console.log(`Unable to process JSON: ${elementPath}`);
      break;
    }
  }
  return eValue !== undefined ? eValue : null;
}

export default function App(props) {
  const classes = useStyles();
  const mapRef = React.createRef();
  const dispatch = useDispatch();
  const alerts = useSelector((state) => state.alarm.alarmData);
  const [eachChillerData, setEachChillerData] = React.useState([]);
  const [eachHeaderData, setEachHeaderData] = React.useState({});
  const [eachCPMData, setEachCPMData] = React.useState({});
  const [eachEachSeqPanelData, setEachSeqPanelData] = React.useState("");
  const [criticalAlertsChiller, setcriticalAlertsChiller] = React.useState(0);
  const [soluAlertsChiller, setsoluAlertsChiller] = React.useState(0);
  const [criticalAlertsCoolT, setcriticalAlertsCoolT] = React.useState(0);
  const [soluAlertsCoolT, setsoluAlertsCoolT] = React.useState(0);
  const [criticalAlertsPP, setcriticalAlertsPP] = React.useState(0);
  const [soluAlertsPP, setsoluAlertsPP] = React.useState(0);
  const [criticalAlertsSP, setcriticalAlertsSP] = React.useState(0);
  const [soluAlertsSP, setsoluAlertsSP] = React.useState(0);
  const [criticalAlertsCondenser, setcriticalAlertsCondenser] = React.useState(
    0
  );
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [soluAlertsCondenser, setsoluAlertsCondenser] = React.useState(0);
  ////////////////
  const [allFloorsAlarms, setAllFloorsAlarms] = React.useState(0);
  const [criticalAlarms, setCriticalAlarms] = React.useState(0);
  const [nonCriticalAlarms, setNonCriticalAlarms] = React.useState(0);
  ////////////////
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const [CWH_ST, setCWH_ST] = useState([]);
  const [CWH_RT, setCWH_RT] = useState([]);
  const [CWH_ST24Hr, setCWH_ST24Hr] = useState([]);
  const [CWH_RT24Hr, setCWH_RT24Hr] = useState([]);
  const [CndW_HST, setCndW_HST] = useState([]);
  const [CndW_HRT, setCndW_HRT] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [pumpModal, setPumpModal] = useState(false);
  const [triggerModal, setTriggerModal] = useState(false);
  const [disable, setDisable] = useState(false);
  const [opn_SS, setOpn_SS] = useState(0);
  const [dpt1, setDPT1] = useState("");
  const [dpt2, setDPT2] = useState("");
  const [dpt3, setDPT3] = useState("");
  const [dpt4, setDPT4] = useState("");
  const [primaryPump, setPrimaryPump] = useState([]);
  const [AtcsPump, setAtcsPump] = useState([]);
  // console.log("PP", primaryPump);
  const [pripAlerts, setPriPAlerts] = useState([]);
  const [AtcspAlerts, setAtcsPAlerts] = useState([]);
  // console.log("primaryAlerts", pripAlerts);
  const [secondaryPump, setSecondaryPump] = useState([]);
  const [secpAlerts, setSecPAlerts] = useState([]);
  const [coolingTowers, setCoolingTowers] = useState([]);
  const [ctAlerts, setCTAlerts] = useState([]);
  // console.log("CoolingTower", ctAlerts);
  const [condensers, setCondensers] = useState([]);
  // console.log("condenserssss", condensers);
  const [condenserAlerts, setCondenserAlerts] = useState([]);
  // console.log("CondenserAlerts", condenserAlerts);
  const [pumpType, setPumpType] = useState("");
  const [pumpData, setPumpData] = useState({});
  const [modalHeading, setModalHeading] = useState("Parameter");
  const [isHovered, setIsHovered] = useState(false);
  const [cpmres, setCPMRes] = useState("");
  const [cpmAutoManualStatus, setCpmAutoManualStatus] = useState(0);
  const [cpmOverideStatus, setCpmOverideStatus] = useState(0);
  const [cpmSSType, setCpmSSType] = useState("");
  const [cpmid, setCpmid] = useState("");
  const [cpmCurrentStatedata, setCPMCurrentStateData] = useState({});
  const [CDW_HST, setCDW_HST] = useState([]);
  const [CDW_HRT, setCDW_HRT] = useState([]);
  const [CDW_HST24Hr, setCDW_HST24Hr] = useState([]);
  const [CDW_HRT24Hr, setCDW_HRT24Hr] = useState([]);
  const [btuMeterData, setBtuMeterData] = useState([]);
  // btuValue should be numeric or null; start as null so we can detect absence
  const [btuValue, setBtuValue] = useState(null);
  const [rawBtuValue, setRawBtuValue] = useState(0);
  const [btuUnit, setBtuUnit] = useState("");
  const [plantKWValue, setPlantKWValue] = useState("");
  const [plantKWTR, setPlantKWTR] = useState("");
  const [ikwPerTr, setIkwPerTr] = useState(0);
  const [pumpStationData, setPumpStationData] = useState([]);

  let chillers =
    processDataFromJson == true
      ? eachChillerData
      : Object.values(eachChillerData).sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
  let header =
    processDataFromJson == true
      ? eachHeaderData
      : Object.values(eachHeaderData).sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
  let cpm =
    processDataFromJson == true
      ? eachCPMData
      : Object.values(eachCPMData).sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
  // let seqPanel =
  //   processDataFromJson == true
  //     ? eachEachSeqPanelData
  //     : Object.values(eachEachSeqPanelData).sort(function (a, b) {
  //         return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  //       });
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(0, 0),
    className: "leaflet-div-icon-2",
  });
  const iconDevice2 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/Green_dot_blink.gif"),
    iconSize: new Leaflet.Point(30, 30),
    className: "leaflet-div-icon-2",
  });
  const iconDevice3 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/red_icon.png"),
    iconSize: new Leaflet.Point(30, 30),
    className: "leaflet-div-icon-2",
  });
  const options = [
    {
      selectedFontColor: "white",
      label: "OFF",
      value: 0,
      selectedBackgroundColor: grayColor[0],
    },
    {
      selectedFontColor: "white",
      label: "ON",
      value: 1,
      selectedBackgroundColor: greenColor[0],
    },
    // {
    //   selectedFontColor: "white",
    //   label: "Off",
    //   value: 1,
    //   selectedBackgroundColor: "red",
    // },
    // {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "orange",
    // },
  ];

  const options2 = [
    {
      label: "OFF",
      value: 0,
      selectedBackgroundColor: grayColor[0],
      // fontSize:"2"
    },
    {
      label: "ON",
      value: 1,
      selectedBackgroundColor: greenColor[0],
      // fontSize:"2"
    },
  ];

  const initialSelectedIndex = options.findIndex(
    ({ value }) => value === "Manual"
  );

  const onClickEachCT = (type, data) => {
    props.history.push({
      pathname: `/admin/GlCoolingTower`,
      state: {
        data: data,
        type: type,
      },
    });
  };

  const onClickPump = (type, data) => {
    props.history.push({
      pathname: `/admin/GlPrimaryPump`,
      state: {
        click: "heading",
        type: type,
        data: data,
      },
    });
  };

  const onClickEachPump = (name, data) => {
    setPumpModal(true);
    setPumpType(name);
    setPumpData(data);
  };

  const handleClick = (data) => {
    console.log("single Click");
    setModalHeading(data);
    setModal(true);
  };

  const handleDoubleClick = () => {
    console.log("Double Click");
    // setModalHeading(data)
    setModal2(true);
  };

  const handleClose = () => {
    setPumpModal(false);
    setModal(false);
    setTriggerModal(false);
  };

  const handleClose2 = () => {
    setModal2(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setModal2(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg("");
  };
  const onClickTriggerIcon = (data) => {
    setTriggerModal(true);
  };

  const onClickOfTrigger = (data) => {
    let req = {};
    if (data == "start") {
      req = { startCPMScenario: "START_CHILLER_SYSTEM" };
    } else if (data == "updates") {
      req = {};
    }
    api.floor
      .startCPMTrigger(req)
      .then((response) => {
        if (
          response !== null &&
          response !== undefined &&
          response.data !== null &&
          response.data != undefined
        ) {
          // console.log("api res",response.data)

          setCPMRes(JSON.stringify(response.data, null, " "));
        }
      })
      .catch((error) => {
        console.log("api err", error);
        setCPMRes(error);
      });
  };

  const DeviceAlarms = (response, devicetype) => {
    console.log("🔍 DeviceAlarms called with:", devicetype, response);
    if (!response || Object.keys(response).length === 0) {
      // If there is no response for this device type, zero out any metrics
      if (devicetype === "BTU") {
        setBtuValue(0);
      }
      return;
    }

    let respp = Object.values(response).sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    // if (devicetype === "BTU") {
    //   if (respp.length > 0) {
    //     const btuMeter = respp[0];
    //     const rawValue =
    //       btuMeter?.Eqp_Metrics?.Btu_Meter_Energy_Consump ||
    //       btuMeter?.Eqp_Attributes?.Btu_Meter_Energy_Consump?.presentValue;

    //     if (rawValue !== undefined && rawValue !== null) {
    //       const calculatedValue = rawValue.toFixed(2);
    //       setBtuValue(calculatedValue);
    //       setBtuMeterData(respp);
    //     }
    //   }
    //   return; // Exit early for BTU meters
    // }
    // if (devicetype === "BTU") {
    //   if (respp.length > 0) {
    //     const btuMeter = respp[0];

    //     // Try both possible locations for the BTU value
    //     let rawValue = null;

    //     if (
    //       btuMeter?.Eqp_Metrics?.Btu_Meter_Energy_Consump !== undefined &&
    //       btuMeter?.Eqp_Metrics?.Btu_Meter_Energy_Consump !== null
    //     ) {
    //       rawValue = btuMeter.Eqp_Metrics.Btu_Meter_Energy_Consump;
    //     } else if (
    //       btuMeter?.Eqp_Attributes?.Btu_Meter_Energy_Consump?.presentValue !==
    //         undefined &&
    //       btuMeter?.Eqp_Attributes?.Btu_Meter_Energy_Consump?.presentValue !==
    //         null
    //     ) {
    //       rawValue =
    //         btuMeter.Eqp_Attributes.Btu_Meter_Energy_Consump.presentValue;
    //     }

    //     console.log("BTU Raw Value:", rawValue);
    //     console.log("BTU Meter Object:", JSON.stringify(btuMeter, null, 2));

    //     if (
    //       rawValue !== undefined &&
    //       rawValue !== null &&
    //       !isNaN(parseFloat(rawValue))
    //     ) {
    //       const calculatedValue = parseFloat(rawValue).toFixed(2);
    //       console.log("calculatedValue", calculatedValue);
    //       setBtuValue(calculatedValue);
    //       setBtuMeterData(respp);
    //     } else {
    //       console.log("No valid BTU value found");
    //       setBtuValue("0.00");
    //     }
    //   }
    //   return;
    // }
    if (devicetype === "BTU") {
      // console.log("📊 BTU Meter Data:", JSON.stringify(respp, null, 2));
      // console.log("📊 BTU meters count:", respp.length);

      if (respp.length > 0) {
        const btuMeter = respp[0];
        // console.log("🔍 Full BTU Meter:", JSON.stringify(btuMeter, null, 2));

        // Try Eqp_Metrics first (some devices report value there), then Eqp_Attributes
        let metricVal =
          btuMeter?.Eqp_Metrics?.Btu_Meter_Energy_Consump ||
          btuMeter?.Eqp_Metrics?.BTU ||
          btuMeter?.Eqp_Metrics?.btu;
        let mwhVal =
          btuMeter?.Eqp_Metrics?.Btu_Meter_Actual_Power?.presentValue ||
          btuMeter?.Eqp_Metrics?.Btu_Meter_Actual_Power ||
          btuMeter?.Eqp_Attributes?.Btu_Meter_Actual_Power?.presentValue;
        // If metricVal is an object, extract common fields
        if (metricVal && typeof metricVal === "object") {
          metricVal =
            metricVal.presentValue ??
            metricVal.param_value ??
            metricVal.value ??
            metricVal;
        }
        if (mwhVal && typeof mwhVal === "object") {
          mwhVal =
            mwhVal.presentValue ?? mwhVal.param_value ?? mwhVal.value ?? mwhVal;
        }

        let attrVal =
          btuMeter?.Eqp_Attributes?.Btu_Meter_Energy_Consump?.presentValue ||
          btuMeter?.Eqp_Attributes?.BTU?.presentValue ||
          btuMeter?.Eqp_Attributes?.btu?.presentValue;

        if (attrVal && typeof attrVal === "object") {
          attrVal =
            attrVal.presentValue ??
            attrVal.param_value ??
            attrVal.value ??
            attrVal;
        }

        // console.log(
        //   "➡️ BTU candidate metricVal:",
        //   metricVal,
        //   "attrVal:",
        //   attrVal
        // );

        let raw =
          typeof metricVal === "number" || !isNaN(Number(metricVal))
            ? metricVal
            : typeof attrVal === "number" || !isNaN(Number(attrVal))
            ? attrVal
            : null;

        if ((raw === undefined || raw === null) && btuMeter?.Eqp_Attributes) {
          const attrs = btuMeter.Eqp_Attributes;
          for (let k of Object.keys(attrs)) {
            const lower = k.toLowerCase();
            if (lower.includes("btu") || lower.includes("energy")) {
              const candidateVal = attrs[k]?.presentValue ?? attrs[k];
              if (
                candidateVal !== undefined &&
                candidateVal !== null &&
                !isNaN(Number(candidateVal))
              ) {
                raw = candidateVal;
                console.log("🧭 Found candidate attribute: ", k, candidateVal);
                break;
              }
            }
          }
        }

        if (raw !== null && raw !== undefined && !isNaN(Number(raw))) {
          const rawValue = Number(raw);
          const numericVal = Number(raw / 1000).toFixed(2);
          // console.log("💾 BTU numeric value detected:", numericVal);

          // Store numeric value to state
          setBtuValue(
            btuMeter?.Eqp_Attributes?.Btu_Meter_Energy_Consump?.presentValue
          );
          setRawBtuValue(
            btuMeter?.Eqp_Attributes?.Btu_Meter_Actual_Power?.presentValue
          );
          // setBtuValue(numericVal);
          // setRawBtuValue(rawValue);
          // Unit is static here as per your request — keep as MWH
          // setBtuUnit("MWH");
          setBtuMeterData(respp);
        } else {
          // console.log(
          //   "⚠️ BTU value missing/invalid, raw:",
          //   raw,
          //   "btuMeter:",
          //   JSON.stringify(btuMeter, null, 2)
          // );
          setBtuValue(0);
          setRawBtuValue(0);
        }
      } else {
        console.log("⚠️ BTU device array empty");
        setBtuValue(0);
        setRawBtuValue(0);
      }
      return;
    }

    // In your DeviceAlarms function, replace the NONGL_SS_EMS section with this:

    if (devicetype === "NONGL_SS_EMS") {
      // console.log("EMS DATA :", JSON.stringify(response, null, 2));

      if (response && typeof response === "object") {
        let totalKW = 0;

        Object.entries(response).forEach(([deviceId, deviceInfo]) => {
          // Skip non-device objects like "name", "type" etc.
          if (typeof deviceInfo !== "object" || !deviceInfo.Eqp_Attributes)
            return;

          // Extract KW from Attributes
          const kwAttr = deviceInfo?.Eqp_Attributes?.KW?.presentValue;

          if (
            kwAttr !== undefined &&
            kwAttr !== null &&
            !isNaN(parseFloat(kwAttr))
          ) {
            console.log(`Device ${deviceId} KW:`, kwAttr);
            totalKW += parseFloat(kwAttr);
          }
        });

        // console.log("Total Plant KW:", totalKW);
        setPlantKWValue(totalKW.toFixed(2));
      } else {
        // console.log("No EMS data available");
        setPlantKWValue("0.00");
      }

      return;
    }

    if (response.length !== 0) {
      let sdevices = [];
      let CriticalTotal = 0;
      let solutionTotal = 0;
      if (alerts.system.length === 0 && alerts.solution.length === 0) {
        let con = 0;
        // console.log("🧊 Checking device type:", devicetype);
        respp.map((element) => {
          // console.log("➡️ Device:", element.id, element.name);
          let obj = {};
          con++;
          obj["name"] = element.name;
          obj["id"] = element.id;
          obj["type"] = element.type;
          obj["Eqp_Attributes"] = element["Eqp_Attributes"];
          obj["Eqp_Metrics"] = element["Eqp_Metrics"];
          obj["alerts_cri"] = 0;
          obj["alerts_solu"] = 0;
          sdevices.push(obj);
          if (respp.length === con) {
            if (devicetype == "Chillers") setEachChillerData(sdevices);
            if (devicetype == "Primary Pumps") setPriPAlerts(sdevices);
            if (devicetype == "ATCS") setAtcsPAlerts(sdevices);
            if (devicetype == "Secondary Pumps") setSecPAlerts(sdevices);
            if (devicetype == "Condenser Pumps") setCondenserAlerts(sdevices);
            if (devicetype == "Cooling Towers") setCTAlerts(sdevices);
            if (devicetype == "PRIMARY_SEQ_PANEL") setPumpStationData(sdevices);
          }
          return element;
        });
      }

      if (alerts.system.length > 0 && alerts.solution.length > 0) {
        console.log("🧊 Checking device type:", devicetype);
        respp.map((element) => {
          let obj = {};
          obj["name"] = element.name;
          obj["id"] = element.id;
          obj["type"] = element.type;
          obj["Eqp_Attributes"] = element["Eqp_Attributes"];
          obj["Eqp_Metrics"] = element["Eqp_Metrics"];
          let count = 0;
          let ci = 0;
          Object.keys(alerts.locationWise).forEach((key) => {
            if (key === element.Equipment_Group) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms);
              setCriticalAlarms(alerts.locationWise[key].critical);
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical);
            }
          });

          alerts.system.map((ele) => {
            if (element.id === ele.device_id) {
              console.log("✅ SYSTEM MATCH:", element.id, ele.device_id);
              count++;
              ci++;
              CriticalTotal++;
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci;
                // if(devicetype=="Chillers")setcriticalAlertsChiller(CriticalTotal)
                // if(devicetype=="Primary Pumps")setcriticalAlertsPP(CriticalTotal)
                // if(devicetype=="Secondary Pumps")setcriticalAlertsSP(CriticalTotal)
                // if(devicetype=="Condenser Pumps")setcriticalAlertsCondenser(CriticalTotal)
                // if(devicetype=="Cooling Towers")setcriticalAlertsCoolT(CriticalTotal)
                let si = 0;
                let counts = 0;
                alerts.solution.map((ele1) => {
                  if (element.name === ele1.device_name) {
                    console.log(
                      "✅ SOLUTION MATCH:",
                      element.name,
                      ele1.device_name
                    );
                    counts++;
                    si++;
                    solutionTotal++;
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si;
                      sdevices.push(obj);
                      if (devicetype == "Chillers") {
                        // setsoluAlertsChiller(solutionTotal)
                        setEachChillerData(sdevices);
                      }
                      if (devicetype == "Primary Pumps") {
                        // setsoluAlertsPP(solutionTotal)
                        setPriPAlerts(sdevices);
                      }
                      if (devicetype == "ATCS") {
                        // setsoluAlertsPP(solutionTotal)
                        setAtcsPAlerts(sdevices);
                      }
                      if (devicetype == "Secondary Pumps") {
                        // setsoluAlertsSP(solutionTotal)
                        setSecPAlerts(sdevices);
                      }
                      if (devicetype == "Condenser Pumps") {
                        // setsoluAlertsCondenser(solutionTotal)
                        setCondenserAlerts(sdevices);
                      }
                      if (devicetype == "Cooling Towers") {
                        // setsoluAlertsCoolT(solutionTotal)
                        setCTAlerts(sdevices);
                      }
                    }
                  } else {
                    counts++;
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si;
                      sdevices.push(obj);
                      if (devicetype == "Chillers") {
                        // setsoluAlertsChiller(solutionTotal)
                        setEachChillerData(sdevices);
                      }
                      if (devicetype == "Primary Pumps") {
                        // setsoluAlertsPP(solutionTotal)
                        setPriPAlerts(sdevices);
                      }
                      if (devicetype == "ATCS") {
                        // setsoluAlertsPP(solutionTotal)
                        setAtcsPAlerts(sdevices);
                      }
                      if (devicetype == "Secondary Pumps") {
                        // setsoluAlertsSP(solutionTotal)
                        setSecPAlerts(sdevices);
                      }
                      if (devicetype == "Condenser Pumps") {
                        // setsoluAlertsCondenser(solutionTotal)
                        setCondenserAlerts(sdevices);
                      }
                      if (devicetype == "Cooling Towers") {
                        // setsoluAlertsCoolT(solutionTotal)
                        setCTAlerts(sdevices);
                      }
                    }
                  }
                  return ele1;
                });
              }
            } else {
              count++;
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci;
                // if(devicetype=="Chillers")setcriticalAlertsChiller(CriticalTotal)
                // if(devicetype=="Primary Pumps")setcriticalAlertsPP(CriticalTotal)
                // if(devicetype=="Secondary Pumps")setcriticalAlertsSP(CriticalTotal)
                // if(devicetype=="Condenser Pumps")setcriticalAlertsCondenser(CriticalTotal)
                // if(devicetype=="Cooling Towers")setcriticalAlertsCoolT(CriticalTotal)
                let si = 0;
                let counts = 0;
                alerts.solution.map((ele) => {
                  if (element.id === ele.device_id) {
                    counts++;
                    si++;
                    solutionTotal++;
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si;
                      sdevices.push(obj);
                      if (devicetype == "Chillers") {
                        // setsoluAlertsChiller(solutionTotal)
                        setEachChillerData(sdevices);
                      }
                      if (devicetype == "Primary Pumps") {
                        // setsoluAlertsPP(solutionTotal)
                        setPriPAlerts(sdevices);
                      }
                      if (devicetype == "ATCS") {
                        // setsoluAlertsPP(solutionTotal)
                        setAtcsPAlerts(sdevices);
                      }
                      if (devicetype == "Secondary Pumps") {
                        // setsoluAlertsSP(solutionTotal)
                        setSecPAlerts(sdevices);
                      }
                      if (devicetype == "Condenser Pumps") {
                        // setsoluAlertsCondenser(solutionTotal)
                        setCondenserAlerts(sdevices);
                      }
                      if (devicetype == "Cooling Towers") {
                        // setsoluAlertsCoolT(solutionTotal)
                        setCTAlerts(sdevices);
                      }
                    }
                  } else {
                    counts++;
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si;
                      sdevices.push(obj);
                      if (devicetype == "Chillers") {
                        // setsoluAlertsChiller(solutionTotal)
                        setEachChillerData(sdevices);
                      }
                      if (devicetype == "Primary Pumps") {
                        // setsoluAlertsPP(solutionTotal)
                        setPriPAlerts(sdevices);
                      }
                      if (devicetype == "ATCS") {
                        // setsoluAlertsPP(solutionTotal)
                        setAtcsPAlerts(sdevices);
                      }
                      if (devicetype == "Secondary Pumps") {
                        // setsoluAlertsSP(solutionTotal)
                        setSecPAlerts(sdevices);
                      }
                      if (devicetype == "Condenser Pumps") {
                        // setsoluAlertsCondenser(solutionTotal)
                        setCondenserAlerts(sdevices);
                      }
                      if (devicetype == "Cooling Towers") {
                        // setsoluAlertsCoolT(solutionTotal)
                        setCTAlerts(sdevices);
                      }
                    }
                  }
                  return ele;
                });
              }
            }
            return ele;
          });
          return element;
        });
      }

      if (alerts.system.length > 0 && alerts.solution.length === 0) {
        respp.map((element) => {
          let obj = {};
          obj["name"] = element.name;
          obj["id"] = element.id;
          obj["type"] = element.type;
          obj["Eqp_Attributes"] = element["Eqp_Attributes"];
          obj["Eqp_Metrics"] = element["Eqp_Metrics"];
          let count = 0;
          let ci = 0;

          Object.keys(alerts.locationWise).forEach((key) => {
            if (key === element.Equipment_Group) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms);
              setCriticalAlarms(alerts.locationWise[key].critical);
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical);
            }
          });

          alerts.system.map((ele) => {
            if (element.id === ele.device_id) {
              count++;
              ci++;
              CriticalTotal++;
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci;
                obj["alerts_solu"] = 0;
                // if(devicetype=="Chillers")setcriticalAlertsChiller(CriticalTotal)
                // if(devicetype=="Primary Pumps")setcriticalAlertsPP(CriticalTotal)
                // if(devicetype=="Secondary Pumps")setcriticalAlertsSP(CriticalTotal)
                // if(devicetype=="Condenser Pumps")setcriticalAlertsCondenser(CriticalTotal)
                // if(devicetype=="Cooling Towers")setcriticalAlertsCoolT(CriticalTotal)
                sdevices.push(obj);
                if (devicetype == "Chillers") setEachChillerData(sdevices);
                if (devicetype == "Primary Pumps") setPriPAlerts(sdevices);
                if (devicetype == "ATCS") setAtcsPAlerts(sdevices);

                if (devicetype == "Secondary Pumps") setSecPAlerts(sdevices);
                if (devicetype == "Condenser Pumps")
                  setCondenserAlerts(sdevices);
                if (devicetype == "Cooling Towers") setCTAlerts(sdevices);
              }
            } else {
              count++;
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci;
                obj["alerts_solu"] = 0;
                // if(devicetype=="Chillers")setcriticalAlertsChiller(CriticalTotal)
                // if(devicetype=="Primary Pumps")setcriticalAlertsPP(CriticalTotal)
                // if(devicetype=="Secondary Pumps")setcriticalAlertsSP(CriticalTotal)
                // if(devicetype=="Condenser Pumps")setcriticalAlertsCondenser(CriticalTotal)
                // if(devicetype=="Cooling Towers")setcriticalAlertsCoolT(CriticalTotal)
                sdevices.push(obj);
                if (devicetype == "Chillers") setEachChillerData(sdevices);
                if (devicetype == "Primary Pumps") setPriPAlerts(sdevices);
                if (devicetype == "ATCS") setAtcsPAlerts(sdevices);

                if (devicetype == "Secondary Pumps") setSecPAlerts(sdevices);
                if (devicetype == "Condenser Pumps")
                  setCondenserAlerts(sdevices);
                if (devicetype == "Cooling Towers") setCTAlerts(sdevices);
              }
            }
            return ele;
          });
          return element;
        });
      }

      if (alerts.system.length === 0 && alerts.solution.length > 0) {
        respp.map((element) => {
          let obj = {};
          obj["name"] = element.name;
          obj["id"] = element.id;
          obj["type"] = element.type;
          obj["Eqp_Attributes"] = element["Eqp_Attributes"];
          obj["Eqp_Metrics"] = element["Eqp_Metrics"];
          let count = 0;
          let ci = 0;

          Object.keys(alerts.locationWise).forEach((key) => {
            if (key === element.Equipment_Group) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms);
              setCriticalAlarms(alerts.locationWise[key].critical);
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical);
            }
          });

          alerts.solution.map((ele) => {
            if (element.id === ele.device_id) {
              count++;
              ci++;
              solutionTotal++;
              if (alerts.solution.length === count) {
                obj["alerts_solu"] = ci;
                obj["alerts_cri"] = 0;
                sdevices.push(obj);
                if (devicetype == "Chillers") {
                  // setsoluAlertsChiller(solutionTotal)
                  setEachChillerData(sdevices);
                }
                if (devicetype == "Primary Pumps") {
                  // setsoluAlertsPP(solutionTotal)
                  setPriPAlerts(sdevices);
                }
                if (devicetype == "ATCS") {
                  // setsoluAlertsPP(solutionTotal)
                  setAtcsPAlerts(sdevices);
                }
                if (devicetype == "Secondary Pumps") {
                  // setsoluAlertsSP(solutionTotal)
                  setSecPAlerts(sdevices);
                }
                if (devicetype == "Condenser Pumps") {
                  // setsoluAlertsCondenser(solutionTotal)
                  setCondenserAlerts(sdevices);
                }
                if (devicetype == "Cooling Towers") {
                  // setsoluAlertsCoolT(solutionTotal)
                  setCTAlerts(sdevices);
                }
              }
            } else {
              count++;
              if (alerts.solution.length === count) {
                obj["alerts_solu"] = ci;
                obj["alerts_cri"] = 0;
                sdevices.push(obj);
                if (devicetype == "Chillers") {
                  // setsoluAlertsChiller(solutionTotal)
                  setEachChillerData(sdevices);
                }
                if (devicetype == "Primary Pumps") {
                  // setsoluAlertsPP(solutionTotal)
                  setPriPAlerts(sdevices);
                }
                if (devicetype == "ATCS") {
                  // setsoluAlertsPP(solutionTotal)
                  setAtcsPAlerts(sdevices);
                }
                if (devicetype == "Secondary Pumps") {
                  // setsoluAlertsSP(solutionTotal)
                  setSecPAlerts(sdevices);
                }
                if (devicetype == "Condenser Pumps") {
                  // setsoluAlertsCondenser(solutionTotal)
                  setCondenserAlerts(sdevices);
                }
                if (devicetype == "Cooling Towers") {
                  // setsoluAlertsCoolT(solutionTotal)
                  setCTAlerts(sdevices);
                }
                if (devicetype === "PRIMARY_SEQ_PANEL") {
                  setPumpStationData(sdevices);
                }
              }
            }
            return ele;
          });
          return element;
        });
      }
    } else {
      // if(devicetype=="Chillers")
      setEachChillerData([]);
      // if(devicetype=="Primary Pumps")
      setPriPAlerts([]);
      setAtcsPAlerts([]);
      // if(devicetype=="Secondary Pumps")
      setSecPAlerts([]);
      // if(devicetype=="Condenser Pumps")
      setCondenserAlerts([]);
      // if(devicetype=="Cooling Towers")
      setCTAlerts([]);
      setPumpStationData([]);
    }
  };

  const onChangeSEQpanel = (newValue) => {
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);
    setOpn_SS(newValue);

    const req = {
      ss_type: "NONGL_SS_PRIMARY_SEQ_PANEL",
      ss_id: eachEachSeqPanelData.id,
      gl_command:
        newValue == 0 ? "TURN_OFF" : newValue == 1 ? "TURN_ON" : "AUTO",
      value: newValue === 1 ? "active" : newValue === 0 ? "inactive" : "Auto",
      param_id: "PP_Seq_Pnl_Cmd",
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };
    // console.log("sequencing panel", seqPanel);
    api.floor
      .cpmOnOffControl(req)
      .then((response) => {
        toast({
          type: "info",
          icon: "check circle",
          // title:"Success",
          description: response,
          time: 3000,
        });
      })
      .catch((err) => {
        setOpenerr(true);
        setErrmsg(err);
      });
  };

  useEffect(() => {
    api.floor
      .cpmstate()
      .then((res) => {
        console.log("cpmstate", res);
        if (res) {
          localStorage.setItem(
            "CPM_AM_Status",
            res.cpm_mode === "active" ? "true" : "false"
          );
          setCpmAutoManualStatus(res.cpm_mode === "active" ? 1 : 0);
        }
      })
      .catch((error) => {
        if (error.response) {
          setErrmsg(error.response.data.message);
          // setOpenerr(true)
        } else {
          setErrmsg("");
        }
      });
    api.floor
      .cpmOverrideState()
      .then((res) => {
        console.log("cpmoverride", res);
        if (res) {
          localStorage.setItem(
            "CPM_Override_Status",
            res.manual_mode == "active" ? "true" : "false"
          );
          setCpmOverideStatus(res.manual_mode === "active" ? 1 : 0);
        }
      })
      .catch((error) => {
        if (error.response) {
          setErrmsg(error.response.data.message);
          // setOpenerr(true)
        } else {
          setErrmsg("");
        }
      });
    api.floor
      .cpmGetDevData()
      .then((res) => {
        console.log("chiller", res);
        DeviceAlarms(res["NONGL_SS_CHILLER"], "Chillers");
        
        DeviceAlarms(res["NONGL_SS_PRIMARY_VARIABLE_PUMPS"], "Primary Pumps");
        DeviceAlarms(res["NONGL_SS_PRIMARY_SEQ_PANEL"], "PRIMARY_SEQ_PANEL");
        //DeviceAlarms(res["NONGL_SS_PRIMARY_VARIABLE_PUMPS"], "Primary Pumps");
        DeviceAlarms(res["NONGL_SS_CONDENSER_PUMPS"], "Condenser Pumps");
        DeviceAlarms(res["NONGL_SS_COOLING_TOWER"], "Cooling Towers");
        //DeviceAlarms(res["NONGL_SS_ATCS"], "ATCS");
        //DeviceAlarms(res["NONGL_SS_BTU_METER"], "BTU");
        DeviceAlarms(res["NONGL_SS_EMS"], "NONGL_SS_EMS");

        // DeviceAlarms(res["NONGL_SS_SECONDARY_PUMPS"], "Secondary Pumps");
        if (res["NONGL_SS_CPM"]) {
          const firstObj = res["NONGL_SS_CPM"];
          const firstCPMKey = Object.keys(res["NONGL_SS_CPM"])[0];
          if (firstCPMKey && firstObj[firstCPMKey]) {
            // let CPM_Stat =
            //   firstObj[firstCPMKey].Eqp_Metrics.Equipment_GL_CPM_MODE;
            // setCpmAutoManualStatus(CPM_Stat == "active" ? 1 : 0);
            setCpmSSType("NONGL_SS_CPM");
            setCpmid(firstObj[firstCPMKey].id);
            // localStorage.setItem("CPM_AM_Status", CPM_Stat);
          }
        }
        if (res["NONGL_SS_PRIMARY_SEQ_PANEL"]) {
          // setEachSeqPanelData(Object.values(res["NONGL_SS_PRIMARY_SEQ_PANEL"]));
          let idd = "";
          let cpmdataArr = Object.values(res["NONGL_SS_PRIMARY_SEQ_PANEL"]);
          Object.values(cpmdataArr).forEach((res) => {
            idd = res;
          });
          setEachSeqPanelData(idd);
        }
        if (res["NONGL_SS_COMMON_HEADER"]) {
          setEachHeaderData(Object.values(res["NONGL_SS_COMMON_HEADER"]));
          const firstObject = res["NONGL_SS_COMMON_HEADER"];
          console.log(
            "object",
            Object.values(res["NONGL_SS_COMMON_HEADER"])[0]
          );

          const firstKey = Object.keys(res["NONGL_SS_COMMON_HEADER"]);
          console.log("id...", firstKey);
          if (firstKey && firstObject[firstKey].id != undefined) {
            let reqe = {
              startdate: "start",
              enddate: "end",
            };

            api.floor
              .getDeviceData(
                reqe,
                Object.values(res["NONGL_SS_COMMON_HEADER"])[0].id,
                "NONGL_SS_COMMON_HEADER",
                "1 HOUR"
              )

              .then((res) => {
                if (res.graphData.length) {
                  if (res.graphData[0]["CWH_ST"]) {
                    setCWH_ST(res.graphData[0]["CWH_ST"]);
                  }
                  if (res.graphData[0]["CWH_RT"]) {
                    setCWH_RT(res.graphData[0]["CWH_RT"]);
                  }
                  if (res.graphData[0]["CDW_HST"]) {
                    setCDW_HST(res.graphData[0]["CDW_HST"]);
                  }
                  if (res.graphData[0]["CDW_HRT"]) {
                    setCDW_HRT(res.graphData[0]["CDW_HRT"]);
                  }
                }
              })
              .catch((error) => {
                if (error.response) {
                  // setOpenerr(true)
                  setErrmsg(error.response.data.message);
                } else {
                  setErrmsg("");
                }
              });
            let req = {
              startdate: "start",
              enddate: "end",
            };
            api.floor
              .getDeviceData(
                req,
                firstObject[firstKey].id,
                "NONGL_SS_COMMON_HEADER",
                "1 DAY"
              )
              .then((res) => {
                if (res.graphData.length) {
                  if (res.graphData[0]["CWH_ST"]) {
                    setCWH_ST24Hr(res.graphData[0]["CWH_ST"]);
                  }
                  if (res.graphData[0]["CWH_RT"]) {
                    setCWH_RT24Hr(res.graphData[0]["CWH_RT"]);
                  }
                  if (res.graphData[0]["CDW_HST"]) {
                    setCDW_HST24Hr(res.graphData[0]["CDW_HST"]);
                  }
                  if (res.graphData[0]["CDW_HRT"]) {
                    setCDW_HRT24Hr(res.graphData[0]["CDW_HRT"]);
                  }
                }
              })
              .catch((error) => {
                if (error.response) {
                  // setOpenerr(true)
                  setErrmsg(error.response.data.message);
                } else {
                  setErrmsg("");
                }
              });
          }
        }
      })
      .catch((error) => {
        if (error.response) {
          setErrmsg(error.response.data.message);
          // setOpenerr(true)
        } else {
          setErrmsg("");
        }
      });
    api.floor
      .cpmCurrentState()
      .then((res) => {
        setCPMCurrentStateData(res);
      })
      .catch((error) => {
        if (error.response) {
          setErrmsg(error.response.data.message);
          // setOpenerr(true)
        } else {
          setErrmsg("");
        }
      });

    const timer = setInterval(() => {
      api.floor
        .cpmCurrentState()
        .then((res) => {
          setCPMCurrentStateData(res);
        })
        .catch((error) => {
          if (error.response) {
            setErrmsg(error.response.data.message);
            // setOpenerr(true)
          } else {
            setErrmsg("");
          }
        });
      api.floor
        .cpmstate()
        .then((res) => {
          if (res) {
            localStorage.setItem(
              "CPM_AM_Status",
              res.cpm_mode === "active" ? "true" : "false"
            );
            setCpmAutoManualStatus(res.cpm_mode === "active" ? 1 : 0);
          }
        })
        .catch((error) => {
          if (error.response) {
            setErrmsg(error.response.data.message);
            // setOpenerr(true)
          } else {
            setErrmsg("");
          }
        });
      api.floor
        .cpmOverrideState()
        .then((res) => {
          if (res) {
            // localStorage.setItem(
            //   "CPM_AM_Status",
            //   res.manual_mode === "active" ? "true" : "false"
            // );        console.log("cpmoverride", res);
            // console.log("cpmoverride", res);
            localStorage.setItem(
              "CPM_Override_Status",
              res.manual_mode == "active" ? "true" : "false"
            );
            setCpmOverideStatus(res.manual_mode === "active" ? 1 : 0);
          }
        })
        .catch((error) => {
          if (error.response) {
            setErrmsg(error.response.data.message);
            // setOpenerr(true)
          } else {
            setErrmsg("");
          }
        });
      api.floor
        .cpmGetDevData()
        .then((res) => {
          console.log("responseee", res);
          DeviceAlarms(res["NONGL_SS_CHILLER"], "Chillers");
          console.log("responseee", res);
          if (res["NONGL_SS_CPM"]) {
            const firstObj = res["NONGL_SS_CPM"];
            const firstCPMKey = Object.keys(res["NONGL_SS_CPM"])[0];
            if (firstCPMKey && firstObj[firstCPMKey]) {
              // let CPM_Stat =
              //   firstObj[firstCPMKey].Eqp_Metrics.Equipment_GL_CPM_MODE;
              // localStorage.setItem("CPM_AM_Status", CPM_Stat);
              // setCpmAutoManualStatus(CPM_Stat == "active" ? 1 : 0);
              setCpmSSType("NONGL_SS_CPM");
              setCpmid(firstObj[firstCPMKey].id);
            }
          }
          if (res["NONGL_SS_COMMON_HEADER"]) {
            setEachHeaderData(Object.values(res["NONGL_SS_COMMON_HEADER"]));
            const firstObject = res["NONGL_SS_COMMON_HEADER"];
            const firstKey = Object.keys(res["NONGL_SS_COMMON_HEADER"])[0];
            if (firstKey && firstObject[firstKey].id != undefined) {
              let req = {
                startdate: "start",
                enddate: "end",
              };

              api.floor
                .getDeviceData(
                  req,
                  firstObject[firstKey].id,
                  "NONGL_SS_COMMON_HEADER",
                  "1 HOUR"
                )
                .then((res) => {
                  if (res.graphData.length) {
                    if (res.graphData[0]["CWH_ST"]) {
                      setCWH_ST(res.graphData[0]["CWH_ST"]);
                    }
                    if (res.graphData[0]["CWH_RT"]) {
                      setCWH_RT(res.graphData[0]["CWH_RT"]);
                    }
                    if (res.graphData[0]["CDW_HST"]) {
                      setCDW_HST(res.graphData[0]["CDW_HST"]);
                    }
                    if (res.graphData[0]["CDW_HRT"]) {
                      setCDW_HRT(res.graphData[0]["CDW_HRT"]);
                    }
                  }
                })
                .catch((error) => {
                  if (error.response) {
                    // setOpenerr(true)
                    setErrmsg(error.response.data.message);
                  } else {
                    setErrmsg("");
                  }
                });
              let reqe = {
                startdate: "start",
                enddate: "end",
              };
              api.floor
                .getDeviceData(
                  reqe,
                  firstObject[firstKey].id,
                  "NONGL_SS_COMMON_HEADER",
                  "1 DAY"
                )
                .then((res) => {
                  if (res.graphData.length) {
                    if (res.graphData[0]["CWH_ST"]) {
                      setCWH_ST24Hr(res.graphData[0]["CWH_ST"]);
                    }
                    if (res.graphData[0]["CWH_RT"]) {
                      setCWH_RT24Hr(res.graphData[0]["CWH_RT"]);
                    }
                    if (res.graphData[0]["CDW_HST"]) {
                      setCDW_HST24Hr(res.graphData[0]["CDW_HST"]);
                    }
                    if (res.graphData[0]["CDW_HRT"]) {
                      setCDW_HRT24Hr(res.graphData[0]["CDW_HRT"]);
                    }
                  }
                })
                .catch((error) => {
                  if (error.response) {
                    // setOpenerr(true)
                    setErrmsg(error.response.data.message);
                  } else {
                    setErrmsg("");
                  }
                });
            }
          }
          if (res["NONGL_SS_PRIMARY_SEQ_PANEL"]) {
            const panelArr = Object.values(res["NONGL_SS_PRIMARY_SEQ_PANEL"]);

            // find object that contains PP_Seq_Pnl_Cmd
            const obj = panelArr.find(
              (item) =>
                item?.Eqp_Attributes?.PP_Seq_Pnl_Cmd?.presentValue !== undefined
            );

            const pv = obj?.Eqp_Attributes?.PP_Seq_Pnl_Cmd?.presentValue;
            const newVal = pv === "active" ? 1 : 0;

            // update ONLY if changed
            setOpn_SS((prev) => (prev !== newVal ? newVal : prev));
          }

          if (res["NONGL_SS_PRIMARY_PUMP"]) {
            setPrimaryPump(res["NONGL_SS_PRIMARY_PUMP"]);
          }
          if (res["NONGL_SS_ATCS"]) {
            setAtcsPump(res["NONGL_SS_ATCS"]);
          }
          if (res["NONGL_SS_SECONDARY_PUMPS"]) {
            setSecondaryPump(res["NONGL_SS_SECONDARY_PUMPS"]);
          }

          if (res["NONGL_SS_CONDENSER_PUMPS"]) {
            setCondensers(res["NONGL_SS_CONDENSER_PUMPS"]);
          }
          if (res["NONGL_SS_COOLING_TOWER"]) {
            setCoolingTowers(res["NONGL_SS_COOLING_TOWER"]);
          }
        })
        .catch((error) => {
          if (error.response) {
            setErrmsg(error.response.data.message);
            // setOpenerr(true)
          } else {
            setErrmsg("");
          }
        });
    }, 5000);
    return () => clearInterval(timer);
  }, [alerts.systemCount, alerts.solutionCount]);

  useEffect(() => {
    api.campus
      .glZones(buildingID)
      .then((result) => {
        if (result.length !== 0) {
          dispatch({
            type: "location",
            payload: result,
          });
        }
      })
      .catch((error) => {
        if (error.response) {
          // setErrmsg(error.response.data.message);
          // setOpenerr(true);
        } else {
          // setErrmsg("");
        }
      });
    api.floor.cpmGetDevData().then((res) => {
      if (res["NONGL_SS_COMMON_HEADER"]) {
        setEachHeaderData(Object.values(res["NONGL_SS_COMMON_HEADER"]));
        const firstObject = res["NONGL_SS_COMMON_HEADER"];
        const firstKey = Object.keys(res["NONGL_SS_COMMON_HEADER"])[0];
        let req = {
          startdate: "start",
          enddate: "end",
        };
        if (firstKey && firstObject[firstKey].id != undefined) {
          api.floor
            .getDeviceData(
              firstObject[firstKey].id,
              "NONGL_SS_COMMON_HEADER",
              "1 HOUR"
            )
            .then((res) => {
              if (res.graphData.length) {
                if (res.graphData[0]["CWH_ST"]) {
                  setCWH_ST(res.graphData[0]["CWH_ST"]);
                }
                if (res.graphData[0]["CWH_RT"]) {
                  setCWH_RT(res.graphData[0]["CWH_RT"]);
                }
                if (res.graphData[0]["CDW_HST"]) {
                  setCDW_HST(res.graphData[0]["CDW_HST"]);
                }
                if (res.graphData[0]["CDW_HRT"]) {
                  setCDW_HRT(res.graphData[0]["CDW_HRT"]);
                }
              }
            })
            .catch((error) => {
              if (error.response) {
                // setOpenerr(true)
                setErrmsg(error.response.data.message);
              } else {
                setErrmsg("");
              }
            });
          let req = {
            startdate: "start",
            enddate: "end",
          };
          api.floor
            .getDeviceData(
              req,
              firstObject[firstKey].id,
              "NONGL_SS_COMMON_HEADER",
              "1 DAY"
            )
            .then((res) => {
              if (res.graphData.length) {
                if (res.graphData[0]["CWH_ST"]) {
                  setCWH_ST24Hr(res.graphData[0]["CWH_ST"]);
                }
                if (res.graphData[0]["CWH_RT"]) {
                  setCWH_RT24Hr(res.graphData[0]["CWH_RT"]);
                }
                if (res.graphData[0]["CDW_HST"]) {
                  setCDW_HST24Hr(res.graphData[0]["CDW_HST"]);
                }
                if (res.graphData[0]["CDW_HRT"]) {
                  setCDW_HRT24Hr(res.graphData[0]["CDW_HRT"]);
                }
              }
            })
            .catch((error) => {
              if (error.response) {
                // setOpenerr(true)
                setErrmsg(error.response.data.message);
              } else {
                setErrmsg("");
              }
            });
        }
      }
    });
    api.floor
      .getEnergyMeter()
      .then((res) => {
        if (Array.isArray(res)) {
          const item = res.find((x) => x.metric_id === "ikw_per_tr");

          if (
            item &&
            item.metric_value !== null &&
            item.metric_value !== undefined
          ) {
            const num = Number(item.metric_value);

            if (!isNaN(num)) {
              setIkwPerTr(Number(num.toFixed(2))); // <-- returns a NUMBER
            } else {
              setIkwPerTr(""); // empty for invalid values
            }
          } else {
            setIkwPerTr(""); // empty for missing/null
          }
        }
      })
      .catch((err) => console.log("Error fetching ikw_per_tr:", err));
  }, []);

  const getBackgroundColor = (attributes) => {
    if (!attributes) return "grey";

    if (attributes.CWH_ST) {
      const value = attributes.CWH_ST.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.CWH_RT) {
      const value = attributes.CWH_RT.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.DPT_H) {
      const value = attributes.DPT_H.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.BYPASS_HEADER_VLV_FBK) {
      const value = attributes.BYPASS_HEADER_VLV_FBK.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt1) {
      const value = attributes.dpt1.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt2) {
      const value = attributes.dpt2.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt3) {
      const value = attributes.dpt3.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt4) {
      const value = attributes.dpt4.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    return "grey";
  };

  /// Always show exactly 2 empty cards regardless of pump count
  const emptyCardsForPriPumps = Array.from({ length: 0 }, (_, index) => (
    <button
      key={`empty-pri-${index}`}
      className={classes.smallbuttons}
      style={{ backgroundColor: "rgb(239 229 229 / 87%)", color: "white" }}
    ></button>
  ));

  const emptyCardsForCPumps = Array.from({ length: 0 }, (_, index) => (
    <button
      key={`empty-cnd-${index}`}
      className={classes.smallbuttons}
      style={{ backgroundColor: "rgb(239 229 229 / 87%)", color: "white" }}
    ></button>
  ));

  const emptyCardsForCT = Array.from({ length: 0 }, (_, index) => (
    <button
      key={`empty-ct-${index}`}
      className={classes.smallbuttons}
      style={{ backgroundColor: "rgb(239 229 229 / 87%)", color: "white" }}
    ></button>
  ));

  const onChangeCPMStatus = (newValue) => {
    // setCpmAutoManualStatus(newValue);
    let value = newValue == 0 ? "inactive" : "active";
    let ss_type = cpmSSType;
    let id = cpmid;
    let req = {
      metric_id: "cpm_mode",
      value,
      // Equipment_GL_CPM_MODE,
      // ss_type,
      // id,
    };
    if (value && id) {
      api.floor
        .cpmHeaderOnOffControl(req)
        .then((response) => {
          console.log("api resppp", response, newValue);
          if (response) {
            setCpmAutoManualStatus(
              response == "true" || response == "active" ? 1 : 0
            );
            // localStorage.setItem(
            //   "CPM_AM_Status",
            //   newValue == 0 ? "inactive" : "active"
            // );
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: response,
              time: 2000,
            });
          }
        })
        .catch((error) => {
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            // description: response,
            time: 2000,
          });
        });
    }
  };
  const onChangeCPMOverideStatus = (newValue) => {
    // setCpmAutoManualStatus(newValue);
    let value = newValue == 0 ? "inactive" : "active";
    let ss_type = cpmSSType;
    let id = cpmid;
    let req = {
      metric_id: "manual_mode",
      value,
      // Equipment_GL_CPM_MODE,
      // ss_type,
      // id,
    };
    if (value && id) {
      api.floor
        .cpmOverrideControl(req)
        .then((response) => {
          console.log("api resppp", response, newValue);
          if (response) {
            setCpmOverideStatus(
              response == "true" || response == "active" ? 1 : 0
            );
            // localStorage.setItem(
            //   "CPM_AM_Status",
            //   newValue == 0 ? "inactive" : "active"
            // );
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: response,
              time: 2000,
            });
          }
        })
        .catch((error) => {
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            // description: response,
            time: 2000,
          });
        });
    }
  };
  return (
    <div className={classes.root}>
      <Snackbar
        open={openerr}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
      <Grid container item xs={12} spacing={1}>
        {/* Left-top part */}
        <Grid item xs={12} spacing={1} sm={12} md={9} lg={9} xl={9} xxl={9}>
          <Grid container item xs={12} spacing={1}>
            <LandingPage
              processDataFromJson={processDataFromJson}
              device={chillers}
              totalAlarms={alerts.systemCount + alerts.solutionCount}
              criticalAlerts={alerts.systemCount}
              soluAlerts={alerts.solutionCount}
              type="CPM"
            />
          </Grid>
          <Grid container item xs={12} spacing={1} style={{ marginTop: "2vh" }}>
            <Grid item spacing={1} xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
              <Grid
                container
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                spacing={1}
                direction="column"
              >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Box
                    className={classes.childpaper}
                    style={{
                      height: window.innerHeight == "1280" ? "20vh" : "17vh", // Increased height
                    }}
                  >
                    <div
                      className={classes.CardHeadFont}
                      style={{
                        marginTop:
                          window.innerHeight == "1280" ? "0.5vh" : "-1.2vh", // Adjusted margin
                        fontWeight: "bold",
                        color: "black",
                        cursor: "default",
                      }}
                    >
                      Primary Pumps
                    </div>

                    {/* <Box
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginTop: "0.5vh",
                        marginBottom: "0.5vh",
                        display: "inline-block",
                        fontWeight: "bold",
                        fontSize: "11px",
                        color: "black",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        backgroundColor: "#d3d3d3",
                      }}
                      onClick={() => {
                        const pumpStationPump =
                          pripAlerts.find(
                            (pump) =>
                              pump.name &&
                              pump.name.toLowerCase().includes("pump station")
                          ) || pripAlerts[0];

                        if (pumpStationPump) {
                          setPumpModal(true);
                          setPumpType("Pump Station");
                          setPumpData(pumpStationPump);
                        }
                      }}
                    >
                      Pump Station
                    </Box> */}
                    {/* <Box
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginTop: "0.5vh",
                        marginBottom: "0.5vh",
                        display: "inline-block",
                        fontWeight: "bold",
                        fontSize: "11px",
                        color: "black",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        backgroundColor: "#d3d3d3",
                      }}
                      onClick={() => {
                        // Now uses dedicated pumpStationData instead of pripAlerts
                        const pumpStationPump =
                          pumpStationData.length > 0
                            ? pumpStationData[0]
                            : null;

                        if (pumpStationPump) {
                          setPumpModal(true);
                          setPumpType("Pump Station");
                          setPumpData(pumpStationPump);
                        } else {
                          console.warn("No Pump Station data available");
                        }
                      }}
                    >
                      Pump Station
                    </Box> */}

                    <Grid
                      container
                      direction="row"
                      style={{ marginTop: "0.3vh" }}
                    >
                      {pripAlerts.map((element, index) => (
                        <StyledTooltip
                          key={`prip-${index}`}
                          title={element.name}
                          className={classes.tooltip}
                          arrow
                        >
                          <button
                            className={classes.smallbuttons}
                            style={{
                              backgroundColor:
                                element[6] == true
                                  ? "#FF0000"
                                  : element[3] == "0"
                                  ? "grey"
                                  : element.alerts_cri > 0
                                  ? "#CE1E1E"
                                  : element.alerts_solu > 0
                                  ? "#f2aa1a"
                                  : element["Eqp_Attributes"][
                                      "sts_on_off_00"
                                    ] != undefined
                                  ? element["Eqp_Attributes"][
                                      "sts_on_off_00"
                                    ]["presentValue"] == ("inactive" || 0)
                                    ? "grey"
                                    : element["Eqp_Attributes"][
                                        "sts_on_off_00"
                                      ]["presentValue"] == ("active" || 1)
                                    ? "#21ba45"
                                    : "grey"
                                  : "grey",
                              color: "white",
                            }}
                            onClick={() =>
                              onClickEachPump("Primary Pump", element)
                            }
                          >
                            {index + 1}
                            {/* {processDataFromJson == true ?element[3]:element.name} */}
                          </button>
                        </StyledTooltip>
                      ))}
                      {emptyCardsForPriPumps}
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Box
                    className={classes.childpaper}
                    style={{
                      height: window.innerHeight == "1280" ? "20vh" : "17vh",
                    }}
                  >
                    <div
                      className={classes.CardHeadFont}
                      style={{
                        marginTop:
                          window.innerHeight == "1280" ? "1vh" : "-1vh",
                        fontWeight: "bold",
                        color: "black",
                        cursor: "default",
                      }}
                    >
                      Condenser Pumps
                    </div>
                    <Grid
                      container
                      direction="row"
                      style={{ marginTop: "0.3vh" }}
                    >
                      {condenserAlerts.map((element, index) => (
                        <StyledTooltip
                          title={element.name}
                          className={classes.tooltip}
                          arrow
                        >
                          <button
                            className={classes.smallbuttons}
                            style={{
                              backgroundColor:
                                element[6] == true
                                  ? "#FF0000"
                                  : element[3] == "0"
                                  ? "grey"
                                  : element.alerts_cri > 0
                                  ? "#CE1E1E"
                                  : element.alerts_solu > 0
                                  ? "#f2aa1a"
                                  : element["Eqp_Attributes"][
                                      "sts_on_off_00"
                                    ] != undefined
                                  ? element["Eqp_Attributes"]["sts_on_off_00"][
                                      "presentValue"
                                    ] == ("inactive" || 0)
                                    ? "grey"
                                    : element["Eqp_Attributes"][
                                        "sts_on_off_00"
                                      ]["presentValue"] == ("active" || 1)
                                    ? "#21ba45"
                                    : "grey"
                                  : "grey",
                              color: "white",
                            }}
                            onClick={() =>
                              onClickEachPump("Condensers", element)
                            }
                          >
                            {index + 1}
                            {/* {processDataFromJson == true ?element[3]:element.name} */}
                          </button>
                        </StyledTooltip>
                      ))}
                      {emptyCardsForCPumps}
                    </Grid>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Box
                    className={classes.childpaper}
                    style={{
                      height: window.innerHeight == "1280" ? "16vh" : "17vh", // Reduced height
                    }}
                  >
                    <div
                      className={classes.CardHeadFont}
                      style={{
                        marginTop:
                          window.innerHeight == "1280" ? "0.5vh" : "-1vh", // Adjusted top margin
                        fontWeight: "bold",
                        color: "black",
                        cursor: "pointer",
                      }}
                    >
                      Cooling Towers
                    </div>
                    <Grid
                      container
                      direction="row"
                      style={{ marginTop: "0.5vh" }} // Slightly increased for better spacing
                    >
                      {ctAlerts.map((element, index) => (
                        <StyledTooltip
                          key={`ct-${index}`}
                          title={element.name}
                          className={classes.tooltip}
                          arrow
                        >
                          <button
                            className={classes.smallbuttons}
                            style={{
                              backgroundColor:
                                element[6] == true
                                  ? "#FF0000"
                                  : element[3] == "0"
                                  ? "grey"
                                  : element.alerts_cri > 0
                                  ? "#CE1E1E"
                                  : element.alerts_solu > 0
                                  ? "#f2aa1a"
                                  : element["Eqp_Attributes"][
                                      "cmd_outlet_vlv_on_off_00"
                                    ] != undefined
                                  ? element["Eqp_Attributes"][
                                      "cmd_outlet_vlv_on_off_00"
                                    ]["presentValue"] == ("inactive" || 0)
                                    ? "grey"
                                    : element["Eqp_Attributes"][
                                        "cmd_outlet_vlv_on_off_00"
                                      ]["presentValue"] == ("active" || 1)
                                    ? "#21ba45"
                                    : "grey"
                                  : "grey",
                              color: "white",
                            }}
                            onClick={() =>
                              onClickEachCT("coolingTowers", element)
                            }
                          >
                            {processDataFromJson == true
                              ? element[3]
                              : index + 1}
                          </button>
                        </StyledTooltip>
                      ))}
                      {emptyCardsForCT}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={10} lg={10} xl={10} xxl={10}>
              <Grid
                container
                item
                xs={12}
                sm={12}
                md={12}
                lg={12}
                xl={12}
                xxl={12}
                spacing={1}
                direction="column"
              >
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Card
                    className={classes.imagecard}
                    style={{ backgroundColor: "#E5E5E5" }}
                  >
                    <Map
                      ref={mapRef}
                      doubleClickZoom={false}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      crs={Leaflet.CRS.Simple}
                      center={[0, 0]}
                      attributionControl={false}
                      // bounds={[[0, 0], [600, 730]]}
                      bounds={[
                        [0, 0],
                        [470, 600],
                      ]}
                      // bounds={[[0, 0], [420, 600]]}
                      className={"floor-map"}
                      // style={{marginLeft:'-1vh',marginTop:'-1vh',width:"89vh",height:'67.5vh',}}
                      // style={{backgroundColor:"white"}}
                      onClick={(e) => {
                        console.log({ x: e.latlng.lat, y: e.latlng.lng });
                      }}
                    >
                      <ImageOverlay
                        interactive
                        // url={'https://localhost/' + image + '.png'}
                        url={image}
                        // bounds={[[50, 15], [600, 730]]}
                        // bounds={[[100, -8], [525, 640]]}
                        // bounds={[[0, 0], [470, 590]]}
                        // bounds={[[0, 10], [470, 590]]}
                        //   bounds={[
                        //     [50, 10],
                        //     [430, 600],
                        //   ]}
                        // />
                        bounds={[
                          [20, 10],
                          [430, 600],
                        ]}
                      />
                      <ZoomControl position="bottomright" />
                      {/* Plant KW Display at Top Right */}
                      {/* <Marker
                        position={[412, 512]}
                        icon={
                          new Leaflet.DivIcon({
                            className: "plant-kw-display",
                            html: `
                           <div style="
                              background: #E5E5E5;
                              padding: 4px 10px;
                              border-radius: 6px;
                              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                              border: 1px solid rgba(0, 0, 0, 0.1);
                              display: flex;
                              flex-direction: column;
                              line-height: 1.1;
                            ">
                              <span style="
                                color: #666;
                                font-size: 7px;
                                font-weight: 500;
                              ">PLANT POWER</span>
                              <span style="
                                color: #000;
                                font-size: 13px;
                                font-weight: bold;
                              ">
                              ${
                                plantKWValue || "0.00"
                              } <span style="font-size: 8px;">kW</span></span>
                            </div>
                          `,
                            iconSize: [70, 32],
                            iconAnchor: [0, 0],
                          })
                        }
                      /> */}

                      {header.length > 0 ? (
                        <>
                          {header.map((res) => (
                            <>
                              <Marker
                                position={[115.8, 440.0]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="right"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CWH RT
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CWH_RT"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>

                              <Marker
                                position={[178.1, 201.2]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="left"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CWH ST
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CWH_ST"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                                position={[275.1, 114.2]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="left"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CDW HST
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CDW_HST"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                                position={[265.5, 382.1]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="right"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CDW HRT
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CDW_HRT"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              {/* <Marker
                                position={[387.28, 421.25]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="left"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      Flow Meter
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {(() => {
                                        const value =
                                          res?.Eqp_Attributes
                                            ?.Flow_Meter_Actual_Flow
                                            ?.presentValue;

                                        // Debug: log the value to console
                                        console.log(
                                          "CW HSP Flow Value:",
                                          value,
                                          "Type:",
                                          typeof value
                                        );

                                        if (
                                          value !== undefined &&
                                          value !== null &&
                                          value !== ""
                                        ) {
                                          return formatter.format(value) + "";
                                        }
                                        return "N/A";
                                      })()}
                                    </div>
                                  </div>
                                </Tooltip>
                              </Marker> */}
                              {/* <Marker
                                position={[73.75, 132.2]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="left"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CW HSP
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CDW_HST_SP"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker> */}
                              {/* <Marker
                                position={[276.1, 163.2]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="bottom"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      CDW HSP
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"]["CWH_ST"]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker> */}
                            </>
                          ))}
                        </>
                      ) : (
                        <></>
                      )}
                      {cpm.length > 0 ? (
                        <>
                          {cpm.map((res) => (
                            <>
                              <Marker
                                position={[101.88, 213.2]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="right"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      Bypass Valve Status
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "BYPASS_HEADER_VLV_FBK"
                                        ].presentValue
                                      ) + "%"}
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
                      {/* {chillers.length >= 0 ? (
                        chillers.map((element, index) => (
                          <>
                            {
                              // console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              (index == "0" &&
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "active") ||
                              element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "1.0" ? (
                                <Marker
                                  position={[194.4, 332.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (index == "1" &&
                                  element?.Eqp_Attributes?.CH_Motor_Run
                                    ?.presentValue == "active") ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1.0" ? (
                                <Marker
                                  position={[193.4, 332.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (
                                // ) : index == "2" &&
                                //   element?.Eqp_Attributes?.CH_Motor_Run
                                //     ?.presentValue == "active" ? (
                                //   <Marker
                                //     position={[328.93, 221.16]}
                                //     icon={iconDevice2}
                                //   ></Marker>
                                // ) : index == "3" &&
                                //   element?.Eqp_Attributes?.CH_Motor_Run
                                //     ?.presentValue == "active" ? (
                                //   <Marker
                                //     position={[410.36, 225.16]}
                                //     icon={iconDevice2}
                                //   ></Marker>
                                <></>
                              )
                            }
                          </>
                        ))
                      ) : (
                        <></>
                      )} */}
                      {/* {chillers.length >= 0 ? (
                        chillers.map((element, index) => (
                          <>
                            {index == "0" &&
                            (element?.Eqp_Attributes?.CH_Motor_Run
                              ?.presentValue == "active" ||
                              element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "1.0" ||
                              element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "1" ||
                              element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == 1) ? (
                              <Marker
                                position={[194.4, 332.1]}
                                icon={iconDevice2}
                              ></Marker>
                              
                            ) : index == "1" &&
                              (element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "active" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1.0" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == 1) ? (
                              <Marker
                                position={[194.4, 380]}
                                icon={iconDevice2}
                              ></Marker>
                            ) : (
                              <></>
                            )}
                          </>
                        ))
                      ) : (
                        <></>
                      )} */}
                      {chillers.length >= 0 &&
                        chillers.map((element, index) => (
                          <>
                            {/* ===== CHILLER 1 ===== */}
                            {index == "0" &&
                              (element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "active" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1.0" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == 1) && (
                                <>
                                  {/* Chiller Motor */}
                                  <Marker
                                    position={[194.4, 332.1]}
                                    icon={iconDevice2}
                                  />

                                  {/* Chiller Evaporator Valve */}
                                  {/* {(element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                    ?.presentValue == "active" ||
                                    element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                      ?.presentValue == "1.0" ||
                                    element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                      ?.presentValue == "1" ||
                                    element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                      ?.presentValue == 1) && (
                                    <Marker
                                      position={[136.35, 310.84]}
                                      icon={iconDevice2}
                                    />
                                  )} */}
                                  <Marker
                                    // position={
                                    //   [
                                    //     /* put correct coordinates here */
                                    //   ]
                                    // }
                                    position={[216.35, 330.84]}
                                    icon={
                                      element?.Eqp_Attributes
                                        ?.CH_In_Vlv_On_Off_SS?.presentValue ===
                                        "active" ||
                                      element?.Eqp_Attributes
                                        ?.CH_In_Vlv_On_Off_SS?.presentValue ===
                                        "1" ||
                                      element?.Eqp_Attributes
                                        ?.CH_In_Vlv_On_Off_SS?.presentValue ===
                                        "1.0" ||
                                      element?.Eqp_Attributes
                                        ?.CH_In_Vlv_On_Off_SS?.presentValue ===
                                        1
                                        ? iconDevice2 // green (ON)
                                        : iconDevice3 // red (OFF)
                                    }
                                  />

                                  {/* Chiller Condenser Valve */}
                                  {/* {(element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                    ?.presentValue == "active" ||
                                    element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                      ?.presentValue == "1.0" ||
                                    element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                      ?.presentValue == "1" ||
                                    element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                      ?.presentValue == 1) && (
                                    <Marker
                                      position={[139.35, 359.83]}
                                      icon={iconDevice2}
                                    />
                                  )} */}
                                  <Marker
                                    position={[120.35, 342.84]}
                                    icon={
                                      element?.Eqp_Attributes
                                        ?.CD_In_Vlv_On_Off_SS?.presentValue ===
                                        "active" ||
                                      element?.Eqp_Attributes
                                        ?.CD_In_Vlv_On_Off_SS?.presentValue ===
                                        "1" ||
                                      element?.Eqp_Attributes
                                        ?.CD_In_Vlv_On_Off_SS?.presentValue ===
                                        1
                                        ? iconDevice2 // green
                                        : iconDevice3 // red
                                    }
                                  />
                                </>
                              )}

                            {/* ===== CHILLER 2 ===== */}
                            {index == "1" &&
                              (element?.Eqp_Attributes?.CH_Motor_Run
                                ?.presentValue == "active" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1.0" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == "1" ||
                                element?.Eqp_Attributes?.CH_Motor_Run
                                  ?.presentValue == 1) && (
                                <Marker
                                  position={[191.35, 393.83]}
                                  icon={iconDevice2}
                                />
                              )}
                            {/* Chiller Evaporator Valve */}
                            {(element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                              ?.presentValue == "active" ||
                              element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                ?.presentValue == "1.0" ||
                              element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                ?.presentValue == "1" ||
                              element?.Eqp_Attributes?.CH_In_Vlv_On_Off_SS
                                ?.presentValue == 1) && (
                              <Marker
                                position={[218.35, 386.83]}
                                icon={iconDevice2}
                              />
                            )}

                            {/* Chiller Condenser Valve */}
                            {(element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                              ?.presentValue == "active" ||
                              element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                ?.presentValue == "1.0" ||
                              element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                ?.presentValue == "1" ||
                              element?.Eqp_Attributes?.CD_In_Vlv_On_Off_SS
                                ?.presentValue == 1) && (
                              <Marker
                                position={[118.35, 410.827]}
                                icon={iconDevice2}
                              />
                            )}
                          </>
                        ))}

                      {pripAlerts.length >= 0 ? (
                        pripAlerts.map((element, index) => (
                          <>
                            {
                              // console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              index == "2" &&
                              element?.Eqp_Attributes?.sts_on_off_00
                                ?.presentValue == "active" ? (
                                <Marker
                                  position={[188.2, 236.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "1" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[220.3, 239.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "0" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[246.0, 242.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (
                                <></>
                              )
                            }
                          </>
                        ))
                      ) : (
                        <></>
                      )}
                      {secpAlerts.length >= 0 ? (
                        secpAlerts.map((element, index) => (
                          <>
                            {
                              // console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              index == "2" &&
                              element?.Eqp_Attributes?.Sec_Pmp_Run_SS
                                ?.presentValue == "active" ? (
                                <Marker
                                  position={[286.7, 231.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "1" &&
                                element?.Eqp_Attributes?.Sec_Pmp_Run_SS
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[216.1, 131.25]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "0" &&
                                element?.Eqp_Attributes?.Sec_Pmp_Run_SS
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[234.1, 102.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (
                                <></>
                              )
                            }
                          </>
                        ))
                      ) : (
                        <></>
                      )}
                      {condenserAlerts.length >= 0 ? (
                        condenserAlerts.map((element, index) => (
                          <>
                            {
                              // console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              index == "2" &&
                              element?.Eqp_Attributes?.sts_on_off_00
                                ?.presentValue == "active" ? (
                                <Marker
                                  position={[325.71, 150.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "1" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[343.7, 156.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "0" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[359.7, 162.2]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (
                                <></>
                              )
                            }
                          </>
                        ))
                      ) : (
                        <></>
                      )}
                      {ctAlerts.length >= 0 ? (
                        ctAlerts.map((element, index, res) => (
                          <>
                            {/* {
                              // console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              // index == "2" &&
                              // element?.Eqp_Attributes?.CT_Out_Vlv_On_Off_Fbk
                              //   ?.presentValue == "active" ? (
                              //   <Marker
                              //     position={[363.29, 224.24]}
                              //     icon={iconDevice2}
                              //   ></Marker>
                              // ) :
                              //
                              // index == "1" &&
                              // element?.Eqp_Attributes?.CT_Out_Vlv_On_Off_Fbk
                              //   ?.presentValue == "active" ? (
                              //   <Marker
                              //     position={[365.8, 342.1]}
                              //     icon={iconDevice2}
                              //   ></Marker>
                              // ) : index == "0" &&
                              //   element?.Eqp_Attributes?.CT_Out_Vlv_On_Off_Fbk
                              //     ?.presentValue == "active" ? (
                              //   <Marker
                              //     position={[364.8, 238.2]}
                              //     icon={iconDevice2}
                              //   ></Marker>
                              // ) :
                              //  (
                              //   <></>
                              // )
                              
                              : (
                                <></>
                              )
                            } */}
                            {/* Cooling Tower index 0 - 3 fan positions */}
                            {index == "0" && (
                              <>
                                {/* Fan 1 – Check CT_VAR_FAN_1_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_1_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[364.8, 238.2]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Fan 2 – Check CT_VAR_FAN_2_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_2_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[392.35, 238.86]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Fan 3 – Check CT_VAR_FAN_3_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_3_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[413.35, 245.87]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Valve – Check CT_Out_Vlv_On_Off_Fbk */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_3_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[411.35, 339.85]}
                                    icon={iconDevice2}
                                  />
                                )}
                                <Marker
                                  position={[282.35, 278.8547]}
                                  icon={
                                    element?.Eqp_Attributes
                                      ?.CT_Out_Vlv_On_Off_Fbk?.presentValue ===
                                    "active"
                                      ? iconDevice2 // green icon
                                      : iconDevice3 // red icon
                                  }
                                />
                                {/* {element?.Eqp_Attributes?.CT_Out_Vlv_On_Off_Fbk
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[282.35,278.8547]}
                                    icon={iconDevice2}
                                  />
                                )} */}
                              </>
                            )}
                            {/* Cooling Tower index 1 - 3 fan positions */}
                            {index == "1" && (
                              <>
                                {/* Fan 1 – Check CT_VAR_FAN_1_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_1_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[357.35, 343.84]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Fan 2 – Check CT_VAR_FAN_2_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_2_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[385.35, 343.85]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Fan 3 – Check CT_VAR_FAN_3_RUN_SS */}
                                {element?.Eqp_Attributes?.CT_VAR_FAN_3_RUN_SS
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[411.35, 339.85]}
                                    icon={iconDevice2}
                                  />
                                )}
                                {/* Valve – Check CT_Out_Vlv_On_Off_Fbk */}
                                {/* {element?.Eqp_Attributes?.CT_Out_Vlv_On_Off_Fbk
                                  ?.presentValue === "active" && (
                                  <Marker
                                    position={[295.35, 375.85]}
                                    icon={iconDevice2}
                                  />
                                )} */}
                                <Marker
                                  position={[280.35, 378.83]}
                                  icon={
                                    element?.Eqp_Attributes
                                      ?.CT_Out_Vlv_On_Off_Fbk?.presentValue ===
                                    "active"
                                      ? iconDevice2 // green icon
                                      : iconDevice3 // red icon
                                  }
                                />
                              </>
                            )}
                            {/* Cooling Tower index 2 and 3 - Not in current data, can be added when available */}
                            {/* <Marker
                              position={[201.35, 313.24]}
                              icon={iconDevice1}
                            >
                              <Tooltip
                                direction="right"
                                opacity={0.75}
                                permanent
                              >
                                <div>
                                  <span
                                    className={classes.Leaflet_Tooltip_Heading}
                                  >
                                    CT MWP
                                  </span>
                                  <br />
                                  <div
                                    className={classes.Leaflet_Tooltip_Values}
                                    style={{
                                      backgroundColor: getBackgroundColor(
                                        res?.Eqp_Attributes
                                      ),
                                      color: "white",
                                    }}
                                  >
                                    {res["Eqp_Attributes"] &&
                                    res["Eqp_Attributes"][
                                      "CT_Var_Fan_2_Actual_Speed"
                                    ]
                                      ? formatter.format(
                                          res["Eqp_Attributes"][
                                            "CT_Var_Fan_2_Actual_Speed"
                                          ].presentValue
                                        ) + "°C"
                                      : "-"}
                                  </div>
                                </div>
                              </Tooltip>
                            </Marker> */}
                            {/* <Marker
                                position={[366.4, 303.1]}
                                icon={iconDevice1}
                              >
                                <Tooltip
                                  direction="left"
                                  opacity={0.75}
                                  permanent
                                >
                                  <div>
                                    <span
                                      className={
                                        classes.Leaflet_Tooltip_Heading
                                      }
                                    >
                                      Sump Water Level 
                                      
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][""]
                                          .presentValue
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker> */}
                          </>
                        ))
                      ) : (
                        <></>
                      )}
                    </Map>
                  </Card>
                </Grid>
                {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Card
                    className={classes.imagecard}
                    style={{ backgroundColor: "#E5E5E5", height: "4vh" }}
                  >
                    {
                      <marquee width="100%" direction="left" height="100px">
                        Current Scenario:{" "}
                        {cpmCurrentStatedata.currentScenario
                          ? cpmCurrentStatedata.currentScenario
                          : " - "}{" "}
                        ,Current State:{" "}
                        {cpmCurrentStatedata.currentState
                          ? cpmCurrentStatedata.currentState
                          : " - "}
                      </marquee>
                    }
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Current Scenario:{" "}
                      {cpmCurrentStatedata.currentScenario
                        ? cpmCurrentStatedata.currentScenario
                        : " - "}{" "}
                      ,Current State:{" "}
                      {cpmCurrentStatedata.currentState
                        ? cpmCurrentStatedata.currentState
                        : " - "}
                    </div>
                  </Card>
                </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* Right part */}
        <Grid
          item
          xs={12}
          spacing={1}
          sm={12}
          md={3}
          lg={3}
          xl={3}
          xxl={3}
          style={{ marginTop: "1vh" }}
        >
          <Grid container item xs={12} spacing={1} direction="column">
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Grid
                container
                xs={12}
                spacing={2}
                direction="row"
                style={{
                  marginTop: "-1vh",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={6}
                  xxl={6}
                  style={{ display: "flex", justifyContent: "left" }}
                >
                  <Typography
                    variant="string"
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "1.8vh",
                    }}
                  >
                    CPM
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                  <div
                    className="your-required-wrapper"
                    style={{
                      width: "20vh",
                      marginLeft: "0vh",
                      height: "3.5vh",
                      pointerEvents: cpmOverideStatus == 1 ? "none" : "",
                      opacity: cpmOverideStatus == 1 ? "0.4" : "",
                    }}
                  >
                    <SwitchSelector
                      onChange={onChangeCPMStatus}
                      options={options}
                      // initialSelectedIndex={initialSelectedIndex}
                      forcedSelectedIndex={cpmAutoManualStatus}
                      backgroundColor={"rgba(0, 0, 0, 0.04)"}
                      fontColor={"#000"}
                      selectedFontColor={"#000"}
                      // border="5"
                      optionBorderRadius={5}
                      wrapperBorderRadius={8}
                      fontSize={11}
                    />
                  </div>
                </Grid>
                {/* <Grid item xs={2} style={{display:'flex',justifyContent:'center'}}><CreateIcon style={{cursor:'pointer'}}  onClick={() => onClickTriggerIcon('Icon')}/></Grid> */}
              </Grid>
              <Grid
                container
                xs={12}
                spacing={2}
                direction="row"
                style={{
                  marginTop: "-1vh",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={6}
                  xxl={6}
                  style={{ display: "flex", justifyContent: "left" }}
                >
                  <Typography
                    variant="string"
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "1.8vh",
                    }}
                  >
                    CPM Override
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                  <div
                    className="your-required-wrapper"
                    style={{
                      width: "20vh",
                      marginLeft: "0vh",
                      height: "3.5vh",
                    }}
                  >
                    <SwitchSelector
                      onChange={onChangeCPMOverideStatus}
                      options={options}
                      // initialSelectedIndex={initialSelectedIndex}
                      forcedSelectedIndex={cpmOverideStatus}
                      backgroundColor={"rgba(0, 0, 0, 0.04)"}
                      fontColor={"#000"}
                      selectedFontColor={"#000"}
                      // border="5"
                      optionBorderRadius={5}
                      wrapperBorderRadius={8}
                      fontSize={11}
                    />
                  </div>
                </Grid>
                {/* <Grid item xs={2} style={{display:'flex',justifyContent:'center'}}><CreateIcon style={{cursor:'pointer'}}  onClick={() => onClickTriggerIcon('Icon')}/></Grid> */}
              </Grid>
              <Grid
                container
                xs={12}
                spacing={2}
                direction="row"
                style={{
                  marginTop: "-1vh",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={12}
                  md={6}
                  lg={6}
                  xl={6}
                  xxl={6}
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Typography
                    variant="string"
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "1.8vh",
                    }}
                  >
                    Primary Pump Sequencing Panel
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                  <div
                    className="your-required-wrapper"
                    style={{
                      width: "20vh",
                      marginLeft: "0vh",
                      pointerEvents: cpmAutoManualStatus == 1 ? "none" : "",
                      opacity: cpmAutoManualStatus == 1 ? "0.4" : "",
                      height: "3.5vh",
                    }}
                  >
                    <SwitchSelector
                      // style={{ borderRadius: "12px" }}
                      onChange={onChangeSEQpanel}
                      options={options}
                      forcedSelectedIndex={opn_SS}
                      backgroundColor={"rgba(0,0,0,0.04)"}
                      fontColor={"#000"}
                      selectedFontColor={"#000"}
                      optionBorderRadius={5}
                      wrapperBorderRadius={8}
                      fontSize={11}
                    />
                  </div>
                </Grid>
                {/* <Grid item xs={2} style={{display:'flex',justifyContent:'center'}}><CreateIcon style={{cursor:'pointer'}}  onClick={() => onClickTriggerIcon('Icon')}/></Grid> */}
              </Grid>
            </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Card
                className={classes.imagecard}
                style={{ backgroundColor: "#E5E5E5", height: "4vh" }}
              >
                {
                  <marquee width="100%" direction="left" height="100px">
                    Current Scenario:{" "}
                    {cpmCurrentStatedata.currentScenario
                      ? cpmCurrentStatedata.currentScenario
                      : " - "}{" "}
                    ,Current State:{" "}
                    {cpmCurrentStatedata.currentState
                      ? cpmCurrentStatedata.currentState
                      : " - "}
                  </marquee>
                }
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Current Scenario:{" "}
                  {cpmCurrentStatedata.currentScenario
                    ? cpmCurrentStatedata.currentScenario
                    : " - "}{" "}
                  ,Current State:{" "}
                  {cpmCurrentStatedata.currentState
                    ? cpmCurrentStatedata.currentState
                    : " - "}
                </div>
              </Card>
            </Grid>

            {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Box
                className={classes.graphpaper1}
                style={{
                  height: window.innerHeight == "1080" ? "22.7vh" : "19.25vh",
                }}
              >
                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card className={`${classes.CardHeadFont}`} style={{fontWeight:'bold',color:'black'}}>
                    <div style={{ overflow: "auto" }}>
                      Current Scenario:{" "}
                      {cpmCurrentStatedata.currentScenario
                        ? cpmCurrentStatedata.currentScenario
                        : " - "}
                      <br />
                      Current State:{" "}
                      {cpmCurrentStatedata.currentState
                        ? cpmCurrentStatedata.currentState
                        : " - "}
                    </div>
                    {window.innerHeight}
                    </Card> 
                  </Grid>
                </Grid>
                <Grid container item xs={12} spacing={1}>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                  <Card className={`${classes.semicircularbar} ${classes.CardHeadFont}`} style={{fontWeight:'bold',color:'black',boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)", backgroundColor:"#Fefefa"}}>
                                                    Plant Power[kW]
                                                  <div className={classes.semicircularbarcomp}>
                                                    <SemiCircleProgressBar
                                                        stroke="#0123b4"
                                                        strokeWidth={20}
                                                        diameter={100}
                                                        orientation="up"
                                                        percentage={50} // Set the value here
                                                    // showPercentValue
                                                    />
                                                <div style={{ marginTop: '-2vh', fontSize: '10px' }}>50</div>
                                                </div>
                                                  </Card>
                                              </Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                  <Card className={`${classes.semicircularbar} ${classes.CardHeadFont}`} onClick={() => handleClick('Plant Load')} style={{fontWeight:'bold',color:'black',cursor:'pointer'}}>
                                                    Plant Load
                                                  <div className={classes.semicircularbarcomp}>
                                                    <SemiCircleProgressBar
                                                        stroke="#0123b4"
                                                        strokeWidth={20}
                                                        diameter={100}
                                                        orientation="up"
                                                        percentage={50} // Set the value here
                                                    // showPercentValue
                                                    />
                                                <div style={{ marginTop: '-2vh', fontSize: '10px' }}>50</div>
                                                </div>
                                                  </Card>
                                              </Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                  <Card className={`${classes.semicircularbar} ${classes.CardHeadFont}`}
                                                  onClick={() => handleClick('Plant kW/TR')}
                                                  style={{fontWeight:'bold',color:'black',cursor:'pointer'}}>
                                                    Plant kW/TR
                                                    <div className={classes.semicircularbarcomp}>
                                                    <SemiCircleProgressBar
                                                        stroke="#0123b4"
                                                        strokeWidth={20}
                                                        diameter={100}
                                                        orientation="up"
                                                        percentage={50} // Set the value here
                                                    // showPercentValue
                                                    />
                                                <div style={{ marginTop: '-2vh', fontSize: '10px' }}>50</div>
                                                </div>
                                                  </Card>
                                              </Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                  <Card className={classes.semicircularbar}
                                                    style={{fontWeight:'bold',color:'black',cursor:'pointer'}}>
                                                      <div  className={classes.CardHeadFont}
                                                  //     onMouseEnter={handleMouseEnter}
                                                  // onMouseLeave={handleMouseLeave}
                                                  >
                                                    Run Hours
                                                  </div>
                                                  <div  onClick={() => handleClick('Run Hours')} style={{fontWeight:'bold',color:'#0123B4',fontSize:'3.5vh',marginTop:'-1vh'}}>400</div>
                                                  </Card>
                                              </Grid>
                                          </Grid>
              </Box>
            </Grid> */}

            {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
  <Box className={classes.graphpaper}>
                <div
                  style={{ fontWeight: "bold", color: "black" }}
                  className={classes.CardHeadFont}
                >
                  Header Set Point[°C]
                </div>
              </Box>  
</Grid> */}

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Box className={classes.graphpaper}>
                <div
                  style={{ fontWeight: "bold", color: "black" }}
                  className={classes.CardHeadFont}
                >
                  CHW Header Temperature[°C]
                </div>
                <TimeS
                  name="Chilled Water Header Temperature"
                  data={CWH_RT}
                  data24Hr={CWH_RT24Hr}
                  data2={CWH_ST}
                  data224Hr={CWH_ST24Hr}
                  minRange="0"
                  maxRange="20"
                  style={{ width: "100%", height: "100%" }}
                ></TimeS>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Box className={classes.graphpaper}>
                <div
                  style={{ fontWeight: "bold", color: "black" }}
                  className={classes.CardHeadFont}
                >
                  CDW Header Temperature[°C]
                </div>
                <TimeS
                  name="Condenser Water Header Temperature"
                  data={CDW_HRT}
                  data24Hr={CDW_HRT24Hr}
                  data2={CDW_HST}
                  data224Hr={CDW_HST24Hr}
                  minRange="10"
                  maxRange="40"
                  style={{ width: "100%", height: "100%" }}
                ></TimeS>
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              {/* Main container for the two halves */}
              <Grid container spacing={2}>
                {/* Left Card - Current Plant BTU (or TR) */}
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6} xxl={6}>
                  <Box
                    className={classes.graphpaper2}
                    onClick={() => handleClick("Plant Load")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{ fontWeight: "bold", color: "black" }}
                      className={classes.CardHeadFont}
                    >
                      Plant Load
                    </div>
                    <div
                      style={{
                        fontSize: "2vh",
                        fontWeight: "400",
                        color: "#070707ff",
                        marginTop: "3vh",
                      }}
                    >
                      <>
                        {rawBtuValue !== null && !isNaN(Number(rawBtuValue))
                          ? `${
                              formatter.format(Number(rawBtuValue)) + " " + "TR"
                            } ${btuUnit ? btuUnit : ""}`
                          : ""}
                      </>
                      <>
                        {btuValue !== null && !isNaN(Number(btuValue))
                          ? `${
                              formatter.format(Number(btuValue)) + " " + "TRH"
                            } 
              ${btuUnit ? btuUnit : ""}`
                          : ""}
                      </>
                    </div>
                  </Box>
                </Grid>

                {/* Right Card - Plant KW/TR */}
                <Grid item xs={12} sm={6} md={6} lg={6} xl={6} xxl={6}>
                  <Box
                    className={classes.graphpaper2}
                    onClick={() => handleClick("Plant kW/TR")}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{ fontWeight: "bold", color: "black" }}
                      className={classes.CardHeadFont}
                    >
                      Plant KW/TR
                    </div>
                    <div
                      style={{
                        fontSize: "2.5vh",
                        fontWeight: "400",
                        color: "#070707ff",
                        marginTop: "3vh",
                      }}
                    >
                      {ikwPerTr}
                    </div>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={modal}
        classes={{ paper: classes.customDialog }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Plant Metrics
        </DialogTitle>
        <DialogContent dividers>
          <FieldDeviceGraphs />
        </DialogContent>
      </Dialog>

      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={pumpModal}
        classes={{ paper: classes.customDialogPump }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {pumpType === "AtcsPump" ? "ATCS" : pumpData[3] || pumpType}
        </DialogTitle>
        <DialogContent dividers>
          <PumpPage type={pumpType} data={pumpData} click="eachPump" />
        </DialogContent>
      </Dialog>
      {/* <Dialog onClose={handleClose2} aria-labelledby="customized-dialog-title"  open={modal2} classes={{ paper: classes.customDialog }}>
                      <DialogTitle id="customized-dialog-title" onClose={handleClose2}>
                     Reports
                      </DialogTitle>
                      <DialogContent dividers>
                      <ChillerReports data={'Jahnavi'}/>
                     </DialogContent>
            </Dialog>   */}
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={triggerModal}
        classes={{ paper: classes.customDialogPump }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          CPM
        </DialogTitle>
        <DialogContent dividers>
          <Grid container item xs={12} spacing={1}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              {/* <Box className={classes.childpaper} style={{height:'17.5vh'}}> */}
              <Grid container item xs={12} direction="column">
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
                    alignItems: "center",
                  }}
                >
                  <Card
                    className={classes.graphpaper}
                    style={{
                      height: "20.5vh",
                      width: "72vh",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {cpmres}
                  </Card>
                </Grid>
              </Grid>
              <Grid
                container
                item
                xs={12}
                direction="row"
                style={{ marginTop: "3vh", marginLeft: "2vh" }}
              >
                <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}></Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                  <Paper
                    className={classes.faults_paper}
                    onClick={() => onClickOfTrigger("start")}
                    style={{
                      cursor: "pointer",
                      height: "5vh",
                      color: "white",
                      width: "20vh",
                      backgroundColor: "#0123B4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Start
                  </Paper>
                </Grid>
                <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                  <Paper
                    className={classes.faults_paper}
                    onClick={() => onClickOfTrigger("updates")}
                    style={{
                      cursor: "pointer",
                      color: "white",
                      height: "5vh",
                      width: "20vh",
                      backgroundColor: "#0123B4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    Check updates
                  </Paper>
                </Grid>
                <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}></Grid>
              </Grid>
              {/* </Box>                             */}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}
