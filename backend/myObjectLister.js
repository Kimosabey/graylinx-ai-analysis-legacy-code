////////////////////////////////////////////////////////////////////////////////
// PLEASE NOTE THAT THIS IS A WORK IN PROGRESS.
// IF YOU FIND ANY TROUBLES / BUGS CHECK CAREFULLY AND ENHANCE.
////////////////////////////////////////////////////////////////////////////////
const bacnet = require('bacstack');
const { exit } = require('process');
const baEnum = bacnet.enum;

function listEnums(myenum, showValues = false) {
	if (showValues === true) {
		for (const property in myenum) {
			console.log(property, ':', myenum[property]);
		}
	} else {
		for (const property in myenum) {
			console.log(property);
		}
	}
}

function lookup(mytype, myenum = 'PropertyIdentifier') {
	for (const property in baEnum[myenum]) {
		if (baEnum[myenum][property] == mytype) return property;
	}
	return null;
}

// Initialize BACStack
var client = null; // new bacnet({ apduTimeout: 10000 });//null;

// Read Device Object
const requestArrayAI = [{
	objectId: { type: 'analogInput', instance: 1101 },
	properties: [{ id: 8 }]
}];

var requestObject = [{
	objectId: { type: 8, instance: 0 },
	properties: [{ id: 8 }]
}];

