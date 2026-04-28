import React, { useEffect } from "react";
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Hidden from "@material-ui/core/Hidden";
import Poppers from "@material-ui/core/Popper";
// @material-ui/icons
import Person from "@material-ui/icons/Person";
// core components
import api from "api.js";
import jwt_decode from "jwt-decode";
import Cookies from "universal-cookie";
import Button from "components/CustomButtons/Button.js";
import { useHistory } from "react-router-dom";
import styles from "assets/jss/material-dashboard-react/components/headerLinksStyle.js";
import Avatar from "@material-ui/core/Avatar";
import Person11 from "./../../assets/img/user_image.png";
const useStyles = makeStyles(styles);

export default function AdminNavbarLinks() {
  let history = useHistory();
  const classes = useStyles();
  // const dispatch = useDispatch();
  const cookies = new Cookies();
  // const buildingID = useSelector(state => state.isLogged.data.building.id)
  // const [openNotification, setOpenNotification] = React.useState(null);
  const [openProfile, setOpenProfile] = React.useState(null);
  // const [authenticated, setAuthenticated] = React.useState(false)
  // const handleClickNotification = event => {
  //   if (openNotification && openNotification.contains(event.target)) {
  //     setOpenNotification(null);
  //   } else {
  //     setOpenNotification(event.currentTarget);
  //   }
  // };
  // const handleCloseNotification = () => {
  //   setOpenNotification(null);
  // };
  const handleClickProfile = (event) => {
    if (openProfile && openProfile.contains(event.target)) {
      setOpenProfile(null);
    } else {
      setOpenProfile(event.currentTarget);
    }
  };
  const handleLogout = () => {
    const token = jwt_decode(cookies.get("token"));
    api.auth.logout(token).then((res) => {
      cookies.remove("token", { path: "/" });
      cookies.remove("role", { path: "/" });
      localStorage.clear();
      history.push("/");
      // setAuthenticated(false)
    });
  };

  // const openAlerts =()=>{
  //  history.push("/admin/alerts")
  // }

  // const openUpload=()=>{
  //   setOpenNotification(null);
  //   history.push("/admin/upload")
  // }

  // const openConfiguration=()=>{
  //   setOpenNotification(null);
  //   history.push("/admin/configuration")
  // }
  const handleCloseProfile = () => {
    setOpenProfile(null);
  };

  useEffect(() => {
    // api.notifications.alarm(buildingID).then(res=>{
    //   console.log("-------------------------------",buildingID)
    //   console.log("ress in nav bar-------alert", res)
    //   dispatch({
    //     type: "alarm",
    //     payload: res
    // })
    // })
  }, []);

  return (
    <div>
      <div className={classes.manager}></div>
      <div className={classes.manager}>
        <Button
          style={{ marginTop: "-2vh" }}
          color={window.innerWidth > 959 ? "transparent" : "white"}
          justIcon={window.innerWidth > 959}
          simple={!(window.innerWidth > 959)}
          aria-owns={openProfile ? "profile-menu-list-grow" : null}
          aria-haspopup="true"
          onClick={handleClickProfile}
          className={classes.buttonLink}
        >
          <span style={{ fontSize: "11px" }}>
            {/* <Person className={classes.icons} /> */}
            <Avatar alt="User image" src={Person11} />
            {/* <br /> */}
            {/* {localStorage.username} */}
          </span>
          <Hidden mdUp implementation="css">
            <p className={classes.linkText}>Logout</p>
          </Hidden>
        </Button>
        <Poppers
          open={Boolean(openProfile)}
          anchorEl={openProfile}
          transition
          disablePortal
          className={
            classNames({ [classes.popperClose]: !openProfile }) +
            " " +
            classes.popperNav
          }
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              id="profile-menu-list-grow"
              style={{
                transformOrigin:
                  placement === "bottom" ? "center top" : "center bottom",
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleCloseProfile}>
                  <MenuList role="menu">
                    {/* <MenuItem
                      onClick={handleCloseProfile}
                      className={classes.dropdownItem}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={handleCloseProfile}
                      className={classes.dropdownItem}
                    >
                      Settings
                    </MenuItem> */}
                    {/* <Divider light /> */}
                    <MenuItem
                    //onClick={handleLogout}
                    //  className={classes.dropdownItem}
                    >
                      {localStorage.username}
                    </MenuItem>
                    <MenuItem>V 0.0.5</MenuItem>
                    <MenuItem
                      onClick={handleLogout}
                      className={classes.dropdownItem}
                    >
                      Logout
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Poppers>
      </div>
    </div>
  );
}
