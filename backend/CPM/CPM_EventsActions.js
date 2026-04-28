// var glIbmsCpmDataBlock = {
//   ddcs: [
//     {
//       id: 123,
//       name: 'ddc-1',
//       bacnet_dev_address: '192.168.0.125:2000',
//       params: []
//     },
//     { id: 133, name: 'ddc-1', params: [] }
//   ],
//   chillers: [
//     {
//       id: 223,
//       name: 'chiller-1',
//       controlparams: [
//         {
//           id: 711,
//           objid: '2:10003',
//           objName: 'GL abcdegf012345',
//           presentValue: False
//         },
//         { id: 723, objid: '5:11223', objName: 'GL 01 00 04 b0 0 000', presentValue:1 }
//       ],
//       monitorparams: [],
//       metrics: []
//     },
//     { id: 233, name: 'chiller-3', params: [] }
//   ],
//   primarypumps: [
//     { id: 323, name: 'chiller-1', params: [] },
//     { id: 333, name: 'chiller-3', params: [] }
//   ],
//   secondarypumps: [
//     { id: 423, name: 'chiller-1', params: [] },
//     { id: 433, name: 'chiller-3', params: [] }
//   ],
//   condenserpumps: [
//     { id: 523, name: 'chiller-1', params: [] },
//     { id: 533, name: 'chiller-3', params: [] }
//   ],
//   coolingtowers: [
//     { id: 623, name: 'chiller-1', params: [] },
//     { id: 633, name: 'chiller-3', params: [] }
//   ]
// };
// const testStaticData=require('./cpmData.json')
const axiosc = require("axios");
const http = require("http");
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
// const ibmsData=require('../../Services/Device/myIBMSPreparation')
// console.log('satat DATA',JSON.stringify(Object.keys(testStaticData)))

// var glIbmsCpmDataBlock = {
//   223: {
//     id: 1234,
//     name: 'chiller-1',
//     eqpparams: [
//       {
//         id: 711,
//         objid: '2:10003',
//         objName: 'GL abcdegf012345',
//         presentValue: False
//       },
//       {
//         id: 723,
//         objid: '5:11223',
//         objName: 'GL 01 00 04 b0 0 000',
//         presentValue: 1,
//         controllable: true
//       }
//     ],
//     metrics:{
//         "rh":25
//     }
//   },
//   2273: {
//     id: 12345,
//     name: 'chiller-2',
//     eqpparams: [
//       {
//         id: 711,
//         objid: '2:10003',
//         objName: 'GL abcdegf012345',
//         presentValue: False
//       },
//       {
//         id: 723,
//         objid: '5:11223',
//         objName: 'GL 01 00 04 b0 0 000',
//         presentValue: 1,
//         controllable: true
//       }
//     ],
//     metrics:{
//         "rh":25
//     }
//   }
// };

// var glIbmsCpmEquipmentTree = {
//   123: [223, 433, 533, 633],
//   133: [233, 323, 333, 423, 523, 623]
// };

var actionTriggers = {
  valveTurnOn: [0xb00004, 1],
  // onValveStatusChange:[0xb00005],
  // pumpTurnOn:[0xb1000,1],
  // healthCheck: [],
  // checkAutoManual: [],
  Pri_Pmp_On: [0xb10001, 1],
  // pumpTurnOff:[0xB10002,0]
};
var eventTrigger = {
  chiller: { start: { valveOn: "onValveTurnOn" } },
  valveTurnOn: [0xb00005],
};
var actionsActive = []; // List of UUIDs to be tracked
// EVENTS
function onChillerValveTurnOn(inputJson = {}, callback) {
  // console.log('stat')
  let mychiller = inputJson;
  let mystatus = getJsonChildObject(inputJson, ["chillerId", "valveStatus"]);
  if (mychiller != null && mystatus != null) {
    callback(null, true);
  }
}

function chwFlowCheckStatus(inputJson = {}, callback) {
  console.log("chwFlowCheckStatus EVENT");
  let chwFlowId = inputJson;
  let mystatus = getJsonChildObject(inputJson, ["chwFlowId", "valveStatus"]);
  if (chwFlowId != null && mystatus != null) {
    callback(null, true);
  }
}