var myDevices = [];
// Helper Function for readPropertyMultiple
function myReadPropertyMultiple(mytarget, reqObj, callback, debug = false) {
	client.readPropertyMultiple(mytarget, reqObj, (err, value) => {
		if (value !== undefined) {
			if (debug === true) {
				console.log('Address: ', mytarget, 'Response: ', value, 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
			}
			callback(value);
		} else {
			console.log('\x07 ==== COULD NOT GET PROPERTIES in myReadPropertyMultiple ====');
			console.log(mytarget, 'Request: ', JSON.stringify(reqObj, null, ' '), 'Error: ', JSON.stringify(err, null, ' '));
		}
	});
}

// Helper Function for readProperty
function myReadProperty(mytarget, mytype, myinstance, mypropertyid, callback, allowUndefined = false, debug = true) {
	/*{
	  len: 14,
	  objectId: { type: 2, instance: 199 },
	  property: { id: 85, index: 4294967295 },
	  values: [ { type: 4, value: 0 } ]
	}*/

	const getValue = ((val) => {
		myval = {};
		myval['address'] = mytarget;
		myval['objType'] = val['objectId']['type'];
		myval['objectId'] = val['objectId']['instance'];
		myval['propertyId'] = val['property']['id'];
		myval['property'] = val['values'][0]['value'];
		return myval;
	});
	// https://sourceforge.net/p/bacnet/mailman/message/28288885/
	let myindex = (myArgs[4] && myArgs[5] && myArgs[4].toLowerCase() === '--index') ? myArgs[5] : baEnum['ASN1_ARRAY_ALL'];
	console.log('Looking for index: ', myindex);
	console.log(`${mytarget}, { type: ${mytype}, instance: ${myinstance} }, ${mypropertyid}, { arrayIndex: ${myindex} }`);
	client.readProperty(mytarget, { type: mytype, instance: myinstance }, mypropertyid, { arrayIndex: myindex }, (err, value) => {
		if (value !== undefined) {
			if (debug === true) {
				//console.log('Address: ', mytarget, 'Response: ', JSON.stringify(value, null, ' '), 'Error: ', JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
				console.log('Address: ', mytarget, 'Response Length (Bytes): ', value.len, 'Error: ', JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
			}
			callback(value, myinstance);//callback(getValue(value), myinstance)
		} else if (allowUndefined === false) {
			console.log('==== COULD NOT GET PROPERTY in myReadProperty ====');
			console.log(mytarget, 'Error: ', err, JSON.stringify(err, null, ' '), 'Request: ', `type: ${mytype}, instance: ${myinstance}, property: ${mypropertyid}`);
		}
	});
}

function prepareMyRequestObject() {
	let myobj = {};
	var requestObject = [];

	for (let i = 0; i < 5; i++) {
		myobj = {};
		myobj = { objectId: { type: 2, instance: i }, properties: [{ id: 85 }] }
		requestObject.push(myobj);
	}
	return requestObject;
}

const getObjListAsync = (address, deviceId, callback, myclient = null, debug = false, pollInterval = 0.01) => {
	var nObjs = 0, myObjects = [], temp, index = 0;
	var lc = (myclient !== null) ? myclient : new bacnet({ apduTimeout: 10000 });
	var iamrunning = false, timerId = null;

	lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: "0" }, (err, value) => {
		if (err) { console.log(`Could not get Number of Objects!!!`) }
		if (value) {
			temp = value['values'][0];
			console.log(`Getting Number of Objects: -- ${JSON.stringify(temp, null, ' ')}`);
			nObjs = (temp['type'] === baEnum['ApplicationTags']['UNSIGNED_INTEGER']) ? temp['value'] : -1;

			timerId = setInterval(() => {
				if (iamrunning) {
					// Handle data receipt
				} else {
					if (index >= nObjs) {
						// Stop Timer if All Data is read
						if (myObjects.length === nObjs) {
							clearInterval(timerId);
							timerId = null;
							if (myclient !== null) lc.close();
							callback(null, myObjects);
						}
					} else {
						iamrunning = true;
						lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: ++index },
							(err_i, value_i) => {
								iamrunning = false;
								if (err_i) {
									myObjects.push({ 'error': err_i });
									console.log(`Err: ${index} ${err_i} - ${err_i.message} at ${new Date()}; Waiting for 5 Seconds`);
									// lc.close();
								}
								if (value_i) {
									myObjects.push(value_i['values'][0]);
									console.log(`Read: ${index} ${JSON.stringify(value_i['values'][0], null, ' ')}`);
								}
							});
					}
				}
			}, pollInterval * 1000);
		}
	});
}
const getObjListAsync1 = (address, deviceId, callback, myclient = null, debug = false) => {
	var iamrunning = false, mytimer = null;
	var nObjs = 160, myList = [], myObjects = [], temp;
	var lc = (myclient !== null) ? myclient : new bacnet({ apduTimeout: 10000 });

	lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: "0" }, (err, value) => {
		if (err) { console.log(`Could not get Number of Objects!!!`) }
		if (value) {
			temp = value['values'][0];
			console.log(`Getting Number of Objects: -- ${JSON.stringify(temp, null, ' ')}`);
			nObjs = (temp['type'] === baEnum['ApplicationTags']['UNSIGNED_INTEGER']) ? temp['value'] : -1;

			for (let i = 1; i <= nObjs; i++) {
				console.log(`Run Status: ${iamrunning} Timer: ${mytimer} - Index: ${i} at ${new Date()}; Waiting for 1 Seconds`);
				if (iamrunning === false) {
					iamrunning = true;
					lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: i }, (err, value) => {
						iamrunning = false;
						if (err) {
							myObjects.push({ 'error': err });
							console.log(`Err: ${i} ${err} - ${err.message} at ${new Date()}; Waiting for 5 Seconds`);
							// lc.close();
						}
						if (value) {
							myObjects.push(value['values'][0]);
							console.log(`Read: ${i} ${JSON.stringify(value['values'][0], null, ' ')}`);
						}
						if (myList.length == myObjects.length) callback(null, myObjects);
					});
				}
				if (mytimer === null) mytimer = setInterval(function () {
					// Something you want delayed.
					console.log(`Run Status: ${iamrunning} Timer: ${mytimer} - Index: ${i} at ${new Date()}; Waiting for 1 Seconds`);
					if (iamrunning === false) {
						clearInterval(mytimer);
						mytimer = null;
					}
					console.log(`Run Status: ${iamrunning} Timer: ${mytimer} - Index: ${i} at ${new Date()}; Waiting for 1 Seconds`);
				}, 5);
			}

			// console.log(`getObjListAsync: ${address}, { type: 8, instance: ${deviceId} }, 76, { arrayIndex: i }`);
			// myList.forEach(myi => {
			// 	if (iamrunning) lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: myi }, (err, value) => {
			// 		if (err) {
			// 			myObjects.push({ 'error': err });
			// 			console.log(`Err: ${myi} ${err} - ${err.message} at ${new Date()}; Closing Connection and Waiting for 5 Seconds`);
			// 			// lc.close();
			// 			iamrunning = false;
			// 		}
			// 		if (iamrunning && value) {
			// 			myObjects.push(value['values'][0]);
			// 			// console.log(`Read: ${myi} ${JSON.stringify(value['values'][0], null, ' ')}`);
			// 		}
			// 		if (iamrunning === false) setTimeout(function () {
			// 			// Something you want delayed.
			// 			// lc = new bacnet({ apduTimeout: 10000 });
			// 			iamrunning = true;
			// 		}, 5000);
			// 		if (myList.length == myObjects.length) callback(null, myObjects);
			// 	});
			// });
		}
	});

	// if (myList.length == myObjects.length) callback(null, myObjects);
	// myList = [];
	// for (let i = 0; i < myObjects.length; i++) {
	// 	myList[i] = { objectId: { type: myObjects[i]['value']['type'], instance: myObjects[i]['value']['instance'] }, properties: [{ id: 77 }] }
	// }
	// lc.readPropertyMultiple(address, myList, (err, val) => {
	// 	if (err) {
	// 		console.log(`readPropertyMultiple Err: ${err}`);
	// 	}
	// 	if (val) {
	// 		// myObjects.push(val['values'][0]);
	// 		console.log(`readPropertyMultiple Read: ${JSON.stringify(val, null, ' ')}`);
	// 	}
	// });
	callback(null, myObjects);
}

