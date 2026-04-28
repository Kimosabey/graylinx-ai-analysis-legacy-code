import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../../api";
import Success from "components/Typography/Success";
import TimeSeries from "../TimeSeries.js";
import TimeSeries1 from "../TimeS";
import { Grid, Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  paper: {
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    padding: theme.spacing(1),
    textAlign: "center",
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    opacity: "1",
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4",
      borderRadius: "8px",
    },
  },
  headingFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      textAlign: "center",
      fontSize: "1.5vh",
      color: "black",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      textAlign: "center",
      fontSize: "1.6vh",
      color: "black",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      textAlign: "center",
      fontSize: "1.5vh",
      color: "black",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      textAlign: "center",
      fontSize: "1.8vh",
      whiteSpace: "nowrap",
      color: "black",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      textAlign: "center",
      fontSize: "1.8vh",
      color: "black",
      whiteSpace: "nowrap",
    },
  },
  statusFont: {
    "@media (min-width:0px) and (max-width:599.95px)": {
      textAlign: "center",
      fontSize: "3.3vh",
      color: "black",
    },
    "@media (min-width:600px) and (max-width:959.95px)": {
      textAlign: "center",
      fontSize: "3.5vh",
      color: "black",
    },
    "@media (min-width:960px) and (max-width:1279.95px)": {
      textAlign: "center",
      fontSize: "2.7vh",
      color: "black",
    },
    "@media (min-width:1280px) and (max-width:1919.95px)": {
      textAlign: "center",
      fontSize: "3.5vh",
      whiteSpace: "nowrap",
      color: "black",
    },
    "@media (min-width:1920px) and (max-width:2559.95px)": {
      textAlign: "center",
      fontSize: "3.3vh",
      color: "black",
      whiteSpace: "nowrap",
    },
  },
  graphpaper: {
    height: "29vh",
    padding: theme.spacing(1),
    textAlign: "center",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    opacity: "1",
    borderRadius: "14px",
  },
}));

const getMyValue = (input, params = []) => {
  let test = -1;
  try {
    if (input !== undefined) test = input[params[0]];
    else return;
    if (test !== undefined) {
      for (let i = 1; i < params.length; i++) {
        if (params[i] !== undefined) test = test[params[i]];
        else break;
      }
    }
  } catch (e) {
    console.log("My Error in getMyValue: ", e.message);
  }
  return test;
};

