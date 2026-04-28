// import React, { useEffect,useState } from 'react';

// import { Map, ImageOverlay, Marker, Popup, Tooltip,Circle,Rectangle,FeatureGroup,Polygon } from 'react-leaflet';
// import HeatmapLayer from 'react-leaflet-heatmap-layer';
// import 'leaflet/dist/leaflet.css';
// import "../../assets/css/leaflet.css";
// import api from '../../api';
// import { Grid, Typography, Card, Avatar, Tooltip as TooltipCore, FormControlLabel } from '@material-ui/core';
// // import Button from '@material-ui/core/Button';
// import Button from "components/CustomButtons/Button.js";
// import { withStyles, makeStyles } from '@material-ui/core/styles';
// import { purple, blue, yellow, pink } from '@material-ui/core/colors';
// import LineChart from '../LineChart';
// import MultiLineChart from '../MultiLineChart';
// import moment from 'moment';
// import GridItem from 'components/Grid/GridItem.js';
// import IconButton from '@material-ui/core/IconButton'
// import Refresh from '@material-ui/icons/Refresh';
// import FMGLarage from './FloorMapGenerator01.js';
// import tempAvatar from "assets/img/dashboard-icons/temperature.png";
// import humidityAvatar from "assets/img/dashboard-icons/humidity.png";
// import luxAvatar from "assets/img/dashboard-icons/lux.png";
// import noiseAvatar from "assets/img/dashboard-icons/noise.png";
// import energyAvatar from "assets/img/dashboard-icons/energy.png";
// import co2Avatar from "assets/img/dashboard-icons/co2.png";
// import tvocAvatar from "assets/img/dashboard-icons/tvoc.png";
// import pm25Avatar from "assets/img/dashboard-icons/pm25.png";
// import pm10Avatar from "assets/img/dashboard-icons/pm10.png";
// import TimeSeriesChart from "../TimeSeriesChart.js";
// const Leaflet = require('leaflet');


// const useStyles = makeStyles(theme => ({
//   refreshIcon: {
//     color: "black",
//     "&:hover": {
//       backgroundColor: "transparent"
//     }
//   },
//   card: {
//     borderRadius: '5px',
//     marginLeft: '10px',
//     maxWidth: '27px',
//     maxHeight: '27px',
//     minHeight: '27px',
//     minWidth: '27px',
//     backgroundColor: 'white',
//     "&:hover": {
//       backgroundColor: "#EEEEEE"
//     }
//   },
//   buttonsContainer: {
//     width: "100%",
//     marginLeft: '10px',
//   },
//   buttonStyle: {
//     width: "100%",
//     justifyContent: 'center',
//     alignItems: 'center'
//   },
//   legendContainer: {
//     marginTop: "20px",
//     display: 'flex',
//     width: "60%",
//     // justifyContent: "flex-start"
//     justifyContent: "center"
//   },
//   legendSpanStyle:
//   {
//     float: "left",
//     marginLeft: '10%',
//     marginRight: "10px",
//     [theme.breakpoints.up("xl")]: {
//       fontSize: "45px"
//     }
//   },
//   margin: {
//     margin: theme.spacing(1),
//     width: "100%"
//   },
//   typography: {
//     padding: theme.spacing(2),
//   },
//   bounds: {
//     [theme.breakpoints.up('md')]:
//       { height: "414px", width: "843px", marginTop: "3%" },
//     [theme.breakpoints.down('xs')]:
//       { height: "414px", width: "543px", marginTop: "3%" },
//     [theme.breakpoints.down('sm')]:
//       { height: "414px", width: "643px", marginTop: "3%" }
//   },
//   legend: {
//     backgroundImage: "linear-gradient(to right, #3de519, #72eb04, #98f000, #b9f500, #d8fa00, #e8eb00, #f5db00, #ffcc00, #ffa600, #ff7f00, #f8531a, #eb0f2c)",
//     height: "20px",
//     width: "40%",
//     float: "left",
//     // [theme.breakpoints.up('md')]:
//     // {width:"60%"}
//   },
//   temperature:{
//     backgroundImage: "linear-gradient(to right, #1976d2, #3de519, #eb0f2c )",
//     height: "20px",
//     width: "40%",
//     float: "left",
//   },
//   humidity: {
//     backgroundImage: "linear-gradient(to right,#eb0f2c, #ffeb3b, #3de519, #ffeb3b )",
//     height: "20px",
//     width: "40%",
//     float: "left",
//   },
//   aqi: {
//     backgroundImage: "linear-gradient(to right,#3de519, #ffeb3b, #eb0f2c)",
//     height: "20px",
//     width: "40%",
//     float: "left",
//   },
//   map:{
//     [theme.breakpoints.down('xs')]:
//         {width:"313px"},
//   }
// }));


