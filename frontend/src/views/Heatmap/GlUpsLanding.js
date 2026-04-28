import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import api from '../../api'
import { Grid, Select, FormControl, MenuItem} from '@material-ui/core';
import Danger from "components/Typography/Danger";
import Success from 'components/Typography/Success';
import {
  blackColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
import LandingPage from './upsEmsLanding';

const useStyles = makeStyles(theme => ({
  formControl: {
    autosize: true,
    clearable: false
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
  }


}));

function GlUpsLanding(props) {
  const classes = useStyles();
  const [floor, setFloor] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem('floorName'));
  const buildingID = useSelector(state => state.isLogged.data.building.id);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const [fid, setFId] = useState(localStorage.getItem('floorID'));
  const [upsdevice, setUpsdevice] = useState([]);

  // const onClickIssue = () => {

  // }
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlefloorchange = (name, id) => {
    setFdata(name);
    setFId(id)
    api.floor.devicemap(id, "UPS")
      .then((res) => {
        res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
        setUpsdevice(res);
      })
      .catch((error) => {
        setUpsdevice([]);

      })
  };
  
  useEffect(() => {
    let zone_id = '', z_data = []
    zone_data.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
    // zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
    // if(fdata!== null){
    zone_data.filter((_each, i) => {
      if (_each.zone_type === 'GL_LOCATION_TYPE_FLOOR') {
        z_data.push(_each);
      }
    })
    zone_id = z_data[0].uuid
    setFdata(z_data[0].name)
    setFId(z_data[0].uuid)
    // console.log("zzzzzzzzzzzzzone_idz", zone_id)

    // } else {
    //   zone_id=zone_data[0].uuid
    //   setFdata(zone_data[0].name)
    // }
    api.floor.devicemap(zone_id, "UPS")
      .then((res) => {
        res.sort(function (a, b) { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); });
        setUpsdevice(res);
      })
    api.dashboard.getMetricData(buildingID).then((res) => {
      res.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      setFloor(res);
    });

  }, [buildingID]);


  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
            <Grid container item xs={12} spacing={2}>
                <Grid item xs={12} sm={12} md={3} lg={3} xl={3} xxl={3}>
                    <FormControl
                                variant="filled"
                                size="large"
                                className={classes.formControl}
                                style={{
                                    width: "max-content",
                                    minWidth: "100%",
                                    backgroundColor: "#eeeef5",
                                    fontFamily: "Arial"
                                }}
                                >
                                <Select
                                    labelId="filled-hidden-label-small"
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
      <LandingPage device={upsdevice} fid={fid} fdata={fdata} type="UPS" />
    </div>
  )
}

export default GlUpsLanding





