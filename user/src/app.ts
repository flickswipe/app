import 'express-async-errors';

import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import express from 'express';

import { errorHandler, NotFoundError } from '@flickswipe/common';

import { relationshipsAcceptRouter } from './routes/relationships-accept';
import { relationshipsBlockRouter } from './routes/relationships-block';
import { relationshipsCancelRouter } from './routes/relationships-cancel';
import { relationshipsGetAllRouter } from './routes/relationships-get-all';
import { relationshipsRejectRouter } from './routes/relationships-reject';
import { relationshipsRequestRouter } from './routes/relationships-request';
import { relationshipsUnblockRouter } from './routes/relationships-unblock';
import { settingsGetAllRouter } from './routes/settings-get-all';
import { settingsUpdateManyRouter } from './routes/settings-update-many';

/**
 * Configure express app
 */
const app = express();

// we're behind a load balancer
app.set("trust-proxy", true);

// parse json from body
app.use(json());

// set cookies on req.session
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);

/**
 * Configure routes
 */

app.use(relationshipsGetAllRouter);
app.use(settingsGetAllRouter);
app.use(relationshipsAcceptRouter);
app.use(relationshipsBlockRouter);
app.use(relationshipsCancelRouter);
app.use(relationshipsRequestRouter);
app.use(relationshipsRejectRouter);
app.use(relationshipsUnblockRouter);
app.use(settingsUpdateManyRouter);

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
