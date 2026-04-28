const Influx = require("influx");

const influx = new Influx.InfluxDB({
  host: "127.0.0.1",
  port: 8086,
  database: "senzopt",
});

influx.getDatabaseNames().then((names) => {
  if (!names.includes("senzopt")) {
    return influx.createDatabase("senzopt");
  }
});

module.exports = influx;
