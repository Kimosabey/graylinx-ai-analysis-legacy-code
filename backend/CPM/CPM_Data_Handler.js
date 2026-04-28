const fs = require("fs");
const cpmUtils = require("./CPM_Utilities");
const Plant_Snapshot = require("./preparePlantSnapshot");
const c = require("ansi-colors");
const cpmEventsActions = require("./CPM_EventsActions");
const scenarioHandler = require("./CPM_Scenario_Handler");
const sc = require("./snapshot_check");
const exp = require("constants");
const { updateLocale } = require("moment/moment");
const axiosc = require("axios");
const https = require("https");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
const filePath = "./plantsnapshot.json";

// var ibmsDataBlockJson = null;
var ibmsDataBlockJson = {};
var loaderStarted = true;
let useDB = false;

let activeCPMScenarios = [{ "123": {} }, {}];

function getParameterDetails(ddcId, paramGLCode) {
  // process to identify equipment type and id, parameter name
  let paramDetails = null;
  return paramDetails;
}

function getValve(jsonIn = {}) {
  let valveId = null; // prepare valveId
  return valveId;
}

// Add other functions
function getActiveScenario() {
  return cpmUtils.getJSONElement(ibmsDataBlockJson, ["Active_Scenario"]);
}

function setEquipmentId(jsonPath = [], id = null) {
  if (id !== null)
    ibmsDataBlockJson["Active_Scenario"]["Working_On_Equipment_Id"] = id;
}

function initialize(path) {
  // cpmUtils.myError('Error while reading the file:')
  // console.log(`${path}`)
  fs.readFile(path, "utf8", (err, file) => {
    // check for any errors
    if (err) {
      cpmUtils.myError("Error while reading the file:", err);
      return;
    }
    try {
      ibmsDataBlockJson = JSON.parse(file);
      // console.log(c.bgBlueBright(`AFTER -JSONfile ${JSON.stringify(ibmsDataBlockJson)}`))
      // const jsonString = JSON.stringify(ibmsDataBlockJson, null, 2);
      // 			fs.writeFile(filePath, jsonString, (writeErr) => {
      // 				if (writeErr) {
      // 				  console.error('Error writing file:', writeErr);
      // 				} else {
      // 				  console.log('=========File written successfully!!!!!!!');
      // 				}
      // 			  });

      //!useDB with db data
      if (!useDB) {
        Plant_Snapshot.init(ibmsDataBlockJson, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log(`success fully merged`);
            // console.log(c.bgBlueBright)
            loaderStarted = true;
            cpmUtils.sudhu(`AFTER  init${JSON.stringify(ibmsDataBlockJson)}`);
            const jsonString = JSON.stringify(ibmsDataBlockJson, null, 2);
            fs.writeFile(filePath, jsonString, (writeErr) => {
              if (writeErr) {
                console.error("Error writing file:", writeErr);
              } else {
                console.log("=========File written successfully!!!!!!!");
              }
            });
          }
        });
        // output the parsed data
      }
      cpmUtils.myDebug(
        cpmUtils.getJSONElement(ibmsDataBlockJson, ["CPM_SCENARIOS"])
      );
    } catch (err) {
      cpmUtils.myError("Error while parsing JSON data:", err);
    }
  });
  //read data from plant preparation
  // Plant_Snapshot.init(ibmsDataBlockJson,cpmUtils.consoleLog);
  // console.log(cpmUtils.myPrint(ibmsDataBlockJson))
}

// function initializePs(){
// 	console.log(c.bgBlueBright(`before ${JSON.stringify(ibmsDataBlockJson)}`))
// 	Plant_Snapshot.init(ibmsDataBlockJson,(err,res)=>{
// 		if(res){
// 			loaderStarted=true
// 			console.log(c.bgBlueBright(`AFTER blue initializePs ${JSON.stringify(ibmsDataBlockJson)}`))
// 		}
// 	})
// 	// Plant_Snapshot.testData(mydata,(err,res)=>{
// 	// 	if(res){console.log(c.bgBlueBright(`AFTER ${JSON.stringify(mydata)}`))}
// 	// })
// }

function getPlantSnapshotDataItem(itemSpec = [], ignorable = false) {
  return cpmUtils.getJSONElement(ibmsDataBlockJson, itemSpec, ignorable);
}

function getSiteSpecificDataItem(itemSpec = [], ignorable = false) {
  return cpmUtils.getJSONElement(ibmsDataBlockJson, itemSpec, ignorable);
}

// function updateFunction (a,b) {  return a + b;};
function myUpdateFunction(a, b) {
  return b;
}

// https://stackoverflow.com/questions/16384295/updating-javascript-object-recursively
function recurse(initial, update) {
  for (prop in update) {
    // cpmUtils.myError(`prop in update: ${prop}`);
    if (
      {}.hasOwnProperty.call(initial, prop) &&
      {}.hasOwnProperty.call(update, prop)
    ) {
      // cpmUtils.myError(`updating prop in initial: ${prop}`);
      if (
        typeof initial[prop] === "object" &&
        typeof update[prop] === "object"
      ) {
        recurse(initial[prop], update[prop]);
      } else {
        initial[prop] = myUpdateFunction(initial[prop], update[prop]);
      }
    }
  }
}

function setSiteSpecificDataItems(updatesRequired = {}) {
  recurse(ibmsDataBlockJson, updatesRequired);
  // cpmUtils.myError(`Currently Active Scenario: ${cpmUtils.myPrint(cpmU["Active_Scenario"])}`);
}

function setPlantSnapshotDataItem(updatesRequired = {}) {
  recurse(ibmsDataBlockJson, updatesRequired);
  // cpmUtils.myError(`Currently Active Scenario: ${cpmUtils.myPrint(cpmU["Active_Scenario"])}`);
}

