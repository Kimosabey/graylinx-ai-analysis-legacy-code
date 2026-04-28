import React, { useEffect, useState } from "react";
import GLEquipmentType1 from "./GlEqpType1";


function GlAhu(props) {
  const initialState = props.location!= null ? props.location.state.name : localStorage.getItem("deviceName");
  const initialState1 = props.location != null ? props.location.state.data : localStorage.getItem("deviceID");
  const role_id = localStorage.getItem("roleID");
  const type = props.location.state.type;
  const ss_type = props.location.state.ss_type;

console.log("props for glahuuuuu", props.location.state);

let imageParamsAhu = [
  {
    backgroundColor: "grey",
    title: "RAT",
    parameter: "RAT",
    coordinates: [367.35, 437.94],
    coordinates1: [310.7, 467.13],
    unit: "℃",
    tooltipDirection: "right",
    minRange: "22",
    maxRange: "30",
    defaultValue: "24",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "RARH",
    parameter: "RARH",
    coordinates: [359.34, 399.94],
    coordinates1: [301.69, 553.16],
    unit: "%",
    tooltipDirection: "left",
    minRange: "50",
    maxRange: "65",
    defaultValue: "55",
    defaultColor: "green",
  },
  {
    backgroundColor: "green",
    title: "FAN DPS",
    parameter: "SAF_VFD_On_Off_Fbk",
    coordinates: [105.19, 532.92],
    coordinates1: [203.43, 541.16],
    unit: "",
    tooltipDirection: "bottom",
    defaultValue: "",
    defaultColor: "grey",
  },
  {
    backgroundColor: "grey",
    title: "DSP",
    parameter: "DSP",
    coordinates: [186.71, 673.9],
    coordinates1: [163.89, 658],
    unit: "bar",
    tooltipDirection: "top",
    minRange: "0",
    maxRange: "500",
    defaultValue: "200",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 1",
    parameter: "Heater_Bank_1_Status",
    coordinates: [205.25, 474.93],
    coordinates1: [207.22, 461.27],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 2",
    parameter: "Heater_Bank_2_Status",
    coordinates: [217.87, 383.95],
    coordinates1: [111.52, 434.25],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 3",
    parameter: "Heater_Bank_3_Status",
    coordinates: [98.89, 444.94],
    coordinates1: [116.52, 504.3],
    unit: "",
    tooltipDirection: "bottom",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "green",
    title: "Filter Status",
    parameter: "DPS_Filter",
    coordinates: [115.2, 263.97],
    coordinates1: [135.8, 318.09],
    unit: "",
    tooltipDirection: "bottom",
    minRange: "",
    maxRange: "",
    defaultValue: "Normal",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "SAT",
    parameter: "SAT",
    coordinates: [148.22, 747.89],
    coordinates1: [233.51, 382.67],
    unit: "℃",
    tooltipDirection: "top",
    minRange: "11",
    maxRange: "18",
    defaultValue: "14",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Trip Status",
    parameter: "SAF_VFD_Trip_SS_Alarm",
    coordinates: [205.25, 550.92],
    coordinates1: [129.09, 625],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "Normal",
    defaultColor: "green",
  },
];

let imageParamsCsu = [
  {
    backgroundColor: "grey",
    title: "RAT",
    parameter: "CSU_RAT",
    coordinates: [367.35, 437.94],
    coordinates1: [310.7, 467.13],
    unit: "℃",
    tooltipDirection: "right",
    minRange: "22",
    maxRange: "30",
    defaultValue: "24",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "RARH",
    parameter: "CSU_RAH",
    coordinates: [359.34, 399.94],
    coordinates1: [301.69, 553.16],
    unit: "%",
    tooltipDirection: "left",
    minRange: "50",
    maxRange: "65",
    defaultValue: "55",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "SAT",
    parameter: "CSU_SAT_Duct_Temp",
    coordinates: [148.22, 747.89],
    coordinates1: [233.51, 382.67],
    unit: "℃",
    tooltipDirection: "top",
    minRange: "11",
    maxRange: "18",
    defaultValue: "14",
    defaultColor: "green",
  },
  {
    backgroundColor: "green",
    title: "FAN DPS",
    parameter: "CSU_Run_SS",
    coordinates: [105.19, 532.92],
    coordinates1: [199.6, 549.33],
    unit: "",
    tooltipDirection: "bottom",
    defaultValue: "",
    defaultColor: "grey",
  },
  {
    backgroundColor: "grey",
    title: "DSP",
    parameter: "CSU_Duct_pre",
    coordinates: [186.71, 673.9],
    coordinates1: [163.89, 658],
    unit: "bar",
    tooltipDirection: "top",
    minRange: "14",
    maxRange: "28",
    defaultValue: "14",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Trip Status",
    parameter: "CSU_Trip_SS_Alarm",
    coordinates: [205.25, 550.92],
    coordinates1: [129.09, 625],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "Normal",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 1",
    parameter: "CSU_Heater_Bank_1_Status",
    coordinates: [205.25, 474.93],
    coordinates1: [201.81, 472.28],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 2",
    parameter: "CSU_Heater_Bank_2_Status",
    coordinates: [217.87, 383.95],
    coordinates1: [111.52, 434.25],
    unit: "",
    tooltipDirection: "top",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "grey",
    title: "Bank 3",
    parameter: "CSU_Heater_Bank_3_Status",
    coordinates: [98.89, 444.94],
    coordinates1: [119.6, 514.31],
    unit: "",
    tooltipDirection: "bottom",
    minRange: "",
    maxRange: "",
    defaultValue: "",
    defaultColor: "green",
  },
  {
    backgroundColor: "green",
    title: "Filter Status",
    parameter: "CSU_Pre_Filter",
    coordinates: [115.2, 263.97],
    coordinates1: [135.8, 318.09],
    unit: "",
    tooltipDirection: "bottom",
    minRange: "",
    maxRange: "",
    defaultValue: "Normal",
    defaultColor: "green",
  },
  //// {backgroundColor:'grey',title: 'DX Unit Status',parameter :'DX_Unit_SS', coordinates: [272.43, 459.166], unit:'', tooltipDirection:'bottom',minRange:'0',maxRange:'500', defaultValue:'200', defaultColor:'green'},
];

let controlsCardAhu = [
  {
    title: "Schedule",
    writeParameter: "SAF_VFD_On_Off",
    compareParameter: "",
    readParameter: "SAF_VFD_On_Off",
    component: "Switch Selector",
    unit: "",
    type: "OnOff",
    label1: "OFF",
    label2: "ON",
    defaultValue: "",
    defaultColor: "",
  },
  {
    title: "AHU Fan",
    writeParameter: "SAF_VFD_On_Off",
    compareParameter: "",
    readParameter: "SAF_VFD_On_Off_Fbk",
    component: "Switch Selector",
    unit: "",
    type: "OnOff",
    label1: "OFF",
    label2: "ON",
    defaultValue: "",
    defaultColor: "",
  },
  {
    title: "SAT SP",
    readParameter: "SAT_SP",
    writeParameter: "SAT_SP",
    component: "Text Field",
    unit: "℃",
    defaultValue: "24",
    defaultColor: "",
  },
  // {title: 'Outside Air Temp',parameter: 'OA_Dmpr_Pos',component: 'Chip',type:'',unit:'%', defaultValue:'50', defaultColor:''},
  {
    title: "Remote/Manual Status",
    readParameter: "SAF_VFD_AM_Fbk",
    compareParameter: "SAF_VFD_On_Off",
    component: "Chip",
    type: "",
    unit: "",
    defaultValue: "inactive",
    defaultColor: "",
  },
  // {title: 'AHU Run Status',readParameter: 'SAF_VFD_On_Off_Fbk',compareParameter:'',component: 'Chip',type:'',unit:'', defaultValue:'inactive', defaultColor:''},
  // {title: 'Return Air Temperature',readParameter: 'RAT',compareParameter:'',component: 'Chip',type:'',unit:'℃', defaultValue:'inactive', defaultColor:''},
  // {title: 'Return Air RH (Relative Humidity)',readParameter: 'RARH',compareParameter:'',component: 'Chip',type:'',unit:'%', defaultValue:'inactive', defaultColor:''},
  // {title: 'AHU Trip Status',readParameter: 'SAF_VFD_Trip_SS_Alarm',compareParameter:'',component: 'Chip',type:'',unit:'', defaultValue:'inactive', defaultColor:''},
  // {title: 'Electric Heater Status',readParameter: 'Electric_Heater_Cntrl_SS',compareParameter:'',component: 'Chip',type:'',unit:'', defaultValue:'70', defaultColor:''},
  {
    title: "Heater Bank 1 Status",
    readParameter: "Heater_Bank_1_Status",
    compareParameter: "",
    component: "Chip",
    type: "",
    unit: "",
    defaultValue: "inactive",
    defaultColor: "",
  },
  {
    title: "Heater Bank 2 Status",
    readParameter: "Heater_Bank_2_Status",
    compareParameter: "",
    component: "Chip",
    type: "",
    unit: "",
    defaultValue: "inactive",
    defaultColor: "",
  },
  {
    title: "Heater Bank 3 Status",
    readParameter: "Heater_Bank_3_Status",
    compareParameter: "",
    component: "Chip",
    type: "",
    unit: "",
    defaultValue: "inactive",
    defaultColor: "",
  },
  // {title: 'Duct Static Pressure -SP',parameter: 'DSP_SP',component: 'Chip',type:'',unit:'Pa', defaultValue:'', defaultColor:''},
  // {title: 'Fan Speed',parameter: 'SAF_VFD_AM',component: 'Chip',type:'',unit:'rpm', defaultValue:'abcd', defaultColor:''},
];
 let checkEqpAMStatusAhu = [{parameter: 'SAF_VFD_AM_Fbk'}];

 let checkEqpAMStatusCsu = [{parameter: 'CSU_Fan_AM_SS'}];

 let checkAhuEqpActive = 'SAF_VFD_On_Off_Fbk';
 
 let checkCsuEqpActive = 'CSU_Run_SS';

let controlsCardCsu = [
  {title: 'Schedule',writeParameter: 'CSU_Run_SS',compareParameter:'',readParameter: 'CSU_Run_SS',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON', defaultValue:'', defaultColor:''},
  {title: 'CSU Fan',writeParameter: 'CSU_On_Off_Cmd',readParameter: 'CSU_Run_SS',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON', defaultValue:'', defaultColor:''},
  {title: 'Heater Bank 1 Status',readParameter: 'CSU_Heater_Bank_1_Status',component: 'Chip',type:'',unit:'', defaultValue:'70', defaultColor:''},
  {title: 'Heater Bank 2 Status',readParameter: 'CSU_Heater_Bank_2_Status',component: 'Chip',type:'',unit:'', defaultValue:'70', defaultColor:''},
  {title: 'Heater Bank 3 Status',readParameter: 'CSU_Heater_Bank_3_Status',component: 'Chip',type:'',unit:'', defaultValue:'70', defaultColor:''},
  {title: 'DX Unit',readParameter: 'DX_Unit_SS',component: 'Chip',type:'',unit:'', defaultValue:'', defaultColor:''},
  {title: 'ChW Valve',readParameter: 'CHW_Vlv_Fbk',component: 'Chip',type:'',unit:'', defaultValue:'', defaultColor:''},
];

let graphsCardAhu = [{index:'1',minRange:'0',maxRange:'40',title:'Return Air Temp [℃]',param:'RAT'},{index:'2',minRange:'0',maxRange:'40',title:'Supply Air Temp [℃]',param:'SAT'},{index:'3',minRange:'0',maxRange:'300',title:'DSP[bar]',param:'DSP'},{index:'',minRange:'0',maxRange:'100',title:'Chw position[%]',param:'CHW_Vlv_Pos'}] 

let graphsCardCsu = [{index:'1',minRange:'0',maxRange:'40',title:'Return Air Temp [℃]',param:'CSU_RAT'},{index:'2',minRange:'0',maxRange:'40',title:'Supply Air Temp [℃]',param:'CSU_SAT_Duct_Temp'},{index:'3',minRange:'0',maxRange:'300',title:'Duct Pressure[bar]',param:'CSU_Duct_pre'},{index:'4',minRange:'0',maxRange:'100',title:'Chw position[%]',param:'CHW_Vlv_Fbk'}]; 

let graphsCardSubEqp = [{index:'1',eqp:'VAV'}];

return (
    <>
    <GLEquipmentType1 
    initialState={initialState} 
    initialState1={initialState1} 
    role_id={role_id} 
    device={type} 
    eqpType={ss_type} 
    checkAhuEqpActive={checkAhuEqpActive}
    checkCsuEqpActive={checkCsuEqpActive}
    imageParamsAhu={imageParamsAhu} 
    imageParamsCsu={imageParamsCsu} 
    controlsCardAhu={controlsCardAhu} 
    controlsCardCsu={controlsCardCsu} 
    graphsCardAhu={graphsCardAhu} 
    graphsCardCsu={graphsCardCsu} 
    subDevice='VAV' 
    subEqpType='NONGL_SS_VAV' 
    checkEqpAMStatusAhu={checkEqpAMStatusAhu}
    checkEqpAMStatusCsu={checkEqpAMStatusCsu}
    graphsCardSubEqp={graphsCardSubEqp} />
    </>
  );
}

export default GlAhu;
