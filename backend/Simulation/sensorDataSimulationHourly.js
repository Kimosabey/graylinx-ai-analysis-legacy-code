// const configuration = require('./config.json');
const axios = require('axios');
const configuration = {
  "From": "12/01/2020",
  "To": "12/05/2020",
  "Interval": 10,
  "Duration": 60,
  "sensors": [
    
    {"id": "94e6900c-ac39-4aea-8083-72d81c065a54", "name": "pir one","deviceType":"occupancy_sensor","zoneId":"1b2135fa-865d-4dd7-85ee-8cb77c11ba73","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room2"},
    {"id": "5b898b3f-d2dd-461b-bca2-230d003553dd", "name": "thl f2 z2 one","deviceType":"thl_sensor","zoneId":"339fb4a9-622d-4b88-9930-93de2e16d0bf","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working two"},
    {"id": "7934624b-b778-4b7e-a18a-4b639dbfe5a7", "name": "thl f2 z2 two","deviceType":"thl_sensor","zoneId":"339fb4a9-622d-4b88-9930-93de2e16d0bf","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working two"},
    {"id": "8a2adf7e-c368-464a-a699-d8ac21b649d0", "name": "occupancy f2 z1 two","deviceType":"occupancy_sensor","zoneId":"5e261a97-e221-4cbb-a66b-cf0bce904782","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working one"},
    {"id": "1610de34-0128-4d92-bbe5-664f4d2002ea", "name": "Pir four","deviceType":"occupancy_sensor","zoneId":"b3911fa1-82d0-43ab-bf25-93696587a701","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room1"},
    {"id": "a4e1eb57-4b93-4ad0-a256-ad7c59512af5", "name": "thl sensor one","deviceType":"thl_sensor","zoneId":"b3911fa1-82d0-43ab-bf25-93696587a701","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room1"},
    {"id": "0260c09d-fd9e-4ca9-9cc6-d0be4345e762", "name": "thl f2 z1 two","deviceType":"thl_sensor","zoneId":"5e261a97-e221-4cbb-a66b-cf0bce904782","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working one"},
    {"id": "9f8478b8-d350-450d-8891-c2f867f30f92", "name": "occupancy f2 z1 one","deviceType":"occupancy_sensor","zoneId":"5e261a97-e221-4cbb-a66b-cf0bce904782","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working one"},
    {"id": "5ec674a3-c0e2-4464-bc17-eeaf0bc139b4", "name": "thl four","deviceType":"thl_sensor","zoneId":"b3911fa1-82d0-43ab-bf25-93696587a701","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room1"},
    {"id": "63d82adc-2249-4c20-9509-8a261ecaac2b", "name": "occupancy f2 z2 one","deviceType":"occupancy_sensor","zoneId":"339fb4a9-622d-4b88-9930-93de2e16d0bf","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working two"},
    {"id": "c3500fe3-d68b-4ba5-9b9d-aaf85a3a57fa", "name": "thl one fl 2","deviceType":"occupancy_sensor","zoneId":"5e261a97-e221-4cbb-a66b-cf0bce904782","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working one"},
    {"id": "6d5ccf36-2736-49a7-b442-f9d8f888270d", "name": "pir two","deviceType":"occupancy_sensor","zoneId":"b3911fa1-82d0-43ab-bf25-93696587a701","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room1"},
    {"id": "b413d955-af49-4443-9ea6-dadf7f94a73a", "name": "thl f2 z1 one","deviceType":"thl_sensor","zoneId":"5e261a97-e221-4cbb-a66b-cf0bce904782","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working one"},
    {"id": "e0a7949d-b616-48a4-9cff-0633362cbe67", "name": "occupancy f2 z2 two","deviceType":"occupancy_sensor","zoneId":"339fb4a9-622d-4b88-9930-93de2e16d0bf","floorId":"9ecb8f74-8f83-462f-97ab-0ce91684803d","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor 2","zoneName":"co working two"},
    {"id": "87185342-fa0b-43f2-b18c-18c40aef831c", "name": "thl three","deviceType":"thl_sensor","zoneId":"f9bde44b-3f9d-4224-a7a5-34b590d42ea9","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room3"},
    {"id": "03beff02-ebf9-4317-8bbb-58ce51bd7139", "name": "thl two","deviceType":"thl_sensor","zoneId":"1b2135fa-865d-4dd7-85ee-8cb77c11ba73","floorId":"4aaa33ad-29f4-4821-bd38-78766954c6e9","buildingId":"1d85db26-e8fa-4a29-a00b-b8fd47a367a8","campusId":"e23ac5ee-d60c-4e57-a545-aacabd5f9228","campusName":"koramangala","buildingName":"building1","floorName":"floor1","zoneName":"meeting-room2"}
  ]
}