// const heatmapConf = {
//   temperature: {
//     format: "℃",
//     maxIntensity: 25,
//   },
//   humidity: {
//     format: "RH",
//     maxIntensity: 70,
//   },
//   luminousity: {
//     format: "LX",
//     maxIntensity: 1400,
//   },
//   occupancy: {
//     format: "%",
//     maxIntensity: 74,
//   },
//   noise: {
//     format: "db",
//     maxIntensity: 120,
//   },
//   co2:{
//     format:"ppm",
//     maxIntensity:5000,
//   },
//   tvoc:{
//     format:"ppb",
//     maxIntensity:120,
//   },
//   pm2_5:{
//     format:"μm",
//     maxIntensity:1000,
//   },
//   pm10:{
//     format:"μm",
//     maxIntensity:1000,
//   }
// }

// function HeatmapComponent(props) {
//   // let [rectData,setRectData]=useState([])
//   // let [addressPoints, setAddressPoints] = useState([]);
//   // let [mapSubType, setMapSubType] = useState("temperature")
//   const[heatMapData,setHeatMapdata]=useState({
//      rectData:[],
//      addressPoints:[],
//      mapSubType:props.param?props.param.toLocaleLowerCase():"temperature"
//   })
//   const [stype,setStype]=useState('')
//   const classes = useStyles();
//   const mapRef = React.createRef()
//   // const [mapSubType, setMapSubType] = useState(props.type)
//   const [configValues, setConfigValues] = useState({
//     minTemp: "20",
//     maxTemp: "29",
//     minHum: "40",
//     maxHum: "60",
//     minLux: "200",
//     maxLux: "400",
//     // minAQI: "20",
//     // maxAQI: "2000",
//     minCo2: "0", maxCo2: "800",
//     minTvoc: "30", maxTvoc: "900",
//     minPm2_5: "0", maxPm2_5: "35",
//     minPm10: "0", maxPm10: "35",
//     minNoise: "5", maxNoise: "30"
//   })
//   const [zoomed, setZoomed] = useState(false)
//   // const [minValue, setMinValue] = useState("<= " + configValues.minAQI + " ppm")
//   // const [maxValue, setMaxValue] = useState(">= " + configValues.maxAQI + " ppm")
//   const [chartData, setChartData] = useState({
//     x: ["1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00"],
//     y: [25, 15, 27, 27, 30, 27, 28, 25, 27, 18, 25, 20],
//     min: 15,
//     max: 20
//   })
//   const [minMaxData, setMinMaxData] = useState({
//     temperature: {
//       min: 10, max: 40, step: 5
//     },
//     humidity: {
//       min: 10, max: 100, step: 20
//     },
//     luminousity: {
//       min: 0, max: 2000, step: 500
//     },
//     noise: {
//       min: 15,
//       max: 100
//     },
//     co2:{
//       min:15,
//       max:50,
//     },
//     tvoc:{
//       min: 15,
//       max: 30
//     },
//     pm2_5:{
//       min: 15,
//       max: 30
//     },
//     pm10:{
//       min: 15,
//       max: 30
//     }
//   })
//   const [tempOpen, setTempOpen] = React.useState(false);
//   const [humOpen, setHumOpen] = React.useState(false);
//   const [luxOpen, setLuxOpen] = React.useState(false);
//   const [noiseOpen, setNoiseOpen] = React.useState(false);
//   const [tvocOpen, setTvocOpen] = React.useState(false);
//   const [co2Open, setCo2Open] = React.useState(false);
//   const [pm2_5Open, setPm2_5Open] = React.useState(false);
//   const [pm10Open, setPm10Open] = React.useState(false);

