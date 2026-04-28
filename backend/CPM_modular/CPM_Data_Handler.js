const fs = require("fs");
const { port } = require("../Config/common");
const cpmUtils = require("./CPM_Utilities");
const Plant_Snapshot = require("./preparePlantSnapshot");
const cpmEventsActions = require("./CPM_EventsActions");
const filePath = "./plantsnapshot_mod.json";
const fns = require("date-fns");
const logger = require("./logger");
const axiosc = require("axios");
const https = require("https");
const { Logger } = require("winston");
const { de, tr } = require("date-fns/locale");
const e = require("cors");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
const path = require("path");
const { CLIENT_RENEG_LIMIT } = require("tls");
const alarm = require("./../Apps/Alarm_others/controller");
const model = require("./../Apps/Alarm_others/model");
const uuid = require("uuid");
const { includes } = require("lodash");
var ibmsDataBlockJson = {};
var loaderStarted = true;
let useDB = false;

// Add other functions
function getActiveScenario() {
  return cpmUtils.getJSONElement(ibmsDataBlockJson, ["Active_Scenario"]);
}

function getActiveScenario1() {
  return cpmUtils.getJSONElement(ibmsDataBlockJson, ["Active_Scenario1"]);
}

function setEquipmentId(jsonPath = [], id = null) {
  if (id !== null)
    ibmsDataBlockJson["Active_Scenario"]["Working_On_Equipment_Id"] = id;
}

