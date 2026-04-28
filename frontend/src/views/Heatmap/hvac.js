// import React, {useRef, useEffect,useState } from 'react';
// import { Map, ImageOverlay, Marker, Popup, Tooltip,Circle,Rectangle,FeatureGroup,Polygon } from 'react-leaflet';
// import HeatmapLayer from 'react-leaflet-heatmap-layer';
// import 'leaflet/dist/leaflet.css';
// import "../../assets/css/leaflet.css";
// import api from '../../api';
// import { Grid, Typography, Card, Avatar, Tooltip as TooltipCore, FormControlLabel ,Menu, MenuItem,FormControl,TextField, Box} from '@material-ui/core';
// // import Button from '@material-ui/core/Button';
// import Button from "components/CustomButtons/Button.js";
// import { withStyles, makeStyles } from '@material-ui/core/styles';
// import { purple, blue, yellow, pink } from '@material-ui/core/colors';
// import LineChart from '../LineChart';
// // import TimeSeries1 from '../TimeSeries1';
// import MultiLineChart from '../MultiLineChart';
// import moment from 'moment';
// import GridItem from 'components/Grid/GridItem.js';
// import IconButton from '@material-ui/core/IconButton'
// import Refresh from '@material-ui/icons/Refresh';
// import FMGLarage from './FloorMapGenerator01.js';
// import tempAvatar from "assets/img/sensor-icon.png";
// import humidityAvatar from "assets/img/dashboard-icons/humidity.png";
// import luxAvatar from "assets/img/dashboard-icons/lux.png";
// import noiseAvatar from "assets/img/dashboard-icons/noise.png";
// import energyAvatar from "assets/img/dashboard-icons/energy.png";
// import co2Avatar from "assets/img/dashboard-icons/co2.png";
// import tvocAvatar from "assets/img/dashboard-icons/tvoc.png";
// import pm25Avatar from "assets/img/dashboard-icons/pm25.png";
// import pm10Avatar from "assets/img/dashboard-icons/pm10.png";
// import TimeSeriesChart from "../TimeSeriesChart.js";
// import zonal_damper from "assets/img/dashboard-icons/Damper_1_Open.png";
// import VAV_damper from "assets/img/dashboard-icons/VAV.png";
// import AHU_damper from "assets/img/dashboard-icons/AHU.png";
// import Checkbox from "@material-ui/core/Checkbox";
// import Check from "@material-ui/icons/Check";
// import { id } from 'date-fns/locale';
// import { CardContent } from 'semantic-ui-react';
// import Autocomplete from '@material-ui/lab/Autocomplete';
// import DevicetrendChart from 'views/DevicetrendChart';
// const Leaflet = require('leaflet');
// const top100Films = [
//   { name: 'Fan_motor speed' },
//   { name: 'supply_air_flow' }
// ];

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
//   },
//   textField:{
//     marginLeft: theme.spacing(1),
//     marginRight: theme.spacing(1),
//     width: '25ch',
//   }
// }));

// const heatmapConf = {
//   temperature: {
//     format: "℃",
//     maxIntensity: 25,
//   },
  
//   damper_position: {
//     format: "%",
//     maxIntensity: 74,
//   }
// }
// function getTableData(myinput = [], param_map = {}) {

//   // var param_map = { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On/off', "mode": 'VFD mode Ramp up / down', "ahu_vfd_mode": 'VFD Mode Auto/Manual', "ahu_run_status": 'AHU Run status On/off', "ahu_set_point": 'T Set Point Deg C', "ahu_in_air_temperature": 'RAT Deg C', "ahu_supply_air_temperature": 'SAT Deg C', "ahu_chilled_valve": 'ChW valve %', "ahu_trip_status": 'Trip status On/off', "ahu_filter_status": 'Filter status Off=clean' };

  
//   var myoutput = [], odata = [];
  
//   var param_ids = {}, output_ids = {}, i = 0, j = 0;
  
//   var params = Object.keys(param_map);
  
//   params.forEach((key, index) => {
  
//   param_ids[key] = i++;
  
//   });
  
//   for (i = 0; i < myinput.length; i++) {
  
