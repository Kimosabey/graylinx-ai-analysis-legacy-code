import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "./../../api";
import { useSelector, useDispatch } from "react-redux";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Paper from "@material-ui/core/Paper";
import { Grid, Typography, Card,TextField, ButtonBase, Divider } from "@material-ui/core";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Select from "@material-ui/core/Select";
import SemiCircleProgressBar from "react-progressbar-semicircle";
// import image from './../../assets/img/CT.png'
import image from "./../../assets/img/jupiter_plant1.jpg";
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
    fontSize: "13px",
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
    //Set the desired width for the dialog
    height: window.innerWidth == "1920" ? "423px" : "410px", // Adjust this value as needed
    "max-width": window.innerHeight == "1080" ? "1700px" : "700px", // Adjust this value as needed
    // width: '700px', // Adjust this value as needed
  },
  customDialog: {
    cursor: "pointer",
    // Set the desired width for the dialog
    height: "550px", // Adjust this value as needed
    width: window.innerHeight == "1080" ? "1000px" : "700px", // Adjust this value as needed
  },
  root: {
    flexGrow: 1,
    // paddingTop: window.innerHeight == "1080" ? "3vh" : "0vh",
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
    height: "26.25vh",
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
    height: "11vh",
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
     // console.log(`Unable to process JSON: ${elementPath}`);
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
  const [eachEachSeqPanelResp, setEachSeqPanelResp] = React.useState({});
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
  const [par_cwh_sup_temp_01, setCWH_ST1] = useState([]);
  const [par_cwh_sup_temp_02, setCWH_ST2] = useState([]);
  const [par_cwh_ret_temp_01, setCWH_RT1] = useState([]);
  const [par_cwh_ret_temp_02, setCWH_RT2] = useState([]);
  const [CWH_ST24Hr, setCWH_ST24Hr] = useState([]);
  const [CWH_RT24Hr, setCWH_RT24Hr] = useState([]);
  const [CndW_HST, setCndW_HST] = useState([]);
  const [CndW_HRT, setCndW_HRT] = useState([]);
  const [modal, setModal] = useState(false);
  const [modal2, setModal2] = useState(false);
  const [pumpModal, setPumpModal] = useState(false);
  const [triggerModal, setTriggerModal] = useState(false);
  const [disable, setDisable] = useState(false);
  const [opn_SS, setOpn_SS] = useState({});
  const [opn_SS1, setOpn_SS1] = useState({});
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
  const [par_cdw_sup_temp_00, setCDW_HST] = useState([]);
  const [par_cdw_ret_temp_00, setCDW_HRT] = useState([]);
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
  const [cpoMode, setCPOMode] = useState(0);
  const [spvalue1, setSetPointvalue1] = useState("");
  const [spvalue2, setSetPointvalue2] = useState("");
  const [instanceKwPerTr, setKwPerTr] = useState(0);
  const [ch1KwPerTr, setCh1KwPerTr] = useState(0);
  const [ch2KwPerTr, setCh2KwPerTr] = useState(0);
  const [ch1Tr, setCh1Tr] = useState(0);
  const [ch2Tr, setCh2Tr] = useState(0);
  const[ch1Fla, setCh1Fla] = useState(0);
  const[ch2Fla, setCh2Fla] = useState(0);
  const[planttr, setPlantTr] = useState(0);


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
    iconUrl: require("../../assets/img/GREYBLINK.png"),
    iconSize: new Leaflet.Point(30, 30),
    className: "leaflet-div-icon-2",
  });
   const iconDevice4 = new Leaflet.Icon({
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
    {
      selectedFontColor: "white",
      label: "Manual",
      value: 2,
      selectedBackgroundColor: blueColor[0],
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
    const handleChangeForsetpointChW = (event) => {
    setSetPointvalue1(event.target.value);
  };
    const handleChangeForsetpointCDW = (event) => {
    setSetPointvalue2(event.target.value);
  };
  const handleClickForSP = (data) => {
        let value = (data=='ChW Header')? spvalue1:spvalue2;
        let minVal = (data=='ChW Header')? 5:18;
        let maxVal = (data=='ChW Header')? 15:34;
        let param_id = (data=='ChW Header')? 'cmd_cwh_sup_temp_00':'cmd_cdw_sup_temp_00';
        let ssType = eachHeaderData[0].ssType;
        let ss_id = eachHeaderData[0].id;
  
        const req = {
          ss_type: ssType,
          ss_id,
          gl_command: "CHANGE_SET_POINT",
          param_id,
          value,
          zone_type: null,
          zone_id: null,
        };
        if ((Number(value) >= (minVal)) && (Number(value) <= (maxVal))) {
          api.floor
            .cpmOnOffControl(req)
            .then((res) => {
              // setSetPointvalue("");
              if (res.message === "please connect to network") {
                toast({
                  type: "error",
                  icon: "exclamation triangle",
                  title: "Error",
                  description: "connect to network",
                  time: 2000,
                });
              } else if (res) {
                let requestID = res.id;
                toast({
                  type: "success",
                  icon: "check circle",
                  title: "Success",
                  description: "Temp successfully set to" + value,
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
                      // toast({
                      //   type: "error",
                      //   icon: "exclamation triangle",
                      //   title: "Error",
                      //   description: "Error while checking command status",
                      //   time: 2000,
                      // });
                    });
                };
    
                checkCommandStatus(requestID);
              }
            })
            .catch((error) => {
              // setSnackbarOpen(true);
              if (error.response) {
                // setErrorMsg(error.response.data.message);
              } else {
                // setErrorMsg('No response')
              }
            });
        } else {
          // setSetPointvalue("");
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            description: "Set point should be between " + minVal + " and " + maxVal,
            time: 2000,
          });
        }
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
    //console.log("single Click");
    setModalHeading(data);
    setModal(true);
  };

  const handleDoubleClick = () => {
    //console.log("Double Click");
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
    if (devicetype === "BTU") {
      // console.log("📊 BTU Meter Data:", JSON.stringify(respp, null, 2));
      // console.log("📊 BTU meters count:", respp.length);

      if (respp.length > 0) {
        const btuMeter = respp[0];
        // console.log("🔍 Full BTU Meter:", JSON.stringify(btuMeter, null, 2));

        // Try Eqp_Metrics first (some devices report value there), then Eqp_Attributes
        let metricVal =
          btuMeter?.Eqp_Metrics?.par_energy_consump_00 ||
          btuMeter?.Eqp_Metrics?.BTU ||
          btuMeter?.Eqp_Metrics?.btu;
        let mwhVal =
          btuMeter?.Eqp_Metrics?.par_actual_power_00?.presentValue ||
          btuMeter?.Eqp_Metrics?.par_actual_power_00 ||
          btuMeter?.Eqp_Attributes?.par_actual_power_00?.presentValue;
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
          btuMeter?.Eqp_Attributes?.par_energy_consump_00?.presentValue ||
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
            btuMeter?.Eqp_Attributes?.par_energy_consump_00?.presentValue
          );
          setRawBtuValue(
            btuMeter?.Eqp_Attributes?.par_actual_power_00?.presentValue
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
      console.log("➡️ Device:", respp);
      if (alerts.system.length === 0 && alerts.solution.length === 0) {
        let con = 0;
        // console.log("🧊 Checking device type:", devicetype);
        respp.map((element) => {
          let obj = {};
          con++;
          obj["name"] = element.name;
          obj["id"] = element.id;
          obj["type"] = element.type;
          obj["ssType"] = element.ssType;
          obj["Eqp_Attributes"] = element["Eqp_Attributes"];
          obj["Eqp_Metrics"] = element["Eqp_Metrics"];
          obj["alerts_cri"] = 0;
          obj["alerts_solu"] = 0;
          sdevices.push(obj);
          if (respp.length === con) {
            if (devicetype == "Chillers") setEachChillerData(sdevices);
            if (devicetype == "Primary Pumps") setPriPAlerts(sdevices);
            //if (devicetype == "ATCS") setAtcsPAlerts(sdevices);
            if (devicetype == "Secondary Pumps") setSecPAlerts(sdevices);
            if (devicetype == "Condenser Pumps") setCondenserAlerts(sdevices);
            if (devicetype == "Cooling Towers") setCTAlerts(sdevices);
           // if (devicetype == "PRIMARY_SEQ_PANEL") setPumpStationData(sdevices);
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
          obj["ssType"] = element.ssType;
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
          obj["ssType"] = element.ssType;
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
          obj["ssType"] = element.ssType;
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
                if (devicetype === "Primary SEQ Panel") {
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

  const onChangeSEQpanel = (data,newValue) => {
    console.log("qqqqqqqqqqqqqqqqqqqq",data)
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);
    setOpn_SS(newValue);

    const req = {
      ss_type: "NONGL_SS_SECONDARY_SEQ_PANEL",
      ss_id: data?.id,
      gl_command:
        newValue == 0 ? "TURN_OFF" : newValue == 1 ? "TURN_ON" : "AUTO",
      value: newValue === 1 ? "active" : newValue === 0 ? "inactive" : "Auto",
      param_id: "cmd_on_off_00",
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
  const onChangeSEQpanel1 = (newValue) => {
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);
    setOpn_SS1(newValue);

    const req = {
      ss_type: "NONGL_SS_SECONDARY_SEQ_PANEL",
      ss_id: eachEachSeqPanelData.id,
      
      gl_command:
        newValue == 0 ? "TURN_OFF" : newValue == 1 ? "TURN_ON" : "AUTO",
      value: newValue === 1 ? "active" : newValue === 0 ? "inactive" : "Auto",
      param_id: "cmd_on_off_00",
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };
    console.log("eachEachSeqPanelData", eachEachSeqPanelData);
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
 
  const fetchData = () => {
    api.floor.getPlantMetrics().then((res) => {
 
      if (!Array.isArray(res) || res.length === 0) {
        setIkwPerTr("No data");
        return;
      }
 
      const latestRecord = res.find(
        (x) => x.SPC_i !== null && !isNaN(Number(x.SPC_i))
      );
 
      if (latestRecord) {
        const value = Number(latestRecord.SPC_i).toFixed(2);
        setIkwPerTr(value);
      } else {
        setIkwPerTr("No data");
      }
 
    });
  };
 
  fetchData(); // run immediately
 
  const interval = setInterval(fetchData, 5000); // every 5 seconds
 
  return () => clearInterval(interval); // cleanup when component unmounts
 
}, []);
 

  useEffect(() => {
    api.floor.getinstanceKWPerTr().then((res) => {
            if (res) {
              console.log("instance kw per tr", res);
              //setInstanceKwPerTr(res?.[0]?.kw_per_tr);
              setCh1KwPerTr(res?.[0]?.chiller_1_kw_per_tr);
              setCh2KwPerTr(res?.[0]?.chiller_2_kw_per_tr);
              setCh1Tr(res?.[0]?.chiller_1_tr);
              setCh2Tr(res?.[0]?.chiller_2_tr);
              setCh1Fla(res?.[0]?.chiller_1_fla); 

              setCh2Fla(res?.[0]?.chiller_2_fla);
            }
          });

    api.floor.getPlantApi().then((res) => {
            if (res) {
             console.log("plant kw per tr", res);
              setKwPerTr(res?.[0]?.kw_per_tr);
              setPlantTr(res?.[0]?.btu_tr);

              
            }
          });      

    
    api.floor
      .cpmOverrideState()
      .then((res) => {
        if (res) {
          localStorage.setItem(
            "CPM_Override_Status",
            res.manual_mode == "active" ? "true" : "false"
          );
          setCpmOverideStatus(res.manual_mode === "active" ? 1 : 0);
          if(res.manual_mode=='active'){
            setCPOMode(2);
            localStorage.setItem(
            "CPO_OverAllStatus",
            "MANUAL"
          );
          }else if (res.manual_mode=='inactive'){
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
                  setCPOMode(res.cpm_mode === "active" ? 1 : 0);
                  localStorage.setItem(
            "CPO_OverAllStatus",
            res.cpm_mode === "active" ? "ON" : "OFF"
          );
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
      .cpmOverrideState()
      .then((res) => {
        //console.log("cpmoverride", res);
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
        DeviceAlarms(res["NONGL_SS_CHILLER"], "Chillers");
        DeviceAlarms(res["NONGL_SS_PRIMARY_PUMP"], "Primary Pumps");
        DeviceAlarms(res["NONGL_SS_SECONDARY_SEQ_PANEL"], "Primary SEQ Panel");
        //DeviceAlarms(res["NONGL_SS_PRIMARY_PUMP"], "Primary Pumps");
        DeviceAlarms(res["NONGL_SS_CONDENSER_PUMPS"], "Condenser Pumps");
        DeviceAlarms(res["NONGL_SS_COOLING_TOWER"], "Cooling Towers");
        //DeviceAlarms(res["NONGL_SS_ATCS"], "ATCS");
        DeviceAlarms(res["NONGL_SS_COMMON_HEADER"], "BTU");
        DeviceAlarms(res["NONGL_SS_EMS"], "NONGL_SS_EMS");

        DeviceAlarms(res["NONGL_SS_SECONDARY_PUMPS"], "Secondary Pumps");
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
          if (res["NONGL_SS_SECONDARY_SEQ_PANEL"]) {
            const panelArr = Object.values(res["NONGL_SS_SECONDARY_SEQ_PANEL"]);

              panelArr.map((res)=>(
                (res.name == 'Seq_Panel-01')?
                  setOpn_SS(res)
                :
                (res.name == 'Seq_Panel-02')?
                  setOpn_SS1(res)
                :
                ''
              ))
          // find object that contains PP_Seq_Pnl_Cmd
            // const obj = panelArr.find(
            //   (item) =>
            //     item?.Eqp_Attributes?.sts_on_off_00?.presentValue !== undefined
            // );

            // const pv = obj?.Eqp_Attributes?.sts_on_off_00?.presentValue;
            // const newVal = pv === "active" ? 1 : 0;

            // // update ONLY if changed
            // setOpn_SS((prev) => (prev !== newVal ? newVal : prev));
            // setOpn_SS1((prev) => (prev !== newVal ? newVal : prev));
          }
        // if (res["NONGL_SS_SECONDARY_SEQ_PANEL"]) {
        //   setEachSeqPanelResp(Object.values(res["NONGL_SS_SECONDARY_SEQ_PANEL"]));
        //   let idd = "";
        //   let cpmdataArr = Object.values(res["NONGL_SS_SECONDARY_SEQ_PANEL"]);
        //   Object.values(cpmdataArr).forEach((res) => {
        //     idd = res;
        //   });
        //   setEachSeqPanelData(idd);
        // }
        if (res["NONGL_SS_COMMON_HEADER"]) {
          setEachHeaderData(Object.values(res["NONGL_SS_COMMON_HEADER"]));
          const firstObject = res["NONGL_SS_COMMON_HEADER"];
          // console.log(
          //   "object",
          //   Object.values(res["NONGL_SS_COMMON_HEADER"])[0]
          // );

          const firstKey = Object.keys(res["NONGL_SS_COMMON_HEADER"]);
          // console.log("id...", firstKey);
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
                  if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                    setCWH_ST1(res.graphData[0]["par_cwh_sup_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_sup_temp_02"]) {
                    setCWH_ST2(res.graphData[0]["par_cwh_sup_temp_02"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                    setCWH_RT1(res.graphData[0]["par_cwh_ret_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_02"]) {
                    setCWH_RT2(res.graphData[0]["par_cwh_ret_temp_02"]);
                  }
                  if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                    setCDW_HST(res.graphData[0]["par_cdw_sup_temp_00"]);
                  }
                  if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                    setCDW_HRT(res.graphData[0]["par_cdw_ret_temp_00"]);
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
                  if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                    setCWH_ST24Hr(res.graphData[0]["par_cwh_sup_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                    setCWH_RT24Hr(res.graphData[0]["par_cwh_ret_temp_01"]);
                  }
                  if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                    setCDW_HST24Hr(res.graphData[0]["par_cdw_sup_temp_00"]);
                  }
                  if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                    setCDW_HRT24Hr(res.graphData[0]["par_cdw_ret_temp_00"]);
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
      .cpmOverrideState()
      .then((res) => {
        if (res) {
          localStorage.setItem(
            "CPM_Override_Status",
            res.manual_mode == "active" ? "true" : "false"
          );
          setCpmOverideStatus(res.manual_mode === "active" ? 1 : 0);
          if(res.manual_mode=='active'){
            setCPOMode(2);
            localStorage.setItem(
            "CPO_OverAllStatus",
            "MANUAL"
          );
          }else if (res.manual_mode=='inactive'){
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
                  setCPOMode(res.cpm_mode === "active" ? 1 : 0);
                  localStorage.setItem(
            "CPO_OverAllStatus",
            res.cpm_mode === "active" ? "ON" : "OFF"
          );
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
      .cpmOverrideState()
      .then((res) => {
      //  console.log("cpmoverride", res);
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
          DeviceAlarms(res["NONGL_SS_CHILLER"], "Chillers");
          DeviceAlarms(res["NONGL_SS_PRIMARY_PUMP"], "Primary Pumps");
          DeviceAlarms(res["NONGL_SS_SECONDARY_SEQ_PANEL"], "Primary SEQ Panel");
          //DeviceAlarms(res["NONGL_SS_PRIMARY_PUMP"], "Primary Pumps");
          DeviceAlarms(res["NONGL_SS_CONDENSER_PUMPS"], "Condenser Pumps");
          DeviceAlarms(res["NONGL_SS_COOLING_TOWER"], "Cooling Towers");
          //DeviceAlarms(res["NONGL_SS_ATCS"], "ATCS");
          DeviceAlarms(res["NONGL_SS_COMMON_HEADER"], "BTU");
          DeviceAlarms(res["NONGL_SS_EMS"], "NONGL_SS_EMS");

          DeviceAlarms(res["NONGL_SS_SECONDARY_PUMPS"], "Secondary Pumps");
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
                      if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                    setCWH_ST1(res.graphData[0]["par_cwh_sup_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_sup_temp_02"]) {
                    setCWH_ST2(res.graphData[0]["par_cwh_sup_temp_02"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                    setCWH_RT1(res.graphData[0]["par_cwh_ret_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_02"]) {
                    setCWH_RT2(res.graphData[0]["par_cwh_ret_temp_02"]);
                  }
                  if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                    setCDW_HST(res.graphData[0]["par_cdw_sup_temp_00"]);
                  }
                  if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                    setCDW_HRT(res.graphData[0]["par_cdw_ret_temp_00"]);
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
                    if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                      setCWH_ST24Hr(res.graphData[0]["par_cwh_sup_temp_01"]);
                    }
                    if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                      setCWH_RT24Hr(res.graphData[0]["par_cwh_ret_temp_01"]);
                    }
                    if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                      setCDW_HST24Hr(
                        res.graphData[0]["par_cdw_sup_temp_00"]
                      );
                    }
                    if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                      setCDW_HRT24Hr(
                        res.graphData[0]["par_cdw_ret_temp_00"]
                      );
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
          if (res["NONGL_SS_SECONDARY_SEQ_PANEL"]) {
            const panelArr = Object.values(res["NONGL_SS_SECONDARY_SEQ_PANEL"]);

              panelArr.map((res)=>{
               if (res.name == 'Seq_Panel-01')
                 {
                   setOpn_SS(res)}
                else if(res.name == 'Seq_Panel-02')
                 { 
                  setOpn_SS1(res)}
              else{
                
              }
          })
          }

          // if (res["NONGL_SS_PRIMARY_PUMP"]) {
          //   setPrimaryPump(res["NONGL_SS_PRIMARY_PUMP"]);
          // }
          // if (res["NONGL_SS_ATCS"]) {
          //   setAtcsPump(res["NONGL_SS_ATCS"]);
          // }
          // if (res["NONGL_SS_SECONDARY_PUMPS"]) {
          //   setSecondaryPump(res["NONGL_SS_SECONDARY_PUMPS"]);
          // }

          // if (res["NONGL_SS_CONDENSER_PUMPS"]) {
          //   setCondensers(res["NONGL_SS_CONDENSER_PUMPS"]);
          // }
          // if (res["NONGL_SS_COOLING_TOWER"]) {
          //   setCoolingTowers(res["NONGL_SS_COOLING_TOWER"]);
          // }
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
                  if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                    setCWH_ST1(res.graphData[0]["par_cwh_sup_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_sup_temp_02"]) {
                    setCWH_ST2(res.graphData[0]["par_cwh_sup_temp_02"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                    setCWH_RT1(res.graphData[0]["par_cwh_ret_temp_01"]);
                  }
                  if (res.graphData[0]["par_cwh_ret_temp_02"]) {
                    setCWH_RT2(res.graphData[0]["par_cwh_ret_temp_02"]);
                  }
                  if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                    setCDW_HST(res.graphData[0]["par_cdw_sup_temp_00"]);
                  }
                  if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                    setCDW_HRT(res.graphData[0]["par_cdw_ret_temp_00"]);
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
                if (res.graphData[0]["par_cwh_sup_temp_01"]) {
                  setCWH_ST24Hr(res.graphData[0]["par_cwh_sup_temp_01"]);
                }
                if (res.graphData[0]["par_cwh_ret_temp_01"]) {
                  setCWH_RT24Hr(res.graphData[0]["par_cwh_ret_temp_01"]);
                }
                if (res.graphData[0]["par_cdw_sup_temp_00"]) {
                  setCDW_HST24Hr(res.graphData[0]["par_cdw_sup_temp_00"]);
                }
                if (res.graphData[0]["par_cdw_ret_temp_00"]) {
                  setCDW_HRT24Hr(res.graphData[0]["par_cdw_ret_temp_00"]);
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

    if (attributes.par_cwh_sup_temp_01) {
      const value = attributes.par_cwh_sup_temp_01?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.par_cwh_ret_temp_01) {
      const value = attributes.par_cwh_ret_temp_01?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.DPT_H) {
      const value = attributes.DPT_H?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.BYPASS_HEADER_VLV_FBK) {
      const value = attributes.BYPASS_HEADER_VLV_FBK?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt1) {
      const value = attributes.dpt1?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt2) {
      const value = attributes.dpt2?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt3) {
      const value = attributes.dpt3?.presentValue;
      if (value === undefined || value === null) return "grey";
      return value >= 0 && value <= 100 ? "green" : "red";
    }

    if (attributes.dpt4) {
      const value = attributes.dpt4?.presentValue;
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
  const emptyCardsForSecPumps = Array.from({ length: 0 }, (_, index) => (
    <button
      key={`empty-sec-${index}`}
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
    //console.log("cpm status", newValue);
    // if (newValue) {
     let req={
  metric_id: "manual_mode",
  value: (newValue == 0||newValue == 1) ? "inactive" : "active",
      }
    let req1={
  metric_id: "cpm_mode",
  value: (newValue == 0) ? "inactive" : "active",
      }
      //console.log("req", req, req1);
        api.floor
        .cpmOverrideControl(req)
        .then((response) => {
          if (response) {
            setCpmOverideStatus(
              response == "true" || response == "active" ? 1 : 0
            );
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
      if(newValue !== 2){   
        // console.log("newValue in condn", newValue,req1);
        api.floor
            .cpmHeaderOnOffControl(req1)
            .then((response) => {
              // console.log("api resppp", response, newValue);
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
    // }
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
          //console.log("api resppp", response, newValue);
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
      <Grid container item xs={12} spacing={1} style={{marginTop:window.innerHeight == "1080" ? "1vh":"0vh"}}>
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
                      height: window.innerHeight == "1280" ? "10vh" : "10vh", // Increased height
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
                                  ? element["Eqp_Attributes"]["sts_on_off_00"][
                                      "presentValue"
                                    ] == ("active" || 1)
                                    ? "#21ba45"
                                    : element["Eqp_Attributes"][
                                        "sts_on_off_00"
                                      ]["presentValue"] == ("inactive" || 0)
                                    ? "grey"
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
      height: window.innerHeight == "1280" ? "34vh" : "34vh",
    }}
  >
    <div
      className={classes.CardHeadFont}
      style={{
        marginTop: window.innerHeight == "1280" ? "1vh" : "-1vh",
        fontWeight: "bold",
        color: "black",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      Secondary <br />
      Pumps
    </div>

    {/* Zone 1 */}
    <div style={{ fontSize: "1em", color: "black", marginTop: "2.3vh" }}>
      Zone 1
    </div>
    <Box
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginTop: "0.5vh",
                        marginBottom: "0.5vh",
                        display: "inline-block",
                        fontWeight: "500",
                        fontSize: "11px",
                        color: "#fff",
                        whiteSpace: "nowrap",
                      backgroundColor: opn_SS1?.Eqp_Attributes?.sts_on_off_00?.presentValue === "active" ? "#21ba45" : "#999",
                      }}
                    
                    >
                      Pump Station
                    </Box>
    <Grid container spacing={1}>
      {secpAlerts.slice(3, 6).map((element, index) => (
  <StyledTooltip
    key={index}
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
            : element["Eqp_Attributes"]["sts_on_off_00"] != undefined
            ? element["Eqp_Attributes"]["sts_on_off_00"]["presentValue"] ==
              ("active" || 1)
              ? "#21ba45"
              : element["Eqp_Attributes"]["sts_on_off_00"][
                  "presentValue"
                ] == ("inactive" || 0)
              ? "grey"
              : "grey"
            : "grey",
        color: "white",
      }}
      onClick={() => onClickEachPump("Secondary Pump", element)}
    >
      {index + 1}
    </button>
  </StyledTooltip>
))}
    </Grid>

    {/* Zone 2 */}
    <div style={{ fontSize: "1em", color: "black", marginTop: "2.3vh" }}>
      Zone 2
    </div>
    <Box
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "6px 10px",
                        marginTop: "0.5vh",
                        marginBottom: "0.5vh",
                        display: "inline-block",
                        fontWeight: "500",
                        fontSize: "11px",
                        color: "#FFF",
                        whiteSpace: "nowrap",
                       backgroundColor: opn_SS?.Eqp_Attributes?.sts_on_off_00?.presentValue === "active" ? "#21ba45" : "#999",
                      }}
                    >
                      Pump Station
                    </Box>
    <Grid container spacing={1}>
      {secpAlerts.slice(0, 3).map((element, index) => (
  <StyledTooltip
    key={index}
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
            : element["Eqp_Attributes"]["sts_on_off_00"] != undefined
            ? element["Eqp_Attributes"]["sts_on_off_00"]["presentValue"] ==
              ("active" || 1)
              ? "#21ba45"
              : element["Eqp_Attributes"]["sts_on_off_00"][
                  "presentValue"
                ] == ("inactive" || 0)
              ? "grey"
              : "grey"
            : "grey",
        color: "white",
      }}
      onClick={() => onClickEachPump("Secondary Pump", element)}
    >
      {index + 4}
    </button>
  </StyledTooltip>
))}
    </Grid>

    {emptyCardsForSecPumps}
  </Box>
</Grid>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Box
                    className={classes.childpaper}
                    style={{
                      height: window.innerHeight == "1280" ? "10vh" : "10vh",
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
                                    ] == ("active" || 1)
                                    ? "#21ba45"
                                    : element["Eqp_Attributes"][
                                        "sts_on_off_00"
                                      ]["presentValue"] == ("inactive" || 0)
                                    ? "grey"
                                    : "grey"
                                  : "grey",
                              color: "white",
                            }}
                            onClick={() =>
                              onClickEachPump("Condenser", element)
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
                      height: window.innerHeight == "1280" ? "10vh" : "10vh", // Reduced height
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
                                      "sts_on_off_00"
                                    ] != undefined
                                  ? (element["Eqp_Attributes"][
                                      "sts_vlv_on_off_01"
                                    ]["presentValue"] == ("active" || 1) &&
                                    element["Eqp_Attributes"][
                                      "sts_vlv_on_off_02"
                                    ]["presentValue"] == ("active" || 1))
                                    ? "#21ba45"
                                    : (element["Eqp_Attributes"][
                                        "sts_vlv_on_off_01"
                                      ]["presentValue"] == ("inactive" || 0) &&
                                      element["Eqp_Attributes"][
                                        "sts_vlv_on_off_02"
                                      ]["presentValue"] == ("inactive" || 0))
                                    ? "grey"
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
                        // bounds={[
                        //   [20, 10],
                        //   [430, 600],
                        // ]}
                        bounds={window.innerWidth!='1920'?[
                          [20, 10],
                          [430, 600],
                        ]:[[-90, -190],[550, 785]]}
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
                              position={window.innerWidth=='1920'?[314.2, -74.0]:[279.8, 80.4]}
                                
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
                                      CHW HRT-1
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cwh_ret_temp_01"
                                        ].presentValue,
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                              position={window.innerWidth=='1920'?[170.3, -2.0]:[193.7, 131.9]}
                                
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
                                      CHW HRT-2
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cwh_ret_temp_02"
                                        ].presentValue,
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>

                              <Marker
                              position={window.innerWidth=='1920'?[-37.5, -88.0]:[56.0, 69.3]} 
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
                                      CHW HST-1
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cwh_sup_temp_01"
                                        ].presentValue,
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                               <Marker
                              position={window.innerWidth=='1920'?[ 96.3, -126.0]:[143.1, 57.3]} 
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
                                      DPT-1
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_dpt_01"
                                        ].presentValue,
                                      ) + "Bar"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                              position={window.innerWidth=='1920'?[72.3, 407.8]:[131.4, 380.9]} 
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
                                      DPT-2
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_dpt_02"
                                        ].presentValue,
                                      ) + "Bar"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                              position={window.innerWidth=='1920'?[-39.5, 347.8]:[50.0, 329.4]} 
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
                                      CHW HST-2
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cwh_sup_temp_02"
                                        ].presentValue,
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                              position={window.innerWidth=='1920'?[98.3, 655.7]:[147.1, 485.2]}
                                
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
                                      CDW HST
                                    </span>
                                    <br />
                                    <div
                                      className={classes.Leaflet_Tooltip_Values}
                                      style={{
                                        backgroundColor: getBackgroundColor(
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cdw_sup_temp_00"
                                        ].presentValue,
                                      ) + "°C"}
                                    </div>
                                  </div>{" "}
                                </Tooltip>
                              </Marker>
                              <Marker
                              position={window.innerWidth=='1920'?[350.2, 527.8]:[305.8, 439.4]}
                                
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
                                          res?.Eqp_Attributes,
                                        ),
                                        color: "white",
                                      }}
                                    >
                                      {formatter.format(
                                        res["Eqp_Attributes"][
                                          "par_cdw_ret_temp_00"
                                        ].presentValue,
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
                                        res["Eqp_Attributes"]["sts_chw_hd_sup_temp_00"]
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
                                          "par_cdw_ret_temp_00"
                                        ]?.presentValue
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
                              index == "0" &&
                              element?.Eqp_Attributes?.sts_on_off_00
                                ??.presentValue == "active" ? (
                                <Marker
                                  position={[158.4, 300.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "1" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ??.presentValue == "active" ? (
                                <Marker
                                  position={[158.46, 374.15]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "2" &&
                                element?.Eqp_Attributes?.sts_on_off_00
                                  ??.presentValue == "active" ? (
                                <Marker
                                  position={[189.44,381.12]}
                                  icon={iconDevice2}
                                ></Marker>
                              // ) : index == "3" &&
                              //   element?.Eqp_Attributes?.sts_on_off_00
                              //     ??.presentValue == "active" ? (
                              //   <Marker
                              //     position={[410.36, 225.16]}
                              //     icon={iconDevice2}
                              //   ></Marker>
                              ) : (
                                <></>
                                
                              )
                            }
                            
                          </>
                        ))
                      ) : (
                        <></>
                      )} */}
                     
                     {chillers && chillers.length > 0 &&
  chillers.map((element, index) => {

    const isOn = (val) =>
      val === "active" || val === "1.0" || val === "1" || val === 1;

    const isTripped = (val) =>
      val === "active" || val === "1.0" || val === "1" || val === 1;

    const getMotorIcon = (onOffVal, tripVal) => {
      if (isTripped(tripVal)) return iconDevice4;
      if (isOn(onOffVal)) return iconDevice2;
      return iconDevice3;
    };

    const getMotorStatus = (onOffVal, tripVal) => {
      if (isTripped(tripVal)) return "Tripped";
      if (isOn(onOffVal)) return "On";
      return "Off";
    };

    const getValveIcon = (val) =>
      isOn(val) ? iconDevice2 : iconDevice3;

    const getValveStatus = (val) =>
      isOn(val) ? "Open" : "Close";
    const is1920 = window.innerWidth === 1920;

    // ✅ ALL CHILLER POSITIONS (matches your old code)
    const chillerConfig = [
      {
        label: "Chiller-1",
        motorPos: is1920 ? [210.7, 208.8] : [220.1, 251.1],
        condPos: is1920 ? [134.3, 185.8] : [169.5, 234.2],
        evapPos: is1920 ? [304.2,  237.8] : [277.3, 266.2],
      },
      {
        label: "Chiller-2",
        motorPos: is1920 ? [210.7, 302.8] : [220.1, 309.83],
        condPos: is1920 ? [134.3, 283.8] : [169.5, 294.2],
        evapPos: is1920 ? [304.2, 327.8] : [274.3, 321.2],
      },
      
    ];

    const cfg = chillerConfig[index];
    if (!cfg) return null;

    const attrs = element?.Eqp_Attributes || {};

    const onOffVal = attrs?.sts_on_off_00?.presentValue;
    const tripVal = attrs?.alm_trip_00?.presentValue;
    const condVal = attrs?.sts_cond_vlv_on_off_00?.presentValue;
    const evapVal = attrs?.sts_evap_vlv_on_off_00?.presentValue;

    return (
      <React.Fragment key={`chiller-${index}`}>

        {/* 🔥 MOTOR */}
        <Marker
          position={cfg.motorPos}
          icon={getMotorIcon(onOffVal, tripVal)}
        >
          <Tooltip direction="right" opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                {cfg.label} Status : {getMotorStatus(onOffVal, tripVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>

        {/* 🔥 CONDENSER VALVE */}
        <Marker
          position={cfg.condPos}
          icon={getValveIcon(condVal)}
        >
          <Tooltip direction="right" opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                Condenser Valve Status : {getValveStatus(condVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>

        {/* 🔥 EVAPORATOR VALVE */}
        <Marker
          position={cfg.evapPos}
          icon={getValveIcon(evapVal)}
        >
          <Tooltip direction="right" opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                Evaporator Valve Status : {getValveStatus(evapVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>

      </React.Fragment>
    );
  })}
  <Marker position={window.innerWidth === 1920 ? [210.7, 398.8] : [225.8, 364.8]} icon={iconDevice3}>
  <Tooltip direction="left" opacity={0.75}>
    <div>
      <span className={classes.Leaflet_Tooltip_Heading}>
        Chiller-3 : Unavailable
      </span>
    </div>
  </Tooltip>
</Marker>
<Marker position={window.innerWidth === 1920 ? [210.7,494.8] : [230.8, 422.8]} icon={iconDevice3}>
  <Tooltip direction="left" opacity={0.75}>
    <div>
      <span className={classes.Leaflet_Tooltip_Heading}>
        Chiller-4 : Unavailable
      </span>
    </div>
  </Tooltip>
</Marker>

                      {pripAlerts.length >= 0 ? (
  pripAlerts.map((element, index) => {
    const val = element?.Eqp_Attributes?.sts_on_off_00?.presentValue;
    const isOn = val === "active" || val === "1.0" || val === "1" || val === 1;

    const tripVal = element?.Eqp_Attributes?.alm_trip_00?.presentValue;
    const isTrip = tripVal === "active" || tripVal === "1.0" || tripVal === "1" || tripVal === 1;

    const icon = isTrip ? iconDevice4 : isOn ? iconDevice2 : iconDevice3;

    const status = isTrip ? "Tripped" : isOn ? "On" : "Off";
    const eqpName = element?.name || `Primary Pump ${index + 1}`;
    const tooltipText = `Primary Pump - ${index + 1} Status : ${status}`;

    return (
      <>
        {index == "0" ? (
      <Marker position={window.innerWidth=='1920'?[216.3,-86.0]:[220.1, 148.2]} icon={icon}>
            <Tooltip>{tooltipText}</Tooltip>
          </Marker>
        ) : index == "1" ? (
          <Marker position={window.innerWidth=='1920'?[216.3, -24.0]:[220.1, 111.2]} icon={icon}>
            <Tooltip>{tooltipText}</Tooltip>
          </Marker>
        ) : index == "2" ? (
          <Marker position={window.innerWidth=='1920'?[216.3, 33.9]:[220.1, 71.2]} icon={icon}>
            <Tooltip>{tooltipText}</Tooltip>
          </Marker>
        ) : (
          <></>
        )}
      </>
    );
  })
) : null}
<Marker position={window.innerWidth=='1920'?[216.3,  97.9]:[225.2, 184.3]} icon={iconDevice3}>
  <Tooltip direction="left" opacity={0.75}>
    <div>
      <span className={classes.Leaflet_Tooltip_Heading}>
        Primary Pump-4 : Unavailable
      </span>
    </div>
  </Tooltip>
</Marker>
                   {secpAlerts.length >= 0 ? (
  secpAlerts.map((element, index) => {
    const val = element?.Eqp_Attributes?.sts_on_off_00?.presentValue;
    const isOn = val === "active" || val === "1.0" || val === "1" || val === 1;

    const tripVal = element?.Eqp_Attributes?.alm_trip_00?.presentValue;
    const isTrip = tripVal === "active" || tripVal === "1.0" || tripVal === "1" || tripVal === 1;

    const icon = isTrip ? iconDevice4 : isOn ? iconDevice2 : iconDevice3;

    const status = isTrip ? "Tripped" : isOn ? "On" : "Off";
    const tooltipText = `Secondary Pump - ${index + 1} Status : ${status}`;

    return (
      <>
        {index == "5" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, 343.8]:[89.2, 333.2]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "4" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, 271.8]:[89.2, 289.2]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "3" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, 201.8]:[89.2, 246.2]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "2" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, 51.9]:[97.1, 157.2]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "1" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, -10.0]:[97.1, 116.25]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "0" ? (
          <Marker position={window.innerWidth=='1920'?[12.3, -78.0]:[97.1, 77.2]} icon={icon}>
            <Tooltip direction="right" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : (
          <></>
        )}
      </>
    );
  })
) : (
  <></>
)}
<Marker position={window.innerWidth=='1920'?[180.3, 749.7]:[205.2, 573.5]} icon={iconDevice3}>
  <Tooltip direction="left" opacity={0.75}>
    <div>
      <span className={classes.Leaflet_Tooltip_Heading}>
        Condenser Pump-4 : Unavailable
      </span>
    </div>
  </Tooltip>
</Marker>
                   {condenserAlerts.length >= 0 ? (
  condenserAlerts.map((element, index) => {
    const val = element?.Eqp_Attributes?.sts_on_off_00?.presentValue;
    const isOn = val === "active" || val === "1.0" || val === "1" || val === 1;

    const tripVal = element?.Eqp_Attributes?.alm_trip_00?.presentValue;
    const isTrip = tripVal === "active" || tripVal === "1.0" || tripVal === "1" || tripVal === 1;

    const icon = isTrip ? iconDevice4 : isOn ? iconDevice2 : iconDevice3;

    const status = isTrip ? "Tripped" : isOn ? "On" : "Off";
    const tooltipText = `Condenser Pump - ${index + 1} Status : ${status}`;

    return (
      <>
        {index == "2" ? (
          <Marker position={window.innerWidth=='1920'?[180.3, 701.7]:[195.5, 551.2]} icon={icon}>
            <Tooltip direction="left" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "1" ? (
          <Marker position={window.innerWidth=='1920'?[180.3, 657.7]:[195.5, 523.25]} icon={icon}>
            <Tooltip direction="left" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : index == "0" ? (
          <Marker position={window.innerWidth=='1920'?[180.3, 611.8]:[199.5, 495.0]} icon={icon}>
            <Tooltip direction="left" opacity={0.75}>
              <div>
                <span className={classes.Leaflet_Tooltip_Heading}>
                  {tooltipText}
                </span>
              </div>
            </Tooltip>
          </Marker>
        ) : (
          <></>
        )}
      </>
    );
  })
) : (
  <></>
)}
                      {ctAlerts.length >= 0 ? (
                        ctAlerts.map((element, index, res) => (
                          <>
                            {/* {
                               console.log('index',index,'element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"]',element["Eqp_Attributes"]["Pump_Run_Feedback"]["presentValue"])
                              index == "2" &&
                              element?.Eqp_Attributes?.sts_fan_on_off_00
                                ?.presentValue == "active" ? (
                                <Marker
                                  position={[401.8, 458.0]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "1" &&
                                element?.Eqp_Attributes?.sts_fan_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[401.3, 316.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : index == "0" &&
                                element?.Eqp_Attributes?.sts_fan_on_off_00
                                  ?.presentValue == "active" ? (
                                <Marker
                                  position={[401.5, 176.1]}
                                  icon={iconDevice2}
                                ></Marker>
                              ) : (
                                <></>
                              )
                            } */}
                            {/* CT 1, 2, 3 — from database */}
{ctAlerts.length >= 0 ? (
  ctAlerts.map((element, index) => {

    const isActive = (val) =>
      val === "active" || val === "1.0" || val === "1" || val === 1;

    const isTripped = (val) =>
      val === "active" || val === "1.0" || val === "1" || val === 1;

    const getFanIcon = (fanVal, tripVal) => {
      if (isTripped(tripVal)) return iconDevice4;
      if (isActive(fanVal))   return iconDevice2;
      return iconDevice3;
    };

    const getFanStatus = (fanVal, tripVal) => {
      if (isTripped(tripVal)) return "Tripped";
      if (isActive(fanVal))   return "On";
      return "Off";
    };

    const getValveIcon   = (val) => (isActive(val) ? iconDevice2 : iconDevice3);
    const getValveStatus = (val) => (isActive(val) ? "Open" : "Close");
     const is1920 = window.innerWidth === 1920;
    const ctConfig = [
      {
        label:         "Cooling Tower-1",
        fanPos:        is1920 ? [496.1, 51.9]  : [404.8, 156.2],
        outletPos:     is1920 ? [334.2,  59.9] : [294.7, 159.3],
        outletDir:     "right",
        inletPos:      is1920 ? [350.2, -12.0] : [308.9, 116.2],
        inletDir:      "right",
        fanTooltipDir: "left",
      },
      {
        label:         "Cooling Tower-2",
        fanPos:        is1920 ? [496.1, 177.8] : [404, 232],
        outletPos:     is1920 ? [332.2, 179.8] : [294.7, 232.3],
        outletDir:     "right",
        inletPos:      is1920 ? [348.2, 121.9] : [309.9, 196.2],
        inletDir:      "right",
        fanTooltipDir: "left",
      },
      {
        label:         "Cooling Tower-3",
        fanPos:        is1920 ? [496.1, 301.8] : [404, 307],
        outletPos:     is1920 ? [336.2, 305.8] : [294.7, 308.4],
        outletDir:     "left",
        inletPos:      is1920 ? [348.2, 249.8] : [308.9, 277.2],
        inletDir:      "right",
        fanTooltipDir: "left",
      },
    ];

    const cfg       = ctConfig[index];
    const attrs     = element?.Eqp_Attributes ?? {};
    const fanVal    = attrs?.sts_on_off_00?.presentValue;
    const tripVal   = attrs?.alm_trip_00?.presentValue;
    const outletVal = attrs?.sts_vlv_on_off_02?.presentValue;
    const inletVal  = attrs?.sts_vlv_on_off_01?.presentValue;

    if (!cfg) return null;

    return (
      <React.Fragment key={index}>
        <Marker position={cfg.fanPos} icon={getFanIcon(fanVal, tripVal)}>
          <Tooltip direction={cfg.fanTooltipDir} opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                {cfg.label} Fan Status : {getFanStatus(fanVal, tripVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>

        <Marker position={cfg.outletPos} icon={getValveIcon(outletVal)}>
          <Tooltip direction={cfg.outletDir} opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                Inlet Valve-2 Status : {getValveStatus(outletVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>

        <Marker position={cfg.inletPos} icon={getValveIcon(inletVal)}>
          <Tooltip direction={cfg.inletDir} opacity={0.75}>
            <div>
              <span className={classes.Leaflet_Tooltip_Heading}>
                Inlet Valve-1 Status : {getValveStatus(inletVal)}
              </span>
            </div>
          </Tooltip>
        </Marker>
      </React.Fragment>
    );
  })
) : (
  <></>
)}

{/* ✅ CT-4 — hardcoded future use marker, not from database */}
<Marker position={window.innerWidth=='1920'?[496.1,427.8]:[400.95, 381]} icon={iconDevice3}>
  <Tooltip direction="left" opacity={0.75}>
    <div>
      <span className={classes.Leaflet_Tooltip_Heading}>
        Cooling Tower-4 : Unavailable
      </span>
    </div>
  </Tooltip>
</Marker>
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
                    CPO
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                  <div
                    className="your-required-wrapper"
                    style={{
                      width: "20vh",
                      marginLeft: "0vh",
                      height: "3.5vh",
                      // pointerEvents: cpmOverideStatus == 1 ? "none" : "",
                      // opacity: cpmOverideStatus == 1 ? "0.4" : "",
                    }}
                  >
                    <SwitchSelector
                      onChange={onChangeCPMStatus}
                      options={options}
                      // initialSelectedIndex={initialSelectedIndex}
                      forcedSelectedIndex={cpoMode
                        // cpmOverideStatus=='active'?
                        // 2:cpmAutoManualStatus == 'active'?
                        // 1:0
                      }
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
              {/* <Grid
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
              </Grid> */}
              {/* <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
    <Typography
      variant="string"
      style={{
       color: "black",
                      fontWeight: "bold",
                      fontSize: "1.8vh",
      }}
    >
      Sequencing Panel
    </Typography>
  </Grid> */}
              
              
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
               <Box className={classes.graphpaper} style={{height:'10.7vh',paddingTop:'2.5vh'}}>
                <Grid container spacing={1}>
                <Grid
                  container
                  item
                  xs={12}
                  style={{
                    marginTop: "-0.7vh",
                    textAlign: "left",height:'-1vh'
                  }}
                  direction="row"
                  alignItems="center"
                  justify="flex-start"
                >
                  <Grid
                    item
                    xs={7}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                    className={classes.controls_text}
                  >
                    CHW Header Set Point
                  </Grid>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                    <Grid
                        container
                        item
                        xs={12}
                        alignItems="center"
                        justify="flex-end"
                      >
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                        >
                          <TextField
                            // label="%"
                            placeholder={
                              formatter.format(eachHeaderData[0]?.Eqp_Attributes?.cmd_cwh_sup_temp_00?.presentValue) + "℃"
                            }
                            // style={{width:'8.5vh'}}
                            name="Set_Point"
                            autoComplete="off"
                            // formatter.format(freq)
                            value={spvalue1}
                            onChange={handleChangeForsetpointChW}
                            className={classes.text_field}
                          // variant="outlined"
                          style={{ marginTop: '-1vh' }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={5}
                          sm={5}
                          md={5}
                          lg={5}
                          xl={5}
                        >
                          <Paper
                            className={classes.set_button}
                            onClick={() => handleClickForSP('ChW Header')}
                            style={{
                              backgroundColor: "#0123B4",
                              display: "flex",
                              marginLeft: "1vh",
                              justifyContent: "center",
                              cursor: "pointer",
                              marginTop: "1vh",
                              // pointerEvents:
                              //   roleId != 2 ? "none" : "",
                              // opacity: roleId != 2 ? "0.4" : "",
                            }}
                          >
                            <div style={{ color: "white" }}>
                              set
                            </div>
                          </Paper>
                        </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid
                  container
                  item
                  xs={12}
                  style={{
                    marginTop: "0vh",
                    textAlign: "left",height:'-1vh'
                  }}
                  direction="row"
                  alignItems="center"
                  justify="flex-start"
                >
                  <Grid
                    item
                    xs={7}
                    sm={7}
                    md={7}
                    lg={7}
                    xl={7}
                    className={classes.controls_text}
                  >
                    CDW Header Set Point
                  </Grid>
                  <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                    <Grid
                        container
                        item
                        xs={12}
                        alignItems="center"
                        justify="flex-end"
                      >
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                        >
                          <TextField
                            // label="%"
                            placeholder={
                              formatter.format(eachHeaderData[0]?.Eqp_Attributes?.cmd_cdw_sup_temp_00?.presentValue) + "℃"
                            }
                            // style={{width:'8.5vh'}}
                            name="Set_Point"
                            autoComplete="off"
                            // formatter.format(freq)
                            value={spvalue2}
                            onChange={handleChangeForsetpointCDW}
                            className={classes.text_field}
                          // variant="outlined"
                          style={{ marginTop: '-2vh' }}
                          />
                        </Grid>
                        <Grid
                          item
                          xs={5}
                          sm={5}
                          md={5}
                          lg={5}
                          xl={5}
                        >
                          <Paper
                            className={classes.set_button}
                            onClick={() => handleClickForSP('CDW Header')}
                            style={{
                              backgroundColor: "#0123B4",
                              display: "flex",
                              marginLeft: "1vh",
                              justifyContent: "center",
                              cursor: "pointer",
                              marginTop: "1vh",
                              // pointerEvents:
                              //   roleId != 2 ? "none" : "",
                              // opacity: roleId != 2 ? "0.4" : "",
                            }}
                          >
                            <div style={{ color: "white" }}>
                              set
                            </div>
                          </Paper>
                        </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              </Box>  
              </Grid>

            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Box className={classes.graphpaper}>
                <div
                  style={{ fontWeight: "bold", color: "black" }}
                  className={classes.CardHeadFont}
                >
                  Chilled Water Header Temperature[°C]
                </div>
                <TimeS
                  name="Chilled Water Header Temperature"
                  data={par_cwh_ret_temp_01}
                  data2={par_cwh_sup_temp_01}
                  data3={par_cwh_ret_temp_02}
                  data4={par_cwh_sup_temp_02}
                  data24Hr={CWH_RT24Hr}
                  data224Hr={CWH_ST24Hr}
                  // minRange="0"
                  // maxRange="20"
                  via="CPM"
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
                  Condenser Water Header Temperature[°C]
                </div>
                <TimeS
                  name="Condenser Water Header Temperature"
                  data={par_cdw_ret_temp_00}
                  data24Hr={CDW_HRT24Hr}
                  data2={par_cdw_sup_temp_00}
                  data224Hr={CDW_HST24Hr}
                  // minRange="10"
                  // maxRange="40"
                  style={{ width: "100%", height: "100%" }}
                ></TimeS>
              </Box>
            </Grid>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
  <Box
    className={classes.graphpaper2}
    onClick={handleClick}
    style={{ cursor: "pointer" }}
  >

    {/* Table Layout */}
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "1.8vh" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", fontWeight: "600", color: "#070707", paddingBottom: "0.4vh", width: "25%" }}></th>
          <th style={{ textAlign: "right", fontWeight: "600", color: "#070707", paddingBottom: "0.4vh", width: "25%" }}>TR</th>
          <th style={{ textAlign: "right", fontWeight: "600", color: "#070707", paddingBottom: "0.4vh", width: "25%" }}>KW/TR</th>
          <th style={{ textAlign: "right", fontWeight: "600", color: "#070707", paddingBottom: "0.4vh", width: "25%" }}>%FLA</th>
        </tr>
      </thead>
      <tbody>
        {/* Plant Row */}
        {/* <tr>
          <td style={{ fontWeight: "600", color: "#070707" }}>Plant</td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {planttr != null ? Number(planttr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {instanceKwPerTr != null ? Number(instanceKwPerTr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>-</td>
        </tr> */}

        {/* C1 Row */}
        <tr>
          <td style={{ fontWeight: "600", color: "#070707" }}>C1:</td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch1Tr != null ? Number(ch1Tr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch1KwPerTr != null ? Number(ch1KwPerTr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch1Fla != null ? `${Number(ch1Fla).toFixed(2)}%` : "-"}
          </td>
        </tr>

        {/* C2 Row */}
        <tr>
          <td style={{ fontWeight: "600", color: "#070707" }}>C2:</td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch2Tr != null ? Number(ch2Tr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch2KwPerTr != null ? Number(ch2KwPerTr).toFixed(2) : "-"}
          </td>
          <td style={{ textAlign: "right", color: "#070707" }}>
            {ch2Fla != null ? `${Number(ch2Fla).toFixed(2)}%` : "-"}
          </td>
        </tr>
      </tbody>
    </table>
  </Box>
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
      <Dialog
        onClose={handleClose2}
        aria-labelledby="customized-dialog-title"
        open={modal2}
        classes={{ paper: classes.customDialog }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose2}>
          Reports
        </DialogTitle>
        <DialogContent dividers>
          <ChillerReports data={"Jahnavi"} />
        </DialogContent>
      </Dialog>
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
