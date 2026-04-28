import React from "react";
import ReactApexCharts from 'react-apexcharts';

export default function NestedGrid(props) {
  let data1 = props.histogramData,
    status = props.status,
    occupancy = [],
    day = [],
    totalSlots = [],
    occupiedSlots = [],
    availableSlots = [],
    time = [];

  data1.forEach((item, index) => {
    if (data1 !== undefined && status === "Daily") {
      occupancy.push(item.occupied <=10?item.occupied:10);
      const date = new Date(item.day);
        const formattedDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
        month: "short", // Use short month format for first three letters
        // weekday: "short",

      });
      day.push(formattedDate);
    } else if (data1 !== undefined && status === "Hourly") {
     
      totalSlots.push(item.totalSlots);
      occupiedSlots.push(item.occupiedSlots);      // const date = new Date(item.hour);
      availableSlots.push(item.totalSlots-item.occupiedSlots);      // const date = new Date(item.hour);
      const date = new Date(item.hour +' GMT');
      const formattedTime = date.toLocaleTimeString ([], { hour: '2-digit',hour12: true })
      time.push(formattedTime);
    }
  });


const colors = status === "Daily"
    ? ['#fe2712']
    : occupiedSlots.map(res => {
        if (res < 10) {
            return '#138808'; // green
        }
        //  else if (res === 11) {
        //     return '#FFA500'; // orange
        // } else if (res === 12) {
            return '#fe2712'; // red
        // }
       
        // return '#138808'; // default color (black) for values outside the specified range
    });


  const state = {
    series: status === "Daily"
      ? [{
          name: 'Total Entries',
          data: occupancy
        }]
      : [{
          name: 'Occupied Slots',
          data: occupiedSlots,
        },
        // {
        //   name: 'Available Slots',
        //   data: availableSlots,
        // }
      ],
    options: {
      chart: {
        height: 350,
        type: 'bar',
        dropShadow: {
          enabled: true,
          enabledOnSeries: undefined,
          top: 0,
          left: 0,
          blur: 3,
          color: '#000',
          opacity: 0.35
      }
      },
      legend: {
        show: false
      },
    
      plotOptions: {
        bar: {
          distributed: true,
          dataLabels: {
            enabled: true,
            position: 'top', // Display above the bars
          },
          colors: {
            ranges: [],
            backgroundBarColors: [],
        },
        columnWidth: (occupancy.length ||occupiedSlots.length  ||availableSlots) <= 4? '25%':'70%',
        // columnWidth: (occupancy.length ||occupiedSlots.length  ||availableSlots) <= 2? '12%':'70%',
      //   border: {
      //     width: 100, // Border width
      //     color: '#0123B4', // Border color
      // },
      }
      },
      colors: colors,
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20, // Adjust as needed
        style: {
          fontSize: '12px',
          colors: ["#304758"]
        }
      },
      xaxis: status === "Daily"
        ? {
            categories: day,
            position: 'bottom',
            axisBorder: {
              show: true
            },
            axisTicks: {
              show: false
            },
            crosshairs: {
              fill: {
                type: 'gradient',
                gradient: {
                  colorFrom: '#D8E3F0',
                  colorTo: '#BED1E6',
                  stops: [0, 100],
                  opacityFrom: 0.4,
                  opacityTo: 0.5,
                }
              }
            },
            tooltip: {
              enabled: false,
            }
          }
        : {
            categories: time,
            position: 'bottom',
            axisBorder: {
              show: true
            },
            axisTicks: {
              show: false
            },
            crosshairs: {
              fill: {
                type: 'gradient',
                gradient: {
                  colorFrom: '#D8E3F0',
                  colorTo: '#BED1E6',
                  stops: [0, 100],
                  opacityFrom: 0.4,
                  opacityTo: 0.5,
                }
              }
            },
            tooltip: {
              enabled: false,
            },
            labels: {
              rotateAlways:true,
              rotate: -90, // Ensure labels are horizontal
            }
          },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: true,
          formatter: function (val) {
            return Math.round(val); // Round to the nearest integer
          },
        }
      },
      title: status === "Daily"
        ? {
            text: 'Occupied Slots',
            floating: true,
            offsetY: 330,
            align: 'center',
            style: {
              color: '#444'
            }
          }
        : {}
    },
  };
  
  return (
    <div id="chart"style={{height:data1.length >0?'':'15vh'}}>
      {data1.length >0?
      <ReactApexCharts options={state.options} series={state.series} type="bar" height={150} />
    :
    <div className="text-center" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>No Data</div>
    }
    </div>
  );
}


