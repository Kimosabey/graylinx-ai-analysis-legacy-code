const logger = require('../../Config/logger');
const model = require('./ibms.analytics.model');
const { error } = require('winston');

const {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  getDay,
  format} = require('date-fns');

const _ = require('lodash');
const tablename = require('../Gl_analytics/Gl_analytics.service');
const { ta } = require('date-fns/locale');



const device_faults = (
  equipment_name,
  from_date,
  to_date,
  parameter_name,
  callback
) => {
  console.log('Received from_date:', from_date);
  console.log('Received to_date:', to_date);

  model.device_faults(equipment_name, (error, result) => {
    if (error) {
      callback(error);
      return;
    }

    if (!result || result.length === 0) {
      callback({ message: 'No Data Available', status: 200 });
      return;
    }

    let ids = [];
    let eq_names = [];
    let faults = [];
    let openfaults = 0;
    let closedfaults = 0;

    for (let i = 0; i < result.length; i++) {
      ids.push(result[i].id);
      eq_names.push(result[i].name);
    }
    console.log('IDs:', ids);
    console.log('Equipment Names:', eq_names);

    model.get_device_faults_data(
      ids,
      from_date,
      to_date,
      (error, faultData) => {
        if (error) {
          callback(error);
          return;
        }

        if (!faultData || faultData.length === 0) {
          console.log('Fault Data is either not defined or empty');
          callback(null, faults);
          return;
        }

        const nestedData = faultData[0];
        if (!nestedData || nestedData.length === 0) {
          console.log('Nested fault data is either not defined or empty');
          callback(null, faults);
          return;
        }
        for (let i = 0; i < ids.length; i++) {
          let count = 0;
          openfaults = 0;
          closedfaults = 0;

          for (let j = 0; j < nestedData.length; j++) {
            if (ids[i] === nestedData[j].ss_id) {
              count += 1;
              if (nestedData[j].restore == 0) {
                openfaults += 1;
              } else {
                closedfaults += 1;
              }
            }
          }
          if (parameter_name === 'faults') {
            faults.push({
              equipment_name: eq_names[i],
              ss_id: ids[i],
              no_of_faults: count
            });
          } else if (parameter_name === 'openfaults') {
            faults.push({
              equipment_name: eq_names[i],
              ss_id: ids[i],
              no_of_openfaults: openfaults
            });
          } else if (parameter_name === 'closedfaults') {
            faults.push({
              equipment_name: eq_names[i],
              ss_id: ids[i],
              no_of_closedfaults: closedfaults
            });
          }
        }

        callback(null, faults);
      }
    );
  });
};

const single_device_faults = (
  eq_name,
  from_date,
  to_date,
  device_name,
  callback
) => {
  model.device_faults(eq_name, (error, result) => {
    if (error) {
      callback(error);
      return;
    }

    if (!result || result.length === 0) {
      callback({ message: 'No Data Available', status: 404 });
      return;
    }

    let ids = [];
    let eq_names = [];
    let faults = [];
    let ss_id_of_device = null;

    for (let i = 0; i < result.length; i++) {
      ids.push(result[i].id);
      eq_names.push(result[i].name);
      if (result[i].name === device_name) {
        ss_id_of_device = result[i].id;
      }
    }

    if (!ss_id_of_device) {
      faults.push({
        equipment_name: device_name,
        message: 'Device not found'
      });
      callback(null, faults);
      return;
    }

    model.get_device_faults_data(
      ids,
      from_date,
      to_date,
      (error, faultData) => {
        if (error) {
          callback(error);
          return;
        }

        if (!faultData || faultData.length === 0) {
          console.log('Fault Data is either not defined or empty');
          callback(null, faults);
          return;
        }

        const nestedData = faultData[0];
        if (!nestedData || nestedData.length === 0) {
          console.log('Nested fault data is either not defined or empty');
          callback(null, faults);
          return;
        }

        let sat = 0,
          dsp = 0,
          zat = 0;
        let obj = {
          SAT: [{ count: 0, message: '' }],
          DSP: [{ count: 0, message: '' }],
          ZAT: [{ count: 0, message: '' }]
        };

        for (let j = 0; j < nestedData.length; j++) {
          if (ss_id_of_device === nestedData[j].ss_id) {
            if (nestedData[j].param_id === 'SAT') {
              sat += 1;
              obj['SAT'][0].count = sat;
              obj['SAT'][0].message = nestedData[j].message;
            } else if (nestedData[j].param_id === 'DSP') {
              dsp += 1;
              obj['DSP'][0].count = dsp;
              obj['DSP'][0].message = nestedData[j].message;
            } else if (nestedData[j].param_id === 'ZAT') {
              zat += 1;
              obj['ZAT'][0].count = zat;
              obj['ZAT'][0].message = nestedData[j].message;
            }
          }
        }

        faults.push({
          equipment_name: device_name,
          ss_id: ss_id_of_device,
          list_of_faults_per_device: obj
        });

        callback(null, faults);
      }
    );
  });
};

