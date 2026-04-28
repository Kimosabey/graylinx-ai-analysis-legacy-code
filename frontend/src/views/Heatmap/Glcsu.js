import React, { useEffect, useState } from "react";
import GLEquipmentType1 from "./GlEqpType1";


function GlAhu(props) {
  const initialState = props.location!= null ? props.location.state.name : localStorage.getItem("deviceName");
  const initialState1 = props.location != null ? props.location.state.data : localStorage.getItem("deviceID");
  const role_id = localStorage.getItem("roleID");

// console.log("props for glahuuuuu",props.location.state)

let imageParams = [
  {backgroundColor:'grey',title: 'RAT',parameter :'RAT', coordinates: [310.70, 467.13], unit:'℃', tooltipDirection:'top',minRange:'22',maxRange:'30', defaultValue:'24', defaultColor:'green'},
  {backgroundColor:'grey',title: 'RARH',parameter :'RARH', coordinates: [301.69, 553.16], unit:'%', tooltipDirection:'top',minRange:'50',maxRange:'65', defaultValue:'55', defaultColor:'green'},
  {backgroundColor:'grey',title: 'DSP',parameter :'Duct_Temp', coordinates: [163.89,658], unit:'℃', tooltipDirection:'top',minRange:'14',maxRange:'28', defaultValue:'14', defaultColor:'green'},
  {backgroundColor:'grey',title: 'ChW Valve',parameter :'CHW_Vlv_Open_Fb', coordinates: [114.9, 393], unit:'%', tooltipDirection:'bottom',minRange:'0',maxRange:'100', defaultValue:'70', defaultColor:'green'},
  // {backgroundColor:'green',title: 'Operating Status',parameter :'SAF_VFD_On_Off_Fbk', coordinates: [139.49,475.14], unit:'', tooltipDirection:'bottom', defaultValue:'On', defaultColor:'green'},
  {backgroundColor:'green',title: 'Filter Status',parameter :'DPS_Alarm_1', coordinates: [135.80,318.09], unit:'', tooltipDirection:'bottom',minRange:'',maxRange:'', defaultValue:'Normal', defaultColor:'green'},
  {backgroundColor:'green',title: 'Fan DPS',parameter :'DPS_Alarm_1', coordinates: [203.43,541.16], unit:'', tooltipDirection:'top', defaultValue:'', defaultColor:''},
  {backgroundColor:'grey',title: 'SAT',parameter :'SAT', coordinates: [233.51, 382.67], unit:'℃', tooltipDirection:'top',minRange:'11',maxRange:'18', defaultValue:'14', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'DPS(Filter)',parameter :'DPS_Filter', coordinates: [184.203, 318.903], unit:'', tooltipDirection:'top',minRange:'0',maxRange:'1', defaultValue:'Normal', defaultColor:''},
  {backgroundColor:'grey',title: 'Trip Status',parameter :'SAF_VFD_Trip_SS', coordinates: [129.09,625], unit:'', tooltipDirection:'bottom',minRange:'0',maxRange:'1', defaultValue:'Normal', defaultColor:'green'},
  {backgroundColor:'grey',title: 'Auto/Manual',parameter :'AHU_AM_SS', coordinates: [200.56, 521.675], unit:'', tooltipDirection:'top',minRange:'',maxRange:'', defaultValue:'', defaultColor:''},
  // {backgroundColor:'grey',title: 'M A Damper',parameter :'', coordinates: [286.921, 216], unit:'', tooltipDirection:'right',minRange:'',maxRange:'', defaultValue:'', defaultColor:''},
  // {backgroundColor:'grey',title: 'Exhaust',parameter :'', coordinates: [340.921, 97], unit:'', tooltipDirection:'bottom',minRange:'',maxRange:'', defaultValue:'', defaultColor:''},
  // {backgroundColor:'grey',title: 'EA Damper Pos',parameter :'EA_Dampr_Pos_SP', coordinates: [185.32, 659.67], unit:'%', tooltipDirection:'bottom',minRange:'0',maxRange:'100', defaultValue:'60', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'DSP',parameter :'DSP_SP', coordinates: [272.43, 459.166], unit:'Pa', tooltipDirection:'bottom',minRange:'0',maxRange:'500', defaultValue:'200', defaultColor:'green'},
  {backgroundColor:'grey',title: 'UV Lamp',parameter :'UVGI_SS', coordinates: [272.43, 459.166], unit:'Pa', tooltipDirection:'bottom',minRange:'0',maxRange:'500', defaultValue:'200', defaultColor:'green'},
  {backgroundColor:'grey',title: 'Electric Heater',parameter :'DSP_SP', coordinates: [272.43, 459.166], unit:'Pa', tooltipDirection:'bottom',minRange:'0',maxRange:'500', defaultValue:'200', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'Heater',parameter :'DSP_SP', coordinates: [272.43, 459.166], unit:'Pa', tooltipDirection:'bottom',minRange:'0',maxRange:'500', defaultValue:'200', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'CO₂',parameter :'RAQ_Co2', coordinates: [283.300,635.815], unit:'ppm', tooltipDirection:'top',minRange:'300',maxRange:'5000', defaultValue:'600', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'Velocity',parameter :'Wind_Speed', coordinates: [259.17,147], unit:'m/s',minRange:'7',maxRange:'15', tooltipDirection:'top', defaultValue:'10.5', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'Fan Speed',parameter :'SAF_VFD_Speed_Fbk', coordinates: [126.55, 550], unit:'rpm', tooltipDirection:'bottom',minRange:'0',maxRange:'1000', defaultValue:'', defaultColor:''},
  // {backgroundColor:'grey',title: 'OA Damper Pos',parameter :'OA_Dmpr_Pos_SP', coordinates: [204.921, 140], unit:'%', tooltipDirection:'bottom',minRange:'0',maxRange:'100', defaultValue:'70', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'SA Damper Pos',parameter :'SA_Dampr_Pos_SP', coordinates: [204.81, 629.67], unit:'%', tooltipDirection:'top',minRange:'0',maxRange:'100', defaultValue:'100', defaultColor:''},
  // {backgroundColor:'grey',title: 'Air Flow',parameter :'SA_CFM', coordinates: [169.189,  673.805], unit:'cfm', tooltipDirection:'right',minRange:'0',maxRange:'10000', defaultValue:'7000', defaultColor:'green'},
  // {backgroundColor:'grey',title: 'Supply Air Humidity',parameter :'SARH', coordinates: [105.127, 703.796], unit:'%', tooltipDirection:'right',minRange:'0',maxRange:'100', defaultValue:'98', defaultColor:'green'},
];

let controlsCard = [
  {title: 'CSU Mode',parameter: 'SAF_VFD_AM_Fbk',component: 'Switch Selector',type:'',unit:'', defaultValue:'', defaultColor:''},
  {title: 'CSU Controls',parameter: 'SAF_VFD_On_Off_Fbk',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON', defaultValue:'', defaultColor:''},
  {title: 'RAT SP',parameter: 'RAT_SP',component: 'Text Field',unit:'℃', defaultValue:'24', defaultColor:''},
  // {title: 'Outside Air Temp',parameter: 'OA_Dmpr_Pos',component: 'Chip',type:'',unit:'%', defaultValue:'50', defaultColor:''},
  {title: 'Electric Heater Status',parameter: 'CHW_Vlv_Pos_SP',component: 'Chip',type:'',unit:'%', defaultValue:'70', defaultColor:''},
  // {title: 'Duct Static Pressure -SP',parameter: 'DSP_SP',component: 'Chip',type:'',unit:'Pa', defaultValue:'', defaultColor:''},
  // {title: 'Fan Speed',parameter: 'SAF_VFD_AM',component: 'Chip',type:'',unit:'rpm', defaultValue:'abcd', defaultColor:''},
]

  // let graphsCard = [{index:'1',param:'RAT'},{index:'2',param:'Duct_Temp'},{index:'3',param:'RARH'}]
  let graphsCard = [{index:'1',title:'Return Air Temp [℃]',param:'CSU_RAT'},{index:'2',title:'Supply Air Temp [℃]',param:'CSU_SAT_Duct_Temp'},{index:'3',title:'Duct Pressure',param:'Duct_pre'},{index:'4',title:'Chw position[%]',param:'CHW_Vlv_Fbk'}] 
  let graphsCardSubEqp = [{index:'1',eqp:'VAV'}]

  return (
    <>
    <GLEquipmentType1 initialState={initialState} initialState1={initialState1} role_id={role_id} device='CSU' eqpType='NONGL_SS_CSU' imageParams={imageParams} controlsCard={controlsCard} graphsCard={graphsCard} subDevice='VAV' subEqpType='NONGL_SS_VAV' graphsCardSubEqp={graphsCardSubEqp} />
     {/* <GLEquipmentType1 title={sample} eqpType="AHU"/> */}
    </>
  );
}

export default GlAhu;
