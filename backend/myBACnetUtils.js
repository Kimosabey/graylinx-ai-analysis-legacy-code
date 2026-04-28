////////////////////////////////////////////////////////////////////////////////
// PLEASE NOTE THAT THIS IS A WORK IN PROGRESS.
// IF YOU FIND ANY TROUBLES / BUGS CHECK CAREFULLY AND ENHANCE.
////////////////////////////////////////////////////////////////////////////////
const bacnet = require('bacstack');
const baEnum = bacnet.enum;

function listEnums(myenum, showValues=false){
	if (showValues){
		for (const property in myenum) {
			console.log(property, ':', myenum[property]);
		}
	}else{
		for (const property in myenum) {
			console.log(property);
		}
	}
}

function lookup(mytype, myenum='PropertyIdentifier'){
	for (const property in baEnum[myenum]) {
		if (baEnum[myenum][property] == mytype) return property;
	}
	return null;
}

// Initialize BACStack
const client = new bacnet({apduTimeout: 6000});


// Read Device Object
const requestArrayAI = [{
  objectId: {type: 'analogInput', instance: 1101},
  properties: [{id: 8}]
}];

var requestObject = [{
  objectId: {type: 8, instance: 0},
  properties: [{id: 8}]
}];

var myDevices = [];

// Helper function to maintain the list of BACnet devices
function addDevice(dev){
	var myd = {}, newDev = true;
	for (var i=0; i<myDevices.length; i++){
		if (myd['address'] == dev['address']){
			newDev = false;
			break;
		}
	}
	if (newDev === true){
		myDevices.push(dev);
	}
}

