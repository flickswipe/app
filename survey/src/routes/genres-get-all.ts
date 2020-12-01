import {
  NotFoundError,
  currentUser,
  requireAuth,
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
 *    tmdbGenreId: 19,
 *    name: "Action"
 *  },
 *  {
 *    tmdbGenreId: "69",
 *    name: "Drama"
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
    // get genres
    const genres = await getGenres();

    // throw error if not found
    if (!genres.length) {
      throw new NotFoundError();
    }

    // output
    res.status(200).send(
      genres.map((genre) => ({
        id: genre.id,
        tmdbGenreId: genre.tmdbGenreId,
        name: genre.name,
      }))
    );
  }
);

export { router as genresGetAllRouter };
