import React, { useEffect, useState } from "react";
import { useSelector} from "react-redux";
import {  makeStyles } from "@material-ui/core/styles";
import {
  Grid,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Card,
  ButtonBase,
  TextField
} from "@material-ui/core";
import api from "../../api";
import TimeSeriesVav from "../TimeSeriesVav";

import SwitchSelector from "react-switch-selector";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import NotificationLow from "assets/img/Notification";
import ReactSimpleRange from "react-simple-range";
import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Blink from "react-blink-text";

const StyledTooltip = withStyles({
  tooltip: {
    color: "black",
    backgroundColor: "#FEE8DA",
    // backgroundColor: "red",
    fontSize:"12px"
  }
})(Tooltip);

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const useStyles = makeStyles((theme) => ({
  customDialog: {
    cursor:"pointer",
    // Set the desired width for the dialog
    width: '470px', // Adjust this value as needed
    height: '200px'
  },
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  inputField: {
    margin: theme.spacing(1),
  },
  setptbutton: {
    width: '15vh',
    borderRadius: '8px',
    height: '5vh',
    fontFamily: 'Arial',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:'28vh',
    marginTop:'1.5vh'
  },
  paper: {
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    // boxShadow:'0px 8px 40px #0123B433;',
    boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor:"#fcfafa",
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
     borderRadius: '12px',
     opacity:'1'
  },
  paper1:{
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    // boxShadow:'0px 0px 10px #0123B421',
    boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor:"#fcfafa",
    opacity:'1',
    borderRadius:'12px',
    height:'15.7vh',
    // display: 'flex', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardHeading:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    whiteSpace:"nowrap",
    color:"#000000",
    marginTop:'1vh',
    font:'normal normal medium 17px/60px Bw Seido Round',
    opacity:'1',
    fontWeight:'bold',
    // fontSize:'1.7vh'
  },
  semicircleBar:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    marginTop:'-0.8vh'
  },
  cardbody:{
    display:'flex',
    justifyContent:'center',
    alignItems:"center",
    fontSize:"4vh",
    fontWeight:'bold',
    opacity:'1',
    color:'#0123B4'
  },
  formControl: {
    autosize: true,
    clearable: false,
  }, 
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor:"#0123b4",borderRadius:"8px"
    },
    "& .MuiSelect-root ": {
      marginTop:"-2vh"
    }
  },
  CardHeadFont:{
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      fontSize: "1.5vh",
      },
      '@media (min-width:600px) and (max-width:959.95px)': {//sm
        fontSize: "1.9vh",
        borderRadius:'10px'
      },
      '@media (min-width:960px) and (max-width:1279.95px)': {//md
        fontSize: "1.4vh",
      },
      '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
        fontSize: "1.6vh",
      },
      '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
        fontSize: "1.7vh",
      },
  },
}));

