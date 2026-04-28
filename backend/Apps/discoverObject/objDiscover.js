const { pool } = require('../../Database/pool');
const schedule = require('node-schedule');
const logger = require('../../Config/logger');
const { toFixed } = require('../../Utils/common');
//const bacnet = require('../../myBACnetSWCS');
const bacnetHvac = require('../../hvacBACnetClient');
const models = require('../ReadHvacDeviceData/model');
const uuid = require('uuid/v4');
const controller=require('./controller')
const axiosc = require('axios');
const http = require('http');
const httpAgent = new http.Agent({ rejectUnauthorized: false });
const axios = axiosc.create({ httpAgent });
const keepAliveAgent = new http.Agent({ keepAlive: true });
//const deviceService=require('../../Services/Device/device.service')
const deviceModel=require('../../Services/Device/device.model')

const params={
    "A00000":"RAT",
    "A00001":"RAT_SP",
    "A00002":"RARH",
    "A00003":"RARH_SP",
    "A00004":"SAT",
    "A00005":"SAT_SP",
    "A00006":"SARH",
    "A00007":"SARH_SP",
    "A00008":"OAT",
    "A00009":"OARH",
    "A0000A":"MAT",
    "A0000B":"MARH",
    "A0000C":"CHW_Vlv_Pos",
    "A0000D":"CHW_Vlv_Pos_SP",
    "A0000E":"OA_Dmpr_Pos",
    "A0000F":"OA_Dmpr_Pos_SP",
    "A00010":"RA_Dmpr_Pos",
    "A00011":"RA_Dmpr_Pos_SP",
    "A00012":"EA_Dmpr_Pos",
    "A00013":"EA_Dmpr_Pos_SP",
    "A00014":"SA_Dmpr_Pos",
    "A00015":"SA_Dmpr_Pos_SP",
    "A00016":"SA_CFM",
    "A00017":"DSP",
    "A00018":"DSP_SP",
    "A00019":"SP_Pre_Filter",
    "A0001A":"SP_Post_Filter",
    "A0001B":"DPS_Filter",
    "A0001C":"SAF_VFD_On_Off",
    "A0001D":"SAF_VFD_On_Off_Fbk",
    "A0001E":"SAF_VFD_AM",
    "A0001F":"SAF_VFD_AM_Fbk",
    "A00020":"SAF_VFD_Trip_SS",
    "A00021":"SAF_VFD_Speed",
    "A00022":"SAF_VFD_Speed_Fbk",
    "A00023":"VFD_Byp_SS",
    "A00024":"Fire_Sensor",
    "A00025":"RAQ_Co2",
    "A00026":"RAQ_Co2_SP",
    "A00027":"DPS_SAF_SS",
    "A00028":"SAF_Pwr_A",
    "A00029":"SAF_Pwr_B",
    "A0002A":"SAF_Pwr_C",
    "A0002B":"SAF_Volt_A",
    "A0002C":"SAF_Volt_B",
    "A0002D":"SAF_Volt_C",
    "A0002E":"SAF_Amps_A",
    "A0002F":"SAF_Amps_B",
    "A00030":"SAF_Amps_C",
    "A00031":"SAF_PF_A",
    "A00032":"SAF_PF_B",
    "A00033":"SAF_PF_C",
    "A00036":"DPS_RAF_SS",
    "A00037":"RAF_Pwr_A",
    "A00038":"RAF_Pwr_B",
    "A00039":"RAF_Pwr_C",
    "A0003A":"RAF_Volt_A",
    "A0003B":"RAF_Volt_B",
    "A0003C":"RAF_Volt_C",
    "A0003D":"RAF_Amps_A",
    "A0003E":"RAF_Amps_B",
    "A0003F":"RAF_Amps_C",
    "A00041":"RAF_PF_A",
    "A00042":"RAF_PF_B",
    "A00043":"RAF_PF_C",
    "A00045":"AHU_On_Off",
    "A00046":"Supply Fan VFD Frequency",
    "A00047":"Supply Fan VFD KWH",
    "A0A048":"Alarm1",
    "A0A049":"Alarm2",
    "A0004A":"No_Fire",
    "A0004B":"VAV_ZAT",
    "A0004C":"VAV_ZAT_SP",
    "A0004D":"VAV_ZARH",
    "A0004E":"VAV_CFM-Design",
    "A0004F":"VAV_CFM_SP",
    "A00050":"VAV_CFM_Actual",
    "A00051":"VAV_Dmpr_Pos",
    "A00100":"RAT_TL",
    "A00102":"RARH_TL",
    "A00104":"SAT_TL",
    "A00106":"SARH_TL",
    "A00108":"OAT_TL",
    "A0010A":"MAT_TL",
    "A0010B":"MARH_TL",
    "A0010C":"CHW_Vlv_Pos_TL",
    "A0010E":"OA_Dmpr_Pos_TL",
    "A00110":"RA_Dmpr_Pos_TL",
    "A00112":"EA_Dmpr_Pos_TL",
    "A00114":"SA_Dmpr_Pos_TL",
    "A00116":"SA_CFM_TL",
    "A00117":"DSP_TL",
    "A0011B":"DPS_Filter_TL",
    "A0011C":"SAF_VFD_On_Off_TL",
    "A0011E":"SAF_VFD_AM_TL",
    "A00120":"SAF_VFD_Trip_SS_TL",
    "A00121":"SAF_VFD_Speed_TL",
    "A00123":"VFD_Byp_SS_TL",
    "A00124":"Fire_Sensor_TL",
    "A00125":"RAQ_Co2_TL",
    "A00127":"DPS_SAF_SS_TL",
    "A00136":"DPS_RAF_SS_TL",
    "A0A148":"Alarm1_TL",
    "A0A149":"Alarm2_TL",	
    "000000":"Cur_Avg",
    "000001":"Cur_Ph1",
    "000002":"Cur_Ph2",
    "000003":"Cur_Ph3",
    "000004":"Volt_LL_Avg",
    "000005":"Volt_LL_Ph1",
    "000006":"Volt_LL_Ph2",
    "000007":"Volt_LL_Ph3",
    "000008":"Volt_LN_Avg",
    "000009":"Volt_LN_Ph1",
    "00000A":"Volt_LN_Ph2",
    "00000B":"Volt_LN_Ph3",
    "00000C":"Freq",
    "00000D":"Act_Pwr_Ttl",
    "00000E":"Act_Pwr_Ph1",
    "00000F":"Act_Pwr_Ph2",
    "000010":"Act_Pwr_Ph3",
    "000011":"React_Pwr_Ttl",
    "000012":"React_Pwr_Ph1",
    "000013":"React_Pwr_Ph2",
    "000014":"React_Pwr_Ph3",
    "000015":"Aprnt_Pwr_Ttl",
    "000016":"Aprnt_Pwr_Ph1",
    "000017":"Aprnt_Pwr_Ph2",
    "000018":"Aprnt_Pwr_Ph3",
    "000019":"PF_Ttl",
    "00001A":"PF_Ph1",
    "00001B":"PF_Ph2",
    "00001C":"PF_Ph3",
    "00001D":"Fwd_Aprnt_Enrg",
    "00001E":"Fwd_Act_Enrg",
    "00001F":"Fwd_React_Enrg",
    "000020":"Fwd_Run _Secs",
    "000021":"On _Secs",
    "000022":"No_Inp_Volt_Intr",
    "000023":"Apprnt_Enrg",
    "000024":"Act_Enrg_U",
    "000025":"On_Hr_U",
    "000026":"Run_Hr_U",
    "000027":"Apprnt_Enrg_U",
    "000028":"Act_Enrg_G",
    "000029":"On_Hr_G",
    "00002A":"Run_Hr_G",
    "00002B":"Prsnt_Dmd",
    "00002C":"Rising_Dmd",
    "00002D":"Max_Dmd_U",
    "00002E":"Max_Dmd_Occ_Time_U",
    "00002F":"Avg_Ld_Percntg",
    "000030":"Ph1_Ld%",
    "000031":"Ph2_Ld%",
    "000032":"Ph3_Ld%",
    "000033":"Unbl%_Ld",
    "000034":"Unbl%_Volt",
    "B00000":"CH_On_Off",
    "B00001":"CH_SS",
    "B00002":"CH_Trip_SS",
    "B00003":"CHW_Flow_SS",
    "B00004":"CH_Vlv_On_Off",
    "B00005":"CH_Vlv_SS",
    "B00006":"CWH_ST",
    "B00007":"CWH_ST_SP",
    "B00008":"CWH_RT",
    "B00009":"CWH_RT_SP",
    "B0000A":"CH_AM_SS",
    "B0000B":"CWH_Flow",
    "B0000C":"CndW_Flow_SS",
    "B0000D":"CHW_SP",
    "B0000E":"CHW_LT",
    "B0000F":"CHW_ET",
    "B00010":"CndW_LT",
    "B00011":"CndW_ET",
    "B00012":"Cnd_Ref_T",
    "B00013":"EV_Ref_T",
    "B00014":"Cnd_Ref_Pre",
    "B00015":"EV_Ref_Pre",
    "B00016":"CndW_HST",
    "B00017":"CndW_HRT",
    "B00018":"Cnd_Flow",
    "B00019":"Amb_T",
    "B0001A":"Humidity",
    "B0001B":"CO2",
    "B10001":"Pri_Pmp_On_Off",
    "B10002":"Pri_Pmp_SS",
    "B10003":"Pri_Pmp_Trip_SS",
    "B10004":"Pri_Pmp_AM_SS",
    "B20001":"Sec_Pmp_On_Off",
    "B20002":"Sec_Pmp_SS",
    "B20003":"Sec_Pmp_Trip_SS",
    "B20004":"Sec_Pmp_AM_SS"
    // "A00000":"RAT",
    // "A00001":"RAT_SP",
    // "A00002":"RARH",
    // "A00003":"RARH_SP",
    // "A00004":"SAT",
    // "A00005":"SAT_SP",
    // "A00006":"SARH",
    // "A00007":"SARH_SP",
    // "A00008":"OAT",
    // "A00009":"OARH",
    // "A0000A":"MAT",
    // "A0000B":"MARH",
    // "A0000C":"CHW_Vlv_Pos",
    // "A0000D":"CHW_Vlv_Pos_SP",
    // "A0000E":"CHW_ST",
    // "A0000F":"CHW_RT",
    // "A00010":"CHW_Flow",
    // "A00011":"CHW_Pre",
    // "A00012":"OA_Dmpr_Pos",
    // "A00013":"OA_Dmpr_Pos_SP",
    // "A00014":"RA_Dmpr_Pos",
    // "A00015":"RA_Dmpr_Pos_SP",
    // "A00016":"EA_Dmpr_Pos",
    // "A00017":"EA_Dmpr_Pos_SP",
    // "A00018":"SA_Dmpr_Pos",
    // "A00019":"SA_Dmpr_Pos_SP",
    // "A0001A":"SA_CFM",
    // "A0001B":"DSP",
    // "A0001C":"DSP_SP",
    // "A0001D":"SP_Pre_Filter",
    // "A0001E":"SP_Post_Filter",
    // "A0001F":"DPS_Filter",
    // "A00020":"SAF_VFD_On_Off",
    // "A00021":"SAF_VFD_On_Off_Fbk",
    // "A00022":"SAF_VFD_AM",
    // "A00023":"SAF_VFD_AM_Fbk",
    // "A00024":"SAF_VFD_Trip_SS",
    // "A00025":"SAF_VFD_Speed",
    // "A00026":"SAF_VFD_Speed_Fbk",
    // "A00027":"VFD_SS",
    // "A00028":"Fire_Sensor",
    // "A00029":"RAQ_Co2",
    // "A0002A":"RAQ_Co2_SP",
    // "A0002B":"DPS_SAF_SS",
    // "A0002C":"SAF_Pwr_A",
    // "A0002D":"SAF_Pwr_B",
    // "A0002E":"SAF_Pwr_C",
    // "A0002F":"SAF_Volt_A",
    // "A00030":"SAF_Volt_B",
    // "A00031":"SAF_Volt_C",
    // "A00032":"SAF_Amps_A",
    // "A00033":"SAF_Amps_B",
    // "A00036":"SAF_Amps_C",
    // "A00037":"SAF_PF_A",
    // "A00038":"SAF_PF_B",
    // "A00039":"SAF_PF_C",
    // "A0003A":"RAF_SS",
    // "A0003B":"RAF_Pwr_A",
    // "A0003C":"RAF_Pwr_B",
    // "A0003D":"RAF_Pwr_C",
    // "A0003E":"RAF_Volt_A",
    // "A0003F":"RAF_Volt_B",
    // "A00041":"RAF_Volt_C",
    // "A00042":"RAF_Amps_A",
    // "A00043":"RAF_Amps_B",
    // "A00045":"RAF_Amps_C",
    // "A00046":"RAF_PF_A",
    // "A00047":"RAF_PF_B",
    // "A00048":"RAF_PF_C",
    // "A00049":"AHU_On_Off"
}
// const params={
// "000":	"Return Air Temperature",
// "001":	"Return Air Temperature - Setpoint",
// "002":	"Return Air Relative Humidity",
// "003":	"Return Air Relative Humidity - Setpoint",
// "004":	"Supply Air Temperature",
// "005":	"Supply Air Temperature - Setpoint",
// "006":	"Supply Air Relative Humidity",
// "007":	"Supply Air Relative Humidity - Setpoint",
// "008":	"Outside Air Temperature",
// "009":	"Outside Air Relative Humidity",
// "00A":	"Mixed Air Temperature",
// "00B":	"Mixed Air Relative Humidity",
// "00C":	"Chilled Water Valve - Position",
// "00D":	"Chilled Water Valve - Position - Setpoint",
// "00E":	"Chilled Water - Supply Temperature",
// "00F":	"Chilled Water - Return Temperature",
// "010":	"Chilled Water - Flow Meter - Flow",
// "011":	"Chilled Water - Coil Supply Pressure",
// "012":	"Outside Air Damper - Position",
// "013":	"Outside Air Damper - Position - Command / Setpoint",
// "014":	"Return Air Damper - Position",
// "015":	"Return Air Damper - Position - Command / Setpoint",
// "016":	"Exhaust Air Damper - Position",
// "017":	"Exhaust Air Damper - Position - Command / Setpoint",
// "018":	"Supply Air Damper - Position",
// "019":	"Supply Air Damper - Position - Command / Setpoint",
// "01A":	"Supply Air Flow",
// "01B":	"Duct Static Pressure",
// "01C":	"Duct Static Pressure - Setpoint",
// "01D":	"Static Pressure - Pre-Filter",
// "01E":	"Static Pressure - Post-Filter",
// "01F":	"DPS across Filter",
// "020":	"Supply Air Fan VFD - On / Off - Command",
// "021":	"Supply Air Fan VFD - On / Off - Feedback",
// "022":	"Supply Air Fan VFD- Auto / Manual - Command",
// "023":	"Supply Air Fan VFD- Auto / Manual - Feedback/Status",
// "024":	"Supply Air Fan VFD- Trip Status",
// "025":	"Supply Air Fan VFD - Speed - Command",
// "026":	"Supply Air Fan VFD- Speed - Feedback",
// "027":	'VFD status - (Fan motor through VFD ? Direct "bypass" ?)',
// "028":	"Fire sensor",
// "029":	"Return Air Quality - CO2",
// "02A":	"Return Air Quality - CO2 - Setpoint / Min_Threshold",
// "02B":	"DPS across Supply Air Fan - Status (DPS across SAF)",
// "02C":	"Supply Air Fan - Power - Phase A",
// "02D":	"Supply Air Fan - Power - Phase B",
// "02E":	"Supply Air Fan - Power - Phase C",
// "02F":	"Supply Air Fan - Voltage - Phase A",
// "030":	"Supply Air Fan - Voltage - Phase B",
// "031":	"Supply Air Fan - Voltage - Phase C",
// "032":	"Supply Air Fan - Current - Phase A",
// "033":	"Supply Air Fan - Current - Phase B",
// "036":	"Supply Air Fan - Current - Phase C",
// "037":	"Supply Air Fan - Power Factor - Phase A",
// "038":	"Supply Air Fan - Power Factor - Phase B",
// "039":	"Supply Air Fan - Power Factor - Phase C",
// "03A":	"Return Air Fan - Status (DP Switch across RAF)",
// "03B":	"Return Air Fan - Power - Phase A",
// "03C":	"Return Air Fan - Power - Phase B",
// "03D":	"Return Air Fan - Power - Phase C",
// "03E":	"Return Air Fan - Voltage - Phase A",
// "03F":	"Return Air Fan - Voltage - Phase B",
// "041":	"Return Air Fan - Voltage - Phase C",
// "042":	"Return Air Fan - Current - Phase A",
// "043":	"Return Air Fan - Current - Phase B",
// "045":	"Return Air Fan - Current - Phase C",
// "046":	"Return Air Fan - Power Factor - Phase A",
// "047":	"Return Air Fan - Power Factor - Phase B",
// "048":	"Return Air Fan - Power Factor - Phase C",
// "049":	"Alarm 1",
// "04A":	"Alarm 2",
// "04B":	"AHU ON/OFF Command",
// "04C":	"Supply Fan VFD Frequency",
// "04D":	"Supply Fan VFD KWH",
// }
var em_parameter={
    '01000f':'em_activePowerPhase1',
    '010010':'em_activePowerPhase2',
    '010011':'em_activePowerPhase3',
    '01000e':'em_activePowerTotal',
    '010017':'em_apparentPowerPhase1',
    '010018':'em_apparentPowerPhase2',
    '010019':'em_apparentPowerPhase3',
    '010016':'em_apparentPowerTotal',
    '010001':'em_currentAverage',
    '010002':'em_currentPhase1',
    '010003':'em_currentPhase2',
    '010004':'em_currentPhase3',
    '01001f':'em_forwardActiveEnergy',
    '01001e':'em_forwardApparentEnergy',
    '010020':'em_forwardReactiveEnergy',
    '01000d':'em_Frequency',
    '010029':'em_max_DM_occurrence_time_U',
    '010028':'em_MAX_MD_U',
    '010027':'em_maximumDemand',
    '010024':'em_meterID',
    '010022':'em_meterOnline_Status',
    '01001b':'em_powerFactorPhase1',
    '01001c':'em_powerFactorPhase2',
    '01001d':'em_powerFactorPhase3',
    '01001a':'em_powerFactorTotal',
    '010027':'em_presentDemand',
    '010013':'em_reactivePowerPhase1',
    '010014':'em_reactivePowerPhase2',
    '010015':'em_reactivePowerPhase3',
    '010012':'em_reactivePowerTotal',
    '010026':'em_risingDemand',
    '010005':'em_volatage_LL_average',
    '010009':'em_volatage_LN_average',
    '010006':'em_volatge_LL_phase_1_2',
    '010007':'em_volatge_LL_phase_2_3',
    '010008':'em_volatge_LL_phase_3_1',
    '01000a':'em_volatge_LN_phase_1_2',
    '01000b':'em_volatge_LN_phase_2_3',
    '01000c':'em_volatge_LN_phase_3_1',
    '020001':'ahu_chilled_valve',
    '020002': 'Chilled Water Valve Feedback',
    '020003': 'ahu_command_on_off',
    '020004': 'ahu_in_air_temperature_sp',//ahu_filter_status
    '020005': 'ahu_chilled_valve_sp',//ahu_in_air_temperature
    '020006': 'ahu_on_off_sp',//'ahu_mode_status'
    '020007': 'Supply Fan Status',
    '020008': 'Return Air Temperature',
    '020009': 'ahu_run_status',
    '02000a': 'ahu_sa_temperature',
    '02000b': 'ahu_set_point',
    '02000c': 'ahu_suply_air_temperature_sp',//'ahu_status_multistate',
    '02000d': 'Supply Air Temperature',
    '02000e': 'Auto / Manual Status',
    '02000f': 'VFD Bypass Status'
    }
    