function checkChildComponentCriteria(complexEqp, complexCriteria) {
  let result = true;
  // cpmUtils.myError(`checkChildComponentCriteria - with criteria: ${cpmUtils.myPrint(complexCriteria)}`);
  // Identify the Equipment to be started based on the guidelines
  // Unable to process JSON: Eqp_Attributes, CH_SS, presentValue
  // Unable to process JSON: Eqp_Attributes, CH_Trip_SS, presentValue
  // Unable to process JSON: Eqp_Attributes, CH_AM_SS, presentValue
  let eqpIds = [];
  let actual,
    expected,
    eqpType,
    myeqp,
    typedEqps,
    myAttrs,
    myattr,
    error = null,
    childrenOk = true;
  let myCriteria = cpmUtils.getJSONElement(
    complexCriteria,
    ["EQP_COMPONENTS"],
    true
  );
  if (myCriteria !== null) {
    for (eqpType in myCriteria) {
      typedEqps = cpmUtils.getJSONElement(complexEqp, [
        "EQP_COMPONENTS",
        eqpType,
      ]);
      if (typedEqps !== null)
        for (myeqp in typedEqps) {
          cpmUtils.myDebug(
            `checkChildComponentCriteria - with criteria: ${eqpType} ${myeqp}`
          );
          myAttrs = cpmUtils.getJSONElement(myCriteria, [
            eqpType,
            "Eqp_Attributes",
          ]);
          for (myattr in myAttrs) {
            expected = cpmUtils.getJSONElement(myCriteria, [
              eqpType,
              "Eqp_Attributes",
              myattr,
            ]);
            actual = cpmUtils.getJSONElement(typedEqps[myeqp], [
              "Eqp_Attributes",
              myattr,
              "presentValue",
            ]);
            // cpmUtils.myError(`findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`);
            if (actual != null)
              switch (expected) {
                case 0:
                case 1:
                case true:
                case false:
                  if (expected !== actual) {
                    // do not focus
                    cpmUtils.myTempDebug(
                      `Removing Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                    );
                    result = false; // Keeping this so that child components need not be checked
                  }
                  break;
                case "LEAST":
                  break;
                default:
                  error = `checkChildComponentCriteria - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                  break;
              }
            if (result === false) break;
          }
          if (result === false) break;
        }
      if (result === false) break;
    }
  }
  return result;
}

// Sample  - let criteria = {"EQUIPMENT_TYPE":"NONGL_SS_CHILLER", "Eqp_Attributes": {"CH_SS":0, "CH_Trip_SS":0, "CH_AM_SS":1},"Eqp_Metrics": {"Run_Hours": "LEAST", "Equipment_Faulty": false}}
function findTheEquipmentForScenario(myFindCriteria, updateFaulty = null) {
  console.log("Criteria******", myFindCriteria);
  cpmUtils.sudhu("i came here to find CTF");
  cpmUtils.myDebug(
    `findTheEquipmentForScenario - with criteria: ${cpmUtils.myPrint(
      myFindCriteria
    )}`
  );
  cpmUtils.myTable(myFindCriteria);

  // Identify the Equipment to be started based on the guidelines
  let eqpIds = [];
  let actual,
    expected,
    error = null,
    childrenOk = true;

  let typedEqps = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    myFindCriteria["EQUIPMENT_TYPE"],
  ]);
  // let typedEqps = getSiteSpecificDataItem(["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"]]);
  // console.log("------------>typedEqps",typedEqps)
  let minRunHourEqp = null;
  let leastRunHoursValue = Infinity;

  if (typedEqps !== null)
    for (myeqp in typedEqps) {
      if (updateFaulty !== null && myeqp === updateFaulty) continue;

      for (myattr in myFindCriteria["Eqp_Attributes"]) {
        let expected = myFindCriteria["Eqp_Attributes"][myattr];
        actual = cpmUtils.getJSONElement(
          typedEqps[myeqp],
          ["Eqp_Attributes", myattr, "presentValue"],
          true
        );
        cpmUtils.sudhu(`data handler findEQP ${actual}==${myattr}==`);
        if (actual === "active") {
          actual = 1;
        } else if (actual === "inactive") {
          actual = 0;
        }
        // cpmUtils.myError(`findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`);
        if (actual !== null)
          switch (expected) {
            case 0:
            case 1:
            case true:
            case false:
              if (expected === actual) {
                // keep in focus
                if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                cpmUtils.myTempDebug(
                  `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
              } else {
                // do not focus
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                cpmUtils.myTempDebug(
                  `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
                childrenOk = false; // Keeping this so that child components need not be checked
              }
              break;
            default:
              error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
              break;
          }
        if (childrenOk === false) break;
      }

      if (childrenOk === true)
        for (myattr in myFindCriteria["Eqp_Metrics"]) {
          expected = myFindCriteria["Eqp_Metrics"][myattr];
          actual = cpmUtils.getJSONElement(
            typedEqps[myeqp],
            ["Eqp_Metrics", myattr],
            true
          );
          if (actual !== null)
            switch (expected) {
              case 0:
              case 1:
              case true:
              case false:
                if (expected === actual) {
                  // keep in focus
                  if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                  cpmUtils.myTempDebug(
                    `Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                } else {
                  // do not focus

                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  cpmUtils.myTempDebug(
                    `Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                  childrenOk = false; // Keeping this so that child components need not be checked
                }
                break;
              case "LEAST":
                break;

              default:
                error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                break;
            }
          if (childrenOk === false) break;
        }
      // typedEqps[myeqp]
      if (childrenOk === true) {
        childrenOk = checkChildComponentCriteria(
          typedEqps[myeqp],
          myFindCriteria
        );
        if (childrenOk === true) {
          // keep in focus
          if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(typedEqps[myeqp]);
        } else {
          // do not focus
          if (eqpIds.indexOf(myeqp) !== -1)
            eqpIds.splice(eqpIds.indexOf(typedEqps[myeqp]), 1);
        }
      }

      childrenOk = true;
    }
  // Handle Metrics
  // Handle updating faulty equipment
  if (updateFaulty !== null)
    if (
      cpmUtils.getJSONElement(ibmsDataBlockJson, [
        "Plant_Snapshot",
        myFindCriteria["EQUIPMENT_TYPE"],
        updateFaulty,
        "Eqp_Metrics",
        "Equipment_Faulty",
      ]) === false
    ) {
      ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][
        updateFaulty
      ]["Eqp_Metrics"]["Equipment_Faulty"] = true;
    } else {
      cpmUtils.myError(
        `findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`
      );
    }
  console.log("EQP IDS*******", eqpIds);
  for (myeqp in eqpIds) {
    // cpmUtils.myError(`findTheEquipmentForScenario - Identified Eqp:${eqpIds[myeqp]} ${cpmUtils.myPrint(typedEqps[eqpIds[myeqp]])}`);
    // console.log("MY DEV DATA",JSON.stringify(cpmUtils.getJSONElement(ibmsDataBlockJson,["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"],eqpIds[myeqp]])))
    let runHours = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
      eqpIds[myeqp],
      "Eqp_Metrics",
      "rh_cumulative",
    ]);
    console.log("*********Run hours*********", runHours, " : ", eqpIds[myeqp]);
    if (runHours !== null && runHours < leastRunHoursValue) {
      leastRunHoursValue = runHours;
      minRunHourEqp = eqpIds[myeqp];
    }
  }
  // Update the working equipment
  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = minRunHourEqp;
    setSiteSpecificDataItems(ongoingScenario);
    // setSiteSpecificDataItems({ "Active_Scenario": { "Working_On_Equipment": { "NONGL_SS_CHILLER": eqpIds[0] } } });
  } else {
    error = `findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`;
  }

  // if (error) {
  // 	// Log error and process error
  // 	mycallback(error, null);
  // }
  // if (success) {
  // 	// Log success and process success
  // 	mycallback(null, success);
  // }
  return error !== null ? error : true;
}

