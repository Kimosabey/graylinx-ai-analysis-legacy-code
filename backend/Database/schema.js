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

connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`, error => {
  if (error) {
    logger.error(error.message);
    return;
  }
  logger.info(`Database ${config.database} successfully created`);
});

connection.query(`USE ${config.database}`, error => {
  if (error) {
    logger.error(error.message);
    return;
  }
  logger.info(`Switching to newly created Database ${config.database}`);
});

connection.query(
  `CREATE TABLE IF NOT EXISTS organization (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
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
    logger.info(`Organization Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS campus (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    organization_id varchar(36) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY name_UNIQUE (name),
    KEY fk_campus_organization_idx (organization_id),
    CONSTRAINT fk_campus_organization FOREIGN KEY (organization_id) REFERENCES organization (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Campus Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS building (
      id varchar(36) NOT NULL,
      name varchar(120) NOT NULL,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      campus_id varchar(36) NOT NULL,
      PRIMARY KEY (id),
      KEY fk_building_campus_idx (campus_id),
      CONSTRAINT fk_building_campus FOREIGN KEY (campus_id) REFERENCES campus (id) ON DELETE CASCADE
    )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Building Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS floor (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    building_id varchar(36) NOT NULL,
    type varchar(9) DEFAULT NULL,
    floor_number int(4) DEFAULT NULL,
    PRIMARY KEY (id),
    KEY fk_floor_building_idx (building_id),
    KEY floor_type_idx (type),
    CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES building (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Floor Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE zone (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    floor_id varchar(36) NOT NULL,
    PRIMARY KEY (id),
    KEY fk_zone_floor_idx (floor_id),
    CONSTRAINT fk_zone_floor FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Zone Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE area (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    zone_id varchar(36) NOT NULL,
    PRIMARY KEY (id),
    KEY fk_area_zone_idx (zone_id),
    CONSTRAINT fk_area_floor FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Area Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE device (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    type varchar(45) NOT NULL,
    mac varchar(45) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    area_id varchar(36) NOT NULL,
    x float DEFAULT NULL,
    y float DEFAULT NULL,
    device_info text,
    PRIMARY KEY (id),
    UNIQUE KEY name_UNIQUE (name),
    UNIQUE KEY id_index (id),
    KEY fk_device_area_idx (area_id),
    KEY device_type_area_id_idx (type,area_id),
    CONSTRAINT fk_device_area FOREIGN KEY (area_id) REFERENCES area (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Device Table Successfully Created`);
  }
);


// connection.query(
//   `CREATE TRIGGER checkDeviceCount
//   BEFORE INSERT
//   ON device
//   FOR EACH ROW
//   BEGIN
//     declare msg varchar(128);
//     SELECT COUNT(*) INTO @cnt FROM device;
//     IF @cnt >= 100 THEN
//       set msg = 'Trying to add device more than specified';
//       signal sqlstate '45000' set message_text = msg;
//     END IF;
//   END`,
//   error => {
//     if (error) {
//       logger.error(error.message);
//       return;
//     }
//     logger.info(`device count trigger Successfully Created`);
//   }
// );


