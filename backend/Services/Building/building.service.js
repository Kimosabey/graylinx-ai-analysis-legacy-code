const _ = require('lodash');
const uuid = require('uuid/v4');
const model = require('./building.model');
const logger = require('../../Config/logger');
const { toFixed } = require('../../Utils/common');

const createBuilding = (building, callback) => {
  const payload = {
    id: uuid(),
    name: building.name,
    campus_id: building.campus.id
  };
  model.createBuilding(payload, (error, result) => {
    if (error) {
      logger.info(JSON.stringify(error));
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const lights = (buildingId, callback) => {
  model.lights(buildingId, (error, result) => {
    if (error) {
      callback(error);
    } else {
      const removeDuplicates = (myArr, prop) => {
        return myArr.filter((obj, pos, arr) => {
          return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
      };
      // const results = removeDuplicates(result, 'mac');
      console.log("---------------------",result.length)
      const masters = result
        .filter(each => each.type === 'dali_master')
        .map(each => ({
          mac: each.mac,
          name: each.name,
          zoneId: each.zone_id,
          zoneName: each.zone_name,
          areaId: each.area_id,
          areaName: each.area_name,
          floorName: each.floor_name,
          floorId: each.floor_id
        }));
      const analog_controllers = result
        .filter(each => each.type === 'analog_controller')
        .map(each => ({
          mac: each.mac,
          name: each.name,
          deviceInfo: JSON.parse(each.device_info),
          zoneId: each.zone_id,
          zoneName: each.zone_name,
          areaId: each.area_id,
          areaName: each.area_name,
          floorName: each.floor_name,
          floorId: each.floor_id,
          data:JSON.parse(each.data)
        }));
      const slaves = result
        .filter(each => each.type === 'dali_slave')
        .map(each => ({
          slaveNumber: parseInt(each.mac.slice(-2), 16),
          mac: each.mac,
          name: each.name,
          zoneId: each.zone_id,
          zoneName: each.zone_name,
          areaId: each.area_id,
          areaName: each.area_name,
          floorName: each.floor_name,
          status: "Auto"==JSON.parse(each.data).mode? "Auto" : JSON.parse(each.data).light_level==0?"Off":JSON.parse(each.data).light_level>0?"On":"Auto",
          light_level:JSON.parse(each.data).light_level
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

      analog_controllers.forEach(ac => {
        let channel=[]
        let c1=ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable'
        let c2=ac.deviceInfo.channel2=='dimmable' || ac.deviceInfo.channel2=='non-dimmable'
        console.log("c1====",c1)
        console.log("c2=======",c2)
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
        ): ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable' ?channel.push(
          {
            "name": "Channel 1",
            "dimmable": ac.deviceInfo.channel1=='dimmable',
            "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
            "light_level":ac.data.channel1level
          }
        ):channel.push(
          {
            "name": "Channel 2",
            "dimmable": ac.deviceInfo.channel2=='dimmable',
            "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
            "light_level":ac.data.channel1level
          })
        dali.push({
          master: {
            mac: ac.mac,
            name: ac.name,
            deviceType: ac.type,
            zoneId: ac.zoneId,
            zoneName: ac.zoneName,
            areaId: ac.areaId,
            areaName: ac.areaName,
            floorName: ac.floorName,
            floorId: ac.floorId
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
      })
      callback(null, {lights: dali});
    }
  });
};

const devicesList = (buildingId, callback) => {
  model.deviceList(buildingId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, {devices: results});
    }
  });
};

const luxSummary = (buildingId, callback) => {
  model.luxSummary(buildingId, (error, response) => {
    if (error) {
      callback(error);
    } else {
      const floorLux = _.chain(response)
        .groupBy('floor_id')
        .toPairs()
        .map(item => _.zipObject(['floor_id', 'data'], item))
        .value();
      const formatedLux = floorLux.map(res => {
        const { data } = res;
        const min = _.minBy(data, resp => {
          const data1 = resp.data;
          const parsedData = JSON.parse(data1);
          return parsedData.luminousity.value;
        }).data;
        const max = _.maxBy(data, resp => {
          const data2 = resp.data;
          const parsedData = JSON.parse(data2);
          return parsedData.luminousity.value;
        }).data;
        return {
          floor_id: res.floor_id,
          floor_name: data[0].floor_name,
          luxMin: JSON.parse(min).luminousity.value,
          luxMax: JSON.parse(max).luminousity.value,
          luxAvg: _.meanBy(
            data,
            resp => JSON.parse(resp.data).luminousity.value
          )
        };
      });
      callback(null, formatedLux);
    }
  });
};

const summaryParameter = (buildingId, callback) => {
  model.summaryParameter(buildingId, (error, response) => {
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
      callback(null, [
        {
          name: 'Temperature',
          value: toFixed(temperature)
        },
        {
          name: 'Humidity',
          value: toFixed(humidity)
        },
        {
          name: 'Lux',
          value: luminousity
        }
      ]);
    }
  });
};

const editBuildingName = (building, callback) => {
  model.editBuildingName(building, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const deleteBuilding = (buildingId, callback) => {
  model.deleteBuilding(buildingId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  lights,
  luxSummary,
  devicesList,
  deleteBuilding,
  createBuilding,
  summaryParameter,
  editBuildingName
};
