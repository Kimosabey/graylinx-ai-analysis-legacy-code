import {
  successColor,
  whiteColor,
  grayColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";

const dashboardStyle = (theme)=>({
  successText: {
    color: successColor[0]
  },
  upArrowCardCategory: {
    width: "16px",
    height: "16px"
  },
  stats: {
    color: grayColor[12],
    // display: "inline-flex",
    display:"block",
    flex:7,
    fontSize: "14px",
    lineHeight: "22px",
    marginLeft:'45px',
    textAlign:"center",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    [theme.breakpoints.up('md')]:
      {marginLeft:"15px",textAlign:"center"},
    [theme.breakpoints.up('lg')]:
      {marginLeft:"5px",textAlign:"center"},
    [theme.breakpoints.up('xl')]:
      {marginLeft:"60px",textAlign:"center"},
    [theme.breakpoints.down('xs')]:
      {marginLeft:"7px",textAlign:"center"},
    [theme.breakpoints.down('sm')]:
      {marginLeft:"9px",textAlign:"center"},
  },
  hbStats: {
    color: whiteColor,
    display: "inline-flex",
    fontSize: "12px",
    lineHeight: "22px",
    "& svg": {
      top: "4px",
      width: "16px",
      height: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    },
    "& .fab,& .fas,& .far,& .fal,& .material-icons": {
      top: "4px",
      fontSize: "16px",
      position: "relative",
      marginRight: "3px",
      marginLeft: "3px"
    }
  },
  cardCategory: {
    color: grayColor[12],
    margin: "0",
    fontSize: "16px",
    fontWeight: "400",
    fontFamily:" BwSeidoRound-Regular ",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0",
    textAlign: "center"
  },
  hbCardCategory: {
    color: grayColor[12],
    fontWeight: "400",
    margin: "0",
    fontSize: "18px",
    fontFamily:"BwSeidoRound-Regular",
    marginTop: "0",
    paddingTop: "10px",
    marginBottom: "0"
  },
  cardCategoryWhite: {
    color: "rgba(" + hexToRgb(whiteColor) + ",.62)",
    margin: "0",
    fontSize: "14px",
    marginTop: "0",
    marginBottom: "0"
  },
  cardTitle: {
    color: grayColor[2],
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "BwSeidoRound-Regular",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  hbCardTitle: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: " BwSeidoRound-Regular",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: whiteColor,
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  cardTitleWhite: {
    color: whiteColor,
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "BwSeidoRound-Regular",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: grayColor[1],
      fontWeight: "400",
      lineHeight: "1"
    }
  },
  map:{
    [theme.breakpoints.down('sm')]:
      {width:"313px"},
    [theme.breakpoints.down('xs')]:
      {width:"213px"}
  }
});

export default dashboardStyle;
