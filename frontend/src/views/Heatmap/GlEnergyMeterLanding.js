import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import api from '../../api'
import { Grid, Select, FormControl, MenuItem, Button } from "@material-ui/core";
import { useHistory } from "react-router-dom";
import { blackColor, hexToRgb } from "assets/jss/material-dashboard-react.js";
import LandingPage from "./upsEmsLanding";

const useStyles = makeStyles((theme) => ({
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
      backgroundColor: "#0123b4",
      borderRadius: "8px",
    },
    "& .MuiSelect-root ": {
      marginTop: "-2vh",
    },
  },
}));

function GlEMLanding(props) {
  const classes = useStyles();
  const [floor, setFloor] = useState([]);
  const [fdata, setFdata] = useState(localStorage.getItem("floorName"));
  const [fid, setFId] = useState("");
  const [energydevice, setEnergydevice] = useState([]);
  const buildingID = useSelector((state) => state.isLogged.data.building.id);
  const zone_data = useSelector((state) => state.inDashboard.locationData);
  const history = useHistory();

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // useEffect(() => {
  //   let zone_id = "",
  //     z_data = [];
  //   zone_data.sort(function (a, b) {
  //     return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  //   });
  //   // zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
  //   // if(fdata!== null){
  //   zone_data.filter((_each, i) => {
  //     if (_each.zone_type === "GL_LOCATION_TYPE_FLOOR") {
  //       z_data.push(_each);
  //     }
  //   });
  //   zone_id = z_data[0].uuid;
  //   setFdata(z_data[0].name);
  //   setFId(z_data[0].id);
  //   console.log("zzzzzzzzzzzzzone_idz", zone_id);
  //   // } else {
  //   //   zone_id=zone_data[0].uuid
  //   //   setFdata(zone_data[0].name)
  //   // }
  //   api.floor.devicemap(zone_id, "energyMeter").then((res) => {
  //     res.sort(function (a, b) {
  //       return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  //     });
  //     setEnergydevice(res);
  //   });
  //   api.dashboard.getMetricData(buildingID).then((res) => {
  //     res.sort(function (a, b) {
  //       return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  //     });
  //     setFloor(res);
  //   });
  // }, [buildingID]);
  useEffect(() => {
    // if (!zone_data || zone_data.length === 0) return;
 
    // const sortedZones = [...zone_data].sort((a, b) =>
    //   a.name.localeCompare(b.name)
    // );
 
    // const floorZones = sortedZones.filter(
    //   (each) => each.zone_type === "GL_LOCATION_TYPE_FLOOR"
    // );
 
    // if (floorZones.length === 0) return; // safety check
 
    // const firstFloor = floorZones[0];
    let zone_id = "",
      z_data = [];
    zone_data.sort(function (a, b) {
      return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
    });
    // zone_data.filter((_each)=>_each.zone_type==='GL_LOCATION_TYPE_FLOOR')
    // if(fdata!== null){
    zone_data.filter((_each, i) => {
      if (_each.zone_type === "GL_LOCATION_TYPE_FLOOR") {
        z_data.push(_each);
      }
    });
    zone_id = z_data[0].uuid;
    setFdata(z_data[0].name);
    setFId(zone_id);
    console.log("zzzzzzzzzzzzzone_idz", zone_id);
    api.floor.devicemap(zone_id, "energyMeter")
      .then((res) => {
        const sortedRes = res.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setEnergydevice(sortedRes);
      })
      .catch((err) => {
        console.log("Device map error:", err);
      });
 
    api.dashboard.getMetricData(buildingID)
      .then((res) => {
        const sortedRes = res.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setFloor(sortedRes);
      })
      .catch((err) => {
        console.log("Metric error:", err);
      });
 
  }, [buildingID, zone_data]);
 
    useEffect(()=>{
    if(!fid) return;
    const timer = setInterval(() => {
      console.log("setINterval console",fid)
          api.floor.devicemap(fid, "energyMeter")
      .then((res) => {
        const sortedRes = res.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setEnergydevice(sortedRes);
      })
      .catch((err) => {
        console.log("Device map error:", err);
      });
       }, 5000);
    return () => clearInterval(timer);
  },[fid])

  const handlefloorchange = (name, id) => {
    setFId(id);
    setFdata(name);
    api.floor.devicemap(id, "energyMeter").then((res) => {
      res.sort(function (a, b) {
        return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
      });
      // console.log("ressssssssfrom devicemap",res)
      setEnergydevice(res);
    });
  };

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
                fontFamily: "Arial",
              }}
            >
              <Select
                labelId="filled-hidden-label-small"
                id="demo-simple-select-outlined"
                label="Floor"
                value={fdata || ""}
                style={{
                  fontWeight: "bold",
                  height: "6vh",
                  borderRadius: "0.8vw",
                  fontFamily: "Arial",
                }}
                disableUnderline
              >
                {floor.map((_item) => (
                  <MenuItem
                    key={_item.name}
                    value={_item.name}
                    onClick={() => handlefloorchange(_item.name, _item.id)}
                  >
                    {_item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            xxl={2}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                history.push({
                  pathname: "/admin/GlEnergyMeterSummary",
                  state: { fid, fdata },
                })
              }
              style={{
                marginLeft: "1vh",
                height: "6vh",
                borderRadius: "0.8vw",
                textTransform: "none",
              }}
            >
              Summary View
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <LandingPage device={energydevice} fid={fid} fdata={fdata} type="EMS" />
    </div>
  );
}

export default GlEMLanding




