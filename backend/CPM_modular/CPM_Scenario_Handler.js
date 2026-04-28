const dataHandler = require('./CPM_Data_Handler');
const cpmUtils = require('./CPM_Utilities');
const sc = require('./snapshot_check');
const datefns = require('date-fns');
const logger = require('./logger');
const controller = require('./CPM_modular.controller');
const { Logger } = require('winston');


function processCPMScenarioState(currentScenario = null, mycallback = null) {
	processCPMScenarioStateWithParams(currentScenario, null, mycallback)
}

function processCPMScenarioStateWithParams(currentScenario = null, scenarioParams = null, mycallback) {	
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	logger.info("-----------Inside PROCESS PARAMS-----------");
	let ongoingScenario = {};
	if (currentScenario === null) {		
		ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	} else {
		ongoingScenario["Active_Scenario"] = currentScenario;
	}
	logger.info(`processCPMScenarioStateWithParams-Working on Scenario ${ongoingScenario["Active_Scenario"]['Working_Scenario_Type']} at State: ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']} InputParams - ${cpmUtils.myPrint(scenarioParams)}`);
	// cpmUtils.mySuccess(`processCPMScenarioStateWithParams-Working on Scenario ${ongoingScenario["Active_Scenario"]['Working_Scenario_Type']} at State: ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']} InputParams - ${cpmUtils.myPrint(scenarioParams)}`);
	if (ongoingScenario["Active_Scenario"]["Working_Scenario_Id"] !== "scenario_uuid") {
		switch (dataHandler.getSiteSpecificDataItem(["Active_Scenario",'Scenario_Current_State'])) {
			case "SCENARIO_COMPLETED":	
				doActionsForScenarioCompleted(ongoingScenario,mycallback);
				break;
			default:
				//The current action to be performed starts from here.
				doActionsForCurrentState(ongoingScenario, (e, s) => {
					if(e){	
						console.log("Error");
						mycallback(e);
					}if(s){
						logger.info(`-------CALLBACK COMING FROM PROCESS SCENARIO STATE PARAMS-------`);
						logger.info(`${s}`);
				}	
				},scenarioParams);	
				break;
		}
	} else {
		logger.info(`No Active Scenario ${ongoingScenario}`);
		mycallback(`No Active Scenario ${ongoingScenario}`);
	}
}

function doActionsForScenarioCompleted(curentScenario, mycallback) {
    let ongoingScenario = {};
	ongoingScenario= dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
    if(ongoingScenario["Scenario_Current_State"]==="SCENARIO_ABORTED"){
        ongoingScenario=makeEmptyStrings(ongoingScenario)
        dataHandler.setSiteSpecificDataItems(ongoingScenario);
        cpmUtils.sudhu(`----SCENARIO_COMPLETED--by---SCENARIO_ABORTED--${JSON.stringify(dataHandler.getActiveScenario())}-----`)
    } else {
		let nextScenario ="";
		cpmUtils.sudhu(`----SCENARIO_COMPLETED--l1--${JSON.stringify(dataHandler.getActiveScenario())}-----`)
		if(undefined===ongoingScenario["Working_Scenario"][0]){
			nextScenario=ongoingScenario["Scenario_Current_State"];
				console.log("SINGLE",nextScenario,"======================");
		}else{
			nextScenario =dataHandler.getSiteSpecificDataItem([
				"CPM_Scenario_Flow", ongoingScenario["Working_Scenario"][0], ongoingScenario['Running_Scenario'], "success"])
				console.log("MODULAR",nextScenario);
		}
            if(nextScenario!=="SCENARIO_COMPLETED"){
                console.log("STILL SCENARIO is pending")
                //trigger next scenario
				let prevWorkingSec=ongoingScenario["Working_Scenario"]
				console.log("prevWorkingSec1",prevWorkingSec)
				// prevWorkingSec.pop();
				prevWorkingSec.push(nextScenario)
				console.log("prevWorkingSec2",prevWorkingSec)
				//update Active Scenario 
				ongoingScenario['Working_Scenario'] = prevWorkingSec;
				ongoingScenario['Running_Scenario']=nextScenario
				ongoingScenario['Working_Scenario_Type'] =nextScenario ;
				// ongoingScenario['Working_Scenario_Id'] = "scenario_uuid";
				ongoingScenario['Scenario_Previous_State'] = ""; 
				ongoingScenario['Scenario_Current_State'] = "SCENARIO_STARTED";
				ongoingScenario['State_Change_Timestamp'] = "";
				dataHandler.setSiteSpecificDataItems(ongoingScenario);
				logger.info(`my active scenario after updadte before next senario ${JSON.stringify(dataHandler.getActiveScenario())}`);
				// console.log('my active scenario after updadte before next senario',JSON.stringify(dataHandler.getActiveScenario()));
				if(dataHandler.getSiteSpecificDataItem(["CPM_SCENARIOS"]).includes(nextScenario)){
				processCPMScenarioStateWithParams(nextScenario)
				}
            }else{
				logger.info(`==========Scenario Ended Successfully==========`);
				ongoingScenario=makeEmptyStrings(ongoingScenario);
				dataHandler.setSiteSpecificDataItems(ongoingScenario);
				cpmUtils.sudhu(dataHandler.getSiteSpecificDataItem().Paused_Scenario !== undefined);
				
				if(dataHandler.getSiteSpecificDataItem().Paused_Scenario !== undefined){
					logger.info(`---------Paused Scenario:>${dataHandler.getActiveScenario()}-------`);					
					dataHandler.resumeActiveScenarioAfterFaultHandling("Scenario_Current_State","SCENARIO_COMPLETED",(err,res)=>{
					if(res)
						{
						logger.info(`TRIGGERING PAUSED SCENARIO`);
						logger.info(`Resumed Scenario:>${JSON.stringify(dataHandler.getActiveScenario())}`);
						processCPMScenarioStateWithParams();
						}
					})
				}else{
					logger.info(`NO PAUSED SCENARIO EXISTING`);
				}
            	
				}
    		}
}

