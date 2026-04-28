import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { Box, Card, TextField } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl } from "react-leaflet";
import ChillerImg from "./../../assets/img/ChillerImg.png";
import TimeSeriesUpsStatic from "./../TimeSeriesUpsStatic";
import SwitchSelector from "react-switch-selector";
import { CalendarToday } from "@material-ui/icons";
import { ButtonBase } from "@material-ui/core";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import ProgressBar from "@ramonak/react-progress-bar";
import api from "./../../api";
import TimeS from "./../TimeS";
import TimeSeriesChart from "./../TimeSeriesVav";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import {
  greenColor,
  grayColor,
  redColor,
} from "assets/jss/material-dashboard-react";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Chiller_updated_img from "./../../assets/img/Chiller_jupiter1.png";
// import chiller_single from "./../../assets/img/chiller_single.png"

const Leaflet = require("leaflet");

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
    Leaflet_Tooltip_Heading: {
     fontWeight: "500", fontFamily: "Arial",
     "@media (min-width:0px) and (max-width:600px)": {
      //xs
      fontSize: "1.7vh",
    },
    "@media (min-width:600px) and (max-width:960px)": {
      //sm
      fontSize: "1.7vh",
    },
    "@media (min-width:960px) and (max-width:1280px)": {
      //md
     fontSize: "1.7vh",
    },
    "@media (min-width:1280px) and (max-width:1920px)": {
      //lg
     fontSize: "1.7vh",
    },
    "@media (min-width:1920px) and (max-width:2560px)": {
      //xl
        fontSize: "1.7vh",
    },
  },
    Leaflet_Tooltip_Values: {
     fontWeight: "500", fontFamily: "Arial",
     "@media (min-width:0px) and (max-width:600px)": {
      //xs
      fontSize: "1.7vh",
    },
    "@media (min-width:600px) and (max-width:960px)": {
      //sm
      fontSize: "1.7vh",
    },
    "@media (min-width:960px) and (max-width:1280px)": {
      //md
     fontSize: "1.7vh",
    },
    "@media (min-width:1280px) and (max-width:1920px)": {
      //lg
     fontSize: "1.7vh",
    },
    "@media (min-width:1920px) and (max-width:2560px)": {
      //xl
        fontSize: "1.7vh",
    },
  },
  card: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  semicircularbarcomp: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      marginTop: "-0.5vh",
      marginLeft: "-1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      marginTop: "1vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      marginTop: "-1vh",
      marginLeft: "-1.1vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      marginTop: "0vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      marginTop: "1vh",
      marginLeft: "0.5vh",
    },
  },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    padding: theme.spacing(1),
    textAlign: "center",
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius: "9px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "50vh",
    marginTop: "1vh",
    opacity: "1",
  },
  paper1: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  controls_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justify: "center",
    height: "3.5vh",
    backgroundColor: "lightgrey",
    width: "10vh",
    fontSize: "1.8vh",
  },
  faults_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: "flex",
    textAlign: "center",
    alignItems: "center",
    justify: "center",
    height: "2vh",
    backgroundColor: "lightgrey",
    [theme.breakpoints.down("sm")]: {
      width: "7.5vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "6vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "7.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "7.5vh",
    },
  },
  set_button: {
    marginLeft: "-0.7vh",
    fontFamily: "Arial",
    [theme.breakpoints.down("sm")]: {
      // marginLeft:'0.5vh',
      marginLeft: "-1.2vh",
      width: "3vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "3vh",
      marginLeft: "-1vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "3.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "3.5vh",
    },
  },
  select: {
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "2vh",
      // marginTop: "-1vh",
    },
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4",
      borderRadius: "8px",
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
    },
  },
  switchselector: {
    height: "3.5vh",
    [theme.breakpoints.down("sm")]: {
      width: "8.5vh",
    },
    [theme.breakpoints.up("md")]: {
      width: "13vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: "10.5vh",
    },
    [theme.breakpoints.up("xl")]: {
      width: "10.5vh",
    },
  },
  semicircularbar: {
    height: "12vh",
    borderRadius: "6px",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    // boxShadow: '0px 4px 20px #0123B41A;',
    // borderRadius: '14px',
    opacity: "1",
  },
  graphpaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "27.3vh",
    textAlign: "center",
    color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // borderRadius: '14px',
  },
  // controlcard: {
  //   background:'#FFFFFF 0% 0% no-repeat padding-box',
  //   height: "30.5vh",
  //   textAlign: 'center',
  //   color: theme.palette.text.secondary,
  //   boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
  //   backgroundColor:"#fcfafa",
  //   // boxShadow: '0px 4px 20px #0123B41A',
  //   borderRadius: '6px',
  // },
  graphpaper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "28vh",
    textAlign: "center",
    color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // borderRadius: '14px',
  },
  text: {
    fontSize: "14px",
    color: " #292929",
    fontFamily: "Arial",
  },
  control1: {
    width: "6vh",
    marginTop: "0vh",
    marginLeft: "-11vh",
    fontFamily: "Arial",
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  paper1: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  CardHeadFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      fontSize: "1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      fontSize: "1.9vh",
      borderRadius: "10px",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      fontSize: "1.7vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      fontSize: "1.8vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      fontSize: "1.7vh",
    },
  },
  controls_text: {
    display: "flex",
    "@media (min-width:0px) and (max-width:599.95px)": {
      //xs
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      //sm
      // textAlign: 'left',
      // fontSize: '2vh',
      // color: '#292929'
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      //md
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      //lg
      // textAlign: 'left',
      // fontSize: '1.7vh',
      // color: '#292929'
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      //xl
      // textAlign: 'left',
      fontSize: "2vh",
      // color: ''
    },
  },
}));

