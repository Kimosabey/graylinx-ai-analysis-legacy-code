const { pool } = require('../../Database/pool');


/**
 * Get equipment parameter data between time range
 */

// const getEquipmentParameterData = (
//   tableNames,
//   from,
//   to,
//   callback
// ) => {
//   pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB Connection Error');

//     const queries = tableNames.map(table =>
//       `SELECT param_id, param_value, measured_time
//        FROM ${table}
//        WHERE measured_time BETWEEN ? AND ?`
//     );

//     const unionQuery = queries.join(' UNION ALL ');
//     const params = [];

//     tableNames.forEach(() => {
//       params.push(from, to);
//     });

//     connection.query(unionQuery, params, (err, result) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, result);
//     });
//   });
// };

//   pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB Connection Error');

//     let query =
//       "SELECT param_id, param_value, measured_time " +
//       "FROM " + tableName + " " +
//       "WHERE measured_time BETWEEN ? AND ? ";

//     const params = [from, to];

//     connection.query(query, params, (err, result) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, result);
//     });
//   });
// };

const getBtuMeterUnifiedData = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM btm_0001110000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Btu_Meter_Outlet_Temp','Btu_Meter_Inlet_Temp','Btu_Meter_Volume_m3','Btu_Meter_Actual_Flow','Btu_Meter_Actual_Power','Btu_Meter_Energy_Consump')

      ORDER BY measured_time
    `;

    const params = [
      from, to,
      from, to,
      from, to
    ];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getChillerUnifiedData = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM ch_0001b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Leaving_CDW_Lqd_Temp','CH_Entering_CDW_Lqd_Temp','Flow_Meter_CD_1','CH_Entering_Chilled_Lqd_Temp','CH_Leaving_Chilled_Lqd_Temp','CH_Operating_hrs')

      UNION ALL

      SELECT
       measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM btm_0001110000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Btu_Meter_Volume_m3','Btu_Meter_Outlet_Temp','Btu_Meter_Inlet_Temp','Btu_Meter_Actual_Power')

      UNION ALL

      SELECT
        measured_time AS measured_time,
        metric_id AS param_id,
        metric_value AS param_value
      FROM ch_0001b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

      ORDER BY measured_time
    `;

    const params = [
      from, to,
      from, to,
      from, to
    ];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getChiller2UnifiedData = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM ch_0002b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Leaving_CDW_Lqd_Temp','CH_Entering_CDW_Lqd_Temp','Flow_Meter_CD_1','CH_Entering_Chilled_Lqd_Temp','CH_Leaving_Chilled_Lqd_Temp','CH_Operating_hrs')

      UNION ALL

      SELECT
       measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM btm_0001110000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Btu_Meter_Volume_m3','Btu_Meter_Outlet_Temp','Btu_Meter_Inlet_Temp','Btu_Meter_Actual_Power')

      UNION ALL

      SELECT
        measured_time AS measured_time,
        metric_id AS param_id,
        metric_value AS param_value
      FROM ch_0002b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

      ORDER BY measured_time
    `;

    const params = [
      from, to,
      from, to,
      from, to
    ];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const plantEnergyfiedData = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        CONCAT('CH1_', param_id) AS param_id,
        param_value AS param_value
      FROM ch_0001b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Entering_Chilled_Lqd_Temp','CH_Leaving_Chilled_Lqd_Temp','Act_Pwr_Total','Flow_Meter_Eva_1','CH_Motor_Run')

         UNION ALL 

        SELECT
        measured_time AS measured_time,
        CONCAT('CH1_', param_id) AS param_id,
        param_value AS param_value
      FROM em_0001000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

         UNION ALL 

           SELECT
        measured_time AS measured_time,
         metric_id AS param_id,
        metric_value AS param_value
      FROM cpm_0001bc0000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('ikw_per_tr', 'AMBIENT_TEMP', 'HUMIDITY_MONITORING')

         UNION ALL 
        
          SELECT
        measured_time AS measured_time,
       CONCAT('CH1_', metric_id) AS param_id,
        metric_value AS param_value
      FROM ch_0001b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

      UNION ALL 
        
          SELECT
        measured_time AS measured_time,
       CONCAT('CH2_', metric_id) AS param_id,
        metric_value AS param_value
      FROM ch_0002b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

      UNION ALL

         SELECT
        measured_time AS measured_time,
        CONCAT('CH2_', param_id) AS param_id,
        param_value AS param_value
      FROM ch_0002b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Entering_Chilled_Lqd_Temp','CH_Leaving_Chilled_Lqd_Temp','Act_Pwr_Total','Flow_Meter_Eva_1','CH_Motor_Run')

          UNION ALL 

        SELECT
        measured_time AS measured_time,
        CONCAT('CH2_', param_id) AS param_id,
        param_value AS param_value
      FROM em_0006000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

      UNION ALL

      SELECT
       measured_time AS measured_time,
         CONCAT('PV1_', param_id) AS param_id,
        param_value AS param_value
      FROM pv_0001b20000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('PriV_Pmp_Drive_Power', 'PriV_Pmp_Drive_kWh')

      UNION ALL

        SELECT
       measured_time AS measured_time,
         CONCAT('PV2_', param_id) AS param_id,
        param_value AS param_value
      FROM pv_0002b20000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('PriV_Pmp_Drive_Power','PriV_Pmp_Drive_kWh')

      UNION ALL

        SELECT
       measured_time AS measured_time,
       CONCAT('PV3_', param_id) AS param_id,
        param_value AS param_value
      FROM pv_0003b20000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('PriV_Pmp_Drive_Power','PriV_Pmp_Drive_kWh')

      UNION ALL

          SELECT
       measured_time AS measured_time,
       CONCAT('CP0102_', param_id) AS param_id,
        param_value AS param_value
      FROM em_0007000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

      UNION ALL

          SELECT
       measured_time AS measured_time,
       CONCAT('CP03_', param_id) AS param_id,
        param_value AS param_value
      FROM em_0002000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

      UNION ALL


      SELECT
        measured_time AS measured_time,
        CONCAT('CT1_', param_id) AS param_id,
        param_value AS param_value
      FROM ct_0001b70000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CT_Var_Fan_1_Motor_Power','CT_Var_Fan_2_Motor_Power','CT_Var_Fan_3_Motor_Power')
       
        UNION ALL

      SELECT
        measured_time AS measured_time,
        CONCAT('CT2_', param_id) AS param_id,
        param_value AS param_value
      FROM ct_0002b70000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CT_Var_Fan_1_Motor_Power','CT_Var_Fan_2_Motor_Power','CT_Var_Fan_3_Motor_Power')

      ORDER BY measured_time
    `;

    const params = [
  // 1. CH1 om_p
  from, to,

  // 2. CH1 em
  from, to,

  // 3. CPM metrics
  from, to,

  // 4. CH1 metric
  from, to,

  // 5. CH2 metric
  from, to,

  // 6. CH2 om_p
  from, to,

  // 7. CH2 em
  from, to,

  // 8. PV1
  from, to,

  // 9. PV2
  from, to,

  // 10. PV3
  from, to,

  // 11. CP0102
  from, to,

  // 12. CP03
  from, to,

  // 13. CT1
  from, to,

  // 14. CT2
  from, to
];
    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

