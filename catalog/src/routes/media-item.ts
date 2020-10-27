import {
  NotFoundError,
  BadRequestError,
  currentUser,
  requireAuth,
} from "@flickswipe/common";

import express, { Request, Response } from "express";

import { MediaItem } from "../models/media-item";

const router = express.Router();

router.get(
  "/api/en/catalog/media-item/",
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id, tmdbMovieId, imdbId } = req.body;

    if (!id && !tmdbMovieId && !imdbId) {
      throw new BadRequestError("Please supply at least one type of ID");
    }

    // get media item
    const mediaItem = await MediaItem.findOne({
      id,
      tmdbMovieId,
      imdbId,
    });

    // throw error if not found
    if (!mediaItem) {
      throw new NotFoundError();
    }

    // output
    res.status(200).send(mediaItem);
  }
);

export { router as mediaItemRouter };
