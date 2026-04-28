import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import api from "../../api";
import { Box } from "@material-ui/core";
import TimeSeriesUps from "../TimeSeriesUps.js";
import TimeSeriesUpsStatic from "../TimeSeriesUpsStatic";
import TimeSeries1 from "../TimeS";
// import TimeSeries2 from "../TimeC";

import {
  Grid,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
  Card,
} from "@material-ui/core";
import Typography from '@material-ui/core/Typography';
import Ups from "../../assets/img/ups_1.png";
import Success from "components/Typography/Success";
import Danger from "components/Typography/Danger";
import SemiCircleProgressBar from "react-progressbar-semicircle";
import { useSelector } from "react-redux";
import { ThemeProvider } from '@material-ui/core/styles';
import theme from '../../responsive/TextTypography';

import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginTop:'-1vh'
      },
  paper: {
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    padding: theme.spacing(1),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // backgroundColor: 'white',
    // borderRadius: '14px',
    borderRadius:"6px",
    boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor:"#fcfafa",
    height: '10vh',
    marginTop:"1vh",
    opacity:'1'
  },
  formControl: {
    autosize: true,
    clearable: false,
  },
  CardbodyInsideGrid: {
    "justify-content": "center",
    display: "inline-flex",
    padding: "0.9375rem 20px",
    flex: "1 1 auto",
    WebkitBoxFlex: "1",
    position: "relative",
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
  graphpaper: {
    background:'#FFFFFF 0% 0% no-repeat padding-box',
    borderRadius:"6px",
    boxShadow:"1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
    backgroundColor:"#fcfafa",
    height: "26vh",
    textAlign: 'center',
    color: theme.palette.text.secondary,
    // boxShadow: '0px 4px 20px #0123B41A',
    // borderRadius: '14px',
  },
  semicircularbarFont:{
   
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
        "& .semicircle-percent-value": {
            fontSize:'1.4vh',
            color:'grey'
        }
      },
      '@media (min-width:600px) and (max-width:959.95px)': {//sm
        "& .semicircle-percent-value": {
            fontSize:'1vh',
            color:'grey'
        }, },
      '@media (min-width:960px) and (max-width:1279.95px)': {//md
        "& .semicircle-percent-value": {
            fontSize:'1.7vh',
            color:'grey'
        },      },
      '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
        "& .semicircle-percent-value": {
            fontSize:'1vh',
            color:'grey'
        },      },
      '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
        "& .semicircle-percent-value": {
            fontSize:'1.2vh',
            color:'grey'
        },      },
  },
  semicircularbar:{
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
        marginTop:'-0.5vh',
        marginLeft:'-1.5vh'
      },
      '@media (min-width:600px) and (max-width:959.95px)': {//sm
        marginTop:'-1vh',
        marginLeft:'-0.1vh'
      },
      '@media (min-width:960px) and (max-width:1279.95px)': {//md
        marginTop:'-2vh',
        marginLeft:'-0.1vh'
      },
      '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
        // marginTop:'-2vh',
        marginLeft:'-3.1vh'
      },
      '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
        marginTop:'-1vh',
        marginLeft:'0.5vh'
      },
  },
  alarms:{
    fontSize:'2.5vh',
    color:'#4caf50'
  },
  statusFont: {
    fontWeight:'bold',
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      textAlign:'center',
      fontSize: '1.5vh',
      color:'#292929',
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      textAlign:'center',
      fontSize: '1.3vh',
      color:'#292929'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      textAlign:'center',
      fontSize: '1.3vh',
      color:'#292929'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      textAlign:'center',
      fontSize: '1.7vh',
      whiteSpace:'nowrap',
      color:'#292929'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      textAlign:'center',
      fontSize: '1.7vh',
      color:'#292929',
      whiteSpace:'nowrap',
    },
  },
  card1:{
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
     height:'26.5vh'
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      height:'28vh'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      height:'14vh'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      height:'14vh'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
      height:'14vh'
    },
  },
  image:{
    '@media (min-width:0px) and (max-width:599.95px)': {//xs
      marginLeft:'-4vh' 
    },
    '@media (min-width:600px) and (max-width:959.95px)': {//sm
      marginLeft:'-9vh'
    },
    '@media (min-width:960px) and (max-width:1279.95px)': {//md
      marginLeft:'-7.5vh'
    },
    '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
      marginLeft:'-4vh'
    },
    '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
    },
  }
}));

