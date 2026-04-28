// import React, { useEffect } from 'react';
// import { Chip, makeStyles,Typography,CardMedia,CardContent } from '@material-ui/core';
// import { green, red } from '@material-ui/core/colors';
// import { withStyles } from "@material-ui/core/styles";
// import ImageMapper from 'react-image-mapper';
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

// export default function FloorOccupancy(props) {
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
//     const apiCall = (res) => {
//         const finalData = props.type ? (props.type === "rooms") ? res.areas.filter(e => e.meeting_room_id) : res.areas.filter(e => !e.meeting_room_id) : res.areas
//         setMapDetails({ ...mapDetails, areas: finalData })
//     }

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
//         // api.floor.getOccupancyStatus(localStorage.getItem('floorID')).then(res => {
//         const timer = setInterval(() => {
//             api.floor.getOccupancyStatus(floorID).then(res => {
//                 apiCall(res);
//                 apiCall(res);
//                 setIsLoaded(false)
//             })
//         }, 5000)

//         return() => {
//             clearInterval(timer)
//         }
//         // setInterval(() => {
//         //     if (isloaded == true) {
//         //         setIsLoaded(true);
//         //     }
//         //     setIsLoaded(false);
//         // }, 3000);
//     }, [floorName])

//     const enterArea = (area) => {
//         setHoveredArea(area)
//     }
//     const leaveArea = (area) => {
//         setHoveredArea(null)
//     }
//     const getTipPosition = (area) => {
//         return {
//             top: `${area.center[1] - 35}px`, left: `${area.center[0]}px`,
//             position: "absolute",
//             color: "#fff", padding: "10px", background: "rgba(0,0,0,0.8)", transform: "translate3d(-50%, -50%, 0)",
//             borderRadius: "5px", pointerEvents: "none", zIndex: "1000"
//         }
//     };
//     const handleMenuItemClick = (id,name,type,index) => {
//         console.log("menu item")
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
//                     <GridContainer>
//                         <GridItem xs={12} sm={6} md={3} lg={3}>
//                             <div style={{ "position": "relative" }}>
//                                 <ImageMapper
//                                     // src={("https://localhost/Floor-1.jpg")}
//                                     src={("https://localhost/"+ floorName +".jpg")}
//                                     map={mapDetails}
//                                     className={classes.bounds}
//                                     lineWidth={2}
//                                     onMouseEnter={area => enterArea(area)}
//                                     onMouseLeave={area => leaveArea(area)}
//                                 />
//                                 {hoveredArea &&
//                                     <span className="tooltip"
//                                         style={{ ...getTipPosition(hoveredArea) }}>
//                                         {hoveredArea && hoveredArea.name}
//                                     </span>
//                                 }
//                             </div>
                           
//                         </GridItem>
//                     </GridContainer>
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