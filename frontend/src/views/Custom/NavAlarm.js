import React, { useEffect, useState } from "react";
import { useDispatch,useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';
import Card from 'components/Card/Card';
import NotificationIcon from 'assets/img/NotificationIcon';
import { Blink } from "@bdchauvette/react-blink";
import NotificationLow from 'assets/img/NotificationLow';
import tempIcon from 'assets/img/NavBArTemp.png'
import NavIcon from 'assets/img/navBarHum.png'
import { useHistory } from 'react-router-dom';
import api from '../../api';
import { redColor, yellowColor, greenColor, whiteColor, greyColor, blackColor, blueColor, hexToRgb } from "assets/jss/material-dashboard-react.js";

function NavAlarm() {
const [today, setDate] = React.useState(new Date());
const alerts = useSelector(state=>state.alarm.alarmData)
const buildingName = useSelector((state) => state.isLogged.data.building.name);
const [blink, setBlink] = React.useState(false);
const [humidity, setHumidity] = useState("");
const [temperature, setTemperature] = useState("");

const locale = 'en';
let history = useHistory();
const formatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

 const redirectToAlert = () => {
    history.push('/admin/eventsviewer')
  }

useEffect(() => { 
  api.floor.cpmGetDevData().then((res)=>{
    if (res["NONGL_SS_COMMON_HEADER"]) {
      setTemperature(
        Object.values(res["NONGL_SS_COMMON_HEADER"])[0]["Eqp_Attributes"][
          "par_out_air_temp_00"
        ].presentValue
      );
      setHumidity(
        Object.values(res["NONGL_SS_COMMON_HEADER"])[0]["Eqp_Attributes"][
          "par_out_air_humidity_00"
        ].presentValue
      );
    }
  }).catch((error)=>{
})
  if(localStorage.getItem('roleID') == '6'){
  // api.campus.weather().then(res=>{
  //   res.map((res)=>{
  //     if(res.param_id =='temperature'){
  //       setTemperature(res.param_value)
  //     }else if(res.param_id =='humidity'){
  //       setHumidity(res.param_value)
  //     }
  //   })
  // }).catch((error)=>{

  // })

}
    let ackActive = alerts.system.filter(each => {
      if (each.acknowledged === 0) {
        return each
      }
    })  
    if (ackActive.length > 0) {
      return setBlink(true)
    } else {
      return setBlink(false)
    }
  }, [alerts.system])

  useEffect(() => { 
    api.floor.cpmGetDevData().then((res)=>{
      if(res["NONGL_SS_CPM"]){
          setTemperature(Object.values(res["NONGL_SS_CPM"])[0]["Eqp_Attributes"]["AMBIENT_TEMP"].presentValue)
          setHumidity(Object.values(res["NONGL_SS_CPM"])[0]["Eqp_Attributes"]["HUMIDITY_MONITORING"].presentValue)
      }
    }).catch((error)=>{
  })
  const timer = setInterval(() => {
    api.floor.cpmGetDevData().then((res)=>{
      if(res["NONGL_SS_CPM"]){
          setTemperature(Object.values(res["NONGL_SS_CPM"])[0]["Eqp_Attributes"]["AMBIENT_TEMP"].presentValue)
          setHumidity(Object.values(res["NONGL_SS_CPM"])[0]["Eqp_Attributes"]["HUMIDITY_MONITORING"].presentValue)
      }
    }).catch((error)=>{
  })
  }, 5000);
  return () => clearInterval(timer);
}, [])

  const day = today.toLocaleDateString(locale, { weekday: 'short' });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, { month: 'long' })}\n\n`;
let currentDate = new Date();
const time = currentDate.getHours() + ":" + currentDate.getMinutes();
const formatDateTime = () => {
    const now = new Date();
 
    const time = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
 
    const day = now.toLocaleDateString("en-IN", {
      weekday: "short",
    });
 
    const date = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
    });
 
    return `${time} ${day}, ${date}`;
  };
 
  const [dateTime, setDateTime] = useState(formatDateTime());
 
  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(formatDateTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
 
  return (
   
         <Grid container xs={12} direction='row' >
          {localStorage.getItem('roleID') != '6'?<>
                  {/* <Grid xs={4}></Grid> */}
                  <Grid xs={2} style={{ marginLeft: '4px' }}>
                    {blink === false ?
                      <ButtonBase style={{ width: "100%" }} onClick={() => redirectToAlert()}>
                        <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: redColor[0] }}>
                          <Grid container xs={12} style={{ height: "35px" }}>
                            <Grid item xs={6}>
                              <NotificationIcon fillColor={blink ? redColor[0] : redColor[0]}/>
                            </Grid>
                            <Grid xs={6}>
                              {/* {console.log("alerts.length",alerts.system.length,format(new Date(), 'yyyy-MM-dd HH:mm:ss'))} */}
                              <div style={{ color: "#ffffff", 'marginTop': '10px', 'fontSize': '16px' }}>{alerts.system.length}</div>
                            </Grid>
                          </Grid>

                        </Card>
                      </ButtonBase>
                      :
                      <>
                        <Blink>
                          <ButtonBase style={{ width: "100%" }} onClick={() => redirectToAlert()}>
                            <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: redColor[0] }}>
                              <Grid container xs={12} style={{ height: "35px" }}>
                                <Grid xs={6}>
                                  <NotificationIcon fillColor={blink ? redColor[0] : "#008000"}/>
                                </Grid>
                                <Grid xs={6}>
                                  <div style={{ color: "#ffffff", 'marginTop': '10px', 'fontSize': '16px' }}>{alerts.system.length}</div>
                                </Grid>
                              </Grid>

                            </Card>
                          </ButtonBase>
                        </Blink>
                      </>
                    }
                  </Grid>

                  <Grid xs={2} style={{ marginLeft: '4px' }}>
                    <ButtonBase style={{ width: "100%" }} onClick={() => redirectToAlert()}>
                      <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: yellowColor[0] }}>
                        <Grid container xs={12} style={{ height: "35px" }}>
                          <Grid xs={6}>
                            <NotificationLow />
                          </Grid>
                          <Grid xs={6}>
                            <div style={{ color: "#ffffff", 'marginTop': '10px', 'fontSize': '16px' }}>{alerts.solution.length}</div>
                          </Grid>
                        </Grid>

                      </Card>
                    </ButtonBase>
                  </Grid>

                      
                  <Grid xs={3} style={{ marginLeft: '4px' }}>
                    <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: "#f2f2f7" }}>
                      <Grid container xs={12} style={{ height: "35px" }}>
                        <Grid xs={2}>
                          <div>
                            <img src={tempIcon} alt='temp' style={{ "marginTop": "7px", "marginLeft": "11px" }} />
                          </div>
                        </Grid>
                        <Grid xs={4}>
                          <div style={{ color: "#000", marginTop: "4px" }}>{formatter.format(temperature)}°C</div>
                        </Grid>
                        <Grid xs={2}>
                          <div>
                            <img src={NavIcon} alt='temp' style={{ "marginTop": "7px", "marginLeft": "11px" }} />
                          </div>

                        </Grid>
                        <Grid xs={4}>
                          <div style={{ color: "#000", marginTop: "4px" }}>{formatter.format(humidity)}%</div>
                        </Grid>
                      </Grid>

                    </Card>
                  </Grid>

                  </>:<></>}
                  <Grid xs={3} style={{ marginLeft: localStorage.getItem('roleID') != '6'? '4px':'48vh',marginTop: localStorage.getItem('roleID') == '6'?"-2vh":""  }}>
                    <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: "#f2f2f7" }}>
                      <Grid container xs={12} style={{ height: "35px" }}>
                        <Grid xs={12}>
                          <div style={{display:'flex',justifyContent:'center', whiteSpace: 'nowrap',fontSize:"2vh",marginTop:'0.5vh' }}> {dateTime}</div>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  {/* <Grid xs={3} style={{ marginLeft: '4px' }}>
                    <Card style={{ marginTop: "0px", marginBottom: "0px", backgroundColor: "#f2f2f7" }}>
                      <Grid container xs={12} style={{ height: "35px" }}>
                      <div style={{ "marginTop": "3px", "marginLeft": "5vh", whiteSpace: 'nowrap',fontSize:"1.5vh"}}>{buildingName}</div>
                        
                      </Grid>
                    </Card>
                  </Grid> */}

                </Grid>
    
  )
}

export default NavAlarm