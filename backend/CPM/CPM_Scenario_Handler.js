// const cpmEventsActions = require('./CPM_Events_Actions');
const dataHandler = require('./CPM_Data_Handler');
const cpmUtils = require('./CPM_Utilities');
const sc = require('./snapshot_check');

/*
// callback function:
function mycallback(error, success){
	if (error){
		// Log error and process error
	}
	if (success){
		// Log success and process success
	}
}
*/

function doActionsForScenarioCompleted(curentScenario, mycallback) {
	let ongoingScenario = {};
	cpmUtils.myDebug(`doActionsForScenarioCompleted-Active Scenario: `);
	cpmUtils.myTable(curentScenario);
	ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	ongoingScenario["Active_Scenario"]['Working_Scenario_Type'] = "";
	ongoingScenario["Active_Scenario"]['Working_Scenario_Id'] = "scenario_uuid";
	ongoingScenario["Active_Scenario"]['Scenario_Previous_State'] = "";
	ongoingScenario["Active_Scenario"]['Scenario_Current_State'] = "";
	ongoingScenario["Active_Scenario"]['State_Change_Timestamp'] = "";
	dataHandler.setSiteSpecificDataItems(ongoingScenario);
	// mycallback(null, `Scenario Completed - ${cpmUtils.myPrint(dataHandler.getSiteSpecificDataItem(["Active_Scenario"]))}`); 
}

function checkPostedNotificationApplicapability(ongoingScenario,inputParams,nextState){
	let processedBody = {}, mykey,data; 
	let result = true ; 
	console.log(`*********${JSON.stringify(inputParams)}***********`) // Req Body
	console.log(`*********${JSON.stringify(nextState)}***********`) // NEXT STATE
	
	for (mykey in inputParams) {
		console.log(`My Key, ${mykey}`);
		switch (mykey) {
		  case 'myuuid':
			processedBody['reqUUID'] = inputParams['myuuid'];
			break;
		  case 'measured_time':
			processedBody['measured_time'] = inputParams['measured_time'];
			break;
		  default:
			let counter = 0 ;
			processedBody['ip_address'] = mykey;
			for (gl in inputParams[mykey]){
				let data =sc.data(gl);
				console.log(`****** Data---> ${JSON.stringify(data)}`);
				let deviceId = dataHandler.getSiteSpecificDataItem(['Active_Scenario','Working_On_Equipment',data['e_ss_type']]); // array of devices 
				let currentState = ongoingScenario['Scenario_Current_State'];
				let paramId = dataHandler.getSiteSpecificDataItem(['Scenario_States',nextState,'Eqp_Attributes']);
				console.log("********Current_state",currentState);
                console.log("******** Param ID *********",paramId);
				console.log("******** Device ID",deviceId);
				// ******** Param ID ********* { Pri_Pmp_On_Off: 1 }
				// ******** Device ID 0001b10000
			// if(nextState === 'SCENARIO_COMPLETED'){
			// 	return result;
			// }
			// else{
				if(typeof(deviceId)=="string"){
					console.log("Type of device ID",typeof(deviceId));
					if(deviceId === data['e_id']){
						if(Object.keys(paramId)[0] === data['p_name']){
							return true;
						}else{
							console.log("Still waiting for correct COV param ID not matched ....!!")
						// return false;
						result = false;
						}
					}else{
						console.log("Still waiting for correct COV Device not matched ....!!")
						// return false;
						result = false;
					}
				}else{
					console.log("Type of device ID",typeof(deviceId));
					// if(data['e_address_value'] in deviceId){
					// 	if(Object.keys(paramId)[0] === data['p_name']){
					// 		return true;
					// 	}else{
					// 		console.log("Still waiting for correct COV param ID not matched ....!!")
					// 	// return false;
					// 	result = false;
					// 	}
					// }else{
					// 	console.log("Still waiting for correct COV Device not matched ....!!")
					// 	// return false;
					// 	result = false;
					// }
				}
			// }
			}
		}
	}
}

