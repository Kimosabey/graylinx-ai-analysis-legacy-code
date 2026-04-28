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
// import './BarChart.css'
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

const TimeSeriesAnalytics = (props) => {
  const classes = useStyles();
  const { data,graphType,heading } = props;
  const [open, setOpen] = React.useState(false);
  let fault_types=[],fault_count=[],devicename=[],devFaultCount=[]

 if(graphType=='ahuFault'){

    // data.map((ele)=>{
    //     console.log('eleee',ele)
    //     if(ele.source == 'ALARM_SOURCE_TYPE_AI'){}else if(ele.source == 'DDC'){}
    //     fault_types.push(ele.param_id)
    //     fault_count.push(ele.parameter_count)
    //  })
 }
 else if(graphType=='allDevFault'){
  
    data.map((ele)=>{
        // console.log('eleee',ele)
        devicename.push(ele.Devicename)
        devFaultCount.push(ele.count)
     })
 }else{}
 
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
   
  const state = {
    series: [{
        name: "Fault",
        data: graphType=='allDevFault'?devFaultCount:fault_count,
        barWidth: 5,
    }],
   
    options: {
      plotOptions:{
        bar:{
          columnWidth:"10%"
        }
      },
      // bar:{
      //   columnWidth: '30%',
      // },
        chart: {
          height: 300,
          type: 'line',
          zoom: {
            enabled: false
          }
        },
        dataLabels: {
          enabled: false
        },
        // stroke: {
        //   curve: 'straight'
        // },
        title: {
          text: heading,
          align: 'left'
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5
          },
        },
        xaxis: {
          categories: graphType=='allDevFault'?devicename:fault_types,
        },
        yaxis: {
          
            // title: {
            //   text: "Deg C",
            // },
          show: true,
          showAlways: true,
          // min: 0,
          // tickAmount: 3,
          // max: graphType=='allDevFault'?30:20,
        }
      },
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
              <Chart options={state.options} series={state.series} type={graphType=='allDevFault'?"bar":"area"} height={350} />
                {/* <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} classes={{ paper: classes.customDialog }}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                  {props.name}
                </DialogTitle>
                <DialogContent dividers>
                <Chart options={state.options} series={state.series} type="area" />
                </DialogContent>
              </Dialog> */}

        </>
        :<> 
                  <h4 style={{marginTop:"44px",marginLeft:"5px"}}>No data available</h4>
 
        </>
    }
    </div>

  );
};

export default TimeSeriesAnalytics;