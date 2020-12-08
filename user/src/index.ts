import mongoose from 'mongoose';

import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { app } from './app';
import { UserCreatedListener, UserUpdatedEmailListener } from './modules/track-auth/track-auth';
import {
    GenreUpdatedListener, MediaItemUpdatedListener
} from './modules/track-ingest/track-ingest';
import { natsWrapper } from './nats-wrapper';

/**
 * Error & performance tracking
 */
Sentry.init({
  integrations: [
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
  USER_DB_USER,
  USER_DB_PASS,
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
if (!USER_DB_USER && !DB_USER) {
  throw new Error(`USER_DB_USER or DB_USER must be defined`);
}
if (!USER_DB_PASS && !DB_PASS) {
  throw new Error(`USER_DB_PASS or DB_PASS must be defined`);
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
  // connect to messaging server
  await natsWrapper.connect(NATS_CLUSTER_ID, NATS_CLIENT_ID, NATS_URL);
  natsWrapper.client.on("close", () => {
    console.info(`NATS connection closed!`);
    process.exit();
  });
  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  // listen to events
  [
    // track auth
    UserCreatedListener,
    UserUpdatedEmailListener,
    // track ingest
    GenreUpdatedListener,
    MediaItemUpdatedListener,
  ].forEach((Listener) => new Listener(natsWrapper.client).listen());

  // connect to database server
  await mongoose.connect(MONGO_URI, {
    dbName: "user",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    user: USER_DB_USER || DB_USER,
    pass: USER_DB_PASS || DB_PASS,
  });
  console.info(`Connected to MongoDb`);

  // start http server
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  app.listen(PORT, () => {
    console.info(`Listening on port ${PORT}`);
  });
})();
