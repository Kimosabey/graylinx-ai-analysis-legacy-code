import React, { useState, useEffect } from "react";
import ReactApexCharts from 'react-apexcharts'

export default function RadialBarChart(props) {
        const { param, value, unit, color, maxVal } = props
          const dataSet = {
            series: [(value*100)/maxVal],
            options: {
              chart: {
                height: 350,
                type: 'radialBar',
                toolbar: {
                  show: false
                }
              },
              plotOptions: {
                radialBar: {
                  startAngle: -135,
                  endAngle: 225,
                   hollow: {
                    margin: 0,
                    size: '70%',
                    background: '#fff',
                    image: undefined,
                    imageOffsetX: 0,
                    imageOffsetY: 0,
                    position: 'front',
                    dropShadow: {
                      enabled: true,
                      top: 3,
                      left: 0,
                      blur: 4,
                      opacity: 0.24
                    }
                  },
                  track: {
                    background: '#fff',
                    strokeWidth: '77%',
                    margin: 0, // margin is in pixels
                    dropShadow: {
                      enabled: true,
                      top: -3,
                      left: 0,
                      blur: 4,
                      opacity: 0.35
                    }
                  },
              
                  dataLabels: {
                    show: true,
                    name: {
                      offsetY: 4,
                      show: true,
                    //   color: '#888',
                      fontSize: '18px'
                    },
                    value: {
                      formatter: function(val) {
                        return Math.round(val) + "%";
                      },
                      offsetY: 2,
                      color: '#111',
                      fontSize: '20px',
                      show: false,
                    }
                  }
                }
              },
              fill: {
                type: 'solid',
                colors: [color],
                gradient: {
                  shade: 'dark',
                  type: 'horizontal',
                  shadeIntensity: 0.5,
                  gradientToColors: ['#ABE5A1'],
                  inverseColors: true,
                  opacityFrom: 1,
                  opacityTo: 1,
                  stops: [0, 100]
                }
              },
              stroke: {
                lineCap: 'round'
              },
              labels: [param],
            },
          
          
          };
          return (
            <div id="card">
                <div id="chart">
                <ReactApexCharts options={dataSet.options} series={dataSet.series} type="radialBar" height={150} />
                </div>
            </div>
          );
      }