import {
  drawerWidth,
  transition,
  container
} from "assets/jss/material-dashboard-react.js";

const appStyle = theme => ({
  wrapper: {
    // position: "relative",
    // top: "0",
    // height: "100vh"
    display: 'flex'
  },
  mainPanel: {
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    },
    overflow: "auto",
    position: "relative",
    float: "right",
    ...transition,
    maxHeight: "100%",
    width: "100%",
    overflowScrolling: "touch"
  },
  content: {
    // marginTop: "30px",
    // padding: "30px 15px",
    // minHeight: "calc(100vh - 123px)"
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    // marginLeft: -240,
  },
  container,
  map: {
    marginTop: "70px"
  }
});

export default appStyle;
