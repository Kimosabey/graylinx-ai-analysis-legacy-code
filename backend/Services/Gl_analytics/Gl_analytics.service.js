const { response } = require("express");
const { boolean, string } = require("joi");
const { forEach, result, toUpper, eachRight, slice } = require("lodash");
const _ = require("lodash");
const uuid = require("uuid/v4");
const { error } = require("winston");
const model = require("./Gl_analytics.model");
const { toFixed } = require("../../Utils/common");
const dataloader = require("../../Apps/dataLoader/dataLoader");
const get_Table_name = require("../Device/myIBMSPreparation");
const { promise } = require("ping");
const { resolve } = require("bluebird");
const {
  getCPMSnapshotHandler,
} = require("../../CPM_modular/Notification_Handler");

const { getTablePrefix, toPercentage } = require("../../Utils/tableName");
const { cfg: glCfg } = require("../Gl_reports1/core/DeviceRegistry");
const analyticsConfig = require("../Energy_analytics/Analytics_reports.config");

function groupBySsTypeAverage(data) {
  const grouped = {};

  data.forEach((item) => {
    if (!grouped[item.ss_type]) {
      grouped[item.ss_type] = {
        ss_type: item.ss_type,
        total_health: 0,
        count: 0,
      };
    }

    grouped[item.ss_type].total_health += item.asset_health;
    grouped[item.ss_type].count += 1;
  });

  return Object.values(grouped).map((g) => ({
    ss_type: g.ss_type,
    // plant_run_hours : plant_run_hours,
    asset_health: g.count > 0 ? g.total_health / g.count : 0,
  }));
}

const DEVICE_TO_SS_TYPE = {
  CHILLER: ["NONGL_SS_CHILLER"],
  PRIMARY_PUMP: ["NONGL_SS_PRIMARY_PUMP"],
  PRIMARY_VARIABLE_PUMP: ["NONGL_SS_PRIMARY_PUMP"],
  CONDENSER_PUMP: ["NONGL_SS_CONDENSER_PUMPS"],
  COOLING_TOWER: ["NONGL_SS_COOLING_TOWER"],
  SECONDARY_PUMP: ["NONGL_SS_SECONDARY_PUMPS"],
};

const getchild = (id, callback) => {
  model.getchild(id, (error, result) => {
    if (error) {
      callback(error);
    } else {
      let i = 0;
      result.forEach((element) => {
        getSubsystemId(element.id, (error, result1) => {
          if (error) {
            callback(error);
          } else {
            element["parameter"] = result1;
            i++;
            if (result.length == i) {
              callback(null, result);
            }
          }
        });
      });
    }
  });
};

const getSubsystemId = (id, callback) => {
  const temp = [];
  const hum = [];
  const lux = [];
  const noi = [];
  const co2 = [];
  const tvoc = [];
  const pm10 = [];
  const pm2_5 = [];
  const rat = [];
  const response = [];
  const tempobj = { name: "TEMPERATURE" };
  const luxobj = { name: "HUMIDITY" };
  const humobj = { name: "LUMINOUSITY" };
  const noiobj = { name: "NOISE" };
  const co2obj = { name: "CO2" };
  const tvocobj = { name: "TVOC" };
  const pm2_5obj = { name: "PM2.5" };
  const pm10obj = { name: "PM10" };
  const ratobj = { name: "RAT" };
  model.getGlZoneId(id, (error, results) => {
    if (error) {
      callback(error);
    } else {
      model.getGlThlZoneId((error, results1) => {
        if (error) {
          callback(error);
        } else {
          results1.forEach((element) => {
            results.forEach((res) => {
              if (element.gl_zone_id === res.id) {
                if (
                  element.parameter === "luminousity" &&
                  element.subsystem_type != "AQS_SENSOR"
                ) {
                  lux.push(element.param_value);
                } else if (
                  element.parameter === "temperature" &&
                  element.subsystem_type != "AQS_SENSOR"
                ) {
                  temp.push(element.param_value);
                } else if (
                  element.parameter === "humidity" &&
                  element.subsystem_type != "AQS_SENSOR"
                ) {
                  hum.push(element.param_value);
                } else if (element.parameter == "NOISE") {
                  noi.push(element.param_value);
                } else if (element.parameter == "CO2") {
                  co2.push(element.param_value);
                } else if (element.parameter == "TVOC") {
                  tvoc.push(element.param_value);
                } else if (element.parameter == "PM10") {
                  pm10.push(element.param_value);
                } else if (element.parameter == "PM2.5") {
                  pm2_5.push(element.param_value);
                } else if (element.parameter == "ahu_in_air_temperature") {
                  rat.push(element.param_value);
                }
              }
            });
          });
          tempobj["value"] = temp.length
            ? temp.reduce((a, b) => parseInt(a) + parseInt(b), 0) / temp.length
            : "no Data";
          luxobj["value"] =
            lux.length >= 1
              ? lux.reduce((a, b) => parseInt(a) + parseInt(b), 0) / lux.length
              : "no Data";
          humobj["value"] =
            hum.length >= 1
              ? hum.reduce((a, b) => parseInt(a) + parseInt(b), 0) / hum.length
              : "no Data";
          co2obj["value"] =
            co2.length >= 1
              ? co2.reduce((a, b) => parseInt(a) + parseInt(b), 0) / co2.length
              : "no Data";
          tvocobj["value"] =
            tvoc.length >= 1
              ? tvoc.reduce((a, b) => parseInt(a) + parseInt(b), 0) /
                tvoc.length
              : "no Data";
          noiobj["value"] =
            noi.length >= 1
              ? noi.reduce((a, b) => parseInt(a) + parseInt(b), 0) / noi.length
              : "no Data";
          pm2_5obj["value"] =
            pm2_5.length >= 1
              ? pm2_5.reduce((a, b) => parseInt(a) + parseInt(b), 0) /
                pm2_5.length
              : "no Data";
          pm10obj["value"] =
            pm10.length >= 1
              ? pm10.reduce((a, b) => parseInt(a) + parseInt(b), 0) /
                pm10.length
              : "no Data";
          ratobj["value"] =
            rat.length >= 1
              ? rat.reduce((a, b) => parseInt(a) + parseInt(b), 0) / rat.length
              : "no Data";
          response.push(tempobj);
          response.push(humobj);
          response.push(luxobj);
          response.push(tvocobj);
          response.push(co2obj);
          response.push(pm10obj);
          response.push(pm2_5obj);
          response.push(noiobj);
          response.push(ratobj);
          // const res=response.filter((ele)=>{return ele.value!= 0})
          callback(null, response);
        }
      });
    }
  });
};

const handleColor = (num, mapSubType) => {
  // console.log(num)
  // console.log(mapSubType)
  switch (toUpper(mapSubType)) {
    case "TEMPERATURE":
      if (num > 23) {
        return "#EB0F2C";
      } else if (num >= 18) {
        return "#33cc33";
      } else if (num < 18) {
        return "#1a53ff";
      }

      break;
    case "HUMIDITY":
      if (num > 61) {
        return "#ffff00";
      } else if (num >= 40) {
        return "#00ff00";
      } else if (num >= 6) {
        return "#ffff00";
      } else if (num < 5) {
        return "#ff0000";
      }

      break;
    case "LUMINOUSITY":
      if (num > 40) {
        return "#EB0F2C";
      } else if (num >= 25) {
        return "#ffff00";
      } else if (num >= 18) {
        return "#1a53ff";
      } else if (num < 18) {
        return "#002699";
      }
      break;
    case "CO2":
      if (num > 2000) {
        return "#EB0F2C";
      } else if (num >= 1000) {
        return "#ffff00";
      } else if (num < 1000) {
        return "#33cc33";
      }
      break;
    case "TVOC":
      if (num > 81) {
        return "#EB0F2C";
      } else if (num >= 41) {
        return "#ffff00";
      } else if (num < 40) {
        return "#33cc33";
      }
      break;
    case "NOISE":
      if (num > 65) {
        return "#EB0F2C";
      } else if (num >= 41) {
        return "#ffff00";
      } else if (num < 40) {
        return "#33cc33";
      }
      break;
    case "PM2.5":
      if (num > 65) {
        return "#EB0F2C";
      } else if (num >= 41) {
        return "#ffff00";
      } else if (num < 40) {
        return "#33cc33";
      }
      break;
    case "PM10":
      if (num > 65) {
        return "#EB0F2C";
      } else if (num >= 41) {
        return "#ffff00";
      } else if (num < 40) {
        return "#33cc33";
      }
      break;
  }
};

const getchildxmap = (id, param, callback) => {
  model.getchild(id, (error, result) => {
    if (error) {
      callback(error);
    } else {
      let i = 0;
      let resp = [];
      if (result.length > 0) {
        result.forEach((element) => {
          getxmapdatazoneidtest(element.id, param, (error, result1) => {
            let temp = result1.map((ele) => parseFloat(ele.param_value));
            var value = temp.reduce((a, b) => a + b, 0) / temp.length;
            var color = handleColor(value, param);
            if (error) {
              callback(error);
            } else {
              if (result1.length > 0) {
                let payload = {};
                payload["id"] = element.id;
                payload["name"] = element.name;
                payload["zone_shape"] = element.zone_shape;
                payload["coordinates"] = element.coordinates;
                payload["color"] = color;
                payload["value"] = value;
                payload["devices"] = result1;
                resp.push(payload);
              }
              i++;
              if (result.length == i) {
                callback(null, resp);
              }
            }
          });
        });
      } else {
        model.getArea(id, (error, res) => {
          if (error) {
            callback(error);
          } else {
            console.log("resssssssssssss", res);
            res.forEach((element) => {
              getxmapdatazoneidtest(id, param, (error, result1) => {
                let temp = result1.map((ele) => parseFloat(ele.param_value));
                var value = temp.reduce((a, b) => a + b, 0) / temp.length;
                var color = handleColor(value, param);
                if (error) {
                  callback(error);
                } else {
                  if (result1.length > 0) {
                    let payload = {};
                    payload["id"] = element.id;
                    payload["name"] = element.name;
                    payload["zone_shape"] = element.zone_shape;
                    payload["coordinates"] = element.coordinates;
                    payload["color"] = color;
                    payload["value"] = value;
                    payload["devices"] = result1;
                    resp.push(payload);
                  }
                  i++;
                  if (res.length == i) {
                    callback(null, resp);
                  }
                }
              });
            });
          }
        });
      }
    }
  });
};

