import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Select, FormControl, MenuItem, InputLabel} from '@material-ui/core';
import { Radio, Card, Grid,Button as Buttons } from 'semantic-ui-react';
import { Card as Cards } from '@material-ui/core';
import { SemanticToastContainer, toast } from 'react-semantic-toasts'
import { message, Spin } from 'antd';
import SwitchSelector from "react-switch-selector";
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import api from "../../api";
import { Map, ImageOverlay, Marker, Tooltip, ZoomControl, Rectangle } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import '../../assets/css/leaflet.sass'
import Alert from '@material-ui/lab/Alert';
import Snackbar from "@material-ui/core/Snackbar";
import { useSelector } from "react-redux";
import { CircleSlider } from "react-circle-slider";
import floor1 from '../../assets/Images/Floor-1.png';
import Blink from "react-blink-text";
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import 'rc-slider/assets/index.css';
import Slider, { createSliderWithTooltip } from 'rc-slider';
import InterpolationHeatmap from '../Heatmap/InterpolationHeatmap';

const Leaflet = require('leaflet');
const SliderWithTooltip = (Slider);
const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: '2%'
    }, 
    select: {
        "&:after": {
          borderBottomColor: "blue",
        },
        "& .MuiSvgIcon-root": {
          color: "white",
          backgroundColor:"#0123b4",borderRadius:"8px"
        },
      },
    zone: {
        width: '26%',
        height: '8vh',
        label: '2vh'
    },
    area: {
        width: '26%',
        height: '8vh',
        marginLeft: '2%'
    },
    mapcard: {
        width: '100%',
        height: '74vh',
        marginTop: '2%',
        backgroundColor: '#ffffff',
        borderRadius: '0.83vw'
    },
    autobutton: {
        width: '3%',
        height: '3vh',
        fontSize: '0.7vw',
        borderRadius: '0.83vw',
        fontWeight: 'bold'
    },
    zonename: {
        fontSize: '1vw',
        fontWeight: 'bold'
    },
    areaname: {
        fontSize: '1vw',
        fontWeight: 'bold'
    },
    controlcards: {
        height: '27vh',
        borderRadius: '0.83vw',
        width: '23vw'
    },
    maincards: {
        width: '23vw',
        height: '27vh',
        borderRadius: '0.83vw'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
}))
function percentFormatter(v) {
    return `${v} %`;
}

function getJSONElement(myJson, elementPath = []) {
    let eValue = myJson;
    for (let i = 0; i < elementPath.length; i++) {
      if (eValue !== undefined && eValue !== null) {
        eValue = eValue[elementPath[i]];
  
        // Check if the value is the string "NULL" and return null
        if (typeof eValue === 'string' && eValue.toUpperCase() === 'NULL') {
          return null;
        }
      } else {
        eValue = undefined;
        console.log(`Unable to process JSON: ${elementPath}`);
        break;
      }
    }
    return eValue !== undefined ? eValue : null;
  }

