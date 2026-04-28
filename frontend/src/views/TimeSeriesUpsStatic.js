import React from "react";
import Chart from "react-apexcharts";


const TimeSeriesUps = (props) => {
  const { data, } = props;
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
        name: "Load",
        data: dates
      }
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
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

  return (
    <div id="chart">
      <Chart
        options={state.options}
        series={state.series}
        type="area"
        height={
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
                      120
        }
      />
    </div>

  );
};

export default TimeSeriesUps;