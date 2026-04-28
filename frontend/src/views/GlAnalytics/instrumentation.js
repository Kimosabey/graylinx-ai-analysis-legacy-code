import React,{useEffect,useState} from 'react';
import Chart from 'react-apexcharts';
import api from "../../api";
import { Typography } from '@material-ui/core';

const UsageChart = () => {

    const[cpuSeries,setcpuSeries]=useState([]);
    const[memorySeries,setMemorySeries]=useState([]);
    const[dbConnectionsSeries,setdbConnectionsSeries]=useState([]);
   
//   const graphData = [
//     {
//       cpu_usage: [
//         {
//           ss_id: "4d76b148-6348-11ee-a834-9829a659bca4",
//           measured_time: "2024-03-28 15:37:40",
//           metric_id: "cpu_usage",
//           metric_value: "361.34"
//         },
//         {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:45",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.33"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:50",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.33"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:55",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.32"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:00",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.31"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:05",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.30"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:10",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.30"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:15",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.30"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:20",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.30"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:25",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.30"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:30",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.29"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:35",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.29"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:40",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.28"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:45",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.28"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:50",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.26"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:55",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.26"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:00",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.24"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:05",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.22"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:10",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.20"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:15",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.19"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:20",
//             "metric_id": "cpu_usage",
//             "metric_value": "361.18"
//           }
//         // More CPU usage data...
//       ],
//       memory_usage: [
//         {
//           ss_id: "4d76b148-6348-11ee-a834-9829a659bca4",
//           measured_time: "2024-03-28 15:37:40",
//           metric_id: "memory_usage",
//           metric_value: "74.33"
//         },
//         {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:45",
//             "metric_id": "memory_usage",
//             "metric_value": "78.68"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:50",
//             "metric_id": "memory_usage",
//             "metric_value": "78.63"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:55",
//             "metric_id": "memory_usage",
//             "metric_value": "79.02"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:00",
//             "metric_id": "memory_usage",
//             "metric_value": "79.56"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:05",
//             "metric_id": "memory_usage",
//             "metric_value": "79.47"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:10",
//             "metric_id": "memory_usage",
//             "metric_value": "79.79"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:15",
//             "metric_id": "memory_usage",
//             "metric_value": "79.40"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:20",
//             "metric_id": "memory_usage",
//             "metric_value": "79.76"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:25",
//             "metric_id": "memory_usage",
//             "metric_value": "80.06"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:30",
//             "metric_id": "memory_usage",
//             "metric_value": "80.70"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:35",
//             "metric_id": "memory_usage",
//             "metric_value": "81.25"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:40",
//             "metric_id": "memory_usage",
//             "metric_value": "81.83"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:45",
//             "metric_id": "memory_usage",
//             "metric_value": "82.04"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:50",
//             "metric_id": "memory_usage",
//             "metric_value": "82.13"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:55",
//             "metric_id": "memory_usage",
//             "metric_value": "81.90"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:00",
//             "metric_id": "memory_usage",
//             "metric_value": "82.65"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:05",
//             "metric_id": "memory_usage",
//             "metric_value": "82.82"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:10",
//             "metric_id": "memory_usage",
//             "metric_value": "84.99"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:15",
//             "metric_id": "memory_usage",
//             "metric_value": "85.15"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:20",
//             "metric_id": "memory_usage",
//             "metric_value": "85.72"
//           }
//         // More memory usage data...
//       ],
//       db_connections: [
//         {
//           ss_id: "4d76b148-6348-11ee-a834-9829a659bca4",
//           measured_time: "2024-03-28 15:37:40",
//           metric_id: "db_connections",
//           metric_value: "34"
//         },
//         {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:45",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:50",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:37:55",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:00",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:05",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:10",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:15",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:20",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:25",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:30",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:35",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:40",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:45",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:50",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:38:55",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:00",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:05",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:10",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:15",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           },
//           {
//             "ss_id": "4d76b148-6348-11ee-a834-9829a659bca4",
//             "measured_time": "2024-03-28 15:39:20",
//             "metric_id": "db_connections",
//             "metric_value": "34"
//           }
//         // More db connections data...
//       ]
//     }
//   ];

  useEffect(() => {
    api.instrumentation.instrumentation().then((res) => {
      console.log("freezone",res)
    //   setUsagedata(res.graphData[0]);
     
    setcpuSeries(res.graphData[0].cpu_usage.map(item => [new Date(item.measured_time).getTime(), parseFloat(item.metric_value)]));
    setMemorySeries(res.graphData[0].memory_usage.map(item => [new Date(item.measured_time).getTime(), parseFloat(item.metric_value)]));
    setdbConnectionsSeries(res.graphData[0].db_connections.map(item => [new Date(item.measured_time).getTime(), parseFloat(item.metric_value)]));
    });
  }, []);


  const chartData = {
    options: {
      chart: {
        id: 'usage-chart',
        type: 'line',
        height: 350,
        zoom: {
          enabled: false
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false, // Ensure it's set to false to display local time
          formatter: function(val) {
            return new Date(val).toLocaleString(); // Adjust the format according to your preference
          }
        }
      },
      yaxis: {
        title: {
          text: 'Usage'
        }
      },
      tooltip: {
        x: {
          format: 'dd/MM/yyyy HH:mm:ss'
        }
      },
      stroke: {
        curve: 'smooth'
      }
    },
    series: [
      {
        name: 'CPU Usage',
        data: cpuSeries
      },
      {
        name: 'Memory Usage',
        data: memorySeries
      },
      {
        name: 'DB Connections',
        data: dbConnectionsSeries
      }
    ]
  };
  
  
  

  return (
    <div id="chart">
      <Typography style={{fontWeight:"bold",fontSize:"5vh"}}>Instrumentation</Typography>
      <Chart options={chartData.options} series={chartData.series} type="line" height={350} />
    </div>
  );
};

export default UsageChart;
