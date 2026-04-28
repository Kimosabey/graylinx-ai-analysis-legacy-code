// import React, { useState, useEffect } from "react";
// // @material-ui/core
// import { makeStyles } from "@material-ui/core/styles";
// import Icon from "@material-ui/core/Icon";
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardFooter from "components/Card/CardFooter.js";
// import api from "../../api"
// import ReactSpeedometer from "react-d3-speedometer"
// import CardBody from "components/Card/CardBody.js";
// import { cardTitle } from "assets/jss/material-dashboard-react.js";
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import RadialBarChart from "views/RadialBarChart";
// import { successColor, dangerColor } from "assets/jss/material-dashboard-react";

// const useStyles = makeStyles(styles);


// export default function Gauges(props) {
//     const classes = useStyles();
//     const [context, setContext] = useState(props.context);
//     const [occupancyType, setOccupancyType] = useState("")
//     const [selectedType, setSelectedType] = useState("")
//     const [componentType, setComponenetType] = useState("")
//     const [data, setData] = useState({
//         temp: {
//         avg: 0, min: 0, max: 0
//         }, 
//         humidity: {
//         avg: 0, min: 0, max: 0
//         },
//         lux: {
//         avg: 0, min: 0, max: 0
//         },
//         co2: {
//             avg: 0, min: 0, max: 0
//         },
//         tvoc: {
//             avg: 0, min: 0, max: 0
//         },
//         pm2_5: {
//             avg: 0, min: 0, max: 0
//         },
//         pm10: {
//             avg: 0, min: 0, max: 0
//         },
//         noise: {
//             avg: 0, min: 0, max: 0
//         },
//         energy: 0,
//         conf_room: 0, seats: 0
//     })
//     const { selectedParam } = props;

//     useEffect(() => {
//         api.analytics.dashboardCards(context, (context === "building") ? localStorage.buildingID : localStorage.floorID)
//           .then(res => {
//             const finalData = res;
//             console.log(res)
//             setData({
//               ...data,
//               temp: {
//                 avg: finalData.temperature.avg,
//                 min: finalData.temperature.min,
//                 max: finalData.temperature.max
//               },
//               humidity: {
//                 avg: finalData.humidity.avg,
//                 min: finalData.humidity.min,
//                 max: finalData.humidity.max
//               },
//               lux: {
//                 avg: finalData.luminousity.avg,
//                 min: finalData.luminousity.min,
//                 max: finalData.luminousity.max
//               },
//               co2: {
//                 avg: finalData.co2.avg,
//                 min: finalData.co2.min,
//                 max: finalData.co2.max
//               },
//               tvoc: {
//                 avg: finalData.tvoc.avg,
//                 min: finalData.tvoc.min,
//                 max: finalData.tvoc.max
//               },
//               pm2_5: {
//                 avg: finalData.pm2_5.avg,
//                 min: finalData.pm2_5.min,
//                 max: finalData.pm2_5.max
//               },
//               pm10: {
//                 avg: finalData.pm10.avg,
//                 min: finalData.pm10.min,
//                 max: finalData.pm10.max
//               },
//               noise: {
//                 avg: finalData.noise.avg,
//                 min: finalData.noise.min,
//                 max: finalData.noise.max
//               },
//               energy: finalData.energy_consumption,
//               conf_room: finalData.conf_room_occupancy,
//               seats: finalData.seat_occupancy          
//             })
//           })
    
//       }, [context]);
    
