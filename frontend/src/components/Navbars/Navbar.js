// import React from "react";
// import clsx from 'clsx';
// import classNames from "classnames";
// import PropTypes from "prop-types";
// // // @material-ui/core components
// import { makeStyles } from "@material-ui/core/styles";
// import AppBar from "@material-ui/core/AppBar";
// import Toolbar from "@material-ui/core/Toolbar";
// import IconButton from "@material-ui/core/IconButton";
// import CssBaseline from '@material-ui/core/CssBaseline';
// import Hidden from "@material-ui/core/Hidden";
// // // @material-ui/icons
// import Menu from "@material-ui/icons/Menu";
// import MenuIcon from '@material-ui/icons/Menu'
// // core components
// import AdminNavbarLinks from "./AdminNavbarLinks.js";
// import RTLNavbarLinks from "./RTLNavbarLinks.js";
// import Button from "components/CustomButtons/Button.js";

// import styles from "assets/jss/material-dashboard-react/components/headerStyle.js";

// const useStyles = makeStyles(styles);

// const drawerWidth = 260;
// const useStyles1 = makeStyles((theme) => ({
//   menuButton: {
//     marginRight: theme.spacing(2)
//   },
//   hide: {
//     display: 'none'
//   },
//   appBar: {
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.sharp,
//       duration: theme.transitions.duration.leavingScreen,
//     }),
//   },
//   appBarShift: {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//     transition: theme.transitions.create(['margin', 'width'], {
//       easing: theme.transitions.easing.easeOut,
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   },
// //   // appBar: {
// //   //   flexGrow: 1,
// //   //   padding: theme.spacing(3),
// //   //   transition: theme.transitions.create('margin', {
// //   //     easing: theme.transitions.easing.sharp,
// //   //     duration: theme.transitions.duration.leavingScreen,
// //   //   }),
// //   //   // marginLeft:drawerWidth,
// //   //   marginLeft:0,
// //   // },
// //   // appBarShift: {
// //   //   // width: `calc(100% - ${drawerWidth}px)`,
// //   //   transition: theme.transitions.create('margin', {
// //   //     easing: theme.transitions.easing.easeOut,
// //   //     duration: theme.transitions.duration.enteringScreen,
// //   //   }),
// //   //   // marginLeft:0,
// //   //   marginLeft:drawerWidth
// //   // },
// }));


// export default function Header(props) {
//   const classes = useStyles();
//   const classes1 = useStyles1();
//   function makeBrand() {
//     var name;
//     props.routes.map(prop => {
//       if (window.location.href.indexOf(prop.layout + prop.path) !== -1) {
//         name = props.rtlActive ? prop.rtlName : prop.name;
//       }
//       return null;
//     });
//     return name;
//   }
//   const { color } = props;
//   const appBarClasses = classNames({
//     [" " + classes[color]]: color
//   });
//   return (
//     <div>
//     <AppBar
//       // color="transparent"
//        position="fixed"
//       //  className={clsx(classes.appBar, {
//       //   [classes.appBarShift]: props.open,
//       // })}
//         >
//           <div  className={clsx(classes1.appBar, {
//         [classes1.appBarShift]: props.open,
//       })}>
//         <Toolbar >
//           <IconButton
//             color="inherit"
//             aria-label="open drawer"
//             onClick={props.handleDrawerOpen}
//             edge="start"
//             className={clsx(classes1.menuButton, props.open && classes1.hide)}
//             // className={clsx(classes1.menuButton, props.open && classes.hide)}
//           >
//             <MenuIcon />
//           </IconButton>
//            <div>
//           <Button color="transparent" href="#">
//             {makeBrand()}
//           </Button>
//           </div>
//            <AdminNavbarLinks />
//          </Toolbar>
//          </div>
//         </AppBar>
//        </div>
//    );
// }

// Header.propTypes = {
//   color: PropTypes.oneOf(["primary", "info", "success", "warning", "danger"]),
//   rtlActive: PropTypes.bool,
//   handleDrawerToggle: PropTypes.func,
//   routes: PropTypes.arrayOf(PropTypes.object)
// };
// // //  <div  className={clsx(classes1.content, {
// // //            [classes1.contentShift]: props.open,
// // //          })}
// // //              ></div>  