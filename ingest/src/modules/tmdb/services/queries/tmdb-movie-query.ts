import axios from 'axios';

import { TmdbMovieApiResultRaw } from './tmdb-movie-parser';

/**
 * @see https://developers.themoviedb.org/3/movies/get-movie-details
 *
 * @param tmdbMovieId id to fetch
 *
 * @returns {TmdbMovieApiResultRaw} raw api result
 */
export async function tmdbMovieQuery(
  tmdbMovieId: number
): Promise<TmdbMovieApiResultRaw | void> {
  // make request
  let response;
  try {
    response = await axios({
      method: "get",
      url: `https://api.themoviedb.org/3/movie/${tmdbMovieId}`,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_KEY}`,
        "Content-Type": "application/json;charset=utf-8",
      },
    });
  } catch (error) {
    console.error(`tmdbMovieQuery error`, error);
  }

  // handle missing data
  if (!response?.data?.id) {
    console.log(`tmdb movie query invalid response`, response && response.data);
    return null;
  }

  // return raw result
  return response.data as TmdbMovieApiResultRaw;
}
