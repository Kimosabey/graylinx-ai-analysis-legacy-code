import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import { Grid, Divider } from "@material-ui/core";
import { Card } from "@material-ui/core";
import api from "./../../api";
import theme from "../../responsive/TextTypography";
import Warning from "components/Typography/Warning";
import Danger from "components/Typography/Danger";
import Success from "components/Typography/Success";
import RunStatusIcon from "@material-ui/icons/Brightness1";
import SemiCircleProgressBar from "react-progressbar-semicircle";
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

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: "-1vh",
  },

  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    padding: theme.spacing(1),
    textAlign: "center",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    height: "10vh",
    marginTop: "1vh",
    opacity: "1",
  },
  semicircularbar: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      marginTop: "-0.5vh",
      marginLeft: "-1.5vh",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      marginTop: "-1vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      marginTop: "-2vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      marginTop: "-2vh",
      marginLeft: "-0.1vh",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      marginTop: "-1vh",
      marginLeft: "0.5vh",
    },
  },
  text: {
    fontSize: "14px",
    color: " #292929",
    fontFamily: "Arial",
  },
  statusFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      textAlign: "center",
      fontSize: "1.5vh",
      color: "black",
      whiteSpace: "nowrap",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      textAlign: "center",
      fontSize: "1.8vh",
      color: "black",
      whiteSpace: "nowrap",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      textAlign: "center",
      fontSize: "1.8vh",
      color: "black",
      whiteSpace: "nowrap",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      textAlign: "center",
      fontSize: "2.2vh",
      whiteSpace: "nowrap",
      color: "black",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      textAlign: "center",
      fontSize: "2.3vh",
      color: "black",
      whiteSpace: "nowrap",
    },
  },
  devicesContainer: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "8px",
    "& > *": {
      flex: "1 1 0",
      minWidth: 0,
    },
  },
  // emsContainer: {
  //   display: "grid",
  //   gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
  //   gap: "10px",
  // },
  emsContainer: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "8px",
    "& > *": {
      flex: "1 1 0",
      minWidth: 0,
    },
  },
}));