// const discoverObject=()=>{
// let id='a14c6706-37fe-11ed-80b8-9829a659bba7'
// models.getAhuDeviceIp(id,(err,res)=>{
//     if(err){
//         console.log("------",err)
//     }else{
//         models.getAhuDeviceIp(res[0].ss_parent,(err1,resp)=>{
//             if(err1){
//                 console.log("---err1----",err1)
//             }else{
//                 console.log("resp----->",resp)
//                 bacnet.discoverDevObjects(resp[0].ss_address_value,res[0].ss_address_value,false,(err2,result)=>{
//                     if(err2){
//                         console.log("----err2----",err2)
//                     }else{
//                         console.log("-----results----",result)
//                         let resArr=[]
//                         let count=0
//                         result.forEach(Element=>{
//                             count++
//                             if(res[0].ss_tag==Element.name.slice(8,12)){
//                                     resArr.push(Element)
//                             }
//                             if(count==result.length){
//                                 console.log("------>",resArr.length)
//                                let final_arr=[]
//                                let count_final=0
//                                 resArr.forEach(ele=>{
//                                    // console.log("uuid",uuid())
//                                    let ins=[]
//                                    ins.push(uuid())
//                                    ins.push(em_parameter[ele.name.slice(-2)])
//                                    ins.push(ele.name)
//                                    ins.push('GL_SS_ADDRESS_BACNET_ID')
//                                    ins.push('GL_SS_ADDRESS_BACNET_ID')
//                                    ins.push(parseInt(ele.name.slice(-2), 16))
//                                    ins.push(res[0].ss_tag)
//                                    count_final++
//                                    final_arr.push(ins)
//                                    if(count_final==resArr.length){
//                                     console.log("=======>",final_arr)
//                                     // pool.getConnection((err, connection) => {
//                                     //     if (connection) {
//                                     //         const query = "insert into gl_subsystem  (id,name,ss_tag,ss_type,ss_address_type,ss_address_value,ss_parent) values ?"; 
//                                     //       connection.query(query,[final_arr], (error, results) => {
//                                     //         connection.release();
//                                     //         if (error) {
//                                     //           callback(error);
//                                     //         } else {
//                                     //              console.log("model sucusfully inserted",results)
//                                     //           //callback(null, results);
//                                     //         }
//                                     //       });
//                                     //     } else {
//                                     //       callback('DB connection error');
//                                     //     }
//                                     //   });
//                                    }
//                                 })
                                
