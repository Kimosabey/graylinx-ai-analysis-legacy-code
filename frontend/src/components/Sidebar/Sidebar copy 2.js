/*eslint-disable*/
import React from "react";
import classNames from "classnames";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
// @material-ui/core components
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Icon from "@material-ui/core/Icon";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import IconButton from "@material-ui/core/IconButton";
import Divider from "@material-ui/core/Divider";
// core components
import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks.js";
import RTLNavbarLinks from "components/Navbars/RTLNavbarLinks.js";
// import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from "@material-ui/icons/ExpandMore";
import ArrowForward from "@material-ui/icons/ArrowForwardIos";
import Collapse from "@material-ui/core/Collapse";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import BusinessIcon from "@material-ui/icons/Business";
import Home from "@material-ui/icons/House";
import styles from "assets/jss/material-dashboard-react/components/sidebarStyle.js";
import { TrainRounded } from "@material-ui/icons";
import StarBorder from "@material-ui/icons/StarBorder";
import Notifications from "@material-ui/icons/Notifications";
import AssessmentIcon from "@material-ui/icons/Assessment";
import MeetingRoomIcon from "@material-ui/icons/MeetingRoom";
import SettingsEthernetIcon from "@material-ui/icons/SettingsEthernet";
//import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
//import SummarizeOutlinedIcon from '@material-ui/icons/su';
import AssignmentIcon from "@material-ui/icons/Assignment";
import CalendarTodayIcon from "@material-ui/icons/CalendarToday";
import ImportContactsIcon from "@material-ui/icons/ImportContacts";
import NotificationsIcon from "@material-ui/icons/Notifications";
import simplyIO from "assets/img/simply-io.jpg";

const drawerWidth = 245;
const useStyles = makeStyles(styles);
const useStyles1 = makeStyles((theme) => ({
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
}));