function onChillerTurnOn(inputJson = {}, mycallback) {
  // find chiller that can be turned on
  let chillerTobeTurnedOn = getChillerToTurnOn();
  // start actions
  // turn on valve specific to the chiller
  // turn on primary pump

  // check pressure
  // turn on secondary pump
  // turn on chillerTobeTurnedOn
}
function onchillerVlvOn(inputJson = {}, mycallback) {
  const id = inputJson["ss_id"];
}
// ACTIONS
function turnOnValve(inputJson = {}, mycallback) {
  // console.log('stat')
  // identify the bacnet object and device address to be used
  let mychiller = inputJson;
  let myaction = actionTriggers["valveTurnOn"];
  if (mychiller != null && myaction != null) {
    let dataToControl = getControlParameterObj(mychiller, myaction[0]);
    let control = { data: dataToControl, action: myaction[1] };
    console.log("in main function", JSON.stringify(dataToControl));
    turnOn(control, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        // console.log("turned valve on")
        mycallback(null, "VALVE_TURNON_REQUESTED");
      }
    });
  }
}

function findTheDeviceToBeStarted(ss_type, callback) {
  console.log("my length", ibmsData.Final_Json.length);
  let Final_Json = ibmsData.Final_Json;
  let AvaliableDev = null;
  let activeDevices = [];
  let Ref = {};
  let staticDataObject = Final_Json.find(
    (obj) => "Equipment_Static_Data" in obj
  );

  // Extract the value of ss_type key from the found object
  let secondaryPumps = staticDataObject["Equipment_Static_Data"].find(
    (data) => ss_type in data
  );

  // Extract and return the ids from ss_type
  if (secondaryPumps !== undefined) {
    let deviceIds = secondaryPumps[ss_type].map((pump) => pump.id);

    console.log("deviceIds length", deviceIds.length);
    // NONGL_SS_CHILLER         |
    // | NONGL_SS_EMS             |
    // | NONGL_SS_PUMPS           |
    // | NONGL_SS_SECONDARY_PUMPS |
    if (ss_type === "NONGL_SS_CHILLER") {
      Ref = { CH_Trip_SS: 0, CH_AM_SS: 1, CH_On_Off: 0 };
    }
    if (ss_type === "NONGL_SS_PUMPS") {
      Ref = { Pri_Pmp_Trip_SS: 0, Pri_Pmp_AM_SS: 1, Pri_Pmp_On_Off: 0 };
    }
    if (ss_type === "NONGL_SS_SECONDARY_PUMPS") {
      Ref = { Sec_Pmp_Trip_SS: 0, Sec_Pmp_AM_SS: 1, Sec_Pmp_On_Off: 0 };
    }
    let scount = 0;
    deviceIds.forEach((id) => {
      // Check if the ID exists in Equipment_RunTime_Data
      if (id in Final_Json[1]["Equipment_RunTime_Data"]) {
        scount++;
        let runtimeData = Final_Json[1]["Equipment_RunTime_Data"][id];
        // Check if all properties of runtimeData match those in Ref
        let isMatch = Object.keys(Ref).every(
          (key) => Ref[key] === runtimeData[key].param_value
        );
        console.log("T/F", isMatch);
        if (isMatch) {
          activeDevices.push(id); // Store the ID in the active device list
          if (scount == deviceIds.length) {
            console.log("loop ended in true");
            console.log(`my active dev ${activeDevices}`);
            let minRhValue = Infinity;
            let minRhDevice = null;
            if (activeDevices.length > 0) {
              activeDevices.forEach((deviceId) => {
                // Get the Rh["param_value"] for the device from myObj
                let rhValue =
                  Final_Json[1].Equipment_RunTime_Data[deviceId].Rh.param_value;
                // If the current Rh["param_value"] is smaller than the smallest found so far, update the variables
                if (rhValue < minRhValue) {
                  minRhValue = rhValue;
                  minRhDevice = deviceId;
                }
              });
              console.log(
                Final_Json[1].Equipment_RunTime_Data[minRhDevice].Rh.param_value
              );
              console.log(minRhDevice);
              // console.log("secondaryPumps[ss_type]",secondaryPumps[ss_type])
              let dataOfdevice = secondaryPumps[ss_type].filter(
                (data) => data.id == minRhDevice
              );
              console.log("daatof device", dataOfdevice[0]);
              // console.log("------------i am retruing -----------")
              // Extract the value of ss_type key from the found object
              let ddc = staticDataObject["Equipment_Static_Data"].find(
                (data) => "GL_SS_ADDRESS_BACNET_DDC" in data
              );
              // console.log("ia m ddc",ddc)
              const myDdc = ddc["GL_SS_ADDRESS_BACNET_DDC"].filter(
                (pump) => pump.id == dataOfdevice[0].ddcid
              );
              // console.log("myddc",myDdc)
              const ipAvl = myDdc[0].glSSId.substring(2);
              dataOfdevice[0]["ddcAddress"] = ipAvl;
              callback(null, dataOfdevice[0]);
            } else {
              callback(null, "no device found");
            }
          }
        }
      } else {
        scount++;
        console.log("no DATA FOR DEVICE", id);
        if (scount == deviceIds.length) {
          console.log("loop ended");
          console.log("active DEV", activeDevices);
          let minRhValue = Infinity;
          let minRhDevice = null;
          if (activeDevices.length > 0) {
            activeDevices.forEach((deviceId) => {
              // Get the Rh["param_value"] for the device from myObj
              let rhValue =
                Final_Json[1].Equipment_RunTime_Data[deviceId].Rh.param_value;
              // If the current Rh["param_value"] is smaller than the smallest found so far, update the variables
              if (rhValue < minRhValue) {
                minRhValue = rhValue;
                minRhDevice = deviceId;
              }
            });
            console.log(
              Final_Json[1].Equipment_RunTime_Data[minRhDevice].Rh.param_value
            );
            console.log("avaliable dev Id", minRhDevice);
            let dataOfdevice = secondaryPumps[ss_type].filter(
              (data) => data.id == minRhDevice
            );
            // Extract the value of ss_type key from the found object
            let ddc = staticDataObject["Equipment_Static_Data"].find(
              (data) => "GL_SS_ADDRESS_BACNET_DDC" in data
            );
            // console.log("ia m ddc",ddc)
            const myDdc = ddc["GL_SS_ADDRESS_BACNET_DDC"].filter(
              (pump) => pump.id == dataOfdevice[0].ddcid
            );
            // console.log("myddc",myDdc)
            const ipAvl = myDdc[0].glSSId.substring(2);
            dataOfdevice[0]["ddcAddress"] = ipAvl;
            // console.log("daatof device",dataOfdevice)
            callback(null, dataOfdevice[0]);
          } else {
            callback(null, "no device found");
          }
        }
      }
    });
  } else {
    console.log("no device found this type");
  }
}

