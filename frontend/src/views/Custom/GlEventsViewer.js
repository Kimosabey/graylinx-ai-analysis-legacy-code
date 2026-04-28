import React, { useEffect,useCallback, useRef } from 'react';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { useSelector,useDispatch } from 'react-redux';
import api from "../../api";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import Button from "../../components/CustomButtons/Button";
import Grid from '@material-ui/core/Grid';
import { makeStyles,withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import { Typography, Card, ButtonBase, TableCell,TextareaAutosize, } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Box from '@material-ui/core/Box';
import { Item, TableBody, TableRow } from 'semantic-ui-react';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import MenuItem from '@material-ui/core/MenuItem';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import WarningIcon from '@material-ui/icons/Warning';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import TotalValueRenderer from './totalValueRenderer.jsx';


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

export default (props) => {
  const classes = useStyles();
  const classes1 = useStyles1();
  const gridRef = useRef();
  const alerts = useSelector(state => state.alarm.alarmData);
  const [test, setTest] = React.useState([]);
  const [inputValues, setInputValues] = React.useState([]);
  const [flag, setFlag] = React.useState(false);
  const [selectedCause, setSelectedCause] = React.useState("");
  const [clickedRows, setClickedRows] = React.useState([]);
  const [clickedRows1, setClickedRows1] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [techncianlist,setTechnicanlist] =React.useState([]);
  const[value,setValue]=React.useState([]);
  const [close,setClose] =React.useState([]);
  const[possible,setPossible]=React.useState([]);
  const[causes,setCauses]=React.useState([]);
  const [modalStyle] = React.useState(getModalStyle);
  const[handle,setHandle]=React.useState([]); 
  const[display,setDisplay]=React.useState([]);
  const[handle1,setHandle1]=React.useState([]); 
  const[display1,setDisplay1]=React.useState([]);
  const [feedbacks, setFeedbacks] = React.useState(new Array(close.length).fill(''));
  const [devicename,setDevicename]=React.useState([]);
  const [devicedate,setDevicedate]=React.useState([]);
  const [devicetime,setDevicetime]=React.useState([]);
  const [possiblecauses,setPossiblecauses]=React.useState([]);
  // console.log("possible",possiblecauses)
  const [message,setMessage]=React.useState([]);
  const [desc,setDesc]=React.useState([]);
  // console.log("desc",desc.possible_Causes)
  const typedWords = inputValues.filter((value) => value && value.trim() !== '');
  const[post,setPost]=React.useState(null);
  const[criticalname,setCritcialname]=React.useState([]);
  const[criticalmail,setCritcialmail]=React.useState([]);
  const[noncriticalname,setNonCritcialname]=React.useState([]);
  const[noncriticalmail,setNonCritcialmail]=React.useState([]);
  const [acknowledgedRows, setAcknowledgedRows] = React.useState({});
  const [restoredrows,setRestoredrows]=React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [clicked, setClicked] = React.useState(false);
  const [clickedStates, setClickedStates] = React.useState({});
  const [clickedack,setClickedack]=React.useState({});

  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const dispatch = useDispatch();

  
  useEffect(() => {
    const fetchData = async () => {
    
        const updatedTest = alerts.solution.map((res, index) => {
          let mes_time = res.Measured_time.split(' ');
          res.date = mes_time[0];
          res.time = mes_time[1];
          res.id = index; // Add a unique identifier to each row
          return res;
        });
        // Sort the rows based on the unique identifier
        updatedTest.sort((a, b) => a.id - b.id);
        setTest(updatedTest);
  
        const updatedTest1 = alerts.system.map((res, index) => {
          let mes_time = res.
          Measured_time.split(' ');
          res.date = mes_time[0];
          res.time = mes_time[1];
          res.id = index; // Add a unique identifier to each row
          return res;
        });

        updatedTest1.sort((a, b) => a.id - b.id);
        setPost(updatedTest1);
      };
    
      api.alarms.technician_list().then((res) => {
        setTechnicanlist(res);
      });

      //     api.notifications.alarm(buildingID).then((res) => {
      //       dispatch({
      //           type: "alarm",
      //           payload: res,
      //       });
      //   })
      //   .catch((error)=>{
      //   // setOpenerr(true);
      //   console.log("newdashboard alarms error",error)
      // })
     
      

    fetchData();
  }, [alerts]);

  const closeAlarm = (data) => {
    // console.log("dataclose",data)
    const typedWords = inputValues.filter((value) => value && value.trim() !== '');
    let payload = {};
    payload["id"] = data.Alarm_Id;
    payload["technician_feedback"] = [
      {
        accepted: selectedCause,
        remarks: typedWords,
      },
    ];
    payload["ignore_alarm"] = true;
    payload["userid"] = localStorage.userID;
  
    // Call the API to delete the alarm
    api.alarms.delete_alarm(payload)
      .then((res) => {
        // console.log("res--1111111-----------", payload);
        // If the API call is successful, close the modal
        setOpen(false);
      })
      .catch((error) => {
        // Handle errors if necessary
        console.error("Error deleting alarm:", error);
      });
  };
  const handleClose = () => {
    setOpen(false);
  };

  const handleDisplayInfo = (name, id) => {
    let payload = {}
      payload["technician"]= techncianlist
      payload["email"]= display
      payload["alarm_Synopsis"]= value.message
      payload["device_Name"]= value.device_name
      payload["possible_Causes"]= possiblecauses
      payload["date"]= value.date

  api.alarms.getcauses_technician(payload).then(res => {
    // console.log("req===================",res)
    if (res === "Accepted") {
      displayToastMessage("Mail is sent", "success");
    } else {
          console.log("not sent")
    }
    
    }

  )

  };

  const handleChange = (name, email) => {
    setHandle(name)
    setDisplay(email)
  };

  const handleChangecritical= (name, email) => {
    setCritcialname(name)
    setCritcialmail(email)
  };

  const handleChangenoncritical= (name, email) => {
    setNonCritcialname(name)
    setNonCritcialmail(email)
  };



  
const body =(
    <div> 
        <Typography style={{fontWeight:"bold", fontFamily: "Arial",marginLeft:"2vh"}}>Alarm Synopsis:{message}</Typography>
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
               {techncianlist
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
          <Typography style={{textAlign:"right", marginTop:'-10vh',fontWeight:"bold"}}>Device Name:{devicename}</Typography>
          <Typography style={{textAlign:"right",fontWeight:"bold"}}>Date:{devicedate}</Typography>
          <Typography style={{textAlign:"right",fontWeight:"bold"}}>Time:{devicetime}</Typography>
          
          <Box boxShadow={3} style={{ width: '100%' }}>
          <TableContainer >
 <Table className={classes1.table} aria-label="simple table" boxShadow={3}>
  <TableHead>
    <TableRow>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "30px",width:'45%' }}>Possible Causes</TableCell>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "10px" }}>Status</TableCell>
      <TableCell style={{ fontWeight: "bold", fontSize: "15px", fontFamily: "sans-serif",paddingLeft: "-10px"}}>Feedback</TableCell>

    </TableRow>
  </TableHead>

  <TableBody>
    {Object.keys(possiblecauses).map((cause, index) => (

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
    {possiblecauses[cause] === "OK" ? (
 <div>
  <span style={{ }}>{cause}</span>
</div>
          ) : possiblecauses[cause] === "Check" ? (
            <div>
             <span style={{ }}>{cause}</span>

            </div>
          ) : possiblecauses[cause] === "notok" ? (
            <div>
             <span style={{ }}>{cause}</span>

            </div>
          ) : possiblecauses[cause] === "Manual" ? (
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
            ) : 
              causes[index] === 'Faulty' ? (
                <div>
                  <span style={{ }}>{cause}</span>
  
                </div>
              ) : (
              <></>
            )}
  
    {/* {cause} */}
  </TableCell>
        <TableCell style={{ border: "none", padding: "1px 0",paddingLeft: "-10px"}}>
        {possiblecauses[cause] === "OK" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="OK" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}><CheckCircleRoundedIcon style={{ color: "#3BB143" }} /></span>
              </StyledTooltip>
            </div>
          ) : possiblecauses[cause] === "Check" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Check" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <WarningIcon style={{ color: "#E9D502" }} /></span>
              </StyledTooltip>
            </div>
          ) : possiblecauses[cause] === "notok" ? (
            <div style={{ display: "flex", alignItems: "center" }}>
              <StyledTooltip title="Faulty" className={classes.tooltip} arrow placement='left'>
                <span style={{ padding: "2px 5px", fontSize: "12px" }}> <CancelIcon style={{ color: "#FF0000" }} /></span>
              </StyledTooltip>
            </div>
          ) : possiblecauses[cause] === "Manual" ? (
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
            ) :
            causes[index] === 'Faulty' ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <StyledTooltip title="Faulty" className={classes.tooltip} arrow placement='left'>
                  <span style={{ padding: "2px 5px", fontSize: "12px" }}><CancelIcon style={{ color: "#FF0000" }} /></span>
                </StyledTooltip>
              </div>
            ) :
            (
              <></>
            )}
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
              // console.log("e-----------", e.target.value);
            }}            // Handle change with index
            type="text"
          />
        </div>
      </TableCell>
     
     
      </TableRow>
    ))}
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

  <Button variant="contained"  onClose={handleClose}  onClick={() => closeAlarm(desc)} style={{ 
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


  
  
  const isButtonClicked = (id) => {
    return clickedRows.includes(id);
  };

 

 
 


  const handleDescriptionClick = (is) => {
    // console.log("val===========================",is);
    setDesc(is)
    const measuredTimeParts = is.Measured_time.split(' '); // Split the Measured_time string into an array
  const date = measuredTimeParts[0]; // First part is the date
  const time = measuredTimeParts[1]; // Second part is the time
  setDevicedate(date);
  setDevicetime(time);
  setMessage(is.message)
  setDevicename(is.device_name); 
    api.alarms.technician_list().then((res) => {
      setTechnicanlist(res);
    });
    setOpen(true);
    if (is.Possible_causes) {
      const filteredCards = is.Possible_causes.map((card) => {
        // console.log("card",card);
        setPossiblecauses(card)
         setPossible(Object.keys(card))
        setCauses(Object.values(card))
        // setOpen(true); // Open the modal

      });
      return filteredCards;

    }
  };
  

  const buttonClicked = (data) => {
      //  console.log("val",data.Alarm_Id)

    let payload = {};
    payload["id"] = data.Alarm_Id;
    payload["technician_feedback"] = [
      {
        accepted: selectedCause,
        remarks: typedWords,
      },
    ];
    payload["ignore_alarm"] = true;
    payload["userid"] = localStorage.userID;
  
  
    api.alarms.delete_alarm(payload).then(res=>{
      setClickedRows(prevClickedRows => [...prevClickedRows, data.Alarm_Id]);


    })
  };

  const isAckClicked = (alarmId) => {
    return acknowledgedRows[alarmId] === true;
  };

  

  const buttonAckClicked = (data) => {
    let payload = {};
    payload["id"] = data.Alarm_Id;
    payload["userid"] = localStorage.getItem('userID');

    api.alarms.acknowledge_alarm(payload)
      .then(res => {
        // Update acknowledgedRows state
        setAcknowledgedRows({
          ...acknowledgedRows,
          [data.Alarm_Id]: true
        });
      })
      .catch(error => {
        console.error("Error acknowledging alarm:", error);
        // Handle error if needed
      });
  
    };

  const isStatusClicked = (alarmId) => {
      return restoredrows[alarmId] === true;
    };


    const buttonopenclicked = (data) => {
      let payload = {
        id: data['Alarm_Id'],
        userid: localStorage.getItem('userID'),
        ss_id:data['device_id'],
        ss_type:data['Category'],
        alarm_code:data['Alarm Code']
  };
  
      api.alarms.getrestorealarms(payload)
        .then(res => {
        })
        .catch(error => {
          console.error("Error while getting restore alarms:", error);
        });
  
      const updatedClickedStates = { ...clickedStates };
      updatedClickedStates[data.Alarm_Id] = !clickedStates[data.Alarm_Id];
      setClickedStates(updatedClickedStates);
    };


  const columns = [
    { field: 'Device_name', filter: true, width: 140, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'date', filter: 'agDateColumnFilter', width: 150, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'time', width:100, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'Description', width: 330, sortable: true, lockPosition: 'left', tooltipField: 'Description', cellStyle: { 'border-right-color': '#e2e2e2' } ,cellRendererFramework: ({ data }) => (
      <div 
      // onClick={() => handleDescriptionClick(data)}
      >
        {data.Description}
      </div>
    )},
    {
      field: 'Acknowledgement',
      width: 200,
      sortable: true,
      lockPosition: 'left',
      // cellRendererFramework: ({ data }) => (
      //   <Button 
      //   variant="contained" 
      //   color={isAckClicked(data.Alarm_Id) ? "transparent" : "danger"} 
      //   onClick={() => buttonAckClicked(data)}
      // >
      //   {isAckClicked(data.Alarm_Id) ? "Acknowledged" : "ACK"}
      // </Button>
      // ),
      cellStyle: { 'border-right-color': '#e2e2e2' },
      cellRenderer: TotalValueRenderer
    },
    { field: 'Status',   width: 150, 
    sortable: true, 
    lockPosition: 'left', 
    cellRendererFramework: ({ data }) => {
      const isClicked = clickedStates[data.Alarm_Id] || false;
      const buttonColor = isClicked ? "transparent" : "#FF0000";
      // console.log("buttoncolour",buttonColor)
      return (
        <Button 
      variant="contained" 
      color={clickedStates[data.Alarm_Id] ? "transparent" : "#FF0000"}
      onClick={() => buttonopenclicked(data)}
      disabled={isStatusClicked(data.Alarm_Id)} // Disable the button if already clicked
    >
      Restore
    </Button>
      );
    },
    
    cellStyle: { 'border-right-color': '#e2e2e2' }
    }


    
  ];

  const columnDefs = [
    { field: 'Device_name', filter: true, width: 150, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'date', filter: 'agDateColumnFilter', width: 150, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'time', width: 100, sortable: true, lockPosition: 'left', tooltipField: 'Device_name', cellStyle: { 'border-right-color': '#e2e2e2' } },
    { field: 'Description', width: 330, sortable: true, lockPosition: 'left', tooltipField: 'Description', cellStyle: { 'border-right-color': '#e2e2e2' } ,cellRendererFramework: ({ data }) => (
      <div 
      onClick={() => handleDescriptionClick(data)}
      >
        {data.Description}
      </div>
    )},
    {
      field: 'Ignore alarm',
      width: 150,
      sortable: true,
      lockPosition: 'left',
      cellRendererFramework: ({ data }) => {
        const buttonColor = isButtonClicked(data.Alarm_Id) ? "transparent" : "danger";
        return (
          <Button
            variant="contained"
            color={buttonColor}
            onClick={() => buttonClicked(data)}
          >
            Ignore
          </Button>
        );
      },
      cellStyle: { 'borderRightColor': '#e2e2e2' }
    },
    { field: 'Status', width: 250, sortable: true, lockPosition: 'left',
    cellRendererFramework: ({ data }) => {
      const isClicked = clickedStates[data.Alarm_Id] || false;
      const buttonColor = isClicked ? "transparent" : "red";
      return (
        <Button 
          variant="contained" 
          color={buttonColor}
          onClick={() => buttonopenclicked(data)}
          disabled={isClicked} // Disable the button if already clicked
        >
          Restore
          {isStatusClicked(data.Alarm_Id)}
        </Button>
      );
    },
    cellStyle: { 'border-right-color': '#e2e2e2' }
  }
  // Your other code

    
  ];
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

  const handleInputChange = (e,index, value) => {
    // console.log("ebent---------------------",e.target.value)
    const newInputValues = [...inputValues];
    
    newInputValues[index] = value;
    setInputValues(newInputValues);
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

  const handleSubmitFeedback = (id) => {
    const typedWords = inputValues.filter((value) => value && value.trim() !== '');
    const nonEmptyFeedbacks = feedbacks.filter((feedback) => feedback.trim() !== '');

    let payload = {
      id: id,
      technician_feedback: [
        {
          accepted: selectedCause,
          remarks: nonEmptyFeedbacks, // Use 'nonEmptyFeedbacks' here as 'remarks'
        },
      ],
      userid: localStorage.userID,
    };

    // console.log('Payload before sending:', payload);

    // api.alarms.delete_alarm(payload).then((res) => {
    //   console.log('Response:', res);
    // });
    displayToastMessage('Feedback saved successfully!', 'success');
};


  const onBtExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  const handlealarms1= (name, id) => {
    let arr=[]
      post.map((res)=>{
        let data={};
        data["technician"]= criticalname
        data["email"]= criticalmail
        data["Device_name"]= res.Device_name
        data["date"]= res.date
        data["Description"]= res.Description
        data["time"]= res.Measured_time
        api.alarms.getcauses_technician(data).then(res => {
          if(res=="MAIL IS SENT"){
            toast({
              description:"mail is sent",
              time: 3000,
              type: "success",
              icon: "check circle",
              title: "Success",
            })
          } else {
                console.log("not sent")
          }
          
          }
      
        )
      arr.push(data)})
      // console.log("handleeeeeeeeeeeeeee",arr)
    

  
   
  
    };

    const handlealarms = (name, id) => {
      let arr = [];
      let mailSent = false; // Flag to track if mail has been sent
    
      test.map((res) => {
        let data = {};
        data["technician"] = noncriticalname;
        data["email"] = noncriticalmail;
        data["Device_name"] = res.Device_name;
        data["date"] = res.date;
        data["Description"] = res.Description;
        data["time"] = res.Measured_time;
    
        api.alarms.getcauses_technician(data).then((res) => {
          // console.log("resctech",res)
          if (!mailSent) { // Only proceed if mail has not been sent
            if (res == "MAIL IS SENT") {
              mailSent = true; // Set the flag to true after mail is sent
              toast({
                description: "Mail is sent",
                time: 3000,
                type: "success",
                icon: "check circle",
                title: "Success",
              });
            } else {
              console.log("Mail not sent");
            }
          }
        });
    
        arr.push(data);
      });
    
      // console.log("handleeeeeeeeeeeeeee", arr);
    };

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={4}>
          <div style={{fontWeight:'bold',marginLeft:"2vh",fontSize:"2vh"}}>Critical Alarms</div>
          </Grid>
          {/* <Grid item xs={4}>   
          </Grid> */}
          {/* <Grid item xs={4} style={{display:'flex',justifyContent:'right'}}>
          <button
            onClick={onBtExport}
            style={{fontWeight: 'bold'}}
          >
            Export to Csv
          </button>
          </Grid> */}
          <Grid item xs={12} sm={12} md={12} xl={12}>
            {/* First section with dropdown and table */}
            <Grid container item xs={12} spacing={2} direction='row'>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                {/* Dropdown */}
                {/* <FormControl style={{ width: "100%" }} variant="outlined" size="small" className={classes.formControl}>
                  <InputLabel id="demo-simple-select-outlined-label">Select</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={criticalname}
                    onChange={(e) => handleChangecritical(e.target.value, display)}
                  >
                    {/* Mapping over description array */}
                    {/* {techncianlist
                      .slice()
                      .sort((a, b) => a.username.localeCompare(b.username))
                      .map((_item) => (
                        <MenuItem
                          key={_item.email}
                          value={_item.username}
                          onClick={() => handleChangecritical(_item.username, _item.email)}
                        >
                          {_item.username}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>  */} 
              </Grid>
              {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
              <Button   style={{backgroundColor:"blue"}} onClick={() => handlealarms1()} >SEND</Button>
              </Grid> */}
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}></Grid>
              </Grid>
              <Grid container item xs={12} spacing={1} direction='column'>
              <Grid item>
                {/* Table */}
                <div className="ag-theme-alpine" style={{ height: 255, width: '100%', marginTop: "1vh" }}>
                  <AgGridReact
                    ref={gridRef}
                    rowData={post}
                    columnDefs={columns}
                    rowSelection={'single'}
                    pagination={true}
                    paginationPageSize={10}
                    suppressMenuHide="true"
                    suppressFilterButton="true"
                    // rowDrag={false}
                    // domLayout='autoHeight'
                    overlayNoRowsTemplate=""
                  />
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={12} md={12} xl={12}>
            {/* Second section with dropdown and table */}
            <Grid container item spacing={1} direction='row' style={{marginTop:'1vh'}}>
            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
          <div style={{fontWeight:'bold',marginLeft:"2vh",fontSize:"2vh"}}>Non-Critical Alarms</div>
          </Grid>
          {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>   
          </Grid> */}
          {/* <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'right'}}>
          <button
            onClick={onBtExport}
            style={{fontWeight: 'bold'}}
          >
            Export to Csv
          </button>
          </Grid> */}
          <Grid item xs={12} sm={12} md={12} xl={12}>
                {/* Dropdown */}
                <Grid container item xs={12} spacing={2}>
                <Grid item  xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
              
                </Grid>
                {/* <Grid item  xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                <Button   style={{backgroundColor:"blue"}} onClick={() => handlealarms()} >SEND</Button>
                </Grid> */}
                <Grid item  xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={12} xl={12}>
                {/* Table */}
                <div className="ag-theme-alpine" style={{ height: 255, width: '100%',marginTop:"1vh" }}>
                <AgGridReact
                      ref={gridRef}
                      rowData={test}
                      columnDefs={columnDefs}
                      rowSelection={'single'}
                      // onSelectionChanged={onSelectionChanged1}
                      pagination={true}
                      paginationPageSize={10}
                      // suppressMenuHide="true"
                      suppressFilterButton="true"
                      // onFirstDataRendered={onFirstDataRendered1}
                      overlayNoRowsTemplate="" 
                    />
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
           
              </Grid>
            
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
    
    
    
}





