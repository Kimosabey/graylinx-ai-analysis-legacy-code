const datefns = require('date-fns');
const uuid = require('uuid/v4');
const fs = require('fs');
const c = require('ansi-colors');

/*function getJsonChildObject(jsonIn={}, childIndices=[]){
	// identify the child object and return, if exists otherwise null
	let myobj = null; // prepare myobj
	return myobj;
}*/

function getJSONElement(myJson = {}, elementPath = [], ignorable=false) {
	let eValue = myJson;
	for (let i = 0; i < elementPath.length; i++) {
		if (eValue !== undefined && eValue !== null) {
			eValue = eValue[elementPath[i]];

			if (typeof eValue === 'string' && eValue.toUpperCase() === 'NULL') {
				return null;
			}
		} else {
			eValue = undefined;
			if (ignorable === false) console.log(`Unable to process JSON: ${elementPath}`);
			break;
		}
	}
	return eValue !== undefined ? eValue : null;
}

let consoleLog = (e, s) => {
	if (e) console.log(`Error: ${myPrint(e)}`);
	if (s) console.log(`Success: ${myPrint(s)}`);
};

function onNotifyCPMParamData(pbsData = {}) {
	// get parameter details
	let dataDetails = { 'eqpType': '', 'eqpId': '', 'paramCode': '', 'paramValue': '', 'activeScenarioId': '' };
	// process pbsData to identify all items in dataDetails
	return dataDetails;
}

function getTimestamp() {
	// let currentTimestamp = null; // Prepare timestamp
	// return currentTimestamp;
	return getCurrentTime();
}

function getUUID() {
	let myuuid = uuid(); // Prepare uuid
	return myuuid;
}

function getCurrentTime() {
	let timeNow = new Date();
	return timeNow;
}

let myPrint = x => JSON.stringify(x, null, ' ');
let myError = (x, y='') => {console.log('\x1b[33m%s\x1b[0m', `${x} ${myPrint(y)}`); myappend(`${x} ${myPrint(y)}`)}
let myDebug = x => myappend(x);
let mySuccess = (x, y='') => console.log('\x1b[36m%s\x1b[0m', `${x} ${myPrint(y)}`);
let myTempDebug = (x, y='') => console.log('\x1b[36m%s\x1b[0m', `${x} ${myPrint(y)}`);
let myTable = (x, cols=null) => (cols !== null) ? console.table(x, cols) : console.table(x);
let sudhu=(x)=>(console.log(c.bgMagenta(`${myPrint(x)}`)))

function myappend(mycontent, myfile = 'mynewfile.txt') {
	fs.appendFile(myfile, mycontent, function (err=null) {
		if (err != null) throw err;
		// myTempDebug('Updated!');
	});
}
module.exports = {
	getCurrentTime,
	getJSONElement,
	getUUID,
	myPrint,
	consoleLog,
	myError,
	myDebug,
	mySuccess,
	myappend,
	myTempDebug,
	myTable,
	sudhu
	// plantPrepationMetod,
}