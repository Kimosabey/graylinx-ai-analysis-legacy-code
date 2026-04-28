import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Card, Typography } from "@material-ui/core";
import api from "../../api";
import TimeS from "../TimeS";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  cardContainer: {
    padding: theme.spacing(0.5),
  },
  card: {
    padding: theme.spacing(0.75),
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "6px",
    height: "150px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    [theme.breakpoints.up("md")]: {
      height: "190px",
    },
    [theme.breakpoints.up("lg")]: {
      height: "230px",
    },
  },
  title: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#0123b4",
    marginBottom: theme.spacing(1),
    textAlign: "center",
  },
  chartContainer: {
    flex: 1,
    overflow: "auto",
    width: "100%",
  },
}));

/**
 * FieldDeviceGraphs - Displays KW, TR, and KW/TR trend data
 * Uses cpmGetDevData and getDeviceData APIs
 */
function FieldDeviceGraphs(props) {
  const classes = useStyles();
  const [graphsData, setGraphsData] = useState({
    kw: [],
    tr: [],
    kwtr: [],
  });
  const [loading, setLoading] = useState(true);
  const [emsDeviceId, setEmsDeviceId] = useState(null);
  const [btuDeviceId, setBtuDeviceId] = useState(null);

  useEffect(() => {
    fetchDeviceIds();
    
    // Set up polling interval for real-time updates
    const timer = setInterval(() => {
      if (emsDeviceId || btuDeviceId) {
        fetchGraphData(emsDeviceId, btuDeviceId);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [emsDeviceId, btuDeviceId]);

  const fetchDeviceIds = () => {
    console.log("[FieldDeviceGraphs] Fetching device IDs from cpmGetDevData");
    
    api.floor
      .cpmGetDevData()
      .then((res) => {
        console.log("[FieldDeviceGraphs] cpmGetDevData response:", res);
        
        let emsId = null;
        let btuId = null;

        // Find EMS device for KW data
        if (res["NONGL_SS_EMS"]) {
          const emsDevices = Object.values(res["NONGL_SS_EMS"]);
          if (emsDevices.length > 0) {
            emsId = emsDevices[0].id;
            setEmsDeviceId(emsId);
            console.log("[FieldDeviceGraphs] Found EMS device ID:", emsId);
          }
        }

        // Find BTU meter device for TR data
        if (res["NONGL_SS_BTU_METER"]) {
          const btuDevices = Object.values(res["NONGL_SS_BTU_METER"]);
          if (btuDevices.length > 0) {
            btuId = btuDevices[0].id;
            setBtuDeviceId(btuId);
            console.log("[FieldDeviceGraphs] Found BTU device ID:", btuId);
          }
        }

        // Fetch initial graph data
        if (emsId || btuId) {
          fetchGraphData(emsId, btuId);
        } else {
          console.warn("[FieldDeviceGraphs] No EMS or BTU devices found");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("[FieldDeviceGraphs] Error fetching device IDs:", error);
        setLoading(false);
      });
  };

  const fetchGraphData = (emsId, btuId) => {
    const req = {
      startdate: "start",
      enddate: "end",
    };

    let kwData = [];
    let trData = [];

    // Fetch KW data from EMS device
    if (emsId) {
      api.floor
        .getDeviceData(req, emsId, "NONGL_SS_EMS", "1 WEEK")
        .then((response) => {
          console.log("[FieldDeviceGraphs] EMS response:", response);
          
          if (response.graphData && response.graphData[0]) {
            // Try multiple possible parameter names for KW
            kwData = response.graphData[0]["KW"] || 
                     response.graphData[0]["kW"] || 
                     response.graphData[0]["Active_Power"] || 
                     response.graphData[0]["ACTIVE_POWER"] || [];
            
            console.log("[FieldDeviceGraphs] KW data points:", kwData.length);
            
            setGraphsData((prev) => ({
              ...prev,
              kw: kwData,
            }));
          }
        })
        .catch((error) => {
          console.error("[FieldDeviceGraphs] Error fetching KW data:", error);
        });
    }

    // Fetch TR data from BTU meter device
    if (btuId) {
      api.floor
        .getDeviceData(req, btuId, "NONGL_SS_BTU_METER", "1 WEEK")
        .then((response) => {
          console.log("[FieldDeviceGraphs] BTU response:", response);
          
          if (response.graphData && response.graphData[0]) {
            // Get BTU data and convert to TR (1 TR = 12000 BTU/hr)
            const btuData = response.graphData[0]["Btu_Meter_Energy_Consump"] || 
                           response.graphData[0]["BTU"] || 
                           response.graphData[0]["btu"] || [];
            
            // Convert BTU to TR
            trData = btuData.map(item => ({
              ...item,
              param_value: (parseFloat(item.param_value) / 12000).toFixed(2)
            }));
            
            console.log("[FieldDeviceGraphs] TR data points:", trData.length);
            
            setGraphsData((prev) => ({
              ...prev,
              tr: trData,
            }));

            // Calculate KW/TR if we have both datasets
            if (kwData.length > 0 && trData.length > 0) {
              calculateKwTr(kwData, trData);
            }
          }
        })
        .catch((error) => {
          console.error("[FieldDeviceGraphs] Error fetching TR data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const calculateKwTr = (kwData, trData) => {
    console.log("[FieldDeviceGraphs] Calculating KW/TR");
    
    const kwTrData = kwData.map((kwItem) => {
      // Find matching TR data point by timestamp
      const matchingTrItem = trData.find(
        (trItem) => trItem.measured_time === kwItem.measured_time
      );
      
      if (matchingTrItem && parseFloat(matchingTrItem.param_value) !== 0) {
        const kwTrValue = (
          parseFloat(kwItem.param_value) / parseFloat(matchingTrItem.param_value)
        ).toFixed(2);
        
        return {
          measured_time: kwItem.measured_time,
          param_value: kwTrValue,
        };
      }
      return null;
    }).filter(item => item !== null);
    
    console.log("[FieldDeviceGraphs] KW/TR data points:", kwTrData.length);
    
    setGraphsData((prev) => ({
      ...prev,
      kwtr: kwTrData,
    }));
  };

  if (loading) {
    return (
      <Grid container spacing={1} className={classes.root}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={4} key={i} className={classes.cardContainer}>
            <Card className={classes.card}>
              <Typography className={classes.title}>Loading...</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={1} className={classes.root}>
      {/* KW Graph */}
      <Grid item xs={12} sm={4} className={classes.cardContainer}>
        <Card className={classes.card}>
          <Typography className={classes.title}>KW</Typography>
          <div className={classes.chartContainer}>
            {graphsData.kw && graphsData.kw.length > 0 ? (
              <TimeS
                data={graphsData.kw}
                name="Plant Power"
                minRange="0"
                maxRange="1000"
              />
            ) : (
              <Typography variant="caption" style={{ color: "#999", textAlign: "center", marginTop: "50px", display: "block" }}>
                No data available
              </Typography>
            )}
          </div>
        </Card>
      </Grid>

      {/* TR Graph */}
      <Grid item xs={12} sm={4} className={classes.cardContainer}>
        <Card className={classes.card}>
          <Typography className={classes.title}>TR</Typography>
          <div className={classes.chartContainer}>
            {graphsData.tr && graphsData.tr.length > 0 ? (
              <TimeS
                data={graphsData.tr}
                name="Plant Load"
                minRange="0"
                maxRange="500"
              />
            ) : (
              <Typography variant="caption" style={{ color: "#999", textAlign: "center", marginTop: "50px", display: "block" }}>
                No data available
              </Typography>
            )}
          </div>
        </Card>
      </Grid>

      {/* KW/TR Graph */}
      <Grid item xs={12} sm={4} className={classes.cardContainer}>
        <Card className={classes.card}>
          <Typography className={classes.title}>KW/TR</Typography>
          <div className={classes.chartContainer}>
            {graphsData.kwtr && graphsData.kwtr.length > 0 ? (
              <TimeS
                data={graphsData.kwtr}
                name="Plant Efficiency"
                minRange="0"
                maxRange="2"
              />
            ) : (
              <Typography variant="caption" style={{ color: "#999", textAlign: "center", marginTop: "50px", display: "block" }}>
                No data available
              </Typography>
            )}
          </div>
        </Card>
      </Grid>
    </Grid>
  );
}

export default FieldDeviceGraphs;