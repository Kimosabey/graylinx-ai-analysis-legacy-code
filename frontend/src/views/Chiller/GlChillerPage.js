import React, { useEffect, useState } from "react";
import GLCPMEquipmentType1 from "./GlCPMEqpType1";
import api from "../../api";

function GlChiller(props) {
  // const initialState = props.location!= null ? props.location.state.name : localStorage.getItem("deviceName");
  // const initialState1 = props.location != null ? props.location.state.data : localStorage.getItem("deviceID");
  // const role_id = localStorage.getItem("roleID");
  const initialState =
    props.location?.state?.name || localStorage.getItem("deviceName");
  const initialState1 =
    props.location?.state?.data || localStorage.getItem("deviceID");
  console.log("initialState1", initialState1);
  const role_id = localStorage.getItem("roleID");
  const [chillerExtraParams, setChillerExtraParams] = useState([]);
  const [transformedExtraParams, setTransformedExtraParams] = useState({});
  console.log("props for glahuuuuu", localStorage.getItem("deviceName"));
  useEffect(() => {
    api.floor.getChillerExtraParameters().then((res) => {
      console.log("res for chiller extra params", res);
      const data = res.filter((re) => re.ss_id === initialState1);
      setChillerExtraParams(data);

      // Transform array to object
      const transformed = data.reduce((acc, item) => {
        acc[item.metric_id] = item.metric_value;
        return acc;
      }, {});
      setTransformedExtraParams(transformed);
      console.log("Transformed extra params:", transformed);
    });
  }, [initialState1]);
  console.log("Chiller params data:", chillerExtraParams);
  // Check if CH_kW_per_TR has a value
  let imageParams = [
    {
      backgroundColor: "grey",
      title: "Evaporator Out",
      parameter: "sts_evap_leaving_temp_00",
      coordinates: [315.0, 62.9],
      //[327.1, 181],
      unit: "℃",
      tooltipDirection: "left",
      // minRange: "10",
      // maxRange: "14",
    },
    {
      backgroundColor: "grey",
      title: "Discharge Pressure",
      parameter: "par_discharge_pressure_00",
      coordinates: [150, 655.8],
      unit: "kPa",
      tooltipDirection: "right",
      // minRange: "25",
      // maxRange: "35",
    },
    {
      backgroundColor: "grey",
      title: "Discharge Temperature",
      parameter: "par_discharge_temp_00",
      coordinates: [233.9, 655.8],
      unit: "℃",
      tooltipDirection: "right",
      // minRange: "25",
      // maxRange: "35",
    },
    // {
    //   backgroundColor: "grey",
    //   title: "CDW Out",
    //   parameter: "CDW_Out_Temp",
    //   coordinates: [239.6, 206],
    //   unit: "℃",
    //   tooltipDirection: "left",
    //   minRange: "30",
    //   maxRange: "40",
    // },

    // {
    //   backgroundColor: "grey",
    //   title: "Suc pre",
    //   parameter: "PRESSURE_SP_A",
    //   coordinates: [330.6, 338.0],
    //   unit: "bar",
    //   tooltipDirection: "left",
    //   // minRange: "2",
    //   // maxRange: "5",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Oil Pre",
    //   parameter: "PRESSURE_DOP_A",
    //   coordinates: [334.5, 344.0],
    //   unit: "bar",
    //   tooltipDirection: "right",
    //   // minRange: "1",
    //   // maxRange: "4",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Dis Pre",
    //   parameter: "PRESSURE_DP_A",
    //   coordinates: [377.9, 326],
    //   unit: "bar",
    //   tooltipDirection: "left",
    //   // minRange: "10",
    //   // maxRange: "20",
    // },

    // {
    //   backgroundColor: "grey",
    //   title: "CW Flow",
    //   parameter: "CWH_Flow",
    //   coordinates: [274.8, 380.0],
    //   unit: "m³/h",
    //   tooltipDirection: "bottom",
    //   // minRange: "10",
    //   // maxRange: "30",
    // },

    {
      backgroundColor: "grey",
      title: "Condenser In",
      parameter: "par_cond_entering_temp_00",
      coordinates: [235, 62.9],
      //[373.1, 517],
      unit: "℃",
      tooltipDirection: "left",
      // minRange: "50",
      // maxRange: "120",
    },

    {
      backgroundColor: "grey",
      title: "Suction Pressure",
      parameter: "par_suction_pressure_00",
      coordinates: [317.9, 655.8],
      unit: "kPa",
      tooltipDirection: "right",
      // minRange: "50",
      // maxRange: "120",
    },
    // {
    //   backgroundColor: "grey",
    //   title: "Compressor Load ",
    //   parameter: "par_comp_percent_load_00",
    //   coordinates: [311.0, 588],
    //   unit: "%",
    //   tooltipDirection: "right",
    //   // minRange: "50",
    //   // maxRange: "120",
    // },
    // {
    //   backgroundColor: "grey",
    //   title: "Evaporator Flow",
    //   parameter: "Flow_Meter_Evas",
    //   coordinates: [148.46, 517],
    //   unit: "m³/h",
    //   tooltipDirection: "right",
    //   // minRange: "50",
    //   // maxRange: "120",
    // },
    {
      backgroundColor: "grey",
      title: "Evaporator In",
      parameter: "par_evap_entering_temp_00",
      coordinates: [400.0, 62.9],
      unit: "℃",
      tooltipDirection: "left",
      // minRange: "50",
      // maxRange: "120",
    },
    {
      backgroundColor: "grey",
      title: "Oil Pressure",
      parameter: "par_comp_oil_pressure_00",
      coordinates: [398.0, 655.8],

      unit: "kPa",
      tooltipDirection: "right",
      // minRange: "50",
      // maxRange: "120",
    },
    {
      backgroundColor: "grey",
      title: "Condenser Out",
      parameter: "par_cond_leaving_temp_00",
      coordinates: [149.6, 62.9],
      // [311.0, 517],
      unit: "℃",
      tooltipDirection: "left",
      // minRange: "50",
      // maxRange: "120",
    },
    
  ];

  let controlsCard = [
    // {title: 'Chiller',parameter: 'CPM_AM_Status',component: 'Switch Selector',unit:'',type:'OnOff',label1:'OFF',label2:'ON'},
    {
      title: "Chiller",
      parameter: "cmd_on_off_00",
      parameter2: "",
      defaultValue: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
    },
    
    // {
    //   title: "Evaportator Valve",
    //   parameter: "CH_Out_Vlv_On_Off",
    //   defaultValue: "",
    //   component: "Switch Selector",
    //   typeOf: "controls",
    //   unit: "",
    //   type: "OnOff",
    //   label1: "OFF",
    //   label2: "ON",
    // },
    // {
    //   title: "Condenser Valve",
    //   parameter: "CH_Out_Vlv_On_Off",
    //   defaultValue: "",
    //   component: "Switch Selector",
    //   typeOf: "controls",
    //   unit: "",
    //   type: "OnOff",
    //   label1: "OFF",
    //   label2: "ON",
    // },
    // {
    //   title: "Motorized Valve Position",
    //   type: "OnOff",
    //   typeOf: "controls",
    // },
    {
      title: "Condenser Valve",
      parameter: "cmd_cond_vlv_on_off_00",
      parameter2: "cmd_cond_vlv_on_off_00",
      defaultValue: "",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
    },
    {
      title: "Evaporator Valve",
      parameter: "cmd_evap_vlv_on_off_00",
      parameter2: "cmd_evap_vlv_on_off_00",
      defaultValue: "",
      component: "Switch Selector",
      typeOf: "controls",
      unit: "",
      type: "OnOff",
      label1: "OFF",
      label2: "ON",
    },
    {
      title: "Chilled Water Leaving Setpoint",
      parameter: "cmd_evap_leaving_temp_00",
      parameter2: "cmd_evap_leaving_temp_00",
      defaultValue: "",
      component: "Set Operator",
      typeOf: "controls",
      unit: "℃",
      roundTo: 0,
      
    },
    {
      title: "Chiller Mode",
      parameter: "sts_auto_manual_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Chiller Status",
      parameter: "sts_on_off_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Trip Status",
      parameter: "alm_trip_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "% FLA",
      parameter: "par_comp_percent_load_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Alarm Fault",
      parameter: "alm_fault_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Chiller Run Hours",
      parameter: "rh_cumulative",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: " Comp run Hours",
      parameter: "par_comp_run_hrs_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: "Frequency",
      parameter: "par_vsd_frequency_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " Hz",
    },
    {
      title: "Current",
      parameter: "par_avg_current_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: " A",
    },
    {
      title: "Evaporator Valve Status",
      parameter: "sts_evap_vlv_on_off_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
     {
      title: "Condenser Valve Status",
      parameter: "sts_cond_vlv_on_off_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      // title: "Flow Status Liquid",
      title: (
        <>
          Flow Switch
          <br />
          Evaporator
        </>
      ),
      parameter: "sts_evap_flow_00",
      parameter2: "",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
    {
      title: (
        <>
          Flow Switch
          <br />
          Condenser
        </>
      ),
      parameter: "sts_cond_flow_00",
      defaultValue: "",
      component: "Chip",
      type: "status",
      unit: "",
    },
  ];

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
      title: "Evaporator In/Out Temperature[°C]",
      parameters: ["par_evap_entering_temp_00", "sts_evap_leaving_temp_00"],
    },
    {
      index: "2",
      title: "Condenser In/Out Temperature[°C]",
      parameters: ["par_evap_entering_temp_00", "par_cond_leaving_temp_00"],
    },
    {
      index: "3",
      title: "Compressor Current",
      parameters: ["par_avg_current_00"],
    },
  ];

  let checkEqpAMStatusChiller = [{ parameter: "sts_auto_manual_00" }];

  // let graphsCard = [{index:'1',title:'Chilled Water Leaving Temperature',parameters:['CWH_ST','CWH_RT']}, {index:'2',title:'Chilled Water Entry Temperature',parameters: ['CndW_HST','CndW_HRT']}]

  return (
    <>
      <GLCPMEquipmentType1
        initialState={initialState}
        initialState1={initialState1}
        checkEqpAMStatusChiller={checkEqpAMStatusChiller}
        role_id={role_id}
        device="Chiller"
        eqpType="NONGL_SS_CHILLER"
        imageParams={imageParams}
        chillerExtraParams={transformedExtraParams}
        chillerExtraParamsArray={chillerExtraParams}
        controlsCard={controlsCard}
        paramsCard={paramsCard}
        // controlsCardLeft1={controlsCardLeft1}
        // controlsCardLeft2={controlsCardLeft2}
        graphsCard={graphsCard}
      />
      {/* <GLCPMEquipmentType1 title={sample} eqpType="AHU"/> */}
    </>
  );
}

export default GlChiller;
