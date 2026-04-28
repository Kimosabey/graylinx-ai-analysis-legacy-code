//new db schema for cws
const mysql = require('mysql');

const logger = require('../Config/logger');
const config = require('../Config/common').mysql;

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password
});

connection.connect(err => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info('Mysql Connected to Create Database and Table schemas');
});

connection.query(`CREATE DATABASE IF NOT EXISTS wsp_new_schema`, error => {
  if (error) {
    logger.error(error.message);
    return;
  }
  logger.info(`Database wsp_new_schema successfully created`);
});

connection.query(`USE wsp_new_schema`, error => {
  if (error) {
    logger.error(error.message);
    return;
  }
  logger.info(`Switching to newly created Database wsp_new_schema`);
});

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_zone (
      id varchar(36) NOT NULL,
      name varchar(255) NOT NULL,
      zone_shape ENUM ('circle','rectangle','polygon') DEFAULT NULL,
      coords varchar(255) DEFAULT NULL,
      zone_type ENUM ('campus','organization','building', 'floor', 'zone') DEFAULT NULL,
      zone_status ENUM ('active','inactive'), 
      zone_parent varchar(36) DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name),
      CONSTRAINT fk_gl_zone FOREIGN KEY (zone_parent) REFERENCES gl_zone (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Zone Table Successfully Created`);
    }
);


connection.query(
  `INSERT INTO gl_zone VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9doc','Graylinx', 'rectangle','[1,3,23,56]', 'campus','active',NULL,'2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_zone VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9dbc','Moksha Mansion', 'rectangle','[1,3,23,56]', 'building','active',NULL,'2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone Added Successfully`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_zone_detail (
      id varchar(36) NOT NULL,
      zone_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY param_name_UNIQUE (param_name),
      CONSTRAINT fk_gl_zn_detail_zone FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Zone Detail Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_device (
      id varchar(36) NOT NULL,
      name varchar(255) DEFAULT NULL,
      device_type ENUM ('gateway','controller','thl_sensor', 'pir_sensor') NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_device_detail (
      id varchar(36) NOT NULL,
      device_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY param_name_UNIQUE (param_name),
      CONSTRAINT fk_gl_device FOREIGN KEY (device_id) REFERENCES gl_device (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Detail Table Successfully Created`);
    }
);


connection.query(
    `CREATE TABLE IF NOT EXISTS gl_role (
      id varchar(36) NOT NULL,
      name varchar(255) DEFAULT NULL,
      role_id int(4) DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Role Table Successfully Created`);
    }
);

