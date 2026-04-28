import React, { useEffect, useState } from "react";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import { makeStyles,withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import api from "../../api";
import Building from "../../assets/img/building.svg";
import Grid from "@material-ui/core/Grid";
import { useSelector, useDispatch } from "react-redux";
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import Typography from "@material-ui/core/Typography";
import WarningIcon from "assets/img/Warning";
import SuccessIcon from "assets/img/Success";
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import { blackColor, hexToRgb } from "assets/jss/material-dashboard-react.js";
import Tooltip from '@material-ui/core/Tooltip';

const StyledTooltip = withStyles({
  // "& .MuiTooltip-tooltip": {
  //   border: "solid skyblue 1px",
  //   color: "deepskyblue"
  // },
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize:"12px"
  }
})(Tooltip);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  Card: {
    width: "90%",
    height: "91%",
    fontsize: "17px",
    fontweight: "500",
    color: "#0123b4",
    textAlign: "center"
  },
  CardHeaderGrid: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    height: "4vh"
  },
  statusGrid: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    height: "14vh",
    padding: "0.4rem 0.3rem"
  },
  floorStatusGrid: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    height: "14vh",
    padding: "0.4rem 0.3rem",
  },
  CardBodyGrid: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "border-radius": "5px",
    flex: "1 1 auto",
    fontSize: "17px",
    WebkitBoxFlex: "1",
    position: "center",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.54)"
  },
  CardbodyInsideGrid: {
    "justify-content": "center",
    display: "inline-flex",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative"
  },
  container: {
    border: '4px solid green',
    display: 'inline-flex',
  },
  cardHeaderGrid2: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    "border-radius": "5px",
    padding: "-0.0625rem 20px",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)",
    marginLeft: "10px",
    "flex-direction": "column",
  },
  CardHeader2: {
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
  },
  alertTypo: {
    color: "black"
  },
  CardbodyInsideGrid2: {
    "padding-top": "0px",
    display: "inline-flex",
    padding: "0.9375rem 20px",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative"
  },
  gridContainerStyle: {
    padding: "0.5rem"
  },
  floorCardHeader: {
    padding: "0.2rem 0.3rem"
  },
  typoInHeader: {
    "font-size": "1em"
  },
}));

