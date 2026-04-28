const bacnet = require('bacstack');

const client = new bacnet({apduTimeout: 6000});


function prepareMyRequestObject(){
	/*[
		{'objType': 'binaryInput', 'objId': 12001, 'objName': 'ahu_run_status', 'presentValue': 1, 'description': 'AHU Run Status on(1)/off(0)'},
		{'objType': 'binaryInput', 'objId': 12002, 'objName': 'ahu_mode_status', 'presentValue': 0, 'description': 'AHU Mode Status auto(0)/manual(1)'},
		{'objType': 'binaryInput', 'objId': 12003, 'objName': 'ahu_filter_status', 'presentValue': 0, 'description': 'AHU Filter Status choked(1)/ not choked(0)'},
		{'objType': 'binaryInput', 'objId': 12004, 'objName': 'ahu_trip_status', 'presentValue': 0, 'description': 'AHU Trip Status no(0)/yes(1)'},
		{'objType': 'analogInput', 'objId': 12011, 'objName': 'ahu_sa_temperature', 'presentValue': 18.0, 'description':'AHU - Supply Air Temperature', 'units': 'degreesCelsius'},
		{'objType': 'analogInput', 'objId': 12012, 'objName': 'ahu_ra_temperature', 'presentValue': 26.0, 'description':'AHU - Return Air Temperature', 'units': 'degreesCelsius'},
		{'objType': 'binaryOutput', 'objId': 12021, 'objName': 'ahu_command_on_off', 'presentValue': 0, 'description':'AHU Command On(1)/ Off(0)'},
		{'objType': 'analogOutput', 'objId': 12031, 'objName': 'ahu_vfd_mode_ramp_up_ramp_down', 'presentValue': 0.0, 'description':'AHU - VFD Mode Ramp Up(1)/ Ramp Down (0)', 'units': 'percent'},
		{'objType': 'analogOutput', 'objId': 12032, 'objName': 'ahu_chilled_water_valve_status', 'presentValue': 0.0, 'description':'AHU - Chilled Water Valve Open Status', 'units': 'percent'}
	]*/
	var requestObject = [
		// {objectId: {type: 2, instance: 2}, properties: [{id: 77},{id: 85}]},
		 {objectId: {type: 2, instance: 10}, properties: [{id: 77},{id: 85}]},
		//  {objectId: {type: 5, instance: 5}, properties: [{id: 77},{id: 85}]},
		//  {objectId: {type: 5, instance: 6}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 0, instance: 4}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 0, instance: 1}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 0, instance: 3}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 1, instance: 9}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 3, instance: 8}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 3, instance: 9}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 0, instance: 2}, properties: [{id: 77},{id: 85}]},
		// {objectId: {type: 0, instance: 5}, properties: [{id: 77},{id: 85}]}
	];
	return requestObject;
}


function getMyAHUAlamrs(mytarget,callback){
	myReadPropertyMultiple(mytarget, prepareMyRequestObject(), (err,val)=>{
		if(err){
			// callback(err)
			console.log(err)
		}else{
		var temp = val["values"], body="", myvalues=[], name='', presentValue='', others='';
		var objects = [], myobj = {};
		var header = "Time,IP_Address,Instance,ObjectType,ObjectName,PresentValue,Others\n";
		for (let i=0; i<temp.length; i++){
			myobj = {};
			myvalues = temp[i]['values'];
			name=''; presentValue=''; others='';
			// console.log(myvalues);
			for (let j=0; j<myvalues.length; j++){
				switch(myvalues[j]['id']){
					case 77:
						name = myvalues[j]['value'][0]['value'];//Index 0 may change
						break;
					case 85:
						presentValue = myvalues[j]['value'][0]['value'];//Index 0 may change
						break;
					default:
						others += JSON.stringify(myvalues[j]['value'][0]['value'], null, ' ');//Index 0 may change
						break;
				}
			}
			body += `${new Date()},${mytarget},${temp[i]["objectId"]["instance"]},${temp[i]["objectId"]["type"]},${name},${presentValue},${others}\n`;
			myobj['time']=new Date();
			myobj['objectId']=temp[i]["objectId"]["instance"];
			myobj['type']=temp[i]["objectId"]["type"];
			myobj['name'] = name;
			myobj['presentValue']=presentValue;
			objects.push(myobj);
		}
		// console.log(JSON.stringify(val,null,' '));
		// callback(header + body, objects);
		callback(null, objects);
	}
	});
}

function myReadPropertyMultiple(mytarget, reqObj, callback, debug=false){
	console.log("im in read multiple1")
	client.readPropertyMultiple(mytarget, reqObj, (err, value) => {
		console.log("im in read multiple2")
		if (value !== undefined){
			if (debug === true){
				console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
			}
			 callback(null,value);
		}else{
			console.log('==== COULD NOT GET PROPERTIES in myReadPropertyMultiple ====');
			console.log(mytarget, 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
			callback(err)
			// console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
			// callback(null,value);
		}
	});
}

module.exports = {

	myReadPropertyMultiple,
	getMyAHUAlamrs
}