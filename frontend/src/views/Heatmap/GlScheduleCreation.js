import React, { useState, useEffect } from "react";
import SwitchSelector from "react-switch-selector";
import { Tooltip, makeStyles } from "@material-ui/core";
import { useSelector } from "react-redux";
import { ValidatorForm } from "react-material-ui-form-validator";
import api from "../../api";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "components/CustomButtons/Button.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import Select from "@material-ui/core/Select";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";

const names = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  text: {
    marginTop: "10vh",
    marginLeft: "36vh",
    fontWeight: "bold",
    fontFamily: "Arial",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  input: {
    textalign: "center",
    fontWeight: "bold",
    marginTop: "8.5vh",
    width: "47vh",
    marginLeft: "9vh",
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  noLabel: {
    marginTop: theme.spacing(3),
  },
}));

export default function GlBMSschedule(props) {
  const classes = useStyles();
  const redux_data = useSelector((state) => state.inDashboard.locationData);
  const [name, setName] = React.useState("");
  const [schedule_type, setScheduleType] = React.useState("");
  const [zone_device_id, setZoneDeviceId] = React.useState("");
  const [bid, setBId] = useState(localStorage.getItem("buildingID"));
  const [bdata, setBdata] = useState([]);
  const [bname, setBName] = useState([]);
  const [fid, setFId] = useState([]);
  const [fname, setFName] = useState([]);
  const [fdata, setFdata] = useState([]);
  const [dname, setDName] = useState([]);
  const [ddata, setDData] = useState([]);
  const [bdetails, setBdetails] = React.useState({});
  const [scheduledetails, setScheduleDetails] = React.useState({});
  const [start_time, setStarttime] = useState({});
  const [end_time, setEndtime] = useState({});
  const [weekdays, setWeekDays] = React.useState([]);
  const [radbtn, setradBtn] = React.useState("off");
  const [level, setLevel] = React.useState("building");
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const options = [
    {
      label: "Building",
      value: "building",
      selectedBackgroundColor: "#0123b4",
      innerHeight: 50,
    },
    {
      label: "Floor",
      value: "floor",
      selectedBackgroundColor: "#0123b4",
    },
    {
      label: "Device",
      value: "device",
      selectedBackgroundColor: "#0123b4",
    },
  ];

  const initialSelectedIndex = options.findIndex(
    ({ value }) => value === "building"
  );

  const handleChangeForname = (event) => {
    setName(event.target.value);
  };

  const handleChangeStartDate = (event) => {
    setStarttime(event.target.value);
  };
  const handleRadioChange = (event) => {
    setradBtn(event.target.value);
  };

  const handleChangeEndDate = (event) => {
    setEndtime(event.target.value);
  };

  const handleWeeksChange = (event) => {
    setWeekDays(event.target.value);
  };

  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg("");
  };
  const ScheduleDetails = (id, callback) => {
    let response = [];
    api.hvac_schedule
      .schedule_details(id)
      .then((res) => {
        res.map((resp) => {
          response.push(resp);
          callback(response);
        });
      })
      .catch((error) => {
        setOpenerr(true);
        setErrmsg(error);
      });
  };

  function handleScheduleDetails(node, value) {
    if (node && node.uuid === value) {
      return node; // Match found, return the current node
    }
    if (node && node.children && Array.isArray(node.children) && node.children.length > 0) {
      // Traverse child nodes and search recursively
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i]) {
          const matchedNode = handleScheduleDetails(node.children[i], value);
          if (matchedNode) {
            return matchedNode; // Match found in child node, return the matched node
          }
        }
      }
    }
    return null; // No match found in the current node or its children
  }

  const handleBuildingChange = (name, id) => {
    setBId(id);

    let f_data = [];
    redux_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    redux_data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
        _each.zone_parent === id
      ) {
        f_data.push(_each);
      }
      setFdata(f_data);
    });
    api.hvac_schedule
      .schedule_details(id)
      .then((res) => {
        res.map((res) => {
          setBdetails(res);
          if (level == "Building") {
              setZoneDeviceId(id);
              setScheduleType("zone");
              setScheduleDetails(res);
          if (res.scheduleDetails.isSchedule == false) {
            } 
          else {
              setName(res.scheduleDetails.name);
              setWeekDays(res.scheduleDetails.weekdays);
              setradBtn(res.scheduleDetails.arguments.AHU_On_Off);
              setStarttime(res.scheduleDetails.start);
              setEndtime(res.scheduleDetails.end);
            }
          }
        });
      })
      .catch((error) => {
        setOpenerr(true);
        setErrmsg(error);
      });
  };

  const handleFloorChange = (name, id) => {
    setFId(id)
    setFName(name);
    let z_data = [],d_data = [];
    redux_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    redux_data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
        _each.zone_parent === id
      ) {
        z_data.push(_each);
        redux_data.filter((eachObj) => {
          if (eachObj.zone_parent === _each.uuid) {
            if(eachObj.zone_type=='NONGL_SS_AHU'){
              d_data.push(eachObj);
            }
          } 
          else {
          }
        });
      }
      else{
        setName(" ");
        setWeekDays([]);
        setradBtn(" ");
        setStarttime({});
        setEndtime({});
      }
    });
    setDData(d_data);
    if (level == "floor") {
          setZoneDeviceId(id);
          setScheduleType("zone");
          let sch_details = handleScheduleDetails(bdetails[0], id);
          setScheduleDetails(sch_details);
        if (sch_details.scheduleDetails.isSchedule == false) {
        } 
        else {
          setName(sch_details.scheduleDetails.name);
          setWeekDays(sch_details.scheduleDetails.weekdays);
          setradBtn(sch_details.scheduleDetails.arguments.AHU_On_Off);
          setStarttime(sch_details.scheduleDetails.start);
          setEndtime(sch_details.scheduleDetails.end);
        }
      }
  };

  const handleDeviceChange = (name, id) => {
        setDName(name);
    if (level == "device") {
        setZoneDeviceId(id);
        setScheduleType("device");
      let sch_details = handleScheduleDetails(bdetails[0], id);
        setScheduleDetails(sch_details);
      if (sch_details.scheduleDetails.isSchedule == false) {
      } 
      else {
        setName(sch_details.scheduleDetails.name);
        setWeekDays(sch_details.scheduleDetails.weekdays);
        setradBtn(sch_details.scheduleDetails.arguments.AHU_On_Off);
        setStarttime(sch_details.scheduleDetails.start);
        setEndtime(sch_details.scheduleDetails.end);
      }
    }
  };

  useEffect(() => {
    let b_id = "",b_data = [];
    redux_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    redux_data.filter((_each, i) => {
      if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
        b_data.push(_each);
          setBId(b_id);
      }
      b_data.map((res) => {
          setBName(res.name);
      });
          setBdata(b_data);
    });
      ScheduleDetails(bid, (response) => {
          setZoneDeviceId(response[0].uuid);
          setScheduleType("zone");
      if (response[0].scheduleDetails.isSchedule == false) {
      } 
      else {
          setName(response[0].scheduleDetails.name);
          setWeekDays(response[0].scheduleDetails.weekdays);
          setradBtn(response[0].scheduleDetails.arguments.AHU_On_Off);
          setStarttime(response[0].scheduleDetails.start);
          setEndtime(response[0].scheduleDetails.end);
      }
    });
  }, []);

  const onSwitchSelectorChange = (newValue) => {
          setName(" ");
          setWeekDays([]);
          setradBtn(" ");
          setStarttime({});
          setEndtime({});
          setLevel(newValue);

    if (newValue == "building") {
      let b_id = "",
        f_id = "",
        b_data = [];
      redux_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      redux_data.filter((_each, i) => {
        if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
          b_data.push(_each);
            setBId(b_id);
        }
        b_data.map((res) => {
            setBName(res.name);
        });
            setBdata(b_data);
      });
      ScheduleDetails(bid, (response) => {
            setZoneDeviceId(response[0].uuid);
            setScheduleType("zone");
        if (response[0].scheduleDetails.isSchedule == false) {
        } else {
            setName(response[0].scheduleDetails.name);
            setWeekDays(response[0].scheduleDetails.weekdays);
            setradBtn(response[0].scheduleDetails.arguments.AHU_On_Off);
            setStarttime(response[0].scheduleDetails.start);
            setEndtime(response[0].scheduleDetails.end);
        }
      });
    } else if (newValue == "floor") {
      let b_id = "",
        f_id = "",
        b_data = [];
      redux_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      redux_data.filter((_each, i) => {
        if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
          b_data.push(_each);
        }
        b_data.map((res) => {
          b_id = res.uuid;
              setBId(res.uuid);
              setBName(res.name);
        });
            setBdata(b_data);
      });

      let f_data = [],temp="",
        sch_details = {};
      redux_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      redux_data.filter((_each, i) => {
        if (
          _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
          _each.zone_parent === b_id
        ) {
          f_data.push(_each);
          if(_each.uuid == fid){
            temp=_each.uuid
            setFName(_each.name);
            setFId(_each.uuid)
          }
        }
      });
              setFdata(f_data);
              if(temp ==""){
                temp=f_data[0].uuid
              setFId(f_data[0].uuid)
              setFName(f_data[0].name);
              }
              setZoneDeviceId(temp);
              setScheduleType("zone");
      ScheduleDetails(b_id, (response) => {
              setBdetails(response);
        sch_details = handleScheduleDetails(response[0], temp);
              setScheduleDetails(sch_details);
        if (sch_details.scheduleDetails.isSchedule == false) {
        } else {
              setName(sch_details.scheduleDetails.name);
              setWeekDays(sch_details.scheduleDetails.weekdays);
              setradBtn(sch_details.scheduleDetails.arguments.AHU_On_Off);
              setStarttime(sch_details.scheduleDetails.start);
              setEndtime(sch_details.scheduleDetails.end);
        }
      });
    } else if (newValue == "device") {
      let b_id = "",
        b_data = [];
      redux_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      redux_data.filter((_each, i) => {
        if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
          b_data.push(_each);
        }
        b_data.map((res) => {
          b_id = res.uuid;
              setBId(res.uuid);
              setBName(res.name);
        });
              setBdata(b_data);
      });

      let f_data = [],temp="",
        sch_details = {};
      redux_data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      redux_data.filter((_each, i) => {
        if (
          _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
          _each.zone_parent === b_id
        ) {
          f_data.push(_each);
          if(_each.uuid == fid){
            temp=_each.uuid
            setFName(_each.name);
            setFId(_each.uuid)
          }
        }
      });
              setFdata(f_data);
              if(temp ==""){
                setFName(f_data[0].name);
                temp = f_data[0].uuid
              }
      // let z_data = [],
      //   d_data = [];
      // redux_data.sort(function (a, b) {
      //   return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      // });
      // redux_data.filter((_each, i) => {
      //   if (
      //     _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
      //     _each.zone_parent === temp
      //   ) {
      //     z_data.push(_each);
      //     redux_data.filter((eachObj) => {
      //       if (eachObj.zone_parent === _each.uuid) {
      //         if(eachObj.zone_type=='NONGL_SS_AHU'){
      //           d_data.push(eachObj);
      //         }            }
      //     });
      //         setDName(d_data[0].name);
      //         setDData(d_data);
      //         setZoneDeviceId(d_data[0].uuid);
      //         setScheduleType("device");
      //     ScheduleDetails(b_id, (response) => {
      //         setBdetails(response);
      //         sch_details = handleScheduleDetails(response[0], d_data[0].uuid);
      //         setScheduleDetails(sch_details);
      //       if (sch_details.scheduleDetails.isSchedule == false) {
      //       } 
      //       else {
      //         setName(sch_details.scheduleDetails.name);
      //         setWeekDays(sch_details.scheduleDetails.weekdays);
      //         setradBtn(sch_details.scheduleDetails.arguments.AHU_On_Off);
      //         setStarttime(sch_details.scheduleDetails.start);
      //         setEndtime(sch_details.scheduleDetails.end);
      //       }
      //     });
      //   }
      // });

      let z_data = [],
    d_data = [];

