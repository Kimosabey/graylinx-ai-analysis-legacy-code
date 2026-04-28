import React, { useEffect, useState } from "react";
import GLEquipmentType2 from "./GlEquipmentType2";


function GlSubstationFan(props) {
let sample =  [{param:"SubE_Fan_On_Off",title:"Fan start/stop control",type:'write'},{param:"SubE_Opn_SS",title:"Operating status",type:'read'},{param:"SubE_ZAT",title: "Room temperature",type:'read'},{param:"SubE_Error_Alarm",title:"error alarm",type:'read'}]
  return (
    <>
    {props.location.state!=null ?
        <GLEquipmentType2 heading={sample} via='LandingPage' floorId={props.location.state.floorId} floorName={props.location.state.floorName} devId={props.location.state.data} devName={props.location.state.name} eqpType="SS_SUBE_FAN"/>
          :
          <GLEquipmentType2 heading={sample} via='Sidebar' eqpType="SS_SUBE_FAN"/>
        }
    </>
    // <GLEquipmentType2 heading={sample} eqpType="SS_SUBE_FAN"/>
  );
}

export default GlSubstationFan;
