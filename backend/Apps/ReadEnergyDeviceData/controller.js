const e = require('express')
const model = require('./model')
const { compareAsc, format } = require('date-fns');

const getEnergyDevice = (ss_type,callback)=>{
    model.getEnergyDevice(ss_type,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getDagDevice = (id,callback)=>{
    model.getDagDevice(id,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const addEnergyData = (Id,energyData,ss_tag,callback)=>{
    let insertData = [];
    energyData.forEach(element => {
        const objectNames = {
            "GR_M_IP_08010e":"em_activePowerTotal",
            "GR_M_IP_08010f":"em_activePowerPhase1",
            "GR_M_IP_080110":"em_activePowerPhase2",
            "GR_M_IP_080111":"em_activePowerPhase3",
            "GR_M_IP_080112":"em_reactivePowerTotal",
            "GR_M_IP_080113":"em_reactivePowerPhase1",
            "GR_M_IP_080114":"em_reactivePowerPhase2",
            "GR_M_IP_080115":"em_reactivePowerPhase3",
            "GR_M_IP_080116":"em_apparentPowerTotal",
            "GR_M_IP_080117":"em_apparentPowerPhase1",
            "GR_M_IP_080118":"em_apparentPowerPhase2",
            "GR_M_IP_080119":"em_apparentPowerPhase3",
            "GR_M_IP_08011a":"em_powerFactorTotal",
            "GR_M_IP_08011b":"em_PowerFactorPhase1",
            "GR_M_IP_08011c":"em_PowerFactorPhase2",
            "GR_M_IP_08011d":"em_PowerFactorPhase3",
            "GR_M_IP_08011e":"em_forwardApparentEnergy",
            "GR_M_IP_08011f":"em_forwardActiveEnergy",
            "GR_M_IP_080120":"em_forwardReactiveEnergy"
        }
        let data = [];
        data.push(Id)
        data.push(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss'))
        data.push( objectNames[element.name])
        data.push(element.presentValue)
        insertData.push(data);
        // console.log("insertData",insertData)
    });
    if(insertData.length>0){
       model.addEnergyDeviceData(insertData,ss_tag,(err,results)=>{
        if(err){
            callback(err)
        }else{
            model.updateLatestEventSOM(Id,energyData,ss_tag,(err1,results1)=>{
                if(err1){
                    callback(err1)
                }else{
                    callback(null,results1)
                }                
            })
        }
       }) 
    }else{
        callback(null,'nothing to store')
    }
}
module.exports = {
    getEnergyDevice,
    addEnergyData,
    getDagDevice
}