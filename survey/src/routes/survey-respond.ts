import {
  NotFoundError,
  currentUser,
  requireAuth,
  InterestType,
  BadRequestError,
  validateRequest,
  validateIso6391Param,
  validateObjectIdParam,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { body } from "express-validator";
import { setSurveyResponse } from "../modules/handle-survey-response/handle-survey-response";
import { getMediaItem } from "../modules/track-ingest/track-ingest";

const router = express.Router();

/**
 * @api {post} /api/en/survey/:id/respond
 * @apiName Respond
 * @apiGroup Respond
 *
 * @apiDescription
 * Handles survey response
 *
 * @apiParam {string} id of the media item being responded to
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // Present when invalid id given
 *      { field: "id", message: "must be valid id" },
 *      // Present when invalid interestType given
 *      { field: "interestType", message: "value must be one of..." },
 *      // Present when invalid rating given
 *      { field: "rating", message: "value must be a number between 1 and 100" },
 *      // Present when rating given but interestedType is not "consumed"
 *      { message: "Cannot rate media that has not been consumed" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  404 Not found
 * {
 *   "errors": [
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Survey response updated"
 * }
 */
router.post(
  "/api/:iso6391/survey/:id/respond",
  [
    validateIso6391Param("iso6391"),
    validateObjectIdParam("id"),
    body("interestType")
      .notEmpty()
      .isIn(Object.values(InterestType))
      .withMessage(
        `Value must be one of ${Object.values(InterestType).join(", ")}`
      ),
    body("rating")
      .custom(
        (value: any) =>
          typeof value === "undefined" ||
          (typeof value === "number" && value >= 0 && value <= 100)
      )
      .withMessage(`Value must be a number between 1 and 100`),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { id } = req.params;
    const { interestType, rating } = req.body;

    // throw error if rating supplied for unconsumed media
    if (
      typeof rating !== "undefined" &&
      interestType !== InterestType.Consumed
    ) {
      throw new BadRequestError(`Cannot rate media that has not been consumed`);
    }

    // throw error if media item not found
    const mediaItem = await getMediaItem(id);
    if (!mediaItem) {
      throw new NotFoundError();
    }

    // set response
    await setSurveyResponse(currentUser.id, mediaItem.id, interestType, rating);

    // output
    res.status(200).send({
      message: `Survey response updated for ${mediaItem.title}`,
    });
  }
);

export { router as surveyRespondRouter };
