import React, {  useEffect, useState } from "react";
import ReactApexCharts from 'react-apexcharts'
import { format, compareAsc, toDate,addMinutes } from 'date-fns'
import { makeStyles } from "@material-ui/core/styles";
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';


const useStyles = makeStyles((theme) => ({
  customDialog: {
    // Set the desired width for the dialog
    width: '700px', // Adjust this value as needed
  },
}))

export default function ApexChart(props)  {
  const classes = useStyles();
    const { data,param} = props;
    let elements = new Map();
    data.map((_elem, i) => {
        var myDate =new Date(_elem.measured_time) 
        elements.set(i, {x: myDate, y: parseFloat(_elem.param_value).toFixed(2)})
    });
    var elemArr = [];
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
          stroke: {
            width: [2]
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
          yaxis: {
            labels: {
              title: {
                text: "Deg C",
              },
              formatter: function (val) {
                return  parseInt(val); // Convert the value to an integer (whole number)
              },
            },
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

    return (                 

    <div id="chart">
      {data.length !== 0?
        <ReactApexCharts options={dataset.options} series={dataset.series} type="area"  height={ window.innerHeight == 641 ?125
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
                      120
        } />
      :
      <h4 style={{marginTop:"44px",marginLeft:"5px"}}>No data available</h4>
      // <div style={{display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center'}}>No data available</div>
      }
    </div>
    );
    }
 




  
