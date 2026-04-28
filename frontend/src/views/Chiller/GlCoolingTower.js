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
    // {
    //   backgroundColor: "grey",
    //   title: "Fan Speed",
    //   parameter: "CT_Var_Fan_1_Motor_Nominal_Speed",
    //   showWhenPresent: true,
    //   coordinates: [304.61, 507.44],
    //   unit: "rpm",
    //   tooltipDirection: "center",
    //   // minRange: "25",
    //   // maxRange: "32",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Fan Speed",
    //   parameter: "par_fan_speed_00",
    //   showWhenPresent: true,
    //   coordinates: [304.61, 507.44],
    //   unit: "rpm",
    //   tooltipDirection: "center",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Fan-3 Speed",
    //   parameter: "CT_Var_Fan_3_Motor_Nominal_Speed",
    //   showWhenPresent: true,
    //   // coordinates: [248.55, 506.44],
    //   coordinates: [157, 507.44],
    //   unit: "rpm",
    //   tooltipDirection: "center",
    //   // minRange: "25",
    //   // maxRange: "32",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Motor-1 Power",
    //   parameter: "CT_Var_Fan_1_Motor_Power",
    //   showWhenPresent: true,
    //   coordinates: [357.66, 164.78],
    //   // unit: "Hz",
    //   tooltipDirection: "center",
    //   // minRange: "25",
    //   // maxRange: "32",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Motor-2 Power",
    //   parameter: "CT_Var_Fan_2_Motor_Power",
    //   showWhenPresent: true,
    //   // coordinates: [157.82, 498],
    //   coordinates: [291.76, 164.78],
    //   // unit: "Hz",
    //   tooltipDirection: "center",
    //   // minRange: "25",
    //   // maxRange: "32",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Motor-3 Power",
    //   parameter: "CT_Var_Fan_3_Motor_Power",
    //   showWhenPresent: true,
    //   // coordinates: [248.55, 506.44],
    //   coordinates: [223, 164.78],
    //   // unit: "Hz",
    //   tooltipDirection: "center",
    //   // minRange: "25",
    //   // maxRange: "32",
    // },
    //  {
    //    backgroundColor: "grey",
    //    title: "Cooling Tower Out",
    //    parameter: "CT_Var_Fan_3_Actual_Speed",
    //    coordinates: [170.0, 430.0],
    //    unit: "℃",
    //    tooltipDirection: "right",
    //    minRange: "20",
    //    maxRange: "28",
    //  },
    //  {
    //    backgroundColor: "grey",
    //    title: "Fan-1 speed",
    //    parameter: "CT_Var_Fan_3_Actual_Speed",
    //    coordinates: [269.5, 325.4],
    //    unit: "A",
    //    tooltipDirection: "left",
    //    minRange: "5",
    //    maxRange: "25",
    //  },
    //  {
    //    backgroundColor: "grey",
    //    title: "Fan-2 speed",
    //    parameter: "CT_Var_Fan_3_Actual_Speed",
    //    coordinates: [317.2, 402.4],
    //    unit: "Hz",
    //    tooltipDirection: "bottom",
    //    minRange: "45",
    //    maxRange: "60",
    //  },
    //  {
    //    backgroundColor: "grey",
    //    title: "Fan-3 speed",
    //    parameter: "CT_Var_Fan_3_Actual_Speed",
    //    coordinates: [352.0, 465.4],
    //    unit: "Hz",
    //    tooltipDirection: "bottom",
    //    minRange: "45",
    //    maxRange: "60",
    //  },
    // {backgroundColor:'grey',title: 'CW',parameter :'CH_On_Off', coordinates: [186.29,113.20], unit:'℃', tooltipDirection:'bottom',minRange:'',maxRange:''},
    // {backgroundColor:'grey',title: 'Valve status',parameter :'CH_AM_SS', coordinates: [170.32,476.28], unit:'', tooltipDirection:'bottom',minRange:'',maxRange:''},
  ];

  let controlsCardLeft1 = [
    {
      title: "Fan Frequency",
      parameter: "sts_fan_frequency_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "Hz",
    },
    {
      title: "Fan Average Current",
      parameter: "par_avg_current_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " A",
    },
    {
      title: "Fan Average Power",
      parameter: "par_avg_power_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " kW",
    },
    {
      title: "Fan Energy",
      parameter: "par_energy_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " kWh",
    },
    {
      title: "Fan Speed",
      parameter: "par_fan_speed_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " rpm",
    },
    
    {
      title: "Fan Voltage",
      parameter: "par_avg_voltage_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " V",
    },
  ];
  let controlsCardLeft2 = [
    // {
    //   title: "Fan 2 Frequency",
    //   parameter: "par_fan_frequency_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "Hz",
    // },
    // {
    //   title: "Fan 2 Average Current",
    //   parameter: "par_fan_avg_current_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "A",
    // },
    // {
    //   title: "Fan 2 Average Power",
    //   parameter: "par_fan_avg_power_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "kW",
    // },
    // {
    //   title: "Fan 2 Energy",
    //   parameter: "par_fan_energy_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "kWh",
    // },
    // {
    //   title: "Fan 2 Speed",
    //   parameter: "par_fan_speed_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "rpm",
    // },
    // {
    //   title: "Fan 1 Alert",
    //   parameter: "alm_fan_02",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "kWh",
    // },
  ];

  let controlsCardLeft3 = [
    // {
    //   title: "CT Var Fan 3 Hand",
    //   parameter: "CT_Var_Fan_3_Hand_on",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
    // {
    //   title: "CT Var Fan 3 Auto",
    //   parameter: "CT_Var_Fan_3_Auto_on",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
    // {
    //   title: "CT Var Fan 3 Motor Volt",
    //   parameter: "CT_Var_Fan_3_Motor_Volt",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "V",
    // },
    // {
    //   title: "CT Var Fan 3 Motor Freq",
    //   parameter: "CT_Var_Fan_3_Motor_Freq",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "Hz",
    // },
    // {
    //   title: "CT Var Fan 3 Motor Current",
    //   parameter: "CT_Var_Fan_3_Motor_Current",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "A",
    // },
    // {
    //   title: "CT Var Fan 3 Motor Nominal Speed",
    //   parameter: "CT_Var_Fan_3_Motor_Nominal_Speed",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "rpm",
    // },
    // {
    //   title: "CT Var Fan 3 Operating Hrs",
    //   parameter: "CT_Var_Fan_3_Operating_Hrs",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
    // {
    //   title: "CT Var Fan 3 Running Hrs",
    //   parameter: "CT_Var_Fan_3_Running_Hrs",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
    // {
    //   title: "CT Var Fan 3 Motor Power",
    //   parameter: "CT_Var_Fan_3_Motor_Power",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
  ];

  let controlsCard = [
    // {title: 'Chiller',parameter: 'CPM_AM_Status',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON'},
    {
      title: "Cooling Tower Fan",
      parameter: "cmd_on_off_00",
      defaultValue: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
    },
    {
      title: "Cooling Tower Inlet Valve Position",
      parameter: "cmd_vlv_on_off_00",
      defaultValue: "",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
    },
    {
      title: "Trip Status",
      parameter: "alm_trip_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      section: "Trip Status",
      unit: "",
    },
    
    {
      title: "Fan Mode",
      parameter: "sts_auto_manual_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    
    {
      title: "Run Status",
      parameter: "sts_on_off_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: "",
    },
    {
      title: "Level Status",
      parameter: "sts_level_switch_high_00",
      parameterLow: "sts_level_switch_low_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Inlet Valve-1 Status",
      parameter: "sts_vlv_on_off_01",
      defaultValue: "",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: "",
    },
    {
      title: "Inlet Valve-2 Status",
      parameter: "sts_vlv_on_off_02",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Command Fan Frequency",
      parameter: "cmd_fan_frequency_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      section: "Fan Status",
      unit: " Hz",
    },
    
    {
      title: "Run Hours",
      parameter: "par_run_hours_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    // {
    //   title: "Wet Bulb Temp[°C]",
    //   parameter: "CH_WetBulb_Temp",
    //   defaultValue: "7",
    //   component: "Chip",
    //   typeOf: "controls",
    //   unit: "℃",
    // },
    // {
    //   title: "Condenser Water Set Point",
    //   parameter: "CHW_Setpoint",
    //   defaultValue: "7",
    //   component: "Set Operator",
    //   typeOf: "controls",
    //   unit: "℃",
    // },
    // {
    //   title: "Hand ON",
    //   parameter: "CT_Var_Fan_1_Hand_on",
    //   defaultValue: "Inactive",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },
    // {
    //   title: "Auto ON",
    //   parameter: "CT_Var_Fan_1_Auto_on",
    //   defaultValue: "Inactive",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },

    // {
    //   title: "Operating Hours",
    //   parameter: "CT_Var_Fan_Operating_Hrs",
    //   defaultValue: "0",
    //   component: "Chip",
    //   type: "status",
    //   unit: "",
    // },

    // { title: "Fan Status", type: "status" },

    // {
    //   title: "Fan-2",
    //   parameter: "CT_Var_FAN_2_On_Off_SS",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   section: "Fan Status",
    //   unit: "",
    // },
    // {
    //   title: "Fan-3",
    //   parameter: "CT_Var_FAN_3_On_Off_SS",
    //   defaultValue: "Off",
    //   component: "Chip",
    //   type: "status",
    //   section: "Fan Status",
    //   unit: "",
    // },

    //{title: 'Fan-2',parameter: 'CH_On_Off_SS',defaultValue:"Off",component: 'Chip',type:'status',unit:''},
    // { title: "Trip Status", type: "status" },

    // {
    //   title: "Fan-2",
    //   parameter: "CT_Var_FAN_2_Trip_SS_Alarm",
    //   defaultValue: "Normal",
    //   component: "Chip",
    //   type: "status",
    //   section: "Trip Status",
    //   unit: "",
    // },
    // {
    //   title: "Fan-3",
    //   parameter: "CT_Var_FAN_3_Trip_SS_Alarm",
    //   defaultValue: "Normal",
    //   component: "Chip",
    //   type: "status",
    //   section: "Trip Status",
    //   unit: "",
    // },
    //{title: 'Fan-2',parameter: 'CH_Trip_SS',defaultValue:"Normal",component: 'Chip',type:'status',unit:''},

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
  //console.log("CHECK FAN PARAM", props.title, props.parameter, props.value);

  let paramsCard = [
    {
      title: "Compressor 1",
      parameter: "Comp_Load_1",
      defaultValue: "",
      component: "Progress Bar",
      unit: "",
      type: "",
    },
    {
      title: "Compressor 2",
      parameter: "Comp_Load_2",
      defaultValue: "",
      component: "Progress Bar",
      unit: "",
      type: "",
    },
    {
      title: "Compressor 1",
      parameter: "Comp_Run_Hour_1",
      defaultValue: "",
      component: "Text",
      unit: "Hrs",
      type: "",
      label1: "",
      label2: "",
    },
    {
      title: "Compressor 2",
      parameter: "Comp_Run_Hour_2",
      defaultValue: "",
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
      title: "Voltage[V]",
      parameters: ["par_avg_voltage_00"],
    },
    {
      index: "2",
      title: "Motor Current[A]",
      parameters: ["par_avg_current_00"],
    },
    {
      index: "3",
      title: "Motor Power[kW]",
      parameters: ["par_avg_power_00"],
    },
  ];

  let checkEqpAMStatusCoolngTower = [{ parameter: "sts_fan_auto_manual_01" }];


  return (
    <>
      <GLCPMEquipmentType1
        initialState={initialState}
        initialState1={initialState1}
        checkEqpAMStatusChiller={checkEqpAMStatusCoolngTower}
        role_id={role_id}
        device="Cooling Tower"
        eqpType={"NONGL_SS_COOLING_TOWER"}
        imageParams={imageParams}
        controlsCard={controlsCard}
        paramsCard={paramsCard}
        controlsCardLeft1={controlsCardLeft1}
        controlsCardLeft2={controlsCardLeft2}
        controlsCardLeft3={controlsCardLeft3}
        graphsCard={graphsCard}
      />
      {/* <GLCPMEquipmentType1 title={sample} eqpType="AHU"/> */}
    </>
  );
}

export default GlCoolingTower;
