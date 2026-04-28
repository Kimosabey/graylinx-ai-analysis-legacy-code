/*
Objectives:
Simplify Commissioning
Simplify Data Acquisition
		  resObj['tableName']=deviceType[Element.objName.slice(6,8)]=='NONGL_SS_EMS'?''+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_AHU'?''+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_CHILLER'?''+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_PUMPS'?''+Element.objName.slice(2,8)+'_om_p':deviceType[Element.objName.slice(6,8)]=='NONGL_SS_VAV'?'vav_'+Element.objName.slice(2,8)+'_om_p': deviceType[Element.objName.slice(6,8)]=='NONGL_SS_SECONDARY_PUMPS'?''+Element.objName.slice(2,8)+'_om_p':[]
		  with logs
*/
const { OK, CREATED, ACCEPTED } = require("http-status");
const fns = require("date-fns");
const uuid = require("uuid");
const { pool } = require("../../Database/pool");
const { json } = require("body-parser");
const { toFixed, printDate } = require("../../Utils/common");
// const mylog = msg => console.log("myIBMSPreparation.js", fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"), msg);
// const mylog = msg => console.log("myIBMSPreparation.js", fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"));
// const { toFixed, printDate } = require('../../Utils/common');
// const mylog = msg => console.log("myIBMSPreparation.js", fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"), msg);
const mylog = (msg) =>
  console.log(
    "myIBMSPreparation.js",
    fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
  );
// const myloglist = mylist => {};
var loaderStarted = false;
var fs = require("fs");
const fastcsv = require("fast-csv");
// const TABLE_NAME_LENGTH = 12; changed because of unicharm duplicate table names
const TABLE_NAME_LENGTH = 10;
const path = require("path");
const { loadEqpDetails } = require("../../Config/common");
const { template } = require("lodash");
let eqpDetails = loadEqpDetails();
console.log(
  "IBMSPreparation--Summary while loading file",
  typeof eqpDetails,
  Object.keys(eqpDetails),
);

let x = path.join(__dirname, "../../CBParameters.csv");

// let x = './CBParameters.csv';
let deviceParams = {},
  rangeValues = {};
let glcParametersData = [],
  myi = 0,
  myis = [1, 74, 100, 118, 120, 124, 128, 130, 135, 140, 148];

function getParamCode(eCode, pCode) {
  let paramCode = parseInt(
    eCode +
      parseInt(pCode)
        .toString(16)
        .toLowerCase()
        .padStart(4, 0),
    16,
  );
  // const getData = require('../../Apps/Alarm_others/Alarm_other_copy');
  return paramCode;
}

function prepareIBMSData(cbJson = []) {
  let tempname = "";
  for (myi = 0; myi < cbJson.length; myi++) {
    let pCode = getParamCode(
      cbJson[myi]["EqpTypeCode"],
      cbJson[myi]["ParameterCode"],
    );
    // using trim to remove leading and trailing spaces
    //   deviceParams[pCode] = cbJson[myi]['ParameterName']
    tempname = cbJson[myi]["ParameterName"].trim();
    tempname = tempname.replace(/ /g, "_");
    tempname = tempname.replace(/__/g, "_");
    deviceParams[pCode] = tempname;

    rangeValues[cbJson[myi]["ParameterName"]] = [
      cbJson[myi]["RangeLow"],
      cbJson[myi]["RangeHigh"],
    ];
  }
}
function myappend(mycontent, myfile = "mynewfile.txt") {
  fs.appendFile(myfile, mycontent, function(err) {
    if (err) throw err;
    mylog("Updated!");
  });
}

