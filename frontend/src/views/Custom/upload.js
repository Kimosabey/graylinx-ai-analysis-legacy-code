// import React, { useState, useEffect } from 'react';
// import { makeStyles, responsiveFontSizes, withStyles } from '@material-ui/core/styles';
// //import Button from '@material-ui/core/Button';
// import Button from "components/CustomButtons/Button.js";
// //import CustomInput from "components/CustomInput/CustomInput.js";
// import api from '../../api';
// // import EditDeleteModal from 'Components/EditDeleteModal';
// import Modal from '@material-ui/core/Modal';
// import Grid from '@material-ui/core/Grid';
// import IconButton from '@material-ui/core/IconButton';
// import EditIcon from '@material-ui/icons/Edit';
// import DeleteIcon from '@material-ui/icons/Delete';
// import Snackbar from '@material-ui/core/Snackbar';
// import EditDeleteModal from '../EditDeleteModal';
// import MuiAlert from '@material-ui/lab/Alert';
// import Table from "components/Table/Table.js";
// import GridItem from "components/Grid/GridItem.js";
// import GridContainer from "components/Grid/GridContainer.js";
// //import Table from "@material-ui/core/Table";
// import TableBody from "@material-ui/core/TableBody";
// import TableContainer from "@material-ui/core/TableContainer";
// import TableHead from "@material-ui/core/TableHead";
// import TableFooter from '@material-ui/core/TableFooter';
// import TableRow from "@material-ui/core/TableRow";
// import TableCell from "@material-ui/core/TableCell";
// import TablePagination from '@material-ui/core/TablePagination';
// import TableSortLabel from '@material-ui/core/TableSortLabel';
// import Paper from "@material-ui/core/Paper";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardBody from "components/Card/CardBody.js";
// import Tasks from 'components/Tasks/Tasks';
// import { Edit } from '@material-ui/icons';
// import { grayColor } from 'assets/jss/material-dashboard-react.js';
// // import { TextField,MenuItem } from '@material-ui/core';

// //import CircularProgress from '@material-ui/core/CircularProgress';
// //import  {grayColor} from 'assets/jss/material-dashboard-react.js';
// // import axios from 'axios';

// function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

// // const StyledTableCell = withStyles((theme) => ({
// //     head: {
// //         backgroundColor: '#00acc1',
// //         color: theme.palette.common.white,
// //     },
// //     body: {
// //         fontSize: 14,
// //     },
// // }))(TableCell);

// // const StyledTableRow = withStyles((theme) => ({ 
// //     root: {
// //         '&:nth-of-type(odd)': {
// //             backgroundColor: theme.palette.action.hover,
// //         },
// //     },
// // }))(TableRow);

// // const StyledTableSortLabel = withStyles((theme) => ({ 
// //     root: {
// //         color: 'white',
// //         "&:hover": {
// //             color: 'lightgray',
// //         },
// //         '&$active': {
// //             color: 'white',
// //         },
// //     },
// //     active: {},
// //     icon: {
// //         color: 'inherit !important'
// //     },
// // })
// // )(TableSortLabel);

