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
    // Set the desired width for the dialog
    width: "700px", // Adjust this value as needed
  },
  graphSize: {
    padding: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      height: "2vh", // Adjust the height for small screens (sm)
    },
    [theme.breakpoints.up("md")]: {
      height: "2vh", // Adjust the height for medium screens (md)
    },
    [theme.breakpoints.up("lg")]: {
      height: "2vh", // Adjust the height for large screens (lg)
    },
    [theme.breakpoints.up("xl")]: {
      height: "2vh", // Adjust the height for extra-large screens (xl)
    },
    [theme.breakpoints.up("xxl")]: {
      height: "2vh", // Adjust the height for extra extra large screens (xxl)
    },
  },
}));

export default function ApexChart(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  // Accept both `data` and `data1` prop names (parent components use `data1`)
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
  // data.length && data2.length && data3.length == 0 ?
  // <>console.log("inside if")</>:<>console.log("inside else")</>
  // if(data.length && data2.length && data3.length == 0){
  //   console.log("inside if")
  // }else{
  //   console.log("inside else")
  // }
  let minnRange = Number(props.minRange),
    maxxRange = Number(props.maxRange);
  let elements = new Map();
  let elements24Hr = new Map();
  let elements1 = new Map();
  let elements2 = new Map();

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
  var elemArr = [],
    elemArr24Hr = [],
    elemArr1 = [],
    elemArr2 = [];
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
        // height: 350,
        // events: {
        //   click: function (event, chartContext, config) {
        //     onclickchart();
        //   },
        // },
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
        show: ![
          "CW Header Return Temperature",
          "CW Header Supply Temperature",
        ].includes(props.name), // Hide legend only for these names
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
          // rotate: -45, // Rotates the labels by -45 degrees for better visibility
          // rotateAlways: true, // Ensures labels always rotate instead of skipping
          formatter: function (val) {
            return new Date(val).toLocaleTimeString("en-GB", {
              hour: "2-digit",

              minute: "2-digit",

              hour12: false,
            });
          },
        },
        axisLabel: {
          // color: '#000', // Black color for xAxis labels
          // fontWeight: '600', // Optional: bold labels
          // interval: 'auto', // Let ECharts decide interval automatically
          rotate: 45, // Rotate labels to avoid overlap
          // margin: 10, // Add some margin between the axis and the labels
        },
      },
      tooltip: {
        shared: false,
        // y: {
        //   formatter: function (val) {
        //     return (val / 1000000).toFixed(0)
        //   }
        // }
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
            // { name: "", data: elemArr1 },
          ]
        : [
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
        // height: 350,
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
      legend: {
        show: ![
          "CW Header Return Temperature",
          "CW Header Supply Temperature",
        ].includes(props.name), // Hide legend only for these names
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
          // rotate: -45, // Rotates the labels by -45 degrees for better visibility
          // rotateAlways: true, // Ensures labels always rotate instead of skipping
          formatter: function (val) {
            return new Date(val).toLocaleTimeString("en-GB", {
              hour: "2-digit",

              minute: "2-digit",

              hour12: false,
            });
          },
        },
        axisLabel: {
          // color: '#000', // Black color for xAxis labels
          // fontWeight: '600', // Optional: bold labels
          // interval: 'auto', // Let ECharts decide interval automatically
          rotate: 45, // Rotate labels to avoid overlap
          // margin: 10, // Add some margin between the axis and the labels
        },
      },
      tooltip: {
        shared: false,
        // y: {
        //   formatter: function (val) {
        //     return (val / 1000000).toFixed(0)
        //   }
        // }
      },
    },
  };

  const onclickchart = () => {
    // console.log("clicked on chart",param)
    handleClickOpen(true);
  };
  // ---------------------------------------------
  // 🔵 NEW: SINGLE-LINE DATASET FOR KW / TR / KW-TR
  // ---------------------------------------------
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
            onclickchart(); // 🔥 ENABLE DIALOG LIKE OTHER GRAPHS
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
      {elemArr.length > 0 || elemArr1.length > 0 || elemArr2.length > 0 ? (
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
                      elemArr2.length > 0
                        ? ["#32CD32", "#FFD700", "#1E90FF"]
                        : dataset.options.colors,
                  }
            }
            series={
              ["Plant Power", "Plant Load", "Plant Efficiency"].includes(
                props.name
              )
                ? plantSet.series
                : elemArr.length > 0 &&
                  elemArr1.length > 0 &&
                  elemArr2.length > 0
                ? [
                    { name: "R", data: elemArr },
                    { name: "Y", data: elemArr1 },
                    { name: "B", data: elemArr2 },
                  ]
                : elemArr1.length > 0
                ? [
                    { name: "", data: elemArr },
                    { name: "", data: elemArr1 },
                  ]
                : [{ name: props.name || "", data: elemArr }]
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
            {/* <DialogContent dividers>
              {data24Hr ? (
                <ReactApexCharts
                  options={dataSet24hr.options}
                  series={
                    props.name == "Chilled Water Header Temperature" ||
                    props.name == "Condenser Water Header Temperature"
                      ? dataSet24hr.series1
                      : dataSet24hr.series
                  }
                  type="area"
                />
              ) : (
                <></>
              )}
            </DialogContent> */}
            <DialogContent dividers>
              {["Plant Power", "Plant Load", "Plant Efficiency"].includes(
                props.name
              ) ? (
                // Show single-line plant graph inside popup
                <ReactApexCharts
                  options={plantSet.options}
                  series={plantSet.series}
                  type="area"
                />
              ) : (
                // Show graph for all other parameters
                <ReactApexCharts
                  options={{
                    ...dataset.options,
                    colors:
                      elemArr.length > 0 &&
                      elemArr1.length > 0 &&
                      elemArr2.length > 0
                        ? ["#32CD32", "#FFD700", "#1E90FF"]
                        : dataset.options.colors,
                  }}
                  series={
                    elemArr.length > 0 &&
                    elemArr1.length > 0 &&
                    elemArr2.length > 0
                      ? [
                          { name: "R", data: elemArr },
                          { name: "Y", data: elemArr1 },
                          { name: "B", data: elemArr2 },
                        ]
                      : elemArr1.length > 0
                      ? [
                          { name: "", data: elemArr },
                          { name: "", data: elemArr1 },
                        ]
                      : [{ name: props.name || "", data: elemArr }]
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