// const getSummaryData = (from, to, callback) => {
//   pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB Connection Error');

//     const query = `
//       SELECT
//         measured_time AS measured_time,
//         CONCAT('CH1_', param_id) AS param_id,
//         MAX(param_value) - MIN(param_value) AS param_value
//       FROM ch_0001b00000_om_p
//       WHERE measured_time BETWEEN ? AND ?
//         AND param_id IN ('CH_Operating_hrs')

//          UNION ALL 

//         SELECT
//         measured_time AS measured_time,
//         CONCAT('CH1_', param_id) AS param_id,
//         param_value AS param_value
//       FROM em_0001000000_om_p
//       WHERE measured_time BETWEEN ? AND ?
//         AND param_id IN ('Act_Pwr_Total')

     
//       ORDER BY measured_time
//     `;

//     const params = [
//   // 1. CH1 om_p
//   from, to,

//   // 2. CH1 em
//   from, to,

//   // // 3. CPM metrics
//   // from, to,

//   // // 4. CH1 metric
//   // from, to,

//   // // 5. CH2 metric
//   // from, to,

//   // // 6. CH2 om_p
//   // from, to,

//   // // 7. CH2 em
//   // from, to,

//   // // 8. PV1
//   // from, to,

//   // // 9. PV2
//   // from, to,

