import React, { useEffect, useState } from "react";
import api from "../../api";
import Success from "components/Typography/Success";
import TimeSeries from "../TimeSeries.js";
import TimeSeries1 from "../TimeS";
import Devicetrend from "views/Devicetrend";
import { Grid, Card } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";
import { format } from "date-fns";

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
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
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
  const [present, setPresent] = useState("");
  const [kw, setkw] = useState("");
  const [apparent, setApparent] = useState("");
  const [active, setActive] = useState("");
  const [reactive, setReactive] = useState("");
  const [power, setPower] = useState("");
  // const [voltage_ll, setVoltageLL] = useState("");
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
  const [energy, setEnergy] = useState({});
  const [lnphase1, setLNPhase1] = useState([]);
  const [lnphase2, setLNPhase2] = useState([]);
  const [lnphase3, setLNPhase3] = useState([]);
  const [llphase1, setLLPhase1] = useState([]);
  const [llphase2, setLLPhase2] = useState([]);
  const [llphase3, setLLPhase3] = useState([]);
  const [llAvg, setLLAvg] = useState([]);
  const [currentphase1, setCurrentPhase1] = useState([]);
  const [currentphase2, setCurrentPhase2] = useState([]);
  const [currentphase3, setCurrentPhase3] = useState([]);
  const [currentAvg, setCurrentAvg] = useState([]);
  const [energy24hrs, setEnergy24hrs] = useState({});
  const [energy7days, setEnergy7days] = useState({});
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [floor, setFloor] = useState([]);
  const [fid, setFId] = useState("");
  const initialState1 =
    props.location.state.dev_id != null ? props.location.state.dev_id : "";
  const [deviceid, setDeviceid] = useState(initialState1);
  const initialState =
    props.location.state != null ? props.location.state.dev_name : "";
  const [data, setData] = useState(initialState);
  const [activeEMS, setActiveEMS] = useState(initialState1);
  const [energydevice, setEnergydevice] = useState([]);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [activeGraph, setActiveGraph] = useState([]);
  const [reactiveGraph, setReactiveGraph] = useState([]);
  const [apparentGraph, setApparentGraph] = useState([]);
  const [powerfactorGraph, setPowerFactorGraph] = useState([]);
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const DEVICE_TYPE = "NONGL_SS_EMS";
  const TIME_RANGE = "1 week"; // this goes into /{time}/getDeviceDataLast1Hr
  const REQUEST_BODY = { startdate: "start", enddate: "end" };
  // const convertTrend = (arr) => {
  //   if (!Array.isArray(arr)) return [];

  //   return arr.map((item) => ({
  //     x: new Date(item.measured_time),
  //     y: Number(item.param_value),
  //   }));
  // };

  useEffect(() => {
    // LL VOLTAGE AVERAGE
    if (voltR !== null && voltY !== null && voltB !== null) {
      const avgLL = ((voltR + voltY + voltB) / 3).toFixed(2);
      setVoltageLL(avgLL);
    }

    // CURRENT AVERAGE
    if (curR !== null && curY !== null && curB !== null) {
      const avgCur = ((curR + curY + curB) / 3).toFixed(2);
      setCurrent(avgCur);
    }
  }, [voltR, voltY, voltB, curR, curY, curB]);

  const handlefloorchange = (name, id) => {
    setFId(id);
    setFdata(name);
    api.floor
      .devicemap(id, "energyMeter")
      .then((res) => {
        if (res.length === 0) {
          setActiveEMS("");
          setEnergydevice([]);
          setPresent("");
          setkw("");
          setApparent("");
          setReactive("");
          setActive("");
          setPower("");
          setVoltageLL("");
          setVoltageLN("");
          setCurrent("");
          setFreq("");
        } else {
          res.sort(function (a, b) {
            return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
          });
          setEnergydevice(res);
        }
      })
      .catch((error) => {
        console.log("devicemap error in handlefloorchange");
        setEnergydevice([]);
      });
  };

  const handleChange = (name, id) => {
    setActiveEMS(id);
    setDeviceid(id);
    setData(name);

    // Live snapshot values
    api.floor
      .EmsData(id)
      .then((res) => {
        res.map((ele) => {
          // if (ele.param_id === "Cur_Avg") {
          //   setCurrent(ele.param_value);
          // }
          // else if (ele.param_id === "Volt_LL_Avg") {
          //   setVoltageLL(ele.param_value);
          // }
          // CURRENT VALUES (manual averaging)
          if (ele.param_id === "em_par_line_current_r_0") {
            setCurR(parseFloat(ele.param_value));
          } else if (ele.param_id === "em_par_line_current_y_0") {
            setCurY(parseFloat(ele.param_value));
          } else if (ele.param_id === "em_par_line_current_b_0") {
            setCurB(parseFloat(ele.param_value));
          } else if (ele.param_id === "em_par_voltage_ll_r_0") {
            setVoltR(parseFloat(ele.param_value));
          } else if (ele.param_id === "em_par_voltage_ll_y_0") {
            setVoltY(parseFloat(ele.param_value));
          } else if (ele.param_id === "em_par_voltage_ll_b_0") {
            setVoltB(parseFloat(ele.param_value));
          } else if (ele.param_id === "Prsnt_Dmd") {
            setPresent(ele.param_value);
          } else if (ele.param_id === "em_par_appar_pwr_avg_0") {
            setApparent(ele.param_value);
          } else if (ele.param_id === "em_par_reactive_pwr_avg_0") {
            setReactive(ele.param_value);
          } else if (ele.param_id === "KW") {
            setkw(ele.param_value);
          } else if (ele.param_id === "em_par_active_pwr_avg_0") {
            setActive(ele.param_value);
          } else if (ele.param_id === "em_par_pf_avg_0") {
            setPower(ele.param_value);
          } else if (ele.param_id === "Volt_LN_Avg") {
            setVoltageLN(ele.param_value);
          } else if (ele.param_id === "Freq") {
            setFreq(ele.param_value);
          }
          return null;
        });
      })
      .catch((error) => {
        setPresent("");
        setkw("");
        setApparent("");
        setReactive("");
        setActive("");
        setPower("");
        setVoltageLL("");
        setVoltageLN("");
        setCurrent("");
        setFreq("");
      });

    // Trend data: generic getDeviceData(id, type, time) with body {startdate, enddate}
    api.floor
      .getDeviceData(REQUEST_BODY, id, DEVICE_TYPE, TIME_RANGE)
      .then((res) => {
        console.log("=== getDeviceData Response ===", res);
        if (res.graphData && res.graphData.length) {
          const gd = res.graphData[0];
          console.log("Available Keys:", Object.keys(gd));
          console.log(
            "em_par_active_pwr_avg_0 value:",
            gd["em_par_active_pwr_avg_0"]
          );
          console.log(
            "em_par_reactive_pwr_avg_0 value:",
            gd["em_par_reactive_pwr_avg_0"]
          );
          console.log(
            "em_par_appar_pwr_avg_0 value:",
            gd["em_par_appar_pwr_avg_0"]
          );
          console.log("em_par_pf_avg_0 value:", gd["em_par_pf_avg_0"]);
          if (gd["Act_Pwr_Total"]) {
            setEnergy(getMyValue(res, ["graphData", 0, "Act_Pwr_Total"]));
          } else {
            setEnergy({});
          }
          if (gd["em_par_active_pwr_avg_0"]) {
            const activeData = getMyValue(res, [
              "graphData",
              0,
              "em_par_active_pwr_avg_0",
            ]);
            console.log("Active Power after getMyValue:", activeData);
            setActiveGraph(
              activeData && Array.isArray(activeData) ? activeData : []
            );
          } else {
            setActiveGraph([]);
          }
          if (gd["em_par_reactive_pwr_avg_0"]) {
            const reactiveData = getMyValue(res, [
              "graphData",
              0,
              "em_par_reactive_pwr_avg_0",
            ]);
            console.log("Reactive Power after getMyValue:", reactiveData);
            setReactiveGraph(
              reactiveData && Array.isArray(reactiveData) ? reactiveData : []
            );
          } else {
            setReactiveGraph([]);
          }
          if (gd["em_par_appar_pwr_avg_0"]) {
            const apparentData = getMyValue(res, [
              "graphData",
              0,
              "em_par_appar_pwr_avg_0",
            ]);
            console.log("Apparent Power after getMyValue:", apparentData);
            setApparentGraph(
              apparentData && Array.isArray(apparentData) ? apparentData : []
            );
          } else {
            setApparentGraph([]);
          }
          if (gd["em_par_pf_avg_0"] && gd["em_par_pf_avg_0"].length > 0) {
            const pfData = getMyValue(res, ["graphData", 0, "em_par_pf_avg_0"]);
            console.log("Power Factor after getMyValue:", pfData);
            setPowerFactorGraph(pfData && Array.isArray(pfData) ? pfData : []);
          } else {
            console.log("Power Factor data is empty, skipping");
            setPowerFactorGraph([]);
          }

          if (gd["Volt_LN_Ph1"]) {
            setLNPhase1(getMyValue(res, ["graphData", 0, "Volt_LN_Ph1"]));
          } else {
            setLNPhase1([]);
          }
          if (gd["Volt_LN_Ph2"]) {
            setLNPhase2(getMyValue(res, ["graphData", 0, "Volt_LN_Ph2"]));
          } else {
            setLNPhase2([]);
          }
          if (gd["Volt_LN_Ph3"]) {
            setLNPhase3(getMyValue(res, ["graphData", 0, "Volt_LN_Ph3"]));
          } else {
            setLNPhase3([]);
          }

          if (gd["em_par_voltage_ll_r_0"]) {
            setLLPhase1(
              getMyValue(res, ["graphData", 0, "em_par_voltage_ll_r_0"])
            );
          } else {
            setLLPhase1([]);
          }
          if (gd["em_par_voltage_ll_y_0"]) {
            setLLPhase2(
              getMyValue(res, ["graphData", 0, "em_par_voltage_ll_y_0"])
            );
          } else {
            setLLPhase2([]);
          }

          if (gd["em_par_voltage_ll_b_0"]) {
            setLLPhase3(
              getMyValue(res, ["graphData", 0, "em_par_voltage_ll_b_0"])
            );
          } else {
            setLLPhase3([]);
          }

          if (gd["em_par_line_current_r_0"]) {
            setCurrentPhase1(
              getMyValue(res, ["graphData", 0, "em_par_line_current_r_0"])
            );
          } else {
            setCurrentPhase1([]);
          }
          if (gd["em_par_line_current_y_0"]) {
            setCurrentPhase2(
              getMyValue(res, ["graphData", 0, "em_par_line_current_y_0"])
            );
          } else {
            setCurrentPhase2([]);
          }
          if (gd["em_par_line_current_b_0"]) {
            setCurrentPhase3(
              getMyValue(res, ["graphData", 0, "em_par_line_current_b_0"])
            );
          } else {
            setCurrentPhase3([]);
          }
          if (gd["Cur_Avg"]) {
            setCurrentAvg(getMyValue(res, ["graphData", 0, "Cur_Avg"]));
          } else {
            setCurrentAvg([]);
          }
          if (gd["Volt_LL_Avg"]) {
            setLLAvg(getMyValue(res, ["graphData", 0, "Volt_LL_Avg"]));
          } else {
            setLLAvg([]);
          }
        } else {
          setEnergy({});
          setLNPhase1([]);
          setLNPhase2([]);
          setLNPhase3([]);
          setLLPhase1([]);
          setLLPhase2([]);
          setLLPhase3([]);
          setCurrentPhase1([]);
          setCurrentPhase2([]);
          setCurrentPhase3([]);
          setCurrentAvg([]);
          setLLAvg([]);
          setActiveGraph([]);
          setReactiveGraph([]);
          setApparentGraph([]);
          setPowerFactorGraph([]);
        }
      })
      .catch((error) => {
        console.log("getDeviceData error in handleChange");
        setEnergy({});
        setLNPhase1([]);
        setLNPhase2([]);
        setLNPhase3([]);
        setLLPhase1([]);
        setLLPhase2([]);
        setLLPhase3([]);
        setCurrentPhase1([]);
        setCurrentPhase2([]);
        setCurrentPhase3([]);
        setCurrentAvg([]);
        setLLAvg([]);
        setActiveGraph([]);
        setReactiveGraph([]);
        setApparentGraph([]);
        setPowerFactorGraph([]);
      });

    // 24 hours consumption
    // api.floor
    //   .EmsGraph24hrs(id, format(new Date(), "yyyy-MM-dd"))
    //   .then((res) => {
    //     if (res.graphData.length) {
    //       setEnergy24hrs(res.graphData[0]);
    //     } else {
    //       setEnergy24hrs({});
    //     }
    //   })
    //   .catch((error) => {
    //     setEnergy24hrs({});
    //   });

    // 7 days consumption
    // api.floor
    //   .EmsGraph7days(id, format(new Date(), "yyyy-MM-dd"))
    //   .then((res) => {
    //     if (res.graphData.length) {
    //       setEnergy7days(res.graphData[0]);
    //     } else {
    //       setEnergy7days({});
    //     }
    //   })
    //   .catch((error) => {
    //     setEnergy7days({});
    //   });
  };

  useEffect(() => {
    let zone_id = "",
      z_data = [];
    zone_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });

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
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setEnergydevice(res);

        if (deviceid === "" && data === "" && res.length > 0) {
          const firstDevice = res[0];

          setData(firstDevice.name);
          setDeviceid(firstDevice.ssid);
          setActiveEMS(firstDevice.ssid);

          // Initial snapshot
          api.floor
            .EmsData(firstDevice.ssid)
            .then((res1) => {
              res1.map((ele) => {
                if (ele.param_id === "Prsnt_Dmd") {
                  setPresent(ele.param_value);
                } else if (ele.param_id === "em_par_appar_pwr_avg_0") {
                  setApparent(ele.param_value);
                } else if (ele.param_id === "em_par_reactive_pwr_avg_0") {
                  setReactive(ele.param_value);
                } else if (ele.param_id === "KW") {
                  setkw(ele.param_value);
                } else if (ele.param_id === "em_par_active_pwr_avg_0") {
                  setActive(ele.param_value);
                } else if (ele.param_id === "em_par_pf_avg_0") {
                  setPower(ele.param_value);
                }
                // else if (ele.param_id === "Volt_LL_Avg") {
                //   setVoltageLL(ele.param_value);
                // }
                else if (ele.param_id === "em_par_voltage_ll_r_0") {
                  setVoltR(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_voltage_ll_y_0") {
                  setVoltY(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_voltage_ll_b_0") {
                  setVoltB(parseFloat(ele.param_value));
                } else if (ele.param_id === "Volt_LN_Avg") {
                  setVoltageLN(ele.param_value);
                }
                // else if (ele.param_id === "Cur_Avg") {
                //   setCurrent(ele.param_value);
                // }
                else if (ele.param_id === "em_par_line_current_r_0") {
                  setCurR(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_line_current_y_0") {
                  setCurY(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_line_current_b_0") {
                  setCurB(parseFloat(ele.param_value));
                } else if (ele.param_id === "Freq") {
                  setFreq(ele.param_value);
                }
                return null;
              });
            })
            .catch(() => {
              setPresent("");
              setkw("");
              setApparent("");
              setReactive("");
              setActive("");
              setPower("");
              setVoltageLL("");
              setVoltageLN("");
              setCurrent("");
              setFreq("");
            });

          // Initial device trend
          api.floor
            .getDeviceData(
              REQUEST_BODY,
              firstDevice.ssid,
              DEVICE_TYPE,
              TIME_RANGE
            )
            .then((res2) => {
              if (res2.graphData && res2.graphData.length) {
                const gd = res2.graphData[0];

                if (gd["Volt_LN_Ph1"]) {
                  setLNPhase1(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph1"])
                  );
                } else {
                  setLNPhase1([]);
                }
                if (gd["Volt_LN_Ph2"]) {
                  setLNPhase2(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph2"])
                  );
                } else {
                  setLNPhase2([]);
                }
                if (gd["Volt_LN_Ph3"]) {
                  setLNPhase3(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph3"])
                  );
                } else {
                  setLNPhase3([]);
                }

                if (gd["em_par_voltage_ll_r_0"]) {
                  setLLPhase1(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_r_0"])
                  );
                } else {
                  setLLPhase1([]);
                }

                if (gd["em_par_voltage_ll_y_0"]) {
                  setLLPhase2(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_y_0"])
                  );
                } else {
                  setLLPhase2([]);
                }

                if (gd["em_par_voltage_ll_b_0"]) {
                  setLLPhase3(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_b_0"])
                  );
                } else {
                  setLLPhase3([]);
                }

                if (gd["em_par_line_current_r_0"]) {
                  setCurrentPhase1(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_r_0",
                    ])
                  );
                } else {
                  setCurrentPhase1([]);
                }
                if (gd["em_par_line_current_y_0"]) {
                  setCurrentPhase2(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_y_0",
                    ])
                  );
                } else {
                  setCurrentPhase2([]);
                }
                if (gd["em_par_line_current_b_0"]) {
                  setCurrentPhase3(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_b_0",
                    ])
                  );
                } else {
                  setCurrentPhase3([]);
                }
                if (gd["em_par_active_pwr_avg_0"]) {
                  setActiveGraph(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_active_pwr_avg_0",
                    ])
                  );
                } else {
                  setActiveGraph([]);
                }
                if (gd["em_par_reactive_pwr_avg_0"]) {
                  setReactiveGraph(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_reactive_pwr_avg_0",
                    ])
                  );
                } else {
                  setReactiveGraph([]);
                }
                if (gd["em_par_appar_pwr_avg_0"]) {
                  setApparentGraph(
                    getMyValue(res2, ["graphData", 0, "em_par_appar_pwr_avg_0"])
                  );
                } else {
                  setApparentGraph([]);
                }
                if (gd["em_par_pf_avg_0"]) {
                  setPowerFactorGraph(
                    getMyValue(res2, ["graphData", 0, "em_par_pf_avg_0"])
                  );
                } else {
                  setPowerFactorGraph([]);
                }
                if (gd["Cur_Avg"]) {
                  setCurrentAvg(getMyValue(res2, ["graphData", 0, "Cur_Avg"]));
                } else {
                  setCurrentAvg([]);
                }
                if (gd["Volt_LL_Avg"]) {
                  setLLAvg(getMyValue(res2, ["graphData", 0, "Volt_LL_Avg"]));
                } else {
                  setLLAvg([]);
                }
              } else {
                setLNPhase1([]);
                setLNPhase2([]);
                setLNPhase3([]);
                setLLPhase1([]);
                setLLPhase2([]);
                setLLPhase3([]);
                setCurrentPhase1([]);
                setCurrentPhase2([]);
                setCurrentPhase3([]);
                setCurrentAvg([]);
                setLLAvg([]);
                setActiveGraph([]);
                setReactiveGraph([]);
                setApparentGraph([]);
                setPowerFactorGraph([]);
              }
            })
            .catch(() => {
              setLNPhase1([]);
              setLNPhase2([]);
              setLNPhase3([]);
              setLLPhase1([]);
              setLLPhase2([]);
              setLLPhase3([]);
              setCurrentPhase1([]);
              setCurrentPhase2([]);
              setCurrentPhase3([]);
              setCurrentAvg([]);
              setLLAvg([]);
              setActiveGraph([]);
              setReactiveGraph([]);
              setApparentGraph([]);
              setPowerFactorGraph([]);
            });

          // Initial 24hr & 7days
          // api.floor
          //   .EmsGraph24hrs(firstDevice.ssid, format(new Date(), "yyyy-MM-dd"))
          //   .then((res3) => {
          //     if (res3.graphData.length) {
          //       setEnergy24hrs(res3.graphData[0]);
          //     } else {
          //       setEnergy24hrs({});
          //     }
          //   })
          //   .catch(() => setEnergy24hrs({}));

          // api.floor
          //   .EmsGraph7days(firstDevice.ssid, format(new Date(), "yyyy-MM-dd"))
          //   .then((res4) => {
          //     if (res4.graphData.length) {
          //       setEnergy7days(res4.graphData[0]);
          //     } else {
          //       setEnergy7days({});
          //     }
          //   })
          //   .catch(() => setEnergy7days({}));
        } else if (activeEMS) {
          // If route already gave an active EMS
          api.floor
            .EmsData(activeEMS)
            .then((res1) => {
              res1.map((ele) => {
                if (ele.param_id === "Prsnt_Dmd") {
                  setPresent(ele.param_value);
                } else if (ele.param_id === "em_par_appar_pwr_avg_0") {
                  setApparent(ele.param_value);
                } else if (ele.param_id === "em_par_reactive_pwr_avg_0") {
                  setReactive(ele.param_value);
                } else if (ele.param_id === "KW") {
                  setkw(ele.param_value);
                } else if (ele.param_id === "em_par_active_pwr_avg_0") {
                  setActive(ele.param_value);
                } else if (ele.param_id === "em_par_pf_avg_0") {
                  setPower(ele.param_value);
                }
                // else if (ele.param_id === "Volt_LL_Avg") {
                //   setVoltageLL(ele.param_value);
                // }
                else if (ele.param_id === "em_par_voltage_ll_r_0") {
                  setVoltR(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_voltage_ll_y_0") {
                  setVoltY(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_voltage_ll_b_0") {
                  setVoltB(parseFloat(ele.param_value));
                } else if (ele.param_id === "Volt_LN_Avg") {
                  setVoltageLN(ele.param_value);
                }
                // else if (ele.param_id === "Cur_Avg") {
                //   setCurrent(ele.param_value);
                // }
                else if (ele.param_id === "em_par_line_current_r_0") {
                  setCurR(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_line_current_y_0") {
                  setCurY(parseFloat(ele.param_value));
                } else if (ele.param_id === "em_par_line_current_b_0") {
                  setCurB(parseFloat(ele.param_value));
                } else if (ele.param_id === "Freq") {
                  setFreq(ele.param_value);
                }
                return null;
              });
            })
            .catch(() => {
              setPresent("");
              setkw("");
              setApparent("");
              setReactive("");
              setActive("");
              setPower("");
              setVoltageLL("");
              setVoltageLN("");
              setCurrent("");
              setFreq("");
            });

          api.floor
            .getDeviceData(REQUEST_BODY, activeEMS, DEVICE_TYPE, TIME_RANGE)
            .then((res2) => {
              if (res2.graphData && res2.graphData.length) {
                const gd = res2.graphData[0];
                if (gd["em_par_active_pwr_avg_0"]) {
                  setActiveGraph(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_active_pwr_avg_0",
                    ])
                  );
                } else {
                  setActiveGraph([]);
                }
                if (gd["em_par_reactive_pwr_avg_0"]) {
                  setReactiveGraph(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_reactive_pwr_avg_0",
                    ])
                  );
                } else {
                  setReactiveGraph([]);
                }
                if (gd["em_par_appar_pwr_avg_0"]) {
                  setApparentGraph(
                    getMyValue(res2, ["graphData", 0, "em_par_appar_pwr_avg_0"])
                  );
                } else {
                  setApparentGraph([]);
                }
                if (gd["em_par_pf_avg_0"]) {
                  setPowerFactorGraph(
                    getMyValue(res2, ["graphData", 0, "em_par_pf_avg_0"])
                  );
                } else {
                  setPowerFactorGraph([]);
                }

                if (gd["Volt_LN_Ph1"]) {
                  setLNPhase1(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph1"])
                  );
                } else {
                  setLNPhase1([]);
                }
                if (gd["Volt_LN_Ph2"]) {
                  setLNPhase2(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph2"])
                  );
                } else {
                  setLNPhase2([]);
                }
                if (gd["Volt_LN_Ph3"]) {
                  setLNPhase3(
                    getMyValue(res2, ["graphData", 0, "Volt_LN_Ph3"])
                  );
                } else {
                  setLNPhase3([]);
                }

                if (gd["em_par_voltage_ll_r_0"]) {
                  setLLPhase1(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_r_0"])
                  );
                } else {
                  setLLPhase1([]);
                }
                if (gd["em_par_voltage_ll_y_0"]) {
                  setLLPhase2(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_y_0"])
                  );
                } else {
                  setLLPhase2([]);
                }
                if (gd["em_par_voltage_ll_b_0"]) {
                  setLLPhase3(
                    getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_b_0"])
                  );
                } else {
                  setLLPhase3([]);
                }

                if (gd["em_par_line_current_r_0"]) {
                  setCurrentPhase1(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_r_0",
                    ])
                  );
                } else {
                  setCurrentPhase1([]);
                }
                if (gd["em_par_line_current_y_0"]) {
                  setCurrentPhase2(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_y_0",
                    ])
                  );
                } else {
                  setCurrentPhase2([]);
                }
                if (gd["em_par_line_current_b_0"]) {
                  setCurrentPhase3(
                    getMyValue(res2, [
                      "graphData",
                      0,
                      "em_par_line_current_b_0",
                    ])
                  );
                } else {
                  setCurrentPhase3([]);
                }
                if (gd["Cur_Avg"]) {
                  setCurrentAvg(getMyValue(res2, ["graphData", 0, "Cur_Avg"]));
                } else {
                  setCurrentAvg([]);
                }
                if (gd["Volt_LL_Avg"]) {
                  setLLAvg(getMyValue(res2, ["graphData", 0, "Volt_LL_Avg"]));
                } else {
                  setLLAvg([]);
                }
              } else {
                setLNPhase1([]);
                setLNPhase2([]);
                setLNPhase3([]);
                setLLPhase1([]);
                setLLPhase2([]);
                setLLPhase3([]);
                setCurrentPhase1([]);
                setCurrentPhase2([]);
                setCurrentPhase3([]);
                setCurrentAvg([]);
                setLLAvg([]);
                setActiveGraph([]);
                setReactiveGraph([]);
                setApparentGraph([]);
                setPowerFactorGraph([]);
              }
            })
            .catch(() => {
              setLNPhase1([]);
              setLNPhase2([]);
              setLNPhase3([]);
              setLLPhase1([]);
              setLLPhase2([]);
              setLLPhase3([]);
              setCurrentPhase1([]);
              setCurrentPhase2([]);
              setCurrentPhase3([]);
              setCurrentAvg([]);
              setLLAvg([]);
              setActiveGraph([]);
              setReactiveGraph([]);
              setApparentGraph([]);
              setApparentGraph([]);
              setPowerFactorGraph([]);
            });

          // api.floor
          //   .EmsGraph24hrs(activeEMS, format(new Date(), "yyyy-MM-dd"))
          //   .then((res3) => {
          //     if (res3.graphData.length) {
          //       setEnergy24hrs(res3.graphData[0]);
          //     } else {
          //       setEnergy24hrs({});
          //     }
          //   })
          //   .catch(() => setEnergy24hrs({}));

          // api.floor
          //   .EmsGraph7days(activeEMS, format(new Date(), "yyyy-MM-dd"))
          //   .then((res4) => {
          //     if (res4.graphData.length) {
          //       setEnergy7days(res4.graphData[0]);
          //     } else {
          //       setEnergy7days({});
          //     }
          //   })
          //   .catch(() => setEnergy7days({}));
        }
      })
      .catch((error) => {
        setEnergydevice([]);
        setData("");
        setActiveEMS("");
      });

    api.dashboard
      .getMetricData(buildingID)
      .then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      })
      .catch((error) => {
        setFloor([]);
      });

    const timer = setInterval(() => {
      if (!activeEMS) return;

      // periodic live values
      api.floor
        .EmsData(activeEMS)
        .then((res1) => {
          res1.map((ele) => {
            if (ele.param_id === "Prsnt_Dmd") {
              setPresent(ele.param_value);
            } else if (ele.param_id === "em_par_appar_pwr_avg_0") {
              setApparent(ele.param_value);
            } else if (ele.param_id === "KW") {
              setkw(ele.param_value);
            } else if (ele.param_id === "em_par_active_pwr_avg_0") {
              setActive(ele.param_value);
            } else if (ele.param_id === "em_par_reactive_pwr_avg_0") {
              setReactive(ele.param_value);
            } else if (ele.param_id === "em_par_pf_avg_0") {
              setPower(ele.param_value);
            }
            // else if (ele.param_id === "Volt_LL_Avg") {
            //   setVoltageLL(ele.param_value);
            // }
            else if (ele.param_id === "em_par_voltage_ll_r_0") {
              setVoltR(parseFloat(ele.param_value));
            } else if (ele.param_id === "em_par_voltage_ll_y_0") {
              setVoltY(parseFloat(ele.param_value));
            } else if (ele.param_id === "em_par_voltage_ll_b_0") {
              setVoltB(parseFloat(ele.param_value));
            } else if (ele.param_id === "Volt_LN_Avg") {
              setVoltageLN(ele.param_value);
            }
            // else if (ele.param_id === "Cur_Avg") {
            //   setCurrent(ele.param_value);
            // }
            else if (ele.param_id === "em_par_line_current_r_0") {
              setCurR(parseFloat(ele.param_value));
            } else if (ele.param_id === "em_par_line_current_y_0") {
              setCurY(parseFloat(ele.param_value));
            } else if (ele.param_id === "em_par_line_current_b_0") {
              setCurB(parseFloat(ele.param_value));
            } else if (ele.param_id === "Freq") {
              setFreq(ele.param_value);
            }
            return null;
          });
        })
        .catch(() => {
          setPresent("");
          setkw("");
          setApparent("");
          setActive("");
          setPower("");
          setVoltageLL("");
          setVoltageLN("");
          setCurrent("");
          setFreq("");
          setReactive("");
        });

      // periodic trend refresh
      api.floor
        .getDeviceData(REQUEST_BODY, activeEMS, DEVICE_TYPE, TIME_RANGE)
        .then((res2) => {
          if (res2.graphData && res2.graphData.length) {
            const gd = res2.graphData[0];

            if (gd["em_par_active_pwr_avg_0"]) {
              setActiveGraph(
                getMyValue(res2, ["graphData", 0, "em_par_active_pwr_avg_0"])
              );
            } else {
              setActiveGraph([]);
            }
            if (gd["em_par_reactive_pwr_avg_0"]) {
              setReactiveGraph(
                getMyValue(res2, ["graphData", 0, "em_par_reactive_pwr_avg_0"])
              );
            } else {
              setReactiveGraph([]);
            }
            if (gd["em_par_appar_pwr_avg_0"]) {
              setApparentGraph(
                getMyValue(res2, ["graphData", 0, "em_par_appar_pwr_avg_0"])
              );
            } else {
              setApparentGraph([]);
            }
            if (gd["em_par_pf_avg_0"]) {
              setPowerFactorGraph(
                getMyValue(res2, ["graphData", 0, "em_par_pf_avg_0"])
              );
            } else {
              setPowerFactorGraph([]);
            }

            if (gd["Volt_LN_Ph1"]) {
              setLNPhase1(getMyValue(res2, ["graphData", 0, "Volt_LN_Ph1"]));
            } else {
              setLNPhase1([]);
            }
            if (gd["Volt_LN_Ph2"]) {
              setLNPhase2(getMyValue(res2, ["graphData", 0, "Volt_LN_Ph2"]));
            } else {
              setLNPhase2([]);
            }
            if (gd["Volt_LN_Ph3"]) {
              setLNPhase3(getMyValue(res2, ["graphData", 0, "Volt_LN_Ph3"]));
            } else {
              setLNPhase3([]);
            }

            if (gd["em_par_voltage_ll_r_0"]) {
              setLLPhase1(
                getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_r_0"])
              );
            } else {
              setLLPhase1([]);
            }

            if (gd["em_par_voltage_ll_y_0"]) {
              setLLPhase2(
                getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_y_0"])
              );
            } else {
              setLLPhase2([]);
            }

            if (gd["em_par_voltage_ll_b_0"]) {
              setLLPhase3(
                getMyValue(res2, ["graphData", 0, "em_par_voltage_ll_b_0"])
              );
            } else {
              setLLPhase3([]);
            }

            if (gd["em_par_line_current_r_0"]) {
              setCurrentPhase1(
                getMyValue(res2, ["graphData", 0, "em_par_line_current_r_0"])
              );
            } else {
              setCurrentPhase1([]);
            }
            if (gd["em_par_line_current_y_0"]) {
              setCurrentPhase2(
                getMyValue(res2, ["graphData", 0, "em_par_line_current_y_0"])
              );
            } else {
              setCurrentPhase2([]);
            }
            if (gd["em_par_line_current_b_0"]) {
              setCurrentPhase3(
                getMyValue(res2, ["graphData", 0, "em_par_line_current_b_0"])
              );
            } else {
              setCurrentPhase3([]);
            }
            if (gd["Cur_Avg"]) {
              setCurrentAvg(getMyValue(res2, ["graphData", 0, "Cur_Avg"]));
            } else {
              setCurrentAvg([]);
            }
            if (gd["Volt_LL_Avg"]) {
              setLLAvg(getMyValue(res2, ["graphData", 0, "Volt_LL_Avg"]));
            } else {
              setLLAvg([]);
            }
          } else {
            setLNPhase1([]);
            setLNPhase2([]);
            setLNPhase3([]);
            setLLPhase1([]);
            setLLPhase2([]);
            setLLPhase3([]);
            setCurrentPhase1([]);
            setCurrentPhase2([]);
            setCurrentPhase3([]);
            setCurrentAvg([]);
            setLLAvg([]);
            setActiveGraph([]);
            setReactiveGraph([]);
            setApparentGraph([]);
            setPowerFactorGraph([]);
          }
        })
        .catch(() => {
          setEnergy({});
          setLNPhase1([]);
          setLNPhase2([]);
          setLNPhase3([]);
          setLLPhase1([]);
          setLLPhase2([]);
          setLLPhase3([]);
          setCurrentPhase1([]);
          setCurrentPhase2([]);
          setCurrentPhase3([]);
          setCurrentAvg([]);
          setLLAvg([]);
          setActiveGraph([]);
          setReactiveGraph([]);
          setApparentGraph([]);
          setPowerFactorGraph([]);
        });

      // periodic 24hr & 7days refresh
      // api.floor
      //   .EmsGraph24hrs(activeEMS, format(new Date(), "yyyy-MM-dd"))
      //   .then((res3) => {
      //     if (res3.graphData.length) {
      //       setEnergy24hrs(res3.graphData[0]);
      //     } else {
      //       setEnergy24hrs({});
      //     }
      //   })
      //   .catch(() => setEnergy24hrs({}));

      // api.floor
      //   .EmsGraph7days(activeEMS, format(new Date(), "yyyy-MM-dd"))
      //   .then((res4) => {
      //     if (res4.graphData.length) {
      //       setEnergy7days(res4.graphData[0]);
      //     } else {
      //       setEnergy7days({});
      //     }
      //   })
      //   .catch(() => setEnergy7days({}));
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [activeEMS, buildingID, zone_data]); // keep activeEMS so it tracks device change

  // Ensure Selects receive a value that matches one of their MenuItem values.
  // Some persisted values (from localStorage or routes) may be ids; normalize them
  // to the displayed name which MenuItem.value uses.
  const selectedFloorObj = floor.find(
    (f) => f.name === fdata || String(f.id) === String(fdata)
  );
  const safeFloorName = selectedFloorObj ? selectedFloorObj.name : "";

  const selectedDeviceObj = energydevice.find(
    (d) => d.name === data || String(d.ssid) === String(data)
  );
  const safeDeviceName = selectedDeviceObj ? selectedDeviceObj.name : "";

  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Grid container xs={12} spacing={2}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={5} lg={5} xl={5} xxl={5}>
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
              {/* <Select
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
              >
                {floor.map((_item) => (
                  <MenuItem
                    key={_item.id}
                    value={_item.name}
                    onClick={() => handlefloorchange(_item.name, _item.id)}
                  >
                    {_item.name}
                  </MenuItem>
                ))}
              </Select> */}
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
          <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
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
              {/* <Select
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
                value={data}
                disableUnderline
              >
                {energydevice.map((_item) => (
                  <MenuItem
                    key={_item.ssid}
                    value={_item.name}
                    onClick={() => handleChange(_item.name, _item.ssid)}
                  >
                    {_item.name}
                  </MenuItem>
                ))}
              </Select> */}
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
                {/* <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
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
                          xs={6}
                          sm={6}
                          md={6}
                          lg={6}
                          xl={6}
                          xxl={6}
                          className={classes.headingFont}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          Kilo Watt
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
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <Success>{formatter.format(kw)}</Success>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid> */}
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
                {/* Current                */}
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
                {/* power factor */}
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
                              <Success>{formatter.format(active)}kw</Success>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                {/* <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
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
                          xs={6}
                          sm={6}
                          md={6}
                          lg={6}
                          xl={6}
                          xxl={6}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          Average PF
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
                          <Success>{formatter.format(power)}</Success>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid> */}
                {/* <Grid item xs={6} sm={4} md={3} lg={2} xl={2} xxl={2}>
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
                          L-N Voltage[Avg]
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
                            <Success>{formatter.format(voltage_ln)}V</Success>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid> */}
                {/* Reactive Power                */}
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
                            <Success>{formatter.format(reactive)}kw</Success>
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
                            <Success>{formatter.format(apparent)}kw</Success>
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
                      <TimeSeries1
                        data={llphase1}
                        data2={llphase2}
                        data3={llphase3}
                        name="L-L Voltage[V]"
                      />
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
                      <TimeSeries1
                        data={currentphase1}
                        data2={currentphase2}
                        data3={currentphase3}
                        name="Current[A]"
                      />
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
                      <TimeSeries1
                        data={powerfactorGraph}
                        // data2={currentphase2}
                        // data3={currentphase3}
                        name="Power[PF]"
                      />
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
                      <TimeSeries1 data={activeGraph} name="Active Power" />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
              {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
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
                      <b>24 Hour Consumption</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {Object.keys(energy24hrs).length === 0 ? (
                        <h4 style={{ marginTop: "44px", marginLeft: "5px" }}>
                          No data available
                        </h4>
                      ) : (
                        <>
                          {Object.keys(energy24hrs).map((key) => (
                            <Devicetrend
                              key={key}
                              data={energy24hrs[key]}
                              param={key}
                            />
                          ))}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid> */}
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
                      <TimeSeries1
                        data={reactiveGraph}
                        // data2={lnphase2}
                        // data3={lnphase3}
                        name="Reactive Power"
                      />
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
                      <TimeSeries1
                        data={apparentGraph}
                        // data2={lnphase2}
                        // data3={lnphase3}
                        name="Apparent Power"
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Grid>

              {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
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
                      {Object.keys(energy).length === 0 ? (
                        <h4 style={{ marginTop: "44px", marginLeft: "5px" }}>
                          No data available
                        </h4>
                      ) : (
                        <TimeSeries data={energy} param="em_par_pf_avg_0" />
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid> */}

              {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
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
                      <b>7 Days Consumption</b>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                      {Object.keys(energy7days).length === 0 ? (
                        <h4 style={{ marginTop: "44px", marginLeft: "5px" }}>
                          No data available
                        </h4>
                      ) : (
                        <>
                          {Object.keys(energy7days).map((key) => (
                            <Devicetrend
                              key={key}
                              data={energy7days[key]}
                              param={key}
                            />
                          ))}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Card>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}

export default GlEnergyMeter;
