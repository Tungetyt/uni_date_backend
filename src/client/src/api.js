const axios = require("axios");

// Make a request for a user with a given ID
export const insertUniversity = (university) => {
  axios
    .get(`university/${university}`)
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};

export const insertUniversityWithRoute = (university) => {
  axios
    .get(`api/universities/${university}`)
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};

export const insertUniversityWithRoutePOST = (university) => {
  axios
    .post("api/universities/add", {
      name: university,
    })
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};

export const login = (user) => {
  console.log(user);
  return axios.post("api/auth/login", {
    email: user.email,
    password: user.password,
  });
  // .then((response) => {
  //   // handle success
  //   console.log(response);
  // })
  // .catch((error) => {
  //   // handle error
  //   console.log(error);
  // })
  // .then(() => {
  //   // always executed
  // });
};

export const secret = () => {
  axios
    .post("api/auth/secret")
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};

export const refresh = () => {
  axios
    .post("api/auth/refresh")
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};

export const register = (user) => {
  axios
    .post("api/auth/register", {
      email: user.email,
      password: user.password,
      passwordConfirmation: user.passwordConfirmation,
    })
    .then((response) => {
      // handle success
      console.log(response);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    })
    .then(() => {
      // always executed
    });
};