//                             }
//                         })
//                     }
//                 })
//             }
//         })
//     }
// })
// }
//discoverObject()
let id='66d2082f-7335-4673-9067-cadc65b47667'

const createdevice=(DagId,data,callback)=>{
  let deviceType={'00':'NONGL_SS_EMS','A0':'NONGL_SS_AHU','B0':'NONGL_SS_CHILLER','B1':'NONGL_SS_PUMPS','B2':'NONGL_SS_SECONDARY_PUMPS'}
  let devices=  new Set(data);
  const device_list = [...devices];
  let all_devices=[]
  let device_id_map={}
  let count=0
  device_list.forEach(Element=>{
            let temp_arr=[]
            let id=uuid()
            device_id_map[Element]=id
            temp_arr.push(id)
            temp_arr.push(deviceType[Element.slice(4,6)])
            temp_arr.push('GL_SS_ADDRESS_MAC')
            temp_arr.push(Element.slice(0,6))
            temp_arr.push(DagId)
            temp_arr.push(parseInt(Element.slice(2,4), 16))
            temp_arr.push(`[${200+parseInt(Element.slice(2,4), 16)},300]`)
            all_devices.push(temp_arr)
            count++
            if(count==device_list.length){
                pool.getConnection((err, connection) => {
                if (connection) {
                    const query = "insert into gl_subsystem  (id,ss_type,ss_address_type,ss_address_value,ss_parent,name,coordinates) values ?"; 
                    connection.query(query,[all_devices], (error, results) => {
                    connection.release();
                    if (error) {
                      callback(error);
                    } else {
                         console.log("devices sucessfully created")
                      callback(null, device_id_map);
                    }
                  });
                } else {
                  callback('DB connection error');
                }
              });
            }
  })

}

