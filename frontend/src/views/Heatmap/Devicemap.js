import React, { useRef, useEffect, useState } from 'react'
import api from '../../api'
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import { Paper, Grid, Typography, Card, ButtonGroup, Divider, TextField, } from '@material-ui/core';
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl, Rectangle, Circle, Polygon } from 'react-leaflet';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import DevicetrendChart from 'views/DevicetrendChart';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";
import { useSelector } from 'react-redux';
import FloorTempIcon from 'assets/img/FloorTempIcon';
import FloorHumIcon from 'assets/img/FloorHumIcon';
import AirQualityIcon from 'assets/img/AirQualityIcon';
import { message, Spin } from 'antd';
import ControlWhite from 'assets/img/ControlWhite';
import Control from 'assets/img/Control';
import { SemanticToastContainer } from 'react-semantic-toasts';
import '../../assets/css/leaflet.sass';
import ReactSimpleRange from "react-simple-range";
import { redColor, yellowColor, greenColor, whiteColor, greyColor, blackColor, blueColor, hexToRgb } from "assets/jss/material-dashboard-react.js";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import FloorTempIconWhite from 'assets/img/FloorTempIconWhite';
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import floor2 from '../../assets/Images/Floor-1.png';
// import FirstFloor from '../../assets/Images/FirstFloor.png';
// import GroundFloor from '../../assets/Images/GroundFloor.png';
// import SecondFloor from '../../assets/Images/SecondFloor.png';
import ThirdFloor from '../../assets/Images/Third-Floor.png';
import FourthFloor from '../../assets/Images/Fourth-Floor.png';
import Basement from '../../assets/Images/Basement.png'
import Terrace from '../../assets/Images/Terrace.png';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip1 from '@material-ui/core/Tooltip';
import DevicemapTHL from '../Heatmap/DevicemapTHL';
import LandingPage from './../Heatmap/upsEmsLanding';
import fanimg from './../../assets/img/AHU-fan-img.png';
import SwitchSelector from "react-switch-selector";
import PumpPage from "./../Chiller/GlPrimaryPump";
import engine from '../../assets/img/engine-fan.png';
import CSU from '../../assets/Images/CSU.png'
import enginegreen from '../../assets/img/engine-fan_green.png';
import enginegrey from '../../assets/img/engine-fan_grey.png';
import enginered from '../../assets/img/engine-fan_red.png';
import L from 'leaflet';

const Leaflet = require('leaflet');

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize: "12px"
  }
})(Tooltip1);

const useStyles = makeStyles(theme => ({
  customDialog: {
    cursor: "pointer",
    // Set the desired width for the dialog
    width: '500px', // Adjust this value as needed
  },
  text_field: {
    marginLeft: "-0.5vh",
    "& .MuiInputBase-input": { fontSize: '1.7vh' },
    fontFamily: "Arial",
    [theme.breakpoints.down('sm')]: {
      marginLeft: '-1.5vh',
      width: '4.5vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '3.5vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '6.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '6.5vh'
    },
  },

  alerts: {
    width: '8%',
    height: '7%',
    borderRadius: '3%'
  },
  set_button: {
    marginLeft: "-0.7vh",
    fontFamily: "Arial",
    [theme.breakpoints.down('sm')]: {
      // marginLeft:'0.5vh',
      marginLeft: '-1.2vh',
      width: '3vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '3vh',
      marginLeft: '-1vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '3.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '3.5vh'
    },
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  transparentTooltip: {
    border: "1px solid black",
    boxShadow: "none",
    // fontSize: "14px",
    // fontWeight: "bold",
    margin: "0"
  },
  transparentTooltip1: {
    border: "0.5px solid black",
    borderRadius: "10px",
    boxShadow: "none",
    // fontSize: "14px",
    // fontWeight: "bold",
    margin: "0"
  },
  vertical: {
    borderLeft: '1px solid lightgrey',
    height: "4em",
    marginLeft: "-7%",
    fontColor: 'blue',
    marginTop: '-10vh'
  },
  vavbutton: {
    width: '29%',
    height: '4vh',
    backgroundColor: "#D3D3D3",
    border: "none",
    cursor: "pointer",
    fontSize: "2vh",
    borderRadius: "0.4vw",
    margin: '2%'
  },
  paper: {
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '0px 8px 40px #0123B433;',
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: '12px',
    opacity: '1'
  },
  paper1: {
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '0px 0px 10px #0123B421',
    opacity: '1',
    borderRadius: '12px',
    height: '15vh',
    // display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    whiteSpace: "nowrap",
    color: "#000000",
    marginTop: '1vh',
    font: 'normal normal medium 17px/60px Bw Seido Round',
    opacity: '1',
    fontWeight: 'bold'
  },
  semicircleBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    marginTop: '-0.8vh'
  },
  cardbody: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: "center",
    fontSize: "4vh",
    fontWeight: 'bold',
    opacity: '1',
    color: blueColor[0]
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: blueColor[0], borderRadius: "8px"
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh"
    }
  },
  root: {
    flexGrow: 1,
    marginTop: '-0.5vh'
  },
  formControl: {
    autosize: true,
    clearable: false
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: blueColor[0], borderRadius: "8px"
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh"
    }
  },
  paper: {
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: '10vh',
    marginTop: "1vh",
    opacity: '1'
  },
  imagecard: {
    height: "60.8vh",
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: '6px',
  },
  graphpaper: {
    height: "25.7vh",
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // backgroundColor: 'white',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    // opacity:"1",
    borderRadius: '6px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: '#Fefefa',
    height: '19.5vh',
  },
  button: {
    whiteSpace: 'nowrap',
    border: 'none',
    textTransform: 'none',
    '&.selected': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  },
  smallbuttons: {
    width: '29%',
    height: '3.9vh',
    backgroundColor: "rgb(239 229 229 / 87%)",
    border: "none",
    cursor: "pointer",
    fontSize: "2vh",
    borderRadius: "0.4vw",
    margin: '2%'
  },
}));

function rand() {
  return Math.round(Math.random() * 20) - 10;
}
function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
    height: "43vh",
    width: "89vh"
  };
}