//   // // 10. PV3
//   // from, to,

//   // // 11. CP0102
//   // from, to,

//   // // 12. CP03
//   // from, to,

//   // // 13. CT1
//   // from, to,

//   // // 14. CT2
//   // from, to
// ];
//     connection.query(query, params, (err, result) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, result);
//     });
//   });
// };


// /* =====================================================
//    CHILLERS
//    ===================================================== */

// /* ---------- Chiller Run Hours ---------- */

// const getChillerRunHours = (chillerTable, from, to) => {
//    pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB Connection Error');
//   const sql = `
//     SELECT
//       MAX(param_value) - MIN(param_value) AS run_hours
//     FROM ${chillerTable}
//     WHERE measured_time BETWEEN ? AND ?
//       AND param_id = 'CH_Operating_hrs'
//   `;
  
//     const params = [
//       from, to,
//       from, to,
//       from, to
//     ];

//     connection.query(query, params, (err, result) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, result);
//     });
//   });
// };

// /* ---------- Chiller Power Series (for kWh) ---------- */

// const getChillerPowerSeries = (energyTable, from, to, cb) => {
//   const sql = `
//     SELECT
//       measured_time,
//       param_value AS kw
//     FROM ${energyTable}
//     WHERE measured_time BETWEEN ? AND ?
//       AND param_id = 'Act_Pwr_Total'
//     ORDER BY measured_time
//   `;
//   db.query(sql, [from, to], cb);
// };

// /* =====================================================
//    PRIMARY PUMPS
//    ===================================================== */

// const getPrimaryPumpRunHours = (pumpTable, from, to, cb) => {
//   const sql = `
//     SELECT
//       MAX(param_value) - MIN(param_value) AS run_hours
//     FROM ${pumpTable}
//     WHERE measured_time BETWEEN ? AND ?
//       AND param_id = 'PriV_Pmp_Drive_Run_Hrs'
//   `;
//   db.query(sql, [from, to], cb);
// };

// /* =====================================================
//    COOLING TOWER FANS
//    ===================================================== */

// const getCoolingTowerFanRunHours = (ctTable, from, to, cb) => {
//   const sql = `
//     SELECT
//       param_id AS fan,
//       MAX(param_value) - MIN(param_value) AS run_hours
//     FROM ${ctTable}
//     WHERE measured_time BETWEEN ? AND ?
//       AND param_id IN (
//         'CT_Var_Fan_1_Running_Hrs',
//         'CT_Var_Fan_2_Running_Hrs',
//         'CT_Var_Fan_3_Running_Hrs'
//       )
//     GROUP BY param_id
//   `;
//   db.query(sql, [from, to], cb);
// };

// /* =====================================================
//    CONDENSER PUMPS
//    ===================================================== */

// const getCondenserPumpRunHours = (cpTable, from, to, cb) => {
//   const sql = `
//     SELECT
//       metric_id AS pump,
//       MAX(metric_value) - MIN(metric_value) AS run_hours
//     FROM ${cpTable}
//     WHERE measured_time BETWEEN ? AND ?
//       AND metric_id IN (
//         'Cond_Pmp_1_Run_Hours',
//         'Cond_Pmp_2_Run_Hours',
//         'Cond_Pmp_3_Run_Hours'
//       )
//     GROUP BY metric_id
//   `;
//   db.query(sql, [from, to], cb);
// };

// /* =====================================================
//    BTU / TRH
//    ===================================================== */

