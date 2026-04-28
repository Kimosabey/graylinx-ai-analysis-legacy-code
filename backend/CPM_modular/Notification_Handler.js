const cpmUtils = require('./CPM_Utilities');
const scenarioHandler = require('./CPM_Scenario_Handler');
const dataHandler = require('./CPM_Data_Handler');
const ibmsData=require('../Services/Device/myIBMSPreparation');
const datefns = require('date-fns');
const { parseISO, differenceInSeconds } = require('date-fns');
const logger = require('./logger')
const controller=require('./CPM_modular.controller');
const { values } = require('lodash');
// const alarm = require('./../Apps/Alarm_others/Alarm_other_Json')


function handleScenarioStateTransition(scenario, scenarioParams, mycallback = null) {
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
	scenarioHandler.processCPMScenarioStateWithParams(scenario, scenarioParams, mycallback);
}
function handleScenarioStartTransitionManual(scenario, scenarioParams, mycallback = null){
	if (mycallback === null) mycallback = cpmUtils.consoleLog;
		scenarioHandler.changeScenarioState(scenario, scenarioParams, mycallback);	
}

let mycount = 0;
function handleScenarioStartRequest(scenario, scenarioParams, mycallback = null) {
	// logger.info(`*******INSIDE HANDLE SCENARIO REQUEST NOTIFICATION HANDLER*********`);
	// logger.info(`*******Scenario triggerd ${scenario}*******`);
	// console.log("========================>",JSON.stringify(scenarioParams))
	let ongoingScenario = dataHandler.getSiteSpecificDataItem(["Active_Scenario", "Working_Scenario_Id"]);
	if (mycallback != null) {
		const response="command received to start this "+scenario +" scenario"
		mycallback(null,response)
	}
	// 0 indicates a successful exit
	if (ongoingScenario == "scenario_uuid") {
		let path=[]	
		let currentScenarioJson = { "Active_Scenario": {} };
		let resultPath =dataHandler.traversePath(scenario, path);
		const myScenario=resultPath[resultPath.length-1]
		currentScenarioJson["Active_Scenario"]['Working_Combination'] = scenarioParams["cpmCombination"];
		// currentScenarioJson["Active_Scenario"]['Working_Combination']="Combination-1"
		currentScenarioJson["Active_Scenario"]['Working_Scenario'] =resultPath;
		currentScenarioJson["Active_Scenario"]['Running_Scenario'] = myScenario;
		currentScenarioJson["Active_Scenario"]['Working_Scenario_Type'] = myScenario;
		currentScenarioJson["Active_Scenario"]['Working_Scenario_Id'] = cpmUtils.getUUID();
		currentScenarioJson["Active_Scenario"]['Scenario_Current_State'] = "SCENARIO_STARTED";
		currentScenarioJson["Active_Scenario"]['State_Change_Timestamp'] = cpmUtils.getCurrentTime();
		dataHandler.setSiteSpecificDataItems(currentScenarioJson);
		logger.info(`*******CREATED ACTIVE SCENARIO*******`);
		logger.info(`${JSON.stringify(currentScenarioJson)}`);
		scenarioHandler.processCPMScenarioStateWithParams(null, null,mycallback);
	} else {
		logger.info(`Working with a Scenario ${ongoingScenario}; Please wait...`)
		mycallback(`Working with a Scenario ${ongoingScenario}; Please wait...`);
	}
}

function prepareErrorResponse(e, res) {
	return res.status(400).json({ error: e });
}

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

function prepareProcessedNotification(myBody, eqpName, pCode, pValue) {
	if (!(pCode["e_ss_type"] in myBody)) myBody[pCode["e_ss_type"]] = {};
	if (!(eqpName in myBody[pCode["e_ss_type"]])) myBody[pCode["e_ss_type"]][eqpName] = {};
	myBody[pCode["e_ss_type"]][eqpName][pCode['p_name']] = pValue;
	return myBody;
}