export default function NewDashboard(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const alerts = useSelector((state) => state.alarm.alarmData);
  const [data, setData] = React.useState([]);
  const [gateWayStatus, setGateWayStatus] = useState(0);
  const [gateWay, setGateWay] = useState(0);
  const [deviceStatus, setDeviceStatus] = useState(0);
  const [tempFloorIssue, setTempFloorIssue] = useState({
    tempissue: [],
    tempData: "",
  });
  const [humFloorIssue, setHumFloorIssue] = useState({
    humissue: [],
    humData: "",
  });
  const [luxFloorIssue, setLuxFloorIssue] = useState({
    luxissue: [],
    luxData: "",
  });
  const [airFloorIssue, setAirFloorIssue] = useState({
    airissue: [],
    airData: "",
  });
  const [openerr,setOpenerr] = React.useState(false);
  const [errmsg,setErrmsg] = React.useState('');

  useEffect(() => {
    // api.notifications.alarm(buildingID).then((resalarm) => {
    // })
    // .catch((error)=>{
    //   setOpenerr(true);
    //   setErrmsg(error.response.data.message)
    // })
    localStorage.setItem('floorName','Floor-01')
    localStorage.setItem('floorID','eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20')
    let timer = setInterval(() => {
      if( localStorage.getItem("buildingID") !== null){
        api.notifications.alarm(buildingID).then((res) => {
          // console.log("4444JS")
          dispatch({
              type: "alarm",
              payload: res,
          });
      })
       .catch((error)=>{
      setOpenerr(true);
      console.log("newdashboard alarms error",error)
      // setErrmsg(error.response.data.message)
    })
      }else{
        clearInterval(timer)
      }
     
    }, 5000);
    let gw = alerts.system.filter((m) => {
      if (parseInt(m.alarm_code) >= 100 && parseInt(m.alarm_code) < 200) {
        return m;
      } else {
        return null;
      }
    });
    let dev = alerts.system.filter((m) => {
      if (parseInt(m.alarm_code) >= 200 && parseInt(m.alarm_code) < 300) {
        return m;
      } else {
        return null;
      }
    });
    setGateWayStatus(gw.length);
    setDeviceStatus(dev.length);
    localStorage.removeItem("context");
    localStorage.removeItem("controlFloorID");
    localStorage.removeItem("contolFloorName");
    api.campus.glZones(buildingID).then((result) => {
      if(result.length!==0){
        let isssueZone = result.filter((e) => {
          return alerts.solution.find((el) => {
            return el.zoneId === e.uuid;
          });
        });
        let isssueFloor = result.filter((e) => {
          return alerts.solution.find((el) => {
            return el.floorId === e.uuid;
          });
        });

        let floorDataLocal = {
          temp: [],
          hum: [],
          lux: [],
          air: [],
        };
        api.dashboard.getMetricData(buildingID).then((res) => {
          if(res.length!==0){
            let tempfloorissue = alerts.solution.filter((e) => {
              if (
                e.message === "Return Air Temperature Low" ||
                e.message === "Return Air Temperature High"
              ) {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              } else {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              }
            });
            let humfloorissue = alerts.solution.filter((e) => {
              if (e.message === "humidity") {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              } else {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              }
            });

            let luxfloorissue = alerts.solution.filter((e) => {
              if (e.message === "luminosity") {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              } else {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              }
            });

            let airfloorissue = alerts.solution.filter((e) => {
              if (e.message === "co2") {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              } else {
                return isssueFloor.find((iss) => {
                  return iss.uuid === e.floorId && iss.zone_parent === buildingID;
                });
              }
            });

            res.map((ele) => {
              let virtual = {};
              ele.parameter.map((m) => {
                return (virtual[m.name] = m.value);
              });
              floorDataLocal.temp.push(virtual.TEMPERATURE);
              floorDataLocal.air.push(virtual.CO2);
              floorDataLocal.hum.push(virtual.HUMIDITY);
              floorDataLocal.lux.push(virtual.LUMINOUSITY);
              return ele;
            });
            setTempFloorIssue({
              ...tempFloorIssue,
              tempissue: tempfloorissue,
              tempData: floorDataLocal.temp.filter((e) => e !== "no Data").length,
            });
            setHumFloorIssue({
              ...humFloorIssue,
              humissue: humfloorissue,
              humData: floorDataLocal.hum.filter((e) => e !== "no Data").length,
            });
            setLuxFloorIssue({
              ...luxFloorIssue,
              luxissue: luxfloorissue,
              luxData: floorDataLocal.lux.filter((e) => e !== "no Data").length,
            });
            setAirFloorIssue({
              ...airFloorIssue,
              airissue: airfloorissue,
              airData: floorDataLocal.air.filter((e) => e !== "no Data").length,
            });
            res.forEach((element) => {
              element["noOfCritical"] = alerts.system.filter(
                (e) => e.floorId === element.id
              ).length;
              element["noOfLow"] = alerts.solution.filter(
                (e) => e.floorId === element.id
              ).length;
              element["tempIssue"] = alerts.solution.filter((e) => {
                if (e.message === "Return Air Temperature Low") {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                } else {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                }
              });
              element["humIssue"] = alerts.solution.filter((e) => {
                if (e.message === "humidity") {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                } else {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                }
              });
              element["luxIssue"] = alerts.solution.filter((e) => {
                if (e.message === "humidity") {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                } else {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                }
              });
              element["airIssue"] = alerts.solution.filter((e) => {
                if (e.message === "humidity") {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                } else {
                  return isssueZone.find((iss) => {
                    return iss.uuid === e.zoneId && iss.zone_parent === element.id;
                  });
                }
              });
            });

            res.sort(function (a, b) {
              return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
            });
            setData(res);
          } else {
           setOpenerr(true)
           setErrmsg("No Data Found!!!!!")
          }
        })
        .catch((error) =>{
          setOpenerr(true);
          setErrmsg(error.response.data.message)
        })
        dispatch({
          type: "location",
          payload: result,
        });
      } else {
        setOpenerr(true);
        setErrmsg("No Data Found!!!!!")
      } 
      result.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      let flr= result.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
      let dev=[]
      api.floor.devicemap(flr[0].uuid, "AHU")
      .then((res) => {
        dev=res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        localStorage.setItem("deviceID", dev[0].ssid);
        localStorage.setItem("deviceName", dev[0].name);
      }).catch((error) =>{
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('')
          }
      })
    })
    .catch((error) =>{
      // setOpenerr(true);
      // setErrmsg(error.response.data.message)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('')
        }   
    })
     //eslint-disable-next-line
  }, []);

  const handleclose = () => {
    setOpenerr(false);
    setErrmsg('');
  };

  const onClickIssue = (id, name, param) => {
    props.changeContext("floor")
    props.history.push({
      pathname: `/admin/selector`,
      state: {
        data: id
      }
    })
    localStorage.setItem("context", "floor");
    localStorage.setItem("floorID", id);
    localStorage.setItem("mapSubType", param);
    localStorage.setItem("floorName", name);
  };

  const eachfloorData = (element, index) => {
    let temp = {};
    element.parameter.map((m) => {
      return (temp[m.name] = m.value);
    });
    return (
      <Grid container xs={12} direction="row"  style={{marginTop:"1vh",width:"95%"}} >
        {element.noOfCritical > 0 ? (
          <Grid item xs className={classes.floorStatusGrid}
          >
              <Card
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: "1vh",
                  marginBottom: "0px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  backgroundColor: "red",
                  marginRight:"-4vh"
                }}
              >
                 <Button
              style={{ width: "100%", height: "100%",whiteSpace:"nowrap" }}
              onClick={() =>
                onClickIssue(element.id, element.name, "temperature")
              }
            >
                <Typography style={{ color: "white" ,fontSize:"12px"}}>
                  {" "}
                  {element.name}
                </Typography>
                            </Button>

              </Card>
          </Grid>
        ) : element.noOfLow > 0 ? (
          <Grid item xs className={classes.floorStatusGrid}>
           
              <Card
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: "1vh",
                  marginBottom: "0px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  backgroundColor: "#f2aa1a",
                  marginRight:"-4vh"
                
                }}
              >
                 <Button
              style={{ width: "100%", height: "100%",whiteSpace:"nowrap"  }}
              onClick={() =>
                onClickIssue(element.id, element.name, "temperature")
              }
            >
                <Typography style={{ color: "white" ,fontSize:"12px"}}>
                  {" "}
                  {element.name}
                </Typography>
                </Button>

              </Card>
          </Grid>
        ) : (
          <Grid item xs className={classes.floorStatusGrid}>
           
              <Card
                style={{
                  width: "100%",
                  height: "100%",
                  marginTop: "0px",
                  marginBottom: "0px",
                  alignItems: "center",
                  justifyContent: "center",
                  display: "flex",
                  backgroundColor: "green",
                  marginRight:'-4vh'
                }}
              >
                 <Button
              style={{ width: "100%", height: "100%" ,whiteSpace:"nowrap" }}
              onClick={() =>
                onClickIssue(element.id, element.name, "temperature")
              }
            >
                <Typography style={{ color: "white",fontSize:"12px" }}>
                  {" "}
                  {element.name}
                </Typography>
                </Button>

              </Card>
          </Grid>
        )}

        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "100%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft: "2.5vh",
              marginRight: "-3vh"
            }}
          >
            <CardHeader className={classes.floorCardHeader}>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Alerts
              </Typography>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
                width:"85%"
              }}
            >
              <Grid item xs={8}>
                <Grid container xs={12} direction="column">
                  <Grid
                    item
                    xs={12}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <Typography variant="string" className={classes.alertTypo}>
                      Critical
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      marginLeft:"-1vh"
                    }}
                  >
                    <Typography variant="string" className={classes.alertTypo}>
                      Low
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container xs={12} direction="column">
                  <Grid
                    item
                    xs={12}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <Danger>{element.noOfCritical}</Danger>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <Warning>{element.noOfLow}</Warning>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "100%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft:"2.5vh",
              marginRight:"-3vh"
            }}
          >
            <CardHeader className={classes.floorCardHeader}>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Temperature
              </Typography>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {element.tempIssue.length > 0 ? (
                <>
                  <Grid item xs={8}>
                    <Grid container xs={12}>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          
                        }}
                      >
                        <WarningIcon />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container xs={12} direction="column">
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-2vh"
                        }}
                      >
                        <Warning>{element.tempIssue.length}</Warning>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-1vh"
                        }}
                      >
                        <Warning>Zone</Warning>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  {temp.TEMPERATURE !== "no Data" ? (
                    <>
                      <SuccessIcon />
                    </>
                  ) : (
                    <> <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                      <Typography style={{ color: "black",fontSize:"12.5px" ,fontSize:"12.5px"}}>
                        Not available
                      </Typography>
                      </StyledTooltip>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Card>
        </Grid>

        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "95%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft:"2.5vh",
              marginRight:"-3vh"

            }}
          >
            <CardHeader className={classes.floorCardHeader}>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Humidity
              </Typography>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {element.humIssue.length > 0 ? (
                <>
                  <Grid item xs={8}>
                    <Grid container xs={12}>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                        }}
                      >
                        <WarningIcon />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container xs={12} direction="column">
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-2vh"
                        }}
                      >
                        <Warning>{element.humIssue.length}</Warning>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-1vh"
                        }}
                      >
                        <Warning>Zone</Warning>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  {temp.HUMIDITY !== "no Data" ? (
                    <>
                      <SuccessIcon />
                    </>
                  ) : (
                    <>             <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                      <Typography style={{ color: "black",fontSize:"12.5px" }}>
                        Not available
                      </Typography>
                      </StyledTooltip>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Card>
        </Grid>
        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "95%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft:"2.5vh",
              marginRight:"-3vh"

            }}
          >
            <CardHeader className={classes.floorCardHeader}>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Light
              </Typography>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {element.luxIssue.length > 0 ? (
                <>
                  <Grid item xs={8}>
                    <Grid container xs={12}>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                        }}
                      >
                        <WarningIcon />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container xs={12} direction="column">
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-2vh"
                        }}
                      >
                        <Warning>{element.luxIssue.length}</Warning>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-1vh"
                        }}
                      >
                        <Warning>Zone</Warning>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  {temp.LUMINOUSITY !== "no Data" ? (
                    <>
                      <SuccessIcon />
                    </>
                  ) : (
                    <>             
                    <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                      <Typography style={{ color: "black",fontSize:"12.5px" }}>
                        Not available
                      </Typography>
                      </StyledTooltip>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Card>
        </Grid>
        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "95%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft:"2.5vh",
              marginRight:"-3vh"

            }}
          >
            <CardHeader className={classes.floorCardHeader}>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Air Quality
              </Typography>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
              {element.airIssue.length > 0 ? (
                <>
                  <Grid item xs={8}>
                    <Grid container xs={12}>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                        }}
                      >
                        <WarningIcon />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container xs={12} direction="column">
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-2vh"
                        }}
                      >
                        <Warning>{element.airIssue.length}</Warning>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          marginLeft:"-1vh"
                        }}
                      >
                        <Warning>Zone</Warning>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  {temp.CO2 !== "no Data" ? (
                    <>
                      <SuccessIcon />
                    </>
                  ) : (
                    <>
                      <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                      <Typography style={{ color: "black",fontSize:"12.5px" }}>
                        Not available
                      </Typography>
                      </StyledTooltip>
                    </>
                  )}
                </>
              )}
            </Grid>
          </Card>
        </Grid>
        <Grid item xs className={classes.floorStatusGrid}>
          <Card
            style={{
              width: "95%",
              height: "100%",
              marginTop: "0px",
              marginBottom: "0px",
              marginLeft:"2.5vh",
              marginRight:"-3vh"

            }}
          >
            <CardHeader className={classes.floorCardHeader}>
            <StyledTooltip title="DG,Lift" className={classes.tooltip} arrow>
              <Typography
                align="center"
                style={{ color: "#0123B4",fontWeight:"bold" }}
                className={classes.typoInHeader}
              >
                Others
              </Typography>
              </StyledTooltip>
            </CardHeader>
            <Grid
              container
              xs={12}
              direction="row"
              style={{
                height: "9vh",
                alignItems: "center",
                justifyContent: "center",
                display: "flex",
              }}
            >
             <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                      <Typography style={{ color: "black",fontSize:"12.5px" }}>
                        Not available
                      </Typography>
              </StyledTooltip>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <div style={{ width: "100%", display: "flex" }}>
      <Snackbar open={openerr} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleclose}>
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container xs={12} spacing={2}>
        <Grid
          item
          xs={6}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={Building}
            alt="Building"
            style={{
              height: "83vh",
              width: "64%",
              marginLeft:"-19vh",
              marginTop:"-6vh"
            }}
          />
        </Grid>
        <Grid item xs={6} spacing={1}>
          <Card
            style={{
              height: "33vh",
              marginTop: "0px",
              marginBottom: "2%",
              width: "130%",
              marginLeft:"-24vh",
              // border: '2px solid white'
            }}
          >
            <Grid container xs={12} direction="row" style={{marginLeft:"3vh",width:"94%"}}>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4" }}></Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4" ,marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh"}}>Plant room</Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh" }}>Air side</Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh" }}>Energy</Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh" }}>Lights</Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh" }}>UPS</Typography>
              </Grid>
              <Grid item xs className={classes.CardHeaderGrid}>
                {" "}<StyledTooltip title="DG,Lift" className={classes.tooltip} arrow>
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold",marginTop:"1vh" }}>Others</Typography>
                </StyledTooltip>
              </Grid>
            </Grid>
             <Grid container xs={12} direction="row" style={{marginLeft:"2vh",width:"94%"}}>
                <Grid item xs className={classes.statusGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"-3vh",fontWeight:"bold" }}>
                  Network <br/>Status
                </Typography>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >    <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap",fontSize:"12.5px" }}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  {gateWayStatus > 0 ? (
                    <>{console.log("gateWay.message",gateWay)}
                    {/* <StyledTooltip title={gateWay.message} className={classes.tooltip} arrow> */}
                      <WarningIcon />
                      <Warning>{gateWayStatus} warning</Warning>
                      {/* </StyledTooltip> */}
                    </>
                  ) : (
                    <SuccessIcon />
                  )}
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >  <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap",fontSize:"12.5px" }}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <SuccessIcon />
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >  
                <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap" ,fontSize:"12.5px"}}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                ><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap",fontSize:"12.5px" }}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
            </Grid> 
            <Grid container xs={12} direction="row" style={{marginLeft:"2vh",width:"94%"}}>
              <Grid item xs className={classes.statusGrid}>
                {" "}
                <Typography style={{ color: "#0123b4",marginLeft:"1vh",fontWeight:"bold" }}>
                  Field Device Status
                </Typography>{" "}
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                 <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap",fontSize:"12.5px" }}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>   
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  {deviceStatus > 0 ? (
                    <>
                      <WarningIcon />
                      <Warning>{deviceStatus} Warning</Warning>
                    </>
                  ) : (
                    <SuccessIcon />
                  )}
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                ><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap" ,fontSize:"12.5px"}}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                  <SuccessIcon />
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                ><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap" ,fontSize:"12.5px"}}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
              <Grid item xs className={classes.statusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "0px",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                  }}
                >
                <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                  <Typography style={{ color: "black", whiteSpace: "nowrap" ,fontSize:"12.5px"}}>
                    Not available
                  </Typography>
                  </StyledTooltip>
                </Card>
              </Grid>
            </Grid>
          </Card>
          <Card
            style={{
              height: "16vh",
              marginTop: "0px",
              marginBottom: "2%",
              width: "130%",
              marginLeft:"-24vh"
            }}
          >
             <Grid container xs={12} direction="row" style={{marginLeft:"1vh",width:"94%"}}>
               <Grid item xs className={classes.floorStatusGrid}>
                {alerts.solution.length || alerts.system.length> '0'?
                <>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    backgroundColor: "#990000",
                    marginRight:"-2vh"
                  }}
                >
                  <Typography style={{ color: "white" }}> All Floors</Typography>
                </Card>
                </>:<>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    backgroundColor: "#0123B4",
                    marginRight:"-2vh"
                  }}
                >
                  <Typography style={{ color: "white" }}> All Floors</Typography>
                </Card></>
              }
                {/* <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    backgroundColor: "#0123B4",
                    marginRight:"-2vh"
                  }}
                >
                  <Typography style={{ color: "white" }}> All Floors</Typography>
                </Card> */}
              </Grid> 
              <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                    <Typography
                      align="center"
                      style={{ color: "#0123b4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Alerts
                    </Typography>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    <Grid item xs={8}>
                      <Grid container xs={12} direction="column">
                        <Grid
                          item
                          xs={12}
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                          }}
                        >
                          <Typography
                            variant="string"
                            className={classes.alertTypo}
                          >
                            Critical
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            marginLeft:"-1vh"
                          }}
                        >
                          <Typography
                            variant="string"
                            className={classes.alertTypo}
                          >
                            Low
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={4}>
                      <Grid container xs={12} direction="column">
                        <Grid
                          item
                          xs={12}
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                          }}
                        >
                          <Danger>{alerts.system.length}</Danger>
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          style={{
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                          }}
                        >
                          <Warning>{alerts.solution.length}</Warning>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                    <Typography
                      align="center"
                      style={{ color: "#0123B4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Temperature
                    </Typography>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                   
                    }}
                  >
                    {tempFloorIssue.tempissue.length > 0 ? (
                      <>
                        <Grid item xs={8}>
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",

                              }}
                            >
                              <WarningIcon />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4}>
                          <Grid container xs={12} direction="column">
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-2vh"
                              }}
                            >
                              <Warning>
                                {tempFloorIssue.tempissue.length}
                              </Warning>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-1vh"
                              }}
                            >
                              <Warning>Floor</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {tempFloorIssue.tempData > 0 ? (
                          <>
                            <SuccessIcon />
                          </>
                        ) : (
                          <><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                            <Typography style={{ color: "black",fontSize:"12.5px" }}>
                              Not available
                            </Typography>
                            </StyledTooltip>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                    <Typography
                      align="center"
                      style={{ color: "#0123B4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Humidity
                    </Typography>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {humFloorIssue.humissue.length > 0 ? (
                      <>
                        <Grid item xs={8}>
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                              }}
                            >
                              <WarningIcon />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4}>
                          <Grid container xs={12} direction="column">
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-2vh"

                              }}
                            >
                              <Warning>{humFloorIssue.humissue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-1vh"

                              }}
                            >
                              <Warning>Floor</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {humFloorIssue.humData > 0 ? (
                          <>
                            <SuccessIcon />
                          </>
                        ) : (
                          <><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                            <Typography style={{ color: "black" ,fontSize:"12.5px"}}>
                              Not available
                            </Typography>
                            </StyledTooltip>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
               <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                    <Typography
                      align="center"
                      style={{ color: "#0123B4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Light
                    </Typography>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {luxFloorIssue.luxissue.length > 0 ? (
                      <>
                        <Grid item xs={8}>
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                              }}
                            >
                              <WarningIcon />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4}>
                          <Grid container xs={12} direction="column">
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-2vh"
                              }}
                            >
                              <Warning>{luxFloorIssue.luxissue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-1vh"
                              }}
                            >
                              <Warning>Floor</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {luxFloorIssue.luxData > 0 ? (
                          <>
                            <SuccessIcon />
                          </>
                        ) : (
                          <><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                            <Typography style={{ color: "black",fontSize:"12.5px" }}>
                              Not available
                            </Typography>
                            </StyledTooltip>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid> 
               <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                    <Typography
                      align="center"
                      style={{ color: "#0123B4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Air Quality
                    </Typography>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                    {airFloorIssue.airissue.length > 0 ? (
                      <>
                        <Grid item xs={8}>
                          <Grid container xs={12}>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                              }}
                            >
                              <WarningIcon />
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4}>
                          <Grid container xs={12} direction="column">
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-2vh"
                              }}
                            >
                              <Warning>{airFloorIssue.airissue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              style={{
                                alignItems: "center",
                                justifyContent: "center",
                                display: "flex",
                                marginLeft:"-1vh"
                              }}
                            >
                              <Warning>Floor</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {airFloorIssue.airData > 0 ? (
                          <>
                            <SuccessIcon />
                          </>
                        ) : (
                          <><StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                            <Typography style={{ color: "black",fontSize:"12.5px" }}>
                              Not available
                            </Typography>
                            </StyledTooltip>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid> 
              <Grid item xs className={classes.floorStatusGrid}>
                <Card
                  style={{
                    width: "100%",
                    height: "100%",
                    marginTop: "3vh",
                    marginBottom: "0px",
                    marginRight:"-3vh"
                  }}
                >
                  <CardHeader className={classes.floorCardHeader}>
                  <StyledTooltip title="DG,Lift" className={classes.tooltip} arrow>
                    <Typography
                      align="center"
                      style={{ color: "#0123B4",fontWeight:"bold" }}
                      className={classes.typoInHeader}
                    >
                      Others
                    </Typography>
                    </StyledTooltip>
                  </CardHeader>
                  <Grid
                    container
                    xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                    }}
                  >
                 
                          <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                              <Typography style={{ color: "black",fontSize:"12.5px" }}>
                              Not available
                            </Typography>
                          </StyledTooltip>

                  </Grid>
                </Card>
              </Grid>
             </Grid> 
           </Card>  
          <Card
            style={{
              height: "31vh",
              marginTop: "0px",
              marginBottom: "2%",
              width: "130%",
              overflow: "auto",
              marginLeft:"-24vh"
            }}
          > 
            {data.map((element, index) => (
               <div key={index}>{eachfloorData(element, index)}</div>
             ))} 
           </Card>
        </Grid>
      </Grid>
    </div>
  );
}