function initialize(path) {
  try {
    if (!useDB) {
      Plant_Snapshot.init(ibmsDataBlockJson, (err, res) => {
        if (err) {
          console.log(err);
          return false;
        } else {
          console.log(`success fully merged`);
          loaderStarted = true;
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
    }
  } catch (err) {
    cpmUtils.myError(`Error while bb parsing JSON data: ${path}`, err);
  }
}

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

function recurse(initial, update) {
  for (let prop in update) {
    if (
      {}.hasOwnProperty.call(initial, prop) &&
      {}.hasOwnProperty.call(update, prop)
    ) {
      if (Array.isArray(initial[prop]) && Array.isArray(update[prop])) {
        // If both initial and update properties are arrays, handle array update logic here
        initial[prop] = myUpdateFunction(initial[prop], update[prop]);
      } else if (
        typeof initial[prop] === "object" &&
        typeof update[prop] === "object"
      ) {
        recurse(initial[prop], update[prop]);
      } else {
        initial[prop] = myUpdateFunction(initial[prop], update[prop]);
      }
    } else {
      initial[prop] = update[prop];
    }
  }
}

function setSiteSpecificDataItems(updatesRequired = {}) {
  recurse(ibmsDataBlockJson, updatesRequired);
  // cpmUtils.myError(`Currently Active Scenario: ${cpmUtils.myPrint(cpmU["Active_Scenario"])}`);
}

function checkChildComponentCriteria(complexEqp, complexCriteria) {
  let result = true;
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
            if (actual === "active" || actual === "1") {
              actual = 1;
            } else if (actual === "inactive" || actual === "0") {
              actual = 0;
            }
            // cpmUtils.myError(`findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`);
            if (actual != null)
              switch (expected) {
                case 0:
                case 1:
                case true:
                case false:
                  if (expected !== actual) {
                    // do not focus
                    // logger.info(`Removing Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`);
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
  let eqpIds = [];
  let actual,
    expected,
    error = null,
    childrenOk = true;
  let device = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    myFindCriteria["EQUIPMENT_TYPE"],
  ]);
  let currentCombination = cpmUtils.getJSONElement(
    getActiveScenario(),
    ["Working_Combination"],
    true
  );

  const filterData = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([key, value]) =>
          value.Eqp_Metrics.Equipment_Faulty === false &&
          value.Equipment_Group === currentCombination &&
          value.inUse === false &&
          value.Eqp_Metrics.Alarm === false
      )
    );
  };
  let typedEqps = filterData(device);
  logger.info(
    `Criteria inside FindEquipment ${JSON.stringify(myFindCriteria)}`
  );
  logger.info(`Filtered Devices ${Object.keys(typedEqps)}`);
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
        if (actual === "active" || actual === "1") {
          actual = 1;
        } else if (actual === "inactive" || actual === "0") {
          actual = 0;
        }
        logger.info(`Actual ${actual}==${myattr}==${expected} Expected`);
        if (actual !== null)
          switch (expected) {
            case 0:
            case 1:
            case true:
            case false:
              if (expected === actual) {
                // keep in focus
                if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                logger.info(
                  `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
              } else {
                // do not focus
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                logger.info(
                  `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
                childrenOk = false; // Keeping this so that child components need not be checked
              }
              break;
            default:
              logger.info(
                `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`
              );
              error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
              break;
          }
        if (childrenOk === false) break;
      }
      if (childrenOk === true)
        for (myattr in myFindCriteria["Eqp_Metrics"]) {
          logger.info(`Children ok is ${childrenOk} `);
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
                  logger.info(
                    `Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                } else {
                  // do not focus
                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  logger.info(
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
  for (myeqp in eqpIds) {
    let runHours = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
      eqpIds[myeqp],
      "Eqp_Metrics",
      "rh_cumulative",
    ]);
    if (runHours !== null && runHours < leastRunHoursValue) {
      leastRunHoursValue = runHours;
      minRunHourEqp = eqpIds[myeqp];
    }
  }
  logger.info(`=====EQUIPMENT======> ${eqpIds}`);
  logger.info(`=====Minimum RunHour Equipment======> ${minRunHourEqp}`);
  // Update the working equipment
  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = minRunHourEqp;
    setSiteSpecificDataItems(ongoingScenario);
    ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][
      minRunHourEqp
    ]["inUse"] = true;
  } else {
    logger.info(`findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`);
    error = `UNABLE TO FIND EQUIPMENT`;
  }
  return error !== null ? error : true;
}

//18-07-2024
function findTheEquipmentForStopScenario(myFindCriteria, updateFaulty = null) {
  cpmUtils.sudhu("Inside Find To Stop Criteria", myFindCriteria);
  let eqpIds = [];
  let actual,
    expected,
    error = null,
    childrenOk = true;
  let device = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    myFindCriteria["EQUIPMENT_TYPE"],
  ]);
  let currentCombination = cpmUtils.getJSONElement(
    getActiveScenario(),
    ["Working_Combination"],
    true
  );

  const filterData = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([key, value]) =>
          value.Eqp_Metrics.Equipment_Faulty === false &&
          value.Equipment_Group === currentCombination &&
          value.Eqp_Metrics.Alarm === false
      )
    );
  };
  // const filterData = (obj) => {
  // 	return Object.fromEntries(
  // 		Object.entries(obj).filter(([key, value]) =>
  // 			value.Eqp_Metrics.Equipment_Faulty === false && value.Equipment_Group === currentCombination  && value.Eqp_Metrics.Alarm === false  && value.inUse===true
  // 		)
  // 	);
  // };
  let typedEqps = filterData(device);
  // console.log("Equipments Not Faulty and Combination --->",typedEqps);
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
        cpmUtils.sudhu(
          `data handler findEQP ${actual}==${myattr}==${expected}`
        );
        if (actual === "active" || actual === "1") {
          actual = 1;
        } else if (actual === "inactive" || actual === "0") {
          actual = 0;
        }
        cpmUtils.sudhu(
          `Find Eqpuipment to Stop Expected: ${expected} === Actual: ${actual} eqpIds - ${eqpIds.length}`
        );
        if (actual !== null)
          switch (expected) {
            case 0:
            case 1:
            case true:
            case false:
              if (expected === actual) {
                // keep in focus
                console.log("IF switch ");
                if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                // logger.info(`Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`);
                cpmUtils.myTempDebug(
                  `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
              } else {
                // do not focus
                console.log("Else switch ");
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                // logger.info(`Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`);
                cpmUtils.myTempDebug(
                  `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
                childrenOk = false; // Keeping this so that child components need not be checked
              }
              break;
            default:
              // logger.info(`findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`);
              error = `findTheEquipmentToStopForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
              break;
          }
        if (childrenOk === false) break;
      }
      if (childrenOk === true)
        for (myattr in myFindCriteria["Eqp_Metrics"]) {
          // logger.info(`Children ok is ${childrenOk} `);
          console.log("In children ok");
          expected = myFindCriteria["Eqp_Metrics"][myattr];
          actual = cpmUtils.getJSONElement(
            typedEqps[myeqp],
            ["Eqp_Metrics", myattr],
            true
          );
          // console.log("actual in child",actual,typedEqps[myeqp])
          if (actual !== null)
            switch (expected) {
              case 0:
              case 1:
              case true:
              case false:
                if (expected === actual) {
                  // keep in focus
                  if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                  // logger.info(`Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
                  cpmUtils.myTempDebug(
                    `Added child Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                } else {
                  // do not focus
                  if (eqpIds.indexOf(myeqp) !== -1)
                    eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                  // logger.info(`Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
                  cpmUtils.myTempDebug(
                    `Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                  );
                  childrenOk = false; // Keeping this so that child components need not be checked
                }
                break;
              case "LEAST":
                break;
              default:
                error = `findTheEquipmentToStopForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
                // logger.info(error);
                break;
            }
          if (childrenOk === false) break;
        }
      // typedEqps[myeqp]
      if (childrenOk === true) {
        console.log(
          "My Devices length with Check Child Component",
          eqpIds.length,
          childrenOk
        );
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
  if (updateFaulty !== null) {
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
      // logger.info(`Updating the equipment ${updateFaulty} as ${true}`);
    } else {
      // logger.info(`findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`);
      cpmUtils.myError(
        `findTheEquipmentForScenario-Unable to update ${updateFaulty} as faulty!`
      );
    }
  }

  console.log("------Equipment To Stop -----", eqpIds);
  // logger.info(`Equipent Working IDs ${eqpIds}`);

  // let currentTimestamp = new Date();
  let mostRecentEqp = null;
  let currentTimestamp = cpmUtils.getCurrentTime();
  for (myeqp in eqpIds) {
    console.log("--->", eqpIds[myeqp]);
    let mostRecentTime = getSiteSpecificDataItem([
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
      eqpIds[myeqp],
      "Eqp_Metrics",
      "Controlled_Time",
    ]);
    if (currentTimestamp > mostRecentTime) {
      mostRecentTime = currentTimestamp;
      mostRecentEqp = eqpIds[myeqp];
    }
  }
  console.log(`Most Recent Equipment =====> ${mostRecentEqp}`);
  // Update the working equipment
  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = mostRecentEqp;
    ibmsDataBlockJson["Plant_Snapshot"][myFindCriteria["EQUIPMENT_TYPE"]][
      mostRecentEqp
    ]["inUse"] = false;
    setSiteSpecificDataItems(ongoingScenario);
  } else {
    // logger.info(`findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`);
    error = `UNABLE TO FIND EQUIPMENT`;
  }
  return error !== null ? error : true;
}

function getDetailsForStateTransition(myaction = null, cb, inputParams) {
  logger.info(
    `Inside Bacnet Write Protocol Criteria ${JSON.stringify(myaction)}`
  );
  console.log("inputparams", inputParams);
  let myequipment = "";
  if (myaction["ACTION_REQUIRED"] === "write") {
    if (inputParams && "ss_id" in inputParams) {
      myequipment = inputParams["ss_id"];
      // cpmUtils.sudhu(`@@@@@@@@@@@@@@1${JSON.stringify(myaction)} currentState ${inputParams["nextState"]}`)
      if (inputParams["nextState"] === "SET_PARAMETER_WRITE_REQUESTED") {
        if (!("EQUIPMENT_TYPE" in myaction && "Eqp_Attributes" in myaction)) {
          console.log("EQUIPMENT_TYPE is NOT present");
          myaction["EQUIPMENT_TYPE"] = inputParams["ss_type"];
          myaction["Eqp_Attributes"] = inputParams["Eqp_Attributes"];
          // cpmUtils.sudhu(`@@@@@@@@@@@@@@2${JSON.stringify(myaction)}`)
        } else {
          console.log("EQUIPMENT_TYPE is  present");
          myaction["EQUIPMENT_TYPE"] = inputParams["ss_type"];
          myaction["Eqp_Attributes"] = inputParams["Eqp_Attributes"];
          // cpmUtils.sudhu(`@@@@@@@@@@@@@@3${JSON.stringify(myaction)}`)
        }
      }
    } else {
      myequipment = getSiteSpecificDataItem([
        "Active_Scenario",
        "Working_On_Equipment",
        myaction["EQUIPMENT_TYPE"],
      ]);
    }
    // myequipment=getSiteSpecificDataItem(["Active_Scenario", "Working_On_Equipment", myaction["EQUIPMENT_TYPE"]]);
  } else if (myaction["ACTION_REQUIRED"] === "fault_write") {
    myequipment = getSiteSpecificDataItem([
      "Active_Scenario",
      "fault_Equipment",
      myaction["EQUIPMENT_TYPE"],
    ]);
  }
  console.log(
    "===========in write========================>",
    myaction,
    myequipment
  );
  let error = "",
    mypriority = true;
  if (!ibmsDataBlockJson["allowConcurrent"]) {
    mypriority = true;
  } else {
    mypriority = handlePriority(myaction, myequipment);
  }
  if (mypriority) {
    if (typeof myequipment == "string") {
      logger.info(`Type of my Equipment ${myequipment} string1.`);
      let pID = port.pbs1;
      let myWriteCmd = `http://localhost:${pID}/write/`;
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
          } else if (myaction["Eqp_Attributes"][myattr] === 0) {
            value = "inactive";
          } else {
            value = myaction["Eqp_Attributes"][myattr];
          }
          myWriteCmd += `/${myObjId}/presentValue/${value}/-/8`;
          logger.info("Bacnet Write Command");
          logger.info(myWriteCmd);
        }
      else {
        error = "Unable to Find Equipment to give bacnet command.";
      }
      cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
        if (err) {
          logger.info(`Unable to Execute PBS REQUEST.`);
        } else {
          console.log(res);
        }
      });
    } else {
      logger.info(`Type of myEquipment ${myequipment} is object2.`);
      myequipment.forEach((i) => {
        let pID = port.pbs1;
        let myWriteCmd =
          `http://localhost:${pID}/` +
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
            logger.info("Bacnet Write Command.");
            logger.info(myWriteCmd);
          }
        else {
          error = "Unable to Find Equipment to give bacnet command.";
        }
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
    return true;
    // return (error !== null) ? error : true;
  } else {
    console.log("already written to lesser priority");
  }
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
    let concurrent = getSiteSpecificDataItem(["allowConcurrent"]);
    if (concurrent) {
      let workingActiveScenario = getSiteSpecificDataItem(["Active_Scenario1"]);
      //console.log(`workingActiveScenario ====>${JSON.stringify(workingActiveScenario)}#####Active_Scenario1`)
      let equipment = workingActiveScenario["Working_On_Equipment"];
      let workingEquipmentScenarioId = Object.values(equipment)[0];
      let ongoingScenarioId = getSiteSpecificDataItem([
        "Active_Scenario",
        workingEquipmentScenarioId,
        "Working_Scenario_Id",
      ]);
      // cpmUtils.sudhu(`ACTIVE SCENARIO1 ${JSON.stringify(getSiteSpecificDataItem(["Active_Scenario1"]))} in update active scnario ${workingEquipmentScenarioId} ongoingScenarioId ${ongoingScenarioId}`)
      // cpmUtils.sudhu(`#################$$$$$$$$$$$$$$$$$$$##################`)
      // console.log("ACT1",getSiteSpecificDataItem(["Active_Scenario",workingEquipmentScenarioId]))
      if (ongoingScenarioId !== "scenario_uuid") {
        if (param === "Scenario_Current_State") {
          let ongoingScenario = {};
          ongoingScenario = getSiteSpecificDataItem(["Active_Scenario"]);
          // cpmUtils.sudhu(`${value}-----update Active---${JSON.stringify(ongoingScenario)}`)
          let nextScenario = "";
          // console.log(`act2`,getSiteSpecificDataItem(["Active_Scenario"]))
          // if(undefined===ongoingScenario["Working_Scenario"][0]){}
          ibmsDataBlockJson["Active_Scenario"][workingEquipmentScenarioId][
            "Scenario_Previous_State"
          ] =
            ibmsDataBlockJson["Active_Scenario"][workingEquipmentScenarioId][
              "Scenario_Current_State"
            ];
          ibmsDataBlockJson["Active_Scenario"][workingEquipmentScenarioId][
            "Scenario_Current_State"
          ] = value;
          ibmsDataBlockJson["Active_Scenario"][workingEquipmentScenarioId][
            "State_Change_Timestamp"
          ] = cpmUtils.getCurrentTime();
          console.log(`##########AFTER COMPLETE UPDATE ACTIVE SCNARIO`);
          // console.log(`${JSON.stringify(getSiteSpecificDataItem(["Active_Scenario"]))}`)
          // }
        } else {
          ibmsDataBlockJson["Active_Scenario"][param] = value;
        }
        mycallback(null, ibmsDataBlockJson["Active_Scenario"]);
      } else {
        mycallback(
          `updateActiveScenarioParameter-Looks like there is No Active Scenario. Please wait...`
        );
      }
    } else {
      let ongoingScenarioId = getSiteSpecificDataItem([
        "Active_Scenario",
        "Working_Scenario_Id",
      ]);
      if (ongoingScenarioId !== "scenario_uuid") {
        if (param === "Scenario_Current_State") {
          let ongoingScenario = {};
          ongoingScenario = getSiteSpecificDataItem(["Active_Scenario"]);
          cpmUtils.sudhu(
            `${value}-----update Active---${JSON.stringify(ongoingScenario)}`
          );
          let nextScenario = "";
          // if(undefined===ongoingScenario["Working_Scenario"][0]){}
          ibmsDataBlockJson["Active_Scenario"]["Scenario_Previous_State"] =
            ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"];
          ibmsDataBlockJson["Active_Scenario"][
            "Scenario_Current_State"
          ] = value;
          ibmsDataBlockJson["Active_Scenario"][
            "State_Change_Timestamp"
          ] = cpmUtils.getCurrentTime();
          // }
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
}

function updateActiveScenarioEquipment(eqpType, eqpId, mycallback = null) {
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
  scenario,
  scenarioParams = null,
  mycallback = null
) {
  logger.info(`==========Inside Priority Fault Active Scenario========`);
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
    console.log(`ongoingScenarioId---->${ongoingScenarioId}`);
    // Copy Active Scenario to a PausedScenario object to handle Equipment Fault
    if (ongoingScenarioId != "scenario_uuid") {
      ibmsDataBlockJson["Paused_Scenario"] = JSON.parse(
        JSON.stringify(ibmsDataBlockJson["Active_Scenario"])
      );
    }
    // prepare request uuid and respond with uuid and timestamp
    let path = [];
    let currentScenarioJson = { Active_Scenario: {} };
    let resultPath = traversePath(scenario, path);
    console.log("------>final path", resultPath);
    const myScenario = resultPath[resultPath.length - 1];
    ibmsDataBlockJson["Active_Scenario"]["Working_Combination"] =
      scenarioParams["cpmCombination"];
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario"] = resultPath;
    ibmsDataBlockJson["Active_Scenario"]["Running_Scenario"] = myScenario;
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Priority"] = 0;
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Type"] = myScenario;
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Id"] = "1234";
    ibmsDataBlockJson["Active_Scenario"]["Scenario_Current_State"] =
      "SCENARIO_STARTED";
    ibmsDataBlockJson["Active_Scenario"][
      "State_Change_Timestamp"
    ] = cpmUtils.getCurrentTime();
    ibmsDataBlockJson["Active_Scenario"]["Working_Scenario_Faulty"] = true;
    ibmsDataBlockJson["Active_Scenario"]["fault_Equipment"] =
      scenarioParams["fault_Equipment"];
    ibmsDataBlockJson["Active_Scenario"]["handleFailureState"] =
      "SCENARIO_COMPLETED";
    //fault_Equipment ,handleFailureState
    logger.info(
      `Active Scenario in PRiority Fault Handling ${JSON.stringify(
        ibmsDataBlockJson["Active_Scenario"]
      )}`
    );
    cpmUtils.sudhu("TRIGGER NEW SCENARIO");
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
      cpmUtils.sudhu(`****resumeActiveScenarioAfterFaultHandling****`);
      ibmsDataBlockJson["Active_Scenario"] = {};
      console.log(
        "paused>",
        JSON.parse(JSON.stringify(ibmsDataBlockJson["Paused_Scenario"]))
      );
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
  const combinedData = {};
  const ahuArr = [];
  // const data = ibmsDataBlockJson;
  // const mySnapshot = cpmUtils.getJSONElement(data.Plant_Snapshot);
  if (ibmsDataBlockJson.Plant_Snapshot != null) {
    //key = sstype
    for (const key in ibmsDataBlockJson.Plant_Snapshot) {
      if (
        key.includes("NONGL_SS_CHILLER") ||
        key.includes("NONGL_SS_AIR_COOLED_CHILLER") ||
        key.includes("NONGL_SS_PRIMARY_VARIABLE_PUMPS") ||
        key.includes("NONGL_SS_COOLING_TOWER") ||
        key.includes("NONGL_SS_SECONDARY_PUMPS") ||
        key.includes("NONGL_SS_CONDENSER_PUMPS") ||
        key.includes("NONGL_SS_PUMPS") ||
        key.includes("NONGL_SS_CPM")
      ) {
        Object.assign(combinedData, ibmsDataBlockJson.Plant_Snapshot[key]);
      }
    }
  }
  Object.values(combinedData).map((item) => {
    // item = uuid
    const eqpAttributes = item.Eqp_Attributes;
    const eqpFaulty = item.Eqp_Metrics;
    const ssType = item.ssType;
    if (eqpAttributes.Pri_Pmp_Trip_SS) {
      if (
        eqpAttributes.Pri_Pmp_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.Pri_Pmp_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "112",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "Pri_Pmp_Trip_SS",
          message: "Primary Pump Tripped",
          ss_type: "NONGL_SS_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_PUMPS",
        });
      }
    }
    if (eqpAttributes.PriV_Pmp_Trip_SS) {
      if (
        eqpAttributes.PriV_Pmp_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.PriV_Pmp_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "116",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "PriV_Pmp_Trip_SS",
          message: "Primary Variable Pump Tripped",
          ss_type: "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        });
      }
    }
    if (eqpAttributes.CH_Trip_SS) {
      if (
        eqpAttributes.CH_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.CH_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "111",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "CH_Trip_SS",
          message: "AIR_COOLED_Chiller Tripped",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      }
    }
    if (eqpAttributes.Sec_Pmp_Trip_SS) {
      if (
        eqpAttributes.Sec_Pmp_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.Sec_Pmp_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "113",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "Sec_Pmp_Trip_SS",
          message: "Secondary Pump Tripped",
          ss_type: "NONGL_SS_SECONDARY_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_SECONDARY_PUMPS",
        });
      }
    }
    if (eqpAttributes.Cnd_Pmp_Trip_SS) {
      if (
        eqpAttributes.Cnd_Pmp_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.Cnd_Pmp_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "114",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "Cnd_Pmp_Trip_SS",
          message: "Condenser Pump Tripped",
          ss_type: "NONGL_SS_CONDENSER_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_CONDENSER_PUMPS",
        });
      }
    }
    if (eqpAttributes.CT_Fan_Trip_SS) {
      if (
        eqpAttributes.CT_Fan_Trip_SS["presentValue"] == 1 ||
        eqpAttributes.CT_Fan_Trip_SS["presentValue"] == "active"
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "115",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "CT_Fan_Trip_SS",
          message: "Cooling Tower(CT_FAN)Tripped",
          ss_type: "NONGL_SS_COOLING_TOWER_FAN",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_COOLING_TOWER_FAN",
        });
      }
    }
    if (eqpFaulty) {
      if (eqpFaulty.Equipment_Faulty === true) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "499",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "Equipment_Faulty",
          message: "Faulty",
          ss_type: ssType,
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          message: "No Fault",
          alarm_code: "",
          ss_type: ssType,
        });
      }
    }
    // if(eqpAttributes.CWH_ST){
    // 	if(eqpAttributes.CWH_ST["presentValue"] > 27 || eqpAttributes.CWH_ST["presentValue"] < 18){
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '304',
    //             "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    //             "param_id": 'CWH_ST',
    //             "message": 'Chiller Water Header Supply Temperature-High/Low',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         });
    // 	}else{
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         })
    // 	}
    // }
    // if(eqpAttributes.CWH_RT){
    // 	if(eqpAttributes.CWH_RT["presentValue"] > 27 || eqpAttributes.CWH_RT["presentValue"] < 18){
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '305',
    //             "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    //             "param_id": 'CWH_RT',
    //             "message": 'Chiller Water Header Return Temperature-High/Low',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         });
    // 	}else{
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         })
    // 	}
    // }
    // if(eqpAttributes.DPT_H){
    // 	if(eqpAttributes.DPT_H["presentValue"] > 27 || eqpAttributes.DPT_H["presentValue"] < 18){
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '306',
    //             "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    //             "param_id": 'DPT_H',
    //             "message": 'Differential Pressure across Header-High/Low',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         });
    // 	}else{
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '',
    //             "ss_type":"NONGL_SS_AIR_COOLED_HEADER"
    //         })
    // 	}
    // }
    // if(eqpAttributes.HUMIDITY_MONITORING){
    // 	if(eqpAttributes.HUMIDITY_MONITORING["presentValue"] > 27 || eqpAttributes.HUMIDITY_MONITORING["presentValue"] < 18){
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '312',
    //             "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    //             "param_id": 'HUMIDITY_MONITORING',
    //             "message": 'Humidity High/Low',
    //             "ss_type":"NONGL_SS_CPM"
    //         });
    // 	}else{
    // 		ahuArr.push({
    //             "ss_id": item.id,
    //             "alarm_code": '',
    //             "ss_type":"NONGL_SS_CPM"
    //         })
    // 	}
    // }
    if (
      eqpAttributes.BYPASS_HEADER_VLV_CMD &&
      eqpAttributes.BYPASS_HEADER_VLV_FBK
    ) {
      if (
        eqpAttributes.BYPASS_HEADER_VLV_CMD["presentValue"] !=
        eqpAttributes.BYPASS_HEADER_VLV_FBK["presentValue"]
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "101",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "BYPASS_HEADER_VLV_FBK",
          message: "Bypass Valve Mismatch Alarm",
          ss_type: "NONGL_SS_CPM",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_CPM",
        });
      }
    }
    if (eqpAttributes.CH_Out_Vlv_On_Off && eqpAttributes.CH_Out_Vlv_On_Off_SS) {
      if (
        eqpAttributes.CH_Out_Vlv_On_Off["presentValue"] !=
        eqpAttributes.CH_Out_Vlv_On_Off_SS["presentValue"]
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "102",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "CH_Out_Vlv_On_Off",
          message: "Chiller Outlet isolation valve Mismatch Alarm",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      }
    }
    if (eqpAttributes.CH_On_Off && eqpAttributes.CH_On_Off_SS) {
      if (
        eqpAttributes.CH_On_Off["presentValue"] !=
        eqpAttributes.CH_On_Off_SS["presentValue"]
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "103",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "CH_On_Off",
          message: "Chiller Status Mismatch Alaram",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_AIR_COOLED_CHILLER",
        });
      }
    }
    if (eqpAttributes.PriV_Pmp_On_Off && eqpAttributes.PriV_Pmp_On_Off_SS) {
      if (
        eqpAttributes.PriV_Pmp_On_Off["presentValue"] !=
        eqpAttributes.PriV_Pmp_On_Off_SS["presentValue"]
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "104",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "PriV_Pmp_On_Off",
          message: "Primary Variable Pump Status Mismatch Alarm",
          ss_type: "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        });
      }
    }
    if (eqpAttributes.Sec_Pmp_On_Off && eqpAttributes.Sec_Pmp_On_Off_SS) {
      if (
        eqpAttributes.Sec_Pmp_On_Off["presentValue"] !=
        eqpAttributes.Sec_Pmp_On_Off_SS["presentValue"]
      ) {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "105",
          measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          param_id: "Sec_Pmp_On_Off",
          message: "Secondary Pump Status Mismatch Alarm",
          ss_type: "NONGL_SS_SECONDARY_PUMPS",
        });
      } else {
        ahuArr.push({
          ss_id: item.id,
          alarm_code: "",
          ss_type: "NONGL_SS_SECONDARY_PUMPS",
        });
      }
    }
  });
  const groupedData = ahuArr.reduce((acc, obj) => {
    const key = obj.ss_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
  callback(null, groupedData);
};

const deviceType = {
  0x00: ["NONGL_SS_EMS", "em_", "_om_p"],
  0xa0: ["NONGL_SS_AHU", "ahu_", "_om_p"],
  0xa8: ["NONGL_SS_VAV", "vav_", "_ahu_om_p"],
  0xb0: ["NONGL_SS_CHILLER", "ch_", "_om_p"],
  0xb1: ["NONGL_SS_PUMPS", "pu_", "_om_p"],
  0xb2: ["NONGL_SS_PRIMARY_VARIABLE_PUMPS", "pv_", "_om_p"],
  0xb3: ["NONGL_SS_SECONDARY_PUMPS", "secpu_", "_om_p"],
  0xb4: ["NONGL_SS_CONDENSER_PUMPS", "condpu_", "_om_p"],
  0xb7: ["NONGL_SS_COOLING_TOWER", "ct_", "_om_p"],
  0xb5: ["NONGL_SS_VAV", "vav_", "_ahu_om_p"],
  0xb8: ["NONGL_SS_COOLING_TOWER_FAN", "ctf_", "_om_p"],
  0xba: ["NONGL_SS_AIR_COOLED_CHILLER", "ach_", "_om_p"],
  0xbc: ["NONGL_SS_CPM", "cpm_", "_om_p"],
  0xbd: ["NONGL_SS_DPT", "dpt_", "_om_p"],
  0xa9: ["FRESH_AIR_UNIT", "fau_", "_om_p"],
  0xaa: ["SS_VENTILATOR_1", "ven_", "_om_p"],
  0xab: ["SS_BRE_FAN", "bref_", "_om_p"],
  0xac: ["SS_HTE_FAN", "htef_", "_om_p"],
  0xad: ["SS_SUBE_FAN", "subef_", "_om_p"],
  // 0xB5: ['NONGL_SS_VAV', 'vav', '_om_p', 'ahu_']
};

const sendJSONToRunHour = (ss_type, callback) => {
  // console.log("ss_type",ss_type)
  const results = [];
  const snapshot = ibmsDataBlockJson["Plant_Snapshot"];
  // console.log("snapshot",snapshot)
  if (!snapshot) {
    callback(null, []);
    return;
  }

  if (snapshot[ss_type]) {
    Object.values(snapshot[ss_type]).forEach((device) => {
      const obj = {
        id: device.id,
        BACnetDeviceAddress: device.BACnetDeviceAddress,
        ss_type: ss_type,
        table_name: getDBTableName(device.glSSId, device.glSSId),
      };
      results.push(obj);
    });
  }

  if (results.length > 0) {
    callback(null, results);
  } else {
    callback(null, []);
  }
};
function getDBTableName(eqpParamHexCode, tbl_code) {
  eqpParamHexCode = Number.parseInt("0x".concat(eqpParamHexCode), 16);
  return getDBTableNameFromHex(eqpParamHexCode, tbl_code);
}
function getDBTableNameFromHex(eqpParamHexCode, tbl_code) {
  let devTypeNow = (0xff0000 & eqpParamHexCode) >> 16;
  if (deviceType[devTypeNow] == undefined) return -1;
  prefix = deviceType[devTypeNow][1];
  suffix = deviceType[devTypeNow][2];
  // if ((0xC000 & eqpParamHexCode) === 0xC000) {
  // 	tblCode = 0xFF00FFFFF0 & eqpParamHexCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
  // }else{
  // 	tblCode = 0xFFFFFF0000 & eqpParamHexCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
  // }
  // if ((0xC000 & eqpParamHexCode) === 0xC000) {
  // 	if(tblNameLength === 12){
  // 		tblCode = BigInt.asIntN(64,BigInt(0xFFFFFFFF0000) & BigInt(eqpParamHexCode)); //(0xFFFFFF0000 & eqpParamCode) >> 16;
  // 	}else{
  // 		tblCode = 0xFF00FFFFF0 & eqpParamHexCode;
  // 	}
  // }else{
  // 	tblCode = 0xFFFFFF0000 & eqpParamHexCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
  // }
  //console.log("--->",`${prefix}${tbl_code.toString(16).toLowerCase().padStart(tblNameLength, 0)}${suffix}`.toLowerCase())
  return `${prefix}${tbl_code}${suffix}`.toLowerCase();
}
//   if (loaderStarted == false) initializePs((e, r) => {
// 	// processReadMultipleResponse(sudrmmSample, null);
// });

const TABLE_NAME_LENGTH = 12;
function processEquipmentCode(eqpCode, createEquipment = false) {
  let eqpCodeObject = { inputValid: true, errorCode: [] };
  let tblNameLength = TABLE_NAME_LENGTH;
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
    if (tblNameLength === 12) {
      tblCode = BigInt.asIntN(
        64,
        BigInt(0xffffffff0000) & BigInt(eqpParamCode)
      ); //(0xFFFFFF0000 & eqpParamCode) >> 16;
      devIdCode = tblCode;
    } else {
      tblCode = 0xffffff0000 & eqpParamCode;
      devIdCode = tblCode;
    }
    // tblCode = 0xFFFFFF0000 & eqpParamCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
    // devIdCode = tblCode;
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
  // console.log("Before P Values ", JSON.stringify(ibmsDataBlockJson["Plant_Snapshot"]));
  // if (e_parent === true) {
  let myparam = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    e_type,
    e_id,
    "Eqp_Attributes",
    p_name,
  ]);
  let measured_time = fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
  // cpmUtils.myTable(myparam);
  // console.log(`before update PV ${ibmsDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name]} ,p_name->${p_name}`)
  ibmsDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name][
    "presentValue"
  ] = p_value;
  ibmsDataBlockJson["Plant_Snapshot"][e_type][e_id]["Eqp_Attributes"][p_name][
    "measured_time"
  ] = measured_time;
  let modifiedparam = cpmUtils.getJSONElement(ibmsDataBlockJson, [
    "Plant_Snapshot",
    e_type,
    e_id,
    "Eqp_Attributes",
  ]);
  cpmUtils.sudhu(`**********Updated measured_time : ${measured_time}`);
  // cpmUtils.myTable(modifiedparam);
}

