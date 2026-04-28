import api from 'api';
import React from 'react';
import Button from "../../components/CustomButtons/Button";
import { useEffect,useState } from 'react';
import { useSelector } from 'react-redux';
import Modal from '@material-ui/core/Modal';
import { makeStyles,withStyles } from '@material-ui/core/styles';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import { Grid, Typography, Card, ButtonBase, TableCell,TextareaAutosize, } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Item, TableBody, TableRow } from 'semantic-ui-react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { card } from 'assets/jss/material-dashboard-react';
import { element, object } from 'prop-types';
import { ObjectFlags } from 'typescript';
import WarningIcon from '@material-ui/icons/Warning';
import GridItem from "components/Grid/GridItem";
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Slide from '@material-ui/core/Slide';
// import Draggable from "react-draggable";
import Alert from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import Tooltip from '@material-ui/core/Tooltip';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

function rand() {
    return Math.round(Math.random() * 20) - 10;
  }
function getModalStyle() {
    const top = 50;
    const left = 50;
  
    return {
      top: `${top}%`,
      left: `${left}%`,
      transform: `translate(-${top}%, -${left}%)`,
    };
  }

  const StyledTooltip = withStyles({
    // "& .MuiTooltip-tooltip": {
    //   border: "solid skyblue 1px",
    //   color: "deepskyblue"
    // },
    tooltip: {
      color: "black",
      backgroundColor: "#FEE8DA",
      // backgroundColor: "red",
      fontSize:"12px"
    }
  })(Tooltip);
  
