import React from 'react';
import Chart from 'react-apexcharts';

const AnalyticsfaultsChart = (props) => {
  const { data } = props;

  const categories = [...new Set(data.map(item => item.Devicename))];
  const groupedData = data.reduce((acc, item) => {
    const source = item.source;
    if (!acc[source]) {
      acc[source] = [];
    }
    acc[source].push(item.parameter_count);
    return acc;
  }, {});

  const series = Object.entries(groupedData).map(([name, values]) => ({
    name,
    data: values,
  }));

  const options = {
    series: series,
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        columnWidth:'30%',
        horizontal: false,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900,
            },
          },
        },
        columnWidth: '30%',
        barWidth: '30%',
      },
    },
    xaxis: {
      categories: categories,
    },
    legend: {
      position: 'bottom',
      offsetY: 10,
    },
    fill: {
      opacity: 1,
    },
    colors: ['#3399FF', '#5BE0AB'],
    yaxis: {
        title: {
          text: 'Number of Faults',
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
  };

  return (
    <div id="chart" style={{ marginLeft: '3%' }}>
      <Chart options={options} series={options.series} type="bar" height={280} width={480} />
    </div>
  );
};

export default AnalyticsfaultsChart;