function doActionsForCurrentState(ongoingScenario = null, mycallback = null, inputParams = null) {
	logger.info(`-----DO ACTION FOR CURRENT STATE ${JSON.stringify(inputParams)}`);
	let myresult = true,canWait = false;
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	let currentScenario = dataHandler.getActiveScenario();
	// -------------By default processStatus will be success---------------------
	let processStatus = "success";
	//The processStatus is updated to "failure" if delays occur in taking the required action and add new key Working_Scenario_Faulty as true in ActiveScenario
	if ((inputParams !== null) && ("processWatchdog" in inputParams) && currentScenario["Working_Scenario_Faulty"]!=true) {
		logger.info(`-----Input params in failure case ${JSON.stringify(inputParams)}-----`);
		logger.info(`-----Working Scenario Faulty in Failure case ${currentScenario["Working_Scenario_Faulty"]}-----`);
		processStatus = "failure";
		dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", true);
	} else {
		//After recovery of "failure" processStatus is updated to "handleFailure"
		let processFaulty = cpmUtils.getJSONElement(currentScenario, ["Working_Scenario_Faulty"]);
		if ((processFaulty !== null) && (processFaulty === true)) 
		{
			processStatus = "handleFailure"
			logger.info(`-----Process Status in Handle-Failure ${processStatus}------`);
		}
	}
	//Based on processStatus can be ("success" or "failure" or "handleFailure" ) and currentScenario  nextState is defined
	//nextState can be "SCENARIO_STATES" or "CPM_SCENARIO_FLOW" or "SCENARIO_RECOVERED_FROM_FAILURE"
	let nextState = dataHandler.getSiteSpecificDataItem([
		"CPM_Scenario_Flow", currentScenario["Working_Scenario_Type"], currentScenario['Scenario_Current_State'], processStatus
	]);
	logger.info(`-----------Next State ${nextState} ${processStatus}-----------`);
	
	if(processStatus==="failure"){
		let currentState = dataHandler.getSiteSpecificDataItem(["Active_Scenario","Scenario_Current_State"]);
        let ss_type = dataHandler.getSiteSpecificDataItem(["Scenario_States",currentState,"EQUIPMENT_TYPE"]);
        let id = dataHandler.getSiteSpecificDataItem(['Active_Scenario','Working_On_Equipment',ss_type]);
        let Eqp_Metrics = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot',ss_type,id,'Eqp_Metrics','Equipment_Faulty']);
        let fault_Equipment={[ss_type]:id}
		logger.info(`------Faulty Equipment ${fault_Equipment}------`)
		dataHandler.updateActiveScenarioParameter("handleFailureState",currentState);
		dataHandler.updateActiveScenarioParameter("fault_Equipment",fault_Equipment);
        dataHandler.updateEquipmentFaulty(ss_type,id,true);
	}
	logger.info(`Working on Scenario ${currentScenario['Working_Scenario_Type']} at State: ${currentScenario['Scenario_Current_State']} nextState - ${nextState}`);
	if(dataHandler.getSiteSpecificDataItem(["CPM_SCENARIOS"]).includes(nextState)){
		logger.info(`------Modular Scenario to be Triggered-----`);
		let curentScenario=dataHandler.getActiveScenario();
		let nextScenario=nextState;
		let prevWorkingSec=curentScenario["Working_Scenario"]
		prevWorkingSec.push(nextScenario)
		curentScenario['Working_Scenario'] = prevWorkingSec;
		if(processStatus==="success"){
			curentScenario['Running_Scenario']=nextScenario;
		}
		curentScenario['Working_Scenario_Type'] =nextScenario ;
		curentScenario['Scenario_Previous_State'] = ""; 
		curentScenario['Scenario_Current_State'] = "SCENARIO_STARTED";
		dataHandler.setSiteSpecificDataItems(curentScenario);
		cpmUtils.sudhu(`ACTIVE ${JSON.stringify(dataHandler.getActiveScenario())}`);
		processCPMScenarioStateWithParams(nextScenario);
	}else{ 
		if (nextState === "SCENARIO_RECOVERED_FROM_FAILURE") {
			console.log(`-------Scenario Recovered from Failure-------`)
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", false);
			console.log(`Before Pop out Scenario list --->${JSON.stringify(dataHandler.getActiveScenario())}`)
			let act=dataHandler.getActiveScenario();
			cpmUtils.sudhu(`------------------>${dataHandler.getActiveScenario()["Working_Scenario"].pop()
			}`)			
			console.log(`After Pop out scenario list --->${JSON.stringify(dataHandler.getActiveScenario())}`);
			let runningScenario=act["Running_Scenario"];
			let setCurrentState=act["handleFailureState"];
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Type",runningScenario);
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State",setCurrentState);
			processCPMScenarioStateWithParams();
			//Check callback maybe
		}
		else if(nextState === null){
			logger.info("========Inside Next State NULL=======")
			nextState = 'SCENARIO_ABORTED'
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", false);
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State", nextState);
			doActionsForScenarioCompleted(ongoingScenario,mycallback);
		}
		else{
		// Process Action for the next state
		let criteria = dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState]);
		let faultyEqpId = null;
		if (criteria) switch (criteria["ACTION_REQUIRED"]) {
			case "update_equipment": case "find_update":
				logger.info(`-----------Came to Find Case-----------`)
				myresult = dataHandler.findTheEquipmentForScenario(criteria, faultyEqpId);
				logger.info(`After Find My result ${myresult}`);
				if (myresult === 'UNABLE TO FIND EQUIPMENT'){
					nextState = 'SCENARIO_ABORTED'
					myresult = true;

				}
				break;		
			case "write":
				logger.info("------------Came to Write-------------")	;
				myresult = dataHandler.getDetailsForStateTransition(criteria, mycallback)
				logger.info(`After Bacnet Write My result ${myresult}`);
				break;
			case "snapshot_check": 
					logger.info(`--------Inside Snapshot Check--------`);
					logger.info(`--------Criteria ${criteria}--------`);
					myresult = checkSnapshotForStateTransition(nextState);
					logger.info(`-------CheckSnapshotForStateTransition ${myresult} ${processStatus}`);
					if (processStatus === 'handleFailure' || processStatus === 'failure'){
						logger.info(`Skip TURN ON State in handle failure`);
						myresult = true;
					}else if (myresult !== true){
							canWait = checkingCanWait(currentScenario);
					}
					console.log("-------------Trigger Update Metric---------")
					dataHandler.updateMetricTime(criteria)
					break;
			case "fault_write":
					logger.info(`---------Fault Device Bacnet Write------------`);
					myresult = dataHandler.getDetailsForStateTransition(criteria, mycallback)
					logger.info(`After Fault Bacnet Write My result ${myresult}`);
				    break;
			case "find_update_ct":
				logger.info(`---------Inside Find CT fan logic--------`);
				myresult=dataHandler.findTheEquipmentForScenarioCT(criteria);
				logger.info(`My result after CT fan Find ${myresult}`);
				if (myresult === 'UNABLE TO FIND EQUIPMENT'){
					nextState = 'SCENARIO_ABORTED'
					myresult = true;

				}
				break;
			case "find_remove":
				logger.info('-------Inside Find Equipment Stop-------')
				myresult = dataHandler.findTheEquipmentForStopScenario(criteria);
				logger.info(`After Finding Equipment to remove Myresult :${myresult}`)
				if (myresult === 'UNABLE TO FIND EQUIPMENT'){
					nextState = 'SCENARIO_ABORTED'
					myresult = true;

				}
				break;
			case "controlVfd":
				logger.info('-------VFD Control-------');
				let activePriVarPmp = [];
				let priVariable = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', 'NONGL_SS_PRIMARY_VARIABLE_PUMPS']);
				for (let myeqp in priVariable){
					let expected = 1;
					let actual = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', 'NONGL_SS_PRIMARY_VARIABLE_PUMPS', myeqp, 'Eqp_Attributes', 'PriV_Pmp_On_Off_SS', 'presentValue']);
					if(actual === '1' || actual === 'active'){
						actual = 1;
					}
					if(actual === '0' || actual === 'inactive'){
						actual = 0;
					}
					if(expected === actual){
						activePriVarPmp.push(myeqp);
					}
				}
				myresult = dataHandler.controlSpeedVFD(activePriVarPmp);
				logger.info(`After VFD CONTROL Myresult :${myresult}`);
				break;
			case "restart":
				logger.info('-----------Restart CPM----------');
				dataHandler.
				break;
			default:
				break;
		}
	if (canWait!== true) {	
		if (myresult === true) {
			logger.info(`---------My Result is true-------`);
			cpmUtils.mySuccess(`doActionsForCurrentState-Updated Active Scenario: ${cpmUtils.myPrint(dataHandler.getActiveScenario())}`);
			cpmUtils.myTable([dataHandler.getActiveScenario()],["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State", nextState);
			let transitionType = dataHandler.getSiteSpecificDataItem(['Scenario_States', nextState, 'TRANSITION_INTERNAL'], true);
			
			if(dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Current_State'])==='SCENARIO_COMPLETED'){
				dataHandler.getActiveScenario()["Working_Scenario"].pop()
				curentScenario=dataHandler.getActiveScenario();
				logger.info('---------SCENARIO_COMPLETED---------');
				processCPMScenarioState();
			}
			else if (dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Current_State'])==='SCENARIO_ABORTED')
			{
				logger.info(`--------------SCENARIO_ABORTED----------`);
				dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", true);
				doActionsForScenarioCompleted(ongoingScenario,mycallback);
			}
			else{
				if ((transitionType !== null) && (transitionType === true)){
					cpmUtils.mySuccess(`doActionsForCurrentState-Changing to ${nextState}`);
					logger.info(`-------------doActionsForCurrentState-Changing to ${nextState}----------`);
					doActionsForCurrentState(currentScenario, mycallback, null);	
				}else{
					logger.info(`DOING CALLBACK FROM HERE`)
					mycallback(null,nextState);
				}	
			}
		}else{
			logger.info(`----MY RESULT IS FALSE----`);
			logger.info(`----${nextState}----`);
			}
		}	
	}
	}
}	

