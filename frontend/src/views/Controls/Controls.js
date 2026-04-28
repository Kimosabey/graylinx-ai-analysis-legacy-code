// import React, { useEffect } from 'react';
// import PropTypes from 'prop-types';
// import Radio from '@material-ui/core/Radio';
// import RadioGroup from '@material-ui/core/RadioGroup';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import FormControl from '@material-ui/core/FormControl';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import {
//     Typography,
//     Tabs,
//     Tab,
//     Box,
//     CardContent,
//     Grid
// } from '@material-ui/core';
// import Snackbar from '@material-ui/core/Snackbar'
// // import Snackbar from 'components/Snackbar/Snackbar.js';
// import MuiAlert from '@material-ui/lab/Alert';
// import { green } from '@material-ui/core/colors';
// import 'rc-slider/assets/index.css';
// // import Slider, { createSliderWithTooltip } from 'rc-slider';
// import { MuiThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';
// import AppBar from '@material-ui/core/AppBar';
// import api from "../../api";
// import jwt_decode from 'jwt-decode';
// import Cookies from 'universal-cookie';
// import Button from 'components/CustomButtons/Button.js';
// import Card from 'components/Card/Card.js';
// import CardBody from 'components/Card/CardBody.js';
// import GridContainer from 'components/Grid/GridContainer.js';
// import GridItem from 'components/Grid/GridItem.js';
// import Warning from "components/Typography/Warning";
// import CardFooter from 'components/Card/CardFooter';
// import SwitchSelector from 'react-switch-selector';

// const cookies = new Cookies();
// // const SliderWithTooltip = createSliderWithTooltip(Slider);

// let masters = [], slavesArr = [], zones = [], newZones = [], devices = [];

// function TabPanel(props) {
//     const { children, value, index, ...other } = props;

//     return (
//                      <div
//                         role="tabpanel"
//                         hidden={value !== index}
//                         id={`simple-tabpanel-${index}`}
//                         aria-labelledby={`simple-tab-${index}`}
//                         {...other}
//                     >
//                         {value === index && (
//                             <Box>
//                                 <Typography>{children}</Typography>
//                             </Box>
//                         )}
//                     </div>
//     );
// }

// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

// TabPanel.propTypes = {
//     children: PropTypes.node,
//     index: PropTypes.any.isRequired,
//     value: PropTypes.any.isRequired,
// };

// const useStyles = makeStyles((theme) => ({

