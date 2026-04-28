// import React, {useRef,useEffect } from 'react';
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
// import EditDeleteModal from '../EditDeleteModal';
// import CancelIcon from '@material-ui/icons/Cancel';
// import Tooltip from '@material-ui/core/Tooltip';
// import {useSelector} from 'react-redux';

// // const useStyles = makeStyles({
// //   table: {
// //     minWidth: 650,
// //   },
// // });

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

// export default function ListBookedSeats() {
//   const classes = useStyles();
//   const [rooms, setRooms] = React.useState([]);
//   const [snackbarOpen, setSnackbarOpen] = React.useState(false)
//   const [snackbarmsg, setSnackbarmsg] = React.useState('')
//   const [snackbarseverity, setSnackbarseverity] = React.useState("")
//   const [openModal, setOpenModal] = React.useState(false);
//   const [cancel, setCancel] = React.useState(false);
//   const [edit, setEdit] = React.useState(false);
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(5);
//   const [order, setOrder] = React.useState();
//   const [orderBy, setOrderBy] = React.useState();
//   const [filterFn, setFilterFn] = React.useState({ fn: items => {return items;}});

//   const [formDetails, setFormDetails] = React.useState({
//     id: "",
//     clientName: "",
//     clientEmailId: "",
//     clientContactNo: "",
//     clientBookedRoom: "",
//     clientFromTime: "",
//     clientToTime: ""
//   })
//   var user_id=localStorage.getItem('userID')
//   const userID = useSelector(state=>state.isLogged.data.zones[0])
//   const type = "GL_ZONE_TYPE_SEAT"
//   var roleId=localStorage.getItem('roleID')
//   useEffect(() => {
//     if(roleId=="1"){
//     api.floor.getBookedSeatsList(user_id).then(res => {
//       setRooms(res.id)
//     })
//   } else{
//     api.floor.getBookedSeatsList(userID,type).then(res => {
     
//       setRooms(res.result)
//     })
//   }
//   }, [])

//   const bookButtonClick = () => {
//     // navigate('/seats/book')
//   }

//   const snackbarClose = (event) => {
//     setSnackbarOpen(false)
//   }

//   const onYesClick = () => {
//     const req = {
//       id: formDetails.id,
//       person_name: formDetails.clientName,
//       email_id: formDetails.clientEmailId,
//       contact_no: formDetails.clientContactNo,
//     }
//     api.floor.cancelSeatBooking(req).then(res => {
//       setOpenModal(false);
//       if (res === "success" && roleId ==="1") {
//         setSnackbarOpen(true)
//         setSnackbarseverity("success")
//         setSnackbarmsg('Booked seat for ' + (formDetails.clientBookedRoom).toUpperCase() + ' is canceled')
//         api.floor.getBookedSeatsList(user_id).then(res => {
//           setRooms(res.id)
//         })
//       } else if(res==="Booking Cancelled"){
//         setSnackbarOpen(true)
//         setSnackbarseverity("success")
//         setSnackbarmsg('Booked seat for ' + (formDetails.clientBookedRoom).toUpperCase() + ' is canceled')
//         api.floor.getBookedSeatsList(userID,type).then(res => {
//           setRooms(res.result)
//         })
//       }else if (res === "Meeting has been Started") {
//         setSnackbarOpen(true)
//         setSnackbarseverity("error")
//         setSnackbarmsg('Booked seat for ' + (formDetails.clientBookedRoom).toUpperCase() + ' can not be canceled as meeting has been already started.')
//       }

//     })
//   }

