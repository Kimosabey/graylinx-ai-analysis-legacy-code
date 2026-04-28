import React from 'react'
import ReactApexCharts from 'react-apexcharts'
import GridContainer from 'components/Grid/GridContainer';
import GridItem from 'components/Grid/GridItem';


function DevicetrendChart(props) {
  // console.log("props.params",props)
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  const data = props.data
  const text = props.param
  const dev_id = data.map(_i => _i.ssid)
  const name = data.map(_i => _i.name)
  let tempArr = []
  // console.log("data",data)
  data.map(obj => {
    let tempData = {}
    tempData.x = (obj.name).split('-')[1]
    if(props.param=='ChW_Valve'){
      (obj.actual<0)? tempData.y = '0' : (obj.actual>100)? tempData.y = '100':
    tempData.y = formatter.format(obj.actual)
    }else{
      tempData.y = formatter.format(obj.actual)
    }
    // tempData.goals = []
    // let goalObj = {}
    // goalObj["name"] = 'Expected'
    // goalObj["value"] = obj.expected
    // goalObj["strokeHeight"] = 5
    // goalObj["strokeColor"] = '#775DD0'
    // tempData.goals.push(goalObj)
    tempArr.push(tempData)
    return tempArr
  })
  const onclickchart = (e, c, con) => {
    if(props.eqp == 'ahu'){
      let i = con.dataPointIndex
      localStorage.setItem("deviceID", "Ahu2");
      localStorage.setItem("deviceName", "Ahu1");
      props.history.push({
        pathname: `/admin/glAhu`,
        state: {
          data: dev_id[i],
          name: name[i]
        }
      })   
    }
    else{
      let i = con.dataPointIndex
      // localStorage.setItem("deviceID", "Ahu2");
      // localStorage.setItem("deviceName", "Ahu1");
      props.history.push({
        pathname: `/admin/glCsu`,
        state: {
          data: dev_id[i],
          name: name[i]
        }
      })
    }

  }
  // console.log("tempArr--------->",tempArr)
 const dataset = {
  series: [
    {
      name: 'Actual',
      data: tempArr,
    }
  ],
  options: {
    title: {
      text: text === 'SAT' ? 'Supply Air Temperature' : text === 'RAT' ? 'Return Air Temperature' :  text == 'CSU_SAT_Duct_Temp'?'Duct Temperature': text == 'CSU_Duct_pre'? 'Duct Pressure': text == 'CSU_RAT'?'Return Air Temperature':'ChW Valve Position',
    },

    chart: {
      type: 'bar',
      height: 350,
      // events: {
      //   dataPointSelection: function (event, chartContext, config) {
      //     onclickchart(event, chartContext, config)
      //   }
      // },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '25%',
        endingShape: 'rounded'
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
    fill: {
      opacity: 1
    },
    colors: ['#00E396'],
      tooltip: {
        y: {
          formatter: function (val) {
            return val 
          }
        }
      },
      yaxis: {
        title: {
          text: text == 'ChW_Valve'? "%":text == 'CSU_Duct_pre'? "Pa":"℃",
        },
        decimalsInFloat: 2, 
          labels: {
            formatter: function (val) {
              return val; 
          },
        },
      },
  },
};

  return (
    <div>
      <GridContainer>
        <GridItem>
          <ReactApexCharts options={dataset.options} series={dataset.series} type="bar" height={'163vh'}/>
        </GridItem>
      </GridContainer>
    </div>
  )
}

export default DevicetrendChart