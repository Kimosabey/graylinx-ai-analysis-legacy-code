import React from 'react'
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import {makeStyles} from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import LoginImage from '../../assets/img/Login.png';
import {Grid} from "@material-ui/core";

const useStyles = makeStyles((theme) =>({
    input: {
        textAlign:"center",
        fontWeight: "bold",
        marginBottom: "20px",
        width: "90%",
        marginLeft: "10px"
    },
    text:{
        fontFamily: "BwSeidoRound-Regular",
        fontSize:"5vw",
        color:'#ffffff'
    },
    logo: {
        padding:"10px",
        marginLeft: "auto",
        marginRight: "auto",
        height: "75px",
        width: "200px",
        textAlign: "center",
        display: "table-cell",
        verticalAlign: "middle"
    },
    paper: {
        marginTop: "30px",
        width: "30%",
        marginLeft: "7%",
        flexDirection: 'column',
        alignItems: 'center'
    },
    submit: {
        width: "90%",
        margin: "20px 16px 44px",
        borderRadius: "20px",
        backgroundColor: "#266275",
        color: "white",
        "&,&:focus,&:hover,&:visited":{
            backgroundColor: "#266275",   
        }
    },
    overlay: {
        position: "fixed",
        opacity: "0.8",
        width: "50%",
        height: "100%",
        left: 10,
        top: 0,
        zIndex: 10,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      },
    bac:{
        background:'#0012B4'
    },
    image:{
        width:'100%',
        height:'100vh'
      },

}));

function Bluebck() {
    const classes=useStyles();
  return (
    // <GridContainer>
    // <GridItem xs={12} sm={12} md={10} lg={10} xl={12}>
    // <div className={classes.paper}>   
    // <img src={LoginImage} alt="Image" style={{marginLeft:"-38px",marginTop:"-30px",height:"770px",width:"682px"}}></img>
    // {/* <Typography className={classes.text}> 
    //         TECHNOLOGY ENHANCING LIVES 
    // </Typography> */}
    // </div>
    // </GridItem>
    // </GridContainer>
    <Grid container item xs={12}>
        <Grid item  xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <img src={LoginImage} alt="Image" className={`${classes.image}`}/>
        </Grid>
    </Grid>
  )
}

export default Bluebck