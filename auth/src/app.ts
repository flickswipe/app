import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";
import useragent from "express-useragent";

import { json } from "body-parser";
import cookieSession from "cookie-session";

import { tokensConsumeRouter } from "./routes/token-consume";
import { usersCreateRouter } from "./routes/user-create";
import { usersSendAddEmailLinkRouter } from "./routes/user-send-add-email-link";
import { usersSendMagicLinkRouter } from "./routes/user-send-magic-link";
import { usersSignOutRouter } from "./routes/user-sign-out";

/**
 * Configure express app
 */
const app = express();

// we're behind a load balancer
app.set("trust-proxy", true);

// set req.useragent
// @see https://www.npmjs.com/package/express-useragent
app.use(useragent.express());

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
app.use(tokensConsumeRouter);
app.use(usersCreateRouter);
app.use(usersSendAddEmailLinkRouter);
app.use(usersSendMagicLinkRouter);
app.use(usersSignOutRouter);

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