const sensors = configuration.sensors;
// console.log("file", configuration.sensors)

const Event = async (datetime, sensor) => {
  console.log("inside event function")
  const api = `http://localhost:443/v1/analytics/simulation/sensor-data`;
  let data;
  if (sensor.deviceType === 'occupancy_sensor') {
    data = {
      deviceId : sensor.id,
      deviceType : sensor.deviceType,
      deviceName : sensor.name,
      zoneId : sensor.zoneId,
      floorId : sensor.floorId,
      buildingId : sensor.buildingId,
      campusId : sensor.campusId,
      zoneName : sensor.zoneName,
      floorName : sensor.floorName,
      buildingName : sensor.buildingName,
      campusName : sensor.campusName,

      battery: 40 + (Math.floor(Math.random() * 10) + 10),
      occupancy: Math.random() < 0.5,
      time: datetime,

      data_new: {
        battery: 40 + (Math.floor(Math.random() * 10) + 10),
        occupancy: Math.random() < 0.5
      }
      
    }
  } else if (sensor.deviceType === 'thl_sensor') {
    data = {
      deviceId : sensor.id,
      deviceType : sensor.deviceType,
      deviceName : sensor.name,
      zoneId : sensor.zoneId,
      floorId : sensor.floorId,
      buildingId : sensor.buildingId,
      campusId : sensor.campusId,
      zoneName : sensor.zoneName,
      floorName : sensor.floorName,
      buildingName : sensor.buildingName,
      campusName : sensor.campusName,

      battery: 40 + (Math.random() * 10),
      temperature: { value: 23 + (Math.random() * 10) },
      humidity: { value: 40 + (Math.random() * 10) + 1 },
      luminousity: { value: 400 + (Math.floor(Math.random() * 10) + 1) },
      time: datetime,

      data_new: {
        Sensor_type: "THL",
        battery: 40 + (Math.random() * 10),
        temperature: { value: 23 + (Math.random() * 10) },
        humidity: { value: 40 + (Math.random() * 10) + 1 },
        luminousity: { value: 400 + (Math.floor(Math.random() * 10) + 1) }
      }
      
    }
    // data = {
    //   device_id: id,
    //   Sensor_type: "THL",
    //   battery: 40 + (Math.random() * 10),
    //   temperature: { value: 23 + (Math.random() * 10) },
    //   humidity: { value: 40 + (Math.random() * 10) + 1 },
    //   luminousity: { value: 400 + (Math.floor(Math.random() * 10) + 1) }
    // };
  }

  console.log('Posting:', sensor.id, ':', sensor.deviceType, ':', new Date(datetime).toLocaleString());
  try {
    await axios.post(api, data);
  } catch (e) {
    console.log(e);
  }
};

// let start = new Date(configuration.From);
const interval = configuration.Interval;
let end = Date.now();
let loop = new Date(configuration.From);
// loop.setMinutes(loop.getMinutes() - configuration.Duration)

// let loop = Date.now()
let delay = 0;
while (loop <= end) {
  
  let newDate = loop.setMinutes(loop.getMinutes() + interval);
  loop = new Date(newDate);
  sensors.forEach(sensor => {
    try {
      delay += 100;
      setTimeout(Event, delay, newDate, sensor);
    } catch (err) {
      console.log(err);
    }
  });
}
