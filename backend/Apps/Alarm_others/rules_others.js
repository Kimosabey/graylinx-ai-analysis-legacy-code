///////////////////////SAT_OLD AND RAT_OLD///////////////////////////////////////////
if (val.param_id === "SAT" ){
    if(val.presentValue < 17 || val.presentValue > 27){
        // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '303',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAT',
            "message": 'Supply Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
} 
if (val.param_id === "RAT"){
    if(val.presentValue < 17 || val.presentValue > 27){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '301',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAT',
            "message": 'Return Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////SAT//////////////////////////////////////////////////////////////
if (val_cmd.param_id === "SAT_SP" && val.param_id === "SAT"){
    if(val_cmd.presentValue - val.presentValue > 1 || val_cmd.presentValue - val.presentValue < -0.5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '303',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAT',
            "message": 'Supply Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////RAT/////////////////////////////////////////
if (val_cmd.param_id === "RAT_SP" && val.param_id === "RAT"){
    if(val_cmd.presentValue - val.presentValue > 1 || val_cmd.presentValue - val.presentValue < -0.5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '301',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAT',
            "message": 'Return Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////////SARH/////////////////////////////////

if (val.param_id === "SARH"){
    if(val.presentValue < 30 || val.presentValue > 60){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '304',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SARH',
            "message": 'Supply Air Relative Humidity Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////////RARH/////////////////////////////////////////

if (val.param_id === "RARH"){
    if(val.presentValue < 30 || val.presentValue > 60){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '302',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RARH',
            "message": 'Return Air Relative Humidity Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////////OAT////////////////////////////////////////////////

if (val.param_id === "OAT"){
    if(val.presentValue < 15 || val.presentValue > 35){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '305',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'OAT',
            "message": 'Outside Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////////////MAT///////////////////////////////////////////////////

if (val.param_id === "MAT"){
    if(val.presentValue < 15 || val.presentValue > 35){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '306',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'MAT',
            "message": 'Mixed Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////CHW_Vlv_Pos/////////////////////////////////////////////////

if (val_cmd.param_id === "CHW_Vlv_Pos_SP" && val.param_id === "CHW_Vlv_Pos"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '307',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'CHW_Vlv_Pos',
            "message": 'Chilled Water Valve-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////////////OA_Dmpr_Pos/////////////////////////////////////////
if (val_cmd.param_id === "OA_Dmpr_Pos_SP" && val.param_id === "OA_Dmpr_Pos"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '308',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'OA_Dmpr_Pos',
            "message": 'Outside Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////////////RA_Dmpr_Pos//////////////////////////////////////////////
if (val_cmd.param_id === "RA_Dmpr_Pos_SP" && val.param_id === "RA_Dmpr_Pos"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '309',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RA_Dmpr_Pos',
            "message": 'Return Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////////EA_Dmpr_Pos/////////////////////////////////////////////////////
if (val_cmd.param_id === "EA_Dmpr_Pos_SP" && val.param_id === "EA_Dmpr_Pos"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '310',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'EA_Dmpr_Pos',
            "message": 'Exhaust Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////////SA_Dmpr_Pos//////////////////////////////////////////////////
if (val_cmd.param_id === "SA_Dmpr_Pos_SP" && val.param_id === "SA_Dmpr_Pos"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '311',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SA_Dmpr_Pos',
            "message": 'Supply Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////////////////DSP////////////////////////////////////////////////////////////
if (val_cmd.param_id === "DSP_SP" && val.param_id === "DSP"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '312',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DSP',
            "message": 'Duct Static Pressure Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

///////////////////////////////////////////////////////SP_Pre_Filter//////////////////////////////////////////////////////////
if (val.param_id === "SP_Pre_Filter"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '313',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SP_Pre_Filter',
            "message": 'Static Pressure-Pre-Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

///////////////////////////////////////////////////SP_Post_Filter/////////////////////////////////////
if (val.param_id === "SP_Post_Filter"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '314',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SP_Post_Filter',
            "message": 'Static Pressure-Post-Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////////DPS_Filter///////////////////////////////////////////////
if (val.param_id === "DPS_Filter"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '315',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DPS_Filter',
            "message": 'DPS across Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////SAF_VFD_AM/////////////////////////////////////////////////
if (val.param_id === "SAF_VFD_AM"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '316',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_AM',
            "message": 'Supply Air Fan VFD-Auto/Manual-Command Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

///////////////////////////////////////////////////////////SAF_VFD_Trip_SS////////////////////////////////////////////
if (val.param_id === "SAF_VFD_Trip_SS"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '317',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_Trip_SS',
            "message": 'Supply Air Fan VFD-Trip Status Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

///////////////////////////////////////////////////////////SAF_VFD_Speed////////////////////////////////////////////
if (val_cmd.param_id === "SAF_VFD_Speed_SP" && val.param_id === "SAF_VFD_Speed"){
    if(val_cmd.presentValue - val.presentValue > 5 || val_cmd.presentValue - val.presentValue < -5){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '318',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_Speed',
            "message": 'Supply Air Fan VFD-Speed-Command Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}
/////////////////////////////////////////////////////////////////VFD_SS///////////////////////////////////////////////
if (val.param_id === "VFD_SS"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '319',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'VFD_SS',
            "message": 'VFD status - (Fan motor through VFD ? Direct "bypass" ?) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////RAQ_CO2/////////////////////////////////////////////////////////////////
if (val.param_id === "RAQ_CO2"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '321',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAQ_CO2',
            "message": 'Return Air Quality-CO2 Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////////////DPS_SAF_SS///////////////////////////////////////////////////////
if (val.param_id === "DPS_SAF_SS"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '322',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DPS_SAF_SS',
            "message": 'DPS across Supply Air Fan - Status (DPS across SAF) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////////////////RAF_SS///////////////////////////////////////////////////////
if (val.param_id === "RAF_SS"){
    if(val.presentValue == 1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '323',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAF_SS',
            "message": 'Return Air Fan - Status (DP Switch across RAF) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}

/////////////////////////////////////////////////////////ZAT FOR VAV/////////////////////////////////////////////////////////
if (val_cmd.param_id === "VAV_ZAT_SP" && val.param_id === "VAV_ZAT"){
    if(val_cmd.presentValue - val.presentValue > 1 || val_cmd.presentValue - val.presentValue < -1){
        // console.log("device_id",val.ss_id,"param_id",val.param_id ,"val",val.presentValue)
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": '322',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'VAV_ZAT',
            "message": 'Zonal Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": val.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////THE END//////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////RULES FOR NEW JSON AS PER SNAPSHOT///////////////////////////////////////////////////////////

/////////////////////////////////////////////////////RAT/////////////////////////////////////////////////////////////////////
if(snapData.RAT_SP && snapData.RAT){
    if(snapData.RAT_SP.presentValue - snapData.RAT.presentValue > 1 || snapData.RAT_SP.presentValue - snapData.RAT.presentValue < -0.5){
        ahuArr.push({
            "ss_id": item.id,
            "alarm_code": '301',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAT',
            "message": 'Return Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.id,
            "alarm_code": ''
        })
    }
  }
////////////////////////////////////////////////////SAT//////////////////////////////////////////////////////////////////////
if(snapData.SAT_SP && snapData.SAT){
    if(snapData.SAT_SP.presentValue - snapData.SAT.presentValue > 1 || snapData.SAT_SP.presentValue - snapData.SAT.presentValue < -0.5){
        ahuArr.push({
            "ss_id": item.id,
            "alarm_code": '303',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAT',
            "message": 'Supply Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.id,
            "alarm_code": ''
        })
    }
  }
//////////////////////////////////////////////////SARH////////////////////////////////////////////////////////////////////////
if(snapData.SARH){
    if(snapData.SARH.presentValue < 30 || snapData.SARH.presentValue > 60){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '304',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SARH',
            "message": 'Supply Air Relative Humidity Mismatch'
        });
    }else{
        ahuArr.push({
            "ss_id":item.id,
            "alarm_id": ''
        })
    }
}
/////////////////////////////////////////////////RARH/////////////////////////////////////////////////////////////////////////
if(snapData.RARH){
    if(snapData.RARH.presentValue < 30 || snapData.RARH.presentValue > 60){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '305',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RARH',
            "message": 'Return Air Relative Humidity Mismatch'
        });
    }else{
        ahuArr.push({
            "ss_id":item.id,
            "alarm_id": ''
        })
    }
}
//////////////////////////////////////////////////////////OAT//////////////////////////////////////////////////////////////////
if (snapData.OAT){
    if(snapData.OAT.presentValue < 15 || snapData.OAT.presentValue > 35){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '305',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'OAT',
            "message": 'Outside Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
//////////////////////////////////////////////////////////MAT//////////////////////////////////////////////////////////////////
if (snapData.MAT){
    if(snapData.MAT.presentValue < 15 || snapData.MAT.presentValue > 35){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '306',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'MAT',
            "message": 'Mixed Air Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
//////////////////////////////////////////////////////////CHW_Vlv_Pos///////////////////////////////////////////////////////////////
if (snapData.CHW_Vlv_Pos_SP && snapData.CHW_Vlv_Pos){
    if(snapData.CHW_Vlv_Pos_SP - snapData.CHW_Vlv_Pos > 5 || snapData.CHW_Vlv_Pos - snapData.CHW_Vlv_Pos < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '307',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'CHW_Vlv_Pos',
            "message": 'Chilled Water Valve-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
/////////////////////////////////////////////////////OA_Dmpr_Pos/////////////////////////////////////////////////////////////////////////
if (snapData.OA_Dmpr_Pos_SP && snapData.OA_Dmpr_Pos){
    if(snapData.OA_Dmpr_Pos_SP.presentValue - snapData.OA_Dmpr_Pos.presentValue > 5 || snapData.OA_Dmpr_Pos_SP.presentValue - snapData.OA_Dmpr_Pos.presentValue < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '308',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'OA_Dmpr_Pos',
            "message": 'Outside Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////////////RA_Dmpr_Pos/////////////////////////////////////////////////////////////////////////
if (snapData.RA_Dmpr_Pos_SP && snapData.RA_Dmpr_Pos){
    if(snapData.RA_Dmpr_Pos_SP.presentValue - snapData.RA_Dmpr_Pos.presentValue > 5 || snapData.RA_Dmpr_Pos_SP.presentValue - snapData.RA_Dmpr_Pos.presentValue < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '309',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RA_Dmpr_Pos',
            "message": 'Return Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
///////////////////////////////////////////////////////EA_Dmpr_Pos////////////////////////////////////////////////////////////////////
if (snapData.EA_Dmpr_Pos_SP && snapData.EA_Dmpr_Pos){
    if(snapData.EA_Dmpr_Pos_SP.presentValue - snapData.EA_Dmpr_Pos.presentValue > 5 || snapData.EA_Dmpr_Pos_SP.presentValue - snapData.EA_Dmpr_Pos.presentValue < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '310',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'EA_Dmpr_Pos',
            "message": 'Exhaust Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
//////////////////////////////////////////////////////////SA_Dmpr_Pos//////////////////////////////////////////////////////////////////////
if (snapData.SA_Dmpr_Pos_SP && snapData.SA_Dmpr_Pos){
    if(snapData.SA_Dmpr_Pos_SP.presentValue - snapData.SA_Dmpr_Pos.presentValue > 5 || snapData.SA_Dmpr_Pos_SP.presentValue - snapData.SA_Dmpr_Pos.presentValue < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '311',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SA_Dmpr_Pos',
            "message": 'Supply Air Damper-Position Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////////////////////DSP///////////////////////////////////////////////////////////////////////////////
if (snapData.DSP_SP && snapData.DSP){
    if(snapData.DSP_SP.presentValue - snapData.DSP.presentValue > 5 || snapData.DSP_SP.presentValue - snapData.DSP.presentValue < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '312',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DSP',
            "message": 'Duct Static Pressure Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////////////////SP_Pre_Filter/////////////////////////////////////////////////////////////////
if (snapData.SP_Pre_Filter){
    if(snapData.SP_Pre_Filter.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '313',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SP_Pre_Filter',
            "message": 'Static Pressure-Pre-Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////////SP_Post_Filter///////////////////////////////////////////////////////////////////////////////////////////
if (snapData.SP_Post_Filter){
    if(snapData.SP_Post_Filter.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '314',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SP_Post_Filter',
            "message": 'Static Pressure-Post-Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////DPS_Filter///////////////////////////////////////////////////////////////////////////////////////////////////////////
if (snapData.DPS_Filter){
    if(snapData.DPS_Filter.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '315',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DPS_Filter',
            "message": 'DPS across Filter Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
///////////////////////////////////////////////////////////SAF_VFD_AM/////////////////////////////////////////////////////////////////////////////////////////////////////
if (snapData.SAF_VFD_AM){
    if(snapData.SAF_VFD_AM.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '316',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_AM',
            "message": 'Supply Air Fan VFD-Auto/Manual-Command Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
///////////////////////////////////////////////////////////SAF_VFD_Trip_SS////////////////////////////////////////////////////////////////////////////////////////
if (snapData.SAF_VFD_Trip_SS){
    if(snapData.SAF_VFD_Trip_SS.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '317',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_Trip_SS',
            "message": 'Supply Air Fan VFD-Trip Status Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
///////////////////////////////////////////////////////////SAF_VFD_Speed////////////////////////////////////////////////////////////////////////////////
if (snapData.SAF_VFD_Speed_SP && snapData.SAF_VFD_Speed){
    if(snapData.SAF_VFD_Speed_SP - snapData.SAF_VFD_Speed > 5 || snapData.SAF_VFD_Speed_SP - snapData.SAF_VFD_Speed < -5){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '318',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'SAF_VFD_Speed',
            "message": 'Supply Air Fan VFD-Speed-Command Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
///////////////////////////////////////////////////////////VFD_SS//////////////////////////////////////////////////////////////////////////////////////////
if (snapData.VFD_SS){
    if(snapData.VFD_SS.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '319',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'VFD_SS',
            "message": 'VFD status - (Fan motor through VFD ? Direct "bypass" ?) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
//////////////////////////////////////////////RAQ_CO2/////////////////////////////////////////////////////////////////
if (snapData.RAQ_CO2){
    if(snapData.RAQ_CO2 == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '321',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAQ_CO2',
            "message": 'Return Air Quality-CO2 Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
//////////////////////////////////////////////////////DPS_SAF_SS///////////////////////////////////////////////////////
if (snapData.DPS_SAF_SS){
    if(snapData.DPS_SAF_SS.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '322',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'DPS_SAF_SS',
            "message": 'DPS across Supply Air Fan - Status (DPS across SAF) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}

//////////////////////////////////////////////////////////RAF_SS///////////////////////////////////////////////////////
if (snapData.RAF_SS){
    if(snapData.RAF_SS.presentValue == 1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '323',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'RAF_SS',
            "message": 'Return Air Fan - Status (DP Switch across RAF) Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}

////////////////////////////////////////////////ZAT FOR VAV/////////////////////////////////////////////////////////
if (snapData.VAV_ZAT_SP && snapData.VAV_ZAT){
    if(snapData.VAV_ZAT_SP - snapData.VAV_ZAT > 1 || snapData.VAV_ZAT_SP - snapData.VAV_ZAT < -1){
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": '322',
            "measured": fns.format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            "param_id": 'VAV_ZAT',
            "message": 'Zonal Temperature Mismatch'
        });
    // }
    }else{
        ahuArr.push({
            "ss_id": item.ss_id,
            "alarm_code": ''
        })
    }
}
////////////////////////////////////////////////////THE END//////////////////////////////////////////////////////////////////