redux_data.sort((a, b) => a.name.localeCompare(b.name));

redux_data.filter((_each, i) => {
    if (_each.zone_type === "GL_LOCATION_TYPE_ZONE" && _each.zone_parent === temp) {
        z_data.push(_each);

        // Use forEach for better readability
        redux_data.forEach((eachObj) => {
            if (eachObj.zone_parent === _each.uuid && eachObj.zone_type === 'NONGL_SS_AHU') {
                d_data.push(eachObj);
            }
        });

        if (d_data.length > 0) {
            setDName(d_data[0].name);
            setDData(d_data);
            setZoneDeviceId(d_data[0].uuid);
            setScheduleType("device");

            ScheduleDetails(b_id, (response) => {
                setBdetails(response);
                const sch_details = handleScheduleDetails(response[0], d_data[0].uuid);
                setScheduleDetails(sch_details);

                if (sch_details.scheduleDetails.isSchedule) {
                    setName(sch_details.scheduleDetails.name);
                    setWeekDays(sch_details.scheduleDetails.weekdays);
                    setradBtn(sch_details.scheduleDetails.arguments.AHU_On_Off);
                    setStarttime(sch_details.scheduleDetails.start);
                    setEndtime(sch_details.scheduleDetails.end);
                } else {
                    // Handle the case where isSchedule is false
                }
            });
        } else {
            // Handle the case where d_data is empty
        }
    }
});

    }
  };
  const handleSubmit = () => {
    const updated_sched_details = [];
    const payload = {
      name,
      zone_device_id,
      schedule_type,
      start_time,
      end_time,
      weekdays,
      value: {
        AHU_On_Off: radbtn,
      },
      weekly_schedule: true,
    };
    api.hvac_schedule
      .create_bms_schedule(payload)
      .then((res) => {
        if (res === "Schedule is Created") {
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: res,
            time: 3000,
          });
          api.hvac_schedule
            .schedule_details(localStorage.getItem("buildingID"))
            .then((res) => {
              res.map((resp) => {
                updated_sched_details.push(resp);
              });
              setBdetails(updated_sched_details);
            })
            .catch((error) => {
              setOpenerr(true);
              setErrmsg(error);
            });
        }
        else if (res.message === "please connect to network") {
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            description: res.message,
            time: 3000,
          });
        }
      })
      .catch((error) => {
            setOpenerr(true);
            setErrmsg(error.message);
      });
  };

  return (
        <div>
            <Snackbar
              open={openerr}
              autoHideDuration={6000}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                style={{ cursor: "pointer" }}
                severity="error"
                variant="filled"
                onClose={handleerrorclose}
              >
                {errmsg}
              </Alert>
            </Snackbar>
            <div className="your-required-wrapper" style={{ width: 700, height: 30 ,marginLeft:"27vh"}}>
                  <SwitchSelector
                    onChange={onSwitchSelectorChange}
                    options={options}
                    initialSelectedIndex={initialSelectedIndex}
                  />
            </div>
            <div className={classes.root} style={{ marginTop: "0%" }}>
                <Grid container spacing={1}>
                  <ValidatorForm
                    style={{ width: "100%", marginTop: "55" }}
                    onSubmit={handleSubmit}
                    instantValidate={true}
                  >
                      <Grid container item xs={12} spacing={1} direction="column">
                          <Grid item xs={8}>
                              <Grid container item xs={12} spacing={1} style={{marginLeft:"19vh"}}>
                                  <Grid item xs={6}>
                                      <Grid container item xs={12} spacing={1} direction="column">
                                        <Grid item xs={3}>
                                          <TextField
                                            autoFocus
                                            size="small"
                                            margin="normal"
                                            className={classes.input}
                                            id="outlined-select"
                                            select
                                            label="Building"
                                            value={bname}
                                            textalign={"center"}
                                            variant="outlined"
                                          >
                                            {bdata.map((option) => (
                                              <MenuItem
                                                key={option.uuid}
                                                value={option.name}
                                                onClick={() =>
                                                  handleBuildingChange(option.name, option.uuid)
                                                }
                                              >
                                                {option.name}
                                              </MenuItem>
                                            ))}
                                          </TextField>
                                        </Grid>
                                          {level == "floor" ? (
                                              <Grid item xs={3}>
                                                <TextField
                                                  autoFocus
                                                  size="small"
                                                  margin="normal"
                                                  className={classes.input}
                                                  id="outlined-select"
                                                  select
                                                  label="Floor"
                                                  value={fname}
                                                  textalign={"center"}
                                                  variant="outlined"
                                                >
                                                  {fdata.map((option) => (
                                                    <MenuItem
                                                      key={option.uuid}
                                                      value={option.name}
                                                      onClick={() =>
                                                        handleFloorChange(option.name, option.uuid)
                                                      }
                                                    >
                                                      {option.name}
                                                    </MenuItem>
                                                  ))}
                                                </TextField>
                                              </Grid>
                                          ) : level == "device" ? (
                                            <>
                                              <Grid item xs={3}>
                                                <TextField
                                                  autoFocus
                                                  size="small"
                                                  margin="normal"
                                                  className={classes.input}
                                                  id="outlined-select"
                                                  select
                                                  label="Floor"
                                                  value={fname}
                                                  // value={currency}
                                                  textalign={"center"}
                                                  // onChange={handleChange}
                                                  variant="outlined"
                                                >
                                                  {fdata.map((option) => (
                                                    <MenuItem
                                                      key={option.uuid}
                                                      value={option.name}
                                                      onClick={() =>
                                                        handleFloorChange(option.name, option.uuid)
                                                      }
                                                    >
                                                      {option.name}
                                                    </MenuItem>
                                                  ))}
                                                </TextField>
                                              </Grid>
                                              <Grid item xs={3}>
                                                <TextField
                                                  autoFocus
                                                  size="small"
                                                  margin="normal"
                                                  className={classes.input}
                                                  id="outlined-select"
                                                  select
                                                  label="Device"
                                                  value={dname}
                                                  textalign={"center"}
                                                  variant="outlined"
                                                >
                                                  {ddata.map((option) => (
                                                    <MenuItem
                                                      key={option.uuid}
                                                      value={option.name}
                                                      onClick={() =>
                                                        handleDeviceChange(option.name, option.uuid)
                                                      }
                                                    >
                                                      {option.name}
                                                    </MenuItem>
                                                  ))}
                                                </TextField>
                                              </Grid>
                                            </>
                                          ) : (
                                            <>
                                            </>
                                          )}
                                      </Grid>
                                  </Grid>
                                  <Grid item xs={6}>
                                      <Grid container item xs={12} spacing={1} direction="column">
                                        <Grid item xs={3}>
                                          <>
                                            <TextField
                                              autoFocus
                                              size="small"
                                              id="outlined-required"
                                              name="title"
                                              variant="outlined"
                                              className={classes.input}
                                              value={name}
                                              onChange={handleChangeForname}
                                            />
                                            <TextField
                                              style={{ marginLeft: "9vh", marginTop: "2.5vh" }}
                                              id="time"
                                              size="small"
                                              variant="outlined"
                                              label="clock"
                                              type="time"
                                              value={start_time}
                                              InputLabelProps={{
                                                shrink: true,
                                              }}
                                              inputProps={{
                                                step: 300, // 5 min
                                              }}
                                              onChange={handleChangeStartDate}
                                            />
                                            <TextField
                                              style={{ marginLeft: "36vh", marginTop: "-6vh" }}
                                              id="time"
                                              size="small"
                                              label="clock"
                                              variant="outlined"
                                              type="time"
                                              value={end_time}
                                              InputLabelProps={{
                                                shrink: true,
                                              }}
                                              inputProps={{
                                                step: 300, // 5 min
                                              }}
                                              onChange={handleChangeEndDate}
                                            />
                                            <FormControl
                                              className={classes.formControl}
                                              style={{ marginLeft: "9vh", width: "47vh" }}
                                            >
                                              <Select
                                                labelId="demo-mutiple-checkbox-label"
                                                id="demo-mutiple-checkbox"
                                                multiple
                                                size="small"
                                                variant="outlined"
                                                options={names}
                                                value={weekdays}
                                                onChange={handleWeeksChange}
                                                input={<Input />}
                                                renderValue={(selected) => selected.join(", ")}
                                              >
                                                {names.map((name) => (
                                                  <MenuItem key={name} value={name}>
                                                    <Checkbox
                                                      checked={weekdays.indexOf(name) > -1}
                                                    />
                                                    <ListItemText primary={name} />
                                                  </MenuItem>
                                                ))}
                                              </Select>
                                            </FormControl>
                                            <div style={{ marginLeft: "10vh", marginTop: "5vh" }}>
                                              <FormLabel>Action</FormLabel>
                                              <RadioGroup
                                                aria-label="action"
                                                name="action1"
                                                value={radbtn}
                                                onChange={handleRadioChange}
                                              >
                                                <FormControlLabel
                                                  value="on"
                                                  control={<Radio />}
                                                  label="On"
                                                  style={{ color: "black" }}
                                                />
                                                <FormControlLabel
                                                  value="off"
                                                  control={<Radio />}
                                                  label="Off"
                                                  style={{
                                                    color: "black",
                                                    marginLeft: "12vh",
                                                    marginTop: "-6vh",
                                                  }}
                                                />
                                              </RadioGroup>
                                            </div>
                                          </>
                                        </Grid>
                                      </Grid>
                                  </Grid>
                              </Grid>
                          </Grid>
                          <Grid item xs={2}>
                              <Grid container item xs={12} spacing={1}>
                                  <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="Blue"
                                    style={{
                                      width: "40vh",
                                      marginLeft: "71vh",
                                      marginTop: "5vh",
                                    }}
                                  >
                                    Submit
                                  </Button>
                              </Grid>
                          </Grid>
                      </Grid>
                  </ValidatorForm>
                </Grid>
                <SemanticToastContainer position="top-center" />
            </div>
        </div>
  );
}
