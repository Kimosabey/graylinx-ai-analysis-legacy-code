const { CREATED, OK } = require('http-status');
const service = require('./gateway.service');

const gatewaysList = (req, res, next) => {
  // const mac = req.query.mac;
  service.gatewaysList((error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};
const gatewaysName = (req, res, next) => {
  // const mac = req.query.mac;
  service.gatewaysName((error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};
const registerGateway = (req, res, next) => {
  const gateway = req.body;
  service.registerGateway(gateway, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.status(CREATED).json({ id: response });
    }
  });
};

const editGatewayIP = (req, res, next) => {
  const gateway = req.body;
  service.editGatewayIP(gateway, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};
const editGatewayName = (req, res, next) => {
  const gateway = req.body;
  service.editGatewayName(gateway, error => {
    if (error) {
      next(error);
    } else {
      res.status(OK).json({ message: 'Success' });
    }
  });
};

const associateGateway = (req, res, next) => {
  const gatewayId = req.params.id;
  const zoneId = req.body.zone.id;
  service.associateGateway(zoneId, gatewayId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.json({ message: response });
    }
  });
};

const deleteMapping = (req, res, next) => {
  const gatewayId = req.body.g_id;
  const zoneId = req.body.zone_id;
  service.deleteMapping(zoneId, gatewayId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.json({ message: response });
    }
  });
};

const deleteGatewayIp = (req, res, next) => {
  const gatewayId = req.body.id;
  console.log("gatewayid============",gatewayId)
  service.deleteGatewayIp(gatewayId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.json({ message: response });
    }
  });
};

const updateMapping = (req, res, next) => {
  const gatewayId = req.body.g_id;
  const zoneId = req.body.z_id;
  const prevZoneId = req.body.prev_zone_id;
  service.updateMapping(gatewayId, zoneId, prevZoneId, (error, response) => {
    if (error) {
      next(error);
    } else {
      res.json({ message: response });
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