connection.query(
  `CREATE TABLE IF NOT EXISTS gateway (
      id varchar(36) NOT NULL,
      name varchar(120) NOT NULL,
      ip varchar(16) NOT NULL,
      status boolean default true,
      created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY ip_UNIQUE (ip)
    )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Gateway Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS gateway_mapping (
    zone_id varchar(36) NOT NULL,
    gateway_id varchar(36) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY fk_gateway_mapping_zone_idx (zone_id),
    KEY fk_gateway_mapping_gateway_idx (gateway_id),
    CONSTRAINT fk_gateway_mapping_gateway FOREIGN KEY (gateway_id) REFERENCES gateway (id) ON DELETE CASCADE,
    CONSTRAINT fk_gateway_mapping_zone FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Gateway Zone Mapping Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS schedule (
    id varchar(36) NOT NULL,
    name varchar(120) NOT NULL,
    data json NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    floor_id varchar(36) NOT NULL,
    floor_name varchar(36) NOT NULL,
    start datetime NOT NULL,
    end datetime NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY name_UNIQUE (name),
    KEY fk_schedule_device_idx (floor_id),
    CONSTRAINT fk_schedule_floor FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Schedule Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS user (
        id varchar(36) NOT NULL,
        campus_id varchar(36),
        username varchar(45) NOT NULL,
        password varchar(180) NOT NULL,
        secret varchar(18) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login varchar(50) DEFAULT NULL,
        email varchar(180) DEFAULT NULL,
        role_id int(3) NOT NULL,
        role_name varchar(24) NOT NULL,
        status boolean NOT NULL default true,
        PRIMARY KEY (id),
        UNIQUE KEY username_UNIQUE (username),
        UNIQUE KEY user_email_UNIQUE (email),
        KEY fk_user_campus_idx (campus_id),
        CONSTRAINT fk_user_campus FOREIGN KEY (campus_id) REFERENCES campus (id) ON DELETE CASCADE
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`User Table Successfully Created`);
  }
);

connection.query(
  `INSERT INTO user (id, username, password, role_name, role_id, created_at, updated_at) VALUES ('595e650a-9d85-49da-a5a9-b7dda03b089c','admin','$2y$10$n/2DJoDB13fcqqgCBHpa2e2aOst6o0l2haJbcoxhiS7ROxo/wHeUS','superAdmin',1,'2019-05-07 05:51:08','2019-08-13 09:47:03');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Super Admin Added Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS super_admin (
        id varchar(36) NOT NULL,
        username varchar(45) NOT NULL,
        password varchar(180) NOT NULL,
        role_name varchar(24) NOT NULL,
        role_id int(3) NOT NULL,
        total_devices int(4) NOT NULL,
        mac_address varchar(180) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login varchar(50) DEFAULT NULL,
        PRIMARY KEY (id)
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Super Admin Table Successfully Created`);
  }
);

connection.query(
  `INSERT INTO super_admin VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d4c','admin','$2y$10$n/2DJoDB13fcqqgCBHpa2e2aOst6o0l2haJbcoxhiS7ROxo/wHeUS','superAdmin',1,100,'$2y$10$lW4opROAzXvE9zr0y2ePWezL6jK98kdLGNKU.VzTofhcSQgsnXNGq','2019-05-07 05:51:08','2019-08-13 09:47:03', '');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Super Admin Added Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS session (
        id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        token text NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Session Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS event (
        id varchar(36) NOT NULL,
        device_id varchar(36) NOT NULL,
        device_type varchar(45) NOT NULL,
        data text NOT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_event_device_idx (device_id),
        KEY event_device_type (device_type),
        KEY event_created_at_idx (created_at),
        KEY by_device_id (device_id),
        KEY by_device_type (device_type),
        KEY device_type_index (device_type),
        KEY idx_device_type (device_type),
        CONSTRAINT fk_event_device FOREIGN KEY (device_id) REFERENCES device (id) ON DELETE CASCADE
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Event Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE latest_event (
    id varchar(36) NOT NULL,
    device_id varchar(36) NOT NULL,
    device_name varchar(120) NOT NULL,
    device_type varchar(45) NOT NULL,
    data text NOT NULL,
    network_data text NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    area_id varchar(36) NOT NULL,
    zone_id varchar(36) NOT NULL,
    floor_id varchar(36) NOT NULL,
    building_id varchar(36) NOT NULL,
    campus_id varchar(36) NOT NULL,
    campus_name varchar(120) DEFAULT NULL,
    building_name varchar(120) DEFAULT NULL,
    floor_name varchar(120) DEFAULT NULL,
    zone_name varchar(120) DEFAULT NULL,
    area_name varchar(120) DEFAULT NULL,
    floor_number int DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY device_id_UNIQUE (device_id),
    KEY fk_event_device_idx (device_id),
    KEY event_device_type (device_type),
    KEY event_device_name (device_name),
    KEY event_created_at_idx (created_at),
    KEY fk_latest_event_zone_idx (zone_id),
    KEY fk_latest_event_area_idx (area_id),
    KEY fk_latest_event_floor_idx (floor_id),
    KEY fk_latest_event_building_idx (building_id),
    KEY fk_latest_event_campus_idx (campus_id),
    KEY idx_device_type (device_type),
    CONSTRAINT fk_latest_event_area FOREIGN KEY (area_id) REFERENCES area (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_latest_event_building FOREIGN KEY (building_id) REFERENCES building (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_latest_event_campus FOREIGN KEY (campus_id) REFERENCES campus (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_latest_event_device FOREIGN KEY (device_id) REFERENCES device (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_latest_event_floor FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_latest_event_zone FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE ON UPDATE CASCADE
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Latest Event Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS parking_status (
        id varchar(36) NOT NULL,
        context_id varchar(36) NOT NULL,
        total int(11) NOT NULL,
        availability int(11) DEFAULT NULL,
        occupied int(11) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Parking Status Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS daily_zone_occupancy (
        id int(11) AUTO_INCREMENT,
        zone_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int(4) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_occupancy_zone_day FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Daily Occupancy for Zone Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS daily_floor_occupancy (
        id int(11) AUTO_INCREMENT,
        floor_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int(4) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_occupancy_floor_day FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Daily Occupancy for Floor Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS daily_building_occupancy (
        id int(11) AUTO_INCREMENT,
        building_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int(4) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT fk_occupancy_building_day FOREIGN KEY (building_id) REFERENCES building (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Daily Occupancy for Building Table Successfully Created`);
  }
);

connection.query(
  `CREATE TABLE IF NOT EXISTS device_status (
    id varchar(36) NOT NULL,
    device_mac varchar(45) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    command_id varchar(255) DEFAULT NULL,
    counter varchar(255) DEFAULT NULL,
    gatewayip varchar(16) DEFAULT NULL,
    mode varchar(255) DEFAULT NULL,
    intensity varchar(255) DEFAULT NULL,
    payload text,
    status varchar(255) DEFAULT NULL,
    batch_id varchar(36) DEFAULT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY command_id (command_id)
  )`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`Device status for command_id Table Successfully Created`);
  }
);


 







// connection.query(
//   `CREATE TABLE IF NOT EXISTS monthly_zone_occupancy (
//         id int(11) AUTO_INCREMENT,
//         zone_id varchar(36) NOT NULL,
//         occupancy json NOT NULL,
//         avg_occupancy int(4) DEFAULT NULL,
//         created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         PRIMARY KEY (id),
//         CONSTRAINT fk_occupancy_zone_month FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE ON UPDATE CASCADE
//       )`,
//   error => {
//     if (error) {
//       logger.error(error.message);
//       return;
//     }
//     logger.info(`Monthly Occupancy for Zone Table Successfully Created`);
//   }
// );

// connection.query(
//   `CREATE TABLE IF NOT EXISTS monthly_floor_occupancy (
//         id int(11) AUTO_INCREMENT,
//         floor_id varchar(36) NOT NULL,
//         occupancy json NOT NULL,
//         avg_occupancy int(4) DEFAULT NULL,
//         created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         PRIMARY KEY (id),
//         CONSTRAINT fk_occupancy_floor_month FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE ON UPDATE CASCADE
//       )`,
//   error => {
//     if (error) {
//       logger.error(error.message);
//       return;
//     }
//     logger.info(`Monthly Occupancy for Floor Table Successfully Created`);
//   }
// );

// connection.query(
//   `CREATE TABLE IF NOT EXISTS monthly_building_occupancy (
//         id int(11) AUTO_INCREMENT,
//         building_id varchar(36) NOT NULL,
//         occupancy json NOT NULL,
//         avg_occupancy int(4) DEFAULT NULL,
//         created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         PRIMARY KEY (id),
//         CONSTRAINT fk_occupancy_building_month FOREIGN KEY (building_id) REFERENCES building (id) ON DELETE CASCADE ON UPDATE CASCADE
//       )`,
//   error => {
//     if (error) {
//       logger.error(error.message);
//       return;
//     }
//     logger.info(`Monthly Occupancy for Building Table Successfully Created`);
//   }
// );

connection.end();