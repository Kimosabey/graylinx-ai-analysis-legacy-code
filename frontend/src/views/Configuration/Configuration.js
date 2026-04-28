// import React, { useEffect } from 'react';
// import { Grid,FormControl,FormHelperText, TextField, Container } from '@material-ui/core';
// import { makeStyles } from '@material-ui/core/styles';
// import {
//     infoColor
//   } from "assets/jss/material-dashboard-react.js";
// import Snackbar from '@material-ui/core/Snackbar';
// import MuiAlert from '@material-ui/lab/Alert';
// import api from "../../api";
// import Button from "components/CustomButtons/Button.js";
// import GridContainer from 'components/Grid/GridContainer.js';
// import GridItem from 'components/Grid/GridItem.js';
// //import { CustomInput} from 'components/CustomInput/CustomInput';
// const useStyles = makeStyles((theme)=>({
//     mainContainer: {
//         marginTop: 20,
//         [theme.breakpoints.down('xs')]:
//             {marginRight:'5px',marginLeft:'1px'},
//         // [theme.breakpoints.up("xl")]: {
//         //     marginTop:"300px",
//         //     justifyContent:"center",
//         //     width:"2197px",
//         // },
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         alignItems: 'center',
//         boxShadow: '12px 12px 30px grey',
//         // [theme.breakpoints.down("xs")]:
//         // {marginRight:'1px'}
//     },
//     labelContainer: {
//         display: 'flex',
//         flexDirection: 'row',
//         width: "90%",
//         marginTop: '4%',
//         marginBottom: "4%",
//         // [theme.breakpoints.up("xl")]: {
//         // width: "90%",
//         // marginTop: '6%',
//         // marginBottom: "6%",
//         // },
//         // justifyContent: 'center',
//         alignItems: 'center',
//         // [theme.breakpoints.up("md")]:
//         // {width:"777px"}
//     },
//     item: {
//         direction: "row",
//         width: "80%",
//         padding: "20px",
//         marginTop: "15px",
//         marginBottom: "10px",
//     },
//     secondField: {
//         marginLeft: "18%",
//         [theme.breakpoints.down("xs")]:
//         {marginLeft:"10%"}
//     },
//     label: {
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: "15%",
//         fontSize: 18,
//         fontFamily:"'Helvetica'",
//         [theme.breakpoints.down("xs")]:
//         {fontSize:12,width:"30%"},
//         // [theme.breakpoints.up("xl")]: {
//         //  fontSize:45,
//         //  width: "35%",
//         // },
//         textAlign: 'center',
//         marginRight: "10px",
//         [theme.breakpoints.up("md")]:
//         { width:"25%"}
//     },
//     labelRoot: {
//         fontSize: 14,
//         [theme.breakpoints.up("md")]:
//         {height:"15px"},
//         [theme.breakpoints.down("xs")]:
//         {fontSize:12}
//     },
//     "&:hover .MuiInputLabel-root": {
//       color: infoColor[0],
//     //   [theme.breakpoints.up('xl')]: {
//     //     fontSize: "45px",
//     //   },
//     },
//     "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
//       borderColor: infoColor[0],
//     //   [theme.breakpoints.up('xl')]: {
//     //     fontSize: "45px",
//     //   },
//     },
//     "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-input": {
//       color: "gray",
//     //   [theme.breakpoints.up('xl')]: {
//     //     fontSize: "45px",
//     //   },
//     },
//     "& .MuiInputLabel-root.Mui-focused": {
//       color: infoColor[0],
//     //   [theme.breakpoints.up('xl')]: {
//     //     fontSize: "45px",
//     //   },
//     },
//     "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: infoColor[0],
//     //   [theme.breakpoints.up('xl')]: {
//     //     fontSize: "45px",
//     //   },
//     },
//     submitButton: {
//         width: '200px',
//         marginTop: "5%",
//         marginBottom: "10px",
//         [theme.breakpoints.down('xs')]:
//         {width:'150px'}
//     },
//     submitButtonContainer: {
//         width: "60%",
//         marginRight: "10%",
//         textAlign: 'center'
//     },
//     text:{
//         // [theme.breakpoints.down("xs")]:
//         // {marginTop:'5px'}
//     }
// }));


