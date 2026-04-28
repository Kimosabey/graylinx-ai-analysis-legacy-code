const { pool } = require('../../Database/pool');
const { query } = require('../../Config/logger');


const getSetPoint =  callback => {
    pool.getConnection((err, connection) => {
      if (connection) {
          const query=`select p.process_id as process_id,p.param_value as param_value,p.ss_id as ss_id,sb.ss_type as ss_type,sb.ss_parent as ss_parent,sd.param_name as paramname,sd.param_value as detail_param_value from  gl_subsystem_process_map p inner join gl_subsystem sb on sb.id=p.ss_id inner join gl_subsystem_detail sd on sd.ss_id=sb.id  where  p.status="processing" and  p.param_id="ahu_set_point";`
        // const query = `select * from  gl_subsystem_process_map where status="processing" and param_id="ahu_set_point";`;
        connection.query(query, (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            callback(null, results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

  const  getInOutairtemperature =(zoneId,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        const query = 'select somo.ss_id,somo.measured_time,somo.param_id,somo.param_value from gl_subsystem_output_map somo inner join (select max(measured_time) as mea,som.ss_id as sid,param_id,param_value,som.id as outputId from gl_subsystem_output_map som inner join gl_subsystem ssm  on som.ss_id=ssm.id where som.ss_id=? group by som.ss_id,som.param_id)as late on  (late.mea=somo.measured_time) and (late.sid=somo.ss_id) and (late.param_id=somo.param_id);';
        connection.query(query,zoneId, (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            callback(null, results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

  const  getSupplyAirTemp =(zoneId,callback) => {
    pool.getConnection((err, connection) => {
      if (connection) {
        const query = 'WITH RECURSIVE subordinates AS (SELECT id,name,zone_parent FROM gl_zone WHERE  id=? UNION SELECT p.id,p.name,p.zone_parent FROM gl_zone p INNER JOIN subordinates s ON p.zone_parent = s.id) SELECT s.id as zone_id,s.name as zone_name,s.zone_parent,sb.ss_type,sb.id as ss_id,som.param_id,som.param_value FROM subordinates s inner join gl_zone_subsystem_map zsm on zsm.zone_id=s.id inner join gl_subsystem sb on sb.id=zsm.ss_id inner join gl_subsystem_output_map som on sb.id=som.ss_id where sb.ss_type like "%ahu%"';
        connection.query(query,zoneId, (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            callback(null, results);
          }
        });
      } else {
        callback('DB connection error');
      }
    });
  };

 const getValvePosition=(process_id,callback)=>{
        pool.getConnection((error,connection)=>{
            if(connection){
                const query="select process_id,spm.ss_id,param_id,param_value,status from gl_subsystem_process_map spm inner join(select max(created_at) as mea,ss_id from gl_subsystem_process_map  where ss_id=? and ( param_id='out_air_valve' or param_id='return_air_valve' or param_id='chill_water_valve')  group by param_id ) as vmax on (vmax.mea=spm.created_at) and (vmax.ss_id=spm.ss_id); "
                connection.query(query,process_id,(error,result)=>{
                    connection.release();
                    if(error){
                        callback(error)
                    }else{
                        callback(null,result)
                    }
                })
            }else{
                callback("dbconnection error")
            }
        })
 }


 const updateChwv=(chwv,process_id,callback)=>{
     pool.getConnection((error,connection)=>{
         if(connection){
            const query="update gl_subsystem_process_map set param_value=? where param_id='chill_water_valve' and ss_id=?"
             connection.query(query,[chwv,process_id],(error,result)=>{
                 if(error){
                     callback(error)
                 }else{
                     callback(null,result)
                 }
             })
         }else{
             callback("DB CONNECTION ERROR")
         }
     })
 }


const updateSpm=(process_id,callback)=>{
    pool.getConnection((error,connection)=>{
        if(connection){
            const query="update gl_subsystem_process_map set status='done' where process_id=?"
            connection.query(query,process_id,(error,result)=>{
                if(error){
                    callback(error)
                }else{
                    callback(null,result)
                }
            })
        }else{
            callback("db connection error")
        }
    })
}


const getbactnetDAta=(ss_id,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const query="WITH RECURSIVE subordinates AS (SELECT id,name,ss_type,ss_parent,ss_tag,description,ss_address_value FROM gl_subsystem WHERE id='66d2082f-7335-4673-9067-cadc65b47666' UNION SELECT p.id,p.name,p.ss_type,p.ss_parent,p.ss_tag,p.description,p.ss_address_value FROM gl_subsystem p INNER JOIN subordinates s ON p.ss_parent = s.id where p.ss_address_value='9') SELECT * FROM subordinates order by ss_tag";
      connection.query(query,ss_id,(error,result)=>{
        if(error){
            callback(error)
        }{ 
          callback(null,result)
        }
      })
    }else{
      callback("dbconnection error")
    }
  })
}

const insertChwv =(ss_id,presentvalue,callback)=>{
  pool.getConnection((error,connection)=>{
    if(connection){
      const query = "insert into gl_subsystem_output_map (ss_id,param_value,param_id) values (?,?,?)";
      connection.query(query,[ss_id,presentvalue,"ahu_chilled_valve"],(error,result)=>{
        if(error){
          callback(error)
        }{
          callback(null,result)
        }
      })
    }else{
      callback("dbconnection error")
    }
  })
}

  module.exports = {
    getSetPoint,
    getInOutairtemperature,
    getSupplyAirTemp,
    getValvePosition,
    updateChwv,
    updateSpm,
    getbactnetDAta,
    insertChwv
};
