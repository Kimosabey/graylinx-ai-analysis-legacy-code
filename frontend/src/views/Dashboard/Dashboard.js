// import React, { useState, useEffect } from "react";
// // @material-ui/core
// import { makeStyles } from "@material-ui/core/styles";
// import Icon from "@material-ui/core/Icon";
// import {useHistory} from 'react-router-dom';
// // core components
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardFooter from "components/Card/CardFooter.js";
// import ImageMapper from "react-image-mapper";
// import Floors from "../Floors/Floors.js";
// import Heatmap from "../Heatmap/HeatmapComponent.js";
// import TimeSeriesChart from "../TimeSeriesChart.js";
// import Button from "components/CustomButtons/Button.js";
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import api from "../../api"

// // import FloorImg from "../../assets/img/fo.jpg"
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import { Paper } from "@material-ui/core";
// import Gauges from "./Gauges.js";
// import ZonalCards from "./ZonalCards.js";
// import { Doughnut } from "react-chartjs-2";
// import CardBody from "components/Card/CardBody.js";
// import LineChart from "views/LineChart.js";
// import ReactApexCharts from 'react-apexcharts'
// // import FMGLarge from "views/Heatmap/FMGLarge.js";

// const useStyles = makeStyles(styles);

// export default function Dashboard() {
//   const classes = useStyles();
//   let history = useHistory();
//   const [clicked, setClicked] = useState(false);
//   const [occupancyType, setOccupancyType] = useState("")
//   const [selectedType, setSelectedType] = useState("")
//   const [componentType, setComponenetType] = useState("")
//   const [data, setData] = useState({
//     temp: {
//       avg: 0, min: 0, max: 0
//     }, 
//     humidity: {
//       avg: 0, min: 0, max: 0
//     },
//     lux: {
//       avg: 0, min: 0, max: 0
//     },
//     conf_room: 0, seats: 0
//   })
//   const [configValues, setConfigValues] = React.useState({
//     minTemp: "",
//     maxTemp: "",
//     minHum: "",
//     maxHum: "",
//     minLux: "",
//     maxLux: "",
//     minAQI: "20",
//     maxAQI: "2000"
//   })
//   const [minValue, setMinValue] = React.useState(configValues.minAQI + " ppm <=")
//   const [maxValue, setMaxValue] = React.useState(">= " + configValues.maxAQI + " ppm")
//   const [floor, setFloor] = React.useState({"id": "", "name": ""});
//   const [context, setContext] = React.useState("building")
//   const [showZonalCards, setShowZonalCards] = React.useState(false)
//   const [zoomIn, setZoomIn] = React.useState(false)
//   const [lineChartParams, setLineChartParams] = React.useState({})
//   const state = {
//     labels: ['Total', 'Rooms'],
//     datasets: [
//       {
//         label: 'Occupancy Status',
//         backgroundColor: ["#46c9b8","#f76775","#6f58ff","#f8b339","#f82a23", "#a9dc83"],
//         data: [75, 25]
//       }
//     ]
//   }
//   const state1 = {
//     labels: ['Total', 'Seats'],
//     datasets: [
//       {
//         label: 'Occupancy Status',
//         backgroundColor: ["#46c9b8","#f76775","#6f58ff","#f8b339","#f82a23", "#a9dc83"],
//         data: [75, 60]
//       }
//     ],
//     plugins: {
//       labels: {
//         render: 'label'
//       }
//     },
//     text: '60%'
//   }
//   const state3 = {
//     // series: [Math.round(data.conf_room * 100) / 100, 100 - (Math.round(data.conf_room * 100) / 100)],
//     options: {
//       chart: {
//         type: 'pie',
//       },
//       legend: {
//         show: false
//       },
//       labels: ['Occupied', 'Unoccupied'],
//       responsive: [{
//         breakpoint: 480,
//         options: {
//           chart: {
//             width: 200
//           },
//           legend: {
//             position: 'bottom'
//           }
//         }
//       }]
//     },
//   };

