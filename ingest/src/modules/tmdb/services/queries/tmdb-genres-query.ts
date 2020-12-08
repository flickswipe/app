import axios from 'axios';

import { TmdbGenresApiResultRaw } from './tmdb-genres-parser';

/**
 * @see https://developers.themoviedb.org/3/genres/get-movie-list
 *
 * @returns {TmdbGenresApiResultRaw} raw api result
 */
export async function tmdbGenresQuery(): Promise<TmdbGenresApiResultRaw | void> {
  let response;

  try {
    response = await axios({
      method: "get",
      url: `https://api.themoviedb.org/3/genre/movie/list`,
      headers: {
        Authorization: `Bearer ${process.env.TMDB_KEY}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      params: {
        language: "en",
      },
    });
  } catch (error) {
    console.error(`tmdbGenresQuery error`, error);
  }

  // handle missing data
  if (!response?.data?.genres) {
    console.info(
      `tmdb genres query invalid response`,
      response && response.data
    );
    return null;
  }

  return response.data as TmdbGenresApiResultRaw;
}