//   const getData =(type)=>{
//     fetch('/material-dashboard-react/data.json'
//     , {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       }
//     }
//   )
//     .then(async function (response) {
//       return response.json();
//     })
//     .then(async function (myJson) {
//       const floorsList =myJson.buildings[0].floors;
//       floorsList.map(_floor=>{
//           // if(_floor.id===localStorage.floorID){
//              switch(type){
//                case "temperature":
//                           const tempData=_floor.tempLatestStatus
//                           const tempZone=_floor.tempZone
//                           setHeatMapdata({
//                             ...heatMapData,
//                             addressPoints:tempData,
//                             rectData:tempZone,
//                             mapSubType:heatMapData.mapSubType   
//                           })
//                           break;
//                case "humidity":
//                           const humData=_floor.humLatestStatus
//                           const humZone=_floor.humZone
//                           setHeatMapdata({
//                             ...heatMapData,
//                             addressPoints:humData,
//                             rectData:humZone,
//                             mapSubType:heatMapData.mapSubType   
//                           })
//                           break;
//              }
//           // }
//       })
//     })  
//   }
  
//   useEffect(() => {
//     let sensor_type = heatMapData.mapSubType === "noise" ||heatMapData.mapSubType === "co2"||heatMapData.mapSubType === "tvoc"||heatMapData.mapSubType === "pm2_5"||heatMapData.mapSubType === "pm10" ? "AQS_sensor" : "thl_sensor"
//     setStype(sensor_type)
//     let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
//   // let type=localStorage.getItem("mapSubType").toLocaleUpperCase()
//     switch (type){
//       case "luminousity":setLuxOpen(true)
//                      break
//       case "temperature":setTempOpen(true)
//                      break
//       case "humidity":setHumOpen(true)
//                      break
//     }
//     api.floor.heatmap(props.id, type.toLocaleUpperCase()).then(res => {
//       let zoneData = [], devData = [];
//       let obj = {}, deviceObj = {};
//       // res.map(_res => {
//       //   obj = {}
//       //   obj.zone_id = _res.zone_id
//       //   obj.bound = JSON.parse(_res.bound)
//       //   obj.color = _res.color
//       //   zoneData.push(obj)
//       //   _res.device.map(_device => {
//       //     deviceObj = {}
//       //     deviceObj.id = _device.uuid
//       //     deviceObj.name = _device.name
//       //     deviceObj.value = _device.param_value
//       //     deviceObj.coordinates = JSON.parse(_device.coordinates)
//       //     devData.push(deviceObj)
//       //   })
//       // })
//       res.map(_res=>{
//         obj={}
//         obj.zone_id=_res.id
//         obj.bound=JSON.parse(_res.coordinates)
//         obj.color=_res.color
//         obj.value=_res.value
//         zoneData.push(obj)
//         _res.devices.map(_device => {
//               deviceObj = {}
//               deviceObj.id = _device.ssid
//               deviceObj.name = _device.ss_name
//               deviceObj.type=_device.name
//               deviceObj.value = _device.param_value
//               deviceObj.coordinates = JSON.parse(_device.coordinates)
//               devData.push(deviceObj)
//             })
//       })
//       setHeatMapdata({
//         ...heatMapData,
//         rectData: zoneData,
//         addressPoints: devData,
//         mapSubType:type
//       })
//     })
// },[]);

// const getDataIconClick =(type)=>{
 
