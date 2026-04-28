import {
  drawerWidth,
  transition,
  boxShadow,
  defaultFont,
  primaryColor,
  primaryBoxShadow,
  infoColor,
  successColor,
  warningColor,
  dangerColor,
  whiteColor,
  grayColor,
  blackColor,
  blueColor,
  hexToRgb,
} from "assets/jss/material-dashboard-react.js";

const sidebarStyle = (theme) => ({
  drawerPaper: {
    border: "none",
    position: "fixed",
    top: "0",
    bottom: "0",
    left: "0",
    zIndex: "1",
    ...boxShadow,
    width: drawerWidth,
    [theme.breakpoints.up("md")]: {
      width: drawerWidth,
      position: "fixed",
      height: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      width: drawerWidth,
      ...boxShadow,
      position: "fixed",
      display: "block",
      top: "0",
      height: "100vh",
      right: "0",
      left: "auto",
      zIndex: "1032",
      visibility: "visible",
      overflowY: "visible",
      borderTop: "none",
      textAlign: "left",
      paddingRight: "0px",
      paddingLeft: "0",
      transform: `translate3d(${drawerWidth}px, 0, 0)`,
      ...transition,
    },
  },
  drawerPaperRTL: {
    [theme.breakpoints.up("md")]: {
      left: "auto !important",
      right: "0 !important",
    },
    [theme.breakpoints.down("sm")]: {
      left: "0  !important",
      right: "auto !important",
    },
  },
  logo: {
    position: "relative",
    padding: "15px 15px",
    zIndex: "4",
    "&:after": {
      content: '""',
      position: "absolute",
      bottom: "0",

      height: "1px",
      right: "15px",
      width: "calc(100% - 30px)",
      backgroundColor: "rgba(" + hexToRgb(grayColor[6]) + ", 0.3)",
    },
  },
  logoLink: {
    ...defaultFont,
    textTransform: "uppercase",
    padding: "5px 0",
    display: "block",
    fontSize: "18px",
    textAlign: "left",
    fontWeight: "400",
    lineHeight: "30px",
    textDecoration: "none",
    backgroundColor: "transparent",
    "&,&:hover": {
      color: whiteColor,
    },
  },
  logoLinkRTL: {
    textAlign: "right",
  },
  logoImage: {
    width: "50px",
    display: "inline-block",
    maxHeight: "30px",
    marginLeft: "10px",
    marginRight: "15px",
  },
  img: {
    // width: "35px",
    // marginLeft: "6%",
    marginLeft: "3vh",
    marginTop: "-3vh",
    height: "50px",
    [theme.breakpoints.up("xl")]: {
      height: "81px",
      marginTop: "-5vh",
    },
    // top: "7px",
    position: "absolute",
    verticalAlign: "middle",
    border: "0",
  },
  background: {
    position: "absolute",
    zIndex: "1",
    height: "100%",
    width: "100%",
    display: "block",
    top: "0",
    left: "0",
    backgroundSize: "cover",
    backgroundPosition: "center center",
    "&:after": {
      position: "absolute",
      zIndex: "3",
      width: "100%",
      height: "100%",
      content: '""',
      display: "block",
      //  background: blueColor,
      background:
        localStorage.getItem("username") == "Guest1" ? whiteColor : blueColor,
      opacity: "1",
    },
  },
  list: {
    marginTop: "20px",
    paddingLeft: "0",
    paddingTop: "0",
    paddingBottom: "0",
    marginBottom: "0",
    listStyle: "none",
    position: "unset",
  },
  item: {
    position: "relative",
    display: "block",
    textDecoration: "none",
    "&:hover,&:focus,&:visited,&": {
      // color: whiteColor
      color:
        localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor,
    },
  },
  itemLink: {
    width: "auto",
    transition: "all 300ms linear",
    margin: "10px 15px 0",
    borderRadius: "3px",
    position: "relative",
    display: "block",
    padding: "10px 15px",
    backgroundColor: "transparent",
    // backgroundColor:'#FFFF',
    "&:hover": {
      // backgroundColor: blueColor[0],
      backgroundColor:
        localStorage.getItem("username") == "Guest1"
          ? whiteColor[0]
          : blueColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.2)",
    },
    ...defaultFont,
  },
  divItemLink: {
    width: "70%",
    transition: "all 300ms linear",
    marginLeft: "22%",
    marginRight: "2%",
    marginTop: "0.1em",
    marginBottom: "0.2em",
    borderRadius: "3px",
    position: "relative",
    display: "block",
    padding: "0.1em 0px",
    backgroundColor: "transparent",
    "&:hover,&:focus": {
      backgroundColor:
        localStorage.getItem("username") == "Guest1"
          ? whiteColor[0]
          : blueColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.2)",
    },
    ...defaultFont,
  },
  itemIcon: {
    width: "24px",
    height: "30px",
    fontSize: "24px",
    lineHeight: "30px",
    float: "left",
    marginRight: "5px",
    textAlign: "center",
    verticalAlign: "middle",
    color:
      "rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor
      ) +
      ", 0.8)",
  },
  expandIcon: {
    width: "24px",
    height: "30px",
    fontSize: "24px",
    lineHeight: "30px",
    float: "end",
    marginRight: "5px",
    // marginTop:'-3px',
    textAlign: "center",
    verticalAlign: "middle",
    color:
      "rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor
      ) +
      ", 0.8)",
  },
  arrow: {
    width: "24px",
    height: "13px",
    fontSize: "12px",
    lineHeight: "30px",
    float: "end",
    marginRight: "10px",
    marginTop: "-3px",
    textAlign: "center",
    verticalAlign: "middle",
    color:
      "rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor
      ) +
      ", 0.8)",
  },
  itemIconRTL: {
    marginRight: "3px",
    marginLeft: "15px",
    float: "right",
  },
  itemText: {
    ...defaultFont,
    margin: "0",
    lineHeight: "30px",
    fontSize: "10px",
    color:
      localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor,
  },
  itemTextRTL: {
    textAlign: "right",
  },
  whiteFont: {
    color:
      localStorage.getItem("username") == "Guest1" ? blueColor : whiteColor,
  },
  purple: {
    backgroundColor: primaryColor[0],
    ...primaryBoxShadow,
    "&:hover,&:focus": {
      backgroundColor: primaryColor[0],
      ...primaryBoxShadow,
    },
  },
  info: {
    backgroundColor: infoColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(infoColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(infoColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: infoColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(infoColor[0]) +
        ",.2)",
    },
  },
  green: {
    backgroundColor: successColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(successColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(successColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: successColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(successColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(successColor[0]) +
        ",.2)",
    },
  },
  orange: {
    backgroundColor: warningColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(warningColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: warningColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(warningColor[0]) +
        ",.2)",
    },
  },
  red: {
    backgroundColor: dangerColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(dangerColor[0]) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: dangerColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(dangerColor[0]) +
        ",.2)",
    },
  },
  blue: {
    backgroundColor: "#2546da",
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb("#2546da") +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb("#2546da") +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor: "#2546da",
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb("#2546da") +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb("#2546da") +
        ",.2)",
    },
  },
  blue: {
    backgroundColor:
      localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da",
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da"
      ) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da"
      ) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor:
        localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da",
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da"
        ) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1" ? "#FFFFFF" : "#2546da"
        ) +
        ",.2)",
    },
  },
  sidebarWrapper: {
    position: "relative",
    height: "calc(100vh - 75px)",
    overflow: "auto",
    width: "100%",
    zIndex: "4",
    overflowScrolling: "touch",
  },
  activePro: {
    [theme.breakpoints.up("md")]: {
      position: "absolute",
      width: "100%",
      bottom: "13px",
    },
  },
  sidebarItemBlue: {
    backgroundColor:
      localStorage.getItem("username") == "Guest1"
        ? whiteColor[0]
        : blueColor[0],
    boxShadow:
      "0 12px 20px -10px rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1"
          ? whiteColor[0]
          : blueColor[0]
      ) +
      ",.28), 0 4px 20px 0 rgba(" +
      hexToRgb(blackColor) +
      ",.12), 0 7px 8px -5px rgba(" +
      hexToRgb(
        localStorage.getItem("username") == "Guest1"
          ? whiteColor[0]
          : blueColor[0]
      ) +
      ",.2)",
    "&:hover,&:focus": {
      backgroundColor:
        localStorage.getItem("username") == "Guest1"
          ? whiteColor[0]
          : blueColor[0],
      boxShadow:
        "0 12px 20px -10px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.28), 0 4px 20px 0 rgba(" +
        hexToRgb(blackColor) +
        ",.12), 0 7px 8px -5px rgba(" +
        hexToRgb(
          localStorage.getItem("username") == "Guest1"
            ? whiteColor[0]
            : blueColor[0]
        ) +
        ",.2)",
    },
  },
});

export default sidebarStyle;
