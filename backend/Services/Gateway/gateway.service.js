const model = require('./gateway.model');
const uuid = require('uuid/v4');

const gatewaysList = (callback) => {
  model.gatewaysList((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};
const gatewaysName = (callback) => {
  
  model.gatewaysName((err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
  
};


const registerGateway = (gateway, callback) => {
  const payload = {
    id: uuid(),
    name: gateway.name,
    ip: gateway.ip
  };
  model.registerGateway(payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const editGatewayIP = (gateway, callback) => {
  model.editGatewayIP(gateway, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};
const editGatewayName = (gateway, callback) => {
  model.editGatewayName(gateway, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};
const associateGateway = (zoneId, gatewayId, callback) => {
  const payload = {
    zone_id: zoneId,
    gateway_id: gatewayId
  };
  model.associateGateway(payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const deleteMapping = (zoneId, gatewayId, callback) => {
  const payload = {
    zone_id: zoneId,
    gateway_id: gatewayId
  };
  model.deleteMapping(payload, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const deleteGatewayIp = (gatewayId, callback) => {
  model.deleteGatewayIp(gatewayId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const updateMapping = (gatewayId, zoneId, prevZoneId, callback) => {
  model.updateMapping(gatewayId, zoneId, prevZoneId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  gatewaysList,
  gatewaysName,
  registerGateway,
  editGatewayIP,
  editGatewayName,
  associateGateway,
  deleteMapping,
  deleteGatewayIp,
  updateMapping
};
