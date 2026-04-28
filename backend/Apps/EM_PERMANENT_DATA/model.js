const { pool } = require('../../Database/pool');

const getEnergyDevice = (ss_type,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            const query = 'select * from gl_subsystem where ss_type=?';
            connection.query(query,ss_type,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback('DB connection error')
        }
    })
}

const getLatestEnergyData = (id,ss_tag,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            let codeTypeObj = {
                '01': 'em', 
              }
              let energyCode = ss_tag.slice(4,6);
              let tableName = codeTypeObj[energyCode]+'_'+ss_tag+'_om_t';
              console.log(tableName,"tablename")

            const query = `select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value from ${tableName}  somo inner join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from ${tableName}  som inner join gl_subsystem ssm on som.ss_id=ssm.id group by som.ss_id,som.param_id)as late on (late.mea=somo.measured_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id);`;
            connection.query(query,id,(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback('DB connection error')
        }
    })
}

const insertIntoPermanentTable = (id,ss_tag,objIn,callback)=>{
    pool.getConnection((err,connection)=>{
        if(connection){
            let codeTypeObj = {
                '01': 'em', 
              }
              let energyCode = ss_tag.slice(4,6);
              let tableName = codeTypeObj[energyCode]+'_'+ss_tag+'_om_p';
            //   console.log(tableName,"tablename")

            const query = `insert into ${tableName} (ss_id,em_activePowerPhase1,em_activePowerPhase2,em_activePowerPhase3,em_activePowerTotal,em_apparentPowerPhase1,em_apparentPowerPhase2,em_apparentPowerPhase3,em_apparentPowerTotal,em_currentAverage,em_currentPhase1,em_currentPhase2,em_currentPhase3,em_forwardActiveEnergy,em_forwardApparentEnergy,em_forwardReactiveEnergy,em_Frequency,em_max_DM_occurrence_time_U,em_MAX_MD_U,em_maximumDemand,em_meterID,em_meterOnline_Status,em_powerFactorPhase1,em_powerFactorPhase2,em_powerFactorPhase3,em_powerFactorTotal,em_presentDemand,em_reactivePowerPhase1,em_reactivePowerPhase2,em_reactivePowerPhase3,em_reactivePowerTotal,em_risingDemand,em_volatage_LL_average,em_volatage_LN_average,em_volatge_LL_phase_1_2,em_volatge_LL_phase_2_3,em_volatge_LL_phase_3_1,em_volatge_LN_phase_1_2,em_volatge_LN_phase_2_3,em_volatge_LN_phase_3_1) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) `;
            connection.query(query,[id,objIn["em_activePowerPhase1"],objIn["em_activePowerPhase2"],objIn["em_activePowerPhase3"],objIn["em_activePowerTotal"],objIn["em_apparentPowerPhase1"],objIn["em_apparentPowerPhase2"],objIn["em_apparentPowerPhase3"],objIn["em_apparentPowerTotal"],objIn["em_currentAverage"],objIn["em_currentPhase1"],objIn["em_currentPhase2"],objIn["em_currentPhase3"],objIn["em_forwardActiveEnergy"],objIn["em_forwardApparentEnergy"],objIn["em_forwardReactiveEnergy"],objIn["em_Frequency"],objIn["em_max_DM_occurrence_time_U"],objIn["em_MAX_MD_U"],objIn["em_maximumDemand"],objIn["em_meterID"],objIn["em_meterOnline_Status"],objIn["em_powerFactorPhase1"],objIn["em_powerFactorPhase2"],objIn["em_powerFactorPhase3"],objIn["em_powerFactorTotal"],objIn["em_presentDemand"],objIn["em_reactivePowerPhase1"],objIn["em_reactivePowerPhase2"],objIn["em_reactivePowerPhase3"],objIn["em_reactivePowerTotal"],objIn["em_risingDemand"],objIn["em_volatage_LL_average"],objIn["em_volatage_LN_average"],objIn["em_volatge_LL_phase_1_2"],objIn["em_volatge_LL_phase_2_3"],objIn["em_volatge_LL_phase_3_1"],objIn["em_volatge_LN_phase_1_2"],objIn["em_volatge_LN_phase_2_3"],objIn["em_volatge_LN_phase_3_1"]],(err,results)=>{
                connection.release();
                if(err){
                    callback(err)
                }else{
                    callback(null,results)
                }
            })
        }else{
            callback('DB connection error')
        }
    })
}

module.exports = {
    getEnergyDevice,
    getLatestEnergyData,
    insertIntoPermanentTable
}
