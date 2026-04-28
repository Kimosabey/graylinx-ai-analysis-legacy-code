// const configuration = require('./config.json');
const axios = require('axios');

const configuration = {
    // MM/DD/YYYY format
    "From": "11/01/2020",
    "To": "12/13/2020",
    "Interval": 60,
    "floors" : [
      {"id": "1ce837bd-3681-483b-97cd-8886ea5b30eb", "building_id": "8d6adace-7325-40f7-8c48-b3518e336ce8", "name": "Floor-1"}
    ],
    "buildingInterval" : 60
}

const floorsArray = configuration.floors;

const dataGenerator = async (time, floorId, buildingId, name) => {
  // var date = new Date(time);
  // console.log(date.toString("MMM dd"));
  const api = `http://localhost:443/v1/analytics/simulation/floor-daily`;
  const data = {
    "name": name,
    "time": time,
    "floorId": floorId,
    "buildingId": buildingId,
    // "vehicleAvgOccupancy": Math.floor(Math.random() * 101),
    // "humanAvgOccupancy": Math.floor(Math.random() * 101),
    "avgOccupancy": Math.floor(Math.random() * 101),
    "avgTemperature": 23 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgHumidity": 40 + Math.floor(Math.floor(Math.random() * 10) + 1),
    "avgLux": 40 + Math.floor(Math.floor(Math.random() * 10) + 1)
  }
  console.log(data);
  return await axios.post(api, data);
  // return await axios.post(api, data);
}

let start = new Date(configuration.From);
// let Interval = 0;
// const buildingId = configuration.buildingId;
let end = new Date(configuration.To);
if (end > Date.now()) {
  end = Date.now();
}
let loop = new Date(start);
let delay = 1000;
count = 0;

while (loop <= end) {
  // let newDate = loop.set
  let newDate = loop.setDate(loop.getDate()+count);
  loop = new Date(newDate);
  if(newDate > end)
  {
    break;
  }
  floorsArray.forEach(floor => {
    var d = new Date(newDate);
    console.log(d)
    setTimeout(() =>
    dataGenerator(newDate, floor.id, floor.building_id, floor.name)
    , delay)
    delay += 1000
  });
  count = 1;
  
}
