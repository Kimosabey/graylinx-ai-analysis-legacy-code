const { OK } = require('http-status');
const service = require('./analytics.service');

const occupancyCharts = (req, res, next) => {
  const floorId = req.query.floorId;
  service.occupancyCharts(floorId, (err, response) => {
    if (err) {
      next(err);
    } else {
      res.status(OK).json(response);
    }
  });
};

const occupancyCards = (req, res, next) => {
  const floorId = req.query.floorId;
  const timing = req.query.time;
  service.occupancyCards(floorId, timing, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.status(OK).json(result);
    }
  });
};

const occupancyGraph = (req, res, next) => {
  const context = req.query.context;
  const contextId = req.query.contextId;
  const timing = req.query.time;
  service.occupancyGraph(context, contextId, timing, (err, result) => {
    if (err) {
      next(err);
    } else {
      res.status(OK).json(result);
    }
  });
};

module.exports = {
  occupancyCards,
  occupancyCharts,
  occupancyGraph
};
