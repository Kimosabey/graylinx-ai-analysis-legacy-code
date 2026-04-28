const start = require("./start");
const stop = require("./stop");
const add = require("./add");
const subtract = require("./subtract");
const replace = require("./replace");

module.exports = {
  ...start,
  ...stop,
  ...add,
  ...subtract,
  ...replace,
};
