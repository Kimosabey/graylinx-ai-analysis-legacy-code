const fs = require("fs");
const cpmUtils = require("./CPM_Utilities");
const dataHandler = require("./CPM_Data_Handler");
const noti = require("./Notification_Handler");
const datefns = require("date-fns");
const { parseISO, differenceInSeconds } = require("date-fns");
const scenarioHandler = require("./CPM_Scenario_Handler");
const controller = require("./../Apps/Alarm_others/controller");
const logger = require("./logger");
const model = require("../Apps/Alarm_others/model");
const uuid = require("uuid/v4");
const path = require("path");
const { forEach, result } = require("lodash");
const { isArray } = require("lodash");
// const locationDeviceDetails = require('../Services/Gl_Schedules/sampleScheduleTester')

const responseToCall = () => {
  // return {
  //     status: (code) => {
  return {
    json: (data) => {
      // console.log(`Response Status: ${code}`);
      console.log("Response Data:====", data);
    },
  };
  //     },
  // };
};
function restartCPM() {
  mycount = mycount + 1;
  if (mycount > 5) {
    let cpm = Object.keys(
      dataHandler.getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_CPM"])
    );
    const attributesPath = [
      "Plant_Snapshot",
      "NONGL_SS_CPM",
      cpm,
      "Eqp_Attributes",
    ];
    let tripRelay = dataHandler.getSiteSpecificDataItem(
      [...attributesPath, "Trip_Relay", "presentValue"],
      true
    );
    let concurrent = dataHandler.getSiteSpecificDataItem(["allowConcurrent"]);
    if (tripRelay === "active" || tripRelay === "1" || tripRelay === 1) {
      if (!concurrent) {
        // Process Txt file.
        const filePath = path.join(__dirname, "scenario_log.txt");
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            console.error(`Error reading scenario file: ${err.message}`);
            return;
          }
          try {
            const scenarioData = JSON.parse(data);
            dataHandler.restartScenario(scenarioData);
          } catch (parseErr) {
            console.error(`Error parsing scenario file: ${parseErr.message}`);
          }
        });
        dataHandler.updateConcurrent(true);
      }
    } else {
      // return false
      dataHandler.updateConcurrent(false);
    }
  }
}

