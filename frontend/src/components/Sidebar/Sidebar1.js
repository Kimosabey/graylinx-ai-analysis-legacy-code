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
import Icon from "@material-ui/core/Icon";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
// core components
import AdminNavbarLinks from "components/Navbars/AdminNavbarLinks.js";
import RTLNavbarLinks from "components/Navbars/RTLNavbarLinks.js";

import styles from "assets/jss/material-dashboard-react/components/sidebarStyle.js";

const drawerWidth = 260;
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
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
  }
}));


export default function Sidebar(props) {
  const classes = useStyles();
  const classes1 = useStyles1();
  const theme = useTheme();
  // verifies if routeName is the one active (in browser input)
  function activeRoute(routeName) {
    return window.location.href.indexOf(routeName) > -1 ? true : false;
  }
  const { color, logo, image, logoText, routes } = props;
  var links = (
    <List className={classes.list}>
      {routes.map((prop, key) => {
        console.log("routes123",routes)
        let urlPath = prop.path;
        if(urlPath.indexOf("/:id/") > -1) {
          let splitPaths = urlPath.split("/:id/")
          let assetId = splitPaths[0].includes("building") ? localStorage.getItem("buildingID") : splitPaths[0].includes("floor") ? localStorage.getItem("floorID") : splitPaths[0].includes("zone") ? localStorage.getItem("zoneID"):  localStorage.getItem("deviceID")
          urlPath = splitPaths[0] + "/" + assetId + "/" +splitPaths[1];
        }
        var activePro = " ";
        var listItemClasses;
        if (prop.path === "/upgrade-to-pro") {
          activePro = classes.activePro + " ";
          listItemClasses = classNames({
            [" " + classes[color]]: true
          });
        } else {
          listItemClasses = classNames({
            [" " + classes[color]]: activeRoute(prop.layout + urlPath)
          });
        }
        const whiteFontClasses = classNames({
          [" " + classes.whiteFont]: activeRoute(prop.layout + urlPath)
        });
        return (
          <NavLink
            to={prop.layout + urlPath}
            className={activePro + classes.item}
            activeClassName="active"
            key={key}
          >
            <ListItem button className={classes.itemLink + listItemClasses}>
              {typeof prop.icon === "string" ? (
                <Icon
                  className={classNames(classes.itemIcon, whiteFontClasses, {
                    [classes.itemIconRTL]: props.rtlActive
                  })}
                >
                  {prop.icon}
                </Icon>
              ) : (
                <prop.icon
                  className={classNames(classes.itemIcon, whiteFontClasses, {
                    [classes.itemIconRTL]: props.rtlActive
                  })}
                />
              )}
              <ListItemText
                primary={props.rtlActive ? prop.rtlName : prop.name}
                className={classNames(classes.itemText, whiteFontClasses, {
                  [classes.itemTextRTL]: props.rtlActive
                })}
                disableTypography={true}
              />
            </ListItem>
          </NavLink>
        );
      })}
    </List>
  );
  var brand = (
    <div className={classes.logo}>
      <a
        href="https://graylinx.ai/"
        className={classNames(classes.logoLink, {
          [classes.logoLinkRTL]: props.rtlActive
        })}
        target="_blank"
      >
        <div className={classes.logoImage}>
          <img src={logo} alt="logo" className={classes.img} />
        </div>
      </a>
      {/* <IconButton onClick={props.handleDrawerClose} style={{zIndex: "4", float: "right", marginTop: "-15%"}}>
          <ChevronLeftIcon    className={classes.itemIcon}/>
      </IconButton> */}
    </div>
  );
  return (
   <div> 
        <Hidden  mdUp>
        <Drawer
        className={classes1.drawer}
        variant="persistent"
        anchor="left"
        open={props.open}
        classes={{
          paper: classes1.drawerPaper,
        }}
      >
        {/* {brand} */}
        <div className={classes.sidebarWrapper}>
        <AdminNavbarLinks/>
           {links}
        </div>
        {image !== undefined ? (
          <div
          className={classes.background}
          style={{ backgroundImage: "url(" + image + ")" }}
          />
        ) : null}
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
        <div className={classes.sidebarWrapper}>
           {links}
        </div>
      </Drawer>
      </Hidden>
   </div>
       
  );
}

Sidebar.propTypes = {
  rtlActive: PropTypes.bool,
  handleDrawerToggle: PropTypes.func,
  bgColor: PropTypes.oneOf(["purple", "blue", "green", "orange", "red","info"]),
  logo: PropTypes.string,
  image: PropTypes.string,
  logoText: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
  open: PropTypes.bool
};
