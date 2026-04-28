const fns = require('date-fns');
const model = require('./CPM_modular.model')

const addToControlCommand = (payload,request_id,commandFrom,callback)=>{
    console.log("payload",payload)
    payload["triggered_time"] = fns.format(new Date(), "yyyy-MM-dd' 'HH:mm:ss");
    model.addToControlCommand(payload,request_id,commandFrom,(err,res)=>{
    if(err){
        callback(err)
    }else{
        callback(null,res)
    }
})
}

const updateResponseStatus=(ssid,ss_type,status)=>{
    console.log("IM in controller========================>")
    model.updateResponseStatus(ssid,ss_type,status,(err,res)=>{
        if(err){
            console.log("error in controller",err)
        }else{
            console.log("res in controller",res)
        }
    })
}

module.exports={
    addToControlCommand,
    updateResponseStatus
}