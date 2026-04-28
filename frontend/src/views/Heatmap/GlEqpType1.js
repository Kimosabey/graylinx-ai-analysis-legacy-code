import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Select, FormControl, MenuItem, InputLabel, Card, TextField, Snackbar, } from "@material-ui/core";
import api from "../../api";
import { useSelector } from "react-redux";
import TimeSeriesChart from "../TimeSeriesChart.js";
import SimpleColumnChart from "react-apexcharts";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Chart from "react-apexcharts";
import SwitchSelector from "react-switch-selector";
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Backdrop from '@material-ui/core/Backdrop';
import { CalendarToday, ContactSupportOutlined } from "@material-ui/icons";
import CardFooter from "components/Card/CardFooter";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import CardBody from "components/Card/CardBody";
import { Map, ImageOverlay, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/css/leaflet.css";
import WarningIcon2 from "../../assets/img/Warning2";
import Alert from '@material-ui/lab/Alert';
import Tooltip1 from '@material-ui/core/Tooltip';
// import AHU_Still_image from "../../assets/img/AHU_Graphic.png";
import AHU_Still_image1 from "../../assets/img/AHU_Graphic.png";
//import AHU_Still_image2 from "../../assets/img/AHU_Status/AHU_Kauvery_Static_img_2.png";
import { string } from "prop-types";
import { useHistory } from 'react-router-dom';
import Button1 from '@material-ui/core/Button';
import { ButtonBase } from "@material-ui/core";
// import { message, Spin } from 'antd';
import { greenColor, grayColor, redColor} from "assets/jss/material-dashboard-react";
import { blueColor } from "assets/jss/material-dashboard-react";
const Leaflet = require("leaflet");

const StyledTooltip = withStyles({
  // "& .MuiTooltip-tooltip": {
  //   border: "solid skyblue 1px",
  //   color: "deepskyblue"
  // },
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize: "12px"
  }
})(Tooltip1);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: '-1vh'
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
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
    marginTop: "1vh",
    opacity: '1'
  },
  switchselector: {
    height: '3.5vh',
    [theme.breakpoints.down('sm')]: {
      width: '8.5vh'
      // width:'17vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '7vh'
      // width:'9.5vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '10.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '10.5vh'
    },
  },
  controls_text: {
    display: 'flex',
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      textAlign: 'left',
      fontSize: '2vh',
      color: '#292929'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      textAlign: 'left',
      fontSize: '2vh',
      color: ''
    },
  },
  text_field: {
    marginLeft: "-0.5vh",
    "& .MuiInputBase-input": { fontSize: '1.9vh' },
    fontFamily: "Arial",
    [theme.breakpoints.down('sm')]: {
      marginLeft: '-1.5vh',
      width: '4.6vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '3.6vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '5.6vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '5.6vh'
    },
  },
  controls_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: 'flex',
    textAlign: "center",
    alignItems: 'center',
    justify: 'center',
    height: '3.5vh',
    backgroundColor: 'lightgrey',
    width: "10vh",
    fontSize: "2vh"
  },
  faults_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "black",
    display: 'flex',
    textAlign: "center",
    alignItems: 'center',
    justifyContent: 'center',
    height: '3vh',
    cursor:'pointer',
    backgroundColor: 'lightgrey',
    [theme.breakpoints.down('sm')]: {
      width: "7.5vh"
    },
    [theme.breakpoints.up('md')]: {
      width: "6vh"
    },
    [theme.breakpoints.up('lg')]: {
      width: "7.5vh"
    },
    [theme.breakpoints.up('xl')]: {
      width: "7.5vh"
    },
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
  select: {
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      fontSize:'2vh',
      // marginTop: "-1vh",
    },
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4", borderRadius: "8px"
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh"
    }
  },
  Leaflet_Tooltip_Values: {
    height: "18px",
    width: "59px",
    color: " #ffffff",
    fontWeight: "500",
    fontSize: "13px",
    "letter-spacing": "9px", fontFamily: "Arial"
  },
  Leaflet_Tooltip_Heading: {
    fontSize: "12px", fontWeight: "500", fontFamily: "Arial"
  }
}));

