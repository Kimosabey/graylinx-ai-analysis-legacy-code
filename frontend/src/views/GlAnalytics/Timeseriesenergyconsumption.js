import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const EChartComponent = ({ data, title, lineColors, timePeriod, hour }) => {
  useEffect(() => {
    
    const chartDom = document.getElementById('main');
    const myChart = echarts.init(chartDom);

    const processedData = data.data;

     const startDate = new Date(data.start_date);
     const endDate = new Date(data.end_date);
 
     // Function to get month name
     const getMonthName = (date) => {
       const options = { month: 'long' };
       return new Intl.DateTimeFormat('en-US', options).format(date);
     };


     const startMonth = getMonthName(startDate); 
    const endMonth = getMonthName(endDate); 

    let xAxisData = [];
    let series = [];
    let prevEnergy = []
    if (hour === 'Day') {
      xAxisData = [
        '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
        '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
      ];

      series = [
        {
          name: 'Previous Day Energy',
          type: 'bar',
          data: xAxisData.map(hour => {
            const item = processedData.find(d => d.previous_day_hour === hour);
            return item ? item.previous_day_energy : 0;
          }),
          itemStyle: {
            color: lineColors ? lineColors[0] : '#0040ff',
          },
        },
        {
          name: 'Current Day Energy',
          type: 'bar',
          data: xAxisData.map(hour => {
            const item = processedData.find(d => d.current_day_hour === hour);
            return item ? item.current_day_energy : 0;
          }),
          itemStyle: {
            color: lineColors ? lineColors[1] : '#61bb46',
          },
        }
      ];
    } else if (hour === 'Week') {
      xAxisData = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      series = [
        {
          name: 'Previous Week Energy',
          type: 'bar',
          data: xAxisData.map(day => {
            const item = processedData.find(d => d.day_name === day);
            return item ? item.previous_week_energy : 0;
          }),
          itemStyle: {
            color: lineColors ? lineColors[0] : '#2a70c6',
          },
        },
        {
          name: 'Current Week Energy',
          type: 'bar',
          data: xAxisData.map(day => {
            const item = processedData.find(d => d.day_name === day);
            return item ? item.current_week_energy : 0;
          }),
          itemStyle: {
            color: lineColors ? lineColors[1] : '#61bb46',
          },
        }
      ];



    } else if (hour === 'Month') {
       
        xAxisData = processedData.map(item => item.date);// Assuming `item.date` holds the date for both previous and current month
console.log("kkkkkkkkkkkkkkkkkkkk",hour)
    
        series = [
            {
                name: startMonth, 
                type: 'bar',
                data: processedData.map(item => item.previous_energy),  // Mapping previous energy values
                itemStyle: {
                    color: lineColors ? lineColors[0] : '#2a70c6',  // Color for previous energy bars
                },
            },
            {
                name: endMonth ,
                type: 'bar',
                data: processedData.map(item => item.current_energy !== null ? item.current_energy : 0),  // Mapping current energy values, replacing null with 0
                itemStyle: {
                    color: lineColors ? lineColors[1] : '#61bb46',  // Color for current energy bars
                },
            }
        ];
    
       
          
      } else if (hour === 'Year') {
        xAxisData = ['January', 'February', 'March', 'April','May','June','July','August','September','October','November','December']; // Adjust as needed for available years
        // xAxisData = processedData.map(d => d.month_name); 
        series = [
          {
            name: 'Previous Year Energy',
            type: 'bar',
            data: xAxisData.map(year => {
              const item = processedData.find(d => d.month_name === year);
              return item ? item.last_year_energy : 0;
            }),
            itemStyle: {
              color: lineColors ? lineColors[0] : '#2a70c6',
            },
            
          },
          {
            name: 'Current Year Energy',
            type: 'bar',
            data: xAxisData.map(year => {
              const item = processedData.find(d => d.month_name === year);
              return item ? item.current_year_energy : 0;
            }),
            itemStyle: {
              color: lineColors ? lineColors[1] : '#61bb46',
            },
          }
        ];
  
     
      } else {
      }
    const option = {
        backgroundColor: '#ffffff',
        title: {
          text: title || '',
          left: 'center',
          textStyle: {
            fontSize: 18,
            color: '#333',
          },
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 10,
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          data: series.map(ser => ser.name),
          bottom: 10,
          textStyle: {
            color: '#333',
            fontWeight: 'bold',
          },
          icon: 'roundRect',
        },
        xAxis: {
          type: 'category',
          data: xAxisData,
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333',
              width: 1,
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#333',
            fontSize: 12,
            fontWeight: 'bold',
            show :hour == 'Month'?false:true
          },
        },
        yAxis: {
          type: 'value',
          name: 'Energy',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333',
              width: 1,
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#333',
            fontSize: 12,
            formatter: '{value} Kw',
            fontWeight: 'bold',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#ddd',
              type: 'dashed',
            },
          },
        },
        dataZoom: [
          {
            type: 'inside',
            start: 0,
            end: 100,
          },
          {
            start: 0,
            end: 100,
          },
        ],
        series: [
          ...series,
          // Add empty series to create gaps
          {
            // name: 'Gap',
            type: 'bar',
            barWidth: '0%', // No visible bar
            itemStyle: {
              barBorderRadius: [5, 5, 0, 0],
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowBlur: 10,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
              },
            emphasis: {
              itemStyle: {
                color: 'transparent',
              },
            },
          }
        ],
        barCategoryGap: '30%', // Increase gap between bars in the same category
        barGap: '15%', // Adjust the gap between different series in the same category
      };
      
 
      
    
    myChart.setOption(option);

    return () => {
      myChart.dispose();
    };
  }, [data, title, lineColors, timePeriod, hour]);

  return <div id="main" style={{ width: '100%', height: '400px' }} />;
};

export default EChartComponent;