const benchmarking = (eq_name, device_name, callback) => {
  model.device_faults(eq_name, (error, result) => {
    if (error) {
      callback(error);
      return;
    }

    if (!result || result.length === 0) {
      callback({ message: 'No Data Available', status: 404 });
      return;
    }

    let ids = [];
    let eq_names = [];
    let ss_id_of_device = null;

    for (let i = 0; i < result.length; i++) {
      ids.push(result[i].id);
      eq_names.push(result[i].name);
      if (result[i].name === device_name) {
        ss_id_of_device = result[i].id;
      }
    }

    if (!ss_id_of_device) {
      callback(null, [
        {
          equipment_name: device_name,
          message: 'Device not found'
        }
      ]);
      return;
    }

    model.benchmarking(ids, (error, faultData) => {
      if (error) {
        callback(error);
        return;
      }

      if (!faultData || faultData.length === 0) {
        console.log('Fault Data is either not defined or empty');
        callback(null, [
          {
            equipment_name: device_name,
            ss_id: ss_id_of_device,
            current_month_average_of_days: []
          }
        ]);
        return;
      }

      const nestedData = faultData[0];
      if (!nestedData || nestedData.length === 0) {
        console.log('Nested fault data is either not defined or empty');
        callback(null, [
          {
            equipment_name: device_name,
            ss_id: ss_id_of_device,
            current_month_average_of_days: []
          }
        ]);
        return;
      }

      const currentMonthStart = startOfMonth(new Date());
      const currentMonthEnd = endOfMonth(new Date());

      // Filter faults for the current month
      const currentMonthFaults = nestedData.filter(fault => {
        const faultDate = new Date(fault.measured_time);
        return faultDate >= currentMonthStart && faultDate <= currentMonthEnd;
      });

      // Group faults by day of the week
      const faultsByDayOfWeek = _.groupBy(currentMonthFaults, fault =>
        getDay(new Date(fault.measured_time))
      );

      // Calculate average faults for each day of the week
      const averageFaults = {};
      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ];
      daysOfWeek.forEach((day, index) => {
        const dayFaults = faultsByDayOfWeek[index] || [];
        averageFaults[day.toLowerCase()] =
          dayFaults.length /
          eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd })
            .length;
      });

      const resultData = {
        equipment_name: device_name,
        ss_id: ss_id_of_device,
        current_month_average_of_days: averageFaults
      };

      callback(null, [resultData]);
    });
  });
};

