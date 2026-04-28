import React, { useState, useEffect } from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import {Icon, Avatar, Card, CardHeader, CardContent, CardMedia, Typography, Button} from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardFooter from "components/Card/CardFooter.js";
import api from "../../api"
import ReactSpeedometer from "react-d3-speedometer"
import CardBody from "components/Card/CardBody.js";
import { cardTitle } from "assets/jss/material-dashboard-react.js";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import { successColor, dangerColor } from "assets/jss/material-dashboard-react";
import CardIcon from "components/Card/CardIcon";
import Danger from "components/Typography/Danger";
import CardAvatar from "components/Card/CardAvatar";

import temperatureAvatar from "assets/img/dashboard-icons/temperature.png";
import humidityAvatar from "assets/img/dashboard-icons/humidity.png";
import luminescenseAvatar from "assets/img/dashboard-icons/lux.png";
import noiseAvatar from "assets/img/dashboard-icons/noise.png";
import energyAvatar from "assets/img/dashboard-icons/energy.png";
import co2 from "assets/img/dashboard-icons/co2.png";
import tvoc from "assets/img/dashboard-icons/tvoc.png";
import pm25 from "assets/img/dashboard-icons/pm25.png";
import pm10 from "assets/img/dashboard-icons/pm10.png";
import Success from "components/Typography/Success";
import Warning from "components/Typography/Warning";

const useStyles = makeStyles(styles);
const useStyles1 = makeStyles((theme) =>({
  cardstyle:{
    height: "100%"
    // position:'fixed',
    // justifyContent:'space-between',
    // textAlign:'left',
    // display:'flex',
    // flex:1,
    // // height:210,
    // // width:153,
    // // marginTop:-357,
    // // position:'relative',
    // [theme.breakpoints.down('xs')]:
    //     {justify:'center',alignItems:'center'},
    // [theme.breakpoints.down('sm')]:
    //     {justify:'center',alignItems:'center'},
    // [theme.breakpoints.up('md')]:
    //     { height:210,width:153,marginTop:-30,position:'relative'},
    // [theme.breakpoints.up('lg')]:
    //     { height:210,width:153,marginTop:-30,justifyContent:'flex-end',position:'relative'}
    //     // {justifyContent:'flex-end',position:'relative'}
  },
  root:{
    [theme.breakpoints.up('lg')]:
        {justifyContent:'flex-end',flex:'1' },
    [theme.breakpoints.up('md')]:
        {justifyContent:'flex-end',flex:'1' },
    [theme.breakpoints.down('xs')]:
        {justifyContent:'center'},        
    [theme.breakpoints.down('sm')]:
        {justifyContent:'center'}     
  }
}));


export default function NewGauges(props) {
    const classes = useStyles();
    const classes1 = useStyles1();
    const [context, setContext] = useState(props.context);
    const [occupancyType, setOccupancyType] = useState("")
    const [selectedType, setSelectedType] = useState("")
    const [componentType, setComponenetType] = useState("")
    const [closeFlag, setCloseFlag] = useState({})
    const [data, setData] = useState([{name: "", value: 0}, {name: "", value: 0}, {name: "", value: 0}]);
    const { selectedParam } = props;

    useEffect(() => {
      api.dashboard.getMetricData("e3e44f87-b113-400b-ba4a-a5e1068340a8").then(res => {
        setData(res);
      })
    }, [props.context]);
    
    const handleContent = (param, value) => {
        switch (param) {
            case "TEMPERATURE":
                if(Math.round(value * 10)/10 > 23)
                    return <Danger hbFontStyle>HOT</Danger>
                else if (Math.round(value * 10)/10 < 20) 
                    return <Warning hbFontStyle>COLD</Warning>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "HUMIDITY":
                if(Math.round(value * 10)/10 > 50)
                    return <Danger hbFontStyle>MOIST</Danger>
                else if(Math.round(value * 10)/10 < 30)
                    return <Warning hbFontStyle>DRY</Warning>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "LUMINESCENSE":
                if(Math.round(value * 10)/10 > 1000)
                    return <Danger hbFontStyle>BRIGHT</Danger>
                else if(Math.round(value * 10)/10 < 350)
                    return <Danger hbFontStyle>DARK</Danger>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "NOISE":
                if(Math.round(value * 10)/10 > 30) 
                    return <Danger hbFontStyle>HIGH</Danger>
                else if(Math.round(value * 10)/10 < 5)
                    return <Success hbFontStyle>GOOD</Success>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "CO2":
                if(Math.round(value * 10)/10 > 800)
                    return <Danger hbFontStyle>POOR</Danger>
                else if(Math.round(value * 10)/10 < 0)
                    return <Success hbFontStyle>GOOD</Success>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "PM2.5":
                if(Math.round(value * 10)/10 > 35)
                    return <Danger hbFontStyle>POOR</Danger>
                else if(Math.round(value * 10)/10 < 0)
                    return <Success hbFontStyle>GOOD</Success>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "PM10":
                if(Math.round(value * 10)/10 > 35)
                    return <Danger hbFontStyle>POOR</Danger>
                else if(Math.round(value * 10)/10 < 0)
                    return <Success hbFontStyle>GOOD</Success>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            case "TVOC":
                if(Math.round(value * 10)/10 > 900)
                    return <Danger hbFontStyle>POOR</Danger>
                else if(Math.round(value * 10)/10 < 30)
                    return <Success hbFontStyle>GOOD</Success>
                else
                    return <Success hbFontStyle>NORMAL</Success>
            default:
                break;
        }
    }

    const displayNormalValues = (param) => {
        switch (param) {
            case "TEMPERATURE":
                return <h5>Normal : 20&deg;C - 23&deg;C</h5>
            case "HUMIDITY":
                return <h5>Normal : 30% - 50%</h5>
            case "LUMINESCENSE":
                return <h5>Normal: 350LX - 1000LX</h5>
            case "NOISE":
                return <h5>Normal : 0dB - 100dB</h5>
            case "CO2":
                return <h5>Normal: 0ppm - 800ppm</h5>
            case "TVOC":
                return <h5>Normal: 30ppb - 900ppb</h5>
            case "PM2.5":
                return <h5>Normal: 0μg/m<sup>3</sup> - 35μg/m<sup>3</sup></h5>
            case "PM10":
                return <h5>Normal: 0μg/m<sup>3</sup> - 35μg/m<sup>3</sup></h5>
            default:
                break;
        }
    }

    const showAllMetrics = () => {
        setCloseFlag({})
    }

    return(
        <div>
            <Button variant="contained" onClick={showAllMetrics}>Show all Metrics</Button>
            <GridContainer justify="center" alignItems="center">
                {data.map(_data => 
                    (!closeFlag[_data.name.toLocaleLowerCase()] &&
                        <GridItem xs={8} sm={6} md={3} lg={3} xl={2}>
                        <Card className={classes.root}>
                            <CardHeader
                                avatar={
                                <Avatar aria-label="recipe">
                                    {_data.name[0]}
                                </Avatar>
                                }
                                action={
                                <IconButton aria-label="close" onClick={() => setCloseFlag({...closeFlag, [_data.name.toLocaleLowerCase()]: true})}>
                                    <CloseIcon />
                                </IconButton>
                                }
                                title={_data.name}
                            />
                            <CardContent>
                                {handleContent(_data.name, _data.value)}
                                {displayNormalValues(_data.name)}
                            </CardContent>
                            </Card>
                        </GridItem>
                    )
                )}
            </GridContainer> 
        </div>
        )
}
