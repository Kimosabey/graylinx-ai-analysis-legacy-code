// import React  ,{ useEffect }from 'react';
// import Table from "components/Table/Table.js";
// import CardBody from "components/Card/CardBody.js";
// import EditDeleteModal from '../EditDeleteModal1';
// import api from '../../api';
// import Tooltip from '@material-ui/core/Tooltip';
// import CloseIcon from '@material-ui/icons/Close';
// import CancelIcon from '@material-ui/icons/Cancel';
// import IconButton from '@material-ui/core/IconButton';
// import EditIcon from '@material-ui/icons/Edit';
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import { makeStyles } from '@material-ui/core/styles';
// // import graylinxlogo from '../../assets/img/logo.png';
// import Modal from '@material-ui/core/Modal';
// import Snackbar from '@material-ui/core/Snackbar';
//  import MuiAlert from '@material-ui/lab/Alert';

// const styles = theme=>({
//     cardTitleWhite: {
//         color: "#FFFFFF",
//         marginTop: "0px",
//         minHeight: "auto",
//         fontWeight: "300",
//         fontFamily: "'Helvetica'",
//         marginBottom: "3px",
//         textDecoration: "none",
//         "& small": {
//             color: "#777",
//             fontSize: "65%",
//             fontWeight: "400",
//             lineHeight: "1"
//         },
//     },
//  }); 
//   const useStyles = makeStyles(styles);

// function ConfigureSetpoint(props){
//     const classes = useStyles();
//     const [zones,setZones] = React.useState([]);
//     const [openModal, setOpenModal] = React.useState(false);
//     const [edit, setEdit] = React.useState(false);
//     const [data,setData] = React.useState('');
//     const [openalert,setOpenalert] = React.useState(false);
//     const [status,setStatus] = React.useState("error");
//     const [alert,setAlert] = React.useState('');
//     const [name,setName] = React.useState([])
//     const [formDetails, setFormDetails] = React.useState({
//         id: "",
//         param_id:"",
//         param_value:""
//       })




//     let userId = localStorage.getItem("userID");
//     let roleId = localStorage.getItem("roleID")
//     useEffect(() => {
//             //api.floor.ConfigureSetpoints(localStorage.getItem("floorID")).then(res => {
//                 api.floor.ConfigureSetpoints("d4053866-e855-4dcc-a87a-77632dd054b9").then(res => {
//               let ravData=res.filter(e => e.param_id === 'ahu_supply_air_temperature')
//             //   let ravData=res.filter(e => e.param_id === 'chill_water_valve')
//               setName(ravData)
//             })
//       }, [])
//     const onEditClick = (index, clientData) => {
//         setFormDetails({
//             ...formDetails,
//             id: clientData.ss_id,
//             param_id:clientData.param_id,
//             param_value:clientData.param_value
//           })
//         setEdit(true)
//         setOpenModal(true)
//     }
//     const handleclose = () =>{
//         setOpenalert(false)
//     }
//     // function Alert(props) {
//     //     return <MuiAlert elevation={6} variant="filled" {...props} />;
//     // }

//     function EditDeleteButtons(row, index) {
//         return (
//             <div>
//                 <Tooltip title="edit">
//                 <IconButton
//                     aria-label="edit"
//                     style={{ paddingLeft: 0 }}
//                     onClick={() => onEditClick(index, row)}>
//                     <EditIcon />
//                 </IconButton>
//                 </Tooltip>
//             </div>
//         )
//     }
//     const handleModalClose = () => {
//         setOpenModal(false);
//         setEdit(false)
//     };
//     const onYesClick=()=>{
//         console.log("===========")
//     }
//     const onNoClick=()=>{
//         console.log("===========")
//     }
//     const onSubmitForConfigureSetpoint = (deviceID) => {
//         // var setpoint = localStorage.getItem('setpoint')
//         api.floor.UpdateConfigureSetpoints(deviceID).then(res => {
//             if(res === "Data successfully added!!"){
//                 setAlert("Data successfully added")
//                 setStatus("success")
//                 setOpenalert(true)
//             } else {
//                 setAlert("Error")
//                 setStatus("error")
//                 setOpenalert(true)
                
//             }  
//         })
//         setOpenModal(false);
//     }
//     return(
//         <div>
//             <div>
//                 {/* <img src={graylinxlogo} alt="Logo" style={{width:"120px",height:"56px",marginLeft:"560px"}}/> */}
//             </div>
//             <div>
//             {/* {openalert === true ? 
//                     <div>
//                         <Snackbar open={openalert} autoHideDuration={6000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
//                             <Alert style={{cursor:"pointer"}} severity={status}variant="filled" onClose={handleclose}>
//                             {alert}
//                             </Alert>
//                         </Snackbar>
//                     </div> 
//                 :
//                     <div></div> 
//             } */}
//                 <Modal
//                     open={openModal}>
//                     <EditDeleteModal
//                         crossButton={handleModalClose}
//                         onYesClick={onYesClick}
//                         onNoClick={onNoClick}
//                         // delete={cancel}
//                         edit={edit}
//                         onSubmitClick={onSubmitForConfigureSetpoint}
//                         id={formDetails.id}
//                         param_id={formDetails.param_id}
//                         param_value={formDetails.param_value}
//                         >
//                     </EditDeleteModal> 
//                 </Modal>
//                 <Card>
//                     <CardHeader color="blue">
//                         <h4 className={classes.cardTitleWhite}>Configure SetPoints</h4>
//                     </CardHeader>
//                     <CardBody>
//                             <Table
//                                 tableHeaderColor="blue"
//                                 tableHead={["Zone_name","Device_name","Device_type","SAT","Set_point"]}
//                                 tableData={name.map((row, index) => (
//                                     [    
//                                     row.zone_name,
//                                     row.name,
//                                     row.ss_type,
//                                     row.param_value,
//                                     EditDeleteButtons(row, index),
//                                     ]
//                                 ))}
//                             />
//                     </CardBody>
//                 </Card>
//             </div>
//         </div>
//     )
// }

// export default ConfigureSetpoint;