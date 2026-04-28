// import React, { useEffect } from 'react'
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
// import Heatmap from "views/Heatmap/HeatmapComponent"
// import  CardContent from '@material-ui/core/CardContent';

// const useStyles = makeStyles(styles);

// function Arealist(props) {
//     const classes = useStyles();
//     const [ areas, setAreas ] = React.useState([])
//     const buildingID = useSelector(state => state.isLogged.data.zones[0])
//     const [data, setData] = React.useState([{name: "", value: 0}, {name: "", value: 0}, {name: "", value: 0}]);
//     const [clicked,setCliked] = React.useState(false);
//     useEffect(() => {
        
//         api.zones.zoneList(localStorage.getItem("zoneID")).then(res => {
//             setAreas(res[0].children)
//         })
    
//     }, [])

//     const handleClick=(id,name)=>{
//          props.changeContext("area")
//          localStorage.setItem("context","area");
//          localStorage.setItem("areaID",id);
//          localStorage.setItem("areaName", name);
//          props.history.push(`/admin/areadetail`)
//    }
    
//   return (
//     <div>
//          <Grid container direction='column'align-items="center">
//         {areas.map((_item,i)=>
//         <div>
//           <Grid container spacing={7}>
//           <Grid key={i}  item xs={7}>
//           <ButtonBase style={{width:'100%'}} onClick={() => handleClick(_item.uuid, _item.name)} className={classes.cardAction}>
//             <Card key={_item.uuid} style={{flexDirection:'row'} }>
//               <h2 >{_item.name}</h2>
//             </Card>
//             </ButtonBase>
//           </Grid>
//           </Grid>
          
//            </div>
//         )}
//         </Grid>
//     </div>
//   )
// }

// export default Arealist