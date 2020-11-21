import { currentUser, requireAuth, InterestType } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { listAllSurveyResponses } from "../modules/handle-survey-response/handle-survey-response";

const router = express.Router();

/**
 * @api {get} /api/en/user/responses/interested
 * @apiName InterestedResponses
 * @apiGroup InterestedResponses
 *
 * @apiDescription
 * Returns an array of media item ids
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
 *  "abcdef1234567890abcd",
 *  ...
 * ]
 */
router.get(
  "/api/:iso6391/user/responses/interested",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get media items from survey responses
    const mediaItems = (await listAllSurveyResponses(currentUser.id))
      .filter(({ interestType }) => interestType === InterestType.Interested)
      .map(({ mediaItem }) => mediaItem);

    // output
    res.status(200).send(mediaItems);
  }
);

export { router as getSurveyResponsesRouter };
