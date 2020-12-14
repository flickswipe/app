import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';
import useragent from 'express-useragent';

import { errorHandler, NotFoundError } from '@flickswipe/common';

import { tokensConsumeRouter } from './routes/token-consume';
import { usersCreateRouter } from './routes/user-create';
import { usersSendAddEmailLinkRouter } from './routes/user-send-add-email-link';
import { usersSendMagicLinkRouter } from './routes/user-send-magic-link';
import { usersSignOutRouter } from './routes/user-sign-out';

const SESSION_LENGTH_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Configure express app
 */
const app = express();

// we're behind a load balancer
app.set("trust proxy", true);

// set req.useragent
// @see https://www.npmjs.com/package/express-useragent
app.use(useragent.express());

// parse json from body
app.use(json());

// set cookies on req.session
const cookieSessionOptions = {
  expires: new Date(new Date().getTime() + SESSION_LENGTH_MS),
  signed: false,
  secure: false,
};

if (process.env.NODE_ENV === "production") {
  Object.assign(cookieSessionOptions, {
    domain: process.env.HOST,
    path: "/api/",
    sameSite: "strict",
    secure: true,
  });
}

app.use(cookieSession(cookieSessionOptions));

/**
 * Configure routes
 */
app.use(tokensConsumeRouter);
app.use(usersCreateRouter);
app.use(usersSendAddEmailLinkRouter);
app.use(usersSendMagicLinkRouter);
app.use(usersSignOutRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

/**
 * Configure error handler
 */
app.use(errorHandler);

/**
 * Export
 */
export { app };
