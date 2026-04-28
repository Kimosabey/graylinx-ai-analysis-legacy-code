const _ = require("lodash");
const schedule = require("node-schedule");
const async = require("async");
const controller = require("./controller");
const fns = require("date-fns");
const latest_data = require("../../CPM/CPM_Data_Handler");
const cpmUtils = require("../../CPM/CPM_Utilities");
// const latest_data = require('../../Services/Device/myIBMSPreparation');
// schedule.scheduleJob('*/10 * * * * *',() =>{
const axiosc = require("axios");
const https = require("https");
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpsAgent });
// const latest_data = require('../../Services/Device/myIBMSPreparation');
// schedule.scheduleJob('*/10 * * * * *',() =>{
const getLatestInMemoryData = (a, callback) => {
  console.log(`i am a ${a}`);
  axios
    .get("https://localhost/v1/newapis/myibmssnapshot")
    .then((response) => {
      // Handle success
      // console.log('Data:', JSON.stringify(Object.keys(response.data).length));
      callback(null, response.data);
    })
    .catch((error) => {
      // Handle error
      console.error("Error:", error);
    });
};

// schedule.scheduleJob("*/5 * * * * *", () => {
//   async.waterfall(
//     [
//       (callback) => {
//         getLatestInMemoryData(["plantsnapshot"], (err, res) => {
//           if (err) {
//             callback(err);
//           } else {
//             const combinedData = {};
//             // console.log(`${JSON.stringify(res)}`);
//             const data = res;
//             const mySnapshot = cpmUtils.getJSONElement(data);
//             if (mySnapshot != null) {
//               for (const key in mySnapshot) {
//                 if (
//                   key.includes("NONGL_SS_AHU") ||
//                   key.includes("NONGL_SS_VAV") ||
//                   key.includes("NONGL_SS_CHILLER") ||
//                   key.includes("NONGL_SS_COOLING_TOWER") ||
//                   key.includes("NONGL_SS_SECONDARY_PUMPS") ||
//                   key.includes("NONGL_SS_CONDENSER_PUMPS") ||
//                   key.includes("NONGL_SS_PUMPS")
//                 ) {
//                   Object.assign(combinedData, res[key]);
//                 }
//               }
//             }
//             // console.log("Combined AHU and VAV Data:", Object.values(combinedData));
//             callback(null, Object.values(combinedData));
//             // console.log("data in test file",res)
//           }
//         });
//       },
//       (response, callback) => {
//         // console.log("response in test file", response);
//         const ahuArr = [];
//         response.map((item) => {
//           const snapData = item.Eqp_Attributes;
//           const eqp_faulty = item.Eqp_Metrics;

//           if (snapData.SAT_SP && snapData.SAT) {
//             // console.log("ids",item.id,"SAT's",snapData.SAT_SP.presentValue,"SAT_SP's",snapData.SAT.presentValue)
//             if (
//               snapData.SAT_SP.presentValue - snapData.SAT.presentValue > 1 ||
//               snapData.SAT_SP.presentValue - snapData.SAT.presentValue < -0.5
//             ) {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "303",
//                 measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
//                 param_id: "SAT",
//                 message: "Supply Air Temperature Mismatch",
//               });
//               // }
//             } else {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "",
//               });
//             }
//           }
//           if (snapData.RAT_SP && snapData.RAT) {
//             // console.log("ids",item.id,"RAT's",snapData.RAT_SP.presentValue,"RAT_SP's",snapData.RAT.presentValue)
//             if (
//               snapData.RAT_SP.presentValue - snapData.RAT.presentValue > 1 ||
//               snapData.RAT_SP.presentValue - snapData.RAT.presentValue < -0.5
//             ) {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "301",
//                 measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
//                 param_id: "RAT",
//                 message: "Return Air Temperature Mismatch",
//               });
//               // }
//             } else {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "",
//               });
//             }
//           }
//           if (eqp_faulty) {
//             if (eqp_faulty.Equipment_Faulty === true) {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "499",
//                 measured: fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
//                 param_id: "Equipment_status",
//                 message: "Equipment_Faulty",
//               });
//               // }
//             } else {
//               ahuArr.push({
//                 ss_id: item.id,
//                 alarm_code: "",
//               });
//             }
//           }
//         });
//         const groupedData = ahuArr.reduce((acc, obj) => {
//           const key = obj.ss_id;
//           if (!acc[key]) {
//             acc[key] = [];
//           }
//           acc[key].push(obj);
//           return acc;
//         }, {});
//         // console.log("group", groupedData);
//         controller.getAlarmData(groupedData, (err, results) => {
//           if (err) {
//             callback(err);
//           } else {
//             //   console.log("inserted or updated or restored")
//             callback(null, results);
//           }
//         });
//       },
//     ],
//     (err, response) => {
//       if (err) {
//         console.log("error", err);
//       } else {
//         console.log("********My final response*************");
//       }
//     }
//   );
// });

const alarm = () => {
  return;
}; // const getMyData =(data,callback)=>{
//     // console.log("Notifier 1",data[0].Equipment_Static_Data[0].NONGL_SS_AHU)
//     // callback(null,'ok')
//     // console.log("ahu runtime data",data[1].Equipment_RunTime_Data)
//     console.log("//////////////////////////////////////////////////////////////////")
//     console.log("NOTIFIER ALARMS","AHU_DATA",data)
//     callback(null,{id:data.device_id, param_id:data.param_id})
// }

// const getMyData2 = (data,callback)=>{
//     // console.log("data chiller",chiller_static_data)
//     console.log("//////////////////////////////////////////////////////////////////")
//     console.log("NOTIFIER CPM","CHIILER_DATA",data)
//     callback(null,"DATA RECEIVED IN CHILLER AND PROCESS DONE")
//     // console.log("Notifier 2",data[0].Equipment_Static_Data[1].NONGL_SS_CHILLER)
// }

module.exports = {
  // getMyData,
  // getMyData2,
  alarm,
};
