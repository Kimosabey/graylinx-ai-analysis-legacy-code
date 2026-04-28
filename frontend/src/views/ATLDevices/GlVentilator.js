import React, { useEffect, useState } from "react";
import GLEquipmentType2 from "./GlEquipmentType2";


function GlVentilator(props) {
  let sample = [{param:"VEN_AM_SS",title:"Device Mode",type:'read'},{param:"VEN_ZAT",title:"Temperature Set Point",type:'read'},{param:"VEN_Error_Alarm",title: "Status",type:'read'},{param:"VEN_ZAT",title:"Temperature",type:'read'}]
  // let sample = [{param:"VEN_AM_SS",title:"Device Mode",type:'read'},{param:"VEN_ZAT",title:"Temperature Set Point",type:'write'},{param:"VEN_Error_Alarm",title: "Status",type:'read'},{param:"VEN_ZAT",title:"Temperature",type:'read'}]
  return (
    <>
    {props.location.state!=null ?
        <GLEquipmentType2 heading={sample} via='LandingPage' floorId={props.location.state.floorId} floorName={props.location.state.floorName}
        //  devId={props.location.state.data} devName={props.location.state.name}
          eqpType="SS_VENTILATOR_1"/>
          :
          <GLEquipmentType2 heading={sample} via='Sidebar' eqpType="SS_VENTILATOR_1"/>
        }
    </>
    // <GLEquipmentType2 heading={sample} floorId={props.location.state!=null?props.location.state.floorId:''} floorName={props.location.state!=null?props.location.state.floorName:''} devId={props.location.state?props.location.state.data:''} devName={props.location.state?props.location.state.name:'s'} eqpType="SS_VENTILATOR_1"/>
  );
}

export default GlVentilator;
