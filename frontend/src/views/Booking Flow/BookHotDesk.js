// import React, {useRef, useEffect } from 'react';
// import { makeStyles, withStyles } from '@material-ui/core/styles';
// import {
//     infoColor
// } from "assets/jss/material-dashboard-react.js";
// import ImageMapper from 'react-image-mapper';
// import PropTypes from 'prop-types';
// import StepConnector from "@material-ui/core/StepConnector";
// import clsx from 'clsx';
// import {
//     Container,
//     FormControl,
//     Typography,
//     Stepper,
//     Step,
//     StepLabel,
//     Grid,
//     MenuItem,
//     FormHelperText,
//     Checkbox,
//     TextField,
// } from '@material-ui/core';
// import Button from "components/CustomButtons/Button.js";
// import Table from "components/Table/Table.js";
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardBody from "components/Card/CardBody.js";
// import api from '../../api';
// import MuiAlert from '@material-ui/lab/Alert';
// import 'date-fns';
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import { red, green } from '@material-ui/core/colors';
// import Snackbar from '@material-ui/core/Snackbar';
// import moment from 'moment';
// import Box from '@material-ui/core/Box';
// import FloorMapGenerator01 from "../FloorMapGenerator01.js"
// import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
// import "../../assets/css/syncfusion-material.css";
// import AddToCalendar from 'react-add-to-calendar';
// import style from './style.css';
// import {Map,ImageOverlay,Popup,Marker,Tooltip,Rectangle} from 'react-leaflet';
// import { useSelector } from 'react-redux';

