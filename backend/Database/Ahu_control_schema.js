const mysql = require('mysql');

const logger = require('../Config/logger');
const config = require('../Config/common').mysql;

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database:config.database
});

connection.connect(err => {
  if (err) {
    logger.error(err);
    return;
  }
  logger.info('Mysql Connected to Create Database and Table schemas');
});

//SET FOREIGN_KEY_CHECKS=0

connection.query(
    `SET FOREIGN_KEY_CHECKS=0`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`FOREIGN_KEY_CHECKS=0`);
    }
);


//truncate gl_subsystem_input_map;

connection.query(
    `TRUNCATE gl_subsystem_input_map`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`gl_subsystem_input_map table truncated successfully`);
    }
);


//truncate gl_subsystem_process_map;

connection.query(
  `truncate gl_subsystem_process_map`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`successfully truncated the gl_subsystem_process_map table`);
  }
);

//SET FOREIGN_KEY_CHECKS=1

connection.query(
  `SET FOREIGN_KEY_CHECKS=1`,
  error => {
    if (error) {
      logger.error(error.message);
      return;
    }
    logger.info(`FOREIGN_KEY_CHECKS=1`);
  }
);


// INSERT INTO gl_subsystem_input_map VALUES
// ('1','01f8d696-5abc-4ba1-a3be-415bedaed456','2022-05-19 09:25:04','ahu_set_point','25','2022-05-19 09:25:04','2022-05-19 09:25:04');


connection.query(
    `INSERT INTO gl_subsystem_input_map (id,ss_id,param_id,param_value) VALUES
('1','01f8d696-5abc-4ba1-a3be-415bedaed456','ahu_set_point','25')`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`set point added successfully to gl_subsystem_input_map`);
    }
);


// INSERT INTO gl_subsystem_process_map VALUES
// ('1','1','01f8d696-5abc-4ba1-a3be-415bedaed456','ahu_set_point','25','processing','2022-05-19 09:25:04','2022-05-19 09:25:04'),
// ('2','1','01f8d696-5abc-4ba1-a3be-415bedaed456','return_air_valve','0','processing','2022-05-19 09:25:04','2022-05-19 09:25:04'),
// ('3','1','01f8d696-5abc-4ba1-a3be-415bedaed456','out_air_valve','100','processing','2022-05-19 09:25:04','2022-05-19 09:25:04'),
// ('4','1','01f8d696-5abc-4ba1-a3be-415bedaed456','chill_water_valve','14.23','processing','2022-05-19 09:25:04','2022-05-19 09:25:20'),
// ('5','1','01f8d696-5abc-4ba1-a3be-415bedaed456','fan_motor_speed','3','processing','2022-05-19 09:25:04','2022-05-19 09:25:04');


connection.query(
    `INSERT INTO gl_subsystem_process_map (id,process_id,ss_id,param_id,param_value,status) VALUES
('1','1','01f8d696-5abc-4ba1-a3be-415bedaed456','ahu_set_point','25','processing'),
('2','1','01f8d696-5abc-4ba1-a3be-415bedaed456','return_air_valve','0','processing'),
('3','1','01f8d696-5abc-4ba1-a3be-415bedaed456','out_air_valve','100','processing'),
('4','1','01f8d696-5abc-4ba1-a3be-415bedaed456','chill_water_valve','14.23','processing'),
('5','1','01f8d696-5abc-4ba1-a3be-415bedaed456','fan_motor_speed','3','processing');`,
    error => {
      if (error) {
        logger.error(error.message);
        return;
      }
      logger.info(`data added to gl_subsystem_process_map table`);
    }
);


connection.end();