const getObjListAsyncRetry = (address, deviceId, callback, myclient = null, debug = true, pollIntervalSeconds = 0.01, retryAttempts = 3) => {
	const myDebugMsg = str => { if (debug) console.log(str) };
	const myErrorgMsg = str => console.log(str);
	const mypad = (num, mylen) => num.toString().padStart(mylen, ' ');
	const getCurrentDateTime = () => {
		const d = new Date();
		return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
	}
	const formattedMsg = (sts, nTr, nO, nRI, nEI, iN, nRdy, run, tI, atmt, i) => `${sts},${getCurrentDateTime()},${mypad(nTr, 4)},${mypad(nO, 4)},${mypad(nRI, 4)},${mypad(nEI, 4)},${mypad(iN, 4)},${mypad(nRdy, 4)},${mypad(run, 5)}, ${tI},${mypad(atmt, 1)},${mypad(i, 4)}`;
	const myFormattedDebug = (sts, nTr, nO, nRI, nEI, iN, nRdy, run, tI, atmt, i) => myDebugMsg(formattedMsg(sts, nTr, nO, nRI, nEI, iN, nRdy, run, tI, atmt, i));
	const myFormattedError = (sts, nTr, nO, nRI, nEI, iN, nRdy, run, tI, atmt, i) => myErrorgMsg(formattedMsg(sts, nTr, nO, nRI, nEI, iN, nRdy, run, tI, atmt, i));
	// Helpers
	const getObjsLength = (value) => {
		let temp = value['values'][0];
		return (temp['type'] === baEnum['ApplicationTags']['UNSIGNED_INTEGER']) ? parseInt(temp['value']) : -1;
	}
	const getOneObject = val => val['values'][0];
	// Initialize Variables and Flags
	var nObjsToRead = -1, myObjects = [], readingIndexes = [], errorIndexes = [], indexNow, nObjsReady = 0;
	var iamrunning = false, timerId = null, attempt = 0, readingInitialized = false, myi = 0;
	// Prepare BACnet client
	var lc = (myclient !== null) ? myclient : new bacnet({ apduTimeout: 1000 });

	myDebugMsg(`At getCurrentDateTime() nObjsToRead myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi`);
	myDebugMsg(`State getCurrentDateTime(), nTr,  nO, nRI, nEI,  iN,nRdy,  run, tI,T,   i`);	// start timer and wait for polling intervallet text = 
	timerId = setInterval(() => {
		if (iamrunning) {
		} else {
			// if all objects are read and available
			if (nObjsReady === nObjsToRead) {
				myFormattedDebug('SUCCS', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
				clearInterval(timerId);
				timerId = null;
				if (myclient === null) lc.close();
				// Send all Objects 
				callback(null, myObjects);
			} else if (attempt > retryAttempts) {
				myFormattedError('FAILD', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
				// if attempts completed callback(error-'failed  multiple attempts')
				clearInterval(timerId);
				timerId = null;
				if (myclient === null) lc.close();
				if (nObjsToRead === -1) {
					callback(`Could not get number of objects to read even after ${retryAttempts}`);
				} else {
					// Try sending partial results
					callback(null, myObjects);
					// callback(`ERROR - Failed after ${retryAttempts}`);
				}
			} else {
				// Prepare current Indexes and reset error Indexes, if required
				if (nObjsToRead === -1) {
					indexNow = "0";
				} else if (myi < readingIndexes.length) {
					indexNow = readingIndexes[myi++];
				} else {
					// try next attempt
					attempt++;
					// copy error indexes to current indexes and reset error indexes
					readingIndexes = [];
					for (let i = 0; i < errorIndexes.length; i++) {
						readingIndexes[i] = errorIndexes[i];
					}
					errorIndexes = [];
					myi = 0;
					indexNow = readingIndexes[myi];
					// console.log('ATTMT', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
					myFormattedError('ATTMT', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
				}
				iamrunning = true;
				// read data asynchronously next object
				lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: indexNow }, (err, value) => {
					iamrunning = false;
					// handle reading error - update error indexes
					if (err) {
						if (nObjsToRead === -1) {
							// myDebugMsg(`Could not get Number of Objects!!!`);
							attempt++;
						} else {
							errorIndexes.push(indexNow);
							myObjects[indexNow - 1] = err;
						}
						myFormattedError('ERROR', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
					}
					// else update object read
					if (value) {
						if (nObjsToRead === -1) {
							// Get Number of Objects
							nObjsToRead = getObjsLength(value);
							myDebugMsg(`Getting Number of Objects: -- ${nObjsToRead}`);
							if (nObjsToRead !== -1) {
								for (let i = 0; i < nObjsToRead; i++) {
									readingIndexes[i] = i + 1;
									myObjects[i] = null;
								}
								errorIndexes = [];
								myi = 0;
								indexNow = readingIndexes[myi];
								attempt = 0;// Reset attempts so that we can allow retryAttempts for object reading
								myFormattedDebug('COUNT', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
							}
						} else {
							myObjects[indexNow - 1] = getOneObject(value);
							nObjsReady++;
							myFormattedDebug('OBJCT', nObjsToRead, myObjects.length, readingIndexes.length, errorIndexes.length, indexNow, nObjsReady, iamrunning, timerId, attempt, myi);
						}
					}
				});
			}
		}
	}, pollIntervalSeconds * 1000);
	// restart the loop if operations are not complete
}

const getObjListAsyncWIP = (address, deviceId, callback, myclient = null, debug = false, pollIntervalSeconds = 0.01, retryAttempts = 3) => {
	var nObjsToRead = 0, temp, position = 0, readingIndex = 0;

	lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: "0" }, (err, value) => {
		if (err) {
			myDebugMsg(`Could not get Number of Objects!!!`);
			if (myclient === null) lc.close();
			callback(err, null);
		}
		if (value) {
			temp = value['values'][0];
			myDebugMsg(`Getting Number of Objects: -- ${JSON.stringify(temp, null, ' ')}`);
			nObjsToRead = (temp['type'] === baEnum['ApplicationTags']['UNSIGNED_INTEGER']) ? parseInt(temp['value']) : -1;
			// myObjects.push(nObjs);
			if (nObjsToRead === -1) {
				err = `Invalid Number of Objects! Response received is ==> ${JSON.stringify(value, null, ' ')}`;
				myErrorgMsg(err);
				if (myclient === null) lc.close();
				callback(err, null);
			} else {
				timerId = setInterval(() => {
					if (iamrunning === false) {
						// Initialization of the Read Process
						if (readingInitialized === false) {
							for (temp = 0; temp < nObjsToRead; temp++) {
								readingIndexes.push(temp);
							}
							position = 0;
						}

						if ((position >= nObjsToRead) && (errorIndexes.length == 0)) {
							// Stop Timer if All Data is read
							if (myObjects.length === nObjsToRead) {
								clearInterval(timerId);
								timerId = null;
								if (myclient !== null) lc.close();
								callback(null, myObjects);
							}
						} else {
							iamrunning = true;
							if (position >= nObjsToRead) {
								if (attempt == 1) {
									readingIndex = errorIndexes[0];
									++attempt;
								}
							} else {
								readingIndex = ++position;
							}
							lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: readingIndex },
								(err_i, value_i) => {
									iamrunning = false;
									if (err_i) {
										myObjects.push({ 'error': err_i });
										errorIndexes.push(readingIndex);
										console.log(`Err: ${readingIndex} ${err_i} - ${err_i.message} at ${new Date()}; Waiting for 5 Seconds`);
										// lc.close();
									}
									if (value_i) {
										myObjects.push(value_i['values'][0]);
										console.log(`Read: ${readingIndex} ${JSON.stringify(value_i['values'][0], null, ' ')}`);
									}
								});
						}
					} else {
						// BACnet Read Process going on; Check after pollingIntervalSeconds
					}
				}, pollIntervalSeconds * 1000);
			}
		}
	});
}
function getMyDeviceProperties(mytarget = '192.168.1.120', debug = false) {
	console.log('Started at ', new Date());
	myReadPropertyMultiple(mytarget, prepareMyRequestObject(), (val) => { console.log(JSON.stringify(val, null, ' ')) }, debug);
	console.log('Finished at ', new Date());
}
//==================================================================
// https://www.geeksforgeeks.org/node-js-socket-setrecvbuffersize-method/
// Node.js program to illustrate 
// util.promisify() methods


