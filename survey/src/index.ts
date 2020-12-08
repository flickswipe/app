import mongoose from 'mongoose';

import {
    attachExitTasks, connectToDatabaseServer, connectToMessagingServer
} from '@flickswipe/common';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { app } from './app';
import {
    GenreUpdatedListener, MediaItemDestroyedListener, MediaItemUpdatedListener
} from './modules/track-ingest/track-ingest';
import { MediaItemsSuggestedListener } from './modules/track-predict/track-predict';
import { natsWrapper } from './nats-wrapper';

/**
 * Error & performance tracking
 */
Sentry.init({
  integrations: [
    new Tracing.Integrations.Mongo(),
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({
      // @ts-ignore
      app,
    }),
    new RewriteFrames({
      root: __dirname || process.cwd(),
    }),
  ],

  tracesSampleRate: 1.0,
});

/**
 * Get environment variables
 */
const {
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  SURVEY_DB_USER,
  SURVEY_DB_PASS,
  DB_USER,
  DB_PASS,
  MONGO_URI,
  JWT_KEY,
  PORT,
  QUEUE_GROUP_NAME,
} = process.env;

if (!NATS_CLIENT_ID) {
  throw new Error(`NATS_CLIENT_ID must be defined`);
}
if (!NATS_URL) {
  throw new Error(`NATS_URL must be defined`);
}
if (!NATS_CLUSTER_ID) {
  throw new Error(`NATS_CLUSTER_ID must be defined`);
}
if (!SURVEY_DB_USER && !DB_USER) {
  throw new Error(`SURVEY_DB_USER or DB_USER must be defined`);
}
if (!SURVEY_DB_PASS && !DB_PASS) {
  throw new Error(`SURVEY_DB_PASS or DB_PASS must be defined`);
}
if (!MONGO_URI) {
  throw new Error(`MONGO_URI must be defined`);
}
if (!JWT_KEY) {
  throw new Error(`JWT_KEY must be defined`);
}
if (!PORT) {
  throw new Error(`PORT must be defined`);
}
if (!QUEUE_GROUP_NAME) {
  throw new Error(`QUEUE_GROUP_NAME must be defined`);
}

/**
 * Initialize
 */
(async () => {
  const exitTasks = await Promise.all([
    connectToMessagingServer(
      natsWrapper,
      NATS_CLUSTER_ID,
      NATS_CLIENT_ID,
      NATS_URL,
      [
        // track-ingest
        GenreUpdatedListener,
        MediaItemDestroyedListener,
        MediaItemUpdatedListener,
        // track prediect
        MediaItemsSuggestedListener,
      ]
    ),
    connectToDatabaseServer(
      mongoose,
      MONGO_URI,
      SURVEY_DB_USER || DB_USER,
      SURVEY_DB_PASS || DB_PASS,
      "survey"
    ),
  ]);

  attachExitTasks(exitTasks);

  // start http server
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`);
  });
})();
