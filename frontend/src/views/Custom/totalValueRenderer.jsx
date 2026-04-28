import api from '../../api';
import React from 'react';
import Button from "../../components/CustomButtons/Button";
import {
  redColor,greenColor,
  whiteColor,
  greyColor,
  blackColor,
  blueColor,
  hexToRgb
} from "assets/jss/material-dashboard-react.js";
 
export default (props) => {
  const [flag, setFlag] = React.useState(props.data.acknowledged === 1);
 
  const buttonClicked = () => {
    // Set flag to true to change the button to gray immediately
    setFlag(true);
 
    let req = { id: props.data.Alarm_Id, userid: localStorage.userID };
 
    // Call API to acknowledge the alarm
    api.alarms.acknowledge_alarm(req).then(res => {
      console.log("Alarm acknowledged response:", res);
    }).catch(error => {
      console.error("Error acknowledging alarm:", error);
      // Reset flag in case of error
      setFlag(false);
    });
  };
 
  return (
    <>
      {flag ? (
        <Button
          variant="contained"
          style={{ backgroundColor: "#D3D3D3", color: "black" }} // Gray color for "Acknowledged"
          disabled
        >
          Acknowledged
        </Button>
      ) : (
        <Button
          variant="contained"
          // color="danger" // Red color for "Ack"
          style={{backgroundColor:redColor[0]}}
          onClick={buttonClicked}
        >
          Ack
        </Button>
      )}
    </>
  );
};
 
