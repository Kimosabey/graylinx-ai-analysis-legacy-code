import React, { useEffect, useState } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { Chip } from "@material-ui/core";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
// const data = require('../../assets/Data/data.json');
const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

export default function TableList() {
  const [status, setStatus] = React.useState([])
  const [data,setData]=useState({});
  const getData = () => {
    // fetch('/uat/data.json'
    fetch('/material-dashboard-react/data.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setStatus(myJson.buildings[0].deviceStatus.status)
      });
  }
  useEffect(() => {
    if(process.env.REACT_APP_ENVIRONMENT=='cloud'){
    getData()
    }
    else
    {
      //api should be should be used to load data
      // console.log("data should load from API")
    }
    
  }, [])
  const classes = useStyles();
  return (
    <GridContainer>
      {/* {console.log(status)} */}
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={classes.cardTitleWhite}>Status table</h4>
            <p className={classes.cardCategoryWhite}>
              Here is a status of all devices
            </p>
          </CardHeader>
          <CardBody>
            <Table
              tableHeaderColor="primary"
              tableHead={["DeviceName", "Mac-id", "Floor", "Zone", "Status"]}
              tableData=''
              tableData={status.map((_val, index) => (
                [_val.device_name,
                _val.device_address,
                _val.floor_name,
                _val.zone_name,
                (<Chip style={{ marginRight: "10px", backgroundColor: _val.background }} size="small" color={_val.color} label={_val.status}></Chip>)

                ]
              ))

              }
            />
          </CardBody>
        </Card>
      </GridItem>

    </GridContainer>
  );
}
