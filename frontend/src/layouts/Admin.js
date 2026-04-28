import React, { useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { Switch, Route, Redirect } from "react-router-dom";
import { dashboardRoutes, buildingRoutes, ParkingRoutes } from "routes.js";
import CssBaseline from "@material-ui/core/CssBaseline";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import Link from "@material-ui/core/Link";
import Footer from "components/Footer/Footer";
import Button from "components/CustomButtons/Button.js";
import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks.js";
import Sidebar from "components/Sidebar/Sidebar.js";
//import logo from "assets/img/graylinxlogo6.png";
 import logo from "assets/img/JCI_logo.jpg";
//import logo from "assets/img/Logo - PNG.png"
// import logo from "assets/images/JC";
import bgImage from "assets/img/sidebar-2.jpg";
import Hidden from "@material-ui/core/Hidden";
import NewDashboard from "views/Dashboard/NewDashboard";
import Home from "views/Custom/Home.js";
import City from "views/Custom/City.js";
import RoomBooking from "views/Booking Flow/RoomBooking.js";
import SeatBooking from "views/Booking Flow/SeatBooking.js";
import Floors from "views/Floors/Floors";
import upload from "views/Custom/upload.js";
import Configuration from "views/Configuration/Configuration.js";
import Schedule from "views/Scheduler/Schedule.js";
import NetworkDiagram from "views/NetworkDiagram/NetworkDiagram.js";
import Controls from "views/Controls/AhuDevices";
import Table from "views/Controls/table";
import AlertsMain from "views/Custom/AlertsMain";
import FloorOccupancyNew from "views/Occupancy/FloorOccupancyNew";
import hvac from "views/Heatmap/hvac";
import ConfigureSetpoint from "views/Heatmap/ConfigureSetpoint";
import Zones from "views/Zones/zones";
import Zonelist from "views/Zones/Zonelist";
import Area from "views/Area/Area";
import Arealist from "views/Area/Arealist";
import Areadetail from "views/Area/Areadetail";
import Zonesmain from "views/Zones/Zonesmain";
import GlEventsViewer from "views/Custom/GlEventsViewer";
import GlAhu from "views/Heatmap/GlAhu";
import Devicemap from "views/Heatmap/Devicemap";
import Grid from "@material-ui/core/Grid";
import GlReports from "views/Custom/GLReports";
import GlLms from "views/Heatmap/GlLms";
import GlSchedule from "views/GlScheduler/Schedule.js";
import GlUps from "views/Heatmap/GlUps";
import GlUpsLanding from "views/Heatmap/GlUpsLanding";
import GlEMLanding from "views/Heatmap/GlEnergyMeterLanding";
import GlVav from "views/Heatmap/GlVav";
import GlEnergyMeter from "views/Heatmap/GlEnergyMeter";
import { Blink } from "@bdchauvette/react-blink";
import Selector from "views/Heatmap/seletor";
import glcsu from "views/Heatmap/Glcsu";
import { connect } from "react-redux";
import NavAlarm from "views/Custom/NavAlarm";
import Glossary from "./Glossary";
import GlScheduleCreation from "views/Heatmap/GlScheduleCreation";
import Glbmscheduler from "views/Glbmscheduler";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import GlChillerPage from "views/Chiller/GlChillerPage";
import GlChillerLanding from "views/Chiller/GlChillerLanding";
import GlCoolingTower from "views/Chiller/GlCoolingTower";
import GlPrimaryPump from "views/Chiller/GlPrimaryPump";
import GlAnalytics from "views/GlAnalytics/GlAnalytics";
import GlAnalyticsForAllDevices from "views/GlAnalytics/AllDevFaults";
import Runhours from "views/GlAnalytics/Runhours";
import GlAnalyticsopenFaults from "views/GlAnalytics/GlAnalyticsopenFaults";
import EnergyDashboard from "views/GlAnalytics/EnergyDashboard";
import Instrumentation from "views/GlAnalytics/instrumentation";
import simplyIO from "assets/img/simply-io.jpg";
import Parkingsolution from "views/Parkingsolution/parkingstatus";
import GlFAU from "views/ATLDevices/GlFAU";
import GlHeatExhaustFan from "views/ATLDevices/GlHeatExhaustFan";
import GlVentilator from "views/ATLDevices/GlVentilator";
import GlBathroomExhaustFan from "views/ATLDevices/GlBathroomExhaustFan";
import GlSubstationExhaustFans from "views/ATLDevices/GlSubstationExhaustFan";
import GlAllExhaustFans from "views/ATLDevices/GlAllExhaustFans";
import LandingPage from "views/ATLDevices/LandingPage";
import chillerSummaryPage from "views/Chiller/GlChillerSummaryPage";
import pumpsSummaryPage from "views/Chiller/GlPumpsSummaryPage";
import coolingTowerSummaryPage from "views/Chiller/GlCoolingToweSummaryPage";
import GlAtcsSummaryPage from "views/Chiller/GlAtcsSummaryPage";
import GlBtuSummaryPage from "views/Chiller/GlBtuSummaryPage";
import glEMLandingPage from "views/Heatmap/GlEnergyMeterLanding";
import GlEnergyMeterSummary from "views/Chiller/GlEnergyMeterSummary";
// import GlFaults from 'views/GlAnalytics/FloorDetails';
// import praking_solution from 'views/Praking/praking';
import PlantRoomEnergyAnalytics from "../views/GlAnalytics/PlantRoomEnergyAnalytics";
import NewSummary from "../views/Custom/NewSummary";
import CPMConfig from "../views/Chiller/GlCpmConfig";

// import gltfa from 'views/Heatmap/Gltfa';
const drawerWidth = 260;
let ps;
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    fontFamily: "BwSeidoRound-Regular",
  },
  appBar: {
    boxShadow: "none",
    position: "absolute",
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    boxShadow: "none",
    position: "absolute",
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  title: {
    letterSpacing: "unset",
    lineHeight: "30px",
    fontSize: "18px",
    borderRadius: "3px",
    textTransform: "none",
    color: "inherit",
    margin: "0",
    justifyContent: "end",
    flex: 1,
    "&:hover,&:focus": {
      background: "transparent",
    },
    [theme.breakpoints.down("xs")]: { fontSize: "12px" },
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    // "min-height":"64px",
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  },
  content: {
  flexGrow: 1,
  padding: theme.spacing(3),
 
  /* ⭐⭐⭐ REAL FIX STARTS HERE ⭐⭐⭐ */
  minWidth: 0,
  width: "100%",
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  /* ⭐⭐⭐ REAL FIX ENDS HERE ⭐⭐⭐ */
 
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: -drawerWidth,
},
 
 
root: {
  display: "flex",
  fontFamily: "BwSeidoRound-Regular",
  width: "100%",
  minWidth: 0,   // ⭐ REQUIRED FOR FLEX SHRINK
},
}));

