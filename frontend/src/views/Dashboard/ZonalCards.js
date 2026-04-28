import React, { useState, useEffect } from "react";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
import Warning from "@material-ui/icons/Warning";
import Grid from "@material-ui/core/Grid";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardFooter from "components/Card/CardFooter.js";
import CardIcon from "components/Card/CardIcon.js";
import Danger from "components/Typography/Danger.js";
import api from "../../api"
import { cardTitle } from "assets/jss/material-dashboard-react.js";
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);


export default function ZonalCards(props) {
    const classes = useStyles();
    const { selectedParam, context } = props;

    return(
        <div>
            <a href="#" onClick={() => selectedParam("", false)}>Back</a>
            <Grid container justify="center" spacing={2} direction="row">
                <GridItem xs={8} sm={4} md={5} lg={4} xl={2}  >
                    <Card>
                        <CardHeader color="success" stats icon>
                        <CardIcon color="success">
                            <Icon>done</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>No. of Healthy Zones</p>
                        <h3 className={classes.cardTitle}>
                            2
                        </h3>
                        </CardHeader>
                        {/* <CardFooter cardFooter stats>
                        <div className={classes.stats}>
                            <a href="#pablo" onClick={e => e.preventDefault()}>
                                Click to View the Zones
                            </a>
                        </div>
                        </CardFooter> */}
                    </Card>
                </GridItem>
                <GridItem xs={8} sm={4} md={5} lg={4} xl={2} >
                    <Card>
                        <CardHeader color="danger" stats icon>
                        <CardIcon color="danger">
                            <Icon>warning</Icon>
                        </CardIcon>
                        <p className={classes.cardCategory}>No. of Unhealthy Zones</p>
                        <h3 className={classes.cardTitle}>
                            1
                        </h3>
                        </CardHeader>
                        {/* <CardFooter cardFooter stats>
                        <div className={classes.stats}>
                            <a href="#pablo" onClick={e => e.preventDefault()}>
                                Click to View the Zones
                            </a>
                        </div>
                        </CardFooter> */}
                    </Card>
                </GridItem>
            </Grid>
        </div>
    )
}
