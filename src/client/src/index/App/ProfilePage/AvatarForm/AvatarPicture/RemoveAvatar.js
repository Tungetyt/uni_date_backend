import { ButtonGroup } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import React, { useContext, useState } from "react";
import { DEFAULT_SPACE } from "../../../../shared/constants";
import { LoadingContext } from "../../../../shared/loadingContext";
import { UserContext } from "../../../../shared/userContext";
import DeleteIcon from "@material-ui/icons/Delete";
import WarningIcon from "@material-ui/icons/Warning";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import PlaceHolder from "../../../ChatPage/shared/Missing_avatar.svg";
import { deletePicture } from "../../../../shared/api";

const RemoveAvatar = ({
  chosenFileName,
  setChosenFileName,
  setActiveStep,
  setAvatarPicture,
}) => {
  const [user, setUser] = useContext(UserContext);

  const [isLoading, setIsLoading] = useContext(LoadingContext);

  const [isAvatarReadyToDelete, setIsAvatarReadyToDelete] = useState(false);
  const handleRemovePictureClick = () => {
    setIsLoading(true);
    deletePicture(chosenFileName)
      .then((res) => {
        const { data } = res;
        if (!res?.data?.isRemoved) {
          return;
        }
      })
      .catch((e) => {})
      .finally(() => {
        setIsLoading(false);
      });
    const filteredPictures = user.pictures.filter(
      (p) => p.fileName !== chosenFileName
    );

    setUser((prevUser) => {
      return { ...prevUser, pictures: filteredPictures };
    });

    setIsAvatarReadyToDelete(false);

    if (user.pictures.find((p) => p.fileName === chosenFileName).isAvatar) {
      setAvatarPicture(PlaceHolder);
    }
    setChosenFileName(
      (filteredPictures.length > 0 && filteredPictures[0].fileName) || ""
    );
    setActiveStep(0);

    return () => {
      setIsLoading(false);
    };
  };

  return (
    <div style={{ paddingBottom: DEFAULT_SPACE }}>
      {!isAvatarReadyToDelete ? (
        <Button
          color="secondary"
          variant="contained"
          fullWidth
          type="submit"
          onClick={() => setIsAvatarReadyToDelete(true)}
          size="small"
          startIcon={<DeleteIcon></DeleteIcon>}
          disabled={isLoading}
        >
          REMOVE CURRENT PICTURE
        </Button>
      ) : (
        <ButtonGroup fullWidth>
          <Button
            color="secondary"
            variant="contained"
            fullWidth
            size="small"
            onClick={handleRemovePictureClick}
            startIcon={<WarningIcon></WarningIcon>}
            disabled={isLoading}
          >
            YES, REMOVE PICTURE ABOVE
          </Button>
          <Button
            color="primary"
            variant="contained"
            fullWidth
            size="small"
            onClick={() => setIsAvatarReadyToDelete(false)}
            endIcon={<KeyboardBackspaceIcon></KeyboardBackspaceIcon>}
            disabled={isLoading}
          >
            NO
          </Button>
        </ButtonGroup>
      )}
    </div>
  );
};

export default RemoveAvatar;
