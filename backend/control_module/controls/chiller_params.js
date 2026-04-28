const { glDevices } = require("./constants");
const { loadSnapshot } = require("./snapshot");
const { get_mysql_pool } = require("./db");

async function get_chiller_params_values(deviceKey, target_id) {
  console.log(`Reading kw and tr of device ${[deviceKey]}`);

  const tables = {
    chiller_1: "ch_0001b00000_metric",
    chiller_2: "ch_0002b00000_metric",
  };
  const snapshot = await loadSnapshot();
  if (!snapshot) return false;
  const deviceGroup = snapshot[deviceKey];
  if (!deviceGroup) {
    console.warn(`Device group ${deviceKey} not found in snapshot`);
    return false;
  }
  const device = deviceGroup[target_id];
  if (!device) {
    console.warn(
      `requested device is not found in the ${deviceKey} list, device: ${target_id}`,
    );
    return false;
  }

  const chiller_name = device.name.trim().toLowerCase();
  const em_devices = snapshot[glDevices.em_type];

  const chiller_em_devices = Object.values(em_devices).filter((em_device) => {
    return em_device.name.trim().toLowerCase() === chiller_name;
  });

  const chiller_em_device = chiller_em_devices[0];
  if (!chiller_em_device) {
    console.warn(
      `requested device is not found in the NONGL_SS_EMS list, device: ${chiller_name}`,
    );
    return false;
  }

  const table_name =
    chiller_name === "chiller_1" ? tables.chiller_1 : tables.chiller_2;

  const pool = get_mysql_pool();

  const sql = `
      SET @kw = 0;
      SET @tr = 0;
      CALL Compute_EachChiller_kW_per_Ton(?, ?, ?, @kw, @tr, ?);
      SELECT @kw AS chiller_kw, @tr AS chiller_tr;
    `;

  const [results] = await pool.query(sql, [
    device.id,
    chiller_em_device.id,
    table_name,
    0,
  ]);

  const output = results[results.length - 1][0];

  return {
    kw: output.chiller_kw,
    tr: output.chiller_tr,
  };
}

module.exports = {
  get_chiller_params_values,
};