const executeSQLstatement = (mystmt, callback) => {
  mylog("Request to executeSQLstatement: " + mystmt);
  pool.getConnection((error, connection) => {
    mylog("Connection Received from Pool");
    if (connection) {
      connection.query(mystmt, (error, result) => {
        mylog("Query Executed");
        connection.release();
        mylog("Connection Released to Pool");
        if (error) {
          myappend(`executeSQLstatement - Query Execution Error: ${mystmt}`);
          mylog("executeSQLstatement - Query Execution Error");
          myappend(`executeSQLstatement - Query Execution Error: ${mystmt}`);
          mylog("executeSQLstatement - Query Execution Error");
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback("DB CONNECTION ERROR");
    }
    if (error) {
      myappend(`executeSQLstatement - Connection Error: ${mystmt}`);
      mylog("executeSQLstatement - Connection Error");
    }
  });
};

const deviceType = eqpDetails["EQP_TYPE_TBL"];

const bacnetObjectType = eqpDetails["BACNET_OBJ_TYPES"];
var Final_Json = [];
var deviceIds = {};
/*
{
	0x0001B0: "1ad5bc1a-26d8-4f0f-bb83-6d9fcd7a307d",
	0x0007A0: "1ae9be45-ac99-452a-891e-82ed05316ccb",
	0x0004A0: "258c9046-7f98-4655-97f8-3eead407a38e",
	0x0009A0: "3accde89-f92c-475d-b120-c60a86e11eb0",
	0x0005A0: "4103e83b-7634-41f4-a874-d12d110fc882",
	0x0001B1: "58ce72da-8981-4cd5-9399-f7edf1f88d29",
	0x0001B2: "6855973e-e081-4a56-bf5b-0fe7c63c334f",
	0x0003A0: "8436b023-6f98-4691-89ed-1ba10251891d",
	0x0002A0: "858c87b6-cb8f-4028-95be-d5cdfbf96f4a",
	0x000aA0: "bc06b917-1648-4cd1-bf7c-7fe3f2940422",
	0x0006A0: "c0c79c80-8752-4074-8c65-bfb4187e9475",
	0x0008A0: "e9db48cb-a7a9-4de5-9292-c5d8cc8f816d",
	0x0001A0: "ea107fb1-b569-40ea-b2df-3d82d04b4b7d",
	0x0001B5: "874a7fda-d8a2-4b22-b4cc-f6d0d91e75d0",
	0x0002B5: "a26a0401-6855-4595-b97b-49eee6a75917"
};
*/
function initialize(callback) {
  // Get Device Details
  let stream = fs.createReadStream(x);
  let csvStream = fastcsv
    .parse({ headers: true })
    .on("data", function(data) {
      glcParametersData.push(data);
    })
    .on("end", function(rowCount) {
      console.log(`Parsed ${rowCount} rows`);
      prepareIBMSData(glcParametersData);
      // checkSampleParams();
    });
  stream.pipe(csvStream);
  let eqpQuery = `SELECT CONCAT('0x', ss_address_value) AS glSSId, ss_type, ddcid, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid FROM gl_subsystem WHERE ss_type='GL_SS_ADDRESS_BACNET_DDC' AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE eqp.ss_parent=ddcid OR eqp.id=ddcid ORDER BY ss_type, CONVERT(name,decimal)`;
  // let eqpQuery = `SELECT CONCAT('0x', ss_address_value) AS glSSId, ss_type, ddcid, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid FROM gl_subsystem WHERE ss_type='GL_SS_ADDRESS_BACNET_DDC' AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE eqp.ss_parent=ddcid OR eqp.ss_parent='ddcid' ORDER BY ss_type, CONVERT(name,decimal)`;
  executeSQLstatement(eqpQuery, (eu, ru) => {
    loaderStarted = true;
    if (eu) {
      mylog(`initialize-Error in Dataloader Initialization => ${eu}`);
      callback(eu, null);
    }
    if (ru) {
      /////////////////////////////////////////////////////////////
      const groupedData = ru.reduce((acc, item) => {
        const ssType = item.ss_type;
        if (!acc[ssType]) {
          acc[ssType] = [];
        }
        acc[ssType].push(item);
        return acc;
      }, {});

      // Transform the grouped data into the desired structure
      const transformedResponse = {
        Equipment_Static_Data: Object.entries(
          groupedData,
        ).map(([key, value]) => ({ [key]: value })),
      };
      Final_Json.push(transformedResponse);
      ////////////////////////////////////////////////////////////
      // mylog(`'initialize-Success => ', ${JSON.stringify(Final_Json)}`);
      for (let i = 0; i < ru.length; i++) {
        deviceIds[Number.parseInt(ru[i]["glSSId"], 16)] = ru[i]["id"];
        // mylog(`initialize-${Number.parseInt(ru[i]['glSSId'], 16)} ${ru[i]['id']}`);
      }
      getDataFromLatestEvent((err, result) => {
        if (err) {
          callback(err, null);
        } else {
          // mylog(`'initialize-Success => ', ${JSON.stringify(Final_Json)}`);
          callback(null, ru);
        }
      });
    }
  });
}

function printHex(myInts = []) {
  let myvals = "";
  for (let i = 0; i < myInts.length; i++) {
    myvals = myvals.concat(myInts[i].toString(16)) + ", ";
  }
  mylog("printHex: " + myvals);
}

function getTableSSID(eqpCode = 0x00000aa0002d) {
  let tblName, indexCode, tblPart;
  let tblCode = (0xffffff0000 & eqpCode) >> 16;
  let ssid = deviceIds[tblCode];

  let devCode = (0xff0000 & eqpCode) >> 16;
  let devType = deviceType[devCode];

  if (eqpCode & 0xf000) {
    // Child Objects like VAV
    indexCode = (0x0ff0 & eqpCode) >> 4;
    tblPart = indexCode
      .toString(16)
      .toLowerCase()
      .padStart(2, 0);
    tblName = `${devType[3]}${tblPart}${devType[1]}${devType[2]}`; //ahu_{xy}_vav_om_p
  } else {
    indexCode = (0xffff000000 & eqpCode) >> 24;
    tblPart =
      indexCode
        .toString(16)
        .toLowerCase()
        .padStart(4, 0) +
      devCode
        .toString(16)
        .toUpperCase()
        .padStart(2, 0);
    tblName = `${devType[1]}${tblPart}${devType[2]}`;
  }
  // printHex([eqpCode, tblCode, devCode]);
  return { tableName: tblName, ss_id: ssid };
}

function getParamName(eqpCode = 0x00000aa0002d) {
  if (eqpCode & 0xf000) {
    // Child Objects like VAV
    return deviceParams[0xffc00f & eqpCode];
  } else {
    return deviceParams[0xffffff & eqpCode];
  }
}

function getMeasuredTime() {
  // let myPrepend = h => String(h).padStart(2, 0);
  // let myTime = new Date();
  // return `${myTime.getFullYear()}-${myPrepend(myTime.getMonth() + 1)}-${myPrepend(myTime.getDate())} ${myPrepend(myTime.getHours())}:${myPrepend(myTime.getMinutes())}:${myPrepend(myTime.getSeconds())}`;

  return fns.format(new Date(), "yyyy-MM-dd' 'HH:mm:ss");
}

let sample = {
  request: {
    request_uuid: "0bc0ab15-6a94-4d3f-9e4c-8f196f3ee514",
    request_parts: [
      "",
      "readmultiple",
      "127.0.0.1:1928",
      "2:13657",
      "objectName",
      "presentValue",
      "2:13651",
      "objectName",
      "presentValue",
      "2:13676",
      "objectName",
      "presentValue",
      "2:13639",
      "objectName",
      "presentValue",
      "2:13650",
      "objectName",
      "presentValue",
      "2:13656",
      "objectName",
      "presentValue",
      "2:13697",
      "objectName",
      "presentValue",
      "2:13634",
      "objectName",
      "presentValue",
      "2:13685",
      "objectName",
      "presentValue",
      "2:13646",
      "objectName",
      "presentValue",
    ],
    query_params: { type: ["_p"] },
    Request_At: "2023-10-14 13:39:57",
    Arguments: [
      "",
      "readmultiple",
      "127.0.0.1:1928",
      "2:13657",
      "objectName",
      "presentValue",
      "2:13651",
      "objectName",
      "presentValue",
      "2:13676",
      "objectName",
      "presentValue",
      "2:13639",
      "objectName",
      "presentValue",
      "2:13650",
      "objectName",
      "presentValue",
      "2:13656",
      "objectName",
      "presentValue",
      "2:13697",
      "objectName",
      "presentValue",
      "2:13634",
      "objectName",
      "presentValue",
      "2:13685",
      "objectName",
      "presentValue",
      "2:13646",
      "objectName",
      "presentValue",
    ],
    current_status: "Work in progress...",
  },
  response: {
    propertyResults: [
      {
        objectType: "analogValue",
        objectId: 13657,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 01a",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 10743.1904296875,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13651,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 014",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 52.13999938964844,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13676,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 02d",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 3.2899999618530273,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13639,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 008",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 21.229999542236328,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13650,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 013",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 56.40999984741211,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13656,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 019",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 69.83000183105469,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13697,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 042",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: -70.30999755859375,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13634,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 003",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 40.29999923706055,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13685,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 036",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 9.890000343322754,
          },
        ],
      },
      {
        objectType: "analogValue",
        objectId: 13646,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 00f",
          },
          { propertyId: "presentValue", datatype: "Any", propertyValue: 10.75 },
        ],
      },
    ],
  },
};
let objSample = [
  { objectId: ["device", 36], objectName: "FW14/08/28" },
  { objectId: ["analogValue", 0], objectName: "GL 00 00 0a A0 0 01a" },
  { objectId: ["analogValue", 13657], objectName: "00 00 00 A0 0 001" },
  { objectId: ["analogValue", 2], objectName: "00 00 00 A0 0 002" },
];
let rmmSample = {
  response: {
    propertyResults: [
      {
        objectType: "analogValue",
        objectId: 13657,
        properties: [
          {
            propertyId: "objectName",
            datatype: "Any",
            propertyValue: "GL 00 00 0a A0 0 01a",
          },
          {
            propertyId: "presentValue",
            datatype: "Any",
            propertyValue: 10743.1904296875,
          },
        ],
      },
    ],
  },
};
// Number.parseInt("0x00000aA0001a", 16) + "<br>" + Number.parseInt("0x00000aA0001a", 16).toString(16);
function getNameValue(oProps = []) {
  let myObj = { objectName: "", presentValue: "" };
  for (let i = 0; i < oProps.length; i++) {
    switch (oProps[i]["propertyId"]) {
      case "objectName":
        myObj["objectName"] = oProps[i]["propertyValue"];
        break;
      case "presentValue":
        myObj["presentValue"] = oProps[i]["propertyValue"];
        break;
      default:
        break;
    }
  }
  return myObj;
}
function preProcessResults(
  rmmResponse = {},
  objPosition = ["response", "propertyResults"],
) {
  let objProps = rmmResponse;
  let myProps = [],
    mytemp = {};
  let i, oName, oValue, oId;
  for (i = 0; i < objPosition.length; i++) {
    objProps = objProps[objPosition[i]];
  }
  for (i = 0; i < objProps.length; i++) {
    mytemp = {};
    oId = objProps[i]["objectId"];
    mytemp = getNameValue(objProps[i]["properties"]);
    myProps.push({
      objectId: oId,
      objectName: mytemp["objectName"],
      presentValue: mytemp["presentValue"],
    });
  }
  // mylog(`preProcessResults: Size-${myProps.length} item[0]-${JSON.stringify(myProps[0])}`);
  return myProps;
}
/*
UPDATE gl_subsystem_latest_event
	SET param_value = (case when param_id = 'RAF_PF_B' then -70.31
						 when param_id = 'RARH_SP' then 40.30
						 when param_id = 'DPS_RAF_SS' then 9.89
					end),
	   measured_time  = '2023-10-15 01:05:29'
	WHERE param_id in ('RAF_PF_B', 'RARH_SP', 'DPS_RAF_SS') AND
		  ss_id='bc06b917-1648-4cd1-bf7c-7fe3f2940422';
*/

