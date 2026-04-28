import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import {
    Grid,
    Select,
    FormControl,
    MenuItem,
    InputLabel,
    Card,
    ButtonBase,
    TextField
} from "@material-ui/core";
import api from "../../api";

import Energyconsumption from './GlEnergy_consumption';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';

import moment from 'moment';
//install react-dates, command(yarn add react-dates)//
import 'react-dates/initialize';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';



const useStyles = makeStyles((theme) => ({
    customDialog: {
        cursor: "pointer",
        width: '470px',
        height: '200px'
    },
    root: {
        flexGrow: 1,
        margin: 0,
        padding: 0,
        width: "100%",
    },
    inputField: {
        margin: theme.spacing(1),
    },
    setptbutton: {
        width: '15vh',
        borderRadius: '8px',
        height: '5vh',
        fontFamily: 'Arial',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: '28vh',
        marginTop: '1.5vh'
    },
    paper: {
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        // boxShadow:'0px 8px 40px #0123B433;',
        boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
        backgroundColor: "#fcfafa",
        padding: theme.spacing(1),
        textAlign: "center",
        color: theme.palette.text.secondary,
        borderRadius: '12px',
        opacity: '1'
    },
    paper1: {
        background: '#FFFFFF 0% 0% no-repeat padding-box',
        // boxShadow:'0px 0px 10px #0123B421',
        boxShadow: "1px 0px 8px 2px rgba(0, 0, 0, 0.14)",
        backgroundColor: "#fcfafa",
        opacity: '1',
        borderRadius: '12px',
        height: '15.7vh',
        // display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center'
    },
    cardHeading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: "center",
        whiteSpace: "nowrap",
        color: "#000000",
        marginTop: '1vh',
        font: 'normal normal medium 17px/60px Bw Seido Round',
        opacity: '1',
        fontWeight: 'bold',
        // fontSize:'1.7vh'
    },
    semicircleBar: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: "center",
        marginTop: '-0.8vh'
    },
    cardbody: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: "center",
        fontSize: "4vh",
        fontWeight: 'bold',
        opacity: '1',
        color: '#0123B4'
    },
    formControl: {
        autosize: true,
        clearable: false,
    },
    select: {
        "&:after": {
            borderBottomColor: "blue",
        },
        "& .MuiSvgIcon-root": {
            color: "white",
            backgroundColor: "#0123b4", borderRadius: "8px"
        },
        "& .MuiSelect-root ": {
            marginTop: "-2vh"
        }
    },
    CardHeadFont: {
        '@media (min-width:0px) and (max-width:599.95px)': {//xs
            fontSize: "1.5vh",
        },
        '@media (min-width:600px) and (max-width:959.95px)': {//sm
            fontSize: "1.9vh",
            borderRadius: '10px'
        },
        '@media (min-width:960px) and (max-width:1279.95px)': {//md
            fontSize: "1.4vh",
        },
        '@media (min-width:1280px) and (max-width:1919.95px)': {//lg
            fontSize: "1.6vh",
        },
        '@media (min-width:1920px) and (max-width:2559.95px)': {//xl
            fontSize: "1.7vh",
        },
    },
    formControl: {
        margin: theme.spacing(2),
        minWidth: 200,
        maxWidth: 400,
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: theme.spacing(0.5),
    },
    placeholder: {
        color: theme.palette.text.secondary,
        fontStyle: 'italic',
    },
    menuItem: {
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },

}));


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 300,
        },
    },
};






