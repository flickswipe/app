import {
  NotFoundError,
  currentUser,
  requireAuth,
  validateIso6391Param,
  validateObjectIdParam,
  validateRequest,
} from "@flickswipe/common";

import express, { Request, Response } from "express";

import { getGenres, getMediaItem } from "../modules/track-ingest/track-ingest";

const router = express.Router();

/**
 * @api {get} /api/en/survey/media-item/:id
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
 *  genres: [ { tmdbGenreId: "...", name: "Comedy" } ],
 *  images: { poster: "...", backdrop: "..." },
 *  rating: { average: 100, count: 100, popularity: 100 },
 *  audioLanguage: "en",
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
  "/api/:iso6391/survey/media-item/:id",
  [validateIso6391Param("iso6391"), validateObjectIdParam("id")],
  validateRequest,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    // get media item
    const mediaItem = await getMediaItem(id);

    // throw error if not found
    if (!mediaItem) {
      throw new NotFoundError();
    }

    // get genres
    const genres = await getGenres();

    // output
    res.status(200).send({
      id: mediaItem.id,
      tmdbMovieId: mediaItem.tmdbMovieId,
      imdbId: mediaItem.imdbId,
      title: mediaItem.title,
      genres: mediaItem.genres.map((id) =>
        genres.find((genre) => genre.id === id)
      ),
      images: mediaItem.images,
      rating: mediaItem.rating,
      audioLanguage: mediaItem.audioLanguage,
      releaseDate: mediaItem.releaseDate,
      runtime: mediaItem.runtime,
      plot: mediaItem.plot,
      streamLocations: mediaItem.streamLocations,
    });
  }
);

export { router as mediaItemsGetOneRouter };
