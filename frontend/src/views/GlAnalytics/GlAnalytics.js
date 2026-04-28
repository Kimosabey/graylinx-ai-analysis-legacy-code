import React,{useEffect,useState} from 'react';
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
} from "@material-ui/core";
import api from "../../api";
import DevFaults from "./devFaultsApex";
// import TimeSeriesVav from './../TimeSeriesVav'
const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        margin: 0,
        padding: 0,
        width: "100%",
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
      paper: {
        background:'#FFFFFF 0% 0% no-repeat padding-box',
        boxShadow:'0px 8px 40px #0123B433;',
        padding: theme.spacing(1),
        textAlign: "center",
        color: theme.palette.text.secondary,
         borderRadius: '12px',
         opacity:'1'
      },
}))

export default function GraphPage(props){
    const classes = useStyles();
    const zone_data = useSelector((state) => state.inDashboard.locationData);
    const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
    const [ahudevice, setAhudevice] = useState([]);
    const [fid, setFId] = useState('');
    const [floor, setFloor] = useState([]);
    const [data, setData] = useState("");
    const [deviceid, setDeviceid] = useState("");
    const [ahuFault, setAhuFault] = useState([]);
    const [allDevFault, setAllDevFault] = useState([]);
    const buildingID = useSelector((state) => state.isLogged.data.building.id);
    
    const handlefloorchange = (name, id) => {
      setFId(id)
      setFdata(name);
      api.floor.devicemap(id, "AHU").then((res) => {
        setAhudevice(res);
      }).catch((error)=>{
      //   setOpenerr(true)
      //   if(error.response.data.message){
      //     setErrmsg(error.response.data.message)
      //     }else{
      //       setErrmsg('')
      //     } 
         })
    };

    const handleChange = (name, id) => {
      setDeviceid(id);
      setData(name);
      api.floor.getAhuFault(id).then((res)=>{
          // console.log("fault dta",res)
          setAhuFault(res)
      }).catch((error)=>{

      })
  }
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
            setAhudevice(res);
            setDeviceid(res[0].ssid)
            setData(res[0].name)
            api.floor.getAhuFault(res[0].ssid).then((res)=>{
                // console.log("fault dta",res)
                setAhuFault(res)
            }).catch((error)=>{
    
            })
           
          }).catch((error) =>{
            // setOpenerr(true)
            // if(error.response.data.message){
            //   setErrmsg(error.response.data.message)
            //   }else{
            //     setErrmsg('')
            //   }   
               })
        api.dashboard.getMetricData(buildingID).then((res) => {
            res.sort(function (a, b) {
              return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
            });
            setFloor(res);
          }).catch((error)=>{
            // setOpenerr(true)
            // if(error.response.data.message){
            //   setErrmsg(error.response.data.message)
            //   }else{
            //     setErrmsg('')
            //   }     
             })
            //  const timer = setInterval(() => {
            //   api.floor.getAhuFault(deviceid).then((res)=>{
            //     console.log("fault dta",res)
            //     setAhuFault(res)
            // }).catch((error)=>{
    
            // })
            // }, 3000);
            // return () => clearInterval(timer);
        
       }, [buildingID]);

       
    return(
        <div className={classes.root} style={{ marginTop: "0%" }}>
            <Grid container spacing={2}>
                <Grid container item spacing={1}>
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
                    <Grid item xs={5}>
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
                </Grid>
                <Grid container item spacing={1}>
                {/* fault type graph */}
                    <Grid item xs={12}>
                    {/* <Card className={classes.paper} style={{height:"38vh"}}> */}
                    <DevFaults   data={ahuFault} graphType={'ahuFault'} heading={'AHU Faults'}
                                  />
                    {/* </Card> */}
                    </Grid>
                    {/* <Grid item xs={6}>
                    <Card className={classes.paper} style={{height:"38vh"}}>
                    <TimeSeriesGlAnalytics   data={allDevFault} graphType={'allDevFault'} heading={'All Device Faults'}
                                  style={{ width: "100%", height: "100%" }} />
                    </Card>
                    </Grid> */}
                </Grid>
            </Grid>
        </div>
    )
}