//   if (output_ids[myinput[i]["id"]] === undefined) {
  
//   odata = [];
  
//   for (j = 0; j < params.length; j++) {
  
//   odata[j] = '---';
  
//   }
//   odata[params['location']] = param_map['location'];
  
//   odata[params['ahu_id']] = myinput[i]["name"];
  
//   output_ids[myinput[i]["id"]] = myoutput.push(odata) - 1;
  
//   } else {
  
//   myoutput[output_ids[myinput[i]["id"]]][param_ids[myinput[i]["param_id"]]] = myinput[i]["param_value"];
  
//   }
  
//   }
//   return myoutput;
  
//   }

// function HeatmapComponent(props) {
  

//   const imgRef = useRef(null);

//   const[heatMapData,setHeatMapdata]=useState({
//      rectData:[],
//      addressPoints:[],
//      mapSubType:"damper_position"
//   })
//   const [isChecked, setIsChecked] = useState(false);

  
//   const [stype,setStype]=useState('')
//   const classes = useStyles();
//   const mapRef = React.createRef()
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
//   const [paratype,setparatype]=useState()
//   const [ahuData,setAhuData]=useState([["GrayLinx",1234,"On","Up","Auto","Off",25,27,20,85,"Off","Clean"],["GrayLinx",1234,"On","Up","Auto","Off",25,27,20,85,"Off","Clean"]]);

//   const [chartData, setChartData] = useState({
//     x: ["1:00", "2:00", "3:00", "4:00", "5:00", "6:00", "7:00", "8:00", "9:00", "10:00", "11:00", "12:00"],
//     y: [25, 15, 27, 27, 30, 27, 28, 25, 27, 18, 25, 20],
//     min: 15,
//     max: 20
//   })

//   // const trends={
//   //     [
//   //       { 
//   //         type="sat",
//   //         actual: [24],
//   //         y: [25, 15, 27, 27, 30, 27, 28, 25, 27, 18, 25, 20],
//   //         min: 15,
//   //         max: 20
//   //       }
//   //     ]
//   // }

  
  

  
  
//   useEffect(() => {
//     let sensor_type = "damper_position"
//     let type = "damper_position"
//     setStype(sensor_type)  
//     api.floor.hvacHeatmap(localStorage.getItem("floorID"), type.toLocaleUpperCase()).then(res => {
//       let zoneData = [], devData = [];
//       let obj = {}, deviceObj = {};
//       res.map(_res => {
//         obj = {}
//         obj.zone_id = _res.zone_id
//         obj.bound = JSON.parse(_res.bound)
//         obj.color = _res.color
//         zoneData.push(obj)
//         _res.devices.map(_device => {
//           deviceObj = {}
//           deviceObj.id = _device.ssid
//           deviceObj.name= _device.ss_name
//           deviceObj.type=_device.ss_type
//           deviceObj.data=_device.parameter
//           deviceObj.coordinates = JSON.parse(_device.coordinates)
//                      var str = '';
//                     _device.parameter.forEach((ele,index)=>{
//                         str += "<div>" + ele.name + ":"+ele.param_value+"</div><br/>";
//                         deviceObj.parameter=str   
//                     })
//                     devData.push(deviceObj)
//                   })

      
//       })
//       setHeatMapdata({
//         ...heatMapData,
//         rectData: zoneData,
//         addressPoints: devData
//       });

  
//     })
//       api.floor.getAhu("d4053866-e855-4dcc-a87a-77632dd054b9").then(res => {
//         setAhuData(getTableData(res))
//      })
// },[]);

// const handleTHLClick = (value, callback) => {
//   let sensor_type = "damper_position"
//   let deviceID = value.id
//   let param=value.data[0].name
//   let xData = [], yData = [], minVal = 0, maxVal = 0;
//   let resData=[]
//   let type="damper_position"
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
//            switch(type){
//              case "damper_position":
//                         const tempData=_floor.tempLatestStatus
//                         tempData.map(_temp=>{
//                           if(_temp.deviceId===deviceID){
//                                  resData=_temp.last24hrData
//                           }
//                         })  
//                         break;
            
//            }
//         }

//     }) 
    