// importing Asynchronous Function module
// const bacnet = require('bacstack'); Already Done
// var lc = (client !== null) ? client : new bacnet({ apduTimeout: 10000 });

// Use promisify to convert 
// callback based methods to 
// promise based methods
// const myRPPromise = util.promisify(lc.readProperty);
// const lstat = util.promisify(fs.lstat)

const getObjectListPromise = async (address, deviceId, debug = false) => {
	// Importing Utilities module
	const util = require('util');
	let myInvokeId = 0;
	var lc = (client !== null) ? client : new bacnet({ apduTimeout: 10000 });
	const myRPPromise = util.promisify(lc.readProperty);

	const listLength = await myRPPromise(address, { type: 8, instance: deviceId }, 76, { arrayIndex: 0, invokeId: myInvokeId++ });
	if (debug) console.log(`Output from ListLength Request ${JSON.stringify(listLength, null, ' ')}`)
	// Get Number of Objects
	let nObjs = 160, myobj, myObjects = [];
	for (let i = 0; i < nObjs; i++) {
		myobj = await myRPPromise(address, { type: 8, instance: deviceId }, 76, { arrayIndex: (i + 1), invokeId: myInvokeId++ });
		// Get Actual Object
		myObjects.push(myobj);
	}
	console.log(`Read ${myObjects.length} Objects`);
}
const getObjectList = async (address, deviceId, debug = false) => {
	let myInvokeId = 0;
	var lc = (client !== null) ? client : new bacnet({ apduTimeout: 10000 });

	const listLength = await myRPPromise(address, { type: 8, instance: deviceId }, 76, { arrayIndex: 0, invokeId: myInvokeId++ });
	if (debug) console.log(`Output from ListLength Request ${JSON.stringify(listLength, null, ' ')}`)
	// Get Number of Objects
	let nObjs = 160, myobj, myObjects = [];
	for (let i = 0; i < nObjs; i++) {
		myobj = await myRPPromise(address, { type: 8, instance: deviceId }, 76, { arrayIndex: (i + 1), invokeId: myInvokeId++ });
		// Get Actual Object
		myObjects.push(myobj);
	}
	console.log(`Read ${myObjects.length} Objects`);
}

