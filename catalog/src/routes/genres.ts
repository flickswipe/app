import { NotFoundError, currentUser, requireAuth } from "@flickswipe/common";

import express, { Request, Response } from "express";

import { Genre } from "../models/genre";

const router = express.Router();

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
    res.status(200).send(genres);
  }
);

export { router as genresRouter };