//   xData = resData._24hrData.map(item => {
//     // let date = item.time
//       // let formattedDate = moment(date).format("MM-DD HH:mm");
//       // return formattedDate
//       return new Date(item.time).getTime()
//   })
//   yData = resData._24hrData.map(item => {
//     return parseFloat(item.value) 
//   })
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
//     setparatype(value.type)
//   api.floor.sensorChartData(deviceID,param).then(resData => {
//     // callback(resData)
//     xData = resData.map(item => {
//       // let date = item.time
//       // let formattedDate = moment(date).format("MM-DD HH:mm");
//       // return formattedDate
//       return  item.measured_time
//     })
//     yData = resData.map(item => {
//       return parseFloat(item.param_value) 
//     })
//     // minVal = resData.min
//     // maxVal = resData.max 
//     setChartData({
//           x: xData,
//           y: yData
//         }) 
//   })
//   // api.config_control.getConfigDetails().then(res =>{
//   //   setConfigValues({
//   //     ...configValues,
//   //     minTemp: res.temperature.min,
//   //     maxTemp: res.temperature.max,
//   //     minHum: res.humidity.min,
//   //     maxHum: res.humidity.max,
//   //     minLux: res.lux.min,
//   //     maxLux: res.lux.max,
//   //     minAQI: "20",
//   //     maxAQI: "2000"
//   //   })
//   // })
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

//   const popupContent = {
//     textAlign: "center",
//     display: 'flex',
//     flexDirection: 'column',
//     minHeight: "240px",
//     marginTop: "10px"
//   };

//   const iconDevice1 = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/Damper_1_Open.png'),
//     iconRetinaUrl: require('../../assets/img/Damper_1_Open.png'),
//     iconSize: new Leaflet.Point(20, 20),
//     className: 'leaflet-div-icon-2'
//   });
//   const iconDevice2 = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/VAV.png'),
//     iconRetinaUrl: require('../../assets/img/VAV.png'),
//     iconSize: new Leaflet.Point(40, 40),
//     className: 'leaflet-div-icon-2'
//   });
//   const iconDevice3 = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/AHU.png'),
//     iconRetinaUrl: require('../../assets/img/AHU.png'),
//     iconSize: new Leaflet.Point(60, 60),
//     className: 'leaflet-div-icon-2'
//   });
//   const iconDevice4 = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/sensor-icon.png'),
//     iconRetinaUrl: require('../../assets/img/sensor-icon.png'),
//     iconSize: new Leaflet.Point(25, 25),
//     className: 'leaflet-div-icon-2'
//   });

//   const resetZoom = () => {
//     mapRef.current.leafletElement.setZoom(0)
//   }

//   const zoomOut = () => {
//     setZoomed(false)
//   }
//   const ontimeSeries = (value1) => {

    
// }

// const currencies = [
//   {
//     value: 'USD',
//     label: '$',
//   },
//   {
//     value: 'EUR',
//     label: '€',
//   },
//   {
//     value: 'BTC',
//     label: '฿',
//   },
//   {
//     value: 'JPY',
//     label: '¥',
//   },
// ];


//   return (
//     <div>
//       {!zoomed ? 
//         <div>
          
   
//           <Grid container spacing={2} direction="column" alignItems="center">
          
        
//           <Grid item>
//             <Grid container spacing={1} direction="row" alignItems="center">
//             <Grid item >
              
//               <Avatar alt="temp" src={zonal_damper}/>
//               <Typography>Zonal_damper</Typography>

//            {/* <FormControlLabel label="Zonal damper"/> */}
//         </Grid>
//         <Grid item  alignContent='center'>
          
//           <Avatar alt="temp" src={VAV_damper} />
//           <Typography>VAV_damper</Typography>
//        {/* <FormControlLabel label="Zonal damper"/> */}
//     </Grid>
//     <Grid item  alignContent='center'>
          
//           <Avatar alt="temp"  src={AHU_damper} />
//           <Typography>AHU</Typography>

//        {/* <FormControlLabel label="Zonal damper"/> */}
//     </Grid>
//     <Grid item  alignContent='center'>
          
//           <Avatar alt="temp"  src={tempAvatar} />
//           <Typography>Temperature</Typography>

