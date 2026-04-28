import React, {useRef, useEffect } from 'react';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import {
  infoColor
} from "assets/jss/material-dashboard-react.js";
import ImageMapper from 'react-image-mapper';
import PropTypes from 'prop-types';
import StepConnector from "@material-ui/core/StepConnector";
import clsx from "clsx";
import { MapInteractionCSS } from 'react-map-interaction';
import {
  Container,
  FormControl,
  ListItemText,
  Typography,
  Stepper,
  Step,
  Select,
  Input,
  InputLabel,
  StepLabel,
  Grid,
  MenuItem,
  FormHelperText,
  Checkbox,
  TextField,
  Divider
} from '@material-ui/core';
import Button from "components/CustomButtons/Button.js";
// import CustomTextField from "components/CustomTextField/CustomTextField.js";
import Table from "components/Table/Table.js";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import api from '../../api';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
  KeyboardDatePicker
} from '@material-ui/pickers';
import 'date-fns';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DateFnsUtils from '@date-io/date-fns';
import { red, green } from '@material-ui/core/colors';
// import moment from 'moment';
const { compareAsc, format,addDays,subDays,addMonths,getUnixTime,differenceInMilliseconds } = require('date-fns');
import { format, compareAsc } from 'date-fns'
import { SignalCellularNull } from '@material-ui/icons';
import { map } from 'leaflet';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';
import { navigate } from '@reach/router';
import ListMeetingRooms from './ListMeetingRooms.js';
import Modal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';
import { DateTimePickerComponent } from '@syncfusion/ej2-react-calendars';
import "../../assets/css/syncfusion-material.css";
import AddToCalendar from 'react-add-to-calendar';
import style from './style.css';
import { useSelector } from 'react-redux';
import {Map,ImageOverlay,Popup,Marker,Tooltip,Rectangle} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";

