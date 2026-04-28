import React, { useEffect, useState } from "react";
import GLEquipmentType2 from "./GlEquipmentType2";


function GlHeatExhaustFan(props) {
  let sample = [{param:"HTE_AM_SS",title: "Device Mode",type:'read'},{param:"HTE_ZAT",title:"Temperature Set Point",type:'read'},{param:"HTE_Error_Alarm",title: "Status",type:'read'},{param:"HTE_ZAT",title:"Temperature",type:'read'},{param:"BRE_AM_SS",title: "Device Mode",type:'read'},{param:"BRE_Fan_On_Off",title:"Fan DPS",type:'read'},{param:"BRE_Error_Alarm",title: "Status",type:'read'},{param:"SubE_AM_SS",title: "Device Mode",type:'read'},{param:"SubE_ZAT",title:"Temperature Set Point",type:'read'},{param:"SubE_Error_Alarm",title: "Status",type:'read'},{param:"SubE_ZAT",title:"Temperature",type:'read'}
  ]
  
  return (
    <>
    {props.location.state!=null ?
        <GLEquipmentType2 heading={sample} via='LandingPage' floorId={props.location.state.floorId} floorName={props.location.state.floorName} devId={props.location.state.data} devName={props.location.state.name} eqpType="EXHAUST_FAN"/>
          :
          <GLEquipmentType2 heading={sample} via='Sidebar' eqpType="EXHAUST_FAN"/>
        }
    </>
    // <GLEquipmentType2 heading={sample} eqpType="SS_HTE_FAN"/>
    );
  }

export default GlHeatExhaustFan;
