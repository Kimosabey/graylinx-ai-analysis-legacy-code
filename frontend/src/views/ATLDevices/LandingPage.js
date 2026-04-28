import React, { useEffect, useState } from "react";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Select, FormControl, MenuItem, InputLabel, Card, TextField, Snackbar, } from "@material-ui/core";
import api from "../../api";
import { useSelector } from "react-redux";
import { SemanticToastContainer, toast } from "react-semantic-toasts";
import { Map, ImageOverlay, Marker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../../assets/css/leaflet.css";
import Alert from '@material-ui/lab/Alert';
import Tooltip1 from '@material-ui/core/Tooltip';
import floor2 from '../../assets/Images/Floor-1.png';
import TimeSeriesUpsStatic from "./../TimeSeriesUpsStatic";
import AHU_image from "./../../assets/img/AHU_Graphic.png";

const Leaflet = require("leaflet");

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginTop: '-1vh'
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  paper: {
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius: "6px",
    boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor: "#fcfafa",
    marginTop: "1vh",
    opacity: '1'
  },
  switchselector: {
    height: '3.5vh',
    [theme.breakpoints.down('sm')]: {
      width: '8.5vh'
      // width:'17vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '7vh'
      // width:'9.5vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '10.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '10.5vh'
    },
  },
  controls_text: {
    display: 'flex',
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      textAlign: 'left',
      fontSize: '2vh',
      color: '#292929'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      textAlign: 'left',
      fontSize: '1.7vh',
      color: '#292929'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      textAlign: 'left',
      fontSize: '2vh',
      color: ''
    },
  },
  text_field: {
    marginLeft: "-0.5vh",
    "& .MuiInputBase-input": { fontSize: '1.7vh' },
    fontFamily: "Arial",
    [theme.breakpoints.down('sm')]: {
      marginLeft: '-1.5vh',
      width: '4.5vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '3.5vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '5.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '5.5vh'
    },
  },
  controls_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: 'flex',
    textAlign: "center",
    alignItems: 'center',
    justify: 'center',
    height: '3.5vh',
    backgroundColor: 'lightgrey',
    width: "8vh",
    fontSize: "1.8vh"
  },
  faults_paper: {
    // padding: theme.spacing(1),
    borderRadius: "37px",
    color: "white",
    display: 'flex',
    textAlign: "center",
    alignItems: 'center',
    justify: 'center',
    height: '2vh',
    backgroundColor: 'lightgrey',
    [theme.breakpoints.down('sm')]: {
      width: "7.5vh"
    },
    [theme.breakpoints.up('md')]: {
      width: "6vh"
    },
    [theme.breakpoints.up('lg')]: {
      width: "7.5vh"
    },
    [theme.breakpoints.up('xl')]: {
      width: "7.5vh"
    },
  },
  set_button: {
    marginLeft: "-0.7vh",
    fontFamily: "Arial",
    [theme.breakpoints.down('sm')]: {
      // marginLeft:'0.5vh',
      marginLeft: '-1.2vh',
      width: '3vh'
    },
    [theme.breakpoints.up('md')]: {
      width: '3vh',
      marginLeft: '-1vh'
    },
    [theme.breakpoints.up('lg')]: {
      width: '3.5vh'
    },
    [theme.breakpoints.up('xl')]: {
      width: '3.5vh'
    },
  },
  select: {
    "&:after": {
      borderBottomColor: "blue",
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor: "#0123b4", borderRadius: "8px"
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh"
    }
  },
  Leaflet_Tooltip_Values: {
    height: "18px",
    width: "59px",
    color: " #ffffff",
    fontWeight: "500",
    fontSize: "15px",
    "letter-spacing": "9px", fontFamily: "Arial"
  },
  Leaflet_Tooltip_Heading: {
    fontSize: "12px", fontWeight: "500", fontFamily: "Arial"
  }
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
  const [ahuList, setAhuList] = useState([]);
  const [fauList, setFAUList] = useState([]);
  const [sefList, setSEFList] = useState([]);
  const [befList, setBEFList] = useState([]);
  const [hefList, setHEFList] = useState([]);
  const [ventList, setVentList] = useState([]);
  const [fdata, setFdata] = useState('ATL_0_Ground');
  const [fid, setFId] = useState('8fd1108d-50dc-11ef-80a5-9829a659c337');
  const buildingName = useSelector((state) => state.isLogged.data.building.name);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  // console.log("'zoneeeeeeedattttttttttt", zone_data)
  const [errmsg, setErrmsg] = React.useState('');
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const iconDevice1 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/sensor-icon.png"),
    iconSize: new Leaflet.Point(30, 30),
    className: "leaflet-div-icon-2",
  });
  const iconDevice2 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/Ventilator.png"),
    iconSize: [30, 30],
    className: "leaflet-div-icon-2",
  });

  const iconDevice3 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/AHU-fan-img.png"),
    iconSize: new Leaflet.Point(30, 30),
    className: "leaflet-div-icon-2",
  });

  const iconDevice32 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/arrow.gif"),
    iconSize: new Leaflet.Point(25, 25),
    className: "leaflet-div-icon-2",
  });

  const iconDevice4 = new Leaflet.Icon({
    iconUrl: require("../../assets/img/down_arrow.gif"),
    iconSize: new Leaflet.Point(25, 25),
    className: "leaflet-div-icon-2",
  });

  const iconDevice = new Leaflet.Icon({
    iconUrl: require("./../../assets/img/AHU_Graphic.png"),
    iconSize: new Leaflet.Point(80, 80),
    className: "leaflet-div-icon-2",
  });

  const handlefloorchange = (name, id) => {
    setFId(id)
    setFdata(name);
    localStorage.setItem('floorID',id)
    localStorage.setItem('floorName',name)
    if(id){
      api.floor.newDevicemapApi(id,'NONGL_SS_AHU').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setAhuList(res)
      })
      api.floor.newDevicemapApi(id,'FRESH_AIR_UNIT').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setFAUList(res)
      })
      api.floor.newDevicemapApi(id,'SS_SUBE_FAN').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setSEFList(res)
      })
      api.floor.newDevicemapApi(id,'SS_BRE_FAN').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setBEFList(res)
      })
      api.floor.newDevicemapApi(id,'SS_HTE_FAN').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setHEFList(res)
      })
      api.floor.newDevicemapApi(id,'SS_VENTILATOR_1').then((res)=>{
        res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
        setVentList(res)
      })
    }
  }

  const handleMarkerClick = (res) => {
    console.log("respp",res)
    let path = (res.type == 'FRESH_AIR_UNIT' ? './glFAU' : res.type == 'SS_VENTILATOR_1' ? './GlVentilator' : res.type == 'SS_BRE_FAN' ? './GlBathroomExhaustFan' : res.type == 'NONGL_SS_AHU' ? './glAhu' : res.type == 'SS_HTE_FAN' ? './glHeatExhaustFan' : res.type == 'SS_SUBE_FAN' ? './GlSubstationExhaustFan' :'')
    props.history.push({
      pathname: path,
      state: {
        floorId:fid,
        floorName:fdata,
        data: res.ssid,
        name:res.name,
      }
    })
    // props.history.push(path); // Replace with your desired route
    // props.history.push('./glAhu'); // Replace with your desired route
  };

  useEffect(() => {
    let zone_id = '', z_data = [], zn_data = [],d_data = []
    zone_data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    zone_data.filter((_each) => _each.zone_type === 'GL_LOCATION_TYPE_FLOOR')
    console.log("zone_data", zone_data, "fdata", fdata)
    if (fdata !== null) {
      zone_data.filter((_each, i) => {
        if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR' && _each.name === fdata) {
          return zone_id = _each.ssid
        }
      })
    } else {
      zone_data.filter((_each, i) => {
        if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR') {
          z_data.push(_each);
        }
      })
      zone_id = z_data[0].ssid
      setFdata(z_data[0].name)
      setFId(zone_id[0].ssid)
    }
    // localStorage.setItem('floorName',z_data[0].name)
    // zone_data.filter((_each, i) => {
    //   if (
    //     _each.zone_type === "GL_LOCATION_TYPE_ZONE" &&
    //     _each.zone_parent === fid
    //   ) {
    //     zn_data.push(_each);
    //     zone_data.filter((eachObj) => {
    //       if (eachObj.zone_parent === _each.uuid) {
    //           d_data.push(eachObj);
    //       } 
    //       else {
    //       }
    //     });
    //   }
      
    // });
    if(zone_id){
    api.floor.newDevicemapApi(zone_id,'NONGL_SS_AHU').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setAhuList(res)
    })
    api.floor.newDevicemapApi(zone_id,'FRESH_AIR_UNIT').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setFAUList(res)
    })
    api.floor.newDevicemapApi(zone_id,'SS_SUBE_FAN').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setSEFList(res)
    })
    api.floor.newDevicemapApi(zone_id,'SS_BRE_FAN').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setBEFList(res)
    })
    api.floor.newDevicemapApi(zone_id,'SS_HTE_FAN').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setHEFList(res)
    })
    api.floor.newDevicemapApi(zone_id,'SS_VENTILATOR_1').then((res)=>{
      res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
      setVentList(res)
    })
  }
    api.dashboard.getMetricData(buildingID)
      .then((res) => {
        res.sort(function (a, b) {
          return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
        });
        setFloor(res);
      }).catch((error) => {
        console.log(error)
      })
  }, [])

  return (
    <div className={classes.root} style={{ marginTop: "0%" }}>
      <Grid container spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
              <FormControl variant="filled" size="small"
              style={{ width: "max-content", minWidth: "100%", backgroundColor: "#eeeef5" }}>
              {/* <InputLabel id="demo-simple-select-outlined-label">
                          Floor
                      </InputLabel> */}
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                label="Floor"
                className={classes.select}
                value={fdata}
                style={{
                  borderRadius: '0.8vw', height: '6vh'
                  , fontWeight: "bold"
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
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                <Card className={classes.paper} style={{ height: "75vh" }}>
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
                    bounds={[[0, 0], [414, 843],]}
                    // bounds={[[0, 0],[414, 843],]}
                    className={classes.bounds}
                    style={{
                      width: "max-content",
                      minWidth: "100%",
                      height: "68vh",
                      backgroundColor: "white",
                    }}
                    onClick={(e) => { console.log({ x: e.latlng.lat, y: e.latlng.lng }); }}
                  >
                    {/* <h3 style={{ textAlign: 'end', textDecorationLine: "underline", marginTop: "0%", color: "black", fontSize: "2.5vh", fontWeight: "bold" }}>{"FAU"}</h3> */}
                    <ImageOverlay
                      url={floor2}
                      bounds={[[-100, -260], [405, 1160]]}
                    />
                    {ahuList?ahuList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice3} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}{console.log("coordi",res.coordinates)}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {fauList?fauList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice3} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {sefList?sefList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice1} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {befList?befList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice1} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {hefList?hefList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice1} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {ventList?ventList.map((res)=>
                                        <Marker position={res.coordinates?res.coordinates:[0,0]} icon={iconDevice1} onClick={() => handleMarkerClick(res)}>
                                        <Tooltip direction="top" opacity={1}>
                                            {res?`Name:${res.name} - ${res.type}`:``}
                                        </Tooltip>
                                      </Marker>
                    ):''}
                    {/* {console.log("ahuList",ahuList,"fauList",fauList,"sefList",sefList,"befList",befList,"hefList",hefList,"ventList",ventList)} */}

                    {/* <Marker position={[304.82, 214]} icon={iconDevice2} onClick={() => handleMarkerClick('Ventilator')}>
                      <Tooltip direction="top" opacity={1}>
                            {'Name: Ventilator-01'}
                      </Tooltip>
                    </Marker>
                    <Marker position={[60.93, 696]} icon={iconDevice3} onClick={() => handleMarkerClick('BEF')}>
                      <Tooltip direction="top" opacity={1}>
                          {'Name: BEF-01'}
                      </Tooltip>
                    </Marker>
                    <Marker position={[290.82, 782]} icon={iconDevice3} onClick={() => handleMarkerClick('SEF')}>
                      <Tooltip direction="top" opacity={1}>
                          {'Name: SEF-01'}
                      </Tooltip>
                    </Marker> */}
                    {/* <Marker position={[193.00, 324]} icon={iconDevice2} onClick={() => handleMarkerClick('AHU')} /> */}
                  </Map>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SemanticToastContainer position="top-center" />
    </div>
  );
}