const getxmapdatazoneidtest = (id, param, callback) => {
  model.getxmapzones(id, (error, results) => {
    if (error) {
      callback(error);
    } else {
      let zone = 0;
      let devices = [];
      results.forEach((each) => {
        model.getdevicebyzoneid(each.id, (error, results1) => {
          if (error) {
            callback(error);
          } else {
            if (results1.length > 0) {
              let index = 0;
              results1.forEach((element) => {
                let dev_payload = {};
                if (
                  toUpper(param) === "DAMPER_POSITION" &&
                  (toUpper(element.name) === "DAMPER_POSITION" ||
                    toUpper(element.name) === "VAV_VOLUME_PERCENT" ||
                    toUpper(element.name) === "SUPPLY_AIR_FLOW" ||
                    toUpper(element.name) === "TEMPERATURE")
                ) {
                  dev_payload["ssid"] = element.ssid;
                  dev_payload["ss_name"] = element.ss_name;
                  dev_payload["ss_type"] = element.ss_type;
                  dev_payload["coordinates"] = element.coordinates;
                  dev_payload["name"] = element.name;
                  dev_payload["param_value"] = toFixed(
                    parseFloat(element.param_value),
                    2,
                  );
                  dev_payload["color"] = handleColor(
                    element.param_value,
                    param,
                  );
                  devices.push(dev_payload);
                  // devices.push(element)
                  index++;
                  if (index == results1.length) {
                    zone++;
                    if (zone == results.length) {
                      callback(null, devices);
                    }
                  }
                } else if (toUpper(element.name) === param) {
                  dev_payload["ssid"] = element.ssid;
                  dev_payload["ss_name"] = element.ss_name;
                  dev_payload["ss_type"] = element.ss_type;
                  dev_payload["coordinates"] = element.coordinates;
                  dev_payload["name"] = element.name;
                  dev_payload["param_value"] = toFixed(
                    parseFloat(element.param_value),
                    2,
                  );
                  dev_payload["color"] = handleColor(
                    element.param_value,
                    param,
                  );
                  devices.push(dev_payload);
                  // devices.push(element)
                  index++;
                  if (index == results1.length) {
                    zone++;
                    if (zone == results.length) {
                      callback(null, devices);
                    }
                  }
                } else {
                  index++;
                  if (index == results1.length) {
                    zone++;
                    if (zone == results.length) {
                      callback(null, devices);
                    }
                  }
                }
              });
            } else {
              zone++;
              if (results.length === zone) {
                callback(null, devices);
              }
            }
          }
        });
      });
    }
  });
};