const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
    paper: {
      position: 'absolute',
      width: 800,
      backgroundColor: theme.palette.background.paper,
      border: '1px solid #000', // Add border style here
      // boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3),
    },
    table: {
      minWidth: 650,
      marginTop:"5vh"
    },
   
    th:{
      border: "1px solid #dddddd",
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing(-1),
      right: theme.spacing(-1),
      color:"primary"
    },
   
  }));

  const useStyles1 = makeStyles({
    table: {
      minWidth: 650,
    },
  });

  const StyledTableCell = withStyles((theme) => ({
    head: {
      // backgroundColor: theme.palette.common.black,
      // color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }))(TableCell);

  const StyledTableRow = withStyles((theme) => ({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }))(TableRow);


export default (props) => {
  // console.log("props",props)
    const classes = useStyles();
    const classes1 = useStyles1();
    const cellValue = React.useMemo(
      () => (props.valueFormatted ? props.valueFormatted : props.value),
      [props.valueFormatted, props.value]
    );  const [flag, setFlag] = React.useState(false);
  const [description,setDescription] =React.useState([]);
  const alerts = useSelector(state => state.alarm.alarmData);
  const [modalStyle] = React.useState(getModalStyle);
  const [open, setOpen] = React.useState(false);
  const [close,setClose] =React.useState([]);
  console.log("close-------------------------",Object.keys(close))
  const[handle,setHandle]=React.useState([]); 
  const[post,setPost]=React.useState(null);
  const[value,setValue]=React.useState([]);
  console.log("value",value.Possible_causes)
  const[display,setDisplay]=React.useState([]);
  const[causes,setCauses]=React.useState([]);
  console.log("causesss",causes)
  const [selectedCause, setSelectedCause] = React.useState("");
  const [inputValues, setInputValues] = useState([]);
  const [feedbacks, setFeedbacks] = React.useState(new Array(close.length).fill(''));
  const[possible,setPossible]=React.useState([]);

  const [sections, setSections] = useState([
    {
      Title: "Introduction",
      Text: ""
    },
    {
      Title: "Relationship",
      Text: ""
    },
    {
      Title: "Monitoring",
      Text: ""
    }
  ]);
  
 const handleOpen=()=>{
  setOpen(true)
 }

  const handleClose = () => {
    setOpen(false);
  };
  const handleChange = (name, email) => {
    setHandle(name)
    setDisplay(email)
  };
  const handleDisplayInfo = (name, id) => {
    let payload = {}
      payload["technician"]= handle
      payload["email"]= display
      payload["alarm_Synopsis"]= value.message
      payload["device_Name"]= value.device_name
      payload["possible_Causes"]= close
      payload["date"]= value.date

  api.alarms.getcauses_technician(payload).then(res => {
    console.log("req===================",res)
    if (res === "Accepted") {
      displayToastMessage("Mail is sent", "success");
    } else {
          console.log("not sent")
    }
    
    }

  )

  };

  const handleInputChange = (e,index, value) => {
    // console.log("ebent---------------------",e.target.value)
    const newInputValues = [...inputValues];
    
    newInputValues[index] = value;
    setInputValues(newInputValues);
  };

  const handleChange1 = (event, cause) => {
    // Check if the cause is already selected
    if (event.target.checked) {
      // If it's not selected, add it to the selectedCauses array
      setSelectedCause([...selectedCause, cause]);
    } else {
      // If it's selected, remove it from the selectedCauses array
      setSelectedCause(selectedCause.filter((c) => c !== cause));
    }
  };

  const displayToastMessage = (message, type) => {
    toast({
      description: message,
      time: 3000, // Duration of the toast message in milliseconds
      type: type, // 'success', 'info', 'warning', or 'error'
      icon: 'check circle', // The icon to display in the toast
      title: 'Notification', // The title of the toast message
    });
  };

  const handleSubmitFeedback = () => {
    const typedWords = inputValues.filter((value) => value && value.trim() !== '');
    console.log('Typed Words:', typedWords);
    // Filter out empty feedbacks
    const nonEmptyFeedbacks = feedbacks.filter((feedback) => feedback.trim() !== '');
  
    let payload = {
      id: props.data.Alarm_Id,
      technician_feedback: [
        {
          accepted: selectedCause,
          remarks: typedWords, // Use 'nonEmptyFeedbacks' here as 'remarks'
        },
      ],
      userid: localStorage.userID,
    };
  
    api.alarms.delete_alarm(payload).then((res) => {
      console.log("res-------------", payload);
    });
    displayToastMessage('Feedback saved successfully!', 'success');
  };


  const closeAlarm=()=>{
    const typedWords = inputValues.filter((value) => value && value.trim() !== '');
    console.log('Typed Words:', typedWords);
    let payload = {};
    payload["id"] = props.data.Alarm_Id;
    payload["technician_feedback"] = [
      {
        accepted: selectedCause,
        remarks: typedWords,
      },
    ];
    payload["ignore_alarm"]=true
    payload["userid"] = localStorage.userID;
    api.alarms.delete_alarm(payload).then((res) => {
      console.log("res-------------", payload);
    });
    setOpen(false);
   };
  const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

//  console.log("textfield 11111",sections)
 
  const body =(
    <div> 
        <Typography style={{fontWeight:"bold", fontFamily: "Arial"}}>Alarm Synopsis:{value.message}</Typography>
        <IconButton
        className={classes.closeButton}
        onClick={handleClose}
        color="primary"
      >
        <CancelIcon />
      </IconButton>
        <div>
            <FormControl style={{ align: 'right', marginTop: '6px' }} className={classes.formControl}>
              <InputLabel id="demo-simple-select-label">Select</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={handle}
                onChange={(e) => handleChange(e.target.value, display)}
              >
                {/* Mapping over description array */}
                {description
                  .slice()
                  .sort((a, b) => a.username.localeCompare(b.username))
                  .map((_item) => (
                  <MenuItem
                    key={_item.email}
                    value={_item.username}
                    onClick={() => handleChange(_item.username, _item.email)}
                  >
                    {_item.username}
                  </MenuItem>
                ))}
              </Select>
             
            </FormControl>
            <Button style={{
    backgroundColor: 'blue',
    padding: '6px 12px',
    fontSize: '12px',
    color:'white',
    minWidth: 'auto', // Add this property
    minHeight: 'auto', // Add this property 
    marginTop:"3vh"
  }}
  onClick={handleDisplayInfo}>
            SEND
          </Button>
          </div>
      {/* <Button style={{backgroundColor:"blue"}} onClick={() => handleDisplayInfo()} >SEND</Button> */}
      <Typography style={{textAlign:"right", marginTop:'-10vh',fontWeight:"bold"}}>Device Name:{value.device_name}</Typography>
          <Typography style={{textAlign:"right",fontWeight:"bold"}}>Date:{value.date}</Typography>
          <Typography style={{textAlign:"right",fontWeight:"bold"}}>Time:{value.time}</Typography>

        <Box boxShadow={3} style={{ width: '100%' }}>
          <TableContainer >
 <Table className={classes1.table} aria-label="simple table" boxShadow={3}>
  <TableHead>
    <TableRow>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "30px",width:'45%' }}>Possible Causes</TableCell>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "10px" }}>Status</TableCell>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "-10px"}}>Check</TableCell>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "-10px"}}>Feedback</TableCell>

    </TableRow>
  </TableHead>
       
      <TableBody>
    {Object.keys(close).map((cause, index) => (

      <TableRow key={index}>
                {/* <TableCell style={{ border: "none", padding: "1px 0",paddingLeft: "30px", borderLeft: "2px solid transparent"  }}>{cause}</TableCell> */}
                <TableCell
    style={{
      border: "none",
      padding: "1px 0",
      paddingLeft: "30px",
      borderLeft: "2px solid transparent",
    }}>
    {/* {close[cause] === "OK" ? "ok-status" : close[cause] === "Check" ? "check-status" : close[cause] === "notok" ? "not-ok-status" : ""} */}
    {close[cause] === "OK" ? (
 <div>
  <span style={{ }}>{cause}</span>
</div>
          ) : close[cause] === "Check" ? (
            <div>
             <span style={{ }}>{cause}</span>

            </div>
          ) : close[cause] === "notok" ? (
            <div>
             <span style={{ }}>{cause}</span>

            </div>
          ) : close[cause] === "Manual" ? (
            <div>
              <span style={{}}>{cause}</span>

            </div>
          ) : causes[index] === 'Closed' ? (
            <div>
             <span style={{}}>{cause}</span>

            </div>
          ) : causes[index] === 'Clean' ? (
            <div>
             <span style={{ }}>{cause}</span>

            </div>
          ) :
            causes[index] === 'Fine' ? (
              <div>
                <span style={{ }}>{cause}</span>

              </div>
            ) : (
              <></>
            )}
  
    {/* {cause} */}
  </TableCell>
        <TableCell style={{ border: "none", padding: "1px 0",paddingLeft: "-10px"}}>
        {close[cause] === "OK" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="OK" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}><CheckCircleRoundedIcon style={{ color: "#3BB143" }} /></span>
              </StyledTooltip>
            </div>
          ) : close[cause] === "Check" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Check" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <WarningIcon style={{ color: "#E9D502" }} /></span>
              </StyledTooltip>
            </div>
          ) : close[cause] === "notok" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Not ok" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <CancelIcon style={{ color: "#FF0000" }} /></span>
              </StyledTooltip>
            </div>
          ) : close[cause] === "Manual" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Manual" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <WarningIcon style={{ color: "#E9D502" }} /></span>
              </StyledTooltip>
            </div>
          ) : causes[index] === 'Closed' ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Closed" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <WarningIcon style={{ color: "#E9D502" }} /></span>
              </StyledTooltip>
            </div>
          ) : causes[index] === 'Clean' ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Clean" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}><CheckCircleRoundedIcon style={{ color: "#3BB143" }} /></span>
              </StyledTooltip>
            </div>
          ) :
            causes[index] === 'Fine' ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <StyledTooltip title="Fine" className={classes.tooltip} arrow placement='left'>
                  <span style={{ padding: "2px 5px", fontSize: "12px" }}><CheckCircleRoundedIcon style={{ color: "#3BB143" }} /></span>
                </StyledTooltip>
              </div>
            ) : (
              <></>
            )}
        </TableCell>
        <TableCell style={{ border: "none", padding: "1px 0" }}>
        <div key={index}>
          <Checkbox
              // Check if the cause is in the selectedCauses array
              checked={selectedCause.includes(cause)}
              onChange={(event) => handleChange1(event, cause)}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          {/* {cause} */}
        </div>
        </TableCell>
        <TableCell style={{ border: "none", padding: "1px 0" }}>
        <div>
          <TextField
            size="small"
            key={`outlined-basic-${index}`}
            id={`outlined-basic-${index}`} // Unique id for each TextField
            value={inputValues[index]} // Use the value from inputValues
            onChange={(e) => {
              handleInputChange(e, index, e.target.value)
              console.log("e-----------", e.target.value);
            }}            // Handle change with index
            type="text"
          />
        </div>
      </TableCell>
      {/* <TableCell style={{ border: "none", padding: "
      1px 0" }}>
      {inputValues.map((value, index) => (
  <div key={index}>
        <TextField
      // Add TextField props here
      // required
      size="small"
      id="outlined-basic"
        // autoComplete="email"    
        // autoFocus
        value={value}
        onChange={(e) => handleInputChange(index, e.target.value)}
      // inputRef={(el) => (textInputRefs.current[index] = el)} // Store the ref
      type="text"
      // textalign={"center"}
    
    />
    {/* <TextField
      // Add TextField props here
      required
      size="small"
      id="outlined-basic"
        // autoComplete="email"    
        // autoFocus
      value={feedbacks[index]}
      onChange={(event) => handleFeedbackChange(event, index)}
      // inputRef={(el) => (textInputRefs.current[index] = el)} // Store the ref
      type="text"
      textalign={"center"}
    
    /> */}
  {/* </div>
   ))}
</TableCell>  */}
     
      </TableRow>
    ))}
    {/* <button style={{textAlign:"right",marginLeft:"200%"}}onClick={handleSubmitFeedback}>Save</button> */}
    <div style={{ padding: "16px", margin: 0 }}>
  <Button
    variant="contained"
    color="primary"
    onClick={(event, index) => handleSubmitFeedback(event, index)}
    size="small"
    style={{
      textAlign: "right",
      marginLeft: "216%",
      marginTop: "-1vh",
      padding: "6px 12px", // Add padding for smaller size
      backgroundColor: "blue", // Set the background color to blue
      color: "white", // Set text color to white
    }}
  >
    Save
  </Button>
