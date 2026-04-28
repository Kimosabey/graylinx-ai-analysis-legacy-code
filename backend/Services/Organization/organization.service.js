const _ = require('lodash');
const uuid = require('uuid/v4');
const model = require('./organization.model');

const createOrganization = (name, callback) => {
  const id = uuid();
  model.createOrganization({ id, name }, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const getOrgChild = callback => {
  model.getOrgChild((error, results) => {
    if (error) {
      callback(error);
    } else {
      const grouping = _.chain(results)
        .groupBy('org_id')
        .map((value, key) => {
          return {
            org_id: key,
            org_name: value[0].org_name,
            campus: _.chain(value)
              .filter(i => i.campus_name !== null)
              .groupBy('campus_id')
              .map((camp, cKey) => ({
                campus_id: cKey,
                campus_name: camp[0].campus_name,
                building: _.chain(camp)
                  .filter(i => i.building_name !== null)
                  .groupBy('building_id')
                  .map((bValue, bkey) => ({
                    building_id: bkey,
                    building_name: bValue[0].building_name,
                    floor: _.chain(bValue)
                      .filter(i => i.floor_name !== null)
                      .groupBy('floor_id')
                      .map((fValue, fKey) => ({
                        floor_id: fKey,
                        floor_name: fValue[0].floor_name,
                        zone: _.chain(fValue)
                          .filter(i => i.zone_name !== null)
                          .groupBy('zone_id')
                          .map((zValue, zkey) => ({
                            zone_id: zkey,
                            zone_name: zValue[0].zone_name,
                            area:_.chain(zValue)
                            .filter(i => i.area_name !== null)
                            .groupBy('area_id')
                            .map((aValue, akey) => ({
                              area_id: akey,
                              area_name: aValue[0].area_name,
                            device: _.chain(aValue)
                              .filter(i => i.device_name !== null)
                              .groupBy('device_id')
                              .map((dValue, dkey) => ({
                                device_id: dkey,
                                device_name: dValue[0].device_name,
                                x: dValue[0].location_x,
                                y: dValue[0].location_y,
                                device_type: dValue[0].device_type
                               }))
                               .value()
                              }))
                              .value()
                          }))
                          .value()
                      }))
                      .value()
                  }))
                  .value()
              }))
              .value()
          };
        })
        .value();
      callback(null, { orgGroup: grouping });
    }
  });
};

const editOrganizationName = (organization, callback) => {
  model.editOrganizationName(organization, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const deleteOrganization = (organizationId, callback) => {
  model.deleteOrganization(organizationId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  getOrgChild,
  deleteOrganization,
  createOrganization,
  editOrganizationName
};
