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
// // import GRHA from './GRHA';
// import InputLabel from '@material-ui/core/InputLabel';
// import MenuItem from '@material-ui/core/MenuItem';
// import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
// import Button from '@material-ui/core/Button';
// import { setSyntheticLeadingComments } from 'typescript';

// const useStyles1 = makeStyles((theme) => ({
//     button: {
//       display: 'block',
//       marginTop: theme.spacing(2),
//     },
//     formControl: {
//       margin: theme.spacing(1),
//       minWidth: 120,
//     },
//   }));
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
    
//     // console.log("Inout: ", myinput, " Params: ", param_map);
    
//     //ahudata=>myinput, headings=>param_map
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
//     function getTextBoxData(dataTemplate=[],dataValues){
//         let datav=[]
//        // console.log("////////////",dataValues[0])
//        dataValues.map((ele,i)=>{ele.forEach(data=>{
//            datav.push(data)
//        })})
//        console.log("datavbvvvvv",datav)
//        // console.log("--p------s----s-",arr)
//        dataTemplate[0]["textitems"][0]="SAT :"+datav[8];
//        // dataTemplate[1]["textitems"][0]=datav[3];
//        dataTemplate[2]["textitems"][1]="SAT :"+datav[8];
//        dataTemplate[1]["textitems"][0]="RAT :"+datav[7];
//        // dataTemplate[4]["textitems"][0]="A"+" "+datav[3];
//        // dataTemplate[5]["textitems"][0]="A"+" "+datav[3];
//        dataTemplate[6]["textitems"][0]="Status :"+datav[5];
//        dataTemplate[7]["textitems"][0]="ChW valve :"+datav[9];
//        // dataTemplate[8]["textitems"][0]="A"+" "+datav[3];
//        // dataTemplate[9]["textitems"][0]="A"+" "+datav[3];
//        // dataTemplate[10]["textitems"][0]="A"+" "+datav[3];
     
     
//        return dataTemplate;
//      }
// export default function ListBookedSeats() {
//     const classes1 = useStyles1();
//   const [age, setAge] = React.useState('');
//   const [open, setOpen] = React.useState(false);

  
//   const handleChange = (event) => {
//       console.log("event.target.value",event.target.value)
//     setAge(event.target.value);
//   };

//   const handleClose = () => {
//     setOpen(false);
//   };

//   const handleOpen = () => {
//     setOpen(true);
//   };
//   const classes = useStyles();
//   const [rooms, setRooms] = React.useState([]);
//   const[data,setData]=useState([]);
//   const[ele,setEle]=useState([]);
//   const [selected1, setSelected1] = useState([]);
//   const [ahuData1,setAhuData1]=useState([]);
//   const [tdata,setTdata]=useState([]);
//   const [ahuData,setAhuData]=useState([]);
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
//        let a=[],tdata=[]
//        a=res;
//        let b=getTableData(res,headings);
//        b.map((ele,i)=>{ele.forEach(data=>{
//         tdata.push(data)
//         console.log("tdata",tdata)
//         setTdata(tdata)
//     })})
//        console.log("response",a)
//        let arrdata=[]
//        a.map(_res => {
//        let  data1={}
     
//       data1.name=_res.name;
//     //   data1.param_value=_res.param_value;
//     //   data1.ss_type=_res.ss_type;
//       arrdata.push(data1)
//       console.log("data===========>arrdata",arrdata)
      
//     //  const headings=['Location', 'AHU ID', 'Fan On Cmd On/off', 'VFD mode Ramp up / down', 'VFD Mode Auto/Manual', 'AHU Run status On/off', 'T Set Point Deg C', 'RAT Deg C', 'SAT Deg C', 'ChW valve %', 'Trip status On/off', 'Filter status Off=clean'];

//     })
//    // console.log(Object.keys(arrdata[0]));

//     setData(arrdata) 
//     setAhuData(res)

    
//     setAhuData1(getTableData(res,headings))
   
