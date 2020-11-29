/**
 * Types
 */

import { unifyISO6391 } from "../../../../services/unify-iso6391";

// raw data received by parser
export interface TmdbMovieApiResultRaw {
  adult: boolean;
  backdrop_path: string;
  belongs_to_collection: string | null;
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    name: string;
    id: string;
    logo_path: string | null;
    origin_country: string | null;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    iso_639_1: string;
    name: string;
  }[];
  status:
    | "Rumoured"
    | "Planned"
    | "In Production"
    | "Post Production"
    | "Released"
    | "Canceled";
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// output data
export interface TmdbMovieApiResult {
  tmdbMovieId: number;
  imdbId: string | null;
  title: string;
  images: {
    poster: string;
    backdrop: string;
  };
  genres: number[];
  rating: {
    average: number;
    count: number;
    popularity: number;
  };
  audioLanguage: string;
  releaseDate: Date;
  runtime: number;
  plot: string | null;
  adult: boolean;
  status:
    | "Rumoured"
    | "Planned"
    | "In Production"
    | "Post Production"
    | "Released"
    | "Canceled";
}

/**
 * @param raw raw api result
 *
 * @returns {TmdbMovieApiResult} parsed api result
 */
const parser = async (
  raw: TmdbMovieApiResultRaw
): Promise<TmdbMovieApiResult | null> => {
  // ignore missing data
  if (!raw?.id) {
    return null;
  }

  // parse
  return {
    tmdbMovieId: raw.id,
    title: raw.title,
    imdbId: raw.imdb_id || null,
    images: {
      poster: raw.poster_path,
      backdrop: raw.backdrop_path,
    },
    genres: raw.genres.map(({ id }) => id),
    rating: {
      average: raw.vote_average,
      count: raw.vote_count,
      popularity: raw.popularity,
    },
    audioLanguage: unifyISO6391(raw.original_language),
    releaseDate: new Date(raw.release_date),
    runtime: raw.runtime,
    plot: raw.overview,
    adult: raw.adult,
    status: raw.status,
  } as TmdbMovieApiResult;
};

/**
 * Exports
 */
export { parser as tmdbMovieParser };