function changeScenarioState(currentScenario = null, scenarioParams = null, mycallback=null) {
	logger.info(`=======Inside Change Scenario State=======`);
	let ongoingScenario = {};
	if (currentScenario === null) {
		ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	} else {
		ongoingScenario["Active_Scenario"] = currentScenario;
	}
	// logger.js(`processCPMScenarioStateWithParams-Working on Scenario ${ongoingScenario["Active_Scenario"]['Working_Scenario_Type']} at State: ${ongoingScenario["Active_Scenario"]['Scenario_Current_State']}`);	
	if (ongoingScenario["Active_Scenario"]["Working_Scenario_Id"] !== "scenario_uuid") {
		//create recod into gl_control_command table
		switch (dataHandler.getSiteSpecificDataItem(["Active_Scenario",'Scenario_Current_State'])) {			
			default:
					beginScenario(ongoingScenario, (e, s) => {
						if(e){
							logger.info(`Error`);
							mycallback(e);
						}if(s){
							logger.info(`==========Callback coming from Begin Scenario========`);
							mycallback(null, s);
					}	
					},scenarioParams);		
				
		}
	} else {
		mycallback(`No Active Scenario ${ongoingScenario} ...`);
	}

}

function beginScenario(ongoingScenario = null, mycallback = null, inputParams = null) {
	logger.info(`=========Inside Manual control Begin Scenario==========`);
	let myresult = true ,canWait=false;
	let currentScenario={},act1={}
	currentScenario = dataHandler.getActiveScenario();
	if(ongoingScenario===null){
		currentScenario = dataHandler.getActiveScenario();	
   }else{
	//    cpmUtils.sudhu(`cpmUtils.sudhu ongoingScenario ${JSON.stringify(ongoingScenario)}`);
	   // cpmUtils.sudhu(`cureentSecnario--->${JSON.stringify(ongoingScenario["Active_Scenario"][inputParams["ss_id"]])}`)
	   if(ongoingScenario["notification"]==true){
		   currentScenario=ongoingScenario
		   act1["Active_Scenario1"]=ongoingScenario
		   dataHandler.setSiteSpecificDataItems(act1);
		//    console.log("!#$%^&*()3",dataHandler.getSiteSpecificDataItem(["Active_Scenario"]))
	   }else{
		   currentScenario=ongoingScenario["Active_Scenario"]
		   // console.log(dataHandler.ibmsDataBlockJson,"====>")
		   // dataHandler.ibmsDataBlockJson[currentScenario["Working_Scenario_Id"]]=currentScenario["Working_On_Equipment"]
		   // dataHandler.addKeyValue(currentScenario["Working_Scenario_Id"],currentScenario["Working_On_Equipment"])
		   // console.log("tyuiomnvgyhjnbhj",dataHandler.getSiteSpecificDataItem([currentScenario["Working_Scenario_Id"]]))
		   dataHandler.addKeyValue("Active_Scenario1",ongoingScenario["Active_Scenario"])
		   // act1["Active_Scenario1"]=ongoingScenario["Active_Scenario"]
		   // dataHandler.setSiteSpecificDataItems(act1);
		//    console.log("!#$%^&*()2",dataHandler.getSiteSpecificDataItem(["Active_Scenario"]))
	   }
	   
	   console.log(`test currentScenario ${JSON.stringify(currentScenario)}`)
	   console.log("Active_Scenario1",dataHandler.getSiteSpecificDataItem(["Active_Scenario1"]))
   }
	let processStatus = "success";
	
	if ((inputParams !== null) && ("processWatchdog" in inputParams) && currentScenario["Working_Scenario_Faulty"]!=true) {
		logger.info(`=====Inside Failure Manual Control=====`);
		processStatus = "failure";
		dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", true);
		let currentState = dataHandler.getSiteSpecificDataItem(["Active_Scenario1","Scenario_Current_State"]);
		let ss_type = dataHandler.getSiteSpecificDataItem(["Scenario_States",currentState,"EQUIPMENT_TYPE"]);
		let id = dataHandler.getSiteSpecificDataItem(['Active_Scenario1','Working_On_Equipment',ss_type]);
		let Eqp_Metrics = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot',ss_type,id,'Eqp_Metrics','Equipment_Faulty']);
		dataHandler.updateEquipmentFaulty(ss_type,id,true);
		logger.info(`Faulty Equipment ${id}`);
	} else {
		let processFaulty = cpmUtils.getJSONElement(currentScenario, ["Working_Scenario_Faulty"]);
		if ((processFaulty !== null) && (processFaulty === true)) 
		{
			processStatus = "handleFailure"
			// logger.info(`=======Inside Handle Failure Manual Control=======`);
		}
	}
	logger.info(`------Process Status Manual Controlc${processStatus}----------`);
	let nextState = dataHandler.getSiteSpecificDataItem([
		"EQUIPMENT_CONTROL_ACTION", currentScenario["Working_Scenario_Type"], currentScenario['Scenario_Current_State'], processStatus
	]);
	logger.info(`Working on Scenario ${currentScenario['Working_Scenario_Type']} at State: ${currentScenario['Scenario_Current_State']} nextState - ${nextState}`);
	cpmUtils.myTable(currentScenario, ["Working_Scenario_Type", "Scenario_Previous_State", "Scenario_Current_State", "State_Change_Timestamp"]);
	if (inputParams == null) {
		inputParams = {}; // Initialize it as an empty object
	  }
	inputParams["nextState"]=nextState
	if(nextState === null){
		nextState = 'SCENARIO_ABORTED'
		canWait = false;
		myresult = true;

	}
	if (nextState === "SCENARIO_ABORTED") {
			logger.info(`-------Scenario Aborted Manual Control--------`);
			dataHandler.updateActiveScenarioParameter("Working_Scenario_Faulty", false);
			//failure	
			let currentState = dataHandler.getSiteSpecificDataItem(['Active_Scenario1','Scenario_Current_State'])
			// console.log("criteria========================> to update success",currentState)
			let ssType = dataHandler.getSiteSpecificDataItem(['Scenario_States',currentState,'EQUIPMENT_TYPE'])
			// console.log("==================ss_Type=======>",ssType)
			let ssId = dataHandler.getSiteSpecificDataItem(['Active_Scenario1','Working_On_Equipment',ssType])
			// console.log("==============ssId==============>",ssId)
			let status = "failure"
			controller.updateResponseStatus(ssId,ssType,status)
			endScenario(inputParams,mycallback);
	} else{
		let criteria = dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState]);
		let faultyEqpId = null;
		if (criteria) switch (criteria["ACTION_REQUIRED"]) {
			case "update_equipment": case "find_update":
				if (processStatus === "handleFailure") {
					faultyEqpId = cpmUtils.getJSONElement(currentScenario, ["Working_On_Equipment", criteria["EQUIPMENT_TYPE"]]);
				}
				logger.info(`---------Inside Manual Control Find Equipment----------`);
				myresult = dataHandler.findTheEquipmentForScenario(criteria, faultyEqpId);
				logger.info(`My result after find Equipment manual control ${myresult}`);
				break;

			case "write":
				logger.info("------------------Bacnet Write Manual Control-------------");  
				myresult = dataHandler.getDetailsForStateTransition(criteria, mycallback,inputParams)
				logger.info(`My result after find Equipment manual control ${myresult}`);
				break;
				
			case "snapshot_check": 
				logger.info("---------------Inside Snapshot Check--------------");
				myresult = checkSnapshotForStateTransition(nextState);
				logger.info(`checkSnapshotForStateTransition ${myresult} ${processStatus}`);
				logger.info(`My result after snapshot check ${myresult}`);
				if (myresult !== true){
						dataHandler.updateMetricTime(criteria);
						canWait = checkingCanWait(currentScenario);
				}
				break;

			case "find_remove":
				logger.info("---------------Inside Find Remove Equipment Manual Control--------------");
				myresult = dataHandler.findTheEquipmentForStopScenario(criteria);
				logger.info(`My result after find remove ${myresult}`);
				break;
			
			default:
				break;
		}
		
		if (canWait !=true) {	
		if (myresult === true) {
			logger.info(`=========My Result is true======`);
			logger.info(`My Success doActionsForCurrentState-Updated Active Scenario: ${cpmUtils.myPrint(dataHandler.getActiveScenario())}`);
			dataHandler.updateActiveScenarioParameter("Scenario_Current_State", nextState);
			let transitionType = dataHandler.getSiteSpecificDataItem(['Scenario_States', nextState, 'TRANSITION_INTERNAL'], true);
			let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
			if(concurrent){
				let workingActiveScenario=dataHandler.getSiteSpecificDataItem(["Active_Scenario1"])
				let equipment = workingActiveScenario["Working_On_Equipment"];
				let workingActiveScenarioId = Object.values(equipment)[0];
				//console.log("@!@!@!@!@!@!@!@",JSON.stringify(dataHandler.getActiveScenario()[workingActiveScenarioId]))
				//console.log(dataHandler.getSiteSpecificDataItem(['Active_Scenario',workingActiveScenarioId,'Scenario_Current_State']))
				if(dataHandler.getSiteSpecificDataItem(['Active_Scenario',workingActiveScenarioId,'Scenario_Current_State'])==='SCENARIO_COMPLETED'){
					//console.log("active scenario 1",dataHandler.getSiteSpecificDataItem(['Active_Scenario1']));
					// {
					// 	Working_Combination: '',
					// 	Working_Scenario_Type: 'TURN_ON_AHU',
					// 	Manual_Control: true,
					// 	Working_Scenario_Id: 'c059bdc3-3ec4-402b-a5de-1700cd387061',
					// 	Scenario_Current_State: 'SCENARIO_COMPLETED',
					// 	State_Change_Timestamp: 2024-09-13T09:29:34.279Z,
					// 	Scenario_Previous_State: 'AHU_TURNED_ON',
					// 	Working_On_Equipment: { NONGL_SS_AHU: '289c6b51-2168-4426-aeac-c3f99ee63a9a' },
					// 	Eqp_Attributes: { RAT_SP: 25 },
					// 	SAF_VFD_On_Off_Fbk: 'active',
					// 	notification: true
					//   }
					let currentState = dataHandler.getSiteSpecificDataItem(['Active_Scenario1','Scenario_Previous_State'])
					// console.log("criteria========================> to update success",currentState)
					let ssType = dataHandler.getSiteSpecificDataItem(['Scenario_States',currentState,'EQUIPMENT_TYPE'])
					// console.log("==================ss_Type=======>",ssType)
					let ssId = dataHandler.getSiteSpecificDataItem(['Active_Scenario1','Working_On_Equipment',ssType])
					// console.log("==============ssId==============>",ssId)
					let status = "success"
					controller.updateResponseStatus(ssId,ssType,status)
					endScenario(null,mycallback);
				}
			}
			else{
				if(dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Current_State'])==='SCENARIO_COMPLETED'){
					//update success
				// console.log("active scenario 1",dataHandler.getSiteSpecificDataItem(['Active_Scenario1']));
				let currentState = dataHandler.getSiteSpecificDataItem(['Active_Scenario','Scenario_Previous_State'])
				// console.log("criteria========================> to update success",currentState)
				let ssType = dataHandler.getSiteSpecificDataItem(['Scenario_States',currentState,'EQUIPMENT_TYPE'])
				// console.log("==================ss_Type=======>",ssType)
				let ssId = dataHandler.getSiteSpecificDataItem(['Active_Scenario','Working_On_Equipment',ssType])
				// console.log("==============ssId==============>",ssId)
				let status = "success"
				controller.updateResponseStatus(ssId,ssType,status)
				endScenario(null,mycallback);
				}
			}
			if ((transitionType !== null) && (transitionType === true)){
					logger.info(`Internal Transition True Manual Control-Changing to ${nextState}`);
					beginScenario(currentScenario, mycallback, null);	
			}else{
				logger.info(`NO Internal-Transition Manual Control.`);
			}
		} else {
			logger.info(`============My Result is False=========`);
			mycallback(null,myresult);
		}
		}
	}
}

