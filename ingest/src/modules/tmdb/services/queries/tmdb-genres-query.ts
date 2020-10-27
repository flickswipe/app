import axios from "axios";
import { TmdbGenresApiResultRaw } from "./tmdb-genres-parser";

/**
 * @see https://developers.themoviedb.org/3/genres/get-movie-list
 *
 * @param language language to fetch
 *
 * @returns {TmdbGenresApiResultRaw} raw api result
 */
export async function tmdbGenresQuery(
  language: string
): Promise<TmdbGenresApiResultRaw | void> {
  let response;

  try {
    response = await axios({
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
  } catch (error) {
    console.error("tmdbGenresQuery error", error);
  }

  // handle missing data
  if (!response?.data?.genres) {
    return null;
  }

  return response.data as TmdbGenresApiResultRaw;
}
