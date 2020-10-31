import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";
import { blockRouter } from "./routes/block";
import { unblockRouter } from "./routes/unblock";
import { inviteAcceptRouter } from "./routes/invite-accept";
import { inviteCancelRouter } from "./routes/invite-cancel";
import { inviteCreateRouter } from "./routes/invite-create";

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

app.use(blockRouter);
app.use(unblockRouter);
app.use(inviteAcceptRouter);
app.use(inviteCancelRouter);
app.use(inviteCreateRouter);

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
