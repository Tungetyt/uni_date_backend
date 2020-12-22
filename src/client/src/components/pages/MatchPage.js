import React, {useContext, useEffect, useState} from "react";
import { compareFileNames, getItemByKey } from "../../shared/functions";
import {
    AVATAR_SIZE, EMPTY_USER,
    LOCAL_STORAGE_KEY,
    THEME_NAMES,
} from "../../shared/constants";
import { getPicture, getProfiles, getUser } from "../../api";
import { LoadingContext } from "../../context/loadingContext";
import { ProfilesContext } from "../../context/profilesContext";
import { Avatar, Card, Grid, IconButton, Typography } from "@material-ui/core";
import PlaceHolder from "../../images/Missing_avatar.svg";
import CenterPaperHOC from "../hocs/CenterPaperHOC";
import Zoom from "@material-ui/core/Zoom";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import RegisterForm from "../forms/RegisterForm";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
const Transition = React.forwardRef((props, ref) => (
  <Zoom ref={ref} {...props} />
));

const MatchPage = () => {
  const [isLoading, setIsLoading] = useContext(LoadingContext);
  const [profiles, setProfiles] = useContext(ProfilesContext);
  const [areMoreProfilesNeeded, setAreMoreProfilesNeeded] = useState(null)

  useEffect(() => {
  if(profiles && profiles.length > 0){
      return;
  }

    let mounted = true;

    setIsLoading(true);

    getProfiles()
      .then((res) => {
        let profilesData = res.data;

        if (!(profilesData && mounted)) {
          throw new Error();
        }

        let usersAvatarsPromises = profilesData
          .map((pd) => {
            const picture = pd.pictures.find((p) => p.isAvatar);
            if (picture) {
              return picture.fileName;
            }
            return null;
          })
          .filter((fileNameOrUndefined) => fileNameOrUndefined)
          .map((fileName) => {
            return getPicture(fileName);
          });

        console.log("profilesData 0 ", profilesData, usersAvatarsPromises);
        Promise.all(usersAvatarsPromises)
          .then((results) => {
            console.log("results", results);
            results.forEach((r) => {
              profilesData.find((pd) =>
                pd.pictures.find((p) => p.fileName === r.headers.filename)
              ).avatar = r.data;
            });
            console.log("profilesData", profilesData);
          })
          .catch((e) => {
            console.log("e", e);
            setIsLoading(false);
          })
          .finally(() => {
            setProfiles(profilesData);
            setIsLoading(false);
          });
      })
      .catch((e) => {
        console.log("err", e);
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [areMoreProfilesNeeded]);

  const defaultLayout = 12;

  const decideSm = () => {
    let autoLayout = defaultLayout;
    if (profiles.length === 2) {
      autoLayout = 6;
    } else if (profiles.length > 2) {
      autoLayout = 4;
    }
    return autoLayout;
  };

  const decideMd = () => {
    let autoLayout = defaultLayout;
    if (profiles.length === 2) {
      autoLayout = 6;
    } else if (profiles.length === 3) {
      autoLayout = 4;
    } else if (profiles.length > 3) {
      autoLayout = 3;
    }
    return autoLayout;
  };

  const [open, setOpen] = useState(false);
    const [chosenProfile, setChosenProfile] = useState(EMPTY_USER);

  const handleClickOpen = (profile) => {
      setChosenProfile(profile)
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {profiles && profiles.length > 0 && (
        <>
          <br />
          <br />
          <br />
          <CenterPaperHOC>
            <Grid
              container
              direction="row"
              alignItems="center"
              justify="center"
            >
              {profiles &&
                profiles.map((p, i) => (
                  <Grid
                    container
                    item
                    alignItems="center"
                    justify="center"
                    style={{ padding: "1rem" }}
                    key={i}
                    xs={12}
                    sm={decideSm()}
                    md={decideMd()}
                  >
                    <Grid item>
                      <IconButton onClick={(p) => handleClickOpen(p)}>
                        <Grid
                          container
                          direction="column"
                          alignItems="center"
                          justify="center"
                          style={{ padding: "2rem" }}
                        >
                          <Grid item>
                            {p.avatar ? (
                              <Avatar
                                alt={p.userName}
                                src={URL.createObjectURL(p.avatar)}
                                style={{
                                  height: AVATAR_SIZE,
                                  width: AVATAR_SIZE,
                                }}
                              />
                            ) : (
                              <Avatar
                                alt={p.userName}
                                src={PlaceHolder}
                                style={{
                                  height: AVATAR_SIZE,
                                  width: AVATAR_SIZE,
                                }}
                              />
                            )}
                          </Grid>
                          <Grid item>
                            <Typography
                              style={{ fontSize: "1.5rem", fontWeight: "bold" }}
                              paragraph
                            >
                              {p.userName}
                            </Typography>
                          </Grid>
                        </Grid>
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
            </Grid>
          </CenterPaperHOC>
        </>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="choose profile"
        TransitionComponent={Transition}
      >
        <DialogContent>test</DialogContent>
      </Dialog>
    </>
  );
};

export default MatchPage;
