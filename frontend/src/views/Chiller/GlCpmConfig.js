import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Grid from "@material-ui/core/Grid";
import { AgGridReact } from "ag-grid-react";
import api from "api";
import { Paper, TextField } from "@material-ui/core";
import { SemanticToastContainer, toast } from "react-semantic-toasts";


const NUMERIC_REGEX = /^\d*\.?\d*$/;
const SET_BUTTON_STYLE = {
  width: "100%",
  height: "5.5vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  backgroundColor: "#0123B4",
  borderRadius: "4px",
  boxShadow: "none",
};

const formatValue = (val) => {
  if (val === null || val === undefined) return "—";
  if (typeof val === "boolean") return val ? "true" : "false";
  return String(val);
};

const isNumeric = (value) =>
  value !== "" && value.trim() !== "" && NUMERIC_REGEX.test(value);

function ThresholdInput({ label, value, onChange, placeholder, onSet }) {
  const hasError = value !== "" && !NUMERIC_REGEX.test(value);
  return (
    <>
      <Grid container item xs={12} spacing={1}>
        <div style={{ fontWeight: "bold", marginTop: "1vh" }}>{label}</div>
      </Grid>
      <Grid container item xs={12} spacing={1} direction="row">
        <Grid item xs={12} sm={12} md={5} lg={5} xl={5}>
          <Grid container item xs={12} spacing={1} direction="row">
            <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
              <TextField
                placeholder={placeholder || "-"}
                style={{ width: "100%" }}
                InputProps={{ style: { backgroundColor: "#ffffff" } }}
                id={`outlined-${label}`}
                variant="outlined"
                name="Set_Point"
                autoComplete="off"
                value={value}
                onChange={onChange}
                error={hasError}
                helperText={hasError ? "Please enter numbers only" : ""}
              />
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
              <Paper style={SET_BUTTON_STYLE} onClick={onSet} elevation={0}>
                <div style={{ color: "white",fontSize:'2vh' }}>set</div>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={7} lg={7} xl={7} />
      </Grid>
    </>
  );
}

