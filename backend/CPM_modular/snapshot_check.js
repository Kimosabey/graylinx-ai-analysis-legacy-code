
const fs = require('fs');
const cpmUtils = require('./CPM_Utilities');
const Plant_Snapshot=require('./preparePlantSnapshot')
// const c = require('ansi-colors');
// const cpmEventsActions = require('./CPM_EventsActions');
const ibms=require('./../Services/Device/myIBMSPreparation');
const dataHandler=require('./CPM_Data_Handler');
// const { get } = require('lodash');
// const dataHandler=require('./CPM_Data_Handler')
var cpmDataBlockJson = null;
var ibmsDataBlock={};
var loaderStarted = false;

function initialize(path) {
    
	cpmUtils.myError('Error while reading the file:')
	console.log(`${path}`)
	fs.readFile(path, 'utf8', (err, file) => {
		// check for any errors
		if (err) {
			cpmUtils.myError('Error while reading the file:', err)
			return
		}
		try {
			cpmDataBlockJson = JSON.parse(file);
			// output the parsed data
			cpmUtils.myDebug(cpmUtils.getJSONElement(cpmDataBlockJson, ['CPM_SCENARIOS']));
		} catch (err) {
			cpmUtils.myError('Error while parsing JSON data:', err)
		}
	});
	//read data from plant preparation 
	// Plant_Snapshot.init(cpmDataBlockJson,cpmUtils.consoleLog);
	// console.log(cpmUtils.myPrint(cpmDataBlockJson))
}

// function initializePs(){
// 	console.log(c.bgBlueBright(`before ${JSON.stringify(ibmsDataBlock)}`))
// 	Plant_Snapshot.init(ibmsDataBlock,(err,res)=>{
// 		if(res){console.log(c.bgBlueBright(`AFTER ${JSON.stringify(ibmsDataBlock)}`))}
// 	})
// 	// Plant_Snapshot.testData(mydata,(err,res)=>{
// 	// 	if(res){console.log(c.bgBlueBright(`AFTER ${JSON.stringify(mydata)}`))}
// 	// })
// }

// function updateFunction (a,b) {  return a + b;};    
function myUpdateFunction(a, b) { return b; }

// https://stackoverflow.com/questions/16384295/updating-javascript-object-recursively
function recurse(initial, update) {
	for (prop in update) {
		// cpmUtils.myError(`prop in update: ${prop}`);
		if ({}.hasOwnProperty.call(initial, prop) && {}.hasOwnProperty.call(update, prop)) {
			// cpmUtils.myError(`updating prop in initial: ${prop}`);
			if (typeof initial[prop] === 'object' && typeof update[prop] === 'object') {
				recurse(initial[prop], update[prop]);
			}
			else {
				initial[prop] = myUpdateFunction(initial[prop], update[prop]);
			}
		}
	}
}

function setSiteSpecificDataItems(updatesRequired = {}) {
	recurse(cpmDataBlockJson, updatesRequired);
	// cpmUtils.myError(`Currently Active Scenario: ${cpmUtils.myPrint(cpmU["Active_Scenario"])}`);
}


function getSiteSpecificDataItem(itemSpec = [], ignorable = false) {
	return cpmUtils.getJSONElement(cpmDataBlockJson, itemSpec, ignorable);
}


let criteria = {"EQUIPMENT_TYPE":"NONGL_SS_CHILLER", "Eqp_Attributes": {"CH_Vlv_On_Off":1},"Eqp_Metrics": {"Run_Hours": "LEAST", "Equipment_Faulty": false}}


