import express, {
  NextFunction,
  Request, Response, Router,
} from 'express';

import StatusCodes from 'http-status-codes';
import { authenticate } from '@middleware/middleware';
import { IRequestWithPayload } from '@shared/constants';
import path from 'path';
import app from '@server';
import morgan from 'morgan';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import UserDao from '@daos/User/UserDao';
import { IPicture } from '@interfaces/IPicture';
import { Picture } from '@entities/Picture';
import { IUser } from '@interfaces/IUser';
import PictureDao from '@daos/Picture/PictureDao';

const { promisify } = require('util');
const fs = require('fs');

const unlinkAsync = promisify(fs.unlink);

const router = Router();
const {
  BAD_REQUEST, CREATED, OK, UNAUTHORIZED, INTERNAL_SERVER_ERROR,
} = StatusCodes;
const multer = require('multer');

const {
  NODE_ENV, DATABASE_URL, LOCAL_DATABASE_URL, TOKEN_SECRET,
} = process.env;

let mainDirName: string;

if (NODE_ENV === 'development') {
  // Show routes called in console during development
  mainDirName = 'src';
} else if (NODE_ENV === 'production') {
  mainDirName = 'dist';
}

const storage = multer.diskStorage({
  destination: (req:any, file:any, cb:any) => {
    cb(null, `${mainDirName}/uploads`);
  },
  filename: (req:any, file:any, cb:any) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});
const fileFilter = (req:any, file:any, cb:any) => {
  if (file.mimetype === 'image/jpeg'
      || file.mimetype === 'image/jpg'
      || file.mimetype === 'image/gif'
      || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
export const upload = multer({ storage, fileFilter });
// upload.array('images', 12)  upload.array('image')
router.post('/', upload.array('files'), authenticate, async (req: any, res: Response) => {
  try {
    const userDao = new UserDao();
    const foundUser = await userDao.findOneById(req?.body?.payload?.id)
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR).json(`Error: ${err}`);
      });
    if (foundUser) {
      const newPictures: IPicture[] = req.files.map((f: any, i: number) => {
        const newPicture = new Picture();
        newPicture.order = i;
        newPicture.fileName = f.filename;
        newPicture.user = foundUser!;
        newPicture.isAvatar = false;
        return newPicture;
      });
      const pictureDao = new PictureDao();
      await pictureDao.add(newPictures);
    } else {
      res.status(INTERNAL_SERVER_ERROR).end();
    }
  } catch (e) {
    console.log(`error${e}`);
  }
  res.end();
});

router.post('/getone', authenticate, async (req: any, res: Response, next:NextFunction) => {
  const options = {
    root: path.join(__dirname, '/../uploads'),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true,
    },
  };

  const { fileName } = req.body;
  res.sendFile(fileName, options, (err) => {
    if (err) {
      next(err);
    } else {
      console.log('Sent:', fileName);
    }
  });
});

router.delete('/', authenticate, async (req: any, res: Response) => {
  // Delete the file like normal
  // await unlinkAsync(req.file.path);
  res.end();
});

export default router;
