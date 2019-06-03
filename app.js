import express from 'express';
import logger from 'morgan';

import indexRouter from './routes/index';

const app = express();

// Logger set for dev and prod env
let loggerMiddleware;
if (process.env.NODE_ENV === 'development') loggerMiddleware = logger('dev');
else loggerMiddleware = logger('combined');

// Middleware configuration
app.use(loggerMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting routes
app.use('/', indexRouter);

module.exports = app;
