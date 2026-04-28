const { logToConsole } = require("./console");
const { logToFile } = require("./file");

function basePayload(level, title, data) {
  return {
    timestamp: new Date().toISOString(),
    level,
    title,
    data: data || {},
  };
}

function log(level, title, data) {
  const payload = basePayload(level, title, data);

  logToConsole(payload);
  logToFile(payload);
}

function logText(message, level = "info") {
  const payload = basePayload(level, message, null);
  logToConsole(payload, true);
  // logToFile(payload);
}
module.exports = {
  log,
  logText,
};
