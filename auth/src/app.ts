import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";
import useragent from "express-useragent";

import { json } from "body-parser";
import cookieSession from "cookie-session";

import { consumeTokenRouter } from "./routes/consume-token";
import { createUserRouter } from "./routes/create-user";
import { sendAddEmailLinkRouter } from "./routes/send-add-email-link";
import { sendMagicLinkRouter } from "./routes/send-magic-link";
import { signOutRouter } from "./routes/sign-out";

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
app.use(consumeTokenRouter);
app.use(createUserRouter);
app.use(sendAddEmailLinkRouter);
app.use(sendMagicLinkRouter);
app.use(signOutRouter);

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
