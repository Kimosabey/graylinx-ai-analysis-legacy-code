// import React, { useEffect } from 'react';
// import { Chip, makeStyles,Typography,CardMedia,CardContent } from '@material-ui/core';
// import { green, red } from '@material-ui/core/colors';
// import { withStyles } from "@material-ui/core/styles";
// import { Map, ImageOverlay, Marker, Popup, Tooltip,Circle,Rectangle,FeatureGroup,Polygon } from 'react-leaflet';
// import HeatmapLayer from 'react-leaflet-heatmap-layer';
// import 'leaflet/dist/leaflet.css';
// import "../../assets/css/leaflet.css";
// import api from '../../api';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Box from '@material-ui/core/Box';
// import Button from "components/CustomButtons/Button.js";
// import { MapInteractionCSS } from 'react-map-interaction';
// import Grid from '@material-ui/core/Grid'; 
// import GridContainer from 'components/Grid/GridContainer.js';
// import GridItem from 'components/Grid/GridItem.js';
// import ListItemText from '@material-ui/core/ListItemText';
// import ListItem from '@material-ui/core/ListItem';
// import MenuItem from '@material-ui/core/MenuItem';
// import Menu from '@material-ui/core/Menu';
// import Popover from '@material-ui/core/Popover';
// import InputLabel from '@material-ui/core/InputLabel';
// import Select from '@material-ui/core/Select';
// import FormControl from '@material-ui/core/FormControl';
// //const MAP = require('../../assets/Data/seats-list.json');
// // const FloorImage = require('../../assets/img/fo.jpg');
// const Leaflet = require('leaflet');
// const useStyles = makeStyles((theme) => ({
//     bounds: {
//         [theme.breakpoints.up("md")]:
//             { height: "520px", marginTop: "3%" }
//     },
//     media: {
//         minHeight: "200px"
//     },
//     loader:{
//         size:"40px",
//         color:"#26c6da"
//     },
//     style:{
//          display: "flex",
//          marginLeft: "28%" ,
//         [theme.breakpoints.down('xs')]:
//             {marginLeft:'1%'} 
//     },
//     root:{
//       display:"flex"
//     },
//     formControl: {
//         width: 240,
//         cursor:'pointer',
//         [theme.breakpoints.down('xs')]:
//             {textAlign:"left"},
//         [theme.breakpoints.down('sm')]:
//             {textAlign:"left"},
//     },
//     list:{
//         textAlign:"end",
//         cursor:'pointer',
//         [theme.breakpoints.down('xs')]:
//             {textAlign:"left"},
//         [theme.breakpoints.down('sm')]:
//             {textAlign:"left"},
//     }
// }));

// const iconDevice = new Leaflet.Icon({
//     iconUrl: require('../../assets/img/user.png'),
//     iconRetinaUrl: require('../../assets/img/user.png'),
//     iconSize: new Leaflet.Point(15, 15),
//     className: 'leaflet-div-icon-2'
//   });

// const RedButton = withStyles((theme) => ({
//     root: {
//         backgroundColor: "rgba(179, 0, 0, 0.7)",
//         margin: "2%",
//         "&:hover": {
//             backgroundColor: "rgba(179, 0, 0, 0.7)"
//         }
//     }
// }))(Button);

// const GreenButton = withStyles((theme) => ({
//     root: {
//         backgroundColor: "rgba(0, 179, 0, 0.7)",
//         margin: "2%",
//         "&:hover": {
//             backgroundColor: "rgba(0, 179, 0, 0.7)"
//         }
//     }
// }))(Button);

// // const MaroonButton = withStyles((theme) => ({
// // root: {
// //     backgroundColor: "#900C3F",
// //     margin: "2%",
// //     "&:hover": {
// //         backgroundColor: "#900C3F"
// //       }

// // }
// // }))(Button);

// export default function FloorOccupancyNew(props) {
//     //const [mapDetails, setMapDetails] = React.useState(MAP);
//     const classes = useStyles();
//     const [mapDetails, setMapDetails] = React.useState({
//         name: "my-map", areas: []
//     });
//     const [floorName, setFloorName] = React.useState("")
//     const [selectedIndex, setSelectedIndex] = React.useState(0);
//     const [anchorEl, setAnchorEl] = React.useState(null);
//     const [isloaded, setIsLoaded] = React.useState(false);
//     const [clicked,setClicked] = React.useState(false);
//     const [floors,setFloors] =React.useState([])
//     const [hoveredArea, setHoveredArea] = React.useState(null)
//     const [floorID,setFloorID] = React.useState('')
//     const [heatMapData,setHeatMapdata] = React.useState({
//         rectData:[],
//         addressPoints:[],
//     })

