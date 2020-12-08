import mongoose from 'mongoose';

import { GENRE_A, GENRE_B } from './genres';

export const MEDIA_ITEM_A = {
  id: mongoose.Types.ObjectId("mediaitemaaa").toHexString(),
  tmdbMovieId: 1,
  imdbId: "tt1234567",
  title: "My Movie",
  images: {
    poster: "https://example.com",
    backdrop: "https://example.com",
  },
  genres: [GENRE_A.id],
  rating: {
    average: 100,
    count: 101,
    popularity: 102,
  },
  audioLanguage: "en",
  releaseDate: new Date("1990-01-01"),
  runtime: 103,
  plot: "My movie plot...",
  streamLocations: {
    us: [
      {
        id: mongoose.Types.ObjectId("netflixnetfl").toHexString(),
        name: "Netflix",
        url: "https://example.com",
      },
    ],
  },
};

export const MEDIA_ITEM_A_NEW = {
  id: mongoose.Types.ObjectId("mediaitemaaa").toHexString(),
  tmdbMovieId: 1,
  imdbId: "tt1234567",
  title: "New Name",
  images: {
    poster: "https://example.com",
    backdrop: "https://example.com",
  },
  genres: [GENRE_A.id],
  rating: {
    average: 100,
    count: 101,
    popularity: 102,
  },
  audioLanguage: "en",
  releaseDate: new Date("1990-01-01"),
  runtime: 103,
  plot: "My movie plot...",
  streamLocations: {
    us: [
      {
        id: mongoose.Types.ObjectId("netflixnetfl").toHexString(),
        name: "Netflix",
        url: "https://example.com",
      },
    ],
  },
};

export const MEDIA_ITEM_B = {
  id: mongoose.Types.ObjectId("mediaitembbb").toHexString(),
  tmdbMovieId: 2,
  imdbId: "tt7654321",
  title: "My Movie Two",
  images: {
    poster: "https://example.com",
    backdrop: "https://example.com",
  },
  genres: [GENRE_B.id],
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
        url: "https://example.com",
      },
    ],
  },
};