const getEnergyConsumption = (
    eq_name,
    device_id,
    interval,
    start_time,
    end_time,
    callback
  ) => {
    model.device_faults(eq_name, (error, result) => {
      if (error) {
        return callback(error);
      }
      if (!result || result.length === 0) {
        return callback({ message: 'No Data Available', status: 200 });
      }

      let ids = result.map(item => item.id);
      let device_name = result[0].name;

      let dev_id = ids.find(id => id === device_id);
      if (!dev_id) {
        return callback({ message: 'Device ID not found', status: 404 });
      }

      tablename.getTableName(dev_id, (errorTbname, resTbName) => {
        if (errorTbname) {
          return callback(errorTbname);
        }

        model.getEnergyConsumption(
          dev_id,
          resTbName.permanent,
          interval,
          start_time,
          end_time,
          (error, data) => {
            if (error) {
              return callback(error);
            }

            const { result, startTimeSQL, endTimeSQL } = data;
            if (!Array.isArray(result)) {
              return callback({
                message: 'Unexpected data format',
                status: 500
              });
            }

            let formattedData;

            // Check if interval is a valid string before calling toLowerCase
            const lowerCaseInterval = typeof interval === 'string' ? interval.toLowerCase() : '';

            if (!lowerCaseInterval) {
              // Format data without interval logic
              formattedData = {
                eq_name: eq_name,
                device_name: device_name,
                id: dev_id,
                start_date: startTimeSQL,
                end_date: endTimeSQL,
                data: [
                    result
                ]
              };
            } else {
              // Aggregate data based on interval
              switch (lowerCaseInterval) {
                case 'day':
                  formattedData = aggregateDataByDay(result);
                  break;

                case 'week':
                  formattedData = aggregateDataByWeek(result);
                  break;

                case 'month':
                  formattedData = aggregateDataByMonth(result);
                  break;

                case 'year':
                  // console.log("jjjjjjjjjjjj",result)
                  formattedData = aggregateDataByYear(result);
                  break;

                default:
                  return callback({
                    message: 'Interval not supported',
                    status: 400
                  });
              }

              formattedData = {
                eq_name: eq_name,
                device_name: device_name,
                id: dev_id,
                start_date: startTimeSQL,
                end_date: endTimeSQL,
                data: formattedData
              };
            }

            callback(null, formattedData);
          }
        );
      });
    });
  };


function aggregateDataByDay(result) {
  const dailyData = result.map(row=>{
    console.log("roww",row)
    const { date, hour, runhour,energy,avg_energy } = row;
    return { date, hour, runhour,energy ,avg_energy};
  });
  return dailyData;
}

function aggregateDataByWeek(result) {
  const weeklydata = result.map(row=>{
    
    const { mydate,day_name, energy, avg_energy_of_week } = row;
    return { mydate,day_name, energy, avg_energy_of_week };
  });
  return weeklydata;
}


function aggregateDataByMonth(result) {
  const monthlyData = result.map(row => {
    console.log(row)
    const { date, month_name,energy,avg_energy_of_month } = row;
    return {  date, month_name,energy,avg_energy_of_month };
  });
  return monthlyData;
}


function aggregateDataByYear(result) {
  // console.log("kkkkkkkkkkk",result)
  const yearlyData = result.map(row => {
    console.log("roww",row)
    const { month_name,month,energy,avg_energy_of_month } = row;
    return { month_name,month,energy,avg_energy_of_month };
  });
  return yearlyData;
}

function arrangeDayData(result) {
  let formattedData = [];
  console.log("result",result)

  let avg_energy=[]
  

  result.forEach(item=>{
    avg_energy.push(item.avg_energy)
  })
  const uniqueValues = [...new Set(avg_energy)];
  console.log(uniqueValues);
  console.log("avg_energy",uniqueValues)


  result.forEach(item=>{

  })
  const groupedData = result.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});
  
  const dates = Object.keys(groupedData);
  
  
  for (let i = 1; i < dates.length; i++) {
    const previousDay = groupedData[dates[i - 1]];
    const currentDay = groupedData[dates[i]];
  
   
    const currentDayMap = new Map(currentDay.map(entry => [entry.hour, entry]));
  
  
    for (let j = 0; j < previousDay.length; j++) {
      const previousEntry = previousDay[j];
      const currentEntry = currentDayMap.get(previousEntry.hour) || {}; 
  
      formattedData.push({
        previous_date: previousEntry.date || null,
        current_date: currentEntry.date || null,
        previous_day_hour: previousEntry.hour || null,
        current_day_hour: currentEntry.hour || null,
        previous_day_energy: previousEntry.energy || null,
        current_day_energy: currentEntry.energy || null,
      });
    }
  }
  formattedData.push({
  "previous_day_avg":uniqueValues[0],
  "current_day_avg":uniqueValues[1]
  })

  return formattedData;
}

