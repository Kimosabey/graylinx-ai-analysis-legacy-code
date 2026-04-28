const { OK } = require('http-status');
const service = require('./alert.service');

const alerts = (req, res, next) => {
  const campusId = req.params.id;
  service.alerts(campusId, (error, response) => {
    console.log("alerts responseeeeeeee======================================",response)
    if (error) {
      next(error);
    } else {
      res.status(OK).json(response);
    }
  });
};

module.exports = {
  alerts
};
