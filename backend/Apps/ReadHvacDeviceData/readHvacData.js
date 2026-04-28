const schedule = require('node-schedule');
const controller = require('./controller');
const { compareAsc, format } = require('date-fns');
const bacnet = require('../../hvacBACnetClient');
const { toFixed } = require('../../Utils/common');
const async = require('async');

schedule.scheduleJob('*/10 * * * * *', () => {
  async.waterfall(
    [
      callback => {
        controller.getAhuDevices('NONGL_SS_AHU', (err, result) => {
          if (err) {
            callback(err);
          } else {
            callback(err, result);
          }
        });
      },
//       (response,callback)=>{
//             console.log("ahghdhdh",response.length)
//             let count=0
//             response.forEach(Element => {
  
//                 let AhuData=[
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 1,
//     type: 2,
//     name: 'Return Air Temperature',
//     presentValue: 22.929931640625
//   },
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 4,
//     type: 2,
//     name: 'Chilled Water Valve Feedback',
//     presentValue: 0.3374345302581787
//   },
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 3,
//     type: 5,
//     name: 'VFD Bypass Status',
//     presentValue: 0
//   },
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 2,
//     type: 5,
//     name: 'Supply Fan Status',
//     presentValue: 0
//   },
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 4,
//     type: 5,
//     name: 'Auto / Manual Status',
//     presentValue: 0
//   },
//   {
//     time: "2022-08-24T13:26:50.039Z",
//     objectId: 5,
//     type: 2,
//     name: 'Supply Air Temperature',
//     presentValue: 23.392770767211914
//   }
// ]               
//                 controller.addAhuDeviceData(Element.id,AhuData, Element.ss_type,(err,results)=>{
//                     if(err){
//                         callback(err)
//                     }else{
//                         count++
//                         if(response.length==count){
  
//                             callback(null,results)
//                         }
//                     }
//                 })
//             });
//         }
       // comment above code from 20 to 81 and uncomment below code
      (response, callback) => {
        let count = 0;
        if (response.length > 0) {
          console.log('response', response);
          response.forEach(Element => {
            controller.getAhuDeviceIp(Element.ss_parent, (err, results1) => {
              if (err) {
                callback(err);
              } else {
                console.log('results====', results1);
                //loo not requied
                results1.forEach(ele => {
                  console.log(ele.ss_address_value, 'ss_address_value');
                  let BacnetIp = ele.ss_address_value;
                  console.log('bacnetip', BacnetIp);
                  bacnet.getMyAHUStatus(BacnetIp, (err, results) => {
                    if (err) {
                      console.log("erroooorrr-----------------",err)
                      callback(err);
                      
                    } else {
                      console.log('myresults--', results);
                      console.log('id--', Element.id);
                      let AhuData = results;
                      controller.addAhuDeviceData(
                        Element.id,
                        AhuData,
                        Element.ss_type,
                        (err, results) => {
                          if (err) {
                            callback(err);
                          } else {
                            count++;
                            if (response.length == count) {
                              callback(null, response);
                            }
                          }
                        }
                      );
                    }
                  });
                });
              }
            });
          });
        } else {
          console.log('no data available');
        }
      }
    ],
    (err, response) => {
      if (err) {
        console.log('error', err);
      } else {
        //  console.log("dataalaram",response)
      }
      //  console.log("data-----------------------final data", response)
    }
  );
});

// extra code for reference
// res={}
// results.forEach((Ddcdata)=>{
//     res["name"]=Ddcdata.name
//     res["id"]=Ddcdata.id
//     res["ss_address_value"]=Ddcdata.ss_address_value
// })
//     res["ss_id"]=Element.id
//     res["ss_type"]=Element.ss_type
// arr.push(res)

// console.log("array",arr)
// console.log("ip",res.ss_address_value)