//   const state4 = {
//     // series: [Math.round(data.seats * 100) / 100, 100 - (Math.round(data.seats * 100) / 100)],
//     options: {
//       chart: {
//         type: 'pie',
//       },
//       legend: {
//         show: false
//       },
//       labels: ['Booked', 'Available'],
//       responsive: [{
//         breakpoint: 480,
//         options: {
//           chart: {
//             width: 200
//           },
//           legend: {
//             position: 'bottom'
//           }
//         }
//       }]
//     },
//   };

//   const state5 = {
//     // series: [0, 100],
//     options: {
//       chart: {
//         type: 'pie',
//       },
//       legend: {
//         show: false
//       },
//       labels: ['Booked', 'Available'],
//       responsive: [{
//         breakpoint: 480,
//         options: {
//           chart: {
//             width: 200
//           },
//           legend: {
//             position: 'bottom'
//           }
//         }
//       }]
//     },
//   };

//   const selectFloor = (data) => {
//     setContext("floor");
//     setFloor({
//       id: data.id, name: data.name
//     })
//   }

//   const isZoomed = (param, unit, data, confVal, minMax) => {
//     setZoomIn(true)
//     setLineChartParams({
//       param, unit, data, confVal, minMax
//     })
//   }

//   useEffect(() => {
//     if(context === "building") {
//       localStorage.removeItem("floorID")
//       localStorage.removeItem("floorName")
//     }
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
//       });
//     api.analytics.dashboardCards(context, (context === "building") ? localStorage.buildingID : localStorage.floorID)
//       .then(res => {
//         const finalData = res;
//         setData({
//           ...data,
//           temp: {
//             avg: finalData.temperature.avg,
//             min: finalData.temperature.min,
//             max: finalData.temperature.max
//           },
//           humidity: {
//             avg: finalData.humidity.avg,
//             min: finalData.humidity.min,
//             max: finalData.humidity.max
//           },
//           lux: {
//             avg: finalData.luminousity.avg,
//             min: finalData.luminousity.min,
//             max: finalData.luminousity.max
//           },
//           conf_room: finalData.conf_room_occupancy,
//           seats: finalData.seat_occupancy          
//         })
//       })

//   }, [context]);

//   const loadMap = (type) => {
//     switch (type) {
//       case 'aqi':
//         setMinValue(configValues.minAQI + " ppm <=")
//         setMaxValue(">= " + configValues.maxAQI + " ppm")
//         break;
//       case 'temperature':
//         setMinValue(configValues.minTemp + " °C <=")
//         setMaxValue(">= " + configValues.maxTemp + " °C")
//         break;
//       case 'humidity':
//         setMinValue(configValues.minHum + " RH <=")
//         setMaxValue(">= " + configValues.maxHum + " RH")
//         break;
//       case 'luminousity':
//         setMinValue(configValues.minLux + " LX <=")
//         setMaxValue(">= " + configValues.maxLux + " LX")
//         break;
//       default:
//         break;
//     }
//   }

