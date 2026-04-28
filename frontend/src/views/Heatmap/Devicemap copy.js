import React, { useEffect, useState } from 'react'
import api from '../../api'
import zonal_damper from "assets/img/dashboard-icons/Damper_1_Open.png";
import VAV_damper from "assets/img/dashboard-icons/VAV.png";
import tempAvatar from "assets/img/sensor-icon.png";
import Refresh from '@material-ui/icons/Refresh';
import AHU_damper from "assets/img/dashboard-icons/AHU.png";
import GridItem from 'components/Grid/GridItem.js';
import IconButton from '@material-ui/core/IconButton';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Grid, Select, FormControl, MenuItem, InputLabel, Typography, Card, Avatar, Tooltip as TooltipCore, FormControlLabel, ButtonBase } from '@material-ui/core';
import { Map, ImageOverlay, Marker, Popup, Tooltip, Circle, Rectangle, FeatureGroup, Polygon } from 'react-leaflet';
import DevicetrendChart from 'views/DevicetrendChart';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";
import { useSelector, useDispatch } from 'react-redux';
import SwitchSelector from "react-switch-selector";
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import Success from 'components/Typography/Success';
import Chart from "react-apexcharts";
import CardBody from 'components/Card/CardBody';
import CardHeader from 'components/Card/CardHeader';
import CardFooter from 'components/Card/CardFooter';
import FloorTempIcon from 'assets/img/FloorTempIcon';
import FloorHumIcon from 'assets/img/FloorHumIcon';
import AirQualityIcon from 'assets/img/AirQualityIcon';
import ControlBlack from 'assets/img/ControlBlack';
import ControlWhite from 'assets/img/ControlWhite';
import GlLms from './GlLms';
import Control from 'assets/img/Control';
import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
import CardIcon from 'components/Card/CardIcon';
import { element } from 'prop-types';
import { parse } from 'date-fns';
import floor1 from '../../assets/images/floor-14.png';
import Modal from '@material-ui/core/Modal';
import {TextField,Button} from '@material-ui/core';
import { SemanticToastContainer, toast } from 'react-semantic-toasts';
import { SetFilterModel } from 'ag-grid-community';

const Leaflet = require('leaflet');

const useStyles = makeStyles(theme => ({
  refreshIcon: {
    color: "black",
    "&:hover": {
      backgroundColor: "transparent"
    }
  },
  card: {
    borderRadius: '5px',
    marginLeft: '10px',
    maxWidth: '27px',
    maxHeight: '27px',
    minHeight: '27px',
    minWidth: '27px',
    backgroundColor: 'white',
    "&:hover": {
      backgroundColor: "#EEEEEE"
    }
  },
  buttonsContainer: {
    width: "100%",
    marginLeft: '10px',
  },
  buttonStyle: {
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center'
  },
  legendContainer: {
    marginTop: "20px",
    display: 'flex',
    width: "60%",
    // justifyContent: "flex-start"
    justifyContent: "center"
  },
  legendSpanStyle:
  {
    float: "left",
    marginLeft: '10%',
    marginRight: "10px",
    [theme.breakpoints.up("xl")]: {
      fontSize: "45px"
    }
  },
  margin: {
    margin: theme.spacing(1),
    width: "100%"
  },
  typography: {
    padding: theme.spacing(2),
  },
  bounds: {
    [theme.breakpoints.up('md')]:
      { height: "442px", width: "630px", marginTop: "0%",marginLeft:"0%" },
    [theme.breakpoints.down('xs')]:
      { height: "414px", width: "543px", marginTop: "3%" },
    [theme.breakpoints.down('sm')]:
      { height: "414px", width: "643px", marginTop: "3%" }
  },
  legend: {
    backgroundImage: "linear-gradient(to right, #3de519, #72eb04, #98f000, #b9f500, #d8fa00, #e8eb00, #f5db00, #ffcc00, #ffa600, #ff7f00, #f8531a, #eb0f2c)",
    height: "20px",
    width: "40%",
    float: "left",
    // [theme.breakpoints.up('md')]:
    // {width:"60%"}
  },
  temperature: {
    backgroundImage: "linear-gradient(to right, #1976d2, #3de519, #eb0f2c )",
    height: "20px",
    width: "40%",
    float: "left",
  },
  humidity: {
    backgroundImage: "linear-gradient(to right,#eb0f2c, #ffeb3b, #3de519, #ffeb3b )",
    height: "20px",
    width: "40%",
    float: "left",
  },
  aqi: {
    backgroundImage: "linear-gradient(to right,#3de519, #ffeb3b, #eb0f2c)",
    height: "20px",
    width: "40%",
    float: "left",
  },
  // map: {
  //   [theme.breakpoints.down('xs')]:
  //     { width: "313px" },
  // },
  graphcard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    width: "315px",
    height: "205px",
    margin: '5px'
  },
  label: {
    color: "black",
  },
  alertcard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    width: "135px",
    height: "105px",
    margin: '5px'
  },
  devicecard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    width: "90px",
    height: "100px",
    margin: '5px'
  },
  mapcard: {
    backgroundColor: 'white',
    borderRadius: '14px',
    width: "100%",
    height: "435px",
    margin: '8px',
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)",
  },
  totalalarmCount: {
    "font-size": '60px',
    "font-weight": "700",
    "letter-spacing": "1.8px",
    "color": "#ce1e1e"

  },
  CardBodyGrid: {
    "display": "flex",
    "align-items": "center",
    "justify-content": "center",
    "border-radius": "5px",
    //padding: "0.9375rem 20px",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)",
    // marginLeft: "10px"
  },
  totalAlarmCard: {
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)",
  },
  gridContainerStyle: {
    padding: "0.5rem",
  },
  alertTypo: {
    "color": "black",
    "padding-left": "0.9rem"
  },
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));
//inset 0 4px 20px rgb(255 1 1)
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
  };
}

