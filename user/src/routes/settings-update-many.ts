import express, { Request, Response } from 'express';

import {
    BadRequestError, currentUser, requireAuth, validateIso6391Param, validateRequest
} from '@flickswipe/common';

import {
    updateAudioLanguages, updateCountry, updateGenres, updateRating, updateReleaseDate,
    updateRuntime, updateStreamLocations
} from '../modules/settings/settings';

const router = express.Router();

/**
 * @api {post} /api/en/user/settings/update
 * @apiName Update Settings
 * @apiGroup UpdateSettings
 *
 * @apiDescription
 * Updates the user's current settings. Any number of keys can be provided, so
 * long as there is at least one key.
 *
 * @apiParamExample {json} Request-Example:
 * {
 *   "country": "us",
 *   "genres": {"genre-id": true, "genre-id": false },
 *   "audioLanguages": {"en": true, "es": false },
 *   "rating": {"min": 0, "max": 999 },
 *   "releaseDate": {"min": Date, "max": Date },
 *   "runtime": {"min": 0, "max": 999 },
 *   "streamLocations": {"location-id": true, "location-id": false },
 * }
 *
 * @apiErrorExample {json}  400 Bad request
 * {
 *   "errors": [
 *      // present when no settings data supplied
 *      { message: "You must update at least one setting" },
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
 * @apiSuccessExample {json} 200 OK
 * {
 *   "message": "Settings updated"
 * }
 */
router.post(
  "/api/:iso6391/user/settings/update",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    // update settings if they exist on body
    const promises = [];

    if (typeof req.body.country === "string") {
      promises.push(updateCountry(currentUser.id, req.body.country));
    }

    if (typeof req.body.genres === "object") {
      promises.push(updateGenres(currentUser.id, req.body.genres));
    }

    if (typeof req.body.audioLanguages === "object") {
      promises.push(
        updateAudioLanguages(currentUser.id, req.body.audioLanguages)
      );
    }

    if (typeof req.body.rating === "object") {
      promises.push(updateRating(currentUser.id, req.body.rating));
    }

    if (typeof req.body.releaseDate === "object") {
      promises.push(updateReleaseDate(currentUser.id, req.body.releaseDate));
    }

    if (typeof req.body.runtime === "object") {
      promises.push(updateRuntime(currentUser.id, req.body.runtime));
    }

    if (typeof req.body.streamLocations === "object") {
      promises.push(
        updateStreamLocations(currentUser.id, req.body.streamLocations)
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

export { router as settingsUpdateManyRouter };
