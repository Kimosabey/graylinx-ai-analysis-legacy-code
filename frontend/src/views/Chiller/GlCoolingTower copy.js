import React, { useEffect, useState } from "react";
import GLCPMEquipmentType1 from "./GlCPMEqpType2";

function GlCoolingTower(props) {
  // const initialState = props.location!= null ? props.location.state.name : localStorage.getItem("deviceName");
  // const initialState1 = props.location != null ? props.location.state.data : localStorage.getItem("deviceID");
  // const role_id = localStorage.getItem("roleID");
  const initialState =
    props.location?.state?.data.name || localStorage.getItem("deviceName");
  const initialState1 =
    props.location?.state?.data.id || localStorage.getItem("deviceID");
  const role_id = localStorage.getItem("roleID");

  console.log("props for glahuuuuu", props.location?.state);

  let imageParams = [
    {
      backgroundColor: "grey",
      title: "Cooling Tower In",
      parameter: "CT_Inlet_Temp",
      coordinates: [169.7, 355.0],
      unit: "℃",
      tooltipDirection: "left",
      minRange: "25",
      maxRange: "32",
    },
    {
      backgroundColor: "grey",
      title: "Cooling Tower Out",
      parameter: "CT_Outlet_Temp",
      coordinates: [170.0, 430.0],
      unit: "℃",
      tooltipDirection: "right",
      minRange: "20",
      maxRange: "28",
    },
    {
      backgroundColor: "grey",
      title: "CT Fan Amps",
      parameter: "CT_Fan_Amps",
      coordinates: [160.0, 450.0],
      unit: "A",
      tooltipDirection: "left",
      minRange: "5",
      maxRange: "25",
    },
    {
      backgroundColor: "grey",
      title: "CT Fan Hz",
      parameter: "CT_Fan_Hz",
      coordinates: [150.0, 470.0],
      unit: "Hz",
      tooltipDirection: "right",
      minRange: "45",
      maxRange: "60",
    },

    // {backgroundColor:'grey',title: 'CW',parameter :'CH_On_Off', coordinates: [186.29,113.20], unit:'℃', tooltipDirection:'bottom',minRange:'',maxRange:''},
    // {backgroundColor:'grey',title: 'Valve status',parameter :'CH_AM_SS', coordinates: [170.32,476.28], unit:'', tooltipDirection:'bottom',minRange:'',maxRange:''},
  ];

  // let controlsCardLeft1 = [
  // {title: 'Compressor Load 1',parameter: 'Comp_Load_1',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Compressor Load 2',parameter: 'Comp_Load_2',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Compressor Power 1',parameter: 'Comp_Power_1',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Compressor Power 2',parameter: 'Comp_Power_1',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Compressor 1',parameter: 'Run_SS_1',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Compressor 2',parameter: 'Run_SS_2',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
  // {title: 'Oil Pressure 1[PSIG]',parameter: 'Oil_Pre_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  // {title: 'Oil Pressure 2[PSIG]',parameter: 'Oil_Pre_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  // {title: 'Oil Temperature 1[℃]',parameter: 'Oil_Temp_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  // {title: 'Oil Temperature 2[℃]',parameter: 'Oil_Temp_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},

  // ];
  // let controlsCardLeft2 = [
  //   {title: 'Suction Pressure 1[PSIG]',parameter: 'Suc_Pre_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  //   {title: 'Suction Pressure 2[PSIG]',parameter: 'Suc_Pre_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  //   {title: 'Discharge Pressure 1[PSIG]',parameter: 'Dis_Pre_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  //   {title: 'Discharge Pressure 2[PSIG]',parameter: 'Dis_Pre_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  //   {title: 'Discharge Temperature 1[℃]',parameter: 'Dis_Temp_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  //   {title: 'Discharge Temperature 2[℃]',parameter: 'Dis_Temp_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},
  // ];

  let controlsCard = [
    // {title: 'Chiller',parameter: 'CPM_AM_Status',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON'},
    {
      title: "Cooling Tower",
      parameter: "CT_Fan_Run_SS",
      defaultValue: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
    },
    {
      title: "Cooling Tower Motorized Valve Position",
      parameter: "CT_Out_Vlv_On_Off_Fbk",
      defaultValue: "",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
    },
    // {
    //   title: "Wet Bulb Temp[°C]",
    //   parameter: "CH_WetBulb_Temp",
    //   defaultValue: "7",
    //   component: "Chip",
    //   typeOf: "controls",
    //   unit: "℃",
    // },
    {
      title: "Condenser Water Set Point",
      parameter: "CHW_Setpoint",
      defaultValue: "7",
      component: "Set Operator",
      typeOf: "controls",
      unit: "℃",
    },

    {
      title: "Run Hours",
      parameter: "rh_cumulative",
      defaultValue: "Off",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Cooling Tower Mode",
      parameter: "CT_FAN_SS",
      defaultValue: "OFF",
      component: "Chip",
      type: "status",
      unit: "",
    },
    { title: "Fan Status", type: "status" },
    {
      title: "Fan-1",
      parameter: "CT_Fan_1_On_Off_SS",
      defaultValue: "Off",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: "",
    },
    {
      title: "Fan-2",
      parameter: "CT_Fan_2_On_Off_SS",
      defaultValue: "Off",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: "",
    },
    {
      title: "Fan-3",
      parameter: "CT_Fan_3_On_Off_SS",
      defaultValue: "Off",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: "",
    },
    //{title: 'Fan-2',parameter: 'CH_On_Off_SS',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
    { title: "Trip Status", type: "status" },
    {
      title: "Fan-1",
      parameter: "CT_Var_FAN_1_Trip_SS_Alarm",
      defaultValue: "Normal",
      component: "Chip",
      type: "status",
      section: "Trip Status",
      unit: "",
    },
    {
      title: "Fan-2",
      parameter: "CT_Var_FAN_2_Trip_SS_Alarm",
      defaultValue: "Normal",
      component: "Chip",
      type: "status",
      section: "Trip Status",
      unit: "",
    },
    {
      title: "Fan-3",
      parameter: "CT_Var_FAN_3_Trip_SS_Alarm",
      defaultValue: "Normal",
      component: "Chip",
      type: "status",
      section: "Trip Status",
      unit: "",
    },
    //{title: 'Fan-2',parameter: 'CH_Trip_SS',defaultValue:"Normal",component: 'Chip',type:'status',unit:''},
    {
      title: "Motorized Valve Status",
      parameter: "Ct_Motor_vlv_ss",
      defaultValue: "Normal",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Cooling Tower Level Status",
      parameter: "CTW_Low_Lvl",
      defaultValue: "Normal",
      component: "Chip",
      type: "status",
      unit: "",
    },
    // {title: 'Compressor 1',parameter: 'Run_SS_1',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
    // {title: 'Compressor 2',parameter: 'Run_SS_2',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
    // {title: 'Chiller Water SP',parameter: '',defaultValue:"7",component: 'Chip',type:'controls',unit:'℃'},
    //{title: 'Flow Status',parameter: '',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
    // {title: 'Oil Pressure 1[PSIG]',parameter: 'Oil_Pre_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
    // {title: 'Oil Pressure 2[PSIG]',parameter: 'Oil_Pre_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},
    // {title: 'Oil Temperature 1[°C]',parameter: 'Oil_Temp_1',defaultValue:"0",component: 'Chip',type:'status',unit:''},
    // {title: 'Oil Temperature 2[°C]',parameter: 'Oil_Temp_2',defaultValue:"0",component: 'Chip',type:'status',unit:''},

    // {title: 'Valve',parameter: 'CH_Out_Vlv_On_Off',component: 'Chip',type:'',unit:''}
  ];

  let paramsCard = [
    {
      title: "Compressor 1",
      parameter: "Comp_Load_1",
      defaultValue: "50",
      component: "Progress Bar",
      unit: "",
      type: "",
    },
    {
      title: "Compressor 2",
      parameter: "Comp_Load_2",
      defaultValue: "50",
      component: "Progress Bar",
      unit: "",
      type: "",
    },
    {
      title: "Compressor 1",
      parameter: "Comp_Run_Hour_1",
      defaultValue: "1",
      component: "Text",
      unit: "Hrs",
      type: "",
      label1: "",
      label2: "",
    },
    {
      title: "Compressor 2",
      parameter: "Comp_Run_Hour_2",
      defaultValue: "1",
      component: "Text",
      unit: "Hrs",
      type: "",
      label1: "",
      label2: "",
    },
  ];

  let graphsCard = [
    // {index:'1',title:'Chilled Water In/Out Temperature[°C]',parameters:['CHW_In_Temp','CHW_Out_Temp']},
    {
      index: "1",
      title: "Cooling Tower IN[°C]",
      parameters: ["CT_Inlet_Temp"],
    },
    {
      index: "2",
      title: "Cooling Tower Out[°C]",
      parameters: ["CT_Outlet_Temp"],
    },
    // {
    //   index: "3",
    //   title: "Wet Bulb Temperature[°C]",
    //   parameters: ["CH_WetBulb_Temp"],
    // },
  ];

  let checkEqpAMStatusCoolngTower = [{ parameter: "CT_FAN_SS" }];

  // let graphsCard = [{index:'1',title:'Chilled Water Leaving Temperature',parameters:['CWH_ST','CWH_RT']}, {index:'2',title:'Chilled Water Entry Temperature',parameters: ['CndW_HST','CndW_HRT']}]

  return (
    <>
      <GLCPMEquipmentType1
        initialState={initialState}
        initialState1={initialState1}
        checkEqpAMStatusChiller={checkEqpAMStatusCoolngTower}
        role_id={role_id}
        device="Cooling Tower"
        eqpType={["NONGL_SS_COOLING_TOWER"]}
        imageParams={imageParams}
        controlsCard={controlsCard}
        paramsCard={paramsCard}
        //controlsCardLeft1={controlsCardLeft1}
        //controlsCardLeft2={controlsCardLeft2}
        graphsCard={graphsCard}
      />
      {/* <GLCPMEquipmentType1 title={sample} eqpType="AHU"/> */}
    </>
  );
}

export default GlCoolingTower;
