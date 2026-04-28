const mysql = require('mysql');
const uuid = require('uuid');
const logger = require('../Config/logger');
const config = require('../Config/common').mysql;
const org_id=uuid()
const campus_id=uuid()
const building_id=uuid()
const floor_id=uuid()
const zone_id=uuid()
const area_id=uuid()
const server_id=uuid()
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
    `CREATE TABLE organization (
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
      logger.info(`organization table Successfully created`);
    }
);

connection.query(
    `INSERT INTO organization VALUES ('${org_id}','Graylinx_Infor','2023-02-13 06:37:52','2023-02-13 06:37:52');
    `,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`organization data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE campus (
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
      logger.info(`campus Table Successfully Created`);
    }
);
connection.query(
    `INSERT INTO campus VALUES ('${campus_id}','Infor_Campus','2023-02-13 06:37:53','2023-02-13 06:37:53','${org_id}');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Campus data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE building (
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
    `INSERT INTO building VALUES ('${building_id}','Infor_Building_1','2021-10-20 15:12:07','2021-10-20 15:12:07','${campus_id}');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Building data successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE floor (
        id varchar(36) NOT NULL,
        name varchar(120) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        building_id varchar(36) NOT NULL,
        type varchar(9) DEFAULT NULL,
        floor_number int DEFAULT NULL,
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
      logger.info(`floor Table Successfully Created`);
    }
);

connection.query(
    `INSERT INTO floor VALUES ('${floor_id}','GVFloor-01','2023-02-13 06:37:53','2023-02-13 06:37:53','${building_id}',NULL,NULL);`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`floor Table data Successfully inserted`);
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
      logger.info(`zone table Successfully created`);
    }
);

