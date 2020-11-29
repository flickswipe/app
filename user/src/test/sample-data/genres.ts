import mongoose from "mongoose";

export const GENRE_A = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 28,
  name: "Action",
};

export const GENRE_A_NEW = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 28,
  name: "New Name",
};

export const GENRE_B = {
  id: mongoose.Types.ObjectId("genrebbbbbbb").toHexString(),
  tmdbGenreId: 18,
  name: "Drama",
};

export const GENRE_C = {
  id: mongoose.Types.ObjectId("genrebbbbbbb").toHexString(),
  tmdbGenreId: 16,
  name: "Animated",
};
