import {
  NotFoundError,
  currentUser,
  requireAuth,
  iso6391,
  validateIso6391Param,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";

import { getGenres } from "../modules/track-ingest/track-ingest";

const router = express.Router();

/**
 * @api {get} /api/en/survey/genres
 * @apiName Genres
 * @apiGroup Genres
 *
 * @apiDescription
 * Returns an array of genres.
 *
 *
 * @apiErrorExample {json}  401 Not Authorized
 * {
 *   "errors": [
 *      { message: "Not authorized" },
 *   ]
 * }
 * @apiErrorExample {json}  404 Not Found
 * {
 *   "errors": [
 *      // Present when no genres exist
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * [
 *  {
 *    id: "abcdef1234567890abcd",
 *    name: "Comedy"
 *  },
 *  {
 *    id: "feddef1234567890abcd",
 *    name: "Science Fiction"
 *  }
 * ]
 */
router.get(
  "/api/:iso6391/survey/genres",
  [validateIso6391Param("iso6391")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { iso6391: language } = req.params;
    // get genres
    const genres = await getGenres(language as iso6391);

    // throw error if not found
    if (!genres.length) {
      throw new NotFoundError();
    }

    // output
    res.status(200).send(
      genres.map((genre) => ({
        id: genre.id,
        name: genre.name,
      }))
    );
  }
);

export { router as getGenresRouter };
