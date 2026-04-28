const axios = require("axios");
const http = require("http");
const path = require("path");
require("dotenv").config();

const axiosInstance = axios.create({
  httpAgent: new http.Agent({
    keepAlive: false,
  }),
});

const snap_shot_url = process.env.SNAPSHOT_URL;
const pbs1_port = process.env.PBS1;
const csv_file = path.join(__dirname, "../../", process.env.NAME_HANDLER_CSV);

if (!process.env.controllermap) {
  throw new Error("Missing required env var: controllermap");
}
let controllerMap;
try {
  controllerMap = JSON.parse(process.env.controllermap);
} catch (err) {
  throw new Error("Invalid JSON in env var: controllermap");
}

const deployed_at = process.env.deployed_at;
const mysql_user = process.env.MYSQL_USER;
const mysql_host = process.env.MYSQL_HOST;
const mysql_passcode = process.env.MYSQL_PASSWORD;
const mysql_db_name = process.env.MYSQL_DATABASE_NAME;

module.exports = {
  axiosInstance,
  snap_shot_url,
  pbs1_port,
  csv_file,
  controllerMap,
  deployed_at,
  mysql_user,
  mysql_host,
  mysql_passcode,
  mysql_db_name,
};
