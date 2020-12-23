import React, { useContext, useEffect, useState } from "react";
import {
  capitalizeFirstLetter,
  compareFileNames,
  getItemByKey,
} from "../../shared/functions";
import {
  AVATAR_SIZE,
  DEFAULT_PADDING,
  EMPTY_USER,
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
import MatchGallery from "../other/MatchGallery";
import { blue, pink } from "@material-ui/core/colors";
const Transition = React.forwardRef((props, ref) => (
  <Zoom ref={ref} {...props} />
));

const MatchPage = () => {
  const [isLoading, setIsLoading] = useContext(LoadingContext);
  const [profiles, setProfiles] = useContext(ProfilesContext);
  const [areMoreProfilesNeeded, setAreMoreProfilesNeeded] = useState(null);

  const checkIfProfilesAlreadyFetched = () => profiles && profiles.length > 0;

  useEffect(() => {
    if (checkIfProfilesAlreadyFetched()) {
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

        Promise.all(usersAvatarsPromises)
          .then((results) => {
            results.forEach((r) => {
              profilesData.find((pd) =>
                pd.pictures.find((p) => p.fileName === r.headers.filename)
              ).avatar = r.data;
            });
          })
          .catch((e) => {
            setIsLoading(false);
          })
          .finally(() => {
            setProfiles(profilesData);
            setIsLoading(false);
          });
      })
      .catch((e) => {
        setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [areMoreProfilesNeeded]);


  const [open, setOpen] = useState(false);
  const [chosenProfilesId, setChosenProfilesId] = useState("");

  const handleClickOpen = (profileId) => {
    setChosenProfilesId(profileId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const getGenderColor = (gender) => {
    const genderLowerCase = gender.toLocaleLowerCase();
    if (genderLowerCase === "male") {
      return blue["500"];
    } else if (genderLowerCase === "female") {
      return pink["400"];
    }
  };

  return (
    <>
      {checkIfProfilesAlreadyFetched() && (
        <>
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
                    item

                    style={{ padding: DEFAULT_PADDING }}
                    key={i}

                  >
                    <Grid item>
                      <IconButton onClick={() => handleClickOpen(p.id)}>
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
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: "bold",
                                color: getGenderColor(p.gender),
                              }}
                              paragraph
                            >
                              {capitalizeFirstLetter(p.userName)}
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
        <DialogContent>

          <MatchGallery profileId={chosenProfilesId}></MatchGallery>
          <Typography>{profiles.find(p => p.id === chosenProfilesId)?.userName || ""}</Typography>
          <Typography>{profiles.find(p => p.id === chosenProfilesId)?.userName || ""}</Typography>
      </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchPage;
