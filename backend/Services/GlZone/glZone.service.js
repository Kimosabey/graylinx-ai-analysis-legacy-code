const _ = require('lodash');
const uuid = require('uuid/v4');
const { error } = require('winston');
const model = require('./glZone.model');

const createGlZone = (payload, callback) => {
  console.log("zone_type: ",payload.type)
  var data;
  if(payload.type == "organization") {
     data = {
      id: uuid(),
      name : payload.name,
      zone_type : payload.type,
      zone_status : "active",
    }
    model.createOrganization(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }
  else if(payload.type == "campus") {
    data = {
      id: uuid(),
      name : payload.name,
      zone_type : payload.type,
      zone_status : "active",
      zone_parent : payload.org.id
    }
    model.createCampus(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }
  else if(payload.type == "building") {
    data = {
      id: uuid(),
      name : payload.name,
      zone_type : payload.type,
      zone_status : "active",
      zone_parent : payload.campus.id
    }
    model.createBuilding(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }
  else if(payload.type == "floor") {
    data = {
      id: uuid(),
      name : payload.name,
      zone_type : payload.type,
      zone_status : "active",
      zone_parent : payload.building.id,
      params : payload.params
    }
    model.createFloor(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }
  else if(payload.type == "meeting-room" || payload.type == "co_working") {
    data = {
      id: uuid(),
      name : payload.name,
      zone_type : payload.type,
      zone_status : "active",
      zone_parent : payload.floor.id,
      shape : payload.shape,
      coords : payload.coords,
      params : payload.params
    }
    console.log("data:",data)
    model.createZone(data, (error, result) => {
        if (error) {
          callback(error);
        } else {
          callback(null, result);
        }
    });
  }
};

const bookingList = (usage_type, callback) => {
  model.bookingList(usage_type, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const childGlZones = (parent_id, callback) => {
  model.childGlZones(parent_id, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const bookingStatus = (floor_id, type, query, callback) => {
  model.childGlZones(floor_id, (error1, result1) => {
    if(result1.length > 0) {
      const zoneDetails = result1.filter(child => child.zone_type == type)
      zoneDetails.forEach(zone => {
        zone.booking_status = "available";
        model.bookingStatus(zone.id, query, type, (error2, result2) => {
          if(zone.id == result2.zone_id) {
            zone.booking_status = "occupied";
          }
        })
      })
      setTimeout(() => {
        callback(null,zoneDetails)
      },200)
    }
  })
};

const configuration = (glZone_id, payload, callback) => {
  var count = 0; 
  for(var key in payload) {
    param_name = key
    param_value = payload[key]
    model.configuration(glZone_id,param_name,param_value, (error, result) => {
      if(result) {
        count++;
      }
      if(count == Object.keys(payload).length) {
        callback(null, result)
      }
    })
  }
};

const cardsForDashboard = (glZone_id, callback) => {
  
  model.cardsForDashboard(glZone_id, (error, result) => {
    if(error) {
      callback(error)
    }
    else{
      callback(null,result)
    }
  })
};

const confRoomFacility = (glZone_id, callback) => {
  model.confRoomFacility(glZone_id, (error, result) => {
    if(error) {
      callback(error)
    }
    else{
      callback(null,result)
    }
  })
};
const getUser = (email, callback) => {
  model.getUser(email, (error, result) => {
    if(error) {
      callback(error)
    }
    else{
      callback(null,result)
    }
  })
};
 
const booking = (payload, callback) => {
  model.booking(payload, (error, result) => {
    if(error) {
      callback(error)
    }
    else{
      callback(null,result)
    }
  })
};  

module.exports = {
    createGlZone,
    bookingList,
    childGlZones,
    bookingStatus,
    configuration,
    cardsForDashboard,
    confRoomFacility,
    getUser,
    booking
};