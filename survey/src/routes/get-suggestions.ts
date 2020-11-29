import {
  currentUser,
  requireAuth,
  validateRequest,
  validateIso6391Param,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { listAllSurveyResponses } from "../modules/handle-survey-response/handle-survey-response";
import { getMediaItem } from "../modules/track-ingest/track-ingest";
import { getSuggestions } from "../modules/track-predict/track-predict";

const router = express.Router();

/**
 * @api {get} /api/en/survey/queue
 * @apiName Queue
 * @apiGroup Queue
 *
 * @apiDescription
 * Returns an array of suggestions
 *
 *
 * @apiErrorExample {json}  401 Not Authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * [
 *   {
 *    id: "abcdef123456abcdef098765",
 *    title: "Example Title",
 *    images: { poster: "...", backdrop: "..." },
 *   },
 *   ...
 * ]
 */
router.get(
  "/api/:iso6391/survey/queue",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get suggestions and populate with media item info
    const suggestions = (await getSuggestions(currentUser.id)).map(
      getMediaItem
    );

    // get all survey responses
    const mediaItemsWithResponses = (
      await listAllSurveyResponses(currentUser.id)
    ).map(({ mediaItem }) => mediaItem);

    // filter out suggestions that aren't relevant
    const queue = (await Promise.all(suggestions))
      // resolved to a media item
      .filter((n) => n)
      // hasn't been responded to yet
      .filter((mediaItem) => !mediaItemsWithResponses.includes(mediaItem.id))
      .map((mediaItem) => ({
        id: mediaItem.id,
        title: mediaItem.title,
        images: mediaItem.images,
      }));

    // output
    res.status(200).send(queue);
  }
);

export { router as getSuggestionsRouter };
