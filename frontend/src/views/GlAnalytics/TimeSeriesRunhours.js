import React from 'react';
import ReactApexChart from 'react-apexcharts';

const AnalyticsrunhourChart = (props) => {
  const { data, yAxisRange } = props;
  console.log('yAxisRange:', yAxisRange);

  const categories = data.map((element) => Object.keys(element)[0]);

  let values = [];

  data.forEach((element) => {
    const paramValues = element[Object.keys(element)[0]].map((item) => Number(item.run_hour));
    values.push(paramValues);
  });

  const chartData = {
    series: [{
      name: 'run_hour',
      data: values.flat(),
    }],
    options: {
      chart: {
        height: 350,
        type: 'bar',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: 'top',
          },
          columnWidth: '40%',
          barWidth: '40%',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return Math.floor(val) + ''; 
        },
        offsetY: -20,
        style: {
          fontSize: '12px',
          colors: ['#304758'],
        },
      },
      xaxis: {
        categories: categories,
        position: 'bottom',
        axisBorder: {
          show: false,
        },
        title: {
          style: {
            fontWeight: 'bold',
            color: '#333',
          },
        },
        axisTicks: {
          show: false,
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
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: 
      {
        labels: {
          formatter: function (val) {
            return Math.floor(val) + 'hr';
          },
        },
        title: {
          text: 'Runhours',
          style: {
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#333',
          },
        },
      },
      title: {
        floating: true,
        offsetY: 330,
        align: 'center',
        style: {
          color: '#444',
        },
      },
    },
  };

  return (
    <div id="chart" style={{ marginTop: '3%' }}>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        width={480}
        height={280}
      />
    </div>
  );
};

export default AnalyticsrunhourChart;