const getlast24hr = (id, param, callback) => {
  model.getlast24hr(id, param, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const removeDuplicates = (myArr, prop) => {
  return myArr.filter((obj, pos, arr) => {
    return arr.map((mapObj) => mapObj[prop]).indexOf(obj[prop]) === pos;
  });
};

const gethvacmapdatazoneid = (id, param, callback) => {
  model.getxmapzones(id, (error, results) => {
    if (error) {
      callback(error);
    } else {
      const response = [];
      let i = 0;
      results.forEach((each) => {
        const zoneobj = {};
        zoneobj["zone_id"] = each.id;
        zoneobj["name"] = each.name;
        zoneobj["description"] = each.description;
        zoneobj["bound"] = each.coordinates;
        model.gethvacdevicebyzoneid(each.id, (error, results1) => {
          const devices = [];
          if (results1.length > 0) {
            let index = 0;
            let zoneId = removeDuplicates(results1, "ssid");
            console.log("ZONE NAME", each.name);
            zoneId.forEach((element, io) => {
              console.log("------io", io);
              let payload = {};
              let para = [];
              payload.ssid = element.ssid;
              payload.ss_name = element.ss_name;
              payload.ss_type = element.ss_type;
              payload.coordinates = element.coordinates;
              let elei = 0;
              results1.forEach((ele) => {
                parampayload = {};
                if (element.ssid === ele.ssid) {
                  parampayload.name = ele.name;
                  parampayload.param_value = ele.param_value;
                  para.push(parampayload);
                  elei++;
                  if (elei == results1.length) {
                    payload.parameter = para;
                    devices.push(payload);
                    index++;
                    console.log("----indesx", index);
                    if (index == zoneId.length) {
                      console.log("-----------------outputind", devices);
                      zoneobj["devices"] = devices;
                      if (devices.length > 0) {
                        response.push(zoneobj);
                      }
                      i++;
                      console;
                      if (i == results.length) {
                        callback(null, response);
                      }
                    }
                  }
                } else {
                  elei++;
                  console.log("---------------not matched", elei);
                  if (elei == results1.length) {
                    payload.parameter = para;
                    devices.push(payload);
                    index++;
                    console.log("----indesx", index);
                    if (index == zoneId.length) {
                      console.log("-----------------output", devices);
                      zoneobj["devices"] = devices;
                      if (devices.length > 0) {
                        response.push(zoneobj);
                      }
                      i++;
                      if (i == results.length) {
                        callback(null, response);
                      }
                    }
                  }
                }
              });
            });
          } else {
            i++;
            if (i == results.length) {
              callback(null, response);
            }
          }
        });
      });
    }
  });
};
const getxmapdatazoneid = (id, param, callback) => {
  model.getxmapzones(id, (error, results) => {
    if (error) {
      callback(error);
    } else {
      const response = [];
      let i = 0;
      results.forEach((each) => {
        const zoneobj = {};
        zoneobj["zone_id"] = each.id;
        zoneobj["name"] = each.name;
        zoneobj["description"] = each.description;
        zoneobj["bound"] = each.coordinates;
        model.getdevicebyzoneid(each.id, (error, results1) => {
          const devices = [];
          if (results1.length > 0) {
            let index = 0;
            results1.forEach((element) => {
              if (
                toUpper(param) === "DAMPER_POSITION" &&
                (toUpper(element.name) === "DAMPER_POSITION" ||
                  toUpper(element.name) === "VAV_VOLUME_PERCENT" ||
                  toUpper(element.name) === "SUPPLY_AIR_FLOW" ||
                  toUpper(element.name) === "TEMPERATURE")
              ) {
                devices.push(element);
                index++;
              } else if (toUpper(element.name) === param) {
                let temp = [];
                temp.push(element.param_value);
                var value =
                  temp.reduce((a, b) => parseInt(a) + parseInt(b), 0) /
                  temp.length;
                var color = handleColor(value, param);
                zoneobj["color"] = color;
                devices.push(element);
                index++;
              } else {
                index++;
              }
              if (index == results1.length) {
                zoneobj["device"] = devices;
                if (devices.length > 0) {
                  response.push(zoneobj);
                }
                i++;
                if (i == results.length) {
                  callback(null, response);
                }
              }
            });
          } else {
            i++;
            if (i == results.length) {
              callback(null, response);
            }
          }
        });
      });
    }
  });
};
const getDeviceDataByZoneId = (element, device, callback) => {
  // model.getxmapzones(id, (error, results) => {
  //   if (error) {
  //     callback(error)
  //   } else {
  let zone = 0;
  let eachData = [];
  //console.log("---------------------------zonelist",results,results.length)
  // results.forEach((each) => {
  model.getdevicebyzoneid(element.id, (error, results1) => {
    //console.log("-----------------------zone",zone,each.name)
    // console.log("results1",results1)
    if (results1 != undefined) {
      let deviceId = removeDuplicates(results1, "ssid");
      //console.log("---------------device lenght",deviceId.length)
      let devCount = 0;
      if (deviceId.length > 0) {
        deviceId.forEach((device) => {
          let payload = {};
          // payload["zoneId"] = each.id
          payload["zoneId"] = element.id;
          // payload["zone_coordinates"] = JSON.parse(each.coordinates)
          payload["zone_coordinates"] = JSON.parse(
            getJSONElement(element, ["coordinates"]),
          );
          payload["ssid"] = device.ssid;
          payload["zoneColor"] = "#6185ff";
          payload["name"] = device.ss_name;
          payload["ss_tag"] = device.ss_tag;
          payload["type"] = device.ss_type;
          payload["coordinates"] = JSON.parse(
            getJSONElement(device, ["coordinates"]),
          );

          let resCount = 0;
          results1.forEach((deviceData) => {
            if (device.ssid === deviceData.ssid) {
              payload[deviceData.name] = deviceData.param_value;
              resCount++;
              //console.log("rescount   ----",resCount,results1.length)
              if (resCount === results1.length) {
                eachData.push(payload);
                devCount++;
                // console.log("device count",devCount,deviceId.length)
                if (devCount === deviceId.length) {
                  // zone++
                  // console.log("zone coiunt",zone,results.length)
                  // if (zone === results.length) {
                  // console.log("i am donee--------")
                  //console.log(eachData)
                  callback(null, eachData);
                  // }
                }
              }
            } else {
              resCount++;
              // console.log("rescount out  ----",resCount,results1.length)
              if (resCount === results1.length) {
                eachData.push(payload);
                devCount++;
                //  console.log("device out count",devCount,deviceId.length)
                if (devCount === deviceId.length) {
                  // zone++
                  // console.log("zone elee coiunt",zone,results.length)
                  // if (zone === results.length) {
                  //  console.log("i am donee- out-------")
                  //console.log(eachData)
                  callback(null, eachData);
                  // }
                }
              }
            }
          });
        });
      } else {
        // zone++
        // if (zone == results.length) {
        callback(null, eachData);
        // }
      }
    }
  });
  // })
  //   }
  // })
};

const getdevicedatazoneid = (id, device, callback) => {
  model.getSubordinates(id, (error, result) => {
    if (error) {
      callback(error);
    } else {
      //console.log("res",result)
      let i = 0;
      let res = [];
      // getDataOnlyForZone(id, device, (error, result1) => {
      //   if (error) {
      //     callback(error)
      //   } else {
      //    // console.log("---------------res111----------------->",result1)
      //     let res1 = device === "AHU" ? result1.filter(ele => ele.type == "NONGL_SS_AHU") : device === "THL" ? result1.filter(ele => ele.type == "GL_SS_THLSENSOR_TYPE_01") : device === "energyMeter" ? result1.filter(ele => ele.type == "NONGL_SS_EMS") : []
      // callback(null,finalData)
      if (result.length > 0) {
        result.forEach((element) => {
          getDeviceDataByZoneId(element, device, (error, result1) => {
            if (error) {
              callback(error);
            } else {
              let eleIndex = 0;
              if (result1.length > 0) {
                result1.forEach((ele) => {
                  res.push(ele);
                  eleIndex++;
                  if (result1.length == eleIndex) {
                    i++;
                    // console.log("i------------",i,result.length)
                    if (i == result.length) {
                      // res.push.apply(res, res1)
                      let finalData =
                        device === "AHU"
                          ? res.filter((ele) => ele.type == "NONGL_SS_AHU")
                          : device === "UPS"
                          ? res.filter((ele) => ele.type == "NONGL_SS_UPS")
                          : device === "THL"
                          ? res.filter(
                              (ele) => ele.type == "GL_SS_THLSENSOR_TYPE_01",
                            )
                          : device === "energyMeter"
                          ? res.filter((ele) => ele.type == "NONGL_SS_EMS")
                          : device === "VAV"
                          ? res.filter((ele) => ele.type == "NONGL_SS_VAV")
                          : device === "PUMPS"
                          ? res.filter(
                              (ele) => ele.type == "NONGL_SS_PRIMARY_PUMP",
                            )
                          : device === "SECONDARYPUMPS"
                          ? res.filter(
                              (ele) => ele.type == "NONGL_SS_SECONDARY_PUMPS",
                            )
                          : device === "CONDENSER"
                          ? res.filter(
                              (ele) => ele.type == "NONGL_SS_CONDENSER_PUMPS",
                            )
                          : device === "COOLINGTOWERS"
                          ? res.filter(
                              (ele) => ele.type == "NONGL_SS_COOLING_TOWERS",
                            )
                          : device === "CHILLER"
                          ? res.filter((ele) => ele.type == "NONGL_SS_CHILLER")
                          : device === "OCCUPANCY"
                          ? res.filter(
                              (ele) => ele.type == "GL_SS_WPIR_TYPE_01",
                            )
                          : [];
                      callback(null, finalData);
                    }
                  }
                });
              } else {
                i++;
                //  console.log("i------------",i,result.length)
                if (i == result.length) {
                  // res.push.apply(res, res1)
                  let finalData =
                    device === "AHU"
                      ? res.filter((ele) => ele.type == "NONGL_SS_AHU")
                      : device === "THL"
                      ? res.filter(
                          (ele) => ele.type == "GL_SS_THLSENSOR_TYPE_01",
                        )
                      : device === "UPS"
                      ? res.filter((ele) => ele.type == "NONGL_SS_UPS")
                      : device === "energyMeter"
                      ? res.filter((ele) => ele.type == "NONGL_SS_EMS")
                      : device === "VAV"
                      ? res.filter((ele) => ele.type == "NONGL_SS_VAV")
                      : device === "PUMPS"
                      ? res.filter((ele) => ele.type == "NONGL_SS_PRIMARY_PUMP")
                      : device === "SECONDARYPUMPS"
                      ? res.filter(
                          (ele) => ele.type == "NONGL_SS_SECONDARY_PUMPS",
                        )
                      : device === "CONDENSER"
                      ? res.filter(
                          (ele) => ele.type == "NONGL_SS_CONDENSER_PUMPS",
                        )
                      : device === "COOLINGTOWERS"
                      ? res.filter(
                          (ele) => ele.type == "NONGL_SS_COOLING_TOWERS",
                        )
                      : device === "CHILLER"
                      ? res.filter((ele) => ele.type == "NONGL_SS_CHILLER")
                      : device === "OCCUPANCY"
                      ? res.filter((ele) => ele.type == "GL_SS_WPIR_TYPE_01")
                      : [];
                  callback(null, finalData);
                }
              }
            }
          });
        });
      } else {
        callback(null, res);
      }
    }

    // })

    // else{
    //   getDeviceDataByZoneId(id,device,(error,result1)=>{
    //       if(error){
    //         callback(error)
    //       }else{
    //         let finalData=device==="AHU"?result1.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?result1.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):device==="energyMeter"?res.filter(ele=>ele.type=="NONGL_SS_EMS"):[]
    //         callback(null,finalData)
    //       }

    //   })
    // }

    // }
  });
};

function getJSONElement(myJson, elementPath = []) {
  let eValue = myJson;
  for (let i = 0; i < elementPath.length; i++) {
    if (eValue !== undefined && eValue !== null) {
      eValue = eValue[elementPath[i]];

      // Check if the value is the string "NULL" and return null
      if (typeof eValue === "string" && eValue.toUpperCase() === "NULL") {
        return null;
      }
    } else {
      eValue = undefined;
      console.log(`Unable to process JSON: ${elementPath}`);
      break;
    }
  }
  return eValue !== undefined ? eValue : null;
}

const getAhuActualExpected = (zoneId, callback) => {
  model.getchild(zoneId, (error, result) => {
    if (error) {
      callback(error);
    } else {
      console.log("res", result);
      let i = 0;
      let res = [];
      if (result.length > 0) {
        result.forEach((element) => {
          getAhuDataByZoneId(element.id, (error, result1) => {
            if (error) {
              callback(error);
            } else {
              let eleIndex = 0;
              if (result1.length > 0) {
                result1.forEach((ele) => {
                  res.push(ele);
                  eleIndex++;
                  if (result1.length == eleIndex) {
                    i++;
                    console.log("i------------", i, result.length);
                    if (i == result.length) {
                      // let finalData=device==="AHU"?res.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?res.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
                      callback(null, res);
                    }
                  }
                });
              } else {
                i++;
                console.log("i------------", i, result.length);
                if (i == result.length) {
                  // let finalData=device==="AHU"?res.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?res.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
                  callback(null, res);
                }
              }
            }
          });
        });
      } else {
        getAhuDataByZoneId(zoneId, (error, result1) => {
          if (error) {
            callback(error);
          } else {
            // let finalData=device==="AHU"?result1.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?result1.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
            callback(null, result1);
          }
        });
      }
    }
  });
};

const getAhuDataByZoneId = (id, callback) => {
  model.getxmapzones(id, (error, results) => {
    if (error) {
      callback(error);
    } else {
      let zone = 0;
      let eachData = [];
      console.log(
        "---------------------------zonelist",
        results,
        results.length,
      );
      results.forEach((each) => {
        model.getAhubyzoneid(each.id, (error, results1) => {
          console.log("-----------------------zone", zone, each.name);
          let deviceId = removeDuplicates(results1, "ssid");
          console.log("---------------device lenght", deviceId.length);
          let devCount = 0;
          if (deviceId.length > 0) {
            deviceId.forEach((device) => {
              let payload = {};
              payload["ssid"] = device.ssid;
              payload["name"] = device.ss_name;
              payload["type"] = device.ss_type;
              payload["coordinates"] = JSON.parse(
                getJSONElement(device, ["coordinates"]),
              );
              let resCount = 0;
              results1.forEach((deviceData) => {
                if (device.ssid === deviceData.ssid) {
                  console.log("i am device dsatw", deviceData);
                  let obj = {};
                  obj["actual"] = deviceData.param_value;
                  obj["expected"] =
                    deviceData.userSetPoint == null
                      ? deviceData.defaultSP
                      : deviceData.userSetPoint;
                  obj["name"] = deviceData.ss_name;
                  obj["ssid"] = deviceData.ssid;
                  payload[deviceData.name] = obj;
                  resCount++;
                  console.log("rescount   ----", resCount, results1.length);
                  if (resCount === results1.length) {
                    eachData.push(payload);
                    devCount++;
                    console.log("device count", devCount, deviceId.length);
                    if (devCount === deviceId.length) {
                      zone++;
                      console.log("zone coiunt", zone, results.length);
                      if (zone === results.length) {
                        console.log("i am donee--------");
                        console.log(eachData);
                        callback(null, eachData);
                      }
                    }
                  }
                } else {
                  resCount++;
                  console.log("rescount out  ----", resCount, results1.length);
                  if (resCount === results1.length) {
                    eachData.push(payload);
                    devCount++;
                    console.log("device out count", devCount, deviceId.length);
                    if (devCount === deviceId.length) {
                      zone++;
                      console.log("zone elee coiunt", zone, results.length);
                      if (zone === results.length) {
                        console.log("i am donee- out-------");
                        console.log(eachData);
                        callback(null, eachData);
                      }
                    }
                  }
                }
              });
            });
          } else {
            zone++;
            if (zone == results.length) {
              callback(null, eachData);
            }
          }
        });
      });
    }
  });
};

const getAhuData = (deviceId, callback) => {
  // dataloader.pullForLatest(deviceId)
  model.getAhuData(deviceId, (err, res) => {
    if (err) {
      callback(err);
    } else {
      // callback(null,res)
      model.getAhuData2(deviceId, (err5, res5) => {
        if (err) {
          callback(err5);
        } else {
          let response = {
            current: res,
            current_sp: res5,
          };
          callback(null, response);

          // model.ahuLast24Hr(deviceId,(error,resp)=>{
          //   if(error){
          //     callback(error)
          //   }else{
          //     let graphData=[ {
          //       //       'ahu_chill_water_temperature':[],
          //       //             'ahu_chilled_valve':[],
          //       // 'ahu_filter_status':[],
          //       // 'ahu_in_air_temperature':[],
          //       // 'ahu_on_off':[],
          //       // 'ahu_run_status':[],
          //       // 'ahu_set_point':[],
          //      // 'ahu_chilled_valve':[],
          //      'Chilled Water Valve Feedback':[],
          //      // 'static_pressure':[],
          //      'Supply Air Temperature':[],
          //      // 'ahu_supply_air_temperature':[],
          //      'Return Air Temperature':[]
          //       // 'ahu_trip_status':[],
          //       // 'ahu_vfd_mode':[],
          //       // 'fan_motor_speed':[],
          //       // 'mode':[],
          //       // 'supply_air_flow':[]
          //       }]

          //       for(let keysss in graphData[0]){
          //         resp.forEach(obj=>{
          //             if(obj.param_id===keysss){
          //                   graphData[0][keysss].push(obj)
          //               }
          //              })
          //             }
          //     let response={
          //       "current":res,
          //       "current_sp":res5,
          //       "graphData":graphData
          //     }
          //     callback(null,response)
          //   }
          // })
        }
      });
    }
  });
};

const getAhuActualExpected1 = (zoneId, callback) => {
  model.getSubordinates(zoneId, (error, result) => {
    if (error) {
      callback(error);
    } else {
      console.log("res", result);
      let i = 0;
      let res = [];
      if (result.length > 0) {
        result.forEach((element) => {
          getAhuDataByZoneId1(element.id, (error, result1) => {
            if (error) {
              callback(error);
            } else {
              let eleIndex = 0;
              if (result1.length > 0) {
                result1.forEach((ele) => {
                  res.push(ele);
                  eleIndex++;
                  if (result1.length == eleIndex) {
                    i++;
                    console.log("i------1------", i, result.length);
                    if (i == result.length) {
                      // let finalData=device==="AHU"?res.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?res.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
                      callback(null, res);
                    }
                  }
                });
              } else {
                i++;
                console.log("i----1--------", i, result.length);
                if (i == result.length) {
                  // let finalData=device==="AHU"?res.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?res.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
                  callback(null, res);
                }
              }
            }
          });
        });
      } else {
        getAhuDataByZoneId1(zoneId, (error, result1) => {
          if (error) {
            callback(error);
          } else {
            // let finalData=device==="AHU"?result1.filter(ele=>ele.type=="NONGL_SS_AHU"):device==="THL"?result1.filter(ele=>ele.type=="GL_SS_THLSENSOR_TYPE_01"):[]
            callback(null, result1);
          }
        });
      }
    }
  });
};

const getAhuDataByZoneId1 = (id, callback) => {
  // model.getxmapzones(id,(error,results)=>{
  //   if(error){
  //     callback(error)
  //   }else{
  //     let zone=0
  let eachData = [];
  //     console.log("---------------------------zonelist",results,results.length)
  //     results.forEach((each)=>{
  model.getAhubyzoneid(id, (error, results1) => {
    if (error) {
      callback(error);
    } else {
      // console.log("-----------------------zone",zone,each.name)
      let deviceId = removeDuplicates(results1, "ssid");
      console.log("---------------device lenght", deviceId.length);
      let devCount = 0;
      if (deviceId.length > 0) {
        deviceId.forEach((device) => {
          let payload = {};
          payload["ssid"] = device.ssid;
          payload["name"] = device.ss_name;
          payload["type"] = device.ss_type;
          payload["coordinates"] = JSON.parse(
            getJSONElement(device, ["coordinates"]),
          );
          let resCount = 0;
          getAhuData(device.ssid, (err, resultEx) => {
            if (err) {
              callback(err);
            } else {
              //  callback(null,resultEx)
              payload["deviceData"] = resultEx;
              eachData.push(payload);
              devCount++;
              if (devCount === deviceId.length) {
                // zone++
                // console.log("zone coiunt",zone,results.length)
                // if(zone===results.length){
                console.log("i am donee--------");
                console.log(eachData);
                callback(null, eachData);
                // }
              }
            }
          });
        });
      } else {
        // zone++
        // if(zone==results.length){
        callback(null, eachData);
        // }
      }
    }
  });
  //     })
  //   }
  // })
};
function getVavTableName(eqpParamCode, prefix = "vav_", suffix = "_ahu_om_p") {
  eqpParamCode = Number.parseInt("0x".concat(eqpParamCode), 16);
  if ((0xc000 & eqpParamCode) === 0xc000) {
    tblCode = 0xff00fffff0 & eqpParamCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
  } else {
    tblCode = 0xffffff0000 & eqpParamCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
  }
  return `${prefix}${tblCode
    .toString(16)
    .toLowerCase()
    .padStart(10, 0)}${suffix}`.toLowerCase();
}

const getTableName = (id, callback) => {
  model.getTableName(id, (err, results) => {
    if (err) {
      return callback(err);
    }

    if (results.length === 0) {
      return callback(null, results);
    }

    const { ss_type, ss_address_value } = results[0];

    const tableMap = {
      NONGL_SS_EMS: {
        temp: `em_${ss_address_value}_om_t`,
        permanent: `em_${ss_address_value}_om_p`,
      },
      NONGL_SS_VAV: {
        temp: `vav_${ss_address_value}_om_t`,
        permanent: getVavTableName(ss_address_value),
      },
      NONGL_SS_CHILLER: {
        temp: `ch_${ss_address_value}_om_t`,
        permanent: `ch_${ss_address_value}_om_p`,
      },
      NONGL_SS_COOLING_TOWER: {
        temp: `ct_${ss_address_value}_om_t`,
        permanent: `ct_${ss_address_value}_om_p`,
      },
      NONGL_SS_UPS: {
        temp: `ups_${ss_address_value}_om_t`,
        permanent: `ups_${ss_address_value}_om_p`,
      },
      NONGL_SS_BTU_METER: {
        temp: `btm_${ss_address_value}_om_t`,
        permanent: `btm_${ss_address_value}_om_p`,
      },
      FRESH_AIR_UNIT: {
        temp: `fau_${ss_address_value}_om_t`,
        permanent: `fau_${ss_address_value}_om_p`,
      },
      SS_BRE_FAN: {
        temp: `bref_${ss_address_value}_om_t`,
        permanent: `bref_${ss_address_value}_om_p`,
      },
      SS_HTE_FAN: {
        temp: `htef_${ss_address_value}_om_t`,
        permanent: `htef_${ss_address_value}_om_p`,
      },
      SS_SUBE_FAN: {
        temp: `subef_${ss_address_value}_om_t`,
        permanent: `subef_${ss_address_value}_om_p`,
      },
      SS_VENTILATOR_1: {
        temp: `ven_${ss_address_value}_om_t`,
        permanent: `ven_${ss_address_value}_om_p`,
      },
      NONGL_SS_AIR_COOLED_CHILLER: {
        temp: `ach_${ss_address_value}_om_t`,
        permanent: `ach_${ss_address_value}_om_p`,
      },
      NONGL_SS_COMMON_HEADER: {
        temp: `coh_${ss_address_value}_om_t`,
        permanent: `coh_${ss_address_value}_om_p`,
      },
      NONGL_SS_PRIMARY_PUMP: {
        temp: `pu_${ss_address_value}_om_t`,
        permanent: `pu_${ss_address_value}_om_p`,
      },
      NONGL_SS_SECONDARY_PUMPS: {
        temp: `secpu_${ss_address_value}_om_t`,
        permanent: `secpu_${ss_address_value}_om_p`,
      },
      NONGL_SS_AIR_COOLED_HEADER: {
        temp: `coha_${ss_address_value}_om_t`,
        permanent: `coha_${ss_address_value}_om_p`,
      },

      //  NEW TYPES ADDED
      NONGL_SS_CONDENSER_PUMPS: {
        temp: `condpu_${ss_address_value}_om_t`,
        permanent: `condpu_${ss_address_value}_om_p`,
      },
      NONGL_SS_SECONDARY_SEQ_PANEL: {
        temp: `priseq_${ss_address_value}_om_t`,
        permanent: `priseq_${ss_address_value}_om_p`,
      },
      NONGL_SS_PRIMARY_SEQ_PANEL: {
        temp: `priseq_${ss_address_value}_om_t`,
        permanent: `priseq_${ss_address_value}_om_p`,
      },
    };

    // default fallback (AHU)
    const table_name = tableMap[ss_type] || {
      temp: `ahu_${ss_address_value}_om_t`,
      permanent: `ahu_${ss_address_value}_om_p`,
    };

    console.log("table_name", table_name);

    callback(null, table_name);
  });
};

const getAhuDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      model.ahuLast24Hr(deviceId, resTbName.permanent, (error, resp) => {
        if (error) {
          callback(error);
        } else {
          let graphData = [
            {
              //select any paramerter of ahu
              //       'ahu_chill_water_temperature':[],
              //             'ahu_chilled_valve':[],
              // 'ahu_filter_status':[],
              // 'ahu_in_air_temperature':[],
              // 'ahu_on_off':[],
              // 'ahu_run_status':[],
              // 'ahu_set_point':[],
              // 'ahu_chilled_valve':[],
              //'Chilled Water Valve Feedback':[],
              //'ahu_chilled_water_valve_status':[],
              // 'static_pressure':[],
              //'Supply Air Temperature':[],
              // 'ahu_supply_air_temperature':[],
              //'Return Air Temperature':[]
              SAT: [],
              RAT: [],
              CHW_Vlv_Pos: [],
              // 'ahu_trip_status':[],
              // 'ahu_vfd_mode':[],
              // 'fan_motor_speed':[],
              // 'mode':[],
              // 'supply_air_flow':[]
            },
          ];

          for (let keysss in graphData[0]) {
            resp.forEach((obj) => {
              if (obj.param_id === keysss) {
                graphData[0][keysss].push(obj);
              }
            });
          }
          let response = {
            graphData: graphData,
          };
          callback(null, response);
        }
      });
    }
  });
};

