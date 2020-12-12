import mongoose from 'mongoose';

import {
    attachExitTasks, connectToDatabaseServer, connectToMessagingServer, startHttpServer
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
const tracesSampleRate = parseInt(process.env.SENTRY_SAMPLE_RATE, 10) || 0;
console.info(`Sending ${tracesSampleRate * 100}% of events to Sentry`);

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

  tracesSampleRate: tracesSampleRate,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(Sentry.Handlers.errorHandler());

/**
 * Get environment variables
 */
const {
  NODE_ENV,
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  SURVEY_MONGO_URI,
  SURVEY_DB_USER,
  SURVEY_DB_PASS,
  MONGO_URI,
  DB_USER,
  DB_PASS,
  JWT_KEY,
  PORT,
  QUEUE_GROUP_NAME,
} = process.env;

console.info(`Node environment`, process.version, NODE_ENV);

if (!NATS_CLIENT_ID) {
  throw new Error(`NATS_CLIENT_ID must be defined`);
}
if (!NATS_URL) {
  throw new Error(`NATS_URL must be defined`);
}
if (!NATS_CLUSTER_ID) {
  throw new Error(`NATS_CLUSTER_ID must be defined`);
}
if (!SURVEY_MONGO_URI && !MONGO_URI) {
  throw new Error(`SURVEY_MONGO_URI or MONGO_URI must be defined`);
}
if (!SURVEY_DB_USER && !DB_USER) {
  throw new Error(`SURVEY_DB_USER or DB_USER must be defined`);
}
if (!SURVEY_DB_PASS && !DB_PASS) {
  throw new Error(`SURVEY_DB_PASS or DB_PASS must be defined`);
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
      SURVEY_MONGO_URI || MONGO_URI,
      SURVEY_DB_USER || DB_USER,
      SURVEY_DB_PASS || DB_PASS,
      "survey"
    ),
  ]);

  // start http server
  const httpExitTask = await startHttpServer(app, parseInt(PORT, 10));
  exitTasks.push(httpExitTask);

  attachExitTasks(process, exitTasks);
})();
