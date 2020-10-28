import { NotFoundError, currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";

import { Genre } from "../modules/track-ingest/models/genre";

const router = express.Router();

/**
 * @api {post} /api/en/catalog/media-item/:id
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
  "/api/en/catalog/genres",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    // get genres
    const genres = await Genre.find({
      language: "en-US",
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
