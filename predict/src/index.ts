import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";

import mongoose from "mongoose";
import {
  getNextUserToProcess,
  UserCreatedListener,
} from "./modules/generate-suggestions/generate-suggestions";
import { createSuggestions } from "./modules/generate-suggestions/generate-suggestions";

import { natsWrapper } from "./nats-wrapper";
import {
  GenreUpdatedListener,
  MediaItemDestroyedListener,
  MediaItemUpdatedListener,
} from "./modules/track-ingest/track-ingest";
import { MediaItemRatedListener } from "./modules/track-survey/track-survey";
import { UserUpdatedSettingListener } from "./modules/track-user-settings/track-user-settings";

/**
 * Error & performance tracking
 */
Sentry.init({
  integrations: [
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
  MONGO_URI,
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
if (!MONGO_URI) {
  throw new Error(`MONGO_URI must be defined`);
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

  // listen to events
  [
    // generate suggestions
    UserCreatedListener,
    // track-ingest
    GenreUpdatedListener,
    MediaItemDestroyedListener,
    MediaItemUpdatedListener,
    // track survey
    MediaItemRatedListener,
    // track user settings
    UserUpdatedSettingListener,
  ].forEach((Listener) => new Listener(natsWrapper.client).listen());

  // connect to database server
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log(`Connected to MongoDb`);

  // continuously generate suggestions
  const loop = async () => {
    console.log(`Generating user suggestions...`);
    const user = await getNextUserToProcess();

    if (!user) {
      console.log(`No users need suggestions, idling for 1 minute!`);
      setTimeout(loop, 60 * 1000);
      return;
    }

    await createSuggestions(user.id);
    setImmediate(loop);
  };

  loop();
})();
