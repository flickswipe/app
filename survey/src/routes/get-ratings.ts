import { currentUser, requireAuth, InterestType } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { listAllSurveyResponses } from "../modules/handle-survey-response/handle-survey-response";

const router = express.Router();

/**
 * @api {get} /api/en/survey/ratings
 * @apiName Ratings
 * @apiGroup Ratings
 *
 * @apiDescription
 * Returns an array of media item ratings
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
 *  {
 *    mediaItemId: "abcdef1234567890abcd",
 *    rating: 5,
 *  }
 *  ...
 * ]
 */
router.get(
  "/api/:iso6391/survey/ratings",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get media items from survey responses
    const ratings = (await listAllSurveyResponses(currentUser.id))
      .filter(({ interestType }) => interestType === InterestType.Consumed)
      .filter(({ rating }) => rating)
      .map(({ mediaItem, rating }) => ({
        mediaItemId: mediaItem,
        rating: rating,
      }));

    // output
    res.status(200).send(ratings);
  }
);

export { router as getRatingsRouter };