//        {/* <FormControlLabel label="Zonal damper"/> */}
//     </Grid>
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
//                       // color='white'
//                       onClick={() => resetZoom()}
//                     >
//                     <Refresh />
//                   </IconButton>
//                 </Card>
//                 <div className={classes.map}>
//                 {/* <GRHA myimage="http://localhost/AHU_Graphic.png" width={600} height={273} addBoxes={true} data={ahuData}/> */}

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
//                     console.log(e)
//                     console.log({ x: e.latlng.lat, y: e.latlng.lng })
//                   }}
//                 >
                   
                  
//                   <ImageOverlay
//                     interactive
//                     url={'https://localhost/'+localStorage.floorName+'.jpg'}
//                     ref={imgRef}
//                     className={classes.bounds}
//                     bounds={[[0, 0], [414, 843]]}
                 
//                   />
                
//                   {heatMapData.mapSubType !== 'aqi' &&
//                    heatMapData.addressPoints ? heatMapData.addressPoints.map((value1, index) =>
                    
//                       <Marker key={index}
//                         position={[value1.coordinates[0], value1.coordinates[1]]}
                      
//                          icon= {(value1.type=="NONGL_SS_DAMPER") ? iconDevice1 : (value1.type=="NONGL_SS_VAV") ? iconDevice2 : (value1.type=="NONGL_SS_AHU") ?iconDevice3 : iconDevice4}
//                          onclick={() =>
//                           handleTHLClick(value1)}
//                     >
//                        <Tooltip opacity={0.9} sticky>
//                        <div  dangerouslySetInnerHTML={{ __html:value1.parameter}}/>
//                         </Tooltip>
                     
//                        <Popup>
//                           <div style={popupContent}>
//                             <div >
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }}> Device Name- {value1.name}</Typography>
//                               {value1.data.map(ele=>
//                               // <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }}>{ele.name}{ele.param_value} {value1.name==="AHU_WS" ? <input type="checkbox" id="check1" value="checked_item" /> : ""} {id==="true" ? console.log("id is ",id) : console.log("not yet checked")} 
                             
//                               value1.name==="AHU_WS" ? " " : 
//                               <Typography style={{ fontSize: 16, fontFamily: 'Helvetica' }}>{ele.name}{ele.param_value}
                               
                           
//                            </Typography> 
                           
//                            )}
//                             </div>{value1.name==="AHU_WS" ? 
//                             <div className={classes.root}>
                            
//                             <Autocomplete
//                               multiple
//                               limitTags={2}
//                               id="multiple-limit-tags"
//                               options={top100Films}
//                               getOptionLabel={(top100Films) => top100Films.name}
//                              //  defaultValue={[top100Films[13], top100Films[12], top100Films[11]]}
//                               renderInput={(params) => (
                               
//                                 <TextField {...params} variant="outlined" label="limitTags" placeholder="Select Parameters" />
//                               )}
//                             />
//                           </div>
//                         : ""}
//                             <div>
                            
//                             {value1.name==="AHU_WS" ? <a style={{marginLeft: "80%"}} onClick={() => setZoomed(true)}>zoom innn</a> : <a style={{marginLeft: "80%"}} onClick={() => setZoomed(true)}>Zoom-In</a>}
//                             {value1.name==="AHU_WS" ?                             
//                                <LineChart parameter={heatMapData.mapSubType}  data={chartData} ></LineChart>
                           
//                                   :
//                               <LineChart parameter={heatMapData.mapSubType}  data={chartData}  />
//                                 }
//                             </div>
//                           </div>
//                         </Popup>
                        
                           
                         
//                         {/* )} */}
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
               
//                                 <DevicetrendChart changeContext={props.changeContext} history={props.history} />
//               </Grid>
//           </Grid>
//         </Grid>
//         </div>
//       : (paratype=="NONGL_SS_AHU") ? " " :
//       <TimeSeriesChart data={chartData} unit={heatmapConf[heatMapData.mapSubType].format} configValues={configValues} parameter={heatMapData.mapSubType} zoomOut={zoomOut} />
//       }
//     </div>
//   )       
// }

// export default HeatmapComponent;