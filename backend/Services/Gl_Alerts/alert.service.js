const { each } = require("bluebird");
const { notes } = require("joi");
const _ = require("lodash");
const { sys } = require("ping");
const { Console } = require("winston/lib/winston/transports");
const model = require("./alert.model");
const player = require("node-wav-player");
const notifier = require("node-notifier");

const open = require("open");

// var player = require('play-sound')(opts = {})
let syscount = {};

const alerts = (buildingId, callback) => {
  model.deviceAlerts(buildingId, (err1, alert) => {
    if (err1) {
      callback(err1);
    } else {
      model.deviceBatteryAlerts(buildingId, (err2, results) => {
        if (err2) {
          callback(err2);
        } else {
          model.gatewayAlerts((err3, response) => {
            if (err3) {
              callback(err3);
            } else {
              model.overOccupancyAlerts(
                buildingId,
                (err3, overOccupiedSlots) => {
                  if (err3) {
                    callback(err3);
                  } else {
                    const deviceAlerts = alert.map(
                      (_alert) =>
                        (_alert.priority = _alert.device_type.includes(
                          "controller"
                        )
                          ? "Medium"
                          : "Low")
                    );
                    const batteryStatus = results
                      .filter(
                        (each) =>
                          each.device_type === "thl_sensor" ||
                          each.device_type === "occupancy_sensor" ||
                          each.device_type == "parking_sensor"
                      )
                      .filter((each) => {
                        let battery = null;
                        try {
                          battery = JSON.parse(each.data).battery;
                        } catch (error) {}
                        return battery < 30 && battery !== null;
                        // if (battery < 30 && battery !== null) {
                        //   return true;
                        // } else {
                        //   return false;
                        // }
                      })
                      .map((each) => ({
                        device_name: each.device_name,
                        device_type: each.device_type,
                        zone_name: each.zone_name,
                        floor_name: each.floor_name,
                        building_name: each.building_name,
                        device_address: each.device_address,
                        created_at: each.created_at,
                        priority: "Low",
                        battery: JSON.parse(each.data).battery,
                      }));
                    const totalCount =
                      deviceAlerts.length + batteryStatus.length;
                    if (response.length > 0) {
                      response.forEach((host) => {
                        if (host.status === 0) {
                          alert.push({
                            device_name: host.device_name,
                            zone_name: host.zone_name ? host.zone_name : "-",
                            floor_name: host.floor_name ? host.floor_name : "-",
                            building_name: host.building_name
                              ? host.building_name
                              : "-",
                            status: host.status,
                            priority: "High",
                            color: "red",
                            device_type: "Gateway",
                          });
                        }
                      });
                    }
                    if (overOccupiedSlots.length > 0) {
                      let matching_results = results.filter((obj1) =>
                        overOccupiedSlots.some(
                          (obj2) => obj1.device_address == obj2.device_mac
                        )
                      );
                      matching_results.forEach((each) => {
                        alert.push({
                          device_name: each.device_name,
                          device_type: each.device_type,
                          zone_name: each.zone_name,
                          floor_name: each.floor_name,
                          building_name: each.building_name,
                          device_address: each.device_address,
                          created_at: each.created_at,
                          priority: "Very high",
                          battery: each.data
                            ? JSON.parse(each.data).battery
                            : null,
                        });
                      });
                      // results.filter(
                      //   each =>each.device_type == 'parking_sensor'
                      // ).filter(each => {
                      //   // console.log(each.device_address);
                      //   // console.log(overOccupiedSlots[0].device_mac);

                      //   // const sear = _.find(overOccupiedSlots, ['device_mac', each.device_address]);
                      //   // console.log(sear)
                      //   alert.push({
                      //     device_name: each.device_name,
                      //     device_type: each.device_type,
                      //     zone_name: each.zone_name,
                      //     floor_name: each.floor_name,
                      //     building_name: each.building_name,
                      //     device_address: each.device_address,
                      //     created_at: each.created_at,
                      //     priority: "Very high",
                      //     battery: each.data ? JSON.parse(each.data).battery : null
                      //   })
                      // })
                    }

                    setTimeout(() => {
                      callback(null, {
                        total_count: totalCount,
                        alerts: alert,
                        batteryStatus,
                      });
                    }, 1000);
                  }
                }
              );
            }
          });
        }
      });
    }
  });
};