// Helper Function for readProperty
function myReadPropertyAll(mytarget, mytype, myinstance, mypropertyid, callback, allowUndefined=true, debug=false){
	client.readProperty(mytarget, {type:mytype, instance:myinstance}, mypropertyid, (err, value) => {
		if (value !== undefined){
			if (debug === true){
				console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
			}
			callback(value, myinstance);
		}else if (allowUndefined === false){
			console.log('==== COULD NOT GET PROPERTY in myReadProperty ====');
			console.log(mytarget, 'Error: ', JSON.stringify(err, null, ' '), 'Request: ',  `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
		}
	});
}
function myReadProperty(mytarget, mytype, myinstance, mypropertyid, callback, allowUndefined=true, debug=false){
	client.readProperty(mytarget, {type:mytype, instance:myinstance}, mypropertyid, (err, value) => {
		if (value !== undefined){
			if (debug === true){
				console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
			}
			callback(null, value);
		// }else if (allowUndefined === false){
		// 	console.log('==== COULD NOT GET PROPERTY in myReadProperty ====');
		// 	console.log(mytarget, 'Error: ', JSON.stringify(err, null, ' '), 'Request: ',  `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
		// 	callback(err);
		}else{
			console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
			callback(null,value);
		}
	});
}
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
		{objectId: {type: 4, instance: 1}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 1, instance: 7}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 3, instance: 6}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 3, instance: 7}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 0, instance: 4}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 0, instance: 1}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 0, instance: 3}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 1, instance: 9}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 3, instance: 8}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 3, instance: 9}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 0, instance: 2}, properties: [{id: 77},{id: 85}]},
		{objectId: {type: 0, instance: 5}, properties: [{id: 77},{id: 85}]}
	];
	return requestObject;
}
/*
{
 "len": 352,
 "values": [
  {
   "objectId": {
    "type": 4,
    "instance": 2
   },
   "values": [
    {
     "id": 77,
     "index": 4294967295,
     "value": [
      {
       "value": "OUT2",
       "type": 7,
       "encoding": 0
      }
     ]
    },
    {
     "id": 85,
     "index": 4294967295,
     "value": [
      {
       "value": 0,
       "type": 9
      }
     ]
    }
   ]
  },
*/
// function getMyAHUStatus(mytarget='172.16.16.2',callback=(resulttext, objects)=>{console.log(resulttext)}){
	function getMyAHUStatus(mytarget,callback){
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

// Helper Function for readPropertyMultiple
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


// function myReadPropertyMultiple(mytarget, reqObj, callback, debug=false){
// 	console.log("im in read multiple")
// 	client.readPropertyMultiple(mytarget, reqObj, (err, value) => {
// 		console.log("im in read multiple2")
// 		if (value !== undefined){
// 			console.log('==== COULD NOT GET PROPERTIES in myReadPropertyMultiple ====');
// 			console.log(mytarget, 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
// 			callback(err)
			
// 		}else{
// 			if (debug === true){
// 				console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
// 			}
// 			callback(null,value);
			
// 			// console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
// 			// callback(null,value);
// 		}
// 	});
// }



// Helper Function for writeProperty
function myWritePropertyAll(mytarget, objType, objInstance, propertyId, propertyArray, callback, allowUndefined=true, priority=16, debug=false)
{
	client.writeProperty(mytarget, { type: objType, instance: objInstance }, propertyId,
		propertyArray, {priority: priority}, (err, value) => {
			if ((err !== undefined) && (err !== null)){
				console.log('==== COULD NOT WRITE PROPERTY in myWriteProperty ====');
				console.log(mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ',  `type: ${objType}, instance: ${objInstance}, property: ${propertyId}, Properties: ${JSON.stringify(propertyArray, null, ' ')}`);
				// callback(null,propertyArray);
			}else if (allowUndefined === false){
				if (debug === true){
					console.log(
						'Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '),
						'Error: ', JSON.stringify(err, null, ' '), 'Request: ',
						`type: ${objType}, instance: ${objInstance}, property: ${propertyId},
						Properties: ${JSON.stringify(propertyArray, null, ' ')}`
					);
				}
				//callback(value, objInstance);
			}
	});
}

function myWriteProperty(mytarget, objType, objInstance, propertyId, propertyArray, callback, allowUndefined=true, priority=16, debug=false)
{
	console.log('Inside BACnet myWriteProperty');
	// myReadProperty(mytarget, objType, objInstance, propertyId, (err,val)=>{
		// console.log(mytarget, 'Response on Read: ', JSON.stringify(val, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ',  `type: ${objType}, instance: ${objInstance}, property: ${propertyId}, Properties: ${JSON.stringify(propertyArray, null, ' ')}`);
		// if (val !== undefined){
			client.writeProperty(mytarget, { type: objType, instance: objInstance }, propertyId,
				propertyArray, {priority: priority}, (err, value) => {
					if ((err !== undefined) && (err !== null) && Object.keys(err).length === 0){
						console.log("----------------written")
						// console.log(mytarget, 'Response on Write: ', JSON.stringify(value, null, ' '),
						//  'Error: ', JSON.stringify(err, null, ' '),
						//   'Request: ',  `type: ${objType},
						//    instance: ${objInstance},
						//     property: ${propertyId},
						// 	 Properties: ${JSON.stringify(propertyArray, null, ' ')}`);
						myReadProperty(mytarget, objType, objInstance, propertyId, (err,val) => {
							// console.log(mytarget, 'Response on Final Read: ', JSON.stringify(val, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ',  `type: ${objType}, instance: ${objInstance}, property: ${propertyId}, Properties: ${JSON.stringify(propertyArray, null, ' ')}`);
							if (val !== undefined && val !== null){
								callback('Error: BACnet Final Read');
							}else{
								
								callback("unable to write");
							}
						});
					}else{
						console.log("------write done to controller-------")
						callback(null,1)
						if (debug === true){
							console.log(
								'Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '),
								'Error: ', JSON.stringify(err, null, ' '), 'Request: ',
								`type: ${objType}, instance: ${objInstance}, property: ${propertyId},
								Properties: ${JSON.stringify(propertyArray, null, ' ')}`
							);
						}
						//callback("BACnet Write Error");
					}
			});			
		// }else{callback('BACnet Read Failed')}


	// })

}

function discoverDevices(callback){
	// Get Device Instances
	client.on('iAm', (device) => {
		//addDevice(device);
		console.log('address: ', device.address);
		console.log('deviceId: ', device.deviceId);
		console.log('maxApdu: ', device.maxApdu);
		console.log('segmentation: ', device.segmentation);
		console.log('vendorId: ', device.vendorId);
		 callback(null,device)
	});
	// Discover Devices
	client.whoIs();
}

function discoverDevObjects(address, deviceId, debug=false){
  //requestObject[0]['objectId']['type'] = 8;// objectType = device
  //requestObject[0]['objectId']['instance'] = deviceId;
  //requestObject[0]['properties'][0]['id'] = 76;// objectProperty = objectList
  myReadProperty(address, 8, deviceId, 76, (myAllObjects) => {
		var myObjects = myAllObjects['values'];//[0]['values'][0]['value'];
		if (debug === true) console.log('Objects: ', JSON.stringify(myObjects, null, ' '));
		console.log('Address Device_Instance Object_Type Object_Instance');
		for (var i=0; i<myObjects.length; i++){
			console.log(address, deviceId, myObjects[i]['value']['type'], myObjects[i]['value']['instance']);
		}
  });
}