// const styles = theme=>({
//     cardCategoryWhite: {
//         "&,& a,& a:hover,& a:focus": {
//             color: "rgba(255,255,255,.62)",
//             margin: "0",
//             fontSize: "14px",
//             marginTop: "0",
//             marginBottom: "0"
//         },
//         "& a,& a:hover,& a:focus": {
//             color: "#FFFFFF"
//         }
//     },
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
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize: "65px",
//         //     lineHeight: "1"
//         // }    
//     },
//     cardTitle: {
//         color: grayColor[2],
//         marginTop: "0px",
//         minHeight: "auto",
//         fontWeight: "300",
//         fontFamily: "'Helvetica'",
//         marginBottom: "3px",
//         textDecoration: "none",
//         "& small": {
//             color: grayColor[1],
//             fontWeight: "400",
//             lineHeight: "1"
//         },
//         padding:"3px",
//         // [theme.breakpoints.up('xl')]: {
//         //     padding:"15px",
//         //     fontSize: "50px",
//         //     color: grayColor[1],
//         //     fontWeight: "500",
//         //     lineHeight: "3"
//         //   }
//     },
//     cardCategory: {
//         color: grayColor[0],
//         margin: "0",
//         fontSize: "14px",
//         marginTop: "0",
//         paddingTop: "10px",
//         marginBottom: "0"
//     },
//     input:{
//         fontsize:"25px",
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize: "50px",
//         //     color: grayColor[1],
//         //     fontWeight: "500",
//         //   }
//         }, 
//      modal:{
//          iconSize:"2px",
//          fontsize:"16px",
//         //  [theme.breakpoints.up('xl')]: {
//         //     iconSize:"10px",
//         //     fontsize:"45px",
//         //     // height:"100px"
//         //   },
//      },
//      snackbar:{
//         // [theme.breakpoints.up('xl')]: {
//         //     fontSize:"47px"
//         //   },   
//      }  
// });

// const useStyles = makeStyles(styles);
// // const StyledActionsTableCell = withStyles((theme) => ({
// //     head: {
// //         backgroundColor: '#00acc1',
// //         color: theme.palette.common.white,
// //         width: '140px',
// //     },
// //     body: {
// //         width: '140px',
// //     },
// // }))(TableCell);

// // const useStyles = makeStyles((theme) => ({
// //     table: {
// //         minWidth: 500,
// //     },
// //     root: {
// //         display: 'flex',
// //         justifyContent: 'center',
// //         alignItems: 'center'
// //     },
// //     inputField: {
// //         justifyContent: 'center',
// //         alignItems: 'center',
// //         marginTop: "3px",
// //         marginBottom: "30px"
// //     },
// //     maindiv: {
// //         textAlign: "center",
// //         marginTop: "20px",
// //         padding: "5px",
// //         width: "30%",
// //         height: "180px",
// //         marginLeft: "35%",
// //         boxShadow: "12px 12px 30px grey"
// //     },
// //     uploadButton: {
// //         textTransform: "capitalize",
// //         height: "35px"
// //     },
// //     uploadIcon: {
// //         color: "white"
// //     },

// // }));

// export default function UploadButtons(props) {
//     const classes = useStyles();
//     const [selectedFile, setSelectedFile] = React.useState(null);
//     const [users, setUsers] = React.useState([]);
//     const [snackbarOpen, setSnackbarOpen] = React.useState(false)
//     const [snackbarmsg, setSnackbarmsg] = React.useState('')
//     const [snackbarseverity, setSnackbarseverity] = React.useState("")
//     const [openAlert, setOpenAlert] = React.useState(false);
//     const [openModal, setOpenModal] = React.useState(false);
//     const [cancel, setCancel] = React.useState(false);
//     const [edit, setEdit] = React.useState(false);
//     const [page, setPage] = React.useState(0);
//     const [rowsPerPage, setRowsPerPage] = React.useState(5);
//     const [order, setOrder] = React.useState();
//     const [orderBy, setOrderBy] = React.useState();
//     //const [isloaded,setIsLoaded] = React.useState(false);
//     const [errorMsg, setErrorMsg] = React.useState({
//         text: "", severity: ""
//     });
//     const [formDetails, setFormDetails] = React.useState({
//         user_id: "",
//         user_name: "",
//         user_email: "",
//         user_contact: ""
//     })
// //   const building = [
// //       {
// //          value:localStorage.getItem("buildingID"),
// //           label:localStorage.getItem("buildingName")
// //       }
// //   ]

//     useEffect(() => {
//         api.users.usersData().then(res => {
//             setUsers(res.result)
//         })
//     }, [])

//     const handleChangePage = (event, newPage) => {
//         setPage(newPage);
//     };

