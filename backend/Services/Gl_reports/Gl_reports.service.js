const model = require('./Gl_reports.model');
const get_Table_name = require('../Device/myIBMSPreparation');
const path = require('path');
const excelUtil = require('../../Utils/excel.util');
const emailUtil = require('../../Utils/email.utils');
const pivotTelemetryRows = require('../../Utils/telemetryPivot');
const pivotTelemetryRowsforplant = require('../../Utils/telemetryPivot');

// const formatIfBig = (value) => {
//   if (typeof value !== 'number') return value;
//   return value >= 1000 ? value.toLocaleString('en-IN') : value;
// };


const iKWTR_MATRIX = {
  temps: [
    35, 34, 33, 32, 31, 30, 29, 28, 27, 26,
    25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15
  ],

  loads: [
    100, 95, 90, 85, 80, 75, 70, 65, 60,
    55, 50, 45, 40, 35, 30, 25, 20, 15
  ],

  values: {
    35: [0.6733,0.6468,0.6387,0.6319,0.6281,0.6279,0.6317,0.6414,0.6499,0.6616,0.6769,0.6824,0.7035,0.7327,0.7699,0.8253,0.9034,1.0290],
    34: [0.6628,0.6470,0.6387,0.6319,0.6281,0.6280,0.6317,0.6414,0.6500,0.6616,0.6770,0.6824,0.7035,0.7327,0.7699,0.8253,0.9034,1.0290],
    33: [0.6417,0.6228,0.6145,0.6074,0.6038,0.6036,0.6055,0.6072,0.6268,0.6370,0.6506,0.6680,0.6730,0.6986,0.7345,0.7858,0.8647,0.9870],
    32: [0.6089,0.5995,0.5908,0.5841,0.5808,0.5798,0.5801,0.5809,0.5981,0.6066,0.6184,0.6344,0.6396,0.6635,0.6970,0.7470,0.8185,0.9414],
    31: [0.5865,0.5767,0.5680,0.5619,0.5583,0.5556,0.5538,0.5545,0.5683,0.5760,0.5870,0.6023,0.6085,0.6316,0.6632,0.7086,0.7775,0.8885],
    30: [0.5645,0.5545,0.5464,0.5403,0.5353,0.5305,0.5276,0.5287,0.5350,0.5484,0.5593,0.5743,0.5967,0.6040,0.6349,0.6788,0.7439,0.8464],
    29: [0.5430,0.5337,0.5256,0.5185,0.5114,0.5058,0.5028,0.5056,0.5100,0.5248,0.5359,0.5506,0.5700,0.5791,0.6089,0.6535,0.7140,0.8122],
    28: [0.5227,0.5135,0.5049,0.4962,0.4883,0.4836,0.4814,0.4834,0.4861,0.4909,0.5131,0.5276,0.5446,0.5515,0.5787,0.6177,0.6775,0.7748],
    27: [0.5032,0.4935,0.4837,0.4746,0.4672,0.4630,0.4603,0.4611,0.4626,0.4656,0.4866,0.4978,0.5130,0.5336,0.5445,0.5804,0.6357,0.7285],
    26: [0.4842,0.4736,0.4634,0.4541,0.4469,0.4423,0.4388,0.4383,0.4388,0.4413,0.4470,0.4680,0.4817,0.5005,0.5115,0.5446,0.5965,0.6822],
    25: [0.4653,0.4543,0.4439,0.4343,0.4267,0.4216,0.4171,0.4156,0.4155,0.4174,0.4219,0.4397,0.4523,0.4695,0.4807,0.5114,0.5590,0.6386],
    24: [0.4478,0.4355,0.4247,0.4147,0.4069,0.4014,0.3962,0.3940,0.3930,0.3943,0.3980,0.4131,0.4245,0.4413,0.4635,0.4809,0.5254,0.5997],
    23: [0.4298,0.4172,0.4058,0.3957,0.3880,0.3821,0.3762,0.3731,0.3716,0.3720,0.3750,0.3804,0.3991,0.4143,0.4356,0.4529,0.4940,0.5640],
    22: [0.4124,0.4001,0.3872,0.3777,0.3698,0.3636,0.3570,0.3532,0.3508,0.3506,0.3527,0.3572,0.3748,0.3888,0.4085,0.4250,0.4633,0.5291],
    21: [0.3954,0.3825,0.3699,0.3605,0.3525,0.3442,0.3386,0.3339,0.3309,0.3299,0.3311,0.3344,0.3516,0.3644,0.3826,0.4080,0.4326,0.4939],
    20: [0.3786,0.3657,0.3535,0.3441,0.3358,0.3271,0.3205,0.3151,0.3113,0.3096,0.3099,0.3211,0.3293,0.3382,0.3543,0.3782,0.4017,0.4579],
    19: [0.3623,0.3494,0.3388,0.3282,0.3196,0.3100,0.3029,0.2968,0.2924,0.2898,0.2940,0.2978,0.3044,0.3147,0.3273,0.3487,0.3701,0.4221],
    18: [0.3468,0.3326,0.3236,0.3127,0.3035,0.2932,0.2855,0.2790,0.2759,0.2731,0.2728,0.2750,0.2799,0.2884,0.3000,0.3189,0.3487,0.3862],
    17: [0.3312,0.3175,0.3089,0.2986,0.2873,0.2768,0.2688,0.2617,0.2577,0.2538,0.2522,0.2529,0.2563,0.2626,0.2740,0.2917,0.3197,0.3565],
    16: [0.3154,0.3035,0.2941,0.2830,0.2715,0.2608,0.2525,0.2471,0.2405,0.2355,0.2326,0.2329,0.2356,0.2429,0.2544,0.2715,0.2981,0.3345],
    15: [0.2996,0.2901,0.2797,0.2672,0.2574,0.2454,0.2406,0.2317,0.2243,0.2185,0.2159,0.2163,0.2204,0.2278,0.2391,0.2557,0.2815,0.3178]
  }
};

function lookupIKWTR(temp, load) {
  const t = snapUpToMatrix(temp, iKWTR_MATRIX.temps);
  const l = snapUpToMatrix(load, iKWTR_MATRIX.loads);

  if (t == null || l == null) return null;

  const loadIndex = iKWTR_MATRIX.loads.indexOf(l);
  const row = iKWTR_MATRIX.values[t];

  if (!row || row[loadIndex] == null) return null;

  return row[loadIndex];
}


function snapUpToMatrix(value, matrixArray) {
  if (!isNum(value)) return null;

  // sort ascending for safe comparison
  const sorted = [...matrixArray].sort((a, b) => a - b);

  for (let i = 0; i < sorted.length; i++) {
    if (value <= sorted[i]) {
      return sorted[i];
    }
  }

  // if value is higher than max, cap to max
  return sorted[sorted.length - 1];
}



