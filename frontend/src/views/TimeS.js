import React, { useEffect, useState } from "react";
import ReactApexCharts from "react-apexcharts";
import { format, compareAsc, toDate, addMinutes } from "date-fns";
import { propTypes } from "react-progressbar-semicircle";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from "@material-ui/core/styles";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
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
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const useStyles = makeStyles((theme) => ({
  customDialog: {
    width: "700px",
  },
  graphSize: {
    padding: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      height: "2vh",
    },
    [theme.breakpoints.up("md")]: {
      height: "2vh",
    },
    [theme.breakpoints.up("lg")]: {
      height: "2vh",
    },
    [theme.breakpoints.up("xl")]: {
      height: "2vh",
    },
    [theme.breakpoints.up("xxl")]: {
      height: "2vh",
    },
  },
}));

// Helper function to check if parameter is an energy meter (should show R, Y, B)
const isEnergyMeterParam = (paramName, via) => {
  if (!paramName) return false;

  // For Cooling Tower, NEVER show R,Y,B labels - always return false
  if (via === "Cooling Tower") {
    return false;
  }

  const energyMeterParams = [
    "Voltage",
    "Current",
    "Power Factor",
    "Active Power",
    "Reactive Power",
    "Apparent Power",
  ];

  // Check if paramName contains any of the energy meter parameter keywords
  return energyMeterParams.some((param) => paramName.includes(param));
};

// Helper function to check if it's a VSD/motor parameter for chillers
const isVSDParam = (paramName) => {
  if (!paramName) return false;
  const lowerName = paramName.toLowerCase();
  return lowerName.includes("vfd") || lowerName.includes("vsd");
};

