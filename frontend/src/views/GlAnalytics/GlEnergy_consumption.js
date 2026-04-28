import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const Chart = ({ data, hour }) => {

    const days = [];
    const values = [];
    const date = [];

    if (data && Array.isArray(data.data)) {
        data.data.forEach((item, index) => {
            if (hour === 'Week') {
                days.push(item.day_name);
                values.push(item.energy);
                date.push(item.mydate);
            } else if (hour === 'Day') {
                days.push(item.hour);
                values.push(item.energy);
            } else if (hour === 'Month') {
                days.push(item.date);
                values.push(item.energy);
            } else if (hour === 'Year') {
                days.push(item.month);
                values.push(item.energy);
            }
        });
    } else {
        console.error('Invalid data format. Expected an object with a data property that is an array.');
    }
    const option = {
        backgroundColor: '#FFF5F5',
        legend: {
            data: ['bar', 'line', 'area'],
            textStyle: {
                color: '#ccc',
            },
            selected: {
                'bar': true,
                'line': false,
                'area': false,
                'stepArea': false,
            },
        },
        xAxis: {
            type: 'category', // Category type for days
            data: days, // X-axis labels from day_name
            axisLine: {
                lineStyle: {
                    // color: '#000',  // Black color for the axis line
                    width: 2,       // Set the width for a bold line
                },
            },
            axisLabel: {
                color: '#000', // Black color for xAxis labels
                fontWeight: '600', // Optional: bold labels
                interval: 'auto', // Let ECharts decide interval automatically
                rotate: 45, // Rotate labels to avoid overlap
                margin: 10, // Add some margin between the axis and the labels
            },
        },
        yAxis: {
            splitLine: { show: false },
            axisLine: {
                lineStyle: {
                    color: '#ccc',
                },
            },
            axisLabel: {
                color: '#000',
                formatter: '{value} Kw',
            },
        },
        series: [
            {
                name: 'bar',
                type: 'bar',
                barWidth: 20, 
                barCategoryGap: '50%', 
                itemStyle: {
                    borderRadius: 5,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#ff6633' },
                        { offset: 1, color: '#ff6633' },
                    ]),
                    shadowColor: 'rgba(0, 0, 0, 0.5)', // Shadow color
                    shadowBlur: 8, // Shadow blur
                    shadowOffsetX: 5, // Horizontal shadow offset
                    shadowOffsetY: -4, // Vertical shadow offset
                },
                data: values.map((value, index) => ({
                    value, // The bar value
                    day: days[index], // Your custom date
                    mydate: date[index],
                })),
            },
            {
                name: 'line',
                type: 'line',
                smooth: true,
                showAllSymbol: true,
                symbol: 'emptyCircle',
                symbolSize: 15,
                data: values.map((value, index) => ({
                    value, // The bar value
                    day: days[index], // Your custom date
                })),
            },
            {
                name: 'area',
                type: 'line',
                smooth: true,
                areaStyle: {
                    color: 'rgba(255, 99, 71, 0.5)', // Semi-transparent color for the area
                },
                lineStyle: {
                    color: '#0292f8', // Color for the line
                },
                data: values.map((value, index) => [days[index], value]),
            },
            // {
            //   name: 'stepArea',
            //   type: 'line',
            //   step: 'start',
            //   areaStyle: {
            //     color: 'rgba(255, 99, 71, 0.5)', // Semi-transparent color for the step area
            //   },
            //   lineStyle: {
            //     color: '#0292f8', // Color for the step line
            //   },
            //   data: values.map((value, index) => [days[index], value]),
            // },
        ],
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
                label: {
                    backgroundColor: '#6a7985',
                },
            },
            formatter: function (params) {
                let tooltipContent = `<div><strong>Energy Consumption</strong></div>`;
                params.forEach(param => {
                    tooltipContent += ((hour == 'Week') ? `<div><strong>${param.data.mydate}:</strong> ${param.data.value} Kw</div>` : `<div> ${param.data.value} Kw</div>`)
                });
                return tooltipContent;
            },
        },
    };


    if (!days.length || !values.length) {
        return <h4 style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>No data available</h4>;
    }

    return (
        <div style={{ height: '400px', width: '100%' }}>
            <ReactECharts option={option} />
        </div>
    );
};

export default Chart;