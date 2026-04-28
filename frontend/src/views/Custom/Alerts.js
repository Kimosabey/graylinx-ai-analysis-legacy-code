import React from "react";
import { TextField, InputAdornment } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Button from "components/CustomButtons/Button.js";
import graylinxlogo from "../../assets/img/graylinxlogo2.png";
import Background from "../../assets/img/login_background.jpg";
//import Background from '../../assets/img/Graylinx_Login.png';
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

const useStyles = makeStyles((theme) => ({
    input: {
        //background: "white",
        //borderRadius: "20px",
        textAlign: "center",
        //color: "white",
        fontWeight: "bold",
        marginBottom: "20px",
        width: "90%",
        marginLeft: "10px",
        color: "#0123B4",
        // fontSize:"16px",
    },
    // text:{
    //     fontSize:"16px",
    //     [theme.breakpoints.up("xl")]: {
    //         fontSize:"35px"
    //     }
    // },
    logo: {
        padding: "10px",
        marginLeft: "auto",
        marginRight: "auto",
        height: "75px",
        width: "200px",
        textAlign: "center",
        display: "table-cell",
        verticalAlign: "middle",
        // marginLeft: "210%"
        //    [theme.breakpoints.up("xl")]: {
        //       height:"80px",
        //       width:"250px"
        //    },
    },
    paper: {
        marginTop: "130px",
        width: "65%",
        marginLeft: "30%",
        // display: 'flex',
        flexDirection: "column",
        alignItems: "center",
        background: "white",
        // opacity: "0.9"
        //backgroundColor: 'pink'
        [theme.breakpoints.down("sm")]: { width: "90%", marginLeft: "2%" },
        [theme.breakpoints.down("xs")]: { width: "90%", marginLeft: "2%" },
        // [theme.breakpoints.up('lg')]:
        //     {width:"30%",marginLeft:"77%"}
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
        // [theme.breakpoints.up('xl')]: {
        //     fontSize: "37px",
        // }
    },
    overlay: {
        position: "fixed",
        opacity: "0.8",
        width: "100%",
        height: "100%",
        left: 10,
        top: 0,
        zIndex: 10,
        //backgroundImage: "url(" +/Assets/Images/login_img.jpg + ")",
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
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    // const [authenticated,setAuthenticated] = React.useState(false);
    // const [listItems,setListItems] = React.useState([]);
    // const [error,SetError] = React.useState('');
    const [checked, setChecked] = React.useState(false);
    const [alert, setAlert] = React.useState("");
    const [openalert, setOpenalert] = React.useState(false);
    const [modalStyle] = React.useState(getModalStyle);
    const [openmodal, setOpenmodal] = React.useState(false);
    const dispatch = useDispatch();

    // const hashPassword = async (password) => {
    //     const salt = await bcrypt.genSalt(10);
    //     const hashed = await bcrypt.hash(password, salt);
    //     return hashed;
    // }

    const handleChangeForUsername = (event) => {
        setUsername(event.target.value);
    };

    const handleChangeForPassword = (event) => {
        setPassword(event.target.value);
    };
    // const handleChange = (event) => {
    //     setChecked(event.target.checked)
    // }
    const handleclose = () => {
        setOpenalert(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const cookies = new Cookies();
        // const salt = await bcrypt.genSalt(10);
        // const hashed = await bcrypt.hash(password, salt);
        const credentials = {
            username,
            password,
            // password: hashed,
            // password: "$2a$10$SeIMBuaZZw0bPfEfW8V9Vu5qWzcTPJQeWJsPZQSwMw08bJlsabrcG",
            role: checked ? "guest" : "",
        };
        const force = false;
        // console.log(credentials)
        // history.push("/admin/home")
        // console.log("credentilassssssssssssss",credentials)
        api.auth
            .login(credentials, force)
            .then((user) => {
                // console.log("user information is", user)
                if (user === "Username doesn't exists !") {
                    setAlert("Username doesn't exists !");
                    setOpenalert(true);
                } else {
                    // setAuthenticated(true)
                    cookies.set("token", user.token.replace("JWT ", ""));
                    // setListItems({listItems:JSON.parse(localStorage.getItem('list-sidebar'))})
                    localStorage.userID = user.user.id;
                    localStorage.buildingID = user.building.id;
                    localStorage.buildingName = "Graylinx Building";
                    localStorage.username = user.user.name;
                    dispatch({
                        type: "login",
                        payload: user,
                    });
                    api.notifications.alarm(user.building.id).then((res) => {
                        // console.log("-------------------------------")
                        // console.log("ress in nav bar-------alert", res)
                        dispatch({
                            type: "alarm",
                            payload: res,
                        });
                    });

                    let timer = setInterval(() => {
                        api.notifications.alarm(user.building.id).then((res) => {
                            // console.log("-------------------------------")
                            // console.log("ress in nav bar-------alert", res)
                            dispatch({
                                type: "alarm",
                                payload: res,
                            });
                        });
                    }, 5000);

                    let timer1 = setTimeout(() => {
                        //history.push("/admin/home")
                        history.push(`/admin/building/${user.building.id}/dashboard`);
                    }, 1000);
                    return () => {
                        clearTimeout(timer1);
                        clearInterval(timer);
                    };
                }
            })
            .catch((error) => {
                const err = error.response.data.errors;
                //  SetError(err.global)
                // console.log("errr============", error.response.data.errors.global)
                if (error.response.data.errors.global === "Invalid credentials") {
                    setAlert("Invalid Credentials");
                    // console.log("erroroo login",error.response.data.errors)
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
            // console.log("user",user)
            // console.log("user---------------->",user.user.name)
            // setAuthenticated(true)
            cookies.set("token", user.token.replace("JWT ", ""));
            cookies.set("role", user.role.id);
            localStorage.campusID = user.campus.id;
            localStorage.roleID = user.role.id;
            localStorage.buildingID = user.building.id;
            localStorage.lastLogin = user.lastLogin;
            localStorage.userID = user.user.id;
            localStorage.buildingName = "Graylinx Building";
            localStorage.username = user.user.name;
            dispatch({
                type: "login",
                payload: user,
            });
            api.notifications.alarm(user.building.id).then((res) => {
                // console.log("-------------------------------")
                // console.log("ress in nav bar-------alert", res)
                dispatch({
                    type: "alarm",
                    payload: res,
                });
            });
            let timer1 = setTimeout(() => {
                //history.push("/admin/home")
                history.push(`/admin/building/${user.building.id}/dashboard`);
            }, 1000);

            let timer = setInterval(() => {
                api.notifications.alarm(user.building.id).then((res) => {
                    // console.log("-------------------------------")
                    // console.log("ress in nav bar-------alert", res)
                    dispatch({
                        type: "alarm",
                        payload: res,
                    });
                });
            }, 5000);
            return () => {
                clearTimeout(timer1);
                clearInterval(timer);
            };
        });
        setOpenmodal(false);
    };
    const body = (
        <div style={modalStyle} className={classes.modal}>
            <Grid container spacing={3} justify="center" alignItems="center">
                <Typography align="center">
                    User already Logged in ? Do you want Login
                </Typography>
                <Button
                    onClick={onYesClick}
                    color="danger"
                    variant="contained"
                    className={classes.yesbutton}
                >
                    Yes
                </Button>
                <Button
                    onClick={onNoClick}
                    color="default"
                    variant="contained"
                    className={classes.yesbutton}
                >
                    No
                </Button>
            </Grid>
        </div>
    );
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
                <GridContainer>
                    <GridItem xs={12} sm={12} md={10} lg={10} xl={12}>
                        <div className={classes.paper}>
                            {/* <img style={styles.logo} src={graylinxlogo} alt="Logo" /> */}
                            <div>
                                <img className={classes.logo} src={graylinxlogo} alt="Logo" />
                                <ValidatorForm
                                    //ref={(r) => form = r}
                                    // ref={(r) => (this.form = r)}
                                    style={{ width: "100%", marginTop: "55" }}
                                    onSubmit={handleSubmit}
                                    instantValidate={true}
                                // onError={errors => console.log(errors)}
                                >
                                    {/* <form style={{ width: '100%', marginTop:"55"}}
            onSubmit={handleSubmit} > */}
                                    <TextField
                                        size="small"
                                        margin="normal"
                                        fullWidth
                                        id="email"
                                        placeholder="USERNAME"
                                        label="username"
                                        textAlign={"center"}
                                        name="username"
                                        value={username}
                                        onChange={handleChangeForUsername}
                                        autoComplete="email"
                                        autoFocus
                                        className={classes.input}
                                        // style={styles.input}
                                        // inputProps={{ style: { marginTop: "40px"}}}
                                        variant="outlined"
                                        validators={["required"]}
                                        errorMessages={["field cannot be empty"]}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment>
                                                    <UsernameIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />

                                    <TextField
                                        size="small"
                                        margin="normal"
                                        fullWidth
                                        name="password"
                                        value={password}
                                        placeholder="PASSWORD"
                                        type="password"
                                        id="password"
                                        onChange={handleChangeForPassword}
                                        autoComplete="current-password"
                                        label="password"
                                        className={classes.input}
                                        // style={styles.input}
                                        // inputProps={{ style: {color: 'white'}}}
                                        variant="outlined"
                                        validators={["required"]}
                                        errorMessages={["field cannot be empty"]}
                                    />
                                    {/* <FormControlLabel control={<Checkbox
                checked={checked}
                onChange={handleChange}
                inputProps={{ 'aria-label': 'primary checkbox' }}
                />} label="Guest User" 
                labelPlacement="start"
            /> */}
                                    {/* <Checkbox
                checked={this.state.checked}
                onChange={this.handleChange}
                inputProps={{ 'aria-label': 'primary checkbox' }}
            />
            <label>Guest User</label> */}
                                    {/* <GradientButton style={styles.submit}>LOGIN</GradientButton>; */}
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        //className={classes.submit}
                                        color="Blue"
                                    // style={styles.submit}
                                    >
                                        Login
                                    </Button>
                                    {/* <Grid>
                <Link>
                    Forgot password?
                </Link>
            </Grid> */}
                                    {/* </form> */}
                                </ValidatorForm>
                            </div>
                        </div>
                    </GridItem>
                </GridContainer>
            </div>
        </div>
    );
}
