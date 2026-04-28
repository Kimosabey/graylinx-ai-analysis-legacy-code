const controller = require("./controller");
const fns = require("date-fns");
var differenceInMinutes = require("date-fns/differenceInMinutes");
const schedule = require("node-schedule");
const async = require("async");
// const get_Table_name = require('../../Services/Device/myIBMSPreparation');
const get_Table_name = require("../../CPM_modular/CPM_Data_Handler");
const { response } = require("express");
const { format, setHours, setMinutes, setSeconds } = require("date-fns");
const { PassThrough } = require("winston-daily-rotate-file");
// --------------------------------------------------------HOUR------------------------------------------------------------------------------------

schedule.scheduleJob("0 * * * *", () => {
  // schedule.scheduleJob( '*/30 * * * * *' , () =>{
  async.waterfall(
    [
      (callback) => {
        // const device_types = ["NONGL_SS_AHU","NONGL_SS_CHILLER","NONGL_SS_PUMPS","NONGL_SS_SECONDARY_PUMPS"]
        // let count = 0;
        // device_types.forEach((type)=>{
        //   console.log("type",type)
        //   get_Table_name.sendJSONToRunHour(type,(err , res) => {
        //     if (err){
        //       callback(err);
        //     }else{
        //       count ++
        //       if(count == device_types.length){
        //         console.log(count,device_types.length)
        //         callback(null,res);
        //       }
        //     }
        //   });
        // })
        const device_types = [
          "NONGL_SS_AHU",
          "NONGL_SS_CHILLER",
          "NONGL_SS_PUMPS",
          "NONGL_SS_SECONDARY_PUMPS",
          "NONGL_SS_CONDENSER_PUMPS",
          "NONGL_SS_COOLING_TOWER",
          "NONGL_SS_COOLING_TOWER_FAN",
          "FRESH_AIR_UNIT",
          "SS_VENTILATOR_1",
          "SS_BRE_FAN",
          "SS_HTE_FAN",
          "SS_SUBE_FAN",
          "NONGL_SS_AIR_COOLED_CHILLER",
          "NONGL_SS_WATER_COOLED_HEADER",
          "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
          "NONGL_SS_CT_VARIABLE_FAN",
        ];
        let promises = [];
        device_types.forEach((type) => {
          const promise = new Promise((resolve, reject) => {
            get_Table_name.sendJSONToRunHour(type, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          });
          promises.push(promise);
        });

        Promise.all(promises)
          .then((results) => {
            callback(null, results);
          })
          .catch((err) => {
            callback(err);
          });
      },
      (response, callback) => {
        let callExecuted = 0; // Initialize with 0
        let errorOccurred = false; // Flag to track if an error was encountered

        let obj = {
          NONGL_SS_AHU: "AHU_On_Off",
          NONGL_SS_CHILLER: "CH_Motor_Run",
          NONGL_SS_AIR_COOLED_CHILLER: "CH_On_Off_SS",
          NONGL_SS_PUMPS: "Pri_Pmp_SS",
          NONGL_SS_PRIMARY_VARIABLE_PUMPS: "Pri_Pmp_Run_SS",
          NONGL_SS_SECONDARY_PUMPS: "Sec_Pmp_SS",
          NONGL_SS_CONDENSER_PUMPS: "Cnd_Pmp_Run_SS",
          NONGL_SS_COOLING_TOWER_FAN: "CT_Fan_On_Off_SS",
          NONGL_SS_COOLING_TOWER: "CT_Out_Vlv_On_Off_Cmd",
          FRESH_AIR_UNIT: "FAU_Opn_SS",
          SS_BRE_FAN: "BRE_Opn_SS",
          SS_HTE_FAN: "HTE_Opn_SS",
          SS_SUBE_FAN: "SubE_Opn_SS",
          SS_VENTILATOR_1: "VEN_Opn_SS",
        };

        if (response.length > 0) {
          // Calculate the total number of calls to be made
          response.forEach((data) => {
            callExecuted += data.length;
          });

          response.forEach((data) => {
            data.forEach((deta) => {
              controller.getLast1HrData(
                deta.id,
                deta.table_name,
                obj[deta.ss_type],
                (err, res) => {
                  if (err) {
                    if (!errorOccurred) {
                      errorOccurred = true; // Set the flag to prevent further callback calls
                      callback(err); // Call callback with the error
                    }
                  } else {
                    const callB = (err, val) => {
                      if (err && !errorOccurred) {
                        errorOccurred = true; // Set the flag to prevent further callback calls
                        callback(err); // Call callback with the error
                      } else {
                        callExecuted--; // Decrement for each finished call
                        if (callExecuted === 0 && !errorOccurred) {
                          callback(null, "doneeeeee"); // Only call callback when all calls are done
                        }
                      }
                    };
                    // Perform the calculation and pass callB as the final callback
                    calculateTimeDifference(
                      res,
                      deta.id,
                      deta.table_name,
                      deta.ss_type,
                      callB
                    );
                  }
                }
              );
            });
          });
        } else {
          // No data case
          callback(null, "No Data Found");
        }
      },
    ],
    (err, response) => {
      if (err) {
        console.log("error", err);
      } else {
        // callback(null,response);
        console.log("done");
      }
    }
  );
});

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function calculateTimeDifference(
  data,
  device_id,
  table_name,
  ss_type,
  callback
) {
  // Filter active and inactive states
  const states = data.filter(
    (value) =>
      value.param_value === "active" || value.param_value === "inactive"
  );
  let totalMetricValue = 0;

  // Iterate over states to calculate time differences
  for (let i = 0; i < states.length - 1; i++) {
    const currentTime = new Date(states[i].measured_time);
    const nextTime = new Date(states[i + 1].measured_time);
    // Log the states for debugging
    // console.log('States for table', table_name, ':', states);
    if (
      (states[i].param_value === "active" &&
        states[i + 1].param_value === "active") ||
      (states[i].param_value === "active" &&
        states[i + 1].param_value === "inactive")
    ) {
      // Calculate time difference in minutes
      const timeDifference = fns.differenceInMinutes(nextTime, currentTime);

      // Adjust the metric value based on time difference
      const metricValue = timeDifference / 60;

      // Add up the metric values
      totalMetricValue += metricValue;
    }
  }
  // Display the total metric value for each ss_id
  if (data.length > 0) {
    // console.log(`ss_id: ${states[0].ss_id}, Total Metric Value: ${totalMetricValue}, table_name: ${table_name}`);
    controller.insertIntoMetricTable(
      states[0].ss_id,
      totalMetricValue,
      table_name,
      ss_type,
      (err, res) => {
        if (err) {
          callback(err);
        } else {
          callback(null, res);
        }
      }
    );
  } else {
    // console.log(`No Data is Found so Sending 0.`);
    controller.insertIntoMetricTable(
      device_id,
      0,
      table_name,
      ss_type,
      (err, res) => {
        if (err) {
          callback(err);
        } else {
          callback(null, res);
        }
      }
    );
    // callback(null,`No states to calculate metric value.`); // Call the callback without an error
  }
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//-----------------------------------------------------------------DAY---------------------------------------------------------------------------
schedule.scheduleJob("57 23 * * *", () => {
  // schedule.scheduleJob( '7 * * * *', ()=>{
  async.waterfall(
    [
      (callback) => {
        const device_types = [
          "NONGL_SS_AHU",
          "NONGL_SS_CHILLER",
          "NONGL_SS_PUMPS",
          "NONGL_SS_SECONDARY_PUMPS",
          "NONGL_SS_CONDENSER_PUMPS",
          "NONGL_SS_COOLING_TOWER",
          "NONGL_SS_COOLING_TOWER_FAN",
          "FRESH_AIR_UNIT",
          "SS_VENTILATOR_1",
          "SS_BRE_FAN",
          "SS_HTE_FAN",
          "SS_SUBE_FAN",
          "NONGL_SS_AIR_COOLED_CHILLER",
          "NONGL_SS_WATER_COOLED_HEADER",
          "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
          "NONGL_SS_CT_VARIABLE_FAN",
        ];
        let promises = [];
        device_types.forEach((type) => {
          const promise = new Promise((resolve, reject) => {
            get_Table_name.sendJSONToRunHour(type, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          });
          promises.push(promise);
        });

        Promise.all(promises)
          .then((results) => {
            callback(null, results);
          })
          .catch((err) => {
            callback(err);
          });
      },
      (response, callback) => {
        let callExecuted = response.length;
        if (response.length > 0) {
          response.forEach((data) => {
            data.forEach((deta) => {
              const interval = "1 DAY";
              const metric_id = "rh_hour";
              console.log("table_name", deta.table_name, interval, metric_id);
              controller.getCumilativeMetricData(
                deta.table_name,
                interval,
                metric_id,
                (err, res) => {
                  if (err) {
                    if (err.code === "ER_NO_SUCH_TABLE") {
                      console.log("No table found");
                    } else {
                      callback(err);
                    }
                  } else {
                    const callB = (err, val) => {
                      callExecuted--;
                      if (callExecuted === 0) {
                        callback(null, "doneeeeee");
                      }
                    };
                    addCumilativeMetricData(
                      res,
                      deta.table_name,
                      interval,
                      deta.ss_type,
                      callB
                    );
                  }
                }
              );
            });
          });
        } else {
          callback(null, "No Data Found");
        }
      },
    ],
    (err, response) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("done");
      }
    }
  );
});
//-------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------WEEk----------------------------------------------------------------------------
schedule.scheduleJob("55 23 * * 0", () => {
  // schedule.scheduleJob( '13 * * * *', ()=>{
  async.waterfall(
    [
      (callback) => {
        const device_types = [
          "NONGL_SS_AHU",
          "NONGL_SS_CHILLER",
          "NONGL_SS_PUMPS",
          "NONGL_SS_SECONDARY_PUMPS",
          "NONGL_SS_CONDENSER_PUMPS",
          "NONGL_SS_COOLING_TOWER",
          "NONGL_SS_COOLING_TOWER_FAN",
          "FRESH_AIR_UNIT",
          "SS_VENTILATOR_1",
          "SS_BRE_FAN",
          "SS_HTE_FAN",
          "SS_SUBE_FAN",
          "NONGL_SS_AIR_COOLED_CHILLER",
          "NONGL_SS_WATER_COOLED_HEADER",
          "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
          "NONGL_SS_CT_VARIABLE_FAN",
        ];
        let promises = [];
        device_types.forEach((type) => {
          const promise = new Promise((resolve, reject) => {
            get_Table_name.sendJSONToRunHour(type, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          });
          promises.push(promise);
        });

        Promise.all(promises)
          .then((results) => {
            callback(null, results);
          })
          .catch((err) => {
            callback(err);
          });
      },
      (response, callback) => {
        let callExecuted = response.length;
        if (response.length > 0) {
          response.forEach((data) => {
            data.forEach((deta) => {
              const interval = "1 WEEK";
              const metric_id = "rh_day";
              console.log("table_name", deta.table_name, interval, metric_id);
              controller.getCumilativeMetricData(
                deta.table_name,
                interval,
                metric_id,
                (err, res) => {
                  if (err) {
                    if (err.code === "ER_NO_SUCH_TABLE") {
                      console.log("No table found");
                    } else {
                      callback(err);
                    }
                  } else {
                    const callB = (err, val) => {
                      callExecuted--;
                      if (callExecuted === 0) {
                        callback(null, "doneeeeee");
                      }
                    };
                    addCumilativeMetricData(
                      res,
                      deta.table_name,
                      interval,
                      deta.ss_type,
                      callB
                    );
                  }
                }
              );
            });
          });
        } else {
          callback(null, "No Data Found");
        }
      },
    ],
    (err, response) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("done");
      }
    }
  );
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------month-------------------------------------------------------------------------------
schedule.scheduleJob("53 23 28-31 * *", () => {
  // schedule.scheduleJob( '17 * * * *', ()=>{
  async.waterfall(
    [
      (callback) => {
        const device_types = [
          "NONGL_SS_AHU",
          "NONGL_SS_CHILLER",
          "NONGL_SS_PUMPS",
          "NONGL_SS_SECONDARY_PUMPS",
          "NONGL_SS_CONDENSER_PUMPS",
          "NONGL_SS_COOLING_TOWER",
          "NONGL_SS_COOLING_TOWER_FAN",
          "FRESH_AIR_UNIT",
          "SS_VENTILATOR_1",
          "SS_BRE_FAN",
          "SS_HTE_FAN",
          "SS_SUBE_FAN",
          "NONGL_SS_AIR_COOLED_CHILLER",
          "NONGL_SS_WATER_COOLED_HEADER",
          "NONGL_SS_PRIMARY_VARIABLE_PUMPS",
          "NONGL_SS_CT_VARIABLE_FAN",
        ];
        let promises = [];
        device_types.forEach((type) => {
          const promise = new Promise((resolve, reject) => {
            get_Table_name.sendJSONToRunHour(type, (err, res) => {
              if (err) {
                reject(err);
              } else {
                resolve(res);
              }
            });
          });
          promises.push(promise);
        });

        Promise.all(promises)
          .then((results) => {
            callback(null, results);
          })
          .catch((err) => {
            callback(err);
          });
      },
      (response, callback) => {
        let callExecuted = response.length;
        if (response.length > 0) {
          response.forEach((data) => {
            data.forEach((deta) => {
              const interval = "1 MONTH";
              const metric_id = "rh_day";
              console.log("table_name", deta.table_name, interval, metric_id);
              controller.getCumilativeMetricData(
                deta.table_name,
                interval,
                metric_id,
                (err, res) => {
                  if (err) {
                    if (err.code === "ER_NO_SUCH_TABLE") {
                      console.log("No table found");
                    } else {
                      callback(err);
                    }
                  } else {
                    // console.log(`${deta.ss_type}-----------------------------------------------------`,res)
                    const callB = (err, val) => {
                      callExecuted--;
                      if (callExecuted === 0) {
                        callback(null, "doneeeeee");
                      }
                    };
                    // calculateTimeDifference(res,deta.table_name,callB);
                    addCumilativeMetricData(
                      res,
                      deta.table_name,
                      interval,
                      deta.ss_type,
                      callB
                    );
                  }
                }
              );
            });
          });
        } else {
          callback(null, "No Data Found");
        }
      },
    ],
    (err, response) => {
      if (err) {
        console.log("error", err);
      } else {
        console.log("done");
      }
    }
  );
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------

const addCumilativeMetricData = (
  data,
  table_name,
  interval,
  ss_type,
  callback
) => {
  // console.log("data",data,"table",table_name)
  if (data.length > 0) {
    if (interval == "1 DAY") {
      const modifiedData = data.map((item) => {
        return {
          ...item,
          metric_id: "rh_day",
        };
      });
      console.log("modifiedData", modifiedData);
      const truncateDate = setSeconds(
        setMinutes(setHours(new Date(), 0), 0),
        0
      );
      const measured_time = format(truncateDate, "yyyy-MM-dd'T'HH:mm:ss");
      controller.addCumilativeMetricDataToTable(
        modifiedData,
        table_name,
        measured_time,
        ss_type,
        (err, res) => {
          if (err) {
            callback(err);
          } else {
            callback(null, res);
          }
        }
      );
    } else if (interval == "1 WEEK") {
      const modifiedData = data.map((item) => {
        return {
          ...item,
          metric_id: "rh_week",
        };
      });
      console.log("modifiedData", modifiedData);
      const truncateDate = setSeconds(
        setMinutes(setHours(new Date(), 0), 0),
        0
      );
      const measured_time = format(truncateDate, "yyyy-MM-dd'T'HH:mm:ss");
      controller.addCumilativeMetricDataToTable(
        modifiedData,
        table_name,
        measured_time,
        ss_type,
        (err, res) => {
          if (err) {
            callback(err);
          } else {
            callback(null, res);
          }
        }
      );
    } else if (interval == "1 MONTH") {
      const modifiedData = data.map((item) => {
        return {
          ...item,
          metric_id: "rh_month",
        };
      });
      console.log("modifiedData", modifiedData);
      const truncateDate = setSeconds(
        setMinutes(setHours(new Date(), 0), 0),
        0
      );
      const measured_time = format(truncateDate, "yyyy-MM-dd'T'HH:mm:ss");
      controller.addCumilativeMetricDataToTable(
        modifiedData,
        table_name,
        measured_time,
        ss_type,
        (err, res) => {
          if (err) {
            callback(err);
          } else {
            callback(null, res);
          }
        }
      );
    } else {
      console.log("NO INTERVAL TO ADD DATA");
    }
  } else {
    console.log(`NO DATA FOUND IN THIS INTERVAL ${interval}`);
  }
};

const test = () => {
  console.log(`calling runhour method`);
  return;
};

module.exports = { test };