//==================================================================
function discoverDevObjects(address, deviceId, debug = false) {
	//requestObject[0]['objectId']['type'] = 8;// objectType = device
	//requestObject[0]['objectId']['instance'] = deviceId;
	//requestObject[0]['properties'][0]['id'] = 76;// objectProperty = objectList
	if (client === null) client = new bacnet({ apduTimeout: 10000 });
	myReadProperty(address, 8, deviceId, 76, (myAllObjects) => {
		var myObjects = myAllObjects['values'];//[0]['values'][0]['value'];
		//if (debug === true) console.log('Objects: ', JSON.stringify(myObjects, null, ' '));
		if (debug === true) {
			console.log("FIRST OBJECT: ", address, deviceId, myObjects[0]['value']['type'], myObjects[0]['value']['instance']);
		} else {
			console.log(myObjects, 'Address Device_Instance Object_Type Object_Instance');
			for (var i = 0; i < myObjects.length; i++) {
				// console.log(address, deviceId, myObjects[i]['value']['type'], myObjects[i]['value']['instance']);
				console.log(address, deviceId, myObjects[i]['type'], myObjects[i]['value']);
			}
		}
		console.log(`Discovered ${myObjects.length} Objects`);
		// client.close();
		// client = null;
	}, false, debug);
}
function discoverDevObjectsNoSegmentation(address, deviceId, callback, myclient = null, debug = false) {
	// getObjListAsync(address, deviceId, callback, myclient);
	getObjListAsyncRetry(address, deviceId, callback, myclient);
}

