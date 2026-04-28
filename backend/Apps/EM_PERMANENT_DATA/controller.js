const { values } = require('lodash');
const model = require('./model');

const getEnergyDevice = (ss_type,callback)=>{
    model.getEnergyDevice(ss_type,(err,results)=>{
        if(err){
            callback(err)
        }else{
            callback(null,results)
        }
    })
}

const getLatestEnergyData = (id,ss_tag,callback)=>{
    model.getLatestEnergyData(id,ss_tag,(err,results)=>{
        if(err){
            callback(err)
        }else{
            objIn={
                'em_activePowerPhase1':'',
                'em_activePowerPhase2':'',
                'em_activePowerPhase3':'',
                'em_activePowerTotal':'',
                'em_apparentPowerPhase1':'',
                'em_apparentPowerPhase2':'',
                'em_apparentPowerPhase3':'',
                'em_apparentPowerTotal':'',
                'em_currentAverage':'',
                'em_currentPhase1':'',
                'em_currentPhase2':'',
                'em_currentPhase3':'',
                'em_forwardActiveEnergy':'',
                'em_forwardApparentEnergy':'',
                'em_forwardReactiveEnergy':'',
                'em_Frequency':'',
                'em_max_DM_occurrence_time_U':'',
                'em_MAX_MD_U':'',
                'em_maximumDemand':'',
                'em_meterID':'',
                'em_meterOnline_Status':'',
                'em_powerFactorPhase1':'',
                'em_powerFactorPhase2':'',
                'em_powerFactorPhase3':'',
                'em_powerFactorTotal':'',
                'em_presentDemand':'',
                'em_reactivePowerPhase1':'',
                'em_reactivePowerPhase2':'',
                'em_reactivePowerPhase3':'',
                'em_reactivePowerTotal':'',
                'em_risingDemand':'',
                'em_volatage_LL_average':'',
                'em_volatage_LN_average':'',
                'em_volatge_LL_phase_1_2':'',
                'em_volatge_LL_phase_2_3':'',
                'em_volatge_LL_phase_3_1':'',
                'em_volatge_LN_phase_1_2':'',
                'em_volatge_LN_phase_2_3':'',
                'em_volatge_LN_phase_3_1':''
            }
            // console.log("results",results)
            results.forEach(ele=>{        
                objIn[ele.param_id]=ele.param_value 
            })
            // console.log("---------------------->",objIn)

            model.insertIntoPermanentTable(id,ss_tag,objIn,(err,results)=>{
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }
    })
}
module.exports = {
    getEnergyDevice,
    getLatestEnergyData
}