import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { TextField, InputAdornment } from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import PersonIcon from '@material-ui/icons/Person';
import api from "../../api.js";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import { SemanticToastContainer, toast } from "react-semantic-toasts";

const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));

export default function MaxWidthDialog(props) {
  const classes = useStyles();
  const [showPassword, setShowPassword] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [fullWidth, setFullWidth] = React.useState(true);
  const [maxWidth, setMaxWidth] = React.useState('sm');
  const [error, setError] = React.useState('');
  const [forgot, setForgot] = React.useState(false);
  const [reset, setReset] = React.useState(false);
  const [new_password, setNewPassword] = React.useState("");
  const [confirm_password, setConfirmPassword] = React.useState("");
  const [secretkey, setSecretKey] = React.useState("");
  const [showPassword1, setShowPassword1] = React.useState(false);
  const [openalert, setOpenalert] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [userid, setUserId] = React.useState('');
  const [alert, setAlert] = React.useState("");

  
  const handleclose = () => {
    setOpenalert(false);
};

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChangeForUsername = (event) => {
    setUsername(event.target.value);
};

  const handleChangeForSecretKey = (event) => {
    setSecretKey(event.target.value);
};

const handleClickShowPassword1 = () => setShowPassword1((show) => !show);

const handleMouseDownPassword = (event) => {
  event.preventDefault();
};

const handleChangeForNewPassword = (event) => {
    setNewPassword(event.target.value);
    const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,15}$/;
    const isValidPassword = pattern.test(event.target.value);
    // setIsValid(isValidPassword);
    if(event.target.value != confirm_password ){
        const msg="Password and Confirm Password doesn't match"
        setError(msg) 
    }else{
        const msg=" "
        setError(msg)
    }
};

const handleChangeForConfirmPassword = (event) => {
    setConfirmPassword(event.target.value);
    if(event.target.value != new_password ){
        const msg="Password and Confirm Password doesn't match"
        setError(msg) 
    }else{
        const msg=" "
        setError(msg)         
    }
};
  const handleClickOpen = ()=>{
    setForgot(true)
    setReset(false)
}