function GlEnergyMeter(props) {
  const classes = useStyles();

  // Live metrics state
  const [present, setPresent] = useState("");
  const [kw, setkW] = useState("");
  const [apparent, setApparent] = useState("");
  const [active, setActive] = useState("");
  const [reactive, setReactive] = useState("");
  const [power, setPower] = useState("");
  const [voltR, setVoltR] = useState(null);
  const [voltY, setVoltY] = useState(null);
  const [voltB, setVoltB] = useState(null);
  const [voltage_ll, setVoltageLL] = useState("");
  const [voltage_ln, setVoltageLN] = useState("");
  const [curR, setCurR] = useState(null);
  const [curY, setCurY] = useState(null);
  const [curB, setCurB] = useState(null);
  const [current, setCurrent] = useState("");
  const [freq, setFreq] = useState("");

  // Graph data state - consolidated into single object
  const [graphData, setGraphData] = useState({
    lnphase1: [],
    lnphase2: [],
    lnphase3: [],
    llphase1: [],
    llphase2: [],
    llphase3: [],
    llAvg: [],
    currentphase1: [],
    currentphase2: [],
    currentphase3: [],
    currentAvg: [],
    activeGraph: [],
    reactiveGraph: [],
    apparentGraph: [],
    powerfactorGraph: [],
  });

  // UI state
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [floor, setFloor] = useState([]);
  const initialState1 = props.location.state?.dev_id || "";
  const [deviceid, setDeviceid] = useState(initialState1);
  const initialState = props.location.state?.dev_name || "";
  const [data, setData] = useState(initialState);
  const [activeEMS, setActiveEMS] = useState(initialState1);
  const [energydevice, setEnergydevice] = useState([]);
  const [loading, setLoading] = useState(false);

  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);

  const formatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    []
  );

  const DEVICE_TYPE = "NONGL_SS_EMS";
  const TIME_RANGE = "1 week";
  const REQUEST_BODY = { startdate: "start", enddate: "end" };

  // Calculate averages
  useEffect(() => {
    if (voltR !== null && voltY !== null && voltB !== null) {
      const avgLL = ((voltR + voltY + voltB) / 3).toFixed(2);
      setVoltageLL(avgLL);
    }

    if (curR !== null && curY !== null && curB !== null) {
      const avgCur = ((curR + curY + curB) / 3).toFixed(2);
      setCurrent(avgCur);
    }
  }, [voltR, voltY, voltB, curR, curY, curB]);

  // Process live snapshot data
  const processSnapshotData = useCallback((res) => {
    res.forEach((ele) => {
      switch (ele.param_id) {
        case "par_current_01":
          setCurR(parseFloat(ele.param_value));
          break;
        case "par_current_02":
          setCurY(parseFloat(ele.param_value));
          break;
        case "par_current_03":
          setCurB(parseFloat(ele.param_value));
          break;
        case "par_voltage_01":
          setVoltR(parseFloat(ele.param_value));
          break;
        case "par_voltage_02":
          setVoltY(parseFloat(ele.param_value));
          break;
        case "par_voltage_03":
          setVoltB(parseFloat(ele.param_value));
          break;
        case "Prsnt_Dmd":
          setPresent(ele.param_value);
          break;
        case "par_avg_apparent_power_00":
          setApparent(ele.param_value);
          break;
        case "par_avg_reactive_power_00":
          setReactive(ele.param_value);
          break;
        case "kW":
          setkW(ele.param_value);
          break;
        case "par_avg_active_power_00":
          setActive(ele.param_value);
          break;
        case "par_avg_pf_00":
          setPower(ele.param_value);
          break;
        case "Volt_LN_Avg":
          setVoltageLN(ele.param_value);
          break;
        case "par_frequency_00":
          setFreq(ele.param_value);
          break;
        default:
          break;
      }
    });
  }, []);

  // Process graph data
  const processGraphData = useCallback((res) => {
    if (!res.graphData || !res.graphData.length) {
      setGraphData({
        lnphase1: [],
        lnphase2: [],
        lnphase3: [],
        llphase1: [],
        llphase2: [],
        llphase3: [],
        llAvg: [],
        currentphase1: [],
        currentphase2: [],
        currentphase3: [],
        currentAvg: [],
        activeGraph: [],
        reactiveGraph: [],
        apparentGraph: [],
        powerfactorGraph: [],
      });
      return;
    }

    const gd = res.graphData[0];

    setGraphData({
      lnphase1: gd["Volt_LN_Ph1"]
        ? getMyValue(res, ["graphData", 0, "Volt_LN_Ph1"])
        : [],
      lnphase2: gd["Volt_LN_Ph2"]
        ? getMyValue(res, ["graphData", 0, "Volt_LN_Ph2"])
        : [],
      lnphase3: gd["Volt_LN_Ph3"]
        ? getMyValue(res, ["graphData", 0, "Volt_LN_Ph3"])
        : [],
      llphase1: gd["par_voltage_01"]
        ? getMyValue(res, ["graphData", 0, "par_voltage_01"])
        : [],
      llphase2: gd["par_voltage_02"]
        ? getMyValue(res, ["graphData", 0, "par_voltage_02"])
        : [],
      llphase3: gd["par_voltage_03"]
        ? getMyValue(res, ["graphData", 0, "par_voltage_03"])
        : [],
      currentphase1: gd["par_current_01"]
        ? getMyValue(res, ["graphData", 0, "par_current_01"])
        : [],
      currentphase2: gd["par_current_02"]
        ? getMyValue(res, ["graphData", 0, "par_current_02"])
        : [],
      currentphase3: gd["par_current_03"]
        ? getMyValue(res, ["graphData", 0, "par_current_03"])
        : [],
      currentAvg: gd["Cur_Avg"]
        ? getMyValue(res, ["graphData", 0, "Cur_Avg"])
        : [],
      llAvg: gd["Volt_LL_Avg"]
        ? getMyValue(res, ["graphData", 0, "Volt_LL_Avg"])
        : [],
      activeGraph: gd["par_avg_active_power_00"]
        ? getMyValue(res, ["graphData", 0, "par_avg_active_power_00"])
        : [],
      reactiveGraph: gd["par_avg_reactive_power_00"]
        ? getMyValue(res, ["graphData", 0, "par_avg_reactive_power_00"])
        : [],
      apparentGraph: gd["par_avg_apparent_power_00"]
        ? getMyValue(res, ["graphData", 0, "par_avg_apparent_power_00"])
        : [],
      powerfactorGraph: gd["par_avg_pf_00"]
        ? getMyValue(res, ["graphData", 0, "par_avg_pf_00"])
        : [],
    });
  }, []);

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setPresent("");
    setkW("");
    setApparent("");
    setReactive("");
    setActive("");
    setPower("");
    setVoltageLL("");
    setVoltageLN("");
    setCurrent("");
    setFreq("");
    setGraphData({
      lnphase1: [],
      lnphase2: [],
      lnphase3: [],
      llphase1: [],
      llphase2: [],
      llphase3: [],
      llAvg: [],
      currentphase1: [],
      currentphase2: [],
      currentphase3: [],
      currentAvg: [],
      activeGraph: [],
      reactiveGraph: [],
      apparentGraph: [],
      powerfactorGraph: [],
    });
  }, []);

  // Floor change handler
  const handlefloorchange = useCallback(
    (name, id) => {
      setFdata(name);
      setLoading(true);

      api.floor
        .devicemap(id, "energyMeter")
        .then((res) => {
          if (res.length === 0) {
            setActiveEMS("");
            setEnergydevice([]);
            clearMetrics();
          } else {
            res.sort((a, b) =>
              a.name > b.name ? 1 : b.name > a.name ? -1 : 0
            );
            setEnergydevice(res);
          }
        })
        .catch((error) => {
          console.log("devicemap error in handlefloorchange");
          setEnergydevice([]);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [clearMetrics]
  );

  // Device change handler
  const handleChange = useCallback(
    (name, id) => {
      setActiveEMS(id);
      setDeviceid(id);
      setData(name);
      setLoading(true);

      // Load snapshot data
      api.floor
        .EmsData(id)
        .then(processSnapshotData)
        .catch(() => {
          clearMetrics();
        });

      // Load graph data
      api.floor
        .getDeviceData(REQUEST_BODY, id, DEVICE_TYPE, TIME_RANGE)
        .then(processGraphData)
        .catch(() => {
          setGraphData({
            lnphase1: [],
            lnphase2: [],
            lnphase3: [],
            llphase1: [],
            llphase2: [],
            llphase3: [],
            llAvg: [],
            currentphase1: [],
            currentphase2: [],
            currentphase3: [],
            currentAvg: [],
            activeGraph: [],
            reactiveGraph: [],
            apparentGraph: [],
            powerfactorGraph: [],
          });
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [processSnapshotData, processGraphData, clearMetrics]
  );

  // Initial load effect
  useEffect(() => {
    let zone_id = "";
    let z_data = [];

    zone_data.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
    zone_data.filter((_each) => {
      if (_each.zone_type === "GL_LOCATION_TYPE_FLOOR") {
        z_data.push(_each);
      }
      return null;
    });

    zone_id = z_data[0]?.uuid;
    if (z_data[0]) {
      setFdata(z_data[0].name);
    }

    if (!zone_id) {
      setEnergydevice([]);
      setActiveEMS("");
      setData("");
      return;
    }

    api.floor
      .devicemap(zone_id, "energyMeter")
      .then((res) => {
        res.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        setEnergydevice(res);

        if (deviceid === "" && data === "" && res.length > 0) {
          const firstDevice = res[0];
          setData(firstDevice.name);
          setDeviceid(firstDevice.ssid);
          setActiveEMS(firstDevice.ssid);

          // Initial snapshot
          api.floor
            .EmsData(firstDevice.ssid)
            .then(processSnapshotData)
            .catch(() => {});

          // Initial device trend
          api.floor
            .getDeviceData(
              REQUEST_BODY,
              firstDevice.ssid,
              DEVICE_TYPE,
              TIME_RANGE
            )
            .then(processGraphData)
            .catch(() => {});
        } else if (activeEMS) {
          api.floor
            .EmsData(activeEMS)
            .then(processSnapshotData)
            .catch(() => {});

          api.floor
            .getDeviceData(REQUEST_BODY, activeEMS, DEVICE_TYPE, TIME_RANGE)
            .then(processGraphData)
            .catch(() => {});
        }
      })
      .catch(() => {
        setEnergydevice([]);
        setData("");
        setActiveEMS("");
      });

    const PLANTROOM_ID = "2ffc9cf4-f0c6-4299-9961-921a86542bc7";

    api.dashboard
      .getMetricData(buildingID)
      .then((res) => {
        res.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        const plant = res.find(
          (f) =>
            f.id === PLANTROOM_ID ||
            (f.name && f.name.toLowerCase().includes("plantroom")) ||
            (f.name && f.name.toLowerCase().includes("plant"))
        );

        if (plant) {
          setFloor([plant]);
          setFdata(plant.name);
          try {
            handlefloorchange(plant.name, plant.id);
          } catch (e) {
            // handlefloorchange may not be stable in deps; best-effort call
            console.warn("Plantroom load failed:", e.message);
          }
        } else {
          setFloor(res);
        }
      })
      .catch(() => {
        setFloor([]);
      });
  }, [
    buildingID,
    zone_data,
    deviceid,
    data,
    activeEMS,
    processSnapshotData,
    processGraphData,
  ]);

  // Polling effect
  useEffect(() => {
    if (!activeEMS) return;

    const timer = setInterval(() => {
      api.floor
        .EmsData(activeEMS)
        .then(processSnapshotData)
        .catch(() => {});

      api.floor
        .getDeviceData(REQUEST_BODY, activeEMS, DEVICE_TYPE, TIME_RANGE)
        .then(processGraphData)
        .catch(() => {});
    }, 5000);

    return () => clearInterval(timer);
  }, [activeEMS, processSnapshotData, processGraphData]);

  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Grid container xs={12} spacing={2}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={5} lg={5} xl={5}>
            <FormControl
              variant="filled"
              size="large"
              className={classes.formControl}
              style={{
                width: "max-content",
                minWidth: "100%",
                backgroundColor: "#eeeef5",
                fontFamily: "Arial",
              }}
            >
              <Select
                labelId="filled-hidden-label-small"
                id="demo-simple-select-outlined"
                label="Floor"
                className={classes.select}
                style={{
                  fontWeight: "bold",
                  height: "6vh",
                  borderRadius: "0.8vw",
                  fontFamily: "Arial",
                }}
                value={fdata || ""}
                disableUnderline
                onChange={(e) => {
                  const selectedFloor = floor.find(
                    (f) => f.name === e.target.value
                  );
                  if (selectedFloor) {
                    handlefloorchange(selectedFloor.name, selectedFloor.id);
                  }
                }}
              >
                {floor.map((_item) => (
                  <MenuItem key={_item.id} value={_item.name}>
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
            <FormControl
              variant="filled"
              size="large"
              className={classes.formControl}
              style={{
                width: "max-content",
                minWidth: "100%",
                backgroundColor: "#eeeef5",
                fontFamily: "Arial",
              }}
            >
              <Select
                labelId="filled-hidden-label-small"
                id="demo-simple-select-outlined"
                label="Device"
                className={classes.select}
                style={{
                  fontWeight: "bold",
                  height: "6vh",
                  borderRadius: "0.8vw",
                  fontFamily: "Arial",
                }}
                value={data || ""}
                disableUnderline
                onChange={(e) => {
                  const selectedDevice = energydevice.find(
                    (d) => d.name === e.target.value
                  );
                  if (selectedDevice) {
                    handleChange(selectedDevice.name, selectedDevice.ssid);
                  }
                }}
              >
                {energydevice.map((_item) => (
                  <MenuItem key={_item.ssid} value={_item.name}>
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>

      {/* Top metric cards */}
      <Grid container xs={12} spacing={2}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Card className={`${classes.paper}`}>
              <Grid container item xs={12} spacing={1}>
                {/* Voltage */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                        className={classes.headingFont}
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
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
                          }}
                        >
                          Voltage
                        </Grid>
                        <Grid container item xs={12}>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={classes.statusFont}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Success>{formatter.format(voltage_ll)}V</Success>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {/* Current */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                        className={classes.headingFont}
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
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
                          }}
                        >
                          Current
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          sm={12}
                          md={12}
                          lg={12}
                          xl={12}
                          xxl={12}
                          className={classes.statusFont}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Success>{formatter.format(current)}A</Success>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {/* Power Factor */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                        className={classes.headingFont}
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
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
                          }}
                        >
                          Power Factor
                        </Grid>
                        <Grid container item xs={12}>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={classes.statusFont}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Success>{formatter.format(power)}</Success>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>

                {/* Active Power */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                        className={classes.headingFont}
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
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
                          }}
                        >
                          Active Power
                        </Grid>
                        <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                          <Grid container item xs={12}>
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md={12}
                              lg={12}
                              xl={12}
                              xxl={12}
                              className={classes.statusFont}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <Success>{formatter.format(active)}kW</Success>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {/* Reactive Power */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                        className={classes.headingFont}
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
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
                          }}
                        >
                          Reactive Power
                        </Grid>
                        <Grid container item xs={12}>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={classes.statusFont}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Success>{formatter.format(reactive)}kW</Success>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {/* Apparent Power */}
                <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
                  <Card
                    style={{
                      boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",
                      backgroundColor: "#fcfafa",
                      borderRadius: "10px",
                      height: "12vh",
                    }}
                  >
                    <Grid
                      container
                      item
                      xs={12}
                      direction="column"
                      style={{
                        justifyContent: "center",
                        alignContent: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Grid
                        container
                        item
                        xs={12}
                        spacing={1}
                        direction="column"
                        alignItems="center"
                      >
                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1} />
                        <Grid
                          item
                          xs={5}
                          sm={5}
                          md={5}
                          lg={5}
                          xl={5}
                          xxl={5}
                          className={classes.headingFont}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          Apparent Power
                        </Grid>
                        <Grid container item xs={12}>
                          <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            lg={12}
                            xl={12}
                            xxl={12}
                            className={classes.statusFont}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <Success>{formatter.format(apparent)}kW</Success>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Trend graphs */}
      <Grid container xs={12} spacing={2} style={{ marginTop: "0.5vh" }}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Voltage</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.llphase1}
                          data2={graphData.llphase2}
                          data3={graphData.llphase3}
                          name="L-L Voltage[V]"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Current</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.currentphase1}
                          data2={graphData.currentphase2}
                          data3={graphData.currentphase3}
                          name="Current[A]"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Power Factor</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.powerfactorGraph}
                          name="Power[PF]"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Active Power</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.activeGraph}
                          name="Active Power"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Reactive Power</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.reactiveGraph}
                          name="Reactive Power"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Card className={classes.graphpaper}>
                  <Grid container item xs={12}>
                    <Grid
                      item
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      xl={12}
                      xxl={12}
                      style={{
                        fontSize: "15px",
                        color: "black",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <b>Apparent Power</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {loading ? (
                        <div style={{ marginTop: "44px" }}>Loading...</div>
                      ) : (
                        <TimeSeries1
                          data={graphData.apparentGraph}
                          name="Apparent Power"
                        />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default GlEnergyMeter;
