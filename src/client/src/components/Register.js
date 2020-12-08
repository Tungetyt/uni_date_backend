import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import RegisterForm from "./RegisterForm";

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
      >
        Create New Account
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Create New Account</DialogTitle>
        <DialogContent>
          {/*<DialogContentText>*/}
          {/*    Create New Account*/}
          {/*</DialogContentText>*/}
          {/*<TextField*/}
          {/*    autoFocus*/}
          {/*    margin="dense"*/}
          {/*    id="name"*/}
          {/*    label="Email Address"*/}
          {/*    type="email"*/}
          {/*    fullWidth*/}
          {/*/>*/}
          <RegisterForm></RegisterForm>
        </DialogContent>
        {/*<DialogActions>*/}
        {/*    <Button onClick={handleClose} color="primary">*/}
        {/*        Cancel*/}
        {/*    </Button>*/}
        {/*    <Button onClick={handleClose} color="primary">*/}
        {/*        Subscribe*/}
        {/*    </Button>*/}
        {/*</DialogActions>*/}
      </Dialog>
    </div>
  );
}