//03-05-2024
function findTheEquipmentForStopScenario(myFindCriteria, updateFaulty = null) {
  console.log("Criteria******", myFindCriteria);
  cpmUtils.sudhu("i came here to find STOP series");
  cpmUtils.myDebug(
    `findTheEquipmentForScenario - with criteria: ${cpmUtils.myPrint(
      myFindCriteria
    )}`
  );
  cpmUtils.myTable(myFindCriteria);
  // cpmUtils.sudhu(`param_id${cpmUtils.getJSONElement(myFindCriteria,["Eqp_Metrics","measured_time"])}`)
  // Identify the Equipment to be started based on the guidelines
  let eqpIds = [];
  let actual,
    expected,
    error = null,
    childrenOk = true;

  let typedEqps = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    myFindCriteria["EQUIPMENT_TYPE"],
  ]);
  // let typedEqps = getSiteSpecificDataItem(["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"]]);
  // console.log("------------>typedEqps",typedEqps)
  // let minTime = Infinity;
  // let minId = null;
  let minRunHourEqp = Infinity;
  let leastRunHoursValue = Infinity;
  function parseTime(timeStr) {
    return new Date(timeStr);
  }

  if (typedEqps !== null)
    for (myeqp in typedEqps) {
      if (updateFaulty !== null && myeqp === updateFaulty) continue;

      for (myattr in myFindCriteria["Eqp_Attributes"]) {
        let expected = myFindCriteria["Eqp_Attributes"][myattr];
        actual = cpmUtils.getJSONElement(
          typedEqps[myeqp],
          ["Eqp_Attributes", myattr, "presentValue"],
          true
        );
        cpmUtils.sudhu(`data hamdler findEQP ${actual}==${myattr}==`);
        if (actual === "active") {
          actual = 1;
        } else if (actual === "inactive") {
          actual = 0;
        }
        // cpmUtils.myError(`findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`);
        if (actual !== null)
          switch (expected) {
            case 0:
            case 1:
            case true:
            case false:
              console.log(
                `actual----${actual}====in case======from plant expected ---${expected}`
              );
              if (expected === actual) {
                // keep in focus
                console.log(`keep in focus`);
                if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                cpmUtils.myTempDebug(
                  `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
              } else {
                // do not focus
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                cpmUtils.myTempDebug(
                  `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
                childrenOk = false; // Keeping this so that child components need not be checked
              }
              break;
            default:
              error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
              break;
          }
        if (childrenOk === false) break;
      }

      if (childrenOk === true)
        for (myattr in myFindCriteria["Eqp_Metrics"]) {
          expected = myFindCriteria["Eqp_Metrics"][myattr];
          actual = cpmUtils.getJSONElement(
            typedEqps[myeqp],
            ["Eqp_Metrics", myattr],
            true
          );
          if (actual !== null)
            switch (expected) {
              case 0:
              case 1:
              case true:
              case false:
                if (expected === actual) {
                  // keep in focus
                  if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                  cpmUtils.myTempDebug(
                    `Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                } else {
                  // do not focus

                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  cpmUtils.myTempDebug(
                    `Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                  childrenOk = false; // Keeping this so that child components need not be checked
                }
                break;
              case "LEAST":
                break;

              default:
                error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                break;
            }
          if (childrenOk === false) break;
        }
      // typedEqps[myeqp]
      if (childrenOk === true) {
        childrenOk = checkChildComponentCriteria(
          typedEqps[myeqp],
          myFindCriteria
        );
        if (childrenOk === true) {
          // keep in focus
          if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(typedEqps[myeqp]);
        } else {
          // do not focus
          if (eqpIds.indexOf(myeqp) !== -1)
            eqpIds.splice(eqpIds.indexOf(typedEqps[myeqp]), 1);
        }
      }

      childrenOk = true;
    }
  // Handle Metrics
  // Handle updating faulty equipment
  // if (updateFaulty !== null)
  // 	if (cpmUtils.getJSONElement(ibmsDataBlockJson, ["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"],
  // 		updateFaulty, "Eqp_Metrics", "Equipment_Faulty"]) === false) {
  // 		ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][updateFaulty]["Eqp_Metrics"]["Equipment_Faulty"]
  // 			= true;
  // 	} else {
  // 		cpmUtils.myError(`findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`);
  // 	}
  console.log("EQP IDS*******", eqpIds);
  for (myeqp in eqpIds) {
    // cpmUtils.myError(`findTheEquipmentForScenario - Identified Eqp:${eqpIds[myeqp]} ${cpmUtils.myPrint(typedEqps[eqpIds[myeqp]])}`);
    console.log("my epId", eqpIds[myeqp]);
    // console.log("MY DEV DATA",JSON.stringify(cpmUtils.getJSONElement(ibmsDataBlockJson,["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"],eqpIds[myeqp]])))
    let param_id = cpmUtils.getJSONElement(myFindCriteria, [
      "Eqp_Metrics",
      "measured_time",
    ]);
    let measured_time = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
      eqpIds[myeqp],
      "Eqp_Attributes",
      param_id,
      "measured_time",
    ]);
    cpmUtils.sudhu(
      `-------------------${JSON.stringify(
        measured_time
      )}----metime---- ---------`
    );
    const time = parseTime(measured_time);
    cpmUtils.sudhu(`if (${time} < ${minRunHourEqp})`);
    if (time < minRunHourEqp) {
      console.log(`insed time IF `);
      leastRunHoursValue = time;
      minRunHourEqp = eqpIds[myeqp];
      console.log(`minrunEqp ${minRunHourEqp}`);
    }
    // console.log("*********Run hours*********",runHours," : ",eqpIds[myeqp]);
    // if (runHours !== null && runHours < leastRunHoursValue) {
    // 	leastRunHoursValue = runHours;
    // 	minRunHourEqp = eqpIds[myeqp];
    // }
  }
  // Update the working equipment
  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = minRunHourEqp;
    setSiteSpecificDataItems(ongoingScenario);
    // setSiteSpecificDataItems({ "Active_Scenario": { "Working_On_Equipment": { "NONGL_SS_CHILLER": eqpIds[0] } } });
  } else {
    error = `findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`;
  }

  // if (error) {
  // 	// Log error and process error
  // 	mycallback(error, null);
  // }
  // if (success) {
  // 	// Log success and process success
  // 	mycallback(null, success);
  // }
  return error !== null ? error : true;
}
// Sample  - let criteria = {"EQUIPMENT_TYPE":"NONGL_SS_CHILLER", "Eqp_Attributes": {"CH_SS":0, "CH_Trip_SS":0, "CH_AM_SS":1},"Eqp_Metrics": {"Run_Hours": "LEAST", "Equipment_Faulty": false}}
function findTheEquipmentForScenarioSeries(myFindCriteria, updateFaulty) {
  console.log("Criteria******", myFindCriteria);
  cpmUtils.myDebug(
    `findTheEquipmentForScenario - with criteria: ${cpmUtils.myPrint(
      myFindCriteria
    )}`
  );
  cpmUtils.myTable(myFindCriteria);

  let eqpIds = [];
  let actual,
    expected,
    error = null,
    childrenOk = true;
  let typeEqps = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    myFindCriteria["EQUIPMENT_TYPE"],
  ]);
  if (typeEqps !== null) {
    for (myeqp in typeEqps) {
      // if ((updateFaulty!==null) && (myeqp === updateFaulty)) continue;
      for (series in myFindCriteria["Eqp_Metrics"]) {
        if (series === "SERIES_A") {
          for (myattr in myFindCriteria["Eqp_Attributes"]) {
            let expected = myFindCriteria["Eqp_Attributes"][myattr];
            let actual = getSiteSpecificDataItem([
              "Plant_Snapshot",
              typeEqps[myeqp],
              "Eqp_Attributes",
              myattr,
              "presentValue",
            ]);
            if (actual === "active") {
              actual = 1;
            } else if (actual === "inactive") {
              actual = 0;
            }
            if (actual !== null)
              switch (expected) {
                case 0:
                case 1:
                case true:
                case false:
                  if (expected === actual) {
                    // keep in focus
                    if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                    cpmUtils.myTempDebug(
                      `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                    );
                  } else {
                    // do not focus
                    if (eqpIds.indexOf(myeqp) !== -1)
                      eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                    cpmUtils.myTempDebug(
                      `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                    );
                    childrenOk = false; // Keeping this so that child components need not be checked
                  }
                  break;
                default:
                  error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                  break;
              }
            if (childrenOk === false) break;
          }
        }
      }
    }
  }
  console.log("****EQP IDS", eqpIds);
  if (updateFaulty !== null)
    if (
      cpmUtils.getJSONElement(ibmsDataBlockJson, [
        "Plant_Snapshot",
        myFindCriteria["EQUIPMENT_TYPE"],
        updateFaulty,
        "Eqp_Metrics",
        "Equipment_Faulty",
      ]) === false
    ) {
      ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][
        updateFaulty
      ]["Eqp_Metrics"]["Equipment_Faulty"] = true;
    } else {
      cpmUtils.myError(
        `findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`
      );
    }

  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = eqpIds[0];
    setSiteSpecificDataItems(ongoingScenario);
    // setSiteSpecificDataItems({ "Active_Scenario": { "Working_On_Equipment": { "NONGL_SS_CHILLER": eqpIds[0] } } });
  } else {
    error = `findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`;
  }

  return true;
}

