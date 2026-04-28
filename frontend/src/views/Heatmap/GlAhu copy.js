import React, { useEffect, useState } from "react";
import { makeStyles,withStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import { Box } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import api from "../../api";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { useSelector } from "react-redux";
import TimeSeriesChart from "../TimeSeriesChart.js";
import GridContainer from "components/Grid/GridContainer";
import GridItem from "components/Grid/GridItem";
import Chart from "react-apexcharts";
import SwitchSelector from "react-switch-selector";
import { CalendarToday } from "@material-ui/icons";
import CardFooter from "components/Card/CardFooter";
import { ButtonBase } from "@material-ui/core";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import { TextField, Typography } from "@material-ui/core";
import Button from "components/CustomButtons/Button.js";
import Button1 from '@material-ui/core/Button';
import CardBody from "components/Card/CardBody";
import { Map, ImageOverlay, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/css/leaflet.css";
import WarningIcon2 from "../../assets/img/Warning2";
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import Tooltip1 from '@material-ui/core/Tooltip';
import AHU_image from "../../assets/img/AHU_Graphic.png";

const Leaflet = require("leaflet");

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
})(Tooltip1);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: 0,
    padding: 0,
    width: "100%",
  },
  paper: {
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  button: {
    height:"2vh",
    margin: theme.spacing(0.5),
    backgroundColor: 'lightgrey',
    color: 'black', // Default text color
    '&.customColor': {
      backgroundColor: '#00CCFF',
      color: 'white', // Text color when customColor class is applied
    },
    fontSize: '12px',
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
  setptbutton: {
    width: "0vh",
    borderRadius: "8px",
    height: "1vh",
    marginTop: "1vh",
    marginLeft: "-3vh",fontFamily:"Arial"
  },
  control1: {
    width: "5vh",
    marginTop: "0vh",
    marginLeft: "-5vh",fontFamily:"Arial"
  },
  text: {
    // fontSize: "14px",
    color: " #292929",fontFamily:"Arial"
  },
}));

