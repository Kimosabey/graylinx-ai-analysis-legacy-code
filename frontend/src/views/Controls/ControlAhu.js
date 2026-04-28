import React from 'react'
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Setting from "../../assets/img/Setting";
import Control from "../../assets/img/Control";
import GridItem from 'components/Grid/GridItem';
import Grid from '@material-ui/core/Grid';
import GridContainer from 'components/Grid/GridContainer';
import Hvac from '../Heatmap/hvac_old'
import Table from '../Dashboard/table'
import Config from '../Heatmap/ConfigureSetpoint'
import { makeStyles } from "@material-ui/core/styles";



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
    headerColor:{
        color:'#0123B4'
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

function ControlAhu(props) {
    const classes1 = useStyles1();
  return (
    <div>
         <CustomTabs
      title="Ahu"
      headerColor="blue"
    //  defaultVal={history.location.pathname.includes("/0") ? 0 : 1}
      tabs={[
          {
              tabName: "Monitor AHU",
               tabIcon: Setting,
              tabContent :(  
              <GridContainer justify="center" alignItems="center" direction="cloumn">
          
              <GridItem xs={12} sm={12} md={12} lg={12} xl={12}> 
               {/* <Hvac /> */}
              </GridItem>
              <GridItem xs={12} sm={12} md={12} lg={12} xl={12}> 
             {/* <Table /> */}
              </GridItem>
            
          
        </GridContainer>)
            
          },
          {
              tabName: "Control AHU",
               tabIcon: Control,
               tabContent : (  
                <GridContainer justify="center" alignItems="center" direction="cloumn">
            
                <GridItem xs={12} sm={12} md={6} lg={12} xl={12}> 
                    {/* <Config /> */}
              
                </GridItem>
              
            
          </GridContainer>)
             
          },
         
      ]}
  />

    </div>
  )
}

export default ControlAhu