export default function GlLms(props) {
    const role_id = localStorage.getItem("roleID")
    const classes = useStyles();
    const mapRef = React.createRef()
    let area = [], newArea = [], occupancy_area = [];
    let slavesArr = [];
    // const [setpt, set_setpt] = React.useState("");
    const [floor, setFloor] = useState([]);
    const [zone, setZone] = useState([]);
    const [areas, setAreas] = useState([]);
    const [device, setDevice] = useState([]);
    // const [fdata,setFdata]=useState(props.fdata);
    const [zdata, setZdata] = useState();
    const [adata, setAdata] = useState();
    // const [ddata,setDdata]=useState();
    const [boolfloor, setboolfloor] = React.useState(true);
    const [boolzone, setboolzone] = React.useState(props.zone);
    const [boolarea, setboolarea] = React.useState(props.area);
    const [booldevice, setbooldevice] = React.useState(false);
    // const [channelclick,setChannelclick]= useState(false);
    const [selectedChannel, setSelectedChannel] = useState('');
    // console.log("selected",selectedChannel)
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const [dropfloor, setDropfloor] = useState(props.dropfloor);
    const [dropzone, setDropzone] = useState([]);
    const [droparea, setDroparea] = useState([]);
    // const [dropdevice,setDropdevice]=useState([]);
    const [tempOpen, setTempOpen] = React.useState(false);
    const [humOpen, setHumOpen] = React.useState(false);
    const [luxOpen, setLuxOpen] = React.useState(false);
    const [ahuOpen, setAhuOpen] = React.useState(false);
    const [value, setValue] = React.useState('thl');
    const [locationId, setLocation] = React.useState(props.location);
    const [heatMapData, setHeatMapdata] = React.useState({
        rectData: [],
        addressPoints: [],
        mapSubType: props.param ? props.param.toLocaleLowerCase() : "thl"
    })
    const [iconDevice, setIconDevice] = React.useState({});
    const [intensity, setIntensity] = React.useState(0);
    const campusId = useSelector(state => state.isLogged.data.campus.id)
    const userId = useSelector(state => state.isLogged.data.user.id)
    const userName = useSelector(state => state.isLogged.data.user.name)
    const [openerr,setOpenerr] = React.useState(false);
    const [errmsg,setErrmsg] = React.useState('');
    const [state,setState] = React.useState(0);
    const [wacdata,setWacdata] = React.useState('');
    const [dimmable,setDimmable] = React.useState(false);
    const [status1,setStatus1] = React.useState(false);
    const [status2,setStatus2] = React.useState(false);
    const [status3,setStatus3] = React.useState(false);
    const [color,setColor] = React.useState('');
    const [data,setData] = React.useState([]);
    const coords= [];
    const coords1= [];
    const coords2= [];
    const coords3= [];

    useEffect(() => {
        localStorage.removeItem("type")
        let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType === '' ? 'thl' : heatMapData.mapSubType
        switch (type) {
          case "thl": setTempOpen(true)
            // setIconDevice(iconDevice3)
            break;
          default: break;
        }
        api.campus.getTreeList(campusId)
        .then(res => {
            if(res.children){
            let arr = [];
            res.children.map(_each => {
                _each.children.map(_each => {
                    arr.push(_each)
                    area.push(_each.children)
                    return _each;
                })
                return _each
            })
            setFloor(arr)
            setLocation(arr[0].id)
            setIconDevice(iconDevice1)
            let f_id = localStorage.getItem('floorID')
            const apiRequesting = api.floor.heatmap(f_id, type.toLocaleUpperCase());
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error('Timeout: The API response took too long.'));
                }, 3000);
              });

              Promise.race([apiRequesting, timeoutPromise])
              .then((res) => {
                let zoneData = [], devData = [];
                let obj = {}, deviceObj = {};
               
                setHeatMapdata({
                    ...heatMapData,
                    rectData: zoneData,
                    addressPoints: res,
                })
                return res;
              })
              .catch((error) => {
                // Handle errors, including timeout
                setOpenerr(true);
                setErrmsg('no data available')
                // setErrmsg(error.response ? error.response.data.message : error.message);
              })
              .finally(() => {
                // Stop loading, regardless of success or failure
                setLoading(false);
              });
            }
        setDropfloor(props.dropfloor)
        setZone(props.zone)
        if(props.zone.length == '0'){
            setAreas([])
        }
    })
}, [props]);
    const handlezonechange = (name, id) => {
        api.controls.zonelights(id)
        .then(res => {
            let masterArr = [];
            res.lights.map(_each => {
                if (_each.deviceType === "ANALOG_CONTROLLER") {
                    let statusarr = [];
                    let intensityarr = [];
                    const { master, channels } = _each;
                    let channel_value = channels.map((item, i) => item.name)
                    let value = channel_value.length === 2 ? 5 : channel_value[0].slice(8, 9)
                    if (channels.length === 2) {
                        statusarr.push(channels[0].status)
                        statusarr.push(channels[1].status)
                        intensityarr.push(channels[0].light_level)
                        intensityarr.push(channels[1].light_level)
                    } else {
                        statusarr.push(channels[0].status)
                        intensityarr.push(channels[0].light_level)
                    }
                    let findstatus = statusarr.every(i => i === statusarr[0])
                    let zonestatus = findstatus ? statusarr[0] : ""
                    let sum = 0
                    intensityarr.forEach((_ele, index) => {
                        sum += _ele
                    })
                    let values = (sum / (intensityarr.length * 100)) * 100
                    let findmode = statusarr.every(i => i === statusarr[0])
                    let zonemode = (findmode && (statusarr[0] === "On" || statusarr[0] === "Off")) ? "Manual" : (findmode && (statusarr[0] === "Auto")) ? "Auto" : "Mixed modes"
                    let status = master.cmd === undefined ? 'Server' : master.cmd
                    masterArr.push({ macId: master.mac, channel: JSON.parse(value) })
                    let areaObj = {
                        "id": master.areaId,
                        "zoneId": master.zoneId,
                        "name": master.areaName,
                        "master": masterArr,
                        "status": zonestatus,
                        "mode": zonemode,
                        "Intensity": Math.ceil(values),
                        "occupancy": '',
                        "cmd": status === 'Null' ? 'Tab' : status.charAt(0).toUpperCase() + status.slice(1),
                        "created_at": master.created_at
                    }
                    area.push(areaObj)
                }
                if (_each.deviceType === "DALI_CONTROLLER") {
                    const { master, slaves } = _each;
                    let areaObj = {};
                    slaves.map(_slave => {
                        let statusarr = slaves.filter(_s => _s.areaId === _slave.areaId).map(({ status }) => status)
                        let findstatus = statusarr.every(i => i === statusarr[0])
                        let zonestatus = findstatus ? statusarr[0] : ""
                        let intensityarr = slaves.filter(_s => _s.areaId === _slave.areaId).map(({ light_level }) => light_level)
                        let c_from = slaves.filter(_s => _s.areaId === _slave.areaId).map(({ cmd_data }) => cmd_data)
                        let findc_from = c_from.every(i => i === c_from[0])
                        let zonecmd = findc_from ? c_from[0] : "Mixed Modes"
                        let sum = 0
                        intensityarr.forEach((_ele, index) => {
                            sum += _ele
                        })
                        let value = (sum / (intensityarr.length * 100)) * 100
                        let findmode = statusarr.every(i => i === statusarr[0])
                        let zonemode = (findmode && (statusarr[0] === "On" || statusarr[0] === "Off")) ? "Manual" : (findmode && (statusarr[0] === "Auto")) ? "Auto" : "Mixed modes"
                        let time = slaves.filter(_s => _s.areaId === _slave.areaId).map(({ created_at }) => created_at).sort().reverse()
                        let status = zonecmd === undefined ? 'Server' : zonecmd
                        areaObj = {
                            "id": _slave.areaId,
                            "zoneId": master.zoneId,
                            "name": _slave.areaName,
                            "master": [{
                                macId: master.mac,
                                slaves: slaves.filter(_s => _s.areaId === _slave.areaId).map(({ mac }) => mac),
                                selection: "slaves"
                            }],
                            "status": zonestatus,
                            "mode": zonemode,
                            "Intensity": Math.ceil(value),
                            "occupancy": '',
                            "cmd": status === 'Null' ? 'Tab' : status.charAt(0).toUpperCase() + status.slice(1),
                            "created_at": time[0]
                        }
                        area.push(areaObj);
                        return _slave
                    })
                }
                return _each
            })
            res.occupancy.map(_item => {
                let occupancyobj = {
                    "id": _item.area,
                    "data": _item.data
                }
                occupancy_area.push(occupancyobj)
                return _item
            })
            newArea = area.reduce((acc, current) => {
                let x = acc.find(item => item.id === current.id);
                if (!x) {
                    return acc.concat([current]);
                } else {
                    if (x.master.map(_elem => _elem.macId).indexOf(current.master[0].macId) < 0) {
                        x.master.push(current.master[0])
                        acc.concat([x])
                    }
                    return acc
                }
            }, [])
            occupancy_area.forEach(_element => {
                newArea.forEach(element => {
                    if (_element.id === element.id) {
                        element.occupancy = _element.data
                    } else { }
                });
            });
            // console.log("newArea-----------------",newArea)
            newArea.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
            area.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
            setAreas(newArea)
            setDropzone(newArea)
        })
        .catch((error)=>{
            setOpenerr(true)
            // setErrmsg(error.response.data.message)
          })
        setLocation(id)
        setZdata(name)
        setboolarea(false)
        setboolfloor(false)
        setboolzone(true)
        setbooldevice(false)
    }
    const handleareachange = (name, id) => {
        api.controls.devicelights(id)
        .then(res => {
            res.lights.map(_each => {
                if (_each.deviceType === "ANALOG_CONTROLLER") {
                    const { master, channels } = _each;
                    // console.log("devicestatus",channels)
                    let cmd = master.cmd === undefined ? 'Server' : master.cmd
                    let deviceObj;
                    if (channels.length === 2) {
                        let status = channels.map((_item, index) => _item.status)
                        let findstatus = status.every(i => i === status[0])
                        let devicestatus = findstatus ? status[0] : ""
                        deviceObj = {
                            "id": master.mac,
                            "name": master.name,
                            "channel3": channels[0].dimmable,
                            "channel4": channels[1].dimmable,
                            "channel5": channels[0].dimmable && channels[1].dimmable,
                            "length": channels.length,
                            "master": [{
                                macId: master.mac
                            }],
                            "zone": master.zoneId,
                            "status1": channels[0].status,
                            "status2": channels[1].status,
                            "mode": ((channels[0].status === "On" || channels[0].status === "Off") || (channels[1].status === "on" || channels[1].status === "off")) ? "Manual" : "Auto",
                            "intensity": (channels[0].light_level === channels[1].light_level) ? channels[0].light_level : '',
                            "cmd": cmd === 'Null' ? 'Tab' : cmd.charAt(0).toUpperCase() + cmd.slice(1),
                            "created_at": master.created_at,
                            "status": devicestatus
                        }
                    } else {
                        deviceObj = {
                            "id": master.mac,
                            "name": master.name,
                            "channel3": channels[0].dimmable,
                            "lenght": channels.length,
                            "channel_name": channels[0].name,
                            "master": [{
                                macId: master.mac
                            }],
                            "zone": master.zoneId,
                            "status1": channels[0].status,
                            "mode": (channels[0].status === "On" || channels[0].status === "Off") ? "Manual" : "Auto",
                            "intensity": channels[0].light_level,
                            "cmd": cmd === 'Null' ? 'Tab' : cmd.charAt(0).toUpperCase() + cmd.slice(1),
                            "created_at": master.created_at,
                            "status": channels[0].status
                        }
                    }
                    slavesArr.push(deviceObj);
                }
                if (_each.deviceType === "DALI_CONTROLLER") {
                    const { master, slaves } = _each;
                    let slaveObj = {};
                    slaves.map(_slave => {
                        let dev_cmd = _slave.cmd_data !== undefined ? _slave.cmd_data : "Server"
                        slaveObj = {
                            "id": _slave.mac,
                            "mastername": master.name,
                            "name": _slave.name,
                            "zone": _slave.zoneId,
                            "master": [{
                                macId: master.mac,
                                slaves: [_slave.mac],
                                selection: "slaves"
                            }],
                            "status": _slave.status,
                            "Intensity": _slave.light_level,
                            "mode": (_slave.status === "On" || _slave.status === "Off") ? "Manual" : "Auto",
                            "cmd": dev_cmd === 'Null' ? 'Tab' : dev_cmd.charAt(0).toUpperCase() + dev_cmd.slice(1),
                            "created_at": _slave.created_at
                        }
                        slavesArr.push(slaveObj);
                        return _slave
                    })
                }
                return _each
            })
            // console.log("slavesArr",slavesArr)
            slavesArr = slavesArr.reduce((acc, current) => {
                const x = acc.find(item => item.id === current.id && item.name==current.name);
                // console.log("xxxxxxxx1xxxxxx",x,"acc",acc,"current",current)
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
                console.log("xxxxxxx2xxxxxxx",x)
            }, []);
            slavesArr.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
            setDevice(slavesArr)
            setDroparea(slavesArr)
        }).catch((error)=>{
            setOpenerr(true)
            // console.log("erorrrrrr:420",error)
            // setErrmsg(error.response.data.message)
          })
        setLocation(id)
        setAdata(name)
        setboolarea(true)
        setboolzone(false)
        setboolfloor(false)
    }
  
    const submit = (res, value, intensity, type) => {
        const user = {
            id: userId,
            name: userName
        }
        let p_zone = '';
        let req = {};
        let msg = '', channel;
        switch (value) {
            case 1: msg = 'switched ON'; break;
            case 0: msg = 'switched OFF'; break;
            case 4: msg = 'switched to Auto mode'; break;
            default: msg = 'set to intensity ' + intensity; break;
        }
        switch (selectedChannel.split("_")[0]) {
            case 'channel3': channel = 3; break;
            case 'channel4': channel = 4; break;
            case 'channel5': channel = 5; break;
            default: break;
        }
        let wac = [], dali = [];
        setLoading(true)
        res.master.map(_dev => {
            if (_dev.macId.substr(0, 4) === "50ac") {
                wac.push(_dev)
            } else {
                dali.push(_dev)
            }
            return _dev
        })
        if (type === 'z') {
            req = (wac.length > 0 && dali.length > 0) ?
                {
                    zone: res.id,
                    DALI: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        dali,
                    },
                    WAC: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        wac,
                    }
                } : (wac.length > 0) ? {
                    zone: res.id,
                    WAC: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        wac,
                    }
                } : {
                    zone: res.id,
                    DALI: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        dali,
                    }
                }
        } else if (type === 'a') {
            req = (wac.length > 0 && dali.length > 0) ?
                {
                    zone: res.zoneId,
                    DALI: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        dali,
                    },
                    WAC: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        wac,
                    }
                } : (wac.length > 0) ? {
                    zone: res.zoneId,
                    WAC: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        wac,
                    }
                } : {

                    zone: res.zoneId,
                    DALI: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        dali,
                    }
                }
        } else if (type === 'd') {
            // console.log("d clickedddd")
            let channel;
            if (res.id.slice(0, 3) === "50d") {
                req = {
                    zone: res.zone,
                    type: 'dali',
                    DALI: {
                        mode: (value === 4) ? "auto" : "manual",
                        intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                        dali: res.master
                    }
                }
            } else {
                if (selectedChannel.includes(res.id) || (res.channel5 === true || res.channel3 === true || res.channel4 === true)) {
                    if (selectedChannel === '') {
                        res.channel_name === 'Channel 4' ? channel = 4 : channel = 3
                    }
                    switch (selectedChannel.split("_")[0]) {
                        case 'channel3': channel = 3; break;
                        case 'channel4': channel = 4; break;
                        case 'channel5': channel = 5; break;
                        default: break;
                    }
                    setLoading(true)
                    req = {
                        zone: res.zone,
                        type: 'wac',
                        WAC: {
                            mode: (value === 4) ? "auto" : "manual",
                            intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                            wac: [{
                                macId: res.id,
                                channel: channel
                            }]
                        }
                    }
                } else if (res.channel5 !== true || res.channel3 !== true || res.channel4 !== true) {
                    // console.log("resssssssssssssssss584",res,"----------------",res.length)
                    if (res.length === 2) {
                        channel = 5
                    } else {
                        if (res.channel_name === 'Channel 4') {
                            channel = 4
                        } else channel = 3
                    }
                    req = {
                        zone: res.zone,
                        type: 'wac',
                        WAC: {
                            mode: (value === 4) ? "auto" : "manual",
                            intensity: (value === 0) ? 0 : (value === 1) ? 100 : parseInt(intensity, 10),
                            wac: [{
                                macId: res.id,
                                channel: channel
                            }]
                        }
                    }
                } else {
                    message.error("Please select a channel for this device!")
                    setLoading(false)
                }

            }
        }
        // console.log("before api call",req)
        api.controls.controlLights(req, user)
        .then(result => {
            console.log("resultttttttttttttttt",result)
            if (result.message === "Please connect to a network") {
                setLoading(false)
                toast({
                    type: 'error',
                    icon: 'exclamation triangle',
                    title: 'Error',
                    description: 'Please connect to a network!!!',
                    time: 0
                });
                res.status = p_zone
            } else if (result.message === "failure") {
                setLoading(false)
                toast({
                    type: 'error',
                    icon: 'exclamation triangle',
                    title: 'Error',
                    description: 'Failed to control the device ' + res.name,
                    time: 0
                });
                res.status = p_zone
            } else {
                let interval = null;
                let timerun = 0
                interval = setInterval(() => {
                    timerun = timerun + 3
                    api.controls.eventStatus(result.batchId, result.batchLength).then(result1 => {
                        if(result1 != undefined){
                        if (result1.message === "success") {
                            setLoading(false);
                            setSuccess(true)
                            clearInterval(interval);
                            toast({
                                type: 'success',
                                icon: 'check circle',
                                title: 'Success',
                                description: 'Device ' + res.name + ' successfully ' + msg,
                                time: 3000
                            });
                            if (intensity === 0 || value !== 2) {
                                if (value === 1) {
                                    res.status = 'On'
                                    res.mode = 'Manual'
                                    res.Intensity = 100
                                } else if (value === 0) {
                                    res.status = 'Off'
                                    res.mode = 'Manual'
                                    res.Intensity = 0
                                } else {
                                    res.status = 'Auto'
                                    res.mode = 'Auto'
                                    res.Intensity = 100
                                }
                            }
                            else if (intensity === 0 && value === 2) {
                                res.status = 'Off'
                                res.mode = 'Manual'
                                res.Intensity = 0
                            } else {
                                res.status = 'On'
                                res.mode = 'Manual'
                                res.Intensity = 100
                            }
                        }
                    }
                    else{
                        console.log("undefined")
                    }
                    })
                    if (timerun >= 40) {
                        console.log("failure blockkk")
                        clearInterval(interval);
                        setLoading(false);
                        toast({
                            type: 'error',
                            icon: 'exclamation triangle',
                            title: 'Error',
                            description: 'Failed to control the device ' + res.name,
                            time: 3000
                        });
                        res.status = p_zone
                    }
                }, 3000);
            }
        })
        .catch((error)=>{
            setOpenerr(true)
            // setErrmsg(error.response.data.message)
          })
    }
 
    const handleerrorclose = () => {
        setOpenerr(false);
        setErrmsg('');
      };
    const options1 = [
        {
            label: "Temperature",
            value: "thl",
            selectedBackgroundColor: "#3f51b5"
        },
        {
            label: "Humidity",
            value: "humidity",
            selectedBackgroundColor: "#3f51b5"
        },
        {
            label: "Luminousity",
            value: "luminousity",
            selectedBackgroundColor: "#3f51b5"
        },
        {
            label: "Occupancy",
            value: "occupancy",
            selectedBackgroundColor: "#3f51b5",
        }
    ];
    const initialSelectedIndex1 = options1.findIndex(({ value }) => value === "controls");
    const options = [
        {
            label: "o",
            value: "o",
            selectedBackgroundColor: "red",
            selectedFontColor: 'white'
        },
        {
            label: "|",
            value: "|",
            selectedBackgroundColor: "#34c759",
            selectedFontColor: 'white'
        }
    ];

    const onChange = (_flr, newValue, zonetype) => {
        if (newValue === 'o') {
            submit(_flr, 0, 0, zonetype)
        } else {
            submit(_flr, 1, 100, zonetype)
        }
    };
    const initialSelectedIndex = options.findIndex(({ value }) => value === "|");
    const handlesliderChange = (_flr,type,value) => {
        // console.log("_flr",_flr)
        // console.log("type",type)
        // console.log("value",value)
        // console.log("intensity",intensity)
        setIntensity(value)
        submit(_flr,2,value,type)
    }

    const iconDevice1 = new Leaflet.Icon({
        iconUrl: require('../../assets/img/sensor-icon.png'),
        iconRetinaUrl: require('../../assets/img/sensor-icon.png'),
        iconSize: new Leaflet.Point(16, 16),
        className: 'leaflet-div-icon-1'
    });
    const onChangetype = newValue => {
        setValue(newValue)
        let type = heatMapData.mapSubType === "aqi" ? "all" : heatMapData.mapSubType
        switch (newValue) {
            case "AHU":
                setAhuOpen(true)
                setTempOpen(false)
                setHumOpen(false)
                setLuxOpen(false)
                setIconDevice(iconDevice1)
                break
            case "luminousity":
                setLuxOpen(false)
                setAhuOpen(false)
                setTempOpen(true)
                setHumOpen(false)
                setIconDevice(iconDevice1)
                break
            case "thl":
                setTempOpen(true)
                setLuxOpen(false)
                setAhuOpen(false)
                setHumOpen(false)
                setIconDevice(iconDevice1)
                break
            case "humidity":
                setHumOpen(false)
                setTempOpen(true)
                setLuxOpen(false)
                setAhuOpen(false)
                setIconDevice(iconDevice1)
                break
            case "occupancy":
                setHumOpen(false)
                setTempOpen(false)
                setLuxOpen(true)
                setAhuOpen(false)
                setIconDevice(iconDevice1)
                break
            default: break;
        }
        if(newValue === 'AHU') {
        setLoading(true)
        api.floor.devicemap(locationId, newValue.toLocaleUpperCase())
        .then(res => {
            let zoneData = [], devData = [];
            let obj = {}, deviceObj = {};
            setHeatMapdata({
                ...heatMapData,
                rectData: zoneData,
                addressPoints: res,
                mapSubType: newValue
            });
            setTimeout(() => {
                setLoading(false);
              }, 3000);
        })
        .catch((error)=>{
            setOpenerr(true)
            // setErrmsg(error.response.data.message)
          })
         }else if(newValue === 'occupancy') {
            setLoading(true);
            const apiRequest = api.floor.devicemap(locationId, newValue.toLocaleUpperCase());
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error('Timeout: The API response took too long.'));
              }, 3000);
            });
            
            Promise.race([apiRequest, timeoutPromise])
              .then((res) => {
                let zoneData = [];
                setLuxOpen(true);
                setHeatMapdata({
                  ...heatMapData,
                  rectData: zoneData,
                  addressPoints: res,
                  mapSubType: newValue
                });
              })
              .catch((error) => {
                setOpenerr(true);
              })
              .finally(() => {
                setLoading(false);
              });
            
    } else {
        setLoading(true);
            const apiRequest = api.floor.devicemap(locationId, 'THL');
            const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('Timeout: The API response took too long.'));
            }, 3000);
            });

            Promise.race([apiRequest, timeoutPromise])
            .then((res) => {
                let zoneData = []
                setTempOpen(true)
                setHeatMapdata({
                    ...heatMapData,
                    rectData: zoneData,
                    addressPoints: res,
                    mapSubType: "thl"
                });
            })
            .catch((error) => {
                setOpenerr(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }
    };
    const handleChannelChange = (e, {name,value}) => { 
        let id = value.slice(9)
        // this.setState({wacdata:id})
        setWacdata(id)
        let channel_name = value.slice(0,8)
        // const s = slavesArr.filter(each=>each.id==id)
        // const s = this.state.data
        const s = device
        if(channel_name==="channel3"&&device[0].channel3==true){
            setDimmable(true)
            // this.setState({dimmable:true})
        } else if(channel_name==="channel4"&&device[0].channel4==true){
            // this.setState({dimmable:true})
            setDimmable(true)
        } else if(channel_name==="channel5"&&device[0].channel4==true){
            // this.setState({dimmable:true})
            setDimmable(true)
        } else{
            // this.setState({dimmable:false})
            setDimmable(false)
        }

            if(channel_name == "channel3"){
                if(s[0].status1 === "On"){
                    // this.setState({status1:true})
                    // this.setState({status2:false})
                    // this.setState({status3:false})
                    // this.setState({color:'green'})
                    setStatus1(true)
                    setStatus2(false)
                    setStatus3(false)
                    setColor('green')
                } else if(s[0].status1 === "Off"){
                    // this.setState({status2:true})
                    // this.setState({status1:false})
                    // this.setState({status3:false})
                    // this.setState({color:'red'})
                    setStatus1(false)
                    setStatus2(true)
                    setStatus3(false)
                    setColor('red')
                } else{
                    // this.setState({status3:true})
                    // this.setState({status1:false})
                    // this.setState({status2:false})
                    // this.setState({color:'blue'})
                    setStatus1(false)
                    setStatus2(false)
                    setStatus3(true)
                    setColor('blue')
                }
            }else if(channel_name == "channel4"){
                if(s[0].status2 === "On"){
                    // this.setState({status1:true})
                    // this.setState({status2:false})
                    // this.setState({status3:false})
                    // this.setState({color:'green'})
                    setStatus1(true)
                    setStatus2(false)
                    setStatus3(false)
                    setColor('green')
                } else if(s[0].status2 === "Off"){
                    // this.setState({status2:true})
                    // this.setState({status1:false})
                    // this.setState({status3:false})
                    // this.setState({color:'red'})
                    setStatus1(false)
                    setStatus2(true)
                    setStatus3(false)
                    setColor('red')

                } else{
                    // this.setState({status3:true})
                    // this.setState({status1:false})
                    // this.setState({status2:false})
                    // this.setState({color:'blue'})
                    setStatus1(false)
                    setStatus2(false)
                    setStatus3(true)
                    setColor('blue')
                }
            } else {
                if(s[0].status1===s[0].status2){
                    if(s[0].status1 === "On"){
                        // this.setState({status1:true})
                        // this.setState({status2:false})
                        // this.setState({status3:false})
                        // this.setState({color:'green'})
                        setStatus1(true)
                    setStatus2(false)
                    setStatus3(false)
                    setColor('green')
                    }else if(s[0].status1==="Off"){
                        // this.setState({status2:true})
                        // this.setState({status1:false})
                        // this.setState({status3:false})
                        // this.setState({color:'red'})
                        setStatus1(false)
                        setStatus2(true)
                        setStatus3(false)
                        setColor('red')
    
                    } else { 
                        // this.setState({status3:true})
                        // this.setState({status1:false})
                        // this.setState({status2:false})
                        // this.setState({color:'blue'})
                        setStatus1(false)
                    setStatus2(false)
                    setStatus3(true)
                    setColor('blue')
                    }
                } else {
                    // this.setState({status1:false})
                    // this.setState({status2:false})
                    // this.setState({status3:false})
                    // this.setState({color:'green'})
                    setStatus1(false)
                    setStatus2(false)
                    setStatus3(false)
                    setColor('green')
                }
            }
        // this.setState({
        //     selectedChannel: value
        // })
        setSelectedChannel(value)
    }
    const formattedCoordsArray = heatMapData.addressPoints.map((value) => {
        const coordinates = getJSONElement(value, ['coordinates']);
        if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
            return [
                coordinates[0],         // Latitude
                coordinates[1],         // Longitude
                parseFloat(value.temperature) // Temperature
            ];
        } else {
            return null; // or handle the case where coordinates are missing or invalid
        }
    });
    
      formattedCoordsArray.forEach((formattedCoords) => {
        coords.push(formattedCoords);
      });

      const formattedCoordsArray1 = heatMapData.addressPoints.map((value) => {
        const coordinates = getJSONElement(value, ['coordinates']);
        if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
            return [
                coordinates[0],         // Latitude
                coordinates[1],         // Longitude
                parseFloat(value.humidity) // Temperature
            ];
        } else {
            return null; // or handle the case where coordinates are missing or invalid
        }
    });

      formattedCoordsArray1.forEach((formattedCoords) => {
        coords1.push(formattedCoords);
      });

      const formattedCoordsArray2 = heatMapData.addressPoints.map((value) => {
        const coordinates = getJSONElement(value, ['coordinates']);
        if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
            return [
                coordinates[0],         // Latitude
                coordinates[1],         // Longitude
                parseFloat(value.luminousity) // Temperature
            ];
        } else {
            return null; // or handle the case where coordinates are missing or invalid
        }
    });

      formattedCoordsArray2.forEach((formattedCoords) => {
        coords2.push(formattedCoords);
      });

      const formattedCoordsArray3 = heatMapData.addressPoints.map((value) => {
        const coordinates = getJSONElement(value, ['coordinates']);
        if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
            return [
                coordinates[0],         // Latitude
                coordinates[1],         // Longitude
                value.occupancy // Temperature
            ];
        } else {
            return null; // or handle the case where coordinates are missing or invalid
        }
    });

      formattedCoordsArray3.forEach((formattedCoords) => {
        coords3.push(formattedCoords);
      });


    return (
        <div className={classes.root}>
            <Snackbar open={openerr} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert style={{ cursor: "pointer" }} severity="error" variant="filled" onClose={handleerrorclose}>
          {errmsg}
        </Alert>
            </Snackbar>
            <FormControl variant="filled" className={classes.zone}
            style={{ backgroundColor: "#eeeef5"}}>
                <InputLabel id="demo-simple-select-label">Zone</InputLabel>
                <Select
                    style={{ borderRadius: '0.83vw' ,fontWeight:"bold"}}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Zone"
                    value={zdata}
                    className={classes.select}
                    disableUnderline
                >
                    {zone.map(_item => (
                        <MenuItem key={_item.id} value={_item.name} onClick={() => handlezonechange(_item.name, _item.id)}>{_item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <FormControl variant="filled" className={classes.area} style={{ backgroundColor: "#eeeef5", marginTop: ""}}
            >
                <InputLabel id="demo-simple-select-label">Area</InputLabel>
                <Select
                    style={{ borderRadius: '0.83vw',fontWeight:"bold" }}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Area"
                    value={adata}
                    className={classes.select}
                    disableUnderline
                >
                    {areas.map(_item => (
                        <MenuItem key={_item.id} value={_item.name} onClick={() => handleareachange(_item.name, _item.id)}>{_item.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div style={{ width: "100%", height: "4vh", marginTop: '1%' }}  >
                <SwitchSelector
                    onChange={onChangetype}
                    options={options1}
                    initialSelectedIndex={initialSelectedIndex1}
                    // border="1px solid #0123B4"
                    backgroundColor={"#e9e5e5"}
                    fontColor={"rgba(0, 0, 0, 0.87)"}
                    wrapperBorderRadius={5}
                    optionBorderRadius={8}
                />
            </div>
            <Grid columns={3}>
                <Grid.Row>
                    <Grid.Column style={{ width: '65%' }}>
                        <Cards className={classes.mapcard} style={{height:"68vh"}}>
                        <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                            <Map
                                ref={mapRef}
                                doubleClickZoom={false}
                                zoomControl={false}
                                dragging={false}
                                scrollWheelZoom={false}
                                crs={Leaflet.CRS.Simple}
                                center={[0, 0]}
                                attributionControl={false}
                                // bounds={[[0, 0], [600, 730]]}
                                bounds={[[0, 0], [420, 590]]}
                                className={"floor-map"}
                                maxZoom={2} 
                                onClick={(e) => { console.log({ x: e.latlng.lat, y: e.latlng.lng }) }}
                                style={{                  backgroundColor: "white",
                            }}
                            >
                                <ImageOverlay
                                    interactive
                                    // url={'https://localhost/' + localStorage.floorName + '.jpg'}
                                    url={floor1}
                                    // bounds={[[0,-27], [410, 620]]}
                                    // bounds={[[50, 15], [600, 650]]}
                                    // bounds={[[100, -8], [525, 640]]}
                                    bounds={[[0, 0], [420, 590]]}
                                />
                                {heatMapData.addressPoints.map((value123, index) => {
                                    return value === 'thl' ? (
                                        <InterpolationHeatmap key={index} data={heatMapData.addressPoints} value={value} data1={coords} iconDevice={iconDevice} />
                                    ) : value === 'humidity' ? (
                                        <InterpolationHeatmap key={index} data={heatMapData.addressPoints} value={value} data1={coords1} iconDevice={iconDevice} />
                                    ) : value === 'luminousity' ? (
                                        <InterpolationHeatmap key={index} data={heatMapData.addressPoints} value={value} data1={coords2} iconDevice={iconDevice} />
                                    ) : value === 'occupancy'?
                                    (<InterpolationHeatmap key={index} data={heatMapData.addressPoints} value={value} data1={coords3} iconDevice={iconDevice} />): null;
                                    })}
                                <ZoomControl position="bottomright" />
                            </Map>
                        </Spin>
                        </Cards>
                    </Grid.Column>
                    <Grid.Column>
                        <div style={{ marginTop: '4%'
                        // ,"overflow-x":"hidden","overflow-y": "scroll",scrollBehavior:"smooth",height:"68vh" ,alignItems:"center"
                        }}>
                            {
                            boolfloor === true && dropfloor.length !== 0 ?
                                <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                                    <Card.Group>
                                    {  
                                        role_id !=2 ? 
                                            <>
                                              {
                                                dropfloor.map((_flr) => (
                                                    <Card style={{"borderRadius":"12px"}}>  
                                                        <Card.Content>
                                                        <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>   
                                                        <Grid columns={2}>
                                                            <Grid.Row>
                                                                <Grid.Column>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginRight":"40px"}}>
                                                                    {/* <Blink text={_flr.mode+"-"+_flr.cmd} color={_flr.mode==="Auto"?"blue":"green"} fontSize="10"></Blink> */}
                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                </Card.Header>
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                {_flr.occupancy!=0 ?    
                                                                <Card.Header style={{"fontWeight":"bold"}}>{
                                                                    // <AirlineSeatReclineNormalIcon style={{"marginBottom":"-10px","fontSize":"30px"}}/>}
                                                                    <SupervisorAccountIcon style={{"marginLeft":"65px","fontSize":"30px"}}/>}
                                                                </Card.Header>
                                                                :<div></div> 
                                                                
                                                                }
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        </Grid>
                                                        <Card.Description >
                                                            <Buttons  
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "On" ? "green" : ""} 
                                                                size="medium" 
                                                                name={'btn_'+_flr.id} 
                                                                animated='fade'
                                                                onClick={() => submit(_flr,1,100,'z')}
                                                                style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px',pointerEvents: "none", opacity: "0.4"  }}
                                                            >
                                                                <Buttons.Content visible>ON</Buttons.Content>
                                                                <Buttons.Content hidden>ON</Buttons.Content>
                                                            </Buttons>
                                                            <Buttons 
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "Off" ? "red" : ""} 
                                                                size="medium" 
                                                                name={'btn_'+_flr.id}
                                                                animated='fade' 
                                                                onClick={() => submit(_flr,0,0,'z')}
                                                                style={{pointerEvents: "none", opacity: "0.4"}}
                                                            >
                                                              <Buttons.Content visible>OFF</Buttons.Content>
                                                              <Buttons.Content hidden>OFF</Buttons.Content>
                                                            </Buttons>
                                                            <Buttons  
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "Auto" ? "blue" : ""}
                                                                size="medium" 
                                                                name={'btn_'+_flr.id} 
                                                                animated='fade'
                                                                onClick={() => submit(_flr,4,0,'z')}
                                                                style={{pointerEvents: "none", opacity: "0.4"}}
                                                            >
                                                                <Buttons.Content visible>Auto</Buttons.Content>
                                                                <Buttons.Content hidden>Auto</Buttons.Content>
                                                            </Buttons>
                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                        </Card.Description>
                                                        </Card.Content>
                                                    </Card>
                                                ))
                                                }
                                            </>
                                            :<>
                                            {/* zone-level cards */}
                                                {
                                                dropfloor.map((_flr) => (
                                                    <Card style={{"borderRadius":"12px"}}>  
                                                        <Card.Content>
                                                        <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>   
                                                        <Grid columns={2}>
                                                            <Grid.Row>
                                                                <Grid.Column>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginRight":"40px"}}>
                                                                    {/* <Blink text={_flr.mode+"-"+_flr.cmd} color={_flr.mode==="Auto"?"blue":"green"} fontSize="10"></Blink> */}
                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                </Card.Header>
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                {_flr.occupancy!=0 ?    
                                                                <Card.Header style={{"fontWeight":"bold"}}>{
                                                                    // <AirlineSeatReclineNormalIcon style={{"marginBottom":"-10px","fontSize":"30px"}}/>}
                                                                    <SupervisorAccountIcon style={{"marginLeft":"65px","fontSize":"30px"}}/>}
                                                                </Card.Header>
                                                                :<div></div> 
                                                                
                                                                }
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        </Grid>
                                                        <Card.Description >
                                                            <Buttons  
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "On" ? "green" : ""} 
                                                                size="medium" 
                                                                name={'btn_'+_flr.id} 
                                                                animated='fade'
                                                                onClick={() => submit(_flr,1,100,'z')}
                                                                style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px' }}
                                                            >
                                                                <Buttons.Content visible>ON</Buttons.Content>
                                                                <Buttons.Content hidden>ON</Buttons.Content>
                                                            </Buttons>
                                                            <Buttons 
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "Off" ? "red" : ""} 
                                                                size="medium" 
                                                                name={'btn_'+_flr.id}
                                                                animated='fade' 
                                                                onClick={() => submit(_flr,0,0,'z')}
                                                            >
                                                              <Buttons.Content visible>OFF</Buttons.Content>
                                                              <Buttons.Content hidden>OFF</Buttons.Content>
                                                            </Buttons>
                                                            <Buttons  
                                                                // inverted
                                                                type="submit"
                                                                color={_flr.status === "Auto" ? "blue" : ""}
                                                                size="medium" 
                                                                name={'btn_'+_flr.id} 
                                                                animated='fade'
                                                                onClick={() => submit(_flr,4,0,'z')}
                                                            >
                                                                <Buttons.Content visible>Auto</Buttons.Content>
                                                                <Buttons.Content hidden>Auto</Buttons.Content>
                                                            </Buttons>
                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                        </Card.Description>
                                                        </Card.Content>
                                                    </Card>
                                                ))
                                                }
                                            </>}
                                    </Card.Group>
                                </Spin>
                                : boolzone === true ?
                                    <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                                        <Card.Group>
                                        {  
                                        role_id !=2 ? 
                                        <> 
                                             {dropzone.map((_flr,i) => (
                                              <Card key={i} style={{"borderRadius":"12px"}}>
                                                <Card.Content>
                                                        <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>
                                                        <Grid>
                                                            <Grid.Row columns={2}>
                                                                <Grid.Column>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>
                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                </Card.Header>
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                {_flr.occupancy!=0 ?    
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>{
                                                                    <SupervisorAccountIcon style={{"marginLeft":"65px","fontSize":"30px"}}/>}
                                                                </Card.Header>
                                                                : <div></div>
                                                                }
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        </Grid>
                                                            <Card.Description>
                                                                <Grid>
                                                                <Grid.Row columns={2}>
                                                                <Grid.Column>   
                                                                <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green" }}/>
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginBottom":"7%","marginLeft":"-94px"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={state['intensity_'+_flr.id]}
                                                                    defaultValue={0}
                                                                    value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity : ['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'a')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                                </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "On" ? "green" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'a')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px',pointerEvents: "none", opacity: "0.4" }}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Off" ? "red" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'a')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Auto" ? "blue" : ""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'a')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                </Card.Content>
                                              </Card>  
                                            ))}
                                            </>
                                            :
                                            <> 
                                            {/* area-level cards */}
                                            {dropzone.map((_flr,i) => (
                                              <Card key={i} style={{"borderRadius":"12px"}}>
                                                <Card.Content>
                                                        <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>
                                                        <Grid>
                                                            <Grid.Row columns={2}>
                                                                <Grid.Column>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>
                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                </Card.Header>
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                {_flr.occupancy!=0 ?    
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>{
                                                                    <SupervisorAccountIcon style={{"marginLeft":"65px","fontSize":"30px"}}/>}
                                                                </Card.Header>
                                                                : <div></div>
                                                                }
                                                                </Grid.Column>
                                                                <Grid.Column>
                                                                </Grid.Column>
                                                            </Grid.Row>
                                                        </Grid>
                                                            <Card.Description>
                                                                <Grid>
                                                                <Grid.Row columns={2}>
                                                                <Grid.Column>   
                                                                <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green" }}/>
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginBottom":"7%","marginLeft":"-94px"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={state['intensity_'+_flr.id]}
                                                                    defaultValue={0}
                                                                    value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity : ['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'a')}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                                </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "On" ? "green" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'a')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px' }}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Off" ? "red" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'a')}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Auto" ? "blue" : ""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'a')}
                                                                >
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                </Card.Content>
                                              </Card>  
                                            ))}
                                            </>}
                                        </Card.Group>
                                    </Spin>
                                    : boolarea === true ?
                                        <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                                            <Card.Group >
                                                    {  
                                                role_id !=2 ? 
                                                <>  {
                                                    droparea.map((_flr,i) => (
                                                    <Card key={i} style={{"borderRadius":"12px"}}> 
                                                        <Card.Content>
                                                                <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>
                                                                <Grid>
                                                                    <Grid.Row columns={2}>
                                                                        <Grid.Column>
                                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>
                                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                            </Card.Header>
                                                                        </Grid.Column>
                                                                        <Grid.Row>
                                                                        </Grid.Row>
                                                                    </Grid.Row>
                                                                </Grid>
                                                            { _flr.id.slice(0,3) == "50d" ?    
                                                            <Card.Description>
                                                            <Grid>
                                                            <Grid.Row columns={2}>
                                                                <Grid.Column>    
                                                                    <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"}}/>
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginLeft":"-94px", "marginBottom":"7%"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={'intensity_'+_flr.id}
                                                                    defaultValue={0}
                                                                    value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity :['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    // value={_flr.Intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                            </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "On" ? "green" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'d')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px',pointerEvents: "none", opacity: "0.4" }}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Off" ? "red" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Auto" ? "blue" : ""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At :{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                            :
                                                            <Card.Description style={{"textAlign":"center"}}>
                                                            {_flr.channel5!=false && (_flr.channel!=null || _flr.channel4!=null) ?
                                                                <div>
                                                                    <Radio 
                                                                        style={{marginRight: "2%",pointerEvents: "none", opacity: "0.4"}} 
                                                                        name={'channel3_'+_flr.id} 
                                                                        label="Channel 3" 
                                                                        value={'channel3_'+_flr.id}
                                                                        checked={'channel3_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange}
                                                                        />
                                                                    <Radio 
                                                                        style={{marginRight: "2%",pointerEvents: "none", opacity: "0.4"}}  
                                                                        name={'channel4_'+_flr.id} 
                                                                        label="Channel 4" 
                                                                        value={'channel4_'+_flr.id}
                                                                        checked={'channel4_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange}
                                                                    />
                                                                    <Radio 
                                                                        style={{marginBottom: "4%",marginTop:"2%",pointerEvents: "none", opacity: "0.4"}}
                                                                        name={'channel0_'+_flr.id} 
                                                                        label="Both Channels" 
                                                                        value={'channel0_'+_flr.id}
                                                                        checked={'channel0_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange} 
                                                                    />
                                                                </div>
                                                            :
                                                                <div></div>
                                                            }
                                                                <Grid>
                                                                <Grid.Row columns={2}>
                                                                <Grid.Column>  
                                                                    <WbIncandescentIcon style={{ color: status1==true?"green":status2==true?"red":"blue","marginLeft":"-100px" }}/> 
                                                                    {/* <WbIncandescentIcon style={{ color: this.state.status1==true?"green":this.state.status2==true?"red":"blue","marginLeft":"-100px" }}/> */}
                                                                    {/* <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green","marginLeft":"-100px" }}/> */}
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginBottom":"7%","marginLeft":"-94px"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={'intensity_'+_flr.id}
                                                                    defaultValue={0}
                                                                    // value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity : state['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        // this.setState({
                                                                        // ['intensity_'+_flr.id]: value});
                                                                        setState({
                                                                            ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        // this.setState({
                                                                        // ['intensity_'+_flr.id]: value});
                                                                        setState({
                                                                            ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    // onAfterChange={() => submit(_flr,2,this.state['intensity_'+_flr.id],'d')}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                                </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status=='On' ? "green":""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'d')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px' ,pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status=='Off' ?"red":""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons 
                                                                    // inverted
                                                                    type="submit"
                                                                    // color={this.state.status3 == true  && _flr.id === this.state.wacdata ?"blue":""}
                                                                    color={_flr.status=='Auto' ?"blue":""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'d')}
                                                                    style={{pointerEvents: "none", opacity: "0.4"}}
                                                                >
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                            }
                                                        </Card.Content> 
                                                   </Card> 
                                                ))
                                                }
                                                </>
                                                :
                                                <>
                                                {/* device-level controls */}
                                                 {
                                                 droparea.map((_flr,i) => (
                                                    <Card key={i} style={{"borderRadius":"12px"}}> 
                                                        <Card.Content>
                                                                <Card.Header style={{"textAlign":"center"}}>{_flr.name.charAt(0).toUpperCase()+_flr.name.slice(1)}</Card.Header>
                                                                <Grid>
                                                                    <Grid.Row columns={2}>
                                                                        <Grid.Column>
                                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold"}}>
                                                                                    <Blink text={_flr.mode=='Auto'?_flr.mode:_flr.mode+"-"+_flr.cmd} color={_flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"} fontSize="10"></Blink>
                                                                            </Card.Header>
                                                                        </Grid.Column>
                                                                        <Grid.Row>
                                                                        </Grid.Row>
                                                                    </Grid.Row>
                                                                </Grid>
                                                            { _flr.id.slice(0,3) == "50d" ?    
                                                            <Card.Description>
                                                            <Grid>
                                                            <Grid.Row columns={2}>
                                                                <Grid.Column>    
                                                                    <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green"}}/>
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginLeft":"-94px", "marginBottom":"7%"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={'intensity_'+_flr.id}
                                                                    defaultValue={0}
                                                                    value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity :['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    // value={_flr.Intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        setState({
                                                                        ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'d')}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                            </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "On" ? "green" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'d')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px' }}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Off" ? "red" : ""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'d')}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status === "Auto" ? "blue" : ""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'d')}
                                                                >
                                                                    
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                                <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At :{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                            :
                                                            <Card.Description style={{"textAlign":"center"}}>
                                                            {_flr.channel5!=false && (_flr.channel!=null || _flr.channel4!=null) ?
                                                                <div>
                                                                    <Radio 
                                                                        style={{marginRight: "2%"}} 
                                                                        name={'channel3_'+_flr.id} 
                                                                        label="Channel 3" 
                                                                        value={'channel3_'+_flr.id}
                                                                        checked={'channel3_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange}
                                                                        />
                                                                    <Radio 
                                                                        style={{marginRight: "2%"}}  
                                                                        name={'channel4_'+_flr.id} 
                                                                        label="Channel 4" 
                                                                        value={'channel4_'+_flr.id}
                                                                        checked={'channel4_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange}
                                                                    />
                                                                    <Radio 
                                                                        style={{marginBottom: "4%",marginTop:"2%"}}
                                                                        name={'channel0_'+_flr.id} 
                                                                        label="Both Channels" 
                                                                        value={'channel0_'+_flr.id}
                                                                        checked={'channel0_'+_flr.id === selectedChannel}
                                                                        onChange={handleChannelChange} 
                                                                    />
                                                                </div>
                                                            :
                                                                <div></div>
                                                            }
                                                                <Grid>
                                                                <Grid.Row columns={2}>
                                                                <Grid.Column>   
                                                                    <WbIncandescentIcon style={{ color: status1==true?"green":status2==true?"red":"blue","marginLeft":"-100px" }}/>
                                                                    {/* <WbIncandescentIcon style={{ color: this.state.status1==true?"green":this.state.status2==true?"red":"blue","marginLeft":"-100px" }}/> */}
                                                                    {/* <WbIncandescentIcon style={{ color: _flr.status=="On"?"green":_flr.status=="Off"?"red":_flr.status=="Auto"?"blue":"green","marginLeft":"-100px" }}/> */}
                                                                </Grid.Column>
                                                                <div style={{"width":"70%", "marginBottom":"7%","marginLeft":"-94px"}}>
                                                                <Grid.Column>
                                                                <SliderWithTooltip
                                                                    tipFormatter={percentFormatter}
                                                                    tipProps={{ overlayClassName: 'sliderZone' }}
                                                                    min={0}
                                                                    max={100}
                                                                    step={1}
                                                                    name={'intensity_'+_flr.id}
                                                                    defaultValue={0}
                                                                    // value={(state['intensity_'+_flr.id] === undefined) ? _flr.Intensity : state['intensity_'+_flr.id]}
                                                                    // value={res.intensity}
                                                                    onChange={(value) => {
                                                                        // this.setState({intensity:value}) 
                                                                        // this.setState({
                                                                        // ['intensity_'+_flr.id]: value});
                                                                        setState({
                                                                            ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onBeforeChange={(value) => {
                                                                        // this.setState({intensity:value})
                                                                        // this.setState({
                                                                        // ['intensity_'+_flr.id]: value});
                                                                        setState({
                                                                            ['intensity_'+_flr.id]: value});
                                                                    }}
                                                                    onAfterChange={() => submit(_flr,2,state['intensity_'+_flr.id],'d')}
                                                                />
                                                                </Grid.Column>
                                                                </div>
                                                                </Grid.Row>
                                                                </Grid>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status=='On' ? "green":""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,1,100,'d')}
                                                                    style={{  justifyContent: 'center', alignItems: 'center', marginLeft:'25px' }}
                                                                >
                                                                    <Buttons.Content visible>ON</Buttons.Content>
                                                                    <Buttons.Content hidden>ON</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons  
                                                                    // inverted
                                                                    type="submit"
                                                                    color={_flr.status=='Off' ?"red":""} 
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id}
                                                                    animated='fade' 
                                                                    onClick={() => submit(_flr,0,0,'d')}
                                                                >
                                                                    <Buttons.Content visible>OFF</Buttons.Content>
                                                                    <Buttons.Content hidden>OFF</Buttons.Content>
                                                                </Buttons>
                                                                <Buttons 
                                                                    // inverted
                                                                    type="submit"
                                                                    // color={this.state.status3 == true  && _flr.id === this.state.wacdata ?"blue":""}
                                                                    color={_flr.status=='Auto' ?"blue":""}
                                                                    size="medium" 
                                                                    name={'btn_'+_flr.id} 
                                                                    animated='fade'
                                                                    onClick={() => submit(_flr,4,0,'d')}
                                                                >
                                                                    <Buttons.Content visible>Auto</Buttons.Content>
                                                                    <Buttons.Content hidden>Auto</Buttons.Content>
                                                                </Buttons>
                                                            <Card.Header style={{"textAlign":"center","fontWeight":"bold","marginTop":"5px"}}>Controlled At:{_flr.created_at}</Card.Header>
                                                            </Card.Description>
                                                            }
                                                        </Card.Content> 
                                                   </Card> 
                                                ))
                                                }</>
                                                }
                                            </Card.Group>
                                        </Spin>
                                        :
                                        <div></div>
                            }
                        </div>
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <SemanticToastContainer position='top-center' />
            {loading === true ? 
                <Backdrop className={classes.backdrop} open={loading}>
                    <CircularProgress color="inherit" />
                </Backdrop>
            :
                <div></div>   
            }
        </div>
    )
}

