import React, { useContext } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import RegisterForm from "../forms/RegisterForm";
import Zoom from "@material-ui/core/Zoom";
import { Grid, Paper } from "@material-ui/core";
import { ColorContext } from "../../context/colorContext";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";

const Transition = React.forwardRef((props, ref) => (
  <Zoom ref={ref} {...props} />
));

export default function Register() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button
        color="primary"
        variant="contained"
        fullWidth
        onClick={handleClickOpen}
        size="small"
        startIcon={<ArrowUpwardIcon></ArrowUpwardIcon>}
        endIcon={<ArrowUpwardIcon></ArrowUpwardIcon>}
      >
        Create New Account
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        TransitionComponent={Transition}
      >
        <DialogTitle id="form-dialog-title">Create New Account</DialogTitle>
        <DialogContent>
          <RegisterForm></RegisterForm>
        </DialogContent>
      </Dialog>
    </div>
  );
}
