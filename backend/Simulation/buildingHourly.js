// const configuration = require('./config.json');
const axios = require('axios');

const configuration = {
  // MM/DD/YYYY format
  "From": "12/09/2020",
  "To": "12/13/2020",
  "interval" : 60,
  "buildings" : [
    {"id": "8d6adace-7325-40f7-8c48-b3518e336ce8", "name": "moksha-mension", "campus_id": "2a5ec9bb-e7df-4efa-b0a0-7df627d5a30a"}
  ]
}

const buildings = configuration.buildingId;

const dataGenerator = async (time, buildingId, name, campusId) => {
  console.log(time);
  const api = `http://localhost:443/v1/analytics/simulation/building-hourly`;
  const data = {
    "name": name,
    "time": time,
    "buildingId": buildingId,
    "campusId": campusId,
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

const buildingsArray = configuration.buildings;

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

  buildingsArray.forEach(building => {
    var d = new Date(newDate);
    console.log(d.toISOString())
    setTimeout(() =>
    dataGenerator(newDate, building.id, building.name, building.campus_id)
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