const createObjects=(data,device_list_id,callback)=>{
   // console.log("data",data)
    //console.log("dddata",device_list_id)
    let final_arr=[]
    let count_final=0
   // let objlist=data.filter(ele=>ele.name.slice(0,2)=='GR')
    //console.log('===================>',JSON.stringify(objlist))
    data.forEach(ele=>{
      //console.log("----------->",(em_parameter[ele.name.slice(16,18)]))
       if(typeof params[ele.name.slice(6,12).toUpperCase()] !== 'undefined'){
                      let ins=[]
                      ins.push(uuid())
                      ins.push(params[ele.name.slice(6,12).toUpperCase()])
                      ins.push(ele.type)
                      ins.push('GL_SS_ADDRESS_BACNET_ID')
                      ins.push(parseInt(ele.objectId))
                      ins.push(device_list_id[ele.name.slice(2,8)])
                      ins.push(ele.name)
                      final_arr.push(ins)
       }
        count_final++
        if(count_final==data.length){
         console.log("=======>",final_arr)
         pool.getConnection((err, connection) => {
             if (connection) {
                 const query = "insert into gl_subsystem  (id,name,ss_tag,ss_address_type,ss_address_value,ss_parent,description ) values ?"; 
               connection.query(query,[final_arr], (error, results) => {
                 connection.release();
                 if (error) {
                   console.log("errrrin objDis-->",error)
                   callback(error);
                 } else {
                      console.log("model sucusfully inserted",results)
                   callback(null, results);
                 }
               });
             } else {
               callback('DB connection error');
             }
           });
        }
     })

}