function arrangeWeekData(resultweek){
const previousWeekData = resultweek.slice(0, 7);
const currentWeekData = resultweek.slice(7);
const result = [];

console.log("resultweek",resultweek)
let avg_energy=[]
  

resultweek.forEach(item=>{
  avg_energy.push(item.avg_energy_of_week)
})
const uniqueValues = [...new Set(avg_energy)];
console.log(uniqueValues);
console.log("avg_energy",uniqueValues)

  
const previousWeekMap = new Map();
const currentWeekMap = new Map();

previousWeekData.forEach(item => previousWeekMap.set(item.day_name, item));
currentWeekData.forEach(item => currentWeekMap.set(item.day_name, item));

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

daysOfWeek.forEach(day => {
  const previousData = previousWeekMap.get(day) || { energy: 0 };
  const currentData = currentWeekMap.get(day) || { energy: 0 };
  
  const previousWeekEnergy = previousData.energy;
  const currentWeekEnergy = currentData.energy;
  
  result.push({
    previous_week_date: previousData.mydate || null,
    current_date: currentData.mydate || null,
    day_name: day,
    previous_week_energy: previousWeekEnergy,
    current_week_energy: currentWeekEnergy,
  });
});

result.push({
  "previous_week_avg":uniqueValues[0],
  "current_week_avg":uniqueValues[1]
})

return result;
}

// function arrangeMonthData(resultmonth){
//   return resultmonth
// }
function getMonthNames() {
  const currentDate = new Date();

  
  const currentMonthIndex = currentDate.getMonth();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });

  
  const previousMonthDate = new Date(currentDate.setMonth(currentMonthIndex - 1));
  const previousMonthName = previousMonthDate.toLocaleString('default', { month: 'long' });

  return { previousMonthName, currentMonthName };
}

function arrangeMonthData(resultmonth) {
  console.log("resultmonth",resultmonth)
  const { previousMonthName, currentMonthName } = getMonthNames();
  let lastMonthEntries = [];
  let currentMonthEntries = [];

  
  resultmonth.forEach(item => {
    
    console.log(`Processing date: ${item.date}, month: ${item.month_name}`);
    
    if (item.month_name === previousMonthName) { 
      lastMonthEntries.push({
        date: item.date,
        energy: item.energy,
      });
    } else if (item.month_name === currentMonthName) {
      currentMonthEntries.push({
        date: item.date,
        energy: item.energy,
      });
    }
  });
  let avg_energy=[]
  

  resultmonth.forEach(item=>{
    avg_energy.push(item.avg_energy_of_month)
  })
  const uniqueValues = [...new Set(avg_energy)];
  console.log(uniqueValues);
  console.log("avg_energy",uniqueValues)

const data = [];

const length = Math.max(lastMonthEntries.length, currentMonthEntries.length); 

for (let i = 0; i < length; i++) {
  const lastEntry = lastMonthEntries[i] || { date: null, energy: null, avg_energy_of_month: null };
  const currentEntry = currentMonthEntries[i] || { date: null, energy: null, avg_energy_of_month: null };

  data.push({
    "previous_month_date": lastEntry.date,
    "current_month_date": currentEntry.date,
    "previous_energy": lastEntry.energy,
    "current_energy": currentEntry.energy
  });
}

data.push({
  "previous_month_avg":uniqueValues[0],
  "current_month_avg":uniqueValues[0]
})

return data

}

