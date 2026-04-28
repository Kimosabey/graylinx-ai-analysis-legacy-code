// import React, { useEffect } from 'react';
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
//     TextField,
// } from '@material-ui/core';
// import Button from "components/CustomButtons/Button.js";
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// import api from '../../api';
// import MuiAlert from '@material-ui/lab/Alert';
// import 'date-fns';
// import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// import { red, green } from '@material-ui/core/colors';
// import Snackbar from '@material-ui/core/Snackbar';
// import moment from 'moment';
// import Box from '@material-ui/core/Box';
// import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
// import "../../assets/css/syncfusion-material.css";

// const MAP = require('../../assets/Data/seats-list.json');

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
//         },
//         '&:after': {
//             borderBottomColor: infoColor[0],
//         },
//         '&:hover:before': {
//             borderBottomColor: [infoColor[0], '!important'],
//         },
//     },
//     textField: {
//         "& .MuiOutlinedInput-input": {
//             color: "gray",
//         },
//         "& .MuiInputLabel-root": {
//             color: "gray",
//         },
//         "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//             borderColor: "gray",
//         },
//         "&:hover .MuiOutlinedInput-input": {
//             color: infoColor[0],
//         },
//         "&:hover .MuiInputLabel-root": {
//             color: infoColor[0],
//         },
//         "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//             borderColor: infoColor[0],
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
//             color: "gray",
//         },
//         "& .MuiInputLabel-root.Mui-focused": {
//             color: infoColor[0],
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//             borderColor: infoColor[0],
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
//         width: "50%"
//     },
//     lastFormControl: {
//         margin: theme.spacing(1),
//         textAlign: "center",
//         width: "10%"
//     },
//     menu: {

//     },
//     snackbar: {
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
//     bounds: {
//         [theme.breakpoints.down('xs')]:
//             { height: "500px", width: "120px", marginTop: "3%" },
//         [theme.breakpoints.down('sm')]:
//             { height: '520px', marginTop: "3%" },
//         [theme.breakpoints.up('md')]:
//             { height: "520px", marginTop: "3%" },
//         [theme.breakpoints.up('xl')]:
//             { height: "700px", marginTop: "3%" }
//     },
//     button: {
//         marginTop: '2%', float: "right",
//         [theme.breakpoints.down('xs')]:
//             { float: 'left' },
//         [theme.breakpoints.down('sm')]:
//             { float: 'left' }
//     }
// }));

// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

// function getSteps() {
//     return ['Search and Select Seat(s)', 'Book Seat(s)'];
// }

// export default function BookHotDesk() {
//     const classes = useStyles();
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

//     useEffect(() => {
//         api.floor.floorList(localStorage.getItem("buildingID")).then(res => {
//             if (res) {
//                 const filteredArray = res.floors
//                     .filter(each => each.type === "wlms")
//                 setFloors(filteredArray)
//             }

//         })
//     }, [floorSelected])

//     const enterArea = (area) => {
//         setHoveredArea(area)
//     }
//     const leaveArea = (area) => {
//         setHoveredArea(null)
//     }
//     const getTipPosition = (area) => {
//         return {
//             top: `${area.center[1] - 25}px`, left: `${area.center[0]}px`,
//             position: "absolute",
//             color: "#fff", padding: "10px", background: "rgba(0,0,0,0.8)", transform: "translate3d(-50%, -50%, 0)",
//             borderRadius: "5px", pointerEvents: "none", zIndex: "1000"
//         }
//     };


//     const getZones = async () => {
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
//                 await api.zones.bookedSeatsList(floorSelected, data).then(res => {
//                     setMapDetails(res)
//                     setIsSearchClicked(true)
//                 })
//             }
//             else {
//                 setErrorMsg({ ...errorMsg, date: "Minimum time chosen should be 30 mins ahead of From time" })
//             }
//         } else {
//             setErrorMsg({ ...errorMsg, floor: "Floor is Required" })
//         }
//     }

//     const handleFloorChange = (event, data) => {
//         setFloorSelected(event.target.value)
//         setSelectedFloorName(data.props.children)
//         setErrorMsg({ ...errorMsg, floor: "" })
//         setIsSearchClicked(false)
//     };

//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return;
//         }
//         setOpenAlert(false);
//     };

//     const handleNext = () => {
//         switch (activeStep) {
//             case 0: {
//                 const data = {
//                     from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                     to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
//                     role_id: localStorage.getItem("roleID"),
//                     user_id: localStorage.getItem("userID"),
//                     no_of_seats: null,
//                     seatList: selectedDetails,
//                     // person_name: selectedUser.name,
//                     // email_id: selectedUser.email,
//                     // contact_no: selectedUser.phno
//                 }
//                 api.zones.bookHotdesk(data).then(res => {
//                     setActiveStep(prevActiveStep => prevActiveStep + 1);
//                 })
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
//                                     <MenuItem key={_floor.id} value={_floor.id} className={classes.menu}>{_floor.name}</MenuItem>
//                                 )}
//                             </TextField>
//                             {errorMsg.floor !== "" &&
//                                 <FormHelperText className={classes.menu}>{errorMsg.floor}</FormHelperText>
//                             }
//                         </FormControl>
//                         <Grid container justify="space-around">
//                             <FormControl  >
//                                 <DateTimePickerComponent step={15} onChange={onDateChange} value={moment(fromDateTime).format("YYYY-MM-DDTHH:mm")} />
//                             </FormControl>
//                             <FormControl error>
//                                 <DateTimePickerComponent step={15} onChange={event => setToDateTime(event.target.value)} value={moment(toDateTime).format("YYYY-MM-DDTHH:mm")} />
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
//                             <Grid container spacing={3} justify="center" alignItems="center" >
//                                 <Box style={{ "position": "relative", "marginLeft": "-10%" }}>
//                                     <div style={{ "marginTop": "5%" }}>
//                                         <ImageMapper
//                                             src={("https://localhost/" + selectedFloorName + ".jpg")}