//   fetch('/material-dashboard-react/data.json'
//   , {
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     }
//   }
// )
//   .then(async function (response) {
//     return response.json();
//   })
//   .then(async function (myJson) {
//     const floorsList =myJson.buildings[0].floors;
//     floorsList.map(_floor=>{
//         // if(_floor.id===localStorage.floorID){
//            switch(type){
//              case "temperature":
//                         const tempData=_floor.tempLatestStatus
//                         const tempZone=_floor.tempZone
//                         setHeatMapdata({
//                           ...heatMapData,
//                           addressPoints:tempData,
//                           rectData:tempZone,
//                           mapSubType:type  
//                         })
//                         break;
//              case "humidity":
//                         const humData=_floor.humLatestStatus
//                         const humZone=_floor.humZone
//                         setHeatMapdata({
//                           ...heatMapData,
//                           addressPoints:humData,
//                           rectData:humZone,
//                           mapSubType:type  
//                         })
//                         break;
//              case "luminousity":
//                             const lumData=_floor.lumLatestStatus
//                             const lumZone=_floor.lumZone
//                             setHeatMapdata({
//                               ...heatMapData,
//                               addressPoints:lumData,
//                               rectData:lumZone,
//                               mapSubType:type  
//                             })
//                             break;
//              case "noise":
//                               const noiseData=_floor.noiseLatestStatus
//                               const noiseZone=_floor.noiseZone
//                               setHeatMapdata({
//                                 ...heatMapData,
//                                 addressPoints:noiseData,
//                                 rectData:noiseZone,
//                                 mapSubType:type  
//                               })
//                               break;
//               case "co2":
//                                 const co2Data=_floor.co2LatestStatus
//                                 const co2Zone=_floor.co2Zone
//                                 setHeatMapdata({
//                                   ...heatMapData,
//                                   addressPoints:co2Data,
//                                   rectData:co2Zone,
//                                   mapSubType:type  
//                                 })
//                                 break;
//                case "tvoc":
//                             const tvocData=_floor.tvocLatestStatus
//                             const tvocZone=_floor.tvocZone
//                             setHeatMapdata({
//                               ...heatMapData,
//                               addressPoints:tvocData,
//                               rectData:tvocZone,
//                               mapSubType:type  
//                             })
//                             break;
//                case "pm2_5":
//                               const pm2_5Data=_floor.pm2_5LatestStatus
//                               const pm2_5Zone=_floor.pm2_5Zone
//                               setHeatMapdata({
//                                 ...heatMapData,
//                                 addressPoints:pm2_5Data,
//                                 rectData:pm2_5Zone,
//                                 mapSubType:type  
//                               })
//                               break;
//                case"pm10":
//                           const pm10Data=_floor.pm10LatestStatus
//                           const pm10Zone=_floor.pm10Zone
//                           setHeatMapdata({
//                             ...heatMapData,
//                             addressPoints:pm10Data,
//                             rectData:pm10Zone,
//                             mapSubType:type  
//                           })
//                           break;    

//            }
//         // }
//     })
//   })  

// }


// const onIconClick = (sub_type) => {
//   let sensor_type = sub_type === "noise" ||sub_type === "co2"||sub_type === "tvoc"||sub_type === "pm2_5"||sub_type === "pm10" ? "AQS_sensor" : "thl_sensor"
//   setStype(sensor_type)
//   let type = sub_type === "aqi" ? "all" : sub_type
//   api.floor.heatmap(props.id, type.toLocaleUpperCase()).then(res => {
//     let zoneData = [], devData = [];
//     let obj = {}, deviceObj = {};
//     // res.map(_res => {
//     //   obj = {}
//     //   obj.zone_id = _res.zone_id
//     //   obj.bound = JSON.parse(_res.bound)
//     //   obj.color = _res.color
//     //   zoneData.push(obj)
//     //   _res.device.map(_device => {
//     //     deviceObj = {}
//     //     deviceObj.id = _device.uuid
//     //     deviceObj.name = _device.name
//     //     deviceObj.value = _device.param_value
//     //     deviceObj.coordinates = JSON.parse(_device.coordinates)
//     //     devData.push(deviceObj)
//     //     console.log("devdata=========",devData)
//     //   })
//     // })
//     res.map(_res=>{
//       obj={}
//       obj.zone_id=_res.id
//       obj.bound=JSON.parse(_res.coordinates)
//       obj.color=_res.color
//       obj.value=_res.value
//       zoneData.push(obj)
//       _res.devices.map(_device => {
//             deviceObj = {}
//             deviceObj.id = _device.ssid
//             deviceObj.name = _device.ss_name
//             deviceObj.value = _device.param_value
//             deviceObj.coordinates = JSON.parse(_device.coordinates)
//             devData.push(deviceObj)
//           })
//     })
//     setHeatMapdata({
//       ...heatMapData,
//       rectData: zoneData,
//       addressPoints: devData
//     })
//   })
//   switch (sub_type){
//     case "temperature":
//                       setTempOpen(true)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case "humidity":
//                       setTempOpen(false)
//                       setHumOpen(true)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case  "luminousity":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(true)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case "tvoc":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(true)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case "pm10":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(true)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case "pm2_5":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(true)
//                       setCo2Open(false)
//                       setNoiseOpen(false)
//                       break;
//     case "co2":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(true)
//                       setNoiseOpen(false)
//                       break;
//     case "noise":
//                       setTempOpen(false)
//                       setHumOpen(false)
//                       setLuxOpen(false)
//                       setTvocOpen(false)
//                       setPm10Open(false)
//                       setPm2_5Open(false)
//                       setCo2Open(false)
//                       setNoiseOpen(true)
//                       break;
//   }
// } 

