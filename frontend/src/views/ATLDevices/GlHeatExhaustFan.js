import React, { useEffect, useState } from "react";
import GLEquipmentType2 from "./GlEquipmentType2";


function GlHeatExhaustFan(props) {
  // let sample = [{param:"HTE_ZAT",title:"Room temperature",type:'read'},{param:"HTE_Error_Alarm",title:"error alarm",type:'read'},{param:"HTE_On_Off",title: "Fan start/stop control",type:'write'},{param:"HTE_Opn_SS",title:"Operating status",type:'read'}]
  let sample = [{param:"",title:"",type:'Image'},{param:"HTE_On_Off",title: "Temperature SP",type:'read'},{param:"HTE_Opn_SS",title:"Device Mode",type:'read'},{param:"HTE_ZAT",title:"Room temperature",type:'read'}]
  
  return (
    <>
    {props.location.state!=null ?
        <GLEquipmentType2 heading={sample} via='LandingPage' floorId={props.location.state.floorId} floorName={props.location.state.floorName} devId={props.location.state.data} devName={props.location.state.name} eqpType="SS_HTE_FAN"/>
          :
          <GLEquipmentType2 heading={sample} via='Sidebar' eqpType="SS_HTE_FAN"/>
        }
    </>
    // <GLEquipmentType2 heading={sample} eqpType="SS_HTE_FAN"/>
    );
  }

export default GlHeatExhaustFan;
