import mongoose from "mongoose";

export const GENRE_A = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 19,
  name: "Action",
};
export const GENRE_A_NEW = {
  id: mongoose.Types.ObjectId("genreaaaaaaa").toHexString(),
  tmdbGenreId: 20,
  name: "New Name",
};

export const GENRE_B = {
  id: mongoose.Types.ObjectId("genrebbbbbbb").toHexString(),
  tmdbGenreId: 69,
  name: "Drama",
};
