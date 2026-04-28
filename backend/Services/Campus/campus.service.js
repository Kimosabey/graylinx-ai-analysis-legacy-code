const _ = require('lodash');
const uuid = require('uuid/v4');
const model = require('./campus.model');
const { convertToNested } = require('node-mysql-nesting');

const createCampus = (campus, callback) => {
  const payload = {
    id: uuid(),
    name: campus.name,
    organization_id: campus.org.id
  };
  model.createCampus(payload, (error, result) => {
    if (error) {
      callback(error);
    } else {
      callback(null, result);
    }
  });
};

const buildCampusLmsTree = campus => {
  const result = {
    id: campus.id,
    title: campus.name,
    type: 'campus',
    expanded: true
  };
  const buildings = [];
  _.forEach(campus.building, building => {
    const buildingDetail = {
      id: building.id,
      title: building.name,
      type: 'building',
      expanded: true
    };
    const floors = [];
    _.forEach(building.floor, floor => {
      const floorDetail = {
        id: floor.id,
        title: floor.name,
        floor_type: floor.type,
        type: 'floor',
        expanded: true
      };
      const zones = [];
      _.forEach(floor.zone, zone => {
        const zoneDetail = {
          id: zone.id,
          title: zone.name,
          type: 'zone',
          expanded: true
        };
        const areas = [];
        _.forEach(zone.area,area=>{
          const areaDetail = {
            id: area.id,
            title:area.name,
            type:'area',
            expanded:false
          }
          areas.push(areaDetail);
          // console.log("areas",areas)
        })
        zones.push(zoneDetail);
        zoneDetail.children=areas;
      });
      floorDetail.children = zones;
      floors.push(floorDetail);
      floors[0].activated = true;
    });
    buildingDetail.children = floors;
    buildings.push(buildingDetail);
  });
  result.children = buildings;

  return result;
};

const getCampusTree = (campusId, callback) => {
  model.getCampusTree(campusId, (error, rows) => {
    if (error) {
      callback(error);
    } else {
      if (rows && rows.length > 0) {
        const nestingOptions = [
          { tableName: 'campus', pkey: 'id' },
          {
            tableName: 'building',
            pkey: 'id',
            fkeys: [{ table: 'campus', col: 'campus_id' }]
          },
          {
            tableName: 'floor',
            pkey: 'id',
            fkeys: [{ table: 'building', col: 'building_id' }]
          },
          {
            tableName: 'zone',
            pkey: 'id',
            fkeys: [{ table: 'floor', col: 'floor_id' }]
          },
          {
            tableName: 'area',
            pkey: 'id',
            fkeys: [{ table: 'zone', col: 'zone_id' }]
          },
          {
            tableName: 'device',
            pkey: 'id',
            fkeys: [{ table: 'area', col: 'area_id' }]
          }
        ];
        callback(
          null,
          buildCampusLmsTree(convertToNested(rows, nestingOptions)[0])
        );
      } else {
        callback(null, {
          id: campusId,
          type: 'campus',
          expanded: true
        });
      }
    }
  });
};

const editCampusName = (campus, callback) => {
  model.editCampusName(campus, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

const deviceList = (campusId, callback) => {
  model.deviceList(campusId, (err, results) => {
    if (err) {
      callback(err);
    } else {
      callback(null, results);
    }
  });
};

const deleteCampus = (campusId, callback) => {
  console.log("campusid==",campusId)
  model.deleteCampus(campusId, (err, result) => {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

module.exports = {
  createCampus,
  getCampusTree,
  editCampusName,
  deleteCampus,
  deviceList
};
