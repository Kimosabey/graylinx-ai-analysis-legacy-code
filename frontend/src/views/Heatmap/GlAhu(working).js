import React, { useEffect, useState } from "react";
import { makeStyles,withStyles } from "@material-ui/core/styles";
import {Paper,Grid,Select,FormControl,MenuItem,InputLabel,Card,TextField,Snackbar,} from "@material-ui/core";
import api from "../../api";
import { useSelector } from "react-redux";
import TimeSeriesChart from "../TimeSeriesChart.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Chart from "react-apexcharts";
import SwitchSelector from "react-switch-selector";
import { CalendarToday } from "@material-ui/icons";
import CardFooter from "components/Card/CardFooter";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import CardBody from "components/Card/CardBody";
import { Map, ImageOverlay, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/css/leaflet.css";
import WarningIcon2 from "../../assets/img/Warning2";
import Alert from '@material-ui/lab/Alert';
import Tooltip1 from '@material-ui/core/Tooltip';
import AHU_image from "../../assets/img/AHU_Graphic.png";

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
    fontSize:"12px"
  }
})(Tooltip1);

const useStyles = makeStyles((theme) => ({
root: {
    flexGrow: 1,
    marginTop:'-1vh'
},
formControl: {
autosize: true,
clearable: false,
},
paper: {
background:'#FFFFFF 0% 0% no-repeat padding-box',
padding: theme.spacing(1),
textAlign: 'center',
// color: theme.palette.text.secondary,
// boxShadow: '0px 4px 20px #0123B41A',
// backgroundColor: 'white',
// borderRadius: '14px',
borderRadius:"6px",
boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
backgroundColor:"#fcfafa",
marginTop:"1vh",
opacity:'1'
},
switchselector:{
height:'3.5vh',
[theme.breakpoints.down('sm')]: {
  width:'8.5vh'
  // width:'17vh'
},
[theme.breakpoints.up('md')]: {
  width:'7vh'
  // width:'9.5vh'
},
[theme.breakpoints.up('lg')]: {
  width:'10.5vh'
},
[theme.breakpoints.up('xl')]: {
  width:'10.5vh'
},
},
controls_text:{
display:'flex',
'@media (min-width:0px) and (max-width:599.95px)': {//xs
  textAlign:'left',
  fontSize: '1.7vh',
  color:'#292929'
},
'@media (min-width:600px) and (max-width:959.95px)': {//sm
  textAlign:'left',
  fontSize: '2vh',
  color:'#292929'
},
'@media (min-width:960px) and (max-width:1279.95px)': {//md
  textAlign:'left',
  fontSize: '1.7vh',
  color:'#292929'
},
'@media (min-width:1280px) and (max-width:1919.95px)': {//lg
  textAlign:'left',
  fontSize: '1.7vh',
  color:'#292929'
},
'@media (min-width:1920px) and (max-width:2559.95px)': {//xl
  textAlign:'left',
  fontSize: '2vh',
  color:''
},
},
text_field: {
marginLeft: "-0.5vh",
"& .MuiInputBase-input":{fontSize:'1.7vh'},
fontFamily: "Arial",
[theme.breakpoints.down('sm')]: {
  marginLeft:'-1.5vh',
  width:'4.5vh'
},
[theme.breakpoints.up('md')]: {
  width:'3.5vh'
},
[theme.breakpoints.up('lg')]: {
  width:'5.5vh'
},
[theme.breakpoints.up('xl')]: {
  width:'5.5vh'
},
},
controls_paper: {
// padding: theme.spacing(1),
borderRadius:"37px",
color:"white",
display:'flex',
textAlign:"center",
alignItems: 'center',
 justify: 'center',
 height:'3.5vh',
 backgroundColor: 'lightgrey',
 width:"8vh",
 fontSize:"1.8vh"
},
faults_paper: {
// padding: theme.spacing(1),
borderRadius:"37px",
color:"white",
display:'flex',
textAlign:"center",
alignItems: 'center',
 justify: 'center',
 height:'2vh',
 backgroundColor: 'lightgrey',
[theme.breakpoints.down('sm')]: {
  width:"7.5vh"
},
[theme.breakpoints.up('md')]: {
  width:"6vh"
},
[theme.breakpoints.up('lg')]: {
  width:"7.5vh"
},
[theme.breakpoints.up('xl')]: {
  width:"7.5vh"
},
},
set_button: {
marginLeft: "-0.7vh",
fontFamily: "Arial",
[theme.breakpoints.down('sm')]: {
  // marginLeft:'0.5vh',
  marginLeft:'-1.2vh',
  width:'3vh'
},
[theme.breakpoints.up('md')]: {
  width:'3vh',
  marginLeft:'-1vh'
},
[theme.breakpoints.up('lg')]: {
  width:'3.5vh'
},
[theme.breakpoints.up('xl')]: {
  width:'3.5vh'
},
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
Leaflet_Tooltip_Values: {
  height: "18px",
  width: "59px",
  color: " #ffffff",
  fontWeight: "500",
  fontSize: "15px",
  "letter-spacing": "9px",fontFamily:"Arial"
},
Leaflet_Tooltip_Heading: {
fontSize: "12px", fontWeight: "500",fontFamily:"Arial"
}
}));

export default function NestedGrid(props) {
  const classes = useStyles()
  const role_id = localStorage.getItem("roleID")
  const [setpt, set_setpt] = React.useState("");
  const [ahudevice, setAhudevice] = useState([]);
  const [floor, setFloor] = useState([]);
  const initialState = props.location.state != null ? props.location.state.name : localStorage.getItem("deviceName");;
  const [data, setData] = useState(initialState);
  const initialState1 = props.location.state != null ? props.location.state.data : localStorage.getItem("deviceID");;
  const [deviceid, setDeviceid] = useState(initialState1);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [fid, setFId] = useState(localStorage.getItem("floorID"));
  const buildingName = useSelector((state) => state.isLogged.data.building.name);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const [graph, setGraph] = useState([]);
  const [v1com, setv1Com] = useState(0);
  const [disable, setDisable] = useState(false);
  const [disable2, setDisable2] = useState(false);
  const [disable3, setDisable3] = useState(false);
  const [rat, setRat] = useState('');
  const [ductTemp, setDuctTemp] = useState('');
  const [chw_Valve, setChw_Valve] = useState('');
  const [dps_Filter, setDps_Filter] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [vfdOperationStatus, setVfdOperationStatus] = useState(0);
  const [vfdOperationTime, setvfdOperationTime] = useState(0);
  const [vfdOperationCommand, setvfdOperationCommand] = useState(0);
  const [value2, setValue2] = useState(0);
  const [value3, setValue3] = useState([]);
  const [value4, setValue4] = useState([]);
  const [sa_value4, setSaValue4] = useState([]);
  const [sa_fbk_value4, setFbkSaValue4] = useState([]);
  const [value5, setValue5] = useState([]);
  const [value7, setValue7] = useState(0);
  const [value8, setValue8] = useState(0);
  const [v8com, setv8Com] = useState(0);
  const [value9, setValue9] = useState(0);
  const [v9com, setv9Com] = useState(0);
  const [oa_dmpr_pos, setOa_Dmpr_Pos] = useState(0);
  const [dsp_sp, setDsp_sp] = useState(0);
  const [onOff, setOnOff] = useState(1);
  const [operatingStatus, setOperatingStatus] = useState('');
  const [raqCo2, setRAQCo2] = useState('');
  const [RAT_SP, setRATSP] = useState('');
  const [ahu1, setAhu1] = useState({});
  const [RAtvalue, setRAtvalue] = useState('');
  const [openerr,setOpenerr] = React.useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [errmsg,setErrmsg] = React.useState('');
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(0, 0),
    className: "leaflet-div-icon-2",
  });

  useEffect(() => {
    console.log("useeffect calledddddddd",props.location)
    let zone_id='',z_data=[]
    zone_data.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
    zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
    if(fdata!== null){
      zone_data.filter((_each,i) =>{
        if(_each.zone_type==='GL_LOCATION_TYPE_FLOOR'&& _each.name===fdata){
           return zone_id=_each.uuid
        }
      })
    } else {
      zone_data.filter((_each,i) =>{
        if(_each.zone_type==='GL_LOCATION_TYPE_FLOOR'){
          z_data.push(_each);
        }
      })
      zone_id=z_data[0].uuid
      setFdata(z_data[0].name)
      setFId(zone_id[0].uuid)
    }
    console.log("Zone_id->",zone_id)
    if(zone_id){
    api.floor.newDevicemapApi(zone_id, "NONGL_SS_AHU")
      .then((res) => {
        console.log("response im getting",res)
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setAhudevice(res);
        if(deviceid=='' && data==''){
          res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
          setDeviceid(res[0].uuid)
          setData(res[0].name)
          if(res[0]['controlable']['RAT']){
            setRat(res[0]['controlable']['RAT'])
          }    
          if(res[0]['controlable']['Duct_Temp']){
            setDuctTemp(res[0]['controlable']['Duct_Temp'] == 1?'Clogged':'UnClogged')
          }    
          if(res[0]['controlable']['CHW_Vlv_Open_Fb']){
            setChw_Valve(res[0]['controlable']['CHW_Vlv_Open_Fb'] == 'active'?'Open':'Close')
          }    
          if(res[0]['controlable']['DPS_Alarm_1']){
            setDps_Filter(res[0]['controlable']['DPS_Alarm_1'])
          }    
          if(res[0]['controlable']['Wind_Speed']){
            setWindSpeed(res[0]['controlable']['Wind_Speed'])
          }    
          if(res[0]['controlable']['SAF_VFD_On_Off_Fbk']){
            setOperatingStatus(res[0]['controlable']['SAF_VFD_On_Off_Fbk'])
          }    
          if(res[0]['controlable']['RAQ_Co2']){
            setRAQCo2(res[0]['controlable']['RAQ_Co2'])
          }
          if(res[0]['controlable']['RAT_SP']){
            setRATSP(res[0]['controlable']['RAT_SP'])
          }
          if(res[0].ssid){
          // api.floor.getAhuLastHr(res[0].uuid).then((res) => {
          //   setAhu1(res.graphData[0]);
          // }).catch((error)=>{
          //     setOpenerr(true)
          //     if(error.response.data.message){
          //       setErrmsg(error.response.data.message)
          //       }else{
          //         setErrmsg('')
          //       }          })    
        }
        } else{
          console.log("deviceid in else",deviceid,res)
          res.map((resp)=>{
          if(deviceid){
            console.log("hii em in else for resp",resp,deviceid)
            if(resp.ssid == deviceid){
              if(resp['controlable']['RAT']){
                setRat(resp['controlable']['RAT'])
              }    
              if(resp['controlable']['Duct_Temp']){
                setDuctTemp(resp['controlable']['Duct_Temp']== 1?'Clogged':'UnClogged')
              }    
              if(resp['controlable']['CHW_Vlv_Open_Fb']){
                setChw_Valve(resp['controlable']['CHW_Vlv_Open_Fb'] == 'active'?'Open':'Close')
              }    
              if(resp['controlable']['DPS_Alarm_1']){
                setDps_Filter(resp['controlable']['DPS_Alarm_1'])
              }    
              if(resp['controlable']['Wind_Speed']){
                setWindSpeed(resp['controlable']['Wind_Speed'])
              }    
              if(resp['controlable']['SAF_VFD_On_Off_Fbk']){
                setOperatingStatus(resp['controlable']['SAF_VFD_On_Off_Fbk'])
              } 
              if(resp['controlable']['RAQ_Co2']){
                setRAQCo2(resp['controlable']['RAQ_Co2'])
              } 
              if(res[0]['controlable']['RAT_SP']){
                setRATSP(res[0]['controlable']['RAT_SP'])
              } 
            }
          // api.floor.getAhuLastHr(deviceid).then((res) => {
          //   setAhu1(res.graphData[0]);
          // }).catch((error)=>{
          //     console.log("deviceidddd get ahulasthr catch block",deviceid)
          //     setOpenerr(true)
          //     if(error.response){
          //       setErrmsg(error.response.data.message)
          //       }else{
          //         setErrmsg('No response')
          //       }    })
                  }
                })
        }
      }).catch((error) =>{
        if(error.response){
          setOpenerr(true)
          setErrmsg(error.response.data.message)
          }else{
            // setErrmsg('No response')
          }    })
        }
      api.dashboard.getMetricData(buildingID).then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      }).catch((error)=>{
        if(error.response){
          setOpenerr(true)
          setErrmsg(error.response.data.message)
          }else{
            // setErrmsg('No response')
          }    })

    const timer = setInterval(() => {
      if(deviceid){
        api.floor.newDevicemapApi(fid, "NONGL_SS_AHU")
        .then((resp) => {
          resp.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
          resp.map((res)=>{
            if(res.ssid == deviceid){
              if(res['controlable']['RAT']){
                setRat(res['controlable']['RAT'])
              }    
              if(res['controlable']['Duct_Temp']){
                setDuctTemp(res['controlable']['Duct_Temp']== 1?'Clogged':'UnClogged')
              }    
              if(res['controlable']['CHW_Vlv_Open_Fb']){
                setChw_Valve(res['controlable']['CHW_Vlv_Open_Fb'] == 'active'?'Open':'Close')
              }    
              if(res['controlable']['DPS_Alarm_1']){
                setDps_Filter(res['controlable']['DPS_Alarm_1'])
              }    
              if(res['controlable']['Wind_Speed']){
                setWindSpeed(res['controlable']['Wind_Speed'])
              }    
              if(res['controlable']['SAF_VFD_On_Off_Fbk']){
                setOperatingStatus(res['controlable']['SAF_VFD_On_Off_Fbk'])
              }
              if(res['controlable']['RAQ_Co2']){
                setRAQCo2(res['controlable']['RAQ_Co2'])
              } 
              if(res['controlable']['RAT_SP']){
                setRATSP(res['controlable']['RAT_SP'])
              }  
            }

          })
        })
      // api.floor.getAhuLastHr(deviceid).then((res) => {
      //   setAhu1(res.graphData[0]);
      // }).catch((error)=>{
      //   setOpenerr(true)
      //   // setErrmsg(error.response.data.message)
      //   if(error.response){
      //     setErrmsg(error.response.data.message)
      //     }else{
      //       setErrmsg('No response')
      //     }    })

    }else
    {
      console.log("no device selected")
    }
    }, 10000);
    return () => clearInterval(timer);
    //eslint-disable-next-line
  }, [buildingID, initialState1,deviceid]);

  const onclickchart = () => {
    props.history.push({
      pathname: `/admin/glVav`,
    });
  };
  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg('');
  };
  // const state1 = {
  //   options: {
  //     yaxis: {
  //       title: {
  //         text: "Deg C",
  //       },
  //       labels: {
  //         formatter: function (val) {
  //           return val; // Convert the value to an integer (whole number)
  //         },
  //       },
  //     },
  //     chart: {
  //       id: "basic-bar",
  //       color: "green",
  //       events: {
  //         dataPointSelection: function (event, chartContext, config) {
  //           onclickchart();
  //         },
  //       },
  //     },
  //     xaxis: {
  //       categories: vavnames,
  //     },
  //     dataLabels: {
  //       enabled: false
  //     },
  //     stroke: {
  //       show: true,
  //       strokeWidth: 2,
  //       strokeDashArray: 2,
  //       strokeColor: "green",
  //     },
  //   },

  //   series: [
  //   //   {
  //   //   title:'Zone Temperature'
  //   // },
  //     {
  //       name: "Zone Temperature",
  //       data: zonetemp,
  //     },
  //   ],
  // };
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
          // setErrmsg(error.response.data.message)
          if(error.response){
            setOpenerr(true)
            setErrmsg(error.response.data.message)
            }else{
              setErrmsg('No response')
            }    })
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
    setRAtvalue(event.target.value);
  };
  const handleClickRat = (event) => {
    const req =  {
      ss_type: "NONGL_SS_AHU",
      ss_id: deviceid,
      param_id: "RAT_SP",
      gl_command: "CHANGE_SET_POINT",
      value: RAtvalue,
      zone_type: null,
      zone_id: null
  }
    if (RAtvalue >= 15 && RAtvalue <= 35) {
      api.floor
        .cpmOnOffControl(req)
        .then((res) => {
          // setRAtvalue("");
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
              description: "RAT successfully set to" + RAtvalue,
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
          if(error.response){
            setOpenerr(true)
            setErrmsg(error.response.data.message)
            }else{
              setErrmsg('No response')
            }    })
    } else {
      // setRAtvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "RAT SP should be 15-35 ",
        time: 2000,
      });
    }
  };

  const options = [
    {
      selectedFontColor: "white",
      label: "OFF",
      value: 0,
      selectedBackgroundColor: "red",
    },
    {
      selectedFontColor: "white",
      label: "ON",
      value: 1,
      selectedBackgroundColor: "green",
    },
    // {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "orange",
    // },
  ];
  const options1 = [
    {
      selectedFontColor: "white",
      label: "MANUAL",
      value: 0,
      selectedBackgroundColor: "orange",
      fontSize:"9"
    },
    {
      selectedFontColor: "white",
      label: "AUTO",
      value: 1,
      selectedBackgroundColor: "green",
      fontSize:"9"
    },
  ];
  const onChange = (newValue) => {
    setDisable(true)
    setTimeout(() => {     setDisable(false)    }, 30000);
    const msg = newValue === 1 ? "ON" : newValue === 0 ? "OFF" : "Auto";
    const va = newValue === 1 ? 1 :newValue === 0 ? 0: null;
    const gl_command = newValue === 1 ? "TURN_ON": newValue === 0 ? "TURN_OFF" : "Auto";
    setOnOff(va);
    console.log('qqqqqqqqqqqqqqqqqcont',va)
    const req = {
      ss_type: "NONGL_SS_AHU",
      ss_id: deviceid,
      param_id: "AHU_On_Off",
      gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      "commandFrom":"UI",
    };
    // user_id: localStorage.userID,
    // param_value: newValue === 1 ? 10 :newValue === 0 ? 0: null,
  //   {
  //     "ss_type":"NONGL_SS_AHU",
  //     "ss_id":"687bdeca-0922-4801-8a08-b4af696c9e57",
  //     "param_id":"AHU_OFF",
  //     "gl_command":"TURN_ON",
  //     "value":"ON",
  //     "zone_type":null,
  //     "zone_id":null
  // }
    console.log("reqqqqqqqqqqqqqqqqqqqqqqqqqqqq",req)
    api.floor.cpmOnOffControl(req).then((res) => {
      if (res.message === "please connect to network") {
        setOnOff(Math.round(value4));
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      } else if (res.id) {
        let requestID = res.id;
        setOnOff(va);
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
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };
  const modeOnChange = (newValue) => {
    setDisable2(true)
    setTimeout(() => {     setDisable2(false)    }, 30000);
    const msg = newValue === 1 ? "Auto" : "Manual";
    const va = newValue === 1 ? 1 : 0;
    const gl_command = newValue === 1 ? "TURN_ON": newValue === 0 ? "TURN_OFF" : "Auto";
    setOperatingStatus(va);
    // const req = {
    //   param_id: "SAF_VFD_AM",
    //   param_value: newValue === 1 ? 1 : 0,
    //   user_id: localStorage.userID,
    // };
    // param_value: newValue === 1 ? 10 :newValue === 0 ? 0: null,
    const req = {
      ss_type: "NONGL_SS_AHU",
      ss_id: deviceid,
      param_id: "SAF_VFD_AM",
      gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      "commandFrom":"UI",
    };
    api.floor.cpmOnOffControl(req).then((res) => {
      if (res.message === "please connect to network") {
        if(Math.round(sa_value4) > 0){
          setOperatingStatus(1);
        }else{
          setOperatingStatus(0);
        }
                  //setOperatingStatus(Math.round(sa_value4));
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      } else if (res.message === "ACCEPTED") {
        setOperatingStatus(va);
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "successfully turned" + msg,
          time: 2000,
        });
      }
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };

  const handleButtonClick1 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "SAT"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      console.log("resssss",res)
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "SAT Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
    setSelectedButton(index);
  };

  const handleButtonClick2 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "DSP"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "DSP Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
      }else{
        setErrmsg('')  
      }    
    })
    setSelectedButton(index);
  };

  const handleButtonClick3 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "ZAT"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "ZAT Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
    setSelectedButton(index);
  };

  const handleButtonClick = (index,deviceid) => {
    setDisable3(true)
    setTimeout(() => {     setDisable3(false)    }, 10000);
    // Call the appropriate handleButtonClick function based on the button index
    switch (index) {
      case 0:
        handleButtonClick1(index,deviceid);
        break;
      case 1:
        handleButtonClick2(index,deviceid);
        break;
      case 2:
        handleButtonClick3(index,deviceid);
        break;
      default:
        console.error('Unknown button clicked');
        break;
    }
  };

  // Define button labels
  const buttonLabels = ['F1', 'F2', 'F3'];

  const handlefloorchange = (name, id) => {
    setFId(id)
    setFdata(name);
    api.floor.newDevicemapApi(id, "NONGL_SS_AHU").then((res) => {
      if(res.length>0){
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setAhudevice(res);
        setData("");
        setDeviceid("");
      }else{
        setDeviceid('');
        setAhudevice([]); 
        setValue4("");
        setValue3("");
        setValue2("");
        setValue7("");
        setAhu1({});
      }
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };
  const handleChange = (name, id) => {
    console.log("id,name",id,name)
    setDeviceid(id);
    setData(name);
    if(id){
               ahudevice.map((resp)=>{
          if(deviceid){
            if(resp.ssid == deviceid){
              if(resp['controlable']['RAT']){
                setRat(resp['controlable']['RAT'])
              }    
              if(resp['controlable']['Duct_Temp']){
                setDuctTemp(resp['controlable']['Duct_Temp']== 1?'Clogged':'UnClogged')
              }    
              if(resp['controlable']['CHW_Vlv_Open_Fb']){
                setChw_Valve(resp['controlable']['CHW_Vlv_Open_Fb'] == 'active'?'Open':'Close')
              }    
              if(resp['controlable']['DPS_Alarm_1']){
                setDps_Filter(resp['controlable']['DPS_Alarm_1'])
              }    
              if(resp['controlable']['Wind_Speed']){
                setWindSpeed(resp['controlable']['Wind_Speed'])
              }    
              if(resp['controlable']['SAF_VFD_On_Off_Fbk']){
                setOperatingStatus(resp['controlable']['SAF_VFD_On_Off_Fbk'])
              } 
              if(resp['controlable']['RAQ_Co2']){
                setRAQCo2(resp['controlable']['RAQ_Co2'])
              }
              if(resp['controlable']['RAT_SP']){
                setRATSP(resp['controlable']['RAT_SP'])
              }  
            }
          // api.floor.getAhuLastHr(deviceid).then((res) => {
          //   setAhu1(res.graphData[0]);
          // }).catch((error)=>{
          //     console.log("deviceidddd get ahulasthr catch block",deviceid)
          //     setOpenerr(true)
          //     if(error.response){
          //       setErrmsg(error.response.data.message)
          //       }else{
          //         setErrmsg('No response')
          //       }    })
                  }
                })
    // api.floor.getAhuLastHr(id).then((res) => {
    //   setAhu1(res.graphData[0]);
    // }).catch((error)=>{
    //   setOpenerr(true)
    //   if(error.response){
    //     setErrmsg(error.response.data.message)
    //     }else{
    //       setErrmsg('No response')
    //     }    })
    api.floor.getAhu(id).then((res) => {
      setGraph(res.current);
    }).catch((error)=>{
      if(error.response){
        setOpenerr(true)
        setErrmsg(error.response.data.message)
        }else{
          // setErrmsg('No response')
        }    })
      }
  };
  let device_data = [];
  graph.filter((el) => {
    if (
      el.param_id === "ahu_on_off" ||
      el.param_id === "SAT" ||
      el.param_id === "OA_Dmpr_Pos" ||
      el.param_id === "CHW_Vlv_Pos" ||
      el.param_id === "DSP" ||
      el.param_id === "SAF_VFD_Speed_Fbk" ||
      el.param_id === "SAT"
    ) {
      device_data.push(el);
    }
    return el;
  });
 
  const handleLocationClick = (name) => {
    props.history.push(`/admin/Glschedule`);
  };
  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Snackbar open={openerr} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleerrorclose}>
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                        <Grid item xs={12} sm={12} md={9} lg={9} xl={9} xxl={9}>
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
                                      {(_item.name).slice(6)}
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
                                  >
                                  {ahudevice.map((_item) => (
                                    <MenuItem
                                      key={_item.ssid}
                                      value={_item.name}
                                      onClick={() => handleChange(_item.name, _item.ssid)}
                                    >
                                      {_item.name}
                                    </MenuItem>
                                  ))}
                                  </Select>
                                </FormControl>
                            </Grid>  
                          </Grid>
                          <Grid container item xs={12} spacing={1}>
                                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                      <Card className={classes.paper} style={{height:"51.4vh"}}>
                                          <Map
                                            //  ref={mapRef}
                                            attributionControl={false}
                                            doubleClickZoom={false}
                                            zoomControl={false}
                                            dragging={true}
                                            scrollWheelZoom={false}
                                            // className={"floor-map"}
                                            crs={Leaflet.CRS.Simple}
                                            center={[0, 0]}
                                            // bounds={[[0, 0], [950, 800]]}
                                            bounds={[[0, 0],[414, 843],]}
                                            className={classes.bounds}
                                            style={{
                                              width: "max-content",
                                              minWidth: "100%",
                                              height: "54vh",
                                              backgroundColor: "white",
                                            }}
                                            onClick={(e) => {console.log({ x: e.latlng.lat, y: e.latlng.lng });}}
                                          >
                                          <h3 style={{textAlign:'end',textDecorationLine:"underline",marginTop:"0%",color:"black",fontSize:"2.5vh",fontWeight:"bold"}}>{data}</h3>
                                              <ImageOverlay
                                              // interactive
                                              // url={"https://localhost/AHU_Graphic.png"}
                                              url={AHU_image}
                                              // bounds={[[0, 0], [414, 670]]}
                                              // bounds={[[0, 70], [405, 790]]}
                                              bounds={[[-10, 60],[405, 760],]}
                                            />
                                            
                                            <Marker position={[357.6, 366.66]} icon={iconDevice1}>
                                              <Tooltip direction="top" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading}>
                                                    RAT
                                                  </span>
                                                  <br />
                                                    <div
                                                      className={classes.Leaflet_Tooltip_Values}
                                                      style={{
                                                        backgroundColor:'grey'}}
                                                    >
                                                      {formatter.format(rat) + "℃"}
                                                    </div>
                                                </div>{" "}
                                              </Tooltip>
                                            </Marker>
                                            <Marker position={[233.51, 382.67]} icon={iconDevice1}>
                                              <Tooltip direction="top" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading}>
                                                    Duct Temp
                                                  </span>
                                                  <br />
                                                    <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                      style={{
                                                        backgroundColor:"grey",
                                                      }}
                                                    >
                                                      {formatter.format(ductTemp)+ "℃"}
                                                    </div>
                                                </div>{" "}
                                              </Tooltip>
                                            </Marker>
                                            <Marker position={[114.9, 393]} icon={iconDevice1}>
                                              <Tooltip direction="bottom" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading}>
                                                    ChW Valve
                                                    {/* {" "} */}
                                                  </span>
                                                  <br />
                                                    <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                      style={{
                                                        backgroundColor:'grey',
                                                      }}
                                                    >
                                                      {/* should show open or close but for the time being use the param_value */}
                                                      {formatter.format(chw_Valve)}
                                                    </div>
                                                </div>{" "}
                                              </Tooltip>
                                            </Marker>
                                            <Marker position={[116.53,552.67]} icon={iconDevice1}>
                                              <Tooltip direction="bottom" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading} style={{whiteSpace: "normal"}}>
                                                    Operating Status
                                                  </span>
                                                  <br />
                                                    <div
                                                      className={classes.Leaflet_Tooltip_Values}
                                                      style={{
                                                        backgroundColor: 'grey'}}
                                                    >
                                                      {operatingStatus}
                                                    </div>
                                                </div>{" "}
                                              </Tooltip>
                                            </Marker>
                                            <Marker position={[198.3, 317]} icon={iconDevice1}>
                                              <Tooltip direction="top" opacity={0.75} permanent>
                                              <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading} style={{whiteSpace: "normal"}}>
                                                  Filter Status
                                                  </span>
                                                  <br />
                                                  <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                    style={{
                                                      backgroundColor:"green"
                                                    }}
                                                  >
                                                   {formatter.format(dps_Filter)}
                                                  </div>
                                                </div>
                                              </Tooltip>
                                            </Marker>
                                            <Marker position={[280.65,602.18]} icon={iconDevice1}>
                                              <Tooltip direction="bottom" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading} style={{whiteSpace: "no-wrap"}}>
                                                    CO2
                                                  </span>
                                                  <br />
                                                  <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                    style={{backgroundColor: "grey"}}
                                                  >
                                                      {Math.round(raqCo2)}
                                                  </div>
                                                </div>
                                              </Tooltip>
                                            </Marker>
                                            {/* <Marker position={[204.81, 629.67]} icon={iconDevice1}>
                                              <Tooltip direction="top" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading} style={{whiteSpace: "no-wrap"}}>
                                                   Fan DPS
                                                  </span>
                                                  <br />
                                                  <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                    style={{backgroundColor: "grey"}}
                                                  >
                                                    -
                                                  </div>
                                                </div>
                                              </Tooltip>
                                            </Marker> */}
                                            <Marker position={[189.59,143.03]} icon={iconDevice1}>
                                              <Tooltip direction="right" opacity={0.75} permanent>
                                                <div>
                                                  <span className={classes.Leaflet_Tooltip_Heading} style={{ whiteSpace: "normal"}}>
                                                    Wind Speed
                                                  </span>
                                                  <br />
                                                  <div
                                                    className={classes.Leaflet_Tooltip_Values}
                                                    style={{backgroundColor: "grey"}}
                                                  >
                                                  {formatter.format(windSpeed) / 1+'cfm'}
                                                  </div>
                                                </div>
                                              </Tooltip>
                                            </Marker>
                                          </Map>
                                      </Card>
                                  </Grid>
                          </Grid>      
                          <Grid container item xs={12} spacing={1}>
                          {/* {Object.keys(ahu1).map((key) => (
                              <>{(key == 'SAT' || key == 'RAT'|| key == 'CHW_Vlv_Pos')?
                                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                                    <Card className={classes.paper} style={{height:"26vh"}}>
                                    <TimeSeriesChart
                                        style={{ width: "100%", height: "50%" }}
                                        data={ahu1[key]}
                                        param={key}
                                      />
                                    </Card>
                                  </Grid>
                              :<></>}</>
                            ))}  */}
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                              <Card className={classes.paper} style={{height:"26vh"}}>
                              {Object.keys(ahu1).map((key) => (
                                (key == 'SAT')? 
                                <TimeSeriesChart
                                style={{ width: "100%", height: "50%" }}
                                data={ahu1[key]}
                                param={key}
                              /> :
                              <>{(key == 'SAT' && ahu1[key].length == 0)?"no data available":""}</>
                              ))}
                              </Card>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                              <Card className={classes.paper} style={{height:"26vh"}}>
                              {Object.keys(ahu1).map((key) => (
                                (key == 'RAT')? 
                                <TimeSeriesChart
                                style={{ width: "100%", height: "50%" }}
                                data={ahu1[key]}
                                param={key}
                              /> :
                              <>{(key == 'RAT' && ahu1[key].length == 0)?"no data available":""}</>
                              ))}
                              </Card>
                            </Grid>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                              <Card className={classes.paper} style={{height:"26vh"}}>
                                <h2 style={{fontSize:'1.8vh', fontWeight:'bolder'}}>Duct Temperature</h2>
                                <div style={{fontSize:'2.1vh',marginTop:'3.5vh'}}>No data available</div>
                              {/* {Object.keys(ahu1).map((key) => (
                                (key == 'Duct Temperature')? 
                                <TimeSeriesChart
                                style={{ width: "100%", height: "50%" }}
                                data={ahu1[key]}
                                param={key}
                              />
                               :
                              <>{(key == 'Duct Temperature' && ahu1[key].length == 0)?"no data available":""}</>
                              )
                              )} */}
                              </Card>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3} style={{marginLeft:'-0.9vh'}}>
                              <Grid container item xs={12} spacing={1}>   
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                  <Paper style={{maxWidth:"100%",color: "white",backgroundColor: " #0123b4",borderRadius: "10px",height:"6vh",display: "flex",alignItems: "center", justify: "flex-start"}}>
                                    <div style={{marginLeft:'3vh'}}>AHU Status</div>
                                  </Paper>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12} spacing={0.5} style={{marginTop:'1vh'}}>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                      <Card className={classes.paper} style={{marginTop:"0vh",height:'28vh'}}>
                                        <Grid container spacing={1} >
                                          <Grid  container item xs={12}
                                              direction="row"  alignItems="center" justify="flex-start"
                                              >  
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} className={classes.controls_text}>
                                                AHU Mode
                                              </Grid>
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                                                <Paper className={classes.controls_paper} style={{ backgroundColor:"#00CCFF", justifyContent: 'center'}}>
                                                      <div style={{color:'white'}}>{operatingStatus == 'Auto'?'Remote':operatingStatus == 'Manual'?'Local':''}</div>
                                                </Paper>    
                                              </Grid>     
                                          </Grid>
                                        </Grid>
                                        {/* <Grid container spacing={1} >
                                          <Grid  container item xs={12}
                                              direction="row"  alignItems="center" justify="flex-start"
                                              >  
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} className={classes.controls_text}>
                                                AHU Mode
                                              </Grid>
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                                                    <div style={{pointerEvents: (role_id !=2)||disable2 ?"none":"", opacity: (role_id !=2)||disable2 ?"0.4":""}}
                                                    className={classes.switchselector}>
                                                    <SwitchSelector
                                                      onChange={modeOnChange}
                                                      options={options1}
                                                      // initialSelectedIndex={initialSelectedIndex}
                                                      forcedSelectedIndex={operatingStatus}
                                                      fontColor={"#000"}
                                                      selectedFontColor={"#000"}
                                                      optionBorderRadius={5}
                                                      wrapperBorderRadius={7}
                                                      fontSize={8}
                                                      /></div>
                                              </Grid>     
                                          </Grid>
                                        </Grid> */}
                                        <Grid  container item xs={12}>
                                        {/* <Grid item xs={3} sm={3} md={3} lg={3} xl={3}></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2}> <CalendarToday color="primary" /></Grid> */}
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                            <div
                                              onClick={() => handleLocationClick()}
                                              style={{cursor: 'pointer',color: "#0123b4",marginTop:'12vh',fontWeight:"bolder",display:'flex',justifyContent:'center',alignItems:'center',pointerEvents: role_id !=2?"none":"", opacity: role_id !=2?"0.4":""}}
                                            >
                                              Scheduler
                                            </div>
                                        </Grid>
                                      {/* <Grid item xs={3} sm={3} md={3} lg={3} xl={3}></Grid> */}
                                        </Grid>
                                      </Card>
                                    </Grid>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12} spacing={1} style={{marginTop:'0.8vh'}}>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                  <Paper style={{maxWidth:"100%",color: "white",backgroundColor: " #0123b4",borderRadius: "10px",height:"6vh",display: "flex", justifyContent: "flex-start", paddingLeft: "16px",alignItems: "center"}}>
                                    <div style={{marginLeft:'2vh'}}>
                                      AHU Controls
                                      </div>
                                  </Paper>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12} spacing={1} style={{marginTop:'0.8vh'}}>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                  <Card className={classes.paper} style={{marginTop:"0vh",height:'15vh'}}>
                                  <Grid container spacing={1} >
                                          <Grid  container item xs={12}  style={{marginTop:'2vh'}}
                                              direction="row"  alignItems="center" justify="flex-start"
                                              >  
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} className={classes.controls_text}>
                                                  AHU Status
                                              </Grid>
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                                                    <div style={{pointerEvents: (role_id !=2)||disable ?"none":"", opacity:(role_id !=2)||disable ?"0.4":""}}
                                                    className={classes.switchselector}>
                                                    <SwitchSelector
                                                      onChange={onChange}
                                                      options={options}
                                                      // initialSelectedIndex={initialSelectedIndex}
                                                      forcedSelectedIndex={onOff}
                                                      fontColor={"#000"}
                                                      selectedFontColor={"#000"}
                                                      optionBorderRadius={5}
                                                      wrapperBorderRadius={7}
                                                      fontSize={8}
                                                      /></div>
                                              </Grid>     
                                          </Grid>
                                  </Grid>
                                  <Grid container spacing={1}>
                                          <Grid  container item xs={12}
                                              direction="row"  alignItems="center" justify="flex-start"
                                              >  
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} className={classes.controls_text}>
                                                RAT SP
                                              </Grid>
                                              <Grid item xs={1} sm={1} md={1} lg={1} xl={1}></Grid>
                                              <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>   
                                              <Grid container item xs={12} alignItems="center" justify="flex-end">
                                                            <Grid item xs={7} sm={7} md={7} lg={7} xl={7}>
                                                            <TextField
                                                              // label="%"
                                                              placeholder={formatter.format(RAT_SP) + "℃"}
                                                              // style={{marginTop:'3px',marginLeft:'18px',"letter-spacing":"9px",width:'45px'}}
                                                              name="RAT_set_point"
                                                              autoComplete="off"
                                                              // formatter.format(freq)
                                                              value={RAtvalue}
                                                              onChange={handleChangeForsetpointRAT}
                                                              className={classes.text_field}
                                                              // variant="outlined"
                                                              // style={{ marginTop: '3vh' }}
                                                            />
                                                            </Grid>
                                                            <Grid item xs={5} sm={5} md={5} lg={5} xl={5}>
                                                            <Paper className={classes.set_button} onClick={handleClickRat} style={{ backgroundColor:"#0123B4",display:'flex', justifyContent: 'center',cursor:'pointer',marginTop:'1vh',pointerEvents: role_id !=2?"none":"", opacity: role_id !=2?"0.4":""}}>
                                                            <div style={{color:'white'}}>set</div>
                                                          </Paper> 
                                                            </Grid>
                                                  </Grid> 
                                              </Grid>     
                                          </Grid>
                                  </Grid>
                                  </Card>
                                </Grid>
                              </Grid>
                              <Grid container item xs={12} spacing={1}>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                  <Card className={classes.paper} style={{marginTop:'0.7vh',height:"26vh"}}>
                                  <h2 style={{fontSize:'1.8vh', fontWeight:'bolder'}}>CO2</h2>
                                  <div style={{fontSize:'2.1vh',marginTop:'3.5vh'}}>No data available</div>
                                  </Card>   
                                </Grid>
                              </Grid>
                        </Grid>
                </Grid>
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}
