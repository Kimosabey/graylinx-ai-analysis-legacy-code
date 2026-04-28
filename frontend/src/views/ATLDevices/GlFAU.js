import React, { useEffect, useState } from "react";
import GLEquipmentType1 from "./../Heatmap/GlEqpType1";


function GlAhu(props) {
  const initialState = props.location!= null ? props.location.state.name : localStorage.getItem("deviceName");
  const initialState1 = props.location != null ? props.location.state.data : localStorage.getItem("deviceID");
  const role_id = localStorage.getItem("roleID");

console.log("props for glfauuuuu",props.location.state)


  let imageParams = [
    {backgroundColor:'grey',title: 'CO₂',parameter :'FAU_CO2_Value', coordinates: [116.77,636.19], unit:'ppm', tooltipDirection:'bottom'},
    {backgroundColor:'grey',title: 'Air Damper',parameter :'FAU_CO2_Value', coordinates: [195.40,172.04], unit:'', tooltipDirection:'bottom'},
    {backgroundColor:'grey',title: 'Fan Speed',parameter :'FAU_Frequency_Fbk', coordinates: [195.90,555.16], unit:'%', tooltipDirection:'top'},
    {backgroundColor:'grey',title: 'SAT',parameter :'FAU_Supply_Temp', coordinates: [199.91,634.18], unit:'℃', tooltipDirection:'top',minRange:'0'},
    {backgroundColor:'grey',title: 'Filter Status 2',parameter :'FAU_Filter_Alarm_2', coordinates: [134.5,317.09], unit:'', tooltipDirection:'bottom'},
    {backgroundColor:'grey',title: 'Filter Status 1',parameter :'FAU_Filter_Alarm_1', coordinates: [245.63,300.08], unit:'', tooltipDirection:'top'},
    {backgroundColor:'grey',title: 'SARH',parameter :'FAU_Supply_Humidity', coordinates: [178.87,634.19], unit:'rh', tooltipDirection:'right'},
    {backgroundColor:'grey',title: 'FA Duct Temp',parameter :'FAU_Duct_Temp', coordinates: [266.89,154.03], unit:'℃', tooltipDirection:'top'},
    {backgroundColor:'grey',title: 'Chw valve',parameter :'FAU_Vlv_Open_Fbk', coordinates: [109.5,383.11], unit:'%', tooltipDirection:'right'},
    {backgroundColor:'grey',title: 'Operating Status',parameter :'FAU_Opn_SS', coordinates: [127.79,510.15], unit:'', tooltipDirection:'bottom'},
    {backgroundColor:'grey',title: 'Fan DPS',parameter :'FAU_Fan_Alarm', coordinates: [212.08, 486.14], unit:'', tooltipDirection:'top'},
    {backgroundColor:'grey',title: 'Wind Speed',parameter :'Wind_Speed', coordinates: [189.59,143.03], unit:'', tooltipDirection:'right'}
  ];
 

  let controlsCard = [
    {title: 'FAU Mode',parameter: 'FAU_AM_SS',component: 'Chip',type:'',unit:''},
    {title: 'FAU Controls',parameter: 'FAU_On_Off',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON'},
    {title: 'SAT SP',parameter: 'SAT_SP',component: 'Text Field',unit:'℃'}
  ]

  let graphsCard = [{index:'1',param:'FAU_Supply_Temp'},{index:'2',param:'FAU_Duct_Temp'},{index:'3',param:'FAU_CO2_Value'},{index:'4',param:'FAU_Wind_Speed'}]

  return (
    <>
    <GLEquipmentType1 initialState={initialState} initialState1={initialState1} role_id={role_id} device='FAU' eqpType='FRESH_AIR_UNIT' imageParams={imageParams} controlsCard={controlsCard} graphsCard={graphsCard} />
     {/* <GLEquipmentType1 title={sample} eqpType="AHU"/> */}
    </>
  );
}

export default GlAhu;
