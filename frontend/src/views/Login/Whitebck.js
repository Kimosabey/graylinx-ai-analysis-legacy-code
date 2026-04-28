import React from 'react'
import Login from './Login'
import Bluebck from './Bluebck'
import {makeStyles} from '@material-ui/core/styles';
import {Grid} from "@material-ui/core";

const useStyles = makeStyles((theme) =>({
    root: {
        flexGrow: 1,
      },
    splitScreen: {
        display: 'flex',
        flexDirection: 'row',
        width:'100%'
    },
    topPane: {
        width: '50%',
        backgroundColor:'#0123B4'
    },
    bottomPane: {
        width: '50%',
        backgroundColor:'#ffffff' 
    },
}));

function Whitebck() {
    const styles= useStyles();

  return (
    // <div className={styles.splitScreen} style={{height:'100vh'}}>
    //     <div className={styles.topPane}  ><Bluebck /></div> 
    //     <div className={styles.bottomPane} ><Login /></div> 
    // </div>
    <div className={styles.root}>
        <Grid container style={{ height: '100vh' }}>
                <Grid container item xs={12} style={{ height: '100%' }}>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6}><Bluebck /></Grid>
                        <Grid item xs={12} sm={12} md={6} lg={6} xl={6} xxl={6} style={{backgroundColor:'#ffffff',maxHeight:'100%'}}><Login /></Grid>
                </Grid>
        </Grid>
    </div>
  )
}

export default Whitebck