import {
  currentUser,
  requireAuth,
  InterestType,
  validateIso6391Param,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { getSurveyResponses } from "../modules/handle-survey-response/handle-survey-response";

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
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get media items from survey responses
    const ratings = (await getSurveyResponses(currentUser.id))
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

export { router as ratingsGetAllRouter };
