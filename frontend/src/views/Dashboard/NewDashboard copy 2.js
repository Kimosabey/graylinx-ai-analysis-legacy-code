import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import api from "../../api";
import Building from "../../assets/img/building.svg";
import Hidden from "@material-ui/core/Hidden";
import WarningIcon from "assets/img/Warning";
import SuccessIcon from "assets/img/Success";
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import { useSelector, useDispatch } from "react-redux";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Tooltip from "@material-ui/core/Tooltip";
import { Grid, Card } from "@material-ui/core";
import clsx from "clsx";
import FieldDeviceGraphs from "./FieldDeviceGraphs";
import SemiGauge from "./DahboardGraphs";
import {
  redColor,
  yellowColor,
  greenColor,
  whiteColor,
  greyColor,
  blackColor,
  blueColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    fontSize: "12px",
  },
})(Tooltip);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: "-1vh",
  },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "10vh",
    marginTop: "1vh",
    opacity: "1",
  },
  display: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  buildingImg: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      width: "16vw",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      width: "16vw",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      width: "25vw",
      marginTop: "18vh",
      height: "64vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      width: "22vw",
      // marginTop:'-0.5vh'
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      width: "24vw",
    },
  },
  headingFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      fontSize: "1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      fontSize: "1.9vh",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      fontSize: "1.5vh",
      whiteSpace: "nowrap",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      fontSize: "1.9vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "2vh",
    },
  },
  dataFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      fontSize: "1.2vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      fontSize: "1.8vh",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      fontSize: "1.4vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      fontSize: "1.8vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "1.8vh",
    },
  },
  successIconSize: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      "& svg:not(:root)": {
        maxWidth: "3.5vh",
      },
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      "& svg:not(:root)": {
        maxWidth: "7vh",
      },
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      "& svg:not(:root)": {
        maxWidth: "4.5vh",
      },
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      "& svg:not(:root)": {
        maxWidth: "5vh",
      },
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      "& svg:not(:root)": {
        maxWidth: "5vh",
      },
    },
  },
  warningIconSize: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      "& svg:not(:root)": {
        maxWidth: "2.3vh",
        marginLeft: "-0.5vh",
      },
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      "& svg:not(:root)": {
        maxWidth: "4vh",
      },
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      "& svg:not(:root)": {
        maxWidth: "3.2vh",
        marginLeft: "0.2vh",
        marginTop: "-1.5vh",
      },
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      "& svg:not(:root)": {
        maxWidth: "4.5vh",
      },
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      "& svg:not(:root)": {
        maxWidth: "4vh",
      },
    },
  },
}));