const processMyCpmNotification = (req, res) => {
  logger.info(`======Command Reached to ProcessMyCPMNotification======`);
  let cpmScenario = cpmUtils.getJSONElement(req, ["body", "startCPMScenario"]);
  let cpmCombination = cpmUtils.getJSONElement(req, ["body", "CPMCombination"]);
  let cpmFaultScenario = cpmUtils.getJSONElement(
    req,
    ["body", "priorityEquipmentFault"],
    true
  );
  let f_Equipment = cpmUtils.getJSONElement(req, ["body", "ss_type"], true);
  logger.info(`====Workin with Combination ${cpmCombination}====`);
  if (cpmCombination === null) cpmCombination = "Combination-1";
  let testJson = {};
  testJson["cpmCombination"] = cpmCombination;
  testJson["fault_Equipment"] = f_Equipment;
  if (cpmFaultScenario !== null) {
    logger.info(`=====HANDLING PRIORITY FAULT=====`);
    if (
      cpmFaultScenario &&
      dataHandler
        .getSiteSpecificDataItem(["CPM_SCENARIOS"])
        .includes(cpmFaultScenario)
    ) {
      dataHandler.prepareEquipmentFaultHandlingScenario(
        cpmFaultScenario,
        testJson,
        (e, s) => {
          if (e) {
            console.log("error");
          }
          if (s) {
            // console.log("0000000>",JSON.stringify(s));
            const mycallback = cpmUtils.consoleLog;
            scenarioHandler.processCPMScenarioStateWithParams(
              null,
              null,
              mycallback
            );
          }
        }
      );
    } else {
      res.json(`Response fault from DE: ${cpmUtils.myPrint(req.body)}`);
    }
  } else {
    cpmScenario !== null;
    logger.info(`======INSIDE START CPM SCENARIO======`);
    if (
      cpmScenario &&
      dataHandler
        .getSiteSpecificDataItem(["CPM_SCENARIOS"])
        .includes(cpmScenario)
    ) {
      //GOING TO START SCENARIO
      noti.handleScenarioStartRequest(cpmScenario, testJson, responseToCall());
    } else {
      // res.json(`Response from DE: ${cpmUtils.myPrint(req.body)}`);
      logger.info(`=========Error not listed scenario ${cpmScenario}=====`);
    }
  }
};
const processNotification = (req, res) => {
  noti.processNotification(req, res);
};
const hdlEquipmentAction = async (req, res) => {
  let cpmScenario = cpmUtils.getJSONElement(req, ["body", "gl_command"]);
  let commandFrom = cpmUtils.getJSONElement(req, ["body", "commandFrom"]);
  if (cpmScenario != null) {
    let request_id = uuid();
    let obj = {
      id: request_id,
    };
    // console.log("req===============================",req.body)
    if (req.body.ss_id != null) {
      let reqBody = cpmUtils.getJSONElement(req, ["body", "ss_id"]); // Get 'ss_id' from req.body
      // console.log("reqBody", reqBody);
      let payloads = [];
      // Check if 'reqBody' is an array
      if (Array.isArray(reqBody)) {
        // console.log("Array detected", reqBody);
        // Loop through each 'ss_id' in the array and prepare payloads
        reqBody.forEach((ss_id) => {
          let payload = {
            body: {
              ss_type: req.body.ss_type,
              ss_id: ss_id,
              gl_command: req.body.gl_command,
              param_id: req.body.param_id,
              value: req.body.value,
              zone_type: null,
              zone_id: null,
            },
          };
          payloads.push(payload);
        });
        // console.log("Payloads for array:", payloads);
      } else if (reqBody) {
        // If 'reqBody' is a single value, prepare a single payload
        // console.log("Single ID detected");
        let payload = {
          body: {
            ss_type: req.body.ss_type,
            ss_id: reqBody,
            gl_command: req.body.gl_command,
            param_id: req.body.param_id,
            value: req.body.value,
            zone_type: null,
            zone_id: null,
          },
        };
        payloads.push(payload);
        // console.log("Payload for single ID:", payload);
      } else {
        console.log("No 'ss_id' provided in the request");
      }
      console.log("ID in decision engine", request_id);
      // After preparing payloads, send each one
      let total_devices = payloads.length;
      let count = 0;
      res.send("Command is processing");
      payloads.forEach((payload) => {
        console.log("payload=============payloads exit", payload);
        // process.exit()
        setTimeout(() => {
          noti.equipmentControlAction(
            payload,
            res,
            request_id,
            commandFrom,
            (err, result) => {
              if (err) {
                console.error("Error processing payload:", err);
              }
              if (result) {
                console.log(`================>${result}`);
              }
              // Increment count after processing each payload
              count++;

              // Once all payloads have been processed, send a response
              if (count === total_devices) {
                cpmUtils.sudhu("Command is processing");
                res.send("Command is processing");
              }
            }
          );
        }, 100);
      });
    } else {
      console.log("Im here because of zone_id");
      let action = {};
      action["gl_command"] = req.body.gl_command;
      action["param_id"] = req.body.param_id;
      action["value"] = req.body.value;
      let zoneId = req.body.zone_id;
      console.log("zoneId", zoneId, "===============>", "action", action);
      const deviceDetails = await locationDeviceDetails.locationIdsToDevice(
        zoneId,
        action
      );
      console.log("deviceDetails--------------------->", deviceDetails);
      deviceDetails.forEach((id, i) => {
        setTimeout(() => {
          let data = {};
          data["body"] = id;
          console.log("data===========>", data);
          noti.equipmentControlAction(
            payload,
            res,
            request_id,
            commandFrom,
            (err, result) => {
              if (err) {
                return res.status(400).json(err);
              } else {
                return res.status(200).json(result);
              }
            }
          );
        }, 100);
      });
    }
    // if(res!=null){
    // 	return res.json(obj)
    // }
  } else {
    return res.status(400).send({ message: "Invalid Request Body" });
  }
};
const processWatchDog = () => {
  let concurrent = dataHandler.getSiteSpecificDataItem(["allowConcurrent"]);
  // noti.processWatchDog();
  if (!concurrent) {
    // restartCPM()
    checkProcessParameters(); // Monitor true (ADD)
    // checkRLA()                       // Monitor COMP_RLA (REMOVE)
    // checkpriVFD()                 // Monitor VFD Speed (ADD)
    // checkProcessParametersDPT()   // Monitor SS Pump DPT (ADD/REMOVE)
    // checkProcessParametersCT()    // Monitor CndW_ST (ADD/REMOVE CT FAN)
  }
};

const processAlarms = () => {
  // console.log("Calling Check Alarms.")
  checkAlarms();
};