const getEmsData = (floorId, callback) => {
  model.getEmsData(floorId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getEmsDeviceData = (deviceId, callback) => {
  ////uncomment will running with device
  //dataloader.pullForLatest(deviceId)
  model.getEmsDeviceData(deviceId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getEnergyDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errtab, restab) => {
    if (errtab) {
      callback(errtab);
    } else {
      model.energyLast24Hr(deviceId, restab.permanent, (error, resp) => {
        if (error) {
          callback(error);
        } else {
          let graphData = [
            {
              Act_Pwr_Ttl: [],
              PF_Ttl: [],
              Volt_LL_Avg: [],
              Volt_LL_Ph1: [],
              Volt_LL_Ph2: [],
              Volt_LL_Ph3: [],
              Volt_LN_Avg: [],
              Volt_LN_Ph1: [],
              Volt_LN_Ph2: [],
              Volt_LN_Ph3: [],
              Cur_Avg: [],
              Cur_Ph1: [],
              Cur_Ph2: [],
              Cur_Ph3: [],
              //          'em_activePowerTotal':[],
              //          'em_powerFactorTotal':[],
              //          'em_volatage_LL_average':[],
              //          'em_volatage_LN_average':[],
              //          'em_volatge_LL_phase_3-1':[],
              //          'em_volatge_LL_phase_2-3':[],
              //          'em_volatge_LL_phase_1-2':[],
              //          'em_volatge_LN_phase_1-2':[],
              //          'em_volatge_LN_phase_2-3':[],
              //          'em_volatge_LN_phase_3-1':[],
              //          'em_currentAverage':[],
              //          'em_currentPhase1':[],
              //          'em_currentPhase2':[],
              //          'em_currentPhase3':[],
              // 'activePowerTotal':[],
              // 'activePowerPhase1':[],
              // 'activePowerPhase2':[],
              // 'activePowerPhase3':[],
              // 'reactivePowerTotal':[],
              // 'reactivePowerPhase1':[],
              // 'reactivePowerPhase2':[],
              // 'reactivePowerPhase3':[],
              // 'apparentPowerTotal':[],
              // 'apparentPowerPhase1':[],
              // 'apparentPowerPhase2':[],
              // 'apparentPowerPhase3':[],

              //'em_powerFactorTotal':[],
              // 'powerFactorPhase1':[],
              // 'powerFactorPhase2':[],
              // 'powerFactorPhase3':[],
              // 'forwardApparentEnergy':[],
              // 'forwardActiveEnergy':[],
              // 'forwardReactiveEnergy':[]
            },
          ];
          if (resp.length > 0) {
            for (let keysss in graphData[0]) {
              resp.forEach((obj) => {
                if (obj.param_id === keysss) {
                  graphData[0][keysss].push(obj);
                }
              });
            }
            let response = {
              graphData: graphData,
            };
            // console.log("--------------------------",response)
            callback(null, response);
          } else {
            let response = {
              graphData: [],
            };
            callback(null, response);
          }
        }
      });
    }
  });
};

const ems24hoursdata = (deviceId, day, callback) => {
  getTableName(deviceId, (errTab, resTab) => {
    if (errTab) {
      callback(err);
    } else {
      let graphData = [
        {
          Act_Pwr_Ttl: [],
          // "PF_Ttl":[],
          // "Volt_LL_Avg":[],
          // "Volt_LL_Ph1":[],
          // "Volt_LL_Ph2":[],
          // "Volt_LL_Ph3":[],
          // "Volt_LN_Avg":[],
          // "Volt_LN_Ph1":[],
          // "Volt_LN_Ph2":[],
          // "Volt_LN_Ph3":[],
          // "Cur_Avg":[],
          // "Cur_Ph1":[],
          // "Cur_Ph2":[],
          // "Cur_Ph3":[],
          //  'em_activePowerTotal':[],
          // 'em_powerFactorTotal':[],
          // 'em_volatage_LL_average':[],
          //  'em_volatage_LN_average':[],
          //  'em_volatge_LL_phase_3-1':[],
          //  'em_volatge_LL_phase_2-3':[],
          // 'em_volatge_LL_phase_1-2':[],
          //  'em_volatge_LN_phase_1-2':[],
          //  'em_volatge_LN_phase_2-3':[],
          //  'em_volatge_LN_phase_3-1':[],
          //  'em_currentAverage':[],
          //  'em_currentPhase1':[],
          //  'em_currentPhase2':[],
          //  'em_currentPhase3':[],
          // 'activePowerPhase1':[],
          // 'activePowerPhase2':[],
          // 'activePowerPhase3':[],
          // 'reactivePowerTotal':[],
          // 'reactivePowerPhase1':[],
          // 'reactivePowerPhase2':[],
          // 'reactivePowerPhase3':[],
          // 'apparentPowerTotal':[],
          // 'apparentPowerPhase1':[],
          // 'apparentPowerPhase2':[],
          // 'apparentPowerPhase3':[],
          //'em_powerFactorTotal':[],
          // 'powerFactorPhase1':[],
          // 'powerFactorPhase2':[],
          // 'powerFactorPhase3':[],
          // 'forwardApparentEnergy':[],
          // 'forwardActiveEnergy':[],
          // 'forwardReactiveEnergy':[]
        },
      ];

      model.ems24hoursdata(deviceId, resTab.permanent, day, (err, results) => {
        if (err) {
          callback(err);
        } else {
          if (results.length > 0) {
            //get hours
            let result_hours = results.map((ele) => ele.hour);
            let count_arr = new Array(Math.max(...result_hours)).fill(0);
            result_hours.forEach((ele, i) => {
              count_arr[ele - 1] = count_arr[ele - 1] + 1;
            });
            let hours = [];
            count_arr.forEach((ele, i) => {
              if (ele > 0) {
                hours.push(i + 1);
              }
            });
            // console.log("hours",hours)
            let obj_h = {};
            let out_count = 0;
            hours.forEach((ele) => {
              let arr = [];
              let count = 0;
              results.forEach((resEle) => {
                if (ele == resEle.hour) {
                  arr.push(resEle);
                }
                count++;
                if (count == results.length) {
                  obj_h[ele] = arr;
                  out_count++;
                  if (out_count == hours.length) {
                    let count_obj_h = 0;

                    let final = [];
                    for (const property in obj_h) {
                      let onb_key = {};
                      let count_obj_prop = 0;
                      let max_min = [];
                      obj_h[property].forEach((ele_prop) => {
                        max_min.push(ele_prop.Act_Pwr_Ttl);
                        count_obj_prop++;
                        if (count_obj_prop == obj_h[property].length) {
                          let value =
                            Math.max(...max_min) - Math.min(...max_min);
                          onb_key["ss_id"] = deviceId;
                          onb_key["measured_time"] = property;
                          onb_key["param_value"] = value;
                          graphData[0].Act_Pwr_Ttl.push(onb_key);
                          count_obj_h++;
                          if (count_obj_h == Object.keys(obj_h).length) {
                            let response = {
                              graphData: graphData,
                            };
                            //console.log("response",response)
                            callback(null, response);
                          }
                        }
                      });
                    }
                  }
                }
              });
            });
          } else {
            let response = {
              graphData: [],
            };
            //console.log("response",response)
            callback(null, response);
          }
        }
      });
    }
  });
};

const ems7daysdata = (deviceId, day, callback) => {
  getTableName(deviceId, (errTab, resTab) => {
    if (errTab) {
      callback(errTab);
    } else {
      let graphData = [
        {
          Act_Pwr_Ttl: [],
          //'em_activePowerTotal':[],
          // 'activePowerPhase1':[],
          // 'activePowerPhase2':[],
          // 'activePowerPhase3':[],
          // 'reactivePowerTotal':[],
          // 'reactivePowerPhase1':[],
          // 'reactivePowerPhase2':[],
          // 'reactivePowerPhase3':[],
          // 'apparentPowerTotal':[],
          // 'apparentPowerPhase1':[],
          // 'apparentPowerPhase2':[],
          // 'apparentPowerPhase3':[],

          //'em_powerFactorTotal':[],
          // 'powerFactorPhase1':[],
          // 'powerFactorPhase2':[],
          // 'powerFactorPhase3':[],
          // 'forwardApparentEnergy':[],
          // 'forwardActiveEnergy':[],
          // 'forwardReactiveEnergy':[]
        },
      ];
      model.ems7daysdata(deviceId, resTab.permanent, day, (err, results) => {
        if (err) {
          callback(err);
        } else {
          if (results.length > 0) {
            //get days
            let result_days = results.map((ele) => ele.day);
            let count_arr = new Array(Math.max(...result_days)).fill(0);
            result_days.forEach((ele, i) => {
              count_arr[ele - 1] = count_arr[ele - 1] + 1;
            });
            let days = [];
            count_arr.forEach((ele, i) => {
              if (ele > 0) {
                days.push(i + 1);
              }
            });
            //  console.log("days",days)
            let obj_h = {};
            let out_count = 0;
            days.forEach((ele) => {
              let arr = [];
              let count = 0;
              results.forEach((resele) => {
                if (ele == resele.day) {
                  arr.push(resele);
                }
                count++;
                if (count == results.length) {
                  obj_h[ele] = arr;
                  out_count++;
                  if (out_count == days.length) {
                    let count_obj_h = 0;
                    for (const property in obj_h) {
                      let onb_key = {};
                      let count_obj_prop = 0;
                      let max_min = [];
                      obj_h[property].forEach((ele_prop) => {
                        max_min.push(ele_prop.Act_Pwr_Ttl);
                        count_obj_prop++;
                        if (count_obj_prop == obj_h[property].length) {
                          let value =
                            Math.max(...max_min) - Math.min(...max_min);
                          onb_key["ss_id"] = deviceId;
                          onb_key["measured_time"] = property;
                          onb_key["param_value"] = value;
                          graphData[0].Act_Pwr_Ttl.push(onb_key);
                          count_obj_h++;
                          if (count_obj_h == Object.keys(obj_h).length) {
                            let response = {
                              graphData: graphData,
                            };
                            //console.log("response=>",response)
                            callback(null, response);
                          }
                        }
                      });
                    }
                  }
                }
              });
            });
          } else {
            let response = {
              graphData: [],
            };
            //console.log("response else",response)
            callback(null, response);
          }
        }
      });
    }
  });
};

const getUpsDeviceData = (deviceId, callback) => {
  model.getUpsDeviceData(deviceId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const getUpsDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      model.upsLast24Hr(deviceId, resTbName.permanent, (error, resp) => {
        if (error) {
          callback(error);
        } else {
          let graphData = [
            {
              //select any paramerter of ahu

              output_ph_volt_A: [],
              output_ph_volt_B: [],
              output_ph_volt_C: [],

              output_ph_curr_A: [],
              output_ph_curr_B: [],
              output_ph_curr_C: [],
            },
          ];

          for (let keysss in graphData[0]) {
            resp.forEach((obj) => {
              if (obj.param_id === keysss) {
                graphData[0][keysss].push(obj);
              }
            });
          }
          let response = {
            graphData: graphData,
          };
          callback(null, response);
        }
      });
    }
  });
};

const getVavDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      console.log("vav", deviceId, resTbName.permanent);
      model.vavLast24Hr(deviceId, resTbName.permanent, (error, resp) => {
        if (error) {
          callback(error);
        } else {
          let graphData = [
            {
              VAV_ZAT: [],
              VAV_CFM_Design: [],
              // 'supply_air_flow':[]
            },
          ];

          for (let keysss in graphData[0]) {
            resp.forEach((obj) => {
              if (obj.param_id === keysss) {
                graphData[0][keysss].push(obj);
              }
            });
          }
          let response = {
            graphData: graphData,
          };
          callback(null, response);
        }
      });
    }
  });
};
// const getDataOnlyForZone=(id,device,callback)=>{
//   model.getzoneData(id, (error, results) => {
//     if (error) {
//       callback(error)
//     } else {
//       let zone = 0
//       let eachData = []
//       //console.log("---------------------------zonelist",results,results.length)
//       results.forEach((each) => {
//         model.getdevicebyzoneid(each.id, (error, results1) => {
//           //console.log("-----------------------zone",zone,each.name)
//           let deviceId = removeDuplicates(results1, 'ssid')
//           //console.log("---------------device lenght",deviceId.length)
//           let devCount = 0
//           if (deviceId.length > 0) {
//             deviceId.forEach(device => {
//               let payload = {}
//               payload["zoneId"] = each.id
//               payload["zone_coordinates"] = JSON.parse(each.coordinates)
//               payload["ssid"] = device.ssid
//               payload["zoneColor"] = '#6185ff'
//               payload["name"] = device.ss_name
//               payload["type"] = device.ss_type
//               payload["coordinates"] = JSON.parse(device.coordinates)
//               let resCount = 0
//               results1.forEach(deviceData => {
//                 if (device.ssid === deviceData.ssid) {
//                   payload[deviceData.name] = deviceData.param_value
//                   resCount++
//                   //console.log("rescount   ----",resCount,results1.length)
//                   if (resCount === results1.length) {
//                     eachData.push(payload)
//                     devCount++
//                     // console.log("device count",devCount,deviceId.length)
//                     if (devCount === deviceId.length) {
//                       zone++
//                       // console.log("zone coiunt",zone,results.length)
//                       if (zone === results.length) {
//                         // console.log("i am donee--------")
//                         callback(null, eachData)
//                       }
//                     }
//                   }
//                 } else {
//                   resCount++
//                   // console.log("rescount out  ----",resCount,results1.length)
//                   if (resCount === results1.length) {
//                     eachData.push(payload)
//                     devCount++
//                     //  console.log("device out count",devCount,deviceId.length)
//                     if (devCount === deviceId.length) {
//                       zone++
//                       // console.log("zone elee coiunt",zone,results.length)
//                       if (zone === results.length) {
//                         //  console.log("i am donee- out-------")
//                         callback(null, eachData)
//                       }
//                     }
//                   }
//                 }
//               })
//             })
//           } else {
//             zone++
//             if (zone == results.length) {
//               callback(null, eachData)
//             }
//           }

//         })
//       })

//     }
//   })

// }
const getcsuDataLast1Hr = (deviceId, callback) => {
  model.csuLast24Hr(deviceId, (error, resp) => {
    if (error) {
      callback(error);
    } else {
      let graphData = [
        {
          // 'ups_Temperature':[],
          "Return Air Temperature": [],
          relative_humidity: [],
          "CSU On/Off": [],
        },
      ];

      for (let keysss in graphData[0]) {
        resp.forEach((obj) => {
          if (obj.param_id === keysss) {
            graphData[0][keysss].push(obj);
          }
        });
      }
      let response = {
        graphData: graphData,
      };
      // console.log("--------------------------",response)
      callback(null, response);
    }
  });
  // model.csuLast24Hr(deviceId,(err,results)=>{
  //   if(err){
  //     callback(err)
  //   }else{
  //     callback(null,results)
  //   }
  // })
};