const getMyValue = (input, params=[]) => {
	let test = -1;
	try{
		if (input !== undefined)
			test = input[params[0]];
		else
			return;
		if (test !== undefined){
			for(let i=1; i<params.length; i++){
				if (params[i] !== undefined)
					test = test[params[i]]
				else
					break;
			}
		}
	} catch (e) {
		console.log('My Error in getMyValue: ', e.message);
	}
	return test;
}

export default function GlUps(props) {
    const classes = useStyles();
    const zone_data = useSelector((state) => state.inDashboard.locationData);
    const [fid, setFId] = useState('');
    const buildingID = useSelector((state) => state.isLogged.data.building.id);
    const [fdata, setFdata] = useState(localStorage.getItem('floorName'));
    const initialState =props.location.state != null ? props.location.state.dev_name : "UPS-1";
    // const initialState = props.location.state != null ? props.location.state.name : "UPS-1";
    const [data, setData] = useState(initialState);
    const initialState1 = props.location.state != null ? props.location.state.dev_id :'8ee50faf-4f7e-11ed-9ab5-9829a659bba7';
    console.log("initial----------------",initialState1)
    // const initialState1 = '8ee50faf-4f7e-11ed-9ab5-9829a659bba7';
    const [upsdevice, setUpsdevice] = useState([]);
    const [deviceid, setDeviceid] = useState(initialState1);
    const [ups1,setUps1]=useState([]);
    const [openerr,setOpenerr] = React.useState(false);
    const [errmsg,setErrmsg] = React.useState('');
    const [value2,setValue2]=useState([]);
     
    const [value3,setValue3]=useState([]);
    const [value4,setValue4]=useState([]);
    const [value5,setValue5]=useState([]);
    const [value6,setValue6]=useState([]);
    const [value7,setValue7]=useState([]);
    const [value8,setValue8]=useState([]);
  const [value9,setValue9]=useState([]);
  const [value10,setValue10]=useState([]);
  const [value11,setValue11]=useState([]);
  const [value12,setValue12]=useState([]);
  const [value13,setValue13]=useState([]);
  const [value14,setValue14]=useState([]);
  const [value15,setValue15]=useState([]);
  const [value16,setValue16]=useState([]);
  const [value17,setValue17]=useState([]);
  const [value18,setValue18]=useState([]);
  const [value19,setValue19]=useState([]);
  const [value20,setValue20]=useState([]);
  const [value21,setValue21]=useState([]);
  const[outputvoltA,setOuputvoltA]=useState([]);
  const[outputvoltB,setOuputvoltB]=useState([]);
  const[outputvoltC,setOuputvoltC]=useState([]);
  const[outputcurrA,setOuputcurrA]=useState([]);
  const[outputcurrB,setOuputcurrB]=useState([]);
  const[outputcurrC,setOuputcurrC]=useState([]);
  
  const [upsdata2,setUpsdata2]=useState([]);
    // const [dcInputBatteryVoltage, setDCInputBatteryVoltage] = useState("");
  
    const dataSeries = [
      [
        {
          date: "2014-04-29",
          value: 79470783,
        },
        {
          date: "2014-04-30",
          value: 80170783,
        },
      ],
      [
        {
          date: "2014-01-01",
          value: 150000000,
        },
        {
          date: "2014-01-02",
          value: 160379978,
        },
        {
          date: "2014-01-03",
          value: 170493749,
        },
        {
          date: "2014-01-04",
          value: 160785250,
        },
        {
          date: "2014-01-05",
          value: 167391904,
        },
        {
          date: "2014-01-06",
          value: 161576838,
        },
        {
          date: "2014-01-07",
          value: 161413854,
        },
        {
          date: "2014-01-08",
          value: 152177211,
        },
        {
          date: "2014-01-09",
          value: 140762210,
        },
        {
          date: "2014-01-10",
          value: 144381072,
        },
        {
          date: "2014-01-11",
          value: 154352310,
        },
        {
          date: "2014-01-12",
          value: 165531790,
        },
        {
          date: "2014-01-13",
          value: 175748881,
        },
        {
          date: "2014-01-14",
          value: 187064037,
        },
        {
          date: "2014-01-15",
          value: 197520685,
        },
        {
          date: "2014-01-16",
          value: 210176418,
        },
        {
          date: "2014-01-17",
          value: 196122924,
        },
        {
          date: "2014-01-18",
          value: 207337480,
        },
        {
          date: "2014-01-19",
          value: 200258882,
        },
        {
          date: "2014-01-20",
          value: 186829538,
        },
        {
          date: "2014-01-21",
          value: 192456897,
        },
        {
          date: "2014-01-22",
          value: 204299711,
        },
        {
          date: "2014-01-23",
          value: 192759017,
        },
        {
          date: "2014-01-24",
          value: 203596183,
        },
        {
          date: "2014-01-25",
          value: 208107346,
        },
        {
          date: "2014-01-26",
          value: 196359852,
        },
        {
          date: "2014-01-27",
          value: 192570783,
        },
        {
          date: "2014-01-28",
          value: 177967768,
        },
        {
          date: "2014-01-29",
          value: 190632803,
        },
        {
          date: "2014-01-30",
          value: 203725316,
        },
        {
          date: "2014-01-31",
          value: 218226177,
        },
        {
          date: "2014-02-01",
          value: 210698669,
        },
        {
          date: "2014-02-02",
          value: 217640656,
        },
        {
          date: "2014-02-03",
          value: 216142362,
        },
        {
          date: "2014-02-04",
          value: 201410971,
        },
        {
          date: "2014-02-05",
          value: 196704289,
        },
        {
          date: "2014-02-06",
          value: 190436945,
        },
        {
          date: "2014-02-07",
          value: 178891686,
        },
        {
          date: "2014-02-08",
          value: 171613962,
        },
        {
          date: "2014-02-09",
          value: 157579773,
        },
        {
          date: "2014-02-10",
          value: 158677098,
        },
        {
          date: "2014-02-11",
          value: 147129977,
        },
        {
          date: "2014-02-12",
          value: 151561876,
        },
        {
          date: "2014-02-13",
          value: 151627421,
        },
        {
          date: "2014-02-14",
          value: 143543872,
        },
        {
          date: "2014-02-15",
          value: 136581057,
        },
        {
          date: "2014-02-16",
          value: 135560715,
        },
        {
          date: "2014-02-17",
          value: 122625263,
        },
        {
          date: "2014-02-18",
          value: 112091484,
        },
        {
          date: "2014-02-19",
          value: 98810329,
        },
        {
          date: "2014-02-20",
          value: 99882912,
        },
        {
          date: "2014-02-21",
          value: 94943095,
        },
        {
          date: "2014-02-22",
          value: 104875743,
        },
        {
          date: "2014-02-23",
          value: 116383678,
        },
        {
          date: "2014-02-24",
          value: 125028841,
        },
        {
          date: "2014-02-25",
          value: 123967310,
        },
        {
          date: "2014-02-26",
          value: 133167029,
        },
        {
          date: "2014-02-27",
          value: 128577263,
        },
        {
          date: "2014-02-28",
          value: 115836969,
        },
        {
          date: "2014-03-01",
          value: 119264529,
        },
        {
          date: "2014-03-02",
          value: 109363374,
        },
        {
          date: "2014-03-03",
          value: 113985628,
        },
        {
          date: "2014-03-04",
          value: 114650999,
        },
        {
          date: "2014-03-05",
          value: 110866108,
        },
        {
          date: "2014-03-06",
          value: 96473454,
        },
        {
          date: "2014-03-07",
          value: 104075886,
        },
        {
          date: "2014-03-08",
          value: 103568384,
        },
        {
          date: "2014-03-09",
          value: 101534883,
        },
        {
          date: "2014-03-10",
          value: 115825447,
        },
        {
          date: "2014-03-11",
          value: 126133916,
        },
        {
          date: "2014-03-12",
          value: 116502109,
        },
        {
          date: "2014-03-13",
          value: 130169411,
        },
        {
          date: "2014-03-14",
          value: 124296886,
        },
        {
          date: "2014-03-15",
          value: 126347399,
        },
        {
          date: "2014-03-16",
          value: 131483669,
        },
        {
          date: "2014-03-17",
          value: 142811333,
        },
        {
          date: "2014-03-18",
          value: 129675396,
        },
        {
          date: "2014-03-19",
          value: 115514483,
        },
        {
          date: "2014-03-20",
          value: 117630630,
        },
        {
          date: "2014-03-21",
          value: 122340239,
        },
        {
          date: "2014-03-22",
          value: 132349091,
        },
        {
          date: "2014-03-23",
          value: 125613305,
        },
        {
          date: "2014-03-24",
          value: 135592466,
        },
        {
          date: "2014-03-25",
          value: 123408762,
        },
        {
          date: "2014-03-26",
          value: 111991454,
        },
        {
          date: "2014-03-27",
          value: 116123955,
        },
        {
          date: "2014-03-28",
          value: 112817214,
        },
        {
          date: "2014-03-29",
          value: 113029590,
        },
        {
          date: "2014-03-30",
          value: 108753398,
        },
        {
          date: "2014-03-31",
          value: 99383763,
        },
        {
          date: "2014-04-01",
          value: 100151737,
        },
        {
          date: "2014-04-02",
          value: 94985209,
        },
        {
          date: "2014-04-03",
          value: 82913669,
        },
        {
          date: "2014-04-04",
          value: 78748268,
        },
        {
          date: "2014-04-05",
          value: 63829135,
        },
        {
          date: "2014-04-06",
          value: 78694727,
        },
        {
          date: "2014-04-07",
          value: 80868994,
        },
        {
          date: "2014-04-08",
          value: 93799013,
        },
        {
          date: "2014-04-09",
          value: 99042416,
        },
        {
          date: "2014-04-10",
          value: 97298692,
        },
        {
          date: "2014-04-11",
          value: 83353499,
        },
        {
          date: "2014-04-12",
          value: 71248129,
        },
        {
          date: "2014-04-13",
          value: 75253744,
        },
        {
          date: "2014-04-14",
          value: 68976648,
        },
        {
          date: "2014-04-15",
          value: 71002284,
        },
        {
          date: "2014-04-16",
          value: 75052401,
        },
        {
          date: "2014-04-17",
          value: 83894030,
        },
        {
          date: "2014-04-18",
          value: 90236528,
        },
        {
          date: "2014-04-19",
          value: 99739114,
        },
        {
          date: "2014-04-20",
          value: 96407136,
        },
        {
          date: "2014-04-21",
          value: 108323177,
        },
        {
          date: "2014-04-22",
          value: 101578914,
        },
        {
          date: "2014-04-23",
          value: 115877608,
        },
        {
          date: "2014-04-24",
          value: 112088857,
        },
        {
          date: "2014-04-25",
          value: 112071353,
        },
        {
          date: "2014-04-26",
          value: 101790062,
        },
        {
          date: "2014-04-27",
          value: 115003761,
        },
        {
          date: "2014-04-28",
          value: 120457727,
        },
        {
          date: "2014-04-29",
          value: 118253926,
        },
        {
          date: "2014-04-30",
          value: 117956992,
        },
      ],
    ];
  
     const handleChange = (name, id) => {
      setDeviceid(id);
      setData(name);
      api.floor.UpsData(id).then((res) => {
        setUpsdata2(res);
      })
      api.floor.UpsGraphData(deviceid).then((res)=>{
        console.log("device----------",res)
        setUps1(res.graphData[0]);
      })
     
  
     }

     useEffect(() => {
     console.log("useffect calleddddddddddddddddddddddddd",deviceid)
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
  
      api.floor.devicemap(zone_id,'UPS').then((res) => {
        
        setUpsdevice(res);
        console.log("device--------",deviceid,"data----------------------",data)
        if(deviceid=='' && data==''){
          res.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);});
          setDeviceid(res[0]['ssid'])
          setData(res[0]['name'])
          api.floor.UpsData(res[0]['ssid']).then((res) => {
            res.map((ele) => {
              if(ele.param_id=='input_ph_volt_A'){
                setValue2(ele.param_value)
            } 
            if(ele.param_id=='input_ph_volt_B'){
                setValue3(ele.param_value)
            } 
            if(ele.param_id=='input_ph_volt_C'){
              setValue4(ele.param_value)
          }
          if(ele.param_id=='ph_A_Out_acti_Pow '){
            setValue5(ele.param_value)
        } 
        if(ele.param_id=='ph_B_Out_acti_Pow '){
          setValue6(ele.param_value)
        }
        if(ele.param_id=='ph_C_Out_acti_Pow'){
        setValue7(ele.param_value)
        }
        if(ele.param_id=='kW'){
        setValue8(ele.param_value)
        }
  if(ele.param_id=='output_ph_curr_A'){
    setValue9(ele.param_value)
  }
  if(ele.param_id=='output_ph_curr_B'){
    setValue10(ele.param_value)
  }if(ele.param_id=='output_ph_curr_C'){
    setValue11(ele.param_value)
  }
  if(ele.param_id=='output_ph_volt_A'){
    setValue12(ele.param_value)
  }if(ele.param_id=='output_ph_volt_B'){
    setValue13(ele.param_value)
  }
  if(ele.param_id=='output_ph_volt_C'){
    setValue14(ele.param_value)
  }
  if(ele.param_id=='out_freqphase_A'){
    setValue15(ele.param_value)
  }
  if(ele.param_id=='out_freqphase_B'){
    setValue16(ele.param_value)
  }
  if(ele.param_id=='out_freqphase_C'){
    setValue17(ele.param_value)
  }
  if(ele.param_id=='input_freq'){
    setValue18(ele.param_value)
  }
  if(ele.param_id=='vbat'){
    setValue19(ele.param_value)
  }
  if(ele.param_id=='PF'){
    setValue20(ele.param_value)
  }
  if(ele.param_id=='Runtime'){
    setValue21(ele.param_value)
  }
  setUpsdata2(res)
          })
          })
  
          api.floor.UpsGraphData(res[0]['ssid']).then((res)=>{
            console.log("res----------------",res)
            .then(res => {
              if(res.graphData.length){
                if(res.graphData[0]['output_ph_volt_A']){
                  setOuputvoltA(getMyValue(res,['graphData',0,'output_ph_volt_A']))  
              }
              if(res.graphData[0]['output_ph_volt_B']){
                setOuputvoltB(getMyValue(res,['graphData',0,'output_ph_volt_B']))  
            } 
            if(res.graphData[0]['output_ph_volt_C']){
              setOuputvoltC(getMyValue(res,['graphData',0,'output_ph_volt_C']))  
          }
          if(res.graphData[0]['output_ph_curr_A']){
            setOuputcurrA(getMyValue(res,['graphData',0,'output_ph_curr_A']))  
        }  if(res.graphData[0]['output_ph_curr_B']){
          setOuputcurrB(getMyValue(res,['graphData',0,'output_ph_curr_B']))  
      }
      if(res.graphData[0]['output_ph_curr_C']){
        setOuputcurrC(getMyValue(res,['graphData',0,'output_ph_curr_C']))  
    }
              
              }
            })
          })
        
              }else{
                api.floor.UpsData(deviceid).then((res) => {
                  console.log("upsdata",res)
                  res.map((ele) => {
                    if(ele.param_id=='input_ph_volt_A'){
                      setValue2(ele.param_value)
                  }
                  if(ele.param_id=='input_ph_volt_B'){
                    setValue3(ele.param_value)
                } 
                if(ele.param_id=='input_ph_volt_C'){
                  setValue4(ele.param_value)
              }
              if(ele.param_id=='ph_A_Out_acti_Pow '){
                setValue5(ele.param_value)
            } 
            if(ele.param_id=='ph_B_Out_acti_Pow '){
              setValue6(ele.param_value)
          }
          if(ele.param_id=='ph_C_Out_acti_Pow'){
            setValue7(ele.param_value)
        }
        if(ele.param_id=='kW'){
          setValue8(ele.param_value)
      }
      if(ele.param_id=='output_ph_curr_A'){
        setValue9(ele.param_value)
    }
    if(ele.param_id=='output_ph_curr_B'){
      setValue10(ele.param_value)
    }if(ele.param_id=='output_ph_curr_C'){
      setValue11(ele.param_value)
    }
    if(ele.param_id=='output_ph_volt_A'){
      setValue12(ele.param_value)
    }if(ele.param_id=='output_ph_volt_B'){
      setValue13(ele.param_value)
    }
    if(ele.param_id=='output_ph_volt_C'){
      setValue14(ele.param_value)
    }
    if(ele.param_id=='out_freqphase_A'){
      setValue15(ele.param_value)
    }
    if(ele.param_id=='out_freqphase_B'){
      setValue16(ele.param_value)
    }
    if(ele.param_id=='out_freqphase_C'){
      setValue17(ele.param_value)
    }
    if(ele.param_id=='input_freq'){
      setValue18(ele.param_value)
    }
    if(ele.param_id=='vbat'){
      setValue19(ele.param_value)
    }
    if(ele.param_id=='PF'){
      setValue20(ele.param_value)
    }
    if(ele.param_id=='Runtime'){
      setValue21(ele.param_value)
    }
    setUpsdata2(res)
            })
                })
                console.log("deviceid11111111111111111111111111",deviceid)
                api.floor.UpsGraphData(deviceid).then((res) => {
                  if(res.graphData.length){
                    if(res.graphData[0]['output_ph_volt_A']){
                      setOuputvoltA(getMyValue(res,['graphData',0,'output_ph_volt_A']))  
                  }
                  if(res.graphData[0]['output_ph_volt_B']){
                    setOuputvoltB(getMyValue(res,['graphData',0,'output_ph_volt_B']))  
                } 
                if(res.graphData[0]['output_ph_volt_C']){
                  setOuputvoltC(getMyValue(res,['graphData',0,'output_ph_volt_C']))  
              }
              if(res.graphData[0]['output_ph_curr_A']){
                setOuputcurrA(getMyValue(res,['graphData',0,'output_ph_curr_A']))  
            }  if(res.graphData[0]['output_ph_curr_B']){
              setOuputcurrB(getMyValue(res,['graphData',0,'output_ph_curr_B']))  
          }
          if(res.graphData[0]['output_ph_curr_C']){
            setOuputcurrC(getMyValue(res,['graphData',0,'output_ph_curr_C']))  
        }
                  
                  }
                })
             
                console.log("deviceidddd get ahulasthr",deviceid)
                // api.floor.UpsGraphData(deviceid).then((res) => {
                //   // setUps(res.graphData[0]);
                // })
                
              }
  
      })
      }, [buildingID,initialState1,deviceid]);
       
  return (
      <div className={classes.root}>
              <ThemeProvider theme={theme}>
              <Grid container spacing={1}>
                    <Grid container item xs={12} spacing={1}>
                            <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                                    <FormControl
                                        variant="filled"
                                        size="large"
                                        className={classes.formControl}
                                        style={{
                                            width: "max-content",
                                            minWidth: "100%",
                                            backgroundColor: "#eeeef5",
                                            fontFamily: "Arial"
                                        }}
                                        >
                                        <Select
                                            labelId="filled-hidden-label-small"
                                            id="demo-simple-select-outlined"
                                            label="Floor"
                                            value={data}
                                            style={{
                                            fontWeight: "bold",
                                            height: "6vh",
                                            borderRadius: '0.8vw',
                                            fontFamily: "Arial"
                                            }}
                                            disableUnderline
                                        >
                                             {upsdevice.map((_item) => (
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
              </Grid>
              <Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                        <Grid item xs={12} sm={12} md={9} lg={9} xl={9} xxl={9}>
                            <Grid container item xs={12} spacing={1} >
                                <Grid item xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                                            <Card className={classes.paper} style={{ height: "14vh", display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} style={{fontSize:'2.5rem'}}><Success>0</Success></Grid>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                    Total Alarms
                                                    </Grid>
                                                </Grid>
                                            </Card>                                       
                                         </Grid>
                                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                                             <Card className={classes.paper} style={{height:'14vh'}}>
                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                         Status
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                    <div style={{fontWeight:'bold',color: "#0123b4",fontSize: "4.5vh",whiteSpace:'nowrap'}}>Line</div>
                                                    </Grid>
                                                </Grid>
                                            </Card>  
                                        </Grid>
                                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}>
                                            <Card className={classes.paper} style={{height:'14vh'}}>
                                                <Grid container item xs={12} spacing={1} className={classes.statusFont}>
                                                  <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                        <Grid container item xs={12} spacing={1} style={{display:"flex",justifyContent: "center",alignContent: "center"}}>
                                                            <Grid
                                                                item
                                                                xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}
                                                            >   
                                                            <div className={classes.semicircularbar} style={{display: 'flex',justifyContent: 'center',marginLeft:'1vh',marginTop:'0.7vh' }}>
                                                                <SemiCircleProgressBar
                                                                    strokeWidth={20}
                                                                    stroke="#0123B4"
                                                                    diameter={110}
                                                                    percentage={50}
                                                                    showPercentValue
                                                                />
                                                                </div>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container item xs={12} spacing={1} alignItems="center" justifyContent="center">
                                                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.statusFont} style={{fontWeight:'bold',whiteSpace:'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                                Battery Charge
                                                            </Grid>
                                                        </Grid>
                                                  </Grid>
                                                  <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                    <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                        <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                            <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Battery Voltage</Grid>
                                                                <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}>{value19}V</Grid>
                                                            </Grid>       
                                                        </Grid>
                                                    </Card> 
                                                  </Grid>
                                                </Grid>
                                            </Card>  
                                        </Grid>
                                    </Grid>
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                            <Card className={`${classes.paper} ${classes.card1}`}>
                                                <Grid container item xs={12} spacing={1} alignItems='center' justifyContent='center'>
                                                    <Grid item xs={6} sm={6} md={3} lg={3} xl={3} xxl={3}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Runtime[Hrs]</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}>{value21}</Grid>
                                                             </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>   
                                                    <Grid item xs={6} sm={6} md={3} lg={3} xl={3} xxl={3}>
                                                        <Grid container item xs={12} spacing={1}>
                                                            <Grid
                                                                item
                                                                xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}
                                                            >   
                                                            <div className={classes.semicircularbar} style={{display: 'flex',justifyContent: 'center',marginLeft:'1vh'  }}>
                                                                <SemiCircleProgressBar
                                                                    strokeWidth={20}
                                                                    stroke="#0123B4"
                                                                    diameter={110}
                                                                    percentage={50}
                                                                    showPercentValue
                                                                />
                                                                </div>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid container item xs={12} spacing={1} alignItems="center" justifyContent="center">
                                                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} className={classes.statusFont} style={{fontWeight:'bold',whiteSpace:'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                                                Load
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>    
                                                    <Grid item xs={6} sm={6} md={3} lg={3} xl={3} xxl={3}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center' >                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Power Factor[kVA]</Grid>                                                                <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}>{value20}</Grid>
                                                               </Grid>       
                                                            </Grid>
                                                        </Card>     
                                                    </Grid>    
                                                    <Grid item xs={6} sm={6} md={3} lg={3} xl={3} xxl={3}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Temperature</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}>19°C</Grid>                                                              
                                                                 </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>
                                                </Grid>     
                                            </Card>  
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4} spacing={1}>
                                         <Card className={classes.paper} style={{height:'29vh'}}>
                                            <Grid container item xs={12} spacing={2}>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Input Voltage L1</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}  style={{display: 'flex', justifyContent: 'center'}}>{value2}V</Grid>                                                            
                                                                </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Input Voltage L2</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}  style={{display: 'flex', justifyContent: 'center'}}>{value3}V</Grid>
                                                                </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Input Voltage L3</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms} style={{display: 'flex', justifyContent: 'center'}}>{value4}V</Grid>
                                                                </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>
                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6}>
                                                        <Card style={{ boxShadow: "inset 0px 0px 0px 2px rgb(76 175 80)",backgroundColor:"#fcfafa","border-radius": "10px", height: "11.5vh" }}>
                                                            <Grid container item xs={12} direction='column' style={{"justify-content": "center","align-content": "center", whiteSpace: "nowrap"}}>
                                                                <Grid container item xs={12} spacing={1} direction='column' alignItems='center'>                                     
                                                                    <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}> </Grid>
                                                                    <Grid item xs={6} sm={6} md={6} lg={6} xl={6} xxl={6} className={classes.statusFont} style={{display: 'flex', justifyContent: 'center'}}>Input Frequency</Grid>
                                                                    <Grid item xs={5} sm={5} md={5} lg={5} xl={5} xxl={5} className={classes.alarms}  style={{display: 'flex', justifyContent: 'center'}}>{value18}Hz</Grid>
                                                                </Grid>       
                                                            </Grid>
                                                        </Card> 
                                                    </Grid>
                                                </Grid>
                                        </Card>  
                                </Grid>
                            </Grid>
                            <Grid container item xs={12} spacing={1}>
                            <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>
                                <Card className={classes.paper} style={{height:'49vh'}}>
                                <img
                                className={classes.image}
                                src={Ups}
                                alt="UPS"
                                style={{
                                  width: "40vh",
                                  height: "40vh",
                                  marginTop:"4vh",
                                  opacity:"2"
                                }}
                              /></Card>  
                            </Grid>
                            <Grid item xs={12} sm={12} md={8} lg={8} xl={8} xxl={8}>
                                <Card className={`${classes.statusFont} ${classes.paper}`} style={{height:'49vh'}} > 
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}>UPS Output</Grid>
                                        <Grid item xs={10} sm={10} md={10} lg={10} xl={10} xxl={10}></Grid>
                                    </Grid>
                                    <Grid container item xs={12} spacing={1} justifyContent="flex-end" style={{marginTop:'-1vh'}}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3}></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Load[%]</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Voltage[V]</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Current[A]</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Frequency[Hz]</Grid>      
                                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}></Grid>      
                                    </Grid>
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Phase-1</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}>
                                          <Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
                                                                <div className={classes.semicircularbarFont} style={{display: 'flex',justifyContent: 'center',marginLeft:'0.5vh',marginTop:'-1vh' }}>
                                                                <SemiCircleProgressBar
                                                                    strokeWidth={15}
                                                                    stroke="#0123B4"
                                                                    diameter={75}
                                                                    percentage={50}
                                                                    showPercentValue
                                                                />
                                                                </div>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value12}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value9}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value15}Hz</Card></Grid>      
                                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}></Grid>  
                                    </Grid>
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Phase-2</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}>
                                            <Card className={classes.paper}  style={{height:'12vh'}}>
                                            <div className={classes.semicircularbarFont} style={{display: 'flex',justifyContent: 'center',marginLeft:'0.5vh',marginTop:'2vh' }}>
                                                                <SemiCircleProgressBar
                                                                    strokeWidth={15}
                                                                    stroke="#0123B4"
                                                                    diameter={75}
                                                                    percentage={50}
                                                                    showPercentValue
                                                                />
                                                                </div>
                                            </Card>
                                            </Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value13}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value10}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value16}Hz</Card></Grid>      
                                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}></Grid>  
                                    </Grid>
                                    <Grid container item xs={12} spacing={1}>
                                        <Grid item xs={3} sm={3} md={3} lg={3} xl={3} xxl={3} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Phase-3</Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}>
                                            <Card className={classes.paper}  style={{height:'12vh'}}>
                                            <div className={classes.semicircularbarFont} style={{display: 'flex',justifyContent: 'center',marginLeft:'0.5vh',marginTop:'2vh' }}>
                                                                <SemiCircleProgressBar
                                                                    strokeWidth={15}
                                                                    stroke="#0123B4"
                                                                    diameter={75}
                                                                    percentage={50}
                                                                    showPercentValue
                                                                />
                                                                </div>
                                            </Card>
                                            </Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value14}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value11}</Card></Grid>
                                        <Grid item xs={2} sm={2} md={2} lg={2} xl={2} xxl={2}><Card className={`${classes.alarms} ${classes.paper}`}  style={{height:'12vh',display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>{value17}Hz</Card></Grid>      
                                        <Grid item xs={1} sm={1} md={1} lg={1} xl={1} xxl={1}></Grid>  
                                    </Grid>
                                </Card>
                            </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                            <Grid container item xs={12} spacing={1} direction='column'>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <Card className={classes.paper} style={{height:'25vh'}}>
                                    <Grid container item xs={12} spacing={1}>
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{color:"black",fontWeight:"bold",display:'flex',justifyContent:'center',alignItems:'center'}}>
                                        Load
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TimeSeriesUpsStatic
                                        data={dataSeries}
                                        style={{ width: "100%", height: "100%" }}
                                        ></TimeSeriesUpsStatic>
                                    </Grid>
                                    </Grid>
                                </Card>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <Card className={classes.paper} style={{height:'25vh'}}>
                                    <Grid container item xs={12} spacing={1}>
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{color:"black",fontWeight:"bold",display:'flex',justifyContent:'center',alignItems:'center'}}>
                                    Output Voltage
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TimeSeries1 data={outputvoltA} data2={outputvoltB} data3={outputvoltC} text='Output Voltage'/>
                                    </Grid>
                                    </Grid>
                                </Card>
                                </Grid>
                                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <Card className={classes.paper} style={{height:'25vh'}}>
                                    <Grid container item xs={12} spacing={1}>
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12} style={{color:"black",fontWeight:"bold",display:'flex',justifyContent:'center',alignItems:'center'}}>
                                    Output Current
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TimeSeries1 data={outputcurrA} data2={outputcurrB} data3={outputcurrC} text='Output Current'/>
                                    </Grid>
                                    </Grid>
                                </Card>
                                </Grid>
                            </Grid>
                        </Grid>
                </Grid>
              </Grid>
              </ThemeProvider>    
      </div>
  );
}
