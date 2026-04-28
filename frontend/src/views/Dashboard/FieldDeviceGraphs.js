import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Card, Typography, Box } from "@material-ui/core";
import api from "../../api";
import TimeS2 from "../TimeS2";
import ReactSpeedometer from "react-d3-speedometer";

const useStyles = makeStyles((theme) => ({
  root: { flexGrow: 1, overflow: "hidden" },

  graphpaper: {
    padding: theme.spacing(1),
    textAlign: "center",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#Fefefa",
    borderRadius: "6px",
    height: "100%",
    minHeight: "200px",
    boxSizing: "border-box",
  },

  CardHeadFont: {
    fontSize: "1.7vh",
    fontWeight: "bold",
    color: "black",
    marginBottom: theme.spacing(1),
  },
}));

function FieldDeviceGraphs() {
  const classes = useStyles();

  const [graphsData, setGraphsData] = useState({
    kw: [],
    tr: [],
    kwtr: [],
  });

  console.log(graphsData,"graphsData");
  
  const [instantaneousKWTR, setInstantaneousKWTR] = useState(0);
  const [loading, setLoading] = useState(true);
  const [instanceKwPerTr, setInstanceKwPerTr] = useState(0);

  useEffect(() => {
    fetchGraphData();

    const timer = setInterval(() => {
      fetchGraphData();
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const fetchGraphData = () => {
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

    const format = (date) => {
      const pad = (n) => (n < 10 ? "0" + n : n);
      return date.getFullYear() + "-" +
        pad(date.getMonth() + 1) + "-" +
        pad(date.getDate()) + " " +
        pad(date.getHours()) + ":" +
        pad(date.getMinutes()) + ":" +
        pad(date.getSeconds());
    };

    const formattedStart = format(start);
    const formattedEnd = format(end);
    api.analytics.chillerPlantData(
      // "2026-03-31 15:09:50",
      // "2026-04-01 15:09:50",
      formattedStart,
      formattedEnd,
    ).then((res) => {
console.log(res,"resresres");

      let response = res?.data || [];

      api.floor.getPlantApi().then((res) => {
        if (res) {
          console.log("instance kw per tr", res);
          setInstanceKwPerTr(res?.[0]?.kw_per_tr);
        }
      });

console.log("Raw Response:", response);
      const kwData = response
        .filter((x) => x.Total_Plant_kW !== null && x.Total_Plant_kW !== undefined)
        .map((x) => ({
          measured_time: x.slot_time,   // ✅ FIXED: was x.measured_time
          param_value: Number(x.Total_Plant_kW),
        }));
      console.log("KW Data:", kwData);

      // ----- TR -----
      const trData = response
        .filter((x) => x.Total_Plant_TR !== null && x.Total_Plant_TR !== undefined)
        .map((x) => ({
          measured_time: x.slot_time,   // ✅ FIXED: was x.measured_time
          param_value: Number(x.Total_Plant_TR),
        }));
      console.log("TR Data:", trData);

      // ----- KW/TR Trend - uses SPC_avg -----
      const kwtrData = response
        .filter(
          (x) =>
            x.kwh_per_trh !== null &&
            x.kwh_per_trh !== undefined &&
            x.kwh_per_trh !== "SPC_avg_ERROR"
        )
        .map((x) => ({
          measured_time: x.slot_time,   // ✅ FIXED: was x.measured_time
          param_value: x.kwh_per_trh,
        }));

      // ----- Speedometer - uses SPC_i (instantaneous) -----
      const latestKWTR =
        response
          .filter(
            (x) =>
              x.kW_per_TR !== null &&
              x.kW_per_TR !== undefined &&
              x.kW_per_TR !== "SPC_i_ERROR" &&
              !isNaN(x.kW_per_TR)
          )
          .sort(
            (a, b) =>
              new Date(b.slot_time) - new Date(a.slot_time)  // ✅ FIXED: was b.measured_time / a.measured_time
          )[0]?.kW_per_TR || 0;

      setInstantaneousKWTR(response?.[response.length - 1]?.kW_per_TR || 0);
      setGraphsData({
        kw: kwData,
        tr: trData,
        kwtr: kwtrData,
      });

      setLoading(false);
    })
      .catch((err) => {
        console.error("Error fetching metrics:", err);
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <Grid container spacing={1} className={classes.root}>
        <Grid item xs={12}>
          <Typography style={{ textAlign: "center", padding: "20px" }}>
            Loading Plant Metrics...
          </Typography>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box style={{ overflow: "hidden", height: "100%" }}>
      <Grid container spacing={1} className={classes.root}>

        {/* Instantaneous Plant IKW/TR - Speedometer (uses SPC_i) */}
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={classes.graphpaper}>
            <div className={classes.CardHeadFont}>
              Instantaneous Plant KW/TR
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "2vh",
              }}
            >
              <ReactSpeedometer
                width={200}
                height={150}
                minValue={0}
                maxValue={2}
                value={instanceKwPerTr ? Number(instanceKwPerTr).toFixed(2) : 0}
                needleColor="red"
                startColor="green"
                endColor="red"
                segments={3}
                maxSegmentLabels={0}
              />
            </div>
          </Box>
        </Grid>

        {/* IKW/TR Trend (uses SPC_avg) */}
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={classes.graphpaper}>
            <div className={classes.CardHeadFont}>Plant KW/TR Trend</div>
            {graphsData.kwtr.length > 0 ? (
              <TimeS2
                name="kW/TR"
                data={graphsData.kwtr}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Typography
                style={{ textAlign: "center", marginTop: 40, color: "#999" }}
              >
                No data available
              </Typography>
            )}
          </Box>
        </Grid>

        {/* TR Trend */}
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={classes.graphpaper}>
            <div className={classes.CardHeadFont}>Plant TR Trend</div>
            {graphsData.tr.length > 0 ? (
              <TimeS2
                name="TR"
                data={graphsData.tr}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Typography
                style={{ textAlign: "center", marginTop: 40, color: "#999" }}
              >
                No data available
              </Typography>
            )}
          </Box>
        </Grid>

        {/* KW Trend */}
        <Grid item xs={12} sm={6} md={6} lg={6} xl={6}>
          <Box className={classes.graphpaper}>
            <div className={classes.CardHeadFont}>Plant KW Trend</div>
            {graphsData.kw.length > 0 ? (
              <TimeS2
                name="KW"
                data={graphsData.kw}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <Typography
                style={{ textAlign: "center", marginTop: 40, color: "#999" }}
              >
                No data available
              </Typography>
            )}
          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}

export default FieldDeviceGraphs;