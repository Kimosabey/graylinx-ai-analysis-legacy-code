/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG TABLE  —  one row per physical device (ss_id)

   HOW TO ADD A NEW PROJECT / DEVICE:
     1. Find the device's UUID in gl_subsystem.id  → use it as ss_id
     2. Set energy_table to the FULL table name that holds the energy readings
        (e.g.  'ch_001_om_p'  or  'em_004_metrics')
     3. Set energy_table_type based on what columns that table uses:
           om_p   → param_id  / param_value
           metric → metric_id / metric_value
     4. Choose calc_method:
           CUMULATIVE_DELTA → device has an ever-increasing energy counter
                              formula: MAX(value > 0) – MIN(value > 0) per hour
                              zeros are fully ignored (device glitch protection)
           AVG_POWER        → device reports instantaneous power (Watts/kW)
                              formula: AVG(value) per hour
     5. Choose run_status_source and fill run fields accordingly:
           SAME_TABLE  → run param is in the same energy_table
                         set run_param_1 (and run_param_2 for dual-channel)
                         leave run_table = NULL
           CROSS_TABLE → run param is in a SEPARATE table
                         set run_table (full table name) + run_table_type
                         set run_param_1 (and run_param_2 for dual-channel)
           POWER_PROXY → no dedicated run param exists
                         energy > 0 is treated as "device is running"
                         leave run_table = NULL, run_param_1 = NULL
     6. For dual-channel devices fill energy_param_2 / run_param_2;
        leave both NULL for single-channel devices
     7. Set use_abs = 1 if the raw value can be negative (wraps in ABS())

   No changes to the stored procedure are ever needed — only this config table.
   ═══════════════════════════════════════════════════════════════════════════ */

CREATE TABLE IF NOT EXISTS energy_analytics_config (
  id                INT          AUTO_INCREMENT PRIMARY KEY,
  ss_id             VARCHAR(36)  NOT NULL UNIQUE   COMMENT 'Matches gl_subsystem.id — one row per device',
  device_type       VARCHAR(100) NOT NULL           COMMENT 'Label written to energy_hourly_analytics',
  energy_table      VARCHAR(150) NOT NULL           COMMENT 'Full energy table name (e.g. ch_001_om_p)',
  energy_table_type VARCHAR(10)  NOT NULL DEFAULT 'om_p'
                                                    COMMENT 'om_p: param_id/param_value  |  metric: metric_id/metric_value',
  run_table         VARCHAR(150) DEFAULT NULL       COMMENT 'Full run-status table name (NULL for SAME_TABLE or POWER_PROXY)',
  run_table_type    VARCHAR(10)  NOT NULL DEFAULT 'om_p'
                                                    COMMENT 'om_p: param_id/param_value  |  metric: metric_id/metric_value',
  calc_method       VARCHAR(20)  NOT NULL           COMMENT 'AVG_POWER | CUMULATIVE_DELTA',
  energy_param_1    VARCHAR(100) NOT NULL           COMMENT 'ID value for energy channel 1',
  run_param_1       VARCHAR(100) DEFAULT NULL       COMMENT 'ID value for run-status channel 1 (NULL = no gate)',
  energy_param_2    VARCHAR(100) DEFAULT NULL       COMMENT 'ID value for energy channel 2 (NULL = single-channel)',
  run_param_2       VARCHAR(100) DEFAULT NULL       COMMENT 'ID value for run-status channel 2',
  run_status_source VARCHAR(20)  NOT NULL DEFAULT 'SAME_TABLE'
                                                    COMMENT 'SAME_TABLE | CROSS_TABLE | POWER_PROXY',
  use_abs           TINYINT(1)   NOT NULL DEFAULT 1 COMMENT 'Apply ABS() to energy value column'
);

/* ═══════════════════════════════════════════════════════════════════════════
   SEED / REFRESH CONFIG ROWS  —  safe to re-run (ON DUPLICATE KEY UPDATE)

   QUICK DECISION GUIDE
   ────────────────────
   What type is the energy table?
     columns are param_id / param_value  → energy_table_type = 'om_p'
     columns are metric_id / metric_value → energy_table_type = 'metric'
   (same logic applies to run_table_type)

   How does the device measure energy?
     counter that keeps increasing (kWh meter) → calc_method = 'CUMULATIVE_DELTA'
     real-time power readings (Watts/kW)       → calc_method = 'AVG_POWER'

   Where is the ON/OFF run-status stored?
     same table as energy data  → run_status_source = 'SAME_TABLE',  run_table = NULL
     a completely separate table → run_status_source = 'CROSS_TABLE', set run_table
     no run-status param at all  → run_status_source = 'POWER_PROXY', run_table = NULL,
                                   run_param_1 = NULL  (gates by energy value > 0)

   Does the device have two independent channels (e.g. two compressors)?
     YES → fill energy_param_2 and run_param_2
     NO  → leave energy_param_2 = NULL, run_param_2 = NULL

   Replace the ss_id placeholder values below with real gl_subsystem.id UUIDs.
   ═══════════════════════════════════════════════════════════════════════════ */