//     const handleChangeRowsPerPage = (event) => {
//         setRowsPerPage(+event.target.value);
//         setPage(0);
//     };
//     const handleModalClose = () => {
//         setOpenModal(false);
//         setEdit(false)
//         setCancel(false)
//     };
//     const onNoClick = () => {
//         handleModalClose()
//     }

//     const onYesClick = () => {
//         const req = {
//             user_email: formDetails.user_email
//         }
//         api.users.deleteUser(req).then(res => {
//             console.log("delete api response is", res)
//             setOpenModal(false);
//             if (res.message === "User Deleted Successfully") {
//                 setOpenAlert(true);
//                 setErrorMsg({
//                     text: 'The user named ' +
//                         (formDetails.user_name.charAt(0).toUpperCase() + formDetails.user_name.slice(1)) +
//                         ' has been removed',
//                     severity: "success"
//                 })
//                 api.users.usersData().then(res => {
//                     setUsers(res.result)
//                 })
//             } else {
//                 setOpenAlert(true);
//                 setErrorMsg({
//                     text: 'The  user named ' +
//                         (formDetails.user_name.charAt(0).toUpperCase() + formDetails.user_name.slice(1)) +
//                         ' can not be removed.',
//                     severity: "error"
//                 })
//             }

//         })
//     }

//     const onDeleteClick = (index, clientData) => {
//         setCancel(true)
//         setFormDetails({
//             ...formDetails,
//             user_email: clientData.user_email,
//             user_name: clientData.user_name
//         })
//         setOpenModal(true)
//     }
//     const onEditClick = (index, clientData) => {
//         setFormDetails({
//             ...formDetails,
//             user_email: clientData.user_email,
//             user_name: clientData.user_name
//         })
//         setEdit(true)
//         setOpenModal(true)
//     }

//     const importCSV = () => {
//         const file = document.getElementById("contained-button-file");
//         if (selectedFile !== null) {
//             const formData = new FormData();
//             formData.append(
//                 "file",
//                 selectedFile
//             );
//             formData.append("building_id", localStorage.getItem("buildingID"));
//             // const data= '5';
//             api.users.uploadUsersData(formData)
//                 .then(res => {
//                     setOpenAlert(true);
//                     setErrorMsg({ text: "User data uploaded successfully", severity: "success" })
//                     setTimeout(() => file.value = "",setSelectedFile(null), 1000)
//                 })
//                 .catch(error => {
//                     setOpenAlert(true);
//                     setErrorMsg({ text: "Unable to upload the file", severity: "error" })
//                 })
//         }
//          else {
//             setOpenAlert(true);
//             setErrorMsg({ text: "Choose a file to upload", severity: "error" })
//         }
//     }

//     // const test = async ()=>{
//     //     // const axios = require('axios');
//     //     let promises = [];
//     //     const itemsWithIndex = ['a','b','c','d']
//     //      function wait(ms) {
//     //         return new Promise( (resolve) => {setTimeout(resolve, ms)});
//     //     }
//     //     const axiosFunc = async () =>  {
//     //         for (const item of itemsWithIndex) {
//     //             console.log('before axios')
//     //             axios({
//     //                 url: '/v1/coworking/cws_users',
//     //                 method: 'get',
//     //                 // data: item
//     //             }).then( await  wait(5000))
//     //         }
//     //     };
//     //     axiosFunc()
//     // }   

