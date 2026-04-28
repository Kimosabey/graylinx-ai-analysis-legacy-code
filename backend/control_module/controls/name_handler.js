const { glNameHandler, BACnet_obj_types } = require("./constants");
const { csv_file, controllerMap } = require("./config");
const { readCSV, isIPAddress } = require("./utils");

async function get_name_handler_values(gl_code) {
  const { status, message, data } = await readCSV(csv_file);
  let ipaddress = null;
  if (!status) {
    console.warn(`Readcsv Failed: ${message}`);
    return { status: false, id: gl_code, bacnet: [], obj_type: null };
  }

  const dataRow = data.filter((dt) => dt[glNameHandler.obj_name] === gl_code);

  if (dataRow.length === 0) {
    console.warn(
      `Site Obj ID is not available in the name handler for obj_name: ${gl_code}`,
    );
    return { status: false, id: null, bacnet: [], obj_type: null };
  }
  console.log(dataRow[0][glNameHandler.bacnet]);
  console.log(dataRow);

  const isIP = isIPAddress(dataRow[0][glNameHandler.bacnet]);

  if (isIP) {
    ipaddress = dataRow[0][glNameHandler.bacnet];
  } else {
    ipaddress = controllerMap[dataRow[0][glNameHandler.bacnet]];
  }

  return {
    status: true,
    id: dataRow[0][glNameHandler.site_obj_id],
    bacnet: ipaddress,
    obj_type: BACnet_obj_types[dataRow[0][glNameHandler.obj_type]],
  };
}

module.exports = {
  get_name_handler_values,
};