function findTheEquipmentForScenarioCT(myFindCriteria, updateFaulty = null) {
  console.log("Criteria******", myFindCriteria);
  let eqpIds = [],
    typedEqps = {};
  let actual,
    expected,
    error = null,
    childrenOk = true,
    parentDevice = "",
    device = "";
  if (myFindCriteria["EQUIPMENT_TYPE"] === "NONGL_SS_COOLING_TOWER_FAN") {
    parentDevice = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Active_Scenario",
      "Working_On_Equipment",
      "NONGL_SS_COOLING_TOWER",
    ]);
    device = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      "NONGL_SS_COOLING_TOWER",
      parentDevice,
      "EQP_COMPONENTS",
      myFindCriteria["EQUIPMENT_TYPE"],
    ]);
    // const filterData = (obj) => {
    // 	return Object.fromEntries(
    // 		Object.entries(obj).filter(([key, value]) =>
    // 			value.Eqp_Metrics.Equipment_Faulty === false && value.Eqp_Metrics.Alarm === false
    // 		)
    // 	);
    // };
    typedEqps = device;
  } else {
    device = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Plant_Snapshot",
      myFindCriteria["EQUIPMENT_TYPE"],
    ]);
    console.log("Device", Object.keys(device));
    const filterData = (obj) => {
      return Object.fromEntries(
        Object.entries(obj).filter(
          ([key, value]) =>
            value.Eqp_Metrics.Equipment_Faulty === false &&
            value.Eqp_Metrics.Alarm === false
        )
      );
    };
    typedEqps = filterData(device);
    typedEqps = device;
  }

  console.log("**********Filtered Devices*******", typedEqps);
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
        cpmUtils.sudhu(
          `data handler findEQP ${actual}==${myattr}==${expected}`
        );
        if (actual === "active" || actual === "1") {
          actual = 1;
        } else if (actual === "inactive" || actual === "0") {
          actual = 0;
        }
        cpmUtils.myError(
          `findTheEquipmentForScenario - expected: ${expected} actual - ${actual} eqpIds - ${eqpIds.length}`
        );
        console.log("i am actual ", actual);
        if (actual !== null)
          switch (expected) {
            case 0:
            case 1:
            case true:
            case false:
              if (expected === actual) {
                // keep in focus
                console.log("in IF switch ");
                if (eqpIds.indexOf(myeqp) === -1) eqpIds.push(myeqp);
                // logger.info(`Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`);
                cpmUtils.myTempDebug(
                  `Added Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
              } else {
                // do not focus
                console.log("in else switch ");
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                // logger.info(`Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`);
                cpmUtils.myTempDebug(
                  `Removed Equipment: ${myeqp} Param-${myattr} Expected-${expected}  Actual-${actual}`
                );
                childrenOk = false; // Keeping this so that child components need not be checked
              }
              break;
            default:
              // logger.info(`findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`);
              error = `findTheEquipmentForScenario - Unexpected Criteria ${expected} for attribute - ${myattr}`;
              break;
          }
      }
      for (myattr in myFindCriteria["Eqp_Metrics"]) {
        expected = myFindCriteria["Eqp_Metrics"][myattr];
        actual = cpmUtils.getJSONElement(
          typedEqps[myeqp],
          ["Eqp_Metrics", myattr],
          true
        );
        cpmUtils.sudhu(
          `data handler findEQP ${actual}==${myattr}==${expected}`
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
                // logger.info(`Added Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
                cpmUtils.myTempDebug(
                  `Added child Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`
                );
              } else {
                // do not focus
                if (eqpIds.indexOf(myeqp) !== -1)
                  eqpIds.splice(eqpIds.indexOf(myeqp), 1);
                // logger.info(`Removed Equipment: ${myeqp} Param- ${myattr} Expected- ${expected}  Actual- ${actual}`);
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
              // logger.info(error);
              break;
          }
        if (childrenOk === false) break;
      }
    }
  console.log("EQP IDS*******", eqpIds);
  // Update the working equipment
  if (eqpIds.length > 0) {
    let ongoingScenario = { Active_Scenario: {} };
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"] = {};
    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
      myFindCriteria["EQUIPMENT_TYPE"]
    ] = eqpIds;
    setSiteSpecificDataItems(ongoingScenario);
  } else {
    // logger.info(`findTheEquipmentForScenario - UNABLE TO FIND EQUIPMENT`);
    error = `UNABLE TO FIND EQUIPMENT`;
  }
  return error !== null ? error : true;
}