const handleClose = () => {
    setForgot(false);
    setNewPassword("")
    setConfirmPassword("")
    setSecretKey("")
    // setUsername("")
  };

  const forgotpasword = () => {
    if(username && secretkey){
            const key = secretkey
            const req ={
                username,
                key  
            }
            api.auth.forgotPassword(req).then((res)=>{
                if(res){
                setReset(true)
                setUserId(res.data.user_id)
                }

            }).catch((error)=>{
                // setAlert(error);
                setAlert("Invalid Secret Key");
                setOpenalert(true);
                setTimeout(() => {
                    setOpenalert(false);
                  }, 3000);
            })
     }else{
        setAlert('Fields cannot be empty');
        setOpenalert(true); 
        setTimeout(() => {
            setOpenalert(false);
          }, 3000);     
     }
  }

  const resetpasword = () => {
    if(new_password && userid){
        const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,15}$/;
        const isValidPassword = pattern.test(new_password);
        console.log("pattern",isValidPassword)
        // setIsValid(isValidPassword);
        if(isValidPassword &&(new_password == confirm_password)){
            const reset= false, id=userid
            const req={
                id,
                new_password,
                reset
            }
            api.auth.resetPassword(req).then((res)=>{
                toast({
                    type: "success",
                    icon: "check circle",
                    title: "Success",
                    description: res.data,
                    time: 2000,
                  });
                // setAlert("password reset successful");
                // setOpenalert(true);
                setForgot(false)
                setReset(false)
                setTimeout(() => {
                  setOpenalert(false);
                }, 3000); 
            }).catch((error)=>{
                console.log("password  reset not sucessfull")  
                setTimeout(() => {
                  setOpenalert(false);
                }, 3000);     
            })
        }
        else if(!isValidPassword){
            setError('Password must be between 8-15 characters long and minimum of 1 special character')
        }
        else {
            setError("Password and Confirm Password doesn't match")  
        }
    }
  }
  return (
    <>
    <>
    {openalert === true ? (
                    <div>
                        <Snackbar
                            open={openalert}
                            autoHideDuration={3000}
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
    </>
                      <a onClick={() => handleClickOpen()} style={{cursor:"pointer" }}>Forgot password ?</a>
 
                                    <Dialog
                                        fullWidth={fullWidth}
                                        maxWidth={maxWidth}
                                        open={forgot}
                                        onClose={handleClose}
                                        aria-labelledby="max-width-dialog-title"
                                    >
                                        <DialogTitle id="max-width-dialog-title" style={{cursor:"pointer"}}>Forgot password?</DialogTitle>
                                        <DialogContent>
                                                <TextField
                                                required
                                                size="small"
                                                margin="normal"
                                                fullWidth
                                                autoFocus
                                                id="email"
                                                placeholder="User name"
                                                label="username"
                                                textalign={"center"}
                                                name="username"
                                                value={username}
                                                onChange={handleChangeForUsername}
                                                autoComplete="email"    
                                                inputProps={{ maxLength: 15 }}
                                                className={classes.input}
                                                variant="outlined"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment>
                                                            <PersonIcon />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        <DialogContentText style={{marginLeft:"2vh"}}>
                                        Security Question:
                                        Which place were you born in ?
                                        </DialogContentText>
                                        <TextField
                                                required
                                                size="small"
                                                margin="normal"
                                                fullWidth
                                                id="email"
                                                placeholder="Secret key"
                                                label="secret key"
                                                textalign={"center"}
                                                name="secretkey"
                                                value={secretkey}
                                                onChange={handleChangeForSecretKey}
                                                autoComplete="off"    
                                                // autoFocus
                                                inputProps={{ maxLength: 15 }}
                                                className={classes.input}
                                                variant="outlined"
                                                validators={["required"]}
                                            />
                                        </DialogContent>
                                        {reset ?<div>
                                            
                                            <TextField
                                            style={{marginLeft:"5vh",
                                            width:"76vh"
                                        }}
                                                required
                                                size="small"
                                                margin="normal"
                                                fullWidth
                                                name="newpassword"
                                                value={new_password}
                                                placeholder="New password"
                                                type={showPassword ? 'text' : 'password'}
                                                id="password"
                                                onChange={handleChangeForNewPassword}
                                                pattern={"^(?=.*?[!@#$%^&*(),.?\":{}|<>]).+$"}  
                                                autoComplete="new-password"
                                                inputProps={{ maxLength: 15 }}
                                                label="New password"
                                                className={classes.input}
                                                variant="outlined"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment>
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPassword}
                                                                onMouseDown={handleMouseDownPassword}
                                                                edge="end"
                                                                autoComplete="off"
                                                            >
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            /> 
                                            <TextField
                                            style={{marginLeft:"5vh",
                                            width:"76vh"
                                        }}
                                                required
                                                size="small"
                                                margin="normal"
                                                // fullWidth
                                                name="confirmpassword"
                                                value={confirm_password}
                                                placeholder="New password"
                                                type={showPassword1 ? 'text' : 'password'}
                                                id="password"
                                                onChange={handleChangeForConfirmPassword}
                                                pattern={"^(?=.*?[!@#$%^&*(),.?\":{}|<>]).+$"}  
                                                autoComplete="confirm-password"
                                                inputProps={{ maxLength: 15 }}
                                                label="Confirm password"
                                                className={classes.input}
                                                variant="outlined"
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment>
                                                            <IconButton
                                                                aria-label="toggle password visibility"
                                                                onClick={handleClickShowPassword1}
                                                                onMouseDown={handleMouseDownPassword}
                                                                edge="end"
                                                                autoComplete="off"
                                                            >
                                                                {showPassword1 ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />

                                    {error?
                                   <div style={{ color: "red",marginLeft:"5vh",whiteSpace:"normal"}}>
                                   {error}</div>:<></>}
                                            </div>:<></>}
                                        {reset ?
                                            <DialogActions>
                                            <Button onClick={resetpasword} color="primary" style={{backgroundColor:"blue",color:"white"}}>
                                                Submit
                                            </Button>
                                            <Button onClick={handleClose}>
                                                Close
                                            </Button>
                                            </DialogActions>
                                            :
                                            <DialogActions>
                                                <Button onClick={forgotpasword} color="primary" style={{backgroundColor:"blue",color:"white"}}>
                                                    Submit
                                                </Button>
                                                <Button onClick={handleClose} >
                                                    Close
                                                </Button>
                                            </DialogActions>
                                         }
                                    </Dialog>
                                    <SemanticToastContainer position="top-center" />
    </>
  );
}
