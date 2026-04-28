// import React, {useRef,useEffect,useState } from 'react';
// // import ToolBar from '@material-ui/core/ToolBar';
// import IconButton from '@material-ui/core/IconButton';
// import DeleteIcon from '@material-ui/icons/Delete';
// import EditIcon from '@material-ui/icons/Edit';
// import { makeStyles } from '@material-ui/core/styles';
// //import { navigate } from '@reach/router';
// import Table from "components/Table/Table.js";
// //import Table from '@material-ui/core/Table';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import api from '../../api';
// // import EditDeleteModal from '../Components/EditDeleteModal';
// import Modal from '@material-ui/core/Modal';
// import MuiAlert from '@material-ui/lab/Alert';
// import Snackbar from '@material-ui/core/Snackbar';
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardBody from "components/Card/CardBody.js";
// import EDModal from '../EDModal';
// import CancelIcon from '@material-ui/icons/Cancel';
// import Tooltip from '@material-ui/core/Tooltip';
// import {useSelector} from 'react-redux';
// import { da } from 'date-fns/locale';
// import { Typography } from '@material-ui/core';



// const styles = {
//   cardTitleWhite: {
//       color: "#FFFFFF",
//       marginTop: "0px",
//       minHeight: "auto",
//       fontWeight: "300",
//       fontFamily: "'Helvetica'",
//       marginBottom: "3px",
//       textDecoration: "none",
//       "& small": {
//           color: "#777",
//           fontSize: "65%",
//           fontWeight: "400",
//           lineHeight: "1"
//       }
//   },
// }  
// const useStyles = makeStyles(styles);

// function getTableData(myinput = [], param_map = {}) {

//     // var param_map = { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On/off', "mode": 'VFD mode Ramp up / down', "ahu_vfd_mode": 'VFD Mode Auto/Manual', "ahu_run_status": 'AHU Run status On/off', "ahu_set_point": 'T Set Point Deg C', "ahu_in_air_temperature": 'RAT Deg C', "ahu_supply_air_temperature": 'SAT Deg C', "ahu_chilled_valve": 'ChW valve %', "ahu_trip_status": 'Trip status On/off', "ahu_filter_status": 'Filter status Off=clean' };

    
//     var myoutput = [], odata = [];
    
//     var param_ids = {}, output_ids = {}, i = 0, j = 0;
    
//     var params = Object.keys(param_map);
    
//     params.forEach((key, index) => {
    
//     param_ids[key] = i++;
    
//     });
    
//     for (i = 0; i < myinput.length; i++) {
    
//     if (output_ids[myinput[i]["id"]] === undefined) {
    
//     odata = [];
    
//     for (j = 0; j < params.length; j++) {
    
//     odata[j] = '---';
    
//     }
//     odata[param_ids['location']] = param_map['location'];
    
//     odata[param_ids['ahu_id']] = myinput[i]["name"];
    
//     output_ids[myinput[i]["id"]] = myoutput.push(odata) - 1;
    
//     } else {
    
//     myoutput[output_ids[myinput[i]["id"]]][param_ids[myinput[i]["param_id"]]] = myinput[i]["param_value"];
    
//     }
    
//     }
//     return myoutput;
    
//     }
// export default function ListBookedSeats() {
//   const classes = useStyles();
//   const [rooms, setRooms] = React.useState([]);
//   const[data,setData]=useState([]);
//   const [ahuData,setAhuData]=useState([["GrayLinx",1234,"On","Up","Auto","Off",25,27,20,85,"Off","Clean"],["GrayLinx",1234,"On","Up","Auto","Off",25,27,20,85,"Off","Clean"]]);
//   const headings= { "location": 'Location', "ahu_id": 'AHU Id', "ahu_on_off": 'Fan On Cmd On / Off', "mode": 'VFD Mode Ramp Up / Down', "ahu_vfd_mode": 'VFD Mode Auto / Manual', "ahu_run_status": 'AHU Run status On / Off', "ahu_set_point": 'T Set Point \u00b0C', "ahu_in_air_temperature": 'RAT \u00b0C', "ahu_supply_air_temperature": 'SAT \u00b0C', "ahu_chilled_valve": 'ChW Valve %', "ahu_trip_status": 'Trip Status On / Off', "ahu_filter_status": 'Filter Status Off = Clean' };
//   const [edit, setEdit] = React.useState(false);
//   const [openModal, setOpenModal] = React.useState(false);
//   const [cancel, setCancel] = React.useState(false);
//   const [formDetails, setFormDetails] = React.useState({
   
//     ss_type: "",
//     param_id: "",
//     param_value: ""
    
//   })
//   useEffect(() => {
//    api.floor.getAhu("d4053866-e855-4dcc-a87a-77632dd054b9").then(res => {
//        let a=[]
//        a=res;
//     //    console.log("response",a)
//        let arrdata=[],tdata=[]
//        a.map(_res => {
//        let  data1={},ahu1={}
     
//       data1.param_id=_res.param_id;
//       data1.param_value=_res.param_value;
//       data1.ss_type=_res.ss_type;
//       arrdata.push(data1)
      
//     //  const headings=['Location', 'AHU ID', 'Fan On Cmd On/off', 'VFD mode Ramp up / down', 'VFD Mode Auto/Manual', 'AHU Run status On/off', 'T Set Point Deg C', 'RAT Deg C', 'SAT Deg C', 'ChW valve %', 'Trip status On/off', 'Filter status Off=clean'];

//     })
//    // console.log(Object.keys(arrdata[0]));

//     setData(arrdata) 
//     setAhuData(res)
//     })
//   }, [])
// //console.log("data===========>",data)


  
  


  
  
  
//   return (
//     <div >
     
    
//       <GridContainer>
//                 <GridItem xs={10} sm={12} md={12}>
//                     <Card>
//                         {/* <CardHeader color="info">
//                             <h4 className={classes.cardTitleWhite}>Table</h4>
//                         </CardHeader> */}
//                         <CardBody>
                       
                       
//                         {/* <Table
//                                 tableHeaderColor="info"
//                                 // tableHead={[r.param_id]}
//                                 tableHead={["name","param_id", "param_value"]}

//                                 tableData={data.map((row,index) => (
                                    
//                                     [
//                                     row.ss_type,
//                                     row.param_id,
//                                     row.param_value,
                                   
//                                     ]
//                                 ))}
//                             />  */}
//                             {/* {console.log("===========",Object.keys(data))} */}
//                         <Table
//                                 tableHeaderColor="info"
//                                 // tableHead={[r.param_id]}
//                                 tableHead={Object.values(headings)}

//                                 tableData={getTableData(ahuData, headings)}
//                             /> 
                            
//                         </CardBody>
//                     </Card>
//                 </GridItem>
//             </GridContainer>
     
//     </div>
//   );
// }