const updatePlantSnapshotRunHours = (ss_type, id, metricid, metricvalue) => {
  console.log(`${ss_type}---${id}--${metricid}---${metricvalue}`);
  ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
    metricid
  ] = metricvalue;
};

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
  //false -- going to manual mode
  let autoManual = req.body.autoManual;
  console.log("Req body", autoManual);
  // console.log("jbnfkjasndnlskdnjknk")
  // console.log("iam cpm",Object.keys(getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_COMMON_HEADER"])))
  // let cpm = Object.keys(getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_COMMON_HEADER"]));
  // console.log("just do it",ibmsDataBlockJson['Plant_Snapshot']['NONGL_SS_COMMON_HEADER'][cpm]['Eqp_Metrics']['Monitor_Parameter']);
  // ibmsDataBlockJson['Plant_Snapshot']['NONGL_SS_COMMON_HEADER'][cpm]['Eqp_Metrics']['Monitor_Parameter'] = autoManual;
  if (autoManual === true) {
    ibmsDataBlockJson["allowConcurrent"] = false;
    res.send(`CPM in AUTO MODE`);
  } else {
    ibmsDataBlockJson["allowConcurrent"] = true;
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

function updateEquipmentFaulty(ss_type, id, value = false) {
  //['Plant_Snapshot',ss_type,id,'Eqp_Metrics','Equipment_Faulty']
  if (ss_type === "NONGL_SS_COOLING_TOWER_FAN") {
    id.forEach((device) => {
      ibmsDataBlockJson["Plant_Snapshot"][ss_type][device]["Eqp_Metrics"][
        "Equipment_Faulty"
      ] = value;
    });
  } else {
    ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
      "Equipment_Faulty"
    ] = value;
  }
  // logger.info(`Updating the equipment ${ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]} as ${true}`);
}

