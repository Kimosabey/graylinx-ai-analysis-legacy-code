const { pool } = require('../Database/pool');
const fns = require('date-fns');
const prelog = msg => console.log("prepareSnapShot.js", fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"), msg);
const cpmUtils = require('./CPM_Utilities');
const fs = require('fs');
const { clearScreenDown } = require('readline');
const filePath = './sample.json';

const executeSQLstatement = (mystmt, callback) => {
	prelog('Request to executeSQLstatement: ' + mystmt);
	pool.getConnection((error, connection) => {
		prelog('Connection Received from Pool');
		if (connection) {
			connection.query(mystmt, (error, result) => {
				prelog('Query Executed');
				connection.release();
				prelog('Connection Released to Pool');
				if (error) {
					prelog(`executeSQLstatement - Query Execution Error: ${mystmt}`);
					callback(error);
				} else {
					callback(null, result);
				}
			})
		} else {
			callback('DB CONNECTION ERROR');
		}
		// if (error) mylog(`executeSQLstatement - Connection Error: ${mystmt}`);
	})
}


function createChild(id,res){
	let address='0x'+id;
	const myDevId=0xffff0000 & address;
	let outputHex = myDevId.toString(16);
    outputHex = outputHex.padStart(8, '0');	
	children=res.filter(da=>da.glSSId.indexOf('c')!==-1?da["glSSId"]:null);
	childrenId=children.map(mda=>{ 
		const childIndex = mda.glSSId.indexOf('c');
		parentId = mda.glSSId.substring(childIndex+1, childIndex + 3)+("b7").padEnd(6,"0");
		if(parentId==outputHex){
			return mda.glSSId
		}
	})
	let myChildDev=[]
	res.forEach(function(obj) {
		// Check if glSSId of the object matches any string in a2
		if (childrenId.includes(obj.glSSId)) {
			myChildDev.push(obj);
		}
	});
	const processData = myChildDev.reduce((acc, item) => {
		const ssType = item.ss_type;
		if (ssType !== null) {
		if (!acc[ssType]) {
		  acc[ssType] = {};
		}
		acc[ssType][item.id]={
			ddcid: item.ddcid,
			BACnetDeviceAddress: item.BACnetDeviceAddress,
			id: item.id,
			name: item.name,
			glSSId:item.glSSId,
			Eqp_Attributes:createEqpAtri(item.id,res),
			// Eqp_Attributes:{},
			Eqp_Metrics:{
				"rh_cumulative":Math.floor((Math.random() * 100) +1),
				"Equipment_Faulty":false,
				"Alarm":false
			},
			EQP_COMPONENTS:createChild(item.glSSId,res),
			inUse:false
		};
	}
		return acc;
	  }, {});
	return processData;

}
function createEqpAtri(id,ru){
	const groupedData = ru.filter(fitem=> fitem.ddcid==id)
	.reduce((acc, item) => {
		const ssType = item.name;
		if (!acc[ssType]) {
		  acc[ssType] ={};
		}
		acc[ssType]={
			objId:`${item.ss_tag}:${item.glSSId}`,
			objName: item.description,
			presentValue:item.presentValue,
			// priority: new Array(16).fill(null),
			priority: (() => {
				let arr = new Array(16).fill(null); // Initialize array with 16 nulls
				if (item.name === item.con_param_id) {
					// Handle the three possible states for presentValue
					// console.log("IM here inside the plantttaaaa",item.con_param_id,item.con_param_value,item.prio_value)
					if (item.con_param_value === "active") {
						arr[item.prio_value - 1] = 1;   // Set to 1 if active
					} else if (item.con_param_value === "inactive") {
						// console.log("IM here because of INACTIVE",item.prio_value)
						arr[item.prio_value - 1] = 0;   // Set to 0 if inactive
						// console.log("array===================>",arr)
					} else {
						arr[item.prio_value - 1] = item.con_param_value; // Set to null for any other value
						// console.log("array==================>RAT",arr)
					}
					// console.log("Final Array==========================================>",arr)
				}
				return arr;
			})(),
			measured_time:item.measured_time
		};
		return acc;
	  }, {});
	return groupedData
}

const prepareTableName=(glCode,devType,tableType)=>{
	console.log(`in prepare m=name => ${devType}`)
	const deviceTypeMetric = {
		'NONGL_SS_CPM':['cpm_','_metric'],
		'GL_SS_SERVER':['server','_metric'],
		'NONGL_SS_EMS':['em_', '_metric'],
		'NONGL_SS_AHU':['ahu_', '_metric'],
		'NONGL_SS_CHILLER':['ch_', '_metric'],
		'NONGL_SS_PRIMARY_PUMP':['pu_', '_metric'],
		'NONGL_SS_SECONDARY_PUMPS':['secpu_', '_metric'],
		'NONGL_SS_CONDENSER_PUMPS':['condpu_', '_metric'],
		'NONGL_SS_PRIMARY_VARIABLE_PUMPS':['pv_', '_metric'],
		'NONGL_SS_COOLING_TOWER':['ct_', '_metric'],
		'NONGL_SS_VAV':['vav_', '_ahu_metric'],
		'NONGL_SS_COOLING_TOWER_FAN':['ctf_', '_metric'],
		'NONGL_SS_AIR_COOLED_CHILLER':['ach_','_metric'],
		'NONGL_SS_DPT_DEVICE':['dpt_','_metric'],
		'NONGL_SS_COMMON_HEADER':['coh_', '_metric'],
		'NONGL_SS_WATER_COOLED_HEADER':[ 'cohw_', '_metric'],
		'NONGL_SS_AIR_COOLED_HEADER':[ 'coha_', '_metric'],
		'NONGL_SS_CT_VARIABLE_FAN':[ 'ctfv_', '_metric'],
		'FRESH_AIR_UNIT':['fau_','_metric'],
		'SS_VENTILATOR_1':["ven_","_metric"],
		'SS_BRE_FAN':["bref_", "_metric"],
		'SS_HTE_FAN':["htef_", "_metric"],
		'SS_SUBE_FAN':["subef_", "_metric"],
// 'SS_EXHAUST_FAN':['exf_','_om_p'],
'SS_EXHAUST_FAN':['exf_', '_metric'],
'NONGL_SS_TFA': ['tfa_', '_metric'],
'NONGL_SS_DG': ['dg_', '_metric'],
'NONGL_SS_TRANSFORMER': ['trf_', '_metric'	],
'NONGL_SS_PLUMBING_WATER_PUMP': ['plw_', '_metric'],
'NONGL_SS_OVERHEAD_UNDERGROUND_TANK_LVL_SS': ['outlvl_', '_metric'],
'NONGL_SS_FIRE': ['fire_', '_metric'],
'NONGL_SS_RO_PLANT': ['rop_', '_metric'],
'NONGL_SS_WTP': ['wtp_', '_metric'],
'NONGL_SS_HYDROPNEUMATIC_PLUMBING_PUMP': ['hpp_', '_metric'],
'SS_VENTILATOR': ['vnt_', '_metric'],
'NONGL_SS_SERVER_ROOM': ['srv_', '_metric'],
'NONGL_SS_VRF':['vrf_', '_metric'],
'NONGL_SS_UPS': ['ups_', '_metric'],
'NONGL_SS_LIFT': ['lift_', '_metric'],
'NONGL_SS_WLD': ['wld_', '_metric'],
'NONGL_SS_AIR_QUALITY_MONITOR_SYSTEM': ['aqm_', '_metric'],
'NONGL_SS_SOLAR_PV_PLANT': ['spv_', '_metric']

	};

	const deviceTypeOmp = {
		'GL_SS_SERVER':['server','_om_p'],
		'NONGL_SS_EMS':['em_', '_om_p'],
		'NONGL_SS_AHU':['ahu_', '_om_p'],
		'NONGL_SS_CHILLER':['ch_', '_om_p'],
		'NONGL_SS_PRIMARY_PUMP':['pu_', '_om_p'],
		'NONGL_SS_SECONDARY_PUMPS':['secpu_', '_om_p'],
		'NONGL_SS_CONDENSER_PUMPS':['condpu_', '_om_p'],
		'NONGL_SS_COOLING_TOWER':['ct_', '_om_p'],
		'NONGL_SS_VAV':['vav_', '_ahu_om_p'],
		'NONGL_SS_COOLING_TOWER_FAN':['ctf_', '_om_p'],
		'NONGL_SS_CT_VARIABLE_FAN':['ctfv_', '_om_p'],
		'NONGL_SS_AIR_COOLED_CHILLER':['ach_','_om_p'],
		'FRESH_AIR_UNIT':['fau_','_om_p'],
		'SS_VENTILATOR_1':["ven_","_om_p"],
		'SS_BRE_FAN':["bref_", "_om_p"],
		'SS_HTE_FAN':["htef_", "_om_p"],
		'SS_SUBE_FAN':["subef_", "_om_p"]

		// 0xB5: ['NONGL_SS_VAV', 'vav', '_om_p', 'ahu_']
	};
	const tableName=tableType==="metric"?deviceTypeMetric[devType][0]+glCode+deviceTypeMetric[devType][1]:""
	console.log(`==========${tableName}===============`)
	return tableName;
}

function getMetricData(glSSId, name, ssType,devId) {
    return new Promise((resolve, reject) => {
		let table=prepareTableName(glSSId,ssType,"metric");
		console.log(`aftrer retun my name ${table}`)
		let metricQuery=`SELECT om.* FROM ${table} om inner join (select max(measured_time) as mes,metric_id from ${table} group by metric_id) as lm on (lm.mes=om.measured_time and lm.metric_id=om.metric_id)`;
		executeSQLstatement(metricQuery,(err,res)=>{
				if(err){
						console.log("err-CODE----------->",err.code);
						console.log("err-sqlMessage----------->",err.sqlMessage);
					     reject(err)
						// if (err) {
						// 	if (err.code === 'ER_NO_SUCH_TABLE') {
						// 			console.log('Table does not exist:', err.message);
						// 		const errData={
						// 			// Example metric data
						// 			"information":`cannot found such table ${table}`,
						// 			// "rh_cumulative":Math.floor((Math.random() * 100) +1),
						// 			"Equipment_Faulty":false
						// 			// Add more metrics as needed
						// 		};
						// 			resolve(errData)
						// 		// Handle the case where the table does not exist
						// 	} else {
						// 			console.log('Database err:', err);
						// 			// Handle other database errs
						// 	}
						// } 
					}else{
						let id=devId
						let alarmQuery=`select * from gl_alarm where ss_id='${id}' and restore=0`
						executeSQLstatement(alarmQuery,(alerr,alres)=>{
							if(alerr){
								reject(alerr)
							}else{
								// cpmUtils.sudhu(`alram result ${devId}====>${JSON.stringify(alres)}`);
								let metricData = {};
								 if(ssType==='NONGL_SS_DPT_DEVICE'){
									metricData = {
										"Monitor_Parameter": true,			       	   
										"THRESHOLD_CROSSING_INTERVAL": 20 ,
										"THRESHOLD_CROSSED_TIMESTAMP": "",
										"THRESHOLD_CROSSED_VALUE": 0
									}
									resolve(metricData);
								}
								else if(ssType==='NONGL_SS_WATER_COOLED_HEADER'){
									metricData = {
										"Monitor_Parameter": true,			       	   
										"THRESHOLD_CROSSING_INTERVAL": 60,
										"THRESHOLD_CROSSED_TIMESTAMP": "",
										"THRESHOLD_CROSSED_VALUE": 0
									}
									resolve(metricData);
								}
								else if(ssType==='NONGL_SS_AIR_COOLED_HEADER'){
									metricData = {
										"Monitor_Parameter": true,			       	   
										"THRESHOLD_CROSSING_INTERVAL": 20 ,
										"THRESHOLD_CROSSED_TIMESTAMP": "",
										"THRESHOLD_CROSSED_VALUE": 0
									}
									resolve(metricData);
								}
								else if(ssType==='NONGL_SS_COMMON_HEADER'){
									metricData = {
										"Monitor_Parameter": true,			       	   
										"THRESHOLD_CROSSING_INTERVAL": 20,
										"THRESHOLD_CROSSED_TIMESTAMP": "",
										"THRESHOLD_CROSSED_VALUE": 0
									}
									resolve(metricData);
								}
								else{
									let alarm=alres.length>0?true:false
									// let alarm = false;
									// console.log("-------------------alarm T/F",alarm);
									let aCode=[]
									if(alarm){
										alres.forEach((ele,i)=>{
											// console.log(ele)
											if (!aCode.includes(parseInt(ele.alarm_code))) {
												aCode.push(parseInt(ele.alarm_code))
											}
											// console.log(alres.length,"=====",i+1)
											if(i+1==alres.length){
												// console.log("UPDATE MERTIC DATA SUDHU")
												// metricData = {
												// 	"rh_cumulative":0,
												// 	"information":`data found successfully`,
												// 	"Equipment_Faulty":false,
												// 	"Alarm":true,
												// 	"Alarm_code":aCode,
												// 	"Controlled_Time":cpmUtils.getCurrentTime(),
												// 	"downtime":0
												// };
												if(ssType === "NONGL_SS_CPM"){
													metricData = {
														"rh_cumulative":0,
														"information":`data found successfully`,
														"Equipment_Faulty":false,
														"Alarm":true,
														"Alarm_code":aCode,
														"Controlled_Time":cpmUtils.getCurrentTime(),
														"downtime":0,
														"Monitor_Parameter": true,			       	   
														"THRESHOLD_CROSSING_INTERVAL": 20 ,
														"THRESHOLD_CROSSED_TIMESTAMP": "",
														"THRESHOLD_CROSSED_VALUE": 0
													};
												}else{
													metricData = {
														"rh_cumulative":0,
														"information":`data found successfully`,
														"Equipment_Faulty":false,
														"Alarm":true,
														"Alarm_code":aCode,
														"Controlled_Time":cpmUtils.getCurrentTime(),
														"downtime":0
													};
												}
												for (const obj of res) {
													const { metric_id, metric_value } = obj;
													// metricData[metric_id]=parseInt(metric_value);
													// console.log(metric_value,"==========>",metric_id)
													const roundedNumber = Math.round(metric_value * 100) / 100;//by 2 digit after decimal
													// console.log("------------>rh",roundedNumber)
													metricData[metric_id]=roundedNumber;
													}
													// Resolve the Promise with the metric data
													resolve(metricData);
											}
										}
									)
									}
									else{
										// metricData = {
										// 	"rh_cumulative":0,
										// 	"information":`data found successfully`,
										// 	"Equipment_Faulty":false,
										// 	"Alarm":false,
										// 	"Alarm_code":[],
										// 	"Controlled_Time":cpmUtils.getCurrentTime(),
										// 	"downtime":0
										// };
										if(ssType === "NONGL_SS_CPM"){
											metricData = {
												"rh_cumulative":0,
												"information":`data found successfully`,
												"Equipment_Faulty":false,
												"Alarm":true,
												"Alarm_code":aCode,
												"Controlled_Time":cpmUtils.getCurrentTime(),
												"downtime":0,
												"Monitor_Parameter": true,			       	   
												"THRESHOLD_CROSSING_INTERVAL": 20 ,
												"THRESHOLD_CROSSED_TIMESTAMP": "",
												"THRESHOLD_CROSSED_VALUE": 0
											};
										}else{
											metricData = {
												"rh_cumulative":0,
												"information":`data found successfully`,
												"Equipment_Faulty":false,
												"Alarm":false,
												"Alarm_code":[],
												"Controlled_Time":cpmUtils.getCurrentTime(),
												"downtime":0
											};
										}
										for (const obj of res) {
											const { metric_id, metric_value } = obj;
											// metricData[metric_id]=parseInt(metric_value);
											// const { metric_id, metric_value } = obj;
													// metricData[metric_id]=parseInt(metric_value);
													// console.log(metric_value,"==========>",metric_id)
													const roundedNumber = Math.round(metric_value * 100) / 100;//by 2 digit after decimal
													// console.log("------------>rh",roundedNumber)
													metricData[metric_id]=roundedNumber;
											}
											// Resolve the Promise with the metric data
											resolve(metricData);
									}
								}
								// for (const obj of res) {
								// 	const { metric_id, metric_value } = obj;
								// 	metricData[metric_id]=parseInt(metric_value);
								// 	}
								// 	// Resolve the Promise with the metric data
								// 	resolve(metricData);

							}
						})
						}
		})
    });
}

const init=(master,mycallback)=>{
	console.log(`qwervgtbnyhmjuik`)
	// const query=`SELECT lc.id as Equipment_Group,lc.name as group_name,eqp.ss_tag, eqp.ss_address_value AS glSSId,eqp.description, eqp.ss_type, eqp.id,ddc.ddcid,BACnetDeviceAddress, eqp.name,le.param_id,le.param_value as presentValue,le.measured_time FROM gl_subsystem eqp inner join (SELECT id AS ddcid, ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_SECONDARY_PUMPS' OR ss_type='NONGL_SS_AHU' OR ss_type='NONGL_SS_VAV' OR ss_type='NONGL_SS_AC_CHILLER' OR ss_type='NONGL_SS_PRIMARY_VARIABLE_PUMPS' OR ss_type='NONGL_SS_CT_VARIABLE_FAN' OR ss_type='NONGL_SS_CPM' OR ss_type='NONGL_SS_AIR_COOLED_CHILLER' OR ss_type='NONGL_SS_DPT_DEVICE' OR ss_type='NONGL_SS_COMMON_HEADER' OR ss_type='NONGL_SS_WATER_COOLED_HEADER' OR ss_type='NONGL_SS_AIR_COOLED_HEADER' OR ss_type='FRESH_AIR_UNIT' OR ss_type='SS_VENTILATOR_1' OR ss_type='SS_HTE_FAN' OR ss_type='SS_BRE_FAN' OR ss_type='SS_SUBE_FAN') AND ss_status='GL_SS_STATUS_ACTIVE' ) ddc ON (ddc.ddcid=eqp.ss_parent OR (eqp.ss_parent is null and eqp.ss_type!="GL_SS_SERVER")) left join gl_subsystem_latest_event le on (le.ss_id=ddc.ddcid and eqp.name=le.param_id)left join gl_location_subsystem_map gls on eqp.id=gls.ss_id left join gl_location lc on lc.id=gls.zone_id  where eqp.ss_status='GL_SS_STATUS_ACTIVE'  group by eqp.id order by BACnetDeviceAddress;`
	let etypes = "'GL_SS_ADDRESS_BACNET_DDC', 'NONGL_SS_PRIMARY_PUMP','NONGL_SS_EMS','NONGL_SS_CHILLER', 'NONGL_SS_CONDENSER_PUMPS', 'NONGL_SS_COOLING_TOWER', 'NONGL_SS_COOLING_TOWER_FAN', 'NONGL_SS_SECONDARY_PUMPS', 'NONGL_SS_AHU', 'NONGL_SS_VAV', 'NONGL_SS_AC_CHILLER', 'FRESH_AIR_UNIT', 'SS_VENTILATOR_1', 'SS_HTE_FAN', 'SS_BRE_FAN', 'SS_SUBE_FAN' ,'NONGL_SS_PRIMARY_VARIABLE_PUMPS','NONGL_SS_CT_VARIABLE_FAN','NONGL_SS_CPM','NONGL_SS_AIR_COOLED_CHILLER','NONGL_SS_DPT_DEVICE','NONGL_SS_COMMON_HEADER','NONGL_SS_WATER_COOLED_HEADER','NONGL_SS_WATER_COOLED_HEADER','NONGL_SS_AIR_COOLED_HEADER','SS_EXHAUST_FAN','NONGL_SS_TFA', 'NONGL_SS_DG', 'NONGL_SS_TRANSFORMER', 'NONGL_SS_PLUMBING_WATER_PUMP', 'NONGL_SS_OVERHEAD_UNDERGROUND_TANK_LVL_SS', 'NONGL_SS_FIRE', 'NONGL_SS_RO_PLANT', 'NONGL_SS_WTP', 'NONGL_SS_HYDROPNEUMATIC_PLUMBING_PUMP', 'SS_VENTILATOR', 'NONGL_SS_SERVER_ROOM', 'NONGL_SS_VRF', 'NONGL_SS_UPS', 'NONGL_SS_LIFT', 'NONGL_SS_WLD', 'NONGL_SS_AIR_QUALITY_MONITOR_SYSTEM', 'NONGL_SS_SOLAR_PV_PLANT'";
	// let etypes = "'GL_SS_ADDRESS_BACNET_DDC', 'NONGL_SS_PUMPS', 'NONGL_SS_CHILLER', 'NONGL_SS_CONDENSER_PUMPS', 'NONGL_SS_COOLING_TOWER', 'NONGL_SS_COOLING_TOWER_FAN', 'NONGL_SS_SECONDARY_PUMPS', 'NONGL_SS_AHU', 'NONGL_SS_VAV', 'NONGL_SS_AC_CHILLER', 'FRESH_AIR_UNIT', 'SS_VENTILATOR_1', 'SS_HTE_FAN', 'SS_BRE_FAN', 'SS_SUBE_FAN' ,'NONGL_SS_PRIMARY_VARIABLE_PUMPS','NONGL_SS_CT_VARIABLE_FAN','NONGL_SS_CPM','NONGL_SS_AIR_COOLED_CHILLER','NONGL_SS_DPT_DEVICE','NONGL_SS_COMMON_HEADER','NONGL_SS_WATER_COOLED_HEADER','NONGL_SS_WATER_COOLED_HEADER','NONGL_SS_AIR_COOLED_HEADER'";
	const query = `SELECT lc.id as Equipment_Group, lc.name as group_name, eqp.ss_tag, eqp.ss_address_value AS glSSId, eqp.description, eqp.ss_type, eqp.id, ddc.ddcid, BACnetDeviceAddress, eqp.name, le.param_id, le.param_value as presentValue, le.measured_time, gcc.gl_command,gcc.priority as prio_value,gcc.param_id as con_param_id,gcc.param_value as con_param_value FROM gl_subsystem eqp INNER JOIN (SELECT id AS ddcid, ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE ss_type IN (${etypes}) AND ss_status = 'GL_SS_STATUS_ACTIVE' ) ddc ON (ddc.ddcid = eqp.ss_parent OR (eqp.ss_parent IS NULL AND eqp.ss_type != 'GL_SS_SERVER')) LEFT JOIN gl_subsystem_latest_event le ON (le.ss_id = ddc.ddcid AND eqp.name = le.param_id) LEFT JOIN gl_location_subsystem_map gls ON eqp.id = gls.ss_id LEFT JOIN gl_location lc ON lc.id = gls.zone_id LEFT JOIN gl_control_command gcc ON ddc.ddcid = gcc.ss_id WHERE eqp.ss_status = 'GL_SS_STATUS_ACTIVE' GROUP BY eqp.id, le.param_id, le.param_value, le.measured_time, lc.id ORDER BY BACnetDeviceAddress;`
    executeSQLstatement(query ,async(err,ru)=>{
        if(err){
            prelog(err)
			console.log("err-------------------------------->")
        }else{
			const uniqueSSTypes = [...new Set(ru.map(item => item.ss_type))];
			cpmUtils.sudhu(`uniqueSSTypes-----> ${uniqueSSTypes}`)
            const groupedData =await ru.reduce(async(accPromise, item) => {
				const acc = await accPromise;
				const ssType = item.ss_type;
				if (ssType !== null  && ssType !== "GL_SS_ADDRESS_BACNET_DDC" && ssType!="GL_WEATHER_SERVICE" && ssType !=="GL_SS_WPIR_TYPE_01" && ssType !=="GL_SS_THLSENSOR_TYPE_01") {
					console.log(`----------inside IF`);
				if (!acc[ssType]) {
				  acc[ssType] = {};
				}
				// const metricData=[]
				const metricData = await getMetricData(item.glSSId, item.name, ssType,item.id);
				acc[ssType][item.id]={
					ssType:ssType,
					ddcid: item.ddcid,
					Equipment_Group:item.Equipment_Group!==null?item.Equipment_Group:"Combination-1",
					BACnetDeviceAddress: item.BACnetDeviceAddress,
					glSSId: item.glSSId,
					id: item.id,
					name: item.name,
					Eqp_Attributes:createEqpAtri(item.id,ru),
					Eqp_Metrics:metricData,
					EQP_COMPONENTS:await createChild(item.glSSId,ru),
					inUse:false
				};
			}
				return acc;
			  }, {});
			  master["Plant_Snapshot"]=groupedData
			  console.log('written to IBMS data block successfully');
			  mycallback(null,master)
		   }
        })
    }

module.exports={
	init
};