function applyChillerCalculations(row) {

  if(row.CH_Motor_Run == 0){
    row.Act_Pwr_Total = 0;
  }

  /* =========================
     7. CHW DELTA T (Deg C)
     ========================= */
  if (isNum(row.CH_Entering_Chilled_Lqd_Temp) &&
      isNum(row.CH_Leaving_Chilled_Lqd_Temp)) {
    row.Chw_Delta_T = round(
      row.CH_Entering_Chilled_Lqd_Temp -
      row.CH_Leaving_Chilled_Lqd_Temp
    );
  } else {
    row.Chw_Delta_T = null;
  }

  /* =========================
     8. BTU ENERGY FLOW (TR)
     TR = (Flow * ΔT * 500) / 12000
     ========================= */
     let tr_data = 0;
  if (isNum(row.Flow_Meter_Eva_1) && isNum(row.Chw_Delta_T)) {
    tr_data = row.Flow_Meter_Eva_1 * row.Chw_Delta_T;
    const chiller_tr = Math.round(0.33 * tr_data);
    row.ROUNDED_TR = chiller_tr; 
  } else {
    row.ROUNDED_TR = null;
  }

  if(row.CH_Motor_Run == 0){
    row.ROUNDED_TR = 0;
  }

  // /* =========================
  //    9. DELTA T (DEG C)
  //    ========================= */
   if (isNum(row.Btu_Meter_Outlet_Temp) && isNum(row.Btu_Meter_Inlet_Temp)) {
  row.DELTA_T_DEG = row.Btu_Meter_Outlet_Temp - row.Btu_Meter_Inlet_Temp;
     } else {
    row.DELTA_T_DEG = null;
  }

  /* =========================
     10. CH-1 POWER (kW)
     From Energy Meter
     ========================= */
  row.CH_Power_kW = isNum(row.Act_Pwr_Total)
    ? round(row.Act_Pwr_Total)
    : 0;

  /* =========================
     11. CH ENERGY (kWh)
     (kW1 + kW2)/2 * interval_hrs
     ========================= */
  if (isNum(row.Prev_kW) && isNum(row.Act_Pwr_Total)) {
    const avgKW = (row.Prev_kW + row.Act_Pwr_Total) / 2;
    row.CH_Energy_kWh = round(avgKW * 0.25); // 15 min interval
  } else {
    row.CH_Energy_kWh = 0;
  }

  /* =========================
     12. CONDENSER FLOW (m3/h)
     ========================= */
  row.Condenser_Flow = isNum(row.Flow_Meter_CD_1)
    ? round(row.Flow_Meter_CD_1)
    : null;

  /* =========================
     13. CET TEMP (Deg C)
     ========================= */
       // rounded ce
  row.CH_Entering_CDW_Lqd_Temp = isNum(row.CH_Entering_CDW_Lqd_Temp)
    ?snapUpToMatrix(
  row.CH_Entering_CDW_Lqd_Temp,
  iKWTR_MATRIX.temps
): null;

  /* =========================
     14. CLFT TEMP (Deg C)
     ========================= */
  row.CLFT = isNum(row.CH_Leaving_CDW_Lqd_Temp)
    ? round(row.CH_Leaving_CDW_Lqd_Temp)
    : null;

  /* =========================
     15. WET BULB TEMP (Deg C)
     ========================= */
  if (isNum(row.AMBIENT_TEMP) && isNum(row.HUMIDITY_MONITORING)) {
    const T = row.AMBIENT_TEMP;
    const RH = row.HUMIDITY_MONITORING;

    row.Wet_Bulb_Temp = round(
      T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
      Math.atan(T + RH) -
      Math.atan(RH - 1.676331) +
      0.00391838 * Math.pow(RH, 1.5) *
      Math.atan(0.023101 * RH) -
      4.686035
    ); 
  } else {
    row.Wet_Bulb_Temp = null;
  }

  const chiller_load = round(
      (row.ROUNDED_TR / 550) * 100
    );

  /* =========================
     16. CHILLER LOAD (%)
     ========================= */
  if (isNum(row.ROUNDED_TR)) {
    row.Chiller_Load_Percent = snapUpToMatrix(
 chiller_load,
  iKWTR_MATRIX.loads
);
  } else {
    row.Chiller_Load_Percent = null;
  }


  // chiller status for calculation

  // if(row.CH_Run_SS){
  //   row.CH_Run_SS = row.CH_Run_SS
  // } else {
  //   row.CH_Run_SS = null;
  // }

  /* =========================
     17. ACTUAL OPERATING (kW/TR)
     ========================= */


  if (isNum(row.CH_kW_per_TR)) {
    row.Actual_ikW_per_TR = row.CH_kW_per_TR
  } else {
    row.Actual_ikW_per_TR = null;
  }

       if(row.CH_Motor_Run == 0){
    row.Actual_ikW_per_TR = 0;
  }

        if(row.CH_Motor_Run == 0){
    row.Committed_kW = 0;
  }



  /* =========================
     18. COMMITTED PERFORMANCE
     (from other sheet)
     ========================= */
if (
  isNum(row.CH_Entering_CDW_Lqd_Temp) &&
  isNum(row.CH_Motor_Percent_FLA)
) {
  const temp = row.CH_Entering_CDW_Lqd_Temp;
  const load = row.CH_Motor_Percent_FLA;

  const ikwtr = lookupIKWTR(temp, load);
  row.Committed_kW_per_TR = ikwtr !== null ? round(ikwtr, 4) : null;
} else {
  row.Committed_kW_per_TR = null;
}
        if(row.CH_Motor_Run == 0){
    row.Committed_kW_per_TR = 0;
  }
  /* =========================
     19. PERFORMANCE DEVIATION (%)
     ========================= */

  if (isNum(row.Act_Pwr_Total) && isNum(row.Committed_kW_per_TR) && isNum(row.ROUNDED_TR)) {
    row.Committed_kW = row.ROUNDED_TR * row.Committed_kW_per_TR
    row.Performance_Deviation = round((row.Act_Pwr_Total - row.Committed_kW)/row.Committed_kW);
  } else {
    row.Performance_Deviation = null;
  }

  if(isNum(row.Performance_Deviation)) row.Performance_Deviation_Percent = (row.Performance_Deviation * 100) + "%"

         if(row.CH_Motor_Run == 0){
    row.Performance_Deviation_Percent = 0;
  }

  /* =========================
     20. RUN HOURS
     ========================= */
  row.Run_Hours = isNum(row.CH_Operating_hrs)
    ? row.CH_Operating_hrs
    : null;
}

