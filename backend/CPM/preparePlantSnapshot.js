const { pool } = require("../Database/pool");
const fns = require("date-fns");
const prelog = (msg) =>
  console.log(
    "prepareSnapShot.js",
    fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
    msg
  );
const cpmUtils = require("./CPM_Utilities");
const fs = require("fs");
const filePath = "./sample.json";
// const dataHandler=require('./CPM_Data_Handler')

// prelog('sudharshan')

const executeSQLstatement = (mystmt, callback) => {
  prelog("Request to executeSQLstatement: " + mystmt);
  pool.getConnection((error, connection) => {
    prelog("Connection Received from Pool");
    if (connection) {
      connection.query(mystmt, (error, result) => {
        prelog("Query Executed");
        connection.release();
        prelog("Connection Released to Pool");
        if (error) {
          prelog(`executeSQLstatement - Query Execution Error: ${mystmt}`);
          callback(error);
        } else {
          callback(null, result);
        }
      });
    } else {
      callback("DB CONNECTION ERROR");
    }
    if (error) mylog(`executeSQLstatement - Connection Error: ${mystmt}`);
  });
};

function formatEqp(id, data) {
  // console.log(`------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------`)
  // console.log(`================${JSON.stringify(data[id])}=========================`)
  let myArr = data[id];
  let eqpAtr = {};
  myArr.forEach((element) => {
    // console.log(element)
    eqpAtr[element.name] = element;
  });
  // console.log("wanted output",JSON.stringify(eqpAtr))
}
async function createChild(id, res) {
  //process data
  //find which is device and dev_type
  // console.log(`this device ${id}  have child ${res.length} `)
  //get device id
  let address = "0x" + id;
  const parentHexString = address.toString(16).padStart(10, "0");
  const parentNibbles = parentHexString.slice(4, 8);
  // cpmUtils.sudhu(` IAM PARENT NIBBLES ${parentNibbles}`)
  // let myDevId=0xffff0000 & address;
  // let outputHex = myDevId.toString(16);
  // console.log('myDevId',myDevId,outputHex);
  // outputHex = outputHex.padStart(8, '0');
  // console.log(" find child devices id",outputHex.toString(16))
  // children=res.filter(res=res.glSSId.indexOf('c')!==-1?glSSId:null);
  children = res.filter((da) =>
    da.glSSId.indexOf("c") !== -1 ? da["glSSId"] : null
  );
  // console.log('childeren',children);
  // cpmUtils.sudhu(`childrenRAW ${JSON.stringify(JSON.parse(JSON.stringify(children)))}`)
  // childrenId=children.map(data=>data.glSSId)
  // console.log(`id ${childrenId}`)
  let myChildDev = [];
  // cpmUtils.sudhu(`parent ${parentNibbles} ${typeof(parentNibbles)}`)
  children.forEach((child) => {
    // Convert the child address to a string and extract the first 2 nibbles
    const childNibbles =
      child["glSSId"]
        .toString(16)
        .padStart(10, "0")
        .slice(0, 2) + "b7";
    // const childNibbles = child['glSSId'].toString(16)+("b7").padStart(10, '0').slice(0, 2);
    // Check if the nibbles match with the parent's 3rd and 4th nibbles
    // console.log(`=======child nib===>${childNibbles} ${typeof(childNibbles)} ${childNibbles===parentNibbles}`)
    if (childNibbles === parentNibbles) {
      myChildDev.push(child);
    }
  });
  //   cpmUtils.sudhu(`myChildDev ${myChildDev}`)
  // childrenId=children.map(mda=>{
  // 	// const childIndex = address.indexOf('c');
  // 	// parentId = mda.substring(childIndex+1, childIndex + 3).padEnd(8,"0");
  // 	const childIndex = mda.glSSId.indexOf('c');
  // 	// console.log("i am child index",childIndex)
  // 	parentId = mda.glSSId.substring(childIndex+1, childIndex + 3)+("b7").padEnd(6,"0");
  // 	console.log(`parent_id ${parentId},mydevid ${outputHex.toString(16)}mda.glSSId ${mda.glSSId}`)
  // 	if(parentId==outputHex.toString(16)){
  // 		// console.log("MATCHED")
  // 		return mda.glSSId
  // 	}
  // })
  // console.log("---wrong---->",JSON.stringify(childrenId))

  // res.forEach(function(obj) {
  // 	// Check if glSSId of the object matches any string in a2
  // 	console.log(`my obj ${JSON.stringify(obj.glSSId)}`)
  // 	if (childrenId.includes(parentNibbles)) {
  // 		console.log(`obj.glSSId ${obj.glSSId}`)
  // 		console.log(`loop ${myChildDev}`)
  // 		myChildDev.push(obj);
  // 	}
  // });
  // console.log("===============>final",JSON.stringify(myChildDev))
  const processData = await myChildDev.reduce(async (accPromise, item) => {
    const acc = await accPromise;
    const ssType = item.ss_type;
    if (ssType !== null) {
      // console.log(`i am sstype ${ssType}`)
      const mDATA = await getMetricData(item.glSSId, item.name, ssType);
      // cpmUtils.sudhu(`mdata ${JSON.stringify(mDATA)}`)
      if (!acc[ssType]) {
        acc[ssType] = {};
      }
      // const metricData = await getMetricData(item.glSSId, item.name, ssType);
      // cpmUtils.sudhu(`my CTF metric${metricData}`)
      acc[ssType][item.glSSId] = {
        ddcid: item.ddcid,
        BACnetDeviceAddress: item.BACnetDeviceAddress,
        id: item.id,
        name: item.name,
        glSSId: item.glSSId,
        Eqp_Attributes: createEqpAtri(item.id, res),
        // Eqp_Attributes:{},
        // Eqp_Metrics:{"rh_cumulative":Math.floor((Math.random() * 100) +1),
        // "Equipment_Faulty":false},
        Eqp_Metrics: mDATA,
        //EQP_COMPONENTS:createChild(item.glSSId,res)
        EQP_COMPONENTS: {},
        // prelog(acc[ssType][item.glSSId][item.ddcid])
      };
    }
    // myObj={}
    // myObj[item.glSSId]={}

    return acc;
  }, {});
  //   console.log(`PROCESSS -----DATA ${ JSON.stringify(processData)}`)
  // console.log(`===========PROCESS DATA=============`)
  return processData;
}
function createEqpAtri(id, ru) {
  // console.log(`===========atribute=========${id}============================`);
  // {"ss_tag":"5","glSSId":"1001","ss_type":null,"ddcid":"04611a29-cb2e-44718f527687679","name":"CD_In_Vlv_On_Off_SS"}-84f2-ff1c6a2b3cf0","BACnetDeviceAddress":"0000b00000","id":"f6e591a5-5c1a-47d8-8c4c-c8f52768767e","name":"CH_SS"}
  const groupedData = ru
    .filter((fitem) => fitem.ddcid == id)
    .reduce((acc, item) => {
      const ssType = item.name;
      if (!acc[ssType]) {
        acc[ssType] = {};
      }
      acc[ssType] = {
        // ddcid: item.ddcid
        objId: `${item.ss_tag}:${item.glSSId}`,
        objName: item.description,
        presentValue: parseInt(item.presentValue),
        measured_time: item.measured_time,
        // id: item.id,
        // name: item.name,
      };
      return acc;
    }, {});
  //   console.log(`group ${JSON.stringify(groupedData)}`)
  //   let eqpattribute=formatEqp(id,groupedData)
  return groupedData;
}

