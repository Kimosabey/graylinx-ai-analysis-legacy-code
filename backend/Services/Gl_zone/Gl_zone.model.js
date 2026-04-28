const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');
const uuid = require('uuid/v4');
const { query, data } = require('../../Config/logger');
const _ = require('lodash');
const arrayToTree = require('array-to-tree');
const e = require('cors');
const { isNull } = require('lodash');

const createOrganization = (payload, callback) => {
  console.log('payload: model', payload);
  pool.getConnection((error, connection) => {
    if (connection) {
      console.log('payload: model22', payload);
      connection.query(
        'SELECT count(*) as count from gl_location WHERE name = ?',
        payload.name,
        (err1, result1) => {
          if (result1[0].count == 0) {
            connection.query(
              'INSERT INTO gl_location (id, name,zone_status,zone_tag,description,zone_shape, zone_type,coordinates,zone_parent) VALUES (?,?,?,?,?,?,?,?,?)',
              [
                payload.id,
                payload.name,
                payload.zone_status,
                payload.zone_tag,
                payload.description,
                payload.zone_shape,
                payload.zone_type,
                payload.coordinates,
                payload.zone_parent
              ],
              (err2, result2) => {
                if (result2) {
                  connection.query(
                    'INSERT INTO gl_location_detail (zone_id) VALUES (?)',
                    [payload.id],
                    (err3, result3) => {
                      connection.release();
                      if (result3) {
                        logger.info(
                          'ACTION: Create Organization; ORG ID: ' +
                            payload.id +
                            '; RESULT: Success; USER: admin; ROLE: super_admin'
                        );
                        callback(null, payload.id);
                      }
                    }
                  );
                }
              }
            );
          } else {
            var err1 = new Error(`${payload.name} already exists`);
            err1.status = 404;
            logger.error(
              'ACTION: Create Organization;' +
                '; RESULT: Organization Name already exists; USER: admin; ROLE: super_admin'
            );
            callback(err1);
          }
        }
      );
    } else {
      callback('DB connection error');
    }
  });
};

// var unflatten = function(array, parent, tree) {
//   tree = typeof tree !== 'undefined' ? tree : [];
//   parent = typeof parent !== 'undefined' ? parent : { id: 0 };

//   var children = _.filter(array, function(child) {
//     return child.parentid == parent.id;
//   });

//   if (!_.isEmpty(children)) {
//     if (parent.id == 0) {
//       tree = children;
//     } else {
//       parent['children'] = children;
//     }
//     _.each(children, function(child) {
//       unflatten(array, child);
//     });
//   }

//   return tree;
// };
function addExpandedKey(tree) {
  return tree.map(node => {
      // Create a new node object with the expanded key
      const newNode = {
          ...node,
          expanded: node.children && node.children.length > 0 ? true : false  // Add expanded if it has children
      };
     
      // If the node has children, recursively add the expanded key to them
      if (newNode.children && newNode.children.length > 0) {
          newNode.children = addExpandedKey(newNode.children);
      }
 
      return newNode;
  });
}
const getGlZone = (id,deviceType,callback) => {
  pool.getConnection((error, connection) => {
    console.log("iddddddd",id,"deviceTypeeee",deviceType)
    if (connection) {
      let query=``
      if(deviceType!=undefined){
       query =
      `WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid, name, zone_type, zone_parent FROM subordinates 
      UNION SELECT ss.id as uuid, ss.name, ss.ss_type as zone_type, ls.zone_id as zone_parent FROM gl_subsystem ss INNER JOIN gl_location_subsystem_map ls ON ls.ss_id = ss.id  WHERE ss.ss_type='${deviceType}'`;
      }
      else{
      //   query=`WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid, name, zone_type, zone_parent FROM subordinates 
      // UNION SELECT ss.id as uuid, ss.name, ss.ss_type as zone_type, ls.zone_id as zone_parent FROM gl_subsystem ss INNER JOIN gl_location_subsystem_map ls ON ls.ss_id = ss.id`
       query=`WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid, name , zone_type , zone_parent FROM subordinates`
      }
      console.log("queryyyyyyyyyyyy",query)
        // "WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent,zone_tag,description FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent,p.zone_tag,p.description FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid,name,zone_type,zone_parent,zone_tag,description FROM subordinates";
      connection.query(query, id, (error, results) => {

        // console.log("resultssssssssss",results)
        //tree stores tree structure of results
        var tree = arrayToTree(results, {
          parentProperty: 'zone_parent',
          customID: 'id'
        });
        connection.release();
        let preparedTree=addExpandedKey(tree)
        callback(null, results);
      });
    } else {
      console.log('DB connection error');
      callback('DB connection error');
    }
  });
};

