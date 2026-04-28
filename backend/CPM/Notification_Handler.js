const cpmUtils = require('./CPM_Utilities');
const scenarioHandler = require('./CPM_Scenario_Handler');
const dataHandler = require('./CPM_Data_Handler');
const datefns = require('date-fns');
const sc = require('./snapshot_check')
const c = require('ansi-colors');
const runhour = require('./../Apps/Run_hour/run_hour')
const alarm = require('./../Apps/Alarm_others/Alarm_other_Json')
/*
curl --header "Content-Type: application/json" -d "{\"noid\":\"ec703a94-9e61-11ee-baaa-0a3ce5ae2e08\"}" -k https://localhost:8443/v1/newapis/mypost
curl --header "Content-Type: application/json" -d "{\"id\":\"ec703a94-9e61-11ee-baaa-0a3ce5ae2e08\"}" -k https://localhost:8443/v1/newapis/mypost
*/

/*
My Next Steps:
Clean up and make files consistent and clear
Standard functions as utils:
	response for success and error
	mycallback
Handling synchronous and asynchronous operations with optimization
Handling PBS Notifications and correlate with CPM Scenarios
BACnet write/ read operations
Implementation of State Changes
Find Equipment Based on Criteria
Handling Timeout in PBS Notifications
Handling Errors and Exceptions
Sync up Database as required
Support for Commissioning

Trigger Scenario
Trigger State Change Programmatically

CPM Implementation to be done - discussion 11th March
Exceptional Cases - Cooling Tower DONE
'LEAST' kind of values in computation of Params
Check Process params and Trigger Scenario - DUMMY DONE
Implementatin of errors in state changes and Error Scenario Handling
Integrate PBS Gen 2/ Simulator
DB Sync
Integerate BACnet write
Define the Demo(s) and work with priorty backwards.
Handling critical fault when a scenario is running

Update Faulty/ Working for equipment from UI also
Find all equipment to start with instead of later - DONE

Handle Errors like delay - Trigger State Transition to Failure
Handle Failure in Scenario
Handle External/ Unexpected Fault - Even with Ongoing Scenario
Monitor Process Parameter IN/ OUT OF RANGE
Trigger Scenario Based on Logical Requirements or otherwise - like Process Parameter OUT OF RANGE

Actions Required - 19 March 2024
	Simulator/ Equipment-DDC
		Add Remaining Equipment
			Added Chiller, Primary Pump and Secondary Pump
			To be Added - Condenser Pump, Cooling Tower, Cooling Tower Fan and others
		Configure Plant with multiple equipment of each type
			For e.g., Chiller - 10, PP - 11, SP - 11, ...
		Load Data from GL Code Book as CSV file, rather than coded in the Simulator
	PBS
		Preparation of Text File Data Load
		Mapping to Database Tables as per IBMS Specifications
	GLS
		High Level Notification Handler
		APIs for UI 
	CPM Data JSON
		Add Scenarios/ Flows - with Faults and Recovery
		Add State Transitions - covering Faults and Recovery
		Plant Snapshot Data Load from Database - DONE
	Notification Handler
		Data Load from PBS
		Update Plant Snapshot
		Redirect CPM Notifications to Scenario Handler
		Handle / Provision for Identification and Handling of Faults
		Clean up Identification and Handling of Faults detecting Delays
		Clean up Monitoring of Process Parameters/ Provision for Other Parameters/ Computation
	Scenario Handler
		Clean up handling "handleFailure" and Special Scenario States
			SCENARIO_STARTED
			SCENARIO_ABORTED
			SCENARIO_RECOVERED_FROM_FAILURE
			SCENARIO_COMPLETED
		Handle Latency, if required
		Clean Up: Handle Priority Faults - Pause and Resume
	Data Handler
		Identify and prepare actions for Scenario State Transitions
			snapshot_check
			any others, as required
		Clean up actions for Scenario State Transitions
			find_update
			bacnet_write
	Utilities
		Identify/ Implement Reusable functions and utilities
		Clean up console out/ log file and others
		Audit Trail
	Others
		Consistent use of callback(e, s) and responding appropriately back to the caller Web or otherwise
*/