// Sample transition to VALVE_TURN_ON_REQUESTED: required to get the details of BACnet device address, objectId and newValue
// let myaction = {"EQUIPMENT_TYPE":"NONGL_SS_CHILLER", "Eqp_Attributes": {"CH_Vlv_On_Off":1}, "ACTION_REQUIRED":"write"}
function getDetailsForStateTransition(myaction) {
  let myequipment = getSiteSpecificDataItem([
    "Active_Scenario",
    "Working_On_Equipment",
    myaction["EQUIPMENT_TYPE"],
  ]);
  if (typeof myequipment == "string") {
    console.log(`my equpiment ${myequipment}`);
    let myWriteCmd =
      "http://localhost:7080/" +
      cpmUtils.getJSONElement(myaction, ["ACTION_REQUIRED"]) +
      "/";
    myWriteCmd += getSiteSpecificDataItem([
      "Plant_Snapshot",
      myaction["EQUIPMENT_TYPE"],
      myequipment,
      "BACnetDeviceAddress",
    ]);

    //http://localhost:7080/write/192.168.1.31/null/presentValue/1

    if (myequipment)
      for (myattr in myaction["Eqp_Attributes"]) {
        let myObjId = getSiteSpecificDataItem([
          "Plant_Snapshot",
          myaction["EQUIPMENT_TYPE"],
          myequipment,
          "Eqp_Attributes",
          myattr,
          "objId",
        ]);

        let value = "";

        if (myaction["Eqp_Attributes"][myattr] === 1) {
          value = "active";
        } else {
          value = "inactive";
        }

        myWriteCmd += `/${myObjId}/presentValue/${value}/-/8`;
      }

    // cpmUtils.mySuccess(`getDetailsForStateTransition - BACnet Command: ${myWriteCmd}`);
    console.log(c.bgBlueBright(`${myWriteCmd}`));
    // var success = false;
    cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
      if (err) {
        console.log("error");
      } else {
        console.log(res);
        // success = true;
      }
    });
  } else {
    myequipment.forEach((i) => {
      console.log(`my foreach ${i}`);
      let myWriteCmd =
        "http://localhost:7080/" +
        cpmUtils.getJSONElement(myaction, ["ACTION_REQUIRED"]) +
        "/";
      myWriteCmd += getSiteSpecificDataItem([
        "Plant_Snapshot",
        myaction["EQUIPMENT_TYPE"],
        i,
        "BACnetDeviceAddress",
      ]);

      //http://localhost:7080/write/192.168.1.31/null/presentValue/1

      if (i)
        for (myattr in myaction["Eqp_Attributes"]) {
          let myObjId = getSiteSpecificDataItem([
            "Plant_Snapshot",
            myaction["EQUIPMENT_TYPE"],
            i,
            "Eqp_Attributes",
            myattr,
            "objId",
          ]);

          let value = "";

          if (myaction["Eqp_Attributes"][myattr] === 1) {
            value = "active";
          } else {
            value = "inactive";
          }

          myWriteCmd += `/${myObjId}/presentValue/${value}`;
        }

      // cpmUtils.mySuccess(`getDetailsForStateTransition - BACnet Command: ${myWriteCmd}`);
      console.log(c.bgBlueBright(`${myWriteCmd}`));
      // var success = false;
      cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
        if (err) {
          console.log("error");
        } else {
          console.log(res);
          // success = true;
        }
      });
    });
  }
  // let myWriteCmd = 'http://localhost:7080/'+cpmUtils.getJSONElement(myaction, ["ACTION_REQUIRED"]) + '/';
  // myWriteCmd += getSiteSpecificDataItem([
  // 	"Plant_Snapshot",
  // 	myaction["EQUIPMENT_TYPE"],
  // 	myequipment,
  // 	"BACnetDeviceAddress"
  // ]);

  // //http://localhost:7080/write/192.168.1.31/null/presentValue/1

  // if (myequipment) for (myattr in myaction["Eqp_Attributes"]) {
  // 	let myObjId = getSiteSpecificDataItem([
  // 		"Plant_Snapshot",
  // 		myaction["EQUIPMENT_TYPE"],
  // 		myequipment,
  // 		"Eqp_Attributes",
  // 		myattr,
  // 		"objId"
  // 	]);

  // 	let value = "";

  // 	if(myaction["Eqp_Attributes"][myattr] === 1){
  // 		value = 'active';
  // 	}
  // 	else{
  // 		 value = 'inactive';
  // 	}

  // 	myWriteCmd += `/${myObjId}/presentValue/${value}/-/8`;
  // }

  // cpmUtils.mySuccess(`getDetailsForStateTransition - BACnet Command: ${myWriteCmd}`);
  // console.log(c.bgBlueBright(`${myWriteCmd}`));
  // // var success = false;
  // cpmEventsActions.executePbsReq(myWriteCmd,(err,res)=>{
  // 	if(err){
  // 		console.log("error")
  // 	}else{
  // 		console.log(res);
  // 		// success = true;
  // 	}
  // });
  // // console.log(c.bgGreenBright(`${success}`));
  // // return success;
  return true; // return 'Unable to write...'; //
}

// let myaction = {"EQUIPMENT_TYPE":"NONGL_SS_CHILLER", "Eqp_Attributes": {"CH_Vlv_On_Off_SS":1}, "ACTION_REQUIRED":"snapshot_check"}

function snapshotCheck(criteria) {
  let myequipment = getSiteSpecificDataItem([
    "Active_Scenario",
    "Working_On_Equipment",
    criteria["EQUIPMENT_TYPE"],
  ]);
  let expected;
  for (myattr in criteria["Eqp_Attributes"]) {
    //getJSONelement -- to read my value.
    let myValue = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      criteria["EQUIPMENT_TYPE"],
      myequipment,
      "Eqp_Attributes",
      myattr,
      "presentValue",
    ]);
    expected = criteria["Eqp_Attributes"][myattr];
    console.log("INSIDE SNAPSHOT SCHECK", myattr, myValue);

    if (expected === 0) {
      expected = "inactive";
    } else if (expected === 1) {
      expected = "active";
    }

    if (myValue === 0) {
      myValue = "inactive";
    } else if (myValue === 1) {
      myValue = "active";
    }

    if (expected === myValue) {
      console.log("****Success*****");
      return true;
    } else {
      console.log("***Mismatch*****");
      return false;
    }
  }
  return true;
}

function startActiveScenario(
  scenarioType,
  scenarioParams = null,
  mycallback = null
) {
  if (mycallback === null) mycallback = cpmUtils.consoleLog;
  if (
    ibmsDataBlockJson === null ||
    cpmUtils.getJSONElement(ibmsDataBlockJson, ["Active_Scenario"] == null)
  ) {
    mycallback(
      `startActiveScenario-Looks like CPM is not yet initialized. Please check.`
    );
  } else {
    let ongoingScenarioId = getSiteSpecificDataItem([
      "Active_Scenario",
      "Working_Scenario_Id",
    ]);
    if (ongoingScenarioId === "scenario_uuid") {
      // prepare request uuid and respond with uuid and timestamp
      ibmsDataBlockJson["Active_Scenario"][
        "Working_Scenario_Type"
      ] = scenarioType;
      ibmsDataBlockJson["Active_Scenario"][
        "Working_Scenario_Id"
      ] = cpmUtils.getUUID();
      ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"] =
        "SCENARIO_STARTED";
      ibmsDataBlockJson["Active_Scenario"][
        "State_Change_Timestamp"
      ] = cpmUtils.getCurrentTime();
      for (let eqpType in ibmsDataBlockJson["Active_Scenario"][
        "Working_On_Equipment"
      ]) {
        ibmsDataBlockJson["Active_Scenario"]["State_Change_Timestamp"][
          eqpType
        ] = "";
      }
      mycallback(null, ibmsDataBlockJson["Active_Scenario"]);
    } else {
      mycallback(
        `startActiveScenario-Working with a Scenario ${ongoingScenarioId}; Please wait...`
      );
    }
  }
}

function updateActiveScenarioParameter(param, value, mycallback = null) {
  if (mycallback === null) mycallback = cpmUtils.consoleLog;
  if (getActiveScenario() === null) {
    mycallback(
      `updateActiveScenarioParameter-Looks like CPM is not yet initialized. Please check.`
    );
  } else {
    let ongoingScenarioId = getSiteSpecificDataItem([
      "Active_Scenario",
      "Working_Scenario_Id",
    ]);
    if (ongoingScenarioId !== "scenario_uuid") {
      if (param === "Scenario_Current_State") {
        if (
          getSiteSpecificDataItem(
            ["Active_Scenario", "Working_Scenario_Priority"],
            true
          ) === 0 &&
          (value === "SCENARIO_COMPLETED" || value === "SCENARIO_ABORTED")
        ) {
          // Log details of Fault Handling
          ibmsDataBlockJson["Active_Scenario"] = {};
          ibmsDataBlockJson["Active_Scenario"] = JSON.parse(
            JSON.stringify(ibmsDataBlockJson["Paused_Scenario"])
          );
        } else {
          ibmsDataBlockJson["Active_Scenario"]["Scenario_Previous_State"] =
            ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"];
          ibmsDataBlockJson["Active_Scenario"][
            "Scenario_Current_State"
          ] = value;
          ibmsDataBlockJson["Active_Scenario"][
            "State_Change_Timestamp"
          ] = cpmUtils.getCurrentTime();
        }
      } else {
        ibmsDataBlockJson["Active_Scenario"][param] = value;
      }
      mycallback(null, ibmsDataBlockJson["Active_Scenario"]);
    } else {
      mycallback(
        `updateActiveScenarioParameter-Looks like there is No Active Scenario. Please wait...`
      );
    }
  }
}

