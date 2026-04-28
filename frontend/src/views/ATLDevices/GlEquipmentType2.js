import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Select,
  FormControl,
  MenuItem,
  Card,
  TextField,
  Paper,
} from "@material-ui/core";
import api from "../../api";
import TimeSeriesVav from "../TimeSeriesVav";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import Blink from "react-blink-text";
import SwitchSelector from "react-switch-selector";
import fanimg from "./../../assets/img/AHU-fan-img.png";
import ventilator from "./../../assets/img/Ventilators.png";
import Button from "@material-ui/core/Button";
import {
  redColor,
  yellowColor,
  greenColor,
  whiteColor,
  grayColor,
  blackColor,
  blueColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize: "12px",
  },
})(Tooltip);

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const useStyles = makeStyles((theme) => ({
  customDialog: {
    cursor: "pointer",
    // Set the desired width for the dialog
    width: "470px", // Adjust this value as needed
    height: "200px",
  },
  setptbutton: {
    width: "15vh",
    borderRadius: "8px",
    height: "5vh",
    fontFamily: "Arial",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "28vh",
    marginTop: "1.5vh",
  },
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  inputField: {
    margin: theme.spacing(1),
  },
  setptbutton: {
    width: "15vh",
    borderRadius: "8px",
    height: "5vh",
    fontFamily: "Arial",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "28vh",
    marginTop: "1.5vh",
  },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow:'0px 8px 40px #0123B433;',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: "12px",
    opacity: "1",
  },
  paper1: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    // boxShadow:'0px 0px 10px #0123B421',
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    opacity: "1",
    borderRadius: "12px",
    height: "14.7vh",
    // display: 'flex',
    justifyContent: "center",
    alignItems: "center",
  },
  cardHeading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    whiteSpace: "nowrap",
    color: "#000000",
    marginTop: "1vh",
    font: "normal normal medium 17px/60px Bw Seido Round",
    opacity: "1",
    fontWeight: "bold",
    // fontSize:'1.7vh'
  },
  semicircleBar: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "-0.8vh",
  },
  cardbody: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "4vh",
    fontWeight: "bold",
    opacity: "1",
    color: blueColor[0],
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: blueColor[0],
      borderRadius: "8px",
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
    },
  },
  CardHeadFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      fontSize: "1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      fontSize: "1.9vh",
      borderRadius: "10px",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      fontSize: "1.4vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      fontSize: "1.6vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "1.7vh",
    },
  },
}));

