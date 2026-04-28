/*eslint-env node*/

const path = require("path");
const cpmUtils = require("../CPM_modular/CPM_Utilities");

require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

/////////////////////////
const fs = require("fs");
const { toFixed } = require("../Utils/common");

let loadEqpDetails = () => {
  let eqpDetails = {},
    eType = -1;
  let filename = path.join(__dirname, "../", process.env.PROJECT_EQP_DETAILS);
  // console.log("Trying to load", filename);
  // Read the file content synchronously as a UTF-8 encoded string
  const data = fs.readFileSync(filename, "utf8");
  try {
    eqpDetails = JSON.parse(data);
    // console.log(
    //   "common.js--Summary while loading file",
    //   Object.keys(eqpDetails)
    // );
    let eTypeKeys = Object.keys(eqpDetails["EQP_TYPE_TBL"]);
    for (let i = 0; i < eTypeKeys.length; i++) {
      eType = parseInt(eTypeKeys[i], 16);
      eqpDetails["EQP_TYPE_TBL"][eType] =
        eqpDetails["EQP_TYPE_TBL"][eTypeKeys[i]];
    }
  } catch (err) {
    cpmUtils.myError("Error while parsing JSON data:", err);
  }
  return eqpDetails;
};
// loadEqpDetails();
function getTableName(
  eqpCode = "GL 05 00 13 B5 C 003",
  TABLE_NAME_LENGTH = 10,
  rangeValues = {},
  deviceIds = [],
  deviceParams = {}
) {
  let eqpCodeObject = { inputValid: true, errorCode: [] };
  let tblNameLength = TABLE_NAME_LENGTH;
  let eqpParamCode,
    tblCode = 0,
    tblName = "",
    metricTblName = "",
    extractedByte = "";
  let paramCode = 0,
    paramName = "",
    devCode = 0,
    devType = "";
  let bValid = true,
    i,
    ssid,
    devIdCode = 0,
    myCodeStr;
  let eqpDetails = loadEqpDetails();
  const deviceType = eqpDetails["EQP_TYPE_TBL"];
  const bacnetObjectType = eqpDetails["BACNET_OBJ_TYPES"];

  if (eqpCode.startsWith("GL")) {
    myCodeStr = eqpCode.substring(2).replace(/ /g, "");
    eqpParamCode = Number.parseInt("0x".concat(myCodeStr), 16);

    devCode = (0xff0000 & eqpParamCode) >> 16;
    devCode = "0x" + devCode.toString(16);
    devCode = parseInt(devCode, 16);
    // devCode = devCode === '0x0' ? '0x00' : devCode;
    // devCode = devCode.toLowerCase();
    if (devCode in deviceType) {
      devType = deviceType[devCode];
      eqpCodeObject["e_ss_type"] = devType[0];
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Invalid Equipment Type: " + devCode.toString(16)
      );
      console.log("Invalid Equipment Type: " + devCode.toString(16));
    }

    // parameter Code and table Code
    paramCode = 0xffffff & eqpParamCode;
    if (tblNameLength === 12) {
      tblCode = BigInt.asIntN(
        64,
        BigInt(0xffffffff0000) & BigInt(eqpParamCode)
      ); //(0xFFFFFF0000 & eqpParamCode) >> 16;
      devIdCode = tblCode;
    } else {
      tblCode = 0xffffff0000 & eqpParamCode;
      devIdCode = tblCode;
    }
    // Handle Parameters of Child Objects
    // paramCode = ((0xC000 & paramCode) === 0xC000) ? (0xFFC00F & paramCode) : paramCode;
    if ((0xc000 & paramCode) === 0xc000) {
      paramCode &= 0xffe00f; //0xFFC00F; Changed to handle Child Alarms also
      if (tblNameLength === 12) {
        // tblCode = BigInt.asIntN(64,BigInt(0xFFFF00FFFFF0) & BigInt(eqpParamCode)); //(0xFFFFFF0000 & eqpParamCode) >> 16;
        tblCode = BigInt.asIntN(
          64,
          BigInt(0xffff00ffcff0) & BigInt(eqpParamCode)
        ); // Changed to Handle Child Alarms
        devIdCode = BigInt(0xfffffffffff0) & BigInt(eqpParamCode);
      } else {
        tblCode = 0xff00fffff0 & eqpParamCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
        devIdCode = 0xfffffffff0 & eqpParamCode;
      }
    }
    eqpCodeObject["e_address_value"] = devIdCode
      .toString(16)
      .padStart(tblNameLength, 0);
    extractedByte = (eqpParamCode & 0xff000000) >> 24;
    eqpCodeObject["e_name"] = extractedByte
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    // console.log("Device IDS",deviceIds);

    tblName = `${devType[1]}${tblCode
      .toString(16)
      .toLowerCase()
      .padStart(tblNameLength, 0)}${devType[2]}`.toLowerCase();
    eqpCodeObject["eqp_tableName"] = tblName;
    metricTblName = `${devType[1]}${tblCode
      .toString(16)
      .toLowerCase()
      .padStart(tblNameLength, 0)}_metric`.toLowerCase();
    eqpCodeObject["eqp_metricTableName"] = metricTblName;

    // mylog(`eqpParamCode, tblCode, tblName, paramCode, paramName, devCode, devType, bValid, ssid, devIdCode, myCodeStr, eqpCodeObject`);
    // console.log(eqpParamCode, tblCode, tblName, paramCode, paramName, devCode, devType, bValid, ssid, devIdCode, myCodeStr, eqpCodeObject);
    // mylog('eqpParamCode, tblCode, paramCode, devCode, devIdCode, myCodeStr');
    // printHex([eqpParamCode, tblCode, paramCode, devCode, devIdCode, myCodeStr]);
  } else {
    eqpCodeObject["inputValid"] = false;
    eqpCodeObject["errorCode"].push("Invalid Equipment Code");
    console.log(
      `processEquipmentCode ${JSON.stringify(eqpCodeObject, " ", "\n")}`
    );
  }

  if (paramName in rangeValues) {
    eqpCodeObject["range_low"] = rangeValues[paramName][0]; // Assign the low range
    eqpCodeObject["range_high"] = rangeValues[paramName][1]; // Assign the high range
  } else {
    eqpCodeObject["range_low"] = null; // Or assign a default value
    eqpCodeObject["range_high"] = null; // Or assign a default value
  }
  // console.log("ibms-------->",eqpCodeObject)
  return eqpCodeObject;
}
////////////////////////////

module.exports = {
  env: process.env.NODE_ENV,
  logs: process.env.NODE_ENV === "production" ? "combined" : "dev",
  port: {
    http: process.env.HTTP_PORT,
    https: process.env.HTTPS_PORT,
    display: process.env.DISPLAY_PORT,
    pbs1: process.env.PBS1,
  },
  mysql: {
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
    timezone: process.env.MYSQL_TIMEZONE,
  },
  secret: process.env.SECRET,
  backupDir: process.env.BACKUP_DIR,
  loadEqpDetails,
  getTableName,
};