const getDeviceTimeSeriesData = (zoneId, deviceType, callback) => {
  model.getDevicesZoneId(zoneId, deviceType, (err, results) => {
    if (err) {
      callback(err);
    } else {
      let data = [];
      if (results.length > 0) {
        let count = 0;
        results.forEach((each) => {
          let tableName =
            deviceType == "NONGL_SS_EMS"
              ? "em_" + each.table_name + "_om_p"
              : deviceType == "NONGL_SS_AHU"
              ? "Ahu_" + each.table_name + "_om_p"
              : "ch_" + each.table_name + "_om_p";
          model.getDeviceData(tableName, (err1, res1) => {
            if (err1) {
              callback(err1);
            } else {
              const groupedData = res1.reduce((acc, obj) => {
                const key = obj.param_id;
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
              }, {});
              const keysToKeep = [
                "RAT",
                "SAT",
                "Act_Pwr_Ph1",
                "Condenser_leaving_temperature",
              ];
              Object.keys(groupedData)
                .filter((key) => !keysToKeep.includes(key))
                .forEach((key) => delete groupedData[key]);
              groupedData["device_name"] = each.device_name;
              data.push(groupedData);
              count++;
              if (results.length == count) {
                callback(null, data);
              }
            }
          });
        });
      } else {
        callback(null, "No device found");
      }
    }
  });
};

const getChillerDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      console.log("table_name", resTbName);
      model.chillerLast24Hr(deviceId, resTbName.permanent, (error, resp) => {
        if (error) {
          callback(error);
        } else {
          let graphData = [
            {
              //select any paramerter of chiller
              CWH_ST: [],
              CWH_RT: [],
              CndW_HST: [],
              CndW_HRT: [],
              VFD_Ph_Cur: [],
              CHW_In_Temp: [],
              CHW_Out_Temp: [],
              Suc_Pre_1: [],
              Dis_Pre_1: [],
              Suc_Pre_2: [],
              Dis_Pre_2: [],
            },
          ];
          for (let keysss in graphData[0]) {
            resp.forEach((obj) => {
              if (obj.param_id === keysss) {
                graphData[0][keysss].push(obj);
              }
            });
          }
          let response = {
            graphData: graphData,
          };
          callback(null, response);
        }
      });
    }
  });
};

const getCoolingTowerDataLast1Hr = (deviceId, callback) => {
  getTableName(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      console.log("table_name", resTbName);
      model.getCoolingTowerDataLast1Hr(
        deviceId,
        resTbName.permanent,
        (error, resp) => {
          if (error) {
            callback(error);
          } else {
            let graphData = [
              {
                //select any paramerter of chiller
                // "CT_RT":[]
                approach: [],
                range: [],
                palceholder: [],
                fan: [],
              },
            ];
            for (let keysss in graphData[0]) {
              resp.forEach((obj) => {
                if (obj.param_id === keysss) {
                  graphData[0][keysss].push(obj);
                }
              });
            }
            let response = {
              graphData: graphData,
            };
            callback(null, response);
          }
        },
      );
    }
  });
};

const getTableNameCopy = (id, callback) => {
  get_Table_name.selectTableName(id, (err, res) => {
    if (err) {
      callback(err);
    } else {
      callback(null, res);
    }
  });
};

const commonGraphApiForAll = (deviceId, callback) => {
  // console.log("DEVICE_ID",deviceId)
  getTableNameCopy(deviceId, (errorTbname, resTbName) => {
    if (errorTbname) {
      callback(null, errorTbname);
    } else {
      // console.log("resTab",resTbName)
      if (Object.keys(resTbName).length > 0) {
        // console.log("table_name",resTbName.table_name,"-->","device_type",resTbName.ss_type)
        if (resTbName != "Device not found") {
          let table_name = resTbName.table_name;
          let device_type = resTbName.device_type;
          if (table_name != undefined && device_type != undefined) {
            model.ahuLast24Hr(deviceId, table_name, (error, resp) => {
              if (error) {
                callback(error);
              } else {
                let graphData = [];
                if (device_type == "NONGL_SS_AHU") {
                  let graphData_obj = {
                    SAT: [],
                    RAT: [],
                    CHW_Vlv_Pos: [],
                  };
                  graphData.push(graphData_obj);
                  // console.log("AHU DEVICE TYPE FOUND")
                  // callback(null,"AHU DEVICE TYPE FOUND")
                } else if (device_type == "NONGL_SS_EMS") {
                  let graphData_obj = {
                    Act_Pwr_Ttl: [],
                    PF_Ttl: [],
                    Volt_LL_Avg: [],
                    Volt_LL_Ph1: [],
                    Volt_LL_Ph2: [],
                    Volt_LL_Ph3: [],
                    Volt_LN_Avg: [],
                    Volt_LN_Ph1: [],
                    Volt_LN_Ph2: [],
                    Volt_LN_Ph3: [],
                    Cur_Avg: [],
                    Cur_Ph1: [],
                    Cur_Ph2: [],
                    Cur_Ph3: [],
                  };
                  graphData.push(graphData_obj);
                  // console.log("EMS DEVICE TYPE FOUND")
                  // callback(null,"EMS DEVICE TYPE FOUND")
                } else if (device_type == "NONGL_SS_UPS") {
                  let graphData_obj = {
                    output_ph_volt_A: [],
                    output_ph_volt_B: [],
                    output_ph_volt_C: [],

                    output_ph_curr_A: [],
                    output_ph_curr_B: [],
                    output_ph_curr_C: [],
                  };
                  graphData.push(graphData_obj);
                  // console.log("UPS DEVICE TYPE FOUND")
                  // callback(null,"UPS DEVICE TYPE FOUND")
                } else if (device_type == "NONGL_SS_VAV") {
                  let graphData_obj = {
                    zone_temperature: [],
                  };
                  graphData.push(graphData_obj);
                } else if (device_type == "NONGL_SS_CHILLER") {
                  let graphData_obj = {
                    CWH_ST: [],
                    CWH_RT: [],
                    CndW_HST: [],
                    CndW_HRT: [],
                    VFD_Ph_Cur: [],
                  };
                  graphData.push(graphData_obj);
                } else if (device_type == "NONGL_SS_COOLING_TOWERS") {
                  let graphData_obj = {
                    CT_RT: [],
                  };
                  graphData.push(graphData_obj);
                } else {
                  console.log("NO DEVICE TYPE FOUND");
                  callback(null, "NOO DEVICE TYPE FOUND");
                }
                for (let keysss in graphData[0]) {
                  resp.forEach((obj) => {
                    if (obj.param_id === keysss) {
                      graphData[0][keysss].push(obj);
                    }
                  });
                }
                let response = {
                  graphData: graphData,
                };
                callback(null, response);
              }
            });
          }
        } else {
          callback(null, "NO Device Found");
        }
      } else {
        callback(null, "NO Device Found");
      }
    }
  });
};

const metricGraphApiForAll = (ss_type, metric_id, normal, callback) => {
  console.log("ss_type", ss_type, "metric_id", metric_id);
  model.getSubsystemDetailsBySstype(ss_type, (err1, res1) => {
    if (err1) {
      callback(err1);
    } else {
      let count = 0;
      let final = [];
      res1.forEach((dev) => {
        model.getMetricDataBydeviceId(
          dev.ss_address_value,
          metric_id,
          normal,
          (err2, res2) => {
            if (err2) {
              callback(err2);
            } else {
              count++;
              console.log("res2", res2);
              const payload = {};
              res2.forEach((row) => {
                const { ss_id, measured_time, metric_value, name } = row;

                if (!payload[name]) {
                  payload[name] = [];
                }

                payload[name].push({
                  // measured_time: measured_time,
                  run_hour: metric_value,
                });
              });

              final.push(payload);
              if (count == res1.length) {
                // console.log("final",final)
                callback(null, final);
                // console.log(payload);
              }
            }
          },
        );
      });
    }
  });
};