let req = {
  myuuid: '374b4c3c-b959-4f93-ab69-a628098d0215',
  measured_time: '2024-03-28 12:23:37.036258',
  "192.168.1.31": {
    GL000000B00005: [ 'CH_Vlv_On_Off', 1, 'analogValue:8' ],
    GL000001B70004: [ 'CTW_High_Lvl', 'inactive', 'binaryValue:71' ],
    GL000000B00015: [ 'EV_Ref_Pre', 123, 'analogValue:12' ],
    GL000001B40000: [ 'Cnd_Pmp_AM_SS', 'inactive', 'binaryValue:54' ]
  },
  "192.168.1.32": {
    GL000000B00011: [ 'CDW_HST', 0, 'analogValue:8' ],
    GL000001B70004: [ 'CTW_High_Lvl', 'inactive', 'binaryValue:71' ],
    GL000000B00015: [ 'EV_Ref_Pre', 123, 'analogValue:12' ],
    GL000001B40000: [ 'Cnd_Pmp_AM_SS', 'inactive', 'binaryValue:54' ]
  }

}

function data(keys){
  s = ibms.processEquipmentCode(keys,true);
  return s;
}

// {"inputValid":true,"errorCode":[],"e_ss_type":"NONGL_SS_CHILLER","e_address_value":"0000b00000","e_name":0,"e_id":"e1a4bee6-5462-413c-8c6f-d367b06e5fea","p_parent_eqp":"e1a4bee6-5462-413c-8c6f-d367b06e5fea","p_name":"CDW_HST","p_description":"000000B00011","eqp_tableName":"ch_0000b00000_om_p"}
//esstype , eid , pname ,pvalue 
          // let Data ={
          //   inputValid: true,
          //   errorCode: [],
          //   e_ss_type: 'NONGL_SS_COOLING_TOWER_FAN',
          //   e_address_value: '0000b8c000',
          //   e_name: 0,
          //   e_id: '6eb76029-57ef-4c68-a259-b5d7ebd0b79d',
          //   p_parent_eqp: '6eb76029-57ef-4c68-a259-b5d7ebd0b79d',
          //   p_name: 'CT_Fan_Trip_On_Off_SS',
          //   p_description: '000000B8C002',
          //   eqp_tableName: 'ctf_0000b8c000_om_p'
          // }
         
function preProcessBody(mybody) {
	let processedBody = {}, mykey,data;
  let e_parent= true; 
  let glcodes = []
	for (mykey in mybody) {
	  switch (mykey) {
		case 'myuuid':
		  processedBody['reqUUID'] = mybody['myuuid'];
		  break;
		case 'measured_time':
		  processedBody['measured_time'] = mybody['measured_time'];
		  break;
		default:
		  processedBody['ip_address'] = mykey;
		  
		  for (gl in mybody[mykey]){
        if(mybody[mykey].hasOwnProperty(gl)){
          glcodes.push(gl);
          data = ibms.processEquipmentCode(gl);
          if(data['e_ss_type'=== "NONGL_SS_COOLING_TOWER_FAN"]){
            e_parent = false;
          }
          //0001b00000
          //0000b8c000
          dataHandler.updatePlantSnapshot(data["e_ss_type"], data['e_address_value'] , data['p_name'], mybody[mykey][gl][1], e_parent);
          switch (data["e_ss_type"]) {
            					case "NONGL_SS_CHILLER":
            						console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            						break;
                      
            					case "NONGL_SS_CT_FAN":
                        console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            					// 	processCPMNotification(req, res);
            						break;
              
            					case "NONGL_SS_PRIMARY_PUMP":
                        console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            					// 			processCPMNotification(req, res);
            						break;
                      
            					case "NONGL_SS_SECONDARY_PUMP":
                        console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            					// 		processCPMNotification(req, res);
            						break;
                      
            					case "NONGL_SS_CONDENSER_PUMP":
                        console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            					// 	processCPMNotification(req, res);
            						break;
              
            					case "NONGL_SS_COOLING_TOWER":
                        console.log(data['e_ss_type']);	
            						// scenarioHandler.processCPMScenarioStateWithParams(null, null, mycallback);
            					// 	processCPMNotification(req, res);
            						break;
              
            					// default:
            					// 	if (s) res.json(s);
            					// 	if (e) prepareErrorResponse(e, res);
            					// 	break;
            					}
        }
		  }

	  }
	}
}   

  // setTimeout(() => {
  //   dataHandler.initializePs()   
  // }, 1000);
  // setTimeout(() => {
  //   preProcessBody(body)
  // }, 5000);