function checkProcessParametersDPT() {
    // Example to handle monitoring process parameters - to be changed based on further details
    const headerPath = ["Plant_Snapshot", "NONGL_SS_DPT", "0005ba0000", "Eqp_Metrics" ];
    const attributesPath = ["Plant_Snapshot", "NONGL_SS_DPT", "0005ba0000", "Eqp_Attributes"];
   
    let secPmpSS =  dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS']);
    let activeSSPmp = [];
 
    for (myeqp in secPmpSS){
        let expectedVfd = 100;
        let expected = 1;
 
        let actual = cpmUtils.getJSONElement(secPmpSS[myeqp],['Eqp_Attributes','Sec_Pmp_SS','presentValue'],true);
        if(expected === actual){
            // let actualVFD = cpmUtils.getJSONElement(secPmpSS[myeqp],['Eqp_Attributes','Sec_Pmp_SS','presentValue'],true);
            activeSSPmp.push(myeqp);
        }
    }
    console.log("My Active SS PUMPS",activeSSPmp);
 
    let header = dataHandler.getSiteSpecificDataItem([...headerPath ,"Monitor_Parameter"]);//true or false
    let dpt = dataHandler.getSiteSpecificDataItem([...attributesPath,"DPT", "presentValue"], true);
    let dpt_sp = dataHandler.getSiteSpecificDataItem([...attributesPath, "DPT_SP","presentValue"], true);
    let metric = dpt_sp - dpt;
   
    let upperThreshold = 10;
    // dataHandler.getSiteSpecificDataItem([...headerPath, "UPPER_THRESHOLD"], true);
    let lowerThreshold = -10;
    // dataHandler.getSiteSpecificDataItem([...headerPath, "LOWER_THRESHOLD"], true);
 
 
    let ts = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"]);
    let currentTime = cpmUtils.getCurrentTime();
    let crossingInterval = dataHandler.getSiteSpecificDataItem([...headerPath,"THRESHOLD_CROSSING_INTERVAL"]);
 
    if (header === true) {
        // if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
        // if((metric > 5) || (metric < -5)){
        if (!(metric >= -10 && metric <= 10)) {
            cpmUtils.myError(`process_parameter_crossed ${cpmUtils.getCurrentTime()}=====${metric}`);
            if(!ts){
                let ppviolation = {
                    "Plant_Snapshot": {
                        "NONGL_SS_DPT": {
                            "0005ba0000": {
                                "Eqp_Metrics": {
                                    "THRESHOLD_CROSSED_TIMESTAMP": currentTime,
                                    "THRESHOLD_CROSSED_VALUE": metric
                                }
                            }
                        }
                    }
                };
            dataHandler.setSiteSpecificDataItems(ppviolation);
        }
        //Log or Handle Start Scenario if Required
        else if(datefns.differenceInSeconds(currentTime,ts) > crossingInterval){
             
                cpmUtils.mySuccess('New Scenario to be Started');
                let workingSecPump=[]
                activeSSPmp.forEach(device => {
                    pmpSpeed = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS',device,'Eqp_Attributes','Sec_Pmp_VFD_Fbk','presentValue']);
                    if(pmpSpeed !== 100){
                        workingSecPump.push(device)
                        // if(metric>upperThreshold){
                        //  cpmUtils.sudhu(`ADD SS PUMP SCENARIO`);
                        //  updateDPT();
                        // }
                    }
                });
                console.log(`working ss pump not reached speed 100 :${workingSecPump}`)
            if(workingSecPump.length>0){
                pmpSpeed = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS',workingSecPump[0],'Eqp_Attributes','Sec_Pmp_VFD_Fbk','presentValue']);
 
                console.log("Pump Speed ",pmpSpeed);
                console.log(`metric ${metric}`)
                if(pmpSpeed === 100){
                    console.log("*****")
                    if(metric>upperThreshold){
                        cpmUtils.sudhu(`ADD SS PUMP SCENARIO`);
                        updateDPT();
                    }
                }else{
                    console.log("VFD FBK is still ongoing..!!")
                }
            }else{if(metric>upperThreshold){
                cpmUtils.sudhu(`ADD SS PUMP SCENARIO`);
                // updateDPT();
            }
        }
                // if(metric>upperThreshold){
                //  cpmUtils.sudhu(`ADD SCENARIO`)
                //  // handleScenarioStartRequest('ADD_SECONDARY_PUMP', null);
                // }
                // if(metric<lowerThreshold){
                //  cpmUtils.sudhu(`REMOVE SCENARIO`)
                //  // handleScenarioStartRequest('STOP_WATER_COOLED_CHILLER_SYSTEM', null);
                //  // handleScenarioStartRequest('ADD_SECONDARY_PUMP', null);
                // }
                // updateHeader();
            }
      }else{
        console.log("No Pump required...! Metric is :",metric);
      }
    }
 
}
 
