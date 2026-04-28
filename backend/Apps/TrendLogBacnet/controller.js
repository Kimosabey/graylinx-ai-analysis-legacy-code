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

const serverRestartStatus=(callback)=>{
    model.serverRestartStatus((error,result)=>{
        if(error){
            callback(error)
        }else{
            callback(null,result)
        }
    })
}

module.exports={
    instancesInfo,
    serverRestartStatus
}