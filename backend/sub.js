const bacnet = require('bacstack');
const { json } = require('body-parser');
const baEnum = bacnet.enum;


var bacnetTimeoutMS = 6000;
var bacnetPort = 47808;

var client = new bacnet({ 'port': bacnetPort, 'apduTimeout': bacnetTimeoutMS });

client.on('error', function (e) {
    console.log(e);
});


client.subscribeCOV('192.168.1.52',{type: 2, instance: 3},55,false,false,100,0,(err,value)=>{
    console.log(err);
    console.log('------------->',value);
});


// COVs will go here 
client.on('covNotifyUnconfirmed',(data)=>{console.log("covoooo",data)
                                           console.log("valueee----->",JSON.stringify(data.request.values) )                 });
