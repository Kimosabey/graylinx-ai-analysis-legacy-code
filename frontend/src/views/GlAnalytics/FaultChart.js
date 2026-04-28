import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const FaultChart = ({ openFaults, closeFaults }) => {
  const [chartData, setChartData] = useState({
    series: [
      { name: 'Open Faults', data: [],color: '#FF5733' },
      { name: 'Closed Faults', data: [] }
    ],
    options: {
      chart: {
        type: 'bar',
        height: 430
      },
      plotOptions: {
        bar: {
          horizontal: false, // Vertical chart
          dataLabels: {
            position: 'top',
          },
          barWidth: '20%', // Adjust bar width here
        }
      },
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#FF5733', '#3399FF'],
      },
      tooltip: {
        shared: true,
        intersect: false
      },
      xaxis: {
        categories: [], // Will be filled with device names
      },
    }
  });

  useEffect(() => {
    const deviceNames = openFaults.map(fault => fault.Devicename);
    const openCounts = openFaults.map(fault => fault.open_count);
    const closeCounts = closeFaults.map(fault => fault.close_count);

    setChartData({
      ...chartData,
      series: [
        { name: 'Open Faults', data: openCounts },
        { name: 'Closed Faults', data: closeCounts }
      ],
      options: {
        ...chartData.options,
        xaxis: {
          categories: deviceNames
        }
      }
    });
  }, [openFaults, closeFaults]);

  return (
    <div>
      <div id="chart">
        <ReactApexChart options={chartData.options} series={chartData.series} type="bar" height={430} />
      </div>
      <div id="html-dist"></div>
    </div>
  );
};

export default FaultChart;
