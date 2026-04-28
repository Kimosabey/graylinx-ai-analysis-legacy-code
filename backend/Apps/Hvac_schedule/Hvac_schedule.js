const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./controller');
const axiosc = require('axios');
const https = require('https');
const logger = require('../../Config/logger');
const { compareAsc, format, parse, isWithinInterval, parseISO } = require('date-fns');
const model = require('./model');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const axios = axiosc.create({ httpsAgent });

// schedule.scheduleJob('*/5 * * * * *', () => {
  schedule.scheduleJob('12,27,42,57 * * * *', () => {
  // schedule.scheduleJob('57,27 * * * *', () => {
  async.waterfall(
    [
      callback => {
        controller.getSchedule((err, result) => {
          if (err) {
            callback(err);
          } else {
             console.log("start schedule")
            callback(err, JSON.parse(result));
          }
        });
      },
      (response, callback) => {
        // console.log("------------erespons--------", response)
        if (response.length !== 0) {
          const next_data = [];
          controller.getRecuuringSheduleData((err, res) => {
            if (err) {
              callback(err)
            } else {
              console.log("get recurring schdule details")
              response.forEach(Element => {
               
                //  bacnet.getMyAHUStatus(ip, (err, results) => {
                //   if (err) {
                //     console.log("erroooorrr-----------------",err)
                //     callback(err);  
                //   } else {
                //deviceData.filter(e => e.type === 'analog_controller').filter(e => e.zone_id == each.id).map(e => e.mac);
                // console.log("results------",results)
                //  let status=results.filter(e=>e.name=="Supply Fan Status")
                // console.log("status=======",status)
                // var format = 'HH:mm:ss'
                //var time = 
                JSON.parse(Element.data).zones.forEach(zone => {
                  controller.getDdcData(zone.id, (err, result) => {
                    if (err) {
                      callback(err)
                    } else {
                      console.log("get each zone gateway data")
                      // assumption only one ddc in each zone
                      if (result.length > 0) {
                        controller.getDdcChildren(result[0].id, (err, resAhu) => {
                          if (err) {
                            callback(err)
                          } else {
                            if (resAhu.length > 0) {
                              // console.log("device", resAhu)
                              console.log("get ahu dataaa----->")
                              resAhu.forEach(ele => {
                                let data = {}
                                console.log("----------------------->resulttttttttt", result[0].id)
                                console.log("----------------------->resulttttttttt", result[0].ss_address_value)
                                console.log("----------------->", JSON.parse(res[0].data).timeData[0].ON, JSON.parse(res[0].data).timeData[0].OFF)
                                let ip = result[0].ss_address_value
                                let a = JSON.parse(res[0].data).timeData[0].ON
                                let b = JSON.parse(res[0].data).timeData[0].OFF
                                //  let e='19:15:00'
                                let e = format(new Date(Element.end), 'HH:mm:ss')
                                let time = parseISO(`1970-01-01T${e}Z`)
                                beforeTime = parseISO(`1970-01-01T${a}Z`)
                                afterTime = parseISO(`1970-01-01T${b}Z`)
                                const interval1 = { start: beforeTime, end: afterTime };
                                // console.log("-------------------->",beforeTime, afterTime,beforeTime1, afterTime1,time)
                                // console.log(isWithinInterval(time, interval1),isWithinInterval(time, interval2))
                                if (isWithinInterval(time, interval1)) {
                                  console.log("in btw 8:00 am- 6:00pm")
                                  data['ip'] = ip
                                  data['action'] = JSON.parse(Element.data).intensity == 100 ? 10 : 0
                                  data['endAction'] = 10
                                  data['start'] = Element.start
                                  data['end'] = Element.end
                                  data['objType'] = ele.ss_tag
                                  data['objInstance'] = ele.ss_address_value
                                  data['deviceId'] = ele.deviceId
                                  next_data.push(data)
                                }
                                else {
                                  console.log("in btw 6:00 pm- 8:00 am")
                                  data['ip'] = ip
                                  data['action'] = JSON.parse(Element.data).intensity == 100 ? 10 : 0
                                  data['endAction'] = 0
                                  data['start'] = Element.start
                                  data['end'] = Element.end
                                  data['objType'] = ele.ss_tag
                                  data['objInstance'] = ele.ss_address_value
                                  data['deviceId'] = ele.deviceId
                                  next_data.push(data)
                                }
                              })
                            } else {
                              console.log("no AHU found")
                            }
                          }
                        })

                      } else {
                        console.log("no DDC found");
                      }

                    }
                  })


                })


              })
            }
          })

          setTimeout(() => callback(null, next_data), 200);
        } else {
          callback('empty');
        }
      }
    ],
    (err, response) => {
      if (err) {
        console.log(err)
        console.log('Schedule Empty');
      } else {
        if (response.length !== 0) {
          console.log("final_resp===============================", response)
          let ino = 0;
          let eno = 3000;
          response.forEach(each => {
            const start = each.start;
            const end = each.end;
            const ip = each.ip
            // const payload=each.action
            const payload = 0
            const payload_two = each.endAction
            const  objType=each.objType
            const objInstance=each.objInstance
            const deviceId=each.deviceId
            console.log("payload-----", payload)
            console.log("payload2-----", payload_two)
            schedule.scheduleJob(start, start, () => {
              console.log("----executing scheduled start job")
              ino += 5000;
              setTimeout(
                ()=>{
            let data_param = payload == 10 ? 'active' : 'inactive'
            let req = `http://localhost:7080/write/${ip}/${objType}:${objInstance}/presentValue/null`
            axios
              .get(req + '/-/8')
              .then((res) => {
                console.log("request senrtt start null")
                let reqe = `http://localhost:7080/write/${ip}/${objType}:${objInstance}/presentValue/${data_param}`
                axios
                  .get(reqe + '/-/16')
                  .then((ressix) => {
                    console.log(`request sent start ${data_param}`)
                  })
                //res.status(OK)
                //callback(null,'ACCEPTED')
                // model.insertSetpointBac(deviceId,data,(error,result)=>{
                //             if(error){
                //               callback(error)
                //             }else{
                //               callback(null,{"message":"ACCEPTED"})
                //             }
                //           })
              })
              .catch((err) => {
                console.log('message": "please connect to network"')
                // callback(null, { "message": "please connect to network" })
              })
            // bacnet.myWritePropertyNewsch(ip,2,1,85,propArr,(error,result4)=>{
            //   if(error){
            //     console.log("erorr cant schedule 16")
            //   }
            //   else
            //   {
            //     // console.log("schedule done 16 start",start)
            //     const data={param_value:payload,param_id:"ahu_on_off_sp"}
            //     model.insertSetpointBac('01f8d696-5abc-4ba1-a3be-415bedaed456',data,(error,result)=>{
            //       if(error){
            //         callback(error)
            //       }else{
            //     console.log("schedule done 16 start",start)
            //        // callback(null,{"message":'ACCEPTED'})
            //       }
            //     })
            //   }
            // })
              },
                ino
              );
            });
          
          });
        }
      }
    }
  );
  async.waterfall(
    [
      callback => {
        controller.getEndSchedule((err, result) => {
          if (err) {
            callback(err);
          } else {
            console.log("schedule end job")
            callback(err, JSON.parse(result));
          }
        });
      },
      (response, callback) => {
        // console.log("------------erespons--------", response)
        if (response.length !== 0) {
          const next_data = [];
          controller.getRecuuringSheduleData((err, res) => {
            if (err) {
              callback(err)
            } else {
              console.log("schedule end get recurring  data")
              response.forEach(Element => {
                JSON.parse(Element.data).zones.forEach(zone => {
                  controller.getDdcData(zone.id, (err, result) => {
                    if (err) {
                      callback(err)
                    } else {
                      // assumption only one ddc in each zone
                      console.log("schedule end get DDC data")
                      if (result.length > 0) {
                        controller.getDdcChildren(result[0].id, (err, resAhu) => {
                          if (err) {
                            callback(err)
                          } else {
                            if (resAhu.length > 0) {
                              console.log("get schedule end  ahu data")
                              // console.log("device", resAhu)
                              resAhu.forEach(ele => {
                                let data = {}
                                console.log("----------------------->resulttttttttt", result[0].id)
                                console.log("----------------------->resulttttttttt", result[0].ss_address_value)
                                console.log("----------------->", JSON.parse(res[0].data).timeData[0].ON, JSON.parse(res[0].data).timeData[0].OFF)
                                let ip = result[0].ss_address_value
                                let a = JSON.parse(res[0].data).timeData[0].ON
                                let b = JSON.parse(res[0].data).timeData[0].OFF
                                //  let e='19:15:00'
                                let e = format(new Date(Element.end), 'HH:mm:ss')
                                let time = parseISO(`1970-01-01T${e}Z`)
                                beforeTime = parseISO(`1970-01-01T${a}Z`)
                                afterTime = parseISO(`1970-01-01T${b}Z`)
                                const interval1 = { start: beforeTime, end: afterTime };
                                // console.log("-------------------->",beforeTime, afterTime,beforeTime1, afterTime1,time)
                                // console.log(isWithinInterval(time, interval1),isWithinInterval(time, interval2))
                                if (isWithinInterval(time, interval1)) {
                                  console.log("in btw 8:00 am- 6:00pm")
                                  data['ip'] = ip
                                  data['action'] = JSON.parse(Element.data).intensity == 100 ? 10 : 0
                                  data['endAction'] = 10
                                  data['start'] = Element.start
                                  data['end'] = Element.end
                                  data['objType'] = ele.ss_tag
                                  data['objInstance'] = ele.ss_address_value
                                  data['deviceId'] = ele.deviceId
                                  next_data.push(data)
                                }
                                else {
                                  console.log("in btw 6:00 pm- 8:00 am")
                                  data['ip'] = ip
                                  data['action'] = JSON.parse(Element.data).intensity == 100 ? 10 : 0
                                  data['endAction'] = 0
                                  data['start'] = Element.start
                                  data['end'] = Element.end
                                  data['objType'] = ele.ss_tag
                                  data['objInstance'] = ele.ss_address_value
                                  data['deviceId'] = ele.deviceId
                                  next_data.push(data)
                                }
                              })
                            } else {
                              console.log("no AHU found")
                            }
                          }
                        })

                      } else {
                        console.log("no DDC found");
                      }

                    }
                  })


                })


              })
            }
          })

          setTimeout(() => callback(null, next_data), 200);
        } else {
          callback('empty');
        }
      }
    ],
    (err, response) => {
      if (err) {
        console.log(err)
        console.log('Schedule Empty');
      } else {
        if (response.length !== 0) {
          console.log("final_resp===============================", response)
          let ino = 0;
          let eno = 3000;
          response.forEach(each => {
            const start = each.start;
            const end = each.end;
            const ip = each.ip
            // const payload=each.action
            const payload = 0
            const payload_two = each.endAction
            const  objType=each.objType
            const objInstance=each.objInstance
            const deviceId=each.deviceId
            console.log("payload-----end", payload)
            console.log("payload2-----end", payload_two)
            schedule.scheduleJob(end, end, () => {
              console.log("------executing end schedule-------")
              // let propArr1 = [{ type: 4, value: null }];
              // bacnet.myWritePropertyNew(ip, 2, 1, 85, propArr1, (error, result4) => {
              //   if (error) {
              //     console.log("erorr cant schedule")
              //   }
              //   else {
              //     console.log("schedule done 8", end)
              //   }
              // })
              // let propArr = [{ type: 4, value: payload_two }];
              let data_param = payload_two == 10 ? 'active' : 'inactive'
              setTimeout(
                () => {
                  let req = `http://localhost:7080/write/${ip}/${objType}:${objInstance}/presentValue/null`
                  axios
                    .get(req + '/-/8')
                    .then((res) => {
                      console.log("request senrtt end null",data_param)
                      let reqe = `http://localhost:7080/write/${ip}/${objType}:${objInstance}/presentValue/${data_param}`
                      axios
                        .get(reqe + '/-/16')
                        .then((ressix) => {
                          console.log("request sent end 16",data_param)
                        })
                      })
                      .catch((err) => {
                        console.log('message": "please connect to network"')
                        // callback(null, { "message": "please connect to network" })
                      })
                  // bacnet.myWritePropertyNewsch(ip, 2, 1, 85, propArr, (error, result4) => {
                  //   if (error) {
                  //     console.log("erorr cant schedule")
                  //   }
                  //   else {
                  //     // console.log("schedule done 16",end)
                  //     const data = { param_value: payload_two, param_id: "ahu_on_off_sp" }
                  //     model.insertSetpointBac('01f8d696-5abc-4ba1-a3be-415bedaed456', data, (error, result) => {
                  //       if (error) {
                  //         callback(error)
                  //       } else {
                  //         console.log("schedule done 16", end)
                  //         // callback(null,{"message":'ACCEPTED'})
                  //       }
                  //     })
                  //   }
                  // })
                },
                eno
              );
              eno += 3000;
            });
          
          });
        }
      }
    }
  );
});
