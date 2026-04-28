import React, {useRef, useEffect, useState } from 'react'
import api from '../../api'
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Typography, Card, ButtonBase, Divider } from '@material-ui/core';
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl, Rectangle, Circle,Polygon} from 'react-leaflet';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import DevicetrendChart from 'views/DevicetrendChart';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";
import { useSelector } from 'react-redux';
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import Success from 'components/Typography/Success';
import FloorTempIcon from 'assets/img/FloorTempIcon';
import FloorHumIcon from 'assets/img/FloorHumIcon';
import AirQualityIcon from 'assets/img/AirQualityIcon';
import { message, Spin } from 'antd';
import ControlWhite from 'assets/img/ControlWhite';
import Control from 'assets/img/Control';
import Modal from '@material-ui/core/Modal';
import { SemanticToastContainer } from 'react-semantic-toasts';
import '../../assets/css/leaflet.sass';
import CardBody from "components/Card/CardBody";
import GridItem from "components/Grid/GridItem";
import CardContent from '@material-ui/core/CardContent';
import ReactSimpleRange from "react-simple-range";
import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import NotificationLow from "assets/img/Notification";
import SwitchSelector from "react-switch-selector";
import Box from '@material-ui/core/Box';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import FloorTempIconWhite from 'assets/img/FloorTempIconWhite';
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import floor2 from '../../assets/Images/Floor-1.png';
// import Button from "../../components/CustomButtons/Button";
import GridContainer from 'components/Grid/GridContainer';
// import HeatmapData from 'views/HeatmapData';
// import Dialog from "@mui/material/Dialog";
// import DialogContent from "@mui/material/DialogContent";
// import IconButton from "@mui/material/IconButton";
// import CloseIcon from "@mui/icons-material/Close";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Tooltip1 from '@material-ui/core/Tooltip';
import DevicemapTHL from '../Heatmap/DevicemapTHL';

