import {
  BadRequestError,
  currentUser,
  requireAuth,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";
import { body } from "express-validator";

import {
  updateGenres,
  updateLanguages,
  updateRating,
  updateReleaseDate,
  updateRuntime,
  updateStreamLocations,
} from "../modules/settings/settings";

const router = express.Router();

/**
 * @api {post} /api/en/user/settings/update
 * @apiName GetSettings
 * @apiGroup GetSettings
 *
 * @apiDescription
 * Updates the user's current settings.
 *
 * @apiErrorExample {json}  401 Not authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // present when no settings supplied
 *      { message: "You must update at least one setting" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Settings updated"
 * }
 */
router.post(
  "/api/en/user/settings/update",
  [
    body("settings")
      .notEmpty()
      .withMessage(`You must supply settings to update`),
  ],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { settings } = req.body;

    // update settings if they exist on body
    const promises = [];

    if (typeof settings.genres === "object") {
      promises.push(updateGenres(currentUser.id, settings.genres));
    }

    if (typeof settings.languages === "object") {
      promises.push(updateLanguages(currentUser.id, settings.languages));
    }

    if (typeof settings.rating === "object") {
      promises.push(updateRating(currentUser.id, settings.rating));
    }

    if (typeof settings.releaseDate === "object") {
      promises.push(updateReleaseDate(currentUser.id, settings.releaseDate));
    }

    if (typeof settings.runtime === "object") {
      promises.push(updateRuntime(currentUser.id, settings.runtime));
    }

    if (typeof settings.streamLocations === "object") {
      promises.push(
        updateStreamLocations(currentUser.id, settings.streamLocations)
      );
    }

    if (promises.length === 0) {
      throw new BadRequestError(`You must update at least one setting`);
    }

    // wait for all updates to complete
    await Promise.all(promises);

    res.status(200).send({
      message: `Settings updated`,
    });
  }
);

export { router as settingsUpdateRouter };
