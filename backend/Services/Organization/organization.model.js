const { pool } = require('../../Database/pool');
const logger = require('../../Config/logger');

const createOrganization = (payload, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query("select * from organization where name = ?", payload.name, (error, results) => {
        if (results.length > 0) {
          connection.release();
          var err1 = new Error(`${payload.name} already exists`);
          err1.status = 404;
          logger.error("ACTION: Create Organization;" +
            "; RESULT: Organization Name already exists; USER: admin; ROLE: super_admin")
          callback(err1)
        }
        else {
          connection.query('INSERT INTO organization SET ?', payload, error => {
            connection.release();
            if (error) {
              callback(error);
            } else {
              logger.info("ACTION: Create Organization; ORG ID: " + payload.id +
                "; RESULT: Success; USER: admin; ROLE: super_admin")
              callback(null, payload.id);
            }
          });
        }
      })

    } else {
      callback(err);
    }
  });
};

const getOrgChild = callback => {
  pool.getConnection((error, connection) => {
    if (connection) {
      const query =' select o.id as org_id, o.name as org_name, c.id as campus_id, c.name as campus_name, b.id as building_id, b.name as building_name, f.id as floor_id,f.name as floor_name,z.id as zone_id,z.name as zone_name,a.id as area_id,a.name as area_name, d.id as device_id ,d.name as device_name,d.x as location_x,d.y as location_y,d.type as device_type from organization o left join campus c on c.organization_id = o.id left join building b on b.campus_id = c.id left join floor f on f.building_id = b.id left join zone z on z.floor_id = f.id left join area a on a.zone_id=z.id left join  device d on d.area_id = a.id order by org_name,campus_name,building_name,floor_name,zone_name,area_name asc;'
       //before adding area
        // 'select o.id as org_id, o.name as org_name, c.id as campus_id, c.name as campus_name, b.id as building_id, b.name as building_name, f.id as floor_id,f.name as floor_name,z.id as zone_id,z.name as zone_name,d.id as device_id ,d.name as device_name,d.x as location_x,d.y as location_y,d.type as device_type from organization o left join campus c on c.organization_id = o.id left join building b on b.campus_id = c.id left join floor f on f.building_id = b.id left join zone z on z.floor_id = f.id left join device d on d.zone_id = z.id order by org_name,campus_name,building_name,floor_name,zone_name asc';
      const options = {
        sql: query
      };
      connection.query(options, (err, results) => {
        connection.release();
        if (err) {
          callback(err);
        } else {
          callback(null, results);
        }
      });
    } else {
      callback(error);
    }
  });
};

const editOrganizationName = (organization, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'UPDATE organization SET name = ? where id = ?',
        [organization.name, organization.id],
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              callback(null, results);
            } else {
              callback({ message: 'Organization Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

const deleteOrganization = (OrgId, callback) => {
  pool.getConnection((err, connection) => {
    if (connection) {
      connection.query(
        'DELETE FROM organization where id = ?',
        OrgId,
        (error, results) => {
          connection.release();
          if (error) {
            callback(error);
          } else {
            if (results.affectedRows === 1) {
              callback(null, results);
            } else {
              callback({ message: 'Organization Not Found', status: 404 });
            }
          }
        }
      );
    } else {
      callback(err);
    }
  });
};

module.exports = {
  createOrganization,
  getOrgChild,
  editOrganizationName,
  deleteOrganization
};
