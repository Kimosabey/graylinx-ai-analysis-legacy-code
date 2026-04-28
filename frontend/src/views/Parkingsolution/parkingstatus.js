import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Grid, Typography, Card, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, IconButton } from '@material-ui/core';
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import DirectionsCarSharpIcon from '@material-ui/icons/DirectionsCarSharp';
import api from '../../api';
import floormap from "../../assets/img/Parking_solution.jpeg";
import { Map, TileLayer, ImageOverlay, Marker, Popup, Polygon, Tooltip, ZoomControl } from 'react-leaflet';
import { green } from '@material-ui/core/colors';
import FaultTrendAndHistogram from './ParkingGraph';
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
    margin: 0,
    padding: 0,
    width: "100%",
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
  const mapRef = React.createRef()
  const [floorId, setFloorId] = useState('');
  const [floorName, setFloorName] = useState('');
  const [LatestData, setLatestData] = useState([]);
  const [getParkingStatus, setgetParkingStatus] = useState([]);
  const [getDailyData, setDailyData] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem("floorID"));
  const greenCarIcon = new Leaflet.Icon({
    iconUrl: require("../../assets/img/green_car.png"),
    iconSize: new Leaflet.Point(13, 18),
    className: "leaflet-div-icon-2",
  });
  const redCarIcon = new Leaflet.Icon({
    iconUrl: require("../../assets/img/red_car.png"),
    iconSize: new Leaflet.Point(13, 18),
    className: "leaflet-div-icon-2",
  });
  const greyCarIcon = new Leaflet.Icon({
    iconUrl: require("../../assets/img/grey_car.png"),
    iconSize: new Leaflet.Point(13, 18),
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
    api.parkingSolution.LatestparkingGraph()
      .then((response) => {
        if (response) {
          setLatestData(response)
        }
      }).catch((err) => {
        console.error(err);
      });
      api.parkingSolution.TrendParkingGraph()
      .then((response) => {
        if (response) {
          setDailyData(response)
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
    const timer2 = setInterval(() => {
      api.parkingSolution.LatestparkingGraph()
        .then((response) => {
          if (response) {
            setLatestData(response)
          }
        }).catch((err) => {
          console.error(err);
        });
    }, 1800000);//30min
    const timer3 = setInterval(() => {
      api.parkingSolution.TrendParkingGraph()
      .then((response) => {
        if (response) {
          setDailyData(response)
        }
      }).catch((err) => {
        console.error(err);
      });
    }, 3600000);//1hour
    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
      clearInterval(timer3)
    }
  }, []);

  const legendItems = [
    { status: "Occupied", color: getColor("Occupied") },
    { status: "No Data", color: getColor("No Data") },
    { status: "Available", color: getColor("Available") },
  ];

  return (
    <div className={classes.root}>
      <Grid container xs={12} spacing={1}>
        <Grid container item xs={12} spacing={1}>
          <Grid item xs={12} sm={12} md={5} lg={5} xl={5} xxl={5}>
            <Card className={classes.paper} style={{ height: '85vh' }}>   
           
               <TableContainer component={Paper} style={{ marginTop: '8px' }}>
                <Table className={classes.table} aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="left">Floor</StyledTableCell>
                      <StyledTableCell align="center" style={{ width: '100px', paddingRight: '16px' }}>Total</StyledTableCell>
                      <StyledTableCell align="center" style={{ width: '100px', paddingRight: '16px' }}>Availability</StyledTableCell>
                      <StyledTableCell align="center" style={{ width: '100px', paddingRight: '0px' }}>Occupied</StyledTableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
              <TableContainer   className={classes.container} center style={{ marginTop: '0vh' }}>
                <Table className={classes.table} aria-label="customized table">
                  <TableBody>
                    {getParkingStatus && getParkingStatus.floorStats && getParkingStatus.floorStats.slice().reverse().map((floor) => (
                      <TableRow
                        key={floor.floor_name}
                        onClick={() => handleClickNext(floor)}
                        style={{ backgroundColor: '#f5f5f5' }}
                      >
                        <TableCell component="th" scope="row" align="left" style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', padding: '10px' }}>
                          {/* {floor.floor_name=='Floor-01'?'Basement-2':''} */}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', width: '100px', paddingRight: '8px' }}>
                          {floor.total_vehicle_occupancy || 0}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', width: '100px', paddingRight: '8px' }}>
                          {floor.available_slots || 0}
                        </TableCell>
                        <TableCell align="center" style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', width: '100px', paddingRight: '0px' }}>
                          {floor.occupied_slots || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <h1 style={{ fontWeight: 'bold', fontSize: '2.5vh', color: 'black', marginTop: '2vh' }}>Hourly Parking Usage</h1>
              <FaultTrendAndHistogram histogramData={LatestData} status="Hourly" style={{ height: '400px',marginTop:"-1vh" }} />
              <h1 style={{ fontWeight: 'bold', fontSize: '2.5vh', color: 'black', marginTop: '0vh' }}>Daily Parking Usage</h1>
              <FaultTrendAndHistogram histogramData={getDailyData} status="Daily" style={{ height: '400px',marginTop:"-3vh" }} />
            </Card>
          </Grid>


          <Grid item xs={12} sm={12} md={7} lg={7} xl={7} xxl={7}>
            <Card className={classes.paper} style={{ height: '85vh' }}>
              <div style={{ overflowX: 'hidden', overflowY: 'auto', height: '100%' }}>
                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                    <Typography style={{ fontWeight: 'bold', fontSize: '2.5vh', color: 'black', marginTop: '0vh' }}>Parking Availability Status</Typography>
                    <Typography variant="h6" style={{ fontWeight: 'bold', fontSize: '2.5vh', color: '#0123b4', marginTop: '0vh' }}>{floorName=='Floor-01'?'Basement-2':''}</Typography>
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
                    // bounds={[[-10, 60], [405, 760],]}
                    bounds={[[-10, 145], [410, 700]]}
                  />
                  {(getParkingStatus && floorId && getParkingStatus.transformedResponse) ? (
                    getParkingStatus.transformedResponse
                      .filter(res => res.floor_id === floorId)
                      .sort((a, b) => parseInt(a.slot_no) - parseInt(b.slot_no))
                      .map((res) => (
                        (res.floor_id === floorId) &&
                        <Marker position={JSON.parse(res.coordinates)} icon={res.vehicle_occupancy == "0" ? greenCarIcon : res.vehicle_occupancy == "1" ? redCarIcon : greyCarIcon}>
                          <Tooltip direction="top" opacity={1}>{res.device_name}</Tooltip>
                        </Marker>
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
