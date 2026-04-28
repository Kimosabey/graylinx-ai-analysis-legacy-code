const chiller = require("./chiller");
const pump = require("./pump");
const cooling_tower = require("./cooling_tower");
const parameters = require("./parameters");
const mode = require("./mode");
const device_query = require("./device_query");
const alarms = require("./alarms");

module.exports = {
  ...chiller,
  ...pump,
  ...cooling_tower,
  ...parameters,
  ...mode,
  ...device_query,
  ...alarms,
};
