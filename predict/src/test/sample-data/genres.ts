import mongoose from "mongoose";

export const GENRE_A = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 35,
  name: "Comedy",
};

export const GENRE_A_NEW = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 36,
  name: "New Name",
};

export const GENRE_B = {
  id: mongoose.Types.ObjectId("genrebbbbbbb").toHexString(),
  tmdbGenreId: 18,
  name: "Drama",
};