// const handleTHLClick = (value, callback) => {
//   // let sensor_type = "damper_position"
//   let deviceID = value.id
//   let param=value.data[0].name
//   let xData = [], yData = [], minVal = 0, maxVal = 0;
//   let resData=[]
//   let type="damper_position"
//   //setMapSubType(value.maptype)
//   // let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
//  if(process.env.REACT_APP_ENVIRONMENT=='cloud'){
//   fetch('/material-dashboard-react/data.json'
//   , {
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     }
//   }
// )
//   .then(async function (response) {
//     return response.json();
//   })
//   .then(async function (myJson) {
//     const floorsList =myJson.buildings[0].floors;
//     floorsList.map(_floor=>{
//         if(_floor.id===localStorage.floorID){
//           switch(type){
//             case "damper_position":
//               const tempData=_floor.tempLatestStatus
//               tempData.map(_temp=>{
//                 if(_temp.deviceId===deviceID){
//                       resData=_temp.last24hrData
//                 }
//               })  
//             break;
//           }
//         }
//       }) 
    

//   xData = resData._24hrData.map(item => {
//     // let date = item.time
//       // let formattedDate = moment(date).format("MM-DD HH:mm");
//       // return formattedDate
//       return new Date(item.time).getTime()
//   })
//   yData = resData._24hrData.map(item => {
//     return parseFloat(item.value) 
//   })
//   console.log(yData)
//   minVal = resData.min
//   maxVal = resData.max 
// })
// fetch('/material-dashboard-react/data.json'
//   , {
//     headers: {
//       'Content-Type': 'application/json',
//       'Accept': 'application/json'
//     }
//   }
// )
//   .then(async function (response) {
//     return response.json();
//   })
//   .then(async function (myJson) {
//   setConfigValues({
//     ...configValues,
//     minTemp:JSON.parse(myJson.configuration[0].temperature).min,
//     maxTemp: JSON.parse(myJson.configuration[0].temperature).max,
//     minHum: JSON.parse(myJson.configuration[0].humidity).min,
//     maxHum: JSON.parse(myJson.configuration[0].humidity).max,
//     minLux: JSON.parse(myJson.configuration[0].lux).min,
//     maxLux: JSON.parse(myJson.configuration[0].lux).max,
//     minAQI: "200",
//     maxAQI: "2000"
   
//   })
// })

//  }
//   else {
//     // console.log("------------------------",value)
//     // setparatype(value.type)
//     api.floor.sensorChartData(deviceID,param).then(resData => {
//       xData = resData.map(item => {
//         return  item.measured_time
//       })
//       yData = resData.map(item => {
//         return parseFloat(item.param_value) 
//       })
//       setChartData({
//             x: xData,
//             y: yData
//           }) 
//     })
// }
//   setTimeout(() => {
//     setChartData({
//       x: xData,
//       y: yData,
     
