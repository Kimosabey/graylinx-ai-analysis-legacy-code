import React,{ useReducer } from "react";
import ReactApexCharts from "react-apexcharts";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  root: { margin: 0, padding: theme.spacing(2) },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: { padding: theme.spacing(2) },
}))(MuiDialogContent);

const useStyles = makeStyles((theme) => ({
  customDialog: { width: "700px" },
  graphSize: { padding: theme.spacing(1), height: "auto", minHeight: 150 },
}));

// ✅ Safe timestamp formatter — always outputs YYYY-MM-DD HH:mm:ss
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);
  const pad = (n) => String(n).padStart(2, "0");
  return `\t${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// ✅ Toolbar: param name as CSV column B header and filename
const buildToolbar = (name) => ({
  show: true,
  autoSelected: "zoom",
  tools: {
    download: true,
    selection: true,
    zoom: true,
    zoomin: true,
    zoomout: true,
    pan: true,
    reset: true,
  },
  export: {
    csv: {
      filename: name || "chart-data",
      columnDelimiter: ",",
      headerCategory: "Timestamp",
      headerValue: name || "Value",
      dateFormatter(timestamp) {
        return formatTimestamp(timestamp);
      },
      categoryFormatter(timestamp) {
        return formatTimestamp(timestamp);
      },
    },
    svg: { filename: name || "chart" },
    png: { filename: name || "chart" },
  },
});

const isEnergyMeterParam = (paramName, via) => {
  if (!paramName) return false;
  if (via === "Cooling Tower") return false;
  const energyMeterParams = [
    "Voltage",
    "Current",
    "Power Factor",
    "Active Power",
    "Reactive Power",
    "Apparent Power",
  ];
  return energyMeterParams.some((param) => paramName.includes(param));
};

const isVSDParam = (paramName) => {
  if (!paramName) return false;
  const lower = paramName.toLowerCase();
  return lower.includes("vfd") || lower.includes("vsd");
};

// ✅ Maps data to chart points with numeric x timestamp for rendering
const mapToChartPoints = (dataArr, minnRange, maxxRange) => {
  const map = new Map();
  dataArr.forEach((_elem, i) => {
    try {
      if (!_elem || !_elem.measured_time) return;
      const value = Number(_elem.param_value);
      if (isNaN(value)) return;
      let finalValue = value;
      if (minnRange !== null && !isNaN(minnRange) && value < minnRange)
        finalValue = minnRange;
      if (maxxRange !== null && !isNaN(maxxRange) && value > maxxRange)
        finalValue = maxxRange;
      const formattedTime = _elem.measured_time.replace(" ", "T");
      const ts = new Date(formattedTime).getTime();
      map.set(i, {
        x: ts,
        y: finalValue,
      });
    } catch (e) {
      console.error("TimeS: Error mapping elem", i, _elem, e);
    }
  });
  return Array.from(map.values());
};

export default function ApexChart(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  // ✅ FIX: Store zoom state in a ref so it persists across re-renders
  // without triggering additional re-renders itself
  const zoomState = React.useRef(null);

  // ✅ FIX: Ref to access the main chart instance for programmatic reset
  const chartRef = React.useRef(null);
// ADD THIS LINE after chartRef:
const [, forceUpdate] = useReducer(x => x + 1, 0);
  const handleClickOpen = () => setOpen(true);

  // ✅ FIX: Reset zoom to original position when dialog is closed/minimized
  const handleClose = () => {
    zoomState.current = null; // Clear saved zoom state
    // Programmatically reset the chart zoom via ApexCharts API
    if (chartRef.current && chartRef.current.chart) {
      const allPoints = [...elemArr, ...elemArr1, ...elemArr2];
      if (allPoints.length > 0) {
        const minX = Math.min(...allPoints.map((p) => p.x));
        const maxX = Math.max(...allPoints.map((p) => p.x));
        chartRef.current.chart.zoomX(minX, maxX);
      }
    }
    setOpen(false);
  };

  const data =
    props.data !== undefined
      ? props.data
      : props.data1 !== undefined
      ? props.data1
      : [];
  const data24Hr = props.data24Hr !== undefined ? props.data24Hr : [];
  const data2 = props.data2 !== undefined ? props.data2 : [];
  const data3 = props.data3 !== undefined ? props.data3 : [];
  const via = props.via !== undefined ? props.via : "";

  const minnRange =
    props.minRange !== undefined ? Number(props.minRange) : null;
  const maxxRange =
    props.maxRange !== undefined ? Number(props.maxRange) : null;

  const elemArr     = mapToChartPoints(data,     minnRange, maxxRange);
  const elemArr24Hr = mapToChartPoints(data24Hr, minnRange, maxxRange);
  const elemArr1    = mapToChartPoints(data2,    minnRange, maxxRange);
  const elemArr2    = mapToChartPoints(data3,    minnRange, maxxRange);

  const onclickchart = () => handleClickOpen(true);

  // ✅ FIX: Combined event handler that tracks zoom/pan AND handles click
//   const chartEvents = {
//     // Preserve click behavior — ignore toolbar/menu clicks
//     click: (event) => {
//       const toolbar = event.target?.closest(".apexcharts-toolbar");
//       const menu = event.target?.closest(".apexcharts-menu");
//       if (!toolbar && !menu) onclickchart();
//     },
//     // ✅ Save zoom range whenever user zooms
//     zoomed: (chartContext, { xaxis }) => {
//       if (xaxis && xaxis.min !== undefined && xaxis.max !== undefined) {
//         zoomState.current = { xaxis };
//       } else {
//         // User clicked reset button — clear saved zoom
//         zoomState.current = null;
//       }
//     },
//     // ✅ Save zoom range whenever user pans (scrolled = pan in ApexCharts)
//     scrolled: (chartContext, { xaxis }) => {
//       if (xaxis && xaxis.min !== undefined && xaxis.max !== undefined) {
//         zoomState.current = { xaxis };
//       }
//     },
//     // ✅ Also handle beforeResetZoom to clear saved state on toolbar reset
//     // beforeResetZoom: () => {
//     //   zoomState.current = null;
//     // },
//     beforeResetZoom: () => {
//   zoomState.current = null;
//   forceUpdate();
// },
//   };
const chartEvents = {
    click: (event) => {
      const toolbar = event.target?.closest(".apexcharts-toolbar");
      const menu = event.target?.closest(".apexcharts-menu");
      if (!toolbar && !menu) onclickchart();
    },
    zoomed: (chartContext, { xaxis }) => {
      if (xaxis && xaxis.min !== undefined && xaxis.max !== undefined) {
        zoomState.current = { xaxis };
      } else {
        zoomState.current = null;
        forceUpdate();
      }
    },
    scrolled: (chartContext, { xaxis }) => {
      if (xaxis && xaxis.min !== undefined && xaxis.max !== undefined) {
        zoomState.current = { xaxis };
      }
    },
    beforeResetZoom: (chartContext) => {
      zoomState.current = null;
      forceUpdate();
      return {
        xaxis: {
          min: undefined,
          max: undefined,
        }
      };
    },
  };
  // ✅ FIX: Build xaxis config with restored zoom range if available
  const buildXaxisConfig = () => ({
    type: "datetime",
    labels: {
      formatter: (val) =>
        new Date(val).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
    },
    axisLabel: { rotate: 45 },
    // ✅ Restore last zoom position — prevents snap-back on re-render
    ...(zoomState.current?.xaxis && {
      min: zoomState.current.xaxis.min,
      max: zoomState.current.xaxis.max,
    }),
  });

  const yaxisConfig = {
    tickAmount: 2,
    decimalsInFloat: 0,
    labels: { formatter: (val) => (val).toFixed(2) },
    // labels: { formatter: (val) => Number(val) },
  };

  const fillConfig = {
    type: "gradient",
    gradient: {
      shadeIntensity: 0.5,
      inverseColors: false,
      opacityFrom: 0.3,
      opacityTo: 0,
      stops: [0, 90, 100],
    },
  };

  const makeChartOptions = () => ({
    chart: {
      type: "area",
      stacked: false,
      zoom: { type: "x", enabled: true, autoScaleYaxis: true },
      toolbar: buildToolbar(props.name),
      events: chartEvents, // ✅ Updated events with zoom tracking
    },
    legend: { show: true },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    title: {
      text: props.name,
      align: "left",
      style: { fontSize: "12px", fontWeight: "600" },
    },
    stroke: { width: [2, 2, 2] },
    fill: fillConfig,
    yaxis: yaxisConfig,
    xaxis: buildXaxisConfig(), // ✅ Uses builder that injects saved zoom
    tooltip: { shared: false },
  });

  const plantOptions = {
    chart: {
      type: "area",
      stacked: false,
      zoom: { type: "x", enabled: true, autoScaleYaxis: true },
      toolbar: buildToolbar(props.name),
      events: chartEvents, // ✅ Updated events with zoom tracking
    },
    dataLabels: { enabled: false },
    markers: { size: 3 },
    stroke: { width: 2, curve: "smooth" },
    fill: fillConfig,
    yaxis: { labels: { formatter: (val) => Number(val) } },
    xaxis: buildXaxisConfig(), // ✅ Uses builder that injects saved zoom
    title: {
      text: props.name,
      align: "left",
      style: { fontSize: "12px", fontWeight: "600" },
    },
  };

  const resolveSeries = (arr, arr1, arr2) => {
    if (arr.length > 0 && arr1.length > 0 && arr2.length > 0) {
      if (via === "Cooling Tower")
        return [
          { name: "1", data: arr },
          { name: "2", data: arr1 },
          { name: "3", data: arr2 },
        ];
      if (isEnergyMeterParam(props.name, via))
        return [
          { name: "R", data: arr },
          { name: "Y", data: arr1 },
          { name: "B", data: arr2 },
        ];
      if (isVSDParam(props.name))
        return [
          { name: "1", data: arr },
          { name: "2", data: arr1 },
          { name: "3", data: arr2 },
        ];
      return [
        { name: "", data: arr },
        { name: "", data: arr1 },
        { name: "", data: arr2 },
      ];
    }
    if (arr1.length > 0) {
      if (isEnergyMeterParam(props.name, via))
        return [
          { name: "R", data: arr },
          { name: "Y", data: arr1 },
        ];
      return [
        { name: "In", data: arr },
        { name: "Out", data: arr1 },
      ];
    }
    // ✅ Single series: use props.name so CSV header shows param name not "series-0"
    return [{ name: props.name || "Value", data: arr }];
  };

  const isPlant = ["Plant Power", "Plant Load", "Plant Efficiency"].includes(
    props.name
  );
  const hasThreeSeries =
    elemArr.length > 0 && elemArr1.length > 0 && elemArr2.length > 0;
  const resolvedSeries = resolveSeries(elemArr, elemArr1, elemArr2);

  const chartOptions = isPlant
    ? plantOptions
    : {
        ...makeChartOptions(),
        colors: hasThreeSeries
          ? ["#32CD32", "#FFD700", "#1E90FF"]
          : undefined,
        legend: { show: true },
      };

  const chartSeries = isPlant
    ? [{ name: props.name, data: elemArr }]
    : resolvedSeries;

  return (
    <div id="chart">
      {elemArr.length > 0 || elemArr1.length > 0 || elemArr2.length > 0 ? (
        <>
          <ReactApexCharts
            ref={chartRef}
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={Math.max(Math.floor(window.innerHeight * 0.18), 150)}
          />
          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            classes={{ paper: classes.customDialog }}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              {props.name}
            </DialogTitle>
            <DialogContent dividers>
              <ReactApexCharts
                options={chartOptions}
                series={chartSeries}
                type="area"
              />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <h4 style={{ marginTop: "44px", marginLeft: "5px" }}>
          No data available
        </h4>
      )}
    </div>
  );
}