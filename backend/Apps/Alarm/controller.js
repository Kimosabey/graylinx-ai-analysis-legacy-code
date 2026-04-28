const models = require("./model");
const _ = require("lodash");
const { compareAsc, format } = require("date-fns");
const service = require("../../Services/Device/device.service");
const player = require("node-wav-player");
const notifier = require("node-notifier");

const alarmLatestValue = (callback) => {
  models.alarmLatestValue((err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getAlarmData = (alData, callback) => {
  for (let key in alData) {
    console.log(key + ": " + alData[key]);
    addAhuDeviceData(key, alData[key], (err, response) => {
      console.log("qwertyui i am done");
      if (err) {
        callback(err);
      } else {
        callback(null, response);
      }
    });
  }
};

const addAhuDeviceData = (id, AhuData, callback) => {
  console.log("ahuData", Object.values(AhuData));
  console.log("ahuid", id);
  let insertData = [];
  let alarmdata = [];
  let updateAlarm = [];
  let restoredata = [];
  let count = 0;
  // let temp ={}
  if (Object.values(AhuData) && Object.values(AhuData).length > 0) {
    let count = 0;
    Object.values(AhuData).forEach((element) => {
      // console.log("neededinfo",element.param_value,element.param_id)
      let temp = getAHUAlarm(
        element.param_value,
        element.param_id,
        element.measured_time
      );
      // console.log("remp=.",temp,"elemny",element)
      alarmdata.push(temp);
      count++;
      if (count == Object.values(AhuData).length) {
        alarmdata = [].concat(...alarmdata);
        // console.log("alaram data",alarmdata)
        models.ahuAlarmInfo(id, (err1, results1) => {
          // console.log("==================>result1",results1,alarmdata)
          if (err1) {
            callback(err1);
          } else {
            if (results1.map((e) => e.acknowledged) == 1) {
              console.log("Successfully acknowledged");
            } else {
              console.log("Acknowledge to be done");
              let mypath = __dirname + "/../../Images/Buzzer.wav";
              notifier.notify(
                {
                  //  title: 'notification',
                  //  message: 'hello',
                  //  sound: true, // true | false.
                  //  time: 5000, // How long to show balloon in ms
                  //  wait: true, // Wait for User Action against Notification
                  //  type: 'info',
                },
                function(err, action) {
                  console.log("Action:", action);
                  if (action == "activate") open("http://localhost:3000");
                },
                player
                  .play({
                    path: mypath,
                  })
                  .then(() => {
                    console.log("Buzzer has started");
                  })
                  .catch((error) => {
                    console.error(error);
                  })
              );
            }
            if (results1.length > 0) {
              //if alarm are exsiting
              let alarm = [];
              re1Count = 0;
              if (alarmdata.length > 0) {
                alarmdata.forEach((alarmInfo) => {
                  let ad = results1.filter(
                    (m) => m.alarm_code == alarmInfo.alarmText["alarm_code"]
                  );
                  // console.log("ad----------",ad)
                  if (ad.length == 0) {
                    re1Count++;
                    let data = [];
                    data.push(id);
                    // data.push('201');
                    data.push(alarmInfo.alarmText["alarm_code"]);
                    data.push(alarmInfo.alarmText["message"]);
                    data.push(alarmInfo.alarmText["param_id"]);
                    data.push(
                      format(new Date(alarmInfo.time), "yyyy-MM-dd HH:mm:ss")
                    );
                    insertData.push(data);
                    // console.log("resssstrue=>",re1Count,alarmdata)
                    if (re1Count === alarmdata.length) {
                      // console.log("-----------true---------------->",updateAlarm)
                      if (insertData.length + updateAlarm.length > 0) {
                        //console.log("----------------insert",insertData)
                        // console.log("------------------update",updateAlarm)
                        //restore data
                        let countre = 0;
                        results1.forEach((res) => {
                          let r = [];
                          r = alarmdata.find(
                            (e) =>
                              e.alarmText["alarm_code"] ===
                              parseInt(res.alarm_code)
                          );
                          if (r === undefined) {
                            restoredata.push(res);
                            countre++;
                            if (countre == results1.length) {
                              models.addAhuDeviceData(
                                insertData,
                                updateAlarm,
                                restoredata,
                                (err, results) => {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    callback(null, results);
                                  }
                                }
                              );
                            }
                          } else {
                            countre++;
                            if (countre == results1.length) {
                              models.addAhuDeviceData(
                                insertData,
                                updateAlarm,
                                restoredata,
                                (err, results) => {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    callback(null, results);
                                  }
                                }
                              );
                            }
                          }
                        });
                      } else {
                        callback(null, "all alarm already exixts");
                      }
                    }
                  } else {
                    updateAlarm.push(ad[0]);
                    re1Count++;
                    // console.log("----------------insert",insertData)
                    //console.log("------------------update",updateAlarm)
                    //  console.log("ressssfalse=>",re1Count,alarmdata)
                    if (re1Count === alarmdata.length) {
                      // console.log("--------------------------->",updateAlarm)
                      if (insertData.length + updateAlarm.length > 0) {
                        let countre = 0;
                        results1.forEach((res) => {
                          let r = [];
                          r = alarmdata.find(
                            (e) =>
                              e.alarmText["alarm_code"] ===
                              parseInt(res.alarm_code)
                          );
                          if (r === undefined) {
                            restoredata.push(res);
                            countre++;
                            if (countre == results1.length) {
                              models.addAhuDeviceData(
                                insertData,
                                updateAlarm,
                                restoredata,
                                (err, results) => {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    callback(null, results);
                                  }
                                }
                              );
                            }
                          } else {
                            countre++;
                            if (countre == results1.length) {
                              models.addAhuDeviceData(
                                insertData,
                                updateAlarm,
                                restoredata,
                                (err, results) => {
                                  if (err) {
                                    callback(err);
                                  } else {
                                    callback(null, results);
                                  }
                                }
                              );
                            }
                          }
                        });
                      } else {
                        callback(null, "all alarm already exixts");
                      }
                    }
                  }
                });
              } else {
                models.restoreAll((erres, resAll) => {
                  if (erres) {
                    callback(erres);
                  } else {
                    callback(null, resAll);
                  }
                });
              }
            } else {
              let aldata = 0;
              if (alarmdata.length > 0) {
                alarmdata.forEach((element) => {
                  let data = [];
                  data.push(id);
                  // data.push('201');
                  data.push(element.alarmText["alarm_code"]);
                  data.push(element.alarmText["message"]);
                  data.push(element.alarmText["param_id"]);
                  data.push(
                    format(new Date(element.time), "yyyy-MM-dd HH:mm:ss")
                  );
                  insertData.push(data);
                  aldata++;
                  if (aldata == alarmdata.length) {
                    if (insertData.length > 0) {
                      models.addAhuDeviceData(
                        insertData,
                        updateAlarm,
                        restoredata,
                        (err, results) => {
                          if (err) {
                            callback(err);
                          } else {
                            callback(null, results);
                          }
                        }
                      );
                    } else {
                      callback(null, "no_alarm");
                    }
                  }
                });
              } else {
                console.log("update restore");
                callback(null, "no alarm");
              }
            }
          }
        });
      }
    });
    //  alarmdata = getAHUAlarm(AhuData[1].param_value);
    // console.log("alarmdata",alarmdata)
  } else {
    callback(null, "no data");
  }
  // console.log('data', insertData);
};