function updateDPT(){
   
    let paramJSON = {
        "Plant_Snapshot":
            { "NONGL_SS_DPT": { "0005ba0000": { "Eqp_Attributes": { "DPT": { "presentValue": 505 } } } } }
    };
    // Update Header Temperature presentValue
    dataHandler.setSiteSpecificDataItems(paramJSON);
    console.log("*********UPDATED DPT******");
};

function handleScenarioStateTransition(scenario, scenarioParams, mycallback = null) {
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	scenarioHandler.processCPMScenarioStateWithParams(scenario, scenarioParams, mycallback);
}

let mycount = 0;
function handleScenarioStartRequest(scenario, scenarioParams, mycallback = null) {
	
	let ongoingScenario = dataHandler.getSiteSpecificDataItem(["Active_Scenario", "Working_Scenario_Id"]);
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	if (ongoingScenario == "scenario_uuid") {
		// prepare request uuid and respond with uuid and timestamp
		let currentScenarioJson = { "Active_Scenario": {} };
		currentScenarioJson["Active_Scenario"]['Working_Scenario_Type'] = scenario;
		currentScenarioJson["Active_Scenario"]['Working_Scenario_Id'] = cpmUtils.getUUID();
		currentScenarioJson["Active_Scenario"]['Scenario_Current_State'] = "SCENARIO_STARTED";
		currentScenarioJson["Active_Scenario"]['State_Change_Timestamp'] = cpmUtils.getCurrentTime();
		// Update Active Scenario
		dataHandler.setSiteSpecificDataItems(currentScenarioJson);
		scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
		dataHandler.getCPMSnapshot(false);
	} else {
		mycallback(`Working with a Scenario ${ongoingScenario}; Please wait...`);
	}
}

// for the external trigger from UI or Schedule or any other logic
// curl --header "Content-Type: application/json" -d "{\"noid\":\"ec703a94-9e61-11ee-baaa-0a3ce5ae2e08\"}" -k https://localhost:8443/v1/newapis/mypost
function onTriggerCPMScenario(scenario = '', scenarioParams = {}, mycallback) {
	handleScenarioStartRequest(scenario, scenarioParams, mycallback);
	// let scenarioStartingState = dataHandler.getSiteSpecificDataItem(["CPM_Scenario_Flow", scenario, "SCENARIO_STARTED"]);
	// if (scenarioStartingState){
	// 	mycallback(null, `Starting Scenario: ${scenario} at ${scenarioStartingState}`);
	// } else {
	// 	mycallback(`Invalid Scenario: ${scenario}`);
	// }
	// switch (scenario) {
	// 	case 'START_A_CHILLER':
	// 		// do start chiller
	// 		scenarioParams['activeScenario'] = 'START_A_CHILLER';
	// 		scenarioHandler.startChillerScenarioHandler(scenarioParams, mycallback);
	// 		break;
	// 	case 'STOP_CHILLER':
	// 		// do stop chiller
	// 		break;
	// 	default:
	// 		// handle error / unexpected scenario
	// 		break;
	// }
}

// to handle the notification from Data Acquisistion Systems like PBS
function onNotificationReceived(notificationData = {}, mycallback) {
	// process Notification Data to identify equipment id and type, parameter and other details
	let myDetails = cpmUtils.onNotifyCPMParamData(notificationData);
	switch (myDetails['activeScenario']) {
		case 'START_A_CHILLER':
			scenarioHandler.startChillerScenarioHandler(scenarioParams, mycallback);
			break;
		default:
			// handle error / unexpected scenario
			break;
	}
}

function prepareErrorResponse(e, res) {
	return res.status(400).json({ error: e });
	// return res.status(400).send({
	// 	message: `Error in ${e}`
	// });
}


