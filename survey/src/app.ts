import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";

import { getGenresRouter } from "./routes/get-genres";
import { getMediaItemRouter } from "./routes/get-media-item";
import { getSuggestionsRouter } from "./routes/get-suggestions";
import { surveyRespondRouter } from "./routes/survey-respond";

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
app.use(getGenresRouter);
app.use(getMediaItemRouter);
app.use(getSuggestionsRouter);
app.use(surveyRespondRouter);

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