function endScenario(curentScenario,mycallback) {
	// let ongoingScenario = {};
	// cpmUtils.myDebug(`doActionsForScenarioCompleted-Active Scenario: `);
	// logger.info(`=================End Scenario Manual Control====================`)
	// cpmUtils.myTable(curentScenario);
	// ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	// ongoingScenario["Active_Scenario"]['Working_Scenario_Type'] = "";
	// ongoingScenario["Active_Scenario"]['Working_Scenario_Id'] = "scenario_uuid";
	// ongoingScenario["Active_Scenario"]['Scenario_Previous_State'] = "";
	// ongoingScenario["Active_Scenario"]['Scenario_Current_State'] = "";
	// ongoingScenario["Active_Scenario"]['State_Change_Timestamp'] = "";
	// dataHandler.setSiteSpecificDataItems(ongoingScenario);
	// logger.info(`dataHandler.getSiteSpecificDataItem(["Active_Scenario"]))`);
	// mycallback(null,cpmUtils.myPrint(dataHandler.getSiteSpecificDataItem(["Active_Scenario"])));
	let ongoingScenario = {};
	cpmUtils.myDebug(`doActionsForScenarioCompleted-Active Scenario: `);
	logger.info(`=================End Scenario Manual Control====================`)
	cpmUtils.myTable(curentScenario);
	let workingActiveScenario=dataHandler.getSiteSpecificDataItem(["Active_Scenario1"])
	let equipment = workingActiveScenario["Working_On_Equipment"];
	let workingActiveScenarioId = Object.values(equipment)[0];
	// cpmUtils.sudhu(`@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`)
	// console.log("contrlled completred device",workingActiveScenarioId)
	// dataHandler.removeKeyValue(workingActiveScenarioId)
	dataHandler.deleteKeysFromObject(dataHandler.getSiteSpecificDataItem(["Active_Scenario"]), [workingActiveScenarioId]);
	dataHandler.deleteKeysFromObject(dataHandler.Plantsnapshot(), ['Active_Scenario1']);
	ongoingScenario["Active_Scenario"] = dataHandler.getSiteSpecificDataItem(["Active_Scenario"]);
	// ongoingScenario["Active_Scenario"]['Working_Scenario_Type'] = "";
	// ongoingScenario["Active_Scenario"]['Working_Scenario_Id'] = "scenario_uuid";
	// ongoingScenario["Active_Scenario"]['Scenario_Previous_State'] = "";
	// ongoingScenario["Active_Scenario"]['Scenario_Current_State'] = "";
	// ongoingScenario["Active_Scenario"]['State_Change_Timestamp'] = "";

	dataHandler.setSiteSpecificDataItems(ongoingScenario);
	//console.log(JSON.stringify(dataHandler.getSiteSpecificDataItem(["Active_Scenario1"])))
	logger.info(`${JSON.stringify(dataHandler.getSiteSpecificDataItem(["Active_Scenario"]))}`);
	mycallback(null,cpmUtils.myPrint(dataHandler.getSiteSpecificDataItem(["Active_Scenario"])));
}