// export default function Configuration() {
//     const classes = useStyles();
//     const [snackbarOpen, setSnackbarOpen] = React.useState(false)
//     const [snackbarmsg, setSnackbarmsg] = React.useState('')
//     const [snackbarseverity, setSnackbarseverity] = React.useState("")
//     const [configValues, setConfigValues] = React.useState({
//         minTemp: "",
//         maxTemp: "",
//         minHum: "",
//         maxHum: "",
//         minLux: "",
//         maxLux: "",
//         overParked: "",
//         wastage: ""
//     })
//     const [errorMsg, setErrorMsg] = React.useState({
//         minTemp: "",
//         maxTemp: "",
//         minHum: "",
//         maxHum: "",
//         minLux: "",
//         maxLux: "",
//         overParked: "",
//         wastage: ""
//     })

//     useEffect(() => {
//         api.config_control.getConfigDetails()
//             .then(res => {
//                 console.log("response  for getting config details is:", res)
//                 console.log("response  temp for getting config details is:", res.temperature)
//                 setConfigValues({
//                     ...configValues,
//                     minTemp: res.temperature.min,
//                     maxTemp: res.temperature.max,
//                     minHum: res.humidity.min,
//                     maxHum: res.humidity.max,
//                     minLux: res.lux.min,
//                     maxLux: res.lux.max,
//                     overParked: res.overParked.overParked,
//                     wastage: res.wastage.wastage
//                 })
//             })
//     }, [])



//     function Alert(props) {
//        return <MuiAlert elevation={6} variant="filled" {...props} />;
//     }

//     const changeFormFields = (event, prop) => {
//         let value = event.target.value;
//         switch (prop) {
//             case "maxTemp":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, maxTemp: value })
//                     setErrorMsg({ ...errorMsg, maxTemp: "Maximum temperature value is required" })
//                 } else if (value <= configValues.minTemp) {
//                     setConfigValues({ ...configValues, maxTemp: value })
//                     setErrorMsg({ ...errorMsg, maxTemp: "Max temp value must be higher than min temp value " })
//                 }
//                 else {
//                     setConfigValues({ ...configValues, maxTemp: value })
//                     setErrorMsg({ ...errorMsg, maxTemp: "" })
//                 }
//                 break;
//             case "minTemp":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, minTemp: value })
//                     setErrorMsg({ ...errorMsg, minTemp: "Minimum temperature value is required" })
//                 } else {
//                     setConfigValues({ ...configValues, minTemp: value })
//                     setErrorMsg({ ...errorMsg, minTemp: "" })
//                 }
//                 break;
//             case "maxHum":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, maxHum: value })
//                     setErrorMsg({ ...errorMsg, maxHum: "Maximum humidity value is required" })
//                 } else if (value <= configValues.minHum) {
//                     setConfigValues({ ...configValues, maxHum: value })
//                     setErrorMsg({ ...errorMsg, maxHum: "Max humidity value must be higher than min humidity value " })
//                 }
//                 else {
//                     setConfigValues({ ...configValues, maxHum: value })
//                     setErrorMsg({ ...errorMsg, maxHum: "" })
//                 }
//                 break;
//             case "minHum":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, minHum: value })
//                     setErrorMsg({ ...errorMsg, minHum: "Minimum humidity value is required" })
//                 } else {
//                     setConfigValues({ ...configValues, minHum: value })
//                     setErrorMsg({ ...errorMsg, minHum: "" })
//                 }
//                 break;
//             case "maxLux":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, maxLux: value })
//                     setErrorMsg({ ...errorMsg, maxLux: "Maximum Lux value is required" })
//                 }
//                 else if (value <= configValues.minLux) {
//                     setConfigValues({ ...configValues, maxLux: value })
//                     setErrorMsg({ ...errorMsg, maxLux: "Max lux value must be higher than min lux value " })
//                 } else {
//                     setConfigValues({ ...configValues, maxLux: value })
//                     setErrorMsg({ ...errorMsg, maxLux: "" })
//                 }
//                 break;
//             case "minLux":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, minLux: value })
//                     setErrorMsg({ ...errorMsg, minLux: "Minimum lux value is required" })
//                 } else {
//                     setConfigValues({ ...configValues, minLux: value })
//                     setErrorMsg({ ...errorMsg, minLux: "" })
//                 }
//                 break;
//             case "overParked":
//                 if (value === "") {
//                     setConfigValues({ ...configValues, overParked: value })
//                     setErrorMsg({ ...errorMsg, overParked: "Over Parked Limit is required" })
//                 } else {
//                     setConfigValues({ ...configValues, overParked: value })
//                     setErrorMsg({ ...errorMsg, overParked: "" })
//                 }
//                 break;
//             case "wastage":
//                     if (value === "") {
//                         setConfigValues({ ...configValues, wastage: value })
//                         setErrorMsg({ ...errorMsg, wastage: "Wastage Limit is required" })
//                     } else {
//                         setConfigValues({ ...configValues, wastage: value })
//                         setErrorMsg({ ...errorMsg, wastage: "" })
//                     }
//                     break;    
//         }
//     }

