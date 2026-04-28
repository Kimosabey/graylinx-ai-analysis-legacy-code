// const configuration = require('./config.json');
const axios = require('axios');
const { compareAsc, format } = require('date-fns');

const configuration = {
    // MM/DD/YYYY format
    "From": "11/01/2020",
    "To": "12/13/2020",
    "Interval": 60,
    // "buildingId": ["1d85db26-e8fa-4a29-a00b-b8fd47a367a8"],
    "buildings" : [
      {"id": "8d6adace-7325-40f7-8c48-b3518e336ce8", "name": "moksha-mension", "campus_id": "2a5ec9bb-e7df-4efa-b0a0-7df627d5a30a"}
    ],
}

const dataGenerator = async (time, buildingId, name, campusId) => {
  // var date = new Date(time);
  // console.log(date.toString("MMM dd"));
  const api = `http://localhost:443/v1/analytics/simulation/building-daily`;
  const data = {
    "name": name,
    "time": time,
    "buildingId": buildingId,
    "campusId": campusId,
    "avgOccupancy": Math.floor(Math.random() * 101),
    // "humanAvgOccupancy": Math.floor(Math.random() * 101),
    "avgTemperature": 23 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgHumidity": 40 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgLux": 40 + Math.floor(Math.floor(Math.random() * 10) + 1)
  }
  console.log("data===================", data);
  return await axios.post(api, data);
  // return await axios.post(api, data);
}

const buildingsArray = configuration.buildings;
let start = new Date(configuration.From);
// let Interval = 0;
let end = new Date(configuration.To);
if (end > Date.now()) {
  end = Date.now();
}
let loop = new Date(start);
let delay = 1000;
count = 0;

while (loop <= end) {
  console.log(loop.toLocaleString())
  // let newDate = loop.set
  let newDate = loop.setDate(loop.getDate()+count);
  loop = new Date(newDate);
  if(newDate > end)
  {
    break;
  }
  buildingsArray.forEach(building => {
    var d = new Date(newDate);
    console.log(d)
    setTimeout(() =>
    dataGenerator(newDate, building.id, building.name, building.campus_id)
    , delay)
    delay += 1000
  });
  count = 1;
  
}