function makeEmptyStrings(obj) {
	for (let key in obj) {
	  if (key === 'Working_Scenario_Id') {
		obj[key] = "scenario_uuid";
	  } else if (key === 'Working_Scenario_Faulty') {
		obj[key] = false;
	  } else if (key === 'Manual_Control') {
		obj[key] = false;
	  }else if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
		makeEmptyStrings(obj[key]);
	  } else {
		obj[key] = "";
	  }
	}
}

function processNotificationForCPM(pNotification, mycallback) {
	logger.info(`------Inside Process Notification for CPM-----`);
	logger.info(`------pNotification - ${JSON.stringify(pNotification)}-----`);
	let myeqp = null, myparams = null, notifiedParams = null, nApplicable = false,commonElements=null,act=null;
	let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
	if(concurrent){
		//manual control concurrently
		// console.log("mannual control",dataHandler.getActiveScenario());
		let myObj=dataHandler.getActiveScenario()
		Object.keys(pNotification).forEach(systemKey => {
			if (typeof pNotification[systemKey] === 'object') {
			  Object.keys(pNotification[systemKey]).forEach(deviceId => {
				if (myObj[deviceId]) {
				  // Update each matched record in myObj with new fields from pNotification
				  Object.assign(myObj[deviceId], pNotification[systemKey][deviceId]);
				}
			  });
			}
		  });
		console.log(`myObj ${JSON.stringify(myObj)}`)
		let keys = [];

		Object.keys(pNotification).forEach(section => {
		if (typeof pNotification[section] === 'object') {
			keys = keys.concat(Object.keys(pNotification[section]));
		}
		});
		// console.log("i am ids coming from pnotification",keys);
		// {"reqUUID":"2fc1522e-6b62-461a-a7e6-aa386c8fde63","measured_time":"2024-09-04 11:28:37.236621","ip_address":"192.168.1.123:2001","NONGL_SS_AHU":{"aab56574-0726-451b-9037-596fade37c70":{"SAF_VFD_On_Off":"inactive"}}}
		// {
		// 	'aab56574-0726-451b-9037-596fade37c70': {
		// 	  Working_Combination: '',
		// 	  Working_Scenario_Type: 'TURN_ON_AHU',
		// 	  Manual_Control: true,
		// 	  Working_Scenario_Id: 'c3be6538-4e2b-479c-a2d7-1e9056a3fc24',
		// 	  Scenario_Current_State: 'SCENARIO_STARTED',
		// 	  State_Change_Timestamp: '2024-09-04T11:48:58.070Z',
		// 	  Working_On_Equipment: { NONGL_SS_AHU: 'aab56574-0726-451b-9037-596fade37c70' },
		// 	  New_Field: { SAF_VFD_On_Off: 'inactive' } // This is the updated field from object a
		// 	},
		// 	Scenario_Previous_State: undefined,
		// 	Scenario_Current_State: 'AHU_TURN_ON_REQUESTED',
		// 	State_Change_Timestamp: '2024-09-04T11:48:58.089Z'
		//   }
		act= dataHandler.getActiveScenario();
        // console.log("---->keys",);
		commonElements = Object.keys(act).filter(element => keys.includes(element));
		// console.log("coommonElemnet",commonElements);
		if(commonElements.length>0){
			logger.info(`------Notification Applicable True-----`)
			nApplicable = true;
		}
		// let currentStateDetails = dataHandler.getSiteSpecificDataItem(["Scenario_States", fScenario['Scenario_Current_State']]);		
	}else{
	let fScenario = dataHandler.getActiveScenario();
	if ('ignore_message' in pNotification) {
		nApplicable = true;
	} else {
		logger.info(`JSON Active Scenario ${JSON.stringify(fScenario)}`);
		let currentStateDetails = dataHandler.getSiteSpecificDataItem(["Scenario_States", fScenario['Scenario_Current_State']]);
		if(currentStateDetails!=null){
			let eqpType = currentStateDetails['EQUIPMENT_TYPE'];
			if('fault_Equipment' in fScenario){
				let working = fScenario['Working_On_Equipment'][eqpType];
				let fault=fScenario['fault_Equipment'][eqpType]
				myeqp=[working,fault]
			}else{
				myeqp=fScenario['Working_On_Equipment'][eqpType];}
				myparams = currentStateDetails['Eqp_Attributes'];
				logger.info(`My Equipment list Working and Faulty ${JSON.stringify(myeqp)}`);
				const eqpId_list = [...Object.keys(pNotification[eqpType])]
				logger.info(`OUTPUT---> ${eqpId_list}`);
				if (myeqp !== "") notifiedParams = cpmUtils.getJSONElement(pNotification, [eqpType, myeqp], true);
				let ele=eqpId_list.filter(item => myeqp.includes(item));
				if(ele.length>0){
					logger.info(`------Notification Applicable True-----`)
					nApplicable = true;
				}
		}
		}
	}
	if (nApplicable) {
		if(!concurrent){
			processCPMScenarioStateWithParams(null, pNotification,mycallback);
		}else{
			// let scenario=commonElements
			let matchedObject = commonElements.reduce((acc, key) => {
				if (act[key]) {
				  acc[key] = act[key]; // Add matching key and value to the new object
				}
				return acc;
			  }, {});
			// console.log("matchedObject",JSON.stringify(matchedObject))
			commonElements.forEach((data)=>{
				// console.log("element yo pass program",JSON.stringify(act[data]) )
				act[data]["notification"]=true
				changeScenarioState(act[data], pNotification, mycallback);
			})			
		}
	} else {
		mycallback(null, true);
	}
}


