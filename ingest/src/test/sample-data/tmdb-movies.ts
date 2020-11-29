import { TmdbMovieAttrs } from "../../modules/tmdb/models/tmdb-movie";
import { TMDB_GENRE_A } from "./tmdb-genres";

export const TMDB_MOVIE_A: TmdbMovieAttrs = {
  tmdbMovieId: 1,
  imdbId: "tt1234567",
  title: "My Test Movie A",
  images: {
    poster: "/poster.jpg",
    backdrop: "/backdrop.jpg",
  },
  genres: [TMDB_GENRE_A.tmdbGenreId],
  rating: {
    average: 10,
    count: 1,
    popularity: 10,
  },
  language: "english",
  releaseDate: new Date("1990-01-01"),
  runtime: 180,
  plot: "My Test Movie plot description",
  timesUsed: 0,
  neverUse: false,
};

export const TMDB_MOVIE_B: TmdbMovieAttrs = {
  tmdbMovieId: 2,
  imdbId: "tt7654321",
  title: "My Test Movie B",
  images: {
    poster: "/poster.jpg",
    backdrop: "/backdrop.jpg",
  },
  genres: [TMDB_GENRE_A.tmdbGenreId],
  rating: {
    average: 10,
    count: 1,
    popularity: 10,
  },
  language: "english",
  releaseDate: new Date("20202-01-01"),
  runtime: 180,
  plot: "My Test Movie plot description",
  timesUsed: 1,
  neverUse: false,
};