let mycount = 0;
function checkProcessParameters() {
  mycount = mycount + 1;
  if (mycount > 5) {
    const plant = dataHandler.getSiteSpecificDataItem(["Plant_Snapshot"]);
    if (Object.keys(plant).includes("NONGL_SS_COMMON_HEADER")) {
      // if(Object.keys(dataHandler.getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_COMMON_HEADER"])).length>0){
      let commonHeader = Object.keys(
        dataHandler.getSiteSpecificDataItem([
          "Plant_Snapshot",
          "NONGL_SS_COMMON_HEADER",
        ])
      );
      // cpmUtils.sudhu(`commonHeader ${commonHeader}-------`)
      const headerPath = [
        "Plant_Snapshot",
        "NONGL_SS_COMMON_HEADER",
        commonHeader,
        "Eqp_Metrics",
      ];
      const attributesPath = [
        "Plant_Snapshot",
        "NONGL_SS_COMMON_HEADER",
        commonHeader,
        "Eqp_Attributes",
      ];
      let monitorParameter = dataHandler.getSiteSpecificDataItem([
        ...headerPath,
        "Monitor_Parameter",
      ]);
      let setpoint = 30; //dataHandler.getSiteSpecificDataItem([...attributesPath, "CWH_ST_SP","presentValue"], true);
      let presentValue = dataHandler.getSiteSpecificDataItem(
        [...attributesPath, "CWH_ST", "presentValue"],
        true
      );
      let thresholdMargin = 2.0; // +/- margin around the setpoint
      let currentTime = cpmUtils.getCurrentTime();
      // Calculate dynamic thresholds based on setpoint
      let upperThreshold = setpoint + thresholdMargin;
      let lowerThreshold = setpoint - thresholdMargin;
      let ts = dataHandler.getSiteSpecificDataItem([
        ...headerPath,
        "THRESHOLD_CROSSED_TIMESTAMP",
      ]);
      let crossingInterval = dataHandler.getSiteSpecificDataItem([
        ...headerPath,
        "THRESHOLD_CROSSING_INTERVAL",
      ]);
      let payload = {};
      let cpmCombination = dataHandler.getSiteSpecificDataItem([
        "Plant_Snapshot",
        "NONGL_SS_COMMON_HEADER",
        commonHeader,
        "Equipment_Group",
      ]);
      if (monitorParameter === true) {
        // if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
        // 	logger.info(`============Outside CHILLER HEADER Threshold==========`);
        // cpmUtils.sudhu(`present chiller header ${presentValue}`)
        // cpmUtils.sudhu(`timeStamp when crossed ${ts}`)
        if (!ts) {
          dataHandler.updateTimeStamp(
            "NONGL_SS_COMMON_HEADER",
            commonHeader,
            currentTime,
            null
          );
          logger.info(`============Update Time Stamp Common Header==========`);
        } else if (
          datefns.differenceInSeconds(currentTime, ts) > crossingInterval
        ) {
          if (presentValue > upperThreshold) {
            logger.info(
              `============Threshold TimeStamp Common Header==========`
            );
            logger.info(`============Temperature is high==========`);
            // let hour = dataHandler.getTimeHour(),payload=null;
            // if (hour >= 6 && hour < 18){
            // 	payload = {
            // 		"body":
            // 		{
            // 			"startCPMScenario":"START_WATER_COOLED_CHILLER_SYSTEM_MODULAR"
            // 		}
            // 	}
            // }else{
            // 	payload = {
            // 		"body":
            // 		{
            // 			"startCPMScenario":"START_AIR_COOLED_CHILLER_SYSTEM_MODULAR"
            // 		}
            // 	}
            // }
            // dataHandler.setSiteSpecificDataItems([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"],120);
            if (cpmCombination === null) {
              payload = {
                body: {
                  startCPMScenario: "START_AIR_COOLED_CHILLER_SYSTEM_MODULAR",
                },
              };
            } else {
              payload = {
                body: {
                  startCPMScenario: "START_AIR_COOLED_CHILLER_SYSTEM_MODULAR",
                  CPMCombination: cpmCombination,
                },
              };
            }
            logger.info(`==========${JSON.stringify(payload)}============`);
            processMyCpmNotification(payload, responseToCall());
            dataHandler.updateTimeStamp(
              "NONGL_SS_COMMON_HEADER",
              commonHeader,
              currentTime,
              120
            );
          }
          if (presentValue < lowerThreshold) {
            // dataHandler.setSiteSpecificDataItems([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"],120);
            if (cpmCombination === null) {
              payload = {
                body: {
                  startCPMScenario: "START_AIR_COOLED_CHILLER_SYSTEM_MODULAR",
                },
              };
            } else {
              payload = {
                body: {
                  startCPMScenario: "START_AIR_COOLED_CHILLER_SYSTEM_MODULAR",
                  CPMCombination: cpmCombination,
                },
              };
            }
            processMyCpmNotification(payload, responseToCall());
            dataHandler.updateTimeStamp(
              "NONGL_SS_COMMON_HEADER",
              commonHeader,
              currentTime,
              300
            );
          }
        }
      }
    }
    // }
  }
}
function checkProcessParametersCT() {
  let chiller = dataHandler.getSiteSpecificDataItem([
    "Plant_Snapshot",
    "NONGL_SS_CHILLER",
  ]);
  let activeCh = [];
  for (let myeqp in chiller) {
    let expected = 1;
    let actual = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_CHILLER",
      myeqp,
      "Eqp_Attributes",
      "CH_On_Off_SS",
      "presentValue",
    ]);
    if (actual === "1" || actual === "active") {
      actual = 1;
    }
    if (expected === actual) {
      activeCh.push(myeqp);
    }
  }
  if (activeCh.length > 0) {
    let eqp = Object.keys(
      dataHandler.getSiteSpecificDataItem([
        "Plant_Snapshot",
        "NONGL_SS_WATER_COOLED_HEADER",
      ])
    );
    const headerPath = [
      "Plant_Snapshot",
      "NONGL_SS_WATER_COOLED_HEADER",
      eqp,
      "Eqp_Metrics",
    ];
    const attributesPath = [
      "Plant_Snapshot",
      "NONGL_SS_WATER_COOLED_HEADER",
      eqp,
      "Eqp_Attributes",
    ];
    let monitorParameter = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "Monitor_Parameter",
    ]);
    let setpoint = 25; //dataHandler.getSiteSpecificDataItem([...attributesPath, "CDW_HST_SP","presentValue"], true);
    let presentValue = dataHandler.getSiteSpecificDataItem(
      [...attributesPath, "CDW_HST", "presentValue"],
      true
    );
    let thresholdMargin = 2.0; // +/- margin around the setpoint
    let currentTime = cpmUtils.getCurrentTime();
    // Calculate dynamic thresholds based on setpoint
    let upperThreshold = setpoint + thresholdMargin;
    let lowerThreshold = setpoint - thresholdMargin;
    let ts = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "THRESHOLD_CROSSED_TIMESTAMP",
    ]);
    let crossingInterval = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "THRESHOLD_CROSSING_INTERVAL",
    ]);
    if (monitorParameter === true) {
      // if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
      if (!ts) {
        dataHandler.updateTimeStamp(
          "NONGL_SS_WATER_COOLED_HEADER",
          eqp,
          currentTime
        );
        logger.info(`============Update Time Stamp==========`);
      } else if (
        datefns.differenceInSeconds(currentTime, ts) > crossingInterval
      ) {
        logger.info(`============Above Threshold TimeStamp==========`);
        if (presentValue > upperThreshold) {
          logger.info(`============Temperature is high==========`);
          // dataHandler.setSiteSpecificDataItems([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"],120);
          let payload = {
            body: {
              startCPMScenario: "ADD_CT_VARIABLE_FAN",
            },
          };
          processMyCpmNotification(payload, (err, ree) => {
            if (err) console.log("err in jw setT", err);
            if (ree) {
              console.log("reee", ree);
            }
          });
          // updateTimeStampCT();
          dataHandler.updateTimeStamp(
            "NONGL_SS_WATER_COOLED_HEADER",
            eqp,
            (currentTime = ""),
            180
          );
        }
        if (presentValue < lowerThreshold) {
          // dataHandler.setSiteSpecificDataItems([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"],120);
          let payload = {
            body: {
              startCPMScenario: "REMOVE_CT_VARIABLE_FAN",
            },
          };
          processMyCpmNotification(payload, (err, ree) => {
            if (err) console.log("err in jw setT", err);
            if (res) {
              console.log("reee", ree);
            }
          });
          dataHandler.updateTimeStamp(
            "NONGL_SS_WATER_COOLED_HEADER",
            eqp,
            (currentTime = ""),
            180
          );
        }
      }
      // }
    }
  }
}
function checkProcessParametersDPT() {
  // Example to handle monitoring process parameters - to be changed based on further details
  const headerPath = [
    "Plant_Snapshot",
    "NONGL_SS_DPT",
    "07e2b7d5-0b03-4008-b608-0fb81d4b0632",
    "Eqp_Metrics",
  ];
  const attributesPath = [
    "Plant_Snapshot",
    "NONGL_SS_DPT",
    "07e2b7d5-0b03-4008-b608-0fb81d4b0632",
    "Eqp_Attributes",
  ];
  let secPmp = dataHandler.getSiteSpecificDataItem([
    "Plant_Snapshot",
    "NONGL_SS_SECONDARY_PUMPS",
  ]);
  let activeSSPmp = [];
  for (myeqp in secPmp) {
    let expected = 1;
    let actual = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_SECONDARY_PUMPS",
      myeqp,
      "Eqp_Attributes",
      "Sec_Pmp_SS",
      "presentValue",
    ]);
    if (actual === "1" || actual === "active") {
      actual = 1;
    }
    if (expected === actual) {
      activeSSPmp.push(myeqp);
    }
  }
  // logger.info(`Active Secondary Pumps : ${JSON.stringify(activeSSPmp)}`);
  let header = dataHandler.getSiteSpecificDataItem([
    ...headerPath,
    "Monitor_Parameter",
  ]);
  let dpt = dataHandler.getSiteSpecificDataItem(
    [...attributesPath, "DPT", "presentValue"],
    true
  );
  let dpt_sp = dataHandler.getSiteSpecificDataItem(
    [...attributesPath, "DPT_SP", "presentValue"],
    true
  );
  let metric = dpt_sp - dpt;
  let upperThreshold = 10;
  let lowerThreshold = -10;
  let ts = dataHandler.getSiteSpecificDataItem([
    ...headerPath,
    "THRESHOLD_CROSSED_TIMESTAMP",
  ]);
  let currentTime = cpmUtils.getCurrentTime();
  let crossingInterval = dataHandler.getSiteSpecificDataItem([
    ...headerPath,
    "THRESHOLD_CROSSING_INTERVAL",
  ]);

  if (activeSSPmp.length > 0) {
    if (header === true) {
      if (!(metric >= -10 && metric <= 10)) {
        // cpmUtils.myError(`process_parameter_crossed ${cpmUtils.getCurrentTime()}=====${metric}`);
        if (!ts) {
          console.log("PPVIOLATION");
          let ppviolation = {
            Plant_Snapshot: {
              NONGL_SS_DPT: {
                "07e2b7d5-0b03-4008-b608-0fb81d4b0632": {
                  Eqp_Metrics: {
                    THRESHOLD_CROSSED_TIMESTAMP: currentTime,
                    THRESHOLD_CROSSED_VALUE: metric,
                  },
                },
              },
            },
          };
          dataHandler.setSiteSpecificDataItems(ppviolation);
        }
        //Log or Handle Start Scenario if Required
        else if (
          datefns.differenceInSeconds(currentTime, ts) > crossingInterval
        ) {
          cpmUtils.mySuccess("New Scenario to be Started");
          activeSSPmp.forEach((device) => {
            pmpSpeed = dataHandler.getSiteSpecificDataItem([
              "Plant_Snapshot",
              "NONGL_SS_SECONDARY_PUMPS",
              device,
              "Eqp_Attributes",
              "Sec_Pmp_VFD_Fbk",
              "presentValue",
            ]);
            if (pmpSpeed !== 100) {
              // console.log("VFD not reached 100.");
            } else {
              console.log("VFD reached 100");
              if (metric > upperThreshold) {
                cpmUtils.sudhu(`ADD SS_PUMP`);
                let payload = {
                  body: {
                    startCPMScenario: "ADD_SECONDARY_PUMP",
                    CPMCombination: "fa8caf87-f30b-11ed-8ae5-9829a659bca4",
                  },
                };
                processMyCpmNotification(payload, (err, ree) => {
                  if (err) console.log("err in jw setT", err);
                  if (res) {
                    console.log("reee", ree);
                  }
                });
                updateSecPumpTimeStamp();
              }
              if (metric < lowerThreshold) {
                cpmUtils.sudhu(`REMOVE SS_PUMP`);
                let payload = {
                  body: {
                    startCPMScenario: "REMOVE_SECONDARY_PUMP",
                    CPMCombination: "fa8caf87-f30b-11ed-8ae5-9829a659bca4",
                  },
                };
                processMyCpmNotification(payload, (err, ree) => {
                  if (err) console.log("err in jw setT", err);
                  if (res) {
                    console.log("reee", ree);
                  }
                });
                updateSecPumpTimeStamp();
              }
            }
          });
        }
      }
    }
  } else {
    // logger.info("No Active Sec Pump");
  }
}
function checkRLA() {
  let hour = dataHandler.getTimeHour();
  let activeCh = [],
    chillerType = null,
    payload = null;
  let chiller = dataHandler.getSiteSpecificDataItem([
    "Plant_Snapshot",
    "NONGL_SS_AIR_COOLED_CHILLER",
  ]);
  for (let myeqp in chiller) {
    let expected = 1;
    let actual = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      chillerType,
      myeqp,
      "Eqp_Attributes",
      "CH_On_Off_SS",
      "presentValue",
    ]);
    if (actual === "1" || actual === "active") {
      actual = 1;
    }
    if (actual === "0" || actual === "inactive") {
      actual = 0;
    }
    if (expected === actual) {
      activeCh.push(myeqp);
    }
  }
  if (activeCh.length > 1) {
    eqp = Object.keys(
      dataHandler.getSiteSpecificDataItem(["Plant_Snapshot", "NONGL_SS_CPM"])
    );
    const headerPath = ["Plant_Snapshot", "NONGL_SS_CPM", eqp, "Eqp_Metrics"];
    let monitorParameter = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "Monitor_Parameter",
    ]);
    let currentTime = cpmUtils.getCurrentTime();
    let ts = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "THRESHOLD_CROSSED_TIMESTAMP",
    ]);
    let crossingInterval = dataHandler.getSiteSpecificDataItem([
      ...headerPath,
      "THRESHOLD_CROSSING_INTERVAL",
    ]);
    let sum = 0;
    activeCh.forEach((device) => {
      let rla = dataHandler.getSiteSpecificDataItem([
        "Plant_Snapshot",
        chillerType,
        device,
        "Eqp_Attributes",
        "COMP_RLA",
        "presentValue",
      ]);
      sum = sum + rla / (activeCh.length - 1);
    });
    if (sum < 90) {
      if (!ts) {
        logger.info(`=======RLA${sum}==========`);
        dataHandler.updateTimeStamp("NONGL_SS_CPM", eqp, currentTime);
        logger.info(`============Update Time Stamp CPM==========`);
      } else if (
        datefns.differenceInSeconds(currentTime, ts) > crossingInterval
      ) {
        logger.info(`============Threshold Timestamp CPM==========`);
        logger.info(`=======RLA${sum}==========`);
        payload = {
          body: {
            startCPMScenario: "STOP_AIR_COOLED_CHILLER_SYSTEM_MODULAR",
          },
        };
        processMyCpmNotification(payload, (err, ree) => {
          if (err) console.log("err in jw setT", err);
          if (res) {
            console.log("reee", ree);
          }
        });
        dataHandler.updateTimeStamp(
          "NONGL_SS_CPM",
          eqp,
          (currentTime = ""),
          180
        );
      }
    }
  }
}
// step 1: Check the Working Pump make hasTriggeredflag to true to Enable PID.
// step 2: Check  Delay for about 60 seconds.
// step 3: Check time delay for ONE OF THE DPT METRICS and its threshold values.
// step 5: After some delay Check VFD SPEED of working PUMP if it reached 100 percent and Inside Check the DPT and its SETPOINT of all pumps.
// step 6: If DP and its SP met do Nothing. If not met Add Chiller System without the CT fans. (Make new Scenario for this.) Update the time stamp to 90 seconds mismatch/Eqp_Faulty alarm.
// step 7: Ramp down all pumps to 70. ****
let hasTriggered = false; // Means PID ENABLED
function checkpriVFD() {
  let activePriVarPmp = [],
    vfd = null,
    mostRecentEqp = null;
  let priVariable = dataHandler.getSiteSpecificDataItem([
    "Plant_Snapshot",
    "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
  ]);
  for (let myeqp in priVariable) {
    let expected = 1;
    let actual = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
      myeqp,
      "Eqp_Attributes",
      "PriV_Pmp_On_Off_SS",
      "presentValue",
    ]);
    if (actual === "1" || actual === "active") {
      actual = 1;
    }
    if (actual === "0" || actual === "inactive") {
      actual = 0;
    }
    if (expected === actual) {
      activePriVarPmp.push(myeqp);
    }
  }
  //// Logic to Find the speed of most recent Pump VFD
  let currentTimestamp = cpmUtils.getCurrentTime();
  for (myeqp in activePriVarPmp) {
    let mostRecentTime = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
      activePriVarPmp[myeqp],
      "Eqp_Metrics",
      "Controlled_Time",
    ]);
    if (currentTimestamp > mostRecentTime) {
      mostRecentTime = currentTimestamp;
      mostRecentEqp = activePriVarPmp[myeqp];
    }
  }
  if (mostRecentEqp) {
    vfd = parseInt(
      dataHandler.getSiteSpecificDataItem([
        "Plant_Snapshot",
        "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
        mostRecentEqp,
        "Eqp_Attributes",
        "PriV_Pmp_VFD_Fbk",
        "presentValue",
      ])
    );
  }
  if (activePriVarPmp.length > 0 && !hasTriggered) {
    console.log(
      `--Working Pump-- ${activePriVarPmp} -- > ${JSON.stringify(vfd)}`
    );
    dataHandler.controlPID("active");
    hasTriggered = true; // Set the flag to true after triggering the logic
    logger.info(`========PID ENABLED ${hasTriggered}=============`);
  }
  if (hasTriggered) {
    let dptDevice = Object.keys(
      dataHandler.getSiteSpecificDataItem([
        "Plant_Snapshot",
        "NONGL_SS_DPT_DEVICE",
      ])
    );
    let currentTime = cpmUtils.getCurrentTime();
    let monitorParameter = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_DPT_DEVICE",
      dptDevice[0],
      "Eqp_Metrics",
      "Monitor_Parameter",
    ]);
    let ts = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_DPT_DEVICE",
      dptDevice[0],
      "Eqp_Metrics",
      "THRESHOLD_CROSSED_TIMESTAMP",
    ]);
    let crossingInterval = dataHandler.getSiteSpecificDataItem([
      "Plant_Snapshot",
      "NONGL_SS_DPT_DEVICE",
      dptDevice[0],
      "Eqp_Metrics",
      "THRESHOLD_CROSSING_INTERVAL",
    ]);
    if (monitorParameter) {
      if (!ts) {
        dataHandler.updateTimeStamp(
          "NONGL_SS_DPT_DEVICE",
          dptDevice[0],
          currentTime,
          null
        );
        logger.info(`============Updated Time Stamp DPT DEVICE ==========`);
      } else if (
        datefns.differenceInSeconds(currentTime, ts) > crossingInterval
      ) {
        // logger.info(`============Threshold TimeStamp==========`);
        if (vfd === 100) {
          logger.info("========SPEED 100 PERCENT=========");
          let myresult = dataHandler.dptCheck();
          if (!myresult) {
            logger.info("=============DPT SETPOINT MISMATCH===========");
            // Add Chiller System
            let payload = {
              body: {
                startCPMScenario: "ADD_WATER_COOLED_CHILLER_SYSTEM",
              },
            };
            processMyCpmNotification(payload, (err, ree) => {
              if (err) console.log("err in jw setT", err);
              if (res) {
                console.log("reee", ree);
              }
            });
            //Disable PID hasTriggered False.
            dataHandler.updateTimeStamp(
              "NONGL_SS_DPT_DEVICE",
              dptDevice[0],
              (ts = null),
              900
            );
            logger.info(`============Updated Time Stamp DPT DEVICE ==========`);
            dataHandler.controlPID("inactive");
            hasTriggered = false;
            logger.info(`========PID DISABLED=============`);
          } else {
            //Do Nothing
          }
        }
      }
    }
  }
}

