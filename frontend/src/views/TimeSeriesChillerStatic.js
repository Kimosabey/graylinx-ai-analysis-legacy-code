import React from "react";
import Chart from "react-apexcharts";
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
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
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
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
    width: '700px', // Adjust this value as needed
  },
}))

const TimeSeriesChiller = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  let elements = new Map(), elementsMin = new Map(), elementsMax = new Map();
  let lcl = 15, ucl = 30;

  switch (props.name) {
    case "Chilled Water Temperature": lcl = 144; ucl = 176; break;
    case "Condenser Water Temperature": lcl = 144; ucl = 176; break;
    default: lcl = 144; ucl = 176; break;
  }

  elementsMin.set(i, { y: lcl })
  elementsMax.set(i, { y: ucl })

  var  elemArrMin = [], elemArrMax = [];;

  for (let j of elementsMin.values()) {
    elemArrMin.push(j)
  }
  for (let k of elementsMax.values()) {
    elemArrMax.push(k)
  }

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
   
  const { data, } = props;
  // console.log('11223344',props)
  var ts2 = 1484418600000;
  var dates = [];
  for (var i = 0; i < 12; i++) {
    ts2 = ts2 + 86400000;
    var innerArr = [ts2, data[1][i].value];
    dates.push(innerArr);
  }
  const state = {
    series: [
      {
        name: props.name,
        data: dates
      },
      // {
      //   name: "Upper Limit",
      //   data: elemArrMax
      // }, {
      //   name: "Lower Limit",
      //   data: elemArrMin
      // }
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        events: {
          click: function (event, chartContext, config) {
            onclickchart();
          },
        },
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true
        },
        toolbar: {
          autoSelected: "zoom"
        }
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0
      },
      colors: ['#2E93fA', '#FF0000', '#FF0000'],
      stroke: {
        width: [2, 2, 2]
      },
      title: {
        text: "",
        align: "left"
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100]
        }
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return (val / 1000000).toFixed(0);
          }
        },
        title: {
          text: ""
        }
      },
      // xaxis: {
      //   type: 'datetime',
      //   labels: {
      //     format: 'HH'
      //   }
      // },
      xaxis: {
        type: 'datetime',
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return (val / 1000000).toFixed(0);
          }
        }
      }
    }
  };
  const onclickchart = () => {
    // console.log("clicked on chart",param)
    handleClickOpen(true)
  }

  return (
    <div id="chart">
      {/* <Chart options={state.options} series={state.series} type="area" height={130}/> */}
       {
data.length !== 0 ?
        <>
              <Chart options={state.options} series={state.series} type="area" />
                {/* <ReactApexCharts options={dataset.options} series={dataset.series} type="area"   /> */}
                <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} classes={{ paper: classes.customDialog }}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                  {props.name}
                </DialogTitle>
                <DialogContent dividers>
                <Chart options={state.options} series={state.series} type="area" />
                </DialogContent>
              </Dialog>

        </>
        :<> 
                  <h4 style={{marginTop:"44px",marginLeft:"5px"}}>No data available</h4>
 
        </>
    }
    </div>

  );
};

export default TimeSeriesChiller;