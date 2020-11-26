import { iso6391 } from "@flickswipe/common";
import mongoose from "mongoose";

export const GENRE_A = {
  id: mongoose.Types.ObjectId().toHexString(),
  genreId: "35",
  name: "Comedy",
  language: "en" as iso6391,
};

export const GENRE_ES_A = {
  id: mongoose.Types.ObjectId().toHexString(),
  genreId: "35",
  name: "Comedia",
  language: "es" as iso6391,
};

export const GENRE_B = {
  id: mongoose.Types.ObjectId().toHexString(),
  genreId: "18",
  name: "Drama",
  language: "en" as iso6391,
};

export const GENRE_ES_B = {
  id: mongoose.Types.ObjectId().toHexString(),
  genreId: "18",
  name: "Drama",
  language: "es" as iso6391,
};