function preProcessBody(mybody = sampleNotification, mycallback=null) {
	let processedBody = {}, mykey, myprop, mycode, ignoreMsg = false,val = '';;
	for (mykey in mybody) {
		switch (mykey) {
			case 'ignore_message':
				ignoreMsg = false;
				processedBody = mybody;
				break;
			case 'myuuid':
				processedBody['reqUUID'] = mybody['myuuid'];
				break;
			case 'measured_time':
				processedBody['measured_time'] = mybody['measured_time'];
				break;
			default:
				processedBody['ip_address'] = mykey;
				for (myprop in mybody[mykey]) {
					if(mybody[mykey][myprop][2].startsWith("binary")){
						console.log("Inside Binary")
						val = 'binary'
					}else{
						console.log("Inside Analog")
						val='analog'
					}
					mycode = ibmsData.processEquipmentCode(myprop);
					if (mycode['inputValid']) {
						if (mycode["p_name"] !== mybody[mykey][myprop][0]) {
							cpmUtils.myError(`preProcessBody: Parameter Mismatch - Notification: ${mycode["p_name"]} Processed: ${mybody[mykey][myprop][0]}`, mycode);
						}
						dataHandler.updatePlantSnapshot(mycode["e_ss_type"], mycode['e_id'], mycode["p_name"],mybody[mykey][myprop][1],mybody['measured_time']);
						// dataHandler.processAlarmCode(mycode['p_description'],mycode["e_ss_type"],mycode["p_name"],mycode['e_id'],val);
						processedBody = prepareProcessedNotification(processedBody, mycode['e_id'], mycode, mybody[mykey][myprop][1]);
					} else {
						cpmUtils.myError(`preProcessBody: Invalid Equipment Code - ${mybody[mykey][myprop]} and Code ${myprop}`, mycode);
					}
				}
				break;
		}
		if (ignoreMsg === true) break;
	}
	mycallback(null, processedBody);
}

function processNotification(req, res) {
	preProcessBody(req.body, (e, pBody) => {
		if (e) prepareErrorResponse(e, res);
		if (pBody) {
			scenarioHandler.processNotificationForCPM(pBody, (cpmErr, cpmResponse) => {
				if (cpmErr) prepareErrorResponse(cpmErr, res);
				if (cpmResponse) res.json(cpmResponse);
			});
		}else{
			res.json('No Problem. No Data to Process');
		}
	});
}
 
function processStateTransition(req, res) {
	console.log("Working Scenario ID : ",dataHandler.getSiteSpecificDataItem(['Active_Scenario','Working_Scenario_Id']));
	let currentScenarioJson = dataHandler.getActiveScenario();
	cpmUtils.myDebug(`processStateTransition - Active Scenario: ${cpmUtils.myPrint(currentScenarioJson)} Found: ${cpmUtils.myPrint(req.body)}`);
	cpmUtils.myTable(currentScenarioJson);
	console.log(`========================> ${currentScenarioJson}`)
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

function glWatchDog() {
	if (mycount < 5) cpmUtils.mySuccess(`Counter: ${mycount++} Time Now: ${cpmUtils.getCurrentTime()}`);

	// Handler waiting on Scenario State Transitions expected within specified time interval - say 20 seconds
	// {
	//   "Working_Combination": "",
	//   "Working_Scenario_Type": "TURN_ON_AHU",
	//   "Manual_Control": true,
	//   "Working_Scenario_Id": "d17e8a33-6992-4189-abf5-2a2d70714c7e",
	//   "Scenario_Current_State": "AHU_TURN_ON_REQUESTED",
	//   "State_Change_Timestamp": "2024-09-27T07:12:02.695Z",
	//   "commandFrom": "UI",
	//   "Scenario_Previous_State": "SCENARIO_STARTED",
	//   "Working_On_Equipment": {
	//    "NONGL_SS_AHU": "bb6b097e-8c7a-4048-b6fb-45f01650a9b1"
	//   },
	//   "Eqp_Attributes": {
	//    "AHU_OFF": "ON"
	//   }
	//  }
	let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
	if(concurrent){
		//process watch for multiple devices
		let currentScenario = dataHandler.getActiveScenario();
		// console.log("cureentScenario",currentScenario)
		if(currentScenario !== null){
		// const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
			for (const key in currentScenario) {
			// Check if the key matches the UUID pattern
			// if (uuidPattern.test(key)) {
			if(key != "Working_Scenario_Id"){
				// console.log(`Key: ${key}`, currentScenario[key]);
				let devid = key
				let obj = currentScenario[key]
				// console.log('Current State',obj["Scenario_Current_State"]);
				let maxDelay = dataHandler.getSiteSpecificDataItem([
					"Fault_Detection_Criteria",
					obj["Scenario_Current_State"],
					"NO_RESPONSE_IN_SECONDS"
					], true);
				// console.log("Maxx Delay",maxDelay);
				if ((maxDelay !== null) && differenceInSeconds((cpmUtils.getCurrentTime()), (obj["State_Change_Timestamp"])) > maxDelay) {
					console.log("IM HERE AFTER 30 Secs of control",devid)
					// function handleScenarioStartTransitionManual(scenario, scenarioParams, mycallback = null){
					let testJSON={"processWatchdog": {}}
					console.log("[obj[Scenario_Current_State]]",obj["Scenario_Current_State"])
					testJSON["processWatchdog"][obj["Scenario_Current_State"]] = "DELAYED";
					testJSON["ss_id"]=devid
					handleScenarioStartTransitionManual(obj, testJSON);
				}
			}
			}
		}
	}else{
		let currentScenario = dataHandler.getActiveScenario();
		  
		if ((currentScenario !== null) && (currentScenario["Working_Scenario_Id"] !== "scenario_uuid")) {
			console.log('Current State',currentScenario["Scenario_Current_State"]);
			let maxDelay = dataHandler.getSiteSpecificDataItem([
				"Fault_Detection_Criteria",
				currentScenario["Scenario_Current_State"],
				"NO_RESPONSE_IN_SECONDS"
				], true);
			console.log("Maxx Delay",maxDelay);
			if ((maxDelay !== null) && differenceInSeconds((cpmUtils.getCurrentTime()), (currentScenario["State_Change_Timestamp"])) > maxDelay) {
				let testJSON = { "processWatchdog": {} };
				// testJSON[currentScenario["Scenario_Current_State"]] = "DELAYED";
				testJSON["processWatchdog"][currentScenario["Scenario_Current_State"]] = "DELAYED";
				cpmUtils.myError(`glWatchDog - Delay in : ${currentScenario["Scenario_Current_State"]}`);
				let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
				if(!concurrent){
					handleScenarioStateTransition(currentScenario, testJSON);
				}else{
					handleScenarioStartTransitionManual(currentScenario, testJSON);
				}
			}
		}
	}
}

function processWatchDog() {
	glWatchDog();
}

function processCPMNotification(req, res) {
	// logger.info(`Notification Command Reached Handler.`);
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
		// logger.info(`processCPMNotification-: ${cpmUtils.myPrint(dataHandler.getActiveScenario())} Found: ${cpmScenario}`);
		cpmUtils.myPrint(c.bgRed("cpm scenario trying to transition"));
		processStateTransition(req, res);
		cpmUtils.myDebug(`processCPMNotification-: ${cpmUtils.myPrint(dataHandler.getActiveScenario())} Found: ${cpmScenario}`);cpmUtils.myTable(dataHandler.getActiveScenario());
	}
}