function checkSnapshotForStateTransition(nextState) {
	let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
	if(concurrent){
		let fScenario = dataHandler.getSiteSpecificDataItem(["Active_Scenario1"]), myeqp = null, eParams = null, snapshotParams = null, snapshotGood = false;
		let expectedStateDetails =  dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState])
		if(!("EQUIPMENT_TYPE" in expectedStateDetails  && "Eqp_Attributes" in expectedStateDetails)){
			// console.log("not present in expectedStateDetails create ET & EA",nextState)
			let workingOnEquipment = fScenario.Working_On_Equipment;
			let equipmentType = Object.keys(workingOnEquipment)[0]; // Get the first key, assuming there's only one
			// let equipmentId = workingOnEquipment[equipmentType];
			expectedStateDetails["EQUIPMENT_TYPE"]=equipmentType;
			expectedStateDetails["Eqp_Attributes"]=fScenario.Eqp_Attributes
			}else{
				console.log(" present in expectedStateDetails update ET & EA",nextState)
			}
		let eqpType = expectedStateDetails['EQUIPMENT_TYPE'];
		myeqp = fScenario['Working_On_Equipment'][eqpType];
		console.log(`checkSnapshotForStateTransition====>`)
		// Check Here my Eqp is String or an Object/Array
		if(typeof(myeqp)==='string'){
			logger.info(`My equipment of Type String`);
			eParams = expectedStateDetails['Eqp_Attributes'];
			if (myeqp !== "") snapshotParams = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', eqpType, myeqp, 'Eqp_Attributes'], true);
			console.log(`eParams ${JSON.stringify(snapshotParams)}`)
			console.log(`eParams ${JSON.stringify(eParams)}`)
			if (snapshotParams !== null) for (let myp in eParams) {
				if ((myp in snapshotParams) && (snapshotParams[myp]['presentValue'] === eParams[myp])) {
					logger.info(`Inside IF of SnapshotGoodParams.`);
					snapshotGood = true;
				} else {
					logger.info(`Inside ELSE of SnapshotGoodParams.`);
					snapshotGood = false;
					break;
				}
				// otherwise, ignore notification
			}
			return snapshotGood;
		}else{
			logger.info(`My equipment of Type Object`);
			// if(!("EQUIPMENT_TYPE" in expectedStateDetails  && "Eqp_Attributes" in expectedStateDetails)){
			// 			console.log("not present in expectedStateDetails create ET & EA",nextState)
			// 			let workingOnEquipment = fScenario.Working_On_Equipment;
			// 			let equipmentType = Object.keys(workingOnEquipment)[0]; // Get the first key, assuming there's only one
			// 			// let equipmentId = workingOnEquipment[equipmentType];
			// 			expectedStateDetails["EQUIPMENT_TYPE"]=equipmentType;
			// 			expectedStateDetails["Eqp_Attributes"]=fScenario.Eqp_Attributes
			// }else{
			// 	console.log(" present in expectedStateDetails update ET & EA",nextState)
			// }
			eParams = expectedStateDetails['Eqp_Attributes'];
			myeqp.forEach(eqp=>{
				if(eqp!=="") snapshotParams = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', eqpType, eqp, 'Eqp_Attributes'], true);
				{	
					logger.info(`EParams ${JSON.stringify(eParams)}`);
					if (snapshotParams !== null) for (let myp in eParams) {
						if ((myp in snapshotParams) && (snapshotParams[myp]['presentValue'] === eParams[myp])) {
							logger.info(`Inside IF of SnapshotGoodParams.`);
							snapshotGood = true;
						} else {
							logger.info(`Inside ELSE of SnapshotGoodParams.`);
							snapshotGood = false;
							break;
						}
					}
				}
			});
			return snapshotGood;
		}
	}else{
	let fScenario = dataHandler.getActiveScenario(), myeqp = null, eParams = null, snapshotParams = null, snapshotGood = false;
	let expectedStateDetails =  dataHandler.getSiteSpecificDataItem(["Scenario_States", nextState])
	let eqpType = expectedStateDetails['EQUIPMENT_TYPE'];
	myeqp = fScenario['Working_On_Equipment'][eqpType];
	let file = {};
	// Check Here my Eqp is String or an Object/Array
	if(typeof(myeqp)==='string'){
		logger.info(`My equipment of Type String`);
		eParams = expectedStateDetails['Eqp_Attributes'];
		if (myeqp !== "") snapshotParams = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', eqpType, myeqp, 'Eqp_Attributes'], true);
		console.log(`eParams ${JSON.stringify(eParams)}`)
		if (snapshotParams !== null) for (let myp in eParams) {
			if ((myp in snapshotParams) && (snapshotParams[myp]['presentValue'] === eParams[myp])) {
				logger.info(`Inside IF of SnapshotGoodParams.`);
				snapshotGood = true;
				// file = {[eqpType]:{[myeqp]:snapshotParams[myp]['presentValue']}};
				file = {[eqpType]:{[myeqp]:eParams}};
				dataHandler.writeToFile(file)
			} else {
				logger.info(`Inside ELSE of SnapshotGoodParams.`);
				snapshotGood = false;
				break;
			}
			// otherwise, ignore notification
		}
		return snapshotGood;
	}else{
		logger.info(`My equipment of Type Object`);
		eParams = expectedStateDetails['Eqp_Attributes'];
		myeqp.forEach(eqp=>{
			if(eqp!=="") snapshotParams = dataHandler.getSiteSpecificDataItem(['Plant_Snapshot', eqpType, eqp, 'Eqp_Attributes'], true);
			{	
				logger.info(`EParams ${JSON.stringify(eParams)}`);
				if (snapshotParams !== null) for (let myp in eParams) {
					if ((myp in snapshotParams) && (snapshotParams[myp]['presentValue'] === eParams[myp])) {
						logger.info(`Inside IF of SnapshotGoodParams.`);
						snapshotGood = true;
						file = {eqpType:{myeqp:snapshotParams[myp]['presentValue']}};
						dataHandler.writeToFile(file)
					} else {
						logger.info(`Inside ELSE of SnapshotGoodParams.`);
						snapshotGood = false;
						break;
					}
				}
			}
		});
		return snapshotGood;
		}
	}
}

function checkingCanWait(currentScenario){
	let canWait = false;
	let maxDelay = dataHandler.getSiteSpecificDataItem([
		"Fault_Detection_Criteria",
		currentScenario["Scenario_Current_State"],
		"NO_RESPONSE_IN_SECONDS"
	], true);
	if ((maxDelay !== null) && datefns.differenceInSeconds((cpmUtils.getCurrentTime()), (currentScenario["State_Change_Timestamp"])) < maxDelay){
		canWait = true;
	}
	return canWait;
}


module.exports = {
	processCPMScenarioState,
	processCPMScenarioStateWithParams,
	changeScenarioState,
	doActionsForScenarioCompleted,
	processNotificationForCPM
}