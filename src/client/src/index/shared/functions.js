import { blue, grey, pink, yellow } from "@material-ui/core/colors";
import { BLUE_INTENSITY, PINK_INTENSITY, YELLOW_INTENSITY } from "./constants";

export const getItemByKey = (item) =>
  typeof window !== "undefined" && window.localStorage.getItem(item);

export function compareFileNames(a, b) {
  if (a.fileName < b.fileName) {
    return 1;
  }
  if (a.fileName > b.fileName) {
    return -1;
  }
  return 0;
}

export const capitalizeFirstLetter = (
  [first, ...rest],
  locale = navigator.language
) =>
  first && first.toLocaleUpperCase(locale) + rest.join("").toLocaleLowerCase();

export const calculateAge = (birthday) => {
  // console.log('birthday',birthday, typeof birthday)
  // if (!birthday) {
  //   return "";
  // }
  //
  // if (!(typeof birthday.getMonth === "function")) {
  //   birthday = new Date(birthday);
  // }
  //
  // let ageDifMs = Date.now() - birthday.getTime();
  // let ageDate = new Date(ageDifMs);
  //
  // return Math.abs(ageDate.getUTCFullYear() - 1970);
  var today = new Date();
  var birthDate = new Date(birthday);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const getGenderColor = (gender) => {
  let genderLowerCase;

  if (gender) {
    genderLowerCase = gender.toLocaleLowerCase();
  }

  switch (genderLowerCase) {
    case "male":
      return blue[BLUE_INTENSITY];
    case "female":
      return pink[PINK_INTENSITY];
    case "other":
      return yellow[YELLOW_INTENSITY];
    default:
      return grey["900"];
  }
};
