import logger from '@shared/Logger';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import StatusCodes from 'http-status-codes';
import morgan from 'morgan';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import path from 'path';
import cors from 'cors';
import BaseRouter from './routes';

const {
  NODE_ENV, DATABASE_URL, LOCAL_DATABASE_URL,
} = process.env;
console.log('NODE_ENV1',NODE_ENV)

const app = express();

const { BAD_REQUEST } = StatusCodes;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let mainDirName;

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));

  mainDirName = 'src';
} else if (NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  mainDirName = 'dist';
}

let ormConfig = {
  type: 'postgres',
  url: DATABASE_URL || LOCAL_DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [
    `${mainDirName}/entities/*.*`,
  ],
  migrations: [
    `${mainDirName}/migration/*.*`,
  ],
  subscribers: [
    `${mainDirName}/subscriber/*.*`,
  ],
  cli: {
    entitiesDir: `${mainDirName}/entities`,
    migrationsDir: `${mainDirName}/migration`,
    subscribersDir: `${mainDirName}/subscriber`,
  },
  ssl: NODE_ENV === 'production',
  extra: NODE_ENV === 'production' ? {
    ssl: {
      rejectUnauthorized: false,
    },
  } : {}
};

createConnection(ormConfig as any).then(async (connection) => {
  app.use('/api', BaseRouter);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.err(err, true);
    return res.status(BAD_REQUEST).json({
      error: err.message,
    });
  });
    app.use(express.static(path.join(__dirname, 'client/build')));
    app.get('*', (req, res) => {
      console.log('NODE_ENV5',NODE_ENV)  
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}).catch((error) => console.log('TypeORM connection error: ', error));

export default app;
