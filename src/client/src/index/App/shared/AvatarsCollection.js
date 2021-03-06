import { Avatar, Grid, IconButton, Typography } from "@material-ui/core";
import React, { useContext, useEffect } from "react";
import {
  AVATAR_SIZE,
  DEFAULT_SPACE,
  LOCAL_STORAGE_KEY,
  THEME_NAMES,
} from "../../shared/constants";
import {
  capitalizeFirstLetter,
  getGenderColor,
  getItemByKey,
} from "../../shared/functions";
import PlaceHolder from "../ChatPage/shared/Missing_avatar.svg";
import { LoadingContext } from "../../shared/loadingContext";

const AvatarsCollection = ({ collection, handleClickOpen }) => {
  const [isLoading, setIsLoading] = useContext(LoadingContext);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <Grid container direction="row" alignItems="center" justify="center">
      {collection &&
        collection.map((p, i) => (
          <Grid item style={{ padding: DEFAULT_SPACE }} key={i}>
            <Grid item>
              <IconButton
                onClick={() => handleClickOpen(p.id)}
                color={"primary"}
              >
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
  );
};

export default AvatarsCollection;
