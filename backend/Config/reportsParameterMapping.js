// const { constant } = require("lodash");

const { round } = require("lodash");
const { roundVal } = require('../Utils/math.utils');



module.exports = {

    BTU_METER: {
    Btu_Meter_Outlet_Temp: {
      label: 'BTU CHW  OUTLET TEMPERATURE ( )(DEG C)',
  
    },

    Btu_Meter_Inlet_Temp: { 
      label:  'BTU CHW  INTLET TEMPERATURE ( )(DEG C)',
      round: 2 
    },

    Btu_Meter_Volume_m3: {
      label: 'BTU FLOW (M3 H)(m3/h)',
      round: 2 
    },

       Btu_Meter_Actual_Flow: {
      label: 'BTU ENERGY FLOW (KW)',
      round: 2 
    },

    Btu_Meter_Actual_Flow: { label: 'BTU ENERGY (TOTAL KWH)' },


    POWER: { label: 'CALCULATED   FROM BTU ENERGY FLOW ( )(TR)' },
  },

  CHILLER_1: {
    SETPOINT_TEMP: {
      label: 'CHILLER TEMPERATURE LEAVING SETPOINT (DEG C)',
      constant: 7.3
    },

    CH_Leaving_CDW_Lqd_Temp: { 
      label:  'CHW OUTLET TEMPERATURE (DEG C)',
      round: 2 
    },

    CH_Entering_CDW_Lqd_Temp: {
      label: 'CHW INTLET TEMPERATURE (DEG C)',
      round: 2 
    },

    Btu_Meter_Volume_m3: {
      label: 'BTU FLOW (m3/h)',
      round: 2
    },

DELTA_T: {
  label: 'DELTA T (DEG C)',
  calculate: (row) =>
    roundVal(
      row.CH_Entering_CDW_Lqd_Temp - row.CH_Leaving_CDW_Lqd_Temp,
      2
    )
},

    Btu_Meter_Actual_Power: { label: 'CALCULATED FROM BTU ENERGY FLOW (TR)' },

    ROUNDED_TR: {
      label: 'ROUNDED (TR)',
   calculate: (row) =>
    roundVal(
      row.Btu_Meter_Actual_Power,
      2
    )
    },

    POWER: { label: 'CH-1, POWER CONSUMPTION' },

    KWH: {
      label: 'CH-1, KWH CONSUMPTION',
      formula: (r, c) => `=ROUND(${c.POWER}${r},2)`
    },

        Flow_Meter_CD_1: {
      label: 'CONDENSER FLOW (m3/h)',
      round: 2
    },

        CH_Entering_Chilled_Lqd_Temp: {
      label: 'CEFT TEMPERATURE (DEG C)',
      round: 2
    },

        CH_Leaving_Chilled_Lqd_Temp: {
      label: 'CLFT TEMPERATURE (DEG C)',
      round: 2
    },

        Formula_needed1: {
      label: 'WET BULB TEMPERATURE - CHILLER 1 (DEG C)',
    },

            Formula_needed2: {
      label: 'CHILLER LOAD,(TR%)',
      round: 2
    },

            CH_kW_per_TR: {
      label: 'ACTUAL OPERATING (ikW/TR)',
      round: 2
    },

            Nodata: {
      label: 'COMMITTED PERFORMANCE (ikW/TR)',
      round: 2
    },

            Formula_needed: {
      label: 'COMMITED KW',
      round: 2
    },

    Formula_needed: {
    label: 'PERFORMANCE DEVIATION(%)',
    round: 2
    },

    CH_Operating_hrs: {
    label: 'RUN HOURS',
    round: 2
  }
  },

  CHILLER_2: {
    SETPOINT_TEMP: {
      label: 'CHILLER TEMPERATURE LEAVING SETPOINT (DEG C)',
      constant: 7.3
    },

    CH_Leaving_CDW_Lqd_Temp: { 
      label:  'CHW OUTLET TEMPERATURE (DEG C)',
      round: 2 
    },

    CH_Entering_CDW_Lqd_Temp: {
      label: 'CHW INTLET TEMPERATURE (DEG C)',
      round: 2 
    },

    Btu_Meter_Volume_m3: {
      label: 'BTU FLOW (m3/h)',
      round: 2
    },

    DELTA_T: {
    label: 'DELTA T (DEG C)',
    calculate: (row) =>
      roundVal(
        row.CH_Entering_CDW_Lqd_Temp - row.CH_Leaving_CDW_Lqd_Temp,
        2
      )
    },

    Btu_Meter_Actual_Power: { label: 'CALCULATED FROM BTU ENERGY FLOW (TR)' },

    ROUNDED_TR: {
      label: 'ROUNDED (TR)',
   calculate: (row) =>
    roundVal(
      row.Btu_Meter_Actual_Power,
      2
    )
    },

    POWER: { label: 'CH-1, POWER CONSUMPTION' },

    KWH: {
      label: 'CH-1, KWH CONSUMPTION',
      formula: (r, c) => `ROUND(${c.POWER}${r},2)`
    },

        Flow_Meter_CD_1: {
      label: 'CONDENSER FLOW (m3/h)',
      round: 2
    },

        CH_Entering_Chilled_Lqd_Temp: {
      label: 'CEFT TEMPERATURE (DEG C)',
      round: 2
    },

        CH_Leaving_Chilled_Lqd_Temp: {
      label: 'CLFT TEMPERATURE (DEG C)',
      round: 2
    },

        Formula_needed: {
      label: 'WET BULB TEMPERATURE - CHILLER 1 (DEG C)',
    },

            Formula_needed: {
      label: 'CHILLER LOAD,(TR%)',
      round: 2
    },

            CH_kW_per_TR: {
      label: 'ACTUAL OPERATING (ikW/TR)',
      round: 2
    },

            Nodata: {
      label: 'COMMITTED PERFORMANCE (ikW/TR)',
      round: 2
    },

            Formula_needed: {
      label: 'COMMITED KW',
      round: 2
    },

    Formula_needed: {
    label: 'PERFORMANCE DEVIATION(%)',
    round: 2
    },

    CH_Operating_hrs: {
    label: 'RUN HOURS',
    round: 2
  }
  },

  /**
 * PLANT ENERGY PARAMETER MAPPING
 * - source  → raw DB param_id (after CONCAT like PV1_, CT1_, etc.)
 * - key     → MUST match layout column keys
 * - round   → decimals (2)
 * - formula → Excel formula (NO JS calculation)
 */

CHILLER_PLANT_ENERGY: {
  /* ===============================
     CHILLER PARAMETERS
  =============================== */
    
  CH_Operating_hrs: {
    label: 'RUN HOURS',
    round: 2
  },
  chw_leave_temp: {
    source: 'CH1_CH_Leaving_Chilled_Lqd_Temp',
    round: 2
  },

  ch_tr: {
    source: 'CH1_CH_TR',
    round: 2
  },

  ch_kw: {
    source: 'CH1_CH_KW',
    round: 2
  },

  spc1: {
    formula: '=IFERROR(C{row}/D{row},0)', // example SPC formula
    round: 2
  },

  ch2_tr: {
    source: 'CH2_CH_TR',
    round: 2
  },

  ch2_kw: {
    source: 'CH2_CH_KW',
    round: 2
  },

  spc2: {
    formula: '=IFERROR(F{row}/G{row},0)',
    round: 2
  },

  /* ===============================
     PRIMARY PUMPS (PV)
  =============================== */

  pp1_kw: {
    source: 'PV1_PriV_Pmp_Drive_Power',
    round: 2
  },

  pp2_kw: {
    source: 'PV2_PriV_Pmp_Drive_Power',
    round: 2
  },

  pp3_kw: {
    source: 'PV3_PriV_Pmp_Drive_Power',
    round: 2
  },

  pp1_hz: {
    source: 'PV1_PriV_Pmp_Drive_Frequency',
    round: 2
  },

  pp2_hz: {
    source: 'PV2_PriV_Pmp_Drive_Frequency',
    round: 2
  },

  pp3_hz: {
    source: 'PV3_PriV_Pmp_Drive_Frequency',
    round: 2
  },

  pp_total_kw: {
    formula: '=SUM(H{row}:J{row})',
    round: 2
  },

  pp_total_kwh: {
    formula: '=K{row}*1', // placeholder (depends on your KWH logic)
    round: 2
  },

  /* ===============================
     CONDENSER PUMPS (if added later)
     (kept ready, safe to leave)
  =============================== */

  cp1_kw: {
    source: 'CP1_Cond_Pmp_Power',
    round: 2
  },

  cp1_kwh: {
    source: 'CP1_Cond_Pmp_Energy',
    round: 2
  },

  cp2_kw: {
    source: 'CP2_Cond_Pmp_Power',
    round: 2
  },

  cp2_kwh: {
    source: 'CP2_Cond_Pmp_Energy',
    round: 2
  },

  cp3_kw: {
    source: 'CP3_Cond_Pmp_Power',
    round: 2
  },

  cp3_kwh: {
    source: 'CP3_Cond_Pmp_Energy',
    round: 2
  },

  /* ===============================
     COOLING TOWER FANS (CT)
  =============================== */

  ct1f1_kw: {
    source: 'CT1_CT_Var_Fan_1_Motor_Power',
    round: 2
  },

  ct1f2_kw: {
    source: 'CT1_CT_Var_Fan_2_Motor_Power',
    round: 2
  },

  ct1f3_kw: {
    source: 'CT1_CT_Var_Fan_3_Motor_Power',
    round: 2
  },

  ct2f1_kw: {
    source: 'CT2_CT_Var_Fan_1_Motor_Power',
    round: 2
  },

  ct2f2_kw: {
    source: 'CT2_CT_Var_Fan_2_Motor_Power',
    round: 2
  },

  ct2f3_kw: {
    source: 'CT2_CT_Var_Fan_3_Motor_Power',
    round: 2
  },

  ct1f1_kwh: {
    formula: '=L{row}*1',
    round: 2
  },

  ct1f2_kwh: {
    formula: '=M{row}*1',
    round: 2
  },

  ct1f3_kwh: {
    formula: '=N{row}*1',
    round: 2
  },

  ct2f1_kwh: {
    formula: '=O{row}*1',
    round: 2
  },

  ct2f2_kwh: {
    formula: '=P{row}*1',
    round: 2
  },

  ct2f3_kwh: {
    formula: '=Q{row}*1',
    round: 2
  }
}


};