const prepareTableName = (glCode, devType, tableType) => {
  const deviceTypeMetric = {
    NONGL_SS_HEADER: ["hd", "_metric"],
    GL_SS_SERVER: ["server", "_metric"],
    NONGL_SS_EMS: ["em_", "_metric"],
    NONGL_SS_AHU: ["ahu_", "_metric"],
    NONGL_SS_CHILLER: ["ch_", "_metric"],
    NONGL_SS_PUMPS: ["pu_", "_metric"],
    NONGL_SS_SECONDARY_PUMPS: ["secpu_", "_metric"],
    NONGL_SS_CONDENSER_PUMPS: ["condpu_", "_metric"],
    NONGL_SS_COOLING_TOWER: ["ct_", "_metric"],
    NONGL_SS_VAV: ["vav_", "_ahu_metric"],
    NONGL_SS_COOLING_TOWER_FAN: ["ctf_", "_metric"],
  };
  const deviceTypeOmp = {
    GL_SS_SERVER: ["server", "_om_p"],
    NONGL_SS_EMS: ["em_", "_om_p"],
    NONGL_SS_AHU: ["ahu_", "_om_p"],
    NONGL_SS_CHILLER: ["ch_", "_om_p"],
    NONGL_SS_PUMPS: ["pu_", "_om_p"],
    NONGL_SS_SECONDARY_PUMPS: ["secpu_", "_om_p"],
    NONGL_SS_CONDENSER_PUMPS: ["condpu_", "_om_p"],
    NONGL_SS_COOLING_TOWER: ["ct_", "_om_p"],
    NONGL_SS_VAV: ["vav_", "_ahu_om_p"],
    NONGL_SS_COOLING_TOWER_FAN: ["ctf_", "_om_p"],
    // 0xB5: ['NONGL_SS_VAV', 'vav', '_om_p', 'ahu_']
  };
  const tableName =
    tableType === "metric"
      ? deviceTypeMetric[devType][0] + glCode + deviceTypeMetric[devType][1]
      : "";
  console.log(`==========${tableName}===============`);
  return tableName;
};
//incomplete
// function getMetricData(glCode,name,type){
// 	if(type!="GL_SS_ADDRESS_BACNET_DDC"){
// 		// console.log(glCode,name,type)
// 	}
// }
//processing metric
function getMetricData(glSSId, name, ssType) {
  // console.log(`===${glSSId}====${ssType}================METRIC=================`)
  return new Promise((resolve, reject) => {
    let table = prepareTableName(glSSId, ssType, "metric");
    console.log(`aftrer retun my name ${table}`);
    let metricQuery = `SELECT om.* FROM ${table} om inner join (select max(measured_time) as mes,metric_id from ${table} group by metric_id) as lm on (lm.mes=om.measured_time and lm.metric_id=om.metric_id)`;
    executeSQLstatement(metricQuery, (err, res) => {
      if (err) {
        if (err) {
          if (err.code === "ER_NO_SUCH_TABLE") {
            console.log("Table does not exist:", err.message);
            const errData = {
              // Example metric data
              information: `cannot found such table ${table}`,
              // "rh_cumulative":Math.floor((Math.random() * 100) +1),
              Equipment_Faulty: false,
              // Add more metrics as needed
            };
            resolve(errData);
            // Handle the case where the table does not exist
          } else {
            console.log("Database err:", err);
            // Handle other database errs
          }
        }
      } else {
        // console.log(`---------------metric res${JSON.stringify(res)}`)
        const metricData = {
          information: `data found successfully`,
          Equipment_Faulty: false,
        };
        for (const obj of res) {
          const { metric_id, metric_value } = obj;
          metricData[metric_id] = parseInt(metric_value);
          // console.log(`Metric ID: ${metric_id}, Metric Value: ${metric_value}`);
        }
        // Resolve the Promise with the metric data
        resolve(metricData);
      }
    });
  });
}
// LEFT(ss_address_value , LENGTH(ss_address_value ) - 3)
// const init=(master,mycallback)=>{
// 	// prelog("======================================================================")
// 	// let master={}
//     // const query=`SELECT  ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_EMS' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_SECONDARY_PUMPS')) ddc WHERE eqp.ss_parent=ddcid OR eqp.id=ddcid group by id ORDER BY ss_type, CONVERT(name,decimal);`
// 	// const query=`SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress,ss_type FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_EMS' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_SECONDARY_PUMPS') group by ddcid;`
// 	// const query=`SELECT  ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER') AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE eqp.ss_parent=ddcid OR eqp.id=ddcid group by id ORDER BY ss_type, CONVERT(name,decimal);`
// 	// const query=`SELECT ss_tag, ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER') AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE (eqp.ss_parent=ddcid OR eqp.id=ddcid) and ss_status='GL_SS_STATUS_ACTIVE' group by id ORDER BY ss_type, CONVERT(name,decimal);`
// 	const query=`SELECT eqp.ss_tag, eqp.ss_address_value AS glSSId, eqp.ss_type, ddc.ddcid, BACnetDeviceAddress, eqp.id, eqp.name, le.measured_time,le.param_value as presentValue FROM gl_subsystem eqp JOIN ( SELECT id AS ddcid, ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' OR ss_type='NONGL_SS_CHILLER'  OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_COOLING_TOWER') AND ss_status='GL_SS_STATUS_ACTIVE' ) ddc ON (eqp.ss_parent=ddcid OR eqp.id=ddcid) LEFT JOIN gl_subsystem_latest_event le ON ddcid = le.ss_id  AND eqp.name = le.param_id WHERE eqp.ss_status='GL_SS_STATUS_ACTIVE' GROUP BY eqp.id ORDER BY eqp.ss_type, CONVERT(eqp.name,decimal);`