function discoverDevObjectsNoSegmentation0(address, deviceId, callback, myclient = null, debug = false) {
	//requestObject[0]['objectId']['type'] = 8;// objectType = device
	//requestObject[0]['objectId']['instance'] = deviceId;
	//requestObject[0]['properties'][0]['id'] = 76;// objectProperty = objectList
	//requestObject[0]['options.arrayIndex'] = 0; to get the number of objects
	//Loop throuht the Object List to get all the Objects
	var lc = (myclient !== null) ? myclient : new bacnet({ apduTimeout: 10000 });
	var objsRead = 0, nObjs = 0, myObjects = [], temp;

	console.log(`${address}, { type: 8, instance: ${deviceId} }, 76, { arrayIndex: 0 }`);
	lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: 0 }, (err, value) => {
		console.log(`${lc} ${myclient} discoverDevObjectsNoSegmentation - Err: ${err} Res: ${JSON.stringify(value['values'][0], null, ' ')}`);
		if (err) {
			if (myclient === null) lc.close();
			callback(err);
			return;
		}
		// Expecting: [ { type: 2, value: <objlist.len e.g. 361> } ]
		temp = value['values'][0]['value'];
		nObjs = (temp['type'] === baEnum['ApplicationTags']['UNSIGNED_INTEGER']) ? temp['value'] : -1;
		if (nObjs === -1) nObjs = 160;
		let myInvId = 1;
		console.log(`discoverDevObjectsNoSegmentation - ${nObjs} Objects Discovered in Device ${deviceId}`);
		if (nObjs !== -1) {
			for (let i = 0; i < nObjs; i++) {//for (let i = nObjs-1; i >= 0; i--)
				setTimeout(() => lc.readProperty(address, { type: 8, instance: deviceId }, 76, { arrayIndex: (i + 1), invokeId: myInvId++ }, (ei, vi) => {
					if (ei) {
						console.log('Read Err: ', ++objsRead,);
						myObjects.push({ 'error': ei });
					}
					// Expecting: [ { type: 12, value: { type: 8, instance: 14 } } ]
					if (vi !== undefined && vi !== null) {
						console.log('Read: ', ++objsRead,);
						myObjects.push(vi['values'][0]);
					}
					if (objsRead >= nObjs) callback(null, myObjects);
				}), 10);
			}
		}
		if (objsRead >= nObjs) {
			console.log(`Read ${myObjects.length} Objects`)
			callback(null, myObjects);
			return;
		}
	});
}