const Leaflet = require('leaflet');
const useStyles1 = makeStyles(style);
const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: "#EEEEEE",
    minWidth: '100px',
    // [theme.breakpoints.up('xl')]: {
    //   // width: '100px',
    //   fontSize:"45px"
    // },
  },
  stepper: {
    // [theme.breakpoints.up('xl')]: {
    //     marginTop:"40px",
    //     // width:"50%",
    //     transform: 'scale(3)',
    //     marginBottom:"40px"
    // },
  },
  test: {
    // [theme.breakpoints.up('xl')]: {
    //   // fontSize: "45px",
    //   padding:"10px"
    // },
  },
  textField: {
    // [theme.breakpoints.up('xl')]: {
    //     fontSize: "45px",
    //     height:"108px",
    //     padding:"23px"
    // },
    "& .MuiOutlinedInput-input": {
      color: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "& .MuiInputLabel-root": {
      color: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "50px",
      //   padding:"20px",
      //   lineHeight:"2px"
      // },
    },
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "&:hover .MuiOutlinedInput-input": {
      color: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "&:hover .MuiInputLabel-root": {
      color: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
      color: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
  },

  underline: {
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "50px",
    // },
    '&:before': {
      borderBottomColor: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    '&:after': {
      borderBottomColor: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
    '&:hover:before': {
      borderBottomColor: [infoColor[0], '!important'],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "45px",
      // },
    },
  },
  select: {
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "55px",
    // },
    '&:before': {
      color: "gray",
      borderColor: "gray",
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "55px",
      // },
    },
    '&:after': {
      color: infoColor[0],
      borderColor: infoColor[0],
      // [theme.breakpoints.up('xl')]: {
      //   fontSize: "55px",
      // },
    }
  },
  inputLabel: {
    color: "gray",
    "&.Mui-focused": {
      color: infoColor[0],
    },
    // [theme.breakpoints.up('xl')]: {
    //   fontSize:"52px",
    // },
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    textAlign: "center",
    width: "50%",
    // [theme.breakpoints.up('xl')]: {
    //   margin: theme.spacing(1),
    //   width: "100%",
    // },
  },
  timeInput: {
    margin: theme.spacing(1),
    textAlign: "center",
    width: "100%",
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  media: {
    minHeight: "150px",
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  item: {
    minWidth: "300px",
    margin: "1em",
    textAlign: "left",
    boxSizing: "border-box",
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  cardAction: {
    display: "block",
    minWidth: "370px",
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  avatar: {
    backgroundColor: red[500],
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  confirmationGrid: {
    display: "flex",
    flexDirection: "column",
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  alert: {
    width: '50%',
    // [theme.breakpoints.up('xl')]: {
    //   fontSize: "45px",
    // },
  },
  menu: {
    // [theme.breakpoints.up('xl')]: {
    //     fontSize: "45px",
    // }
  },
  snackbar: {
    // [theme.breakpoints.up('xl')]: {
    //     fontSize: "50px",
    // }
  },
  bounds: {
    [theme.breakpoints.down('xs')]:
      { height: "500px", width: "120px", marginTop: "3%" },
    [theme.breakpoints.down('sm')]:
      { height: '520px', marginTop: "3%" },
    [theme.breakpoints.up('md')]:
      { height: "520px", marginTop: "3%" },
    [theme.breakpoints.up('xl')]:
      { height: "700px", marginTop: "3%" }
  },
  button: {
    marginTop: '2%',
    float: "right",
    [theme.breakpoints.down('xs')]:
      { float: 'left' },
    [theme.breakpoints.down('sm')]:
      { float: 'left' }
  },
  reactaddtocalendarbutton:{
    color:'black'
  },
  text:{
    [theme.breakpoints.down('xs')]:
      {marginBottom:'25px'}
  }
  // }
}));

const checkBoxTheme = createMuiTheme({
  palette: {
    secondary: {
      main: infoColor[0],
    },
  },
});
//style={{"fontSize":"50px"}} 
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function getSteps() {
  return ['Search and Select Meeting Room', 'Booking Details'];
}

export default function BookMeetingRoom() {
  const classes = useStyles();
  const classes1 = useStyles1();
  const mapRef = React.createRef();
  const imgRef = useRef(null);
  const [activeStep, setActiveStep] = React.useState(0);
  const [floors, setFloors] = React.useState([])
  const [fromDateTime, setFromDateTime] = React.useState(new Date());
  const [fromTime, setFromTime] = React.useState("")
  const [toTime, setToTime] = React.useState("")
  const [customToTime, setCustomToTime] = React.useState("")
  const [toDateTime, setToDateTime] = React.useState(new Date());
  const [isSearchClicked, setIsSearchClicked] = React.useState(false);
  const [floorSelected, setFloorSelected] = React.useState("");
  const [selectedFloorName, setSelectedFloorName] = React.useState("");
  const [noOfAttendies, setNoOfAttendies] = React.useState("");
  const [facilities, setFaclities] = React.useState([]);
  const [chosenFacility, setChosenFacility] = React.useState([]);
  const [openAlert, setOpenAlert] = React.useState(false);
  const [mapDetails, setMapDetails] = React.useState({});
  const [hoveredArea, setHoveredArea] = React.useState(null);
  const [selectedDetails, setSelectedDetails] = React.useState([]);
  const [userDetails, setUserDetails] = React.useState([])
  const [roomname, setRoomname] = React.useState("");
  const [isclicked, setIsclicked] = React.useState(false);
  const [openModal, setOpenModal] = React.useState(false);
  const [selecteddata,setSelecteddata] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState({
    id: "",
    name: "",
    phno: "",
    email: ""
  })
  const [visitorDetails, setVisitorDetails] = React.useState({
    name: "",
    phno: "",
    email: ""
  })
  const [errorMsg, setErrorMsg] = React.useState({
    name: "",
    phno: "",
    email: "",
    floor: "",
    attendies: "",
    card: "",
    date: "",
    fromTime: "",
    toTime: "",
    customToTime: ""
  })
  const [floorid,setFloorid] = React.useState("");
  const buildingID = useSelector(state => state.isLogged.data.zones[0])
  const locations = [
    {
        coordinates: { x: 160, y: 475 },
        name: "Graylinx-Bengaluru Co-Space",
        iconName: "bng.png"
    },
    {
        coordinates: { x: 225, y: 390 },
        name: "Graylinx-Mumbai Co-space",
        iconName: "mumbai.png"
    }
]
var newarr;
const userID = useSelector(state => state.isLogged.data.user.id)

  useEffect(() => {
    // api.floor.floorList(localStorage.getItem("buildingID")).then(res => {
      // api.floor.floorList("55a47599-34b5-465c-b8ae-386ea658d0d5").then(res => {
      api.floor.floorList(buildingID).then(res=> {
      if (res) {
        // const filteredArray = res.floors
        //   .filter(each => each.type === "wlms")
        // setFloors(filteredArray)
        // const filteredArray = res.map((i,index)=>i.children.map((el,i)=>el.name))
        // const filteredArray = res.map((i,index)=>i.children)
        // console.log("filtredarray",filteredArray)
        setFloors(res[0].children)
      }
    })
  }, [floorSelected])

  let event = {
    title: selectedDetails.map(_e => _e.name),
    description: selectedDetails.map(_e => _e.description),
    location: 'Portland, OR',
    startTime: "2021-07-19T20:15:00+05:30",
    endTime: "2021-07-19T21:45:00+05:30"
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };
  
  const handleLocationClick = (name) => {
    // if (name === "Graylinx-Bengaluru Co-Space") {
    // navigate('/floors')
    // props.selectContext("building", "Floors", name, id)
    // } else return   
  };
  
  const handleFloorChange = (event, data) => {
   
    setFloorSelected(event.target.value)
    setSelectedFloorName(data.props.children)
    setFloorid(data)
    // let unique = []
    // api.zones.zoneList(event.target.value).then(resZone => {
    //   if (resZone) {
    //     const filteredArray = resZone.zones
    //       .filter(each => each.type === "meeting_room" && each.description)
    //       .map(each =>
    //         (each.description.split(","))).flat()
    //     for (var index in filteredArray) {
    //       filteredArray[index] = filteredArray[index].trim()
    //     }
    //     unique = Array.from(new Set(filteredArray));
    //   }
    //   setFaclities(unique)
    // })
    setErrorMsg({ ...errorMsg, floor: "" })
    setIsSearchClicked(false)
  };

  const handleAttendiesChange = (event, data) => {
    setNoOfAttendies(event.target.value)
    setErrorMsg({ ...errorMsg, attendies: "" })
  };
  const handlenavigation = () => {
    const meeting_room = selectedDetails.map(_e => _e.name)
    // setRoomname(clientData.name)
    setRoomname(meeting_room)
    setIsclicked(true);
    setOpenModal(true)
  }
  const handleModalClose = () => {
    setOpenModal(false)
    setIsclicked(false)
  }

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 150
      }
    },
  };


  const handleComponentChange = (event) => {
    setChosenFacility(event.target.value);
  };

  const onDateChange = (event) => {
    let formated = format(new Date(event.target.value), 'yyyy-MM-dd HH:mm:ss')
    // let formated = moment(event.target.value).format("YYYY-MM-DDTHH:mm")
    setFromDateTime(formated)
  }

  const getFacilitiesJSON = () => {
    var param = "";
    if (!chosenFacility) {
      param = null
    } else {
      chosenFacility.forEach(val => {
        param += "&facility=" + val.trim()
      })
    }
    return param;
  }

  const searchRooms = (req, facilities, noOfAttendies) => {
   
    var id = floorid.props.value
    var zone_type = "GL_LOCATION_TYPE_ROOM"
   
    api.floor.getMeetingRooms(id,zone_type,req.from,req.to,noOfAttendies).then(res => {
     
      res.forEach((item,index)=>{
        item.coordinates=JSON.parse(item.coordinates)
        if(index==res.length-1){
          setMapDetails(res)
          setIsSearchClicked(true)
        }
      })
    
      // setSelectedFloorName(selectedFloorName.props.name)
      setSelectedFloorName(selectedFloorName)
    }).catch(err => {
      console.log("Exception:", err)
    })
    setTimeout(() => {
     
      console.log("details",mapDetails)
    }, 90000);
  }

  const clickSearch = () => {
    var from = format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm'+ ":00")
    var to = format(new Date(toDateTime), 'yyyy-MM-dd HH:mm'+ ":00")
    var diff = differenceInMilliseconds(new Date(to),new Date(from))
    // var diff = moment.duration(moment(to).diff(moment(from)));
    // var to = moment(toDateTime).format("YYYY-MM-DD HH:mm"+ ":00");
    // var from = moment(fromDateTime).format("YYYY-MM-DD HH:mm"+ ":00");
    // console.log("search clicked")
    // console.log("buildingid",buildingID)
    if (floorSelected !== "") {
      if (noOfAttendies !== "") {
        // if ((diff._data.days >= 0 && diff._data.minutes >= 30 || diff._data.hours >= 1
        //   || diff._data.days >= 1 || diff._data.months >= 1 || diff._days >= 1) || (diff._data.days >= 0 && diff._data.minutes < 0
        //     || diff._data.hours < 0 || diff._data.days < 0 && diff._data.months < 0 || diff._days < 0)) {
        if (diff._data.minutes >= 30 || diff._data.hours >= 1
          || diff._data.days >= 1 || diff._data.months >= 1) {
          setErrorMsg({ ...errorMsg, date: "" })
          const params = {
            from: from,
            to: to
          }
          const facility = getFacilitiesJSON()
          searchRooms(params, facility, noOfAttendies);
        }
        else {
          setErrorMsg({ ...errorMsg, date: "Minimum time chosen should be 30 mins ahead of From time" })
        }
      }
      else {
        setErrorMsg({ ...errorMsg, attendies: "No of attendees is Required" })
      }
    } else {
      setErrorMsg({ ...errorMsg, floor: "Floor is Required" })
    }
  }
  const enterArea = (area) => {
    setHoveredArea(area)
  }
  const leaveArea = (area) => {
    setHoveredArea(null)
  }

  const getTipPosition = (area) => {
    return {
      top: `12px`,
      position: "absolute",
      color: "#fff", padding: "10px", background: "rgba(0,0,0,0.8)", transform: "translate3d(-50%, -50%, 0)",
      borderRadius: "5px", pointerEvents: "none", zIndex: "1000"
    }
  };

  const handlemapclick = (area) =>{
   
    setSelecteddata(area)
    // const arr = mapDetails.map((_each)=>_each)
    // console.log("arr",arr)
    // console.log("arr.status",mapDetails.map((_o)=>_o.status))
    var flag = 0;
    var index;
    var i;
    let selected = selectedDetails;
    if (area.status == "available") {
      if(area.color == "rgba(179, 0, 0,0.7)") {
        setErrorMsg({ ...errorMsg, card: "This room is booked" })
        setOpenAlert(true)
       } 
       else {
         area.color = "rgba(179, 0, 0,0.7)"
         for (i = 0; i < selected.length; i++) {
           if (selected[i].name == area.name) {
             flag = 1
             index = i
           }
         }
         if (flag === 0) {
           if (selected.length !== 0) {
             var prevSelected = selected.pop();
           }
           selected.push(area)
         }
         else {
           selected.splice(index, 1)
         }
         setSelectedDetails(selected)
         mapDetails.map((_each, index) => {
           if (_each.name === area.name) {
             if (_each.color === "gray") {
               _each.color = "green"
             }
             else {
               _each.color = "gray"
             }
           }
           if (prevSelected && _each.name === prevSelected.name) {
             _each.color = "green"
           }
         })
       }
       
    }
    else if (area.status == "attendees are not enough") {
      if(area.color == "rgba(179, 0, 0,0.7)") {
        setErrorMsg({ ...errorMsg, card: "This room is booked" })
        setOpenAlert(true)
       } else {
       setErrorMsg({ ...errorMsg, card: "Attendees are very less for booking this room" })
       setOpenAlert(true)
       }
    }
    else {
      if(area.color == "rgba(179, 0, 0,0.7)") {
        setErrorMsg({ ...errorMsg, card: "This room is booked" })
        setOpenAlert(true)
       } else {
       setErrorMsg({ ...errorMsg, card: "No of Attendies is more than room capacity" })
       setOpenAlert(true)
      }
    }
    setMapDetails(mapDetails)
    setHoveredArea(area)
  }

  const getStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0: {
        return (
           <div style={{ textAlign: "center" }} >
           <FormControl className={classes.formControl} error>
             <TextField
               className={classes.textField}
               required
               id="select-label"
               select
               label="Select Floor"
               value={floorSelected}
               onChange={handleFloorChange}
               InputProps={{ classes: { underline: classes.underline } }}
             >
               {floors.map(_floor => {  //onClick={event => handleFloorChange(event, _floor.name)}
                return <MenuItem key={_floor.uuid} value={_floor.uuid} className={classes.menu}>{_floor.name}</MenuItem>
                })}
             </TextField>
             {errorMsg.floor !== "" &&
               <FormHelperText className={classes.menu}>{errorMsg.floor}</FormHelperText>
             }
           </FormControl>
           <FormControl className={classes.formControl} error>
             <TextField
               size="medium"
               className={classes.textField}
               required
               id="no_of_attendies"
               type='number'
               label="No of Attendies"
               value={noOfAttendies}
               onChange={handleAttendiesChange}
               InputProps={{ classes: { underline: classes.underline } }}
             >
               No of Attendees
              </TextField>
             {errorMsg.attendies !== "" &&
               <FormHelperText className={classes.menu}>{errorMsg.attendies}</FormHelperText>
             }
           </FormControl>
           { floorSelected && facilities.length !== 0 && facilities !== undefined &&
             <FormControl small className={classes.formControl}>
               <InputLabel className={classes.inputLabel} id="demo-mutiple-name-label">Select facility</InputLabel>
               <Select
                 className={classes.select}
                 labelId="mutiple-checkbox-filter-deviceName"
                 id="mutiple-checkbox-filter-deviceName"
                 multiple
                 onChange={handleComponentChange}
                 value={chosenFacility}
                 input={<Input />}
                 renderValue={(selected) => (selected.map(value => value.charAt(0).toUpperCase() + value.slice(1))).join(",")}
                 MenuProps={MenuProps}>
                 {facilities.map((facility) => (
                   <MenuItem key={facility} value={facility} className={classes.menu}>
                     <ThemeProvider theme={checkBoxTheme}>
                       <Checkbox checked={chosenFacility.indexOf(facility) > -1} />
                       <ListItemText primary={facility.charAt(0).toUpperCase() + facility.slice(1)} />
                     </ThemeProvider>
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>}
           {/* <MuiPickersUtilsProvider utils={DateFnsUtils}  > */}
           {/* <Grid container justify="center" spacing={3}> */}
           <Grid container justify="space-around">
             <FormControl>
               {/* <TextField
                size="medium"
                  className={classes.textField}
                  margin="normal"
                  id="datetime-local"
                  label="From"
                  type="datetime-local"
                step="1800"
                  InputProps={{
                    inputProps: {
                      // step: 1800,
                      // min: moment(new Date()).format("YYYY-MM-DDTHH:mm")
                    },
                    classes: { underline: classes.underline }
                  }}
                  // value={moment(fromDateTime).format("YYYY-MM-DDTHH:mm")}
                  onChange={onDateChange}
               />
               /> */}
               <DateTimePickerComponent step={15} onChange={onDateChange} value={format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm:ss')} />
             </FormControl>
             <FormControl error>
               {/* <TextField
                size="medium"
                  className={classes.textField}
                  margin="normal"
                  id="datetime-local"
                  label="To"
                  type="datetime-local"
                  InputProps={{
                    inputProps: {
                      // min: moment(new Date()).format("YYYY-MM-DDTHH:mm")
                    },
                    classes: { underline: classes.underline }
                  }}
                  // value={moment(toDateTime).format("YYYY-MM-DDTHH:mm")}
                  onChange={event => setToDateTime(event.target.value)}
             />
              /> */}
               <DateTimePickerComponent step={15} onChange={event => setToDateTime(event.target.value)} value={format(new Date(toDateTime), 'yyyy-MM-dd HH:mm:ss')} />
               {errorMsg.date !== "" &&
                 <FormHelperText className={classes.menu}>{errorMsg.date}</FormHelperText>
               }
             </FormControl>
           </Grid>
           <Button variant="contained" color="info" style={{ marginTop: "2%" }} onClick={clickSearch}>
             Search
              </Button>
           {
             errorMsg.card !== "" &&
             <Snackbar open={openAlert} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
               <Alert onClose={handleClose} severity="error" className={classes.menu}>
                 {errorMsg.card}
               </Alert>
             </Snackbar>
           }
           {isSearchClicked &&
             <Box style={{ "position": "relative", backgroundColor: "#F5F3F3" }}>
               {/* <Box> */}
               <div style={{ "marginTop": "5%" }} >
                 {/* <MapInteractionCSS
                   showControls={true} > */}
                   {/* Image mapper part notepadd++ file:new3(not saved) */}
                  <Map
                    ref={mapRef}
                    doubleClickZoom={false}
                    zoomControl={true}
                    dragging={true}
                    scrollWheelZoom={false}
                    crs={Leaflet.CRS.Simple}
                    center={[0,0]}
                    bounds={[[0,0],[414,843]]}
                    className={classes.bounds}
                    // eventHandlers={{click:handlemapclick}}
                    // whenReady={(area) =>handlemapclick(area)}
                    // onclick={(area)=>handlemapclick(area)}
                  >
                    {
                      mapDetails.map((_each)=>
                        <Rectangle bounds={_each.coordinates} fillColor={_each.color} fillOpacity={0.7} 
                          onclick={()=>handlemapclick(_each)} onmouseover={()=>enterArea(_each)} onmouseout={()=>leaveArea(_each)}/>
                      )
                    }
                    {/* <Rectangle bounds={inner} fillColor={colors} fillOpacity={0.7} /> */}
                    <ImageOverlay
                      interactive
                      url={'https://localhost/Floor-1.jpg'}
                      ref={imgRef}
                      bounds={[[0,0],[414,843]]}
                    />
                  </Map>
                   {hoveredArea &&
                     <span className="tooltip"
                       style={{ ...getTipPosition(hoveredArea) }}>
                       {hoveredArea.description}<br></br> 
                          {"Capacity: " +hoveredArea.no_of_seats}
                     </span>
                   }
                 {/* </MapInteractionCSS> */}
               </div>
             </Box>
           }
          </div>
        )

      }

      case 1: {
        return (
          <div style={{ textAlign: "center" }}>
            <FormControl className={classes.formControl} error>
              <TextField
                className={classes.textField}
                required
                id="email"
                type="email"
                label="E-Mail ID"
                value={visitorDetails.email}
                InputProps={{ classes: { underline: classes.underline } }}
                onChange={event => getUserDetails(event.target.value)}
              />
            </FormControl>
            {errorMsg.email !== "" &&
              <Snackbar open={openAlert} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error" className={classes.menu}>
                  {errorMsg.email}
                </Alert>
              </Snackbar>
            }
            {userDetails.length !== 0 &&
              <GridContainer>
                <GridItem xs={10} sm={12} md={12} lg={12} xl={12}>
                  <Card >
                    <CardHeader color="info"
                      style={{
                        height: '25px',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                      }} >
                      <h4 className={classes.cardTitleWhite}>Users</h4>
                    </CardHeader>
                    <CardBody>
                      <Table
                        tableHeaderColor="info"
                        tableHead={["", "User ID", "Name", "E-mail ID", "Contact Number"]}
                        tableData={userDetails.map((_user) => (
                          [
                            (
                              <ThemeProvider theme={checkBoxTheme}>
                                <Checkbox
                                  value={_user.uuid}
                                  checked={selectedUser.id === _user.uuid}
                                  onChange={(event) => handleCheckBox(event, _user)}
                                />
                              </ThemeProvider>),
                              // <ThemeProvider theme={checkBoxTheme}>
                              //   <Checkbox
                              //     value={_user.user_id}
                              //     checked={selectedUser.id === _user.user_id}
                              //     onChange={(event) => handleCheckBox(event, _user)}
                              //   />
                              // </ThemeProvider>),
                            _user.uuid,
                            _user.name,
                            _user.email_id,
                            _user.phone_no
                            // _user.user_id,
                            // _user.user_name,
                            // _user.user_email,
                            // _user.user_contact_no
                          ]
                        ))}
                      />
                    </CardBody>
                  </Card>
                </GridItem>
              </GridContainer>
            }
          </div>
        )
      }

      case 2: {
        return (
          <div style={{ textAlign: "center", padding: "25px" }} >
            <Grid container spacing={6} justify="center" alignItems="center" className={classes.confirmationGrid}>
              <CheckCircleIcon style={{ fontSize: 100, color: green[500] }} />
              <Typography color="textPrimary" variant="h6" className={classes.snackbar}>Your Meeting Room is booked successfully !!</Typography>
              <div>
                <Typography className={classes.snackbar} color="textSecondary" >Meeting Room: {selectedDetails.map(_e => _e.name)}</Typography>
                <Typography className={classes.snackbar} color="textSecondary" variant="body2">From: {format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm')}</Typography>
                <Typography className={classes.snackbar} color="textSecondary" variant="body2">To: {format(new Date(toDateTime), 'yyyy-MM-dd HH:mm')}</Typography>
              </div>
              <Typography className={classes.snackbar} color="textPrimary" variant="subtitle1">Meeting ID & Passcode will be sent to your registered e-mail ID</Typography>
              <div>
                {/* <Button
                  className={classes.text}
                  onClick={handlenavigation}
                  variant="contained" color="info"
                >
                  Show Navigation
                 </Button>&nbsp;&nbsp; */}
                <AddToCalendar className={classes.AddToCalendar} event={event}
                  buttonLabel="ADD TO MY CALENDAR" />
              </div>
              {isclicked &&
                // <Modal style={{marginLeft:"15%",marginTop:"12%"}} open={openModal}>
                <Modal style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={openModal}>
                  <div>
                    <CloseIcon style={{ color: "red", background: "white", cursor: "pointer" }} onClick={handleModalClose} />
                    <ImageMapper
                      src={("/" + roomname + ".png")}
                    // src={("https://localhost/Conference-Room.jpg")}
                    />
                  </div>
                </Modal>
              }
            </Grid>
          </div>
        )
      }

      default:
        return 'Unknown stepIndex';
    }
  }
  const ColorlibConnector = withStyles({
    // alternativeLabel: {
    //   top: 22,
    // },
    active: {
      // "& $line": {
      //   backgroundImage:
      //     "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
      // }
      backgroundColor: "#26c6da"
    },
    completed: {
      // "& $line": {
      //   backgroundImage:
      //     "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
      // }
      backgroundColor: "#26c6da"
    },
    line: {
      height: 3,
      border: 0,
      // backgroundColor: '#eaeaf0',
      backgroundColor: '#ccc',
      borderRadius: 1
    }
  })(StepConnector);

  const useColorlibStepIconStyles = makeStyles({
    root: {
      backgroundColor: "#ccc",
      zIndex: 1,
      color: "#fff",
      width: 30,
      height: 30,
      display: "flex",
      borderRadius: "50%",
      justifyContent: "center",
      alignItems: "center"
    },
    active: {
      // backgroundImage:
      //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
      // boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)"
      color: "white",
      backgroundColor: "#26c6da"
    },
    completed: {
      // backgroundImage:
      //   "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)"
      backgroundColor: "#26c6da"
    }
  });

  function ColorlibStepIcon(props) {
    const classes = useColorlibStepIconStyles();
    const { active, completed } = props;

    const icons = {
      1: 1,
      2: 2,
      // 3: <VideoLabelIcon />
    };

    return (
      <div
        className={clsx(classes.root, {
          [classes.active]: active,
          [classes.completed]: completed
        })}
      >
        {icons[String(props.icon)]}
      </div>
    );
  }

  ColorlibStepIcon.propTypes = {
    active: PropTypes.bool,
    completed: PropTypes.bool,
    icon: PropTypes.node
  };


  const steps = getSteps();

  const getUserDetails = (value) => {
    setSelectedUser({ id: "", name: "", phno: "", email: "" })
    if (value === "") {
      setVisitorDetails({ ...visitorDetails, email: value })
      setErrorMsg({ ...errorMsg, email: "E-mail ID is Required" })
    } else {
      setVisitorDetails({ ...visitorDetails, email: value })
      setErrorMsg({ ...errorMsg, email: "" })
      api.users.getClientDetails(value).then(res => {
        setUserDetails(res)
      })
    }
  }

  const handleCheckBox = (event, user) => {
   
    setSelectedUser({
      id: user.uuid, name: user.name, phno: user.phone_no, email: user.email_id
    })
    // setSelectedUser({
    //   name: user.name, phno: user.phone_no, email: user.email_id
    // })
  }
  const handleNext = () => {
    navigate("/meeting-rooms")
    // <Route>
    // <Redirect to="/meeting-rooms" />
    // </Route>
    // console.log("list rooms")
    switch (activeStep) {
      case 0:
          // setActiveStep(prevActiveStep => prevActiveStep + 1);
        if (selectedDetails.length === 0) {
          setErrorMsg({ ...errorMsg, card: "Select a Meeting Room to proceed" })
          setOpenAlert(true)
        } else {
          setActiveStep(prevActiveStep => prevActiveStep + 1);
        }
        break;;
      case 1: {
        if (selectedUser.id === "") {
          setErrorMsg({ ...errorMsg, email: "Select a user to proceed" })
          setOpenAlert(true)
        }
        if (selectedUser.id !== "") {
          const req = {
            // zone_ids:["ff8cac11-6fed-49d5-8b18-756a7415b929","fda7c44c-d0f2-40c6-9a12-2f98335b1c3d"],
            // zone_ids:["1c09dadb-89bf-469c-8cf2-73b8a888efe0","55a0e728-bd5b-4a54-b4aa-3a4306cf2320"],
            zone_ids:[selecteddata.uuid],
            // user_id:"7468abec-5870-4dca-a92a-60aa8ae3720c",
            user_id:userID,
            from: format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm'+ ":00"),
            to : format(new Date(toDateTime), 'yyyy-MM-dd HH:mm'+ ":00")
            // from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
            // to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
          }
          // const req = {
          //   from: moment(fromDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
          //   to: moment(toDateTime).format("YYYY-MM-DD HH:mm" + ":00"),
          //   person_name: selectedUser.name,
          //   user_id: selectedUser.id,
          //   email_id: selectedUser.email,
          //   contact_no: selectedUser.phno,
          //   no_of_attendees: 5,
          //   roomsList: selectedDetails
          // }
          api.floor.bookMeetingRoom(req).then(res => {
           
            setActiveStep(prevActiveStep => prevActiveStep + 1);
          })
        }
      }
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };


  return (
    <Container maxWidth="lg">
      <div>
        <Stepper activeStep={activeStep} alternativeLabel className={classes.root} connector={<ColorlibConnector />}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div style={{ marginTop: '2%' }}>
          {activeStep === steps.length ? (
            <div>
              {getStepContent(activeStep)}
            </div>
          ) : (
            <div style={{ marginTop: '2%' }}>
              {getStepContent(activeStep)}
              <div className={classes.button}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className={classes.backButton}
                >
                  Back
                 </Button>
                <Button variant="contained" color="info" onClick={handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}