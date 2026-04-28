import React,{useState,useEffect} from 'react';
import api from '../../api';
import { Grid, Select, FormControl, MenuItem, InputLabel } from '@material-ui/core';
import SwitchSelector from "react-switch-selector";
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import { useSelector } from 'react-redux';
import Lms from '../Heatmap/GlLms.js';
import { message, Spin } from 'antd';
import { makeStyles } from '@material-ui/core/styles';


const useStyles = makeStyles((theme) => ({
    floorcard:{
        width:'26%',
        height:'6vh',
        marginLeft:'2vh'
    },
    selector:{
        overflow:'hidden',
        width: "42%",
        // borderRadius:'0.8vw'(hvac&LMS)
        marginLeft:'2vh'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    style:{
        overflow:'hidden',
        boxShadow:'inset 0 3px 8px rgba(0, 0, 0, .3)'
    },select: {
    "&:after": {
      borderBottomColor: "blue",
      marginTop:"-2vh"
    },
    "& .MuiSvgIcon-root": {
      color: "white",
      backgroundColor:"#0123b4",borderRadius:"8px"
    },
    "& .MuiSelect-root ": {
        marginTop:"-2vh"
      }
  },
}));

export default function Selector(props){
    let zones=[],newZones=[], occupancy=[];
    const [fdata, setFdata] = React.useState(localStorage.getItem('floorName'));
    const [fid, setFId] = React.useState('');
    const [floor, setFloor] = useState([]);
    const [value, setValue] = React.useState('');
    const [view,setView] = React.useState(false);
    const [boolfloor,setboolfloor]=React.useState(true);
    const [boolzone,setboolzone]=React.useState(false);
    const [boolarea,setboolarea]=React.useState(false);
    const [locationId,setLocation]=React.useState('');
    const [zone,setZone] = useState([]);
    const [dropfloor,setDropfloor]=useState([]);
    const [data,setData]=React.useState(false);
    const [level, setLevel] = React.useState("hvac");
    const [loading, setLoading] = useState(false);
    const buildingID = useSelector(state => state.isLogged.data.building.id);
    // const campusId = useSelector(state =>state.isLogged.data.campus.id)
    const classes = useStyles();
    useEffect(()=>{
        api.dashboard.getMetricData(buildingID).then(res => {
            res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
            setFloor(res)
        })
        api.controls.floorlights(localStorage.getItem('floorID')).then(res => {
            // console.log("floorlightsapi",res,res.length)
            if(res =='no data available'){
              console.log("res is no data available")  
            }
            else{
                if(res.lights.length!==0){  
                    let masterArr=[];
                    res.lights.map(_each => {
                        if(_each.deviceType === "ANALOG_CONTROLLER") {  
                            let statusarr=[];
                            let intensityarr=[];
                            const { master, channels } = _each;
                            let channel_value = channels.map((item,i)=>item.name)
                            let value = channel_value.length === 2 ? 0 : channel_value[0].slice(8,9)
                            if(channels.length===2){
                                statusarr.push(channels[0].status)
                                statusarr.push(channels[1].status)
                                intensityarr.push(channels[0].light_level)
                                intensityarr.push(channels[1].light_level)
                            } else {
                                statusarr.push(channels[0].status)
                                intensityarr.push(channels[0].light_level)
                            }
                            let findstatus=statusarr.every(i=>i===statusarr[0])
                            let zonestatus=findstatus?statusarr[0]:""
                            let sum=0
                            intensityarr.forEach((_ele,index)=>{
                            sum+=_ele
                            })
                            let values = (sum/(intensityarr.length*100))*100
                            let findmode=statusarr.every(i=>i===statusarr[0])
                            let zonemode=(findmode && (statusarr[0]==="On"|| statusarr[0]==="Off"))?"Manual":(findmode && (statusarr[0]==="Auto"))?"Auto":"Manual"
                            let status = master.cmd===undefined?'Server':master.cmd
                            masterArr.push({macId: master.mac, channel: JSON.parse(value)})
                            let zoneObj = {
                                "id": master.zoneId,
                                "zoneId": master.areaName,
                                "name":  master.zoneName,
                                "master": masterArr,
                                "status":zonestatus,
                                "mode":zonemode,
                                "Intensity":Math.ceil(values),
                                "occupancy":'',
                                "cmd":status==='Null'?'Tab':status.charAt(0).toUpperCase()+status.slice(1),
                                "created_at":master.created_at
                            }
                            zones.push(zoneObj);
                        }
                        if(_each.deviceType === "DALI_CONTROLLER") {
                            const { master, slaves } = _each;
                            let zoneObj = {}
                            slaves.map(_slave => {
                                let statusarr=slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({status}) => status)
                                let findstatus=statusarr.every(i=>i===statusarr[0])
                                let zonestatus=findstatus?statusarr[0]:""
                                let intensityarr = slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({light_level}) =>light_level)
                                let sum=0
                                intensityarr.forEach((_ele,index)=>{
                                sum+=_ele
                                })
                                let value = (sum/(intensityarr.length*100))*100
                                let findmode=statusarr.every(i=>i===statusarr[0])
                                let zonemode=(findmode && (statusarr[0]==="On"|| statusarr[0]==="Off"))?"Manual":(findmode && (statusarr[0]==="Auto"))?"Auto":"Manual"
                                let c_from = slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({cmd_data}) => cmd_data)
                                let findc_from=c_from.every(i=>i===c_from[0])
                                let zonecmd=findc_from?c_from[0]:"Mixed modes"
                                let status = zonecmd===undefined?'Server':zonecmd
                                let time = slaves.filter(_s=>_s.zoneId === _slave.zoneId).map(({created_at}) => created_at).sort().reverse()
                                zoneObj = {
                                    "id": master.zoneId,
                                    "zoneId":master.areaId,
                                    "name":  master.zoneName,
                                    "master": [{
                                        macId: master.mac,
                                        slaves: slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({mac}) => mac),
                                        selection: "slaves"
                                    }],
                                    "status":zonestatus,
                                    "mode":zonemode,
                                    "Intensity":Math.ceil(value),
                                    "occupancy":'',
                                    "cmd":status==='Null'?'Tab':status.charAt(0).toUpperCase()+status.slice(1),
                                    "created_at":time[0]
                                }
                                
                                zones.push(zoneObj);
                            })
                        }
                    })
                    res.occupancy.map(_item=>{
                        let occupancyobj={
                            "id":_item.zone,
                            "data":_item.data
                        }
                        occupancy.push(occupancyobj)
                    })
                    zones.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);});
                    newZones = zones.reduce((acc, current) => {
                        let x = acc.find(item => item.id === current.id);
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            if(x.master.map(_elem => _elem.macId).indexOf(current.master[0].macId) < 0) {
                                if(x.mode===current.mode){
                                    x.mode=current.mode
                                    x.status=current.status
                                } else {
                                    if(current.mode==='Auto' && (x.mode==='Manual'||x.mode==='')){
                                        x.mode='Manual'
                                        x.status=''
                                    } else{
                                        x.mode=current.mode
                                        x.status=current.status
                                    }     
                                }
                                x.master.push(current.master[0])
                                acc.concat([x])
                            }
                            return acc
                        }
                    }, []);
                    occupancy.forEach(_element => {
                        newZones.forEach(element => {
                            if(_element.id === element.id){
                                element.occupancy=_element.data
                            } else{}
                        });
                    });
                    newZones.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);}); 
                    console.log("newZones1",newZones)
                    setZone(newZones)
                    let display_floor=[]
                        zone.map(element=>{
                        display_floor.push(element)
                        setDropfloor(display_floor)
                    })
                } else{
                    for(let i=0;i<=zone.length;i++){
                        zone.pop()
                    }
                }
            }
           
        })    
        setLocation(localStorage.getItem('floorID'))
        setFdata(localStorage.getItem('floorName'))
        setboolarea(false)
        setboolfloor(true)
        setboolzone(false)
    },[view])
    
    const handlefloorchange = (name,id) => {
        setFId(id)
        setFdata(name)
        localStorage.setItem('floorName',name)
        localStorage.setItem('floorID',id)     
            api.controls.floorlights(id).then(res => {
                if(res =='no data available'){
                    console.log("res is no data available")  
                  }
                  else{
               if(res.lights.length!==0){ 
                    let masterArr=[];
                    res.lights.map(_each => {
                        if(_each.deviceType === "ANALOG_CONTROLLER") {  
                            let statusarr=[];
                            let intensityarr=[];
                            const { master, channels } = _each;
                            let channel_value = channels.map((item,i)=>item.name)
                            let value = channel_value.length === 2 ? 0 : channel_value[0].slice(8,9)
                            if(channels.length===2){
                                statusarr.push(channels[0].status)
                                statusarr.push(channels[1].status)
                                intensityarr.push(channels[0].light_level)
                                intensityarr.push(channels[1].light_level)
                            } else {
                                statusarr.push(channels[0].status)
                                intensityarr.push(channels[0].light_level)
                            }
                            let findstatus=statusarr.every(i=>i===statusarr[0])
                            let zonestatus=findstatus?statusarr[0]:""
                            let sum=0
                            intensityarr.forEach((_ele,index)=>{
                            sum+=_ele
                            })
                            let values = (sum/(intensityarr.length*100))*100
                            let findmode=statusarr.every(i=>i===statusarr[0])
                            let zonemode=(findmode && (statusarr[0]==="On"|| statusarr[0]==="Off"))?"Manual":(findmode && (statusarr[0]==="Auto"))?"Auto":"Manual"
                            let status = master.cmd===undefined?'Server':master.cmd
                            masterArr.push({macId: master.mac, channel: JSON.parse(value)})
                            let zoneObj = {
                                "id": master.zoneId,
                                "zoneId": master.areaName,
                                "name":  master.zoneName,
                                "master": masterArr,
                                "status":zonestatus,
                                "mode":zonemode,
                                "Intensity":Math.ceil(values),
                                "occupancy":'',
                                "cmd":status==='Null'?'Tab':status.charAt(0).toUpperCase()+status.slice(1),
                                "created_at":master.created_at
                            }
                            zones.push(zoneObj);
                        }
                        if(_each.deviceType === "DALI_CONTROLLER") {
                            const { master, slaves } = _each;
                            let zoneObj = {}
                            slaves.map(_slave => {
                                let statusarr=slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({status}) => status)
                                let findstatus=statusarr.every(i=>i===statusarr[0])
                                let zonestatus=findstatus?statusarr[0]:""
                                let intensityarr = slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({light_level}) =>light_level)
                                let sum=0
                                intensityarr.forEach((_ele,index)=>{
                                sum+=_ele
                                })
                                let value = (sum/(intensityarr.length*100))*100
                                let findmode=statusarr.every(i=>i===statusarr[0])
                                let zonemode=(findmode && (statusarr[0]==="On"|| statusarr[0]==="Off"))?"Manual":(findmode && (statusarr[0]==="Auto"))?"Auto":"Manual"
                                let c_from = slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({cmd_data}) => cmd_data)
                                let findc_from=c_from.every(i=>i===c_from[0])
                                let zonecmd=findc_from?c_from[0]:"Mixed modes"
                                let status = zonecmd===undefined?'Server':zonecmd
                                let time = slaves.filter(_s=>_s.zoneId === _slave.zoneId).map(({created_at}) => created_at).sort().reverse()
                                zoneObj = {
                                    "id": master.zoneId,
                                    "zoneId":master.areaId,
                                    "name":  master.zoneName,
                                    "master": [{
                                        macId: master.mac,
                                        slaves: slaves.filter(_s => _s.zoneId === _slave.zoneId).map(({mac}) => mac),
                                        selection: "slaves"
                                    }],
                                    "status":zonestatus,
                                    "mode":zonemode,
                                    "Intensity":Math.ceil(value),
                                    "occupancy":'',
                                    "cmd":status==='Null'?'Tab':status.charAt(0).toUpperCase()+status.slice(1),
                                    "created_at":time[0]
                                }
                                
                                zones.push(zoneObj);
                            })
                        }
                    })
                    res.occupancy.map(_item=>{
                        let occupancyobj={
                            "id":_item.zone,
                            "data":_item.data
                        }
                        occupancy.push(occupancyobj)
                    })
                    zones.sort(function(a,b) {return (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0);});
                    newZones = zones.reduce((acc, current) => {
                        let x = acc.find(item => item.id === current.id);
                        if (!x) {
                            return acc.concat([current]);
                        } else {
                            if(x.master.map(_elem => _elem.macId).indexOf(current.master[0].macId) < 0) {
                                if(x.mode===current.mode){
                                    x.mode=current.mode
                                    x.status=current.status
                                } else {
                                    if(current.mode==='Auto' && (x.mode==='Manual'||x.mode==='')){
                                        x.mode='Manual'
                                        x.status=''
                                    } else{
                                        x.mode=current.mode
                                        x.status=current.status
                                    }     
                                }
                                x.master.push(current.master[0])
                                acc.concat([x])
                            }
                            return acc
                        }
                    }, []);
                    occupancy.forEach(_element => {
                        newZones.forEach(element => {
                            if(_element.id === element.id){
                                element.occupancy=_element.data
                            } else{}
                        });
                    });
                    newZones.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
                    setZone(newZones)
                    let display_floor=[]
                    zone.map(element=>{
                        display_floor.push(element)
                        setDropfloor(display_floor)
                    })
                    setData(true)
                } else {
                    for(let i=0;i<=zone.length;i++){
                        zone.pop()
                    }
                    setData(true)
                }  }
            })    
            setLocation(id)
            setFdata(name)
            setboolarea(false)
            setboolfloor(true)
            setboolzone(false)
            localStorage.setItem('floorName',name)
            localStorage.setItem('floorID',id)
            setZone([])
            
    }

    return(
        <div>
            <Grid container xs={12} direction='row' spacing={2}>
                <FormControl variant='filled' className={classes.floorcard}>
                    {/* <InputLabel id="demo-simple-select-label">Floor</InputLabel> */}
                    <Select
                    style={{borderRadius:'0.8vw',height:'6vh'
                    ,fontWeight:"bold"
                }}
                    labelId="demo-simple-select-label"
                    id="demo-simple-select-label"
                    label="Floor"
                    value={fdata}
                    className={classes.select}
                    disableUnderline
                    >
                        {floor.map(_item=>(
                            <MenuItem key={_item.name} value={_item.name} onClick={()=>handlefloorchange(_item.name,_item.id)}>{_item.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

                <Spin spinning={loading} size="default" style={{ justifyContent: 'center', alignContent: 'center', position: 'fixed' }}>
                    <Lms location={locationId} fdata={fdata} zone={zone} dropfloor={zone}/>
                </Spin>
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


