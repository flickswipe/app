import mongoose from 'mongoose';

import {
    attachExitTasks, connectToDatabaseServer, connectToMessagingServer, scheduleOnce
} from '@flickswipe/common';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import {
    createSuggestions, getNextUserToProcess, UserCreatedListener
} from './modules/generate-suggestions/generate-suggestions';
import {
    countMediaItems, GenreUpdatedListener, MediaItemDestroyedListener, MediaItemUpdatedListener
} from './modules/track-ingest/track-ingest';
import { MediaItemRatedListener } from './modules/track-survey/track-survey';
import { UserUpdatedSettingListener } from './modules/track-user-settings/track-user-settings';
import { natsWrapper } from './nats-wrapper';

/**
 * Error & performance tracking
 */
const tracesSampleRate = parseInt(process.env.SENTRY_SAMPLE_RATE, 10) || 0;
console.info(`Sending ${tracesSampleRate * 100}% of events to Sentry`);

Sentry.init({
  integrations: [
    new Tracing.Integrations.Mongo(),
    new RewriteFrames({
      root: __dirname || process.cwd(),
    }),
  ],

  tracesSampleRate: tracesSampleRate,
});

/**
 * Get environment variables
 */
const {
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  PREDICT_MONGO_URI,
  PREDICT_DB_USER,
  PREDICT_DB_PASS,
  MONGO_URI,
  DB_USER,
  DB_PASS,
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
if (!PREDICT_MONGO_URI && !MONGO_URI) {
  throw new Error(`PREDICT_MONGO_URI or MONGO_URI must be defined`);
}
if (!PREDICT_DB_USER && !DB_USER) {
  throw new Error(`PREDICT_DB_USER or DB_USER must be defined`);
}
if (!PREDICT_DB_PASS && !DB_PASS) {
  throw new Error(`PREDICT_DB_PASS or DB_PASS must be defined`);
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
      ]
    ),
    connectToDatabaseServer(
      mongoose,
      PREDICT_MONGO_URI || MONGO_URI,
      PREDICT_DB_USER || DB_USER,
      PREDICT_DB_PASS || DB_PASS,
      "predict"
    ),
  ]);

  attachExitTasks(process, exitTasks);

  // continuously generate suggestions
  const loop = async () => {
    const tx = Sentry.startTransaction({
      op: "generate-suggestions",
      name: "Generate User Suggestions",
    });

    Sentry.configureScope((scope) => scope.setSpan(tx));

    Sentry.addBreadcrumb({
      category: "suggestions",
      message: `Fetch next user`,
    });

    const options = {
      maxQueueLength: await countMediaItems(),
    };
    const user = await getNextUserToProcess(options);

    if (!user) {
      scheduleOnce(loop, 60 * 1000);

      console.info(`No users need suggestions`);
      tx.finish();
      return;
    }

    Sentry.addBreadcrumb({
      category: "suggestions",
      message: `Generate suggestions for ${user.id}`,
      data: {
        user,
        options,
      },
    });

    await createSuggestions(user.id);
    scheduleOnce(loop, 0);

    tx.finish();
    console.info(`Generated suggestions`);
  };

  loop();
})();
