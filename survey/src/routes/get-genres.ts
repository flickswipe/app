import {
  NotFoundError,
  currentUser,
  requireAuth,
  iso6391,
} from "@flickswipe/common";

import express, { Request, Response } from "express";

import { Genre } from "../modules/track-ingest/models/genre";

const router = express.Router();

/**
 * @api {post} /api/en/survey/media-item/:id
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
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { iso6391: language } = req.params;
    // get genres
    const genres = await Genre.find({
      language: language as iso6391,
    });

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
