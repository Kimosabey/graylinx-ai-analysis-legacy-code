import React from "react";
import { TextField, InputAdornment } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/CustomButtons/Button.js";
import graylinxlogo from "../../assets/img/graylinxlogo2.png";
import Background from "../../assets/img/login_background.jpg";
import UsernameIcon from "../../assets/img/Username";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import api from "../../api.js";
import Cookies from "universal-cookie";
import { useHistory } from "react-router-dom";
import { ValidatorForm } from "react-material-ui-form-validator";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import { useDispatch } from "react-redux";
import Modal from "@material-ui/core/Modal";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import PersonIcon from "@material-ui/icons/Person";
import ForgotPassword from "./ForgotPassword";
import { redColor } from "assets/jss/material-dashboard-react";
const useStyles = makeStyles((theme) => ({
  input: {
    textalign: "center",
    fontWeight: "bold",
    marginBottom: "20px",
    width: "90%",
    marginLeft: "10px",
    color: "#0123B4",
    backgroundColor: "#eeeef5",
  },
  logo: {
    padding: "10px",
    marginLeft: "auto",
    marginRight: "auto",
    height: "75px",
    width: "170px",
    textalign: "center",
    display: "table-cell",
    verticalAlign: "middle",
  },
  paper: {
    marginTop: "130px",
    width: "65%",
    marginLeft: "30%",
    flexDirection: "column",
    alignItems: "center",
    background: "white",
    [theme.breakpoints.down("sm")]: { width: "90%", marginLeft: "2%" },
    [theme.breakpoints.down("xs")]: { width: "90%", marginLeft: "2%" },
  },
  submit: {
    width: "90%",
    margin: "20px 16px 44px",
    borderRadius: "20px",
    backgroundColor: "#266275",
    color: "white",
    "&,&:focus,&:hover,&:visited": {
      backgroundColor: "#266275",
    },
  },
  overlay: {
    position: "fixed",
    opacity: "0.8",
    width: "100%",
    height: "100%",
    left: 10,
    top: 0,
    zIndex: 10,
    backgroundImage: `url(${Background})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  },
  modal: {
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    [theme.breakpoints.down("xs")]: { width: 315 },
    [theme.breakpoints.down("sm")]: { width: 315 },
  },
  yesbutton: {
    marginTop: 30,
    width: "100px",
    margin: "15px",
  },
}));

function rand() {
  return Math.round(Math.random() * 20) - 10;
}
function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();
  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

export default function Login(params) {
  const classes = useStyles();
  let history = useHistory();
  const [showPassword, setShowPassword] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [alert, setAlert] = React.useState("");
  const [openalert, setOpenalert] = React.useState(false);
  const [modalStyle] = React.useState(getModalStyle);
  const [openmodal, setOpenmodal] = React.useState("");
  const dispatch = useDispatch();
  const [error, setError] = React.useState("");

  const handleChangeForUsername = (event) => {
    setUsername(event.target.value);
  };

  const handleChangeForPassword = (event) => {
    setPassword(event.target.value);
  };

  const handleclose = () => {
    setOpenalert(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cookies = new Cookies();
    const credentials = {
      username,
      password,
      role: checked ? "guest" : "",
    };
    const force = false;
    api.auth
      .login(credentials, force)
      .then((user) => {
        if (user === "Username doesn't exists !") {
          setAlert("Username doesn't exists !");
          setOpenalert(true);
        } else {
          cookies.set("token", user.token.replace("JWT ", ""));
          localStorage.campusID = user.campus.id;
          localStorage.userID = user.user.id;
          localStorage.buildingID = user.building.id;
          localStorage.buildingName = user.building.name;
          localStorage.username = user.user.name;
          localStorage.roleID = user.role.id;
          // localStorage.setItem('floorName','Floor-01');
          // localStorage.setItem('floorID','eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20');

          dispatch({
            type: "login",
            payload: user,
          });
          api.notifications.alarm(user.building.id).then((res) => {
            dispatch({
              type: "alarm",
              payload: res,
            });
            {
              localStorage.getItem("roleID") == "6"
                ? history.push(`/admin/Parkingsolution`)
              //: history.push(`/admin/building/${user.building.id}/dashboard`);
             : history.push(`/admin/GlChillerLanding`);
            }
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const remainingTimeInSeconds = user.exp - currentTimeInSeconds;
            setTimeout(() => {
              console.log("calling logout");
              dispatch({
                type: "logout",
              });
            }, remainingTimeInSeconds * 1000);
          });

          let timer = setInterval(() => {
            api.notifications.alarm(user.building.id).then((res) => {
              dispatch({
                type: "alarm",
                payload: res,
              });
            });
          }, 5000);

          let timer1 = setTimeout(() => {
            {
              localStorage.getItem("roleID") == "6"
                ? history.push(`/admin/Parkingsolution`)
               // : history.push(`/admin/building/${user.building.id}/dashboard`);
               : history.push(`/admin/GlChillerLanding`);
            }
          }, 1000);
          return () => {
            clearTimeout(timer1);
            clearInterval(timer);
          };
        }
      })
      .catch((error) => {
        //console.log("----------------->error", error);
        const err = error.response.data.errors;
        if (error.response.data.errors.global === "Invalid credentials") {
          setAlert("Invalid Credentials");
          setOpenalert(true);
        } else if (err.global.includes("Invalid User")) {
          setAlert("Invalid User,Please check Username");
          setOpenalert(true);
        }
        if (err.global.includes("Account Locked for 15 mins")) {
          setAlert("Account Locked for 15 mins");
          setOpenalert(true);
        } else if (err.global.includes("User Already Logged In")) {
          setAlert("");
          setOpenalert(false);
          setOpenmodal(true);
        }
      });
  };

  const onNoClick = () => {
    setOpenmodal(false);
  };
  const onYesClick = (event) => {
    event.preventDefault();
    const cookies = new Cookies();
    const credentials = {
      username,
      password,
      role: checked ? "guest" : "",
    };
    const force = true;
    api.auth.login(credentials, force).then((user) => {
      cookies.set("token", user.token.replace("JWT ", ""));
      cookies.set("role", user.role.id);
      localStorage.campusID = user.campus.id;
      localStorage.roleID = user.role.id;
      localStorage.buildingID = user.building.id;
      localStorage.lastLogin = user.lastLogin;
      localStorage.userID = user.user.id;
      localStorage.buildingName = user.building.name;
      localStorage.username = user.user.name;
      // localStorage.setItem('floorName','Floor-01');
      // localStorage.setItem('floorID','eb32cb5b-7eeb-45c5-9da9-a4a170aa3e20');
      dispatch({
        type: "login",
        payload: user,
      });
      //let timer1=''
      api.notifications.alarm(user.building.id).then((res) => {
        dispatch({
          type: "alarm",
          payload: res,
        });
        {
          localStorage.getItem("roleID") == "6"
            ? history.push(`/admin/Parkingsolution`)
            : //console.log("qwertyuiop redux is updatewd with alarm", res);
          //history.push(`/admin/building/${user.building.id}/dashboard`);
           history.push(`/admin/GlChillerLanding`);
        }
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const remainingTimeInSeconds = user.exp - currentTimeInSeconds;
        setTimeout(() => {
          console.log("calling logout");
          dispatch({
            type: "logout",
          });
        }, remainingTimeInSeconds * 1000);
      
      });
      let timer = setInterval(() => {
        api.notifications.alarm(user.building.id).then((res) => {
          dispatch({
            type: "alarm",
            payload: res,
          });
        });
      }, 5000);
      let timer1 = setTimeout(() => {
        {
          localStorage.getItem("roleID") == "6"
            ? history.push(`/admin/Parkingsolution`)
            //: history.push(`/admin/building/${user.building.id}/dashboard`);
           : history.push(`/admin/GlChillerLanding`);
        }
      }, 1000);
      return () => {
        clearTimeout(timer1);
        clearInterval(timer);
      };
    });

    /*return () => {
                clearTimeout(timer1);
                // clearTimeout(timer);

            };*/
    // });
    setOpenmodal(false);
  };
  const body = (
    <div style={modalStyle} className={classes.modal}>
      <Grid container spacing={2} justify="center" alignItems="center">
        <Typography align="center">
          User already Logged in ? Do you want Login
        </Typography>
        <Button
          onClick={onYesClick}
          style={{ backgroundColor: redColor[0] }}
          // color={redColor[0]}
          variant="contained"
          className={classes.yesbutton}
        >
          Yes
        </Button>
        <Button
          onClick={onNoClick}
          // color="default"
          variant="contained"
          className={classes.yesbutton}
        >
          No
        </Button>
      </Grid>
    </div>
  );
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  return (
    <div>
      <div>
        {openalert === true ? (
          <div>
            <Snackbar
              open={openalert}
              autoHideDuration={6000}
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
              <Alert
                style={{ cursor: "pointer" }}
                severity="error"
                variant="filled"
                onClose={handleclose}
              >
                {alert}
              </Alert>
            </Snackbar>
          </div>
        ) : (
          <div></div>
        )}
        <Modal
          open={openmodal}
          onClose={handleclose}
          aria-labelledby="simple-modal-title"
        >
          {body}
        </Modal>
      </div>
      <div>
        <Grid
          container
          item
          xs={12}
          direction="row"
          style={{
            height: "100vh",
            display: "flex",
            textAlign: "center",
            alignContent: "center",
          }}
        >
          <Grid item xs={12} sm={12} md={12} lg={12} xl={12} xxl={12}>
            <img style={{ height: "10vh" }} src={graylinxlogo} alt="Logo" />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
            lg={12}
            xl={12}
            xxl={12}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <ValidatorForm
              style={{ width: "50%" }}
              onSubmit={handleSubmit}
              instantValidate={true}
            >
              <TextField
                required
                size="small"
                margin="normal"
                fullWidth
                id="email"
                placeholder="USERNAME"
                label="username"
                textalign={"center"}
                name="username"
                value={username}
                onChange={handleChangeForUsername}
                autoComplete="email"
                autoFocus
                inputProps={{ maxLength: 15 }}
                className={classes.input}
                variant="outlined"
                // validators={["required"]}
                // errormessages={["field cannot be empty"]}
                InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      {/* <UsernameIcon /> */}
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                required
                size="small"
                margin="normal"
                fullWidth
                name="password"
                value={password}
                placeholder="PASSWORD"
                // type="password"
                type={showPassword ? "text" : "password"}
                id="password"
                onChange={handleChangeForPassword}
                pattern={'^(?=.*?[!@#$%^&*(),.?":{}|<>]).+$'}
                autoComplete="current-password"
                inputProps={{ maxLength: 15 }}
                label="password"
                className={classes.input}
                variant="outlined"
                // validators={["required"]}
                // errormessages={["field cannot be empty"]}
                InputProps={{
                  endAdornment: (
                    <InputAdornment>
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                style={{
                  backgroundColor: "#0123B4",
                  width: "90%",
                  marginLeft: "1vh",
                }}
              >
                Login
              </Button>
              <ForgotPassword />
            </ValidatorForm>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}
