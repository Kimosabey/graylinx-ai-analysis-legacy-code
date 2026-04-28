// const configuration = require('./config.json');
const axios = require('axios');

const configuration = {
  // MM/DD/YYYY format
  "From": "12/01/2020",
  "To": "12/02/2020",
  "Interval": 10,
  "Duration": 60,
  "sensors": [
  {"id": "5c8b03c1-30dc-4c6b-a210-05c6ebb5e970", "type":"occupancy_sensor"},
  {"id": "5d9dc6f3-fd13-4c0e-9803-8f32b2db71b6", "type":"thl_sensor"}
  ]
}

const sensors = configuration.sensors;

const Event = async (id, datetime, type) => {
  let data = {};
  const api = `http://localhost:443/v1/devices/${id}/events`;
  if (type === 'occupancy_sensor') {

    data = {battery: 40 + (Math.random() * 10), occupancy: Math.random() < 0.5}
    // data = {
    //   vehicle_occupancy: {
    //     value: Math.random() < 0.5
    //   },
    //   human_occupancy: {
    //     value: Math.random() < 0.5
    //   }
    // };
  } else if (type === 'thl_sensor') {
    data = {
      battery: 40 + (Math.random() * 10),
      temperature: { value: 23 + (Math.random() * 10) },
      humidity: { value: 40 + (Math.random() * 10) + 1 },
      luminousity: { value: 400 + (Math.floor(Math.random() * 10) + 1) }
    };
  }

  const request = {
    timestamp: datetime,
    device: {
      id,
      type
    },
    event: data
  };
  try {
    console.log('Posting:', id, ':', request.device.type, ':', new Date(request.timestamp).toLocaleString());
    await axios.post(api, request);
  } catch (e) {
    console.log(e);
  }
};

// let start = new Date(configuration.From);
const Interval = configuration.Interval;
let end = new Date(configuration.To);
if (end > Date.now()) {
  end = Date.now();
}
let loop = new Date(configuration.From);
console.log("looop", loop.toDateString())
// let loop = Date.now()
//loop.setMinutes(loop.getMinutes() - configuration.Duration)
let delay = 0;
let i = 0;
while (loop <= end) {
  i++;
  let newDate = loop.setMinutes(loop.getMinutes() + Interval);
  loop = new Date(newDate);
  
  console.log("time: ",loop.toLocaleString())
  sensors.forEach(sensor => {
    try {
      delay += 100;
      setTimeout(Event, delay, sensor.id, loop, sensor.type);
    } catch (err) {
      console.log(err);
    }
  });
}
