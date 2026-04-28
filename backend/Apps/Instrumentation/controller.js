const model = require('./model');

const getConnections = (callback)=>{
    model.getConnections((err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const getServerId = (callback) =>{
    model.getServerId((err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

const insertIntoMertic = (data,callback)=>{
    model.insertIntoMertic(data,(err,res)=>{
        if(err){
            callback(err)
        }else{
            callback(null,res)
        }
    })
}

module.exports = {
    getConnections,
    getServerId,
    insertIntoMertic
}