// // exports.getTotalTRH = (from, to, cb) => {
// //   const sql = `
// //     SELECT
// //       MAX(param_value) - MIN(param_value) AS trh
// //     FROM btu_meter_table
// //     WHERE measured_time BETWEEN ? AND ?
// //       AND param_id = 'Btu_Meter_Energy_Consump_Mwh'
// //   `;
// //   db.query(sql, [from, to], cb);
// // };

// /* =====================================================
//    SPC (kW/TR)
//    ===================================================== */

// // const getChillerSPC = (from, to, cb) => {
// //   const sql = `
// //     SELECT
// //       AVG(param_value) AS spc
// //     FROM chiller_energy_metric
// //     WHERE measured_time BETWEEN ? AND ?
// //       AND metric_id = 'iKW_per_TR'
// //   `;
// //   db.query(sql, [from, to], cb);
// // };

// // exports.getPlantSPC = (from, to, cb) => {
// //   const sql = `
// //     SELECT
// //       AVG(param_value) AS spc
// //     FROM plant_energy_metric
// //     WHERE measured_time BETWEEN ? AND ?
// //       AND metric_id = 'Plant_iKW_per_TR'
// //   `;
// //   db.query(sql, [from, to], cb);
// // };

/* =====================================================
   CHILLERS
   ===================================================== */

/* ---------- Chiller Run Hours ---------- */

