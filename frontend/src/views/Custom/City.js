// import React, { useRef, useEffect } from 'react';
// // import { navigate } from '@reach/router';
// import Leaflet from 'leaflet';
// import Button from "components/CustomButtons/Button.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardBody from 'components/Card/CardBody';
// import { Marker, Tooltip, ImageOverlay, Map } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import "../../assets/css/leaflet.css";
// import { Grid } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import Typography from '@material-ui/core/Typography';
// import Home from './Home';
// import ButtonBase from '@material-ui/core/ButtonBase';
// // @material-ui/icons
// import GridItem from 'components/Grid/GridItem';
// import GridContainer from 'components/Grid/GridContainer';

// // Leaflet.Icon.Default.imagePath = '../node_modules/leaflet'
// // delete Leaflet.Icon.Default.prototype._getIconUrl;
// const floorMap = require("../../assets/img/bengaluru-map.png")

// const useStyles = makeStyles((theme) => ({
//     map: {
//         marginTop: '3%',
//         height: '520px'
//     },
//     media: {
//         minHeight: "200px"
//     },
//     item: {
//         minWidth: "370px",
//         margin: "1em",
//         textAlign: "center",
//         boxSizing: "border-box"
//     },
//     cardAction: {
//         display: "block",
//         minWidth: "370px",
//     },
//     bounds: {
//         backgroundColor:"transparent",
//         [theme.breakpoints.down('xs')]:
//             {height:"500px",width:"420px",marginTop:"3%"},
//         [theme.breakpoints.down('sm')]:
//             {height:'520px',marginTop:"3%"},
//         [theme.breakpoints.up('md')] : 
//             { height: "520px", marginTop: "3%" },
//         [theme.breakpoints.up('xl')] : 
//             { height: "2000px", marginTop: "3%" }
//     }
// }));


// const locations = [
//     {
//         coordinates: { x: 400, y: 495 },
//         name: "Koramangala",
//         iconName: "building2.png"
//     },
//     {
//         coordinates: { x: 265, y: 410 },
//         name: "Marathahalli",
//         iconName: "building1.png"
//     }
// ]

// export default function City(props) {
//     const classes = useStyles();
//     const mapRef = useRef(null);
//     const imgRef = useRef(null);
//     const[clicked,setClicked] =React.useState(false)
    

//     const handleLocationClick = (name) => {
//         // if (name === "Graylinx-Bengaluru Co-Space") {
//         // navigate('/floors')
//         // props.selectContext("building", "Floors", name, id)
//         // } else return   
//         if(name.includes('Koramangala')) {
//             props.changeContext("building")
//             localStorage.setItem("buildingName", "Koramangala")
//             props.history.push(`/admin/building/${localStorage.getItem("buildingID")}/dashboard`)
//         }
//     };
    
//     useEffect(() => {
//         console.log(imgRef, "map detaila")
//     }, []);

//     // const reset = () => {
//     //     console.log(imgRef.current.contextValue.map._zoom, "zoom value")
//     //     // var map = mapRef.current.viewport.zoom
//     //     // var zoomVal = mapRef.current.viewport.zoom
//     // }
//     const viewport = {
//         center: [0, 0],
//         zoom: 1,
//     };
//     const onViewportChanged = (viewport) => {
//         console.log(viewport);
//         };
// if(!clicked){
//     return (
//         <div >
//             <Grid justify='center' textAlign='center' alignItems='center'>
//                 <Typography style={{
//                     fontFamily: "BwSeidoRound-Regular",
//                     textAlign: 'center',
//                     fontWeight: 'bold',
//                     fontSize: 22,
//                     marginTop: '-37px'
//                 }}>
//                     Select a Facility
//             </Typography>
//             <Button variant="contained" color="info" onClick={() => props.history.push("/admin/home")}>Back</Button>
//                     <GridContainer justify="center" alignItems="center">
//                         {locations.map((_location, index) =>
//                         <GridItem key={index} xs={12} sm={6} md={3}>
//                             <ButtonBase onClick={() => handleLocationClick(_location.name)}>
//                             <Card card key={index}>
//                                     <CardHeader color="warning" icon>
//                                         <h4 style={{color: "GrayText"}}>{_location.name} Building</h4>
//                                     </CardHeader>
//                                     <CardBody>
//                                         <h6 style={{display: "inline", color: "GrayText"}}>Click to view the dashboard</h6>
//                                     </CardBody>
//                                     {/* <CardFooter cardFooter stats>
//                                         <div className={classes.stats}>
//                                             <a href="#pablo" onClick={e => e.preventDefault()}>
//                                                 View Zones
//                                             </a>
//                                         </div>
//                                     </CardFooter> */}
//                             </Card>
//                             </ButtonBase>
//                     </GridItem>
//                         )}
//                     </GridContainer>
//             </Grid>
//         </div>

//     )
// }
// else{
//     return(
//         <div>
//         {/* <Button variant="contained" color="info" onClick={() => setClicked(true)}>Back</Button> */}
//         <Home/>
//         </div>
//     )
// }  
// }
