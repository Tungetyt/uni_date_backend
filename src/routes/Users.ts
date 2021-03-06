import { Request, Response, Router } from 'express';

import UserDao from '@daos/User/UserDao';
import { User } from '@entities/User';

import StatusCodes from 'http-status-codes';

import { authenticate } from '@middleware/middleware';
import * as yup from 'yup';
import { City } from '@entities/City';
import { University } from '@entities/University';
import { Interest } from '@entities/Interest';
import {
  capitalizeFirstLetter,
  getDistanceFromLatLonInKm,
  removeCityAndUniversityFromCollection,
} from '@shared/functions';
import { GenderFilter } from '@entities/GenderFilter';
import { IUser } from '@interfaces/IUser';
import { initialMaxSearchDistance } from '@shared/constants';

global.Blob = require('node-blob');

const router = Router();
const {
  BAD_REQUEST, INTERNAL_SERVER_ERROR,
} = StatusCodes;

const userDao = new UserDao();

const filterValidation = {
  maxSearchDistanceFilter: yup.number(),
  genderFilter: yup.number(),
  universityFilter: yup.string(),
  interestFilter: yup.string(),
  cityFilter: yup.string(),
  genderFilters: yup.object(),
  yearsFilter: yup.array(),
};

const locationValidation = {
  latitude: yup.number().nullable(),
  longitude: yup.number().nullable(),
};