//     executeSQLstatement(query ,(err,ru)=>{
//         if(err){
//             prelog(err)
// 			mycallback(err);
//         }else{
// 			// console.log("-----------------------------i am ru------------------------",JSON.stringify(ru))
// 			try{
// 				const groupedData = ru.reduce((acc, item) => {
// 					const ssType = item.ss_type;
// 					if (ssType !== null && ssType !== 'NONGL_SS_COOLING_TOWER_FAN') {
// 						// console.log(`i am sstype ${ssType}`)
// 					if (!acc[ssType]) {
// 					  acc[ssType] = {};
// 					}
// 					acc[ssType][item.glSSId]={
// 						ddcid: item.ddcid,
// 						BACnetDeviceAddress: item.BACnetDeviceAddress,
// 						id: item.id,
// 						name: item.name,
// 						Eqp_Attributes:createEqpAtri(item.id,ru),
// 						Eqp_Metrics:getMetricData(item.glSSId,item.name,ssType),
// 						EQP_COMPONENTS:createChild(item.glSSId,ru)
// 						// prelog(acc[ssType][item.glSSId][item.ddcid])
// 					};
// 				}
// 					// myObj={}
// 					// myObj[item.glSSId]={}

// 					return acc;
// 				  }, {});
// 				  master["Plant_Snapshot"]=groupedData
// 				  mycallback(null,master)

