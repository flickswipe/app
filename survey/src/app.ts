import { errorHandler, NotFoundError } from "@flickswipe/common";

import express from "express";
import "express-async-errors";

import { json } from "body-parser";
import cookieSession from "cookie-session";

import { genresGetAllRouter } from "./routes/genres-get-all";
import { mediaItemsGetOneRouter } from "./routes/media-items-get-one";
import { suggestionsGetAllRouter } from "./routes/suggestions-get-all";
import { surveyResponsesCreateOneRouter } from "./routes/survey-responses-create-one";
import { surveyResponsesGetAllRouter } from "./routes/survey-responses-get-all";
import { ratingsGetAllRouter } from "./routes/ratings-get-all";

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
app.use(genresGetAllRouter);
app.use(mediaItemsGetOneRouter);
app.use(surveyResponsesGetAllRouter);
app.use(ratingsGetAllRouter);
app.use(suggestionsGetAllRouter);
app.use(surveyResponsesCreateOneRouter);

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