function prepareDataLoadingStatements(
  rmmResponse = {},
  tblColumns = "ss_id, measured_time, param_id, param_value",
  latestEventTable = "gl_subsystem_latest_event",
) {
  // let insertStatement = (tbl, myColumns, myValues) => `INSERT INTO ${tbl} (${myColumns}) VALUES\n${myValues}`;
  // let updateStatement = (t, uc, mt, p, id) => `UPDATE ${t} SET param_value = (CASE \n${uc} \nEND), measured_time  = '${mt}' WHERE \nparam_id IN (${p}) AND \nss_id='${id}'`;
  let insertStatement = (tbl, myColumns, myValues) =>
    `INSERT INTO ${tbl} (${myColumns}) VALUES ${myValues}`;
  let updateStatement = (t, uc, mt, p, id) =>
    `UPDATE ${t} SET param_value = (CASE ${uc} END), measured_time  = '${mt}' WHERE param_id IN (${p}) AND ss_id='${id}'`;
  let pTblStatement = "",
    leStatement = "",
    dbInsertStatements = [],
    dbUpdateStatements = [],
    bValid = true;
  let myParam,
    myTableName = "",
    myDeviceId = "",
    i,
    myValues = "",
    updateCase = "",
    paramsIn = "";
  let myMeasuredTime = getMeasuredTime();
  let myParamValues = preProcessResults(rmmResponse);
  let myCurrentData = [];
  myappend(
    `prepareDataLoadingStatements - Received ${myParamValues.length} parameters...`,
  );
  for (i = 0; i < myParamValues.length; i++) {
    if (
      "objectName" in myParamValues[i] &&
      myParamValues[i]["objectName"].startsWith("GL")
    ) {
      eqpCodeObj = processEquipmentCode(myParamValues[i]["objectName"]);
      if (eqpCodeObj["inputValid"] === true) {
        myParam = eqpCodeObj["p_name"];
        if (myDeviceId !== "" && myDeviceId !== eqpCodeObj["e_id"]) {
          updateCase = updateCase.slice(0, updateCase.length - 1);
          paramsIn = paramsIn.slice(0, paramsIn.length - 2);
          leStatement = updateStatement(
            latestEventTable,
            updateCase,
            myMeasuredTime,
            paramsIn,
            myDeviceId,
          );
          dbUpdateStatements.push(leStatement);
          // mylog(leStatement);
          updateCase = "";
          paramsIn = "";
        } else {
          myappend(
            `prepareDataLoadingStatements - ${JSON.stringify(eqpCodeObj)}`,
          );
        }
        myDeviceId = eqpCodeObj["e_id"];
        // updateCase = updateCase.concat(`WHEN param_id = '${myParam}' THEN ${myParamValues[i]["presentValue"].toFixed(2)} \n`);
        let upValue =
          typeof myParamValues[i]["presentValue"] == "string"
            ? myParamValues[i]["presentValue"] == "active"
              ? 1
              : 0
            : parseInt(myParamValues[i]["presentValue"].toFixed(2));
        updateCase = updateCase.concat(
          `WHEN param_id = '${myParam}' THEN ${upValue} `,
        );
        paramsIn = paramsIn.concat(`'${myParam}', `);

        if (myTableName !== "" && myTableName !== eqpCodeObj["eqp_tableName"]) {
          myValues = myValues.slice(0, myValues.length - 2);
          pTblStatement = insertStatement(myTableName, tblColumns, myValues);
          dbInsertStatements.push(pTblStatement);
          // mylog(pTblStatement);
          myValues = "";
        }
        myTableName = eqpCodeObj["eqp_tableName"];
        // myValues = myValues.concat(`('${myDeviceId}','${myMeasuredTime}','${myParam}',${myParamValues[i]["presentValue"].toFixed(2)}),\n`);
        let value =
          typeof myParamValues[i]["presentValue"] == "string"
            ? myParamValues[i]["presentValue"] == "active"
              ? 1
              : 0
            : parseInt(myParamValues[i]["presentValue"].toFixed(2));
        myValues = myValues.concat(
          `('${myDeviceId}','${myMeasuredTime}','${myParam}',${value}), `,
        );
        myCurrentData.push([myDeviceId, myMeasuredTime, myParam, value]);
        let param_value = value;
        let device_type = eqpCodeObj["e_ss_type"];
        // console.log("equpcode",eqpCodeObj['e_ss_type'])
        myDynamicResponseHandler(
          myDeviceId,
          myMeasuredTime,
          myParam,
          param_value,
          device_type,
        );
      } else {
        bValid = false;
        myParamValues[i]["inputValid"] = false;
        myParamValues[i]["errorCode"] = [eqpCodeObj["errorCode"]];
        myappend(eqpCodeObj["errorCode"]);
      }
    }
  }
  if (updateCase !== "" && paramsIn !== "") {
    updateCase = updateCase.slice(0, updateCase.length - 1);
    paramsIn = paramsIn.slice(0, paramsIn.length - 2);
    leStatement = updateStatement(
      latestEventTable,
      updateCase,
      myMeasuredTime,
      paramsIn,
      myDeviceId,
    );
    dbUpdateStatements.push(leStatement);
    // mylog(leStatement);
  }
  if (myValues !== "") {
    myValues = myValues.slice(0, myValues.length - 2);
    pTblStatement = insertStatement(myTableName, tblColumns, myValues);
    dbInsertStatements.push(pTblStatement);
    // mylog(pTblStatement);
  }
  // mylog('prepareDataLoadingStatements');
  myappend(dbInsertStatements);
  myappend(dbUpdateStatements);
  // mylog(myCurrentData);
  // myDynamicResponseHandler(myCurrentData)
  return {
    inputValid: bValid,
    dbInsertStatements: dbInsertStatements,
    dbUpdateStatements: dbUpdateStatements,
    currentValues: myCurrentData,
  };
}
function processEquipmentCode(
  eqpCode = "GL 05 00 13 B5 C 003",
  createEquipment = false,
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

  if (eqpCode.startsWith("GL")) {
    myCodeStr = eqpCode.substring(2).replace(/ /g, "");
    eqpParamCode = Number.parseInt("0x".concat(myCodeStr), 16);

    devCode = (0xff0000 & eqpParamCode) >> 16;
    if (devCode in deviceType) {
      devType = deviceType[devCode];
      eqpCodeObject["e_ss_type"] = devType[0];
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Invalid Equipment Type: " + devCode.toString(16),
      );
      mylog("Invalid Equipment Type: " + devCode.toString(16));
    }

    // parameter Code and table Code
    paramCode = 0xffffff & eqpParamCode;
    if (tblNameLength === 12) {
      tblCode = BigInt.asIntN(
        64,
        BigInt(0xffffffff0000) & BigInt(eqpParamCode),
      ); //(0xFFFFFF0000 & eqpParamCode) >> 16;
      devIdCode = tblCode;
    } else {
      tblCode = Number(BigInt(0xffffff0000) & BigInt(eqpParamCode));
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
          BigInt(0xffff00ffcff0) & BigInt(eqpParamCode),
        ); // Changed to Handle Child Alarms
        devIdCode = BigInt(0xfffffffffff0) & BigInt(eqpParamCode);
      } else {
        tblCode = Number(BigInt(0xff00fffff0) & BigInt(eqpParamCode)); //(0xFFFF00FFF0 & eqpParamCode) >> 4;
        devIdCode = Number(BigInt(0xfffffffff0) & BigInt(eqpParamCode));
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
    if (devIdCode in deviceIds) {
      ssid = deviceIds[devIdCode];
      eqpCodeObject["e_id"] = ssid;
      eqpCodeObject["p_parent_eqp"] = ssid;
    } else if (createEquipment === true) {
      ssid = uuid();
      deviceIds[devIdCode] = ssid;
      eqpCodeObject["e_id"] = ssid;
      eqpCodeObject["p_parent_eqp"] = ssid;
      eqpCodeObject["createEquipment"] = true;
      // Create Equipment
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Undefined Equipment ID: " + devIdCode.toString(16),
      );
      mylog("Undefined Equipment ID: " + devIdCode.toString(16));
    }

    if (paramCode in deviceParams) {
      paramName = deviceParams[paramCode];
      eqpCodeObject["p_name"] = paramName;
      eqpCodeObject["p_description"] = eqpCode;
    } else {
      eqpCodeObject["inputValid"] = false;
      eqpCodeObject["errorCode"].push(
        "Invalid Parameter: " + paramCode.toString(16),
      );
      mylog("Invalid Parameter: " + paramCode.toString(16));
    }
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
    mylog(`processEquipmentCode ${JSON.stringify(eqpCodeObject, " ", "\n")}`);
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