//                                             map={mapDetails}
//                                             active={false}
//                                             className={classes.bounds}
//                                             onClick={area => {
//                                                 var flag = 0;
//                                                 var index;
//                                                 var i;
//                                                 let selected = selectedDetails;
//                                                 if (area.preFillColor != "rgba(179, 0, 0,0.7)") {
//                                                     area.preFillColor = "rgba(179, 0, 0,0.7)"
//                                                     for (i = 0; i < selected.length; i++) {
//                                                         if (selected[i].name == area.name) {
//                                                             flag = 1
//                                                             index = i
//                                                         }
//                                                     }
//                                                     if (flag === 0) {
//                                                         selected.push(area)
//                                                     }
//                                                     else {
//                                                         selected.splice(index, 1)
//                                                     }
//                                                     setSelectedDetails(selected)
//                                                     mapDetails.areas.map((_each, index) => {
//                                                         if (_each.name === area.name) {
//                                                             if (_each.preFillColor === "gray") {
//                                                                 _each.preFillColor = "green"
//                                                             }
//                                                             else {
//                                                                 _each.preFillColor = "gray"
//                                                             }
//                                                         }
//                                                     })
//                                                     setHoveredArea(area)
//                                                 }
//                                             }}
//                                             onMouseEnter={area => enterArea(area)}
//                                             onMouseLeave={area => leaveArea(area)}
//                                         />
//                                         {hoveredArea &&
//                                             <span className={classes.tooltip}
//                                                 style={{ ...getTipPosition(hoveredArea) }}>
//                                                 {hoveredArea && hoveredArea.name}
//                                             </span>
//                                         }
//                                     </div>
//                                 </Box>
//                             </Grid>
//                         }
//                     </div>
//                 )
//             }

//             case 1: {
//                 return (
//                     <div style={{ textAlign: "center", padding: "5px" }}>
//                         <Grid container spacing={5} justify="center" alignItems="center" className={classes.confirmationGrid}>
//                             <GridContainer>
//                                 <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>                            <CheckCircleIcon style={{ fontSize: 100, color: green[500] }} />
//                                     <Typography className={classes.snackbar} color="textPrimary" variant="h6" >Your Seat is booked successfully !!</Typography>
//                                     <div >
//                                         <Typography className={classes.snackbar} color="textSecondary" variant="body2">Seats: {selectedDetails.map(_e => _e.name + ",")}</Typography>
//                                         <Typography className={classes.snackbar} color="textSecondary" variant="body2">From: {moment(fromDateTime).format("YYYY-MM-DD HH:mm")}</Typography>
//                                         <Typography className={classes.snackbar} color="textSecondary" variant="body2">To: {moment(toDateTime).format("YYYY-MM-DD HH:mm")}</Typography>
//                                     </div>
//                                     <Typography className={classes.snackbar} color="textPrimary" variant="subtitle1">Your Seat ID & Passcode will be sent to your registered e-mail ID</Typography>

//                                 </GridItem> </GridContainer>
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
//             backgroundColor: "#26c6da"
//         },
//         completed: {
//             backgroundColor: "#26c6da"
//         },
//         line: {
//             height: 3,
//             border: 0,
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
//             color: "white",
//             backgroundColor: "#26c6da"
//         },
//         completed: {
//             backgroundColor: "#26c6da"
//         }
//     });

//     function ColorlibStepIcon(props) {
//         const classes = useColorlibStepIconStyles();
//         const { active, completed } = props;

//         const icons = {
//             1: 1,
//             2: 2,
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

//     return (
//         <Container maxWidth="lg">
//             <div>
//                 <Stepper activeStep={activeStep} alternativeLabel className={classes.root} connector={<ColorlibConnector />}>
//                     {steps.map(label => (
//                         <Step key={label}>
//                             <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
//                         </Step>
//                     ))}
//                 </Stepper>
//                 <div style={{ marginTop: '2%' }}>
//                     {activeStep === steps.length - 1 ? (
//                         <div>
//                             {getStepContent(activeStep)}
//                         </div>
//                     ) : (
//                         <div style={{ marginTop: '2%' }}>
//                             {getStepContent(activeStep)}
//                             <div className={classes.button} >
//                                 <Button
//                                     disabled={activeStep === 0}
//                                     onClick={handleBack}
//                                     className={classes.backButton}
//                                 >
//                                     Back
//                                     </Button>
//                                 <Button variant="contained" color="info" onClick={handleNext}>
//                                     {activeStep === 0 ? 'Finish' : null}
//                                 </Button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </Container>
//     )
// }