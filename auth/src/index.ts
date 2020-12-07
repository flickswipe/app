import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import { RewriteFrames } from "@sentry/integrations";

import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./nats-wrapper";

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
  AUTH_DB_USER,
  AUTH_DB_PASS,
  DB_USER,
  DB_PASS,
  MONGO_URI,
  JWT_KEY,
  PORT,
  HOST,
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
if (!AUTH_DB_USER && !DB_USER) {
  throw new Error(`AUTH_DB_USER or DB_USER must be defined`);
}
if (!AUTH_DB_PASS && !DB_PASS) {
  throw new Error(`AUTH_DB_PASS or DB_PASS must be defined`);
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
if (!HOST) {
  throw new Error(`HOST must be defined`);
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
    console.log(`NATS connection closed!`);
    process.exit();
  });
  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  // connect to database server
  await mongoose.connect(MONGO_URI, {
    dbName: "auth",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    user: AUTH_DB_USER || DB_USER,
    pass: AUTH_DB_PASS || DB_PASS,
  });
  console.log(`Connected to MongoDb`);

  // start http server
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use(Sentry.Handlers.errorHandler());

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
})();
