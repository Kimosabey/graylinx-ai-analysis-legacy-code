const { MOVED_PERMANENTLY } = require('http-status');
const model = require('./model');


const instancesInfo=(callback)=>{
    model.instancesInfo((error,result)=>{
        if(error){
            callback(error)
        }else{
            callback(null, result)
        }
    })
}


module.exports={
    instancesInfo
}