//     const handleSubmit = () => { 
//         if (configValues.minTemp === "") {
//             setConfigValues({ ...configValues, minTemp: "" })
//             errorMsg.minTemp = "Minimum temp value is required"
//         }
//         if (configValues.maxTemp === "" ) {
//             setConfigValues({ ...configValues, maxTemp: "" })
//             errorMsg.maxTemp = "Maximum temp value is Required"
//         }
//         if (configValues.minHum === "") {
//             setConfigValues({ ...configValues, minHum: "" })
//             errorMsg.minHum = "Minimum humidity value is required"
//         }
//         if (configValues.maxHum === "") {
//             setConfigValues({ ...configValues, maxHum: "" })
//             errorMsg.maxHum = "Maximum humidity value is Required"
//         }
//         if (configValues.minLux === "") {
//             setConfigValues({ ...configValues, minLux: "" })
//             errorMsg.minLux = "Minimum lux value is required"
//         }
//         if (configValues.maxLux === "") {
//             setConfigValues({ ...configValues, maxLux: "" })
//             errorMsg.maxLux = "Maximum lux value is Required"
//         }
//         if (configValues.overParked === "") {
//             setConfigValues({ ...configValues, overParked: "" })
//             errorMsg.overParked = "Overparked value is Required"
//         }
//         if (configValues.wastage === "") {
//             setConfigValues({ ...configValues, wastage: "" })
//             errorMsg.overParked = "wastage value is Required"
//         }
//         if (errorMsg.minTemp === "" && errorMsg.maxTemp === "" && errorMsg.minHum === "" && errorMsg.maxHum === ""
//             && errorMsg.minLux === "" && errorMsg.maxLux === "" && errorMsg.overParked === "" && errorMsg.wastage === "" &&
//             configValues.minTemp !== "" && configValues.maxTemp !== "" && configValues.minHum !== ""
//             && configValues.maxHum !== "" && configValues.minLux !== "" && configValues.maxLux !== "" && configValues.overParked !== ""  && configValues.wastage !== "") {
//                 const data = {
//                 minTemp: configValues.minTemp,
//                 maxTemp: configValues.maxTemp,
//                 minHum: configValues.minHum,
//                 maxHum: configValues.maxHum,
//                 minLux: configValues.minLux,
//                 maxLux: configValues.maxLux,
//                 overParked: configValues.overParked,
//                 wastage: configValues.wastage
//             }
//             api.config_control.configuration(data)
//                 .then(res => {
//                     console.log(res);
//                     if (res.message === "Success") {
//                         setSnackbarOpen(true)
//                         setSnackbarseverity("success")
//                         setSnackbarmsg('Values are successfully configured')
//                     } else if (res.message === "Failure") {
//                         setSnackbarOpen(true)
//                         setSnackbarseverity("error")
//                         setSnackbarmsg('Sorry values are not configured')
//                     }
//                 })
//                 .catch(error => {
//                     console.log("error is", error)
//                 });
//         } 
//     }

//     const snackbarClose = (event, reason) => {
//         if (reason === 'clickaway') {
//             return;
//         }
//         setSnackbarOpen(false);
//     };

