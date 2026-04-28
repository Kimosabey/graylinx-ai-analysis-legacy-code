const _ = require('lodash');
const schedule = require('node-schedule');
const async = require('async');
const controller = require('./restore.controller');
const lightmodel = require('../../Services/Lights/light.model');
const axiosc = require('axios');
const https = require('https');
const logger = require('../../Config/logger');
const { response } = require('express');
const { parseInt, update } = require('lodash');
const { compareAsc, format } = require('date-fns');
const bacnet = require('../../hvacBACnetClient');
const { toFixed } = require('../../Utils/common');

schedule.scheduleJob('*/17 * * * * *', () => {
  async.waterfall(
    [
      callback => {
        controller.getAhuDevices('NONGL_SS_AHU', (err, result) => {
          if (err) {
            callback(err);
          } else {
            //     console.log(result)
            callback(err, result);
          }
        });
      }
      //comment from 29 to 55
      // ,(response,callback)=>{
      //     console.log("ahghdhdh",response.length)
      //     let count=0
      //     response.forEach(Element => {

      //         let AhuData=[{
      //             time: "2022-06-09T07:38:05.164Z",
      //                         objectId: 1,
      //                         type: 4,
      //                         name: 'alarms',
      //                         presentValue: 340
      //                       }

      //             ]
      //         controller.addAhuDeviceData(Element.id,AhuData,(err,results)=>{
      //             if(err){
      //                 callback(err)
      //             }else{
      //                 count++
      //                 if(response.length==count){

      //                     callback(null,results)
      //                 }
      //             }
      //         })
      //     });
      // }
      // uncomment this code after commenting above code 
      ,(response, callback) => {
        console.log('response', response);
        const arr = [];
        response.forEach(Element => {
          controller.getAhuDeviceIp(Element.ss_parent, (err, results) => {
            if (err) {
              callback(err);
            } else {
              res = {};
              results.forEach(Ddcdata => {
                res['name'] = Ddcdata.name;
                res['id'] = Ddcdata.id;
                res['ss_address_value'] = Ddcdata.ss_address_value;
              });
              res['ss_id'] = Element.id;
              res['ss_type'] = Element.ss_type;
              arr.push(res);

              console.log('array', arr);
              console.log('ip', res.ss_address_value);

              let BacnetIp = res.ss_address_value;
              bacnet.getMyAHUAlamrs1(BacnetIp, (err, results) => {
                if (err) {
                  callback(err);
                } else {
                  console.log(
                    'myresults--------------------------------',
                    results
                  );
                  console.log(
                    'id------------------------------------',
                    Element.id
                  );
                  let AhuData = results;
                  controller.addAhuDeviceData(
                    Element.id,
                    AhuData,
                    (err, results) => {
                      if (err) {
                        callback(err);
                      } else {
                        callback(null, results);
                      }
                    }
                  );
                }
              });
            }
          });
        });
      }
    ],
    (err, response) => {
      if (err) {
        console.log('error', err);
      } else {
          console.log("dataalaram",response)
      }
      //  console.log("data-----------------------final data", response)
    }
  );
});