function updateTripStatus(ss_type, id, value) {
  ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
    "Alarm"
  ] = value;
  // console.log("Inside Update TRIP",ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"]["Alarm"]);
  // logger.info(`Updating the equipment ${ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]} as ${true}`);
}

function updateMetricTime(criteria) {
  console.log("===============================");
  let concurrent = getSiteSpecificDataItem(["allowConcurrent"]);
  console.log("============", concurrent);
  if (concurrent) {
    // let workingActiveScenario=getSiteSpecificDataItem(["Active_Scenario1"])
    let myeqp = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Active_Scenario1",
      "Working_On_Equipment",
      criteria["EQUIPMENT_TYPE"],
    ]);
    if (typeof myeqp === "string") {
      let metricTime = cpmUtils.getJSONElement(ibmsDataBlockJson, [
        "Plant_Snapshot",
        criteria["EQUIPMENT_TYPE"],
        myeqp,
        "Eqp_Metrics",
        "Controlled_Time",
      ]);
      metricTime = cpmUtils.getCurrentTime();
      console.log("===Control Time Updated concurrent====");
    } else {
      myeqp.forEach((eqp) => {
        let metricTime = cpmUtils.getJSONElement(ibmsDataBlockJson, [
          "Plant_Snapshot",
          criteria["EQUIPMENT_TYPE"],
          eqp,
          "Eqp_Metrics",
          "Controlled_Time",
        ]);
        metricTime = cpmUtils.getCurrentTime();
        console.log("===Control Time Updated====");
      });
    }
  } else {
    let activeScenario = getActiveScenario();
    let myeqp = cpmUtils.getJSONElement(ibmsDataBlockJson, [
      "Active_Scenario",
      "Working_On_Equipment",
      criteria["EQUIPMENT_TYPE"],
    ]);
    if (typeof myeqp === "string") {
      let metricTime = cpmUtils.getJSONElement(ibmsDataBlockJson, [
        "Plant_Snapshot",
        criteria["EQUIPMENT_TYPE"],
        myeqp,
        "Eqp_Metrics",
        "Controlled_Time",
      ]);
      metricTime = cpmUtils.getCurrentTime();
      console.log("===Control Time Updated====");
    } else {
      myeqp.forEach((eqp) => {
        let metricTime = cpmUtils.getJSONElement(ibmsDataBlockJson, [
          "Plant_Snapshot",
          criteria["EQUIPMENT_TYPE"],
          eqp,
          "Eqp_Metrics",
          "Controlled_Time",
        ]);
        metricTime = cpmUtils.getCurrentTime();
        console.log("===Control Time Updated====");
      });
    }
  }
}
function updatePriorty(ssType, id) {
  ibmsDataBlockJson["Plant_Snapshot"][ssType][id]["priority"] = 16;
  console.log("====Priority Updated====");
}