//   const selectedParam = (param, isClicked) => {
//     setSelectedType(param)
//     setShowZonalCards(isClicked)
//     loadMap(param)
//   } 
//   const bookroom = (e) =>{
//    e.preventDefault();
//    history.push("/admin/room-booking/0")
//   }
//   const bookseat = (e) =>{
//     e.preventDefault();
//     history.push("/admin/seat-booking/0")
//   }
//   return (
//     <div>
//       {!showZonalCards ?
//       <Gauges context={context} selectedParam={selectedParam} />
//       :
//       <ZonalCards selectedParam={selectedParam} />
//       }
//       <Paper elevation={3} style={{marginBottom: "3%"}}>
//         {context === "building" ? 
//           <Floors selectFloor={selectFloor} /> 
//           :
//           (selectedType !== "" ?
//             <div>
//               <GridContainer>
//                 <GridItem xs={6} sm={8} md={3} lg={3} xl={2}>
//               <a href="#" onClick={() => {setContext("building"); setZoomIn(false)}}>Back to Floors List</a>
//               <a href="#" style={{float: "right"}} onClick={() => {setSelectedType(""); setZoomIn(false)}}>Show Floormap</a>
//               </GridItem>
//               </GridContainer>
//               {/* <Heatmap type={selectedType} minValue={minValue} maxValue={maxValue} /> */}
//               {!zoomIn ?
//                 <Heatmap type={selectedType} minValue={minValue} maxValue={maxValue} zoomIn={isZoomed} />
//                 :
//                 <TimeSeriesChart data={lineChartParams.data} unit={lineChartParams.unit} configValues={lineChartParams.configValues} parameter={lineChartParams.param} />
//               }
//             </div>
//           :
//             <div className={classes.map}>
//               <a href="#" onClick={() => setContext("building")}>Back to Floors List</a>
//               <GridContainer justify="center" alignItems="center">
//                 {/* <ImageMapper
//                   src={'https://localhost/'+localStorage.floorName+'.jpg'}
//                   map={{
//                     name: "my-map",
//                     areas: []
//                   }}
//                 /> */}
//                 {/* <FMGLarge /> */}
//               </GridContainer>
//             </div>
//           )
//         }
//       </Paper>
//       {/* <GridContainer justify="center" alignItems="center">
//       <GridItem xs={8} sm={4} md={3} lg={3} xl={2} >
//             <Card card onClick={() => {
//               setClicked(true)
//               setComponenetType("floorOccupancy")
//               setOccupancyType("rooms")}}
//               >
//               <CardHeader color="success" stats icon>
//                 <p className={classes.cardCategory}>ROOM OCCUPANCY</p>
//               </CardHeader>
//               <CardBody>
//                 <div id="chart1">
//                   <ReactApexCharts options={state3.options} series={[Math.round(data.conf_room * 100) / 100, 100 - (Math.round(data.conf_room * 100) / 100)]} type="pie" />
//                 </div>
//               </CardBody>
//               <CardFooter stats>
//                 <div className={classes.hbStats}>
//                   <Icon>error_outline</Icon>
//                   <a href="/admin/room-booking/1">
//                     Book A Room
//                   </a>
//                 </div>
//               </CardFooter>
//             </Card>
//           </GridItem>
//           <GridItem xs={8} sm={4} md={3} lg={3} xl={2} >
//             <Card card onClick={() => {
//               setClicked(true)
//               setComponenetType("floorOccupancy")
//               setOccupancyType("seats")}}
//               >
//               <CardHeader color="success" stats icon>
//                 <p className={classes.cardCategory}>SEAT OCCUPANCY</p>
//               </CardHeader>
//               <CardBody>
//                 <div id="chart2">
//                   <ReactApexCharts options={state4.options} series={[Math.round(data.seats * 100) / 100, 100 - (Math.round(data.seats * 100) / 100)]} type="pie" />
//                 </div>
//               </CardBody>
//               <CardFooter stats>
//                 <div className={classes.hbStats}>
//                   <Icon>error_outline</Icon>
//                   <a href="/admin/seat-booking/1" onClick={e=>e.preventDefault()}>
//                     Book Seats
//                   </a>
//                 </div>
//               </CardFooter>
//             </Card>
//           </GridItem>
//           <GridItem xs={8} sm={4} md={3} lg={3} xl={2} >
//             <Card card onClick={() => {
//               setClicked(true)
//               setComponenetType("floorOccupancy")
//               setOccupancyType("seats")}}
//               >
//               <CardHeader color="success" stats icon>
//                 <p className={classes.cardCategory}>PARKING OCCUPANCY</p>
//               </CardHeader>
//               <CardBody>
//                 <div id="chart3">
//                   <ReactApexCharts options={state5.options} series={[20, 80]} type="pie" />
//                 </div>
//               </CardBody>
//               <CardFooter stats>
//                 <div className={classes.hbStats}>
//                   <Icon>error_outline</Icon>
//                   <a href="/admin/seat-booking/1" onClick={e=>e.preventDefault()}>
//                     View Occupancy
//                   </a>
//                 </div>
//               </CardFooter>
//             </Card>
//           </GridItem> 
//       </GridContainer> */}
//     </div>
//  );
//  } 