const discoverFromDag=(DagId,callback)=>{
    controller.getDag(DagId,(err,res)=>{
        if(err){
            console.log("error------------------------------------------------->",err)
        }else{
            if(res.length>0){
              //http://localhost:7080/discoverobjects/192.168.1.22/8:3599
              console.log(`http://localhost:7080/discoverobjects_nosegmentation/${res[0].ss_address_value}/8:${res[0].ss_tag}`)
              axios
              .get(`http://localhost:7080/discoverobjects_nosegmentation/${res[0].ss_address_value}/8:${res[0].ss_tag}`,{ params: { 'dagId':DagId } })
              .then((res)=>{
                  console.log(res.data)
                  callback(null,'ACCEPTED')
              })
              .catch((err)=>{
                console.log(err)
                callback(null,'connect to PBS')
              })
            //  callback(null,'ACCEPTED')
              //use node bacnetstack
                //  bacnetHvac.discoverDevObjects(res[0].ss_address_value,res[0].ss_tag,false,(err2,result)=>{
                //     // bacnet.discoverDevObjects('192.168.10.30',14,false,(err2,result)=>{
                //         if(err2){
                //             console.log("error2---->",err2)
                //         }else{
                //                     //console.log("result",result)
                //                    // let obj_name=result.map(data=>data.name.slice(8,14))
                //                     let obj_name=result.filter(data => data.name.slice(0,2) === 'GR')
                //                                          .map(data=>data.name.slice(8,14));
                //                     let obj_param_name=result.filter(data => data.name.slice(0,2) === 'GR')
                //                                          .map(data=>data.name.slice(8,18));
                //                    // console.log("objest names----->",obj_name.length)
                //                      createdevice(DagId,obj_name,(err1,result1)=>{
                //                                 if(err1){
                //                                     console.log("error1",err1)
                //                                 }else{
                //                                     createObjects(result,result1,(err2,result2)=>{
                //                                         if(err2){
                //                                             console.trace("erroe2",err2)
                //                                         }else{
                //                                             console.log("objects are sucessfully created")
                //                                             callback(null,result1)
                //                                         }
                //                                     })
                //                                 }
                //                                 })
                //                     //callback(null,{})
                             
                //         }
                  
                // })

            }else{
                console.log('No DDC or DAG Found')
                logger.info('No DDC or DAG Found')
            }
        }
    })
    
}