//     }) 
//     // setMinMaxData({
//     //   [heatMapData.mapSubType]: {
//     //     ...heatMapData.mapSubType, min: minVal, max: maxVal
//     //   }
//     // })
//   }, 3000);

// };

//   const floorMap = ("https://localhost/Floor-1.jpg")


//   const getThresholdValues = () => {
//    if(process.env.REACT_APP_ENVIRONMENT!='cloud')
//    {
//     fetch('/material-dashboard-react/data.json'
//     , {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       }
//     }
//    )
//     .then(async function (response) {
//       return response.json();
//     })
//     .then(async function (myJson) {
//     setConfigValues({
//       ...configValues,
//       minTemp:JSON.parse(myJson.configuration[0].temperature).min,
//       maxTemp: JSON.parse(myJson.configuration[0].temperature).max,
//       minHum: JSON.parse(myJson.configuration[0].humidity).min,
//       maxHum: JSON.parse(myJson.configuration[0].humidity).max,
//       minLux: JSON.parse(myJson.configuration[0].lux).min,
//       maxLux: JSON.parse(myJson.configuration[0].lux).max,
//       minAQI: "200",
//       maxAQI: "2000"
//     })
//    })
//    }
//     else{
//     api.config_control.getConfigDetails()
//       .then(res => {
//         setConfigValues({
//           ...configValues,
//           minTemp: res.temperature.min,
//           maxTemp: res.temperature.max,
//           minHum: res.humidity.min,
//           maxHum: res.humidity.max,
//           minLux: res.lux.min,
//           maxLux: res.lux.max,
//           minAQI: "20",
//           maxAQI: "2000"
//         })
//       })
//     }
//   }

//   const popupContent = {
//     textAlign: "center",
//     display: 'flex',
//     flexDirection: 'column',
//     minHeight: "360px",
//     marginTop: "10px"
//   };

//   const iconDevice = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/sensor-icon.png'),
//     iconRetinaUrl: require('../../assets/img/sensor-icon.png'),
//     iconSize: new Leaflet.Point(16, 16),
//     className: 'leaflet-div-icon-2'
//   });

//   const resetZoom = () => {
//     mapRef.current.leafletElement.setZoom(0)
//   }

//   const zoomOut = () => {
//     setZoomed(false)
//   }

//   const hoveredStyle = {
//     cursor: 'initial'
//   }

 
 

//   return (
//     <div>
//       {!zoomed ? 
//         <div>
//           <Grid container alignItems="center" justify="center" spacing={3}>
//             <Grid item>
//               <TooltipCore title="Temperature"
//                            PopperProps={{
//                             disablePortal: true,
//                           }}
//                           open={tempOpen}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 {/* <IconButton onClick={() => setMapSubType("temperature")}> */}
//                 <IconButton onClick={() => onIconClick("temperature")} color={'red'}>
//                   <Avatar alt="temp" src={tempAvatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="Humidity"
//                            PopperProps={{
//                             disablePortal: true,
//                           }}
                         
//                           open={humOpen}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 {/* <IconButton onClick={(e) => {e.preventDefault(); setMapSubType("humidity")}}> */}
//                 {/* <IconButton onClick={() => setMapSubType("humidity")}> */}
//                 <IconButton onClick={() => onIconClick("humidity")}>
//                   <Avatar alt="humidity" src={humidityAvatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid> 
//             <Grid item>
//               <TooltipCore title="Luminosity"
//                           PopperProps={{
//                                      disablePortal: true,
//                           }}
//                           open={luxOpen}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 <IconButton onClick={() => onIconClick("luminousity")}>
//                   <Avatar alt="luminousity" src={luxAvatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="CO2"
//                PopperProps={{
//                             disablePortal: true,
//                           }}
                         
//                           open={co2Open}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 <IconButton onClick={() => onIconClick("co2")}>
//                   <Avatar alt="co2" src={co2Avatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="TVOC"
//                PopperProps={{
//                             disablePortal: true,
//                           }} 
//                           open={tvocOpen}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 <IconButton onClick={() => onIconClick("tvoc")}>
//                   <Avatar alt="tvoc" src={tvocAvatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="PM2.5"
//                            PopperProps={{
//                             disablePortal: true,
//                           }}
                         
