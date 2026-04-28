import React,{useState} from "react";
import ReactApexCharts from 'react-apexcharts'
import { makeStyles } from "@material-ui/core/styles";
import { format, compareAsc, toDate,addMinutes } from 'date-fns'
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { redColor } from "assets/jss/material-dashboard-react";
import api from "./../api";
import TimeSeriesChartModal from "./TimeSeriesChartModal";
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
  responsiveHeight:{
    height: '165px', /* Default height */
    [theme.breakpoints.down('xs')]: {  /* xs breakpoint */
      height: '120px'
    },
    [theme.breakpoints.down('sm')]: { /* sm breakpoint */
        height: '140px'
    },
    [theme.breakpoints.down('md')]: { /* md breakpoint */
        height: '200px'
    },
    [theme.breakpoints.down('xl')]: { /* xl breakpoint */
        height: '180px'
    },
    [theme.breakpoints.down('xxl')]: {/* xxl breakpoint */
        height: '200px'
    }
  }
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

export default function ApexChart(props) {
  const classes = useStyles();
  const { data, param, title, minRange, maxRange,eqpmtType, devId
    // , data24hrData
  } = props;
  const [open, setOpen] = React.useState(false);
  const [currentDay, setCurrentDay] = useState("");
  const [nextDay, setNextDay] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  let elements = new Map(), ele24hr = new Map(),minnRange=Number(minRange),maxxRange=Number(maxRange),elementsMin = new Map(), elementsMax = new Map();
  let lcl = 15, ucl = 30;
  switch (param) {
    case "SAT": lcl = 18; ucl = 25; break;
    case "RAT": lcl = 22; ucl = 27; break;
    case "CHW_Vlv_Pos": lcl = 0; ucl = 100; break;
    default: lcl = 0; ucl = 0; break;
    // default: lcl = 15; ucl = 30; break;
  }

// if(data24hrData){  
//   data24hrData.map((_elem, i)=>{
//     var myDate =toDate(addMinutes(new Date(_elem.measured_time),330))
//     if(param == 'CHW_Vlv_Fbk'){
//       ele24hr.set(i, { x: myDate, y: ((_elem.param_value=='inactive')?0:1)})
//     }else{
//       ele24hr.set(i, { x: myDate, y: ((Number(_elem.param_value)< minnRange) ? minnRange : (((Number(_elem.param_value)>maxxRange) ) ? maxxRange : parseFloat(_elem.param_value).toFixed(2))) })
//     }
//     return (<></>);
//   })
// }

if(data){ data.map((_elem, i) => {
    // var myDate = new Date(_elem.measured_time);
    // moment(oldDateObj).add(30, 'm').toDate();
    var myDate =(_elem.measured_time)
    var date = new Date(_elem.measured_time);
      // Format as "13 Jun"
      var day = date.getDate().toString().padStart(2, '0');
      var month = date.toLocaleString('default', { month: 'short' });

      var formatted = `${day} ${month}`;
    // var myDate =toDate(addMinutes(new Date(_elem.measured_time),330))
    // var myDate = moment(_elem.measured_time).add(330, 'm').toDate();
    // var myDate =_elem.measured_time
    // var myEpoch = myDate.getTime()/1000.0;
    if(param == 'CHW_Vlv_Fbk'){
      elements.set(i, { z:myDate,x: formatted, y: ((_elem.param_value=='inactive')?0:1)})
      console.log("_elem.param_value",_elem.param_value)
    }else{
      // console.log("myDate-----------",myDate)
      elements.set(i, { z:myDate,x: formatted, y: ((Number(_elem.param_value)< minnRange) ? minnRange : (((Number(_elem.param_value)>maxxRange) ) ? maxxRange : parseFloat(_elem.param_value).toFixed(2))
      ) })
    }
    // elements.set(i, { x: myDate, y: (parseFloat(_elem.param_value).toFixed(2)) })
    // elementsMin.set(i, { x: myDate, y: lcl })
    // elementsMax.set(i, { x: myDate, y: ucl })
    return (<></>);
  })}
  var elemArr = [], elemArr24hr = [], elemArrMin = [], elemArrMax = [];;
  for (let i of elements.values()) {
    elemArr.push(i)
  }
  if(ele24hr){
    for (let i of ele24hr.values()) {
      elemArr24hr.push(i)
    }
  }
  let dataSet = {}, dataSet24hr = {}

  const onclickchart = (currentDay,nextDay) => {
    handleClickOpen(true)
    setCurrentDay(currentDay)
    setNextDay(nextDay)
  }

  if (param !== 'CHW_Vlv_Pos') {
    dataSet24hr = {
      series: [{
        name: param,
        data: elemArr24hr
      },
      ],
      options: {
        chart: {
          type: 'area',
          stacked: false,
          height: 350,
          zoom: {
            type: 'x',
            enabled: false,
            autoScaleYaxis: true
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
        colors: ['#2E93fA', redColor[0], redColor[0]],
        stroke: {
          width: [2, 2, 2]
        },
        title: {
          text: (param=='RAQ_Co2'||param=='FAU_CO2_Value')?'CO₂ [ppm]':param=='RARH'?'Relative Humidity [%]':(param=='Duct_Temp'||param=='FAU_Duct_Temp')?'Duct Temp [℃]':param=='FAU_Wind_Speed'?'Wind Speed [m/s]':title,
          align: 'left'
        },
        legend: {
          show: false
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
        xaxis: {
          type: 'datetime',
          labels: {
            format: 'dd MMM'  // This formats dates like 13 Jun, 25 Jul, etc.
          }
        },
        // xaxis: {
        //   type: 'datetime',
        //   labels: {
        //     datetimeFormatter: {
        //       hour: 'HH'
        //     }
        //   },
          
        // },
        yaxis: {
          show: true,
          showAlways: true,
          // min: 0,
          // tickAmount: 6,
          // max: 30,
          decimalsInFloat: false,
          formatter: (val) => { return val },
          labels: {
            formatter: function (val) {
              return Number(val).toFixed(2); 
            }
          },
        },
        tooltip: {
          shared: false,
          x: {
            format: 'HH:mm'
          },
          // y: {
          //   formatter: function (val) {
          //     return val
          //   }
          // }
        }
      },
    }

    dataSet = {
      series: [{
        name: param,
        data: elemArr
      },
      ],
      options: {
        chart: {
          events: {
            click: function (event, chartContext, config) {
              // console.log(config.config.series[config.seriesIndex])
              // console.log(config.config.series[config.seriesIndex].name)
              // console.log("-------------------------------------",(config.config.series[config.seriesIndex].data[config.dataPointIndex]))
              if(config.config.series[config.seriesIndex].data[config.dataPointIndex] != undefined){
              const istDate = new Date((config.config.series[config.seriesIndex].data[config.dataPointIndex].z));
              const gmtDateStr = istDate.toUTCString();
              const date = new Date(gmtDateStr);
                const pad = (n) => n.toString().padStart(2, '0');
                const currentDay = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} 00:00:00`;
 
//////////////////////////////////////////////////////////////////////////////////////////////
                const date1 = new Date(currentDay.replace(" ", "T") + "Z");  
                const nextt = new Date(date1.getTime() + 24 * 60 * 60 * 1000); 
                const pad1 = (n) => n.toString().padStart(2, '0'); 
                const nextDay = `${nextt.getUTCFullYear()}-${pad1(nextt.getUTCMonth() + 1)}-${pad1(nextt.getUTCDate())} ${pad1(nextt.getUTCHours())}:${pad1(nextt.getUTCMinutes())}:${pad1(nextt.getUTCSeconds())}`; 
                // const nextDay = `${nextt.getUTCFullYear()}-${pad1(nextt.getUTCMonth() + 1)}-${pad1(nextt.getUTCDate())} ${pad1(nextt.getUTCHours())}:${pad1(nextt.getUTCMinutes())}:${pad1(nextt.getUTCSeconds())}`; 


              console.log("currentDay",currentDay)
              console.log("nextDay",nextDay)
              onclickchart(currentDay,nextDay);
             } },
          },

          type: 'area',
          stacked: false,
          height: 350,
          zoom: {
            type: 'x',
            enabled: false,
            autoScaleYaxis: true
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
        colors: ['#2E93fA', redColor[0], redColor[0]],
        stroke: {
          width: [2, 2, 2]
        },
        title: {
          text: (param=='RAQ_Co2'||param=='FAU_CO2_Value')?'CO₂ [ppm]':param=='RARH'?'Relative Humidity [%]':(param=='Duct_Temp'||param=='FAU_Duct_Temp')?'Duct Temp [℃]':param=='FAU_Wind_Speed'?'Wind Speed [m/s]':title,
          align: 'left'
        },
        legend: {
          show: false
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
        // xaxis: {
        //   type: 'datetime',
        //   labels: {
        //     datetimeFormatter: {
        //       hour: 'HH'
        //     }
        //   },
          
        // },
        // xaxis: {
        //   type: 'datetime',
        // },
        // xaxis: {
        //   type: 'datetime',
        //   tickAmount: 3,  // Matches your data length
        //   labels: {
        //     formatter: function (value) {
        //       const date = new Date(value);
        //       const day = date.getDate().toString().padStart(2, '0');
        //       const month = date.toLocaleString('default', { month: 'short' });
        //       return `${day} ${month}`;
        //     },
        //   },
        // },
        yaxis: {
          show: true,
          showAlways: true,
          // min: 0,
          // tickAmount: 6,
          // max: 30,
          decimalsInFloat: false,
          formatter: (val) => { return val },
          labels: {
            formatter: function (val) {
              return Number(val).toFixed(2); 
            }
          },
        },
        tooltip: {
          shared: false,
          x: {
            format: 'HH:mm'
          },
          // y: {
          //   formatter: function (val) {
          //     return val
          //   }
          // }
        }
      },
    }
  } else {
    dataSet24hr = {
      series: [{
        name: param,
        data: elemArr24hr
      }
      ],
      options: {
        chart: {
          type: 'area',
          stacked: false,
          height: 350,
          zoom: {
            type: 'x',
            enabled: false,
            autoScaleYaxis: true
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
        colors: ['#2E93fA'],
        stroke: {
          width: [2]
        },
        title: {
          text: (param=='RAQ_Co2'||param=='FAU_CO2_Value')?'CO₂[ppm]':param=='RARH'?'Relative Humidity[%]':(param=='Duct_Temp'||param=='FAU_Duct_Temp')?'Duct Temp[[℃]':param=='FAU_Wind_Speed'?'Wind Speed':title,
        },
        legend: {
          show: false
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
        // xaxis: {
        //   type: 'datetime',
        //   labels: {
        //     formatter: function (val) {
        //       return val; // Format date with hours and minutes only
        //       // return format(new Date(val), "HH:mm"); // Format date with hours and minutes only
        //     },
        //   }
        // },
        yaxis: {
          show: true,
          showAlways: true,
          // min: 0,
          // tickAmount: 6,
          // max: 30,
          decimalsInFloat: true,
          formatter: (val) => { return val },
          labels: {
            formatter: function (val) {
              return Number(val).toFixed(2); 
            }
          },
        },
        tooltip: {
          shared: false,
          x: {
            format: 'HH:mm'
          },
          // y: {
          //   formatter: function (val) {
          //     return val
          //   }
          // }
        }
      },
    }
    dataSet = {
      series: [{
        name: param,
        data: elemArr
      }
      ],
      options: {
        chart: {

          events: {
            click: function (event, chartContext, config) {
              // console.log(config.config.series[config.seriesIndex])
              // console.log(config.config.series[config.seriesIndex].name)
              // console.log("-------------------------------------",(config.config.series[config.seriesIndex].data[config.dataPointIndex]))
              const istDate = new Date((config.config.series[config.seriesIndex].data[config.dataPointIndex].z));
              const gmtDateStr = istDate.toUTCString();
              const date = new Date(gmtDateStr);
                const pad = (n) => n.toString().padStart(2, '0');
                const currentDay = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} 00:00:00`;
 
//////////////////////////////////////////////////////////////////////////////////////////////
                const date1 = new Date(currentDay.replace(" ", "T") + "Z");  
                const nextt = new Date(date1.getTime() + 24 * 60 * 60 * 1000); 
                const pad1 = (n) => n.toString().padStart(2, '0'); 
                const nextDay = `${nextt.getUTCFullYear()}-${pad1(nextt.getUTCMonth() + 1)}-${pad1(nextt.getUTCDate())} ${pad1(nextt.getUTCHours())}:${pad1(nextt.getUTCMinutes())}:${pad1(nextt.getUTCSeconds())}`; 
                // const nextDay = `${nextt.getUTCFullYear()}-${pad1(nextt.getUTCMonth() + 1)}-${pad1(nextt.getUTCDate())} ${pad1(nextt.getUTCHours())}:${pad1(nextt.getUTCMinutes())}:${pad1(nextt.getUTCSeconds())}`; 


              console.log("currentDay",currentDay)
              console.log("nextDay",nextDay)
              onclickchart(currentDay,nextDay);
            },
            },
          type: 'area',
          stacked: false,
          height: 350,
          zoom: {
            type: 'x',
            enabled: false,
            autoScaleYaxis: true
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
        colors: ['#2E93fA'],
        stroke: {
          width: [2]
        },
        title: {
          text: (param=='RAQ_Co2'||param=='FAU_CO2_Value')?'CO₂[ppm]':param=='RARH'?'Relative Humidity[%]':(param=='Duct_Temp'||param=='FAU_Duct_Temp')?'Duct Temp[[℃]':param=='FAU_Wind_Speed'?'Wind Speed':title,
        },
        legend: {
          show: false
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
        // xaxis: {
        //   type: 'datetime',
        //   // labels: {
        //   //   formatter: function (val) {
        //   //     return format(new Date(val), "HH:mm"); // Format date with hours and minutes only
        //   //   },
        //   // }
        // },
        yaxis: {
          show: true,
          showAlways: true,
          // min: 0,
          // tickAmount: 6,
          // max: 30,
          decimalsInFloat: true,
          formatter: (val) => { return val },
          labels: {
            formatter: function (val) {
              return Number(val).toFixed(2); 
            }
            // formatter: function (val) {
            //   return parseInt(val); // Convert the value to an integer (whole number)
            // },
          },
        },
        tooltip: {
          shared: false,
          x: {
            format: 'HH:mm'
          },
          // x: {
          //   format: 'yyyy MMM dd HH:mm:ss', // Customize date format here
          // },
          // y: {
          //   formatter: function (val) {
          //     return val
          //   }
          // }
        }
      },
    }
  }
  return (
    <div id="chart">
      {data.length !== 0 ? <>

          <ReactApexCharts options={dataSet.options} series={dataSet.series} style={classes.responsiveHeight} height={
                  window.innerHeight == 768 ? 190: window.innerHeight == 633 ? 165:175}
          type="area"/>

      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} classes={{ paper: classes.customDialog }}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        {(param=='SAT'||param=='FAU_Supply_Temp')?<>Supply Air Temperature</>:(param=='RAQ_Co2'||param=='FAU_CO2_Value')?<>CO₂</>:param=='RARH'?<>Relative Humidity</>:(param=='Duct_Temp'||param=='FAU_Duct_Temp')?<>Duct Temperature</>:param=='RAT'?<>Return Air Temperature</>:param=='FAU_Wind_Speed'?<>Wind Speed</>:<></>}
        </DialogTitle>
        
        <DialogContent dividers>
          {(currentDay && nextDay && eqpmtType && devId && param)?
          <TimeSeriesChartModal 
          // data={oneDayDevData} 
          currentDay={currentDay}
          nextDay={nextDay}
          eqpmtType={eqpmtType}
          devId={devId}
          param={param}
          via="AHU"
          />
          :
          <>No Data Available</>
          }

          {/* {
          data24hrData?
          <ReactApexCharts options={dataSet24hr.options} series={dataSet24hr.series}  type="area" />
          :<></>        
          } */}
        </DialogContent>
      </Dialog>
      </>:<>        
       {<div style={{fontWeight:'bold',color:'black'}}>{(param=='SAT'||param=='FAU_Supply_Temp')?<>Supply Air Temperature</>:(param=='RAQ_Co2'||param=='FAU_CO2_Value')?<>CO₂</>:param=='RARH'?<>Relative Humidity</>:(param=='Duct_Temp'||param=='FAU_Duct_Temp')?<>Duct Temperature</>:param=='RAT'?<>Return Air Temperature</>:param=='FAU_Wind_Speed'?<>Wind Speed</>:<></>}</div>}
                  <h4 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>No data available</h4>
        </>
          }
    </div>
  );
}
 