const constructPermanentTableQuery=(name,column)=>{
  let queryArr=column.map(data=>'`'+data.name+'` varchar(40) DEFAULT NULL')
  let queryStr=queryArr.join(",");
  let tableCreate='CREATE TABLE  IF NOT EXISTS '+' '+name+' '+'(`id` int NOT NULL AUTO_INCREMENT,`ss_id` varchar(36) DEFAULT NULL,`measured_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,'+' '+queryStr+' '+',`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,`modified_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,PRIMARY KEY (`id`),KEY `ss_id` (`ss_id`),CONSTRAINT `'+name+'_ibfk_1` FOREIGN KEY (`ss_id`) REFERENCES `gl_subsystem` (`id`))'
  return(tableCreate)
}
const createTempPermanentTable=(data,callback)=>{
 console.log('---------------------762')
  let tempTableName=[]
  data.devices.forEach(Element=>{
    switch(Element.ss_type){
      case "NONGL_SS_EMS":tempTableName.push("em_"+Element.ss_address_value+"_om_p")
                          break;
      case "NONGL_SS_AHU":tempTableName.push("ahu_"+Element.ss_address_value+"_om_p")
                          break;
      case "NONGL_SS_CHILLER":tempTableName.push("ch_"+Element.ss_address_value+"_om_p")
                          break;
      case "NONGL_SS_PUMPS":tempTableName.push("pu_"+Element.ss_address_value+"_om_p")
                          break;
      case "NONGL_SS_SECONDARY_PUMPS":tempTableName.push("secpu_"+Element.ss_address_value+"_om_p")
                          break;
      default:
              break;                                                    
          }
  })
  deviceModel.createTempTable(tempTableName,(err,result)=>{
    if(err){
      callback(err+'_creating_temp_table')
    }else{
        callback(null,result)
        //createing denormalized table 
        // let queries=[]
        // let count=0
        // console.log("--------------------device list780",data.devices.length)
        // data.devices.forEach(devData=>{
        //   let tableName=''
        //   switch(devData.ss_type){
        //     case "NONGL_SS_EMS": tableName="em_"+devData.ss_address_value+"_om_p"
        //                          queries.push( constructPermanentTableQuery(tableName,data.paramerter[devData.uuid]))
        //                          count++
        //                          if(count==data.devices.length){
        //                           deviceModel.createPerTable(queries,(err,result)=>{
        //                             if(err){
        //                               callback(err)
        //                             }else{
        //                               console.log(">>>>>>>>>>>table p_15 created")
        //                               callback(null,result)
        //                             }
        //                           })
        //                          }  
        //                         break;
        //     case "NONGL_SS_AHU": tableName="Ahu_"+devData.ss_address_value+"_om_p"
        //                          queries.push( constructPermanentTableQuery(tableName,data.paramerter[devData.uuid]))
        //                          count++
        //                          if(count==data.devices.length){
        //                           deviceModel.createPerTable(queries,(err,result)=>{
        //                             if(err){
        //                               callback(err)
        //                             }else{
        //                               callback(null,result)
        //                             }
        //                           })
        //                          }
        //                         break;
        //     default:
        //             count++
        //             if(count==data.devices.length){
        //               deviceModel.createPerTable(queries,(err,result)=>{
        //                 if(err){
        //                   callback(err)
        //                 }else{
        //                   console.log(">>>>>>>>>>>table p_15 created")
        //                   callback(null,result)
        //                 }
        //               })
        //              }  
        //             break;                                                    
        //         }

        // })
    }
  })
  
}



