import React, {  useEffect, useState } from "react";
import ReactApexCharts from 'react-apexcharts'
import { format, compareAsc, toDate,addMinutes } from 'date-fns'
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import { map } from "leaflet";

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

const useStyles = makeStyles((theme) => ({
  customDialog: {
    // Set the desired width for the dialog
    width: '700px', // Adjust this value as needed
  },
}))

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

// function getChartData(apiData=[]){
//     let myMap = {},temp = {};
//     apiData.map((e)=>{
//       if (myMap[e["param_id"]] !== undefined){     
//         myMap[e["param_id"]][e["source"]] = e["parameter_count"];
//       } else {
//         myMap[e["param_id"]] = {};
//         myMap[e["param_id"]][e["source"]] = e["parameter_count"];

//             }
//     })
//     let x=[], y=[], temp1=[], temp2=[];
//     for (const mykey in myMap) {
//       x.push(mykey);
//       temp1.push(myMap[mykey]["Fault from AI"]);
//       temp2.push(myMap[mykey]["Fault from DDC"]);
//     }
//     y.push({"name":"Fault from AI", "group":"Historical", "data":temp1});
//     y.push({"name":"Fault from DDC", "group":"Historical", "data":temp2});
//     return [x,y];
// }
function getChartData(apiData = []) {
  let myMap = {}, x = [], y = [], yDataTemp = {}, newValues = [], temp = {}, myindex=0;
  apiData.map((e) => {
    if (newValues.includes(e["source"]) == false) {
      newValues.push(e["source"]);
      yDataTemp[e["source"]] = [];
    }
    if (myMap[e["param_id"]] !== undefined) {
      myMap[e["param_id"]][e["source"]] = e["parameter_count"];
    } else {
      x.push(e["param_id"]);
      myMap[e["param_id"]] = {};
      myMap[e["param_id"]][e["source"]] = e["parameter_count"];
    }
  });
  for (const mykey in x) {
    for (const tempSrc in newValues) {
      if (myMap[x[mykey]][newValues[tempSrc]] !== undefined) {
        yDataTemp[newValues[tempSrc]].push(myMap[x[mykey]][newValues[tempSrc]]);
      } else {
        yDataTemp[newValues[tempSrc]].push(0);
      }
    }
  }
  for (const tempSrc in newValues) {
console.log("tempsrc",tempSrc)
y.push({ "name": newValues[tempSrc], "group": "Historical", "data": yDataTemp[newValues[tempSrc]] });
  }
  return [x, y];
}
export default function ApexChart(props)  {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
    const { data} = props;
//     const data =[
//       {
//           "Devicename": "AHU-1",
//           "param_id": "CHW_Vlv_Pos",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "CHW_Vlv_Pos",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "DSP",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "Fire_Sensor",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "Fire_Sensor",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "OA_Dmpr_Pos",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "OA_Dmpr_Pos",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "OAT",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "OAT",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "RARH",
//           "parameter_count": 2,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "RARH",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "RAT",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "RAT",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SAF_VFD_Speed",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SAF_VFD_Speed",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SAT",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SAT",
//           "parameter_count": 2,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SP_Post_Filter",
//           "parameter_count": 1,
//           "source": "DDC"
//       },
//       {
//           "Devicename": "AHU-1",
//           "param_id": "SP_Post_Filter",
//           "parameter_count": 1,
//           "source": "ALARM_SOURCE_TYPE_AI"
//       }
//   ]
  let graphData = getChartData(data);
  console.log("function call",graphData)

  let fault_types=[],fault_count_AI=[],fault_count_DDC=[]
  const nonRedundantArray = [];
  const uniqueIds = new Set();

  data.map((ele)=>{   
    if(ele.source == 'Fault from AI'){
      fault_count_AI.push(ele.parameter_count)
    }else if(ele.source == 'Fault from DDC'){
      fault_count_DDC.push(ele.parameter_count)
    }
    fault_types.push(ele.param_id)
     if (!uniqueIds.has(ele.param_id)) {
      uniqueIds.add(ele.param_id); // Add the ID to the set to mark it as seen
      nonRedundantArray.push(ele.param_id); // Add the object to the new array
    }
 })
    const dataset = {  
      series: graphData[1],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          stacked: true,
          events: {
            click: function (event, chartContext, config) {
              onclickchart();
            },
          },
        },
        stroke: {
          width: 1,
          colors: ['#fff']
        },
        dataLabels: {
          formatter: (val) => {
            return val 
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
          }
        },
        xaxis: {
          categories: graphData[0],
          labels: {
            formatter: (val) => {
              return val 
            }
          }
        },
        fill: {
          opacity: 1,
        },
        colors: ['#008FFB', '#00E396', '#80c7fd', '#80f1cb'],
        legend: {
          position: 'top',
          horizontalAlign: 'left'
        }
      },
    
    
    
   
      };

      
      const onclickchart = () => {
        // console.log("clicked on chart",param)
        handleClickOpen(true)
      }

    return (
    <div id="chart">
         {
data.length !== 0 ?
        <>
        <ReactApexCharts options={dataset.options} series={dataset.series}   type="bar" height={350}   />
            <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} classes={{ paper: classes.customDialog }}>
                <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                  Faults
                </DialogTitle>
                <DialogContent dividers>
                <ReactApexCharts options={dataset.options}  series={dataset.series}   type="bar" height={350} />
                </DialogContent>
              </Dialog>
        </>
        :<> 
        <h4 style={{marginTop:"44px",marginLeft:"5px"}}>No data available</h4>

</>}

    </div>
    );
    }
 




  
