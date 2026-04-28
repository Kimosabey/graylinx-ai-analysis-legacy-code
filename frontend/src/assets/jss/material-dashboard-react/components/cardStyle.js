import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";

const cardStyle = {
  card: {
    border: "0",
    marginBottom: "30px",
    marginTop: "30px",
    borderRadius: "6px",
    color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
    // background: whiteColor,
    width: "100%",
    boxShadow: "1px 0px 8px 2px rgba(" + hexToRgb(blackColor) + ", 0.14)",
    position: "relative",
   // display: "flex",
    flexDirection: "column",
    minWidth: "0",
    wordWrap: "break-word",
    fontSize: ".875rem"
  },
  hbCard: {
    border: "0",
    marginBottom: "30px",
    marginTop: "30px",
    borderRadius: "6px",
    color: "rgba(" + hexToRgb(blackColor) + ", 0.87)",
    // background: whiteColor,
    width: "100%",
    position: "relative",
    display: "flex",
    flexDirection: "row",
    minWidth: "0",
    wordWrap: "break-word",
    fontSize: ".875rem"
  },
  cardPlain: {
    background: "transparent",
    boxShadow: "none"
  },
  hbCardProfile: {
    background: "transparent",
    // boxShadow: "none",
    textAlign: "center"
  },
  cardProfile: {
    marginTop: "30px",
    textAlign: "center"
  },
  cardChart: {
    "& p": {
      marginTop: "0px",
      paddingTop: "0px"
    }
  }
};

export default cardStyle;