function getCPMSnapshotHandler(req, res) {
	res.json(dataHandler.getCPMSnapshot());
}


function equipmentControlAction(req,res,request_id,commandFrom,callback){
	let cpmScenario = cpmUtils.getJSONElement(req, ['body', 'gl_command']);
	let devType=cpmUtils.getJSONElement(req, ['body','ss_type']);
	let eqp = cpmUtils.getJSONElement(req,['body','ss_id']);
	let ongoingScenario = dataHandler.getActiveScenario();
	logger.info(`=======Command Reached Equipment Control Action=======`);
	// Update Header Temperature presentValue
    // if (cpmScenario in dataHandler.getSiteSpecificDataItem(['EQUIPMENT_CONTROL_ACTION'])) {
		if(devType in dataHandler.getSiteSpecificDataItem(['Plant_Snapshot'])){
			if(eqp in dataHandler.getSiteSpecificDataItem(['Plant_Snapshot',devType])){
				dataHandler.updatePriorty(devType,eqp);
				logger.info(`Priority ---> ${dataHandler.getSiteSpecificDataItem(['Plant_Snapshot',devType,eqp,'priority'])}`);
				// if (ongoingScenario["Working_Scenario_Id"] !== "scenario_uuid") {
				// 	cpmUtils.myError(`handleScenarioStartRequest: Working with Scenario - ${ongoingScenario['Working_Scenario_Type']}`);
				// 	logger.info(`Working with a Scenario ${ongoingScenario["Working_Scenario_Id"]}; Please wait...`);
				// 	res.send(`Working with a Scenario ${ongoingScenario["Working_Scenario_Id"]}; Please wait...`);
				// 	}
				// 	else{
						// Unable to process JSON: Action,NONGL_SS_AHU
						cpmScenario=dataHandler.getSiteSpecificDataItem(["ACTION",cpmScenario,devType])
						console.log("===========Scenario Action be taken placed=========",cpmScenario);
						let payload = cpmUtils.getJSONElement(req, ['body'])
						controller.addToControlCommand(payload,request_id,commandFrom,(err,res)=>{
							if(err){
								return err;
							}else{
								console.log(`START action to perform  ${cpmScenario}`)
								console.log(`in noti handler ${res}`)
									let currentScenarioJson = { "Active_Scenario": {} };
						let scenario={},tempJson={}
						let concurrent=dataHandler.getSiteSpecificDataItem(["allowConcurrent"])
						if(concurrent){
							//true
							console.log("=======true========");
							let paramm_id=cpmUtils.getJSONElement(req, ['body','param_id'])
							console.log("============",paramm_id)
							let param_value=cpmUtils.getJSONElement(req, ['body','value'])
							console.log("=====================",param_value)
							scenario['Working_Combination'] = "";
							scenario['Working_Scenario_Type'] = cpmScenario;
							scenario['Manual_Control'] = true;
							scenario['Working_Scenario_Id'] = cpmUtils.getUUID();
							scenario['Scenario_Current_State'] = "SCENARIO_STARTED";
							scenario['State_Change_Timestamp'] = cpmUtils.getCurrentTime();
							scenario['commandFrom'] = commandFrom
							scenario["Scenario_Previous_State"]=""
							scenario['Working_On_Equipment']={}
							scenario['Working_On_Equipment'][devType]=cpmUtils.getJSONElement(req, ['body','ss_id'])
							scenario['Eqp_Attributes']={[paramm_id] : param_value}
							currentScenarioJson["Active_Scenario"][eqp]=scenario
							console.log(JSON.stringify(currentScenarioJson))
							dataHandler.setSiteSpecificDataItems(currentScenarioJson);
							tempJson["ss_id"]=cpmUtils.getJSONElement(req, ['body','ss_id'])
							tempJson["ss_type"]=devType
							// tempJson["Eqp_Attributes"] = {cpmUtils.getJSONElement(req, ['body', 'param_id']): cpmUtils.getJSONElement(req, ['body', 'value'])};
						   
							// tempJson["Eqp_Attributes"]={ cpmUtils.getJSONElement(req, ['body','param_id']) : cpmUtils.getJSONElement(req, ['body','value']) }
							tempJson["Eqp_Attributes"]={ [paramm_id] : param_value }
							logger.info(`=====My Active Scenario in Manual Control=====${JSON.stringify(tempJson)}`);
							logger.info(`${JSON.stringify(dataHandler.getActiveScenario())}`);
							scenarioHandler.changeScenarioState (scenario, tempJson, (e, s) => {
								if (e) prepareErrorResponse(e, res);
								if (s) res.json(s);
							});
						}else{
							//false
						currentScenarioJson["Active_Scenario"]['Working_Combination'] = "";
						currentScenarioJson["Active_Scenario"]['Working_Scenario_Type'] = cpmScenario;
						currentScenarioJson["Active_Scenario"]['Manual_Control'] = true;
						currentScenarioJson["Active_Scenario"]['Working_Scenario_Id'] = cpmUtils.getUUID();
						currentScenarioJson["Active_Scenario"]['Scenario_Current_State'] = "SCENARIO_STARTED";
						currentScenarioJson["Active_Scenario"]['State_Change_Timestamp'] = cpmUtils.getCurrentTime();
						currentScenarioJson["Active_Scenario"]['commandFrom'] = commandFrom
						currentScenarioJson["Active_Scenario"]['Working_On_Equipment']={}
						currentScenarioJson["Active_Scenario"]['Working_On_Equipment'][devType]=cpmUtils.getJSONElement(req, ['body','ss_id'])
						// Update Active Scenario
						dataHandler.setSiteSpecificDataItems(currentScenarioJson);
						logger.info(`${JSON.stringify(dataHandler.getActiveScenario())}`);
						scenarioHandler.changeScenarioState (null, null, (e, s) => {
							if (e) prepareErrorResponse(e, res);
							if (s) res.json(s);
						});
					}				
								// return res;
							}
						})
					
					// }	
			}else{
				logger.info(`"Invalid ID provided.`)
				return res.status(400).send({ message: "Invalid ID provided." });		
			}
			
		}else{
			logger.info(`"Invalid SSType provided.`)
			return res.status(400).send({ message: "Invalid SSTYPE provided." });	
		}
    // }else{
	// 	logger.info(`"Invalid Action provided.`)
	// 	return res.status(400).send({ message: "Invalid action provided." });
	// }
}

module.exports = {
	processCPMNotification,
	processNotification,
	processStateTransition,
	processWatchDog,
	getCPMSnapshotHandler,
	equipmentControlAction,
	handleScenarioStartRequest
}
