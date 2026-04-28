import React from 'react'
import ReactApexCharts from 'react-apexcharts'
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';


function Devicetrend(props) {
  const data =props.data
  const text = props.param
  console.log("emsssss",data,text)
  let tempArr=[]
  data.map(obj=>{
    let tempData={}  
    tempData.x=obj.measured_time
    tempData.y=obj.param_value
    tempData.goals=[]
    
    tempArr.push(tempData)
  })
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  const dataset = {
      series: [
        {
          name: text.slice(3).charAt().toLocaleUpperCase()+text.slice(4),
          data: tempArr
        }
      ],
      options: {
        title:{
            // text:text.slice(3).charAt().toLocaleUpperCase()+text.slice(4),

        },
          
        chart: {
          type: 'bar',
          width:"100%",
          zoom: {
            enabled: true
          }

         
          // color:'rgb(38 231 166)',
         
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '20%',
            endingShape: 'rounded',
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          type: '',
          tickPlacement: 'on'
        },
        yaxis: {
          show: true,
          showAlways: true, 
          // min: 0,
          tickAmount:5,
          //  max: 25,
          decimalsInFloat: false,
          formatter: (val) => { return val },

        },
        fill: {
          opacity: 1
        },
        colors: ['#00E396'],
        tooltip: {
          y: {
            formatter: function (val) {
              return  formatter.format(val) + "VA"
            }
          }
        }
      },
  };
    
  return (
      <GridContainer>
        <GridItem>
        <ReactApexCharts options={dataset.options} series={dataset.series} type="bar" style={{width:'22vw'}}
            />
        </GridItem>
        {/* <GridItem>
        <ReactApexCharts options={dataset2.options} series={dataset2.series} type="line" height={200} />
        </GridItem> */}
      </GridContainer>
  )
}

export default Devicetrend