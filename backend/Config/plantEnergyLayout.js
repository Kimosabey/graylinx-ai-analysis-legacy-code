module.exports = {
  leftFixed: [
    { key: 'date', label: 'DATE' },
    { key: 'time', label: 'TIME' }
  ],

  groups: [

/* ===============================
   CHILLERS
================================ */
{
  title: 'Chiller Parameters',
  columns: [
    { key: 'chw_leave_temp', label: 'CHW LEAVE TEMPERATURE', source: 'CH1_CH_Leaving_Chilled_Lqd_Temp' },
    { key: 'ch1_tr', label: 'YK CHILLER 1 TR', source: 'CH1_TR' },
    { key: 'ch1_kw', label: 'YK CHILLER 1 KW', source: 'CH1_KW' },
    { key: 'spc1', label: 'SPC 1', source: 'SPC1' },
    { key: 'ch2_tr', label: 'YK CHILLER 2 TR', source: 'CH2_TR' },
    { key: 'ch2_kw', label: 'YK CHILLER 2 KW', source: 'CH2_KW' },
    { key: 'spc2', label: 'SPC 2', source: 'SPC2' }
  ]
},

/* ===============================
   PRIMARY PUMPS
================================ */
{
  title: 'Primary Pumps Parameters',
  columns: [
    { key: 'pp1_kw', label: 'PRIMARY PUMP 1 KW', source: 'PV1_PriV_Pmp_Drive_Power' },
    { key: 'pp2_kw', label: 'PRIMARY PUMP 2 KW', source: 'PV2_PriV_Pmp_Drive_Power' },
    { key: 'pp3_kw', label: 'PRIMARY PUMP 3 KW', source: 'PV3_PriV_Pmp_Drive_Power' },

    {
      key: 'pp_total_kw',
      label: 'PRIMARY PUMPS TOTAL KW',
      calculate: row =>
        (row.PV1_PriV_Pmp_Drive_Power || 0) +
        (row.PV2_PriV_Pmp_Drive_Power || 0) +
        (row.PV3_PriV_Pmp_Drive_Power || 0)
    },

    { key: 'pp_total_kwh', label: 'PRIMARY PUMPS TOTAL KWH', source: 'PP_TOTAL_KWH' }
  ]
},

/* ===============================
   CONDENSER PUMPS
================================ */
{
  title: 'Condenser Pumps Parameters',
  columns: [
    { key: 'cp1_kw', label: 'CONDENSER PUMP 1 KW', source: 'CP1_KW' },
    { key: 'cp1_kwh', label: 'CONDENSER PUMP 1 KWH', source: 'CP1_KWH' },
    { key: 'cp2_kw', label: 'CONDENSER PUMP 2 KW', source: 'CP2_KW' },
    { key: 'cp2_kwh', label: 'CONDENSER PUMP 2 KWH', source: 'CP2_KWH' },
    { key: 'cp3_kw', label: 'CONDENSER PUMP 3 KW', source: 'CP3_KW' },
    { key: 'cp3_kwh', label: 'CONDENSER PUMP 3 KWH', source: 'CP3_KWH' }
  ]
},

/* ===============================
   COOLING TOWER FANS
================================ */
{
  title: 'Cooling Tower Fans Parameters',
  columns: [
    { key: 'ct1f1_kw', label: 'CT1 FAN1 KW', source: 'CT1_CT_Var_Fan_1_Motor_Power' },
    { key: 'ct1f1_kwh', label: 'CT1 FAN1 KWH', source: 'CT1_CT_Var_Fan_1_Motor_Power' },
    { key: 'ct1f2_kw', label: 'CT1 FAN2 KW', source: 'CT1_CT_Var_Fan_2_Motor_Power' },
    { key: 'ct1f2_kwh', label: 'CT1 FAN2 KWH', source: 'CT1_CT_Var_Fan_2_Motor_Power' },
    { key: 'ct1f3_kw', label: 'CT1 FAN3 KW', source: 'CT1_CT_Var_Fan_3_Motor_Power' },
    { key: 'ct1f3_kwh', label: 'CT1 FAN3 KWH', source: 'CT1_CT_Var_Fan_3_Motor_Power' },
    { key: 'ct2f1_kw', label: 'CT2 FAN1 KW', source: 'CT2_CT_Var_Fan_1_Motor_Power' },
    { key: 'ct2f1_kwh', label: 'CT2 FAN1 KWH', source: 'CT2_CT_Var_Fan_1_Motor_Power' },
    { key: 'ct2f2_kw', label: 'CT2 FAN2 KW', source: 'CT2_CT_Var_Fan_2_Motor_Power' },
    { key: 'ct2f2_kwh', label: 'CT2 FAN2 KWH', source: 'CT2_CT_Var_Fan_2_Motor_Power' },
    { key: 'ct2f3_kw', label: 'CT2 FAN3 KW', source: 'CT2_CT_Var_Fan_3_Motor_Power' },

    {
      key: 'ct_total_kw',
      label: 'TOTAL COOLING TOWER FANS KW',
      calculate: row =>
    (Number(row.ct1f1_kw) || 0) +
    (Number(row.ct1f2_kw) || 0) +
    (Number(row.ct1f3_kw) || 0) +
    (Number(row.ct2f1_kw) || 0) +
    (Number(row.ct2f2_kw) || 0) +
    (Number(row.ct2f3_kw) || 0)
    }
  ]
}

]
};