export default function GlChillerPage(props) {
  // console.log("props in glchillerpage",props.graphsCard)
  const classes = useStyles();
  const mapRef = React.createRef();
  const [roleId, setRoleId] = React.useState(props.role_id);
  const [eqpType, setEqpType] = useState(props.eqpType);
  const [imageParams, setImageParams] = React.useState(props.imageParams);
  const [controlsCard, setControlsCard] = React.useState(props.controlsCard);
  const [controlsCardLeft1, setControlsCardLeft1] = React.useState(
    props.controlsCardLeft1
  );
  const [controlsCardLeft2, setControlsCardLeft2] = React.useState(
    props.controlsCardLeft2
  );
  const [controlsCardLeft3, setControlsCardLeft3] = React.useState(
    props.controlsCardLeft3
  );

  const [paramsCard, setParamsCard] = React.useState(props.paramsCard);
  const [graphsCard, setgraphsCard] = useState(props.graphsCard);
  const [checkEqpActiveParam, setcheckEqpActiveParam] = React.useState(
    props.checkEqpActiveParam
  );
  const [checkEqpAMStatusChiller, setCheckEqpAMStatusChiller] = React.useState(
    props.checkEqpAMStatusChiller
  );
  const [deviceImage, setDeviceImage] = useState(false);
  const [allEquipmentData, setAllEquipmentData] = React.useState([]);
  const [particularEquipDataSet1, setParticularEquipDataSet1] = useState([]);
  const [particularEquipDataSet2, setParticularEquipDataSet2] = useState([]);
  const [particularEquipDataSet3, setParticularEquipDataSet3] = useState([]);
  const [particularEquipDataSet5, setParticularEquipDataSet5] = useState([]);
  const [particularEquipDataSet6, setParticularEquipDataSet6] = useState([]);
  const [particularEquipDataSet7, setParticularEquipDataSet7] = useState([]);
  const [particularEquipAMStatus, setParticularEquipAMStatus] = useState(false);
  const [eqpGraphList, setEqpGraphList] = useState({});
  const [eqp1dayGraphList, setEqp1dayGraphList] = useState({});
  const [chillerOnOff, setChillerOnOff] = React.useState(0);
  const [selectedChId, setSelectedChId] = useState(null);
  const selectedChIdRef = useRef(selectedChId);
  const [selectedChName, setSelectedChName] = useState("");
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const [chillerAlarm, setChillerAlarm] = React.useState([]);
  const [selectedChAlarm, setSelectedChAlarm] = useState(
    "DP high and SP normal"
  );
  const [disable, setDisable] = useState(false);
  const [onOff1, setOnOff1] = useState(2);
  const [remoteLocal, setRemoteLocal] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [setPointvalue, setSetPointvalue] = useState("");
  const [chillerExtraParams, setChillerExtraParams] = useState([]);
  const [chillerTrKwData, setChillerTrKwData] = useState([]);
  const CPM_Status = localStorage.getItem("CPM_AM_Status");
  const CPM_Override_Status = localStorage.getItem("CPM_Override_Status");
  const CPO_OverAllStatus = localStorage.getItem("CPO_OverAllStatus");

  useEffect(() => {
    if (!selectedChId && props.initialState) {
      const init = Object.values(allEquipmentData || {}).find(
        (i) => i.name === props.initialState
      );
      if (init) {
        setSelectedChId(init.id);
        setSelectedChName(init.name);
      }
    }
  }, [props.initialState, allEquipmentData]);

  // Watch for changes to props.chillerExtraParams and re-fetch equipment data
  useEffect(() => {
    if (
      selectedChId &&
      props.chillerExtraParams &&
      Object.keys(props.chillerExtraParams).length > 0
    ) {
      // console.log(
      //   "[GlCPMEqpType1] chillerExtraParams updated, refreshing equipment data"
      // );
      // Trigger equipment data fetch
      api.floor.cpmGetDevData().then((resp) => {
        Object.values(resp[eqpType]).map((res) => {
          if (selectedChIdRef.current === res.id) {
            // console.log(
            //   "[GlCPMEqpType1] Re-processing with updated chillerExtraParams"
            // );
            // Re-process imageParams with new data
            let eqpParams1 = [];
            imageParams.forEach((respp) => {
              const attribute = res.Eqp_Attributes[respp.parameter];
              if (attribute !== undefined) {
                eqpParams1.push({
                  ...respp,
                  value: formatter1.format(attribute.presentValue),
                  unit: respp.unit,
                });
              } else if (
                props.chillerExtraParams[respp.parameter] !== undefined
              ) {
                // console.log(
                //   "parammm",
                //   respp.parameter,
                //   "=",
                //   props.chillerExtraParams[respp.parameter]
                // );
                eqpParams1.push({
                  ...respp,
                  value: formatter1.format(
                    props.chillerExtraParams[respp.parameter]
                  ),
                  unit: respp.unit,
                });
              } else {
                eqpParams1.push({
                  ...respp,
                  value: "-",
                  unit: respp.unit,
                });
              }
            });
            setParticularEquipDataSet1(eqpParams1);
          }
        });
      });
    }
  }, [props.chillerExtraParams, selectedChId]);

  // Update selectedChId when props.initialState1 changes (e.g., on component mount or route change)
  useEffect(() => {
    if (props.initialState1) {
      // console.log(
      //   "[GlCPMEqpType1] Setting selectedChId from props.initialState1:",
      //   props.initialState1
      // );
      setSelectedChId(props.initialState1);
    }
  }, [props.initialState1]);

  // Immediately fetch graph data when selectedChId changes
  useEffect(() => {
    if (selectedChId) {
      // console.log(
      //   "[GlCPMEqpType1] Fetching graph data for selectedChId:",
      //   selectedChId
      // );
      let req = {
        startdate: "start",
        enddate: "end",
      };
      api.floor
        .getDeviceData(req, selectedChId, eqpType, "1 week")
        .then((response) => {
          // console.log("[GlCPMEqpType1] Graph data fetched successfully");
          setEqpGraphList(response.graphData[0]);
        })
        .catch((error) => {
          // console.log("[GlCPMEqpType1] Error fetching graph data:", error);
          if (error.response?.data?.message) {
            setErrmsg(error.response.data.message);
          }
        });
    }
  }, [selectedChId]);

  const shouldDisable1 =
    CPM_Status === "true" &&
    remoteLocal === 1 &&
    particularEquipAMStatus === true;
  const shouldDisable2 =
    CPM_Status === "false" &&
    (remoteLocal === 0 || remoteLocal === 1) &&
    particularEquipAMStatus === true;
  const shouldDisable3 =
    CPM_Status == "false" &&
    remoteLocal === 1 &&
    particularEquipAMStatus == true;
  // console.log(
  //   "CPM_Status",
  //   CPM_Status,
  //   typeof CPM_Status,
  //   "remoteLocal",
  //   remoteLocal,
  //   typeof remoteLocal,
  //   "particularEquipAMStatus",
  //   particularEquipAMStatus,
  //   typeof particularEquipAMStatus
  // );
  // console.log(
  //   "shouldDisable1",
  //   shouldDisable1,
  //   "shouldDisable2",
  //   shouldDisable2,
  //   "shouldDisable3",
  //   shouldDisable3
  // );
  console.log("CPM_Status Type:", typeof CPM_Status, "Value:", CPM_Status);

  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(0, 0),
    className: "leaflet-div-icon-2",
  });
  const iconDevice2 = new Leaflet.Icon({
    // iconUrl: require("../../assets/img/Chiller_run_gif.gif"),
    iconSize: new Leaflet.Point(160, 190),
    className: "leaflet-div-icon-2",
  });
  const iconDevice3 = new Leaflet.Icon({
    // iconUrl: require("../../assets/img/Chiller_trip_gif.gif"),
    iconSize: new Leaflet.Point(160, 190),
    className: "leaflet-div-icon-2",
  });

  const formatter1 = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const modeOptions = [
    {
      selectedFontColor: "white",
      label: "Yes",
      value: 0,
      selectedBackgroundColor: "green",
    },
    {
      selectedFontColor: "white",
      label: "No",
      value: 1,
      selectedBackgroundColor: "grey",
    },
    //  {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "#0123B4",
    // }
  ];
  const options = [
    {
      selectedFontColor: "white",
      label: "OFF",
      value: 0,
      selectedBackgroundColor: "gray",
    },
    {
      selectedFontColor: "white",
      label: "ON",
      value: 1,
      selectedBackgroundColor: "green",
    },
    //  {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "#0123B4",
    // }
  ];

  const options1 = [
    {
      selectedFontColor: "white",
      label: "Close",
      value: 0,
      selectedBackgroundColor: "gray",
    },
    {
      selectedFontColor: "white",
      label: "Open",
      value: 1,
      selectedBackgroundColor: "green",
    },
    //  {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "#0123B4",
    // }
  ];

  const handleLocationClick = (name) => {
    props.history.push(`/admin/Glschedule`);
  };

  const handleChillerChange = (name, id) => {
    // console.log("idddd HCC",id,name)
    setSelectedChId(id);
    setSelectedChName(name);
    Object.values(allEquipmentData).map((res) => {
      if (id === res.id) {
        let eqpParams1 = [];
        const chillerReLo = res.Eqp_Metrics.Equipment_mode == true ? 0 : 1;
        setRemoteLocal(chillerReLo);
        const chillerStatus = res.Eqp_Attributes["CH_Run_SS"]?.presentValue;
        const isChillerActive = chillerStatus === "active";
        setcheckEqpActiveParam(isChillerActive);
        imageParams.forEach((respp) => {
          const attribute = res.Eqp_Attributes[respp.parameter];
          if (attribute !== undefined) {
            eqpParams1.push({
              ...respp,
              value: formatter1.format(attribute.presentValue),
              unit: respp.unit,
            });
          } else if (props.chillerExtraParams[respp.parameter] !== undefined) {
            // Check in chillerExtraParams if not found in Eqp_Attributes
            // console.log(
            //   "CH_kW_per_TR in chillerExtraParams:",
            //   respp.parameter,
            //   "=",
            //   props.chillerExtraParams[respp.parameter]
            // );
            eqpParams1.push({
              ...respp,
              value: formatter1.format(
                props.chillerExtraParams[respp.parameter]
              ),
              unit: respp.unit,
            });
          } else {
            // If value not found in either source, still add it with "-"
            // console.log(
            //   "Parameter not found:",
            //   respp.parameter,
            //   "Title:",
            //   respp.title,
            //   "Available in props.chillerExtraParams:",
            //   Object.keys(props.chillerExtraParams || {})
            // );
            eqpParams1.push({
              ...respp,
              value: "-",
              unit: respp.unit,
            });
          }
        });
        setParticularEquipDataSet1(eqpParams1);
        setDeviceImage(true);

        let eqpParams2 = [];
        controlsCard.map((respp) => {
          let value = respp.defaultValue;
          if (res.Eqp_Metrics[respp.parameter] !== undefined) {
            value = res.Eqp_Metrics[respp.parameter];
          } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
            value = res.Eqp_Attributes[respp.parameter].presentValue;
          }
          eqpParams2.push({
            ...respp,
            value,
            value2:
              respp.parameter2 && res.Eqp_Attributes[respp.parameter2]
                ? !isNaN(
                    parseFloat(
                      res.Eqp_Attributes[respp.parameter2].presentValue
                    )
                  )
                  ? formatter.format(
                      res.Eqp_Attributes[respp.parameter2].presentValue
                    )
                  : res.Eqp_Attributes[respp.parameter2].presentValue
                : "-", // Add value here
          });
          setParticularEquipDataSet2(eqpParams2);
        });

        let eqpParams3 = [];
        paramsCard.map((respp) => {
          if (res.Eqp_Attributes[respp.parameter] != undefined) {
            eqpParams3.push({
              ...respp,
              value: formatter1.format(
                res.Eqp_Attributes[respp.parameter].presentValue
              ),
            });
          } else {
            eqpParams3.push({
              ...respp,
              value: respp.defaultValue,
            });
          }
        });
        setParticularEquipDataSet3(eqpParams3);

        let eqpParams4 = "";
        checkEqpAMStatusChiller.forEach((respp) => {
          const attr = res?.Eqp_Attributes?.[respp.parameter];
          if (attr && attr.presentValue !== undefined) {
            const pv = attr.presentValue;
            eqpParams4 = !isNaN(parseFloat(pv))
              ? Math.round(pv == "active" ? true : false)
              : pv == "active"
              ? true
              : false;
          }
        });
        setParticularEquipAMStatus(eqpParams4);

        // let eqpParams5 = [];
        // controlsCardLeft1.map((respp) => {
        //   const attribute = res.Eqp_Attributes[respp.parameter];
        //   if (attribute !== undefined) {
        //     eqpParams1.push({
        //       ...respp,
        //       value: formatter1.format(attribute.presentValue),
        //       unit: respp.unit,
        //     });
        //   }
        //   // setParticularEquipDataSet5(eqpParams5);
        // });
        // setParticularEquipDataSet5(eqpParams5);
        // let eqpParams6 = [];
        // controlsCardLeft2.map((respp) => {
        //   const attribute = res.Eqp_Attributes[respp.parameter];
        //   if (attribute !== undefined) {
        //     eqpParams1.push({
        //       ...respp,
        //       value: formatter1.format(attribute.presentValue),
        //       unit: respp.unit,
        //     });
        //   }
        //   // setParticularEquipDataSet6(eqpParams6);
        // });
        // setParticularEquipDataSet6(eqpParams6);

        // let eqpParams7 = [];
        // controlsCardLeft3.map((respp) => {
        //   const attribute = res.Eqp_Attributes[respp.parameter];
        //   if (attribute !== undefined) {
        //     eqpParams1.push({
        //       ...respp,
        //       value: formatter1.format(attribute.presentValue),
        //       unit: respp.unit,
        //     });
        //   }
        // });
        // setParticularEquipDataSet7(eqpParams7);

        if (id) {
          // console.log("idddddddddddd",id)
          let req = {
            startdate: "start",
            enddate: "end",
          };
          api.floor
            .getDeviceData(req, res.id, eqpType, "1 week")
            .then((response) => {
              // console.log("response graph data", response);
              setEqpGraphList(response.graphData[0]);
            })
            .catch((error) => {
              // setOpenerr(true)
              if (error.response) {
                setErrmsg(error.response.data.message);
              } else {
                setErrmsg("");
              }
            });
          // api.floor
          //   .getDeviceData(id, eqpType, "1 DAY")
          //   .then((response) => {
          //     setEqp1dayGraphList(response.graphData[0]);
          //   })
          //   .catch((error) => {
          //     //   setOpenerr(true)
          //     if (error.response.data.message) {
          //       setErrmsg(error.response.data.message);
          //     } else {
          //       setErrmsg("");
          //     }
          //   });
        }
      }
    });
  };

  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg("");
  };

  const handleChillerAlarmChange = (message, id) => {
    let data = {
      id: id,
      message: message,
    };
    setSelectedChAlarm(data);
  };

  const handleSubmitAlarmClick = (data) => {
    // let ss_id = selectedChId, message = data.message
    const req = {
      ss_id: selectedChId,
      message: data.message,
    };
    if (selectedChId && data.message) {
      setDisable(true);
      setTimeout(() => {
        setDisable(false);
      }, 5000);

      api.floor
        .insertSelectedChillerAlarm(req)
        .then((res) => {
          // console.log("api resp",res)
          // setOpenerr(true)
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: "Fault injected",
            time: 3000,
          });
        })
        .catch((error) => {
          //   setOpenerr(true)
          if (error.response.data.message) {
            setErrmsg(error.response.data.message);
          } else {
            setErrmsg("");
          }
        });
    } else {
      if (selectedChId != undefined) {
        setOpenerr(true);
        setErrmsg("Invalid");
      } else if (data.message) {
        setOpenerr(true);
        setErrmsg("Please select the fault");
      }
    }
  };

  useEffect(() => {
    // console.log("selectedChId",selectedChId)
    selectedChIdRef.current = selectedChId;
    api.floor
      .cpmGetDevData()
      .then((res) => {
        if (res[eqpType]) {
          let data = Object.values(res[eqpType]).sort(function (a, b) {
            return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
          });
          setAllEquipmentData(data);
          setDeviceImage(true);
        }
        Object.values(res[eqpType]).map((res) => {
          if (selectedChIdRef.current === res.id) {
            let eqpParams1 = [];
            const chillerReLo = res.Eqp_Metrics.Equipment_mode == true ? 0 : 1;
            setRemoteLocal(chillerReLo);
            const chillerStatus =
              res.Eqp_Attributes["sts_on_off_00"]?.presentValue;
            const isChillerActive = chillerStatus === "active";
            setcheckEqpActiveParam(isChillerActive);
            imageParams.forEach((respp) => {
              const attribute = res.Eqp_Attributes[respp.parameter];
              // console.log(
              //   "qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq",
              //   res,
              //   respp
              // );
              // console.log(
              //   "aaaaaaaaaaaaaaaaaaaaaaaaa",
              //   res.Eqp_Attributes,
              //   "reeeeeeeeeeeeeeeeeeeeeeeee",
              //   respp
              // );
              if (attribute !== undefined) {
                eqpParams1.push({
                  ...respp,
                  value: formatter1.format(attribute.presentValue),
                  unit: respp.unit,
                });
              } else if (
                props.chillerExtraParams[respp.parameter] !== undefined
              ) {
                // console.log(
                //   "Found in chillerExtraParams:",
                //   respp.parameter,
                //   props.chillerExtraParams[respp.parameter]
                // );
                // Check in chillerExtraParams if not found in Eqp_Attributes
                eqpParams1.push({
                  ...respp,
                  value: formatter1.format(
                    props.chillerExtraParams[respp.parameter]
                  ),
                  unit: respp.unit,
                });
              }
            });
            setParticularEquipDataSet1(eqpParams1);

            let eqpParams2 = [];
            // controlsCard.map((respp) => {
            //
            //       eqpParams2.push({
            //       ...respp,
            //       value: res.Eqp_Metrics[respp.parameter] // Add value here
            //     })
            //   }
            //   console.log("bfr............",eqpParams2)
            //  if (res.Eqp_Attributes[respp.parameter] != undefined){
            //    console.log("---------------->><<",respp.parameter)
            //     eqpParams2.push({
            //       ...respp,
            //       value: res.Eqp_Attributes[respp.parameter].presentValue // Add value here
            //     })
            //     console.log("............",eqpParams2)
            //   }else{
            //     eqpParams2.push({ ...respp,value: respp.defaultValue})
            //   }
            // })
            controlsCard.map((respp) => {
              let value = respp.defaultValue;
              if (res.Eqp_Metrics[respp.parameter] !== undefined) {
                value = res.Eqp_Metrics[respp.parameter];
              } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                value = res.Eqp_Attributes[respp.parameter].presentValue;
              }
              eqpParams2.push({
                ...respp,
                value,
                value2:
                  respp.parameter2 && res.Eqp_Attributes[respp.parameter2]
                    ? !isNaN(
                        parseFloat(
                          res.Eqp_Attributes[respp.parameter2].presentValue
                        )
                      )
                      ? formatter.format(
                          res.Eqp_Attributes[respp.parameter2].presentValue
                        )
                      : res.Eqp_Attributes[respp.parameter2].presentValue
                    : "-", // Add value here
              });
              setParticularEquipDataSet2(eqpParams2);
            });

            let eqpParams3 = [];
            paramsCard.map((respp) => {
              if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                // ✅ Check in Eqp_Attributes
                eqpParams3.push({
                  ...respp,
                  value: formatter1.format(
                    res.Eqp_Attributes[respp.parameter].presentValue
                  ), // ✅ Correct source
                });
              } else {
                eqpParams3.push({
                  ...respp,
                  value: respp.defaultValue,
                });
              }
            });
            setParticularEquipDataSet3(eqpParams3);

            let eqpParams4 = "";
            checkEqpAMStatusChiller.forEach((respp) => {
              const attr = res?.Eqp_Attributes?.[respp.parameter];
              if (attr && attr.presentValue !== undefined) {
                const pv = attr.presentValue;
                eqpParams4 = !isNaN(parseFloat(pv))
                  ? Math.round(pv == "active" ? true : false)
                  : pv == "active"
                  ? true
                  : false; // Add value here
              }
            });
            setParticularEquipAMStatus(eqpParams4);

            // let eqpParams5 = [];
            // controlsCardLeft1.map((respp) => {
            //   const attribute = res.Eqp_Attributes[respp.parameter];
            //   // console.log("attribute--------------------", res, attribute);
            //   if (attribute !== undefined) {
            //     eqpParams1.push({
            //       ...respp,
            //       value: formatter1.format(attribute.presentValue),
            //       unit: respp.unit,
            //     });
            //   }
            //   // let value = respp.defaultValue;
            //   // if (res.Eqp_Attributes[respp.parameter] !== undefined) {
            //   //   value = res.Eqp_Attributes[respp.parameter];
            //   // } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
            //   //   value = res.Eqp_Attributes[respp.parameter].presentValue;
            //   // }
            //   // eqpParams5.push({
            //   //   ...respp,
            //   //   value,
            //   // });
            //   // setParticularEquipDataSet5(eqpParams5);
            // });
            // // console.log("eqpParams5", eqpParams5);
            // setParticularEquipDataSet5(eqpParams5);
            // let eqpParams6 = [];
            // controlsCardLeft2.map((respp) => {
            //   const attribute = res.Eqp_Attributes[respp.parameter];
            //   if (attribute !== undefined) {
            //     eqpParams1.push({
            //       ...respp,
            //       value: formatter1.format(attribute.presentValue),
            //       unit: respp.unit,
            //     });
            //   }
            //   // setParticularEquipDataSet6(eqpParams6);
            // });
            // setParticularEquipDataSet6(eqpParams6);
            // let eqpParams7 = [];
            // controlsCardLeft3.map((respp) => {
            //   const attribute = res.Eqp_Attributes[respp.parameter];
            //   if (attribute !== undefined) {
            //     eqpParams1.push({
            //       ...respp,
            //       value: formatter1.format(attribute.presentValue),
            //       unit: respp.unit,
            //     });
            //   }
            // });
            // setParticularEquipDataSet7(eqpParams7);
            if (res.id) {
              let req = {
                startdate: "start",
                enddate: "end",
              };
              api.floor
                .getDeviceData(req, res.id, eqpType, "1 week")
                .then((response) => {
                  setEqpGraphList(response.graphData[0]);
                })
                .catch((error) => {
                  // setOpenerr(true)
                  if (error.response) {
                    setErrmsg(error.response.data.message);
                  } else {
                    setErrmsg("");
                  }
                });
            }
          }
        });
      })
      .catch((error) => {
        // console.log("errrrrrrrrrrrrr",error)
        //   setOpenerr(true)
        // if(error.response){
        //   setErrmsg(error.response.data.message)
        //   }else{
        //     setErrmsg('')
        //   }
      });
    api.floor.getChillerExtraParameters().then((res) => {
      let data = [];
      res.map((re) => {
        if (re.ss_id == selectedChId) {
          data.push(re);
        }
      });
      setChillerExtraParams(data);
      // console.log("daaaaaaaaaaaaaaaaaa", data);
    });
    if (selectedChId) {
      const payload = {
        ss_id: selectedChId,
        ss_type: eqpType,
      };

      api.floor
        .getChillerikw(payload)
        .then((res) => {
          setChillerTrKwData(res);
        })
        .catch((error) => {
          console.error("Error fetching TR/KW data:", error);
        });
    }
    let chillAlarm = [
      {
        id: "1",
        alarm: "DP high and SP normal",
        Todisplay: "Fault-1",
      },
      {
        id: "2",
        alarm: "DP high and SP high",
        Todisplay: "Fault-2",
      },
      {
        id: "3",
        alarm: "DP normal, SP low and DT normal",
        Todisplay: "Fault-3",
      },
      {
        id: "4",
        alarm: "DP low and SP low",
        Todisplay: "Fault-4",
      },
      {
        id: "5",
        alarm: "DP normal, SP high and DT low",
        Todisplay: "Fault-5",
      },
      {
        id: "6",
        alarm: "DP normal, SP low and DT high",
        Todisplay: "Fault-6",
      },
      {
        id: "7",
        alarm: "DP normal, SP normal and DT high",
        Todisplay: "Fault-7",
      },
    ];
    setChillerAlarm(chillAlarm);

    const timer = setInterval(() => {
      console.log('selectedChId in interval------------>',selectedChIdRef.current)
      if (selectedChIdRef.current) {
        // console.log("ppppppppppppppppppppppppppppppppppp")
        api.floor
          .cpmGetDevData()
          .then((resp) => {
            Object.values(resp[props.eqpType]).map((res) => {
              if (selectedChIdRef.current === res.id) {
                let eqpParams1 = [];
                const chillerReLo =
                  res.Eqp_Metrics.Equipment_mode == true ? 0 : 1;
                setRemoteLocal(chillerReLo);
                const chillerStatus =
                  res.Eqp_Attributes["sts_on_off_00"]?.presentValue;
                const isChillerActive = chillerStatus === "active";
                setcheckEqpActiveParam(isChillerActive);
                imageParams.forEach((respp) => {
                  const attribute = res.Eqp_Attributes[respp.parameter];

                  if (attribute !== undefined) {
                    eqpParams1.push({
                      ...respp,
                      value: formatter1.format(attribute.presentValue),
                      unit: respp.unit,
                      // value: isChillerActive
                      //   ? formatter1.format(attribute.presentValue)
                      //   : "-",
                      // unit: isChillerActive ? respp.unit : "",
                    });
                  } else if (
                    props.chillerExtraParams[respp.parameter] !== undefined
                  ) {
                    // Check in chillerExtraParams if not found in Eqp_Attributes
                    // console.log(
                    //   "Found in chillerExtraParams:",
                    //   respp.parameter,
                    //   props.chillerExtraParams[respp.parameter]
                    // );
                    eqpParams1.push({
                      ...respp,
                      value: formatter1.format(
                        props.chillerExtraParams[respp.parameter]
                      ),
                      unit: respp.unit,
                    });
                  } else {
                    // If value not found in either source, still add it with "-"
                    eqpParams1.push({
                      ...respp,
                      value: "-",
                      unit: respp.unit,
                    });
                  }
                });
                setParticularEquipDataSet1(eqpParams1);

                let eqpParams2 = [];
                controlsCard.map((respp) => {
                  console.log("respp--------------------", res, respp);
                  let value = respp.defaultValue;
          if (res.Eqp_Metrics[respp.parameter] !== undefined) {
            value = res.Eqp_Metrics[respp.parameter];
          } else if (res.Eqp_Attributes[respp.parameter] !== undefined) {
            value = res.Eqp_Attributes[respp.parameter].presentValue;
          }

                  eqpParams2.push({
                    ...respp,
                    value,
                    value2:
                      respp.parameter2 && res.Eqp_Attributes[respp.parameter2]
                        ? !isNaN(
                            parseFloat(
                              res.Eqp_Attributes[respp.parameter2].presentValue
                            )
                          )
                          ? formatter.format(
                              res.Eqp_Attributes[respp.parameter2].presentValue
                            )
                          : res.Eqp_Attributes[respp.parameter2].presentValue
                        : "-", // Add value here
                  });
                  console.log("bfr............", eqpParams2);
                  // setParticularEquipDataSet2(eqpParams2);
                });
                setParticularEquipDataSet2(eqpParams2);

                let eqpParams3 = [];
                paramsCard.map((respp) => {
                  if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                    eqpParams3.push({
                      ...respp,
                      value: formatter1.format(
                        res.Eqp_Attributes[respp.parameter].presentValue
                      ),
                    });
                  } else {
                    eqpParams3.push({
                      ...respp,
                      value: respp.defaultValue,
                    });
                  }
                });
                setParticularEquipDataSet3(eqpParams3);

                let eqpParams4 = "";
                checkEqpAMStatusChiller.forEach((respp) => {
                  const attr = res?.Eqp_Attributes?.[respp.parameter];
                  if (attr && attr.presentValue !== undefined) {
                    const pv = attr.presentValue;
                    eqpParams4 = !isNaN(parseFloat(pv))
                      ? Math.round(pv == "active" ? true : false)
                      : pv == "active"
                      ? true
                      : false; // Add value here
                  }
                });
                setParticularEquipAMStatus(eqpParams4);

                let eqpParams5 = [];
                controlsCardLeft1.map((respp) => {
                  let value = respp.defaultValue;
                  if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                    value = res.Eqp_Attributes[respp.parameter];
                  } else if (
                    res.Eqp_Attributes[respp.parameter] !== undefined
                  ) {
                    value = res.Eqp_Attributes[respp.parameter].presentValue;
                  }
                  eqpParams5.push({
                    ...respp,
                    value,
                  });
                  // setParticularEquipDataSet5(eqpParams5);
                });
                setParticularEquipDataSet5(eqpParams5);
                let eqpParams6 = [];
                controlsCardLeft2.map((respp) => {
                  let value = respp.defaultValue;
                  if (res.Eqp_Attributes[respp.parameter] !== undefined) {
                    value = res.Eqp_Attributes[respp.parameter];
                  } else if (
                    res.Eqp_Attributes[respp.parameter] !== undefined
                  ) {
                    value = res.Eqp_Attributes[respp.parameter].presentValue;
                  }
                  const existingIndex = eqpParams6.findIndex(
                    (item) => item.parameter === respp.parameter
                  );
                  if (existingIndex !== -1) {
                    eqpParams6[existingIndex] = {
                      ...respp,
                      value,
                    };
                  } else {
                    eqpParams6.push({
                      ...respp,
                      value,
                    });
                  }
                  // eqpParams6.push({ ...respp, value });
                  // setParticularEquipDataSet6(eqpParams6);
                });
                setParticularEquipDataSet6(eqpParams6);
                // let eqpParams7 = [];
                // controlsCardLeft3.map((respp) => {
                //   const attribute = res.Eqp_Attributes[respp.parameter];
                //   if (attribute !== undefined) {
                //     eqpParams1.push({
                //       ...respp,
                //       value: formatter1.format(attribute.presentValue),
                //       unit: respp.unit,
                //     });
                //   }
                // });
                // setParticularEquipDataSet7(eqpParams7);
                // cnsl.lg("selectedChIdRef.current",selectedChIdRef.current)
                if (selectedChIdRef.current) {
                  let req = {
                    startdate: "start",
                    enddate: "end",
                  };
                  api.floor
                    .getDeviceData(
                      req,
                      selectedChIdRef.current,
                      eqpType,
                      "1 week"
                    )
                    .then((response) => {
                      setEqpGraphList(response.graphData[0]);
                    })
                    .catch((error) => {
                      //   setOpenerr(true)
                      if (error.response.data.message) {
                        setErrmsg(error.response.data.message);
                      } else {
                        setErrmsg("");
                      }
                    });
                  // api.floor
                  //   .getDeviceData(selectedChIdRef.current, eqpType, "1 DAY")
                  //   .then((response) => {
                  //     setEqp1dayGraphList(response.graphData[0]);
                  //   })
                  //   .catch((error) => {
                  //     //   setOpenerr(true)
                  //     if (error.response.data.message) {
                  //       setErrmsg(error.response.data.message);
                  //     } else {
                  //       setErrmsg("");
                  //     }
                  //   });
                }
              }
            });
          })
          .catch((error) => {
            //   setOpenerr(true)
            if (error.response) {
              setErrmsg(error.response.data.message);
            } else {
              setErrmsg("");
            }
          });
        api.floor.getChillerExtraParameters().then((res) => {
          let data = [];
          res.map((re) => {
            if (re.ss_id == selectedChIdRef.current) {
              data.push(re);
            }
          });
          setChillerExtraParams(data);
          // console.log("daaaaaaaaaaaaaaaaaa", data);
        });
        if (selectedChIdRef.current) {
          const payload = {
            ss_id: selectedChIdRef.current,
            ss_type: props.eqpType,
          };

          api.floor
            .getChillerikw(payload)
            .then((res) => {
              setChillerTrKwData(res);
            })
            .catch((error) => {
              console.error("Error fetching TR/KW data:", error);
            });
        }
        let req = {
          startdate: "start",
          enddate: "end",
        };
        api.floor
          .getDeviceData(req, selectedChIdRef.current, eqpType, "1 week")
          .then((response) => {
            setEqpGraphList(response.graphData[0]);
          })
          .catch((error) => {
            // setOpenerr(true)
            if (error.response) {
              setErrmsg(error.response.data.message);
            } else {
              setErrmsg("");
            }
          });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedChId, props.initialState1]);

  // const onChange = (newValue) => {
  //   setChillerOnOff(newValue)
  //   let id= selectedChId;
  //   let action= newValue == 0? "TURN_OFF_CHILLER":"TURN_ON_CHILLER";
  //   let ss_type= "NONGL_SS_CHILLER";
  //   let param_id= eqpType=='NONGL_SS_AHU'?'SAF_VFD_On_Off_Fbk':'FAU_On_Off'
  //   let req={
  //       id,
  //       action,
  //       ss_type
  //   }
  //   api.floor.cpmOnOffControl(req).then((response)=>{
  //     setChillerOnOff(response.startsWith('Working with a Scenario')?(newValue == 0?1:0):newValue)
  //     toast({
  //       type:  response.startsWith('Working with a Scenario')?"error":"success",
  //       icon:  response.startsWith('Working with a Scenario')?"exclamation triangle":"check circle",
  //       title: response.startsWith('Working with a Scenario')?"Error":"Success",
  //       description: response,
  //       time: 2000,
  //     });

  //   })
  //   .catch((err)=>{
  //   //   setOpenerr(true)
  //     setErrmsg(err)
  //   })
  // };

  const onChangeMode = (newValue) => {
    let id = selectedChId;
    const Equipment_mode = newValue === 0 ? true : false;

    const req = {
      id,
      ss_type: eqpType,
      Equipment_mode,
    };

    api.floor
      .chillerMode(req)
      .then((res) => {
        if (res) {
          setRemoteLocal(newValue);
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: `Successfully controlled`,
            time: 2000,
          });
        }
      })
      .catch((error) => {
        if (error.response) {
          setSnackbarOpen(true);
          setErrorMsg(error.response.data.message);
        }
      });
  };

  const onChange = (newValue) => {
    // setChillerOnOff(newValue)
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 3000);

    let id = selectedChId;
    const msg = newValue === 1 ? "ON" : "OFF";
    const va = 1; // Always 1 for both ON and OFF
    const gl_command = newValue === 1 ? "active" : "inactive";

    setOnOff1(va);

    const req = {
      ss_type: props.eqpType,
      ss_id: id,
      param_id: props.eqpType === "NONGL_SS_CHILLER" ? "cmd_on_off_00" : "",
      gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };

    api.floor
      .cpmOnOffControl(req)
      .then((res) => {
        // console.log("newValue", res);

        if (res.message === "please connect to network") {
          setOnOff1(va === 1 ? 0 : 1);
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            description: "Connect to network",
            time: 2000,
          });
        } else if (req.ss_id) {
          let requestID = req.ss_id;
          setOnOff1(va);
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: `Successfully controlled: ${msg}`,
            time: 2000,
          });
          const checkCommandStatus = (requestID, startTime = Date.now()) => {
            api.floor
              .checkCommandStatus(requestID)
              .then((res) => {
                // console.log("commansattaus",res)
                if (res[0].status === "success") {
                  // Command was successful, stop further API calls
                  // console.log("Command succeeded");
                  toast({
                    type: "success",
                    icon: "check circle",
                    title: "Command Status",
                    description: "Command processed successfully",
                    time: 2000,
                  });
                } else if (res[0].status === "pending") {
                  // console.log("Command is still Pending");
                  const elapsedTime = Date.now() - startTime;

                  if (elapsedTime < 30000) {
                    // console.log(
                    //   " If less than 30 seconds have passed, keep checking every 3 seconds"
                    // );
                    setTimeout(
                      () => checkCommandStatus(requestID, startTime),
                      3000
                    );
                  } else {
                    // console.log(
                    //   "Stop checking after 30 seconds and show a timeout message"
                    // );
                    console.log("Command timed out after 30 seconds.");
                    toast({
                      type: "error",
                      icon: "clock",
                      title: "Timeout",
                      description: "Command is still pending after 30 seconds.",
                      time: 5000,
                    });
                  }
                }
              })
              .catch((error) => {
                console.error("Error checking command status:", error);
                // toast({
                //   type: "error",
                //   icon: "exclamation triangle",
                //   title: "Error",
                //   description: "Error while checking command status",
                //   time: 2000,
                // });
              });
          };

          checkCommandStatus(requestID);
        }
      })
      .catch((error) => {
        if (error.response) {
          setSnackbarOpen(true);
          setErrorMsg(error.response.data.message);
        }
      });
  };

  const onChange1 = (newValue, parameter) => {
    // setChillerOnOff(newValue)
    setDisable(true);
    setTimeout(() => {
      setDisable(false);
    }, 30000);

    let id = selectedChId;
    const msg = newValue === 1 ? "ON" : "OFF";
    const va = 1; // Always 1 for both ON and OFF
    const gl_command = newValue === 1 ? "active" : "inactive";

    setOnOff1(va);

    const req = {
      ss_type: props.eqpType,
      ss_id: id,
      // param_id:
      //   props.eqpType === "NONGL_SS_CHILLER"
      //     ? "CH_Out_Vlv_On_Off"
      //     : "CD_In_Vlv_On_Off",
      param_id: parameter,
      gl_command: gl_command,
      value: msg,
      zone_type: null,
      zone_id: null,
      commandFrom: "UI",
    };

    api.floor
      .cpmOnOffControl(req)
      .then((res) => {
        console.log("newValue", res);

        if (res.message === "please connect to network") {
          setOnOff1(va === 1 ? 0 : 1);
          toast({
            type: "error",
            icon: "exclamation triangle",
            title: "Error",
            description: "Connect to network",
            time: 2000,
          });
        } else if (req.ss_id) {
          let requestID = req.ss_id;
          setOnOff1(va);
          toast({
            type: "success",
            icon: "check circle",
            title: "Success",
            description: `Successfully controlled: ${msg}`,
            time: 2000,
          });
          const checkCommandStatus = (requestID, startTime = Date.now()) => {
            api.floor
              .checkCommandStatus(requestID)
              .then((res) => {
                // console.log("commansattaus", res);
                if (res[0].status === "success") {
                  // Command was successful, stop further API calls
                  // console.log("Command succeeded");
                  toast({
                    type: "success",
                    icon: "check circle",
                    title: "Command Status",
                    description: "Command processed successfully",
                    time: 2000,
                  });
                } else if (res[0].status === "pending") {
                  // console.log("Command is still Pending");
                  const elapsedTime = Date.now() - startTime;

                  if (elapsedTime < 30000) {
                    console.log(
                      " If less than 30 seconds have passed, keep checking every 3 seconds"
                    );
                    setTimeout(
                      () => checkCommandStatus(requestID, startTime),
                      3000
                    );
                  } else {
                    // console.log(
                    //   "Stop checking after 30 seconds and show a timeout message"
                    // );
                    // console.log("Command timed out after 30 seconds.");
                    toast({
                      type: "error",
                      icon: "clock",
                      title: "Timeout",
                      description: "Command is still pending after 30 seconds.",
                      time: 5000,
                    });
                  }
                }
              })
              .catch((error) => {
                // console.error("Error checking command status:", error);
                // toast({
                //   type: "error",
                //   icon: "exclamation triangle",
                //   title: "Error",
                //   description: "Error while checking command status",
                //   time: 2000,
                // });
              });
          };

          checkCommandStatus(requestID);
        }
      })
      .catch((error) => {
        if (error.response) {
          setSnackbarOpen(true);
          setErrorMsg(error.response.data.message);
        }
      });
  };

  const ChipMethod = (props) => {
    // Helper function to get string title from JSX or string
    const getTitleString = (title) => {
      if (typeof title === "string") return title;
      // If title is JSX, extract text content
      if (title?.props?.children) {
        return title.props.children
          .filter((child) => typeof child === "string")
          .join("");
      }
      return "";
    };

    const titleString = getTitleString(props.title);

    return (
      <Paper
        className={classes.controls_paper}
        style={{
          backgroundColor: "#0123B4",
          justifyContent: "center",
        }}
      >
        {/* {console.log("Debug:", props.title, "→ value:", props.value)} */}
        <div style={{ color: "white" }}>
          {props.title === "Panel Stop" || titleString === "Panel Stop" ? (
            <>
              {props.value == null
                ? ""
                : props.value === "inactive" || parseInt(props.value) === 0
                ? "Normal"
                : "Stopped"}
            </>
          ) : props.title === "Chiller Status" ||
            props.title == "C1 Status" ||
            props.title == "C2 Status" ||
            titleString === "Chiller Status" ? (
            <>
              {
              props.value === null || props.value === undefined
              ? "N/A"
              :props.value === "active" || parseInt(props.value) === 1 || props.value === "1"
                ? "ON"
                : props.value === "inactive" || parseInt(props.value) === 0 || props.value === "0"
                ? "OFF"
                : props.value}
            </>
          ) : props.title === "Chiller Mode" ? (
             <>
              {
              props.value === null || props.value === undefined
                ? "N/A"
                :props.value === "active" || parseInt(props.value) === 1 || props.value === "2.0"||props.value === 2.0
                ? "Auto"
                : "Manual"}
            </>
            ) : props.title === "Chilled Water Leaving Setpoint" ? (
  <>
    {
      props.value === null || props.value === undefined
        ? "N/A"
        : props.value ? formatter.format(props.value) : props.defaultValue
    }
  

            </>
          ) : props.title === "Flow Status" ||
            titleString === "Flow Status" ||
            titleString === "Flow SwitchEvaporator" ||
            titleString === "Flow SwitchCondenser" ? (
            <>
           
              {props.value === null || props.value === undefined
                ? "N/A"
                :props.value === "active" || parseInt(props.value) === 1 || props.value === "1"
                ? "Open"
                : props.value === "inactive" || parseInt(props.value) === 0 || props.value === "0"
                ? "Close"
                : props.value}
            </>
          ) : props.title === "Trip Status" || titleString === "Trip Status" ? (
            <>{props.value === null || props.value === undefined
                ? "N/A"
                :props.value === "active" || parseInt(props.value) === 1 || props.value === "1"
                ? "Tripped"
                : props.value === "inactive" || parseInt(props.value) === 0 || props.value === "0"
                ? "Normal"
                : props.value}</>
          ) : props.title === "Compressor 1" ||
            titleString === "Compressor 1" ? (
            <>{props.value === "inactive" ? "OFF" : "ON"}</>
          ) : props.title === "Evaporator Valve Status" ||
            titleString === "Evaporator Valve Status" ? (
            <>{props.value === null || props.value === undefined
                ? "N/A"
                :props.value === "active" || parseInt(props.value) === 1 || props.value === "1"
                ? "Open"
                : props.value === "inactive" || parseInt(props.value) === 0 || props.value === "0"
                ? "Close"
                : props.value}</>
          ) : props.title === "Condenser Valve Status" ||
            titleString === "Condenser Valve Status" ? (
            <>{props.value === null || props.value === undefined
                ? "N/A"
                :props.value === "active" || parseInt(props.value) === 1 || props.value === "1"
                ? "Open"
                : props.value === "inactive" || parseInt(props.value) === 0 || props.value === "0"
                ? "Close"
                : props.value}</>
          ) : props.title === "Run Status" || titleString === "Run Status" ? (
            <>{props.value === "inactive" ? "Inactive" : "Active"}</>
          ) : props.title === "Chiller Run Hours" ||
            titleString === "Run Hours" ? (
            <>
              {(props.value ?? props.defaultValue).toFixed(2)}
              {props.unit}
            </>
          ) : props.title === "Expansion valve status" ||
            titleString === "Expansion valve status" ? (
            <>
              {props.value === "inactive" || props.value <= 0
                ? "Closed"
                : "Open"}
            </>
          ) : titleString === "Condenser" ? (
            <>
              {props.value === "inactive" || props.value <= 0
                ? "Closed"
                : "Open"}
            </>
          ) : titleString === "Flow Meter Value" ? (
            <>
              {props.value ? formatter.format(props.value) : props.defaultValue}
              {props.unit}
            </>
          ) : titleString === "Motor %FLA" ? (
            <>
              {props.value ? formatter.format(props.value) : props.defaultValue}
              {props.unit}
            </>
          ) : titleString === "Operating Hours" ? (
            <>
              {props.value ? formatter.format(props.value) : props.defaultValue}
              {props.unit}
            </>
          ) : titleString === "No.of Starts" ? (
            <>
              {props.value ? formatter.format(props.value) : props.defaultValue}
              {props.unit}
            </>
          ) : titleString === "Motor Run" ? (
            <>
              {props.value === "active" || parseInt(props.value) === 1
                ? "ON"
                : "OFF"}
            </>
          ) : (
            <>
              {props.value ? formatter.format(props.value) : props.defaultValue}
              {props.unit}
            </>
          )}
        </div>
      </Paper>
    );
  };

  const handleChangeForsetpointRAT = (event) => {
    setSetPointvalue(event.target.value);
  };

  const handleClickRat = (event) => {
    // console.log("props--------------------",props)
    const req = {
      ss_type: props.eqpType,
      ss_id: selectedChId,
      gl_command: "CHANGE_SET_POINT",
      param_id:
        props.eqpType == "NONGL_SS_CHILLER"
          ? "cmd_evap_leaving_temp_00"
          : "",
      value: setPointvalue,
      zone_type: null,
      zone_id: null,
    };
    // console.log("reqqqqq", req);
    if (setPointvalue >= 4 && setPointvalue <= 10) {
      api.floor
        .cpmOnOffControl(req)
        .then((res) => {
          setSetPointvalue("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.id) {
            let requestID = res.id;
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Temp successfully set to" + setPointvalue,
              time: 2000,
            });
            const checkCommandStatus = (requestID, startTime = Date.now()) => {
              api.floor
                .checkCommandStatus(requestID)
                .then((res) => {
                  if (res[0].status === "success") {
                    // Command was successful, stop further API calls
                    // console.log("Command succeeded");
                    toast({
                      type: "success",
                      icon: "check circle",
                      title: "Command Status",
                      description: "Command processed successfully",
                      time: 2000,
                    });
                  } else if (res[0].status === "pending") {
                    // console.log("Command is still Pending");
                    const elapsedTime = Date.now() - startTime;

                    if (elapsedTime < 30000) {
                      console.log(
                        " If less than 30 seconds have passed, keep checking every 3 seconds"
                      );
                      setTimeout(
                        () => checkCommandStatus(requestID, startTime),
                        3000
                      );
                    } else {
                      // console.log(
                      //   "Stop checking after 30 seconds and show a timeout message"
                      // );
                      // console.log("Command timed out after 30 seconds.");
                      toast({
                        type: "error",
                        icon: "clock",
                        title: "Timeout",
                        description:
                          "Command is still pending after 30 seconds.",
                        time: 5000,
                      });
                    }
                  }
                })
                .catch((error) => {
                  // console.error("Error checking command status:", error);
                  // toast({
                  //   type: "error",
                  //   icon: "exclamation triangle",
                  //   title: "Error",
                  //   description: "Error while checking command status",
                  //   time: 2000,
                  // });
                });
            };

            checkCommandStatus(requestID);
          }
        })
        .catch((error) => {
          setSnackbarOpen(true);
          if (error.response) {
            setErrorMsg(error.response.data.message);
          } else {
            // setErrorMsg('No response')
          }
        });
    } else {
      // setSetPointvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "Set point should be 4-10 ",
        time: 2000,
      });
    }
  };

  return (
    <div className={classes.root}>
      <Snackbar
        open={openerr}
        autoHideDuration={3000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          style={{
            cursor: "pointer",
          }}
          severity="error"
          variant="filled"
          onClose={handleerrorclose}
        >
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
        <Grid
          container
          item
          xs={12}
          spacing={1}
          style={{
            marginTop: "-1.5h",
          }}
        >
          {/* Left part */}
          <Grid item xs={12} sm={12} md={9} lg={9} xl={9} xxl={9}>
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <FormControl
                  variant="filled"
                  size="large"
                  className={` ${classes.select} ${classes.formControl}`}
                  style={{
                    width: "max-content",
                    minWidth: "100%",
                    backgroundColor: "#eeeef5",
                    fontFamily: "Arial",
                  }}
                >
                  {/* <Select
                    labelId="filled-hidden-label-small"
                    id="demo-simple-select-outlined"
                    label="Chiller"
                    // className={classes.select}
                    value={selectedChName}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                    disableUnderline
                  >
                    {Object.values(allEquipmentData).map((_item) => (
                      <MenuItem
                        key={_item.id}
                        value={_item.name}
                        onClick={() =>
                          handleChillerChange(_item.name, _item.id)
                        }
                      >
                        {_item.name}
                      </MenuItem>
                    ))}
                  </Select> */}
                  <Select
                    labelId="filled-hidden-label-small"
                    id="demo-simple-select-outlined"
                    value={selectedChId || ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      const selected = allEquipmentData.find(
                        (i) => i.id === id
                      );
                      if (selected) {
                        handleChillerChange(selected.name, selected.id);
                      }
                    }}
                    style={{
                      fontWeight: "bold",
                      height: "6vh",
                      borderRadius: "0.8vw",
                      fontFamily: "Arial",
                    }}
                    disableUnderline
                  >
                    {Object.values(allEquipmentData).map((_item) => (
                      <MenuItem key={_item.id} value={_item.id}>
                        {_item.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container item xs={12} spacing={1}>
              {console.log(
                "particularEquipDataSet1",
                particularEquipDataSet1,
                "particularEquipDataSet2",
                particularEquipDataSet2
              )}
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    borderRadius: "6px",
                    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
                    backgroundColor: "white",
                    textAlign: "left",
                  }}
                >
                  <Grid container item xs={12} spacing={1} direction="row">
                    {/* <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                      {particularEquipDataSet5 != undefined ? (
                        <>
                          {particularEquipDataSet5.map((res) => (
                            <>
                              {res.title} - {formatter.format(res.value)}
                              <br />
                              <br />
                            </>
                          ))}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid> */}
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      <Map
                        ref={mapRef}
                        doubleClickZoom={false}
                        zoomControl={false}
                        dragging={false}
                        scrollWheelZoom={false}
                        crs={Leaflet.CRS.Simple}
                        center={[0, 0]}
                        attributionControl={false}
                        // bounds={[[0, 0], [600, 730]]}
                        bounds={[
                          [0, -10],
                          [525, 750],
                        ]}
                        className={"floor-map"}
                        style={{
                          backgroundColor: "white",
                          height: "48vh",
                        }}
                        onClick={(e) => {
                          console.log({
                            x: e.latlng.lat,
                            y: e.latlng.lng,
                          });
                        }}
                      >
                        <ImageOverlay
                          interactive
                          // url={'https://localhost/' + image + '.png'}
                          url={Chiller_updated_img}
                          // bounds={[[0, -5], [420, 600]]}
                          // bounds={[[0,250], [420, 500]]}
                          // bounds={[
                          //   [120, 120],
                          //   [400, 600],
                          // ]}
                          bounds={window.innerWidth!='1920'?[
                          [120, 120],
                          [400, 600],
                        ]:[[50, 20],[500, 700]]}
                          // bounds={[[0, 0], [300, 399]]}
                        />
                        {/* {particularEquipDataSet5 != undefined ? ( 
                          <>
                          <Marker
                                  position={res.coordinates}
                                  icon={iconDevice1}
                                >
                                  <Tooltip
                                    direction={res.tooltipDirection}
                                    opacity={0.65}
                                    permanent
                                  ></Tooltip>
                                  </Marker>
                          </>
                         ) : (
                          <></>
                        )} */}
                        {particularEquipDataSet1 != undefined ? (
                          <>
                            {/* {console.log(
                              "[Render] particularEquipDataSet1:",
                              particularEquipDataSet1
                            )} */}
                            {particularEquipDataSet1.map((res) => (
                              <>
                                {/* {res.title === "Chiller IKW/TR" &&
                                  console.log(
                                    "Found Chiller IKW/TR in render:",
                                    res
                                  )} */}
                                <Marker
                                  position={res.coordinates}
                                  icon={iconDevice1}
                                >
                                  <Tooltip
                                    direction={res.tooltipDirection}
                                    opacity={0.65}
                                    permanent
                                  >
                                    <div>
                                      <span
                                        className={
                                          classes.Leaflet_Tooltip_Heading
                                        }
                                      >
                                        {res.title}
                                      </span>
                                      <br />
                                      <div
                                        className={
                                          classes.Leaflet_Tooltip_Values
                                        }
                                        style={{
                                          color: "white",
                                          backgroundColor:
                                            res.minRange && res.maxRange
                                              ? res.value >= res.minRange &&
                                                res.value <= res.maxRange
                                                ? greenColor[0]
                                                : redColor[0]
                                              : res.backgroundColor,
                                          // backgroundColor: res.backgroundColor ? res.backgroundColor : 'green',
                                        }}
                                      >
                                        {res.value}
                                        {res.unit ? res.unit : ""}
                                      </div>
                                    </div>{" "}
                                  </Tooltip>
                                </Marker>
                              </>
                            ))}
                          </>
                        ) : (
                          <></>
                        )}
                        {/* {particularEquipDataSet2 != undefined ? (
                          <>
                           {particularEquipDataSet2.map((res) =>
                                  res.title == "Chiller" ? (
                                    res.value == "active" ? (
                                      <Marker
                                        position={[300.82, 404.45]}
                                        icon={iconDevice2}
                                      ></Marker>
                                    ) : (
                                      <></>
                                    )
                                  ) : res.title == "Trip Status" ? (
                                    res.value == "active" ? (
                                      <Marker
                                        position={[300.82, 404.45]}
                                        icon={iconDevice3}
                                      ></Marker>
                                    ) : (
                                      <></>
                                    )
                                  ) : (
                                    <></>
                                  )
                                )}
                              </>):<></>} */}
                      </Map>
                    </Grid>

                    {/* <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                      {particularEquipDataSet6 != undefined ? (
                        <>
                          {particularEquipDataSet6.map((res) => (
                            <>
                              {res.title} - {formatter.format(res.value)}
                              <br />
                              <br />
                            </>
                          ))}
                        </>
                      ) : (
                        <></>
                      )}
                    </Grid> */}
                  </Grid>
                </Card>
              </Grid>
            </Grid>
            <Grid
              container
              item
              xs={12}
              spacing={1}
              style={{
                marginTop: "1vh",
              }}
            >
              {eqpGraphList ? (
                graphsCard.map((resData) => (
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                    <Box className={classes.graphpaper}>
                      <div
                        style={{
                          fontWeight: "bold",
                          color: "black",
                        }}
                        className={classes.CardHeadFont}
                      >
                        {resData.title}
                      </div>
                      <div
                        style={{
                          marginTop: "2vh",
                        }}
                      >
                        {/* {console.log(
                          "eqpGraphList[resData['parameters'][0]]",
                          eqpGraphList
                        )} */}
                        <TimeS
                          name={resData.title}
                          data={eqpGraphList[resData["parameters"][0]]}
                          via={props.device}
                          // data24Hr={eqp1dayGraphList[resData['parameters'][0]]}
                          minRange={resData.minRange}
                          maxRange={resData.maxRange}
                          data2={eqpGraphList[resData["parameters"][1]]}
                          data3={eqpGraphList[resData["parameters"][2]]}
                          style={{
                            width: "10vh",
                            height: "7vh",
                            marginTop: "2vh",
                          }}
                        />
                      </div>
                    </Box>
                  </Grid>
                ))
              ) : (
                <></>
              )}

              {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                        <Box className={classes.graphpaper}>
                        <div style={{fontWeight:'bold',color:'black'}}  className={classes.CardHeadFont}>Condenser Water Temperature</div>
                                  <div style={{marginTop:'2vh'}}>
                                  <TimeS
                                        name='Condenser Water Temperature'
                                        data={CndW_HST} data2={CndW_HRT}
                                      style={{ width: "100%", height: "50%" }}
                                    /></div>
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                        <Box className={classes.graphpaper}>
                          <div style={{fontWeight:'bold',color:'black'}}  className={classes.CardHeadFont}>VFD Phase Current</div>
                              <div style={{marginTop:'2vh'}}>
                                 <TimeSeriesChart
                                style={{ width: "100%", height: "50%" }}
                                data={VFD_Ph_Cur}
                                param='VFD_Ph_Cur'
                              />
                              </div>
                        </Box>
                    </Grid> */}
            </Grid>
          </Grid>
          {/* Right part */}
          <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
            <Grid container item xs={12} spacing={1} direction="column">
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Paper
                  style={{
                    maxWidth: "100%",
                    color: "white",
                    backgroundColor: "#0123b4",
                    borderRadius: "10px",
                    height: "6vh",
                    display: "flex",
                    justifyContent: "flex-start",
                    paddingLeft: "16px",
                    alignItems: "center",
                  }}
                  className={classes.CardHeadFont}
                >
                  <Typography
                    style={{
                      color: "#ffffff",
                      fontFamily: "Arial",
                      fontSize: "2vh",
                      textAlign: "left",
                    }}
                  >
                    Chiller Controls
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    marginTop: "0vh",
                    height: "27vh",
                    overflowY: "auto",
                  }}
                >
                  {" "}
                  {/* {console.log(
                    "particularEquipDataSet22222",
                    particularEquipDataSet2
                  )} */}
                  {deviceImage ? (
                    <>
                      {particularEquipDataSet2.map((res) =>
                        res.typeOf == "controls" ? (
                          <>
                            <Grid container spacing={1}>
                              <Grid
                                container
                                item
                                xs={12}
                                style={{
                                  marginTop: "1.7vh",
                                  textAlign: "left",
                                }}
                                direction="row"
                                alignItems="center"
                                justify="flex-start"
                              >
                                <Grid
                                  item
                                  xs={1}
                                  sm={1}
                                  md={1}
                                  lg={1}
                                  xl={1}
                                ></Grid>
                                <Grid
                                  item
                                  xs={6}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  xl={6}
                                  className={classes.controls_text}
                                >
                                  {res.title}
                                </Grid>
                                <Grid item xs={4} sm={4} md={4} lg={4} xl={4}>
                                  {res.component == "Set Operator" ? (
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      alignItems="center"
                                      justify="flex-end"
                                    >
                                      <Grid
                                        item
                                        xs={7}
                                        sm={7}
                                        md={7}
                                        lg={7}
                                        xl={7}
                                      >
                                        <TextField
                                          placeholder={
  res.value !== null && res.value !== undefined
    ? Number(res.value).toFixed(2) + res.unit
    : Number(res.defaultValue).toFixed(2) + res.unit
}
                                          style={{
                                            pointerEvents:
                                            CPO_OverAllStatus == "MANUAL"? "":"none",
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "true"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                            opacity:
                                            CPO_OverAllStatus == "MANUAL"? "":"0.4"
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "false"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                            // roleId != 2 ||
                                            // CPM_Status == "true" ||
                                            // CPM_Override_Status == "false"
                                            //   ? "0.4"
                                            //   : "",
                                          }}
                                          name="Set_Point"
                                          autoComplete="off"
                                          value={setPointvalue}
                                          onChange={handleChangeForsetpointRAT}
                                          className={classes.text_field}
                                        />
                                      </Grid>
                                      <Grid
                                        item
                                        xs={5}
                                        sm={5}
                                        md={5}
                                        lg={5}
                                        xl={5}
                                      >
                                        <Paper
                                          className={classes.set_button}
                                          onClick={() => handleClickRat(props)}
                                          style={{
                                            backgroundColor: "#0123B4",
                                            display: "flex",
                                            marginLeft: "1vh",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            marginTop: "1vh",
                                            pointerEvents:
                                              CPM_Override_Status == "true"
                                                ? ""
                                                : CPM_Override_Status == "false"
                                                ? CPM_Status == "true"
                                                  ? "0.4"
                                                  : ""
                                                : "0.4",
                                            opacity:
                                              CPM_Override_Status == "true"
                                                ? ""
                                                : CPM_Override_Status == "false"
                                                ? CPM_Status == "true"
                                                  ? "0.4"
                                                  : ""
                                                : "0.4",
                                          }}
                                        >
                                          <div style={{ color: "white" }}>
                                            set
                                          </div>
                                        </Paper>
                                      </Grid>
                                    </Grid>
                                  ) : res.component == "Chip" ? (
                                    <ChipMethod
                                      value={res.value}
                                      unit={res.unit}
                                      title={res.title}
                                      defaultValue={res.defaultValue}
                                    />
                                  ) : res.component == "Switch Selector" ? (
                                    <>
                                      {res.title ==
                                      "Include Chiller in CPM Mode ?" ? (
                                        <div
                                          className={classes.switchselector}
                                          style={{
                                            pointerEvents:
                                              CPM_Override_Status == "true"
                                                ? ""
                                                : CPM_Override_Status == "false"
                                                ? CPM_Status == "true"
                                                  ? "0.4"
                                                  : ""
                                                : "0.4",
                                            opacity:
                                              CPM_Override_Status == "true"
                                                ? ""
                                                : CPM_Override_Status == "false"
                                                ? CPM_Status == "true"
                                                  ? "0.4"
                                                  : ""
                                                : "0.4",
                                          }}
                                        >
                                          <SwitchSelector
                                            onChange={onChangeMode}
                                            options={modeOptions}
                                            forcedSelectedIndex={remoteLocal}
                                            fontColor="#000"
                                            selectedFontColor="#000"
                                            optionBorderRadius={5}
                                            wrapperBorderRadius={7}
                                            fontSize={8}
                                          />
                                        </div>
                                      ) : res.title == "Chiller" ? (
                                        <div
                                          className={classes.switchselector}
                                          style={{
                                            pointerEvents:
                                            CPO_OverAllStatus == "MANUAL"? "":"none",
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "true"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                            opacity:
                                            CPO_OverAllStatus == "MANUAL"? "":"0.4"
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "true"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                          }}
                                        >
                                          <SwitchSelector
                                            onChange={onChange}
                                            options={options}
                                            forcedSelectedIndex={
                                              res.value == "active" ? 1 : 0
                                            }
                                            // initialSelectedIndex={
                                            //   res.value == "active" ? 1 : 0
                                            // }
                                            // key={res.value}
                                            key={`${selectedChId}-${res.parameter}-${res.value}`}
                                            fontColor="#000"
                                            selectedFontColor="#000"
                                            optionBorderRadius={5}
                                            wrapperBorderRadius={7}
                                            fontSize={8}
                                          />
                                        </div>
                                      ) : (
                                        <div
                                          className={classes.switchselector}
                                          style={{
                                            pointerEvents:
                                            CPO_OverAllStatus == "MANUAL"? "":"none",
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "true"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                            opacity:
                                            CPO_OverAllStatus == "MANUAL"? "":"0.4"
                                              // CPM_Override_Status == "true"
                                              //   ? ""
                                              //   : CPM_Override_Status == "false"
                                              //   ? CPM_Status == "true"
                                              //     ? "0.4"
                                              //     : ""
                                              //   : "0.4",
                                          }}
                                        >
                                          <SwitchSelector
                                            // onChange={onChange1}
                                            onChange={(newValue) =>
                                              onChange1(
                                                newValue,
                                                res.parameter2
                                              )
                                            }
                                            options={options1}
                                            forcedSelectedIndex={
                                              res.value == "active" ? 1 : 0
                                            }
                                            // key={res.value}
                                            key={`${selectedChId}-${res.parameter}-${res.value}`}
                                            fontColor="#000"
                                            selectedFontColor="#000"
                                            optionBorderRadius={5}
                                            wrapperBorderRadius={7}
                                            fontSize={8}
                                          />
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <></>
                                  )}
                                </Grid>
                                <Grid
                                  item
                                  xs={1}
                                  sm={1}
                                  md={1}
                                  lg={1}
                                  xl={1}
                                ></Grid>
                              </Grid>
                            </Grid>
                          </>
                        ) : (
                          <></>
                        )
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20vh",
                        fontSize: "2.5vh",
                      }}
                    >
                      No Equipment Available
                    </div>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Paper
                  style={{
                    maxWidth: "100%",
                    color: "white",
                    backgroundColor: " #0123b4",
                    borderRadius: "6px",
                    height: "6vh",
                    display: "flex",
                    justifyContent: "flex-start",
                    paddingLeft: "16px",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    style={{
                      color: "#ffffff",
                      fontFamily: "Arial",
                      fontSize: "2vh",
                      textAlign: "left",
                    }}
                  >
                    Chiller Status
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card
                  className={classes.paper}
                  style={{
                    marginTop: "0vh",
                    height: "45.3vh",
                    overflowY: "auto",
                  }}
                >
                  {" "}
                  {deviceImage ? (
                    <>
                      {" "}
                      {chillerExtraParams != undefined ? (
                        <>
                          {chillerExtraParams.map((res) => (
                            <Grid container spacing={1}>
                              {res.metric_id == "CH_kW_per_TR" ? (
                                <>
                                  <Grid
                                    container
                                    item
                                    xs={12}
                                    style={{
                                      marginTop: "1.7vh",
                                      textAlign: "left",
                                    }}
                                    direction="row"
                                    alignItems="center"
                                    justify="flex-start"
                                  >
                                    <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid>
                                    <Grid
                                      item
                                      xs={6}
                                      sm={6}
                                      md={6}
                                      lg={6}
                                      xl={6}
                                      className={classes.controls_text}
                                    >
                                      Chiller IKW/TR
                                    </Grid>
                                    <Grid
                                      item
                                      xs={4}
                                      sm={4}
                                      md={4}
                                      lg={4}
                                      xl={4}
                                    >
                                      <ChipMethod
                                        value={res.metric_value}
                                        unit=""
                                        title="Chiller IKW/TR"
                                        defaultValue="-"
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid>
                                  </Grid>
                                  <Grid
                                    container
                                    item
                                    xs={12}
                                    style={{
                                      marginTop: "1.7vh",
                                      textAlign: "left",
                                    }}
                                    direction="row"
                                    alignItems="center"
                                    justify="flex-start"
                                  >
                                    <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid>
                                    <Grid
                                      item
                                      xs={6}
                                      sm={6}
                                      md={6}
                                      lg={6}
                                      xl={6}
                                      className={classes.controls_text}
                                    >
                                      Chiller KW
                                    </Grid>
                                    <Grid
                                      item
                                      xs={4}
                                      sm={4}
                                      md={4}
                                      lg={4}
                                      xl={4}
                                    >
                                      <ChipMethod
                                        value={
                                          chillerTrKwData?.kw ||
                                          chillerTrKwData?.KW ||
                                          "-"
                                        }
                                        unit=""
                                        title="Chiller KW"
                                        defaultValue="-"
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid>
                                  </Grid>
                                  <Grid
                                    container
                                    item
                                    xs={12}
                                    style={{
                                      marginTop: "1.7vh",
                                      textAlign: "left",
                                    }}
                                    direction="row"
                                    alignItems="center"
                                    justify="flex-start"
                                  >
                                    {/* <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid>
                                    <Grid
                                      item
                                      xs={6}
                                      sm={6}
                                      md={6}
                                      lg={6}
                                      xl={6}
                                      className={classes.controls_text}
                                    >
                                      Chiller TR
                                    </Grid> */}
                                    {/* <Grid
                                      item
                                      xs={4}
                                      sm={4}
                                      md={4}
                                      lg={4}
                                      xl={4}
                                    >
                                      <ChipMethod
                                        value={
                                          chillerTrKwData?.tr ||
                                          chillerTrKwData?.TR ||
                                          "-"
                                        }
                                        unit=""
                                        title="Chiller TR"
                                        defaultValue="-"
                                      />
                                    </Grid>
                                    <Grid
                                      item
                                      xs={1}
                                      sm={1}
                                      md={1}
                                      lg={1}
                                      xl={1}
                                    ></Grid> */}
                                  </Grid>
                                </>
                              ) : (
                                <></>
                              )}
                            </Grid>
                          ))}
                        </>
                      ) : (
                        <></>
                      )}
                      {particularEquipDataSet2.map((res) =>
                        res.type == "status" ? (
                          <>
                            <Grid container spacing={1}>
                              <Grid
                                container
                                item
                                xs={12}
                                style={{
                                  marginTop: "1.7vh",
                                  textAlign: "left",
                                }}
                                direction="row"
                                alignItems="center"
                                justify="flex-start"
                              >
                                <Grid
                                  item
                                  xs={1}
                                  sm={1}
                                  md={1}
                                  lg={1}
                                  xl={1}
                                ></Grid>
                                <Grid
                                  item
                                  xs={6}
                                  sm={6}
                                  md={6}
                                  lg={6}
                                  xl={6}
                                  className={classes.controls_text}
                                >
                                  {res.title}
                                </Grid>
                                <Grid
                                  item
                                  xs={4}
                                  sm={4}
                                  md={4}
                                  lg={4}
                                  xl={4}
                                  style={{
                                    textAlign: "right",
                                    paddingRight: "2vw",
                                  }}
                                >
                                  {res.component == "Chip" ? (
                                    <ChipMethod
                                      value={res.value}
                                      unit={res.unit}
                                      title={res.title}
                                      defaultValue={res.defaultValue}
                                    />
                                  ) : res.component == "Switch Selector" ? (
                                    <div
                                      style={{
                                        pointerEvents:
                                          roleId != 2 || disable ? "none" : "",
                                        opacity:
                                          roleId != 2 || disable ? "0.4" : "",
                                      }}
                                      className={classes.switchselector}
                                    >
                                      <SwitchSelector
                                        onChange={onChange}
                                        options={options}
                                        // initialSelectedIndex={initialSelectedIndex}
                                        forcedSelectedIndex={
                                          res.value == "active" ? 1 : 0
                                        }
                                        fontColor={"#000"}
                                        selectedFontColor={"#000"}
                                        optionBorderRadius={5}
                                        wrapperBorderRadius={7}
                                        fontSize={8}
                                      />
                                    </div>
                                  ) : res.component == "Text Field" ? (
                                    <Grid
                                      container
                                      item
                                      xs={12}
                                      alignItems="center"
                                      justify="flex-end"
                                    >
                                      <Grid
                                        item
                                        xs={7}
                                        sm={7}
                                        md={7}
                                        lg={7}
                                        xl={7}
                                      >
                                        <TextField
                                          // label="%"
                                          placeholder={res.value + "℃"}
                                          // style={{marginTop:'3px',marginLeft:'18px',"letter-spacing":"9px",width:'45px'}}
                                          name="Set_Point"
                                          autoComplete="off"
                                          // formatter.format(freq)
                                          value={setPointvalue}
                                          onChange={handleChangeForsetpointRAT}
                                          className={classes.text_field}
                                          // variant="outlined"
                                          // style={{ marginTop: '3vh' }}
                                        />
                                      </Grid>
                                      <Grid
                                        item
                                        xs={5}
                                        sm={5}
                                        md={5}
                                        lg={5}
                                        xl={5}
                                      >
                                        <Paper
                                          className={classes.set_button}
                                          onClick={() => handleClickRat(props)}
                                          style={{
                                            backgroundColor: "#0123B4",
                                            display: "flex",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            marginTop: "1vh",
                                            pointerEvents:
                                              roleId != 2 ? "none" : "",
                                            opacity: roleId != 2 ? "0.4" : "",
                                          }}
                                        >
                                          <div
                                            style={{
                                              color: "white",
                                            }}
                                          >
                                            set
                                          </div>
                                        </Paper>
                                      </Grid>
                                    </Grid>
                                  ) : (
                                    <></>
                                  )}
                                </Grid>
                                <Grid
                                  item
                                  xs={1}
                                  sm={1}
                                  md={1}
                                  lg={1}
                                  xl={1}
                                ></Grid>
                              </Grid>
                            </Grid>
                          </>
                        ) : (
                          <></>
                        )
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20vh",
                        fontSize: "1vh",
                      }}
                    >
                      No Equipment Available
                    </div>
                  )}
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                {/* <Card
                       className={classes.paper}
                       style={{
                         marginTop:'0.5vh',
                         // boxShadow:"0 4px 10px 2px rgba(0, 0, 0, 0.1)",
                         // backgroundColor: " #ffffff",
                         borderRadius: "6px",
                         height: "28.5vh",
                       }}
                     >
              
 
                     </Card> */}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}