const newgetDeviceDataByZoneId = async (element, device) => {
  try {
    const results1 = await new Promise((resolve, reject) => {
      model.newgetdevicebyzoneid(element.id, device, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (results1 !== undefined) {
      let deviceId = removeDuplicates(results1, "ssid");
      let eachData = [];

      for (let device of deviceId) {
        let payload = {
          zoneId: element.id,
          zone_coordinates: JSON.parse(
            getJSONElement(element, ["coordinates"]),
          ),
          ssid: device.ssid,
          zoneColor: "#6185ff",
          name: device.ss_name,
          ss_tag: device.ss_tag,
          type: device.ss_type,
          coordinates: JSON.parse(getJSONElement(device, ["coordinates"])),
        };

        let resCount = 0;
        let controlable = {};
        let graphs = {};
        let alarms = {};

        for (let deviceData of results1) {
          // controlable={}
          if (device.ssid === deviceData.ssid) {
            controlable[deviceData.name] = deviceData.param_value;
            graphs[deviceData.name] = deviceData.param_value;
            alarms[deviceData.name] = deviceData.param_value;
          }

          resCount++;

          if (resCount === results1.length) {
            payload["controlable"] = controlable;
            payload["graphs"] = graphs;
            payload["alarms"] = alarms;
            eachData.push(payload);
          }
        }
      }
      return eachData;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

const getdevicedatabyzoneid = async (id, device, callback) => {
  try {
    const result = await new Promise((resolve, reject) => {
      model.getSubordinates(id, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
    console.log("====Result in Zone ID===", result);
    if (result.length > 0) {
      let allData = [];

      for (let element of result) {
        const eachData = await newgetDeviceDataByZoneId(element, device);
        allData = allData.concat(eachData);
      }

      callback(null, allData);
    } else {
      callback(null, []);
    }
  } catch (error) {
    callback(error);
  }
};

// change it to accept the device type wise the param list of what needed then send back the values based on intervel
const getDeviceDataLast1Hr = async (
  deviceId,
  deviceType,
  interval,
  startdate,
  enddate,
  callback,
) => {
  console.log("deviceId: ", deviceId, "deviceType: ", deviceType);

  const deviceParameters = {
    NONGL_SS_AHU: ["RAT", "SAT", "DSP"],
    NONGL_SS_EMS: [
      "par_avg_active_power_00",
      "par_avg_apparent_power_00",
      "par_avg_pf_00",
      "par_avg_reactive_power_00",
      "par_current_br_00",
      "par_current_ry_00",
      "par_current_yb_00",
      "par_frequency_00",
      "par_pf_br_00",
      "par_pf_ry_00",
      "par_pf_yb_00",
      "par_voltage_br_00",
      "par_voltage_ry_00",
      "par_voltage_yb_00",
      "par_current_01",
      "par_current_02",
      "par_current_03",
      "par_voltage_01",
      "par_voltage_02",
      "par_voltage_03",
    ],
    NONGL_SS_UPS: [
      "output_ph_volt_A",
      "output_ph_volt_B",
      "output_ph_volt_C",
      "output_ph_curr_A",
      "output_ph_curr_B",
      "output_ph_curr_C",
    ],
    NONGL_SS_VAV: ["VAV_ZAT", "VAV_CFM_Design"],
    NONGL_SS_CSU: ["CSU_RAT", "CSU_SAT_Duct_Temp", "CSU_Duct_pre"],
    NONGL_SS_CHILLER: [
      "par_evap_entering_temp_00",
      "sts_evap_leaving_temp_00",
      "par_cond_entering_temp_00",
      "par_cond_leaving_temp_00",
      "par_avg_current_00",
      "par_cwh_sp_temp_00",
      "par_cwh_rt_temp_00",
    ],
    FRESH_AIR_UNIT: [
      "FAU_Supply_Temp",
      "FAU_Wind_Speed",
      "FAU_Duct_Temp",
      "FAU_CO2_Value",
    ],
    NONGL_SS_AIR_COOLED_HEADER: ["par_cwh_rt_temp_00", "par_cwh_sp_temp_00"],
    NONGL_SS_AIR_COOLED_CHILLER: [
      "par_evap_entering_temp_00",
      "sts_evap_leaving_temp_00",
      "par_dpt_00",
    ],
    NONGL_SS_COMMON_HEADER: [
      "par_cdw_ret_temp_00",
      "par_cdw_sup_temp_00",
      "par_cwh_ret_temp_01",
      "par_cwh_ret_temp_02",
      "par_cwh_sup_temp_01",
      "par_cwh_sup_temp_02",
    ],
    NONGL_SS_COOLING_TOWER: [
      "par_avg_voltage_00",
      "par_avg_power_00",
      "par_avg_current_00",
    ],
  };

  const modelFunctions = {
    NONGL_SS_AHU: model.deviceLast24Hr,
    NONGL_SS_EMS: model.deviceLast24Hr,
    NONGL_SS_UPS: model.deviceLast24Hr,
    NONGL_SS_VAV: model.deviceLast24Hr,
    NONGL_SS_CHILLER: model.deviceLast24Hr,
    FRESH_AIR_UNIT: model.deviceLast24Hr,
    SS_BRE_FAN: model.deviceLast24Hr,
    SS_HTE_FAN: model.deviceLast24Hr,
    SS_SUBE_FAN: model.deviceLast24Hr,
    SS_VENTILATOR_1: model.deviceLast24Hr,
    NONGL_SS_AIR_COOLED_CHILLER: model.deviceLast24Hr,
    NONGL_SS_COMMON_HEADER: model.deviceLast24Hr,
    NONGL_SS_CPM: model.deviceLast24Hr,
    NONGL_SS_PRIMARY_PUMP: model.deviceLast24Hr,
    NONGL_SS_SECONDARY_PUMPS: model.deviceLast24Hr,
    NONGL_SS_AIR_COOLED_HEADER: model.deviceLast24Hr,
    NONGL_SS_CSU: model.deviceLast24Hr,
    NONGL_SS_COOLING_TOWER: model.deviceLast24Hr,
  };

  try {
    const resTbName = await new Promise((resolve, reject) => {
      getTableName(deviceId, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });

    const resp = await new Promise((resolve, reject) => {
      modelFunctions[deviceType](
        deviceId,
        resTbName.permanent,
        interval,
        startdate,
        enddate,
        (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        },
      );
    });

    let graphData = deviceParameters[deviceType].reduce((acc, param) => {
      acc[param] = [];
      return acc;
    }, {});

    // let graphData = {}

    if (resp.length === 0) {
      return callback(null, { graphData: [graphData] });
    }
    resp.forEach((obj) => {
      if (graphData.hasOwnProperty(obj.param_id)) {
        graphData[obj.param_id].push(obj);
      }
    });
    // resp.forEach(obj => {
    //   if (!graphData[obj.param_id]) {
    //     graphData[obj.param_id] = [];
    //   }
    //   graphData[obj.param_id].push(obj);
    // });

    callback(null, { graphData: [graphData] });
  } catch (error) {
    callback(error);
  }
};

const getEquipmentList = async (callback) => {
  try {
    const results = await new Promise((resolve, reject) => {
      model.getEquipmentList((error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });
    let resp = [];
    results.forEach((element) => {
      resp.push(element);
    });

    callback(null, resp);
  } catch (error) {
    throw error;
  }
};

const getParameterTypes = async (deviceId, deviceType, callback) => {
  try {
    const result = await new Promise((resolve, reject) => {
      model.getParameterTypes(deviceId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    const eachData = [{ MonitoringParametrs: [] }, { GraphParameters: [] }];
    result.forEach((ele) => {
      eachData[0].MonitoringParametrs.push(ele.name);
      eachData[1].GraphParameters.push(ele.name);
    });

    callback(null, eachData);
  } catch (error) {
    callback(error);
  }
};

const newgetDeviceDataforTemp = async (element, device) => {
  try {
    const results1 = await new Promise((resolve, reject) => {
      model.newgetdevicebyzoneid(element.id, device, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    if (results1 !== undefined) {
      let deviceId = removeDuplicates(results1, "ssid");
      let eachData = [];

      for (let device of deviceId) {
        let payload = {
          zoneId: element.id,
          zone_coordinates: JSON.parse(
            getJSONElement(element, ["coordinates"]),
          ),
          ssid: device.ssid,
          name: device.ss_name,
          ss_tag: device.ss_tag,
          type: device.ss_type,
          coordinates: JSON.parse(getJSONElement(device, ["coordinates"])),
        };

        let resCount = 0;
        let temperature = {};

        for (let deviceData of results1) {
          if (device.ssid === deviceData.ssid) {
            if (deviceData.name === "VAV_ZAT") {
              temperature[deviceData.name] = deviceData.param_value;
            }
          }

          resCount++;

          if (resCount === results1.length) {
            payload["zonal_temperature"] = temperature;
            eachData.push(payload);
          }
        }
      }
      return eachData;
    } else {
      return [];
    }
  } catch (error) {
    throw error;
  }
};

const getTemperature = async (floorId, deviceType, callback) => {
  try {
    const result = await new Promise((resolve, reject) => {
      model.getSubordinates(floorId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    if (deviceType === "NONGL_SS_VAV") {
      if (result.length > 0) {
        let allData = [];

        for (let element of result) {
          const eachData = await newgetDeviceDataforTemp(element, deviceType);
          allData = allData.concat(eachData);
        }

        callback(null, allData);
      }
    } else {
      callback(null, []);
    }
  } catch (error) {
    callback(error);
  }
};

const getTableNameMetric = (id, callback) => {
  model.getTableName(id, (err, results) => {
    console.log("resultss", results);
    if (err) {
      callback(err);
    } else {
      // console.log("results[0].ss_type",results[0].ss_type,results.length)
      if (results.length > 0) {
        console.log("inside getmetricrablename");
        let table_name =
          results[0].ss_type == "NONGL_SS_EMS"
            ? {
                temp: "em_" + results[0].ss_address_value + "_om_t",
                permanent: "em_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "NONGL_SS_AHU"
            ? {
                temp: "ahu_" + results[0].ss_address_value + "_om_t",
                permanent: "ahu_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "NONGL_SS_VAV"
            ? {
                temp: "vav_" + results[0].ss_address_value + "_om_t",
                permanent: getVavTableName(results[0].ss_address_value),
              }
            : results[0].ss_type == "NONGL_SS_CHILLER"
            ? {
                temp: "ch_" + results[0].ss_address_value + "_om_t",
                permanent: "ch_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "NONGL_SS_COOLING_TOWERS"
            ? {
                temp: "cotw_" + results[0].ss_address_value + "_om_t",
                permanent: "cotw_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "NONGL_SS_UPS"
            ? {
                temp: "ups_" + results[0].ss_address_value + "_om_t",
                permanent: "ups_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "FRESH_AIR_UNIT"
            ? {
                temp: "fau_" + results[0].ss_address_value + "_om_t",
                permanent: "fau_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "SS_BRE_FAN"
            ? {
                temp: "bref_" + results[0].ss_address_value + "_om_t",
                permanent: "bref_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "SS_HTE_FAN"
            ? {
                temp: "htef_" + results[0].ss_address_value + "_om_t",
                permanent: "htef_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "SS_SUBE_FAN"
            ? {
                temp: "subef_" + results[0].ss_address_value + "_om_t",
                permanent: "subef_" + results[0].ss_address_value + "_metric",
              }
            : results[0].ss_type == "SS_VENTILATOR_1"
            ? {
                temp: "ven_" + results[0].ss_address_value + "_om_t",
                permanent: "ven_" + results[0].ss_address_value + "_metric",
              }
            : console.log("tablename--->", table_name);

        callback(null, table_name);
      } else {
        callback(null, results);
      }
    }
  });
};

const newgetTableName = (id, eq_type, callback) => {
  // console.log("eq_type", eq_type);

  model.getTableName(id, (err, results) => {
    if (err) {
      return callback(err);
    }
    console.log("resultssssssssss", results);
    if (results.length > 0) {
      const ss_type = results[0].ss_type;
      const ss_address_value = results[0].ss_address_value;
      const ss_id = results[0].id;
      const ss_parent = results[0].ss_parent;
      let table_name;

      if (ss_type === eq_type) {
        table_name = {
          temp: `em_${ss_address_value}_om_t`,
          permanent: `em_${ss_address_value}_om_p`,
          ss_id: ss_id,
          ss_parent: ss_parent,
        };
      } else if (ss_type === eq_type) {
        table_name = {
          temp: `vav_${ss_address_value}_om_t`,
          permanent: getVavTableName(ss_address_value),
          ss_id: ss_id,
          ss_parent: ss_parent,
        };
      } else if (ss_type === eq_type) {
        table_name = {
          temp: `ch_${ss_address_value}_om_t`,
          permanent: `ch_${ss_address_value}_om_p`,
          ss_id: ss_id,
          ss_parent: ss_parent,
        };
      } else if (ss_type === eq_type) {
        table_name = {
          temp: `cotw_${ss_address_value}_om_t`,
          permanent: `cotw_${ss_address_value}_om_p`,
          ss_id: ss_id,
          ss_parent: ss_parent,
        };
      } else if (ss_type === eq_type) {
        table_name = {
          temp: `ahu_${ss_address_value}_om_t`,
          permanent: `ahu_${ss_address_value}_om_p`,
          ss_id: ss_id,
          ss_parent: ss_parent,
        };
      }

      callback(null, table_name);
    } else {
      callback(null, results);
    }
  });
};

const deviceParametersReports = async (
  deviceId,
  interval,
  parameters,
  callback,
) => {
  try {
    const resTbName = await new Promise((resolve, reject) => {
      getTableName(deviceId, (error, res) => {
        if (error) {
          reject(error);
        } else {
          resolve(res);
        }
      });
    });

    const resp = await new Promise((resolve, reject) => {
      model.deviceParametersReports(
        deviceId,
        resTbName.permanent,
        interval,
        parameters,
        (error, res) => {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        },
      );
    });

    let graphData = {};

    if (resp.length === 0) {
      return callback(null, { graphData: [graphData] });
    }
    resp.forEach((obj) => {
      if (!graphData[obj.parameter]) {
        graphData[obj.parameter] = [];
      }
      graphData[obj.parameter].push(obj);
    });

    callback(null, { graphData: [graphData] });
  } catch (error) {
    callback(error);
  }
};

// const getAllEnergyMeters = async () => {
//   return new Promise((resolve, reject) => {
//     model.getAllEnergyMeters((err, rows) => {
//       if (err) return reject(err);

//       rows.forEach(ss => {
//         if (ss.ss_type === "NONGL_SS_ENERGY_METER_CAR_CHARGER") {
//           console.log(`emecar_${ss.ss_address_value}_om_p`);
//         }
//       });

//       resolve(rows); //  send to controller
//     });
//   });
// };

const energyConsumptionChart = async (
  deviceType,
  timeRange,
  start_date,
  end_date,
) => {
  return new Promise((resolve, reject) => {
    const now = new Date();

    /* ---------- DAILY ---------- */
    if (timeRange === "daily") {
      model.getDailyHourlyEnergy(
        deviceType,
        start_date,
        end_date,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        },
      );
    } else if (timeRange === "weekly") {
      /* ---------- WEEKLY ---------- */
      model.getWeeklyEnergy(deviceType, start_date, end_date, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    } else if (timeRange === "monthly") {
      /* ---------- MONTHLY ---------- */
      //const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      model.getMonthlyEnergy(deviceType, start_date, end_date, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    } else {
      reject("Invalid time_range");
    }
  });
};

const getAssetHealthEnergy = async function(
  deviceType,
  timeRange,
  start_date,
  end_date,
) {
  return new Promise((resolve, reject) => {
    model.getAssetHealthEnergy(
      deviceType,
      timeRange,
      start_date,
      end_date,
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
};

const getEnergyHeatmap = async function(
  deviceType,
  timeRange,
  start_date,
  end_date,
) {
  return new Promise((resolve, reject) => {
    model.getEnergyHeatmap(
      deviceType,
      timeRange,
      start_date,
      end_date,
      (err, rows) => {
        if (err) return reject(err);

        if (!Array.isArray(rows) || rows.length === 0) {
          return resolve({
            success: true,
            data: [],
          });
        }

        const formattedResponse = Object.values(
          rows.reduce((acc, row) => {
            if (!row || !row.device_name) return acc;

            const device = row.device_name.trim();

            if (!acc[device]) {
              acc[device] = {
                device_name: device,
                data: [],
              };
            }

            acc[device].data.push({
              label: row.time_label,
              energy_kwh: row.energy_kwh || 0,
            });

            return acc;
          }, {}),
        );

        resolve({
          success: true,
          data: formattedResponse,
        });
      },
    );
  });
};

// const getAssetHealthAlarmCount = async (deviceType, timeRange) => {
//   return new Promise((resolve, reject) => {
//     model.getAssetHealthAslarmCount(deviceType, timeRange, (err, rows) => {
//       if (err) return reject(err);
//       resolve(rows);
//     });
//   });
// };

/**
 * GROUP BY ss_type (ONLY FOR ALL)
 */
const groupBySsType = (rows) => {
  const map = {};

  rows.forEach((row) => {
    if (!map[row.ss_type]) {
      map[row.ss_type] = {
        ss_type: row.ss_type,
        run_hours: 0,
        fault_hours: 0,
      };
    }

    map[row.ss_type].run_hours += row.run_hours;
    map[row.ss_type].fault_hours += row.fault_hours;
  });

  return Object.keys(map).map((key) => {
    const g = map[key];
    return {
      ss_type: g.ss_type,
      run_hours: Number(g.run_hours.toFixed(2)),
      fault_hours: Number(g.fault_hours.toFixed(2)),
      asset_health: toPercentage(g.fault_hours, g.run_hours),
    };
  });
};

const getAssetHealth = (deviceType, start_date, end_date) => {
  return new Promise((resolve, reject) => {
    // Build lookup: "${prefix}_${ss_address_value}" → normalized_table
    // e.g. "ch_0001b00000" → "chiller_1_normalized"
    const siteDevices = analyticsConfig.getDevices();
    const addrToNormalized = {};
    for (const dev of siteDevices) {
      const table = dev.device_table || dev.energy_table;
      if (!table) continue;
      const baseKey = table.replace(/_om_p$/, "");
      addrToNormalized[baseKey] = dev.normalized_table;
    }

    const getNormalizedTable = (ssType, ssAddressValue) => {
      const prefix = getTablePrefix(ssType);
      if (!prefix) return null;
      return addrToNormalized[`${prefix}_${ssAddressValue}`] || null;
    };

    // Fetch ALL plant equipment metadata
    model.getEquipmentMeta("ALL", (err, equipments) => {
      if (err) return reject(err);

      const promises = equipments.map((eq) => {
        return new Promise((res, rej) => {
          const normalizedTable = getNormalizedTable(eq.ss_type, eq.ss_address_value);

          model.getFaultHours(eq.id, start_date, end_date, (fErr, faultHours) => {
            if (fErr) return rej(fErr);

            if (!normalizedTable) {
              return res({
                ss_id:       eq.id,
                ss_type:     eq.ss_type,
                name:        eq.name,
                run_hours:   0,
                fault_hours: faultHours,
              });
            }

            model.getRunHoursFromNormalized(
              normalizedTable, start_date, end_date,
              (rhErr, runHours) => {
                if (rhErr) return rej(rhErr);
                res({
                  ss_id:       eq.id,
                  ss_type:     eq.ss_type,
                  name:        eq.name,
                  run_hours:   runHours,
                  fault_hours: faultHours,
                });
              },
            );
          });
        });
      });

      Promise.all(promises)
        .then((results) => {
          const allEquipments = results.filter(Boolean);
          if (!allEquipments.length) return resolve([]);

          const plantRunHours = Math.max(
            ...allEquipments.map((e) => e.run_hours),
          );

          allEquipments.forEach((e) => {
            if (e.run_hours > 0) {
              e.asset_health = Math.max(0, (1 - e.fault_hours / e.run_hours) * 100);
            } else {
              e.asset_health = e.fault_hours === 0 ? 100 : 0;
            }
          });

          let filtered = allEquipments;
          if (deviceType !== "ALL") {
            const ssTypes = DEVICE_TO_SS_TYPE[deviceType];
            if (!ssTypes) throw new Error(`Invalid device type: ${deviceType}`);
            filtered = allEquipments.filter((e) => ssTypes.includes(e.ss_type));
          }

          filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

          if (deviceType === "ALL")
            return resolve(groupBySsTypeAverage(filtered));

          resolve({ plant_run_hours: plantRunHours, data: filtered });
        })
        .catch(reject);
    }); // close getEquipmentMeta
  }); // close new Promise
};

// const getAssetHealth = (deviceType, start_date, end_date) => {
//   return new Promise((resolve, reject) => {

//     // Always fetch ALL plant equipment
//     model.getEquipmentMeta('ALL', (err, equipments) => {
//       if (err) return reject(err);

//       const promises = equipments.map(eq => {
//         return new Promise((res, rej) => {
//           model.getEquipmentHealth(
//             eq.id,
//             eq.ss_type,
//             eq.name,
//             eq.ss_address_value,
//             start_date,
//             end_date,
//             (err, data) => {
//               if (err) return rej(err);
//               if (!data) return res(null);

//               res({
//                 ss_id: data.ss_id,
//                 ss_type: data.ss_type,
//                 name: data.name,
//                 run_hours: Number(data.run_hours || 0),
//                 fault_hours: Number(data.fault_hours || 0)
//               });
//             }
//           );
//         });
//       });

//       Promise.all(promises)
//         .then(results => {

//           const allEquipments = results.filter(Boolean);
//           if (!allEquipments.length) return resolve([]);

//           // 1. PLANT RUN HOURS (MAX of ALL equipments)
//           const plantRunHours = Math.max(
//             ...allEquipments.map(e => e.run_hours)
//           );

//           // 2. Calculate asset health
//           allEquipments.forEach(e => {
//             e.asset_health =
//               plantRunHours > 0
//                 ? (1 - (e.fault_hours / plantRunHours)) * 100
//                 : 0;
//           });

//           // 3. Filter based on deviceType
//           let filtered = allEquipments;

//           if (deviceType !== 'ALL') {

//            const ssTypes = DEVICE_TO_SS_TYPE[deviceType];

//               if (!ssTypes) {
//                    console.error("Invalid deviceType:", deviceType);
//                    throw new Error(`Invalid device type: ${deviceType}`);
//               }

//               filtered = allEquipments.filter(e =>
//               ssTypes.includes(e.ss_type)
//             );
//           }

//             // Sort by name
//               filtered.sort((a, b) =>
//                   (a.name || '').localeCompare(b.name || '')
//               );

//           // 4. If ALL → average per device type
//           if (deviceType === 'ALL') {
//             return resolve(groupBySsTypeAverage(filtered));
//           }

//              resolve({
//       plant_run_hours: plantRunHours,
//       data: filtered
//     });

//         })
//         .catch(reject);
//     });
//   });
// };

module.exports = {
  getSubsystemId,
  getxmapdatazoneid,
  getlast24hr,
  gethvacmapdatazoneid,
  getchild,
  getchildxmap,
  getdevicedatazoneid,
  getAhuActualExpected,
  getAhuData,
  getAhuActualExpected1,
  getAhuDataLast1Hr,
  getVavDataLast1Hr,
  getEmsData,
  getEmsDeviceData,
  getEnergyDataLast1Hr,
  ems24hoursdata,
  ems7daysdata,
  getUpsDeviceData,
  getUpsDataLast1Hr,
  getcsuDataLast1Hr,
  getDeviceTimeSeriesData,
  getChillerDataLast1Hr,
  getCoolingTowerDataLast1Hr,
  commonGraphApiForAll,
  getTableNameCopy,
  metricGraphApiForAll,
  getdevicedatabyzoneid,
  getDeviceDataLast1Hr,
  getEquipmentList,
  getParameterTypes,
  getTemperature,
  getTableName,
  getTableNameMetric,
  newgetTableName,
  deviceParametersReports,
  //getAllEnergyMeters,
  energyConsumptionChart,
  getAssetHealthEnergy,
  getEnergyHeatmap,
  //getAssetHealthAlarmCount
  getAssetHealth,
};