function prepareEquipmentLoadingStatements(
  ddcid,
  objPVs = [],
  createEquipment = true,
  latestEventTable = "gl_subsystem_latest_event",
  ssTable = "gl_subsystem",
  referenceTable = "reference_om_p",
  referenceMetricTable = "reference_metric",
) {
  let p_bacnet_tag,
    p_address_value,
    p_type = null,
    p_address_type = "GL_SS_ADDRESS_BACNET_ID",
    e_tag = null,
    e_description = null,
    e_address_type = "GL_SS_ADDRESS_MAC";
  // let createEquipmentTable = tbl => `CREATE TABLE ${tbl} LIKE ${latestEventTable};\n`;
  // let insertEquipmentSS = (id, name, ss_type, ss_address_value) =>
  // 	`('${id}', '${name}', ${e_tag}, ${e_description}, '${ss_type}', '${e_address_type}', '${ss_address_value}', '${ddcid}'),\n`;
  // let insertEquipmentParam = (name, ss_tag, description, ss_address_value, eqpId) =>
  // 	`('${uuid()}', '${name}', '${ss_tag}', '${description}', ${p_type}, '${p_address_type}', '${ss_address_value}', '${eqpId}'),\n`;
  // let insertToSSTable = (mytbl, myvals) => `INSERT INTO ${mytbl} (id, name, ss_tag, description, ss_type, ss_address_type, ss_address_value, ss_parent) VALUES\n${myvals};`;
  let createEquipmentTable = (tbl) =>
    `CREATE TABLE IF NOT EXISTS ${tbl} LIKE ${referenceTable};`;
  let createEquipmentMetricTable = (tbl) =>
    `CREATE TABLE IF NOT EXISTS ${tbl} LIKE ${referenceMetricTable};`;
  let insertEquipmentSS = (id, name, ss_type, ss_address_value) =>
    `('${id}', '${name}', ${e_tag}, ${e_description}, '${ss_type}', '${e_address_type}', '${ss_address_value}', '${ddcid}'),`;
  let insertEquipmentParam = (
    name,
    ss_tag,
    description,
    ss_address_value,
    eqpId,
  ) =>
    `('${uuid()}', '${name}', '${ss_tag}', '${description}', ${p_type}, '${p_address_type}', '${ss_address_value}', '${eqpId}'),`;
  let insertToSSTable = (mytbl, myvals) =>
    `INSERT INTO ${mytbl} (id, name, ss_tag, description, ss_type, ss_address_type, ss_address_value, ss_parent) VALUES ${myvals}`;
  let sqlStatements = [
    `INSERT INTO gl_subsystem (id, name, ss_tag, description, ss_type, ss_address_type, ss_address_value, ss_parent) VALUES ('a26a0401-6855-4595-b97b-49eee6a75917', '2', NULL, NULL, 'NONGL_SS_VAV',  'GL_SS_ADDRESS_MAC', '0002B5', 'f82ffed7-e02d-11ed-80f0-9829a659c338')`,
    `CREATE TABLE mytest LIKE gl_subsystem_latest_event;`,
    `INSERT INTO gl_subsystem (id, name, ss_tag, description, ss_type, ss_address_type, ss_address_value, ss_parent) VALUES                             
		('002df0ef-0433-4a55-8040-a4ed3aa8c9c4', 'RAF_Volt_B', '2', '000004A0003b', NULL, 'GL_SS_ADDRESS_BACNET_ID', 13270, '258c9046-7f98-4655-97f8-3eead407a38e')`,
  ];
  let eqpCodeObj,
    createEqpTable = "",
    createEqpMetricTable = "",
    insertEqp = "",
    insertParam = "",
    ssInsertStatement = "",
    bValid = true,
    i = 0;
  let myNewTables = [],
    myNewMetricTables = [],
    myNewEqps = [];

  mylog(
    `prepareEquipmentLoadingStatements - Received ${objPVs.length} Objects`,
  );
  for (i = 0; i < objPVs.length; i++) {
    // Get Object Name; Validate and get tableName and paramName
    if ("objectName" in objPVs[i] && objPVs[i]["objectName"].startsWith("GL")) {
      if ("objectId" in objPVs[i] && objPVs[i]["objectId"].length == 2) {
        p_bacnet_tag = bacnetObjectType[objPVs[i]["objectId"][0]];
        p_address_value = objPVs[i]["objectId"][1];
        eqpCodeObj = processEquipmentCode(
          objPVs[i]["objectName"],
          createEquipment,
        );
        myappend(
          `Received Object with code: ${
            objPVs[i]["objectName"]
          } ${JSON.stringify(eqpCodeObj)} ==> ${createEquipment}`,
        );
        if (eqpCodeObj["inputValid"] === true) {
          if (eqpCodeObj["createEquipment"]) {
            if (myNewTables.includes(eqpCodeObj["eqp_tableName"]) === false) {
              createEqpTable = createEqpTable.concat(
                createEquipmentTable(eqpCodeObj["eqp_tableName"]),
              );
              myNewTables.push(eqpCodeObj["eqp_tableName"]);
            }
            if (
              myNewMetricTables.includes(eqpCodeObj["eqp_metricTableName"]) ===
              false
            ) {
              // console.log("metric_table names",eqpCodeObj['eqp_metricTableName'])
              createEqpMetricTable = createEqpMetricTable.concat(
                createEquipmentMetricTable(eqpCodeObj["eqp_metricTableName"]),
              );
              myNewMetricTables.push(eqpCodeObj["eqp_metricTableName"]);
            }
            insertEqp = insertEqp.concat(
              insertEquipmentSS(
                eqpCodeObj["e_id"],
                eqpCodeObj["e_name"],
                eqpCodeObj["e_ss_type"],
                eqpCodeObj["e_address_value"],
              ),
            );
            myNewEqps.push(`'${eqpCodeObj["e_id"]}'`);
          }
          insertParam = insertParam.concat(
            insertEquipmentParam(
              eqpCodeObj["p_name"],
              p_bacnet_tag,
              eqpCodeObj["p_description"],
              p_address_value,
              eqpCodeObj["p_parent_eqp"],
            ),
          );
        } else {
          bValid = false;
          objPVs[i]["inputValid"] = false;
          objPVs[i]["errorCode"] = eqpCodeObj["errorCode"];
          myappend("Invalid Object with code: " + eqpCodeObj["errorCode"]);
        }
      } else {
        bValid = false;
        myappend(
          `prepareEquipmentLoadingStatements 'Invalid BACnet ID for: ' - ${JSON.stringify(
            objPVs[i],
          )} \n`,
        );
        objPVs[i]["inputValid"] = false;
        objPVs[i]["errorCode"] = [
          "Invalid BACnet ID for: " + objPVs[i]["objectName"],
        ];
        myappend("Invalid BACnet ID for: " + objPVs[i]["objectName"]);
      }
    }
  }
  // Prepare equipment table create statement
  myappend(
    `prepareEquipmentLoadingStatements - createEqpTable: \n${createEqpTable}\n`,
  );
  myappend(`create metric tables: \n${createEqpMetricTable}\n`);
  myappend(`DROP TABLE ${myNewTables.join()};\n`);
  myappend(`DROP TABLE ${myNewMetricTables.join()};\n`);
  myappend(
    `DELETE FROM ${ssTable} WHERE ss_parent in (${myNewEqps.join()});\n`,
  );
  myappend(`DELETE FROM ${ssTable} WHERE id in (${myNewEqps.join()});\n`);
  myappend(
    `SELECT * FROM ${ssTable} WHERE ss_parent in (${myNewEqps.join()}) LIMIT 8;\n`,
  );
  myappend(
    `SELECT *  FROM ${ssTable} WHERE id in (${myNewEqps.join()}) LIMIT 8;\n`,
  );
  // Prepare equipment subsystem insert statement
  // mylog(`insertEqp: \n${insertEqp}`);
  // Prepare param subsystem insert statement
  // mylog(`insertParam: \n${insertParam}`);
  // Prepare/ Update list of equipment tables to be created
  // Prepare/ Update list of equipment params to be created
  ssInsertStatement = insertEqp.concat(insertParam);
  ssInsertStatement = ssInsertStatement.substring(
    0,
    ssInsertStatement.length - 1,
  );
  ssInsertStatement = insertToSSTable(ssTable, ssInsertStatement);
  createEqpMetricTable = createEqpMetricTable.substring(
    0,
    createEqpMetricTable.length - 1,
  );
  myappend(
    `prepareEquipmentLoadingStatements - ssInsertStatement: \n${ssInsertStatement}`,
  );
  return {
    inputValid: bValid,
    ssInsertStatement: ssInsertStatement,
    createTableStatement: createEqpTable,
    createMetricTableStatement: createEqpMetricTable,
  };
}

