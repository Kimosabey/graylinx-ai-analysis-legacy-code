const axios = require('axios');
const { compareAsc, format } = require('date-fns');
const { pool } = require('../../Database/pool');
const schedule = require('node-schedule');
//api key 3uAjlEZNTzjtlJZfCuYFkQtMuYtpDDnG

schedule.scheduleJob('30 * * * *', () => {
  pool.getConnection((err,connection)=>{
    if(connection){
      const query = 'select * from gl_subsystem where ss_type="GL_WEATHER_SERVICE";'
      connection.query(query,(err1,res1)=>{
         connection.release();
        if(err1){
          callback(err1)
        }else{
          axios
            .get(
              `https://api.tomorrow.io/v4/timelines?location=${res1[0].ss_tag}&fields=temperature,humidity&timesteps=1h&units=metric&apikey=${res1[0].ss_address_value}`
            )
            .then(response => {
              ///////////////////////////uncomment below code
              const data = response.data;
              let temperature = data.data.timelines[0].intervals;
              const currentDateTime = new Date();
              const parseTime = timeString => new Date(timeString);
              let closestObject = null;
              let minTimeDifference = Infinity;
        
              for (const obj of temperature) {
                const objectTime = parseTime(obj.startTime);
                const timeDifference = Math.abs(objectTime - currentDateTime);
        
                if (timeDifference < minTimeDifference) {
                  minTimeDifference = timeDifference;
                  closestObject = obj;
                }
              }
              /////////////////////uncomment up
              console.log(
                'Current Date and Time:',
                format(new Date(currentDateTime), 'yyyy-MM-dd HH:mm:ss')
              );
              console.log('Closest Object:', closestObject);
              // let closestObject ={
              //   "startTime": "2023-07-18T02:00:00Z",
              //   "values": {
              //       "humidity": 60,
              //       "temperature": 30.81
              //   }
              // }
              for( key in closestObject.values){
                let arr= []
                if(closestObject.values.hasOwnProperty(key)){
                  let payload ={}
                  payload["ss_id"] = res1[0].id
                  payload["param_id"] = key
                  payload["measured_time"] = format(new Date(closestObject.startTime), 'yyyy-MM-dd HH:mm:ss')
                  payload["param_value"] = closestObject.values[key]
                  arr.push(payload)
                  let count = 0
                  arr.forEach((ele)=>{
                  pool.getConnection((err,connection)=>{
                    if(connection){
                      const query1 = 'select * from gl_subsystem_latest_event where ss_id=?;'
                        connection.query(query1,[ele.ss_id],(err2,res2)=>{
                          if(err2){
                            callback(err2)
                          }else{
                             console.log("array",arr,arr.length)
                              if(res2.length > 0){
                                console.log("==============================",ele.param_value,ele.measured_time,ele.ss_id,ele.param_id)
                                const query2 = 'update gl_subsystem_latest_event set param_value=?,measured_time=? where ss_id=? and param_id=?';
                                connection.query(query2,[ele.param_value,ele.measured_time,ele.ss_id,ele.param_id], (error1, result1) => {
                                    if(error1) {
                                     callback(error1)
                                    }else{
                                      const query3 = 'insert into weather_service(ss_id,measured_time,param_id,param_value) values (?,?,?,?)'
                                      connection.query(query3,[ele.ss_id,ele.measured_time,ele.param_id,ele.param_value],(error2,result2)=>{
                                        if(error2){
                                          callback(error2)
                                        }else{
                                            count++
                                            console.log("countInUpdate",count,arr.length)
                                          if(count === arr.length) {
                                              connection.release()
                                              console.log("Data Updated")
                                            }
                                          }
                                        })
                                      }
                                    }
                                    )
                                  }else{
                                const query4 ='insert into gl_subsystem_latest_event(ss_id,measured_time,param_id,param_value) values(?,?,?,?)'
                                connection.query(query4,[ele.ss_id,ele.measured_time,ele.param_id,ele.param_value],(error3,result3)=>{
                                  if(error3){
                                    callback(error3)
                                  }else{
                                    const query5 = 'insert into weather_service(ss_id,measured_time,param_id,param_value) values (?,?,?,?)'
                                    connection.query(query5,[ele.ss_id,ele.measured_time,ele.param_id,ele.param_value],(error2,result2)=>{
                                      if(error2){
                                        callback(error2)
                                      }else{
                                        count++
                                        console.log("countInInsert",count)
                                      if(count === arr.length) {
                                        connection.release()
                                        console.log("Data Inserted")
                                      }
                                      }
                                    })
                                  }
                                })
                              }
                            }
                          })
                        }else{
                          callback('DB CONNECTION ERROR')
                        }
                      })
                    })
                }
              }
            })
            .catch(error => {
              console.log('Error:', error);
            });
        }
      })
    }else{
      callback('DB CONNECTION ERROR')
    }
  })
});