function applyPlantEnergyCalculations(row) {

   /* =========================
     CHILLER 1 ROUNDED (TR)
     ========================= */

  if (isNum(row.CH1_CH_Entering_Chilled_Lqd_Temp) &&
      isNum(row.CH1_CH_Leaving_Chilled_Lqd_Temp)) {
    row.Chw1_Delta_T = round(
      row.CH1_CH_Entering_Chilled_Lqd_Temp -
      row.CH1_CH_Leaving_Chilled_Lqd_Temp
    );
  } else {
    row.Chw1_Delta_T = null;
  }


     let tr_data1 = 0;
  if (isNum(row.CH1_Flow_Meter_Eva_1) && isNum(row.Chw1_Delta_T)) {
    tr_data1 = row.CH1_Flow_Meter_Eva_1 * row.Chw1_Delta_T;
    const chiller1_tr = Math.round(0.33 * tr_data1);
    row.CHILLER1_ROUNDED_TR = chiller1_tr; 
  } else {
    row.CHILLER1_ROUNDED_TR = null;
  }


   /* =========================
     CHILLER 2 ROUNDED (TR)
     ========================= */

  if (isNum(row.CH2_CH_Entering_Chilled_Lqd_Temp) &&
      isNum(row.CH2_CH_Leaving_Chilled_Lqd_Temp)) {
    row.Chw2_Delta_T = round(
      row.CH2_CH_Entering_Chilled_Lqd_Temp -
      row.CH2_CH_Leaving_Chilled_Lqd_Temp
    );
  } else {
    row.Chw2_Delta_T = null;
  }


     let tr_data2 = 0;
  if (isNum(row.CH2_Flow_Meter_Eva_1) && isNum(row.Chw2_Delta_T)) {
    tr_data2 = row.CH2_Flow_Meter_Eva_1 * row.Chw2_Delta_T;
    const chiller2_tr = Math.round(0.33 * tr_data2);
    row.CHILLER2_ROUNDED_TR = chiller2_tr; 
  } else {
    row.CHILLER2_ROUNDED_TR = null;
  }

   row.TOTAL_TR = row.CHILLER1_ROUNDED_TR + row.CHILLER2_ROUNDED_TR;

   if (isNum(row.CH1_Act_Pwr_Total) && row.CH1_CH_Motor_Run == 0){
    row.CH1_Act_Pwr_Total = 0;
    row.CHILLER1_ROUNDED_TR = 0;
    row.CH1_CH_kW_per_TR = 0;
   }
   if (isNum(row.CH2_Act_Pwr_Total) && row.CH2_CH_Motor_Run == 0) {
    
    row.CH2_Act_Pwr_Total = 0;
  row.CHILLER2_ROUNDED_TR = 0;
  row.CH2_CH_kW_per_TR = 0;
  }

   // Total chiller SPC
   row.Total_chiller_spc = ((row.CH1_Act_Pwr_Total + row.CH2_Act_Pwr_Total) / row.TOTAL_TR);
   

  /* =========================
     PRIMARY PUMPS TOTAL kW
     ========================= */
  row.Primary_Pumps_Total_kW = round(
    (row.PV1_PriV_Pmp_Drive_Power || 0) +
    (row.PV2_PriV_Pmp_Drive_Power || 0) +
    (row.PV3_PriV_Pmp_Drive_Power || 0)
  );

   /* =========================
     PRIMARY PUMPS TOTAL kWH
     ========================= */
  row.Primary_Pumps_Total_kWH = round(
    (row.PV1_PriV_Pmp_Drive_kWh || 0) +
    (row.PV2_PriV_Pmp_Drive_kWh || 0) +
    (row.PV3_PriV_Pmp_Drive_kWh || 0)
  );

  /* =========================
     PRIMARY PUMPS TOTAL kWh
     (kW1 + kW2)/2 × 0.25
     ========================= */
  // if (isNum(row.Prev_Primary_Pump_kW)) {
  //   const avgKW =
  //     (row.Prev_Primary_Pump_kW + row.Primary_Pumps_Total_kW) / 2;

  //   row.Primary_Pumps_Total_kWh = round(avgKW * 0.25);
  // } else {
  //   row.Primary_Pumps_Total_kWh = null;
  // }

  /* =========================
     CONDENSER PUMP 1 AND 2 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CP_0102_kw)) {
    const avgKWcp =
      (row.Prev_CP_0102_kw + row.CP0102_Act_Pwr_Total) / 2;

    row.Condenser_Pump_0102_kWh = round(avgKWcp * 0.25);
  } else {
    row.Condenser_Pump_0102_kWh = null;
  }

  /* =========================
      CONDENSER PUMP 3 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CP_03_kw)) {
    const avgKWcp3 =
      (row.Prev_CP_03_kw + row.CP03_Act_Pwr_Total) / 2;

    row.Condenser_Pump_03_kWh = round(avgKWcp3 * 0.25);
  } else {
    row.Condenser_Pump_03_kWh = null;
  }

    /* =========================
     CONDENSER PUMPS TOTAL kW
     ========================= */
  row.Condenser_Pumps_Total_kW = round(
    (row.CP0102_Act_Pwr_Total || 0) +
    (row.CP03_Act_Pwr_Total || 0) 
  );

   row.Condenser_Pumps_Total_kWh = round(
    (row.Condenser_Pump_0102_kWh || 0) +
    (row.Condenser_Pump_03_kWh || 0) 
  );

    /* =========================
     COOLING TOWER 1 FAN 1 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT1_Fan1_kw)) {
    const avgCT1F1 =
      (row.Prev_CT1_Fan1_kw + row.CT1_CT_Var_Fan_1_Motor_Power) / 2;

    row.CT1_FAN1_kWh = round(avgCT1F1 * 0.25);
  } else {
    row.CT1_FAN1_kWh = null;
  }

      /* =========================
     COOLING TOWER 1 FAN 1 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT1_Fan1_kw)) {
    const avgCT1F1 =
      (row.Prev_CT1_Fan1_kw + row.CT1_CT_Var_Fan_1_Motor_Power) / 2;

    row.CT1_FAN1_kWh = round(avgCT1F1 * 0.25);
  } else {
    row.CT1_FAN1_kWh = null;
  }

      /* =========================
     COOLING TOWER 1 FAN 2 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT1_Fan2_kw)) {
    const avgCT1F2 =
      (row.Prev_CT1_Fan2_kw + row.CT1_CT_Var_Fan_2_Motor_Power) / 2;

    row.CT1_FAN2_kWh = round(avgCT1F2 * 0.25);
  } else {
    row.CT1_FAN2_kWh = null;
  }

        /* =========================
     COOLING TOWER 1 FAN 3 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT1_Fan3_kw)) {
    const avgCT1F3 =
      (row.Prev_CT1_Fan3_kw + row.CT1_CT_Var_Fan_3_Motor_Power) / 2;

    row.CT1_FAN3_kWh = round(avgCT1F3 * 0.25);
  } else {
    row.CT1_FAN3_kWh = null;
  }
   
     /* =========================
     COOLING TOWER 2 FAN 1 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT2_Fan1_kw)) {
    const avgCT2F1 =
      (row.Prev_CT2_Fan1_kw + row.CT2_CT_Var_Fan_1_Motor_Power) / 2;

    row.CT2_FAN1_kWh = round(avgCT2F1 * 0.25);
  } else {
    row.CT2_FAN1_kWh = null;
  }

      /* =========================
     COOLING TOWER 1 FAN 2 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT2_Fan2_kw)) {
    const avgCT2F2 =
      (row.Prev_CT2_Fan2_kw + row.CT2_CT_Var_Fan_2_Motor_Power) / 2;

    row.CT2_FAN2_kWh = round(avgCT2F2 * 0.25);
  } else {
    row.CT2_FAN2_kWh = null;
  }

        /* =========================
     COOLING TOWER 2 FAN 3 KWH
     (kW1 + kW2)/2 × 0.25
     ========================= */
  if (isNum(row.Prev_CT2_Fan3_kw)) {
    const avgCT2F3 =
      (row.Prev_CT2_Fan3_kw + row.CT2_CT_Var_Fan_3_Motor_Power) / 2;

    row.CT2_FAN3_kWh = round(avgCT2F3 * 0.25);
  } else {
    row.CT2_FAN3_kWh = null;
  }

  /* =========================
     TOTAL COOLING TOWER FANS kW
     ========================= */
  row.Total_CT_Fans_kW = round(
    (row.CT1_CT_Var_Fan_1_Motor_Power || 0) +
    (row.CT1_CT_Var_Fan_2_Motor_Power || 0) +
    (row.CT1_CT_Var_Fan_3_Motor_Power || 0) +
    (row.CT2_CT_Var_Fan_1_Motor_Power || 0) +
    (row.CT2_CT_Var_Fan_2_Motor_Power || 0) +
    (row.CT2_CT_Var_Fan_3_Motor_Power || 0)
  );

  /* =========================
     TOTAL COOLING TOWER FANS kWh
     ========================= */
  if (isNum(row.Prev_CT_Fans_kW)) {
    const avgKW =
      (row.Prev_CT_Fans_kW + row.Total_CT_Fans_kW) / 2;

    row.Total_CT_Fans_kWh = round(avgKW * 0.25);
  } else {
    row.Total_CT_Fans_kWh = null;
  }

  /* =========================
     TOTAL CHILLER POWER kW
     ========================= */
row.Total_Chiller_Power_kW = round(
  (row.CH1_Act_Pwr_Total || 0) +
  (row.CH2_Act_Pwr_Total || 0)
);


  /* =========================
     TOTAL PLANT ROOM kW
     ========================= */
  row.Total_Aux_KW = round(
    row.Primary_Pumps_Total_kW +
    row.Total_CT_Fans_kW +
    row.Condenser_Pumps_Total_kW
  );

    /* =========================
     TOTAL PLANT ROOM kW
     ========================= */
  row.Total_Plant_Room_kW = round(
    row.Total_Chiller_Power_kW +
    row.Primary_Pumps_Total_kW +
    row.Total_CT_Fans_kW +
    row.Condenser_Pumps_Total_kW
  );

  // overall plant spc

    row.Total_plant_spc = (row.Total_Plant_Room_kW / row.TOTAL_TR);
   

    /* =========================
     15. WET BULB TEMP (Deg C)
     ========================= */
  if (isNum(row.AMBIENT_TEMP) && isNum(row.HUMIDITY_MONITORING)) {
    const T = row.AMBIENT_TEMP;
    const RH = row.HUMIDITY_MONITORING;

    row.Wet_Bulb_Temp = round(
      T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
      Math.atan(T + RH) -
      Math.atan(RH - 1.676331) +
      0.00391838 * Math.pow(RH, 1.5) *
      Math.atan(0.023101 * RH) -
      4.686035
    ); 
  } else {
    row.Wet_Bulb_Temp = null;
  }

  // CHILLER 1 LOAD %
    if (isNum(row.CHILLER1_ROUNDED_TR)) {
    row.Chiller1_Load_Percent = round(
      (row.CHILLER1_ROUNDED_TR / 550) * 100
    );
  } else {
    row.Chiller1_Load_Percent = null;
  }

   if (isNum(row.CHILLER2_ROUNDED_TR)) {
    row.Chiller2_Load_Percent = round(
      (row.CHILLER2_ROUNDED_TR / 550) * 100
    );
  } else {
    row.Chiller2_Load_Percent = null;
  }


    const CHILL1_ON = row.CH1_CH_Motor_Run === 1 ? 1 : 0;
    const CHILL2_ON = row.CH2_CH_Motor_Run === 1 ? 1 : 0;

    const NO_OF_CHILLERS = CHILL1_ON + CHILL2_ON;
    const LOAD =
      Math.max(
        Number(row.Chiller1_Load_Percent) || 0,
        Number(row.Chiller2_Load_Percent) || 0
      ) / 100;

      row.chiller_loading = LOAD * 100;
      row.chillers_in_operation = NO_OF_CHILLERS;
      row.CHW_PUMP_KW= LOAD * NO_OF_CHILLERS * 48.1;
      row.CDW_PUMP_KW = NO_OF_CHILLERS * 25.89;
      row.CT_FAN_KW = LOAD * NO_OF_CHILLERS * 33;
  
}