// processSnapshotCheck(criteria,req);
// ----------------> {
//   '0001b00000': {
//     ddcid: 'a84b6fae-dba2-11ee-8177-842afdd05b3a',
//     BACnetDeviceAddress: '192.168.1.31',
//     id: '7b5fe673-3399-4531-b6ab-14db3d6b4122',
//     name: '1',
//     Eqp_Attributes: {
//       CH_Out_Vlv_On_Off: [Object],
//       CDW_HST: [Object],
//       CH_AM_SS: [Object],
//       CH_On_Off: [Object],
//       CDW_Out_Temp: [Object],
//       CHW_In_Temp: [Object],
//       CDW_In_Temp: [Object],
//       CDW_HRT: [Object],
//       CH_Out_Vlv_On_Off_SS: [Object],
//       CWH_ST_SP: [Object],
//       CWH_ST: [Object],
//       CWH_RT_SP: [Object],
//       CD_In_Vlv_On_Off: [Object],
//       CHW_Out_Temp: [Object],
//       Bypass_Vlv_Cmd: [Object],
//       CD_In_Vlv_On_Off_SS: [Object],
//       CH_On_Off_SS: [Object],
//       CWH_RT: [Object]
//     },
//     Eqp_Metrics: { Run_Hours: 3, Equipment_Faulty: false },
//     EQP_COMPONENTS: {}
//   },
//   '0003b00000': {
//     ddcid: 'a84b6fae-dba2-11ee-8177-842afdd05b3a',
//     BACnetDeviceAddress: '192.168.1.31',
//     id: 'bf6095a6-ace7-460a-9ab7-826c6a1c73b2',
//     name: '3',
//     Eqp_Attributes: { CH_Run_SS: [Object] },
//     Eqp_Metrics: { Run_Hours: 4, Equipment_Faulty: false },
//     EQP_COMPONENTS: {}
//   },
//   '0004b00000': {
//     ddcid: 'a84b6fae-dba2-11ee-8177-842afdd05b3a',
//     BACnetDeviceAddress: '192.168.1.31',
//     id: '98343a82-7a43-4d5a-88be-cceff568630d',
//     name: '4',
//     Eqp_Attributes: { CH_Trip_SS: [Object] },
//     Eqp_Metrics: { Run_Hours: 9, Equipment_Faulty: false },
//     EQP_COMPONENTS: {}
//   },
//   '0000b00000': {
//     ddcid: 'a84b6fae-dba2-11ee-8177-842afdd05b3a',
//     BACnetDeviceAddress: '192.168.1.31',
//     id: 'e1a4bee6-5462-413c-8c6f-d367b06e5fea',
//     name: '0',
//     Eqp_Attributes: {
//       CH_Trip_SS: [Object],
//       CH_Out_Vlv_On_Off: [Object],
//       CDW_HRT: [Object],
//       CHW_In_Temp: [Object],
//       CDW_HST: [Object],
//       CD_In_Vlv_On_Off_SS: [Object],
//       Amb_Temp: [Object],
//       CWH_RT: [Object],
//       CDW_In_Temp: [Object],
//       CD_In_Vlv_On_Off: [Object],
//       Bypass_Vlv_Cmd: [Object],
//       Bypass_Vlv_Fbk: [Object],
//       CH_Out_Vlv_On_Off_SS: [Object],
//       CH_AM_SS: [Object],
//       Humidity: [Object],
//       CWH_Flow: [Object],
//       Diff_Pre_H: [Object],
//       CDW_Out_Temp: [Object],
//       DL_temp: [Object],
//       CWH_ST_SP: [Object],
//       CWH_RT_SP: [Object],
//       CH_On_Off: [Object],
//       CH_Run_SS: [Object],
//       CHW_Out_Temp: [Object],
//       CH_On_Off_SS: [Object],
//       CWH_ST: [Object]
//     },
//     Eqp_Metrics: { Run_Hours: 8, Equipment_Faulty: false },
//     EQP_COMPONENTS: {}
//   }
// }
module.exports = {data}