function checkAlarms() {
  try {
    // console.log("checkAlarms started");
    dataHandler.sendDataToAlarms((err, res) => {
      if (err) {
        console.log("Error Receiving Grouped Data from SendDataAlarms.");
      } else {
        Object.keys(res).map((uuid) => {
          let entries = res[uuid],
            insertData = [],
            restoreData = [];
          // await Promise.all(
          entries.map((entry) => {
            let sstype = entry.ss_type,
              pvalue = null;
            // Check Restore If any alarm in alarm Table
            // model.checkRestore(uuid, (err, results) => {
            // 	if (err) {
            // 		reject("Error in restore: " + err);
            // 	} else {
            // 		if (results.length > 0 &&results[0].hasOwnProperty("restore") && results[0].hasOwnProperty("downtime")){
            // 			const restoreValue = results[0].restore;
            // 			const downtime = results[0].downtime;
            // 			if (restoreValue === 1) {
            // 				console.log("Inside Check restore.");
            // 				dataHandler.updateTripStatus(sstype, uuid, false);
            // 				dataHandler.updateEquipmentFaulty(sstype,uuid,false);
            // 				dataHandler.updateInUse(sstype,uuid,false);
            // 			}
            // 		}
            // 	}
            // });
            let param_id = {
              NONGL_SS_AIR_COOLED_CHILLER: "CH_Trip_SS",
              NONGL_SS_PUMPS: "Pri_Pmp_Trip_SS",
              NONGL_SS_SECONDARY_PUMPS: "Sec_Pmp_Trip_SS",
              NONGL_SS_PRIMARY_VARIABLE_PUMPS: "PriV_Pmp_Trip_SS",
            };
            // Handle the different param_ids
            let alarm = dataHandler.getSiteSpecificDataItem([
              "Plant_Snapshot",
              sstype,
              uuid,
              "Eqp_Metrics",
              "Alarm",
            ]);
            let alarmcode = dataHandler.getSiteSpecificDataItem([
              "AlarmParams",
              param_id[sstype],
            ]);
            pvalue = dataHandler.getSiteSpecificDataItem([
              "Plant_Snapshot",
              sstype,
              uuid,
              "Eqp_Attributes",
              param_id[sstype],
              "presentValue",
            ]);
            if (
              alarm === true &&
              pvalue === "inactive" &&
              entry.param_id !== "Equipment_Faulty"
            ) {
              // console.log("=========CAME TO RESTORE========");
              // dataHandler.updateTripStatus(sstype,uuid,false);
              restoreData.push({
                ss_id: uuid,
                alarm_code: alarmcode,
                measured: datefns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                param_id: param_id[sstype],
                message: param_id[sstype],
                ss_type: sstype,
              });
              model.addAlarmData([], [], restoreData, (err, results) => {
                if (err) {
                  console.log(err);
                } else {
                  dataHandler.updateAlarmCode(sstype, uuid, alarmcode, false);
                  // console.log("Restored Alarm in ADD ALARM DATA.")
                }
              });
            }
            if (entry.param_id) {
              // console.log(entry.param_id,"----entry.param_id--------",uuid);
              let filteredData =
                entry.message === "No Fault"
                  ? entries.filter((entry) => entry.message === "No Fault")
                  : entries.filter(
                      (entry) => entry.message !== "No Fault" && entry.param_id
                    );
              let currentRqpAlarmSS = dataHandler.getSiteSpecificDataItem(
                ["Plant_Snapshot", sstype, uuid, "Eqp_Metrics", "Alarm_code"],
                true
              );
              let alarmCode = dataHandler.getSiteSpecificDataItem([
                "AlarmParams",
                entry.param_id,
              ]);
              if (entry.param_id !== "Equipment_Faulty") {
                pvalue = dataHandler.getSiteSpecificDataItem([
                  "Plant_Snapshot",
                  sstype,
                  uuid,
                  "Eqp_Attributes",
                  entry.param_id,
                  "presentValue",
                ]);
              } else {
                pvalue = "active";
              }
              if (pvalue === "active" && alarm === false) {
                let alarmExists = currentRqpAlarmSS.includes(alarmCode);
                if (alarmExists) {
                  // Update existing alarm in DB (Only update, don't insert again)
                  model.addAlarmData([], filteredData, [], (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Updated existing Alarm in ADD ALARM DATA.");
                    }
                  });
                } else {
                  // Only insert new alarm if it is NOT already present
                  console.log("Creating new alarm record in DB11111.");
                  let insertData = [
                    [
                      uuid,
                      alarmCode,
                      entry.message,
                      entry.param_id,
                      datefns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                    ],
                  ];

                  dataHandler.updateAlarmCode(sstype, uuid, alarmCode, true);
                  dataHandler.updateTripStatus(sstype, uuid, true); // Mark as active in system
                  model.addAlarmData(insertData, [], [], (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Inserted new Alarm in ADD ALARM DATA.");
                    }
                  });
                  // dataHandler.updateAlarmCode(sstype, uuid, alarmCode, true);
                }
              } else {
                let alarmExists = currentRqpAlarmSS.includes(alarmCode);
                if (alarmExists) {
                  // Only update existing alarms, no duplicate insertions
                  model.addAlarmData([], filteredData, [], (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Updated existing Alarm in ADD ALARM DATA.");
                    }
                  });
                } else {
                  // Insert new alarm if it does not exist
                  console.log("Creating new alarm record in DB2222.");
                  let insertData = [
                    [
                      uuid,
                      alarmCode,
                      entry.message,
                      entry.param_id,
                      datefns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
                    ],
                  ];

                  dataHandler.updateAlarmCode(sstype, uuid, alarmCode, true);
                  console.log("Im updating trip in else as true");
                  dataHandler.updateTripStatus(sstype, uuid, true); // Ensure only one active alarm
                  model.addAlarmData(insertData, [], [], (err, results) => {
                    if (err) {
                      console.log(err);
                    } else {
                      console.log("Inserted new Alarm in ADD ALARM DATA.");
                    }
                  });
                }
              }
              // dataHandler.updateConcurrent(false);
              switch (entry.param_id) {
                case "Equipment_Faulty":
                  if (alarm === false) {
                    dataHandler.updateTripStatus(sstype, uuid, true);
                    dataHandler.updateEquipmentFaulty(sstype, uuid, false);
                    console.log(`FLAGS === ALARM : ${alarm} `);
                  }
                  break;
                case "CH_Trip_SS":
                  if (alarm === false) {
                    dataHandler.updateTripStatus(
                      "NONGL_SS_AIR_COOLED_CHILLER",
                      uuid,
                      true
                    );
                    logger.info(`FLAGS === ALARM : ${alarm} `);
                    logger.info("Trigger Scenario HANDLE CHILLER TRIP");
                    let cpmCombination = dataHandler.getSiteSpecificDataItem([
                      "Plant_Snapshot",
                      "NONGL_SS_AIR_COOLED_CHILLER",
                      uuid,
                      "Equipment_Group",
                    ]);
                    let payload = {
                      body: {
                        startCPMScenario: "HANDLE_TRIP_AIR_COOLED_CHILLER",
                        CPMCombination: cpmCombination,
                      },
                    };
                    let ongoingScenario = { Active_Scenario: {} };
                    ongoingScenario["Active_Scenario"][
                      "Working_On_Equipment"
                    ] = {};
                    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
                      "NONGL_SS_AIR_COOLED_CHILLER"
                    ] = uuid;
                    dataHandler.setSiteSpecificDataItems(ongoingScenario);
                    // processMyCpmNotification(payload,
                    // });
                    processMyCpmNotification(payload, responseToCall());
                  }
                  break;
                case "Pri_Pmp_Trip_SS":
                  if (alarm === false) {
                    dataHandler.updateTripStatus("NONGL_SS_PUMPS", uuid, true);
                    logger.info(`FLAGS === ALARM : ${alarm} `);
                    logger.info("Trigger Scenario HANDLE PRIMARY PUMP TRIP");
                    let cpmCombination = dataHandler.getSiteSpecificDataItem([
                      "Plant_Snapshot",
                      "NONGL_SS_PUMPS",
                      uuid,
                      "Equipment_Group",
                    ]);
                    let payload = {
                      body: {
                        startCPMScenario: "HANDLE_TRIP_PRIMARY_PUMP",
                        CPMCombination: cpmCombination,
                      },
                    };
                    let ongoingScenario = { Active_Scenario: {} };
                    ongoingScenario["Active_Scenario"][
                      "Working_On_Equipment"
                    ] = {};
                    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
                      "NONGL_SS_PUMPS"
                    ] = uuid;
                    dataHandler.setSiteSpecificDataItems(ongoingScenario);
                    // processMyCpmNotification(payload,(err,ree)=>{
                    // 	if(err)console.log("err in jw setT",err)
                    // 	if(res){
                    // 		console.log("reee",ree)
                    // 	}
                    // });
                    processMyCpmNotification(payload, responseToCall());
                  }

                  break;

                case "Cnd_Pmp_Trip_SS":
                  if (alarm === false) {
                    dataHandler.updateTripStatus(
                      "NONGL_SS_CONDENSER_PUMPS",
                      uuid,
                      true
                    );
                    logger.info(`FLAGS === ALARM : ${alarm} `);
                    console.log("Trigger Scenario Replace CONDENSER Pump");
                    let cpmCombination = dataHandler.getSiteSpecificDataItem([
                      "Plant_Snapshot",
                      "NONGL_SS_CONDENSER_PUMPS",
                      uuid,
                      "Equipment_Group",
                    ]);
                    let payload = {
                      body: {
                        startCPMScenario: "HANDLE_TRIP_CONDENSER_PUMP",
                        CPMCombination: cpmCombination,
                      },
                    };
                    let ongoingScenario = { Active_Scenario: {} };
                    ongoingScenario["Active_Scenario"][
                      "Working_On_Equipment"
                    ] = {};
                    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
                      "NONGL_SS_CONDENSER_PUMPS"
                    ] = uuid;
                    dataHandler.setSiteSpecificDataItems(ongoingScenario);
                    processMyCpmNotification(payload, (err, ree) => {
                      if (err) console.log("err in jw setT", err);
                      if (res) {
                        console.log("reee", ree);
                      }
                    });
                  }
                  break;
                case "Sec_Pmp_Trip_SS":
                  if (alarm === false) {
                    dataHandler.updateTripStatus(
                      "NONGL_SS_SECONDARY_PUMPS",
                      uuid,
                      true
                    );
                    logger.info(`FLAGS === ALARM : ${alarm} `);
                    logger.info("Trigger Scenario HANDLE SECONDARY PUMP TRIP");
                    let cpmCombination = dataHandler.getSiteSpecificDataItem([
                      "Plant_Snapshot",
                      "NONGL_SS_SECONDARY_PUMPS",
                      uuid,
                      "Equipment_Group",
                    ]);
                    let payload = {
                      body: {
                        startCPMScenario: "HANDLE_TRIP_SECONDARY_PUMP",
                        CPMCombination: cpmCombination,
                      },
                    };
                    let ongoingScenario = { Active_Scenario: {} };
                    ongoingScenario["Active_Scenario"][
                      "Working_On_Equipment"
                    ] = {};
                    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
                      "NONGL_SS_SECONDARY_PUMPS"
                    ] = uuid;
                    dataHandler.setSiteSpecificDataItems(ongoingScenario);
                    // processMyCpmNotification(payload,(err,ree)=>{
                    // 	if(err)console.log("err in jw setT",err)
                    // 	if(res){
                    // 		console.log("reee",ree)
                    // 	}
                    // });
                    processMyCpmNotification(payload, responseToCall());
                  }
                  break;
                case "PriV_Pmp_Trip_SS":
                  if (alarm === false) {
                    dataHandler.updateTripStatus(
                      "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
                      uuid,
                      true
                    );
                    logger.info(`FLAGS === ALARM : ${alarm} `);
                    logger.info("Trigger Scenario HANDLE SECONDARY PUMP TRIP");
                    let cpmCombination = dataHandler.getSiteSpecificDataItem([
                      "Plant_Snapshot",
                      "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
                      uuid,
                      "Equipment_Group",
                    ]);
                    let payload = {
                      body: {
                        startCPMScenario: "HANDLE_TRIP_SECONDARY_PUMP",
                        CPMCombination: cpmCombination,
                      },
                    };
                    let ongoingScenario = { Active_Scenario: {} };
                    ongoingScenario["Active_Scenario"][
                      "Working_On_Equipment"
                    ] = {};
                    ongoingScenario["Active_Scenario"]["Working_On_Equipment"][
                      "NONGL_SS_PRIMARY_VARIABLE_PUMPS"
                    ] = uuid;
                    dataHandler.setSiteSpecificDataItems(ongoingScenario);
                    // processMyCpmNotification(payload,(err,ree)=>{
                    // 	if(err)console.log("err in jw setT",err)
                    // 	if(res){
                    // 		console.log("reee",ree)
                    // 	}
                    // });
                    processMyCpmNotification(payload, responseToCall());
                  }
                  break;
                default:
                  // console.log("Unhandled param_id: " + entry.param_id);
                  break;
              }
            }
          });
        });
      }
    });
  } catch (error) {
    console.error("Error in checkAlarms: ", error);
  }
}

module.exports = {
  processMyCpmNotification,
  processNotification,
  processWatchDog,
  hdlEquipmentAction,
  processAlarms,
};