function checkProcessParametersDPT() {
	// Example to handle monitoring process parameters - to be changed based on further details
	const headerPath = ["Plant_Snapshot", "NONGL_SS_DPT", "0005ba0000", "Eqp_Metrics" ];
	const attributesPath = ["Plant_Snapshot", "NONGL_SS_DPT", "0005ba0000", "Eqp_Attributes"];
	
	let secPmpSS =  dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS']);
	let activeSSPmp = [];

	for (myeqp in secPmpSS){
		let expectedVfd = 100;
		let expected = 1;

		let actual = cpmUtils.getJSONElement(secPmpSS[myeqp],['Eqp_Attributes','Sec_Pmp_SS','presentValue'],true);
		if(expected === actual){
			// let actualVFD = cpmUtils.getJSONElement(secPmpSS[myeqp],['Eqp_Attributes','Sec_Pmp_SS','presentValue'],true);
			activeSSPmp.push(myeqp);
		}
	}
	console.log("My Active SS PUMPS",activeSSPmp);

	let header = dataHandler.getSiteSpecificDataItem([...headerPath ,"Monitor_Parameter"]);//true or false
	let dpt = dataHandler.getSiteSpecificDataItem([...attributesPath,"DPT", "presentValue"], true);
	let dpt_sp = dataHandler.getSiteSpecificDataItem([...attributesPath, "DPT_SP","presentValue"], true);
	let metric = dpt_sp - dpt;
	
	let upperThreshold = 10; 
	// dataHandler.getSiteSpecificDataItem([...headerPath, "UPPER_THRESHOLD"], true);
    let lowerThreshold = -10;
	// dataHandler.getSiteSpecificDataItem([...headerPath, "LOWER_THRESHOLD"], true);


    let ts = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"]);
	let currentTime = cpmUtils.getCurrentTime();
	let crossingInterval = dataHandler.getSiteSpecificDataItem([...headerPath,"THRESHOLD_CROSSING_INTERVAL"]);

	if (header === true) {
		// if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
		// if((metric > 5) || (metric < -5)){
		if (!(metric >= -10 && metric <= 10)) {
			cpmUtils.myError(`process_parameter_crossed ${cpmUtils.getCurrentTime()}=====${metric}`);
			if(!ts){
				let ppviolation = {
                    "Plant_Snapshot": {
                        "NONGL_SS_DPT": {
                            "0005ba0000": {
                                "Eqp_Metrics": {
                                    "THRESHOLD_CROSSED_TIMESTAMP": currentTime,
                                    "THRESHOLD_CROSSED_VALUE": metric
                                }
                            }
                        }
                    }
                };
			dataHandler.setSiteSpecificDataItems(ppviolation);
		}
		//Log or Handle Start Scenario if Required
		else if(datefns.differenceInSeconds(currentTime,ts) > crossingInterval){
			 
				cpmUtils.mySuccess('New Scenario to be Started');
				let workingSecPump=[]
				activeSSPmp.forEach(device => {
					pmpSpeed = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS',device,'Eqp_Attributes','Sec_Pmp_VFD_Fbk','presentValue']);
					if(pmpSpeed !== 100){
						workingSecPump.push(device);
					}
				});	
				console.log(`working ss pump not reached speed 100 :${workingSecPump}`)
			
				if(workingSecPump.length>0){
					pmpSpeed = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot','NONGL_SS_SECONDARY_PUMPS',workingSecPump[0],'Eqp_Attributes','Sec_Pmp_VFD_Fbk','presentValue']);

					console.log("Pump Speed ",pmpSpeed);
					console.log(`metric ${metric}`)
					if(pmpSpeed === 100){
						console.log("*****")
						if(metric>upperThreshold){
							cpmUtils.sudhu(`ADD SS PUMP SCENARIO`);
							updateDPT();
						}
						if(metric>lessThreshold){
							cpmUtils.sudhu(`Remove SS PUMP SCENARIO`);
							updateDPT();
						}
					}else{
						console.log("VFD FBK is still ongoing..!!")
					}
				}else{
					// if(metric>upperThreshold){
					// 	cpmUtils.sudhu(`ADD SS PUMP SCENARIO`);
					// // updateDPT();
					// }
					cpmUtils.sudhu(`No SS Pump Running...!!`)
				}
			}
	  }else{
		console.log("No Pump required...! Metric is :",metric);
	  }
	}

}

function updateDPT(){
	
	let paramJSON = {
		"Plant_Snapshot":
			{ "NONGL_SS_DPT": { "0005ba0000": { "Eqp_Attributes": { "DPT": { "presentValue": 505 } } } } }
	};
	// Update Header Temperature presentValue
	dataHandler.setSiteSpecificDataItems(paramJSON);
	console.log("*********UPDATED DPT******");
};
		

// Sample to update Plant_Snapshot data - used to stop repeated triggering of START_CHILLER_PLANT
function updateHeader() {
	// "Plant_Snapshot", "NONGL_SS_HEADER", "0005b90000", "Eqp_Attributes", "CWH_ST", "presentValue"
	let paramJSON = {
		"Plant_Snapshot":
			{ "NONGL_SS_HEADER": { "0000b90000": { "Eqp_Attributes": { "CWH_ST": { "presentValue": 7.0 } } } } }
	};
	// Update Header Temperature presentValue
	dataHandler.setSiteSpecificDataItems(paramJSON);
}