function arrangeYearData(resultyear){
  console.log("resultyear",resultyear)

  let avg_energy=[]
  

  resultyear.forEach(item=>{
    avg_energy.push(item.avg_energy_of_month)
  })
  
  let prev_avg=avg_energy.slice(0,12)
  let curent_avg=avg_energy.slice(12)
  let avg1=0.0
  let avg2=0.0
  let sum1=0
  let sum2=0
  let c1=0
  let c2=0

  prev_avg.forEach(item=>{
    sum1+=item
      c1+=1
  })

  curent_avg.forEach(item=>{
    sum2+=item
    c2+=1
  })
  avg1=sum1/c1
  avg2=sum2/c2

  console.log("avg_energy-->",avg_energy)

  const dataMap = new Map();
  resultyear.forEach(item => {
      const year = item.month.split('-')[0]; 
      const month = item.month_name;
      
      if (!dataMap.has(month)) {
        dataMap.set(month, {});
      }
    
      dataMap.get(month)[year] = {
        date: item.month,
        energy: item.energy,
        avg_energy_of_month: item.avg_energy_of_month
      };
    });

    const result = [];


    dataMap.forEach((value, key) => {
      const lastYear = value['2023'] || {};
      const currentYear = value['2024'] || {};

      result.push({
        month_name: key,
        last_year_date: lastYear.date || null,
        current_year_date: currentYear.date || null,
        last_year_energy: lastYear.energy || null,
        current_year_energy: currentYear.energy || null,
        last_year_avg: lastYear.avg_energy_of_month || null,
        current_year_avg: currentYear.avg_energy_of_month || null
      });
    });

    result.push({
      "previous_year_avg":avg1,
      "current_year_avg":avg2
    })
  return result
}

const getEnergy = (equipment_type, device_id, interval, callback) => {
  model.device_faults(equipment_type, (error, result) => {
    if (error) {
      return callback(error);
    }
    if (!result || result.length === 0) {
      return callback({ message: 'No Data Available', status: 200 });
    }

    let ids = result.map(item => item.id);
    // let device_name = result[0].name;

    let dev_id = ids.find(id => id === device_id);
    if (!dev_id) {
      return callback({ message: 'Device ID not found', status: 200 });
    }
    tablename.getTableName(dev_id, (errorTbname, resTbname) => {
      if (errorTbname) {
        return callback(null, errorTbname);
      } else {
        model.getEnergy(
          device_id,
          resTbname.permanent,
          interval,
          (error, data) => {
            if (error) {
              return callback(error);
            }

          const { result, startTimeSQL, endTimeSQL } = data;
          if (!Array.isArray(result)) {
            return callback({
              message: 'Unexpected data format',
              status: 500
            });
          }
           
          const lowerCaseInterval = typeof interval === 'string' ? interval.toLowerCase() : '';

          if (!lowerCaseInterval) {
            formattedData = {
              eq_name: equipment_type,
              device_id: device_id,
              start_date: startTimeSQL,
              end_date: endTimeSQL,
              data: [
                  result
              ]
            };
          } else {
            
            switch (lowerCaseInterval) {
              case 'day':
                formattedData = arrangeDayData(result);
                break;

              case 'week':
                formattedData = arrangeWeekData(result);
                break;

              case 'month':
                formattedData = arrangeMonthData(result);
                break;

              case 'year':
                formattedData = arrangeYearData(result);
                break;

              default:
                return callback({
                  message: 'Interval not supported',
                  status: 400
                });
            }

            formattedData = {
              eq_name: equipment_type,
              device_id: device_id,
              start_date: startTimeSQL,
              end_date: endTimeSQL,
              data: formattedData
            };
          }

          callback(null, formattedData);
          }
        );
      }
    });
  });
};

const getEnergyTemperature = (
  equipment_type,
  device_id,
  interval,
  start_time,
  end_time,
  callback
) => {
  getEnergyConsumption(equipment_type, device_id, interval, start_time, end_time, (error, energyData) => {
    if (error) {
      return callback(error);
    }
    console.log("energyData",energyData)
    model.getTemperature((error, temperatureData) => {
      if (error) {
        return callback(error);
      }
      const mergedData = energyData["data"].map(energyEntry => {
        const matchingTempEntry = temperatureData["result"].find(tempEntry => 
          tempEntry.date === energyEntry.date && tempEntry.hour === energyEntry.hour
        );
        
        return {
          ...energyEntry,
          temperature: matchingTempEntry ? matchingTempEntry.temperature : null 
        };
      });

      callback(null, {EnergyTempdata:{
        eq_name:energyData['eq_name'],
        device_name:energyData['device_name'],
        id:energyData['id'],
        start_date:energyData['start_date'],
        end_data:energyData['end_date'],
        data: mergedData 
      }})
        ;
    });
  });
};