connection.query(
    `INSERT INTO zone VALUES ('${zone_id}','conf_area','2022-03-24 00:57:28','2023-08-01 07:07:24','${floor_id}')`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`zone table Successfully created`);
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
    `INSERT INTO area VALUES ('${area_id}','firmware_area','2022-03-24 01:03:32','2022-09-22 07:28:32','${zone_id}')`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Area Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE daily_building_occupancy (
        id int NOT NULL AUTO_INCREMENT,
        building_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_occupancy_building_day (building_id),
        CONSTRAINT fk_occupancy_building_day FOREIGN KEY (building_id) REFERENCES building (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`daily_building_occupancy Table Successfully Created`);
    }
);
connection.query(
    `CREATE TABLE daily_floor_occupancy (
        id int NOT NULL AUTO_INCREMENT,
        floor_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_occupancy_floor_day (floor_id),
        CONSTRAINT fk_occupancy_floor_day FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`daily_floor_occupancy Table Successfully Created`);
    }
);
connection.query(
    `CREATE TABLE daily_zone_occupancy (
        id int NOT NULL AUTO_INCREMENT,
        zone_id varchar(36) NOT NULL,
        occupancy json NOT NULL,
        avg_occupancy int DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY fk_occupancy_zone_day (zone_id),
        CONSTRAINT fk_occupancy_zone_day FOREIGN KEY (zone_id) REFERENCES zone (id) ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`daily_zone_occupancy Table Successfully Created`);
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
connection.query(
    `INSERT INTO device VALUES ('05b2117b-dec5-4fba-822f-855f93408a9c','conf_slave_3','dali_slave','50d1015ccf01f003','2022-03-24 01:48:32','2022-03-24 01:48:32','${area_id}',NULL,NULL,NULL);`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Device data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE device_status (
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
      logger.info(`device_status Table Successfully Created`);
    }
);

connection.query(
    `CREATE TABLE event (
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
      logger.info(`event Table Successfully Created`);
    }
);


connection.query(
    `CREATE TABLE gateway (
        id varchar(36) NOT NULL,
        name varchar(120) NOT NULL,
        ip varchar(16) NOT NULL,
        status tinyint(1) DEFAULT '1',
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
      logger.info(`gateway Table Successfully Created`);
    }
);

connection.query(
    `INSERT INTO gateway VALUES ('1210a6c4-3054-11ee-bd90-9829a659bcfc','office_work_station','192.168.1.132',1,'2023-08-01 10:13:33','2023-08-01 10:23:42');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gateway data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gateway_mapping (
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
      logger.info(`gateway_mapping Table Successfully Created`);
    }
);

connection.query(
    `INSERT INTO gateway_mapping VALUES ('${zone_id}','1210a6c4-3054-11ee-bd90-9829a659bcfc','2023-08-01 10:18:30','2023-08-01 10:18:30');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gateway_mapping data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gl_access (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        access_name varchar(100) NOT NULL,
        is_active tinyint(1) DEFAULT '1',
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_access table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_all_type (
        id int NOT NULL AUTO_INCREMENT,
        type varchar(256) DEFAULT NULL,
        name varchar(256) DEFAULT NULL,
        tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        referring_table varchar(256) DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY type (type)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_all_type table Successfully created`);
    }
);

connection.query(
  `INSERT INTO gl_all_type VALUES (1,'GL_LOCATION_TYPE_SEAT',NULL,NULL,NULL,'GL_LOCATION'),(2,'GL_LOCATION_SEAT_GROUP',NULL,NULL,NULL,'GL_LOCATION'),(3,'GL_LOCATION_TYPE_ROOM',NULL,NULL,NULL,'GL_LOCATION'),(4,'GL_LOCATION_TYPE_ZONE',NULL,NULL,NULL,'GL_LOCATION'),(5,'GL_LOCATION_TYPE_FLOOR',NULL,NULL,NULL,'GL_LOCATION'),(6,'GL_LOCATION_TYPE_BUILDING',NULL,NULL,NULL,'GL_LOCATION'),(7,'GL_LOCATION_TYPE_CAMPUS',NULL,NULL,NULL,'GL_LOCATION'),(8,'GL_LOCATION_TYPE_ORGANIZATION',NULL,NULL,NULL,'GL_LOCATION'),(9,'GL_SS_THLSENSOR_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(10,'GL_SS_WAC_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(11,'GL_SS_GATEWAY_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(12,'GL_SS_WPIR_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(13,'GL_SS_REPEATER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(14,'GL_SS_DALI_MASTER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(15,'GL_SS_DALI_SLAVE_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(16,'GL_SS_OTHER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(17,'NONGL_SS_VAV',NULL,NULL,NULL,'GL_Subsystem'),(18,'NONGL_SS_AHU',NULL,NULL,NULL,'GL_Subsystem'),(19,'GL_SS_OTHER_ENERGYMETER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(20,'NONGL_SS_ENERGYMETER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(21,'GL_SS_ADDRESS_IP',NULL,NULL,NULL,'GL_Subsystem'),(22,'GL_SS_ADDRESS_MAC',NULL,NULL,NULL,'GL_Subsystem'),(23,'GL_SS_ADDRESS_OTHER',NULL,NULL,NULL,'GL_Subsystem'),(24,'GL_UNIT_DEG_CENTIGRADE',NULL,NULL,NULL,'GL_Parameter'),(25,'GL_UNIT_PERCENT',NULL,NULL,NULL,'GL_Parameter'),(26,'GL_UNIT_LUMEN',NULL,NULL,NULL,'GL_Parameter'),(27,'GL_UNIT_MEGABYTES',NULL,NULL,NULL,'GL_Parameter'),(28,'GL_UNIT_TRUE_FALSE',NULL,NULL,NULL,'GL_Parameter'),(29,'GL_UNIT_KILO_WATT_HOUR',NULL,NULL,NULL,'GL_Parameter'),(30,'GL_UNIT_TIME_SECONDS',NULL,NULL,NULL,'GL_Parameter'),(31,'GL_UNIT_STRING',NULL,NULL,NULL,'GL_Parameter'),(32,'GL_UNIT_COUNT',NULL,NULL,NULL,'GL_Parameter'),(33,'GL_UNIT_RPM',NULL,NULL,NULL,'GL_Parameter'),(34,'GL_UNIT_CFM',NULL,NULL,NULL,'GL_Parameter'),(35,'GL_UNIT_PSI',NULL,NULL,NULL,'GL_Parameter'),(36,'NONGL_SS_DAMPER',NULL,NULL,NULL,'GL_Subsystem'),(37,'GL_SS_ADDRESS_BACNET_ID',NULL,NULL,NULL,'GL_Subsystem'),(38,'GL_SS_ADDRESS_BACNET_DDC',NULL,NULL,NULL,'GL_Subsystem'),(39,'GL_SS_ADDRESS_BACNET_DEVICE_ID',NULL,NULL,NULL,'GL_Subsystem'),(40,'GL_EVENT_CATEGORY_USER_INPUT',NULL,NULL,'Set','GL_IBMS_EVENT'),(41,'GL_EVENT_CATEGORY_MEASURED',NULL,NULL,'Measured','GL_IBMS_EVENT'),(42,'GL_EVENT_CATEGORY_USER_LOGIN',NULL,NULL,NULL,'GL_IBMS_EVENT'),(43,'GL_EVENT_CATEGORY_USER_LOGOUT',NULL,NULL,NULL,'GL_IBMS_EVENT'),(44,'GL_EVENT_CATEGORY_SYSTEM_INPUT',NULL,NULL,NULL,'GL_IBMS_EVENT'),(45,'GL_EVENT_CRITICALITY_HIGH',NULL,NULL,'High','GL_IBMS_EVENT'),(46,'GL_EVENT_CRITICALITY_MEDIUM',NULL,NULL,'Medium','GL_IBMS_EVENT'),(47,'GL_EVENT_CRITICALITY_LOW',NULL,NULL,'Low','GL_IBMS_EVENT'),(48,'GL_EVENT_STATUS_OPEN',NULL,NULL,NULL,'GL_IBMS_EVENT'),(49,'GL_EVENT_STATUS_CLOSE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(50,'GL_SS_STATUS_ACTIVE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(51,'GL_SS_STATUS_INACTIVE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(52,'GL_EVENT_SHOW',NULL,NULL,NULL,'GL_IBMS_EVENT'),(53,'GL_EVENT_HIDE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(54,'GL_RECORD_STATUS_ACTIVE',NULL,NULL,NULL,'ALL_TABLES'),(55,'GL_RECORD_STATUS_INACTIVE',NULL,NULL,NULL,'ALL_TABLES'),(56,'GL_UNIT_PPM',NULL,NULL,NULL,'GL_PARAMETER'),(57,'NONGL_SS_UPS',NULL,NULL,NULL,'GL_SUBSYSTEM'),(58,'NONGL_SS_EMS',NULL,'TYPE_01',NULL,'GL_SUBSYSTEM'),(59,'GL_UNIT_AMPERE',NULL,NULL,NULL,'GL_PARAMETER'),(60,'GL_UNIT_VOLTS',NULL,NULL,NULL,'GL_PARAMETER'),(61,'GL_UNIT_HERTZ',NULL,NULL,NULL,'GL_PARAMETER'),(62,'GL_UNIT_KILO_WATT',NULL,NULL,NULL,'GL_PARAMETER'),(63,'GL_KILOVOLT_AMPS_REACTIVE',NULL,NULL,NULL,'GL_PARAMETER'),(64,'GL_SS_DAG',NULL,NULL,NULL,'GL_SUBSYSTEM'),(65,'GL_UNIT_GPM',NULL,NULL,NULL,'gl_parameter'),(66,'GL_SS_SERVER',NULL,NULL,NULL,'GL_Subsystem'),(67,'GL_SS_ADDRESS_DDC',NULL,NULL,NULL,'GL_SUBSYSTEM'),(68,'GL_WEATHER_SERVICE',NULL,NULL,NULL,'GL_Subsystem'),(70,'NONGL_SS_PUMPS',NULL,NULL,NULL,'gl_subsystem'),(71,'NONGL_SS_SECONDARY_PUMPS',NULL,NULL,NULL,'GL_Subsystem'),(72,'NONGL_SS_CHILLER',NULL,NULL,NULL,'gl_subsystem'),(73,'NONGL_SS_CONDENSER_PUMPS','','','','gl_subsystem'),(74,'NONGL_SS_COOLING_TOWER','','','','gl_subsystem'),(75,'NONGL_SS_COOLING_TOWER_FAN','','','','gl_subsystem'),(76,'NONGL_SS_AIR_COOLED_CHILLER','','','','gl_subsystem'),(77,'NONGL_SS_PRIMARY_VARIABLE_PUMPS','','','','gl_subsystem'),(78,'NONGL_SS_CPM','','','','gl_subsystem'),(79,'NONGL_SS_DPT_DEVICE','','','','gl_subsystem'),(80,'FRESH_AIR_UNIT', 'FAU', 'FAU', 'Fresh Air Unit','gl_subsystem'),(81,'NONGL_SS_COMMON_HEADER', 'COMMON_HEADER', 'COMMON_HEADER', 'Common Header','gl_subsystem'),(82,'NONGL_SS_WATER_COOLED_HEADER', 'WATER_COOLED_HEADER', 'WATER_COOLED_HEADER', 'Water Cooled Header','gl_subsystem'),(83,'NONGL_SS_AIR_COOLED_HEADER', 'AIR_COOLED_HEADER', 'AIR_COOLED_HEADER', 'Air Cooled Header','gl_subsystem');`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`gl_all_type data Successfully inserted`);
  }
);

connection.query(
    `CREATE TABLE gl_subsystem (
        id varchar(36) NOT NULL DEFAULT 'qw',
        name varchar(256) DEFAULT NULL,
        ss_tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        ss_type varchar(256) DEFAULT NULL,
        ss_shape enum('rect','circle','poly','GL_ZONE_SHAPE_DEFAULT') DEFAULT 'rect',
        ss_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        ss_address_type varchar(256) DEFAULT NULL,
        ss_address_value varchar(1024) DEFAULT NULL,
        ss_parent varchar(36) DEFAULT NULL,
        coordinates varchar(1024) DEFAULT '[0,0]',
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_type (ss_type),
        KEY ss_address_type (ss_address_type),
        CONSTRAINT gl_subsystem_ibfk_1 FOREIGN KEY (ss_type) REFERENCES gl_all_type (type),
        CONSTRAINT gl_subsystem_ibfk_2 FOREIGN KEY (ss_address_type) REFERENCES gl_all_type (type)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem table Successfully created`);
    }
);

connection.query(
    `INSERT INTO gl_subsystem VALUES ('${server_id}','GL_SERVER ',NULL,NULL,'GL_SS_SERVER','rect','GL_SS_STATUS_ACTIVE','GL_SS_ADDRESS_IP','192.168.0.102',NULL,NULL,'2023-11-06 11:29:49','2023-11-06 11:29:49'),('${uuid()}','DDC1','2001','AHU-1','GL_SS_ADDRESS_BACNET_DDC','rect','GL_SS_STATUS_ACTIVE','GL_SS_ADDRESS_IP','192.168.1.22:2001',NULL,'[345,457]','2023-12-19 11:29:51','2024-05-28 10:14:33');
    `,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gl_alarm (
        id int NOT NULL AUTO_INCREMENT,
        validate tinyint(1) DEFAULT '0',
        ss_id varchar(36) DEFAULT NULL,
        alarm_code varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        message text,
        acknowledged tinyint(1) DEFAULT '0',
        acknowledged_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        restore tinyint(1) DEFAULT '0',
        restored_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        delete_alarm tinyint(1) DEFAULT '0',
        deleted_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) DEFAULT NULL,
        possible_causes text,
        name varchar(36) DEFAULT NULL,
        tag varchar(36) DEFAULT NULL,
        description varchar(36) DEFAULT NULL,
        source varchar(36) DEFAULT NULL,
        technician_feedback text,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        CONSTRAINT gl_alarm_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_alarm table Successfully created`);
    }
);



connection.query(
    `CREATE TABLE gl_ibms_event (
        id int NOT NULL AUTO_INCREMENT,
        category varchar(36) NOT NULL,
        ss_id varchar(36) DEFAULT NULL,
        event_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        description varchar(36) DEFAULT NULL,
        triggering_user varchar(36) DEFAULT NULL,
        alarm_id varchar(36) DEFAULT 'NO_ALARM',
        criticality varchar(36) DEFAULT 'GL_EVENT_CRITICALITY_LOW',
        open_close varchar(36) DEFAULT 'GL_EVENT_STATUS_OPEN',
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_ibms_event table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_location (
        id varchar(36) NOT NULL DEFAULT 'qw',
        name varchar(256) DEFAULT NULL,
        zone_tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        zone_shape enum('rect','circle','poly','GL_LOCATION_SHAPE_DEFAULT') DEFAULT 'rect',
        zone_type varchar(256) DEFAULT NULL,
        zone_status enum('GL_LOCATION_STATUS_ACTIVE','GL_LOCATION_STATUS_INACTIVE') DEFAULT 'GL_LOCATION_STATUS_ACTIVE',
        zone_parent varchar(36) DEFAULT NULL,
        coordinates varchar(1024) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY zone_type (zone_type),
        CONSTRAINT gl_location_ibfk_1 FOREIGN KEY (zone_type) REFERENCES gl_all_type (type)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location table Successfully created`);
    }
);

connection.query(
    `INSERT INTO gl_location VALUES ('${org_id}','Graylinx',NULL,NULL,'rect','GL_LOCATION_TYPE_ORGANIZATION','GL_LOCATION_STATUS_ACTIVE',NULL,NULL,'2023-02-13 06:37:53','2023-02-13 06:37:53'),('${campus_id}','Graylinx_Campus',NULL,NULL,'rect','GL_LOCATION_TYPE_CAMPUS','GL_LOCATION_STATUS_ACTIVE','${org_id}',NULL,'2023-02-13 06:37:53','2023-02-13 06:37:53'),('${building_id}','Graylinx Vision Building',NULL,NULL,'rect','GL_LOCATION_TYPE_BUILDING','GL_LOCATION_STATUS_ACTIVE','${campus_id}',NULL,'2023-02-13 06:37:53','2023-02-13 06:37:53'),('${floor_id}','GVFloor-01',NULL,NULL,'rect','GL_LOCATION_TYPE_FLOOR','GL_LOCATION_STATUS_ACTIVE','${building_id}',NULL,'2023-02-13 06:37:53','2023-02-13 06:37:53'),('${zone_id}','GVZone-01',NULL,NULL,'rect','GL_LOCATION_TYPE_ZONE','GL_LOCATION_STATUS_ACTIVE','${floor_id}','[[373.67,-18.43],[373.67,264.61],[216.42,264.61],[216.42,-18.43]]','2023-06-02 09:49:15','2023-09-19 04:21:47');`,
    error => {  
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gl_parameter (
        id varchar(256) NOT NULL,
        name varchar(256) DEFAULT NULL,
        tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        unit varchar(256) DEFAULT NULL,
        unit_display varchar(64) DEFAULT NULL,
        UNIQUE KEY id (id),
        KEY unit (unit),
        CONSTRAINT gl_parameter_ibfk_1 FOREIGN KEY (unit) REFERENCES gl_all_type (type)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_parameter table Successfully created`);
    }
);

connection.query(
    `INSERT INTO gl_parameter VALUES ('Act_Enrg_G','Active Energy, Generator','Act_Enrg_G',NULL,NULL,'Wh'),('Act_Enrg_U','Active Energy, Utility','Act_Enrg_U',NULL,NULL,'Wh'),('Act_Pwr_Ph1','Active Power, Phase 1','Act_Pwr_Ph1',NULL,NULL,'W'),('Act_Pwr_Ph2','Active Power, Phase 2','Act_Pwr_Ph2',NULL,NULL,'W'),('Act_Pwr_Ph3','Active Power, Phase 3','Act_Pwr_Ph3',NULL,NULL,'W'),('Act_Pwr_Ttl','Active Power, Total','Act_Pwr_Ttl',NULL,NULL,'W'),('ahu_automanual_status',NULL,'ahu_automanual_status',NULL,'GL_UNIT_STRING',NULL),('ahu_chill_water_temperature',NULL,'ahu_chill_water_temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_chilled_valve',NULL,'ChW%',NULL,'GL_UNIT_PERCENT','%'),('ahu_chilled_valve_sp',NULL,'ahu_chilled_valve_sp',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_chilled_water_valve_status',NULL,'ahu_chilled_water_valve_status',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_choke',NULL,'ahu_choke',NULL,'GL_UNIT_TRUE_FALSE',NULL),('ahu_command_on_off',NULL,'ahu_command_on_off',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_filter_status',NULL,'ahu_filter_status',NULL,'GL_UNIT_TRUE_FALSE',NULL),('ahu_in_air_temperature',NULL,'RAT',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_in_air_temperature_sp',NULL,'ahu_in_air_temperature_sp',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_mode_status',NULL,'ahu_mode_status',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('AHU_On_Off','AHU ON/OFF Command','AHU_On_Off',NULL,'GL_UNIT_STRING',NULL),('ahu_out_air_temperature',NULL,'OAT',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_ra_temperature',NULL,'ahu_ra_temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_run_status',NULL,'ahu_run_status',NULL,'GL_UNIT_STRING',NULL),('ahu_sa_temperature',NULL,'ahu_sa_temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_set_point',NULL,'Temperature_SP',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_status_multistate',NULL,'ahu_status_multistate',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_suply_air_temperature_sp',NULL,'ahu_suply_air_temperature_sp',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('ahu_supply_air_temperature',NULL,'ahu_supply_air_temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_trip_status',NULL,'ahu_trip_status',NULL,'GL_UNIT_STRING',NULL),('ahu_vfd_mode',NULL,'VFD',NULL,'GL_UNIT_VOLTS','V'),('air_temperature',NULL,'air_temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('air_volume',NULL,'Volume',NULL,'GL_UNIT_CFM','cfm'),('Alarm1',NULL,'Alarm1',NULL,NULL,NULL),('Alarm2',NULL,'Alarm2',NULL,NULL,NULL),('Apprnt_Enrg','Apparent Energy, Utility','Apprnt_Enrg',NULL,NULL,'VAh'),('Apprnt_Enrg_U','Apparent Energy, Generator','Apprnt_Enrg_U',NULL,NULL,'VAh'),('Aprnt_Pwr_Ph1','Apparent Power, Phase 1','Aprnt_Pwr_Ph1',NULL,NULL,'VA'),('Aprnt_Pwr_Ph2','Apparent Power, Phase 2','Aprnt_Pwr_Ph2',NULL,NULL,'VA'),('Aprnt_Pwr_Ph3','Apparent Power, Phase 3','Aprnt_Pwr_Ph3',NULL,NULL,'VA'),('Aprnt_Pwr_Ttl','Apparent Power, Total','Aprnt_Pwr_Ttl',NULL,NULL,'VA'),('Auto / Manual Status',NULL,'Auto / Manual Status',NULL,'GL_UNIT_STRING',NULL),('Avg_Ld_Percntg','Average Load Percentage','Avg_Ld_Percntg',NULL,NULL,'%Avg Load'),('battery',NULL,'battery',NULL,'GL_UNIT_PERCENT','%'),('batteryCrossedLcl',NULL,'batteryCrossedLcl','batterlow','GL_UNIT_PERCENT','%'),('CH_AM_SS','Chiller Auto/Manual Status',NULL,NULL,NULL,NULL),('CH_On_Off','Chiller On/Off Command',NULL,NULL,NULL,NULL),('CH_SS','CH_On_Off Status',NULL,NULL,NULL,NULL),('CH_Trip_SS','Chiller Trip Status',NULL,NULL,NULL,NULL),('CH_Vlv_On_Off','Chilled Water ButterFly Valve ON/OFF',NULL,NULL,NULL,NULL),('CH_Vlv_SS','Chilled Water ButterFly Valve ON/OFF Status',NULL,NULL,NULL,NULL),('channel1level',NULL,'channel1level',NULL,'GL_UNIT_PERCENT','%'),('channel1mode',NULL,'channel1mode',NULL,'GL_UNIT_STRING',NULL),('channel2level',NULL,'channel2level',NULL,'GL_UNIT_PERCENT','%'),('channel2mode',NULL,'channel2mode',NULL,'GL_UNIT_STRING',NULL),('channel3level',NULL,'channel3level',NULL,'GL_UNIT_PERCENT','%'),('channel3mode',NULL,'channel3mode',NULL,'GL_UNIT_STRING',NULL),('channel4level',NULL,'channel4level',NULL,'GL_UNIT_PERCENT','%'),('channel4mode',NULL,'channel4mode',NULL,'GL_UNIT_STRING',NULL),('chill_water_valve',NULL,'chill_water_valve',NULL,'GL_UNIT_PERCENT','%'),('Chilled Water Valve Feedback',NULL,'Chilled Water Valve Feedback',NULL,'GL_UNIT_PERCENT','%'),('chilled_valve_high',NULL,'chilled_valve_high',NULL,'GL_UNIT_PERCENT','%'),('chilled_valve_low',NULL,'chilled_valve_low',NULL,'GL_UNIT_PERCENT','%'),('chilled_water_temp_high',NULL,'chilled_water_temp_high',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('chilled_water_temp_low',NULL,'chilled_water_temp_low',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('CHW_Flow','Chilled Water - Flow Meter - Flow','CHW_Flow',NULL,'GL_UNIT_GPM',NULL),('CHW_Flow_SS','Chiller Water Flow Status',NULL,NULL,NULL,NULL),('CHW_Pre','Chilled Water - Coil Supply Pressure','CHW_Pre',NULL,'GL_UNIT_PSI',NULL),('CHW_RT','Chilled Water - Return Temperature','CHW_RT',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('CHW_ST','Chilled Water - Supply Temperature','CHW_ST',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('CHW_Vlv_Pos','Chilled Water Valve - Position','CHW_Vlv_Pos',NULL,'GL_UNIT_PERCENT',NULL),('CHW_Vlv_Pos_SP','Chilled Water Valve - Position - Setpoint','CHW_Vlv_Pos_SP',NULL,'GL_UNIT_PERCENT',NULL),('CndW_HRT','Condenser Water Header Return Temperature',NULL,NULL,NULL,NULL),('CndW_HST','Condenser Water Header Supply Temperature',NULL,NULL,NULL,NULL),('CO2',NULL,'CO2',NULL,'GL_UNIT_PPM','ppm'),('consumption',NULL,'consumption',NULL,'GL_UNIT_KILO_WATT_HOUR','Unit'),('Cur_Avg','Current, Average','Cur_Avg',NULL,NULL,'mA'),('Cur_Ph1','Current, Phase 1','Cur_Ph1',NULL,NULL,'mA'),('Cur_Ph2','Current, Phase 2','Cur_Ph2',NULL,NULL,'mA'),('Cur_Ph3','Current, Phase 3','Cur_Ph3',NULL,NULL,'mA'),('CWH_RT','Chiller Water Header Return Temperature',NULL,NULL,NULL,NULL),('CWH_RT_SP','Chiller Water Header Return Temperature Setpoint',NULL,NULL,NULL,NULL),('CWH_ST','Chiller Water Header Supply Temperature',NULL,NULL,NULL,NULL),('CWH_ST_SP','Chiller Water Header Supply Temperature Setpoint',NULL,NULL,NULL,NULL),('damper_position',NULL,'Position',NULL,'GL_UNIT_PERCENT','%'),('DPS_Filter','DPS across Filter','DPS_Filter',NULL,'GL_UNIT_PSI',NULL),('DPS_RAF_SS','Return Air Fan - Status (DP Switch across RAF)','DPS_RAF_SS',NULL,NULL,NULL),('DPS_SAF_SS','DPS across Supply Air Fan - Status (DPS across SAF)','DPS_SAF_SS',NULL,'GL_UNIT_STRING',NULL),('DSP','Duct Static Pressure','DSP',NULL,'GL_UNIT_PSI',NULL),('DSP_SP','Duct Static Pressure - Setpoint','DSP_SP',NULL,'GL_UNIT_PSI',NULL),('EA_Dmpr_Pos','Exhaust Air Damper - Position','EA_Dmpr_Pos',NULL,'GL_UNIT_PERCENT',NULL),('EA_Dmpr_Pos_SP','Exhaust Air Damper - Position - Command / Setpoint','EA_Dmpr_Pos_SP',NULL,'GL_UNIT_PERCENT',NULL),('em_activePowerPhase1',NULL,'000f',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerPhase2',NULL,'0010',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerPhase3',NULL,'0011',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerTotal',NULL,'000e',NULL,'GL_UNIT_KILO_WATT','KW'),('em_apparentPowerPhase1',NULL,'0017',NULL,NULL,NULL),('em_apparentPowerPhase2',NULL,'0018',NULL,NULL,NULL),('em_apparentPowerPhase3',NULL,'0019',NULL,NULL,NULL),('em_apparentPowerTotal',NULL,'0016',NULL,NULL,NULL),('em_currentAverage',NULL,'0001',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase1',NULL,'0002',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase2',NULL,'0003',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase3',NULL,'0004',NULL,'GL_UNIT_AMPERE','A'),('em_forwardActiveEnergy',NULL,'001f',NULL,NULL,NULL),('em_forwardApparentEnergy',NULL,'001e',NULL,NULL,NULL),('em_forwardReactiveEnergy',NULL,'0020',NULL,NULL,NULL),('em_Frequency',NULL,'000d',NULL,'GL_UNIT_HERTZ','HZ'),('em_max_DM_occurrence_time_U',NULL,'0029',NULL,NULL,NULL),('em_MAX_MD_U',NULL,'0028',NULL,NULL,NULL),('em_maximumDemand',NULL,'0027',NULL,NULL,NULL),('em_meterID',NULL,'0024',NULL,NULL,NULL),('em_meterOnline_Status',NULL,'0022',NULL,NULL,NULL),('em_powerFactorPhase1',NULL,'001b',NULL,NULL,NULL),('em_powerFactorPhase2',NULL,'001c',NULL,NULL,NULL),('em_powerFactorPhase3',NULL,'001d',NULL,NULL,NULL),('em_powerFactorTotal',NULL,'001a',NULL,NULL,NULL),('em_presentDemand',NULL,'0027',NULL,NULL,NULL),('em_reactivePowerPhase1',NULL,'0013',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerPhase2',NULL,'0014',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerPhase3',NULL,'0015',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerTotal',NULL,'0012',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_risingDemand',NULL,'0026',NULL,NULL,NULL),('em_volatage_LL_average',NULL,'0005',NULL,'GL_UNIT_VOLTS','V'),('em_volatage_LN_average',NULL,'0009',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_1_2',NULL,'0006',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_2_3',NULL,'0007',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_3_1',NULL,'0008',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_1_2',NULL,'000a',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_2_3',NULL,'000b',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_3_1',NULL,'000c',NULL,'GL_UNIT_VOLTS','V'),('fan_motor_speed',NULL,'fan_motor_speed',NULL,'GL_UNIT_RPM','rpm'),('Fire_Sensor','Fire sensor','Fire_Sensor',NULL,'GL_UNIT_STRING',NULL),('Freq','Frequency','Freq',NULL,NULL,'Hz'),('Fwd_Act_Enrg','Forward Active Energy','Fwd_Act_Enrg',NULL,NULL,'Wh'),('Fwd_Aprnt_Enrg','Forward Apparent Energy','Fwd_Aprnt_Enrg',NULL,NULL,'VAh'),('Fwd_React_Enrg','Forward Reactive Energy','Fwd_React_Enrg',NULL,NULL,'VARh'),('Fwd_Run _Secs','Forward Run Seconds','Fwd_Run _Secs',NULL,NULL,'Seconds'),('health',NULL,'health',NULL,'GL_UNIT_STRING',NULL),('humidity',NULL,'humidity',NULL,'GL_UNIT_PERCENT','%'),('humidityCrossedLcl',NULL,'humidity','dry','GL_UNIT_PERCENT','%'),('humidityCrossedUcl',NULL,'humidity','humid','GL_UNIT_PERCENT','%'),('input_freq','Input Frequency','input_freq',NULL,NULL,NULL),('input_ph_volt_A','Input Phase Voltage-A','input_ph_volt_A',NULL,NULL,NULL),('input_ph_volt_B','Input Phase Voltage-B','input_ph_volt_B',NULL,NULL,NULL),('input_ph_volt_C','Input Phase Voltage-C','input_ph_volt_C',NULL,NULL,NULL),('is_event',NULL,'is_event',NULL,'GL_UNIT_TRUE_FALSE',NULL),('kW','kilo Watt','kW',NULL,NULL,NULL),('lastCmdFrom',NULL,'lastCmdFrom',NULL,'GL_UNIT_STRING',NULL),('light_level',NULL,'light_level',NULL,'GL_UNIT_PERCENT','%'),('lqi',NULL,'lqi',NULL,'GL_UNIT_STRING',NULL),('luminousity',NULL,'luminousity',NULL,'GL_UNIT_LUMEN','Lumen'),('luminousityCrossedLcl',NULL,'luminousity','dark','GL_UNIT_LUMEN','Lumen'),('luminousityCrossedUcl',NULL,'luminousity','bright','GL_UNIT_LUMEN','Lumen'),('MARH','Mixed Air Relative Humidity','MARH',NULL,'GL_UNIT_PERCENT',NULL),('MAT','Mixed Air Temperature','MAT',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('Max_Dmd_Occ_Time_U','Maximum Demand Occurrence Time, Utility','Max_Dmd_Occ_Time_U',NULL,NULL,'Max DM Occurence Time U'),('Max_Dmd_U','Maximum Demand, Utility','Max_Dmd_U',NULL,NULL,'Max MD U'),('mode',NULL,'mode',NULL,'GL_UNIT_STRING',NULL),('NO_ALARM','NoAlarm','','Used to Handle No Alarm Events',NULL,NULL),('No_Inp_Volt_Intr','Number of Input Voltage Interruptions','No_Inp_Volt_Intr',NULL,NULL,'Intr'),('noOfLightConnected',NULL,'noOfLightConnected',NULL,'GL_UNIT_COUNT',NULL),('noOfPirConnected',NULL,'noOfPirConnected',NULL,'GL_UNIT_COUNT',NULL),('noOfThlConnected',NULL,'noOfThlConnected',NULL,'GL_UNIT_COUNT',NULL),('OA_Dmpr_Pos','Outside Air Damper - Position','OA_Dmpr_Pos',NULL,'GL_UNIT_PERCENT',NULL),('OA_Dmpr_Pos_SP','Outside Air Damper - Position - Command / Setpoint','OA_Dmpr_Pos_SP',NULL,'GL_UNIT_PERCENT',NULL),('OARH','Outside Air Relative Humidity','OARH',NULL,'GL_UNIT_PERCENT',NULL),('OAT','Outside Air Temperature','OAT',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('occupancy',NULL,'occupancy',NULL,'GL_UNIT_TRUE_FALSE',NULL),('On _Secs','ON Seconds','On _Secs',NULL,NULL,'Seconds'),('On_Hr_G','On Hours, Generator','On_Hr_G',NULL,NULL,'Hours'),('On_Hr_U','On Hours, Utility','On_Hr_U',NULL,NULL,'Hours'),('out_air_valve',NULL,'out_air_valve',NULL,'GL_UNIT_PERCENT','%'),('out_freqphase_A','Output Frequeny Phase-A','out_freqphase_A',NULL,NULL,NULL),('out_freqphase_B','Output Frequeny Phase-B','out_freqphase_B',NULL,NULL,NULL),('out_freqphase_C','Output Frequeny Phase-C','out_freqphase_C',NULL,NULL,NULL),('output_ph_curr_A','Output Phase current-A','output_ph_curr_A',NULL,NULL,NULL),('output_ph_curr_B','Output Phase current-B','output_ph_curr_B',NULL,NULL,NULL),('output_ph_curr_C','Output Phase current-C','output_ph_curr_C',NULL,NULL,NULL),('output_ph_volt_A','Output Phase voltage-A','output_ph_volt_A',NULL,NULL,NULL),('output_ph_volt_B','Output Phase voltage-B','output_ph_volt_B',NULL,NULL,NULL),('output_ph_volt_C','Output Phase voltage-C','output_ph_volt_C',NULL,NULL,NULL),('parentAddress',NULL,'parentAddress',NULL,'GL_UNIT_STRING',NULL),('PF_Ph1','Power Factor, Phase 1','PF_Ph1',NULL,NULL,'VA'),('PF_Ph2','Power Factor, Phase 2','PF_Ph2',NULL,NULL,'VA'),('PF_Ph3','Power Factor, Phase 3','PF_Ph3',NULL,NULL,'VA'),('PF_Ttl','Power Factor, Total','PF_Ttl',NULL,NULL,'VA'),('ph_A_Out_acti_Pow','Phase A Output ative power','ph_A_Out_acti_Pow',NULL,NULL,NULL),('ph_B_Out_acti_Pow','Phase B Output active power','ph_B_Out_acti_Pow',NULL,NULL,NULL),('ph_C_Out_acti_Pow','Phase C Output active power','ph_C_Out_acti_Pow',NULL,NULL,NULL),('Ph1_Ld%','Percentage of Phase 1 Load','Ph1_Ld%',NULL,NULL,'%L1'),('Ph2_Ld%','Percentage of Phase 2 Load','Ph2_Ld%',NULL,NULL,'%L2'),('Ph3_Ld%','Percentage of Phase  Load','Ph3_Ld%',NULL,NULL,'%L3'),('Pri_Pmp_AM_SS','Primary Pump Auto/Manual Status',NULL,NULL,NULL,NULL),('Pri_Pmp_On_Off','Primary Pump On/Off Command',NULL,NULL,NULL,NULL),('Pri_Pmp_SS','Primary Pump On/Off Status',NULL,NULL,NULL,NULL),('Pri_Pmp_Trip_SS','Primary Pump Trip Status',NULL,NULL,NULL,NULL),('Prsnt_Dmd','Present Demand','Prsnt_Dmd',NULL,NULL,'Present Demand'),('RA_Dmpr_Pos','Return Air Damper - Position','RA_Dmpr_Pos',NULL,'GL_UNIT_PERCENT',NULL),('RA_Dmpr_Pos_SP','Return Air Damper - Position - Command / Setpoint','RA_Dmpr_Pos_SP',NULL,'GL_UNIT_PERCENT',NULL),('RAF_Amps_A','Return Air Fan - Current - Phase A','RAF_Amps_A',NULL,'GL_UNIT_AMPERE',NULL),('RAF_Amps_B','Return Air Fan - Current - Phase B','RAF_Amps_B',NULL,'GL_UNIT_AMPERE',NULL),('RAF_Amps_C','Return Air Fan - Current - Phase C','RAF_Amps_C',NULL,'GL_UNIT_AMPERE',NULL),('RAF_PF_A','Return Air Fan - Power Factor - Phase A','RAF_PF_A',NULL,'GL_UNIT_PERCENT',NULL),('RAF_PF_B','Return Air Fan - Power Factor - Phase B','RAF_PF_B',NULL,'GL_UNIT_PERCENT',NULL),('RAF_PF_C','Return Air Fan - Power Factor - Phase C','RAF_PF_C',NULL,'GL_UNIT_PERCENT',NULL),('RAF_Pwr_A','Return Air Fan - Power - Phase A','RAF_Pwr_A',NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_Pwr_B','Return Air Fan - Power - Phase B','RAF_Pwr_B',NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_Pwr_C','Return Air Fan - Power - Phase C','RAF_Pwr_C',NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_SS','Return Air Fan - Status (DP Switch across RAF)','RAF_SS',NULL,'GL_UNIT_STRING',NULL),('RAF_Volt_A','Return Air Fan - Voltage - Phase A','RAF_Volt_A',NULL,'GL_UNIT_VOLTS',NULL),('RAF_Volt_B','Return Air Fan - Voltage - Phase B','RAF_Volt_B',NULL,'GL_UNIT_VOLTS',NULL),('RAF_Volt_C','Return Air Fan - Voltage - Phase C','RAF_Volt_C',NULL,'GL_UNIT_VOLTS',NULL),('RAQ_Co2','Return Air Quality - CO2','RAQ_Co2',NULL,'GL_UNIT_PPM',NULL),('RAQ_Co2_SP','Return Air Quality - CO2 - Setpoint / Min_Threshold','RAQ_Co2_SP',NULL,'GL_UNIT_PPM',NULL),('RARH','Return Air Relative Humidity','RARH',NULL,'GL_UNIT_PERCENT',NULL),('RARH_SP','Return Air Relative Humidity - Setpoint','RARH_SP',NULL,'GL_UNIT_PERCENT',NULL),('RAT','Return Air Temperature','RAT12355',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('rat_high',NULL,'RAT High',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('RAT_SP','Return Air Temperature - Setpoint','RAT_SP',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('React_Pwr_Ph1','Reactive Power, Phase 1','React_Pwr_Ph1',NULL,NULL,'VAR'),('React_Pwr_Ph2','Reactive Power, Phase 2','React_Pwr_Ph2',NULL,NULL,'VAR'),('React_Pwr_Ph3','Reactive Power, Phase 3','React_Pwr_Ph3',NULL,NULL,'VAR'),('React_Pwr_Ttl','Reactive Power, Total','React_Pwr_Ttl',NULL,NULL,'VAR'),('Return Air Temperature',NULL,'Return Air Temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('return_air_valve',NULL,'return_air_valve',NULL,'GL_UNIT_PERCENT','%'),('Rising_Dmd','Rising Demand','Rising_Dmd',NULL,NULL,'Rising Demand'),('rssi',NULL,'rssi',NULL,'GL_UNIT_STRING',NULL),('Run_Hr_G','Run Hours, Generator','Run_Hr_G',NULL,NULL,'Hours'),('Run_Hr_U','Run Hours, Utility','Run_Hr_U',NULL,NULL,'Hours'),('SA_CFM','Supply Air Flow','SA_CFM',NULL,'GL_UNIT_CFM',NULL),('SA_Dmpr_Pos','Supply Air Damper - Position','SA_Dmpr_Pos',NULL,'GL_UNIT_PERCENT',NULL),('SA_Dmpr_Pos_SP','Supply Air Damper - Position - Command / Setpoint','SA_Dmpr_Pos_SP',NULL,'GL_UNIT_PERCENT',NULL),('SAF_Amps_A','Supply Air Fan - Current - Phase A','SAF_Amps_A',NULL,'GL_UNIT_AMPERE',NULL),('SAF_Amps_B','Supply Air Fan - Current - Phase B','SAF_Amps_B',NULL,'GL_UNIT_AMPERE',NULL),('SAF_Amps_C','Supply Air Fan - Current - Phase C','SAF_Amps_C',NULL,'GL_UNIT_AMPERE',NULL),('SAF_PF_A','Supply Air Fan - Power Factor - Phase A','SAF_PF_A',NULL,'GL_UNIT_PERCENT',NULL),('SAF_PF_B','Supply Air Fan - Power Factor - Phase B','SAF_PF_B',NULL,'GL_UNIT_PERCENT',NULL),('SAF_PF_C','Supply Air Fan - Power Factor - Phase C','SAF_PF_C',NULL,'GL_UNIT_PERCENT',NULL),('SAF_Pwr_A','Supply Air Fan - Power - Phase A','SAF_Pwr_A',NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_Pwr_B','Supply Air Fan - Power - Phase B','SAF_Pwr_B',NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_Pwr_C','Supply Air Fan - Power - Phase C','SAF_Pwr_C',NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_VFD_AM','Supply Air Fan VFD- Auto / Manual - Command','SAF_VFD_AM',NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_AM_Fbk','Supply Air Fan VFD- Auto / Manual - Feedback/Status','SAF_VFD_AM_Fbk',NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_On_Off','Supply Air Fan VFD - On / Off - Command','SAF_VFD_On_Off',NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_On_Off_Fbk','Supply Air Fan VFD - On / Off - Feedback','SAF_VFD_On_Off_Fbk',NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_Speed','Supply Air Fan VFD - Speed - Command','SAF_VFD_Speed',NULL,'GL_UNIT_RPM',NULL),('SAF_VFD_Speed_Fbk','Supply Air Fan VFD- Speed - Feedback','SAF_VFD_Speed_Fbk',NULL,'GL_UNIT_RPM',NULL),('SAF_VFD_Trip_SS','Supply Air Fan VFD- Trip Status','SAF_VFD_Trip_SS',NULL,'GL_UNIT_STRING',NULL),('SAF_Volt_A','Supply Air Fan - Voltage - Phase A','SAF_Volt_A',NULL,'GL_UNIT_VOLTS',NULL),('SAF_Volt_B','Supply Air Fan - Voltage - Phase B','SAF_Volt_B',NULL,'GL_UNIT_VOLTS',NULL),('SAF_Volt_C','Supply Air Fan - Voltage - Phase C','SAF_Volt_C',NULL,'GL_UNIT_VOLTS',NULL),('sampling_interval',NULL,'sampling_interval',NULL,'GL_UNIT_TIME_SECONDS','Sec'),('SARH','Supply Air Relative Humidity','SARH',NULL,'GL_UNIT_PERCENT',NULL),('SARH_SP','Supply Air Relative Humidity - Setpoint','SARH_SP',NULL,'GL_UNIT_PERCENT',NULL),('SAT','Supply Air Temperature','GAnga',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('SAT_SP','Supply Air Temperature - Setpoint','SAT_SP',NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('Sec_Pmp_AM_SS','Secondary Pump Auto/Manual Status',NULL,NULL,NULL,NULL),('Sec_Pmp_On_Off','Secondary Pump On/Off Command',NULL,NULL,NULL,NULL),('Sec_Pmp_SS','Secondary Pump On/Off Status',NULL,NULL,NULL,NULL),('Sec_Pmp_Trip_SS','Secodary Pump Trip Status',NULL,NULL,NULL,NULL),('Sensor_type',NULL,'Sensor_type',NULL,'GL_UNIT_STRING',NULL),('SP_Post_Filter','Static Pressure - Post-Filter','SP_Post_Filter',NULL,'GL_UNIT_PSI',NULL),('SP_Pre_Filter','Static Pressure - Pre-Filter','SP_Pre_Filter',NULL,'GL_UNIT_PSI',NULL),('static_pressure',NULL,'static_pressure',NULL,'GL_UNIT_PSI','psi'),('Supply Air Temperature',NULL,'Supply Air Temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('Supply Fan Status',NULL,'Supply Fan Status',NULL,'GL_UNIT_STRING',NULL),('supply_air_flow',NULL,'supply_air_flow',NULL,'GL_UNIT_CFM','cfm'),('supply_air_sp',NULL,'supply_air_sp',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('supply_air_temp_high',NULL,'supply_air_temp_high',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('supply_air_temp_low',NULL,'supply_air_temp_low',NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('Supply_Fan_Status',NULL,'Supply_Fan_Status',NULL,'GL_UNIT_STRING',NULL),('temperature',NULL,'temperature',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('temperature_change',NULL,'temperature_change',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('temperatureCrossedLcl',NULL,'temperature','COLD','GL_UNIT_DEG_CENTIGRADE','deg c'),('temperatureCrossedUcl',NULL,'temperature','HOT','GL_UNIT_DEG_CENTIGRADE','deg c'),('totalConnectedchannels',NULL,'totalConnectedchannels',NULL,'GL_UNIT_COUNT',NULL),('totalConnectedPIR',NULL,'totalConnectedPIR',NULL,'GL_UNIT_COUNT',NULL),('totalConnectedTHL',NULL,'totalConnectedTHL',NULL,'GL_UNIT_COUNT',NULL),('type',NULL,'type',NULL,'GL_UNIT_STRING',NULL),('Unbl%_Ld','Unbalanced % Load','Unbl%_Ld',NULL,NULL,'Unblanced % Load'),('Unbl%_Volt','Unbalanced % Voltage','Unbl%_Volt',NULL,NULL,'Unblanced % Voltage'),('ups_BatteryBackupTime',NULL,'ups_BatteryBackupTime',NULL,NULL,NULL),('ups_DCInputBatteryVoltage',NULL,'ups_DCInputBatteryVoltage',NULL,NULL,NULL),('ups_EfficiencyInstantaneous',NULL,'ups_EfficiencyInstantaneous',NULL,NULL,NULL),('ups_EfficiencyMTD',NULL,'ups_EfficiencyMTD',NULL,NULL,NULL),('ups_EfficiencyPreviousday',NULL,'ups_EfficiencyPreviousday',NULL,NULL,NULL),('ups_EfficiencyToday',NULL,'ups_EfficiencyToday',NULL,NULL,NULL),('ups_EfficiencyYTD',NULL,'ups_EfficiencyYTD',NULL,NULL,NULL),('ups_InputCableVoltage_AB',NULL,'ups_InputCableVoltage_AB',NULL,NULL,NULL),('ups_InputCableVoltage_BC',NULL,'ups_InputCableVoltage_BC',NULL,NULL,NULL),('ups_InputCableVoltage_CA',NULL,'ups_InputCableVoltage_CA',NULL,NULL,NULL),('ups_InputCurrentPhaseA',NULL,'ups_InputCurrentPhaseA',NULL,NULL,NULL),('ups_InputCurrentPhaseB',NULL,'ups_InputCurrentPhaseB',NULL,NULL,NULL),('ups_InputCurrentPhaseC',NULL,'ups_InputCurrentPhaseC',NULL,NULL,NULL),('ups_InputFrequency',NULL,'ups_InputFrequency',NULL,NULL,NULL),('ups_InputPowerInstantaneous',NULL,'ups_InputPowerInstantaneous',NULL,NULL,NULL),('ups_InputPowerMTD',NULL,'ups_InputPowerMTD',NULL,NULL,NULL),('ups_InputPowerPreviousday',NULL,'ups_InputPowerPreviousday',NULL,NULL,NULL),('ups_InputPowerToday',NULL,'ups_InputPowerToday',NULL,NULL,NULL),('ups_InputPowerYTD',NULL,'ups_InputPowerYTD',NULL,NULL,NULL),('ups_InputVoltagePhaseA',NULL,'ups_InputVoltagePhaseA',NULL,NULL,NULL),('ups_InputVoltagePhaseB',NULL,'ups_InputVoltagePhaseB',NULL,NULL,NULL),('ups_InputVoltagePhaseC',NULL,'ups_InputVoltagePhaseC',NULL,NULL,NULL),('ups_OutputActivePower_PhaseA',NULL,'ups_OutputActivePower_PhaseA',NULL,NULL,NULL),('ups_OutputActivePower_PhaseB',NULL,'ups_OutputActivePower_PhaseB',NULL,NULL,NULL),('ups_OutputActivePower_PhaseC',NULL,'ups_OutputActivePower_PhaseC',NULL,NULL,NULL),('ups_OutputApparentPower_PhaseA',NULL,'ups_OutputApparentPower_PhaseA',NULL,NULL,NULL),('ups_OutputApparentPower_PhaseB',NULL,'ups_OutputApparentPower_PhaseB',NULL,NULL,NULL),('ups_OutputApparentPower_PhaseC',NULL,'ups_OutputApparentPower_PhaseC',NULL,NULL,NULL),('ups_OutputCurrentPhaseA',NULL,'ups_OutputCurrentPhaseA',NULL,NULL,NULL),('ups_OutputCurrentPhaseB',NULL,'ups_OutputCurrentPhaseB',NULL,NULL,NULL),('ups_OutputCurrentPhaseC',NULL,'ups_OutputCurrentPhaseC',NULL,NULL,NULL),('ups_OutputFrequency',NULL,'ups_OutputFrequency',NULL,NULL,NULL),('ups_OutputLoad%PhaseA',NULL,'ups_OutputLoad%PhaseA',NULL,NULL,NULL),('ups_OutputLoad%PhaseB',NULL,'ups_OutputLoad%PhaseB',NULL,NULL,NULL),('ups_OutputLoad%PhaseC',NULL,'ups_OutputLoad%PhaseC',NULL,NULL,NULL),('ups_OutputLoadPhaseA',NULL,'ups_OutputLoadPhaseA',NULL,NULL,NULL),('ups_OutputLoadPhaseB',NULL,'ups_OutputLoadPhaseB',NULL,NULL,NULL),('ups_OutputLoadPhaseC',NULL,'ups_OutputLoadPhaseC',NULL,NULL,NULL),('ups_OutputPowerInstantaneous',NULL,'ups_OutputPowerInstantaneous',NULL,NULL,NULL),('ups_OutputPowerMTD',NULL,'ups_OutputPowerMTD',NULL,NULL,NULL),('ups_OutputPowerPreviousday',NULL,'ups_OutputPowerPreviousday',NULL,NULL,NULL),('ups_OutputPowerToday',NULL,'ups_OutputPowerToday',NULL,NULL,NULL),('ups_OutputPowerYTD',NULL,'ups_OutputPowerYTD',NULL,NULL,NULL),('ups_OutputReactive_Power_PhaseC',NULL,'ups_OutputReactive_Power_PhaseC',NULL,NULL,NULL),('ups_OutputReactivePower_PhaseA',NULL,'ups_OutputReactivePower_PhaseA',NULL,NULL,NULL),('ups_OutputReactivePower_PhaseB',NULL,'ups_OutputReactivePower_PhaseB',NULL,NULL,NULL),('ups_OutputVoltagePhaseA',NULL,'ups_OutputVoltagePhaseA',NULL,NULL,NULL),('ups_OutputVoltagePhaseB',NULL,'ups_OutputVoltagePhaseB',NULL,NULL,NULL),('ups_OutputVoltagePhaseC',NULL,'ups_OutputVoltagePhaseC',NULL,NULL,NULL),('ups_PositiveBatteryCurrent',NULL,'ups_PositiveBatteryCurrent',NULL,NULL,NULL),('ups_PositiveBatteryVoltage',NULL,'ups_PositiveBatteryVoltage',NULL,NULL,NULL),('ups_Temperature',NULL,'ups_Temperature',NULL,NULL,NULL),('VAV_CFM_Actual','VAV CFM-Actual',NULL,NULL,NULL,NULL),('VAV_CFM_Design','Zone Flow','zone_flow',NULL,NULL,NULL),('VAV_CFM_SP','Zone Flow Set Point','zone_flow_sp',NULL,NULL,NULL),('VAV_Dmpr_Pos','Zone Damper','zone_damper',NULL,NULL,NULL),('vav_volume_percent',NULL,'vav_volume_percent',NULL,'GL_UNIT_PERCENT','%'),('VAV_ZARH','VAV Zone Air Relative Humidity',NULL,NULL,NULL,NULL),('VAV_ZAT','Zone Temperature','zone_temperature',NULL,NULL,NULL),('VAV_ZAT_SP','Zone Temperature Set Point','zone_temperature_sp',NULL,NULL,NULL),('VFD ByPass Status',NULL,'VFD ByPass Status',NULL,'GL_UNIT_STRING',NULL),('VFD_Byp_SS','VFD status - (Fan motor through VFD ? Direct bypass\" ?)\"','VFD_Byp_SS',NULL,'GL_UNIT_STRING',NULL),('VFD_SS','VFD status - (Fan motor through VFD ? Direct bypass\" ?)\"','VFD_SS',NULL,'GL_UNIT_STRING',NULL),('Volt_LL_Avg','Voltage LL, Average','Volt_LL_Avg',NULL,NULL,'V'),('Volt_LL_Ph1','Voltage LL, Phase 1-2','Volt_LL_Ph1',NULL,NULL,'V'),('Volt_LL_Ph2','Voltage LL, Phase 2-3','Volt_LL_Ph2',NULL,NULL,'V'),('Volt_LL_Ph3','Voltage LL, Phase 3-1','Volt_LL_Ph3',NULL,NULL,'V'),('Volt_LN_Avg','Voltage LN, Average','Volt_LN_Avg',NULL,NULL,'V'),('Volt_LN_Ph1','Voltage LN, Phase 1-2','Volt_LN_Ph1',NULL,NULL,'V'),('Volt_LN_Ph2','Voltage LN, Phase 2-3','Volt_LN_Ph2',NULL,NULL,'V'),('Volt_LN_Ph3','Voltage LN, Phase 3-1','Volt_LN_Ph3',NULL,NULL,'V'),('zone_common_temperature_sp','Zone Common Temperature Set Point','zone_common_temperature_sp',NULL,NULL,NULL);`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_parameter data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gl_location_input_map (
        id int NOT NULL AUTO_INCREMENT,
        zone_id varchar(36) DEFAULT NULL,
        triggered_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY zone_id (zone_id),
        KEY param_id (param_id),
        CONSTRAINT gl_location_input_map_ibfk_1 FOREIGN KEY (zone_id) REFERENCES gl_location (id),
        CONSTRAINT gl_location_input_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location_input_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_location_output_map (
        id int NOT NULL AUTO_INCREMENT,
        zone_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY zone_id (zone_id),
        KEY param_id (param_id),
        CONSTRAINT gl_location_output_map_ibfk_1 FOREIGN KEY (zone_id) REFERENCES gl_location (id),
        CONSTRAINT gl_location_output_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location_output_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_schedule (
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        description varchar(100) DEFAULT NULL,
        cron_tab_fields varchar(100) DEFAULT NULL,
        is_active tinyint(1) DEFAULT '1',
        start datetime NOT NULL,
        end datetime NOT NULL,
        referenceId varchar(36) DEFAULT NULL,
        type enum('start','end'),
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_schedule table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_location_scheduled_service_map (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        zone_id varchar(36) DEFAULT NULL,
        schedule_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY fk_GL_LOCATION_scheduled_service_map (zone_id),
        KEY fk_GL_LOCATION_scheduled_service_map1 (schedule_id),
        CONSTRAINT fk_GL_LOCATION_scheduled_service_map FOREIGN KEY (zone_id) REFERENCES gl_location (id) ON DELETE CASCADE,
        CONSTRAINT fk_GL_LOCATION_scheduled_service_map1 FOREIGN KEY (schedule_id) REFERENCES gl_schedule (id) ON DELETE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location_scheduled_service_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_location_subsystem_map (
        id int NOT NULL AUTO_INCREMENT,
        zone_id varchar(36) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY zone_id (zone_id),
        KEY ss_id (ss_id),
        CONSTRAINT gl_location_subsystem_map_ibfk_1 FOREIGN KEY (zone_id) REFERENCES gl_location (id),
        CONSTRAINT gl_location_subsystem_map_ibfk_2 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location_subsystem_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_location_user (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        zone_id varchar(36) NOT NULL,
        user_id varchar(36) NOT NULL,
        usage_start_time timestamp NOT NULL,
        usage_end_time timestamp NOT NULL,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_location_user table Successfully created`);
    }
);



connection.query(
    `CREATE TABLE gl_role (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_active tinyint(1) NOT NULL DEFAULT '1',
        name varchar(255) NOT NULL,
        discription varchar(255) DEFAULT NULL,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_role table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_role_access (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        role_id int NOT NULL,
        access_id int NOT NULL,
        PRIMARY KEY (id),
        KEY fk_gl_role_access (role_id),
        KEY fk_gl_role_access2 (access_id),
        CONSTRAINT fk_gl_role_access FOREIGN KEY (role_id) REFERENCES gl_role (id) ON DELETE CASCADE,
        CONSTRAINT fk_gl_role_access2 FOREIGN KEY (access_id) REFERENCES gl_access (id) ON DELETE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_role_access table Successfully created`);
    }
);


connection.query(
    `CREATE TABLE gl_schedule_detail (
    id int NOT NULL AUTO_INCREMENT,
    schedule_id varchar(256) DEFAULT NULL,
    target_id varchar(256) DEFAULT NULL,
    target_type varchar(256) DEFAULT NULL,
    zone_id varchar(1024) DEFAULT NULL,
    zone_type varchar(36) DEFAULT NULL,
    ss_id varchar(1024) DEFAULT NULL,
    ss_type varchar(36) DEFAULT NULL,
    command varchar(256) DEFAULT NULL,
    arguments varchar(256) DEFAULT NULL,
    is_active tinyint(1) DEFAULT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    param_name varchar(255) DEFAULT NULL,
    param_value varchar(255) DEFAULT NULL,
    priority int DEFAULT NULL,
    name varchar(255) NOT NULL,
    PRIMARY KEY (id),
    KEY gl_schedule_detail_ibfk_1 (schedule_id),
    KEY gl_schedule_detail_ibfk_2 (target_type),
    CONSTRAINT gl_schedule_detail_ibfk_1 FOREIGN KEY (schedule_id) REFERENCES gl_schedule (id),
    CONSTRAINT gl_schedule_detail_ibfk_2 FOREIGN KEY (target_type) REFERENCES gl_all_type (type)
  )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_schedule_detail table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_timestamp (
        id varchar(36) NOT NULL,
        start tinytext,
        end tinytext,
        created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_timestamp table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_schedule_map (
        id varchar(36) NOT NULL,
        zone_id varchar(36) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        time_id varchar(36) DEFAULT NULL,
        schedule_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        recurring_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        arguments json NOT NULL,
        schedule_type varchar(256) DEFAULT NULL,
        expected_status varchar(255) DEFAULT 'pending',
        name varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY zone_id (zone_id),
        KEY device_id (ss_id),
        KEY time_id (time_id),
        CONSTRAINT gl_schedule_map_ibfk_1 FOREIGN KEY (zone_id) REFERENCES gl_location (id),
        CONSTRAINT gl_schedule_map_ibfk_2 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_schedule_map_ibfk_3 FOREIGN KEY (time_id) REFERENCES gl_timestamp (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_schedule_map table Successfully created`);
    }
);



connection.query(
    `CREATE TABLE gl_subsystem_detail (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        param_name varchar(255) DEFAULT NULL,
        param_value varchar(255) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY fk_gl_subsystem_detail (ss_id),
        CONSTRAINT fk_gl_subsystem_detail FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id) ON DELETE CASCADE
      )
    `,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_detail table Successfully created`);
    }
);

connection.query(
    `INSERT INTO gl_subsystem_detail VALUES (1,'2023-03-13 09:21:33','2023-04-07 11:56:32','restart','1','${server_id}');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_detail data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE gl_subsystem_input_map (
        id varchar(36) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        triggered_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) DEFAULT NULL,
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT gl_subsystem_input_map_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_subsystem_input_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_input_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_subsystem_latest_event (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT gl_subsystem_latest_event_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_subsystem_latest_event_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_latest_event table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_subsystem_output_map (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT gl_subsystem_output_map_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_subsystem_output_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_output_map table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_subsystem_process_map (
        id int NOT NULL AUTO_INCREMENT,
        process_id varchar(36) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        status varchar(255) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT gl_subsystem_process_map_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_subsystem_process_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
        )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_process_map table Successfully created`);
    }
);


connection.query(
    `CREATE TABLE gl_user (
        id varchar(36) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) NOT NULL,
        is_active tinyint(1) NOT NULL DEFAULT '1',
        name varchar(255) NOT NULL,
        description varchar(255) DEFAULT NULL,
        user_type varchar(36) DEFAULT NULL,
        email_id varchar(255) DEFAULT NULL,
        phone_no varchar(10) DEFAULT NULL,
        login_id varchar(36) NOT NULL,
        password varchar(180) NOT NULL,
        registered_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login timestamp NULL DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY login_id (login_id),
        UNIQUE KEY user_id (user_id),
        UNIQUE KEY email_id (email_id),
        UNIQUE KEY phone_no (phone_no)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_user table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_user_role (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) NOT NULL,
        role_id int NOT NULL,
        PRIMARY KEY (id),
        KEY fk_gl_user_role (user_id),
        KEY fk_gl_user_role2 (role_id),
        CONSTRAINT fk_gl_user_role FOREIGN KEY (user_id) REFERENCES gl_user (id) ON DELETE CASCADE,
        CONSTRAINT fk_gl_user_role2 FOREIGN KEY (role_id) REFERENCES gl_role (id) ON DELETE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_user_role table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_user_session (
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) NOT NULL,
        token text NOT NULL,
        is_active tinyint(1) NOT NULL DEFAULT '1',
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_user_session table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE hvac_recurring_schedule (
        id varchar(36) NOT NULL,
        name varchar(120) NOT NULL,
        data json NOT NULL,
        status tinyint(1) DEFAULT '0',
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        floor_id varchar(36) NOT NULL,
        floor_name varchar(36) NOT NULL,
        start datetime NOT NULL,
        end datetime NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY name_UNIQUE (name),
        KEY fk_schedule_device_idx (floor_id),
        CONSTRAINT fk_hvac_recurring_schedule_floor FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`hvac_recurring_schedule table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE hvac_schedule (
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
        CONSTRAINT fk_hvac_schedule_floor FOREIGN KEY (floor_id) REFERENCES floor (id) ON DELETE CASCADE
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`hvac_schedule table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE latest_command (
        id varchar(36) NOT NULL,
        mode varchar(120) NOT NULL,
        intensity int NOT NULL,
        mac_id varchar(120) NOT NULL,
        data text NOT NULL,
        gatewayip varchar(16) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY event_created_at_idx (created_at)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`latest_command table Successfully created`);
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
      logger.info(`latest_event table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE one_month_data (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`one_month_data table Successfully created`);
    }
);


connection.query(
    `CREATE TABLE parking_status (
        id varchar(36) NOT NULL,
        context_id varchar(36) NOT NULL,
        total int NOT NULL,
        availability int DEFAULT NULL,
        occupied int DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`parking_status table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE reference_om_p (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY unique_index (ss_id,param_id,measured_time),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT reference_om_p_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT reference_om_p_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`reference_om_p table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE schedule (
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
      logger.info(`schedule table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE session (
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
      logger.info(`session table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE super_admin (
        id varchar(36) NOT NULL,
        username varchar(45) NOT NULL,
        password varchar(180) NOT NULL,
        role_name varchar(24) NOT NULL,
        role_id int NOT NULL,
        total_devices int NOT NULL,
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
      logger.info(`super_admin table Successfully created`);
    }
);
connection.query(
    `INSERT INTO super_admin VALUES ('495d7894-f9cc-4e5b-93ec-b18ae63f9d4c','admin','$2y$10$n/2DJoDB13fcqqgCBHpa2e2aOst6o0l2haJbcoxhiS7ROxo/wHeUS','superAdmin',1,100,'$2a$12$s4BY6xtYOx/YA5vtG6uvtuoVz3gTRcrTkx/M4DiYFZ607n.xOwjci','2019-05-07 00:21:08','2023-03-02 10:25:55','');
    `,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`super_admin data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE testingtable (
        measured_time timestamp NULL DEFAULT NULL,
        zone_temperature varchar(36) DEFAULT NULL,
        occupancy varchar(36) DEFAULT NULL,
        UNIQUE KEY measured_time (measured_time)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`testingtable table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE user (
        id varchar(36) NOT NULL,
        campus_id varchar(36) DEFAULT NULL,
        username varchar(45) NOT NULL,
        password varchar(180) NOT NULL,
        secret varchar(18) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login varchar(50) DEFAULT NULL,
        email varchar(180) DEFAULT NULL,
        role_id int NOT NULL,
        role_name varchar(24) NOT NULL,
        status tinyint(1) NOT NULL DEFAULT '1',
        building_id varchar(36) DEFAULT NULL,
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
      logger.info(`user table Successfully created`);
    }
);

connection.query(
    `INSERT INTO user VALUES ('46d96f0c-f4a6-449e-985c-abf6a14b34f7','${campus_id}','gvadmin1','$2a$10$CrAquaKnqwLXUG8wiyMyeubFM0fGAlmhRgpjgtXONzBgXE9XOw1lG','bangalore','2023-02-13 06:37:54','2023-11-09 13:03:38','11/9/2023, 6:33:38 PM','gvadmin1@gl.com',2,'admin',1,'${building_id}'),('4a8dd0f2-d258-4a64-9db6-ca3f082f0b26','${campus_id}','technician3','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'srilakshmi.k@graylinx.ai',3,'technician',1,'${building_id}'),('54909d59-aaa7-42a8-9b34-ddc117794398','${campus_id}','gvadmin2','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'gvadmin2@gl.com',2,'admin',1,'${building_id}'),('778ce620-5476-4112-a6a0-6a554a1fec48','${campus_id}','gvadmin3','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'gvadmin3@gl.com',2,'admin',1,'${building_id}'),('7f6baf5e-0942-4105-bfef-ec22d046de63','${campus_id}','technician4','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'technician4@gl.com',3,'technician',1,'${building_id}'),('9a859ae6-c613-49ff-98ce-5056f43e943a','${campus_id}','technician5','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'technician5@gl.com',3,'technician',1,'${building_id}'),('c39a7052-7618-4162-adea-c18178758740','${campus_id}','technician2','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'technician2@gl.com',3,'technician',1,'${building_id}'),('d9b9b728-3200-4171-9f0e-27a62b4e1616','${campus_id}','technician1','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-08-03 10:25:55','8/3/2023, 3:55:55 PM','technician1@gl.com',3,'technician',1,'${building_id}'),('ff1894f6-e428-4594-a748-8d1884b7bcdd','${campus_id}','technician6','$2a$10$y4Vl0vFYC5z.6NBC6o4AR.inEi9Xl.u8GUjNIsNbPNMmLOpKRJVSi','bangalore','2023-02-13 06:37:54','2023-07-31 11:29:25',NULL,'technician6@gl.com',3,'technician',1,'${building_id}');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`user data Successfully inserted`);
    }
);

connection.query(
    `CREATE TABLE weather_service (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        CONSTRAINT weather_service_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT weather_service_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`weather_service table Successfully created`);
    }
);



connection.query(
    `  CREATE TABLE gl_metric (
        id varchar(256) NOT NULL,
        name varchar(256) DEFAULT NULL,
        tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        unit varchar(256) DEFAULT NULL,
        unit_display varchar(64) DEFAULT NULL,
        ss_type varchar(256) DEFAULT NULL,
        time_window varchar(36) DEFAULT NULL,
        computing_methodology varchar(256) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY id (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_metric table Successfully created`);
    }
);

connection.query(
    `insert into gl_metric(id,name,time_window)values
    ('rh_hour','Runhour per hour','hour'),
    ('rh_day','Runhour per day','day'),
    ('rh_week','Runhour per week','week'),
    ('rh_month','Runhour per month','month'),
    ('rh_cumulative','Cumulative runhour per hour','hour'),
    ('cpu_usage','CPU USAGE','15 MINS'),
    ('downtime','DOWNTIME_DEVICE','MINS'),
    ('memory_usage','MEMORY USAGE','15 MINS'),
    ('db_connections','DB CONNECTIONS','15 MINS');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_metric table Successfully created`);
    }
);

connection.query(
    `CREATE TABLE reference_metric (
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        metric_id varchar(36) DEFAULT NULL,
        metric_value varchar(36) DEFAULT NULL,
        metric_minimum varchar(36) DEFAULT NULL,
        metric_average varchar(36) DEFAULT NULL,
        metric_maximum varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`reference_metric table Successfully created`);
    }
);

const createProcedure = `
CREATE PROCEDURE executeMyQueries(IN myQueries longtext)
BEGIN
    DECLARE allQueries longtext DEFAULT '';
    DECLARE queryNow longtext DEFAULT '';

    SET allQueries = TRIM(myQueries);

    queryLoop: LOOP
        SET queryNow = TRIM(SUBSTRING_INDEX(allQueries, ';', 1));
        SET allQueries = TRIM(SUBSTRING(allQueries, LENGTH(queryNow) + 2));

        IF ((queryNow = '') AND (allQueries != '')) THEN
            SET queryNow = TRIM(allQueries);
            SET allQueries = '';
        END IF;

        IF (queryNow != '') THEN
            SET @tquery = queryNow;
            PREPARE stmt FROM @tquery;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
            ITERATE queryLoop;
        END IF;

        LEAVE queryLoop;
    END LOOP queryLoop;
END;
`;

connection.query(createProcedure,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`store procedure data Successfully created`);
    }
);

connection.query(
    `CREATE TABLE gl_pas_res (
        id int NOT NULL AUTO_INCREMENT,
        trigger_id varchar(36) NOT NULL,
        Alarm_id varchar(36) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
         PRIMARY KEY (id)
      );`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_pas_res table Successfully created`);
    }
);

connection.query(
  `CREATE TABLE server_instrumentation (
    id int NOT NULL AUTO_INCREMENT,
    ss_id varchar(36) DEFAULT NULL,
    measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    metric_id varchar(36) DEFAULT NULL,
    metric_value varchar(36) DEFAULT NULL,
    metric_minimum varchar(36) DEFAULT NULL,
    metric_average varchar(36) DEFAULT NULL,
    metric_maximum varchar(36) DEFAULT NULL,
    created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ss_id (ss_id),
    KEY metric_id (metric_id),
    CONSTRAINT server_instrumentation_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
    CONSTRAINT server_instrumentation_ibfk_2 FOREIGN KEY (metric_id) REFERENCES gl_metric (id)
  );`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`server_instrumentation table Successfully created`);
  }
);

connection.query(
  `CREATE TABLE gl_control_command (
  id varchar(36) NOT NULL,
	targert_id varchar(36) DEFAULT NULL,
	target_type varchar(36) DEFAULT NULL,
	ss_id varchar(36) DEFAULT NULL,
	ss_type varchar(36) DEFAULT NULL,
	zone_type varchar(36) DEFAULT NULL,
	zone_id varchar(36) DEFAULT NULL,
	gl_command varchar(36) NOT NULL,
  param_id varchar(36) NOT NULL,
  param_value varchar(36) NOT NULL,
	priority int DEFAULT 8,
	triggered_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	status varchar(36) DEFAULT NULL,
	created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
  );`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`gl_control_command table Successfully created`);
  }
);

connection.end();