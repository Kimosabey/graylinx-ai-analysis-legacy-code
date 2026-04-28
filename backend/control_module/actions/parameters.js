const controls = require("../controls");

async function read_cpm_parameter(parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_cpm_head_parameter(
      controls.glDeviceSnapShotMap.cpm.key,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function write_cpm_parameter(parameter, value) {
  console.log(`Action: write parameter: ${parameter} value..`);
  try {
    return await controls.write_cpm_head_parameter(
      controls.glDeviceSnapShotMap.cpm.key,
      parameter,
      value,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function read_wc_header_parameter(parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.key,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function write_wc_header_parameter(parameter, value) {
  console.log(`Action: write parameter: ${parameter} value..`);
  try {
    return await controls.write_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.key,
      parameter,
      value,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function read_ac_header_parameter(parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.ac_ch_key,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function write_ac_header_parameter(parameter, value) {
  console.log(`Action: write parameter: ${parameter} value..`);
  try {
    return await controls.write_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.ac_ch_key,
      parameter,
      value,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function read_common_header_parameter(parameter) {
  console.log(`Action: read parameter: ${parameter} value..`);
  try {
    return await controls.read_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.key,
      parameter,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function write_common_header_parameter(parameter, value) {
  console.log(`Action: write parameter: ${parameter} ${value}..`);
  try {
    return await controls.write_cpm_head_parameter(
      controls.glDeviceSnapShotMap.headers.key,
      parameter,
      value,
    );
  } catch (error) {
    console.error(`cannot read value for parameter ${parameter} from CPM`);
  }
}

async function read_wc_cond_water_return_temperature() {
  return await controls.read_cpm_head_parameter(
    controls.glDeviceSnapShotMap.headers.key,
    controls.glDeviceSnapShotMap.headers.ch_wc_head_STemp,
  );
}

async function read_wc_cond_water_return_temperature_setpoint() {
  return await controls.read_cpm_head_parameter(
    controls.glDeviceSnapShotMap.headers.key,
    controls.glDeviceSnapShotMap.headers.cond_water_head_sup_temp_set,
  );
}

module.exports = {
  read_cpm_parameter,
  write_cpm_parameter,
  read_wc_header_parameter,
  write_wc_header_parameter,
  read_ac_header_parameter,
  write_ac_header_parameter,
  read_common_header_parameter,
  write_common_header_parameter,
  read_wc_cond_water_return_temperature,
  read_wc_cond_water_return_temperature_setpoint,
};
