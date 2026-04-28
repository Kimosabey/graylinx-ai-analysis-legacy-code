const models = require('./command_status.model');
const _ = require('lodash');


const command_status=(callback)=>{
    models.command_status((error,result)=>{
        if(error){
            callback(error)
        }else{
            callback(null,result)
        }
    })
}

module.exports = {
    command_status
}