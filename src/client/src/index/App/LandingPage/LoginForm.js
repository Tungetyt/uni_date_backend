import { Grid } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import { useFormik } from "formik";
import React, { useContext, useState } from "react";
import * as yup from "yup";
import PasswordVisibilityBtn from "../shared/PasswordVisibilityBtn";
import { getPicture, getUser, login } from "../../shared/api";
import { BASIC_VALIDATION, DEFAULT_SPACE } from "../../shared/constants";
import { compareFileNames } from "../../shared/functions";
import { LoadingContext } from "../../shared/loadingContext";
import { UserContext } from "../../shared/userContext";
const validationSchema = yup.object(BASIC_VALIDATION);

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [areCredentialsCorrect, setAreCredentialsCorrect] = useState(true);

  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const [user, setUser] = useContext(UserContext);
  const [isLoading, setIsLoading] = useContext(LoadingContext);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleCredentials = (status) => {
    setIsLoading(status);
    setAreCredentialsCorrect(status);
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      handleCredentials(true);

      const formattedValues = {
        ...values,
        email: values.email.trim(),
      };
      login(formattedValues)
        .then(() => {
          getUser()
            .then((res) => {
              const { data } = res;

              if (!data.email) {
                throw new Error();
              }

              let userData = data;
              let promises = data.pictures.map((p) => {
                return getPicture(p.fileName);
              });

              Promise.all(promises)
                .then((results) => {
                  const picturesDataWithBlobs = results
                    .map((r) => {
                      const fileName = r.headers.filename;
                      return {
                        blob: r.data,
                        fileName,
                        isAvatar: data.pictures.find(
                          (p) => p.fileName === fileName
                        ).isAvatar,
                      };
                    })
                    .sort(compareFileNames);

                  userData = {
                    ...userData,
                    pictures: picturesDataWithBlobs,
                  };
                })
                .catch((e) => {
                  setAreCredentialsCorrect(false);
                })
                .finally(() => {
                  setUser(userData);
                  setIsLoading(false);
                });
            })
            .catch((e) => {
              handleCredentials(false);
            });
        })
        .catch((e) => {
          handleCredentials(false);
        });
    },
  });

  return (
    <div>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          autoFocus
          size="small"
          style={{ marginBottom: DEFAULT_SPACE }}
        />

        <Grid
          container
          direction="row"
          alignItems="center"
          justify="center"
          wrap="nowrap"
          style={{ marginBottom: DEFAULT_SPACE }}
        >
          <Grid item>
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              size="small"
            />
          </Grid>
          <Grid item>
            <PasswordVisibilityBtn
              showPassword={showPassword}
              handleClickShowPassword={handleClickShowPassword}
              handleMouseDownPassword={handleMouseDownPassword}
            ></PasswordVisibilityBtn>
          </Grid>
        </Grid>

        {!areCredentialsCorrect && !isLoading && (
          <>
            <p style={{ color: "rgb(204,0,0)" }}>
              No user with this email and password
            </p>
          </>
        )}
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting || isLoading}
          size="small"
          startIcon={<ArrowForwardIcon></ArrowForwardIcon>}
          endIcon={<ArrowForwardIcon></ArrowForwardIcon>}
        >
          LOG IN
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