function UpsEmsLanding(props) {
  const classes = useStyles();
  const alerts = useSelector((state) => state.alarm.alarmData);
  const [eachChillerData, setEachChillerData] = React.useState([]);
  const [criticalAlertsChiller, setcriticalAlertsChiller] = React.useState(0);
  const [soluAlertsChiller, setsoluAlertsChiller] = React.useState(0);
  const [openerr, setOpenerr] = React.useState(false);
  const [errmsg, setErrmsg] = React.useState("");
  const allowedDevicePrefixes = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "EM",
    "Chiller",
    "Condenser_Pump",
    "Cooling_tower",
  ];
  let devData =
    props.type === "CPM" || props.type === "ATCS"
      ? Object.values(props.device)
      : props.device;
  // devData = [...devData].sort((a, b) => {
  //   // Clean the names by removing tabs, extra spaces, and trimming
  //   const nameA = (a.name || "").replace(/[\t\r\n]/g, "").trim();
  //   const nameB = (b.name || "").replace(/[\t\r\n]/g, "").trim();

  //   // Check if names start with a letter or number
  //   const startsWithLetterA = /^[a-zA-Z]/.test(nameA);
  //   const startsWithLetterB = /^[a-zA-Z]/.test(nameB);

  //   // If one starts with letter and other doesn't, letter comes first
  //   if (startsWithLetterA && !startsWithLetterB) return -1;
  //   if (!startsWithLetterA && startsWithLetterB) return 1;

  //   // Both are same type (both letters or both numbers), sort normally
  //   return nameA.toLowerCase().localeCompare(nameB.toLowerCase(), undefined, {
  //     numeric: true,
  //     sensitivity: "base",
  //   });
  // });
  devData = [...devData]
    // .filter((d) => {
    //   const EnergyCardName = (d.name || "").replace(/[\t\r\n]/g, "").trim();
    //   const isAllowedByName = allowedDevicePrefixes.some((prefix) =>
    //     EnergyCardName.startsWith(prefix),
    //   );
    //   const isChillerByType = d.ssType === "NONGL_SS_CHILLER";
    //   return isAllowedByName || isChillerByType;
    // })
    .sort((a, b) => {
      const nameA = (a.name || "").replace(/[\t\r\n]/g, "").trim();
      const nameB = (b.name || "").replace(/[\t\r\n]/g, "").trim();

      return nameA.localeCompare(nameB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  // Debugging - log the sorted order
  // console.log(
  //   "Sorted devices:",
  //   devData.map((d) => d.name)
  // );
  const getEmptyCardHeight = () => {
    if (props.type === "CPM") return "13.5vh";
    if (props.type === "AHU" || props.type === "CSU") {
      return devData.length >= 0 ? "13.5vh" : "8vh";
    }
    if (props.type === "EMS") return "14vh";
    if (props.type === "UPS") return "11.5vh";
    return "12vh";
  };

  const getEmptyCardCount = () => {
    if (props.type === "CPM") return 4 - devData.length;
    if (props.type === "AHU" || props.type === "CSU") return 6 - devData.length;
    if (props.type === "EMS") return 3 - devData.length;
    if (props.type === "UPS") return 4 - devData.length;
    return 4 - devData.length;
  };

  const emptyCardsDev = Array.from(
    { length: getEmptyCardCount() },
    (_, index) => (
      <div key={`empty-${index}`} style={{ flex: "1 1 0", minWidth: 0 }}>
        <Card
          style={{
            boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
            backgroundColor: "#fcfafa",
            borderRadius: "10px",
            height: getEmptyCardHeight(),
          }}
        ></Card>
      </div>
    ),
  );

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const onClickIssue = (id, name) => {
    if (props.type == "UPS") {
      props.history.push({
        pathname: `/admin/glUps`,
        state: {
          flr_id: props.fid,
          fname: props.fdata,
          dev_id: id,
          dev_name: name,
        },
      });
    } else if (props.type == "EMS") {
      props.history.push({
        pathname: `/admin/glEnergyMeter`,
        state: {
          flr_id: props.fid,
          fname: props.fdata,
          dev_id: id,
          dev_name: name,
        },
      });
    } else if (props.type == "CPM") {
      props.history.push({
        pathname: `/admin/GlChillerPage`,
        state: {
          data: id,
          name: name,
        },
      });
    } else if (props.type == "AHU" || props.type == "CSU") {
      localStorage.setItem("deviceID", id);
      localStorage.setItem("deviceName", name);
      props.history.push({
        pathname: `/admin/glAhu`,
        state: {
          data: id,
          name: name,
          type: props.type,
          ss_type: props.type == "AHU" ? "NONGL_SS_AHU" : "NONGL_SS_CSU",
        },
      });
    } else if (props.type == "ATCS") {
      // console.log("ATCSSS", props.type);
      localStorage.setItem("deviceID", id);
      localStorage.setItem("deviceName", name);
      props.history.push({
        pathname: `/admin/GlAtcsSummaryPage`,
        state: {
          data: id,
          name: name,
          type: props.type,
          ss_type: "NONGL_SS_ATCS",
        },
      });
    }
  };
  const withUnit = (value, unit) => {
    if (value === "" || value === null || value === undefined) return "";
    return `${value} ${unit}`;
  };
  // function EachDevCardForDetails(type, element, index) {
  //   let active = {};
  //   if (type == "UPS") {
  //     const input_ph_volt_values = [
  //       element.input_ph_volt_A,
  //       element.input_ph_volt_B,
  //       element.input_ph_volt_C,
  //     ].map((value) => parseInt(value, 10));
  //     const sum = input_ph_volt_values.reduce(
  //       (total, value) => total + value,
  //       0
  //     );
  //     const status = (sum / input_ph_volt_values.length).toFixed(2);
  //     const output_ph_active_values = [
  //       element.ph_A_Out_acti_Pow,
  //       element.ph_B_Out_acti_Pow,
  //       element.ph_C_Out_acti_Pow,
  //     ].map((value) => parseInt(value, 10));
  //     const sum1 = output_ph_active_values.reduce(
  //       (total, value) => total + value,
  //       0
  //     );
  //     const load = sum1 / output_ph_active_values.length;
  //     active["Status"] = status;
  //     active["Load"] = load;
  //     active["UPS Temperature"] = "19°C";
  //     active["Battery Charge"] = "47V";
  //     active["kW"] = element.kW;
  //   } else if (type == "EMS") {
  //     // const avg = (...vals) => {
  //     //   const nums = vals.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
  //     //   if (nums.length === 0) return "";
  //     //   return formatter.format(nums.reduce((a, b) => a + b, 0) / nums.length);

  //     // };
  //     const avg = (...vals) => {
  //       const nums = vals.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
  //       if (!nums.length) return "";
  //       return nums.reduce((a, b) => a + b, 0) / nums.length;
  //     };

  //     const format = (val) => {
  //       if (val === "" || val === null || val === undefined) return "";
  //       return formatter.format(parseFloat(val));
  //     };
  //     // active["Voltage"] = avg(
  //     //   element.em_par_voltage_ll_r_0,
  //     //   element.em_par_voltage_ll_y_0,
  //     //   element.em_par_voltage_ll_b_0
  //     // );
  //     active["Voltage"] = withUnit(
  //       format(
  //         avg(
  //           element.em_par_voltage_ll_r_0,
  //           element.em_par_voltage_ll_y_0,
  //           element.em_par_voltage_ll_b_0
  //         )
  //       ),
  //       "V"
  //     );
  //     active["Current"] = withUnit(
  //       format(
  //         avg(
  //           element.em_par_line_current_r_0,
  //           element.em_par_line_current_y_0,
  //           element.em_par_line_current_b_0
  //         )
  //       ),
  //       "A"
  //     );

  //     active["Power Factor"] = element.em_par_pf_avg_0
  //       ? formatter.format(parseFloat(element.em_par_pf_avg_0))
  //       : "";

  //     active["Active Power"] = withUnit(
  //       format(element.em_par_active_pwr_avg_0),
  //       "kw"
  //     );

  //     // active["Reactive Power"] = element.em_par_reactive_pwr_avg_0
  //     //   ? formatter.format(parseFloat(element.em_par_reactive_pwr_avg_0))
  //     //   : "";

  //     // active["Apparent Power"] = element.em_par_appar_pwr_avg_0
  //     //   ? formatter.format(parseFloat(element.em_par_appar_pwr_avg_0))
  //     //   : "";
  //   }

  //   return (
  //     <>
  //       <Grid container item xs={12} spacing={1} className={classes.statusFont}>
  //         <Grid
  //           item
  //           xs={6}
  //           sm={6}
  //           md={6}
  //           lg={6}
  //           xl={6}
  //           xxl={6}
  //           style={{
  //             textAlign: "left",
  //             marginLeft: "0.5vh",
  //             fontWeight: "bold",
  //           }}
  //         >
  //           {element.name}
  //         </Grid>
  //       </Grid>
  //       <Grid container item xs={12} spacing={1} style={{ marginLeft: "0vh" }}>
  //         {Object.entries(active).map(([key, value]) => (
  //           <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
  //             <Card className={classes.paper} style={{ height: "11.5vh" }}>
  //               <Grid
  //                 container
  //                 item
  //                 xs={12}
  //                 spacing={1}
  //                 direction="column"
  //                 alignItems="center"
  //                 className={classes.statusFont}
  //               >
  //                 <Grid
  //                   item
  //                   xs={6}
  //                   sm={6}
  //                   md={6}
  //                   lg={6}
  //                   xl={6}
  //                   xxl={6}
  //                   style={{
  //                     color: "black",
  //                     whiteSpace: "nowrap",
  //                     textAlign: "center",
  //                     width: "100%",
  //                     display: "flex",
  //                     justifyContent: "center",
  //                   }}
  //                 >
  //                   {key}
  //                 </Grid>
  //                 {key == "Load" ? (
  //                   <>
  //                     <div className={classes.semicircularbar}>
  //                       <SemiCircleProgressBar
  //                         stroke={blueColor[0]}
  //                         strokeWidth={20}
  //                         diameter={100}
  //                         orientation="up"
  //                         percentage={value}
  //                       />
  //                     </div>
  //                     <div
  //                       style={{
  //                         marginTop: "-2.5vh",
  //                         fontSize: "10px",
  //                       }}
  //                     >
  //                       {formatter.format(value)}
  //                     </div>
  //                   </>
  //                 ) : (
  //                   <Grid
  //                     item
  //                     xs={6}
  //                     sm={6}
  //                     md={6}
  //                     lg={6}
  //                     xl={6}
  //                     xxl={6}
  //                     style={{
  //                       color: blueColor[0],
  //                       fontWeight: "bold",
  //                     }}
  //                   >
  //                     {value}
  //                   </Grid>
  //                 )}
  //               </Grid>
  //             </Card>
  //           </Grid>
  //         ))}
  //       </Grid>
  //     </>
  //   );
  // }
  function EachDevCardForDetails(type, element, index) {
    let active = {};
    if (type == "UPS") {
      const input_ph_volt_values = [
        element.input_ph_volt_A,
        element.input_ph_volt_B,
        element.input_ph_volt_C,
      ].map((value) => parseInt(value, 10));
      const sum = input_ph_volt_values.reduce(
        (total, value) => total + value,
        0,
      );
      const status = (sum / input_ph_volt_values.length).toFixed(2);
      const output_ph_active_values = [
        element.ph_A_Out_acti_Pow,
        element.ph_B_Out_acti_Pow,
        element.ph_C_Out_acti_Pow,
      ].map((value) => parseInt(value, 10));
      const sum1 = output_ph_active_values.reduce(
        (total, value) => total + value,
        0,
      );
      const load = sum1 / output_ph_active_values.length;
      active["Status"] = status;
      active["Load"] = load;
      active["UPS Temperature"] = "19°C";
      active["Battery Charge"] = "47V";
      active["kW"] = element.kW;
    } else if (type == "EMS") {
      const avg = (...vals) => {
        const nums = vals.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
        if (!nums.length) return "";
        return nums.reduce((a, b) => a + b, 0) / nums.length;
      };

      const format = (val) => {
        if (val === "" || val === null || val === undefined) return "";
        return formatter.format(parseFloat(val));
      };

      active["Voltage"] = withUnit(
        format(
          avg(
            element.par_voltage_01,
            element.par_voltage_02,
            element.par_voltage_03,
          ),
        ),
        "V",
      );
      active["Current"] = withUnit(
        format(
          avg(
            element.par_current_01,
            element.par_current_02,
            element.par_current_03,
          ),
        ),
        "A",
      );

      active["Power Factor"] = element.par_avg_pf_00
        ? formatter.format(parseFloat(element.par_avg_pf_00))
        : "";

      active["Active Power"] = withUnit(
        format(element.par_avg_active_power_00),
        "kW",
      );
    }

    return (
      <>
        <Grid container item xs={12} spacing={1} className={classes.statusFont}>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            xxl={12}
            style={{
              textAlign: type === "EMS" ? "center" : "left",
              marginLeft: type === "EMS" ? "0" : "0.5vh",
              fontWeight: "bold",
              marginBottom: type === "EMS" ? "8px" : "0",
            }}
          >
            {element.name}
          </Grid>
        </Grid>

        {type === "EMS" ? (
          // 2x2 Grid Layout for EMS
          <Grid container spacing={1} style={{ padding: "0 8px" }}>
            {/* First Row - Voltage, Current */}
            <Grid item xs={6}>
              <Card
                className={classes.paper}
                style={{ height: "11vh", padding: "8px" }}
              >
                <div
                  className={classes.statusFont}
                  style={{ marginBottom: "4px" }}
                >
                  Voltage
                </div>
                <div
                  className={classes.statusFont}
                  style={{
                    color: blueColor[0],
                    fontWeight: "bold",
                    fontSize: "1.8vh",
                  }}
                >
                  {active["Voltage"]}
                </div>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card
                className={classes.paper}
                style={{ height: "11vh", padding: "8px" }}
              >
                <div
                  className={classes.statusFont}
                  style={{ marginBottom: "4px" }}
                >
                  Current
                </div>
                <div
                  className={classes.statusFont}
                  style={{
                    color: blueColor[0],
                    fontWeight: "bold",
                    fontSize: "1.8vh",
                  }}
                >
                  {active["Current"]}
                </div>
              </Card>
            </Grid>

            {/* Second Row - Power Factor, Active Power */}
            <Grid item xs={6}>
              <Card
                className={classes.paper}
                style={{ height: "11vh", padding: "8px" }}
              >
                <div
                  className={classes.statusFont}
                  style={{ marginBottom: "4px" }}
                >
                  Power Factor
                </div>
                <div
                  className={classes.statusFont}
                  style={{
                    color: blueColor[0],
                    fontWeight: "bold",
                    fontSize: "1.8vh",
                  }}
                >
                  {active["Power Factor"]}
                </div>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card
                className={classes.paper}
                style={{ height: "11vh", padding: "8px" }}
              >
                <div
                  className={classes.statusFont}
                  style={{ marginBottom: "4px" }}
                >
                  Active Power
                </div>
                <div
                  className={classes.statusFont}
                  style={{
                    color: blueColor[0],
                    fontWeight: "bold",
                    fontSize: "1.8vh",
                  }}
                >
                  {active["Active Power"]}
                </div>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Original layout for UPS
          <Grid
            container
            item
            xs={12}
            spacing={1}
            style={{ marginLeft: "0vh" }}
          >
            {Object.entries(active).map(([key, value]) => (
              <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} key={key}>
                <Card className={classes.paper} style={{ height: "11.5vh" }}>
                  <Grid
                    container
                    item
                    xs={12}
                    spacing={1}
                    direction="column"
                    alignItems="center"
                    className={classes.statusFont}
                  >
                    <Grid
                      item
                      xs={6}
                      sm={6}
                      md={6}
                      lg={6}
                      xl={6}
                      xxl={6}
                      style={{
                        color: "black",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      {key}
                    </Grid>
                    {key == "Load" ? (
                      <>
                        <div className={classes.semicircularbar}>
                          <SemiCircleProgressBar
                            stroke={blueColor[0]}
                            strokeWidth={20}
                            diameter={100}
                            orientation="up"
                            percentage={value}
                          />
                        </div>
                        <div
                          style={{
                            marginTop: "-2.5vh",
                            fontSize: "10px",
                          }}
                        >
                          {formatter.format(value)}
                        </div>
                      </>
                    ) : (
                      <Grid
                        item
                        xs={6}
                        sm={6}
                        md={6}
                        lg={6}
                        xl={6}
                        xxl={6}
                        style={{
                          color: blueColor[0],
                          fontWeight: "bold",
                        }}
                      >
                        {value}
                      </Grid>
                    )}
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </>
    );
  }
  useEffect(() => {}, []);

  return (
    <div className={classes.root}>
      <ThemeProvider theme={theme}>
        <Grid container spacing={1} style={{ marginTop: "1vh" }}>
          <Grid container item xs={12} spacing={1}>
            <Grid
              item
              xs={12}
              sm={12}
              md={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 4
                  : 2
              }
              lg={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 4
                  : 2
              }
              xl={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 4
                  : 2
              }
              xxl={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 4
                  : 2
              }
            >
              <Card
                className={classes.paper}
                style={{
                  height:
                    props.type === "CPM" ||
                    props.type === "AHU" ||
                    props.type === "CSU" ||
                    props.type === "ATCS"
                      ? "16vh"
                      : "14vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS" ? (
                  <Grid container item xs={12} spacing={1}>
                    <Grid
                      item
                      xs={5}
                      sm={5}
                      md={5}
                      lg={5}
                      xl={5}
                      xxl={5}
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              fontSize: "4.5vh",
                              fontWeight: "bold",
                              color: redColor[0],
                            }}
                          >
                            {props.processDataFromJson
                              ? 0
                              : parseInt(props.totalAlarms)}
                          </div>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sm={6}
                          md={6}
                          lg={6}
                          xl={6}
                          xxl={6}
                          className={classes.statusFont}
                        >
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              marginLeft: "-3.7vh",
                            }}
                          >
                            Total Alarms
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}>
                      <Divider
                        orientation="vertical"
                        flexItem
                        style={{ height: "13vh" }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={5}
                      sm={5}
                      md={5}
                      lg={5}
                      xl={5}
                      xxl={5}
                      className={classes.statusFont}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "2.7vh",
                        }}
                      >
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          Critical
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              marginLeft: "4vh",
                              color: redColor[0],
                            }}
                          >
                            {props.processDataFromJson
                              ? 0
                              : parseInt(props.criticalAlerts)}
                          </div>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: "1.5vh",
                        }}
                      >
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <div
                            style={{
                              marginLeft: "-0.5vh",
                            }}
                          >
                            Low
                          </div>
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              marginLeft: "4vh",
                              fontWeight: "bold",
                              color: yellowColor[0],
                            }}
                          >
                            {props.processDataFromJson
                              ? 0
                              : parseInt(props.soluAlerts)}
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid
                    container
                    item
                    xs={12}
                    spacing={1}
                    direction="column"
                    alignItems="center"
                  >
                    <Grid
                      item
                      xs={6}
                      sm={6}
                      md={6}
                      lg={6}
                      xl={6}
                      xxl={6}
                      style={{
                        fontSize: "2.5rem",
                      }}
                    >
                      <Success>0</Success>
                    </Grid>
                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                      <Typography
                        variant="h3"
                        style={{
                          fontWeight: "bold",
                          marginLeft: "-1vh",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Total Alarms
                      </Typography>
                    </Grid>
                  </Grid>
                )}
              </Card>
            </Grid>
            <Grid
              item
              xs={12}
              sm={12}
              md={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 8
                  : 10
              }
              lg={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 8
                  : 10
              }
              xl={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 8
                  : 10
              }
              xxl={
                props.type === "CPM" ||
                props.type === "AHU" ||
                props.type === "CSU" ||
                props.type === "ATCS"
                  ? 8
                  : 10
              }
            >
              <Card className={classes.paper} style={{ height:(props.type === 'CPM'|| props.type === 'AHU'|| props.type === 'CSU') ?"16vh":"14vh", overflow: devData.length>=2?"auto":""}}>
                <Grid container item xs={12} spacing={1} direction='row' style={{marginTop: window.innerHeight == '1080'?'0.3vh':'0.0vh',marginLeft:'0.0vh'}}>
                  {devData.map((res)=>
                          <>
                          {/* <Grid item xs sm md lg xl xxl> */}
                          <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                            {/* <Grid item xs={props.type === 'EMS'?12:3} sm={props.type === 'EMS'?2:''} md={props.type === 'EMS'?2:''} lg={props.type === 'EMS'?2:''} xl={props.type === 'EMS'?2:''} xxl={props.type === 'EMS'?2:''}> */}
                              <Card  onClick={() => onClickIssue(props.type=='CPM'||props.type=='AHU'||props.type=='CSU'?res.id:res.ssid, res.name)} style={{ boxShadow:
                                parseInt(res.alerts_cri)>=1?"inset 0px 0px 0px 2px rgb(179, 0, 0)":
                                parseInt(res.alerts_solu) >= 1 ?"inset 0px 0px 0px 2px rgb(242, 170, 26)":
                                (props.type=='CSU' && res['controlable']['CSU_Run_SS'] == 'active')|| (props.type=='AHU' && res['controlable']['SAF_VFD_On_Off_Fbk'] == 'active')||(props.type=='CPM' && res['Eqp_Attributes']['sts_on_off_00']['presentValue'] == 'active')? 'inset 0px 0px 0px 2px rgb(76 175 80)'
                                :
                                (props.type=='CSU' && res['controlable']['CSU_Run_SS'] == 'inactive')||(props.type=='AHU' && res['controlable']['SAF_VFD_On_Off_Fbk'] == 'inactive')|| (props.type=='CPM' && res['Eqp_Attributes']['sts_on_off_00']['presentValue'] == 'inactive')? 'inset 0px 0px 0px 2px rgb(158, 158, 158)'
                                :"inset 0px 0px 0px 2px rgb(158, 158, 158)",backgroundColor:"#fcfafa","border-radius": "10px", height: (props.type === 'CPM') ?"13.5vh": (props.type === 'AHU'|| props.type === 'CSU')? (devData.length>=0?"13.5vh":"6.7vh"):"11.5vh" }}>
                                  <Grid container item xs={12} direction='column' style={{justifyContent: "center",alignContent: "center", whiteSpace: "nowrap", cursor: "pointer"}}>
                                      <Grid container item xs={12} spacing={1} direction='column' alignItems='center' className={classes.statusFont}>                                    
                                          <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}></Grid>
                                          <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}><div style={{marginLeft:'-0.8vh'}}>{res.name}{" "}
                                            {(props.type=='CPM')?<></>:
                                            <RunStatusIcon style={{width:'1.7vh', color:
                                              (props.type=='CSU' && res['controlable']['CSU_Run_SS'] == 'active')|| (props.type=='AHU' && res['controlable']['SAF_VFD_On_Off_Fbk'] == 'active')
                                              // ||(props.type=='CPM' && res['Eqp_Attributes']['sts_on_off_00']['presentValue'] == 'active')
                                              ?
                                                  greenColor[0]:'#D3D3D3'}}/>
                                            }
                                              </div></Grid>
                                          <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5}>
                                            {(props.type === 'CPM'|| props.type === 'AHU'|| props.type === 'CSU')?
                                            <>{
                                              // (props.type=='CSU' && res['controlable']['CSU_Run_SS'] == 'active')|| (props.type=='AHU' && res['controlable']['SAF_VFD_On_Off_Fbk'] == 'active')||(props.type=='CPM' && res['Eqp_Attributes']['sts_on_off_00']['presentValue'] == 'active') ?
                                              // <div style={{ justifyContent: 'center', textAlign: 'center',fontFamily:'helvetica'}}><Typography style={{fontSize:'3.5vh', marginTop: '-1vh',color: greenColor[0]}}>{props.processDataFromJson? 0:parseInt(res.alerts_cri) + parseInt(res.alerts_solu)}</Typography></div>
                                              // :
                                              ((parseInt(res.alerts_solu) >= 1)&& ( parseInt(res.alerts_cri) >= 1 ))?
                                              <div style={{ justifyContent: 'center', textAlign: 'center',fontFamily:'helvetica'}}><Typography style={{fontSize:'3.5vh', marginTop: '-1vh',color:redColor[0]}}>{props.processDataFromJson? 0:(parseInt(res.alerts_cri)+parseInt(res.alerts_solu))}</Typography></div>
                                              :parseInt(res.alerts_solu) >= 1 ?
                                                <div style={{ justifyContent: 'center', textAlign: 'center',fontFamily:'helvetica'}}><Typography style={{fontSize:'3.5vh', marginTop: '-1vh',color:yellowColor[0]}}>{props.processDataFromJson? 0:parseInt(res.alerts_solu)}</Typography></div>
                                                : parseInt(res.alerts_cri) >= 1 ?
                                                <div style={{ justifyContent: 'center', textAlign: 'center',fontFamily:'helvetica'}}><Typography style={{fontSize:'3.5vh', marginTop: '-1vh',color:redColor[0]}}>{props.processDataFromJson? 0:parseInt(res.alerts_cri)}</Typography></div>
                                                :
                                                (props.type=='CSU' && res['controlable']['CSU_Run_SS'] == 'inactive')|| (props.type=='AHU' && res['controlable']['SAF_VFD_On_Off_Fbk'] == 'inactive')||(props.type=='CPM' && res['Eqp_Attributes']['sts_on_off_00']['presentValue'] == 'inactive') ?
                                                <div style={{ justifyContent: 'center', textAlign: 'center',fontFamily:'helvetica'}}><Typography style={{fontSize:'3.5vh', marginTop: '-1vh',color:'#D3D3D3'}}>0</Typography></div>
                                                :0
                                            }</>
                                            :
                                            0
                                          }
                                          {/* 0 */}
                                          </Grid>
                                      </Grid>      
                                  </Grid>
                              </Card>          
                            </Grid>
                            </>
                  )}
                  {/* {emptyCardsDev} */}
                </Grid>
                </Card>
            </Grid>
          </Grid>
        </Grid>
        {props.type === "CPM" ||
        props.type === "AHU" ||
        props.type === "CSU" ||
        props.type === "ATCS" ? (
          <></>
        ) : (
          // <Grid container spacing={1}>
          //   <Grid container item xs={12} spacing={2}>
          //     {props.device.map((element, index) => (
          //       <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
          //         <Card className={classes.paper} style={{ height: "32.5vh" }}>
          //           <>{EachDevCardForDetails(props.type, element, index)}</>
          //         </Card>
          //       </Grid>
          //     ))}
          //   </Grid>
          // </Grid>
          <Grid container spacing={1}>
            <Grid container item xs={12} spacing={2}>
              {[...props.device]
                // .filter((d) => {
                //   const EnergyCardName = (d.name || "")
                //     .replace(/[\t\r\n]/g, "")
                //     .trim();
                //   return allowedDevicePrefixes.some((prefix) =>
                //     EnergyCardName.startsWith(prefix)
                //   );
                // })
                .sort((a, b) => {
                  // newlines, and trimming
                  const nameA = (a.name || "").replace(/[\t\r\n]/g, "").trim();
                  const nameB = (b.name || "").replace(/[\t\r\n]/g, "").trim();

                  // Check if names start with a letter or number
                  const startsWithLetterA = /^[a-zA-Z]/.test(nameA);
                  const startsWithLetterB = /^[a-zA-Z]/.test(nameB);

                  // If one starts with letter and other doesn't, letter comes first
                  if (startsWithLetterA && !startsWithLetterB) return -1;
                  if (!startsWithLetterA && startsWithLetterB) return 1;

                  // Both are same type, sort naturally with numeric handling
                  return nameA
                    .toLowerCase()
                    .localeCompare(nameB.toLowerCase(), undefined, {
                      numeric: true,
                      sensitivity: "base",
                    });
                })
                .map((element, index) => (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    xxl={4}
                    key={index}
                  >
                    <Card
                      className={classes.paper}
                      style={{ height: "32.5vh" }}
                    >
                      <>{EachDevCardForDetails(props.type, element, index)}</>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          </Grid>
        )}
      </ThemeProvider>
    </div>
  );
}

export default withRouter(UpsEmsLanding);
