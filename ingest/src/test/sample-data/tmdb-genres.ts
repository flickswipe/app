import mongoose from "mongoose";

export const TMDB_GENRE_A = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 28,
  name: "Action",
};

export const TMDB_GENRE_B = {
  id: mongoose.Types.ObjectId("genrebbbbbbb").toHexString(),
  tmdbGenreId: 12,
  name: "Adventure",
};
