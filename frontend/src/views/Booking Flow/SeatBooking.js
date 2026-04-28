import React from "react";
// @material-ui/core
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import ListBookedSeats from './ListBookedSeats.js';
import BookHotDesk from './BookHotDesk.js';
import SelfModeBookHotdesk from './SelfModeBookHotdesk.js';
import EventSeatIcon from '@material-ui/icons/EventSeat';
import Code from "@material-ui/icons/Code";
import {useHistory} from "react-router-dom";

// const useStyles = makeStyles(styles);

export default function MySeats() {
    let history = useHistory();
    const roleID = localStorage.getItem("roleID")
    return (<CustomTabs
        title="Seat Booking:"
        headerColor="info"
        defaultVal={history.location.pathname.includes("/0") ? 0 : 1}
        tabs={[
            {
                tabName: "Booked Seats ",
                tabIcon: EventSeatIcon,
                tabContent: (
                    <ListBookedSeats/>
                )
            },
            {
                tabName: "Book Seat",
                tabIcon: Code,
                tabContent: (
                    (roleID === 5 ? <SelfModeBookHotdesk /> : <BookHotDesk />)
                )
            },
            {
                // tabName: "Others",
                // tabIcon: Cloud,
                // tabContent: (
                //     <Tasks
                //         checkedIndexes={[1]}
                //         tasksIndexes={[0, 1, 2]}
                //         tasks={server}
                //     />
                // )
            }
        ]}
    />);
}