const createTableForDevice=(res,callback)=>{
  //console.log("-------------------------->device service")
    let count=0
    let response=[]
    let parmObj={}
    if(Object.keys(res).length>0){
      for(var key in res){
         //console.log("key----->",res[key])
         controller.getBacnetDeviceData(res[key],(err,result)=>{
               if(err){
                 console.log("error",err)
               }else{
                 //console.log("reuslt",JSON.stringify(result))
                 let device=result.filter(data => data.ss_type=='NONGL_SS_EMS' ||  data.ss_type=='NONGL_SS_AHU' || data.ss_type=='NONGL_SS_CHILLER' || data.ss_type=='NONGL_SS_PUMPS' || data.ss_type=='NONGL_SS_SECONDARY_PUMPS')
                 let paramObjArr=[]
                 if(device.length>0){
                  paramObjArr=result.filter(data => data.ss_parent==device[0].uuid)
                  parmObj[device[0].uuid]=paramObjArr
                  response.push(device[0])
                 }
                 //console.log('objects--------------------->',JSON.stringify( paramObjArr))
                 //console.log("pARADMDMMDOBJ",JSON.stringify(parmObj))
                 count++
                  if(count==Object.keys(res).length){
                    //console.log("results",result)
                    //callback(null,{"devices":response,"paramerter":parmObj})
                    createTempPermanentTable({"devices":response,"paramerter":parmObj},(err3,res3)=>{
                     if(err3){
                       callback(err3)
                     }else{
                       console.log("successfully created table for each device")
                       logger.info("successfully created table for each device")
                       callback(null,{"devices":response,"paramerter":parmObj})
                     }
                    })
                  }                                      
               }
         })
       }
    }else{
      logger.info("No Device so no tables to create")
      console.log("no device..... so no tables to create")
      callback(null,"NO DEVICE")
    }

}





//discoverFromDag(id)