export default function ApexChart(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
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
  const data4 = props.data4 !== undefined ? props.data4 : [];
  const via = props.via !== undefined ? props.via : "";
 // console.log("data3",data3)
  let minnRange = Number(props.minRange),
    maxxRange = Number(props.maxRange);
  let elements = new Map();
  let elements24Hr = new Map();
  let elements1 = new Map();
  let elements2 = new Map();
  let elements3 = new Map();

  data.map((_elem, i) => {
    try {
      if (!_elem || !_elem.measured_time) {
        console.warn("TimeS: Missing measured_time in elem", i, _elem);
        return;
      }
      var myDate = toDate(new Date(_elem.measured_time));
      elements.set(i, {
        x: myDate,
        y: ["Plant Power", "Plant Load", "Plant Efficiency"].includes(
          props.name
        )
          ? Number(_elem.param_value).toFixed(2)
          : Number(_elem.param_value) < minnRange
          ? minnRange
          : Number(_elem.param_value) > maxxRange
          ? maxxRange
          : Number(_elem.param_value).toFixed(2),
      });

      // Debug: Check if data has param_name
      if (i === 0) {
        // console.log("=== DEBUG INFO ===");
        // console.log("First data element:", _elem);
        // console.log("Props name:", props.name);
        // console.log("Props via:", via);
        // console.log("Via type:", typeof via);
        // console.log("Via === 'Cooling Tower':", via === "Cooling Tower");
        // console.log("Is Energy Meter:", isEnergyMeterParam(props.name, via));
        // console.log("Is VSD Param:", isVSDParam(props.name));
        // console.log("==================");
      }
    } catch (e) {
      console.error("TimeS: Error mapping data elem", i, _elem, e);
    }
  });

  if (data24Hr) {
    data24Hr.map((_elem, i) => {
      var myDate = toDate(new Date(_elem.measured_time));
      elements24Hr.set(i, {
        x: myDate,
        y:
          Number(_elem.param_value) < minnRange
            ? minnRange
            : Number(_elem.param_value) > maxxRange
            ? maxxRange
            : parseFloat(_elem.param_value).toFixed(2),
      });
    });
  }

  data2.map((_elem, i) => {
    try {
      if (!_elem || !_elem.measured_time) {
        console.warn("TimeS: Missing measured_time in data2 elem", i, _elem);
        return;
      }
      var myDate = toDate(new Date(_elem.measured_time));
      elements1.set(i, {
        x: myDate,
        y:
          Number(_elem.param_value) < minnRange
            ? minnRange
            : Number(_elem.param_value) > maxxRange
            ? maxxRange
            : parseFloat(_elem.param_value).toFixed(2),
      });
    } catch (e) {
      console.error("TimeS: Error mapping data2 elem", i, _elem, e);
    }
  });

  data3.map((_elem, i) => {
    try {
      if (!_elem || !_elem.measured_time) {
        console.warn("TimeS: Missing measured_time in data3 elem", i, _elem);
        return;
      }
      var myDate = toDate(new Date(_elem.measured_time));
      elements2.set(i, {
        x: myDate,
        y:
          Number(_elem.param_value) < minnRange
            ? minnRange
            : Number(_elem.param_value) > maxxRange
            ? maxxRange
            : parseFloat(_elem.param_value).toFixed(2),
      });
    } catch (e) {
      console.error("TimeS: Error mapping data3 elem", i, _elem, e);
    }
  });

  data4.map((_elem, i) => {
    try {
      if (!_elem || !_elem.measured_time) {
        console.warn("TimeS: Missing measured_time in data3 elem", i, _elem);
        return;
      }
      var myDate = toDate(new Date(_elem.measured_time));
      elements3.set(i, {
        x: myDate,
        y:
          Number(_elem.param_value) < minnRange
            ? minnRange
            : Number(_elem.param_value) > maxxRange
            ? maxxRange
            : parseFloat(_elem.param_value).toFixed(2),
      });
    } catch (e) {
      console.error("TimeS: Error mapping data3 elem", i, _elem, e);
    }
  });

  var elemArr = [],
    elemArr24Hr = [],
    elemArr1 = [],
    elemArr2 = [],
    elemArr3 = [];

  for (let i of elements.values()) {
    elemArr.push(i);
  }
  for (let i of elements24Hr.values()) {
    elemArr24Hr.push(i);
  }
  for (let i of elements1.values()) {
    elemArr1.push(i);
  }
  for (let i of elements2.values()) {
    elemArr2.push(i);
  }
  for (let i of elements3.values()) {
    elemArr3.push(i);
  }
  // console.log("elemArr",elemArr)
  // console.log("elemArr1",elemArr1)
  // console.log("elemArr2",elemArr2)
  // console.log("elemArr3",elemArr3)
  const dataSet24hr = {
    series1:
      props.name === "Chilled Water Temperature" ||
      props.name == "Condenser Water Header Temperature"
        ? [
            {
              name: "",
              data: elemArr24Hr,
            },
            {
              name: "",
              data: elemArr1,
            },
          ]
        : [
            {
              name: "",
              data: elemArr24Hr,
            },
            {
              name: "",
              data: elemArr1,
            },
          ],

    series: [
      {
        name: "Out",
        data: elemArr24Hr,
      },
      {
        name: "In",
        data: elemArr24Hr,
      },
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
        },
      },
      legend: {
        show: true,
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        align: "left",
      },
      stroke: {
        width: [2, 2, 2],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.5,
          inverseColors: false,
          opacityFrom: 0.3,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        tickAmount: 2,
        decimalsInFloat: 2,
        labels: {
          formatter: function (val) {
            return Number(val).toFixed(2);
          },
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          formatter: function (val) {
            return new Date(val).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          },
        },
        axisLabel: {
          rotate: 45,
        },
      },
      tooltip: {
        shared: false,
      },
    },
  };

  const dataset = {
    series1:
      via === "Cooling Tower"
        ? [
            {
              name: "",
              data: elemArr,
            },
          ]
        :via === "CPM"?[
             {
              name: "",
              data: elemArr,
            },
            {
              name: "",
              data: elemArr1,
            },
            {
              name: "",
              data: elemArr2,
            },
            {
              name: "",
              data: elemArr3,
            },
        ] :
        [
            {
              name: "",
              data: elemArr,
            },
            {
              name: "",
              data: elemArr1,
            },
          ],

    series: [
      { name: "Out", data: elemArr },
      { name: "In", data: elemArr1 },
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        events: {
          click: function (event, chartContext, config) {
            onclickchart();
          },
        },
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
        },
      },
       responsive: [
  {
    breakpoint: 2560, // xl (1920–2559.95px)
    options: {
      chart: {
        height:  window.innerWidth * 0.10 // you can tune this
      }
    }
  },
  {
    breakpoint: 1920, // lg (1280–1919.95px)
    options: {
      chart: {
        height:  window.innerWidth * 0.080
      }
    }
  },
  {
    breakpoint: 1280, // md (960–1279.95px)
    options: {
      chart: {
        height: window.innerWidth * 0.3
      }
    }
  },
  {
    breakpoint: 960, // sm (600–959.95px)
    options: {
      chart: {
        height: window.innerWidth * 0.3
      }
    }
  },
  {
    breakpoint: 600, // xs (0–599.95px)
    options: {
      chart: {
        height: window.innerWidth * 0.35
      }
    }
  }
],
      legend: {
        show: true,
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        align: "left",
      },
      stroke: {
        width: [2, 2, 2],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.5,
          inverseColors: false,
          opacityFrom: 0.3,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        tickAmount: 2,
        decimalsInFloat: 2,
        labels: {
          formatter: function (val) {
            return Number(val).toFixed(2);
          },
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          formatter: function (val) {
            return new Date(val).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          },
        },
        axisLabel: {
          rotate: 45,
        },
      },
      tooltip: {
        shared: false,
      },
    },
  };

  const onclickchart = () => {
    handleClickOpen(true);
  };

  const plantSet = {
    series: [
      {
        name: props.name,
        data: elemArr,
      },
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          show: true,
          autoSelected: "zoom",
        },
        events: {
          click: function () {
            onclickchart();
          },
        },
      },
      dataLabels: { enabled: false },
      markers: { size: 3 },
      stroke: { width: 2, curve: "smooth" },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.5,
          opacityFrom: 0.3,
          opacityTo: 0,
        },
      },
      yaxis: {
        labels: {
          formatter: (val) => Number(val).toFixed(2),
        },
      },
      xaxis: {
        type: "datetime",
        labels: {
          formatter: function (val) {
            return new Date(val).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          },
        },
      },
    },
  };

  return (
    <div id="chart">
      {elemArr.length > 0 || elemArr1.length > 0 || elemArr2.length > 0|| elemArr3.length > 0 ? (
        <>
          <ReactApexCharts
            options={
              ["Plant Power", "Plant Load", "Plant Efficiency"].includes(
                props.name
              )
                ? plantSet.options
                : {
                    ...dataset.options,
                    colors:
                      elemArr.length > 0 &&
                      elemArr1.length > 0 &&
                      elemArr3.length > 0 &&
                      elemArr2.length > 0
                        ? ["#32CD32", "#FFD700", "#1E90FF","#4ff9e1"]
                        : dataset.options.colors,
                    legend: {
                      ...dataset.options.legend,
                      show: true,
                    },
                  }
            }
            series={
              ["Plant Power", "Plant Load", "Plant Efficiency"].includes(
                props.name
              )
                ? plantSet.series
                : elemArr.length > 0 &&
                  elemArr1.length > 0 &&
                  elemArr2.length > 0 &&
                  elemArr3.length > 0
                ? via == "CPM"?[
                    { name: "Out1", data: elemArr },
                      { name: "In1", data: elemArr1 },
                      { name: "Out2", data: elemArr2 },
                      { name: "In2", data: elemArr3 },
                ]:

                 via === "Cooling Tower"
                  ? [
                      { name: "1", data: elemArr },
                      { name: "2", data: elemArr1 },
                      { name: "3", data: elemArr2 },
                    ]
                  : isEnergyMeterParam(props.name, via)
                  ? [
                      { name: "R", data: elemArr },
                      { name: "Y", data: elemArr1 },
                      { name: "B", data: elemArr2 },
                    ]
                  : isVSDParam(props.name)
                  ? [
                      { name: "1", data: elemArr },
                      { name: "2", data: elemArr1 },
                      { name: "3", data: elemArr2 },
                    ]
                  : [
                      { name: "", data: elemArr },
                      { name: "", data: elemArr1 },
                      { name: "", data: elemArr2 },
                    ]
                : elemArr1.length > 0
                ? isEnergyMeterParam(props.name, via)
                  ? [
                      { name: "R", data: elemArr },
                      { name: "Y", data: elemArr1 },
                    ]
                  : [
                      { name: "In", data: elemArr },
                      { name: "Out", data: elemArr1 },
                    ]
                : [{ name: "", data: elemArr }]
            }
            type="area"
            height={
              window.innerHeight == 641
                ? 140
                : window.innerHeight == 540
                ? 100
                : window.innerHeight == 793
                ? 160
                : window.innerHeight == 844
                ? 145
                : window.innerHeight == 768
                ? 160
                : window.innerHeight == 633
                ? 145
                : window.innerHeight == 864
                ? 175
                : window.innerHeight == 939
                ? 165
                : window.innerHeight == 1080
                ? 270
                : window.innerHeight == 1280
                ? 270
                : 120
            }
          />

          <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            classes={{
              paper: classes.customDialog,
            }}
          >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
              {props.name}
            </DialogTitle>
            <DialogContent dividers>
              {["Plant Power", "Plant Load", "Plant Efficiency"].includes(
                props.name
              ) ? (
                <ReactApexCharts
                  options={plantSet.options}
                  series={plantSet.series}
                  type="area"
                />
              ) : (
                <ReactApexCharts
                  options={{
                    ...dataset.options,
                    colors:
                      elemArr.length > 0 &&
                      elemArr1.length > 0 &&
                       elemArr3.length > 0 &&
                      elemArr2.length > 0
                        ? ["#32CD32", "#FFD700", "#1E90FF","#4ff9e1"]
                        : dataset.options.colors,
                    legend: {
                      ...dataset.options.legend,
                      show: true,
                    },
                  }}
                  series={
                    elemArr.length > 0 &&
                    elemArr1.length > 0 &&
                    elemArr2.length > 0
                      ? via === "Cooling Tower"
                        ? [
                            { name: "1", data: elemArr },
                            { name: "2", data: elemArr1 },
                            { name: "3", data: elemArr2 },
                          ]
                        : isEnergyMeterParam(props.name, via)
                        ? [
                            { name: "R", data: elemArr },
                            { name: "Y", data: elemArr1 },
                            { name: "B", data: elemArr2 },
                          ]
                        : isVSDParam(props.name)
                        ? [
                            { name: "1", data: elemArr },
                            { name: "2", data: elemArr1 },
                            { name: "3", data: elemArr2 },
                          ]
                        : [
                            { name: "Out1", data: elemArr },
                            { name: "In1", data: elemArr1 },
                            { name: "Out2", data: elemArr2 },
                            { name: "In2", data: elemArr3 },
                          ]
                      : elemArr1.length > 0
                      ? isEnergyMeterParam(props.name, via)
                        ? [
                            { name: "R", data: elemArr },
                            { name: "Y", data: elemArr1 },
                          ]
                        : [
                            { name: "In", data: elemArr },
                            { name: "Out", data: elemArr1 },
                          ]
                      : [{ name: "", data: elemArr }]
                  }
                  type="area"
                />
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <h4
            style={{
              marginTop: "44px",
              marginLeft: "5px",
            }}
          >
            No data available
          </h4>
        </>
      )}
    </div>
  );
}
