/* ============================================================
   PROCEDURE 1: process_kwh_master
   First run  : process ALL historical rows from raw table
                kWh for every consecutive pair, cumulative running sum
                first row kWh = 0
   Subsequent : only last 2 raw rows → 1 new kWh record
   measured_time = created_at of the current row
   ============================================================ */

DROP PROCEDURE IF EXISTS process_kwh_master;
DELIMITER $$

CREATE PROCEDURE process_kwh_master(
    IN p_raw_table    VARCHAR(100),
    IN p_metric_table VARCHAR(100),
    IN p_param_id     VARCHAR(100)
)
proc_label: BEGIN

    # Check if any kWh already exists for this device
    SET @sql_check = CONCAT(
        'SELECT MAX(measured_time) INTO @last_time
         FROM ', p_metric_table, '
         WHERE metric_id = ''kWh'''
    );
    PREPARE s FROM @sql_check; EXECUTE s; DEALLOCATE PREPARE s;

    IF @last_time IS NULL THEN
        # ── FIRST RUN: process all historical rows ────────────────────────────
        SET @sql_all = CONCAT(
            'INSERT INTO ', p_metric_table, '
             (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
             SELECT
                 ss_id,
                 created_at AS measured_time,
                 ''kWh'',
                 ROUND(
                     CASE
                         WHEN LAG(created_at) OVER (PARTITION BY ss_id ORDER BY created_at) IS NULL
                         THEN 0
                         ELSE
                            ((LAG(ABS(param_value)) OVER (PARTITION BY ss_id ORDER BY created_at) + ABS(param_value)) / 2)
                             * (TIMESTAMPDIFF(SECOND,
                                 LAG(created_at) OVER (PARTITION BY ss_id ORDER BY created_at),
                                 created_at) / 3600)
                     END
                 , 4),
                 NOW(), NOW()
             FROM ', p_raw_table, '
             WHERE param_id = ''', p_param_id, '''
             ON DUPLICATE KEY UPDATE
                 metric_value = VALUES(metric_value),
                 modified_at  = NOW()'
        );
        PREPARE s FROM @sql_all; EXECUTE s; DEALLOCATE PREPARE s;

        # Cumulative kWh for all rows
        SET @sql_cum_all = CONCAT(
            'INSERT INTO ', p_metric_table, '
             (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
             SELECT ss_id, measured_time, ''CUMULATIVE_kWh'',
                 ROUND(
                     SUM(metric_value) OVER (
                         PARTITION BY ss_id ORDER BY measured_time
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                     )
                 , 2),
                 NOW(), NOW()
             FROM ', p_metric_table, '
             WHERE metric_id = ''kWh''
             ON DUPLICATE KEY UPDATE
                 metric_value = VALUES(metric_value),
                 modified_at  = NOW()'
        );
        PREPARE s FROM @sql_cum_all; EXECUTE s; DEALLOCATE PREPARE s;

    ELSE
        # ── SUBSEQUENT RUN: only last 2 raw rows ─────────────────────────────
        # Get last (current) raw row — ABS on param_value
        SET @sql_curr = CONCAT(
            'SELECT created_at, ABS(param_value), ss_id INTO @curr_time, @curr_kw, @ss_id
             FROM ', p_raw_table, '
             WHERE param_id = ''', p_param_id, '''
             ORDER BY created_at DESC LIMIT 1'
        );
        PREPARE s FROM @sql_curr; EXECUTE s; DEALLOCATE PREPARE s;

        # Skip if already processed
        IF @curr_time <= @last_time THEN
            LEAVE proc_label;
        END IF;

        # Get previous raw row — ABS on param_value
        SET @sql_prev = CONCAT(
            'SELECT created_at, ABS(param_value) INTO @prev_time, @prev_kw
             FROM ', p_raw_table, '
             WHERE param_id = ''', p_param_id, '''
             AND created_at < ''', @curr_time, '''
             ORDER BY created_at DESC LIMIT 1'
        );
        PREPARE s FROM @sql_prev; EXECUTE s; DEALLOCATE PREPARE s;

        # Calculate kWh
        IF @prev_time IS NULL THEN
            SET @kwh = 0;
        ELSE
            SET @dt_hrs = TIMESTAMPDIFF(SECOND, @prev_time, @curr_time) / 3600.0;
            SET @kwh = ROUND((((@prev_kw + @curr_kw) / 2) * @dt_hrs), 4);
        END IF;

        # Get last cumulative
        SET @sql_cum = CONCAT(
            'SELECT IFNULL(metric_value, 0) INTO @last_cum_kwh
             FROM ', p_metric_table, '
             WHERE metric_id = ''CUMULATIVE_kWh''
             ORDER BY measured_time DESC LIMIT 1'
        );
        PREPARE s FROM @sql_cum; EXECUTE s; DEALLOCATE PREPARE s;
        IF @last_cum_kwh IS NULL THEN SET @last_cum_kwh = 0; END IF;

        SET @cum_kwh = ROUND(@last_cum_kwh + @kwh, 2);

        # Insert
        SET @sql_ins = CONCAT(
            'INSERT INTO ', p_metric_table, '
             (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
             VALUES
             (''', @ss_id, ''', ''', @curr_time, ''', ''kWh'',            ', @kwh,     ', NOW(), NOW()),
             (''', @ss_id, ''', ''', @curr_time, ''', ''CUMULATIVE_kWh'', ', @cum_kwh,  ', NOW(), NOW())
             ON DUPLICATE KEY UPDATE
                 metric_value = VALUES(metric_value),
                 modified_at  = NOW()'
        );
        PREPARE s FROM @sql_ins; EXECUTE s; DEALLOCATE PREPARE s;

    END IF;

END$$
DELIMITER ;


/* ============================================================
   PROCEDURE 3: process_ct_fan_kwh
   First run  : process ALL historical rows per fan
   Subsequent : only last 2 rows per fan
   ============================================================ */

DROP PROCEDURE IF EXISTS process_ct_fan_kwh;
DELIMITER $$

CREATE PROCEDURE process_ct_fan_kwh(
    IN p_raw_table    VARCHAR(100),
    IN p_metric_table VARCHAR(100)
)
BEGIN
    DECLARE v_fan_param  VARCHAR(100);
    DECLARE v_fan_metric VARCHAR(100);
    DECLARE v_fan_cum    VARCHAR(100);
    DECLARE v_idx        INT DEFAULT 1;

    fan_loop: LOOP
        IF v_idx > 2 THEN LEAVE fan_loop; END IF;

        CASE v_idx
            WHEN 1 THEN
                SET v_fan_param  = 'par_comp_avg_power_01';
                SET v_fan_metric = 'kWh_C1CP1';
                SET v_fan_cum    = 'c_kWh_CP1';
            WHEN 2 THEN
                SET v_fan_param  = 'par_comp_avg_power_02';
                SET v_fan_metric = 'kWh_C1CP2';
                SET v_fan_cum    = 'c_kWh_CP2';
        END CASE;

        -- Check if first run for this fan
        SET @sql_fchk = CONCAT(
            'SELECT MAX(measured_time) INTO @f_last_time
             FROM ', p_metric_table, '
             WHERE metric_id = ''', v_fan_metric, ''''
        );
        PREPARE s FROM @sql_fchk; EXECUTE s; DEALLOCATE PREPARE s;

        IF @f_last_time IS NULL THEN
            -- ── FIRST RUN: insert kWh rows from raw table ─────────────────────
            SET @sql_fall = CONCAT(
                'INSERT INTO ', p_metric_table, '
                 (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
                 SELECT ss_id, created_at AS measured_time, ''', v_fan_metric, ''',
                     ROUND(
                         CASE
                             WHEN LAG(created_at) OVER (PARTITION BY ss_id ORDER BY created_at) IS NULL
                             THEN 0
                             ELSE
                                 ((LAG(param_value) OVER (PARTITION BY ss_id ORDER BY created_at) + param_value) / 2)
                                 * (TIMESTAMPDIFF(SECOND,
                                     LAG(created_at) OVER (PARTITION BY ss_id ORDER BY created_at),
                                     created_at) / 3600)
                         END
                     , 4),
                     NOW(), NOW()
                 FROM ', p_raw_table, '
                 WHERE param_id = ''', v_fan_param, '''
                 ON DUPLICATE KEY UPDATE
                     metric_value = VALUES(metric_value),
                     modified_at  = NOW()'
            );
            PREPARE s FROM @sql_fall; EXECUTE s; DEALLOCATE PREPARE s;

            -- ── FIRST RUN: cumulative — deduplicate source first ──────────────
            SET @sql_fcum_all = CONCAT(
                'INSERT INTO ', p_metric_table, '
                 (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
                 SELECT ss_id, measured_time, ''', v_fan_cum, ''',
                     ROUND(
                         SUM(metric_value) OVER (
                             PARTITION BY ss_id ORDER BY measured_time
                             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                         )
                     , 4),
                     NOW(), NOW()
                 FROM (
                     SELECT ss_id, measured_time, metric_value
                     FROM ', p_metric_table, '
                     WHERE metric_id = ''', v_fan_metric, '''
                     GROUP BY ss_id, measured_time, metric_value
                 ) AS deduped
                 ON DUPLICATE KEY UPDATE
                     metric_value = VALUES(metric_value),
                     modified_at  = NOW()'
            );
            PREPARE s FROM @sql_fcum_all; EXECUTE s; DEALLOCATE PREPARE s;

        ELSE
            -- ── SUBSEQUENT RUN ────────────────────────────────────────────────
            SET @sql_fcurr = CONCAT(
                'SELECT created_at, param_value, ss_id
                 INTO @f_curr_time, @f_curr_kw, @f_ss_id
                 FROM ', p_raw_table, '
                 WHERE param_id = ''', v_fan_param, '''
                 ORDER BY created_at DESC LIMIT 1'
            );
            PREPARE s FROM @sql_fcurr; EXECUTE s; DEALLOCATE PREPARE s;

            IF @f_curr_time > @f_last_time THEN

                SET @sql_fprev = CONCAT(
                    'SELECT created_at, param_value
                     INTO @f_prev_time, @f_prev_kw
                     FROM ', p_raw_table, '
                     WHERE param_id = ''', v_fan_param, '''
                     AND created_at < ''', @f_curr_time, '''
                     ORDER BY created_at DESC LIMIT 1'
                );
                PREPARE s FROM @sql_fprev; EXECUTE s; DEALLOCATE PREPARE s;

                IF @f_prev_time IS NULL THEN
                    SET @f_kwh = 0;
                ELSE
                    SET @f_dt   = TIMESTAMPDIFF(SECOND, @f_prev_time, @f_curr_time) / 3600.0;
                    SET @f_kwh  = ROUND(((@f_prev_kw + @f_curr_kw) / 2) * @f_dt, 4);
                END IF;

                -- Get last cumulative value filtered by ss_id to avoid cross-device issues
                SET @sql_flcum = CONCAT(
                    'SELECT IFNULL(metric_value, 0) INTO @f_last_cum
                     FROM ', p_metric_table, '
                     WHERE metric_id = ''', v_fan_cum, '''
                     AND ss_id = ''', @f_ss_id, '''
                     ORDER BY measured_time DESC LIMIT 1'
                );
                PREPARE s FROM @sql_flcum; EXECUTE s; DEALLOCATE PREPARE s;
                IF @f_last_cum IS NULL THEN SET @f_last_cum = 0; END IF;

                SET @f_cum = ROUND(@f_last_cum + @f_kwh, 4);

                SET @sql_fins = CONCAT(
                    'INSERT INTO ', p_metric_table, '
                     (ss_id, measured_time, metric_id, metric_value, created_at, modified_at)
                     VALUES
                     (''', @f_ss_id, ''', ''', @f_curr_time, ''', ''', v_fan_metric, ''', ', @f_kwh, ', NOW(), NOW()),
                     (''', @f_ss_id, ''', ''', @f_curr_time, ''', ''', v_fan_cum,    ''', ', @f_cum,  ', NOW(), NOW())
                     ON DUPLICATE KEY UPDATE
                         metric_value = VALUES(metric_value),
                         modified_at  = NOW()'
                );
                PREPARE s FROM @sql_fins; EXECUTE s; DEALLOCATE PREPARE s;

            END IF;
        END IF;

        SET v_idx = v_idx + 1;
    END LOOP fan_loop;

END$$
DELIMITER ;


ALTER TABLE ch_0001b00000_metric
ADD UNIQUE KEY uq_metric (ss_id, measured_time, metric_id);

ALTER TABLE ch_0002b00000_metric
ADD UNIQUE KEY uq_metric (ss_id, measured_time, metric_id);

/* ============================================================
   RUNNER: run_all_kwh_trh
   ============================================================ */

DROP PROCEDURE IF EXISTS run_all_kwh_trh;
DELIMITER $$

CREATE PROCEDURE run_all_kwh_trh()
BEGIN
    # Energy meters - Cond pumps
    CALL process_kwh_master('em_0001000000_om_p', 'em_0001000000_metric', 'par_avg_active_power_00');
    CALL process_kwh_master('em_0002000000_om_p', 'em_0002000000_metric', 'par_avg_active_power_00');
    CALL process_kwh_master('em_0003000000_om_p', 'em_0003000000_metric', 'par_avg_active_power_00');

    # Chiller Copressors
    CALL process_ct_fan_kwh('ch_0001b00000_om_p', 'ch_0001b00000_metric');
    CALL process_ct_fan_kwh('ch_0002b00000_om_p', 'ch_0002b00000_metric');
END$$
DELIMITER ;


/* ============================================================
   EVENT: every 5 minutes
   ============================================================ */

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS ev_kwh_trh_5min;

CREATE EVENT ev_kwh_trh_5min
ON SCHEDULE EVERY 5 MINUTE
DO
CALL run_all_kwh_trh();


/* ============================================================
   RESET & RERUN — run once after deploying to fix old data
   ============================================================ */


CALL run_all_kwh_trh();








-- Backfill kWh_cumulative
INSERT INTO gl_device_timeseries (bucket_time, device_key, metric_id, metric_value)
SELECT
  bucket_time,
  device_key,
  'kWh_cumulative',
  SUM(metric_value) OVER (
    PARTITION BY device_key
    ORDER BY bucket_time
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  )
FROM gl_device_timeseries
WHERE metric_id = 'kWh'
ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);

-- Backfill TRH_cumulative
INSERT INTO gl_device_timeseries (bucket_time, device_key, metric_id, metric_value)
SELECT
  bucket_time,
  device_key,
  'TRH_cumulative',
  SUM(metric_value) OVER (
    PARTITION BY device_key
    ORDER BY bucket_time
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  )
FROM gl_device_timeseries
WHERE metric_id = 'TRH'
ON DUPLICATE KEY UPDATE metric_value = VALUES(metric_value);