//                           open={pm2_5Open}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 <IconButton onClick={() => onIconClick("pm2_5")}>
//                   <Avatar alt="pm2.5" src={pm25Avatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="PM10"
//                            PopperProps={{
//                             disablePortal: true,
//                           }}
                         
//                           open={pm10Open}
//                           disableFocusListener
//                           disableHoverListener
//                           disableTouchListener>
//                 <IconButton onClick={() => onIconClick("pm10")}>
//                   <Avatar alt="pm10" src={pm10Avatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>
//             <Grid item>
//               <TooltipCore title="Noise"
//                              PopperProps={{
//                               disablePortal: true,
//                             }}
                           
//                             open={noiseOpen}
//                             disableFocusListener
//                             disableHoverListener
//                             disableTouchListener>
//                 <IconButton onClick={() => onIconClick("noise")}>
//                   <Avatar alt="noise" src={noiseAvatar} />
//                 </IconButton>
//               </TooltipCore>
//             </Grid>

//           </Grid>
          
//           <Grid container spacing={2} direction="column" alignItems="center">
//           <Grid item>
//             <Grid container spacing={1} direction="row" alignItems="center">
//               <Grid item>
//                 {/* <GridContainer> */}
//                 <GridItem xs={8} sm={6} md={2} lg={3}>
//                   {/* <Tooltip title="Refresh"> */}
//                   {/* <FMGLarage type={mapSubType} /> */}
//                   <Card
//                     className={classes.card}
//                   >
//                   <IconButton
//                       className={classes.refreshIcon}
//                       style={{ maxWidth: '22px', maxHeight: '22px', minHeight: '22px' }}
//                       variant="contained"
//                       color='white'
//                       onClick={() => resetZoom()}
//                     >
//                     <Refresh />
//                   </IconButton>
//                 </Card>
//                 <div className={classes.map}>
//                 <Map
//                   ref={mapRef}
//                   doubleClickZoom={false}
//                   zoomControl={true}
//                   dragging={true}
//                   scrollWheelZoom={false}
//                   // className={"floor-map"}
//                   crs={Leaflet.CRS.Simple}
//                   center={[0, 0]}
//                   // bounds={[[0, 0], [950, 800]]}
//                   bounds={[[0, 0], [414, 843]]}
//                   className={classes.bounds}
//                   // style={{ width: "790px", height: "430px" }}
//                   onClick={(e) => {
//                     // console.log(e)
//                     console.log({ x: e.latlng.lat, y: e.latlng.lng })
//                   }}
//                 >
//                     {
//                         heatMapData.rectData.map((each)=>
//                         <Rectangle bounds={each.bound} fillColor={each.color} fillOpacity={0.7} />
//                         )
//                       }
                  
