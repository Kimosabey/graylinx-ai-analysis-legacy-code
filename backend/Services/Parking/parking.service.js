const _ = require('lodash');
const model = require('./parking.model');

let floorToNumberMapping = {};

floorToNumberMapping["Basement"] = 1;
floorToNumberMapping["Ground Floor"] = 2;
floorToNumberMapping["1st Floor"] = 3;
floorToNumberMapping["2nd Floor"] = 4;
floorToNumberMapping["3rd Floor"] = 5;
floorToNumberMapping["4th Floor"] = 6;

const buildingParkingStatus = (buildingId, callback) => {
  const buildingParkingDetail = [];
  const floorParkingStatus = {};
  let suggestedFloorArea = {};
  let highlyOccupiedArea = {};
  let lastAvailablityCount = 0,
    lastOccupiedCount = 0,
    i = 0,
    uniqueFloors,
    apiCallCount = 0;

  model.floorParkingStatus(buildingId, (error, results) => {
    if (error) {
      callback(error);
    } else {
      _.forEach(results, result => {
        if (floorParkingStatus[result.floor_id] === undefined) {
          floorParkingStatus[result.floor_id] = {
            available: 0,
            occupied: 0,
            total: 0,
            floor_name: result.floor_name,
            floor_id: result.floor_id
          };
        }
      });

      uniqueFloors = Object.keys(floorParkingStatus);

      for (i = 0; i < uniqueFloors.length; i++) {
        getFloorParkingStatus(uniqueFloors[i], (err, floorResult) => {
          if (err) {
            callback(err);
          } else {
            apiCallCount++;
            const status = {
              id: floorResult.id,
              name: floorResult.name,
              floorNumber: floorResult.number,
              parking: {
                total: floorResult.totalSlots,
                availability: floorResult.totalAvailableSlots,
                occupied: floorResult.totalOccupiedSlots
              }
            };
            buildingParkingDetail.push(status);

            if (floorResult.totalAvailableSlots > lastAvailablityCount) {
              lastAvailablityCount = floorResult.totalAvailableSlots;
              suggestedFloorArea = {
                name: floorResult.name,
                total: floorResult.totalSlots,
                availability: floorResult.totalAvailableSlots
              };
            }

            if (floorResult.totalOccupiedSlots > lastOccupiedCount) {
              lastOccupiedCount = floorResult.totalOccupiedSlots;
              highlyOccupiedArea = {
                name: floorResult.name,
                total: floorResult.totalSlots,
                occupied: floorResult.totalOccupiedSlots
              };
            }

            if (apiCallCount === uniqueFloors.length) {
              console.log("sort by buildingParkingDetail")
              // console.log(buildingParkingDetail)
              console.log(_.sortBy(buildingParkingDetail, 'floorNumber'));
              callback(null, {
                id: buildingId,
                // status: buildingParkingDetail,
                status: _.sortBy(buildingParkingDetail, 'floorNumber'),
                suggestedFloor: suggestedFloorArea,
                highlyOccupiedFloor: highlyOccupiedArea
              });
            }
          }
        });
      }
    }
  });
};