function Devicemap(props) {
  const classes = useStyles();
  const mapRef = React.createRef()
  const [AhuOpen, setAhuOpen] = React.useState(false)
  const [floor, setFloor] = useState([]);
  const [heatMapData, setHeatMapdata] = React.useState({
    rectData: [],
    addressPoints: [],
    mapSubType: props.param ? props.param.toLocaleLowerCase() : "ahu"
  })
  const alerts = useSelector(state => state.alarm.alarmData)
  const [criticalAlertsAhu, setcriticalAlertsAhu] = React.useState(0);
  const [soluAlertsAhu, setsoluAlertsAhu] = React.useState(0);
  const [eachAhuData, setEachAhuDAta] = React.useState([])
  const [iconDevice, setIconDevice] = React.useState({});
  const [tempOpen, setTempOpen] = React.useState(false);
  const [humOpen, setHumOpen] = React.useState(false);
  const [luxOpen, setLuxOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [hvacOpen, sethvacOpen] = React.useState(true);
  const [lmsOpen, setlmsOpen] = React.useState(false);
  const [fid, setFid] = useState('');
  const [fdata, setFdata] = useState(localStorage.getItem('floorName'));
  const buildingID = useSelector(state => state.isLogged.data.building.id);
  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require('../../assets/img/thl-1.png'),
    iconRetinaUrl: require('../../assets/img/thl-1.png'),
    iconSize: new Leaflet.Point(25, 25),
    className: 'leaflet-div-icon-1'
  });
  console.log("propssssssssssssss",props)

  const iconDevice3 = new Leaflet.Icon({
    iconUrl: require('../../assets/img/AHU.png'), 
    iconRetinaUrl: require('../../assets/img/AHU.png'),
    iconSize: new Leaflet.Point(60, 60),
    className: 'leaflet-div-icon-2'
  });
  const [deviceTrendData, setDeviceTrend] = React.useState([])
  const [openmodal,setOpenmodal] = React.useState(false)
  const [modalStyle] = React.useState(getModalStyle);
  const [setpt, setSetpt] = React.useState("");
  const [text,setText] = React.useState(false);



  useEffect(() => {
    
    localStorage.removeItem("type")
    let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
    switch (type) {
      case "ahu": setAhuOpen(true)
        setIconDevice(iconDevice3)
        break
    }
    api.floor.devicemap(props.location.state.data, type.toLocaleUpperCase()).then(res => {
      console.log("res in device map componet=nt",res)
      let cdevices = []
      let sdevices = []
      let CriticalTotal = 0
      let solutionTotal = 0
      if(alerts.system.length==0&&alerts.solution.length==0){
        let con=0
        console.log("----------------iam in ")
        res.map(element => {
          console.log("element------------",element)
          let obj = {}
          con++
          obj["name"] = element.name
          obj["ssid"] = element.ssid
          obj["type"] = element.type
          obj["alerts_cri"]=0
          obj["alerts_solu"]=0
          sdevices.push(obj)
          if(res.length==con){
            setEachAhuDAta(sdevices)
          }
        })
      }
     

if(alerts.system.length>0&&alerts.solution.length>0){
  res.map(element => {
    let obj = {}
    obj["name"] = element.name
    obj["ssid"] = element.ssid
    obj["type"] = element.type
    let count = 0
    let ci = 0
    alerts.system.map(ele => {
      if (element.name == ele.device_name) {
        count++
        ci++
        CriticalTotal++
        if (alerts.system.length == count) {
          obj["alerts_cri"] = ci
          setcriticalAlertsAhu(CriticalTotal)
          let si = 0
          let counts = 0
          alerts.solution.map(ele1 => {
            if (element.name == ele1.device_name) {
              counts++
              si++
              solutionTotal++
              if (alerts.solution.length == counts) {
                obj["alerts_solu"] = si
                sdevices.push(obj)
                setEachAhuDAta(sdevices)
                setsoluAlertsAhu(solutionTotal)
              }
            } else {
              counts++
              if (alerts.solution.length == counts) {
                obj["alerts_solu"] = si
                sdevices.push(obj)
                setEachAhuDAta(sdevices)
                setsoluAlertsAhu(solutionTotal)
              }
            }
          })

        }
      } else {
        count++
        if (alerts.system.length == count) {
          obj["alerts_cri"] = ci
          // cdevices.push(obj)
          setcriticalAlertsAhu(CriticalTotal)
          let si = 0
          let counts = 0
          alerts.solution.map(ele => {
            if (element.name == ele.device_name) {
              counts++
              si++
              solutionTotal++
              if (alerts.solution.length == counts) {
                obj["alerts_solu"] = si
                sdevices.push(obj)
                setEachAhuDAta(sdevices)
                setsoluAlertsAhu(solutionTotal)
              }
            } else {
              counts++
              if (alerts.solution.length == counts) {
                obj["alerts_solu"] = si
                sdevices.push(obj)
                setEachAhuDAta(sdevices)
                setsoluAlertsAhu(solutionTotal)
              }
            }
          })
        }
      }
    })

  })
}
      if(alerts.system.length>0&&alerts.solution.length==0){
        res.map(element => {
          let obj = {}
          obj["name"] = element.name
          obj["ssid"] = element.ssid
          obj["type"] = element.type
          let count = 0
          let ci = 0
          alerts.system.map(ele => {
            if (element.name == ele.device_name) {
              count++
              ci++
              CriticalTotal++
              if (alerts.system.length == count) {
                obj["alerts_cri"] = ci
                obj["alerts_solu"]=0
                setcriticalAlertsAhu(CriticalTotal)
                sdevices.push(obj)
                setEachAhuDAta(sdevices)
              }
            } else {
              count++
              if (alerts.system.length == count) {
                obj["alerts_cri"] = ci
                // cdevices.push(obj)
                obj["alerts_solu"]=0
                setcriticalAlertsAhu(CriticalTotal)
                sdevices.push(obj)
                setEachAhuDAta(sdevices)  
              }
            }
          })
      
        })


      }
      if(alerts.system.length==0&&alerts.solution.length>0){
      res.map(element=>{
        let obj={}
        obj["name"]=element.name
        obj["ssid"]=element.ssid
        obj["type"]=element.type
        let count=0
        let ci=0
        alerts.solution.map(ele=>{
                   if(element.name==ele.device_name){
                      count++
                      ci++
                      solutionTotal++
                      if(alerts.solution.length==count){
                         obj["alerts_solu"]=ci
                         obj["alerts_cri"] =0
                        sdevices.push(obj)
                        setsoluAlertsAhu(solutionTotal)
			
			 setEachAhuDAta(sdevices)
                      }
                   }else{
                     count++
                     if(alerts.solution.length==count){
                       obj["alerts_solu"]=ci
                       obj["alerts_cri"] =0
                      sdevices.push(obj)
                      setsoluAlertsAhu(solutionTotal)
		      setEachAhuDAta(sdevices)
                    }
                   }
        })
      })}
      console.log("--------alrets----------solution", solutionTotal)
      console.log("--------alrets----------critical", CriticalTotal)
      console.log("--------alerts critical devices----", cdevices)
      console.log("--------alerts critical devices----", sdevices)
      let zoneData = []
      setHeatMapdata({
        ...heatMapData,
        rectData: zoneData,
        addressPoints: res,
        mapSubType: type
      })
    })
    api.dashboard.getMetricData(buildingID).then(res => {
      setFloor(res)
      // console.log("res",res)
    })
    const trendData = [{
      // 'ahu_chill_water_temperature':[],
      //'ahu_chilled_valve': [],
      'ChW Valve':[],
      'RAT':[],
      'SAT':[]
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
    api.floor.ae(props.location.state.data).then(res => {
      // console.log("res---------ahuactual vs expected====",res)  
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
      // console.log("----------------------terndata",trendData) 
    })
  }, [fid]);
  const resetZoom = () => {
    mapRef.current.leafletElement.setZoom(0)
  }
  const onIconClick = (type) => {
    api.floor.devicemap("bfa9eb1d-da60-4a50-b8e3-3370141e94c4", type.toLocaleUpperCase()).then(res => {
      // console.log("res in device map componet=nt",res)
      setHeatMapdata({
        ...heatMapData,
        addressPoints: res,
        mapSubType: type
      })
      switch (type) {
        case "THL":
          setTempOpen(true)
          setAhuOpen(false)
          setIconDevice(iconDevice1)
          break;
        case "Ahu":
          setAhuOpen(true)
          setTempOpen(false)
          setIconDevice(iconDevice3)
          break;
      }
    })
  }


  const handleDeviceClick = (value) => {
    // console.log("----------------------------------------------",value)
    // console.log("props------",props)
    //console.log("id-------name",id,name)
    // if (value.type == "NONGL_SS_AHU") {
    //   localStorage.setItem("deviceID", value.id);
    //   localStorage.setItem("deviceName", value.name);
    //   props.history.push('/admin/glAhu')
    // }
  }

  const handlefloorchange = (name,id) => {
    console.log("floooorrrr  -id beforter",fid)
    setFdata(name)
   setFid(id)
   console.log("floooorrrr  -id after",fid)
  }
  const options = [
    {
      label: "HVAC",
      value: "hvac",
      selectedBackgroundColor: "#0123b4",
    },
    {
      label: "LMS",
      value: "lms",
      selectedBackgroundColor: "#0123b4",
    }
  ];
  const options1 = [
    {
      label: "Controllers",
      value: "controls",
      selectedBackgroundColor: "#3f51b5",
      innerHeight: 50
    },
    {
      label: "Temperature",
      value: "temperature",
      selectedBackgroundColor: "#3f51b5"
    },
    {
      label: "Humidity",
      value: "humidity",
      selectedBackgroundColor: "#3f51b5"
    },
    {
      label: "Air Quality",
      value: "air quality",
      selectedBackgroundColor: "#3f51b5"
    }
  ];
  const initialSelectedIndex = options.findIndex(({ value }) => value === "hvac");
  const initialSelectedIndex1 = options.findIndex(({ value }) => value === "controls");

  const onChange = newValue => {

    console.log("switched to lms",newValue);
    
    localStorage.setItem("type",newValue)
  //   if(newValue=="lms"){
      
  //     localStorage.setItem("deviceID",value.id);
      
  //     localStorage.setItem("deviceName",value.name);
      
  //     // props.history.push('/admin/glLms')
  //  <div>karthik</div>
    
      
  //   }
    // switch (newValue) {
    //   case "hvac":
    //     sethvacOpen(false)
    //     setlmsOpen(true)
    //     break
    //   case "lms":
    //     setlmsOpen(false)
    //     sethvacOpen(true)
    //     setIconDevice(iconDevice1)
    //     break
    // }
    if(newValue=="hvac"){
      sethvacOpen(true)
      setlmsOpen(false)
    }else{
      setlmsOpen(true)
      sethvacOpen(false)
    }
  };
  const onChangetype = newValue => {
    // console.log("new valueeeeeee",newValue)
    setValue(newValue)
    let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
    // console.log("type from hetmap",type)
    switch (newValue) {
      case "AHU":
        setAhuOpen(true)
        setTempOpen(false)
        setHumOpen(false)
        setLuxOpen(false)
        setIconDevice(iconDevice3)
        break
      case "aqi":
        setLuxOpen(true)
        setAhuOpen(false)
        setTempOpen(false)
        setHumOpen(false)
        setIconDevice(iconDevice1)
        break
      case "temperature":
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
        setIconDevice(iconDevice1)
        break
    }
    {
      newValue == 'AHU' ?

        api.floor.devicemap(props.location.state.data, newValue.toLocaleUpperCase()).then(res => {
           console.log("res in device map componet=nt",res)
          let zoneData = []
          setAhuOpen(true)
          setHeatMapdata({
            ...heatMapData,
            rectData: zoneData,
            addressPoints: res,
            mapSubType: type
          })
        })
        :
        api.floor.heatmap(props.location.state.data, newValue.toLocaleUpperCase()).then(res => {
          console.log("res in heamt map componet=nt",res)
          let zoneData = [], devData = [];
          let obj = {}, deviceObj = {};
          res.map(_res => {
            obj = {}
            obj.zone_id = _res.id
            obj.bound = JSON.parse(_res.coordinates)
            obj.color = _res.color
            obj.value = _res.value
            zoneData.push(obj)
            _res.devices.map(_device => {
              deviceObj = {}
              deviceObj.id = _device.ssid
              deviceObj.name = _device.ss_name
              deviceObj.type = _device.name
              deviceObj.value = _device.param_value
              deviceObj.coordinates = JSON.parse(_device.coordinates)
              devData.push(deviceObj)
            })
          })
          // console.log("----devData",devData)
          setHeatMapdata({
            ...heatMapData,
            rectData: zoneData,
            addressPoints: devData,
            mapSubType: type
          })
        })
    }
  };
  const onClickIssue=(id,name,param)=>{
    console.log(id,name,param)
    localStorage.setItem("deviceID","Ahu2");
    localStorage.setItem("deviceName","Ahu1");
    props.history.push({
      pathname:`/admin/glAhu`,
      state:{
        data:id,
        name:name
      }
    })
  }
  const handlevavclick=()=>{
    setOpenmodal(true)
    setSetpt('')
  }
  const handleChangeForsetpoint=(event)=>{
    console.log("handlechangeforsetpoint-====================",event.target.value)
    setSetpt(event.target.value)
  }
  const handleClick = (value,type) => {
    let id='f94c5f59-b9b4-4cd0-bf1e-513d9a424f63'
    // console.log('handleClick ', setpt);
    // console.log("res,value,inten,type",res,value,setpt,type)
    const user = {
        id: '78e8fd9b-4118-4b96-9df6-380d928e2c4a',
        name: 'raghunandan'
    }
    if(setpt!=''){
        setText(false)
      if(id=='f94c5f59-b9b4-4cd0-bf1e-513d9a424f63'){
          let req=[{macId: '50ac000028254dff', channel: 3}]
          api.controls.controlSp(req,user,setpt).then(res=>{
            setOpenmodal(false)
            if(res.message='Please connect to a network'){
              toast({
                type: 'error',
                icon: 'exclamation triangle',
                title: 'Error',
                description: 'Please connect to a network',
                time: 3000
              })
            } else {
              console.log("setted setpoint",res)
              toast({
                type: 'success',
                icon: 'check circle',
                title: 'Success',
                description: 'Successfully controlled',
                time: 3000
              })
            }
          })
          .catch((e) => {
            toast({
              type: 'error',
              icon: 'exclamation triangle',
              title: 'Error',
              description: "Failed to set!!!,Enter correct Value",
              time: 3000
            });
          });
      }  
    } else {
       setText(true)
  }   
  };
  const handleClose=()=>{
    setOpenmodal(false)
    setText(false)
  }
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Grid container direction='column'justify='space-evenly'>
        <h6 id="simple-modal-title" style={{textAlign:'center'}}>Enter the Set point</h6>
          <TextField id="outlined-basic" label="Setpoint" variant="outlined" placeholder='℃'
            onChange={handleChangeForsetpoint} value={setpt} style={{marginBottom:'5px'}}
            />
            {text==true?
                <h6 style={{color:'red'}}>Please Enter setPoint</h6>
            :
              <div></div>
            }
        <Grid container direction='row' justify="space-evenly" alignItems='center'>
          <Button variant="contained" color="primary"  onClick={handleClose}>
              Cancel
          </Button>
          <Button variant="contained" color="primary"  onClick={handleClick}>
              Submit
          </Button>
        </Grid>  
      </Grid>
    </div>
  );

  //const onChangetype=()=>{console.log("sfjhbsdjsdj")}
  return (
    <div> 
     
      <Grid container direction="row" spacing={2}>
        <Grid container direction='row' xs={12} spacing={2}>
          <Grid item xs={5}>
            <FormControl variant="outlined" style={{ width: '100%',marginTop:"-27px" }}>
              <InputLabel id="demo-simple-select-outlined-label">Floor</InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Floor"
                value={fdata}
                // onChange={handlefloorchange}
              >
                {floor.map(_item => (
                  <MenuItem key={_item.name} value={_item.name}  onClick={()=>handlefloorchange(_item.name,_item.id)}>{_item.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <div style={{ width: "335px", height: "50px" ,marginTop:"-25px",marginLeft:"-10px"}}  >
              <SwitchSelector
                onChange={onChange}
                options={options}
                initialSelectedIndex={initialSelectedIndex}
                border="1px solid #0123B4"
                backgroundColor={"#e9e5e5"}
                fontColor={"rgba(0, 0, 0, 0.87)"}
              // wrapperBorderRadius={true}
              //optionBorderRadius={true}
              />
            </div>
          </Grid>
        </Grid>
        {(hvacOpen == true)?
      <>
        <Grid container direction="row" xs={12} spacing={2} style={{ margin: "5px",marginTop:"-4px" }}>
          <Grid item xs={9}>
            <Grid container xs={12} direction="row" spacing={2}>
              <Grid item xs={3}>
                <Grid container xs={12} direction="row" className={classes.totalAlarmCard} style={{marginLeft:"-11px","border-radius":"10px"}} >
                  <Grid item xs={6}>
                    <Card style={{height:"86px","border-radius":"10px"}}>
                      <Grid container xs={12} direction='column' style={{
                        "justify-content": "center",
                        "align-content": "center"
                      }} >
                        <Grid xs={12} >
                          <CardHeader>
                            <div style={{ fontSize: "27px" }}>
                                  <Danger>{parseInt(criticalAlertsAhu) + parseInt(soluAlertsAhu)}</Danger>
                            </div>
                          </CardHeader>
                        </Grid>
                        <Grid xs={12}>
                          total alerts
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card style={{height:"86px","border-radius":"10px"}}>
                      <Grid container xs={12} direction='row' style={{
                        "justify-content": "center",
                        "align-content": "center"
                      }} >
                        <Grid xs={6} style={{ "margin-top": "35px" }}>

                          <Typography className={classes.alertTypo}>Critical</Typography>
                          <Typography className={classes.alertTypo}>Low</Typography>

                        </Grid>
                        <Grid xs={6} style={{ "margin-top": "35px" }}>

                           <Typography className={classes.alertTypo} style={{ color: "red" }}>{parseInt(criticalAlertsAhu)}</Typography>
                        <Typography className={classes.alertTypo} style={{ color: "#ff9800" }}>{parseInt(soluAlertsAhu)}</Typography>

                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>



              </Grid>
              <Grid item xs={9} style={{marginLeft:"-20px"}}>
                <Card>
                  <Grid container xs={12} direction="row" spacing={0.9}>
                  {eachAhuData.map(Element=>
                  parseInt(Element.alerts_cri)+parseInt(Element.alerts_solu)==0?
                   <Grid item xs={2}>
                  <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                <Grid container xs={12} direction='column'>
                  <Grid item xs={12}>
                    <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(76 175 80)","border-radius":"10px" }}>
                      <Grid container xs={12} direction='column' style={{
                        "justify-content": "center",
                        "align-content": "center"
                      }} >
                        <Grid xs={12} >
                          <CardHeader>{Element.name}</CardHeader>
                        </Grid>
                        <Grid xs={12}>
                          <div style={{ fontSize: "45px" }}>
                            <Success>{parseInt(Element.alerts_cri)+parseInt(Element.alerts_solu)}</Success>
                          </div>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </ButtonBase>
              </Grid>:parseInt(Element.alerts_cri)+parseInt(Element.alerts_solu)==1?
                   <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(255 152 0)","border-radius":"10px" }}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader>{Element.name}</CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning>{parseInt(Element.alerts_cri)+parseInt(Element.alerts_solu)}</Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                  
                 :
                  <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(255 1 1)","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader>{Element.name}</CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Danger>{parseInt(Element.alerts_cri)+parseInt(Element.alerts_solu)}</Danger>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                    )}
                     <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(228 219 219))","height":"86px","backgroundColor":"#D3D3D3","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader> </CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning> </Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>   
                </ButtonBase>
                </Grid>
                <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(228 219 219))","height":"86px","backgroundColor":"#D3D3D3","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader> </CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning> </Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(228 219 219))","height":"86px","backgroundColor":"#D3D3D3","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader> </CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning> </Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(228 219 219))","height":"86px","backgroundColor":"#D3D3D3","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader> </CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning> </Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                <Grid item xs={2}>
                    <ButtonBase style={{width:"100%"}} onClick={() => onClickIssue(Element.ssid,Element.name,'temperature')}>
                  <Grid container xs={12} direction='column'>
                    <Grid item xs={12}>
                      <Card style={{ "box-shadow": "inset 0px 1px 0px 3px rgb(228 219 219))","height":"86px","backgroundColor":"#D3D3D3","border-radius":"10px"}}>
                        <Grid container xs={12} direction='column' style={{
                          "justify-content": "center",
                          "align-content": "center"
                        }} >
                          <Grid xs={12} >
                            <CardHeader> </CardHeader>
                          </Grid>
                          <Grid xs={12}>
                            <div style={{ fontSize: "45px" }}>
                              <Warning> </Warning>
                            </div>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  </Grid>
                </ButtonBase>
                </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            <Grid container xs={12} direction='row' spacing={2}>
              <Grid xs={2}>
                <Grid container xs={12} direction='column' spacing={2}>
                  <Grid item xs={12}>
                  <Card style={{ margin: "5px", height: "331px",width:"128px",marginLeft:"-2px"}} >
                  <Typography style={{textAlign:"center"}}>VAV</Typography>
                  <Grid container direction='row'>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#21ba45", color:'white',border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}>1</button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>

                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>

                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>

                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>

                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>

                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",marginLeft:"3px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                  <button onClick={handlevavclick} style={{ backgroundColor: "#D3D3D3",border: "none",cursor: "pointer",fontSize:"14px",height:"32px",width:"40px",marginTop:"2px",borderRadius: "12px"}}></button>
                </Grid>                  
                </Card>
                  </Grid>
                  <Grid item xs={12} style={{marginTop:"-13px",marginLeft:"-2px"}}>
                    <Card style={{ "box-shadow": "1px 0px 4px 2px rgb(0 0 0.1)",width:"125px" }} >
                      <Grid container xs={12} direction='column'>
                        <Grid item xs={12}>
                          <Card style={{ margin: "2px", display: "flex" }}>
                            {AhuOpen?<> <ButtonBase style={{ width: "100%",backgroundColor:"#0123B4" }} onClick={()=>{onChangetype('AHU')}}>
                              <div style={{ marginRight: "13px" }}>
                                <ControlWhite />
                              </div>
                              <p style={{color:"white"}} >Controllers</p>

                            </ButtonBase></>:<> <ButtonBase style={{ width: "100%" }} onClick={()=>{onChangetype('AHU')}}>
                              <div style={{ marginRight: "13px" }}>
                                <Control />
                              </div>
                              <Typography>Controllers</Typography>

                            </ButtonBase></>}
                           
                          </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card style={{ margin: "2px" }}>
                          {tempOpen?<>
                            <ButtonBase style={{ width: "100%" ,backgroundColor:'#0123B4' }} onClick={()=>{onChangetype('temperature')}} >    <div style={{ marginRight: "19px" }}><FloorTempIcon /></div> Temperature </ButtonBase> 

                          </>:<>
                          <ButtonBase style={{ width: "100%"  }} onClick={()=>{onChangetype('temperature')}}>    <div style={{ marginRight: "19px" }}><FloorTempIcon /></div> Temperature </ButtonBase> 
                          </>}
                             </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card style={{ margin: "2px", display: "flex" }}>
                            {humOpen?<>
                             <ButtonBase style={{ width: "100%" ,backgroundColor:'#0123B4' }} onClick={()=>{onChangetype('humidity')}}><div style={{ marginRight: "19px" }}><FloorHumIcon /></div> Humidity</ButtonBase> 
                            
                            </>:<>
                            <ButtonBase style={{ width: "100%"  }} onClick={()=>{onChangetype('humidity')}}><div style={{ marginRight: "19px" }}><FloorHumIcon /></div> Humidity</ButtonBase> 
                            </>}
                             
                              </Card>
                        </Grid>
                        <Grid item xs={12}>
                          <Card style={{ margin: "2px", display: "flex" }}>
                              {luxOpen?<>
                              
                             <ButtonBase style={{ width: "100%",backgroundColor:'#0123b4' }} onClick={()=>{onChangetype('aqi')}}><div style={{ marginRight: "13px" }}><AirQualityIcon /></div>AirQuality</ButtonBase>
                              </>:<>
                              <ButtonBase style={{ width: "100%" }} onClick={()=>{onChangetype('aqi')}}><div style={{ marginRight: "13px" }}><AirQualityIcon /></div>AirQuality</ButtonBase>
                              </>}
                               </Card>
                        </Grid>
                        <Grid item xs={12}>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid xs={10}>
                <Grid container xs={12} direction='row' spacing={2}>
                  <Grid item xs={12}>
                    {/* <Card plain  style={{ "height": "600px" }}> */}
                    <Card className={classes.mapcard}>
                      <div className={classes.map}>
                        <Map
                          ref={mapRef}
                          doubleClickZoom={false}
                          zoomControl={false}
                          dragging={true}
                          scrollWheelZoom={false}

                          crs={Leaflet.CRS.Simple}
                          center={[0, 0]}

                          bounds={[[0, 0], [600, 730]]}
                          className={classes.bounds}

                          onClick={(e) => {

                            console.log({ x: e.latlng.lat, y: e.latlng.lng })
                          }}
                        >
                          <ImageOverlay
                            interactive
                             //url={'https://localhost/' + localStorage.floorName + '.png'}
                            url={floor1}
                            // bounds={[[50, 15], [600, 650]]}
                            bounds={[[100, -8], [525, 640]]}

                          />
                          {heatMapData.addressPoints.map((value) =>
                            <HeatmapLayer
                              radius={5}

                              minOpacity={0.4}
                              blur={19}
                              maxZoom={0.5}
                              points={[value]}

                              latitudeExtractor={m => m.coordinates[0]}
                              longitudeExtractor={m => m.coordinates[1]}
                              intensityExtractor={m => heatMapData.mapSubType !== 'aqi' ? parseFloat(m.value) : ""}
                            />
                          )}

                    {/* { AhuOpen?
                        heatMapData.addressPoints.map((each)=>
                        <Rectangle bounds={each.zone_coordinates} fillColor={each.zoneColor} fillOpacity={0.7} />
                        ):<></>
                      } */}


                          {heatMapData.mapSubType !== 'aqi' &&
                            heatMapData.addressPoints ? heatMapData.addressPoints.map((value1, index) =>
                              <Marker key={index}
                                position={[value1.coordinates[0], value1.coordinates[1]]}
                                onclick={() =>
                                  handleDeviceClick(value1)}
                                icon={iconDevice}
                              >
                                <Tooltip opacity={1} >
                                  {Object.keys(value1).map((key) => (
                                    key != "ssid" && key != "coordinates" && key != "zoneId"&& key != "zone_coordinates"&& key != "type"&& key != "zoneColor"&&  key != "id"  ? <p>{key}:{value1[key]}</p> : <></>
                                  ))}
                                </Tooltip>
                              </Marker>
                            ) : ''}
                        </Map>
                      </div>
                    </Card>
                    {/* </Card> */}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid item>
              <Grid container spacing={1} direction="row" justify="center" alignItems="center" style={{marginTop:"-25px"}}>
                {
                 deviceTrendData.map((trend) => (
                    Object.keys(trend).map((key) => (
                      <DevicetrendChart  data={trend[key]} param={key} changeContext={props.changeContext} history={props.history} />
                    ))
                  )) 
                }

              </Grid>
            </Grid>
          </Grid>
        </Grid>
        </>:<>
        {/* { console.log("??????????????????????",floor)} */}
        {/* {floor.map(_item => (
           
))} */}
      <GlLms  click_id={fid} click_name={fdata} /></>

}
        {openmodal?
            <Modal
              open={openmodal}
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
            >
              {body}
            </Modal>
        :
          <div></div>
        }
      <SemanticToastContainer position='top-center' />
      </Grid>
    
      </div>

  )

}

export default Devicemap


