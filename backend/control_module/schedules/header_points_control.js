const formula = require(".././formulas");
const actions = require("../actions");

async function write_cond_set_point_by_wbt(add_value = 0) {
  const write_parameter = "cmd_cdw_sup_temp_00";
  const OAT_param = "par_out_air_temp_00";
  const OARH_param = "par_out_air_humidity_00";

  const OAT = await actions.read_common_header_parameter(OAT_param);
  const OARH = await actions.read_common_header_parameter(OARH_param);

  const wbt = await formula.calculate_wet_bulb(Number(OAT), Number(OARH));

  const cond_write_value = Number(wbt) + Number(add_value);

  is_success = await actions.write_common_header_parameter(
    write_parameter,
    cond_write_value,
  );

  if (is_success) {
    console.log(
      `write is successfull at condensor set point for value ${cond_write_value}`,
    );
    return true;
  } else {
    console.log(
      `write failed at condensor set point for value ${cond_write_value}`,
    );
    return false;
  }
}

// write_cond_set_point_by_wbt().then((res) => {
//   console.log(res);
// });

module.exports = {
  write_cond_set_point_by_wbt,
};