function makeBrand(props) {
  var name;
  dashboardRoutes.map((prop) => {
    if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
      name = prop.name;
    }
    return null;
  });
  return name;
}

const mapStateToProps = (state) => {
  return {
    userData: state.isLogged.data.token,
    alerts: state.alarm.alarmData,
  };
};

function Admin(props, { ...rest }) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [image] = React.useState(bgImage);
  const [color] = React.useState("blue");
  const [path, setPath] = React.useState("");
  const locale = "en";
  const [today, setDate] = React.useState(new Date());
  const [blink, setBlink] = React.useState(false);

  const handleBackClick = () => {
    const buildingDashboardPath = `/admin/building/${localStorage.getItem(
      "buildingID"
    )}/dashboard`;
    console.log("props------mo", props.location);
    if (props.location.pathname === buildingDashboardPath) {
      return;
    }
    props.history.goBack();
    // console.log("goBack",)
  };

  const handleClick = (val) => {
    if (val === "home") {
      localStorage.removeItem("floorID");
      localStorage.removeItem("floorName");
      localStorage.removeItem("zoneName");
      localStorage.removeItem("zoneID");
      localStorage.removeItem("controlFloorID");
      localStorage.removeItem("contolFloorName");
      props.history.push(
        "/admin/building/" + localStorage.getItem("buildingID") + "/dashboard"
      );
    } else if (val === "floor") {
      localStorage.removeItem("zoneID");
      localStorage.removeItem("zoneName");
      localStorage.removeItem("deviceID");
      localStorage.removeItem("deviceName");
      props.history.push("/admin/zoneMain");
    } else if (val === "zone") {
      localStorage.removeItem("zoneID");
      localStorage.removeItem("zoneName");
      props.history.push("/admin/zone");
    } else if (val === "controlFloor") {
      localStorage.removeItem("deviceID");
      localStorage.removeItem("deviceName");
      props.history.push("/admin/controls");
    } else {
      localStorage.removeItem("floorID");
      localStorage.removeItem("floorName");
      localStorage.removeItem("zoneID");
      localStorage.removeItem("zoneName");
      localStorage.removeItem("controlFloorID");
      localStorage.removeItem("contolFloorName");
      props.history.push(
        "/admin/building/" + localStorage.getItem("buildingID") + "/dashboard"
      );
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const resizeFunction = () => {
    if (window.innerWidth <= 960) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };
  const changeContext = (val) => {};

  useEffect(() => {
    window.addEventListener("resize", resizeFunction);
    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", resizeFunction);
    };
  }, []);

  // useEffect(() => {
  //   const timer = setInterval(() => { // Creates an interval which will update the current data every minute
  //     // This will trigger a rerender every component that uses the useDate hook.
  //     setDate(new Date());
  //   }, 60 * 1000);
  //   return () => {
  //     clearInterval(timer); // Return a funtion to clear the timer so that it will stop being called on unmount
  //   }
  // })

  const data = localStorage.getItem("buildingName");
  useEffect(() => {
    switch (props.location.pathname) {
      case "/admin/home":
        setPath("/admin/home");
        break;
      case "/admin/city":
        setPath("/admin/city");
        break;
      case `/admin/building/${localStorage.getItem("buildingID")}/dashboard`:
        setPath(
          `/admin/building/${localStorage.getItem("buildingID")}/dashboard`
        );
        break;
      case "/admin/floors":
        setPath("/admin/floors");
        break;
      case `/admin/floor/${localStorage.getItem("floorID")}/dashboard`:
        setPath(`/admin/floor/${localStorage.getItem("floorID")}/dashboard`);
        break;
      case `/admin/floor/${localStorage.getItem("floorID")}/zones`:
        setPath(`/admin/floor/${localStorage.getItem("floorID")}/zones`);
        break;
      case `/admin/zone/${localStorage.getItem("zoneID")}/zones`:
        setPath(`/admin/zone/${localStorage.getItem("zoneID")}/zones`);
        break;
      case `/admin/zone`:
        setPath(`/admin/zone`);
        break;
      case `/admin/floor/${localStorage.getItem("floorID")}/heatmap`:
        setPath(`/admin/floor/${localStorage.getItem("floorID")}/heatmap`);
        break;
      case `/admin/eventsviewer`:
        setPath("/admin/eventsviewer");
        break;
      case `/admin/areas`:
        setPath(`/admin/areas`);
        break;
      case `admin/arealist`:
        setPath(`admin/arealist`);
        break;
      case `admin/areadetail`:
        setPath(`/admin/areadetail`);
        break;
      case `/admin/alerts`:
        setPath("/admin/alerts");
        break;
      case `/admin/hvac`:
        setPath("/admin/hvac");
        break;
      case `/admin/configuresetpoint`:
        setPath("/admin/configuresetpoint");
        break;
      case `/admin/upload`:
        setPath("/admin/upload");
        break;
      case `/admin/configuration`:
        setPath("/admin/configuration");
        break;
      default:
    }
  }, [props.location.pathname]);
  const day = today.toLocaleDateString(locale, { weekday: "short" });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, {
    month: "long",
  })}\n\n`;
  let currentDate = new Date();
  const time = currentDate.getHours() + ":" + currentDate.getMinutes();
  // const time = today.toLocaleTimeString(locale, { hour: 'numeric', hour12: true, minute: 'numeric' });

  return props.userData !== undefined ? (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        color="transparent"
        position="fixed"
        className={clsx(classes.appBar, {
          [classes.appBarShift]: false,
        })}
        // style={{ width: '85%' }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(classes.menuButton, open && classes.hide)}
          >
            <MenuIcon />
          </IconButton>
          <div className={classes.title}>
            <Grid
              container
              xs={12}
              style={{
                justifyContent: "end",
                flexDirection: "row",
                flex: 1,
              }}
              spacing={2}
            >
              <Grid item xs={6}>
                {localStorage.getItem("roleID") !== "5" ? (
                  <div>
                    {localStorage.getItem("buildingID") && (
                      <>
                        {localStorage.getItem("roleID") === "6" ? null : (
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {/* Clickable Back Button */}
                            <IconButton
                              color="inherit"
                              aria-label="go back"
                              onClick={handleBackClick}
                              edge="start"
                              className={classes.menuButton}
                              style={{ marginLeft: open ? "17vw" : "" }}
                            >
                              <ArrowBackIosIcon
                                style={{ color: "#0123B4", fontSize: "2.5vh" }}
                              />
                              <div
                                style={{
                                  color: "#0123B4",
                                  fontSize: "2.5vh",
                                  fontWeight: "bold",
                                }}
                              >
                                Back
                              </div>
                            </IconButton>

                            {/* Building Name Displayed Separately */}
                            <div
                              style={{
                                color: "#0123B4",
                                fontSize: "2.5vh",
                                fontWeight: "bold",
                                marginLeft: "15px", // Adds spacing between Back button and building name
                              }}
                            >
                              {localStorage.getItem("buildingName")}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    color="transparent"
                    href="#"
                    className={classes.title}
                  >
                    {makeBrand()}
                  </Button>
                )}
              </Grid>

              <Grid xs={6}>
                <Grid
                  container
                  xs={12}
                  direction="row"
                  style={{ marginTop: "1vh" }}
                >
                  <NavAlarm />
                </Grid>
              </Grid>
            </Grid>
          </div>
          <Hidden smDown implementation="css">
            <AdminNavbarLinks />
          </Hidden>
        </Toolbar>
      </AppBar>
      {/* <div style={{ width: '15%' }}> */}
      <Sidebar
        routes={
          localStorage.getItem("roleID") == "6" ? ParkingRoutes : buildingRoutes
        }
        logo={localStorage.getItem("username") == "Guest1" ? simplyIO : logo}
        image={image}
        handleDrawerClose={handleDrawerClose}
        open={open}
        color={color}
        {...rest}
      />
      {/* </div> */}
      {/* <div style={{ width: '85%' }}> */}
      <main
        className={clsx(classes.content, {
          [classes.contentShift]: open,
        })}
      >
        <div className={classes.drawerHeader} style={{ minHeight: "47px" }} />
        {/* <div className={classes.drawerHeader} /> */}
        <Switch>
          <Route path="/admin/home" component={Home} />
          <Route
            path="/admin/city"
            render={(props) => (
              <City {...props} changeContext={changeContext} />
            )}
          />
          <Route
            path="/admin/:context/:id/dashboard"
            render={(props) => (
              <NewDashboard {...props} changeContext={changeContext} />
            )}
          />
          <Route
            path="/admin/floors"
            render={(props) => (
              <Floors {...props} changeContext={changeContext} />
            )}
          />
          <Route
            path="/admin/floor/:id/:param/zones"
            render={(props) => (
              <Zones {...props} changeContext={changeContext} />
            )}
          />
          <Route path="/admin/zone/:id/areas" component={Area} />
          <Route
            path="/admin/zone"
            render={(props) => (
              <Zonelist {...props} changeContext={changeContext} />
            )}
          />
          <Route path="/admin/areas/:param" component={Area} />
          <Route
            path="/admin/arealist"
            render={(props) => (
              <Arealist {...props} changeContext={changeContext} />
            )}
          />
          <Route
            path="/admin/zoneMain"
            render={(props) => (
              <Zonesmain {...props} changeContext={changeContext} />
            )}
          />

          <Route path="/admin/areadetail" component={Areadetail} />
          <Route path="/admin/eventsviewer" component={GlEventsViewer} />
          <Route path="/admin/reportsviewer" component={GlReports} />

          <Route path="/admin/floor/:id/hvac" component={hvac} />
          <Route path="/admin/zone/hvac" component={Area} />
          <Route
            path="/admin/configuresetpoint/"
            component={ConfigureSetpoint}
          />
          <Route path="/admin/room-booking/" component={RoomBooking} />
          <Route path="/admin/seat-booking/" component={SeatBooking} />
          <Route path="/admin/hvac/" component={hvac} />
          <Route path="/admin/flooroccupancy" component={FloorOccupancyNew} />
          <Route path="/admin/upload" component={upload} />
          <Route path="/admin/configuration" component={Configuration} />
          <Route path="/admin/schedule" component={Schedule} />
          <Route path="/admin/device" component={Table} />
          <Route path="/admin/controls" component={Controls} />
          <Route path="/admin/networkDiagram" component={NetworkDiagram} />
          <Route path="/admin/alerts" component={AlertsMain} />
          <Route path="/admin/glAhu" component={GlAhu} />
          <Route path="/admin/glLms" component={GlLms} />
          {/* <Route path="/admin/glFaults" component={GlFaults} /> */}
          <Route path="/admin/devicemap" component={Devicemap} />
          <Route path="/admin/selector" component={Selector} />
          <Route path="/admin/Glschedule" component={GlSchedule} />
          <Route path="/admin/glUps" component={GlUps} />
          <Route path="/admin/glVav" component={GlVav} />
          <Route path="/admin/glcsu" component={glcsu} />
          {/* <Route path="/admin/gltfa" component={gltfa} /> */}
          <Route path="/admin/glLandingUps" component={GlUpsLanding} />
          <Route path="/admin/glEMLanding" component={GlEMLanding} />
          <Route path="/admin/glEnergyMeter" component={GlEnergyMeter} />
          <Route
            path="/admin/glScheduleCreation"
            component={GlScheduleCreation}
          />
          <Route path="/admin/glossary" component={Glossary} />
          <Route path="/admin/Glbmscheduler" component={Glbmscheduler} />
          <Route path="/admin/GlChillerPage" component={GlChillerPage} />
          <Route path="/admin/GlChillerLanding" component={GlChillerLanding} />
          <Route path="/admin/GlCoolingTower" component={GlCoolingTower} />
          <Route path="/admin/GlPrimaryPump" component={GlPrimaryPump} />
          <Route path="/admin/GlAnalytics" component={GlAnalytics} />
          <Route
            path="/admin/GlAnalyticsForAllDevices"
            component={GlAnalyticsForAllDevices}
          />
          <Route path="/admin/Runhours" component={Runhours} />
          <Route
            path="/admin/GlAnalyticsopenFaults"
            component={GlAnalyticsopenFaults}
          />
          <Route path="/admin/alerts" component={AlertsMain} />
          {/* <Route path="/admin/IAQAnalytics2" component={IAQAnalytics2}/> */}
          {/* <Route path="/admin/IAQAnalytics3" component={IAQAnalytics3}/> */}
          <Route path="/admin/EnergyDashboard" component={EnergyDashboard} />
          <Route path="/admin/instrumentation" component={Instrumentation} />
          <Route path="/admin/Parkingsolution" component={Parkingsolution} />
          <Route path="/admin/glFAU" component={GlFAU} />
          <Route path="/admin/glHeatExhaustFan" component={GlHeatExhaustFan} />
          <Route path="/admin/GlVentilator" component={GlVentilator} />
          <Route
            path="/admin/GlBathroomExhaustFan"
            component={GlBathroomExhaustFan}
          />
           <Route path="/admin/newsummary" component={NewSummary} />
          <Route
            path="/admin/GlSubstationExhaustFans"
            component={GlSubstationExhaustFans}
          />
          <Route path="/admin/GlAllExhaustFans" component={GlAllExhaustFans} />
          <Route path="/admin/LandingPage" component={LandingPage} />
          <Route
            path="/admin/chillerSummaryPage"
            component={chillerSummaryPage}
          />
          <Route path="/admin/pumpsSummaryPage" component={pumpsSummaryPage} />
          <Route
            path="/admin/coolingTowerSummaryPage"
            component={coolingTowerSummaryPage}
          />
          <Route
            path="/admin/GlAtcsSummaryPage"
            component={GlAtcsSummaryPage}
          />
          <Route path="/admin/GlBtuSummaryPage" component={GlBtuSummaryPage} />
          <Route path="/admin/glEMLandingPage" component={glEMLandingPage} />
          <Route
            path="/admin/GlEnergyMeterSummary"
            component={GlEnergyMeterSummary}
          />
          <Route
            path="/admin/PlantRoomEnergyAnalytics"
            component={PlantRoomEnergyAnalytics}
          />
          <Route
            path="/admin/CpmConfig"
            component={CPMConfig}
          />
          <Redirect from="/admin" to="/admin/login" />
        </Switch>
        <Footer />
      </main>
      {/* </div> */}
    </div>
  ) : (
    <Redirect from="/" to="/login" />
  );
}

export default connect(mapStateToProps)(Admin);
Admin.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "Blue",
  ]),
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  routes: PropTypes.arrayOf(PropTypes.object),
};
