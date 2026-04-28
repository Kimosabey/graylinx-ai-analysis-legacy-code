import React from 'react';
import {Line} from 'react-chartjs-2';

function MultiLineChart(props) {
    // const { thisMonth, lastMonth } = props.data
    const { co2, tvoc, pm2_5, pm10, noise } = props.data
    const state = {
      labels: tvoc.x,
        datasets: [
          {
            label: 'TVOC',
            borderColor: "#A9A9A9",
            pointHitRadius: 2,
            lineTension: 0.1,
            fill: false,
            data: tvoc.y
          },
          {
            label: 'Co2',
            borderColor: '#3f51b5',
            pointHitRadius: 2,
            lineTension: 0.1,
            fill: false,
            data: co2.y
          },
          {
            label: 'PM2.5',
            borderColor: '#FF0000',
            pointHitRadius: 2,
            lineTension: 0.1,
            fill: false,
            data: pm2_5.y
          },
          {
            label: 'PM10',
            borderColor: '#00FF00',
            pointHitRadius: 2,
            lineTension: 0.1,
            fill: false,
            data: pm10.y
          },
          {
            label: 'Noise',
            borderColor: '#000020',
            pointHitRadius: 2,
            lineTension: 0.1,
            fill: false,
            data: noise.y
          },

        ]
        // labels: lastMonth.x,
        // datasets: [
        //   {
        //     label: 'Last Month',
        //     borderColor: "#A9A9A9",
        //     pointHitRadius: 2,
        //     lineTension: 0.1,
        //     fill: false,
        //     data: lastMonth.y
        //   },
        //   {
        //     label: 'This Month',
        //     borderColor: '#3f51b5',
        //     pointHitRadius: 2,
        //     lineTension: 0.1,
        //     fill: false,
        //     data: thisMonth.y
        //   }
        // ]
    }
    return (
        <div>
          <Line
            data={state}
            height={200}
            width={500}
            options={{
              title:{
                display:true,
                text:'Last 24 hours Stats',
                fontSize:18
              },
              legend:{
                display:true,
                position:'bottom',
                align: 'start'
              },
              scales: {
                  xAxes: [{
                    categorySpacing: 0,
                    scaleLabel: {
                      display: true,
                      labelString: "Time"
                    },
                  }],
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: (props.parameter.charAt(0).toUpperCase() + props.parameter.slice(1))
                    },
                    ticks: {
                        suggestedMin: 0,
                        stepSize: 10
                    },
                  }]
              },
              maintainAspectRatio: false
            }}
          />
        </div>
      );
}

export default MultiLineChart;