function GlVav() {
  const classes = useStyles();
  const [floor, setFloor] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const [vavdevice, setVavdevice] = useState([]);
  const [data, setData] = useState("");
  const [modal, setModal] = useState(false);
  const [errmsg,setErrmsg] = React.useState('');
  const [fid, setFId] = useState('');
  const [openerr,setOpenerr] = React.useState(false);
  const [vav1, setVav1] = useState({});
  const [vavname, setVavName] = useState('');
  const user_id = localStorage.getItem("userID")
  const [openmodal, setOpenModal] = useState(false);
  const [temperature, setTemperature] = useState('');
  const [activeData, setActiveData] = useState(null);
  const [error, setError] = useState('');
  const [blinkText, setBlinkText] = useState(false);
  let MAX_AIR_FLOW=1350;
  let MIN_AIR_FLOW=0;
  const options = [
    {
      label: "Card View",
      value: "cardview",
      selectedBackgroundColor: "#0123b4",
    },
    {
      label: "Table View",
      value: "tableview",
      selectedBackgroundColor: "#0123b4",
    },
  ];

  const initialSelectedIndex = options.findIndex(
    ({ value }) => value === "hvac"
  );

      const handlefloorchange = (name, id) => {
        setFId(id)
        setFdata(name);
        api.floor.devicemap(id, "VAV")
        .then((res) => {
          res.sort(function(a, b) {
            const numA = parseInt(a.name, 10);
            const numB = parseInt(b.name, 10);
          
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            } else {
              // If either or both are not numbers, use localeCompare for string comparison
              return a.name.localeCompare(b.name);
            }
          });
          console.log("ressssssssfrom devicemap-->",res)
          // res.sort((a, b) => a.name.localeCompare(b.name));
          setVavdevice(res);
        }).catch((error)=>{
          console.log(error)
         })
        
      };

      const handleInputChange = (event) => {
        const value = event.target.value;
        // Allow only numbers
        if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
          setTemperature(value);
      }
      };

      const handlevavclick1 = (data) => {
        setOpenModal(true);
        setActiveData(data);
      };

      const handleSubmit = () => {
        const tempValue = parseFloat(temperature);
        setTemperature('');
        if (tempValue >= 19 && tempValue <= 32) {
        handleClose();
        let idOfVAV=activeData.ssid;
          let nameofVAV=activeData.name;
          let valueOFVAV = temperature;

          const payload={"param_id":"VAV_ZAT_SP","param_value":valueOFVAV,"user_id":user_id}
          api.floor.UpdateConfigureSetpoints(idOfVAV,payload).then((res) => {
            if (res.message === "please connect to network") {
              toast({
                type: "error",
                icon: "exclamation triangle",
                title: "Error",
                description: "connect to network",
                time: 3000,
              });
            } else if (res.message === "ACCEPTED") {
              toast({
                type: "success",
                icon: "check circle",
                title: "Success",
                description: "Temperature is successfully set to " + valueOFVAV +"℃ for " + nameofVAV ,
                time: 5000,
              });
              api.floor
              .devicemap(localStorage.getItem("floorID"), "VAV")
              .then((res) => {
               res.sort(function(a, b) {
                 const numA = parseInt(a.name, 10);
                 const numB = parseInt(b.name, 10);
               
                 if (!isNaN(numA) && !isNaN(numB)) {
                   return numA - numB;
                 } else {
                   // If either or both are not numbers, use localeCompare for string comparison
                   return a.name.localeCompare(b.name);
                 }
               });
                setVavdevice(res);
              }).catch((error)=>{
               console.log(error)
              })
            }
          }).catch((error)=>{
            setOpenerr(true)
            if(error.response){
              setErrmsg(error.response.data.message)
              }else{
                setErrmsg('')
              }
            })
          }else{
            setError('Please enter a number between 19 and 32');
          }
       
      };
    
      const handlevavclick = (ssid,name) => {
        console.log("handlevavclick---->",ssid)
        api.floor.getVavLastHr(ssid).then((res) => {
          console.log("deviceidddd get ahulasthr",res)
          // res.sort((a, b) => a.ssid.localeCompare(b.ssid));
          setVavName(name)
          setVav1(res.graphData[0]);
        }).catch((error)=>{
            // console.log("deviceidddd get ahulasthr catch block",deviceid)
            // setOpenerr(true)
            if(error.response.data.message){
              setErrmsg(error.response.data.message)
              }else{
                setErrmsg('')
              }         
             })
             setModal(true)
             setData(ssid)
     
      }

      const handleClose = () => {
        setOpenModal(false);
        setModal(false)
      };

      const eachVavData = (element, index) => {
        let active = {}
        active["name"] = element.name
        if(element.ssid){
          active["ssid"] = element.ssid
        }
        if(element.VAV_ZAT_SP){
          // active["VAV_ZAT_SP"] = Math.round(element.VAV_ZAT_SP)
          active["VAV_ZAT_SP"] = parseFloat(element.VAV_ZAT_SP).toFixed(1)
        }
        if(element.VAV_Dmpr_Pos){
          // active["VAV_Dmpr_Pos"] = Math.round(element.VAV_Dmpr_Pos)
          active["VAV_Dmpr_Pos"] = parseFloat(element.VAV_Dmpr_Pos).toFixed(1)
        }
        if(element.VAV_ZAT){
          // active["VAV_ZAT"] = Math.round(element.VAV_ZAT)
          active["VAV_ZAT"] = parseFloat(element.VAV_ZAT).toFixed(1)
        }
        if(element.VAV_CFM_Actual){
          // active["VAV_CFM_Actual"] = Math.round(element.VAV_CFM_Actual)
          active["VAV_CFM_Actual"] = parseFloat(element.VAV_CFM_Actual).toFixed(1)
        }
        if(element.VAV_CFM_Design){
          // active["VAV_CFM_Design"] = Math.round(element.VAV_CFM_Design)
          active["VAV_CFM_Design"] = parseFloat(element.VAV_CFM_Design).toFixed(1)
        }
      return(
            <> 
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                    <Card className={classes.paper} style={{height:"43.5vh"}}>
                        <Grid container xs={12} spacing={1} style={{marginTop:'0.5vh'}}> 
                          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                            <Grid container item xs={12} direction="row">
                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} style={{textAlign:'left'}}>
                              <div style={{color:'black',fontWeight:'bold',fontSize:'3vh',whiteSpace:'nowrap'}}>{active.name}</div>
                              </Grid>
                               <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}  style={{textAlign:'right'}}>
                                 {blinkText ? ( 
                                   <Blink
                                       color="blue"
                                       text="o"
                                       fontSize="20px"
                                     ></Blink>
                                 ): null}
                               
                            </Grid>
                            </Grid>
                           
                            
                          </Grid>
                        </Grid>
                        <Grid container xs={12} spacing={1} style={{marginTop:'1.5vh'}}>
                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                    <Card onClick={() => handlevavclick1(active)} className={classes.paper1} style={{cursor:'pointer'}}>
                                          <Grid container xs={12} spacing={1}>                       
                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={`${classes.cardHeading} ${classes.CardHeadFont}`}>
                                                      Temperature Set Point                        
                                                      </Grid>
                                                </Grid>

                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{display:'flex',justifyContent:'center',alignContent:'center',whiteSpace:"nowrap",fontSize:"4vh",color:"#0123B4",fontWeight:"bold",marginTop:"1vh"}}>
                                                      {active.VAV_ZAT_SP}°C                      
                                                      </Grid>
                                                </Grid>
                                              
                                          </Grid>
                                    </Card>
                                    <Dialog
                                    onClose={handleClose}
                                    aria-labelledby="customized-dialog-title"
                                    open={openmodal}
                                    disableBackdropClick={true}
                                    classes={{ paper: classes.customDialog }}
                                  >
                                    <DialogTitle id="customized-dialog-title" onClose={handleClose} className={`${classes.cardHeading} ${classes.CardHeadFont}`}>
                                      Temperature Set Point
                                    </DialogTitle>
                                    <TextField
                                      className={classes.inputField}
                                      label="Enter Temperature"
                                      variant="outlined"
                                      value={temperature}
                                      onChange={handleInputChange}
                                      error={Boolean(error)}
                                      helperText={error}
                                      InputProps={{
                                        placeholder: 'Please enter a number between 19 and 32',
                                      }}
                                    />
                                    <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={handleSubmit}
                                      className={classes.setptbutton}
                                    >
                                      Submit
                                    </Button>
                                  </Dialog>
                              </Grid>
                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                    <Card className={classes.paper1}>
                                          <Grid container xs={12} spacing={1}>                       
                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={`${classes.cardHeading} ${classes.CardHeadFont}`}>
                                                      Damper Position                         
                                                      </Grid>
                                                </Grid>

                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                                      <div className={classes.semicircleBar}>
                                                      <SemiCircleProgressBar strokeWidth={20} stroke="#0123B4" diameter={100} orientation="up" percentage={active.VAV_Dmpr_Pos} showPercentValue />
                                                        </div>
                                                      </Grid>
                                                </Grid>
                                          </Grid>
                                    </Card>
                              </Grid>
                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                    <Card className={classes.paper1} onClick={() => handlevavclick(active.ssid,active.name)} style={{cursor:"pointer",backgroundColor:active.VAV_ZAT <= 25?"#C1EECD":"#fed0c1",color:active.VAV_ZAT <= 30?"#34C759":"#fc6434"}}>
                                          <Grid container xs={12} spacing={1}>                       
                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={`${classes.cardHeading} ${classes.CardHeadFont}`}>
                                                      Zone Temperature                       
                                                      </Grid>
                                                </Grid>

                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{whiteSpace:"nowrap"}}>
                                                        <div className={classes.cardbody} style={{color:active.VAV_ZAT <= 25?"#34C759":"#fc6434"}}>
                                                        {active.VAV_ZAT}°C  
                                                        </div>
                                                      </Grid>
                                                </Grid>
                                          </Grid>
                                    </Card>
                              </Grid>
                              <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                    <Card className={classes.paper1}>
                                          <Grid container xs={12} spacing={1}>                       
                                                <Grid container item xs={12}>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={`${classes.cardHeading} ${classes.CardHeadFont}`}>
                                                      Air Flow CFM                     
                                                      </Grid>
                                                </Grid>

                                                <Grid container item xs={12}>
                                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                                      <StyledTooltip title={active.VAV_CFM_Actual} className={classes.tooltip} arrow>
                                                          <div style={{marginTop:"-1vh",display:'flex',justifyContent:'center'}}>
                                                              <SemiCircleProgressBar strokeWidth={20} stroke="#0123B4" diameter={100} orientation="up" percentage={active.VAV_CFM_Actual/active.VAV_CFM_Design*100} />
                                                          </div>
                                                      </StyledTooltip>
                                                      </Grid>
                                                      <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                                      <Grid container item xs={12} direction="row">
                                                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'right',color:'#000000',fontWeight:'bold'}}></Grid>
                                                            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3} style={{display:'flex',justifyContent:'right',color:'#000000',fontWeight:'bold',marginLeft:'0.5vh',marginTop:'-2.2vh'}}>{active.VAV_CFM_Actual == undefined ? '-': parseFloat(element.VAV_CFM_Actual).toFixed(1)}</Grid>
                                                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'left',color:'#000000',fontWeight:'bold',marginLeft:'1vh'}}></Grid>
                                                        </Grid>
                                                        <Grid  container item xs={12} direction="row">
                                                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'right',color:'#000000',fontWeight:'bold'}}>{MIN_AIR_FLOW}</Grid>
                                                            <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Grid>
                                                            <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4} style={{display:'flex',justifyContent:'left',color:'#000000',fontWeight:'bold'}}>{active.VAV_CFM_Design}</Grid>
                                                        </Grid>
                                                      </Grid>
                                                </Grid>
                                          </Grid>
                                    </Card>
                              </Grid>
                        </Grid>
                    </Card>
                </Grid>
                      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title"  open={modal} classes={{ paper: classes.customDialog }}>
                      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                      {vavname} 's Temperature[°C]
                      </DialogTitle>
                      <DialogContent dividers>
                      {/* <ReactApexCharts options={dataSet.options} series={dataSet.series}  type="area" /> */}
                      {Object.keys(vav1).map((key) => (<>
                      {key == 'VAV_ZAT'?
                      <TimeSeriesVav  style={{ width: "100%", height: "50%" }}
                      data={vav1[key]}
                      param={key}
                      />:<></>
                    }</>
                      ))}
                      </DialogContent>
                    </Dialog>  
            </>
            )
    }

  useEffect(() => {
    let zone_id='',z_data=[]
    zone_data.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
    zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
    if(fdata!== null){
      zone_data.filter((_each,i) =>{
        if(_each.zone_type==='GL_LOCATION_TYPE_FLOOR'&& _each.name===fdata){
          return zone_id=_each.uuid
        }
      })
    } else {
      zone_data.filter((_each,i) =>{
        if(_each.zone_type==='GL_LOCATION_TYPE_FLOOR'){
          z_data.push(_each);
        }
      })
      zone_id=z_data[0].uuid
      setFdata(z_data[0].name)
      setFId(zone_id[0].uuid)
    }
   api.floor
       .devicemap(zone_id, "VAV")
       .then((res) => {
        res.sort(function(a, b) {
          const numA = parseInt(a.name, 10);
          const numB = parseInt(b.name, 10);
        
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          } else {
            return a.name.localeCompare(b.name);
          }
        });
        console.log("vaaaaaav",res)
         setVavdevice(res);
       }).catch((error)=>{
        console.log(error)
       })
       api.dashboard.getMetricData(buildingID)
       .then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      }).catch((error)=>{
        console.log(error)
       })
       const timer = setInterval(() => {
        api.floor
       .devicemap(zone_id, "VAV")
       .then((res) => {
        const loaderState = res.find(item => item.loader_state === true);
        if (loaderState) {
          // Show the loader
          setBlinkText(true);
          }else{
              setBlinkText(false);
        }
        res.sort(function(a, b) {
          const numA = parseInt(a.name, 10);
          const numB = parseInt(b.name, 10);
        
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          } else {
            // If either or both are not numbers, use localeCompare for string comparison
            return a.name.localeCompare(b.name);
          }
        });
         setVavdevice(res);
       }).catch((error)=>{
        console.log(error)
       })
      }, 10000);
      return () => clearInterval(timer);
  }, [buildingID,fid]);
  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
        <Grid container spacing={2}>
            <Grid container item spacing={1}>
              <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                  <FormControl variant="filled"    size="small"
                style={{ width: "max-content", minWidth:"100%",backgroundColor: "#eeeef5" }}>
                      {/* <InputLabel id="demo-simple-select-outlined-label">
                          Floor
                      </InputLabel> */}
                      <Select
                        labelId="demo-simple-select-outlined-label"
                        id="demo-simple-select-outlined"
                        label="Floor"
                        className={classes.select}
                        value={fdata}
                        style={{borderRadius:'0.8vw',height:'6vh'
                      ,fontWeight:"bold"
                        }}  
                        disableUnderline
                        // onChange={handlefloorchange}
                      >
                          {floor.map((_item) => (
                            <MenuItem key={_item.name} value={_item.name}
                            onClick={() => handlefloorchange(_item.name, _item.id)}
                            >
                              {_item.name}
                            </MenuItem>
                          ))}
                      </Select>
                  </FormControl>
              </Grid>
            </Grid>
            {vavdevice.length !=0 ?
                <Grid container spacing={2}>
                {vavdevice.map((element, index) => (
                                <>        
                                {eachVavData(element, index)}</>
                    ))
                }
                </Grid>
                :
                <Grid container spacing={2}>
                  <div style={{marginLfet:"2vh",marginTop:"4vh"}}>
                  No data available
                  </div>
                 </Grid>
            }
        </Grid>
        <SemanticToastContainer position="top-center" />
    </div>
  );
}

export default GlVav;
