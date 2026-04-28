// import React, { useEffect } from 'react';
// //import { navigate } from '@reach/router';
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardFooter from "components/Card/CardFooter.js";
// import { makeStyles } from '@material-ui/core/styles';
// import ButtonBase from '@material-ui/core/ButtonBase';
// // @material-ui/icons
// import api from "../../api";
// import GridItem from 'components/Grid/GridItem';
// import Grid from '@material-ui/core/Grid';
// import GridContainer from 'components/Grid/GridContainer';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import { IndeterminateCheckBoxSharp, LocalOffer, Warning } from '@material-ui/icons';
// import Info from 'components/Typography/Info';
// import CardBody from 'components/Card/CardBody';
// import { useSelector } from 'react-redux';
// import Danger from "components/Typography/Danger";
// import Heatmap from "views/Heatmap/HeatmapComponent"
// import Hvac from "views/Heatmap/hvac"
// import  CardContent from '@material-ui/core/CardContent';
// import LuxIcon from "../../assets/img/dark.svg"
// import HumIcon from "../../assets/img/moist.svg"
// import TempIcon from "../../assets/img/hot.svg"
// import CardIcon from "components/Card/CardIcon.js";
// import CustomTabs from "components/CustomTabs/CustomTabs.js";
// import Devicemap from 'views/Heatmap/Devicemap';

// const useStyles = makeStyles(styles);

// function Zones(props){
//     console.log("props----------------------------oin zones",props)
//     const classes = useStyles();
//     const [floorId,setFloorId]=React.useState(localStorage.getItem("floorID"))
//     const [ zones, setZones ] = React.useState([])
//     const buildingID = useSelector(state => state.isLogged.data.zones[0])
//     const [data, setData] = React.useState([{name: "", value: 0}, {name: "", value: 0}, {name: "", value: 0}]);
//     const [clicked,setCliked] = React.useState(false);
//     const [configValues, setConfigValues] =React.useState({
//       minTemp: 20,
//       maxTemp: 40,
//       minHum: "40",
//       maxHum: "60",
//       minLux: "200",
//       maxLux: "400",
//       // minAQI: "20",
//       // maxAQI: "2000",
//       minCo2: "0", maxCo2: "800",
//       minTvoc: "30", maxTvoc: "900",
//       minPm2_5: "0", maxPm2_5: "35",
//       minPm10: "0", maxPm10: "35",
//       minNoise: "5", maxNoise: "30"
//     })

//     const getData = () => {
//         fetch('/material-dashboard-react/data.json'
//           , {
//             headers: {
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             }
//           }
//         )
//           .then(function (response) {
//             return response.json();
//           })
//           .then(function (myJson) { 
//             setZones(myJson.floor[1].zone)
//           });
//       }
//     useEffect(() => {
//         api.dashboard.getMetricData(floorId).then(res => {
//             console.log("in zoness======",res)
//             setZones(res);
//           })
//         console.log("i am in zone======")
        
//         // api.zones.zoneList(floorId).then(res => {
//         //     console.log("......",res)
//         //     setZones(res[0].children)
//         // })
    
//     }, [])

  
//     const handleClick=(id,name)=>{
       
//         props.changeContext("zone")
//         props.history.push(`/admin/areas`)
//         localStorage.setItem("context","zone");
//         localStorage.setItem("zoneID",id);
//         localStorage.setItem("zoneName", name);
//         // setCliked(true)
//           // return <Heatmap type={param}/>
//       // return <Home/>
//       // props.history.push(`/admin/floor/d4053866-e855-4dcc-a87a-77632dd054b9/heatmap`)
//     //   props.history.push({
//     //     pathname: '/admin/floor/d4053866-e855-4dcc-a87a-77632dd054b9/heatmap',
//     //     // search: '?query=abc',
//     //     state: { detail: param }
//     // });
//   }
//   const getparamstatus=(param,value)=>{
//     switch (param){
//       case "TEMPERATURE":
//                     let s=value>=configValues.minTemp && value<=configValues.maxTemp?false:true
//                     return(s)
//                       break;
//       case "HUMIDITY":
//                 return  value<configValues.maxHum &&value>configValues.minHum ?false:true
//                               break;                 
//      case "LUMINOUSITY":
//                 return   value<configValues.maxLux &&value>configValues.minLux ?false:true
//                                             break; 
//     }
//   }

//   const onClickIssue=(id,name,param)=>{

//     console.log(id,name,param)
//     props.changeContext("zone")
//     props.history.push(`/admin/areas/${param}`)
//     localStorage.setItem("context","zone");
//     localStorage.setItem("zoneID",id);
//     localStorage.setItem("mapSubType",param);
//     localStorage.setItem("zoneName", name);
//   }

//   const getIcon=(param)=>{
//     console.log(param)
//     switch (param){
//       case "TEMPERATURE": return(TempIcon)
//                           break;
//      case "HUMIDITY": return(HumIcon)
//                           break; 
//      case "LUMINOUSITY": return(LuxIcon)
//                           break;                                                                 
//     }
//   }

//   const handleContent = (param,value) => {
//     switch (param) {
//       case "TEMPERATURE":
//         if((Math.round(value * 10)/10 > 23)|| (Math.round(value * 10)/10 < 20))
//                 return (
//                   <div>
//                   <Card onClick={handleClick(param,value)}>
//                     <CardBody>
//                         <h4 style={{display: "inline"}}>{param.toLowerCase()}</h4>
//                         {/* <h4 style={{display: "inline"}}>{value}</h4> */}
//                         <Danger hbFontStyle>HOT</Danger>
                        
