// import React, { useEffect } from 'react'
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
// import  CardContent from '@material-ui/core/CardContent';
// import LuxIcon from "../../assets/img/dark.svg"
// import HumIcon from "../../assets/img/moist.svg"
// import TempIcon from "../../assets/img/hot.svg"
// import CardIcon from "components/Card/CardIcon.js";


// const useStyles = makeStyles(styles);

// function Area(props) {
  
//     const classes = useStyles();
//     const [ areas, setAreas ] = React.useState([])
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
//     const [zoneId,setZoneId]=React.useState(localStorage.getItem("zoneID"))
//     useEffect(() => {
//         api.dashboard.getMetricData(zoneId).then(res => {
//           setAreas(res);
//         })
//     }, [])

//     const getparamstatus=(param,value)=>{
//       switch (param){
//         case "TEMPERATURE":
//                       let s=value>=configValues.minTemp && value<=configValues.maxTemp?false:true
//                       return(s)
//                         break;
//         case "HUMIDITY":
//                   return  value<configValues.maxHum &&value>configValues.minHum ?false:true
//                                 break;                 
//        case "LUMINOUSITY":
//                   return   value<configValues.maxLux &&value>configValues.minLux ?false:true
//                                               break; 
//       }
//     }
  
//     const onClickIssue=(id,name,param)=>{
//       props.changeContext("zone")
//       props.history.push(`/admin/areas`)
//       localStorage.setItem("context","zone");
//       localStorage.setItem("zoneID",id);
//       localStorage.setItem("mapSubType",param);
//       localStorage.setItem("zoneName", name);
//     }
  
//     const getIcon=(param)=>{
//       switch (param){
//         case "TEMPERATURE": return(TempIcon)
//                             break;
//        case "HUMIDITY": return(HumIcon)
//                             break; 
//        case "LUMINOUSITY": return(LuxIcon)
//                             break;                                                                 
//       }
//     }








//   return (
//     <div>
//        <GridContainer justify="center" alignItems="center" >
//         <GridItem xs={12} sm={12} md={12} lg={12} xl={12}> 
//         <Heatmap  id={zoneId} param={props.match.params.param} />
//         </GridItem>
      
//         {/* <Hvac /> */}
      
//             {areas.map((_area, index) =>
//                      <GridItem key={index} md={3}  >
//                 <Card  key={_area.id} className={classes.hbCard}>
//                         <CardHeader color="warning" icon>
//                             <h4 className={classes.hbCardCategory}>{_area.name.toUpperCase()}</h4>
//                         </CardHeader>            
//                        {_area.parameter.length>0?
//                               _area.parameter.map((_param,pi) =>
//                              getparamstatus(_param.name,_param.value)? 
//                              <ButtonBase  onClick={() => onClickIssue(_area.id,_area.name,_param.name)} >
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


    
//   </GridContainer> 



//     </div>
//   )
// }

// export default Area