//     //     setIsLoaded(true);
//     //     const abc = await Promise.all([
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`),
//     //         axios.get(`/v1/coworking/cws_users`)
//     //       ]).then(responseArr => {
//     //         //this will be executed only when all requests are complete
//     //         console.log(responseArr);
//     //         // console.log('Date created: ', responseArr[0].data.created_at);
//     //         // console.log('Date created: ', responseArr[1].data.created_at);
//     //       }).catch(errorsArr => {
//     //         // react on errors.
//     //         console.log(errorsArr)
//     //       });

//     //       console.log(abc);
//     //     // console.log(typeof(abc))
//     //     // console.log(abc)
//     //     // abc.length == 10 ? setIsLoaded(true) : console.log("errror"); 
//     //     setIsLoaded(false);
//     //   setInterval(() => {
//     //     if (isloaded == true) {
//     //         console.log("loading");
//     //         setIsLoaded(true);
//     //     }
//     //     else{
//     //     console.log("not loading")
//     //     setIsLoaded(false);
//     //     }
//     //     api.users.usersData().then(res => {
//     //     console.log("res",res) 
//     //     })
//     //     .catch(error=>{
//     //         console.log("error");
//     //     }) 
//     //  }, 3000); 
//     // }
//     function stableSort(array, cmp) {
//         const stabilizedThis = array.map((el, index) => [el, index]);
//         stabilizedThis.sort((a, b) => {
//             const order = cmp(a[0], b[0]);
//             if (order !== 0) return order;
//             return a[1] - b[1];
//         });
//         return stabilizedThis.map(el => el[0]);
//     }

//     function getcomparator(order, orderBy) {
//         return order === 'desc'
//             ? (a, b) => descendingComparator(a, b, orderBy)
//             : (a, b) => -descendingComparator(a, b, orderBy);
//     }
//     function descendingComparator(a, b, orderBy) {
//         if (b[orderBy] < a[orderBy]) {
//             return -1;
//         }
//         if (b[orderBy] > a[orderBy]) {
//             return 1;
//         }
//         return 0;
//     }

//     const handleSortRequest = (value) => {
//         const isAsc = orderBy === value && order === "asc";
//         setOrder(isAsc ? 'desc' : 'asc')
//         setOrderBy(value)
//     }

//     function EditDeleteButtons(row, index) {
//         return (
//             <div>
//                 <IconButton
//                     aria-label="edit"
//                     style={{ paddingLeft: 0 }}
//                     // onClick={() => onEditClick(index, row)}
//                     disabled
//                     >
//                     <EditIcon />
//                 </IconButton>
//                 <IconButton
//                     aria-label="Delete"
//                     style={{ paddingLeft: 0 }}
//                     onClick={() => onDeleteClick(index, row)}>
//                     <DeleteIcon />
//                 </IconButton>
//             </div>
//         )
//     }

//     const handleClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return;
//         }
//         setOpenAlert(false);
//     };

//     const setFile = (event) => {
//         // Get the details of the files
//         setSelectedFile(event.target.files[0])
//     }

//     return (
//         <div>
//             {/* <form> */}
//             {/* <div className={classes.maindiv}> */}
//             {/* <h3 style={{ marginBottom: 30 }}>Import User Data :</h3>
//                     <div className={classes.root} >
//                         <input
//                             accept=".csv,"
//                             id="contained-button-file"
//                             multiple
//                             type="file"
//                             onChange={setFile}
//                         />
//                     </div>
//                     <div style={{ marginTop: "25px", padding: "5px" }}>
//                         <Button variant="contained" color="primary" style={{ height: "30px", background:"#00acc1"}} onClick={importCSV}>
//                             Submit
//                     </Button>
//                     </div> */}
//             {/* <Snackbar
//                         open={openAlert} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}> */}
//             {/* <Alert onClose={handleClose} severity={errorMsg.severity}>
//                             {errorMsg.text}
//                         </Alert> */}
//             {/* </Snackbar>  */}
//             {/* <Modal */}
//             {/* open={openModal}> */}
//             {/* <EditDeleteModal
//                             crossButton={handleModalClose}
//                             onYesClick={onYesClick}
//                             onNoClick={onNoClick}
//                             delete={cancel}
//                             edit={edit}
//                             text="Do you really want to delete this user? This process cannot be undone.">
//                         </EditDeleteModal> */}
//             {/* </Modal> */}
//             {/* </div> */}
//             {/* </form> */}
//             {/* <TableContainer className={classes.table} component={Paper} style={{ marginTop: '40px' }}>
//                 {(users !== undefined && users.length > 0) ?
//                     <Table stickyHeader>
//                         <TableHead>
//                             <TableRow>
//                                 <StyledTableCell
//                                     sortDirection={orderBy === 'user_id' ? order : true}>
//                                     <StyledTableSortLabel
//                                         active={orderBy === 'user_id'}
//                                         direction={orderBy === 'user_id' ? order : 'asc'}
//                                         onClick={() => { handleSortRequest('user_id') }}>
//                                         User ID
//                                 </StyledTableSortLabel>
//                                 </StyledTableCell>
//                                 <StyledTableCell sortDirection={orderBy === 'user_id' ? order : true}>
//                                     <StyledTableSortLabel
//                                         active={orderBy === 'user_name'}
//                                         direction={orderBy === 'user_name' ? order : 'asc'}
//                                         onClick={() => { handleSortRequest('user_name') }}>
//                                         User Name
//                                 </StyledTableSortLabel>
//                                 </StyledTableCell>
//                                 <StyledTableCell sortDirection={orderBy === 'user_id' ? order : true}>
//                                     <StyledTableSortLabel
//                                         active={orderBy === 'user_email'}
//                                         direction={orderBy === 'user_email' ? order : 'asc'}
//                                         onClick={() => { handleSortRequest('user_email') }}>
//                                         User Email
//                                 </StyledTableSortLabel>
//                                 </StyledTableCell>
//                                 <StyledTableCell>User Contact Number</StyledTableCell>
//                                 <StyledActionsTableCell>Actions</StyledActionsTableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {stableSort(users, getcomparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                                 .map((row, index) => (
//                                     <StyledTableRow key={index}>
//                                         <StyledTableCell component="th" scope="row">
//                                             {row.user_id}
//                                         </StyledTableCell>
//                                         <StyledTableCell>{row.user_name}</StyledTableCell>
//                                         <StyledTableCell>{row.user_email}</StyledTableCell>
//                                         <StyledTableCell>{row.user_contact_no}</StyledTableCell>
//                                         <StyledActionsTableCell>
//                                             <IconButton
//                                                 aria-label="delete"
//                                                 onClick={() => onDeleteClick(index, row)}>
//                                                 <DeleteIcon />
//                                             </IconButton>
//                                         </StyledActionsTableCell>
//                                     </StyledTableRow>
//                                 ))}
//                         </TableBody>
//                         <TableFooter>
//                             <TableRow>
//                                 <TablePagination
//                                     rowsPerPageOptions={[]}
//                                     colSpan={8}
//                                     count={users.length}
//                                     rowsPerPage={rowsPerPage}
//                                     page={page}
//                                     SelectProps={{
//                                         native: true,
//                                     }}
//                                     onChangePage={handleChangePage}
//                                     onChangeRowsPerPage={handleChangeRowsPerPage}
//                                 />
//                             </TableRow>
//                         </TableFooter>
//                     </Table>
//                     : <Table className={classes.table} aria-label="customized table">
//                         <TableHead>
//                             <TableRow>
//                             <StyledTableCell>User_ID</StyledTableCell>
//                                 <StyledTableCell>User_Name</StyledTableCell>
//                                  <StyledTableCell>User_Email_ID</StyledTableCell>
//                                 <StyledTableCell>User_Contact_No.</StyledTableCell>
//                                 <StyledActionsTableCell>Actions</StyledActionsTableCell>
//                             </TableRow>
//                         </TableHead>
                        
//                         <TableBody>
//                             <TableRow>
//                                 <StyledTableCell colSpan={6}>No Data Found</StyledTableCell>
//                             </TableRow>
//                         </TableBody>
//                     </Table>
//                 } //className={classes.cardTitle} // className={classes.cardCategory} style={{"marginLeft":"105%"}}
//             </TableContainer>*/}
//     <Grid Container alignItems="center" justify="center">
//         <GridContainer alignItems="center" justify="center">
//         <GridItem xs={8} sm={12} md={6}> 
//           <Card>
//             <div >
//             <CardHeader color="info">
//              <h4 className={classes.cardTitleWhite} >Import User Data :</h4>
//             </CardHeader>
//             </div> 
//             <CardBody className={classes.cardTitle}>
//                     {/* <TextField style={{width:"150px"}}
//                         // className={classes.textField}
//                         required
//                         id="select-label"
//                         select
//                         label="Select Building"
//                         >
//                         {building.map(_floor => //onClick={event => handleFloorChange(event, _floor.name)}
//                             <MenuItem key={_floor.value} value={_floor.value} >{_floor.label}</MenuItem>
//                         )} 
//                     </TextField> */}
//               <GridContainer alignItems="center" justify="center"  >
//                   <input 
//                   className={classes.input}
//                     accept=".csv,"
//                     id="contained-button-file"
//                     multiple
//                     type="file"
//                     onChange={setFile}
//                     //labelText="Company (disabled)"
//                     formControlProps={{
//                       fullWidth: true
//                     }}
//                     inputProps={{
//                       disabled: true
//                     }}
//                   />
//                   <Button color="info" onClick={importCSV}>
//                   Submit
//                  </Button>
//                  {/* <Button color ="info" onClick={test}>Test</Button> */}
//                  <Snackbar
//                  open={openAlert} autoHideDuration={3000} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} onClose={handleClose}>    
//                   <Alert onClose={handleClose} severity={errorMsg.severity} className={classes.snackbar}>
//                     {errorMsg.text}
//                  </Alert>
//                  </Snackbar>
//                  <Modal 
//                 //  className={classes.modal}
//                   open={openModal}>
//                     <EditDeleteModal
//                     className={classes.modal}
//                             crossButton={handleModalClose}
//                             onYesClick={onYesClick}
//                             onNoClick={onNoClick}
//                             delete={cancel}
//                             edit={edit}
//                             text=" Do you really want to delete this user? This process cannot be undone. ">
//                         </EditDeleteModal>   
//                   </Modal>
//               </GridContainer>
//             </CardBody>
//          </Card>
//         </GridItem>
//         </GridContainer>
   
//             <GridContainer>
//                 <GridItem xs={8} sm={12} md={12} lg={12}>
//                     <Card>
//                         <CardHeader color="info">
//                             <h4 className={classes.cardTitleWhite}>User List</h4>
//                             <p className={classes.cardCategoryWhite}>
//                             </p>
//                         </CardHeader>
//                         <CardBody>
//                             <Table className={classes.input}
//                                 tableHeaderColor="info"
//                                 tableHead={["User_ID", "User_Name", "User_Email_ID", "User_Contact_No.", "Actions"]}
//                                 tableData={users.map((row, index) => (
//                                     [row.user_id,
//                                     row.user_name,
//                                     row.user_email,
//                                     row.user_contact_no,
//                                     //_val.created_at !== undefined ? getDate(_val.created_at).toLocaleString() : "",
//                                     EditDeleteButtons(row, index)
//                                         //(<DeleteIcon />)
//                                     ]
//                                 ))}
//                                 data={users}
//                             />
//                         </CardBody>
//                     </Card>
//                 </GridItem>
//             </GridContainer>
//          </Grid >   
//         </div>


//     );
// }
// /* <GridItem xs={12} sm={12} md={4}>
//           <Card>
//             <CardHeader>
//             <h4 className={classes.cardCategory}>Import User Data :</h4>
//             </CardHeader>
//             <CardBody>
//               <h4 className={classes.cardTitle}>Daily Sales</h4>
//               <p className={classes.cardCategory}>
//                 <span className={classes.successText}>
//                   <ArrowUpward className={classes.upArrowCardCategory} /> 55%
//                 </span>{" "}
//                 increase in today sales.
//               </p>
//             </CardBody>
//             <CardFooter chart>
//               <div className={classes.stats}>
//                 <AccessTime /> updated 4 minutes ago
//               </div>
//             </CardFooter>
//           </Card>
//         </GridItem> */