function SingleInputDateRangePicker() {
    const classes = useStyles();
    const names = ['Energy'];
    const [floor, setFloor] = useState([]);
    let timePeriod = ['Day', 'Week', 'Month', 'Year'];
    const [fdata, setFdata] = useState(localStorage.getItem('floorName'));
    const [fid, setFId] = useState('');
    const [device, setDevice] = useState([]);
    const buildingID = useSelector(state => state.isLogged.data.building.id);
    const zone_data = useSelector((state) => state.inDashboard.locationData);
    const [energyConsGraphData, setenergyConsGraphData] = useState({});
    const [hour, setHour] = React.useState('Week');
    const [selectedTypes, setSelectedTypes] = React.useState('');
    const [selectedEms, setSelectedEms] = React.useState('');
    const [device_id, setDeviceID] = React.useState('');

    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    useEffect(() => {
        console.log('zone_data on mount:', zone_data);

        let zone_id = '', z_data = [];


        zone_data.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        console.log('Sorted zone_data:', zone_data);


        zone_data.filter((_each) => {
            if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR') {
                z_data.push(_each);
            }
        });
        console.log('Filtered floor zones:', z_data);

        if (z_data.length > 0) {
            zone_id = z_data[0].uuid;
            setFdata(z_data[0].name);
            setFId(z_data[0].id);
            console.log('Selected zone_id:', zone_id);
        } else {
            console.warn('No floor zones found');
        }

        setSelectedTypes(names[0]);
        let type = (names[0] === 'Energy') ? 'energyMeter' : 'WaterMeter';
        console.log('Selected type:', type);

        api.floor.devicemap(zone_id, type)
            .then((res) => {
                console.log('Device map response:', res);
                res.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
                setDevice(res);
                setSelectedEms(res[0]?.name || '');
                setDeviceID(res[0]?.ssid || '');
                console.log(`weeeeeeeeeeeeeek ${timePeriod[1]}`)

                let interval = timePeriod[1], equipment_type = 'NONGL_SS_EMS', device_id = res[0]?.ssid;
                console.log('Fetching energy consumption with:', { interval, equipment_type, device_id });

                // if (interval && equipment_type && device_id) {
                const req = { equipment_type: 'NONGL_SS_EMS', device_id: res[0]?.ssid, interval: "week" };
                api.energy_consumption.energy_consumption(req)
                    .then((response) => {
                        console.log('Energy consumption response:', response);
                        setenergyConsGraphData(response);
                    })
                    .catch((error) => {
                        console.error('Error fetching energy consumption data:', error);
                    });
                // }
            })
            .catch((error) => {
                console.error('Error fetching device map data:', error);
            });

        api.dashboard.getMetricData(buildingID)
            .then((res) => {
                console.log('Metric data response:', res);
                res.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
                setFloor(res);
            })
            .catch((error) => {
                console.error('Error fetching metric data:', error);
            });

    }, [buildingID, zone_data]);

    const handlefloorchange = (name, id) => {
        console.log('Floor changed:', { name, id });
        setFId(id);
        setFdata(name);
    };

    const handleDeviceChange = (id, name) => {
        console.log('Device changed:', { id, name });
        setSelectedEms(name);
        setDeviceID(id);
    };

    const handleDeviceType = (value) => {
        console.log('Device type changed:', value);
        setSelectedTypes(value);
        let type = (value === 'Energy') ? 'energyMeter' : 'WaterMeter';
        if (fid && selectedTypes) {
            console.log('Fetching device map for:', { fid, type });
            api.floor.devicemap(fid, type)
                .then((res) => {
                    console.log('Device map response:', res);
                    res.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
                    setDevice(res);
                })
                .catch((error) => {
                    console.error('Error fetching device map data:', error);
                });
        }
    };

    const handleTimePeriodChange = (value) => {
        console.log('Time period changed:', value);
        setHour(value);
        const fetchData = (interval) => {
            const equipment_type = 'NONGL_SS_EMS';
            const req = { equipment_type, device_id, interval };
            console.log('Fetching energy consumption with:', req);
            api.energy_consumption.energy_consumption(req)
                .then((response) => {
                    console.log('Energy consumption response:', response);
                    setenergyConsGraphData(response);
                })
                .catch((error) => {
                    console.error('Error fetching energy consumption data:', error);
                });
        };

        switch (value) {
            case 'Day':
                fetchData('day');
                break;
            case 'Week':
                fetchData('week');
                break;
            case 'Month':
                fetchData('month');
                break;
            case 'Year':
                fetchData('Year');
                break;
            default:
                console.error('Unknown interval selected');
                break;
        }
    };


    return (
        <div className={classes.root} style={{ marginTop: "0%" }}>

            <Grid container spacing={1}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                        <FormControl
                            variant="outlined"
                            size="large"
                            className={classes.formControl}
                            style={{
                                width: "max-content",
                                minWidth: "100%",
                                backgroundColor: "#eeeef5",
                                fontFamily: "Arial"
                            }}
                        >
                            <InputLabel id="demo-simple-select-outlined-label">Floor</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                label="Floor"
                                value={fdata || ''}
                                style={{
                                    fontWeight: "bold",
                                    height: "6vh",
                                    borderRadius: '0.8vw',
                                    fontFamily: "Arial"
                                }}
                                disableUnderline
                            >
                                {floor.map(_item => (
                                    <MenuItem key={_item.name} value={_item.name}
                                        onClick={() => handlefloorchange(_item.name, _item.id)}
                                    >{_item.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>

            <Grid container xs={12} spacing={2}>
                <Grid container item xs={12} spacing={1}>
                    <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3} style={{ marginTop: '-2px', marginRight: '76px' }}>

                        <FormControl
                            variant="outlined"
                            size="large"
                            className={classes.formControl}
                            style={{
                                width: "max-content",
                                minWidth: "100%",
                                backgroundColor: "#eeeef5",
                                fontFamily: "Arial"
                            }}
                        >
                            <InputLabel id="demo-simple-select-outlined-label">Device</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                label="Device"
                                value={selectedTypes}
                                style={{
                                    fontWeight: "bold",
                                    height: "6vh",
                                    borderRadius: '0.8vw',
                                    fontFamily: "Arial"
                                }}
                                disableUnderline
                            >
                                {/* <MenuItem disabled value="">
                                    <em className={classes.placeholder}>Select options...</em>
                                  </MenuItem> */}

                                {names.map(_item => (
                                    <MenuItem key={_item} value={_item}
                                        onClick={() => handleDeviceType(_item)}
                                    >{_item}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4} style={{ marginTop: '-34px', marginRight: '10px' }}>

                        <FormControl className={classes.formControl}>
                            <InputLabel id="ems-single-select-label">Select Energy</InputLabel>
                            <Select
                                labelId="ems-single-select-label"
                                id="ems-single-select"
                                value={selectedEms}
                                // onChange={(event) => handleDeviceChange(event, setSelectedEms)}
                                input={<Input />}
                                renderValue={(selected) => (
                                    <Box className={classes.chips}>
                                        <Chip key={selected} label={selected} className={classes.chip} />
                                    </Box>
                                )}
                                MenuProps={MenuProps}
                                displayEmpty
                            >
                                {device.map((_item) => (
                                    <MenuItem key={_item.ssid} value={_item.name} className={classes.menuItem} onClick={() => handleDeviceChange(_item.ssid, _item.name)}>
                                        {_item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4} lg={4} xl={4} xxl={4}>

                        <FormControl
                            variant="outlined"
                            size="small"
                            className={classes.formControl}
                            style={{
                                width: "30%",
                                backgroundColor: "#eeeef5",
                                fontFamily: "Arial",
                            }}
                        >
                            <InputLabel id="demo-simple-select-outlined-label">Select</InputLabel>
                            <Select
                                labelId="demo-simple-select-outlined-label"
                                id="demo-simple-select-outlined"
                                label="Month"
                                style={{
                                    fontWeight: "bold",
                                    height: "6vh",
                                    borderRadius: '0.8vw',
                                    fontFamily: "Arial"
                                }}
                                value={hour}
                                className={classes.select}
                                // onChange={handleDropdownChange}
                                disableUnderline
                            >
                                {timePeriod.map((_item) => (
                                    <MenuItem key={_item} value={_item}
                                        onClick={() => handleTimePeriodChange(_item)}
                                    >
                                        {_item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Grid>


            <Grid container item spacing={2}>
                <Grid container item xs={12} spacing={2}>
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                        <Card className={classes.paper} style={{ height: "59.4vh", backgroundColor: '#FFF5F5' }}>
                            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
                                <Box className={classes.graphpaper}>
                                    <div style={{ fontWeight: 'bold', color: 'black', fontSize: '12px' }} className={classes.CardHeadFont}>Energy Consumption</div>
                                    <div style={{ marginTop: '2vh' }}>
                                        <Energyconsumption
                                            style={{ width: "100%", height: "50%" }}
                                            data={energyConsGraphData}
                                            hour={hour}
                                        />
                                    </div>
                                </Box>
                            </Grid>
                            {/* <GlEnergy_consumption data={energyConsGraphData} hour={hour}  />                 */}
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        </div>
    );
}

export default SingleInputDateRangePicker


