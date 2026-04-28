
const { pool } = require('../../Database/pool');
const print=()=>{

    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("in method PRINT");
            resolve(); // Resolve the promise after the timeout
        }, 500);
    });
    // setTimeout(() => {
    //     console.log("in method PRINT")
    // }, 500);
}

const main=async()=>{
    await print()
    let res=[{"id":9,"schedule_id":"fe8bad2f-2799-4d3e-aa45-fefa97e8baf5","target_id":null,"target_type":null,"command":"ADD_CONDENSER_PUMP","arguments":"\"startCPMScenario\"","is_active":null,"created_at":"2024-08-21 15:29:54","modified_at":"2024-08-21 15:29:54","param_name":null,"param_value":null}]
    console.log("i method MAIN",res[0].command)
}

const getschedule=(locationId)=>{
    pool.getConnection((err, connection) => {
        if (connection) {
        //   const query = `SELECT * FROM atl_p.gl_location_subsystem_map lsm INNER JOIN gl_subsystem gl ON lsm.ss_id = gl.id WHERE zone_id = ?;`;
        console.log(locationId)
        // const query=`select schedule_id,zone_id from gl_schedule_detail where zone_id like "%${locationId}%"`;
        const query=`select schedule_id,zone_id,s.cron_tab_fields,s.referenceId as refId from gl_schedule_detail sd inner join  gl_schedule s on sd.schedule_id=s.id  where  priority=13 and zone_id like "%${locationId}%"`;
        console.log("query",query)
          connection.query(query, locationId, (err, res) => {
            connection.release();
            if (err) {
            //   reject(err);
            console.log(err)
            } else {
                console.log("---------->res",res)
                res.map(r=> r.zone_id)
            //   resolve(res);
            }
          });
        } else {
        //   reject('DB Connection error');
            console.log('DB Connection error')
        }
      });
}

const start='15 13 25 9 *';
const end='15 14 25 9 *'
getschedule("8a070cb9-5302-11ef-bb08-2ccf67637fe5",start,end)

main()