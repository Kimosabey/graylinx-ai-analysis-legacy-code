const _ = require('lodash');
const model = require('./alert.model');

const alerts = (campusId, callback) => {
  model.deviceAlerts(campusId, (err1, alert) => {
    if (err1) {
      callback(err1);
    } else {
      model.deviceBatteryAlerts(campusId, (err2, results) => {
        console.log("results",results)
        if (err2) {
          callback(err2);
        } else {
          model.gatewayAlerts((err3, response) => {
            if (err3) {
              callback(err3);
            } else {
              const deviceAlerts = alert.map(_alert => 
                _alert.priority = _alert.device_type.includes("controller") ? "Medium" : "Low"
                )
              const batteryStatus = results
                .filter(
                  each =>
                    each.device_type === 'thl_sensor' ||
                    each.device_type === 'occupancy_sensor'
                )
                .filter(each => {
                  let battery = null;
                  try {
                    battery = JSON.parse(each.data).battery;
                    console.log("battteryyyyyyyyyyy",battery)
                  } catch (error) {}
                  // return (battery < 30 && battery !== null)
                  return (battery < 30 && battery !== null)
                  // if (battery < 30 && battery !== null) {
                  //   return true;
                  // } else {
                  //   return false;
                  // }
                })
                .map(each => ({
                  device_name: each.device_name,
                  device_type: each.device_type,
                  zone_name: each.zone_name,
                  floor_name: each.floor_name,
                  building_name: each.building_name,
                  device_address: each.device_address,
                  created_at: each.created_at,
                  priority: "Low",
                  battery: JSON.parse(each.data).battery 
                }));
                results.map((each)=>{
                  if(JSON.parse(each.data).battery<30){
                    batteryStatus.push({
                      device_name: each.device_name,
                      device_type: each.device_type,
                      zone_name: each.zone_name,
                      floor_name: each.floor_name,
                      building_name: each.building_name,
                      device_address: each.device_address,
                      created_at: each.created_at,
                      priority: "Low",
                      battery: JSON.parse(each.data).battery
                    })
                  }
                })
              // const totalCount = deviceAlerts.length + batteryStatus.length;
              const totalCount = batteryStatus.length;
              console.log("battery statussssssssssssss",batteryStatus)
              console.log("resultsssssssssssssss",results)
              // const totalCount =  batteryStatus.length;
              if (response.length > 0) {
                response.forEach(host => {
                  if(host.status === 0 ){
                    alert.push({
                      device_name: host.device_name,
                      zone_name: host.zone_name ? host.zone_name : '-',
                      floor_name: host.floor_name ? host.floor_name : '-',
                      building_name: host.building_name ? host.building_name : '-',
                      status: host.status,
                      priority: "High",
                      device_type: 'Gateway'
                    });
                  }
                });
              }
              setTimeout(() => {
                callback(null, {
                  total_count: totalCount,
                  // alerts: alert,
                  batteryStatus
                });
              }, 1000);
            }
          });
        }
      });
    }
  });
};

module.exports = {
  alerts
};