const getChillerRunHours = (chillerTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        MAX(param_value) - MIN(param_value) AS run_hours
      FROM ${chillerTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id = 'CH_Operating_hrs'
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};


/* ---------- Chiller Power Series (for kWh) ---------- */

const getChillerPowerSeries = (energyTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time,
        param_value AS kw
      FROM ${energyTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id = 'Act_Pwr_Total'
      ORDER BY measured_time
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};


/* =====================================================
   PRIMARY PUMPS
   ===================================================== */

const getPrimaryPumpRunHours = (pumpTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        MAX(param_value) - MIN(param_value) AS run_hours
      FROM ${pumpTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id = 'PriV_Pmp_Drive_Run_Hrs'
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};


/* =====================================================
   COOLING TOWER FANS
   ===================================================== */

// const getCoolingTowerFanRunHours = (ctTable, from, to, callback) => {
//   pool.getConnection((err, connection) => {
//     if (!connection) return callback('DB Connection Error');

//     const query = `
//       SELECT
//         param_id AS fan,
//         MAX(param_value) - MIN(param_value) AS run_hours
//       FROM ${ctTable}
//       WHERE measured_time BETWEEN ? AND ?
//         AND param_id IN (
//           'CT_Var_Fan_1_Running_Hrs',
//           'CT_Var_Fan_2_Running_Hrs',
//           'CT_Var_Fan_3_Running_Hrs'
//         )
//       GROUP BY param_id
//     `;

//     const params = [from, to];

//     connection.query(query, params, (err, result) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, result);
//     });
//   });
// };

const getCoolingTowerFanRunHoursDetailed = (ctTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (err || !connection) {
      return callback('DB Connection Error');
    }

    const query = `
      SELECT
        param_id,
        ROUND(MAX(param_value) - MIN(param_value), 2) AS run_hours
      FROM ${ctTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id LIKE 'CT_%_Fan_%_Running_Hrs'
      GROUP BY param_id
      ORDER BY param_id
    `;

    connection.query(query, [from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};


/* =====================================================
   CONDENSER PUMPS
   ===================================================== */

const getCondenserPumpRunHours = (cpTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        metric_id AS pump,
        MAX(metric_value) - MIN(metric_value) AS run_hours
      FROM ${cpTable}
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN (
          'rh_hour'
        )
      GROUP BY metric_id
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getCondenser2PumpRunHours = (cpTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        metric_id AS pump,
        MAX(metric_value) - MIN(metric_value) AS run_hours
      FROM ${cpTable}
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN (
         'rh_hour'
        )
      GROUP BY metric_id
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getCondenserPump3RunHours = (cpTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        metric_id AS pump,
        MAX(metric_value) - MIN(metric_value) AS run_hours
      FROM ${cpTable}
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN (
          'rh_hour'
        )
      GROUP BY metric_id
    `;

    const params = [from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getTRH = (cpTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (err || !connection) return callback('DB Connection Error');

    const query = `
      SELECT
        (
          SELECT param_value
          FROM ${cpTable}
          WHERE measured_time BETWEEN ? AND ?
            AND param_id = 'Btu_Meter_Energy_Consump'
          ORDER BY measured_time DESC
          LIMIT 1
        ) -
        (
          SELECT param_value
          FROM ${cpTable}
          WHERE measured_time BETWEEN ? AND ?
            AND param_id = 'Btu_Meter_Energy_Consump'
          ORDER BY measured_time ASC
          LIMIT 1
        ) AS total_trh
    `;

    connection.query(query, [from, to, from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};

const getChillerRunStatus = (table, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        param_value AS status
      FROM ${table}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id = 'CH_Motor_Run'
      ORDER BY measured_time DESC
      LIMIT 1
    `;

    connection.query(query, [from, to], (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

/* ===============================
   COOLING TOWER – FAN RUN HOURS
   =============================== */

// const getCoolingTowerFanRunHours = (ctTable, from, to, callback) => {
//   pool.getConnection((err, connection) => {
//     if (err || !connection) return callback('DB Connection Error');

//     const query = `
//       SELECT
//         param_id,
//         MAX(param_value) - MIN(param_value) AS run_hours
//       FROM ${ctTable}
//       WHERE measured_time BETWEEN ? AND ?
//         AND param_id IN (
//           'CT_Var_Fan_1_Running_Hrs',
//           'CT_Var_Fan_2_Running_Hrs',
//           'CT_Var_Fan_3_Running_Hrs'
//         )
//       GROUP BY param_id
//     `;

//     connection.query(query, [from, to], (err, rows) => {
//       connection.release();
//       if (err) callback(err);
//       else callback(null, rows);
//     });
//   });
// };

/* ===============================
   COOLING TOWER – FAN RUN HOURS
   =============================== */

const getCoolingTowerFanRunHours = (ctTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (err || !connection) return callback('DB Connection Error');

    const query = `
      SELECT
        param_id,
        MAX(param_value) - MIN(param_value) AS run_hours
      FROM ${ctTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN (
          'CT_Var_Fan_1_Running_Hrs',
          'CT_Var_Fan_2_Running_Hrs',
          'CT_Var_Fan_3_Running_Hrs'
        )
      GROUP BY param_id
    `;

    connection.query(query, [from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};


/**
 * Save generated report file path
 */
const saveGeneratedReport = (filePath, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query =
      "INSERT INTO generated_reports " +
      "(file_path, from_time, to_time) " +
      "VALUES (?, ?, ?)";

    const params = [filePath, from, to];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

/**
 * Get active report subscription emails
 */
const getReportSubscriptionEmails = (callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query =
      "SELECT email_ids FROM report_subscriptions WHERE is_active = 1";

    connection.query(query, (err, result) => {
      connection.release();
      if (err) return callback(err);
      callback(null, result);
    });
  });
};

const getChiller1Data = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM ch_0001b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Leaving_Chilled_Lqd_Temp','CH_Entering_Chilled_Lqd_Temp','Flow_Meter_Eva_1','Flow_Meter_CD_1','CH_Entering_CDW_Lqd_Temp','CH_Leaving_CDW_Lqd_Temp','CH_Operating_hrs','CH_Motor_Percent_FLA','CH_Motor_Run')

        UNION ALL 
        
          SELECT
        measured_time AS measured_time,
       metric_id AS param_id,
        metric_value AS param_value
      FROM ch_0001b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

        UNION ALL 

        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM em_0001000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

        
        UNION ALL 
        
        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM cpm_0001bc0000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('AMBIENT_TEMP', 'HUMIDITY_MONITORING')

        UNION ALL 
        
        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM btm_0001110000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Btu_Meter_Outlet_Temp', 'Btu_Meter_Inlet_Temp')


      ORDER BY measured_time
    `;

    const params = [
      from, to,
      from, to,
      from, to,
      from, to,
      from, to
    ];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};

const getChiller2Data = (from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM ch_0002b00000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('CH_Leaving_Chilled_Lqd_Temp','CH_Entering_Chilled_Lqd_Temp','Flow_Meter_Eva_1','Flow_Meter_CD_1','CH_Entering_CDW_Lqd_Temp','CH_Leaving_CDW_Lqd_Temp','CH_Operating_hrs','CH_Motor_Percent_FLA','CH_Motor_Run')

        UNION ALL 
        
          SELECT
        measured_time AS measured_time,
        metric_id AS param_id,
        metric_value AS param_value
      FROM ch_0002b00000_metric
      WHERE measured_time BETWEEN ? AND ?
        AND metric_id IN ('CH_kW_per_TR')

        UNION ALL 
        
        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM em_0006000000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Act_Pwr_Total')

        
        UNION ALL 
        
        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM cpm_0001bc0000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('AMBIENT_TEMP', 'HUMIDITY_MONITORING')

        UNION ALL 
        
        SELECT
        measured_time AS measured_time,
        param_id AS param_id,
        param_value AS param_value
      FROM btm_0001110000_om_p
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN ('Btu_Meter_Outlet_Temp', 'Btu_Meter_Inlet_Temp')

      ORDER BY measured_time
    `;

    const params = [
      from, to,
      from, to,
      from, to,
      from, to,
      from, to
    ];

    connection.query(query, params, (err, result) => {
      connection.release();
      if (err) callback(err);
      else callback(null, result);
    });
  });
};


const getCTFanPowerSeries = (ctTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (err || !connection) return callback('DB Connection Error');

    const query = `
      SELECT
        measured_time,
        param_id,
        param_value AS kw
      FROM ${ctTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN (
          'CT1_CT_Var_Fan_1_Motor_Power',
          'CT1_CT_Var_Fan_2_Motor_Power',
          'CT1_CT_Var_Fan_3_Motor_Power',
          'CT2_CT_Var_Fan_1_Motor_Power',
          'CT2_CT_Var_Fan_2_Motor_Power',
          'CT2_CT_Var_Fan_3_Motor_Power'
        )
      ORDER BY measured_time
    `;

    connection.query(query, [from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};
const getCT1FanRunHours = (ctTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        param_id AS fan,
        ROUND(MAX(param_value) - MIN(param_value), 2) AS run_hours
      FROM ${ctTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN (
          'CT_Var_Fan_1_Running_Hrs',
          'CT_Var_Fan_2_Running_Hrs',
          'CT_Var_Fan_3_Running_Hrs'
        )
      GROUP BY param_id
    `;

    connection.query(query, [from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};
const getCT2FanRunHours = (ctTable, from, to, callback) => {
  pool.getConnection((err, connection) => {
    if (!connection) return callback('DB Connection Error');

    const query = `
      SELECT
        param_id AS fan,
        ROUND(MAX(param_value) - MIN(param_value), 2) AS run_hours
      FROM ${ctTable}
      WHERE measured_time BETWEEN ? AND ?
        AND param_id IN (
          'CT_Var_Fan_1_Running_Hrs',
          'CT_Var_Fan_2_Running_Hrs',
          'CT_Var_Fan_3_Running_Hrs'
        )
      GROUP BY param_id
    `;

    connection.query(query, [from, to], (err, rows) => {
      connection.release();
      if (err) callback(err);
      else callback(null, rows);
    });
  });
};




module.exports = {
//getEquipmentParameterData,
saveGeneratedReport,
getReportSubscriptionEmails,
getChillerUnifiedData,
getChiller2UnifiedData,
plantEnergyfiedData,
getBtuMeterUnifiedData,
getChiller1Data,
getChiller2Data,
getChillerRunHours,
getChillerPowerSeries,
getPrimaryPumpRunHours,
getCoolingTowerFanRunHours,
getCondenserPumpRunHours,
getChillerUnifiedData,
getTRH,
getCondenser2PumpRunHours,
getCondenserPump3RunHours,
getChillerRunStatus,
getCoolingTowerFanRunHoursDetailed,
getCoolingTowerFanRunHours,
getCTFanPowerSeries,
getCT1FanRunHours,
getCT2FanRunHours

//getSummaryData
}