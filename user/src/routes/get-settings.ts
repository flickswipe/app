import { currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";
import { defaultSettings } from "../default-settings";
import { listAllSettings, SettingsPayload } from "../modules/settings/settings";

const router = express.Router();

/**
 * @api {get} /api/en/user/settings
 * @apiName GetSettings
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

    res.status(200).send(settings);
  }
);

export { router as getSettingsRouter };