const Leaflet = require('leaflet');

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize:"12px"
  }
})(Tooltip1);

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: '2%'
  },customDialog: {
    cursor:"pointer",
    // Set the desired width for the dialog
    width: '360px', // Adjust this value as needed
  },
  alerts: {
    width: '8%',
    height: '7%',
    borderRadius: '3%'
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh', // Adjust as needed
    width: '100vw', // Adjust as needed
    position: 'fixed',
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
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
    margin:"0"
    },
    transparentTooltip1: {
      border: "0.5px solid black",
      borderRadius: "10px",
      boxShadow: "none",
      // fontSize: "14px",
      // fontWeight: "bold",
      margin:"0"
      },
  ahucard: {
    width: '24%',
    height: '10vh',
    borderRadius: '1vh',
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 
  },
  errorcard: {
    width: '73%',
    height: '10vh',
    marginLeft: '2%',
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 

  },
  verticleLine: {
    height: '100%',
    width: 1, 
    backgroundColor: '#909090' 
  },
  datacards: {
    width: '100%',
    height: '8.5vh',
    margin: '4%',
    borderRadius: '0.8vw',
    boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)"
  },
  emptycards: {
    width: '100%',
    height: '8.5vh',
    margin: '4%',
    borderRadius: '0.8vw',
    // boxShadow: "inset 0px 0px 0px 2px rgb(179 184 179)"
  },
  vavcard: {
    width: '14%',
    height: '46vh',
    // boxShadow: 'inset 0 4px 20px rgba(0, 0, 0, .1)',
    backgroundColor: '#ffffff',
    margin: '1%',
    borderRadius: '2vh',
    marginLeft:"0vh",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 

  },
  vertical: {
    borderLeft:'1px solid lightgrey',
    height: "4em",
    marginLeft: "-7%",
    fontColor:'blue',
    marginTop:'-10vh'
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
  selector: {
    width: '14%',
    height: '21vh',
    marginTop: '-19%',
    borderRadius: '0.8vw',
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 

  },
  selctioncards: {
    margin: '4%'
  },
  mapcard: {
    width: '83%',
    height: '67vh',
    margin: '1%',
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 

  },
  graphcard: {
    width: '97%',
    height: '25vh',
    margin: '2%',
    borderRadius: '0.8vw',
    marginLeft:"2vh",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" 
  },
  danger: {
    fontWeight: 'bold',
    fontSize: '3.1vh'
  }, 
  paper: {
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow:'0px 8px 40px #0123B433;',
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
     borderRadius: '12px',
     opacity:'1'
  },
  paper1: {
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow:'0px 0px 10px #0123B421',
    opacity:'1',
    borderRadius:'12px',
    height:'15vh',
    // display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeading:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    whiteSpace:"nowrap",
    color:"#000000",
    marginTop:'1vh',
    font:'normal normal medium 17px/60px Bw Seido Round',
    opacity:'1',
    fontWeight:'bold'
  },
  semicircleBar:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    marginTop:'-0.8vh'
  },
  cardbody:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    fontSize:"4vh",
    fontWeight:'bold',
    opacity:'1',
    color:'#0123B4'
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor:"#0123b4",borderRadius:"8px"
    },
    "& .MuiSelect-root ": {
      marginTop:"-2vh"
    }
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
    height:"43vh",
    width:"69vh"
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
  const tooltipRefs = useRef([]);
  const [heatMapData, setHeatMapdata] = React.useState({
    rectData: [],
    addressPoints: [],
    mapSubType: props.param ? props.param.toLocaleLowerCase() : "ahu"
  });

  const colorScale = (value,bounds) => {
    // console.log("value",value)
    // console.log("bounds",bounds)
    if (value > 28) {
      return "red";
    } else if (value > 23 && value < 27) {
      return "green";
    } else {
      return "blue";
    }
  };

  const getColor = (temperature) => {
    if (temperature >= 0 && temperature <= 20) {
      return '#F6BE00'; // Yellow
    } else if (temperature >= 21 && temperature <= 25) {
      return '#21ba45'; // Green
    } else if (temperature > 25 && temperature <= 35) {
      return '#fc6434'; // Red
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
      return 'red';
    } else if (RAT >= 23 && RAT <= 32) {
      return 'green';
    } else {
      return 'blue';
    }
  };


  const alerts = useSelector(state => state.alarm.alarmData)
  const [criticalAlertsAhu, setcriticalAlertsAhu] = React.useState(0);
  const [soluAlertsAhu, setsoluAlertsAhu] = React.useState(0);
  const [eachAhuData, setEachAhuDAta] = React.useState([])
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

  const [deviceTrendData, setDeviceTrend] = React.useState([])
  const [openmodal, setOpenmodal] = React.useState(false)
  const [modalStyle] = React.useState(getModalStyle);
  const [setpt, setSetpt] = React.useState("");
  const [text, setText] = React.useState(false);
  const [openerr,setOpenerr] = React.useState(false);
  const [errmsg,setErrmsg] = React.useState('');
  const [show, setShow] = React.useState(true);
  const [vavData, setVavData] = useState({});
  const [loading, setLoading] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const coords= [];

  let MAX_AIR_FLOW=1350;
  let MIN_AIR_FLOW=0;
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [vavdevice, setVavdevice] = useState([]);
  const rectangleBounds = [[234.49, -0.08], [234.5, -0.06]];
  const options1 = [
    {
      label: "Auto",
      value: "auto",
      selectedBackgroundColor: "green",
      fontSize:"12"
    },
    {
      label: "Manual",
      value: "manual",
      selectedBackgroundColor: "green",
      fontSize:"12"

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
  
  useEffect(() => {
    localStorage.removeItem("type")
    let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType === '' ? 'ahu' : heatMapData.mapSubType
    switch (type) {
      case "ahu": setAhuOpen(true)
        // setIconDevice(iconDevice3)
        break;
      default: break;
    }
    let f_id = localStorage.getItem('floorID')
    console.log("f_id",f_id)
    console.log("type.toLocaleUpperCase()",type.toLocaleUpperCase())
    api.floor.devicemap(f_id, type.toLocaleUpperCase()).then((res) => {
      console.log("resssssssssssssssss",res)
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      if (res.length !== 0) {
        let sdevices = []
        let CriticalTotal = 0
        let solutionTotal = 0
        if (alerts.system.length === 0 && alerts.solution.length === 0) {
          let con = 0
          res.map(element => {
            let obj = {}
            con++
            obj["name"] = element.name
            obj["ssid"] = element.ssid
            obj["type"] = element.type
            obj["alerts_cri"] = 0
            obj["alerts_solu"] = 0
            sdevices.push(obj)
            if (res.length === con) {
              setEachAhuDAta(sdevices)
            }
            return element
          })
        }


        if (alerts.system.length > 0 && alerts.solution.length > 0) {
          res.map(element => {
            let obj = {}
            obj["name"] = element.name
            obj["ssid"] = element.ssid
            obj["type"] = element.type
            let count = 0
            let ci = 0
            alerts.system.map(ele => {
              if (element.name === ele.device_name) {
                count++
                ci++
                CriticalTotal++
                if (alerts.system.length === count) {
                  obj["alerts_cri"] = ci
                  setcriticalAlertsAhu(CriticalTotal)
                  let si = 0
                  let counts = 0
                  alerts.solution.map(ele1 => {
                    if (element.name === ele1.device_name) {
                      counts++
                      si++
                      solutionTotal++
                      if (alerts.solution.length === counts) {
                        obj["alerts_solu"] = si
                        sdevices.push(obj)
                        setEachAhuDAta(sdevices)
                        setsoluAlertsAhu(solutionTotal)
                      }
                    } else {
                      counts++
                      if (alerts.solution.length === counts) {
                        obj["alerts_solu"] = si
                        sdevices.push(obj)
                        setEachAhuDAta(sdevices)
                        setsoluAlertsAhu(solutionTotal)
                      }
                    }
                    return ele1
                  })

                }
              } else {
                count++
                if (alerts.system.length === count) {
                  obj["alerts_cri"] = ci
                  setcriticalAlertsAhu(CriticalTotal)
                  let si = 0
                  let counts = 0
                  alerts.solution.map(ele => {
                    if (element.name === ele.device_name) {
                      counts++
                      si++
                      solutionTotal++
                      if (alerts.solution.length === counts) {
                        obj["alerts_solu"] = si
                        sdevices.push(obj)
                        setEachAhuDAta(sdevices)
                        setsoluAlertsAhu(solutionTotal)
                      }
                    } else {
                      counts++
                      if (alerts.solution.length === counts) {
                        obj["alerts_solu"] = si
                        sdevices.push(obj)
                        setEachAhuDAta(sdevices)
                        setsoluAlertsAhu(solutionTotal)
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
          res.map(element => {
            let obj = {}
            obj["name"] = element.name
            obj["ssid"] = element.ssid
            obj["type"] = element.type
            let count = 0
            let ci = 0
            alerts.system.map(ele => {
              if (element.name === ele.device_name) {
                count++
                ci++
                CriticalTotal++
                if (alerts.system.length === count) {
                  obj["alerts_cri"] = ci
                  obj["alerts_solu"] = 0
                  setcriticalAlertsAhu(CriticalTotal)
                  sdevices.push(obj)
                  setEachAhuDAta(sdevices)
                }
              } else {
                count++
                if (alerts.system.length === count) {
                  obj["alerts_cri"] = ci
                  obj["alerts_solu"] = 0
                  setcriticalAlertsAhu(CriticalTotal)
                  sdevices.push(obj)
                  setEachAhuDAta(sdevices)
                }
              }
              return ele
            })
            return element
          })


        }
        if (alerts.system.length === 0 && alerts.solution.length > 0) {
          res.map(element => {
            let obj = {}
            obj["name"] = element.name
            obj["ssid"] = element.ssid
            obj["type"] = element.type
            let count = 0
            let ci = 0
            alerts.solution.map(ele => {
              if (element.name === ele.device_name) {
                count++
                ci++
                solutionTotal++
                if (alerts.solution.length === count) {
                  obj["alerts_solu"] = ci
                  obj["alerts_cri"] = 0
                  sdevices.push(obj)
                  setsoluAlertsAhu(solutionTotal)
                  setEachAhuDAta(sdevices)
                }
              } else {
                count++
                if (alerts.solution.length === count) {
                  obj["alerts_solu"] = ci
                  obj["alerts_cri"] = 0
                  sdevices.push(obj)
                  setsoluAlertsAhu(solutionTotal)
                  setEachAhuDAta(sdevices)
                }
              }
              return ele
            })
            return element
          })
        }
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
        setEachAhuDAta([]);
      }
    }).catch((error)=>{
        setOpenerr(true)
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('')
          }
        // setErrmsg(error.response.data.message)
    })
    api.dashboard.getMetricData(buildingID).then(res => {
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('')
        }
      // setErrmsg(error.response.data.message)
    })
    const trendData = [{
      // 'ahu_chill_water_temperature':[],
      //'ahu_chilled_valve': [],
      'ChW Valve': [],
    // 'CHW_Vlv_Pos' : [],
      'RAT': [],
      'SAT': []
      // 'ahu_filter_status':[],
      // 'ahu_in_air_temperature':[],
      // 'ahu_on_off':[],
      // 'ahu_run_status':[],
      // 'ahu_set_point':[],
      //'ahu_supply_air_temperature': [],
      // 'ahu_trip_status':[],
      // 'ahu_vfd_mode':[],
      // 'fan_motor_speed':[],
      // 'mode':[],
      //'supply_air_flow': []
    }]
    // api.floor.ae(props.data.location.state.data).then(res => {
    api.floor.ae(localStorage.getItem('floorID')).then(res => {
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      if (res.length !== 0) {
        for (let keysss in trendData[0]) {
          res.forEach(obj => {
            for (let da in obj) {
              if (da === keysss) {
                trendData[0][keysss].push(obj[da])
              }
            }
          })
        }
        // console.log("trendData",trendData)
        setDeviceTrend(trendData)
      } else {
        setDeviceTrend([]);
      }
    }).catch((error)=>{
      setOpenerr(true)
      // setErrmsg(error)
      // setErrmsg(error.response.data.message)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('')
        }
    })
    //eslint-disable-next-line
    api.floor
    .devicemap(f_id, "VAV")
    .then((res) => {
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
     console.log("vaaaaaav",res)
      setVavdevice(res);
    }).catch((error)=>{
     console.log(error)
    })
  }, [localStorage.getItem('floorName')]);


  const handleDeviceClick = (value) => {}
  // const handleClose1 = () => {
  //   setOpen(false);
  // };
  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg('');
  };
  
  const onChangetype = newValue => {
    setNewValue(newValue)
    // console.log("new value",newValue)
    let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
    // console.log("typppppppppppppppppppppppppeeeeeeeeeeeee",type)
    switch (newValue) {
      case "ahu":
        setAhuOpen(true)
        setTempOpen(false)
        setHumOpen(false)
        setLuxOpen(false)
        // setIconDevice(iconDevice3)
        break
      case "aqi":
        setLuxOpen(true)
        setAhuOpen(false)
        setTempOpen(false)
        setHumOpen(false)
        // setIconDevice(iconDevice1)
        break
      case "THL":
        setTempOpen(true)
        setLuxOpen(false)
        setAhuOpen(false)
        setHumOpen(false)
        setIconDevice(iconDevice1)
        break
      case "humidity":
        setHumOpen(true)
        setTempOpen(false)
        setLuxOpen(false)
        setAhuOpen(false)
        // setIconDevice(iconDevice1)
        break
      default: break;
    }

    if(newValue === 'ahu') {
      setLoading(true)
      const apiRequest = api.floor.devicemap(props.data.location.state.data, newValue.toLocaleUpperCase());
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: The API response took too long.'));
        }, 3000);
      });
      
      Promise.race([apiRequest, timeoutPromise])
        .then((res) => {
          let zoneData = []
          setAhuOpen(true)
          setHeatMapdata({
            ...heatMapData,
            rectData: zoneData,
            addressPoints: res,
            mapSubType: "ahu"
          });
        })
        .catch((error) => {
          setOpenerr(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }else{
      setLoading(true)
      const apiRequest =  api.floor.heatmap(props.data.location.state.data, newValue.toLocaleUpperCase())
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: The API response took too long.'));
        }, 3000);
      });
      
      Promise.race([apiRequest, timeoutPromise])
        .then((res) => {
          let zoneData = [], devData = [];
          let obj = {}, deviceObj = {};
          setHeatMapdata({
            ...heatMapData,
            rectData: zoneData,
            addressPoints: res,
            mapSubType: newValue
          });
        })
        .catch((error) => {
          setOpenerr(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  const onClickIssue = (id, name, param) => {
    console.log('issuuuee',id,name,param)
    localStorage.setItem("deviceID", id);
    localStorage.setItem("deviceName", name);
    props.data.history.push({
      pathname: `/admin/glAhu`,
      state: {
        data: id,
        name: name
      }
    })
  }
  const handlevavclick = (data) => {
    setOpenmodal(true)
    setVavData(data)
  }

  
  const handleClose = () => {
    setOpenmodal(false)
    setText(false)
  }
  const onChange = (newValue) => {
  };
  // const handleClose1 = () => {
  //   setOpen(false);
  // };
  

  const eachVavData = (element, index) => {
          let active = {}
          active["name"] = element.name
          if(element.ssid){
            active["ssid"] = element.ssid
          }
          if(element.VAV_ZAT_SP){
            active["VAV_ZAT_SP"] = Math.round(element.VAV_ZAT_SP)
          }
          if(element.VAV_Dmpr_Pos){
            active["VAV_Dmpr_Pos"] = Math.round(element.VAV_Dmpr_Pos)
          }
          if(element.VAV_ZAT){
            active["VAV_ZAT"] = Math.round(element.VAV_ZAT)
          }
          if(element.VAV_CFM_Actual){
            active["VAV_CFM_Actual"] = Math.round(element.VAV_CFM_Actual)
          }
          if(element.coordinates){
            active["coordinates"] = element.coordinates
          }
          if(element.VAV_CFM_Design){
            active["VAV_CFM_Design"] = Math.round(element.VAV_CFM_Design)
          }
          if(element.ss_tag){
            active["ss_tag"] = element.ss_tag
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
        return(
          <>
          <StyledTooltip title={active.ss_tag} className={classes.tooltip} arrow>
          {/* <button  onClick={() => handlevavclick(active)} onMouseEnter={() => handleButtonHover(active)} onMouseLeave={handleButtonLeave} className={classes.vavbutton} style={{ backgroundColor:(active.VAV_ZAT <= 25 && active.VAV_ZAT >= 21)?"#21ba45":(active.VAV_ZAT <= 20)?"#F6BE00":"#FF0000", color: 'white',boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" }}>{active.name}</button> */}
          <button  onClick={() => handlevavclick(active)} onMouseLeave={handleButtonLeave} className={classes.vavbutton} style={{ backgroundColor:(active.VAV_ZAT <= 25 && active.VAV_ZAT >= 21)?"#21ba45":(active.VAV_ZAT <= 20)?"#F6BE00":"#FF0000", color: 'white',boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)" }}>{active.name}</button>
          </StyledTooltip>
          <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title"  open={openmodal} classes={{ paper: classes.customDialog }}>
              <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              {vavData.ss_tag}
              </DialogTitle>
              <DialogContent dividers>
              <Card className={classes.paper} style={{height:"35vh"}}>
              <Grid container xs={12} spacing={1} style={{marginTop:'0.5vh'}}>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                      <Card className={classes.paper1}>
                            <Grid container xs={12} spacing={1}>                      
                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                                        Temperature Set Point                        
                                        </Grid>
                                  </Grid>

                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{display:'flex',justifyContent:'center',alignContent:'center',whiteSpace:"nowrap",fontSize:"4vh",color:"#0123B4",fontWeight:"bold"}}>
                                        {vavData.VAV_ZAT_SP}°C                      
                                        </Grid>
                                  </Grid>

                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{display:'flex',justifyContent:'center',alignContent:'center'}}>
                                          <div style={{width:'100px'}}>
                                                        <ReactSimpleRange
                                                        min={0}
                                                        max={100}
                                                        step={1}
                                                        defaultValue={vavData.VAV_ZAT_SP}
                                                        trackColor='#0123B4'
                                                        thumbColor="#0123B4"
                                                        label={true}
                                                        eventWrapperPadding={8}/>
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
                                        Damper Position                        
                                        </Grid>
                                  </Grid>
                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                          <div className={classes.semicircleBar}>
                                            <SemiCircleProgressBar strokeWidth={20} stroke="#0123B4" diameter={100} orientation="up" percentage={vavData.VAV_Dmpr_Pos} showPercentValue />
                                          </div>
                                        </Grid>
                                  </Grid>
                            </Grid>
                      </Card>
                </Grid>
                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                      <Card className={classes.paper1} style={{backgroundColor:vavData.VAV_ZAT <= 25?"#C1EECD":"#fed0c1",color:vavData.VAV_ZAT <= 25?"#34C759":"#fc6434"}}>
                            <Grid container xs={12} spacing={1}>                      
                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.cardHeading}>
                                        Zone Temperature                      
                                        </Grid>
                                  </Grid>
                                  <Grid container item xs={12}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{whiteSpace:"nowrap"}}>
                                          <div className={classes.cardbody} style={{color:active.VAV_ZAT <= 25?"#34C759":"#fc6434"}}>
                                          {vavData.VAV_ZAT}°C  
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
                                        Air flow CFM                   
                                        </Grid>
                                  </Grid>
                                  <Grid container item xs={12}>
                                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                        <StyledTooltip title={vavData.VAV_CFM_Actual} className={classes.tooltip} arrow>
                                            <div style={{marginTop:"-1vh",display:'flex',justifyContent:'center'}}>
                                                <SemiCircleProgressBar strokeWidth={20} stroke="#0123B4" diameter={100} orientation="up" percentage={vavData.VAV_CFM_Actual/vavData.VAV_CFM_Design*100} />
                                            </div>
                                        </StyledTooltip>
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                              <Grid container item xs={12} direction="row">
                                                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'right',color:'#000000',fontWeight:'bold'}}>{MIN_AIR_FLOW}</Grid>
                                                  <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3} style={{display:'flex',justifyContent:'right',color:'#000000',fontWeight:'bold',marginLeft:'-0.5vh',marginTop:'-2.2vh'}}>{vavData.VAV_CFM_Actual == undefined ? ' ': Math.round(vavData.VAV_CFM_Actual)}</Grid>
                                                  <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'left',color:'#000000',fontWeight:'bold',marginLeft:'1vh'}}>{vavData.VAV_CFM_Design}</Grid>
                                              </Grid>
                                          </Grid>
                                </Grid>
                            </Grid>
                    </Card>
                </Grid>
        </Grid>
      </Card>
      </DialogContent>
          </Dialog>  
          </>
              )
       
      }

      const numEmptyCards = 27 - vavdevice.length; // Adjust the total number as needed
      const emptyCardsVav = Array.from({ length: numEmptyCards }, (_, index) => (
          <button className={classes.vavbutton}></button>
      ));
  return (
    <div className={classes.root}>
      <Snackbar open={openerr} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleerrorclose}>
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container xs={12} direction='row'>
        <Grid xs={9}>
          <Grid container direction="row">
            <Card className={classes.ahucard}>
            <CardBody>
                    <GridContainer>
                      <GridItem xs={5}>
                          <div className={classes.danger} style={{marginLeft:"3vh"}}>
                              <Danger>
                                {parseInt(criticalAlertsAhu) + parseInt(soluAlertsAhu)}
                              </Danger>
                          </div>
                          <Typography gutterBottom style={{ fontSize: '0.83vw', fontWeight: 'bold',whiteSpace:"nowrap",marginLeft:"-1vh" }}>
                            Total Alarms
                          </Typography>
                        </GridItem>
                           <Divider orientation="vertical" flexItem style={{height:"7vh"}}/>
                      <GridItem xs={5}>
                      <Grid container spacing={3}>
                      <Grid item xs={6}><Typography style={{alignItems: "center",
                      justifyContent: "center",
                      display: "flex",marginTop:"1vh",marginLeft:"4.5vh",fontSize: '0.8vw'}}>Critical</Typography></Grid>
                      <Grid item xs={6}><Typography style={{marginLeft:"5vh",marginTop:"1vh",color: "red", fontSize: '1.0vw', fontWeight: 'bold'}}>{parseInt(criticalAlertsAhu)}</Typography></Grid>
                      </Grid>
                      <Grid container spacing={3}>
                      <Grid item xs={6}><Typography style={{alignItems: "center",
                      justifyContent: "center",
                      display: "flex",marginTop:"-2vh",fontSize: '0.8vw',marginLeft:"3.5vh"}}>Low</Typography></Grid>
                      <Grid item xs={6}><Typography style={{color: "#ff9800", fontSize: '1.0vw',marginTop:"-2vh",marginLeft:"5vh",fontWeight: 'bold'}}>{parseInt(soluAlertsAhu)}</Typography></Grid>
                      </Grid>
                      </GridItem>
                    </GridContainer>
            </CardBody>
            </Card>
            <Card className={classes.errorcard}>
              {eachAhuData.map(Element =>
                parseInt(Element.alerts_cri) + parseInt(Element.alerts_solu) === 0 ?
                  <ButtonBase style={{ width: "14%" }} onClick={() => onClickIssue(Element.ssid, Element.name, 'THL')}>
                    <Card className={classes.datacards}>
                      <Typography style={{ justifyContent: 'center', textAlign: 'center', marginTop: '25%', fontSize: '0.83vw' }}>{Element.name}</Typography>
                      <Success style={{ justifyContent: 'center', textAlign: 'center' }}>{parseInt(Element.alerts_cri) + parseInt(Element.alerts_solu)}</Success>
                    </Card>
                  </ButtonBase>
                  : parseInt(Element.alerts_cri) + parseInt(Element.alerts_solu) === 1 ?
                    <ButtonBase style={{ width: "14%" }} onClick={() => onClickIssue(Element.ssid, Element.name, 'THL')}>
                      <Card className={classes.datacards}>
                        <Typography style={{ justifyContent: 'center', textAlign: 'center', marginTop: '25%', fontSize: '0.83vw' }}>{Element.name}</Typography>
                        <Warning style={{ justifyContent: 'center', textAlign: 'center' }}>{parseInt(Element.alerts_cri) + parseInt(Element.alerts_solu)}</Warning>
                      </Card>
                    </ButtonBase>
                    :
                    <ButtonBase style={{ width: "14%" }} onClick={() => onClickIssue(Element.ssid, Element.name, 'THL')}>
                      <Card className={classes.datacards}>
                        <Typography style={{ justifyContent: 'center', textAlign: 'center', marginTop: '25%', fontSize: '0.83vw' }}>{Element.name}</Typography>
                        <Danger style={{ justifyContent: 'center', textAlign: 'center' }}>{parseInt(Element.alerts_cri) + parseInt(Element.alerts_solu)}</Danger>
                      </Card>
                    </ButtonBase>
              )}
              <ButtonBase style={{ width: "14%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
              <ButtonBase style={{ width: "14%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
              <ButtonBase style={{ width: "14%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
              <ButtonBase style={{ width: "14%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
              <ButtonBase style={{ width: "14%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
              <ButtonBase style={{ width: "13%" }}>
                <Card className={classes.emptycards}>
                  <Typography style={{ justifyContent: 'center', textAlign: 'center' }}></Typography>
                </Card>
              </ButtonBase>
            </Card>
          </Grid>
          <Grid container direction='row'>
            <Card className={classes.vavcard}>
              <Typography style={{ textAlign: "center", fontSize: '2vh', margin: '2%',fontWeight:"bold" }}>VAV</Typography>
              <Grid container direction="row">
              {vavdevice.map((element, index) => (
                                <>        
                                {eachVavData(element, index)}</>
                    ))
                }
                {emptyCardsVav}
              </Grid>
            </Card>
            <Card className={classes.mapcard}>
            <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                  <Map
                    ref={mapRef}
                    doubleClickZoom={false}
                    zoomControl={false}
                    dragging={true}
                    scrollWheelZoom={false}
                    crs={Leaflet.CRS.Simple}
                    // center={[0, 0]}
                    center= {[50,-100.66667]}
                    attributionControl={false}
                    // bounds={[[0, 0], [600, 730]]}
                    bounds={[[0, -290], [420, 850]]}
                    maxZoom={2} 
                    className={"floor-map"}
                    style={{backgroundColor:"white"}}
                    onClick={(e) => { console.log({ x: e.latlng.lat, y: e.latlng.lng }) }}
                  >
                    <ImageOverlay
                      interactive
                      // url={'https://localhost/' + localStorage.floorName + '.jpg'}
                      url={floor2}
                      // bounds={[[50, 15], [600, 730]]}
                      // bounds={[[100, -8], [525, 640]]}
                      bounds={[[0, -290], [420, 850]]}
                    />
            {hoveredButton !== null && (
              <Polygon
                  positions={hoveredButton?.coordinates || []}
                  fillOpacity={0.9}
                  color={hoveredButton !== null ? getColor(hoveredButton?.VAV_ZAT
                    ) : 'defaultColor'}
                  fillColor={hoveredButton !== null ? getColor(hoveredButton?.VAV_ZAT) : 'defaultColor'}
                >
                {/* <Tooltip className={classes.transparentTooltip}  
                  opacity={1}>
                    {`Polygon ${hoveredButton}`}
                    <br />
                    {`Temperature: ${buttonToPolygonInfo[hoveredButton]?.temperature}`}
                  </Tooltip>           */}
                  </Polygon>
                  )}
            {heatMapData.mapSubType !== 'aqi' && heatMapData.addressPoints ? (
              heatMapData.addressPoints.map((value1, index) => (
                newvalue === 'THL' ? (
                  <DevicemapTHL key={index} data={heatMapData.addressPoints} value={newvalue} data1={coords} iconDevice={iconDevice} />
                ) : newvalue === 'ahu' || newvalue === 'humidity' ? (
                  <React.Fragment key={index}>
                    {value1.zone_coordinates && Array.isArray(value1.zone_coordinates) ? (
                      <Polygon
                        key={index}
                        positions={value1.zone_coordinates}
                        color={getFillColor(value1.RAT)}
                        fillColor={getFillColor(value1.RAT)}
                        fillOpacity={0.1}
                      />
                    ) : null}
                    {value1.coordinates && Array.isArray(value1.coordinates) && value1.coordinates.length >= 2 ? (
                      <Circle
                        center={[value1.coordinates[0], value1.coordinates[1]]}
                        radius={5}
                        fillColor={getFillColor(value1.RAT)}
                        fillOpacity={0.7}
                        color={getFillColor(value1.RAT)}
                      >
                        <Tooltip className={classes.transparentTooltip1} opacity={1}>
                          {Object.keys(value1).map((key) => (
                            key !== "ssid" &&
                            key !== "coordinates" &&
                            key !== "zoneId" &&
                            key !== "zone_coordinates" &&
                            key !== "type" &&
                            key !== "zoneColor" &&
                            key !== "id" ? (
                              <React.Fragment key={key}></React.Fragment>
                            ) : (
                              <p key={key}>
                                {key === "type" && value1.type === "NONGL_SS_AHU" ? (
                                  <>
                                    <b>{value1.name}</b>
                                    <br />
                                    <b>RAT:</b> {formatter.format(value1.RAT)}°C
                                    <br />
                                    <b>AHU STATUS:</b> {value1.AHU_On_Off}
                                  </>
                                ) : (
                                  <>
                                    {key === "name" ? (
                                      <>{value1[key]}</>
                                    ) : key === "Temperature" ? (
                                      <>
                                        {key}:{formatter.format(value1[key])}°C
                                      </>
                                    ) : (
                                      <></>
                                    )}
                                  </>
                                )}
                              </p>
                            )
                          ))}
                        </Tooltip>
                      </Circle>
                    ) : null}
                  </React.Fragment>
                ) : null
              ))
            ) : null}

                
              <ZoomControl position="bottomright" />
                  </Map>
              </Spin>
            </Card>
          </Grid>
          <Grid container direction='column' justify='space-evenly'>
            <Card className={classes.selector} style={{marginTop:"-22vh"}}>
              {AhuOpen ?
                <ButtonBase style={{ width: "100%", margin: '4%', color: "white", fontSize: '0.90vw', backgroundColor: "#5d8aa8" }} onClick={() => { onChangetype('ahu') }}>
                  <div style={{ marginRight: '9%' }}><ControlWhite /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>Controllables</Typography>
                </ButtonBase>
                :
                <ButtonBase style={{ width: "100%", margin: '4%', color: "black", fontSize: '0.90vw' }} onClick={() => { onChangetype('ahu') }}>
                  <div style={{ marginRight: '8%' }}><Control /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>Controllables</Typography>
                </ButtonBase>
              }
              {tempOpen ?
                <ButtonBase style={{ width: "100%", margin: '4%',color: "white", backgroundColor: "#5d8aa8", fontSize: '0.90vw' }} onClick={() => { onChangetype('THL') }} >
                  <div style={{ marginRight: '9%' }}><FloorTempIconWhite /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>Temperature</Typography>
                </ButtonBase>
                :
                <ButtonBase style={{ width: "100%", margin: '4%', fontSize: '0.90vw',marginLeft:"0.5vh" }} onClick={() => { onChangetype('THL') }}>
                  <div style={{ marginRight: '9%' }}><FloorTempIcon /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>Temperature</Typography>
                </ButtonBase>
              }
              {humOpen ?
                <ButtonBase style={{ width: "100%", margin: '4%', color: "white",backgroundColor:"#5d8aa8", fontSize: '0.90vw' }} onClick={() => { onChangetype('humidity') }} >
                  <div style={{ marginRight: '56%' }}><FloorHumIcon />
                  <Typography style={{ fontSize: '0.80vw',marginLeft: "50px",marginTop:"-20px"}}>Co2</Typography>
                  </div>
                </ButtonBase>
                :
                <ButtonBase style={{ width: "100%", margin: '4%', color: "black", fontSize: '0.90vw',marginLeft:"0vh"  }} onClick={() => { onChangetype('humidity') }}>
                  <div style={{ marginRight: '56%' }}><FloorHumIcon />
                  <Typography style={{ fontSize: '0.80vw',marginLeft: "50px",marginTop:"-20px" }}>Co2</Typography>
                  </div>
                </ButtonBase>
              }
              {luxOpen ?
                <ButtonBase style={{ width: "100%", margin: '4%',color: "white", backgroundColor:"#5d8aa8", fontSize: '0.90vw' }} onClick={() => { onChangetype('aqi') }} >
                  <div style={{ marginRight: '12%' }}><AirQualityIcon /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>AirQuality</Typography>
                </ButtonBase>
                :
                <ButtonBase style={{ width: "100%", margin: '4%',color:"black", fontSize: '0.90vw',marginLeft:"0vh"  }} onClick={() => { onChangetype('aqi') }}>
                  <div style={{ marginRight: '12%' }}><AirQualityIcon /></div>
                  <Typography style={{ fontSize: '0.80vw' }}>AirQuality</Typography>
                </ButtonBase>
              }
            </Card>
          </Grid>
        </Grid>
        <Grid container xs={3} direction='column' spacing={2}>
          {
            deviceTrendData.map((trend) => (
              Object.keys(trend).map((key) => (
                <>
                <Card className={classes.graphcard}>
                  <DevicetrendChart data={trend[key]} param={key} changeContext={props.changeContext} history={props.data.history} />
                </Card>
                </>
              ))
            ))
          }
        </Grid>
      </Grid>
      {/* {openmodal ?
        <Modal
          open={openmodal}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          {body}
        </Modal>
        :
        <div></div>
      } */}
      <SemanticToastContainer position='top-center' />
      {loading === true ? 
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            :
                <div></div>   
            }
    </div>
  )

}

export default Devicemap