function ibmsPlantsnapshot1(cb) {
  // res.json(ibmsDataBlockJson['Plant_Snapshot']);
  cb(null, ibmsDataBlockJson["Plant_Snapshot"]);
}

function traversePath(state, path) {
  console.log(path, state);
  path.push(state);
  let processStatus = "success";
  let nextState = getSiteSpecificDataItem([
    "CPM_Scenario_Flow",
    state,
    "SCENARIO_STARTED",
    processStatus,
  ]);
  console.log(`nextState>: ${nextState}`);
  if (getSiteSpecificDataItem(["CPM_SCENARIOS"]).includes(nextState)) {
    console.log("current path:>", path);
    return traversePath(nextState, path);
  } else {
    console.log(`PATH--return->${typeof path} `);
    return path;
  }
}

function updateTimeStamp(ss_type, id, currentTime, crossingInterval) {
  if (!crossingInterval) {
    console.log("Update only Current Time");
    ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
      "THRESHOLD_CROSSED_TIMESTAMP"
    ] = currentTime;
  } else {
    console.log("Update only Current Time and crossingInterval");
    ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
      "THRESHOLD_CROSSED_TIMESTAMP"
    ] = currentTime;
    ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Metrics"][
      "THRESHOLD_CROSSING_INTERVAL"
    ] = crossingInterval;
  }
}

function controlPID(value) {
  let eqp = Object.keys(ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_CPM"]);
  // console.log("CPM EQP --->",eqp);
  let objId =
    ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_CPM"][eqp[0]][
      "Eqp_Attributes"
    ]["DPT_PID_En"]["objId"];
  let bacnet =
    ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_CPM"][eqp[0]][
      "BACnetDeviceAddress"
    ];
  let myWriteCmd =
    "http://localhost:7080/write/" +
    bacnet +
    "/" +
    objId +
    "/" +
    "presentValue/" +
    value;
  console.log("=============", myWriteCmd);
  cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
    if (err) {
      logger.info(`Unable to Execute PBS REQUEST.`);
    } else {
      console.log(res);
    }
  });
}

function controlSpeedVFD(activePmp) {
  logger.info("===========Contol Speed VFD=========");
  let value = ((activePmp.length - 1) * 100 + 30) / activePmp.length;
  activePmp.forEach((eqp) => {
    // for (let eqp in activePmp){
    let bacnet =
      ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_PRIMARY_VARIABLE_PUMPS"][
        eqp
      ]["BACnetDeviceAddress"];
    let objId =
      ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_PRIMARY_VARIABLE_PUMPS"][
        eqp
      ]["Eqp_Attributes"]["PriV_Pmp_VFD_Ctrl"]["objId"];
    let myWriteCmd =
      "http://localhost:7080/write/" +
      bacnet +
      "/" +
      objId +
      "/" +
      "presentValue/" +
      value;
    console.log("=============", myWriteCmd);
    cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
      if (err) {
        logger.info(`Unable to Execute PBS REQUEST.`);
      } else {
        console.log(res);
      }
    });
    // }
  });
  return true;
}

function dptCheck() {
  let dpt = getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_DPT_DEVICE"]);
  Object.keys(dpt).forEach((eqp) => {
    let presentValue = getSiteSpecificDataItem(
      [
        "Plant_Snapshot",
        "NONGL_SS_DPT_DEVICE",
        eqp,
        "Eqp_Attributes",
        "DPTn",
        "presentValue",
      ],
      true
    );
    let setpoint = getSiteSpecificDataItem(
      [
        "Plant_Snapshot",
        "NONGL_SS_DPT_DEVICE",
        eqp,
        "Eqp_Attributes",
        "DPTn_SP",
        "presentValue",
      ],
      true
    );
    if (presentValue === setpoint) {
      logger.info(`Inside IF of SnapshotGoodParams.`);
      snapshotGood = true;
    } else {
      logger.info(`Inside ELSE of SnapshotGoodParams.`);
      return false;
    }
  });
}

function updateHeaderMonitor(value) {
  ibmsDataBlockJson["Plant_Snapshot"]["NONGL_SS_HEADER"][
    "07e2b7d5-0b03-4008-b608-0fb81d4b0631"
  ]["Eqp_Metrics"]["Monitor_Parameter"] = value;
}

function addKeyValue(key, value) {
  ibmsDataBlockJson[key] = value;
}

function removeKeyValue(key, value) {
  delete ibmsDataBlockJson["Active_Scenario"][key];
}

