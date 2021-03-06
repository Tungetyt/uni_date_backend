import DateFnsUtils from "@date-io/date-fns";
import {
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Switch,
  TextField,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Slide from "@material-ui/core/Slide";
import PublishIcon from "@material-ui/icons/Publish";
import { Alert } from "@material-ui/lab";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import "date-fns";
import ChipInput from "material-ui-chip-input";
import React, { useContext, useReducer, useState } from "react";
import { updateUser } from "../../shared/api";
import {
  AUTO_HIDE_DURATION,
  DEFAULT_SPACE,
  STANDARD_MAX_WIDTH,
} from "../../shared/constants";
import { capitalizeFirstLetter } from "../../shared/functions";
import { LoadingContext } from "../../shared/loadingContext";
import { UserContext } from "../../shared/userContext";
import useTransparentPaperStyle from "../shared/useTransparentPaperStyle";

const genderEnum = {
  Male: 1,
  Female: 2,
  Other: 3,
};

const UserForm = () => {
  const [user, setUser] = useContext(UserContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);

  const paper = useTransparentPaperStyle();

  const initialState = {
    userName: (user.userName && capitalizeFirstLetter(user.userName)) || "",
    dateOfBirth:
      (user.dateOfBirth !== "1970-01-01" && user.dateOfBirth) || null,
    description: user.description || "",
    university:
      (user.university && capitalizeFirstLetter(user.university)) || "",
    city: (user.city && capitalizeFirstLetter(user.city)) || "",
    interests: user.interests || [],
    fieldOfStudy:
      (user.fieldOfStudy && capitalizeFirstLetter(user.fieldOfStudy)) || "",
    gender: user.gender || "",
    isGraduated: user.isGraduated || false,
  };

  function reducer(state, { field, value }) {
    return { ...state, [field]: value };
  }

  const [state, dispatch] = useReducer(reducer, initialState);

  const onChange = (e) => {
    const { name, value } = e.target;
    dispatch({ field: name, value });
  };

  const onDateChange = (value) => {
    dispatch({ field: "dateOfBirth", value });
  };

  const onInterestsChange = (value) => {
    dispatch({ field: "interests", value });
  };

  const {
    userName,
    description,
    gender,
    university,
    dateOfBirth,
    city,
    interests,
    fieldOfStudy,
    isGraduated,
  } = state;

  const onIsGraduatedChange = () => {
    dispatch({ field: "isGraduated", value: !isGraduated });
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isUpdatedCorrectly, setIsUpdatedCorrectly] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    setIsLoading(true);

    updateUser(state)
      .then((res) => {
        setUser({ ...user, ...state });
        setIsUpdatedCorrectly(true);
      })
      .catch((e) => {
        setIsUpdatedCorrectly(false);
      })
      .finally(() => {
        setIsLoading(false);
        setSnackbarOpen(true);
      });
  };

  let maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  return (
    <>
      <form noValidate autoComplete="off" onSubmit={onSubmit}>
        <Grid
          container
          direction="row"
          alignItems="flex-end"
          justify="center"
          spacing={1}
        >
          <Grid item>
            <Grid
              container
              direction="column"
              alignItems="flex-end"
              justify="center"
              style={{ maxWidth: STANDARD_MAX_WIDTH }}
            >
              <Grid item>
                <Paper
                  className={paper}
                  style={{ marginBottom: DEFAULT_SPACE }}
                >
                  <TextField
                    name="description"
                    label="Description"
                    multiline
                    fullWidth
                    rows={6}
                    value={description}
                    onChange={onChange}
                    variant="outlined"
                    size="small"
                    autoComplete="new-password"
                    onFocus={(event) => {
                      event.target.setAttribute("autocomplete", "off");
                    }}
                  />
                </Paper>
              </Grid>
              <Grid item>
                <Paper
                  className={paper}
                  style={{ marginBottom: DEFAULT_SPACE, zIndex: "1" }}
                >
                  <ChipInput
                    fullWidth
                    variant="filled"
                    name="interests"
                    label="Interests"
                    blurBehavior="add"
                    defaultValue={interests}
                    onChange={onInterestsChange}
                    size="small"
                  />
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid item style={{ maxWidth: STANDARD_MAX_WIDTH }}>
            <Grid item>
              <Paper className={paper} style={{ marginBottom: DEFAULT_SPACE }}>
                <TextField
                  name="university"
                  value={university}
                  label="University"
                  fullWidth
                  onChange={onChange}
                  size="small"
                  autoComplete="new-password"
                  onFocus={(event) => {
                    event.target.setAttribute("autocomplete", "off");
                  }}
                />
                {university && (
                  <>
                    <TextField
                      name="fieldOfStudy"
                      value={fieldOfStudy}
                      label="Field of study"
                      fullWidth
                      onChange={onChange}
                      size="small"
                      style={{ marginBottom: DEFAULT_SPACE }}
                      autoComplete="new-password"
                      onFocus={(event) => {
                        event.target.setAttribute("autocomplete", "off");
                      }}
                    />

                    <FormGroup row>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isGraduated}
                            onChange={onIsGraduatedChange}
                            name="isGraduated"
                            color="primary"
                            size="small"
                          />
                        }
                        label="Already graduated?"
                      />
                    </FormGroup>
                  </>
                )}
              </Paper>
            </Grid>
            <Paper className={paper} style={{ marginBottom: DEFAULT_SPACE }}>
              <TextField
                name="userName"
                value={userName}
                label="Name"
                fullWidth
                onChange={onChange}
                size="small"
                style={{ marginBottom: "1rem" }}
                autoComplete="new-password"
                onFocus={(event) => {
                  event.target.setAttribute("autocomplete", "off");
                }}
              />

              <TextField
                name="gender"
                select
                label="Gender"
                fullWidth
                value={gender}
                onChange={onChange}
                size="small"
              >
                {Object.entries(genderEnum).map(([k, v]) => (
                  <MenuItem key={v} value={k}>
                    {k}
                  </MenuItem>
                ))}
              </TextField>

              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <KeyboardDatePicker
                  name="dateOfBirth"
                  variant="inline"
                  format="dd/MM/yyyy"
                  margin="normal"
                  label="Date of birth"
                  value={dateOfBirth}
                  onChange={onDateChange}
                  fullWidth
                  maxDate={maxDate}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                  size="small"
                />
              </MuiPickersUtilsProvider>

              <TextField
                name="city"
                value={city}
                label="City"
                fullWidth
                onChange={onChange}
                size="small"
                autoComplete="new-password"
                onFocus={(event) => {
                  event.target.setAttribute("autocomplete", "off");
                }}
              />
            </Paper>
          </Grid>
        </Grid>
        <Paper className={paper}>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            type="submit"
            size="small"
            startIcon={<PublishIcon></PublishIcon>}
            disable={isLoading}
          >
            UPDATE DATA
          </Button>
        </Paper>
      </form>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={AUTO_HIDE_DURATION}
        onClose={handleSnackbarClose}
        TransitionComponent={Slide}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={isUpdatedCorrectly ? "success" : "error"}
        >
          {isUpdatedCorrectly
            ? "PROFILE DATA UPDATED"
            : "PROFILE DATA NOT UPDATED"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserForm;
