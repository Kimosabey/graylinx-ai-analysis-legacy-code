const _ = require('lodash');
const uuid = require('uuid/v4');
const { parse, format,addMinutes } = require('date-fns');
const model = require('./hvac_schedule.model');
const { response } = require('express');

const createSchedule = (data, user, callback) => {
  console.log("dataaaaaaaaaaaaaaaaaaa",data)
  const id = uuid();
  const schedule = {
    id,
    name: data.title,
    data: JSON.stringify({
      zones: data.zones,
      action: data.action,
      intensity: data.intensity,
      type:data.type
    }),
    floor_id: data.floor.id,
    floor_name: data.floor.name,
    start: format(addMinutes(parse(data.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss'),
    end: data.end
  };
  console.log("data.start",data.start)
  console.log("data.end",data.end)
  // console.log("hiiiiiiiiiiiiiiiiiiiio",format(addMinutes(parse(data.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss'))
  let start=format(addMinutes(parse(data.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss')
  let end=data.end
  // console.log("format(addMinutes(parse(data.start,'yyyy-MM-dd HH:mm:ss',new Date()),1=============",format(addMinutes(parse(data.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss'),"format(new Date(data.end,'yyyy-MM-dd HH:mm:ss'), 'yyyy-MM-dd HH:mm:ss')====================",format(new Date(data.end,'yyyy-MM-dd HH:mm:ss'), 'yyyy-MM-dd HH:mm:ss'))
  //console.log("hiiiiiiiiiiiiiiiiiiiio",format(new Date(data.end,'yyyy-MM-dd HH:mm:ss'), 'yyyy-MM-dd HH:mm:ss'))
  console.log("i am hrer to create sch")
  model.checkZoneScheduleExists(start,end,
    (err, resp) => {
        console.log("resppppppppp",resp)
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

const schedulesList = (callback) => {
  // console.log("zone_idddddddddddd",zone_id)
  model.schedulesList((err, results) => {
    if (err) {
      callback(err);
    } else {
      if(results.length>0){
        const response = results.map(each => ({
          id: each.id,
          title: each.name,
          start: format(new Date(each.start), 'yyyy-MM-dd HH:mm:ss'),
          end: format(new Date(each.end), 'yyyy-MM-dd HH:mm:ss'),
          floor: {
            id: each.floor_id,
            name: each.floor_name
          },
          zones: JSON.parse(each.data).zones,
          action: parseInt(JSON.parse(each.data).action, 10),
          intensity: parseInt(JSON.parse(each.data).intensity, 10)
        }));
        setTimeout(() => {
          callback(null, {schedules: response});
        }, 500);
      } else {
        setTimeout(() => {
          callback(null, {schedules: []});
        }, 500);
      }
      // let abc =[]
      // if(zone_id.length>1){
      //   response.filter(element=>{
      //     element.zones[0].id == zone_id.map((_item,i)=>_item)
      //   })
      //   // console.log("response length >1",response)
      //   response.forEach(element => {
      //     // if(element.floor.id == floor_id && element.zones[0].id == zone_id){
      //     if(element.floor.id == floor_id && zone_id.filter(id => id==element.zones[0].id)){
      //       // console.log("elemntyyyyyyyyyyyy",element)
      //       abc.push(element)
      //     } 
      //   });
      // } else {
      //   response.forEach(element => {
      //    if(element.floor.id == floor_id && element.zones[0].id == zone_id){
      //     abc.push(element)
      //    }
      //   }) 
      // }
      // console.log("responseeeeeeeeeee",response.zones)
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
    start:format(addMinutes(parse(payload.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss'),
    end: payload.end
  };
  model.checkZoneScheduleExists2(format(addMinutes(parse(payload.start,'yyyy-MM-dd HH:mm:ss',new Date()),1),'yyyy-MM-dd HH:mm:ss'),payload.end, id,
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
