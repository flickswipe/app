import { NotFoundError, currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";

import { MediaItem } from "../models/media-item";

const router = express.Router();

/**
 * @api {get} /api/en/catalog/media-item/:id
 * @apiName MediaItem
 * @apiGroup MediaItem
 *
 * @apiDescription
 * Returns a single media item.
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
 *      { message: "Not found" },
 *   ]
 * }
 *
 * @apiSuccessExample {json} 200 OK
 * {
 *  id: "abcdef123456abcdef098765",
 *  tmdbMovieId: 1,
 *  imdbId: "tt1234567",
 *  title: "Example Title",
 *  genres: [ { id: "...", name: "Comedy" } ],
 *  images: { poster: "...", backdrop: "..." },
 *  rating: { average: 100, count: 100, popularity: 100 },
 *  language: "english",
 *  releaseDate: "01-09-1990",
 *  runtime: 160,
 *  plot: "A description of the plot...",
 *  streamLocations: {
 *    uk: [
 *      {
 *        name: "Netflix",
 *        url: "https://netflix.com/watch/12345"
 *      }
 *    ]
 *  },
 * }
 */
router.get(
  "/api/en/catalog/media-item/:id",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // get media item
    const mediaItem = await MediaItem.findById({
      _id: id,
    }).populate("genres");

    // throw error if not found
    if (!mediaItem) {
      throw new NotFoundError();
    }

    // output
    res.status(200).send({
      id: mediaItem.id,
      tmdbMovieId: mediaItem.tmdbMovieId,
      imdbId: mediaItem.imdbId,
      title: mediaItem.title,
      genres: mediaItem.genres,
      images: mediaItem.images,
      rating: mediaItem.rating,
      language: mediaItem.language,
      releaseDate: mediaItem.releaseDate,
      runtime: mediaItem.runtime,
      plot: mediaItem.plot,
      streamLocations: mediaItem.streamLocations,
    });
  }
);

export { router as getMediaItemRouter };
