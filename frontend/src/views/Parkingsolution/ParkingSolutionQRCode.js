import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Card, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, IconButton } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import DirectionsCarSharpIcon from '@material-ui/icons/DirectionsCarSharp';
import api from '../../api';
import floormap from "../../assets/img/Parking_solution.jpeg";
import green_car from "../../assets/img/green_car.png";
import red_car from "../../assets/img/red_car.png";
import grey_car from "../../assets/img/grey_car.png";
import { Map, TileLayer, ImageOverlay, Marker, Popup, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import { green } from '@material-ui/core/colors';
import FaultTrendAndHistogram from './ParkingGraph';
import graylinxlogo from "../../assets/img/graylinxlogo2.png";

const Leaflet = require("leaflet");

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '300%',
  },
  root: {
    flexGrow: 1,
    marginTop:'2vh',
    padding: 0,
    width: "100%",
    marginLeft:'1vh'
  },
  selector: {
    overflow: 'hidden',
    width: "100%",
  },
  paper: {
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '0px 8px 40px #0123B433;',
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
    borderRadius: '12px',
    opacity: '1',
  },
  smallbuttons: {
    width: '8.0vh',
    height: '7.3vh',
    backgroundColor: "#D3D3D3",
    border: "none",
    cursor: "pointer",
    borderRadius: "0.6vw",
    margin: '0.5%',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2vh',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '1.5rem',
  },
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '20%',
    marginRight: '0.5rem',
  },
  legendText: {
    marginLeft: '0.5rem',
    fontWeight: 'bold',
    color: '#000',
  },
}));

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: '#0123B4',
    color: theme.palette.common.white,
    fontSize: '12px',
    fontWeight: 'bold',
    padding: '15px',
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);


function Parkingsolution(props) {
  const classes = useStyles();
  const mapRef = React.createRef();
  const [today, setDate] = React.useState(new Date());
  const locale = 'en';
  const [floorId, setFloorId] = useState('');
  const [floorName, setFloorName] = useState('');
  const [LatestData, setLatestData] = useState([]);
  const [getParkingStatus, setgetParkingStatus] = useState([]);
  const [getDailyData, setDailyData] = useState([]);
  const [fdata, setFdata] = useState('eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20');
  const greenCarIcon = new Leaflet.Icon({
    iconUrl: green_car,
    iconSize: new Leaflet.Point(13, 15),
    className: "leaflet-div-icon-2",
  });
  const redCarIcon = new Leaflet.Icon({
    iconUrl:red_car,
    iconSize: new Leaflet.Point(13, 15),
    className: "leaflet-div-icon-2",
  });
  const greyCarIcon = new Leaflet.Icon({
    iconUrl: grey_car,
    iconSize: new Leaflet.Point(13, 15),
    className: "leaflet-div-icon-2",
  });
  const handleClickNext = (floor) => {
    setFloorId(floor.floor_id);
    setFloorName(floor.floor_name);
  };

  const getColor = (status) => {
    if (status === 'Available') {
      return '#2ECC71';
    } else if (status === 'Occupied') {
      return '#FF0B14';
    }
    else if (status === 'No Data') {
      return '#839192';
    }
    return 'grey';
  };

  useEffect(() => {
    api.parkingSolution.parkingStatusslots(fdata)
      .then((response) => {
        if (response) {
          setgetParkingStatus(response); // Assuming response is an array of floor data
          response.floorStats.slice().reverse().map((floor) => {
            setFloorId(floor.floor_id);
            setFloorName(floor.floor_name);
          });
        }
      }).catch((err) => {
        console.error(err);
      });
    const timer1 = setInterval(() => {
      api.parkingSolution.parkingStatusslots(fdata)
        .then((response) => {
          if (response) {
            setgetParkingStatus(response);
            response.floorStats.slice().reverse().map((floor) => {
              setFloorId(floor.floor_id);
              setFloorName(floor.floor_name);
            });
          }
        }).catch((err) => {
          console.error(err);
        });
    }, 3000);
    return () => {
      clearInterval(timer1)
    }
  }, []);

  const legendItems = [
    { status: "Occupied", color: getColor("Occupied") },
    { status: "No Data", color: getColor("No Data") },
    { status: "Available", color: getColor("Available") },
  ];

  const day = today.toLocaleDateString(locale, { weekday: 'short' });
  const date = `${day}, ${today.getDate()} ${today.toLocaleDateString(locale, { month: 'short' })}\n\n`;
let currentDate = new Date();
// const time = currentDate.getHours() + ":" + currentDate.getMinutes();
const time = currentDate.toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});
  return (
    <div className={classes.root}>
      <Grid container xs={12} spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <Card className={classes.paper} style={{ height: '93vh' }}>
              <div style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
                  <Grid container item xs={12} spacing={1}>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}></Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                      <img className={classes.logo} src={graylinxlogo} style={{height:'6vh'}} alt="Logo" />
                    </Grid>
                    <Grid item xs={4} sm={4} md={4} lg={4} xl={4} xxl={4}>
                          <div style={{display:'flex',justifyContent:'right',color:'black'}}>
                            {time} {date}
                          </div>
                    </Grid>
                  </Grid>
                  <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    {/* <Typography style={{ fontWeight: 'bold', fontSize: '2.5vh', color: 'black', marginTop: '0vh' }}>Parking Availability Status</Typography>
                    <Typography variant="h6" style={{ fontWeight: 'bold', fontSize: '2.5vh', color: '#0123b4', marginTop: '0vh' }}>{floorName=='Floor-01'?'Basement-2':''}</Typography> */}
                  </Grid>
                  </Grid>
                <Map
                  ref={mapRef}
                  attributionControl={false}
                  doubleClickZoom={false}
                  ZoomControl={false}
                  dragging={true}
                  scrollWheelZoom={false}
                  // className={"floor-map"}
                  crs={Leaflet.CRS.Simple}
                  center={[0, 0]}
                  maxZoom={1}
                  // bounds={[[0, 0], [950, 800]]}
                  bounds={[[0, 0], [414, 843]]}
                  className={classes.bounds}
                  style={{
                    width: "max-content",
                    minWidth: "100%",
                    height: "67vh",
                    backgroundColor: "white",
                  }}
                  onClick={(e) => { console.log({ x: e.latlng.lat, y: e.latlng.lng }); }}
                >
                  <ImageOverlay
                    interactive
                    url={floormap}
                    bounds={[[-10, 145], [410, 700]]}
                  />
                  {(getParkingStatus && floorId && getParkingStatus.transformedResponse) ? (
                    getParkingStatus.transformedResponse
                      .filter(res => res.floor_id === floorId)
                      .sort((a, b) => parseInt(a.slot_no) - parseInt(b.slot_no))
                      .map((res) => (
                        (res.floor_id === floorId) &&
                        <Marker position={JSON.parse(res.coordinates)} icon={res.vehicle_occupancy == "0" ? greenCarIcon : res.vehicle_occupancy == "1" ? redCarIcon : greyCarIcon}></Marker>
                      ))
                  ) : ""}
                </Map>
                <Box className={classes.legendContainer}>
                  {legendItems.map((item, index) => (
                    <div key={index} className={classes.legendItem}>
                      <div className={classes.legendColor} style={{ backgroundColor: item.color }}></div>
                      <Typography variant="body2" className={classes.legendText}>
                        {item.status}
                      </Typography>
                    </div>
                  ))}
                </Box>
              </div>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
export default withRouter(Parkingsolution);