//     return (
//         <Container maxWidth="lg" spacing={8}>
//             <GridContainer>
//                 <GridItem xs={12} sm={12} md={12} lg={12} xl={12}>
//             <div className={classes.mainContainer}>
//                 <Snackbar
//                     anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
//                     open={snackbarOpen}
//                     autoHideDuration={3000}
//                     onClose={snackbarClose}>
//                     <Alert onClose={snackbarClose} severity={snackbarseverity} className={classes.snackbar}>
//                         {snackbarmsg}
//                     </Alert>
//                 </Snackbar>
//                 <div className={classes.labelContainer}>
//                     <label className={classes.label}>
//                         Temperature:
//                     </label>
//                     {/* <Grid container marginLeft="20%"  > */}
//                         <FormControl error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 fullWidth
//                                 id="minTemp"
//                                 label="Min Temp (°C)"
//                                 type="number"
//                                 value={configValues.minTemp}
//                                 onChange={event => changeFormFields(event, "minTemp")}
//                             />
//                             {errorMsg.minTemp !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.minTemp}</FormHelperText>
//                             }
//                         </FormControl>
//                         <FormControl className={classes.secondField} error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 fullWidth
//                                 id="maxTemp"
//                                 label="Max Temp (°C)"
//                                 name="maxTemp"
//                                 type="number"
//                                 value={configValues.maxTemp}
//                                 onChange={event => changeFormFields(event, "maxTemp")}
//                             />
//                             {errorMsg.maxTemp !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.maxTemp}</FormHelperText>
//                             }
//                         </FormControl>
//                     {/* </Grid> */}
//                 </div>
//                 <div className={classes.labelContainer}>
//                     <label className={classes.label}>
//                         Humidity:
//                     </label>
//                     {/* <Grid container marginLeft="20%"  > */}
//                         <FormControl error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="minHum"
//                                 label="Min Hum (RH)"
//                                 type="number"
//                                 value={configValues.minHum}
//                                 onChange={event => changeFormFields(event, "minHum")}
//                             />
//                             {errorMsg.minHum !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.minHum}</FormHelperText>
//                             }
//                         </FormControl>
//                         <FormControl className={classes.secondField} error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="maxHum"
//                                 label="Max Hum (RH)"
//                                 type="number"
//                                 value={configValues.maxHum}
//                                 onChange={event => changeFormFields(event, "maxHum")}
//                             />
//                             {errorMsg.maxHum !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.maxHum}</FormHelperText>
//                             }
//                         </FormControl>
//                     {/* </Grid> */}
//                 </div>
//                 <div className={classes.labelContainer}>
//                     <label className={classes.label}>
//                         Luminosity:
//                     </label>
//                     {/* <Grid container marginLeft="20%"  > */}
//                         <FormControl error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="minLux"
//                                 label="Min Lux (lx)"
//                                 type="number"
//                                 value={configValues.minLux}
//                                 onChange={event => changeFormFields(event, "minLux")}
//                             />
//                             {errorMsg.minLux !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.minLux}</FormHelperText>
//                             }
//                         </FormControl>
//                         <FormControl className={classes.secondField} error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="maxLux"
//                                 label="Max Lux (lx)"
//                                 type="number"
//                                 value={configValues.maxLux}
//                                 onChange={event => changeFormFields(event, "maxLux")}
//                             />
//                             {errorMsg.maxLux !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.maxLux}</FormHelperText>
//                             }
//                         </FormControl>
//                     {/* </Grid> */}
//                 </div>
//                 <div className={classes.labelContainer}>
//                     <label className={classes.label}>
//                         Parking Limit:
//                     </label>
//                     {/* <Grid container marginLeft="20%"  > */}
//                         <FormControl error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="overParked"
//                                 label="Parking Limit (hr)"
//                                 type="number"
//                                 value={configValues.overParked}
//                                 onChange={event => changeFormFields(event, "overParked")}
//                             />
//                             {errorMsg.overParked !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.overParked}</FormHelperText>
//                             }
//                         </FormControl>
//                     {/* </Grid> */}
//                 </div>
//                 <div className={classes.labelContainer}>
//                     <label className={classes.label}>
//                         Wastage:
//                     </label>
//                     {/* <Grid container marginLeft="20%"  > */}
//                         <FormControl error>
//                             <TextField  className={classes.textfield}
//                                 InputLabelProps={{
//                                     classes: {
//                                         root: classes.labelRoot
//                                     }
//                                 }}
//                                 className={classes.text}
//                                 size="small"
//                                 variant="outlined"
//                                 id="wastage"
//                                 label="Wastage Limit (%)"
//                                 type="number"
//                                 value={configValues.wastage}
//                                 onChange={event => changeFormFields(event, "wastage")}
//                             />
//                             {errorMsg.wastage !== "" &&
//                                 <FormHelperText className={classes.snackbar}>{errorMsg.wastage}</FormHelperText>
//                             }
//                         </FormControl>
//                     {/* </Grid> */}
//                 </div>
//                 <div className={classes.submitButtonContainer}>
//                     <Button style={{"backgroundColor":"#00acc1"}} variant="contained" color="primary" className={classes.submitButton} onClick={handleSubmit}>
//                         Submit
//                    </Button>
//                 </div>
//             </div>
//             </GridItem>
//             </GridContainer>
//         </Container>
//     )
// }
