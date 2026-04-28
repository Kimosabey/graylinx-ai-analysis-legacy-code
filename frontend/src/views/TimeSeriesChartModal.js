import React,{useEffect, useState} from "react";
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
import api from "./../api"
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


const useStyles = makeStyles((theme) => ({
  customDialog: {
    // Set the desired width for the dialog
    width: '700px', // Adjust this value as needed
  },
}))

export default function ApexChart(props) {
  const classes = useStyles();
  const {currentDay,nextDay,  via,param, title, minRange, maxRange,eqpmtType, devId
    // , data24hrData
  } = props;
  const [open, setOpen] = React.useState(false);
  const [oneDayDevData, setoneDayDevData] = useState({});
  const [elemArrforDataSet, setelemArrforDataSet] = useState([]);
  let dataSet = {};
  let elements = new Map(), ele24hr = new Map(),minnRange=Number(minRange),maxxRange=Number(maxRange),elementsMin = new Map(), elementsMax = new Map();
  var elemArr = [], elemArr24hr = [], elemArrMin = [], elemArrMax = [];;

useEffect(()=>{
        let req1day = {
           "startdate":currentDay,
            "enddate":nextDay
        }
        api.floor.getDeviceData(req1day,devId, eqpmtType,"1 DAY").then((res) => {
            console.log("I am in TSCModal",res)
          Object.keys(res.graphData[0]).map((key) => {
            if(key == param){
              setoneDayDevData(res.graphData[0][key])
              let lcl = 15, ucl = 30;
              switch (param) {
                case "SAT": lcl = 18; ucl = 25; break;
                case "RAT": lcl = 22; ucl = 27; break;
                case "CHW_Vlv_Pos": lcl = 0; ucl = 100; break;
                default: lcl = 0; ucl = 0; break;
                // default: lcl = 15; ucl = 30; break;
              }

              if(res.graphData[0][key]){ res.graphData[0][key].map((_elem, i) => {
                var myDate =toDate(addMinutes(new Date(_elem.measured_time),330))
                if(param == 'CHW_Vlv_Fbk'){
                  elements.set(i, { x: myDate, y: ((_elem.param_value=='inactive')?0:1)})
                }else{
                  elements.set(i, { x: myDate, y: ((Number(_elem.param_value)< minnRange) ? minnRange : (((Number(_elem.param_value)>maxxRange) ) ? maxxRange : parseFloat(_elem.param_value).toFixed(2))) })
                }
                return (<></>);
              })}

              for (let i of elements.values()) {
                elemArr.push(i)
              }
              setelemArrforDataSet(elemArr)
            }
        })
          
        })
},[])

console.log("elemArrforDataSet",elemArrforDataSet)

dataSet = {
    series: [{
      name: param,
      data: elemArrforDataSet
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
          datetimeFormatter: {
            hour: 'HH'
          }
        },
        
      },
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


  return (
    <div id="chart">
        {(oneDayDevData)?
        <ReactApexCharts options={dataSet.options} series={dataSet.series} style={classes.responsiveHeight} type="area"/>
        :
        <h4 style={{display:'flex',justifyContent:'center',alignItems:'center'}}>No data available</h4>
    }
    </div>
  );
}
 