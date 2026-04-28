import React from "react";
import ReactApexCharts from 'react-apexcharts'
// import moment from 'moment';
import { format, compareAsc, toDate,addMinutes } from 'date-fns'

const TimeSeries = (props) => {
  const { data, param } = props;
  let elements = new Map();

  data.map((_elem, i) => {
    // console.log("ems time",_elem.measured_time)
    // var myDate = moment(_elem.measured_time).add(330, 'm').toDate();
    var myDate =toDate(addMinutes(new Date(_elem.measured_time),330))
    elements.set(i, { x: myDate, y: parseFloat(_elem.param_value).toFixed(2) })

  })

  var elemArr = [];
  for (let i of elements.values()) {
    elemArr.push(i)
  }
  let dataSet = {}

  dataSet = {
    series: [{
      name: param,
      data: elemArr
    }
    ],
    options: {
      chart: {
        type: 'area',
        stacked: false,
        height: 350,
        zoom: {
          type: 'x',
          enabled: true,
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
      colors: ['#2E93fA', '#FF0000', '#FF0000'],
      stroke: {
        width: [4, 2, 2]
      },
      title: {
        // text: param,
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

    //   xaxis: {
    //     type: 'datetime',
    //   },

    // xaxis: {
    //     labels: {
    //       datetimeFormatter: {
    //         // year: 'yyyy',
    //         // month: 'MMM \'yy',
    //         // day: 'dd MMM',
    //         // hour: 'HH:mm'
    //       }
    //     }
    //   },

    xaxis: {
        type: 'datetime',
        labels: {
          format: 'HH:ss',
         
        }
      },
      //   yaxis: {

      //     show: true,

      //     showAlways: true,

      //     min: -5,
      //     tickAmount:2,
      //      max: 5,

      //     decimalsInFloat: false,

      //     formatter: (val) => { return val },



      //   },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return val
          }
        }
      }
    },
  }




  return (
    <div id="chart">
      <ReactApexCharts
        options={dataSet.options} series={dataSet.series} type="area"
        height={130}
      />
    </div>

  );
};

export default TimeSeries;