//     backdrop: {
//         zIndex: theme.zIndex.drawer + 1,
//         color: '#fff',
//       },
//     root: {
//         flexGrow: 1,
//         backgroundColor: theme.palette.background.paper,
//         // backgroundColor:theme.palette.action.hover
//     },
//     card:{
//         backgroundColor:theme.palette.action.hover
//     },
//     mainContainer: {
//         marginTop: 20,
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     appbar:{
//     backgroundColor:"#26c6da",
//     },
//     loader:{
//         size:"40px",
//         color:"#26c6da"
//     },
//     // grid: {
//     //     justifyContent: "center",
//     //     alignItems: "center",
//     //     marginTop: "2%",
//     //     marginLeft: "2% ",
//     // },
//     // item: {
//     //     display: 'flex',
//     //     justifyContent: 'center',
//     //     alignItems: 'center'
//     // },
    
//     sliderContainer: {
//         // display: "flex",
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         // marginRight:'32px',
//         // marginLeft:'1px',
//         minWidth: '200px',
//         // minWidth: '100px',
//         // height: "125px",
//         padding:"1%",
//         margin:'5%',
//         [theme.breakpoints.up('xl')]: {
//             minWidth: '200px',
//             height: "60px",  
//             fontSize:"25px"
//         },
//         marginTop: "2%"
//     },
//     // card: {
//     //     maxHeight: "160px",
//     //     margin: "2em",
//     //     textAlign: "center",
//     //     boxSizing: "border-box",
//     // },
//     cardContent: {
//         marginLeft: "2%",
//         display: 'flex',
//         justifyContent: "flex-start",
//         alignItems: 'center',
//     },
//     label: {
//         // maxWidth: "140px", 
//         // wordWrap: "break-word",
//         // whiteSpace:"normal",
//         // paddingLeft: "5%",
//         color:"black",
//         // margin:"2%",
//         [theme.breakpoints.up("md")]:
//         {fontWeight:"800",padding:"2%"},
//         [theme.breakpoints.down('xs')]:
//             {padding:'2%'},
//         // [theme.breakpoints.down('sm')]:
//         //     {padding:'2%',maxWidth:"30px"}
//     },
//     // name:{
//     //     maxWidth: "140px", 
//     //     wordWrap: "break-word",
//     //     whiteSpace:"normal",
//     //     paddingLeft: "5%",
//     //     color:"black",
//     //     color:"black",
//     //     [theme.breakpoints.up("md")]:
//     //     {fontWeight:"800"},
//     //     // [theme.breakpoints.down("sm")]:
//     //     // {fontWeight:"800",maxWidth:"60px"},
//     // },
//     button:{
//         borderRadius:"50%",
//         transform:"scale(1.0)",
//         height:"4em",
//         width:"1em"
//    },
//    radio:{
//     //    margin:"4px",
//        justifyContent: 'center',
//         alignItems: 'center'
//    },
//    Button:{
//         borderRadius:"50%",
//         transform:"scale(1.0)",
//         height:"4em",
//         width:"1em",
//         [theme.breakpoints.down('xs')]:
//               {marginTop:'25px'},
//         [theme.breakpoints.up('md')]:
//               {marginTop:'25px'},
//         [theme.breakpoints.up('lg')]:
//             {marginTop:'25px'}      
//    },
// }));

// const greenTheme = createMuiTheme({ palette: { primary: green } })


// export default function Controls(props) {
//     const classes = useStyles();
//     const [snackbarOpen, setSnackbarOpen] = React.useState(false)
//     const [snackbarmsg, setSnackbarmsg] = React.useState('')
//     const [snackbarseverity, setSnackbarseverity] = React.useState("")
//     const [selectedChannel, setSelectedChannel] = React.useState('')
//     const [activeItem, setActiveItem] = React.useState(0)
//     const [items, setItems] = React.useState([])
//     let   [sliderValue, setSliderValue] = React.useState('')
//     const [loading, setLoading] = React.useState(false)
//     const [luxStatus, setLuxStatus] = React.useState(new Map())
//     function a11yProps(index) {
//         return {
//             id: `simple-tab-${index}`,
//             'aria-controls': `simple-tabpanel-${index}`,
//         };
//     }
//     const options = [
//         {
//             label:"ON",
//             value: "on",
//             selectedBackgroundColor: "#4caf50"
//         },
//         {
//             label: "OFF",
//             value: "off",
//             selectedBackgroundColor: "#e91e63"
//         },
//         {
//             label: "Auto",
//             value: "auto",
//             selectedBackgroundColor: "#999"
//         }
//      ];
      
//      const onvalue = (newValue,res) => {
//          if( newValue === "on"){
//              submit(res,1,100)
//          } else if (newValue === "off"){
//              submit(res, 0, 0)
//          } else {
//              submit(res, 4, 0)
//          }
//      };
      
//     const initialSelectedIndex = options.findIndex(({value}) => value === "auto");
//     const snackbarClose = (event) => {
//         setSnackbarOpen(false)
//     }

//     const submit = (res, value, intensity) => {
//         const token = jwt_decode(cookies.get('token'))
//         const user = {
//             id: token.userId,
//             name: token.username
//         }
//         let req = {}, channel;
//         let msg = '';
//         switch (value) {
//             case 1: msg = 'switched ON'; break;
//             case 0: msg = 'switched OFF'; break;
//             case 4: msg = 'switched to Auto mode'; break;
//             default: msg = 'set to intensity ' + intensity; break;
//         }
//         switch (selectedChannel.split("_")[0]) {
//             case 'channel1': channel = 1; break;
//             case 'channel2': channel = 2; break;
//             case 'channel0': channel = 0; break;
//             default: break;
//         }
//         if (activeItem === 2) {
//             if (selectedChannel.includes(res.id)) {
//                 setLoading(true)
//                 req = {
//                     zone: res.zone,
//                     WAC: {
//                         mode: (value === 4) ? "auto" : "manual",
//                         intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                         wac: [{
//                             macId: res.id,
//                             channel: channel
//                         }]
//                     }
//                 }
//                 api.controls.controlLights(req, user).then(result => {
//                     setLoading(true)
//                     if (process.env.REACT_APP_ENVIRONMENT=='cloud' && result && result.message && result.message === "success") {
//                         setLoading(true)
//                         let count = 0;
//                         const interval = setInterval(() => {
//                             count++;
//                             api.controls.controldata().then(result=>{
//                                 if(result.results[0].status==="Success"){
//                                     setLoading(false)
//                                     setSnackbarOpen(true)
//                                     setSnackbarseverity("success")
//                                     setSnackbarmsg('Device ' + res.name + ' successfully' + msg)
//                                     clearInterval(interval)
//                                 } else if(result.results[0].status == "Failure"){ 
//                                     setLoading(false)
//                                     setSnackbarOpen(true)
//                                     setSnackbarseverity("error")
//                                     setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                                     clearInterval(interval)
//                                 }    
//                             })
//                             if(count >= 5) {
//                                 clearInterval(interval)
//                                 setLoading(false)
//                                 setSnackbarOpen(true)
//                                 setSnackbarseverity("error")
//                                 setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                             }  
//                         }, 3000);
//                     } else if (result && result.message && result.message === "success") {
//                         setLoading(false)
//                         setSnackbarOpen(true)
//                         setSnackbarseverity("success")
//                         setSnackbarmsg('Device ' + res.name + ' successfully' + msg)
//                     } else {
//                         setLoading(false)
//                         setSnackbarOpen(true)
//                         setSnackbarseverity("error")
//                         setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                     }
//                 })
//             } else {
//                 setSnackbarOpen(true)
//                 setSnackbarseverity("error")
//                 setSnackbarmsg("Please select a channel for this device!")
//             }
//         } else if (activeItem === 0) {
//             let wac = [], dali = [];
//             setLoading(true)
//             res.master.map(_dev => {
//                 if (_dev.macId.substr(0, 4) === "50ac") {
//                     wac.push(_dev)
//                 } else {
//                     dali.push(_dev)
//                 }
//                 return;
//             })
//             req = (wac.length > 0 && dali.length > 0) ?
//                 {
//                     zone: res.id,
//                     DALI: {
//                         mode: (value === 4) ? "auto" : "manual",
//                         intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                         dali,
//                     },
//                     WAC: {
//                         mode: (value === 4) ? "auto" : "manual",
//                         intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                         wac,
//                     }
//                 } : (wac.length > 0) ? {
//                     zone: res.id,
//                     WAC: {
//                         mode: (value === 4) ? "auto" : "manual",
//                         intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                         wac,
//                     }
//                 } : {
//                         zone: res.id,
//                         DALI: {
//                             mode: (value === 4) ? "auto" : "manual",
//                             intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                             dali,
//                         }
//                     }
//             api.controls.controlLights(req, user).then(result => {
//                 setLoading(true)
//                 if (process.env.REACT_APP_ENVIRONMENT=='cloud' && result && result.message && result.message === "success") {
//                     setLoading(true)
//                     let count = 0;
//                     const interval = setInterval(() => {
//                         count++;
//                         api.controls.controldata().then(result=>{
//                             if(result.results[0].status === "Success"){
//                                 setLoading(false)
//                                 setSnackbarOpen(true)
//                                 setSnackbarseverity("success")
//                                 setSnackbarmsg(res.name + ' successfully'+ msg)
//                             } else if(result.results[0].status == "Failure") {
//                                 setLoading(false)
//                                 setSnackbarOpen(true)
//                                 setSnackbarseverity("error")
//                                 setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                             }    
//                         })
//                         if(count >= 5) {
//                             clearInterval(interval)
//                             setLoading(false)
//                             setSnackbarOpen(true)
//                             setSnackbarseverity("error")
//                             setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                         }
//                     }, 3000);

//                 } else if (result && result.message && result.message === "success") {
//                                 setLoading(false)
//                                 setSnackbarOpen(true)
//                                 setSnackbarseverity("success")
//                                 setSnackbarmsg(res.name + ' successfully'+ msg) 
//                 } else {
//                     setLoading(false)
//                     setSnackbarOpen(true)
//                     setSnackbarseverity("error")
//                     setSnackbarmsg('Failed to ' + msg + ' the zone ' + res.name)
//                 }
//             })
//         } else if (activeItem === 1) {
//             setLoading(true)
//             req = {
//                 zone: res.zone,
//                 DALI: {
//                     mode: (value === 4) ? "auto" : "manual",
//                     intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
//                     dali: res.master,
//                 }
//             }
//             api.controls.controlLights(req, user).then(result => {
//                 setLoading(true)
//                 if (process.env.REACT_APP_ENVIRONMENT=='cloud' && result && result.message && result.message === "success") {
//                     setLoading(true)
//                     let count = 0;
//                     const interval = setInterval(() => {
//                         count++;
//                         api.controls.controldata().then(result=>{
//                             if(result.results[0].status==="Success"){
//                             setLoading(false)
//                             setSnackbarOpen(true)
//                             setSnackbarseverity("success")
//                             setSnackbarmsg(res.lightName + ' successfully '+ msg)
//                             } else if(result.results[0].status == "Failure"){
//                                 // clearInterval(interval)
//                                  setLoading(false)
//                                  setSnackbarOpen(true)
//                                  setSnackbarseverity("error")
//                                  setSnackbarmsg('Failed to ' + msg + ' the light ' + res.lightName)
//                             }     
//                         })
//                         if(count >= 5) {
//                             clearInterval(interval)
//                             setLoading(false)
//                             setSnackbarOpen(true)
//                             setSnackbarseverity("error")
//                             setSnackbarmsg('Failed to ' + msg + ' the light ' + res.lightName)
//                         }
//                     }, 3000);
//                 } else if (result && result.message && result.message === "success") {
//                     setLoading(false)
//                     setSnackbarOpen(true)
//                     setSnackbarseverity("success")
//                     setSnackbarmsg(res.lightName + ' successfully '+ msg)
//                 } else {
//                     setLoading(false)
//                     setSnackbarOpen(true)
//                     setSnackbarseverity("error")
//                     setSnackbarmsg('Failed to ' + msg + ' the light ' + res.lightName)
//                 }
//             })
//         }
//     }

//     const handleChange = (event, newValue) => {
//         setActiveItem(newValue);
//         if (newValue === 0) {
//             setItems(newZones)
//         }else  if (newValue === 1) {
//             setItems(slavesArr) 
//         } else if (newValue === 2) {
//             setItems(devices)
//         }
//     };
//     const marks ={
//         0:'0%',
//         100:'100%'
//     }
//     const handleChannelChange = (e, { value }) => {
//         e.preventDefault();
//         setSelectedChannel(e.target.value);
//     }

//     useEffect(() => {
//         // api.controls.controldata().then((res =>{
//         //     setTest(res.results[0].status)
//         // }))
//         getLightsData();
//         const interval = setInterval(() => {
//             let statusArr = [], obj = {};
//             let mapObj = new Map();
//             api.floor.currentLuxStatus(localStorage.getItem("buildingID")).then(res => {
//                 res.map(_res => {
//                     mapObj.set(_res.zone_id, _res.lux)
//                 })
//                 setLuxStatus(mapObj)
//             })
//         }, 5000)
//         return () => {
//             devices = [];
//             zones = [];
//             slavesArr = [];
//             masters = [];
//             newZones = [];
//             clearInterval(interval)
//         }
//     }, [])

//     const getLightsData = () => {
//         setLoading(true)
//         const buildingId = localStorage.getItem("buildingID");
//         api.controls.lights(buildingId).then(res => {
//             setLoading(false)
//             res.lights.map(_each => {
//                 if (_each.deviceType === "GL_SS_WAC_TYPE_01") {
//                     let masterArr = [];
//                     const { master, channels } = _each;
//                     masterArr.push({ macId: master.mac, channel: 0 })
//                     let zoneObj = {
//                         "id": master.zoneId,
//                         "name": master.floorName + " - " + master.zoneName,
//                         "master": masterArr,
//                     }
//                     let deviceObj = {
//                         "id": master.mac,
//                         "name": master.name,
//                         "channel1": channels[0].dimmable,
//                         "channel2": channels[1].dimmable,
//                         "channel0": channels[0].dimmable && channels[1].dimmable,
//                         "master": {
//                             macId: master.mac
//                         },
//                         "zone": master.zoneId,
//                     }
//                     devices.push(deviceObj);
//                     zones.push(zoneObj);
//                 }
//                 if(_each.deviceType === "GL_SS_DALI_MASTER_TYPE_01") {
//                     const { master, slaves } = _each;
//                     let zoneObj = {}
//                     let slaveObj = {}
//                     slaves.map(_slave => {
//                         zoneObj = {
//                             "id": _slave.zoneId,
//                             "name": _slave.floorName+" - "+_slave.zoneName,
//                             "master": [{
//                                 macId: master.mac,
//                                 slaves: slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({mac}) => mac),
//                                 selection: "slaves"
//                             }],
//                         }
//                         slaveObj = {
//                             "id": _slave.mac,
//                             "name": master.name,
//                             "lightName": _slave.name,
//                             "zone": master.zoneId,
//                             "master": [{
//                                 macId: master.mac,
//                                 slaves: [_slave.mac],
//                                 selection: "slaves"
//                             }] 
//                         }
//                         zones.push(zoneObj);
//                         slavesArr.push(slaveObj);
//                         return;
//                     })
//                 }
//                 // if (_each.deviceType === "DALI_CONTROLLER") {
//                 //     const { master, slaves } = _each;
//                 //     let zoneObj = {}
//                 //     let slaveObj = {}
//                 //     slaves.map(_slave => {
//                 //         zoneObj = {
//                 //             "id": _slave.zoneId,
//                 //             "name": _slave.floorName + " - " + _slave.zoneName,
//                 //             "master": [{
//                 //                 macId: master.mac,
//                 //                 slaves: slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({ mac }) => mac),
//                 //                 selection: "slaves"
//                 //             }],
//                 //         }
//                 //         slaveObj = {
//                 //             "id": _slave.mac,
//                 //             "name": master.name,
//                 //             "lightName": _slave.name,
//                 //             "zone": master.zoneId,
//                 //             "master": [{
//                 //                 macId: master.mac,
//                 //                 slaves: [_slave.mac],
//                 //                 selection: "slaves"
//                 //             }]
//                 //         }
//                 //         zones.push(zoneObj);
//                 //         slavesArr.push(slaveObj);
//                 //     })
//                 // }
//                 return;
//             })
//             slavesArr = slavesArr.reduce((acc, current) => {
//                 const x = acc.find(item => item.id === current.id);
//                 if (!x) {
//                     return acc.concat([current]);
//                 } else {
//                     return acc;
//                 }
//             }, []);
//             devices = devices.reduce((acc, current) => {
//                 const x = acc.find(item => item.id === current.id);
//                 if (!x) {
//                     return acc.concat([current]);
//                 } else {
//                     return acc;
//                 }
//             }, []);
//             newZones = zones.reduce((acc, current) => {
//                 let x = acc.find(item => item.id === current.id);
//                 if (!x) {
//                     return acc.concat([current]);
//                 } else {
//                     if(x.master.map(_elem => _elem.macId).indexOf(current.master[0].macId) < 0) {
//                         x.master.push(current.master[0])
//                         acc.push([x])
//                     }
//                     return acc
//                 }
//                 }, []);
//         //    let filtered =  zones.filter((obj, index, self) => self.indexOf(obj.id) === index)
//                 setItems(newZones);
//         })
//     }

//     function percentFormatter(v) {
//         return `${v} %`;
//     }

//     return (
//          <div className={classes.root}>
//             <Snackbar 
//                 anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//                 open={snackbarOpen}
//                 autoHideDuration={3000}
//                 onClose={snackbarClose}>
//                 <Alert onClose={snackbarClose} severity={snackbarseverity} className={classes.snackbar}>
//                     {snackbarmsg}
//                 </Alert>
//             </Snackbar>
//             <GridContainer justify="center" alignItems="center">
//             <GridItem xs={12} md={12} sm={12} lg={12} xl={12}>
//                 <AppBar className={classes.appbar} position="static" >
//                     <Tabs centered value={activeItem}  onChange={handleChange} aria-label="simple tabs example" >
//                         <Tab name='zones' active={activeItem === 'zones'} label="Zone-wise Control" {...a11yProps(0)} className={classes.tabs} />
//                         <Tab name='lights' active={activeItem === 'lights'} label="Light-wise Control" {...a11yProps(1)} className={classes.tabs} />
//                         <Tab name='devices' active={activeItem === 'devices'} label="Device-wise Control" {...a11yProps(2)} className={classes.tabs}/>
//                     </Tabs>    
//                 </AppBar>  
//                 </GridItem>
//                 </GridContainer> 
//                 <TabPanel value={activeItem} index={0} >
//                     <Grid container spacing={3} justify="center" alignItems="center" >
//                         {items.map((res, i) => (
//                             <GridItem xs={12} sm={8} md={6} lg={4} xl={3}>
//                                 <Card profile className={classes.card}>
//                                     <CardBody>
//                                         <label className={classes.label}><center>{res.name}</center></label>
//                                         <div>
//                                         <Grid container direction="column" alignItems="center">
//                                         {/* <Warning hbFontStyle>Lux: {luxStatus.get(res.id)}</Warning> */}
//                                         {/* <Warning hbFontStyle>Lux: 480</Warning> */}
//                                         <div className={classes.sliderContainer}>
//                                             {/* <SliderWithTooltip
//                                                 tipFormatter={percentFormatter}
//                                                 tipProps={{ overlayClassName: 'sliderZone' }}
//                                                 min={0}
//                                                 max={100}
//                                                 step={5}
//                                                 // vertical={true}
//                                                 marks={marks}
//                                                 name={(sliderValue === undefined) ? 0 : sliderValue}
//                                                 onChange={(value) => {sliderValue = ['intensity_' + res.id]
//                                                 sliderValue = ['intensity_' + res.id]
//                                                     setSliderValue(value)
//                                                 }}
//                                                 onBeforeChange={(value) => {
//                                                     sliderValue = 'intensity_' + res.id
//                                                     setSliderValue(value)
//                                                 }}
//                                                 onAfterChange={() => { submit(res, 2, sliderValue) }}
//                                             /> */}
//                                         </div>
//                                         <div>
//                                         <Grid container alignItems="center">
//                                             <div className="your-required-wrapper" style={{width: 194, height: 30,margin:"15px"}}>   
//                                             <SwitchSelector
//                                                 onChange={(newValue)=>onvalue(newValue,res)}
//                                                 options={options}
//                                                 initialSelectedIndex={initialSelectedIndex}
//                                                 backgroundColor={"rgba(0, 0, 0, 0.04)"}
//                                                 fontColor={"#000"}
//                                                 selectedFontColor={"#000"}
//                                             />
//                                             </div>
//                                         </Grid>
//                                         </div>
//                                         {/* <div>
//                                             <Warning hbFontStyle>Lux: {luxStatus.get(res.id)}</Warning>  
//                                         </div>       */}
//                                         </Grid>    
//                                         </div>
//                                     </CardBody> 
//                                     {/* <CardFooter hbCardFooter>
//                                         <Warning hbFontStyle>Lux: {luxStatus.get(res.id)}</Warning>
//                                     </CardFooter> */}
//                                 </Card>
//                             </GridItem>
//                         ))}
//                     </Grid>
//                 </TabPanel>
//                 <TabPanel value={activeItem} index={1}>
//                     <Grid container spacing={3} justify="center" alignItems="center" >
//                     {/* <GridContainer> */}
//                         {items.map((res, i) => (
//                             <GridItem xs={12} sm={6} md={6} lg={4} xl={3}>
//                                 <Card className={classes.card}>
//                                     <CardContent>
//                                         <label className={classes.label}><center>{res.lightName}</center></label>
//                                         <div>
//                                         <Grid container direction="column" alignItems="center">
//                                         <div className={classes.sliderContainer}>
//                                             {/* <SliderWithTooltip
//                                                 tipFormatter={percentFormatter}
//                                                 tipProps={{ overlayClassName: 'sliderLights' }}
//                                                 min={0}
//                                                 max={100}
//                                                 marks={marks}
//                                                 // vertical={true}
//                                                 step={5}
//                                                 name={sliderValue}
//                                                 onChange={(value) => {
//                                                     sliderValue = ['intensity_' + res.id]
//                                                     setSliderValue(value)
//                                                 }}
//                                                 onBeforeChange={(value) => {
//                                                     sliderValue = 'intensity_' + res.id
//                                                     setSliderValue(value)
//                                                 }}
//                                                 onAfterChange={() => { submit(res, 2, sliderValue) }}
//                                             /> */}
//                                         </div>
//                                             <div>
//                                               <Grid container spacing={3} direction="column">
//                                         <div className="your-required-wrapper" style={{width: 200, height: 30,margin:"23px"}}>   
//                                             <SwitchSelector
//                                                onChange={(newValue)=>onvalue(newValue,res)}
//                                                 options={options}
//                                                 initialSelectedIndex={initialSelectedIndex}
//                                                 backgroundColor={"rgba(0, 0, 0, 0.04)"}
//                                                 fontColor={"#000"}
//                                                 selectedFontColor={"#000"}
//                                             />
//                                         </div>
//                                         </Grid>
//                                         </div>
//                                         </Grid>
//                                         </div>
//                                     </CardContent>
//                                 </Card>
//                             </GridItem>
//                         ))}
//                     </Grid>
//                 </TabPanel>
//                 <TabPanel value={activeItem} index={2} >
//                     <Grid container spacing={3} justify="center" alignItems="center" >
//                         {items.map((res, i) => (
//                             <GridItem xs={12} sm={6} md={6} lg={4}>
//                                 <Card className={classes.card}>
//                                     <CardContent>
//                                         <label className={classes.label}><center>{res.name}</center></label>
//                                         <div>
//                                         <Grid container direction="column" alignItems="center">
//                                         <div className={classes.sliderContainer}>
//                                             {/* <div style={{ "width": "90%", "marginHorizonatal": "5%", "marginBottom": "7%" }}> */}
//                                                 {/* <SliderWithTooltip
//                                                     tipFormatter={percentFormatter}
//                                                     tipProps={{ overlayClassName: 'sliderLights' }}
//                                                     min={0}
//                                                     max={100}
//                                                     marks={marks}
//                                                     // vertical={true}
//                                                     step={(res[selectedChannel.split("_")[0]] === true) ? 5 : 100}
//                                                     name={'intensity_' + res.id}
//                                                     onChange={(value) => {
//                                                         sliderValue = ['intensity_' + res.id]
//                                                         setSliderValue(value)
//                                                     }}
//                                                     onBeforeChange={(value) => {
//                                                         sliderValue = 'intensity_' + res.id
//                                                         setSliderValue(value)
//                                                     }}
//                                                     onAfterChange={() => { submit(res, 2, sliderValue) }}
//                                                 /> */}
//                                             {/* </div> */}
//                                             </div>
//                                             <div> 
//                                               <Grid container spacing={3} direction="column">
//                                                 <div className="your-required-wrapper" style={{width: 200, height: 30,margin:"25px"}}>   
//                                                     <SwitchSelector
//                                                        onChange={(newValue)=>onvalue(newValue,res)}
//                                                         options={options}
//                                                         initialSelectedIndex={initialSelectedIndex}
//                                                         backgroundColor={"rgba(0, 0, 0, 0.04)"}
//                                                         fontColor={"#000"}
//                                                         selectedFontColor={"#000"}
//                                                     />
//                                                 </div>
//                                               </Grid>
//                                             </div> 
//                                      </Grid>
//                                      </div>   
//                                     </CardContent>
//                                     <div>
//                                         <Grid container justify="center" alignItems="center">
//                                             <FormControl component="fieldset">
//                                             <RadioGroup row aria-label="position" name="position"  >
//                                                 <Grid container spacing={3} justify="center" alignItems="center" >
//                                                     <FormControlLabel onChange={handleChannelChange} value={'channel1_' + res.id} checked={'channel1_'+res.id === selectedChannel} control={<Radio color="primary" />} label="Channel 1" />
//                                                     <FormControlLabel onChange={handleChannelChange} value={'channel2_' + res.id} checked={'channel2_'+res.id === selectedChannel} control={<Radio color="primary" />} label="Channel 2" />
//                                                     <FormControlLabel onChange={handleChannelChange} value={'channel0_' + res.id} checked={'channel0_'+res.id === selectedChannel} control={<Radio color="primary" />} label="Both Channels" />
//                                                 </Grid>   
//                                             </RadioGroup>
//                                             </FormControl>
//                                         </Grid>    
//                                     </div>
//                                 </Card>
//                             </GridItem>
//                         ))}
//                     </Grid>
//                 </TabPanel>
//                 { loading === false ? null : <Backdrop className={classes.backdrop} open>
//                     <CircularProgress color="inherit" className={classes.loader} />
//                 </Backdrop>}
//         </div>
//     )
// }