//     const handleColor = (param, value) => {
//         switch(param) {
//             case "co2":
//                 if(value >= 0 && value <= 1000)
//                     return successColor[0]
//                 else if(value > 1000 && value <= 2000)
//                     return '#FFF833'
//                 else
//                     return dangerColor[0]
//             case "tvoc":
//             case "pm2_5":
//             case "pm10":
//                 if(value >= 0 && value <= 40)
//                     return successColor[0]
//                 else if(value > 40 && value <= 80)
//                     return '#FFF833'
//                 else
//                     return dangerColor[0]
//             case "noise":
//                 if(value >= 0 && value <= 40)
//                     return successColor[0]
//                 else if(value > 40 && value <= 64)
//                     return '#FFF833'
//                 else
//                     return dangerColor[0]
//             case "temperature":
//                 if(value < 18)
//                     return '#87CEFA'
//                 else if(value >= 18 && value <= 23)
//                     return successColor[0]
//                 else
//                     return dangerColor[0]
//             case "humidity":
//                 if(value >=0 && value <= 5)
//                     return dangerColor[0]
//                 else if((value > 5 && value < 70) || (value > 60))
//                     return '#FFF833'
//                 else
//                     return successColor[0]
//             case "luminousity":
//             case "energy":
//                 return '#FFF833'

//         }
//     }

//     return(
//         <GridContainer justify="center" alignItems="center" spacing={2}>
//                     <GridItem xs={8} sm={6} md={4} lg={2} xl={2} >
//                         <Card plain onClick={() => {
//                             selectedParam("temperature", true)
//                             setComponenetType("heatmap")}}
//                         >
//                             {/* <CardHeader color="success" stats icon>
//                                 <p className={classes.cardCategory}>Thermal Health</p>
//                             </CardHeader> */}
//                             <CardBody>
//                                 <RadialBarChart value={Math.round(data.temp.avg * 10)/10} color={handleColor("temperature", Math.round(data.temp.avg * 10)/10)} param="Thermal Health" unit="℃" />
//                             </CardBody>
//                             <CardFooter hbStats>
//                                 <div className={classes.stats}>
//                                     {"MIN : " + Math.round(data.temp.min * 10)/10 +" °C ;"}<br></br> {"MAX : " + Math.round(data.temp.max * 10)/10 +"  °C"}
//                                 </div>
//                             </CardFooter>
//                         </Card>
//                     </GridItem>
//                     <GridItem xs={8} sm={6} md={4} lg={2} xl={2} >
//                         <Card plain onClick={() => {
//                             selectedParam("humidity", true)
//                             setComponenetType("heatmap")}}
//                         >
//                             {/* <CardHeader color="success" stats icon>
//                                 <p className={classes.cardCategory}>Moisture</p>
//                             </CardHeader> */}
//                             <CardBody>
//                                 <RadialBarChart value={Math.round(data.humidity.avg * 10)/10} color={handleColor("humidity", Math.round(data.humidity.avg * 10)/10)} param="Moisture" unit="RH" />
//                             </CardBody>
//                             <CardFooter hbStats>
//                                 <div className={classes.stats}>
//                                     {"MIN : " + Math.round(data.humidity.min * 10)/10 +" RH ;"}<br></br> {"MAX : " + Math.round(data.humidity.max * 10)/10 +" RH"}
//                                 </div>
//                             </CardFooter>
//                         </Card>
//                     </GridItem>
//                     <GridItem xs={8} sm={6} md={4} lg={2} xl={2} >
//                         <Card plain onClick={() => {
//                             selectedParam("luminousity", true)
//                             setComponenetType("heatmap")}}
//                         >
//                             {/* <CardHeader color="success" stats icon>
//                                 <p className={classes.cardCategory}>Luminosity</p>
//                             </CardHeader> */}
//                             <CardBody>
//                                 <RadialBarChart value={Math.round(data.lux.avg * 10)/10} color={handleColor("luminousity", Math.round(data.lux.avg * 10)/10)} param="Luminosity" unit="LX" />
//                             </CardBody>
//                             <CardFooter hbStats>
//                                 <div className={classes.stats}>
//                                     {"MIN : " + Math.round(data.lux.min * 10)/10 +" lx ;"}<br></br> {"MAX : " + Math.round(data.lux.max * 10)/10 +" lx"}
//                                 </div>
//                             </CardFooter> 
//                         </Card>
//                     </GridItem>
//         </GridContainer>
//     )
// }