connection.query(
  `INSERT INTO gl_role VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d4c','superAdmin',1,'2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Role Added Successfully`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user (
      id varchar(36) NOT NULL,
      name varchar(255) NOT NULL,
      password varchar(180) NOT NULL,
      user_role varchar(36) DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name),
      CONSTRAINT fk_user_role FOREIGN KEY (user_role) REFERENCES gl_role (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL User Table Successfully Created`);
    }
);

connection.query(
  `INSERT INTO gl_user VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d5c','Super admin', '$2y$12$InMyjk.oJNprnc2qgyeHb.MLBaxipAYJqeSUNYusKl9ooc5aSiK42', '495d7894-f9cc-4e5b-93ec-b18ae63f9d4c','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`User Added Successfully`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user_detail (
      id varchar(36) NOT NULL,
      user_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY param_name_UNIQUE (param_name),
      CONSTRAINT fk_gl_user FOREIGN KEY (user_id) REFERENCES gl_user (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL User Profile Table Successfully Created`);
    }
  );

  // `INSERT INTO gl_user VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d6c','495d7894-f9cc-4e5b-93ec-b18ae63f9d5c','password', '$2y$12$InMyjk.oJNprnc2qgyeHb.MLBaxipAYJqeSUNYusKl9ooc5aSiK42','2019-05-07 05:51:08','2019-08-13 09:47:03');`,


connection.query(
    `CREATE TABLE IF NOT EXISTS gl_equipment (
      id varchar(36) NOT NULL,
      name varchar(255) DEFAULT NULL,
      component_type ENUM ('damper','light') NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY name_UNIQUE (name)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Controllable Table Successfully Created`);
    }
);


connection.query(
  `INSERT INTO gl_equipment VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9dec','Light 1', 'light','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Lght equipment Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_equipment VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9de2','Light 2', 'light','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Lght equipment Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_equipment VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9de3','Light 3', 'light','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Lght equipment Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_equipment VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9dd1','Damper 1', 'damper','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Lght equipment Added Successfully`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_equipment_detail (
      id varchar(36) NOT NULL,
      equipment_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY param_name_UNIQUE (param_name),
      CONSTRAINT fk_gl_equipment FOREIGN KEY (equipment_id) REFERENCES gl_equipment (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Controllable Detail Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_device_layout (
      id varchar(36) NOT NULL,
      zone_id varchar(36) DEFAULT NULL,
      device_id varchar(36) DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_device_layout_zone FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_device_layout_device FOREIGN KEY (device_id) REFERENCES gl_device (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Layout Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_device_equipment (
      id varchar(36) NOT NULL,
      equipment_id varchar(36) DEFAULT NULL,
      device_id varchar(36) DEFAULT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_device_equipment FOREIGN KEY (equipment_id) REFERENCES gl_equipment (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_equipment_device FOREIGN KEY (device_id) REFERENCES gl_device (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Controllable Table Successfully Created`);
    }
);

// connection.query(
//     `CREATE TABLE IF NOT EXISTS gl_access (
//       id varchar(36) NOT NULL,
//       access varchar(255) DEFAULT NULL,
//       created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       PRIMARY KEY (id),
//       UNIQUE KEY access_UNIQUE (access)
//     )`,
//     error => {
//       if (error) {
//         logger.error(error.message);
//         return;
//       }
//       logger.info(`GL Access Table Successfully Created`);
//     }
// );


// connection.query(
//     `CREATE TABLE IF NOT EXISTS gl_role_access (
//       id varchar(36) NOT NULL,
//       role_id varchar(36) DEFAULT NULL,
//       access_id varchar(36) DEFAULT NULL,
//       created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//       updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       PRIMARY KEY (id),
//       CONSTRAINT fk_gl_role FOREIGN KEY (role_id) REFERENCES gl_role (id) ON DELETE CASCADE,
//       CONSTRAINT fk_gl_access FOREIGN KEY (access_id) REFERENCES gl_access (id) ON DELETE CASCADE
//     )`,
//     error => {
//       if (error) {
//         logger.error(error.message);
//         return;
//       }
//       logger.info(`GL Role Access Table Successfully Created`);
//     }
// );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_zone_user (
      id varchar(36) NOT NULL,
      zone_id varchar(36) DEFAULT NULL,
      user_id varchar(36) DEFAULT NULL,
      usage_start_time datetime NULL,
      usage_end_time datetime NULL,
      usage_type ENUM ('meeting_room','seat','campus','organization','building','zone') NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_zone_user FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_user_zone FOREIGN KEY (user_id) REFERENCES gl_user (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Zone User Table Successfully Created`);
    }
);

connection.query(
  `INSERT INTO gl_zone_user VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9duc','495d7894-f9cc-4e5b-93ec-b18ae63f9doc','495d7894-f9cc-4e5b-93ec-b18ae63f9d5c',NULL,NULL,'campus','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone user Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_zone_user VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d1c','495d7894-f9cc-4e5b-93ec-b18ae63f9dbc','495d7894-f9cc-4e5b-93ec-b18ae63f9d5c',NULL,NULL,'building','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone user Added Successfully`);
  }
);

connection.query(
  `INSERT INTO gl_zone_user VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9duc','495d7894-f9cc-4e5b-93ec-b18ae63f9doc','495d7894-f9cc-4e5b-93ec-b18ae63f9d5c',NULL,NULL,'campus','2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone user Added Successfully`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_zone_user_detail (
      id varchar(36) NOT NULL,
      usage_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY param_name_UNIQUE (param_name),
      CONSTRAINT fk_gl_zone_user_detail_usage FOREIGN KEY (usage_id) REFERENCES gl_zone_user (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Zone User Detail Successfully Created`);
    }
);


connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user_device (
      id varchar(36) NOT NULL,
      device_id varchar(36) DEFAULT NULL,
      user_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_device_user FOREIGN KEY (device_id) REFERENCES gl_device (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_user_device FOREIGN KEY (user_id) REFERENCES gl_user (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL User Device Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user_equipment (
      id varchar(36) NOT NULL,
      equipment_id varchar(36) DEFAULT NULL,
      user_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_equipment_user FOREIGN KEY (equipment_id) REFERENCES gl_equipment (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_user_equipment FOREIGN KEY (user_id) REFERENCES gl_user (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL User Controllable Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_zone_equipment (
      id varchar(36) NOT NULL,
      equipment_id varchar(36) DEFAULT NULL,
      zone_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_zone_equipment FOREIGN KEY (equipment_id) REFERENCES gl_equipment (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_equipment_zone FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Zone Controllable Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_device_operation (
      id varchar(36) NOT NULL,
      equipment_id varchar(36) DEFAULT NULL,
      zone_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_device_operation_equipment FOREIGN KEY (equipment_id) REFERENCES gl_equipment (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_device_operation_zone FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Operation Table Successfully Created`);
    }
);


connection.query(
    `CREATE TABLE IF NOT EXISTS gl_schedule (
      id varchar(36) NOT NULL,
      zone_id varchar(36) DEFAULT NULL,
      begin_time datetime NOT NULL,
      end_time datetime NOT NULL,
      schedule_type ENUM ('device','zone','floor', 'building', 'campus', 'organization') NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_schedule_zone FOREIGN KEY (zone_id) REFERENCES gl_zone (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Schedule Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_schedule_detail (
      id varchar(36) NOT NULL,
      schedule_id varchar(36) DEFAULT NULL,
      device_id varchar(36) DEFAULT NULL,
      param_name varchar(255) DEFAULT NULL,
      param_value text NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_gl_schedule_detail FOREIGN KEY (schedule_id) REFERENCES gl_schedule (id) ON DELETE CASCADE,
      CONSTRAINT fk_gl_schedule_detail_device FOREIGN KEY (device_id) REFERENCES gl_device (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`GL Device Detail Table Successfully Created`);
    }
);

connection.end();