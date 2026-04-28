const fs = require("fs");
const path = require("path");

// Directory where the executable is located
const BASE_DIR = process.pkg ? path.dirname(process.execPath) : process.cwd();

const LOG_FILE = path.join(BASE_DIR, "control.log");

function ensureLogFile() {
  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, "", { encoding: "utf8" });
  }
}

function logToFile(payload) {
  ensureLogFile();

  fs.appendFileSync(LOG_FILE, JSON.stringify(payload) + "\n", {
    encoding: "utf8",
  });
}

module.exports = { logToFile };
