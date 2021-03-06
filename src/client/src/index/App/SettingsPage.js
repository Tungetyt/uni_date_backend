import { Grid, Paper } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { MeetingRoom } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import Cookies from "universal-cookie";
import {
  EMPTY_PROFILES,
  EMPTY_USER,
  LOCAL_STORAGE_KEY,
  NAVIGATION,
} from "../shared/constants";
import { MatchesContext } from "../shared/matchesContext";
import { PathContext } from "../shared/pathContext";
import { ProfilesContext } from "../shared/profilesContext";
import { UserContext } from "../shared/userContext";
import ColorBtnCorner from "./SettingsPage/ColorBtnCorner";
import useTransparentPaperStyle from "./shared/useTransparentPaperStyle";
import EmailChangeForm from "./SettingsPage/EmailChangeForm";
import LabelValuePrinter from "./shared/LabelValuePrinter";
import PasswordChangeForm from "./SettingsPage/PasswordChangeForm";
import { LoadingContext } from "../shared/loadingContext";
const SettingsPage = () => {
  const [user, setUser] = useContext(UserContext);
  const [profiles, setProfiles] = useContext(ProfilesContext);
  const [matches, setMatches] = useContext(MatchesContext);
  const [path, setPath] = useContext(PathContext);
  const [isLoading] = useContext(LoadingContext);

  const paper = useTransparentPaperStyle();
  const history = useHistory();
  const { profile, settings } = NAVIGATION;

  const handleLogOut = () => {
    const cookies = new Cookies();
    cookies.remove(LOCAL_STORAGE_KEY.jwtToken);
    setUser(EMPTY_USER);
    setProfiles(EMPTY_PROFILES);
    setMatches(EMPTY_PROFILES);
    setPath(profile);
    history.push(`/`);
  };
  const { deleteaccount } = NAVIGATION;
  const handleDeleteAccount = () => {
    history.push(`/${settings}/${deleteaccount}`);
  };
  return (
    <>
      <ColorBtnCorner></ColorBtnCorner>

      <Grid
        container
        direction="column"
        alignItems="center"
        justify="center"
        spacing={1}
      >
        <Grid item>
          <Paper className={paper}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              onClick={handleLogOut}
              size="small"
              startIcon={<MeetingRoom></MeetingRoom>}
              disabled={isLoading}
            >
              LOG OUT
            </Button>
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={paper}>
            <LabelValuePrinter
              label="Current Email"
              value={`: ${user.email}`}
            ></LabelValuePrinter>
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={paper}>
            <EmailChangeForm></EmailChangeForm>
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={paper}>
            <PasswordChangeForm></PasswordChangeForm>
          </Paper>
        </Grid>

        <Grid item>
          <Paper className={paper}>
            <Button
              color="secondary"
              variant="contained"
              fullWidth
              type="submit"
              onClick={handleDeleteAccount}
              size="small"
              startIcon={<DeleteIcon></DeleteIcon>}
              disabled={isLoading}
            >
              DELETE ACCOUNT
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default SettingsPage;