// Generic function to delete keys from an object
function deleteKeysFromObject(obj, keysToDelete) {
  keysToDelete.forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      delete obj[key]; // Delete key if found in the object
    }

    // If it's an object inside the object, check recursively
    for (let prop in obj) {
      if (typeof obj[prop] === "object" && obj[prop] !== null) {
        deleteKeysFromObject(obj[prop], [key]); // Recursive call to delete nested keys
      }
    }
  });
}

function Plantsnapshot() {
  return ibmsDataBlockJson;
}

function processAlarmCode(glCode, sstype, pname, ssid, val, pvalue) {
  let alarmCode = null;
  console.log(
    "=================processAlarmCode============>",
    glCode,
    pname,
    val
  );
  if (glCode.startsWith("GL")) {
    let hexpart = glCode.replace(/GL\s|\s/g, ""),
      insertData = [],
      updateData = [],
      restoreData = [];
    if (val === "binary") {
      console.log("IT IS BINARY", pname);
      // if(ibmsDataBlockJson['AlarmCode'].includes(pname)){
      // 	alarmCode = ibmsDataBlockJson['AlarmCode'][pname]
      // 	console.log("====Alarm code====",alarmCode)
      // }
      alarmCode = 300;
    } else if (val === "analog") {
      // Non-critical alarms: 300 < alarmCode < 499
      alarmCode = Math.floor(Math.random() * (499 - 300 + 1)) + 300;
    } else {
      // Default alarm code: 500
      alarmCode = 500;
    }
    let x = "0x" + hexpart;
    let y = parseInt(x, 16);
    console.log("WHAT IS THIS", y & 0xa000);
    if ((y & 0xa000) === 40960) {
      //does eqp as alarm
      let currentRqpAlarmSS = getSiteSpecificDataItem(
        ["Plant_Snapshot", sstype, ssid, "Eqp_Metrics", "Alarm_code"],
        true
      );
      console.log("array of alarm code", currentRqpAlarmSS);
      //if eqp has alarm check is alarm alaredy creted or not
      let presentValue = getSiteSpecificDataItem(
        [
          "Plant_Snapshot",
          sstype,
          ssid,
          "Eqp_Attributes",
          pname,
          "presentValue",
        ],
        true
      );
      console.log("PRESENT VALUE", presentValue);
      if (pvalue === "active") {
        //create or update
        console.log("INS IDE create or update");
        if (currentRqpAlarmSS.length > 0) {
          let updateDb = currentRqpAlarmSS.includes(alarmCode);
          if (updateDb) {
            //update DB
            updateData.push({
              id: ssid,
              alarm_code: alarmCode,
              measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
              param_id: pname,
              message: pname,
              ss_type: sstype,
            });
            model.addAlarmData([], updateData, [], (err, results) => {
              if (err) {
                console.log(err);
              } else {
                updateTripStatus(sstype, ssid, true);
                updatePlantSnapshot(sstype, ssid, pname, pvalue);
                console.log("Inserted Alarm in ADD ALARM DATA.");
                console.log(results);
              }
            });
          } else {
            //create in db
            console.log("create record in DB");
            insertData.push([
              ssid,
              alarmCode,
              pname,
              pname,
              fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            ]);
            model.addAlarmData(insertData, [], [], (err, results) => {
              if (err) {
                console.log(err);
              } else {
                updateTripStatus(sstype, ssid, true);
                updatePlantSnapshot(sstype, ssid, pname, pvalue);
                console.log("Inserted Alarm in ADD ALARM DATA.");
                console.log(results);
              }
            });
          }
        } else {
          //create 1st alarm of equipment
          //pushing alarm code to
          console.log("create 1st alarm record in DB");
          insertData.push([
            ssid,
            alarmCode,
            pname,
            pname,
            fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          ]);
          // console.log("before",ibmsDataBlockJson.Plant_Snapshot[sstype][ssid].Eqp_Metrics.Alarm_code)
          // // ibmsDataBlockJson.Plant_Snapshot[sstype][ssid].Eqp_Metrics.Alarm_code.push(alarmCode)
          // ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Metrics"]["Alarm_code"].push(alarmCode)
          // console.log("after",ibmsDataBlockJson.Plant_Snapshot[sstype][ssid].Eqp_Metrics.Alarm_code)
          console.log(
            "Before push:",
            ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Metrics"][
              "Alarm_code"
            ]
          );
          ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Metrics"][
            "Alarm_code"
          ].push(alarmCode);
          console.log(
            "After push:",
            ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Metrics"][
              "Alarm_code"
            ]
          );

          model.addAlarmData(insertData, [], [], (err, results) => {
            if (err) {
              console.log(err);
            } else {
              updateTripStatus(sstype, ssid, true);
              updatePlantSnapshot(sstype, ssid, pname, pvalue);
              console.log("Inserted Alarm in ADD ALARM DATA.");
              console.log(results);
            }
          });
          updatePlantSnapshot(sstype, ssid, pname, pvalue);
          updateTripStatus(sstype, ssid, true);
        }
      } else {
        if (pvalue === "inactive") {
          //restore
          updatePlantSnapshot(sstype, ssid, pname, pvalue);
          updateTripStatus(sstype, ssid, false);
          console.log("CAME TO RESTORE");
          restoreData.push({
            id: ssid,
            alarm_code: alarmCode,
            measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            param_id: pname,
            message: pname,
            ss_type: sstype,
          });
          model.addAlarmData([], [], restoreData, (err, results) => {
            if (err) {
              console.log(err);
            } else {
              ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Metrics"][
                "Alarm_code"
              ] = ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid][
                "Eqp_Metrics"
              ]["Alarm_code"].filter((code) => code !== alarmCode);
              console.log("Restored Alarm in ADD ALARM DATA.");
              console.log(results);
            }
          });
        }
      }
      logger.info(`=======Alarm Data : ${alarmData}======`);
      console.log("=========PresentValue=====", presentValue);
    } else {
      //update plantsanpshot
      updatePlantSnapshot(sstype, ssid, pname, pvalue);
    }
  }
}

function updateAlarmCode(sstype, uuid, alarmCode, val = false) {
  const snapshot = ibmsDataBlockJson["Plant_Snapshot"];
  if (
    !snapshot ||
    !snapshot[sstype] ||
    !snapshot[sstype][uuid] ||
    !snapshot[sstype][uuid]["Eqp_Metrics"]
  ) {
    return;
  }

  if (val === true) {
    snapshot[sstype][uuid]["Eqp_Metrics"]["Alarm_code"].push(alarmCode);
  } else {
    snapshot[sstype][uuid]["Eqp_Metrics"]["Alarm_code"] = snapshot[sstype][
      uuid
    ]["Eqp_Metrics"]["Alarm_code"].filter((code) => code !== alarmCode);
  }
}

function getTimeHour() {
  const currentHour = new Date().getHours();
  return currentHour;
}

function writeToFile(act, mode = "overwrite") {
  logger.info(`====Writing to File ${JSON.stringify(act)}======`);
  const filePath = path.join(__dirname, "scenario_log.txt");
  // Extract keys from the act parameter (SSTYPE, ss_id, and new parameters)
  const newSSType = Object.keys(act)[0]; // e.g., "NONGL_SS_AIR_COOLED_CHILLER"
  const newSSid = Object.keys(act[newSSType])[0]; // e.g., "2068c870-06f3-467f-835c-2e1375991463"
  const newParams = act[newSSType][newSSid]; // e.g., {"CH_Out_Vlv_On_Off_SS": "active"}

  fs.readFile(filePath, "utf8", (err, fileData) => {
    if (err && err.code !== "ENOENT") {
      console.error(`Error reading file: ${err.message}`);
      return;
    }

    let updateData = {};
    if (fileData) {
      try {
        updateData = JSON.parse(fileData);
      } catch (parseErr) {
        console.log(`Error parsing file Data : ${parseErr.message}`);
        return;
      }
    }
    // Check if SSTYPE exists, if not initialize it as an empty object
    if (!updateData[newSSType]) {
      updateData[newSSType] = {};
    }

    // Check if ss_id exists under SSTYPE, if not initialize it as an empty object
    if (!updateData[newSSType][newSSid]) {
      updateData[newSSType][newSSid] = {};
    }

    // Now iterate through the newParams and update (or append) each parameter
    for (const param in newParams) {
      updateData[newSSType][newSSid][param] = newParams[param]; // Overwrite or append
    }

    // Convert the updated data back to JSON and write it to the file
    const dataToWrite = JSON.stringify(updateData, null, 2); // Pretty print with 2 spaces
    if (mode === "append") {
      fs.appendFile(filePath, dataToWrite + "\n", (err) => {
        if (err) {
          console.error(`Error appending to file: ${err.message}`);
        } else {
          console.log(`Successfully appended to file at: ${filePath}`);
        }
      });
    } else {
      fs.writeFile(filePath, dataToWrite + "\n", (err) => {
        if (err) {
          console.error(`Error writing to file: ${err.message}`);
        } else {
          console.log(`Successfully wrote to file at: ${filePath}`);
        }
      });
    }
  });
}