const getFloorParkingStatus = (floorId, callback) => {
  const floorParkingDetail = [];
  const deviceParkingStatus = [];
  const zoneParkingStatus = {};
  let totalOccupancy = 0;
  let totalCount, floorName, floorNumber;
  model.getRegisteredDeviceCount(
    'floors',
    floorId,
    (error, registeredCountResults) => {
      if (error) {
        callback(error);
      } else {
        _.forEach(registeredCountResults, countResult => {
          totalCount = countResult.count;
        });
        model.getParkingSensorStatus(floorId, (error1, results) => {
          if (error1) {
            callback(error1);
          } else {
            _.forEach(results, result => {
              if (zoneParkingStatus[result.zone_id] === undefined) {
                zoneParkingStatus[result.zone_id] = {
                  available: 0,
                  occupied: 0,
                  total: 0,
                  zone_id: result.zone_id,
                  zone_name: result.zone_name,
                  floor_name: result.floor_name,
                  // floor_number: floorToNumberMapping[result.floor_name],
                  floor_number: result.floor_number,
                  deviceRecords: []
                };
              }

              if (JSON.parse(result.data).vehicle_occupancy.value) {
                zoneParkingStatus[result.zone_id].occupied++;
              } else {
                zoneParkingStatus[result.zone_id].available++;
              }
              zoneParkingStatus[result.zone_id].total++;
              zoneParkingStatus[result.zone_id].deviceRecords.push({
                device_name: result.device_name,
                device_id: result.device_id
              });

              const deviceStatus = {
                device_id: result.device_id,
                device_name: result.device_name,
                zone_id: result.zone_id,
                parking_status: JSON.parse(result.data).vehicle_occupancy.value
              };
              deviceParkingStatus.push(deviceStatus);
            });

            const uniqueZones = Object.keys(zoneParkingStatus);
            let maxAvailable = 0,
              maxOccupied = 0,
              suggestedZone = '',
              highlyOccupiedZone = '';
            for (var i = 0; i < uniqueZones.length; i++) {
              if (zoneParkingStatus[uniqueZones[i]].available > maxAvailable) {
                maxAvailable = zoneParkingStatus[uniqueZones[i]].available;
                suggestedZone = zoneParkingStatus[uniqueZones[i]].zone_id;
              }

              if (zoneParkingStatus[uniqueZones[i]].occupied > maxOccupied) {
                maxOccupied = zoneParkingStatus[uniqueZones[i]].occupied;
                highlyOccupiedZone = zoneParkingStatus[uniqueZones[i]].zone_id;
              }

              const status = {
                id: uniqueZones[i],
                name: zoneParkingStatus[uniqueZones[i]].zone_name,
                parking: {
                  total: zoneParkingStatus[uniqueZones[i]].total,
                  availability: zoneParkingStatus[uniqueZones[i]].available,
                  occupied: zoneParkingStatus[uniqueZones[i]].occupied
                }
              };
              floorName = zoneParkingStatus[uniqueZones[i]].floor_name;
              floorNumber = zoneParkingStatus[uniqueZones[i]].floor_number;
              totalOccupancy =
                totalOccupancy + zoneParkingStatus[uniqueZones[i]].occupied;
              floorParkingDetail.push(status);
            }

            const floorBuffer = 0;
            let bufferedTotalCount = totalCount - floorBuffer;
            let bufferedAvailableLots = totalCount - totalOccupancy;
            if (bufferedAvailableLots > bufferedTotalCount) {
              bufferedAvailableLots = bufferedTotalCount;
            }

            let finalStatus = {
              id: floorId,
              name: floorName,
              number: floorNumber,
              totalSlots: bufferedTotalCount,
              totalOccupiedSlots: totalOccupancy,
              totalAvailableSlots: bufferedAvailableLots,
              parking_status: {
                status: floorParkingDetail
              },
              status: deviceParkingStatus
            };

            if (suggestedZone) {
              finalStatus['suggested_zone'] = {};
              finalStatus['suggested_zone']['name'] =
                zoneParkingStatus[suggestedZone].zone_name;
              finalStatus['suggested_zone']['total'] =
                zoneParkingStatus[suggestedZone].total;
              finalStatus['suggested_zone']['availability'] =
                zoneParkingStatus[suggestedZone].available;
            }

            if (highlyOccupiedZone) {
              finalStatus['highly_occupied_zone'] = {};
              finalStatus['highly_occupied_zone']['name'] =
                zoneParkingStatus[highlyOccupiedZone].zone_name;
              finalStatus['highly_occupied_zone']['total'] =
                zoneParkingStatus[highlyOccupiedZone].total;
              finalStatus['highly_occupied_zone']['availability'] =
                zoneParkingStatus[highlyOccupiedZone].available;
            }

            callback(null, finalStatus);
          }
        });
      }
    }
  );
};

const floorLevelParkingStatus = (context, callback) => {
  let floorParkingDetails = []
  model.getFloorDetails(context, (error, result) => {
    if (error) {
      callback(error);
    } else {
      getFloorParkingStatus(result[0].id, (err, floorResult) => {
        if (err) {
          callback(err);
        } else {
          console.log("floorresult \n", floorResult)
          const finalStatus = {
            id: result[0].id,
            name: result[0].name,
            number: result[0].floor_number,
            totalSlots: floorResult.totalSlots,
            totalOccupiedSlots: floorResult.totalOccupiedSlots,
            availability: floorResult.totalAvailableSlots
          };
          floorParkingDetails.push(finalStatus)
          callback(null, floorParkingDetails)
        }
      })
    }
  });
}

module.exports = {
  buildingParkingStatus,
  getFloorParkingStatus,
  floorLevelParkingStatus
};
