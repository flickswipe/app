import axios from "axios";

import { TmdbGenresApiResultRaw } from "../result-parsers/genres";
import { TmdbMovieApiResultRaw } from "../result-parsers/movie";

/**
 * @see https://developers.themoviedb.org/3/movies/get-movie-details
 */
export async function tmdbMovieQuery(
  tmdbMovieId: number
): Promise<TmdbMovieApiResultRaw | void> {
  try {
    const response = await axios({
      method: "get",
      url: `https://api.themoviedb.org/3/movie/${tmdbMovieId}`,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_KEY}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    });

    if (!response?.data?.id) {
      return null;
    }

    const data = response.data as TmdbMovieApiResultRaw;
    return data;
  } catch (error) {
    console.error("tmdbMovieQuery error", error);
    throw error;
  }
}

/**
 * @see https://developers.themoviedb.org/3/genres/get-movie-list
 */
export async function tmdbGenresQuery(
  language: string
): Promise<TmdbGenresApiResultRaw | void> {
  try {
    const response = await axios({
      method: "get",
      url: `https://developers.themoviedb.org/3/genres/get-movie-list`,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_KEY}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      params: {
        language,
      },
    });

    if (!response?.data?.genres) {
      return null;
    }

    const data = response.data as TmdbGenresApiResultRaw;
    return data;
  } catch (error) {
    console.error("tmdbGenresQuery error", error);
    throw error;
  }
}