//   const onSubmitForbookinUpdateClick = () => {
//     var from = localStorage.getItem('from')
//     var to = localStorage.getItem('to')
//     console.log("formdetails",formDetails)
//     const req = {
//       id: formDetails.id,
//       from: from,
//       to: to,
//       person_name: formDetails.clientName,
//       email_id: formDetails.clientEmailId,
//       contact_no: formDetails.clientContactNo
//     }
//     api.floor.updateSeatBooking(req).then(res => {
//       if (res === "success" && roleId ==="1") {
//         api.floor.getBookedSeatsList(user_id).then(res => {
//           setRooms(res.id)
//         })
//         setSnackbarOpen(true)
//         setSnackbarseverity("success")
//         // setSnackbarmsg('Scheduled time for ' +
//         //   (formDetails.clientBookedRoom).toUpperCase() +
//         //   ' is successfully updated')
//         setSnackbarmsg('Scheduled time is successfully updated')
//       } else if(res==="success"){
//         api.floor.getBookedSeatsList(userID,type).then(res => {
//           setRooms(res.result)
//         })
//         setSnackbarOpen(true)
//         setSnackbarseverity("success")
//         // setSnackbarmsg('Scheduled time for ' +
//         //   (formDetails.clientBookedRoom).toUpperCase() +
//         //   ' is successfully updated')
//         setSnackbarmsg('Scheduled time is successfully updated')
//       } else if (res === "Meeting has been Started") {
//         setSnackbarOpen(true)
//         setSnackbarseverity("error")
//         // setSnackbarmsg('Scheduled meeting time for ' +
//         // (formDetails.clientBookedRoom).toUpperCase() +
//         // ' can not updated as meeting has been already started.')
//         setSnackbarmsg('Scheduled time cannot be updated')
//       }
//     }).catch((err) => {
//       console.log("errrrrrrr",err)
//       // setSnackbarOpen(true)
//       //   setSnackbarseverity("error")
//       //   setSnackbarmsg('Scheduled meeting for ' + (formDetails.clientBookedRoom).toUpperCase() + ' can not be canceled as meeting has been already started.')
//     });
//     setOpenModal(false);
//   }

//   const onNoClick = () => {
//     handleModalClose()
//   }

//   const onDeleteClick = (index, clientData) => {
//     setCancel(true)
//     setFormDetails({
//       ...formDetails,
//       id: clientData.booking_id,
//       clientName: clientData.user_name,
//       clientEmailId: clientData.user_email,
//       clientContactNo: clientData.contact_no,
//       clientBookedRoom: clientData.gl_zone_description,
//       clientFromTime: clientData.usage_start_time,
//       clientToTime: clientData.usage_end_time
//     })
//     setEdit(false)
//     setOpenModal(true)
//   }

//   const onEditClick = (index, clientData) => {
//     setFormDetails({
//       ...formDetails,
//       clientName: clientData.user_name,
//       clientEmailId: clientData.user_email,
//       clientContactNo: clientData.contact_no,
//       clientBookedRoom: clientData.gl_zone_description,
//       clientFromTime: clientData.usage_start_time,
//       clientToTime: clientData.usage_end_time,
//       id: clientData.booking_id,
//     })
//     setEdit(true)
//     setCancel(false)
//     setOpenModal(true)
//   }

//   const handleModalClose = () => {
//     setOpenModal(false);
//     setEdit(false)
//     setCancel(false)
//   };

//   function DateAndTime(date) {
//     var newValue = []
//     newValue = date.split(" ");
//     var time = new Date(date);
//     return (
//       <List>
//         <ListItem style={{ height: 20 }}>{newValue[0]}</ListItem>
//         <ListItem style={{ height: 20 }}>{time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })}</ListItem>
//       </List>
//     )
//   }

//   function Alert(props) {
//     return <MuiAlert elevation={6} variant="filled" {...props} />;
//   }

//   function EditDeleteButtons(row, index) {
//     return (
//         <div>
//              <Tooltip title="Edit">
//             <IconButton
//                 aria-label="edit"
//                 style={{ paddingLeft: 0 }}
//                 onClick={() => onEditClick(index, row)}>
//                 <EditIcon />
//             </IconButton>
//             </Tooltip>
//             <Tooltip title="Cancel">
//             <IconButton
//                 aria-label="Delete"
//                 style={{ paddingLeft: 0 }}
//                 onClick={() => onDeleteClick(index, row)}>
//                 {/* <DeleteIcon /> */}
//                 <CancelIcon />
//             </IconButton>
//             </Tooltip>
//         </div>
//     )
// }