function updateActiveScenarioEquipment(eqpType, eqpId, mycallback = null) {
  if (mycallback === null) mycallback = cpmUtils.consoleLog;
  // if ((ibmsDataBlockJson === null) || cpmUtils.getJSONElement(ibmsDataBlockJson, ["Active_Scenario"] == null)) {
  if (getActiveScenario() === null) {
    mycallback(
      `updateActiveScenarioParameter-Looks like CPM is not yet initialized. Please check.`
    );
  } else {
    let ongoingScenarioId = getSiteSpecificDataItem([
      "Active_Scenario",
      "Working_Scenario_Id",
    ]);
    let eqpIdNow = getSiteSpecificDataItem([
      "Active_Scenario",
      "Working_On_Equipment",
      eqpType,
    ]);
    if (ongoingScenarioId !== "scenario_uuid" && eqpIdNow !== "") {
      ibmsDataBlockJson["Active_Scenario"]["Working_On_Equipment"][
        eqpType
      ] = value;
      mycallback(null, ibmsDataBlockJson["Active_Scenario"]);
    } else {
      mycallback(
        `updateActiveScenarioParameter-Unable to update Active Scenario Equipment type-${eqpType} Id-${eqpId}`
      );
    }
  }
}

function prepareEquipmentFaultHandlingScenario(
  scenarioType,
  scenarioParams = null,
  mycallback = null
) {
  if (mycallback === null) mycallback = cpmUtils.consoleLog;
  if (getActiveScenario() === null) {
    mycallback(
      `prepareEquipmentFaultHandlingScenario-Looks like CPM is not yet initialized. Please check.`
    );
  } else {
    let ongoingScenarioId = getSiteSpecificDataItem([
      "Active_Scenario",
      "Working_Scenario_Id",
    ]);

    // Copy Active Scenario to a PausedScenario object to handle Equipment Fault
    ibmsDataBlockJson["Paused_Scenario"] = JSON.parse(
      JSON.stringify(ibmsDataBlockJson["Active_Scenario"])
    );
    // prepare request uuid and respond with uuid and timestamp
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Priority"] = 0;
    ibmsDataBlockJson["Active_Scenario"][
      "Working_Scenario_Type"
    ] = scenarioType;
    ibmsDataBlockJson["Active_Scenario"][
      "Working_Scenario_Id"
    ] = cpmUtils.getUUID();
    ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"] =
      "SCENARIO_STARTED";
    ibmsDataBlockJson["Active_Scenario"][
      "State_Change_Timestamp"
    ] = cpmUtils.getCurrentTime();
    for (let eqpType in ibmsDataBlockJson["Active_Scenario"][
      "Working_On_Equipment"
    ]) {
      ibmsDataBlockJson["Active_Scenario"]["State_Change_Timestamp"][eqpType] =
        "";
    }
    mycallback(null, ibmsDataBlockJson["Active_Scenario"]);
  }
}

function resumeActiveScenarioAfterFaultHandling(
  param,
  value,
  mycallback = null
) {
  cpmUtils.mySuccess(
    `resumeActiveScenarioAfterFaultHandling: ${param} ${value}`
  );
  if (
    param === "Scenario_Current_State" &&
    (value === "SCENARIO_COMPLETED" || value === "SCENARIO_ABORTED")
  ) {
    if (
      getSiteSpecificDataItem(
        ["Active_Scenario", "Working_Scenario_Priority"],
        true
      ) !== null
    ) {
      // Log details of Fault Handling
      ibmsDataBlockJson["Active_Scenario"] = {};
      ibmsDataBlockJson["Active_Scenario"] = JSON.parse(
        JSON.stringify(ibmsDataBlockJson["Paused_Scenario"])
      );
      mycallback(null, true);
    }
  }
  // mycallback(true);
}

function getCPMSnapshot(objectPerEquipmentType = true) {
  let mySnapshot = {
    processParameters: {},
    activeScenario: {},
    equipmentStatus: {},
  };
  let myoutput = "getCPMSnapshot---------------";
  let mycolumns = [
    "EQUIPMENT_TYPE",
    "EQUIPMENT_ID",
    "EQUIPMENT_NAME",
    "ON_OFF",
    "Trip_Status",
    "Auto_Manual",
    "Faulty",
  ];
  let eqpId,
    eqpType,
    myeqp,
    myvalues = [],
    mytemp;
  let myProcessParameter = ["Eqp_Attributes", "CWH_ST", "presentValue"];
  let myparams = {
    NONGL_SS_CHILLER: ["CH_On_Off", "CH_Trip_SS", "CH_AM_SS"],
    NONGL_SS_PUMPS: ["Pri_Pmp_On_Off", "Pri_Pmp_Trip_SS", "Pri_Pmp_AM_SS"],
    // "NONGL_SS_PRIMARY_VARIABLE_PUMP":[],
    NONGL_SS_SECONDARY_PUMPS: [
      "Sec_Pmp_On_Off",
      "Sec_Pmp_Trip_SS",
      "Sec_Pmp_AM_SS",
    ],
    NONGL_SS_CONDENSER_PUMPS: [
      "Cnd_Pmp_On_Off",
      "Cnd_Pmp_Trip_SS",
      "Cnd_Pmp_AM_SS",
    ],
    NONGL_SS_COOLING_TOWER: [
      "CT_Out_Vlv_On_Off_Cmd",
      "Cnd_Pmp_Trip_SS",
      "CTW_High_Lvl",
    ],
    NONGL_SS_COOLING_TOWER_FAN: [
      "CT_Fan_On_Off_Cmd",
      "CT_Fan_Trip_SS",
      "CT_Fan_AM_SS",
    ],
    // "NONGL_SS_CT_VARIABLE_FAN":[],
    // "NONGL_SS_HEADER":[]
  };

  let processStatus = "success";

  mySnapshot["activeScenario"] = {
    Working_Scenario_Type:
      ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Type"],
    Scenario_Current_State:
      ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"],
  };
  if (
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Faulty"] &&
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Faulty"] === true
  ) {
    processStatus = "handleFailure";
    mySnapshot["activeScenario"]["Working_Scenario_Faulty"] =
      ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Faulty"];
  }

  mySnapshot["activeScenario"]["Expected_Next_State"] = cpmUtils.getJSONElement(
    ibmsDataBlockJson,
    [
      "CPM_Scenario_Flow",
      ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Type"],
      ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"],
      processStatus,
    ],
    true
  );

  for (eqpId in ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_HEADER"]) {
    myeqp = ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_HEADER"][eqpId];
    mySnapshot["processParameters"][eqpId] = cpmUtils.getJSONElement(
      myeqp,
      myProcessParameter,
      true
    );
  }
  for (eqpType in ibmsDataBlockJson["Plant_Snapshot"]) {
    if (objectPerEquipmentType === true) {
      mySnapshot["equipmentStatus"][eqpType] = {};
    } else {
      mySnapshot["equipmentStatus"]["columns"] = mycolumns;
    }

    if (eqpType in myparams) {
      for (eqpId in ibmsDataBlockJson["Plant_Snapshot"][eqpType]) {
        myeqp = ibmsDataBlockJson["Plant_Snapshot"][eqpType][eqpId];
        myvalues = [eqpType, eqpId, eqpId];
        for (let myp in myparams[eqpType]) {
          mytemp = cpmUtils.getJSONElement(
            myeqp,
            ["Eqp_Attributes", myparams[eqpType][myp], "presentValue"],
            true
          );
          mytemp !== null ? myvalues.push(mytemp) : myvalues.push("NA");
          // myvalues.push(cpmUtils.getJSONElement(myeqp, ["Eqp_Attributes", myparams[eqpType][myp], "presentValue"], true));
        }
        mytemp = cpmUtils.getJSONElement(myeqp, [
          "Eqp_Metrics",
          "Equipment_Faulty",
        ]);
        mytemp !== null ? myvalues.push(mytemp) : "NA";

        if (objectPerEquipmentType === true) {
          mySnapshot["equipmentStatus"][eqpType][eqpId] = myvalues;
        } else {
          mySnapshot["equipmentStatus"][eqpId] = myvalues;
        }
      }
    }
  }
  if (objectPerEquipmentType !== true) {
    cpmUtils.myTable(mySnapshot["processParameters"]);
    cpmUtils.myTable(mySnapshot["activeScenario"]);
    cpmUtils.myTable(mySnapshot["equipmentStatus"]);
  }
  return mySnapshot;
}

const sendDataToAlarms = (callback) => {
  callback(null, ibmsDataBlockJson);
};

