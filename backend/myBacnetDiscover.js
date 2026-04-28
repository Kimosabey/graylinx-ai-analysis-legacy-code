const bacnet = require('bacstack');

let myDevices = []

// Helper function to maintain the list of BACnet devices
function addDevice(dev,client1,callback){
	 myDevices.push(dev)
		console.log("------------from inside-------------");
	
}

function discoverDevices(callback){
	// Get Device Instances
	myDevices=[];
	 const client1 = new bacnet({apduTimeout: 6000});
	client1.on('iAm', (device) => {
		addDevice(device,client1,callback);
	});

	// Discover Devices

	client1.whoIs();
	
	setTimeout(() => {
		client1.close()
		callback(null,myDevices)
	}, 3000);
}

module.exports = {
	discoverDevices,
}