export default function Sidebar(props) {
  const role_id = localStorage.getItem("roleID");
  const classes = useStyles();
  const classes1 = useStyles1();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [AlOpen, setAlOpen] = React.useState(false);
  const [rou, setRou] = React.useState([]);
  const [controlOpen, setControlOpen] = React.useState(false);
  const [controlOpen1, setControlOpen1] = React.useState(false);
  const [controlOpen2, setControlOpen2] = React.useState(false);
  const [spaceOpen, setSpaceOpen] = React.useState(false);
  const [reportOpen, setReportOpen] = React.useState(false);
  const [schOpen, setSchOpen] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(false);
  const [instruments, setInstruments] = React.useState(false);
  const [activeLink, setActiveLink] = React.useState("AHU");

  const handleClick = () => {
    setOpen(!open);
  };
  const handleClickAl = () => {
    setAlOpen(!AlOpen);
  };
  const handleControl = () => {
    setControlOpen(!controlOpen);
  };
  const handleControl1 = () => {
    setControlOpen1(!controlOpen1);
  };
  const handleControl2 = () => {
    setControlOpen2(!controlOpen2);
  };
  const handleSpace = () => {
    setSpaceOpen(!spaceOpen);
  };
  const handleSchedule = () => {
    setSchOpen(!schOpen);
  };
  const handleAnalytics = () => {
    setAnalytics(!analytics);
  };
  const handleinstrument = () => {
    setInstruments(!instruments);
  };
  // const handleSchedule=()=>{
  //   setSchOpen(!schOpen)
  // }
  const handleReport = () => {
    console.log("resport------>");
    setReportOpen(!reportOpen);
  };

  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { color, logo, image, logoText, routes } = props;
  // var links = (
  //   <List className={classes.list}>
  //     {routes.map((prop, key) => {
  //       let urlPath = prop.path;
  //       if(urlPath.indexOf("/:id/") > -1) {
  //         let splitPaths = urlPath.split("/:id/")
  //         let assetId = splitPaths[0].includes("building") ? localStorage.getItem("buildingID") : splitPaths[0].includes("floor") ? localStorage.getItem("floorID") : splitPaths[0].includes("zone") ? localStorage.getItem("zoneID"):  localStorage.getItem("deviceID")
  //         urlPath = splitPaths[0] + "/" + assetId + "/" +splitPaths[1];
  //       }
  //       var activePro = " ";
  //       var listItemClasses;
  //       if (prop.path === "/upgrade-to-pro") {
  //         activePro = classes.activePro + " ";
  //         listItemClasses = classNames({
  //           [" " + classes[color]]: true
  //         });
  //       } else {
  //         listItemClasses = classNames({
  //           [" " + classes[color]]: activeRoute(prop.layout + urlPath)
  //         });
  //       }
  //       const whiteFontClasses = classNames({
  //         [" " + classes.whiteFont]: activeRoute(prop.layout + urlPath)
  //       });
  //       return (
  //         <NavLink
  //           to={prop.layout + urlPath}
  //           className={activePro + classes.item}
  //           activeClassName="active"
  //           key={key}
  //         >
  //           <ListItem button className={classes.itemLink + listItemClasses}>
  //             {typeof prop.icon === "string" ? (
  //               <Icon
  //                 className={classNames(classes.itemIcon, whiteFontClasses, {
  //                   [classes.itemIconRTL]: props.rtlActive
  //                 })}
  //               >
  //                 {prop.icon}
  //               </Icon>
  //             ) : (
  //               <prop.icon
  //                 className={classNames(classes.itemIcon, whiteFontClasses, {
  //                   [classes.itemIconRTL]: props.rtlActive
  //                 })}
  //               />
  //             )}
  //             <ListItemText
  //               primary={props.rtlActive ? prop.rtlName : prop.name}
  //               className={classNames(classes.itemText, whiteFontClasses, {
  //                 [classes.itemTextRTL]: props.rtlActive
  //               })}
  //               disableTypography={true}
  //             />
  //           </ListItem>
  //         </NavLink>
  //       );
  //     })}
  //   </List>
  // );
  var links = (
    <div className={classes.sidebarWrapper}>
      {/* {links} */}
      <List>
        {localStorage.getItem("roleID") == "6" ? (
          <NavLink
            to={"/admin/Parkingsolution"}
            className={" " + classes.item}
            activeClassName="active"
          >
            <ListItem
              button
              className={
                classes.itemLink +
                classNames({
                  [" " + classes[color]]: activeRoute("/admin/Parkingsolution"),
                })
              }
            >
              <BusinessIcon
                className={
                  classes.itemIcon +
                  classNames({
                    [" " + classes.whiteFont]: activeRoute(
                      "/admin/Parkingsolution"
                    ),
                  })
                }
              />

              <ListItemText
                primary={"Parking Management"}
                className={
                  classes.itemText +
                  classNames({
                    [" " + classes.whiteFont]: activeRoute(
                      "/admin/Parkingsolution"
                    ),
                  })
                }
                disableTypography={true}
              />
            </ListItem>
          </NavLink>
        ) : (
          <>
            <NavLink
              to={
                "/admin/building/" +
                localStorage.getItem("buildingID") +
                "/dashboard"
              }
              className={" " + classes.item}
              activeClassName="active"
            >
              <ListItem button className={classes.itemLink}>
                <Home
                  className={
                    classes.itemIcon +
                    classNames({
                      [" " + classes.whiteFont]: activeRoute(
                        "/admin/building/:id/dashboard"
                      ),
                    })
                  }
                />

                <ListItemText
                  primary={"Home"}
                  className={
                    classes.itemText +
                    classNames({
                      [" " + classes.whiteFont]: activeRoute(
                        "/admin/building/:id/dashboard"
                      ),
                    })
                  }
                  disableTypography={true}
                />
              </ListItem>
            </NavLink>
            <div
              className={classNames({ [" " + classes[color]]: controlOpen })}
              style={{ borderRadius: "14px", margin: "5px,5px" }}
            >
              <ListItem
                button
                className={classes.itemLink}
                onClick={handleControl}
              >
                <BusinessIcon className={classes.itemIcon} />
                <ListItemText
                  primary={"Building Controls"}
                  className={
                    classes.itemText +
                    classNames({ [" " + classes.whiteFont]: true })
                  }
                  disableTypography={true}
                />
                <ListItemSecondaryAction className={classes.expandIcon}>
                  {controlOpen ? (
                    <ExpandMore onClick={handleControl} />
                  ) : (
                    <ArrowForward
                      className={classes.arrow}
                      onClick={handleControl}
                    />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <div className={classes.item}>
                <Collapse in={controlOpen} timeout="auto" unmountOnExit>
                  <NavLink
                    to={"/admin/GlChillerLanding"}
                    className={" " + classes.item}
                    activeClassName="active"
                  >
                    <ListItem
                      button
                      className={
                        classes.divItemLink +
                        classNames({
                          [" " + classes.sidebarItemBlue]: activeRoute(
                            "/admin/GlChillerLanding"
                          ),
                        })
                      }
                    >
                      <ListItemText
                        primary={"Plant Room"}
                        className={
                          classes.itemText +
                          classNames({
                            [" " + classes.whiteFont]: activeRoute(
                              "/admin/GlChillerLanding"
                            ),
                          })
                        }
                        disableTypography={true}
                        style={{ padding: "0px 2.5em" }}
                      />
                    </ListItem>
                  </NavLink>
                </Collapse>
              </div>
              <div className={classes.item}></div>
            </div>
            <ListItem
              button
              className={classes.itemLink}
              onClick={handleControl2}
            >
              <AssignmentIcon className={classes.itemIcon} />
              <ListItemText
                primary={"Summary"}
                className={
                  classes.itemText +
                  classNames({ [" " + classes.whiteFont]: true })
                }
                disableTypography={true}
              />

              <ListItemSecondaryAction>
                {controlOpen2 ? (
                  <ExpandMore
                    className={classes.arrow}
                    onClick={handleControl2}
                  />
                ) : (
                  <ArrowForward
                    className={classes.arrow}
                    onClick={handleControl2}
                  />
                )}
              </ListItemSecondaryAction>
            </ListItem>

            {/* Submenu */}
            <Collapse in={controlOpen2} timeout="auto" unmountOnExit>
              <NavLink
                to={"/admin/chillerSummaryPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/chillerSummaryPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/chillerSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"Chiller Summary"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/chillerSummaryPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    // style={{ padding: "0px 0.8em" }}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>

              <NavLink
                to={"/admin/pumpsSummaryPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/pumpsSummaryPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/pumpsSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"Pumps Summary"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/pumpsSummaryPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>
              <NavLink
                to={"/admin/coolingTowerSummaryPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/coolingTowerSummaryPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/pumpsSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"Cooling Tower Summary"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/coolingTowerSummaryPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>
              <NavLink
                to={"/admin/GlAtcsSummaryPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/GlAtcsSummaryPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/pumpsSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"ATCS Summary Page"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/GlAtcsSummaryPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>
              <NavLink
                to={"/admin/GlBtuSummaryPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/GlBtuSummaryPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/pumpsSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"BTU Summary Page"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/GlBtuSummaryPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>

              <NavLink
                to={"/admin/glEMLandingPage"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  style={{ margin: "0px 15px 0", padding: "4px 10px" }}
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/glEMLandingPage"
                      ),
                    })
                  }
                >
                  {/* <SettingsEthernetIcon
        className={classes.itemIcon + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/pumpsSummaryPage') })}
      /> */}
                  <ListItemText
                    primary={"Energy Meter"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/glEMLandingPage"
                        ),
                      })
                    }
                    disableTypography={true}
                    style={{ padding: "0px 0px 0px 3.5em" }}
                  />
                </ListItem>
              </NavLink>
            </Collapse>

            {/* <NavLink
              to={"/admin/networkDiagram"}
              className={" " + classes.item}
              activeClassName="active"
            >
              <ListItem
                button
                className={
                  classes.itemLink +
                  classNames({
                    [" " + classes[color]]: activeRoute(
                      "/admin/networkDiagram"
                    ),
                  })
                }
              >
                <SettingsEthernetIcon
                  className={
                    classes.itemIcon +
                    classNames({
                      [" " + classes.whiteFont]: activeRoute(
                        "/admin/networkDiagram"
                      ),
                    })
                  }
                />

                <ListItemText
                  primary={"Network Diagram"}
                  className={
                    classes.itemText +
                    classNames({
                      [" " + classes.whiteFont]: activeRoute(
                        "/admin/networkDiagram"
                      ),
                    })
                  }
                  disableTypography={true}
                />
              </ListItem>
            </NavLink> */}
            {/* <NavLink
              to={"/admin/Glschedule"}
              className={" " + classes.item}
              activeClassName="active"
            >
              <ListItem
                button
                className={
                  classes.itemLink +
                  classNames({
                    [" " + classes[color]]: activeRoute("/admin/Glschedule"),
                  })
                }
              >
                <CalendarTodayIcon className={classes.itemIcon} />
                <ListItemText
                  primary={"Scheduler"}
                  className={
                    classes.itemText +
                    classNames({
                      [" " + classes.whiteFont]: activeRoute(
                        "/admin/Glschedule"
                      ),
                    })
                  }
                  disableTypography={true}
                />
              </ListItem>
            </NavLink> */}
            {role_id != 2 ? (
              <div
                className={classNames({ [" " + classes[color]]: reportOpen })}
                style={{
                  borderRadius: "14px",
                  margin: "5px,5px",
                  pointerEvents: "none",
                  opacity: "0.4",
                }}
              >
                <NavLink
                  to={"/admin/reportsviewer"}
                  className={" " + classes.item}
                  activeClassName="active"
                >
                  <ListItem
                    button
                    className={
                      classes.itemLink +
                      classNames({
                        [" " + classes[color]]: activeRoute(
                          "/admin/reportsviewer"
                        ),
                      })
                    }
                  >
                    <AssessmentIcon
                      className={
                        classes.itemIcon +
                        classNames({
                          [" " + classes.whiteFont]: activeRoute(
                            "/admin/reportsviewer"
                          ),
                        })
                      }
                    />

                    <ListItemText
                      primary={"Chiller Plant Report"}
                      className={
                        classes.itemText +
                        classNames({
                          [" " + classes.whiteFont]: activeRoute(
                            "/admin/reportsviewer"
                          ),
                        })
                      }
                      disableTypography={true}
                    />
                  </ListItem>
                </NavLink>
              </div>
            ) : (
              <NavLink
                to={"/admin/reportsviewer"}
                className={" " + classes.item}
                activeClassName="active"
              >
                <ListItem
                  button
                  className={
                    classes.itemLink +
                    classNames({
                      [" " + classes[color]]: activeRoute(
                        "/admin/reportsviewer"
                      ),
                    })
                  }
                >
                  <AssessmentIcon
                    className={
                      classes.itemIcon +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/reportsviewer"
                        ),
                      })
                    }
                  />

                  <ListItemText
                    primary={"Chiller Plant Report"}
                    className={
                      classes.itemText +
                      classNames({
                        [" " + classes.whiteFont]: activeRoute(
                          "/admin/reportsviewer"
                        ),
                      })
                    }
                    disableTypography={true}
                  />
                </ListItem>
              </NavLink>
            )}

            {/* <NavLink to={'/admin/Glbmscheduler'} className={" " + classes.item} activeClassName="active">
               <ListItem button className={classes.divItemLink + classNames({
                        [" " + classes.sidebarItemBlue]: activeRoute('/admin/Glbmscheduler')
                        })}>
             
               <ListItemText
                   primary={'Schedule'}
                   className={classes.itemText + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/glScheduleCreation') })}
                   disableTypography={true}
                   style={{padding:'0px 1.5em'}}
                 />
               </ListItem>
           </NavLink> 
          
           <NavLink to={'/admin/glScheduleCreation'} className={" " + classes.item} activeClassName="active">
               <ListItem button className={classes.divItemLink + classNames({
                    [" " + classes.sidebarItemBlue]: activeRoute('/admin/glScheduleCreation')
                    })}>
             
               <ListItemText
                 primary={'Weekly Schedule'}
                 className={classes.itemText + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/glScheduleCreation') })}
                 disableTypography={true}
                 style={{padding:'0px 1.5em'}}
                 />
                </ListItem>
           </NavLink>
           <NavLink to={'/admin/DevScheduler'} className={" " + classes.item} activeClassName="active">
                       <ListItem button className={classes.divItemLink + classNames({
                            [" " + classes.sidebarItemBlue]: activeRoute('/admin/DevScheduler')
                            })}>
                       <ListItemText
                         primary={'ATL Scheduler'}
                         className={classes.itemText + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/DevScheduler') })}
                         disableTypography={true}
                         style={{padding:'0px 2.5em'}}                         />
                        </ListItem>
           </NavLink> */}
            {/* <ListItem button className={classes.itemLink}  onClick={handleinstrument} >
          <CalendarTodayIcon   className={classes.itemIcon}/>   
          <ListItemText
            primary={'Instrumentation'}
            className={classes.itemText + classNames({ [" " + classes.whiteFont]: true })}
            disableTypography={true}
          />
           <ListItemSecondaryAction className={classes.expandIcon} >
           {instruments ? <ExpandMore
              onClick={handleinstrument} /> : <ArrowForward className={classes.arrow} onClick={handleinstrument} />}
            </ListItemSecondaryAction>
         </ListItem> */}

            {/* <div className={classes.item} >
         <Collapse in={instruments} timeout="auto" unmountOnExit >
            <NavLink to={'/admin/instrumentation'} className={" " + classes.item} activeClassName="active">
               <ListItem button className={classes.divItemLink + classNames({
                        [" " + classes.sidebarItemBlue]: activeRoute('/admin/instrumentation')
                        })}>                   
               <ListItemText
                   primary={'Instrumentation'}
                   className={classes.itemText + classNames({ [" " + classes.whiteFont]: activeRoute('/admin/instrumentation') })}
                   disableTypography={true}
                   style={{padding:'0px 1.5em'}}
                 />
               </ListItem>
           </NavLink>
         </Collapse>
         </div> */}
          </>
        )}
      </List>
    </div>
  );
  // var brand = (
  //   <div className={classes.logo}>
  //     <a
  //       href="https://graylinx.ai/"
  //       className={classNames(classes.logoLink, {
  //         [classes.logoLinkRTL]: props.rtlActive,
  //       })}
  //       target="_blank"
  //     >
  //       <div className={classes.logoImage}>
  //         <img
  //           src={localStorage.getItem("username") == "Guest1" ? simplyIO : logo}
  //           alt="logo"
  //           className={classes.img}
  //         />
  //       </div>
  //     </a>
  //     <IconButton
  //       onClick={props.handleDrawerClose}
  //       style={{ zIndex: "4", float: "right", marginTop: "-15%" }}
  //     >
  //       <ChevronLeftIcon className={classes.itemIcon} />
  //     </IconButton>
  //   </div>
  // );
  var brand = (
    <div className={classes.logo} style={{ background: "white" }}>
      <a
        href="https://graylinx.ai/"
        className={classNames(classes.logoLink, {
          [classes.logoLinkRTL]: props.rtlActive,
        })}
        target="_blank"
      >
        <div className={classes.logoImage}>
          <img
            src={localStorage.getItem("username") == "Guest1" ? simplyIO : logo}
            alt="logo"
            className={classes.img}
          />
        </div>
      </a>

      <IconButton
        onClick={props.handleDrawerClose}
        style={{ zIndex: 4, float: "right", marginTop: "-15%" }}
      >
        <ChevronLeftIcon className={classes.itemIcon} />
      </IconButton>
    </div>
  );

  return (
    <div>
      <Hidden mdUp implementation="css">
        <Drawer
          className={classes1.drawer}
          variant="persistent"
          anchor="left"
          open={props.open}
          classes={{
            paper: classes1.drawerPaper,
          }}
        >
          {brand}
          <div
            className={classes.sidebarWrapper}
            style={{ paddingBottom: "60px" }}
          >
            <AdminNavbarLinks />
            {links}
          </div>
          {image !== undefined ? (
            <div
              className={classes.background}
              style={{ backgroundImage: "url(" + image + ")" }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              padding: "16px",
              textAlign: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "inherit",
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
              © GrayLinx India Pvt Ltd.
            </p>
          </div>
        </Drawer>
      </Hidden>

      <Hidden smDown implementation="css">
        <Drawer
          className={classes1.drawer}
          variant="persistent"
          anchor="left"
          open={props.open}
          classes={{
            paper: classes1.drawerPaper,
          }}
        >
          <div
            className={classes.background}
            // style={{ backgroundColor:'#0123B4'}}
          />
          {/* {image !== undefined ? (
          <div
          className={classes.background}
          style={{ backgroundImage: "url(" + image + ")" }}
          />
        ) : null} */}
          {brand}
          <Divider />
          {links}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              padding: "16px",
              textAlign: "center",
              borderTop: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "inherit",
            }}
          >
            <p style={{ margin: 0, fontSize: "12px", color: "#999" }}>
              © GrayLinx India Pvt Ltd.
            </p>
          </div>
        </Drawer>
      </Hidden>
    </div>
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf([
    "purple",
    "blue",
    "green",
    "orange",
    "red",
    "info",
  ]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool,
};
