import api from '../../api';
import React from 'react';
import Button from "../../components/CustomButtons/Button";


export default (props) => {
  // const cellValue = props.valueFormatted ? props.valueFormatted : props.value;
  const [flag, setFlag] = React.useState(false);



  const buttonClicked = () => {
   
    console.log("123456ui",props.data.Alarm_Id)
    //  let y = [props.data.Alarm_Id]
    //  console.log("::::::::::::::::::::::",props.data.Alarm_Id)
     let req ={'id':props.data.Alarm_Id, 'userid':localStorage.userID}
    api.alarms.delete_alarm(req).then(res=>{
      // console.log("SFFFFFFFFFFFFFFFFFFFFFFFF))))))))))))))))",res)
      setFlag(true);


    })
  };

  

  return (
   
     
    <Button variant="contained"color={flag ?"transparent" : "danger"} onClick={() => buttonClicked()}>Ignore</Button>

    
  );
};