const deviceType = {
  0x00: ["NONGL_SS_EMS", "em_", "_om_p"],
  0xa0: ["NONGL_SS_AHU", "ahu_", "_om_p"],
  0xb0: ["NONGL_SS_CHILLER", "ch_", "_om_p"],
  0xb1: ["NONGL_SS_PUMPS", "pu_", "_om_p"],
  0xb3: ["NONGL_SS_SECONDARY_PUMPS", "secpu_", "_om_p"],
  0xb4: ["NONGL_SS_CONDENSER_PUMPS", "condpu_", "_om_p"],
  0xb7: ["NONGL_SS_COOLING_TOWER", "ct_", "_om_p"],
  0xb5: ["NONGL_SS_VAV", "vav_", "_ahu_om_p"],
  0xb8: ["NONGL_SS_COOLING_TOWER_FAN", "ctf_", "_om_p"],
  // 0xB5: ['NONGL_SS_VAV', 'vav', '_om_p', 'ahu_']
};

const getLatestInMemoryData = (callback) => {
  axios
    .get(`https://localhost/v1/newapis/myibmssnapshot`)
    .then((response) => {
      // Handle success
      console.log("Data:", JSON.stringify(Object.keys(response.data)));
      callback(null, response.data);
    })
    .catch((err) => {
      // Handle error
      callback(err);
    });
};

const sendJSONToRunHour = (ss_type, callback) => {
  console.log("ss_type", ss_type);
  const results = [];
  getLatestInMemoryData((err, res) => {
    if (err) {
      callback(err);
    } else {
      const data = res;
      const snapshot = cpmUtils.getJSONElement(data);
      console.log("snapshot", snapshot);
      if (snapshot[ss_type]) {
        Object.values(snapshot[ss_type]).forEach((device) => {
          const obj = {
            id: device.id,
            BACnetDeviceAddress: device.BACnetDeviceAddress,
            ss_type: ss_type,
            table_name: getDBTableName(device.glSSId),
          };
          results.push(obj);
        });
      }
      if (results.length > 0) {
        callback(null, results);
      } else {
        callback(null, []);
      }
    }
  });
};
function getDBTableName(eqpParamHexCode) {
  eqpParamHexCode = Number.parseInt("0x".concat(eqpParamHexCode), 16);
  return getDBTableNameFromHex(eqpParamHexCode);
}
function getDBTableNameFromHex(eqpParamHexCode) {
  let devTypeNow = (0xff0000 & eqpParamHexCode) >> 16;
  if (deviceType[devTypeNow] == undefined) return -1;
  prefix = deviceType[devTypeNow][1];
  suffix = deviceType[devTypeNow][2];
  if ((0xc000 & eqpParamHexCode) === 0xc000) {
    tblCode = 0xff00fffff0 & eqpParamHexCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
  } else {
    tblCode = 0xffffff0000 & eqpParamHexCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
  }
  //console.log("--->",`${prefix}${tblCode.toString(16).toLowerCase().padStart(10, 0)}${suffix}`.toLowerCase())
  return `${prefix}${tblCode
    .toString(16)
    .toLowerCase()
    .padStart(10, 0)}${suffix}`.toLowerCase();
}
//   if (loaderStarted == false) initializePs((e, r) => {
// 	// processReadMultipleResponse(sudrmmSample, null);
// });

function processEquipmentCode(eqpCode, createEquipment = false) {
  let eqpCodeObject = { inputValid: true, errorCode: [] };
  let eqpParamCode,
    tblCode = 0,
    tblName = "";
  let paramCode = 0,
    paramName = "",
    devCode = 0,
    devType = "";
  let bValid = true,
    i,
    ssid,
    devIdCode = 0,
    myCodeStr;

  if (eqpCode.startsWith("GL")) {
    myCodeStr = eqpCode.substring(2).replace(/ /g, "");
    eqpParamCode = Number.parseInt("0x".concat(myCodeStr), 16);

    devCode = (0xff0000 & eqpParamCode) >> 16;
    if (devCode in deviceType) {
      devType = deviceType[devCode];
      eqpCodeObject["e_ss_type"] = devType[0];
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Invalid Equipment Type: " + devCode.toString(16)
      );
    }

    // parameter Code and table Code
    paramCode = 0xffffff & eqpParamCode;
    tblCode = 0xffffff0000 & eqpParamCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
    devIdCode = tblCode;
    // Handle Parameters of Child Objects
    // paramCode = ((0xC000 & paramCode) === 0xC000) ? (0xFFC00F & paramCode) : paramCode;
    if ((0xc000 & paramCode) === 0xc000) {
      paramCode &= 0xffc00f;
      tblCode = 0xff00fffff0 & eqpParamCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
      devIdCode = 0xfffffffff0 & eqpParamCode;
    }
    eqpCodeObject["e_address_value"] = devIdCode.toString(16).padStart(10, 0);
    eqpCodeObject["e_name"] = (devIdCode & 0xff000000) >> 24;

    if (devIdCode in deviceIds) {
      ssid = deviceIds[devIdCode];
      eqpCodeObject["e_id"] = ssid;
      eqpCodeObject["p_parent_eqp"] = ssid;
    } else if (createEquipment === true) {
      ssid = uuid();
      deviceIds[devIdCode] = ssid;
      eqpCodeObject["e_id"] = ssid;
      eqpCodeObject["p_parent_eqp"] = ssid;
      eqpCodeObject["createEquipment"] = true;
      // Create Equipment
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Undefined Equipment ID: " + devIdCode.toString(16)
      );
    }

    if (paramCode in deviceParams) {
      paramName = deviceParams[paramCode];
      eqpCodeObject["p_name"] = paramName;
      eqpCodeObject["p_description"] = myCodeStr;
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Invalid Parameter: " + paramCode.toString(16)
      );
    }
    tblName = `${devType[1]}${tblCode
      .toString(16)
      .toLowerCase()
      .padStart(10, 0)}${devType[2]}`.toLowerCase();
    eqpCodeObject["eqp_tableName"] = tblName;

    // mylog(`eqpParamCode, tblCode, tblName, paramCode, paramName, devCode, devType, bValid, ssid, devIdCode, myCodeStr, eqpCodeObject`);
    // console.log(eqpParamCode, tblCode, tblName, paramCode, paramName, devCode, devType, bValid, ssid, devIdCode, myCodeStr, eqpCodeObject);
    // mylog('eqpParamCode, tblCode, paramCode, devCode, devIdCode, myCodeStr');
    // printHex([eqpParamCode, tblCode, paramCode, devCode, devIdCode, myCodeStr]);
  } else {
    eqpCodeObject["inputValid"] = false;
    eqpCodeObject["errorCode"].push("Invalid Equipment Code");
  }
  return eqpCodeObject;
}

function preProcessBody(mybody) {
  let processedBody = {},
    mykey,
    data;
  let e_parent = true;
  let result = true;
  let glcodes = [];
  for (mykey in mybody) {
    switch (mykey) {
      case "myuuid":
        processedBody["reqUUID"] = mybody["myuuid"];
        break;
      case "measured_time":
        processedBody["measured_time"] = mybody["measured_time"];
        break;
      default:
        let counter = 0;
        processedBody["ip_address"] = mykey;
        for (gl in mybody[mykey]) {
          counter += 1;
          console.log(counter);
          if (mybody[mykey].hasOwnProperty(gl)) {
            glcodes.push(gl);
            //process equip code
            data = sc.data(gl);
            console.log(`data ${JSON.stringify(data)}`);
            //   if(data['e_ss_type'=== "NONGL_SS_COOLING_TOWER_FAN"]){
            // 	  e_parent = false;
            //   }
            //   {"inputValid":true,"errorCode":[],"e_ss_type":"NONGL_SS_HEADER","e_address_value":"0005b90000","e_name":5,"e_id":"8287f32d-bcc8-45dd-bff2-2fc26b96e529","p_parent_eqp":"8287f32d-bcc8-45dd-bff2-2fc26b96e529","createEquipment":true,"p_name":"CWH_ST","p_description":"240005b90678","eqp_tableName":"chhead_0005b90000_om_p"}
            if (data["e_ss_type"] === "NONGL_SS_HEADER") {
              updatePlantSnapshot(
                data["e_ss_type"],
                data["e_address_value"],
                data["p_name"],
                mybody[mykey][gl][1],
                e_parent
              );
            } else {
              updatePlantSnapshot(
                data["e_ss_type"],
                data["e_id"],
                data["p_name"],
                mybody[mykey][gl][1],
                e_parent
              );
            }
            console.log(data["e_ss_type"]);
            //   let scenarioId = getSiteSpecificDataItem(['Active_Scenario','Working_Scenario_Id'])
            //   	if( scenarioId ==='scenario_uuid'){
            // 	console.log("Scenario InActive");
            // 	result= false;
            //   }else{
            //   let myEqpTypes = getSiteSpecificDataItem(['EQUIPMENT_TYPE']);
            //   if (myEqpTypes.includes(data['e_ss_type'])) {
            // 		console.log(`Notification is for CPM.`);
            // 		// console.log(`--------->`,data); //Pri_Pmp_Run_SS
            // 		console.log(data['p_name']);
            // 		if(data['p_name'].includes('Trip')){
            // 			let tripStatus= getSiteSpecificDataItem(["Plant_Snapshot",data['e_ss_type'],data['e_address_value'],['Eqp_Attributes'],data['p_name'],'presentValue']);
            // 			if(tripStatus === 'active'){
            // 				//replace device with same type device which is available
            // 				console.log(c.bgBlueBright(`Raised Alarm in gl Alarm.`));
            // 				console.log(c.bgMagentaBright(gl));
            // 				//raise alarm in gl_alarm TABLE
            // 			}else{
            // 				console.log("Not Tripped.")
            // 			}
            // 		}else{
            // 			console.log("No Param to check Trip.")
            // 		}
            //   } else {
            // 	console.log(`Notification not for CPM.`);
            //   }
            // }
          }
        }
    }
  }
  return result;
}

