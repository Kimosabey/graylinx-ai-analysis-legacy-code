// import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//     Container,
//     Grid,
//     FormControl,
//     TextField,
//     Typography,
//     FormHelperText,

// } from '@material-ui/core';
// import Button from "components/CustomButtons/Button.js";
// import {
//     infoColor
//   } from "assets/jss/material-dashboard-react.js"; 
// import {
//     MuiPickersUtilsProvider,
//     KeyboardDateTimePicker
// } from '@material-ui/pickers';
// import 'date-fns';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import DateFnsUtils from '@date-io/date-fns';
// import moment from 'moment';
// import IconButton from "@material-ui/core/IconButton";
// import CloseIcon from '@material-ui/icons/Close';


// const crossImage = require('assets/img/cross.png');
// const useStyles = makeStyles(theme => ({
//     paper: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'absolute',
//         width: 700,
//         height: 550,
//         [theme.breakpoints.down('xs')]: {
//             width: "280px",
//             height: "590px"
//         },
//         backgroundColor: theme.palette.background.paper,
//         boxShadow: theme.shadows[5],
//         borderRadius: 20
//     },
//     cancelPaper: {
//         flexDirection: 'column',
//         alignItems: 'center',
//         textAlign: 'center',
//         justifyContent: 'center',
//         position: 'absolute',
//         width: 500,
//         height: 300,
//         [theme.breakpoints.down('xs')]: {
//             width: "320px",
//             height: "350px"
//         },
//         backgroundColor: theme.palette.background.paper,
//         boxShadow: theme.shadows[5],
//         borderRadius: 20
//     },
//     dateTextField: {
//         [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//             height:"108px",
//             padding:"23px"
//         },
//         "& .MuiOutlinedInput-input": {
//           color: "gray",
//           // [theme.breakpoints.up('xl')]: {
//           //   fontSize: "45px",
//           // },
//         },
//         "& .MuiInputLabel-root": {
//           color: "gray",
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "50px",
//             padding:"20px",
//             lineHeight:"2px"
//           },
//         },
//         "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//           borderColor: "gray",
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "&:hover .MuiOutlinedInput-input": {
//           color: infoColor[0],
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "&:hover .MuiInputLabel-root": {
//           color: infoColor[0],
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//           borderColor: infoColor[0],
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
//           color: "gray",
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "& .MuiInputLabel-root.Mui-focused": {
//           color: infoColor[0],
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//         "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//           borderColor: infoColor[0],
//           [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//           },
//         },
//       },
//     formControl: {
//         flexDirection: "row",
//         alignSelf: "center",
//         textAlign: "center",
//         width: "80%"
//     },
//     textFieldContainer: {
//         display: "flex",
//         flexDirection: "row",
//         justifyContent: "flex-start",
//         marginLeft: 30,
//         alignItems: 'flex-end'
//     },
//     textStyle: {
//         fontSize: 18,
//         [theme.breakpoints.up('xl')]: {
//             fontsize: "50px",
//             // height:"100px"
//         },
//         marginBottom: 10,
//         width: 100,
//         color: 'black'
//     },
//     textField: {
//         width: '90%',
//         marginLeft: '5%'
//     },
//     submitButton: {
//         marginTop: 30,
//         width: '200px'
//     },
//     yesNoButton: {
//         marginTop: 30,
//         width: '100px',
//         [theme.breakpoints.up('xl')]: {
//             fontSize: "36px",
//             marginTop: "30px",
//             width: "105px"
//         }
//     },
//     crossImage: {
//         marginTop: "20px",
//         height: "50px",
//         width: "50px"
//     },
//     submitButtonContainer: {
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginTop: 20
//     },
//     buttonsContainer: {
//         display: 'flex',
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         alignItems: 'center',
//     },
//     modal: {
//         font: 28,
//         marginTop: 20,
//         [theme.breakpoints.up('xl')]: {
//             fontSize: "50px",
//             marginTop: "20px"
//         }
//     },
//     modaltext: {
//         marginTop: 25,
//         fontSize: 18,
//         [theme.breakpoints.up('xl')]: {
//             fontSize: "45px",
//             marginTop: "25px"
//         }
//     },
//     typo:{
//       marginLeft: 250,
//       marginTop: 10, 
//       fontSize: 18, 
//       color: 'black', 
//       "textTransform": "capitalize",
//       [theme.breakpoints.down('xs')]:{
//           marginLeft:25
//       }
//     }
// }));

// function getModalStyle() {
//     const top = 50
//     const left = 50
//     return {
//         top: `${top}%`,
//         left: `${left}%`,
//         transform: `translate(-${top}%, -${left}%)`,
//     };
// }

// export default function EditDeleteModal(props) {
//     const classes = useStyles();
//     const [modalStyle] = React.useState(getModalStyle);
//     const [fromDateTime, setFromDateTime] = React.useState(props.clientFromTime);
//     const [toDateTime, setToDateTime] = React.useState(props.clientToTime);
//     const [errorMsg, setErrorMsg] = React.useState({
//         date: ""
//     })
//     const [loading, setLoading] = React.useState(false);

//     const handleSubmit = () => {
//         var from = moment(fromDateTime).format("YYYY-MM-DD HH:mm:ss");
//         var to = moment(toDateTime).format("YYYY-MM-DD HH:mm:ss");
//         localStorage.from = from;
//         localStorage.to = to;
//         var diff = moment.duration(moment(to).diff(moment(from)));
//         if (diff._data.minutes >= 30 || diff._data.hours >= 1
//                 || diff._data.days >= 1 || diff._data.months >= 1)  {
//             setErrorMsg({ ...errorMsg, date: "" })
//             props.onSubmitClick()
//             props.crossButton()
//         }
//         else {
//             setErrorMsg({ ...errorMsg, date: "Minimum time chosen should be 30 mins ahead of From time" })
//         }

//     }

//     const onYesClick = () => {
//         props.onYesClick()
//     }

//     const onNoClick = () => {
//         props.onNoClick()
//     }

//     const onDateChange = (event) => {
//         let formated = moment(event.target.value).format("YYYY-MM-DDTHH:mm")
//         setFromDateTime(formated)
//       }

//     return ( 
//         <Container maxWidth="lg">
//             {(props.edit === true) &&
//                 <div className={classes.paper} style={modalStyle} >
//                     <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
//                         <Typography className={classes.typo}>
//                             {(props.clientBookedRoom)}
//                         </Typography>
//                         <IconButton style={{ marginRight: 15, marginTop: 5 }} onClick={props.crossButton}>
//                             <CloseIcon />
//                         </IconButton>
//                     </div>
//                     <div style={{ marginTop: 20 }}>
//                         <div className={classes.textFieldContainer}>
//                             <Typography className={classes.textStyle} >
//                                 Name:
//                     </Typography>
//                             <FormControl className={classes.formControl} >
//                                 <TextField
//                                     className={classes.textField}
//                                     size="small"
//                                     margin="normal"
//                                     variant="filled"
//                                     disabled={true}
//                                     id="key"
//                                     value={props.clientName}
//                                 />
//                             </FormControl>
//                         </div>
//                         <div className={classes.textFieldContainer}>
//                             <Typography className={classes.textStyle} >
//                                 E-Mail ID:
//                     </Typography>
//                             <FormControl className={classes.formControl} >
//                                 <TextField
//                                     className={classes.textField}
//                                     size="small"
//                                     variant="filled"
//                                     margin="normal"
//                                     disabled={true}
//                                     id="key"
//                                     value={props.clientEmailId}
//                                 />
//                             </FormControl>
//                         </div>
//                         <div className={classes.textFieldContainer}>
//                             <Typography align="center" className={classes.textStyle} >
//                                 Contact No:
//                     </Typography>
//                             <FormControl className={classes.formControl} >
//                                 <TextField
//                                     className={classes.textField}
//                                     size="small"
//                                     variant="filled"
//                                     margin="normal"
//                                     disabled={true}
//                                     id="key"
//                                     value={props.clientContactNo}
//                                 />
//                             </FormControl>
//                         </div>
//                     </div>
//                     <div style={{ marginTop: 25 }}>
//                         <Grid container justify="space-around">
//                             <FormControl>
//                                 <TextField
//                                     size="medium"
//                                     className={classes.dateTextField}
//                                     margin="normal"
//                                     id="datetime-local"
//                                     label="From"
//                                     type="datetime-local"
//                                     InputProps={{
//                                         inputProps: {
//                                             min: moment(new Date()).format("YYYY-MM-DDTHH:mm")
//                                         },
//                                         classes: { underline: classes.underline }
//                                     }}
//                                     value={moment(fromDateTime).format("YYYY-MM-DDTHH:mm")}
//                                     onChange={onDateChange}
//                                 />
//                             </FormControl>
//                             <FormControl error>
//                                 <TextField
//                                     size="medium"
//                                     className={classes.dateTextField}
//                                     margin="normal"
//                                     id="datetime-local"
//                                     label="To"
//                                     type="datetime-local"
//                                     InputProps={{
//                                         inputProps: {
//                                             min: moment(new Date()).format("YYYY-MM-DDTHH:mm")
//                                         },
//                                         classes: { underline: classes.underline }
//                                     }}
//                                     value={moment(toDateTime).format("YYYY-MM-DDTHH:mm")}
//                                     onChange={event => setToDateTime(event.target.value)}
//                                 />
//                                 {errorMsg.date !== "" &&
//                                     <FormHelperText className={classes.menu}>{errorMsg.date}</FormHelperText>
//                                 }
//                             </FormControl>
//                         </Grid>
//                     </div>
//                     <div className={classes.submitButtonContainer}>
//                         <Button className={classes.submitButton} variant="contained" color="info" onClick={handleSubmit} >
//                             {loading && <CircularProgress color="secondary" size={14} />}
//                             {!loading && 'Submit'}
//                         </Button>
//                     </div>
//                 </div>
//             }
//             {(props.delete === true) &&
//                 <div className={classes.cancelPaper} style={modalStyle}>
//                     <img className={classes.crossImage} src={crossImage} alt="crossImage" />
//                     <Typography align='center' className={classes.modaltext} >
//                         Are you sure?
//                     </Typography>
//                     <Typography align='center' className={classes.modal}>
//                         {props.text}
//                         {/* Do you really want to cancel the booking? This process cannot be undone. */}
//                     </Typography>
//                     <div className={classes.buttonsContainer}>
//                         <Button className={classes.yesNoButton} variant="contained" color="danger" onClick={onYesClick} >
//                             {loading && <CircularProgress color="secondary" size={14} />}
//                             {!loading && 'Yes'}
//                         </Button>
//                         <Button className={classes.yesNoButton} variant="contained" color="default" onClick={onNoClick} >
//                             {loading && <CircularProgress color="secondary" size={14} />}
//                             {!loading && 'No'}
//                         </Button>
//                     </div>
//                 </div>
//             }
//         </Container>
//     )
// }