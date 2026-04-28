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
  `CREATE TABLE IF NOT EXISTS organization(
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
    logger.info(`organization Table Successfully Created`);
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
  `CREATE TABLE IF NOT EXISTS zone(
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
    logger.info(`zone Table Successfully Created`);
  }
);

connection.query(
    `CREATE TABLE IF NOT EXISTS area (
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
    `CREATE TABLE IF NOT EXISTS device (
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
    `CREATE TABLE IF NOT EXISTS gl_all_type(
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
      logger.info(`All_Type Table Successfully Created`);
    }
  );

connection.query(
    `INSERT INTO gl_all_type VALUES (1,'GL_LOCATION_TYPE_SEAT',NULL,NULL,NULL,'GL_LOCATION'),(2,'GL_LOCATION_SEAT_GROUP',NULL,NULL,NULL,'GL_LOCATION'),(3,'GL_LOCATION_TYPE_ROOM',NULL,NULL,NULL,'GL_LOCATION'),(4,'GL_LOCATION_TYPE_ZONE',NULL,NULL,NULL,'GL_LOCATION'),(5,'GL_LOCATION_TYPE_FLOOR',NULL,NULL,NULL,'GL_LOCATION'),(6,'GL_LOCATION_TYPE_BUILDING',NULL,NULL,NULL,'GL_LOCATION'),(7,'GL_LOCATION_TYPE_CAMPUS',NULL,NULL,NULL,'GL_LOCATION'),(8,'GL_LOCATION_TYPE_ORGANIZATION',NULL,NULL,NULL,'GL_LOCATION'),(9,'GL_SS_THLSENSOR_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(10,'GL_SS_WAC_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(11,'GL_SS_GATEWAY_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(12,'GL_SS_WPIR_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(13,'GL_SS_REPEATER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(14,'GL_SS_DALI_MASTER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(15,'GL_SS_DALI_SLAVE_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(16,'GL_SS_OTHER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(17,'NONGL_SS_VAV',NULL,NULL,NULL,'GL_Subsystem'),(18,'NONGL_SS_AHU',NULL,NULL,NULL,'GL_Subsystem'),(19,'GL_SS_OTHER_ENERGYMETER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(20,'NONGL_SS_ENERGYMETER_TYPE_01',NULL,NULL,NULL,'GL_Subsystem'),(21,'GL_SS_ADDRESS_IP',NULL,NULL,NULL,'GL_Subsystem'),(22,'GL_SS_ADDRESS_MAC',NULL,NULL,NULL,'GL_Subsystem'),(23,'GL_SS_ADDRESS_OTHER',NULL,NULL,NULL,'GL_Subsystem'),(24,'GL_UNIT_DEG_CENTIGRADE',NULL,NULL,NULL,'GL_Parameter'),(25,'GL_UNIT_PERCENT',NULL,NULL,NULL,'GL_Parameter'),(26,'GL_UNIT_LUMEN',NULL,NULL,NULL,'GL_Parameter'),(27,'GL_UNIT_MEGABYTES',NULL,NULL,NULL,'GL_Parameter'),(28,'GL_UNIT_TRUE_FALSE',NULL,NULL,NULL,'GL_Parameter'),(29,'GL_UNIT_KILO_WATT_HOUR',NULL,NULL,NULL,'GL_Parameter'),(30,'GL_UNIT_TIME_SECONDS',NULL,NULL,NULL,'GL_Parameter'),(31,'GL_UNIT_STRING',NULL,NULL,NULL,'GL_Parameter'),(32,'GL_UNIT_COUNT',NULL,NULL,NULL,'GL_Parameter'),(33,'GL_UNIT_RPM',NULL,NULL,NULL,'GL_Parameter'),(34,'GL_UNIT_CFM',NULL,NULL,NULL,'GL_Parameter'),(35,'GL_UNIT_PSI',NULL,NULL,NULL,'GL_Parameter'),(36,'NONGL_SS_DAMPER',NULL,NULL,NULL,'GL_Subsystem'),(37,'GL_SS_ADDRESS_BACNET_ID',NULL,NULL,NULL,'GL_Subsystem'),(38,'GL_SS_ADDRESS_BACNET_DDC',NULL,NULL,NULL,'GL_Subsystem'),(39,'GL_SS_ADDRESS_BACNET_DEVICE_ID',NULL,NULL,NULL,'GL_Subsystem'),(40,'GL_EVENT_CATEGORY_USER_INPUT',NULL,NULL,'Set','GL_IBMS_EVENT'),(41,'GL_EVENT_CATEGORY_MEASURED',NULL,NULL,'Measured','GL_IBMS_EVENT'),(42,'GL_EVENT_CATEGORY_USER_LOGIN',NULL,NULL,NULL,'GL_IBMS_EVENT'),(43,'GL_EVENT_CATEGORY_USER_LOGOUT',NULL,NULL,NULL,'GL_IBMS_EVENT'),(44,'GL_EVENT_CATEGORY_SYSTEM_INPUT',NULL,NULL,NULL,'GL_IBMS_EVENT'),(45,'GL_EVENT_CRITICALITY_HIGH',NULL,NULL,'High','GL_IBMS_EVENT'),(46,'GL_EVENT_CRITICALITY_MEDIUM',NULL,NULL,'Medium','GL_IBMS_EVENT'),(47,'GL_EVENT_CRITICALITY_LOW',NULL,NULL,'Low','GL_IBMS_EVENT'),(48,'GL_EVENT_STATUS_OPEN',NULL,NULL,NULL,'GL_IBMS_EVENT'),(49,'GL_EVENT_STATUS_CLOSE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(50,'GL_SS_STATUS_ACTIVE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(51,'GL_SS_STATUS_INACTIVE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(52,'GL_EVENT_SHOW',NULL,NULL,NULL,'GL_IBMS_EVENT'),(53,'GL_EVENT_HIDE',NULL,NULL,NULL,'GL_IBMS_EVENT'),(54,'GL_RECORD_STATUS_ACTIVE',NULL,NULL,NULL,'ALL_TABLES'),(55,'GL_RECORD_STATUS_INACTIVE',NULL,NULL,NULL,'ALL_TABLES'),(56,'GL_UNIT_PPM',NULL,NULL,NULL,'GL_PARAMETER'),(57,'NONGL_SS_UPS',NULL,NULL,NULL,'GL_SUBSYSTEM'),(58,'NONGL_SS_EMS',NULL,'TYPE_01',NULL,'GL_SUBSYSTEM'),(59,'GL_UNIT_AMPERE',NULL,NULL,NULL,'GL_PARAMETER'),(60,'GL_UNIT_VOLTS',NULL,NULL,NULL,'GL_PARAMETER'),(61,'GL_UNIT_HERTZ',NULL,NULL,NULL,'GL_PARAMETER'),(62,'GL_UNIT_KILO_WATT',NULL,NULL,NULL,'GL_PARAMETER'),(63,'GL_KILOVOLT_AMPS_REACTIVE',NULL,NULL,NULL,'GL_PARAMETER'),(64,'GL_SS_DAG',NULL,NULL,NULL,'GL_SUBSYSTEM'),(65,'GL_UNIT_GPM',NULL,NULL,NULL,'gl_parameter'),(66,'GL_SS_SERVER',NULL,NULL,NULL,'GL_Subsystem'),(67,'GL_SS_ADDRESS_DDC',NULL,NULL,NULL,'GL_SUBSYSTEM');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`All_type Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_location(
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
      logger.info(`Location Table Successfully Created`);
    }
  );


  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem(
        id varchar(36) NOT NULL DEFAULT (uuid()),
        name varchar(256) DEFAULT NULL,
        ss_tag varchar(256) DEFAULT NULL,
        description varchar(1024) DEFAULT NULL,
        ss_type varchar(256) DEFAULT NULL,
        ss_shape enum('rect','circle','poly','GL_ZONE_SHAPE_DEFAULT') DEFAULT 'rect',
        ss_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        ss_address_type varchar(256) DEFAULT NULL,
        ss_address_value varchar(1024) DEFAULT NULL,
        ss_parent varchar(36) DEFAULT NULL,
        coordinates varchar(1024) DEFAULT NULL,
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
        console.log("errr",error)
        return;
      }
      logger.info(`Subsystem Table Successfully Created`);
    }
  );

connection.query(
    `INSERT INTO gl_subsystem (id, name, ss_tag,description, ss_type, ss_shape, ss_status, ss_address_type, ss_address_value, ss_parent, coordinates, created_at, modified_at) VALUES ('646b2b1f-c16d-11ed-948f-f80dac57b061','GL_SERVER',NULL,NULL,'GL_SS_SERVER','rect','GL_SS_STATUS_ACTIVE','GL_SS_ADDRESS_IP','192.168.0.102',
    NULL,NULL,'2023-01-24 10:40:37','2023-02-27 08:05:18');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`subsystem Added Successfully`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_parameter(
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
      logger.info(`Parameter Table Successfully Created`);
    }
  );

connection.query(
    `INSERT INTO gl_parameter (id,name,tag,description,unit,unit_display) VALUES ('Act_Enrg_G','Active Energy, Generator',NULL,NULL,NULL,'Wh'),('Act_Enrg_U','Active Energy, Utility',NULL,NULL,NULL,'Wh'),('Act_Pwr_Ph1','Active Power, Phase 1',NULL,NULL,NULL,'W'),('Act_Pwr_Ph2','Active Power, Phase 2',NULL,NULL,NULL,'W'),('Act_Pwr_Ph3','Active Power, Phase 3',NULL,NULL,NULL,'W'),('Act_Pwr_Ttl','Active Power, Total',NULL,NULL,NULL,'W'),('ahu_automanual_status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('ahu_chill_water_temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_chilled_valve',NULL,'ChW%',NULL,'GL_UNIT_PERCENT','%'),('ahu_chilled_valve_sp',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_chilled_water_valve_status',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_choke',NULL,NULL,NULL,'GL_UNIT_TRUE_FALSE',NULL),('ahu_command_on_off',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_filter_status',NULL,NULL,NULL,'GL_UNIT_TRUE_FALSE',NULL),('ahu_in_air_temperature',NULL,'RAT',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_in_air_temperature_sp',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_mode_status',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('AHU_On_Off','AHU ON/OFF Command',NULL,NULL,'GL_UNIT_STRING',NULL),('ahu_out_air_temperature',NULL,'OAT',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_ra_temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_run_status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('ahu_sa_temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_set_point',NULL,'Temperature_SP',NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_status_multistate',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_suply_air_temperature_sp',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('ahu_supply_air_temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('ahu_trip_status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('ahu_vfd_mode',NULL,'VFD',NULL,'GL_UNIT_VOLTS','V'),('air_temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('air_volume',NULL,'Volume',NULL,'GL_UNIT_CFM','cfm'),('Alarm1',NULL,NULL,NULL,NULL,NULL),('Alarm2',NULL,NULL,NULL,NULL,NULL),('Apprnt_Enrg','Apparent Energy, Utility',NULL,NULL,NULL,'VAh'),('Apprnt_Enrg_U','Apparent Energy, Generator',NULL,NULL,NULL,'VAh'),('Aprnt_Pwr_Ph1','Apparent Power, Phase 1',NULL,NULL,NULL,'VA'),('Aprnt_Pwr_Ph2','Apparent Power, Phase 2',NULL,NULL,NULL,'VA'),('Aprnt_Pwr_Ph3','Apparent Power, Phase 3',NULL,NULL,NULL,'VA'),('Aprnt_Pwr_Ttl','Apparent Power, Total',NULL,NULL,NULL,'VA'),('Auto / Manual Status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('Avg_Ld_Percntg','Average Load Percentage',NULL,NULL,NULL,'%Avg Load'),('battery',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('batteryCrossedLcl',NULL,NULL,'batterlow','GL_UNIT_PERCENT','%'),('channel1level',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('channel1mode',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('channel2level',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('channel2mode',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('channel3level',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('channel3mode',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('channel4level',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('channel4mode',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('chill_water_valve',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('Chilled Water Valve Feedback',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('chilled_valve_high',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('chilled_valve_low',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('chilled_water_temp_high',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('chilled_water_temp_low',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('CHW_Flow','Chilled Water - Flow Meter - Flow',NULL,NULL,'GL_UNIT_GPM',NULL),('CHW_Pre','Chilled Water - Coil Supply Pressure',NULL,NULL,'GL_UNIT_PSI',NULL),('CHW_RT','Chilled Water - Return Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('CHW_ST','Chilled Water - Supply Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('CHW_Vlv_Pos','Chilled Water Valve - Position',NULL,NULL,'GL_UNIT_PERCENT',NULL),('CHW_Vlv_Pos_SP','Chilled Water Valve - Position - Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('CO2',NULL,NULL,NULL,'GL_UNIT_PPM','ppm'),('consumption',NULL,NULL,NULL,'GL_UNIT_KILO_WATT_HOUR','Unit'),('Cur_Avg','Current, Average',NULL,NULL,NULL,'mA'),('Cur_Ph1','Current, Phase 1',NULL,NULL,NULL,'mA'),('Cur_Ph2','Current, Phase 2',NULL,NULL,NULL,'mA'),('Cur_Ph3','Current, Phase 3',NULL,NULL,NULL,'mA'),('damper_position',NULL,'Position',NULL,'GL_UNIT_PERCENT','%'),('DPS_Filter','DPS across Filter',NULL,NULL,'GL_UNIT_PSI',NULL),('DPS_RAF_SS','Return Air Fan - Status (DP Switch across RAF)',NULL,NULL,NULL,NULL),('DPS_SAF_SS','DPS across Supply Air Fan - Status (DPS across SAF)',NULL,NULL,'GL_UNIT_STRING',NULL),('DSP','Duct Static Pressure',NULL,NULL,'GL_UNIT_PSI',NULL),('DSP_SP','Duct Static Pressure - Setpoint',NULL,NULL,'GL_UNIT_PSI',NULL),('EA_Dmpr_Pos','Exhaust Air Damper - Position',NULL,NULL,'GL_UNIT_PERCENT',NULL),('EA_Dmpr_Pos_SP','Exhaust Air Damper - Position - Command / Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('em_activePowerPhase1',NULL,'000f',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerPhase2',NULL,'0010',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerPhase3',NULL,'0011',NULL,'GL_UNIT_KILO_WATT','KW'),('em_activePowerTotal',NULL,'000e',NULL,'GL_UNIT_KILO_WATT','KW'),('em_apparentPowerPhase1',NULL,'0017',NULL,NULL,NULL),('em_apparentPowerPhase2',NULL,'0018',NULL,NULL,NULL),('em_apparentPowerPhase3',NULL,'0019',NULL,NULL,NULL),('em_apparentPowerTotal',NULL,'0016',NULL,NULL,NULL),('em_currentAverage',NULL,'0001',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase1',NULL,'0002',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase2',NULL,'0003',NULL,'GL_UNIT_AMPERE','A'),('em_currentPhase3',NULL,'0004',NULL,'GL_UNIT_AMPERE','A'),('em_forwardActiveEnergy',NULL,'001f',NULL,NULL,NULL),('em_forwardApparentEnergy',NULL,'001e',NULL,NULL,NULL),('em_forwardReactiveEnergy',NULL,'0020',NULL,NULL,NULL),('em_Frequency',NULL,'000d',NULL,'GL_UNIT_HERTZ','HZ'),('em_max_DM_occurrence_time_U',NULL,'0029',NULL,NULL,NULL),('em_MAX_MD_U',NULL,'0028',NULL,NULL,NULL),('em_maximumDemand',NULL,'0027',NULL,NULL,NULL),('em_meterID',NULL,'0024',NULL,NULL,NULL),('em_meterOnline_Status',NULL,'0022',NULL,NULL,NULL),('em_powerFactorPhase1',NULL,'001b',NULL,NULL,NULL),('em_powerFactorPhase2',NULL,'001c',NULL,NULL,NULL),('em_powerFactorPhase3',NULL,'001d',NULL,NULL,NULL),('em_powerFactorTotal',NULL,'001a',NULL,NULL,NULL),('em_presentDemand',NULL,'0027',NULL,NULL,NULL),('em_reactivePowerPhase1',NULL,'0013',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerPhase2',NULL,'0014',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerPhase3',NULL,'0015',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_reactivePowerTotal',NULL,'0012',NULL,'GL_KILOVOLT_AMPS_REACTIVE','KVAR'),('em_risingDemand',NULL,'0026',NULL,NULL,NULL),('em_volatage_LL_average',NULL,'0005',NULL,'GL_UNIT_VOLTS','V'),('em_volatage_LN_average',NULL,'0009',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_1_2',NULL,'0006',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_2_3',NULL,'0007',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LL_phase_3_1',NULL,'0008',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_1_2',NULL,'000a',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_2_3',NULL,'000b',NULL,'GL_UNIT_VOLTS','V'),('em_volatge_LN_phase_3_1',NULL,'000c',NULL,'GL_UNIT_VOLTS','V'),('fan_motor_speed',NULL,NULL,NULL,'GL_UNIT_RPM','rpm'),('Fire_Sensor','Fire sensor',NULL,NULL,'GL_UNIT_STRING',NULL),('Freq','Frequency',NULL,NULL,NULL,'Hz'),('Fwd_Act_Enrg','Forward Active Energy',NULL,NULL,NULL,'Wh'),('Fwd_Aprnt_Enrg','Forward Apparent Energy',NULL,NULL,NULL,'VAh'),('Fwd_React_Enrg','Forward Reactive Energy',NULL,NULL,NULL,'VARh'),('Fwd_Run _Secs','Forward Run Seconds',NULL,NULL,NULL,'Seconds'),('health',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('humidity',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('humidityCrossedLcl',NULL,'humidity','dry','GL_UNIT_PERCENT','%'),('humidityCrossedUcl',NULL,'humidity','humid','GL_UNIT_PERCENT','%'),('is_event',NULL,NULL,NULL,'GL_UNIT_TRUE_FALSE',NULL),('lastCmdFrom',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('light_level',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('lqi',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('luminousity',NULL,NULL,NULL,'GL_UNIT_LUMEN','Lumen'),('luminousityCrossedLcl',NULL,'luminousity','dark','GL_UNIT_LUMEN','Lumen'),('luminousityCrossedUcl',NULL,'luminousity','bright','GL_UNIT_LUMEN','Lumen'),('MARH','Mixed Air Relative Humidity',NULL,NULL,'GL_UNIT_PERCENT',NULL),('MAT','Mixed Air Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('Max_Dmd_Occ_Time_U','Maximum Demand Occurrence Time, Utility',NULL,NULL,NULL,'Max DM Occurence Time U'),('Max_Dmd_U','Maximum Demand, Utility',NULL,NULL,NULL,'Max MD U'),('mode',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('NO_ALARM','NoAlarm','','Used to Handle No Alarm Events',NULL,NULL),('No_Inp_Volt_Intr','Number of Input Voltage Interruptions',NULL,NULL,NULL,'Intr'),('noOfLightConnected',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('noOfPirConnected',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('noOfThlConnected',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('OA_Dmpr_Pos','Outside Air Damper - Position',NULL,NULL,'GL_UNIT_PERCENT',NULL),('OA_Dmpr_Pos_SP','Outside Air Damper - Position - Command / Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('OARH','Outside Air Relative Humidity',NULL,NULL,'GL_UNIT_PERCENT',NULL),('OAT','Outside Air Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('occupancy',NULL,NULL,NULL,'GL_UNIT_TRUE_FALSE',NULL),('On _Secs','ON Seconds',NULL,NULL,NULL,'Seconds'),('On_Hr_G','On Hours, Generator',NULL,NULL,NULL,'Hours'),('On_Hr_U','On Hours, Utility',NULL,NULL,NULL,'Hours'),('out_air_valve',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('parentAddress',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('PF_Ph1','Power Factor, Phase 1',NULL,NULL,NULL,'VA'),('PF_Ph2','Power Factor, Phase 2',NULL,NULL,NULL,'VA'),('PF_Ph3','Power Factor, Phase 3',NULL,NULL,NULL,'VA'),('PF_Ttl','Power Factor, Total',NULL,NULL,NULL,'VA'),('Ph1_Ld%','Percentage of Phase 1 Load',NULL,NULL,NULL,'%L1'),('Ph2_Ld%','Percentage of Phase 2 Load',NULL,NULL,NULL,'%L2'),('Ph3_Ld%','Percentage of Phase  Load',NULL,NULL,NULL,'%L3'),('Prsnt_Dmd','Present Demand',NULL,NULL,NULL,'Present Demand'),('RA_Dmpr_Pos','Return Air Damper - Position',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RA_Dmpr_Pos_SP','Return Air Damper - Position - Command / Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RAF_Amps_A','Return Air Fan - Current - Phase A',NULL,NULL,'GL_UNIT_AMPERE',NULL),('RAF_Amps_B','Return Air Fan - Current - Phase B',NULL,NULL,'GL_UNIT_AMPERE',NULL),('RAF_Amps_C','Return Air Fan - Current - Phase C',NULL,NULL,'GL_UNIT_AMPERE',NULL),('RAF_PF_A','Return Air Fan - Power Factor - Phase A',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RAF_PF_B','Return Air Fan - Power Factor - Phase B',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RAF_PF_C','Return Air Fan - Power Factor - Phase C',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RAF_Pwr_A','Return Air Fan - Power - Phase A',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_Pwr_B','Return Air Fan - Power - Phase B',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_Pwr_C','Return Air Fan - Power - Phase C',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('RAF_SS','Return Air Fan - Status (DP Switch across RAF)',NULL,NULL,'GL_UNIT_STRING',NULL),('RAF_Volt_A','Return Air Fan - Voltage - Phase A',NULL,NULL,'GL_UNIT_VOLTS',NULL),('RAF_Volt_B','Return Air Fan - Voltage - Phase B',NULL,NULL,'GL_UNIT_VOLTS',NULL),('RAF_Volt_C','Return Air Fan - Voltage - Phase C',NULL,NULL,'GL_UNIT_VOLTS',NULL),('RAQ_Co2','Return Air Quality - CO2',NULL,NULL,'GL_UNIT_PPM',NULL),('RAQ_Co2_SP','Return Air Quality - CO2 - Setpoint / Min_Threshold',NULL,NULL,'GL_UNIT_PPM',NULL),('RARH','Return Air Relative Humidity',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RARH_SP','Return Air Relative Humidity - Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('RAT','Return Air Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('rat_high',NULL,'RAT High',NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('RAT_SP','Return Air Temperature - Setpoint',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('React_Pwr_Ph1','Reactive Power, Phase 1',NULL,NULL,NULL,'VAR'),('React_Pwr_Ph2','Reactive Power, Phase 2',NULL,NULL,NULL,'VAR'),('React_Pwr_Ph3','Reactive Power, Phase 3',NULL,NULL,NULL,'VAR'),('React_Pwr_Ttl','Reactive Power, Total',NULL,NULL,NULL,'VAR'),('Return Air Temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','degC'),('return_air_valve',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('Rising_Dmd','Rising Demand',NULL,NULL,NULL,'Rising Demand'),('rssi',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('Run_Hr_G','Run Hours, Generator',NULL,NULL,NULL,'Hours'),('Run_Hr_U','Run Hours, Utility',NULL,NULL,NULL,'Hours'),('SA_CFM','Supply Air Flow',NULL,NULL,'GL_UNIT_CFM',NULL),('SA_Dmpr_Pos','Supply Air Damper - Position',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SA_Dmpr_Pos_SP','Supply Air Damper - Position - Command / Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SAF_Amps_A','Supply Air Fan - Current - Phase A',NULL,NULL,'GL_UNIT_AMPERE',NULL),('SAF_Amps_B','Supply Air Fan - Current - Phase B',NULL,NULL,'GL_UNIT_AMPERE',NULL),('SAF_Amps_C','Supply Air Fan - Current - Phase C',NULL,NULL,'GL_UNIT_AMPERE',NULL),('SAF_PF_A','Supply Air Fan - Power Factor - Phase A',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SAF_PF_B','Supply Air Fan - Power Factor - Phase B',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SAF_PF_C','Supply Air Fan - Power Factor - Phase C',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SAF_Pwr_A','Supply Air Fan - Power - Phase A',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_Pwr_B','Supply Air Fan - Power - Phase B',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_Pwr_C','Supply Air Fan - Power - Phase C',NULL,NULL,'GL_UNIT_KILO_WATT',NULL),('SAF_VFD_AM','Supply Air Fan VFD- Auto / Manual - Command',NULL,NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_AM_Fbk','Supply Air Fan VFD- Auto / Manual - Feedback/Status',NULL,NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_On_Off','Supply Air Fan VFD - On / Off - Command',NULL,NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_On_Off_Fbk','Supply Air Fan VFD - On / Off - Feedback',NULL,NULL,'GL_UNIT_STRING',NULL),('SAF_VFD_Speed','Supply Air Fan VFD - Speed - Command',NULL,NULL,'GL_UNIT_RPM',NULL),('SAF_VFD_Speed_Fbk','Supply Air Fan VFD- Speed - Feedback',NULL,NULL,'GL_UNIT_RPM',NULL),('SAF_VFD_Trip_SS','Supply Air Fan VFD- Trip Status',NULL,NULL,'GL_UNIT_STRING',NULL),('SAF_Volt_A','Supply Air Fan - Voltage - Phase A',NULL,NULL,'GL_UNIT_VOLTS',NULL),('SAF_Volt_B','Supply Air Fan - Voltage - Phase B',NULL,NULL,'GL_UNIT_VOLTS',NULL),('SAF_Volt_C','Supply Air Fan - Voltage - Phase C',NULL,NULL,'GL_UNIT_VOLTS',NULL),('sampling_interval',NULL,NULL,NULL,'GL_UNIT_TIME_SECONDS','Sec'),('SARH','Supply Air Relative Humidity',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SARH_SP','Supply Air Relative Humidity - Setpoint',NULL,NULL,'GL_UNIT_PERCENT',NULL),('SAT','Supply Air Temperature',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('SAT_SP','Supply Air Temperature - Setpoint',NULL,NULL,'GL_UNIT_DEG_CENTIGRADE',NULL),('Sensor_type',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('SP_Post_Filter','Static Pressure - Post-Filter',NULL,NULL,'GL_UNIT_PSI',NULL),('SP_Pre_Filter','Static Pressure - Pre-Filter',NULL,NULL,'GL_UNIT_PSI',NULL),('static_pressure',NULL,NULL,NULL,'GL_UNIT_PSI','psi'),('Supply Air Temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('Supply Fan Status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('supply_air_flow',NULL,NULL,NULL,'GL_UNIT_CFM','cfm'),('supply_air_sp',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('supply_air_temp_high',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('supply_air_temp_low',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg c'),('Supply_Fan_Status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('temperature',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('temperature_change',NULL,NULL,NULL,'GL_UNIT_DEG_CENTIGRADE','deg C'),('temperatureCrossedLcl',NULL,'temperature','COLD','GL_UNIT_DEG_CENTIGRADE','deg c'),('temperatureCrossedUcl',NULL,'temperature','HOT','GL_UNIT_DEG_CENTIGRADE','deg c'),('totalConnectedchannels',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('totalConnectedPIR',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('totalConnectedTHL',NULL,NULL,NULL,'GL_UNIT_COUNT',NULL),('type',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('Unbl%_Ld','Unbalanced % Load',NULL,NULL,NULL,'Unblanced % Load'),('Unbl%_Volt','Unbalanced % Voltage',NULL,NULL,NULL,'Unblanced % Voltage'),('ups_BatteryBackupTime',NULL,NULL,NULL,NULL,NULL),('ups_DCInputBatteryVoltage',NULL,NULL,NULL,NULL,NULL),('ups_EfficiencyInstantaneous',NULL,NULL,NULL,NULL,NULL),('ups_EfficiencyMTD',NULL,NULL,NULL,NULL,NULL),('ups_EfficiencyPreviousday',NULL,NULL,NULL,NULL,NULL),('ups_EfficiencyToday',NULL,NULL,NULL,NULL,NULL),('ups_EfficiencyYTD',NULL,NULL,NULL,NULL,NULL),('ups_InputCableVoltage_AB',NULL,NULL,NULL,NULL,NULL),('ups_InputCableVoltage_BC',NULL,NULL,NULL,NULL,NULL),('ups_InputCableVoltage_CA',NULL,NULL,NULL,NULL,NULL),('ups_InputCurrentPhaseA',NULL,NULL,NULL,NULL,NULL),('ups_InputCurrentPhaseB',NULL,NULL,NULL,NULL,NULL),('ups_InputCurrentPhaseC',NULL,NULL,NULL,NULL,NULL),('ups_InputFrequency',NULL,NULL,NULL,NULL,NULL),('ups_InputPowerInstantaneous',NULL,NULL,NULL,NULL,NULL),('ups_InputPowerMTD',NULL,NULL,NULL,NULL,NULL),('ups_InputPowerPreviousday',NULL,NULL,NULL,NULL,NULL),('ups_InputPowerToday',NULL,NULL,NULL,NULL,NULL),('ups_InputPowerYTD',NULL,NULL,NULL,NULL,NULL),('ups_InputVoltagePhaseA',NULL,NULL,NULL,NULL,NULL),('ups_InputVoltagePhaseB',NULL,NULL,NULL,NULL,NULL),('ups_InputVoltagePhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputActivePower_PhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputActivePower_PhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputActivePower_PhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputApparentPower_PhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputApparentPower_PhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputApparentPower_PhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputCurrentPhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputCurrentPhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputCurrentPhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputFrequency',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoad%PhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoad%PhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoad%PhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoadPhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoadPhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputLoadPhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputPowerInstantaneous',NULL,NULL,NULL,NULL,NULL),('ups_OutputPowerMTD',NULL,NULL,NULL,NULL,NULL),('ups_OutputPowerPreviousday',NULL,NULL,NULL,NULL,NULL),('ups_OutputPowerToday',NULL,NULL,NULL,NULL,NULL),('ups_OutputPowerYTD',NULL,NULL,NULL,NULL,NULL),('ups_OutputReactive_Power_PhaseC',NULL,NULL,NULL,NULL,NULL),('ups_OutputReactivePower_PhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputReactivePower_PhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputVoltagePhaseA',NULL,NULL,NULL,NULL,NULL),('ups_OutputVoltagePhaseB',NULL,NULL,NULL,NULL,NULL),('ups_OutputVoltagePhaseC',NULL,NULL,NULL,NULL,NULL),('ups_PositiveBatteryCurrent',NULL,NULL,NULL,NULL,NULL),('ups_PositiveBatteryVoltage',NULL,NULL,NULL,NULL,NULL),('ups_Temperature',NULL,NULL,NULL,NULL,NULL),('vav_volume_percent',NULL,NULL,NULL,'GL_UNIT_PERCENT','%'),('VFD ByPass Status',NULL,NULL,NULL,'GL_UNIT_STRING',NULL),('VFD_Byp_SS','VFD status - (Fan motor through VFD ? Direct bypass\" ?)\"',NULL,NULL,'GL_UNIT_STRING',NULL),('VFD_SS','VFD status - (Fan motor through VFD ? Direct bypass\" ?)\"',NULL,NULL,'GL_UNIT_STRING',NULL),('Volt_LL_Avg','Voltage LL, Average',NULL,NULL,NULL,'V'),('Volt_LL_Ph1','Voltage LL, Phase 1-2',NULL,NULL,NULL,'V'),('Volt_LL_Ph2','Voltage LL, Phase 2-3',NULL,NULL,NULL,'V'),('Volt_LL_Ph3','Voltage LL, Phase 3-1',NULL,NULL,NULL,'V'),('Volt_LN_Avg','Voltage LN, Average',NULL,NULL,NULL,'V'),('Volt_LN_Ph1','Voltage LN, Phase 1-2',NULL,NULL,NULL,'V'),('Volt_LN_Ph2','Voltage LN, Phase 2-3',NULL,NULL,NULL,'V'),('Volt_LN_Ph3','Voltage LN, Phase 3-1',NULL,NULL,NULL,'V');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Parameter Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_location_subsystem_map(
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
      logger.info(`subsystem map Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem_input_map(
        id int NOT NULL AUTO_INCREMENT,
        ss_id varchar(36) DEFAULT NULL,
        triggered_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
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
      logger.info(`Subsystem Input Map Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem_output_map(
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
      logger.info(`Subsystem Output map Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_location_input_map(
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
      logger.info(`Location input Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_location_output_map(
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
      logger.info(`Location output Table Successfully Created`);
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
          KEY fk_occupancy_building_day (building_id),
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
    `CREATE TABLE IF NOT EXISTS daily_floor_occupancy (
          id int(11) AUTO_INCREMENT,
          floor_id varchar(36) NOT NULL,
          occupancy json NOT NULL,
          avg_occupancy int(4) DEFAULT NULL,
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
      logger.info(`Daily Occupancy for Floor Table Successfully Created`);
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
          KEY fk_occupancy_zone_day (zone_id),
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
    `CREATE TABLE IF NOT EXISTS gl_access (
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
      logger.info(`Access Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_alarm (
        id int NOT NULL AUTO_INCREMENT,
        validate tinyint(1) DEFAULT '0',
        ss_id varchar(36) DEFAULT NULL,
        alarm_code varchar(36) DEFAULT NULL,
        measured_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        message varchar(36) DEFAULT NULL,
        possible_causes text,
        acknowledged tinyint(1) DEFAULT '0',
        acknowledged_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        restore tinyint(1) DEFAULT '0',
        restored_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        delete_alarm tinyint(1) DEFAULT '0',
        deleted_time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        user_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        CONSTRAINT gl_alarm_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Alarm Table Successfully Created`);
    }
  );



connection.query(
    `CREATE TABLE IF NOT EXISTS gl_ibms_event(
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
      logger.info(`ibms event Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_schedule(
        id varchar(36) NOT NULL,
        name varchar(255) NOT NULL,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        description varchar(100) DEFAULT NULL,
        cron_tab_fields varchar(100) DEFAULT NULL,
        is_active tinyint(1) DEFAULT '1',
        start datetime NOT NULL,
        end datetime NOT NULL,
        PRIMARY KEY (id)
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
    `CREATE TABLE IF NOT EXISTS gl_location_scheduled_service_map(
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
      logger.info(`scheduled service map Table Successfully Created`);
    }
  );


  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_location_user(
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
      logger.info(`Location user Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_role(
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
      logger.info(`Role Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_role_access(
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
      logger.info(`Role Table Successfully Created`);
    }
  );



connection.query(
    `CREATE TABLE IF NOT EXISTS gl_schedule_detail(
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        param_name varchar(255) DEFAULT NULL,
        param_value varchar(255) DEFAULT NULL,
        schedule_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY fk_gl_schedule_detai (schedule_id),
        CONSTRAINT fk_gl_schedule_detai FOREIGN KEY (schedule_id) REFERENCES gl_schedule (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Schedule detail Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem_detail(
        id int NOT NULL AUTO_INCREMENT,
        created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        param_name varchar(255) DEFAULT NULL,
        param_value varchar(255) DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY fk_gl_subsystem_detail (ss_id),
        CONSTRAINT fk_gl_subsystem_detail FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id) ON DELETE CASCADE
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Subsystem Detail Table Successfully Created`);
    }
  );

  connection.query(
    `INSERT INTO gl_subsystem_detail VALUES (1,'2023-03-13 14:51:33','2023-04-07 17:26:32','restart','1','646b2b1f-c16d-11ed-948f-f80dac57b061');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Subsystem detail Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem_latest_event(
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
      logger.info(`Subsystem Latest event Table Successfully Created`);
    }
  );



connection.query(
    `CREATE TABLE IF NOT EXISTS gl_subsystem_process_map(
        id int NOT NULL AUTO_INCREMENT,
        process_id int DEFAULT NULL,
        ss_id varchar(36) DEFAULT NULL,
        param_id varchar(36) DEFAULT NULL,
        param_value varchar(36) DEFAULT NULL,
        status varchar(255) DEFAULT NULL,
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY ss_id (ss_id),
        KEY param_id (param_id),
        KEY gl_subsystem_process_map_ibfk_3 (process_id),
        CONSTRAINT gl_subsystem_process_map_ibfk_1 FOREIGN KEY (ss_id) REFERENCES gl_subsystem (id),
        CONSTRAINT gl_subsystem_process_map_ibfk_2 FOREIGN KEY (param_id) REFERENCES gl_parameter (id),
        CONSTRAINT gl_subsystem_process_map_ibfk_3 FOREIGN KEY (process_id) REFERENCES gl_subsystem_input_map (id)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Subsystem Process map Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user(
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
      logger.info(`User Table Successfully Created`);
    }
  );



connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user_role(
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
      logger.info(`User Role Table Successfully Created`);
    }
  );

connection.query(
    `CREATE TABLE IF NOT EXISTS gl_user_session(
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
      logger.info(`User Session Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS latest_event(
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
      logger.info(`latest event Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS parking_status(
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
      logger.info(`Parking Status Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS schedule(
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
    `CREATE TABLE IF NOT EXISTS session(
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
      logger.info(`session Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS super_admin(
      id varchar(36) NOT NULL,
      username varchar(45) NOT NULL,
      password varchar(180) NOT NULL,
      role_name varchar(24) NOT NULL,
      role_id int(11) NOT NULL,
      total_devices int(11) NOT NULL,
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
      logger.info(`super_admin Table Successfully Created`);
    }
  );

connection.query(
    `
    INSERT INTO super_admin (id,username,password,role_name,role_id,total_devices,mac_address,created_at,updated_at,last_login) VALUES (
    '495d7894-f9cc-4e5b-93ec-b18ae63f9d4c','admin','$2a$12$FPIIA6h6XwpIaZIubP8FPO.6.uuf7fK7YLe17G1Zs5Pu88.7wWSka',
    'superAdmin',1,100,'$2a$12$s4BY6xtYOx/YA5vtG6uvtuoVz3gTRcrTkx/M4DiYFZ607n.xOwjci','2019-05-07 00:21:08','2023-06-05 06:50:59','');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Super Admin Added Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS user(
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
      logger.info(`user Table Successfully Created`);
    }
  );

connection.query(
    `insert into user (id,username,password,role_id,role_name,status,created_at, updated_at) values 
("495d7894-f9cc-4e5b-93ec-b18ae63f9d4c","admin","$2a$12$FPIIA6h6XwpIaZIubP8FPO.6.uuf7fK7YLe17G1Zs5Pu88.7wWSka","1","superAdmin","1","2019-05-07 00:21:08","2023-06-05 06:50:59");`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`User Added Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS hvac_schedule(
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
      logger.info(`HVAC schedule Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS hvac_recurring_schedule(
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
      logger.info(`Recurring schedule Table Successfully Created`);
    }
  );
  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_timestamp(
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
      logger.info(`Timestamp Table Successfully Created`);
    }
  );

  connection.query(
    `CREATE TABLE IF NOT EXISTS gl_schedule_map(
        id varchar(36) NOT NULL,
        zone_id varchar(36) DEFAULT NULL,
        time_id varchar(36) DEFAULT NULL,
        schedule_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        recurring_status enum('GL_SS_STATUS_ACTIVE','GL_SS_STATUS_INACTIVE') DEFAULT 'GL_SS_STATUS_ACTIVE',
        arguments json NOT NULL,
        expected_status varchar(255) DEFAULT 'pending',
        created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
        modified_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        name varchar(36) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY zone_id (zone_id),
        KEY time_id (time_id),
        CONSTRAINT gl_schedule_map_ibfk_1 FOREIGN KEY (zone_id) REFERENCES gl_location (id),
        CONSTRAINT gl_schedule_map_ibfk_2 FOREIGN KEY (time_id) REFERENCES gl_timestamp (id)
    )`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`Schedule detail Table Successfully Created`);
    }
  );


connection.end();