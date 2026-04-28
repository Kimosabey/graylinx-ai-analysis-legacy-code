import React, { useRef, useEffect } from 'react';
// import { navigate } from '@reach/router';
import Leaflet from 'leaflet';
import { Marker, Tooltip, ImageOverlay, Map } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import "../../assets/css/leaflet.css";
import { Grid } from '@material-ui/core';
import GridItem from 'components/Grid/GridItem.js';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

// Leaflet.Icon.Default.imagePath = '../node_modules/leaflet'
// delete Leaflet.Icon.Default.prototype._getIconUrl;
const floorMap = require("../../assets/img/indiaMapImage.png")

const useStyles = makeStyles((theme) => ({
    map: {
        marginTop: '3%',
        height: '700px'
    },
    media: {
        minHeight: "200px"
    },
    item: {
        minWidth: "370px",
        margin: "1em",
        textAlign: "center",
        boxSizing: "border-box"
    },
    cardAction: {
        display: "block",
        minWidth: "370px",
    },
    bounds: {
        backgroundColor:"transparent",
        [theme.breakpoints.down('xs')]:
            {height:"500px",width:"420px",marginTop:"3%"},
        [theme.breakpoints.down('sm')]:
            {height:'520px',marginTop:"3%"},
        [theme.breakpoints.up('md')] : 
            { height: "520px", marginTop: "3%" },
        [theme.breakpoints.up('xl')] : 
            { height: "700px", marginTop: "3%" }
    }
}));


const locations = [
    {
        coordinates: { x: 160, y: 475 },
        name: "Graylinx-Bengaluru Co-Space",
        iconName: "bng.png"
    },
    {
        coordinates: { x: 225, y: 390 },
        name: "Graylinx-Mumbai Co-space",
        iconName: "mumbai.png"
    },
    // {
    //     coordinates: { x: 280, y: 520 },
    //     name: "Graylinx-Hyderabad Co-space",
    //     iconName: "marker.jpg"
    // },
    // {
    //     coordinates: { x: 200, y: 550 },
    //     name: "Graylinx-Chennai Co-space",
    //     iconName: "marker.jpg"
    // },
    // {
    //     coordinates: { x: 420, y: 420 },
    //     name: "Graylinx-Jaipur Co-space",
    //     iconName: "jaipur.png"
    // },
    // {
    //     coordinates: { x: 190, y: 440 },
    //     name: "Graylinx-Mangaluru Co-space",
    //     iconName: "marker.jpg"
    // }
    // {
    //     coordinates: { x: 12.9716, y: 77.5946 },
    //     name: "Graylinx-Bengaluru Co-Space",
    //     iconName: "building2.webp"
    // },
    // {
    //     coordinates: { x: 19.0760, y: 72.8777 },
    //     name: "Graylinx-Mumbai Co-space",
    //     iconName: "building4.png"
    // },
    // {
    //     coordinates: { x: 17.3850, y: 78.4867 },
    //     name: "Graylinx-Hyderabad Co-space",
    //     iconName: "buildingIcon3.jpg"
    // },
    // {
    //     coordinates: { x: 13.0827, y: 80.2707 },
    //     name: "Graylinx-Chennai Co-space",
    //     iconName: "building.webp"
    // },
    // {
    //     coordinates: { x: 26.9124, y: 75.7873 },
    //     name: "Graylinx-Jaipur Co-space",
    //     iconName: "buildingIcon11.jpg"
    // },
    // {
    //     coordinates: { x: 12.9141, y: 74.8560 },
    //     name: "Graylinx-Mangaluru Co-space",
    //     iconName: "buildingIcon2.png"
    // }
]

export default function Home(props) {
    const classes = useStyles();
    const mapRef = useRef(null);
    const imgRef = useRef(null);
    // const [selectedCity, setSelectedCity] = React.useState("")

    const handleLocationClick = (name) => {
        // if (name === "Graylinx-Bengaluru Co-Space") {
        // navigate('/floors')
        // props.selectContext("building", "Floors", name, id)
        // } else return   
        if(name.includes("Bengaluru")) {
            // setSelectedCity("Bengaluru")
            props.history.push('/admin/city')
        }
    };

    useEffect(() => {
        // console.log(imgRef, "map detaila")
    }, []);

    // const reset = () => {
    //     console.log(imgRef.current.contextValue.map._zoom, "zoom value")
    //     // var map = mapRef.current.viewport.zoom
    //     // var zoomVal = mapRef.current.viewport.zoom
    // }
    // const viewport = {
    //     center: [0, 0],
    //     zoom: 1,
    // };
    const onViewportChanged = (viewport) => {
        console.log(viewport);
        };

    return (
        <div >
            <Grid justify='center' textAlign='center' alignItems='center'>
                <Typography style={{
                    fontFamily: "BwSeidoRound-Regular",
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 22,
                    marginTop: '-37px'
                }}>
                    Select a City
            </Typography>
                {/* <Button variant="contained" onClick={reset} color='info'>
                    Reset
                </Button> */}
                <Grid Container justify='center' textAlign='center' alignItems='center'>
                    <GridItem sm={12} md={12} lg={12}> 

                <Map
                    ref={mapRef}
                    doubleClickZoom={true}
                    zoom={2.5}
                    zoomControl={true}
                    // viewport={
                    //     viewport
                    // }
                    onViewportChanged={onViewportChanged}
                    dragging={true}
                    scrollWheelZoom={true}
                    crs={Leaflet.CRS.Simple}
                    //  center={[0, 0]}
                    // bounds={[[0, 0], [0, 1200]]}
                    bounds={[[0, 0], [620, 1200]]}
                    className={classes.bounds}
                    onClick={(e) => {
                        console.log(e, "is event")
                    }}>
                    <ImageOverlay
                        interactive
                        ref={imgRef}
                        url={floorMap}
                        className={classes.bounds}
                        // bounds={[[0, 0], [575, 1200]]}
                        bounds={[[0, 0], [580, 1100]]}
                    />
                    {locations.map((location, index) => {
                        const icon = new Leaflet.icon({
                            iconUrl: require(`../../assets/img/${location.iconName}`),
                            iconSize: [49, 49],
                        });
                        return (
                            <Marker
                                key={index}
                                icon={icon}
                                onclick={() => handleLocationClick(location.name)}
                                position={[location.coordinates.x, location.coordinates.y]}>
                                <Tooltip opacity={1} sticky>
                                    {location.name}
                                </Tooltip>
                            </Marker>
                        );
                    })}
                </Map>
                </GridItem>
                </Grid>
            </Grid>
        </div>
    
        )
}