const createDevice = (DagId,result,callback) => {
  // let obj_name = result.filter(data => data.name.slice(0, 2) === 'GR')
  //   .map(data => data.name.slice(8, 14));
  //000102A00011
  //'GR_M_IP_010502000c'
  console.log("result length",result.length)
  let obj_name = result.map(data => data.name.slice(2, 8));
  // let obj_param_name = result.filter(data => data.name.slice(0, 2) === 'GR')
  //   .map(data => data.name.slice(8, 18));
  //  console.log("objest names----->",obj_name)
  createdevice(DagId, obj_name, (err1, result1) => {
    if (err1) {
      console.log("error1", err1)
    } else {
      createObjects(result, result1, (err2, result2) => {
        if (err2) {
          console.trace("erroe2", err2)
        } else {
          logger.info("device and objects are sucessfully created",JSON.stringify(result1))
          console.log("device and objects are sucessfully created",JSON.stringify(result1))
          // callback(null, result1)
          createTableForDevice(result1,(err3,res3)=>{
            if(err3){
              callback(err3)
            }else{
              callback(null,res3)
            }
          })
          // deviceService.captureBacnetTrend('192.168.1.14',12,{'value':122},(error,result)=>{
          //   if(error){
          //     callback(error)
          //   }else{
          //     res.sendStatus(ACCEPTED);
          //   }
          // })
        }
      })
    }
  })
}



module.exports = {
    // discoverObject
    params,
    discoverFromDag,
    createDevice
  };






//   result.forEach(Element=>{
//     count++
//     if(res[0].ss_tag==Element.name.slice(8,12)){
//             resArr.push(Element)
//     }
//     if(count==result.length){
//         console.log("------>",resArr.length)
//        let final_arr=[]
//        let count_final=0
//         resArr.forEach(ele=>{
//            // console.log("uuid",uuid())
//            let ins=[]
//            ins.push(uuid())
//            ins.push(em_parameter[ele.name.slice(-2)])
//            ins.push(ele.name)
//            ins.push('GL_SS_ADDRESS_BACNET_ID')
//            ins.push('GL_SS_ADDRESS_BACNET_ID')
//            ins.push(parseInt(ele.name.slice(-2), 16))
//            ins.push(res[0].ss_tag)
//            count_final++
//            final_arr.push(ins)
//            if(count_final==resArr.length){
//             console.log("=======>",final_arr)
//             pool.getConnection((err, connection) => {
//                 if (connection) {
//                     const query = "insert into gl_subsystem  (id,name,ss_tag,ss_type,ss_address_type,ss_address_value,ss_parent) values ?"; 
//                   connection.query(query,[final_arr], (error, results) => {
//                     connection.release();
//                     if (error) {
//                       callback(error);
//                     } else {
//                          console.log("model sucusfully inserted",results)
//                       //callback(null, results);
//                     }
//                   });
//                 } else {
//                   callback('DB connection error');
//                 }
//               });
//            }
//         })
        
//     }
// })







// {
//     let resArr=[]
//     let count=0
//     console.log("result",result)
//    // let obj_name=result.map(data=>data.name.slice(8,14))
//     let obj_name=result.filter(data => data.name.slice(0,2) === 'GR')
//                          .map(data=>data.name.slice(8,14));
//     let obj_param_name=result.filter(data => data.name.slice(0,2) === 'GR')
//                          .map(data=>data.name.slice(8,18));
//     //  console.log("objest names----->",obj_name.length)
//      createdevice(DagId,obj_name,(err1,result1)=>{
//                 if(err1){
//                     console.log("error1",err1)
//                 }else{
//                     createObjects(obj_param_name,result1,(err2,result2)=>{
//                         if(err2){
//                             console.trace("erroe2",err2)
//                         }else{
//                             console.log("objects are sucessfully created")
//                         }
//                     })
//                 }
//                 })
// }



//object lister

// if(err2){
//     console.log("----err2----",err2)
// }else{
//     let reqArr=[]
//     let reqArrCount=0
//     result.forEach((myobj)=>{
//         if(JSON.stringify(myobj['value'])){ 
//             if(reqArrCount<24){
//                 reqArr.push( { objectId: myobj['value'],properties: [{ id: 77 }, { id: 85 }] }) 
//            }
//         }
//         reqArrCount++
//         console.log("req my obj",JSON.stringify({ objectId: myobj['value'],properties: [{ id: 77 }, { id: 85 }] })+reqArrCount)
//      if(reqArrCount==result.length){
//         bacnetHvac.myReadPropertyMultiple(res[0].ss_address_value,reqArr,(err3,result3)=>{
//             if(err3){
//             console.log("error3",err3)
//             }else{
                    
//                     console.log("result",JSON.stringify( result3))
//                     // let obj_name=result.map(data=>data.name.slice(8,14))
//                     let obj_name=result.filter(data => data.name.slice(0,2) === 'GR')
//                                             .map(data=>data.name.slice(8,14));
//                     let obj_param_name=result.filter(data => data.name.slice(0,2) === 'GR')
//                                             .map(data=>data.name.slice(8,18));
//                     //  console.log("objest names----->",obj_name.length)
//                         createdevice(DagId,obj_name,(err1,result1)=>{
//                                 if(err1){
//                                     console.log("error1",err1)
//                                 }else{
//                                     createObjects(obj_param_name,result1,(err2,result2)=>{
//                                         if(err2){
//                                             console.trace("erroe2",err2)
//                                         }else{
//                                             console.log("objects are sucessfully created")
//                                         }
//                                     })
//                                 }
//                                 })

//             }
//         })
//      }
//     })
   
// }