/*function getInsertStatement(myObjName = 'GL 00 00 02 B1 0 000') {
	eqpCodeObj['eqp_tableName']
	let myColumns = 'ss_id, measured_time, param_id, param_value';
	let my;
}*/

function postProcessStatements(statements = []) {
  let strStatements = statements.join(";");
  // strStatements.replaceAll(/\n/g, ' ');
  // strStatements.replaceAll(/\s+/g, ' ');
  // strStatements.replaceAll(/"/g, "'");
  // strStatements.replaceAll(/;;/g, ";");
  // mylog('postProcessStatements - ' + strStatements);
  return strStatements;
}
let processReadMultipleResponse = (reqObj, res, next) => {
  let stmts = prepareDataLoadingStatements(reqObj);
  // mylog(`'Statements: ' ${stmts["inputValid"]}`);

  if (stmts["inputValid"]) {
    let allStatements = postProcessStatements([
      stmts["dbInsertStatements"],
      stmts["dbUpdateStatements"],
    ]);
    executeSQLstatement(`CALL executeMyQueries("${allStatements}")`, (e, r) => {
      if (e) mylog("processReadMultipleResponse-Error: " + JSON.stringify(e));
      if (r) mylog("processReadMultipleResponse-Success" + JSON.stringify(r));
      if (res !== null) {
        if (e) res.status(400).json({ errors: e });
        if (r) res.status(OK).json({ Success: r });
        // mylog(`'Updated paramvalues => ', ${JSON.stringify(Final_Json)}`);
        // check_the_equipment(Final_Json)
        // notifierToOtherFunctions(Final_Json)
      }
    });
  } else {
    myappend(`processReadMultipleResponse - ${JSON.stringify(stmts)}`);
  }
};

