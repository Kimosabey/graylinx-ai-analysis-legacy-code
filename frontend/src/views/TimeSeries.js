import React, {  useEffect, useState } from "react";
import ReactApexCharts from 'react-apexcharts'
import { format, compareAsc, toDate,addMinutes } from 'date-fns'
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

export default function ApexChart(props)  {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

    const { data,param} = props;
    let minimum = 0, maximum = 0;
    let elements = new Map(), elementsMin = new Map(), elementsMax = new Map();
    data.map((_elem, i) => {
        var myDate =toDate(addMinutes(new Date(_elem.measured_time),330))
        elements.set(i, {x: myDate, y: parseFloat(_elem.param_value).toFixed(2)})
    });
    var elemArr = [], elemArrMin = [], elemArrMax = [];
    for(let i of elements.values()) {
        elemArr.push(i)
    }
    const dataset = {
          
        series: [{
          name: param,
          data: elemArr
        }],
        options: {
          chart: {
            type: 'line',
            stacked: false,
            events: {
              click: function (event, chartContext, config) {
                onclickchart();
              }},
            // height: 350,
            zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true,
            
             
            },
            toolbar: {
              autoSelected: 'zoom'
            }
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
          },
          title: {
            align: 'left'
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 0.5,
              inverseColors: false,
              opacityFrom: 0.3,
              opacityTo: 0,
              stops: [0, 90, 100]
            },
          },
          yaxis: {
             tickAmount:2,
            title: {
            },
          },
          xaxis: {
            type: 'datetime',
            // labels: {
            //   formatter: function (val) {
            //     return format(new Date(val), "HH:mm"); // Format date with hours and minutes only
            //   },
            // }
          },
          tooltip: {
            shared: false,
            // y: {
            //   formatter: function (val) {
            //     return (val / 1000000).toFixed(0)
            //   }
            // }
          }
        },
      
      
      };
    // } 
    const onclickchart = () => {
      // console.log("clicked on chart",param)
      handleClickOpen(true)
    } 
    return (
    <div id="chart">
        <ReactApexCharts options={dataset.options} series={dataset.series} type="area"  height={
                  window.innerHeight == 641 ?
                 125
                   :
                  window.innerHeight == 540 ?
                  100
                   :
                  window.innerHeight == 793 ?
                  160
                  :
                    window.innerHeight == 844 ?
                    145 :
                      window.innerHeight == 768 ?
                      140:
                        window.innerHeight == 864 ?
                        175 :
                          window.innerHeight == 939 ?
                          165:
                            window.innerHeight == 1080 ?
                            245:
                              window.innerHeight == 1280 ?
                              270 :
                              120} />
        <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} classes={{ paper: classes.customDialog }}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                  {props.param}
                </DialogTitle>
                <DialogContent dividers>
                <ReactApexCharts options={dataset.options} series={dataset.series}  type="area" />
                </DialogContent>
              </Dialog>
    </div>
    );
    }
 




  