//     // let b=res,datav=[]
//     // b.map((ele,i)=>{ele.forEach(data=>{
//     //     datav.push(data)
//     // })})
//     // console.log("datavbvvvvv",datav)
//     //  setEle(datav)
//     })
//   }, [])

  
//   return (
//     <div >
     

//       {/* <GridContainer> */}
//           {/* <div>
     
//      <FormControl className={classes1.formControl}>
//        <InputLabel id="demo-controlled-open-select-label">Select</InputLabel> */}
//        {/* <Select
//          labelId="demo-controlled-open-select-label"
//          id="demo-controlled-open-select"
//          open={open}
//          onClose={handleClose}
//          onOpen={handleOpen}
//          value={age}
//          onChange={handleChange}
        
//        >
//          <MenuItem value="">
//            <em>None</em>
//          </MenuItem>
//          <MenuItem value={10}>{getTableData(ahuData, headings)
//          }{console.log("1111111111111111",age)}
//          </MenuItem> */}
//          {/* <MenuItem value={20}>AHU_WS</MenuItem> */}
         
//        {/* </Select> */}
//        {/* <Select
//          labelId="demo-controlled-open-select-label"
//          id="demo-controlled-open-select"
//          open={open}
//          onClose={handleClose}
//          onOpen={handleOpen}
//          value={age}
//          onChange={handleChange}
        
//        >{console.log("1111111111111111",age)} */}
//          {/* <MenuItem value={10}>{getTableData(ahuData, headings)
//          }
//          </MenuItem> */}
//          {/* <MenuItem value={20}>{tdata[1]}</MenuItem>
         
//        </Select>
//      </FormControl>
//    </div> */}


//           {/* </GridContainer> */}
//      {/* <GridContainer>
//         <GridItem xs={4} sm={6} md={8} lg={8}>
//       <Modal
//         open={openModal}>
//         <EDModal
//           crossButton={handleModalClose}
//          // onYesClick={onYesClick}
//           onNoClick={onNoClick}
//           //delete={cancel}
//          edit={edit}
//          onSubmitClick={onSubmitForUpdate}
//           text= "hello"
//           name={formDetails.name}
//           ss_type={formDetails.ss_type}
//           param_id={formDetails.param_id}
//           param_value={formDetails.param_value}>
          
//         </EDModal>
//       </Modal>
//       </GridItem>
//       </GridContainer> */}
//       {/* <GridContainer></GridContainer> */}
//  {/* <GRHA myimage="http://localhost/AHU_Graphic.png" width={600} height={273} data={ahuData1} addBoxes={true}  
//                 boxData ={getTextBoxData([
//                   { 'x': 440, 'y': 80, 'width': 150, 'height': 55, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["A", "B", "C"] },
//                   { 'x': 290, 'y': 12, 'width': 50, 'height': 55, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["D", "E", "F"] },
//                   { 'x': 550, 'y': 155, 'width': 45, 'height': 50, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["G","H", "I"] },
//                   { 'x': 88, 'y': 105, 'width': 35, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["J"] },
//                   { 'x': 63, 'y': 230, 'width': 35, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["K"] },
//                   { 'x': 165, 'y': 218, 'width': 75, 'height': 20, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["L"] },
//                   { 'x': 250, 'y': 218, 'width': 85, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["M", "N"] },
//                   { 'x': 350, 'y': 235, 'width': 60, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["O", "P"] },
//                   { 'x': 420, 'y': 235, 'width': 60, 'height': 35, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["Q", "R"] },
//                   { 'x': 146, 'y': 168, 'width': 45, 'height': 30, 'color': '#00f', 'textColor': '#fff', 'textSize': "0.75em", 'textitems': ["S", "T"] }
//               ],ahuData1)}
//                 />       */}
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
//                                     EditDeleteButtons(row,index)
//                                     ]
//                                 ))}
//                             />  */}
//                             {/* {console.log("===========",Object.keys(data))} */}

//                         <Table
//                                 tableHeaderColor="blue"
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