function GLEquipmentType2(props) {
  const classes = useStyles();
  const role_id = localStorage.getItem("roleID");
  const [opn_SS, setOpn_SS] = useState(0);
  const [sat, setSat] = useState("");
  const [eqpType, setEqpType] = useState(props.eqpType);
  const [heading, setEqpHeading] = useState(props.heading);
  const [floor, setFloor] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [eqpList, setEqpList] = useState([]);
  const [disable, setDisable] = useState(false);
  const [onOff, setOnOff] = useState(1);
  const [modalData, setModalData] = useState({});
  // const [modalType, setModalType] = useState('');
  const [modal, setModal] = useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const [fid, setFId] = useState("");
  const [openerr, setOpenerr] = React.useState(false);
  const user_id = localStorage.getItem("userID");
  const [openmodal, setOpenModal] = useState(false);
  const [blinkText, setBlinkText] = useState(false);
  const [equipName, setequipName] = useState("");
  const [eqp1, setEqp1] = useState({});
  const [dev, setDev] = useState({});
  const isNumeric = (str) => !isNaN(str) && !isNaN(parseFloat(str));
  const isAlphabetic = (str) => /^[a-zA-Z]+$/.test(str);
  const isAlphanumeric = (str) => /^[a-zA-Z0-9]+$/.test(str);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // const options = [
  //   {
  //     label: "Card View",
  //     value: "cardview",
  //     selectedBackgroundColor: blueColor[0],
  //   },
  //   {
  //     label: "Table View",
  //     value: "tableview",
  //     selectedBackgroundColor: blueColor[0],
  //   },
  // ];

  const options = [
    {
      label: "OFF",
      value: 0,
      selectedBackgroundColor: redColor[0],
      fontSize: "10",
    },
    {
      label: "ON",
      value: 1,
      selectedBackgroundColor: "#34C759",
      fontSize: "10",
    },
    {
      label: "AUTO",
      value: 2,
      selectedBackgroundColor: blueColor[0],
      fontSize: "10",
    },
  ];

  useEffect(() => {
    let zone_id = "",
      z_data = [];
    zone_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    zone_data.filter((_each) => _each.zone_type === "GL_LOCATION_TYPE_FLOOR");
    console.log("zone_data", zone_data, "fdata", fdata);
    if (fdata !== null) {
      zone_data.filter((_each, i) => {
        if (
          _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
          _each.name === fdata
        ) {
          console.log("newDevicemapApi bfr", _each);
          return (zone_id = _each.uuid);
        }
      });
    } else {
      zone_data.filter((_each, i) => {
        if (_each.zone_type === "GL_LOCATION_TYPE_FLOOR") {
          z_data.push(_each);
        }
      });
      zone_id = z_data.uuid;
      setFdata(z_data.name);
      setFId(zone_id.uuid);
    }
    console.log("newDevicemapApi bfr", z_data);
    api.floor
      .newDevicemapApi(zone_id, eqpType)
      .then((res) => {
        res.sort(function (a, b) {
          const numA = parseInt(a.name, 10);
          const numB = parseInt(b.name, 10);

          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        setEqpList(res);
      })
      .catch((error) => {
        console.log(error);
      });
    api.dashboard
      .getMetricData(buildingID)
      .then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      })
      .catch((error) => {
        console.log(error);
      });
    const timer = setInterval(() => {
      api.floor
        .newDevicemapApi(zone_id, eqpType)
        .then((res) => {
          const loaderState = res.find((item) => item.loader_state === true);
          if (loaderState) {
            // Show the loader
            setBlinkText(true);
          } else {
            setBlinkText(false);
          }
          res.sort(function (a, b) {
            const numA = parseInt(a.name, 10);
            const numB = parseInt(b.name, 10);

            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            } else {
              // If either or both are not numbers, use localeCompare for string comparison
              return a.name.localeCompare(b.name);
            }
          });
          setEqpList(res);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 10000);
    return () => clearInterval(timer);
  }, [buildingID, fid]);

  const onChange = (active, value) => {
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);
    if (value == 2) {
      setOpn_SS(value);
      const req = {
        ss_type: active.ss_type,
        ss_id: String(active.ssid),
        gl_command: value == 0 ? "TURN_OFF" : value == 1 ? "TURN_ON" : "AUTO",
        param_id:
          active.ss_type == "SS_VENTILATOR_1"
            ? "VEN_On_Off"
            : active.ss_type == "SS_BRE_FAN"
            ? "BRE_Fan_On_Off"
            : active.ss_type == "SS_HTE_FAN"
            ? "HTE_On_Off"
            : active.ss_type == "SS_SUBE_FAN"
            ? "SubE_Fan_On_Off"
            : "",
        value: value === 1 ? "ON" : value === 0 ? "OFF" : "Auto",
        zone_type: null,
        zone_id: null,
        commandFrom: "UI",
      };
      if (req) {
        api.floor
          .cpmOnOffControl(req)
          .then((response) => {
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Controlled Successfully",
              time: 3000,
            });
          })
          .catch((err) => {
            setOpenerr(true);
            setErrmsg(err);
          });
      }
    }
  };

  const handlefloorchange = (name, id) => {
    setFId(id);
    setFdata(name);
    api.floor
      .newDevicemapApi(id, eqpType)
      .then((res) => {
        res.sort(function (a, b) {
          const numA = parseInt(a.name, 10);
          const numB = parseInt(b.name, 10);

          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          } else {
            // If either or both are not numbers, use localeCompare for string comparison
            return a.name.localeCompare(b.name);
          }
        });
        setEqpList(res);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleClose = () => {
    setOpenModal(false);
    setModal(false);
  };

  const handleSwitchChange = (res, button) => {
    const req = {
      ss_type: res.ss_type,
      ss_id: res.ssid,
      gl_command: button == "On" ? "TURN_ON" : "TURN_OFF",
      param_id: "",
      value: button == "On" ? "ON" : "OFF",
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };
    api.floor
      .cpmOnOffControl(req)
      .then((res) => {
        if (res.message === "please connect to network") {
          // setOnOff(Math.round(value4));
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            description: "connect to network",
            time: 2000,
          });
        } else if (res.id) {
          // setOnOff(va);
          let requestID = res.id;
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: "successfully turned " + button,
            time: 2000,
          });
          const checkCommandStatus = (requestID, startTime = Date.now()) => {
            api.floor
              .checkCommandStatus(requestID)
              .then((res) => {
                if (res[0].status === "success") {
                  // Command was successful, stop further API calls
                  console.log("Command succeeded");
                  toast({
                    type: "success",
                    icon: "check circle",
                    title: "Command Status",
                    description: "Command processed successfully",
                    time: 2000,
                  });
                } else if (res[0].status === "pending") {
                  console.log("Command is still Pending");
                  const elapsedTime = Date.now() - startTime;

                  if (elapsedTime < 30000) {
                    console.log(
                      " If less than 30 seconds have passed, keep checking every 3 seconds"
                    );
                    setTimeout(
                      () => checkCommandStatus(requestID, startTime),
                      3000
                    );
                  } else {
                    console.log(
                      "Stop checking after 30 seconds and show a timeout message"
                    );
                    console.log("Command timed out after 30 seconds.");
                    toast({
                      type: "error",
                      icon: "clock",
                      title: "Timeout",
                      description: "Command is still pending after 30 seconds.",
                      time: 5000,
                    });
                  }
                }
              })
              .catch((error) => {
                console.error("Error checking command status:", error);
                toast({
                  type: "error",
                  icon: "exclamation triangle",
                  title: "Error",
                  description: "Error while checking command status",
                  time: 2000,
                });
              });
          };

          checkCommandStatus(requestID);
        }
      })
      .catch((error) => {
        setOpenerr(true);
        if (error.response) {
          setErrmsg(error.response.data.message);
        } else {
          setErrmsg("No response");
        }
      });
  };

  const handleChangeForsetpointSAT = (event) => {
    setSat(event.target.value);
  };

  const handlevavclick1 = (data, title) => {
    setModal(true);
    setModalData(data);
    // setModalType(title)
    // setOpenSetpointModal(true); // Open Set Point Modal
    // setActiveData(data);        // Store the active data
    // setTemperature(data.l1_setpoint); // Prepopulate temperature value
  };

  const handleClickSat = (event) => {
    const req = {
      ss_type: modalData.ss_type,
      ss_id: modalData.ssid,
      gl_command: "CHANGE_SET_POINT",
      param_id:
        modalData.ss_type == "SS_BRE_FAN"
          ? ""
          : modalData.ss_type == "SS_HTE_FAN"
          ? "HTE_ZAT"
          : "SubE_ZAT",
      value: sat,
      zone_type: null,
      zone_id: null,
    };
    if (sat >= 15 && sat <= 35) {
      api.floor
        .cpmOnOffControl(req)
        .then((res) => {
          // setSAtvalue("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.id) {
            let requestID = res.id;
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Sat successfully setted" + sat,
              time: 2000,
            });
            const checkCommandStatus = (requestID, startTime = Date.now()) => {
              api.floor
                .checkCommandStatus(requestID)
                .then((res) => {
                  if (res[0].status === "success") {
                    // Command was successful, stop further API calls
                    console.log("Command succeeded");
                    toast({
                      type: "success",
                      icon: "check circle",
                      title: "Command Status",
                      description: "Command processed successfully",
                      time: 2000,
                    });
                  } else if (res[0].status === "pending") {
                    console.log("Command is still Pending");
                    const elapsedTime = Date.now() - startTime;

                    if (elapsedTime < 30000) {
                      console.log(
                        " If less than 30 seconds have passed, keep checking every 3 seconds"
                      );
                      setTimeout(
                        () => checkCommandStatus(requestID, startTime),
                        3000
                      );
                    } else {
                      console.log(
                        "Stop checking after 30 seconds and show a timeout message"
                      );
                      console.log("Command timed out after 30 seconds.");
                      toast({
                        type: "error",
                        icon: "clock",
                        title: "Timeout",
                        description:
                          "Command is still pending after 30 seconds.",
                        time: 5000,
                      });
                    }
                  }
                })
                .catch((error) => {
                  console.error("Error checking command status:", error);
                  toast({
                    type: "error",
                    icon: "exclamation triangle",
                    title: "Error",
                    description: "Error while checking command status",
                    time: 2000,
                  });
                });
            };

            checkCommandStatus(requestID);
          }
        })
        .catch((error) => {
          setOpenerr(true);
          if (error.response) {
            setErrmsg(error.response.data.message);
          } else {
            setErrmsg("No response");
          }
        });
    } else {
      // setSAtvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "SAT sp should be 15-35 ",
        time: 2000,
      });
    }
  };

  const eachEqpData = (element, index) => {
    let active = {};
    if (element.ssid) {
      active["ssid"] = element.ssid;
    }
    active["name"] = element.name;
    active["ss_type"] = element.type;
    for (let item in element.controlable) {
      active[item] = element.controlable[item];
    }
    return (
      <>
        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
          <Card className={classes.paper} style={{ height: "43.5vh" }}>
            <Grid container xs={12} spacing={1} style={{ marginTop: "0.5vh" }}>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                <Grid container item xs={12} direction="row">
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={6}
                    lg={6}
                    xl={6}
                    xxl={6}
                    style={{ textAlign: "left", marginLeft: "2vh" }}
                  >
                    <div
                      style={{
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "3vh",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {active.name}
                    </div>
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    sm={6}
                    md={6}
                    lg={6}
                    xl={6}
                    xxl={6}
                    style={{ textAlign: "right" }}
                  >
                    {blinkText ? (
                      <Blink color="blue" text="o" fontSize="20px"></Blink>
                    ) : null}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                <Grid container xs={12}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    xl={12}
                    xxl={12}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignContent: "center",
                    }}
                  >
                    {/* <div className={classes.switchselector} onClick={()=>handleId(active)} style={{height:'4vh',marginTop:'0.5vh',width:'11vh'}}>
                                                                <SwitchSelector
                                                                      style={{ borderRadius: "12px" }}
                                                                      onChange={onChange}
                                                                      options={options}
                                                                      forcedSelectedIndex={opn_SS}
                                                                      // border="1px solid #0123B4"
                                                                      backgroundColor={"#e9e5e5"}
                                                                      fontColor={"rgba(0, 0, 0, 0.87)"}
                                                                      // wrapperBorderRadius={true}
                                                                      optionBorderRadius={5}
                                                                      wrapperBorderRadius={5} />
                                                                      </div> */}
                    <div
                      style={{
                        pointerEvents: role_id != 2 || disable ? "none" : "",
                        opacity: role_id != 2 || disable ? "0.4" : "",
                      }}
                      className={classes.switchselector}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          userSelect: "none",
                          width: "100%",
                          padding: "10px",
                        }}
                      >
                        <button
                          onClick={() => {
                            onChange(active, 0);
                          }}
                          style={{
                            // backgroundColor: active[resp.param] === "inactive" ? 'orange' : 'grey',
                            backgroundColor:
                              active.ss_type === "SS_VENTILATOR_1"
                                ? active["VEN_On_Off"] == "inactive"
                                  ? grayColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_BRE_FAN"
                                ? active["BRE_Fan_On_Off"] == "inactive"
                                  ? grayColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_HTE_FAN"
                                ? active["HTE_On_Off"] == "inactive"
                                  ? grayColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_SUBE_FAN"
                                ? active["SubE_Fan_On_Off"] == "inactive"
                                  ? grayColor[0]
                                  : grayColor[1]
                                : grayColor[1],
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            marginLeft: "112px",
                            border: "none",
                            cursor: "pointer",
                            height: "4vh",
                            width: "1vh",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              fontSize: "1.6vh",
                            }}
                          >
                            Off
                          </div>
                        </button>
                        <button
                          onClick={() => onChange(active, 1)} // Set value to 1 for Auto
                          style={{
                            // backgroundColor: active[resp.param] === "active" ? 'green' : 'grey',
                            backgroundColor:
                              active.ss_type === "SS_VENTILATOR_1"
                                ? active["VEN_On_Off"] == "active"
                                  ? greenColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_BRE_FAN"
                                ? active["BRE_Fan_On_Off"] == "active"
                                  ? greenColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_HTE_FAN"
                                ? active["HTE_On_Off"] == "active"
                                  ? greenColor[0]
                                  : grayColor[1]
                                : active.ss_type === "SS_SUBE_FAN"
                                ? active["SubE_Fan_On_Off"] == "active"
                                  ? greenColor[0]
                                  : grayColor[1]
                                : grayColor[1],
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            marginLeft: "3px",
                            border: "none",
                            cursor: "pointer",
                            height: "4vh",
                            width: "1vh",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              fontSize: "1.6vh",
                            }}
                          >
                            On
                          </div>
                        </button>
                        <button
                          onClick={() => onChange(active, 2)} // Set value to 1 for Auto
                          style={{
                            // backgroundColor: active[resp.param] === "active" ? 'green' : 'grey',
                            backgroundColor: blueColor[0],
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            marginLeft: "3px",
                            border: "none",
                            cursor: "pointer",
                            height: "4vh",
                            width: "1vh",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              fontSize: "1.6vh",
                            }}
                          >
                            Auto
                          </div>
                        </button>
                      </div>
                    </div>
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                                  <Grid container xs={12} >
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                                    <Card  style={{ width: '94%', height: '100%',background:'#FED0C1 0% 0% no-repeat padding-box', opacity:'1',backgroundColor: '#C1EECD', color:'#34C759', textAlign: 'center', fontSize: '3vh', fontWeight: 'bold' }}>
                                                          <Grid container xs={12} style={{ height: '100%' }}>
                                                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}  className={classes.status}>
                                                                <div>OFF</div>
                                                                // bg->#C1EECD-for on/off,color->#34C759 / #68DBFF
                                                                </Grid>
                                                          </Grid>
                                                    </Card>
                                        </Grid>
                                  </Grid>
                  </Grid> */}
            </Grid>
            <Grid
              container
              xs={12}
              spacing={1}
              style={{ marginTop: "0.5vh", marginLeft: "0.5vh" }}
            >
              <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                <Card
                  className={classes.paper1}
                  style={{ display: "flex", height: "31vh" }}
                >
                  <Grid container xs={12} spacing={1} direction="column">
                    <Grid
                      container
                      item
                      xs={12}
                      justify="center"
                      alignItems="center"
                    >
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={12}
                      >
                        <img
                          src={ventilator}
                          style={{ width: "55px", marginTop: "3.5vh" }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={8} sm={8} md={8} lg={8} xl={8} xxl={8}>
                <Grid container xs={12} spacing={1}>
                  {/* {Object.keys(active).map(pname => */}
                  {heading.map(
                    (resp) =>
                      active[resp.param] ? (
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <Card
                            onClick={() =>
                              resp.title == "Temperature Set Point" ? (
                                handlevavclick1(active, "Temperature Set Point")
                              ) : (
                                <></>
                              )
                            }
                            className={classes.paper1}
                          >
                            <Grid container xs={12} spacing={1}>
                              <Grid container item xs={12}>
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                  className={classes.cardHeading}
                                >
                                  {resp.title}
                                </Grid>
                              </Grid>
                              {resp.type == "read" ? (
                                <Grid container item xs={12}>
                                  <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={12}
                                    lg={12}
                                    xl={12}
                                    xxl={12}
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignContent: "center",
                                      whiteSpace: "nowrap",
                                      fontSize: "4vh",
                                      color: blueColor[0],
                                      fontWeight: "bold",
                                      marginTop: "1vh",
                                    }}
                                  >
                                    {resp.title == "Temperature" ||
                                    resp.title == "Temperature Set Point"
                                      ? formatter.format(active[resp.param]) +
                                        "°C"
                                      : resp.title == "Status"
                                      ? active[resp.param] == "active"
                                        ? "Tripped"
                                        : active[resp.param]
                                      : resp.title == "Device Mode"
                                      ? active[resp.param] == "active"
                                        ? "Auto"
                                        : "Manual"
                                      : active[resp.param]}
                                  </Grid>
                                </Grid>
                              ) : resp.type == "write" && active[resp.param] ? (
                                <Grid container item xs={12}>
                                  <Grid
                                    item
                                    xs={2}
                                    sm={2}
                                    md={2}
                                    lg={2}
                                    xl={2}
                                  ></Grid>
                                  <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                                    <TextField
                                      style={{ marginLeft: "3vh" }}
                                      placeholder={
                                        formatter.format(active[resp.param]) +
                                        "℃"
                                      }
                                      name="Sat_set_point"
                                      autoComplete="off"
                                      value={sat}
                                      onChange={handleChangeForsetpointSAT}
                                      className={classes.text_field}
                                    />
                                  </Grid>
                                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                                    <Paper
                                      className={classes.set_button}
                                      style={{
                                        backgroundColor: blueColor[0],
                                        display: "flex",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        marginTop: "1.5vh",
                                        marginLeft: "1vh",
                                      }}
                                      onClick={handleClickSat(resp.param)}
                                    >
                                      <div style={{ color: "white" }}>set</div>
                                    </Paper>
                                  </Grid>
                                  <Grid
                                    item
                                    xs={2}
                                    sm={2}
                                    md={2}
                                    lg={2}
                                    xl={2}
                                  ></Grid>
                                </Grid>
                              ) : (
                                <></>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                      ) : (
                        <></>
                      )
                    // :
                    // <></>
                  )}
                  {/* )} */}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Dialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={modal}
          classes={{ paper: classes.customDialog }}
        >
          <DialogTitle id="customized-dialog-title" onClose={handleClose}>
            {modalData.name} Temperature[°C]
          </DialogTitle>
          <DialogContent dividers>
            {/* {Object.keys(eqp1).map((key) => (<>
                  {key == 'HTE_ZAT' ?
                    <TimeSeriesVav style={{ width: "100%", height: "50%" }}
                      data={eqp1[key]}
                      param={key}
                    /> : <></>
                  }</>
                ))} */}
            {heading.map((resp) =>
              resp.title == "Temperature Set Point" &&
              modalData[resp.param] != undefined ? (
                <Grid container item xs={12}>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>
                  <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                    <TextField
                      style={{ marginLeft: "3vh" }}
                      placeholder={
                        formatter.format(modalData[resp.param]) + "℃"
                      }
                      name="Sat_set_point"
                      autoComplete="off"
                      value={sat}
                      onChange={handleChangeForsetpointSAT}
                      className={classes.text_field}
                    />
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}>
                    <Paper
                      className={classes.set_button}
                      style={{
                        backgroundColor: blueColor[0],
                        display: "flex",
                        justifyContent: "center",
                        cursor: "pointer",
                        marginTop: "1.5vh",
                        marginLeft: "1vh",
                      }}
                      onClick={handleClickSat}
                    >
                      <div style={{ color: "white" }}>set</div>
                    </Paper>
                  </Grid>
                  <Grid item xs={2} sm={2} md={2} lg={2} xl={2}></Grid>
                </Grid>
              ) : (
                <></>
              )
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Grid container spacing={2}>
        {/* {
        props.via == 'LandingPage' ?
            <></> : */}
        <Grid container item spacing={1}>
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
            <FormControl
              variant="filled"
              size="small"
              style={{
                width: "max-content",
                minWidth: "100%",
                backgroundColor: "#eeeef5",
              }}
            >
              {/* <InputLabel id="demo-simple-select-outlined-label">
                                  Floor
                              </InputLabel> */}
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Floor"
                className={classes.select}
                value={fdata}
                style={{
                  borderRadius: "0.8vw",
                  height: "6vh",
                  fontWeight: "bold",
                }}
                disableUnderline
                // onChange={handlefloorchange}
              >
                {floor.map((_item) => (
                  <MenuItem
                    key={_item.name}
                    value={_item.name}
                    onClick={() => handlefloorchange(_item.name, _item.id)}
                  >
                    {_item.name.slice(6)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* } */}
        {eqpList.length != 0 ? (
          <Grid container spacing={2}>
            {eqpList.map(
              (element, index) =>
                // <>{props.via == 'LandingPage' ?
                //   // eachEqpData(element, index)
                //  <>
                //  {props.devId == element.ssid?<>
                //  {eachEqpData(element, index)}
                //  </>:<></>}
                //  </>
                //   :
                eachEqpData(element, index)
              // }
              // </>
            )}
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <div style={{ marginLfet: "2vh", marginTop: "4vh" }}>
              No data available
            </div>
          </Grid>
        )}
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}

export default GLEquipmentType2;
