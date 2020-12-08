import express, { Request, Response } from 'express';

import {
    currentUser, InterestType, requireAuth, validateIso6391Param, validateRequest
} from '@flickswipe/common';

import { getSurveyResponses } from '../modules/handle-survey-response/handle-survey-response';

const router = express.Router();

/**
 * @api {get} /api/en/survey/responses/interested
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
  "/api/:iso6391/survey/responses/interested",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // get media items from survey responses
    const surveyResponses = await getSurveyResponses(currentUser.id);
    const mediaItems = surveyResponses
      .filter(({ interestType }) => interestType === InterestType.Interested)
      .map(({ mediaItem }) => mediaItem);

    // output
    res.status(200).send(mediaItems);
  }
);

export { router as surveyResponsesGetAllRouter };