function getValue(apiRes, myParam) {
  let myval = '';
  if ((apiRes != undefined) && (apiRes.controlable != undefined)) myval = apiRes.controlable[myParam];
  // myval = apiRes!= undefined?(apiRes.controlable[myParam]):'';//getJSONElement(apiRes, [myParam]);
  // console.log('----->', myval, typeof myval, 'apiRes', apiRes, 'myParam', myParam)
  if (myval != null) {
    if ((typeof myval) != string) {
      const num = parseFloat(myval);
      if (!isNaN(num)) {
        myval = num.toFixed(2); // Round to 2 decimal places
      }
    }
  } else {
    myval = '-'
  }
  return myval;
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

export default function EquipmentType1(props) {
  const classes = useStyles()
  const history = useHistory();
  const [roleId, setRoleId] = React.useState(props.role_id);
  const [imageParamsAhu, setImageParamsAhu] = React.useState(props.imageParamsAhu);
  const [imageParamsCsu, setImageParamsCsu] = React.useState(props.imageParamsCsu);
  const [checkAhuEqpActive, setcheckAhuEqpActive] = React.useState(props.checkAhuEqpActive);
  const [checkCsuEqpActive, setcheckCsuEqpActive] = React.useState(props.checkCsuEqpActive);
  const [checkEqpActiveParam, setcheckEqpActiveParam] = React.useState(props.checkEqpActiveParam);
  const [satsp, setSATSP] = React.useState("");
  const [checkEqpAMStatusAhu, setCheckEqpAMStatusAhu] = React.useState(props.checkEqpAMStatusAhu);
  const [checkEqpAMStatusCsu, setCheckEqpAMStatusCsu] = React.useState(props.checkEqpAMStatusCsu);
  const [controlsCardAhu, setControlsCardAhu] = React.useState(props.controlsCardAhu);
  const [controlsCardCsu, setControlsCardCsu] = React.useState(props.controlsCardCsu);
  const [graphsCardAhu, setgraphsCardAhu] = useState(props.graphsCardAhu);
  const [graphsCardCsu, setgraphsCardCsu] = useState(props.graphsCardCsu);
  const [graphsCardSubEqp, setgraphsCardSubEqp] = useState(props.graphsCardSubEqp);
  // const [loading, setLoading] = useState(false);
  const [onOffSchedule, setOnOffSchedule] = useState(1);
  const [eqpType, setEqpType] = useState(props.eqpType);
  const [device, setdevice] = useState(props.device);
  const [onOff1, setOnOff1] = useState(2);
  const [onOff2, setOnOff2] = useState(2);
  const [yesNo, setYesNo] = useState(2);
  const [setpt, set_setpt] = React.useState("");
  const [eqpList, setEqpList] = useState([]);
  const [ibmsSnapShotRes, setIbmsSnapShotRes] = useState({});
  const [particularEquipDataSet1, setParticularEquipDataSet1] = useState([]);
  const [particularEquipDataSet2, setParticularEquipDataSet2] = useState([]);
  const [particularEquipAMStatus, setParticularEquipAMStatus] = useState(false);
  const [floor, setFloor] = useState([]);
  const [data, setData] = useState(props.initialState);
  const [deviceid, setDeviceid] = useState(props.initialState1);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [fid, setFId] = useState('');
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const buildingName = useSelector((state) => state.isLogged.data.building.name);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [disable, setDisable] = useState(false);
  const [disable2, setDisable2] = useState(false);
  const [disable3, setDisable3] = useState(false);
  const [setPointvalue, setSetPointvalue] = useState("");
  const [eqpGraphList, setEqpGraphList] = useState({});
  const [eqp1dayGraphList, setEqp1dayGraphList] = useState({});
  const [subEqpGraphList, setSubEqpGraphList] = useState({});
  const [subEqpNames,setSubEqpNames]=useState([]);
  const [subEqpZonetemp,setSubEqpZonetemp]=useState([]);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [deviceImage, setDeviceImage] = useState(false);
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(0, 0),
    className: "leaflet-div-icon-2",
  });
  

  const fanOnIconDevice = new Leaflet.Icon({
   // iconUrl: require("../../assets/img/AHU_Status/fan/Fan_On.gif"),
    iconSize: new Leaflet.Point(70, 70),
    className: "leaflet-div-icon-2",
  });

  const fanTrippedIconDevice = new Leaflet.Icon({
   // iconUrl: require("../../assets/img/AHU_Status/fan/Fan_Tripped.gif"),
    iconSize: new Leaflet.Point(70, 70),
    className: "leaflet-div-icon-2",
  });

  const filterCloggedDevice = new Leaflet.Icon({
    //iconUrl: require("../../assets/img/AHU_Status/filterClogged.gif"),
    iconSize: new Leaflet.Point(50, 85),
    className: "leaflet-div-icon-2",
  });

  const supplyAirGif = new Leaflet.Icon({
    //iconUrl: require("../../assets/img/AHU_Status/supply-air-flow.gif"),
    iconSize: [80, 80],
    className: "leaflet-div-icon-2",
  });

  const coilSupply = new Leaflet.Icon({
    //iconUrl: require("../../assets/img/AHU_Status/coil/supply.gif"),
    iconSize: new Leaflet.Point(50, 50),
    className: "leaflet-div-icon-2",
  });

  const coilReturn = new Leaflet.Icon({
    //iconUrl: require("../../assets/img/AHU_Status/coil/return.gif"),
    iconSize: new Leaflet.Point(80, 80),
    className: "leaflet-div-icon-2",
  });

  const state1 = {
    options: {
      yaxis: {
        title: {
          text: "℃",
        },
        labels: {
          formatter: function (val) {
            return val; // Convert the value to an integer (whole number)
          },
        },
      },
      chart: {
        id: "basic-bar",
        color: "green",
        // events: {
        //   dataPointSelection: function (event, chartContext, config) {
        //     onclickchart();
        //   },
        // },
      },
      xaxis: {
        categories: subEqpNames,
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        strokeWidth: 2,
        strokeDashArray: 2,
        strokeColor: "green",
      },
    },

    series: [
    //   {
    //   title:'Zone Temperature'
    // },
      {
        name: "Zone Temperature",
        data: subEqpZonetemp,
      },
    ],
  };

  const onclickchart = () => {
    props.history.push({
      pathname: `/admin/glVav`,
    });
  };

  const handleerrorclose = () => {
    setSnackbarOpen(false);
    setErrorMsg('');
  };

  const handleChangeForsetpoint = (event) => {
    set_setpt(event.target.value);
  };

  const handleClick = (event) => {
    const req = {
      param_id: "RAT_SP",
      param_value: setpt,
      user_id: localStorage.userID,
    };

    if (setpt >= 15 && setpt <= 35) {
      api.floor
        .UpdateConfigureSetpoints(deviceid, req)
        .then((res) => {
          set_setpt("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.message === "ACCEPTED") {
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Rat successfully setted" + setpt,
              time: 2000,
            });
          }
        })
        .catch((error) => {
          setSnackbarOpen(true)
          if (error.response) {
            setErrorMsg(error.response.data.message)
          } else {
            // setErrorMsg('No response')
          }
        })
    } else {
      set_setpt("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "RAT sp should be 15-35 ",
        time: 2000,
      });
    }
  };

  const handleChangeForsetpointRAT = (event) => {
    console.log("handleChangeForsetpointRAT",event.target.value)
    setSetPointvalue(event.target.value);
  };

  const handleClickRat = (event) => {
    const req =  {
      ss_type: eqpType,
      ss_id: deviceid,
      gl_command: "CHANGE_SET_POINT",
      param_id: eqpType == 'NONGL_SS_AHU'?"SAT_SP":'NONGL_SS_CSU'? "":"FAU_Duct_Temp",
      value: setPointvalue,
      zone_type: null,
      zone_id: null
  }
    if (setPointvalue >= 16 && setPointvalue <= 30) {
      api.floor
        .cpmOnOffControl(req)
        .then((res) => {
          setSetPointvalue("");
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
              description: "Temp successfully set to" + setPointvalue,
              time: 2000,
            });
            const checkCommandStatus = (requestID, startTime = Date.now()) => {
              api.floor.checkCommandStatus(requestID).then((res) => {
                if (res[0].status === 'success') {
                  // Command was successful, stop further API calls
                  console.log("Command succeeded");
                  toast({
                    type: "success",
                    icon: "check circle",
                    title: "Command Status",
                    description: "Command processed successfully",
                    time: 2000,
                  });
                } else if (res[0].status === 'pending') {
                  console.log("Command is still Pending")
                  const elapsedTime = Date.now() - startTime;
            
                  if (elapsedTime < 30000) {
                    console.log(" If less than 30 seconds have passed, keep checking every 3 seconds")
                    setTimeout(() => checkCommandStatus(requestID, startTime), 3000);
                  } else {
                    console.log("Stop checking after 30 seconds and show a timeout message")
                    console.log("Command timed out after 30 seconds.");
                    toast({
                      type: "error",
                      icon: "clock",
                      title: "Timeout",
                      description: "Command is still pending after 30 seconds.",
                      time: 5000,
                    });
                  }
                }
              }).catch((error) => {
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
          setSnackbarOpen(true)
          if (error.response) {
            setErrorMsg(error.response.data.message)
          } else {
            // setErrorMsg('No response')
          }
        })
    } else {
      // setSetPointvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "SAT sp should be 16-30",
        time: 2000,
      });
    }
  };

  const options1 = [
    {
      selectedFontColor: "white",
      label: "OFF" ,
      value: 0,
      selectedBackgroundColor:  grayColor[0]
    },
    {
      selectedFontColor: "white",
      label: "ON",
      value: 1,
      selectedBackgroundColor: greenColor[0]
    },
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
      label: "MANUAL",
      value: 0,
      selectedBackgroundColor: "orange",
      fontSize: "9"
    },
    {
      selectedFontColor: "white",
      label: "AUTO",
      value: 1,
      selectedBackgroundColor: "green",
      fontSize: "9"
    },
  ];

  const options3 = [
    {
      selectedFontColor: "white",
      label: "YES",
      value: 0,
      selectedBackgroundColor: greenColor[0],
      fontSize: "9"
    },
    {
      selectedFontColor: "white",
      label: "NO",
      value: 1,
      selectedBackgroundColor: grayColor[0],
      fontSize: "9"
    },
  ];

  const onChange1 = (newValue) => {
    // setLoading(true)
    setDisable(true)
    setTimeout(() => { setDisable(false) }, 30000);
    // setTimeout(() => setLoading(false), 5000);
    const msg = newValue === 1 ? "On" : newValue === 0 ? "Off" : "Auto";
    const va = newValue === 1 ? 1 : newValue === 0 ? 1 : null;
    const gl_command = newValue === 1 ? "TURN_ON": newValue === 0 ? "TURN_OFF" : "Auto";
    setOnOff1(va);
    const req = {
      ss_type: eqpType,
      ss_id: deviceid,
      param_id: eqpType=='NONGL_SS_AHU'?'SAF_VFD_On_Off':'NONGL_SS_CSU'?"CSU_On_Off_Cmd": 'FAU_On_Off',
      // param_id: sselectorParameter1,
      gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      "commandFrom":"UI",
    };
    api.floor.cpmOnOffControl(req).then((res) => { 
        if (res.message === "please connect to network") {
        setOnOff1(va==1? 0: 1);
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      }else if (res){
            // setTimeout(() => setLoading(false), 5000);
        toast({
          type: "info",
          icon: "check circle",
          // title: "Success",
          description: res,
          time: 2000,
        });
      }
       else if (res.id) {
        let requestID = res.id;
        setOnOff1(va);
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "successfully controlled" + msg,
          time: 2000,
        });
        const checkCommandStatus = (requestID, startTime = Date.now()) => {
          api.floor.checkCommandStatus(requestID).then((res) => {
            if (res[0].status === 'success') {
              // Command was successful, stop further API calls
              console.log("Command succeeded");
              toast({
                type: "success",
                icon: "check circle",
                title: "Command Status",
                description: "Command processed successfully",
                time: 2000,
              });
            } else if (res[0].status === 'pending') {
              console.log("Command is still Pending")
              const elapsedTime = Date.now() - startTime;
        
              if (elapsedTime < 30000) {
                console.log(" If less than 30 seconds have passed, keep checking every 3 seconds")
                setTimeout(() => checkCommandStatus(requestID, startTime), 3000);
              } else {
                console.log("Stop checking after 30 seconds and show a timeout message")
                console.log("Command timed out after 30 seconds.");
                toast({
                  type: "error",
                  icon: "clock",
                  title: "Timeout",
                  description: "Command is still pending after 30 seconds.",
                  time: 5000,
                });
              }
            }
          }).catch((error) => {
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
    }).catch((error) => {
      if (error.response) {
        setSnackbarOpen(true)
        setErrorMsg(error.response.data.message)
      } else {
        // setErrorMsg('No response')
      }
    })
  }

  const onChange2 = (newValue) => {
    // setLoading(true)
    setDisable(true)
    setTimeout(() => { setDisable(false) }, 30000);
    const msg = newValue === 1 ? "On" : newValue === 0 ? "Off" : "Auto";
    const va = newValue === 1 ? 1 : newValue === 0 ? 0 : null;
    const gl_command = newValue === 1 ? "TURN_ON": newValue === 0 ? "TURN_OFF" : "Auto";
    setOnOff2(va);
    const req = {
      ss_type: eqpType,
      ss_id: deviceid,
      param_id: eqpType=='NONGL_SS_AHU'?'SAF_VFD_AM_Fbk':'NONGL_SS_AHU'?"" :'FAU_AM_SS',
      // param_id: sselectorParameter2,
      gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      "commandFrom":"UI",
    };
    api.floor.cpmOnOffControl(req).then((res) => { 
      if (res.message === "please connect to network") {
        setOnOff2(va==1? 0: 1);
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      } else if (res.id) {
        let requestID = res.id;
        setOnOff2(va);
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "successfully turned" + msg,
          time: 2000,
        });
        const checkCommandStatus = (requestID, startTime = Date.now()) => {
          api.floor.checkCommandStatus(requestID).then((res) => {
            if (res[0].status === 'success') {
              // Command was successful, stop further API calls
              console.log("Command succeeded");
              toast({
                type: "success",
                icon: "check circle",
                title: "Command Status",
                description: "Command processed successfully",
                time: 2000,
              });
            } else if (res[0].status === 'pending') {
              console.log("Command is still Pending")
              const elapsedTime = Date.now() - startTime;
        
              if (elapsedTime < 30000) {
                console.log(" If less than 30 seconds have passed, keep checking every 3 seconds")
                setTimeout(() => checkCommandStatus(requestID, startTime), 3000);
              } else {
                console.log("Stop checking after 30 seconds and show a timeout message")
                console.log("Command timed out after 30 seconds.");
                toast({
                  type: "error",
                  icon: "clock",
                  title: "Timeout",
                  description: "Command is still pending after 30 seconds.",
                  time: 5000,
                });
              }
            }
          }).catch((error) => {
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
    }).catch((error) => {
      if (error.response) {
        setSnackbarOpen(true)
        setErrorMsg(error.response.data.message)
      } else {
        // setErrorMsg('No response')
      }
    })
  }

  const onChange3 = (newValue) => {
  //  setDisable(true)
  //  setTimeout(() => { setDisable(false) }, 30000);
  //  setYesNo(va);
  // setLoading(true)
  setOnOffSchedule(newValue)
  let gl_command = ''
  particularEquipDataSet2.map((res)=>{
    if ( res.readParameter === 'SAF_VFD_On_Off_Fbk' || res.readParameter === 'CSU_Run_SS') 
      {
      gl_command = ((res.readParamValue=='inactive')?'TURN_OFF':'TURN_ON');
      }
   })

   const req = {
    ss_id: deviceid,
    ss_type:eqpType,
   }

   api.floor.relinquishPriority(req).then((res) => { 
    if (res.message === "please connect to network") {
    // setYesNo(va==1? 0: 1);
    toast({
    type: "error",
    icon: "exclamation triangle",
    title: "Error",
    description: "connect to network",
    time: 2000,
    });
} else {
  // setLoading(false)
  }})
}

  const handleButtonClick = (index, deviceid, param) => {
  
    setDisable3(true)
    setTimeout(() => { setDisable3(false) }, 10000);

    const req = {
      ss_id: deviceid,
      alarm: param
    }
    api.floor.insertSelectedAlarm(req).then((res) => {
      console.log("resssss", res)
      if (res === "Accepted") {
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "SAT Fault Injected",
          time: 2000,
        });
      } else {
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error) => {
      setSnackbarOpen(true)
      if (error.response) {
        setErrorMsg(error.response.data.message)
      } else {
        // setErrorMsg('No response')
      }
    })
    setSelectedButton(index);
  };

  const handlefloorchange = (name, id) => {
    setFId(id)
    setFdata(name);
    let eqpTypeName = '';
    floor.map((res)=>{
      if(res.id == id){
      res['parameter'].map((re)=>{
        if(re['name']=='CSU'){
          eqpTypeName = ((re['value'] == 'not present')? 'NONGL_SS_AHU':'NONGL_SS_CSU')
        }
      })
      }
    })

    setdevice(eqpTypeName == 'NONGL_SS_AHU'? 'AHU':'CSU')
    setEqpType(eqpTypeName)
    setData('')
    setDeviceid("");
    setParticularEquipDataSet1([])
    setParticularEquipDataSet2([])
    setParticularEquipAMStatus('')
    setEqpGraphList({})

    let data = Object.values(ibmsSnapShotRes[eqpTypeName]).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});

      if(data){
        let temp = []
        data.map((res)=>{
          if(res.Equipment_Group == id){
            temp.push(res)
          }
        })
        setEqpList(temp) 
        // console.log("ress",temp)
              //automatically select first device of selected floor
      setDeviceid(temp[0].id);
      setData(temp[0].name);
      let imageParams= (temp[0].ssType == 'NONGL_SS_AHU' ? imageParamsAhu: imageParamsCsu), controlsCard = (temp[0].ssType == 'NONGL_SS_AHU'? controlsCardAhu: controlsCardCsu), checkEqpAM = (temp[0].ssType == 'NONGL_SS_AHU'? checkEqpAMStatusAhu: checkEqpAMStatusCsu), checkEqpActiveParam = (temp[0].ssType == 'NONGL_SS_AHU' ? checkAhuEqpActive: checkCsuEqpActive);
        if(temp.length > 0){
            let satsp = (temp[0].Eqp_Metrics["SAT_SP"])
            setSATSP(satsp)
            let eqpParams1 = []
            const isEqpActive = (temp[0].Eqp_Attributes[checkEqpActiveParam]?.presentValue) === 'active';
            setcheckEqpActiveParam(isEqpActive)
            imageParams.map((respp) => {
              if (temp[0].Eqp_Attributes[respp.parameter] != undefined){
                 eqpParams1.push({
                   ...respp,
                   value: (!isNaN(parseFloat(temp[0].Eqp_Attributes[respp.parameter].presentValue)))? (formatter.format(temp[0].Eqp_Attributes[respp.parameter].presentValue)) : temp[0].Eqp_Attributes[respp.parameter].presentValue // Add value here
                 })
               }
             }) 
          setParticularEquipDataSet1(eqpParams1)

            let eqpParams2 = []
            controlsCard.map((respp) => {
              if (temp[0].Eqp_Attributes[respp.readParameter] != undefined){
                if(respp.title == 'Schedule'){
                  setOnOffSchedule(((temp[0].Eqp_Attributes[respp.readParameter].priority[7] == null)||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "On")||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 1:0)
                  eqpParams2.push({
                    ...respp,
                    readParamValue: ((temp[0].Eqp_Attributes[respp.readParameter].priority[7] == null)||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "On")||(temp[0].Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 'no':'yes', // Add value here
                  })
                }else{
                 eqpParams2.push({
                   ...respp,
                   readParamValue: (!isNaN(parseFloat(temp[0].Eqp_Attributes[respp.readParameter].presentValue)))? (Math.round(temp[0].Eqp_Attributes[respp.readParameter].presentValue)) : temp[0].Eqp_Attributes[respp.readParameter].presentValue, // Add value here
                   compareParamValue: ((temp[0].Eqp_Attributes[respp.compareParameter])!= undefined?temp[0].Eqp_Attributes[respp.compareParameter].presentValue:''),
                   Device_status: temp[0].Device_status
                  })
                }
               }
             })
          setParticularEquipDataSet2(eqpParams2)

            let eqpParams3 = []
            checkEqpAM.map((respp) => {
              if (temp[0].Eqp_Attributes[respp.parameter] != undefined){
                eqpParams3 = ( (!isNaN(parseFloat(temp[0].Eqp_Attributes[respp.parameter].presentValue)))? (Math.round(temp[0].Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false)) : (temp[0].Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false) // Add value here
              )
               }
             }) 
             setParticularEquipAMStatus(eqpParams3)
             setDeviceImage(true);   
             let req1hr = {
              "startdate":"start",
              "enddate":"end"
          }
            api.floor.getDeviceData(req1hr,temp[0].id, eqpType,"1 WEEK").then((res) => {
              setEqpGraphList(res.graphData[0]);
            }).catch((error) => {
              setSnackbarOpen(true)
              if (error.response) {
                setErrorMsg(error.response.data.message)
              } else {
                // setErrorMsg('No response')
              }
            })
        }else{
          setDeviceImage(false);
          setDeviceid('');
          setEqpList([]);
          setEqpGraphList({});
          setEqp1dayGraphList({});
        }
        }

  };

  const handleChange = (name, id) => {
    setDeviceid(id);
    setData(name);

    if (id) {

      let imageParams= (eqpType == 'NONGL_SS_AHU' ? imageParamsAhu: imageParamsCsu), controlsCard = (eqpType == 'NONGL_SS_AHU'? controlsCardAhu: controlsCardCsu), checkEqpAM = (device =='AHU'? checkEqpAMStatusAhu: checkEqpAMStatusCsu), checkEqpActiveParam = (eqpType == 'NONGL_SS_AHU' ? checkAhuEqpActive: checkCsuEqpActive);

    api.floor.cpmGetDevData().then((response)=>{
      let data = Object.values(response[eqpType]).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      if(data.length > 0){
        data.map((res)=>{
          if(res.id == id){
            let satsp = (res.Eqp_Metrics["SAT_SP"])
            setSATSP(satsp)
            let eqpParams1 = []
            const isEqpActive = (res.Eqp_Attributes[checkEqpActiveParam]?.presentValue) === 'active';
            setcheckEqpActiveParam(isEqpActive)
            imageParams.map((respp) => {
              if (res.Eqp_Attributes[respp.parameter] != undefined){
                 eqpParams1.push({
                   ...respp,
                   value: (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (formatter.format(res.Eqp_Attributes[respp.parameter].presentValue)) : res.Eqp_Attributes[respp.parameter].presentValue // Add value here
                 })
               }
             }) 
          setParticularEquipDataSet1(eqpParams1)

            let eqpParams2 = []
            controlsCard.map((respp) => {
              if (res.Eqp_Attributes[respp.readParameter] != undefined){
                if(respp.title == 'Schedule'){
                  setOnOffSchedule(((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 1:0)
                  eqpParams2.push({
                    ...respp,
                    readParamValue: ((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 'no':'yes', // Add value here
                  })
                }else{
                 eqpParams2.push({
                   ...respp,
                   readParamValue: (!isNaN(parseFloat(res.Eqp_Attributes[respp.readParameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.readParameter].presentValue)) : res.Eqp_Attributes[respp.readParameter].presentValue, // Add value here
                   compareParamValue: ((res.Eqp_Attributes[respp.compareParameter])!= undefined?res.Eqp_Attributes[respp.compareParameter].presentValue:''),
                   Device_status: res.Device_status
                  })
                }
               }
             })
          setParticularEquipDataSet2(eqpParams2)

            let eqpParams3 = []
            checkEqpAM.map((respp) => {
              if (res.Eqp_Attributes[respp.parameter] != undefined){
                eqpParams3 = ( (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false)) : (res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false) // Add value here
              )
               }
             }) 
             setParticularEquipAMStatus(eqpParams3)

           }})
    //        setData("");
    //        setDeviceid("");
           setDeviceImage(true);
          }else{
            setDeviceImage(false);
            setDeviceid('');
            setEqpList([]);
            setEqpGraphList({});
            setEqp1dayGraphList({});
          }
    }).catch((error) => {
      console.log("I'm in error")
      setSnackbarOpen(true)
      if (error.response) {
        setErrorMsg(error.response.data.message)
      } else {
        // setErrorMsg('No response')
      }
    })

    let req1hr = {
      "startdate":"start",
      "enddate":"end"
  }
    api.floor.getDeviceData(req1hr,id, eqpType,"1 WEEK").then((res) => {
      setEqpGraphList(res.graphData[0]);
    }).catch((error) => {
      setSnackbarOpen(true)
      if (error.response) {
        setErrorMsg(error.response.data.message)
      } else {
        // setErrorMsg('No response')
      }
    })
    // api.floor.getDeviceData(id, eqpType,"1 DAY").then((res) => {
    //   setEqp1dayGraphList(res.graphData[0]);
    // }).catch((error) => {
    //   setSnackbarOpen(true)
    //   if (error.response) {
    //     setErrorMsg(error.response.data.message)
    //   } else {
    //     // setErrorMsg('No response')
    //   }
    // })
  
    }
  };

  const handleLocationClick = (name) => {
    history.push(`/admin/Glschedule`);
  };

  const ChipMethod = (props) => {
    return (
      // <Paper className={classes.controls_paper} style={{ backgroundColor: "#00CCFF", justifyContent: 'center' }}>
      //   <div style={{ color: 'white' }}>
      //    <>{props.title == 'Remote/Manual Status'? 
      //    <>{(props.compareParamValue == 'active' && props.readParamValue == 'inactive')? 'Manual': (props.compareParamValue == 'inactive' && props.readParamValue == 'inactive')?'OFF':(props.compareParamValue == 'active' && props.readParamValue == 'active')?'Remote':(props.compareParamValue == 'inactive' && props.readParamValue == 'active')?'Remote':''}</>:props.title == 'ChW Valve'?<>{props.readParamValue == 'active'?'Open':'Close'}</>:<>{props.readParamValue=='active'?'ON':props.readParamValue=='inactive'?'OFF':props.readParamValue}</>}
      //    {props.unit}
      //    </>
      //    {/* } */}
      //    </div>
      // </Paper>
      <>
         <>{props.title == 'Remote/Manual Status'? 
        //  <>{(props.compareParamValue == 'active' && props.readParamValue == 'inactive')?
        //   <Paper className={classes.controls_paper} style={{ backgroundColor: "#944b18", justifyContent: 'center' ,color: 'white'}}>Manual</Paper>
        //   : (props.compareParamValue == 'inactive' && props.readParamValue == 'inactive')?
        //   <Paper className={classes.controls_paper} style={{ backgroundColor: grayColor[0], justifyContent: 'center' ,color: 'white'}}>OFF</Paper>
        //   :(props.compareParamValue == 'active' && props.readParamValue == 'active')?
        //   <Paper className={classes.controls_paper} style={{ backgroundColor: blueColor[0], justifyContent: 'center' ,color: 'white'}}>Remote</Paper>
        //   :(props.compareParamValue == 'inactive' && props.readParamValue == 'active')?
        //   <Paper className={classes.controls_paper} style={{ backgroundColor: blueColor[0], justifyContent: 'center' ,color: 'white'}}>Remote</Paper>
        //   :''}
          <>{(props.readParamValue == 'inactive')?
              <Paper className={classes.controls_paper} style={{ backgroundColor: "#944b18", justifyContent: 'center' ,color: 'white'}}>Manual</Paper>
              :(props.readParamValue == 'active')?
              <Paper className={classes.controls_paper} style={{ backgroundColor: blueColor[0], justifyContent: 'center' ,color: 'white'}}>Remote</Paper>
              :''}
          </>:props.title == 'ChW Valve'?
          <>{props.readParamValue == 'active'?
            <Paper className={classes.controls_paper} style={{ backgroundColor: greenColor[0], justifyContent: 'center' ,color: 'white'}}>Open</Paper>:
            <Paper className={classes.controls_paper} style={{ backgroundColor: grayColor[0], justifyContent: 'center' ,color: 'white'}}>Close</Paper>}</>
          :<>{props.readParamValue=='active'?
            <Paper className={classes.controls_paper} style={{ backgroundColor: greenColor[0], justifyContent: 'center' ,color: 'white'}}>ON</Paper>
          :props.readParamValue=='inactive'?
          <Paper className={classes.controls_paper} style={{ backgroundColor: grayColor[0], justifyContent: 'center' ,color: 'white'}}>OFF</Paper>
          :
          <Paper className={classes.controls_paper} style={{ backgroundColor: "#00CCFF", justifyContent: 'center' ,color: 'white'}}>{props.readParamValue}</Paper>
          }</>}
         {props.unit}
         </>
      </>

    )
  }

  useEffect(() => {
    // console.log("useeffect calledddddddd", zone_data)
    let zone_id = '', z_data = [], imageParams= (device =='AHU'? imageParamsAhu: imageParamsCsu), controlsCard = (device =='AHU'? controlsCardAhu: controlsCardCsu), checkEqpAM = (device =='AHU'? checkEqpAMStatusAhu: checkEqpAMStatusCsu), checkEqpActiveParam = (eqpType == 'NONGL_SS_AHU' ? checkAhuEqpActive: checkCsuEqpActive);
    zone_data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    zone_data.filter((_each) => _each.zone_type === 'GL_LOCATION_TYPE_FLOOR')

    if (fdata !== null) {
      zone_data.filter((_each, i) => {
        if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR' && _each.name === fdata) {
          // console.log("fdaa", _each)
          return zone_id = _each.uuid
        }
      })
    } else {
      zone_data.filter((_each, i) => {
        if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR') {
          z_data.push(_each);
        }
      })
      zone_id = z_data[0].uuid
      setFdata(z_data[0].name)
      setFId(zone_id[0].uuid)
    }

    if (zone_id) {
        api.floor.cpmGetDevData().then((response)=>{
          setIbmsSnapShotRes(response)
        let data=Object.values(response[eqpType]).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        console.log("data",data)
        if(data.length > 0){
          setDeviceImage(true)
          let temp = []
          data.map((res)=>{
            if(res.Equipment_Group == zone_id){ 
                temp.push(res)
              }
            })
            console.log("temp",temp)
            setEqpList(temp) 
            temp.map((res)=>{
              let satsp = (res.Eqp_Metrics["SAT_SP"])
              setSATSP(satsp)
                let eqpParams1 = []
                const isEqpActive = (res.Eqp_Attributes[checkEqpActiveParam]?.presentValue) === 'active';
                setcheckEqpActiveParam(isEqpActive)
                imageParams.map((respp) => {
                  if (res.Eqp_Attributes[respp.parameter] != undefined){
                     eqpParams1.push({
                       ...respp,
                       value: (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (formatter.format(res.Eqp_Attributes[respp.parameter].presentValue)) : res.Eqp_Attributes[respp.parameter].presentValue // Add value here
                     })
                   }
                 }) 
              setParticularEquipDataSet1(eqpParams1)

                let eqpParams2 = []
                controlsCard.map((respp) => {
                  // console.log("res.Eqp_Attributes",res.Eqp_Attributes[respp.readParameter].priority[7])
                  if (res.Eqp_Attributes[respp.readParameter] != undefined){
                    if(respp.title == 'Schedule'){
                      // console.log("respp",respp)
                      setOnOffSchedule(((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 1:0)
                      eqpParams2.push({
                        ...respp,
                        readParamValue: ((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 'no':'yes', // Add value here
                      })
                    }else{
                     eqpParams2.push({
                       ...respp,
                       readParamValue: (!isNaN(parseFloat(res.Eqp_Attributes[respp.readParameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.readParameter].presentValue)) : res.Eqp_Attributes[respp.readParameter].presentValue, // Add value here
                       compareParamValue: ((res.Eqp_Attributes[respp.compareParameter])!= undefined?res.Eqp_Attributes[respp.compareParameter].presentValue:''),
                       Device_status: res.Device_status
                      })
                    }
                   }
                 })
                //  console.log("eqpParams2",eqpParams2) 
              setParticularEquipDataSet2(eqpParams2)

                let eqpParams3 = []
                checkEqpAM.map((respp) => {
                  if (res.Eqp_Attributes[respp.parameter] != undefined){
                    eqpParams3 = ( (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false)) : (res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false) // Add value here
                  )
                   }
                 }) 
                 setParticularEquipAMStatus(eqpParams3)

          })
          if (deviceid == '' && data == '') {
            Object.values(data).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});             
            setDeviceid(data[0].id)
            setData(data[0].name)
            if (data[0].id) {
              let req1hr = {
                "startdate":"start",
                "enddate":"end"
            }
              api.floor.getDeviceData(req1hr,data[0].id, eqpType,"1 WEEK").then((res) => {
                setEqpGraphList(data.graphData[0]);
              }).catch((error) => {
                setSnackbarOpen(true)
                if (error.response.data.message) {
                  setErrorMsg(error.response.data.message)
                } else {
                  setErrorMsg('')
                }
              })
              // api.floor.getDeviceData(data[0].id, eqpType,"1 DAY").then((res) => {
              //   setEqp1dayGraphList(data.graphData[0]);
              // }).catch((error) => {
              //   setSnackbarOpen(true)
              //   if (error.response.data.message) {
              //     setErrorMsg(error.response.data.message)
              //   } else {
              //     setErrorMsg('')
              //   }
              // })
            }
          }
          else{
            if (deviceid) {
              let req1hr = {
                "startdate":"start",
                "enddate":"end"
              }
              api.floor.getDeviceData(req1hr,deviceid, eqpType,"1 WEEK").then((res) => {
                setEqpGraphList(res.graphData[0]);
              }).catch((error) => {
                setSnackbarOpen(true)
                if (error.response) {
                  setErrorMsg(error.response.data.message)
                } else {
                  // setErrorMsg('No response')
                }
              })  
              // api.floor.getDeviceData(deviceid, eqpType,"1 DAY").then((res) => {
              //   setEqp1dayGraphList(res.graphData[0]);
              // }).catch((error) => {
              //   setSnackbarOpen(true)
              //   if (error.response) {
              //     setErrorMsg(error.response.data.message)
              //   } else {
              //     // setErrorMsg('No response')
              //   }
              // })  
              Object.values(data).map((response2) => {
                if (response2.ssid == deviceid) {
                  let satsp = (response2.Eqp_Metrics["SAT_SP"])
                  setSATSP(satsp)
                  let eqpParams1 = []
                  const isEqpActive = (response2.Eqp_Attributes[checkEqpActiveParam]?.presentValue) === 'active';
                  setcheckEqpActiveParam(isEqpActive)
                  imageParams.map((respp) => {
                    if (response2.Eqp_Attributes[respp.parameter] != undefined){
                       eqpParams1.push({
                         ...respp,
                         value: (!isNaN(parseFloat(response2.Eqp_Attributes[respp.parameter].presentValue)))? (formatter.format(response2.Eqp_Attributes[respp.parameter].presentValue)) : response2.Eqp_Attributes[respp.parameter].presentValue // Add value here
                       })
                     }
                   }) 
                  setParticularEquipDataSet1(eqpParams1)

                  let eqpParams2 = []
                  controlsCard.map((respp) => {
                    if (response2.Eqp_Attributes[respp.readParameter] != undefined){
                      if(respp.title == 'Schedule'){
                        setOnOffSchedule(((response2.Eqp_Attributes[respp.readParameter].priority[7] == null)||(response2.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 1:0)
                        eqpParams2.push({
                          ...respp,
                          readParamValue:((response2.Eqp_Attributes[respp.readParameter].priority[7] == null)||(response2.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(response2.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 'no':'yes', // Add value here
                        })
                      }else{
                       eqpParams2.push({
                         ...respp,
                         readParamValue: (!isNaN(parseFloat(response2.Eqp_Attributes[respp.readParameter].presentValue)))? (Math.round(response2.Eqp_Attributes[respp.readParameter].presentValue)) : response2.Eqp_Attributes[respp.readParameter].presentValue, // Add value here
                         compareParamValue: ((response2.Eqp_Attributes[respp.compareParameter])!= undefined?response2.Eqp_Attributes[respp.compareParameter].presentValue:''),
                         Device_status: response2.Device_status
                        })
                      }
                     }
                   }) 

                  setParticularEquipDataSet2(eqpParams2)

                  let eqpParams3 = []
                  checkEqpAM.map((respp) => {
                    if (response2.Eqp_Attributes[respp.parameter] != undefined){
                      eqpParams3 = ( (!isNaN(parseFloat(response2.Eqp_Attributes[respp.parameter].presentValue)))? (Math.round(response2.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false)) : (response2.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false) // Add value here
                    )
                     }
                   }) 
                   setParticularEquipAMStatus(eqpParams3)
                }
              })            
            }
          }
          }
           })
            .catch((error) => {
              console.log("I'm in error")
              setSnackbarOpen(true)
              if (error.response) {
                setErrorMsg(error.response.data.message)
              } else {
                // setErrorMsg('No response')
              }
            })
            
      }

      api.dashboard.getMetricData(buildingID).then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      }).catch((error) => {
        setSnackbarOpen(true)
        if (error.response) {
          setErrorMsg(error.response.data.message)
        } else {
          // setErrorMsg('No response')
        }
      })

   }, [buildingID, props.initialState1]);

   useEffect (()=>{
    const timer = setInterval(() => {

      let imageParams= (eqpType == 'NONGL_SS_AHU' ? imageParamsAhu: imageParamsCsu), controlsCard = (eqpType == 'NONGL_SS_AHU'? controlsCardAhu: controlsCardCsu), checkEqpAM = (device =='AHU'? checkEqpAMStatusAhu: checkEqpAMStatusCsu), checkEqpActiveParam = (eqpType == 'NONGL_SS_AHU' ? checkAhuEqpActive: checkCsuEqpActive);
      if(deviceid){
        let req1hr = {
          "startdate":"start",
          "enddate":"end"
      }
      api.floor.getDeviceData(req1hr,deviceid, eqpType,"1 WEEK").then((res) => {
          setEqpGraphList(res.graphData[0]);
        }).catch((error) => {
          setSnackbarOpen(true)
          if (error.response) {
            setErrorMsg(error.response.data.message)
          } else {
            // setErrorMsg('No response')
          }
        })
      // api.floor.getDeviceData(deviceid, eqpType,"1 DAY").then((res) => {
      //   setEqp1dayGraphList(res.graphData[0]);
      //   }).catch((error) => {
      //     setSnackbarOpen(true)
      //     if (error.response) {
      //       setErrorMsg(error.response.data.message)
      //     } else {
      //       // setErrorMsg('No response')
      //     }
      //   })
      }
      api.floor.cpmGetDevData().then((response)=>{
        let data = Object.values(response[eqpType]).sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        if(data.length > 0){
          data.map((res)=>{
            if(res.id == deviceid){
              let satsp = (res.Eqp_Metrics["SAT_SP"])
              setSATSP(satsp)
              let eqpParams1 = []
              const isEqpActive = (res.Eqp_Attributes[checkEqpActiveParam]?.presentValue) === 'active';
              setcheckEqpActiveParam(isEqpActive)
              imageParams.map((respp) => {
                if (res.Eqp_Attributes[respp.parameter] != undefined){
                   eqpParams1.push({
                     ...respp,
                     value: (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (formatter.format(res.Eqp_Attributes[respp.parameter].presentValue)) : res.Eqp_Attributes[respp.parameter].presentValue // Add value here
                   })
                 }
               }) 
            setParticularEquipDataSet1(eqpParams1)
  
              let eqpParams2 = []
              controlsCard.map((respp) => {
                if (res.Eqp_Attributes[respp.readParameter] != undefined){
                  if(respp.title == 'Schedule'){
                    setOnOffSchedule(((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 1:0)
                    eqpParams2.push({
                      ...respp,
                      readParamValue: ((res.Eqp_Attributes[respp.readParameter].priority[7] == null)||(res.Eqp_Attributes[respp.readParameter].priority[7] == 'active')||(res.Eqp_Attributes[respp.readParameter].priority[7] == "inactive")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "On")||(res.Eqp_Attributes[respp.readParameter].priority[7] == "Off"))? 'no':'yes', // Add value here
                    })
                  }else{
                   eqpParams2.push({
                     ...respp,
                     readParamValue: (!isNaN(parseFloat(res.Eqp_Attributes[respp.readParameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.readParameter].presentValue)) : res.Eqp_Attributes[respp.readParameter].presentValue, // Add value here
                     compareParamValue: ((res.Eqp_Attributes[respp.compareParameter])!= undefined?res.Eqp_Attributes[respp.compareParameter].presentValue:''),
                     Device_status: res.Device_status
                    })
                  }
                 }
               })
              //  setTimeout(() => setLoading(false), 4000);
            setParticularEquipDataSet2(eqpParams2)
  
              let eqpParams3 = []
              checkEqpAM.map((respp) => {
                if (res.Eqp_Attributes[respp.parameter] != undefined){
                  eqpParams3 = ( (!isNaN(parseFloat(res.Eqp_Attributes[respp.parameter].presentValue)))? (Math.round(res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false)) : (res.Eqp_Attributes[respp.parameter].presentValue == 'active'? true:false) // Add value here
                )
                 }
               }) 
               setParticularEquipAMStatus(eqpParams3)
  
             }})
      //        setData("");
      //        setDeviceid("");
            }else{
              console.log("no dev selected")
            }
      }).catch((error) => {
        console.log("I'm in error")
        setSnackbarOpen(true)
        if (error.response) {
          setErrorMsg(error.response.data.message)
        } else {
          // setErrorMsg('No response')
        }
      })
    }, 2000);
    return () => clearInterval(timer);
   },[buildingID, props.initialState1,deviceid])
   
  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleerrorclose}>
          {errorMsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={9} lg={9} xl={9} xxl={9}>
            {/* floor and device dropdown */}
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
                <FormControl
                  variant="filled"
                  size="large"
                  className={classes.formControl}
                  style={{
                    width: "max-content",
                    minWidth: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial"
                  }}
                >
                  <Select
                    labelId="filled-hidden-label-small"
                    id="demo-simple-select-outlined"
                    label="Floor"
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: '0.8vw',
                      fontFamily: "Arial"
                    }}
                    value={fdata || ''}
                    className={classes.select}
                    disableUnderline
                  >
                    {floor.map((_item) => (
                      <MenuItem
                        key={_item.id}
                        value={_item.name}
                        onClick={() => handlefloorchange(_item.name, _item.id)}
                      >
                        {(_item.name)}
                        {/* {(_item.name).slice(6)} */}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <FormControl
                  variant="filled"
                  size="large"
                  className={classes.formControl}
                  style={{
                    width: "max-content",
                    minWidth: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial"
                  }}
                >
                  <Select
                    labelId="filled-hidden-label-small"
                    id="demo-simple-select-outlined"
                    label="Floor"
                    value={data}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: '0.8vw',
                      fontFamily: "Arial"
                    }}
                    disableUnderline
                    className={classes.select}
                  >
                    {eqpList.map((_item) => (
                      <MenuItem
                        key={_item.id}
                        value={_item.name}
                        onClick={() => handleChange(_item.name, _item.id)}
                      >
                        {_item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            {/* image card */}
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card className={classes.paper} style={{ height: "51.4vh" }}>
                  {deviceImage ? 
                                  <Map
                                    //  ref={mapRef}
                                    attributionControl={false}
                                    doubleClickZoom={false}
                                    zoomControl={false}
                                    dragging={false}
                                    scrollWheelZoom={false}
                                    // className={"floor-map"}
                                    crs={Leaflet.CRS.Simple}
                                    center={[0, 0]}
                                    // bounds={[[0, 0], [950, 800]]}
                                    bounds={[[0, 0], [414, 843],]}
                                    className={classes.bounds}
                                    style={{
                                      width: "max-content",
                                      minWidth: "100%",
                                      height: "54vh",
                                      backgroundColor: "white",
                                    }}
                                    onClick={(e) => { console.log({ x: e.latlng.lat, y: e.latlng.lng }); }}
                                  >
                                    <h3 style={{ textAlign: 'end', textDecorationLine: "underline", marginTop: "0%", color: "black", fontSize: "2.5vh", fontWeight: "bold" }}>{data}</h3>
                                    <ImageOverlay
                                      // interactive
                                      // url={"https://localhost/AHU_Graphic.png"}
                                      url={eqpType ? AHU_Still_image1 : ""}
                                      // bounds={[[0, 0], [414, 670]]}
                                      // bounds={[[0, 70], [405, 790]]}
                                      // bounds={[[-10, 60], [405, 760],]}
                                      // bounds={[[0, 100], [405, 690]]}
                                      bounds={[[50, 50], [405, 760]]}
                                    />
                                    {
                                        ((particularEquipDataSet1) != undefined) ?
                                        <>{particularEquipDataSet1.map((res) => (
                                          <>
                                          <Marker position={res.coordinates} icon={iconDevice1}>
                                            <Tooltip direction={res.tooltipDirection} opacity={0.75} permanent>
                                              <div>
                                                <span className={classes.Leaflet_Tooltip_Heading}>
                                                  {(res.title == 'Operating Status') ? <>Operating<br />Status</> :(res.title == 'OA Damper Pos') ? <>OA Damper<br />Pos</> : (res.title == 'SA Damper Pos') ? <>SA Damper<br />Pos</> : (res.title == 'Supply Air Humidity') ? <>Supply Air<br />Humidity</> : (res.title == 'EA Damper Pos') ? <>EA Damper<br />Pos</> : <>{res.title}</>}
                                                </span>
                                                <br />
                                                <div
                                                  className={classes.Leaflet_Tooltip_Values}
                                                  style={{
                                                    backgroundColor: (checkEqpActiveParam)?((res.minRange && res.maxRange) ? (res.value >= res.minRange && res.value <= res.maxRange? greenColor[0]:
                                                      redColor[0])
                                                      :((res.title=='Trip Status' || res.title=='Operating Status') && res.value=='active')? redColor[0]:((res.title=='Trip Status' ||res.title=='Operating Status')&& res.value=='inactive')? greenColor[0]
                                                      :((res.title == 'Filter Status') && (res.value=='active'))?greenColor[0]:((res.title == 'Filter Status') && (res.value=='inactive'))?redColor[0]:
                                                      ((res.title=='FAN DPS' || res.title=='Bank 1' || res.title=='Bank 2' || res.title=='Bank 3') && res.value=='active')?greenColor[0]:
                                                      ((res.title=='FAN DPS' || res.title=='Bank 1' || res.title=='Bank 2' || res.title=='Bank 3') && res.value=='inactive')?'grey':
                                                      res.backgroundColor):grayColor[0],
                                                    //   ((res.title=='Fan DPS' && res.value=='active') && (res.title=='Filter Status' && res.value=='active'))? 'green':
                                                    // ((res.title=='Fan DPS' && res.value=='active') && (res.title=='Filter Status' && res.value=='inactive'))? 'red':
                                                    // ((res.title=='Fan DPS' && res.value=='inactive') && (res.title=='Filter Status' && res.value=='inactive'))? 'grey':
                                                    // backgroundColor: res.backgroundColor ? res.backgroundColor : 'green',
                                                  }}
                                                >
                                                  {
                                                  (res.title == 'Operating Status')?
                                                  <>{((res.value == 1) ||(res.value =='inactive'))?'ON':
                                                    ((res.value == 0) ||(res.value =='active'))?'OFF':""}</>:
                                                  (res.title == 'Filter Status')?
                                                  <>{((res.value == 1 )||(res.value == 'active'))?'Clean':((res.value == 'inactive'))?'Clogged':""}</>
                                                  :(res.title =='FAN DPS'|| res.title=='Bank 1' || res.title=='Bank 2' || res.title=='Bank 3')?
                                                  <>{(res.value == 'active')?'ON':(res.value == 'inactive')?'OFF':""}</>
                                                  :(res.title =='DPS(Filter)')?
                                                  <>{(res.value == 0)?'Clean':(res.value == 1)?'Bad':""}</>
                                                  :(res.title =='Trip Status')?
                                                  <>{((res.value == 'inactive'))?'Normal':((res.value == 'active'))?'Tripped':""}</>
                                                  :<>{(res.value == 'active')? 'Active': (res.value == 'inactive')?'Inactive': res.value}</>
                                                  }
                                                  {res.unit ? res.unit : ""}
                                                </div>
                                              </div>{" "}
                                            </Tooltip>
                                          </Marker>
                                          {res.title=='FAN DPS'?
                                          ((res.value == 'active')?<>
                                          <Marker position={[140.83,507.93]} icon={fanOnIconDevice}></Marker>
                                          <Marker position={[137.92,611.91]} icon={supplyAirGif}></Marker>
                                          {/* <Marker position={[115.36,343.95]} icon={coilSupply}></Marker> */}
                                          {/* <Marker position={[137.92,611.91]} icon={coilReturn}></Marker> */}
                                          </>
                                            :
                                          <></> 
                                           )
                                            :(res.title =='Trip Status')?
                                            ((res.value == 'active')?
                                            <Marker position={[140.83,507.93]} icon={fanTrippedIconDevice}></Marker>
                                            :
                                            <></>
                                            )
                                            :(res.title =='Filter Status')?
                                            ((res.value == 'inactive')?
                                            <Marker position={[168.78,278.97]} icon={filterCloggedDevice}></Marker>
                                            :
                                            <></>
                                            )
                                            
                                            :
                                            <></>
                                          }
                                          </>
                                        ))   
                                        }</>
                                          :
                                          <></>
                                    }
                                  </Map>
                                  :
                                  <div style={{display:'flex',justifyContent:'center', marginTop:'20vh',fontSize:'2.5vh'}}>No Equipment Available
                                  </div>
                }

                </Card>
              </Grid>
            </Grid>
            {/* left 3 graph cards */}
            <Grid container item xs={12} spacing={1}>
            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "26vh" }}>
                {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                          Object.keys(eqpGraphList).map((key) => (
                          (key == res.param) ?
                          ((res.index == '1')?
                          <TimeSeriesChart
                              style={{ width: "100%", height: "50%" }}
                              data={eqpGraphList[key]}
                              eqpmtType = {device =='AHU'?'NONGL_SS_AHU':'NONGL_SS_CSU'}
                              devId={deviceid}
                              // data24hrData={eqp1dayGraphList[key]}
                              param={key}
                              title={res.title}
                              minRange={res.minRange}
                              maxRange={res.maxRange}
                              via="AHU"
                              /> 
                              :<></>)
                          :
                          <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                          ))
                  ))}
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "26vh" }}>
                {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                          Object.keys(eqpGraphList).map((key) => (
                          (key == res.param) ?
                          ((res.index == '2')?
                          <TimeSeriesChart
                              style={{ width: "100%", height: "50%" }}
                              data={eqpGraphList[key]}
                              eqpmtType = {device =='AHU'?'NONGL_SS_AHU':'NONGL_SS_CSU'}
                              devId={deviceid}
                              // data24hrData={eqp1dayGraphList[key]}
                              param={key}
                              title={res.title}
                              minRange={res.minRange}
                              maxRange={res.maxRange}
                              via="AHU"
                              /> 
                              :<></>)
                          :
                          <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                          ))
                  ))}
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "26vh" }}>
                {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                          Object.keys(eqpGraphList).map((key) => (
                          (key == res.param) ?
                          ((res.index == '3')?
                          <TimeSeriesChart
                              style={{ width: "100%", height: "50%" }}
                              data={eqpGraphList[key]}
                              eqpmtType = {device =='AHU'?'NONGL_SS_AHU':'NONGL_SS_CSU'}
                              devId={deviceid}
                              // data24hrData={eqp1dayGraphList[key]}
                              param={key}
                              title={res.title}
                              minRange={res.minRange}
                              maxRange={res.maxRange}
                              via="AHU"
                              /> 
                              :<></>)
                          :
                          <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                          ))
                  ))}
                </Card>
              </Grid>
                {/* {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                        Object.keys(eqpGraphList).map((key) => (
                        (key == res.param) ?
                        ((res.index == '1' || res.index == '2') || (res.index == '3')?
                        <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                        <Card className={classes.paper} style={{ height: "26vh" }}>
                            <TimeSeriesChart
                            style={{ width: "100%", height: "50%" }}
                            data={eqpGraphList[key]}
                            param={key}
                            title={res.title}
                            via="AHU"
                            /> 
                        </Card>
                        </Grid>:<></>)
                        :
                        <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                        ))
                ))}   */}
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3} style={{ marginLeft: '-0.9vh' }}>
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Paper style={{ maxWidth: "100%", color: "white", backgroundColor: " #0123b4", borderRadius: "10px", height: "6vh", display: "flex", alignItems: "center", justify: "flex-start" }}>
                  <div style={{ marginLeft: '3vh', fontSize: window.innerHeight == '1080'?'2vh':'' }}>{device} Status/ Controls</div>
                </Paper>
              </Grid>
            </Grid>
            {/* controls card */}
            <Grid container item xs={12} spacing={1} style={{ marginTop: '1vh' }}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                  <Card className={classes.paper} style={{ marginTop: "0vh", height: device == 'AHU'?'79vh':'51.4vh' }}>
                  {deviceImage ? <>
                    {particularEquipDataSet2.map((res) => (
                      <Grid container spacing={1} >
                        <Grid container item xs={12} style={{ marginTop: res.title == 'AHU Run Status' ? '1.7vh' : window.innerHeight == '1080'?'1.5vh':'0vh', marginTop: '1.7vh',textAlign:'left'}}
                          direction="row" alignItems="center" justify="flex-start"
                        >
                          <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                          <Grid item xs={6} sm={6} md={6} lg={6} xl={6} className={classes.controls_text}>
                            { res.title }
                          </Grid>
                          <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                          <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                          {/* {console.log("Rendering Chip component:", ChipMethod )} */}
                            {
                            res.component == 'Chip' ? 
                                <ChipMethod readParamValue={res.readParamValue} compareParamValue={res.compareParamValue} unit={res.unit} title={res.title} defaultValue={res.defaultValue}/>
                            : 
                            res.component == 'Switch Selector'  ? 
                            // <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                            <>
                            {res.title == 'AHU Mode'? 
                              <div style={{pointerEvents:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false) ||disable) ?"none":"",
                                opacity:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable)?"0.4":""}}
                              className={classes.switchselector}>
                              <SwitchSelector
                                onChange={onChange2}
                                options={options2}
                                // initialSelectedIndex={initialSelectedIndex}
                                forcedSelectedIndex={res.readParamValue == 1 ||res.readParamValue == 'active'? 1 : 0}
                                fontColor={"#000"}
                                selectedFontColor={"#000"}
                                optionBorderRadius={5}
                                wrapperBorderRadius={7}
                                fontSize={8}
                                />
                              </div>
                              :res.title == 'Schedule'? 
                              <div style={{pointerEvents:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable) ?"none":"",
                                opacity:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable)?"0.4":""}}
                              className={classes.switchselector}>
                              <SwitchSelector
                                onChange={onChange3}
                                options={options3}
                                // initialSelectedIndex={initialSelectedIndex}
                                // forcedSelectedIndex={res.readParamValue == 'yes'? 0 : 1}
                                forcedSelectedIndex={onOffSchedule}
                                fontColor={"#000"}
                                selectedFontColor={"#000"}
                                optionBorderRadius={5}
                                wrapperBorderRadius={7}
                                fontSize={8}
                                />
                              </div>
                              :
                              <div style={{pointerEvents:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable) ?"none":"",
                                 opacity:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable)?"0.4":""}}
                              className={classes.switchselector}>
                              <SwitchSelector
                                onChange={onChange1}
                                options={options1}
                                // initialSelectedIndex={initialSelectedIndex}
                                forcedSelectedIndex={(res.readParamValue == 1 || res.readParamValue == 'active') ? 1 : 0}
                                fontColor={"#000"}
                                selectedFontColor={"#000"}
                                optionBorderRadius={5}
                                wrapperBorderRadius={7}
                                fontSize={8}
                                />
                              </div>
                            }</>
                            // </Spin>
                              : res.component == 'Text Field' ?
                              <Grid container item xs={12} alignItems="center" justify="flex-end" style={{pointerEvents:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable) ?"none":"",
                                opacity:((res.Device_status=='GL_SS_STATUS_INACTIVE')||(particularEquipAMStatus==false)||disable)?"0.4":""}}>
                                                            <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                                                            <TextField
                                                              // label="%"
                                                              style={{pointerEvents:(roleId !=2)||disable||(res.Device_status=='GL_SS_STATUS_INACTIVE') ?"none":"", opacity:(roleId !=2)||disable||(res.Device_status=='GL_SS_STATUS_INACTIVE') ?"0.4":""}}
                                                               placeholder={(satsp) + "℃"}
                                                              //  placeholder={(res.readParamValue) + "℃"}
                                                              // style={{marginTop:'3px',marginLeft:'18px',"letter-spacing":"9px",width:'45px'}}
                                                              name="Set_Point"
                                                              autoComplete="off"
                                                              value={setPointvalue}
                                                              onChange={handleChangeForsetpointRAT}
                                                              className={classes.text_field}
                                                              // variant="outlined"
                                                              // style={{ marginTop: '3vh' }}
                                                            />
                                                            </Grid>
                                                            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                                                            <Paper className={classes.set_button} onClick={()=>handleClickRat(props)} style={{ backgroundColor:"#0123B4",display:'flex', justifyContent: 'center',cursor:'pointer',marginTop:'1vh', pointerEvents:(roleId !=2)||disable||(res.Device_status=='GL_SS_STATUS_INACTIVE') ?"none":"", opacity:(roleId !=2)||disable||(res.Device_status=='GL_SS_STATUS_INACTIVE') ?"0.4":""}}>
                                                            <div style={{color:'white'}}>Set</div>
                                                          </Paper> 
                                                            </Grid>
                              </Grid> 
                            :
                            <></>
                            }
                          </Grid>
                        </Grid>
                      </Grid>
                    ))
                    }
                     {/* <Grid container item xs={12} justifyContent='center' style={{marginTop:'3vh'}}>
                      <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>  
                      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}><Card className={classes.faults_paper} onClick={() => handleButtonClick(1,deviceid,"SAT")}
                                style={{pointerEvents:disable3? "none":"", opacity: disable3? "0.4":""}}>F1</Card></Grid>  
                      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}><Card className={classes.faults_paper} onClick={() => handleButtonClick(2,deviceid,"DSP")}
                                style={{pointerEvents:disable3? "none":"", opacity: disable3? "0.4":""}}>F2</Card></Grid>  
                      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}><Card className={classes.faults_paper} onClick={() => handleButtonClick(3,deviceid,"ZAT")}
                                style={{pointerEvents:disable3? "none":"", opacity: disable3? "0.4":""}}>F3</Card></Grid> 
                      <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>   
                      </Grid>  */}
                    {/* <Grid container item xs={12}>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <div
                          onClick={() => handleLocationClick()}
                          style={{ cursor: 'pointer', color: "#0123b4",marginTop:'1vh' ,fontWeight: "bolder", display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: roleId != 2 ? "none" : "", opacity: roleId != 2 ? "0.4" : "" }}
                        >
                          Scheduler
                        </div>
                      </Grid>
                    </Grid> */}
                    {/* { 
                    <Grid
                    container
                    direction="row"
                    justify="center"
                    style={{ marginTop: "3vh", marginLeft: "-1vh" ,pointerEvents: "none", opacity: "0.4" }}
                  >
                    <CalendarToday color="primary" />
                    <ButtonBase
                      style={{ color: "#3f51b5",fontWeight:"bolder"  }}
                      onClick={() => handleLocationClick()}
                    >
                      Scheduler
                    </ButtonBase>
                    </Grid>
                    } */}
                    </>:
                    <div style={{display:'flex',justifyContent:'center',marginTop:'20vh', fontSize:'2.5vh'}}>No Equipment Available</div
                    >}
                    {/* <Grid container item xs={12}>
                      <Grid item xs={3} sm={3} md={3} lg={3} xl={3}></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2}> <CalendarToday color="primary" /></Grid>
                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        <div
                          onClick={() => handleLocationClick()}
                          style={{ cursor: 'pointer', color: "#0123b4", marginTop:'12vh',fontWeight: "bolder", display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: roleId != 2 ? "none" : "", opacity: roleId != 2 ? "0.4" : "" }}
                        >
                          Scheduler
                        </div>
                      </Grid>
                    </Grid> */}
                  </Card>
                </Grid>
              </Grid>
            </Grid>
                  {/* right bottom graph */}
            <Grid container item xs={12} spacing={1}>
                {/* {graphsCard.map((res)=>(
                        Object.keys(eqpGraphList).map((key) => (
                        (key == res.param) ?
                        ((res.index == '1')?
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                        <Card className={classes.paper} style={{ height: "26vh" }}>
                            <TimeSeriesChart
                            style={{ width: "100%", height: "50%" }}
                            data={eqpGraphList[key]}
                            param={key}
                            /> 
                        </Card>
                        </Grid>:<></>)
                        :
                        <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                        ))
                ))}   */}
                        {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                        {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                        Object.keys(eqpGraphList).map((key) => (
                        (key == res.param) ?
                        ((res.index == '4')?
                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                        <Card className={classes.paper} style={{ height: "26vh" }}>
                            <TimeSeriesChart
                            style={{ width: "100%", height: "50%" }}
                            data={eqpGraphList[key]}
                            title={res.title}
                            param={key}
                            /> 
                        </Card>
                        </Grid>:<></>)
                        :
                        <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                        ))
                ))}
                        </Grid>   */}
                        {(device == 'AHU')?<></>:
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                        <Card className={classes.paper} style={{ height: "26vh" }}>
                                        {(device =='AHU'? graphsCardAhu: graphsCardCsu).map((res)=>(
                                                  Object.keys(eqpGraphList).map((key) => (
                                                  (key == res.param) ?
                                                  ((res.index == '4')?
                                                  <TimeSeriesChart
                                                      style={{ width: "100%", height: "50%" }}
                                                      data={eqpGraphList[key]}
                                                      eqpmtType = {device =='AHU'?'NONGL_SS_AHU':'NONGL_SS_CSU'}
                                                      devId={deviceid}
                                                      // data24hrData={eqp1dayGraphList[key]}
                                                      param={key}
                                                      title={res.title}
                                                      minRange={res.minRange}
                                                      maxRange={res.maxRange}
                                                      via="AHU"
                                                      /> 
                                                      :<></>)
                                                  :
                                                  <>{(key == res.param && eqpGraphList[key].length == 0) ? "No Data Available" : ""}</>
                                                  ))
                                          ))}
                                        </Card>
                                      </Grid>
                        }
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <SemanticToastContainer position="top-center" />
       
    </div>
  );
}