const calculateTotalKWh = (timeSeries, powerKey) => {
  let totalKWh = 0;

  for (let i = 1; i < timeSeries.length; i++) {
    const prev = timeSeries[i - 1];
    const curr = timeSeries[i];

    if (
      prev[powerKey] == null ||
      curr[powerKey] == null
    ) continue;

    const t1 = new Date(prev.measured_time).getTime();
    const t2 = new Date(curr.measured_time).getTime();

    const hours = (t2 - t1) / (1000 * 60 * 60);
    if (hours <= 0) continue;

    const avgKW = (prev[powerKey] + curr[powerKey]) / 2;
    totalKWh += avgKW * hours;
  }

  return Number(totalKWh.toFixed(2));
};

// const promisify = (fn, ...args) =>
//   new Promise((resolve, reject) => {
//     fn(...args, (err, rows) => {
//       if (err) return reject(err);
//       resolve(rows);
//     });
//   });


function isNum(v) {
  return typeof v === 'number' && !isNaN(v);
}

function round(v, d = 2) {
  return Number(v.toFixed(d));
}

function formatDateTime(measuredTime) {
  const dt = new Date(measuredTime);

  // DATE → 10-Nov-2025
  const date = dt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // TIME → 00:35
  const time = dt.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return { date, time };
}

function get15MinBucket(measuredTime) {
  const d = new Date(measuredTime);

  const minutes = d.getMinutes();
  const floored = Math.floor(minutes / 15) * 15;

  d.setMinutes(floored);
  d.setSeconds(0);
  d.setMilliseconds(0);

  return d.toISOString(); // bucket key
}

function linearInterpolate(x, x1, x2, y1, y2) {
  if (x2 === x1) return y1;
  return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
}

function lookupIKWTR(temp, load) {
  const temps = iKWTR_MATRIX.temps;
  const loads = iKWTR_MATRIX.loads;

  
  // 🔹 CEILING temperature
  const t = Math.min(...temps.filter(v => v >= temp));
  // 🔹 CEILING load %
  const l = Math.min(...loads.filter(v => v >= load));

  if (t === Infinity || l === Infinity) return null;
  if (!iKWTR_MATRIX.values[t]) return null;

  const loadIndex = loads.indexOf(l);

  return iKWTR_MATRIX.values[t][loadIndex];

  // // Find surrounding temperature
  // const t1 = Math.max(...temps.filter(t => t <= temp));
  // const t2 = Math.min(...temps.filter(t => t >= temp));

  // // Find surrounding load %
  // const l1 = Math.max(...loads.filter(l => l <= load));
  // const l2 = Math.min(...loads.filter(l => l >= load));

  // if (!iKWTR_MATRIX.values[t1] || !iKWTR_MATRIX.values[t2]) return null;

  // const v_t1_l1 = iKWTR_MATRIX.values[t1][loads.indexOf(l1)];
  // const v_t1_l2 = iKWTR_MATRIX.values[t1][loads.indexOf(l2)];
  // const v_t2_l1 = iKWTR_MATRIX.values[t2][loads.indexOf(l1)];
  // const v_t2_l2 = iKWTR_MATRIX.values[t2][loads.indexOf(l2)];

  // // Horizontal interpolation (load)
  // const v_t1 = linearInterpolate(load, l1, l2, v_t1_l1, v_t1_l2);
  // const v_t2 = linearInterpolate(load, l1, l2, v_t2_l1, v_t2_l2);

  // // Vertical interpolation (temperature)
  // return linearInterpolate(temp, t1, t2, v_t1, v_t2);
}

function getNoOfChillersOn(ch1SS, ch2SS) {
  return (ch1SS ? 1 : 0) + (ch2SS ? 1 : 0);
}




const getReportEmails = () => {

  return new Promise((resolve, reject) => {
    model.getReportSubscriptionEmails((err, rows) => {
      if (err) return reject(err);

      let emails = [];
      rows.forEach(row => {
        try {
          const parsed = JSON.parse(row.email_ids);
          if (Array.isArray(parsed)) {
            emails = emails.concat(parsed);
          }
        } catch (e) {
          // ignore invalid JSON
        }
      });

      // remove duplicates
      emails = [...new Set(emails)];

      resolve(emails);
    });
  });
};

/**
 * Get equipment parameter data (Promise wrapper)
 */
// const getEquipmentParameterData = (tableName, startDate, endDate) => {
//   return new Promise((resolve, reject) => {
//     model.getEquipmentParameterData(
//       tableName,
//       startDate,
//       endDate,
//       (err, rows) => {
//         if (err) return reject(err);
//         resolve(rows);
//       }
//     );
//   });
// };

/**
 * Save generated report path (Promise wrapper)
 */
