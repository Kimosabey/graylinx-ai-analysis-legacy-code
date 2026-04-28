const uuid = require('uuid/v4');
const organizationModel = require('../Organization/organization.model');
const campusModel = require('../Campus/campus.model');
const buildingModel = require('../Building/building.model');
const floorModel = require('../Floor/floor.model');
const zoneModel = require('../Zone/zone.model');
const deviceModel = require('../Device/device.model');
const model = require('./dataUpload.model');

const dataUpload = (data, callback) => {
 
  model.insertData(data, (error, result) => {
    if (error) {
      callback(error);
    } else [callback(null, 'success')];
  });
};

// const dataUpload = (data, callback) => {
//     // const id = uuid();
//     let id, name, payload;
//     console.log("data====", data)

//     data.forEach((record) => {
//         id = uuid();
//         name = record.Organization;
//         organizationModel.createOrganization({ id, name}, (error, result) => {
//             if(error) {
//               console.log("JSON.stringify(error)");
//               if(error.code == "ER_DUP_ENTRY") {
//                 console.log(error.code);
//               } else {
//                 console.log("error");
//                 callback(error)
//               }
//             } else {
//                 payload = {
//                     id: uuid(),
//                     name: record.Campus,
//                     organization_id: result
//                 };
//                 campusModel.createCampus(payload, (error, result) => {
//                     if (error) {
//                       // callback(error);
//                     } else {
//                         payload = {
//                             id: uuid(),
//                             name: record.Building,
//                             campus_id: result
//                         };
//                         buildingModel.createBuilding(payload, (error, result) => {
//                             if (error) {
//                               console.log(JSON.stringify(error));
//                               // callback(error);
//                             } else {
//                                 payload = {
//                                     id: uuid(),
//                                     name: record.Floor,
//                                     type: record['Floor Type'],
//                                     floor_number: parseInt(record['Floor Num']),
//                                     building_id: result
//                                 };
//                                 floorModel.createFloor(payload, (err, result) => {
//                                     if (err) {
//                                       // callback(err);
//                                     } else {
//                                         payload = {
//                                             id: uuid(),
//                                             name: record.Zone,
//                                             floor_id: result,
//                                             total_slots: record['Available Slots']
//                                           };
//                                         zoneModel.createZone(payload, (error, result) => {
//                                             if (error) {
//                                               // callback(error);
//                                             } else {
//                                                 payload = {
//                                                     id: uuid(),
//                                                     name: record['Device Name'],
//                                                     type: record['Device Type'],
//                                                     mac: record['Mac ID'],
//                                                     zone_id: result,
//                                                     x: null,
//                                                     y: null
//                                                 };
//                                                 if (deviceTypeJSON[record['Mac ID'].substr(0, 4)] === record['Device Type']) {
//                                                     deviceModel.createDevice(payload, (err, response) => {
//                                                       if (err) {
//                                                         // callback(err);
//                                                       } else {
//                                                         // callback(null, response);
//                                                       }
//                                                     });
//                                                   }
//                                                   else {
//                                                     callback({ message: "Mac ID and Device type does not matched" });
//                                                   }
//                                             }
//                                         });
//                                     }
//                                   });
//                             }
//                           });
//                     }
//                   });
//             }
//         })
//     })

//     callback("", "success")
// }

module.exports = {
  dataUpload
};