//getchillerID

function turnOnPriPump(inputJson = {}, mycallback) {
  console.log("to trun on pri pump");
  // identify the bacnet object and device address to be used
  let mychiller = inputJson;
  let myaction = actionTriggers["Pri_Pmp_On"];
  if (mychiller != null && myaction != null) {
    let dataToControl = getControlParameterObj(mychiller, myaction[0]);
    let control = { data: dataToControl, action: myaction[1] };
    console.log("in main function", JSON.stringify(dataToControl));
    turnOn(control, (err, res) => {
      if (err) {
        console.log(err);
      } else {
        console.log(res);
        mycallback(null, "PUMP_TURNON_REQUESTED");
      }
    });
  }

  // identify the parameter to be used for the action
  // send write command to the bacnet object at the device address with correct parameter
  // verify write success by checking for the ACK
  // check for the valve turn on status
  // send valve turned on event
}

//turnOn

function turnOn(data, cb) {
  console.log("i am data in turn ON", data);
  const url = prepareUrl(data);
  console.log("url in trun on", url);
  executePbsReq(url, (err, pbsRes) => {
    if (err) {
      cb(err);
    } else {
      cb(null, pbsRes);
    }
  });
}

function executePbsReq(req, callback) {
  axios
    .get(req)
    .then((data) => {
      // console.log('in write method',data.status)
      if (data.status === 200) {
        console.log("command reached PBS");
        callback(null, data.status);
      }
    })
    .catch((err) => {
      // console.log('------------------------------',err,'----------------------')
      console.log("plesae run  PBS");
      callback(null);
    });
}

function readMethod(postData, callback) {
  console.log(
    `------------------------------------------------------>`,
    postData
  );
  callback(null, "readmethod");
}
/*
LIST OF ACTIONS
turnOn

turnOff
changeSp[x]
trunOnValve
turnOffValve
turnOnPP
turnOffPP
turnOnSP
turnOffSP
checkChillerOn
checkChillerOff
onExpectedResponse
onDelayedResponse
onNoResponse
writeActionToDatabase
readBackFromDatabase

LIST OF EVENTS
onChillerTurnOn
onChillerTurnOff
*/
function watchDog() {}
function broadcastMyHeartbeat() {}

// LOGICAL FUNTIONS
function getChillerToTurnOn() {
  let chillerIdentified = "";

  return chillerIdentified;
}

// HELPER FUNCTIONS

