import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";
import { relationshipBlockRouter } from "./routes/relationship-block";
import { relationshipUnblockRouter } from "./routes/relationship-unblock";
import { relationshipAcceptRouter } from "./routes/relationship-accept";
import { relationshipCancelRouter } from "./routes/relationship-cancel";
import { relationshipRequestRouter } from "./routes/relationship-request";
import { relationshipRejectRouter } from "./routes/relationship-reject";
import { getRelationshipsRouter } from "./routes/get-relationships";
import { getSettingsRouter } from "./routes/get-settings";
import { settingsUpdateRouter } from "./routes/settings-update";

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

app.use(getRelationshipsRouter);
app.use(getSettingsRouter);
app.use(relationshipAcceptRouter);
app.use(relationshipBlockRouter);
app.use(relationshipCancelRouter);
app.use(relationshipRequestRouter);
app.use(relationshipRejectRouter);
app.use(relationshipUnblockRouter);
app.use(settingsUpdateRouter);

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
