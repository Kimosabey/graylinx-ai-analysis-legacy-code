const { push } = require('../../Config/logger');
const bacnet = require('../../hvacBACnetClient');
const model = require('../Bacnet/bacnet.model')

const readproperty = (mytarget, myType, myinstance, mypropertyid, callback) => {
    //myReadProperty(mytarget, mytype, myinstance, mypropertyid, callback, allowUndefined=true, debug=false)
    // bacnet.myReadProperty('192.168.0.78', 2,  85, 85, (value, result) => {
    // bacnet.myReadProperty('192.168.0.83', 1,  12031, 85, (value, result) => {
    //myWriteProperty(mytarget, objType, objInstance, propertyId, propertyArray, callback, allowUndefined=true, priority=16, debug=false)
    //bacnet.myWriteProperty('192.168.0.83', 1,  12031, 85,[{ type: 4, value: 256.0 }], (value, result) => {
        bacnet.myReadPropertyAll(mytarget, myType, myinstance, mypropertyid, (value, result) => {   
        console.log("value",value)
        let response = []
        let parent = {}
        parent.objecttype = value.objectId.type
        parent.objectinstance = value.objectId.instance
        parent.propertyid = value.property.id
        parent.valuetype = value.values[0].type
        parent.presentvalue = value.values[0].value
        response.push(parent)
        console.log("response",response)
      callback(null,response);
    });
  };

const writeproperty = (mytarget, objtype, objInstance, propertyId, propertyArray, callback) =>{
    console.log("service",mytarget, objtype, objInstance, propertyId,propertyArray);
    bacnet.myWriteProperty(mytarget, objtype, objInstance, propertyId,propertyArray, (value, result)=>{
        console.log("value",value)
        console.log("result",result)
        callback(null,value);
    });
};



module.exports ={
    readproperty,
    writeproperty,
}