</div>

  </TableBody>
      </Table>
    </TableContainer>
       </Box>
     
       <Button variant="contained"  onClose={handleClose}onClick={closeAlarm} style={{ 
    textAlign: "right", 
    marginLeft: "84%", 
    marginTop: "1vh", 
    padding: "4px 8px", // Adjust padding to reduce the size
    fontSize: "12px",
    backgroundColor:"red",
    color:"white" // Adjust font size to reduce the size
  }}>close alarm</Button>   
        
          
     
       <SemanticToastContainer position="top-center" />   
       <div className="modal-overlay" onClick={handleClose}></div>

       </div>
  );


  

  useEffect(()=>{
    // alerts.system.map((res) =>{
    //   let mes_time=res.Measured_time.split(' ')
    //   res.date=mes_time[0]
    //   res.time=mes_time[1]
    //  })
    // setPost(alerts.system);
    
    alerts.solution.map((res) =>{
     console.log("solution",res.Possible_causes);
     
   })
    setFlag(alerts.solution); 
    api.alarms.technician_list().then(res => {
     setDescription(res);
    })

    
  },[]);

  
  
 
  

  const buttonClicked = (val) => {
    api.alarms.technician_list().then((res) => {
      setDescription(res);
    });
    // console.log("vall in buttonClicked")
    setOpen(true);
    setValue(val);
    // setShowDialogContent(true)
    // alert(`${cellValue} `);
    // console.log("clicked",`${cellValue}`)
    if (val.Possible_causes) {
      // console.log("val", val.possible_Causes)
      let card = ''
      const filteredCards = val.Possible_causes.map((card) => {
        setClose(card);
         setPossible(Object.keys(card))
        setCauses(Object.values(card))
        setOpen(true); // Open the modal

      });
      return filteredCards;

    }

  }

   
  
        
  
//  };
 
  
  return (
    <div>
     <Button style={{backgroundColor:"transparent",color:"black"}} onClick={() => buttonClicked(props.data)}>{cellValue}
   </Button>
   {/* {open && ( // Conditionally render the modal when open is true */}
    {/* <Modal
    className={classes.modal}
    // fullScreen open={open}
      open={open}
      // TransitionComponent={Transition}
     onClose={handleClose}
    // aria-describedby="simple-modal-description"
    width="740px"
    onBackdropClick={handleClose}
    //  aria-labelledby="draggable-dialog-title"
     style={modalStyle} 
     aria-labelledby="simple-modal-title"
     aria-describedby="simple-modal-description"
    //  fullScreen= style={modalStyle} "true"
  >
  <Paper className={classes.paper}> {/* Add className here */}
    {/* {body} */}
  {/* </Paper> */}
  {/* // </Modal> */} 
   {/* )} */}
   <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
      >
          <Paper className={classes.paper}> {/* Add className here */}
        {body}
        </Paper>
      </Modal>
  
    </div>
  
 
  );
};