export default function CpmStateGrid() {
  const [rowData, setRowData] = useState([]);
  const [cpmThresholdData, setCPMThresholdData] = useState({});
  const [addValue, setAddValue] = useState("");
  const [removeValue, setRemoveValue] = useState("");
  const intervalRef = useRef(null);

  const fetchCPMThresholdData = useCallback(() => {
    api.floor
      .cpmGetThresholdData()
      .then((res) => { if (res) setCPMThresholdData(res); })
      .catch((err) => console.error("cpmGetThresholdData error:", err));
  }, []);

  const fetchCPMTableData = useCallback(() => {
//     let res = {
//   "cpm_state": "start",
//   "step_status": {
//     "status": "busy",
//     "step": "adding_chiller",
//     "sub_step": "Cooling Tower Fan ON",
//     "current_device": {
//       "chiller": "WC-Chiller-02",
//       "cooling_tower": "Cooling-Tower-03",
//       "pri_pump": "Primary-Pump-02",
//       "cond_pump": "Condenser-Pump-02",
//       "prim_var_pump": null,
//       "replacing": null
//     },
//     "updated_at": "2026-04-13T10:15:05+05:30"
//   },
//   "chiller_add_condition": {
//     "condition_met": true,
//     "elapsed_seconds": 900,
//     "threshold_seconds": 900,
//     "elapsed_minutes": 15,
//     "threshold_minutes": 15,
//     "progress_percent": 100.0
//   },
//   "chiller_remove_condition": {
//     "condition_met": false,
//     "elapsed_seconds": 0,
//     "threshold_seconds": 900,
//     "elapsed_minutes": 0,
//     "threshold_minutes": 15,
//     "progress_percent": 0.0
//   },
//   "replace_devices": {
//     "tripped_devices": [],
//     "replace_log": []
//   }
// };
//   setRowData([{
//     status: formatValue(res.step_status?.status),
//     step: formatValue(res.step_status?.step),
//     sub_step: formatValue(res.step_status?.sub_step),
//     current_device: (() => { const d = res.step_status?.current_device; if (!d || typeof d !== "object") return "—"; return "[" + Object.entries(d).map(([k, v]) => `${k}: ${v ?? "null"}`).join(", ") + "]"; })(),
//   }]);
    api.floor
      .cpmGetStatus()
      .then((res) => {
        if (res) {
          setRowData([{
            status: formatValue(res.step_status?.status),
            step: formatValue(res.step_status?.step),
            sub_step: formatValue(res.step_status?.sub_step),
            current_device: (() => { const d = res.step_status?.current_device; if (!d || typeof d !== "object") return "—"; return "[" + Object.entries(d).map(([k, v]) => `${k}: ${v ?? "null"}`).join(", ") + "]"; })(),
          }]);
        }
      })
      .catch((err) => console.error("cpmGetStatus error:", err));
  }, []);

  useEffect(() => {
    fetchCPMThresholdData();
    fetchCPMTableData();
    intervalRef.current = setInterval(() => {
      fetchCPMThresholdData();
      fetchCPMTableData();
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [fetchCPMThresholdData, fetchCPMTableData]);

  const columnDefs = useMemo(() => [
    { headerName: "Status", field: "status", flex: 0.3, cellStyle: { fontWeight: 500 } },
    { headerName: "Step", field: "step", flex: 0.6, cellStyle: { fontWeight: 500 } },
    {
      headerName: "Sub Step", field: "sub_step", flex: 0.5,
      cellStyle: (p) => p.value === "—" ? { fontWeight: 500 } : {},
    },
    {
      headerName: "Current Device", field: "current_device", flex: 1,
      wrapText: true,
      autoHeight: true,
      cellStyle: (p) => p.value === "—" ? { fontWeight: 500 } : {},
    },
  ], []);

  const defaultColDef = useMemo(() => ({ sortable: true, resizable: true, filter: true }), []);

  const handleClickThresholdSetButton = useCallback((type) => {
    const value = type === "Add" ? addValue : removeValue;

    if (!isNumeric(value)) {
      toast({
        type: "warning",
        icon: "exclamation circle",
        title: "Invalid Input",
        description: "Please enter a valid numeric value",
        time: 3000,
      });
      return;
    }

    const req = {
      metric_id: type === "Add" ? "add_threshold" : "remove_threshold",
      value,
    };

    api.floor.cpmThresholdValues(req).then((res) => {
      setAddValue("");
      setRemoveValue("");
      if (res) {
        toast({ type: "success", icon: "check circle", title: "Success", description: "Threshold Set Successfully", time: 3000 });
      } else {
        toast({ type: "error", icon: "times circle", title: "Error", description: res?.message || "Failed to Set Threshold", time: 3000 });
      }
    });
  }, [addValue, removeValue]);

  return (
    <Grid container spacing={1}>
      <Grid container item xs={12} spacing={1} direction="row">
        <h2 style={{ fontSize: "2.5vh", fontWeight: "bold", color: "#0123B4" }}>CPO Threshold</h2>
      </Grid>

      <ThresholdInput
        label="Add Threshold"
        value={addValue}
        onChange={(e) => setAddValue(e.target.value)}
        placeholder={cpmThresholdData.add_threshold_value || "-"}
        onSet={() => handleClickThresholdSetButton("Add")}
      />

      <div style={{ marginTop: "3vh", width: "100%" }} />

      <ThresholdInput
        label="Remove Threshold"
        value={removeValue}
        onChange={(e) => setRemoveValue(e.target.value)}
        placeholder={cpmThresholdData.remove_threshold_value || "-"}
        onSet={() => handleClickThresholdSetButton("Remove")}
      />

      <Grid container item xs={12} spacing={1} direction="row">
        <h2 style={{ fontSize: "2.5vh", fontWeight: "bold", color: "#0123B4", marginTop: "2vh" }}>CPO Summary</h2>
      </Grid>

      <Grid container item xs={12} spacing={1} direction="row">
        <Grid item xs={12}>
          <div className="ag-theme-alpine" style={{ width: "100%" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              domLayout="autoHeight"
            />
          </div>
        </Grid>
      </Grid>

      <SemanticToastContainer position="top-center" />
    </Grid>
  );
}
