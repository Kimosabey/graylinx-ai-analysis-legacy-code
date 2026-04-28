// const configuration = require('./config.json');
const axios = require('axios');

const configuration = {
  // MM/DD/YYYY format
  "From": "12/09/2020",
  "To": "12/10/2020",
  "interval" : 60,
  "campus" : [
    {"id": "2a5ec9bb-e7df-4efa-b0a0-7df627d5a30a", "name": " kormanghla", "org_id": "88231560-e530-4602-8c05-ee99ea8adad9"}
  ],
}

const buildings = configuration.buildingId;

const dataGenerator = async (time, campusId, name, orgId) => {
  console.log(time);
  const api = `http://localhost:443/v1/analytics/simulation/campus-hourly`;
  const data = {
    "name": name,
    "time": time,
    "campusId": campusId,
    "orgId": orgId,
    "avgOccupancy": Math.floor(Math.random() * 101),
    // "vehicleAvgOccupancy": Math.floor(Math.random() * 101),
    // "humanAvgOccupancy": Math.floor(Math.random() * 101),
    "avgTemperature": 23 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgHumidity": 40 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgLux": 40 + Math.floor(Math.floor(Math.random() * 10) + 1)
  }
  console.log(data);
  return await axios.post(api, data);
}

const campusArray = configuration.campus;

let start = new Date(configuration.From);
let Interval = 0;
let end = new Date(configuration.To);
if (end > Date.now()) {
  end = Date.now();
}
let loop = new Date(start);
let delay = 1000;
while (loop <= end) {
  let newDate = loop.setMinutes(loop.getMinutes() + Interval);
  Interval = configuration.interval;
  loop = new Date(newDate);

  campusArray.forEach(campus => {
    var d = new Date(newDate);
    console.log(d.toISOString())
    setTimeout(() =>
    dataGenerator(newDate, campus.id, campus.name, campus.org_id)
    , delay)
    delay += 1000
    // try {
    //   delay += 100;
    //   setTimeout(Event, delay, id, loop, 'parking_sensor');
      
    // } catch (err) {
    //   console.log(err);
    // }
  });
  
}
