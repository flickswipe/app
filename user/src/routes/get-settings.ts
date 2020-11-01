import { currentUser, iso6391, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { defaultSettings } from "../default-settings";
import { listAllSettings, SettingsPayload } from "../modules/settings/settings";
import {
  getGenres,
  getLanguages,
  getStreamLocations,
} from "../modules/track-ingest/track-ingest";

const router = express.Router();

/**
 * @api {get} /api/en/user/settings
 * @apiName Get Settings
 * @apiGroup GetSettings
 *
 * @apiDescription
 * Gets the user's current settings.
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
 *   "country": "",
 *   "genres": {...},
 *   "languages": {...},
 *   "rating": {...},
 *   "releaseDate": {...},
 *   "runtime": {...},
 *   "streamLocations": {...},
 * }
 */
router.get(
  "/api/en/user/settings",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;

    const settings = (await listAllSettings(
      currentUser.id,
      defaultSettings
    )) as SettingsPayload;

    // list all genres in settings, set unknown genres to false by default
    const allGenres = await getGenres("en");

    allGenres.forEach(({ id }) => {
      if (typeof settings.genres[id] === "undefined") {
        settings.genres[id] = false;
      }
    });

    // list all languages in settings, set unknown genres to false by default
    const allLanguages = await getLanguages();
    allLanguages.forEach(({ language }) => {
      if (typeof settings.languages[language as iso6391] === "undefined") {
        settings.languages[language as iso6391] = false;
      }
    });

    // list all stream locations in settings, set unknown stream locations to
    // true by default
    const allStreamLocations = await getStreamLocations(settings.country);
    allStreamLocations.forEach(({ id }) => {
      if (typeof settings.streamLocations[id] === "undefined") {
        settings.streamLocations[id] = true;
      }
    });

    res.status(200).send(settings);
  }
);

export { router as getSettingsRouter };
