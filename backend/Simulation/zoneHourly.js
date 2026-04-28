// const configuration = require('./config.json');
const axios = require('axios');

const configuration = {
  // MM/DD/YYYY format
  "From": "12/09/2020",
  "To": "12/13/2020",
  "Interval": 60,
  "zones" : [
    {"id": "3250faad-5c48-4d3f-af3c-6f71709d442c", "floor_id":"1ce837bd-3681-483b-97cd-8886ea5b30eb", "name": "Conference-room"},
    {"id": "44773d08-cb6e-47bc-8d0a-fda7abddb415", "floor_id":"1ce837bd-3681-483b-97cd-8886ea5b30eb", "name": "software-area"},
    {"id": "8dbfa07c-6124-485f-90fb-e7993039ff48", "floor_id":"1ce837bd-3681-483b-97cd-8886ea5b30eb", "name": "Hardware-area"},
    {"id": "b4159e51-90d5-465d-a983-9d4d05090243", "floor_id":"1ce837bd-3681-483b-97cd-8886ea5b30eb", "name": "Firmware-area"}
  ],
  "buildingInterval" : 60
}

const zonesArray = configuration.zones;

const dataGenerator = async (time, zoneId, floorId, name) => {
  console.log("time=======");
  console.log(time);
  const api = `http://localhost:443/v1/analytics/simulation/zone-hourly`;
  const data = {
    "name": name,
    "time": time,
    "zoneId": zoneId,
    "floorId": floorId,
    "avgOccupancy": Math.floor(Math.random() * 101),
    // "humanAvgOccupancy": Math.floor(Math.random() * 101),
    "avgTemperature": 23 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgHumidity": 40 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgLux": 40 + Math.floor(Math.floor(Math.random() * 10) + 1)
  }
  console.log(data);
  return await axios.post(api, data);
}

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
  Interval = configuration.Interval;
  loop = new Date(newDate);

  zonesArray.forEach(zone => {
    setTimeout(() =>
    dataGenerator(newDate, zone.id, zone.floor_id, zone.name)
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
