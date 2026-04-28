import React, { useEffect } from 'react';
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
const { compareAsc, format,differenceInMilliseconds } = require('date-fns');
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

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: "#EEEEEE",
        minWidth: '100px',
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
        "& .MuiOutlinedInput-input": {
            color: "gray"
        },
        "& .MuiInputLabel-root": {
            color: "gray"
        },
        "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
            borderColor: "gray"
        },
        "&:hover .MuiOutlinedInput-input": {
            color: infoColor[0]
        },
        "&:hover .MuiInputLabel-root": {
            color: infoColor[0]
        },
        "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
            borderColor: infoColor[0]
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
            color: "gray"
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: infoColor[0]
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: infoColor[0]
        },
    },

    underline: {
        '&:before': {
            borderBottomColor: "gray"
        },
        '&:after': {
            borderBottomColor: infoColor[0]
        },
        '&:hover:before': {
            borderBottomColor: [infoColor[0], '!important'],
        },
    },
    select: {
        '&:before': {
            color: "gray",
            borderColor: "gray"
        },
        '&:after': {
            color: infoColor[0],
            borderColor: infoColor[0]
        }
    },
    inputLabel: {
        color: "gray",
        "&.Mui-focused": {
            color: infoColor[0],
        }
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
        width: "50%"
    },
    timeInput: {
        margin: theme.spacing(1),
        textAlign: "center",
        width: "100%"
    },
    media: {
        minHeight: "150px",
    },
    item: {
        minWidth: "300px",
        margin: "1em",
        textAlign: "left",
        boxSizing: "border-box"
    },
    cardAction: {
        display: "block",
        minWidth: "370px"
    },
    avatar: {
        backgroundColor: red[500],
        // [theme.breakpoints.up('xl')]: {
        //   fontSize: "45px",
        // },
    },
    confirmationGrid: {
        display: "flex",
        flexDirection: "column"
    },
    alert: {
        width: '50%'
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
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function getSteps() {
    return ['Search and Select Meeting Room', 'Booking Details'];
}

export default function BookMeetingRoom() {
    const classes = useStyles();

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

    useEffect(() => {
        // getUserDetails("user@gmail.com")
        api.floor.floorList(localStorage.getItem("buildingID")).then(res => {
            if (res) {
                const filteredArray = res.floors
                    .filter(each => each.type === "wlms")
                setFloors(filteredArray)
            }
        })
    }, [floorSelected])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenAlert(false);
    };

    const handleFloorChange = (event, data) => {
        setFloorSelected(event.target.value)
        setSelectedFloorName(data.props.children)
        let unique = []
        api.zones.zoneList(event.target.value).then(resZone => {
            if (resZone) {
                const filteredArray = resZone.zones
                    .filter(each => each.type === "meeting_room" && each.description)
                    .map(each =>
                        (each.description.split(","))).flat()
                for (var index in filteredArray) {
                    filteredArray[index] = filteredArray[index].trim()
                }
                unique = Array.from(new Set(filteredArray));
            }
            setFaclities(unique)
        })
        setErrorMsg({ ...errorMsg, floor: "" })
        setIsSearchClicked(false)
    };

    const handleAttendiesChange = (event, data) => {
        setNoOfAttendies(event.target.value)
        setErrorMsg({ ...errorMsg, attendies: "" })
    };
    const handlenavigation = () => {
        const meeting_room = selectedDetails.map(_e => _e.name)
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
        api.floor.getMeetingRooms(floorSelected, req.from, req.to, facilities, noOfAttendies).then(res => {
            const details = res;
            setMapDetails(details)
            setIsSearchClicked(true)
            setSelectedFloorName(selectedFloorName)
        }).catch(err => {
            console.log("Exception:", err)
        })
    }

    const clickSearch = () => {
        var from = format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm:ss');
        var to = format(new Date(toDateTime), 'yyyy-MM-dd HH:mm:ss');
        var diff = differenceInMilliseconds(new Date(to),new Date(from));
        // var diff = moment.duration(moment(to).diff(moment(from)));
        if (floorSelected !== "") {
            if (noOfAttendies !== "") {
                if (diff._data.minutes >= 30 || diff._data.hours >= 1
                    || diff._data.days >= 1 || diff._data.months >= 1) {
                    setErrorMsg({ ...errorMsg, date: "" })
                    const params = {
                        from: format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm'+ ":00"),
                        to:  format(new Date(toDateTime), 'yyyy-MM-dd HH:mm'+ ":00") 
                    }
                    const facility = getFacilitiesJSON()
                    searchRooms(params, facility, noOfAttendies);
                }
                else {
                    setErrorMsg({ ...errorMsg, date: "Minimum time chosen should be 30 mins ahead of From time" })
                }
            }
            else {
                setErrorMsg({ ...errorMsg, attendies: "No of attendies is Required" })
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
            top: `${area.center[1] - 35}px`, left: `${area.center[0]}px`,
            position: "absolute",
            color: "#fff", padding: "10px", background: "rgba(0,0,0,0.8)", transform: "translate3d(-50%, -50%, 0)",
            borderRadius: "5px", pointerEvents: "none", zIndex: "1000"
        }
    };

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
                                {floors.map(_floor => //onClick={event => handleFloorChange(event, _floor.name)}
                                    <MenuItem key={_floor.id} value={_floor.id} className={classes.menu}>{_floor.name}</MenuItem>
                                )}
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
                                No of Attendies
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
                        <Grid container justify="space-around">
                            <FormControl>
                                <DateTimePickerComponent step={15} onChange={onDateChange} value={format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm:ss')} />
                            </FormControl>
                            <FormControl error>
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
                                    <MapInteractionCSS
                                        showControls={true} >
                                        <ImageMapper
                                            className={classes.bounds}
                                            style={{ width: "100%", height: "100%" }}
                                            // src={("/" + selectedFloorName + ".jpg")}
                                            src={("https://localhost/" + selectedFloorName + ".jpg")}
                                            map={mapDetails}
                                            active={false}
                                            onClick={area => {
                                                var flag = 0;
                                                var index;
                                                var i;
                                                let selected = selectedDetails;
                                                // if (area.bookable == "ok") {
                                                if (area.bookable == "ok") {
                                                    if (area.preFillColor != "rgba(179, 0, 0,0.7)") {
                                                        area.preFillColor = "rgba(179, 0, 0,0.7)"
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
                                                        mapDetails.areas.map((_each, index) => {
                                                            if (_each.name === area.name) {
                                                                if (_each.preFillColor === "gray") {
                                                                    _each.preFillColor = "green"
                                                                }
                                                                else {
                                                                    _each.preFillColor = "gray"
                                                                }
                                                            }
                                                            if (prevSelected && _each.name === prevSelected.name) {
                                                                _each.preFillColor = "green"
                                                            }
                                                        })
                                                    }
                                                }
                                                else if (area.bookable == "more_capacity") {
                                                    setErrorMsg({ ...errorMsg, card: "No of Attendies is very less than room capacity" })
                                                    setOpenAlert(true)
                                                }
                                                else {
                                                    setErrorMsg({ ...errorMsg, card: "No of Attendies is more than room capacity" })
                                                    setOpenAlert(true)
                                                }
                                                setMapDetails(mapDetails)
                                                setHoveredArea(area)
                                            }}
                                            lineWidth={2}
                                            onMouseEnter={area => enterArea(area)}
                                            onMouseLeave={area => leaveArea(area)}
                                        />
                                        {hoveredArea &&
                                            <span className="tooltip"
                                                style={{ ...getTipPosition(hoveredArea) }}>
                                                {hoveredArea.name}<br></br>
                                                {"Capacity: " + hoveredArea.no_of_seats}
                                            </span>
                                        }
                                    </MapInteractionCSS>
                                </div>
                            </Box>
                        }
                    </div>
                )

            }
            case 1: {
                return (
                    <div style={{ textAlign: "center", padding: "12px" }} >
                        <Grid container spacing={6} justify="center" alignItems="center" className={classes.confirmationGrid}>
                            <CheckCircleIcon style={{ fontSize: 100, color: green[500] }} />
                            <Typography color="textPrimary" variant="h6" className={classes.snackbar}>Your Meeting Room is booked successfully !!</Typography>
                            <div>
                                <Typography className={classes.snackbar} color="textSecondary" >Meeting Room: {selectedDetails.map(_e => _e.name)}</Typography>
                                <Typography className={classes.snackbar} color="textSecondary" variant="body2">From: {format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm:ss')}</Typography>
                                <Typography className={classes.snackbar} color="textSecondary" variant="body2">To: {format(new Date(toDateTime), 'yyyy-MM-dd HH:mm:ss')}</Typography>
                            </div>
                            <Typography className={classes.snackbar} color="textPrimary" variant="subtitle1">Meeting ID & Passcode will be sent to your registered e-mail ID</Typography>
                            <div>
                                {/* <Button
                                    onClick={handlenavigation}
                                    variant="contained" color="info"
                                >
                                    Show Navigation
                </Button> */}
                            </div>
                            {isclicked &&
                                <Modal style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} open={openModal}>
                                    <div>
                                        <CloseIcon style={{ color: "red", background: "white", cursor: "pointer" }} onClick={handleModalClose} />
                                        <ImageMapper
                                            src={("https://localhost/" + roomname + ".gif")}
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
        active: {
            backgroundColor: "#26c6da"
        },
        completed: {
            backgroundColor: "#26c6da"
        },
        line: {
            height: 3,
            border: 0,
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
            color: "white",
            backgroundColor: "#26c6da"
        },
        completed: {
            backgroundColor: "#26c6da"
        }
    });

    function ColorlibStepIcon(props) {
        const classes = useColorlibStepIconStyles();
        const { active, completed } = props;

        const icons = {
            1: 1,
            2: 2
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

    //   const getUserDetails = (value) => {
    //     setSelectedUser({ id: "", name: "", phno: "", email: "" })
    //     if (value === "") {
    //       setVisitorDetails({ ...visitorDetails, email: value })
    //       setErrorMsg({ ...errorMsg, email: "E-mail ID is Required" })
    //     } else {
    //       setVisitorDetails({ ...visitorDetails, email: value })
    //       setErrorMsg({ ...errorMsg, email: "" })
    //       api.users.getClientDetails(value).then(res => {
    //         console.log("res in getdetails is", res)
    //         setUserDetails(res.result)
    //       })
    //     }
    //   }

    const handleNext = () => {
        navigate("/meeting-rooms")
        switch (activeStep) {
            case 0: {
                const req = {
                    from: format(new Date(fromDateTime), 'yyyy-MM-dd HH:mm'+ ":00"),
                    to: format(new Date(toDateTime), 'yyyy-MM-dd HH:mm'+ ":00"),
                    role_id: localStorage.getItem("roleID"),
                    user_id: localStorage.getItem("userID"),
                    // email_id: userDetails[0].user_email,
                    // contact_no: userDetails[0].user_contact_no,
                    no_of_attendees: noOfAttendies,
                    roomsList: selectedDetails
                }
                api.floor.bookMeetingRoom(req).then(res => {
                    setActiveStep(prevActiveStep => prevActiveStep + 1);
                })
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
                    {activeStep === steps.length - 1 ? (
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
                                    {activeStep === 0 ? 'Finish' : null}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    )
}
