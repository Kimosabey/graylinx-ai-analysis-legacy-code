const model = require('./model');
const ping = require('ping');
const logger = require('../../Config/logger');

const gatewayStatusNow = callback => {
  model.getGatewayStatus((err, response) => {
    if (err) {
      callback(err);
    } else {
      if (response) {
        response.forEach(host => {
          ping.promise
          .probe(host.ip, {
            timeout: 10
          })
          .then(res => {
              model.updateGatewayStatus(host.name, res.alive, (err1, resp) => {
                if (err1) {
                  logger.info(`${host.ip} , Dead`);
                }
              });
            })
            .catch(err2 => {
              logger.info(err2);
            });
        });
      } else {
        callback({message: 'No Gateway Registered'});
      }
    }
  });
};

module.exports = {
  gatewayStatusNow
};
