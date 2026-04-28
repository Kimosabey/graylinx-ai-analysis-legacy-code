const mysql = require('mysql');
const logger = require('../Config/logger');
const config = require('../Config/common').mysql;

const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

connection.connect(err => {
  if (err) {
    logger.error('Energy schema DB connect error', err) ;
    return;
  }
  logger.info('Connected for Energy schema init');
});

// These tables are created for analytics of energy consumption by hour, day and week
// In all tables device type ==> 
// PLANT =  whole plant's devices, 
// ASSET = Main Assets like Chiller, Cooling Towers ....
// EQUIPMENT = devices coresponding to Assets like fan1,fan2...
/* ============ ENERGY HOURLY ============ */
connection.query(`
CREATE TABLE IF NOT EXISTS energy_hourly_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type varchar(36) NOT NULL,              
  device_id VARCHAR(50) NOT NULL,
  device_name VARCHAR(150) NOT NULL,
  hour_start DATETIME NOT NULL,
  energy_kwh DECIMAL(15,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_hour (device_type, device_id, hour_start)
)`, log('energy_hourly'));

/* ============ ENERGY DAILY ============ */
connection.query(`
CREATE TABLE IF NOT EXISTS energy_daily_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type varchar(36) NOT NULL,
  device_id VARCHAR(50) NOT NULL,
  device_name VARCHAR(150) NOT NULL,
  day_date DATE NOT NULL,
  energy_kwh DECIMAL(15,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_day (device_type, device_id, day_date)
)`, log('energy_daily'));

/* ============ ENERGY WEEKLY ============ */
connection.query(`
CREATE TABLE IF NOT EXISTS energy_weekly_analytics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_type varchar(36) NOT NULL,
  device_id VARCHAR(50) NOT NULL,
  device_name VARCHAR(150) NOT NULL,
  week_start DATE NOT NULL,
  week_label VARCHAR(10) NOT NULL,
  energy_kwh DECIMAL(15,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_week (device_type, device_id, week_start)
)`, log('energy_weekly'));

/* ============ STORING GENERATED REPORTS EXCEL FILES ============ */
connection.query(`
CREATE TABLE IF NOT EXISTS generated_reports (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_path VARCHAR(255),
  from_time DATETIME,
  to_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`, log('generated_reports'));

/* ============ USER SUBSCRIPTION FOR REPORT SENDING ============ */
connection.query(`
CREATE TABLE IF NOT EXISTS report_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  report_type VARCHAR(50) DEFAULT 'CHILLER_REPORT',
  email_ids TEXT NOT NULL,
  frequency ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_report_subscription_user
    FOREIGN KEY (user_id)
    REFERENCES user(id)
    ON DELETE CASCADE
);
`, log('report_subscriptions'));

function log(table) {
  return err => {
    if (err) logger.error(err.message);
    else logger.info(`${table} ready`);
  };
}

