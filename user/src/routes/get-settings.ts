import {
  currentUser,
  iso6391,
  requireAuth,
  validateIso6391Param,
  validateRequest,
} from "@flickswipe/common";

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
  "/api/:iso6391/user/settings",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { currentUser } = req;
    const { iso6391: language } = req.params;

    const settings = (await listAllSettings(
      currentUser.id,
      defaultSettings
    )) as SettingsPayload;

    // list all genres in settings, set unknown genres to false by default
    const allGenres = await getGenres(language as iso6391);
    allGenres.forEach(({ tmdbGenreId }) => {
      if (typeof settings.genres[tmdbGenreId] === "undefined") {
        settings.genres[tmdbGenreId] = false;
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