function displayHelp() {
	console.log(`processArguments - Err: ${e} Res: ${JSON.stringify(v[0], null, ' ')}`);
	for (let i = 0; i < v.length; i++) {
		if (v[i]['error']) {
			console.log(i, ' - ', v[i]['error']['message']);
		} else {
			console.log(i, ' - ', lookup(v[i]['value']['type'], 'ObjectType'), ':', v[i]['value']['instance']);
		}
	}
	console.log(`Welcome to the Simple BACnet Utilities Program.`);
}

var myArgs = [];
//https://nodejs.org/en/knowledge/command-line/how-to-parse-command-line-arguments/
function processArguments() {
	myArgs = process.argv.slice(2);
	var starttime = new Date();
	var mydebug = false;
	console.log("Program Started at - ", starttime.toDateString(), starttime.toTimeString());

	if (myArgs.length > 0) {
		console.log('myArgs: ', myArgs);
		switch (myArgs[0].toLowerCase()) {
			case 'object_list': case '2': case 'b':
				console.log(`Address: ${myArgs[1]} DeviceId: ${myArgs[2]}`);
				mydebug = (myArgs[3] && myArgs[3].toLowerCase() === '--debug') ? true : false;
				discoverDevObjects(myArgs[1], myArgs[2], mydebug);
				break;
			case 'prop_objects_list': case '3': case 'c':
				//console.log(`Address: ${myArgs[1]} DeviceId: ${myArgs[2]}`);
				//mydebug = (myArgs[3] && myArgs[3].toLowerCase() === '--debug') ? true: false;
				getMyDeviceProperties('192.168.1.120', true);
				break;
			case 'no_segmentation': case '4': case 'd':
				console.log(`Address: ${myArgs[1]} DeviceId: ${myArgs[2]}`);
				mydebug = (myArgs[3] && myArgs[3].toLowerCase() === '--debug') ? true : false;
				discoverDevObjectsNoSegmentation(myArgs[1], parseInt(myArgs[2]), (e, v) => {
					var endtime = new Date();
					console.log("Program Closed at - ", endtime.toDateString(), endtime.toTimeString());
					if (v && v.length) console.log(`processArguments - Err: ${e} Res: ${v.length} ${JSON.stringify(v, null, ' ')}`);
					// console.log(`processArguments - Err: ${e} Res: ${JSON.stringify(v[0], null, ' ')}`);
					// for (let i = 0; i < v.length; i++) {
					// 	if (v[i]['error']) {
					// 		console.log(i, ' - ', v[i]['error']['message']);
					// 	} else {
					// 		console.log(i, ' - ', lookup(v[i]['value']['type'], 'ObjectType'), ':', v[i]['value']['instance']);
					// 	}
					// }
					return;
				}, null, mydebug);
				if (client !== null) {
					client.close();
				} else {
					console.log(`Client is null, hence breaking ---`);
				}
				// exit(0);
				break;
			case 'objects_promise': case '5': case 'e':
				mydebug = (myArgs[3] && myArgs[3].toLowerCase() === '--debug') ? true : false;
				getObjectList(myArgs[1], parseInt(myArgs[2]), mydebug);
				break;
			case 'schedule_details': case '6': case 'f':
				mydebug = (myArgs[3] && myArgs[3].toLowerCase() === '--debug') ? true : false;
				client.readProperty(myArgs[1], { type: 17, instance: myArgs[2] }, 38, (err, value) => {
					if (err) {
						console.log(`Could not get Number of Objects!!!${myArgs[1]}, { type: 17(Schedule), instance: ${myArgs[2]} }, 38(exception Schedule)`);
					}
					if (value) {
						console.log(`${myArgs[1]}, { type: 17(Schedule), instance: ${myArgs[2]} }, 38(exception Schedule)`);
						console.log(JSON.stringify(value['values'], null, ' '))
					}
				});
				// myReadProperty(myArgs[1], 17, myArgs[2], 38, callback);
				break;
			default:
				displayHelp();
				break;
		}
	} else {
		displayHelp();
	}
}

processArguments();
return;