function updatePlantSnapshot(e_type, e_id, p_name, p_value, e_parent) {
  console.log("**************UPDATE PLANTSNAPSHOT***********");
  // console.log("Before P Values ", json.stringify(ibmsDataBlockJson["Plant_Snapshot"]));
  if (e_parent === true) {
    let myparam = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      e_type,
      e_id,
      "Eqp_Attributes",
      p_name,
    ]);
    cpmUtils.myTable(myparam);
    ibmsDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name][
      "presentValue"
    ] = p_value;
    //   cpmDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name]["measured_time"] = measured_time;
    let modifiedparam = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      e_type,
      e_id,
      "Eqp_Attributes",
    ]);
    //   cpmUtils.myTable(modifiedparam);
  } else {
    // TBD
    //   {"inputValid":true,"errorCode":[],"e_ss_type":"NONGL_SS_HEADER","e_address_value":"0005b90000","e_name":5,"e_id":"8287f32d-bcc8-45dd-bff2-2fc26b96e529","p_parent_eqp":"8287f32d-bcc8-45dd-bff2-2fc26b96e529","createEquipment":true,"p_name":"CWH_ST","p_description":"240005b90678","eqp_tableName":"chhead_0005b90000_om_p"}
    ibmsDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name][
      "presentValue"
    ] = p_value;
    cpmUtils.myError("Handling Child Parameters - TBD");
  }
}

function findTheEquipmentForScenarioCT(myFindCriteria, updateFaulty = null) {
  console.log("Criteria******", myFindCriteria);
  cpmUtils.myDebug(
    `findTheEquipmentForScenario - with criteria: ${cpmUtils.myPrint(
      myFindCriteria
    )}`
  );
  cpmUtils.myTable(myFindCriteria);

  // Identify the Equipment to be started based on the guidelines
  let eqpIds = [];
  let typedEqps = {};
  let actual,
    expected,
    error = null,
    childrenOk = true;

  if (myFindCriteria["EQUIPMENT_TYPE"] == "NONGL_SS_COOLING_TOWER_FAN") {
    let ongoingScenario = getSiteSpecificDataItem(["Active_Scenario"]);
    cpmUtils.sudhu(`------${JSON.stringify(ongoingScenario)}========`);
    let ctId = cpmUtils.getJSONElement(ongoingScenario, [
      "Working_On_Equipment",
      "NONGL_SS_COOLING_TOWER",
    ]);
    cpmUtils.sudhu(`I AM CT id running ${ctId}-----`);
    typedEqps = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      "NONGL_SS_COOLING_TOWER",
      ctId,
      "EQP_COMPONENTS",
      myFindCriteria["EQUIPMENT_TYPE"],
    ]);
    console.log("-----CTF------->typedEqps", typedEqps);
    if (typedEqps !== null)
      for (myeqp in typedEqps) {
        if (updateFaulty !== null && myeqp === updateFaulty) continue;

        for (myattr in myFindCriteria["Eqp_Attributes"]) {
          let expected = myFindCriteria["Eqp_Attributes"][myattr];

          actual = cpmUtils.getJSONElement(
            typedEqps[myeqp],
            ["Eqp_Attributes", myattr, "presentValue"],
            true
          );
          cpmUtils.sudhu(`Actual ${myattr} ==> ${actual}`);
          cpmUtils.sudhu(`Expected ${myattr} ==> ${expected}`);

          if (actual === "active") {
            actual = 1;
          } else if (actual === "inactive") {
            actual = 0;
          }

          if (actual !== null)
            switch (expected) {
              case 0:
              case 1:
              case true:
              case false:
                // console.log(`actual----${actual}====in case======from plant expected ---${expected}`)
                if (expected === actual) {
                  // keep in focus
                  // console.log(`keep in focus`)
                  if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                  cpmUtils.myTempDebug(
                    `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                  );
                } else {
                  // do not focus
                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  cpmUtils.myTempDebug(
                    `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                  );
                  childrenOk = false; // Keeping this so that child components need not be checked
                }
                break;
              default:
                error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                break;
            }
        }
      }
    if (eqpIds.length > 0) {
      let ongoingScenario = { Active_Scenario: {} };
      ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
      ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
        myFindCriteria["EQUIPMENT_TYPE"]
      ] = eqpIds;
      setSiteSpecificDataItems(ongoingScenario);
      // setSiteSpecificDataItems({ "Active_Scenario": { "Working_On_Equipment": { "NONGL_SS_CHILLER": eqpIds[0] } } });
    } else {
      error = `findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`;
    }
  } else {
    console.log("inside ELSE");
    typedEqps = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
    ]);

    // let typedEqps = getSiteSpecificDataItem(["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"]]);
    console.log("-----else------->typedEqps", typedEqps);
    let minRunHourEqp = null;
    let leastRunHoursValue = Infinity;

    if (typedEqps !== null)
      for (myeqp in typedEqps) {
        if (updateFaulty !== null && myeqp === updateFaulty) continue;

        for (myattr in myFindCriteria["Eqp_Attributes"]) {
          let expected = myFindCriteria["Eqp_Attributes"][myattr];

          actual = cpmUtils.getJSONElement(
            typedEqps[myeqp],
            ["Eqp_Attributes", myattr, "presentValue"],
            true
          );
          cpmUtils.sudhu(`Actual ${myattr} ==> ${actual}`);
          cpmUtils.sudhu(`Expected ${myattr} ==> ${expected}`);

          // if(actual === 'active'){
          // 	actual = 1;
          // }else if(actual==='inactive'){
          // 	actual = 0;
          // }
          // cpmUtils.myError(`findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`);
          if (actual !== null)
            switch (expected) {
              case 0:
              case 1:
              case true:
              case false:
                // console.log(`actual----${actual}====in case======from plant expected ---${expected}`)
                if (expected === actual) {
                  // keep in focus
                  // console.log(`keep in focus`)
                  if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                  cpmUtils.myTempDebug(
                    `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                  );
                } else {
                  // do not focus
                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  cpmUtils.myTempDebug(
                    `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                  );
                  childrenOk = false; // Keeping this so that child components need not be checked
                }
                break;
              default:
                error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                break;
            }
          if (childrenOk === false) break;
        }

        // if (childrenOk === true) for (myattr in myFindCriteria["Eqp_Metrics"]) {
        // 	expected = myFindCriteria["Eqp_Metrics"][myattr];
        // 	actual = cpmUtils.getJSONElement(typedEqps[myeqp], ["Eqp_Metrics", myattr], true);
        // 	if (actual !== null) switch (expected) {
        // 		case 0: case 1: case true: case false:
        // 			if (expected === actual) {
        // 				// keep in focus
        // 				if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
        // 				cpmUtils.myTempDebug(`Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
        // 			} else {
        // 				// do not focus

        // 				if (eqpIds.indexOf(myeqp) !== -1) eqpIds.splice(eqpIds.indexOf(myeqp), 1);
        // 				cpmUtils.myTempDebug(`Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
        // 				childrenOk = false; // Keeping this so that child components need not be checked
        // 			}
        // 			break;
        // 			case "LEAST":
        // 			break;

        // 		default:
        // 			error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
        // 			break;
        // 	}
        // 	if (childrenOk === false) break;
        // }
        // typedEqps[myeqp]

        if (childrenOk === true) {
          childrenOk = checkChildComponentCriteria(
            typedEqps[myeqp],
            myFindCriteria
          );
          if (childrenOk === true) {
            // keep in focus
            if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(typedEqps[myeqp]);
          } else {
            // do not focus
            if (eqpIds.indexOf(myeqp) !== -1)
              eqpIds.splice(eqpIds.indexOf(typedEqps[myeqp]), 1);
          }
        }
        childrenOk = true;
      }

    // Handle Metrics
    // Handle updating faulty equipment
    if (updateFaulty !== null)
      if (
        cpmUtils.getJSONElement(ibmsDataBlockJson, [
          "Plant_Snapshot",
          myFindCriteria["EQUIPMENT_TYPE"],
          updateFaulty,
          "Eqp_Metrics",
          "Equipment_Faulty",
        ]) === false
      ) {
        ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][
          updateFaulty
        ]["Eqp_Metrics"]["Equipment_Faulty"] = true;
      } else {
        cpmUtils.myError(
          `findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`
        );
      }

    console.log("EQP IDS*******", eqpIds);
    // for (myeqp in eqpIds) {
    // 	// cpmUtils.myError(`findTheEquipmentForScenario - Identified Eqp:${eqpIds[myeqp]} ${cpmUtils.myPrint(typedEqps[eqpIds[myeqp]])}`);
    // 	// console.log("MY DEV DATA",JSON.stringify(cpmUtils.getJSONElement(ibmsDataBlockJson,["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"],eqpIds[myeqp]])))
    // 	let runHours = (cpmUtils.getJSONElement(ibmsDataBlockJson, ["Plant_Snapshot", myFindCriteria["EQUIPMENT_TYPE"],eqpIds[myeqp], "Eqp_Metrics", "rh_cumulative"]));
    // 	console.log("*********Run hours*********",eqpIds[myeqp]," : ",runHours);

    // 	if (runHours !== null && runHours < leastRunHoursValue) {
    // 		leastRunHoursValue = runHours;
    // 		minRunHourEqp = eqpIds[myeqp];
    // 	}
    // }
    // Update the working equipment
    if (eqpIds.length > 0) {
      let ongoingScenario = { Active_Scenario: {} };
      ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
      ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
        myFindCriteria["EQUIPMENT_TYPE"]
      ] = eqpIds;
      setSiteSpecificDataItems(ongoingScenario);
      // setSiteSpecificDataItems({ "Active_Scenario": { "Working_On_Equipment": { "NONGL_SS_CHILLER": eqpIds[0] } } });
    } else {
      error = `findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`;
    }

    // if (error) {
    // 	// Log error and process error
    // 	mycallback(error, null);
    // }
    // if (success) {
    // 	// Log success and process success
    // 	mycallback(null, success);
    // }
    return error !== null ? error : true;
  }
}
const updatePlantSnapshotRunHours = (ss_type, id, metricid, metricvalue) => {
  ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
    metricid
  ] = metricvalue;
};
// let myaction = {"EQUIPMENT_TYPE":"NONGL_CTF", "Eqp_Attributes": {"CT_Fan_On_Off_SS":1}, "ACTION_REQUIRED":"snapshot_check"}
function snapshotCheckCtf(criteria, callback) {
  let flag = true;
  console.log("Inside CTF");
  console.log("*******criteria", criteria);
  let ctf = getSiteSpecificDataItem([
    "Active_Scenario",
    "Working_On_Equipment",
    criteria["EQUIPMENT_TYPE"],
  ]); // array of devices

  console.log("CTF", ctf);

  for (myeqp in ctf) {
    console.log("My EQP");
    for (myattr in criteria["Eqp_Attributes"]) {
      //getJSONelement -- to read my value.
      let myValue = cpmUtils.getJSONElement(ibmsDataBlockJson, [
        "Plant_Snapshot",
        criteria["EQUIPMENT_TYPE"],
        ctf[myeqp],
        "Eqp_Attributes",
        myattr,
        "presentValue",
      ]);

      expected = criteria["Eqp_Attributes"][myattr];
      console.log("INSIDE SNAPSHOT SCHECK", myattr, myValue);

      if (expected === 0) {
        expected = "inactive";
      } else if (expected === 1) {
        expected = "active";
      }

      if (myValue === 0) {
        myValue = "inactive";
      } else if (myValue === 1) {
        myValue = "active";
      }

      if (expected === myValue) {
        console.log("****Success*****");
        continue;
      } else {
        console.log("***Mismatch*****");
        flag = false;
      }
    }
  }
  return flag;
}