// To get ONE Specifed Property of All Objects, say presentValue
function discoverPropertyAllObjects(address, deviceId, propertyId, debug=false){
  myReadProperty(address, 8, deviceId, 76, (myAllObjects) => {
		var myObjects = myAllObjects['values'];//[0]['values'][0]['value'];
		if (debug === true) console.log('Objects: ', JSON.stringify(myObjects, null, ' '));
		console.log('Address Device_Instance Object_Instance PropId Property');
		for (var i=0; i<myObjects.length; i++){
			//if ((propertyId == 85) && (myObjects[i]['value']['type'] <= 2)){
				//console.log(address, deviceId, myObjects[i]['value']['type'], myObjects[i]['value']['instance'], propertyId);
				myReadProperty(address, myObjects[i]['value']['type'], myObjects[i]['value']['instance'], propertyId, (p_value, inst) => {
					console.log(address, deviceId, inst, propertyId, p_value);
				});
			//}
		}
  });
}

// Discover All Properties of an object
function discoverObjectProperties(address, objType, objInstance, debug=false){
  requestObject[0]['objectId']['type'] = objType;
  requestObject[0]['objectId']['instance'] = objInstance;
  requestObject[0]['properties'][0]['id'] = 8;// objectProperty = Get All Properties using id=8
  myReadPropertyMultiple(address, requestObject, (myAllObjects) => {
		var myObjects = myAllObjects['values'][0]['values'];//[0]['value'];
		console.log('Address Object_Type Object_Instance Property_Id Property');
		for (var i=0; i<myObjects.length; i++){
			console.log(address, objType, objInstance, myObjects[i]['id'], myObjects[i]['value']);
		}
  }, debug);
}

function getAHUDetails(){
	// Discover BACnet Devices - discoverDevices();
	// Identify AHU Objects - discoverDevObjects('192.168.1.10', 260001);
	// Get Relevant Values of AHU Objects
	// Prepare Response JSON
}

//discoverDevices();
//discoverDevObjects('192.168.1.10', 260001);
//discoverPropertyAllObjects('192.168.1.10', 260001, 85);
//discoverPropertyAllObjects('192.168.1.10', 260001, 77);
//discoverObjectProperties('192.168.1.10', 2, 1);
//myWriteProperty('192.168.1.10', 2, 1, 85, [{ type: 4, value: 72.0 }], ()=>{}, false, 16, true);

//discoverDevObjects('192.168.1.100', 3660630);
//discoverObjectProperties('192.168.1.100', 8, 3660630);
//discoverObjectProperties('192.168.1.100', 2, 1, true);
//discoverPropertyAllObjects('192.168.1.100', 3660630, 85, true);
//discoverPropertyAllObjects('192.168.1.100', 3660630, 77, true);
//myWriteProperty('192.168.1.100', 2, 1, 85, [{ type: 4, value: 72.0 }], ()=>{}, false, 16, true);

//discoverDevObjects('192.168.0.11', 32672);
//discoverObjectProperties('192.168.0.11', 8, 32672);
//discoverObjectProperties('192.168.0.11', 2, 1, true);
//discoverPropertyAllObjects('192.168.0.11', 32672, 77);
//discoverPropertyAllObjects('192.168.0.11', 32672, 85);

