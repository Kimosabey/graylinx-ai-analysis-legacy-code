const model = require('./model');


const getDag=(DagId,callback)=>{
    model.getDag(DagId,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const getBacnetDeviceData=(id,callback)=>{
    model.getBacnetDeviceData(id,(err,res)=>{
        if(err){
            callback(null)
        }else{
            callback(null,res)
        }
    })
}

module.exports={
    getDag,
    getBacnetDeviceData
}
