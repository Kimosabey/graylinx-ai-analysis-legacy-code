import React, { useEffect, useState } from "react";
import GLEquipmentType2 from "./GlEquipmentType2";


function GlVentilator(props) {

  let sample = [{param:"BRE_Error_Alarm",title:"error alarm",type:'read'},{param:"BRE_AM_SS",title:"Manual/Auto state",type:'read'},{param:"BRE_Fan_On_Off",title: "Fan start/stop control",type:'write'},{param:"BRE_Opn_SS",title:"Operating status",type:'read'}]
  
  return (
    <>
    {props.location.state!=null ?
        <GLEquipmentType2 heading={sample} via='LandingPage' floorId={props.location.state.floorId} floorName={props.location.state.floorName} devId={props.location.state.data} devName={props.location.state.name} eqpType="SS_BRE_FAN"/>
          :
          <GLEquipmentType2 heading={sample} via='Sidebar' eqpType="SS_BRE_FAN"/>
        }
    </>
    // <GLEquipmentType2 heading={sample} eqpType="SS_BRE_FAN"/>
  );
}

export default GlVentilator;
