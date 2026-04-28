import React from 'react'
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Setting from "../../assets/img/Setting";
import Control from "../../assets/img/Control";
import GridItem from 'components/Grid/GridItem';
import GridContainer from 'components/Grid/GridContainer';
import Zones from './zones';


// const useStyles1 = makeStyles((theme) =>({
//     cardstyle:{
//       //height: "100%"
//       // position:'fixed',
//       // justifyContent:'space-between',
//       // textAlign:'left',
//       // display:'flex',
//       // flex:1,
//       // // height:210,
//       // // width:153,
//       // // marginTop:-357,
//       // // position:'relative',
//       // [theme.breakpoints.down('xs')]:
//       //     {justify:'center',alignItems:'center'},
//       // [theme.breakpoints.down('sm')]:
//       //     {justify:'center',alignItems:'center'},
//       // [theme.breakpoints.up('md')]:
//       //     { height:210,width:153,marginTop:-30,position:'relative'},
//       // [theme.breakpoints.up('lg')]:
//       //     { height:210,width:153,marginTop:-30,justifyContent:'flex-end',position:'relative'}
//       //     // {justifyContent:'flex-end',position:'relative'}
//     },
//     headerColor:{
//         color:'#000000'
//     },
//     root:{
//       [theme.breakpoints.up('lg')]:
//           {justifyContent:'flex-end',flex:'1' },
//       [theme.breakpoints.up('md')]:
//           {justifyContent:'flex-end',flex:'1' },
//       [theme.breakpoints.down('xs')]:
//           {justifyContent:'center'},        
//       [theme.breakpoints.down('sm')]:
//           {justifyContent:'center'}     
//     }
//   }));

function Zonesmain(props) {
    // const classes=useStyles1()
  return (
    <div>
         <CustomTabs
      title="Ahu"
      //className={classes.headerColor} 
      headerColor="blue"
     defaultVal={0}
      tabs={[
          {
              tabName: "PARAMETER",
               tabIcon: Setting,
              tabContent :(  
              <GridContainer justify="center" alignItems="center" direction="cloumn">
              <GridItem xs={12} sm={12} md={12} lg={12} xl={12}> 
              <Zones param={'parameter'} changeContext={props.changeContext} history={props.history} />
              </GridItem>
        </GridContainer>)
            
          },
          // {
          //     tabName: "DEVICES",
          //      tabIcon: Control,
          //      tabContent : (  
          //       <GridContainer justify="center" alignItems="center" direction="cloumn">
          //       <GridItem xs={12} sm={12} md={6} lg={12} xl={12}> 
          //       <Zones param={'device'} changeContext={props.changeContext} history={props.history} />
          //       </GridItem>
          // </GridContainer>)
             
          // },
          {
            tabName: "DEVICES",
             tabIcon: Control,
             tabContent : (  
              <GridContainer justify="center" alignItems="center" direction="cloumn">
              <GridItem xs={12} sm={12} md={6} lg={12} xl={12}> 
              <Zones param={'devicemap'} changeContext={props.changeContext} history={props.history} />
              </GridItem>
        </GridContainer>)
           
        }
         
      ]}
  />

    </div>
  )
}

export default Zonesmain