function checkProcessParameters() {
    const headerPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0000b90000", "Eqp_Metrics"];
    const attributesPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0000b90000", "Eqp_Attributes"];

    let monitorParameter = dataHandler.getSiteSpecificDataItem([...headerPath, "Monitor_Parameter"]);
    let checkParameter = dataHandler.getSiteSpecificDataItem([...headerPath, "Check_Parameter"]);
    
	let setpoint = dataHandler.getSiteSpecificDataItem([...attributesPath, "CWH_ST_SP","presentValue"], true);
    let presentValue = dataHandler.getSiteSpecificDataItem([...attributesPath, "CWH_ST", "presentValue"], true);
    let thresholdMargin = 1.0; // +/- margin around the setpoint
	let currentTime = cpmUtils.getCurrentTime();
    // Calculate dynamic thresholds based on setpoint
    let upperThreshold = setpoint + thresholdMargin;
    let lowerThreshold = setpoint - thresholdMargin;

    let ts = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"]);
    let crossingInterval = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSING_INTERVAL"]);
    if (monitorParameter === true) {
		// handleScenarioStartRequest('START_WATER_COOLED_CHILLER_SYSTEM', null);
		// if(checkParameter===true){
		if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
				if (!ts) {
					let ppviolation = {
						"Plant_Snapshot": {
							"NONGL_SS_HEADER": {
								"0000b90000": {
									"Eqp_Metrics": {
										"THRESHOLD_CROSSED_TIMESTAMP": currentTime,
										"THRESHOLD_CROSSED_VALUE": presentValue
									}
								}
							}
						}
					};
					dataHandler.setSiteSpecificDataItems(ppviolation);
				} else if (datefns.differenceInSeconds(currentTime, ts) > crossingInterval) {
					cpmUtils.myError(`Process parameter crossed ${cpmUtils.getCurrentTime()} ===== ${presentValue}`);
					cpmUtils.mySuccess('New Scenario to be Added');
					if (presentValue > upperThreshold) {
						dataHandler.setSiteSpecificDataItems([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"],100);
						handleScenarioStartRequest('START_WATER_COOLED_CHILLER_SYSTEM', null);
					}
					if (presentValue < lowerThreshold) {
						cpmUtils.myError(`Process parameter crossed ${cpmUtils.getCurrentTime()} ===== ${presentValue}`);
						cpmUtils.mySuccess('New Scenario to be Removed ');
						handleScenarioStartRequest('STOP_WATER_COOLED_CHILLER_SYSTEM', null);
					}
					updateHeader();
				}
		}
	}
}


// function checkProcessParameters() {
// 	// Example to handle monitoring process parameters - to be changed based on further details
// 	const headerPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0005b90000", "Eqp_Metrics" ];
// 	const attributesPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0005b90000", "Eqp_Attributes", "CWH_ST"];
	
// 	let header = dataHandler.getSiteSpecificDataItem([...headerPath ,"Monitor_Parameter"]);
// 	let presentValue = dataHandler.getSiteSpecificDataItem([...attributesPath, "presentValue"], true);
// 	let upperThreshold = dataHandler.getSiteSpecificDataItem([...headerPath, "UPPER_THRESHOLD"], true);
//     let lowerThreshold = dataHandler.getSiteSpecificDataItem([...headerPath, "LOWER_THRESHOLD"], true);
//     let ts = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"]);
// 	let currentTime = cpmUtils.getCurrentTime();
// 	let crossingInterval = dataHandler.getSiteSpecificDataItem([...headerPath,"THRESHOLD_CROSSING_INTERVAL"]);
// 	// cpmUtils.sudhu(`PRESENT_CH_HEADER_TEMP:${presentValue}`)
// 	if (header === true) {
// 		if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
// 			cpmUtils.myError(`process_parameter_crossed ${cpmUtils.getCurrentTime()}=====${presentValue}`);
// 			if(!ts){
// 				let ppviolation = {
//                     "Plant_Snapshot": {
//                         "NONGL_SS_HEADER": {
//                             "0005b90000": {
//                                 "Eqp_Metrics": {
//                                     "THRESHOLD_CROSSED_TIMESTAMP": currentTime,
//                                     "THRESHOLD_CROSSED_VALUE": presentValue
//                                 }
//                             }
//                         }
//                     }
//                 };
// 			dataHandler.setSiteSpecificDataItems(ppviolation);
// 		}
// 		//Log or Handle Start Scenario if Required
// 		else if(datefns.differenceInSeconds(currentTime,ts) > crossingInterval){
// 				cpmUtils.mySuccess('New Scenario to be Started');
// 				if(presentValue>upperThreshold){
// 					cpmUtils.sudhu(`ADD SCENARIO`)
// 					handleScenarioStartRequest('START_AIR_COOLED_CHILLER_SYSTEM', null);
// 				}
// 				if(presentValue<lowerThreshold){
// 					cpmUtils.sudhu(`REMOVE SCENARIO`)
// 					handleScenarioStartRequest('STOP_WATER_COOLED_CHILLER_SYSTEM', null);
// 				}
// 				updateHeader();
// 			}
// 	  }
// 	  }
// }

function processStartScenario(req,res){
	console.log("2")
	let cpmScenario = cpmUtils.getJSONElement(req, ['body', 'startCPMScenario']);
	cpmUtils.myDebug(`Currently Active Scenario: ${cpmUtils.myPrint(dataHandler.getActiveScenario())} Found: ${cpmScenario}`);
	cpmUtils.myTable(dataHandler.getActiveScenario());
	console.log(cpmScenario);
	if (cpmScenario && dataHandler.getSiteSpecificDataItem(["CPM_SCENARIOS"]).includes(cpmScenario)) {
		handleScenarioStartRequest(cpmScenario, {}, (e, s) => {
			if (e) prepareErrorResponse(e, res);
			if (s) res.json(s);
			// res.status(200).json()
		});
	} else {
		prepareErrorResponse(`processNotification-Unhandled startCPMScenario: ${cpmScenario} from ${req["url"]}`, res);
		// res.json(`Response from NH: ${cpmUtils.myPrint(req.body)}`);
	}
}

function processNotification(req, res) {
	// if ("id" in req.body) dataHandler.setEquipmentId([], req.body["id"]);
	let result = dataHandler.preProcessBody(req.body);
	if (result){
		console.log("Transition to processCPMScenario.")
		let currentScenarioJson = dataHandler.getActiveScenario();

	if (currentScenarioJson && currentScenarioJson["Working_Scenario_Id"] !== "scenario_uuid") {
		// process req and handle scenario state changecurl --header "Content-Type: application/json" -k https://localhost:8443/v1/newapis/mynotify -d "{}"
		scenarioHandler.processCPMScenarioStateWithParams(currentScenarioJson, req.body, (e, s) => {
			if (e) prepareErrorResponse(e, res);
			if (s) res.send(s);
		});
	} else {
		prepareErrorResponse(`processStateTransition-No Active Scenario for State Transition ${cpmUtils.myPrint(currentScenarioJson)} Ignoring...`, res);
	} 
}
}
 
function processStateTransition(req, res) {
	console.log("Working Scenario ID : ",dataHandler.getSiteSpecificDataItem(['Active_Scenario','Working_Scenario_Id']));
	// let currentScenarioJson = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	// Use the following so that we can handle the Unexpected High Priority Faults also as Scenario
	let currentScenarioJson = dataHandler.getActiveScenario();
	cpmUtils.myDebug(`processStateTransition - Active Scenario: ${cpmUtils.myPrint(currentScenarioJson)} Found: ${cpmUtils.myPrint(req.body)}`);
	cpmUtils.myTable(currentScenarioJson);
	if (currentScenarioJson && currentScenarioJson["Working_Scenario_Id"] !== "scenario_uuid") {
		// process req and handle scenario state changecurl --header "Content-Type: application/json" -k https://localhost:8443/v1/newapis/mynotify -d "{}"
		scenarioHandler.processCPMScenarioStateWithParams(currentScenarioJson, req.body, (e, s) => {
			if (e) prepareErrorResponse(e, res);
			if (s) res.send(s);
		});
	} else {
		prepareErrorResponse(`processStateTransition-No Active Scenario for State Transition ${cpmUtils.myPrint(currentScenarioJson)} Ignoring...`, res);
	}
}

function checkProcessParametersCoolingTower(){
	const headerPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0005b90000", "Eqp_Metrics" ];
	const attributesPath = ["Plant_Snapshot", "NONGL_SS_HEADER", "0005b90000", "Eqp_Attributes", "CWH_ST"];
	
	let header = dataHandler.getSiteSpecificDataItem([...headerPath ,"Monitor_Parameter"]);
	let presentValue = dataHandler.getSiteSpecificDataItem([...attributesPath, "presentValue"], true);
	let upperThreshold = dataHandler.getSiteSpecificDataItem([...headerPath, "UPPER_THRESHOLD"], true);
    let lowerThreshold = dataHandler.getSiteSpecificDataItem([...headerPath, "LOWER_THRESHOLD"], true);
    let ts = dataHandler.getSiteSpecificDataItem([...headerPath, "THRESHOLD_CROSSED_TIMESTAMP"]);
	let currentTime = cpmUtils.getCurrentTime();
	let crossingInterval = dataHandler.getSiteSpecificDataItem([...headerPath,"THRESHOLD_CROSSING_INTERVAL"]);

	if (header === true) {
		if ((presentValue > upperThreshold) || (presentValue < lowerThreshold)) {
			cpmUtils.myError(`process_parameter_crossed ${cpmUtils.getCurrentTime()}=====${presentValue}`);
			if(!ts){
				let ppviolation = {
                    "Plant_Snapshot": {
                        "NONGL_SS_HEADER": {
                            "0005b90000": {
                                "Eqp_Metrics": {
                                    "THRESHOLD_CROSSED_TIMESTAMP": currentTime,
                                    "THRESHOLD_CROSSED_VALUE": presentValue
                                }
                            }
                        }
                    }
                };
			dataHandler.setSiteSpecificDataItems(ppviolation);
		}
		//Log or Handle Start Scenario if Required
		else if(datefns.differenceInSeconds(currentTime,ts) > crossingInterval){ 
				cpmUtils.mySuccess('Add/remove CTF Scenario to be Started');
				if(presentValue>upperThreshold){
					cpmUtils.sudhu(`ADD CTF SCENARIO`)
					// handleScenarioStartRequest('START_WATER_COOLED_CHILLER_SYSTEM', null);
					handleScenarioStartRequest('ADD_COOLING_TOWER', null);
				}
				if(presentValue<lowerThreshold){
					cpmUtils.sudhu(`REMOVE_COOLING_TOWER`)
					// handleScenarioStartRequest('STOP_WATER_COOLED_CHILLER_SYSTEM', null);
				}
				updateHeader();
			}
	  }
	}
			cpmUtils.sudhu(`checkProcessParametersCoolingTower`)


}

function glWatchDog() {
	runhour.test()
	alarm.alarm()
	// Sample to ensure that watch dog is running - counts upto 5 only
	if (mycount < 5) cpmUtils.mySuccess(`Counter: ${mycount++} Time Now: ${cpmUtils.getCurrentTime()}`);

	// Handler waiting on Scenario State Transitions expected within specified time interval - say 20 seconds
	let currentScenario = dataHandler.getActiveScenario();
	if ((currentScenario !== null) && (currentScenario["Working_Scenario_Id"] !== "scenario_uuid")) {
		let maxDelay = dataHandler.getSiteSpecificDataItem([
			"Fault_Detection_Criteria",
			currentScenario["Scenario_Current_State"],
			"NO_RESPONSE_IN_SECONDS"
		], true);
		if ((maxDelay !== null) && datefns.differenceInSeconds((cpmUtils.getCurrentTime()), (currentScenario["State_Change_Timestamp"])) > maxDelay) {
			let testJSON = { "processWatchdog": {} };
			// testJSON[currentScenario["Scenario_Current_State"]] = "DELAYED";
			testJSON["processWatchdog"][currentScenario["Scenario_Current_State"]] = "DELAYED";
			cpmUtils.myError(`glWatchDog - Delay in : ${currentScenario["Scenario_Current_State"]}`);
			handleScenarioStateTransition(currentScenario, testJSON);
		}
	}

	//find cooling tower which are running
	// CT_Out_Vlv_On_Off_Fbk
	// let typedEqps = cpmUtils.getJSONElement(ibmsDataBlockJson,["Plant_Snapshot","NONGL_SS_COOLING_TOWER"]);
	let typedEqps = dataHandler.getSiteSpecificDataItem(["Plant_Snapshot","NONGL_SS_COOLING_TOWER"]);
	// cpmUtils.sudhu(`in notification handler watchdog ${Object.keys(typedEqps).length}`)
	let CT=[]
	// for(item in typedEqps){
		// console.log(`----${item}--------`)
		for (myeqp in typedEqps) {
			// console.log(`---${JSON.stringify(typedEqps[myeqp])}----myeqp------`)
		let expected=1	
		let actual = cpmUtils.getJSONElement(typedEqps[myeqp], ["Eqp_Attributes", "CT_Out_Vlv_On_Off_Fbk", "presentValue"], true);
		// cpmUtils.sudhu(`my actuall in watch dog ${actual}`)
		if(actual===expected){
			CT.push(myeqp)
		}
		}
	// }
	// console.log(`----final CT ${CT}`)
	//trigger only if any COOLING TOWER is running
	if(CT.length>0){
		// checkProcessParametersCoolingTower()
	}
	// Handler waiting on Monitoring Process Parameters and Triggering corresponding Scenarios
	checkProcessParameters();
	// checkProcessParametersDPT();

}

function processWatchDog() {
	glWatchDog();
}

function processCPMNotification(req, res) {
	let cpmScenario = cpmUtils.getJSONElement(req, ['body', 'startCPMScenario']);
	let cpmFaultScenario = cpmUtils.getJSONElement(req, ['body', 'priorityEquipmentFault'], true);
	if (cpmFaultScenario !== null) {
		dataHandler.prepareEquipmentFaultHandlingScenario(cpmFaultScenario, null, (e,s)=>{
			if (e) prepareErrorResponse(e, res);
			if (s) res.json(s);
		});
	} 
	else if (cpmScenario !== null)
		processStartScenario(req, res);
	
	else{
		cpmUtils.myPrint(c.bgRed("cpm scenario trying to transition"));
		cpmUtils.myPrint("cpm scenario trying to transition");
		processStateTransition(req, res);
		cpmUtils.myDebug(`processCPMNotification-: ${cpmUtils.myPrint(dataHandler.getActiveScenario())} Found: ${cpmScenario}`);cpmUtils.myTable(dataHandler.getActiveScenario());
	}
}

function getCPMSnapshotHandler(req, res) {
	res.json(dataHandler.getCPMSnapshot());
}


function hdlEquipmentAction(req,res){
	let cpmScenario = cpmUtils.getJSONElement(req, ['body', 'action']);
	let devType=cpmUtils.getJSONElement(req, ['body','ss_type']);
	let eqp = cpmUtils.getJSONElement(req,['body','id']);
	let ongoingScenario = dataHandler.getActiveScenario();
	
    if (cpmScenario in dataHandler.getSiteSpecificDataItem(['EQUIPMENT_CONTROL_ACTION'])) {
		if(devType in dataHandler.getSiteSpecificDataItem(['Plant_Snapshot'])){
			if(eqp in dataHandler.getSiteSpecificDataItem(['Plant_Snapshot',devType])){
				if (ongoingScenario["Working_Scenario_Id"] !== "scenario_uuid") {
					cpmUtils.myError(`handleScenarioStartRequest: Working with Scenario - ${ongoingScenario['Working_Scenario_Type']}`);
					res.send(`Working with a Scenario ${ongoingScenario["Working_Scenario_Id"]}; Please wait...`);
				}else{
					console.log(`START action to perform  ${cpmScenario}`)
					let currentScenarioJson = { "Active_Scenario": {} };
					currentScenarioJson["Active_Scenario"]['Working_Combination'] = "";
					currentScenarioJson["Active_Scenario"]['Working_Scenario_Type'] = cpmScenario;
					currentScenarioJson["Active_Scenario"]['Working_Scenario_Id'] = cpmUtils.getUUID();
					currentScenarioJson["Active_Scenario"]['Scenario_Current_State'] = "SCENARIO_STARTED";
					currentScenarioJson["Active_Scenario"]['State_Change_Timestamp'] = cpmUtils.getCurrentTime();
					currentScenarioJson["Active_Scenario"]['Working_On_Equipment']={}
					currentScenarioJson["Active_Scenario"]['Working_On_Equipment'][devType]=cpmUtils.getJSONElement(req, ['body','id'])
					
					// Update Active Scenario
					dataHandler.setSiteSpecificDataItems(currentScenarioJson);
					console.log(`MY ACTIVE SCENARIO ${JSON.stringify(dataHandler.getActiveScenario())}`);
					scenarioHandler.changeScenarioState (null, null, (e, s) => {
				if (e) prepareErrorResponse(e, res);
				if (s) res.json(s);
				
				});
			}	
			}else{
				return res.status(400).send({ message: "Invalid ID provided." });		
			}
			
		}else{
			return res.status(400).send({ message: "Invalid SSTYPE provided." });	
		}
    }else{
		return res.status(400).send({ message: "Invalid action provided." });
	}
}

module.exports = {
	processCPMNotification,
	processNotification,
	processStateTransition,
	processWatchDog,
	getCPMSnapshotHandler,
	hdlEquipmentAction
}