function getAHUAlarm(x, param_id, time) {
  console.log("-------------------", x);
  let iin = Math.floor(x),
    mybit = 1,
    myalarm,
    myresult = [];
  if (param_id == "Alarm1") {
    let alarmText = [
      {
        alarm_code: 301,
        param_id: "RAT",
        message: "Return Air Temperature Mismatch",
      },
      {
        alarm_code: 302,
        param_id: "RARH",
        message: "Return Air Relative Humidity Mismatch",
      },
      {
        alarm_code: 303,
        param_id: "SAT",
        message: "Supply Air Temperature Mismatch",
      },
      {
        alarm_code: 304,
        param_id: "SARH",
        message: "Supply Air Relative Humidity Mismatch",
      },
      {
        alarm_code: 305,
        param_id: "OAT",
        message: "Outside Air Temperature Mismatch",
      },
      {
        alarm_code: 306,
        param_id: "MAT",
        message: "Mixed Air Temperature Mismatch",
      },
      {
        alarm_code: 307,
        param_id: "CHW_Vlv_Pos",
        message: "Chilled Water Valve-Position Mismatch",
      },
      {
        alarm_code: 308,
        param_id: "OA_Dmpr_Pos",
        message: "Outside Air Damper-Position Mismatch",
      },
      {
        alarm_code: 309,
        param_id: "RA_Dmpr_Pos",
        message: "Return Air Damper Position Mismatch",
      },
      {
        alarm_code: 310,
        param_id: "EA_Dmpr_Pos",
        message: "Exhaust Air Damper-Position Mismatch",
      },
      {
        alarm_code: 311,
        param_id: "SA_Dmpr_Pos",
        message: "Supply Air Damper Position Mismatch",
      },
      {
        alarm_code: 312,
        param_id: "DSP",
        message: "Duct Static Pressure Mismatch",
      },
      {
        alarm_code: 313,
        param_id: "DPS_Filter",
        message: "DPS across Filter Mismatch",
      },
      {
        alarm_code: 314,
        param_id: "SAF_VFD_AM",
        message: "Supply Air Fan VFD-Auto/Manual-Command Mismatch",
      },
      {
        alarm_code: 315,
        param_id: "SAF_VFD_Trip_SS",
        message: "Supply Air Fan VFD-Trip Status Mismatch",
      },
      {
        alarm_code: 316,
        param_id: "SAF_VFD_Speed",
        message: "Supply Air Fan VFD-Speed-Command Mismatch",
      },
    ];
    for (let i = 0; i < alarmText.length; i++) {
      myalarm = iin & mybit;
      if (myalarm === 0) {
        myalarm = `No Alarm at ${i}`;
      } else {
        myalarm = alarmText[i];
        myresult.push({ bit: i, alarmText: alarmText[i], time: time });
      }
      console.log(`Alarm Result: ${iin} ${i} ===> ${myalarm} == ${mybit}`);
      mybit = mybit << 1;
    }
  } else {
    let alarmText = [
      {
        alarm_code: 317,
        param_id: "VFD_SS",
        message:
          'VFD status - (Fan motor through VFD ? Direct "bypass" ?) Mismatch',
      },
      { alarm_code: 318, param_id: "Fire_Sensor", message: "Fire_Sensor" },
      {
        alarm_code: 319,
        param_id: "RAQ_CO2",
        message: "Return Air Quality-CO2 Mismatch",
      },
      {
        alarm_code: 320,
        param_id: "DPS_SAF_SS",
        message: "DPS across Supply Air Fan - Status (DPS across SAF) Mismatch",
      },
      {
        alarm_code: 321,
        param_id: "RAF_SS",
        message: "Return Air Fan - Status (DP Switch across RAF) Mismatch",
      },
    ];
    for (let i = 0; i < alarmText.length; i++) {
      myalarm = iin & mybit;
      if (myalarm === 0) {
        myalarm = `No Alarm at ${i}`;
      } else {
        myalarm = alarmText[i];
        myresult.push({ bit: i, alarmText: alarmText[i], time: time });
      }
      console.log(`Alarm Result: ${iin} ${i} ===> ${myalarm} == ${mybit}`);
      mybit = mybit << 1;
    }
  }
  console.log("Alarms:\n", myresult);
  return myresult;
}

module.exports = {
  addAhuDeviceData,
  alarmLatestValue,
  getAlarmData,
};
