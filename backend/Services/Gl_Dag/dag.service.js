const model = require('./dag.model');

const dagRegister = (record,callback)=>{
    model.dagRegister(record,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getDDCDevices = (callback)=>{
    model.getDDCDevices((err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getDevices = (Id,callback)=>{
    model.getDevices(Id,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const editAndMapDevice = (record,callback)=>{
    model.editAndMapDevice(record,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getDevicesInfo = (Id,callback)=>{
    model.getDevicesInfo(Id,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

module.exports={
dagRegister,
getDDCDevices,
getDevices,
editAndMapDevice,
getDevicesInfo
}