//     const defaultProps = {
//         bgcolor: 'background.paper',
//         m: 1,
//         border: 1,
//         style: { "minwidth": '50rem', "minheight": '25rem', "maxwidth": '51rem', "maxheight": '28rem' },
//     };
//     useEffect(() => {
//         api.floor.floorList(localStorage.getItem("buildingID")).then(res => {
//             console.log("1",res.floors)
//             setFloors(res.floors)
//             { floorID === "" ? 
//                 setFloorID(res.floors[0].id)
//                 :
//                 setFloorID(floorID)
//                 localStorage.setItem("context","floor")
//                 localStorage.setItem('floorID',floorID)
//             }
//             { floorName === "" ? 
//                 setFloorName(res.floors[0].name)
//                 :
//                 setFloorName(floorName)
//                 localStorage.setItem("context","floor")
//                 localStorage.setItem('floorName',floorName)
//             }
//         })
//         setIsLoaded(true)
//             // const timer = setInterval(() => {
//         api.floor.getOccupancyBookingStatus(floorID).then(res => {
//             setIsLoaded(false)
//             const { deviceData, areas } = res;
//             let occupiedSensors = deviceData.filter(_dev => _dev.data.occupancy.value === 1)
//             setHeatMapdata({...heatMapData, rectData: res.areas, addressPoints: occupiedSensors})
//         })
//         // }, 5000)

//         // return() => {
//         //     clearInterval(timer)
//         // }
//     }, [floorName])

//     const handleMenuItemClick = (id,name,type,index) => {
//         setSelectedIndex(index);
//         setClicked(true)
//         setIsLoaded(true)
//         setAnchorEl(null)
//         localStorage.setItem("context","floor");
//         localStorage.setItem("floorID",id);
//         setFloorID(id)
//         localStorage.setItem("floorName", name);
//         setFloorName(name)
//     };

//     return (  
//     <div>
//         <div className={classes.root}>
//             <Grid container justify='flex-end'>
          
//             <FormControl className={classes.formControl}>
//                 <InputLabel shrink id="demo-simple-select-label">Select a Floor to view more details:</InputLabel>
//                 <Select
//                 labelId="demo-simple-select-label"
//                 id="demo-simple-select"
//                 value={floorName}
//                 displayEmpty={true}
//                 >
//                 {floors.map((_floor,index) =>
//                     <MenuItem key={_floor.id} value={_floor.name} 
//                         selected={index === selectedIndex} 
//                         button onClick={(event) => handleMenuItemClick(_floor.id,_floor.name,_floor.type,index)}>
//                         {_floor.name}
//                     </MenuItem> 
//                 )}
//                 </Select>
//              </FormControl>
//             </Grid>
//         </div>
       
//         <div>
//             {/* {clicked === true ? */}
//             <div>
//             {isloaded === true ?
//                 <div style={{ "textAlign": "center", "marginTop": "150px" }}>
//                     <CircularProgress className={classes.loader} />
//                 </div>
//             :
//             <div>
//                     <GridItem xs={6} sm={12} md={12} lg={12} xl={12}>
//                         <div className={classes.style} >
//                             <GreenButton style={{ "maxHeight": "3px", "backgroundColor": "rgba(0, 179, 0, 0.7)", "marginTop": "3.8%" }} variant="contained" ></GreenButton>
//                             <h5>&nbsp;&nbsp;- Available</h5>&nbsp;&nbsp;
//                             <RedButton style={{ "maxHeight": "3px", "backgroundColor": "rgba(179,0, 0, 0.7)", "marginTop": "3.5%" }} variant="contained" ></RedButton>
//                                     <h5>&nbsp;&nbsp;- Occupied</h5>&nbsp;&nbsp;
//                         </div>
//                     </GridItem>
//                     <br /><br />
//                         <Map
//                             doubleClickZoom={false}
//                             zoomControl={true}
//                             dragging={true}
//                             scrollWheelZoom={false}
//                             className={"floor-map"}
//                             crs={Leaflet.CRS.Simple}
//                             center={[0, 0]}
//                             // bounds={[[0, 0], [950, 800]]}
//                             bounds={[[0, 0], [414, 843]]}
//                             className={classes.bounds}
//                             // style={{ width: "790px", height: "430px" }}
//                             onClick={(e) => {
//                                 // console.log(e)
//                                 console.log({ x: e.latlng.lat, y: e.latlng.lng })
//                             }}
//                             >
//                                 {
//                                     heatMapData.rectData.map((each)=>
//                                     <Rectangle bounds={each.bound} fillColor={each.preFillColor} fillOpacity={0.5} />
//                                     )
//                                 }
                            
//                             <ImageOverlay
//                                 interactive
//                                 url={'https://localhost/'+localStorage.floorName+'.jpg'}
//                                 // className={classes.bounds}
//                                 // bounds={[[0, 0], [950, 800]]}
//                                 bounds={[[0, 0], [414, 843]]}
//                             // className={classes.images}
//                             />
//                             {heatMapData.addressPoints ?
//                                 (heatMapData.addressPoints.map((value1, index) => 
//                                     <Marker key={index}
//                                         position={[value1.coordinates.x, value1.coordinates.y]}
//                                         icon={iconDevice}
//                                     ></Marker>
//                                 ))
//                                 :
//                                 <div></div>
//                             }
//                             </Map>
//             </div>
//             }
//             </div>
//             {/* :
//              <div>

//              </div>
//              }   */}
//         </div>
      
//     </div>       
//     )
// }