const alertsTemp = (buildingId, callback) => {
  model.deviceAlertsTemp(buildingId, (err1, alert) => {
    if (err1) {
      callback(err1);
    } else {
      model.deviceBatteryAlerts(buildingId, (err2, results) => {
        if (err2) {
          callback(err2);
        } else {
          model.gatewayAlerts((err3, response) => {
            if (err3) {
              callback(err3);
            } else {
              model.overOccupancyAlerts(
                buildingId,
                (err3, overOccupiedSlots) => {
                  if (err3) {
                    callback(err3);
                  } else {
                    model.getConfigurationDetails((err4, configuration) => {
                      if (err4) {
                        callback(err4);
                      } else {
                        const deviceAlerts = alert.map((_alert) => {
                          _alert.priority = _alert.device_type.includes(
                            "controller"
                          )
                            ? "Medium"
                            : "Low";
                          let tag,
                            message = null;
                          if (_alert.created_at) {
                            let created_at = _alert.created_at;
                            let now = new Date();
                            days = Math.floor(
                              (now.getTime() - new Date(created_at).getTime()) /
                                (1000 * 3600 * 24)
                            );
                            if (days >= 1) {
                              tag = "Network Loss";
                              message =
                                "Device hasn't communicated since" +
                                "\n\t\t\t  " +
                                days +
                                " days";
                              _alert.color = "default";
                            } else {
                              hours = Math.floor(
                                (now.getTime() -
                                  new Date(created_at).getTime()) /
                                  36e5
                              );
                              tag = "Network Loss";
                              message =
                                "Device hasn't communicated since " +
                                "\n\t\t\t  " +
                                hours +
                                " hours";
                              _alert.color = "default";
                            }
                          } else {
                            tag = "Faulty Device";
                            message = "Device hasn't communicated yet";
                            _alert.color = "primary";
                          }
                          _alert.tag = tag;
                          _alert.message = message;
                        });

                        const batteryStatus = results
                          .filter(
                            (each) =>
                              each.device_type === "thl_sensor" ||
                              each.device_type === "occupancy_sensor" ||
                              each.device_type == "parking_sensor"
                          )
                          .filter((each) => {
                            let battery = null;
                            try {
                              battery = JSON.parse(each.data).battery;
                            } catch (error) {}
                            return battery < 30 && battery !== null;
                            // if (battery < 30 && battery !== null) {
                            //   return true;
                            // } else {
                            //   return false;
                            // }
                          })
                          .map((each) => ({
                            device_name: each.device_name,
                            device_type: each.device_type,
                            zone_name: each.zone_name,
                            floor_name: each.floor_name,
                            building_name: each.building_name,
                            device_address: each.device_address,
                            created_at: each.created_at,
                            priority: "Low",
                            color: "defult",
                            tag: "Battery Status",
                            message: "  Low Battery",
                            battery: JSON.parse(each.data).battery,
                          }));
                        const totalCount =
                          deviceAlerts.length + batteryStatus.length;
                        alert
                          .filter((each) => each.device_type == "thl_sensor")
                          .forEach((each) => {
                            let data = each.data ? JSON.parse(each.data) : null;
                            if (data) {
                              if (
                                data.temperature.value >
                                  JSON.parse(configuration[0].temperature)
                                    .max ||
                                data.temperature.value <
                                  JSON.parse(configuration[0].temperature).min
                              ) {
                                alert.push({
                                  device_name: each.device_name,
                                  device_type: each.device_type,
                                  zone_name: each.zone_name,
                                  floor_name: each.floor_name,
                                  building_name: each.building_name,
                                  device_address: each.device_address,
                                  created_at: each.created_at,
                                  tag: "Limit crossed",
                                  priority: "High",
                                  color: "secondary",
                                  message:
                                    "Temperature Limit crossed with" +
                                    "\n\t\t\t" +
                                    "  value " +
                                    data.temperature.value +
                                    "°C",
                                  battery: each.data
                                    ? JSON.parse(each.data).battery
                                    : null,
                                });
                              }
                              if (
                                data.humidity.value >
                                  JSON.parse(configuration[0].humidity).max ||
                                data.humidity.value <
                                  JSON.parse(configuration[0].humidity).min
                              ) {
                                alert.push({
                                  device_name: each.device_name,
                                  device_type: each.device_type,
                                  zone_name: each.zone_name,
                                  floor_name: each.floor_name,
                                  building_name: each.building_name,
                                  device_address: each.device_address,
                                  created_at: each.created_at,
                                  tag: "Limit crossed",
                                  priority: "High",
                                  color: "secondary",
                                  message:
                                    "Humidity Limit crossed with \n\t\t\t " +
                                    "  value " +
                                    data.humidity.value,
                                  battery: each.data
                                    ? JSON.parse(each.data).battery
                                    : null,
                                });
                              }
                              if (
                                data.luminousity.value >
                                  JSON.parse(configuration[0].lux).max ||
                                data.lux.value <
                                  JSON.parse(configuration[0].lux).min
                              ) {
                                alert.push({
                                  device_name: each.device_name,
                                  device_type: each.device_type,
                                  zone_name: each.zone_name,
                                  floor_name: each.floor_name,
                                  building_name: each.building_name,
                                  device_address: each.device_address,
                                  created_at: each.created_at,
                                  tag: "Limit crossed",
                                  priority: "High",
                                  color: "secondary",
                                  message:
                                    "Luminousity Limit crossed with \n\t\t\t" +
                                    "  value " +
                                    data.luminousity.value,
                                  battery: each.data
                                    ? JSON.parse(each.data).battery
                                    : null,
                                });
                              }
                            }
                          });
                        if (response.length > 0) {
                          response.forEach((host) => {
                            if (host.status === 0) {
                              alert.push({
                                device_name: host.device_name,
                                zone_name: host.zone_name
                                  ? host.zone_name
                                  : "-",
                                floor_name: host.floor_name
                                  ? host.floor_name
                                  : "-",
                                building_name: host.building_name
                                  ? host.building_name
                                  : "-",
                                status: host.status,
                                tag: "Gateway Error",
                                priority: "High",
                                color: "primary",
                                message: "Gateway Not In Network",
                                device_type: "Gateway",
                              });
                            }
                          });
                        }
                        if (overOccupiedSlots.length > 0) {
                          let matching_results = results.filter((obj1) =>
                            overOccupiedSlots.some(
                              (obj2) => obj1.device_address == obj2.device_mac
                            )
                          );
                          matching_results.forEach((each) => {
                            alert.push({
                              device_name: each.device_name,
                              device_type: each.device_type,
                              zone_name: each.zone_name,
                              floor_name: each.floor_name,
                              building_name: each.building_name,
                              device_address: each.device_address,
                              created_at: each.created_at,
                              priority: "High",
                              color: "secondary",
                              tag: "Over Parked",
                              message:
                                "Vehicle at this slot is parked for " +
                                "\n\t\t\t" +
                                "  more than " +
                                JSON.parse(configuration[0].overparked)
                                  .overParked +
                                " hours",
                              battery: each.data
                                ? JSON.parse(each.data).battery
                                : null,
                            });
                          });
                        }
                        setTimeout(() => {
                          callback(null, {
                            total_count: totalCount,
                            alerts: alert,
                            batteryStatus,
                          });
                        }, 1000);
                      }
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  });
};

const hideMulitpleEvents = (body, callback) => {
  model.hideMulitpleEvents(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const groupBYId = (data) => {
  console.log("CAME TO GROUP", data);

  const processD = data.reduce((acc, item) => {
    // Initialize the object if the id doesn't exist

    if (!acc[item.floorId]) {
      acc[item.floorId] = {
        total_alarms: 0,
        critical: 0,
        nonCritical: 0,
      };
    }

    // Group the alarms by Id
    if (item.acknowledged != 1) {
      acc[item.floorId].total_alarms++;
      // acc[item.Id].alarms.push(item);

      // Classify and count based on alarm_code
      const alarmCode = parseInt(item.alarm_code, 10);
      if (alarmCode >= 100 && alarmCode <= 299) {
        acc[item.floorId].critical++;
      } else if (alarmCode >= 300) {
        acc[item.floorId].nonCritical++;
      }
    }

    return acc;
  }, {});

  return processD;
};

const alertsByZone = (zoneId, callback) => {
  model.alertsByZone(zoneId, (error, results) => {
    if (error) {
      callback(error);
    } else {
      let response = [];
      //   {
      //     "device_name": "senzopt_dev112",
      //     "zone_name": "Firmware-Area",
      //     "floor_name": "Floor-1",
      //     "building_name": "Moksha_mansion",
      //     "device_address": "5003015000000002",
      //     "created_at": null,
      //     "data": null,
      //     "device_type": "thl_sensor",
      //     "priority": "Low",
      //     "color": "#FFA500",
      //     "background": "#FFA500",
      //     "tag": "Faulty Device",
      //     "message": "Device hasn't communicated yet"
      // },
      // zoneId: '0011fc20-64b0-4dac-b3d6-317aa8b2b6f2',
      // zoneName: 'AHU_room',
      // zoneType: 'GL_LOCATION_TYPE_ROOM',
      // ss_id: '01f8d696-5abc-4ba1-a3be-415bedaed456',
      // ss_name: 'AHU_WS',
      //ss_address: '192.168.0.99',
      // alarm_code: '005',
      // message: 'SUPPLY_AIR_TEMPERATURE_IS_HIGH',
      // acknowledged: 0,
      // created_at: '2022-07-07 11:09:26'
      let countRes = 0;
      if (results.length > 0) {
        results.forEach((Element) => {
          model.getLocation(Element.zoneId, (error1, results1) => {
            if (error1) {
              callback(error1);
            } else {
              let temp = {};
              temp["alarmId"] = Element.alarmId;
              temp["device_id"] = Element.ss_id;
              temp["device_name"] = Element.ss_name;
              temp["message"] = Element.message;
              temp["created_at"] = Element.created_at;
              temp["device_Address"] = Element.ss_address;
              temp["alarm_code"] = Element.alarm_code;
              temp["acknowledged"] = Element.acknowledged;
              temp["Alarm_Id"] = Element.Alarm_Id;
              temp["Category"] = Element.Category;
              temp["Device_name"] = Element.Device_name;
              temp["Parameter"] = Element.Parameter;
              temp["Alarm Code"] = Element["Alarm Code"];
              temp["Measured_time"] = Element.Measured_time;
              temp["param id"] = Element["param id"];
              temp["param value"] = Element["param value"];
              temp["Description"] = Element.Description;
              temp["Restore"] = Element.Restore;
              temp["Ignore"] = Element.Ignore;
              temp["Possible_causes"] = JSON.parse(Element.possible_causes);
              let countres1 = 0;
              results1.forEach((ele) => {
                switch (ele.zone_type) {
                  case "GL_LOCATION_TYPE_ROOM":
                    temp["area"] = ele.zone_name;
                    temp["areaId"] = ele.id;
                    break;
                  case "GL_LOCATION_TYPE_ZONE":
                    temp["zone"] = ele.zone_name;
                    temp["zoneId"] = ele.id;
                    break;
                  case "GL_LOCATION_TYPE_FLOOR":
                    temp["floor"] = ele.zone_name;
                    temp["floorId"] = ele.id;
                    break;
                  case "GL_LOCATION_TYPE_BUILDING":
                    temp["building"] = ele.zone_name;
                    temp["buildingId"] = ele.id;
                    break;
                  default:
                    // console.log("do nothing=====")
                    break;
                }
                countres1++;
                if (countres1 === results1.length) {
                  //console.log("=============================",temp)
                  response.push(temp);
                  countRes++;
                  if (countRes === results.length) {
                    let syscount1 = {};
                    //console.log("this is response===========sa",response)
                    let system = response.filter(
                      (e) =>
                        parseInt(e.alarm_code) > 100 &&
                        parseInt(e.alarm_code) < 299
                    );
                    let Solution = response.filter(
                      (e) => parseInt(e.alarm_code) > 300
                    );
                    let alert = {};
                    alert["systemCount"] = system.filter(
                      (e) => parseInt(e.acknowledged) == 0
                    ).length;
                    alert["solutionCount"] = Solution.filter(
                      (e) => parseInt(e.acknowledged) == 0
                    ).length;
                    alert["system"] = system.sort((item1, item2) => {
                      if (item1.alarmId < item2.alarmId) return -1; // Sort item1 before item2
                      if (item1.alarmId > item2.alarmId) return 1; // Sort item1 after item2
                      return 0; // Keep original order if Ids are equal
                    });
                    // alert["system"]=system
                    alert["solution"] = Solution;
                    console.log("alerts refactoring", groupBYId(response));
                    alert["locationWise"] = groupBYId(response);
                    syscount1["systemCount"] = alert["systemCount"];
                    // console.log("systemCountbfr===",syscount.systemCount)
                    // console.log("systemCountbfr",syscount)
                    // console.log("",system.map(e=>e.acknowledged))
                    if (system.map((e) => e.acknowledged) == 1) {
                      //console.log("Everything acknowledged")
                    } else {
                      let mypath = __dirname + "/../../Images/Buzzer.wav";
                      console.log("mypath", mypath);
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
                          if (action == "activate")
                            open("http://localhost:3000");
                        },
                        player
                          .play({
                            path: mypath,
                          })
                          .then(() => {
                            console.log("Buzzer has started.");
                          })
                          .catch((error) => {
                            // console.error(error);
                          })
                      );
                    }
                    syscount.systemCount = syscount1;
                    callback(null, alert);
                  }
                }
              });
            }
          });
        });
      } else {
        let alert = {};
        alert["systemCount"] = 0;
        alert["solutionCount"] = 0;
        alert["system"] = [];
        alert["solution"] = [];
        callback(null, alert);
      }
    }
  });
};

const alertsByDevice = (deviceId, callback) => {
  model.alertsByDevice(deviceId, (error, results) => {
    if (error) {
      callback(error);
    } else {
      let response = [];
      //   {
      //     "device_name": "senzopt_dev112",
      //     "zone_name": "Firmware-Area",
      //     "floor_name": "Floor-1",
      //     "building_name": "Moksha_mansion",
      //     "device_address": "5003015000000002",
      //     "created_at": null,
      //     "data": null,
      //     "device_type": "thl_sensor",
      //     "priority": "Low",
      //     "color": "#FFA500",
      //     "background": "#FFA500",
      //     "tag": "Faulty Device",
      //     "message": "Device hasn't communicated yet"
      // },
      // zoneId: '0011fc20-64b0-4dac-b3d6-317aa8b2b6f2',
      // zoneName: 'AHU_room',
      // zoneType: 'GL_LOCATION_TYPE_ROOM',
      // ss_id: '01f8d696-5abc-4ba1-a3be-415bedaed456',
      // ss_name: 'AHU_WS',
      //ss_address: '192.168.0.99',
      // alarm_code: '005',
      // message: 'SUPPLY_AIR_TEMPERATURE_IS_HIGH',
      // acknowledged: 0,
      // created_at: '2022-07-07 11:09:26'
      let countRes = 0;
      if (results.length > 0) {
        results.forEach((Element) => {
          model.getDevice(Element.zoneId, (error1, results1) => {
            if (error1) {
              callback(error1);
            } else {
              let temp = {};
              temp["device_name"] = Element.ss_name;
              temp["message"] = Element.message;
              temp["created_at"] = Element.created_at;
              temp["device_Address"] = Element.ss_address;
              temp["alarm_code"] = Element.alarm_code;
              temp["acknowledged"] = Element.acknowledged;
              temp["Alarm_Id"] = Element.Alarm_Id;
              temp["Category"] = Element.Category;
              temp["Device_name"] = Element.Device_name;
              temp["Parameter"] = Element.Parameter;
              temp["Alarm Code"] = Element["Alarm Code"];
              temp["Measured_time"] = Element.Measured_time;
              temp["param id"] = Element["param id"];
              temp["param value"] = Element["param value"];
              temp["Description"] = Element.Description;
              temp["Acknowledged"] = Element.Acknowledged;
              temp["Restore"] = Element.Restore;
              temp["Ignore"] = Element.Ignore;
              let countres1 = 0;
              results1.forEach((ele) => {
                switch (ele.zone_type) {
                  case "gl_location_TYPE_ROOM":
                    temp["area"] = ele.zone_name;
                    temp["areaId"] = ele.id;
                    break;
                  case "gl_location_TYPE_ZONE":
                    temp["zone"] = ele.zone_name;
                    temp["deviceId"] = ele.id;
                    break;
                  case "gl_location_TYPE_FLOOR":
                    temp["floor"] = ele.zone_name;
                    temp["floorId"] = ele.id;
                    break;
                  case "gl_location_TYPE_BUILDING":
                    temp["building"] = ele.zone_name;
                    temp["buildingId"] = ele.id;
                    break;
                  default:
                    // console.log("do nothing=====")
                    break;
                }
                countres1++;
                if (countres1 === results1.length) {
                  //console.log("=============================",temp)
                  response.push(temp);
                  countRes++;
                  if (countRes === results.length) {
                    let syscount1 = {};
                    //console.log("this is response===========sa",response)
                    let system = response.filter(
                      (e) =>
                        parseInt(e.alarm_code) > 100 &&
                        parseInt(e.alarm_code) < 299
                    );
                    let Solution = response.filter(
                      (e) => parseInt(e.alarm_code) > 300
                    );
                    let alert = {};
                    alert["systemCount"] = system.filter(
                      (e) => parseInt(e.acknowledged) == 0
                    ).length;
                    alert["solutionCount"] = Solution.filter(
                      (e) => parseInt(e.acknowledged) == 0
                    ).length;
                    alert["system"] = system;
                    alert["solution"] = Solution;
                    syscount1["systemCount"] = alert["systemCount"];
                    // console.log("systemCountbfr===",syscount.systemCount)
                    // console.log("systemCountbfr",syscount)
                    // console.log("",system.map(e=>e.acknowledged))
                    if (system.map((e) => e.acknowledged) == 1) {
                      //console.log("Everything acknowledged")
                    } else {
                      let mypath = __dirname + "/../../Images/Buzzer.wav";
                      console.log("mypath", mypath);
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
                          if (action == "activate")
                            open("http://localhost:3000");
                        },
                        player
                          .play({
                            path: mypath,
                          })
                          .then(() => {
                            console.log("Buzzer has started.");
                          })
                          .catch((error) => {
                            // console.error(error);
                          })
                      );
                    }
                    syscount.systemCount = syscount1;
                    callback(null, alert);
                  }
                }
              });
            }
          });
        });
      } else {
        let alert = {};
        alert["systemCount"] = 0;
        alert["solutionCount"] = 0;
        alert["system"] = [];
        alert["solution"] = [];
        callback(null, alert);
      }
    }
  });
};

const deleteAlarm = (body, callback) => {
  model.deleteAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const acknowledgeAlarm = (body, callback) => {
  model.acknowledgeAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const restoreAlarm = (body, callback) => {
  model.restoreAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const insertSelectedAlarm = (body, callback) => {
  model.insertSelectedAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const insertSelectedChillerAlarm = (body, callback) => {
  model.insertSelectedChillerAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const insertIntoGlAlarm = (body, callback) => {
  model.insertIntoGlAlarm(body, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};
module.exports = {
  alerts,
  alertsTemp,
  hideMulitpleEvents,
  alertsByZone,
  deleteAlarm,
  acknowledgeAlarm,
  restoreAlarm,
  alertsByDevice,
  insertSelectedAlarm,
  insertSelectedChillerAlarm,
  insertIntoGlAlarm,
};