export default function NestedGrid(props) {
  const classes = useStyles()
  const role_id = localStorage.getItem("roleID")
  const [setpt, set_setpt] = React.useState("");
  const [ahudevice, setAhudevice] = useState([]);
  const [floor, setFloor] = useState([]);
  const initialState = props.location.state != null ? props.location.state.name : localStorage.getItem("deviceName");;
  const [data, setData] = useState(initialState);
  const initialState1 = props.location.state != null ? props.location.state.data : localStorage.getItem("deviceID");;
  const [deviceid, setDeviceid] = useState(initialState1);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [fid, setFId] = useState('');
  const buildingName = useSelector((state) => state.isLogged.data.building.name);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  // console.log("zone_data",zone_data)
  const [graph, setGraph] = useState([]);
  const [v1com, setv1Com] = useState(0);
  const [disable, setDisable] = useState(false);
  const [disable2, setDisable2] = useState(false);
  const [disable3, setDisable3] = useState(false);
  const [vfdIputPower, setVfdIputPower] = useState(0);
  const [vfdOperationStatus, setVfdOperationStatus] = useState(0);
  const [vfdOperationTime, setvfdOperationTime] = useState(0);
  const [vfdOperationCommand, setvfdOperationCommand] = useState(0);
  const [value2, setValue2] = useState(0);
  const [value3, setValue3] = useState([]);
  const [value4, setValue4] = useState([]);
  const [sa_value4, setSaValue4] = useState([]);
  const [sa_fbk_value4, setFbkSaValue4] = useState([]);
  const [value5, setValue5] = useState([]);
  const [value7, setValue7] = useState(0);
  const [value8, setValue8] = useState(0);
  const [v8com, setv8Com] = useState(0);
  const [value9, setValue9] = useState(0);
  const [v9com, setv9Com] = useState(0);
  const [oa_dmpr_pos, setOa_Dmpr_Pos] = useState(0);
  const [dsp_sp, setDsp_sp] = useState(0);
  const [setSat, setSAtvalue] = useState("");
  const [onOff, setOnOff] = useState(1);
  const [mode, setMode] = useState(0);
  const [ahu1, setAhu1] = useState({});
  const [openerr,setOpenerr] = React.useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [errmsg,setErrmsg] = React.useState('');
  const [vavnames,setVavnames]=useState([]);
  const [zonetemp,setZonetemp]=useState([]);
  const [sadamperpos,setSadamperpos]=useState([]);
  const [fadamper,setFadamper]=useState([]);
  const [dpsfilter,setDpsfilter]=useState([]);
  const [tripstatus,setTripstatus]=useState([]);
  const [returnairco2,setReturnairco2]=useState([]);
  const [airflow,setAirflow]=useState([]);
  const [eadamper,setEadamper]=useState([]);
  const [supplyairhumidity,setSupplyairhumidity]=useState([]);
  const [automanual,setAutomanual]=useState([]);
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(0, 0),
    className: "leaflet-div-icon-2",
  });
  const iconDevice5 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/fan_still.gif"),
    iconSize: [50, 57],
    className: "leaflet-div-icon-2",
  });

  const iconDevice2 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/fan_rotating.gif"),
    iconSize: new Leaflet.Point(50, 43),
    className: "leaflet-div-icon-2",
  });

  const iconDevice3 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/arrow.gif"),
    iconSize: new Leaflet.Point(25, 25),
    className: "leaflet-div-icon-2",
  });

  const iconDevice4 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/down_arrow.gif"),
    iconSize: new Leaflet.Point(25, 25),
    className: "leaflet-div-icon-2",
  });

  const iconDevice6 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/VFD2.png"),
    iconSize: new Leaflet.Point(80, 80),
    className: "leaflet-div-icon-2",
  });
  useEffect(() => {
    console.log("useeffect calledddddddd")
    let zone_id='',z_data=[]
    zone_data.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
    zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
    // console.log("fdata in useee",fdata== null ? "it is null":"NAN")
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
    api.floor.devicemap(zone_id, "AHU")
      .then((res) => {
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setAhudevice(res);
        if(deviceid=='' && data==''){
          res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
          setDeviceid(res[0].ssid)
          setData(res[0].name)
          api.floor.getAhuLastHr(res[0].ssid).then((res) => {
            // console.log("deviceidddd get ahulasthr",res)
            setAhu1(res.graphData[0]);
          }).catch((error)=>{
              // console.log("deviceidddd get ahulasthr catch block",deviceid)
              setOpenerr(true)
              if(error.response.data.message){
                setErrmsg(error.response.data.message)
                }else{
                  setErrmsg('')
                }          })
          api.floor.getAhu(res[0].ssid).then((res) => {
            res.current.map((ele) => {
              if (ele.param_id === "RAT_SP") {
                setValue8(parseFloat(ele.param_value));
                setv1Com(ele.param_value);
              }
              if (ele.param_id === "CHW_Vlv_Pos_SP") {
                setValue8(parseFloat(ele.param_value));
                setv8Com(ele.param_value);
              }
              if (ele.param_id === "SAT_SP") {
                setValue9(parseFloat(ele.param_value));
                setv9Com(ele.param_value);
              }
              if (ele.param_id === "OA_Dmpr_Pos") {
                setOa_Dmpr_Pos(ele.param_value);
              }
              if (ele.param_id === "DSP_SP") {
                setDsp_sp(ele.param_value);
              }
              if (ele.param_id === "input_power") {
                setVfdIputPower(ele.param_value);
              }
              if (ele.param_id === "operation_status") {
                setVfdOperationStatus(ele.param_value);
              }
              if (ele.param_id === "operation_time") {
                setvfdOperationTime(ele.param_value);
              }
              if (ele.param_id === "operation_command") {
                setvfdOperationCommand(ele.param_value);
              }
              if (ele.param_id === "SA_Dmpr_Pos_SP") {
                setSadamperpos(ele.param_value);
              }
              if (ele.param_id === "OA_Dmpr_Pos_SP") {
                setFadamper(ele.param_value);
              }
              if (ele.param_id === "DPS_Filter") {
                setDpsfilter(ele.param_value);
              }
              if (ele.param_id === "SAF_VFD_Trip_SS") {
                setTripstatus(ele.param_value);
              }
              if (ele.param_id === "RAQ_Co2") {
                setReturnairco2(ele.param_value);
              }
              if (ele.param_id === "SA_CFM") {
                setAirflow(ele.param_value);
              }
              if (ele.param_id === "SARH") {
                setSupplyairhumidity(ele.param_value);
              }
              if (ele.param_id === "EA_Dmpr_Pos_SP") {
                setEadamper(ele.param_value);
              }
              if (ele.param_id === "SAF_VFD_AM") {
                setAutomanual(ele.param_value);
              }
             
              return ele;
            });
            res.current.map((ele) => {
              if (ele.param_id === "SAF_VFD_AM") {
                setMode(ele.param_value>0?1:0);
                setSaValue4(ele.param_value>0?1:0);
              }
              if (ele.param_id === "SAF_VFD_AM_Fbk") {
                setFbkSaValue4(ele.param_value>0?1:0);
              }
              if (ele.param_id === "AHU_On_Off") {
                setOnOff(ele.param_value);
                setValue4(ele.param_value);
              }
              if (ele.param_id === "VFD_SS") {
                setValue5(ele.param_value);
              }
              if (ele.param_id === "CHW_Vlv_Pos") {
                setValue3(ele.param_value);
              }
              if (ele.param_id === "RAT") {
                setValue2(ele.param_value);
              }
              if (ele.param_id === "SAT") {
                setValue7(ele.param_value);
              }
              return ele;
            });
            setGraph(res.current);
          }).catch((error)=>{
            // console.log("deviceidddd getahu catch block",deviceid)
            setOpenerr(true)
            if(error.response.data.message){
              setErrmsg(error.response.data.message)
              }else{
                setErrmsg('')
              }          })
        } else{
          api.floor.getAhuLastHr(deviceid).then((res) => {
            // console.log("deviceidddd get ahulasthr",deviceid)
            setAhu1(res.graphData[0]);
          }).catch((error)=>{
              console.log("deviceidddd get ahulasthr catch block",deviceid)
              setOpenerr(true)
              if(error.response){
                setErrmsg(error.response.data.message)
                }else{
                  setErrmsg('No response')
                }    })
          api.floor.getAhu(deviceid).then((res) => {
            console.log("deviceidddd getahu",res)
            res.current.map((ele) => {
              if (ele.param_id === "RAT_SP") {
                setValue8(parseFloat(ele.param_value));
                setv1Com(ele.param_value);
              }
              if (ele.param_id === "CHW_Vlv_Pos_SP") {
                setValue8(parseFloat(ele.param_value));
                setv8Com(ele.param_value);
              }
              if (ele.param_id === "SAT_SP") {
                setValue9(parseFloat(ele.param_value));
                setv9Com(ele.param_value);
              }
              if (ele.param_id === "OA_Dmpr_Pos") {
                setOa_Dmpr_Pos(ele.param_value);
              }
              if (ele.param_id === "DSP_SP") {
                setDsp_sp(ele.param_value);
              }
              if (ele.param_id === "input_power") {
                setVfdIputPower(ele.param_value);
              }
              if (ele.param_id === "operation_status") {
                setVfdOperationStatus(ele.param_value);
              }
              if (ele.param_id === "operation_time") {
                setvfdOperationTime(ele.param_value);
              }
              if (ele.param_id === "operation_command") {
                setvfdOperationCommand(ele.param_value);
              }
              if (ele.param_id === "SA_Dmpr_Pos_SP") {
                setSadamperpos(ele.param_value);
              }
              if (ele.param_id === "OA_Dmpr_Pos_SP") {
                setFadamper(ele.param_value);
              }
              if (ele.param_id === "DPS_Filter") {
                setDpsfilter(ele.param_value);
              }
              if (ele.param_id === "SAF_VFD_Trip_SS") {
                setTripstatus(ele.param_value);
              }
              if (ele.param_id === "RAQ_Co2") {
                setReturnairco2(ele.param_value);
              }
              if (ele.param_id === "SA_CFM") {
                setAirflow(ele.param_value);
              }
              if (ele.param_id === "SARH") {
                setSupplyairhumidity(ele.param_value);
              }
              if (ele.param_id === "EA_Dmpr_Pos_SP") {
                setEadamper(ele.param_value);
              }
              if (ele.param_id === "SAF_VFD_AM") {
                setAutomanual(ele.param_value);
              }
             
              return ele;
            });
            res.current.map((ele) => {
              if (ele.param_id === "SAF_VFD_AM") {
                setMode(ele.param_value>0?1:0);
                setSaValue4(ele.param_value>0?1:0);
              }
              if (ele.param_id === "SAF_VFD_AM_Fbk") {
                setFbkSaValue4(ele.param_value>0?1:0);
              }
              if (ele.param_id === "AHU_On_Off") {
                setOnOff(ele.param_value);
                setValue4(ele.param_value);
              }
              if (ele.param_id === "VFD_SS") {
                setValue5(ele.param_value);
              }
              if (ele.param_id === "CHW_Vlv_Pos") {
                setValue3(ele.param_value);
              }
              if (ele.param_id === "RAT") {
                setValue2(ele.param_value);
              }
              if (ele.param_id === "SAT") {
                setValue7(ele.param_value);
              }
              return ele;
            });
            setGraph(res.current);
          }).catch((error)=>{
            // console.log("deviceidddd getahu catch block",deviceid)
            setOpenerr(true)
            if(error.response){
                    setErrmsg(error.response.data.message)
                    }else{
                      setErrmsg('No response')
                    }    })
        }
      }).catch((error) =>{
        setOpenerr(true)
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('No response')
          }    })
      api.dashboard.getMetricData(buildingID).then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      }).catch((error)=>{
        setOpenerr(true)
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('No response')
          }    })
          api.floor
          .devicemap(zone_id, "VAV")
          .then((res) => {
           res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
            const names = res.map(resp => resp.name);
            const zone_temp=res.map(resp =>resp.VAV_ZAT ? resp.VAV_ZAT: '')
            setVavnames(names);
            setZonetemp(zone_temp)
          }) .catch((error)=>{
            setOpenerr(true)
            if(error.response){
              setErrmsg(error.response.data.message)
              }else{
                setErrmsg('No response')
              }    })
    // api.floor.getAhuLastHr(deviceid).then((res) => {
    //   console.log("deviceidddd get ahulasthr",deviceid)
    //   setAhu1(res.graphData[0]);
    // }).catch((error)=>{
    //     console.log("deviceidddd get ahulasthr catch block",deviceid)
    //     setOpenerr(true)
    //     setErrmsg(error.response.data.message)
    //   })
      
    //   api.floor.getAhu(deviceid).then((res) => {
    //     console.log("deviceidddd getahu",deviceid)
    //     res.current_sp.map((ele) => {
    //       if (ele.param_id === "RAT_SP") {
    //         setValue8(parseFloat(ele.param_value));
    //         setv1Com(ele.param_value);
    //       }
    //       if (ele.param_id === "CHW_Vlv_Pos_SP") {
    //         setValue8(parseFloat(ele.param_value));
    //         setv8Com(ele.param_value);
    //       }
    //       if (ele.param_id === "SAT_SP") {
    //         setValue9(parseFloat(ele.param_value));
    //         setv9Com(ele.param_value);
    //       }
    //       return ele;
    //     });
    //     res.current.map((ele) => {
    //       if (ele.param_id === "AHU_On_Off") {
    //         setOnOff(ele.param_value);
    //         setValue4(ele.param_value);
    //       }
    //       if (ele.param_id === "VFD_SS") {
    //         setValue5(ele.param_value);
    //       }
    //       if (ele.param_id === "CHW_Vlv_Pos") {
    //         setValue3(ele.param_value);
    //       }
    //       if (ele.param_id === "RAT") {
    //         setValue2(ele.param_value);
    //       }
    //       if (ele.param_id === "SAT") {
    //         setValue7(ele.param_value);
    //       }
    //       return ele;
    //     });
    //     setGraph(res.current);
    //   }).catch((error)=>{
    //     console.log("deviceidddd getahu catch block",deviceid)
    //     setOpenerr(true)
    //     setErrmsg(error.response.data.message)
    //   })
    
    const timer = setInterval(() => {
      if(deviceid){

      api.floor.getAhuLastHr(deviceid).then((res) => {
        setAhu1(res.graphData[0]);
      }).catch((error)=>{
        setOpenerr(true)
        // setErrmsg(error.response.data.message)
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('No response')
          }    })

      api.floor.getAhu(deviceid).then((res) => {
        res.current.map((ele) => {
          if (ele.param_id === "RAT_SP") {
            setValue8(parseFloat(ele.param_value));
            setv1Com(ele.param_value);
          }
          if (ele.param_id === "CHW_Vlv_Pos_SP") {
            setValue8(parseFloat(ele.param_value))
            setv8Com(ele.param_value);
          }
          if (ele.param_id === "SAT_SP") {
            setValue9(parseFloat(ele.param_value));
            setv9Com(ele.param_value);
          }
          if (ele.param_id === "OA_Dmpr_Pos") {
            setOa_Dmpr_Pos(ele.param_value);
          }
          if (ele.param_id === "DSP_SP") {
            setDsp_sp(ele.param_value);
          }
          if (ele.param_id === "input_power") {
            setVfdIputPower(ele.param_value);
          }
          if (ele.param_id === "operation_status") {
            setVfdOperationStatus(ele.param_value);
          }
          if (ele.param_id === "operation_time") {
            setvfdOperationTime(ele.param_value);
          }
          if (ele.param_id === "operation_command") {
            setvfdOperationCommand(ele.param_value);
          }
          if (ele.param_id === "SA_Dmpr_Pos_SP") {
            setSadamperpos(ele.param_value);
          }
          if (ele.param_id === "OA_Dmpr_Pos_SP") {
            setFadamper(ele.param_value);
          }
          if (ele.param_id === "DPS_Filter") {
            setDpsfilter(ele.param_value);
          }
          if (ele.param_id === "SAF_VFD_Trip_SS") {
            setTripstatus(ele.param_value);
          }
          if (ele.param_id === "RAQ_Co2") {
            setReturnairco2(ele.param_value);
          }
          if (ele.param_id === "SA_CFM") {
            setAirflow(ele.param_value);
          }
          if (ele.param_id === "SARH") {
            setSupplyairhumidity(ele.param_value);
          }
          if (ele.param_id === "EA_Dmpr_Pos_SP") {
            setEadamper(ele.param_value);
          }
          if (ele.param_id === "SAF_VFD_AM") {
            setAutomanual(ele.param_value);
          }
         
          return ele;
        });
        res.current.map((ele) => {
          if (ele.param_id === "SAF_VFD_AM") {
            setSaValue4(ele.param_value>0?1:0);          }
          if (ele.param_id === "SAF_VFD_AM_Fbk") {
            setFbkSaValue4(ele.param_value>0?1:0);
          }
          if (ele.param_id === "AHU_On_Off") {
            setValue4(ele.param_value);
          }
          if (ele.param_id === "VFD_SS") {
            setValue5(ele.param_value);
          }
          if (ele.param_id === "CHW_Vlv_Pos") {
            setValue3(ele.param_value);
          }
          if (ele.param_id === "RAT") {
            setValue2(ele.param_value);
          }
          if (ele.param_id === "SAT") {
            setValue7(ele.param_value);
          }
          return ele;
        });
        setGraph(res.current);
      }).catch((error)=>{
        setOpenerr(true)
        if(error.response){
          setErrmsg(error.response.data.message)
          }else{
            setErrmsg('No response')
          }    })
    }else
    {
      console.log("no device selected")
    }
    }, 10000);
    return () => clearInterval(timer);
    //eslint-disable-next-line
  }, [buildingID, initialState1,deviceid]);

  const onclickchart = () => {
    props.history.push({
      pathname: `/admin/glVav`,
    });
  };
  const handleerrorclose = () => {
    setOpenerr(false);
    setErrmsg('');
  };
  const state1 = {
    options: {
      yaxis: {
        title: {
          text: "Deg C",
        },
        labels: {
          formatter: function (val) {
            return val; // Convert the value to an integer (whole number)
          },
        },
      },
      chart: {
        id: "basic-bar",
        color: "green",
        events: {
          dataPointSelection: function (event, chartContext, config) {
            onclickchart();
          },
        },
      },
      xaxis: {
        categories: vavnames,
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        strokeWidth: 2,
        strokeDashArray: 2,
        strokeColor: "green",
      },
    },

    series: [
    //   {
    //   title:'Zone Temperature'
    // },
      {
        name: "Zone Temperature",
        data: zonetemp,
      },
    ],
  };
  const handleChangeForsetpoint = (event) => {
    set_setpt(event.target.value);
  };
  const handleClick = (event) => {
    const req = {
      param_id: "RAT_SP",
      param_value: setpt,
      user_id: localStorage.userID,
    };

    if (setpt >= 15 && setpt <= 35) {
      api.floor
        .UpdateConfigureSetpoints(deviceid, req)
        .then((res) => {
          set_setpt("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.message === "ACCEPTED") {
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Rat successfully setted" + setpt,
              time: 2000,
            });
          }
        })
        .catch((error) => {
          setOpenerr(true)
          // setErrmsg(error.response.data.message)
          if(error.response){
            setErrmsg(error.response.data.message)
            }else{
              setErrmsg('No response')
            }    })
    } else {
      set_setpt("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "RAT sp should be 15-35 ",
        time: 2000,
      });
    }
  };

  const handleChangeForsetpointSAT = (event) => {
    setSAtvalue(event.target.value);
  };
  const handleClickSat = (event) => {
    const req = {
      param_id: "SAT_SP",
      param_value: setSat,
      user_id: localStorage.userID,
    };
    if (setSat >= 15 && setSat <= 35) {
      api.floor
        .UpdateConfigureSetpoints(deviceid, req)
        .then((res) => {
          setSAtvalue("");
          if (res.message === "please connect to network") {
            toast({
              type: "error",
              icon: "exclamation triangle",
              title: "Error",
              description: "connect to network",
              time: 2000,
            });
          } else if (res.message === "ACCEPTED") {
            toast({
              type: "success",
              icon: "check circle",
              title: "Success",
              description: "Sat successfully setted" + setSat,
              time: 2000,
            });
          }
        })
        .catch((error) => {
          setOpenerr(true)
          if(error.response){
            setErrmsg(error.response.data.message)
            }else{
              setErrmsg('No response')
            }    })
    } else {
      setSAtvalue("");
      toast({
        type: "error",
        icon: "exclamation triangle",
        title: "Error",
        description: "SAT sp should be 15-35 ",
        time: 2000,
      });
    }
  };

  const options = [
    {
      selectedFontColor: "white",
      label: "OFF",
      value: 0,
      selectedBackgroundColor: "red",
    },
    {
      selectedFontColor: "white",
      label: "ON",
      value: 1,
      selectedBackgroundColor: "green",
    },
    // {
    //   selectedFontColor: "white",
    //   label: "AUTO",
    //   value: 2,
    //   selectedBackgroundColor: "orange",
    // },
  ];
  const options1 = [
    {
      selectedFontColor: "white",
      label: "MANUAL",
      value: 0,
      selectedBackgroundColor: "orange",
      fontSize:"9"
    },
    {
      selectedFontColor: "white",
      label: "AUTO",
      value: 1,
      selectedBackgroundColor: "green",
      fontSize:"9"
    },
  ];
  const onChange = (newValue) => {
    setDisable(true)
    setTimeout(() => {     setDisable(false)    }, 30000);
    const msg = newValue === 1 ? "On" : newValue === 0 ? "Off" : "Auto";
    const va = newValue === 1 ? 1 :newValue === 0 ? 1: null;
    setOnOff(va);
    const req = {
      param_id: "AHU_On_Off",
      param_value: newValue === 1 ? 10 :newValue === 0 ? 0: null,
      user_id: localStorage.userID,
    };
    console.log("reqqqqqqqqqqqqqqqqqqqqqqqqqqqq",req)
    api.floor.UpdateConfigureSetpoints(deviceid, req).then((res) => {
      if (res.message === "please connect to network") {
        setOnOff(Math.round(value4));
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      } else if (res.message === "ACCEPTED") {
        setOnOff(va);
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "successfully turned" + msg,
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };
  const modeOnChange = (newValue) => {
    setDisable2(true)
    setTimeout(() => {     setDisable2(false)    }, 30000);
    const msg = newValue === 1 ? "Auto" : "Manual";
    const va = newValue === 1 ? 1 : 0;
    setMode(va);
    const req = {
      param_id: "SAF_VFD_AM",
      param_value: newValue === 1 ? 1 : 0,
      user_id: localStorage.userID,
    };
    api.floor.UpdateConfigureSetpoints(deviceid, req).then((res) => {
      if (res.message === "please connect to network") {
        if(Math.round(sa_value4) > 0){
          setMode(1);
        }else{
          setMode(0);
        }
                  //setMode(Math.round(sa_value4));
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "connect to network",
          time: 2000,
        });
      } else if (res.message === "ACCEPTED") {
        setMode(va);
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "successfully turned" + msg,
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };

  const handleButtonClick1 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "SAT"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      console.log("resssss",res)
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "SAT Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
    setSelectedButton(index);
  };

  const handleButtonClick2 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "DSP"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "DSP Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
      }else{
        setErrmsg('')  
      }    
    })
    setSelectedButton(index);
  };

  const handleButtonClick3 = (index,deviceid) => {
    const req = {
      ss_id: deviceid,
      alarm: "ZAT"
    }
    api.floor.insertSelectedAlarm(req).then((res) =>{
      if(res === "Accepted"){
        toast({
          type: "success",
          icon: "check circle",
          title: "Success",
          description: "ZAT Fault Injected",
          time: 2000,
        });
      }else{
        toast({
          type: "error",
          icon: "exclamation triangle",
          title: "Error",
          description: "Fault Not Injected",
          time: 2000,
        });
      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
    setSelectedButton(index);
  };

  const handleButtonClick = (index,deviceid) => {
    setDisable3(true)
    setTimeout(() => {     setDisable3(false)    }, 10000);
    // Call the appropriate handleButtonClick function based on the button index
    switch (index) {
      case 0:
        handleButtonClick1(index,deviceid);
        break;
      case 1:
        handleButtonClick2(index,deviceid);
        break;
      case 2:
        handleButtonClick3(index,deviceid);
        break;
      default:
        console.error('Unknown button clicked');
        break;
    }
  };

  // Define button labels
  const buttonLabels = ['F1', 'F2', 'F3'];

  const handlefloorchange = (name, id) => {
    setFId(id)
    setFdata(name);
    api.floor.devicemap(id, "AHU").then((res) => {
      console.log("HRCCCCC",res)
      if(res.length>0){
        setAhudevice(res);
      }else{
        setAhudevice([]); 
        setDeviceid('')
        setValue4("");
        setValue3("");
        setValue2("");
        setValue7("");

      }
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };
  const handleChange = (name, id) => {
    setDeviceid(id);
    setData(name);
    api.floor.getAhuLastHr(id).then((res) => {
      setAhu1(res.graphData[0]);
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
    api.floor.getAhu(id).then((res) => {
      setGraph(res.current);
    }).catch((error)=>{
      setOpenerr(true)
      if(error.response){
        setErrmsg(error.response.data.message)
        }else{
          setErrmsg('No response')
        }    })
  };
  let device_data = [];
  graph.filter((el) => {
    if (
      el.param_id === "ahu_on_off" ||
      el.param_id === "SAT" ||
      el.param_id === "OA_Dmpr_Pos" ||
      el.param_id === "CHW_Vlv_Pos" ||
      el.param_id === "DSP" ||
      el.param_id === "SAF_VFD_Speed_Fbk" ||
      el.param_id === "SAT"
    ) {
      device_data.push(el);
    }
    return el;
  });
 
  const handleLocationClick = (name) => {
    props.history.push(`/admin/Glschedule`);
  };
  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Snackbar open={openerr} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleerrorclose}>
          {errmsg}
        </Alert>
      </Snackbar>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={5}>
            <FormControl
              variant="filled" 
              size="large"
              className={classes.formControl}
              style={{ width: "max-content", minWidth: "100%",
              backgroundColor: "#eeeef5",fontFamily:"Arial"
            }}
            >
              {/* <InputLabel id="demo-simple-select-outlined-label">
                Floor
              </InputLabel> */}
              <Select
                labelId="filled-hidden-label-small"
                id="demo-simple-select-outlined"
                label="Floor"
                style={{fontWeight:"bold",height:"6vh",borderRadius:'0.8vw',
                // fontFamily:"BWSeidoRound-Medium"
                fontFamily:"Arial"
              }}
                value={fdata || ''}
                className={classes.select}
                // onChange={handlefloorchange}
                disableUnderline
              >
                {floor.map((_item) => (
                  <MenuItem
                    key={_item.id}
                    value={_item.name}
                    onClick={() => handlefloorchange(_item.name, _item.id)}
                  >
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4}>
            <FormControl
              variant="filled" size="large"
              className={classes.formControl}
              style={{ width: "max-content", minWidth: "100%",backgroundColor: "#eeeef5",fontFamily:"Arial"
            }}
            >
              {/* <InputLabel id="demo-simple-select-outlined-label">
                Device
              </InputLabel> */}
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Device"
                value={data}
                style={{fontWeight:"bold",height:"6vh",borderRadius:'0.8vw',fontFamily:"Arial"}}
                className={classes.select}
                disableUnderline
              >
                {ahudevice.map((_item) => (
                  <MenuItem
                    key={_item.ssid}
                    value={_item.name}
                    onClick={() => handleChange(_item.name, _item.ssid)}
                  >
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={3}>
            <Paper
              className={classes.paper}
              style={{
                backgroundColor: " #0123b4",
                color: "white",
                borderRadius: "12px",
                height: "100%",
                textAlign: "left",
                fontWeight: "500",
              }}
            >
              <div
                style={{
                  marginTop: "9px",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "#ffffff",
                  marginLeft:"2vh",fontFamily:"Arial"
                }}
              >
                AHU Controls
              </div>
            </Paper>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={9}>
            <Box
              // boxShadow={3}
              className={classes.paper}
              style={{
                boxShadow:"0 4px 10px 5px rgba(0, 0, 0, 0.1)",
                backgroundColor: "white",
                borderRadius: "14px",
                height: "56vh",
              }}
            >
              <Map
                //  ref={mapRef}
                attributionControl={false}
                doubleClickZoom={false}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                // className={"floor-map"}
                crs={Leaflet.CRS.Simple}
                center={[0, 0]}
                // bounds={[[0, 0], [950, 800]]}
                bounds={[
                  [0, 0],
                  [414, 843],
                ]}
                className={classes.bounds}
                style={{
                  width: "max-content",
                  minWidth: "100%",
                  height: "54vh",
                  backgroundColor: "white",
                }}
                onClick={(e) => {
                  // console.log(e)
                  console.log({ x: e.latlng.lat, y: e.latlng.lng });
                }}
              >
<h3 style={{textAlign:'end',textDecorationLine:"underline",marginTop:"0%",color:"black",fontSize:"2.5vh",fontWeight:"bold"}}>{data}</h3>                <ImageOverlay
                  // interactive
                  // url={"https://localhost/AHU_Graphic.png"}
                  url={AHU_image}
                  // bounds={[[0, 0], [414, 670]]}
                  // bounds={[[0, 70], [405, 790]]}
                  bounds={[
                    [-10, 60],
                    [405, 760],
                  ]}
                />
                {/* {Math.round(onOff) == 0 ? (
                  <Marker position={[120.921875, 589]} icon={iconDevice5} />
                ) : (
                  <>
                    <Marker position={[120.921875, 589]} icon={iconDevice2} />

                    <Marker position={[288.56, 607.6]} icon={iconDevice3} />

                    <Marker position={[313.55, 445.67]} icon={iconDevice3} />
                    <Marker position={[330.58, 299.66]} icon={iconDevice3} />
                    <Marker position={[308.89, 208]} icon={iconDevice4} />
                    <Marker position={[205.89, 214]} icon={iconDevice4} />
                  </>
                )} */}
                  {/* <Marker position={[120.921875, 589]} icon={iconDevice5} /> */}
                  <Marker position={[97.4,66.1]} icon={iconDevice6}>
                  <Tooltip direction="right" opacity={0.75}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                        Input Power :  {vfdIputPower}V
                      </span><br />
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                      Operation command :  {vfdOperationCommand}
                      </span><br />
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                      Operation status :  {vfdOperationStatus}
                      </span><br />
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                      Operation time :  {vfdOperationTime}AM
                      </span>
                      
                    </div>{" "}
                  </Tooltip>
                  </Marker>
                <Marker position={[357.6, 366.66]} icon={iconDevice1}>
                  {/* fms>=0&&fms<=100 */}
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                        RAT
                      </span>
                      <br />

                      {value2 >= parseFloat(v1com) - 1 &&
                      value2 <= parseFloat(v1com) + 1 ? (
                        <div
                          style={{
                            backgroundColor: "#1fd655",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value2 * 1) / 1 + "℃"}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#b90e0a",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value2 * 1) / 1 + "℃"}
                        </div>
                      )}
                    </div>{" "}
                  </Tooltip>
                </Marker>

                <Marker position={[233.51, 382.67]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" ,fontFamily:"Arial"}}>
                        SAT
                      </span>
                      <br />
                      {value7 >= parseFloat(v9com) - 1 &&
                      value7 <= parseFloat(v9com) + 1 ? (
                        <div
                          style={{
                            backgroundColor: "#1fd655",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value7 * 1) / 1 + "℃"}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#b90e0a",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value7 * 1) / 1 + "℃"}
                        </div>
                      )}
                    </div>{" "}
                  </Tooltip>
                </Marker>

                <Marker 
                                  position={[114.9, 393]}
                // position={[160.921, 203]}
                 icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500",fontFamily:"Arial" }}>
                        Chw valve{" "}
                      </span>
                      <br />
                      {value3 >= parseFloat(v8com) - 1 &&
                      value3 <= parseFloat(v8com) + 1 ? (
                        <div
                          style={{
                            backgroundColor: "#1fd655",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value3 * 1) / 1 + "%"}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#b90e0a",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value3 * 1) / 1 + "%"}
                        </div>
                      )}
                    </div>{" "}
                  </Tooltip>
                </Marker>
                <Marker
                position={[116.53,552.67]}
                  // position={[114.9, 393]}
                  // onclick={() =>
                  //   handleDeviceClick(value8)}
                  icon={iconDevice1}
                >
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Supply Fan 
                      </span>
                      <br />
                      {value4 >= 0 && value4 <= 100 ? (
                        <div
                          style={{
                            backgroundColor: "#1fd655",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {value4 === 1 ? "ON" : "OFF"}
                        </div>
                      ) : value4 < 0 ? (
                        <div
                          style={{
                            backgroundColor: "yellow",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",fontFamily:"Arial"
                          }}
                        >
                          {Math.round(value4 * 1) / 1}
                        </div>
                      ) : (
                        <div
                          style={{
                            height: "18px",
                            width: "59px",
                            backgroundColor: "#b90e0a",fontFamily:"Arial"
                          }}
                        >
                          <WarningIcon2 />
                        </div>
                      )}
                    </div>{" "}
                  </Tooltip>
                </Marker>

                {/* <Marker 
                                position={[128.94, 483.67]}
                // position={[114.9, 543]}
                 icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",
                        }}
                      >
                        VFD Bypass Status
                      </span>
                      <br />
                      {value5 >= 0 && value5 <= 10 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          {Math.round(value5 * 1) / 1 + "V"}
                        </div>
                      ) : value5 < 0 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          {Math.round(value5 * 1) / 1 + "V"}
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                          }}
                        >
                          <WarningIcon2 />
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Marker> */}

                <Marker position={[280.75, 672]} icon={iconDevice1}>
                  {/* <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        Fire Alarm
                      </span>
                      <br />
                      {value5 >= 0 && value5 <= 10 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          NO
                        </div>
                      ) : value5 < 0 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          NO
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                          }}
                        >
                          NO
                        </div>
                      )}
                    </div>
                  </Tooltip> */}
                </Marker>
                {/* <Marker position={[216.75, 125]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        CO2
                      </span>
                      <br />
                      {value5 >= 0 && value5 <= 10 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          800ppm
                        </div>
                      ) : value5 < 0 ? (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                            color: " #ffffff",
                            fontWeight: "500",
                            fontSize: "15px",
                            "letter-spacing": "9px",
                          }}
                        >
                          800ppm
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: "grey",
                            height: "18px",
                            width: "59px",
                          }}
                        >
                          800ppm
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </Marker> */}
                <Marker position={[198.3, 317]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                  <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        DPS(Filter)
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: Math.round(dpsfilter) == 0 ?"green":"#b90e0a",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                         {Math.round(dpsfilter) == 0 ?'Clean':'Bad'}
                      </div>
                    </div>
                  </Tooltip>
                </Marker>

                <Marker position={[204.921, 140]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "no-wrap",fontFamily:"Arial"
                        }}
                      >
                        OA Damper <br />Pos
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                           {Math.round(fadamper)}%
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                {/* <Marker position={[308.921, 448]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        RA damper
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",
                        }}
                      >
                        50%
                      </div>
                    </div>
                  </Tooltip>
                </Marker> */}

                <Marker position={[204.81, 629.67]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "no-wrap",fontFamily:"Arial"
                        }}
                      >
                        SA Damper <br />Pos
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                         {Math.round(sadamperpos)}%
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                {/* <Marker position={[192.9, 651]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500" }}>
                        AHU on/off
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",
                        }}
                      >
                        ON
                      </div>
                    </div>
                  </Tooltip>
                </Marker> */}
                <Marker position={[143.9, 731]} icon={iconDevice1}>
                  <Tooltip direction="right" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Air Flow 
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                      {Math.round(airflow)}
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={[97.92,656.68]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Trip status
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: Math.round(tripstatus) == 0 ?"green":"#b90e0a",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                         {Math.round(tripstatus) == 0 ?'Normal':'Tripped'}
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker 
                position={[200.56, 521.675]}
                // position={[115.92, 517]}
                 icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Auto/Manual
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: 'grey',
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        --
                      </div>
                    
                    </div>
                  </Tooltip>
                </Marker>
                {/* <Marker position={[137.921, 283]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Filter 
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        --
                      </div>
                    </div>
                  </Tooltip>
                </Marker> */}
                {/* <Marker position={[167.83,689.68]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        DSP
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        --
                      </div>
                    </div>
                  </Tooltip>
                </Marker> */}
                {/* <Marker
                    position={[220.921,430]}
                    icon={iconDevice1}
                  >

                    <Tooltip direction="top" opacity={0.75} permanent>
                      <div>
                        <span style={{ fontWeight: "500",whiteSpace:"normal" }}>Chilled water Valve</span><br />
                        {((value5 >= 0) && (value5 <= 10)) ? <div style={{ backgroundColor: "grey", height: "18px", width: "59px", color: " #ffffff", fontWeight: "500", fontSize: "15px","letter-spacing":"9px" }}>30%</div> : (value5 < 0) ? <div style={{ backgroundColor: "grey", height: "18px", width: "59px", color: " #ffffff", fontWeight: "500", fontSize: "15px","letter-spacing":"9px" }}>30%</div> :
                          <div style={{ backgroundColor: "grey", height: "18px", width: "59px" }}>30%</div>

                        }
                      </div>

                    </Tooltip>
                  </Marker> */}
                <Marker position={[186.9, 765]} icon={iconDevice1}>
                  {/* <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",
                        }}
                      >
                        Fire Status
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",
                        }}
                      >
                        OFF
                      </div>
                    </div>
                  </Tooltip> */}
                </Marker>
                <Marker position={[364.6, 299.6]} icon={iconDevice1}>
                  <Tooltip direction="top" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500",fontFamily:"Arial" }}>
                        RA CO2
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                            {Math.round(returnairco2)}ppm
                      </div>
                    </div>
                  </Tooltip>
                </Marker>

                <Marker position={[102.91, 772.284]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "normal",fontFamily:"Arial"
                        }}
                      >
                        Supply Air <br/> Humidity
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                          {Math.round(supplyairhumidity)}%
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={[286.921, 216]} icon={iconDevice1}>
                  <Tooltip direction="right" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "no-wrap",fontFamily:"Arial"
                        }}
                      >
                        M A Damper
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        --
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={[340.921, 97]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500",fontFamily:"Arial" }}>
                        Exhaust
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        --
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={[185.32, 659.67]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span style={{ fontSize: "12px", fontWeight: "500",fontFamily:"Arial" }}>
                        EA Damper <br/>Pos
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                           {Math.round(eadamper)}%
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
                <Marker position={[372.43,459.66]} icon={iconDevice1}>
                  <Tooltip direction="bottom" opacity={0.75} permanent>
                    <div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "500",
                          whiteSpace: "no-wrap",fontFamily:"Arial"
                        }}
                      >
                        DSP
                      </span>
                      <br />
                      <div
                        style={{
                          backgroundColor: "grey",
                          height: "18px",
                          width: "59px",
                          color: " #ffffff",
                          fontWeight: "500",
                          fontSize: "15px",
                          "letter-spacing": "9px",fontFamily:"Arial"
                        }}
                      >
                        {Math.round(dsp_sp)}Pa
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              </Map>
            </Box>
          </Grid>
          <Grid item xs={3}>
            <Grid container item spacing={1} direction="column">
              <Grid item xs={12}>
              {  
              role_id !=2 ? //not an admin
              <Box
                  // boxShadow={3}
                  className={classes.paper}
                  style={{
                    boxShadow:"0 4px 10px 2px rgba(0, 0, 0, 0.1)",
                    backgroundColor: " #ffffff",
                    borderRadius: "20px",
                    height: "46.5vh",
                  }}
                >
                    <Grid container xs={12}
                        direction="row"
                        style={{
                          height: "9vh",
                          alignItems: "start",
                          justifyContent: "start",
                          textAlign:"start",
                          display: "flex",marginLeft:"2vh",marginTop:"2vh"
                        }}>
                      <Grid item xs={9}>
                              <Grid container xs={12} spacing ={2} direction="column">
                                <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  AHU Run Status
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  AHU Mode
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  SAT -SP
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  Outside Air Damper Temp
                                  </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  Chilled Water Valve -SP
                                  </Typography>
                                </Grid>
                                {/* <Grid item xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  Duct Static Pressure -SP
                                  </Typography>
                                </Grid> */}
                                <Grid item  xs={12}>
                                  <Typography variant="string" className={classes.text}>
                                  Fan Speed
                                  </Typography>
                                </Grid>
                              </Grid> 
                      </Grid>
                      <Grid item xs={3}>
                      <Grid container xs={12} direction="column" spacing={1}>    
                                <Grid item xs={12}>
                                  <div
                                  className="your-required-wrapper"
                                  style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.3vh" ,pointerEvents: "none", opacity: "0.4"}}
                                >
                                  <SwitchSelector
                                    onChange={onChange}
                                    options={options}
                                    // initialSelectedIndex={initialSelectedIndex}
                                    forcedSelectedIndex={onOff}
                                    backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                    fontColor={"#000"}
                                    selectedFontColor={"#000"}
                                    // border="5"
                                    optionBorderRadius={5}
                                    wrapperBorderRadius={8}
                                    fontSize={8}
                                  />
                                </div>                                    
                                </Grid>
                                <Grid item xs={12}>
                                    <div
                                    className="your-required-wrapper"
                                    style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.5vh",pointerEvents: "none", opacity: "0.4" }}
                                  >
                                    <SwitchSelector
                                      onChange={modeOnChange}
                                      options={options1}
                                      // initialSelectedIndex={initialSelectedIndex}
                                      forcedSelectedIndex={mode}
                                      backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                      fontColor={"#000"}
                                      selectedFontColor={"#000"}
                                      // border="5"
                                      optionBorderRadius={5}
                                      wrapperBorderRadius={8}
                                      fontSize={8}
                                    />
                                  </div>
                                  {/* <Grid
                            container
                            item
                            direction="row"
                            justify="flex-start"
                            style={{marginTop:"1.5vh"}}
                          >
                            <Grid item xs={6}>
                              <TextField
                                // label="%"
                                placeholder={formatter.format(value8) + "℃"}
                                // style={{marginTop:'3px',marginLeft:'18px',"letter-spacing":"9px",width:'45px'}}
                                name="set_point"
                                autoComplete="off"
                                // formatter.format(freq)
                                value={setpt}
                                onChange={handleChangeForsetpoint}
                                className={classes.control1}
                                // variant="outlined"
                                // style={{ marginTop: '-1px' }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                type="submit"
                                fullWidth
                                style={{pointerEvents: "none", opacity: "0.4"}}
                                variant="contained"
                                color="Blue"
                                onClick={handleClick}
                                className={classes.setptbutton}
                              >
                                set
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid container item direction="row"
                          style={{marginTop:"1.5vh"}}
                          >
                            <Grid item xs={6}>
                              <TextField
                                // label="%"
                                placeholder={formatter.format(value9) + "℃"}
                                // style={{marginTop:'3px',marginLeft:'15px',width:'45px'}}
                                name="Sat_set_point"
                                autoComplete="off"
                                value={setSat}
                                onChange={handleChangeForsetpointSAT}
                                className={classes.control1}
                                // variant="outlined"
                                // style={{ marginTop: '-1px' }}
                              />
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                type="submit"
                                fullWidth
                                style={{pointerEvents: "none", opacity: "0.4"}}
                                variant="contained"
                                color="Blue"
                                onClick={handleClickSat}
                                className={classes.setptbutton}
                              >
                                set
                              </Button>
                            </Grid>
                          </Grid>                                 */}
                                </Grid>
                                <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginTop:"1px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                            <div>{Math.round(value9)}°C</div></Paper>
                                </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                            <div>{Math.round(oa_dmpr_pos)}°C</div></Paper>
                                      </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          <div> {Math.round(value8)}%</div></Paper>
                                      </Grid>
                                      {/* <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          <div>{Math.round(dsp_sp)}</div></Paper>
                                      </Grid> */}
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#0123b4",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          {Math.round(sa_value4)==0?<div>MANUAL</div>:<div>AUTO</div>}</Paper>
                                      </Grid>
                              </Grid>
                      </Grid>
                    </Grid>
                    {/* <Grid><div style={{fontSize:'9px', marginTop: "28vh"}}>SP:Set Point</div></Grid> */}
                    <Grid
                      container
                      direction="row"
                      justify="center"
                     style={{marginTop: "23vh"}}
                    >
                       <div>
                          {[0, 1, 2].map((index) => (
                            <>{disable3?
                              <Button1
                              key={index}
                              className={`${classes.button} ${selectedButton === index ? 'customColor' : ''}`}
                              variant="contained"
                              onClick={() => handleButtonClick(index,deviceid)}
                              style={{pointerEvents: "none", opacity: "0.4"}}
                            >
                              {buttonLabels[index]}
                            </Button1>
                            :
                            <Button1
                            key={index}
                            className={`${classes.button} ${selectedButton === index ? 'customColor' : ''}`}
                            variant="contained"
                            onClick={() => handleButtonClick(index,deviceid)}
                          >
                            {buttonLabels[index]}
                          </Button1>
                            }</>
                           
                          ))}
                        </div>
                    </Grid>
                    <Grid
                      container
                      direction="row"
                      justify="center"
                      style={{ marginTop: "3vh", marginLeft: "-1vh" ,pointerEvents: "none", opacity: "0.4" }}
                    >
                      <CalendarToday color="primary" />
                      <ButtonBase
                        style={{ color: "#3f51b5",fontWeight:"bolder"  }}
                        onClick={() => handleLocationClick()}
                      >
                        Scheduler
                      </ButtonBase>
                    </Grid>
              </Box>
              :
               <Box
                  // boxShadow={3}
                  className={classes.paper}
                  style={{
                    boxShadow:"0 4px 10px 2px rgba(0, 0, 0, 0.1)",
                    backgroundColor: " #ffffff",
                    borderRadius: "20px",
                    height: "49vh",
                  }}
                >
                    
                    <Grid xs={12}
                    direction="row"
                    style={{
                      height: "9vh",
                      alignItems: "start",
                      justifyContent: "start",
                      textAlign:"start",
                      display: "flex",marginLeft:"2vh",marginTop:"2vh"
                    }}>
                      
                          <Grid item xs={9}>
                            <Grid container xs={12} spacing ={2} direction="column">
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                AHU Run Status
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                AHU Mode
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                SAT-SP
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                Outside Air Damper Temp
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                Chilled Water Valve -SP
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="string" className={classes.text}>
                                Duct Static Pressure -SP
                                </Typography>
                              </Grid>
                              <Grid item  xs={12}>
                                <Typography variant="string" className={classes.text}>
                                Fan Speed
                                </Typography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item xs={3}>
                              <Grid container xs={12} direction="column" spacing={1}>    
                                <Grid item xs={12}>
                                  {disable?
                                  <div
                                  className="your-required-wrapper"
                                  style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.3vh" ,pointerEvents: "none", opacity: "0.4"}}
                                >
                                  <SwitchSelector
                                    onChange={onChange}
                                    options={options}
                                    // initialSelectedIndex={initialSelectedIndex}
                                    forcedSelectedIndex={onOff}
                                    backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                    fontColor={"#000"}
                                    selectedFontColor={"#000"}
                                    // border="5"
                                    optionBorderRadius={5}
                                    wrapperBorderRadius={8}
                                    fontSize={8}
                                  />
                                </div>
                                  :
                                  <div
                                    className="your-required-wrapper"
                                    style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.3vh" }}
                                  >
                                    <SwitchSelector
                                      onChange={onChange}
                                      options={options}
                                      // initialSelectedIndex={initialSelectedIndex}
                                      forcedSelectedIndex={onOff}
                                      backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                      fontColor={"#000"}
                                      selectedFontColor={"#000"}
                                      // border="5"
                                      optionBorderRadius={5}
                                      wrapperBorderRadius={8}
                                      fontSize={8}
                                    />
                                  </div>
                                  } 
                                </Grid>
                                <Grid item xs={12}>
                                  {disable2 ?
                                    <div
                                    className="your-required-wrapper"
                                    style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.5vh",pointerEvents: "none", opacity: "0.4" }}
                                  >
                                    <SwitchSelector
                                      onChange={modeOnChange}
                                      options={options1}
                                      // initialSelectedIndex={initialSelectedIndex}
                                      forcedSelectedIndex={mode}
                                      backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                      fontColor={"#000"}
                                      selectedFontColor={"#000"}
                                      // border="5"
                                      optionBorderRadius={5}
                                      wrapperBorderRadius={7}
                                      fontSize={8}
                                    />
                                  </div>
                                  :
                                  <div
                                  className="your-required-wrapper"
                                  style={{ minWidth: "11vh", marginLeft: "-3.5vh",height:"3.3vh" }}
                                >
                                  <SwitchSelector
                                    onChange={modeOnChange}
                                    options={options1}
                                    // initialSelectedIndex={initialSelectedIndex}
                                    forcedSelectedIndex={mode}
                                    backgroundColor={"rgba(0, 0, 0, 0.04)"}
                                    fontColor={"#000"}
                                    selectedFontColor={"#000"}
                                    // border="5"
                                    optionBorderRadius={5}
                                    wrapperBorderRadius={7}
                                    fontSize={8}
                                  />
                                </div>
                                  }
                                </Grid>
                                <Grid item xs={12}>
                                          {/* <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",marginTop:"1px",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                            <div>{Math.round(value9)}°C</div></Paper> */}
                                            <Grid container xs={12} direction="row" spacing={1}>
                                              <Grid item xs={6}>
                                              <TextField
                                // label="%"
                                placeholder={formatter.format(value9) + "℃"}
                                // style={{marginTop:'3px',marginLeft:'15px',width:'45px'}}
                                name="Sat_set_point"
                                autoComplete="off"
                                value={setSat}
                                onChange={handleChangeForsetpointSAT}
                                className={classes.control1}
                                // variant="outlined"
                                // style={{ marginTop: '-1px' }}
                              />
                                              </Grid>
                                              <Grid item xs={6}>
                                              <Button
                                // type="submit"
                                // // fullWidth
                                // style={{pointerEvents: "none", opacity: "0.4"}}
                                variant="contained"
                                color="Blue"
                                onClick={handleClickSat}
                                className={classes.setptbutton}
                              >
                                set
                              </Button>
                                              </Grid>
                                            </Grid>
                                </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center',marginTop:"-1vh"}}>
                                            <div>{Math.round(oa_dmpr_pos)}°C</div></Paper>
                                      </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          <div> {Math.round(value8)}%</div></Paper>
                                      </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#00CCFF",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          <div>{Math.round(dsp_sp)}%</div></Paper>
                                      </Grid>
                                      <Grid item xs={12}>
                                          <Paper style={{height:'26px',width:"56px",marginLeft:"-2vh",borderRadius:"10px",backgroundColor:"#0123b4",color:"white",textAlign:"center", display: 'flex',alignItems: 'center', justifyContent: 'center'}}>
                                          {Math.round(sa_value4)==0?<div>MANUAL</div>:<div>AUTO</div>}</Paper>
                                      </Grid>
                              </Grid>
                        </Grid>
                        
                  </Grid>
                  {/* <Grid><div style={{fontSize:'9px', marginTop: "28vh"}}>SP:Set Point</div></Grid> */}
                  {/* <Grid
                      container
                      direction="row"
                      justify="center"
                     style={{marginTop: "23vh"}}
                    >
                       <div>
                          {[0, 1, 2].map((index) => (
                            <StyledTooltip title={buttonLabels[index] =='F1'? 'Inject SAT FAULT':buttonLabels[index] =='F2'? 'Inject DSP FAULT':buttonLabels[index] =='F3'?'Inject ZAT FAULT':""} className={classes.tooltip} arrow>
                            <Button1
                              key={index}
                              className={`${classes.button} ${selectedButton === index ? 'customColor' : ''}`}
                              variant="contained"
                              onClick={() => handleButtonClick(index,deviceid)}
                            >
                              {buttonLabels[index]}
                            </Button1>
                            </StyledTooltip>
                          ))}
                        </div>
                    </Grid> */}
                  <Grid
                      container
                      direction="row"
                      justify="center"
                      style={{ marginTop: "28vh", marginLeft: "-1vh" }}
                    >
                       {[0, 1, 2].map((index) => (
                        <>{disable3?
                        <StyledTooltip title={buttonLabels[index] =='F1'? 'Inject SAT FAULT':buttonLabels[index] =='F2'? 'Inject DSP FAULT':buttonLabels[index] =='F3'?'Inject ZAT FAULT':""} className={classes.tooltip} arrow>
                        <Button1
                          key={index}
                          className={`${classes.button} ${selectedButton === index ? 'customColor' : ''}`}
                          variant="contained"
                          onClick={() => handleButtonClick(index,deviceid)}
                          style={{pointerEvents: "none", opacity: "0.4"}}
                        >
                          {buttonLabels[index]}
                        </Button1>
                        </StyledTooltip>:<StyledTooltip title={buttonLabels[index] =='F1'? 'Inject SAT FAULT':buttonLabels[index] =='F2'? 'Inject DSP FAULT':buttonLabels[index] =='F3'?'Inject ZAT FAULT':""} className={classes.tooltip} arrow>
                            <Button1
                              key={index}
                              className={`${classes.button} ${selectedButton === index ? 'customColor' : ''}`}
                              variant="contained"
                              onClick={() => handleButtonClick(index,deviceid)}
                            >
                              {buttonLabels[index]}
                            </Button1>
                            </StyledTooltip>}</>
                            
                          ))}
                      {/* <CalendarToday color="primary"  style={{ marginRight: '8px' }}/> */}
                      <ButtonBase
                        style={{ color: "#3f51b5",fontWeight:"bolder"  }}
                        onClick={() => handleLocationClick()}
                      >
                        Scheduler
                      </ButtonBase>
                    </Grid>
              </Box>
              }
              </Grid>
              <Grid item xs={12}>
                <Paper
                  className={classes.paper}
                  style={{
                    backgroundColor: "#0123b4",
                    borderRadius: "12px",
                    width: "max-content",
                    minWidth: "100%",
                    textAlign: "left",
                    // boxShadow:"0 4px 10px 2px rgba(0, 0, 0, 0.1)",

                  }}
                >
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "15px",
                      fontWeight: "500",
                      color: "#ffffff",
                      marginLeft:"2vh",fontFamily:"Arial"
                    }}
                  >
                    VAV
                  </div>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={9}>
            <Grid container item spacing={1} direction="row">
              {Object.keys(ahu1).map((key) => (
                <>{(key == 'SAT' || key == 'RAT'|| key == 'CHW_Vlv_Pos')?
                <Grid item xs={4}>
                  <Box
                    // boxShadow={3}
                    className={classes.paper}
                    style={{
                      boxShadow:"10px 5px 30px 10px rgba(1,41,112,0.08)",
                      backgroundColor: "white",
                      borderRadius: "20px",
                      height: "25vh",
                      alignContent: "center",
                    }}
                  >
                    <TimeSeriesChart
                      style={{ width: "100%", height: "50%" }}
                      data={ahu1[key]}
                      param={key}
                    />
                  </Box>
                </Grid>
                :<></>}</>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={3}>
            <Grid container xs={12} spacing={1} direction="row">
              <Grid item xs={12}>
                {/* <Box boxShadow={3} className={classes.paper} style={{height:"25vh"}}>1</Box> */}
                <Box
                  boxShadow={3}
                  className={classes.paper}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    height: "25vh",
                    alignContent: "center",
                    boxShadow:"0 4px 20px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <Chart
                    options={state1.options}
                    series={state1.series}
                    type="bar"
                    height={140}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        {/* </React.Fragment>  */}
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}