const saveGeneratedReport = (filePath, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    model.saveGeneratedReport(
      filePath,
      startDate,
      endDate,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * MAIN SERVICE: Generate Excel from DB
 */
const generateExcelReport = async (startDate, endDate) => {

     // BTU METER
    const rawBtuMeter  = await new Promise((resolve, reject) => {
    model.getBtuMeterUnifiedData(startDate, endDate, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // CHILLER 1
    const rawChiller1  = await new Promise((resolve, reject) => {
    model.getChillerUnifiedData(startDate, endDate, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

    // CHILLER 2
    const rawChiller2  = await new Promise((resolve, reject) => {
    model.getChiller2UnifiedData(startDate, endDate, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

   // CHILLER PLANT ENERGY
    const rawPlantEnergy  = await new Promise((resolve, reject) => {
    model.plantEnergyfiedData(startDate, endDate, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Excel file path
  const filePath = path.join(
    __dirname,
    `../../Uploads/Reports/report_${Date.now()}.xlsx`
  );

  const dataByEquipment = {
  CHILLER_1: pivotTelemetryRows(rawChiller1),
  CHILLER_2: pivotTelemetryRows(rawChiller2),
  CHILLER_PLANT_ENERGY: pivotTelemetryRowsforplant(rawPlantEnergy),
  BTU_METER: pivotTelemetryRows(rawBtuMeter)
};


  // Generate Excel
  await excelUtil.generateExcel({
    dataByEquipment,
    filePath,
    fromDate:startDate,
    toDate:endDate
  });

  // Save path in DB
  await saveGeneratedReport(filePath, startDate, endDate);

  const emailIds = await getReportEmails();

   // SEND EMAIL
  if (emailIds.length > 0) {
    await emailUtil.sendEmailWithAttachment({
      to: emailIds,
      subject: 'Chiller Plant Performance Report',
      text: 'Please find attached the performance report.',
      attachmentPath: filePath
    });
  }

  return filePath;
};

function resampleTo15Min(timeSeries) {
  const buckets = {};

  // Bucket rows into 15-minute slots
  timeSeries.forEach(row => {
    const bucketTime = get15MinBucket(row.measured_time);

    if (!buckets[bucketTime]) {
      buckets[bucketTime] = { measured_time: bucketTime };
    }

    Object.assign(buckets[bucketTime], row);
  });

  // Sort buckets
  const result = Object.values(buckets).sort(
    (a, b) => new Date(a.measured_time) - new Date(b.measured_time)
  );

  // Carry forward ALL numeric parameters
  let last = {};

  result.forEach(row => {
    Object.keys(last).forEach(k => {
      if (row[k] == null && last[k] != null) {
        row[k] = last[k];
      }
    });

    Object.keys(row).forEach(k => {
      if (isNum(row[k])) {
        last[k] = row[k];
      }
    });
  });

  return result;
}


const getChiller1Data = async function (startDate, endDate) {
  const ch1Data = await new Promise((resolve, reject) => {
    model.getChiller1Data(startDate, endDate, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
const grouped = {};

ch1Data.forEach(r => {
  const time = r.measured_time;

  if (!grouped[time]) {
    grouped[time] = { measured_time: time };
  }
     grouped[time][r.param_id] = Number(r.param_value);
  
 });

let timeSeries = Object.values(grouped);

timeSeries.sort(
  (a, b) => new Date(a.measured_time) - new Date(b.measured_time)
);

timeSeries = resampleTo15Min(timeSeries);

let lastKW = null;

for (let i = 0; i < timeSeries.length; i++) {
  const curr = timeSeries[i];
  const prev = timeSeries[i - 1];

  // Carry forward kW
  if (isNum(curr.Act_Pwr_Total)) {
    lastKW = curr.Act_Pwr_Total;
  } else if (lastKW !== null) {
    curr.Act_Pwr_Total = lastKW;
  }

  // Prev_kW
  curr.Prev_kW =
    prev && isNum(prev.Act_Pwr_Total)
      ? prev.Act_Pwr_Total
      : 0;

  // Time diff
  const dtHrs = prev
    ? (new Date(curr.measured_time) - new Date(prev.measured_time)) / 36e5
    : null;

  // Energy calc
  if (
    dtHrs &&
    dtHrs > 0 &&
    dtHrs <= 1 &&
    isNum(curr.Prev_kW) &&
    isNum(curr.Act_Pwr_Total)
  ) {
    const avgKW =
      (curr.Prev_kW + curr.Act_Pwr_Total) / 2;

    curr.CH_Energy_kWh = round(avgKW * dtHrs);
  } else {
    curr.CH_Energy_kWh = null;
  }

 const row = timeSeries[i];

  const { date, time } = formatDateTime(row.measured_time);

  row.DATE = date;
  row.TIME = time;

  applyChillerCalculations(curr);
}



return timeSeries;
};

const getChiller2Data = async function (startDate, endDate) {
  const ch2Data = await new Promise((resolve, reject) => {
    model.getChiller2Data(startDate, endDate, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const grouped = {};

ch2Data.forEach(r => {
  const time = r.measured_time;

  if (!grouped[time]) {
    grouped[time] = { measured_time: time };
  }
     grouped[time][r.param_id] = Number(r.param_value);
});

let timeSeries = Object.values(grouped);

timeSeries.sort(
  (a, b) => new Date(a.measured_time) - new Date(b.measured_time)
);

timeSeries = resampleTo15Min(timeSeries);

let lastKW = null;

for (let i = 0; i < timeSeries.length; i++) {
  const curr = timeSeries[i];
  const prev = timeSeries[i - 1];

  // Carry forward kW
  if (isNum(curr.Act_Pwr_Total)) {
    lastKW = curr.Act_Pwr_Total;
  } else if (lastKW !== null) {
    curr.Act_Pwr_Total = lastKW;
  }

  // Prev_kW
  curr.Prev_kW =
    prev && isNum(prev.Act_Pwr_Total)
      ? prev.Act_Pwr_Total
      : 0;

  // Time diff
  const dtHrs = prev
    ? (new Date(curr.measured_time) - new Date(prev.measured_time)) / 36e5
    : null;

  // Energy calc
  if (
    dtHrs &&
    dtHrs > 0 &&
    dtHrs <= 1 &&
    isNum(curr.Prev_kW) &&
    isNum(curr.Act_Pwr_Total)
  ) {
    const avgKW =
      (curr.Prev_kW + curr.Act_Pwr_Total) / 2;

    curr.CH_Energy_kWh = round(avgKW * dtHrs);
  } else {
    curr.CH_Energy_kWh = null;
  }

 const row = timeSeries[i];

  const { date, time } = formatDateTime(row.measured_time);

  row.DATE = date;
  row.TIME = time;

  applyChillerCalculations(curr);
}



return timeSeries;
};

const getPlantData = async function (startDate, endDate) {
  const plantData = await new Promise((resolve, reject) => {
    model.plantEnergyfiedData(startDate, endDate, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

  // Step 1: pivot
  const grouped = {};
  plantData.forEach(r => {
    const time = r.measured_time;
    if (!grouped[time]) grouped[time] = { measured_time: time };
    grouped[time][r.param_id] = Number(r.param_value);
  });

  // Step 2: sort
  let timeSeries = Object.values(grouped).sort(
    (a, b) => new Date(a.measured_time) - new Date(b.measured_time)
  );

  // Step 3: resample to 15 min
  timeSeries = resampleTo15Min(timeSeries);

  // Step 4: Prev kW tracking
  let prevPrimaryPumpKW = 0;
  let prevCP12kw = 0;
  let prevCP3kw = 0;
  let prevCTFansKW = 0;
  let prevCT1F1kw = 0;
  let prevCT1F2kw = 0;
  let prevCT1F3kw = 0;
  let prevCT2F1kw = 0;
  let prevCT2F2kw = 0;
  let prevCT2F3kw = 0;

  for (let i = 0; i < timeSeries.length; i++) {
    const row = timeSeries[i];

    // DATE / TIME
    const { date, time } = formatDateTime(row.measured_time);
    row.DATE = date;
    row.TIME = time;

    // Prev values
    row.Prev_Primary_Pump_kW = prevPrimaryPumpKW;
    row.Prev_CP_0102_kw = prevCP12kw;
    row.Prev_CP_03_kw = prevCP3kw;
    row.Prev_CT_Fans_kW = prevCTFansKW;
    row.Prev_CT1_Fan1_kw = prevCT1F1kw;
    row.Prev_CT1_Fan2_kw = prevCT1F2kw;
    row.Prev_CT1_Fan3_kw = prevCT1F3kw;
    row.Prev_CT2_Fan1_kw = prevCT2F1kw;
    row.Prev_CT2_Fan2_kw = prevCT2F2kw;
    row.Prev_CT2_Fan3_kw = prevCT2F3kw;


    // Apply calculations
    applyPlantEnergyCalculations(row);

    // Update prevs
    if (isNum(row.Primary_Pumps_Total_kW)) {
      prevPrimaryPumpKW = row.Primary_Pumps_Total_kW;
    }

     if (isNum(row.CP0102_Act_Pwr_Total)) {
      prevCP12kw = row.CP0102_Act_Pwr_Total;
    }

     if (isNum(row.CP03_Act_Pwr_Total)) {
      prevCP3kw = row.CP03_Act_Pwr_Total;
    }

    if (isNum(row.Total_CT_Fans_kW)) {
      prevCTFansKW = row.Total_CT_Fans_kW;
    }

     if (isNum(row.CT1_CT_Var_Fan_1_Motor_Power)) {
      prevCT1F1kw = row.CT1_CT_Var_Fan_1_Motor_Power;
    }

     if (isNum(row.CT1_CT_Var_Fan_2_Motor_Power)) {
      prevCT1F2kw = row.CT1_CT_Var_Fan_2_Motor_Power;
    }

    if (isNum(row.CT1_CT_Var_Fan_3_Motor_Power)) {
      prevCT1F3kw = row.CT1_CT_Var_Fan_3_Motor_Power;
    }

     if (isNum(row.CT2_CT_Var_Fan_1_Motor_Power)) {
      prevCT2F1kw = row.CT2_CT_Var_Fan_1_Motor_Power;
    }

     if (isNum(row.CT2_CT_Var_Fan_2_Motor_Power)) {
      prevCT2F2kw = row.CT2_CT_Var_Fan_2_Motor_Power;
    }

    if (isNum(row.CT2_CT_Var_Fan_3_Motor_Power)) {
      prevCT2F3kw = row.CT2_CT_Var_Fan_3_Motor_Power;
    }
  }

  return timeSeries;
};

const getBtuMeterData = async function (startDate, endDate) {
  const btuMeterData = await new Promise((resolve, reject) => {
    model.getBtuMeterUnifiedData(startDate, endDate, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const grouped = {};

btuMeterData.forEach(r => {
  const time = r.measured_time;

  if (!grouped[time]) {
    grouped[time] = { measured_time: time };
  }

  grouped[time][r.param_id] = Number(r.param_value);
});

let timeSeries = Object.values(grouped);

timeSeries.sort(
  (a, b) => new Date(a.measured_time) - new Date(b.measured_time)
);

timeSeries = resampleTo15Min(timeSeries);


for (let i = 0; i < timeSeries.length; i++) {
 const row = timeSeries[i];

  const { date, time } = formatDateTime(row.measured_time);

  row.DATE = date;
  row.TIME = time;
}

return timeSeries;
};


//   /* ========= PARALLEL DB CALLS ========= */
//   const [
//     chillerPower,
//     chillerRunHours,
//     pumpRunHours,
//     ctRunHours,
//     condenserRunHours,
//     btuData,
//     spcData
//   ] = await Promise.all([
//     model.getChillerPower(from, to),
//     model.getChillerRunHours(from, to),
//     model.getPrimaryPumpRunHours(from, to),
//     model.getCoolingTowerRunHours(from, to),
//     model.getCondenserPumpRunHours(from, to),
//     model.getBTUMeter(from, to),
//     model.getSPCData(from, to)
//   ]);

//   /* ========= CALCULATIONS ========= */

//   const chillerKWh = calculateKWh(chillerPower);

//   const TOTAL_CHILLER_RUN_HOURS =
//     chillerRunHours.CH1 + chillerRunHours.CH2;

//   const TOTAL_PRIMARY_PUMPS =
//     pumpRunHours.P1 + pumpRunHours.P2 + pumpRunHours.P3;

//   const TOTAL_CT =
//     ctRunHours.CT1_F1 + ctRunHours.CT1_F2 + ctRunHours.CT1_F3 +
//     ctRunHours.CT2_F1 + ctRunHours.CT2_F2 + ctRunHours.CT2_F3;

//   const TOTAL_CONDENSER =
//     condenserRunHours.CP1 + condenserRunHours.CP2 + condenserRunHours.CP3;

//   const TOTAL_PLANT_KWH =
//     chillerKWh.total +
//     pumpRunHours.kWh +
//     ctRunHours.kWh +
//     condenserRunHours.kWh;

//   /* ========= FINAL RESPONSE ========= */
//   return {
//     from,
//     to,

//     chillers: {
//       CH1_Run_Hours: chillerRunHours.CH1,
//       CH2_Run_Hours: chillerRunHours.CH2,
//       TOTAL: TOTAL_CHILLER_RUN_HOURS,
//       kWh: chillerKWh.total
//     },

//     primary_pumps: {
//       P1: pumpRunHours.P1,
//       P2: pumpRunHours.P2,
//       P3: pumpRunHours.P3,
//       TOTAL: TOTAL_PRIMARY_PUMPS
//     },

//     cooling_tower: {
//       TOTAL: TOTAL_CT
//     },

//     condenser_pumps: {
//       TOTAL: TOTAL_CONDENSER
//     },

//     plant: {
//       TOTAL_KWH: TOTAL_PLANT_KWH,
//       TOTAL_TRH: btuData.TRH,
//       CHILLER_SPC: spcData.chiller,
//       PLANT_SPC: spcData.plant
//     }
//   };
// };
// const calcFanKwh = (rows, fanParam) =>
//   calculateTotalKWh(
//     rows
//       .filter(r => r.param_id === fanParam)
//       .map(r => ({
//         measured_time: r.measured_time,
//         [fanParam]: Number(r.kw)
//       })),
//     fanParam
//   );

//   const mapFanRunHours = rows => ({
//   FAN_1: Number(
//     rows.find(r => r.fan === 'CT_Var_Fan_1_Running_Hrs')?.run_hours || 0
//   ),
//   FAN_2: Number(
//     rows.find(r => r.fan === 'CT_Var_Fan_2_Running_Hrs')?.run_hours || 0
//   ),
//   FAN_3: Number(
//     rows.find(r => r.fan === 'CT_Var_Fan_3_Running_Hrs')?.run_hours || 0
//   )
// });

function computeCommittedKWRows(ch1, ch2) {
  const len = Math.min(ch1.length, ch2.length);

  return Array.from({ length: len }, (_, i) => {
    const r1 = ch1[i];
    const r2 = ch2[i];

    const CH1_ON = r1.CH_Motor_Run == 1.0 ? 1 : 0;
    const CH2_ON = r2.CH_Motor_Run == 1.0 ? 1 : 0;

    const NO_OF_CHILLERS = CH1_ON + CH2_ON;
    const LOAD =
      Math.max(
        Number(r1.Chiller_Load_Percent) || 0,
        Number(r2.Chiller_Load_Percent) || 0
      ) / 100;

    return {
      measured_time: r1.measured_time,

      CHW_PUMP_KW: LOAD * NO_OF_CHILLERS * 48.1,
      CDW_PUMP_KW: NO_OF_CHILLERS * 25.89,
      CT_FAN_KW: LOAD * NO_OF_CHILLERS * 33
    };     
  });
}

function calcKwhFromKWRows(rows, key, totalHours) {
  const sumKW = rows.reduce((s, r) => s + (r[key] || 0), 0);
  const avgKW = rows.length ? sumKW / rows.length : 0;
  return avgKW * totalHours;
}



const getPlantSummary = async function (from, to) {

  /* ===============================
     1. FETCH ALL DATA IN PARALLEL
     =============================== */

let ch1Run,
    ch2Run,
    ch1Power,
    ch2Power,
    pp1Run,
    pp2Run,
    pp3Run,
    condenserRuns,
    condenser2Runs,
    condenser3Runs,
    trhRows;
try{
   [
    ch1Run,
    ch2Run,
    ch1Power,
    ch2Power,
    pp1Run,
    pp2Run,
    pp3Run,
    condenserRuns,
    condenser2Runs,
    condenser3Runs,
    trhRows,
  ] = await Promise.all([

    new Promise((resolve, reject) => {
      model.getChillerRunHours('ch_0001b00000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getChillerRunHours('ch_0002b00000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getChillerPowerSeries('em_0001000000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getChillerPowerSeries('em_0006000000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getPrimaryPumpRunHours('pv_0001b20000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getPrimaryPumpRunHours('pv_0002b20000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getPrimaryPumpRunHours('pv_0003b20000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getCondenserPumpRunHours('condpu_0001b40000_metric', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getCondenser2PumpRunHours('condpu_0002b40000_metric', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getCondenserPump3RunHours('condpu_0003b40000_metric', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }),

    new Promise((resolve, reject) => {
      model.getTRH('btm_0001110000_om_p', from, to, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  ]) 
} catch (err) {
  console.error('Plant summary fetch failed:', err);
  throw err;
}

  /* ===============================
     2. kWh CALCULATION
     =============================== */

  const CH1_kWh = calculateTotalKWh(
    ch1Power.map(r => ({
      measured_time: r.measured_time,
      CH1_Act_Pwr_Total: Number(r.kw)
    })),
    'CH1_Act_Pwr_Total'
  );

  const CH2_kWh = calculateTotalKWh(
    ch2Power.map(r => ({
      measured_time: r.measured_time,
      CH2_Act_Pwr_Total: Number(r.kw)
    })),
    'CH2_Act_Pwr_Total'
  );

  const TOTAL_CHILLER_kWh = CH1_kWh + CH2_kWh;

  const TOTAL_TRH_ACTUAL = Number(trhRows[0]?.total_trh || 0);

  const Chiller_Actual_SPC =
  TOTAL_TRH_ACTUAL > 0
    ? TOTAL_CHILLER_kWh / TOTAL_TRH_ACTUAL
    : 0;

  const plant_data = await getPlantData(from,to);

  const totalKW = plant_data.reduce(
  (sum, row) => sum + (Number(row.Total_Plant_Room_kW) || 0),
  0
);

const avgKW = plant_data.length
  ? totalKW / plant_data.length
  : 0;

  const totalHours =
  (new Date(to) - new Date(from)) / 36e5;

  const TOTAL_PLANT_KWH = avgKW * totalHours;

   const Plant_SPC =
  TOTAL_PLANT_KWH > 0
    ? TOTAL_PLANT_KWH / TOTAL_TRH_ACTUAL
    : 0;

    
    // Chiller1 Commited KWH
     const ch1_data = await getChiller1Data(from,to);

  const total_ch_KW = ch1_data.reduce(
  (sum, row) => sum + (Number(row.Committed_kW) || 0),
  0
);

const ch1avgKW = ch1_data.length
  ? total_ch_KW / ch1_data.length
  : 0;

// MAX loading %
const CH1_Loading_Percent = ch1_data.reduce(
  (max, row) => Math.max(max, Number(row.Chiller_Load_Percent) || 0),
  0
);

  const CHILLER1_COMMITED_KWH = ch1avgKW * totalHours;

  // CHILLER 2 COMMITED KWH

   
    // Chiller1 Commited KWH
     const ch2_data = await getChiller2Data(from,to);

  const total_ch2_KW = ch2_data.reduce(
  (sum, row) => sum + (Number(row.Committed_kW) || 0),
  0
);

const ch2avgKW = ch2_data.length
  ? total_ch2_KW / ch2_data.length
  : 0;

  const CH2_Loading_Percent = ch2_data.reduce(
  (max, row) => Math.max(max, Number(row.Chiller_Load_Percent) || 0),
  0
);

  const CHILLER2_COMMITED_KWH = ch2avgKW * totalHours;
  
  const total_ch_commited_kwh = CHILLER1_COMMITED_KWH + CHILLER2_COMMITED_KWH;

  const Chiller_Commited_SPC =
  TOTAL_TRH_ACTUAL > 0
    ? total_ch_commited_kwh / TOTAL_TRH_ACTUAL
    : 0;


  const committedKWRows = computeCommittedKWRows(ch1_data, ch2_data);
  
const COMMITTED_CHW_PUMP_KWH = calcKwhFromKWRows(
  committedKWRows,
  'CHW_PUMP_KW',
  totalHours
);

const COMMITTED_CDW_PUMP_KWH = calcKwhFromKWRows(
  committedKWRows,
  'CDW_PUMP_KW',
  totalHours
);

const COMMITTED_CT_FAN_KWH = calcKwhFromKWRows(
  committedKWRows,
  'CT_FAN_KW',
  totalHours
);

//   const CHILLER_LOADING_PERCENT = Math.max(
//   CH1_Loading_Percent,
//   CH2_Loading_Percent
// );

  
// const CH1_ON = ch1StatusRows[0]?.status === 'active' ? 1 : 0;
// const CH2_ON = ch2StatusRows[0]?.status === 'active' ? 1 : 0;

//const NO_OF_CHILLERS_IN_OPERATION = CH1_ON + CH2_ON;

// const COMMITTED_CHW_PUMP_KW =
//   CHILLER_LOADING_PERCENT * NO_OF_CHILLERS_IN_OPERATION * 48.1;

//   const COMMITTED_CDW_PUMP_KW =
//   NO_OF_CHILLERS_IN_OPERATION * 25.89;

//   const COMMITTED_CT_FAN_KW  =
//   CHILLER_LOADING_PERCENT * NO_OF_CHILLERS_IN_OPERATION * 33;

  const COMMITTED_CHILLER_KW = total_ch_KW + total_ch2_KW;

  // Primary Pump KWH

  const PP1_ACT_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.PV1_PriV_Pmp_Drive_kWh) || 0),
  0
);
  const PP2_ACT_KWH =  plant_data.reduce(
  (sum, row) => sum + (Number(row.PV2_PriV_Pmp_Drive_kWh) || 0),
  0
);;
  const PP3_ACT_KWH =  plant_data.reduce(
  (sum, row) => sum + (Number(row.PV3_PriV_Pmp_Drive_kWh) || 0),
  0
);;

const TOTAL_PP_KWH = PP1_ACT_KWH + PP2_ACT_KWH + PP3_ACT_KWH;


  /* ===============================
     3. RUN HOURS TOTALS
     =============================== */

  const CH1_Run = Number(ch1Run[0]?.run_hours || 0);
  const CH2_Run = Number(ch2Run[0]?.run_hours || 0);
  const TOTAL_CHILLER_Run = CH1_Run + CH2_Run;

  const PP1_Run = Number(pp1Run[0]?.run_hours || 0);
  const PP2_Run = Number(pp2Run[0]?.run_hours || 0);
  const PP3_Run = Number(pp3Run[0]?.run_hours || 0);
  const TOTAL_PP_Run = PP1_Run + PP2_Run + PP3_Run;


  const CP1_RUN = condenserRuns.reduce((s, r) => s + Number(r.run_hours), 0);
  const CP2_RUN = condenser2Runs.reduce((s, r) => s + Number(r.run_hours), 0);
  const CP3_RUN = condenser3Runs.reduce((s, r) => s + Number(r.run_hours), 0);
  const TOTAL_Cond_Run = CP1_RUN + CP2_RUN + CP3_RUN;

  const getCTFans = (table, from, to) =>
  new Promise((resolve, reject) => {
   model.getCoolingTowerFanRunHours(table, from, to, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const getFanRun = (rows, fanId) =>
  Array.isArray(rows)
    ? Number(rows.find(r => r.param_id === fanId)?.run_hours || 0)
    : 0;
/* ---- SERVICE ---- */
const ct11Fans = await getCTFans('ct_0001b70000_om_p', from, to);
const ct21Fans = await getCTFans('ct_0002b70000_om_p', from, to);

/* ---- NOW calculate ---- */
const CT1_FAN_1_Run = getFanRun(ct11Fans, 'CT_Var_Fan_1_Running_Hrs');
const CT1_FAN_2_Run = getFanRun(ct11Fans, 'CT_Var_Fan_2_Running_Hrs');
const CT1_FAN_3_Run = getFanRun(ct11Fans, 'CT_Var_Fan_3_Running_Hrs');

// const getFanRun = (rows, fanId) =>
//   Number(rows.find(r => r.param_id === fanId)?.run_hours || 0);



/* ---- CT-1 ---- */
// const CT1_FAN_1_Run = getFanRun(ct1Fans, 'CT_Var_Fan_1_Running_Hrs');
// const CT1_FAN_2_Run = getFanRun(ct1Fans, 'CT_Var_Fan_2_Running_Hrs');
// const CT1_FAN_3_Run = getFanRun(ct1Fans, 'CT_Var_Fan_3_Running_Hrs');

const CT1_TOTAL_Run =
  CT1_FAN_1_Run +
  CT1_FAN_2_Run +
  CT1_FAN_3_Run;

/* ---- CT-2 ---- */
const CT2_FAN_1_Run = getFanRun(ct21Fans, 'CT_Var_Fan_1_Running_Hrs');
const CT2_FAN_2_Run = getFanRun(ct21Fans, 'CT_Var_Fan_2_Running_Hrs');
const CT2_FAN_3_Run = getFanRun(ct21Fans, 'CT_Var_Fan_3_Running_Hrs');

const CT2_TOTAL_Run =
  CT2_FAN_1_Run +
  CT2_FAN_2_Run +
  CT2_FAN_3_Run;

/* ---- GRAND TOTAL ---- */
//const TOTAL_CT_Run = CT1_TOTAL_Run + CT2_TOTAL_Run;


// const CT1_FAN_1_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT1_CT_Var_Fan_1_Motor_Power'
// );

// const CT1_FAN_2_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT1_CT_Var_Fan_2_Motor_Power'
// );

// const CT1_FAN_3_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT1_CT_Var_Fan_3_Motor_Power'
// );

const CT1_FAN_1_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT1_FAN1_kWh) || 0),
  0
);

const CT1_FAN_2_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT1_FAN2_kWh) || 0),
  0
);

const CT1_FAN_3_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT1_FAN3_kWh) || 0),
  0
);

const CT1_TOTAL_KWH =
  CT1_FAN_1_KWH +
  CT1_FAN_2_KWH +
  CT1_FAN_3_KWH;

/* ===============================
   CT-2 FAN kWh
   =============================== */

// const CT2_FAN_1_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT2_CT_Var_Fan_1_Motor_Power'
// );

// const CT2_FAN_2_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT2_CT_Var_Fan_2_Motor_Power'
// );

// const CT2_FAN_3_KWH = calcFanKwh(
//   ctFanPowerRows,
//   'CT2_CT_Var_Fan_3_Motor_Power'
// );

const CT2_FAN_1_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT2_FAN1_kWh) || 0),
  0
);

const CT2_FAN_2_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT2_FAN2_kWh) || 0),
  0
);

const CT2_FAN_3_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.CT2_FAN3_kWh) || 0),
  0
);

const CT2_TOTAL_KWH =
  CT2_FAN_1_KWH +
  CT2_FAN_2_KWH +
  CT2_FAN_3_KWH;

/* ===============================
   GRAND TOTAL
   =============================== */

const TOTAL_CT_FAN_KWH = CT1_TOTAL_KWH + CT2_TOTAL_KWH;

// const CT1 = mapFanRunHours(ct1Fans);
// const CT2 = mapFanRunHours(ct2Fans);

// const CT1_TOTAL_RUN =
//   CT1.FAN_1 + CT1.FAN_2 + CT1.FAN_3;

// const CT2_TOTAL_RUN =
//   CT2.FAN_1 + CT2.FAN_2 + CT2.FAN_3;

const TOTAL_COOLING_TOWER_RUN =
  CT1_TOTAL_Run + CT2_TOTAL_Run;


  // Condenser Pump KWH

const CP0102_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.Condenser_Pump_0102_kWh) || 0),
  0
);

const CP03_KWH = plant_data.reduce(
  (sum, row) => sum + (Number(row.Condenser_Pump_03_kWh) || 0),
  0
);

const CP_TOTAL_KWH =
  CP0102_KWH +
  CP03_KWH

  const total_plant_kwh = CHILLER1_COMMITED_KWH + CHILLER2_COMMITED_KWH + COMMITTED_CHW_PUMP_KWH + COMMITTED_CT_FAN_KWH + COMMITTED_CDW_PUMP_KWH;

 const Plant_commited_kwh_SPC =
  total_plant_kwh > 0
    ? total_plant_kwh / TOTAL_TRH_ACTUAL
    : 0;

    const TOTAL_COMMITTED_PLANT_KWH = CHILLER1_COMMITED_KWH + CHILLER2_COMMITED_KWH + COMMITTED_CHW_PUMP_KWH + COMMITTED_CT_FAN_KWH + COMMITTED_CDW_PUMP_KWH;

  /* ===============================
     4. FINAL RESPONSE
     =============================== */

  return {
    from,
    to,

    CHILLERS: {
      CHILLER1: {
            CH1_Run_Hours: CH1_Run,
            CHILLER1_COMMITED_KWH: CHILLER1_COMMITED_KWH ,
            CH1_ACTUAL_KWH:CH1_kWh,
            DIFFERENCE_CH1: CHILLER1_COMMITED_KWH - CH1_kWh
      },
      CHILLER2: {
            CH2_Run_Hours: CH2_Run,
            CHILLER2_COMMITED_KWH: CHILLER2_COMMITED_KWH,
            CH2_ACTUAL_KWH: CH2_kWh,
            DIFFERENCE_CH2: CHILLER2_COMMITED_KWH - CH2_kWh
      },
      TOTAL_CHILLER:{
            TOTAL_CH_RUN_HR:TOTAL_CHILLER_Run,
            COMMITED_KWH:CHILLER1_COMMITED_KWH + CHILLER2_COMMITED_KWH,
            ACTUAL_KWH:CH1_kWh + CH2_kWh,
            DIFFERENCE:(CHILLER1_COMMITED_KWH - CH1_kWh) + (CHILLER2_COMMITED_KWH - CH2_kWh)
      }
     },

      PRIMARY_PUMPS: {
        PRIMARY_PUMP_1: {
        RUN_HR:PP1_Run,
        ACTUAL_KWH: PP1_ACT_KWH
        },
        
        PRIMARY_PUMP_2: {
        RUN_HR:PP2_Run,
        ACTUAL_KWH: PP2_ACT_KWH
        },

        PRIMARY_PUMP_3: {
        RUN_HR:PP3_Run,
        ACTUAL_KWH: PP3_ACT_KWH
        },
        
        TOTAL_PUMP: {
          TOTAL_RUN_HR:TOTAL_PP_Run,
          COMMITED_KWH: COMMITTED_CHW_PUMP_KWH,
          ACTUAL_KWH: PP1_ACT_KWH + PP2_ACT_KWH + PP3_ACT_KWH,
          DIFFERENCE:COMMITTED_CHW_PUMP_KWH - (PP1_ACT_KWH + PP2_ACT_KWH + PP3_ACT_KWH)
        }
     },

      COOLING_TOWERS: {
        CT1_F1: {
        RUN_HR:CT1_FAN_1_Run,
        ACTUAL_KWH: CT1_FAN_1_KWH,
      
       TOTAL_KWH: CT1_TOTAL_KWH
        },

        CT1_F2: {
        RUN_HR: CT1_FAN_2_Run,
        ACTUAL_KWH: CT1_FAN_2_KWH,
        },

        CT1_F3: {
        RUN_HR:CT1_FAN_3_Run,
        ACTUAL_KWH: CT1_FAN_3_KWH,
        },

        CT2_F1: {
        RUN_HR: CT2_FAN_1_Run,
        ACTUAL_KWH: CT2_FAN_1_KWH,
        },

        CT2_F2: {
        RUN_HR: CT2_FAN_2_Run,
        ACTUAL_KWH: CT2_FAN_2_KWH,
        },

        CT2_F3: {
        RUN_HR: CT2_FAN_3_Run,
        ACTUAL_KWH: CT2_FAN_3_KWH,
        },
        
         TOTAL_CT: {
          TOTAL_RUN_HR:TOTAL_COOLING_TOWER_RUN,
          COMMITED_KWH: COMMITTED_CT_FAN_KWH,
          ACTUAL_KWH: TOTAL_CT_FAN_KWH,
          DIFFERENCE:(COMMITTED_CT_FAN_KWH - TOTAL_CT_FAN_KWH)
        }
     },

     CONDENSER_PUMP: {
        
        CP0102: {
        RUN_HR: CP1_RUN,
        ACTUAL_KWH: CP0102_KWH,
        },
        
        CP03: {
        RUN_HR: CP3_RUN,
        ACTUAL_KWH: CP03_KWH,
        },

         TOTAL_CP: {
          TOTAL_RUN_HR:TOTAL_Cond_Run,
          COMMITED_KWH: COMMITTED_CDW_PUMP_KWH,
          ACTUAL_KWH: CP_TOTAL_KWH,
          DIFFERENCE:(COMMITTED_CDW_PUMP_KWH - CP_TOTAL_KWH)
        }
     },

     TOTAL_CHILLER_PLANT: {
          COMMITED_KWH: (CHILLER1_COMMITED_KWH + CHILLER2_COMMITED_KWH + COMMITTED_CHW_PUMP_KWH + COMMITTED_CT_FAN_KWH + COMMITTED_CDW_PUMP_KWH),
          ACTUAL_KWH:(TOTAL_CT_FAN_KWH + CP_TOTAL_KWH + TOTAL_PP_KWH + CH1_kWh + CH2_kWh),
          DIFFERENCE:( TOTAL_COMMITTED_PLANT_KWH - (TOTAL_CT_FAN_KWH + CP_TOTAL_KWH + TOTAL_PP_KWH + CH1_kWh + CH2_kWh))
     },

       TOTAL_TRH: {
        COMMITED_KWH: (TOTAL_TRH_ACTUAL),
       ACTUAL_KWH : TOTAL_TRH_ACTUAL,
        DIFFERENCE: 0.0
    },

    // NEEDS CLARIFICATION

    CHILLER_SPC: {
        COMMITED_KWH: Chiller_Commited_SPC,
       ACTUAL_KWH : Chiller_Actual_SPC,
        DIFFERENCE: Chiller_Commited_SPC - Chiller_Actual_SPC
    },

    //NEEDS CLARIFICATION
    PLANT_SPC: {
        COMMITED_KWH: Plant_commited_kwh_SPC,
       ACTUAL_KWH : Plant_SPC,
        DIFFERENCE: Plant_commited_kwh_SPC - Plant_SPC
    }

    }
      };



module.exports = {
    generateExcelReport,
    getReportEmails,
    pivotTelemetryRows,
    getChiller1Data,
    getChiller2Data,
    getPlantData,
    getBtuMeterData,
    getPlantSummary,
    computeCommittedKWRows,
    calcKwhFromKWRows,
    getNoOfChillersOn
// generateReport
}

