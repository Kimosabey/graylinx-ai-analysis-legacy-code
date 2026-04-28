// import React, { useEffect } from 'react'
// import api from '../../api';
// import { Chip, makeStyles,Typography,CardMedia,CardContent } from '@material-ui/core';
// import Grid from '@material-ui/core/Grid'; 
// import GridContainer from 'components/Grid/GridContainer.js';
// import GridItem from 'components/Grid/GridItem.js';
// import FormControl from '@material-ui/core/FormControl';
// import InputLabel from '@material-ui/core/InputLabel';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import ButtonBase from '@material-ui/core/ButtonBase';
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardBody from 'components/Card/CardBody';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// const useStyles1=makeStyles(styles);
// const useStyles = makeStyles((theme) => ({
//     bounds: {
//         [theme.breakpoints.up("md")]:
//             { height: "520px", marginTop: "3%" }
//     },
//     media: {
//         minHeight: "200px"
//     },
//     loader:{
//         size:"40px",
//         color:"#26c6da"
//     },
//     style:{
//          display: "flex",
//          marginLeft: "28%" ,
//         [theme.breakpoints.down('xs')]:
//             {marginLeft:'1%'} 
//     },
//     root:{
//       display:"flex"
//     },
//     formControl: {
//         width: 240,
//         cursor:'pointer',
//         [theme.breakpoints.down('xs')]:
//             {textAlign:"left"},
//         [theme.breakpoints.down('sm')]:
//             {textAlign:"left"},
//     },
//     list:{
//         textAlign:"end",
//         cursor:'pointer',
//         [theme.breakpoints.down('xs')]:
//             {textAlign:"left"},
//         [theme.breakpoints.down('sm')]:
//             {textAlign:"left"},
//     }
// }));

// function AhuDevices(props) {
//     const classes = useStyles();
//     const classes1=useStyles1();
//     const [floorName, setFloorName] = React.useState("")
//     const [floors,setFloors] =React.useState([])
//     const [floorID,setFloorID] = React.useState('')
//     const [selectedIndex, setSelectedIndex] = React.useState(0);
//     const [ahuDevices,setAhuDevices]=React.useState([])
   

//     useEffect(() => {
//         localStorage.removeItem("floorID");
//         localStorage.removeItem("floorName");
//         localStorage.removeItem("zoneID");
//         localStorage.removeItem("zoneName");
//         api.floor.floorData(localStorage.getItem("buildingID")).then(res => {
//             res.sort((a, b) => {
//                        let fa = a.name.toLowerCase(),
//                        fb = b.name.toLowerCase();
//                           if (fa < fb) {
//                                     return -1;
//                                         }
//                           if (fa > fb) {
//                                     return 1;
//                                        }
//                                     return 0;
//                                  });
//             setFloors(res)
//             { floorID === "" ? 
//                 setFloorID(res[0].id)
//                 :
//                 setFloorID(floorID)
//                 localStorage.setItem('controlFloorID',floorID)
//             }
//             { floorName === "" ? 
//                 setFloorName(res[0].name)
//                 :
//                 setFloorName(floorName)
//                 localStorage.setItem('contolFloorName',floorName)
//             }
//             api.floor.getAhuInFloor(floorID).then(resDevices=>{
//                 setAhuDevices(resDevices)
//             })




//         })
//     }, [floorName])

//     const handleMenuItemClick = (id,name,type,index) => {
//         setSelectedIndex(index);
//         localStorage.setItem("controlFloorID",id);
//         setFloorID(id)
//         localStorage.setItem("contolFloorName", name);
//         setFloorName(name)
//     };


//     const onClickDevice=(id,name)=>{
//         localStorage.setItem("deviceID",id);
//         localStorage.setItem("deviceName",name);
//         props.history.push(`/admin/device`)
//     }

//   return (
//     <div >
//     <GridContainer   justify="center" >
//     <GridItem xs={9} md={9} > 
//     <GridContainer  justify="center" alignItems="center">
//     {ahuDevices.map((_ahu, index) =>
//         <GridItem xs={12} sm={12} md={4} lg={4} xl={4}>
//         <ButtonBase style={{width:'100%'}} onClick={() => onClickDevice(_ahu.deviceId,_ahu.deviceName)} className={classes1.cardAction}>
//                 <Card  key={_ahu.deviceId}>
//                         <CardHeader color="warning" icon>
//                             <h4 className={classes1.hbCardCategory}>{_ahu.deviceName.toUpperCase()}</h4>
//                         </CardHeader>
                       
//                 </Card>
//                 </ButtonBase>

//         </GridItem>
//     )}
//     </GridContainer>
//      </GridItem>
//     <GridItem xs={3} md={3} >  <FormControl className={classes.formControl}>
//         <InputLabel shrink id="demo-simple-select-label">Select a Floor</InputLabel>
//         <Select
//         labelId="demo-simple-select-label"
//         id="demo-simple-select"
//         value={floorName}
//         displayEmpty={true}
//         >
//         {floors.map((_floor,index) =>
//             <MenuItem key={_floor.id} value={_floor.name} 
//                 selected={index === selectedIndex} 
//                 button onClick={(event) => handleMenuItemClick(_floor.id,_floor.name,_floor.type,index)}>
//                 {_floor.name}
//             </MenuItem> 
//         )}
//         </Select>
//      </FormControl></GridItem>
   
//     </GridContainer>
   



// </div>

//   )
// }

// export default AhuDevices