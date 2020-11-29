import mongoose from "mongoose";
import { GENRE_A, GENRE_B } from "./genres";

export const MEDIA_ITEM_A = {
  id: mongoose.Types.ObjectId("mediaitemaaa").toHexString(),
  tmdbMovieId: 123,
  imdbId: "tt1234567",
  title: "My Movie",
  images: {
    poster: "https://example.com/",
    backdrop: "https://example.com/",
  },
  genres: [GENRE_A.id],
  rating: {
    average: 100,
    count: 101,
    popularity: 102,
  },
  audioLanguage: "en",
  releaseDate: new Date("2020-01-01"),
  runtime: 103,
  plot: "My movie plot...",
  streamLocations: {
    us: [
      {
        id: mongoose.Types.ObjectId("netflixnetfl").toHexString(),
        name: "Netflix",
        url: "https://example.com/",
      },
    ],
  },
};

export const MEDIA_ITEM_B = {
  id: mongoose.Types.ObjectId("mediaitembbb").toHexString(),
  tmdbMovieId: 321,
  imdbId: "tt7654321",
  title: "My Movie Sequel",
  images: {
    poster: "https://example.com/",
    backdrop: "https://example.com/",
  },
  genres: [GENRE_B.id],
  rating: {
    average: 50,
    count: 51,
    popularity: 52,
  },
  audioLanguage: "es",
  releaseDate: new Date("1980-01-01"),
  runtime: 53,
  plot: "My movie plot...",
  streamLocations: {
    uk: [
      {
        id: mongoose.Types.ObjectId("amazonamazon").toHexString(),
        name: "Amazon Prime",
        url: "https://example.com/",
      },
    ],
  },
};
