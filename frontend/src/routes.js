/*!

=========================================================
* Material Dashboard React - v1.9.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2020 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// @material-ui/icons
import Dashboard from "@material-ui/icons/Dashboard";
import HomeIcon from "@material-ui/icons/Home";
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined';
import EventSeatOutlinedIcon from '@material-ui/icons/EventSeatOutlined';
import { CalendarToday } from "@material-ui/icons";
import AssessmentIcon from '@material-ui/icons/Assessment';
import EventSeatIcon from '@material-ui/icons/EventSeat';
import Notifications from "@material-ui/icons/Notifications";
import MapOutlinedIcon from '@material-ui/icons/MapOutlined';
// core components/views for Admin layout
import RoomBooking from 'views/Booking Flow/RoomBooking.js';
import SeatBooking from 'views/Booking Flow/SeatBooking.js';
import AlertsMain from 'views/Custom/AlertsMain.js';
import Schedule from 'views/Scheduler/Schedule.js';
import NetworkDiagram from 'views/NetworkDiagram/NetworkDiagram.js';
import BuildingIcon from "assets/img/BuildingIcon";
import BusinessIcon from '@material-ui/icons/Business';
// core components/views for RTL layout
import Home from "views/Custom/Home.js";
import Controls from 'views/Controls/Controls.js';
import NewDashboard from "views/Dashboard/NewDashboard";
import Floors from "views/Floors/Floors";
import HeatmapComponent from "views/Heatmap/HeatmapComponent";
import FloorOccupancyNew from "views/Occupancy/FloorOccupancyNew";
import hvac from "views/Heatmap/hvac";
import zones from "views/Zones/zones";
import ConfigureSetpoint from "views/Heatmap/ConfigureSetpoint";
import Area from "views/Area/Area";
import Areadetail from "views/Area/Areadetail";
import Zonelist from "views/Zones/Zonelist";import GlEventsViewer from 'views/Custom/GlEventsViewer';
import NewAlerts from 'views/Custom/NewAlerts';
import GLReports from 'views/Custom/GLReports';
import GlUps from "views/Heatmap/GlUps";
import GlUpsLanding from "views/Heatmap/GlUpsLanding"
import GlEMLanding from "views/Heatmap/GlEnergyMeterLanding";
import glAhu from "views/Heatmap/GlAhu";
import GlEnergyMeter from "views/Heatmap/GlEnergyMeter";
import GlVav from "views/Heatmap/GlVav";
import glcsu from "views/Heatmap/Glcsu";
import Parkingsolution from "views/Parkingsolution/ParkingGraph"
const campusRoutes = [
  {
    path: "/home",
    name: "Home",
    rtlName: "ملف تعريفي للمستخدم",
    icon: HomeIcon,
    component: Home,
    layout: "/admin"
  }
]

const buildingRoutes = [
  {
    path: "/building/:id/dashboard",
    name: "Building Dashboard",
    rtlName: "پشتیبانی از راست به چپ",
    icon:BusinessIcon,
    component: NewDashboard,
    layout: "/admin"
  },
 
  {
    path: "/glAhu",
    name: "HVAC Controls",
    rtlName: "پشتیبانی از راست به چپ",
    icon:MapOutlinedIcon,
    component: glAhu,
    layout: "/admin"
  },
  {
    path: "/glAhu",
    name: "HVAC Controls",
    rtlName: "پشتیبانی از راست به چپ",
    icon:MapOutlinedIcon,
    component: glcsu,
    layout: "/admin"},
  {
    path: "/floors",
    name: "LMS Controls",
    rtlName: "پشتیبانی از راست به چپ",
    icon:MapOutlinedIcon,
    component: Floors,
    layout: "/admin"
  },
  {
    path: "/room-booking/0",
    name: "Conference Room",
    rtlName: "ملف تعريفي للمستخدم",
    icon: MeetingRoomIcon,
    component: RoomBooking,
    layout: "/admin"
  },
  // {
  //   path: "/seat-booking/0",
  //   name: " LMS Analytics",
  //   rtlName: "ملف تعريفي للمستخدم",
  //   icon: EventSeatOutlinedIcon,
  //   component: SeatBooking,
  //   layout: "/admin"
  // },
  // {
  //   path: "/flooroccupancy",
  //   name: "Floor Occupancy",
  //   rtlName: "طباعة",
  //   icon:  EventSeatIcon,
  //   component: Flooroccupancy,
  //   layout: "/admin"
  // },
  // {
  //   path: "/controls",
  //   name: "Controls",
  //   rtlName: "طباعة",
  //   icon: SettingsOutlinedIcon,
  //   component: AhuDevices,
  //   layout: "/admin"
  // },
  {
     path: "/eventsviewer",
     name: "Alarms",
     rtlName: "طباعة",
     icon: Notifications,
     component: GlEventsViewer,
     layout: "/admin"
  },

  {
    path: "/reportsviewer",
    name: "Reports",
    rtlName: "طباعة",
    icon: AssessmentIcon,
    component: GLReports,
    layout: "/admin"
 },
 {
  path: "/glLandingUps",
  name: "UPS Landing",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlUpsLanding,
  layout: "/admin"
},
 {
  path: "/glUps",
  name: "UPS",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlUps,
  layout: "/admin"
},
{
  path: "/glVav",
  name: "VAV Page",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlVav,
  layout: "/admin"
},
{
  path: "/glAhu",
  name: "HVAC Controls",
  rtlName: "پشتیبانی از راست به چپ",
  icon:MapOutlinedIcon,
  component: glcsu,
  layout: "/admin"},
   {
  path: "/glEMLanding",
  name: "Energy Meter Landing",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlEMLanding,
  layout: "/admin"
},
{
  path: "/glEnergyMeter",
  name: "Energy Meter",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlEnergyMeter,
  layout: "/admin"
},

  // {
  //   path: "/schedule",
  //   name: "Scheduler",
  //   rtlName: "طباعة",
  //   icon: CalendarToday,
  //   component: Schedule,
  //   layout: "/admin"
  // },
  {
    path: "/networkDiagram",
    name: "Network Diagram",
    rtlName: "طباعة",
    icon: SettingsEthernetIcon,
    component: NetworkDiagram,
    layout: "/admin"
  }
]

const ParkingRoutes = [
  {
    path: "/Parkingsolution",
    name: "Parking Management",
    rtlName: "پشتیبانی از راست به چپ",
    icon:BusinessIcon,
    component: Parkingsolution,
    layout: "/admin"
  },
]

const lmsRoutes = [
  {
    path: "/building/:id/dashboard",
    name: "Building Dashboard",
    rtlName: "پشتیبانی از راست به چپ",
    icon:BuildingIcon,
    component: NewDashboard,
    layout: "/admin"
  },
  {
    path: "/eventsviewer",
    name: "Alarms",
    rtlName: "طباعة",
    icon: Notifications,
    component: GlEventsViewer,
    layout: "/admin"
 },

 {
   path: "/reportsviewer",
   name: "Reports",
   rtlName: "طباعة",
   icon: AssessmentIcon,
   component: GLReports,
   layout: "/admin"
},
{
  path: "/glUps",
  name: "UPS",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlUps,
  layout: "/admin"
},
// {
//   path: "/glVav",
//   name: "VAV Page",
//   rtlName: "طباعة",
//   icon: AssessmentIcon,
//   component: GlVav,
//   layout: "/admin"
// },
{
  path: "/glEnergyMeter",
  name: "Energy Meter",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlEnergyMeter,
  layout: "/admin"
},
{
  path: "/glUpsLanding",
  name: "UPS Landing",
  rtlName: "طباعة",
  icon: AssessmentIcon,
  component: GlUpsLanding,
  layout: "/admin"
},
 {
   path: "/schedule",
   name: "Scheduler",
   rtlName: "طباعة",
   icon: CalendarToday,
   component: Schedule,
   layout: "/admin"
 },
 {
   path: "/networkDiagram",
   name: "Network Diagram",
   rtlName: "طباعة",
   icon: SettingsEthernetIcon,
   component: NetworkDiagram,
   layout: "/admin"
 }
]

const floorRoutes = [
 
  // {
  //   path: "/zones/:id/zones",
  //   name: "Zones",
  //   rtlName: "پشتیبانی از راست به چپ",
  //   icon: MapOutlinedIcon,
  //   component: zones,
  //   layout: "/admin"
  // },
  {
    path: "/floor/:id/zones",
    name: "Floor Details",
    rtlName: "پشتیبانی از راست به چپ",
    icon: Dashboard,
    component: zones,
    layout: "/admin"
  },
  {
    path: "/zone",
    name: "ZONE",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component:  Zonelist,
    layout: "/admin"
  },
  {
    path: "/hvac",
    name: "HVAC",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: hvac,
    layout: "/admin"
  },

  {
    path: "/configuresetpoint",
    name: "Configure SetPoint",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: ConfigureSetpoint,
    layout: "/admin"
  },
  {
    path: "/floor/:id/heatmap",
    name: "Parmeter Map",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: HeatmapComponent,
    layout: "/admin"
  }
 
]

const zoneRoutes =[ 
  {
    path: "/areas",
    name: "Zone details",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: Area,
    layout: "/admin"
  },
  {
    path: "/arealist",
    name: "Area",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: Area,
    layout: "/admin"
  },
]
const dashboardRoutes = [
  {
    path: "/dashboard",
    name: "Healthy Building Dashboard",
    rtlName: "پشتیبانی از راست به چپ",
    icon: 'dashboard',
    component: NewDashboard,
    layout: "/admin"
  },
  {
    path: "/floors",
    name: "Floors",
    rtlName: "پشتیبانی از راست به چپ",
    icon: 'dashboard',
    component: Floors,
    layout: "/admin"
  },
  // {
  //   path: "/new-dashboard",
  //   name: "New Dashboard",
  //   rtlName: "پشتیبانی از راست به چپ",
  //   icon: 'dashboard',
  //   component: NewDashboard,
  //   layout: "/admin"
  // },
  {
    path: "/controls",
    name: "Controls",
    rtlName: "طباعة",
    icon: SettingsOutlinedIcon,
    component: Controls,
    layout: "/admin"
  },
  {
    path: "/room-booking/0",
    name: "Conference Room",
    rtlName: "ملف تعريفي للمستخدم",
    icon: MeetingRoomIcon,
    component: RoomBooking,
    layout: "/admin"
  },
  {
    path: "/seat-booking/0",
    name: " Seat Booking",
    rtlName: "ملف تعريفي للمستخدم",
    icon: EventSeatOutlinedIcon,
    component: SeatBooking,
    layout: "/admin"
  },
  {
    path: "/alerts",
    name: "Alerts",
    rtlName: "ملف تعريفي للمستخدم",
    icon: Notifications,
    component: AlertsMain,
    layout: "/admin"
  },
  {
    path: "/newalerts",
    name: "NewAlerts",
    rtlName: "ملف تعريفي للمستخدم",
    icon: Notifications,
    component: NewAlerts,
    layout: "/admin"
  },
  {
    path: "/flooroccupancy",
    name: "Floor Occupancy",
    rtlName: "طباعة",
    icon:  EventSeatIcon,
    component: FloorOccupancyNew,
    layout: "/admin"
  },
  {
    path: "/schedule",
    name: "Scheduler",
    rtlName: "طباعة",
    icon: CalendarToday,
    component: Schedule,
    layout: "/admin"
  },
  {
    path: "/networkDiagram",
    name: "Network Diagram",
    rtlName: "طباعة",
    icon: SettingsEthernetIcon,
    component: NetworkDiagram,
    layout: "/admin"
  },
];

const endUserRoutes = [
  {
    path: "/room-booking/0",
    name: "Conference Room",
    rtlName: "ملف تعريفي للمستخدم",
    icon: MeetingRoomIcon,
    component: RoomBooking,
    layout: "/admin"
  },
  {
    path: "/seat-booking/0",
    name: " Seat Booking",
    rtlName: "ملف تعريفي للمستخدم",
    icon: EventSeatOutlinedIcon,
    component: SeatBooking,
    layout: "/admin"
  },
]



const areaRoutes =[ 
  {
    path: "/areadetail",
    name: "Area details",
    rtlName: "پشتیبانی از راست به چپ",
    icon: MapOutlinedIcon,
    component: Areadetail,
    layout: "/admin"
  },
  
]

export { dashboardRoutes, endUserRoutes, campusRoutes, buildingRoutes,ParkingRoutes, floorRoutes ,zoneRoutes,areaRoutes,lmsRoutes };
