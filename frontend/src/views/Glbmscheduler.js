import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer} from "react-big-calendar";
import moment from "moment";
import 'semantic-ui-css/components/reset.min.css';
import 'semantic-ui-css/components/site.min.css';
import 'semantic-ui-css/components/container.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/components/message.min.css';
import 'semantic-ui-css/components/header.min.css';
import 'react-semantic-toasts/styles/react-semantic-alert.css';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import api from "api";
import SwitchSelector from "react-switch-selector";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { useSelector } from "react-redux";
import MenuItem from "@material-ui/core/MenuItem";
import { RRule} from 'rrule';


const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
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
      backgroundColor: "#0123b4", borderRadius: "8px"
    },
  },
  setptbutton: {
    minWidth: "8vh",
    borderRadius: "8px",
    height: "3vh",
    marginTop: "1vh",
    marginLeft: "-4vh", fontFamily: "Arial"
  },
  control1: {
    width: "6vh",
    marginTop: "0vh",
    marginLeft: "-11vh", fontFamily: "Arial"
  },
  text: {
    fontSize: "14px",
    color: " #292929", fontFamily: "Arial"
  },
}));

export default function Schedule(props) {

  const classes = useStyles()
  const data = useSelector((state) => state.inDashboard.locationData);
  const localizer = momentLocalizer(moment); // or globalizeLocalizer
  const [fdata, setFdata] = useState([]);
  const [fid, setFId] = useState([]);
  const [bdata, setBdata] = useState([]);
  const [ddata, setDData] = useState([]);
  const [bdetails, setBdetails] =useState({});
  const [schedule1, setSchedule1] = useState([]);
  const [object, setObject] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('12:00:00');
  const [bid, setBId] = useState(localStorage.getItem("buildingID"));
  const [fname, setFName] = useState([]);
  const [dname, setDName] = useState([]);
  const [level, setLevel] = React.useState("Building");
  const [bname, setBName] = useState([]);

  useEffect(() => {
    let b_id = '', b_data = []

    data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    data.filter((_each, i) => {
      if (_each.zone_type === 'GL_LOCATION_TYPE_BUILDING') {
        b_data.push(_each)
        setBId(b_id)
      }
      b_data.map((res) => {
        setBName(res.name)
      })
      setBdata(b_data)
    });
    // ScheduleDetails(bid, (response) => {
    //   setBdetails(response)
    //   // sch_details = handleScheduleDetails(response[0], temp);
    //   // if (sch_details.scheduleDetails.isSchedule == false) {
    //   // } else {
    //   // console.log("b_data===============",response)
    //   setObject(response[0].scheduleDetails.name);
    //   setStart(response[0].scheduleDetails.start);
    //   setEnd(response[0].scheduleDetails.end);
    //   se
    // ScheduleDetails(bid, (response) => {
    //   setBdetails(response);
    //   console.log("useEffect",response)
    //   if (response[0].scheduleDetails.isSchedule == false) {
    //   }
    //   else {
    //     setObject(response[0].scheduleDetails.name);
    //     setSchedule1(response[0].scheduleDetails.weekdays);
    //     setStart(response[0].scheduleDetails.start);
    //     setEnd(response[0].scheduleDetails.end);
    //   }
    // });
    ScheduleDetails(bid, (response) => {
  // Filter response based on zone_type === "GL_LOCATION_TYPE_BUILDING"
  const buildingResponse = response.find(item => item.zone_type === "GL_LOCATION_TYPE_BUILDING");

  if (buildingResponse) {
    setBdetails(buildingResponse);
    console.log("useEffect", buildingResponse);

    if (buildingResponse.scheduleDetails.isSchedule == false) {
      // Handle case where isSchedule is false
    } else {
      setObject(buildingResponse.scheduleDetails.name);
      setSchedule1(buildingResponse.scheduleDetails.weekdays);
      setStart(buildingResponse.scheduleDetails.start);
      setEnd(buildingResponse.scheduleDetails.end);
    }
  }
});

    // })

  }, [])

  const options = [
    {
      label: "Building",
      value: "Building",
      selectedBackgroundColor: "#0123b4",
    },
    {
      label: "Floor",
      value: "Floor",
      selectedBackgroundColor: "#0123b4",
    },
    {
      label: "Device",
      value: "Device",
      selectedBackgroundColor: "#0123b4",
    }
  ];

  const ScheduleDetails = (id, callback) => {
    let response = [];
    api.hvac_schedule.schedule_details(id)
      .then((res) => {
        res.map((resp) => {
          response.push(resp);
          callback(response);
        });
      })
      .catch((error)=>{
    })

  }
  const changeselector = (newValue) => {
    setObject("");
    setStart('')
    setEnd('');
    setSchedule1([])

    setLevel(newValue);
    if (newValue == "Building") {
      let b_id = '', b_data = []

      data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
      data.filter((_each, i) => {
        if (_each.zone_type === 'GL_LOCATION_TYPE_BUILDING') {
          b_data.push(_each)
          setBId(b_id)
        }
        b_data.map((res) => {
          setBName(res.name)
        })
        setBdata(b_data)
      });
      ScheduleDetails(bid, (response) => {
        setBdetails(response);
        // console.log("handle==================",response[0].scheduleDetails)
        if (response[0].scheduleDetails.isSchedule == false) {
        }
        else {
          setObject(response[0].scheduleDetails.name);
          setSchedule1(response[0].scheduleDetails.weekdays);
          setStart(response[0].scheduleDetails.start);
          setEnd(response[0].scheduleDetails.end);
        }
      });
      
    } else if (newValue == "Floor") {
      let b_id = "",b_data = [];
      data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      data.filter((_each, i) => {
        if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
          b_data.push(_each);
        }
        b_data.map((res) => {
          b_id = res.uuid
          setBId(res.uuid);
          setBName(res.name)

        })
        setBdata(b_data);
      });

      let f_data = [],temp="", sch_details = {}
      data.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      data.filter((_each, i) => {
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
      // setFName(f_data[0].name)
      if(temp ==""){
        temp=f_data[0].uuid
      setFId(f_data[0].uuid)
      setFName(f_data[0].name);
      }
      ScheduleDetails(b_id, (response) => {
        setBdetails(response)
        sch_details = handleScheduleDetails(response[0], temp);
        if (sch_details.scheduleDetails.isSchedule == false) {
        } else {
          setObject(sch_details.scheduleDetails.name);
          setStart(sch_details.scheduleDetails.start);
          setEnd(sch_details.scheduleDetails.end);
          setSchedule1(sch_details.scheduleDetails.weekdays);
        }
      })


    // } else if (newValue == "Device") {
    //   let b_id = "",b_data = [];
    //   data.sort(function (a, b) {
    //     return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    //   });
    //   data.filter((_each, i) => {
    //     if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
    //       b_data.push(_each);
    //     }
    //     b_data.map((res) => {
    //       b_id = res.uuid;
    //       setBId(res.uuid);
    //       setBName(res.name);
    //     });
    //     setBdata(b_data);
    //   });

    //   let f_data = [],temp="",
    //     sch_details = {};
    //   data.sort(function (a, b) {
    //     return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    //   });
    //   data.filter((_each, i) => {
    //     if (
    //       _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
    //       _each.zone_parent === b_id
    //     ) {
    //       f_data.push(_each);
    //       if(_each.uuid == fid){
    //         temp=_each.uuid
    //         setFName(_each.name);
    //         setFId(_each.uuid)
    //       }
    //     }
    //   });
    //   setFdata(f_data);
    //   if(temp ==""){
    //     setFName(f_data[0].name);
    //     temp = f_data[0].uuid
    //   }
    //   let z_data = [],
    //     d_data = [];
    //   data.sort(function (a, b) {
    //     return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    //   });
    //   data.filter((_each, i) => {
    //     if (
    //       _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
    //       _each.zone_parent === temp
    //     ) {
    //       z_data.push(_each);
    //       data.filter((eachObj) => {
    //         if (eachObj.zone_parent === _each.uuid) {
    //           d_data.push(eachObj);
    //         }
    //       });
    //       setDName(d_data[0].name)
    //       setDData(d_data)
    //       ScheduleDetails(b_id, (response) => {
    //         setBdetails(response);
    //         sch_details = handleScheduleDetails(response[0], d_data[0].uuid);
    //         if (sch_details.scheduleDetails.isSchedule == false) {
    //         }
    //         else {
    //           setObject(sch_details.scheduleDetails.name);
    //           setStart(sch_details.scheduleDetails.start);
    //           setEnd(sch_details.scheduleDetails.end);
    //           setSchedule1(sch_details.scheduleDetails.weekdays);
    //         }
    //       })


    //     }
    //   });
    // }
  } else if (newValue == "Device") {
    let b_id = "", b_data = [];
    data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    data.filter((_each, i) => {
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
  
    let f_data = [],
      temp = "",
      sch_details = {};
    data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_FLOOR" &&
        _each.zone_parent === b_id
      ) {
        f_data.push(_each);
        if (_each.uuid == fid) {
          temp = _each.uuid;
          setFName(_each.name);
          setFId(_each.uuid);
        }
      }
    });
    setFdata(f_data);
    if (temp == "") {
      setFName(f_data[0].name);
      temp = f_data[0].uuid;
    }
  
    let z_data = [],
      d_data = [];
    data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
        _each.zone_parent === temp
      ) {
        z_data.push(_each);
        data.filter((eachObj) => {
          if (eachObj.zone_parent === _each.uuid) {
            if(eachObj.zone_type=='NONGL_SS_AHU'){
              d_data.push(eachObj);
            }            }
        });
      }
    });
  
    setDData(d_data);  // Set d_data here
  
    if (d_data.length > 0) {
      setDName(d_data[0].name);
  
      ScheduleDetails(b_id, async (response) => {
        setBdetails(response);
        sch_details = handleScheduleDetails(response[0], d_data[0].uuid);
        if (sch_details.scheduleDetails.isSchedule == false) {
        } else {
          setObject(sch_details.scheduleDetails.name);
          setStart(sch_details.scheduleDetails.start);
          setEnd(sch_details.scheduleDetails.end);
          setSchedule1(sch_details.scheduleDetails.weekdays);
        }
      });
    }
  }
  
  };

  const initialSelectedIndex = options.findIndex(({ value }) => value === "Building");

  function handleScheduleDetails(node, value) {
    if (node && node.uuid === value) {
      return node; // Match found, return the current node
    }
    // if (node.children && node.children.length > 0) {
    //   // Traverse child nodes and search recursively
    //   for (let i = 0; i < node.children.length; i++) {
    //     const matchedNode = handleScheduleDetails(node.children[i], value);
    //     if (matchedNode) {
    //       return matchedNode; // Match found in child node, return the matched node
    //     }
    //   }
    // }
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
    let f_data = []

    data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    data.filter((_each, i) => {
      if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR') {
        f_data.push(_each)
      }
      setFdata(f_data)
    })

    // api.hvac_schedule.schedule_details(localStorage.getItem("buildingID")).then((res) => {
    //   console.log("res----------building---",res[0].scheduleDetails)
    //   // res.map((res) => {
    //     //   setBdetails(res);
    //     res[0].filter((_each, i) => {
    //       if (_each.zone_type === "GL_LOCATION_TYPE_BUILDING") {
    //         setBdetails(_each)
            
    //     if (level == "Building") {
    //       let obj = {}
    //       obj = res[0].scheduleDetails
    //       setObject(obj.name);
    //       setStart(obj.start);
    //       setEnd(obj.end);
    //       setSchedule1(obj.weekdays)
    //             }
    //     // console.log("level", level)
    //     // console.log("obj----++++++++++",obj)
    // }});
    // })
    // .catch((error) => {
    // });

    api.hvac_schedule.schedule_details(localStorage.getItem("buildingID"))
    .then((res) => {
      console.log("res----------building---", res[0].scheduleDetails.isSchedule);
  
      // Use filter to get only items with zone_type "GL_LOCATION_TYPE_BUILDING"
      const buildingDetails = res.filter((_each) => _each.zone_type === "GL_LOCATION_TYPE_BUILDING");
  
      // Assuming you want to process the first item with zone_type "GL_LOCATION_TYPE_BUILDING"
      if (buildingDetails.length > 0) {
        const buildingDetail = buildingDetails[0];
  
        setBdetails(buildingDetail);
  
        if (level === "Building") {
          let obj = buildingDetail.scheduleDetails;
          
          if (obj.isSchedule) {
            setObject(obj.name);
            setStart(obj.start);
            setEnd(obj.end);
            setSchedule1(obj.weekdays);
          } else {
            // Handle the case where isSchedule is false
            console.log("No schedule available for this building");
            // Set default values or take appropriate action
          }
        }
      }
    })
    .catch((error) => {
      console.error("Error fetching schedule details:", error);
      // Handle the error appropriately
    });
  
  

  }

  const handlefloorChange = (name, id) => {
    setFId(id)
    setFName(name);
    let z_data = [],
      d_data = [];
    data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    data.filter((_each, i) => {
      if (
        _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
        _each.zone_parent === id
      ) {
        z_data.push(_each);
        data.filter((eachObj) => {
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
        setObject('');
        setSchedule1('');
        setStart('');
        setEnd('');
      }
    });
    setDData(d_data)
    if (level == "Floor") {
      let sch_details = handleScheduleDetails(bdetails[0], id);
      // console.log("sch_details",sch_details)
      if (sch_details.scheduleDetails.isSchedule == false) {
      }
      else {
        setObject(sch_details.scheduleDetails.name);
        setSchedule1(sch_details.scheduleDetails.weekdays);
        setStart(sch_details.scheduleDetails.start);
        setEnd(sch_details.scheduleDetails.end);
      }
    }
  }
  const handledeviceChange = (name, id) => {
    setDName(name);
    if (level == "Device") {
      let sch_details = handleScheduleDetails(bdetails[0], id);
      console.log("sch_details",sch_details)
      if (sch_details.scheduleDetails.isSchedule == false) {
      }
      else {
        setObject(sch_details.scheduleDetails.name);
        setSchedule1(sch_details.scheduleDetails.weekdays);
        setStart(sch_details.scheduleDetails.start);
        setEnd(sch_details.scheduleDetails.end);
      }
    }
  }
  const obj = {
    'Sunday':RRule.SU,
    'Monday': RRule.MO,
    'Tuesday': RRule.TU,
    'Wednesday': RRule.WE,
    'Thursday': RRule.TH,
    'Friday': RRule.FR,
     'Saturday':RRule.SA,
  }
  let arr = [];
  for (let i = 0; i < schedule1.length; i++) {
    // console.log("obj[schedule1[i]]",obj[schedule1[i]])
    arr.push(obj[schedule1[i]])
  }

  const recurringRule = new RRule({
    freq: RRule.WEEKLY, // Set the frequency to weekly
    interval: 1, // Repeat every week
    byweekday: arr, // Repeat on Mondays
    // moment(timeString, format).toDate();
    // dtstart: moment(`${currentDate} ${start}`, 'YYYY-MM-DD HH:mm:ss').toDate(), // Set the start date to the current week's Monday
    until: moment().add(1, 'year').toDate(), // Set the end date to one year from now
  });
  const recurringDates = recurringRule.all();
  const eventslist = recurringDates.map(time => ({
    start: moment(time).set({
      hour: Number(start.split(':')[0]),
      minute: Number(start.split(':')[1]),
    }).toDate(),
        end:moment(time).set({
          hour: Number(end.split(':')[0]),
          minute: Number(end.split(':')[1]),
        }).toDate(), // Set the end time of the event
    // end: moment(`${currentDate} ${end}`, 'YYYY-MM-DD HH:mm:ss').toDate(), // Set the end time of the event
    title: object,

  }));

  return (
    <div>
      <div className={classes.root} style={{ marginTop: "0%" }}>
        <Grid container spacing={1}>
          <div className="your-required-wrapper" style={{ width: 400, height: 30 }}>
            <SwitchSelector
              onChange={changeselector}
              options={options}
              initialSelectedIndex={initialSelectedIndex}
              wrapperBorderRadius={5}
              optionBorderRadius={8}

            />
          </div>
          <Grid container item xs={12} spacing={1}>

            <Grid item xs={4}>
              <FormControl
                variant="outlined"
                size="large"
                className={classes.formControl}
                style={{
                  width: "max-content", minWidth: "80%",
                  backgroundColor: "#eeeef5", fontFamily: "Arial"
                }}
              >
                <InputLabel id="demo-simple-select-outlined-label">
                  Building
                </InputLabel>
                <Select
                  labelId="demo-simple-select-outlined-label"
                  id="demo-simple-select-outlined"
                  label="Floor"
                  style={{
                    fontWeight: "bold", height: "6vh", borderRadius: '0.8vw',
                    fontFamily: "Arial"
                  }}

                  className={classes.select}
                  disableUnderline
                  value={bname}
                >
                  {bdata.map((_item) => (
                    <MenuItem
                      key={_item.uuid}
                      value={_item.name}
                      onClick={() => handleBuildingChange(_item.name, _item.uuid)}
                    >
                      {_item.name}
                    </MenuItem>
                  ))}


                </Select>
              </FormControl>
            </Grid>

            {level == "Floor" ? (

              <Grid item xs={4}>
                <FormControl
                  variant="outlined" size="large"
                  className={classes.formControl}
                  style={{
                    width: "max-content", minWidth: "80%", backgroundColor: "#eeeef5", fontFamily: "Arial", marginLeft: "-11vh"
                  }}
                >
                  <InputLabel id="demo-simple-select-outlined-label">
                    Floor
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-outlined-label"
                    id="demo-simple-select-outlined"
                    label="Floor"
                    value={fname}
                    style={{ fontWeight: "bold", height: "6vh", borderRadius: '0.8vw', fontFamily: "Arial" }}
                    className={classes.select}
                    disableUnderline
                  >
                    {fdata.map((_item) => (
                      <MenuItem
                        key={_item.uuid}
                        value={_item.name}
                        onClick={() => handlefloorChange(_item.name, _item.uuid)}
                      >
                        {_item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : level == "Device" ? (
              <>
                <Grid item xs={4}>
                  <FormControl
                    variant="outlined" size="large"
                    className={classes.formControl}
                    style={{
                      width: "max-content", minWidth: "80%", backgroundColor: "#eeeef5", fontFamily: "Arial", marginLeft: "-11vh"
                    }}
                  >
                    <InputLabel id="demo-simple-select-outlined-label">
                      Floor
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      label="Floor"
                      value={fname}
                      style={{ fontWeight: "bold", height: "6vh", borderRadius: '0.8vw', fontFamily: "Arial" }}
                      className={classes.select}
                      disableUnderline
                    >
                      {fdata.map((_item) => (
                        <MenuItem
                          key={_item.uuid}
                          value={_item.name}
                          onClick={() => handlefloorChange(_item.name, _item.uuid)}
                        >
                          {_item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <FormControl
                    variant="outlined"
                    size="large"
                    className={classes.formControl}
                    style={{
                      width: "max-content", minWidth: "80%",
                      backgroundColor: "#eeeef5", fontFamily: "Arial", marginLeft: "-22vh"
                    }}
                  >
                    <InputLabel id="demo-simple-select-outlined-label">
                      Device
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-outlined-label"
                      id="demo-simple-select-outlined"
                      label="Floor"
                      style={{
                        fontWeight: "bold", height: "6vh", borderRadius: '0.8vw',
                        fontFamily: "Arial"
                      }}
                      className={classes.select}
                      disableUnderline
                      value={dname}
                    >
                      {ddata.map((_item) => (
                        <MenuItem
                          key={_item.uuid}
                          value={_item.name}
                          onClick={() => handledeviceChange(_item.name, _item.uuid)}
                        >
                          {_item.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : (
              <></>
            )}
          </Grid>
        </Grid>
      </div>
      <Calendar
        localizer={localizer}
        events={eventslist}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500,marginTop:20 }}
        views={['month', 'week', 'day']}
        defaultDate={moment().startOf('week').toDate()}
      />

    </div>
  );
}
