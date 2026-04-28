const _ = require('lodash');
const uuid = require('uuid/v4');
const moment = require('moment');
const model = require('./schedule.model');
const { response } = require('express');

const createSchedule = (data, user, callback) => {
  const id = uuid();
  const schedule = {
    id,
    name: data.title,
    data: JSON.stringify({
      zones: data.zones,
      action: data.action,
      intensity: data.intensity
    }),
    floor_id: data.floor.id,
    floor_name: data.floor.name,
    start: moment(data.start, 'YYYY-MM-DD HH:mm:ss')
      .add(1, 'm')
      .format('YYYY-MM-DD HH:mm:ss'),
    end: data.end
  };
  model.checkZoneScheduleExists(moment(data.start, 'YYYY-MM-DD HH:mm:ss').add(1, 'm').format('YYYY-MM-DD HH:mm:ss'),moment(data.end, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    (err, resp) => {
      if (err) {
        console.log(err)
        callback({ message: "Conflict in schedule!", code: 500});
        callback(err);
      } else {
        const zonesList = data.zones.map(item => item.id);
        let intersection = [];
        if (resp.length > 0) {
          intersection = _.intersection(
            zonesList,
            JSON.parse(resp[0].zone_id || [])
          );
        }
        if (intersection.length === 0) {
          model.createSchedule(schedule, user, (error, result) => {
            if (error) {
              console.log(error)
              callback(error);
            } else {
              callback(null, { message: "Successfully created", code: 200, id});
            }
          });
        } else {
          callback({ message: 'Confict in Schedule', code: 200});
        }
      }
    }
  );
};

const removeDuplicates = (myArr, prop) => {
  console.log("my arrrrrrr",myArr)
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
};

const schedulesList = (floor_id,zone_id,callback) => {
  // console.log("floor_iddddddddddddddddddd",floor_id)
  // console.log("zone_idddddddddddd",zone_id)
  var output=[];
  model.schedulesList((err, results) => {
    if (err) {
      callback(err);
    } else {
      const response = results.map(each => ({
        id: each.id,
        title: each.name,
        start: moment(each.start).format('YYYY-MM-DD HH:mm:ss'),
        end: moment(each.end).format('YYYY-MM-DD HH:mm:ss'),
        floor: {
          id: each.floor_id,
          name: each.floor_name
        },
        zones: JSON.parse(each.data).zones,
        action: parseInt(JSON.parse(each.data).action, 10),
        intensity: parseInt(JSON.parse(each.data).intensity, 10)
      }));
      // console.log("responseeeeeeeeee",response)
      if(zone_id.length>1){
        let abc =[]
        let data=[]
        // console.log("if loop-----------------------------")
        // console.log("typeof",typeof(floor_id))
        response.filter(element =>{
          if(element.floor.id == floor_id){
            abc.push(element)
          }
        })
        // console.log("response",abc)
        abc.map((items,i)=>{
          items.zones.map((item,j)=>{
            // console.log("item.id",item.id)
            for(i=0;i<zone_id.length;i++){
              if(zone_id[i]==item.id){
                // console.log("matcheddddd",item.id)
                data.push(items)
              }
            }
          })
        })
        output = removeDuplicates(data,'id')

        // -----------------original--------------
        // response.filter(element=>{
        //   console.log("elementtttttt",element)
        //   console.log("element.zones[0].id",element.zones[0].id)
        //   element.zones[0].id == zone_id.map((_item,i)=>_item)
        // })
        // console.log("response length >1",response)
        // response.forEach(element => {
        //   console.log("elementttttttttt",element)
        //   console.log("floor_idddddddd",floor_id)
        //   console.log("zone_iddddddddddddd",zone_id)
        //   // if(element.floor.id == floor_id && element.zones[0].id == zone_id){
        //   if(element.floor.id == floor_id && zone_id.filter(id => id==element.zones[0].id)){
        //     console.log("elemntyyyyyyyyyyyy",element)
        //     abc.push(element)
        //   } 
        // });
      } else {
        // console.log("else loop===============================")
        response.forEach(element => {
         if(element.floor.id == floor_id && element.zones[0].id == zone_id){
          output.push(element)
         }
        }) 
      }
      // console.log("responseeeeeeeeeee",response.zones)
      setTimeout(() => {
        // console.log("abccccccccccc",abc)
        callback(null, {schedules: output});
      }, 500);
    }
  });
};

const deleteSchedule = (scheduleId, user, callback) => {
  model.deleteSchedule(scheduleId, user, (error, result) => {
    if (error) {
      callback(error);
    } else {
      if (result.affectedRows > 0) {
        callback(null, { message: 'Successfully Deleted Schedule' });
      } else {
        callback(null, { message: 'Schedule Not found' });
      }
    }
  });
};

const editSchedule = (payload, isRunning, id, callback) => {
  const schedule = {
    name: payload.title,
    data: JSON.stringify({
      zones: payload.zones,
      action: payload.action,
      intensity: payload.intensity
    }),
    floor_id: payload.floor.id,
    floor_name: payload.floor.name,
    start:moment(payload.start, 'YYYY-MM-DD HH:mm:ss')
          .add(1, 'm')
          .format('YYYY-MM-DD HH:mm:ss'),
    end: payload.end
  };
  model.checkZoneScheduleExists2(moment(payload.start, 'YYYY-MM-DD HH:mm:ss').add(1, 'm').format('YYYY-MM-DD HH:mm:ss'),moment(payload.end, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'), id,
    (err, resp) => {
      if (err) {
        callback(err);
      } else {
        const zonesList = payload.zones.map(item => item.id);
        let intersection = [];
        if (resp.length > 0) {
          intersection = _.intersection(
            zonesList,
            JSON.parse(resp[0].zone_id || [])
          );
        }
        if (intersection.length > 0) {
          //update
          callback({ message: 'Confict in Schedule' });
          
          
        } else {
          model.editSchedule(schedule, isRunning, id, (error, result) => {
            if(error) {
              callback(error);
            }
            else 
            if(result.message === "Conflict in Schedule name") {
              callback(null, { message: result.message, code: 500});
            }
            else {
                callback(null, { message: 'Successfully Updated Schedule', code: 201});
              }
            })
        }
      }
    }
  );
  
};

module.exports = {
  createSchedule,
  schedulesList,
  deleteSchedule,
  editSchedule
};
