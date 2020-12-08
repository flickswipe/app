import mongoose from 'mongoose';

import {
    attachExitTasks, connectToDatabaseServer, connectToMessagingServer
} from '@flickswipe/common';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { natsWrapper } from './nats-wrapper';
import { Ingest } from './services/classes/ingest';

/**
 * Error & performance tracking
 */
Sentry.init({
  integrations: [
    new Tracing.Integrations.Mongo(),
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
  INGEST_MONGO_URI,
  INGEST_DB_USER,
  INGEST_DB_PASS,
  MONGO_URI,
  DB_USER,
  DB_PASS,
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  RAPIDAPI_KEY,
  TMDB_KEY,
} = process.env;

if (!INGEST_DB_USER && !DB_USER) {
  throw new Error(`INGEST_DB_USER or DB_USER must be defined`);
}
if (!INGEST_DB_PASS && !DB_PASS) {
  throw new Error(`INGEST_DB_PASS or DB_PASS must be defined`);
}
if (!INGEST_MONGO_URI && !MONGO_URI) {
  throw new Error(`INGEST_MONGO_URI or MONGO_URI must be defined`);
}
if (!NATS_CLIENT_ID) {
  throw new Error(`NATS_CLIENT_ID must be defined`);
}
if (!NATS_URL) {
  throw new Error(`NATS_URL must be defined`);
}
if (!NATS_CLUSTER_ID) {
  throw new Error(`NATS_CLUSTER_ID must be defined`);
}
if (!RAPIDAPI_KEY) {
  throw new Error(`RAPIDAPI_KEY must be defined`);
}
if (!TMDB_KEY) {
  throw new Error(`TMDB_KEY must be defined`);
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
      NATS_URL
    ),
    connectToDatabaseServer(
      mongoose,
      INGEST_MONGO_URI || MONGO_URI,
      INGEST_DB_USER || DB_USER,
      INGEST_DB_PASS || DB_PASS,
      "ingest"
    ),
  ]);

  attachExitTasks(process, exitTasks);

  // start ingest
  Ingest.start({
    // Streaming Service Provider Countries
    countries: [
      // "uk", // United Kingdom
      // "us", // USA
      // "ar", // Argentina
      // "at", // Austria
      // "be", // Belgium
      // "br", // Brazil
      // "ca", // Canada
      // "de", // Germany
      "es", // Spain
      // "fr", // France
      // "ie", // Ireland
      // "id", // Indonesia
      // "it", // Italy
      // "in", // India
      // "is", // Iceland
      // "kr", // Korea
      // "my", // Malaysia
      // "mx", // Mexio
      // "no", // Norway
      // "nl", // Netherlands
      // "pl", // Poland
      // "pt", // Portugal
      // "se", // Sweden
      // "sg", // Singapore
    ],
    // Whether to include adult media
    includeAdultContent: false,
    // Earliest release date to include
    earliestReleaseDate: new Date("01-01-1970"),
    // Minimum TMDB popularity to include
    minTmdbPopularity: 20,
  });
})();