//                     </CardBody>
//                   </Card>
//                   </div>
//                 )
//               else 
//                 return  <div></div> 
//         case "HUMIDITY":
//                   if((Math.round(value * 10)/10 > 50)||(Math.round(value * 10)/10 < 30))
//                   return (
//                     <div>
//                     <Card onClick={()=>handleClick(param,value)}>
//                       <CardBody>
//                           <h4 style={{display: "inline"}}>{param.toLowerCase()}</h4>
//                           {/* <h4 style={{display: "inline"}}>{value}</h4> */}
//                           <Danger hbFontStyle>MOIST</Danger>
//                       </CardBody>
//                     </Card>
                 
//                   </div>
                  
//                   )
//                   else
//                   return <div></div>
//         case "LUMINOUSITY":
//             if((Math.round(value * 10)/10 > 1000)||(Math.round(value * 10)/10 < 350))
//                  return (
//                   <div>
//                   <Card onClick={()=>handleClick(param,value)}>
//                     <CardBody>
//                         <h4 style={{display: "inline"}}>{param.toLowerCase()}</h4>
//                         <Danger hbFontStyle>BRIGHT</Danger>
//                     </CardBody>
//                   </Card>
//                 </div>
//                 ) 
//             else
//                 return  <div></div>
//         default:
//             break;
//     }
//   }

//     return(
//         <div>{props.param=="parameter"?  
//         <GridContainer justify="center" alignItems="center" direction="cloumn">
          
//         <GridItem xs={12} sm={12} md={12} lg={12} xl={12}> 
//         <Heatmap  id={floorId}  />
      
//         </GridItem>
      
      
//             {zones.map((_zone, index) =>
//                      <GridItem key={index} md={3}  >
         
//                 <Card card key={_zone.id}>
//                         <CardHeader color="warning" icon>
//                             <h4 className={classes.hbCardCategory}>{_zone.name.toUpperCase()}</h4>
//                         </CardHeader>
                   
                     
//                        {_zone.parameter.length>0?
//                               _zone.parameter.map((_param,pi) =>
//                              getparamstatus(_param.name,_param.value)? 
//                              <ButtonBase  onClick={() => onClickIssue(_zone.id,_zone.name,_param.name)} className={classes.cardAction}>
//                               <CardIcon key={pi} > 
//                                <img src={getIcon(_param.name)}  /> 
//                                </CardIcon>
//                                </ButtonBase>
//                                :<></>
//                               )
                             
//                         :
//                         <>NO DATA</>}
//                 </Card>   
//              </GridItem>
//                )}
//              </GridContainer> : props.param=='device'?<><Hvac changeContext={props.changeContext} history={props.history} /></>:<><Devicemap id={floorId} changeContext={props.changeContext} history={props.history}/></> }
               
  
//         </div>

     
//       //   <div>
//       //   <Grid container direction='column'align-items="center">
//       //   {/* <Heatmap/> */}
//       //   {zones.map((_item,i)=>
//       //   <div>
//       //     <Grid container spacing={7}>
//       //     <Grid key={i} item xs={7}>
//       //     <ButtonBase style={{width:'100%'}} onClick={() => handleClick(_item.uuid, _item.name)} className={classes.cardAction}>
//       //       <Card card key={_item.uuid} style={{flexDirection:'row'} }>
          
//       //         <h2  >{_item.name}</h2>
//       //      {/* {data.map((_data,i)=>
//       //        <Grid item xs={12} lg={6}>
//       //          <Card style={{flexDirection:'row'}}>
//       //          <div>
//       //       {handleContent(_data.name, _data.value)}
                    
                 
//       //          </div>  
//       //          </Card>
               
//       //        </Grid>
//       //      )} */}
//       //       </Card>
//       //       </ButtonBase>
//       //     </Grid>
//       //     </Grid>
          
//       //      </div>
//       //   )}
//       //   </Grid>
       
//       // </div>
//         // <GridContainer  justify="left" alignItems="left" direction="column">
//         //     {zones.map((_zone, index) =>
//         //     <GridItem key={index} xs={12} sm={6} md={3}>
//         //         <ButtonBase style={{width:'100%'}}  className={classes.cardAction}>
//         //         <Card card key={_zone.uuid}>
//         //                 <CardHeader color="warning" icon>
//         //                     <h4 className={classes.hbCardCategory}>{_zone.name.toUpperCase()}</h4>
//         //                 </CardHeader>
//         //                 <CardBody>
//         //                     {_zone.type !== "parking" &&
//         //                         <h4 style={{display: "inline"}}>{_zone.no_of_conference_rooms} Rooms</h4>
//         //                     }
//         //                 </CardBody>
                       
                        
// //                 </Card>
// //                 <CardBody>
// //                         {data.map((_data,index)=>
                        
// //                         <CardContent>
                           
// //                                 {handleContent(_data.name, _data.value)}
// //                         </CardContent>
                        
// //                         )} 
// //                    </CardBody>
// //                 </ButtonBase>
// //         </GridItem>
// //             )}
// //         </GridContainer>
//     )
//            }

//            export default Zones;