// const MAP = require('../../assets/Data/seats-list.json');
// const Leaflet = require('leaflet');
// const useStyles1 = makeStyles(style);
// const useStyles = makeStyles((theme) => ({
//     root: {
//         backgroundColor: "#EEEEEE",
//         minWidth: '100px'
//     },
//     backButton: {
//         marginRight: theme.spacing(1),
//     },
//     instructions: {
//         marginTop: theme.spacing(1),
//         marginBottom: theme.spacing(1),
//     },
//     underline: {
//         '&:before': {
//             borderBottomColor: "gray",
//             // [theme.breakpoints.up('xl')]: {
//             //   fontSize: "45px",
//             // },
//         },
//         '&:after': {
//             borderBottomColor: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //   fontSize: "45px",
//             // },
//         },
//         '&:hover:before': {
//             borderBottomColor: [infoColor[0], '!important'],
//             // [theme.breakpoints.up('xl')]: {
//             //   fontSize: "45px",
//             // },
//         },
//     },
//     textField: {
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize: "45px",
//         //     height: "108px",
//         //     padding: "20px"
//         // },
//         "& .MuiOutlinedInput-input": {
//             color: "gray",
//             // [theme.breakpoints.up('xl')]: {
//             //   fontSize: "45px",
//             // },
//         },
//         "& .MuiInputLabel-root": {
//             color: "gray",
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "50px",
//             //     padding: "25px",
//             //     lineHeight: "2px"
//             // },
//         },
//         "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//             borderColor: "gray",
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "&:hover .MuiOutlinedInput-input": {
//             color: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "&:hover .MuiInputLabel-root": {
//             color: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//             borderColor: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
//             color: "gray",
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "& .MuiInputLabel-root.Mui-focused": {
//             color: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//             borderColor: infoColor[0],
//             // [theme.breakpoints.up('xl')]: {
//             //     fontSize: "45px",
//             // },
//         },
//     },
//     submitButton: {
//         marginTop: (30),
//         marginBottom: 50,
//         width: '200px'
//     },
//     inputField: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: "3px",
//         marginBottom: "30px"
//     },
//     formControl: {
//         margin: theme.spacing(1),
//         textAlign: "center",
//         // fullWidth: true,
//         width: "50%"
//     },
//     lastFormControl: {
//         margin: theme.spacing(1),
//         textAlign: "center",
//         width: "10%"
//     },
//     menu: {
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize: "45px",
//         // },
//     },
//     snackbar: {
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize: "50px",
//         // },
//     },
//     media: {
//         minHeight: "150px"
//     },
//     item: {
//         minWidth: "300px",
//         margin: "1em",
//         textAlign: "left",
//         boxSizing: "border-box"
//     },
//     cardAction: {
//         display: "block",
//         minWidth: "370px",
//     },
//     avatar: {
//         backgroundColor: red[500],
//     },
//     confirmationGrid: {
//         display: "flex",
//         flexDirection: "column"
//     },
//     alert: {
//         width: '50%',
//     },
//     tooltip: {
//         fontSize: 12
//     },
//     bounds:{
//         [theme.breakpoints.down('xs')]:
//             {height:"500px",width:"120px",marginTop:"3%"},
//         [theme.breakpoints.down('sm')]:
//             {height:'520px',marginTop:"3%"},
//         [theme.breakpoints.up('md')] : 
//             { height: "520px", marginTop: "3%" },
//         [theme.breakpoints.up('xl')] : 
//             { height: "700px", marginTop: "3%" }
//     },
//     button:{
//          marginTop: '2%', float: "right",
//         [theme.breakpoints.down('xs')]:
//            { float:'left'},
//         [theme.breakpoints.down('sm')]:
//            { float:'left'}
//     }
// }));
// // const styles = {
// //     cardTitleWhite: {
// //         color: "#FFFFFF",
// //         marginTop: "0px",
// //         minHeight: "auto",
// //         fontWeight: "300",
// //         fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
// //         marginBottom: "3px",
// //         textDecoration: "none",
// //         "& small": {
// //             color: "#777",
// //             fontSize: "65%",
// //             fontWeight: "400",
// //             lineHeight: "1"
// //         }
// //     },
// // }  

// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

// function getSteps() {
//     return ['Search and Select Seat(s)', 'Book Seat(s)'];
// }


// export default function BookHotDesk() {
//     const classes = useStyles();
//     const classes1 = useStyles1();
//     const mapRef = React.createRef();
//     const imgRef = useRef(null);
//     const [activeStep, setActiveStep] = React.useState(0);
//     const [floors, setFloors] = React.useState([])
//     const [floorSelected, setFloorSelected] = React.useState("")
//     const [selectedFloorName, setSelectedFloorName] = React.useState("");
//     const [zones, setZones] = React.useState([])
//     const [zoneDetails, setZoneDetails] = React.useState({ id: "", name: "" });
//     const [fromDateTime, setFromDateTime] = React.useState(new Date());
//     const [toDateTime, setToDateTime] = React.useState(new Date());
//     const [isSearchClicked, setIsSearchClicked] = React.useState(false);
//     const [openAlert, setOpenAlert] = React.useState(false);
//     const [hoveredArea, setHoveredArea] = React.useState(null)
//     const [mapDetails, setMapDetails] = React.useState(MAP);
//     const [bookedDetails, setBookedDetails] = React.useState([])
//     const [selectedDetails, setSelectedDetails] = React.useState([]);
//     const [userDetails, setUserDetails] = React.useState([])
//     const [selecteddata,setSelecteddata] = React.useState("");
//     const [selectedUser, setSelectedUser] = React.useState({
//         id: "",
//         name: "",
//         phno: "",
//         email: ""
//     })
//     const [visitorDetails, setVisitorDetails] = React.useState({
//         name: "",
//         phno: "",
//         email: "",
//         seatsCount: "1",
//     })
//     const [errorMsg, setErrorMsg] = React.useState({
//         name: "",
//         phno: "",
//         email: "",
//         seatsCount: "",
//         floor: "",
//         card: "",
//         date: ""
//     })
//     const [floorid,setFloorid] = React.useState("");

//     const buildingID = useSelector(state => state.isLogged.data.zones[0])
//     const userID = useSelector(state => state.isLogged.data.user.id)
//     useEffect(() => {
//         // api.floor.floorList(localStorage.getItem("buildingID")).then(res => {
//         api.floor.floorList(buildingID).then(res=> {
//         // api.floor.floorList("55a47599-34b5-465c-b8ae-386ea658d0d5").then(res => {
//             if (res) {
//                 // const filteredArray = res.floors
//                 //     .filter(each => each.type === "wlms")
//                 // setFloors(filteredArray)
//                 const filteredArray = res.map((i,index)=>i.children)
//                 setFloors(filteredArray[0])
//             }

//         })
//     }, [floorSelected])

//     // useEffect(() => {
//     //     getZones();
//     // }, [isSearchClicked])
//     let event = {
//         title: selectedDetails.map(_e => _e.name),
//         description: selectedDetails.map(_e => _e.description),
//         location: 'Portland, OR',
//         startTime: "2021-07-19T20:15:00+05:30",
//         endTime: "2021-07-19T21:45:00+05:30"
//       };
//     const enterArea = (area) => {

//         setHoveredArea(area)
//     }
//     const leaveArea = (area) => {
//         setHoveredArea(null)
//     }
//     const getTipPosition = (area) => {
//         return {
//             top: `20px`,
//             position: "absolute",
//             color: "#fff", padding: "10px", background: "rgba(0,0,0,0.8)", transform: "translate3d(-50%, -50%, 0)",
//             borderRadius: "5px", pointerEvents: "none", zIndex: "1000"
//         }
//     };


//     const getZones = async () => {
//         var id = floorid.props.value
//         // var id = "b1998d43-fc32-4804-9cf3-5dac43f242c8"       //Floor-1 id
//         // var id = "fb265d85-297f-4bc6-a99d-812c441a5d55"     //Floor-2 id
//         var zone_type = "GL_ZONE_TYPE_SEAT"
//         var from = moment(fromDateTime).format("YYYY-MM-DD HH:mm:ss");
//         var to = moment(toDateTime).format("YYYY-MM-DD HH:mm:ss");
//         var diff = moment.duration(moment(to).diff(moment(from)));
//         if (floorSelected !== "") {
//             if (diff._data.minutes >= 30 || diff._data.hours >= 1
//                 || diff._data.days >= 1 || diff._data.months >= 1) {
//                 setErrorMsg({ ...errorMsg, date: "" })
//                 const data = {
//                     from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                     to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                 }
//                 await api.floor.getMeetingRooms(id,zone_type,from,to).then(res => {
//                     res.forEach(function(item,index){
//                         item.coordinates=JSON.parse(item.coordinates)
//                       })
//                 // await api.zones.bookedSeatsList(floorSelected, data).then(res => {
//                     setMapDetails(res)
//                     setIsSearchClicked(true)
//                     // setSelectedFloorName(selectedFloorName.props.children)
//                 })
//             }
//             else {
//                 setErrorMsg({ ...errorMsg, date: "Minimum time chosen should be 30 mins ahead of From time" })
//             }
//         } else {
//             setErrorMsg({ ...errorMsg, floor: "Floor is Required" })
//         }
//     }

//     const getUserDetails = (value) => {
//         setSelectedUser({ id: "", name: "", phno: "", email: "" })
//         if (value === "") {
//             setVisitorDetails({ ...visitorDetails, email: value })
//             setErrorMsg({ ...errorMsg, email: "E-mail ID is Required" })
//         } else {
//             setVisitorDetails({ ...visitorDetails, email: value })
//             setErrorMsg({ ...errorMsg, email: "" })
//             api.users.getClientDetails(value).then(res => {
//                 setUserDetails(res)
//             })
//         }
//     }


//     const handleCheckBox = (event, user) => {
//         setSelectedUser({
//             id:user.id,name: user.name, phno: user.phone_no, email: user.email_id
//         })
//         // setSelectedUser({
//         //     id: user.user_id, name: user.user_name, phno: user.user_contact_no, email: user.user_email
//         // })
//     }

//     const handleFloorChange = (event, data) => {
//         setFloorSelected(event.target.value)
//         setSelectedFloorName(data.props.children)
//         setErrorMsg({ ...errorMsg, floor: "" })
//         setIsSearchClicked(false)
//         setFloorid(data)
//     };

//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return;
//         }
//         setOpenAlert(false);
//     };

//     const handleNext = () => {
//         let m;
//         switch (activeStep) {
//             case 0:
//                 if (selectedDetails.length === 0) {
//                     setErrorMsg({ ...errorMsg, card: "Select a seat to proceed" })
//                     setOpenAlert(true)
//                 } else {
//                     setActiveStep(prevActiveStep => prevActiveStep + 1);
//                 }
//                 break;;
//                 case 1: {
//                     if (selectedUser.id === "") {
//                         setErrorMsg({ ...errorMsg, email: "Select a user to proceed" })
//                         setOpenAlert(true)
//                     }
//                     if (selectedUser.id !== "") {
//                         let zone_ids=[];
//                         var j
//                         for(j=0;j<selectedDetails.length;j++){
//                             zone_ids.push(selectedDetails[j].uuid)
//                         }
//                     // selectedUser.ForEach((i,index)=>{zone_id.push(i.uuid)})     
//                     const data = {
//                         zone_ids:zone_ids,
//                         // user_id:"7468abec-5870-4dca-a92a-60aa8ae3720c",
//                         user_id:userID,
//                         from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                         to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                         // user_id:selectedUser.id,
//                         // no_of_seats: null,
//                         // seatList: selectedDetails,
//                         // person_name: selectedUser.name,
//                         // email_id: selectedUser.email,
//                         // contact_no: selectedUser.phno
//                     }
//                     // const data = {
//                     //     // zone_id: zoneDetails.id,
//                     //     from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                     //     to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                     //     user_id:selectedUser.id,
//                     //     no_of_seats: null,
//                     //     seatList: selectedDetails,
//                     //     person_name: selectedUser.name,
//                     //     email_id: selectedUser.email,
//                     //     contact_no: selectedUser.phno
//                     // }
//                     api.zones.bookHotdesk(data).then(res => {
//                         setActiveStep(prevActiveStep => prevActiveStep + 1);
//                     })
//                 }
//             }
//                 break;
//             default:
//                 break;
//         }
//     };


//     const onDateChange = (event) => {
//         let formated = moment(event.target.value).format("YYYY-MM-DDTHH:mm")
//         setFromDateTime(formated)
//     }

//     const handlemapclick = (area) =>{
     
//         setSelecteddata(area)
//         // const arr = mapDetails.map((_each)=>_each)
//         // console.log("arr",arr)
//         // console.log("arr.status",mapDetails.map((_o)=>_o.status))
//         var flag = 0;
//         var index;
//         var i;
//         let selected = selectedDetails;
//         if (area.status == "available") {
//           if(area.color == "rgba(179, 0, 0,0.7)") {
//             setErrorMsg({ ...errorMsg, card: "This room is booked" })
//             setOpenAlert(true)
//            } 
//            else {
//              area.color = "rgba(179, 0, 0,0.7)"
//              for (i = 0; i < selected.length; i++) {
//                if (selected[i].name == area.name) {
//                  flag = 1
//                  index = i
//                }
//              }
//              if (flag === 0) {
//                selected.push(area)
//              }
//              else {
//                selected.splice(index, 1)
//              }
//              setSelectedDetails(selected)
//              mapDetails.map((_each, index) => {
//                if (_each.name === area.name) {
//                  if (_each.color === "gray") {
//                    _each.color = "green"
//                  }
//                  else {
//                    _each.color = "gray"
//                  }
//                }
//              })
//            }
           
//         }
//         else if (area.status == "attendees are not enough") {
//           if(area.color == "rgba(179, 0, 0,0.7)") {
//             setErrorMsg({ ...errorMsg, card: "This room is booked" })
//             setOpenAlert(true)
//            } else {
//            setErrorMsg({ ...errorMsg, card: "Attendees are very less for booking this room" })
//            setOpenAlert(true)
//            }
//         }
//         else {
//           if(area.color == "rgba(179, 0, 0,0.7)") {
//             setErrorMsg({ ...errorMsg, card: "This room is booked" })
//             setOpenAlert(true)
//            } else {
//            setErrorMsg({ ...errorMsg, card: "No of Attendies is more than room capacity" })
//            setOpenAlert(true)
//           }
//         }
//         setMapDetails(mapDetails)
//         setHoveredArea(area)
//     }

//     const getStepContent = (stepIndex) => {
//         switch (stepIndex) {
//             case 0: {
//                 return (
//                     <div style={{ textAlign: "center" }}>
//                         <FormControl className={classes.formControl} error>
//                             <TextField
//                                 className={classes.textField}
//                                 id="select-label"
//                                 select
//                                 label="Select Floor"
//                                 value={floorSelected}
//                                 onChange={handleFloorChange}
//                                 InputProps={{ classes: { underline: classes.underline } }}
//                             >
//                                 {floors.map(_floor =>
//                                     <MenuItem key={_floor.uuid} value={_floor.uuid} className={classes.menu}>{_floor.name}</MenuItem>
//                                 )}
//                             </TextField>
//                             {errorMsg.floor !== "" &&
//                                 <FormHelperText className={classes.menu}>{errorMsg.floor}</FormHelperText>
//                             }
//                         </FormControl>
//                         <Grid container justify="space-around">
//                             <FormControl  >
//                                 {/* <TextField
//                                     className={classes.textField}
//                                     margin="normal"
//                                     id="from-datetime-local"
//                                     label="From"
//                                     type="datetime-local"
//                                     InputProps={{
//                                         inputProps: {
//                                             min: moment(fromDateTime).format("YYYY-MM-DDTHH:mm")
//                                         },
//                                         classes: { underline: classes.underline }
//                                     }}
//                                     value={moment(fromDateTime).format("YYYY-MM-DDTHH:mm")}
//                                     onChange={onDateChange}
//                                 /> */}
//                                 <DateTimePickerComponent step={15} onChange={onDateChange} value={moment(fromDateTime).format("YYYY-MM-DDTHH:mm")} />
//                             </FormControl>
//                             <FormControl error>
//                                 {/* <TextField
//                                     className={classes.textField}
//                                     margin="normal"
//                                     id="to-datetime-local"
//                                     label="To"
//                                     type="datetime-local"
//                                     InputProps={{
//                                         inputProps: {
//                                             min: moment(toDateTime).format("YYYY-MM-DDTHH:mm")
//                                         },
//                                         classes: { underline: classes.underline }
//                                     }}
//                                     value={moment(toDateTime).format("YYYY-MM-DDTHH:mm")}
//                                     onChange={event => setToDateTime(event.target.value)}
//                                 /> */}
//                                     <DateTimePickerComponent step={15} onChange={event => setToDateTime(event.target.value)} value={moment(toDateTime).format("YYYY-MM-DDTHH:mm")} />
//                                 {errorMsg.date !== "" &&
//                                     <FormHelperText className={classes.menu}>{errorMsg.date}</FormHelperText>
//                                 }
//                             </FormControl>
//                         </Grid>
//                         <div>
//                             <Button variant="contained"
//                                 color="info"
//                                 style={{ marginTop: "2%" }}
//                                 onClick={function (event) { getZones(); getZones() }}>
//                                 Search
//                             </Button>
//                             {errorMsg.card !== "" &&
//                                 <Snackbar open={openAlert} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
//                                     <Alert onClose={handleClose} severity="error" className={classes.menu}>
//                                         {errorMsg.card}
//                                     </Alert>
//                                 </Snackbar>
//                             }
//                         </div>
//                         {isSearchClicked &&
//                         // <Grid container spacing={3} justify="center" alignItems="center" >
//                             <Box style={{ "position": "relative", "marginLeft": "-10%" }}>
//                                 <div style={{ "marginTop": "5%" }}>
//                                     <Map
//                                         ref={mapRef}
//                                         doubleClickZoom={false}
//                                         zoomControl={true}
//                                         dragging={true}
//                                         scrollWheelZoom={false}
//                                         crs={Leaflet.CRS.Simple}
//                                         center={[0,0]}
//                                         bounds={[[0,0],[414,843]]}
//                                         className={classes.bounds}
//                                         // eventHandlers={{click:handlemapclick}}
//                                         // whenReady={(area) =>handlemapclick(area)}
//                                         // onclick={(area)=>handlemapclick(area)}
//                                     >
//                                         {
//                                         mapDetails.map((_each)=>
//                                         <Rectangle bounds={_each.coordinates} fillColor={_each.color} fillOpacity={0.7} 
//                                           onclick={()=>handlemapclick(_each)} onmouseover={()=>enterArea(_each)} onmouseout={()=>leaveArea(_each)}/>
//                                         )
//                                         }
//                                         <ImageOverlay
//                                         interactive
//                                         url={'https://localhost/Floor-1.jpg'}
//                                         ref={imgRef}
//                                         bounds={[[0,0],[414,843]]}
//                                         />
//                                     </Map>
//                                     {hoveredArea &&
//                                         <span className={classes.tooltip}
//                                         style={{ ...getTipPosition(hoveredArea) }}>
//                                             {hoveredArea && hoveredArea.description}
//                                         </span>
//                                     }
//                                 </div>
//                             </Box>
//                             // </Grid>
//                             // </Box>
//                         }
//                     </div>
//                 )

//             }

//             case 1: {
//                 return (
//                     <div style={{ textAlign: "center" }}>
//                         <FormControl className={classes.formControl} error>
//                             <TextField
//                                 className={classes.textField}
//                                 required
//                                 id="email"
//                                 type="email"
//                                 label="E-Mail ID"
//                                 value={visitorDetails.email}
//                                 InputProps={{ classes: { underline: classes.underline } }}
//                                 // onChange={event => changeFormFields(event, "email")} 
//                                 onChange={event => getUserDetails(event.target.value)}
//                             />
//                         </FormControl>
//                         {errorMsg.email !== "" &&
//                             <Snackbar open={openAlert} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
//                                 <Alert onClose={handleClose} severity="error" className={classes.menu}>
//                                     {errorMsg.email}
//                                 </Alert>
//                             </Snackbar>
//                         }
//                         {/* <div> */}
//                             {userDetails.length !== 0 &&
//                                 <GridContainer>
//                                     <GridItem xs={10} sm={12} md={12}>
//                                         <Card>
//                                             <CardHeader color="info"
//                                                 style={{
//                                                     height: '25px',
//                                                     display: 'flex',
//                                                     justifyContent: 'flex-start',
//                                                     alignItems: 'center'
//                                                 }} CWS>
//                                                 <h4 className={classes.cardTitleWhite}>Users</h4>
//                                             </CardHeader>
//                                             <CardBody>
//                                                 <Table
//                                                     tableHeaderColor="info"
//                                                     // tableHead={["", "User ID", "Name", "E-mail ID", "Contact Number"]}
//                                                     tableHead={["","User ID", "Name", "E-mail ID", "Contact Number"]}
//                                                     tableData={userDetails.map((_user) => (
//                                                         [
//                                                             (<Checkbox
//                                                                 value={_user.uuid}
//                                                                 checked={selectedUser.id === _user.id}
//                                                                 onChange={(event) => handleCheckBox(event, _user)}
//                                                             />),
//                                                             _user.uuid,
//                                                             _user.name,
//                                                             _user.email_id,
//                                                             _user.phone_no
//                                                             // _user.user_id,
//                                                             // _user.user_name,
//                                                             // _user.user_email,
//                                                             // _user.user_contact_no
//                                                         ]
//                                                     ))}
//                                                 />
//                                             </CardBody>
//                                         </Card>
//                                     </GridItem>
//                                 </GridContainer>
//                                 // <Table>
//                                 //     <TableHead>
//                                 //         <TableRow>
//                                 //             <StyledTableCell></StyledTableCell>
//                                 //             <StyledTableCell>User ID</StyledTableCell>
//                                 //             <StyledTableCell>Name</StyledTableCell>
//                                 //             <StyledTableCell>E-mail ID</StyledTableCell>
//                                 //             <StyledTableCell>Contact Number</StyledTableCell>
//                                 //         </TableRow>
//                                 //     </TableHead>
//                                 //     <TableBody>
//                                 //         {userDetails.map((_user) => (
//                                 //             <StyledTableRow key={_user.id}>
//                                 //                 <StyledTableCell padding="checkbox">
//                                 //                     <Checkbox
//                                 //                         value={_user.user_id}
//                                 //                         checked={selectedUser.id === _user.user_id}
//                                 //                         onChange={(event) => handleCheckBox(event, _user)}
//                                 //                     />
//                                 //                 </StyledTableCell>
//                                 //                 <StyledTableCell component="th" scope="row">
//                                 //                     {_user.user_id}
//                                 //                 </StyledTableCell>
//                                 //                 <StyledTableCell>{_user.user_name}</StyledTableCell>
//                                 //                 <StyledTableCell>{_user.user_email}</StyledTableCell>
//                                 //                 <StyledTableCell>{_user.user_contact_no}</StyledTableCell>
//                                 //             </StyledTableRow>
//                                 //         ))}
//                                 //     </TableBody>
//                                 // </Table>
//                             }
//                         {/* </div> */}
//                     </div>
//                 )
//             }

//             case 2: {
//                 return (
//                     <div style={{  textAlign: "center",padding:"25px" }}>
//                         <Grid container spacing={5} justify="center" alignItems="center" className={classes.confirmationGrid}>
//                             <GridContainer>
//                                 <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>                            <CheckCircleIcon style={{ fontSize: 100, color: green[500] }} />
//                             <Typography className={classes.snackbar} color="textPrimary" variant="h6" >Your Seat is booked successfully !!</Typography>
//                             <div >
//                                 <Typography className={classes.snackbar} color="textSecondary" variant="body2">Seats: {selectedDetails.map(_e => _e.name + ",")}</Typography>
//                                 <Typography className={classes.snackbar} color="textSecondary" variant="body2">From: {moment(fromDateTime).format("YYYY-MM-DD HH:mm")}</Typography>
//                                 <Typography className={classes.snackbar} color="textSecondary" variant="body2">To: {moment(toDateTime).format("YYYY-MM-DD HH:mm")}</Typography>
//                             </div>
//                             <Typography className={classes.snackbar} color="textPrimary" variant="subtitle1">Your Seat ID & Passcode will be sent to your registered e-mail ID</Typography>
//                             <div style={{marginTop:'12px'}}>
//                             <AddToCalendar className={classes1} event={event} buttonLabel = " ADD TO MY CALENDAR " />
//                             </div>
//                             {/* <div>
//                                 <Button
//                                     onClick={() => setClickedOk(true)}
//                                     variant="contained" color="info"
//                                 >
//                                     OK
//                                 </Button>
//                             </div> */}
//                             </GridItem> </GridContainer>
//                         </Grid>
//                     </div>
//                 )
//             }

//             default:
//                 return 'Unknown stepIndex';
//         }
//     }
//     const ColorlibConnector = withStyles({
//         active: {
//             // "& $line": {
//             //   backgroundImage:
//             //     "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
//             // }
//             backgroundColor: "#26c6da"
//         },
//         completed: {
//             // "& $line": {
//             //   backgroundImage:
//             //     "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
//             // }
//             backgroundColor: "#26c6da"
//         },
//         line: {
//             height: 3,
//             border: 0,
//             // backgroundColor: '#eaeaf0',
//             backgroundColor: '#ccc',
//             borderRadius: 1
//         }
//     })(StepConnector);

//     const useColorlibStepIconStyles = makeStyles({
//         root: {
//             backgroundColor: "#ccc",
//             zIndex: 1,
//             color: "#fff",
//             width: 30,
//             height: 30,
//             display: "flex",
//             borderRadius: "50%",
//             justifyContent: "center",
//             alignItems: "center"
//         },
//         active: {
//             // backgroundImage:
//             //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
//             // boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)"
//             color: "white",
//             backgroundColor: "#26c6da"
//         },
//         completed: {
//             // backgroundImage:
//             //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)"
//             backgroundColor: "#26c6da"
//         }
//     });

//     function ColorlibStepIcon(props) {
//         const classes = useColorlibStepIconStyles();
//         const { active, completed } = props;

//         const icons = {
//             1: 1,
//             2: 2,
//             // 3: <VideoLabelIcon />
//         };

//         return (
//             <div
//                 className={clsx(classes.root, {
//                     [classes.active]: active,
//                     [classes.completed]: completed
//                 })}
//             >
//                 {icons[String(props.icon)]}
//             </div>
//         );
//     }

//     ColorlibStepIcon.propTypes = {
//         active: PropTypes.bool,
//         completed: PropTypes.bool,
//         icon: PropTypes.node
//     };


//     const handleBack = () => {
//         setActiveStep(prevActiveStep => prevActiveStep - 1);
//     };

//     const steps = getSteps();

//         return (
//             <Container maxWidth="lg">
//                 <div>
//                     <Stepper activeStep={activeStep} alternativeLabel className={classes.root} connector={<ColorlibConnector />}>
//                         {steps.map(label => (
//                             <Step key={label}>
//                                 <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
//                             </Step>
//                         ))}
//                     </Stepper>
//                     <div style={{ marginTop: '2%' }}>
//                         {activeStep === steps.length ? (
//                             <div>
//                                 {getStepContent(activeStep)}
//                             </div>
//                         ) : (
//                                 <div style={{ marginTop: '2%' }}>
//                                     {getStepContent(activeStep)}
//                                     <div className={classes.button} >
//                                         <Button
//                                             disabled={activeStep === 0}
//                                             onClick={handleBack}
//                                             className={classes.backButton}
//                                         >
//                                             Back
//                                     </Button>
//                                         <Button variant="contained" color="info" onClick={handleNext}>
//                                             {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
//                                         </Button>
//                                     </div>
//                                 </div>
//                             )}
//                     </div>
//                 </div>
//             </Container>
//         )
// }