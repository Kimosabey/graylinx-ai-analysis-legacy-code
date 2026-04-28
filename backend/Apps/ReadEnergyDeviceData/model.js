const { pool } = require('../../Database/pool');
const { compareAsc, format } = require('date-fns');
 

const getEnergyDevice = (ss_type,callback)=>{
    pool.getConnection((err,connection)=>{
        if (connection) {
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

const getDagDevice = (id,callback)=>{
  pool.getConnection((err,connection)=>{
      if (connection) {
          const query = 'select * from gl_subsystem where id=?';
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

const addEnergyDeviceData =(insertData,ss_tag,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
          const query = "insert into gl_subsystem_output_map (ss_id,measured_time,param_id,param_value) values ?"; 
        connection.query(query,[insertData], (error, results) => {
          if (error) {
            callback(error);
          } else {
            let codeTypeObj = {
              '01': 'em', 
            }
            let energyCode = ss_tag.slice(4,6);
            let tableName = codeTypeObj[energyCode]+'_'+ss_tag+'_om_p';
            console.log(tableName,"tablename")
            //console.log("isert data ",insertData)
            const query =`insert into ${tableName}(ss_id,measured_time,param_id,param_value) values ? `;
            connection.query(query,[insertData], (error, results)=>{
              connection.release();
              if(err){
                callback(err)
              }else{
                console.log("inserted successfully")
                callback(null, results);
              }
            })
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

  const updateLatestEventSOM =(id,energyData,ss_tag,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        let count =0;
        if(energyData.length>0){
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
          energyData.forEach(element => {
            const query = "select ss_id,param_id,param_value from gl_subsystem_latest_event where ss_id=? and param_id=?"; 
            connection.query(query,[id, objectNames[element.name]],(err,results)=>{
            if (err) {
              connection.release();
              callback(err);
            } else {
              if(results.length>0){
                //update
                const query="update  gl_subsystem_latest_event set param_value=?, measured_time=? where ss_id=? and  param_id =?; "
                connection.query(query,[element.presentValue,(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss')),id,objectNames[element.name]],(err1,results1)=>{
                  if(err){
                    callback(err1)
                  }else{
                    count++
                    if(energyData.length==count){
                      connection.release();
                      callback(null,results1)
                    }
                  }
                })
              }else{
                //insert
                const query="insert into gl_subsystem_latest_event (ss_id,measured_time,param_id ,param_value)values(?,?,?,?) "
                connection.query(query,[ id,(format(new Date(element.time), 'yyyy-MM-dd HH:mm:ss')),objectNames[element.name],element.presentValue],(err2,results2)=>{
                  if(err){
                    callback(err2)
                  }else{
                    count++
                    if(energyData.length==count){
                      connection.release();
                      callback(null,results2)
                    }
                  }
                })
                
              }
             
            }
            })
          });
        }else{
          console("no data coming")
        }
      } else {
        callback('DB connection error');
      }
    });
  };

module.exports= {
getEnergyDevice,
addEnergyDeviceData,
updateLatestEventSOM,
getDagDevice
}