export default function GlUps(props) {
  const classes = useStyles();
  const [isBreakPoints, setIsBreakPoints] = useState("");
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
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");

  useEffect(() => {
    const width = window.innerWidth;
    if (width >= 0 && width < 600) {
      setIsBreakPoints("xs");
    } else if (width >= 600 && width < 960) {
      setIsBreakPoints("sm");
    } else if (width >= 960 && width < 1280) {
      setIsBreakPoints("md");
    } else if (width >= 1280 && width < 1920) {
      setIsBreakPoints("lg");
    } else {
      setIsBreakPoints("xl");
    }

    localStorage.setItem("floorName", "Floor-01");
    localStorage.setItem("floorID", "eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20");

    if (localStorage.getItem("roleID") == "6") {
      let timer = setInterval(() => {
        if (localStorage.getItem("buildingID") !== null) {
          api.notifications
            .alarm(buildingID)
            .then((res) => {
              dispatch({
                type: "alarm",
                payload: res,
              });
            })
            .catch((error) => {
              setOpenerr(true);
              console.log("newdashboard alarms error", error);
            });
        } else {
          clearInterval(timer);
        }
      }, 5000);
    }
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
    api.campus
      .glZones(buildingID)
      .then((result) => {
        if (result.length !== 0) {
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
          api.dashboard
            .getMetricData(buildingID)
            .then((res) => {
              if (res.length !== 0) {
                let tempfloorissue = alerts.solution.filter((e) => {
                  if (
                    e.message === "Return Air Temperature Low" ||
                    e.message === "Return Air Temperature High"
                  ) {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  } else {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  }
                });
                let humfloorissue = alerts.solution.filter((e) => {
                  if (e.message === "humidity") {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  } else {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  }
                });

                let luxfloorissue = alerts.solution.filter((e) => {
                  if (e.message === "luminosity") {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  } else {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  }
                });

                let airfloorissue = alerts.solution.filter((e) => {
                  if (e.message === "co2") {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
                    });
                  } else {
                    return isssueFloor.find((iss) => {
                      return (
                        iss.uuid === e.floorId && iss.zone_parent === buildingID
                      );
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
                  tempData: floorDataLocal.temp.filter((e) => e !== "no Data")
                    .length,
                });
                setHumFloorIssue({
                  ...humFloorIssue,
                  humissue: humfloorissue,
                  humData: floorDataLocal.hum.filter((e) => e !== "no Data")
                    .length,
                });
                setLuxFloorIssue({
                  ...luxFloorIssue,
                  luxissue: luxfloorissue,
                  luxData: floorDataLocal.lux.filter((e) => e !== "no Data")
                    .length,
                });
                setAirFloorIssue({
                  ...airFloorIssue,
                  airissue: airfloorissue,
                  airData: floorDataLocal.air.filter((e) => e !== "no Data")
                    .length,
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
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    } else {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    }
                  });
                  element["humIssue"] = alerts.solution.filter((e) => {
                    if (e.message === "humidity") {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    } else {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    }
                  });
                  element["luxIssue"] = alerts.solution.filter((e) => {
                    if (e.message === "humidity") {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    } else {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    }
                  });
                  element["airIssue"] = alerts.solution.filter((e) => {
                    if (e.message === "humidity") {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    } else {
                      return isssueZone.find((iss) => {
                        return (
                          iss.uuid === e.zoneId &&
                          iss.zone_parent === element.id
                        );
                      });
                    }
                  });
                });

                res.sort(function (a, b) {
                  return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
                });
                setData(res);
              } else {
                setOpenerr(true);
                setErrmsg("No Data Found!!!!!");
              }
            })
            .catch((error) => {
              setOpenerr(true);
              setErrmsg(error.response.data.message);
            });
          dispatch({
            type: "location",
            payload: result,
          });
        } else {
          setOpenerr(true);
          setErrmsg("No Data Found!!!!!");
        }
        result.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        let flr = result.filter(
          (_each) => _each.zone_type === "GL_LOCATION_TYPE_FLOOR"
        );
        let dev = [];
        api.floor
          .devicemap(flr[0].uuid, "AHU")
          .then((res) => {
            dev = res.sort(function (a, b) {
              return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
            });
            localStorage.setItem("deviceID", dev[0].ssid);
            localStorage.setItem("deviceName", dev[0].name);
          })
          .catch((error) => {
            if (error.response) {
              setErrmsg(error.response.data.message);
            } else {
              setErrmsg("");
            }
          });
      })
      .catch((error) => {
        if (error.response) {
          setErrmsg(error.response.data.message);
        } else {
          setErrmsg("");
        }
      });
  }, [window.innerWidth]);

  const handleclose = () => {
    setOpenerr(false);
    setErrmsg("");
  };

  const onClickIssue = (id, name, param) => {
    props.changeContext("floor");
    props.history.push({
      pathname: `/admin/selector`,
      state: {
        data: id,
      },
    });
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
      <Grid container spacing={1}>
        <Grid container item xs={12}>
          <Grid
            item
            xs={isBreakPoints == "xs" ? 12 : 7}
            sm={isBreakPoints == "sm" ? 12 : 7}
            md={7}
            lg={7}
            xl={7}
            xxl={7}
          >
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                <Card
                  className={`${classes.paper} ${classes.display} ${classes.dataFont}`}
                  style={{
                    height: "12vh",
                    color: "white",
                    cursor: "pointer",
                    backgroundColor:
                      element.noOfCritical > 0
                        ? redColor[0]
                        : element.noOfLow > 0
                        ? yellowColor[0]
                        : greenColor[0],
                    whiteSpace: "nowrap",
                  }}
                  onClick={() =>
                    onClickIssue(element.id, element.name, "temperature")
                  }
                >
                  {element.name}
                </Card>
              </Grid>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{ color: "#0123b4", fontWeight: "bold" }}
                      className={`${classes.display} ${classes.headingFont}`}
                    >
                      Alerts
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    item
                    xs={12}
                    style={{ marginTop: "1.5vh", marginLeft: "0.5vh" }}
                  >
                    <Grid
                      item
                      xs={8}
                      sm={8}
                      md={8}
                      lg={8}
                      xl={8}
                      xxl={8}
                      className={`${classes.dataFont}`}
                      style={{ textAlign: "left" }}
                    >
                      Critical
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      md={4}
                      lg={4}
                      xl={4}
                      xxl={4}
                      className={`${classes.dataFont}`}
                    >
                      <Danger>{element.noOfCritical}</Danger>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginLeft: "0.5vh" }}>
                    <Grid
                      item
                      xs={8}
                      sm={8}
                      md={8}
                      lg={8}
                      xl={8}
                      xxl={8}
                      className={`${classes.dataFont}`}
                      style={{ textAlign: "left" }}
                    >
                      Low
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={4}
                      md={4}
                      lg={4}
                      xl={4}
                      xxl={4}
                      className={`${classes.dataFont}`}
                    >
                      <Warning>{element.noOfLow}</Warning>
                    </Grid>
                  </Grid>
                  {/* Three small graph cards inside the Alerts card */}
                  <Grid
                    container
                    item
                    xs={12}
                    style={{ marginTop: "1vh", padding: "0.5vh" }}
                    spacing={1}
                  >
                    <Grid item xs={4}>
                      <Card
                        className={classes.paper}
                        style={{ height: "10vh" }}
                      >
                        <div
                          className={classes.dataFont}
                          style={{ paddingTop: "1vh" }}
                        >
                          Graph A
                        </div>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        className={classes.paper}
                        style={{ height: "10vh" }}
                      >
                        <div
                          className={classes.dataFont}
                          style={{ paddingTop: "1vh" }}
                        >
                          Graph B
                        </div>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card
                        className={classes.paper}
                        style={{ height: "10vh" }}
                      >
                        <div
                          className={classes.dataFont}
                          style={{ paddingTop: "1vh" }}
                        >
                          Graph C
                        </div>
                      </Card>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={`${classes.display} ${classes.headingFont}`}
                      style={{
                        color: "#0123b4",
                        fontWeight: "bold",
                        marginLeft: "0.5vh",
                      }}
                    >
                      Temperature
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginTop: "1.5vh" }}>
                    {element.tempIssue.length > 0 ? (
                      <>
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                          xxl={7}
                          className={`${classes.warningIconSize}`}
                          style={{ textAlign: "left" }}
                        >
                          <WarningIcon />
                        </Grid>
                        <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5}>
                          <Grid container item xs={12} direction="column">
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ alignItems: "center" }}
                            >
                              <Warning>{element.tempIssue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ marginLeft: "-0.5vh" }}
                            >
                              <Warning>Zone</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {temp.TEMPERATURE !== "no Data" ? (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={`${classes.display} ${classes.successIconSize}`}
                          >
                            <SuccessIcon />
                          </Grid>
                        ) : (
                          <StyledTooltip
                            title="Oops!"
                            className={classes.tooltip}
                            arrow
                          >
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              className={`${classes.display} ${classes.dataFont}`}
                              style={{
                                whiteSpace:
                                  isBreakPoints == "xs" ||
                                  isBreakPoints == "sm" ||
                                  isBreakPoints == "md"
                                    ? ""
                                    : "nowrap",
                              }}
                            >
                              Not Available
                            </Grid>
                          </StyledTooltip>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={`${classes.display} ${classes.headingFont}`}
                      style={{
                        color: "#0123b4",
                        fontWeight: "bold",
                        marginLeft: "0.5vh",
                      }}
                    >
                      Humidity
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginTop: "1.5vh" }}>
                    {element.humIssue.length > 0 ? (
                      <>
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                          xxl={7}
                          className={`${classes.warningIconSize}`}
                          style={{ textAlign: "left" }}
                        >
                          <WarningIcon />
                        </Grid>
                        <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5}>
                          <Grid container item xs={12} direction="column">
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ alignItems: "center" }}
                            >
                              <Warning>{element.humIssue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ marginLeft: "-0.5vh" }}
                            >
                              <Warning>Zone</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {temp.HUMIDITY !== "no Data" ? (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={`${classes.display} ${classes.successIconSize}`}
                          >
                            <SuccessIcon />
                          </Grid>
                        ) : (
                          <StyledTooltip
                            title="Oops!"
                            className={classes.tooltip}
                            arrow
                          >
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              className={`${classes.display} ${classes.dataFont}`}
                              style={{
                                whiteSpace:
                                  isBreakPoints == "xs" ||
                                  isBreakPoints == "sm" ||
                                  isBreakPoints == "md"
                                    ? ""
                                    : "nowrap",
                              }}
                            >
                              Not Available
                            </Grid>
                          </StyledTooltip>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={isBreakPoints == "xs" ? 12 : 5}
            sm={isBreakPoints == "sm" ? 12 : 5}
            md={5}
            lg={5}
            xl={5}
            xxl={5}
          >
            <Grid container item xs={12} spacing={1}>
              {(isBreakPoints == "xs" || isBreakPoints == "sm") && (
                <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Grid>
              )}
              <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={`${classes.display} ${classes.headingFont}`}
                      style={{
                        color: "#0123b4",
                        fontWeight: "bold",
                        marginLeft: "0.5vh",
                      }}
                    >
                      Light
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginTop: "1.5vh" }}>
                    {element.luxIssue.length > 0 ? (
                      <>
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                          xxl={7}
                          className={`${classes.warningIconSize}`}
                          style={{ textAlign: "left" }}
                        >
                          <WarningIcon />
                        </Grid>
                        <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5}>
                          <Grid container item xs={12} direction="column">
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ alignItems: "center" }}
                            >
                              <Warning>{element.luxIssue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ marginLeft: "-0.5vh" }}
                            >
                              <Warning>Zone</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {temp.LUMINOUSITY !== "no Data" ? (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={`${classes.display} ${classes.successIconSize}`}
                          >
                            <SuccessIcon />
                          </Grid>
                        ) : (
                          <StyledTooltip
                            title="Oops!"
                            className={classes.tooltip}
                            arrow
                          >
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              className={`${classes.display} ${classes.dataFont}`}
                              style={{
                                whiteSpace:
                                  isBreakPoints == "xs" ||
                                  isBreakPoints == "sm" ||
                                  isBreakPoints == "md"
                                    ? ""
                                    : "nowrap",
                              }}
                            >
                              Not Available
                            </Grid>
                          </StyledTooltip>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={`${classes.display} ${classes.headingFont}`}
                      style={{
                        color: "#0123b4",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        marginLeft: "0.5vh",
                      }}
                    >
                      Air Quality
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginTop: "1.5vh" }}>
                    {element.airIssue.length > 0 ? (
                      <>
                        <Grid
                          item
                          xs={7}
                          sm={7}
                          md={7}
                          lg={7}
                          xl={7}
                          xxl={7}
                          className={`${classes.warningIconSize}`}
                          style={{ textAlign: "left" }}
                        >
                          <WarningIcon />
                        </Grid>
                        <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5}>
                          <Grid container item xs={12} direction="column">
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ alignItems: "center" }}
                            >
                              <Warning>{element.airIssue.length}</Warning>
                            </Grid>
                            <Grid
                              item
                              xs={6}
                              sm={6}
                              md={6}
                              lg={6}
                              xl={6}
                              xxl={6}
                              className={`${classes.dataFont}`}
                              style={{ marginLeft: "-0.5vh" }}
                            >
                              <Warning>Zone</Warning>
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    ) : (
                      <>
                        {temp.CO2 !== "no Data" ? (
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={`${classes.display} ${classes.successIconSize}`}
                          >
                            <SuccessIcon />
                          </Grid>
                        ) : (
                          <StyledTooltip
                            title="Oops!"
                            className={classes.tooltip}
                            arrow
                          >
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              className={`${classes.display} ${classes.dataFont}`}
                              style={{
                                whiteSpace:
                                  isBreakPoints == "xs" ||
                                  isBreakPoints == "sm" ||
                                  isBreakPoints == "md"
                                    ? ""
                                    : "nowrap",
                              }}
                            >
                              Not Available
                            </Grid>
                          </StyledTooltip>
                        )}
                      </>
                    )}
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.paper} style={{ height: "12vh" }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      className={`${classes.display} ${classes.headingFont}`}
                      style={{
                        color: "#0123b4",
                        fontWeight: "bold",
                        marginLeft: "1vh",
                      }}
                    >
                      Others
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} style={{ marginTop: "1.5vh" }}>
                    <StyledTooltip
                      title="Oops!"
                      className={classes.tooltip}
                      arrow
                    >
                      <Grid
                        item
                        xs={12}
                        sm={12}
                        md={12}
                        lg={12}
                        xl={12}
                        xxl={12}
                        className={`${classes.display} ${classes.dataFont}`}
                        style={{
                          whiteSpace:
                            isBreakPoints == "xs" ||
                            isBreakPoints == "sm" ||
                            isBreakPoints == "md"
                              ? ""
                              : "nowrap",
                        }}
                      >
                        Not Available
                      </Grid>
                    </StyledTooltip>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={openerr}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          style={{ cursor: "pointer" }}
          severity="error"
          variant="filled"
          onClose={handleclose}
        >
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
            <Grid container item xs={12} spacing={1} direction="column">
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Hidden xsDown>
                  <Hidden smDown>
                    <img
                      src={Building}
                      alt="Building"
                      className={`${classes.buildingImg}`}
                    />
                  </Hidden>
                </Hidden>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
            <Grid container item xs={12} spacing={1} direction="column">
              {/* first card */}
              <Grid item xs={12}>
                <Card
                  className={classes.paper}
                  // style={{
                  //   height:
                  //     isBreakPoints == "xs" || isBreakPoints == "sm"
                  //       ? "55vh"
                  //       : isBreakPoints == "md"
                  //       ? "28vh"
                  //       : "26vh",
                  // }}
                  style={{ height: "auto" }}
                >
                  <Grid container item xs={12}>
                    {/* LEFT COLUMN for Labels */}
                    <Grid
                      item
                      xs={2}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                        paddingLeft: "8px",
                        color: "#0123b4",
                        fontWeight: "bold",
                      }}
                    >
                      <br></br>
                      <div className={classes.headingFont}>
                        Network <br></br>Status
                      </div>
                      <br></br>
                      {/* <div className={classes.headingFont}>
                        Field <br></br>Devices
                      </div> */}
                    </Grid>

                    {/* RIGHT COLUMN for Data */}
                    <Grid item xs={10}>
                      <Grid container spacing={1}>
                        {/* Column Headings */}
                        <Grid
                          container
                          item
                          xs={12}
                          spacing={1}
                          className={classes.headingFont}
                          style={{
                            color: "#0123b4",
                            fontWeight: "bold",
                            textAlign: "center",
                          }}
                        >
                          <Grid item xs={3}>
                            Chiller
                          </Grid>
                          <Grid item xs={3}>
                            Pumps
                          </Grid>
                          <Grid item xs={3}>
                            Cooling Tower
                          </Grid>
                          <Grid item xs={3}>
                            Energy Meters
                          </Grid>
                        </Grid>

                        {/* Network Status Row */}
                        <Grid container item xs={12} spacing={1}>
                          {/* Chiller */}
                          <Grid item xs={3}>
                            {/* <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                <Card
                  className={`${classes.paper} ${classes.display} ${classes.dataFont}`}
                  style={{ height: "8vh" }}
                >
                  Not Available
                </Card>
              </StyledTooltip> */}
                            <Card
                              className={`${classes.paper} ${classes.display} ${
                                gateWayStatus > 0
                                  ? classes.warningIconSize
                                  : classes.successIconSize
                              }`}
                              style={{ height: "8vh" }}
                            >
                              {gateWayStatus > 0 ? (
                                <WarningIcon />
                              ) : (
                                <SuccessIcon />
                              )}
                            </Card>
                          </Grid>

                          {/* Pumps */}
                          <Grid item xs={3}>
                            <Card
                              className={`${classes.paper} ${classes.display} ${
                                gateWayStatus > 0
                                  ? classes.warningIconSize
                                  : classes.successIconSize
                              }`}
                              style={{ height: "8vh" }}
                            >
                              {gateWayStatus > 0 ? (
                                <WarningIcon />
                              ) : (
                                <SuccessIcon />
                              )}
                            </Card>
                          </Grid>

                          {/* Cooling Tower */}
                          <Grid item xs={3}>
                            {/* <StyledTooltip title="Oops!" className={classes.tooltip} arrow>
                <Card
                  className={`${classes.paper} ${classes.display} ${classes.dataFont}`}
                  style={{ height: "8vh" }}
                >
                  Not Available
                </Card>
              </StyledTooltip> */}
                            <Card
                              className={`${classes.paper} ${classes.display} ${
                                gateWayStatus > 0
                                  ? classes.warningIconSize
                                  : classes.successIconSize
                              }`}
                              style={{ height: "8vh" }}
                            >
                              {gateWayStatus > 0 ? (
                                <WarningIcon />
                              ) : (
                                <SuccessIcon />
                              )}
                            </Card>
                          </Grid>

                          {/* Energy Meters */}
                          <Grid item xs={3}>
                            {/* <Card
                className={`${classes.paper} ${classes.display} ${classes.successIconSize}`}
                style={{ height: "8vh" }}
              >
                <SuccessIcon />
              </Card> */}
                            <Card
                              className={`${classes.paper} ${classes.display} ${
                                gateWayStatus > 0
                                  ? classes.warningIconSize
                                  : classes.successIconSize
                              }`}
                              style={{ height: "8vh" }}
                            >
                              {gateWayStatus > 0 ? (
                                <WarningIcon />
                              ) : (
                                <SuccessIcon />
                              )}
                            </Card>
                          </Grid>
                        </Grid>

                        {/* Field Device Status Row */}
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              {/* Field Device Graphs Section */}
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    padding: "1.5vh",
                    backgroundColor: "#fcfafa",
                    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
                    minHeight:
                      isBreakPoints == "xs" || isBreakPoints == "sm"
                        ? "60vh"
                        : "40vh",
                  }}
                >
                  <FieldDeviceGraphs />
                </Card>
              </Grid>
              {/* SemicircleGraphs */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  {/* Gauge Card 1 */}
                  <Grid item xs={12} sm={4} md={4}>
                    <Card
                      className={classes.paper}
                      style={{ padding: "10px", height: "auto" }}
                    >
                      <div
                        className={classes.headingFont}
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          marginBottom: "1vh",
                        }}
                      >
                        kW
                      </div>
                      <SemiGauge value={430} />
                    </Card>
                  </Grid>

                  {/* Gauge Card 2 */}
                  <Grid item xs={12} sm={4} md={4}>
                    <Card
                      className={classes.paper}
                      style={{ padding: "10px", height: "auto" }}
                    >
                      <div
                        className={classes.headingFont}
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          marginBottom: "1vh",
                        }}
                      >
                        TR
                      </div>
                      <SemiGauge value={680} />
                    </Card>
                  </Grid>

                  {/* Gauge Card 3 */}
                  <Grid item xs={12} sm={4} md={4}>
                    <Card
                      className={classes.paper}
                      style={{ padding: "10px", height: "auto" }}
                    >
                      <div
                        className={classes.headingFont}
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          marginBottom: "1vh",
                        }}
                      >
                        kW/TR
                      </div>
                      <SemiGauge value={0.63} />
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    height:
                      isBreakPoints == "xs" || isBreakPoints == "sm"
                        ? "45vh"
                        : "35vh",
                  }}
                ></Card>
              </Grid> */}
              {/* second card */}
              {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    height:
                      isBreakPoints == "xs" || isBreakPoints == "sm"
                        ? "29vh"
                        : "16vh",
                  }}
                >
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={isBreakPoints == "xs" ? 12 : 7}
                      sm={isBreakPoints == "sm" ? 12 : 7}
                      md={7}
                      lg={7}
                      xl={7}
                      xxl={7}
                    >
                      <Grid container item xs={12} spacing={1}>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                          <Card
                            className={`${classes.paper} ${classes.display} ${classes.dataFont}`}
                            style={{
                              height: "12vh",
                              color: "white",
                              backgroundColor:
                                alerts.system.length != undefined ||
                                alerts.solution.length != undefined
                                  ? alerts.system.length > 0
                                    ? redColor[0]
                                    : alerts.solution.length > 0
                                    ? yellowColor[0]
                                    : blueColor[0]
                                  : blueColor[0],
                            }}
                          >
                            All Floors
                          </Card>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                style={{ color: "#0123b4", fontWeight: "bold" }}
                                className={`${classes.display} ${classes.headingFont}`}
                              >
                                Alerts
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{
                                marginTop: "1.5vh",
                                marginLeft: "0.5vh",
                              }}
                            >
                              <Grid
                                item
                                xs={8}
                                sm={8}
                                md={8}
                                lg={8}
                                xl={8}
                                xxl={8}
                                className={`${classes.dataFont}`}
                                style={{ textAlign: "left" }}
                              >
                                Critical
                              </Grid>
                              <Grid
                                item
                                xs={4}
                                sm={4}
                                md={4}
                                lg={4}
                                xl={4}
                                xxl={4}
                                className={`${classes.dataFont}`}
                              >
                                <Danger>{alerts.system.length}</Danger>
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginLeft: "0.5vh" }}
                            >
                              <Grid
                                item
                                xs={8}
                                sm={8}
                                md={8}
                                lg={8}
                                xl={8}
                                xxl={8}
                                className={`${classes.dataFont}`}
                                style={{ textAlign: "left" }}
                              >
                                Low
                              </Grid>
                              <Grid
                                item
                                xs={4}
                                sm={4}
                                md={4}
                                lg={4}
                                xl={4}
                                xxl={4}
                                className={`${classes.dataFont}`}
                              >
                                <Warning>{alerts.solution.length}</Warning>
                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                className={`${classes.display} ${classes.headingFont}`}
                                style={{
                                  color: "#0123b4",
                                  fontWeight: "bold",
                                  marginLeft: "0.5vh",
                                }}
                              >
                                Temperature
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginTop: "1.5vh" }}
                            >
                              {tempFloorIssue.tempissue.length > 0 ? (
                                <>
                                  <Grid
                                    item
                                    xs={7}
                                    sm={7}
                                    md={7}
                                    lg={7}
                                    xl={7}
                                    xxl={7}
                                    className={`${classes.warningIconSize}`}
                                    style={{ textAlign: "left" }}
                                  >
                                    <WarningIcon />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={5}
                                    md={5}
                                    lg={5}
                                    xl={5}
                                    xxl={5}
                                  >
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      direction="column"
                                    >
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ alignItems: "center" }}
                                      >
                                        <Warning>
                                          {tempFloorIssue.tempissue.length}
                                        </Warning>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ marginLeft: "-0.5vh" }}
                                      >
                                        <Warning>Floor</Warning>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                <>
                                  {tempFloorIssue.tempData > 0 ? (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className={`${classes.display} ${classes.successIconSize}`}
                                    >
                                      <SuccessIcon />
                                    </Grid>
                                  ) : (
                                    <StyledTooltip
                                      title="Oops!"
                                      className={classes.tooltip}
                                      arrow
                                    >
                                      <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className={`${classes.display} ${classes.dataFont}`}
                                        style={{
                                          whiteSpace:
                                            isBreakPoints == "xs" ||
                                            isBreakPoints == "sm" ||
                                            isBreakPoints == "md"
                                              ? ""
                                              : "nowrap",
                                        }}
                                      >
                                        Not Available
                                      </Grid>
                                    </StyledTooltip>
                                  )}
                                </>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                className={`${classes.display} ${classes.headingFont}`}
                                style={{
                                  color: "#0123b4",
                                  fontWeight: "bold",
                                  marginLeft: "0.5vh",
                                }}
                              >
                                Humidity
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginTop: "1.5vh" }}
                            >
                              {humFloorIssue.humissue.length > 0 ? (
                                <>
                                  <Grid
                                    item
                                    xs={7}
                                    sm={7}
                                    md={7}
                                    lg={7}
                                    xl={7}
                                    xxl={7}
                                    className={`${classes.warningIconSize}`}
                                    style={{ textAlign: "left" }}
                                  >
                                    <WarningIcon />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={5}
                                    md={5}
                                    lg={5}
                                    xl={5}
                                    xxl={5}
                                  >
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      direction="column"
                                    >
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ alignItems: "center" }}
                                      >
                                        <Warning>
                                          {humFloorIssue.humissue.length}
                                        </Warning>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ marginLeft: "-0.5vh" }}
                                      >
                                        <Warning>Floor</Warning>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                <>
                                  {humFloorIssue.humData > 0 ? (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className={`${classes.display} ${classes.successIconSize}`}
                                    >
                                      <SuccessIcon />
                                    </Grid>
                                  ) : (
                                    <StyledTooltip
                                      title="Oops!"
                                      className={classes.tooltip}
                                      arrow
                                    >
                                      <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className={`${classes.display} ${classes.dataFont}`}
                                        style={{
                                          whiteSpace:
                                            isBreakPoints == "xs" ||
                                            isBreakPoints == "sm" ||
                                            isBreakPoints == "md"
                                              ? ""
                                              : "nowrap",
                                        }}
                                      >
                                        Not Available
                                      </Grid>
                                    </StyledTooltip>
                                  )}
                                </>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={isBreakPoints == "xs" ? 12 : 5}
                      sm={isBreakPoints == "sm" ? 12 : 5}
                      md={5}
                      lg={5}
                      xl={5}
                      xxl={5}
                    >
                      <Grid container item xs={12} spacing={1}>
                        {(isBreakPoints == "xs" || isBreakPoints == "sm") && (
                          <Grid
                            item
                            xs={3}
                            sm={3}
                            md={3}
                            lg={3}
                            xl={3}
                            xxl={3}
                          ></Grid>
                        )}
                        <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                className={`${classes.display} ${classes.headingFont}`}
                                style={{
                                  color: "#0123b4",
                                  fontWeight: "bold",
                                  marginLeft: "0.5vh",
                                }}
                              >
                                Light
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginTop: "1.5vh" }}
                            >
                              {luxFloorIssue.luxissue.length > 0 ? (
                                <>
                                  <Grid
                                    item
                                    xs={7}
                                    sm={7}
                                    md={7}
                                    lg={7}
                                    xl={7}
                                    xxl={7}
                                    className={`${classes.warningIconSize}`}
                                    style={{ textAlign: "left" }}
                                  >
                                    <WarningIcon />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={5}
                                    md={5}
                                    lg={5}
                                    xl={5}
                                    xxl={5}
                                  >
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      direction="column"
                                    >
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ alignItems: "center" }}
                                      >
                                        <Warning>
                                          {luxFloorIssue.luxissue.length}
                                        </Warning>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ marginLeft: "-0.5vh" }}
                                      >
                                        <Warning>Floor</Warning>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                <>
                                  {luxFloorIssue.luxData > 0 ? (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className={`${classes.display} ${classes.successIconSize}`}
                                    >
                                      <SuccessIcon />
                                    </Grid>
                                  ) : (
                                    <StyledTooltip
                                      title="Oops!"
                                      className={classes.tooltip}
                                      arrow
                                    >
                                      <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className={`${classes.display} ${classes.dataFont}`}
                                        style={{
                                          whiteSpace:
                                            isBreakPoints == "xs" ||
                                            isBreakPoints == "sm" ||
                                            isBreakPoints == "md"
                                              ? ""
                                              : "nowrap",
                                        }}
                                      >
                                        Not Available
                                      </Grid>
                                    </StyledTooltip>
                                  )}
                                </>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                className={`${classes.display} ${classes.headingFont}`}
                                style={{
                                  color: "#0123b4",
                                  fontWeight: "bold",
                                  whiteSpace: "nowrap",
                                  marginLeft: "0.5vh",
                                }}
                              >
                                Air Quality
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginTop: "1.5vh" }}
                            >
                              {airFloorIssue.airissue.length > 0 ? (
                                <>
                                  <Grid
                                    item
                                    xs={7}
                                    sm={7}
                                    md={7}
                                    lg={7}
                                    xl={7}
                                    xxl={7}
                                    className={`${classes.warningIconSize}`}
                                    style={{ textAlign: "left" }}
                                  >
                                    <WarningIcon />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={5}
                                    sm={5}
                                    md={5}
                                    lg={5}
                                    xl={5}
                                    xxl={5}
                                  >
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      direction="column"
                                    >
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ alignItems: "center" }}
                                      >
                                        <Warning>
                                          {airFloorIssue.airissue.length}
                                        </Warning>
                                      </Grid>
                                      <Grid
                                        item
                                        xs={6}
                                        sm={6}
                                        md={6}
                                        lg={6}
                                        xl={6}
                                        xxl={6}
                                        className={`${classes.dataFont}`}
                                        style={{ marginLeft: "-0.5vh" }}
                                      >
                                        <Warning>Floor</Warning>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </>
                              ) : (
                                <>
                                  {airFloorIssue.airData > 0 ? (
                                    <Grid
                                      item
                                      xs={12}
                                      sm={12}
                                      md={12}
                                      lg={12}
                                      xl={12}
                                      xxl={12}
                                      className={`${classes.display} ${classes.successIconSize}`}
                                    >
                                      <SuccessIcon />
                                    </Grid>
                                  ) : (
                                    <StyledTooltip
                                      title="Oops!"
                                      className={classes.tooltip}
                                      arrow
                                    >
                                      <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={12}
                                        xl={12}
                                        xxl={12}
                                        className={`${classes.display} ${classes.dataFont}`}
                                        style={{
                                          whiteSpace:
                                            isBreakPoints == "xs" ||
                                            isBreakPoints == "sm" ||
                                            isBreakPoints == "md"
                                              ? ""
                                              : "nowrap",
                                        }}
                                      >
                                        Not Available
                                      </Grid>
                                    </StyledTooltip>
                                  )}
                                </>
                              )}
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item xs={3} sm={3} md={4} lg={4} xl={4} xxl={4}>
                          <Card
                            className={classes.paper}
                            style={{ height: "12vh" }}
                          >
                            <Grid container item xs={12} spacing={1}>
                              <Grid
                                item
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                                xl={12}
                                xxl={12}
                                className={`${classes.display} ${classes.headingFont}`}
                                style={{
                                  color: "#0123b4",
                                  fontWeight: "bold",
                                  marginLeft: "1vh",
                                }}
                              >
                                Others
                              </Grid>
                            </Grid>
                            <Grid
                              container
                              item
                              xs={12}
                              style={{ marginTop: "1.5vh" }}
                            >
                              <StyledTooltip
                                title="Oops!"
                                className={classes.tooltip}
                                arrow
                              >
                                <Grid
                                  item
                                  xs={12}
                                  sm={12}
                                  md={12}
                                  lg={12}
                                  xl={12}
                                  xxl={12}
                                  className={`${classes.display} ${classes.dataFont}`}
                                  style={{
                                    whiteSpace:
                                      isBreakPoints == "xs" ||
                                      isBreakPoints == "sm" ||
                                      isBreakPoints == "md"
                                        ? ""
                                        : "nowrap",
                                  }}
                                >
                                  Not Available
                                </Grid>
                              </StyledTooltip>
                            </Grid>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Card>
              </Grid> */}
              {/* third card */}
              {/* <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{ height: "31vh", overflow: "auto" }}
                >
                  {data.map((element, index) => (
                    <div key={index}>{eachfloorData(element, index)}</div>
                  ))}
                </Card>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
