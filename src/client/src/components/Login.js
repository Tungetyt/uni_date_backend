import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { login } from "../api";
import { Grid, IconButton, Input, InputAdornment } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";

const validationSchema = yup.object({
  email: yup
    .string("Enter your email")
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string("Enter your password")
    .min(8, "Password should be of minimum 8 characters length")
    .required("Password is required"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const formik = useFormik({
    initialValues: {
      email: "domestos@gmail.com",
      password: "domestos",
    },
    validationSchema: validationSchema,
    // onSubmit: async (values) => {
    //   console.log('formik 1', formik.isSubmitting)
    //   formik.setSubmitting(true);
    //
    //   await setTimeout(()=>{
    //     formik.setSubmitting(false);
    //     console.log('formik 2', formik.isSubmitting)
    //   }, 2000)
    //   await login(values);
    //   console.log('formik 3', formik.isSubmitting)
    //
    // },
    onSubmit: async (values, { setSubmitting }) => {
      await login(values);

      //.then(
      //     async (u) => {
      //       await setTimeout(()=>{
      //         setSubmitting(false);
      //
      //         console.log('formik 2', formik.isSubmitting)
      //           }, 2000)
      //     },
      // ).catch((e) => console.log(e));
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
        />
        <br />
        <br />
        {/*<TextField*/}
        {/*  fullWidth*/}
        {/*  id="password"*/}
        {/*  name="password"*/}
        {/*  label="Password"*/}
        {/*  type="password"*/}
        {/*  value={formik.values.password}*/}
        {/*  onChange={formik.handleChange}*/}
        {/*  error={formik.touched.password && Boolean(formik.errors.password)}*/}
        {/*  helperText={formik.touched.password && formik.errors.password}*/}
        {/*/>*/}
        <Grid
          container
          // spacing={0}
          direction="row"
          alignItems="center"
          justify="center"
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
            />
          </Grid>
          <Grid item>
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          </Grid>
        </Grid>
        <br />
        <Button
          color="primary"
          variant="contained"
          fullWidth
          type="submit"
          disabled={formik.isSubmitting}
        >
          Log In
        </Button>
      </form>
    </div>
  );
};

export default Login;
