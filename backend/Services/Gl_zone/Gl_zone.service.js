const _ = require('lodash');
const uuid = require('uuid/v4');
const { error } = require('winston');
const model = require('./Gl_zone.model');

const createGlZone = (payload, callback) => {
  console.log("zone_type: aaaa",payload.type)
  var data;
 
     data = {
      id: uuid(),
      name : payload.name,
      is_active : 1,
      tag:payload.tag?payload.tag:null,
      description:payload.description?payload.description:null,
      zone_shape:payload.zone_shape?payload.zone_shape:null,
      zone_type:payload.type?payload.type:null,
      coordinates:payload.coordinates?payload.coordinates:null,
      parent_id:payload.parent_id?payload.parent_id:null
    }
    model.createOrganization(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }

  const getGlZone =(id,deviceType,callback)  =>{
    console.log("iddd",id,deviceType)
    model.getGlZone(id,deviceType,(error, results) => {
      if (error) {
        callback(error);
      } else {
        callback(null,results)
      }
    })
  }
 
  const getGlZoneForSchedule =(id,deviceType,callback)  =>{
    console.log("iddd",id,deviceType,"service")
    model.getGlZoneForSchedule(id,deviceType,(error, results) => {
      if (error) {
        callback(error);
      } else {
        callback(null,results)
      }
    })
  }

module.exports = {
    createGlZone,
    getGlZone,
    getGlZoneForSchedule
  }