let sampleDiscoverResponse = {
  request: {
    request_uuid: "26a199bf-1a45-4012-b30e-458562dc3c58",
    request_parts: [
      "",
      "discoverobjects_nosegmentation",
      "127.0.0.1:1928",
      "8:1928",
    ],
    query_params: { dagId: ["f82ffed7-e02d-11ed-80f0-9829a659c338"] },
    Request_At: "2023-10-29 13:18:47",
    Arguments: [
      "",
      "discoverobjects_nosegmentation",
      "127.0.0.1:1928",
      "8:1928",
    ],
    current_status: "Work in progress...",
  },
  response: [
    { objectId: ["device", 1928], objectName: "MyLocal1928" },
    { objectId: ["analogValue", 10001], objectName: "GL 01 00 01 B0 0 000" },
    { objectId: ["analogValue", 10002], objectName: "GL 01 00 01 B0 0 001" },
    { objectId: ["analogValue", 10003], objectName: "GL 01 00 01 B0 0 002" },
    { objectId: ["analogValue", 10004], objectName: "GL 01 00 01 B0 0 003" },
    { objectId: ["analogValue", 10005], objectName: "GL 01 00 01 B0 0 004" },
    { objectId: ["analogValue", 10006], objectName: "GL 01 00 01 B0 0 005" },
    { objectId: ["analogValue", 10007], objectName: "GL 01 00 01 B0 0 006" },
    { objectId: ["analogValue", 10008], objectName: "GL 01 00 01 B0 0 007" },
    { objectId: ["analogValue", 10009], objectName: "GL 01 00 01 B0 0 008" },
    { objectId: ["analogValue", 10010], objectName: "GL 01 00 01 B0 0 009" },
    { objectId: ["analogValue", 10011], objectName: "GL 01 00 01 B0 0 00a" },
    { objectId: ["analogValue", 10012], objectName: "GL 01 00 01 B0 0 00b" },
    { objectId: ["analogValue", 10013], objectName: "GL 01 00 01 B0 0 00c" },
    { objectId: ["analogValue", 10014], objectName: "GL 01 00 01 B0 0 00d" },
    { objectId: ["analogValue", 20001], objectName: "GL 01 00 01 B1 0 000" },
    { objectId: ["analogValue", 20002], objectName: "GL 01 00 01 B1 0 001" },
    { objectId: ["analogValue", 20003], objectName: "GL 01 00 01 B1 0 002" },
    { objectId: ["analogValue", 20004], objectName: "GL 01 00 01 B1 0 003" },
    { objectId: ["analogValue", 30001], objectName: "GL 01 00 01 B2 0 000" },
    { objectId: ["analogValue", 30002], objectName: "GL 01 00 01 B2 0 001" },
    { objectId: ["analogValue", 30003], objectName: "GL 01 00 01 B2 0 002" },
    { objectId: ["analogValue", 30004], objectName: "GL 01 00 01 B2 0 003" },
    { objectId: ["analogValue", 101], objectName: "GL 01 00 01 B5 C 000" },
    { objectId: ["analogValue", 102], objectName: "GL 01 00 01 B5 C 001" },
    { objectId: ["analogValue", 103], objectName: "GL 01 00 01 B5 C 002" },
    { objectId: ["analogValue", 104], objectName: "GL 01 00 01 B5 C 003" },
    { objectId: ["analogValue", 105], objectName: "GL 01 00 01 B5 C 004" },
    { objectId: ["analogValue", 106], objectName: "GL 01 00 01 B5 C 005" },
    { objectId: ["analogValue", 107], objectName: "GL 01 00 01 B5 C 006" },
    { objectId: ["analogValue", 108], objectName: "GL 01 00 02 B5 C 000" },
    { objectId: ["analogValue", 109], objectName: "GL 01 00 02 B5 C 001" },
    { objectId: ["analogValue", 110], objectName: "GL 01 00 02 B5 C 002" },
    { objectId: ["analogValue", 111], objectName: "GL 01 00 02 B5 C 003" },
    { objectId: ["analogValue", 112], objectName: "GL 01 00 02 B5 C 004" },
    { objectId: ["analogValue", 113], objectName: "GL 01 00 02 B5 C 005" },
    { objectId: ["analogValue", 114], objectName: "GL 01 00 02 B5 C 006" },
    { objectId: ["trendLog", 1968], objectName: "Special_Trend_Log" },
  ],
};

let processDiscoverResponse = (reqObj, res, next) => {
  // mylog('processDiscoverResponse - to check');
  // mylog(JSON.stringify(reqObj));
  let stmts = prepareEquipmentLoadingStatements(
    reqObj["request"]["query_params"]["dagId"][0],
    reqObj["response"],
  );
  myappend(`'processDiscoverResponse-Statements: ' ${stmts["inputValid"]}`);
  // res.status(OK).json({"Status":"Success"});

  if (stmts["inputValid"]) {
    // console.log("statements of metric tables",stmts['createMetricTableStatement'])
    let allStatements = postProcessStatements([
      stmts["ssInsertStatement"],
      stmts["createMetricTableStatement"],
      stmts["createTableStatement"],
    ]);
    // res.status(OK).json({ "Status": "Success" });
    myappend(`allStatements \n${allStatements}\n`);
    executeSQLstatement(`CALL executeMyQueries("${allStatements}")`, (e, r) => {
      if (e) {
        mylog("processDiscoverResponse-Error: ");
        myappend("processDiscoverResponse-Error: " + JSON.stringify(e));
      }
      if (r) {
        mylog("processDiscoverResponse-Success" + r);
        myappend("processDiscoverResponse-Success: " + JSON.stringify(r));
      }
      if (res !== null) {
        if (e) res.status(400).json({ errors: e });
        if (r) res.status(OK).json({ Success: r });
      }
    });
  } else {
    myappend(
      `'processDiscoverResponse-InputValid: ' ${
        stmts["inputValid"]
      } ${JSON.stringify(stmts)}`,
    );
  }
};
function getDataFromLatestEvent(callback) {
  // Get Latest values of all devices
  // let eqpQuery = `select * from gl_subsystem_latest_event`;
  let eqpQuery = `select * from gl_subsystem_latest_event le inner join gl_subsystem gl on gl.ss_parent=le.ss_id and gl.name=le.param_id`;
  executeSQLstatement(eqpQuery, (eu, ru) => {
    loaderStarted = true;
    if (eu) {
      mylog(`initialize-Error in Dataloader Initialization => ${eu}`);
      callback(err, null);
    }
    if (ru) {
      // const transformedData = {};
      // ru.forEach(item => {
      // const { ss_id, measured_time, param_id, param_value } = item;
      // if (!transformedData[ss_id]) {
      // 	transformedData[ss_id] = [];
      // }
      // transformedData[ss_id].push({
      // 	[param_id]: {
      // 	measured_time: measured_time,
      // 	param_value: parseFloat(param_value)
      // 	}
      // });
      // });
      // const finalResult = { "Equipment_RunTime_Data": transformedData };
      const transformedData = {};
      ru.forEach((item) => {
        const {
          ss_id,
          measured_time,
          param_id,
          param_value,
          ss_address_value,
          description,
          ss_tag,
        } = item;
        if (!transformedData[ss_id]) {
          transformedData[ss_id] = {};
        }
        transformedData[ss_id][param_id] = {
          objType: ss_tag,
          glCode: description,
          instanceId: ss_address_value,
          measured_time: measured_time,
          param_value: parseFloat(param_value),
        };
      });

      const finalResult = { Equipment_RunTime_Data: transformedData };
      Final_Json.push(finalResult);
      //  console.log(finalResult);
      // mylog(`'initialize-Success => ', ${JSON.stringify(finalResult)}`);
      callback(null, Final_Json);
    }
  });
}