function getJSONElement(myJson, elementPath = []) {
  let eValue = myJson;
  for (let i = 0; i < elementPath.length; i++) {
    if (eValue !== undefined && eValue !== null) {
      eValue = eValue[elementPath[i]];

      // Check if the value is the string "NULL" and return null
      if (typeof eValue === 'string' && eValue.toUpperCase() === 'NULL') {
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

function Devicemap(props) {
  const circleRefs = useRef([]);
  const classes = useStyles();
  const mapRef = React.createRef()
  const [AhuOpen, setAhuOpen] = React.useState(false)
  const [zone_tag, setZone_Tag] = React.useState(props.zone_tag);
  const tooltipRefs = useRef([]);
  // console.log("props.history.location.state.param",props.history.location.state.param)
  const [heatMapData, setHeatMapdata] = React.useState({
    rectData: [],
    addressPoints: [],
    // mapSubType: localStorage.getItem('mapSubType')
    // mapSubType: props.history.location.state.param ==='csu' ? props.history.location.state.param.toLocaleLowerCase() : "ahu"
    mapSubType: props.history.location.state?props.history.location.state.param:'ahu'
  });

  const colorScale = (value, bounds) => {
    // console.log("value",value)
    // console.log("bounds",bounds)
    if (value > 28) {
      return redColor[0];
    } else if (value > 23 && value < 27) {
      return greenColor[0];
    } else {
      return blueColor[0];
    }
  };

  const getColor = (temperature) => {
    if (temperature >= 0 && temperature <= 20) {
      return yellowColor[0]; // Yellow
    } else if (temperature >= 21 && temperature <= 25) {
      return greenColor[0]; // Green
    } else if (temperature > 25 && temperature <= 35) {
      return redColor[0]; // Red
    } else {
      return 'defaultColor'; // Set your default color here
    }
  };

  const heatmapConf = {
    THL: {
      format: "℃",
      maxIntensity: 27,
    },
    humidity: {
      format: "RH",
      maxIntensity: 70,
    },
    luminosity: {
      format: "LX",
      maxIntensity: 270,
    },
    occupancy: {
      format: "%",
      maxIntensity: 74,
    },
    DALI_Slave: {
      format: "LX",
      maxIntensity: 0,
    },
    WAC: {
      format: "LX",
      maxIntensity: 0,
    }
  }

  // const getFillColor = (RAT, Temperature) => {
  //   console.log(`RAT ${RAT} Temperature ${Temperature}`)
  //   if (RAT > 28 || Temperature > 28) {
  //     return 'red';
  //   } else if ((RAT >= 23 && RAT <= 27) || (Temperature >= 23 && Temperature <= 27)) {
  //     return 'green';
  //   } else {
  //     return 'blue';
  //   }
  // };
  const getFillColor = (RAT) => {
    // console.log(`RAT ${RAT}`)
    if (RAT >= 33) {
      return redColor[0];
    } else if (RAT >= 23 && RAT <= 32) {
      return greenColor[0];
    } else {
      return blueColor[0];
    }
  };


  const alerts = useSelector(state => state.alarm.alarmData)
  ///////////////
  const [eachAhuData, setEachAhuData] = React.useState([])
  const [eachCsuData, setEachCSUData] = React.useState([])
  const [fauAlerts, setFAUAlerts] = useState([]);
  const [csuAlerts, setCSUAlerts] = useState([]);
  const [ventilatorAlerts, setVentilatorAlerts] = useState([]);
  const [exhaustFansAlerts, setExhaustFansAlerts] = useState([]);
  ///////////////
  const [criticalAlertsAhu, setcriticalAlertsAhu] = React.useState(0);
  const [criticalAlertsFAU, setcriticalAlertsFAU] = React.useState(0);
  const [criticalAlertsVentilator, setcriticalAlertsVentilator] = React.useState(0);
  const [criticalAlertsExhaustFans, setcriticalAlertsExhaustFans] = React.useState(0);
  ///////////////
  const [allFloorsAlarms, setAllFloorsAlarms] = React.useState(0);
  const [criticalAlarms, setCriticalAlarms] = React.useState(0);
  const [nonCriticalAlarms, setNonCriticalAlarms] = React.useState(0);
  ///////////////
  const [soluAlertsAhu, setsoluAlertsAhu] = React.useState(0);
  const [soluAlertsFAU, setsoluAlertsFAU] = React.useState(0);
  const [bounds, setBounds] = React.useState([]);
  const [soluAlertsVentilator, setsoluAlertsVentilator] = React.useState(0);
  const [soluAlertsExhaustFans, setsoluAlertsExhaustFans] = React.useState(0);
  ///////////////
  const [iconDevice, setIconDevice] = React.useState({});
  const [tempOpen, setTempOpen] = React.useState(false);
  const [humOpen, setHumOpen] = React.useState(false);
  const [luxOpen, setLuxOpen] = React.useState(false);
  const [newvalue, setNewValue] = React.useState("ahu");
  const buildingID = useSelector(state => state.isLogged.data.building.id);
  // const iconDevice1 = new Leaflet.Icon({
  //   iconUrl: require('../../assets/img/thl-1.png'),
  //   iconRetinaUrl: require('../../assets/img/thl-1.png'),
  //   iconSize: new Leaflet.Point(25, 25),
  //   className: 'leaflet-div-icon-1'
  // });
  // const iconDevice3 = new Leaflet.Icon({
  //   iconUrl: require('../../assets/img/AHU.png'),
  //   iconRetinaUrl: require('../../assets/img/AHU.png'),
  //   iconSize: new Leaflet.Point(30,30),
  //   className: 'leaflet-div-icon-2'
  // });

  const [devId, setDevId] = React.useState('')
  const [devOnOff, setDevOnOff] = React.useState(0)
  const [deviceTrendData, setDeviceTrend] = React.useState([])
  const [openmodal, setOpenmodal] = React.useState(false)
  const [modalStyle] = React.useState(getModalStyle);
  const [setpt, setSetpt] = React.useState("");
  const [text, setText] = React.useState(false);
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState('');
  const [show, setShow] = React.useState(true);
  const [vavData, setDevData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [deviceModal, setDeviceModal] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const [deviceData, setDeviceData] = useState({});
  const [image, setImage] = React.useState('')
  const coords = [];

  let MAX_AIR_FLOW = 1350;
  let MIN_AIR_FLOW = 0;
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const rectangleBounds = [[234.49, -0.08], [234.5, -0.06]];
  const options1 = [
    {
      label: "Auto",
      value: "auto",
      selectedBackgroundColor: greenColor[0],
      fontSize: "12"
    },
    {
      label: "Manual",
      value: "manual",
      selectedBackgroundColor: greenColor[0],
      fontSize: "12"

    },
  ];

  const options = [
    {
      label: "OFF",
      value: 0,
      selectedBackgroundColor: redColor[0],
      fontSize: "10"

    },
    {
      label: "ON",
      value: 1,
      selectedBackgroundColor: "#34C759",
      fontSize: "10"
    },
    {
      label: "AUTO",
      value: 2,
      selectedBackgroundColor: blueColor[0],
      fontSize: "10"
    },
  ];

  const initialSelectedIndex1 = options1.findIndex(
    ({ value }) => value === "manual"
  );

  const handleButtonHover = (data) => {
    setHoveredButton(data);
  };

  const handleButtonLeave = () => {
    setHoveredButton(null);
  };

  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require('../../assets/img/sensor-icon.png'),
    iconRetinaUrl: require('../../assets/img/sensor-icon.png'),
    iconSize: new Leaflet.Point(10, 10),
    className: 'leaflet-div-icon-1'
  });

  // const mapRef = useRef(null);
  const rectangleRef = useRef(null);
  const styles = (theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

  const DialogTitle = withStyles(styles)((props) => {
    const { children, classes, onClose, ...other } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
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

  const DialogActions = withStyles((theme) => ({
    root: {
      margin: 0,
      padding: theme.spacing(1),
    },
  }))(MuiDialogActions);

  const onClickEachDevice = (name, data) => {
    if (name == 'FAU') {
      localStorage.setItem("deviceID", data.id);
      localStorage.setItem("deviceName", data.name);
      props.history.push({
        pathname: `/admin/glFAU`,
        state: {
          data: data.id,
          name: data.name,
          floorId: localStorage.getItem('floorID'),
          floorName: localStorage.getItem('floorName'),
          // data: res.ssid,
          // name:res.name,
        }
      })
    } else {
      setDeviceModal(true)
      setDeviceType(name)
      setDeviceData(data)
    }
  }

  const DeviceAlarms = (response, devicetype) => {
    let respp = response.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    if (response.length !== 0) {
      let sdevices = []
      let CriticalTotal = 0
      let solutionTotal = 0
      if (alerts.system.length === 0 && alerts.solution.length === 0) {
        let con = 0
        respp.map(element => {
          let obj = {}
          con++
          obj["name"] = element.name
          obj["id"] = element.ssid
          obj["type"] = element.type
          obj["controlable"] = element["controlable"]
          // obj["Eqp_Metrics"] = element["Eqp_Metrics"]
          obj["alerts_cri"] = 0
          obj["alerts_solu"] = 0
          sdevices.push(obj)
          if (respp.length === con) {
            if (devicetype == "AHU") {
              setEachAhuData(sdevices)
            }
            if (devicetype == "CSU") {
              setEachCSUData(sdevices)
            }
            if (devicetype == "FAU") {
              setFAUAlerts(sdevices)
            }
            if (devicetype == "Ventilator") {
              setVentilatorAlerts(sdevices)
            }
            if (devicetype == "Exhaust Fans") {
              setExhaustFansAlerts(sdevices)
            }
          }
          return element
        })
      }

      if (alerts.system.length > 0 && alerts.solution.length > 0) {
        respp.map(element => {
          let obj = {}
          obj["name"] = element.name
          obj["id"] = element.ssid
          obj["type"] = element.type
          obj["controlable"] = element["controlable"]
          // obj["Eqp_Metrics"] = element["Eqp_Metrics"]
          let count = 0
          let ci = 0

          Object.keys(alerts.locationWise).forEach(key => {
            if (key === element.zoneId) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms)
              setCriticalAlarms(alerts.locationWise[key].critical)
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical)
            }
            // else{
            //   setAllFloorsAlarms(0)
            //   setCriticalAlarms(0)
            //   setNonCriticalAlarms(0)
            // }
          })

          alerts.system.map(ele => {
            if (element.ssid === ele.device_id) {
              count++
              ci++
              CriticalTotal++
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci
                // if (devicetype == "AHU") {
                //   setcriticalAlertsAhu(CriticalTotal)
                // }
                // if (devicetype == "FAU") {
                //   setcriticalAlertsFAU(CriticalTotal)
                // }
                // if (devicetype == "Ventilator") {
                //   setcriticalAlertsVentilator(CriticalTotal)
                // }
                // if (devicetype == "Exhaust Fans") {
                //   setcriticalAlertsExhaustFans(CriticalTotal)
                // }
                let si = 0
                let counts = 0
                alerts.solution.map(ele1 => {
                  // console.log("qwerty element",element,"ele1",ele1)
                  if (element.name === ele1.device_name) {
                    counts++
                    si++
                    solutionTotal++
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si
                      sdevices.push(obj)
                      if (devicetype == "AHU") {
                        // setsoluAlertsAhu(solutionTotal)
                        setEachAhuData(sdevices)
                      }
                      if (devicetype == "CSU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setEachCSUData(sdevices)
                      }
                      if (devicetype == "FAU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setFAUAlerts(sdevices)
                      }
                      if (devicetype == "Ventilator") {
                        // setsoluAlertsVentilator(solutionTotal)
                        setVentilatorAlerts(sdevices)
                      }
                      if (devicetype == "Exhaust Fans") {
                        // setsoluAlertsExhaustFans(solutionTotal)
                        setExhaustFansAlerts(sdevices)
                      }
                    }
                  } else {
                    counts++
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si
                      sdevices.push(obj)
                      // console.log("sdevvv",sdevices)
                      if (devicetype == "AHU") {
                        // setsoluAlertsAhu(solutionTotal)
                        setEachAhuData(sdevices)
                      }
                      if (devicetype == "CSU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setEachCSUData(sdevices)
                      }
                      if (devicetype == "FAU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setFAUAlerts(sdevices)
                      }
                      if (devicetype == "Ventilator") {
                        // setsoluAlertsVentilator(solutionTotal)
                        setVentilatorAlerts(sdevices)
                      }
                      if (devicetype == "Exhaust Fans") {
                        // setsoluAlertsExhaustFans(solutionTotal)
                        setExhaustFansAlerts(sdevices)
                      }
                    }
                  }
                  return ele1
                })

              }
            } else {
              count++
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci
                // if (devicetype == "AHU") {
                //   setcriticalAlertsAhu(CriticalTotal)
                // }
                // if (devicetype == "FAU") {
                //   setcriticalAlertsFAU(CriticalTotal)
                // }
                // if (devicetype == "Ventilator") {
                //   setcriticalAlertsVentilator(CriticalTotal)
                // }
                // if (devicetype == "Exhaust Fans") {
                //   setcriticalAlertsExhaustFans(CriticalTotal)
                // }
                let si = 0
                let counts = 0
                alerts.solution.map(ele => {
                  if (element.ssid === ele.device_id) {
                    counts++
                    si++
                    solutionTotal++
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si
                      sdevices.push(obj)
                      if (devicetype == "AHU") {
                        // setsoluAlertsAhu(solutionTotal)
                        setEachAhuData(sdevices)
                      }
                      if (devicetype == "CSU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setEachCSUData(sdevices)
                      }
                      if (devicetype == "FAU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setFAUAlerts(sdevices)
                      }
                      if (devicetype == "Ventilator") {
                        // setsoluAlertsVentilator(solutionTotal)
                        setVentilatorAlerts(sdevices)
                      }
                      if (devicetype == "Exhaust Fans") {
                        // setsoluAlertsExhaustFans(solutionTotal)
                        setExhaustFansAlerts(sdevices)
                      }
                    }
                  } else {
                    counts++
                    if (alerts.solution.length === counts) {
                      obj["alerts_solu"] = si
                      sdevices.push(obj)
                      if (devicetype == "AHU") {
                        // setsoluAlertsAhu(solutionTotal)
                        setEachAhuData(sdevices)
                      }
                      if (devicetype == "CSU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setEachCSUData(sdevices)
                      }
                      if (devicetype == "FAU") {
                        // setsoluAlertsFAU(solutionTotal)
                        setFAUAlerts(sdevices)
                      }
                      if (devicetype == "Ventilator") {
                        // setsoluAlertsVentilator(solutionTotal)
                        setVentilatorAlerts(sdevices)
                      }
                      if (devicetype == "Exhaust Fans") {
                        // setsoluAlertsExhaustFans(solutionTotal)
                        setExhaustFansAlerts(sdevices)
                      }
                    }
                  }
                  return ele
                })
              }
            }
            return ele
          })
          return element
        })
      }

      if (alerts.system.length > 0 && alerts.solution.length === 0) {
        respp.map(element => {
          let obj = {}
          obj["name"] = element.name
          obj["id"] = element.ssid
          obj["type"] = element.type
          obj["controlable"] = element["controlable"]
          // obj["Eqp_Metrics"] = element["Eqp_Metrics"]
          let count = 0
          let ci = 0

          Object.keys(alerts.locationWise).forEach(key => {
            if (key === element.zoneId) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms)
              setCriticalAlarms(alerts.locationWise[key].critical)
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical)
            }
            else{
              setAllFloorsAlarms(0)
              setCriticalAlarms(0)
              setNonCriticalAlarms(0)
            }})

          alerts.system.map(ele => {
            if (element.ssid === ele.device_id) {
              count++
              ci++
              CriticalTotal++
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci
                obj["alerts_solu"] = 0
                // if (devicetype == "AHU") {
                //   setcriticalAlertsAhu(CriticalTotal)
                // }
                // if (devicetype == "FAU") {
                //   setcriticalAlertsFAU(CriticalTotal)
                // }
                // if (devicetype == "Ventilator") {
                //   setcriticalAlertsVentilator(CriticalTotal)
                // }
                // if (devicetype == "Exhaust Fans") {
                //   setcriticalAlertsExhaustFans(CriticalTotal)
                // }
                sdevices.push(obj)
                if (devicetype == "AHU") {
                  setEachAhuData(sdevices)
                }
                if (devicetype == "CSU") {
                  setEachCSUData(sdevices)
                }
                if (devicetype == "FAU") {
                  setFAUAlerts(sdevices)
                }
                if (devicetype == "Ventilator") {
                  setVentilatorAlerts(sdevices)
                }
                if (devicetype == "Exhaust Fans") {
                  setExhaustFansAlerts(sdevices)
                }
                //  (sdevices)          
              }
            } else {
              count++
              if (alerts.system.length === count) {
                obj["alerts_cri"] = ci
                obj["alerts_solu"] = 0
                // if (devicetype == "AHU") {
                //   setcriticalAlertsAhu(CriticalTotal)
                // }
                // if (devicetype == "FAU") {
                //   setcriticalAlertsFAU(CriticalTotal)
                // }
                // if (devicetype == "Ventilator") {
                //   setcriticalAlertsVentilator(CriticalTotal)
                // }
                // if (devicetype == "Exhaust Fans") {
                //   setcriticalAlertsExhaustFans(CriticalTotal)
                // }
                sdevices.push(obj)
                if (devicetype == "AHU") {
                  setEachAhuData(sdevices)
                }
                if (devicetype == "CSU") {
                  setEachCSUData(sdevices)
                }
                if (devicetype == "FAU") {
                  setFAUAlerts(sdevices)
                }
                if (devicetype == "Ventilator") {
                  setVentilatorAlerts(sdevices)
                }
                if (devicetype == "Exhaust Fans") {
                  setExhaustFansAlerts(sdevices)
                }
              }
            }
            return ele
          })
          return element
        })
      }

      if (alerts.system.length === 0 && alerts.solution.length > 0) {
        respp.map(element => {
          let obj = {}
          obj["name"] = element.name
          obj["id"] = element.ssid
          obj["type"] = element.type
          obj["controlable"] = element["controlable"]
          // obj["Eqp_Metrics"] = element["Eqp_Metrics"]
          let count = 0
          let ci = 0
          Object.keys(alerts.locationWise).forEach(key => {
            if (key === element.zoneId) {
              setAllFloorsAlarms(alerts.locationWise[key].total_alarms)
              setCriticalAlarms(alerts.locationWise[key].critical)
              setNonCriticalAlarms(alerts.locationWise[key].nonCritical)
            }
            else{
              setAllFloorsAlarms(0)
              setCriticalAlarms(0)
              setNonCriticalAlarms(0)
            }})

          alerts.solution.map(ele => {
            if (element.ssid === ele.device_id) {
              count++
              ci++
              solutionTotal++
              if (alerts.solution.length === count) {
                obj["alerts_solu"] = ci
                obj["alerts_cri"] = 0
                sdevices.push(obj)
                if (devicetype == "AHU") {
                  // setsoluAlertsAhu(solutionTotal)
                  setEachAhuData(sdevices)
                }
                if (devicetype == "CSU") {
                  // setsoluAlertsFAU(solutionTotal)
                  setEachCSUData(sdevices)
                }
                if (devicetype == "FAU") {
                  // setsoluAlertsFAU(solutionTotal)
                  setFAUAlerts(sdevices)
                }
                if (devicetype == "Ventilator") {
                  // setsoluAlertsVentilator(solutionTotal)
                  setVentilatorAlerts(sdevices)
                }
                if (devicetype == "Exhaust Fans") {
                  // setsoluAlertsExhaustFans(solutionTotal)
                  setExhaustFansAlerts(sdevices)
                }
              }
            } else {
              count++
              if (alerts.solution.length === count) {
                obj["alerts_solu"] = ci
                obj["alerts_cri"] = 0
                sdevices.push(obj)
                if (devicetype == "AHU") {
                  // setsoluAlertsAhu(solutionTotal)
                  setEachAhuData(sdevices)
                }
                if (devicetype == "CSU") {
                  // setsoluAlertsFAU(solutionTotal)
                  setEachCSUData(sdevices)
                }
                if (devicetype == "FAU") {
                  // setsoluAlertsFAU(solutionTotal)
                  setFAUAlerts(sdevices)
                }
                if (devicetype == "Ventilator") {
                  // setsoluAlertsVentilator(solutionTotal)
                  setVentilatorAlerts(sdevices)
                }
                if (devicetype == "Exhaust Fans") {
                  // setsoluAlertsExhaustFans(solutionTotal)
                  setExhaustFansAlerts(sdevices)
                }
              }
            }
            return ele
          })
          return element
        })
      }

    }
    else {
      // if (devicetype == "AHU") {
        setEachAhuData([])
      // }
      // if (devicetype == "CSU") {
        setEachCSUData([])
      // }
      // if (devicetype == "FAU") {
        setFAUAlerts([])
      // }
      // if (devicetype == "Ventilator") {
        setVentilatorAlerts([])
      // }
      // if (devicetype == "Exhaust Fans") {
        setExhaustFansAlerts([])
      // }
    }
  }

  useEffect(() => {
    let isMounted = true;
    const zone_tag = localStorage.getItem('zone_tag');
    if (zone_tag === '2Third_Floor') {
      setImage(ThirdFloor)
    } else if (zone_tag === '3Fourth_Floor'){
      setImage(FourthFloor)
    }else if (zone_tag === '4Terrace'){
      setImage(Terrace)
    }else if (zone_tag === '1Basement'){
      setImage(Basement)
    }else {
      setImage(ThirdFloor)
    }

    localStorage.removeItem("type")
    let type = zone_tag === '1Basement'
  ? (props.history.location.state ? props.history.location.state.param : 'csu')
  : (props.history.location.state ? props.history.location.state.param : 'ahu');

    // let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType === '' ? 'ahu' : heatMapData.mapSubType
    // let type = props.history.location.state === null ? 'csu':props.history.location.state.param
  //   let type = props.history.location.state === null 
  // ? 'csu' 
  // : (props.history.location.state.param ?? 'ahu');
    switch (type) {
      case "ahu": setAhuOpen(true)
        // setIconDevice(iconDevice3)
        break;
      default: break;
    }
    let f_id = localStorage.getItem('floorID')
    let dev = (type == 'ahu' ? 'NONGL_SS_AHU' : 'NONGL_SS_CSU')
    api.floor.newDevicemapApi(f_id, dev).then((res) => {
      res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
      if (res.length !== 0) {
        DeviceAlarms(res, type == 'ahu'?"AHU":"CSU")
        setNewValue(type)
        let zoneData = []
        setHeatMapdata({
          ...heatMapData,
          rectData: zoneData,
          addressPoints: res,
          mapSubType: type
        })
      } else {
        setHeatMapdata({
          ...heatMapData,
          rectData: [],
          addressPoints: [],
          mapSubType: ""
        })
        setEachAhuData([]);
      }
    }).catch((error) => {
      setOpenerr(true)
      if (error.response) {
        setErrmsg(error.response.data.message)
      } else {
        setErrmsg('')
      }
      // setErrmsg(error.response.data.message)
    })
    // api.floor.newDevicemapApi(f_id, 'FRESH_AIR_UNIT').then((res) => {
    //   res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    //   if (res.length !== 0) {
    //     DeviceAlarms(res, "FAU")
    //   } else {
    //     setFAUAlerts([]);
    //   }
    // }).catch((error) => {
    //   setOpenerr(true)
    //   if (error.response) {
    //     setErrmsg(error.response.data.message)
    //   } else {
    //     setErrmsg('')
    //   }
    // })
    // api.floor.newDevicemapApi(f_id, 'SS_VENTILATOR_1').then((res) => {
    //   res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    //   if (res.length !== 0) {
    //     DeviceAlarms(res, "Ventilator")
    //   } else {
    //     setVentilatorAlerts([]);
    //   }
    // }).catch((error) => {
    //   setOpenerr(true)
    //   if (error.response) {
    //     setErrmsg(error.response.data.message)
    //   } else {
    //     setErrmsg('')
    //   }
    //   // setErrmsg(error.response.data.message)
    // })
    // api.floor.newDevicemapApi(f_id, 'EXHAUST_FAN').then((res) => {
    //   res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    //   if (res.length !== 0) {
    //     DeviceAlarms(res, "Exhaust Fans")
    //   } else {
    //     setExhaustFansAlerts([]);
    //   }


    // }).catch((error) => {
    //   setOpenerr(true)
    //   if (error.response) {
    //     setErrmsg(error.response.data.message)
    //   } else {
    //     setErrmsg('')
    //   }
    //   // setErrmsg(error.response.data.message)
    // })
    api.dashboard.getMetricData(buildingID).then(res => {
    }).catch((error) => {
      setOpenerr(true)
      if (error.response) {
        setErrmsg(error.response.data.message)
      } else {
        setErrmsg('')
      }
      // setErrmsg(error.response.data.message)
    })
    let trendData = []
    if(type == 'ahu'){
      trendData = [{
        'ChW_Valve': [],
        'RAT': [],
        'SAT': [],
      }]
    }else{
      trendData = [{
        'CSU_Duct_pre': [],
        'CSU_RAT': [],
        'CSU_SAT_Duct_Temp': [],
      }]
    }
    // api.floor.ae(props.data.location.state.data).then(res => {
    api.floor.ae(localStorage.getItem('floorID')).then(res => {
      if (!isMounted) return;
      res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
      if (res.length !== 0 && trendData.length>0) {
        for (let keysss in trendData[0]) {
          res.forEach(obj => {
            for (let da in obj) {
              if (da === keysss) {
                trendData[0][keysss].push(obj[da])
              }
            }
          })
        }
        setDeviceTrend(trendData)
      } else {
        setDeviceTrend([]);
      }
    })  .catch(error => {
      if (!isMounted) return;

      setOpenerr(true);
      if (error.response && error.response.data?.message) {
        setErrmsg(error.response.data.message);
      } else {
        setErrmsg('');
      }
    });

      return () => {
    isMounted = false; 
  };

  }, [alerts.system.length, zone_tag,alerts.solution.length,localStorage.getItem('floorID')]);


  const handleDeviceClick = (value) => { }
  // const handleClose1 = () => {
  //   setOpen(false);
  // };
  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg('');
  };

  // const onChangetype = newValue => {
  //   setNewValue(newValue)
  //   // console.log("new value",newValue)
  //   let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
  //   // console.log("typppppppppppppppppppppppppeeeeeeeeeeeee",type)
  //   switch (newValue) {
  //     case "ahu":
  //       setAhuOpen(true)
  //       setTempOpen(false)
  //       setHumOpen(false)
  //       setLuxOpen(false)
  //       // setIconDevice(iconDevice3)
  //       break
  //     case "aqi":
  //       setLuxOpen(true)
  //       setAhuOpen(false)
  //       setTempOpen(false)
  //       setHumOpen(false)
  //       // setIconDevice(iconDevice1)
  //       break
  //     case "THL":
  //       setTempOpen(true)
  //       setLuxOpen(false)
  //       setAhuOpen(false)
  //       setHumOpen(false)
  //       setIconDevice(iconDevice1)
  //       break
  //     case "humidity":
  //       setHumOpen(true)
  //       setTempOpen(false)
  //       setLuxOpen(false)
  //       setAhuOpen(false)
  //       // setIconDevice(iconDevice1)
  //       break
  //     default: break;
  //   }

  //   if (newValue === 'ahu') {
  //     setLoading(true)
  //     const apiRequest = api.floor.devicemap(props.data.location.state.data, newValue.toLocaleUpperCase());
  //     const timeoutPromise = new Promise((_, reject) => {
  //       setTimeout(() => {
  //         reject(new Error('Timeout: The API response took too long.'));
  //       }, 3000);
  //     });

  //     Promise.race([apiRequest, timeoutPromise])
  //       .then((res) => {
  //         let zoneData = []
  //         setAhuOpen(true)
  //         setHeatMapdata({
  //           ...heatMapData,
  //           rectData: zoneData,
  //           addressPoints: res,
  //           mapSubType: "ahu"
  //         });
  //       })
  //       .catch((error) => {
  //         setOpenerr(true);
  //       })
  //       .finally(() => {
  //         setLoading(false);
  //       });
  //   } else {
  //     // setLoading(true)
  //     if (props.data.location.state.data && newValue) {
  //       const apiRequest = api.floor.heatmap(props.data.location.state.data, newValue.toLocaleUpperCase())
  //       const timeoutPromise = new Promise((_, reject) => {
  //         setTimeout(() => {
  //           reject(new Error('Timeout: The API response took too long.'));
  //         }, 3000);
  //       });

  //       Promise.race([apiRequest, timeoutPromise])
  //         .then((res) => {
  //           let zoneData = [], devData = [];
  //           let obj = {}, deviceObj = {};
  //           setHeatMapdata({
  //             ...heatMapData,
  //             rectData: zoneData,
  //             addressPoints: res,
  //             mapSubType: newValue
  //           });
  //         })
  //         .catch((error) => {
  //           setOpenerr(true);
  //         })
  //         .finally(() => {
  //           setLoading(false);
  //         });
  //     }
  //   }
  // };
  // const onClickIssue = (id, name, param) => {
  //   console.log('issuuuee', id, name, param)
  //   localStorage.setItem("deviceID", id);
  //   localStorage.setItem("deviceName", name);
  //   props.data.history.push({
  //     pathname: `/admin/glAhu`,
  //     state: {
  //       data: id,
  //       name: name
  //     }
  //   })
  // }

  const handleDevClick = (data, type) => {
    console.log("typeeeee", data)
    if (type == 'FAU') {
      localStorage.setItem("deviceID", data.id);
      localStorage.setItem("deviceName", data.name);
      props.history.push({
        pathname: `/admin/glFAU`,
        state: {
          data: data.ssid,
          name: data.name,
          floorId: localStorage.getItem('floorID'),
          floorName: localStorage.getItem('floorName'),
          // data: res.ssid,
          // name:res.name,
        }
      })
    } else {
      setDevId(data.ssid)
      setDevOnOff(data.opn_SS)
      setOpenmodal(true)
      setDevData(data)
    }
  }

  const handleClose = () => {
    setDeviceModal(false)
    setOpenmodal(false)
    setText(false)
  }

  const onSwitchChange = (newValue) => {
    setDevOnOff(newValue)
    if (devId.ssid) {
      const req = {
        "ss_type": "SS_VENTILATOR_1",
        "ss_id": devId.ssid,
        "gl_command": newValue == 0 ? "TURN_OFF" : newValue == 1 ? "TURN_ON" : "AUTO",
        "param_id": "VEN_On_Off",
        "value": newValue === 1 ? "ON" : newValue === 0 ? "OFF" : "Auto",
        "zone_type": null,
        "zone_id": null,
        "commandFrom": "UI",
      }
      api.floor.cpmOnOffControl(req).then((response) => {

      })
        .catch((err) => { })
    }
  }

  const eachDevData = (element, index, type) => {
    let active = {}
    active["name"] = element.name
    if (element.ssid) {
      active["ssid"] = element.ssid
    }
    let error_Alarm = (type == 'Ventilator' ? 'VEN_Error_Alarm' : 'FAU_Fan_Alarm')
    if (element['controlable'][error_Alarm]) {
      // active["error_Alarm"] = element['controlable'][error_Alarm]
      active["error_Alarm"] = (element['controlable'][error_Alarm] == 'inactive' ? 'Ok' : 'Not Ok')
    }
    let AM_SS = (type == 'Ventilator' ? 'VEN_AM_SS' : 'FAU_AM_SS')
    if (element['controlable'][AM_SS]) {
      active["AM_SS"] = (element['controlable'][AM_SS] == 'active' ? 'Remote' : 'Local')
    }
    let opn_SS = (type == 'Ventilator' ? 'VEN_Opn_SS' : 'FAU_Opn_SS')
    if (element['controlable'][opn_SS]) {
      active["opn_SS"] = (element['controlable'][opn_SS] == 'active' ? 1 : 0)
    }
    let zat = (type == 'Ventilator' ? 'VEN_ZAT' : 'FAU_ZAT')
    if (element['controlable'][zat]) {
      active["zat"] = element['controlable'][zat]
    }
    const formattedCoordsArray = heatMapData.addressPoints.map((value) => {
      const coordinates = getJSONElement(value, ['coordinates']);
      if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
        return [
          coordinates[0],         // Latitude
          coordinates[1],         // Longitude
          parseFloat(value.temperature) // Temperature
        ];
      } else {
        return null; // or handle the case where coordinates are missing or invalid
      }
    });
    formattedCoordsArray.forEach((formattedCoords) => {
      coords.push(formattedCoords);
    });
    return (
      <>
        <StyledTooltip title={active.name} className={classes.tooltip} arrow>
          {/* <button  onClick={() => handleDevClick(active)} onMouseEnter={() => handleButtonHover(active)} onMouseLeave={handleButtonLeave} className={classes.vavbutton} style={{ backgroundColor:(active.VAV_ZAT <= 25 && active.VAV_ZAT >= 21)?"#21ba45":(active.VAV_ZAT <= 20)?"#F6BE00":"#FF0000", color: 'white',boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" }}>{active.name}</button> */}
          <button onClick={() => handleDevClick(active, type)} onMouseLeave={handleButtonLeave} className={classes.smallbuttons} style={{
            backgroundColor: "#21ba45",
            // backgroundColor:active["error_Alarm"] =='Ok'?"#21ba45":"red",
            color: 'white', boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)", color: 'white'
          }}>{type == 'Ventilator' ? (active.name).split('-')[2] : (active.name).split('-')[1]}</button>
        </StyledTooltip>
        <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={openmodal} classes={{ paper: classes.customDialog }}>
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            {vavData.name}
          </DialogTitle>
          <DialogContent dividers>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
              <Card className={classes.paper} style={{ height: "41.5vh" }}>
                <Grid container xs={12} spacing={1} style={{ marginTop: '0.5vh', marginLeft: '0.5vh' }}>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                    <Grid container xs={12} direction="column">
                      <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} style={{ textAlign: 'left' }}><div style={{ color: 'black', fontWeight: 'bold', fontSize: '3vh', whiteSpace: 'nowrap' }}></div></Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                    <Grid container xs={12} >
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
                        <div className={classes.switchselector} style={{ height: '4vh', marginTop: '0.5vh', width: '22vh' }}>
                          <SwitchSelector
                            style={{ borderRadius: "12px" }}
                            onChange={onSwitchChange}
                            options={options}
                            forcedSelectedIndex={devOnOff}
                            // border="1px solid #0123B4"
                            backgroundColor={"#e9e5e5"}
                            fontColor={"rgba(0, 0, 0, 0.87)"}
                            // wrapperBorderRadius={true}
                            optionBorderRadius={5}
                            wrapperBorderRadius={5} />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                    <Grid container xs={12} >
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                        <Card style={{ width: '94%', height: '100%' }}>
                          <Grid container xs={12} style={{ height: '100%' }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.status}>
                              <div></div>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container xs={12} spacing={1} style={{ marginTop: '1.5vh', marginLeft: '0.5vh' }}>
                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                    <Card className={classes.paper1} style={{ display: 'flex', height: '30vh' }}>
                      <Grid container xs={12} spacing={1} direction="column">
                        <Grid container item xs={12} justify="center" alignItems="center">
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                            <img src={fanimg} style={{ width: '35px', marginTop: '3vh' }} />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid item xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                    <Grid container xs={12} spacing={1} >
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
                                <div className={classes.cardbody}>
                                  {vavData["AM_SS"]}
                                </div>
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
                                Temperature Set Point
                              </Grid>
                            </Grid>

                            <Grid container item xs={12}>
                              <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                                <TextField style={{ marginLeft: '3vh' }}
                                  placeholder={formatter.format(vavData["zat"]) + "℃"}
                                  name="Sat_set_point"
                                  autoComplete="off"
                                  className={classes.text_field}
                                />
                              </Grid>
                              <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                                <Paper className={classes.set_button}
                                  style={{ backgroundColor: blueColor[0], display: 'flex', justifyContent: 'center', cursor: 'pointer', marginTop: '1.5vh', marginLeft: '1vh' }}>
                                  <div style={{ color: 'white' }}>set</div>
                                </Paper>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                    <Grid container xs={12} spacing={1} >
                      <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                        <Card className={classes.paper1}>
                          <Grid container xs={12} spacing={1}>
                            <Grid container item xs={12}>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                                Status
                              </Grid>
                            </Grid>

                            <Grid container item xs={12}>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <div className={classes.cardbody}>
                                  {vavData["error_Alarm"]}
                                </div>
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
                                Temperature
                              </Grid>
                            </Grid>

                            <Grid container item xs={12}>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <div className={classes.cardbody}>
                                  {formatter.format(vavData["zat"]) + '℃'}
                                </div>
                              </Grid>
                            </Grid>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          </DialogContent>
        </Dialog>
      </>
    )

  }

  const numEmptyCardsFau = 18 - fauAlerts.length; // Adjust the total number as needed
  const emptyCardsFau = Array.from({ length: numEmptyCardsFau }, (_, index) => (
    <button className={classes.smallbuttons}></button>
  ));
  const numEmptyCardsVent = 18 - ventilatorAlerts.length; // Adjust the total number as needed
  const emptyCardsVent = Array.from({ length: numEmptyCardsVent }, (_, index) => (
    <button className={classes.smallbuttons}></button>
  ));
  const numEmptyCardsExhaustFan = 18 - exhaustFansAlerts.length; // Adjust the total number as needed
  const emptyCardsExhaustFan = Array.from({ length: numEmptyCardsExhaustFan }, (_, index) => (
    <button className={classes.smallbuttons}></button>
  ));

  const eachDeviceCard = (cardHeight, devType, devList, alarmParam, emptyCards) => {
    return (
      <Grid container item xs={12} spacing={1}>
        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
          <Card className={classes.imagecard} style={{ height: cardHeight, overflow: devList.length > 18 ? "auto" : "" }}>
            <div className={classes.CardHeadFont} style={{ marginTop: window.innerHeight == '1280' ? "1vh" : '-1vh', fontWeight: 'bold', color: 'black' }}>{devType}</div>
            <Grid container direction="row">
              {devList.map((element, index) =>
                <StyledTooltip title={element.name} className={classes.tooltip} arrow>
                  <button className={classes.smallbuttons} style={{ backgroundColor: element.alerts_cri > 0 ? redColor[0] : element.alerts_solu > 0 ? yellowColor[0] : element["controlable"].alarmParam == 'active' ? greenColor[0] : "grey", color: 'white' }} onClick={() => onClickEachDevice(devType, element)}>{index + 1}</button>
                </StyledTooltip>
              )}
              {emptyCards}
            </Grid>
          </Card>
        </Grid>
      </Grid>
    )

  }

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
        <Grid item xs={12} sm={12} md={9} lg={9} xl={9} xxl={9}>
          <LandingPage
            processDataFromJson={false}
            device={heatMapData.mapSubType == "ahu" ? eachAhuData : eachCsuData}
            totalAlarms={allFloorsAlarms}
            criticalAlerts={criticalAlarms}
            soluAlerts={nonCriticalAlarms}
            type={heatMapData.mapSubType == "ahu" ? "AHU" : "CSU"}
          />
          <Grid container spacing={1} style={{ marginTop: "1vh" }}>
            <Grid container item xs={12} spacing={1}>
              {/* <Grid item xs={12} sm={12} md={2} lg={2} xl={2} xxl={2}>
                {(fauAlerts.length > 0 && ventilatorAlerts.length > 0 && exhaustFansAlerts.length > 0) ?
                  <>
                    {eachDeviceCard('15.3vh', 'FAU', fauAlerts, 'FAU_On_Off', emptyCardsFau)}
                    {eachDeviceCard('15.3vh', 'Ventilator', ventilatorAlerts, 'VEN_On_Off', emptyCardsVent)}
                    {eachDeviceCard('15.3vh', 'Exhaust Fan', exhaustFansAlerts, 'SubE_Fan_On_Off', emptyCardsExhaustFan)}
                  </>
                  : (fauAlerts.length > 0 && ventilatorAlerts.length > 0) ?
                    <>
                      {eachDeviceCard('30.17vh', 'FAU', fauAlerts, 'FAU_On_Off', emptyCardsFau)}
                      {eachDeviceCard('30.17vh', 'Ventilator', ventilatorAlerts, 'VEN_On_Off', emptyCardsVent)}
                    </>
                    :
                    (ventilatorAlerts.length > 0 && exhaustFansAlerts.length > 0) ?
                      <>
                        {eachDeviceCard('30.17vh', 'Ventilator', ventilatorAlerts, 'VEN_On_Off', emptyCardsVent)}
                        {eachDeviceCard('30.17vh', 'Exhaust Fan', exhaustFansAlerts, 'SubE_Fan_On_Off', emptyCardsExhaustFan)}
                      </> : (fauAlerts.length > 0 && exhaustFansAlerts.length > 0) ?
                        <>
                          {eachDeviceCard('30.17vh', 'FAU', fauAlerts, 'FAU_On_Off', emptyCardsFau)}
                          {eachDeviceCard('30.17vh', 'Exhaust Fan', exhaustFansAlerts, 'SubE_Fan_On_Off', emptyCardsExhaustFan)}
                        </> : (fauAlerts.length > 0) ?
                          <>
                            {eachDeviceCard('61vh', 'FAU', fauAlerts, 'FAU_On_Off', emptyCardsFau)}
                          </> : (ventilatorAlerts.length > 0) ?
                            <>
                              {eachDeviceCard('61vh', 'Ventilator', ventilatorAlerts, 'VEN_On_Off', emptyCardsVent)}
                            </> : (exhaustFansAlerts.length > 0) ?
                              <>
                                {eachDeviceCard('61vh', 'Exhaust Fan', exhaustFansAlerts, 'SubE_Fan_On_Off', emptyCardsExhaustFan)}
                              </> :
                              <></>

                }
              </Grid> */}
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                {/* heatmap */}
                <Card className={classes.imagecard}>
                  <Spin
                    spinning={loading}
                    size="default"
                    style={{
                      justifyContent: "center",
                      alignContent: "center",
                      position: "fixed",
                    }}
                  >
                    <Map
                      ref={mapRef}
                      doubleClickZoom={false}
                      zoomControl={false}
                      dragging={true}
                      scrollWheelZoom={false}
                      crs={Leaflet.CRS.Simple}
                      // center={[0, 0]}
                      // center={[0, -100.66667]}
                      center={[0, 0]}
                      attributionControl={false}
                      // bounds={[[0, 0], [600, 730]]}

                      // bounds={[[100, -450], [200, 400]]}
                      bounds={[
                        [0, -10],
                        [500, 750],
                      ]}
                      maxZoom={2}
                      className={"floor-map"}
                      style={{ backgroundColor: "white" }}
                      onClick={(e) => {
                        console.log({ x: e.latlng.lat, y: e.latlng.lng });
                      }}
                    >
                      <ImageOverlay
                        interactive
                        // url={'https://localhost/' + localStorage.floorName + '.jpg'}
                        url={image}
                        // bounds={[[50, 15], [600, 730]]}
                        // bounds={[[100, -8], [525, 640]]}
                        // bounds={[[0, -550], [380, 550]]}
                        bounds={[
                          [100, -5],
                          [410, 740],
                        ]}
                      />
                      {hoveredButton !== null && (
                        <Polygon
                          positions={hoveredButton?.coordinates || []}
                          fillOpacity={0.9}
                          color={
                            hoveredButton !== null
                              ? getColor(hoveredButton?.VAV_ZAT)
                              : "defaultColor"
                          }
                          fillColor={
                            hoveredButton !== null
                              ? getColor(hoveredButton?.VAV_ZAT)
                              : "defaultColor"
                          }
                        >
                          {/* <Tooltip className={classes.transparentTooltip}  
                                        opacity={1}>
                                          {`Polygon ${hoveredButton}`}
                                          <br />
                                          {`Temperature: ${buttonToPolygonInfo[hoveredButton]?.temperature}`}
                                        </Tooltip>           */}
                        </Polygon>
                      )}
                      {/* {console.log("newvalue",newvalue)} */}
                      {heatMapData.mapSubType !== "aqi" &&
                      heatMapData.addressPoints
                        ? heatMapData.addressPoints.map((value1, index) =>
                            newvalue === "THL" ? (
                              <DevicemapTHL
                                key={index}
                                data={heatMapData.addressPoints}
                                value={newvalue}
                                data1={coords}
                                iconDevice={iconDevice}
                              />
                            ) : newvalue === "ahu" ||
                              newvalue === "humidity" ? (
                              <React.Fragment key={index}>
                                {value1.zone_coordinates &&
                                Array.isArray(value1.zone_coordinates) ? (
                                  <Polygon
                                    key={index}
                                    positions={value1.zone_coordinates}
                                    color={getFillColor(value1.controlable.RAT)}
                                    fillColor={getFillColor(
                                      value1.controlable.RAT
                                    )}
                                    fillOpacity={0.1}
                                  />
                                ) : null}
                                {value1.coordinates &&
                                Array.isArray(value1.coordinates) &&
                                value1.coordinates.length >= 2 ? (
                                  // <Circle
                                  //   center={[value1.coordinates[0], value1.coordinates[1]]}
                                  //   radius={5}
                                  //   fillColor={getFillColor(value1.controlable.RAT)}
                                  //   fillOpacity={0.7}
                                  //   color={getFillColor(value1.controlable.RAT)}
                                  // >

                                  <Marker
                                    position={[
                                      value1.coordinates[0],
                                      value1.coordinates[1],
                                    ]}
                                    // icon={L.icon({
                                    //   iconUrl: value1.controlable.RAT >= 0 && value1.controlable.RAT <= 22
                                    //   ? engine
                                    //   : value1.controlable.RAT >= 23 && value1.controlable.RAT <= 32
                                    //   ? enginegreen
                                    //   : enginered,
                                    //   iconSize: [30, 30],
                                    //   iconAnchor: [16, 32],
                                    //   popupAnchor: [0, -32]
                                    // })}
                                    icon={L.icon({
                                      iconUrl:
                                        value1.controlable
                                          .SAF_VFD_On_Off_Fbk === "active"
                                          ? enginegreen
                                          : value1.controlable.RAT >= 32
                                          ? enginered
                                          : enginegrey,
                                      iconSize: [30, 30],
                                      iconAnchor: [16, 32],
                                      popupAnchor: [0, -32],
                                    })}
                                  >
                                    <Tooltip
                                      className={classes.transparentTooltip1}
                                      opacity={1}
                                    >
                                      {Object.keys(value1).map((key) =>
                                        key !== "ssid" &&
                                        key !== "coordinates" &&
                                        key !== "zoneId" &&
                                        key !== "zone_coordinates" &&
                                        key !== "type" &&
                                        key !== "zoneColor" &&
                                        key !== "id" ? (
                                          <React.Fragment
                                            key={key}
                                          ></React.Fragment>
                                        ) : (
                                          <p key={key}>
                                            {key === "type" &&
                                            value1.type === "NONGL_SS_AHU" ? (
                                              <>
                                                <b>{value1.name}</b>
                                                <br />
                                                <b>RAT:</b>{" "}
                                                {formatter.format(
                                                  value1.controlable.RAT
                                                )}
                                                °C
                                                <br />
                                                <b>AHU STATUS:</b>{" "}
                                                {value1.controlable
                                                  .SAF_VFD_On_Off_Fbk ==
                                                "active"
                                                  ? "On"
                                                  : "Off"}
                                              </>
                                            ) : (
                                              <>
                                                {key === "name" ? (
                                                  <>{value1[key]}</>
                                                ) : key === "Temperature" ? (
                                                  <>
                                                    {key}:
                                                    {formatter.format(
                                                      value1[key]
                                                    )}
                                                    °C
                                                  </>
                                                ) : (
                                                  <></>
                                                )}
                                              </>
                                            )}
                                          </p>
                                        )
                                      )}
                                    </Tooltip>
                                  </Marker>
                                ) : // </Circle>
                                null}
                              </React.Fragment>
                            ) : newvalue === "csu" ? (
                              <React.Fragment key={index}>
                                {/* {value1.zone_coordinates && Array.isArray(value1.zone_coordinates) ? (
                            <Polygon
                              key={index}
                              positions={value1.zone_coordinates}
                              color={getFillColor(value1.controlable.RAT)}
                              fillColor={getFillColor(value1.controlable.RAT)}
                              fillOpacity={0.1}
                            />
                          ) : null} */}
                                {value1.coordinates &&
                                Array.isArray(value1.coordinates) &&
                                value1.coordinates.length >= 2 ? (
                                  <Marker
                                    position={[
                                      value1.coordinates[0],
                                      value1.coordinates[1],
                                    ]}
                                    icon={L.icon({
                                      iconUrl: CSU,
                                      iconSize: [30, 30],
                                      iconAnchor: [16, 32],
                                      popupAnchor: [0, -32],
                                    })}
                                  >
                                    <Tooltip
                                      className={classes.transparentTooltip1}
                                      opacity={1}
                                    >
                                      {Object.keys(value1).map((key) =>
                                        key !== "ssid" &&
                                        key !== "coordinates" &&
                                        key !== "zoneId" &&
                                        key !== "zone_coordinates" &&
                                        key !== "type" &&
                                        key !== "zoneColor" &&
                                        key !== "id" ? (
                                          <React.Fragment
                                            key={key}
                                          ></React.Fragment>
                                        ) : (
                                          <p key={key}>
                                            {key === "type" &&
                                            value1.type === "NONGL_SS_CSU" ? (
                                              <>
                                                <b>{value1.name}</b>
                                                <br />
                                                <b>CSU RAT:</b>{" "}
                                                {formatter.format(
                                                  value1.controlable.CSU_RAT
                                                )}
                                                °C
                                                <br />
                                                <b>CSU VFD STATUS:</b>{" "}
                                                {value1.controlable
                                                  .CSU_VFD_Fbk == "inactive"
                                                  ? "off"
                                                  : "On"}
                                              </>
                                            ) : (
                                              <>
                                                {key === "name" ? (
                                                  <>{value1[key]}</>
                                                ) : key === "Temperature" ? (
                                                  <>
                                                    {key}:
                                                    {formatter.format(
                                                      value1[key]
                                                    )}
                                                    °C
                                                  </>
                                                ) : (
                                                  <></>
                                                )}
                                              </>
                                            )}
                                          </p>
                                        )
                                      )}
                                    </Tooltip>
                                  </Marker>
                                ) : // </Circle>
                                null}
                              </React.Fragment>
                            ) : null
                          )
                        : null}

                      <ZoomControl position="topright" />
                    </Map>
                  </Spin>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* right side(graphs) */}
        <Grid
          item
          xs={12}
          sm={12}
          md={3}
          lg={3}
          xl={3}
          xxl={3}
          style={{ marginTop: "1.5vh" }}
        >
          {deviceTrendData.map((trend) =>
            Object.keys(trend).map((key) => (
              <>
                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Card className={classes.graphpaper}>
                      {console.log(
                        "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                        props.history
                      )}
                      {props.history?.location?.state?.param && (
                        <DevicetrendChart
                          data={trend[key]}
                          param={key}
                          changeContext={props.changeContext}
                          history={props.data.history}
                          eqp={props.history.location.state.param}
                        />
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </>
            ))
          )}
        </Grid>
      </Grid>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={deviceModal}
        classes={{ paper: classes.customDialogPump }}
      >
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          {deviceType}
        </DialogTitle>
        <DialogContent dividers>
          <PumpPage
            type={deviceType}
            data={deviceData}
            click="eachPump"
            pageType="BMS"
          />
        </DialogContent>
      </Dialog>
      <SemanticToastContainer position="top-center" />
      {loading === true ? (
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <div></div>
      )}
    </div>
  );

}

export default withRouter(Devicemap)