INSERT INTO energy_analytics_config
  (ss_id,
   device_type,            energy_table,           energy_table_type,
   run_table,              run_table_type,
   calc_method,
   energy_param_1,         run_param_1,
   energy_param_2,         run_param_2,
   run_status_source,      use_abs)
VALUES
  /* ── Example 1: Chiller ────────────────────────────────────────────────
     Two compressors (dual-channel).
     Energy counter + run ON/OFF are in the SAME om_p table.
     use_abs = 0 because counter values are always positive.          ── */
  ('cadef4f8-e666-4cab-8269-45845651295b',
   'CHILLER',              'em_0001000000_om_p',          'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',         NULL,
    NULL,                   NULL,
   'POWER_PROXY',           0),

  ('68de500d-8f7f-4b3f-88f4-9cfb45f8668f',
   'CHILLER',              'em_0002000000_om_p',          'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',        NULL,
    NULL,                  NULL,
   'POWER_PROXY',           0),

  /* ── Primary variable pumps ── */
  ('08c82cf5-101e-4266-98da-9da5dbdd826d',
   'PRIMARY_VARIABLE_PUMP','pu_0001b10000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('4f9b7a31-1674-41a8-938f-28d6592df85b',
   'PRIMARY_VARIABLE_PUMP','pu_0002b10000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('b147e494-b8e4-48a1-a4cd-ce88df1dabfd',
   'PRIMARY_VARIABLE_PUMP','pu_0003b10000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  /* ── Secondary pumps ── */
  ('da7cf956-b99e-4ab0-9998-f261145154c8',
   'SECONDARY_PUMP', 'secpu_0001b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('4a738eec-6eb4-4c79-9927-2743362a9ae3',
   'SECONDARY_PUMP', 'secpu_0002b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('cbd9592d-c5ca-4526-9bd2-807dc97e58fa',
   'SECONDARY_PUMP', 'secpu_0003b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('372fad6e-9f70-4765-a4d9-99f6fcb0c758',
   'SECONDARY_PUMP', 'secpu_0004b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('4f4fa7f0-3c29-4d27-afc0-903a94ac9154',
   'SECONDARY_PUMP', 'secpu_0005b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('d850739a-1268-4657-b062-637d52cea9c2',
   'SECONDARY_PUMP', 'secpu_0006b30000_om_p',           'om_p',
   NULL,          'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  /* ── Cooling towers ── */
  ('bddbcfb8-2777-4a8e-b64a-0017b82fe120',
   'COOLING_TOWER',        'em_0007000000_om_p',           'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,              NULL,
   'POWER_PROXY',           0),

  ('69a77e04-a558-45b5-97a1-c33c793bb36a',
   'COOLING_TOWER',        'em_0008000000_om_p',           'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,              NULL,
   'POWER_PROXY',           0),

  ('4c6a0293-c361-4ff9-a34e-00f55a0870f8',
   'COOLING_TOWER',        'em_0009000000_om_p',           'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',   NULL,
   NULL,              NULL,
   'POWER_PROXY',           0),

  /* ── Condenser pumps ── */
  ('b5884cf4-89b4-4eef-8a3e-300e5655d7b4',
   'CONDENSER_PUMP',       'condpu_0001b40000_om_p',        'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',        NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('52c11abe-ba9f-43b7-aadf-5b6f95a021a5',
   'CONDENSER_PUMP',       'condpu_0002b40000_om_p',        'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',        NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0),

  ('6577fa4e-6073-426f-a77d-e19979390125',
   'CONDENSER_PUMP',       'condpu_0003b40000_om_p',        'om_p',
   NULL,                   'om_p',
   'CUMULATIVE_DELTA',
   'par_energy_00',        NULL,
   NULL,                   NULL,
   'POWER_PROXY',          0)

ON DUPLICATE KEY UPDATE
  device_type       = VALUES(device_type),
  energy_table      = VALUES(energy_table),
  energy_table_type = VALUES(energy_table_type),
  run_table         = VALUES(run_table),
  run_table_type    = VALUES(run_table_type),
  calc_method       = VALUES(calc_method),
  energy_param_1    = VALUES(energy_param_1),
  run_param_1       = VALUES(run_param_1),
  energy_param_2    = VALUES(energy_param_2),
  run_param_2       = VALUES(run_param_2),
  run_status_source = VALUES(run_status_source),
  use_abs           = VALUES(use_abs);


DROP PROCEDURE IF EXISTS sp_populate_energy_hourly_dynamic;
DELIMITER $$

CREATE PROCEDURE sp_populate_energy_hourly_dynamic()
BEGIN
  DECLARE done INT DEFAULT 0;

  DECLARE v_ss_id VARCHAR(36);
  DECLARE v_ss_name VARCHAR(150);
  DECLARE v_ss_type VARCHAR(100);
  DECLARE v_addr VARCHAR(50);

  DECLARE v_table VARCHAR(100);
  DECLARE v_param_id VARCHAR(100);
  DECLARE v_entity_type VARCHAR(100);

 DECLARE cur CURSOR FOR
SELECT id, name, ss_type, ss_address_value
FROM gl_subsystem
WHERE ss_type IN (
    'NONGL_SS_EMS',
    'NONGL_SS_PRIMARY_VARIABLE_PUMPS'
)
AND (
    LOWER(TRIM(name)) LIKE '%chiller%'
 OR LOWER(TRIM(name)) LIKE '%condenser_pump%'
 OR LOWER(TRIM(name)) LIKE '%cooling_tower%'
 OR LOWER(TRIM(name)) LIKE '%primary%'
);

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;

  read_loop: LOOP
    FETCH cur INTO v_ss_id, v_ss_name, v_ss_type, v_addr;
    IF done = 1 THEN
      LEAVE read_loop;
    END IF;

/* ---------- ENTITY TYPE LOGIC (FINAL) ---------- */
SET v_ss_name = LOWER(TRIM(v_ss_name));

IF v_ss_name LIKE '%chiller%' THEN
  SET v_entity_type = 'CHILLER';

ELSEIF v_ss_name LIKE '%primary%' THEN
  SET v_entity_type = 'PRIMARY_VARIABLE_PUMP';

ELSEIF v_ss_name LIKE '%cooling_tower%' THEN
  SET v_entity_type = 'COOLING_TOWER';

ELSEIF v_ss_name LIKE '%pump%' THEN
  SET v_entity_type = 'CONDENSER_PUMP';

ELSE
  SET v_entity_type = 'EQUIPMENT';
END IF;


    /* ---------- TABLE + PARAMETER ---------- */
    IF v_ss_type = 'NONGL_SS_EMS' THEN
      SET v_table = CONCAT('em_', v_addr, '_om_p');
      SET v_param_id = 'em_par_active_pwr_avg_0';
    ELSE
      SET v_table = CONCAT('pv_', v_addr, '_om_p');
      SET v_param_id = 'PriV_Pmp_Drive_Power';
    END IF;

    /* ---------- DYNAMIC SQL (EAV SAFE) ---------- */
    SET @v_sql = CONCAT(
      'INSERT INTO energy_hourly_analytics ',
      '(device_type, device_id, device_name, hour_start, energy_kwh) ',
      'SELECT ',
        '''', v_entity_type, ''', ',
        '''', v_ss_id, ''', ',
        '''', REPLACE(v_ss_name, '''', ''''''), ''', ',
        'DATE_FORMAT(created_at, ''%Y-%m-%d %H:00:00''), ',
        'AVG(ABS(param_value)) ',
      'FROM ', v_table, ' ',
      'WHERE param_id = ''', v_param_id, ''' ',
      'AND param_value IS NOT NULL ',
      'GROUP BY DATE_FORMAT(created_at, ''%Y-%m-%d %H:00:00'') ',
      'ON DUPLICATE KEY UPDATE ',
        'energy_kwh = VALUES(energy_kwh), ',
        'device_name = VALUES(device_name)'
    );

    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;

  END LOOP;

  CLOSE cur;

END$$
DELIMITER ;


/* ------------------------------------------------------------------------------------------------------*/



/* ------------------------------------------------------------------------------------------------------*/


/*------------------------ Schedule hourly procedure ----------------*/

DROP EVENT IF EXISTS ev_energy_hourly_analytics;
DELIMITER $$

CREATE EVENT ev_energy_hourly_analytics
ON SCHEDULE
  EVERY 1 HOUR
  STARTS (
    TIMESTAMP(
      CURRENT_DATE,
      MAKETIME(HOUR(NOW()), 5, 0)
    ) + INTERVAL (MINUTE(NOW()) >= 5) HOUR
  )
DO
BEGIN
  CALL sp_populate_energy_hourly_dynamic();
END$$

DELIMITER ;

/* ---------------------- call procedure once in database ----------*/
CALL sp_populate_energy_hourly_dynamic();


/* ----------------- Insert daily data from energy_hourly_analysis----------------*/

-- Procedure: sp_populate_energy_daily
DROP PROCEDURE IF EXISTS sp_populate_energy_daily;
DELIMITER $$

CREATE PROCEDURE sp_populate_energy_daily()
BEGIN
  DECLARE v_day DATE;

  -- calculate for yesterday (safe, full data)
  SET v_day = DATE_SUB(CURDATE(), INTERVAL 1 DAY);

  INSERT INTO energy_daily_analytics
  (
    device_type,
    device_id,
    device_name,
    day_date,
    energy_kwh
  )
  SELECT
    device_type,
    device_id,
    device_name,
    DATE(hour_start) AS day_date,
    SUM(energy_kwh) AS energy_kwh
  FROM energy_hourly_analytics
  WHERE DATE(hour_start) = v_day
  GROUP BY
    device_type,
    device_id,
    device_name,
    DATE(hour_start)
  ON DUPLICATE KEY UPDATE
    energy_kwh = VALUES(energy_kwh),
    device_name = VALUES(device_name);

END$$
DELIMITER ;

/* ----------------- Daily → Weekly ----------------*/

-- Procedure: sp_populate_energy_weekly
DROP PROCEDURE IF EXISTS sp_populate_energy_weekly;
DELIMITER $$

CREATE PROCEDURE sp_populate_energy_weekly()
BEGIN
  DECLARE v_week_start DATE;
  DECLARE v_week_label VARCHAR(10);

  -- previous week Monday
  SET v_week_start =
    DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 7) DAY);

  SET v_week_label = CONCAT('WEEK_', LPAD(WEEK(v_week_start, 1), 2, '0'));

  INSERT INTO energy_weekly_analytics
  (
    device_type,
    device_id,
    device_name,
    week_start,
    week_label,
    energy_kwh
  )
  SELECT
    device_type,
    device_id,
    device_name,
    v_week_start,
    v_week_label,
    SUM(energy_kwh) AS energy_kwh
  FROM energy_daily_analytics
  WHERE day_date BETWEEN v_week_start AND DATE_ADD(v_week_start, INTERVAL 6 DAY)
  GROUP BY
    device_type,
    device_id,
    device_name
  ON DUPLICATE KEY UPDATE
    energy_kwh = VALUES(energy_kwh),
    device_name = VALUES(device_name);

END$$
DELIMITER ;


/* SCHEDULING (MYSQL EVENTS)

⚠️ Before creating events (mandatory):

SET GLOBAL event_scheduler = ON;

🕛 DAILY EVENT — 12:20 AM (Every Day)
✔ Uses yesterday's data
*/

DROP EVENT IF EXISTS ev_energy_daily;
CREATE EVENT ev_energy_daily
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURDATE() + INTERVAL 20 MINUTE)
DO
  CALL sp_populate_energy_daily();


CALL sp_populate_energy_daily();

/* WEEKLY EVENT — Monday 12:30 AM */
DROP EVENT IF EXISTS ev_energy_weekly;
CREATE EVENT ev_energy_weekly
ON SCHEDULE EVERY 1 WEEK
STARTS
  TIMESTAMP(
    DATE_ADD(
      DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY),
      INTERVAL 1 WEEK
    ) + INTERVAL 30 MINUTE
  )
DO
  CALL sp_populate_energy_weekly();

CALL sp_populate_energy_weekly();


INSERT INTO energy_daily_analytics
(
    device_type,
    device_id,
    device_name,
    day_date,
    energy_kwh
)
SELECT
    device_type,
    device_id,
    device_name,
    DATE(hour_start) AS day_date,
    SUM(energy_kwh) AS energy_kwh
FROM energy_hourly_analytics
GROUP BY
    device_type,
    device_id,
    device_name,
    DATE(hour_start)
ON DUPLICATE KEY UPDATE
    energy_kwh = VALUES(energy_kwh),
    device_name = VALUES(device_name);


INSERT INTO energy_daily_analytics
(
    device_type,
    device_id,
    device_name,
    day_date,
    energy_kwh
)
SELECT
    device_type,
    device_id,
    device_name,
    DATE(hour_start) AS day_date,
    SUM(energy_kwh) AS energy_kwh
FROM energy_hourly_analytics
GROUP BY
    device_type,
    device_id,
    device_name,
    DATE(hour_start)
ON DUPLICATE KEY UPDATE
    energy_kwh = VALUES(energy_kwh),
    device_name = VALUES(device_name);