function ibmsPlantsnapshot(req, res) {
  res.json(ibmsDataBlockJson["Plant_Snapshot"]);
}

function getCurrentState(req, res) {
  console.log("Inside get Current State");
  let currentScenario = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Active_Scenario",
    "Working_Scenario_Type",
  ]);
  let currentState = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Active_Scenario",
    "Scenario_Current_State",
  ]);
  res.json({
    currentScenario: currentScenario,
    currentState: currentState,
  });
}

function autoManualStatus(req, res) {
  // Extract the autoManual value from the request body

  let autoManual = req.body.autoManual;
  // let setpoint = req.body.setPoint;

  console.log("Req body", autoManual);

  // Assuming ibmsDataBlockJson structure is valid and modifiable directly
  // if (ibmsDataBlockJson['Plant_Snapshot'] && ibmsDataBlockJson['Plant_Snapshot']['NONGL_SS_HEADER'] && ibmsDataBlockJson['Plant_Snapshot']['NONGL_SS_HEADER']['0005b90000'] && ibmsDataBlockJson['Plant_Snapshot']['NONGL_SS_HEADER']['0005b90000']['Eqp_Metrics']) {
  ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_HEADER"]["0005b90000"][
    "Eqp_Metrics"
  ]["Monitor_Parameter"] = autoManual;
  // }

  // Respond with a message indicating the mode based on the result
  if (autoManual === true) {
    res.send(`CPM in AUTO MODE`);
  } else {
    res.send(`CPM in MANUAL MODE`);
  }
}

function updateHeaderSetpoint(req, res) {
  const payLoad = req.body;
  let ip = Object.keys(payLoad).find((x) => x.match(/\d+\.\d+\.\d+\.\d+/));
  if (!ip) {
    return res
      .status(400)
      .send({ message: "No valid IP address found in the payload." });
  }
  const deviceData = payLoad[ip];
  const deviceKey = Object.keys(deviceData)[0];
  chw_sp = deviceData[deviceKey][0];
  newValue = deviceData[deviceKey][1];
  console.log(`Param: ${chw_sp} value: ${newValue}`);
  if (!chw_sp) {
    return res.status(400).send({ message: "No Set Point Parameter Found." });
  } else {
    let oldValue = getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_HEADER",
      "0005b90000",
      "Eqp_Attributes",
      chw_sp,
      "presentValue",
    ]);
    oldValue = newValue;
    return res.status(200).send({ message: "Header setpoint updated." });
  }
}

module.exports = {
  initialize,
  getActiveScenario,
  setEquipmentId,
  getSiteSpecificDataItem,
  setSiteSpecificDataItems,
  findTheEquipmentForScenario,
  getDetailsForStateTransition,
  startActiveScenario,
  updateActiveScenarioParameter,
  updateActiveScenarioEquipment,
  prepareEquipmentFaultHandlingScenario,
  getCPMSnapshot,
  // initializePs,
  sendDataToAlarms,
  sendJSONToRunHour,
  updatePlantSnapshot,
  processEquipmentCode,
  snapshotCheck,
  getPlantSnapshotDataItem,
  preProcessBody,
  findTheEquipmentForScenarioSeries,
  findTheEquipmentForScenarioCT,
  findTheEquipmentForStopScenario,
  ibmsPlantsnapshot,
  getCurrentState,
  autoManualStatus,
  updateHeaderSetpoint,
  updatePlantSnapshotRunHours,
};
