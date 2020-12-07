import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";

import mongoose from "mongoose";

import { Ingest } from "./services/classes/ingest";
import { natsWrapper } from "./nats-wrapper";

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
  MONGO_URI,
  NATS_CLIENT_ID,
  NATS_URL,
  NATS_CLUSTER_ID,
  RAPIDAPI_KEY,
  TMDB_KEY,
} = process.env;

if (!MONGO_URI) {
  throw new Error(`MONGO_URI must be defined`);
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
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  console.log(`Connected to MongoDb`);

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
    // AudioLanguages to fetch data in
    audioLanguages: [
      "en", // English
    ],
    // Whether to include adult media
    includeAdultContent: false,
    // Earliest release date to include
    earliestReleaseDate: new Date("01-01-1970"),
    // Minimum TMDB popularity to include
    minTmdbPopularity: 5,
  });
})();
