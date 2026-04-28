import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';
import React from 'react';
import {Line} from 'react-chartjs-2';

function LineChart(props) {
    const { data } = props
    const {parameter, unit } = props
    const state = {
        // labels: thl.x,
        labels: new Array(data.y.length).fill(""),
        datasets: [
          {
            label: (parameter.charAt(0).toUpperCase() + parameter.slice(1)),
            borderColor: "#3f51b5",
            pointHitRadius: 0,
            pointRadius: 0,
            lineTension: 0.2,
            fill: false,
            data: data.y
          },
          // {
          //   label: 'Min',
          //   borderColor: '#FF0000',
          //   pointHitRadius: 2,
          //   pointRadius: 0,
          //   lineTension: 0.1,
          //   fill: false,
          //   data: parameter === "temperature" ? new Array(thl.y.length).fill(configValues.minTemp) : parameter === "humidity"? new Array(thl.y.length).fill(configValues.minHum) : new Array(thl.y.length).fill(configValues.minLux)
          // },
          // {
          //   label: 'Max',
          //   borderColor: '#FF0000',
          //   pointHitRadius: 2,
          //   pointRadius: 0,
          //   lineTension: 0.1,
          //   fill: false,
          //   data: parameter === "temperature" ? new Array(thl.y.length).fill(configValues.maxTemp) : parameter === "humidity"? new Array(thl.y.length).fill(configValues.maxHum) : new Array(thl.y.length).fill(configValues.maxLux)
          // }   
        ]
    }
    return (
        <div>
          <GridContainer>
            <GridItem xs={8} sm={8} md={12} lg={12} xl={12}>
          <Line
            data={state}
            width={500}
            height={250}
            options={{
              title:{
                display:true,
                text:"Today's Stats-Hourly",
                fontSize:18
              },
              legend:{
                display:true,
                position:'bottom'
              },
              scales: {
                  xAxes: [{
                    categorySpacing: 0,
                    scaleLabel: {
                      display: true,
                      labelString: "Date / Time"
                    },
                  }],
                  yAxes: [{
                    scaleLabel: {
                      display: true,
                      labelString: parameter !== "luminousity" ?
                        (parameter.charAt(0).toUpperCase() + parameter.slice(1)) + " (" + unit + ")" 
                        : "Luminosity (" + unit + ")"
                    },
                    ticks: {
                        suggestedMin: Math.floor(data.min),
                        suggestedMax: Math.ceil(data.max),
                        // stepSize: minMaxData[parameter].step
                    },
                  }]
              },
              maintainAspectRatio: false
            }}
          />
          </GridItem>
          </GridContainer>
        </div>
      );
}

export default LineChart;