// 			}
// 			catch(e){
// 				mycallback(e)
// 			}
// 			finally{
// 				mycallback(null,master)
// 			}
//             //   prelog(`${cpmUtils.myPrint(groupedData)}`)

// 			//   prelog(`---------------${cpmUtils.myPrint(master)}--------`)
// 			  fs.writeFileSync(filePath, JSON.stringify(master), 'utf8');
// 			//   dataHandler.setSiteSpecificDataItems(master)
// 			  console.log('written to IBMS data block successfully');
// 			  mycallback(null,master)
// 		   }
//         })
//     }
const init = (master, mycallback) => {
  // let master={}229
  // const query=`SELECT  ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_EMS' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_SECONDARY_PUMPS')) ddc WHERE eqp.ss_parent=ddcid OR eqp.id=ddcid group by id ORDER BY ss_type, CONVERT(name,decimal);`
  // const query=`SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress,ss_type FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_EMS' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_SECONDARY_PUMPS') group by ddcid;`
  // const query=`SELECT  ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER') AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE eqp.ss_parent=ddcid OR eqp.id=ddcid group by id ORDER BY ss_type, CONVERT(name,decimal);`
  // const query=`SELECT ss_tag, ss_address_value AS glSSId, ss_type, ddcid,BACnetDeviceAddress, id, name FROM gl_subsystem eqp, (SELECT id AS ddcid,ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' or ss_type='NONGL_SS_CHILLER') AND ss_status='GL_SS_STATUS_ACTIVE') ddc WHERE (eqp.ss_parent=ddcid OR eqp.id=ddcid) and ss_status='GL_SS_STATUS_ACTIVE' group by id ORDER BY ss_type, CONVERT(name,decimal);`
  //pprepare condition
  const query = `SELECT eqp.ss_tag, eqp.ss_address_value AS glSSId,eqp.description, eqp.ss_type, eqp.id,ddc.ddcid,BACnetDeviceAddress, eqp.name,le.param_id,le.param_value as presentValue,le.measured_time FROM gl_subsystem eqp inner join (SELECT id AS ddcid, ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' OR ss_type='NONGL_SS_PUMPS' OR ss_type='NONGL_SS_CHILLER' OR ss_type='NONGL_SS_CONDENSER_PUMPS' OR ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_SECONDARY_PUMPS' OR ss_type='NONGL_SS_AHU' OR ss_type='NONGL_SS_VAV') AND ss_status='GL_SS_STATUS_ACTIVE' ) ddc ON (ddc.ddcid=eqp.ss_parent OR (eqp.ss_parent is null and eqp.ss_type!="GL_SS_SERVER")) left join gl_subsystem_latest_event le on (le.ss_id=ddc.ddcid and eqp.name=le.param_id) where eqp.ss_status='GL_SS_STATUS_ACTIVE' group by eqp.id order by BACnetDeviceAddress;`;
  // const query=`SELECT eqp.ss_tag, eqp.ss_address_value AS glSSId,eqp.description, eqp.ss_type, eqp.id,ddc.ddcid,BACnetDeviceAddress, eqp.name,le.param_id,le.param_value as presentValue,le.measured_time FROM gl_subsystem eqp inner join (SELECT id AS ddcid, ss_address_value as BACnetDeviceAddress FROM gl_subsystem WHERE (ss_type='GL_SS_ADDRESS_BACNET_DDC' OR  ss_type='NONGL_SS_COOLING_TOWER' OR ss_type='NONGL_SS_COOLING_TOWER_FAN' OR ss_type='NONGL_SS_SECONDARY_PUMPS') AND ss_status='GL_SS_STATUS_ACTIVE' ) ddc ON (ddc.ddcid=eqp.ss_parent OR (eqp.ss_parent is null and eqp.ss_type!="GL_SS_SERVER")) left join gl_subsystem_latest_event le on (le.ss_id=ddc.ddcid and eqp.name=le.param_id) where eqp.ss_status='GL_SS_STATUS_ACTIVE' group by eqp.id order by BACnetDeviceAddress;`
  executeSQLstatement(query, async (err, ru) => {
    if (err) {
      prelog(err);
    } else {
      // console.log("-----------------------------i am ru------------------------",JSON.stringify(ru))
      const groupedData = await ru.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const ssType = item.ss_type;
        if (ssType !== null && ssType !== "GL_SS_ADDRESS_BACNET_DDC") {
          // console.log(`----------inside IF`)
          // if (ssType == "NONGL_SS_COOLING_TOWER") {
          if (!acc[ssType]) {
            acc[ssType] = {};
          }
          // console.log(`===================start===========`)
          const metricData = await getMetricData(
            item.glSSId,
            item.name,
            ssType
          );
          acc[ssType][item.id] = {
            ddcid: item.ddcid,
            BACnetDeviceAddress: item.BACnetDeviceAddress,
            glSSId: item.glSSId,
            id: item.id,
            name: item.name,
            Eqp_Attributes: createEqpAtri(item.id, ru),
            Eqp_Metrics: metricData,
            EQP_COMPONENTS: await createChild(item.glSSId, ru),
            // prelog(acc[ssType][item.glSSId][item.ddcid])
          };
        }
        // myObj={}
        // myObj[item.glSSId]={}

        return acc;
      }, {});
      //   prelog(`${cpmUtils.myPrint(groupedData)}`)
      master["Plant_Snapshot"] = groupedData;
      master["Plant_Snapshot"]["NONGL_SS_HEADER"] = {
        // 0005b90000  0000b00000
        "0000b90000": {
          BACnetDeviceAddress: "192.168.22.24",
          Eqp_Attributes: {
            CWH_ST: {
              objId: "5:35001",
              objName: "GL 00 00 00 b9 0 00D",
              presentValue: 12,
              measured_time: fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
            },
            CWH_ST_SP: {
              objId: "5:35002",
              objName: "GL 00 00 00 b9 0 00E",
              presentValue: 12,
              measured_time: fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
            },
          },
          Eqp_Metrics: {
            Equipment_Faulty: false,
            Monitor_Parameter: true,
            Check_Parameter: true,
            LOWER_THRESHOLD: 5.0,
            UPPER_THRESHOLD: 9.0,
            THRESHOLD_CROSSING_INTERVAL: 10,
            THRESHOLD_CROSSED_TIMESTAMP: "",
            THRESHOLD_CROSSED_VALUE: 0,
          },
        },
      };
      master["Plant_Snapshot"]["NONGL_SS_DPT"] = {
        // 0005b90000  0000b00000
        "0005ba0000": {
          BACnetDeviceAddress: "192.168.22.24",
          Eqp_Attributes: {
            DPT: {
              objId: "5:35001",
              objName: "GL 24 00 05 ba 0 001",
              presentValue: 489,
              measured_time: fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
            },
            DPT_SP: {
              objId: "5:35001",
              objName: "GL 24 00 05 ba 0 002",
              presentValue: 500,
              measured_time: fns.format(new Date(), "yyyy-MM-dd'T'HH:mm:ssSSS"),
            },
          },
          Eqp_Metrics: {
            Equipment_Faulty: false,
            Monitor_Parameter: true,
            LOWER_THRESHOLD: 10.0,
            UPPER_THRESHOLD: 10.0,
            THRESHOLD_CROSSING_INTERVAL: 5, //sec
            THRESHOLD_CROSSED_TIMESTAMP: "",
            THRESHOLD_CROSSED_VALUE: 0,
          },
        },
      };
      //   prelog(`---------------${cpmUtils.myPrint(master)}--------`)
      //   fs.writeFileSync(filePath, JSON.stringify(master), 'utf8');
      //   dataHandler.setSiteSpecificDataItems(master)
      console.log("written to IBMS data block successfully");
      mycallback(null, master);
    }
  });
};
// const testData=(master,mycallback)=>{
// 	master["Plant_Snapshot"]={"name":"CPM"}
// 	mycallback(null,master)
// }
// setTimeout(() => {
// 	let mydata={}
// 	init(mydata,(err,res)=>{
// 		if(err){
// 			console.log("error in plant preparetion")
// 		}else{
// 			console.log("res----------------->")
// 			// callback(null,res)
// 		}
// 	})
// }, 1000);

// init()
module.exports = {
  init,
  // testData
};