function doActionsForCurrentState(ongoingScenario = null, mycallback = null, inputParams = null) {
	console.log("INSIDE DO ACTIONS************");
	let myresult = true;
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	let currentScenario = dataHandler.getActiveScenario();
	// Sample for testing
	// mycallback(null,`After 1s at ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']}`)
	// Given activeScenario along with currentState and nextState
	// Identify the param of the equipment of type and id to be updated
	// Identify the BACnet objId and presentValue to be updated 
	// Given PBS address and url preparation mechanism
	// json-path for the action: ex. ddc:address->eqp:pump->param:onoff_obj->objId->presentValue

	let processStatus = "success";
	
	if ((inputParams !== null) && ("processWatchdog" in inputParams) && currentScenario["Working_Scenario_Faulty"]!=true) {
	// if ((inputParams !== null) && ("processWatchdog" in inputParams)) {
		console.log('failure')
		processStatus = "failure";
		console.log(`updating true`)
		dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", true);
	} else {
		let processFaulty = cpmUtils.getJSONElement(currentScenario, ["Working_Scenario_Faulty"]);
		if ((processFaulty !== null) && (processFaulty === true)) 
		{
			processStatus = "handleFailure"
		}
		console.log(`---processFaulty${processFaulty}`)
	}
	
	console.log(`My processStatus ${processStatus}-----`)
	let nextState = dataHandler.getSiteSpecificDataItem([
		"CPM_Scenario_Flow", currentScenario["Working_Scenario_Type"], currentScenario['Scenario_Current_State'], processStatus
	]);

	cpmUtils.mySuccess(`Working on Scenario ${currentScenario['Working_Scenario_Type']} at State: ${currentScenario['Scenario_Current_State']} nextState - ${nextState}`);
	// cpmUtils.myTable(currentScenario, ["Working_Scenario_Type", "Working_Scenario_Id", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);
	cpmUtils.myTable(currentScenario, ["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);

	if (nextState === "SCENARIO_RECOVERED_FROM_FAILURE") {
			console.log(`---------updating----Working_Scenario_Faulty---as---false`)
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", false);	
		
		// dataHandler.updateActiveScenarioParameter("State_Change_Timestamp", cpmUtils.getCurrentTime());
	} else {
		// Process Action for the next state
		let criteria = dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState]);
		let paramApplicable  = checkPostedNotificationApplicapability(currentScenario, inputParams ,nextState);
		
		let faultyEqpId = null;
		if (criteria) switch (criteria["ACTION_REQUIRED"]) {
			case "update_equipment": case "find_update":
				
				if (processStatus === "handleFailure") {
					faultyEqpId = cpmUtils.getJSONElement(currentScenario, ["Working_On_Equipment", criteria["EQUIPMENT_TYPE"]]);
				}
				myresult = dataHandler.findTheEquipmentForScenario(criteria, faultyEqpId);
				break;

			case "find_update_series":
				myresult=dataHandler.findTheEquipmentForScenarioSeries(criteria,faultyEqpId);
			break;
			
			case "write":
				console.log("------------------i have write-------------req")	
				myresult = dataHandler.getDetailsForStateTransition(criteria, mycallback)
				break;
				
			case "snapshot_check": 
			
				if (paramApplicable == true) {
					console.log("Inside Case SNAPSHOT CHECK*****")
					myresult = dataHandler.snapshotCheck(criteria,mycallback);  
				}else{
					console.log("Result from param Applicable False");
					myresult= false;
				}
				break;

			case "snapshot_check_ctf":
				myresult=dataHandler.snapshotCheckCtf(criteria,mycallback);
				if(!myresult){
					console.log("Waiting for all CTF to be active...!!");
					myresult = false;
				}
				break;
		
			case "find_update_ct":
				let faultyEqpI = null;
				myresult=dataHandler.findTheEquipmentForScenarioCT(criteria,faultyEqpI);
				break;
			case "find_remove":
				let faultyEqpIde=null;
				cpmUtils.sudhu(`not able to find ${criteria["ACTION_REQUIRED"]}`)
				myresult = dataHandler.findTheEquipmentForStopScenario(criteria, faultyEqpIde);
				break;
			default:
				break;
		}
		cpmUtils.mySuccess(`doActionsForCurrentState-Updated Active Scenario: ${cpmUtils.myPrint(dataHandler.getActiveScenario())}`);
		cpmUtils.myTable([dataHandler.getActiveScenario()],["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);

		if (myresult === true) {
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State", nextState);
			let transitionType = dataHandler.getSiteSpecificDataItem(['Scenario_States', nextState, 'TRANSITION_INTERNAL'], true);
			if(dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Current_State'])==='SCENARIO_COMPLETED'){
				doActionsForScenarioCompleted(null,mycallback);
				// mycallback(myresult);	
			}
			if ((transitionType !== null) && (transitionType === true)){
				cpmUtils.mySuccess(`doActionsForCurrentState-Changing to ${nextState}`);
				setTimeout(() => {
					doActionsForCurrentState(currentScenario, mycallback, null);	
				}, 5000);		
			}else{
				cpmUtils.myTable(nextState, null, `doActionsForCurrentState - Checking Internal Transition for Scenario ${currentScenario['Working_Scenario_Type']}`);
				mycallback(null,nextState);
			}
		} else {
			cpmUtils.myError(`Notification is still to be ACK....!!`);
		}

	}	
	// if (myresult === true) {
	// 	mycallback(null, nextState);
	// } else {
		
	// 	mycallback(myresult);
	// }
}

function processCPMScenarioState(currentScenario = null, mycallback = null) {
	processCPMScenarioStateWithParams(currentScenario, null, mycallback)
}

function processCPMScenarioStateWithParams(currentScenario = null, scenarioParams = null, mycallback) {	
	// Get current scenario state
	console.log("Inside PROCESS PARAMS**************",mycallback)
	let ongoingScenario = {};
	if (currentScenario === null) {
		ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	} else {
		ongoingScenario["Active_Scenario"] = currentScenario;
	}

	cpmUtils.mySuccess(`processCPMScenarioStateWithParams-Working on Scenario ${ongoingScenario["Active_Scenario"]['Working_Scenario_Type']} at State: ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']} InputParams - ${cpmUtils.myPrint(scenarioParams)}`);
	
	console.log("Do Actions for Completed or Current State: ",	dataHandler.getSiteSpecificDataItem(["Active_Scenario",'Scenario_Current_State']));

	if (ongoingScenario["Active_Scenario"]["Working_Scenario_Id"] !== "scenario_uuid") {
		switch (dataHandler.getSiteSpecificDataItem(["Active_Scenario",'Scenario_Current_State'])) {
			
			case "SCENARIO_COMPLETED":	
				doActionsForScenarioCompleted(ongoingScenario,mycallback);
				break;
			// Do the actions for the current state
			default:

				doActionsForCurrentState(ongoingScenario, (e, s) => {
					if(e){	
						console.log("Error");
						mycallback(e);
					}if(s){
						console.log("callback coming")
						mycallback(null, s);
				}	
				},scenarioParams);	

				break;
		}
	} else {
		mycallback(`No Active Scenario ${ongoingScenario} ...`);
	}
}

function changeScenarioState(currentScenario = null, scenarioParams = null, mycallback=null) {
	
	let ongoingScenario = {};
	if (currentScenario === null) {
		ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	} else {
		ongoingScenario["Active_Scenario"] = currentScenario;
	}
	cpmUtils.mySuccess(`processCPMScenarioStateWithParams-Working on Scenario ${ongoingScenario["Active_Scenario"]['Working_Scenario_Type']} at State: ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']}`);
	
	if (ongoingScenario["Active_Scenario"]["Working_Scenario_Id"] !== "scenario_uuid") {
		switch (dataHandler.getSiteSpecificDataItem(["Active_Scenario",'Scenario_Current_State'])) {			
			// case "SCENARIO_COMPLETED":	
			// endScenario(ongoingScenario);
			// 	break;
			default:
				console.log("INSIDE CHANGE SCENARIO STATE");
					
					beginScenario(ongoingScenario, (e, s) => {
						if(e){
							console.log("Error");
							mycallback(e);
						}if(s){
							console.log("callback coming")
							mycallback(null, s);
					}	
					},scenarioParams);		
				
		}
	} else {
		mycallback(`No Active Scenario ${ongoingScenario} ...`);
	}

}

function beginScenario(ongoingScenario = null, mycallback = null, inputParams = null) {
	let myresult = true;
	// if (mycallback === null) mycallback = cpmUtils.consoleLog;
	let currentScenario = dataHandler.getActiveScenario();
	// Sample for testing
	// mycallback(null,`After 1s at ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']}`)
	// Given activeScenario along with currentState and nextState
	// Identify the param of the equipment of type and id to be updated
	// Identify the BACnet objId and presentValue to be updated 
	// Given PBS address and url preparation mechanism
	// json-path for the action: ex. ddc:address->eqp:pump->param:onoff_obj->objId->presentValue

	let processStatus = "success";
	
	if ((inputParams !== null) && ("processWatchdog" in inputParams) && currentScenario["Working_Scenario_Faulty"]!=true) {
	// if ((inputParams !== null) && ("processWatchdog" in inputParams)) {
		console.log('failure')
		processStatus = "failure";
		console.log(`updating true`)
		dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", true);
	} else {
		let processFaulty = cpmUtils.getJSONElement(currentScenario, ["Working_Scenario_Faulty"]);
		if ((processFaulty !== null) && (processFaulty === true)) 
		{
			processStatus = "handleFailure"
		}
		console.log(`---processFaulty${processFaulty}`)
	}
	
	console.log(`My processStatus ${processStatus}-----`)
	let nextState = dataHandler.getSiteSpecificDataItem([
		"EQUIPMENT_CONTROL_ACTION", currentScenario["Working_Scenario_Type"], currentScenario['Scenario_Current_State'], processStatus
	]);

	cpmUtils.mySuccess(`Working on Scenario ${currentScenario['Working_Scenario_Type']} at State: ${currentScenario['Scenario_Current_State']} nextState - ${nextState}`);
	// cpmUtils.myTable(currentScenario, ["Working_Scenario_Type", "Working_Scenario_Id", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);
	cpmUtils.myTable(currentScenario, ["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);

	if (nextState === "SCENARIO_RECOVERED_FROM_FAILURE") {
			console.log(`---------updating----Working_Scenario_Faulty---as---false`)
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", false);	
		
		// dataHandler.updateActiveScenarioParameter("State_Change_Timestamp", cpmUtils.getCurrentTime());
	} else {
		// Process Action for the next state
		let criteria = dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState]);
		let paramApplicable  = checkPostedNotificationApplicapability(currentScenario, inputParams ,nextState);
		
		let faultyEqpId = null;
		if (criteria) switch (criteria["ACTION_REQUIRED"]) {
			case "update_equipment": case "find_update":
				
				if (processStatus === "handleFailure") {
					faultyEqpId = cpmUtils.getJSONElement(currentScenario, ["Working_On_Equipment", criteria["EQUIPMENT_TYPE"]]);
				}
				myresult = dataHandler.findTheEquipmentForScenario(criteria, faultyEqpId);
				break;

			case "find_update_series":
				myresult=dataHandler.findTheEquipmentForScenarioSeries(criteria,faultyEqpId);
			break;
			
			case "write":
				console.log("------------------i have write-------------req")	
				myresult = dataHandler.getDetailsForStateTransition(criteria, mycallback)
				break;
				
			case "snapshot_check": 
				if (paramApplicable == true) {
					console.log("Inside Case SNAPSHOT CHECK*****")
					myresult = dataHandler.snapshotCheck(criteria,mycallback);  
				}else{
					console.log("Result from param Applicable False");
					myresult= false;
				}
				break;

			case "snapshot_check_ctf":
				myresult=dataHandler.snapshotCheckCtf(criteria,mycallback);
				if(!myresult){
					console.log("Waiting for all CTF to be active...!!");
					myresult = false;
				}
				break;
		
			case "find_update_ct":
				let faultyEqpI = null;
				myresult=dataHandler.findTheEquipmentForScenarioCT(criteria,faultyEqpI);
				break;
			
				
			case "find_remove":
				let faultyEqpIde=null;
				cpmUtils.sudhu(`not able to find ${criteria["ACTION_REQUIRED"]}`)
				myresult = dataHandler.findTheEquipmentForStopScenario(criteria, faultyEqpIde);
				break;
			default:
				break;
		}
		
		cpmUtils.mySuccess(`doActionsForCurrentState-Updated Active Scenario: ${cpmUtils.myPrint(dataHandler.getActiveScenario())}`);
		cpmUtils.myTable([dataHandler.getActiveScenario()],["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);

		if (myresult === true) {
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State", nextState);
			let transitionType = dataHandler.getSiteSpecificDataItem(['Scenario_States', nextState, 'TRANSITION_INTERNAL'], true);
			if(dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Current_State'])==='SCENARIO_COMPLETED'){
				endScenario(null,mycallback);
				// mycallback(myresult);	
			}
			if ((transitionType !== null) && (transitionType === true)){
				cpmUtils.mySuccess(`doActionsForCurrentState-Changing to ${nextState}`);
				// setTimeout(() => {
					beginScenario(currentScenario, mycallback, null);	
				// }, 5000);		
			}else{
				cpmUtils.myTable(nextState, null, `doActionsForCurrentState - Checking Internal Transition for Scenario ${currentScenario['Working_Scenario_Type']}`);
				mycallback(null,nextState);
			}
		} else {
			// cpmUtils.myError(`doActionsForCurrentState-currentScenario-${cpmUtils.myPrint(currentScenario)} criteria-${cpmUtils.myPrint(criteria)}`);
			cpmUtils.myError(`Notification is still to be ACK....!!`);
		}
	}
}

function endScenario(curentScenario,mycallback) {
	let ongoingScenario = {};
	cpmUtils.myDebug(`doActionsForScenarioCompleted-Active Scenario: `);
	cpmUtils.myTable(curentScenario);
	ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	ongoingScenario["Active_Scenario"]['Working_Scenario_Type'] = "";
	ongoingScenario["Active_Scenario"]['Working_Scenario_Id'] = "scenario_uuid";
	ongoingScenario["Active_Scenario"]['Scenario_Previous_State'] = "";
	ongoingScenario["Active_Scenario"]['Scenario_Current_State'] = "";
	ongoingScenario["Active_Scenario"]['State_Change_Timestamp'] = "";
	dataHandler.setSiteSpecificDataItems(ongoingScenario);
	console.log("Scenario Completed at the End.")
	// mycallback(null, `Scenario Completed `); 
	mycallback(null,cpmUtils.myPrint(dataHandler.getSiteSpecificDataItem(["Active_Scenario"])));
}

// endScenARIO
// beginScenario
module.exports = {
	processCPMScenarioState,
	processCPMScenarioStateWithParams,
	changeScenarioState
}