//                   <ImageOverlay
//                     interactive
//                     url={'https://localhost/'+localStorage.floorName+'.jpg'}
//                     // className={classes.bounds}
//                     // bounds={[[0, 0], [950, 800]]}
//                     bounds={[[0, 0], [414, 843]]}
//                   // className={classes.images}
//                   />
//                   {/* {m => mapSubType !== 'aqi' ? handleColor(parseFloat(m.data[mapSubType].value)) : ""} */}
//                   {heatMapData.addressPoints.map((value)=>
//                   <HeatmapLayer
//                     radius={5}
//                     max={heatmapConf[heatMapData.mapSubType].maxIntensity}
//                     minOpacity={0.4}
//                     blur={19}
//                     maxZoom={0.5}
//                     points={[value]}
//                     // gradient={{ 1.0:value.color}}
//                     latitudeExtractor={m => m.coordinates[0]}
//                     longitudeExtractor={m => m.coordinates[1]}
//                     intensityExtractor={m =>heatMapData.mapSubType !== 'aqi' ? parseFloat(m.value) : ""}
//                     />
//                   )}
//                   {heatMapData.mapSubType !== 'aqi' &&
//                    heatMapData.addressPoints ? heatMapData.addressPoints.map((value1, index) =>
//                       <Marker key={index}
//                         position={[value1.coordinates[0], value1.coordinates[1]]}
//                         onclick={() =>
//                           handleTHLClick(value1)}
//                         icon={iconDevice}
//                       >
//                         <Popup>
//                           <div style={popupContent}>
//                             <div >
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }}> Device Name- {value1.deviceName}</Typography>
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }}> Current Value- {Math.round(value1.value * 100) / 100 + ' ' + heatmapConf[heatMapData.mapSubType].format}</Typography>
//                             </div>
//                             <div>
//                               {/* <Typography style={{ fontSize: 16 }} variant="subtitle2">Min-{configValues.minTemp}{heatmapConf[heatMapData.mapSubType].format}</Typography>
//                               <Typography style={{ fontSize: 16 }} variant="subtitle2">Max-{configValues.maxTemp}{heatmapConf[heatMapData.mapSubType].format}</Typography> */}
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }} variant="subtitle2">Min-{minMaxData[heatMapData.mapSubType].min}{heatmapConf[heatMapData.mapSubType].format}</Typography>
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }} variant="subtitle2">Max-{minMaxData[heatMapData.mapSubType].max}{heatmapConf[heatMapData.mapSubType].format}</Typography>
//                               <a style={{marginLeft: "80%"}} onClick={() => setZoomed(true)}>Zoom-In</a>
//                               <LineChart parameter={heatMapData.mapSubType} unit={heatmapConf[heatMapData.mapSubType].format} data={chartData} configValues={configValues} minMaxData={minMaxData} />
//                             </div>
//                           </div>
//                         </Popup>
//                         <Tooltip opacity={1} sticky>
//                           {value1.name} : {Math.round(value1.value * 100) / 100 + ' ' + heatmapConf[heatMapData.mapSubType].format}
//                         </Tooltip>
//                       </Marker>
//                     ) : ''}
//                 </Map>
//                 </div>
//               </GridItem>
//             </Grid>
//           </Grid>
//           </Grid>
//           <Grid item>
//             <Grid container spacing={1} direction="row" justify="center" alignItems="center">
//               <Grid item>
//                 <FormControlLabel 
//                   control={<Button style={{backgroundColor:"#00ff00",borderRadius:"50%",transform:"scale(.3)",height:"4em"}}/>}
//                   label="Good"
//                   style={{color: "#373737", fontFamily: 'BwSeidoRound-Regular'}}
//                 />
//               </Grid>
//               <Grid item>
//                 <FormControlLabel 
//                   control={<Button style={{backgroundColor:"#ffff00",borderRadius:"50%",transform:"scale(.3)",height:"4em"}}/>}
//                   label="Average"
//                   style={{color: "#373737", fontFamily: 'BwSeidoRound-Regular'}}
//                 />
//               </Grid>
//               <Grid item>
//                 <FormControlLabel 
//                   control={<Button style={{backgroundColor:"#EB0F2C",borderRadius:"50%",transform:"scale(.3)",height:"4em"}}/>}
//                   label="Poor"
//                   style={{color: "#373737", fontFamily: 'BwSeidoRound-Regular'}}
//                 />
//               </Grid>
//                 {/* <span className={classes.legendSpanStyle}><b>{props.minValue}</b></span>
//                 {props.type==="temperature"? <div className={classes.temperature}/>: props.type==="humidity"?<div className={classes.humidity}/>:props.type==="luminousity"?<div className={classes.legend}/>:
//                 props.type ==="co2"||props.type ==="pm2_5"||props.type ==="pm10"||props.type ==="noise"||props.type ==="tvoc"?<div className={classes.aqi}/>:<div className={classes.legend}/>
//                 }
//                 <span style={{ float: "left", marginLeft: "10px" }}><b>{props.maxValue}</b></span> */}
//               </Grid>
//           </Grid>
//         </Grid>
//         </div>
//       :
//       <TimeSeriesChart data={chartData} unit={heatmapConf[heatMapData.mapSubType].format} configValues={configValues} parameter={heatMapData.mapSubType} zoomOut={zoomOut} />
//       }
//     </div>
//   )
// }

// export default HeatmapComponent;