const getGlZoneForSchedule = (id,deviceType,callback) => {
  pool.getConnection((error, connection) => {
    console.log("iddddddd",id,"deviceTypeeee",deviceType)
    if (connection) {
      let query=``
      if(deviceType!=undefined){
       query =
      `WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid, name, zone_type, zone_parent FROM subordinates 
      UNION SELECT ss.id as uuid, ss.name, ss.ss_type as zone_type, ls.zone_id as zone_parent FROM gl_subsystem ss INNER JOIN gl_location_subsystem_map ls ON ls.ss_id = ss.id  WHERE ss.ss_type='${deviceType}'`;
      }
      else{
      //   query=`WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid, name, zone_type, zone_parent FROM subordinates 
      // UNION SELECT ss.id as uuid, ss.name, ss.ss_type as zone_type, ls.zone_id as zone_parent FROM gl_subsystem ss INNER JOIN gl_location_subsystem_map ls ON ls.ss_id = ss.id`
      //  query=`WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as id, name as title, zone_type as type, zone_parent FROM subordinates`
      // }
      // console.log("queryyyyyyyyyyyy",query)
        // "WITH RECURSIVE subordinates AS (SELECT id,name,zone_type,zone_parent,zone_tag,description FROM gl_location WHERE id=? UNION SELECT p.id,p.name,p.zone_type,p.zone_parent,p.zone_tag,p.description FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id and zone_status='GL_LOCATION_STATUS_ACTIVE' and p.zone_type!='GL_LOCATION_TYPE_SEAT' ) SELECT id as uuid,name,zone_type,zone_parent,zone_tag,description FROM subordinates";
         query=`WITH RECURSIVE subordinates AS ( SELECT id, name, zone_type, zone_parent FROM gl_location WHERE id = ? UNION ALL  SELECT p.id, p.name, p.zone_type, p.zone_parent FROM gl_location p INNER JOIN subordinates s ON p.zone_parent = s.id WHERE p.zone_status = 'GL_LOCATION_STATUS_ACTIVE' AND p.zone_type != 'GL_LOCATION_TYPE_SEAT' ) SELECT id AS id, name AS title, zone_type AS type, zone_parent FROM subordinates  UNION ALL  SELECT gl.id AS id, gl.name AS title, gl.ss_type AS type, lc.id AS zone_parent FROM gl_subsystem gl INNER JOIN gl_location_subsystem_map lsm ON lsm.ss_id = gl.id INNER JOIN gl_location lc ON lc.id = lsm.zone_id INNER JOIN subordinates sub ON sub.id = lc.id; `
      }
      connection.query(query, id, (error, results) => {

        // console.log("resultssssssssss",results)
        //tree stores tree structure of results
        var tree = arrayToTree(results, {
          parentProperty: 'zone_parent',
          customID: 'id'
        });
        connection.release();
        let preparedTree=addExpandedKey(tree)
        callback(null, preparedTree);
      });
    } else {
      console.log('DB connection error');
      callback('DB connection error');
    }
  });
};


module.exports = {
  createOrganization,
  getGlZone,
  getGlZoneForSchedule
};
