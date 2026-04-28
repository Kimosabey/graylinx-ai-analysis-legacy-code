exports.DEVICE_TO_SS_TYPE = {
  CHILLER: ['NONGL_SS_CHILLER'],
  PRIMARY_VARIABLE_PUMP: ['NONGL_SS_PRIMARY_PUMP'],
  SECONDARY_PUMP: ['NONGL_SS_SECONDARY_PUMPS'],
  CONDENSER_PUMP: ['NONGL_SS_CONDENSER_PUMPS'],
  COOLING_TOWER: ['NONGL_SS_COOLING_TOWER']
};

// Table prefix per ss_type
exports.getTablePrefix = (ssType) => {
  const map = {
    NONGL_SS_CHILLER: 'ch',
    NONGL_SS_PRIMARY_PUMP: 'pu',
    NONGL_SS_CONDENSER_PUMPS: 'condpu',
    NONGL_SS_COOLING_TOWER: 'ct',
    NONGL_SS_SECONDARY_PUMPS:'secpu'
  };
  return map[ssType] || null;
};

// Table postfix per ss_type
exports.getTablePostfix = (ssType) => {
  const map = {
    NONGL_SS_CHILLER: 'metric',
    NONGL_SS_PRIMARY_PUMP: 'metric',
    NONGL_SS_CONDENSER_PUMPS: 'metric',
    NONGL_SS_COOLING_TOWER: 'metric',
    NONGL_SS_SECONDARY_PUMPS:'metric'
  };
  return map[ssType] || null;
};

// Which column to filter on (driven by postfix type)
exports.getParamColumn = (ssType) => {
  const postfix = exports.getTablePostfix(ssType);
  if (postfix === 'metric') return 'metric_id';
  return 'param_id'; // default for om_p and others
};

// Runtime param(s) per ss_type — array to support multiple (e.g. Cooling Tower)

exports.getRuntimeParam = (ssType) => {
  const map = {
    NONGL_SS_CHILLER: 'rh_cumulative',
    NONGL_SS_PRIMARY_PUMP: 'rh_cumulative',
    NONGL_SS_CONDENSER_PUMPS: 'rh_cumulative',
    NONGL_SS_COOLING_TOWER: 'rh_cumulative',
    NONGL_SS_SECONDARY_PUMPS: 'rh_cumulative'
  };

  return map[ssType] || null;
};
// exports.getRuntimeParams = (ssType) => {
//   const map = {
//     NONGL_SS_CHILLER:          ['rh_cumulative'],
//     NONGL_SS_PRIMARY_PUMP:     ['rh_cumulative'],
//     NONGL_SS_CONDENSER_PUMPS:  ['rh_cumulative'],
//     NONGL_SS_COOLING_TOWER:    [
//       'rh_cumulative'
//     ]
//   };
//   return map[ssType] || null;
// };