//   return (
//     <div >
//       <Snackbar
//         anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//         open={snackbarOpen}
//         autoHideDuration={6000}
//         onClose={snackbarClose}>
//         <Alert onClose={snackbarClose} severity={snackbarseverity}>
//           {snackbarmsg}
//         </Alert>
//       </Snackbar>
//       <GridContainer>
//         <GridItem xs={4} sm={6} md={8} lg={8}>
//       <Modal
//         open={openModal}>
//         <EditDeleteModal
//           crossButton={handleModalClose}
//           onYesClick={onYesClick}
//           onNoClick={onNoClick}
//           delete={cancel}
//           edit={edit}
//           onSubmitClick={onSubmitForbookinUpdateClick}
//           bookingID={formDetails.id}
//           text= " Do you really want to cancel the booking? This process cannot be undone."
//           clientName={formDetails.clientName}
//           clientEmailId={formDetails.clientEmailId}
//           clientContactNo={formDetails.clientContactNo}
//           clientBookedRoom={formDetails.clientBookedRoom}
//           clientFromTime={formDetails.clientFromTime}
//           clientToTime={formDetails.clientToTime}>
//         </EditDeleteModal>
//       </Modal>
//       </GridItem>
//       </GridContainer>
//       {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: "30px", marginTop: "20px", height: "50px", }}>
//       <Button  variant="contained" color="info" onClick={bookButtonClick} >
//         Book Seat(s)
//       </Button>
//         <TextField
//           id="search"
//           size="small"
//           variant='outlined'
//           label="Search Client Name"
//           InputProps={{
//             startAdornment: (
//               <SearchIcon />
//             )
//           }}
//           onChange= {event => handleSearch(event)}
//         >
//         </TextField>
//       </div> */}
//       <GridContainer>
//                 <GridItem xs={10} sm={12} md={12}>
//                     <Card>
//                         <CardHeader color="info">
//                             <h4 className={classes.cardTitleWhite}>List of All Booked Seats</h4>
//                         </CardHeader>
//                         <CardBody>
//                             <Table
//                                 tableHeaderColor="info"
//                                 tableHead={["Seat", "Booked From", "Booked To", "Booked By", "Actions"]}
//                                 tableData={rooms.map((row, index) => (
//                                     // [JSON.parse(row.seat_details).name,
//                                     // row.name,
//                                     // DateAndTime(row.duration_from),
//                                     // DateAndTime(row.duration_to),
//                                     // row.person_name,
//                                     // EditDeleteButtons(row, index)
//                                     // ]
//                                     [row.gl_zone_description,
//                                     row.usage_start_time,
//                                     row.usage_end_time,
//                                     row.user_name,
//                                     EditDeleteButtons(row,index)
//                                     ]
//                                 ))}
//                             />
//                         </CardBody>
//                     </Card>
//                 </GridItem>
//             </GridContainer>
//       {/* <TableContainer component={Paper} style={{ marginTop: "2%" }}>
//         {(rooms !== undefined && rooms.length > 0) ?
//           <Table className={classes.table} stickyHeader aria-label="customized table">
//             <TableHead>
//               <TableRow>
//                 <StyledTableCell>Seat</StyledTableCell>
//                 <StyledTableCell>Zone</StyledTableCell>
//                 <StyledTableCell
//                 sortDirection={orderBy === 'duration_from'?order:false} >
//                   <StyledTableSortLabel
//                     active={orderBy === 'duration_from'}
//                     direction={orderBy === 'duration_from' ? order : 'asc'}
//                     onClick={() => { handleSortRequest('duration_from') }}>
//                     Booked From
//                   </StyledTableSortLabel>
//                 </StyledTableCell>
//                 <StyledTableCell
//                  sortDirection={orderBy === 'duration_to'?order:false}>
//                   <StyledTableSortLabel
//                     active={orderBy === 'duration_to'}
//                     direction={orderBy === 'duration_to' ? order : 'asc'}
//                     onClick={() => { handleSortRequest('duration_to') }}>
//                     Booked To
//                   </StyledTableSortLabel>
//                 </StyledTableCell>
//                 <StyledTableCell
//                  sortDirection={orderBy === 'person_name'?order:false}>
//                   <StyledTableSortLabel
//                     active={orderBy === 'person_name'}
//                     direction={orderBy === 'person_name' ? order : 'asc'}
//                     onClick={() => { handleSortRequest('person_name') }}>
//                     Booked By
//                   </StyledTableSortLabel>
//                 </StyledTableCell>
//                 <StyledActionsTableCell>Actions</StyledActionsTableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {stableSort(filterFn.fn(rooms), getcomparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
//                 <StyledTableRow key={index}>
//                   <StyledTableCell component="th" scope="row" style={{ "textTransform": "capitalize" }}>
//                     {JSON.parse(row.seat_details).name}
//                   </StyledTableCell>
//                   <StyledTableCell>{row.name}</StyledTableCell>
//                   <StyledTableCell>{DateAndTime(row.duration_from)}</StyledTableCell>
//                   <StyledTableCell>{DateAndTime(row.duration_to)}</StyledTableCell>
//                   <StyledTableCell style={{ "textTransform": "capitalize" }}>{row.person_name}</StyledTableCell>
//                   <StyledActionsTableCell>
//                     <IconButton
//                       aria-label="edit"
//                       style={{ paddingLeft: 0 }}
//                       onClick={() => onEditClick(index, row)}>
//                       <EditIcon />
//                     </IconButton>
//                     <IconButton
//                       aria-label="delete"
//                       onClick={() => onDeleteClick(index, row)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </StyledActionsTableCell>
//                 </StyledTableRow>
//               ))}
//               {emptyRows > 0 && (
//                 <TableRow style={{ height: 48 * emptyRows }}>
//                   <TableCell colSpan={8} />
//                 </TableRow>
//               )}
//             </TableBody>
//             <TableFooter>
//               <TableRow>
//                 <TablePagination
//                   rowsPerPageOptions={[]}
//                   colSpan={8}
//                   count={rooms.length}
//                   rowsPerPage={rowsPerPage}
//                   page={page}
//                   SelectProps={{
//                     native: true,
//                   }}
//                   onChangePage={handleChangePage}
//                   onChangeRowsPerPage={handleChangeRowsPerPage}
//                 />
//               </TableRow>
//             </TableFooter>
//           </Table>
//           : <Table className={classes.table} aria-label="customized table">
//             <TableHead>
//               <TableRow>
//                 <StyledTableCell>Seat</StyledTableCell>
//                 <StyledTableCell>Zone</StyledTableCell>
//                 <StyledTableCell>Booked From</StyledTableCell>
//                 <StyledTableCell>Booked To</StyledTableCell>
//                 <StyledTableCell>Booked By</StyledTableCell>
//                 <StyledActionsTableCell>Actions</StyledActionsTableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               <TableRow>
//                 <StyledTableCell colSpan={4}>No Data Found</StyledTableCell>
//               </TableRow>
//             </TableBody>
//           </Table>
//         }
//       </TableContainer> */}
//       {/* <TablePagination
//         rowsPerPageOptions={[]}
//         component="div"
//         count={rooms.length}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onChangePage={handleChangePage}
//         // labelRowsPerPage=''
//         onChangeRowsPerPage={handleChangeRowsPerPage}
//       /> */}
//     </div>
//   );
// }