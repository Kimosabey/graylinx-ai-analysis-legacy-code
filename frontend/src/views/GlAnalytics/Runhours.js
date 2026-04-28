import { makeStyles } from '@material-ui/core/styles';
import { Grid, Box, Container, TextField , Button} from '@material-ui/core';
import api from './../../api';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import TimeSeriesRunhours from './TimeSeriesRunhours';
import React, { useEffect, useState, useCallback, useRef } from 'react';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    boxShadow: '0px 4px 20px #0123B41A;',
    opacity: '1',
    borderRadius: '14px',
  },
}));

  
export default function GlAnalyticsRunhours() {
  const classes = useStyles();

  const [analyticsrunhour, setAnalyticsrunhour] = useState([]);
  const [hour, setHour] = React.useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = 'default';
        const response = await api.analyticsrunhour.analyticsrunhour(data);
        const sortedData = sortData(response);
        setAnalyticsrunhour(sortedData);
        console.log('API Response:', sortedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

const handleDropdownChange = (event) => {
  const selectedValue = event.target.value;
  setHour(selectedValue);
  console.log("selected value ==> ", selectedValue);

  const fetchData = (time) => {
    api.analyticsrunhour.analyticsrunhour(time)
      .then((response) => {
        const sortedData = sortData(response);
        setAnalyticsrunhour(sortedData);
        console.log(`API Response for ${time}:`, sortedData);
      })
      .catch((error) => {
        console.error(`Error fetching data for ${time}:`, error);
      });
  };

if (selectedValue === "1 day") {
  fetchData("1 day");
} else if (selectedValue === "1 week") {
  fetchData("1 week");
} else if (selectedValue === "1 month") {
  fetchData("1 month");
}
};

const calculateYAxisRange = (selectedTimeRange) => {
  console.log("selected time range:", selectedTimeRange);

  if (selectedTimeRange === '1 week') {
    return { min: 0, max: 168, labels: Array.from({ length: 169 }, (_, i) => i) };
  } else if (selectedTimeRange === '1 month') {
    return { min: 0, max: 720, labels: Array.from({ length: 721 }, (_, i) => i) };
  } else {
    return { min: 0, max: 24, labels: Array.from({ length: 25 }, (_, i) => i) };
  }
};


const yAxisRange = calculateYAxisRange(hour);
const sortData = (data) => {
  return data.sort((a, b) => {
    const keyA = Object.keys(a)[0];
    const keyB = Object.keys(b)[0];
    return keyA.localeCompare(keyB);
  });
};

return (
  <div>
    <Grid container spacing={2}>
      <Grid item xs={12}>
    
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
          <InputLabel id="demo-simple-select-outlined-label">Time</InputLabel>
          <Select
            labelId="demo-simple-select-outlined-label"
            id="demo-simple-select-outlined"
            label="Floor"
            style={{
              fontWeight: "bold",
              height: "6vh",
              borderRadius: '0.8vw',
              fontFamily: "Arial"
            }}
            // value={hour}
            className={classes.select}
            onChange={handleDropdownChange}
            disableUnderline
          >
            <MenuItem value="1 day">1 Day</MenuItem>
            <MenuItem value="1 week">1 Week</MenuItem>
            <MenuItem value="1 month">1 Month</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Box className={classes.paper} style={{ width: '530px', height: '350px', marginTop: '3vh' }}>
          <div style={{ display: 'flex',marginTop: '-1vh' }}>
            <form className={classes.container} noValidate style={{ marginRight: '18px' }}>
              <TextField
                id="datetime-local-1"
                label="From Date"
                type="datetime-local"
                defaultValue="2024-01-18T10:00"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                  disableUnderline: true, 
                }}
              />
            </form>
            <form className={classes.container} noValidate>
              <TextField
                id="datetime-local-2"
                label="To Date"
                type="datetime-local"
                defaultValue="2024-01-18T11:00"
                className={classes.textField}
                InputLabelProps={{
                  shrink: true,
                }}
                InputProps={{
                  readOnly: true,
                  disableUnderline: true, 
                }}
              />  
            </form>
          </div>
          <TimeSeriesRunhours data={analyticsrunhour} yAxisRange={yAxisRange}  />
        </Box>
      </Grid>
    </Grid>
  </div>
);
}