let myDynamicResponseHandler = (
  myDeviceId,
  myMeasuredTime,
  myParam,
  param_value,
  device_type,
) => {
  // cov_response(myDeviceId, myMeasuredTime, myParam, param_value, device_type)
  let found = false;

  const device_id = Final_Json[1].Equipment_RunTime_Data[myDeviceId];
  if (device_id) {
    const paramToUpdate = device_id[myParam];
    found = true;
    if (paramToUpdate) {
      paramToUpdate.measured_time = myMeasuredTime;
      paramToUpdate.param_value = param_value;
      found = true;
    } else {
      Final_Json[1].Equipment_RunTime_Data[myDeviceId][myParam] = {
        measured_time: myMeasuredTime,
        param_value: param_value,
      };
    }
  }

  if (!found) {
    const newItem = {
      [myDeviceId]: {
        [myParam]: {
          measured_time: myMeasuredTime,
          param_value: param_value,
        },
      },
    };
    Final_Json.push({ Equipment_RunTime_Data: newItem });
  }
};

// let cov_response = (myDeviceId, myMeasuredTime, myParam, param_value, device_type)=>{
// 	// let response = {
// 	// 		"device_id": myDeviceId,
// 	// 		"measured_time": myMeasuredTime,
// 	// 		"param_id": myParam,
// 	// 		"param_value": param_value,
// 	// 		"ss_type":device_type
// 	//   };
// 	//   notifierToOtherFunctions(response)
// 	    // notifierToOtherFunctions(response,(err,res)=>{
// 		// 	if(err){
// 		// 		console.log(err)
// 		// 	}else{
// 		// 		console.log("resss",res)
// 		// 	}
// 		// })
// }

let cov_json = [];
// const notifierToOtherFunctions = (data,callback)=>{
// 	cov_json.push(data);
// 	console.log("cov_json",cov_json)
// 	if(data.ss_type === "NONGL_SS_AHU"){
// 		getData.getMyData(data,(err1,res1)=>{
// 			if(err1){
// 				callback(err1)
// 			}else{
// 				console.log("device_id and param_id for ack",res1.id,res1.param_id)
// 			// let	cov_ack = cov_json.filter(obj.device_id !== res1.id || obj.param_id !== res1.param_id)
// 			// 	console.log("cov_json_after_ack",cov_ack)
// 				console.log("/////////////////////////////////////////////////////////////")
// 				// callback(null,res1)
// 			}
// 		})
// 	}
// 	if(data.ss_type === "NONGL_SS_CHILLER"){
// 		getData.getMyData(data,(err1,res1)=>{
// 			if(err1){
// 				callback(err1)
// 			}else{
// 				console.log(res1)
// 				console.log("/////////////////////////////////////////////////////////////")
// 				// callback(null,res1)
// 			}
// 		})
// 		getData.getMyData2(data,(err2,res2)=>{
// 			if(err2){
// 				callback(err2)
// 			}else{
// 				console.log(res2)
// 				console.log("/////////////////////////////////////////////////////////////")
// 				// callback(null,res2)
// 			}
// 		})
// 	}
// }
const selectTableName = (id, callback) => {
  let obj = {};
  let foundDevice = false;

  Final_Json[0].Equipment_Static_Data.some((ele) => {
    const devices = Object.values(ele)
      .flat()
      .filter((devid) => devid.id === id);

    if (devices.length > 0) {
      const devid = devices[0];
      const address_value = devid["glSSId"];
      const ss_type = devid["ss_type"];
      obj["device_type"] = ss_type;
      // console.log(address_value)
      table_name = getDBTableNameFromHex(address_value);
      if (table_name != -1) {
        obj["table_name"] = table_name;
        // console.log("table_name",table_name)
      } else {
        return "invalid table_name";
      }
      foundDevice = true;
      return true; // Exit the loop early since the device was found
    }
    return false; // Continue iterating if device not found in this iteration
  });

  if (foundDevice) {
    console.log("Found device:", obj);
    callback(null, obj);
  } else {
    console.log("Device not found");
    callback(null, "Device not found");
  }
};

function getDBTableName(eqpParamHexCode) {
  eqpParamHexCode = Number.parseInt("0x".concat(eqpParamHexCode), 16);
  return getDBTableNameFromHex(eqpParamHexCode);
}

function getDBTableNameFromHex(eqpParamHexCode) {
  let devTypeNow = (0xff0000 & eqpParamHexCode) >> 16;
  if (deviceType[devTypeNow] == undefined) return -1;
  prefix = deviceType[devTypeNow][1];
  suffix = deviceType[devTypeNow][2];
  if ((0xc000 & eqpParamHexCode) === 0xc000) {
    tblCode = 0xff00fffff0 & eqpParamHexCode; //(0xFFFF00FFF0 & eqpParamCode) >> 4;
    // tblCode = 0xFF00FFCFF0 & eqpParamHexCode;  //change table code extracted from param code-child alarm
  } else {
    tblCode = 0xffffff0000 & eqpParamHexCode; //(0xFFFFFF0000 & eqpParamCode) >> 16;
  }
  //console.log("--->",`${prefix}${tblCode.toString(16).toLowerCase().padStart(10, 0)}${suffix}`.toLowerCase())
  return `${prefix}${tblCode
    .toString(16)
    .toLowerCase()
    .padStart(10, 0)}${suffix}`.toLowerCase();
}

const sendJSONToRunHour = (ss_type, callback) => {
  // console.log("ss_type",ss_type)
  const data = Final_Json[0].Equipment_Static_Data.find((daata) => {
    const key = Object.keys(daata)[0];
    // console.log("Object keys", key, ss_type);
    return key === ss_type;
  });
  // console.log("data",data)
  if (data) {
    // Process data here
    const dataArray = data[ss_type].map((deta) => {
      let obj = {};
      obj["id"] = deta.id;
      obj["name"] = deta.name;
      obj["ss_type"] = deta.ss_type;
      obj["table_name"] = getDBTableNameFromHex(deta.glSSId);
      return obj;
    });

    // console.log("Processed data:", dataArray);
    callback(null, dataArray);
  } else {
    console.log(`No data found for ss_type: ${ss_type}`);
    callback(null, []);
  }
};