function getControlParameterObj(equipmentId, parameterId) {
  let datatocontrol = {};
  let Final_Json = ibmsData.Final_Json;
  let param = parameterId.toString(16).toUpperCase();
  const myValLast6 = param.slice(-6);
  let ddcDev = equipmentId.ddcid;
  let myDev = equipmentId.id;
  let staticDataObject = Final_Json.find(
    (obj) => "Equipment_Static_Data" in obj
  );
  let runDataObject = Final_Json.find((obj) => "Equipment_RunTime_Data" in obj);
  // Extract the value of ss_type key from the found object
  let ddc = staticDataObject["Equipment_Static_Data"].find(
    (data) => "GL_SS_ADDRESS_BACNET_DDC" in data
  );
  // console.log("ia m ddc",ddc)
  const myDdc = ddc["GL_SS_ADDRESS_BACNET_DDC"].filter(
    (pump) => pump.id == ddcDev
  );
  // console.log("myddc",myDdc)
  const ip = myDdc[0].glSSId.substring(2);
  console.log("i am ip", ip);
  let match;
  let matchingObject;
  for (const key in runDataObject["Equipment_RunTime_Data"][myDev]) {
    if (runDataObject["Equipment_RunTime_Data"][myDev].hasOwnProperty(key)) {
      let glCode = runDataObject["Equipment_RunTime_Data"][myDev][key].glCode
        .trim()
        .slice(-6);
      console.log("has own property", glCode, "my last 6 val", myValLast6);
      if (glCode === myValLast6) {
        match = key;
        matchingObject = runDataObject["Equipment_RunTime_Data"][myDev][key];
        break;
      }
    }
  }
  // console.log("matched",match,"matchingObject",matchingObject);
  if (matchingObject) {
    console.log(`Matching object key: ${match}`);
    let objtype = matchingObject.objType;
    let objInstance = parseInt(matchingObject.instanceId);
    datatocontrol = { ip: ip, objtype: objtype, objInstance: objInstance };
    console.log("i am data to control", JSON.stringify(datatocontrol));
    return datatocontrol;
  } else {
    console.log("No matching object found.");
  }
}

function prepareUrl(data) {
  //http://localhost:7080/write/156:0x000000000003/5:1004/presentValue/inactive

  const value =
    data.action === 1 ? "active" : data.action === 0 ? "inactive" : data.action;
  req = `http://localhost:7080/write/${data.data.ip}/${data.data.objtype}:${data.data.objInstance}/presentValue/${value}`;
  return req;
}

function getJSONChilObject(rootObj, myindexes = []) {
  // Check and Get the Object from Tree
}

// turnOnValve(testStaticData.glIbmsCpmDataBlock['0000b00000'],(err,res)=>{
//   if(err){
//     console.log(err)
//   }else{
//     console.log(res)
//   }
// })

// turnOnPriPump(testStaticData.glIbmsCpmDataBlock['0022b10000'],(err,res)=>{
//   if(err)
//   {
//     console.log(err)
//   }
//   if(res){
//     console.log("in handler----",res)
//   }
// })

function findTheChillerToBeStarted(ss_type, callback) {
  console.log("in ----------->440", ss_type);
  findTheDeviceToBeStarted(ss_type, (err, availableDev) => {
    if (err) {
      callback(err);
    } else {
      callback(null, availableDev);
    }
  });
  // return testStaticData.glIbmsCpmDataBlock['0000b00000']
  // ibmsData.cpmData((err,res)=>{
  //   if(err){
  //     console.log(err)
  //   }else{
  //     console.log("res",JSON.stringify(res))
  //   }
  // })
  // console.log("i AM IN CPM EVENT_ACTION",JSON.stringify(Final_Json))
  return "0000b00000";
}

function findThePumpToBeStarted(ss_type, callback) {
  findTheDeviceToBeStarted(ss_type, (err, availableDev) => {
    if (err) {
      callback(err);
    } else {
      callback(null, availableDev);
    }
  });
}

function findTheCondenserToBeStarted() {
  return "";
}
function getJSONElement(myJson, elementPath = []) {
  let eValue = myJson;
  console.log("my JSON", myJson[0]);
  for (let i = 0; i < elementPath.length; i++) {
    if (eValue !== undefined && eValue !== null) {
      eValue = eValue[elementPath[i]];

      if (typeof eValue === "string" && eValue.toUpperCase() === "NULL") {
        return null;
      }
    } else {
      eValue = undefined;
      console.log(`Unable to process JSON: ${elementPath}`);
      break;
    }
  }
  return eValue;
}

module.exports = {
  turnOnValve,
  onChillerValveTurnOn,
  findTheChillerToBeStarted,
  findThePumpToBeStarted,
  turnOnPriPump,
  executePbsReq,
};