const getRunhour = (
  device_id,
  interval,
  start_time,
  end_time,
  callback
) => {

    tablename.getTableNameMetric(device_id, (errorTbname, resTbName) => {
      if (errorTbname) {
        return callback(errorTbname);
      }

      model.getRunhour(
        device_id,
        resTbName.permanent,
        interval,
        start_time,
        end_time,
        (error, data) => {
          if (error) {
            return callback(error);
          }

          const { result, startTimeSQL, endTimeSQL } = data;
          if (!Array.isArray(result)) {
            return callback({
              message: 'Unexpected data format',
              status: 500
            });
          }

          let formattedData;

          // Check if interval is a valid string before calling toLowerCase
          const lowerCaseInterval = typeof interval === 'string' ? interval.toLowerCase() : '';
          // console.log("eq_name",eq_name)

          if (!lowerCaseInterval) {
            // Format data without interval logic
            formattedData = {
              id: dev_id,
              start_date: startTimeSQL,
              end_date: endTimeSQL,
              data: [
                  result
              ]
            };
          } else {
            // Aggregate data based on interval
            switch (lowerCaseInterval) {
              case 'day':
                formattedData = aggregateDataByDay(result);
                break;

              case 'week':
                formattedData = aggregateDataByWeek(result);
                break;

              case 'month':
                formattedData = aggregateDataByMonth(result);
                break;

              case 'year':
                // console.log("jjjjjjjjjjjj",result)
                formattedData = aggregateDataByYear(result);
                break;

              default:
                return callback({
                  message: 'Interval not supported',
                  status: 400
                });
            }

            formattedData = {
              id: device_id,
              start_date: startTimeSQL,
              end_date: endTimeSQL,
              data: formattedData
            };
          }

          callback(null, formattedData);
        }
      );
    });
};

const getfloorzoneEnergydata = (equipment_type, device_id, interval, start_time, end_time, callback) => {
  let deviceIds = [];
  let tableNames = [];

  model.getSubordinates(device_id, (err, result) => {
    if (err) {
      return callback(err);
    }

    if (!result || result.length === 0) {
      return callback({ message: 'No Data Available', status: 200 });
    }

    let zone_ids = result.map(item => item.id);
    console.log("zone_ids...", zone_ids);

    model.getDeviceIds(zone_ids, (err, deviceids) => {
      if (err) {
        return callback(err);
      }

      if (!deviceids || deviceids.length === 0) {
        return callback({ message: 'No Data Available', status: 200 });
      }

      deviceIds = deviceids.map(item => item.ss_id);

      const tablePromises = deviceIds.map(item => {
        return new Promise((resolve, reject) => {
          tablename.newgetTableName(item, equipment_type, (error, tblname) => {
            if (error) {
              return reject(error);
            }
            if (tblname === undefined) {
              return resolve();
            } else {
              tableNames.push({ permanent: tblname.permanent, ss_id: tblname.ss_id });
              resolve();
            }
          });
        });
      });

      Promise.all(tablePromises)
        .then(() => {
          const uniqueTableNames = Array.from(
            new Map(tableNames.map(item => [`${item.permanent}-${item.ss_id}`, item])).values()
          );

          if (uniqueTableNames.length === 0) {
            return callback(null, { totalEnergy: 0 });
          }

          const energyPromises = uniqueTableNames.map(item => {
            return new Promise((resolve, reject) => {
              model.getEnergyConsumption(item.ss_id, item.permanent, interval, start_time, end_time, (err, data) => {
                if (err) {
                  return reject(err);
                }
                console.log("dtatatatattataa",data)
                const totalEnergy = data.result ? data.result.reduce((sum, entry) => sum + (entry.energy || 0), 0) : 0;
                resolve(totalEnergy);
              });
            });
          });

          Promise.all(energyPromises)
            .then(energies => {
              const totalEnergy = energies.reduce((sum, energy) => sum + energy, 0);
              callback(null, { totalEnergy });
            })
            .catch(err => {
              callback(err);
            });
        })
        .catch(err => {
          callback(err);
        });
    });
  });
};





module.exports = {
  device_faults,
  single_device_faults,
  benchmarking,
  getEnergyConsumption,
  getEnergy,
  getEnergyTemperature,
  getRunhour,
  getfloorzoneEnergydata
};