module.exports = {
  processReadMultipleResponse,
  processDiscoverResponse,
  // notifierToOtherFunctions,
  selectTableName,
  sendJSONToRunHour,
  processEquipmentCode,
  getDataFromLatestEvent,
};
var discoverSample = [
  { objectName: "GL 01 00 01 B0 0 002" },
  { objectId: ["analogValue", 10004], objectName: "GL 01 00 01 B0 0 003" },
  { objectId: ["analogValue", 10005], objectName: "GL 01 00 01 B0 0 004" },
  { objectId: ["analogValue", 10006], objectName: "GL 01 00 01 B0 0 005" },
  { objectId: ["analogValue", 10007], objectName: "GL 01 00 01 B0 0 006" },
  { objectId: ["analogValue", 10008], objectName: "GL 01 00 01 B0 0 007" },
  { objectId: ["analogValue", 10009], objectName: "GL 01 00 01 B0 0 008" },
  { objectId: ["analogValue", 10010], objectName: "GL 01 00 01 B0 0 009" },
  { objectId: ["analogValue", 10011], objectName: "GL 01 00 01 B0 0 00a" },
  { objectId: ["analogValue", 10012], objectName: "GL 01 00 01 B0 0 00b" },
  { objectId: ["analogValue", 10013], objectName: "GL 01 00 01 B0 0 00c" },
  { objectId: ["analogValue", 10014], objectName: "GL 01 00 01 B0 0 00d" },
  { objectId: ["analogValue", 20001], objectName: "GL 01 00 01 B1 0 000" },
  { objectId: ["analogValue", 20002], objectName: "GL 01 00 01 B1 0 001" },
  { objectId: ["analogValue", 20003], objectName: "GL 01 00 01 B1 0 002" },
  { objectId: ["analogValue", 20004], objectName: "GL 01 00 01 B1 0 003" },
  { objectId: ["analogValue", 30001], objectName: "GL 01 00 01 B2 0 000" },
  { objectId: ["analogValue", 30002], objectName: "GL 01 00 01 B2 0 001" },
  { objectId: ["analogValue", 30003], objectName: "GL 01 00 01 B2 0 002" },
  { objectId: ["analogValue", 30004], objectName: "GL 01 00 01 B2 0 003" },
  { objectId: ["analogValue", 101], objectName: "GL 01 00 01 B5 C 000" },
  { objectId: ["analogValue", 102], objectName: "GL 01 00 01 B5 C 001" },
  { objectId: ["analogValue", 103], objectName: "GL 01 00 01 B5 C 002" },
  { objectId: ["analogValue", 104], objectName: "GL 01 00 01 B5 C 003" },
  { objectId: ["analogValue", 105], objectName: "GL 01 00 01 B5 C 004" },
  { objectId: ["analogValue", 106], objectName: "GL 01 00 01 B5 C 005" },
  { objectId: ["analogValue", 107], objectName: "GL 01 00 01 B5 C 006" },
  { objectId: ["analogValue", 108], objectName: "GL 01 00 02 B5 C 000" },
  { objectId: ["analogValue", 109], objectName: "GL 01 00 02 B5 C 001" },
  { objectId: ["analogValue", 110], objectName: "GL 01 00 02 B5 C 002" },
  { objectId: ["analogValue", 111], objectName: "GL 01 00 02 B5 C 003" },
  { objectId: ["analogValue", 112], objectName: "GL 01 00 02 B5 C 004" },
  { objectId: ["analogValue", 113], objectName: "GL 01 00 02 B5 C 005" },
  { objectId: ["analogValue", 114], objectName: "GL 01 00 02 B5 C 006" },
  { objectId: ["trendLog", 1968], objectName: "Special_Trend_Log" },
];
// mylog(`loaderStarted before = ${loaderStarted}`);
// processDiscoverResponse(objSample, null);
if (loaderStarted == false)
  initialize((e, r) => {
    mylog(`loaderStarted after = ${loaderStarted}`);
    // processReadMultipleResponse(sudrmmSample, null);
  });
// if (loaderStarted == false) getDataFromLatestEvent((e, r) => {
// 	mylog(`loaderStarted after = ${loaderStarted}`);
// });
//if (loaderStarted == true) processReadMultipleResponse(sample, null);
// mylog(getTableSSID(0x010002b5c004));//GL 01 00 02 B5 0 004
// let myqs = prepareEquipmentLoadingStatements('fedc', discoverSample);
// // let myaqs = `${myqs['createTableStatement']}${myqs['ssInsertStatement']}`;
// let myaqs = `${myqs['createTableStatement']}`;
// mylog('All Queries: ' + myaqs);
// let myresult = '';
// executeSQLstatement(`CALL executeMyQueries("${myaqs}")`, (e, r) => {
// 	// executeSQLstatement(`CALL executeMyQueries("${myqs['ssInsertStatement']}")`, (e, r) => {
// 	// executeSQLstatement('SELECT uuid()', (e, r) => {
// 	// executeSQLstatement(`CALL executeMyQueries ('SELECT uuid()')`, (e, r) => {
// 	mylog(`myresult: ${myresult}`);
// 	if (e) mylog('Error' + e);
// 	if (r) mylog(JSON.stringify(r));//JSON.stringify(r,' ','\n')
// });
// processEquipmentCode();
// processEquipmentCode('GL 00 00 0a A0 0 01a', true);
// prepareEquipmentLoadingStatements(sample['response']['propertyResults']);

/*
-- @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
-- executeMyQueries
DROP PROCEDURE IF EXISTS executeMyQueries;
delimiter //
CREATE PROCEDURE executeMyQueries(IN myQueries LONGTEXT)
	BEGIN
		DECLARE allQueries LONGTEXT DEFAULT '';
		DECLARE queryNow LONGTEXT DEFAULT '';

		SET allQueries = TRIM(myQueries);
		queryLoop: LOOP
			SET queryNow = TRIM(SUBSTRING_INDEX(allQueries, ';', 1));
			SET allQueries = TRIM(SUBSTRING(allQueries,LENGTH(queryNow)+2));
		  IF ((queryNow = '') AND (allQueries != '')) THEN
				SET queryNow = TRIM(allQueries);
				SET allQueries = '';
		  END IF;
		  IF (queryNow != '') THEN
				SET @tquery = queryNow;
				PREPARE stmt FROM @tquery;
				EXECUTE stmt;
				DEALLOCATE PREPARE stmt;
			ITERATE queryLoop;
		  END IF;
		  LEAVE queryLoop;
		END LOOP queryLoop;
	END //
delimiter ;
-- -------------------------------------------------------------
*/
// processEquipmentCode()