// Function to execute PBS command
function executePbsCommand(bacnet, objId) {
  const myWriteCmd = `http://localhost:7080/write/${bacnet}/${objId}/presentValue/inactive`;
  console.log("Executing command:", myWriteCmd);

  cpmEventsActions.executePbsReq(myWriteCmd, (err, res) => {
    if (err) {
      logger.info("Unable to execute PBS REQUEST.");
    } else {
      console.log("Command response:", res);
    }
  });
}

// Main function to handle the restart scenario
function restartScenario(workingOnEquipment) {
  console.log("====RESTART CPM=====", workingOnEquipment);
  const result = {};
  // Iterate through each SSTYPE (e.g., NONGL_SS_AIR_COOLED_CHILLER)
  for (const sstype in workingOnEquipment) {
    // Iterate through each SSID under SSTYPE
    for (const ssid in workingOnEquipment[sstype]) {
      const params = workingOnEquipment[sstype][ssid]; // The parameters object
      const activeParams = Object.entries(params)
        .filter(([param, value]) => value === "active")
        .reduce((acc, [param, value]) => {
          acc[param] = value; // Add the active param to the result
          return acc;
        }, {});
      if (Object.keys(activeParams).length > 0) {
        for (let obj in Object.keys(activeParams)) {
          const bacnet =
            ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid][
              "BACnetDeviceAddress"
            ];
          const objId =
            ibmsDataBlockJson["Plant_Snapshot"][sstype][ssid]["Eqp_Attributes"][
              Object.keys(activeParams)[obj]
            ]["objId"];
          // Execute the command for each attribute
          executePbsCommand(bacnet, objId);
        }
      }
    }
  }
}

function updateConcurrent(value) {
  ibmsDataBlockJson["allowConcurrent"] = value;
}
function updateInUse(sstype, uuid, value) {
  ibmsDataBlockJson["Plant_Snapshot"][sstype][uuid]["inUse"] = value;
}

const updatePriority = (ss_type, id, attribute, myprio, value) => {
  console.log(`${ss_type}---${id}--${attribute}---${myprio - 1}----${value}`);
  // console.log('priroty in update priority',ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Attributes"][attribute]["priority"][myprio - 1] = value)
  ibmsDataBlockJson["Plant_Snapshot"][ss_type][id]["Eqp_Attributes"][attribute][
    "priority"
  ][myprio - 1] = value;
};

function handlePriority(myaction, myequipment) {
  if (myequipment)
    for (myattr in Object.keys(myaction["Eqp_Attributes"])[0]) {
      // if(!ibmsDataBlockJson["allowConcurrent"]){

      // }
      let myprio = getActiveScenario1()["commandFrom"];
      console.log("myprioooooooooooooooooooo", myprio);
      let priorityCheck = {
        UI: 8,
        SCHEDULE: 10,
        LOGIC: 12,
      };

      let inputArr = {
        priority: priorityCheck[myprio],
        value: myaction["Eqp_Attributes"][myattr],
      };

      console.log("==========================", priorityCheck[myprio]);
      let curentPriorityArr =
        ibmsDataBlockJson["Plant_Snapshot"][myaction["EQUIPMENT_TYPE"]][
          myequipment
        ]["Eqp_Attributes"][Object.keys(myaction["Eqp_Attributes"])[0]][
          "priority"
        ];
      ////////////////////////////////////////////////////////////////////////////////////////////////
      var todo = false;
      let done = false;
      for (let i = 0; i < curentPriorityArr.length; i++) {
        if (curentPriorityArr[i] !== null) {
          if (i + 1 === inputArr["priority"]) {
            console.log("update here -> 1", priorityCheck[myprio]);
            updatePriority(
              myaction["EQUIPMENT_TYPE"],
              myequipment,
              Object.keys(myaction["Eqp_Attributes"])[0],
              inputArr["priority"],
              myaction["Eqp_Attributes"][
                Object.keys(myaction["Eqp_Attributes"])[0]
              ]
            );
            todo = true;
            done = true;
          } else {
            console.log("update here -> 3", priorityCheck[myprio]);
            updatePriority(
              myaction["EQUIPMENT_TYPE"],
              myequipment,
              Object.keys(myaction["Eqp_Attributes"])[0],
              priorityCheck[myprio],
              myaction["Eqp_Attributes"][
                Object.keys(myaction["Eqp_Attributes"])[0]
              ]
            );
            //   todo = true;
            done = true;
          }
        } else {
          if (i === inputArr["priority"]) {
            console.log("update here -> 4");
            updatePriority(
              myaction["EQUIPMENT_TYPE"],
              myequipment,
              Object.keys(myaction["Eqp_Attributes"])[0],
              priorityCheck[myprio],
              myaction["Eqp_Attributes"][
                Object.keys(myaction["Eqp_Attributes"])[0]
              ]
            );
            todo = true;
            done = true;
          }
        }
        if (done === true) {
          break;
        }
      }
      console.log(
        `todo - ${todo} done - ${done} PriorityArrsy: `,
        curentPriorityArr
      );
      ////////////////////////////////////////////////////////////////////////////////////////////////
      console.log("todo========================>", todo);
      return todo;
    }
  else {
    error = "Unable to Find Equipment Priority to give bacnet command.";
  }
}

function updateRelinqiushPriority(data) {
  // console.log("data",data)
  let myDeviceState =
    ibmsDataBlockJson["ACTION"][data[0].gl_command][data[0].ss_type];
  // console.log("myDeviceState===================================>",myDeviceState)
  let myState =
    ibmsDataBlockJson["EQUIPMENT_CONTROL_ACTION"][myDeviceState][
      "SCENARIO_STARTED"
    ]["success"];
  // console.log("myAttributes===================>",myState)
  let myAttribute =
    ibmsDataBlockJson["Scenario_States"][myState]["Eqp_Attributes"];
  // console.log("myAttribute==================================>",Object.keys(myAttribute)[0])
  let myParam = Object.keys(myAttribute)[0];
  let value = null;
  updatePriority(
    [data[0].ss_type],
    data[0].ss_id,
    myParam,
    data[0].priority,
    value
  );
  return true;
}

function ConCurrentStatus(req, res) {
  const mode = ibmsDataBlockJson["allowConcurrent"] ? "Manual" : "Auto";
  res.json({ Mode: mode });
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
  getPlantSnapshotDataItem,
  preProcessBody,
  findTheEquipmentForScenarioCT,
  findTheEquipmentForStopScenario,
  ibmsPlantsnapshot,
  getCurrentState,
  autoManualStatus,
  updateHeaderSetpoint,
  updatePlantSnapshotRunHours,
  updateEquipmentFaulty,
  ibmsPlantsnapshot1,
  updateMetricTime,
  updateTripStatus,
  traversePath,
  resumeActiveScenarioAfterFaultHandling,
  updatePriorty,
  updateHeaderMonitor,
  updateTimeStamp,
  controlPID,
  controlSpeedVFD,
  dptCheck,
  addKeyValue,
  removeKeyValue,
  deleteKeysFromObject,
  Plantsnapshot,
  processAlarmCode,
  getTimeHour,
  writeToFile,
  restartScenario,
  updateConcurrent,
  updateInUse,
  updatePriority,
  updateRelinqiushPriority,
  updateAlarmCode,
  ConCurrentStatus,
};
