import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from "react-router-dom";
import NewDashboard from "views/Dashboard/NewDashboard";
import Home from "views/Custom/Home.js";
import RoomBooking from 'views/Booking Flow/RoomBooking.js';
import SeatBooking from 'views/Booking Flow/SeatBooking.js';
import Floors from 'views/Floors/Floors';

export default function Routes(props) {
    const { context } = props;

    return (
        <Switch>
            <Route path="/admin/home" component={Home} />
            <Route path="/admin/dashboard" component={NewDashboard} context />
            <Route path="/admin/floors" component={Floors} context />
            <Route path="/admin/room-booking/" component={RoomBooking} />
            <Route path="/admin/seat-booking/" component={SeatBooking} />
            <Redirect from="/admin" to="/admin/dashboard" />
        </Switch>
    )
}