router.get('/', authenticate, async (req: Request, res: Response) => {
  const { id } = req?.body?.payload;
  const userViewData = await userDao.getUserViewDataByUserId(req?.body?.payload?.id)
    .catch((err: Error) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`).end();
    });
  if (!userViewData) {
    res.sendStatus(BAD_REQUEST).end();
  }
  const initGenderFilter = {
    Female: true,
    Male: true,
    Other: true,
  };

  const getGenderFilters = () => {
    if (!(
      userViewData
        && userViewData.genderFilters
        && Array.isArray(userViewData.genderFilters)
        && userViewData.genderFilters.length === 3
        && userViewData?.genderFilters[0].genderFilter)) {
      return initGenderFilter;
    }

    return {
      [userViewData?.genderFilters[0].genderFilter]: userViewData?.genderFilters[0].isLiking,
      [userViewData?.genderFilters[1].genderFilter]: userViewData?.genderFilters[1].isLiking,
      [userViewData?.genderFilters[2].genderFilter]: userViewData?.genderFilters[2].isLiking,
    };
  };

  const userDto = {
    ...userViewData,
    id,
    city: userViewData?.cityName?.cityName || '',
    cityFilter: userViewData?.cityFilter?.cityName || '',
    university: userViewData?.universityName?.universityName || '',
    universityFilter: userViewData?.universityFilter?.universityName || '',
    interestFilter: userViewData?.interestFilter?.interestName || '',
    genderFilters: getGenderFilters() || initGenderFilter,
    interests: (userViewData?.interests
        && userViewData?.interests.length > 0
        && userViewData?.interests.map((interest: any) => interest.interestName)) || [],
  };
  delete userDto.cityName;
  delete userDto.universityName;
  res.json(userDto).end();
});

router.post('/matches', authenticate, async (req: Request, res: Response) => {
  const {
    latitude,
    longitude,
  } = req.body;

  const schema = yup.object().shape(locationValidation);

  const isValid = await schema.isValid({
    latitude,
    longitude,
  });

  if (!isValid) {
    return res.status(BAD_REQUEST).end();
  }

  const matchesData = await userDao.findMatches(req.body.payload.id).catch((err: Error) => {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
  });

  if (!matchesData) {
    res.sendStatus(BAD_REQUEST).end();
  }

  const matchesDto = matchesData.map((pd: any) => ({
    ...pd,
    city: pd?.cityName?.cityName || '',
    university: pd?.universityName?.universityName || '',
    interests: (pd?.interests
        && pd?.interests.length > 0
        && pd?.interests.map((interest: any) => interest.interestName))
        || [],
    distance: Math.ceil(getDistanceFromLatLonInKm(
      latitude,
      longitude,
      pd.latitude,
      pd.longitude,
    )),
  }));

  removeCityAndUniversityFromCollection(matchesDto);

  res.json(matchesDto).end();
});

router.post('/deletematch', authenticate, async (req: Request, res: Response) => {
  const { payload, passiveSideUserId } = req.body;

  const schema = yup.object().shape(
    {
      passiveSideUserId: yup.string().required(),
    },
  );

  const isValid = await schema.isValid({ passiveSideUserId });
  if (!isValid) {
    return res.status(BAD_REQUEST).end();
  }

  await userDao.deleteMatch(payload?.id, passiveSideUserId).catch((err: Error) => {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
  });
  res.json({ isRemoved: true }).end();
});

router.post('/profiles', authenticate, async (req: Request, res: Response) => {
  const {
    payload,
    cityFilter,
    universityFilter,
    ageFromFilter,
    ageToFilter,
    maxSearchDistanceFilter,
    genderFilters,
    interestFilter,
    latitude,
    longitude,
  } = req.body;
  const schema = yup.object().shape({
    ...filterValidation,
    ...locationValidation,
  });
  const isValid = await schema.isValid({
    cityFilter,
    universityFilter,
    ageFromFilter,
    ageToFilter,
    maxSearchDistanceFilter,
    genderFilters,
    interestFilter,
    latitude,
    longitude,
  });
  if (!isValid) {
    return res.status(BAD_REQUEST).end();
  }

  let profilesData = await userDao.findProfiles(
    payload?.id,
    cityFilter,
    universityFilter,
    interestFilter,
    genderFilters,
    ageFromFilter,
    ageToFilter,
    maxSearchDistanceFilter,
  )
    .catch((err: Error) => {
      console.error(err);
      res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
    });

  if (!profilesData) {
    res.sendStatus(BAD_REQUEST).end();
  }

  let profilesDto: [];

  if (maxSearchDistanceFilter < initialMaxSearchDistance && latitude && longitude) {
    profilesData = profilesData.filter((pd:any) => getDistanceFromLatLonInKm(
      latitude,
      longitude,
      pd.latitude,
      pd.longitude,
    ) <= maxSearchDistanceFilter);
  }

  profilesDto = profilesData.map((pd: any) => ({
    ...pd,
    city: pd?.cityName?.cityName || '',
    university: pd?.universityName?.universityName || '',
    interests: (pd?.interests
        && pd?.interests.length > 0
        && pd?.interests.map((interest: any) => interest.interestName))
        || [],
    distance: Math.ceil(getDistanceFromLatLonInKm(
      latitude,
      longitude,
      pd.latitude,
      pd.longitude,
    )),
  }));

  removeCityAndUniversityFromCollection(profilesDto);
  res.json(profilesDto).end();
});

router.put('/', authenticate, async (req: Request, res: Response) => {
  const { user } = req.body;
  const { id } = req.body.payload;

  const schema = yup.object().shape(
    {
      ...filterValidation,
      email: yup.string().email(),
      userName: yup.string(),
      gender: yup.string(),
      dateOfBirth: yup.string().nullable(),
      description: yup.string(),
      isGraduated: yup.bool(),
      fieldOfStudy: yup.string(),
      interests: yup.array(),
    },
  );

  const isValid = await schema.isValid(user);
  if (!isValid) {
    return res.status(BAD_REQUEST).end();
  }

  const {
    userName,
    gender,
    dateOfBirth,
    description,
    email,
    maxSearchDistanceFilter,
    university,
    city,
    interests,
    isGraduated,
    fieldOfStudy,
    universityFilter,
    interestFilter,
    cityFilter,
    genderFilters,
    yearsFilter,
  } = user;

  const updatedUser = new User();
  updatedUser.id = id;
  if (userName) {
    updatedUser.userName = capitalizeFirstLetter(userName);
  }
  if (gender) {
    updatedUser.gender = capitalizeFirstLetter(gender);
  }
  if (dateOfBirth) {
    updatedUser.dateOfBirth = dateOfBirth;
  }
  if (description) {
    updatedUser.description = description;
  }
  if (email) {
    updatedUser.email = email;
  }
  if (maxSearchDistanceFilter) {
    updatedUser.maxSearchDistanceFilter = maxSearchDistanceFilter;
  }
  if (yearsFilter) {
    updatedUser.ageFromFilter = Math.min(...yearsFilter);
    updatedUser.ageToFilter = Math.max(...yearsFilter);
  }

  let newOrExistingUniversity = null;
  if (universityFilter) {
    const capitalizedUniversityFilter = capitalizeFirstLetter(universityFilter);
    updatedUser.universityFilter = capitalizedUniversityFilter;
    newOrExistingUniversity = new University();
    newOrExistingUniversity.universityName = capitalizedUniversityFilter;
  } else {
    updatedUser.universityFilter = null;
  }

  let newOrExistingInterest = null;
  if (interestFilter) {
    const lowerCaseInterestFilter = interestFilter.toLowerCase();
    updatedUser.interestFilter = lowerCaseInterestFilter;
    newOrExistingInterest = new Interest();
    newOrExistingInterest.interestName = lowerCaseInterestFilter;
  } else {
    updatedUser.interestFilter = null;
  }

  let newOrExistingCity = null;
  if (cityFilter) {
    const capitalizedCityFilter = capitalizeFirstLetter(cityFilter);
    updatedUser.cityFilter = capitalizedCityFilter;
    newOrExistingCity = new City();
    newOrExistingCity.cityName = capitalizedCityFilter;
  } else {
    updatedUser.cityFilter = null;
  }

  let newOrUpdatedGenderFilters = null;
  if (genderFilters) {
    newOrUpdatedGenderFilters = Object.keys(genderFilters)
      .map((key:any) => {
        const newGF = new GenderFilter();
        newGF.userId = id;
        newGF.genderFilter = capitalizeFirstLetter(key);
        newGF.isLiking = genderFilters[key];
        return newGF;
      });
  }

  let newOrUpdatedCity = null;
  if (city) {
    newOrUpdatedCity = new City();
    const capitalizedCity = capitalizeFirstLetter(city);
    newOrUpdatedCity.cityName = capitalizedCity;
    updatedUser.cityName = capitalizedCity;
  }

  let newOrUpdatedUniversity = null;
  if (university) {
    newOrUpdatedUniversity = new University();
    const capitalizedUniversity = capitalizeFirstLetter(university);
    newOrUpdatedUniversity.universityName = capitalizedUniversity;
    updatedUser.universityName = capitalizedUniversity;

    if (isGraduated) {
      updatedUser.isGraduated = isGraduated;
    }
    if (fieldOfStudy) {
      updatedUser.fieldOfStudy = capitalizeFirstLetter(fieldOfStudy);
    }
  }

  let newOrUpdatedInterests = null;
  if (interests) {
    newOrUpdatedInterests = interests.map((interest: string) => {
      const newInterest = new Interest();
      newInterest.interestName = interest;
      newInterest.users2 = [];
      newInterest.users2.push(updatedUser);
      return newInterest;
    });
  }

  const dbResult = userDao.update(
    updatedUser,
    newOrUpdatedCity,
    newOrUpdatedUniversity,
    newOrUpdatedInterests,
    newOrUpdatedGenderFilters,
    newOrExistingCity,
    newOrExistingInterest,
    newOrExistingUniversity,
  ).catch((err: Error) => {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
  });

  if (!dbResult) {
    res.sendStatus(BAD_REQUEST).end();
  }

  res.end();
});

router.delete('/', authenticate, async (req: Request, res: Response) => {
  await userDao.delete(req.body.payload.id).catch((err: Error) => {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
  });
  res.end();
});

router.put('/location', authenticate, async (req: Request, res: Response) => {
  const schema = yup.object().shape(
    {
      latitude: yup.number().required(),
      longitude: yup.number().required(),
    },
  );

  const isValid = await schema.isValid(req.body);
  if (!isValid) {
    return res.status(BAD_REQUEST).end();
  }

  const { latitude, longitude, payload } = req.body;
  const updatedUser: IUser = new User();
  updatedUser.id = payload.id;
  updatedUser.latitude = latitude;
  updatedUser.longitude = longitude;
  await userDao.update(
    updatedUser,
  ).catch((err: Error) => {
    console.error(err);
    res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`).end();
  });
  res.end();
});

export default router;
