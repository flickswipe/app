import { NotFoundError, currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
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
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get suggestions and populate with media item info
    const suggestions = (await getSuggestions(currentUser.id)).map(
      getMediaItem
    );

    // filter out suggestions that don't exist any more
    const queue = (await Promise.all(suggestions))
      .filter((n) => n)
      .map((mediaItem) => ({
        id: mediaItem.id,
        title: mediaItem.title,
        images: mediaItem.images,
      }));

    // throw error if not found
    if (!suggestions.length) {
      throw new NotFoundError();
    }

    // output
    res.status(200).send(queue);
  }
);

export { router as getSuggestionsRouter };
