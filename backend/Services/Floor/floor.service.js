const { isNull, sumBy } = require('lodash');
const _ = require('lodash');
const uuid = require('uuid/v4');

const { toFixed } = require('../../Utils/common');
const model = require('./floor.model');

const createFloor = (floor, callback) => {
  const payload = {
    id: uuid(),
    name: floor.name,
    type: floor.type ? floor.type : null,
    floor_number: floor.floor_number !== undefined ? floor.floor_number : null,
    building_id: floor.building.id
  };
  model.createFloor(payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const floorStats = (floorId, callback) => {
  model.floorStats(floorId, (error, stats) => {
    if (error) {
      callback(error);
    } else {
      if(stats.length>0){
      const dataValue = _.chain(stats)
        .groupBy('zone_id')
        .toPairs()
        .map(res => _.zipObject(['zone_id', 'data'], res))
        .value();
      let formatStats = {};
      try {
        formatStats = {
          floor_name: _.first(stats).floor_name || null,
          floor_id: _.first(stats).floor_id,
          zones: dataValue.map(element => {
            return {
              zone_id: element.zone_id,
              zone_name: element.data[0].zone_name,
              devices: element.data
                .filter(res => {
                  if (res.x !== null) {
                    return true;
                  }
                  return false;
                })
                .map(ress => ({
                  device_id: ress.device_id,
                  device_name: ress.device_name,
                  device_type: ress.type,
                  coordinates: {
                    x: ress.x,
                    y: ress.y
                  },
                  data: JSON.parse(ress.data)
                }))
            };
          })
        };
      } catch (error1) {} 
      formatStats.zones.forEach(element => {
           element.devices.forEach(each=>{
           })
      });
      callback(null, formatStats);
      } else {
        callback(null,"No devices found")
      }
    }
  });
};

const luxSummary = (floorId, callback) => {
  model.luxSummary(floorId, (error, response) => {
    if (error) {
      callback(error);
    } else {
      const zoneLux = _.chain(response)
        .groupBy('zone_id')
        .toPairs()
        .map(item => _.zipObject(['zone_id', 'data'], item))
        .value();
      const formatedLux = zoneLux.map(res => {
        const { data } = res;
        const min = _.minBy(data, resp => {
          const data1 = resp.data;
          const parsedData = JSON.parse(data1);
          try {
            return parsedData.luminousity.value;
          } catch (error1) {
            return 0;
          }
        }).data;
        const max = _.maxBy(data, resp => {
          const data2 = resp.data;
          const parsedData = JSON.parse(data2);
          try {
            return parsedData.luminousity.value;
          } catch (error1) {
            return 0;
          }
        }).data;
        return {
          zone_id: res.zone_id,
          zone_name: data[0].zone_name,
          luxMin: JSON.parse(min).luminousity.value,
          luxMax: JSON.parse(max).luminousity.value,
          luxAvg: _.meanBy(
            data,
            resp => JSON.parse(resp.data).luminousity.value
          )
        };
      });
      callback(null, { lux: formatedLux });
    }
  });
};

const summaryParameters = (floorId, callback) => {
  model.summaryParameters(floorId, (error, response) => {
    if (error) {
      callback(error);
    } else {
      const THL = response.filter(res => res.device_type === 'thl_sensor');
      const temperature = _.meanBy(THL, res => {
        const { data } = res;
        const parsedData = JSON.parse(data);
        return parsedData.temperature.value;
      });
      const humidity = _.meanBy(THL, res => {
        const { data } = res;
        const parsedData = JSON.parse(data);
        return parsedData.humidity.value;
      });
      const luminousity = _.meanBy(THL, res => {
        const { data } = res;
        const parsedData = JSON.parse(data);
        return parsedData.luminousity.value;
      });
      callback(null, { summary : [
        {
          name: 'Temperature',
          // value: toFixed(temperature)
          value: temperature
        },
        {
          name: 'Humidity',
          // value: toFixed(humidity)
          value: humidity
        },
        {
          name: 'Lux',
          value: luminousity
        }
      ]});
    }
  });
};

const getFloors = callback => {
  model.getFloors((error, results) => {
    if (error) {
      callback(error);
    } else {
      callback(null, results);
    }
  });
};

const editFloorName = (floor, callback) => {
  model.editFloorName(floor, err => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

const deleteFloor = (floorId, callback) => {
  model.deleteFloor(floorId, err => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

const lights = (floorId, callback) => {

  model.occupancy(floorId,(err,occresult)=>{
      if(err){
        callback(err)
      }else{
       const removeDuplicates = (myArr, prop) => {
        return myArr.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
      };
      let zones=removeDuplicates(occresult,'zoneId')
      let finaldata=[]
      zones.forEach(element=>{
        res={}
        res["zone"]=element.zoneId
        resultarr=[]
        occresult.forEach(element2=>{
          if(element.zoneId===element2.zoneId){
             resultarr.push(isNull(element2.occupancy)?0:parseInt(element2.occupancy))
          }
        })
        res["data"]=resultarr.reduce((partialSum, a) => partialSum + a, 0);
        finaldata.push(res)
      })
      
        model.lights(floorId, (error, result) => {
          if (error) {
            callback(error);
          } else {        
            // const results = removeDuplicates(result, 'mac');
            // record["area_id"]=each.area_id
            // record["area_name"]=each.areaName
            // record["zone_id"]=each.zoneId
            // record["zone_name"]=each.zone_name
            const masters = result
              .filter(each => each.type === 'dali_master')
              .map(each => ({
                mac: each.mac,
                name: each.name,
                zoneId: each.zone_id,
                areaId:each.area_id,
                areaName:each.area_name,
                zoneName: each.zone_name,
                floorName: each.floor_name,
                floorId: each.floor_id
              }));
            const analog_controllers = result
              .filter(each => each.type === 'analog_controller')
              .map(each => ({
                mac: each.mac,
                name: each.name,
                deviceInfo: JSON.parse(each.device_info),
                areaId:each.area_id,
                areaName:each.area_name,
                zoneId: each.zone_id,
                zoneName: each.zone_name,
                floorName: each.floor_name,
                floorId: each.floor_id,
                data:JSON.parse(each.data),
                cmd:JSON.parse(each.data).lastCmdFrom,
                created_at:each.created_at
              }));
            const slaves = result
              .filter(each => each.type === 'dali_slave')
              .map(each => ({
                slaveNumber: parseInt(each.mac.slice(-2), 16),
                mac: each.mac,
                name: each.name,
                areaId:each.area_id,
                areaName:each.area_name,
                zoneId: each.zone_id,
                zoneName: each.zone_name,
                floorName: each.floor_name,
                status: "Auto"==JSON.parse(each.data).mode? "Auto" : JSON.parse(each.data).light_level==0?"Off":JSON.parse(each.data).light_level>0?"On":"Auto",
                light_level:JSON.parse(each.data).light_level,
                cmd_data:JSON.parse(each.data).lastCmdFrom,
                created_at:each.created_at
              }));
            const dali = [];
            masters.forEach(m => {
              let slave = [];
              slaves.forEach(s => {
                if (m.mac.slice(-4) === s.mac.slice(-6, -2)) {
                  slave.push(s);
                }
              });
              dali.push({
                master: m,
                deviceType: "DALI_CONTROLLER",
                slaves: _.sortBy(slave, o => {
                  return o.user;
                })
              });
            });
      
            analog_controllers.forEach((ac,index) => {
              // console.log("acccccccccccccccccccccc",ac,index)
              let channel=[]
              let c1=ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable'
              let c2=ac.deviceInfo.channel2=='dimmable' || ac.deviceInfo.channel2=='non-dimmable'
              // let c3=ac.deviceInfo.channel3=='dimmable' || ac.deviceInfo.channel3=='non-dimmable'
              // let c4=ac.deviceInfo.channel4=='dimmable' || ac.deviceInfo.channel4=='non-dimmable'
              // console.log("c1====",c1)
              // console.log("c2=======",c2)
              // c1 && c2 && c3 && c4 ?channel.push(
              c1 && c2 ?channel.push(
                {
                  "name": "Channel 1",
                  "dimmable": ac.deviceInfo.channel1=='dimmable',
                  "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
                  "light_level":ac.data.channel1level
                },{
                  "name": "Channel 2",
                  "dimmable": ac.deviceInfo.channel2=='dimmable',
                  "status":ac.data.channel2mode=="Auto"?"Auto":ac.data.channel2level==0?"Off":ac.data.channel2level>0?"On":"Auto",
                  "light_level":ac.data.channel2level
                }
                // ,{
                //   "name": "Channel 3",
                //   "dimmable": ac.deviceInfo.channel3=='dimmable',
                //   "status":ac.data.channel3mode=="Auto"?"Auto":ac.data.channel3level==0?"Off":ac.data.channel3level>0?"On":"Auto",
                //   "light_level":ac.data.channel3level
                // },{
                //   "name": "Channel 4",
                //   "dimmable": ac.deviceInfo.channel4=='dimmable',
                //   "status":ac.data.channel4mode=="Auto"?"Auto":ac.data.channel4level==0?"Off":ac.data.channel4level>0?"On":"Auto",
                //   "light_level":ac.data.channel4level
                // }
              ): ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable' ?channel.push(
                {
                  "name": "Channel 1",
                  "dimmable": ac.deviceInfo.channel1=='dimmable',
                  "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
                  "light_level":ac.data.channel1level
                }
              ): 
              // ac.deviceInfo.channel2=='dimmable' || ac.deviceInfo.channel2=='non-dimmable' ?
              channel.push(
                {
                  "name": "Channel 2",
                  "dimmable": ac.deviceInfo.channel2=='dimmable',
                  "status":ac.data.channel2mode=="Auto"?"Auto":ac.data.channel2level==0?"Off":ac.data.channel2level>0?"On":"Auto",
                  "light_level":ac.data.channel2level
                }   
              )
              // : ac.deviceInfo.channel3=='dimmable' || ac.deviceInfo.channel3=='non-dimmable' ?channel.push(
              //   {
              //     "name": "Channel 3",
              //     "dimmable": ac.deviceInfo.channel3=='dimmable',
              //     "status":ac.data.channel3mode=="Auto"?"Auto":ac.data.channel3level==0?"Off":ac.data.channel3level>0?"On":"Auto",
              //     "light_level":ac.data.channel3level
              //   }
              // ):ac.deviceInfo.channel4=='dimmable' || ac.deviceInfo.channel4=='non-dimmable' ?channel.push(
              //   {
              //     "name": "Channel 4",
              //     "dimmable": ac.deviceInfo.channel4=='dimmable',
              //     "status":ac.data.channel4mode=="Auto"?"Auto":ac.data.channel4level==0?"Off":ac.data.channel4level>0?"On":"Auto",
              //     "light_level":ac.data.channel4level
              //   })
              // :[]
              dali.push({
                master: {
                  mac: ac.mac,
                  name: ac.name,
                  deviceType: ac.type,
                  areaName:ac.areaId,
                  areaId:ac.areaName,
                  zoneId: ac.zoneId,
                  zoneName: ac.zoneName,
                  floorName: ac.floorName,
                  floorId: ac.floorId,
                  cmd:ac.cmd,
                  created_at:ac.created_at
                },
                deviceType: "ANALOG_CONTROLLER",
                channels:channel
                // channels: [
                //   {
                //     "name": "Channel 1",
                //     "dimmable": ac.deviceInfo.channel1=='dimmable',
                //     "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
                //     "light_level":ac.data.channel1level
                //   },{
                //     "name": "Channel 2",
                //     "dimmable": ac.deviceInfo.channel2=='dimmable',
                //     "status":ac.data.channel2mode=="Auto"?"Auto":ac.data.channel2level==0?"Off":ac.data.channel2level>0?"On":"Auto",
                //     "light_level":ac.data.channel2level
                //   }
                // ]
              });
              // console.log("channelsssssssssssss",channel)
            })
            callback(null, {lights: dali,occupancy:finaldata});
          }
        });
      }

  

  })
 
};


module.exports = {
  createFloor,
  floorStats,
  editFloorName,
  deleteFloor,
  summaryParameters,
  luxSummary,
  getFloors,
  lights
};
