// import React, { useEffect } from 'react';
// //import { navigate } from '@reach/router';
// import Card from "components/Card/Card.js";
// import CardHeader from "components/Card/CardHeader.js";
// import CardFooter from "components/Card/CardFooter.js";
// import { makeStyles } from '@material-ui/core/styles';
// import ButtonBase from '@material-ui/core/ButtonBase';
// // @material-ui/icons
// import api from "../../api";
// import GridItem from 'components/Grid/GridItem';
// import Grid from '@material-ui/core/Grid';
// import GridContainer from 'components/Grid/GridContainer';
// import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
// import { IndeterminateCheckBoxSharp, LocalOffer, Warning } from '@material-ui/icons';
// import Info from 'components/Typography/Info';
// import CardBody from 'components/Card/CardBody';
// import { useSelector } from 'react-redux';
// import Danger from "components/Typography/Danger";
// import  CardContent from '@material-ui/core/CardContent';

// const useStyles = makeStyles(styles);


// function Zonelist(props) {
//     const classes = useStyles();
//     const [ zones, setZones ] = React.useState([])
//     const buildingID = useSelector(state => state.isLogged.data.zones[0])
//     const [data, setData] = React.useState([{name: "", value: 0}, {name: "", value: 0}, {name: "", value: 0}]);
//     const [clicked,setCliked] = React.useState(false);

//     useEffect(() => {
//         // api.dashboard.getMetricData(buildingID).then(res => {
//         //     console.log(res)
//         //     setData(res);
//         //   })
//         console.log("i am in list of zone======")
//         api.zones.zoneList(localStorage.getItem("floorID")).then(res => {
//             console.log("......",res)
//             setZones(res[0].children)
//         })
    
//     }, [])
//     const handleClick=(id,name)=>{
//        console.log("id======",id)
//        console.log("nammmm",name)
//         props.changeContext("zone")
//         localStorage.setItem("context","zone");
//         localStorage.setItem("zoneID",id);
//         localStorage.setItem("zoneName", name);
//         props.history.push(`/admin/areas`)
//         // setTimeout(() => {
//         //     console.log("=============================================================")
           
//         //     props.history.push(`/admin/floors`)
//         // }, 5000);
//         // setCliked(true)
//           // return <Heatmap type={param}/>
//       // return <Home/>
//       // props.history.push(`/admin/floor/d4053866-e855-4dcc-a87a-77632dd054b9/heatmap`)
//     //   props.history.push({
//     //     pathname: '/admin/floor/d4053866-e855-4dcc-a87a-77632dd054b9/heatmap',
//     //     // search: '?query=abc',
//     //     state: { detail: param }
//     // });
//   }

//   return (
//     <div>
//     <Grid container direction='column'align-items="center">
//     {zones.map((_item,i)=>
//     <div>
//       <Grid container spacing={7}>
//       <Grid key={i} item xs={7}>
//       <ButtonBase style={{width:'100%'}} onClick={() => handleClick(_item.uuid, _item.name)} className={classes.cardAction}>
//         <Card key={_item.uuid} style={{flexDirection:'row'} }>
      
//           <h2>{_item.name}</h2>
//        {/* {data.map((_data,i)=>
//          <Grid item xs={12} lg={6}>
//            <Card style={{flexDirection:'row'}}>
//            <div>
//         {handleContent(_data.name, _data.value)}
                
             
//            </div>  
//            </Card>
           
//          </Grid>
//        )} */}
//         </Card>
//         </ButtonBase>
//       </Grid>
//       </Grid>
      
//        </div>
//     )}
//     </Grid>
   
//   </div>
//   )
// }

// export default Zonelist



