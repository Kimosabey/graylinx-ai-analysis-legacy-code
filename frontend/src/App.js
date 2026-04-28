import React, { useEffect } from 'react';
import { Router, navigate } from '@reach/router';
import Cookies from 'universal-cookie';
import api from 'api.js';
import jwt_decode from 'jwt-decode';
import Login from "views/Login/Login.js";
import Home from "views/Custom/Home.js";
import AdminNavbarLinks from 'components/Navbars/AdminNavbarLinks.js';
import ListMeetingRooms from "views/BookingFlow/ListMeetingRooms.js";
import { Redirect } from 'react-router';
import BookMeetingRoom from 'views/BookingFlow/BookMeetingRoom.js';

const items={
    campus:[
       { 
        id:"Home",
        parent:"campus",
        active: true
       }
    ],
    building:[
        {
            id:"Book Meeting Room",
            parent:"building",
            active:false
        }
    ]
}

function App(props) {
    const { container } = props;
    // const classes = useStyles();
    // const theme = useTheme();
    const cookies = new Cookies();
    // const [mobileOpen, setMobileOpen] = React.useState(false);
    // const [selectedIndex, setSelectedIndex] = React.useState("Home")
    const [authenticated, setAuthenticated] = React.useState(false);
    const [selectedIndex] = React.useState("Home")
    // const [error,setError] = React.useState("");
    const [listItems, setListItems] = React.useState([])
    const [error, setError] = React.useState("")
    // const [parent, setParent] = React.useState({
    //   building: { id: "", name: "" }
    // });
    const authentication = (credentials) => {
        api.auth.login(credentials, false)
          .then(user => {
            setAuthenticated(true);
            cookies.set('token', user.token.replace('JWT ', ''));
            cookies.set('role', user.role.id);
            if (user.role.id === 4) {
              localStorage.setItem('list-sidebar', JSON.stringify(items.campus))
            }
            else {
              localStorage.setItem('list-sidebar', JSON.stringify(items.campus))
            }
            setListItems(JSON.parse(localStorage.getItem('list-sidebar')))
            localStorage.campusID = user.campus.id;
            localStorage.roleID = user.role.id;
            localStorage.buildingID = user.building.id;
            localStorage.lastLogin = user.lastLogin;
            localStorage.userID = user.user.id;
            navigate(`/home`)
          })
          .catch((error) => {
            const err = error.response.data.errors
            setError(err.global)
            if (err.global.includes("Invalid credentials")) {
              alert("Invalid Credentials")
            } else if (err.global.includes("Invalid User")) {
              alert("Invalid User", "Please check username")
            }
          })
      }
  
      const logout = () => {
        const token = jwt_decode(cookies.get('token'));
        // const token = '7468abec-5870-4dca-a92a-60aa8ae3720c 4 cluster_manager Raghu 55a47599-34b5-465c-b8ae-386ea658d0d5';
        // const token = {userId: "7468abec-5870-4dca-a92a-60aa8ae3720c", roleId: 4, roleName: "cluster_manager", username: "Raghu", buildingId: "55a47599-34b5-465c-b8ae-386ea658d0d5"}
        api.auth.logout(token).then(res => {
          cookies.remove('token', { path: '/' });
          cookies.remove('role', { path: '/' });
          localStorage.clear();
          console.log('local storage',localStorage.clear())
          navigate("/")
          setAuthenticated(false)
        });
      }
    return(
        <div>
        {authenticated==true ?
            <div>
            <Router>
            <AdminNavbarLinks logout={logout}/>
              <Home path="/home" />
              {/* <BookMeetingRoom path="/book" />
              <ListMeetingRooms path="/meeting-rooms"/> */}
            </Router>
            </div>  
            :
            <Login path="/"  checkAuth={authentication} error={error}/>
        }
        </div>
    )
}
export default App;