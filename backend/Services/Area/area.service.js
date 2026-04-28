const uuid = require('uuid/v4');
const _ = require('lodash');
const model = require('./area.modal');
const { response } = require('express');


const createarea = (area, callback) => {
    console.log(area)
    const payload = {
      id: uuid(),
      name: area.name,
      zone_id: area.zone.id
    };
    model.createarea(payload, (error, result) => {
      if (error) {
        callback(error);
      } else {
        callback(null, result);
      }
    });
  };

  const editAreaName = (area, callback) => {
    model.editAreaName(area, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  };
  
  const deleteAreaName = (areaId, callback) => {
    model.deleteAreaName(areaId, (err, result) => {
      if (err) {
        callback(err);
      } else {
        callback(null, result);
      }
    });
  };
  const lights = (areaId, callback) => {
    model.lights(areaId, (error, result) => {
      if (error) {
        callback(error);
      } else {
        const removeDuplicates = (myArr, prop) => {
          return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
          });
        };
        // const results = removeDuplicates(result, 'mac');
        const masters = result
          .filter(each => each.type === 'dali_master')
          .map(each => ({
            mac: each.mac,
            name: each.name,
            areaId:each.area_id,
            areaName:each.area_name,
            zoneId: each.zone_id,
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
            zoneId: each.zone_id,
            zoneName: each.zone_name,
            areaId:each.area_id,
            areaName:each.area_name,
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
            zoneId: each.zone_id,
            zoneName: each.zone_name,
            areaId:each.area_id,
            areaName:each.area_name,
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
          console.log("acccccccccccccccccccccc",ac,index)
         let channel=[]
         let c1=ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable'
         let c2=ac.deviceInfo.channel2=='dimmable' || ac.deviceInfo.channel2=='non-dimmable'
        //  let c3=ac.deviceInfo.channel3=='dimmable' || ac.deviceInfo.channel3=='non-dimmable'
        //  let c4=ac.deviceInfo.channel4=='dimmable' || ac.deviceInfo.channel4=='non-dimmable'
         // console.log("c1====",c1)
         // console.log("c2=======",c2)
        //  c1 && c2 && c3 && c4 ?channel.push(
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
          //    "name": "Channel 3",
          //    "dimmable": ac.deviceInfo.channel3=='dimmable',
          //    "status":ac.data.channel3mode=="Auto"?"Auto":ac.data.channel3level==0?"Off":ac.data.channel3level>0?"On":"Auto",
          //    "light_level":ac.data.channel3level
          //  },{
          //    "name": "Channel 4",
          //    "dimmable": ac.deviceInfo.channel4=='dimmable',
          //    "status":ac.data.channel4mode=="Auto"?"Auto":ac.data.channel4level==0?"Off":ac.data.channel4level>0?"On":"Auto",
          //    "light_level":ac.data.channel4level
          //  }
           ): ac.deviceInfo.channel1=='dimmable' || ac.deviceInfo.channel1=='non-dimmable' ?channel.push(
            {
              "name": "Channel 1",
              "dimmable": ac.deviceInfo.channel1=='dimmable',
              "status":ac.data.channel1mode=="Auto"?"Auto":ac.data.channel1level==0?"Off":ac.data.channel1level>0?"On":"Auto",
              "light_level":ac.data.channel1level
            }
          ):
          //  ac.deviceInfo.channel2=='dimmable' || ac.deviceInfo.channel2=='non-dimmable' ?
          channel.push(
            {
              "name": "Channel 2",
              "dimmable": ac.deviceInfo.channel2=='dimmable',
              "status":ac.data.channel2mode=="Auto"?"Auto":ac.data.channel2level==0?"Off":ac.data.channel2level>0?"On":"Auto",
              "light_level":ac.data.channel2level
            }  
         )
        //  : ac.deviceInfo.channel3=='dimmable' || ac.deviceInfo.channel3=='non-dimmable' ?channel.push(
        //    {
        //      "name": "Channel 3",
        //      "dimmable": ac.deviceInfo.channel3=='dimmable',
        //      "status":ac.data.channel3mode=="Auto"?"Auto":ac.data.channel3level==0?"Off":ac.data.channel3level>0?"On":"Auto",
        //      "light_level":ac.data.channel3level
        //    }
        //  ):ac.deviceInfo.channel4=='dimmable' || ac.deviceInfo.channel4=='non-dimmable' ?channel.push(
        //    {
        //      "name": "Channel 4",
        //      "dimmable": ac.deviceInfo.channel4=='dimmable',
        //      "status":ac.data.channel4mode=="Auto"?"Auto":ac.data.channel4level==0?"Off":ac.data.channel4level>0?"On":"Auto",
        //      "light_level":ac.data.channel4level
        //    }):[]
         dali.push({
           master: {
             mac: ac.mac,
             name: ac.name,
             deviceType: ac.type,
             zoneId: ac.zoneId,
             zoneName: ac.zoneName,
             areaName:ac.areaName,
             areaId:ac.areaId,
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
        const response=[]
        dali.forEach(Element=>{
          if(Element.deviceType==="DALI_CONTROLLER"){
              if(Element.slaves.length>0){
                response.push(Element)
              }
          }else{
            response.push(Element)
          }
        })

        callback(null, {lights: response});
      }
    });
  };


  module.exports={
        createarea,
        editAreaName,
        deleteAreaName,
        lights
  }
  