function displayHelp(){
console.log(`Welcome to the Simple BACnet Utilities Program.

This program helps discovering and working with BACnet Devices and Objects.
Use the  Arguments in the following ways for different functionality.
1) devices ==> Discover BACnet Devices within the subnet
2) objects device_ip deviceId ==> Get Device Objects e.g. 192.168.1.10 260001
3) allobjects_property device_ip deviceId propertyId ==> Get specified property (like presentValue) of all objects e.g. 192.168.1.10 260001 85
4) object_allproperties device_ip object_type objectId ==> Get All Properties of an Object e.g. objects 192.168.1.10 2 1
5) write_property device_ip object_type objectId propertyId property_type property_value ==> Update a specific property of a device object e.g. 192.168.1.10 2 1 85 4 72
6) read_property device_ip object_type objectId propertyId ==> Read a specific property of a device object e.g. 192.168.1.10 2 1 85
7) BACnet_helper enum_id show_values
	==> BACnet_helper --> To get the list of BACnet Enumerators
	==> BACnet_helper <enumerator> --> Get the List of Enumerators of <enumerator>
	==> BACnet_helper <enumerator> show_values --> Get the List of Enumerators of <enumerator> and Assigned Value

Examples:
1) node myBACnetUtils.js devices
2) node myBACnetUtils.js objects 192.168.1.10 260001
3) node myBACnetUtils.js allobjects_property 192.168.1.10 260001 77
4) node myBACnetUtils.js object_allproperties 192.168.1.10 2 1
5) node myBACnetUtils.js write_property 192.168.1.10 2 1 85 4 720
6) node myBACnetUtils.js read_property 192.168.1.10 2 1 85
7a) node myBACnetUtils.js BACnet_helper
7b) node myBACnetUtils.js BACnet_helper PropertyIdentifier
7c) node myBACnetUtils.js BACnet_helper PropertyIdentifier true
Note that this is a utility for basic functions. This can be enhanced for advanced and complex functionality as required.
`);
}

//https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
function processArguments(){
	const myArgs = process.argv.slice(2);

	if (myArgs.length > 0){
		console.log('myArgs: ', myArgs);
		switch (myArgs[0].toLowerCase()) {
			case 'devices': case '1': case 'a':
				discoverDevices();
				break;
			case 'objects': case '2': case 'b':
				console.log(`Address: ${myArgs[1]} DeviceId: ${myArgs[2]}`);
				discoverDevObjects(myArgs[1], myArgs[2]);
				break;
			case 'allobjects_property': case '3': case 'c':
				console.log(`Address: ${myArgs[1]} DeviceId: ${myArgs[2]} PropertyId: ${myArgs[3]}`);
				discoverPropertyAllObjects(myArgs[1], myArgs[2], myArgs[3]);
				break;
			case 'object_allproperties': case '4': case 'd':
				console.log(`Address: ${myArgs[1]} ObjectType: ${myArgs[2]} ObjectInstance: ${myArgs[3]}`);
				discoverObjectProperties(myArgs[1], myArgs[2], myArgs[3]);
				break;
			case 'write_property': case '5': case 'e':
				console.log(`Address: ${myArgs[1]} ObjectType: ${myArgs[2]} ObjectInstance: ${myArgs[3]} PropertyId: ${myArgs[4]} PropertyType: ${myArgs[5]} PropertyValue: ${myArgs[6]}`);
				myWriteProperty(myArgs[1], myArgs[2], myArgs[3], myArgs[4], [{ type: parseInt(myArgs[5]), value: myArgs[6] }], ()=>{});
				break;
			case 'read_property': case '6': case 'f':
				console.log(`Address: ${myArgs[1]} ObjectType: ${myArgs[2]} ObjectInstance: ${myArgs[3]} PropertyId: ${myArgs[4]}`);
				myReadProperty(myArgs[1], myArgs[2], myArgs[3], myArgs[4], (val)=>{console.log(val)});
				break;
			case 'bacnet_helper': case '7': case 'g':
				console.log(`BACnet Enumerators`);
				//(myArgs[1] != undefined) ? (myArgs[2] != undefined) ? listEnums(baEnum[myArgs[1]], true) :listEnums(baEnum[myArgs[1]]) : listEnums(baEnum);
				if (myArgs[1] != undefined){
					if (myArgs[2] != undefined){
						if (parseInt(myArgs[2]) != NaN){
							listEnums(baEnum[myArgs[1]], true);
							console.log(`BACnet['${myArgs[1]}']['${lookup(myArgs[2], myArgs[1])}']: ${myArgs[2]}`);
						}else{
							listEnums(baEnum[myArgs[1]], true);
						}
					}else{
						listEnums(baEnum[myArgs[1]]);
					}
				}else{
					listEnums(baEnum);
				}
				break;
			case 'get_ahu_details': case '8': case 'h':
				getMyAHUStatus();
				break;
			default:
				displayHelp();
				discoverDevices();
				break;
		}
  }else{
	  displayHelp();
	  discoverDevices();
  }
}

// processArguments();

module.exports = {
	myReadProperty,
	myWriteProperty,
	discoverDevices,
	myReadPropertyAll,
	myReadPropertyMultiple,
	getMyAHUStatus
}

